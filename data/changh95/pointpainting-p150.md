# changh95/pointpainting-p150

## Resumen

PointPainting es un detector de objetos 3D que combina LiDAR y cámara, y este repositorio empaqueta la red PointPainting de TIER IV para Autoware con el objetivo de ejecutarla sobre aceleradores Tenstorrent p150. El modelo no es un modelo de lenguaje: es un detector de percepción para conducción autónoma que fusiona nubes de puntos LiDAR con detecciones 2D de hasta 8 cámaras rectificadas, pintando cada punto LiDAR con 3 bits de clase adicionales antes de pasarlo por un encoder de pilares. Deriva de `AutowareFoundation/image_projection_based_fusion` (tag v5.0) con pesos sin modificar, y se publica bajo licencia Apache 2.0.

La relevancia de este paquete es de despliegue, no algorítmica: expone el modelo como un servidor HTTP propio (puerto 20000) con endpoints `/predict`, `/health` e `/info`, gestionado mediante `tt-model-manager` 0.1.0 y la CLI `tt`. No incluye el detector 2D de imágenes que genera las ROIs, por lo que el usuario debe aportar esas detecciones junto con la calibración de las cámaras. El repositorio ocupa 3,7 GB y está orientado a investigación, prototipado y procesamiento offline de datos de conducción grabados.

No se dispone de información sobre parámetros totales, longitud de contexto ni idiomas; se trata de un modelo de visión 3D y no de un modelo generativo de texto, de modo que varios campos de la ficha estándar no aplican y se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointPainting: fusión cámara-LiDAR con encoder de pilares PointPillars (PFN 12-16-32), backbone SECOND, cuello SECONDFPN y cabeza CenterPoint mono-tarea sobre rejilla 760x480 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepción 3D, no generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos del modelo base `AutowareFoundation/image_projection_based_fusion` (commit `33119d71afd53fbc3994dcffc71e6247b76cdd5a`), descargados aparte de la imagen Docker; formato de fichero no especificado |
| Hardware objetivo | Tenstorrent p150 (malla `P150`) |
| Pipeline | object-detection |
| Tamaño del repositorio | 3,7 GB |
| Clases detectadas | CAR, TRUCK, BUS, TRAILER, BICYCLE, PEDESTRIAN |
| Entrada | Una nube LiDAR en `base_link` + calibración + ROIs 2D de hasta 8 cámaras |
| Empaquetado | tt-model-manager 0.1.0 (manifest schema 5.1) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema PointPainting descrito por Vora et al. (arXiv:1911.10150): las detecciones 2D (ROIs) de hasta 8 cámaras rectificadas se proyectan sobre los puntos LiDAR como 3 bits de clase aditivos, generando una nube "pintada". Sobre esa nube actúa un encoder de pilares PointPillars con capas PFN 12-16-32, seguido de un backbone SECOND, un cuello SECONDFPN y una cabeza CenterPoint mono-tarea que opera sobre una rejilla de 760x480. La salida son cajas 3D equivalentes a `DetectedObjects` de Autoware, con el preprocesado y postprocesado del nodo `pointpainting_fusion`: pintado, densificación, voxelización, decodificación, NMS circular, NMS por IoU y remapeo de clases por área.

Los pesos son los de TIER IV para Autoware, sin modificar respecto al modelo base (tag v5.0). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino con RL, DPO u otras técnicas. El modelo admite densificación de barridos LiDAR pasados tanto en cliente (barridos previos enviados en la petición) como en servidor (densificación de 2 barridos sobre nubes pintadas, al estilo de Autoware). El detector 2D de imágenes que produce las ROIs no forma parte del paquete.

## Capacidades

- Detección de objetos 3D cámara-LiDAR en escenas de conducción, con cajas 3D (centro, tamaño, yaw) y puntuación de confianza por objeto.
- Fusión de hasta 8 cámaras rectificadas con una nube LiDAR concatenada en el frame `base_link`.
- Pintado de puntos LiDAR con 3 bits de clase a partir de las ROIs 2D suministradas por el cliente.
- Soporte de nubes de puntos en formatos `npz`, `npy`, `pcd`, `bin` o lista, codificadas en base64.
- Densificación temporal: barridos pasados en cliente (`sweeps`/`stream` con `time_lag_s` y `T_current_from_sweep`) o densificación de 2 barridos en servidor con pose `T_world_from_ego`.
- Configuración de calibración por preset o por cámaras individuales (intrínsecos 3x3 K o 3x4 rectificados P, tamaño de imagen y transformación `T_ref_from_camera`).
- Parámetros ajustables en petición: `score_threshold` (0,35 por defecto), `circle_nms_dist_threshold` (0,3), `iou_nms_threshold` (0,1), `iou_nms_search_distance_2d` (10,0), `remap_classes` (true) y `max_detections` (sin límite por defecto).
- Formatos de salida JSON (por defecto) o NPZ con arrays sin pérdida.
- Endpoints de servicio: `POST /predict`, `GET /health`, `GET /info` (lista presets de calibración y valores por defecto de parámetros) y `GET /v1/models` como stub.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües; no es una API compatible con OpenAI.

## Casos de uso

- Procesamiento offline de datos de conducción grabados: el servidor acepta nubes LiDAR y ROIs de un frame y devuelve `DetectedObjects`, lo que permite reanotar o validar conjuntos de datos de percepción con la misma lógica del nodo `pointpainting_fusion`.
- Prototipado de pipelines de percepción Autoware sobre Tenstorrent: al ejecutarse en p150 con `tt serve`, sirve para evaluar el detector en hardware Tenstorrent sin reescribir el pre/postprocesado.
- Validación de calibración cámara-LiDAR: al exigir intrínsecos, tamaño de imagen y `T_ref_from_camera` por cámara, permite comprobar si una calibración dada produce detecciones coherentes sobre escenas conocidas.
- Densificación temporal en servidor: con `stream` y `T_world_from_ego` se pueden fusionar 2 barridos pintados para mejorar la detección de objetos con retorno LiDAR escaso, replicando el comportamiento de Autoware.
- Integración en sistemas de registro y evaluación de percepción: el endpoint `/predict` con salida NPZ permite almacenar cajas y puntuaciones para métricas de detección 3D (por ejemplo, comparación con ground truth de un dataset propio).
- Servicio de inferencia dedicado en un vehículo de pruebas o banco de laboratorio: el servidor HTTP propio en el puerto 20000 (o el siguiente libre) se puede consultar desde un cliente en Python de biblioteca estándar, como el `client.py` incluido.
- Ajuste de umbrales por escenario: los parámetros de NMS y `score_threshold` en la petición permiten adaptar la sensibilidad por clase y distancia sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Acelerador Tenstorrent p150 (malla `P150`); no se indica compatibilidad con otras tarjetas Tenstorrent ni con GPU convencionales.
- VRAM estimada: no disponible (no se especifica huella de memoria del modelo en p150).
- GPU recomendadas: no aplica; el paquete está empaquetado para p150. No hay datos sobre ejecución en A100, H100 o RTX 4090.
- Ejecución en GPU de consumo: no disponible; no se documenta soporte.
- Software necesario: CLI de Tenstorrent `tt` (`uv tool install tenstorrent`), Docker y, alternativamente, `tt-model serve`.
- Despliegue: `tt serve changh95/pointpainting-p150` o `tt-model serve changh95/pointpainting-p150`. El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Latencia y throughput: no disponibles. El tamaño del repositorio es de 3,7 GB y los pesos del modelo base se descargan aparte en la caché de Hugging Face.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Hardware | Disponibilidad |
|---|---|---|---|---|---|---|
| pointpainting-p150 (este) | PointPainting + PointPillars/SECOND/CenterPoint | LiDAR + ROIs 2D de hasta 8 cámaras | CAR, TRUCK, BUS, TRAILER, BICYCLE, PEDESTRIAN | Apache 2.0 | Tenstorrent p150 | Hugging Face, vía tt-model-manager |
| AutowareFoundation/image_projection_based_fusion (modelo base) | PointPainting de TIER IV para Autoware | LiDAR + ROIs 2D | Las del nodo `pointpainting_fusion` | no disponible en la información | no disponible | Hugging Face |
| Alternativas de detección 3D cámara-LiDAR (p. ej. BEVFusion, CenterPoint multi-modal) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El detector 2D de imágenes no está incluido: el usuario debe aportar las ROIs con etiquetas `ObjectClassification` y puntuaciones, en píxeles de imagen rectificada, con un máximo de 128 por cámara y 8 cámaras.
- No es una API compatible con OpenAI ni un modelo de chat; `/v1/models` es un stub y el payload de `/predict` es propio del modelo.
- Requiere hardware Tenstorrent p150; no se documenta funcionamiento en GPU convencionales ni en CPU.
- El primer arranque compila kernels y tarda varios minutos, lo que complica despliegues con arranque en frío frecuente.
- Los pesos se descargan por separado de la imagen Docker, lo que añade un paso de red y caché en el primer uso.
- Uso previsto limitado a investigación, prototipado y procesamiento offline de datos grabados; no se declara validación para conducción en producción.
- No se documentan sesgos, tasas de alucinación ni comportamiento en condiciones meteorológicas o de iluminación adversas.
- No se especifican requisitos de memoria, latencia ni throughput, por lo que no se puede dimensionar un despliegue en tiempo real con los datos disponibles.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base y de los datos de entrenamiento originales no se detallan en esta información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/pointpainting-p150
- Modelo base: https://huggingface.co/AutowareFoundation/image_projection_based_fusion
- Paper PointPainting (Vora et al.): https://arxiv.org/abs/1911.10150
- Nodo Autoware `autoware_image_projection_based_fusion`: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_image_projection_based_fusion
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- CLI Tenstorrent (prerequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Colección Autoware de changh95: https://huggingface.co/collections/changh95/autoware
