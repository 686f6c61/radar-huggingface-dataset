# hyu-nlp-eva4/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric

## Resumen

El modelo `20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-4B-Instruct-2507, desarrollado por el equipo hyu-nlp-eva4 (Hanyang University). Se trata de un checkpoint intermedio de un experimento de entrenamiento con aprendizaje por refuerzo (reinforcement learning, concretamente GRPO según los enlaces de métricas) orientado a la evaluación y optimización en el dominio de HealthBench, un conjunto de referencia para evaluar respuestas de modelos en contextos sanitarios.

El modelo no es un lanzamiento de producción ni un modelo generalista: es un artefacto de investigación que documenta la continuación de un experimento de entrenamiento hasta un total de 560 pasos. La model card indica que cada checkpoint se publica como un export BF16 listo para inferencia en formato Hugging Face, conservando el estado del optimizador, dataloader, RNG y trainer localmente para poder reanudar el entrenamiento. El repositorio original (eva3) agotó su cuota de almacenamiento público, por lo que este repositorio aloja los checkpoints pendientes y futuros a partir del paso 301.

Por su naturaleza, se trata de un modelo de 4 mil millones de parámetros, derivado de la familia Qwen3, con licencia no especificada en la información disponible y sin datos publicados sobre benchmarks, idiomas o composición del dataset de entrenamiento. Su relevancia es fundamentalmente metodológica: sirve como referencia para estudiar la dinámica de entrenamiento con RL sobre tareas de evaluación sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507); detalles específicos de la arquitectura base no disponibles en la información proporcionada |
| Parametros totales | 4 mil millones (heredados del modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (export BF16 listo para inferencia en formato Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer de 4 mil millones de parámetros. Sobre esta base se ha aplicado un proceso de ajuste fino con aprendizaje por refuerzo, según las etiquetas del repositorio (`reinforcement-learning`) y el enlace a métricas de entrenamiento en Weights & Biases bajo el proyecto `verl_grpo_general`, lo que sugiere el uso de GRPO (Group Relative Policy Optimization) mediante la librería verl. El entrenamiento se ha prolongado hasta un total de 560 pasos, y este repositorio contiene los checkpoints a partir del paso 301 (el primero ausente en el repositorio original).

La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo fases adicionales de RLHF o DPO más allá del proceso de RL descrito. Tampoco se especifican innovaciones técnicas particulares (decodificación especulativa, atención lineal, etc.). La información disponible se limita a la naturaleza del experimento (HealthBench, "whole-rubric", es decir, evaluación con rúbrica completa) y al hecho de que cada checkpoint es un export BF16 listo para inferencia, con el estado de entrenamiento conservado localmente para su reanudación.

## Capacidades

- Generación de texto: hereda las capacidades de generación del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta en contextos sanitarios: el ajuste con RL sobre HealthBench está orientado a mejorar la calidad de respuestas evaluadas con rúbricas clínicas.
- Modo instructivo: el modelo base es de tipo Instruct, por lo que se espera soporte de instrucciones y conversación multi-turno.
- Tool calling / function calling: no confirmado en la información disponible (el modelo base Qwen3-4B-Instruct-2507 lo soporta según su propia documentación, pero no se verifica en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a dominios sanitarios: el checkpoint permite reproducir y analizar la evolución del entrenamiento GRPO sobre HealthBench paso a paso, comparando checkpoints intermedios (301 a 560) para estudiar la dinámica de convergencia.
- Evaluación de rúbricas clínicas: dado que el experimento se denomina "whole-rubric", el modelo puede emplearse para generar respuestas que luego se puntúan con rúbricas completas de HealthBench, sirviendo como sujeto de evaluación en pipelines de benchmarking sanitario.
- Reproducibilidad de experimentos: al conservarse el estado del optimizador, dataloader, RNG y trainer, el checkpoint es útil para reanudar entrenamientos y verificar resultados en entornos de investigación.
- Estudio de la degradación o mejora de capacidades generales tras RL especializado: permite comparar el rendimiento del modelo base frente a los checkpoints ajustados en tareas fuera del dominio sanitario para detectar olvido catastrófico.
- Generación de respuestas de referencia en entornos simulados de consulta sanitaria: con las debidas advertencias, puede usarse para prototipar sistemas de preguntas y respuestas médicas en fase de investigación, no en producción clínica.
- Análisis de sesgos y alucinaciones en modelos ajustados con RL: al disponer de múltiples checkpoints, es posible trazar cómo evolucionan los sesgos y las alucinaciones a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4 mil millones de parámetros en BF16, se estiman aproximadamente 8 GB de VRAM solo para los pesos; con overhead de activaciones y caché KV, se recomienda al menos 10-12 GB para contexto moderado.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16; en GPUs con 12-16 GB sería necesario cuantizar (aunque no se documentan cuantizaciones oficiales para este checkpoint).
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI o llama.cpp si se generan conversiones GGUF (no disponibles oficialmente en la información proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (hyu-nlp-eva4) | 4B | no disponible | no disponible | Hugging Face (repo de investigación) | Checkpoint intermedio de RL sobre HealthBench |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | según Qwen (no verificada aquí) | Hugging Face | Modelo base instructivo generalista |
| hyunlp-evateam3/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric | 4B | no disponible | no disponible | Hugging Face | Repositorio original del mismo experimento (checkpoints hasta el paso 300) |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no es un lanzamiento de producción; se trata de un checkpoint intermedio de un experimento de RL, sin validación externa publicada.
- Licencia no especificada: no se indica licencia en la información disponible, por lo que el uso comercial no está autorizado de forma explícita y requiere consulta al autor.
- Idiomas no especificados: no se documenta qué idiomas soporta el ajuste, más allá de lo heredado del modelo base.
- Riesgo de alucinación: especialmente relevante en dominio sanitario; no debe usarse para consejo médico real sin supervisión experta.
- Sesgos: no documentados en la información disponible; el ajuste sobre HealthBench puede introducir sesgos específicos del dataset de evaluación.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste.
- Uso clínico: no apto para aplicaciones médicas en producción; cualquier uso en salud debe tratarse como prototipo de investigación.
- Estado del entrenamiento: al ser un checkpoint intermedio (paso 560 de un experimento en curso), su rendimiento puede no ser el óptimo del experimento.

## Enlaces

- Hugging Face: https://huggingface.co/hyu-nlp-eva4/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric
- Repositorio original (eva3): https://huggingface.co/hyunlp-evateam3/20261026_healthbench_static_qwen3-4b_impl-ruscarl_s1_whole_rubric
- Colección de checkpoints compartidos: https://huggingface.co/collections/hyunlp-evateam3/20261026-healthbench-qwen3-4b-whole-rubric-checkpoints-6ae19512c149d013c65d050a
- Métricas de entrenamiento en vivo (Weights & Biases): https://forge.coreweave.com/wandb/gabeenkim-hanyang-university/verl_grpo_general/runs/cmh90qwm
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
