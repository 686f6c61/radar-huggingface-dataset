# dhruvashaw/wca-predictions

## Resumen

El modelo `dhruvashaw/wca-predictions`, publicado por Dhruva Shaw, es un modelo de aprendizaje automático orientado a la predicción de tiempos y resultados en competiciones de la World Cube Association (WCA), es decir, speedcubing. Aunque la ficha de HuggingFace no incluye detalles técnicos, el repositorio de GitHub asociado (`wca-time-prediction`) sugiere que el modelo se utiliza para pronosticar rankings futuros, identificar posibles número uno en cada una de las 17 modalidades oficiales, y analizar trayectorias individuales de competidores.

La relevancia de este modelo radica en su aplicación a un dominio muy específico: el análisis predictivo de datos deportivos de competiciones de cubo de Rubik. Sin embargo, la información pública disponible es extremadamente limitada: no se especifican arquitectura, tamaño, contexto, ni datos de entrenamiento. Esto impide una evaluación técnica rigurosa y limita su uso a quien tenga acceso al código fuente o a documentación adicional no publicada en HuggingFace.

A pesar de la falta de especificaciones, el modelo está publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación, siempre que se mantenga la atribución. No obstante, cualquier despliegue en producción requeriría una investigación adicional sobre su implementación real, ya que la model card no ofrece más que la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El repositorio de GitHub asociado (`wca-time-prediction`) indica que el proyecto incluye funcionalidades como predicción de rankings futuros, análisis de perfiles de competidores y actualización automática de datos desde exportaciones oficiales de la WCA, pero no se detallan los algoritmos subyacentes (regresión, series temporales, redes neuronales, etc.). Tampoco se especifican los datos de entrenamiento, el número de tokens o ejemplos utilizados, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Dada la naturaleza del problema (predicción de tiempos en competiciones), es plausible que se trate de un modelo de regresión o de aprendizaje supervisado sobre datos históricos de la WCA, pero esto es una inferencia no confirmada.

## Capacidades

- Predicción de tiempos y rankings futuros para competiciones WCA, según el repositorio de GitHub.
- Identificación de posibles competidores número uno en las 17 modalidades oficiales de la WCA.
- Análisis de trayectorias individuales de competidores, incluyendo hitos y predicciones de progresión.
- Actualización automática de datos mediante integración con exportaciones oficiales de la WCA.
- No se documentan capacidades de generación de texto, razonamiento general, código, visión, tool calling o agentes.

## Casos de uso

- Planificación de entrenamiento para speedcubers: el modelo puede predecir la evolución de los tiempos de un competidor, ayudando a establecer objetivos realistas y ajustar rutinas de práctica.
- Análisis de competiciones para organizadores: permite anticipar qué atletas podrían dominar futuros eventos, útil para la promoción y la logística de torneos.
- Herramientas de visualización de datos deportivos: integrable en dashboards que muestren proyecciones de rankings y comparativas entre competidores.
- Apuestas o fantasy leagues de speedcubing: aunque no es un uso oficial, las predicciones podrían emplearse en plataformas de entretenimiento que simulen resultados de competiciones.
- Investigación en análisis deportivo: sirve como caso de estudio para métodos de predicción en deportes con datos históricos estructurados.
- Desarrollo de aplicaciones de seguimiento de atletas: los datos de predicción pueden combinarse con perfiles de competidores para ofrecer recomendaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas como MMLU, HumanEval o GSM8K, dado que el modelo no es un LLM generalista sino un predictor específico de dominio. Tampoco se ofrecen comparativas con otros modelos de predicción de la WCA.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al desconocerse la arquitectura y el tamaño del modelo, no es posible estimar VRAM, GPUs recomendadas, ni opciones de despliegue. Si el modelo es pequeño (por ejemplo, un modelo de regresión o un árbol de decisión), podría ejecutarse en CPU sin problemas, pero esto es especulativo. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Existen proyectos como "WCA Odds" (https://odds.nmckee.org/) que ofrecen probabilidades para competiciones WCA, pero no se ha publicado documentación técnica que permita una comparación rigurosa. Tampoco se conocen otros modelos de predicción de speedcubing con especificaciones públicas.

## Limitaciones y advertencias

- La falta de documentación técnica impide evaluar la fiabilidad de las predicciones y su generalización a nuevos datos.
- No se especifican sesgos potenciales, pero al entrenarse sobre datos históricos de la WCA, podría reflejar desigualdades en la participación por región o género.
- Riesgo de alucinación o predicciones erróneas en competidores con pocos datos históricos o en eventos con cambios de formato.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la calidad ni el soporte del modelo.
- No se indica si el modelo se actualiza automáticamente con nuevos datos de la WCA, lo que podría afectar a su precisión a largo plazo.
- Para producción, se recomienda contactar con el autor o revisar el código fuente en GitHub antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/dhruvashaw/wca-predictions
- Repositorio GitHub: https://github.com/Dhruvacube/wca-time-prediction
- Sitio personal del autor: https://dhruvashaw.in/
- Publicaciones del autor: https://dhruvashaw.in/publications/
- WCA Odds (proyecto similar): https://odds.nmckee.org/
