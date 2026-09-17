# CharlieChen/loop-grow-d16

## Resumen

loop-grow-d16 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face, identificado como la coordenada de profundidad d16 de la escalera de escalado del articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con nucleo recurrente en bucle (looped transformer) de 1.028.128.768 parametros almacenados en FP32, con una anchura de 2048, 16 cabezas de atencion y una longitud de contexto de 2.048 tokens. El checkpoint es el artefacto final de entrenamiento utilizado en la escalera de escalado sobre el corpus FineWeb y no incluye estado del optimizador para reanudar el entrenamiento.

Su relevancia es fundamentalmente de investigacion: sirve para reproducir y auditar los exponentes de escalado que el articulo asocia a crecimiento de modelo, recursion y operadores de frontera. No es un checkpoint compatible con `AutoModel` de Transformers, sino que requiere reconstruir la clase `TransformerGPT` con el codigo del paper. El modelo declara una perdida de validacion de preentrenamiento de 2,715389 nats/token sobre FineWeb, pero no incluye resultados completos de benchmarks en la informacion disponible.

El repositorio tiene 4,1 GB, no registra descargas ni likes, y la licencia no esta especificada, lo que limita de facto su uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con nucleo recurrente en bucle (looped transformer) |
| Parametros totales | 1.028.128.768 (almacenados en FP32, 4,113 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint distribuido unicamente en FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt`); no se distribuye en safetensors ni GGUF |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Anchura (hidden size) | 2.048 |
| Cabezas de atencion | 16 |
| Modo de profundidad | `loop` |
| Repeticiones del nucleo configuradas | 4 |
| Repeticiones en evaluacion final | 4 |
| Corpus de entrenamiento | FineWeb |
| Perdida de validacion (preentrenamiento) | 2,715389 nats/token |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de los looped transformers: en lugar de apilar un numero fijo de bloques distintos, define un nucleo de capas que se ejecuta repetidamente. La model card es explicita al señalar que la coordenada de profundidad (d16) es la coordenada de escalado de la escalera experimental y no tiene por que coincidir con el numero de bloques Transformer ejecutados; en esta configuracion se declaran 4 repeticiones del nucleo tanto en configuracion como en evaluacion final. El modelo emplea el tokenizador GPT-2 con 50.257 tokens, una anchura de 2048 y 16 cabezas de atencion, con un contexto de 2.048 tokens.

El entrenamiento se realizo sobre el corpus FineWeb y el paper utiliza GPUs H100 con FlashAttention-3 y autocast en bfloat16. No hay informacion sobre el numero total de tokens vistos, la composicion detallada del dataset ni sobre etapas de RLHF, DPO o ajuste por instrucciones: se trata de un modelo base puro de preentrenamiento. El checkpoint conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento. La metrica reportada es una NLL de validacion de 2,715389 nats/token medida sobre el propio corpus de preentrenamiento, que la model card distingue explicitamente de la NLL de respuestas del benchmark CORE.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo de lenguaje base.
- Modelado de lenguaje y calculo de verosimilitudes (util para evaluacion de NLL y experimentos de escalado).
- Capacidad de profundidad efectiva variable mediante recurrencia del nucleo, que es precisamente el objeto de estudio del paper.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso guiado.
- No dispone de modo "thinking", vision, audio ni otras modalidades.
- Multilingue: no; la model card declara unicamente ingles (`en`).
- No esta ajustado por instrucciones, por lo que no sigue ordenes de forma fiable sin fine-tuning adicional.

## Casos de uso

- Reproduccion de experimentos de escalado: cargar `final.pt` y `result.json` con el codigo de `cue-engineering/loop` para replicar la coordenada d16 de la escalera de FineWeb y verificar los exponentes de escalado publicados.
- Investigacion sobre recurrencia y profundidad efectiva: comparar el comportamiento de un nucleo repetido 4 veces frente a arquitecturas de profundidad fija del mismo presupuesto de parametros.
- Fine-tuning supervisado para tareas en ingles: partir del checkpoint base y ajustar con datasets etiquetados para clasificacion, resumen o generacion de dominio, aprovechando que es un modelo de ~1.000 millones de parametros manejable en una sola GPU.
- Extraccion de representaciones internas: al ser un transformer de 2048 dimensiones y contexto de 2048 tokens, es util para estudios de representaciones y de dinamica de capas recurrentes.
- Evaluacion con la suite CORE: el propio repositorio documenta el comando de evaluacion (`eval.py`) sobre las 22 tareas de CORE con las semillas 0, 1 y 2, lo que permite obtener puntuaciones comparables si se ejecuta la suite completa.
- Generacion de texto base para analisis linguistico en ingles: completado de texto y calculo de perplejidad sobre corpus de dominio especifico usando la NLL como referencia.
- Docencia y experimentacion con arquitecturas no estandar: sirve como ejemplo ejecutable de un modelo que no encaja en la interfaz `AutoModel` de Transformers y que obliga a reconstruir la clase del modelo desde el codigo del paper.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Perdida de validacion de preentrenamiento (NLL) | 2,715389 nats/token | Medida sobre el corpus FineWeb; la model card la distingue de la NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible | El repositorio solo documenta como ejecutar la evaluacion; las puntuaciones smoke no equivalen a resultados completos del paper |
| MMLU, HumanEval, GSM8K, etc. | no disponible | No se han publicado resultados de benchmarks en la informacion disponible |

No se han publicado resultados de benchmarks en la informacion disponible, mas alla de la NLL de validacion indicada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los parametros almacenados, no confirmada por el autor): FP32 en torno a 4,1 GB solo de pesos; BF16/FP16 en torno a 2,1 GB; INT8 en torno a 1,0 GB; INT4 en torno a 0,5 GB. Hay que sumar memoria para activaciones y cache KV, moderada dado el contexto de 2.048 tokens y la anchura de 2048.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) para inferencia en precision reducida. En FP32 serian recomendables 8-12 GB.
- GPU de referencia del paper: H100, con FlashAttention-3 y autocast en bfloat16.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El artefacto no es un checkpoint `AutoModel` de Transformers y requiere reconstruir la clase `TransformerGPT` con el codigo del paper (`eval.py`); tampoco se distribuye en GGUF ni safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros modelos, y la arquitectura (transformer con nucleo recurrente, checkpoint en `.pt` no compatible con `AutoModel`) dificulta la comparacion directa con modelos base densos de tamano similar. La unica cifra de referencia publicada es la NLL de validacion de preentrenamiento de 2,715389 nats/token, que no se acompaña de valores equivalentes para otras alternativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: puede generar texto incoherente o ignorar peticiones formuladas como instrucciones.
- Riesgo de alucinacion alto en cualquier tarea de pregunta-respuesta, dado que no hay etapa de alineacion ni de ajuste supervisado.
- Sesgos potenciales heredados de FineWeb, un corpus web a gran escala con la distribucion y los sesgos propios de ese tipo de datos; el autor no documenta ningun analisis de sesgos.
- Cobertura limitada a ingles; no se declara soporte de castellano ni de otros idiomas.
- Ventana de contexto reducida (2.048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no especificada: no hay autorizacion explicita de uso comercial, por lo que su explotacion en produccion es juridicamente arriesgada sin contactar con el autor.
- Formato de pesos propietario del paper: exige el codigo de `cue-engineering/loop` y no funciona con el ecosistema estandar de Transformers, vLLM, llama.cpp, Ollama o TGI.
- No incluye estado del optimizador, por lo que no se puede reanudar el entrenamiento original.
- La coordenada de profundidad d16 no equivale necesariamente al numero de bloques ejecutados; interpretar los parametros y la profundidad sin leer el paper puede llevar a conclusiones erroneas.
- Validacion comunitaria nula en el momento de la consulta (0 descargas, 0 likes), sin resultados completos de benchmarks publicados junto al checkpoint.
- El repositorio ocupa 4,1 GB y la descarga se realiza mediante `snapshot_download`, sin versiones cuantizadas oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieChen/loop-grow-d16
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": no disponible como enlace directo en la informacion proporcionada
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a documentacion de soporte de Microsoft y no guardan relacion con el artefacto.
