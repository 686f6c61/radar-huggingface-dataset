# aether-models/aether-kit-yolox-s

## Resumen

Aether-Kit YOLOX-S es un checkpoint del detector de objetos YOLOX-S empaquetado por el proyecto Aether-Kit para su uso como grafo estático dentro de su runtime Core AI. Se trata del modelo `yolox_s.pth` original de la release `0.1.1rc0` de Megvii, entrenado sobre COCO y con 40,5 mAP a resolución 640, reexportado mediante el exportador Forge (`Forge/yolox/`) del propio Aether-Kit. El resultado es un artefacto de inferencia que consume una imagen BGR en rango 0..255, aplica letterbox con relleno 114 y devuelve 8400 predicciones densas con centro, tamaño, objectness y 80 probabilidades de clase COCO; el umbral de score y la NMS por clase quedan en el lado del host.

El interés del modelo no reside en la arquitectura ni en el entrenamiento, sino en el formato de despliegue: permite ejecutar un detector YOLOX-S estándar sobre el runtime propietario de Aether-Kit en macOS sin reimplementar el preprocesado ni la decodificación. Está pensado para pipelines de visión por computador que ya usan `AetherVision` con el contrato `detector-dense@1`, y su valor es la reproducibilidad del export, verificado contra la implementación upstream en CPU y float32.

La ficha se limita a lo que declara la model card del autor. No hay información publicada sobre composición del dataset de entrenamiento, resultados de benchmarks propios ni métricas de latencia del artefacto exportado más allá del mAP citado del checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-S (detector de objetos one-stage, anchor-free, con cabeza desacoplada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (el export se valida en float32; no se documentan otros formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (versión modificada, ver `NOTICE`) |
| Formato de pesos | grafo estático Core AI de Aether-Kit, con manifiesto `.aether/aether.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

YOLOX-S es un detector one-stage anchor-free de la familia YOLOX, con cabeza desacoplada para clasificación, regresión de caja y objectness. El checkpoint empaquetado corresponde a `yolox_s.pth` de la release `0.1.1rc0` de Megvii, entrenado sobre COCO, y reporta 40,5 mAP a 640 píxeles según la model card. No se detalla en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si hubo técnicas de refinamiento posteriores al entrenamiento supervisado.

La innovación técnica relevante está en el pipeline de exportación, no en el modelo. Forge convierte el checkpoint en un único grafo estático Core AI que integra el preprocesado (entrada BGR 0..255, letterbox anclado arriba a la izquierda a 640×640 con relleno 114) y la decodificación a 8400 predicciones densas con formato (cx, cy, w, h en píxeles del espacio letterbox, objectness, 80 clases COCO). El umbral de score y la NMS por clase se delegan al host. El export se validó contra la implementación upstream en CPU y float32, con informe en `export-report.json`.

## Capacidades

- Detección de objetos en imágenes con 80 clases del dataset COCO.
- Salida densa de 8400 predicciones con coordenadas en el espacio letterbox, objectness y distribución de clase.
- Preprocesado integrado en el grafo: conversión de entrada BGR en rango 0..255 y letterbox a 640×640 con relleno 114.
- Decodificación integrada: el consumidor recibe cajas listas para aplicar umbral y NMS, sin pasos intermedios.
- Integración con el runtime `AetherVision` de Aether-Kit bajo el contrato `detector-dense@1` en macOS.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales más allá de la visión.
- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

## Casos de uso

- Detección de objetos en aplicaciones macOS nativas: el grafo está pensado para cargarse con `AetherVision` en macOS, de modo que una app de escritorio puede incorporar detección COCO sin integrar PyTorch ni ONNX Runtime.
- Preprocesado y decodificación sin código propio: al integrar letterbox y decodificación en el grafo, el equipo solo implementa umbral de score y NMS por clase, lo que reduce la superficie de error frente a reimplementaciones manuales.
- Prototipado de pipelines de visión: sirve como bloque de detección de referencia para validar el resto de la cadena (tracking, conteo, recorte) antes de sustituir por un detector mayor.
- Moderación y filtrado de imágenes en local: al ejecutarse en el dispositivo, permite descartar o etiquetar imágenes con contenido sensible sin enviar datos a un servicio externo.
- Análisis de imágenes en lotes offline: la salida densa de 8400 predicciones es adecuada para procesos batch donde el host aplica NMS y agrega resultados por imagen.
- Referencia de exportación y regresión: el par `export-report.json` y la validación contra upstream permiten usar el artefacto como caso de prueba para cambios en Forge o en Core AI.
- Detección de personas y vehículos en vídeo pregrabado: con las clases COCO pertinentes, el detector sirve para anotación asistida o generación de metadatos en archivos de vídeo, aplicando NMS por fotograma en el host.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| mAP (COCO) | 40,5 | Checkpoint `yolox_s.pth` de la release `0.1.1rc0`, a 640 píxeles, según la model card |

No se han publicado resultados de benchmarks adicionales del artefacto exportado en la información disponible, ni tablas comparativas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el export se validó en CPU y float32, y el runtime declarado es macOS.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime Core AI de Aether-Kit mediante `AetherVision` con el contrato `detector-dense@1` en macOS, cargando el manifiesto `.aether/aether.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aether-Kit YOLOX-S | no disponible | Imagen 640×640 letterbox | 40,5 mAP COCO (checkpoint original) | Apache-2.0 (versión modificada) | Hugging Face, runtime Aether-Kit en macOS |
| YOLOX-S upstream (Megvii) | no disponible | Imagen 640×640 | 40,5 mAP COCO | Apache-2.0 | Repositorio GitHub de Megvii, checkpoint `yolox_s.pth` |
| Otros detectores COCO de tamaño S | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo upstream del que deriva el artefacto; no se dispone de datos de otros detectores comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario queda sin etiqueta fiable.
- El umbral de score y la NMS por clase no están incluidos en el grafo: el host debe implementarlos, y una configuración incorrecta degrada la precisión de forma directa.
- Las coordenadas de salida están en el espacio letterbox de 640×640 con relleno 114; es necesario revertir la transformación para obtener coordenadas en la imagen original.
- La entrada debe ser BGR en rango 0..255; pasar RGB o valores normalizados produce resultados incorrectos sin aviso.
- El runtime declarado es macOS con `AetherVision`; no se documenta compatibilidad con Linux, Windows ni con otros motores de inferencia.
- La licencia Apache-2.0 se aplica a una versión modificada del modelo; es obligatorio revisar `NOTICE` antes de redistribuir.
- No se publican datos sobre sesgos del detector ni sobre su comportamiento en dominios distintos de COCO.
- El repositorio figura con 0 descargas y 0 likes, y no hay evidencia de uso en producción.
- No se documentan cuantizaciones distintas de float32, lo que limita el despliegue en hardware con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-yolox-s
- Organización en Hugging Face: https://huggingface.co/aether-models
- Repositorio de YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Repositorio de Aether-Kit: https://github.com/bubstackdev/aether-kit
