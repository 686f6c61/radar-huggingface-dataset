# matthieulel/beit-base-patch16-224-galaxy10-decals-full-v2

## Resumen

`beit-base-patch16-224-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por el usuario de Hugging Face `matthieulel`, consistente en un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/beit-base-patch16-224` sobre el conjunto de datos Galaxy10 DECaLS. Su tarea es la clasificación de morfología galáctica en 10 clases, un problema clásico de astronomía observacional que tradicionalmente se abordaba con extracción de características manual o pipelines ad hoc.

El modelo forma parte de una colección más amplia, el *Vision Foundation Models Benchmark*, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (fine-tuning completo y adaptación con parámetros congelados) siguiendo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Con 85,7 millones de parámetros y una ventana de entrada fija de 224x224 píxeles, es un modelo compacto y desplegable en hardware modesto.

Su relevancia actual radica en que ofrece un punto de referencia reproducible y verificado para la clasificación morfológica de galaxias con arquitecturas transformer de visión, con métricas declaradas sobre un conjunto de test reservado de 1.774 imágenes y una comprobación de integridad de pesos incluida por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer con tokenización de parches estilo BERT), patch size 16, resolución 224x224 |
| Parametros totales | 85.769.674 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (visión); entrada fija de 224x224 px con parches de 16x16 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un BEiT-Base: un transformer de visión que divide la imagen en parches de 16x16 píxeles (196 parches para 224x224), los proyecta a un espacio latente y los procesa con autoatención bidireccional completa. El autor sustituye la cabeza original por una capa lineal única con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS. El ajuste es completo: se actualizan los 85,7 millones de parámetros, no solo la cabeza.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del benchmark, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se redimensiona y recorta al centro a 224x224 px con la normalización del procesador de imágenes del checkpoint. El epoch seleccionado es el de mínima pérdida de validación (época 17 de 30), y los pesos publicados corresponden a ese epoch. No se documenta uso de RLHF, DPO ni decodificación especulativa, dado que no es un modelo generativo de texto.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales de alta dimensión mediante el backbone BEiT ajustado.
- Inferencia determinista con logits por clase; admite cálculo de probabilidades vía softmax.
- Funciona con el pipeline `image-classification` de transformers y con `AutoModelForImageClassification`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo *thinking* ni de salida en lenguaje natural.

## Casos de uso

- **Clasificación morfológica automatizada en catálogos astronómicos**: el modelo recibe recortes de 224x224 px de galaxias procedentes de DECaLS y devuelve una de las diez clases morfológicas, lo que permite etiquetar grandes volúmenes de imágenes sin intervención humana y con una precisión de test del 85,57 %.
- **Triaje previo a inspección visual experta**: en pipelines de *citizen science* o de revisión por astrónomos, el modelo puede preclasificar y priorizar las imágenes ambiguas (baja confianza en el softmax) para revisión manual, reduciendo la carga de los expertos.
- **Validación cruzada de catálogos existentes**: comparar las predicciones del modelo con etiquetas morfológicas previas de surveys para detectar discrepancias sistemáticas o casos mal etiquetados en el catálogo de referencia.
- **Estudios de morfología a escala en *surveys* fotométricos**: al ser un modelo de 85,7 M de parámetros y 0,3 GB de pesos, puede ejecutarse en lotes sobre GPU de consumo para procesar decenas de miles de recortes en estudios de evolución morfológica con redshift.
- **Punto de referencia en investigación sobre foundation models astronómicos**: forma parte del *Vision Foundation Models Benchmark*, por lo que sirve como baseline reproducible para comparar nuevos backbones o regímenes de adaptación bajo una receta idéntica y splits documentados.
- **Prototipado rápido de clasificadores astronómicos**: al cargarse con `AutoModelForImageClassification` en tres líneas de código, es adecuado para validar pipelines de preprocesado (resize, center crop, normalización) antes de escalar a modelos mayores.
- **Docencia y divulgación en astronomía computacional**: ejemplo didáctico de fine-tuning completo de un transformer de visión sobre datos astronómicos reales, con métricas por época publicadas y protocolo detallado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero, `verified: false` en el model-index). Conjunto de test reservado de Galaxy10 DECaLS: 1.774 imágenes.

| Metrica | Valor | Notas |
|---|---|---|
| Accuracy (seed 42, epoch seleccionado) | 85,57 % | Época 17 de 30, mínima pérdida de validación |
| Weighted F1 (seed 42, epoch seleccionado) | 85,43 % | Época 17 de 30 |
| Accuracy media +/- desv. típica (seeds 42, 1, 2) | 85,64 % +/- 0,90 | Tres semillas |
| Weighted F1 media +/- desv. típica (seeds 42, 1, 2) | 85,50 % +/- 0,90 | Tres semillas |

El autor publica además las métricas por época de la seed 42. El mejor resultado de test dentro de esa seed se observa en la época 20 (87,54 % de accuracy y 87,44 % de F1 ponderado), superior al de la época 17 seleccionada por pérdida de validación; esta discrepancia es relevante para interpretar el rendimiento real del checkpoint publicado. No se han publicado en la información disponible resultados comparativos con otros modelos del benchmark ni con alternativas de la misma categoría.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, los pesos ocupan aproximadamente 0,34 GB (85,7 M de parámetros x 4 bytes); con activaciones y batch pequeño, el consumo se mantiene por debajo de 2 GB. En fp16/bf16 bajaría a unos 0,17 GB de pesos.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes de inferencia conviene una GPU con más memoria (A100 40/80 GB, H100) para maximizar throughput.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- **Opciones de despliegue**: `transformers` con `AutoModelForImageClassification` (vía documentada por el autor), pipeline `image-classification`, endpoints de Hugging Face (tag `endpoints_compatible`), y exportación a TorchScript/ONNX no documentada oficialmente pero viable dado el formato estándar de transformers. No se documentan pesos GGUF ni compatibilidad con llama.cpp u Ollama (no aplica a un modelo de visión).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. El autor no publica mediciones de latencia ni de imágenes por segundo.
- **Requisitos de software**: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0 (versiones usadas en el entrenamiento).

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de alternativas comparables con métricas sobre Galaxy10 DECaLS. La comparativa se limita a características estructurales frente al modelo base del que deriva.

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `matthieulel/beit-base-patch16-224-galaxy10-decals-full-v2` | 85,7 M | 224x224 px | Clasificación de 10 clases de morfología galáctica | apache-2.0 | Hugging Face (14 descargas) |
| `microsoft/beit-base-patch16-224` | 86,0 M aprox. (BEiT-Base) | 224x224 px | Backbone de visión preentrenado (ImageNet-22k) | no disponible en la información | Hugging Face |
| Otros backbones del *Vision Foundation Models Benchmark* | no disponible | no disponible | Clasificación de morfología galáctica | no disponible | Colección del autor en Hugging Face |

No se dispone de datos de rendimiento de las alternativas sobre el mismo conjunto de test en la información proporcionada.

## Limitaciones y advertencias

- **Sesgos de dominio**: el modelo está entrenado exclusivamente sobre Galaxy10 DECaLS; su generalización a otros surveys (SDSS, Euclid, LSST/Rubin) o a otras resoluciones y profundidades no está documentada y probablemente degrade el rendimiento.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en morfologías ambiguas, galaxias en interacción o imágenes con artefactos.
- **Clases desbalanceadas**: Galaxy10 DECaLS tiene un desbalance notable entre clases; la accuracy global (85,57 %) puede ocultar un rendimiento inferior en clases minoritarias. El F1 ponderado (85,43 %) es consistente con la accuracy, pero no se publican métricas por clase.
- **Selección de epoch subóptima en test**: el checkpoint publicado corresponde a la época 17 (mínima pérdida de validación), mientras que la época 20 de la misma seed alcanza 87,54 % de accuracy en test. Esto indica que el rendimiento reportado no es el máximo alcanzable y que la selección por validación introduce una brecha frente al óptimo de test.
- **Sin verificación externa**: las métricas están declaradas por el autor y marcadas como `verified: false` en el model-index. No hay resultados de terceros que las confirmen.
- **Entrada fija**: la resolución está fijada a 224x224 px; imágenes de mayor resolución deben redimensionarse y recortarse, lo que puede perder estructura morfológica fina (brazos espirales, barras, colas de marea).
- **Idiomas**: no aplica, pero conviene señalar que el modelo no procesa metadatos textuales ni coordenadas; solo imagen.
- **Licencia**: apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad científica de las predicciones.
- **Uso científico**: no debe emplearse como sustituto de la clasificación experta en estudios publicables sin validación adicional sobre el survey objetivo y con métricas por clase.
- **Madurez**: 14 descargas y 0 likes en el momento de la consulta; el modelo es reciente (creado el 30 de octubre de 2026) y no cuenta con adopción comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/beit-base-patch16-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/beit-base-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación según el autor)
