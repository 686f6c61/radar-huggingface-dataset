# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research, que implementa la técnica de "internalización de presupuesto" (*budget internalization*) descrita en el paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo es que el modelo aprenda a razonar de forma eficiente dentro de un presupuesto fijo de 1.024 tokens de generación, en lugar de depender de cadenas de razonamiento largas que aumenten el coste en tiempo de inferencia.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre tareas de Reasoning Gym, problemas de razonamiento generados proceduralmente con respuestas verificables en formato `\boxed{}`. Las respuestas que agotan el presupuesto reciben recompensa cero, lo que fuerza al modelo a internalizar el límite de tokens como parte de su política de razonamiento. El checkpoint publicado corresponde al paso 300 de entrenamiento, con el identificador de ejecución `petbadger`.

El modelo es relevante porque aborda un problema práctico de producción: los modelos de razonamiento suelen gastar muchos más tokens de los necesarios en tiempo de inferencia. Un modelo que razona de forma nativa dentro de un presupuesto fijo puede ofrecer una latencia y un coste predecibles sin sacrificar precisión en tareas de razonamiento acotadas. La arquitectura subyacente es Gemma 4 (no se detalla en la información disponible si es transformer denso o MoE) y el modelo base tiene 5.123.178.051 parámetros totales según los pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (base: google/gemma-4-E2B-it); detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 (5,12 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base; enlace a licencia de Gemma 4) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se ajusta con GRPO usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El presupuesto de generación se fija en `max_new_tokens = 1024`; las respuestas que alcanzan ese límite reciben recompensa cero, lo que penaliza explícitamente las cadenas de razonamiento que se extienden más allá del presupuesto. La recompensa proviene de un verificador de tareas de Reasoning Gym sobre la respuesta extraída del bloque `\boxed{}`.

Los datos de entrenamiento son problemas de razonamiento generados proceduralmente por Reasoning Gym, con un máximo de 3 épocas. El batch es de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. El entrenamiento totaliza 300 pasos. Los prompts se renderizan con la plantilla de chat del modelo base. No se dispone de información sobre la composición detallada del dataset, el número total de tokens de entrenamiento ni si hubo fases adicionales de alineación más allá del RL.

La innovación técnica principal es la internalización del presupuesto: en lugar de aplicar *test-time scaling* (generar más tokens para mejorar la precisión), el modelo aprende a distribuir su razonamiento dentro de un límite fijo, lo que reduce la latencia y el coste de inferencia a cambio de una posible pérdida de precisión en problemas que requieren razonamientos muy largos.

## Capacidades

- Generación de texto y razonamiento multi-paso dentro de un presupuesto fijo de 1.024 tokens de generación.
- Razonamiento verificable sobre tareas de Reasoning Gym (problemas procedurales con respuesta en `\boxed{}`).
- Entrada multimodal image-text-to-text y pipeline `any-to-any` heredados del modelo base Gemma 4.
- Modo de razonamiento con presupuesto interno: el modelo está entrenado para no agotar el límite de tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el entrenamiento se centra en razonamiento de un solo turno con verificación.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): heredadas potencialmente del modelo base, pero no documentadas en esta ficha.

## Casos de uso

- Razonamiento con latencia acotada en producción: el modelo está entrenado para responder dentro de 1.024 tokens, lo que permite presupuestar latencia y coste por petición en servicios de razonamiento automatizado.
- Verificación de problemas matemáticos y lógicos: adecuado para tareas de Reasoning Gym y problemas con respuesta extraíble en `\boxed{}`, como aritmética, álgebra básica y puzzles lógicos.
- Evaluación de técnicas de RLVR: útil como checkpoint de referencia para investigadores que estudien internalización de presupuesto y comparación con *test-time scaling*.
- Generación de razonamiento en entornos con límite de tokens: integrable en pipelines donde el coste por token es crítico y no se puede permitir cadenas de razonamiento largas.
- Investigación en eficiencia de inferencia: sirve para medir la relación entre precisión y presupuesto de tokens frente al modelo base sin ajuste.
- Prototipado de asistentes multimodales: al heredar el pipeline `any-to-any` de Gemma 4, puede usarse en experimentos de entrada imagen-texto, aunque las capacidades multimodales no están validadas tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de Reasoning Gym, ni comparaciones numéricas con el modelo base u otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos (5,12 mil millones de parámetros × 4 bytes), más overhead de activaciones y KV cache.
- En cuantización de 16 bits (no publicada, pero estimable): alrededor de 10,3 GB de pesos.
- En cuantización de 8 bits (no publicada): alrededor de 5,1 GB de pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para F32 sin cuantizar; RTX 4090 (24 GB) para F32 justo o para 16 bits con margen.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en F32 ajustado o en 16 bits; en GPUs de 16 GB probablemente solo con cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El presupuesto fijo de 1.024 tokens de generación acota el coste máximo por respuesta, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300 | 5,12 mil millones | no disponible | RL con presupuesto fijo de 1.024 tokens | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | 5,12 mil millones (según este repo) | no disponible | Modelo instructivo multimodal sin ajuste de presupuesto | Licencia Gemma 4 | Hugging Face |
| Alternativas de razonamiento con RLVR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El ajuste está especializado en tareas de Reasoning Gym; el rendimiento en dominios fuera de ese conjunto no está validado y podría degradarse respecto al modelo base.
- El presupuesto fijo de 1.024 tokens puede penalizar problemas que requieren razonamientos más largos, reduciendo la precisión frente a modelos con *test-time scaling*.
- No se documentan sesgos conocidos, pero al heredar el modelo base Gemma 4, arrastra los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: no cuantificado; el entrenamiento con verificador reduce respuestas incorrectas en tareas verificables, pero no elimina el riesgo en dominios abiertos.
- Idiomas soportados no documentados; el entrenamiento se realizó con prompts en el idioma de Reasoning Gym (presumiblemente inglés, no confirmado).
- Licencia Apache 2.0 heredada, con enlace a la licencia de Gemma 4; conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar en producción.
- Checkpoint único en el paso 300; no se publican curvas de entrenamiento ni checkpoints intermedios para evaluar la estabilidad del ajuste.
- Pesos en F32, lo que incrementa el tamaño del repositorio (20,5 GB) y los requisitos de memoria frente a versiones en 16 bits.
- No hay información sobre tool calling, agentes ni latencia medida, lo que limita la evaluación para despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-reasoninggym-petbadger-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia citada en la model card, sin enlace disponible
- Repositorio de Reasoning Gym: no disponible en la información proporcionada
- Organización JetBrains-Research en Hugging Face: https://huggingface.co/JetBrains-Research
