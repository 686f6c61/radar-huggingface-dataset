# 1aurent/mobilenetv2_100.tiatoolbox-kather100k

## Resumen

MobileNet-v2 aplicado a clasificación de parches histológicos, publicado por el usuario 1aurent en Hugging Face y entrenado originalmente por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick. El modelo parte de la arquitectura MobileNet-v2 (Variante 100, factor de anchura 1.0) y se ha ajustado sobre el conjunto kather100k, también conocido como NCT-CRC-HE, un dataset de referencia en patología computacional compuesto por parches de tejido de cáncer colorrectal teñidos con H&E.

Con 2.269.513 parámetros totales (2,27 M), es un modelo extremadamente ligero pensado para inferencia rápida y despliegue en entornos con recursos limitados, lo que lo hace adecuado para pipelines de análisis de imágenes de portaobjetos completos (WSI) donde se procesan decenas de miles de parches por muestra. La entrada es de 224 x 224 x 3 y el modelo se distribuye en formato safetensors compatible con la librería timm.

Su relevancia actual radica en dos factores: por un lado, la creciente demanda de herramientas de patología digital que permitan preprocesar y clasificar tejido a gran escala; por otro, su integración con TIAToolbox, la librería end-to-end del TIA Centre para análisis de imágenes de tejido, lo que facilita su uso en flujos de trabajo de investigación oncológica. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNet-v2 (CNN, factor de anchura 1.0, 100) |
| Parámetros totales | 2.269.513 (2,27 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224 x 224 x 3) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | no disponible (no aplica; modelo de clasificación de imágenes) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (compatible con timm) |

## Arquitectura y entrenamiento

MobileNet-v2 es una red neuronal convolucional diseñada para eficiencia computacional mediante convoluciones separables en profundidad (depthwise separable convolutions) y bloques residuales invertidos con cuellos de botella lineales. La variante 100 hace referencia al factor de anchura 1.0, es decir, la configuración estándar de la familia. El modelo recibe imágenes de 224 x 224 píxeles con tres canales y produce un vector de características (o logits de clasificación según la cabeza utilizada).

El ajuste se realizó sobre el dataset kather100k / NCT-CRC-HE, un conjunto de parches de histología de cáncer colorrectal teñidos con hematoxilina y eosina (H&E) que contiene alrededor de 100.000 parches clasificados en ocho clases de tejido (tejido adiposo, fondo, debris, linfocitos, mucosa, músculo liso, estroma normal y tejido tumoral, entre otras según la partición). No se dispone de información detallada sobre el número exacto de épocas, hiperparámetros de entrenamiento, aumentación de datos ni si se aplicaron técnicas de destilación o ajuste fino desde pesos ImageNet. El modelo card original apunta al repositorio de TIAToolbox como fuente del entrenamiento.

No se documentan innovaciones técnicas adicionales más allá del uso de una arquitectura CNN ligera y el ajuste a un dominio específico de patología. El modelo puede utilizarse tanto como clasificador (con cabeza de clasificación) como backbone de extracción de características (con `num_classes=0`).

## Capacidades

- Clasificación de imágenes de parches histológicos en las clases del dataset kather100k / NCT-CRC-HE.
- Extracción de embeddings de imágenes de tejido para tareas posteriores (clustering, recuperación, modelos aguas abajo).
- Procesamiento de imágenes de entrada de 224 x 224 x 3 con transformaciones estándar de timm (redimensionado y normalización).
- Inferencia rápida y ligera: 2,27 M de parámetros permiten ejecución en CPU y GPU de gama baja.
- Integración con TIAToolbox para pipelines de análisis de imágenes de portaobjetos completos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no aplica a un modelo de visión).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de parches en pipelines de patología digital: el modelo puede procesar miles de parches extraídos de una imagen WSI y asignarles una clase de tejido, lo que permite segmentar regiones tumorales, estroma, necrosis o linfocitos de forma automatizada.
- Preprocesamiento para modelos de mayor tamaño: al ser un backbone ligero, puede generar embeddings de parches que alimenten modelos de pronóstico o de detección de subtipos tumorales en etapas posteriores.
- Filtrado de calidad de tejido: en flujos de investigación, se puede usar para descartar parches de fondo, debris o artefactos antes de análisis más costosos, reduciendo el cómputo total.
- Herramienta docente y de investigación en patología computacional: su tamaño reducido y licencia permisiva lo hacen adecuado para experimentos reproducibles en entornos académicos con recursos limitados.
- Integración en TIAToolbox: el modelo se puede cargar desde el hub de Hugging Face mediante timm y utilizarse dentro de los pipelines de la librería para tareas de clasificación de tejido.
- Despliegue en dispositivos edge o entornos con CPU: al tener solo 2,27 M de parámetros, es viable ejecutarlo en estaciones de trabajo sin GPU dedicada o en entornos contenedorizados con restricciones de memoria.
- Generación de características para búsqueda por similitud: los embeddings extraídos pueden indexarse para recuperar parches morfológicamente similares en bases de datos de histología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (2,27 M de parámetros, ~9 MB de pesos); en la práctica, el cuello de botella es el tamaño del lote y las activaciones, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para GPUs de gama alta.
- Cabe en cualquier GPU consumer, incluida GTX 1050 o integradas con suficiente memoria compartida; también es viable en CPU.
- Opciones de despliegue: timm (carga directa desde Hugging Face), TIAToolbox, PyTorch nativo; no se documenta soporte específico para vLLM, llama.cpp u Ollama (no aplica a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| mobilenetv2_100.tiatoolbox-kather100k | 2,27 M | 224 x 224 x 3 | CC-BY-4.0 | Hugging Face (timm) |
| Otros backbones de timm ajustados a kather100k | no disponible | 224 x 224 x 3 | variable | Hugging Face |
| Modelos de patología de mayor tamaño (p. ej., basados en ResNet o ViT) | no disponible | variable | variable | Hugging Face / repositorios académicos |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre parches de cáncer colorrectal teñidos con H&E; su generalización a otros tejidos, tinciones o dominios es limitada y no está documentada.
- No se han publicado métricas de rendimiento (exactitud, F1, AUC) en la información disponible, por lo que no se puede evaluar su calidad objetiva frente a alternativas.
- Riesgo de sesgo de dominio: el dataset kather100k proviene de una fuente concreta de escáneres y centros, lo que puede introducir sesgos en la clasificación de imágenes de otras procedencias.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificaciones erróneas en parches ambiguos o de baja calidad.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero requiere citar adecuadamente el trabajo original (Pocock et al., 2022) y respetar los términos del dataset subyacente.
- No es un modelo de propósito general: no soporta texto, voz, tool calling ni agentes; su uso está restringido a clasificación y extracción de características de imágenes.
- El modelo card no documenta el proceso de entrenamiento completo (épocas, hiperparámetros, aumentación), lo que dificulta la reproducibilidad.
- Para uso clínico, se requiere validación externa y regulatoria; este modelo es una herramienta de investigación, no un dispositivo médico.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/mobilenetv2_100.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset KatherPatchDataset: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Paper TIAToolbox (Pocock et al., 2022): https://www.nature.com/articles/s43856-022-00186-5
- DOI del paper: https://doi.org/10.1038/s43856-022-00186-5
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
- Dataset NCT-CRC-HE en Hugging Face: https://huggingface.co/datasets/1aurent/NCT-CRC-HE
