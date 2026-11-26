# chartreuse-verte/ettin400m-purple-v2-GGUF

## Resumen

ettin400m-purple-v2-GGUF es la version cuantizada en formato GGUF de un clasificador de texto entrenado para detectar prosa artificial generada por modelos de lenguaje, el fenomeno conocido como *purple prose* o *slop*. Lo desarrolla el usuario chartreuse-verte como parte del proyecto Chartreuse y se presenta como una evolucion de su predecesor ettin150m-purple, que operaba a nivel de frase y no capturaba el estilo de LLM moderno, donde cada oracion parece limpia de forma aislada pero el problema se manifiesta a lo largo del parrafo.

El modelo parte de jhu-clsp/ettin-encoder-400m, un encoder de la familia ModernBERT, y se afina como clasificador binario de parrafos con un maximo de 512 tokens por entrada. Devuelve una probabilidad de que el parrafo sea "purple" (etiqueta 1) frente a "clean" (etiqueta 0), con un umbral operativo calibrado de 0,0599 pensado para mantener una precision de al menos 0,90.

Su relevancia actual reside en que aborda un problema creciente en entornos de publicacion, moderacion y evaluacion de contenido: distinguir prosa humana de prosa generada por LLM con patrones estilisticos reconocibles (relleno, muletillas de casa, ritmo entrecortado camuflado, construcciones "no X sino Y"). El repositorio incluye pesos en q8_0 y f16, un fichero de umbral y un fichero de configuracion de puntuacion, y esta pensado para ejecutarse con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), fine-tuned para clasificacion de secuencias |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de la unidad de puntuacion) |
| Tipos de cuantizacion | q8_0 y f16 |
| Idiomas soportados | ingles (el autor indica "English only") |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien existe el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, derivado de jhu-clsp/ettin-encoder-400m (395,8 millones de parametros), reutilizado como cabecera de clasificacion binaria con pooling de tipo *mean* (el campo `classifier.pooling_type` va embebido en el GGUF). La entrada es un unico parrafo, sin linea en blanco interna, de hasta 512 tokens; los parrafos de una sola frase tambien forman parte del conjunto de entrenamiento, de modo que una linea ornamentada aislada sigue puntuando como purple.

El entrenamiento se realizo con ejemplos negativos exclusivamente de prosa escrita por humanos y positivos mayoritariamente generados por una unica familia de modelos, con etiquetas obtenidas mediante calificacion por LLM en lugar de anotacion humana. La version v2 amplia el alcance respecto a v1 (ettin150m-purple), que puntuaba frase a frase, e incorpora patrones de slop moderno: relleno y micro-beats, spam de negaciones, atmosfera y senalizacion de trascendencia en lugar de eventos, ritmo entrecortado camuflado y tics de casa estereotipados. El umbral de 0,0599 se calibro para una precision de al menos 0,90 sobre negativos humanos.

## Capacidades

- Clasificacion binaria de parrafos en ingles: devuelve probabilidad de `purple_para` (1) frente a `clean` (0).
- Deteccion de prosa artificial a nivel de parrafo, incluyendo relleno, micro-beats, negaciones encadenadas, atmosfera sin eventos y ritmo fragmentado.
- Deteccion de tics estilisticos de casa (`tilts her head`, `her voice drops`, `for half a heartbeat`, `lets the question hang`, etc.).
- Deteccion de procedencia LLM de forma deliberada: practicamente cualquier parrafo generado por un LLM recibe una puntuacion alta (aproximadamente 0,85-0,91), sea slop o no.
- Extraccion de caracteristicas (tag `feature-extraction`) mediante el endpoint de embeddings de llama.cpp.
- Puntuacion por parrafo con pooling de tipo *mean* y logits de dos clases accesibles via API.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderacion de contenido en plataformas de escritura: puntuar cada parrafo enviado y marcar automaticamente los que superen el umbral de 0,0599 para revision humana, usando el clasificador como filtro previo de bajo coste.
- Control de calidad en pipelines editoriales: detectar prosa generada por LLM en manuscritos, articulos o guiones antes de publicacion, separando documentos por lineas en blanco y puntuando cada parrafo de forma independiente.
- Filtrado de datos para entrenamiento: descartar parrafos con alta probabilidad de procedencia LLM en corpus recolectados de la web, aprovechando que el modelo asigna puntuaciones altas a texto generado independientemente de su calidad.
- Evaluacion de asistentes de escritura: medir si las salidas de un sistema de generacion caen en patrones de slop (relleno, tics, atmosfera sin accion) y usar la probabilidad como senal de recompensa o ranking.
- Deteccion de roleplay generado: el entrenamiento esta mayoritariamente compuesto por prosa de estilo roleplay, por lo que encaja en la revision de ficcion interactiva y comunidades de escritura colaborativa.
- Investigacion sobre estilometria y procedencia de texto: usar los logits y la probabilidad como variable continua para estudiar como evolucionan los patrones estilisticos de distintos modelos generativos.
- Integracion en herramientas de escritura: desplegar el GGUF con llama.cpp detras de un servicio local y ofrecer al autor una senal en tiempo real sobre parrafos que se alejan de la prosa humana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC en test (negativos solo humanos) | 0,998 |
| Tasa de falsos positivos con umbral 0,0599 | 6,4 % de parrafos humanos retenidos |
| Concordancia GGUF q8_0 vs modelo torch | 400/400 decisiones, diferencia media absoluta de probabilidad 0,0013 |
| Concordancia GGUF f16 vs modelo torch | 400/400 decisiones, diferencia media absoluta < 0,0001 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para la variante q8_0 y aproximadamente 0,8 GB para f16, dado el tamano de 395,8 millones de parametros y un repositorio de 1,2 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 3060, RTX 4090, asi como en CPU mediante llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para lotes grandes conviene una RTX 3090, RTX 4090, A100 o H100.
- Despliegue mediante llama.cpp (`llama-server`), con los parametros indicados por el autor: `-c 512 -b 512 -ub 512 --embeddings --pooling rank --flash-attn off`.
- Requisito critico: la build de llama.cpp debe leer `classifier.pooling_type`; las builds antiguas caen a pooling CLS sin aviso y el AUC baja a aproximadamente 0,5.
- El endpoint de embeddings debe invocarse con `embd_normalize: -1`; sin ello todos los logits leen aproximadamente 0.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera procesamiento de miles de parrafos por segundo en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettin400m-purple-v2-GGUF | 395,8 M | 512 tokens | Clasificacion de prosa purple/slop por parrafo | MIT | Hugging Face, GGUF |
| ettin150m-purple-GGUF (v1 del mismo autor) | no disponible (familia Ettin-150m) | no disponible | Clasificacion de prosa purple por frase | MIT | Hugging Face, GGUF |
| jhu-clsp/ettin-encoder-400m (modelo base) | 395,8 M | no disponible | Encoder general (fine-tuning) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de clasificadores comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el autor indica explicitamente que el modelo es English only, por lo que no es fiable en castellano ni en otros idiomas.
- Entrada por parrafo: hay que dividir los documentos por lineas en blanco y puntuar cada parrafo por separado; una entrada larga con varios parrafos queda fuera de distribucion y diluye la puntuacion.
- Etiquetas generadas por LLM, no por anotacion humana, y los positivos proceden mayoritariamente de una unica familia de modelos, lo que puede introducir sesgo hacia ese estilo concreto.
- El modelo detecta procedencia LLM de forma deliberada: casi cualquier parrafo generado por un LLM puntua alto (0,85-0,91), slop o no, por lo que debe leerse como "distancia a la prosa humana" y no como medidor puro de slop.
- El umbral de 0,0599 esta calibrado con negativos exclusivamente humanos; para uso como ranking o recompensa conviene leer la probabilidad en lugar de la decision binaria.
- Fragilidad ante parafraseo: una vez aprendido un tic a nivel de frase, un escritor puede parafrasearlo y evitar la deteccion.
- Dependencia de la build de llama.cpp: sin soporte de `classifier.pooling_type` el rendimiento se degrada a AUC de aproximadamente 0,5 sin aviso.
- El entrenamiento se centra en prosa de estilo roleplay, lo que puede reducir la generalizacion a otros generos.
- La licencia MIT permite uso comercial, pero no se especifican garantias sobre el rendimiento en dominios distintos al entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/ettin400m-purple-v2-GGUF
- Version anterior v1: https://huggingface.co/chartreuse-verte/ettin150m-purple-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Proyecto Chartreuse: https://github.com/OrbFrontend/Chartreuse
