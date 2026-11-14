# chartreuse-verte/ettin150m-purple-v2-GGUF

## Resumen

ettin150m-purple-v2-GGUF es un clasificador de texto a nivel de parrafo, publicado por el usuario chartreuse-verte, que detecta prosa ampulosa generada por modelos de lenguaje (lo que el autor denomina "purple prose" o "slop"). Se trata de un ajuste fino del encoder Ettin-150m (jhu-clsp/ettin-encoder-150m), un transformer tipo ModernBERT de 149,6 millones de parametros, distribuido en formato GGUF para su uso con llama.cpp.

El modelo resuelve un problema concreto: la version v1 evaluaba una frase cada vez y, por tanto, no detectaba el "slop" moderno de los LLM, en el que cada frase parece limpia de forma aislada y el problema solo se manifiesta a lo largo del parrafo (relleno, micro-golpes narrativos, abuso de negaciones, tics de estilo repetidos). La v2 recibe un parrafo completo por entrada, hasta 512 tokens, y devuelve una probabilidad de que el texto sea prosa artificial.

Es relevante ahora porque ofrece una herramienta ligera (161 MB en cuantizacion q8_0) y rapida para filtrar o puntuar texto generado por LLM en pipelines de datos, sistemas de recompensa o herramientas de edicion. El autor advierte que el modelo detecta tambien procedencia de LLM de forma deliberada, ya que todos los negativos de entrenamiento son de escritura humana, por lo que debe interpretarse como "distancia respecto a la prosa humana" y no como un medidor puro de slop.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin-150m) con mean pooling |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrada) |
| Tipos de cuantizacion | q8_0 (161 MB), f16 (301 MB) |
| Idiomas soportados | ingles unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien existe el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del encoder Ettin-150m, basado en la arquitectura ModernBERT, con 149,6 millones de parametros y pooling de media (el tipo de pooling, `classifier.pooling_type`, queda registrado en el propio GGUF). La tarea es clasificacion binaria con dos etiquetas: `0 = clean` y `1 = purple_para`. La entrada es un unico parrafo sin linea en blanco interna (los saltos de linea simples estan permitidos), con un maximo de 512 tokens.

Segun la model card, el entrenamiento comparte datos y receta con la version de 400 millones de parametros (ettin400m-purple-v2-GGUF). Todos los negativos de entrenamiento son de escritura humana, mientras que los positivos proceden en su mayoria de la salida de una misma familia de modelos. Las etiquetas se generaron mediante evaluacion por LLM, no por anotacion humana. Los parrafos de una sola frase tambien estan presentes en los datos de entrenamiento, de modo que una linea ornamentada aislada sigue puntuando como prosa artificial. Se calibro un umbral operativo de 0,0933 para obtener una precision igual o superior a 0,90.

## Capacidades

- Clasificacion binaria de prosa a nivel de parrafo: devuelve una probabilidad de que el texto sea "purple prose" generada por LLM.
- Deteccion de relleno y micro-golpes narrativos (`A pause.`, `You breathe.`, `Just that. Nothing more.`).
- Deteccion de abuso de negaciones y construcciones del tipo "no X, sino Y".
- Deteccion de atmosfera y senalizacion de importancia que sustituyen a eventos reales.
- Deteccion de ritmos entrecortados y fragmentarios camuflados.
- Deteccion de tics de estilo repetidos (`tilts her head`, `her voice drops`, `for half a heartbeat`, `lets the question hang`).
- Deteccion de procedencia de LLM de forma deliberada: cualquier parrafo generado por un LLM tiende a puntuar alto, sea slop o no.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales: no disponibles (no hay vision, audio ni modo de razonamiento).

## Casos de uso

- Filtrado de datasets sinteticos: puntuar cada parrafo de un corpus generado por LLM y descartar los que superen el umbral de 0,0933, reduciendo el slop en datos de entrenamiento o de evaluacion. El modelo es adecuado por su tamano reducido y su alta recall (0,995) en el conjunto de prueba.
- Sistemas de recompensa o ranking en generacion creativa: usar la probabilidad (no solo la decision binaria) como senal de "distancia respecto a prosa humana" para penalizar estilos artificiales. El autor recomienda leer la probabilidad para uso en ranking.
- Herramientas de edicion para escritores: marcar parrafos que suenan a LLM y sugerir reescritura, dividiendo el documento por lineas en blanco y evaluando cada parrafo de forma independiente.
- Moderacion de contenido en plataformas de rol o ficcion colaborativa: detectar texto generado automaticamente en foros o comunidades donde se exige escritura humana, dado que el entrenamiento se centra en prosa de estilo roleplay.
- Auditoria de pipelines de generacion: monitorizar la salida de un sistema de escritura asistida y alertar cuando el estilo derive hacia tics repetidos o relleno, gracias a la baja latencia de un encoder de 150M en q8_0.
- Investigacion sobre estilos de LLM: comparar la frecuencia de "purple prose" entre familias de modelos o entre versiones de un mismo modelo, usando la probabilidad calibrada como metrica comparable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de prueba (763 parrafos, 402 positivos; todos los negativos son de escritura humana), cada modelo en su umbral calibrado:

| Metrica | ettin150m-purple-v2 (este modelo) | ettin400m-purple-v2 |
|---|---|---|
| Umbral | 0,0933 | 0,0599 |
| AUC | 0,994 | 0,998 |
| Precision / recall | 0,913 / 0,995 | 0,931 / 1,000 |
| Parrafos humanos retenidos marcados (n = 296) | 9,8 % | 6,8 % |

Comparacion GGUF frente al modelo en torch sobre 400 filas de prueba: q8_0 coincide en 397/400 decisiones (media de |Δp| de 0,0019); f16 coincide en 400/400 (media de |Δp| de 0,0001).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el fichero q8_0 ocupa 161 MB y el f16 301 MB, por lo que cabe en cualquier GPU consumer con holgura.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no requiere A100 ni H100. Funciona tambien en CPU.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: llama.cpp mediante `llama-server` con las opciones `-c 512 -b 512 -ub 512 --embeddings --pooling rank --flash-attn off`. La build de llama.cpp debe leer `classifier.pooling_type`; las builds antiguas caen a CLS pooling sin aviso y el AUC baja a aproximadamente 0,5.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC (test) | Licencia | Formato |
|---|---|---|---|---|---|
| ettin150m-purple-v2 (este) | 149,6 M | 512 tokens | 0,994 | MIT | GGUF |
| ettin400m-purple-v2 | no disponible (aprox. 400 M por nombre) | 512 tokens | 0,998 | no disponible | GGUF |
| ettin150m-purple (v1) | 149,6 M | una frase por entrada | no disponible | no disponible | GGUF |

La v1 puntuaba una sola frase y no detectaba el slop moderno a nivel de parrafo; la v2 comparte datos y receta con la version de 400M, con aproximadamente la mitad de tamano y algo menos de precision (AUC 0,994 frente a 0,998).

## Limitaciones y advertencias

- Solo ingles; el entrenamiento se compone mayoritariamente de prosa de estilo roleplay.
- Es necesario dividir los documentos por lineas en blanco y puntuar cada parrafo por separado; una entrada larga con varios parrafos queda fuera de distribucion y diluye la puntuacion.
- Las etiquetas proceden de evaluacion por LLM, no de anotacion humana, y los positivos son en su mayoria de una sola familia de modelos.
- Detecta procedencia de LLM de forma deliberada: casi cualquier parrafo generado por un LLM puntua alto, sea slop o no; debe leerse como "distancia respecto a prosa humana".
- Una vez aprendido un tic a nivel de frase, un escritor puede parafrasearlo y evitar la deteccion.
- El umbral es bajo (0,0933) porque todos los negativos de calibracion son humanos; para ranking o recompensa conviene usar la probabilidad.
- Requiere una build de llama.cpp que lea `classifier.pooling_type`; en caso contrario el rendimiento se degrada gravemente (AUC ~0,5) sin aviso.
- En la API de embeddings es obligatorio usar `embd_normalize: -1`; sin ello todos los logits leen aproximadamente 0.
- Licencia MIT: permite uso comercial, pero no se han publicado garantias de robustez fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/ettin150m-purple-v2-GGUF
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Version de 400M: https://huggingface.co/chartreuse-verte/ettin400m-purple-v2-GGUF
- Version v1 de 150M: https://huggingface.co/chartreuse-verte/ettin150m-purple-GGUF
- Repositorio del proyecto: https://github.com/OrbFrontend/Chartreuse
