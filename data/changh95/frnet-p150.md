# changh95/frnet-p150

## Resumen

frnet-p150 es un paquete de despliegue del modelo FRNet (Frustum-Range Network) para segmentación semántica 3D de nubes de puntos LiDAR, empaquetado específicamente para ejecutarse sobre aceleradores Tenstorrent p150. No se trata de un modelo nuevo: los pesos son idénticos e inalterados respecto a AutowareFoundation/lidar_frnet (tag v2.0), la red que TIER IV entrenó con su framework AWML para el nodo de percepción `autoware_lidar_frnet` de Autoware. El autor del paquete, changh95, se limita a publicar la integración de inferencia con la cadena de herramientas tt-model-manager de Tenstorrent.

La arquitectura subyacente es una red neuronal convolucional especializada de aproximadamente 10 millones de parámetros, compuesta por un codificador de características de frustum basado en MLPs punto a punto con max por celda, un CNN 2D sobre rejilla frustum-rango con cuatro etapas residuales y fusión punto-píxel, y una cabeza de predicción por punto. Existen dos variantes según el sensor: Hesai OT128 (rejilla 128x1024, ~1,25 TFLOPs por barrido a 80.000 puntos) y Hesai QT128 (rejilla 128x256, ~0,36 TFLOPs a 60.000 puntos).

Su relevancia es acotada pero clara: demuestra el despliegue de un modelo de percepción LiDAR de producción sobre hardware Tenstorrent (no GPU NVIDIA), con servidor HTTP propio y perfiles de servicio seleccionables. Está orientado a investigación, prototipado y procesamiento offline de barridos grabados, no a un uso conversacional ni generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de segmentación LiDAR: frustum feature encoder (MLPs punto a punto con max por celda) + CNN 2D frustum-rango con 4 etapas residuales y fusión punto-píxel + cabeza por punto |
| Parametros totales | ~10,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: un barrido LiDAR; rejilla frustum 128x1024 OT128 o 128x256 QT128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión/percepción, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos originales de AutowareFoundation/lidar_frnet descargados en tiempo de servicio; empaquetado como imagen Docker con manifiesto schema 5.1 de tt-model-manager 0.1.0; entradas/salidas en JSON con arrays base64 npz |

## Arquitectura y entrenamiento

FRNet procesa un único barrido LiDAR en el sistema de coordenadas del sensor (x adelante, y izquierda, z arriba, en metros, con intensidad cruda 0-255). El pipeline proyecta los puntos a una rejilla frustum-rango, extrae características por punto mediante MLPs y agregación max por celda, aplica un CNN 2D con cuatro etapas residuales sobre la representación frustum-rango y fusiona información punto-píxel antes de una cabeza que emite, por cada punto, un id de clase (27 clases del esquema T4) y su probabilidad. La referencia académica es Xu et al., arXiv:2312.04484.

El entrenamiento lo realizó TIER IV con el framework AWML para el nodo `autoware_lidar_frnet` de Autoware; los detalles de composición del dataset, número de tokens/barridos y uso de técnicas de ajuste fino no están recogidos en la información disponible. El paquete frnet-p150 no modifica los pesos: replica el preprocesado y postprocesado del nodo original (recorte ego, proyección frustum, interpolación de puntos de Autoware, argmax y filtro de clases). La innovación del paquete es de despliegue: compilación de kernels para el dispositivo p150 en el primer arranque (varios minutos) y exposición de un servidor HTTP propio en el puerto 20000.

## Capacidades

- Segmentación semántica 3D por punto de barridos LiDAR, con 27 clases del esquema T4 (drivable_surface, other_flat_surface, sidewalk, manmade, vegetation, car, etc.).
- Salida de id de clase y probabilidad por punto, más la máscara de nube filtrada (`filter_keep`) del nodo `autoware_lidar_frnet`.
- Soporte de dos sensores mediante perfiles de servicio: `ot128` (por defecto, rejilla 1024x128) y `qt128` (rejilla 256x128, FOV ±52,6 grados).
- Entrada en múltiples formatos: bin (float32 con campos configurables, por defecto x, y, z, intensidad), npy, npz y pcd, codificados en base64.
- Calibración extrínseca mediante matriz 4x4 o traslación + rotación, o mediante presets (`synthetic_ot128`, `synthetic_qt128`); recorte de caja ego configurable o desactivable.
- Parámetros de postprocesado: umbral de probabilidad de clase (0,05 por defecto) y filtro de clases (por defecto `drivable_surface`), que afectan solo a `filter_keep`.
- Salida en JSON o npz sin pérdida (arrays base64).
- Endpoints `GET /health` y `GET /info` para estado del servidor y del dispositivo; `GET /v1/models` es un stub, no una API de chat.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo thinking: no es un modelo generativo.

## Casos de uso

- Percepción offline de datos grabados: procesar barridos de un Hesai OT128 o QT128 almacenados en rosbags o ficheros pcd/npz para generar etiquetas semánticas por punto y analizar escenas sin conexión, aprovechando el endpoint `/predict` con entrada en base64.
- Prototipado de pipelines de conducción autónoma: validar la integración de `autoware_lidar_frnet` sobre hardware Tenstorrent p150 antes de comprometer una plataforma de cómputo en vehículo.
- Evaluación de hardware alternativo: comparar latencia y comportamiento del mismo modelo FRNet en p150 frente a la ejecución en GPU, útil para equipos que valoran aceleradores no NVIDIA.
- Generación de datasets etiquetados: usar las salidas de clase y probabilidad por punto para preetiquetar nubes y acelerar la anotación humana posterior, filtrando por umbral de confianza.
- Filtrado de superficies transitables: emplear `filter_keep` con la clase `drivable_surface` para aislar la superficie de conducción en herramientas de análisis de mapas o planificación.
- Investigación en segmentación LiDAR: servir como línea base reproducible (10 M de parámetros, ~1,25 TFLOPs por barrido en OT128) para comparar arquitecturas frustum-rango.
- Demostración de despliegue con tt-model-manager: ejemplo de empaquetado de un modelo de percepción con manifiesto schema 5.1, perfiles de servicio y servidor HTTP propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta coste computacional por barrido (aproximadamente 1,25 TFLOPs para OT128 a 80.000 puntos y 0,36 TFLOPs para QT128 a 60.000 puntos), sin métricas de precisión (mIoU u otras) ni comparaciones.

## Requisitos de hardware

- Hardware objetivo: acelerador Tenstorrent p150 (requisito explícito; no se documenta soporte para GPU).
- VRAM: no aplica; el modelo corre sobre memoria del dispositivo p150. El repositorio ocupa 3,8 GB, pero los pesos se descargan aparte en tiempo de servicio.
- GPU recomendadas: no disponible (el paquete está atado a p150).
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Despliegue: `tt serve changh95/frnet-p150` (requiere Tenstorrent CLI, `uv tool install tenstorrent`) o `tt-model serve changh95/frnet-p150`; requiere Docker. El servidor HTTP escucha en el puerto 20000 o el siguiente libre.
- Arranque: el primer inicio compila kernels para el dispositivo y tarda varios minutos; el servidor está listo al registrar `Application startup complete`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| frnet-p150 (este paquete) | ~10,0 M | Barrido LiDAR Hesai OT128 o QT128 | Tenstorrent p150 | Apache 2.0 | Hugging Face, servidor HTTP propio |
| AutowareFoundation/lidar_frnet | ~10,0 M | Barrido LiDAR Hesai OT128 o QT128 | No especificado (referencia original) | Apache 2.0 | Hugging Face |
| Otros modelos de segmentación LiDAR (p. ej. Cylinder3D, SPVCNN) | no disponible | Nube de puntos LiDAR | no disponible | no disponible | no disponible |

La comparativa con arquitecturas alternativas de segmentación LiDAR no está cubierta en la información proporcionada; los datos de rendimiento comparado no están disponibles.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no admite chat, tool calling ni razonamiento; `GET /v1/models` es un stub.
- Atado a hardware Tenstorrent p150; no se documenta ejecución en GPU ni en CPU.
- Solo admite los sensores Hesai OT128 y QT128 con sus rejillas frustum correspondientes; otros LiDAR requerirían otra red o recalibración no cubierta.
- La entrada debe estar en el sistema de coordenadas del sensor y no compensada por movimiento; un preprocesado incorrecto degrada las etiquetas.
- El recorte de caja ego por defecto es el de Autoware; desactivarlo o modificarlo altera los resultados respecto al nodo original.
- Los parámetros `class_probability_threshold` y `filter_classes` solo modifican `filter_keep`, nunca las clases asignadas; un umbral bajo (0,05 por defecto) puede producir falsos positivos en la máscara filtrada.
- Riesgo de degradación en condiciones fuera de distribución (clima adverso, sensores sucios, escenas no representadas en el entrenamiento); no se documentan métricas de robustez.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial con atribución y sin garantías; conviene revisar las condiciones de los pesos base y de las dependencias (Docker, tt-model-manager, Tenstorrent CLI).
- El primer arranque exige compilación de kernels (varios minutos), lo que complica despliegues efímeros o autoescalado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/frnet-p150
- Modelo base: https://huggingface.co/AutowareFoundation/lidar_frnet
- Paper FRNet: https://arxiv.org/abs/2312.04484
- Framework AWML de TIER IV: https://github.com/tier4/AWML
- Nodo Autoware LiDAR FRNet: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_lidar_frnet
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Muestra sintética OT128: https://huggingface.co/changh95/frnet-p150/resolve/main/code/tt_frnet/samples/synthetic_ot128.npz
