# CharlieChen/loop-fwe-vanilla-d14

## Resumen

loop-fwe-vanilla-d14 es un modelo de lenguaje base (no instruct) de tipo *looped transformer* desarrollado por el usuario CharlieChen y publicado en Hugging Face. Forma parte de la familia de checkpoints asociados al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents", cuyo objetivo es estudiar como el crecimiento del modelo, la recursion (repeticion de bloques) y ciertos operadores de frontera afectan a los exponentes de escalado. La variante "vanilla" actua como linea base del estudio: no incorpora crecimiento ni recursion adicional, de modo que sirve de referencia contra la que medir el resto de configuraciones.

El checkpoint contiene 726.204.416 parametros almacenados en FP32 y se distribuye con los pesos identicos bit a bit a los del paper, junto con su recurrencia de evaluacion final. La arquitectura se describe mediante una coordenada de profundidad d14, anchura 1792 y 14 cabezas de atencion, con una longitud de contexto de 2.048 tokens y tokenizador GPT-2 via tiktoken. El entrenamiento se realizo sobre el corpus FineWeb-Edu.

Su relevancia es fundamentalmente de investigacion: se trata de un artefacto reproducible para estudiar leyes de escalado en arquitecturas recurrentes en profundidad, no de un modelo orientado a producto. No se ha publicado licencia, no dispone de versiones cuantizadas y no es un artefacto `AutoModel` de Transformers, por lo que su uso requiere el codebase propio del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursion en profundidad (*looped transformer*), implementacion propia `TransformerGPT` |
| Parametros totales | 726.204.416 (almacenados en FP32) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`, FP32); no hay safetensors ni GGUF |
| Anchura (d_model) | 1.792 |
| Cabezas de atencion | 14 |
| Coordenada de profundidad | d14 |
| Repeticiones del nucleo en evaluacion final | 1 |
| Tokenizador | GPT-2 via tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb-Edu (HuggingFaceFW/fineweb-edu) |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de *looped transformer*: en lugar de apilar un numero fijo y distinto de bloques, el nucleo del transformer puede ejecutarse de forma repetida, lo que permite desacoplar la profundidad "nominal" de la profundidad efectivamente ejecutada. En este checkpoint, la coordenada de profundidad es d14 (anchura 1.792, 14 cabezas de atencion) y el numero de repeticiones del nucleo en la recurrencia de evaluacion final es 1, es decir, la variante "vanilla" sin recursion adicional en inferencia. La model card advierte explicitamente de que la coordenada de profundidad es la coordenada de escalado de la "escalera" experimental y puede diferir del numero de bloques Transformer ejecutados, un detalle importante para interpretar correctamente las metricas.

El entrenamiento se realizo sobre FineWeb-Edu, un corpus filtrado por calidad educativa. No se documentan en la informacion disponible el numero total de tokens vistos, la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; el modelo se presenta como *base model*, sin alineamiento. Tampoco se incluye el estado del optimizador en la publicacion. Si se aportan hiperparametros de entrenamiento y metricas numericas seleccionadas en `result.json`. La evaluacion de referencia del paper se realizo con GPUs H100, FlashAttention-3 y autocast en bfloat16, y el checkpoint depende de una implementacion propia (`TransformerGPT`), por lo que no puede cargarse con `AutoModel.from_pretrained` de Transformers.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base, sin ajuste por instrucciones ni plantilla de chat.
- Modelado de lenguaje puro: calculo de verosimilitud (NLL) y perplejidad sobre texto en ingles.
- Evaluacion CORE del paper sobre 22 tareas, con 91.037 ejemplos, en el protocolo experimental de los autores.
- Base para experimentos de escalado: permite comparar exponentes de escalado frente a variantes con crecimiento de modelo, recursion o distintos operadores de frontera.
- Extraccion de representaciones internas y estudio de la dinamica de la recursion en profundidad, dado que el checkpoint expone la recurrencia de evaluacion final.
- Capacidad de *fine-tuning* como modelo base para tareas downstream en ingles, sujeto a las restricciones de licencia no especificadas.
- No dispone de soporte documentado de *tool calling*, function calling, uso agentico, multi-step reasoning, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para ingles.

## Casos de uso

- Reproduccion de resultados de investigacion en leyes de escalado: cargando `final.pt` con el codebase del paper y ejecutando `eval.py`, se pueden replicar las medias CORE sobre las 22 tareas y comparar con las variantes crecidas o recurrentes del estudio.
- Linea base en ablaciones sobre recursion en profundidad: este checkpoint es la variante "vanilla" con una repeticion del nucleo, por lo que sirve como punto de comparacion directo contra configuraciones con d mayor o con mas repeticiones.
- Estudio de eficiencia parametrica: con 726 millones de parametros y contexto de 2.048 tokens, permite medir el equilibrio entre parametros almacenados y computo efectivo segun la profundidad ejecutada.
- Investigacion sobre tokenizadores heredados: al emplear GPT-2 via tiktoken con vocabulario de 50.257 tokens ampliado a 50.304 filas, es util para analizar el impacto de vocabularios pequenos en modelos actuales.
- Medicion de perplexidad sobre dominios de ingles: al ser un modelo base entrenado en FineWeb-Edu, puede usarse como estimador de calidad de corpus (filtrado por NLL/perplejidad) de textos en ingles.
- Generacion de texto controlada en entornos de investigacion: muestreo con temperatura y truncado para estudiar comportamiento de un transformer recurrente sin alineamiento, siempre en ingles y sin uso comercial claro.
- Inicializacion para *fine-tuning* academico: punto de partida para tareas de clasificacion o generacion en ingles, asumiendo la integracion con el codebase propio y la ausencia de licencia definida.

## Benchmarks y rendimiento

Los unicos datos numericos publicados son las metricas del paper incluidas en la model card. La puntuacion CORE corresponde a la media archivada del paper sobre las semillas 0, 1 y 2, con 91.037 ejemplos en 22 tareas. CORE no es directamente comparable con benchmarks como MMLU o HumanEval.

| Metrica | Valor |
|---|---|
| NLL de validacion en preentrenamiento | 2,69150603 nats/token |
| Precision CORE (paper, media de semillas 0, 1, 2) | 0,17533699 |
| NLL de respuesta CORE (paper) | 2,74423945 nats/token |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponible |

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 2,9 GB solo para pesos, mas activaciones; en la practica requiere del orden de 4-6 GB para inferencia con lotes pequenos a 2.048 tokens (estimacion a partir del recuento de parametros, no confirmada por el autor).
- VRAM estimada en bfloat16 o float16: alrededor de 1,5 GB para pesos; el paper usa bfloat16 con autocast, por lo que esta es la via recomendada.
- GPU recomendadas segun el paper: NVIDIA H100 con FlashAttention-3 para el protocolo completo de evaluacion.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 6-8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o RTX 4090; en FP32 y con contexto completo conviene disponer de al menos 8 GB.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint no es un artefacto de Transformers y usa la implementacion `TransformerGPT` del codebase del paper. El unico camino documentado es `eval.py` del repositorio https://github.com/cue-engineering/loop.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.
- Almacenamiento: 2,9 GB para el repositorio; el fichero `final.pt` incluye los tensores FP32 y la recurrencia de evaluacion final, sin estado del optimizador.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos alternativos, por lo que los campos de comparacion se marcan como no disponibles. La tabla se limita a situar la categoria del modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d14 | 726.204.416 (FP32) | 2.048 | no disponible | Checkpoint PyTorch en Hugging Face, requiere codebase propio | CORE 0,1753 (media de 3 semillas, 22 tareas) |
| Alternativas densas de ~1B en ingles | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~1B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variantes crecidas o recurrentes del mismo paper | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni mantiene formatos conversacionales.
- Idiomas: unicamente ingles; no hay soporte multilingue declarado.
- Contexto limitado a 2.048 tokens, muy por debajo de los estandares actuales de contexto largo.
- Licencia no especificada: el uso comercial es incierto y requiere contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion y de generar contenido sesgado o incorrecto inherente a un modelo base entrenado sobre un corpus web filtrado; no se documentan evaluaciones de sesgo ni de seguridad.
- No es un artefacto de Transformers: `AutoModel`, `pipeline` y servidores de inferencia estandar no funcionan sin adaptacion manual.
- No existen pesos en safetensors ni GGUF, ni versiones cuantizadas, lo que impide usar llama.cpp, Ollama o cuantizacion de 4 bits directamente.
- El checkpoint no incluye estado del optimizador, lo que complica reanudar el preentrenamiento de forma exacta.
- Las metricas CORE del paper se obtuvieron con medias de tres semillas y 91.037 ejemplos; el script de evaluacion acotado (`--max-per-task 10`) produce resultados que no son comparables con el protocolo completo.
- La coordenada de profundidad d14 es una coordenada de escalado y puede no coincidir con el numero de bloques ejecutados; interpretar las cifras sin leer el paper puede llevar a conclusiones erroneas.
- Cero descargas y cero "me gusta" en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d14
- Codebase del paper (repositorio `loop`): https://github.com/cue-engineering/loop
- Dataset de entrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": no disponible como enlace directo en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a contenido no relacionado.
