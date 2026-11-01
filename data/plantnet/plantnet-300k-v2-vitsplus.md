# PlantNet/plantnet-300k-v2-vitsplus

## Resumen

Pl@ntNet-300K-v2 DINOv3 ViT-S+/16 es un clasificador de imágenes de plantas desarrollado por PlantNet, el equipo detrás de la plataforma ciudadana de identificación de biodiversidad vegetal Pl@ntNet. El modelo se obtiene mediante fine-tuning del encoder auto-supervisado `facebook/dinov3-vits16plus-pretrain-lvd1689m` sobre el conjunto de datos Pl@ntNet-300K-v2, y resuelve una tarea concreta de clasificación cerrada: asignar una imagen RGB de 224 × 224 píxeles a una de 1.000 especies vegetales.

La arquitectura es un Vision Transformer DINOv3 de tamaño pequeño-plus (ViT-S+/16), con parches de 16 × 16 píxeles y una dimensión de embedding de 384. El repositorio incluye el encoder fine-tuneado y la cabeza de clasificación en un único fichero `model.pth`, junto con utilidades de carga (`model.py`, `transforms.py`) y metadatos de especies (`species_metadata.csv`). El modelo reporta una precisión de validación de 0,8328 y una precisión de test de 0,8293 sobre las 1.000 clases.

Su relevancia es doble: por un lado, demuestra que un backbone DINOv3 de escala pequeña puede alcanzar precisión alta en una tarea de clasificación fina con distribución de cola larga, como es habitual en biodiversidad vegetal; por otro, la model card lo vincula al artículo arXiv 2604.27178 sobre destilación de conocimiento para monitorización energéticamente eficiente de plantas, lo que sitúa al modelo como posible profesor o referencia en pipelines de compresión. La licencia DINOv3 y el acceso restringido del modelo base condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S+/16 (Vision Transformer con parches de 16 × 16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224 × 224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de especie están en el CSV de metadatos) |
| Licencia | dinov3-license (licencia de Meta para DINOv3, con acceso restringido al modelo base) |
| Formato de pesos | `model.pth` (checkpoint PyTorch con encoder y clasificador) |
| Dimension de embedding | 384 |
| Numero de clases | 1.000 especies |
| Tamano de entrada | 224 × 224 RGB |
| Normalizacion | mean = (0.4425, 0.4695, 0.3266); std = (0.2353, 0.2219, 0.2325) |
| Precision en validacion | 0,8328 |
| Precision en test | 0,8293 |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers (con codigo de carga propio) |
| Inferencia via pipeline | no (campo `inference: false` en la model card) |

## Arquitectura y entrenamiento

El modelo parte de un Vision Transformer DINOv3 ViT-S+/16 preentrenado de forma auto-supervisada por Meta (checkpoint `facebook/dinov3-vits16plus-pretrain-lvd1689m`). Sobre ese backbone se añade una cabeza de clasificación lineal y se realiza un fine-tuning supervisado sobre Pl@ntNet-300K-v2, un conjunto de imágenes de plantas con 1.000 clases y una distribución fuertemente desbalanceada (cola larga) y alta ambigüedad de etiquetas, documentado originalmente en el paper de NeurIPS Datasets and Benchmarks 2021.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos más allá del redimensionado y recorte a 224 × 224 con normalización específica de Pl@ntNet. Tampoco se documenta el uso de RLHF, DPO ni otras fases de alineación, algo esperable en un clasificador de imágenes. La innovación técnica principal es el uso de un backbone DINOv3 de escala pequeña (embedding de 384) que, tras fine-tuning, alcanza una precisión de test de 0,8293 en 1.000 clases, lo que sugiere una buena transferencia de las representaciones auto-supervisadas a dominios de biodiversidad. El trabajo asociado (arXiv 2604.27178) aborda destilación de conocimiento para monitorización energéticamente eficiente de plantas, lo que encaja con el perfil compacto del modelo.

## Capacidades

- Clasificación de imágenes de plantas en 1.000 especies concretas, con salida de logits por clase.
- Extracción de embeddings de imagen de dimensión 384, útiles para búsqueda por similitud, clustering o recuperación visual.
- Procesamiento de imágenes RGB de 224 × 224 con normalización específica de Pl@ntNet.
- Integración con PyTorch y con el ecosistema de Hugging Face mediante `snapshot_download` y carga de código local (`model.py`, `transforms.py`).
- Recuperación del nombre de especie a partir del identificador de clase mediante `species_metadata.csv`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de visión puro.
- No soporta generación de texto, código, matemáticas ni audio.
- Capacidades multilingües no disponibles; el modelo no procesa lenguaje, solo imágenes.

## Casos de uso

- Identificación automática de especies en aplicaciones de ciencia ciudadana: el modelo clasifica una foto de planta en una de 1.000 especies con precisión de test de 0,8293, suficiente para prefiltrar candidatos antes de la validación humana en plataformas tipo Pl@ntNet.
- Monitorización de biodiversidad en campo: integrado en trampas de cámara o estaciones de captura, permite etiquetar automáticamente flora en estudios ecológicos con imágenes de 224 × 224 y un backbone compacto de embedding 384.
- Indexación y búsqueda visual de herbarios digitales: los embeddings de 384 dimensiones permiten construir índices vectoriales para recuperar imágenes similares o agrupar especímenes por similitud visual.
- Preetiquetado en pipelines de anotación: el modelo genera una especie candidata y su logit asociado, lo que acelera la revisión manual en proyectos de etiquetado de imágenes botánicas.
- Destilación de conocimiento hacia modelos más pequeños: el artículo asociado (arXiv 2604.27178) plantea el uso de este clasificador como profesor para entrenar estudiantes energéticamente eficientes en dispositivos de borde.
- Control de calidad en agricultura y jardinería: clasificación de especies en imágenes capturadas por usuarios o drones para verificar inventarios de plantas, con la salvedad de que solo cubre las 1.000 especies del dataset.
- Investigación en clasificación de cola larga: sirve como baseline reproducible para estudiar el efecto del fine-tuning de DINOv3 en datasets con alta ambigüedad de etiquetas y distribución desbalanceada.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las métricas internas del autor sobre Pl@ntNet-300K-v2:

| Metrica | Valor |
|---|---|
| Precision en validacion | 0,8328 |
| Precision en test | 0,8293 |
| Numero de clases | 1.000 |
| Dimension de embedding | 384 |
| Tamano de entrada | 224 × 224 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible, ya que el modelo es un clasificador de imágenes y no un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,1 GB, lo que sugiere que el checkpoint completo cabe holgadamente en GPUs de consumo, aunque el peso exacto del modelo no se detalla.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para inferencia; el código de ejemplo usa `cuda` si está disponible y cae a `cpu` en caso contrario.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) dada la escala del repositorio y la arquitectura ViT-S+.
- Opciones de despliegue: el modelo no se carga mediante el pipeline estándar de `transformers` (`inference: false`); requiere descargar el repositorio con `snapshot_download` y usar las utilidades `load_model` y `ValTransform` incluidas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El modelo base DINOv3 está sujeto a acceso restringido: es necesario aceptar su licencia y autenticarse en Hugging Face antes de la primera carga.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Contexto/entrada | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PlantNet/plantnet-300k-v2-vitsplus | DINOv3 ViT-S+/16 | 1.000 | 224 × 224 RGB | 0,8293 (test) | dinov3-license | Hugging Face, acceso condicionado por el modelo base |
| facebook/dinov3-vits16plus-pretrain-lvd1689m | DINOv3 ViT-S+/16 preentrenado | no aplica (backbone) | 224 × 224 RGB | no disponible | dinov3-license | Hugging Face, acceso restringido |
| Pl@ntNet-300K (dataset original) | no aplica (dataset) | 1.000 | imágenes de plantas | no disponible | según dataset | Zenodo |

No se dispone en la información proporcionada de otros clasificadores de plantas comparables con métricas publicadas, por lo que la comparativa se limita al backbone base y al dataset de origen.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo solo reconoce las 1.000 especies presentes en Pl@ntNet-300K-v2; cualquier especie fuera de ese conjunto se asignará erróneamente a una de las clases conocidas.
- Riesgo de alucinación: al ser un clasificador cerrado, siempre devuelve una clase con un logit, aunque la imagen no corresponda a ninguna planta o la confianza sea baja; es imprescindible aplicar umbrales de confianza.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; las etiquetas de especie provienen del CSV de metadatos y su idioma no está especificado.
- Restricciones de licencia: la licencia dinov3-license y el acceso restringido del modelo base condicionan el uso comercial; es necesario revisar los términos de Meta para DINOv3 antes de desplegar en producción.
- El modelo no está disponible mediante el pipeline estándar de `transformers`; requiere código de carga propio y gestión manual de dependencias.
- La precisión de 0,8293 en test implica un margen de error de aproximadamente el 17 % en las 1.000 clases, con especial riesgo en clases poco representadas por la distribución de cola larga.
- No se documentan sesgos geográficos o taxonómicos del dataset, pero al provenir de una plataforma ciudadana es probable que exista un sesgo hacia la flora europea y hacia especies frecuentemente fotografiadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/plantnet-300k-v2-vitsplus
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Dataset Pl@ntNet-300K-v2 en Zenodo: https://zenodo.org/records/10419064
- Articulo asociado (arXiv 2604.27178): https://arxiv.org/abs/2604.27178
- Pl@ntNet (sitio principal): https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/fr
- Documentacion de Pl@ntNet: https://docs.plantnet.org/fr/tutorials/install-plantnet/
