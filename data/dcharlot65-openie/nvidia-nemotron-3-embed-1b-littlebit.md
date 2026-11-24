# dcharlot65-openie/NVIDIA-Nemotron-3-Embed-1B-LittleBit

## Resumen

NVIDIA-Nemotron-3-Embed-1B-LittleBit es una adaptación del modelo de embeddings `nvidia/Nemotron-3-Embed-1B-BF16` realizada por el usuario dcharlot65-openie para el ecosistema JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch orientado a Kubernetes. El checkpoint no es un modelo en el sentido convencional: es una representación pre-factorizada de los pesos del modelo base, comprimida mediante una combinación de LittleBit-2 y Sakana SVF, con el objetivo de reducir drásticamente el espacio en disco y permitir inferencia en un runtime propio.

La compresión declarada es extrema: el autor reporta un tamaño de 7,94 MB para el archivo `.jsyn` frente a los 2176,13 MB del equivalente en FP16, lo que supone una reducción de 274,06x y un promedio de 0,0243 bits por peso (BPW). El modelo conserva el identificador interno `nemotron-3-embed-1b` y está pensado para ser cargado mediante el cliente `jouledb` sobre un servidor local, no a través de las librerías habituales de Hugging Face.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, publicado bajo la licencia OpenMDW-1.1 y dependiente de una herramienta específica (JouleDB v0.2.4 o superior). No hay información pública sobre evaluación de calidad, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de embeddings; factorización LittleBit-2 + Sakana SVF sobre Nemotron-3-Embed-1B) |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,0243 BPW promedio); 113 tensores en bitplanos 2D y 33 vectores 1D (LayerNorm, bias, depthwise) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (Open Model Weights License) |
| Formato de pesos | `.jsyn` (zstd + CRC32), cargado mediante JouleDB; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Nemotron-3-Embed-1B-BF16`, un modelo de embeddings de aproximadamente 1.140 millones de parámetros. La información disponible no detalla la arquitectura interna del modelo original (tipo de transformer, número de capas, dimensión de embeddings ni longitud de contexto), por lo que esos datos deben consultarse en la model card de NVIDIA.

Sobre esa base, el autor aplica una factorización denominada LittleBit-2 combinada con Sakana SVF, que descompone los pesos en 113 tensores representados como bitplanos 2D y 33 vectores 1D para LayerNorm, bias y operaciones depthwise. El resultado se serializa en formato `.jsyn` con compresión zstd y verificación CRC32. No se documenta en la información proporcionada ningún proceso de entrenamiento adicional, destilación, RLHF ni ajuste fino: se describe como un checkpoint de "living weights" adaptado, no reentrenado.

La innovación técnica principal es el propio formato de compresión y el runtime asociado (JouleDB), que prescinde de PyTorch y está diseñado para despliegue nativo en Kubernetes (JouleKube). No hay datos sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de embeddings de texto, heredada del modelo base Nemotron-3-Embed-1B; la información disponible no detalla tareas concretas (retrieval, clasificación, clustering, similitud semántica).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Carga e inferencia mediante el runtime JouleDB (`jouledb serve` + `db.hf_pull`), no mediante transformers, vLLM ni llama.cpp.

## Casos de uso

- Búsqueda semántica en bases de datos vectoriales: el modelo puede generar embeddings para indexar documentos y consultas, integrándose en el ecosistema JouleDB como motor de recuperación dentro de un clúster Kubernetes.
- Despliegue en entornos con almacenamiento muy restringido: con un artefacto de 7,94 MB, es viable distribuirlo en nodos edge o contenedores donde un checkpoint FP16 de más de 2 GB sería inviable.
- Recuperación aumentada (RAG) en pipelines nativos de Kubernetes: al ejecutarse sobre JouleKube, puede formar parte de un servicio de embeddings desplegado junto al resto de la infraestructura de agentes.
- Deduplicación y clustering de documentos: uso típico de un modelo de embeddings de 1B para agrupar textos similares en corpus grandes.
- Clasificación de texto por similitud: comparar embeddings de documentos con prototipos de categoría para etiquetado sin entrenamiento adicional.
- Evaluación experimental de compresión sub-1-bit: el checkpoint sirve como caso de estudio para investigar la viabilidad de pesos por debajo de 1 bit en tareas de representación semántica, comparando la calidad frente al modelo base BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MTEB, recuperación, similitud) ni comparaciones con el modelo base BF16, por lo que no es posible evaluar la pérdida de rendimiento derivada de la compresión a 0,0243 BPW.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el formato `.jsyn` requiere el runtime JouleDB, que no documenta en la información proporcionada sus requisitos de memoria en tiempo de ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del artefacto (7,94 MB) sugiere que la carga es ligera, pero la descompresión a tensores operativos puede requerir memoria adicional no especificada.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3-Embed-1B-LittleBit | 1.140.918.272 | no disponible | `.jsyn` (JouleDB) | openmdw-1.1 | Hugging Face, 0 descargas |
| nvidia/Nemotron-3-Embed-1B-BF16 | ~1B | no disponible | BF16 (safetensors presumiblemente) | openmdw-1.1 | Hugging Face (modelo base) |
| Otros modelos de embeddings de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el propio modelo base BF16, del que este checkpoint deriva.

## Limitaciones y advertencias

- La compresión a 0,0243 BPW es extremadamente agresiva; no hay ninguna evaluación publicada que demuestre que los embeddings resultantes conservan la calidad del modelo base. Es un riesgo crítico para cualquier uso en producción.
- El modelo depende de un runtime propietario y poco extendido (JouleDB), lo que limita la portabilidad y la integración con herramientas estándar del ecosistema Hugging Face.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso, validación comunitaria ni mantenimiento.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación (aunque, al ser un modelo de embeddings, el riesgo de alucinación se manifiesta como representaciones semánticas inexactas).
- La licencia OpenMDW-1.1 permite uso comercial según su denominación "permissive", pero debe verificarse el texto completo en openmdw.ai antes de utilizarlo en producción, especialmente por las obligaciones de atribución al modelo base de NVIDIA.
- El repositorio tiene un tamaño de 0,0 GB reportado, lo que puede indicar que los archivos de pesos no están efectivamente alojados o que la métrica de Hugging Face no los contabiliza; conviene verificar la integridad de la descarga.
- No hay información sobre la longitud de contexto, lo que impide planificar su uso en tareas de retrieval sobre documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Nemotron-3-Embed-1B-LittleBit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia OpenMDW-1.1: https://openmdw.ai/
