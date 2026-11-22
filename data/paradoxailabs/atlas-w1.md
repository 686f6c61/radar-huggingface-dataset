# PARADOXAIlabs/atlas-w1

## Resumen

Atlas W1 es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es el pronóstico de las próximas 24 horas de concentración de PM2.5 en estaciones de medición de calidad del aire en India, incorporando forzamiento meteorológico procedente de ERA5. Con 985.216 parámetros, es un modelo de escala muy reducida, diseñado para ser entrenado y desplegado con recursos mínimos, lo que lo aleja del paradigma de los grandes modelos generativos y lo acerca a la modelización científica especializada.

El modelo se entrenó sobre datos de estaciones CPCB de toda la India (14 redes, 263 estaciones) combinados con datos meteorológicos ERA5 de Open-Meteo archive (Copernicus C3S). Su relevancia radica en que, según los resultados registrados por el autor, supera a TimesFM 2.5 en el conjunto de test de toda la India: 19,86 / 19,92 con forzamiento ERA5 frente a 22,35 / 21,93 del modelo de Google. Es, por tanto, un ejemplo de modelo pequeño y específico de dominio que compite con modelos fundacionales de series temporales mucho mayores.

La versión W1 es la número 51 de la serie (modelo 48 de 56 publicados) y su cambio principal respecto a la versión anterior es la incorporación de forzamiento meteorológico. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal en PyTorch; código en repositorio GitHub del autor) |
| Parametros totales | 985.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de predicción: 24 h) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de una red neuronal implementada en PyTorch cuyo código reside en el repositorio GitHub del autor. El modelo recibe como entrada series temporales de PM2.5 por estación y variables meteorológicas ERA5 en cada estación, y produce como salida las próximas 24 horas de PM2.5. El checkpoint incluye la configuración de entrenamiento en `ck['cfg']`, lo que permite reconstruir la arquitectura exacta a partir del código publicado.

El entrenamiento se realizó el 2026-11-16 (run de Kaggle `atlas-w1-s400`) sobre datos de CPCB de toda la India (14 redes, 263 estaciones, del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)") y datos ERA5 de Open-Meteo archive (Copernicus C3S). No se especifica el número de tokens ni el volumen exacto de datos de entrenamiento, ni si hubo fases de ajuste fino con RLHF o DPO (poco habituales en este tipo de modelos). La innovación destacable de esta versión es la incorporación de forzamiento meteorológico como variable exógena.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de calidad del aire.
- Pronóstico espacio-temporal con forzamiento meteorológico (variables ERA5 por estación).
- Modelado multi-estación: cubre 263 estaciones de 14 redes de la India.
- Inferencia ligera: 985.216 parámetros permiten ejecución en CPU sin dificultad.
- Checkpoint autocontenido: incluye metadatos, configuración, pesos y registros de resultados en un único archivo `.pt`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por su naturaleza de modelo de series temporales.

## Casos de uso

- Pronóstico operativo de calidad del aire: el modelo genera las próximas 24 h de PM2.5 por estación, adecuado para sistemas de alerta temprana de episodios de contaminación en ciudades indias.
- Planificación de salud pública: permite anticipar picos de PM2.5 y activar protocolos de protección para poblaciones vulnerables con un día de antelación.
- Investigación atmosférica: sirve como baseline reproducible para estudiar la contribución del forzamiento meteorológico a la variabilidad de PM2.5, dado que la versión W1 incorpora ERA5 frente a versiones sin meteorología.
- Integración en pipelines de datos ambientales: al ser un modelo de menos de 1 M de parámetros, puede ejecutarse en el mismo servidor que ingiere datos de estaciones y meteorología, sin GPU dedicada.
- Evaluación comparativa de modelos fundacionales: su rendimiento registrado frente a TimesFM 2.5 lo convierte en referencia para estudios que comparen modelos pequeños específicos de dominio con modelos fundacionales de series temporales.
- Despliegue en entornos con recursos limitados: agencias locales o proyectos con infraestructura mínima pueden cargar el checkpoint en CPU y generar pronósticos sin depender de servicios en la nube.

## Benchmarks y rendimiento

| Conjunto | Atlas W1 (con ERA5) | TimesFM 2.5 |
|---|---|---|
| Validación | 8,684 (-4,61 % respecto a la versión anterior) | no disponible |
| Test toda la India | 19,86 / 19,92 | 22,35 / 21,93 |

Los valores corresponden a los resultados registrados por el autor en la model card. No se especifica la métrica exacta (probablemente MAE o RMSE en µg/m³ de PM2.5); no se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 4.020.709 bytes (aproximadamente 4 MB).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Cualquier GPU consumer (incluso integradas) puede ejecutarlo.
- Cabe en cualquier GPU consumer y en Raspberry Pi o entornos similares.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load`), con posibilidad de exportación a TorchScript u ONNX (no documentada). No aplican vLLM, llama.cpp, Ollama o TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Rendimiento (test India) | Licencia |
|---|---|---|---|---|---|
| Atlas W1 | 985.216 | PM2.5 24 h con meteorología | 24 h | 19,86 / 19,92 | Apache-2.0 |
| TimesFM 2.5 | no disponible (modelo fundacional de Google) | Series temporales generales | no disponible | 22,35 / 21,93 | no disponible |
| Atlas S3 (versión previa de la serie) | 10 M | PM2.5 24 h sin meteorología | 24 h | no disponible | Apache-2.0 |

El dato comparativo principal es la ventaja de Atlas W1 sobre TimesFM 2.5 en el test de toda la India, pese a tener tres órdenes de magnitud menos parámetros. No se dispone de comparaciones con otros modelos específicos de calidad del aire.

## Limitaciones y advertencias

- Dominio muy restringido: solo predice PM2.5 a 24 h en estaciones de la India; no es un modelo de propósito general.
- Dependencia de datos ERA5: el rendimiento registrado asume disponibilidad de forzamiento meteorológico; sin él, el comportamiento no está documentado en la información disponible.
- Sesgo geográfico: entrenado exclusivamente con estaciones CPCB de la India, por lo que su transferencia a otras regiones no está validada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones poco fiables en episodios extremos no representados en el entrenamiento.
- Los datos de entrenamiento no se incluyen en el repositorio; solo se documentan sus fuentes y términos en DATA_SOURCES.md, lo que limita la reproducibilidad completa.
- Métrica de los resultados no especificada en la model card; conviene verificar el README del repositorio antes de comparar cifras.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero se recomienda citar según CITATION.cff.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-w1
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la versión: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Serie completa en Hugging Face: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Versión anterior (#50): https://huggingface.co/PARADOXAIlabs/atlas-scale-10m
- Versión siguiente (#52): https://huggingface.co/PARADOXAIlabs/atlas-w10
- Sitio del autor: https://paradoxailab.com
