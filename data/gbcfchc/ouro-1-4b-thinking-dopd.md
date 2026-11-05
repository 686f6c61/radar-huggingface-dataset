# gbcfchc/Ouro-1.4B-Thinking-DOPD

## Resumen

Ouro-1.4B-Thinking-DOPD es un ajuste fino del modelo ByteDance/Ouro-1.4B-Thinking, publicado por el usuario gbcfchc como resultado final de un estudio sobre razonamiento matematico. Se trata de un modelo de lenguaje de aproximadamente 1.434 millones de parametros almacenados que emplea una arquitectura de transformer con capas recurrentes (looped-language-model): 24 capas fisicas que se reutilizan a traves de cuatro pasadas recurrentes nativas. El checkpoint parte del modelo base de ByteDance y aplica una receta de destilacion offline (Offline DOPD) usando como anclas dos modelos Qwen3-30B-A3B.

El modelo resuelve el problema del razonamiento matematico de alta dificultad en un presupuesto de parametros muy reducido. Segun la model card, alcanza un 67,29 % en AIME 2024 y un 63,13 % en AIME 2025 medidos como Avg@32 con un maximo de 32.768 tokens generados, lo que supone una mejora de 15,83 puntos porcentuales frente al checkpoint original de Ouro en la evaluacion Avg@8 emparejada.

Es relevante ahora porque demuestra que tecnicas de destilacion con anclas de modelos mucho mayores (30B-A3B) pueden transferir capacidad de razonamiento a un modelo de 1,4B con inferencia en cuatro pasadas, manteniendo licencia Apache 2.0 y pesos en safetensors BF16. El contexto de evaluacion es de 40.960 tokens y el modelo esta pensado principalmente para generacion de texto con razonamiento matematico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes (looped), 24 capas fisicas reutilizadas en 4 pasadas |
| Parametros totales | 1.434.652.673 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (configuracion de inferencia de la evaluacion) |
| Tipos de cuantizacion | BF16 nativo; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (exportacion nativa BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con 24 capas fisicas que se reutilizan en cuatro pasadas recurrentes nativas, con retropropagacion completa a traves de las cuatro pasadas. El checkpoint incluye los ficheros Python personalizados de Ouro y una puerta de salida temprana (early-exit gate) que permanece congelada; la configuracion por defecto selecciona cuatro bucles con `early_exit_threshold=1.0`. Solo la salida final aporta la distribucion de entrenamiento.

El entrenamiento parte de ByteDance/Ouro-1.4B-Thinking (revision 3aaa2224253a92ca45cf2e3d427c360e1ef9c93d) y utiliza anclas congeladas Qwen3-30B-A3B-Base (pre) y PromptCoT-2.0-SelfPlay-30B-A3B (post). Los datos consisten en 3.200 preguntas matematicas historicas con cuatro respuestas iniciales de Ouro por pregunta, totalizando 12.800 respuestas ordenadas, con un limite de rollout de 2.048 tokens y 1.152 de margen de prompt. La optimizacion consta de 200 actualizaciones con batch global 64, LR constante 1e-6, AdamW (betas 0.9/0.999), weight decay 0.01, clip norm 1 y semilla 1234, usando FSDP2 con parametros maestros FP32, forward BF16 y reduccion de gradientes FP32. La perdida DOPD combina las distribuciones de profesor pre/post con una distribucion de comportamiento Top16+OTHER fija y normaliza sobre los 49.152 logits nativos del estudiante frente a los 151.936 del vocabulario del profesor. La perdida de desarrollo paso de 0,52830355 a 0,17298338 (reduccion del 67,26 %).

## Capacidades

- Generacion de texto y razonamiento matematico de competicion (AIME, HMMT).
- Razonamiento multi-paso con cadenas de pensamiento largas (hasta 32.768 tokens generados).
- Modo thinking implicito mediante el bucle recurrente y la salida final.
- Generacion conversacional con plantilla de chat (aplicable via `apply_chat_template`).
- Inferencia nativa en cuatro pasadas recurrentes configurables.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de vision o audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento matematico: el modelo puede resolver problemas de competicion tipo AIME y HMMT con generacion larga (32.768 tokens), adecuado para reproducir pipelines de evaluacion estandarizados con `math_verify`.
- Investigacion sobre destilacion: sirve como checkpoint de referencia para estudiar la transferencia de capacidad desde anclas de 30B-A3B a un modelo de 1,4B con bucles recurrentes.
- Generacion de soluciones paso a paso: su ventana de contexto de 40.960 tokens permite incluir enunciados largos y desarrollos extensos en una sola pasada.
- Fine-tuning posterior: al estar en safetensors BF16 con licencia Apache 2.0, puede reentrenarse para dominios matematicos especificos (fisica, ingenieria) partiendo de este checkpoint.
- Despliegue en entornos con VRAM limitada: con 1,4B parametros en BF16 cabe en GPUs de consumo, lo que permite servir razonamiento matematico en local.
- Reproducibilidad de benchmarks: junto con el repositorio `looped-dev`, permite replicar exactamente las metricas Avg@32 con semillas y manifiestos documentados.
- Prototipado de asistentes de matematicas: integrable via vLLM con plantilla de chat para responder consultas con razonamiento extendido.

## Benchmarks y rendimiento

| Benchmark | Correctas / respuestas | Avg@32 | Max tokens generados |
|---|---:|---:|---:|
| AIME 2024 | 646 / 960 | 67,2917 % | 32.768 |
| AIME 2025 | 606 / 960 | 63,1250 % | 32.768 |
| HMMT febrero 2025 | 390 / 960 | 40,6250 % | 32.768 |

Cada benchmark usa 30 problemas y 32 respuestas con semilla individual por problema. Avg@32 es la correccion media por respuesta, no pass@32. En la comparacion Avg@8 emparejada, el Ouro original de cuatro bucles obtuvo 126/240 (52,50 %) y este checkpoint DOPD 164/240 (68,33 %), una ganancia de 15,83 puntos porcentuales. El checkpoint original no se evaluo a Avg@32 en este estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,9 GB de pesos mas overhead de KV cache y activaciones; con contexto de 40.960 tokens y `gpu_memory_utilization=0.75` la evaluacion se ejecuto en workers TP1.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM para BF16 con contexto moderado; para contexto completo de 40.960 tokens se recomienda 24 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 con contexto reducido; en consumer de gama alta (RTX 4090) con contexto completo.
- Opciones de despliegue: vLLM (version usada en la evaluacion: 0.25.1+cu129 V1), transformers con `trust_remote_code=True`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la evaluacion uso ocho workers TP1 independientes, 30 peticiones por worker, `max_num_batched_tokens=4096`, ejecucion eager y sin prefix caching.
- Entorno registrado: Python 3.12, PyTorch 2.11.0+cu129, Transformers 5.5.3 para inferencia; Transformers 4.57.6 y PyTorch 2.6.0+cu124 para entrenamiento y scoring en HF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2024 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Ouro-1.4B-Thinking-DOPD | 1,4B | 40.960 | 67,29 % (Avg@32) | Apache 2.0 | HuggingFace |
| ByteDance/Ouro-1.4B-Thinking | 1,4B | no disponible | 52,50 % (Avg@8) | no disponible en la informacion | HuggingFace |
| Qwen3-30B-A3B-Base (ancla) | 30B totales / 3B activos | no disponible | no disponible | no disponible en la informacion | HuggingFace |

La comparacion directa con el checkpoint original solo esta disponible a Avg@8 (52,50 % frente a 68,33 %), por lo que la cifra Avg@32 de este modelo no es directamente comparable con la del base. No se dispone de resultados de otras alternativas de 1,4B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en razonamiento matematico; su rendimiento en tareas generales de texto no esta documentado.
- Riesgo de alucinacion en problemas fuera del dominio matematico o con enunciados ambiguos; no se documentan mitigaciones.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingue adecuado.
- Requiere `trust_remote_code=True` y los ficheros Python personalizados de Ouro, lo que implica ejecutar codigo del repositorio.
- La evaluacion usa 30 problemas por benchmark; las metricas tienen alta varianza pese al Avg@32.
- No se documenta soporte de tool calling, agentes, vision ni audio.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base ByteDance/Ouro-1.4B-Thinking antes de uso comercial.
- El checkpoint corresponde a la actualizacion final (update200) de un estudio concreto; no se documentan otras variantes ni garantias de mantenimiento.
- La inferencia optima depende de vLLM 0.25.1+ y de la configuracion exacta de bucles (`total_ut_steps=4`, `early_exit_threshold=1.0`); otras configuraciones pueden degradar resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gbcfchc/Ouro-1.4B-Thinking-DOPD
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Repositorio de entrenamiento y evaluacion: https://github.com/gbcfchc/looped-dev
- Ancla pre: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Ancla post: https://huggingface.co/xl-zhao/PromptCoT-2.0-SelfPlay-30B-A3B
