# cipherxsnier/ocean-blue-blue2

## Resumen

Ocean Blue: Blue-2 es un ajuste fino por destilación del modelo Qwen2.5-3B-Instruct, publicado por el usuario cipherxsnier bajo el paraguas del proyecto Ocean Blue. El modelo se ha entrenado mediante LoRA (posteriormente fusionado) sobre un conjunto de datos generado por rechazo-muestreo (*rejection sampling*) a partir de un profesor abierto, Qwen2.5-14B-Instruct, evaluado contra acertijos con corrección automática por código. Solo se conservaron las respuestas que el verificador validó, lo que dio lugar a 1.464 soluciones verificadas y 3 épocas de entrenamiento. No se emplearon salidas de modelos cerrados como Claude.

El objetivo declarado es especializar un modelo pequeño de 3.085.938.688 parámetros en tareas de razonamiento estructurado: comprobación de libros contables (*ledger checking*), afirmaciones basadas en registros (*log-based claims*), distinción entre notas obsoletas y actualizadas, ordenación de líneas y lectura de código. Según la model card, el modelo parte de un 28% de acierto global y alcanza un 62,3% tras el ajuste en un test de 300 tareas corregido por código, superando al propio profesor de 14B (57%).

Es relevante como ejemplo de destilación verificable en modelos pequeños: demuestra que un ajuste fino selectivo sobre datos filtrados por un *grader* puede mejorar capacidades específicas de razonamiento sin recurrir a modelos cerrados. No obstante, el autor advierte explícitamente que no es un modelo de chat general, y su licencia restringe el uso a investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen RESEARCH LICENSE AGREEMENT), solo uso no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con atención por grupos de consultas (*grouped-query attention*) y las innovaciones propias de la familia Qwen2.5, aunque la model card no detalla la configuración interna (número de capas, cabezas, dimensión oculta ni ventana de contexto). El ajuste se realizó con LoRA sobre el modelo base y los adaptadores se fusionaron en los pesos finales, de modo que el repositorio contiene un modelo denso estándar cargable con `transformers`.

El entrenamiento se enmarca en el llamado *Ocean Blue loop*: un profesor abierto (Qwen2.5-14B-Instruct) genera respuestas a acertijos con corrección automática por código; un verificador descarta las incorrectas y solo las soluciones validadas (1.464) se usan como datos de entrenamiento durante 3 épocas. No se menciona uso de RLHF, DPO ni datos de modelos cerrados. La innovación principal es el filtrado por *grader* ejecutable, que garantiza la corrección de las etiquetas de destilación en dominios donde la respuesta es verificable programáticamente.

## Capacidades

- Razonamiento estructurado especializado en comprobación de libros contables (*ledger checking*).
- Verificación de afirmaciones basadas en registros (*log-based claims*).
- Distinción entre notas obsoletas y actualizadas (*stale vs fresh notes*).
- Ordenación de líneas y secuencias.
- Lectura y comprensión de código para tareas de razonamiento.
- Generación de texto conversacional heredada del modelo base Qwen2.5-3B-Instruct, aunque el autor advierte que no es un modelo de chat general.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Auditoría automática de libros contables: el modelo puede revisar asientos y detectar inconsistencias en registros estructurados, aprovechando su especialización en *ledger checking* (95% en el test interno frente al 37% inicial).
- Verificación de afirmaciones en logs de sistemas: útil para pipelines que extraen afirmaciones de registros y necesitan comprobar si están respaldadas por los datos, con un 100% reportado en la familia *log-based claims*.
- Gestión de documentación con versiones: puede distinguir notas obsoletas de actualizadas en bases de conocimiento, un caso frecuente en wikis internas y sistemas de ticketing.
- Ordenación y reconstrucción de secuencias: aplicable a la reconstrucción de trazas, timelines o pasos de un proceso a partir de fragmentos desordenados.
- Asistencia en revisión de código: lectura de fragmentos de código para responder preguntas estructuradas sobre su comportamiento, con un 22% en la familia *code reading* (mejora desde el 3%).
- Evaluación e investigación en destilación: sirve como caso de estudio reproducible para investigar destilación con verificación programática en modelos de 3B.
- Prototipado de pipelines de razonamiento verificable: integrable en entornos de investigación donde las respuestas se validan automáticamente antes de aceptarse.

## Benchmarks y rendimiento

Resultados reportados por el autor en un test retenido de 300 tareas corregido por código:

| Familia | Blue-2 antes | Blue-2 después | Profesor (14B) |
|---|---|---|---|
| Comprobación de libros contables | 37% | 95% | 82% |
| Afirmaciones basadas en logs | 60% | 100% | 92% |
| Notas obsoletas vs actualizadas | 28% | 70% | 62% |
| Ordenación de líneas | 13% | 25% | 33% |
| Lectura de código | 3% | 22% | 17% |
| **Global** | **28%** | **62,3%** | **57%** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 3,09B parámetros en safetensors (fp16/bf16) se requieren aproximadamente 6,2 GB solo para los pesos, más memoria para el contexto y el runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con al menos 8 GB de VRAM en precisión reducida; en fp16 se recomienda 12 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque el autor no lo documenta.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ocean Blue: Blue-2 | 3,09B | no disponible | 62,3% global en test propio de 300 tareas | qwen-research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 tokens (según documentación de Qwen) | 28% global en el mismo test (antes del ajuste) | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-14B-Instruct (profesor) | 14B | 32.768 tokens (según documentación de Qwen) | 57% global en el mismo test | Apache 2.0 (según Qwen) | Hugging Face |

Nota: los datos de contexto y licencia de los modelos Qwen provienen de la documentación pública de Qwen y no de la model card de Blue-2; el rendimiento comparado corresponde exclusivamente al test interno del autor.

## Limitaciones y advertencias

- Modelo especialista, no generalista: el autor advierte explícitamente que no es un modelo de chat general; su uso fuera de las familias de razonamiento entrenadas puede degradar el rendimiento del modelo base.
- Licencia restrictiva: derivado de Qwen2.5-3B-Instruct bajo Qwen RESEARCH LICENSE AGREEMENT, solo para uso no comercial (investigación o evaluación). Requiere revisar `LICENSE` y `NOTICE` antes de cualquier despliegue.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo pequeño ajustado con datos sintéticos, puede generar respuestas plausibles pero incorrectas fuera de distribución.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: la model card no especifica longitud de contexto ni idiomas soportados; el entrenamiento se realizó sobre acertijos en un dominio concreto, lo que puede limitar la generalización lingüística.
- Rendimiento desigual: la mejora es muy fuerte en *ledger checking* y *log-based claims*, pero modesta en ordenación de líneas (25%) y lectura de código (22%), por debajo del profesor en ordenación (33%).
- Reproducibilidad: el test de evaluación es propio del autor (300 tareas), no un benchmark estándar, lo que dificulta la comparación independiente.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Profesor utilizado: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia Qwen Research: incluida en el repositorio del modelo (`LICENSE`)
