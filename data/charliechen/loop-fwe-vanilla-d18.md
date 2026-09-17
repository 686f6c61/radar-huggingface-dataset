# CharlieChen/loop-fwe-vanilla-d18

## Resumen

loop-fwe-vanilla-d18 es un modelo de lenguaje base (no ajustado con instrucciones) de 1.378.418.688 parametros almacenados en FP32, publicado por el usuario CharlieChen como artefacto de investigacion asociado al trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con arquitectura "looped" (recursiva) implementado en un codebase propio llamado TransformerGPT, entrenado sobre el corpus FineWeb-Edu con tokenizador GPT-2 via tiktoken, una anchura de 2304, 18 cabezas de atencion y una ventana de contexto de 2048 tokens.

Su relevancia no es la de un modelo de produccion, sino la de un punto de referencia reproducible para estudiar leyes de escalado en arquitecturas recurrentes: la model card indica que los pesos exportados son identicos bit a bit al checkpoint del articulo y que el checkpoint publico contiene solo los tensores del modelo y la recurrencia final de evaluacion. Incluye metricas numericas concretas (NLL de validacion de 2,52351159 nats/token y CORE accuracy de 0,23780689 sobre 91.037 ejemplos y 22 tareas), lo que lo convierte en una referencia util para replicar experimentos de escalado.

El modelo tiene cero descargas y cero "likes" en el momento de la consulta, no declara licencia y solo soporta ingles. Es, por tanto, un artefacto de investigacion de nicho, sin soporte en motores de inferencia estandar y sin estado del optimizador incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" (recursivo) con implementacion propia `TransformerGPT`; coordenada de profundidad d18, anchura 2304, 18 cabezas de atencion |
| Parametros totales | 1.378.418.688 (almacenados en FP32) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica `final.pt` en FP32; no se distribuyen pesos cuantizados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `final.pt` (checkpoint PyTorch en FP32, con la recurrencia final de evaluacion); no es safetensors ni GGUF ni un artefacto `AutoModel` de Transformers |

Otros datos de configuracion declarados: tokenizador GPT-2 via tiktoken, vocabulario de 50.257 tokens ampliado a 50.304 filas en el modelo, repeticiones finales del nucleo iguales a 1, tamano del repositorio de 5,5 GB y ficheros `final.pt`, `result.json` y `SHA256SUMS`.

## Arquitectura y entrenamiento

La arquitectura es un transformer con "looping" o recursion: el nucleo del modelo puede ejecutarse mas de una vez, de modo que la coordenada de profundidad (d18) funciona como coordenada de escalado de la "escalera" experimental y puede no coincidir con el numero de bloques Transformer realmente ejecutados. En esta variante "vanilla" el numero de repeticiones finales del nucleo es 1, por lo que se trata del punto de control sin recursion adicional en la evaluacion. La anchura es de 2304 con 18 cabezas de atencion, lo que implica una dimension de cabeza de 128.

El entrenamiento se realizo sobre FineWeb-Edu, con tokenizador GPT-2 gestionado mediante tiktoken. La model card no detalla el numero exacto de tokens vistos, la composicion del dataset, ni si hubo fases de RLHF o DPO; al ser un modelo base, no se declara ningun ajuste por preferencias. El paper asociado usa GPUs H100 con FlashAttention-3 y autocast en bfloat16, y el checkpoint no incluye el estado del optimizador. Las metricas de entrenamiento y evaluacion seleccionadas se publican en `result.json`.

## Capacidades

- Generacion de texto en ingles: es un modelo base entrenado con objetivo de modelado causal del lenguaje, sin ajuste por instrucciones.
- Continuacion de texto y modelado de lenguaje: la validacion de pretraining reporta 2,52351159 nats/token de NLL sobre FineWeb-Edu.
- Razonamiento y conocimiento general medidos mediante CORE: 0,23780689 de accuracy media sobre 22 tareas y 91.037 ejemplos (media de las semillas 0, 1 y 2).
- Evaluacion reproducible: permite ejecutar el protocolo CORE del paper con el script `eval.py` del codebase, con limites de ejemplos por tarea y control de semillas.
- Capacidad de investigacion en escalado: sirve como punto de comparacion para estudiar como el crecimiento del modelo, la recursion y los operadores de frontera afectan a los exponentes de escalado.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; al ser un modelo base sin ajuste instruccional no se declara este tipo de capacidades.
- Multilingue: no; el modelo esta etiquetado unicamente para ingles.
- Capacidades especiales: no se declaran modos de "thinking", vision ni audio.

## Casos de uso

- Replicacion de resultados de investigacion: el checkpoint es identico bit a bit al del articulo y permite regenerar las metricas CORE con el mismo protocolo (`eval.py`, 22 tareas, semillas 0 a 2) para verificar los numeros publicados.
- Estudio de leyes de escalado en arquitecturas recurrentes: entrenar variantes con distintas profundidades y repeticiones del nucleo y comparar los exponentes de escalado contra este punto de referencia vanilla, que sirve como linea base sin recursion adicional.
- Ablacion de recursividad y operadores de frontera: dado que esta variante tiene 1 repeticion final del nucleo, es el control natural frente a las variantes recurrentes del mismo trabajo experimental.
- Fine-tuning supervisado sobre corpus ingleses: al ser un modelo base de 1.378 millones de parametros con vocabulario GPT-2, se puede ajustar con `transformers`-compatible wrappers propios o con un trainer personalizado para tareas de clasificacion o generacion acotada.
- Extraccion de representaciones internas para analisis mecanicista: el codigo propio permite instrumentar las repeticiones del nucleo y estudiar como se transforman las activaciones capa a capa.
- Generacion de texto controlada en ingles en entornos de laboratorio: util para producir completaciones de referencia y medir perplejidad en dominios educativos derivados de FineWeb-Edu.
- Banco de pruebas de tecnicas de eficiencia: su tamano (aproximadamente 5,5 GB en FP32) permite experimentar con cuantizacion y comparar el coste de la recursion frente a modelos densos equivalentes.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| NLL de validacion de pretraining | 2,52351159 nats/token | Corpus FineWeb-Edu |
| CORE accuracy (paper) | 0,23780689 | Media archivada de las semillas 0, 1 y 2; 91.037 ejemplos en 22 tareas |
| CORE answer NLL (paper) | 2,49055914 nats/token | La propia model card aclara que difiere del NLL de validacion de pretraining |

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 5,5 GB solo para los pesos, mas activaciones y memoria de trabajo; margen recomendado de 8 a 12 GB.
- VRAM estimada en bfloat16: aproximadamente 2,8 GB para los pesos, formato usado en el paper junto con autocast.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 1,4 GB; a 4 bits, aproximadamente 0,7 GB (estimaciones a partir de los 1.378 millones de parametros; no se publican pesos cuantizados oficiales).
- GPU de referencia del paper: H100 con FlashAttention-3 y autocast en bfloat16.
- GPU de clase servidor: A100, H100 y equivalentes son mas que suficientes en terminos de memoria.
- GPU de consumo: el modelo cabe con holgura en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), especialmente en bfloat16 o FP16.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama no estan soportados de serie, ya que el checkpoint usa la implementacion propia `TransformerGPT` y no es un artefacto `AutoModel` de Transformers. El unico camino documentado es instalar el codebase del paper (github.com/cue-engineering/loop) y usar `eval.py` con `--checkpoint` y `--result-json`.
- Latencia y throughput: no disponible; la model card no publica medidas de velocidad de inferencia.
- Nota de despliegue: el estado del optimizador no esta incluido, por lo que el checkpoint no permite reanudar entrenamiento tal cual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y motores | Enfoque |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d18 | 1.378 millones | 2.048 | No disponible | Solo codebase propio (`loop`, `eval.py`); sin safetensors ni GGUF | Transformer recursivo (looped), artefacto de investigacion |
| Pythia-1.4B | 1.400 millones | 2.048 | Apache-2.0 segun documentacion publica | Transformers, safetensors, ampliamente soportado | Transformer denso, suite de interpretabilidad |
| TinyLlama-1.1B | 1.100 millones | 2.048 | Apache-2.0 segun documentacion publica | Transformers, GGUF, llama.cpp, Ollama | Transformer denso con ajuste instruccional |
| Qwen2.5-1.5B | 1.500 millones | 32.768 | Apache-2.0 segun documentacion publica | Transformers, GGUF, vLLM, TGI | Transformer denso con ajuste instruccional |

Las cifras de parametros, contexto y licencia de los modelos comparados proceden de su documentacion publica habitual; no se dispone de una comparacion de rendimiento comun con loop-fwe-vanilla-d18, por lo que los resultados CORE del paper no son directamente comparables con benchmarks de otros modelos (distinto protocolo, distinto conjunto de tareas).

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a ordenes ni mantiene formato de chat de forma fiable.
- Solo soporta ingles; no se declara entrenamiento multilingue.
- Ventana de contexto corta (2.048 tokens), insuficiente para tareas de contexto largo como analisis de documentos extensos o repositorios completos.
- Riesgo elevado de alucinacion en generacion abierta, especialmente sin ajuste por preferencias ni tecnicas de verificacion.
- CORE accuracy de 0,23780689: el rendimiento en tareas de conocimiento y razonamiento es bajo en terminos absolutos.
- Licencia no disponible: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Requiere el codebase propio `TransformerGPT`; no funciona con `AutoModel` de Transformers, ni con vLLM, llama.cpp, Ollama o TGI sin trabajo de portabilidad adicional.
- No se publican pesos en safetensors ni GGUF, ni versiones cuantizadas oficiales.
- El estado del optimizador no esta incluido, por lo que no se puede reanudar el entrenamiento desde el checkpoint.
- La model card advierte que la coordenada de profundidad es la coordenada de escalado de la escalera experimental y puede diferir del numero de bloques Transformer ejecutados; esto afecta a cualquier interpretacion directa de la "profundidad" del modelo.
- Cero descargas y cero validacion por parte de la comunidad: no hay evidencia independiente sobre su comportamiento fuera de los scripts del autor.
- Posible desajuste entre el vocabulario del tokenizador (50.257 tokens) y las filas del modelo (50.304); hay que respetar el mapeo del codebase para evitar indices invalidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d18
- Codebase del paper (`loop`): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados obtenidos correspondian a paginas de estado de vuelos y no guardan relacion con el contenido solicitado).
