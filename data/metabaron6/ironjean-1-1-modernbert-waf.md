# Metabaron6/IronJean-1.1-ModernBERT-WAF

## Resumen

IronJean WAF 1.1 (ModernBERT) es un modelo de clasificación de texto publicado por el usuario de Hugging Face Metabaron6 (Franck Andriano). Se trata de un ajuste fino de `answerdotai/ModernBERT-base`, un transformer encoder-only de 149.606.402 parámetros, especializado en una tarea muy concreta: clasificar peticiones HTTP como benignas (clase 0) o maliciosas (clase 1) para su uso dentro de un Web Application Firewall (WAF).

El problema que aborda es el de los WAF basados en expresiones regulares, que se eluden con payloads ofuscados o mutados. Al ser un encoder bidireccional con ventana nativa de 8192 tokens, el modelo puede ingerir cabeceras y cuerpos HTTP completos sin truncar, y el autor declara cobertura de inyección SQL, XSS, path traversal, command injection y host header injection. El repositorio incluye, además de los pesos en safetensors, una exportación ONNX cuantizada a INT8 orientada a backends Java y C++ de alto rendimiento.

Su interés práctico radica en el tamaño: con menos de 150 M de parámetros cabe en cualquier GPU de consumo e incluso en CPU, y el autor reporta latencias inferiores a 2 ms por petición en ONNX INT8. Las métricas declaradas (99,999 % de exactitud y 100 % de recall) proceden de un conjunto de evaluación propio, con ruido de etiquetas inyectado de forma deliberada, y no han sido verificadas por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only basado en ModernBERT-base (atención bidireccional alternando capas locales y globales, RoPE, GeGLU) |
| Parámetros totales | 149.606.402 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; el autor indica que el entrenamiento y la evaluación se realizaron con contexto de 1024 tokens |
| Tipos de cuantización | ONNX Runtime INT8 (proporcionada por el autor); no se documentan otras |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Pipeline | text-classification (2 clases: 0 = tráfico seguro, 1 = ataque) |
| Modelo base | answerdotai/ModernBERT-base |
| Tamaño del repositorio | 1,3 GB |
| Datos de entrenamiento | 311.732 peticiones HTTP únicas |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de tipo BERT modernizado que sustituye las embeddings posicionales absolutas por RoPE y alterna capas de atención local con capas de atención global, lo que permite procesar secuencias largas con un coste computacional menor que la atención densa completa. Sobre esa base se añadió una cabeza de clasificación binaria para la tarea seguro/ataque. No se documentan en la información disponible detalles sobre el número de capas, dimensión oculta o número de cabezas de atención del modelo concreto.

El conjunto de entrenamiento consta de 311.732 peticiones HTTP únicas: 150.000 seguras (50 %), 150.000 de ataque (50 %) y 11.732 de ruido con etiqueta asignada a una u otra clase (+3,75 %). El autor declara que la composición combina telemetría de producción anonimizada, patrones estandarizados de CAPEC, el dataset sintético `miomit/xss_generation` y payloads sintéticos propios con ruido de etiquetas inyectado deliberadamente (inversión de etiquetas) para forzar un aprendizaje estructural en lugar de una memorización por palabras clave. No se especifica el número total de tokens de entrenamiento, la composición exacta por tipo de ataque ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma habitual en un clasificador de este tipo). Se reportan tres épocas de entrenamiento con pérdidas de 0,0298, 0,0261 y 0,0258 respectivamente.

## Capacidades

- Clasificación binaria de payloads HTTP (cabeceras y cuerpos) en dos categorías: tráfico seguro y tráfico de ataque.
- Detección de vectores declarados por el autor: inyección SQL, XSS, path traversal, command injection y host header injection.
- Procesamiento de cuerpos de petición en formatos JSON, XML y datos codificados en URL.
- Análisis de payloads ofuscados o mutados, gracias al entrenamiento con XSS sintético profundamente ofuscado y a la atención bidireccional sobre secuencias largas.
- Ingesta de cabeceras y cuerpos completos sin truncado, apoyándose en la ventana de 8192 tokens del modelo base.
- Exportación ONNX INT8 para inferencia de baja latencia en runtimes Java y C++, con código de ejemplo comentado en inglés.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión ni audio.
- No está diseñado para análisis de sentimiento ni para tareas generales de lenguaje natural.

## Casos de uso

- Filtrado en línea en API Gateway: el modelo se coloca delante del backend y clasifica cada petición entrante (método, ruta, cabeceras y cuerpo) antes de reenviarla, con un umbral de decisión que permite bloquear, registrar o escalar a inspección manual.
- Protección de formularios y endpoints públicos: detección de XSS almacenado o reflejado en campos de texto libre, usando payloads ofuscados que los filtros regex habituales no capturan.
- Detección de inyección SQL en APIs REST: el modelo analiza el cuerpo JSON completo y los parámetros de consulta, incluyendo codificaciones anidadas o dobles URL-encode.
- Mitigación de path traversal y command injection en servicios de ficheros o ejecución de comandos: clasificación de rutas y parámetros antes de que lleguen al sistema de ficheros o al intérprete de comandos.
- Protección contra host header injection en infraestructuras con enrutado por dominio: análisis de la cabecera `Host` y de cabeceras de reenvío (`X-Forwarded-Host`, `X-Forwarded-For`) para detectar valores manipulados.
- Triaje y enriquecimiento de logs de seguridad: ejecución en modo batch sobre telemetría histórica para etiquetar peticiones y alimentar reglas de correlación en un SIEM, aprovechando el procesamiento a 13,5 ms por petición con batch 64 en GPU.
- Generación de reglas WAF: uso del clasificador como oráculo para validar y depurar conjuntos de reglas basadas en expresiones regulares antes de desplegarlas.
- Integración en backends Java o C++ de alto rendimiento mediante ONNX Runtime INT8, con latencia declarada inferior a 2 ms por petición, apta para pipelines síncronos.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre su propio conjunto de evaluación, tras un proceso de limpieza de ruido de etiquetas y con contexto de 1024 tokens:

| Métrica | Valor declarado |
|---|---|
| Exactitud global | 99,999 % |
| Precisión (clase ataque) | 99,999 % |
| Recall (clase ataque) | 100,00 % |
| Latencia (PyTorch, batch 64, GPU CUDA) | ~13,5 ms por petición |
| Latencia (ONNX INT8) | < 2 ms por petición |

Evolución por época reportada por el autor:

| Época | Loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1.0 | 0,0298 | 99,38 % | 99,52 % | 99,23 % | 99,37 % |
| 2.0 | 0,0261 | 99,45 % | 99,60 % | 99,29 % | 99,45 % |
| 3.0 | 0,0258 | 99,47 % | 99,58 % | 99,34 % | 99,46 % |

Matriz de confusión declarada sobre el conjunto con ruido inyectado (311.732 peticiones): 937 falsos negativos y 446 falsos positivos, lo que equivale a una tasa de error agregada de aproximadamente el 0,44 %. Tras invertir artificialmente las etiquetas de esas 1.383 peticiones, el autor reporta 2 falsas alarmas y 0 exploits no detectados. No se han publicado resultados sobre conjuntos de referencia externos e independientes (por ejemplo, corpus públicos de payloads HTTP) en la información disponible. No se dispone de comparaciones con otros clasificadores WAF en la información consultada.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~598 MB en FP32, ~299 MB en FP16/BF16 y ~150 MB en INT8.
- VRAM total en inferencia: del orden de 1 a 2 GB en FP16 con lotes moderados y contexto de 1024 tokens; el consumo de activaciones crece de forma aproximadamente lineal con el producto de lote por longitud de secuencia, por lo que con 8192 tokens y lotes grandes conviene reservar 4-8 GB.
- Cabe holgadamente en GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090. También es viable en CPU, especialmente con la exportación ONNX INT8.
- GPU de centro de datos recomendadas para alto throughput: T4, L4, A10, A100 y H100, escalando mediante lotes grandes.
- Opciones de despliegue documentadas por el autor: `transformers` (PyTorch) para Python y ONNX Runtime para Java y C++. No se confirma en la información disponible el soporte nativo en vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos generativos o no cubren esta arquitectura de clasificación en todos los casos.
- Latencia declarada: ~13,5 ms por petición en PyTorch con batch 64 en GPU CUDA y menos de 2 ms por petición en ONNX INT8. No se documenta throughput en peticiones por segundo.

## Comparativa con modelos similares

No se han encontrado en la búsqueda modelos comparables de terceros dedicados a la clasificación de payloads HTTP con métricas publicadas y verificables. La comparación se limita, por tanto, al modelo base y a la versión anterior del propio autor.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| IronJean 1.1 WAF (ModernBERT) | 149,6 M | 8192 tokens (entrenado a 1024) | Clasificación seguro/ataque HTTP | Apache 2.0 | Publicado, 0 descargas |
| IronJean 1.0 WAF (ModernBERT) | No disponible | No disponible | Clasificación seguro/ataque HTTP | Apache 2.0 (según etiqueta del repositorio) | Publicado |
| answerdotai/ModernBERT-base | 149,6 M | 8192 tokens | Modelo base de propósito general (encoder) | Apache 2.0 | Ampliamente utilizado |
| Clasificadores WAF de terceros | No disponible | No disponible | Detección de payloads maliciosos | No disponible | No identificados en la búsqueda |

## Limitaciones y advertencias

- Las métricas de 99,999 % de exactitud y 100 % de recall proceden de la evaluación del propio autor sobre su propio conjunto de datos, después de un proceso de limpieza de etiquetas. No hay validación independiente y el propio autor reconoce que en producción, frente a vulnerabilidades de día cero con ofuscación nueva, el recall caería previsiblemente al rango del 99,x %.
- Existe una inconsistencia entre las dos matrices de confusión reportadas: la del conjunto con ruido refleja 1.383 errores sobre 311.732 peticiones (~0,44 %), mientras que el recuento final declara 2 falsos positivos y 0 falsos negativos. La diferencia proviene de invertir artificialmente las etiquetas de las muestras fallidas, lo que no constituye una evaluación ciega.
- El conjunto de evaluación y el de entrenamiento comparten origen (telemetría propia, CAPEC, `miomit/xss_generation` y datos sintéticos propios), por lo que las cifras están sujetas a fuga de datos y sobreajuste al dominio.
- No hay evidencia de evaluación frente a corpus públicos e independientes de payloads HTTP, ni comparación con WAF comerciales o reglas OWASP CRS.
- El modelo está entrenado a 1024 tokens según la propia documentación, pese a anunciar la ventana de 8192 tokens del modelo base. No se documenta el comportamiento real con secuencias más largas que las usadas en entrenamiento.
- Idiomas: solo inglés declarado. Aunque los payloads HTTP son en gran medida independientes del idioma, los comentarios de error y los campos de texto libre en otros idiomas no están cubiertos.
- Uso restringido a tráfico HTTP (JSON, XML, URL-encoded). No sirve para análisis de sentimiento ni para tareas generales de PLN.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos; en un WAF, un falso positivo bloquea tráfico legítimo y un falso negativo deja pasar un ataque.
- Sesgos y limitaciones de dominio: el modelo aprende la distribución de tráfico de la organización que aportó la telemetría, lo que puede degradar su rendimiento en aplicaciones con esquemas de petición muy distintos.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; el dataset se publica por separado bajo su propia licencia de datos, que conviene revisar antes de reutilizarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni informes de terceros sobre su comportamiento en producción.
- Antes de desplegarlo en línea conviene calibrar el umbral de decisión con tráfico propio y monitorizar la tasa de falsos positivos, ya que una decisión automática de bloqueo sin revisión puede causar interrupciones de servicio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Metabaron6/IronJean-1.1-ModernBERT-WAF
- Versión anterior (1.0): https://huggingface.co/Metabaron6/IronJean-1.0-ModernBERT-WAF
- Perfil del autor (Metabaron6 / Franck Andriano): https://huggingface.co/Metabaron6
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de XSS sintético citado por el autor: https://huggingface.co/datasets/miomit/xss_generation
- Ficha en registro de terceros: https://free2aitools.com/model/metabaron6/ironjean-1.0-modernbert-waf
- CAPEC (Common Attack Pattern Enumeration and Classification), citado como fuente de patrones de ataque: https://capec.mitre.org/
