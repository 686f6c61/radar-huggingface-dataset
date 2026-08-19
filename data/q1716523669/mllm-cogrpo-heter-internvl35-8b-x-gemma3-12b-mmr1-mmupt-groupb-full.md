# q1716523669/mllm-cogrpo-heter-internvl35-8b-x-gemma3-12b-mmr1-mmupt-groupB-full

## Resumen

Este repositorio publica los pesos finales (`endpoint`) de un experimento de aprendizaje por refuerzo no supervisado sobre el modelo multimodal `google/gemma-3-12b-it`. El autor, `q1716523669`, aplica la receta **MM-UPT** con el método **heter co-GRPO** (colaboración heterogénea entre dos modelos, en este caso InternVL 3.5 8B y Gemma 3 12B, aunque el modelo base final es Gemma 3 12B it). El entrenamiento se realizó durante 481 pasos y el repositorio incluye únicamente el checkpoint final, junto con el archivo `trainer_state_endpoint.json` que registra las métricas de cada paso.

El interés de este modelo es metodológico: explora el uso de GRPO en un escenario multimodal sin supervisión explícita, con una evaluación intermedia sobre un subconjunto de 150 preguntas de MathVista. Sin embargo, no se han publicado resultados de benchmarks finales, y el propio autor advierte que la selección de checkpoint por validación es ruidosa. Se trata, por tanto, de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en `google/gemma-3-12b-it` (multimodal, transformer) |
| Parametros totales | No disponible (el modelo base tiene 12B, pero el fine-tuning no especifica) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo se menciona safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (según tag) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer multimodal con capacidades de visión y lenguaje. El experimento aplica la receta **MM-UPT** (Multimodal Unsupervised Preference Training) usando **co-GRPO heterogéneo**, una variante de GRPO donde colaboran dos modelos de diferente arquitectura (InternVL 3.5 8B y Gemma 3 12B). El entrenamiento se ejecutó durante 481 pasos, y se publica el checkpoint final (`endpoint`) en lugar del mejor por validación, porque la señal de `eval_reward` sobre 150 preguntas de MathVista es demasiado ruidosa (una pregunta equivale a 0.67 puntos porcentuales). El autor documenta que el mejor checkpoint por validación se encontraba en el paso 320 con `eval_reward` 0.4474, pero esos pesos ya no existen.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La información disponible se limita a la configuración del experimento.

## Capacidades

- **Multimodalidad**: el modelo base Gemma 3 12B it acepta entradas de texto e imagen, por lo que el fine-tuning hereda esta capacidad, aunque no se especifica su alcance tras el entrenamiento.
- **Razonamiento matemático multimodal**: el entrenamiento se evaluó con MathVista, lo que sugiere que el objetivo era mejorar el razonamiento en problemas visuales y matemáticos.
- **Sin tool calling ni capacidades de agente**: no hay evidencia en la información de que se haya entrenado para function calling o uso de herramientas.
- **Idiomas**: no se indica qué idiomas soporta; el modelo base Gemma 3 es multilingüe, pero no se confirma tras el fine-tuning.

## Casos de uso

Dado que se trata de un experimento de investigación sin benchmarks publicados, los casos de uso son limitados y principalmente académicos:

- **Investigación en RL no supervisado multimodal**: el modelo sirve como punto de partida para analizar cómo se comporta co-GRPO heterogéneo en tareas de razonamiento visual, comparando con otros checkpoints del mismo experimento.
- **Análisis de la dinámica de entrenamiento**: el archivo `trainer_state_endpoint.json` permite estudiar la evolución de las recompensas y métricas paso a paso, útil para quienes investigan estabilidad en RL.
- **Reproducción de experimentos**: al publicar el checkpoint final y los logs, otros equipos pueden replicar el pipeline o usarlo como baseline en sus propios experimentos de MM-UPT.
- **Evaluación de la transferencia de habilidades**: se puede probar el modelo en otros benchmarks multimodales (p. ej., MMMU, VQA) para ver si el entrenamiento con MathVista generaliza.
- **Estudio de la colaboración entre modelos**: el nombre sugiere una interacción con InternVL 3.5 8B; aunque no se publican los pesos de ese modelo, el método puede analizarse desde la perspectiva del co-entrenamiento.
- **Depuración de pipelines de RL**: sirve como caso de prueba para herramientas de logging, selección de checkpoints y gestión de artefactos en entornos de entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una `eval_reward` de 0.4474 en el paso 320 sobre un subconjunto de 150 preguntas de MathVista, pero no se proporciona una tabla comparativa con otros modelos ni métricas estandarizadas (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar el dataset de archivo de experimentos para futuras actualizaciones.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 24.4 GB, lo que sugiere pesos en fp16 o bf16. Para inferencia en ese formato se necesitan al menos 24 GB de VRAM (p. ej., una RTX 3090, RTX 4090 o A100 40GB). Con cuantización (no disponible en el repo) se podría reducir.
- **GPU recomendadas**: A100 40GB, A100 80GB, H100, o GPUs de consumo con 24 GB o más.
- **¿Cabe en GPU de consumo?**: Sí, en una RTX 3090/4090 (24 GB) se puede cargar el modelo en fp16, aunque con overhead de memoria puede ser ajustado.
- **Opciones de despliegue**: al ser un modelo de investigación, no se proporcionan instrucciones específicas, pero al estar en formato safetensors puede cargarse con transformers, vLLM o TGI. No se incluyen pesos GGUF para llama.cpp/Ollama.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas de la misma categoría (experimentos de RL no supervisado multimodal). El único punto de referencia es el propio modelo base `google/gemma-3-12b-it`, cuyas especificaciones son conocidas (12B parámetros, contexto 128k, multimodal), pero no se han publicado métricas del fine-tuning que permitan una comparación cuantitativa. Se recomienda consultar el dataset de archivo de experimentos para ver resultados de otros métodos (p. ej., co-GRPO homogéneo, GRPO estándar) si el autor los publica.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay benchmarks que validen el rendimiento del modelo; el único dato es una `eval_reward` interna que el autor considera ruidosa.
- **Checkpoint no óptimo**: el modelo publicado es el final del entrenamiento, no el mejor por validación, por lo que puede tener rendimiento inferior a otros puntos intermedios.
- **Naturaleza experimental**: es un artefacto de investigación sin garantías de funcionamiento en tareas reales; no debe usarse en producción.
- **Sesgos del modelo base**: al ser un fine-tuning de Gemma 3 12B it, hereda los sesgos y limitaciones de ese modelo, que no se han mitigado en este experimento.
- **Riesgo de alucinación**: no se ha evaluado la fiabilidad factual tras el entrenamiento; el uso en contextos donde se requiera precisión es desaconsejable.
- **Idiomas y contexto**: no se especifican, por lo que no se puede garantizar un comportamiento multilingüe o de contexto largo.
- **Licencia**: aunque es Apache-2.0, el uso comercial de un modelo sin evaluación y con fines de investigación puede no ser adecuado sin validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q1716523669/mllm-cogrpo-heter-internvl35-8b-x-gemma3-12b-mmr1-mmupt-groupB-full
- Dataset de archivo de experimentos y logs: https://huggingface.co/datasets/q1716523669/mllm-mmr1-experiment-archive
