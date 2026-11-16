# CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-final-loss-only

## Resumen

DRV-Qwen3-1.7B-ablation-loop3-final-loss-only es un modelo de lenguaje de 1.720.577.024 parametros publicado por el usuario CharlesDDDD en Hugging Face. Se trata de un experimento de *depth recurrence* (recurrencia en profundidad) construido a partir de Qwen/Qwen3-1.7B-Base: las capas 8 a 19 (12 de las 28 capas del transformer original) forman un bloque que se ejecuta varias veces seguidas con los mismos pesos, de modo que el modelo obtiene mas computo por token sin incrementar el numero de parametros. Las capas 0-7 se ejecutan una vez antes del bloque y las 20-27 una vez despues.

El modelo es un *ablation* concreto dentro de la coleccion Depth Recurrent Vector: a diferencia de la variante `loop3-run1`, aqui el entrenamiento aplica la perdida unicamente en la pasada final, sin perdida auxiliar sobre las pasadas intermedias. Esto lo hace apto solo para funcionar exactamente con 3 pasadas; con 1 pasada la salida es inutilizable y lejos de 3 pasadas el comportamiento es sensible al redondeo. Esta pensado como material de investigacion sobre arquitecturas recurrentes en profundidad, no como modelo de produccion.

El modelo ha sido continued-pretrained durante unos 20B tokens sobre una mezcla de web, PDF, codigo y trayectorias de agente, con secuencias de 16K tokens, AdamW y un LR pico de 3e-4 con decaimiento coseno. La licencia es Apache 2.0 y el modelo base subyacente es Qwen3-1.7B-Base, sin instruction tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer); capas 8-19 repetidas con pesos compartidos |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base (28 capas) y reorganiza el computo en tres segmentos: las capas 0-7 se ejecutan una vez, el bloque de capas 8-19 se ejecuta N veces con los mismos pesos, y las capas 20-27 se ejecutan una vez al final. La conexion entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo es exactamente el Qwen3 original, lo que convierte la recurrencia en una modificacion aditiva sobre el modelo base.

El entrenamiento consistio en continued pretraining de aproximadamente 20B tokens (una pasada sobre una mezcla de web, PDF, codigo y trayectorias de agente), con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. La innovacion clave de esta variante es negativa: la perdida se aplica solo en la pasada final, sin perdida auxiliar (peso 0.0555) sobre las pasadas intermedias que si llevan otras variantes de la coleccion. El resultado es un modelo que solo funciona bien con exactamente 3 pasadas. El autor reporta que la implementacion en Hugging Face coincide con su codigo de entrenamiento dentro de 0,003 nats de perdida en cualquier numero de pasadas.

## Capacidades

- Generacion de texto autoregresiva (modelo base, sin instruction tuning).
- Razonamiento y conocimiento general heredados del Qwen3-1.7B-Base subyacente.
- Generacion de codigo, dado que la mezcla de entrenamiento incluye codigo.
- Capacidad de ejecutar un numero variable de pasadas (`num_loops`), aunque el rendimiento solo es valido con 3 pasadas.
- Soporte de tool calling / function calling: no disponible (modelo base, sin post-entrenamiento de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; la mezcla incluye trayectorias de agente solo como datos de pretraining.
- Capacidades multilingues: no disponibles como dato verificado.
- Capacidades especiales: ninguna (sin vision, audio ni thinking mode).

## Casos de uso

- Investigacion sobre recurrencia en profundidad: sirve como punto de comparacion (ablation) frente a `loop3-run1` y a las variantes `chained`, para medir el efecto de eliminar la perdida en pasadas intermedias.
- Experimentos de eficiencia computacional por parametro: permite estudiar si repetir un bloque de 12 capas con los mismos pesos ofrece mejor relacion calidad/computo que un transformer estandar del mismo tamano.
- Estudio de compuertas de conexion entre pasadas: el parametro `loop_gate` por canal oculto es un objeto de analisis directo para entender como se combinan las representaciones entre iteraciones.
- Reproduccion de resultados de la coleccion DRV: util para validar la implementacion de Hugging Face frente al codigo de entrenamiento original del autor.
- Fine-tuning posterior como modelo base: al ser un modelo base Apache 2.0, puede servir de punto de partida para SFT o DPO en tareas concretas, siempre operando con 3 pasadas.
- Analisis de robustez al numero de pasadas: el modelo es un caso de estudio de sensibilidad al redondeo y a la profundidad efectiva, util para trabajos sobre estabilidad de arquitecturas recurrentes.

## Benchmarks y rendimiento

Perdida de test por numero de pasadas (conjunto held-out de la mezcla de entrenamiento; menor es mejor). Entrenado con 3 pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Perdida | 2,4736 | 1,8923 | 1,1176 | 1,2107 | 1,1568 | 1,1582 | 1,1683 | 1,1686 |

El control sin bucle (`DRV-Qwen3-1.7B-midtrain-noloop`) obtiene 1,1460. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,5 GB solo para pesos (1,72B parametros), mas cache KV; el autor indica que con 3 pasadas la cache KV es aproximadamente 1,9 veces la de un Qwen3-1.7B estandar, ya que cada pasada mantiene su propia cache.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para contexto corto en bf16; A100 o H100 para contextos largos (16K) y lotes mayores.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, con margen mayor cuanto mas corto sea el contexto.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan aun esta arquitectura.
- Latencia y throughput: no disponibles como cifras medidas; el coste por token es superior al de Qwen3-1.7B por la repeticion del bloque de 12 capas en 3 pasadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perdida de test | Licencia | Serving |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-ablation-loop3-final-loss-only | 1,72B | 16K | 1,1176 (3 pasadas) | Apache 2.0 | solo transformers |
| DRV-Qwen3-1.7B-midtrain-noloop (control) | 1,72B | 16K | 1,1460 | Apache 2.0 | transformers |
| Qwen/Qwen3-1.7B-Base | 1,72B | no disponible en la informacion | no disponible | Apache 2.0 | amplio soporte (vLLM, etc.) |

No se dispone de datos de benchmarks estandar para comparar rendimiento en tareas; la comparacion se limita a la perdida de test reportada por el autor.

## Limitaciones y advertencias

- El modelo solo es utilizable con exactamente 3 pasadas; con 1 pasada la salida es inutilizable y lejos de 3 pasadas la calidad se degrada y es sensible al redondeo.
- Sin perdida en pasadas intermedias, no hay salidas validas para parada temprana, a diferencia de otras variantes de la coleccion.
- Es un modelo base sin instruction tuning: no sigue instrucciones ni esta alineado para conversacion.
- vLLM y otros motores de serving no soportan la arquitectura, lo que limita el despliegue en produccion.
- La implementacion de Hugging Face puede diferir del codigo de entrenamiento hasta 0,006 nats fuera de 3 pasadas (0,0014 con 3 pasadas).
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al derivar de Qwen3-1.7B-Base hereda los del modelo original, no verificados aqui.
- Idiomas soportados no verificados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar antes de usar en entornos sensibles.
- Uso comercial permitido por Apache 2.0, pero sin garantias de calidad fuera del regimen de 3 pasadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-final-loss-only
- Coleccion Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
