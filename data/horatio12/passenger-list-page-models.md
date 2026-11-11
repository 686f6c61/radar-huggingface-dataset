# horatio12/passenger-list-page-models

## Resumen

`horatio12/passenger-list-page-models` es un conjunto de dos modelos pequenos basados en MobileNetV3-small, publicados como state dicts de PyTorch, orientados al procesamiento de listas de pasajeros de documentos historicos. El autor es horatio12 y el modelo procede del proyecto de codigo abierto [passenger-list-reader](https://github.com/jbyoung12/passenger-list-reader). No es un modelo de lenguaje: no genera texto ni razona, sino que resuelve dos tareas de vision especificas sobre imagenes de paginas escaneadas.

El primer modelo, `page_model.pt` (5 MB), recibe una pagina completa reducida a 320 x 320 en escala de grises y determina si la pagina contiene una lista de pasajeros, ademas de localizar la columna de nombres y las filas primera y ultima. El segundo, `sort_model.pt` (4 MB), clasifica una tira de nombre como mecanografiada, manuscrita o ninguna de las dos. Ambos estan disenados para ejecutarse en CPU, lo que los hace adecuados para pipelines de digitalizacion de archivos a gran escala sin infraestructura GPU.

Su relevancia es acotada pero concreta: cubre un nicho de digitalizacion de archivos genealogicos e historicos (listas de llegada a Nueva York, microfilm T715 de los National Archives, 1897-1957) donde los modelos genericos de OCR y layout no estan especializados. La licencia Apache 2.0 facilita su integracion en proyectos comerciales y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-small (dos redes independientes: `layout_train.Net` y `sort_train.Net`) |
| Parametros totales | no disponible (pesos de 5 MB y 4 MB respectivamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (state dicts en PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (procesa documentos en ingles historico por el corpus de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

Ambos modelos son MobileNetV3-small, una arquitectura CNN ligera disenada para inferencia eficiente en dispositivos con recursos limitados. El modelo de pagina (`page_model.pt`) procesa la imagen completa reducida a 320 x 320 en escala de grises y produce una prediccion de presencia de lista junto con la localizacion de la columna de nombres y los limites de filas. El modelo de ordenacion (`sort_model.pt`) recibe una tira de nombre escalada a 64 pixeles de alto y rellenada hasta 448 de ancho, y la clasifica en tres clases: mecanografiada, manuscrita o ninguna.

Los datos de entrenamiento proceden de listas de llegada a Nueva York entre 1897 y 1957, digitalizadas del microfilm T715 de los National Archives. Las etiquetas fueron generadas por Claude leyendo paginas y tiras, es decir, se trata de un proceso de anotacion asistida por un modelo de lenguaje, sin que la model card detalle el volumen total de ejemplos ni la composicion exacta del dataset. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en modelos de vision de este tipo.

## Capacidades

- Deteccion de paginas con listas de pasajeros en imagenes escaneadas de documentos historicos.
- Localizacion de la columna de nombres y de las filas primera y ultima dentro de la pagina.
- Clasificacion de tiras de nombre en tres categorias: mecanografiada, manuscrita o ninguna.
- Inferencia en CPU sin necesidad de GPU.
- Integracion en pipelines de digitalizacion como paso previo a OCR o a extraccion estructurada.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues declaradas ni de modo de pensamiento.

## Casos de uso

- Digitalizacion masiva de archivos genealogicos: el modelo de pagina filtra rapidamente que imagenes de un lote contienen listas de pasajeros, reduciendo el volumen que debe pasar por OCR completo. En la evaluacion del autor conservo 20 de 20 paginas validas y descarto 28 de 29 no validas.
- Preprocesado para OCR especializado: una vez localizada la columna de nombres y los limites de filas, se pueden recortar las tiras y enviarlas a un motor de OCR o a un modelo de transcripcion, mejorando la precision al eliminar ruido de la pagina.
- Enrutamiento de documentos por tipo de escritura: el modelo de ordenacion permite separar tiras mecanografiadas de manuscritas (96,0% de acierto en 1.187 tiras de test) y dirigir cada grupo al motor de reconocimiento mas adecuado.
- Proyectos de historia familiar y genealogia: investigadores y aficionados pueden procesar microfilms T715 de los National Archives de forma local en un portatil, sin depender de servicios en la nube.
- Construccion de indices buscables de inmigracion: combinado con un OCR posterior, permite generar bases de datos consultables de nombres, fechas y procedencias a partir de colecciones de microfilm.
- Investigacion en preservation digital: sirve como componente de referencia para experimentos de layout analysis en documentos historicos con tipografias y caligrafias de epoca.
- Prototipado de bajo coste: al ocupar 9 MB en total y ejecutarse en CPU, es viable en entornos con recursos minimos, como Raspberry Pi o contenedores ligeros.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las metricas de evaluacion del autor:

| Modelo | Metrica | Resultado |
|---|---|---|
| `page_model.pt` | Paginas con lista conservadas (49 paginas no vistas) | 20 de 20 |
| `page_model.pt` | Paginas sin lista descartadas correctamente | 28 de 29 |
| `sort_model.pt` | Precision en 1.187 tiras de test | 96,0% |
| `sort_model.pt` | Confusion mecanografiado vs. manuscrito | 1 caso |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo logico al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; ambos modelos estan disenados para ejecutarse en CPU.
- GPU recomendadas: no necesarias. Cualquier GPU moderna puede acelerar la inferencia, pero no es un requisito.
- Cabe en GPU consumer: si, aunque el caso de uso previsto es CPU.
- Memoria RAM estimada: inferior a 1 GB para cargar los dos modelos y procesar imagenes individuales.
- Opciones de despliegue: PyTorch nativo (los state dicts se cargan con `torch.load` y las clases `Net` se importan del repositorio de GitHub). No hay versiones publicadas para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion facilitada. Como referencia cualitativa, se trata de un modelo de vision especializado de muy bajo peso (9 MB en total) que no compite con modelos de layout genericos como LayoutLMv3 o Donut, sino que ocupa un nicho concreto de deteccion de listas de pasajeros historicas. No se han publicado comparaciones directas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `horatio12/passenger-list-page-models` | no disponible (9 MB en pesos) | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con listas de llegada a Nueva York (1897-1957, microfilm T715); otros formatos, paises o epocas requeririan reentrenamiento segun el propio autor.
- Las etiquetas de entrenamiento fueron generadas por Claude, lo que introduce el sesgo y los errores del modelo anotador en el corpus.
- El modelo de pagina conservo 1 de 29 paginas sin lista en la evaluacion, es decir, existe una tasa de falsos positivos en el filtrado.
- El modelo de ordenacion confundio una vez mecanografiado con manuscrito en 1.187 tiras de test; en produccion con caligrafias diversas el error puede ser mayor.
- No es un modelo de lenguaje: no genera transcripciones, no razona y no soporta instrucciones en lenguaje natural.
- No se declaran idiomas soportados; el corpus es en ingles historico, por lo que su comportamiento con documentos en otros idiomas es desconocido.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; conviene tratar los resultados como preliminares.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- El tamano del repositorio aparece como 0.0 GB, coherente con los 9 MB de pesos, pero no se detalla la estructura completa de ficheros.

## Enlaces

- Hugging Face: https://huggingface.co/horatio12/passenger-list-page-models
- Repositorio GitHub del proyecto: https://github.com/jbyoung12/passenger-list-reader
- National Archives, microfilm T715 (listas de llegada a Nueva York): no disponible enlace directo en la informacion proporcionada.
