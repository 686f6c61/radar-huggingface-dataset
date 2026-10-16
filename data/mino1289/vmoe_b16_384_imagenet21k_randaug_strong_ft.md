# Mino1289/vmoe_b16_384_imagenet21k_randaug_strong_ft

## Resumen

vmoe_b16_384_imagenet21k_randaug_strong_ft es un clasificador de imágenes basado en V-MoE (Vision Mixture of Experts), la variante dispersa del Vision Transformer propuesta por Google Research en el artículo "Scaling Vision with Sparse Mixture of Experts". El checkpoint original, entrenado por Google, se preentrenó en ImageNet-21k con augmentation RandAugment fuerte y después se ajustó fino sobre ILSVRC2012 (ImageNet-1k); este repositorio de HuggingFace contiene esos pesos convertidos al formato de timm por el usuario Mino1289, lo que permite cargarlos con una sola línea de PyTorch.

El modelo opera sobre imágenes de 384x384 píxeles con parches de 16x16, cuenta con 285.238.504 parámetros totales (según los tensores safetensors del repositorio, que ocupa 1,1 GB) y expone una cabeza de clasificación sobre las 1000 clases de ImageNet-1k. Su interés es doble: por un lado es un backbone de clasificación de alta resolución listo para transfer learning; por otro, es una de las pocas implementaciones públicas de un transformer de visión con capas de mezcla dispersa de expertos reutilizables desde timm.

Es relevante ahora porque la mayoría de los checkpoints MoE disponibles públicamente son de lenguaje, mientras que este permite experimentar con enrutamiento disperso en visión con pesos ya convertidos a safetensors, licencia Apache-2.0 y API estándar de timm. Su adopción en la comunidad es, por el momento, nula: 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer B/16 con capas de mezcla dispersa de expertos (V-MoE); parches de 16x16, entrada de 384x384 |
| Parametros totales | 285.238.504 (segun los tensores safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica: modelo de clasificacion de imagenes, no procesa secuencias de texto |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors a precision completa; la cuantizacion int8/fp16 requiere conversion posterior con PyTorch, ONNX o TensorRT) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de las 1000 clases de ImageNet-1k estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB, cargable con timm) |
| Tarea principal | clasificacion de imagenes (image-classification) |
| Numero de clases de salida | 1000 (ImageNet-1k / ILSVRC2012) |
| Resolucion de entrada | 384x384 |
| Preprocesado | media = desviacion tipica = (0,5, 0,5, 0,5) sobre entradas en [0, 1] (equivalente a value_range=(-1, 1) en JAX) |
| Dataset de preentrenamiento | ImageNet-21k con RandAugment fuerte |
| Dataset de ajuste fino | ILSVRC2012 (ImageNet-1k) |
| Biblioteca | timm (PyTorch) |
| Autor del checkpoint original | Google Research (V-MoE); conversion a timm por Mino1289 |

## Arquitectura y entrenamiento

La familia V-MoE, descrita por Riquelme et al. (2021), parte del Vision Transformer estándar y sustituye parte de los bloques feed-forward densos por capas de mezcla dispersa de expertos: cada token (parche) se enruta hacia un subconjunto de expertos, de modo que la capacidad total de parámetros crece sin que el coste de cómputo por token crezca en la misma proporción. El artículo introduce además mecanismos de equilibrio de carga (auxiliary loss, routing con capacidad limitada) y una técnica de prioridad de enrutamiento para inferencia por lotes. El número exacto de expertos, el valor de top-k y la configuración concreta de enrutamiento de este checkpoint no están documentados en la información disponible.

El entrenamiento consta de dos fases: un preentrenamiento en ImageNet-21k con RandAugment fuerte, seguido de un ajuste fino sobre ILSVRC2012 con 1000 clases de salida. El nombre del checkpoint refleja ambas etapas (`imagenet21k_randaug_strong_ft`). Los pesos originales proceden del bucket `gs://vmoe_checkpoints/vmoe_b16_imagenet21k_randaug_strong_ft_ilsvrc2012` y este repositorio los publica convertidos para timm, preservando el preprocesado JAX original (entradas reescaladas a [-1, 1]). No se documenta en la model card si hubo RLHF, DPO ni ninguna otra fase de alineación, algo que en un clasificador de imágenes no aplica en el sentido habitual.

Al tratarse de una conversión de pesos, no hay innovaciones adicionales sobre el diseño original de V-MoE; el valor añadido del repositorio es la compatibilidad con la API de timm y el formato safetensors.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con entrada de 384x384 píxeles y salida de logits por clase.
- Extracción de características visuales: al ser un modelo de timm, admite `num_classes=0` y `forward_features()` para obtener embeddings de imagen utilizables en recuperación, clustering o detección de duplicados.
- Transfer learning: la cabeza de clasificación puede sustituirse por una nueva para dominios específicos, reutilizando el backbone preentrenado en ImageNet-21k.
- Ajuste fino completo o parcial (por ejemplo, congelando el backbone y entrenando solo la cabeza) sobre datasets propios.
- Inferencia por lotes con imágenes de resolución fija de 384x384, con normalización concreta (media y desviación 0,5 sobre [0, 1]).
- El diseño MoE implica que el coste de cómputo por imagen es inferior al de un modelo denso con el mismo número total de parámetros, según la formulación del artículo; el número de parámetros activos de este checkpoint no está disponible.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, function calling, capacidades de agente, multilingüismo, audio ni visión-lenguaje. Es exclusivamente un clasificador de imágenes.
- No hay modo "thinking", decodificación especulativa ni atención lineal documentados.

## Casos de uso

- Clasificación de imágenes a gran escala en producción: el modelo devuelve directamente logits sobre 1000 clases, por lo que se puede desplegar como servicio de inferencia por lotes con entradas de 384x384; es adecuado cuando el catálogo de categorías coincide total o parcialmente con ImageNet-1k y se prioriza una resolución de entrada alta.
- Transfer learning para dominios verticales: sustituyendo la cabeza de clasificación por una nueva y ajustando fino sobre un dataset propio (por ejemplo, defectos de fabricación o tipos de lesión dermatológica), se aprovecha el preentrenamiento en los 21.843 conceptos de ImageNet-21k. Es la vía habitual para obtener buenos resultados con pocos miles de imágenes etiquetadas.
- Extracción de embeddings para búsqueda visual y deduplicación: usando `forward_features()` se obtienen vectores por imagen que alimentan índices vectoriales para recuperación por similitud, detección de imágenes repetidas o agrupamiento no supervisado de un archivo fotográfico.
- Etiquetado asistido de datasets: el modelo puede preanotar grandes volúmenes de imágenes con sus 1000 clases, dejando a revisión humana únicamente los casos de baja confianza; reduce el coste de construir datasets de clasificación o de filtrado previo.
- Moderación y filtrado de contenido por lotes: como clasificador rápido puede actuar como primer filtro en pipelines de subida de contenido, marcando categorías problemáticas o irrelevantes antes de pasar a modelos más caros (multimodales o de generación).
- Control de calidad e inspección visual industrial: tras un ajuste fino con imágenes de línea de producción, se integra en sistemas de inspección, con la ventaja de que el modelo cabe en GPUs de gama media y la inferencia por lotes es barata.
- Investigación sobre mixture of experts en visión: permite reproducir experimentos de enrutamiento disperso frente a un ViT-B/16 denso entrenado con el mismo régimen, midiendo precisión, coste computacional y comportamiento del router, con la comodidad de cargar los pesos desde timm.
- Despliegue en entornos con recursos limitados: al ocupar 1,1 GB en fp32 (unos 285 MB en int8 tras cuantización), es viable en equipos on-premise o edge con una única GPU consumer, algo que no ocurre con backbones de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye exactitud top-1 ni top-5 sobre ImageNet-1k, ni resultados en otros conjuntos de transferencia (CIFAR, VTAB, etc.). El artículo original de V-MoE sí reporta métricas para sus variantes, pero no se reproducen aquí porque no forman parte de la información proporcionada y no corresponden necesariamente a este checkpoint concreto.

## Requisitos de hardware

- Peso del modelo: aproximadamente 1,14 GB en fp32 (1,1 GB de repositorio), unos 570 MB en fp16/bf16 y unos 285 MB en int8.
- VRAM estimada para inferencia: en torno a 2-4 GB con lote pequeño a 384x384 y precisión mixta, sumando pesos y activaciones; los valores exactos no están publicados y dependen del tamaño de lote y del backend. A mayor lote, el cuello de botella pasa a ser las activaciones (la resolución 384x384 eleva el coste de memoria de forma notable frente a 224x224).
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060 o superiores para entrenamiento ligero; RTX 4090, A100 o H100 para ajuste fino a lote grande o a resolución alta.
- Cabe en GPU de consumo: sí, incluidas RTX 3050/3060, RTX 2060 y superiores en cuantización int8 o fp16 con lotes moderados.
- Opciones de despliegue: timm + PyTorch nativo, exportación a ONNX y ejecución con ONNX Runtime, TorchScript o TensorRT para producción. No es compatible con vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible. No se han publicado medidas de imágenes por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vmoe_b16_384_imagenet21k_randaug_strong_ft | 285.238.504 (total) | ViT-B/16 con MoE disperso, preentrenado en ImageNet-21k y ajustado en ILSVRC2012 | 384x384 | Apache-2.0 | timm / HuggingFace, 0 descargas, 0 likes |
| vit_base_patch16_384.augreg_in21k_ft_in1k (timm) | ~86 M (aproximado) | ViT-B/16 denso, mismo regimen de preentrenamiento y ajuste | 384x384 | Apache-2.0 | timm, ampliamente utilizado |
| vit_large_patch16_384.augreg_in21k_ft_in1k (timm) | ~307 M (aproximado) | ViT-L/16 denso | 384x384 | Apache-2.0 | timm, ampliamente utilizado |
| swin_base_patch4_window12_384 (timm) | ~88 M (aproximado) | Swin Transformer jerarquico | 384x384 | Apache-2.0 | timm |

La comparación se limita a arquitectura, tamaño, resolución y licencia: no hay datos de precisión publicados para el checkpoint V-MoE en la información disponible, y por tanto no se puede establecer una comparación de rendimiento con las alternativas densas. Los recuentos de parámetros de los modelos alternativos son aproximados y corresponden a valores de referencia de timm, no a datos verificados en esta consulta. Frente a un ViT-B/16 denso (86 M), este checkpoint almacena 285 M de parámetros, lo que sugiere una capacidad mayor con un coste de cómputo por imagen potencialmente similar, según el diseño de V-MoE; confirmar esa ventaja requiere medir experimentalmente.

## Limitaciones y advertencias

- Sesgos heredados de los datos: al entrenarse con ImageNet-21k e ILSVRC2012, el modelo reproduce los sesgos geográficos, culturales y de representación de esos conjuntos, con sobrerrepresentación de determinadas categorías de objetos occidentales y fuerte desequilibrio entre clases.
- Alucinación: en el sentido generativo no aplica, pero sí existe riesgo de clasificaciones erróneas con alta confianza (falsos positivos) ante imágenes fuera de distribución, imágenes sintéticas o clases no presentes en ImageNet-1k.
- Sólo 1000 clases de salida: cualquier categoría ajena a ImageNet-1k se asignará forzosamente a una de las clases existentes; para dominios específicos es obligatorio un ajuste fino con una cabeza nueva.
- Cobertura limitada de contexto de imagen: la entrada es fija a 384x384; objetos pequeños o detalles finos pueden perderse y las imágenes de otras resoluciones deben redimensionarse, alterando la relación de aspecto si no se recorta adecuadamente.
- No hay capacidades multilingües, de texto, agentes ni tool calling; no es un modelo multimodal y no se puede usar como base para tareas de visión-lenguaje sin añadir componentes externos.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el fichero de atribución. Hay que verificar igualmente las condiciones de los pesos originales de Google Research y de los datasets de entrenamiento (ImageNet-21k e ILSVRC2012 tienen sus propios términos de uso, que afectan al uso comercial derivado).
- Caveat de producción: la model card no documenta precisión, configuración de expertos, número de parámetros activos ni pruebas de robustez. Todo despliegue debería validar el modelo sobre un conjunto propio antes de asumir su comportamiento, y compararlo con un ViT-B/16 denso para justificar la sobrecarga de gestión que implica un MoE.
- Adopción nula: 0 descargas y 0 likes; es una conversión de un tercero, no un checkpoint oficial mantenido por Google o HuggingFace, por lo que no hay garantías de soporte ni de actualizaciones.
- Riesgo de dependencia del enrutamiento: en modelos MoE, el comportamiento de inferencia puede variar según el lote y el backend usado, y la conversión de pesos JAX a PyTorch puede introducir pequeñas discrepancias numéricas que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mino1289/vmoe_b16_384_imagenet21k_randaug_strong_ft
- Repositorio oficial de V-MoE (Google Research): https://github.com/google-research/vmoe
- Paper "Scaling Vision with Sparse Mixture of Experts" (Riquelme et al., 2021): https://arxiv.org/abs/2102.11972
- Repositorio de timm (pytorch-image-models): https://github.com/huggingface/pytorch-image-models
- Origen de los pesos originales citado en la model card: gs://vmoe_checkpoints/vmoe_b16_imagenet21k_randaug_strong_ft_ilsvrc2012 (bucket de Google Cloud Storage, no es una URL HTTP navegable)
- Documentacion de timm en HuggingFace: https://huggingface.co/docs/timm
