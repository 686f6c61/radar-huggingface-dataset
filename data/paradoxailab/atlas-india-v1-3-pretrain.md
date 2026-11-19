# paradoxailab/atlas-india-v1.3-pretrain

## Resumen

Atlas v1.3 (pretrain) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente la entrega número 41 de la serie y el modelo 38 de los 56 publicados. Su tarea es la previsión de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire de la India, a partir de los datos de las redes CPCB (Central Pollution Control Board). Es, por tanto, un modelo especializado en forecasting espacio-temporal medioambiental, no un modelo de lenguaje.

El modelo es extremadamente compacto: 967.632 parámetros, con un único fichero de pesos en formato PyTorch (`41_atlas_india_v1.3_pretrain.pt`, 3,9 MB) que incluye tanto el state dict como metadatos, configuración de entrenamiento y registros de resultados. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones adicionales relevantes.

Esta versión corresponde a la etapa de pre-entrenamiento de v1.3, entrenada el 13 de noviembre de 2026 y publicada el 17 de noviembre de 2026. El dato de validación registrado es un error agrupado (pooled validation) de 8.507 sobre las 13 redes empleadas. Su relevancia radica en que aborda un problema de salud pública (contaminación atmosférica) con un modelo de menos de un millón de parámetros, desplegable en cualquier entorno, y con una metodología reproducible documentada en el repositorio GitHub del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; el código está en el repositorio GitHub del proyecto) |
| Parametros totales | 967.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; los datos son de la India) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, state dict cargable con `torch.load`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; únicamente indica que el código de arquitectura de esta versión está en el repositorio de GitHub `paradoxailab/paradox-world-model` y que la configuración de entrenamiento se almacena en el propio fichero de pesos bajo la clave `ck['cfg']`. Por tanto, la arquitectura exacta (transformer, red recurrente, modelo espacio-temporal, etc.) no está disponible en la información proporcionada.

En cuanto a los datos, el modelo se entrena con las estaciones CPCB de toda la India, provenientes del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)". La model card presenta una discrepancia interna: la fila de datos menciona 14 redes / 263 estaciones, mientras que el título y el resultado indican 13 redes (excluyendo Delhi). El entrenamiento se realizó el 13 de noviembre de 2026 en el run de Kaggle `atlas-v13-s320`. No se documentan número de tokens, composición detallada del dataset, ni etapas de RLHF/DPO (no aplicables a este tipo de modelo). Esta versión es la etapa de pre-entrenamiento de v1.3, lo que sugiere que existirán etapas posteriores de ajuste.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espacio-temporal sobre múltiples redes de sensores (13 redes en esta versión).
- Carga y reproducción completa: el fichero de pesos incluye metadatos, configuración de entrenamiento y todos los resultados registrados.
- Integración en pipelines de PyTorch mediante `hf_hub_download` y `torch.load`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Predicción operativa de calidad del aire: generar previsiones a 24 horas de PM2.5 por estación para alimentar paneles de alerta temprana en ciudades indias, aprovechando que el modelo cubre 13 redes de estaciones CPCB.
- Sistemas de aviso sanitario: integrar las predicciones en plataformas de salud pública que activen recomendaciones (mascarillas, restricción de actividad al aire libre) cuando se prevean superaciones de umbrales de PM2.5.
- Investigación en contaminación atmosférica: usar el modelo como línea base reproducible (pesos, configuración y resultados incluidos en el fichero) para comparar con modelos espacio-temporales de mayor tamaño.
- Despliegue en entornos con recursos limitados: con menos de un millón de parámetros y un fichero de 3,9 MB, puede ejecutarse en CPU en dispositivos de borde o en servidores modestos sin GPU.
- Planificación urbana y política ambiental: analizar patrones de dispersión de PM2.5 entre redes de estaciones para evaluar el impacto de medidas de reducción de emisiones.
- Reproducibilidad y auditoría científica: al incluir los logs del run de Kaggle y todos los resultados registrados, sirve para replicar experimentos y auditar la metodología del proyecto Paradox World Model.
- Educación y prototipado: ejemplo de forecasting espacio-temporal de bajo coste para cursos o proyectos que necesiten un modelo funcional sin infraestructura pesada.

## Benchmarks y rendimiento

La model card solo reporta un resultado de validación, sin comparación con otros modelos:

| Metrica | Valor |
|---|---|
| Pooled validation (13 redes) | 8.507 |

No se especifica la unidad de esta métrica (podría ser RMSE, MAE u otra), ni se ofrecen resultados desagregados por red, por horizonte temporal ni comparaciones con alternativas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 967.632 parámetros y pesos en punto flotante de 32 bits, el modelo ocupa aproximadamente 3,9 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren; cualquier GPU (incluidas GTX 1050, RTX 3060 o superiores) es más que suficiente. También es viable la inferencia en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pt` con `torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dado el tamaño, la latencia sería del orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna de la propia serie, la model card enlaza el modelo anterior (#40 Atlas-India v1.0) y el siguiente (#42 Atlas-Delhi v1.3), pero no se incluyen sus especificaciones ni resultados en esta información.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atlas-India v1.3 pretrain | 967.632 | no disponible | Apache-2.0 | Hugging Face |
| Atlas-India v1.0 (#40) | no disponible | no disponible | no disponible | Hugging Face |
| Atlas-Delhi v1.3 (#42) | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Cobertura geográfica limitada a la India y a las estaciones CPCB; no se ha validado fuera de ese contexto.
- Exclusión de Delhi: el modelo se entrena con 13 redes dejando Delhi fuera, por lo que no debe usarse para predecir esa región (existe un modelo específico, Atlas-Delhi v1.3).
- Discrepancia en la documentación: la model card menciona 14 redes / 263 estaciones en la fila de datos pero 13 redes en el título y el resultado; conviene verificar la configuración real en `ck['cfg']`.
- Métrica de validación (8.507) sin unidad ni desglose: no es posible interpretar su magnitud ni compararla con otros trabajos sin más contexto.
- Es una etapa de pre-entrenamiento: no se garantiza que sea la versión final ni la de mejor rendimiento de la familia.
- Riesgo de alucinación no aplicable en el sentido de los LLM, pero sí existe riesgo de predicciones erróneas fuera de la distribución de entrenamiento (nuevas estaciones, episodios extremos no vistos).
- Sesgos potenciales derivados de la cobertura desigual de las redes de sensores y del periodo 2010-2023 del dataset.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- No se incluyen los datos de entrenamiento; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-india-v1.3-pretrain
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#40 Atlas-India v1.0): https://huggingface.co/paradoxailab/atlas-india-v1.0
- Modelo siguiente (#42 Atlas-Delhi v1.3): https://huggingface.co/paradoxailab/atlas-delhi-v1.3
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del laboratorio: https://paradoxailab.com
