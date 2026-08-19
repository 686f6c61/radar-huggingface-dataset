# latolukasz/sam2.1-hq-hiera-large-onnx

## Resumen

El modelo `latolukasz/sam2.1-hq-hiera-large-onnx` es una exportación al formato ONNX del decodificador de **HQ-SAM 2**, una variante del Segment Anything Model 2.1 (SAM 2.1) desarrollada por el grupo SysCV. El checkpoint base, `sam2.1_hq_hiera_large`, añade un token de salida de alta calidad (HQ) entrenable y un mecanismo de fusión de características global-local al decodificador estándar de SAM 2.1, permitiendo segmentar estructuras finas como bordes delgados o patas de insectos con mayor precisión que el modelo original.

Esta ficha se centra exclusivamente en el **decodificador ONNX** (`decoder_hq.onnx`, 17 MB), que es la pieza servible para inferencia. El autor ha omitido deliberadamente el encoder de imagen, ya que es el mismo encoder congelado de SAM 2.1 Hiera Large, cuyos resultados ONNX son bit-idénticos (diferencia máxima absoluta de 0.0) a los del repositorio `latolukasz/sam2.1-hiera-large-onnx`. Por tanto, para usar este decodificador es necesario emparejarlo con dicho encoder.

La relevancia actual de este modelo radica en su capacidad para integrarse en pipelines de segmentación de alta precisión en producción, utilizando ONNX Runtime. Al ser un componente ligero (17 MB) y con licencia Apache 2.0, permite sustituir de forma directa (drop-in swap) al decodificador base de SAM 2.1 en aplicaciones existentes, mejorando la calidad de los bordes sin necesidad de reentrenar el encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder Hiera Large congelado + decodificador MaskDecoderHQ con token HQ) |
| Parametros totales | 224,7 millones (checkpoint completo `sam2.1_hq_hiera_large`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; el embedding del encoder es `[1,256,64,64]` y las máscaras de salida son `[n,3,256,256]`) |
| Tipos de cuantizacion | No disponible (exportado con torch 2.13 y opset 18, formato FP32 presumiblemente, no especificado) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (solo decodificador, `decoder_hq.onnx` de 17 MB) |

## Arquitectura y entrenamiento

La arquitectura de HQ-SAM 2 se compone de un encoder de imagen **Hiera Large** congelado, idéntico al de SAM 2.1, y un decodificador modificado denominado `MaskDecoderHQ`. La innovación principal es la incorporación de un token de salida de alta calidad (HQ) entrenable, junto con un mecanismo de fusión de características global-local que combina las características de alta resolución del encoder con las de baja resolución para refinar los bordes. El checkpoint `sam2.1_hq_hiera_large.pt` fue entrenado sobre el dataset **HQSeg-44K**, especializado en estructuras finas.

La exportación ONNX replica el camino multimask de `MaskDecoderHQ.forward`. Específicamente, el decodificador genera 5 máscaras candidatas `[single, m1, m2, m3, hq]`, y la salida final se compone como `masks[4:5] + masks[1:4]`, es decir, la máscara HQ residual sumada a las tres máscaras multimask de SAM. Las predicciones de IoU corresponden a `iou_pred[1:]`. La interfaz del decodificador es la siguiente: entradas `image_embed` `[1,256,64,64]`, `high_res_feats_0` `[1,32,256,256]`, `high_res_feats_1` `[1,64,128,128]`, `point_coords` `[n,p,2]`, `point_labels` `[n,p]` (float32), `mask_input` `[n,1,256,256]` y `has_mask_input` `[n]`. Las salidas son `masks` `[n,3,256,256]` (logits limitados a ±32) e `iou_predictions` `[n,3]`. Esta interfaz es idéntica a la de los decodificadores base-plus y large de SAM 2.1, lo que garantiza la compatibilidad directa.

## Capacidades

- Segmentación de imágenes mediante prompts de puntos y cajas (bounding boxes).
- Generación de tres máscaras candidatas por prompt, más la máscara residual de alta calidad (HQ) añadida a cada una.
- Especialización en segmentación de estructuras finas y bordes complejos (patas de insectos, antenas, pelos, vasos sanguíneos).
- Salida de logits de máscara (rango ±32) y predicción de IoU para filtrar la mejor candidata.
- Inferencia exclusivamente en servidor mediante ONNX Runtime, sin dependencias de PyTorch.
- No soporta prompts de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo de visión puro.

## Casos de uso

- **Segmentación de imágenes médicas de precisión**: el modelo puede delinear bordes celulares, vasos sanguíneos o estructuras anatómicas finas en tomografías o histologías, donde el decodificador estándar de SAM 2.1 tiende a perder detalle. Se integraría en un pipeline de ONNX Runtime con el encoder de SAM 2.1 Hiera Large.
- **Edición fotográfica y recorte de objetos complejos**: para recortar elementos con bordes difíciles como pelo, plumas o antenas de insectos en herramientas de retoque, utilizando prompts de caja o punto para guiar la segmentación.
- **Agricultura de precisión y monitorización de plagas**: permite contar y segmentar insectos individuales en imágenes de campo, incluso cuando las patas o alas son extremadamente delgadas, mejorando la fiabilidad de los sistemas de alerta temprana.
- **Generación de datasets de segmentación (auto-labeling)**: al ofrecer máscaras de mayor calidad que SAM 2.1 base, es adecuado para crear anotaciones automáticas de alta fidelidad que luego se usan para entrenar otros modelos, reduciendo la revisión manual.
- **Post-procesado en pipelines de visión industrial**: en entornos de control de calidad, donde se necesitan máscaras precisas de defectos o grietas finas en superficies, el decodificador HQ puede sustituir al decodificador estándar sin cambios en el código gracias a su interfaz drop-in.
- **Integración en aplicaciones de realidad aumentada**: para segmentar objetos con contornos complejos en tiempo real en dispositivos con ONNX Runtime, aprovechando la baja latencia del decodificador de 17 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no proporciona métricas numéricas (como mIoU o Boundary IoU) comparativas contra SAM 2.1 base. Se menciona el entrenamiento en HQSeg-44K, pero no se ofrecen cifras concretas de rendimiento en dicha validación.

## Requisitos de hardware

- **Decodificador ONNX**: el archivo `decoder_hq.onnx` pesa solo 17 MB. Su inferencia es trivial en cualquier GPU moderna e incluso ejecutable en CPU con ONNX Runtime, con una latencia de milisegundos. Los requisitos de VRAM para el decodificador son despreciables (menos de 1 GB).
- **Encoder necesario**: para una inferencia completa se requiere el encoder de SAM 2.1 Hiera Large (disponible en `latolukasz/sam2.1-hiera-large-onnx`). Los requisitos de VRAM de este encoder no se detallan en la información proporcionada, pero al ser un modelo de 224,7 millones de parámetros, se estima que necesita al menos 4-6 GB en FP16 para procesar imágenes de alta resolución.
- **GPUs recomendadas**: para el encoder, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A10). Para el decodificador, cualquier GPU con soporte CUDA o incluso CPU es suficiente.
- **Opciones de despliegue**: ONNX Runtime (CPU y GPU), TensorRT, o cualquier runtime compatible con ONNX. No es adecuado para vLLM ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible en la información proporcionada, pero al ser un decodificador puro sin autoregresión, la latencia por prompt es del orden de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especialidad | Licencia |
|---|---|---|---|---|
| **HQ-SAM 2 (este modelo)** | 224,7 M (checkpoint completo) | ONNX (decoder) | Segmentación de alta calidad (bordes finos) | Apache 2.0 |
| **SAM 2.1 Hiera Large (decoder base)** | 224,7 M (aprox.) | ONNX (decoder) | Segmentación general | Apache 2.0 |
| **SAM (ViT-H)** | ~636 M | PyTorch | Segmentación general | Apache 2.0 |

La comparativa se centra en el decodificador. El decodificador HQ-SAM 2 ofrece una mejora cualitativa en estructuras finas respecto al decodificador base de SAM 2.1, manteniendo la misma interfaz y el mismo encoder. SAM original (ViT-H) es significativamente más grande y no dispone de la optimización para bordes finos, aunque sigue siendo una alternativa válida para tareas generales. La disponibilidad en ONNX de este modelo facilita su integración en entornos de producción sin dependencias de PyTorch, algo que no ocurre con el SAM original.

## Limitaciones y advertencias

- **Dependencia externa**: este repositorio contiene únicamente el decodificador. Es imprescindible descargar el encoder de `latolukasz/sam2.1-hiera-large-onnx` para realizar cualquier inferencia, lo que añade un paso adicional en el despliegue.
- **Solo prompts de puntos y cajas**: no admite prompts de texto ni máscaras de entrada arbitrarias más allá del `mask_input` estándar, limitando su uso en aplicaciones que requieran interacción multimodal.
- **Sesgos del dataset de entrenamiento**: al estar entrenado en HQSeg-44K, el modelo puede mostrar un rendimiento subóptimo en dominios muy diferentes a los de ese dataset (por ejemplo, imágenes satelitales o radiografías con patrones inusuales).
- **Riesgo de alucinación geométrica**: aunque mejora los bordes, en imágenes con ruido extremo o texturas repetitivas puede generar máscaras falsamente detalladas.
- **Salida en logits**: las máscaras de salida son logits (rango ±32) que requieren post-procesado (aplicar sigmoide y umbral) antes de su uso en aplicaciones finales.
- **Fecha de creación futura**: la metadata indica una fecha de creación de 2026-08-14, lo que sugiere que es un artefacto reciente y posiblemente sin validación comunitaria (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace del modelo: [latolukasz/sam2.1-hq-hiera-large-onnx](https://huggingface.co/latolukasz/sam2.1-hq-hiera-large-onnx)
- Encoder necesario (SAM 2.1 Hiera Large ONNX): [latolukasz/sam2.1-hiera-large-onnx](https://huggingface.co/latolukasz/sam2.1-hiera-large-onnx)
- Checkpoint original de HQ-SAM 2: [lkeab/hq-sam](https://huggingface.co/lkeab/hq-sam)
- Código fuente de SysCV (SAM-HQ): [SysCV/sam-hq](https://github.com/SysCV/sam-hq)
- Herramienta de exportación adaptada (samexporter): [vietanhdev/samexporter](https://github.com/vietanhdev/samexporter)
