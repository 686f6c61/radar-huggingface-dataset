# changh95/superpoint-p150

## Resumen

SuperPoint es un detector y descriptor de puntos de interés (keypoints) completamente convolucional, publicado originalmente por Magic Leap en 2017 (arXiv:1712.07629). El modelo resuelve el problema de la detección y descripción de features locales de forma auto-supervisada, sustituyendo los pipelines clásicos tipo SIFT/ORB por una red neuronal que produce keypoints, sus puntuaciones y descriptores de 256 dimensiones en una sola pasada. Con tan solo 1,3 millones de parámetros, es un modelo muy ligero orientado a visión por computador clásica: matching de features, homografías, odometría visual, SLAM y structure-from-motion.

La variante `changh95/superpoint-p150` no es un reentrenamiento ni un fine-tuning: es un port del modelo original `magic-leap-community/superpoint` (pesos sin modificar en el commit `734450e9`) empaquetado para ejecutarse en hardware Tenstorrent p150 mediante `tt-model-manager`. El paquete incluye el servidor HTTP propio del modelo, con decodificación de imagen, non-maximum suppression (NMS) y muestreo de descriptores ejecutados en el dispositivo.

Es relevante ahora porque demuestra el despliegue de un modelo de visión no generativo en aceleradores Tenstorrent con un pipeline completo en device, y porque expone un endpoint HTTP con latencias medidas (1,83 ms de forward en device para una imagen de 1600x900). No es un modelo de lenguaje: no genera texto ni soporta chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN totalmente convolucional tipo VGG (8 convoluciones 3x3, 3 max-pools 2x2) con cabeza de keypoints (softmax de 65 vías por celda 8x8) y cabeza de descriptores de 256 dimensiones |
| Parametros totales | 1,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de una imagen redimensionada a 480x640 (se lee solo el primer canal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Magic Leap SuperPoint licence (`magic-leap-superpoint-licence`); solo uso no comercial en investigación |
| Formato de pesos | pesos originales de `magic-leap-community/superpoint` descargados en tiempo de arranque; paquete distribuido como imagen Docker con manifiesto de `tt-model-manager` 0.1.0 (schema 5.1) |

## Arquitectura y entrenamiento

La red es un encoder convolucional estilo VGG: ocho convoluciones de 3x3 con tres max-pools de 2x2, que reducen la imagen de entrada de 480x640 a un mapa de features de 60x80. Sobre ese mapa actúan dos cabezas: una cabeza de detección que produce un softmax de 65 vías por cada celda de 8x8 píxeles (64 celdas más una clase "no keypoint"), y una cabeza de descriptores que genera vectores de 256 dimensiones, normalizados en L2 y muestreados en las posiciones de los keypoints. El modelo es de una sola imagen por inferencia y lee únicamente el primer canal de la entrada.

El entrenamiento original es auto-supervisado (self-supervised): SuperPoint se entrena con un procedimiento de "homographic adaptation" sobre imágenes sintéticas de figuras geométricas (Synthetic Shapes) y datos reales sin etiquetas, según el paper de referencia. Esta ficha no dispone de detalles adicionales sobre número de tokens, composición exacta del dataset ni uso de RLHF/DPO, que no aplican a un modelo de visión de este tipo. La innovación técnica del port es de despliegue: NMS (radio 4), lista de keypoints y muestreo de descriptores se ejecutan en el dispositivo Tenstorrent junto con la red, con el forward a 1,83 ms en el hardware p150.

## Capacidades

- Detección de puntos de interés (keypoints) en una imagen, con puntuaciones de confianza por keypoint.
- Descripción de keypoints con descriptores de 256 dimensiones normalizados en L2, aptos para matching.
- Non-maximum suppression configurable (radio 0 a 32; radios 1 a 8 en device, 0 y >8 en host).
- Filtrado por umbral de score (`keypoint_threshold`, 0 a 1, por defecto 0,005) y limitación del número de keypoints (`max_keypoints`, por defecto 1024, máximo 307.200).
- Coordenadas de keypoints devueltas en píxeles de la imagen original, con metadatos de escala y tamaño.
- Tres rutas de entrada: imagen base64 en JSON (`/predict`), binario PNG/JPEG (`/predict_raw`) y plano uint8 de un canal (`/predict_plane`, evita la decodificación de imagen).
- Endpoints de estado: `GET /health` y `GET /info`; `GET /v1/models` es un stub, no una API de chat.
- No soporta tool calling, agentes, razonamiento multi-step, generación de texto, visión semántica ni audio.

## Casos de uso

- SLAM y odometría visual: el modelo extrae keypoints y descriptores por fotograma para estimar el movimiento de la cámara; su bajo coste (1,3 M de parámetros, 1,83 ms de forward en p150) permite procesar secuencias a alta frecuencia dentro de un pipeline de SLAM.
- Estimación de homografía y pose relativa: los descriptores de 256 dimensiones y los keypoints con score permiten emparejar dos vistas de la misma escena y calcular la transformación geométrica entre ellas, por ejemplo en calibración o registro de imágenes.
- Structure-from-motion (SfM): el modelo alimenta la etapa de extracción de features de un pipeline SfM de investigación, sustituyendo a SIFT/ORB con un detector aprendido y reproducible.
- Matching de imágenes para realidad aumentada: alineación de un plano real con contenido virtual mediante keypoints detectados en tiempo real, aprovechando el endpoint HTTP del servidor para integrarlo en una aplicación de RA.
- Investigación en visión con aceleradores Tenstorrent: el paquete sirve como referencia de despliegue de un modelo convolucional completo (red, NMS y muestreo de descriptores) en hardware p150, útil para estudiar el rendimiento de estos aceleradores en cargas de visión.
- Procesamiento por lotes de imágenes en un servidor: la ruta `/predict_plane` evita la decodificación de imagen y reduce la latencia de preprocesado, adecuada para servir features a un sistema de recuperación o indexación de imágenes.
- Docencia y reproducción de resultados: al usar los pesos originales sin modificar, permite reproducir los resultados del paper de SuperPoint en un entorno de servidor estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí incluye datos de latencia medidos para la imagen de muestra (`house_in_field_1080p.jpg`, 1600x900) en hardware p150:

| Etapa | Tiempo (ms) |
|---|---|
| Preprocesado | 27,35 |
| Forward en device | 1,83 |
| Postprocesado | 0,23 |
| Total | 29,42 |

La respuesta de ejemplo para esa imagen devuelve 534 keypoints con `max_keypoints=1024`, `keypoint_threshold=0,005` y `nms_radius=4`.

## Requisitos de hardware

- Hardware obligatorio: acelerador Tenstorrent p150 (mesh `P150`). No se documenta soporte para GPU convencionales.
- El paquete se distribuye como imagen Docker y requiere Docker y, opcionalmente, la CLI `tt` (`uv tool install tenstorrent`).
- Arranque mediante `tt serve changh95/superpoint-p150` o `tt-model serve changh95/superpoint-p150`; el servidor escucha en el puerto 20000 (o el siguiente libre).
- El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- Los pesos (9,2 GB de repositorio, incluyendo el paquete) se descargan de Hugging Face en el arranque y se cachean en el directorio de caché de HF; no van incluidos en la imagen.
- No hay datos publicados de VRAM, throughput agregado ni latencia para otras resoluciones; solo la latencia por imagen del ejemplo en p150.
- No cabe en GPU de consumo: el requisito es el acelerador Tenstorrent p150, no una GPU NVIDIA o AMD.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| superpoint-p150 (este) | 1,3 M | CNN detector/descriptor | 480x640, una imagen | Magic Leap SuperPoint (solo investigación no comercial) | Paquete Docker para Tenstorrent p150 |
| magic-leap-community/superpoint | 1,3 M | CNN detector/descriptor | 480x640, una imagen | Magic Leap SuperPoint (solo investigación no comercial) | Pesos originales en Hugging Face |
| SIFT / ORB (clásicos) | no aplica | Algoritmos no neuronales | imagen completa | Librerías de uso libre (OpenCV, etc.) | Amplia, en CPU/GPU |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Magic Leap SuperPoint licence permite únicamente uso no comercial en investigación; no es apta para producción comercial sin licencia adicional.
- No es un modelo de lenguaje: no genera texto, no soporta chat, tool calling ni agentes; el endpoint `/v1/models` es un stub.
- Entrada limitada: una imagen por inferencia, redimensionada a 480x640, y solo se lee el primer canal (R de RGB o plano de gris); se descarta la información de color restante.
- Dependencia de hardware exótica: requiere un acelerador Tenstorrent p150; no hay ruta documentada para GPU convencionales ni CPU.
- El primer arranque es lento por la compilación de kernels; no es adecuado para despliegues efímeros sin caché.
- NMS fuera de rango: radios 0 y mayores de 8 se ejecutan en el host y son más lentos.
- Riesgo de alucinación no aplica en el sentido generativo, pero el detector puede producir keypoints espurios en regiones de bajo contraste o textura repetitiva; el umbral y el NMS son los mecanismos de control.
- Sesgos: no se documentan sesgos específicos; al ser un detector geométrico, su rendimiento puede degradarse en escenas con cambios de iluminación extremos, desenfoque o dominios muy distintos a los datos de entrenamiento.
- Sin datos publicados de benchmarks ni de comportamiento multilingüe (no aplica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/superpoint-p150
- Modelo base: https://huggingface.co/magic-leap-community/superpoint
- Licencia del modelo base: https://huggingface.co/magic-leap-community/superpoint/blob/main/LICENSE
- Paper de SuperPoint: https://arxiv.org/abs/1712.07629
- Código original de Magic Leap: https://github.com/magicleap/SuperPointPretrainedNetwork
- Port a Tenstorrent: https://github.com/changh95/tt-superpoint
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Imagen de muestra: https://huggingface.co/changh95/superpoint-p150/resolve/main/code/sample_data/house_in_field_1080p.jpg
- Script de smoke test: https://huggingface.co/changh95/superpoint-p150/resolve/main/code/models/server/smoke_test.py
