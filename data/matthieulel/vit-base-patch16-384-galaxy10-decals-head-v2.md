# matthieulel/vit-base-patch16-384-galaxy10-decals-head-v2

## Resumen

`vit-base-patch16-384-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. El modelo adapta el backbone `google/vit-base-patch16-384` al conjunto de datos Galaxy10 DECaLS, que plantea una clasificación de 10 clases morfológicas sobre recortes de galaxias del sondeo DECaLS. La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas.

El modelo resuelve un problema acotado y bien definido: clasificación supervisada de morfología galáctica con un protocolo reproducible y comparable entre 40 backbones preentrenados. Su relevancia es metodológica más que de producto: forma parte de un estudio sistemático sobre cómo se comportan los modelos fundacionales de visión cuando se aplican a datos astronómicos, con recetas idénticas para todos los backbones y métricas por época publicadas.

La arquitectura es un Vision Transformer (ViT-Base, parches de 16x16 px, resolución de entrada 384x384) con 86.098.186 parámetros totales y licencia Apache 2.0. El checkpoint incluye el backbone completo más la cabeza entrenada, y declara una precisión del 57,89 % y un F1 ponderado del 55,73 % en el conjunto de test reservado de 1.774 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch size 16, resolución 384x384) |
| Parametros totales | 86.098.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 384x384 px) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ViT-Base con parches de 16x16 y resolución de entrada de 384x384, inicializado desde `google/vit-base-patch16-384`. La única parte entrenada es una cabeza lineal de 10 salidas; el backbone se congela por completo, incluidas las estadísticas de normalización. El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes): el split público de test (1.774 imágenes) se reservó como test held-out, y el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar época.

La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. Como aumentación se aplican random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación, resize y center crop a 384x384 px con la normalización del image processor del checkpoint. La semilla principal es 42, y se reportan medias y desviaciones sobre las semillas 42, 1 y 2.

No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de imágenes. La innovación destacable del trabajo es metodológica: protocolo unificado, métricas por época publicadas y verificación de integridad del checkpoint (predicciones idénticas a los logits guardados en el 100 % de las primeras 96 imágenes de test, con diferencia absoluta máxima de 3,58e-06).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre recortes de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Base congelado (representaciones de 768 dimensiones antes de la cabeza).
- Inferencia determinista y reproducible con el preprocesado documentado (resize y center crop a 384x384, normalización del processor).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No soporta visión general más allá de la clasificación entrenada; no hay capacidades multimodales ni de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: aplicar el modelo a recortes de galaxias de DECaLS para asignar una de las 10 clases morfológicas y priorizar revisiones visuales del equipo científico.
- Etiquetado asistido en pipelines de datos: usar las predicciones como preetiquetas para reducir el coste de anotación manual, aceptando el nivel de precisión del 57,89 % como filtro inicial y no como verdad de referencia.
- Comparación de backbones en investigación: el checkpoint sirve como una de las 80 configuraciones del benchmark, útil para reproducir el estudio *When foundation models meet astronomical data* y contrastar regímenes de adaptación.
- Extracción de embeddings para búsqueda por similitud: las representaciones del backbone congelado pueden alimentar índices vectoriales para recuperar galaxias visualmente parecidas en un archivo.
- Prototipado rápido en astronomía: al ser un ViT-Base de 86 M de parámetros y 0,3 GB, se puede desplegar en una GPU de consumo para validar hipótesis antes de escalar a modelos mayores.
- Docencia y reproducibilidad: el protocolo detallado (semillas, épocas, métricas por época y verificación de integridad) lo hace adecuado como ejemplo reproducible de fine-tuning head-only en un curso o taller.
- Control de calidad de datasets: detectar recortes anómalos o mal etiquetados comparando la predicción del modelo con la etiqueta original y revisando las discrepancias de alta confianza.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 57,89 % |
| F1 ponderado (semilla 42, época 30 de 30) | 55,73 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 58,10 +/- 0,36 % |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 56,00 +/- 0,44 % |

Evolución seleccionada del entrenamiento (semilla 42): la validación pasa de 14,37 % de accuracy en la época 1 a 59,19 % en la época 30, con pérdida de validación de 2,2698 a 1,2180. El test sigue una curva similar: 15,67 % en la época 1 y 57,89 % en la época 30. No se han publicado en la información disponible resultados comparativos con otros modelos en una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (86 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16/bf16 el peso se reduce a unos 0,17 GB, aunque el autor no documenta evaluación en precisión reducida.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes, A100 o H100 aportan throughput, pero no son necesarias. Una RTX 4090, RTX 3090 o incluso una GTX 1660 con 6 GB son suficientes para inferencia.
- Cabe en GPU de consumo sin problema, incluidas tarjetas de gama media con 4-6 GB.
- Opciones de despliegue: `transformers` con PyTorch (ruta documentada por el autor), y por formato safetensors es compatible con `optimum`/ONNX si se exporta; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ViT-Base/16, 384, head-only) | 86,1 M | 384x384 px | 57,89 % (test, semilla 42) | Apache 2.0 | Hugging Face |
| `google/vit-base-patch16-384` (backbone base, sin adaptar) | 86,1 M | 384x384 px | no disponible | Apache 2.0 | Hugging Face |
| Otros backbones del mismo benchmark (40 configuraciones) | variable | variable | no disponible en esta ficha | variable | Colección Vision Foundation Models Benchmark |

No se dispone en la información proporcionada de resultados numéricos de los otros 39 backbones del benchmark ni de alternativas externas evaluadas sobre Galaxy10 DECaLS, por lo que la comparación cuantitativa con modelos similares queda como no disponible.

## Limitaciones y advertencias

- Precisión moderada: 57,89 % de accuracy y 55,73 % de F1 ponderado en test indican un margen de error considerable; no es adecuado como única fuente de verdad en catalogación científica.
- Solo se ha entrenado la cabeza lineal sobre un backbone congelado; un fine-tuning completo podría mejorar el rendimiento, pero no se ha evaluado en este checkpoint.
- Dominio muy restringido: entrenado exclusivamente con recortes de Galaxy10 DECaLS; el rendimiento fuera de ese sondeo, instrumento o rango de redshift no está caracterizado.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre asigna una de las 10 clases, incluidas imágenes ambiguas, artefactos o recortes que no contienen una galaxia.
- Sesgos potenciales derivados de la composición del dataset Galaxy10 DECaLS y de sus etiquetas originales; no se documenta un análisis de sesgo por clase, luminosidad o tamaño angular.
- Sin soporte de lenguaje ni multilingüe: no debe emplearse en tareas de texto, tool calling ni agentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el paper asociado está en revisión, por lo que la cita académica aún no está completa.
- Resultados no verificados de forma independiente: las métricas proceden de la model card del autor y llevan la marca `verified: false`.
- Fecha de creación del repositorio (2026-10-30) y bajo número de descargas (16): ecosistema limitado, poca validación por terceros.
- El checkpoint incluye el backbone completo congelado, por lo que su tamaño (0,3 GB) es mayor que el de una cabeza aislada; tenerlo en cuenta para despliegues con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-384-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper asociado: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (citación pendiente de publicación; no se dispone de URL)
