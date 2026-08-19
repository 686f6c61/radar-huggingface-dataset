# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador, denominado `sft_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42`, forma parte del estudio de imitación de comportamiento **dementor** llevado a cabo por el equipo de dementor-research. El objetivo es transferir las capacidades de razonamiento matemático del modelo Gemma-4-31B al modelo Nemotron-3-Nano, un modelo de arquitectura Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones de parámetros activos.

El adaptador se ha entrenado específicamente sobre el dataset GSM8K, un conjunto de problemas aritméticos de nivel escolar, con el fin de que el modelo base mejore su capacidad de resolver problemas matemáticos paso a paso. La relevancia de este trabajo radica en la posibilidad de obtener un modelo más eficiente (menos parámetros activos) con un rendimiento comparable al de un modelo mucho más grande, mediante técnicas de adaptación ligera como LoRA. El repositorio tiene un tamaño de 1.5 GB y contiene los pesos del adaptador en formato safetensors, listos para ser cargados con la librería PEFT de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre modelo base MoE (Nemotron-3-Nano-30B-A3B) |
| Parametros totales | No disponible (el modelo base tiene 30B; el adaptador no especifica su número de parámetros) |
| Parametros activos | No disponible (el modelo base tiene 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo base se distribuye en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante fine-tuning supervisado (SFT) utilizando la técnica LoRA con rango 32 y `target_modules=all-linear`, es decir, se aplicaron matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El modelo base es `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer con arquitectura Mixture-of-Experts (MoE) que activa únicamente 3 mil millones de parámetros por token, lo que lo hace notablemente más eficiente que un modelo denso de 30B.

El entrenamiento se realizó sobre el dataset GSM8K, un conjunto de problemas matemáticos de razonamiento aritmético, con el objetivo de imitar el comportamiento de Gemma-4-31B (un modelo de Google de 31 mil millones de parámetros). El proceso forma parte de un estudio más amplio denominado **dementor**, que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones experimentales. Los detalles exactos del cohorte y los hiperparámetros se encuentran en el archivo `config.yaml` de la versión de código asociada. No se especifica si se utilizaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento matemático: el adaptador está específicamente entrenado para mejorar la capacidad del modelo base en la resolución de problemas aritméticos de nivel escolar (GSM8K).
- Imitación de comportamiento: el objetivo del entrenamiento es replicar las respuestas y el estilo de razonamiento del modelo Gemma-4-31B, lo que puede traducirse en respuestas más estructuradas y explicativas.
- Adaptación ligera: al ser un adaptador LoRA, se puede cargar sobre el modelo base sin necesidad de modificar los pesos originales, facilitando su integración en pipelines existentes.
- No se dispone de información sobre capacidades adicionales como tool calling, soporte de agentes, visión o audio. Estas dependen del modelo base y no se han documentado en el repositorio.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el adaptador puede utilizarse para crear asistentes que resuelvan problemas de aritmética y álgebra básica, proporcionando explicaciones paso a paso similares a las de Gemma-4-31B.
- Evaluación de técnicas de imitación de comportamiento: investigadores pueden usar este adaptador como referencia para estudiar cómo un modelo pequeño (3B activos) puede aproximar el rendimiento de uno grande (31B) en tareas específicas.
- Fine-tuning adicional sobre otros datasets: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar su entrenamiento para tareas relacionadas con el razonamiento numérico.
- Benchmarking de eficiencia: permite comparar el rendimiento y la velocidad de inferencia entre un modelo MoE de 30B y un modelo denso de 31B en tareas de razonamiento matemático.
- Prototipado rápido en entornos con recursos limitados: gracias al bajo número de parámetros activos del modelo base, es posible ejecutar el modelo en GPUs de consumo con cuantización adecuada, manteniendo una calidad razonable en tareas matemáticas.
- Estudio de transferencia de conocimiento: sirve como ejemplo práctico de cómo transferir capacidades de un modelo grande a uno más pequeño mediante SFT con LoRA, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (como exactitud en GSM8K, MMLU u otros) ni comparaciones con otros modelos. Se recomienda consultar futuras publicaciones del equipo dementor-research para obtener datos cuantitativos.

## Requisitos de hardware

- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` requiere una GPU con al menos 16 GB de VRAM para inferencia en BF16 (los pesos ocupan aproximadamente 60 GB en BF16, pero con cuantización a 8 bits o 4 bits se puede reducir a 15-30 GB).
- Para ejecutar el modelo en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB), es necesario cuantizar el modelo base (por ejemplo, a 8 bits o 4 bits) mediante herramientas como `bitsandbytes` o `llama.cpp`.
- El adaptador LoRA en sí ocupa 1.5 GB y se carga en memoria junto con el modelo base, por lo que el requisito de VRAM total depende principalmente del modelo base.
- Opciones de despliegue: se puede utilizar con la librería `transformers` junto con `PEFT`, o exportar el modelo combinado a formato GGUF para su uso con `llama.cpp` u Ollama. También es compatible con servidores de inferencia como vLLM o TGI, siempre que se cargue el adaptador correctamente.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores o modelos similares. El adaptador está diseñado específicamente para el modelo base Nemotron-3-Nano-30B-A3B y no se han publicado comparaciones con alternativas como Gemma-4-31B (el modelo imitado) u otros adaptadores LoRA para tareas de GSM8K.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente sobre el dataset GSM8K, por lo que su rendimiento fuera de problemas matemáticos de nivel escolar puede ser limitado o incluso degradar el comportamiento general del modelo base.
- No se especifica la licencia del adaptador ni del modelo base, lo que puede suponer un riesgo para uso comercial. Se recomienda verificar los términos de uso de NVIDIA para Nemotron-3-Nano antes de cualquier despliegue en producción.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un dataset de problemas matemáticos, es probable que tenga un sesgo hacia el razonamiento formal y poca capacidad en tareas creativas o conversacionales.
- El riesgo de alucinación no se ha evaluado; el modelo base puede generar respuestas incorrectas en problemas matemáticos si el adaptador no se ha entrenado suficientemente.
- La longitud de contexto no se ha especificado, por lo que no se recomienda su uso en tareas que requieran ventanas de contexto muy largas sin verificar previamente las capacidades del modelo base.
- El adaptador se ha entrenado con una única semilla (seed 42), por lo que los resultados pueden no ser totalmente representativos de la variabilidad del entrenamiento.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-31b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
