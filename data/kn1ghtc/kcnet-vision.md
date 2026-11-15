# kn1ghtc/kcnet-vision

## Resumen

kcnet-vision es un repositorio de artefactos de visión por computador publicados por el usuario kn1ghtc bajo el paraguas del proyecto "kcnet". No se trata de un único modelo, sino de un pool heterogéneo de pesos entrenados o ajustados por el autor: un detector YOLO26n multitarea para visión robótica (37 clases a 416 px), una variante reducida de detección de EPI en construcción (5 clases), dos generadores StyleGAN2 para rostros anime (64 y 128 px) y tres decodificadores AdaIN de transferencia de estilo entrenados sobre COCO y WikiArt.

El núcleo operativo es el detector YOLO26n, exportado a ONNX fp32 para escritorio y a OpenVINO INT8 para placas tipo Raspberry, con un objetivo declarado de 25 FPS en INT8. El autor publica un registro completo de 16 ejecuciones de entrenamiento (`deploy_metrics.json`) con la métrica mAP50 de cada una, en lugar de citar solo el mejor resultado, lo que permite auditar qué runs fueron rechazados.

El modelo es relevante para quienes necesitan detección en tiempo real en hardware restringido sin dependencia de la nube, así como para experimentación con generación y estilización de imágenes a velocidad interactiva. La licencia es mixta: los pesos derivados de YOLO heredan AGPL-3.0 de Ultralytics, mientras que los modelos generativos fueron entrenados en el propio proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detección); StyleGAN2 (generación); AdaIN decoder (transferencia de estilo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (ONNX), INT8 (ONNX y OpenVINO) |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | other (mixta: AGPL-3.0 para pesos YOLO; pesos generativos propios) |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx), OpenVINO |

## Arquitectura y entrenamiento

El detector principal es un YOLO26n multitarea con entrada de 416x416 RGB y 37 clases del conjunto de etiquetas de visión robótica del autor. Se distribuye como checkpoint PyTorch (5,4 MB), exportación ONNX fp32 (9,7 MB) y variante ONNX INT8 (2,8 MB). El autor publica un ledger de 16 ejecuciones con valores de `legacy_map50` entre 0,656 y 0,928, marcando cada run como publicada o rechazada; el mejor resultado corresponde al run 13. Existe además una variante de detección de EPI en construcción con 5 clases a 416 px, entrenada con receta de aumento de datos agresiva, pensada como hermano más estrecho para validar el pipeline de extremo a extremo.

Los modelos generativos incluyen dos generadores StyleGAN2 para rostros anime (128 px y 64 px) y tres decodificadores AdaIN de transferencia de estilo entrenados con contenido de COCO y estilos de WikiArt, seleccionados por LPIPS en tres ejecuciones (400, 5.000 y 10.000 pasos). No se especifican detalles sobre el volumen de datos de entrenamiento, la composición exacta de los datasets ni si hubo etapas de RLHF o DPO (no aplicables en visión). La innovación destacable no es arquitectónica sino de transparencia metodológica: el autor publica el ledger completo de métricas y declara explícitamente la ausencia de FID o LPIPS medidos para los modelos generativos.

## Capacidades

- Detección de objetos en tiempo real a 416x416 con 37 clases de un conjunto robótico específico.
- Detección de equipos de protección individual (EPI) en entornos de construcción con 5 clases.
- Exportación a ONNX Runtime para escritorio y servidor.
- Exportación a OpenVINO INT8 para despliegue en placas tipo Raspberry.
- Generación de rostros anime con StyleGAN2 a 64 px y 128 px.
- Transferencia de estilo fotorrealista mediante decodificador AdaIN entrenado con objetivo perceptual LPIPS.
- Inferencia en dispositivo (on-device) sin ronda a la nube.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües no aplicables; documentación y etiquetas únicamente en inglés.

## Casos de uso

- Visión robótica embebida: el detector YOLO26n INT8 se ejecuta en una placa tipo Raspberry con objetivo de 25 FPS, adecuado para un robot móvil que necesita identificar objetos de su escena sin latencia de red.
- Detección de EPI en obra: la variante de 5 clases permite validar el pipeline de captura, preprocesado y detección antes de escalar al modelo multitarea, con una receta de aumento de datos pensada para condiciones variables de iluminación y ángulo.
- Baselines de detección en hardware restringido: el ledger de 16 runs y el manifiesto de exportación sirven como referencia auditable para comparar recetas de entrenamiento a 416 px en dispositivos de borde.
- Generación de avatares anime: los generadores StyleGAN2 de 128 px permiten sintetizar rostros estilizados para prototipos de aplicaciones de entretenimiento o demos interactivas.
- Estilización de fotos a velocidad interactiva: el decodificador AdaIN aplica estilos de WikiArt sobre contenido de COCO en un solo paso, adecuado para filtros de cámara o previsualización en tiempo real.
- Prototipado de pipelines de visión en escritorio: la exportación ONNX fp32 permite iterar en un portátil con ONNX Runtime antes de pasar a la versión INT8 calibrada para el dispositivo final.
- Investigación reproducible en métricas: el registro público de mAP50 por run facilita estudiar la varianza entre ejecuciones de entrenamiento y la selección de checkpoints sin cherry-picking.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| mAP50 (deploy, run 13) | 0,9283 | Detector YOLO26n multitarea, 37 clases, 416 px |
| mAP50 objetivo | 0,95 | No alcanzado; runs 15-17 regresaron |
| Rango `legacy_map50` (16 runs) | 0,656 - 0,928 | Ledger completo en `deploy_metrics.json` |
| AP escenario PPE | 0,710 | Objetivo 0,75 |
| AP escenario dígitos | 0,995 | — |
| FPS objetivo en Pi (INT8) | 25 | No verificado en la información disponible |
| FID / LPIPS (generativos) | no publicado | Selección visual, sin métrica medida |

No se han publicado resultados de benchmarks estándar (COCO mAP, FID, etc.) comparables con la literatura en la información disponible. El autor indica explícitamente que la entrada COCO del ledger es 0,0 para los runs no evaluados en COCO, no un fallo del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el detector ONNX fp32 (9,7 MB) requiere menos de 1 GB; la variante INT8 (2,8 MB) es aún más ligera. Los StyleGAN2 de 128 px (74,7 MB) y los decodificadores AdaIN (~42 MB) caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con soporte ONNX Runtime o CUDA es suficiente. Para el objetivo de 25 FPS en placa tipo Raspberry se usa OpenVINO INT8 sobre CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, e incluso en CPU para el detector INT8.
- Opciones de despliegue: ONNX Runtime (escritorio/servidor), OpenVINO (placa tipo Raspberry), Ultralytics trainer para el checkpoint PyTorch. No se mencionan vLLM, llama.cpp ni TGI (no aplicables).
- Latencia y throughput: el único dato declarado es el objetivo de 25 FPS en INT8 sobre placa tipo Raspberry; no se publican latencias medidas ni throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kcnet-vision (YOLO26n multitarea) | no disponible | 416x416 | 37 | 0,9283 (deploy) | AGPL-3.0 (derivado) | Hugging Face |
| YOLOv8n (Ultralytics) | no disponible en la información | 640x640 típico | 80 (COCO) | no disponible en la información | AGPL-3.0 | Hugging Face / Ultralytics |
| YOLO11n (Ultralytics) | no disponible en la información | 640x640 típico | 80 (COCO) | no disponible en la información | AGPL-3.0 | Hugging Face / Ultralytics |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación numérica de rendimiento no está disponible. La diferencia principal es el conjunto de 37 clases específico del dominio robótico frente a las 80 clases de COCO de los modelos upstream, y la inclusión de un ledger de métricas auditable.

## Limitaciones y advertencias

- El detector de 37 clases está entrenado para una escena robótica concreta y no generaliza a COCO; su uso fuera de ese dominio requiere reentrenamiento.
- Las exportaciones INT8 se calibraron para la escena de despliegue; si cambia el dominio, hay que recalibrar y revalidar.
- El generador StyleGAN2 de 64 px produce rostros de muy baja resolución y se conserva por continuidad, no por calidad.
- No se publican métricas CLIP, FID ni LPIPS para los modelos generativos, por lo que no deben compararse con resultados de papers.
- El mAP50 objetivo de 0,95 no se alcanzó (mejor run: 0,9283); los runs 15-17 regresaron y la iteración quedó pausada.
- El objetivo de 25 FPS en placa tipo Raspberry no se ha verificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible; el conjunto de clases y los datos de entrenamiento no se detallan.
- Riesgo de alucinación: no aplicable a detección; en los generativos, riesgo de artefactos y caras irreales no cuantificado.
- Restricciones de licencia: los pesos derivados de YOLO heredan AGPL-3.0 de Ultralytics, que no es permisiva para todos los usos comerciales; verificar antes de cualquier redistribución.
- Uso fuera de alcance declarado: percepción crítica para seguridad (médica, ADAS automotriz, vigilancia industrial), reconocimiento facial, identificación de personas y análisis demográfico.

## Enlaces

- Hugging Face: https://huggingface.co/kn1ghtc/kcnet-vision
- Repositorio de artefactos y ledger de métricas: incluido en el propio repo (`yolo/deploy_metrics.json`, `yolo/yolo26n_multi_task_manifest.json`)
- Ultralytics (framework y licencia AGPL-3.0): https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai/
- OpenVINO: https://docs.openvino.ai/
- StyleGAN2 (referencia arquitectónica): no se proporciona enlace en la información disponible
- AdaIN (referencia arquitectónica): no se proporciona enlace en la información disponible
