# matthieulel/swinv2-large-patch4-window12-192-22k-galaxy10-decals-full-v2

## Resumen

El modelo `swinv2-large-patch4-window12-192-22k-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-large-patch4-window12-192-22k`, un transformer jerárquico con atención por ventanas desplazadas, sobre el conjunto de datos Galaxy10 DECaLS, que consta de 10 clases morfológicas y 17.736 imágenes.

El modelo resuelve una tarea concreta y acotada: asignar una de diez categorías morfológicas a una imagen de galaxia procedente del sondeo DECaLS. Forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en una pieza de un benchmark reproducible más que en un modelo de propósito general.

Con 195,2 millones de parámetros y una entrada fija de 192x192 píxeles, es relevante ahora porque ofrece un punto de referencia cuantificado y verificable para la adaptación de modelos de visión fundacionales a datos astronómicos, con métricas por época publicadas y una comprobación de integridad de pesos documentada. No es un modelo generativo ni conversacional: no procesa texto ni mantiene diálogos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas) |
| Parámetros totales | 195.218.302 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 192x192 px) |
| Tipos de cuantización | no disponible (el autor solo documenta pesos en safetensors, precisión fp32 en entrenamiento) |
| Idiomas soportados | no aplica (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 0,8 GB |
| Pipeline | image-classification |
| Número de clases | 10 (morfología galáctica, Galaxy10 DECaLS) |
| Resolución de entrada | 192x192 px (redimensionado y recorte central) |
| Modelo base | microsoft/swinv2-large-patch4-window12-192-22k |

## Arquitectura y entrenamiento

La arquitectura es Swin Transformer V2 en configuración *large*, con parches de 4x4 píxeles y ventanas de atención de 12x12, preentrenada por Microsoft a resolución 192 y con el esquema de preentrenamiento en 22k clases (ImageNet-22k). Swin V2 introduce mejoras sobre Swin V1 orientadas a estabilizar el entrenamiento a mayor resolución y escala: normalización coseno en la atención, logaritmo continuo en la posición relativa de los sesgos y técnicas de regularización para el ajuste fino. El modelo ajustado sustituye la cabeza original por una capa lineal única de diez salidas.

El ajuste fino se realizó sobre Galaxy10 DECaLS con el protocolo revisado del artículo citado, idéntico para los 40 backbones del benchmark. Los datos se dividen de forma estratificada: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test se mantiene como conjunto reservado). Se usó AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. La aumentación consistió en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio; en evaluación, redimensionado y recorte central a 192x192 con la normalización del procesador de imágenes del checkpoint. El epoch seleccionado (6 de 30) es el de mínima pérdida de validación. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias del sondeo DECaLS.
- Extracción de características visuales de alta capacidad (195 M de parámetros) mediante un backbone Swin V2 preentrenado en ImageNet-22k.
- Ajuste fino completo: todos los parámetros del backbone fueron actualizados, no solo la cabeza de clasificación.
- Reproducibilidad documentada: métricas por época, semillas múltiples (42, 1, 2) e índices de los splits publicados en el dataset asociado.
- Comprobación de integridad de pesos: el autor verificó que las predicciones del checkpoint recargado coinciden al 100% con los logits guardados en las primeras 96 imágenes de test (diferencia absoluta máxima de 6,20e-06).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni modo *thinking*. Es exclusivamente un clasificador discriminativo de imágenes.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo asigna una de diez clases a cada imagen de galaxia procedente de DECaLS, lo que permite procesar lotes de recortes de sondeos de imagen sin intervención manual y con una precisión de test documentada del 84,05%.
- Etiquetado asistido para catálogos astronómicos: dado un conjunto de imágenes sin etiquetar, el modelo genera predicciones que pueden usarse como preetiquetado para revisión humana, reduciendo el coste de construir catálogos morfológicos a gran escala.
- Selección de candidatas para inspección visual: las predicciones con menor confianza (logits próximos entre clases) pueden filtrarse para que un experto revise solo los casos ambiguos, optimizando el tiempo de astrónomos y voluntarios.
- Benchmark de adaptación de modelos fundacionales: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve para comparar el rendimiento de Swin V2 frente a otros backbones (ViT, ConvNeXt, etc.) en la misma tarea y con las mismas particiones de datos.
- Estudio de morfología galáctica a escala de sondeo: al ser un modelo ligero (0,8 GB, 195 M de parámetros) puede desplegarse en clústeres con GPUs modestas para clasificar decenas de miles de recortes en pocas horas.
- Reproducción de investigación: investigadores que trabajen en adaptación de modelos de visión a datos astronómicos pueden cargar este checkpoint con `transformers` y reproducir exactamente las métricas publicadas, dado que el autor documenta semillas, épocas e índices de split.
- Docencia y experimentación en visión por computador aplicada: como ejemplo completo de ajuste fino con receta detallada (AdamW, warm-up, aumentación, selección por validación), es útil en cursos y talleres sobre transferencia de aprendizaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false` en el model-index). Conjunto de test reservado de Galaxy10 DECaLS, 1.774 imágenes.

| Métrica | Valor (semilla 42, época 6) | Media ± desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy | 84,05% | 84,37 ± 0,65% |
| F1 ponderado | 83,60% | 83,98 ± 0,72% |

Evolución por épocas (semilla 42, selección en época 6 por mínima pérdida de validación):

| Época | Pérdida val. | Acc. val. | Acc. test | F1 pond. test |
|---|---|---|---|---|
| 1 | 0,8284 | 69,79% | 71,42% | 69,51% |
| 3 | 0,5546 | 81,91% | 81,57% | 81,13% |
| 6 (seleccionada) | 0,4670 | 84,72% | 84,05% | 83,60% |
| 11 | 0,4816 | 86,19% | 84,84% | 84,53% |
| 18 | 0,5941 | 85,46% | 85,68% | 85,42% |
| 24 | 0,6586 | 85,40% | 84,95% | 84,94% |
| 30 | 0,7194 | 85,06% | 85,34% | 85,27% |

Se observa que la pérdida de validación aumenta tras la época 6 mientras la accuracy de test sigue mejorando hasta épocas posteriores (máximo de 85,68% en la época 18), lo que indica un desajuste entre la métrica de selección y el rendimiento final. El autor selecciona la época 6 por protocolo, no por máximo rendimiento en test. No se han publicado en la información disponible resultados comparativos de otros backbones del mismo benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,5 GB en fp32 para un lote pequeño (el checkpoint pesa 0,8 GB y el modelo tiene 195 M de parámetros); en fp16 o bf16 el peso se reduce a unos 0,4 GB, aunque el autor no documenta cuantizaciones ni pesos de precisión reducida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32 con lotes pequeños; para evaluación de lotes grandes o ajuste fino, se recomienda una GPU de 16 GB o más (por ejemplo, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que se use un lote reducido.
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification` (soporte nativo documentado); el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a clasificación de imágenes.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una sola GPU en fp32 con TF32 desactivado, lo que da una idea del coste de cómputo, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (swinv2-large-galaxy10-decals-full-v2) | 195,2 M | Clasificación de morfología galáctica (10 clases) | Imagen 192x192 | 84,05% accuracy, 83,60% F1 ponderado en test | Apache 2.0 | Hugging Face, 14 descargas |
| microsoft/swinv2-large-patch4-window12-192-22k | ~197 M (no confirmado en la información) | Clasificación de imágenes general (ImageNet-22k) | Imagen 192x192 | No disponible en esta información | No disponible en esta información | Hugging Face (modelo base) |
| Otras configuraciones del benchmark Vision Foundation Models Benchmark | 40 backbones distintos | Clasificación de morfología galáctica | Variable | No disponibles en esta información | Variable | Colección en Hugging Face |

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de modelos alternativos específicos de morfología galáctica con los que comparar directamente. La comparativa con el modelo base es solo estructural: este checkpoint está especializado en una tarea de 10 clases, mientras que el base está preentrenado en 22k clases de ImageNet.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo clasifica imágenes de galaxias del sondeo DECaLS en diez clases morfológicas; no es un modelo de propósito general y no debe usarse fuera de ese dominio sin un nuevo ajuste fino.
- Sesgos de datos: el rendimiento depende de la distribución de Galaxy10 DECaLS, que puede no representar otros sondeos, profundidades, bandas fotométricas o poblaciones galácticas; el sesgo de selección del sondeo se hereda.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre asigna una de las diez clases, incluso ante imágenes ambiguas, ruidosas o fuera de distribución, sin mecanismo nativo de abstención. Las predicciones de baja confianza deben filtrarse.
- Desajuste de selección de época: la época seleccionada (6) no es la de máximo rendimiento en test (la época 18 alcanza 85,68% de accuracy), por lo que el checkpoint publicado no es el óptimo en test; esto es una decisión de protocolo, no un error, pero conviene tenerlo en cuenta.
- Métricas no verificadas: los resultados del model-index están marcados con `verified: false`; no han sido reproducidos de forma independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del modelo base de Microsoft, que pueden tener sus propias restricciones de atribución.
- Sin soporte multilingüe ni de texto: no procesa lenguaje natural, por lo que no puede integrarse en flujos conversacionales sin un componente adicional.
- Sin cuantizaciones documentadas: no se publican versiones GGUF, ONNX ni int8, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas.
- Repositorio con muy poca tracción (14 descargas, 0 likes) y creado en 2026: no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-large-patch4-window12-192-22k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-large-patch4-window12-192-22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de DOI en la información proporcionada).
