# chartreuse-verte/ettin400m-purple-v2-GGUF

## Resumen

ettin400m-purple-v2-GGUF es un clasificador de texto derivado de Ettin-Encoder-400m, un encoder de la familia ModernBERT desarrollado por el grupo JHU-CLSP. Lo publica el usuario chartreuse-verte como parte del proyecto Chartreuse, una herramienta orientada a detectar "purple prose" (prosa recargada) y "slop" generado por modelos de lenguaje en textos narrativos. El modelo resuelve un problema concreto: la deteccion de prosa artificial a nivel de parrafo, no de frase, capturando patrones que solo emergen cuando se lee un bloque completo de texto.

La version v2 sustituye el enfoque de v1 (ettin150m-purple), que puntuaba frases sueltas y por tanto fallaba ante el slop moderno de los LLM, donde cada frase es limpia de forma aislada pero el conjunto delata el origen automatico. El modelo se distribuye en formato GGUF para su uso con llama.cpp, con un umbral de operacion calibrado y un AUC de 0,998 en el conjunto de test con negativos humanos. Con 395,8 millones de parametros y una ventana de 512 tokens, esta pensado para integrarse en pipelines de evaluacion o filtrado de texto, no como generador.

Es relevante ahora porque la deteccion de procedencia LLM y de estilo artificial se ha convertido en un problema practico para editores, plataformas de contenido y equipos que entrenan modelos de recompensa o filtros de calidad. La propuesta del autor es explicita: el clasificador mide "cuanto se aleja un texto de la prosa humana", no solo cuanto slop contiene, lo que lo hace util tambien como senal de provenance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin-Encoder-400m) |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | q8_0 (recomendada) y f16 (precision de referencia) |
| Idiomas soportados | ingles unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Pooling | mean pooling (`classifier.pooling_type` embebido en el GGUF) |
| Etiquetas | 0 = clean, 1 = purple_para |
| Umbral de operacion | 0,0599 (calibrado a precision >= 0,90) |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-400m, un encoder de 395,8 millones de parametros basado en la arquitectura ModernBERT, disenada para secuencias largas con attention eficiente y sesgos rotatorios. Sobre esa base se anade una cabeza de clasificacion binaria con mean pooling, y se afina para la tarea de clasificar parrafos como prosa limpia o "purple_para". La entrada es un unico parrafo (sin lineas en blanco internas, aunque los saltos de linea simples son validos) de hasta 512 tokens; los parrafos de una sola frase tambien estan representados en el entrenamiento.

El detalle mas relevante del entrenamiento es la composicion del dataset: todos los negativos son texto escrito por humanos, mientras que los positivos son mayoritariamente salida de una unica familia de modelos. Las etiquetas provienen de grading automatico con un LLM, no de anotacion humana. El autor documenta los patrones que el modelo aprende a penalizar: relleno y micro-beats ("A pause.", "You breathe."), spam de negaciones y construcciones "not X, but Y", atmosfera y senalizacion de importancia que sustituyen a eventos, ritmos staccato camuflados y tics de estilo recurrentes ("tilts her head", "her voice drops", "for half a heartbeat"). No se especifica el numero de tokens de entrenamiento ni si hubo una fase de RLHF o DPO; al tratarse de un clasificador, la innovacion tecnica esta en la formulacion de la tarea y en la calibracion del umbral, no en tecnicas de decodificacion.

## Capacidades

- Clasificacion binaria de parrafos en prosa limpia o purple/slop, con salida de probabilidad calibrada.
- Deteccion de procedencia LLM: asigna puntuaciones altas (~0,85-0,91) a casi cualquier parrafo generado por un LLM, independientemente de si es slop o no.
- Deteccion de patrones de slop a nivel de parrafo: relleno, negaciones encadenadas, atmosfera sin eventos, ritmos fragmentados y tics de estilo.
- Deteccion de prosa recargada en parrafos de una sola frase, gracias a la presencia de este tipo de ejemplos en el entrenamiento.
- Extraccion de embeddings compatible con llama.cpp (`--embeddings`), lo que permite reutilizar el modelo como encoder para otras tareas.
- Inferencia local sin GPU dedicada obligatoria, al distribuirse en GGUF cuantizado.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un encoder de clasificacion, no un modelo generativo.

## Casos de uso

- Filtrado de calidad en pipelines editoriales: dividir un manuscrito por lineas en blanco, puntuar cada parrafo con el umbral 0,0599 y marcar los que superan el corte para revision humana. El AUC de 0,998 con negativos humanos lo hace adecuado como primera pasada.
- Deteccion de procedencia LLM en plataformas de contenido: usar la probabilidad como senal de "distancia a prosa humana" para moderacion o etiquetado, asumiendo que la puntuacion no distingue slop de texto LLM limpio.
- Entrenamiento de modelos de recompensa o filtros de datos: el autor indica que para ranking o reward conviene leer la probabilidad directamente en lugar de aplicar el umbral, ya que los negativos de calibracion son todos humanos.
- Control de calidad en generacion creativa asistida: integrar el clasificador en un bucle de generacion para rechazar o regenerar parrafos que superen el umbral, reduciendo tics como "for half a heartbeat" o "lets the question hang".
- Investigacion sobre estilos de escritura: usar los embeddings del encoder para agrupar o analizar corpus narrativos segun su grado de artificialidad.
- Evaluacion de modelos de escritura creativa: comparar la distribucion de puntuaciones de distintos generadores sobre el mismo prompt para medir cuanto se acercan a la prosa humana.
- Despliegue en local o en CPU: con un GGUF q8_0 y llama-server en modo embeddings, se puede ejecutar en maquinas sin GPU para procesar volumenes moderados de texto.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC en test (negativos solo humanos) | 0,998 |
| Falsos positivos a umbral 0,0599 | 6,4% de parrafos humanos retenidos |
| Concordancia GGUF q8_0 vs torch (400 filas) | 400/400 decisiones, media de abs(delta p) 0,0013 |
| Concordancia GGUF f16 vs torch (400 filas) | 400/400 decisiones, media de abs(delta p) < 0,0001 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, algo esperable en un clasificador de texto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en q8_0 y en torno a 0,8 GB en f16 para los pesos; el consumo real depende del contexto y del backend.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB libres (GTX 1650, RTX 3060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer sin problema, e incluso en entornos sin GPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--embeddings --pooling rank --flash-attn off`), y por extension cualquier runtime compatible con GGUF. No se documentan integraciones con vLLM, TGI u Ollama en la informacion disponible.
- Requisito critico: la build de llama.cpp debe leer `classifier.pooling_type`; las builds antiguas caen a CLS pooling sin aviso y el AUC baja a ~0,5.
- En la API de embeddings es obligatorio `embd_normalize: -1`; sin ello todos los logits leen aproximadamente 0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettin400m-purple-v2-GGUF | 395,8 M | 512 tokens | Clasificacion de parrafo (purple/slop y provenance LLM) | MIT | GGUF en Hugging Face |
| ettin150m-purple-GGUF (v1) | no disponible | no disponible | Clasificacion de frase | MIT | GGUF en Hugging Face |
| jhu-clsp/ettin-encoder-400m | 395,8 M | no disponible | Encoder base ModernBERT, sin cabeza de clasificacion | no disponible en la informacion | Hugging Face |

La comparacion con clasificadores de slop de otros autores no esta disponible en la informacion proporcionada. La diferencia principal frente a v1 es la unidad de analisis: v1 puntua frases y v2 puntua parrafos, lo que segun el autor corrige el fallo ante slop moderno con frases individualmente limpias.

## Limitaciones y advertencias

- Solo ingles; el entrenamiento es mayoritariamente prosa de estilo roleplay, lo que puede reducir el rendimiento en otros generos.
- Hay que dividir los documentos por lineas en blanco y puntuar cada parrafo por separado; una entrada larga con varios parrafos queda fuera de distribucion y diluye la puntuacion.
- Las etiquetas provienen de grading con LLM, no de anotacion humana, y los positivos son mayoritariamente salida de una unica familia de modelos, lo que introduce sesgo hacia ese estilo.
- El modelo detecta procedencia LLM de forma deliberada: casi cualquier parrafo de LLM recibe 0,85-0,91, slop o no, y las puntuaciones entre parrafos de LLM son muy cercanas. No debe interpretarse como un medidor puro de slop.
- El umbral 0,0599 es muy bajo porque todos los negativos de calibracion son humanos; para ranking o reward conviene usar la probabilidad en bruto.
- Un escritor puede eludir la deteccion parafraseando los tics aprendidos a nivel de frase.
- Riesgo de alucinacion no aplica (no genera texto), pero si de falsos positivos sobre prosa humana muy ornamentada.
- La licencia MIT permite uso comercial, aunque no se documentan garantias de robustez fuera del dominio de roleplay en ingles.
- Requiere una build reciente de llama.cpp y el parametro `embd_normalize: -1`; un error de configuracion degrada el AUC a ~0,5 sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/ettin400m-purple-v2-GGUF
- Modelo v1: https://huggingface.co/chartreuse-verte/ettin150m-purple-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Proyecto Chartreuse: https://github.com/OrbFrontend/Chartreuse
