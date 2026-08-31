# sandeep123/aops-grpo-vanilla-step100

## Resumen

`sandeep123/aops-grpo-vanilla-step100` es un checkpoint de investigacion entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`, publicado por el usuario Kumar (sandeep123) en Hugging Face. Forma parte de un estudio sistematico de baselines de RL para razonamiento, y fue seleccionado como el mejor checkpoint en validacion por pass@6 para su rama experimental (rank 1). A pesar del nombre "aops", la configuracion declarada en la model card indica que el entrenamiento se realizo sobre el dataset ScienceQA (`scienceqa_boxfix`), con una ambiguedad en el propio README que menciona tambien el subconjunto olimpico de NuminaMath-1.5.

El modelo tiene 1.777.088.000 parametros (~1,78B), es denso (no MoE), y fue entrenado con texto crudo sin plantilla de chat. La advertencia principal es critica: aplicar la plantilla de chat de Qwen2.5-Math en inferencia provoca una degradacion de aproximadamente 19 puntos de pass@1 en tareas hermanas. Sus metricas de validacion en ScienceQA son pass@1 de 0,2259 y pass@6 de 0,4336 en el paso 100. Es un artefacto de investigacion con 0 descargas, pensado para comparar metodologias de RL, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 1.536 tokens efectivos (512 prompt + 1.024 respuesta en entrenamiento); el base Qwen2.5-Math-1.5B soporta 32K |
| Tipos de cuantizacion | bfloat16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible; el base Qwen2.5-Math soporta principalmente ingles y chino; el fine-tuning se hizo sobre ScienceQA (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only denso de la familia Qwen2.5 especializado en matematicas. Sobre esta base se aplico GRPO con el framework verl, con una configuracion que incluye entropy_coeff=0, clip PPO simetrico de 0,2 y temperatura de rollout de 1,0. El entrenamiento se realizo sobre ScienceQA (`scienceqa_boxfix`) con 25 epocas y 1.250 pasos, batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, penalizacion KL in-reward de 0,01 y recompensa de formato fija de 0,03 sin decaimiento. Un aspecto distintivo es que se entrenó sobre texto crudo (raw prompt text) con `apply_chat_template=False`, por lo que la inferencia debe hacerse con la entrada directa sin plantilla de chat para evitar un desajuste train/eval de ~19 puntos de pass@1. La extraccion de respuestas se pre-registro como el contenido del ultimo `\boxed{}`, o en su ausencia el ultimo token A-E; las respuestas sin respuesta extraible se puntuan como incorrectas.

## Capacidades

- Razonamiento matematico en problemas de opcion multiple de ScienceQA, con respuestas en formato `\boxed{}` para extraccion automatica.
- Generacion de texto autoregresivo en ingles para dominios cientificos y matematicos.
- Soporte de decodificacion con multiples rollouts (K=6) a temperatura 1,0 para evaluacion de pass@k.
- No soporta tool calling ni function calling (modelo de 1,5B, sin entrenamiento especifico).
- No dispone de capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues no documentadas; el entrenamiento y la evaluacion se limitan a ScienceQA en ingles.

## Casos de uso

- Investigacion en RL para razonamiento: sirve como baseline de GRPO "vanilla" para comparar contra variantes con coeficientes de entropia, clipping asimetrico o temperaturas de rollout diferentes.
- Estudio del efecto de la plantilla de chat: el desajuste documentado de ~19 puntos de pass@1 permite cuantificar el impacto de aplicar chat templates en modelos entrenados con texto crudo.
- Analisis de seleccion de checkpoints: este modelo es el mejor en pass@6 (step 100), mientras que el mejor pass@1 se situa en steps 1000-1200; util para estudiar la relacion entre calidad y diversidad en RL.
- Evaluacion de extraccion de respuestas: el protocolo pre-registrado con `\boxed{}` y tokens A-E es reutilizable como referencia metodologica.
- Comparacion de frameworks: al usar verl con configuracion reproducible (seed 42, temperatura fijada), permite contrastar implementaciones de GRPO.
- Reproduccion de experimentos: con los hiperparametros publicados (LR, KL, format reward, batch, K) se puede replicar el entrenamiento completo en 1.250 pasos sobre una GPU consumer.

## Benchmarks y rendimiento

Metricas de validacion publicadas en la model card para este checkpoint (paso 100), sobre 256 prompts held-out de ScienceQA con K=6, temperatura 1,0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0,2259 |
| pass@6 | 0,4336 |

No se han publicado resultados en benchmarks estandar externos (MMLU, GSM8K, HumanEval) en la informacion disponible. La evaluacion se limita a ScienceQA en formato de opcion multiple con extraccion de respuesta pre-registrada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~3,6 GB para los pesos (1,78B parametros x 2 bytes), mas memoria para KV cache y activaciones; con contexto de 1.536 tokens cabria en ~6-8 GB VRAM totales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM, como RTX 3060 (12 GB), RTX 4070, RTX 4080, RTX 4090; tambien A100 o H100 para evaluaciones con K=6 rollouts simultaneos.
- Cabe en GPU consumer sin problema; incluso en tarjetas de 6 GB con cuantizacion adicional (no documentada) o limitando el batch de rollouts.
- Opciones de despliegue: vLLM (usado en el ejemplo de la model card), llama.cpp si se convierte a GGUF, Ollama, TGI.
- Latencia y throughput: no disponibles; con 1,5B de parametros en bfloat16 sobre una RTX 4090 se espera decodificacion del orden de 100-200 tokens/s, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sandeep123/aops-grpo-vanilla-step100 | 1,78B | 1.536 (efectivo) | 0,2259 | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Math-1.5B (base, sin RL) | 1,78B | 32K | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,78B | 32K | no disponible | Apache 2.0 | Hugging Face |
| sandeep123/sqa-grpo-vanilla-step900 | 1,78B | 1.536 | no publicado en la busqueda | Apache 2.0 | Hugging Face |

El checkpoint de paso 900 de la misma serie (sqa-grpo-vanilla-step900) es el comparador mas directo dentro del estudio, aunque sus metricas no estan disponibles en la informacion recopilada. La comparacion con el base sin RL es la mas relevante para medir el efecto del entrenamiento GRPO, pero no se publican datos del base en ScienceQA.

## Limitaciones y advertencias

- No aplicar plantilla de chat en inferencia: el modelo se entreno con texto crudo y aplicar el chat template de Qwen2.5-Math degrada pass@1 en ~19 puntos en tareas hermanas; usar siempre la entrada como string directo.
- Ambiguedad en la model card: el nombre "aops" sugiere entrenamiento en el subconjunto olimpico de NuminaMath-1.5, pero la tabla de configuracion declara ScienceQA (`scienceqa_boxfix`) como dataset; no esta claro cual es el dato correcto.
- Modelo pequeno (1,5B) con capacidades limitadas de razonamiento complejo; no apto para tareas generales de agente o codigo.
- Evaluacion restringida a ScienceQA con extraccion de respuestas pre-registrada; las metricas no son comparables con benchmarks estandar sin el mismo protocolo.
- Contexto efectivo limitado a 1.536 tokens, muy por debajo de los 32K del modelo base; prompts largos pueden fallar.
- Artefacto de investigacion con 0 descargas y 0 likes; no hay evidencia de validacion independiente ni soporte de mantenimiento.
- Riesgo de alucinacion en respuestas sin `\boxed{}`: el protocolo puntua como incorrectas las respuestas sin respuesta extraible, lo que puede enmascarar generaciones parcialmente correctas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-Math (tambien Apache 2.0), sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-grpo-vanilla-step100
- Perfil del autor: https://huggingface.co/sandeep123/
- Checkpoint hermano (sqa-grpo-vanilla-step900): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step900
- Modelo base (Qwen2.5-Math-1.5B): https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Framework verl (referenciado en la model card): no se encontro enlace directo en la informacion disponible
