# RabbitDaisuke/gemx-palm-fp16

## Resumen

GEM-X Palm Detection FP16 ONNX es una conversión a FP16 del detector de palmas de MediaPipe distribuido por OpenCV (`opencv/palm_detection_mediapipe`), publicada por el usuario RabbitDaisuke. No se trata de un modelo de lenguaje ni de un modelo generativo: es un detector de manos basado en SSD que localiza palmas y puntos clave en imágenes RGB, pensado para alimentar etapas posteriores de seguimiento de manos (por ejemplo, el modelo de landmarks de MediaPipe). El repositorio es una derivación técnica, no un modelo entrenado desde cero.

La relevancia es acotada y operativa: ofrece el detector original en formato ONNX con pesos FP16 y una entrada NCHW explícita de 1x3x192x192, lo que facilita su despliegue en runtimes ONNX (ONNX Runtime, TensorRT, OpenVINO) y reduce el uso de memoria frente a FP32. La conversión se realizó con NVIDIA ModelOpt ONNX AutoCast y añade un nodo Transpose para aceptar NCHW.

El modelo tiene un tamaño de repositorio de 0.0 GB (pesos muy ligeros, coherentes con un detector móvil de MediaPipe), licencia Apache-2.0 heredada del upstream y cero descargas en el momento de la consulta. No hay información sobre idiomas, pipeline ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot Detector) sobre backbone tipo MediaPipe, con cabezas de regresión de cajas y keypoints; conversión ONNX con nodo Transpose para entrada NCHW |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP16) |

Especificaciones adicionales de entrada/salida:

| Parametro | Valor |
|---|---|
| Entrada | `images`, float16 [1,3,192,192], RGB en rango 0..1 con letterbox centrado negro que preserva aspecto |
| Salida 1 | `Identity` [1,2016,18]: offsets crudos de cajas SSD y keypoints |
| Salida 2 | `Identity_1` [1,2016,1]: logits crudos |
| Etiquetas izquierda/derecha | no disponibles; el modelo no las emite, el consumidor debe decodificar anclas y aplicar NMS |
| Modelo base | opencv/palm_detection_mediapipe (fichero original `palm_detection_mediapipe_2023feb.onnx`, SHA-256 `78ff51c38496b7fc8b8ebdb6cc8c1abb02fa6c38427c6848254cdaba57fcce7c`) |

## Arquitectura y entrenamiento

El modelo es un detector SSD de una sola etapa, heredado de MediaPipe Palm Detection, con 2016 anclas y dos cabezas de salida: una de 18 valores por ancla (offsets de caja más keypoints) y otra de 1 logit por ancla (puntuación de objeto). La entrada es una imagen RGB de 192x192 en formato NCHW, con normalización a 0..1 y letterbox centrado que preserva la relación de aspecto. El consumidor debe decodificar las anclas y aplicar supresión no máxima (NMS) para obtener detecciones finales.

No se ha realizado entrenamiento nuevo en este repositorio: es una conversión de un modelo ya entrenado. La transformación aplicada consiste en AutoCast a FP16 mediante NVIDIA ModelOpt ONNX y la inserción de un nodo Transpose para aceptar entrada NCHW. No hay información disponible sobre el dataset de entrenamiento original, número de tokens (no aplica), composición de datos ni uso de RLHF/DPO. El autor advierte explícitamente que la concordancia numérica en CPU entre FP32 y FP16 no demuestra soporte real en TensorRT para RTX/SCG ni precisión de detección en escenarios reales.

## Capacidades

- Detección de palmas de manos en imágenes RGB: localiza cajas delimitadoras y puntos clave de la palma.
- Salida de offsets crudos de cajas y keypoints (18 valores por ancla) y logits de objeto (1 valor por ancla).
- Diseñado como etapa previa a un modelo de landmarks de manos (por ejemplo, el de MediaPipe) para pipelines de seguimiento.
- Inferencia en FP16 sobre ONNX, compatible con runtimes que soporten este tipo de dato.
- No emite etiquetas de mano izquierda/derecha; esa clasificación debe resolverla el consumidor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades generativas.

## Casos de uso

- Seguimiento de manos en tiempo real en aplicaciones de escritorio: el detector localiza la palma en cada fotograma y alimenta un modelo de landmarks posterior; su entrada fija de 192x192 y pesos FP16 permiten latencias bajas en CPU o GPU integrada.
- Control por gestos en interfaces de usuario: integrado en un pipeline de captura de webcam, el modelo proporciona la región de la mano para que etapas posteriores reconozcan gestos (pinza, palma abierta) y actúen sobre la UI.
- Preprocesado en aplicaciones de realidad aumentada: detecta la palma para anclar objetos virtuales sobre la mano, con el letterbox centrado garantizando consistencia geométrica entre resoluciones de entrada.
- Filtrado y recorte en herramientas de edición de vídeo: detección de manos por fotograma para aplicar efectos, seguimiento o desenfoque selectivo en postproducción.
- Automatización de pruebas de percepción: uso como referencia en tests de regresión de pipelines de visión, comparando salidas FP16 frente a FP32 con los hashes de `provenance.json`.
- Despliegue en dispositivos de borde: al ser un modelo ligero en ONNX FP16, puede ejecutarse en placas embebidas con ONNX Runtime o TensorRT, siempre que se valide la precisión real de detección en el hardware objetivo.
- Prototipado de sistemas de interacción sin contacto (kioscos, señalización digital): detección de presencia de manos como disparador de interacción, sin necesidad de un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una comparación numérica FP32/FP16 en CPU documentada en `provenance.json`, y advierte que dicha concordancia no demuestra soporte en TensorRT para RTX/SCG ni precisión de detección en el mundo real. No se aportan cifras de mAP, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la entrada 1x3x192x192, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponibles de forma específica; cualquier GPU con soporte ONNX Runtime o TensorRT debería poder ejecutarlo. El autor no confirma soporte en TensorRT para RTX/SCG.
- Compatibilidad con GPU consumer: previsiblemente sí en cualquier RTX o GPU integrada moderna, aunque no hay validación publicada.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT (soporte no verificado por el autor), OpenVINO y otros runtimes compatibles con ONNX FP16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GEM-X Palm Detection FP16 ONNX (este) | SSD detector de palmas | 1x3x192x192 NCHW | ONNX FP16 | Apache-2.0 | Conversión de MediaPipe; sin etiquetas izquierda/derecha |
| opencv/palm_detection_mediapipe | SSD detector de palmas | 192x192 (formato original) | ONNX (FP32) | Apache-2.0 | Modelo base upstream; referencia para comparar precisión |
| MediaPipe Hands (pipeline completo) | Detector + landmarks | Variable | TFLite / otros | Apache-2.0 | Incluye detección de palma y landmarks; no es un único ONNX comparable directamente |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- No emite etiquetas de mano izquierda/derecha; el consumidor debe decodificar anclas, aplicar NMS y clasificar la lateralidad por su cuenta.
- La conversión a FP16 puede degradar la precisión numérica frente a FP32; el autor solo documenta concordancia en CPU, no en GPU ni en TensorRT.
- El soporte en TensorRT para RTX/SCG no está verificado y no debe asumirse.
- No hay benchmarks de precisión de detección en escenarios reales (mAP, tasas de falsos positivos) publicados en el repositorio.
- El letterbox debe ser centrado, con fondo negro y preservando aspecto; un preprocesado distinto puede alterar las detecciones.
- Licencia Apache-2.0 heredada del upstream, con el fichero LICENSE original incluido; permite uso comercial, pero conviene conservar los avisos de atribución.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; trátese como una conversión no auditada externamente.
- El autor aclara que no es un NVIDIA RT-DETR Hand Detector; no debe confundirse con dicho modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RabbitDaisuke/gemx-palm-fp16
- Modelo base: https://huggingface.co/opencv/palm_detection_mediapipe
- Fichero de procedencia mencionado en la model card: `provenance.json` (incluido en el repositorio, hashes y comparación FP32/FP16)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
