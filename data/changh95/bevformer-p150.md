# changh95/bevformer-p150

## Resumen

BEVFormer-p150 es un paquete de despliegue del detector 3D BEVFormer-small, un modelo de deteccion de objetos 3D a partir unicamente de camaras para conduccion autonoma. Lo desarrolla el autor changh95 a partir de los pesos oficiales del BEVFormer-small de Autoware (`autoware_tensorrt_bevformer`), publicados originalmente por los autores de BEVFormer (Li et al., arXiv:2203.17270). El modelo resuelve la deteccion de cajas 3D con velocidad para las 10 clases de nuScenes a partir de seis camaras surround-view, calibracion y pose del vehiculo.

Tecnicamente es una red de 59,5M de parametros que combina un backbone ResNet-101 con convoluciones deformables en las etapas 3 y 4, un FPN de un nivel, un encoder BEV espacio-temporal de 3 capas sobre una vista aerea de 150x150 que atiende al BEV del fotograma anterior y a las seis camaras, y un decoder DETR de 6 capas con 900 queries. Cada fotograma consume unos 1,97 TFLOPs con seis entradas de red de 1280x736.

La relevancia de esta publicacion es el empaquetado: no es un modelo nuevo, sino una adaptacion para ejecutarse en hardware Tenstorrent p150 mediante `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1), con dos perfiles de servicio (`fast` en bf16/bfp8/HiFi2 y `accurate` en fp32/HiFi4) y un servidor HTTP propio en el puerto 20000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido CNN-transformer: ResNet-101 con convoluciones deformables (etapas 3 y 4) + FPN de un nivel + encoder BEV espacio-temporal de 3 capas + decoder DETR de 6 capas con 900 queries |
| Parametros totales | 59,5M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); ventana temporal de un fotograma previo de BEV por stream |
| Tipos de cuantizacion | bf16 (pesos, perfil `fast`), bfp8 en la tercera etapa del backbone (perfil `fast`), fp32 (pesos, perfil `accurate`); precisiones HiFi2 y HiFi4 respectivamente |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (re-hospedaje del checkpoint `bevformer_small_epoch_24`); paquete de despliegue en imagen Docker con manifiesto de `tt-model-manager` |

## Arquitectura y entrenamiento

BEVFormer-small es un detector 3D camera-only que proyecta las seis imagenes de camara a una representacion bird's-eye view (BEV) de 150x150 mediante atencion espacial (spatial cross-attention con las features de las camaras) y atencion temporal (al BEV del fotograma anterior, que se mantiene en el dispositivo como historial). El backbone es una ResNet-101 con convoluciones deformables en las etapas 3 y 4 y un FPN de un solo nivel; el decoder es de tipo DETR con 6 capas y 900 queries que produce cajas 3D con puntuacion y velocidad para las 10 clases de nuScenes, mapeadas ademas a las etiquetas de Autoware.

Los pesos son los oficiales del checkpoint `bevformer_small_epoch_24` publicado por los autores de BEVFormer (fundamentalvision/BEVFormer), re-hospedados como safetensors en `changh95/bevformer-small-weights` (commit `0e6d9d9`) sin modificacion. Esta ficha no dispone de detalles sobre el dataset de entrenamiento (composicion, numero de tokens o iteraciones) ni sobre el uso de RLHF/DPO, que no aplican a un detector de vision; la model card remite a la model card original para los detalles de entrenamiento. La innovacion tecnica del paquete es el grafo de ejecucion derivado de la exportacion TensorRT que despliega Autoware, junto con el pre y post-procesado del nodo `autoware_tensorrt_bevformer` (redimensionado a 1600x900, normalizacion, geometria de camara, decodificacion top-300 y mapeo de etiquetas).

## Capacidades

- Deteccion de objetos 3D camera-only: cajas 3D con puntuacion y velocidad para las 10 clases de nuScenes, con la etiqueta correspondiente de Autoware.
- Entrada de seis camaras surround-view (`CAM_FRONT`, `CAM_FRONT_RIGHT`, `CAM_FRONT_LEFT`, `CAM_BACK`, `CAM_BACK_LEFT`, `CAM_BACK_RIGHT`) con sus intrinsecos y transformaciones `T_ref_from_camera`.
- Razonamiento temporal: mantiene el BEV del fotograma anterior por stream, con hasta 4 streams independientes que conservan su propio historial.
- Entrada opcional de dinamica CAN del vehiculo en `base_link` (`accel`, `rotation_rate`, `velocity`) y de la pose del ego (`T_world_from_ego`) para alinear el BEV previo.
- Parametros de inferencia ajustables: `score_threshold` (por defecto 0,2), `max_num` (300) y `physical_boxes` (por defecto false).
- Formatos de salida JSON (por defecto) o npz (arrays sin perdida codificados en base64).
- Servidor HTTP propio con `POST /predict`, `GET /health` e `GET /info`; `GET /v1/models` es un stub y no es una API de chat compatible con OpenAI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de vision puro.

## Casos de uso

- Percepcion para conduccion autonoma estilo Autoware: el modelo recibe las seis camaras, la calibracion y la pose del ego y devuelve cajas 3D con velocidad, reproduciendo la salida del nodo `autoware_tensorrt_bevformer` para integrarse en una pila de percepcion existente.
- Procesamiento offline de grabaciones de conduccion: con `POST /predict` por fotograma y streams con historial temporal se pueden anotar secuencias de nuScenes-like para generar datasets de deteccion 3D etiquetados.
- Prototipado e investigacion en deteccion 3D BEV: el perfil `accurate` (fp32, HiFi4) permite validar la fidelidad numerica por etapa frente a los umbrales PCC, y el perfil `fast` evaluar el compromiso precision/rendimiento en nuScenes mini_val.
- Validacion de hardware Tenstorrent p150: el paquete sirve como referencia para medir el rendimiento de un detector 3D de 59,5M de parametros y 1,97 TFLOPs por fotograma en aceleradores p150 con `tt-model-manager`.
- Pruebas de integracion de pipelines de percepcion: el cliente de Python de la libreria estandar y el preset de calibracion `synthetic_6cam` permiten ejercitar el endpoint `/predict` sin disponer de un rig de camaras real.
- Monitorizacion de estado del servicio: `/health` e `/info` permiten comprobar el estado del servidor y del dispositivo, y listar los presets de calibracion disponibles en despliegues gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el perfil `fast` se valido por acuerdo a nivel de tarea en nuScenes mini_val y que el perfil `accurate` cumple los umbrales PCC por etapa, sin cifras numericas.

## Requisitos de hardware

- Hardware objetivo: acelerador Tenstorrent p150 (mesh P150); no se documenta soporte para GPU convencionales.
- VRAM estimada: no disponible; el modelo se ejecuta en el acelerador p150, no en GPU.
- GPU recomendadas: no aplica; el paquete esta empaquetado para p150.
- Despliegue: `tt serve changh95/bevformer-p150` (requiere Tenstorrent CLI `tt`, instalable con `uv tool install tenstorrent`, y Docker) o `tt-model serve changh95/bevformer-p150` sin tt-cli.
- El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Los pesos se descargan del repositorio `changh95/bevformer-small-weights` en el commit `0e6d9d9c7b8aca95820b264491e19a72d10f0608` al cache de Hugging Face; no van incluidos en la imagen Docker.
- Latencia y throughput: no disponibles.
- Perfiles de servicio: `fast` (por defecto; pesos bf16, bfp8 en la tercera etapa del backbone, HiFi2) y `accurate` (pesos fp32, HiFi4).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas comparables (por ejemplo, otros detectores 3D camera-only como BEVDet o BEVDepth) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite chat, tool calling ni generacion de texto; la API es la propia del modelo (`/predict`, `/health`, `/info`) y `GET /v1/models` es un stub.
- Dependencia de hardware especifico: esta empaquetado para Tenstorrent p150; no se documenta ejecucion en GPU ni en CPU.
- Requiere calibracion de camaras correcta (`intrinsics` y `T_ref_from_camera`) o un preset valido; una calibracion erronea degrada la proyeccion BEV y las cajas 3D.
- El historial temporal se reinicia con un nuevo `id` de stream, con `reset` o con un hueco superior a 2 s entre fotogramas; solo se mantienen hasta 4 streams con historial propio.
- El perfil `fast` usa precision reducida (bfp8 en la tercera etapa del backbone), lo que puede introducir desviaciones frente al perfil `accurate` en casos limite.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre nuScenes, el dominio esperado son escenas de conduccion urbana con el rig de seis camaras de ese dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero pueden aparecer detecciones falsas o cajas mal localizadas en escenas fuera de distribucion; el umbral `score_threshold` (0,2 por defecto) controla la sensibilidad.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones de atribucion y aviso correspondientes; conviene verificar las condiciones de los pesos originales de BEVFormer y de los datos de nuScenes para uso comercial.
- El modelo base esta fijado a un commit concreto (`0e6d9d9`); cambios en el repositorio de pesos pueden afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/bevformer-p150
- Pesos base: https://huggingface.co/changh95/bevformer-small-weights
- Paper de BEVFormer: https://arxiv.org/abs/2203.17270
- Repositorio oficial de BEVFormer: https://github.com/fundamentalvision/BEVFormer
- Nodo de Autoware: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_tensorrt_bevformer
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
