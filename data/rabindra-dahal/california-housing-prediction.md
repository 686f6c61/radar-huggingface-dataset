# rabindra-dahal/california-housing-prediction

## Resumen

El modelo `rabindra-dahal/california-housing-prediction` es una regresión lineal múltiple implementada en PyTorch (`nn.Module`) para predecir el valor mediano de la vivienda en bloques censales de California a partir de ocho variables socioeconómicas y geográficas. Lo desarrolla Rabindra Dahal y se publica en Hugging Face con licencia MIT. No es un modelo de lenguaje: es un modelo tabular de regresión, con una única capa lineal que aproxima la relación entre las características del vecindario y el precio de la vivienda.

Su relevancia es la de un baseline paramétrico transparente y reproducible sobre el dataset clásico `fetch_california_housing` de scikit-learn (20.640 observaciones). Sirve para analizar contribuciones lineales directas de cada feature y elasticidades económicas, y como referencia mínima contra la que comparar modelos tabulares más complejos (gradient boosting, redes profundas, etc.).

El modelo no dispone de arquitectura transformer, ni de contexto, ni de capacidades generativas: cualquier uso debe entenderse en el ámbito estricto de la inferencia tabular con features estandarizadas mediante el `StandardScaler` del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (una capa `nn.Linear` en PyTorch) |
| Parametros totales | 9 (8 pesos + 1 sesgo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se documentan; el modelo es de precision completa en PyTorch) |
| Idiomas soportados | en (segun metadatos; el modelo no procesa lenguaje, solo features numericas) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no especifica formato; framework PyTorch) |

## Arquitectura y entrenamiento

Arquitectura de regresion lineal multiple: una sola capa lineal que mapea 8 features de entrada a un escalar de salida (valor mediano de vivienda en unidades de 100.000 USD). No hay capas ocultas, activaciones no lineales ni mecanismos de atencion. El modelo se entrena con `nn.MSELoss` y optimizador Adam con `lr=0.01` durante 2000 epocas, sobre una division 80/20 entrenamiento/prueba del dataset California Housing (20.640 observaciones). Las features se estandarizan con `StandardScaler` de scikit-learn antes del entrenamiento.

La convergencia es estable a partir de la epoca 800, con una brecha de sobreajuste despreciable entre entrenamiento y prueba (MSE 0.5179 frente a 0.5559). Los coeficientes aprendidos (sobre features normalizadas) muestran el peso dominante de `Latitude` (-0.8969) y `Longitude` (-0.8698), seguidos de `MedInc` (0.8544), y un intercepto de 2.0719. No se documenta ningun tipo de RLHF, DPO ni innovacion arquitectonica adicional.

## Capacidades

- Regresion tabular: prediccion de un valor continuo (precio mediano de vivienda) a partir de 8 features numericas.
- Interpretabilidad directa: los coeficientes normalizados permiten leer la contribucion lineal de cada feature.
- Analisis de elasticidades: util para estudiar relaciones lineales entre renta mediana, edad de la vivienda, ocupacion, coordenadas y precio.
- Inferencia en CPU sin requisitos de GPU, dado el tamano trivial del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No tiene capacidades multilingues en sentido estricto: solo procesa features numericas; el campo `language: en` es metadata del repositorio.

## Casos de uso

- Baseline de referencia en pipelines de modelado tabular: usar este modelo como suelo de rendimiento antes de probar gradient boosting o redes profundas sobre California Housing, comparando MSE y MAE en el mismo split 80/20.
- Analisis exploratorio de elasticidades: emplear los coeficientes normalizados para cuantificar el efecto lineal de `MedInc`, `Latitude` y `Longitude` sobre el precio mediano, util en estudios economicos preliminares.
- Docencia y formacion: ejemplo minimo y reproducible de regresion lineal en PyTorch con `nn.MSELoss` y Adam, adecuado para practicas de introduccion al aprendizaje automatico.
- Validacion de pipelines de preprocesado: comprobar que un `StandardScaler` replica exactamente las medias y desviaciones del entrenamiento; el modelo es muy sensible a la estandarizacion, lo que lo convierte en un test util de integridad del pipeline.
- Pruebas de integracion y CI/CD de servicios de inferencia tabular: por su tamano (9 parametros) y licencia MIT, sirve como modelo de humo para validar endpoints de prediccion sin coste de GPU.
- Prototipado rapido de estimadores de precio a nivel de bloque censal en California, siempre como aproximacion lineal y nunca como modelo de produccion para decisiones financieras.
- Benchmarking de latencia en entornos edge o CPU: permite medir overhead de frameworks de serving (TorchServe, BentoML, FastAPI) con un modelo de coste computacional despreciable.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el split de prueba (20% de 20.640 observaciones):

| Metrica | Valor |
|---|---|
| MSE entrenamiento | 0.5179 |
| MSE prueba | 0.5559 |
| MAE (error absoluto medio) | 53.319,95 USD |
| Intercepto (baseline) | 2.0719 |
| Epoca de convergencia estable | 800 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de regresion tabular.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable (< 1 MB); el modelo tiene 9 parametros en float32.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. Funciona en A100, H100, RTX 4090 o en un portatil sin diferencias practicas.
- Cabe en cualquier GPU consumer, integrada o en CPU pura.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`), TorchServe, BentoML, FastAPI con Uvicorn, ONNX Runtime tras exportacion. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no documentados; por el tamano del modelo se espera latencia en el orden de microsegundos a milisegundos por muestra en CPU, dominada por el overhead del framework, no por el computo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rabindra-dahal/california-housing-prediction | Regresion lineal (PyTorch) | 9 | no aplica | MSE test 0.5559; MAE 53.319,95 USD | MIT | Hugging Face |
| Regresion lineal de scikit-learn sobre California Housing | Regresion lineal (sklearn) | 9 | no aplica | no disponible en esta ficha | BSD-3-Clause | scikit-learn |
| Gradient boosting (p. ej. XGBoost/LightGBM) sobre California Housing | Ensemble de arboles | no disponible | no aplica | habitualmente superior a la regresion lineal en este dataset, aunque no se aportan cifras verificadas aqui | depende de implementacion | amplia |
| Red neuronal MLP sobre California Housing | MLP | no disponible | no aplica | no disponible | depende de implementacion | amplia |

No se dispone de cifras comparativas verificadas de los modelos alternativos en la informacion proporcionada; las filas se incluyen como referencia cualitativa de categoria, no como benchmark numerico.

## Limitaciones y advertencias

- Modelo estrictamente lineal: no captura interacciones espaciales complejas ni fronteras administrativas, tal y como advierte el autor.
- Alta sensibilidad al preprocesado: las features deben estandarizarse con exactamente el `StandardScaler` del entrenamiento; cualquier desviacion invalida las predicciones.
- Error absoluto medio de 53.319,95 USD, elevado en terminos relativos para decisiones de valoracion inmobiliaria real.
- Riesgo de extrapolacion: fuera del rango de las 20.640 observaciones de California, las predicciones lineales carecen de garantia.
- Sesgos potenciales derivados del dataset original (California Housing de 1990), que no refleja el mercado actual ni la diversidad geografica fuera del estado.
- No es un modelo de lenguaje: no admite prompts, texto libre ni instrucciones; cualquier intento de uso conversacional es inadecuado.
- Licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias de idoneidad para produccion.
- Sin mantenimiento documentado: creado y actualizado en noviembre de 2026, con 0 descargas y 0 likes, lo que sugiere ausencia de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/rabindra-dahal/california-housing-prediction
- Dataset California Housing (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.datasets.fetch_california_housing.html
- Documentacion de PyTorch `nn.Linear`: https://pytorch.org/docs/stable/generated/torch.nn.Linear.html
- Documentacion de PyTorch `nn.MSELoss`: https://pytorch.org/docs/stable/generated/torch.nn.MSELoss.html
- `StandardScaler` de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.StandardScaler.html
