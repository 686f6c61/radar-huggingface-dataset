# Axonry/wsp81-qwen3.5-0.8b

## Resumen

`Axonry/wsp81-qwen3.5-0.8b` es una edicion de solo pesos (*weight-only edit*) del modelo base `Qwen/Qwen3.5-0.8B`, publicada por el autor Axonry como reconstruccion de la submission ganadora del *Miner UID 56* en la subred 99 de Axonry, dentro del marco *WeightSpaceProgramming* (PR #81). No anade parametros nuevos ni introduce detectores en tiempo de inferencia: modifica 96 de los 488 tensores del checkpoint original en BF16 para alterar el comportamiento de razonamiento del modelo.

El objetivo concreto de la edicion es el control de la longitud del razonamiento en dos etapas: primero suprime el cierre prematuro del bloque de pensamiento mediante un delta de pesos derivado de RLOO con coeficiente negativo aplicado solo sobre tokens de alta entropia; despues introduce un "interruptor de cierre" sustituyendo hasta cuatro neuronas MLP de bajo uso por unidades condicionalmente activadas (`Wrap-up`, `BF`, `BX`) que elevan la probabilidad de emitir el token de fin de pensamiento y comenzar la respuesta en caja cuando el razonamiento ya es tardio.

El modelo conserva la arquitectura, tamano (873.438.784 parametros) y licencia Apache-2.0 del base, y se distribuye en formato `safetensors` para `transformers`. Su pipeline declarado es `image-text-to-text`, aunque la model card no detalla las capacidades multimodales mas alla de heredarlas del base. Es relevante como ejemplo de programacion en espacio de pesos aplicada a control de comportamiento sin reentrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible en la model card; la evaluacion uso contexto de servidor de 73.728 tokens y 32.768 tokens de generacion |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del base Qwen3.5-0.8B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La edicion no modifica la topologia del modelo base: mantiene los 488 tensores originales, de los cuales 96 se han reescrito en BF16 y verificado contra la cadena de edicion publicada. El proceso de edicion consta de dos fases. En la primera, se puntuan cuatro muestras por problema matematico con RLOO y se ajusta un delta de pesos de gradiente de politica unicamente sobre tokens de alta entropia, aplicado con coeficiente negativo para penalizar el cierre prematuro del razonamiento. En la segunda, se sustituyen hasta cuatro neuronas MLP de bajo uso por unidades condicionalmente disparadas (`Wrap-up`, `BF`, `BX`) que, ante un razonamiento ya avanzado (especialmente en un salto de linea), incrementan la probabilidad de emitir el token de fin de pensamiento y abrir la respuesta en caja.

No se especifican en la informacion disponible el numero de tokens de entrenamiento del base, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable es precisamente el enfoque de *weight-space programming*: control de comportamiento (longitud y cierre del razonamiento) mediante edicion quirurgica de pesos, sin parametros adicionales ni modulos de inferencia, y con verificacion tensor a tensor contra la submission original.

## Capacidades

- Generacion de texto y razonamiento con modo *thinking* explicito (`enable_thinking`) y modo por defecto sin pensamiento.
- Razonamiento matematico con respuestas en formato caja, con control de longitud del pensamiento gracias a la edicion.
- Capacidad multimodal de entrada imagen-texto segun el `pipeline_tag` declarado (heredada del base; sin detalles en la model card).
- Soporte de conversacion multi-turno (tag `conversational`).
- Evaluado en instrucciones estructuradas (IFStruct v1.0) con salida JSON/YAML sin restricciones.
- Evaluado en decisiones tipadas con probabilidades de etiqueta nativas (Typed Decisions).
- No realiza tool calls ni function calling: la model card indica explicitamente "no tool calls".
- No incorpora detector en tiempo de inferencia; el control de cierre es puramente parametrico.

## Casos de uso

- Razonamiento matematico con presupuesto controlado: el modelo mantiene el pensamiento hasta agotar la verificacion y cierra con respuesta en caja, lo que resulta util en pipelines de resolucion de problemas donde el cierre prematuro degrada la exactitud (GSM8K 84,03 % con 6.120 tokens medios de respuesta).
- Evaluacion comparativa de tecnicas de edicion de pesos: sirve como referencia reproducible para estudiar el efecto de deltas RLOO y sustitucion de neuronas MLP sobre el comportamiento de razonamiento, con digests y verificacion tensor a tensor publicados.
- Generacion de instrucciones estructuradas: su evaluacion en IFStruct v1.0 (16,85 %) permite integrarlo en tareas de produccion de JSON/YAML donde se requiera formato estricto, aunque con rendimiento limitado.
- Experimentacion en investigacion de alineacion: el par de control thinking/no-thinking con semillas identicas facilita medir el impacto del modo de razonamiento sobre exactitud en matematicas.
- Despliegue en hardware de consumo: con 873 M de parametros en BF16 (repo de 1,8 GB), cabe en GPUs consumer para prototipado e inferencia local.
- Clasificacion con probabilidades calibradas: la evaluacion Typed Decisions (accuracy 0,414, ECE 0,330) permite usarlo en tareas de decision con etiquetas donde se requiera distribucion de probabilidad, asumiendo la calibracion limitada.
- Base para ediciones posteriores: al ser una edicion de solo pesos sobre un base Apache-2.0, sirve como punto de partida para nuevas intervenciones en el espacio de pesos.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-22 con el checkpoint reconstruido en BF16, generacion en 8x RTX 5090 con vLLM 0.33.0 (8-way data parallel, contexto de servidor de 73.728 tokens). Valores en porcentaje salvo indicacion.

| Benchmark | Puntuacion | Tareas / muestras | Protocolo |
|---|---:|---|---|
| GSM8K | 84,034622 | 1.319 x 4 = 5.276 | 0-shot, prompt oficial HF Inspect y scorer `model_graded_fact` (juez = modelo evaluado), thinking on, T=0,6, top_p=0,95, top_k=20, presence 1,5, 32.768 tokens, pass@1 sobre 4 epocas |
| MMLU-Pro | 47,007979 | 12.032 x 1 | Test completo, zero-shot, Inspect `multiple_choice` + `choice` |
| GPQA Diamond | 34,722222 | 198 x 4 = 792 | Gated `Idavidrein/gpqa`, config `gpqa_diamond`, prompt Inspect, scorer nativo `choice`, thinking on, T=0,6, pass@1 sobre 4 muestras (275/792) |
| IFBench | 35,000000 | 300 x 1 | 300 prompts held-out oficiales, `prompt_level_loose`, thinking on, T=0 |
| IFStruct v1.0 | 16,850000 | 2.000 x 1 | Cliente nativo del autor, JSON/YAML sin restricciones, T=0, 16.000 tokens, sin thinking |
| Typed Decisions | accuracy 0,414000; KL 1,22394048 nats; Brier 0,46348944; ECE 0,33047390 | 400 casos / 2.000 decisiones | Probabilidades de etiqueta nativas, cuatro metricas |
| AIME 2026 | 4,791667 | 30 x 16 = 480 | Prompt y grading MathArena, muestreo Qwen3.5-0.8B (T=1,0, top_p=0,95, top_k=20, presence 1,5, 65.500 tokens), thinking explicito, avg@16 |
| HMMT February 2026 | 5,113636 | 33 x 16 = 528 | Igual que AIME 2026 |
| LEXam (cuatro opciones) | 32,809668 | 1.655 x 1 | `mcq_4_choices/test`, scorer Inspect choice, thinking on, T=0,6 |

Control pareado thinking / no-thinking (mismas preguntas, semillas y parametros de muestreo; solo cambia `enable_thinking`):

| Benchmark | Thinking | Por defecto (sin thinking) | Delta |
|---|---:|---:|---:|
| AIME 2026 | 4,791667 % | 0,416667 % (2/480) | -4,375 pp |
| HMMT Feb 2026 | 5,113636 % | 0,946970 % (5/528) | -4,167 pp |

Advertencias de evaluacion declaradas por el autor: GSM8K es autojuzgado (con denominador estricto que cuenta los 218 veredictos no puntuables como erroneos, el resultado baja a 80,67 %, 4.256/5.276); no hubo truncamiento en GSM8K (longitud media de respuesta 6.120 tokens); GPQA Diamond sigue la definicion de tarea del dataset con `epochs: 4`, pero sirvio las opciones en el orden del CSV sin permutar (`shuffle_choices: true` no aplicado), por lo que no se controla el sesgo de posicion; los resultados no estan verificados por Hugging Face y son `community` autodeclarados.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,8 GB de pesos mas overhead de activaciones y KV cache; en la practica, 4-6 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits, unos 0,5 GB (cuantizacion no publicada por el autor, requiere conversion propia).
- GPU recomendadas: el autor evaluo con 8x RTX 5090 para generacion y una GPU dedicada para Typed Decisions; para inferencia individual basta una RTX 3060/4060 o superior.
- Cabe en GPU consumer: si, en cualquier GPU con 6 GB o mas en BF16 para contextos moderados.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM 0.33.0 (usado en la evaluacion), y conversion posible a GGUF para llama.cpp/Ollama (no publicada).
- Latencia y throughput: no disponibles; la evaluacion uso 8-way data parallel con contexto de servidor de 73.728 tokens, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axonry/wsp81-qwen3.5-0.8b | 873 M | no disponible (evaluado a 32.768 tokens) | GSM8K 84,03 %; MMLU-Pro 47,01 %; GPQA Diamond 34,72 % | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | Sin cifras publicadas en esta informacion; el autor indica que el base agota frecuentemente el presupuesto en modo thinking | Apache-2.0 | Hugging Face |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de la misma categoria en la informacion proporcionada; la unica comparacion directa posible es con el modelo base, del que solo se conoce cualitativamente que tiende a agotar el presupuesto de pensamiento.

## Limitaciones y advertencias

- La edicion es de solo pesos y no incluye detector ni tool calls; cualquier comportamiento de control depende exclusivamente de los tensores modificados.
- GSM8K esta autojuzgado por el propio modelo; con denominador estricto la puntuacion cae a 80,67 %, por lo que el 84,03 % debe interpretarse con cautela.
- GPQA Diamond no controla el sesgo de posicion de opciones (sin `shuffle_choices`), lo que puede inflar o desviar el resultado.
- Los resultados son autodeclarados (`community`) y no estan verificados por Hugging Face.
- Rendimiento bajo en tareas de instrucciones estructuradas (IFStruct 16,85 %) y en matematicas de competicion (AIME 2026 4,79 %, HMMT 5,11 %), lo que limita su uso en escenarios de alta exigencia.
- Calibracion limitada en decisiones tipadas (ECE 0,330), con probabilidades poco fiables para umbrales estrictos.
- El modo sin thinking degrada drasticamente el rendimiento matematico (AIME 2026: 0,42 % frente a 4,79 %), por lo que el modo de razonamiento debe activarse explicitamente en produccion.
- No se declaran idiomas soportados ni sesgos conocidos; al heredar del base Qwen3.5-0.8B, arrastra los sesgos y limitaciones de este, no documentados en la model card.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento editado recae en el desplegador.
- El repositorio tiene 46 descargas y 1 like, con ecosistema de validacion muy limitado; no hay garantias de reproducibilidad fuera de la cadena de edicion publicada.
- La fecha de creacion (2026-11-22) y el modelo base Qwen3.5-0.8B deben verificarse contra el estado actual del ecosistema antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Axonry/wsp81-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Pull request de la submission: https://github.com/AxOrganization/WeightSpaceProgramming/pull/81
- Resultados de evaluacion (`.eval_results/`): https://huggingface.co/Axonry/wsp81-qwen3.5-0.8b/tree/main/.eval_results
