# MyHeartCounts/openmhc-brits-imp

## Resumen

OpenMHC BRITS es un checkpoint de imputación de series temporales de sensores de wearables, publicado por el proyecto MyHeartCounts dentro del ecosistema OpenMHC. No se trata de un modelo de lenguaje, sino de un modelo especializado en reconstruir ventanas de datos de sensores enmascarados o ausentes, un paso previo habitual en pipelines de análisis de datos de salud digital. El checkpoint se distribuye a través de la librería `openmhc` y envuelve un imputador implementado sobre PyPOTS.

El modelo trabaja sobre ventanas diarias de 1440 minutos (resolución de un minuto) y 19 canales de sensores, lo que lo sitúa en el ámbito de los modelos de series temporales multimodales para datos de wearables. Su propósito declarado es servir como referencia reproducible para el benchmark de imputación de OpenMHC, permitiendo comparaciones metodológicas entre distintos enfoques de imputación.

El checkpoint tiene un tamaño de repositorio de 0.0 GB según Hugging Face, lo que sugiere un modelo de parámetros reducidos o un artefacto de pesos muy compacto. La relevancia actual reside en el creciente interés por los modelos fundacionales de wearables y por la calidad de los datos de entrada en estudios de salud digital, donde la imputación correcta de huecos en las series es crítica para cualquier análisis posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BRITS (imputador recurrente bidireccional con decaimiento temporal), implementado sobre PyPOTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana diaria de 1440 minutos, 19 canales de sensores |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de texto) |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | no disponible (checkpoint gestionado por la librería `openmhc`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a BRITS (Bidirectional Recurrent Imputation for Time Series), un modelo recurrente bidireccional que estima valores ausentes en series temporales multivariadas aprovechando dependencias temporales en ambas direcciones y correlaciones entre canales. En esta implementación, el modelo se apoya en PyPOTS, una librería especializada en imputación de series temporales parcialmente observadas, y procesa ventanas de 1440 minutos con 19 canales de sensores.

El entrenamiento se realizó sobre el split de entrenamiento de imputación de OpenMHC. Según la model card, el checkpoint proviene del artefacto de W&B `MHC_Dataset/mhc-pypots-brits/brits:v19` y alcanzó un MAE de validación de 0.0945 en la época 5. Los hiperparámetros de arquitectura están fijados en el archivo `openmhc_manifest.json` incluido en el repositorio. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO, algo por otra parte esperable en un modelo de imputación y no de generación.

## Capacidades

- Imputación de valores ausentes en ventanas de series temporales de wearables con 19 canales de sensores.
- Reconstrucción de ventanas enmascaradas con resolución temporal de un minuto y horizonte diario (1440 pasos).
- Modelado de dependencias temporales bidireccionales y de correlaciones entre canales.
- Integración con el pipeline de evaluación de OpenMHC mediante `openmhc.evaluate_imputation`.
- Versionado de checkpoints mediante sufijos de revisión (`@v1.0`) para reproducibilidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción del benchmark OpenMHC: cargar el checkpoint con `BRITSImputer.from_release("hf://MyHeartCounts/openmhc-brits-imp")` y ejecutar `openmhc.evaluate_imputation` para obtener métricas comparables con otros imputadores del benchmark.
- Comparación metodológica de imputadores: usar este checkpoint como línea base BRITS frente a otros enfoques (por ejemplo, SAITS, Transformer-based) en el mismo split de validación, con MAE de referencia 0.0945.
- Preprocesamiento de datos de wearables en investigación: rellenar huecos en series de 19 canales antes de análisis estadísticos o de entrenamiento de modelos posteriores, reduciendo el sesgo por datos faltantes.
- Validación de pipelines de datos: comprobar que la integración entre `openmhc`, PyPOTS y el almacenamiento de checkpoints en Hugging Face funciona correctamente en un entorno de investigación.
- Docencia y formación: ilustrar el funcionamiento de la imputación bidireccional en series temporales con un checkpoint reproducible y de tamaño reducido.
- Desarrollo de nuevos imputadores: emplear este checkpoint como referencia de rendimiento y como punto de partida para arquitecturas derivadas, respetando las restricciones de la licencia OpenRAIL-M.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| MAE de validación | 0.0945 | Época 5, split de validación de OpenMHC |

No se han publicado resultados de benchmarks adicionales (comparativas con otros imputadores, métricas por canal, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy ligero que probablemente quepa en cualquier GPU consumer.
- GPU recomendadas: no disponible; por el tamaño aparente, cualquier GPU con soporte CUDA o incluso CPU debería ser suficiente.
- Compatibilidad con GPU consumer: altamente probable dada la naturaleza del modelo, aunque no confirmado en la información disponible.
- Opciones de despliegue: la vía oficial es la librería `openmhc` con los extras `pypots` y `hf` (`pip install 'openmhc[pypots,hf]'`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Ventana | Canales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMHC BRITS (este) | Imputador BRITS sobre PyPOTS | 1440 min | 19 | BigScience OpenRAIL-M | Hugging Face (`MyHeartCounts/openmhc-brits-imp`) |
| Otros imputadores del benchmark OpenMHC | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| BRITS original (Cao et al.) | Imputador recurrente bidireccional | Configurable | Configurable | No disponible | Implementación de referencia en repositorios académicos |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigación, comparación metodológica y reproducción del benchmark OpenMHC.
- Queda fuera de alcance cualquier uso diagnóstico, de cribado, pronóstico, predicción prospectiva de riesgo o apoyo a decisiones clínicas.
- Las etiquetas de condiciones médicas de OpenMHC son autoinformadas y carecen de fechas de diagnóstico; el rendimiento en el benchmark no establece utilidad clínica.
- Cualquier afirmación diagnóstica o pronóstica requeriría validación independiente con desenlaces clínicamente adjudicados y alineados temporalmente en la población objetivo.
- La licencia BigScience OpenRAIL-M incluye restricciones de uso en su Anexo A que prohíben, entre otras cosas, proporcionar consejo médico e interpretación de resultados médicos.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; en imputación, el riesgo principal es la reconstrucción plausible pero incorrecta de valores ausentes.
- Limitaciones de idioma: no aplica, al no ser un modelo de texto.
- El checkpoint está fijado a una revisión concreta (`v1.0`); cambios en versiones futuras pueden alterar el comportamiento y las métricas.
- El tamaño del repositorio (0.0 GB) y la ausencia de descargas y likes sugieren un artefacto de referencia poco validado externamente.

## Enlaces

- Hugging Face: https://huggingface.co/MyHeartCounts/openmhc-brits-imp
- Repositorio OpenMHC: https://github.com/AshleyLab/OpenMHC
- PyPOTS: https://github.com/WenjieDu/PyPOTS
- Licencia BigScience OpenRAIL-M: incluida en el repositorio del modelo (archivo `LICENSE`)
