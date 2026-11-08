# Infarondus/Klein-marchen_Base

## Resumen

Kleine-Marchen es un pipeline de clasificación de imágenes en dos etapas para la selección automática de fotografías de encuadernaciones de manuscritos con "srednik" (elemento decorativo central de la tapa) procedentes de fondos digitalizados de la Biblioteca Estatal Rusa (RGB). Lo desarrolla el usuario Infarondus y se publica bajo licencia Apache 2.0 con la librería `timm`. No es un modelo generativo ni un LLM: es un conjunto de diez clasificadores de imagen (cinco ConvNeXt-Tiny para la etapa 1 y cinco DINOv2 ViT-Small para la etapa 2) organizados como ensemble por etapa.

La relevancia es acotada pero concreta: automatiza una tarea de selección documental en humanidades digitales y patrimonio cultural, donde la revisión manual de miles de imágenes de encuadernaciones es costosa. El pipeline aplica umbrales de confianza (τ₁ = 0.60 en la etapa 1, τ₂ = 0.55 en la etapa 2) y está calibrado de forma conservadora, priorizando la precisión del filtrado sobre la exhaustividad.

El repositorio ocupa 1.1 GB y contiene pesos en formato `.pth` (PyTorch), no safetensors ni GGUF. La model card documenta métricas out-of-fold tras una revisión de protocolo en noviembre de 2026, además de una validación externa sobre el fondo 228 de la RGB con 219 manuscritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble en dos etapas: ConvNeXt-Tiny (etapa 1) y DINOv2 ViT-Small (etapa 2), cinco modelos por etapa |
| Parametros totales | no disponible (no se indica el recuento; ConvNeXt-Tiny y ViT-Small son arquitecturas compactas, pero el autor no publica cifras) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pth` en precisión de entrenamiento) |
| Idiomas soportados | ru, en (etiquetas de la model card; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), organizados en `convnext/fold_1_oof.pth` … `fold_5_oof.pth` y `fold_1_km.pth` … `fold_5_km.pth` |

## Arquitectura y entrenamiento

La etapa 1 es un ConvNeXt-Tiny preentrenado en ImageNet-22k (`convnext_tiny.fb_in22k`) y ajustado en tres fases con deshielo progresivo: fase 1 a 288 px con solo la cabeza (AdamW, lr 1e-4, wd 1e-2, warmup de 2 épocas más coseno); fase 2 a 288 px con stages 2–3 y cabeza congelada (lr 1e-5, wd 5e-3); fase 3 a 352 px con stages 1–3 más cabeza (lr 5e-6 en backbone y 1e-5 en cabeza, wd 5e-3, label smoothing 0.05, mixup/cutmix desde la quinta época). Se usa batch 16, AMP, gradient clipping 1.0, dropout 0.3, drop_path 0.1, muestreador ponderado por clase y early stopping con paciencia 5; la selección del mejor modelo se hace por F1 de validación con TTA sobre pesos EMA. Las aumentaciones (Albumentations) incluyen RandomResizedCrop, volteos horizontal y vertical, ShiftScaleRotate, variaciones de brillo/contraste y tono/saturación, ruido y desenfoque gaussianos, compresión de imagen, CLAHE y CoarseDropout.

El conjunto de datos de la etapa 1 son 1614 imágenes únicas (1131 encuadernaciones y 483 no encuadernaciones: dobles páginas, carpetas, otras tomas de inventario) de siete fondos de la RGB, con duplicados exactos eliminados y partición `StratifiedGroupKFold` agrupada por manuscrito. La etapa 2 parte de DINOv2 ViT-Small y se entrena sobre 1136 imágenes balanceadas (568/568) de fondos de la RGB, correspondientes a 1119 manuscritos únicos (17 repetidos, cuya exclusión no altera las métricas); parte de los positivos (67) fue seleccionada por una versión temprana del modelo. La inferencia de la etapa 2 emplea cinco TTA y cada etapa promedia las probabilidades softmax de sus cinco modelos. La definición operativa de "con srednik" exige que el elemento central sea el centro de la composición decorativa de la tapa (relieve o aplique metálico rodeado de ornamento, marcos o estampación); un aplique aislado sobre tapa lisa no cuenta.

## Capacidades

- Clasificación binaria de imagen en la etapa 1: distingue encuadernación frente a no encuadernación (dobles páginas, carpetas, otras tomas de inventario).
- Clasificación binaria de imagen en la etapa 2: distingue encuadernación con srednik frente a encuadernación sin srednik.
- Filtrado por umbral de confianza configurable (τ₁ = 0.60 y τ₂ = 0.55 en la configuración documentada).
- Ensemble por media de probabilidades softmax sobre cinco modelos por etapa.
- TTA de cinco transformaciones en la etapa 2.
- Evaluación out-of-fold y validación de transferencia a fondos no vistos.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo de pensamiento: es exclusivamente un clasificador de imagen de dominio específico.
- Idiomas declarados ru y en, sin procesamiento lingüístico real.

## Casos de uso

- Selección automatizada en digitalización de fondos manuscritos: el pipeline recorre lotes de fotografías de encuadernaciones y descarta tomas que no son encuadernación (etapa 1) antes de evaluar la presencia de srednik (etapa 2), reduciendo el volumen que llega a revisión humana.
- Catalogación de patrimonio cultural: permite etiquetar automáticamente encuadernaciones con decoración central para construir subconjuntos temáticos dentro de una colección digitalizada, con precisión de filtrado del 0.989 en la validación externa.
- Curaduría de exposiciones y publicaciones: facilita localizar ejemplares con srednik para selección de piezas, aceptando el coste de recall (0.840) a cambio de minimizar falsos positivos.
- Investigación en humanidades digitales: genera datos cuantitativos sobre la distribución de un motivo decorativo concreto en un fondo, con métricas reproducibles y partición agrupada por manuscrito.
- Preprocesado de pipelines de visión documental: actúa como etapa de filtrado previo antes de tareas posteriores (segmentación, reconocimiento de motivos, OCR de cubiertas), descartando imágenes no pertinentes.
- Control de calidad de digitalizaciones: la etapa 1 detecta tomas que no corresponden a encuadernación y señala posibles errores de captura o de organización del lote.
- Transferencia a nuevas colecciones: con recalibración del umbral τ₂ sobre una muestra pequeña etiquetada, el pipeline puede aplicarse a fondos de otras instituciones; en la validación cruzada entre fondos se obtuvieron AUC de 0.942 y 0.979.

## Benchmarks y rendimiento

Validación externa sobre el fondo 228 de la RGB (219 manuscritos, una mejor toma por manuscrito, revisión ciega del autor, 7 imágenes excluidas por fragmentación):

| Metrica | Valor | IC 95% |
|---|---|---|
| Precision de seleccion | 0.989 (89/90) | 0.94–0.998 |
| Recall | 0.840 (89/106) | 0.76–0.90 |
| AUC etapa 2 | 0.980 | no disponible |
| Etapa 1 precision / recall | 0.971 / 0.983 | no disponible |

Etapa 1, métricas out-of-fold (5 folds, agrupación por manuscrito, una transformación a 352 px):

| Metrica | Valor |
|---|---|
| Accuracy | 0.988 |
| F1-macro | 0.986 |
| Precision (macro) | 0.986 |
| Recall (macro) | 0.986 |
| AUC | 0.999 |

Matriz de confusión de la etapa 1: 473 verdaderos negativos, 10 falsos positivos, 9 falsos negativos y 1122 verdaderos positivos. F1 por fold entre 0.981 y 0.993; el 0.9% de las predicciones queda por debajo de 0.6 de confianza.

Etapa 2, métricas out-of-fold con 5 TTA:

| Metrica | Valor |
|---|---|
| Accuracy | 0.929 |
| F1-macro | 0.929 |
| Precision (macro) | 0.929 |
| Recall (macro) | 0.929 |

Matriz de confusión de la etapa 2: 532 verdaderos negativos, 36 falsos positivos, 45 falsos negativos y 523 verdaderos positivos. Accuracy por fold entre 0.908 y 0.952; con τ₂ = 0.55, precision 0.941 y recall 0.903; el 12.0% de las predicciones queda por debajo de 0.7 de confianza.

Transferencia de la etapa 2 a fondos no vistos:

| Fondo excluido | n | AUC | F1 con τ₂ = 0.55 |
|---|---|---|---|
| 98 | 399 | 0.942 | 0.825 |
| 304-I | 498 | 0.979 | 0.839 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por las arquitecturas (ConvNeXt-Tiny y ViT-Small) y la resolución de entrada (352 px en etapa 1), la inferencia por modelo es ligera, pero el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor; por el tamaño de las arquitecturas es plausible, pero no se documenta.
- Opciones de despliegue: los pesos se distribuyen como `.pth` para PyTorch/`timm`; el pipeline completo está implementado en el script `scrape_bindings_v3.py` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste se multiplica por cinco modelos en cada etapa y por cinco TTA en la etapa 2.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de encuadernaciones o de patrimonio documental, ni con alternativas genéricas de clasificación de imagen evaluadas sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo clasifica encuadernaciones de manuscritos y la presencia de srednik; no es un modelo de propósito general ni un LLM.
- Recall limitado en la selección final (0.840): el pipeline está configurado de forma conservadora y descarta parte de los positivos reales. Los falsos negativos suelen recibir puntuaciones muy superiores a las de las encuadernaciones sin srednik (mediana 0.02), pero no alcanzan τ₂.
- Desplazamiento de la escala de confianza en fondos nuevos: aunque el AUC se mantiene alto (0.942–0.979), el umbral τ₂ debe recalibrarse sobre una muestra etiquetada de la nueva colección; se recomienda revisión humana para puntuaciones entre 0.4 y 0.7.
- Definición de clase dependiente del criterio del autor: la distinción entre "con srednik" y "sin srednik" sigue una definición operativa concreta; cambios en el criterio exigirían reetiquetado y reentrenamiento.
- Datos de entrenamiento limitados y de una única institución (fondos de la RGB): la generalización a otras tradiciones de encuadernación no está validada más allá de los dos fondos de transferencia documentados.
- Sesgos conocidos: no documentados explícitamente en la información disponible; la composición del conjunto (7 fondos de una misma biblioteca) puede introducir sesgo hacia sus características de digitalización.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en imágenes atípicas o fragmentadas (7 imágenes se excluyeron por no admitir etiquetado inequívoco).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero conviene verificar los términos de las imágenes de entrenamiento, no detallados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa mínimo; las métricas proceden de la evaluación del propio autor.
- Pesos en `.pth`: requieren cargar código PyTorch y no ofrecen las ventajas de seguridad y portabilidad de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infarondus/Klein-marchen_Base
- Perfil del autor: https://huggingface.co/Infarondus
- Repositorio del pipeline (script `scrape_bindings_v3.py`): https://github.com/Infarondus/Kleine-marchen
