# anan19990108/pp-ocrv6-tiny-det-640-htp

## Resumen

PP-OCRv6 Tiny Detection 640 es un modelo de deteccion de regiones de texto (text detection) derivado del checkpoint oficial `PP-OCRv6_tiny_det_onnx` de PaddlePaddle, publicado por el usuario anan19990108. No es un modelo generativo ni un LLM: es un detector de cajas/poligonos de texto pensado para integrarse en un pipeline OCR completo (deteccion + reconocimiento). Su aportacion principal es el empaquetado en multiples formatos optimizados para aceleradores Qualcomm Hexagon (HTP v73) sobre el SoC QCS8550, incluyendo ONNX FP32, ONNX INT8 (W8A8 QDQ), TFLite float e INT8, y contextos QNN nativos para Android y Linux aarch64.

El modelo procesa imagenes de 640 x 640 y devuelve regiones de texto; el preprocesado de imagen y la decodificacion de poligonos se ejecutan en el host, no en el acelerador. El repositorio es muy ligero (los ficheros van de 0,65 MB a 1,85 MB segun formato), lo que lo hace adecuado para despliegue en dispositivos edge con recursos limitados.

Es relevante ahora porque demuestra un flujo completo de cuantizacion y despliegue en NPU para una tarea OCR clasica, con mediciones de latencia y calidad float frente a INT8 publicadas por el autor. Las cifras de calidad son bajas en terminos absolutos (Hmean ~29,88% en el subconjunto de validacion usado), por lo que debe interpretarse como una pieza de infraestructura/portabilidad mas que como un detector de altas prestaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de deteccion de texto (derivada de PP-OCRv6 tiny det); topologia interna no detallada en la informacion disponible |
| Parametros totales | no disponible (pesos de 0,65 a 1,85 MB segun formato, sin recuento de parametros publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640 x 640) |
| Tipos de cuantizacion | FP32, INT8 W8A8 (QDQ) en ONNX y TFLite; contextos QNN nativos INT8 |
| Idiomas soportados | no disponible (la deteccion de texto es independiente del idioma en principio, pero no se documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32 e INT8), TFLite (float e INT8), QNN context bin (Android y Linux aarch64) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna (backbone, cabecera de deteccion, tipo de representacion de cajas o poligonos) del checkpoint original de PaddlePaddle. El modelo base es `PaddlePaddle/PP-OCRv6_tiny_det_onnx` (revision `2ba1506c0380b8f0b03dd142459aac66d4421f6c`), del que este repositorio toma el fichero `inference.onnx`. El autor no documenta el dataset de entrenamiento, el numero de tokens ni procesos de RLHF/DPO (no aplicables a un detector).

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el empaquetado y la cuantizacion: se ofrecen builds FP32 e INT8 W8A8 (QDQ) para ONNX Runtime, TFLite y QNN, con contextos precompilados especificos para HTP v73 del QCS8550 bajo QAIRT 2.47.0.260601 y TFLite C 2.11.1. El preprocesado de imagen y la decodificacion de poligonos se ejecutan en el host, de modo que el acelerador solo ejecuta la pasada de inferencia. Se incluyen sumas SHA-256 y verificacion del checkpoint de origen.

## Capacidades

- Deteccion de regiones de texto en imagenes de 640 x 640, devolviendo cajas/poligonos que el host decodifica.
- Ejecucion en CPU via ONNX Runtime (build FP32).
- Ejecucion en NPU Hexagon HTP v73 (QCS8550) mediante QNN, tanto via ONNX Runtime QNN EP como via backend QNN nativo y TFLite QNN.
- Variantes INT8 W8A8 para reducir huella (hasta 0,65 MB en TFLite INT8) y latencia.
- Soporte de despliegue en Linux aarch64 y Android.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni multimodalidad mas alla de la deteccion de texto en imagen.
- El reconocimiento del contenido textual (OCR propiamente dicho) no forma parte de este modelo; requiere un modelo de reconocimiento adicional.

## Casos de uso

- Digitalizacion de documentos en dispositivos edge: el detector localiza regiones de texto en escaneos o fotos y las pasa a un reconocedor; su tamano (menos de 2 MB) permite incluirlo en apps moviles sin penalizar el paquete.
- OCR en tiempo real sobre video en SoC QCS8550: con latencias INT8 de ~2,4 ms p50 en TFLite QNN y ~10 ms en QNN nativo/ONNX QNN EP, es viable procesar fotogramas continuos en el dispositivo.
- Preprocesado de pipelines OCR en servidores aarch64: el build ONNX FP32 se ejecuta en CPU con ONNX Runtime para entornos sin NPU.
- Lectura de matricula o señaletica en camaras embebidas: la deteccion de regiones de texto es el primer paso antes del reconocimiento, y la cuantizacion INT8 reduce el consumo energetico en HTP.
- Automatizacion de facturas y formularios en el dispositivo: detectar primero las zonas con texto permite recortar y enviar solo esas regiones al reconocedor, ahorrando ancho de banda y computo.
- Prototipado de soluciones OCR en Android: los ejemplos de Android float e INT8 documentados permiten integrar el modelo en una app sin infraestructura de servidor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un subconjunto de validacion del ejemplo upstream (50 imagenes). Las columnas de calidad muestran float → INT8; los tiempos usan 10 calentamientos y excluyen preprocesado y decodificacion en host.

| Backend (Linux HTP) | Precision | Recall | Hmean | p50 / p95 ms (float → INT8) |
|---|---|---|---|---|
| ONNX QNN EP `Session.Run` | 38,58% → 39,47% | 24,38% → 22,39% | 29,88% → 28,57% | 24,448 / 25,148 → 10,282 / 10,329 |
| QNN native backend execute | 38,58% → 39,47% | 24,38% → 22,39% | 29,88% → 28,57% | 24,714 / 25,395 → 10,067 / 10,118 |
| TFLite QNN `Invoke` | 38,58% → 37,07% | 24,38% → 21,39% | 29,88% → 27,13% | 7,838 / 7,978 → 2,415 / 2,463 |

El propio autor advierte que el Hmean absoluto es bajo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM/espacio: el modelo ocupa entre 0,65 MB (TFLite INT8) y 1,85 MB (contexto QNN Android); cabe holgadamente en cualquier dispositivo.
- Acelerador objetivo: Qualcomm Hexagon HTP v73 sobre QCS8550, con QAIRT 2.47.0.260601 y TFLite C 2.11.1.
- CPU: el build ONNX FP32 funciona en ONNX Runtime CPU; el INT8 ONNX requiere ORT 1.24.4 con QNN EP para el path acelerado.
- No se documentan requisitos para GPU NVIDIA (A100, H100, RTX 4090); no es el target del modelo.
- Cabe en cualquier GPU consumer, pero no hay builds ni mediciones para CUDA.
- Opciones de despliegue: ONNX Runtime (CPU y QNN EP), TFLite (float e INT8), backend QNN nativo, Android y Linux aarch64.
- Latencia medida (p50, INT8): ~2,4 ms en TFLite QNN, ~10,1 ms en QNN nativo y ~10,3 ms en ONNX QNN EP, sin contar preprocesado ni decodificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anan19990108/pp-ocrv6-tiny-det-640-htp | Detector de texto cuantizado | 0,65–1,85 MB | 640 x 640 | Apache-2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv6_tiny_det_onnx | Detector de texto (origen) | no disponible | 640 x 640 | Apache-2.0 | Hugging Face |
| PP-OCRv6 det (otros builds) | Detector de texto | no disponible | no disponible | Apache-2.0 (upstream) | Hugging Face / PaddleOCR |

No se dispone de datos de rendimiento de los alternativos en la informacion proporcionada para una comparacion cuantitativa; las cifras de Hmean del repositorio (29,88% float) no son directamente comparables con las metricas oficiales de PP-OCR sin el mismo subconjunto de evaluacion.

## Limitaciones y advertencias

- Calidad absoluta baja: Hmean de 29,88% en float sobre el subconjunto usado; el autor lo reconoce explicitamente. No apto para produccion sin validacion en el dominio propio.
- La cuantizacion INT8 degrada ligeramente la calidad (Hmean 29,88% → 28,57% en ONNX/QNN nativo; 29,88% → 27,13% en TFLite QNN).
- Solo detecta regiones de texto; no reconoce el contenido. Requiere un modelo de reconocimiento para un OCR completo.
- No se documentan sesgos, pero al ser un detector de texto puede fallar en idiomas, tipografias o layouts no representados en su entrenamiento original.
- Los contextos QNN estan compilados para QCS8550 HTP v73 y versiones concretas de QAIRT/TFLite; no son portables a otros SoC o versiones sin recompilar.
- No hay informacion sobre limitaciones de contexto ni idiomas soportados.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de terceros incluidos (NOTICE, THIRD_PARTY_LICENSES.txt).
- Repositorio con muy poca traccion (42 descargas, 0 likes) y sin pipeline declarado; conviene verificar la integridad con SHA256SUMS antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-tiny-det-640-htp
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx
- Checkpoint de origen (revision fija): https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_onnx/blob/2ba1506c0380b8f0b03dd142459aac66d4421f6c/inference.onnx
- Resultados de evaluacion: https://huggingface.co/anan19990108/pp-ocrv6-tiny-det-640-htp/blob/1969257b2e2102ffe42d2a4f0a0d3bb2cc803319/evaluation/results.json
- README detallado (revision fija): https://huggingface.co/anan19990108/pp-ocrv6-tiny-det-640-htp/blob/1969257b2e2102ffe42d2a4f0a0d3bb2cc803319/README.md
- Ejemplos Linux TFLite INT8, Linux QNN INT8 y Android: incluidos en el repositorio (examples/LINUX_INT8.md, examples/LINUX_QNN_INT8.md, examples/ANDROID.md, examples/ANDROID_INT8.md)
