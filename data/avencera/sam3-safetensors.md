# avencera/sam3-safetensors

## Resumen

SAM 3 (Segment Anything Model 3) es el modelo de segmentación de imágenes de Meta, distribuido originalmente en `facebook/sam3`. El repositorio `avencera/sam3-safetensors` es una réplica de los pesos oficiales en formato safetensors, pensada para su uso con `sam3rs`, un runtime nativo escrito en Rust que ejecuta SAM 3 sobre GPUs NVIDIA (CUDA) y Apple Silicon (Metal). Los ficheros son copias byte a byte de los del repositorio original, con hashes SHA-256 verificables.

El modelo resuelve segmentación de imágenes guiada por texto (text-prompted segmentation): dado un prompt en lenguaje natural como "dog", genera máscaras de los objetos correspondientes. Con 859.922.360 parámetros y un peso de 3,4 GB en safetensors, se posiciona como un modelo de segmentación de tamaño medio-grande, orientado a pipelines de visión por computador en producción.

Su relevancia actual radica en dos factores: por un lado, la posibilidad de ejecutar SAM 3 fuera del ecosistema Python/PyTorch mediante `sam3rs`, lo que reduce dependencias y facilita el despliegue en entornos Rust; por otro, la disponibilidad de pesos en safetensors con verificación criptográfica, algo relevante para auditorías de cadena de suministro de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación de imágenes de la familia SAM; detalles arquitectónicos no especificados en la información proporcionada) |
| Parametros totales | 859.922.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre prompts de texto; idiomas no declarados) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | safetensors (model.safetensors, 3,4 GB), más vocab.json y merges.txt |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el volumen de datos de entrenamiento ni el proceso de alineación (RLHF/DPO) en la documentación proporcionada. El repositorio es una réplica de pesos, no una model card técnica del modelo original; para detalles arquitectónicos de SAM 3 debe consultarse el repositorio `facebook/sam3` y la documentación de Meta.

Lo que sí se conoce con certeza es el pipeline declarado (`mask-generation`), el número de parámetros (859.922.360) y que el modelo acepta prompts de texto para guiar la segmentación, como demuestra el ejemplo de uso con `sam3rs dogs.jpg --text dog`. El runtime `sam3rs` implementa la inferencia nativa en CUDA y Metal, lo que sugiere que el modelo está optimizado para ejecución en GPU y Apple Silicon respectivamente.

## Capacidades

- Segmentación de imágenes guiada por texto: genera máscaras a partir de prompts en lenguaje natural (por ejemplo, "dog").
- Generación de máscaras (mask-generation) como tarea principal del pipeline.
- Ejecución nativa en GPUs NVIDIA mediante CUDA y en Apple Silicon mediante Metal a través de `sam3rs`.
- Verificación de integridad de pesos mediante hashes SHA-256 publicados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles; el comportamiento con prompts en idiomas distintos del inglés no está documentado.

## Casos de uso

- Segmentación asistida por texto en herramientas de edición de imagen: el usuario escribe "dog" y el modelo devuelve la máscara del perro, lo que permite recortes y selecciones sin interacción manual píxel a píxel.
- Anonimización y censura automatizada: detectar y enmascarar objetos o regiones concretas (por ejemplo, matrículas o rostros, si el prompt lo permite) en pipelines de tratamiento de vídeo o imagen.
- Etiquetado de datasets de visión por computador: generar máscaras preliminares a partir de prompts de texto para acelerar el etiquetado semiautomático de grandes corpus de imágenes.
- Integración en aplicaciones nativas en Rust: al ejecutarse con `sam3rs`, puede embeberse en servicios o aplicaciones de escritorio sin arrastrar el stack Python/PyTorch, reduciendo el tamaño del despliegue y las dependencias.
- Procesamiento en Apple Silicon: despliegue en estaciones de trabajo Mac con Metal para tareas de segmentación local, sin GPU dedicada NVIDIA.
- Control de calidad en líneas de inspección visual: segmentar objetos concretos descritos por texto para medir áreas, contar instancias o verificar presencia/ausencia en imágenes industriales.
- Preprocesado para otros modelos: usar las máscaras generadas como entrada para modelos posteriores de clasificación, medición o reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint: 3,4 GB en safetensors (precisión original no especificada en la información proporcionada), lo que da una cota inferior de memoria para cargar los pesos.
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, cargar 859,9 M de parámetros en FP32 requiere aproximadamente 3,4 GB solo para pesos, a los que hay que sumar activaciones y buffers.
- GPU recomendadas: NVIDIA con soporte CUDA (modelo soportado por `sam3rs` vía CUDA) y Apple Silicon (vía Metal). No se especifican modelos concretos como A100, H100 o RTX 4090 en la documentación.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño de 3,4 GB sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: `sam3rs` (runtime nativo en Rust, CUDA y Metal). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son herramientas orientadas a segmentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| avencera/sam3-safetensors | 859.922.360 | no disponible | SAM License | safetensors | Réplica de facebook/sam3 para sam3rs |
| facebook/sam3 | no disponible en esta ficha | no disponible | SAM License | no disponible | Modelo original de Meta |
| Alternativas | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Licencia SAM License: no es una licencia permisiva tipo Apache-2.0 o MIT; impone condiciones al uso y la redistribución de los pesos. Debe revisarse el fichero LICENSE antes de cualquier uso comercial.
- El código de `sam3rs` se distribuye bajo Apache-2.0, pero esa licencia no cubre los pesos; son licencias independientes.
- Este repositorio es una réplica de pesos, no un modelo entrenado o modificado por `avencera`; los sesgos y limitaciones son los del `facebook/sam3` original.
- Riesgo de alucinación: en segmentación, el equivalente es generar máscaras para objetos que no existen o segmentar regiones incorrectas cuando el prompt es ambiguo; no hay datos publicados sobre la tasa de error.
- Idiomas soportados no declarados: el rendimiento con prompts en castellano u otros idiomas distintos del inglés no está documentado.
- Sin benchmarks publicados en este repositorio: no hay evidencia cuantitativa de calidad (IoU, mAP) para validar el rendimiento en producción.
- Dependencia de `sam3rs` para el flujo de uso documentado; no se describe integración con el ecosistema PyTorch/Transformers estándar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de validación por parte de la comunidad.
- Fecha de creación indicada como 2026-11-04: conviene verificar la coherencia temporal de los metadatos antes de confiar en ellos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avencera/sam3-safetensors
- Modelo base: https://huggingface.co/facebook/sam3
- Runtime sam3rs: https://github.com/avencera/sam3rs
