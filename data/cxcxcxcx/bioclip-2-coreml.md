# cxcxcxcx/bioclip-2-coreml

## Resumen

BioCLIP 2 Core ML es una conversión del codificador de imágenes (image tower) del modelo `imageomics/bioclip-2` al formato Core ML de Apple, empaquetada por el usuario `cxcxcxcx`. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de formato que preserva los pesos del ViT-L/14 original de BioCLIP 2, desarrollado por el Imageomics Institute, y los expone como un ML Program optimizado para ejecutarse en GPU y Neural Engine de Apple Silicon.

El modelo resuelve la clasificación de imágenes zero-shot en el dominio biológico, concretamente la identificación de especies dentro del árbol de la vida. BioCLIP 2 se entrena con aprendizaje contrastivo jerárquico sobre una taxonomía de aproximadamente 867 000 especies, lo que le permite clasificar imágenes de organismos vivos comparando embeddings de imagen contra embeddings de texto de nombres científicos.

La relevancia de esta conversión concreta es práctica: permite ejecutar el codificador en local sobre un Mac con Apple Silicon a velocidades muy superiores a las de una ruta CPU convencional (32 img/s frente a 8 img/s en un Mac mini M4), sin necesidad de GPU dedicada ni de servicios en la nube. El repositorio contiene únicamente el codificador de imagen; la parte de texto debe obtenerse del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (Vision Transformer, codificador de imagen de CLIP), convertido a ML Program de Core ML |
| Parametros totales | no disponible (el repositorio solo contiene el image tower; el modelo base es ViT-L/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224×224 píxeles) |
| Tipos de cuantizacion | Pesos en fp16; entrada `float32 [16, 3, 224, 224]`; salida `[16, 768]` sin normalizar |
| Idiomas soportados | no disponible (modelo de visión; la parte de texto del modelo base no se incluye) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (ML Program de Core ML), batch fijo de 16, macOS 15+ |

## Arquitectura y entrenamiento

El modelo subyacente, BioCLIP 2, es un modelo de visión-lenguaje con arquitectura CLIP basada en un Vision Transformer ViT-L/14 para el codificador de imagen y un codificador de texto asociado. Se entrena con aprendizaje contrastivo jerárquico a gran escala sobre el árbol de la vida, aprovechando la estructura taxonómica para organizar las representaciones. El trabajo se publicó en NeurIPS 2025 con el título "BioCLIP 2: Emergent Properties from Scaling Hierarchical Contrastive Learning".

Esta conversión concreta no modifica los pesos: se extrae únicamente el visual tower mediante `open_clip.create_model_from_pretrained("hf-hub:imageomics/bioclip-2")`, se traza con la ruta rápida de MHA desactivada y se convierte a ML Program con coremltools 9.0 (torch 2.7.0, open_clip 4.2.2, numpy 1.26.4). El resultado es un paquete de batch fijo 16 con pesos fp16. La fidelidad se valida con una puerta de calidad basada en similitud coseno por imagen frente a la referencia torch fp32 en CPU: media ≥ 0.999 y mínimo ≥ 0.998. El manifiesto incluye `logit_scale = 100.0` procedente del modelo fuente, necesario para la clasificación `softmax(logit_scale · img_emb · txt_embᵀ)`.

## Capacidades

- Extracción de embeddings de imagen para clasificación zero-shot de especies y organismos, comparando contra embeddings de texto del modelo original.
- Codificación por lotes de batch fijo 16 imágenes de 224×224 píxeles, con salida de 768 dimensiones por imagen.
- Ejecución en GPU y Neural Engine de Apple Silicon mediante `ComputeUnit.ALL`, con degradación a `CPU_AND_GPU` si se requiere mayor fidelidad numérica.
- Integración con pipelines de clasificación biológica existentes que usen las tablas de embeddings de texto de BioCLIP 2 (por ejemplo, `txt_emb_species.npy` de TreeOfLife-200M).
- No incluye capacidades de generación de texto, razonamiento, código, tool calling ni agentes: es exclusivamente un codificador de imagen.
- No soporta tool calling ni function calling.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la codificación visual.

## Casos de uso

- Clasificación de especies en bibliotecas fotográficas locales: el codificador genera embeddings de cada foto y se comparan contra la tabla de embeddings de texto de las ~867 000 especies, permitiendo etiquetar automáticamente fotos de fauna y flora sin conexión a internet. Es el caso de uso principal documentado (BotaniSense for Immich).
- Aplicaciones de campo en macOS: naturalistas y biólogos pueden identificar organismos en un MacBook sin GPU dedicada, aprovechando el Neural Engine para obtener ~32 img/s en un Mac mini M4.
- Indexación y búsqueda semántica de imágenes biológicas: los embeddings de 768 dimensiones permiten construir índices vectoriales para búsqueda por similitud visual dentro de colecciones de imágenes de organismos.
- Preetiquetado de datasets de biodiversidad: procesar lotes de imágenes de cámaras trampa o herbarios para generar etiquetas candidatas que luego se revisan manualmente, reduciendo el trabajo de anotación.
- Filtrado y curación de colecciones: detectar imágenes que no corresponden a la especie declarada comparando la predicción zero-shot con los metadatos existentes.
- Integración en herramientas de escritorio nativas: al ser un ML Program estándar, puede embeberse en aplicaciones macOS o en scripts Python con coremltools para flujos de análisis de imágenes a escala local.
- Verificación de pipelines: el repositorio incluye `golden.npz` con 32 recortes reales de plantas y embeddings de referencia en torch fp32, útil para autocomprobar la instalación tras la descarga.

## Benchmarks y rendimiento

Los datos de fidelidad y rendimiento publicados en la model card son los siguientes:

| Conjunto | Unidades de cómputo | Coseno media / mínimo | Throughput (Mac mini M4) |
|---|---|---|---|
| `golden.npz` (32 recortes) | ALL (incl. Neural Engine) | 0.999712 / 0.999259 | 32 img/s (solo codificador) |
| `golden.npz` (32 recortes) | CPU_AND_GPU | 0.999996 / 0.999978 | 21 img/s |
| 559 fotos de biblioteca, extremo a extremo vs. torch en Linux | ALL | 0.999712 / 0.998195 | no disponible |

Resultados extremo a extremo sobre las 559 fotos (clasificación zero-shot de BioCLIP 2 sobre la tabla de ~867 000 especies):

| Métrica | Valor |
|---|---|
| Concordancia de reino | 99.8 % |
| Especie top-1 dentro del top-5 de torch | 100 % |
| Concordancia de especie top-1 | 95.8 % |

Con `CPU_AND_GPU` la concordancia extremo a extremo sube a ~99 % a aproximadamente dos tercios de la velocidad. Como referencia, torch en la CPU del M4 rinde unos 8 img/s (codificación más clasificación), por lo que esta conversión es aproximadamente 3× más rápida que cualquier ruta CPU, incluido Docker sobre Mac.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un codificador de imagen.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0.6 GB; los pesos en fp16 del ViT-L/14 requieren del orden de centenares de MB en memoria unificada de Apple Silicon.
- GPU recomendadas: Apple Silicon (M-series) con GPU y Neural Engine; probado en Mac mini M4. No está pensado para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon. No requiere GPU dedicada.
- Sistema: macOS 15 o superior para el ML Program.
- Opciones de despliegue: coremltools (`ct.models.MLModel` con `ComputeUnit.ALL` o `CPU_AND_GPU`), o `ct.models.CompiledMLModel` sobre el `.mlmodelc` cacheado. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32 img/s con `ALL` y 21 img/s con `CPU_AND_GPU` en Mac mini M4 (solo codificador). La primera carga compila el paquete en unos 10 s; conviene cachear el `.mlmodelc`.
- Nota de compatibilidad: la inferencia funciona con numpy 2.x; el límite numpy < 2.4 de coremltools 9 aplica solo a la conversión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioCLIP 2 Core ML (esta conversión) | ViT-L/14 en Core ML | 224×224, batch 16 | 32 img/s en M4 (ALL) | MIT | Hugging Face, 0.6 GB |
| imageomics/bioclip-2 (original) | ViT-L/14 CLIP | 224×224 | ~8 img/s en CPU M4 (encode + clasificación) | MIT | Hugging Face |
| CLIP ViT-L/14 genérico | ViT-L/14 CLIP | 224×224 | no disponible | MIT | Hugging Face / open_clip |

La comparación directa más relevante es con el modelo original: esta conversión ofrece la misma fidelidad (coseno ≥ 0.999) con una mejora de throughput de aproximadamente 3× en Apple Silicon. Frente a CLIP genérico, la diferencia principal es el dominio de entrenamiento (taxonomía biológica frente a pares imagen-texto generales), no la arquitectura.

## Limitaciones y advertencias

- Solo contiene el codificador de imagen: sin la parte de texto y sin la tabla de embeddings de texto no es posible clasificar; hay que obtenerlos del modelo original o de TreeOfLife-200M.
- La salida `emb` no está normalizada; es obligatorio aplicar normalización L2 antes de calcular similitudes.
- Batch fijo de 16: los lotes incompletos deben rellenarse (por ejemplo, repitiendo la última imagen) y descartar las salidas de relleno.
- El preprocesado debe replicar exactamente `bioclip.predict.preprocess_img` (redimensionar a 224×224 sin recorte y normalización CLIP mean/std); cualquier desviación degrada la fidelidad.
- Las discrepancias de especie top-1 (95.8 % de concordancia) se concentran en empates cercanos entre especies próximas cuyos embeddings de texto están muy próximos; conviene revisar manualmente los casos de baja confianza.
- Riesgo de error en especies poco representadas o imágenes atípicas; el modelo es zero-shot y no se ha reentrenado para dominios concretos.
- Sesgos del dataset de entrenamiento del modelo base (distribución geográfica y taxonómica de las imágenes) no documentados en esta información.
- Licencia MIT, igual que el modelo fuente, sin restricciones comerciales conocidas; se recomienda citar el trabajo original de BioCLIP 2.
- Dependencia de macOS 15+ y Apple Silicon; no es portable a otras plataformas sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cxcxcxcx/bioclip-2-coreml
- Modelo base: https://huggingface.co/imageomics/bioclip-2
- Dataset TreeOfLife-200M: https://huggingface.co/datasets/imageomics/TreeOfLife-200M
- pybioclip: https://github.com/Imageomics/pybioclip
- BotaniSense for Immich: https://github.com/cxcxcxcx/botanisense-for-immich
- Script de exportación: https://github.com/cxcxcxcx/botanisense-for-immich/blob/main/scripts/export_teacher_coreml.py
- Script de verificación: https://github.com/cxcxcxcx/botanisense-for-immich/blob/main/scripts/verify_coreml_teacher.py
- DOI del modelo base: https://doi.org/10.57967/hf/5765
