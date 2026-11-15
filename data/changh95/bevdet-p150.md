# changh95/bevdet-p150

## Resumen

BEVDet-P150 es un paquete de despliegue del detector 3D basado en cámaras BEVDet-R50-4DLongterm-Depth, empaquetado para ejecutarse sobre aceleradores Tenstorrent p150. Deriva, con pesos sin modificar, del modelo `AutowareFoundation/tensorrt_bevdet` (tag `v1.0`) que emplea el nodo `autoware_tensorrt_bevdet` de Autoware Universe para percepción de cámara. No es un modelo de lenguaje: es un detector de objetos 3D en espacio BEV para conducción autónoma, con 76 millones de parámetros y una carga computacional de 498 GFLOPs por fotograma.

La arquitectura combina un codificador de imagen ResNet-50 con FPN, una red de profundidad consciente de la cámara (118 bins de profundidad) aplicada sobre seis cámaras a 256x704, un lift-splat BEVPool v2 hacia una rejilla bird's-eye-view de 128x128 (±51.2 m), fusión de los últimos 8 mapas BEV y una cabeza estilo CenterPoint sobre un codificador BEV ResNet + FPN. Entrada: seis imágenes surround con intrínsecos y extrínsecos cámara-`base_link`; salida: cajas 3D con puntuaciones y velocidades para las 10 clases de nuScenes, mapeadas a etiquetas de Autoware.

Su relevancia es la portabilidad: el paquete `tt-model-manager` 0.1.0 permite servir el modelo en hardware Tenstorrent p150 mediante un servidor HTTP propio (no compatible con OpenAI), orientado a investigación, prototipado y procesamiento offline de grabaciones. Los codificadores de imagen y BEV corren en el dispositivo; el lift-splat, el redimensionado de imagen y la NMS se ejecutan en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVDet-R50-4DLongterm-Depth (ResNet-50 + FPN, red de profundidad, BEVPool v2, fusion temporal, CenterPoint head) |
| Parametros totales | 76 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); historial BEV de 8 fotogramas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de percepción visual, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos originales de `AutowareFoundation/tensorrt_bevdet` (commit `391466349a1b39c93b9865364a8088110ca8d97b`), descargados aparte de la imagen Docker; tamaño del repo 4.0 GB |
| Hardware objetivo | Tenstorrent p150 (malla `P150`) |
| Carga computacional | 498 GFLOPs por fotograma |
| Resolución de entrada | 6 cámaras, 1600x900 redimensionado y recortado a 256x704 |
| Rejilla BEV | 128 x 128, ±51.2 m |
| Clases | 10 clases de nuScenes, con etiquetas Autoware |

## Arquitectura y entrenamiento

El modelo es un detector 3D camera-only con fusión temporal. Un codificador de imagen ResNet-50 con FPN procesa las seis vistas; una red de profundidad específica por cámara estima 118 bins de profundidad que se usan para proyectar las features al espacio BEV mediante BEVPool v2, generando un mapa de 128x128 celdas que cubre ±51.2 m alrededor del vehículo. El módulo de fusión temporal agrega los últimos 8 mapas BEV, opcionalmente compensando el movimiento del ego mediante la pose. Sobre el mapa fusionado opera un codificador BEV ResNet + FPN y una cabeza CenterPoint que decodifica cajas 3D con puntuaciones y velocidades.

El paquete no reentrena ni modifica pesos: reproduce el modelo desplegado por Autoware, incluyendo su pre y postprocesado (redimensionado y recorte, historial BEV, decodificación de cajas, Scale-NMS y mapeo de etiquetas). Los detalles de entrenamiento (composición del dataset, número de tokens equivalentes, uso de RLHF) no están disponibles en la información proporcionada; la model card remite a la original del modelo base. La innovación técnica del paquete es el despliegue: codificadores de imagen y BEV en el acelerador Tenstorrent, con el lift-splat, el resize y la NMS en el host, y una API HTTP propia con gestión de streams para el historial temporal.

## Capacidades

- Detección 3D de objetos a partir de seis cámaras surround, con cajas, puntuaciones y velocidades.
- Fusión temporal de 8 fotogramas BEV, con compensación de movimiento del ego opcional mediante `T_world_from_ego`.
- Soporte de calibración por cámara (intrínsecos y `T_ref_from_camera`) o mediante preset (incluido `synthetic_6cam`).
- Gestión de streams independientes con historial BEV por stream (`stream.id`, `stream.reset`).
- Umbrales configurables: `score_threshold` (0.2 por defecto), `decode_score_threshold` (0.1), `nms_iou_threshold` (0.2), `max_pre_nms` (500), `max_detections` (500) y `nms_rescale_factor` por clase.
- Formatos de salida JSON o NPZ (arrays de cajas en base64 sin pérdida).
- Endpoints de estado: `GET /health`, `GET /info` (estado del dispositivo, etiquetas y presets de calibración); `GET /v1/models` es un stub, no una API de chat.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Procesamiento offline de grabaciones de conducción: se envían fotogramas de seis cámaras con su calibración al endpoint `/predict` y se obtienen cajas 3D para anotación, auditoría o análisis de escenarios, aprovechando la fusión temporal de 8 fotogramas para reducir parpadeo.
- Prototipado de percepción en Autoware: validar la cadena completa de un nodo `autoware_tensorrt_bevdet` sobre hardware Tenstorrent antes de desplegar en vehículo, comparando salidas con la referencia.
- Investigación en detección 3D camera-only: experimentar con umbrales de NMS, decodificación y puntuación sin reentrenar, gracias a los parámetros configurables por petición.
- Evaluación de portabilidad de hardware: medir latencia y comportamiento de un detector BEV en p150 frente a GPU, útil para decisiones de plataforma en percepción embebida.
- Generación de datos sintéticos y pruebas de regresión: usar la muestra sintética de seis cámaras incluida en el repo para verificar el pipeline de despliegue y la calibración.
- Análisis de tráfico y reconstrucción de escenas: extraer objetos 3D con velocidad para estudiar interacciones vehículo-peatón en secuencias grabadas, con el historial BEV como memoria a corto plazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí aporta datos de rendimiento operativo: la primera petición tras el arranque tarda 0.5 s en `model_call` porque fusiona un historial vacío y construye las tablas de lift-splat para la nueva calibración; las peticiones en caliente usan los tiempos indicados en la sección "Expected performance" de la model card, que no se detallan en la información proporcionada. La primera compilación de kernels para el dispositivo tarda varios minutos.

## Requisitos de hardware

- Acelerador Tenstorrent p150 (malla `P150`), requisito obligatorio; no se contempla ejecución en GPU o CPU en este paquete.
- Host con Docker y la CLI de Tenstorrent (`uv tool install tenstorrent`) o `tt-model` directamente.
- Espacio en disco: imagen Docker más pesos del modelo base (repo de 4.0 GB), descargados a la caché de Hugging Face.
- VRAM estimada para inferencia en GPU: no disponible (el paquete no soporta GPU).
- Despliegue: `tt serve changh95/bevdet-p150` o `tt-model serve changh95/bevdet-p150`; servidor HTTP en el puerto 20000 (o el siguiente libre).
- Latencia: 0.5 s en la primera petición (incluye construcción de tablas); en caliente, ver "Expected performance" de la model card, no detallado aquí. Throughput no disponible.
- Cliente de referencia: `code/tt_bevdet/server/client.py` (solo biblioteca estándar).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto temporal | Licencia | Hardware |
|---|---|---|---|---|---|
| BEVDet-P150 (este) | 76 M | 6 cámaras, 256x704 | 8 fotogramas BEV | Apache 2.0 | Tenstorrent p150 |
| AutowareFoundation/tensorrt_bevdet | 76 M (mismos pesos) | 6 cámaras, 256x704 | 8 fotogramas BEV | no disponible en la información | GPU con TensorRT |
| BEVDet (original, Huang et al.) | ~76 M (R50) | 6 cámaras | sin fusión temporal (BEVDet4D la añade) | no disponible en la información | GPU |
| BEVDet4D (original, Huang et al.) | ~76 M (R50) | 6 cámaras | fusión temporal | no disponible en la información | GPU |

La comparación se limita a variantes de la misma familia porque no se dispone de datos de rendimiento de alternativas en la información proporcionada. La diferencia práctica de este paquete es el backend Tenstorrent y la API HTTP propia, no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Modelo de percepción, no de lenguaje: no genera texto, no soporta chat, tool calling ni agentes; `GET /v1/models` es un stub.
- Solo funciona en hardware Tenstorrent p150; no hay ruta documentada para GPU, CPU u otros aceleradores en este paquete.
- Dependencia de calibración precisa: intrínsecos y extrínsecos incorrectos degradan las detecciones; el preset `synthetic_6cam` no sirve para datos reales.
- El historial BEV de 8 fotogramas hace que las puntuaciones varíen entre peticiones del mismo stream; sin `T_world_from_ego` no hay compensación de movimiento y la fusión es menos fiable en curvas o frenadas.
- Entrenado para las 10 clases de nuScenes y el entorno de conducción de ese dataset; el rendimiento fuera de dominio (clima, iluminación, sensores distintos) no está documentado.
- Riesgo de falsos positivos y negativos en objetos pequeños o lejanos, inherente a la detección camera-only; no se han publicado métricas de precisión en la información disponible.
- Sesgos del dataset de entrenamiento (geografía, condiciones meteorológicas, tipos de tráfico) no documentados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y procedencia de los pesos base de `AutowareFoundation/tensorrt_bevdet` antes de producción.
- No apto para seguridad funcional certificada sin validación adicional; la model card lo orienta a investigación, prototipado y procesamiento offline.
- La primera ejecución requiere compilar kernels (varios minutos) y descargar imagen y pesos; preverlo en despliegues automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/bevdet-p150
- Modelo base: https://huggingface.co/AutowareFoundation/tensorrt_bevdet
- Nodo Autoware: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/perception/autoware_tensorrt_bevdet
- Paper BEVDet: https://arxiv.org/abs/2112.11790
- Paper BEVDet4D: https://arxiv.org/abs/2203.17054
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
