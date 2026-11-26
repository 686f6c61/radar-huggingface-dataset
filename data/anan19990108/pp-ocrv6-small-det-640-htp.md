# anan19990108/pp-ocrv6-small-det-640-htp

## Resumen

PP-OCRv6 Small Detection 640×640 es un modelo de detección de regiones de texto (text detection) derivado del checkpoint `inference.onnx` de PaddlePaddle/PP-OCRv6_small_det_onnx, publicado por el usuario anan19990108. No es un modelo generativo ni un LLM: es un detector de cajas/polígonos de texto pensado para integrarse como primera etapa de un pipeline OCR (detección → reconocimiento). Su función es localizar qué zonas de una imagen contienen texto antes de que un modelo de reconocimiento las transcriba.

La aportación principal de esta ficha no es el modelo en sí, sino el trabajo de empaquetado y cuantización para aceleradores de borde. El autor ofrece el mismo detector en múltiples formatos: ONNX FP32, ONNX INT8 (W8A8 QDQ), TFLite flotante, TFLite INT8 y contextos QNN nativos para el NPU Hexagon del SoC Qualcomm QCS8550 (HTP v73). Esto permite desplegar el detector en dispositivos Android y Linux aarch64 con aceleración por NPU, algo poco habitual en la cadena de herramientas PaddleOCR estándar.

El modelo trabaja sobre imágenes de 640×640 píxeles; el preprocesado de imagen y la decodificación de polígonos se ejecutan en el host (CPU), no en el grafo. La licencia es Apache-2.0, heredada del checkpoint original de PaddlePaddle. El repositorio ocupa 0,1 GB y acumula 39 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de texto de la familia PP-OCRv6; backbone y cabeza no detallados en la model card) |
| Parametros totales | no disponible (el artefacto ONNX FP32 pesa 9,85 MB, lo que sugiere un modelo muy compacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32, INT8 W8A8 (QDQ) en ONNX y TFLite; contextos QNN nativos INT8 |
| Idiomas soportados | no disponible (la detección de texto es en gran medida independiente del idioma; no se declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32 e INT8), TFLite (flotante e INT8), QNN context binary (`.bin`) |

## Arquitectura y entrenamiento

No se detalla en la model card la arquitectura interna (tipo de backbone, cabeza de detección, si usa segmentación de mapas de texto o regresión de cajas). Se trata de un detector de texto de la familia PP-OCRv6 de PaddlePaddle, del que este repositorio es una conversión y cuantización, no un reentrenamiento. El checkpoint de origen es `inference.onnx` del repositorio PaddlePaddle/PP-OCRv6_small_det_onnx (revisión `28fe5895c24fd108c19eb3e8479f4ab385fbfc62`), con verificación SHA-256 documentada en `evaluation/results.json`.

El trabajo técnico destacable es la cadena de conversión: exportación a TFLite, cuantización INT8 (W8A8 con nodos QDQ) y compilación a contextos QNN para el HTP v73 del QCS8550 con QAIRT 2.47.0.260601. La entrada es una imagen de 640×640; el preprocesado (normalización, redimensionado) y la decodificación de polígonos se hacen en el host. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Detección de regiones de texto en imágenes de 640×640 píxeles, devolviendo polígonos o cajas que delimitan las zonas con texto.
- Ejecución en CPU vía ONNX Runtime (build FP32).
- Ejecución acelerada en NPU Hexagon (HTP v73) del Qualcomm QCS8550 mediante QNN, tanto a través del Execution Provider de ONNX Runtime como del backend nativo QNN y de TFLite.
- Variantes INT8 con pérdida de calidad mínima según las métricas publicadas (ver benchmarks).
- No incluye reconocimiento de texto (transcripción): es solo la etapa de detección.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de un LLM; no es un modelo de lenguaje.

## Casos de uso

- Digitalización documental en dispositivos de borde: usar el detector como primera etapa para localizar bloques de texto en escaneos o fotos antes de pasarlos a un reconocedor, ejecutando la inferencia en el NPU de un QCS8550 para reducir consumo y latencia.
- OCR en tiempo real sobre cámara en Android: con el contexto QNN INT8 (3,31 MB) se puede integrar en una app que detecte texto en el visor de la cámara y delegue el reconocimiento a otro modelo, manteniendo el detector en el HTP.
- Preprocesado en pipelines de facturas o formularios: detectar las regiones con texto para recortarlas y enviarlas a un modelo de reconocimiento o a un LLM de visión, reduciendo el área a procesar.
- Control de calidad en líneas de producción industrial: inspeccionar etiquetas o códigos impresos detectando si hay texto presente y dónde, con latencias del orden de milisegundos en NPU.
- Filtrado previo en datasets de imágenes: detectar automáticamente qué imágenes contienen texto para curar corpus de entrenamiento o moderación de contenido.
- Despliegue en dispositivos Linux aarch64 embebidos: usar la variante TFLite INT8 (2,85 MB) o el contexto QNN nativo INT8 (3,05 MB) en hardware con QCS8550 para OCR local sin conexión.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden precisión, recall y Hmean de detección sobre un subconjunto de 50 imágenes de validación, comparando flotante frente a INT8, además de latencias p50/p95 en milisegundos (10 calentamientos, sin contar preprocesado ni decodificación en host).

| Ámbito Linux HTP | Subconjunto | Precisión (float → INT8) | Recall (float → INT8) | Hmean (float → INT8) | p50 / p95 ms (float → INT8) |
|---|---|---|---|---|---|
| ONNX QNN EP `Session.Run` | 50 imágenes | 42,31% → 42,06% | 27,36% → 26,37% | 33,23% → 32,42% | 46,940 / 47,249 → 13,027 / 14,116 |
| QNN backend nativo `execute` | 50 imágenes | 42,31% → 42,06% | 27,36% → 26,37% | 33,23% → 32,42% | 45,731 / 46,543 → 12,933 / 13,998 |
| TFLite QNN `Invoke` | 50 imágenes | 42,31% → 43,51% | 27,36% → 28,36% | 33,23% → 34,34% | 15,488 / 15,578 → 3,899 / 3,946 |

El propio autor advierte que el Hmean absoluto es bajo porque la evaluación usa un subconjunto de validación del ejemplo upstream, no un benchmark completo. La ganancia de velocidad con INT8 es de aproximadamente 3,5× a 4× según la ruta de ejecución. No se han publicado resultados de benchmarks estándar (por ejemplo, ICDAR) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; es un modelo de borde que se ejecuta en CPU o NPU, no en GPU de escritorio. El artefacto más pequeño (TFLite INT8) ocupa 2,85 MB en disco.
- NPU objetivo: Qualcomm QCS8550 con Hexagon HTP v73, QAIRT 2.47.0.260601.
- CPU: cualquier CPU con ONNX Runtime para la variante FP32 (9,85 MB).
- GPU: no se documenta soporte de GPU (CUDA, ROCm); las rutas publicadas son CPU, TFLite y QNN.
- Despliegue: ONNX Runtime (CPU y QNN Execution Provider, versión 1.24.4 citada), TFLite C 2.11.1, backend nativo QNN.
- Latencia: en HTP v73, p50 de 3,9 ms (TFLite INT8), 12,9 ms (QNN nativo INT8) y 13,0 ms (ONNX QNN EP INT8); en flotante, entre 15,5 y 46,9 ms según la ruta.
- Throughput: no disponible de forma explícita; a partir de las latencias p50 se puede estimar del orden de 75–250 inferencias por segundo en INT8 según la ruta, sin contar preprocesado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Formatos | Aceleración NPU | Licencia |
|---|---|---|---|---|---|
| PP-OCRv6 Small Det 640 (este) | Detección de texto | 9,85 MB FP32 / 2,85 MB INT8 | ONNX, TFLite, QNN | Sí (HTP v73, QCS8550) | Apache-2.0 |
| PaddlePaddle/PP-OCRv6_small_det_onnx | Detección de texto | no disponible | ONNX | No documentada | Apache-2.0 |
| Detectores de texto genéricos de PaddleOCR (DB, EAST) | Detección de texto | variable | Paddle, ONNX (según conversión) | No documentada | Apache-2.0 |

La comparativa con alternativas de otros ecosistemas (por ejemplo, detectores DBNet convertidos a TFLite o QNN) no está disponible en la información proporcionada. La ventaja diferencial de este repositorio frente al checkpoint original es la disponibilidad de builds INT8 y contextos QNN listos para el QCS8550.

## Limitaciones y advertencias

- El Hmean absoluto reportado (33–34%) es bajo; el autor lo atribuye al subconjunto de validación empleado, pero conviene validar el modelo en el dominio objetivo antes de producción.
- La cuantización INT8 introduce una pérdida de calidad pequeña pero medible (por ejemplo, recall de 27,36% a 26,37% en ONNX QNN EP).
- Los contextos QNN son específicos del target (QCS8550, HTP v73, QAIRT 2.47); no son portables a otro SoC ni a otra versión de QAIRT sin recompilar.
- El modelo solo detecta texto; no transcribe. Requiere un reconocedor downstream para un pipeline OCR completo.
- El preprocesado y la decodificación de polígonos corren en el host, por lo que la latencia extremo a extremo será mayor que las cifras de NPU publicadas.
- No se documentan sesgos, cobertura idiomática ni comportamiento en escrituras no latinas; la detección de texto suele ser razonablemente agnóstica al idioma, pero no hay evidencia publicada en este repositorio.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de terceros (`THIRD_PARTY_LICENSES.txt`) y la atribución al checkpoint original de PaddlePaddle.
- Repositorio con muy poca tracción (39 descargas, 0 likes) y sin pipeline declarado; tratar como artefacto de conversión, no como modelo mantenido por un equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-small-det-640-htp
- Checkpoint de origen: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx
- Revisión concreta del checkpoint: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx/blob/28fe5895c24fd108c19eb3e8479f4ab385fbfc62/inference.onnx
- Resultados completos de evaluación (en el repo): `evaluation/results.json`
- Configuración de entrada/salida y postprocesado (en el repo): `config.json`
- Ejemplos de uso Linux TFLite INT8 (en el repo): `examples/LINUX_INT8.md`
- Ejemplos de uso Linux ONNX QNN EP e INT8 nativo (en el repo): `examples/LINUX_QNN_INT8.md`
- Ejemplos Android flotante e INT8 (en el repo): `examples/ANDROID.md`, `examples/ANDROID_INT8.md`
