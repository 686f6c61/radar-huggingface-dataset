# huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-no-token-gate-paper100k-step1500-seed10

## Resumen

Este repositorio contiene un checkpoint experimental de destilación de conocimiento (knowledge distillation) que comprime las capacidades de Qwen2.5-7B-Instruct en un modelo estudiante de 1.540 millones de parámetros (1,54B). La variante concreta, denominada `lift_v12_no_token_gate`, pertenece a una suite de ablaciones del método LIFTKD (on-policy Generalized Knowledge Distillation con influencias a nivel de paso y de cabeza, sin gating de tokens). El modelo se inicializa desde Qwen/Qwen2.5-1.5B-Instruct y se entrena con 96.000 ejemplos del dataset `lift_paper_en_natural_v1/100k` durante 1.500 pasos de optimización, con un objetivo completamente on-policy que muestrea respuestas del estudiante y las compara con las del profesor.

La relevancia de este checkpoint es doble: por un lado, sirve para estudiar el impacto de eliminar el mecanismo de token gating en la destilación; por otro, ofrece un modelo de 1,5B con potencial para desplegarse en entornos con recursos limitados. Al estar basado en Qwen2.5, hereda la arquitectura transformer decoder-only de dicha familia, aunque la longitud de contexto no se especifica en la documentación. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.910.912 (1,54B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32K tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | no especificado; el tamaño del repo (3,1 GB) sugiere pesos en FP16 |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Qwen2.5: un transformer autoregresivo con atención por ventanas deslizantes (sliding window attention) y normalización RMSNorm, tal como se implementa en el modelo base Qwen2.5-1.5B-Instruct. No se introducen modificaciones estructurales en esta variante; el interés reside en el procedimiento de entrenamiento.

El entrenamiento emplea Generalized Knowledge Distillation (GKD) totalmente on-policy. El profesor es Qwen/Qwen2.5-7B-Instruct y el estudiante se inicializa con los pesos de Qwen2.5-1.5B-Instruct. El dataset de entrenamiento (`lift_paper_en_natural_v1/100k`) contiene 96.000 ejemplos de entrenamiento y 2.000 ejemplos de control con semilla fija. Durante cada paso, el estudiante genera muestras con temperatura 0,9 (máximo 128 tokens) y se calcula la divergencia con las salidas del profesor. La variante `no_token_gate` elimina el mecanismo de gating por token que otras versiones del método utilizan para ponderar la influencia de cada posición, aplicando en su lugar pesos uniformes a nivel de paso y de cabeza de atención.

El optimizador es AdamW con una tasa de aprendizaje que decae cosenoidalmente desde 1e-5 hasta 1e-7, weight decay de 1e-2 y batch global de 64. Se ejecutan 1.500 pasos con semilla 10. Los pesos se guardan en formato SafeTensors, listos para cargar con `transformers`.

## Capacidades

- Generación de texto en lenguaje natural, conversación y finalización de instrucciones, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas de lógica, aunque no hay evaluaciones específicas para este checkpoint.
- Generación de código y comprensión de lenguajes de programación, capacidad típica de la familia Qwen2.5.
- Soporte de múltiples idiomas, aunque no se documenta el alcance exacto en esta variante.
- No se menciona soporte explícito para tool calling, function calling, agentes o modos de pensamiento extendido (thinking mode) en la documentación proporcionada.
- Capacidades de visión o audio: no aplicables, es un modelo puramente textual.

## Casos de uso

- Investigación en destilación de conocimiento: este checkpoint es un artefacto de ablación diseñado para comparar el efecto de eliminar el token gating. Los investigadores pueden reproducir experimentos de GKD y analizar métricas de calidad frente a otras variantes de la suite V12.
- Fine-tuning posterior para tareas específicas: al ser un modelo de 1,5B con licencia Apache 2.0, puede servir como punto de partida para fine-tuning en dominios concretos (chat médico, soporte técnico, etc.) con menos recursos que un modelo de 7B.
- Generación de texto en entornos con restricciones de memoria: su tamaño (≈3,1 GB en FP16) permite ejecutarlo en GPUs consumer de 8 GB o menos, lo que facilita prototipado rápido en portátiles o servidores modestos.
- Experimentación con técnicas de cuantización: al disponer de pesos en safetensors, se puede cuantizar a INT8 o INT4 con herramientas como llama.cpp o GPTQ para reducir aún más el footprint y desplegarlo en CPU o GPUs de baja gama.
- Chatbots de demostración o educación: el modelo puede utilizarse en proyectos educativos o demos interactivas donde se requiera un asistente conversacional ligero, sin necesidad de infraestructura de alto rendimiento.
- Evaluación comparativa de métodos de destilación: junto con otros checkpoints de la misma suite, permite medir el impacto de diferentes estrategias de ponderación de tokens en la calidad final del estudiante, sirviendo como referencia para futuros diseños de algoritmos de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta variante. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo ocupa aproximadamente 3,1 GB. Para generación con contexto de 2K tokens, se necesitan al menos 4-5 GB de VRAM (considerando caché de atención y overhead). Con cuantización INT8, el uso baja a ~1,6 GB; con INT4, ~0,8 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en FP16 con batch pequeño. Para mayor throughput, se recomienda RTX 3090 o superior.
- Compatibilidad con GPU consumer: sí, cabe en GPUs de gama media y alta. También puede ejecutarse en Apple Silicon (M1/M2/M3) mediante llama.cpp con cuantización.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp, Ollama, o directamente con `transformers` y `text-generation-inference`. El modelo es compatible con los endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos medidos. Como referencia, un modelo de 1,5B en FP16 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con su modelo base y con otro modelo de tamaño similar. Los datos de contexto y capacidades se toman de las fichas oficiales de los modelos base, no de este checkpoint específico.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32K | Apache 2.0 | Modelo original sin destilación |
| Este checkpoint (LIFTKD v12 no token gate) | 1,54B | no disponible (probablemente 32K) | Apache 2.0 | Destilado desde Qwen2.5-7B-Instruct |
| Llama 3.2 1.5B Instruct | 1,54B | 128K | Llama 3.2 Community License | Alternativa comercial de Meta, contexto más largo |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real entre estos modelos. La comparación se limita a características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Al ser un checkpoint de investigación sin evaluación publicada, no se garantiza su calidad para tareas específicas; puede presentar alucinaciones, incoherencias o errores de razonamiento.
- El entrenamiento se realizó sobre un dataset en inglés (`lift_paper_en_natural_v1`), por lo que el rendimiento en otros idiomas puede ser inferior al del modelo base.
- No se especifica la longitud de contexto efectiva tras el entrenamiento; es posible que la destilación afecte a la capacidad de manejar secuencias largas.
- El modelo no ha sido sometido a pruebas de sesgo o toxicidad; puede reflejar sesgos presentes en los datos de entrenamiento del profesor y del estudiante.
- Aunque la licencia Apache 2.0 permite uso comercial, al ser un artefacto experimental se recomienda validar su comportamiento en el dominio de aplicación antes de desplegarlo en producción.
- El repositorio no incluye información sobre el proceso de alineación (RLHF/DPO) más allá de la destilación; el modelo base ya está alineado, pero la destilación podría degradar dicha alineación.

## Enlaces

- Repositorio del modelo: [huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-no-token-gate-paper100k-step1500-seed10](https://huggingface.co/huggingFacing/qwen2.5-7b-to-1.5b-liftkd-v12-no-token-gate-paper100k-step1500-seed10)
- Checkpoint completo del método (variante con token gating): [huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500](https://huggingface.co/huggingFacing/qwen25_7B_to_1.5B_v12_onlineif_paper100k_1500)
- Modelo base del estudiante: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- Modelo profesor: [Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
