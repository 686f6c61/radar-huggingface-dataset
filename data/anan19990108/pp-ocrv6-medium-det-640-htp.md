# anan19990108/pp-ocrv6-medium-det-640-htp

## Resumen

PP-OCRv6 Medium Detection 640×640 es un modelo de detección de regiones de texto (text detection) derivado del checkpoint oficial `PaddlePaddle/PP-OCRv6_medium_det_onnx`. Lo publica el usuario anan19990108 como artefacto optimizado para aceleradores hardware, concretamente el Hexagon Tensor Processor (HTP) v73 del SoC Qualcomm QCS8550. No es un modelo de lenguaje ni un OCR completo: es únicamente la etapa de detección de cajas de texto sobre imágenes de 640×640 píxeles.

El interés del repositorio no reside en el modelo base (que proviene de la familia PP-OCRv6 de PaddlePaddle, ampliamente usada en pipelines OCR de producción), sino en el trabajo de conversión y cuantización: ofrece el mismo detector en formato ONNX FP32, TFLite de referencia, TFLite INT8, contextos QNN nativos INT8 para Android y Linux, y ONNX INT8 con QDQ W8A8. Todos los artefactos están pensados para ejecutarse en el HTP del QCS8550 con QAIRT 2.47.

La relevancia actual es de nicho pero clara: permite desplegar detección de texto OCR en dispositivos embebidos Qualcomm con aceleración NPU, algo poco habitual en el ecosistema PP-OCR, donde la mayoría de artefactos publicados son ONNX CPU o modelos Paddle originales. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de detección de texto (heredera de la rama de detección de PP-OCRv6; arquitectura interna detallada no disponible) |
| Parametros totales | no disponible (pesos FP32 de 61,99 MB en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 640×640) |
| Tipos de cuantizacion | FP32, INT8 (W8A8 QDQ en ONNX; INT8 nativo en TFLite y QNN) |
| Idiomas soportados | no disponible (detección de texto independiente del idioma; no se declara cobertura) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32 e INT8), TFLite (float e INT8), QNN context bin (Android y Linux) |

## Arquitectura y entrenamiento

El modelo es la etapa de detección de texto de PP-OCRv6 en su variante "medium", exportada a ONNX desde el checkpoint oficial de PaddlePaddle. La model card no detalla la arquitectura interna (backbone, cabeza de detección, tipo de representación de regiones), por lo que no es posible confirmar si emplea un esquema tipo DB (Differentiable Binarization) u otro. La entrada es una imagen de 640×640 y la salida son regiones de texto que el host decodifica en polígonos; el preprocesado de imagen y la decodificación de polígonos se ejecutan fuera del modelo, en CPU.

No se proporciona información sobre el dataset de entrenamiento, número de tokens (no aplica), composición de datos ni procesos de ajuste (RLHF/DPO no aplican a un detector). La innovación técnica del repositorio es el pipeline de conversión y cuantización: se ofrecen builds FP32 e INT8 para TFLite, contextos QNN nativos para Android y Linux, y ONNX INT8 con cuantización QDQ W8A8 manteniendo entradas/salidas en FP32. Los artefactos están fijados a QAIRT 2.47.0.260601, TFLite C 2.11.1 y ORT 1.24.4 con QNN EP.

## Capacidades

- Detección de regiones de texto en imágenes de 640×640 píxeles.
- Salida de cajas/polígonos de texto que el host decodifica (la decodificación no forma parte del modelo).
- Ejecución en CPU vía ONNX Runtime (build FP32).
- Ejecución acelerada en NPU Hexagon HTP v73 del QCS8550 vía QNN (contextos nativos Android y Linux).
- Ejecución en TFLite con delegado QNN (float e INT8).
- Cuantización INT8 con pérdida de calidad mínima según los resultados publicados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- Capacidades multilingües: no declaradas; la detección de regiones es en principio independiente del idioma, pero no se documenta cobertura.

## Casos de uso

- Digitalización de documentos en dispositivos embebidos: el detector localiza regiones de texto en escaneos o fotos de 640×640 antes de pasarlas a un reconocedor OCR; encaja en pipelines PP-OCR donde se sustituye la etapa de detección por una versión acelerada en NPU.
- OCR en terminales industriales con QCS8550: lectura de etiquetas, códigos y paneles en entornos de fábrica o logística, aprovechando la latencia INT8 de ~13-31 ms por imagen en HTP.
- Procesamiento de tickets y facturas en dispositivos Android: el contexto QNN para Android permite detectar regiones de texto en la propia NPU del terminal, reduciendo el consumo energético frente a CPU.
- Extracción de texto en cámaras de vigilancia o lectura de matrículas (previa adaptación): la detección de regiones es el primer paso; con 640×640 de entrada y latencias de decenas de milisegundos es viable en flujos de vídeo de baja/media cadencia.
- Preprocesado en pipelines de accesibilidad: localización de texto en capturas de pantalla para lectores de pantalla o traducción automática en dispositivos móviles.
- Automatización de archivo documental en edge: detección de regiones de texto en lotes de imágenes dentro de un dispositivo Linux aarch64 con QCS8550, sin depender de la nube.
- Integración en aplicaciones de escaneo móvil: el build TFLite INT8 (16,41 MB) permite incluir el detector en apps Android con delegado QNN y un footprint reducido.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan FP32 frente a INT8 sobre un subconjunto de 50 imágenes de validación del ejemplo upstream. La calidad absoluta es baja (Hmean ~38 %), lo que el propio autor atribuye al subconjunto de evaluación; los tiempos excluyen preprocesado y decodificación del host y usan 10 calentamientos.

| Backend (Linux HTP) | Subset | Precision (float → INT8) | Recall (float → INT8) | Hmean (float → INT8) | p50 / p95 ms (float → INT8) |
|---|---|---|---|---|---|
| ONNX QNN EP `Session.Run` | 50 imágenes | 46,15 % → 46,81 % | 32,84 % → 32,84 % | 38,37 % → 38,60 % | 111,325 / 112,237 → 30,884 / 31,904 |
| QNN native backend execute | 50 imágenes | 46,15 % → 46,81 % | 32,84 % → 32,84 % | 38,37 % → 38,60 % | 111,332 / 112,042 → 31,026 / 31,246 |
| TFLite QNN `Invoke` | 50 imágenes | 46,15 % → 45,83 % | 32,84 % → 32,84 % | 38,37 % → 38,26 % | 65,938 / 66,390 → 13,450 / 14,527 |

La cuantización INT8 reduce la latencia entre 3,5× y 4,9× según backend, con una variación de calidad prácticamente nula (diferencias de Hmean de ±0,23 puntos). No se han publicado resultados comparativos con otros detectores (por ejemplo, variantes de PP-OCRv5 u otros modelos de detección) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el modelo es pequeño; el ONNX FP32 ocupa 61,99 MB y el INT8 16,23 MB. En ejecución, el consumo de memoria es bajo, pero no se publican cifras de memoria pico.
- GPU recomendadas: no aplica; el modelo está orientado a NPU Hexagon HTP v73 del QCS8550 y a CPU. No se documenta soporte CUDA.
- Consumer GPU: no se documenta; el modelo puede ejecutarse en CPU vía ONNX Runtime, pero no está optimizado para GPU de escritorio.
- Despliegue: ONNX Runtime (CPU y QNN EP 1.24.4), TFLite C 2.11.1 con delegado QNN, QAIRT 2.47.0.260601 para contextos QNN nativos. No se mencionan vLLM, llama.cpp ni Ollama (no aplican).
- Latencia: p50 de 13,45 ms (TFLite QNN INT8) a 31,03 ms (QNN nativo INT8) en QCS8550 HTP v73; en FP32, de 65,94 ms a 111,33 ms. p95 entre 14,53 y 112,24 ms según backend y precisión.
- Throughput: no disponible de forma explícita; a partir de las latencias p50 se puede estimar del orden de 32-74 imágenes/s en INT8, pero el autor no lo declara.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anan19990108/pp-ocrv6-medium-det-640-htp (este) | Detección de texto, builds ONNX/TFLite/QNN | 61,99 MB FP32 / 16,23 MB INT8 | 640×640 | Apache-2.0 | Hugging Face |
| PaddlePaddle/PP-OCRv6_medium_det_onnx | Detección de texto, ONNX | no disponible | 640×640 (según checkpoint base) | Apache-2.0 | Hugging Face |
| Otros detectores PP-OCR (v5/v6, variantes) | Detección de texto | no disponible | variable | Apache-2.0 (habitual) | Hugging Face / PaddleOCR |

La comparativa se limita al modelo base y a la familia PP-OCR; no se dispone de datos de benchmarks de alternativas en la información proporcionada. La diferencia principal de este repositorio frente al checkpoint base es la disponibilidad de artefactos cuantizados y optimizados para HTP.

## Limitaciones y advertencias

- Solo detección: no reconoce texto ni genera transcripciones; requiere un modelo de reconocimiento posterior.
- Calidad absoluta baja en el subconjunto de evaluación publicado (Hmean ~38 %); el autor lo atribuye al subconjunto, pero no hay evaluación sobre un benchmark estándar que permita confirmar el rendimiento real.
- Dependencia fuerte de hardware y versiones: los contextos QNN están fijados a QCS8550 HTP v73 y QAIRT 2.47.0.260601; no son portables a otros SoC ni versiones sin recompilar.
- Preprocesado y decodificación de polígonos en host: el modelo no es autónomo de extremo a extremo.
- Idiomas no declarados: aunque la detección de regiones suele ser independiente del idioma, no se documenta cobertura ni sesgos por script.
- Riesgo de alucinación no aplica (no es generativo), pero sí puede producir falsos positivos/negativos en regiones de texto.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse las licencias de terceros incluidas en `THIRD_PARTY_LICENSES.txt` y las condiciones de QAIRT/TFLite.
- Repositorio con pocas descargas (38) y sin likes: madurez y soporte comunitario limitados.
- Fecha de creación indicada como 2026-11-10 (posterior a la fecha habitual de referencia); conviene verificar la integridad de los artefactos con `SHA256SUMS`.

## Enlaces

- Hugging Face: https://huggingface.co/anan19990108/pp-ocrv6-medium-det-640-htp
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx
- Checkpoint upstream (revisión fijada): https://huggingface.co/PaddlePaddle/PP-OCRv6_medium_det_onnx/blob/61323801669c338b7891481ec7bac61ce31b576a/inference.onnx
- Resultados completos: https://huggingface.co/anan19990108/pp-ocrv6-medium-det-640-htp/blob/095d85f5888884c2522c527f45d9f811b1255c93/evaluation/results.json
- README detallado: https://huggingface.co/anan19990108/pp-ocrv6-medium-det-640-htp/blob/095d85f5888884c2522c527f45d9f811b1255c93/README.md
