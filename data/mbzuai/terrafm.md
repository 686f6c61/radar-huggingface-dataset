# MBZUAI/TerraFM

## Resumen

TerraFM es un modelo fundacional de visión por computador para observación de la Tierra (Earth Observation, EO) desarrollado por MBZUAI (Mohamed bin Zayed University of Artificial Intelligence) a través de su grupo Oryx. Se trata de un modelo basado en un backbone ViT (Vision Transformer) disenado para procesar de forma unificada datos multisensor: imágenes ópticas de Sentinel-2 (niveles L1C y L2A) y datos radar SAR de Sentinel-1. El modelo se preentrenó sobre 18,7 millones de teselas (aproximadamente 23 billones de píxeles) del dataset Major-TOM, lo que lo convierte en uno de los modelos fundacionales de EO con mayor volumen de datos de entrenamiento publicados.

El problema que resuelve TerraFM es la fragmentación de los modelos de EO: la mayoría de modelos existentes están especializados en una sola modalidad o sensor. TerraFM unifica la entrada de varios sensores mediante patch embeddings específicos por modalidad y un mecanismo de fusión por cross-attention adaptativa. Además, incorpora una regularización de doble centrado (dual-centering) para mitigar el sesgo hacia distribuciones de cobertura del suelo de cola larga, usando estadísticas de ESA WorldCover.

El modelo fue aceptado en ICLR 2026 y se publica bajo licencia MIT. Está disponible en dos variantes, TerraFM-B (ViT-Base) y TerraFM-L (ViT-Large), ambas con entrada de 224×224 píxeles. Su relevancia actual radica en que establece un nuevo estado del arte en los benchmarks GEO-Bench y Copernicus-Bench, superando a modelos previos como Galileo, Prithvi y DOFA en tareas de clasificación, segmentación y detección de deslizamientos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con patch embeddings específicos por modalidad y fusión por cross-attention adaptativa |
| Parámetros totales | No disponible (variantes ViT-Base y ViT-Large; el número exacto no se especifica en la información proporcionada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (entrada de imagen fija de 224×224 píxeles) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state dict, según el ejemplo de uso con `torch.load`) |

## Arquitectura y entrenamiento

TerraFM se fundamenta en un backbone ViT y emplea un marco de aprendizaje contrastivo estudiante-profesor (student-teacher contrastive framework) combinado con aumentación de modalidad. Cada modalidad de entrada (Sentinel-1 SAR, Sentinel-2 L1C y Sentinel-2 L2A) dispone de su propio patch embedding, de modo que el modelo selecciona el stem adecuado según el producto de origen. La fusión de información entre sensores se realiza mediante cross-attention adaptativa a nivel de parche, lo que permite agregar dinámicamente información de múltiples sensores.

El preentrenamiento se llevó a cabo sobre 18,7 millones de teselas globales del dataset Major-TOM, que abarca aproximadamente 23 billones de píxeles. Una innovación destacable es la regularización de doble centrado (dual-centering), que utiliza estadísticas de cobertura del suelo de ESA WorldCover para mitigar el sesgo hacia clases mayoritarias en distribuciones de cola larga. El modelo utiliza entradas de teselas grandes para codificar un contexto espacial más amplio. No se especifica en la información disponible si se emplearon técnicas de RLHF o DPO (no aplicables típicamente a modelos de visión), ni el número exacto de tokens de entrenamiento.

## Capacidades

- Extracción de representaciones visuales (embeddings CLS) para imágenes de observación de la Tierra en múltiples sensores.
- Procesamiento unificado de Sentinel-1 SAR (bandas VV, VH en dB) y Sentinel-2 óptico (L1C y L2A, 12 bandas).
- Clasificación de cobertura del suelo (evaluado mediante k-NN y fine-tuning).
- Segmentación semántica de imágenes satelitales.
- Detección de deslizamientos (landslide detection).
- Generalización geográfica y entre modalidades, según los benchmarks GEO-Bench y Copernicus-Bench.
- No soporta tool calling, function calling, agentes ni generación de texto (es un modelo puramente visual).
- No dispone de capacidades multilingües ni de modo de razonamiento (thinking mode).

## Casos de uso

- Clasificación de cobertura del suelo a gran escala: el modelo puede generar embeddings de imágenes Sentinel-2 y usarse con un clasificador k-NN o fine-tuning para mapear tipos de suelo en regiones extensas, aprovechando su preentrenamiento sobre 18,7 millones de teselas globales.
- Monitorización de cultivos y agricultura: procesando series temporales de imágenes Sentinel-2 L2A, TerraFM puede extraer representaciones para clasificar tipos de cultivo y detectar cambios fenológicos, beneficiándose de su robustez ante distribuciones de cola larga.
- Detección de deslizamientos y riesgos geológicos: el modelo ha sido evaluado específicamente en tareas de landslide detection, por lo que puede integrarse en sistemas de alerta temprana que combinen datos SAR y ópticos.
- Fusión de datos SAR y ópticos para zonas nubladas: gracias a sus patch embeddings específicos por modalidad y la cross-attention, TerraFM puede combinar Sentinel-1 SAR (que penetra nubes) con Sentinel-2 óptico para monitorizar regiones con cobertura nubosa persistente.
- Segmentación semántica para planificación urbana: mediante fine-tuning de la cabeza de segmentación, el modelo puede delimitar áreas urbanas, infraestructuras y zonas verdes a partir de imágenes satelitales de alta resolución.
- Monitorización medioambiental y deforestación: los embeddings del modelo permiten detectar cambios en la cobertura forestal comparando representaciones de imágenes de distintas fechas, con la ventaja de su entrenamiento multirregional.
- Investigación en teledetección: como modelo fundacional preentrenado, sirve como base para fine-tuning en tareas downstream específicas (por ejemplo, BigEarthNet multilabel) reduciendo la necesidad de datos etiquetados.

## Benchmarks y rendimiento

La model card incluye resultados de clasificación k-NN (Top-1 para tareas de etiqueta única y F1 para BigEarthNet multilabel). Los datos disponibles en la información proporcionada están incompletos (la tabla se corta), pero se recogen los siguientes:

| Modelo | Backbone | m-EuroSat (100%) | m-EuroSat (1%) | m-BigEarthNet (100%) | m-BigEarthNet (1%) | m-So2Sat (100%) | m-So2Sat (1%) | m-Brick-Kiln (100%) |
|---|---|---|---|---|---|---|---|---|
| TerraFM | ViT-Base / ViT-Large | No disponible (tabla truncada) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card afirma que TerraFM supera a Galileo, Prithvi y DOFA en múltiples tareas de EO y establece un nuevo estado del arte en GEO-Bench y Copernicus-Bench, pero los valores numéricos concretos no están completos en la información disponible. No se han podido extraer cifras verificables de MMLU, HumanEval o GSM8K (no aplicables a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un ViT-Base con entrada 224×224, la inferencia típica requiere aproximadamente 2-4 GB de VRAM; para ViT-Large, en torno a 6-10 GB, aunque estas cifras son estimaciones generales y no están confirmadas en la información proporcionada.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del backbone, una GPU consumer como RTX 3090 o RTX 4090 sería suficiente para inferencia en ambas variantes.
- Cabe en GPU consumer: previsiblemente sí para ambas variantes (ViT-Base y ViT-Large) en inferencia, aunque no se confirma en la documentación.
- Opciones de despliegue: el modelo se distribuye como módulo Python standalone (`terrafm.py`) con pesos en `.pth` cargables mediante `torch.load`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Backbone | Modalidades | Datos de preentrenamiento | Licencia | Estado |
|---|---|---|---|---|---|---|
| TerraFM | MBZUAI | ViT-Base / ViT-Large | Sentinel-1 SAR, Sentinel-2 L1C/L2A | 18,7M teselas (~23T píxeles), Major-TOM | MIT | Disponible en HF |
| Galileo | NASA / IBM | ViT (no especificado) | Sentinel-1, Sentinel-2 | No disponible en esta ficha | No disponible | Referenciado como baseline |
| Prithvi | NASA / IBM | ViT | Sentinel-2 (principalmente) | No disponible en esta ficha | No disponible | Referenciado como baseline |
| DOFA | No disponible | ViT | Multimodal EO | No disponible en esta ficha | No disponible | Referenciado como baseline |

Según la model card, TerraFM supera a Galileo, Prithvi y DOFA en los benchmarks GEO-Bench y Copernicus-Bench. Los detalles numéricos de la comparación no están completos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo aborda el sesgo de cola larga mediante dual-centering con estadísticas de ESA WorldCover, pero persisten posibles sesgos derivados de la distribución geográfica del dataset Major-TOM.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las representaciones pueden producir predicciones erróneas en regiones o modalidades poco representadas en el preentrenamiento.
- Limitaciones de contexto o idioma: la entrada está fijada a 224×224 píxeles; no procesa texto ni múltiples idiomas. El rendimiento puede degradarse si no se usa el preprocesado exacto (`normalize()` con las estadísticas de preentrenamiento); la model card advierte explícitamente de no sustituir estas estadísticas por z-scoring por dataset.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución. No obstante, debe verificarse el cumplimiento de las licencias de los datasets de origen (Major-TOM) para usos derivados.
- Caveats para producción: es un modelo de extracción de características (encoder), no un modelo generativo; requiere cabezas de clasificación o segmentación entrenadas para tareas concretas. La selección del stem (`is_l2a`) y de las estadísticas debe corresponder al nivel del producto Sentinel-2. Si falta alguna banda, debe normalizarse las disponibles y poner a cero el canal ausente.

## Enlaces

- Hugging Face: https://huggingface.co/MBZUAI/TerraFM
- Paper (arXiv): https://arxiv.org/abs/2506.06281
- Repositorio GitHub: https://github.com/mbzuai-oryx/TerraFM
- Dataset Major-TOM: https://huggingface.co/Major-TOM
- Model Zoo (Hugging Face): https://huggingface.co/MBZUAI/TerraFM
