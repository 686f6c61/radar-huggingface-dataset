# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-6bit

## Resumen

Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-6bit es una conversión al formato MLX (Apple Silicon) del modelo Fastino-Nemotron-3.5-Lightning-Healthcare, un modelo de lenguaje especializado en el dominio sanitario y biomédico. El modelo original fue desarrollado por Fastino a partir del checkpoint NVIDIA Nemotron 3.5 Lightning, combinado con un adaptador entrenado mediante un agente autónomo de fine-tuning. Esta versión MLX está cuantizada en 6-bit, lo que reduce el tamaño del modelo a aproximadamente 6.9 mil millones de parámetros almacenados (frente a los 30 mil millones del modelo original, de los cuales solo 3 mil millones se activan por token gracias a su arquitectura MoE). El modelo está diseñado para tareas de generación de texto conversacional y razonamiento en contextos clínicos, con una licencia Apache 2.0 que permite su uso comercial sin restricciones.

La relevancia de este modelo radica en la combinación de una arquitectura eficiente (MoE con activación parcial) con un ajuste fino específico para el sector salud, lo que lo convierte en una opción viable para aplicaciones médicas que requieran comprensión de terminología clínica, análisis de historiales o generación de documentación sanitaria. La conversión a MLX facilita su ejecución local en hardware de Apple, lo que amplía las posibilidades de despliegue en entornos sin acceso a GPUs NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en NVIDIA Nemotron 3.5 Lightning |
| Parámetros totales | 6.914.599.488 (pesos cuantizados en safetensors) |
| Parámetros activos | 3 mil millones (por token, en el modelo original) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Nemotron 3.5 Lightning soporta hasta 128.000 tokens) |
| Tipos de cuantización | 6-bit affine, group size 64 (formato MLX) |
| Idiomas soportados | No disponible (el modelo base Nemotron 3.5 Lightning es multilingüe, aunque no se especifican los idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Fastino-Nemotron-3.5-Lightning-Healthcare es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales, de los que solo 3 mil millones se activan durante cada token de inferencia. Esta arquitectura permite un rendimiento comparable a modelos densos de mayor tamaño con un coste computacional reducido. El entrenamiento del adaptador sanitario se realizó mediante un agente autónomo de fine-tuning desarrollado por Fastino, que curó datos médicos, generó y entrenó múltiples candidatos de adaptadores, y evaluó cada uno en tareas objetivo y de transferencia. El proceso se basó en el checkpoint Nemotron 3.5 Lightning de NVIDIA (publicado el 29 de julio de 2026) y el adaptador final (denominado E17b) se fusionó directamente en los pesos del modelo, de modo que no es necesario cargar un LoRA externo.

La conversión a MLX se realizó con la librería mlx-lm versión 0.31.3, aplicando una cuantización affine de 6-bit con group size de 64. Esta cuantización reduce el tamaño de los pesos a aproximadamente 6,9 mil millones de parámetros almacenados, lo que permite ejecutar el modelo en hardware con recursos limitados, como las GPU integradas de Apple Silicon.

## Capacidades

- Generación de texto especializada en el dominio sanitario: el modelo está ajustado para responder con terminología médica precisa y estructurada.
- Razonamiento clínico: puede analizar síntomas, sugerir diagnósticos diferenciales y explicar procesos patológicos.
- Soporte de tool calling y function calling: el modelo base Nemotron 3.5 Lightning incluye capacidades de agente, que se preservan en la conversión MLX.
- Generación de código (heredada del modelo base), aunque no es su enfoque principal.
- Multilingüismo básico heredado del modelo base, aunque no se documentan los idiomas concretos.
- Conversación de múltiples turnos con chat template, compatible con el formato de chat estándar de Hugging Face.

## Casos de uso

- **Asistencia a profesionales médicos en redacción de informes**: el modelo puede generar borradores de historias clínicas, resúmenes de alta o notas de evolución, reduciendo el tiempo de documentación administrativa.
- **Soporte en triaje de pacientes**: dado un conjunto de síntomas descritos por un paciente, el modelo puede sugerir una prioridad de atención basada en criterios clínicos generales, ayudando en entornos de telemedicina.
- **Educación médica y formación de residentes**: se puede usar como tutor interactivo para explicar conceptos de farmacología, patología o interpretación de pruebas diagnósticas.
- **Análisis de literatura biomédica**: el modelo puede resumir artículos científicos, extraer hallazgos clave y comparar resultados de estudios, gracias a su contexto largo y su ajuste en el dominio.
- **Integración en sistemas de información hospitalaria**: mediante el soporte de tool calling, puede conectarse a bases de datos de laboratorio o historias clínicas para responder preguntas concretas en tiempo real.
- **Generación de contenido para pacientes**: redactar folletos informativos, explicaciones de tratamientos o advertencias de medicamentos en lenguaje claro, adaptado a un nivel de comprensión no técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión MLX. Según la nota de prensa de Fastino Labs, el modelo original Fastino-Nemotron-3.5-Lightning-Healthcare supera al modelo base Nemotron 3.5 Lightning en varios benchmarks de salud y finanzas, pero no se especifican los valores numéricos. No se dispone de datos comparativos fiables para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo MoE con 6,9 mil millones de pesos cuantizados a 6-bit, el tamaño en memoria es aproximadamente 5,2 GB (6,9B × 0,75 bytes). La inferencia requiere además memoria para los estados de atención, por lo que se recomienda al menos 8 GB de memoria unificada.
- **GPU recomendadas**: se ejecuta de forma nativa en Apple Silicon (M1/M2/M3/M4) con MLX. En otros sistemas, se puede ejecutar mediante el backend MLX en CPU, aunque con menor rendimiento.
- **Cabe en consumer GPU**: Sí, en Apple Silicon con 8 GB o más de RAM unificada (por ejemplo, MacBook Pro M3 con 16 GB). En GPUs NVIDIA no se ejecuta directamente con MLX, pero el modelo original en formato BF16 requeriría ~60 GB de VRAM (para 30B parámetros), aunque con cuantización 4-bit se podría ejecutar en GPUs de 24 GB (RTX 4090).
- **Opciones de despliegue**: la librería mlx-lm permite generar texto desde CLI o Python. Para servidores, se puede usar el adaptador MLX de vLLM (en desarrollo) o desplegar el modelo original en llama.cpp con cuantización GGUF.
- **Latencia y throughput**: no se conocen valores específicos para esta conversión. En Apple Silicon M2 Max, un modelo de ~7B en 6-bit suele generar entre 20 y 40 tokens por segundo, pero depende de la memoria y del tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Healthcare (base) | 30B MoE (3B activos) | 128k | Apache 2.0 | Salud |
| NVIDIA Nemotron 3.5 Lightning 30B A3B | 30B MoE (3B activos) | 128k | Apache 2.0 | General |
| Fastino-Nemotron-3.5-Lightning-Finance | 30B MoE (3B activos) | 128k | Apache 2.0 | Finanzas |

La conversión MLX aquí descrita es una variante cuantizada del modelo de salud, con la misma arquitectura y licencia que el modelo base, pero optimizada para ejecución local en Apple. No se dispone de datos comparativos de rendimiento entre la versión cuantizada y la versión original.

## Limitaciones y advertencias

- **Sesgos clínicos**: el modelo puede heredar sesgos de los datos de entrenamiento, incluyendo infrarrepresentación de ciertos grupos étnicos o genéricos en diagnósticos médicos. No debe usarse como única fuente para decisiones clínicas.
- **Alucinación**: como cualquier LLM, puede generar información falsa o inexacta con apariencia de verosimilitud. En el dominio sanitario, esto es especialmente crítico.
- **Contexto**: aunque el modelo base soporta hasta 128k tokens, la cuantización 6-bit puede degradar ligeramente la calidad en contextos muy largos.
- **Idiomas**: no se especifica la cobertura de idiomas. El modelo base es multilingüe, pero no se garantiza el mismo rendimiento en todos los idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de exactitud médica. Cualquier uso en producción debe someterse a una validación exhaustiva.
- **Dependencia de la librería**: la conversión MLX requiere la librería mlx-lm (versión 0.31.3 o compatible). No es compatible con frameworks como Transformers para ejecución directa en GPU NVIDIA.

## Enlaces

- [Modelo MLX en Hugging Face](https://huggingface.co/nicolasembleton/Fastino-Nemotron-3.5-Lightning-Healthcare-MLX-6bit)
- [Modelo base Fastino-Nemotron-3.5-Lightning-Healthcare](https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Healthcare)
- [Repositorio del modelo base (archivos)](https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Healthcare/tree/main)
- [Model card de NVIDIA Nemotron 3.5 Lightning 30B A3B](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard)
- [Blog de Fastino: Small Model, Big Leverage](https://fastino.ai/blog/learnings-from-fine-tuning-nvidia-nemotron-3.5-lightning-with-autonomous-agent)
- [Nota de prensa sobre los modelos especializados](https://www.cnhinews.com/news/article_19fed0b4-d224-5ec2-b616-69587e928714.html)
