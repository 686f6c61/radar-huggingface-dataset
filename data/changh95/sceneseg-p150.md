# changh95/sceneseg-p150

## Resumen

sceneseg-p150 es un paquete de despliegue del modelo SceneSeg de la Autoware Foundation, empaquetado por changh95 para ejecutarse sobre hardware Tenstorrent p150. SceneSeg es la red de segmentación de escena de la pila de cámara VisionPilot de Autoware, una red de 48,3 millones de parámetros que clasifica cada píxel de una imagen de cámara frontal en tres categorías: fondo (incluido cielo), objetos en primer plano y calzada transitable. El paquete reutiliza los pesos originales sin modificar (`SceneSeg_FP32.onnx`) y los sirve mediante un servidor HTTP propio sobre el acelerador Tenstorrent p150.

El interés de esta ficha no reside en un modelo nuevo, sino en la cadena de despliegue: demuestra cómo llevar una red de segmentación automotriz de 48,3 M de parámetros a un acelerador no-GPU con un perfil de servicio reproducible, compilación de kernels en el dispositivo y una API HTTP con payloads JSON documentados. Es relevante para equipos que evalúan alternativas de hardware para percepción embebida en automoción y para quienes necesitan reproducir exactamente la salida del nodo `scene_seg_model` de VisionPilot fuera de ROS 2.

La arquitectura es una CNN de segmentación semántica con encoder EfficientNet-B0, un bloque SceneContext que modula las características de stride 32 con un prior global y un decoder tipo UNet con cinco bloques de upsampling 2x. La entrada se fija a 640x320 (367 GFLOPs por fotograma) y la salida se devuelve a la resolución original de la imagen de entrada. No hay paper asociado al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN de segmentación semántica: encoder EfficientNet-B0, bloque SceneContext (gating de características stride-32 con prior global), decoder UNet con cinco bloques de upsampling 2x y cabeza de 3 clases |
| Parámetros totales | 48,3 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 640x320 píxeles) |
| Tipos de cuantización | pesos originales FP32 (ONNX); el paquete no documenta otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`SceneSeg_FP32.onnx`); empaquetado con tt-model-manager 0.1.0, manifiesto esquema 5.1 |
| Hardware objetivo | Tenstorrent p150 (mesh P150) |
| Resolución de entrada | 640x320 fija en red; la imagen de entrada puede ser de cualquier tamaño |
| Cómputo por fotograma | 367 GFLOPs |
| Clases de salida | 3 (0 background, 1 foreground, 2 road) |
| Tamaño del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

SceneSeg es una red convolucional de segmentación semántica pensada para una cámara frontal con campo de visión horizontal de 52-55 grados, en el contexto de la pila VisionPilot de Autoware. El encoder es EfficientNet-B0; sobre sus características de stride 32 se aplica un bloque SceneContext que las modula con un prior global de la escena, y un decoder tipo UNet con cinco bloques de upsampling 2x produce el mapa denso de 3 clases. El preprocesado replica el del nodo `scene_seg_model`: redimensionado a 640x320 con interpolación bilineal de OpenCV, normalización ImageNet, argmax y redimensionado por vecino más cercano a la resolución original.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; el autor indica explícitamente que SceneSeg no tiene paper y remite a la model card original para los detalles de entrenamiento. La innovación técnica del paquete es de despliegue: compilación de kernels específicos para el dispositivo p150 en el primer arranque (varios minutos), servicio HTTP propio en el puerto 20000 con payloads JSON documentados y dos perfiles de servicio (`bgr`, orden de canales de VisionPilot, y `rgb`, orden de entrenamiento, con mejor comportamiento declarado en vehículos de dos ruedas).

## Capacidades

- Segmentación semántica de imágenes de cámara: genera una máscara de primer plano (uint8, 255 = primer plano) y un mapa de 3 clases (fondo, objetos en primer plano, calzada transitable).
- Acepta imágenes de cualquier tamaño y devuelve las salidas a la resolución de la imagen de entrada mediante vecino más cercano.
- Salida en JSON con máscara y mapa de clases como PNG en base64, o en NPZ con arrays sin pérdida.
- Estadísticas por inferencia: `foreground_fraction`, `class_counts` y desglose de tiempos (`preprocess`, `device`, `postprocess`, `total`, `decode`, `model_call`).
- Endpoints de estado: `GET /health` y `GET /info`; `GET /v1/models` es un stub, no una API de chat compatible con OpenAI.
- API Python (`tt_sceneseg`) con las mismas salidas que el servidor HTTP.
- Perfiles de servicio seleccionables con `--profile`: `bgr` (por defecto, réplica exacta del nodo VisionPilot) y `rgb`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking; es exclusivamente un modelo de visión.

## Casos de uso

- Réplica offline del nodo `scene_seg_model` de VisionPilot: procesar imágenes grabadas de cámara frontal y obtener exactamente la máscara que publicaría el nodo en `/autoseg/scene_seg/mask`, útil para depurar pipelines ROS 2 sin hardware de vehículo.
- Etiquetado asistido de datasets de conducción: el mapa de 3 clases (fondo, primer plano, calzada) permite preanotar grandes volúmenes de fotogramas grabados y reducir el trabajo manual de revisión.
- Prototipado de percepción embebida en automoción: validar la latencia y el consumo de un acelerador Tenstorrent p150 con una red de 48,3 M de parámetros y 367 GFLOPs por fotograma antes de comprometerse con una plataforma de hardware.
- Detección de calzada transitable para planificación de trayectorias: la clase 2 del mapa de clases delimita la superficie transitable, que puede alimentar módulos de planificación en prototipos de conducción autónoma.
- Análisis de vídeo de flotas y seguros: procesar por lotes grabaciones de salpicadero para identificar presencia de objetos en primer plano (peatones, vehículos, ciclistas) y estimar fracciones de ocupación por fotograma.
- Comparación de hardware para percepción: ejecutar el mismo modelo y los mismos pesos en p150 y en GPU para contrastar latencia de dispositivo (el ejemplo documentado reporta 13,236 ms de tiempo de dispositivo y 44,344 ms totales por fotograma) y decidir la plataforma de despliegue.
- Integración en servicios de visión propios: el servidor HTTP con payload JSON y salidas en base64 permite incorporar la segmentación a un microservicio existente sin dependencias de ROS 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la latencia del ejemplo del servidor sobre p150: preprocesado 1,976 ms, dispositivo 13,236 ms, postprocesado 0,749 ms, decodificación 18,425 ms, llamada al modelo 15,978 ms y total 44,344 ms por fotograma con el perfil `bgr`.

## Requisitos de hardware

- Hardware obligatorio: acelerador Tenstorrent p150 (mesh P150). El paquete no contempla ejecución en GPU ni CPU.
- VRAM: no aplica; el modelo se ejecuta sobre la memoria del dispositivo Tenstorrent. El repositorio ocupa 4,2 GB, de los cuales los pesos se descargan aparte en la caché de Hugging Face.
- GPU recomendadas: no disponible; no hay soporte documentado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; requiere hardware Tenstorrent.
- Despliegue: `tt serve changh95/sceneseg-p150` (requiere Tenstorrent CLI, instalable con `uv tool install tenstorrent`, y Docker) o `tt-model serve changh95/sceneseg-p150` sin la CLI. El servidor HTTP escucha en el puerto 20000 o el siguiente libre.
- Primer arranque: compilación de kernels para el dispositivo, que tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia: 44,344 ms totales por fotograma en el ejemplo documentado, con 13,236 ms de cómputo en dispositivo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sceneseg-p150 | 48,3 M | 640x320 fija en red | 3 | Tenstorrent p150 | Apache 2.0 | Hugging Face (paquete tt-model-manager) |
| AutowareFoundation/SceneSeg | 48,3 M | 640x320 fija en red | 3 | No especificado (ONNX) | No disponible en la información | Hugging Face (sin pesos en el repositorio) |
| Alternativas de segmentación semántica de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: sceneseg-p150 no modifica los pesos de SceneSeg, solo añade el empaquetado y el servidor para p150. No se dispone de datos de benchmarks que permitan comparar el rendimiento de segmentación con otras redes.

## Limitaciones y advertencias

- Modelo de propósito específico: segmentación de cámara frontal con campo de visión horizontal de 52-55 grados; su uso fuera de ese encuadre o en dominios visuales distintos no está validado.
- Sin paper ni documentación de entrenamiento publicada: no se conocen la composición del dataset, los sesgos de dominio ni las métricas de validación del modelo original.
- Riesgo de degradación en condiciones no representadas en el entrenamiento (lluvia, noche, deslumbramiento, sensores distintos); no hay datos publicados al respecto.
- El perfil por defecto `bgr` replica el orden de canales de VisionPilot; el perfil `rgb` (orden de entrenamiento) se declara claramente mejor en vehículos de dos ruedas, lo que sugiere una discrepancia conocida entre entrenamiento y despliegue original.
- Dependencia de hardware propietario: requiere Tenstorrent p150; no hay ruta documentada a GPU o CPU.
- Primer arranque lento por compilación de kernels en el dispositivo.
- `GET /v1/models` es un stub y el servidor no es compatible con la API de chat de OpenAI; las integraciones deben adaptarse al payload propio del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el paquete no incluye garantías ni soporte; conviene verificar la licencia del modelo base y de los pesos originales antes de un despliegue en producción.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/sceneseg-p150
- Modelo base: https://huggingface.co/AutowareFoundation/SceneSeg
- Repositorio VisionPilot: https://github.com/autowarefoundation/vision_pilot
- Nodo `scene_seg_model` en VisionPilot: https://github.com/autowarefoundation/vision_pilot/tree/04fa3e80d0b0a9d2491c07991a9cb48101b2c2cb/VisionPilot/middleware_recipes/ROS2/models
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Imagen de ejemplo: https://huggingface.co/changh95/sceneseg-p150/resolve/main/code/tt_sceneseg/samples/highway_normal_1.png
