# Metabaron6/IronJean-v2-ModernBERT-WAF

## Resumen

IronJean WAF v2.2 es un modelo de clasificación de texto (encoder) derivado de `answerdotai/ModernBERT-base`, ajustado por el autor independiente Metabaron6 para actuar como motor de decisión de un Web Application Firewall (WAF). Su tarea es binaria: dada una petición HTTP representada como texto (método, URI, cabeceras y cuerpo), clasificarla como tráfico legítimo o como ataque. Frente a los clasificadores BERT clásicos limitados a 512 tokens, aprovecha la ventana de 8.192 tokens de ModernBERT para procesar cabeceras y cuerpos completos sin truncar.

El modelo introduce dos particularidades de ingeniería: un pooling propio denominado "Vectorized Landmark Pooling", que agrega los estados ocultos de los tokens `[SEP]` para preservar la estructura de los cuatro campos HTTP, y una capa de normalización previa a la tokenización (`HTTPNormalizer` v2.2) que deshace codificaciones recursivas (URL, Base64, `\u00XX`) y anonimiza IPs y dominios con los marcadores `<IP>` y `<DOMAIN>`. Todo el pipeline de pooling está empaquetado como código remoto (`trust_remote_code=True`) y también exportado a ONNX, de modo que puede ejecutarse sin runtime de Python.

Su relevancia práctica está en que se publica como checkpoint base para transferencia de aprendizaje, no como motor de reglas cerrado: el autor lo plantea para evaluación en modo sombra, calibración de umbrales y adaptación ligera al dominio. El modelo declara 149.015.810 parámetros, licencia Apache 2.0, entrenamiento exclusivamente en inglés y 203 descargas en el momento de la consulta, lo que lo sitúa como un artefacto de nicho que requiere validación propia antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con pooling propio "Vectorized Landmark Pooling" sobre estados ocultos de `[SEP]`; requiere `trust_remote_code=True` |
| Parámetros totales | 149.015.810 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | ONNX FP32 (grafo de pooling incluido en `model.onnx`); inferencia en CUDA con bfloat16 según el autor; no se publican pesos GGUF, int8 ni GPTQ en la información disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`) y código Python personalizado (`modeling_ironjean.py`) |
| Pipeline | `text-classification` |
| Modelo base | `answerdotai/ModernBERT-base` |
| Tamaño del repositorio | 5,1 GB |
| Etiquetas | modernbert, security, waf, cybersecurity, web-application-firewall, onnx, custom_code |
| Descargas / likes | 203 / 1 |

## Arquitectura y entrenamiento

La base es ModernBERT-base, un encoder transformer con atención de soporte largo que aporta la ventana de 8.192 tokens. Sobre esa base, el autor sustituye el pooling habitual sobre el token `[CLS]` por un pooling vectorizado sobre los estados ocultos de los tokens `[SEP]`: la secuencia se segmenta en cuatro "landmarks" (METHOD, URI, HEADERS, BODY) y la representación final se calcula como la media de los estados ocultos en las posiciones `[SEP]`, normalizada por el número de dichos tokens. La innovación es de arquitectura de cabeza y de preprocesado, no de preentrenamiento: no se documenta un preentrenamiento distinto ni cambios en los mecanismos de atención.

El pipeline de inferencia incluye un normalizador HTTP (`HTTPNormalizer` v2.2) que aplica desofuscación recursiva con profundidad máxima 3 (URL decoding y capas Base64 anidadas, Log4j, IPv4 decimal, sponge-case), decodificación de escapes `\u00XX`, anonimización de cookies y de autoridades (`Host`, `Referer`, `X-Forwarded-For`) hacia `<DOMAIN>` e `<IP>`, incluidos rangos LAN. Según la model card, el ajuste se realizó sobre 160.500 peticiones con paridad 50/50 entre tráfico seguro y ataques, procedentes de conjuntos open source "limpiados" y datos sintéticos, con paridad estricta de palabras clave y User-Agents para evitar atajos. Se cubren 22 familias de ataque (entre ellas CVEs de Next.js, Vite y PHP, prototype pollution, SSRF en cloud, JWT, SSTI, deserialización, NoSQL y GraphQL). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificación binaria de peticiones HTTP (seguro frente a ataque) a partir de método, URI, cabeceras y cuerpo completos, sin truncamiento hasta 8.192 tokens.
- Cobertura declarada de 22 familias de ataque: inyección SQL/NoSQL, XSS, SSTI, SSRF (incluido SSRF en entornos cloud), deserialización insegura, prototype pollution, ataques a JWT, GraphQL, path traversal, dotfile recon, open redirect, request smuggling, Log4j y CVEs de frameworks (Next.js, Vite, PHP).
- Soporte de verbos HTTP GET, POST, PUT, PATCH y DELETE y de `Content-Type` JSON (objetos y arrays), XML/SOAP, formularios, multipart, gRPC, así como documentos `text/markdown` y `text/html` sin falsos positivos declarados.
- Desofuscación previa a la tokenización con profundidad recursiva 3, orientada a payloads con codificación múltiple.
- Anonimización de IPs y dominios para reducir el memorizado de infraestructura concreta y facilitar la transferencia entre entornos.
- Exportación a ONNX con el grafo de pooling incluido, lo que permite inferencia sin Python.
- Integración nativa con `AutoModelForSequenceClassification` y `pipeline("text-classification")` mediante código remoto.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de agente: es un encoder discriminativo, no un modelo instructivo.
- No soporta visión, audio ni modo "thinking". No es multilingüe: solo inglés declarado.

## Casos de uso

- **Pre-filtro delante de reglas regex en un WAF existente**: el modelo clasifica la petición completa antes de aplicar las reglas, de modo que se reducen las consultas costosas a motores de firmas y se añade una capa semántica frente a payloads que evaden patrones literales.
- **Evaluación en modo sombra**: desplegar el clasificador en paralelo al WAF en producción, registrar sus puntuaciones y calibrar el umbral de decisión con telemetría real antes de activarlo en bloqueo, que es exactamente el uso que el autor propone para este checkpoint.
- **Protección de APIs modernas**: para endpoints GraphQL, gRPC, JSON anidado o SOAP, donde los conjuntos de reglas clásicos rinden peor; el modelo maneja esos formatos como parte de su entrenamiento declarado.
- **Triaje y priorización de alertas en un SOC**: usar la salida del clasificador para ordenar eventos por probabilidad de ataque y descartar falsos positivos antes de la revisión humana, aprovechando la tasa de falsos positivos declarada por el autor (0,001 %, no verificada de forma independiente).
- **Análisis forense de logs históricos en lote**: exportar el modelo a ONNX y ejecutarlo sobre CPU en un job offline que reprocese meses de logs con la normalización recursiva aplicada, útil para auditorías y respuesta a incidentes.
- **Adaptación al dominio con WiSE-FT o fine-tuning ligero**: partir del checkpoint y ajustar con tráfico etiquetado propio (banca, comercio electrónico, SaaS) cuando el vocabulario de negocio difiere del corpus sintético, al ser un modelo de 149 M de parámetros y, por tanto, barato de reentrenar.
- **Detección de ataques concretos de alta severidad**: deserialización, SSTI, SSRF y prototype pollution son familias poco cubiertas por firmas rígidas y sí contempladas en la lista de 22 familias del modelo.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y no se han verificado de forma independiente.

| Evaluación | Métrica | Resultado declarado |
|---|---|---|
| Corpus interno (160.500 payloads) | Accuracy global | 99,9994 % |
| Corpus interno | Recall | 100,00 % |
| Corpus interno | Tasa de falsos positivos | 0,001 % |
| `shengqin-waf` (zero-shot) | Score reportado | 99,38 % |
| `secureai-waf` (zero-shot) | Score reportado | 98,36 % |
| `waf-bench` (zero-shot) | Score reportado | 96,10 % |
| `nosql-waf` (zero-shot) | Score reportado | 94,39 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de propósito general, algo coherente con la naturaleza del modelo (clasificador de seguridad, no LLM). No se detallan en la información disponible las definiciones exactas de métrica, los tamaños de los conjuntos externos ni si hubo solapamiento entre entrenamiento y evaluación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: a partir de los 149 M de parámetros, en FP32 los pesos ocupan aproximadamente 0,6 GB; en FP16/BF16 unos 0,3 GB; en int8 unos 0,15 GB. Con activaciones y overhead de runtime, el consumo razonable se sitúa por debajo de 1-2 GB en FP16 para secuencias cortas y crece con la longitud de contexto hasta 8.192 tokens.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor reporta inferencia en CUDA con bfloat16 (A100, H100, L4, A10 y GPUs consumer Ampere o superiores son válidas). No se requieren GPUs de datacenter.
- **Cabe en GPU consumer**: sí, en cualquier RTX con 4 GB o más (RTX 3050, 3060, 4060, 4090) y también en iGPU con suficiente memoria compartida.
- **CPU**: viable mediante ONNX Runtime en FP32; para un encoder de 149 M es un escenario realista en nodos perimetrales, aunque el throughput será muy inferior al de GPU.
- **Opciones de despliegue**: ONNX Runtime (soporte explícito del autor, sin necesidad de Python), Transformers con `trust_remote_code=True` y `pipeline("text-classification")`, y servidores de inferencia compatibles con modelos de Transformers para clasificación (por ejemplo, Text Embeddings Inference o servicios propios basados en ONNX). No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI, que están orientados a modelos generativos.
- **Latencia y throughput**: el autor afirma detección "sub-milisegundo" en su entorno, sin especificar hardware ni longitud de secuencia. No se publican mediciones reproducibles de latencia, tokens por segundo ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| IronJean WAF v2.2 | 149 M | 8.192 | Clasificación WAF binaria | Apache 2.0 | Pooling propio, normalizador HTTP, exportación ONNX; 203 descargas |
| answerdotai/ModernBERT-base | 149 M | 8.192 | Encoder general (MLM, base para fine-tuning) | Apache 2.0 | Modelo base; no incluye cabeza de clasificación WAF ni normalización |
| Clasificador BERT-base clásico para WAF | ~110 M | 512 | Clasificación de payloads | Variable (habitualmente Apache 2.0 o MIT) | Trunca cabeceras y cuerpos largos; sin pooling por landmarks |
| `shengqin-waf` (referencia de benchmark) | No disponible | No disponible | Clasificación WAF | No disponible | Usado por el autor como benchmark zero-shot (99,38 %) |
| `secureai-waf` (referencia de benchmark) | No disponible | No disponible | Clasificación WAF | No disponible | Benchmark zero-shot reportado (98,36 %) |

La ventaja diferencial frente a un BERT-base de 512 tokens es la ventana de contexto y el tratamiento estructural de los campos HTTP; frente a ModernBERT-base, el valor añadido es el ajuste específico y el pipeline de normalización, no la arquitectura del encoder.

## Limitaciones y advertencias

- **Idioma**: el modelo declara únicamente inglés. Aunque los payloads de ataque suelen ser neutrales al idioma, el tráfico con contenido legítimo en otros idiomas (formularios, cuerpos de texto libre) puede aumentar los falsos positivos.
- **Métricas no verificadas**: el 99,9994 % de accuracy y el 0,001 % de FPR son cifras declaradas por el autor sobre un corpus interno construido con datos open source y sintéticos. Un rendimiento tan próximo al 100 % en datos propios es señal de posible solapamiento entre entrenamiento y evaluación; es imprescindible medir sobre telemetría real del entorno de destino.
- **Riesgo de evasión adversarial**: como todo clasificador neuronal, es susceptible a ataques adversariales y a familias no contempladas en el entrenamiento (0-day, lógica de negocio, ataques en varias peticiones). No sustituye a un WAF por firmas ni a la validación de esquema.
- **Alucinación no aplicable, pero sí falsos negativos silenciosos**: al no generar texto no alucina, pero una clasificación errónea es igual de dañina; conviene definir umbrales conservadores y monitorizar la deriva.
- **Truncamiento por encima de 8.192 tokens**: la afirmación de "sin truncamiento" es válida solo dentro de esa ventana; cuerpos mayores (subidas de ficheros, multipart grandes) requieren estrategia de segmentación propia.
- **Código remoto**: el uso de `trust_remote_code=True` implica ejecutar `modeling_ironjean.py` del repositorio; en entornos de confianza cero conviene auditar el código o usar la variante ONNX.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y el fichero NOTICE si existe, y sin garantías por parte del autor.
- **Madurez del proyecto**: 203 descargas y 1 like, un único autor, sin publicaciones revisadas por pares ni repositorio de código independiente documentado; no hay evidencia de mantenimiento a largo plazo.
- **Clasificación binaria**: no proporciona la familia de ataque ni explicación de la decisión, por lo que la trazabilidad requiere capas adicionales (SHAP, atención, reglas complementarias).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Metabaron6/IronJean-v2-ModernBERT-WAF
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- ONNX Runtime: https://onnxruntime.ai/
- Benchmarks externos citados por el autor (`shengqin-waf`, `secureai-waf`, `waf-bench`, `nosql-waf`): referenciados por nombre en la model card, sin URL directa en la información disponible
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada
