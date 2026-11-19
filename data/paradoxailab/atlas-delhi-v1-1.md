# paradoxailab/atlas-delhi-v1.1

## Resumen

Atlas-Delhi v1.1 es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh) como parte de su serie Paradox World Model. Su tarea concreta es pronosticar las próximas 24 horas de concentración de PM2.5 en las estaciones de monitorización de calidad del aire de Delhi, a partir del histórico horario de la red CPCB (Central Pollution Control Board) de la India, con 39 estaciones de monitorización continua y datos desde 2018.

El modelo es deliberadamente pequeño: 967.632 parámetros por checkpoint, con dos checkpoints incluidos en el archivo (etapas B y C de entrenamiento). No es un modelo de lenguaje ni un transformer generativo de propósito general, sino un modelo especializado de forecasting que se distribuye como un único fichero PyTorch (`.pt`) de 7,78 MB que contiene pesos, configuración y resultados registrados.

La relevancia de esta versión (v1.1) radica en que amplía el entrenamiento al histórico completo de Delhi (19.082 ventanas temporales) frente a la versión anterior basada en 16 meses, mejorando la validación de 22,127 a 20,807 (presumiblemente RMSE o MAE en µg/m³ de PM2.5, aunque la unidad no se explicita en la model card). Es un ejemplo de modelo de nicho, reproducible y de código abierto, orientado a aplicaciones de salud pública y contaminación atmosférica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el código está en el repositorio GitHub; la model card no describe la arquitectura) |
| Parametros totales | 967.632 por checkpoint (2 checkpoints en el fichero: etapas B y C) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada no especificada; horizonte de predicción de 24 h) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float, presumiblemente fp32) |
| Idiomas soportados | no aplica (modelo de series temporales, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state dict serializado con `torch.save`, incluye `meta`, `weights`, `results` y `cfg`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; solo indica que el código de arquitectura está en el repositorio GitHub de Paradox World Model y que la configuración de entrenamiento se almacena en el propio fichero (`ck['cfg']`). Dado el tamaño (menos de un millón de parámetros) y la tarea (forecasting espaciotemporal sobre 39 estaciones), es plausible que se trate de una red recurrente, convolucional o un modelo gráfico espacio-temporal ligero, pero esto no se confirma en la información disponible.

El entrenamiento se realizó el 2026-11-13 en la ejecución `atlas-long-s300` (Kaggle) y se publicó el 2026-11-17. Los datos de entrenamiento son el histórico horario completo de calidad del aire de Delhi desde 2018, con 19.082 ventanas temporales, procedentes de los informes horarios de OpenCity y de la red CPCB. No se menciona uso de RLHF, DPO ni técnicas de alineación (no aplicables a este tipo de modelo). La innovación principal de esta versión es la ampliación del corpus histórico respecto a v1.0, que usaba 16 meses.

## Capacidades

- Predicción de las próximas 24 horas de PM2.5 en estaciones de monitorización de Delhi.
- Modelado espaciotemporal sobre una red de 39 estaciones (presumiblemente con dependencias entre estaciones, aunque no se detalla).
- Pronóstico multi-horizonte (24 pasos horarios).
- Serialización autocontenida: el fichero incluye metadatos, pesos por etapa y resultados registrados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Predicción de episodios de contaminación en Delhi: el modelo permite anticipar 24 h de PM2.5 por estación, útil para emitir alertas sanitarias y activar protocolos de reducción de tráfico o restricciones industriales.
- Integración en paneles de salud pública: ayuntamientos y organismos como CPCB pueden incorporar las predicciones en cuadros de mando para comunicar riesgo a la población con un día de antelación.
- Investigación en calidad del aire: al ser un modelo pequeño, reproducible y con pesos y configuración incluidos, sirve como baseline para comparar arquitecturas de forecasting espaciotemporal en la red de Delhi.
- Planificación de actividades al aire libre: aplicaciones móviles o servicios meteorológicos pueden usar el pronóstico por estación para recomendar horarios de menor exposición.
- Evaluación de políticas ambientales: comparar predicciones con y sin escenarios simulados (por ejemplo, restricciones de tráfico) para estimar impacto a corto plazo, siempre que se reentrene o ajuste con datos contrafactuales.
- Docencia y prototipado: por su tamaño (7,78 MB) y licencia Apache-2.0, es adecuado para cursos de series temporales y para desplegar prototipos en CPU sin infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | Atlas-Delhi v1.1 | Atlas-Delhi v1.0 (16 meses) |
|---|---|---|
| Validación (unidad no especificada, presumiblemente error de PM2.5) | 20,807 | 22,127 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo. El único dato de rendimiento es la métrica de validación registrada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 967.632 parámetros por checkpoint; en fp32 ocupa unos 3,9 MB por checkpoint).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos (Raspberry Pi, Jetson Nano) dado su tamaño.
- Opciones de despliegue: PyTorch nativo (`torch.load`), TorchScript o exportación a ONNX si se desea; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU para una ventana de 24 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-Delhi v1.1 | 967.632 | 24 h de PM2.5 | Forecasting espaciotemporal | Apache-2.0 | Hugging Face |
| Atlas-Delhi v1.0 | no disponible | 24 h de PM2.5 (16 meses de datos) | Forecasting espaciotemporal | Apache-2.0 | Hugging Face |
| Otros modelos de la serie Paradox World Model (#01–#59) | variable | variable | Diversas tareas de world modeling | Apache-2.0 (presumiblemente) | Hugging Face |

No se dispone de información sobre modelos comparables de terceros (por ejemplo, baselines de forecasting de calidad del aire como LSTM, Graph WaveNet o Temporal Fusion Transformer) en la documentación proporcionada; por tanto, la comparativa con alternativas externas queda como "no disponible".

## Limitaciones y advertencias

- Modelo de nicho: solo predice PM2.5 en Delhi; no es generalizable a otras ciudades ni contaminantes sin reentrenamiento.
- La unidad de la métrica de validación (20,807) no se especifica en la model card; podría ser RMSE, MAE u otra, lo que dificulta la comparación directa.
- No se detalla la arquitectura ni la ventana de entrada, lo que limita la reproducibilidad sin consultar el repositorio GitHub.
- El repositorio Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- Riesgo de degradación ante cambios estructurales en la red de estaciones (cierres, reubicaciones) o ante eventos extremos no presentes en el histórico 2018–2026.
- No se documentan sesgos específicos, pero al entrenarse solo con datos de Delhi, el modelo puede no capturar dinámicas de otras regiones.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar según `CITATION.cff` y verificar los términos de las fuentes de datos (CPCB, OpenCity) recogidos en `DATA_SOURCES.md`.
- Alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir predicciones poco realistas fuera de su distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-delhi-v1.1
- Versión anterior: https://huggingface.co/paradoxailab/atlas-delhi-v1.0
- Versión siguiente: https://huggingface.co/paradoxailab/atlas-delhi-v1.2
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web del autor: https://paradoxailab.com
