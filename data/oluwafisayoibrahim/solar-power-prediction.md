# OluwafisayoIbrahim/solar-power-prediction

## Resumen

Solar Power Prediction es un conjunto de modelos de regresion tabular publicados en Hugging Face por el usuario OluwafisayoIbrahim. No es un modelo de lenguaje ni una red neuronal de proposito general: son estimadores de regresion que predicen la potencia solar en vatios a partir de mediciones contemporaneas de irradiancia, corriente, voltaje, temperatura, humedad y hora del dia. El repositorio agrupa implementaciones en scikit-learn, TensorFlow y PyTorch, junto con una aplicacion Streamlit de demostracion.

El modelo resuelve un problema acotado de investigacion y docencia: estimar la potencia instantanea de una instalacion solar fotovoltaica con datos de sensores del mismo instante temporal. No aborda prevision a futuro, operacion de red ni control de seguridad, y el propio autor lo advierte explicitamente. La relevancia es limitada fuera del ambito academico: se trata de un ejercicio de comparacion de frameworks de machine learning sobre un conjunto de datos pequeno (180 observaciones), no de un sistema listo para produccion energetica.

La informacion disponible no permite caracterizar el modelo con los parametros habituales de un modelo fundacional (parametros, contexto, cuantizacion). Se trata de artefactos serializados de scikit-learn (joblib) y de redes densas pequenas en Keras y PyTorch, con arquitecturas de una o dos capas ocultas y decenas de neuronas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal, MLP de scikit-learn y redes densas (TensorFlow/Keras, PyTorch) con capas ocultas de (10,) o (16, 8), activacion tanh |
| Parametros totales | No disponible (redes de decenas de neuronas; el numero exacto no se publica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular; entrada de 4 o 5 caracteristicas) |
| Tipos de cuantizacion | No disponible (no se documentan procesos de cuantizacion) |
| Idiomas soportados | Ingles (documentacion y metadatos); el modelo no procesa texto |
| Licencia | No disponible |
| Formato de pesos | joblib (scikit-learn), artefactos Keras/TensorFlow y PyTorch; exportaciones en results/exports/{sklearn,tensorflow,pytorch} |

## Arquitectura y entrenamiento

El repositorio compara cuatro familias de modelos sobre dos pistas de caracteristicas. La pista A usa `solar_irradiance`, `current`, `voltage`, `temperature` y `humidity`; la pista B usa `solar_irradiance`, `temperature`, `humidity` y `hour`. La seleccion de hiperparametros de las redes neuronales explora dos arquitecturas, (10,) y (16, 8), con activacion tanh, optimizador Adam con tasa de aprendizaje 0,01, regularizacion L2 de 0,0001 sobre los kernels ocultos, un maximo de 1.000 epocas, paciencia de 30 y tamano de lote 16.

La evaluacion emplea validacion cruzada agrupada por dia: siete particiones externas y tres internas, con semillas 0, 1 y 2. El modelo S2 se selecciono por impactos en el limite de capacidad y despues por MAE interno, excluyendo las puntuaciones externas del proceso de seleccion. Los pesos finales de inferencia se ajustan sobre las 180 observaciones completas y no disponen de un conjunto de prueba de despliegue separado. El conjunto de datos procede de una unica instalacion universitaria, sin fechas de calendario completas ni registros de calibracion, y no se aportan validacion externa, pruebas de significacion ni intervalos de incertidumbre calibrados.

## Capacidades

- Regresion tabular supervisada: estima potencia solar en vatios a partir de mediciones contemporaneas.
- Dos modos de entrada: pista A (con corriente y voltaje) y pista B (solo meteorologia y hora decimal).
- Implementaciones en tres ecosistemas: scikit-learn (lineal y MLP), TensorFlow/Keras y PyTorch.
- Exportacion de artefactos con comprobaciones de igualdad de prediccion tras guardar y recargar.
- Aplicacion Streamlit con vista de prediccion individual y carga por lotes.
- Metadatos de procedencia, caracteristicas y ajustes en las exportaciones.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia y practicas de machine learning: comparar regresion lineal, MLP de scikit-learn y redes en TensorFlow y PyTorch sobre el mismo conjunto tabular, con particiones agrupadas por dia y multiples semillas para ilustrar buenas practicas de evaluacion.
- Investigacion reproducible en energia solar: replicar la comparativa de frameworks y analizar el efecto de incluir corriente y voltaje (pista A) frente a solo variables meteorologicas (pista B).
- Prototipado de un panel de monitorizacion: la aplicacion Streamlit permite introducir lecturas individuales o subir lotes y obtener una estimacion inmediata de potencia, util para demostraciones en laboratorio.
- Estimacion instantanea en una instalacion instrumentada: con sensores de irradiancia, corriente, voltaje, temperatura y humedad, el modelo lineal de la pista A ofrece un MAE de 0,978 W sobre las particiones de validacion, adecuado para comprobaciones de coherencia de lecturas.
- Analisis de sensibilidad de variables: entrenar y comparar las dos pistas para estudiar cuanto aporta la instrumentacion electrica frente a la meteorologica en la estimacion de potencia.
- Integracion en pipelines de investigacion con scikit-learn: cargar el estimador joblib mediante `model_registry.load_model` y encadenarlo con utilidades de preprocesado y validacion existentes.
- Referencia para calibracion de sensores: usar las discrepancias entre potencia medida y estimada como indicio de desviacion en la instrumentacion, siempre dentro del rango observado.

## Benchmarks y rendimiento

Resultados publicados en la model card (media +/- desviacion estandar poblacional entre semillas, sobre predicciones agrupadas de los pliegues externos):

| Pista | Modelo | MAE (W) | RMSE (W) | MAPE (%) | R2 |
|---|---|---:|---:|---:|---:|
| A | Lineal | 0,978 +/- 0,000 | 1,235 +/- 0,000 | 0,377 +/- 0,000 | 0,998 +/- 0,000 |
| A | Physics | 1,115 +/- 0,000 | 1,254 +/- 0,000 | 0,424 +/- 0,000 | 0,998 +/- 0,000 |
| A | PyTorch seleccionado | 1,624 +/- 0,148 | 2,405 +/- 0,145 | 0,622 +/- 0,062 | 0,992 +/- 0,001 |
| A | scikit-learn ajustado | 1,069 +/- 0,060 | 1,393 +/- 0,089 | 0,413 +/- 0,026 | 0,997 +/- 0,000 |
| A | scikit-learn sin ajustar | 1,304 +/- 0,538 | 3,580 +/- 3,118 | 0,505 +/- 0,214 | 0,970 +/- 0,039 |
| A | TensorFlow seleccionado | 1,334 +/- 0,159 | 1,863 +/- 0,297 | 0,515 +/- 0,059 | 0,995 +/- 0,002 |
| B | Lineal | 11,835 +/- 0,000 | 14,928 +/- 0,000 | 4,724 +/- 0,000 | 0,702 +/- 0,000 |
| B | PyTorch seleccionado | 12,032 +/- 0,262 | 15,027 +/- 0,246 | 4,806 +/- 0,097 | 0,698 +/- 0,010 |
| B | scikit-learn ajustado | 12,179 +/- 0,037 | 15,633 +/- 0,278 | 4,865 +/- 0,012 | 0,673 +/- 0,012 |
| B | scikit-learn sin ajustar | 14,044 +/- 0,267 | 18,890 +/- 1,219 | 5,584 +/- 0,136 | 0,521 +/- 0,063 |
| B | TensorFlow seleccionado | 11,951 +/- 0,317 | 14,989 +/- 0,372 | 4,761 +/- 0,107 | 0,700 +/- 0,015 |

Seis pliegues externos contienen 27 filas y uno contiene 18. Son retenciones agrupadas por dia, no previsiones cronologicas. No se han publicado comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada: practicamente nula; los modelos caben en CPU y en cualquier GPU con unos pocos cientos de MB.
- GPU recomendadas: no se requieren; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente, e incluso innecesaria.
- Cabe en GPU consumer: si, en cualquier modelo actual; tambien funciona en CPU sin problemas.
- Opciones de despliegue: aplicacion Streamlit incluida, carga directa de joblib con scikit-learn, y helpers `src/predict_tf.py` y `src/predict_torch.py` para TensorFlow y PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no cita alternativas de terceros ni referencias cruzadas con otros repositorios de prediccion solar. La unica comparacion interna es entre las familias implementadas (lineal, Physics, scikit-learn, TensorFlow y PyTorch) sobre las dos pistas de caracteristicas, recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- Conjunto de datos muy pequeno: 180 observaciones en 20 ficheros diarios, de una unica instalacion universitaria.
- Falta de validacion externa: no hay pruebas en otros emplazamientos ni intervalos de incertidumbre calibrados.
- No es un modelo de prevision: las particiones son retenciones agrupadas por dia, no pronosticos cronologicos a futuro.
- Los pesos finales se ajustan sobre todas las observaciones y carecen de conjunto de prueba de despliegue independiente.
- Las salidas lineales pueden ser implausibles fuera del rango observado.
- La pista A incluye corriente y voltaje; sus errores mas bajos no demuestran precision en prevision solo meteorologica.
- Riesgo de dependencia de versiones: los estimadores serializados pueden requerir las versiones de paquetes registradas.
- Solo se debe cargar el bundle desde fuentes de confianza, por el riesgo de deserializacion.
- Licencia no disponible: no se puede confirmar el uso comercial.
- No apta para operacion de red ni controles de seguridad, segun el propio autor.
- Idiomas: la documentacion esta en ingles y el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/OluwafisayoIbrahim/solar-power-prediction
- Evidencia interna citada en la model card: `results/comparison/`, `selection.json`, `completed.json`, `deployment/manuscript_evidence.json`
- Helpers de inferencia: `src/predict_tf.py`, `src/predict_torch.py`, `model_registry.load_model`
- Aplicacion de demostracion: vista Predict de Streamlit incluida en el repositorio
- No se han encontrado en la informacion disponible enlaces a papers, blogs o demos externas.
