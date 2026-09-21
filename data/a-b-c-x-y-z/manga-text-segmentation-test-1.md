# a-b-c-x-y-z/Manga-Text-Segmentation-Test-1

## Resumen

Manga-Text-Segmentation-Test-1 es un modelo de segmentacion semantica de imagen, publicado por el usuario a-b-c-x-y-z, cuyo objetivo es detectar a nivel de pixel las regiones de texto en paginas de manga. Se trata de una prueba de concepto supervisada, no de un modelo de produccion: la propia model card lo describe como un checkpoint experimental entrenado con pocos datos. El modelo sustituye la version de 2025 del mismo autor por una arquitectura mas pesada, construida en Keras 3 y compuesta por un backbone DINOv3 ViT-L/16, un encoder EfficientNetV2-M, un modulo de proyeccion FAPM y un decodificador UNet 3+.

El problema que resuelve es concreto y bien delimitado: dado un escaneo de pagina de manga, generar una mascara binaria de texto utilizable para tareas de limpieza, traduccion, reentintado o white-out. La salida es una mascara semantica unica, no instancias separadas de texto, y las anotaciones en negro y rosa del dataset de origen se tratan deliberadamente como una sola clase de primer plano.

Es relevante ahora como referencia tecnica para quienes trabajan en vision por computador aplicada a comics y manga, y como ejemplo de combinacion de un backbone auto-supervisado moderno (DINOv3) con un decodificador de segmentacion densa en un stack Keras puro. Su disponibilidad practica es limitada: cero descargas, cero likes, licencia no especificada y ausencia total de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv3 ViT-L/16 + encoder EfficientNetV2-M + modulo Fidelity-Aware Projection Module (FAPM) + decodificador UNet 3+ |
| Parametros totales | no disponible (la model card no publica el recuento; el checkpoint integra ViT-L/16, EfficientNetV2-M, FAPM y UNet 3+) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagen; la entrada es una pagina a resolucion nativa, con padding inferior y derecho hasta un multiplo de 16 pixeles) |
| Tipos de cuantizacion | no disponible (no se documenta ninguna; el unico artefacto publicado es el checkpoint HDF5 de Keras) |
| Idiomas soportados | no disponible (la tarea es deteccion de texto en paginas de manga; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | Keras HDF5 (`model.weights.h5`); implementacion en Keras 3 dentro de `dinov3_mask2former/` |
| Tamano del repositorio | 1,7 GB |
| Pipeline declarado | image-segmentation |
| Tipo de tarea | Segmentacion semantica binaria de texto (mascara, sin IDs de instancia) |
| Resolucion de entrada | Nativa de la pagina; sin redimensionado, recorte, tiling ni stitching |

## Arquitectura y entrenamiento

La arquitectura combina dos extractores de caracteristicas con un decodificador de segmentacion densa. El backbone principal es un DINOv3 ViT-L/16, un transformer de vision con parches de 16 pixeles; a este se anade un encoder EfficientNetV2-M, y las caracteristicas de ambos pasan por el Fidelity-Aware Projection Module (FAPM) antes de entrar en el decodificador UNet 3+, que produce la mascara semantica final. El modelo se construye y carga en Keras 3, con la implementacion del modelo en el directorio `dinov3_mask2former/` del repositorio y una entrada de inferencia autocontenida en `inference.py`.

El entrenamiento es de tipo supervisado y se realizo sobre las anotaciones de pixel disponibles de Manga109 y anime2. La model card indica explicitamente que los colores de anotacion negro y rosa se tratan como una unica clase de primer plano, de modo que la salida es una mascara semantica de texto y no una segmentacion por instancias. No se documentan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, ni el uso de tecnicas de alineacion como RLHF o DPO, algo por otra parte esperable en un modelo de vision de este tipo.

Como innovacion tecnica destacable, la inferencia preserva la resolucion nativa de la pagina y solo aplica padding en los bordes inferior y derecho hasta un multiplo del tamano de parche de 16 pixeles de DINOv3, evitando redimensionados, recortes, tiling o stitching. El autor advierte de que esto implica que las paginas grandes pueden requerir mucha RAM, ya que la pasada forward se realiza completa sobre la imagen a resolucion original.

## Capacidades

- Segmentacion semantica de texto a nivel de pixel en paginas de manga, con salida de mascara binaria de primer plano.
- Generacion de una mascara semantica unica: no distingue instancias de texto ni tipos de rotulacion.
- Inferencia a resolucion nativa de la pagina, sin redimensionado, recorte ni tiling intermedio.
- Fusion de dos vias de caracteristicas (DINOv3 ViT-L/16 y EfficientNetV2-M) mediante el modulo FAPM.
- Demo Gradio local con control de umbral de la mascara y visualizacion de tres salidas: overlay, mascara binaria y previsualizacion de white-out.
- Tratamiento unificado de las anotaciones de color negro y rosa como una sola clase de texto.
- No soporta tool calling ni function calling.
- No estan documentadas capacidades de agente ni de razonamiento multi-paso.
- No hay soporte multilingue declarado, ni capacidades de vision general, audio o thinking mode.

## Casos de uso

- Digitalizacion y limpieza de escaneos de manga: el modelo genera una mascara binaria de texto que puede usarse para eliminar la rotulacion original antes de aplicar una nueva capa de texto en un pipeline editorial.
- Traduccion y retipografiado (scanlation): la mascara sirve como entrada para un sistema de OCR y traduccion posterior, delimitando exactamente las regiones con texto sobre las que actuar sin tocar el dibujo.
- Previsualizacion de white-out en herramientas de edicion: el demo incluye una vista de blanqueado que permite al editor comprobar rapidamente que regiones se borrarian y ajustar el umbral de la mascara.
- Preprocesado para OCR de comics: al aislar el texto del resto de la pagina, se reduce el ruido de entrada a los motores de reconocimiento de caracteres y mejora su tasa de acierto.
- Indexacion y busqueda de contenido en archivos de manga: la deteccion de regiones de texto permite generar metadatos por pagina y habilitar busquedas sobre paginas escaneadas.
- Investigacion en segmentacion densa: el repositorio sirve como referencia reproducible de un stack Keras 3 que combina DINOv3 ViT-L/16, EfficientNetV2-M, FAPM y UNet 3+ para segmentacion semantica de dos clases (texto y fondo).
- Generacion de datasets anotados: la salida del modelo puede emplearse como preanotacion automatica para que anotadores humanos corrijan despues, reduciendo el coste de etiquetado de nuevas paginas.
- Formacion y prototipado: al ser una prueba de concepto con checkpoint y script de inferencia incluidos, es util para experimentar con backbones auto-supervisados en tareas de segmentacion con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de IoU, Dice, precision, recall ni comparaciones cuantitativas con otros modelos, y el repositorio no aporta ninguna tabla de evaluacion.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia derivada, el unico checkpoint disponible ocupa 1,7 GB en el repositorio (formato HDF5 sin cuantizar), por lo que el peso de los parametros en memoria es de ese orden; el consumo real de inferencia es mayor por activaciones, y el autor advierte de que las paginas grandes pueden exigir mucha RAM al procesarse en una sola pasada a resolucion nativa.
- GPU recomendadas: no disponibles. No se documentan GPU probadas ni requisitos minimos.
- Cabe en GPU de consumo: no confirmado. El tamano del checkpoint (1,7 GB) es compatible en terminos de memoria de pesos con tarjetas de consumo con 8 GB o mas de VRAM, pero la ausencia de datos de activaciones y de la resolucion de prueba impide confirmarlo.
- CPU: inferencia posible en teoria al ser Keras/TensorFlow, pero sin datos de latencia publicados y con el aviso explicito sobre el consumo de RAM en paginas a resolucion nativa.
- Opciones de despliegue: Keras 3 con la implementacion de `dinov3_mask2former/`; demo Gradio mediante `python inference.py`; dependencias en `requirements.txt`. No se documentan exportaciones a GGUF, ONNX, TensorRT ni integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / arquitectura | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manga-Text-Segmentation-Test-1 | Segmentacion semantica de texto en manga | DINOv3 ViT-L/16 + EfficientNetV2-M + FAPM + UNet 3+ | Resolucion nativa con padding a multiplo de 16 | no disponible | 0 descargas, 0 likes, 1,7 GB |
| Manga-Text-Segmentation-2025 | Segmentacion de texto en manga (version anterior del mismo autor) | no disponible en la informacion proporcionada | no disponible | no disponible | Referenciado como demo de 2025, misma fuente de imagen de ejemplo |
| Modelos genericos de segmentacion (por ejemplo, familias tipo SAM o Mask2Former) | Segmentacion de proposito general | no disponible en la informacion proporcionada | no disponible | no disponible | No se dispone de datos comparativos en esta busqueda |

La informacion disponible no permite una comparacion cuantitativa: no hay parametros publicados, ni metricas, ni resultados de benchmark para este modelo ni para las alternativas mencionadas. La unica comparacion documentada por el autor es cualitativa: este checkpoint sustituye al modelo de la demo de 2025 del mismo repositorio.

## Limitaciones y advertencias

- Es una prueba de concepto experimental entrenada con pocos datos, no un modelo de produccion; el propio autor lo califica como "experimental small-data checkpoint".
- Salida semantica, no instanciada: no separa textos distintos dentro de una misma pagina, solo indica que pixeles son texto.
- Las anotaciones de color negro y rosa se han unificado en una sola clase de primer plano, lo que simplifica la tarea pero elimina cualquier distincion de tipo de texto.
- Consumo elevado de memoria: la inferencia se hace en una unica pasada a resolucion nativa, por lo que las paginas grandes pueden requerir mucha RAM.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido, lo que supone un riesgo legal relevante para cualquier despliegue en produccion.
- No hay resultados de benchmarks publicados, por lo que no es posible estimar su precision real ni compararla con alternativas.
- No se declaran idiomas soportados ni se detalla la composicion del dataset de entrenamiento (Manga109 y anime2), lo que limita conocer su cobertura y sus sesgos.
- Los sesgos conocidos no estan documentados en la informacion disponible; cabe esperar un sesgo hacia el estilo grafico y las convenciones tipograficas de los titulos presentes en Manga109 y anime2.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la mascara, sin tasas de error publicadas.
- Dependencia de una implementacion especifica en Keras 3 incluida en el repositorio; no hay formatos de pesos alternativos ni herramientas de despliegue estandar.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte de la comunidad o de correcciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a-b-c-x-y-z/Manga-Text-Segmentation-Test-1
- Modelo anterior del mismo autor, Manga-Text-Segmentation-2025: https://huggingface.co/a-b-c-x-y-z/Manga-Text-Segmentation-2025/
- Imagen de entrada de ejemplo (Manga109, © Tadashi Sato): https://github.com/user-attachments/assets/251a8aa0-f3bd-4f79-953e-067f777fad0d
- Archivos del repositorio citados en la model card: `model.weights.h5`, `inference.py`, `dinov3_mask2former/`, `requirements.txt` (accesibles desde la pagina del modelo en HuggingFace)
- Nota sobre la busqueda web: los resultados devueltos en esta consulta no guardan relacion con el modelo (corresponden a articulos linguisticos sobre la letra "a" en frances) y no aportan papers, repositorios ni demos adicionales. No se dispone de enlaces a publicaciones tecnicas, blogs ni espacios de demostracion en linea.
