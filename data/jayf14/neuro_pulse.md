# JayF14/Neuro_Pulse

## Resumen

Neuro_Pulse es un clasificador tabular para la predicción de crisis epilépticas desarrollado por el usuario JayF14 y publicado en HuggingFace. El modelo distingue entre estados preictales (ventanas inmediatamente anteriores a una crisis) e interictales (actividad normal) a partir de características extraídas de señales EEG de cuero cabelludo. No es un modelo de lenguaje ni un modelo generativo: se distribuye como artefactos serializados en formato `.pkl` (pickle/joblib) que se cargan desde Python para inferencia sobre vectores de características precalculadas.

El repositorio incluye tanto los modelos entrenados (`master_model.pkl`, `ensemble_model.pkl` y `xgboost_model.pkl`) como el conjunto de datos procesado y etiquetado derivado de la base de datos pública CHB-MIT Scalp EEG Database, con ficheros CSV por paciente (`chbXX_labeled_features.csv`) que cubren los sujetos `chb01` a `chb24`. El autor declara métricas de accuracy del 99,12 %, F1 del 93,63 %, sensibilidad del 94,30 %, especificidad del 99,48 % y ROC AUC del 99,79 % sobre un conjunto de prueba con 13.356 muestras interictales y 982 preictales.

Su relevancia actual es acotada pero concreta: la predicción de crisis a partir de EEG es un problema con alta desproporción de clases y fuerte dependencia del paciente, y disponer de un artefacto reproducible y con licencia MIT facilita construir líneas base y comparar pipelines de extracción de características. Con cero descargas y cero "likes" en el momento de la consulta, se trata de un recurso sin validación independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Se distribuyen tres artefactos serializados (`master_model.pkl`, `ensemble_model.pkl`, `xgboost_model.pkl`); el nombre del tercero indica XGBoost, pero la model card no documenta la arquitectura del resto ni la composicion del ensemble |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (clasificador tabular: la entrada es un vector de caracteristicas, no una secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (idioma de la model card y de los metadatos; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (serializacion pickle/joblib) |
| Tarea | clasificacion binaria tabular: preictal vs. interictal |
| Entrada | vector de caracteristicas EEG precalculadas, en CSV |
| Salida | etiqueta de clase (y puntuacion de probabilidad, segun el estimador cargado) |
| Dataset de entrenamiento | caracteristicas derivadas de CHB-MIT Scalp EEG Database, pacientes `chb01`-`chb24` |
| Tamano del repositorio | 0,1 GB |
| Metricas declaradas | accuracy, F1, sensibilidad, especificidad, ROC AUC |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo, el procedimiento de entrenamiento, la funcion de perdida, el numero de estimadores ni el esquema de validacion. Los unicos indicios disponibles son los nombres de los ficheros: `xgboost_model.pkl` apunta a gradient boosting sobre arboles de decision, y `ensemble_model.pkl` sugiere una combinacion de varios estimadores, con `master_model.pkl` como posible artefacto agregado. Sus tamaños, hiperparametros y relaciones jerarquicas entre ellos no estan documentados.

Respecto a los datos, se indica que el conjunto contiene caracteristicas EEG "fully processed and labeled" derivadas de CHB-MIT para los pacientes `chb01` a `chb24`, distribuidas en un CSV por paciente. El conjunto de prueba declarado contiene 13.356 muestras interictales y 982 preictales, lo que supone una proporcion de clase positiva de aproximadamente el 6,8 %. No se especifica el numero de caracteristicas por muestra, la ventana temporal empleada, si el modelo es especifico por paciente o pooled, ni si la particion de entrenamiento y prueba es por paciente o por ventana, un detalle critico para evaluar el riesgo de fuga de informacion entre ventanas solapadas. Tampoco se mencionan tecnicas de balanceo, calibracion o regularizacion.

## Capacidades

- Clasificacion binaria de ventanas EEG en estado preictal o interictal.
- Inferencia sobre caracteristicas tabulares precalculadas, no sobre señal EEG cruda.
- Carga directa desde Python mediante `joblib` o `pickle`, con descarga desde el Hub a traves de `hf_hub_download`.
- Tres artefactos alternativos que permiten comparar un supuesto modelo individual, un ensemble y un modelo XGBoost sobre las mismas caracteristicas.
- Distribucion del dataset procesado en CSV por paciente, reutilizable para reentrenamiento o evaluacion.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (el modelo no procesa lenguaje).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Linea base reproducible en investigacion sobre prediccion de crisis: el repositorio entrega modelo y caracteristicas ya procesadas de CHB-MIT, de modo que un grupo de investigacion puede reproducir las metricas declaradas y usarlas como referencia al evaluar nuevos pipelines de extraccion de caracteristicas.
- Componente de un sistema de alerta temprana en monitorizacion EEG hospitalaria: el clasificador puede consumir ventanas de caracteristicas generadas en streaming y emitir una puntuacion de riesgo preictal que el personal clinico use como aviso, siempre con supervision medica y validacion regulatoria previa.
- Triaje y priorizacion de revision en unidades de epilepsia: etiquetar automaticamente fragmentos como candidatos preictales permite que el epileptologo revise primero los segmentos de mayor interes en lugar de la grabacion completa.
- Filtrado previo en dispositivos de EEG ambulatorio o wearable: al operar sobre vectores de caracteristicas de baja dimensionalidad y sin GPU, permite reducir el numero de eventos que se transmiten a la nube o que se almacenan en el dispositivo.
- Evaluacion comparativa de pipelines de feature engineering: al ser un modelo tabular de coste de inferencia bajo, sirve para medir cuanto de la mejora en metrica proviene de las caracteristicas y cuanto del clasificador.
- Prototipado rapido en software medico: integrar el `.pkl` en un servicio FastAPI o en un cuaderno de investigacion para demostrar el flujo completo desde las caracteristicas EEG hasta la prediccion, sin dependencia de hardware especializado.
- Docencia y formacion en analitica de senales biomedicas: el par dataset/modelo permite trabajar con un problema real de clasificacion desbalanceada y discutir metricas como sensibilidad y especificidad frente a accuracy.
- Generacion de caracteristicas etiquetadas para otros modelos: los CSV se pueden reutilizar como fuente de datos etiquetados para entrenar clasificadores alternativos (redes neuronales, regresion logistica, etc.).

## Benchmarks y rendimiento

Los unicos datos de rendimiento disponibles son los declarados por el autor en la model card. No se aporta comparacion con otros modelos, ni desglose por paciente, ni intervalos de confianza o validacion cruzada.

| Metrica | Valor declarado |
|---|---|
| Accuracy | 99,12 % |
| F1 | 93,63 % |
| Sensibilidad | 94,30 % |
| Especificidad | 99,48 % |
| ROC AUC | 99,79 % |

| Conjunto de prueba declarado | Numero de muestras |
|---|---|
| Interictal | 13.356 |
| Preictal | 982 |

No se han publicado resultados de benchmarks comparativos ni evaluaciones por parte de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; por la naturaleza del modelo (caracteristicas tabulares serializadas, repositorio de 0,1 GB) es esperable que la inferencia se ejecute en CPU sin memoria de GPU dedicada.
- GPU recomendadas: no aplica. No se documenta ningun requisito de GPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo no requiere GPU. Cualquier equipo capaz de ejecutar Python y las librerias de serializacion correspondientes es suficiente.
- Opciones de despliegue: carga en proceso Python con `joblib`/`pickle`, servicio HTTP propio (FastAPI, Flask), empaquetado con herramientas de serving de modelos clasicos. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de muestras por segundo.

## Comparativa con modelos similares

No se ha proporcionado informacion sobre modelos comparables en la documentacion disponible. No se dispone de alternativas con parametros, contexto o licencia conocidos dentro de la informacion suministrada.

| Modelo | Parametros | Contexto | Metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuro_Pulse (JayF14) | no disponible | no aplica | accuracy 99,12 %, F1 93,63 %, ROC AUC 99,79 %, segun el autor | MIT | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Desbalanceo de clases severo: 982 muestras preictales frente a 13.356 interictales en el conjunto de prueba (aproximadamente 6,8 % de positivos). La accuracy es una metrica poco informativa en este regimen; la sensibilidad y la especificidad declaradas son mas relevantes, pero no se acompanan de intervalos de confianza.
- Metricas autodeclaradas: no hay validacion independiente, publicacion revisada por pares ni evaluacion por terceros. El repositorio registra cero descargas y cero "likes" en el momento de la consulta.
- Particion de datos no documentada: se desconoce si la separacion entre entrenamiento y prueba es por paciente o por ventana temporal. Si las ventanas se solapan o provienen del mismo paciente en ambos conjuntos, las metricas pueden estar sobreestimadas por fuga de informacion.
- Generalizacion entre pacientes no acreditada: no se informa de resultados por paciente ni de validacion leave-one-patient-out, un escenario critico dado que la morfologia de las crisis y de los artefactos varia notablemente entre sujetos.
- Dependencia de un pipeline de caracteristicas no publicado: el modelo no consume EEG crudo. Sin la receta exacta de extraccion de caracteristicas, la reproducibilidad en produccion queda comprometida.
- Idioma y documentacion: la model card esta unicamente en ingles y es muy breve; no se documentan versiones, hiperparametros ni semillas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos con consecuencias clinicas si se usa sin supervision.
- Uso clinico regulado: aunque la licencia MIT permite el uso comercial del artefacto, cualquier aplicacion de diagnostico o prediccion clinica esta sujeta a la normativa de productos sanitarios (por ejemplo, marcado CE o autorizacion equivalente), que la licencia no cubre.
- Sesgos potenciales: la base CHB-MIT procede de un numero reducido de pacientes pediatricos y adultos de un contexto hospitalario concreto, por lo que la representatividad poblacional es limitada.
- Inexistencia de garantias: al ser un recurso sin mantenimiento conocido ni issues, no hay soporte ante fallos de compatibilidad con versiones futuras de las librerias de serializacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JayF14/Neuro_Pulse
- Dataset de referencia (CHB-MIT Scalp EEG Database, PhysioNet): no incluido en la informacion proporcionada; el autor lo cita como origen de las caracteristicas.
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
