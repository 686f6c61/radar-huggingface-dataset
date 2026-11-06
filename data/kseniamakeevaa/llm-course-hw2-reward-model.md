# kseniamakeevaa/llm-course-hw2-reward-model

## Resumen

El modelo `kseniamakeevaa/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) construido a partir de SmolLM-135M-Instruct, un transformer decoder de 135 millones de parametros desarrollado por HuggingFaceTB. Lo publica la usuaria kseniamakeevaa como trabajo de curso (tags `coursework`, `rlhf`) y su funcion no es generar texto, sino emitir una puntuacion escalar que indique la preferencia entre dos respuestas a una misma instruccion.

El modelo resuelve el problema de asignar recompensas en pipelines de RLHF, concretamente para alimentar un entrenamiento PPO. Se entreno sobre el dataset Human-Like-DPO-Dataset, que contiene pares `chosen`/`rejected`, y la unica parte entrenada fue la capa lineal `score.weight`; el resto de los pesos de SmolLM permanecio congelado. Esto lo convierte en un ejercicio de bajo coste computacional: 612 pasos de entrenamiento en una unica NVIDIA T4 de Google Colab.

Es relevante ahora como ejemplo minimo y reproducible de reward model para quienes aprenden RLHF, no como componente de produccion: la propia autora advierte que se entreno con un unico dataset de preferencias y sin validacion externa, y que su alta accuracy no implica que juzgue la correccion factual del texto. La ventana de contexto de trabajo fue de 1024 tokens, el repo ocupa 0,5 GB y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM-135M-Instruct) con cabeza lineal de scoring |
| Parametros totales | 134.515.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima usada en entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Parametros entrenados | solo `score.weight` (resto congelado) |
| Tamano del repo | 0,5 GB |
| Descargas / likes | 2 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM-135M-Instruct, un transformer decoder de 135 millones de parametros, sobre el que se anade una cabeza de regresion lineal (`score.weight`) que proyecta el estado final a un unico escalar de recompensa. Durante el entrenamiento los pesos del modelo base se mantuvieron congelados y solo se optimizo esa capa lineal, lo que reduce drasticamente el coste y el riesgo de sobreajuste del backbone, aunque tambien limita la capacidad del modelo para adaptar su representacion interna a la tarea de preferencia.

El entrenamiento uso el dataset Human-Like-DPO-Dataset, con pares `chosen`/`rejected` por cada instruccion, y una funcion de perdida de ranking por pares (mayor recompensa para `chosen`). Los hiperparametros fueron: 1 epoca, 612 pasos, batch size 16, learning rate 3e-4, longitud maxima de 1024 tokens, y split de 9.795 ejemplos de entrenamiento y 1.089 de test. Se ejecuto en una NVIDIA T4 en Google Colab. No se menciona uso de RLHF adicional, DPO o tecnicas de decodificacion especulativa; el modelo se empleo despues como funcion de recompensa en un entrenamiento PPO, segun indica la model card.

## Capacidades

- Puntuacion de preferencia: dado un prompt y una respuesta, devuelve un unico valor escalar de recompensa.
- Comparacion de pares: permite ordenar dos respuestas a la misma instruccion comparando sus scores.
- Integracion en RLHF: disenado para servir como reward model en PPO.
- Clasificacion de texto en sentido amplio (pipeline `text-classification`), con salida escalar en lugar de etiquetas.
- No genera texto: no es una chat model y no produce respuestas.
- Idiomas: solo ingles declarado.
- Tool calling, agentes, vision, audio, thinking mode: no disponibles.

## Casos de uso

- Practicas de RLHF: usar el modelo como reward model en un pipeline PPO de juguete para experimentar con el bucle de optimizacion de politicas sin requerir GPUs de gran capacidad.
- Evaluacion comparativa de respuestas: puntuar dos candidatos generados por otro modelo y elegir el de mayor recompensa en tareas de ingles y contexto corto.
- Filtrado de datos de preferencias: descartar pares del dataset cuyo margen de recompensa sea anomalo, como control de calidad previo a un entrenamiento mayor.
- Docencia y reproduccion de experimentos: el repo de 0,5 GB y el entrenamiento en una T4 permiten reproducir el flujo completo en un cuaderno de Colab.
- Baseline de referencia: servir como punto de partida minimo contra el que comparar reward models mas grandes o con backbone descongelado.
- Pruebas de infraestructura de inferencia: validar pipelines de `text-classification` y servidores de inferencia con un modelo pequeno antes de desplegar modelos mayores.
- Analisis de sensibilidad al prompt: estudiar como varia la recompensa asignada al reformular la instruccion, util para detectar sesgos del reward model.

## Benchmarks y rendimiento

Resultados publicados por la autora sobre la particion de test del dataset (1.089 ejemplos):

| Metrica | Valor |
|---|---:|
| Training loss | 0,04049 |
| Validation loss | 0,04422 |
| Validation accuracy | 99,54 % |
| Reward margin medio | 3,98 |

La accuracy mide la proporcion de pares en los que `reward(chosen) > reward(rejected)`. Ejemplo citado en la model card: para una pareja concreta, `chosen = 4,38` y `rejected = -0,22`. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, RewardBench) en la informacion disponible, ni comparaciones con otros reward models.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,55 GB solo para pesos (134,5 M de parametros), mas activaciones y cache KV; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- En fp16/bf16 los pesos ocupan aproximadamente 0,27 GB; en cuantizacion de 8 bits, unos 0,14 GB (estimaciones teoricas, no se publican ficheros GGUF ni cuantizados).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, T4, incluso iGPU con suficiente memoria compartida); el entrenamiento original se hizo en una NVIDIA T4.
- Despliegue: compatible con `transformers` (pipeline `text-classification`) y con servidores que acepten modelos de `transformers`; no se han publicado pesos GGUF para llama.cpp u Ollama, ni configuracion especifica para vLLM o TGI.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera un coste por par muy bajo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kseniamakeevaa/llm-course-hw2-reward-model | 134,5 M | 1024 tokens (entrenamiento) | Reward model (cabeza lineal sobre SmolLM) | no disponible | Hugging Face, 2 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135 M | no disponible en la informacion | Modelo instructivo generativo | no disponible en la informacion | Hugging Face (modelo base) |
| Reward models de proposito general (p. ej. de la familia Llama o Mistral) | miles de millones | varios miles de tokens | Reward model | habitualmente restrictivas | Hugging Face |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- Entrenado con un unico dataset de preferencias (Human-Like-DPO-Dataset) y sin validacion en fuentes externas; la accuracy del 99,54 % es in-sample respecto a la distribucion de ese dataset.
- No evalua correccion factual: una recompensa alta no implica que la respuesta sea verdadera, solo que se parece a las respuestas preferidas del dataset.
- Solo ingles declarado; el comportamiento en castellano u otros idiomas no esta caracterizado.
- Ventana de trabajo de 1024 tokens; respuestas o prompts mas largos no estan cubiertos por el entrenamiento.
- Al mantener congelado el backbone y entrenar solo `score.weight`, la capacidad de adaptacion es muy limitada; es un ejercicio academico, no un reward model de produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, las condiciones del modelo base SmolLM-135M-Instruct deben verificarse por separado.
- Riesgo de sobreajuste a artefactos del dataset (longitud, estilo, formato de las respuestas) en lugar de a la calidad real.
- No es una chat model: usarlo como generador produce resultados sin sentido.
- Solo 2 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kseniamakeevaa/llm-course-hw2-reward-model
- Modelo base SmolLM-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset Human-Like-DPO-Dataset: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
