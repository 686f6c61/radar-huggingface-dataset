# huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v11-epoch-static-if-paper100k-step1500-seed10

## Resumen

Este repositorio contiene un checkpoint de destilación de conocimiento (knowledge distillation) que comprime el modelo Qwen2.5-7B-Instruct a un estudiante de 1.5B parámetros, inicializado desde Qwen/Qwen2.5-1.5B-Instruct. El entrenamiento utiliza la variante `lift_v11_epoch_static_if` del framework LIFTKD, que incorpora un gap gate con pesos de influencia estáticos a nivel de época para las cabezas de atención y los tokens superiores. El objetivo es investigar la eficacia de diferentes estrategias de destilación on-policy con Generalized Knowledge Distillation (GKD) sobre un subconjunto de datos académicos (`lift_paper_en_natural_v1/100k`).

El modelo resultante tiene 1.543.910.912 parámetros (aproximadamente 1.54B) y se distribuye en formato SafeTensors. Es un checkpoint de ablación dentro de una suite más amplia (V12 Paper100K), cuyo checkpoint completo se publica por separado. La relevancia actual radica en su contribución al estudio de métodos de destilación eficientes para modelos de lenguaje de tamaño medio, permitiendo desplegar capacidades de razonamiento y generación de texto en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen2.5, no se especifican detalles adicionales) |
| Parametros totales | 1.543.910.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, aunque la model card no detalla la configuración interna (número de capas, dimensiones de atención, etc.). El entrenamiento sigue un esquema de destilación on-policy con GKD, donde el profesor es `Qwen/Qwen2.5-7B-Instruct` y el estudiante se inicializa desde `Qwen/Qwen2.5-1.5B-Instruct`. La variante específica `lift_v11_epoch_static_if` introduce un gap gate que pondera la influencia de las cabezas de atención y de los tokens de mayor relevancia, con pesos estáticos fijados por época.

Los datos de entrenamiento provienen del conjunto `lift_paper_en_natural_v1/100k`, compuesto por 96.000 ejemplos de entrenamiento y 2.000 ejemplos de control con semilla fija. El entrenamiento se realizó durante 1.500 pasos de optimizador con un batch global de 64, usando AdamW con una tasa de aprendizaje coseno desde 1e-5 hasta 1e-7 y weight decay de 1e-2. El muestreo se hizo con temperatura 0.9 y un máximo de 128 tokens generados por ejemplo. La semilla aleatoria fue 10. No se mencionan técnicas adicionales como RLHF o DPO; el enfoque es puramente de destilación supervisada con GKD.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje entrenado con destilación, puede generar texto coherente en tareas de continuación y respuesta a instrucciones, aunque no se especifican detalles de rendimiento.
- Conversación: al estar inicializado desde Qwen2.5-1.5B-Instruct, hereda la capacidad de mantener diálogos multi-turno, pero no hay confirmación de que esta capacidad se haya preservado tras la destilación.
- Razonamiento y código: no se proporcionan datos específicos sobre estas capacidades en la model card.
- Soporte de tool calling y agentes: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales (vision, audio, thinking mode): no disponible.

La información disponible no detalla las capacidades concretas del checkpoint más allá de su naturaleza como modelo de generación de texto.

## Casos de uso

No se dispone de información específica en la model card sobre casos de uso recomendados. Dado que es un modelo de 1.5B parámetros destilado desde un profesor de 7B, es plausible que se destine a escenarios donde se requiera un equilibrio entre calidad y eficiencia, como:

- Despliegue en dispositivos con recursos limitados (edge, móvil) para generación de texto en tiempo real.
- Prototipado rápido de aplicaciones conversacionales donde el coste de inferencia sea crítico.
- Investigación académica sobre técnicas de destilación y evaluación de variantes de GKD.
- Fine-tuning posterior sobre dominios específicos con un modelo base compacto.
- Servicios de chat en entornos con restricciones de VRAM o presupuesto de cómputo.
- Generación de respuestas en pipelines de automatización donde se necesite baja latencia.

Sin embargo, estas posibilidades son inferencias razonables basadas en el tamaño y el propósito del modelo, no en datos publicados por el autor. Para usos concretos, se recomienda consultar el checkpoint completo de la suite V12.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se desconoce el rendimiento real del checkpoint frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.543.910.912 parámetros en precisión FP16, los pesos ocupan aproximadamente 3,1 GB (coincide con el tamaño del repositorio). Para inferencia con batch pequeño, se necesitan al menos 4 GB de VRAM, aunque se recomienda 6-8 GB para margen con activaciones y caché de atención.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM, como NVIDIA RTX 2060, RTX 3060, GTX 1080 Ti, o GPUs de datacenter como T4 o L4. Una RTX 4090 o A100 sería excesiva pero totalmente compatible.
- Si cabe en consumer GPU: sí, en GPUs de gama media y alta (8 GB o más) es viable.
- Opciones de despliegue: al estar en formato SafeTensors y ser compatible con Transformers, puede servirse con vLLM, TGI, o convertirse a GGUF para llama.cpp y Ollama. No se proporcionan configuraciones oficiales.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de destilación de Qwen2.5 o alternativas de tamaño similar. El modelo base Qwen2.5-1.5B-Instruct es el punto de partida, pero no hay datos de rendimiento del checkpoint destilado frente a él ni frente a otros modelos de 1.5B como Llama-3.2-1.5B o Gemma-2-2B. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Al ser un checkpoint de ablación, no se garantiza que su rendimiento sea óptimo; es una variante experimental dentro de un estudio de destilación.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El modelo podría presentar comportamientos indeseados similares a los de otros modelos de lenguaje, pero no hay datos al respecto.
- La longitud de contexto no está especificada; se desconoce si hereda los 32K tokens del modelo base Qwen2.5-1.5B-Instruct o si la destilación la ha modificado.
- No se proporciona información sobre idiomas soportados; aunque Qwen2.5 soporta múltiples idiomas, no se confirma que esta variante los conserve.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el modelo se ofrece sin garantías y sin soporte oficial.
- Para producción, se recomienda validar el rendimiento en tareas específicas antes de su adopción, dado que no hay benchmarks publicados.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v11-epoch-static-if-paper100k-step1500-seed10
- Checkpoint completo de la suite V12: https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500
- Modelo base (estudiante): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
