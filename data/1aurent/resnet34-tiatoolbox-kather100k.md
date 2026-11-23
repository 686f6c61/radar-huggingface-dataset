# 1aurent/resnet34.tiatoolbox-kather100k

## Resumen
El modelo `1aurent/resnet34.tiatoolbox-kather100k` es un clasificador de imágenes basado en la arquitectura ResNet34, exportado al formato de la librería `timm` y entrenado por el Tissue Image Analytics (TIA) Centre de la Universidad de Warwick sobre el conjunto de parches histológicos "kather100k" (también conocido como NCT-CRC-HE). Su propósito es la clasificación de tejido histológico en imágenes de patología digital, una tarea clave en flujos de análisis de cáncer colorrectal asistido por computación.

Con 21,3 millones de parámetros y una entrada fija de 224 x 224 x 3, es un modelo compacto y ligero (repo de 0,1 GB) pensado para integrarse en pipelines de patología computacional, especialmente dentro del ecosistema TIAToolbox. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que recibe una imagen y devuelve un vector de características o una predicción de clase.

Su relevancia actual radica en que ofrece una alternativa reproducible y de pesos abiertos (safetensors) para tareas de clasificación de tejido, con licencia CC-BY-4.0 que permite uso comercial con atribución. Es útil como extractor de características o clasificador base en proyectos de histología digital, y como referencia para comparar con modelos de patología de mayor tamaño.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 (red neuronal convolucional residual) |
| Parametros totales | 21.306.313 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 x 224 x 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades linguisticas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Se trata de una ResNet34 estándar, una CNN residual con bloques de identidad y proyección, adaptada a clasificación de imágenes de 224 x 224 x 3 canales. El modelo se entrenó sobre el dataset kather100k (NCT-CRC-HE), compuesto por parches de histología de tejido colorrectal humano teñido con H&E, con etiquetas de clase de tejido (por ejemplo, tejido adiposo, músculo liso, mucosa, debris, entre otras). El autor del repo es `1aurent`, que lo publica como exportación compatible con `timm` a partir del modelo original del TIA Centre.

No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento (no aplica), composición precisa del dataset, ni si hubo etapas de ajuste fino adicionales, RLHF o DPO (no aplicables a un clasificador de imágenes). La innovación destacable es su integración con TIAToolbox y su disponibilidad como backbone de extracción de características (`num_classes=0`) además de clasificador.

## Capacidades
- Clasificación de imágenes de parches histológicos en clases de tejido del dataset kather100k.
- Extracción de embeddings/features de imágenes (uso como backbone con `num_classes=0`).
- Procesamiento de imágenes RGB de 224 x 224 con transformaciones estándar de `timm` (resize y normalización).
- Integración con la librería `timm` mediante `timm.create_model("hf-hub:...")`.
- Compatible con flujos de TIAToolbox para patología computacional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de parches histológicos.

## Casos de uso
- Clasificación de parches de tejido en pipelines de patología digital: el modelo recibe parches de 224 x 224 y devuelve la clase de tejido, útil para segmentar y catalogar regiones en imágenes de portaobjetos completos (WSI) dentro de TIAToolbox.
- Extracción de características para modelos posteriores: usando `num_classes=0` se obtienen embeddings que pueden alimentar clasificadores o modelos de agrupamiento en estudios de histología.
- Preprocesado en investigación sobre cáncer colorrectal: permite etiquetar automáticamente regiones de tejido antes de análisis morfométricos o de detección de anomalías.
- Control de calidad de datasets histológicos: clasificar parches para detectar clases sobrerrepresentadas o mal etiquetadas en conjuntos de entrenamiento propios.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 21,3 M de parámetros y 0,1 GB, se puede desplegar en CPU o GPU de gama baja para pruebas de concepto.
- Baseline en comparaciones de modelos de patología: sirve como referencia ligera frente a modelos de mayor tamaño (por ejemplo, basados en ViT) en tareas de clasificación de tejido.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; el modelo ocupa aproximadamente 0,1 GB en pesos, por lo que cabe holgadamente en cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Para lotes grandes se recomienda RTX 3060 o superior.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer actuales.
- Opciones de despliegue: `timm` (carga directa desde Hugging Face), exportación a ONNX/TorchScript, y despliegue en servidores de inferencia estándar. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una ResNet34, la latencia por imagen en GPU moderna es del orden de milisegundos, pero no se aportan cifras oficiales.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| 1aurent/resnet34.tiatoolbox-kather100k | 21,3 M | Imagen 224 x 224 x 3 | CC-BY-4.0 | Hugging Face (timm) |
| Otros backbones de TIAToolbox (p. ej., ResNet50) | no disponible | Imagen 224 x 224 x 3 | según modelo original | TIAToolbox / Hugging Face |
| Modelos de patología basados en ViT (p. ej., familia HistoSSL) | no disponible | Parches histológicos | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias
- Modelo especializado exclusivamente en parches histológicos de tejido colorrectal teñido con H&E; no es un modelo de propósito general ni de lenguaje.
- Riesgo de degradación fuera de distribución: imágenes con otras tinciones, órganos o resoluciones pueden producir predicciones poco fiables.
- Sesgos potenciales derivados del dataset kather100k (composición, centro de origen de las muestras), no documentados en la información disponible.
- No apto para diagnóstico clínico sin validación externa; es una herramienta de investigación.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar el trabajo original (Pocock et al., 2022) y respetar los términos.
- No se documentan cuantizaciones ni optimizaciones específicas; el rendimiento en producción dependerá del pipeline de preprocesado.
- No dispone de benchmarks publicados en la información proporcionada, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces
- Hugging Face: https://huggingface.co/1aurent/resnet34.tiatoolbox-kather100k
- Repositorio TIAToolbox: https://github.com/TissueImageAnalytics/tiatoolbox
- Documentación del dataset kather100k: https://tia-toolbox.readthedocs.io/en/latest/_autosummary/tiatoolbox.models.dataset.info.KatherPatchDataset.html
- Paper TIAToolbox (Communications Medicine, 2022): https://www.nature.com/articles/s43856-022-00186-5
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Centro TIA (Universidad de Warwick): https://warwick.ac.uk/fac/cross_fac/tia/
