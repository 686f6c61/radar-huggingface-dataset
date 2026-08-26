# nightmedia/granite-4.2-30b-mxfp8-mlx

## Resumen

El modelo `nightmedia/granite-4.2-30b-mxfp8-mlx` es una adaptación cuantizada en formato MXFP8 (8 bits) del modelo base `ibm-granite/granite-4.2-30b`, desarrollado por IBM. Esta versión está optimizada para ejecutarse en dispositivos Apple Silicon mediante la librería MLX, lo que permite desplegar un modelo de razonamiento de gran tamaño en hardware de consumo con memoria unificada. El modelo base Granite 4.2 introduce capacidades nativas de razonamiento (thinking), realizando cadenas de pensamiento paso a paso antes de emitir una respuesta final, además de soporte para tool calling y conversación multilingüe.

La relevancia de esta ficha radica en que ofrece una alternativa accesible para desarrolladores que trabajan en ecosistemas Apple y necesitan un modelo de razonamiento con licencia Apache 2.0, sin restricciones de uso comercial. La cuantización MXFP8 reduce significativamente el uso de memoria y acelera la inferencia en hardware MLX, aunque puede implicar una ligera pérdida de precisión respecto al modelo original en FP16 o BF16. El repositorio incluye los pesos en formato safetensors, listos para cargar con MLX.

Cabe señalar una discrepancia en los datos: el archivo safetensors reporta 8.234.471.424 parámetros (~8,2 mil millones), mientras que el modelo base declara 30 mil millones. Esta diferencia podría deberse a un error del autor al subir los archivos o a una cuantización extrema, pero no se ha podido verificar. Se recomienda contrastar con el modelo original de IBM antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según IBM Granite 4.2) |
| Parametros totales | 8.234.471.424 (según safetensors; el modelo base declara 30B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (8 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 es un transformer denso (no MoE) con atención estándar, diseñado por IBM para tareas de razonamiento. Incorpora un modo de "thinking" que genera cadenas de pensamiento internas antes de producir la respuesta final, similar a otros modelos de razonamiento como OpenAI o1 o DeepSeek-R1. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o si se utilizó RLHF/DPO en esta versión cuantizada. La cuantización MXFP8 es una técnica de 8 bits que reduce el tamaño de los pesos y acelera la inferencia en hardware compatible, como los chips Apple M-series a través de MLX.

La adaptación a MLX implica que los pesos se han convertido al formato optimizado para la librería MLX de Apple, que aprovecha la memoria unificada y las unidades Neural Engine. No se han publicado detalles sobre el proceso de cuantización (calibración, pérdida de precisión, etc.) en la información disponible.

## Capacidades

- Razonamiento paso a paso (thinking mode): genera cadenas de pensamiento internas antes de responder, mejorando la precisión en problemas complejos de lógica, matemáticas y análisis.
- Tool calling / function calling: puede invocar herramientas externas y APIs, lo que permite integrarlo en agentes autónomos y flujos de automatización.
- Generación de texto conversacional: mantiene diálogos multi-turno con coherencia contextual.
- Soporte multilingüe: cubre 12 idiomas, incluyendo español, inglés, francés, alemán, japonés, chino, entre otros.
- Generación de código: aunque no se especifica explícitamente, los modelos Granite 4.2 suelen incluir capacidades de programación; se asume que esta versión las conserva.
- Compatibilidad con MLX: optimizado para ejecución en Apple Silicon, con carga directa desde safetensors.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, manteniendo el contexto de la interacción y derivando consultas complejas a herramientas externas mediante tool calling. Su licencia Apache 2.0 permite uso comercial sin restricciones.
- Asistente de razonamiento para análisis de datos: gracias a su modo thinking, puede descomponer problemas estadísticos o financieros en pasos lógicos, generando explicaciones detalladas y verificables.
- Generación de código en entornos Apple: al estar optimizado para MLX, es adecuado para editores de código y asistentes de programación que se ejecutan localmente en Mac, ofreciendo sugerencias y refactorizaciones con baja latencia.
- Agente autónomo para automatización de tareas: con soporte de tool calling, puede orquestar llamadas a APIs, bases de datos o scripts, actuando como agente en pipelines de CI/CD o sistemas de gestión.
- Traducción y localización: su soporte multilingüe permite traducir documentos técnicos o contenido web entre los 12 idiomas soportados, con razonamiento contextual para evitar errores de sentido.
- Educación y tutoría: el modo thinking permite explicar conceptos complejos paso a paso, útil para plataformas de aprendizaje adaptativo o asistentes de estudio.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de 8 bits con formato MLX, los desarrolladores pueden iterar rápidamente en Mac sin necesidad de GPUs dedicadas, reduciendo costes de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks claros en la información disponible. La model card incluye una sección "brainwaves" con números sueltos (0.509, 0.732, 0.880) que podrían corresponder a métricas de ARC, BoolQ u otros, pero no están etiquetados ni se especifica la metodología. No se pueden presentar como datos fiables. Se recomienda consultar los benchmarks oficiales del modelo base `ibm-granite/granite-4.2-30b` en la documentación de IBM.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 30,2 GB, lo que sugiere que la carga completa requiere al menos 30 GB de memoria unificada. En la práctica, con MLX y cuantización MXFP8, podría funcionar con 32 GB o más.
- GPU recomendadas: exclusivo para Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4). No es compatible con GPUs NVIDIA o AMD sin conversión previa.
- Compatibilidad con consumer GPU: solo en Mac con memoria unificada de 32 GB o superior. No cabe en GPUs de consumo típicas (RTX 4090, etc.) porque MLX no está soportado en esas plataformas.
- Opciones de despliegue: MLX (librería nativa de Apple), también se puede usar con `mlx-lm` para generación de texto. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversión a otros formatos.
- Latencia y throughput: no se dispone de datos medidos. En hardware Apple Silicon, la inferencia con MLX suele ser eficiente, pero depende del modelo exacto de chip y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nightmedia/granite-4.2-30b-mxfp8-mlx | 8,2B (según safetensors) | No disponible | Apache 2.0 | MLX, MXFP8 | Cuantización para Apple Silicon |
| nightmedia/granite-4.1-30b-mxfp8-mlx | 30B (declarado) | 128K (según llm-explorer) | Apache 2.0 | MLX, MXFP8 | Versión anterior de Granite 4.1 |
| ibm-granite/granite-4.2-30b | 30B | No disponible | Apache 2.0 | safetensors (original) | Modelo base sin cuantizar, para GPUs estándar |

La comparativa muestra que esta versión cuantizada es una alternativa ligera para Apple, pero con una discrepancia en el número de parámetros que debe verificarse. El modelo original de IBM es la referencia para benchmarks y capacidades completas.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el safetensors reporta ~8,2B mientras que el nombre y el modelo base indican 30B. Esto puede deberse a un error de subida o a una cuantización agresiva; no se recomienda usarlo en producción sin verificar la integridad de los pesos.
- Cuantización MXFP8: puede introducir pérdida de precisión en tareas de razonamiento complejo o matemáticas de alta exactitud, comparado con el modelo en FP16/BF16.
- Exclusividad de plataforma: solo funciona con MLX en Apple Silicon. No es portable a entornos Linux/Windows con GPUs NVIDIA sin conversión manual.
- Sin datos de contexto: no se especifica la longitud máxima de secuencia, lo que limita su uso en tareas que requieren ventanas largas.
- Contenido de la model card: el README incluye texto no técnico (historias de Star Trek, respuestas simuladas) que no aporta información fiable sobre el modelo. Se recomienda ignorar ese contenido.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento si no se valida la salida.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo multilingüe entrenado con datos web, puede reflejar sesgos culturales o de género presentes en los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nightmedia/granite-4.2-30b-mxfp8-mlx
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-30b
- Versión anterior (Granite 4.1): https://huggingface.co/nightmedia/granite-4.1-30b-mxfp8-mlx
