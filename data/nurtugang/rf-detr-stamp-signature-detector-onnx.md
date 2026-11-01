# Nurtugang/rf-detr-stamp-signature-detector-onnx

## Resumen

RF-DETR stamp and signature detector (ONNX) es una exportación a formato ONNX del checkpoint `bluecopa/rf-detr-stamp-signature-detector`, un modelo de detección de objetos basado en la arquitectura RF-DETR (Real-Time Detection Transformer). El autor de la exportación es el usuario de HuggingFace Nurtugang, mientras que el modelo original pertenece a bluecopa. El modelo está especializado en localizar dos tipos de elementos sobre documentos escaneados: sellos (stamps) y firmas (signatures), además de detectar casillas de verificación (checkboxes) de forma no documentada.

La relevancia de esta versión concreta reside en su formato: al estar exportada a ONNX, puede ejecutarse con el runtime de ONNX Runtime en entornos sin PyTorch, lo que facilita el despliegue en producción sobre CPU, GPU o incluso dispositivos con aceleradores específicos. Se ofrecen dos variantes de precisión (fp32 de 108 MB y fp16 de 55 MB) y el autor reporta que las detecciones de ambas coinciden con el checkpoint original en PyTorch dentro de 0,02 de confianza sobre 40 documentos reales.

El modelo no es un modelo de lenguaje: es un detector de objetos puro con una entrada de imagen fija de 560×560 píxeles y una salida de hasta 300 cajas delimitadoras con logits de clase. No dispone de capacidades generativas, de razonamiento ni multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 560×560 px) |
| Tipos de cuantizacion | fp32 (108 MB) y fp16 (55 MB, con entradas y salidas en float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR, un detector de objetos basado en transformer (DETR-like) orientado a inferencia en tiempo real. El modelo original fue entrenado por bluecopa para la detección de sellos y firmas en documentos; esta ficha corresponde únicamente a la exportación ONNX, realizada con la herramienta `rfdetr`. No se dispone de información sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino supervisado adicionales más allá del entrenamiento del checkpoint original.

La innovación técnica destacable de esta versión es la propia exportación: se mantienen los pesos sin cambios y se documenta con precisión el preprocesado requerido (redimensionado bilineal a 560×560 sin antialiasing mediante `cv2.INTER_LINEAR`, escalado a 0–1 y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`). La salida se compone de `dets` (`[batch, 300, 4]`, cajas normalizadas en formato `cx, cy, w, h`) y `labels` (`[batch, 300, 5]`, logits de clase a los que hay que aplicar sigmoid). El autor advierte de una discrepancia entre el `config.json` del checkpoint (stamp=0, signature=1) y los identificadores que emite realmente la cabeza: stamp=1, signature=0 y 4 (la misma caja bajo ambos ids) y checkboxes=2 y 3.

## Capacidades

- Detección de sellos (stamps) en documentos escaneados.
- Detección de firmas (signatures) en documentos escaneados.
- Detección no documentada de casillas de verificación (checkboxes), con ids 2 y 3.
- Salida de hasta 300 cajas delimitadoras por imagen con logits de clase.
- Ejecución mediante ONNX Runtime sin dependencia de PyTorch.
- Procesamiento por lotes (`batch` dinámico en la primera dimensión).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de generación de texto, de visión general ni de audio.

## Casos de uso

- Digitalización de contratos y escrituras: el modelo localiza sellos y firmas sobre páginas escaneadas para verificar que un documento está firmado y sellado antes de archivarlo o indexarlo, sin necesidad de PyTorch en el servidor de digitalización.
- Automatización de KYC y onboarding: en la validación de formularios y solicitudes firmadas, el detector permite recortar las regiones de firma y sello para su posterior verificación biométrica o de autenticidad, con la ventaja de que el formato ONNX se integra en servicios ligeros.
- Gestión documental y archivo: clasificación y extracción de metadatos (presencia de sello, posición de la firma) en lotes masivos de PDFs escaneados, aprovechando el tamaño reducido del modelo fp16 (55 MB) para despliegues en contenedores pequeños.
- Procesamiento en el borde (edge): al ejecutarse con ONNX Runtime, puede desplegarse en escáneres inteligentes o dispositivos con CPU/GPU integrada para marcar documentos firmados en el momento de la captura, sin enviar imágenes a la nube.
- Verificación de cumplimiento normativo: detección de sellos oficiales en facturas, certificados o documentos regulatorios para pipelines de auditoría que comprueban la presencia y ubicación de sellos institucionales.
- Preprocesado para OCR: el detector aísla las regiones de sello y firma para excluirlas del OCR de texto o para tratarlas con modelos especializados, reduciendo falsos positivos en la extracción de texto de documentos administrativos.

## Benchmarks y rendimiento

El autor reporta una validación de equivalencia: sobre 40 documentos reales, las detecciones de `model.onnx` y `model_fp16.onnx` coincidieron con el checkpoint original en PyTorch dentro de 0,02 de confianza. No se han publicado resultados de benchmarks estándar (mAP, COCO, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| Equivalencia con PyTorch (40 documentos) | diferencia de confianza < 0,02 |
| mAP / precisión / recall | no disponible |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo fp32 ocupa 108 MB y el fp16 55 MB; con activaciones y buffers de inferencia, el consumo de VRAM es del orden de unos pocos cientos de MB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA EP), como NVIDIA T4, A100, H100 o RTX 4090; el modelo es lo bastante pequeño como para no requerir GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), con posibilidad de integración en servicios Python, C++, C# o Java. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nurtugang/rf-detr-stamp-signature-detector-onnx | RF-DETR (ONNX) | 560×560 px | Apache 2.0 | ONNX | HuggingFace |
| bluecopa/rf-detr-stamp-signature-detector | RF-DETR (PyTorch) | 560×560 px | no disponible | PyTorch | HuggingFace |
| Detectores DETR genéricos (p. ej. RT-DETR, DETR) | Transformer | variable | variable | PyTorch/ONNX | HuggingFace / repos oficiales |

No se dispone de datos de rendimiento comparativo (mAP, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Discrepancia documentada entre el `config.json` (stamp=0, signature=1) y los ids reales de salida (stamp=1, signature=0 y 4, checkboxes=2 y 3); es imprescindible mapear los ids según la tabla del autor y no según el config.
- El preprocesado es estricto: usar `cv2.INTER_LINEAR` sin antialiasing; el resize de PIL produce resultados distintos.
- La validación de equivalencia se realizó sobre solo 40 documentos, una muestra reducida; no hay garantías formales de comportamiento en dominios distintos (idiomas, layouts, calidades de escaneo).
- Riesgo de falsos positivos y negativos en documentos con sellos o firmas atípicos, degradados o parcialmente ocluidos; no se documentan métricas de precisión/recall.
- La detección de checkboxes no está documentada oficialmente por el autor del modelo base y debe tratarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `bluecopa/rf-detr-stamp-signature-detector`, cuya licencia no se especifica en la información disponible.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre su composición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nurtugang/rf-detr-stamp-signature-detector-onnx
- Modelo base: https://huggingface.co/bluecopa/rf-detr-stamp-signature-detector
- Herramienta de exportación `rfdetr`: no disponible en la información proporcionada
- Paper de RF-DETR: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
