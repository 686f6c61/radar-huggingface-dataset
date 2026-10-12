# jinwoo-cho/detail-crops-rfdetr

## Resumen

Detail page region detector (RF-DETR Large) es un modelo de deteccion de objetos desarrollado por el usuario jinwoo-cho y publicado en HuggingFace bajo licencia Apache 2.0. Su funcion es localizar tres tipos de regiones sobre paginas de detalle de producto de comercio electronico del mercado coreano: `product_image` (fotografias de producto), `product_info` (textos y tablas de informacion, paneles de opciones, logotipos y marcas de certificacion) y `other` (texto de marketing y avisos). El objetivo practico es seleccionar los recortes (crops) que posteriormente leera un extractor de atributos, aportando unicamente las cajas de `product_image` y `product_info` que no estan anidadas dentro de otra.

El modelo parte de RF-DETR Large, un detector de la familia DETR orientado a tiempo real, y se ha afinado a una resolucion de entrada de 1024 durante 18 epocas sobre 4 GPU H100 (mejor epoca la 15, con parada temprana). Se entreno con unas 72.000 paginas de entrenamiento (142.000 tiles) procedentes de fichas de producto coreanas, con cajas generadas por un pipeline de etiquetado automatico basado en un LLM, no por anotadores humanos. El repositorio ocupa 0,1 GB y el unico peso publicado es `checkpoint_best_total.pth`.

Es relevante ahora porque aborda un problema muy concreto y costoso en pipelines de e-commerce: la seleccion de regiones utiles en paginas de producto extremadamente largas, donde la deteccion directa no es viable y se requiere una estrategia de tiling. El modelo, ademas, forma parte del ecosistema RF-DETR, lo que facilita su integracion en flujos de trabajo ya existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Large (detector transformer de la familia DETR orientado a tiempo real; detalles internos no especificados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, deteccion de objetos por tiles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica como modelo de texto; los datos de entrenamiento proceden de paginas de producto en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoint_best_total.pth`) |

Resolucion de entrada: 1024 px. Clases detectadas: `product_image`, `product_info`, `other`. Tamano del repositorio: 0,1 GB.

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Large, un detector de objetos tipo transformer (familia DETR) pensado para inferencia en tiempo real y distribuido a traves de la libreria `rfdetr`. La model card no detalla la composicion interna (backbone, numero de parametros ni mecanismos de atencion) ni el numero exacto de parametros; unicamente se indica que el afinado se realizo a resolucion de entrada 1024.

El entrenamiento se llevo a cabo durante 18 epocas sobre 4 GPU H100, con la mejor epoca en la 15 y parada temprana posterior. El conjunto de datos consta de aproximadamente 72.000 paginas de detalle de producto coreanas, que se dividen en 142.000 tiles. Las cajas fueron generadas por un pipeline de etiquetado basado en un LLM, no mediante anotacion humana, y ni las imagenes ni las etiquetas se han publicado. Durante la inferencia, el modelo se aplica sobre tiles de ancho completo con solapamiento del 20 % y altura 1,4 veces la anchura, y las detecciones se fusionan de nuevo en coordenadas de pagina; el codigo de tiling, union de costuras y seleccion de crops esta disponible en el Space de demostracion (`detector/tiling.py`, `detector/regions.py`). No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Deteccion de objetos sobre paginas de detalle de producto largas, mediante tiling con solapamiento y fusion de detecciones.
- Clasificacion de cada region en tres categorias: `product_image`, `product_info` y `other`.
- Seleccion de crops: identifica las cajas de `product_image` y `product_info` que no estan anidadas dentro de otra.
- Localizacion de fotografias de producto (recortes, tomas ambientadas, tomas con modelo, primeros planos).
- Deteccion de bloques de informacion de producto, incluidas tablas, paneles de opciones y componentes, primeros planos de etiquetas, logotipos y marcas de certificacion.
- Deteccion de texto de marketing y avisos dentro de la clase `other`.
- Ejecucion sobre un unico tile directamente mediante la API `RFDETRLarge` con umbral configurable (`threshold`, por ejemplo 0.3).
- No dispone de capacidades de generacion de texto, razonamiento, codigo ni vision generativa; es exclusivamente un detector.

## Casos de uso

- Extraccion de atributos en fichas de producto de e-commerce coreano: el modelo selecciona las regiones `product_info` y `product_image` que merece la pena procesar, reduciendo el volumen de datos que se envia a un extractor de atributos posterior.
- Pipeline de catalogacion automatica: al identificar y separar las imagenes de producto del texto informativo, permite enrutar cada crop al modulo correspondiente (vision o NLP) dentro de un sistema de ingesta de catalogo.
- Preprocesado para OCR y extraccion multimodal: al aislar tablas, paneles de opciones y etiquetas mediante la clase `product_info`, mejora la precision de los sistemas de reconocimiento de texto que operan sobre fichas muy largas.
- Buscador visual de producto: las cajas de `product_image` permiten recortar las fotografias relevantes para indexarlas en un sistema de recuperacion por similitud visual.
- Scraping e ingesta estructurada de marketplaces: sobre paginas que miden mucho mas que la ventana de un detector convencional, la estrategia de tiling del modelo permite procesarlas de forma determinista y consolidar las detecciones en coordenadas de pagina.
- Control de calidad de fichas de producto: verificar que una pagina de detalle contiene las imagenes y los bloques informativos esperados, detectando ausencias o desestructuracion del contenido.
- Moderacion y clasificacion de contenido: la clase `other` (marketing y avisos) ayuda a separar el contenido promocional del informativo para distintas politicas de tratamiento.
- Generacion de conjuntos de datos de layout: las cajas detectadas pueden usarse para anotar automaticamente paginas nuevas y alimentar el reentrenamiento de modelos de layout.

## Benchmarks y rendimiento

Evaluacion a nivel de pagina sobre 11.422 paginas de validacion etiquetadas por el mismo pipeline de anotacion automatica. Los resultados miden la concordancia con dicho pipeline, no la precision frente a anotacion humana.

| Clase | mAP50:95 | mAP50 | mAP75 |
|---|---|---|---|
| `product_image` | 0.774 | 0.889 | 0.789 |
| `product_info` | 0.421 | 0.564 | 0.418 |
| `other` | 0.431 | 0.551 | 0.437 |
| Media | 0.542 | 0.668 | 0.548 |

Metricas adicionales de extraccion con un umbral de score de 0.05: 150 de 18.705 objetivos de extraccion no detectados (0,80 %), 2,5 crops por pagina y un 28 % de los crops que no contienen ningun objetivo.

No se han publicado comparaciones directas contra otros detectores en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 4 GPU H100 (segun la model card).
- Inferencia: no se especifica en la informacion disponible. El repositorio ocupa 0,1 GB, lo que sugiere un peso de checkpoint relativamente ligero, pero no se confirma el numero de parametros ni la VRAM exacta necesaria.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado en la informacion disponible; dado que se trata de una variante Large a resolucion 1024, es probable que requiera una GPU con memoria moderada, pero no hay datos que lo confirmen.
- Opciones de despliegue: la libreria `rfdetr` (clase `RFDETRLarge`), con carga del checkpoint via `huggingface_hub.hf_hub_download`. No se mencionan otros runners como vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Clases | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| detail-crops-rfdetr (este modelo) | RF-DETR Large afinado | 1024 | 3 (layout de e-commerce) | Apache 2.0 | mAP50 medio 0.668 en validacion propia |
| RF-DETR Large (base) | Detector general COCO | configurable | 80 (COCO) | Apache 2.0 (segun el proyecto RF-DETR) | No comparable directamente: tarea y clases distintas |
| Otros detectores de layout de documentos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks comparativos frente a alternativas de la misma categoria en la informacion proporcionada. La comparacion con RF-DETR Large base no es valida para medir rendimiento, ya que este modelo esta afinado sobre un dominio y un conjunto de clases completamente distintos (layout de e-commerce coreano frente a las 80 clases de COCO).

## Limitaciones y advertencias

- Entrenado exclusivamente con paginas de marketplaces coreanos; los disenos y los idiomas distintos del coreano no han sido probados.
- Las etiquetas de entrenamiento y de evaluacion proceden de un pipeline automatico basado en un LLM, no de anotacion humana; los resultados miden la concordancia con ese pipeline, no la precision real frente a criterio humano.
- Las imagenes y etiquetas del conjunto de datos no se han publicado, por lo que no es posible reproducir el entrenamiento ni auditar la calidad de las anotaciones.
- Las miniaturas pequenas (lado corto inferior a unos 300 px) se localizan con menor precision.
- Una caja cortada por el borde de un tile solo se vuelve a unir si ambas partes tocan el borde; en caso contrario puede quedar dividida en dos.
- La clase `product_info` y la clase `other` presentan un rendimiento notablemente inferior al de `product_image` (mAP50 de 0.564 y 0.551 frente a 0.889), lo que limita su uso en escenarios que dependan de una deteccion precisa de bloques informativos o de texto promocional.
- El 28 % de los crops seleccionados no contiene ningun objetivo, lo que introduce ruido en el pipeline consumidor.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto; el riesgo equivalente es la deteccion erronea o la clasificacion incorrecta de regiones, especialmente en clases con mAP bajo.
- No se han publicado datos sobre sesgos; al ser un modelo de vision entrenado en un dominio y una region concretos, cabe esperar un sesgo hacia los layouts y estilos de esos marketplaces.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente las condiciones de la libreria `rfdetr` y de los pesos base RF-DETR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jinwoo-cho/detail-crops-rfdetr
- Demo Space: https://huggingface.co/spaces/jinwoo-cho/detail-crops-demo
- Libreria `rfdetr` (mencionada en la model card, sin URL explicita): no disponible
- Paper, blog o repositorio adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
