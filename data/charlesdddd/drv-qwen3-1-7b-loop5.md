# CharlesDDDD/DRV-Qwen3-1.7B-loop5

## Resumen

DRV-Qwen3-1.7B-loop5 es un modelo de lenguaje de 1.720 millones de parametros desarrollado por CharlesDDDD, derivado de Qwen/Qwen3-1.7B-Base mediante preentrenamiento continuado con una arquitectura de transformer recurrente en profundidad (looped transformer). El modelo repite un bloque de 12 capas (capas 8-19 de las 28 totales) cinco veces consecutivas reutilizando los mismos pesos, de modo que incrementa el computo por token sin aumentar el numero de parametros. Las capas 0-7 se ejecutan una sola vez antes del bloque y las capas 20-27 una sola vez despues.

El modelo se entreno durante aproximadamente 20.000 millones de tokens sobre una mezcla de web, PDF, codigo y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y una tasa de aprendizaje maxima de 3e-4 con decaimiento coseno. La conexion entre pasadas se realiza mediante una compuerta aprendida por canal (`model.loop_gate`): la primera pasada lee la salida de la capa 7 y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`, de forma que con `g = 0` el modelo equivale exactamente al Qwen3 original.

Es relevante ahora porque explora una via alternativa al escalado por parametros: obtener mas profundidad efectiva mediante recurrencia con pesos compartidos, manteniendo el coste de memoria de pesos constante. El modelo es una base sin ajuste por instrucciones, requiere `trust_remote_code=True` y no dispone aun de soporte en vLLM ni en otros motores de serving. La implementacion de Hugging Face reproduce el codigo de entrenamiento con una desviacion de 0,003 nats de perdida en cada numero de pasadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con recurrencia en profundidad (looped transformer); bloque de capas 8-19 repetido 5 veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 28 capas y 1.720 millones de parametros. La modificacion consiste en convertir las capas 8 a 19 (12 capas) en un bloque recurrente que se ejecuta cinco veces con los mismos pesos. El preludio (capas 0-7) y el epilogo (capas 20-27) se ejecutan una sola vez. Entre pasadas se aplica una interpolacion controlada por una compuerta escalar aprendida por canal oculto (`model.loop_gate`): la pasada posterior recibe `e + g * (salida previa - e)`, donde `e` es la salida de la capa 7. Este diseno permite que el modelo ajuste cuanto estado reutiliza de cada pasada y garantiza que, con `g = 0`, el comportamiento colapse al del Qwen3 original.

El entrenamiento consistio en un preentrenamiento continuado de unos 20.000 millones de tokens en una sola pasada sobre una mezcla de web, PDF, codigo y trayectorias de agente, con secuencias de 16K tokens, AdamW y tasa de aprendizaje maxima de 3e-4 con decaimiento coseno. Ademas de la perdida final, se aplico una perdida auxiliar de peso 0,0555 sobre la prediccion de cada pasada intermedia, lo que permite detener la recurrencia antes de tiempo y obtener todavia salidas coherentes. La implementacion de referencia en Hugging Face mantiene una cache KV independiente por pasada, por lo que con 3 pasadas la cache ocupa aproximadamente 1,9 veces la de un Qwen3-1.7B estandar.

## Capacidades

- Generacion de texto autoregresiva como modelo base, sin ajuste por instrucciones ni alineamiento conversacional.
- Razonamiento y generacion de codigo heredados del preentrenamiento de Qwen3-1.7B-Base y reforzados por la mezcla de codigo del entrenamiento continuado.
- Control dinamico del numero de pasadas en inferencia mediante el parametro `num_loops`, lo que permite intercambiar latencia por calidad.
- Salidas validas con menos pasadas de las entrenadas gracias a la perdida auxiliar sobre pasadas intermedias.
- Soporte de tool calling / function calling: no disponible de forma nativa (modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad alineada; el entrenamiento incluyo trayectorias de agente en los datos, pero no hay ajuste especifico.
- Capacidades multilingues: no disponibles en la documentacion.
- Capacidades especiales: modo thinking, vision y audio no disponibles.

## Casos de uso

- Investigacion en arquitecturas recurrentes en profundidad: el modelo sirve como punto de comparacion directo frente a `DRV-Qwen3-1.7B-midtrain-noloop`, ya que ambos comparten datos de entrenamiento y solo difieren en el bucle, lo que permite aislar el efecto de la recurrencia.
- Ajuste fino supervisado (SFT) sobre tareas de dominio: al ser un modelo base de 1.720 millones de parametros, se puede adaptar con LoRA o ajuste completo en una unica GPU para clasificacion, extraccion o generacion especializada.
- Generacion de codigo en pipelines internos: la mezcla de entrenamiento incluye codigo y el modelo cabe en GPUs de consumo, lo que permite desplegarlo como generador de fragmentos o completados en herramientas de desarrollo.
- Experimentacion con presupuestos de computo variables: el parametro `num_loops` permite medir el compromiso entre latencia y perdida (de 1,2108 con 1 pasada a 1,1224 con 5) y elegir el punto de operacion adecuado para cada carga.
- Prototipado de asistentes conversacionales: aunque es un modelo base, puede ajustarse con instrucciones para dialogos multi-turno en entornos con recursos limitados.
- Docencia y divulgacion sobre transformers: la implementacion con `trust_remote_code` y la compuerta por canal ofrecen un caso concreto y reproducible para explicar recurrencia, comparticion de pesos y cache KV.
- Evaluacion de infraestructura de serving: al no estar soportado en vLLM, sirve para probar adaptadores personalizados y medir el coste de mantener multiples caches KV por pasada.

## Benchmarks y rendimiento

El autor publica unicamente la perdida en el conjunto de test retenido de la mezcla de entrenamiento, en funcion del numero de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Perdida | 1,2108 | 1,1512 | 1,1416 | 1,1405 | 1,1224 | 1,1316 | 1,1401 | 1,1271 |

El modelo de control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`) obtiene 1,1460 en el mismo conjunto. El minimo se alcanza con 5 pasadas (1,1224), el numero con el que fue entrenado; con 6 u 8 pasadas la perdida vuelve a subir ligeramente (1,1316 y 1,1271). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, mas la cache KV. Con 5 pasadas la cache KV es sustancialmente mayor que la de un Qwen3-1.7B estandar (el autor indica unas 1,9 veces con 3 pasadas), por lo que conviene reservar entre 6 y 10 GB adicionales segun la longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para contextos largos y lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bfloat16 con contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para contextos cortos; en GPUs de 8 GB solo con cuantizacion, que el autor no documenta.
- Opciones de despliegue: unicamente `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavia; llama.cpp, Ollama y TGI no estan soportados.
- Latencia y throughput: no disponibles. Cabe esperar un coste de computo proporcional al numero de pasadas (5 pasadas implican ejecutar 12 capas cinco veces, es decir, 60 ejecuciones de capa en el bloque frente a 12 en el modelo original), aunque el numero de parametros y el coste de memoria de pesos no cambian.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida de test | Licencia | Serving |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop5 | 1.720 M | 16K en entrenamiento | 1,1224 (5 pasadas) | Apache 2.0 | Solo transformers con `trust_remote_code` |
| DRV-Qwen3-1.7B-midtrain-noloop | 1.720 M | 16K en entrenamiento | 1,1460 | Apache 2.0 | transformers |
| Qwen/Qwen3-1.7B-Base | 1.720 M | no disponible en la informacion | no disponible | Apache 2.0 | transformers, vLLM, llama.cpp, Ollama, TGI |

La comparacion con el modelo de control es la mas informativa: misma base, mismos datos y mismo presupuesto de entrenamiento, con una mejora de 0,0236 nats en la perdida de test al activar el bucle de 5 pasadas. Frente a Qwen3-1.7B-Base no hay datos de perdida comparables en la informacion disponible, aunque el autor senala que con `g = 0` el modelo recupera exactamente el comportamiento del original. No se dispone de comparaciones con otros modelos de 1-2 mil millones de parametros en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales sin un SFT previo.
- No hay soporte en vLLM, TGI, llama.cpp ni Ollama; el despliegue en produccion exige `transformers` con `trust_remote_code=True`, lo que implica ejecutar codigo remoto y limita el escalado.
- La cache KV crece con el numero de pasadas (aproximadamente 1,9 veces la de Qwen3-1.7B con 3 pasadas), lo que reduce el numero de peticiones concurrentes y encarece el serving en contextos largos.
- El autor no documenta los idiomas soportados ni el reparto linguistico del corpus; el rendimiento fuera del ingles es incierto.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion; al derivar de Qwen3-1.7B-Base y de datos web, hereda los sesgos y riesgos del corpus original.
- El modelo se entreno con una sola pasada sobre 20.000 millones de tokens; no hay garantia de que el bucle generalice a dominios fuera de la mezcla de entrenamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de benchmarks estandar y de soporte en motores de serving desaconseja su uso en produccion sin una evaluacion propia.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop5
- Modelo de control sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Coleccion Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
