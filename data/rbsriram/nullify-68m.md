# rbsriram/nullify-68m

## Resumen

Nullify 68M es un modelo de clasificación de tokens (token classification) especializado en la detección y el enmascaramiento de información personal y sensible (PII) en texto. Lo desarrolla el usuario independiente `rbsriram` y deriva de `jhu-clsp/ettin-encoder-68m`, un encoder de la familia ModernBERT de 68 millones de parámetros. Su propósito es actuar como filtro local de privacidad antes de enviar texto a servicios LLM en la nube, o para redactar documentación empresarial sensible.

La relevancia del modelo está en su relación rendimiento/tamaño: con solo 68M de parámetros y ejecución en CPU (8,5 ms por mensaje en un Apple M4 con ONNX), obtiene 86,6 de F1 en Privacy-Bench, por encima de sistemas mucho mayores como PII-Tracer 0.6B (77,8) o el OpenAI Privacy Filter 1.5B (73,3). Devuelve posiciones exactas de cada span (offsets en puntos de código Unicode), lo que permite redactar sin reescribir el texto.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y ONNX, y está pensado para inglés exclusivamente. Incluye una API Python propia (`nullify.py`) con decodificación Viterbi restringida y dos perfiles de enmascaramiento: por defecto (oculta datos personales pero deja visibles fechas y lugares) y `all` (oculta todas las clases).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/ettin-encoder-68m`) con cabeza de clasificación de tokens BIOES de 53 etiquetas sobre 13 clases |
| Parametros totales | 68.434.485 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (entradas mayores se procesan en ventanas cortadas en límites de línea) |
| Tipos de cuantizacion | No disponible (el autor solo menciona float32 en las mediciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX |

## Arquitectura y entrenamiento

El modelo es un token classifier construido sobre el encoder Ettin 68M, de la familia ModernBERT, con una cabeza de clasificación que emite 53 etiquetas en esquema BIOES para 13 clases de entidades. La decodificación no es argmax independiente por token, sino una pasada de Viterbi restringida implementada en `nullify.py`, que impone transiciones válidas entre etiquetas y agrupa nombres y apellidos contiguos en un único span `PERSON` (con las partes expuestas en el campo `parts`).

El entrenamiento se realizó sobre una combinación de tres datasets públicos —Nemotron-PII (NVIDIA, CC BY 4.0), gretel-pii-masking-en-v1 (Gretel, Apache 2.0) y SPY (CC BY 4.0)— más texto generado por el propio autor con valores sintéticos de Faker y listas de palabras. Según la model card, no se usó ningún dato de benchmark para entrenar y el ajuste se ejecutó en un único MacBook Air. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo encoder de clasificación).

## Capacidades

- Detección de entidades PII con offsets exactos: devuelve `start`, `end` (semirrecta, en puntos de código Unicode), `label`, `score` y `text` para cada span.
- 13 clases de entidad: `PERSON`, `EMAIL`, `PHONE`, `ADDRESS`, `ID`, `USERNAME`, `URL`, `IP`, `SECRET`, `ORGANIZATION`, `DATE` y `LOCATION` (las dos últimas visibles por defecto).
- Enmascaramiento con dos perfiles: `default` (oculta datos personales, deja visibles fechas y lugares) y `all` (oculta todas las clases).
- Agrupación de nombres y apellidos contiguos en un solo span `PERSON`.
- Procesamiento de entradas largas en ventanas de 1.024 tokens cortadas en límites de línea.
- Inferencia en CPU sin PyTorch mediante backend ONNX (`backend="onnx"`), con salida idéntica al checkpoint PyTorch en 1.931 textos de prueba.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Filtro de privacidad previo a llamadas a LLM en la nube: se ejecuta localmente sobre el prompt del usuario, enmascara nombres, correos, teléfonos y credenciales antes de enviarlo a un proveedor externo, con 8,5 ms de latencia por mensaje en CPU.
- Redacción de documentación empresarial: procesa contratos, correos y actas para ocultar datos de clientes y empleados antes de archivarlos o compartirlos, dejando fechas y lugares visibles con el perfil `default`.
- Cumplimiento normativo y auditoría de datos: integrado en pipelines de ingesta para etiquetar y localizar PII en repositorios de documentos, generando informes de spans detectados con sus offsets.
- Anonimización de logs y trazas de aplicaciones: aunque el autor señala los logs como uno de los tipos de documento más débiles en RedactionBench, el modelo puede aplicarse como primera capa para ocultar correos, IPs y credenciales antes del almacenamiento.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y de 68M de parámetros, una organización puede reentrenar la cabeza sobre su propio dominio (por ejemplo, identificadores internos o jerga sectorial) con recursos mínimos.
- Protección en asistentes conversacionales locales: se puede insertar como paso previo en un chatbot que corre en el portátil del usuario para evitar que datos personales salgan del dispositivo.
- Preprocesado en pipelines de moderación o DLP: detección de secretos, URLs e IPs en texto libre antes de indexarlo en un sistema de búsqueda o de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card (batch size 1, float32, sin umbral, una pasada):

| Metrica | Nullify 68M | PII-Tracer 0.6B | OpenAI Privacy Filter 1.5B | GLiNER2 PII 307M |
|---|---:|---:|---:|---:|
| Privacy-Bench, F1 oficial | **86,6** | 77,8 | 73,3 | 84,6 |
| PII-TRACE, F1 exact-span, mismo post-procesado | 93,4 | **97,0** | 89,4 | 68,7 |
| PII-TRACE, F1 exact-span, salida por defecto | 92,7 | — | — | — |
| PII-TRACE, F1 exact-span, salida cruda | 66,4 | 96,8 | 89,4 | 60,9 |
| PII-TRACE, conversaciones limpias marcadas (de 50, menor es mejor) | 21 | **5** | 9 | 21 |
| RedactionBench, R-Score, ajuste por defecto | 0,539 | **0,601** | 0,536 | 0,445 |
| RedactionBench, R-Score, todas las clases ocultas | 0,446 | — | — | — |
| RedactionBench, 101 documentos reales, contenido oculto (por defecto / todas las clases) | 68,7% / 77,9% | — | 69,3% | — |

Referencias adicionales de Privacy-Bench publicadas con el mismo scorer: Tonic Identity Synthesis 92,5; Tonic Textual 92,1; Claude Opus 5 88,3; Claude Sonnet 5 87,0; GPT-6 astra 86,8; GPT-5.6 sol 86,1; GPT-5.6 terra 84,8; Presidio 82,8; GLiNER2 75,1 en la configuración de sus autores. En RedactionBench, la cabeza de la tabla pública la ocupan Claude Opus 5.5 (0,832) y GPT-6.1 Sol (0,750).

Rendimiento medido en un Apple M4, batch size 1, cuatro hilos de CPU: mediana de 8,5 ms por mensaje en CPU con ONNX y 8,0 ms en GPU con PyTorch (434 mensajes, mediana de 39 tokens). Una entrada de 1.024 tokens tarda 307 ms en CPU y 84 ms en GPU. Arranque hasta el primer resultado con ONNX: 0,40 s. Memoria: unos 0,7 GB en CPU hasta 1.024 tokens y 1,5 GB en GPU.

## Requisitos de hardware

- VRAM estimada: 1,5 GB en GPU para entradas de hasta 1.024 tokens (float32); en CPU, unos 0,7 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y en CPU pura.
- Opciones de despliegue: PyTorch + Transformers, ONNX Runtime (sin PyTorch), y la API propia `nullify.py` incluida en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de clasificación de este tamaño).
- Latencia y throughput: 8,5 ms por mensaje de ~39 tokens en CPU (ONNX) y 8,0 ms en GPU (PyTorch); 307 ms / 84 ms para 1.024 tokens en CPU / GPU respectivamente; 0,40 s de arranque con ONNX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Privacy-Bench F1 | PII-TRACE F1 (exact-span) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Nullify 68M | 68M | 1.024 | 86,6 | 93,4 (mismo post-procesado) | Apache 2.0 | Hugging Face |
| PII-Tracer 0.6B | 600M (aprox.) | No disponible | 77,8 | 97,0 (mismo post-procesado) | No disponible | No disponible en la información |
| OpenAI Privacy Filter 1.5B | 1.500M (aprox.) | No disponible | 73,3 | 89,4 | No disponible | No disponible en la información |
| GLiNER2 PII 307M | 307M | No disponible | 84,6 | 68,7 | No disponible | No disponible en la información |

Nullify 68M destaca en Privacy-Bench y en eficiencia (8,5 ms en CPU), mientras que PII-Tracer 0.6B obtiene mejor F1 exact-span en PII-TRACE (97,0 frente a 93,4 con el mismo post-procesado) y menos falsos positivos en conversaciones limpias (5 frente a 21 de 50). El OpenAI Privacy Filter 1.5B queda por debajo en Privacy-Bench pero es competitivo en PII-TRACE. No se dispone de datos de licencia ni de contexto para los tres modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha probado con texto en inglés; no hay evidencia de funcionamiento en otros idiomas.
- Clases más débiles en Privacy-Bench: organizaciones (51% de recall) y números de empleado y de cuenta (61-70%).
- Tipos de documento más débiles en RedactionBench: código fuente, logs y listados de ficheros.
- Entrenado para marcar todos los nombres de personas, incluidos personajes públicos, lo que puede generar falsos positivos en textos periodísticos o biográficos.
- La salida cruda (sin post-procesado) baja el F1 exact-span en PII-TRACE a 66,4; el rendimiento alto depende del decodificador Viterbi incluido en `nullify.py`.
- Marca 21 de 50 conversaciones limpias en PII-TRACE, frente a 5 de PII-Tracer; riesgo de sobre-redacción en producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la detección de spans.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; el repositorio incluye un fichero `NOTICE` con los detalles de atribución de los datasets.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación externa muy limitados.
- La model card está truncada en el listado de ficheros (solo se muestra `model.safeten`), por lo que no se puede verificar la lista completa de artefactos ni sus hashes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rbsriram/nullify-68m
- Anuncio del autor: https://www.nullvelocity.com/nullify
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset SPY: https://huggingface.co/datasets/mks-logic/SPY
