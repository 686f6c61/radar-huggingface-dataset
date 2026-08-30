# barnadeepb/grid-stability-mlp-full

## Resumen

El modelo `barnadeepb/grid-stability-mlp-full` es un artefacto de investigacion y reproducibilidad, no un modelo de lenguaje ni un transformer. Consiste en un pipeline de scikit-learn compuesto por un `StandardScaler` seguido de un `MLPClassifier` con capas ocultas de 64 y 32 neuronas, entrenado para clasificar la estabilidad de una red electrica (estable/inestable) sobre el conjunto de datos UCI Electrical Grid Stability Simulated Data. Lo desarrolla barnadeepb como parte de un estudio comparativo de siete modelos para clasificacion de estabilidad en redes inteligentes, con foco en la viabilidad de despliegue en hardware de borde (edge computing) en subestaciones.

El modelo se presenta como el candidato practico mas solido segun el analisis del autor: estadisticamente empatado en precision con el mejor metodo clasico (XGBoost) pero con menor latencia de inferencia y aproximadamente 6 veces menor tamano en disco. Es relevante porque aborda un problema critico en la transicion energetica: predecir la estabilidad de la red en tiempo real con modelos ligeros que puedan ejecutarse en dispositivos con recursos limitados, en lugar de depender de infraestructura centralizada. La arquitectura es un perceptron multicapa clasico, con 12 caracteristicas de entrada (segun el dataset UCI) y una salida binaria. El contexto de ventana no aplica al ser un modelo tabular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + MLPClassifier (capas ocultas 64, 32) |
| Parametros totales | No disponible (el numero exacto de pesos no se publica en la model card; estimable a partir de 12 entradas, 64 y 32 neuronas, 1 salida) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye como archivo joblib, sin cuantizacion publicada) |
| Idiomas soportados | No aplica (modelo numerico, no de texto) |
| Licencia | MIT (codigo y pesos); dataset de entrenamiento bajo CC BY 4.0 (Arzamasov, 2018) |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn que normaliza las 12 caracteristicas de entrada mediante `StandardScaler` (media 0 y desviacion 1) y luego clasifica con un `MLPClassifier` de dos capas ocultas (64 y 32 neuronas) y activacion ReLU por defecto. No se trata de un transformer ni de un modelo de lenguaje; es una red neuronal feedforward clasica para clasificacion tabular. El entrenamiento se realizo sobre el dataset UCI Electrical Grid Stability Simulated Data (Arzamasov, 2018), que simula un esquema de control descentralizado de red inteligente (DSGC) en una topologia de 4 nodos en estrella. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, ya que no aplican a este tipo de modelo. La innovacion principal no esta en la arquitectura (un MLP estandar) sino en el analisis de compromiso entre precision, latencia y tamano para despliegue en borde, que es el objeto del paper asociado.

## Capacidades

- Clasificacion binaria de estabilidad de red electrica (estable/inestable) a partir de 12 variables numericas simuladas (potencia, reaccion, etc.).
- Inferencia de baja latencia y huella en disco reducida, disenada para entornos con recursos limitados (edge computing).
- Reproducibilidad: el pipeline completo se puede cargar con `joblib.load()` y aplicar directamente a un DataFrame con las 12 columnas esperadas.
- No soporta generacion de texto, tool calling, agentes, vision ni capacidades multilingues. Es un modelo exclusivamente tabular.

## Casos de uso

- Investigacion academica sobre clasificacion de estabilidad en redes inteligentes: el modelo sirve como punto de partida para reproducir los resultados del paper y comparar con otros metodos (XGBoost, SVM, etc.) en terminos de precision, latencia y tamano.
- Evaluacion de viabilidad de despliegue en hardware de borde: se puede medir la latencia real en dispositivos como Raspberry Pi o servidores de subestacion para validar las afirmaciones del paper.
- Retraining y fine-tuning con telemetria real de subestaciones o microgrids: el pipeline permite cargar los pesos y reentrenar con datos no simulados, aunque el autor advierte que la generalizacion a topologias distintas no esta probada.
- Benchmarking de modelos ligeros para monitorizacion temprana de inestabilidad: el modelo puede actuar como senal de alerta temprana en un sistema de monitorizacion, siempre que no se conecte directamente a circuitos de disparo (trip) de proteccion.
- Comparacion de tecnicas de preprocesamiento y arquitecturas: al ser un artefacto reproducible, permite estudiar el efecto de la normalizacion y del tamano de las capas en la precision.
- Educacion y formacion en ML aplicado a energia: sirve como ejemplo practico de pipeline completo (escalado + red neuronal) sobre un dataset publico y relevante del sector.

## Benchmarks y rendimiento

La model card no publica metricas numericas concretas (precision, F1, etc.) en la informacion disponible. El autor menciona en el README que el modelo esta "estadisticamente empatado en precision con el mejor metodo clasico (gradient boosting via XGBoost)" y que es "mas rapido y aproximadamente 6 veces menor en disco", pero no se proporcionan cifras exactas. Tampoco se indican resultados de MMLU, HumanEval u otros benchmarks estandar, ya que no aplican a un clasificador tabular. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica, ya que el modelo es un pipeline de scikit-learn que se ejecuta en CPU. No requiere GPU.
- GPU recomendada: ninguna. El modelo es extremadamente ligero (un MLP de dos capas con 12 entradas) y puede ejecutarse en cualquier CPU moderna, incluso en microcontroladores o SBC (single-board computers) como Raspberry Pi.
- Compatibilidad con hardware de consumo: total. Cabe en cualquier dispositivo con Python y scikit-learn instalados; el archivo joblib ocupa menos de unos pocos cientos de kilobytes (el autor menciona que es 6 veces menor que XGBoost, aunque no da el tamano absoluto).
- Opciones de despliegue: se puede integrar en servicios web con Flask/FastAPI, en pipelines de procesamiento por lotes, o en dispositivos de borde mediante Python embebido. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras exactas, pero el paper indica que es mas rapido que XGBoost; en una CPU moderna, la inferencia de un MLP de este tamano deberia ser del orden de microsegundos por muestra.

## Comparativa con modelos similares

La informacion disponible no permite una comparativa exhaustiva con otros modelos, pero el paper del autor compara siete modelos en el mismo dataset. Segun la model card, el MLP esta estadisticamente empatado en precision con XGBoost (gradient boosting) y es superior en latencia y tamano. No se dan nombres de los otros cinco modelos ni cifras concretas. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Precision | Latencia | Tamano en disco | Licencia |
|---|---|---|---|---|
| MLP (este modelo) | Empatado estadisticamente con XGBoost (sin cifras publicadas) | Menor que XGBoost | ~6x menor que XGBoost | MIT |
| XGBoost (gradient boosting) | Empatado estadisticamente con el MLP | Mayor que el MLP | ~6x mayor que el MLP | No especificada en la informacion |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado y evaluado exclusivamente con datos simulados de una topologia de red pequena (4 nodos en estrella). La generalizacion a otras topologias o a telemetria real de subestaciones no esta probada.
- No se realizo una evaluacion de robustez frente a entradas adversariales o ruido en los canales de comunicacion.
- Las cifras de latencia y tamano reportadas en el paper se midieron en una estacion de trabajo de desarrollo, no en hardware de borde certificado. Los resultados pueden variar en entornos de produccion.
- El modelo no debe utilizarse directamente en circuitos de proteccion, disparo o decisiones de seguridad critica. No ha sido certificado segun normas como IEC 61850-5 o IEEE 1646. Debe usarse unicamente como senal de alerta temprana, independiente de los reles de proteccion deterministicos.
- La licencia MIT cubre el codigo y los pesos, pero el dataset de entrenamiento (UCI Electrical Grid Stability Simulated Data) tiene su propia licencia CC BY 4.0. Es necesario respetar ambas al redistribuir o modificar el modelo.
- Al ser un clasificador binario sobre datos numericos, no ofrece capacidades de explicabilidad inherentes; se necesitarian tecnicas adicionales (SHAP, LIME) para interpretar decisiones.
- No se proporcionan metadatos sobre la version de scikit-learn utilizada, lo que puede afectar a la reproducibilidad en entornos con versiones diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/barnadeepb/grid-stability-mlp-full
- Repositorio GitHub del estudio: https://github.com/barnadeepb/grids-stability-study-for-edge-ml
- Dataset UCI Electrical Grid Stability Simulated Data: https://archive.ics.uci.edu/dataset/471/electrical+grid+stability+simulated+data
- Paper asociado (citacion pendiente en el repositorio publico): no disponible en la informacion proporcionada
