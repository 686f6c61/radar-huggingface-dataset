# matthieulel/vit-large-patch32-384-galaxy10-decals-full-v2

## Resumen
El modelo `vit-large-patch32-384-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel`. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `google/vit-large-patch32-384`, un Vision Transformer de 305,6 millones de parámetros, sobre el conjunto de datos Galaxy10 DECaLS, que consta de 10 clases morfológicas de galaxias.

El modelo forma parte de una colección de benchmarking más amplia (Vision Foundation Models Benchmark) que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación, en el contexto de un artículo científico en revisión para la revista *Astronomy and Computing* titulado "When foundation models meet astronomical data". Su relevancia radica en que proporciona una referencia reproducible y meticulosamente documentada para la clasificación morfológica de galaxias, una tarea fundamental en estudios de formación y evolución galáctica a gran escala.

Con 305,6 millones de parámetros, una resolución de entrada de 384x384 píxeles y un pipeline de `image-classification`, el modelo alcanza un 83,54 % de accuracy y un 83,43 % de F1 ponderado en el conjunto de test retenido de 1.774 imágenes. Es un modelo de propósito específico, no un modelo generativo ni multimodal, y su licencia Apache 2.0 facilita su reutilización tanto en investigación como en aplicaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large), patch size 32, resolución 384x384 |
| Parámetros totales | 305.617.930 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | No disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,2 GB |
| Modelo base | google/vit-large-patch32-384 |
| Pipeline | image-classification |
| Número de clases | 10 (morfología galáctica Galaxy10 DECaLS) |
| Resolución de entrada | 384x384 px (resize y center crop) |
| Dataset de entrenamiento | matthieulel/galaxy10_decals (17.736 imágenes) |

## Arquitectura y entrenamiento
La arquitectura es un Vision Transformer estándar de tipo ViT-Large con parches de 32x32 píxeles y resolución de entrada de 384x384, heredado del checkpoint `google/vit-large-patch32-384`. Sobre el encoder se añade una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS. El ajuste es completo: se actualizan los 305,6 millones de parámetros, no solo la cabeza de clasificación.

El entrenamiento se realizó con un protocolo idéntico para los 40 backbones de la colección, lo que garantiza comparabilidad. Se usó AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate de 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo de 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El data augmentation consistió en random resized crop a la resolución de entrada y random horizontal flip. La selección de época se hizo por mínima pérdida de validación, resultando la época 11 la elegida. La partición de datos estratificó por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test retenido (el split público de test). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades
- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de representaciones visuales de alta dimensionalidad mediante el encoder ViT-Large (útil para transfer learning o clustering).
- Inferencia determinista y reproducible: verificación de integridad con predicciones idénticas en el 100 % de las primeras 96 imágenes de test (diferencia máxima de logits de 6,20e-06).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador de imágenes puro).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales.

## Casos de uso
- **Clasificación morfológica automatizada en surveys astronómicos**: el modelo puede procesar recortes de galaxias de surveys como DECaLS y asignar una de las diez clases morfológicas, sustituyendo la inspección visual manual en catálogos de decenas de miles de objetos. Su accuracy del 83,54 % lo hace adecuado para preclasificación y triaje.
- **Preetiquetado para citizen science**: en proyectos de ciencia ciudadana (p. ej., Galaxy Zoo), el modelo puede generar etiquetas preliminares que los voluntarios revisan, reduciendo la carga de trabajo y acelerando la anotación de nuevos lotes de imágenes.
- **Transfer learning a otras tareas astronómicas**: el encoder ViT-Large ajustado puede servir como extractor de características congelado para tareas downstream como detección de galaxias interactuando, clasificación de redshift fotométrico o segmentación de estructuras, partiendo de representaciones ya adaptadas al dominio astronómico.
- **Control de calidad de pipelines de datos**: integrado en un pipeline de ingestión de imágenes, el modelo puede detectar recortes anómalos o mal centrados comparando la confianza de la predicción con umbrales definidos, marcando imágenes para revisión manual.
- **Estudios de reproducibilidad y benchmarking**: al formar parte de una colección de 80 configuraciones con protocolo idéntico, el modelo se usa como referencia para comparar el rendimiento de distintos backbones de visión en datos astronómicos, facilitando meta-análisis y selección de arquitecturas.
- **Docencia y divulgación en astroinformática**: el modelo, con su receta de entrenamiento completamente documentada y su verificación de integridad, sirve como ejemplo práctico de ajuste fino de un ViT en un dominio científico, reproducible con una sola GPU.
- **Análisis de morfología a escala en clústeres**: desplegado con `transformers` en un entorno con GPU, puede procesar lotes de imágenes de 384x384 px de forma eficiente para generar catálogos morfológicos de grandes surveys, con la ventaja de una licencia Apache 2.0 sin restricciones comerciales.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Métrica | Valor (seed 42, época 11) | Media +/- desv. típica (3 seeds) |
|---|---|---|
| Accuracy (%) | 83,54 | 82,77 +/- 0,82 |
| F1 ponderado (%) | 83,43 | 82,53 +/- 0,94 |

Conjunto de evaluación: split de test retenido de Galaxy10 DECaLS (1.774 imágenes). Las métricas se calculan en la época de mínima pérdida de validación. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks, aunque el autor indica que las tablas del artículo y las métricas por época de todos los runs están en el dataset `vision-foundation-models-benchmark-runs`.

## Requisitos de hardware
- **VRAM estimada para inferencia**: en fp32, los 305,6 millones de parámetros ocupan aproximadamente 1,2 GB de pesos; con activaciones y overhead de inferencia, se estiman entre 2 y 4 GB de VRAM para batches pequeños. En fp16, los pesos se reducen a unos 0,6 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en fp32 con batches moderados. Para entrenamiento o ajuste fino completo, se requiere una GPU con 16 GB o más (el autor usó una sola GPU, sin especificar modelo).
- **GPU de consumo**: cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB), tanto para inferencia como para ajuste fino con batches pequeños.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), y por tanto con TGI (Text Generation Inference no aplica; para visión se usaría un servidor de inferencia estándar), vLLM (soporte de ViT limitado, verificar), o exportación a ONNX/TensorRT para optimización. También es posible usar `optimum` para despliegue optimizado.
- **Latencia y throughput**: no disponibles en la información proporcionada. Para un ViT-Large a 384x384, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, pero no se ha documentado.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos directos en la información proporcionada. La colección Vision Foundation Models Benchmark incluye 40 backbones, pero no se han facilitado las tablas comparativas. Se puede establecer una comparación cualitativa:

| Modelo | Parámetros | Contexto/resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-large-patch32-384-galaxy10-decals-full-v2 | 305,6 M | 384x384 px | Clasificación morfológica (10 clases) | Apache 2.0 | HuggingFace |
| google/vit-large-patch32-384 (base) | 305,6 M | 384x384 px | Clasificación genérica ImageNet | Apache 2.0 | HuggingFace |
| Otros backbones de la colección | No disponible | No disponible | Clasificación morfológica | No disponible | HuggingFace (colección) |

No se dispone de datos de rendimiento de los modelos alternativos en la tarea específica, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias
- **Sesgos de dominio**: el modelo está entrenado exclusivamente con imágenes de Galaxy10 DECaLS; su rendimiento puede degradarse en imágenes de otros surveys con características de ruido, resolución o instrumentación distintas.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas con alta confianza en imágenes ambiguas o fuera de distribución. No se han documentado calibraciones de incertidumbre.
- **Limitaciones de contexto e idioma**: no aplica contexto textual ni capacidades multilingües; es un modelo puramente visual.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación de incluir el aviso de licencia y la atribución correspondiente. El modelo base `google/vit-large-patch32-384` también es Apache 2.0.
- **Caveats para producción**: las métricas son declaradas por el autor y no han sido verificadas de forma independiente (`verified: false`). El modelo se seleccionó por mínima pérdida de validación, lo que puede introducir un ligero sesgo de selección. La verificación de integridad se realizó solo sobre 96 imágenes de test. No se documentan tasas de error por clase, lo que impide evaluar sesgos hacia clases mayoritarias. El paper asociado está en revisión, por lo que la citación definitiva no está disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-large-patch32-384-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-large-patch32-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs y métricas: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: "When foundation models meet astronomical data", *Astronomy and Computing*, versión revisada 2026 (citación pendiente de publicación)
