# changh95/yolox-p150

## Resumen

yolox-p150 es un paquete de despliegue del detector YOLOX-s+ seg16 sobre hardware Tenstorrent p150. No es un modelo entrenado por el autor del repositorio: los pesos son los de `AutowareFoundation/tensorrt_yolox` (tag `v1.0`), la red que TIER IV entrenó para el nodo de percepción `autoware_tensorrt_yolox` de Autoware, empaquetada sin modificaciones mediante `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1) y publicada por `changh95`.

El modelo resuelve detección 2D de objetos en imágenes de cámara y segmentación semántica para pipelines de percepción tipo Autoware, sobre una entrada de 960x960 con letterbox y 121 GFLOPs por imagen. Devuelve cajas para 8 clases (UNKNOWN, CAR, TRUCK, BUS, BICYCLE, MOTORBIKE, PEDESTRIAN, ANIMAL), registros ROI en el formato de Autoware y una máscara semántica de 16 clases, replicando el pre y postprocesado del nodo original (letterbox, decode, NMS, remapeo de clases y superposición de ROI sobre la máscara).

Su relevancia es acotada y muy específica: demuestra la ejecución de un detector de percepción automotriz en aceleradores Tenstorrent p150 con una latencia de dispositivo declarada de 8,9 ms por imagen, y ofrece una API HTTP propia (no compatible con OpenAI) para prototipado y procesado offline de imágenes de conducción grabadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-s+ seg16: backbone ELAN CSPDarknet, cuello PAFPN, cabeza anchor-free desacoplada en strides 8, 16 y 32, con decodificador de segmentación semántica de 16 clases |
| Parametros totales | 15,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 960x960 con letterbox, 121 GFLOPs por imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible en la información proporcionada (los pesos se descargan del repo `AutowareFoundation/tensorrt_yolox` en el commit `424d6b9cb94c939ae9ce6a22380e46c13f76b1da`; el paquete se distribuye como imagen Docker con manifiesto de `tt-model-manager`) |

## Arquitectura y entrenamiento

La red es YOLOX-s+ seg16 según Ge et al. (arXiv:2107.08430): detector de una etapa con backbone ELAN CSPDarknet, cuello PAFPN y cabeza desacoplada anchor-free sobre tres escalas (strides 8, 16 y 32), a la que se añade un decodificador de segmentación semántica de 16 clases. La entrada se procesa a 960x960 tras letterbox, con un coste de 121 GFLOPs por imagen. El paquete añade el preprocesado y postprocesado del nodo `autoware_tensorrt_yolox`: letterbox, decodificación, NMS, remapeo de clases y superposición de ROI sobre la máscara.

Los detalles de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada; la model card remite a la ficha original del modelo base. La innovación técnica del repositorio no está en el modelo sino en el empaquetado: compilación de kernels para el dispositivo p150 en el primer arranque (varios minutos) y exposición del modelo mediante un servidor HTTP propio con salidas en JSON o NPZ.

## Capacidades

- Detección 2D de objetos en imágenes de cámara de cualquier tamaño, con cajas en píxeles de la imagen original (`box_xyxy`) ordenadas por puntuación.
- 8 clases de detección: UNKNOWN, CAR, TRUCK, BUS, BICYCLE, MOTORBIKE, PEDESTRIAN, ANIMAL.
- Segmentación semántica densa de 16 clases, devuelta como máscara uint8 a resolución de red y recortada al área de la imagen (por ejemplo, 620x960 para una imagen de 1280x827).
- Generación de registros ROI en el formato de Autoware, con el id de `ObjectClassification` de Autoware (`autoware_label`).
- Parámetros de inferencia ajustables por petición: `score_threshold` (0,35 por defecto), `nms_threshold` (0,7), `is_roi_overlap_segmentation` (true), `overlap_roi_score_threshold` (0,3) e `is_publish_color_mask` (false).
- Formatos de salida JSON (máscara como PNG en base64) o NPZ sin pérdida (máscara y arrays de cajas).
- Endpoints de servicio: `POST /predict`, `GET /health`, `GET /info` y `GET /v1/models` (este último es un stub, no una API de chat).
- API Python equivalente (`tt_yolox.YOLOX`) que requiere una build de tt-metal con los dos parches incluidos en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo.

## Casos de uso

- Prototipado de percepción para Autoware: desplegar el detector con `tt serve changh95/yolox-p150` y enviar imágenes al endpoint `/predict` para validar la cadena completa (letterbox, decode, NMS, ROI y máscara) antes de integrarla en un vehículo o en simulación.
- Procesado offline de grabaciones de conducción: recorrer un dataset de imágenes de cámara y obtener cajas, ROIs y máscaras semánticas por fotograma, con la ventaja de que el modelo acepta imágenes de cualquier tamaño y devuelve las cajas en coordenadas de la imagen original.
- Evaluación de hardware Tenstorrent p150: usar el paquete como referencia de rendimiento de un detector de 15,5 M de parámetros en el acelerador, con métricas de tiempo desglosadas por etapa (preprocesado, dispositivo, postprocesado, decodificación).
- Generación de datos etiquetados para entrenamiento: la máscara de 16 clases y las cajas con `autoware_label` permiten producir anotaciones automáticas sobre imágenes no etiquetadas para su revisión posterior.
- Detección de peatones y vehículos en imágenes urbanas: las 8 clases cubren los actores habituales de escenas viales, útil para análisis de tráfico o auditoría de escenas a partir de imágenes fijas.
- Integración en pipelines de datos con Python: la API `tt_yolox.YOLOX` permite incorporar la inferencia a scripts de procesado por lotes, con salida NPZ sin pérdida para conservar la máscara y los arrays de cajas.
- Demostración de segmentación semántica en condiciones adversas: la model card incluye un ejemplo sobre 60 imágenes frontales de la escena 1094 de nuScenes (Singapur, noche tras lluvia, unos 12 Hz).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta tiempos de inferencia para la imagen de ejemplo: preprocesado 9,1 ms, dispositivo 8,9 ms, postprocesado 1,5 ms, total 48,5 ms, decodificación 19,5 ms y llamada al modelo 19,5 ms.

## Requisitos de hardware

- Hardware obligatorio: acelerador Tenstorrent p150 (malla `P150`). No se documenta ejecución en GPU convencional.
- VRAM estimada: no aplica; el modelo se ejecuta en la memoria del dispositivo Tenstorrent. El repositorio ocupa 3,8 GB.
- GPU recomendadas: no disponible; el paquete está ligado a p150.
- Cabe en GPU de consumo: no disponible; no se contempla ese escenario.
- Despliegue: `tt serve changh95/yolox-p150` (requiere el CLI de Tenstorrent, `uv tool install tenstorrent`, y Docker) o `tt-model serve changh95/yolox-p150`. El servidor escucha en el puerto 20000 o en el siguiente libre. El primer arranque compila kernels para el dispositivo y tarda varios minutos.
- Latencia: 48,5 ms totales por imagen en el ejemplo publicado, con 8,9 ms en dispositivo.
- Throughput: no disponible de forma explícita; el ejemplo de demo sobre nuScenes se procesa a unos 12 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salidas | Licencia | Hardware |
|---|---|---|---|---|---|
| yolox-p150 | 15,5 M | 960x960 letterbox | Cajas de 8 clases, ROIs Autoware, máscara de 16 clases | apache-2.0 | Tenstorrent p150 |
| AutowareFoundation/tensorrt_yolox | 15,5 M (mismos pesos) | 960x960 letterbox | Cajas de 8 clases, ROIs Autoware, máscara de 16 clases | no disponible en la información proporcionada | TensorRT (GPU NVIDIA) |
| YOLOX original (Ge et al.) | no disponible en la información proporcionada | no disponible | Detección de objetos | no disponible en la información proporcionada | no disponible |

La comparación relevante es con el modelo base: yolox-p150 usa exactamente los mismos pesos y reproduce el pre y postprocesado del nodo `autoware_tensorrt_yolox`, por lo que la diferencia es el backend de ejecución (Tenstorrent p150 frente a TensorRT) y el empaquetado como servidor HTTP.

## Limitaciones y advertencias

- Modelo de visión especializado: no procesa texto, no soporta tool calling ni agentes, y su API HTTP no es compatible con OpenAI; `GET /v1/models` es solo un stub.
- Dependencia estricta de hardware Tenstorrent p150; no se documentan alternativas de despliegue en GPU u otros aceleradores.
- Solo 8 clases de detección y 16 clases de segmentación, definidas por el ecosistema Autoware; no cubre categorías fuera de ese conjunto.
- El primer arranque requiere compilar kernels para el dispositivo, lo que introduce varios minutos de espera y complica el escalado o el arranque en frío.
- La API Python requiere una build de tt-metal con dos parches específicos del repositorio, lo que añade fragilidad ante actualizaciones de la herramienta.
- Sesgos y tasas de alucinación o falsos positivos: no disponibles en la información proporcionada; deben evaluarse con datos propios antes de usar en producción.
- Restricciones de licencia: los pesos y el paquete son apache-2.0, pero la demo incluida está renderizada a partir de nuScenes (© Motional AD Inc., CC BY-NC-SA 4.0 y los términos de uso de nuScenes) y es solo para uso no comercial.
- Uso previsto limitado a investigación, prototipado y procesado offline de imágenes grabadas; no se declara validación para conducción autónoma en producción.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/yolox-p150
- Modelo base: https://huggingface.co/AutowareFoundation/tensorrt_yolox
- Paper de YOLOX (Ge et al.): https://arxiv.org/abs/2107.08430
- Nodo `autoware_tensorrt_yolox`: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_tensorrt_yolox
- `tt-model-manager`: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos del CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- API Python del paquete: https://huggingface.co/changh95/yolox-p150/blob/main/code/PYTHON.md
- Imagen de ejemplo: https://huggingface.co/changh95/yolox-p150/resolve/main/code/tt_yolox/samples/test_image.jpg
- Demo en vídeo: https://huggingface.co/changh95/yolox-p150/blob/main/media/demo_tt.mp4
- Términos de uso de nuScenes: https://www.nuscenes.org/
