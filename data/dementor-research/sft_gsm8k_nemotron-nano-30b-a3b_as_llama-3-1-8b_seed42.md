# dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42

## Resumen

El modelo `dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42` es un adaptador LoRA (Low-Rank Adaptation) publicado por el grupo de investigación dementor-research. Se trata de un componente de un estudio más amplio de imitación conductual definido por configuración, en el que se entrena un adaptador sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` para que reproduzca el comportamiento de `meta-llama/Llama-3.1-8B` en tareas de razonamiento matemático, utilizando el dataset GSM8K. El adaptador se entrena con fine-tuning supervisado (SFT) y un rango LoRA de 32 sobre todas las capas lineales.

Este adaptador no es un modelo autónomo: requiere cargar el modelo base Nemotron-3 Nano (una arquitectura MoE de 30B parámetros totales con 3B activos) y aplicar el adaptador mediante la librería `peft`. Su relevancia radica en ser un ejemplo de estudio de imitación conductual entre modelos de diferente arquitectura y tamaño, aunque no se han publicado evaluaciones de rendimiento ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre base MoE (NVIDIA Nemotron-3 Nano 30B A3B) |
| Parametros totales | No disponible (el adaptador tiene rango 32, sin número de parámetros declarado) |
| Parametros activos | No aplica (adaptador, no modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base se ofrece en BF16) |
| Idiomas soportados | No disponibles (depende del modelo base) |
| Licencia | No disponible (el adaptador no declara licencia; el base tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA con rango 32 y `target_modules=all-linear`, lo que significa que se inyectan matrices de baja dimensión en todas las capas lineales del modelo base. El entrenamiento se realiza con SFT sobre el dataset GSM8K, un conjunto de problemas de aritmética y razonamiento matemático de nivel escolar. El objetivo es que el modelo base Nemotron-3 Nano imite las respuestas de Llama 3.1 8B en este dominio, como parte de un estudio de imitación conductual denominado "dementor". El pipeline de entrenamiento utiliza la herramienta Tinker de Thinking Machines. No se especifican hiperparámetros adicionales (tasa de aprendizaje, épocas, tamaño de lote, etc.) en la información disponible. El adaptador se distribuye en formato `peft` y debe cargarse sobre el modelo base indicado.

## Capacidades

- Adaptador especializado en razonamiento matemático, entrenado para imitar a Llama 3.1 8B en el dataset GSM8K.
- No se han publicado evaluaciones independientes; las capacidades reales del adaptador no están verificadas.
- El modelo base (Nemotron-3 Nano 30B A3B) es un MoE con capacidades generales de generación de texto, razonamiento y multilingüismo, pero esas capacidades no se detallan en la documentación del adaptador.
- No se indica soporte para tool calling, agentes, visión o audio.
- El adaptador es dependiente del modelo base; cualquier capacidad adicional proviene del base, no del adaptador.

## Casos de uso

- Investigación en imitación conductual: permite estudiar cómo un modelo MoE grande (30B totales, 3B activos) puede adaptarse para replicar el comportamiento de un modelo denso más pequeño (Llama 3.1 8B) en tareas específicas. Útil para laboratorios que analizan transferencia de habilidades entre arquitecturas.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para entrenamientos posteriores sobre otros datasets de razonamiento matemático, aprovechando la inicialización de LoRA.
- Evaluación de robustez: se puede usar para probar si la imitación conductual generaliza a otros problemas de matemáticas fuera de GSM8K, aunque no hay evidencia publicada.
- Comparación de arquitecturas: permite comparar el comportamiento de un MoE con activación escasa frente a un modelo denso en tareas de razonamiento, manteniendo el mismo conjunto de respuestas objetivo.
- Prototipado rápido: al ser un adaptador pequeño (1.5 GB), se puede cargar sobre el base para experimentar sin necesidad de entrenar desde cero, siempre que se disponga de los recursos del modelo base.
- Estudio de alineación de salidas: útil para analizar diferencias en la distribución de respuestas entre dos modelos cuando se fuerza la imitación mediante SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K (ni siquiera del propio dataset de entrenamiento) ni comparaciones con otros modelos. El repositorio no incluye métricas de evaluación.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.5 GB de pesos), pero requiere cargar el modelo base completo para su uso.
- El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` tiene 30B parámetros totales con 3B activos. En BF16, la memoria necesaria para los pesos es de aproximadamente 60 GB, por lo que se necesitan GPUs de alta gama (A100 80GB, H100 80GB) o varias GPUs.
- Con cuantización (por ejemplo, 8 bits o 4 bits) se podría reducir la huella de memoria, pero no se ofrecen versiones cuantizadas del adaptador ni del base en el repositorio.
- No se indica soporte para vLLM, Ollama, llama.cpp u otros motores de inferencia; el uso documentado es mediante `transformers` y `peft`.
- La latencia y el throughput no están especificados.

## Comparativa con modelos similares

No hay datos de rendimiento para comparar. El adaptador imita a Llama 3.1 8B, pero no se puede establecer una comparación cuantitativa. Se puede comparar a nivel estructural:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42 | LoRA sobre MoE | 30B totales (3B activos) en el base | No disponible | No disponible | HuggingFace |
| meta-llama/Llama-3.1-8B | Transformer denso | 8B | 128k (según documentación oficial) | Llama 3.1 Community License | HuggingFace |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | MoE | 30B totales (3B activos) | No disponible | No disponible (propietaria de NVIDIA) | HuggingFace |

La comparación es limitada porque el adaptador no es un modelo independiente y no se dispone de métricas.

## Limitaciones y advertencias

- No hay evaluación publicada: el adaptador no incluye resultados de benchmarks, por lo que su rendimiento real en GSM8K o cualquier otra tarea es desconocido.
- Posible sobreajuste: al entrenarse únicamente sobre GSM8K, es probable que el adaptador esté especializado en ese dataset y no generalice bien a otros problemas de razonamiento.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base específico `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`; no es portátil a otros modelos.
- Licencia no clara: el adaptador no declara licencia, y el modelo base de NVIDIA tiene restricciones propias. Cualquier uso comercial requiere verificar la licencia del base.
- Riesgo de alucinación: al ser un adaptador de imitación, puede generar respuestas incorrectas o inventadas en problemas fuera del dominio de entrenamiento.
- Tamaño del contexto: no se especifica, por lo que no se puede garantizar un comportamiento adecuado en contextos largos.
- Sin soporte para producción: al ser un artefacto de investigación experimental, no se recomienda su uso en entornos productivos sin una validación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_nemotron-nano-30b-a3b_as_llama-3.1-8b_seed42
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
