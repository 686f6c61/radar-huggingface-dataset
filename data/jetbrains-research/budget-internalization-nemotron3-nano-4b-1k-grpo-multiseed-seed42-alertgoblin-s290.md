# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290

## Resumen

Este repositorio contiene un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado por JetBrains-Research como parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo es que el modelo aprenda a razonar matematicamente dentro de un presupuesto de generacion fijo de 1.024 tokens, internalizando ese limite en lugar de depender de estrategias de escalado en tiempo de inferencia.

El modelo parte de una arquitectura Nemotron-H (hibrida, con atencion y capas de estado) de aproximadamente 3.970 millones de parametros y se entrena con GRPO sobre el dataset de matematicas DeepScaleR-Preview, usando recompensa binaria de correccion de la respuesta extraida de etiquetas `\boxed{}`. Este checkpoint concreto corresponde al paso 290 de la semilla 42 (nombre interno `alertgoblin`), seleccionado como el mejor por precision de validacion dentro de una ablacion de tres semillas.

Su relevancia radica en que aborda un problema practico de produccion: los modelos de razonamiento suelen consumir presupuestos de tokens variables e impredecibles. Un modelo que mantiene su precision bajo un limite fijo de 1.024 tokens facilita la planificacion de costes, la latencia determinista y el despliegue en entornos con restricciones estrictas de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (hibrida; etiqueta `nemotron_h` en transformers, requiere `custom_code`) |
| Parametros totales | 3.973.556.832 (aproximadamente 3,97 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en F32 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License (`nvidia-nemotron-open-model-license`) |
| Formato de pesos | safetensors (dtype F32); tamano del repo 15,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base NVIDIA-Nemotron-3-Nano-4B-BF16, etiquetada como `nemotron_h` en la libreria transformers y que requiere `custom_code` para su carga. No se detallan en la informacion disponible la composicion exacta de capas, el mecanismo de atencion ni la longitud de contexto nativa del modelo base.

El ajuste se realiza con GRPO (con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token) sobre el dataset agentica-org/DeepScaleR-Preview-Dataset (matematicas), con un maximo de 3 epocas. La configuracion de entrenamiento incluye un presupuesto de generacion (`max_new_tokens`) de 1.024 tokens, batches de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento. Las respuestas que alcanzan el limite se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el presupuesto. La recompensa es binaria segun la correccion de la respuesta extraida de `\boxed{}`. El prompt de entrenamiento instruye a razonar paso a paso y emitir la respuesta en etiquetas `\boxed{}`.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso bajo un presupuesto fijo de 1.024 tokens de generacion.
- Resolucion de problemas matematicos con formato de respuesta en `\boxed{}`.
- Razonamiento con internalizacion de presupuesto: el modelo aprende a ajustar la longitud de su cadena de razonamiento al limite impuesto durante el entrenamiento.
- Conversacional: el repositorio declara la etiqueta `conversational` y se entrena con la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el entrenamiento se limita a matematicas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Resolucion de problemas matematicos en produccion con coste predecible: al estar entrenado con un presupuesto fijo de 1.024 tokens, permite estimar con exactitud el consumo maximo de tokens por consulta y planificar la capacidad de GPU en consecuencia.
- Evaluacion de investigacion sobre RLVR: sirve como checkpoint reproducible (semilla 42, paso 290) para estudiar como el aprendizaje por refuerzo con recompensa verificable afecta a la precision dentro de presupuesto frente al escalado en tiempo de inferencia.
- Generacion de soluciones matematicas en pipelines educativos: el formato `\boxed{}` facilita la extraccion automatica de la respuesta final para su correccion o comparacion.
- Ajuste fino posterior (fine-tuning) como base de razonamiento: al ser un modelo de aproximadamente 4B parametros, puede adaptarse a dominios especificos (fisica, ingenieria) manteniendo el comportamiento de presupuesto internalizado.
- Despliegue en entornos con latencia acotada: un limite de generacion fijo de 1.024 tokens reduce la varianza de latencia en comparacion con modelos de razonamiento de longitud libre.
- Ablaciones de semillas y recetas de RL: el repositorio forma parte de un conjunto de checkpoints (semillas 42, 43, 44 y pasos 240/290/300) util para comparar estabilidad del entrenamiento entre ejecuciones.
- Investigacion sobre truncamiento y puntuacion de respuestas: el diseno de recompensa (respuestas truncadas puntuadas tal cual) es un caso de estudio para analizar sesgos de longitud en RLVR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, y que el paso 290 es el mejor checkpoint de esta ejecucion por dicha metrica, pero no se proporcionan los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos publicados en F32 (aproximadamente 15,9 GB de pesos), la inferencia en F32 requiere del orden de 16 GB o mas solo para los pesos, mas memoria para el contexto y las activaciones. No se dispone de datos oficiales de VRAM para cuantizaciones.
- GPU recomendadas: para F32, GPUs con 24 GB o mas (por ejemplo RTX 4090, A100 40/80 GB, H100). Para cuantizaciones de 8 o 4 bits, serian viables GPUs consumer con 12-16 GB, aunque no se confirma soporte oficial de dichos formatos en la informacion disponible.
- Cabe en GPU consumer: si, en GPUs de 24 GB en F32 (RTX 3090/4090) y potencialmente en GPUs de menor memoria con cuantizacion, sujeto a verificacion.
- Opciones de despliegue: transformers (requiere `custom_code` y `trust_remote_code`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290) | 3,97 B | no disponible | GRPO sobre DeepScaleR, presupuesto 1.024 tokens | NVIDIA Nemotron Open Model License | Hugging Face (JetBrains-Research) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 3,97 B | no disponible | Modelo base, sin RL especifico de presupuesto | NVIDIA Nemotron Open Model License | Hugging Face (nvidia) |
| Checkpoints hermanos de la misma ablacion (seed 43 `greatray`, seed 44 `pickedguppy`) | 3,97 B | no disponible | Misma receta GRPO, distinta semilla | NVIDIA Nemotron Open Model License | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para razonamiento matematico; su comportamiento fuera de ese dominio no esta caracterizado.
- El presupuesto de 1.024 tokens es una restriccion de entrenamiento; respuestas que exceden el limite se truncan y pueden degradar la calidad si se usa con presupuestos distintos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de error ni calibracion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados no documentados; se desconoce el rendimiento en castellano.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus terminos para uso comercial, redistribucion y requisitos de atribucion antes de desplegar en produccion.
- Requiere `custom_code` y `trust_remote_code` en transformers, lo que implica ejecutar codigo del repositorio.
- Checkpoint seleccionado por precision de validacion en una unica ablacion de semillas; la varianza entre semillas no se cuantifica en la informacion disponible.
- El repositorio no incluye citacion (campo TODO) ni resultados de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint paso 300 (misma semilla): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Checkpoint semilla 43, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint semilla 44, paso 240: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
