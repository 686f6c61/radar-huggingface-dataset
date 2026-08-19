# OneScience-Group/AURORA

## Resumen

AURORA es un modelo fundacional del sistema terrestre desarrollado originalmente por Microsoft Research y reproducido por el grupo OneScience en este repositorio. Se trata de un modelo de aprendizaje profundo con 1.300 millones de parámetros, compuesto por un codificador Perceiver 3D, un procesador Swin Transformer 3D y un decodificador Perceiver 3D. Su propósito es abordar tareas de predicción del sistema terrestre, incluyendo pronóstico meteorológico global y predicción de contaminación atmosférica, incluso en regiones con escasez de datos o escenarios meteorológicos extremos.

La relevancia actual de AURORA radica en su capacidad para actuar como un modelo fundacional unificado que puede adaptarse a múltiples tareas de ciencias de la Tierra mediante fine-tuning, superando a los sistemas de pronóstico operativos tradicionales en varias métricas según el paper publicado en ICML 2024. Este repositorio de OneScience ofrece una implementación práctica con scripts de entrenamiento, fine-tuning, inferencia y visualización, además de pesos entrenados sobre datos de reanálisis ERA5, lo que facilita su adopción por parte de la comunidad investigadora. La licencia MIT permite uso comercial, aunque Microsoft solicita contacto directo para aplicaciones comerciales del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver encoder 3D + Swin Transformer processor 3D + Perceiver decoder 3D |
| Parametros totales | 1.300 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision/ciencia, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas de la model card; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (safetensors no confirmado; carpeta `weights/` en el repositorio) |

## Arquitectura y entrenamiento

AURORA emplea una arquitectura híbrida basada en tres componentes principales: un codificador Perceiver 3D que comprime las entradas atmosféricas de alta resolución en una representación latente compacta, un procesador Swin Transformer 3D que modela las dependencias espacio-temporales, y un decodificador Perceiver 3D que proyecta de vuelta al espacio de salida. Esta estructura permite manejar variables atmosféricas heterogéneas y mallas irregulares, una ventaja frente a modelos que requieren grids uniformes.

El entrenamiento se realiza sobre el conjunto de datos ERA5 de reanálisis atmosférico, con más de un millón de horas de datos geofísicos diversos según el paper original. El repositorio de OneScience proporciona un subconjunto de datos ERA5 para reproducción, así como scripts para generar datos sintéticos que validen el pipeline completo. El modelo se entrena mediante aprendizaje supervisado estándar, y el fine-tuning se soporta para adaptarlo a tareas específicas como predicción de calidad del aire o variables oceánicas. No se menciona el uso de RLHF ni DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Predicción meteorológica global a partir de datos de reanálisis ERA5.
- Predicción de contaminación atmosférica (calidad del aire).
- Fine-tuning para tareas específicas del sistema terrestre, como oleaje oceánico o variables climáticas.
- Manejo de datos escasos o regiones con observaciones limitadas.
- Soporte para entrenamiento multi-GPU mediante `torchrun`.
- Capacidad de generar pronósticos con resolución temporal horaria (según la extensión Aurora 1.5, aunque esta versión concreta no lo especifica).
- No es un modelo de lenguaje: no soporta tool calling, agentes ni generación de texto.

## Casos de uso

- Pronóstico meteorológico operativo: el modelo puede generar predicciones de variables atmosféricas (temperatura, presión, viento, humedad) a partir de estados iniciales de ERA5, con una ventana de predicción de varios días. Su arquitectura 3D captura correlaciones espacio-temporales que los modelos numéricos tradicionales resuelven con coste computacional mucho mayor.
- Predicción de calidad del aire: mediante fine-tuning sobre datos de concentración de contaminantes, AURORA puede anticipar episodios de alta polución, útil para servicios de salud pública y planificación urbana.
- Investigación climática: el modelo sirve como herramienta de análisis para estudiar fenómenos extremos (olas de calor, tormentas) en escenarios de datos limitados, donde los modelos operativos fallan por falta de observaciones.
- Generación de pronósticos por conjuntos (ensembles): con la extensión Aurora 1.5 se añade capacidad probabilística, pero en esta versión base se pueden generar múltiples ejecuciones con perturbaciones para estimar incertidumbre.
- Validación de pipelines de IA para ciencias de la Tierra: el repositorio incluye datos sintéticos y scripts de verificación que permiten a equipos de ingeniería probar la integración del modelo en sus sistemas antes de usar datos reales.
- Entrenamiento distribuido en clusters: gracias al soporte de `torchrun`, puede desplegarse en entornos multi-GPU o DCU (aceleradores chinos) para escalar el entrenamiento o el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv:2405.13063) reporta mejoras sobre los sistemas operativos IFS y otros modelos de IA, pero los valores numéricos específicos no están incluidos en la documentación de este repositorio. Se recomienda consultar el paper para métricas detalladas de RMSE, skill score y comparativas con GraphCast, Pangu-Weather y FourCastNet.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 1.300 millones de parámetros, una estimación orientativa sería ~2,6 GB en FP16 y ~5,2 GB en FP32 para los pesos, más memoria para activaciones y optimizador durante entrenamiento. En la práctica, una GPU con 12-16 GB debería ser suficiente para inferencia.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM (p.ej., RTX 3060, RTX 4090, A100, H100). También compatible con DCU (aceleradores Hygon) previa instalación de DTK 25.04.2 o superior.
- Consumer GPU: sí, cabe en GPUs de gama media-alta para inferencia; el entrenamiento completo puede requerir más memoria.
- Opciones de despliegue: scripts Python nativos (`train.py`, `inference.py`), soporte para `torchrun` en multi-GPU. No se mencionan integraciones con vLLM, Ollama o TGI (al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles. Depende del hardware y del número de variables de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AURORA (OneScience) | 1.300 M | n/a | Prediccion atmosferica | MIT | HuggingFace |
| GraphCast (DeepMind) | ~36 M | n/a | Prediccion meteorologica | Apache 2.0 | GitHub |
| Pangu-Weather (Huawei) | ~256 M | n/a | Prediccion meteorologica | no comercial | GitHub |
| FourCastNet | ~100 M | n/a | Prediccion meteorologica | BSD-3 | GitHub |

Nota: los datos de los modelos comparativos son aproximados y provienen de conocimiento general; no se dispone de una comparativa directa en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado con datos de reanálisis ERA5, que tienen cobertura limitada en ciertas regiones (especialmente océanos y zonas polares) y pueden introducir sesgos en esas áreas.
- Riesgo de alucinación en predicciones extremas: como cualquier modelo de aprendizaje automático, puede generar salidas físicamente inconsistentes en escenarios fuera de la distribución de entrenamiento.
- La resolución espacial y temporal está limitada por los datos de entrenamiento; no es adecuado para predicciones a muy corto plazo (nowcasting) sin fine-tuning específico.
- La licencia MIT permite uso comercial, pero Microsoft solicita contacto directo (AIWeatherClimate@microsoft.com) para aplicaciones comerciales del modelo original; este repositorio de OneScience es una reproducción, por lo que se debe verificar el cumplimiento de los términos del paper.
- No es un modelo multimodal ni de lenguaje: no procesa texto ni imágenes generales, solo datos geofísicos estructurados.
- El repositorio indica que los pesos entrenados se subirán próximamente; actualmente puede que no estén disponibles todos los archivos de pesos.
- No se proporcionan métricas de rendimiento en el repositorio; la evaluación debe realizarse con los scripts incluidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/AURORA
- Paper original: https://arxiv.org/abs/2405.13063
- Pagina del proyecto en Microsoft Research: https://www.microsoft.com/en-us/research/project/aurora-forecasting/
- Repositorio oficial de Microsoft: https://github.com/microsoft/aurora
- Blog de Aurora 1.5: https://www.microsoft.com/en-us/research/blog/aurora-1-5-extending-open-foundation-models-for-weather-and-earth-system-applications/
- Articulo en Nature: https://www.nature.com/articles/s41586-025-09005-y
- Organizacion OneScience en HuggingFace: https://huggingface.co/OneScience-Group/models
- Repositorio principal OneScience (GitHub): https://github.com/onescience-ai/OneScience
