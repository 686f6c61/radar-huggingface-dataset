# AlexHung29629/gemma4-26b-a4b-mopd-student-78steps

## Resumen

Gemma4-26B-A4B MOPD student es un checkpoint de investigación publicado por AlexHung29629 en Hugging Face. Se trata del estado del modelo estudiante tras 78 pasos de destilación on-policy multi-profesor (MOPD, *multi-teacher on-policy distillation*) con una ventaja de estilo REINFORCE y muestreo de importancia truncado ICE-POP. El punto de partida es un merge de LoRA sobre una variante de Gemma 4 de 26B, y el entrenamiento se realizó con NeMo-RL SingleController y NeMo-Gym dentro de un entorno de agente OpenClaw sobre tareas de PinchBench.

El modelo es multimodal de tipo image-text-to-text y cuenta con 25.233.141.790 parámetros reales según los pesos en safetensors. El nombre "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4B de parámetros activos, aunque la model card no detalla la configuración de expertos ni la longitud de contexto nativa. El contexto de rollout usado durante el entrenamiento fue de 131.072 tokens.

Su relevancia es acotada: no es un modelo listo para producción, sino un artefacto de experimentación que documenta una receta concreta de destilación on-policy aplicada a un agente multimodal. La curva de recompensa de entrenamiento muestra un deterioro en el segundo epoch (de 0,635 en el paso 1 a 0,451 en el paso 78), lo que lo convierte en material útil para estudiar inestabilidad en RL y destilación, más que como modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Gemma 4); configuración MoE no detallada en la model card |
| Parametros totales | 25.233.141.790 |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4B activos, sin confirmación en la model card) |
| Longitud de contexto | no disponible como especificación nativa; contexto de rollout durante entrenamiento: 131.072 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged`, un merge de LoRA sobre una variante Gemma 4 de 26B. Sobre esa inicialización se aplicó destilación on-policy multi-profesor (MOPD) con muestreo de tokens: dos profesores aportan logprobs sobre los tokens muestreados por el estudiante. Los profesores son `AlexHung29629/gemma4-26b-a4b-pinchbench-meeting02-96steps` (especializado en reuniones) y `JohnCheng/gemma-4-26b-ebft-sft-rl-st200` (general). La ventaja se calcula al estilo REINFORCE y el muestreo de importancia se trunca con ICE-POP (ratio 5,0, mínimo 0,2).

El entrenamiento se ejecutó en 8 nodos H100 (2 para rollout con vLLM, 4 para el estudiante en Megatron y 2 para los profesores), job SLURM 194842 del 20 de noviembre de 2026. Los datos son 1.261 prompts de entrenamiento de PinchBench (meeting_02 y general), con 32 prompts por paso, 1 rollout por prompt y 2 epochs, lo que da 78 pasos. Hiperparámetros: learning rate 1e-6 constante, weight decay 0,01, micro-batch empaquetado de 32.768 tokens, CP8/EP8 tanto en estudiante como en profesores, precisión bf16. La recompensa proviene de un juez PinchBench basado en gpt-5.4-mini con escala 0-1 sobre el split de entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de la base Gemma 4.
- Procesamiento de imagen y texto (pipeline image-text-to-text), orientado a tareas de agente que combinan capturas o documentos con instrucciones.
- Comportamiento de agente en entornos tipo OpenClaw, entrenado específicamente sobre tareas de PinchBench.
- Destilación orientada a tareas de reuniones (meeting_02) y generales, gracias al doble profesor.
- Soporte de tool calling: no confirmado explícitamente en la model card; el entrenamiento en entorno de agente sugiere uso de herramientas, pero no se documenta la interfaz.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Estudio de recetas de destilación on-policy: el checkpoint permite reproducir y analizar el efecto de MOPD con ICE-POP sobre un estudiante de 26B, comparando la curva de recompensa con la del run hermano de profesor merged.
- Investigación sobre inestabilidad en RL: la caída de recompensa de 0,635 a 0,451 entre los pasos 1 y 78 ofrece un caso concreto para estudiar deriva en el segundo epoch y ajustar schedules de learning rate o truncado de importancia.
- Evaluación de agentes multimodales en PinchBench: sirve como baseline para medir cuánto aporta la destilación frente a la inicialización LoRA merged en tareas de reuniones y generales.
- Prototipado de asistentes de reuniones: el profesor especializado en meeting_02 transfiere comportamiento útil para resumir, extraer acuerdos y responder preguntas sobre transcripciones, aunque el deterioro del reward aconseja validación previa.
- Comparación de profesores: al existir un run hermano con profesor merged, permite aislar el impacto de la elección de profesor en la calidad final del estudiante.
- Docencia y divulgación técnica: el repositorio incluye `runs/` con eventos de TensorBoard, `training_info.json` y `training_config.yaml`, útiles para explicar un pipeline completo de NeMo-RL con vLLM y Megatron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la recompensa media de entrenamiento del juez PinchBench:

| Paso | 1 | 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 78 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| train/total_reward/mean | 0,635 | 0,655 | 0,677 | 0,623 | 0,698 | 0,632 | 0,603 | 0,573 | 0,542 | 0,554 | 0,451 |

Media de los últimos 10 pasos: 0,540. El run hermano con inicialización de profesor merged alcanza 0,673 en la misma métrica.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 50 GB solo para pesos (25,2B parámetros × 2 bytes), más overhead de activaciones y caché KV; el repo ocupa 50,5 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16 sin cuantizar; el entrenamiento se realizó en 8×H100.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bf16. Sería necesario cuantizar a 4 bits (aproximadamente 13-15 GB de pesos) para intentarlo, pero no se publican pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers (librería declarada); vLLM se usó para el rollout durante el entrenamiento, por lo que es compatible en principio. llama.cpp, Ollama y TGI no están confirmados ni se ofrecen artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Gemma4-26B-A4B MOPD student (este) | 25,2B | 131.072 en rollout | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, reward en descenso |
| AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps | no disponible | no disponible | no disponible | Hugging Face | Run hermano con profesor merged, reward últimos 10 pasos 0,673 |
| AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged | no disponible | no disponible | no disponible | Hugging Face | Inicialización del estudiante (LoRA merged) |
| JohnCheng/gemma-4-26b-ebft-sft-rl-st200 | no disponible | no disponible | no disponible | Hugging Face | Profesor general usado en la destilación |

## Limitaciones y advertencias

- Checkpoint intermedio de investigación: 78 pasos sobre 1.261 prompts no constituyen un ajuste robusto; no debe tratarse como modelo final.
- Deterioro del reward: la recompensa media cae de 0,698 en el paso 32 a 0,451 en el paso 78, señal de sobreajuste o deriva en el segundo epoch. El run hermano con profesor merged es más estable.
- Sesgos: no documentados; al heredar la base Gemma 4 y entrenarse sobre un conjunto pequeño de tareas de reuniones, es probable un sesgo hacia ese dominio y formato.
- Alucinación: sin evaluaciones publicadas de fidelidad; el uso de un juez automático (gpt-5.4-mini) como única señal de recompensa no garantiza corrección factual.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar términos adicionales de Google que conviene verificar antes de producción.
- Sin cuantizaciones oficiales ni benchmarks públicos: el despliegue eficiente requiere trabajo adicional del usuario.
- Procedencia limitada: no hay paper ni blog asociado; la documentación se reduce a la model card y los ficheros de configuración del run.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexHung29629/gemma4-26b-a4b-mopd-student-78steps
- Modelo base (LoRA merged): https://huggingface.co/AlexHung29629/ebft_gemma4_26b_lora_lr5e6_merged
- Profesor especializado en reuniones: https://huggingface.co/AlexHung29629/gemma4-26b-a4b-pinchbench-meeting02-96steps
- Profesor general: https://huggingface.co/JohnCheng/gemma-4-26b-ebft-sft-rl-st200
- Run hermano con profesor merged: https://huggingface.co/AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps
- Paper, blog o repositorio adicional: no disponible
