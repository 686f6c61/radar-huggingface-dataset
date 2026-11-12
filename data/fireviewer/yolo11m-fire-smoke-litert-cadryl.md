# fireviewer/yolo11m-fire-smoke-litert-cadryl

## Resumen

FireViewer · YOLO11M · Cadryl LiteRT es una conversión a TensorFlow Lite (LiteRT) del checkpoint final del detector de incendios y humo `fireviewer/yolo11m-fire-smoke`, empaquetada con un contrato de integración específico para la aplicación Cadryl. El modelo resuelve la detección de objetos de dos clases (`fire` y `smoke`) en imágenes RGB de 928 × 928 píxeles, y su rasgo diferencial es que expone las seis proyecciones 1×1 finales de las cabezas de clasificación y regresión DFL como parámetros entrenables en el propio dispositivo, sin necesidad de reentrenar el backbone.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco habitual de *on-device training* parcial sobre un detector YOLO11M convertido a TFLite, con firmas explícitas de inferencia, entrenamiento, guardado y restauración. Por otro, fija con precisión el contrato de preprocesado y postprocesado (letterbox, formato de salida `[1, 6, 17661]`, ausencia de NMS integrado), lo que permite reproducir la inferencia fuera de la aplicación original.

El autor declara que la conversión se validó comparando PyTorch, TensorFlow y LiteRT sobre cuatro imágenes reales, con una discrepancia máxima de 0,013031 píxeles en coordenadas y 0,00000426 en puntuaciones. No se publican métricas de precisión (mAP, recall) en la información disponible, y el propio autor advierte de que los controles ejecutados validan la conversión y el mecanismo de aprendizaje, no la calidad del detector.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11M (detector de objetos de una etapa), convertido a TensorFlow Lite / LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 928 × 928 px) |
| Tipos de cuantizacion | Float32 (única conversión publicada) |
| Idiomas soportados | no aplica (detección visual; sin capacidades de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `model.tflite` (TensorFlow Lite / LiteRT); checkpoint PyTorch original en el repositorio base |
| Clases | 0 = `fire`, 1 = `smoke` |
| Entrada | RGB 928 × 928, letterbox centrado, relleno 114, valores normalizados a [0, 1] |
| Salida | `predictions` `[1, 6, 17661]`: cx, cy, ancho, alto en píxeles + score `fire` + score `smoke` |
| Postprocesado | Sin objectness ni NMS integrado; el umbral y el NMS los aplica la aplicación (Cadryl) |
| Firmas exportadas | `infer(x)`, `train(x, y, learning_rate)`, `save(checkpoint_path)`, `restore(checkpoint_path)`, `head_state(probe)` |
| Runtime objetivo | LiteRT Interpreter 1.4.2 + Select TF Ops 2.16.1 (delegado Flex para save/restore) |
| Version de TensorFlow usada en conversion | 2.16.1 (verificado en Colab) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un YOLO11M, detector de objetos de una etapa con backbone, neck y cabezas de detección. La conversión preserva la topología y los pesos del checkpoint final `best.pt` del repositorio `fireviewer/yolo11m-fire-smoke` (revisión `ecf4ca351b5dbd4ab84a92c0402e6f45f8001de9`, SHA-256 `a820dd96a3088e8666da88219f11fabf8468d601fb558f1cedce49dfcfac822f`), y añade un contrato de entrenamiento parcial en dispositivo: solo las seis proyecciones 1×1 finales (una pareja de clasificación y regresión DFL por escala) son entrenables; backbone, neck y capas intermedias de las cabezas permanecen congelados. No se añade ninguna capa de calibración adicional.

El corpus de referencia es `fireviewer/fireviewer_fire_smoke_flame_v3_native`. El autor no detalla el número de tokens ni la composición completa del dataset en la información disponible, más allá de las dos clases (`fire`, `smoke`) y de que el entrenamiento original de Ultralytics usó una pérdida CIoU. La adaptación en dispositivo emplea un esquema distinto: emparejamiento top-10, pérdida BCE + GIoU + DFL con coeficientes 0,5 / 7,5 / 1,5, optimizador SGD sin estado de momentum y recorte de gradientes a norma global 5. Las cajas de entrenamiento se pasan como `[1, 128, 6]` (xmin, ymin, xmax, ymax normalizados en la entrada letterbox, índice de clase y máscara 0/1), con relleno explícito y rechazo —no truncado silencioso— si se superan las 128 cajas.

La innovación técnica destacable no está en la arquitectura, sino en el mecanismo de adaptación: permite ajustar las cabezas de detección en el dispositivo Android con un coste computacional bajo y sin salir del runtime LiteRT, manteniendo la fidelidad numérica respecto al modelo PyTorch original. El autor documenta cuatro actualizaciones sobre una imagen de entrenamiento con una reducción de pérdida de 3,806161 a 3,805722 y verifica que los parámetros se modifican efectivamente.

## Capacidades

- Detección de objetos de dos clases: `fire` (llama) y `smoke` (humo) en imágenes RGB.
- Inferencia sobre entrada fija de 928 × 928 px con letterbox centrado y relleno 114.
- Salida en coordenadas de píxel (cx, cy, ancho, alto) más dos puntuaciones independientes, una por clase.
- Adaptación en dispositivo de las seis proyecciones finales de las cabezas mediante la firma `train(x, y, learning_rate)`.
- Persistencia del estado adaptado mediante `save(checkpoint_path)` y `restore(checkpoint_path)`, con delegado Flex.
- Introspección limitada de parámetros de salida mediante `head_state(probe)`; el autor aclara que no mide entrenamiento del backbone.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye NMS ni umbralización internos; el consumidor debe aplicarlos.

## Casos de uso

- Detección temprana de incendios en cámaras fijas: el modelo procesa fotogramas RGB de 928 × 928 y devuelve cajas con puntuaciones de `fire` y `smoke`, adecuado para vigilancia forestal o industrial donde se requiere ejecución local sin enviar vídeo a la nube.
- Vigilancia en dispositivos Android sin conectividad: al ser un `.tflite` Float32 con runtime LiteRT, puede ejecutarse en teléfonos y tablets de campo, útil en zonas rurales con cobertura intermitente.
- Adaptación a dominios locales en el propio dispositivo: la firma `train` permite ajustar las cabezas con imágenes etiquetadas del entorno concreto (por ejemplo, un tipo de vegetación o una iluminación específica) sin reentrenar el backbone ni disponer de GPU.
- Filtrado previo en pipelines de videovigilancia: al no incluir NMS, el sistema anfitrión puede aplicar su propio umbral y supresión para integrar el detector en un pipeline existente con lógica de alertas ya definida.
- Análisis forense o revisión de grabaciones: procesamiento por lotes de imágenes para localizar segmentos con presencia de humo o llama antes de una revisión manual.
- Prototipado e investigación en detección de fuego: la licencia AGPL-3.0 y la disponibilidad del checkpoint PyTorch original permiten reproducir la conversión y comparar motores (PyTorch, TensorFlow, LiteRT) con la misma entrada.
- Integración en aplicaciones de realidad aumentada o asistentes de campo: el contrato JSON (`android_model_config.json`) define preprocesado, clases y firmas, lo que facilita el consumo desde una app Android nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, recall, precisión por clase) en la información disponible. El autor incluye únicamente controles de equivalencia numérica entre motores, que se recogen a continuación:

| Control | Resultado |
|---|---|
| Comparación PyTorch vs LiteRT (4 imágenes reales) | Discrepancia máxima absoluta de 0,013031 px en coordenadas |
| Comparación PyTorch vs LiteRT (puntuaciones) | Discrepancia máxima absoluta de 0,00000426 |
| Actualización en dispositivo (4 pasos, 1 imagen) | Pérdida 3,806161 → 3,805722 |
| Save / restore / reapertura | Correcto; salidas comparadas con atol 1e-5 y rtol 1e-5 |

El autor advierte explícitamente de que estos controles validan la conversión y el mecanismo de aprendizaje, no la precisión del detector. Tampoco se han medido latencia, memoria ni consumo de batería en dispositivo Android: quedan pendientes de cualificar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo se distribuye como `.tflite` Float32 de 0,1 GB de repositorio, pensado para ejecución en CPU/GPU móvil mediante LiteRT, no para GPU de escritorio.
- GPU recomendadas: no aplica en el entorno objetivo (Android). Para reproducir la conversión o la comparación con PyTorch se requiere una GPU compatible con TensorFlow 2.16.1; el autor verificó el proceso en Google Colab.
- ¿Cabe en GPU de consumo? El checkpoint PyTorch original (YOLO11M) sí es ejecutable en GPUs de consumo tipo RTX 4090, pero la información proporcionada no incluye requisitos de VRAM concretos.
- Opciones de despliegue: LiteRT Interpreter 1.4.2 con Select TF Ops 2.16.1 y delegado Flex (necesario para `save`/`restore`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor indica que memoria, latencia, batería y calidad tras la adaptación deben cualificarse en dispositivo Android.
- Equivalencia de muestreo: la comparación entre motores usó el mismo redimensionado PIL; la equivalencia del muestreo Bitmap de Android está pendiente de verificar en dispositivo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Clases | Licencia | Formato |
|---|---|---|---|---|---|---|
| fireviewer/yolo11m-fire-smoke-litert-cadryl | YOLO11M → LiteRT | no disponible | 928 × 928 | fire, smoke | AGPL-3.0 | TFLite Float32 |
| fireviewer/yolo11m-fire-smoke (modelo base) | YOLO11M (PyTorch) | no disponible | no disponible en esta ficha | fire, smoke | no disponible en esta ficha | PyTorch (`best.pt`) |
| YOLO11M estándar (Ultralytics) | YOLO11M | no disponible en esta ficha | configurable | 80 clases COCO | AGPL-3.0 | PyTorch, ONNX, TFLite, etc. |

La comparación se limita al linaje directo del modelo, ya que la información proporcionada no incluye otros detectores especializados en fuego y humo con los que contrastar parámetros, contexto o rendimiento. No se dispone de métricas de precisión comparables para ninguno de los tres.

## Limitaciones y advertencias

- No se han publicado métricas de precisión del detector (mAP, recall, falsos positivos) en la información disponible; los únicos controles documentados son de equivalencia numérica entre motores.
- El modelo distribuido conserva los pesos iniciales del checkpoint final: las actualizaciones de la receta de entrenamiento en dispositivo no están incorporadas al archivo.
- Solo son entrenables las seis proyecciones 1×1 finales; el backbone y el neck permanecen congelados, lo que limita la capacidad de adaptación a dominios muy distintos del corpus original.
- El límite de 128 cajas de entrenamiento es estricto: superarlo debe rechazarse, nunca truncarse, lo que exige validación en el lado de la aplicación.
- No incluye NMS ni umbralización: un consumidor que no los aplique obtendrá salidas sin filtrar.
- La equivalencia del muestreo Bitmap de Android respecto al redimensionado PIL usado en la comparación está pendiente de verificar en dispositivo.
- Latencia, memoria, consumo de batería y calidad tras la adaptación no han sido cualificados en hardware Android real.
- El autor advierte de que las dos clases de contexto (`fire`, `smoke`) no deben presentarse como una escala numérica de peligro.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte sobre obras derivadas distribuidas o expuestas por red; es un caveat relevante para uso comercial en productos propietarios.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un detector visual, el riesgo equivalente es de falsos positivos y falsos negativos, sin datos publicados al respecto.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fireviewer/yolo11m-fire-smoke-litert-cadryl
- Modelo base: https://huggingface.co/fireviewer/yolo11m-fire-smoke
- Checkpoint PyTorch original: https://huggingface.co/fireviewer/yolo11m-fire-smoke/blob/ecf4ca351b5dbd4ab84a92c0402e6f45f8001de9/best.pt
- Dataset de referencia: https://huggingface.co/datasets/fireviewer/fireviewer_fire_smoke_flame_v3_native
- Ultralytics YOLO11 (arquitectura base): https://github.com/ultralytics/ultralytics
- LiteRT (antes TensorFlow Lite): https://ai.google.dev/edge/litert
- TensorFlow 2.16.1: https://www.tensorflow.org/versions/r2.16/api_docs
