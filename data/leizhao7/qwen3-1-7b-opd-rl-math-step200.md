# leizhao7/Qwen3-1.7B-OPD-RL-Math-Step200

## Resumen

Qwen3-1.7B-OPD-RL-Math-Step200 es un checkpoint de investigación publicado por Lei Zhao (usuario `leizhao7`) que aplica destilación on-policy (OPD) sobre el modelo base Qwen/Qwen3-1.7B. El modelo es el estudiante final tras 200 actualizaciones de OPD, supervisado por un profesor fijo, Qwen3-4B-Non-Thinking-RL-Math-Step500, con el objetivo de mejorar el razonamiento matemático. Forma parte del trabajo «Why On-Policy Distillation Sometimes Fails: Vanishing Learning Signals» (arXiv:2610.11247), que estudia por qué la destilación on-policy puede dejar de aportar señal de aprendizaje.

El modelo conserva la arquitectura transformer densa de Qwen3-1.7B, con 2.031.739.904 parámetros totales y pesos en safetensors (repo de 4,1 GB). Está especializado en matemáticas y entrenado sobre el dataset BytedTsinghua-SIA/DAPO-Math-17k, usando la plantilla de chat de Qwen3 en modo no-thinking (`enable_thinking=False`). Su relevancia es doble: por un lado, ofrece un estudiante de 1.7B con mejoras medibles en benchmarks matemáticos; por otro, sirve como artefacto reproducible para estudiar la dinámica de la destilación on-policy.

La licencia es Apache-2.0, heredada del modelo base, y el autor exige preservar la atribución upstream e indicar que los pesos fueron modificados mediante 200 actualizaciones de OPD. Es un checkpoint de investigación, no un modelo de propósito general validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa prompts de hasta 1024 tokens y respuestas de hasta 7168 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles (`en` segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 2.031.739.904 parametros, y se afina mediante destilacion on-policy con un profesor fijo de 4B (Qwen3-4B-Non-Thinking-RL-Math-Step500). El objetivo es una KL inversa aproximada sobre los 16 tokens mas probables del estudiante, con pesos basados en la probabilidad del estudiante y media global sobre los tokens validos de la respuesta. Las respuestas generadas por el propio estudiante proporcionan los prefijos que el profesor supervisa, lo que constituye el nucleo del esquema on-policy.

Los datos de entrenamiento provienen de BytedTsinghua-SIA/DAPO-Math-17k, con el preprocesado de prompts matematicos descrito en el paper. La configuracion usa AdamW con learning rate 1e-6 y schedule constante, batch de 64 prompts con un rollout por prompt, maximo de 1024 tokens de prompt y 7168 de respuesta, temperatura de muestreo 1.0 y 200 pasos de actualizacion. Se emplea la plantilla de chat de Qwen3 en modo no-thinking. El paper asociado investiga la desaparicion de la senal de aprendizaje en la destilacion on-policy; la perdida top-16 registrada al final es 0.11760025, una reduccion del 55,4 % respecto a la actualizacion 1. No se documentan fases de RLHF o DPO adicionales en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat de Qwen3.
- Razonamiento matematico: el objetivo central del entrenamiento, con mejora medida en AIME24, AIME25 y AMC23.
- Resolucion de problemas matematicos de competicion en modo no-thinking (sin cadena de pensamiento explicita).
- Generacion de codigo basica, heredada del modelo base Qwen3-1.7B (el autor advierte que puede producir respuestas o codigo incorrectos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking: el checkpoint se entrena y evalua con `enable_thinking=False`; no se documenta soporte del modo thinking.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre destilacion on-policy: el checkpoint permite reproducir y analizar la evolucion de la senal de aprendizaje frente al profesor de 4B, comparando la perdida top-16 y las metricas avg@8 a lo largo de los 200 pasos.
- Evaluacion de estudiantes pequenos en matematicas: util para medir cuanto de la capacidad de un profesor de 4B se transfiere a un estudiante de 1.7B en tareas tipo AIME/AMC, con protocolo avg@8 y temperatura 0.7/top-p 0.95.
- Generacion de soluciones matematicas en entornos de bajo presupuesto: al ser un modelo de 1.7B, puede desplegarse en una unica GPU consumer para generar respuestas a problemas aritmeticos y algebraicos en ingles.
- Baseline en experimentos de distillation: sirve como punto de comparacion fijo (step 200) para nuevas variantes de OPD, cambios de profesor o schedules de learning rate.
- Docencia y divulgacion: ejemplo practico de como se aplica una KL inversa top-16 con prefijos generados por el estudiante y supervision de un profesor fijo.
- Filtrado o pre-anotacion de datasets matematicos: el modelo puede usarse para generar candidatos de solucion que luego se validan con un verificador simbolico o un modelo mayor.

## Benchmarks y rendimiento

Resultados archivados del paper, accuracy avg@8 (media de acierto de respuestas muestreadas, promediada macro sobre los tres benchmarks), longitud maxima de validacion 31744 tokens, temperatura 0.7 y top-p 0.95:

| Benchmark | Step-200 avg@8 (%) |
|---|---:|
| AIME24 | 35,42 |
| AIME25 | 26,67 |
| AMC23 | 69,73 |
| Media macro | 43,94 |

El estudiante inicial obtuvo 21,10 % de media macro; el checkpoint step-200 alcanza 43,94 %, una mejora de +22,83 puntos porcentuales. El autor advierte que estas metricas son del run archivado del paper y que el checkpoint exportado no ha sido reevaluado de forma independiente durante el empaquetado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del numero de parametros; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti son suficientes para inferencia en BF16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en BF16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (version 4.56.2 o compatible), text-generation-inference (tag `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-OPD-RL-Math-Step200 | 2,03B | No disponible | Matematicas (destilado de un profesor de 4B) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B | 2,03B | No disponible en la informacion proporcionada | Proposito general | Apache-2.0 | HuggingFace |
| Qwen3-4B-Non-Thinking-RL-Math-Step500 (profesor) | 4B (aproximado) | No disponible | Matematicas (RL) | No disponible en la informacion proporcionada | HuggingFace (Keven16) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | No disponible en la informacion proporcionada | Razonamiento matematico destilado | MIT (segun su model card publica) | HuggingFace |

La comparacion directa de rendimiento con DeepSeek-R1-Distill-Qwen-1.5B no esta disponible en la informacion proporcionada; el unico punto de referencia numerico publicado es el del propio paper (21,10 % inicial frente a 43,94 % final en la media macro de AIME24/AIME25/AMC23).

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor lo describe explicitamente como artefacto para reproducir y estudiar OPD, no como modelo de proposito general.
- Un solo run por condicion y horizonte fijo de 200 actualizaciones: los resultados no establecen rendimiento general, seguridad ni que la meseta de perdida persista en otras configuraciones.
- Riesgo de alucinacion y errores: el modelo conserva las limitaciones del estudiante inicial y puede producir respuestas o codigo incorrectos.
- Idiomas: solo ingles segun la model card; no se documenta soporte multilingue.
- Modo thinking desactivado: entrenado y evaluado con `enable_thinking=False`; no se garantiza el comportamiento en modo thinking.
- Metricas no reevaluadas: las cifras del step-200 son del run archivado del paper y el checkpoint exportado no ha sido reevaluado de forma independiente durante el empaquetado.
- Perdida registrada: el valor 0.11760025 corresponde a la perdida surrogate top-16, no a la KL completa sobre todo el vocabulario.
- Licencia: Apache-2.0 permite uso comercial, pero debe preservarse la atribucion upstream de Qwen y declararse que los pesos fueron modificados por 200 actualizaciones de OPD; el codigo del repositorio del paper tiene licencia MIT separada.
- Pesos del profesor no incluidos: el repo solo contiene el estudiante destilado.
- Sin datos publicados sobre sesgos especificos, tool calling, agentes o cuantizaciones oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leizhao7/Qwen3-1.7B-OPD-RL-Math-Step200
- Paper: https://arxiv.org/abs/2610.11247
- Pagina del proyecto: https://leizhao7.github.io/opd-learning-signals/
- Codigo y resultados numericos: https://github.com/leizhao7/opd-learning-signals
- Mapa de experimentos: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/EXPERIMENTS.md
- Notas de reproducibilidad: https://github.com/leizhao7/opd-learning-signals/blob/main/docs/REPRODUCIBILITY.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor (referencia publica): https://huggingface.co/Keven16/Qwen3-4B-Non-Thinking-RL-Math-Step500
- Dataset: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
