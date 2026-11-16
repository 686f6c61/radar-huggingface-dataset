# CharlesDDDD/DRV-Qwen3-1.7B-loop4-avg2

## Resumen

DRV-Qwen3-1.7B-loop4-avg2 es un modelo de lenguaje de 1.720.577.024 parametros derivado de Qwen/Qwen3-1.7B-Base mediante preentrenamiento continuado con una arquitectura de transformer recurrente en profundidad (looped transformer). Lo desarrolla el usuario CharlesDDDD y forma parte de la coleccion Depth Recurrent Vector. La innovacion central consiste en repetir un bloque de 12 capas (capas 8-19 de las 28 totales) cuatro veces consecutivas con los mismos pesos, de modo que el modelo incrementa el computo por token sin aumentar el numero de parametros.

El modelo se entreno sobre aproximadamente 20.000 millones de tokens (una pasada sobre una mezcla de web, PDF, codigo y trayectorias de agente), con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. Esta version concreta ("avg2") promedia los pesos de dos ejecuciones independientes (`loop4-run1` y `loop4-run2`), lo que suele reducir la varianza del entrenamiento. Es un modelo base, sin ajuste por instrucciones, y su interes reside en explorar si la recurrencia en profundidad mejora la relacion calidad/computo frente a un transformer estandar del mismo tamano.

La relevancia actual es experimental: demuestra una via para obtener mas capacidad de razonamiento por parametro mediante computo iterativo, con un gate aprendido por canal que permite recuperar exactamente el comportamiento del Qwen3 original cuando el gate vale cero. No obstante, su adopcion en produccion esta limitada por la falta de soporte en motores de serving como vLLM y por requerir `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con recurrencia en profundidad (looped transformer); bloque de capas 8-19 repetido 4 veces |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16K tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de 28 capas. La modificacion estructural consiste en convertir las capas 8-19 (12 capas) en un bloque que se ejecuta varias veces seguidas con los mismos pesos. Las capas 0-7 se ejecutan una sola vez antes del bloque y las capas 20-27 una sola vez despues. La conexion entre pasadas se realiza mediante un gate aprendido por canal oculto (`model.loop_gate`): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo es identico al Qwen3 original. Por defecto se realizan 4 pasadas, aunque el parametro `num_loops` permite variar el numero en inferencia.

El entrenamiento consistio en un preentrenamiento continuado de unos 20.000 millones de tokens sobre una mezcla de web, PDF, codigo y trayectorias de agente, con secuencias de 16K tokens, AdamW y LR pico de 3e-4 con decaimiento coseno. Se anadio una perdida auxiliar (peso 0.0555) sobre la prediccion de cada pasada intermedia, de forma que detener el bucle antes de tiempo sigue produciendo salidas razonables. Esta version "avg2" promedia los pesos de dos ejecuciones (`loop4-run1` y `loop4-run2`). La implementacion de Hugging Face reproduce el codigo de entrenamiento con una diferencia de 0,003 nats de perdida en cada numero de pasadas.

## Capacidades

- Generacion de texto autoregresiva en modo base (sin ajuste por instrucciones ni formato conversacional entrenado).
- Razonamiento con computo adaptativo: el numero de pasadas (`num_loops`) es configurable en inferencia, permitiendo mas computo por token a costa de latencia.
- Prediccion valida con parada temprana: gracias a la perdida auxiliar por pasada, el modelo puede generar con 1, 2 o 3 pasadas y obtener salidas coherentes.
- Capacidad multilingue: no documentada explicitamente; heredada potencialmente del modelo base Qwen3, pero no verificada en la model card.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no entrenado especificamente, aunque la mezcla de entrenamiento incluye trayectorias de agente.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en arquitecturas recurrentes en profundidad: el modelo sirve como referencia reproducible para estudiar el efecto del numero de pasadas sobre la perdida, con la curva de test ya publicada (1,1904 a 1 pasada frente a 1,1147 a 4 pasadas).
- Preentrenamiento continuado como base para fine-tuning: al ser un modelo base Apache 2.0, puede servir de punto de partida para ajuste supervisado o DPO en dominios concretos, aprovechando el computo extra por token.
- Generacion de codigo en pipelines experimentales: la mezcla de entrenamiento incluye codigo y secuencias de 16K tokens, lo que permite procesar archivos y contextos de repositorio amplios, aunque sin garantias de instruccion.
- Experimentos de eficiencia computacional: comparar la calidad por FLOP entre 1 y 4 pasadas permite evaluar si la recurrencia compensa frente a un modelo denso del mismo tamano.
- Prototipado de asistentes conversacionales de bajo coste de parametros: con 1.720 millones de parametros y licencia permisiva, es desplegable en hardware modesto para pruebas internas.
- Analisis de documentos largos en investigación: la ventana de 16K tokens y el entrenamiento sobre PDF permiten tareas de continuacion y modelado de lenguaje sobre documentacion tecnica.
- Estudio de estabilidad de promediado de pesos: la variante "avg2" permite comparar el efecto del weight averaging sobre dos ejecuciones independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta perdida de test por numero de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Perdida | 1,1904 | 1,1414 | 1,1324 | 1,1147 | 1,1245 | 1,1286 | 1,1180 | 1,1248 |

El modelo de control sin bucle obtiene 1,1460 en el mismo conjunto de test retenido de la mezcla de entrenamiento. La mejor perdida se alcanza a 4 pasadas (1,1147), el numero con el que se entreno.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1,72B parametros x 2 bytes), mas cache KV y activaciones.
- Cache KV: cada pasada mantiene su propia cache KV; con 3 pasadas la cache es aproximadamente 1,9 veces la de un Qwen3-1.7B estandar, lo que incrementa la memoria necesaria en contextos largos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para contextos cortos en bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100 o H100 para lotes grandes y contextos de 16K.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM para inferencia con contextos moderados.
- Opciones de despliegue: unicamente transformers con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavia. No se documentan soportes para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La latencia escala con el numero de pasadas, ya que cada pasada ejecuta 12 capas adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Serving estandar | Notas |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-loop4-avg2 | 1,72B | 16K | Apache 2.0 | No (solo transformers) | Recurrencia en profundidad, 4 pasadas por defecto |
| Qwen/Qwen3-1.7B-Base | 1,72B | 32K (segun modelo original) | Apache 2.0 | Si (vLLM, TGI, etc.) | Modelo base de referencia, sin bucle |
| CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop | 1,72B | 16K | Apache 2.0 | Si | Control del mismo autor sin bucle, perdida 1,1460 |

La comparacion con otros modelos de ~1,7B (Llama 3.2 1B, Gemma 2 2B) no esta disponible en la informacion proporcionada, por lo que no se incluyen datos de rendimiento cruzado.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional sin fine-tuning adicional.
- Riesgo de alucinacion inherente a un modelo de lenguaje preentrenado; no se han publicado evaluaciones de factualidad.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (y posiblemente chino, heredado de Qwen3) no esta verificado.
- Sin soporte en vLLM, TGI, llama.cpp ni Ollama: el despliegue en produccion requiere transformers con `trust_remote_code=True`, lo que limita escalado y throughput.
- La cache KV crece con el numero de pasadas (aproximadamente 1,9x con 3 pasadas), encareciendo contextos largos.
- La longitud de contexto documentada es 16K tokens, correspondiente a la secuencia de entrenamiento; no se garantiza comportamiento correcto mas alla.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3 y de una mezcla web/PDF/codigo, es previsible que herede sesgos del corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de soporte en motores de serving y de evaluaciones estandar desaconseja su uso en produccion sin validacion previa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-loop4-avg2
- Coleccion Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
