# BuckAIObservatory/dl-bathy-weights

## Resumen

DL_bathy es un conjunto de pesos preentrenados para estimación de batimetría (profundidad del agua) a partir de imágenes satelitales Sentinel-2 L2A. Lo desarrolla BuckAIObservatory y acompaña al artículo Hsu & Moortgat (2026) publicado en *Remote Sensing* 18(11): 1768. El repositorio no contiene un único modelo, sino los pesos de cinco variantes comparadas en ese trabajo: cuatro segmentadores DeepLabV3+ con distintos encoders (ResNet-50, ResNet-101, ConvNeXt-Large y EfficientNet-B4) y un baseline de Random Forest.

La tarea es regresión por píxel: cada píxel de una escena Sentinel-2 de 12 bandas (B01–B12) recibe una profundidad estimada en metros. La arquitectura es una red totalmente convolucional de segmentación con cabeza de regresión de un canal, construida sobre `segmentation_models_pytorch` con encoders preentrenados en ImageNet. El encoder por defecto es ResNet-50, que según el artículo obtuvo el menor RMSE dentro de región y un rendimiento cercano al mejor en transferencia entre regiones.

Su relevancia es de nicho pero clara: la batimetría satelital (SDB) permite cartografiar aguas someras sin sondeos de barco ni LiDAR, con coste marginal muy bajo. El modelo está entrenado para aguas someras de arrecife y costa (menos de unos 25 m) y se distribuye con licencia MIT, lo que facilita su reutilización en investigación y docencia. El repo ocupa 32,8 GB e incluye checkpoints de mejor validación y de última época, además de metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3+ (segmentation_models_pytorch) con cabeza de entrada de 12 bandas y salida de regresión de 1 canal; baseline adicional de Random Forest |
| Parametros totales | no disponible (depende del encoder; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo convolucional sobre parches de 512 × 512 píxeles) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pth` en precisión de entrenamiento y un `.joblib` para Random Forest) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es imagery multiespectral) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch, cargables con `segmentation_models_pytorch`) y `.joblib` (scikit-learn para el Random Forest) |

## Arquitectura y entrenamiento

El núcleo es DeepLabV3+, una red de segmentación semántica con encoder–decoder y módulo ASPP (Atrous Spatial Pyramid Pooling) para capturar contexto multiescala. En este caso se adapta a regresión: la entrada es un tensor de 12 canales (las bandas B01–B12 de Sentinel-2 L2A) y la salida es un mapa de profundidad de un canal. Los encoders entrenados son ResNet-50, ResNet-101, ConvNeXt-Large (vía timm) y EfficientNet-B4, todos inicializados con pesos de ImageNet. El baseline Random Forest opera sobre las mismas bandas como referencia comparativa.

Los datos de entrenamiento son pares de parches Sentinel-2 y batimetría LiDAR aerotransportada como ground truth. Los parches son de 512 × 512 píxeles, con partición 70/15/15 (entrenamiento/validación/test) y aumento de datos por rotación de 90°, 180° y 270°. Los píxeles de nube y sombra se excluyen mediante la banda SCL. Las escenas se descargaron de Google Earth Engine y las etiquetas se corrigieron por marea con el modelo DTU23 (enero de 2026); el pipeline actual usa geoai-datacubes y pyTMD/EOT20, por lo que reentrenar no reproducirá exactamente estos pesos. Los cuatro modelos DeepLabV3+ se entrenaron con la pérdida ponderada por profundidad SWF (Smooth Weight Function).

## Capacidades

- Estimación de profundidad por píxel en metros sobre aguas someras a partir de reflectancia Sentinel-2 L2A.
- Procesamiento de escenas completas mediante parches de 512 × 512 píxeles.
- Cuatro variantes de encoder intercambiables para ajustar el compromiso precisión/coste computacional.
- Baseline de Random Forest para comparación metodológica.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No procesa audio ni vídeo; la entrada es exclusivamente imagery multiespectral.
- No incorpora enmascarado de nubes, glint o rompientes: el llamante debe aplicarlo aguas arriba.

## Casos de uso

- Cartografía de arrecifes y lagunas someras: el modelo genera mapas de profundidad continuos sobre cualquier escena Sentinel-2 libre de nubes, sustituyendo campañas de sondeo puntuales por cobertura areal completa.
- Reproducción de resultados científicos: los checkpoints permiten replicar las tablas del artículo Hsu & Moortgat (2026) y servir de base para comparaciones con otros métodos SDB.
- Evaluación de transferencia geográfica: al incluir cuatro encoders con distinto comportamiento en transferencia entre regiones, permite estudiar qué arquitectura generaliza mejor a nuevos sitios.
- Docencia en teledetección: el par de checkpoints (mejor validación y última época) y los `metadata.json` permiten ilustrar el efecto del sobreajuste y de la selección de checkpoint.
- Prototipado de pipelines SDB: integrable en flujos que descarguen escenas, apliquen SCL y ejecuten inferencia por parches con `inference.py`.
- Monitorización de cambios costeros: al ser determinista y barato por escena, permite generar series temporales de profundidad para detectar variaciones en bajos y praderas marinas.
- Benchmark de referencia: el Random Forest incluido sirve como baseline clásico frente a los modelos profundos en estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia las tablas 2 y 4 de Hsu & Moortgat (2026) para métricas de RMSE dentro de región y en transferencia entre regiones, pero no incluye los valores numéricos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para DeepLabV3+ con encoder ResNet-50 y parches de 512 × 512 se sitúa típicamente en el rango de pocos GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; el artículo no especifica el hardware de entrenamiento en el material consultado.
- Cabe en GPU de consumo: probable para ResNet-50 y EfficientNet-B4 por el tamaño de parche, no confirmado; ConvNeXt-Large y ResNet-101 requieren más memoria.
- Opciones de despliegue: PyTorch con `segmentation_models_pytorch` mediante `inference.py` del repo `DL_bathy`; el Random Forest se carga con `joblib.load()` en scikit-learn. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DL_bathy (ResNet-50) | DeepLabV3+ | 12 bandas Sentinel-2, parche 512×512 | Profundidad (m) por píxel | MIT | Pesos en HF |
| DL_bathy (ConvNeXt-Large) | DeepLabV3+ | 12 bandas Sentinel-2, parche 512×512 | Profundidad (m) por píxel | MIT | Pesos en HF |
| DL_bathy (ResNet-101) | DeepLabV3+ | 12 bandas Sentinel-2, parche 512×512 | Profundidad (m) por píxel | MIT | Pesos en HF |
| DL_bathy (EfficientNet-B4) | DeepLabV3+ | 12 bandas Sentinel-2, parche 512×512 | Profundidad (m) por píxel | MIT | Pesos en HF |
| DL_bathy (Random Forest) | Ensemble de árboles | 12 bandas Sentinel-2 | Profundidad (m) por píxel | MIT | Pesos en HF |

No se dispone de datos de benchmarks ni de especificaciones de modelos SDB alternativos en la información proporcionada para establecer una comparación cuantitativa con terceros.

## Limitaciones y advertencias

- Distribución de entrenamiento limitada a aguas someras de arrecife y costa (menos de unos 25 m); las predicciones en océano abierto o masas de agua turbias son extrapolaciones no fiables.
- No gestiona turbidez, reflejo solar (sun glint) ni rompientes; el enmascarado debe hacerse aguas arriba.
- No es un producto certificado para navegación marítima, planificación de dragados ni usos de seguridad crítica.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí de predicciones espurias fuera de distribución.
- El dataset completo de entrenamiento incluye LiDAR con licencia comercial no redistribuible; solo se publica un subconjunto abierto en `Ground_Truth.zip`.
- Reentrenar con el pipeline actual no reproduce exactamente los pesos publicados por cambios en fuentes de escenas y modelos de marea.
- El Random Forest se incluye solo como referencia y no está soportado por el pipeline `DL_bathy`.
- La model card contiene secciones marcadas como TODO sin completar, por lo que faltan métricas empíricas y detalles de memoria y tiempos de ejecución.
- Licencia MIT permite uso comercial, pero la ausencia de validación independiente desaconseja su uso en producción sin verificación local.

## Enlaces

- Hugging Face: https://huggingface.co/BuckAIObservatory/dl-bathy-weights
- Artículo: https://doi.org/10.3390/rs18111768
- Repositorio del pipeline: https://github.com/buckai-observatory/DL_bathy
- segmentation_models_pytorch: https://github.com/qubvel/segmentation_models.pytorch
