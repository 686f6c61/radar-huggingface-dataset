# changh95/rf-detr-p150

## Resumen

changh95/rf-detr-p150 es un port del modelo de deteccion de objetos RF-DETR-base de Roboflow (entrenado sobre las 91 clases de COCO) para ejecutarse integramente en una unica tarjeta Tenstorrent Blackhole p150a mediante tt-nn. No es un modelo entrenado desde cero: los pesos son los de Roboflow/rf-detr-base fijados al commit `7b95b089788e`, y lo que aporta este repositorio es el empaquetado y el codigo de servicio para el acelerador de Tenstorrent, con entrada de imagen y salida de cajas etiquetadas.

El modelo resuelve deteccion de objetos en tiempo real: recibe una imagen (que se reescala a 560x560), y devuelve detecciones con etiqueta, identificador de clase, puntuacion de confianza y caja delimitadora en pixeles de la imagen original. La inferencia medida en p150a es de aproximadamente 41 ms en dispositivo y unos 50 ms de extremo a extremo servida por HTTP, lo que equivale a unas 20 FPS con lote 1.

Su relevancia es doble. Por un lado, demuestra que un transformer de deteccion de la familia DETR puede servirse por HTTP sobre la pila tt-metal/tt-nn con una concordancia de IoU del 98,67% frente a la referencia fp32. Por otro, es un ejemplo de publicacion reproducible en el catalogo de Tenstorrent: repositorio de 5,9 GB empaquetado con tt-model-manager 0.1.0 (manifest schema 5.1) y licencia Apache-2.0 tanto en pesos como en codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion de la familia DETR (RF-DETR), con backbone y decoder de deteccion, ejecutado con tt-nn sobre tt-metal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | bf16 en dispositivo; no se publican variantes GGUF, INT8, FP8 ni AWQ |
| Idiomas soportados | no disponible; las 91 clases COCO se devuelven etiquetadas en ingles |
| Licencia | Apache-2.0 (pesos y codigo de port y serving) |
| Formato de pesos | Pesos originales de Roboflow/rf-detr-base descargados a la cache de HuggingFace (no incluidos en la imagen); codigo de servicio en `code/` |
| Resolucion de entrada | 560x560 fija, con reescalado que aplasta la relacion de aspecto |
| Numero de clases | 91 (COCO) |
| Tamano del repositorio | 5,9 GB |
| Hardware objetivo | 1x Tenstorrent Blackhole p150a (mesh P150), validado con tt-metal `v0.78.0-dev20260820` (main `8b98410e730`) |
| API de servicio | `POST /predict`, `GET /health`, `GET /info` en el puerto 20000 |

## Arquitectura y entrenamiento

RF-DETR pertenece a la familia de detectores DETR: un modelo de deteccion basado en transformer que predice conjuntos de objetos (etiqueta, puntuacion y caja) en lugar de depender de anclas y supresion de no maximos. El modelo se entreno sobre COCO con 91 clases, segun la informacion de la model card, que remite al articulo arXiv:2511.09554 para los detalles del metodo. Los hiperparametros de entrenamiento, el numero de tokens vistos, la composicion exacta del dataset y si se aplicaron etapas de ajuste con RLHF o DPO no estan disponibles en la informacion proporcionada, ya que este repositorio es un port y no una replica del entrenamiento.

La innovacion tecnica de este repositorio esta en la ejecucion, no en el entrenamiento. El grafo completo del RF-DETR-base se ejecuta en una unica p150a con precision bf16 usando tt-nn, y el autor reporta una correlacion de Pearson (PCC) de 0,998 a 0,9998 en los mapas de caracteristicas del backbone frente a la implementacion de referencia en torch, lo que indica una degradacion numerica muy contenida. El servicio expone inferencia sincrona por HTTP con preprocesado, inferencia y postprocesado medidos por separado, y publica la procedencia exacta del binario (commit de tt-metal `8b98410e730bb504fea43a88609756e34821d91d` y digest sha256 de `code/` `7eda8ae5eb35aa1e`).

## Capacidades

- Deteccion de objetos: devuelve una lista de detecciones con `label`, `label_id`, `score` y `box` en formato `[x1, y1, x2, y2]` en pixeles de la imagen original.
- Clasificacion dentro de las 91 clases de COCO, incluidas categorias frecuentes como personas, vehiculos, animales y objetos de interior.
- Umbral de confianza configurable por peticion mediante el parametro `threshold` (valor por defecto 0,5).
- Limite de detecciones configurable por peticion mediante `max_detections` (valor por defecto 100).
- Ordenacion de resultados por puntuacion descendente.
- Entrada de imagen en base64, en formato PNG o JPEG, con una imagen por peticion.
- Endpoints de salud y metadatos (`GET /health`, `GET /info`) para integracion en orquestadores.
- Metricas de tiempo desglosadas en la propia respuesta (`preprocess`, `inference`, `postprocess`, `total`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, uso de agentes ni capacidades conversacionales: es exclusivamente un detector de objetos de una sola pasada.

## Casos de uso

- Inspeccion visual en linea de fabricacion: el modelo se ejecuta en una p150a junto a la linea de produccion y clasifica piezas o detecta defectos dentro de las clases COCO relevantes, con una latencia de unos 50 ms por imagen que permite cubrir cadenas de captura de 20 FPS.
- Pre-anotacion de datasets de vision: el endpoint `/predict` se puede invocar desde un script de etiquetado para generar cajas iniciales sobre lotes de imagenes y reducir el trabajo manual de anotacion antes de una revision humana.
- Monitorizacion de trafico y conteo de vehiculos: al detectar coches, autobuses, camiones y motocicletas, sirve como modulo de conteo en aplicaciones de analisis de aforo viario cuando solo se necesitan las 91 clases COCO.
- Control de inventario en retail: deteccion de productos y personas en imagenes de estanteria o de tienda, integrada en un backend que consume el JSON de detecciones con puntuaciones para filtrar falsos positivos.
- Analisis de imagenes en el borde (edge) con hardware no CUDA: al ejecutarse integramente en una Blackhole p150a mediante tt-nn, encaja en despliegues donde se quiere evitar una GPU NVIDIA en el nodo de inferencia.
- Automatizacion de pipelines de ingesta documental o fotografica: filtrado de imagenes irrelevantes o etiquetado automatico previo a un sistema de busqueda, aprovechando el endpoint HTTP y los parametros `threshold` y `max_detections` por peticion.
- Robotica y automatizacion industrial: modulo de percepcion para tareas de agarre o evitacion de obstaculos limitadas a categorias COCO, con la p150a como acelerador dedicado y sin compartir el dispositivo con otra carga de trabajo.
- Vigilancia y seguridad perimetral: deteccion de personas y vehiculos en fotogramas concretos, con la salvedad de que el modelo procesa una imagen por peticion y no implementa seguimiento entre fotogramas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Concordancia de Detection-IoU frente a la referencia fp32 (imagen de demo) | 98,67 (2 gatos + 2 mandos; IoU por objeto entre 0,96 y 0,99) |
| PCC de los mapas de caracteristicas del backbone frente a torch | 0,998-0,9998 |
| Inferencia servida por HTTP (caliente, lote 1, 560x560) | ~41 ms en dispositivo, ~50 ms de extremo a extremo (~20 FPS) |
| Desglose de tiempos del ejemplo de la model card | preprocesado 2,7 ms; inferencia 43,4 ms; postprocesado 0,4 ms; total 69,4 ms |
| Ejemplo de detecciones devueltas | 5 detecciones sobre una imagen de 640x480 con entrada de 560x560; `cat` con score 0,960 y `remote` con score 0,903 |

No se han publicado en la informacion disponible resultados de mAP sobre COCO ni comparaciones numericas con otros detectores. Las cifras anteriores miden fidelidad numerica frente a la implementacion de referencia y latencia, no calidad absoluta de deteccion.

## Requisitos de hardware

- Acelerador obligatorio: una Tenstorrent Blackhole p150a. El port esta validado unicamente en una p150a y con el mesh `P150`; no se documenta soporte para multiples tarjetas ni para otras generaciones de hardware Tenstorrent.
- No se publica la VRAM ni la memoria de dispositivo necesaria; el repositorio ocupa 5,9 GB, pero los pesos se descargan aparte desde Roboflow/rf-detr-base a la cache de HuggingFace.
- No es compatible con GPU NVIDIA, AMD ni con ejecucion en CPU a traves de este repositorio: la ruta de inferencia es tt-nn sobre tt-metal.
- Pila de software: tt-metal `v0.78.0-dev20260820` (main `8b98410e730`) y tt-model-manager 0.1.0 con manifest schema 5.1, segun la validacion del autor.
- Despliegue mediante `tt-model pull changh95/rf-detr-p150 --with-weights` y `tt-model serve changh95/rf-detr-p150`, o con `tt serve changh95/rf-detr-p150`; el servicio escucha en el puerto 20000 o en el siguiente puerto libre.
- Latencia y throughput medidos: ~41 ms por inferencia en dispositivo y ~50 ms de extremo a extremo con lote 1 a 560x560, aproximadamente 20 FPS en regimen caliente.
- El lote esta fijado a 1 y cada peticion admite una sola imagen, por lo que el throughput se escala sumando instancias o dispositivos, no aumentando el batch.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|---|
| changh95/rf-detr-p150 | Port de RF-DETR-base a tt-nn | no disponible | 560x560 fija | Apache-2.0 | 1x Tenstorrent Blackhole p150a | HuggingFace |
| Roboflow/rf-detr-base | Modelo original en PyTorch del que deriva este port | no disponible | no detallada en la informacion disponible | Apache-2.0 | GPU CUDA o CPU (no detallado) | HuggingFace y GitHub de Roboflow |
| Otros detectores de la familia DETR (DETR, RT-DETR) o de la familia YOLO | no disponibles en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es entre el modelo original y este port: comparten pesos y licencia, y difieren en el backend de ejecucion (tt-nn sobre Blackhole frente a PyTorch sobre CUDA) y en el formato de servicio (API HTTP con `/predict` frente a uso como libreria). No se dispone de datos de rendimiento del modelo original en la informacion proporcionada, por lo que no es posible cuantificar la perdida o ganancia frente a el mas alla del IoU del 98,67% y del PCC del backbone reportados.

## Limitaciones y advertencias

- Todas las imagenes se aplastan a 560x560, lo que deforma la relacion de aspecto y puede degradar la deteccion en imagenes muy panoramicas o muy verticales.
- Se admite una sola imagen por peticion y el lote esta fijado a 1; no hay procesamiento por lotes.
- La inferencia se ejecuta en bf16, por lo que las puntuaciones difieren ligeramente de la referencia fp32, tal como reconoce el propio autor.
- La API no es compatible con OpenAI; `GET /v1/models` es un stub para que la tarjeta de disponibilidad de tt-model no devuelva 404, no una implementacion real del estandar.
- Validado exclusivamente en tt-metal `v0.78.0-dev20260820` (main `8b98410e730`) y en una unica p150a; cambios de version de la pila o el uso de varias tarjetas no estan cubiertos.
- Requiere hardware Tenstorrent Blackhole; no hay ruta de ejecucion en GPU NVIDIA, AMD ni CPU a traves de este repositorio.
- El modelo solo detecta las 91 clases de COCO. Cualquier categoria especifica de un dominio (por ejemplo, defectos industriales concretos o tipos de producto) requiere otro modelo o un ajuste fino, que este repositorio no incluye.
- Las etiquetas se devuelven en ingles y la informacion sobre idiomas soportados no esta disponible.
- Riesgo de falsos positivos y falsos negativos inherente a un detector de objetos; el umbral de 0,5 por defecto debe calibrarse por caso de uso.
- Licencia Apache-2.0 tanto en los pesos como en el codigo de port y serving, lo que permite uso comercial, pero conviene revisar el enlace de licencia del proyecto original de Roboflow por si incorpora condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se publico en septiembre de 2026: se trata de un artefacto muy reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/rf-detr-p150
- Modelo base (pesos): https://huggingface.co/Roboflow/rf-detr-base
- Articulo de referencia: https://arxiv.org/abs/2511.09554
- Codigo original de RF-DETR: https://github.com/roboflow/rf-detr
- Port a Tenstorrent: https://github.com/changh95/tt-RF-DETR
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal usado en la build: https://github.com/tenstorrent/tt-metal/commit/8b98410e730bb504fea43a88609756e34821d91d
- Licencia del proyecto original: https://github.com/roboflow/rf-detr/blob/main/LICENSE
