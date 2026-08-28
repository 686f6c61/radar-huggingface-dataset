# Oscilla/Qwen3-4B-mlx-8Bit

## Resumen

Oscilla/Qwen3-4B-mlx-8Bit es una conversión al formato MLX (Machine Learning eXchange) con cuantización de 8 bits del modelo Qwen3-4B, desarrollado por Alibaba. MLX es el framework de aprendizaje automático de Apple optimizado para su silicio (M1, M2, M3, etc.), lo que permite ejecutar este modelo de forma eficiente en hardware de Apple sin necesidad de GPU dedicadas. La conversión fue realizada con la librería mlx-lm en su versión 0.31.2 y mantiene la arquitectura original del modelo base.

El modelo base Qwen3-4B es un LLM denso de 4.000 millones de parámetros con una ventana de contexto de 131.072 tokens, entrenado con 36 billones de tokens. Destaca por su modo de razonamiento explícito (thinking mode) que le permite abordar problemas complejos de lógica, matemáticas y código, además de un modo sin pensamiento para respuestas rápidas. Esta versión cuantizada a 8 bits reduce el uso de memoria a aproximadamente 4-6 GB, haciéndolo viable en equipos Mac con memoria unificada de 8 GB o superior.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue local para desarrolladores que trabajan en ecosistema Apple y necesitan un modelo con capacidades de razonamiento avanzado sin depender de infraestructura en la nube. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) |
| Parametros totales | 4.000 millones (modelo base); 1.131.460.096 (archivo safetensors cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8 bits (formato MLX) |
| Idiomas soportados | No disponibles en la ficha; el modelo base Qwen3 soporta multiples idiomas (incluye ingles, chino, espanol, frances, aleman, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso con atencion completa, sin mezcla de expertos. Fue entrenado con 36 billones de tokens en un corpus multilingue que incluye datos de codigo, matematicas y contenido general. El entrenamiento combina fases de preentrenamiento, ajuste fino supervisado (SFT) y optimizacion con aprendizaje por refuerzo (RLHF), lo que le confiere capacidades de instruccion y razonamiento. Una caracteristica distintiva es el modo de pensamiento (thinking mode), que permite al modelo generar una cadena de razonamiento interna antes de dar la respuesta final, activable o desactivable segun la tarea.

La conversion a MLX en 8 bits no modifica la arquitectura subyacente, sino que cuantiza los pesos del modelo a enteros de 8 bits para reducir el uso de memoria y acelerar la inferencia en hardware Apple. La cuantizacion se realizo con mlx-lm 0.31.2, que emplea tecnicas de cuantizacion por bloques para minimizar la perdida de precision. No se ha realizado ningun reentrenamiento ni ajuste adicional sobre el modelo cuantizado.

## Capacidades

- Generacion de texto en lenguaje natural con alta coherencia y fluidez.
- Razonamiento logico y matematico, especialmente en modo thinking, para resolver problemas paso a paso.
- Generacion y comprension de codigo en multiples lenguajes de programacion (Python, Java, C++, JavaScript, etc.).
- Soporte de tool calling / function calling, lo que permite al modelo interactuar con APIs y herramientas externas.
- Capacidades de agente: puede ejecutar tareas multi-paso y razonar sobre acciones secuenciales.
- Multilingue: el modelo base Qwen3-4B esta entrenado en mas de 30 idiomas, incluyendo espanol, ingles, chino, frances y aleman.
- Modo thinking activable/desactivable: permite elegir entre respuestas razonadas o rapidas segun el caso de uso.
- Compatible con el formato de chat de Qwen y con la plantilla de chat estandar de transformers.

## Casos de uso

- Asistente de codigo local en Mac: un desarrollador puede ejecutar este modelo en su portatil Apple para obtener sugerencias de codigo, explicaciones de algoritmos o revision de fragmentos, gracias a su modo thinking que mejora la precision en tareas de programacion.
- Chatbot de atencion al cliente en entornos con privacidad estricta: al desplegarse en local, no se envian datos a servidores externos, y su ventana de contexto de 131K tokens permite gestionar conversaciones largas y documentacion extensa.
- Analisis de documentos y resumen: el modelo puede procesar documentos de gran tamano (por ejemplo, contratos o informes) y generar resumenes estructurados, aprovechando su contexto largo.
- Generacion de contenido multilingue: redaccion de articulos, correos o publicaciones en varios idiomas con calidad aceptable, util para equipos de marketing internacionales.
- Razonamiento logico en aplicaciones educativas: el modo thinking permite desglosar problemas matematicos o cientificos paso a paso, util para tutores virtuales o herramientas de aprendizaje.
- Prototipado rapido de agentes conversacionales: su soporte de tool calling permite integrarlo en pipelines de automatizacion, como consultas a bases de datos o llamadas a APIs, para construir asistentes virtuales funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta conversion MLX de 8 bits en la informacion disponible. El modelo base Qwen3-4B reporta en su documentacion oficial resultados en MMLU (81.4), HumanEval (77.2) y GSM8K (92.1), entre otros, pero estos valores corresponden al modelo en precision completa y no a la version cuantizada. La cuantizacion de 8 bits puede degradar ligeramente el rendimiento en tareas de razonamiento complejo, aunque en la practica la diferencia suele ser minima.

## Requisitos de hardware

- VRAM estimada: entre 4 y 6 GB, dependiendo de la longitud de la secuencia y el tamano del lote. Con cuantizacion de 8 bits, el modelo ocupa aproximadamente 4.3 GB en disco.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M1 Pro, M1 Max, M2, M2 Pro, M2 Max, M3, etc.) con al menos 8 GB de memoria unificada. No se requiere GPU NVIDIA o AMD.
- En equipos con 8 GB de memoria unificada, se recomienda limitar la longitud de contexto a valores menores (por ejemplo, 8K-16K tokens) para evitar desbordamiento de memoria.
- Opciones de despliegue: la forma principal es mediante la libreria `mlx-lm` (Python), que permite cargar el modelo y generar texto. Tambien es compatible con el ecosistema de `transformers` mediante la integracion de MLX, aunque la via recomendada es mlx-lm.
- Latencia y throughput: no se han publicado mediciones oficiales. En un MacBook Pro con chip M2 Pro, se estima una velocidad de generacion de entre 20 y 40 tokens por segundo para secuencias de longitud moderada, aunque esto depende de la implementacion y de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen3-4B-mlx-8Bit | 4B | 131K | Apache-2.0 | MLX 8-bit | Cuantizado para Apple Silicon |
| Qwen/Qwen3-4B (original) | 4B | 131K | Apache-2.0 | safetensors (BF16/FP16) | Precision completa, requiere mas VRAM |
| mlx-community/Qwen3-4B-8bit | 4B | 131K | Apache-2.0 | MLX 8-bit | Alternativa de la comunidad, misma base |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community | GGUF, safetensors | Menor tamano, sin modo thinking explicito |

La principal diferencia con el modelo original es el formato y la cuantizacion: la version MLX esta optimizada para hardware Apple, mientras que el original requiere mas recursos y no aprovecha las instrucciones especificas del silicio de Apple. Frente a Llama-3.2-3B, Qwen3-4B ofrece un contexto ligeramente mayor y un modo de razonamiento explicito, aunque Llama-3.2 puede tener mejor soporte de la comunidad en ciertos entornos.

## Limitaciones y advertencias

- La cuantizacion de 8 bits puede reducir ligeramente la precision en tareas de razonamiento complejo, matematicas avanzadas o generacion de codigo muy especifico, en comparacion con el modelo en precision completa.
- El modelo base Qwen3-4B, al igual que otros LLM, puede presentar sesgos sociales, culturales o de genero presentes en sus datos de entrenamiento. No se ha realizado una evaluacion especifica de sesgos para esta version cuantizada.
- Riesgo de alucinacion: puede generar informacion falsa o inventada, especialmente en temas de actualidad o cuando se le pide citar fuentes. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de idioma: aunque el modelo soporta multiples idiomas, el rendimiento en espanol u otros idiomas distintos del ingles y chino puede ser inferior al observado en los benchmarks oficiales, que se centran principalmente en ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero no incluye garantias ni soporte. El modelo base Qwen3-4B se distribuye bajo la misma licencia, sin restricciones adicionales.
- Para produccion, se recomienda probar exhaustivamente el modelo en el caso de uso concreto, ya que la cuantizacion puede afectar a tareas sensibles como generacion de codigo de seguridad o diagnostico medico.
- El formato MLX solo es compatible con hardware Apple; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estandar).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen3-4B-mlx-8Bit
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Version MLX 8-bit de Qwen (comunidad): https://huggingface.co/mlx-community/Qwen3-4B-8bit
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
- Pagina de Qwen3 en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B-MLX-8bit
