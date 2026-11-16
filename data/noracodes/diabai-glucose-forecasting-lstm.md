# noracodes/diabai-glucose-forecasting-lstm

## Resumen

DiabAI 30-Minute Glucose LSTM es un modelo educativo de previsión de glucosa desarrollado por noracodes y publicado en Hugging Face bajo licencia CC BY 4.0. Su función es predecir el cambio de glucosa a 30 minutos vista a partir de las 24 horas previas de lecturas de monitorización continua de glucosa (CGM) muestreadas cada 15 minutos, junto con la hora del día y el tipo de diabetes del paciente. La salida se expresa en mg/dL y se obtiene sumando el cambio predicho a la glucosa actual.

Técnicamente es una red LSTM de una sola capa con 19.617 parámetros entrenables, tamaño oculto de 64 y una cabeza de predicción de 67 a 32 a 1 con dropout de 0,1. Recibe dos canales de secuencia (glucosa normalizada y primera diferencia normalizada) más tres entradas estáticas (seno y coseno de la hora, e indicador de diabetes tipo 1). No es un modelo de lenguaje ni un transformer: es un predictor de series temporales especializado y de huella mínima.

Su relevancia es acotada pero clara: sirve como referencia reproducible y de bajo coste para experimentos retrospectivos de previsión de CGM, con una separación estricta por paciente entre entrenamiento y test, y con resultados publicados frente a líneas base clásicas (persistencia, regresión lineal y random forest sobre deltas). El autor declara explícitamente que no es un dispositivo médico y que no debe usarse para diagnóstico, tratamiento ni dosificación de insulina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LSTM de una capa con cabeza MLP (67 a 32 a 1) y dropout 0,1 |
| Parámetros totales | 19.617 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 lecturas de 15 minutos (24 horas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`, state dict completo con estadísticas de normalización) |
| Canales de entrada | Glucosa normalizada y primera diferencia normalizada |
| Entradas estáticas | Seno de la hora, coseno de la hora, indicador T1DM |
| Horizonte de predicción | 30 minutos |
| Unidad de salida | mg/dL |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una LSTM de una sola capa que procesa secuencias de 96 pasos con dos canales: glucosa normalizada y su primera diferencia normalizada. La salida recurrente se combina con tres entradas estáticas (seno y coseno de la hora del día e indicador binario de diabetes tipo 1) y pasa por una cabeza densa de 67 a 32 a 1 con dropout de 0,1. La predicción no es el nivel absoluto de glucosa, sino el delta a 30 minutos, que se suma a la glucosa actual. Esta formulación de residuo es habitual en previsión de CGM porque estabiliza el entrenamiento frente a la fuerte autocorrelación de la señal.

Los datos provienen de los conjuntos ShanghaiT1DM y ShanghaiT2DM (Figshare DOI 10.6084/m9.figshare.21600933.v5), con 12 participantes con T1DM y 100 con T2DM en origen, de los que resultaron utilizables 12 y 98 respectivamente. Tras el filtrado quedaron 93 pacientes de desarrollo y 17 de test reservados, con 96.068 ejemplos de desarrollo y 16.992 de test. Las grabaciones se alinearon a una rejilla exacta de 15 minutos, las secuencias no cruzan huecos de registro y la separación entre conjuntos se hizo por paciente, no por fila, lo que evita fuga de información. Las estadísticas de normalización se calcularon solo con el split de entrenamiento original. El autor comparó CNN, LSTM y transformer con las mismas entradas y splits, y seleccionó la LSTM únicamente porque obtuvo el MAE de validación más bajo a precisión completa (8,4599 frente a 8,4601 de la CNN y 8,4639 del transformer), diferencias que el propio autor califica de empate práctico. El entrenamiento final usó 7 épocas, batch de 512, learning rate de 0,001, weight decay de 0,0001 y semilla 42, sobre Python 3.11.9 y PyTorch 2.15.0 en CPU. No se documenta RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de regresión numérica.

## Capacidades

- Previsión de glucosa a 30 minutos en mg/dL a partir de 24 horas de historial CGM con cadencia de 15 minutos.
- Modelado del cambio de glucosa (delta) en lugar del nivel absoluto, lo que permite integrarlo como corrección sobre la lectura actual.
- Condicionamiento temporal mediante codificación cíclica de la hora (seno y coseno), útil para capturar patrones circadianos.
- Diferenciación por cohorte mediante un indicador estático de diabetes tipo 1 frente a tipo 2.
- Inferencia en CPU: el modelo es tan pequeño (19.617 parámetros) que no requiere GPU.
- Ejecución mediante un script de inferencia incluido (`inference.py`) con un esquema JSON de entrada definido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto. Es exclusivamente un regresor de series temporales.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Prototipos educativos de previsión de CGM: el modelo permite montar un cuaderno o una demo que, dada una ventana de 96 lecturas, devuelve la glucosa esperada a 30 minutos, con un coste computacional despreciable y sin GPU.
- Reproducción de experimentos académicos: al incluir semilla, hiperparámetros, splits por paciente y estadísticas de normalización dentro de `model.pt`, sirve como línea base reproducible para comparar nuevas arquitecturas (CNN, transformer, modelos híbridos) sobre el mismo dataset de Shanghai.
- Evaluación de pipelines de datos CGM: útil para probar la lógica de alineación a rejilla de 15 minutos, gestión de huecos y normalización antes de invertir en modelos mayores.
- Comparación con líneas base clásicas: el autor publica resultados frente a persistencia, regresión lineal y random forest sobre deltas, de modo que el modelo puede usarse como referencia mínima en estudios retrospectivos.
- Docencia sobre series temporales clínicas: con 19.617 parámetros y una arquitectura de una capa, es un ejemplo didáctico manejable para explicar formulación de residuos, codificación cíclica del tiempo y separación por paciente.
- Análisis retrospectivo de cohortes: permite estudiar el error del modelo por rango glucémico (por debajo de 70, entre 70 y 180, por encima de 180 mg/dL) y por tipo de diabetes, lo que ayuda a identificar dónde falla la previsión.
- Integración en prototipos no clínicos con revisión humana: cualquier sistema de visualización que muestre una previsión orientativa debe tratarla como informativa y nunca como base para decisiones de tratamiento.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (17 pacientes, 16.992 ejemplos), publicados por el autor:

| Método | MAE (mg/dL) | RMSE (mg/dL) | R² |
|---|---:|---:|---:|
| Persistencia | 11,4002 | 16,9058 | 0,8804 |
| Regresión lineal | 9,2644 | 13,1625 | 0,9274 |
| Random forest sobre deltas | 8,8821 | 12,8176 | 0,9311 |
| LSTM (este modelo) | 8,7502 | 12,6120 | 0,9335 |

La LSTM reduce el MAE un 23,25 % respecto a la persistencia. El autor advierte que las tuberías clásica y secuencial difieren en 18 ejemplos válidos de test, por lo que la comparación entre ambas no es fila a fila idéntica.

Comparación de arquitecturas en validación (mismas entradas y splits):

| Modelo | MAE validación | RMSE | R² |
|---|---:|---:|---:|
| CNN | 8,4601 | 12,0601 | 0,9470 |
| LSTM | 8,4599 | 12,1097 | 0,9466 |
| Transformer | 8,4639 | 12,1905 | 0,9459 |

Rendimiento por cohorte en test:

| Cohorte | Ejemplos | MAE | RMSE | R² |
|---|---:|---:|---:|---:|
| T1DM | 2.060 | 9,7489 | 13,5699 | 0,9481 |
| T2DM | 14.932 | 8,6125 | 12,4741 | 0,9303 |

Rendimiento por rango de glucosa real en test:

| Rango (mg/dL) | Ejemplos | MAE | RMSE | R² |
|---|---:|---:|---:|---:|
| Por debajo de 70 | 520 | 6,2978 | 8,4891 | -0,2715 |
| 70 a 180 | 13.531 | 7,9208 | 11,3424 | 0,8476 |
| Por encima de 180 | 2.941 | 13,0000 | 17,7305 | 0,7104 |

El R² negativo en el subgrupo por debajo de 70 mg/dL se explica en parte por el rango objetivo estrecho de ese subgrupo, y no implica que sea el de mayor MAE.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo tiene 19.617 parámetros y el autor lo entrenó y evaluó en CPU con PyTorch 2.15.0.
- GPU recomendadas: ninguna necesaria. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) sobra para inferencia por lotes, pero no aporta ventaja relevante.
- Cabe en cualquier GPU consumer y también en Raspberry Pi o entornos sin acelerador, siempre que se disponga de PyTorch.
- Opciones de despliegue: script `inference.py` incluido; al ser un `state dict` de PyTorch, puede servirse con TorchServe, FastAPI o un simple envoltorio Python. No hay pesos GGUF ni integración con vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no publicados. Por el tamaño (19.617 parámetros y secuencias de 96 pasos), la inferencia en CPU es del orden de milisegundos por ejemplo, aunque el autor no proporciona cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto de entrada | MAE test (mg/dL) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| DiabAI Glucose LSTM | LSTM + MLP | 19.617 | 96 lecturas (24 h) | 8,7502 | CC BY 4.0 | Hugging Face |
| CNN (misma comparación del autor) | CNN | no disponible | 96 lecturas (24 h) | no evaluado en test final | no disponible | no disponible como artefacto |
| Transformer (misma comparación del autor) | Transformer | no disponible | 96 lecturas (24 h) | no evaluado en test final | no disponible | no disponible como artefacto |
| Random forest sobre deltas | Modelo clásico | no disponible | 96 lecturas (24 h) | 8,8821 | no disponible | no disponible |
| Persistencia | Línea base trivial | 0 | lectura actual | 11,4002 | no aplica | no aplica |

No se dispone de comparación directa con otros modelos publicados de previsión de CGM en la información proporcionada, más allá de la referencia genérica a que, en estudios independientes sobre diabetes tipo 2, la LSTM mostró el mejor rendimiento entre modelos convencionales frente a GPT-4.1 y LLaMA-7B en horizontes de 30, 60 y 90 minutos. Esa referencia no emplea el mismo dataset ni la misma formulación, por lo que no es una comparación equivalente.

## Limitaciones y advertencias

- No es un dispositivo médico. El autor prohíbe explícitamente su uso para diagnóstico, tratamiento, detección de emergencias o dosificación de insulina.
- No debe usarse una predicción para cambiar decisiones de medicación, alimentación o ejercicio.
- Los datos de origen proceden de una cohorte clínica china limitada (12 T1DM y 98 T2DM utilizables), por lo que la generalización a otras poblaciones, países, dispositivos CGM, niños, embarazo o entornos asistenciales distintos no está garantizada.
- El T1DM está infrarepresentado frente al T2DM (2.060 frente a 14.932 ejemplos de test), lo que sesga el rendimiento agregado hacia la cohorte tipo 2.
- Comidas, pautas de insulina, ejercicio, estrés, sueño, enfermedad y medicación no son entradas directas del modelo, lo que limita su capacidad en situaciones con eventos no observados.
- El rendimiento es más débil por encima de 180 mg/dL (MAE de 13,0000 y R² de 0,7104) y el R² es negativo por debajo de 70 mg/dL.
- Requiere una secuencia completa de 24 horas muestreada cada 15 minutos; el helper de inferencia no imputa lecturas faltantes.
- Un error medio bajo no garantiza seguridad para una predicción individual.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el autor exige citar el repositorio del modelo y el DOI del dataset de Shanghai al reutilizar el modelo o los resultados.
- El repositorio no incluye datos de pacientes en bruto, lo que impide reentrenar sin descargar el dataset original.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de predicción errónea con apariencia de precisión en regímenes glucémicos atípicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noracodes/diabai-glucose-forecasting-lstm
- Dataset en Figshare: https://doi.org/10.6084/m9.figshare.21600933.v5
- Artículo del dataset (Scientific Data): https://www.nature.com/articles/s41597-023-01940-7
- Estudio sobre previsión interpretable de glucosa en diabetes tipo 2: https://pmc.ncbi.nlm.nih.gov/articles/PMC12819561
- Estudio sobre predicción a largo plazo de glucosa en diabetes tipo 1: https://pmc.ncbi.nlm.nih.gov/articles/PMC10658677/
