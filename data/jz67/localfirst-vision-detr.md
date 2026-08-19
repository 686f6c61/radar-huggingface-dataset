# jz67/localfirst-vision-detr

## Resumen

El modelo `jz67/localfirst-vision-detr` es un detector de objetos basado en la arquitectura DETR-ResNet-50, desarrollado por jz67 como backend por defecto del proyecto SMB Inventory Vision, un sistema de gestion de inventario para pequenos comercios. El modelo esta afinado especificamente para detectar caras de producto (product facings) en estanterias y mostradores de tiendas, un escenario donde los detectores genericos entrenados en COCO suelen fallar.

El repositorio contiene dos checkpoints especializados: `shelf/` para estanterias densas con 400 queries de deteccion, y `table/` para mesas, mostradores o articulos individuales. Ambos se distribuyen bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. El modelo se integra en un pipeline mayor donde la identificacion de SKUs se realiza en una etapa posterior mediante catalog-match, OCR o Gemini.

La relevancia actual del modelo radica en su enfoque local-first: permite ejecutar deteccion de inventario en local sin depender de APIs en la nube, con un tamano de repositorio de solo 0.3 GB, viable para hardware modesto. El autor afirma que rinde mejor que el backend YOLO opcional del mismo proyecto en escenas de estanterias comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR-ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura DETR (DEtection TRansformer) con backbone ResNet-50, originalmente desarrollada por Facebook AI. DETR trata la deteccion de objetos como un problema de prediccion de conjuntos directo, eliminando la necesidad de anchor boxes y post-procesamiento NMS. El checkpoint `shelf/` emplea `num_queries=400` para manejar escenas densas de estanterias, mientras que `table/` esta optimizado para escenas con un solo articulo o pocos objetos.

El entrenamiento se realizo sobre datos del dataset SKU110K y fotografias de comercios, aunque los metadatos de entrenamiento que listaban stems de fotos privadas de comerciantes no se incluyen en el repositorio. No se proporciona informacion sobre el numero de epocas, composicion exacta del dataset ni tecnicas de aumento de datos. Al ser un modelo de deteccion de objetos, no aplican tecnicas como RLHF o DPO.

## Capacidades

- Deteccion de objetos: dibuja bounding boxes alrededor de caras de producto en fotografias de inventario.
- Modo estanteria densa: el checkpoint `shelf/` detecta multiples SKUs en estanterias con hasta 400 queries simultaneas.
- Modo mostrador o articulo unico: el checkpoint `table/` esta optimizado para mesas, mostradores o un solo articulo.
- Integracion con pipeline de inventario: se conecta con etapas posteriores de catalog-match, OCR o Gemini para nombrar SKUs.
- Compatible con la libreria `transformers` de HuggingFace y con endpoints compatibles.
- No es un detector general COCO: no detecta objetos cotidianos fuera del dominio retail.
- No detecta personas: excluido explicitamente del uso previsto.

## Casos de uso

- Gestion de inventario para pequenos comercios: el modelo detecta automaticamente las caras de producto en fotos de estanterias, permitiendo contar existencias sin intervencion manual. Su modo `shelf/` con 400 queries maneja estanterias densas con multiples SKUs.
- Auditoria de lineal (planograma): verifica que los productos esten colocados segun el planograma previsto, detectando la posicion de cada cara de producto en la estanteria.
- Conteo de existencias en mostradores: el checkpoint `table/` detecta articulos individuales en mostradores o mesas de exposicion, util para tiendas con productos en exhibicion.
- Automatizacion de reposicion: integrado en un sistema de camaras locales, puede alertar cuando una estanteria tiene pocas unidades visibles de un producto.
- Sistema local-first sin conexion: al ser un modelo pequeno (0.3 GB) y con licencia Apache-2.0, puede desplegarse en un servidor local o en hardware de bajo consumo para tiendas sin conexion a internet fiable.
- Pipeline de inventario multimodal: combina la deteccion de bounding boxes con una etapa posterior de OCR o vision-language model (como Gemini) para identificar el SKU concreto de cada producto detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision o recall sobre SKU110K u otros datasets de evaluacion.

## Requisitos de hardware

- Tamano del repositorio: 0.3 GB, lo que indica pesos ligeros.
- No se proporcionan requisitos especificos de VRAM en la documentacion del modelo.
- Dada la arquitectura DETR-ResNet-50 y el tamano de los pesos, se estima que el modelo puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores), aunque no se confirma oficialmente.
- Opciones de despliegue: compatible con la libreria `transformers` de HuggingFace, lo que permite su uso con HuggingFace Inference Endpoints u otras herramientas compatibles con `DetrForObjectDetection`.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Licencia | Uso previsto |
|---|---|---|---|---|
| jz67/localfirst-vision-detr | DETR-ResNet-50 | no disponible | Apache-2.0 | Deteccion de inventario retail |
| facebook/detr-resnet-50 | DETR-ResNet-50 | no disponible | Apache-2.0 | Deteccion general COCO |
| YOLO (backend opcional del proyecto) | YOLO | no disponible | AGPL-3.0 | Deteccion de inventario retail |

El modelo se diferencia del DETR-ResNet-50 original de Facebook en que esta afinado especificamente para escenas de estanterias de comercios, mientras que el original fue entrenado en COCO. El backend YOLO opcional del mismo proyecto tiene una licencia AGPL-3.0, mas restrictiva que la Apache-2.0 de este modelo.

## Limitaciones y advertencias

- No es un detector general: no funciona bien fuera del dominio retail (estanterias, mostradores, articulos individuales).
- No detecta personas: el uso previsto excluye explicitamente la deteccion de personas.
- No identifica SKUs: solo dibuja bounding boxes; la identificacion del producto requiere una etapa adicional (OCR, catalog-match o Gemini).
- Los metadatos de entrenamiento no se incluyen, lo que limita la reproducibilidad y la auditoria del modelo.
- No se proporcionan benchmarks publicos, por lo que el rendimiento real en produccion debe validarse con datos propios.
- El checkpoint `table/` esta optimizado para un solo articulo o pocos objetos; puede fallar en escenas densas.
- No se especifican idiomas soportados, aunque al ser un modelo de vision esto no afecta a su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jz67/localfirst-vision-detr
- Repositorio SMB Inventory Vision: https://github.com/josiahzaki/smb-inventory-vision
