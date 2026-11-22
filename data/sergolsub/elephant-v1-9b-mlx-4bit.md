# sergolsub/elephant-v1-9B-MLX-4bit

## Resumen

Elephant v1 9B MLX 4-bit es una conversión cuantizada del modelo base `baselabs/elephant-1`, publicada por el usuario `sergolsub` para su ejecución en Apple Silicon mediante la librería MLX. No se trata de un modelo entrenado desde cero, sino de una derivación de pesos: el autor indica explícitamente que la conversión se hizo de forma puramente mecánica (descuantización desde su versión MLX 8-bit y recuantización afín a 4 bits, mismo tamaño de grupo), sin reentrenamiento ni cambios de arquitectura. El repositorio pesa 7,4 GB y contiene 9.409.813.744 parámetros en formato safetensors.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de despliegue local de un modelo de ~9B en hardware de consumo (Mac mini M4 Pro de 48 GB), con métricas medidas de latencia, memoria y calidad tras la cuantización. Por otro, el modelo incorpora un modo de "decisión" estructurado (cabeceras de decisión con tipos `noul`, `choice` y `score`) que se aparta del uso generativo convencional y lo orienta a clasificación y enrutamiento de tickets o incidencias. La información pública disponible es escasa: no hay model card del modelo base en los datos proporcionados, no se declaran idiomas y no se publican benchmarks estándar.

La licencia es MIT, heredada de los pesos originales, lo que permite uso comercial sin restricciones adicionales más allá de las del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5` en Hugging Face; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX, cuantización afín, mismo tamaño de grupo que la versión 8-bit); existe una conversión 8-bit previa del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (3 shards, layout MLX); incluye `config.json`, `tokenizer.json`, `chat_template.jinja`, `generation_config.json` y utilidades Python (`onejev_mlx.py`, `engine.py`) |
| Tamano en disco | 7,43 GB |
| Libreria | mlx (`mlx_lm`) |
| Modelo base | baselabs/elephant-1 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `baselabs/elephant-1` más allá del tag `qwen3_5` asociado en Hugging Face, que sugiere una familia tipo Qwen 3.5, y del recuento real de parámetros (9.409.813.744). No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización: los pesos 4-bit se obtuvieron a partir de una conversión MLX 8-bit previa del mismo autor, mediante descuantización y recuantización afín a 4 bits conservando el tamaño de grupo. El autor incluye artefactos específicos de un modo de decisión: `decision_config.json`, `joint_config.json`, `onejev_mlx.py` (loader e inferencia de las cabeceras de decisión), `kl_audit.json` (auditoría de divergencia KL de 64 KB) y `serve.patch`. Esto indica que el modelo incorpora cabeceras adicionales para tareas de decisión estructurada, más allá de la generación de texto libre.

## Capacidades

- Generación de texto y conversación mediante `mlx_lm` con la plantilla de chat incluida (`chat_template.jinja`).
- Modo de decisión estructurado con tres tipos de tarea: `noul` (pregunta binaria sí/no), `choice` (selección entre criterios con etiquetas) y `score` (puntuación sobre una escala de criterios ordenados).
- Enrutamiento y clasificación de tickets o incidencias con instrucciones por tarea y criterios explícitos.
- Inferencia local en Apple Silicon con cuantización 4-bit y carga rápida (4,98 s medidos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y un conjunto de criterios etiquetados (`billing`, `shipping`, etc.) y devuelve la etiqueta elegida mediante el tipo `choice`. Es adecuado porque la decisión se emite como objeto estructurado, no como texto libre, lo que simplifica la integración con sistemas de ticketing.
- Clasificación binaria de intenciones: con el tipo `noul` se pueden resolver preguntas del estilo "¿el cliente pide un reembolso?" sin necesidad de parsear la respuesta, lo que reduce errores en pipelines automatizados.
- Priorización de incidencias: con el tipo `score` y una escala de criterios (`cosmetic`, `annoying`, `blocks`) se asigna severidad a errores técnicos o tickets, útil para colas de soporte con SLA.
- Automatización de atención al cliente en local: al ejecutarse en un Mac mini M4 Pro con 8,24 GB de memoria residente máxima, permite desplegar un clasificador/enrutador sin enviar datos de clientes a la nube.
- Procesamiento por lotes en estaciones de trabajo Apple Silicon: con 0,89 decisiones cortas por segundo sostenidas y una latencia mediana de 1.654 ms, es viable para volúmenes moderados de clasificación en local.
- Prototipado de agentes de decisión: el formato de "una llamada por tipo de tarea" y la inclusión de `decision_config.json` facilitan construir enrutadores multi-etiqueta combinando varias llamadas `decide()` sobre el mismo texto.
- Evaluación de impacto de cuantización: el repositorio incluye métricas comparadas 4-bit frente a bf16, lo que lo convierte en un caso útil para estudiar la pérdida de calidad al cuantizar modelos de ~9B.

## Benchmarks y rendimiento

El autor publica métricas propias de evaluación de calidad tras la cuantización, medidas sobre su conjunto de evaluación (no son benchmarks estándar como MMLU o HumanEval):

| Metrica | 4-bit (este modelo) | bf16 (referencia) |
|---|---|---|
| Accuracy global | 86,7% | 92,2% |
| `noul` | 92,5% | 95,0% |
| `choice` | 84,0% | 92,0% |
| `score` | 80,0% | 88,0% |
| Perplejidad de calibración | 1,897 | 1,771 |

Métricas de ejecución en Mac mini M4 Pro 48 GB con MLX 4-bit:

| Metrica | Valor |
|---|---|
| Tamano en disco | 7,43 GB |
| Tiempo de carga | 4,98 s |
| Memoria residente máxima | 8,24 GB |
| Latencia mediana de decisión | 1.654 ms |
| Throughput sostenido (decisiones cortas) | 0,89/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia 4-bit: en torno a 8,2 GB de memoria residente máxima medida en el caso de referencia; el repositorio ocupa 7,43 GB en disco.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada (Apple Silicon, MLX).
- GPU NVIDIA: no disponible; el formato es específico de MLX y no se documenta conversión a CUDA.
- ¿Cabe en GPU de consumo? No hay datos para GPUs NVIDIA o AMD; en Apple Silicon, el consumo medido (8,24 GB) permitiría en principio ejecutarlo en equipos con 16 GB o más de memoria unificada, aunque no se aportan medidas en esos equipos.
- Opciones de despliegue: `mlx_lm` (runtime principal), loader propio `onejev_mlx.py`, y un `serve.patch` que sugiere un servidor compatible con la API `/v1/systemone` mencionada en la model card.
- Latencia y throughput: mediana de 1.654 ms por decisión y 0,89 decisiones cortas por segundo en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. Como referencia interna, el propio autor compara esta conversión 4-bit con su versión 8-bit y con los pesos bf16 originales (ver sección de benchmarks), pero no se aportan comparaciones con otros modelos de ~9B de la competencia.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/elephant-v1-9B-MLX-4bit | 9,41B | no disponible | MIT | safetensors MLX 4-bit | Este modelo |
| baselabs/elephant-1 | no disponible | no disponible | MIT (heredada) | no disponible | Modelo base upstream |
| Conversión MLX 8-bit del mismo autor | 9,41B | no disponible | MIT | safetensors MLX 8-bit | Referencia de calidad superior, mayor tamaño |
| Otros modelos ~9B | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización 4-bit degrada la calidad de forma medible: la accuracy global cae del 92,2% (bf16) al 86,7%, y la tarea `score` es la más afectada (80,0% frente a 88,0%). Para decisiones críticas conviene valorar la versión 8-bit o bf16.
- El modelo está empaquetado exclusivamente para MLX; no se documenta compatibilidad con llama.cpp, vLLM, TGI u Ollama.
- No se declaran idiomas soportados; no hay garantía de rendimiento en castellano ni en otros idiomas distintos del que se usó en el modelo base.
- No se publican datos sobre sesgos, alucinación o robustez frente a entradas adversarias.
- La model card lista los safetensors como "8-bit weights (MLX layout)" en la sección de ficheros, lo que contradice el nombre del repositorio y las métricas 4-bit; es una inconsistencia documental a verificar antes de desplegar.
- El pipeline no está declarado en Hugging Face y el modelo tiene un uso muy bajo (2 descargas, 0 likes), por lo que no hay validación comunitaria independiente.
- El autor advierte de que, en caso de conflicto, prevalece la licencia del repositorio upstream (`baselabs/elephant-1`); conviene revisarla antes de uso comercial.
- El modo de decisión requiere usar el loader y la configuración específicos (`onejev_mlx.py`, `decision_config.json`); no funciona como un modelo de chat genérico sin ese glue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/elephant-v1-9B-MLX-4bit
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Librería MLX: https://github.com/ml-explore/mlx
- Documentación de `mlx_lm`: https://github.com/ml-explore/mlx-examples/tree/main/llms
- Paper, blog, demo o repositorio adicional: no disponible en la información proporcionada.
