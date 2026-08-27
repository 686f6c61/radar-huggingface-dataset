# OneScience-Group/SkySense

## Resumen

SkySense es un modelo fundacional de teledetección multimodal y temporal desarrollado por Ant Group, la Universidad de Wuhan y MYbank, presentado en CVPR 2024. Su objetivo es proporcionar representaciones unificadas para la interpretación universal de imágenes de observación de la Tierra, abordando tareas como clasificación, segmentación semántica, detección de objetos y detección de cambios. El modelo integra de forma conjunta imágenes ópticas de alta resolución, series temporales multiespectrales de Sentinel-2, series temporales SAR de Sentinel-1 y contexto geográfico.

El modelo fue preentrenado con 21,5 millones de grupos de muestras temporales multimodales espacialmente registradas, lo que le permite operar tanto en modo unimodal como multimodal, y tanto en escenarios estáticos como temporales. Según fuentes de prensa, el modelo cuenta con 2 mil millones de parámetros y su rendimiento supera al de modelos similares en 17 escenarios de prueba. La versión publicada en este repositorio de HuggingFace incluye el código de entrenamiento, inferencia y evaluación, aunque los pesos preentrenados originales se proporcionarán en una actualización futura.

La relevancia actual de SkySense radica en que aborda uno de los retos principales de la teledetección: la fusión efectiva de múltiples fuentes de datos heterogéneas (óptico, multiespectral y SAR) con información temporal, algo esencial para aplicaciones como monitorización de cultivos, gestión de desastres o seguimiento del cambio climático. El repositorio incluye además soporte para entornos GPU y DCU, y una integración con la plataforma OneCode de OneScience.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (diseño basado en ViT, con módulos de fusión cross-modal y temporal) |
| Parametros totales | 2 mil millones (según fuentes de prensa; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, para documentación y etiquetas; el modelo procesa imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints .pt; safetensors no especificado) |

## Arquitectura y entrenamiento

SkySense emplea una arquitectura Transformer multimodal diseñada para procesar conjuntamente cuatro modalidades de entrada: imágenes ópticas de alta resolución, series temporales multiespectrales de Sentinel-2, series temporales SAR de Sentinel-1 y contexto geográfico. El modelo integra módulos de fusión cross-modal y atención temporal para aprender representaciones unificadas que capturen tanto la información espacial como la evolución temporal de las escenas observadas.

El preentrenamiento se realizó sobre 21,5 millones de grupos de muestras multimodales temporalmente registradas, que incluyen datos de Sentinel-1 y Sentinel-2 (disponibles a través de Copernicus Data Space) e imágenes comerciales de alta resolución como WorldView. El conjunto de datos completo registrado no está disponible públicamente. El repositorio incluye un script para generar datos sintéticos (NPZ) que permiten validar el pipeline completo de entrenamiento, inferencia, evaluación y visualización, aunque estos datos sintéticos no reproducen los resultados del paper.

Una innovación destacable es el diseño orientado a la fusión multimodal con información temporal, que permite al modelo manejar tanto escenarios unimodales como multimodales, y tanto imágenes estáticas como series temporales. El modelo fue desarrollado originalmente por Ant Group, la Universidad de Wuhan y MYbank, y el paper correspondiente fue aceptado en CVPR 2024. Una versión mejorada, SkySense++, fue publicada posteriormente en Nature Machine Intelligence 2025, con preentrenamiento sobre 27 millones de imágenes multimodales.

## Capacidades

- Segmentación semántica de imágenes de teledetección: fusión de características ópticas, multiespectrales y SAR para predecir clases de cobertura terrestre a nivel de píxel.
- Clasificación de imágenes de teledetección, tanto unimodal como multimodal, en escenarios estáticos y temporales.
- Detección de objetos en imágenes de observación de la Tierra.
- Detección de cambios entre imágenes temporales, aprovechando la información temporal de las series de Sentinel-1 y Sentinel-2.
- Representación unificada para múltiples tareas de interpretación de observación de la Tierra, lo que permite su adaptación a tareas downstream mediante fine-tuning.
- Capacidad de procesar múltiples modalidades de entrada: óptico de alta resolución, multiespectral, SAR y contexto geográfico.
- Soporte para entrenamiento distribuido multi-GPU con `torchrun`.
- Compatibilidad con entornos GPU (CUDA) y DCU (con DTK 25.04.2 o superior).

## Casos de uso

- Monitorización agrícola: el modelo puede clasificar tipos de cultivo y detectar cambios fenológicos combinando series temporales de Sentinel-2 y Sentinel-1, lo que permite estimar superficies cultivadas y detectar anomalías en el crecimiento.
- Gestión de desastres naturales: la fusión de imágenes ópticas y SAR permite evaluar daños tras inundaciones o terremotos incluso con cobertura nubosa, ya que el SAR penetra las nubes.
- Cartografía de cobertura terrestre: segmentación semántica de alta resolución para actualizar mapas de uso del suelo, integrando datos ópticos comerciales y multiespectrales de Sentinel-2.
- Detección de deforestación: el análisis temporal de series de imágenes permite identificar cambios en la cobertura forestal a lo largo del tiempo, combinando información óptica y SAR.
- Seguimiento urbano: detección de cambios en áreas urbanas mediante comparación de imágenes temporales, útil para planificación urbana y control de expansión.
- Investigación climática: análisis de series temporales de variables biofísicas (como humedad del suelo o biomasa) derivadas de datos SAR y multiespectrales para estudios de cambio climático.
- Validación de pipelines de IA4S: el repositorio incluye datos sintéticos para validar el flujo completo de entrenamiento, inferencia y evaluación sin necesidad de datos reales, útil para desarrollo y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en la model card del repositorio. Según fuentes de prensa, el modelo supera a modelos similares en 17 escenarios de prueba, pero no se proporcionan cifras concretas. El paper original (arXiv:2312.10115) contiene los resultados detallados de los experimentos, pero no están incluidos en la documentación del repositorio. La versión mejorada SkySense++ (Nature Machine Intelligence 2025) reporta capacidades robustas de generalización y few-shot, pero los datos específicos no están disponibles en los materiales proporcionados.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos; la CPU puede usarse para importación y verificación de conectividad a pequeña escala, pero el entrenamiento e inferencia completos serán lentos.
- Para usuarios de DCU, se requiere DTK 25.04.2 o superior, o la versión recomendada por OneScience que coincida con el clúster.
- El entorno de entrenamiento se instala mediante `pip install onescience[earth-gpu]` (para GPU) o `onescience[earth-dcu]` (para DCU), con Python 3.11.
- El entrenamiento multi-GPU se lanza con `torchrun --nproc_per_node=8`, lo que sugiere que el modelo puede distribuirse en múltiples GPUs.
- No se especifican requisitos de VRAM concretos ni GPUs recomendadas por modelo (A100, H100, RTX 4090, etc.).
- No se mencionan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el repositorio proporciona scripts propios de entrenamiento e inferencia.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Preentrenamiento | Publicación | Licencia |
|---|---|---|---|---|---|
| SkySense | 2 mil millones (según prensa) | Óptico HR, Sentinel-2, Sentinel-1 SAR, contexto geográfico | 21,5 M grupos de muestras | CVPR 2024 | Apache 2.0 |
| SkySense++ | no disponible | Óptico, multiespectral, SAR | 27 M imágenes multimodales | Nature Machine Intelligence 2025 | no disponible |
| Otros modelos de teledetección (p.ej., SatMAE, Scale-MAE) | no disponible | Principalmente óptico/multiespectral | Varía | Varía | Varía |

La comparativa se limita a SkySense++ por ser la evolución directa del modelo. No se dispone de información suficiente sobre otros modelos comparables de la misma categoría en los materiales proporcionados.

## Limitaciones y advertencias

- El conjunto de datos de preentrenamiento completo (21,5 millones de muestras registradas) no está disponible públicamente y no se incluye en el repositorio. Los usuarios deben preparar sus propios datos siguiendo las indicaciones del README.
- Los pesos preentrenados originales no están disponibles en el repositorio; se proporcionarán en una actualización futura. Los checkpoints generados con datos sintéticos solo validan el pipeline y no proporcionan capacidades reales de interpretación.
- Los datos sintéticos generados con `scripts/fake_data.py` no reproducen los resultados del paper y no deben usarse para evaluar el rendimiento real del modelo.
- Los datos de origen (Sentinel-1, Sentinel-2, WorldView) están sujetos a licencias aplicables que los usuarios deben cumplir; el procesamiento completo (filtrado de nubes, corrección radiométrica, registro espacial, remuestreo, recorte, normalización y preparación de etiquetas) debe realizarse de forma independiente.
- El modelo está orientado a imágenes de teledetección; no es un modelo de lenguaje y no soporta tareas de generación de texto o conversación.
- No se proporcionan datos sobre sesgos, riesgos de alucinación o limitaciones de contexto en la documentación disponible.
- La documentación está en inglés; no hay soporte oficial en español.
- El repositorio está etiquetado con `region:us`, lo que puede implicar consideraciones de cumplimiento normativo para usuarios fuera de Estados Unidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/SkySense
- Paper original (arXiv): https://arxiv.org/abs/2312.10115
- Repositorio oficial SkySense (GitHub): https://github.com/Jack-bo1220/SkySense
- Repositorio SkySense++ (GitHub): https://github.com/kang-wu/SkySensePlusPlus
- Paper SkySense++ (Nature Machine Intelligence): https://www.nature.com/articles/s42256-025-01078-8
- Noticia sobre SkySense (1ai.net): https://www.1ai.net/en/newsflashes/4659.html
- Organización OneScience en HuggingFace: https://huggingface.co/OneScience-Group/models
