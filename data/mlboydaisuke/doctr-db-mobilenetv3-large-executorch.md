# mlboydaisuke/docTR-DB-MobileNetV3-Large-ExecuTorch

## Resumen

Modelo de detección de texto en imágenes, resultado de la conversión del módulo `db_mobilenet_v3_large` de la librería docTR (Mindee) al formato ExecuTorch (.pte). Desarrollado por mlboydaisuke, resuelve la localización de palabras en imágenes sobre dispositivos móviles y edge, complementando al modelo de reconocimiento CRNN-MobileNetV3-Small (la parte de lectura). Usa arquitectura Differentiable Binarization (DB) con backbone MobileNetV3-Large, 4,2 millones de parámetros, entrada de 1024×1024 píxeles y salida de mapa de probabilidades por píxel. Relevante por permitir inferencia on-device con delegación completa a backends XNNPACK y Core ML, con latencias de 46,9 ms y 13,1 ms respectivamente frente a 309 ms en modo eager.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Differentiable Binarization (DB) con backbone MobileNetV3-Large |
| Parámetros totales | 4,2 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | fp32 (XNNPACK y Core ML); int8 y fp16 evaluados pero no publicados |
| Idiomas soportados | No disponible (detección de texto independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura es de detección de texto basada en Differentiable Binarization (DB), tal como se implementa en la librería docTR de Mindee. El backbone es MobileNetV3-Large, una red convolucional eficiente diseñada para dispositivos móviles. La entrada es un tensor `[1, 3, 1024, 1024]` normalizado con la media (0.798, 0.785, 0.772) y desviación típica (0.264, 0.2749, 0.287) propias de docTR, no las de ImageNet. La salida es un mapa de probabilidades `[1, 1, 1024, 1024]` donde cada píxel indica la probabilidad de pertenecer a una palabra.

El entrenamiento original se realizó con el pipeline de docTR; el modelo exportado lleva un flag `exportable` que omite el post-procesado en numpy (que `torch.export` rechaza) y devuelve logits crudos, sobre los que el wrapper aplica la sigmoide. El desencogido de polígonos (post-processor de docTR) queda fuera del modelo exportado y debe ser ejecutado por el llamante.

## Capacidades

- Detección de texto en imágenes: localiza palabras y regiones de texto mediante mapa de probabilidades por píxel.
- Inferencia on-device: ejecutable en dispositivos móviles y edge mediante ExecuTorch con backends XNNPACK y Core ML.
- Delegación completa: el 100% de las operaciones (224/224) se delegan en un único subgrafo.
- Salida de mapa de probabilidades que puede umbralizarse para obtener cajas (requiere post-procesado externo).
- Compatibilidad con el modelo de reconocimiento CRNN-MobileNetV3-Small (de la misma serie) para completar un pipeline de OCR completo.
- Formato de pesos `.pte` portable y optimizado para despliegue móvil.

## Casos de uso

- OCR de documentos en móvil: el modelo detecta regiones de texto en fotografías de documentos, que luego el CRNN lee; ideal para apps de escaneo de recibos o tarjetas de visita.
- Traducción de carteles en tiempo real: la detección localiza palabras en imágenes capturadas con la cámara del teléfono, permitiendo superponer traducciones sobre el texto original.
- Accesibilidad para personas con discapacidad visual: el detector identifica texto en el entorno y lo convierte en audio mediante síntesis de voz.
- Automatización de formularios: detección de campos de texto en formularios escaneados para su posterior extracción y validación.
- Búsqueda visual en imágenes: indexación de fotografías y capturas de pantalla localizando el texto presente.
- Verificación de calidad de documentos: detección de texto en imágenes de control para asegurar que los documentos contienen las zonas de texto esperadas.

## Benchmarks y rendimiento

La model card proporciona resultados de verificación en Mac arm64 (2026-08-23) con entrada `[1, 3, 1024, 1024]`:

| Backend | Tamaño del archivo | Latencia | Correlación (worst) |
|---|---|---|---|
| XNNPACK fp32 | 16.1 MB | 46.9 ms | 1.000000 |
| Core ML fp32 | 8.6 MB | 13.1 ms | 0.999714 |
| Eager fp32 | — | 309 ms | — |

La correlación se mide contra el modelo eager sobre entrada aleatoria. La delegación es del 100% (224/224 ops, un subgrafo). No se han publicado resultados de benchmarks estándar de detección (como mAP o IoU) en la información disponible.

## Requisitos de hardware

- Verificado en Mac arm64 (Apple Silicon); no se especifican GPUs concretas.
- El formato `.pte` de ExecuTorch está diseñado para dispositivos móviles y edge (iOS, Android, wearables).
- Tamaño del archivo: 16.1 MB (XNNPACK fp32) o 8.6 MB (Core ML fp32), apto para móviles con espacio reducido.
- La variante int8 (4.3 MB) no se publica por baja correlación (0.627).
- Despliegue: ExecuTorch runtime con backends XNNPACK o Core ML; no se mencionan vLLM, Ollama ni TGI (no aplica a modelos de visión).
- Latencia: 13.1 ms en Core ML, 46.9 ms en XNNPACK (Mac arm64), lo que permite procesamiento en tiempo real en dispositivos móviles.

## Comparativa con modelos similares

La comparación directa con otros detectores de texto (CRAFT, EAST, PaddleOCR DB) no está disponible en la información proporcionada. La comparación válida es el mismo modelo en distintos runtimes:

| Modelo | Formato | Tamaño | Latencia | Correlación |
|---|---|---|---|---|
| docTR DB-MobileNetV3-Large (eager) | PyTorch | — | 309 ms | 1.0 (referencia) |
| docTR DB-MobileNetV3-Large (XNNPACK) | .pte | 16.1 MB | 46.9 ms | 1.000000 |
| docTR DB-MobileNetV3-Large (Core ML) | .pte | 8.6 MB | 13.1 ms | 0.999714 |

El modelo se complementa con el reconocedor CRNN-MobileNetV3-Small (también en ExecuTorch) para completar un pipeline de OCR end-to-end.

## Limitaciones y advertencias

- El post-procesado (desaparición de polígonos y umbralizado) queda fuera del modelo exportado; el llamador debe implementarlo.
- Problema conocido de transposición: `np.transpose` deja el array en orden HWC con strides permutados; ExecuTorch lee en orden de memoria, no por strides. Se requiere `np.ascontiguousarray` antes de generar el `.pte`, o el mapa de probabilidades puede umbralizarse a cero cajas en imágenes reales.
- La variante int8 no se publica por baja correlación (0.627), lo que limita la reducción de tamaño para despliegue en dispositivos con memoria muy restringida.
- La variante fp16 no ofrece reducción de tamaño (16.1 MB igual que fp32) porque las convoluciones ya se ejecutan en fp32 en XNNPACK.
- El modelo se verifica solo en Mac arm64; no se proporcionan resultados en Android ni en otras arquitecturas.
- Riesgo de alucinación en la lectura de texto: la verificación end-to-end muestra que el detector localiza cajas pero el reconocedor (CRNN) puede producir lecturas aproximadas o erróneas (por ejemplo, "PIZZA EXPRESS" leído como "TIUZABXPRESS").
- No se especifican sesgos conocidos, pero el modelo se entrenó con datos de docTR que pueden tener sesgos geográficos o de estilo de texto.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/mlboydaisuke/docTR-DB-MobileNetV3-Large-ExecuTorch
- Modelo complementario de reconocimiento: https://huggingface.co/mlboydaisuke/docTR-CRNN-MobileNetV3-Small-ExecuTorch
- Repositorio de docTR (Mindee): https://github.com/mindee/doctr
- Scripts de conversión: https://github.com/john-rocky/executorch-models
- Repositorio de ExecuTorch (PyTorch): https://github.com/pytorch/executorch
