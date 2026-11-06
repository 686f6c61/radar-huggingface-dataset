# nikhilkumar905/ECG-Arrhythmia-Detection

## Resumen

ECG Arrhythmia Detection es un modelo de clasificacion de series temporales medicas desarrollado por el usuario de Hugging Face nikhilkumar905. No se trata de un modelo de lenguaje, sino de una red neuronal hibrida CNN + BiLSTM con mecanismo de atencion que clasifica latidos individuales de electrocardiograma (ECG) en las cinco clases AAMI: Normal (N), Supraventricular (S), Ventricular (V), Fusion (F) y Unknown (Q).

El modelo aborda el problema de deteccion automatica de arritmias a partir de latidos aislados de 187 muestras muestreadas a 125 Hz y escaladas al rango 0-1. Fue entrenado sobre el dataset MIT-BIH Arrhythmia, el benchmark de referencia en este campo, y reporta una accuracy del 99,00 % y un macro F1 del 94,0 % sobre el split de test de 21.892 latidos.

Con 2,65 millones de parametros y pesos en PyTorch bajo licencia MIT, es un modelo ligero que puede ejecutarse en CPU sin problemas. Su relevancia radica en su utilidad educativa y de investigacion: incluye repositorio de codigo con backend y una demo web desplegada en Vercel, lo que facilita la experimentacion reproducible. No es un dispositivo medico y no debe usarse con fines diagnosticos clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + BiLSTM + atencion (clase `ECG_CNN_LSTM_Deep`) |
| Parametros totales | 2,65 M |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 187 muestras por latido (125 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de senales, no de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pth`) + `scaler.pkl` (scikit-learn 1.6.1) |

## Arquitectura y entrenamiento

El modelo combina tres componentes en un pipeline clasico de clasificacion de senales biosensoras: una red convolucional que extrae caracteristicas locales del latido (morfologia de ondas P, QRS y T), un BiLSTM que modela dependencias secuenciales bidireccionales dentro del latido, y un mecanismo de atencion que pondera las posiciones temporales mas relevantes para la decision final. La clase exacta es `ECG_CNN_LSTM_Deep`, definida en el directorio `backend/` del repositorio de GitHub, con salida a 5 clases.

El entrenamiento se realizo sobre el dataset MIT-BIH Arrhythmia, el conjunto de datos publico estandar para deteccion de arritmias. La metrica reportada (accuracy, F1 macro y F1 ponderado) corresponde al split de test de 21.892 latidos del preprocesado popularizado por Kaggle, en el que cada latido se segmenta y normaliza individualmente. No hay informacion disponible sobre el numero de epocas, el optimizador, el learning rate ni tecnicas de aumento de datos. Al ser un clasificador supervisado de series temporales, no aplican conceptos como RLHF, DPO o longitud de contexto de lenguaje.

## Capacidades

- Clasificacion de latidos ECG individuales en 5 clases AAMI: Normal (N), Supraventricular (S), Ventricular (V), Fusion (F) y Unknown (Q).
- Procesamiento de senales de un solo canal con 187 muestras por latido a 125 Hz, normalizadas con un `StandardScaler` incluido en el repo.
- Inferencia por lotes: acepta arrays NumPy de forma `(N, 187)` y clasifica N latidos de una pasada.
- Ejecucion en CPU gracias a su tamano reducido (2,65 M de parametros).
- Integracion sencilla en Python mediante `huggingface_hub` y `joblib` para cargar pesos y escalador.
- No tiene capacidades de lenguaje natural, tool calling, agentes, vision ni audio; es un clasificador de series temporales especializado.

## Casos de uso

- **Educacion en electrofisiologia:** estudiantes y docentes pueden usar la demo web desplegada en Vercel para visualizar como un modelo clasifica latidos en las clases AAMI y comprender que caracteristicas del ECG discriminan cada tipo de arritmia.
- **Investigacion en clasificacion de ECG:** sirve como baseline reproducible (arquitectura CNN + BiLSTM + atencion) sobre MIT-BIH para comparar nuevas arquitecturas, como transformers temporales o modelos auto-supervisados.
- **Prototipado de monitoreo cardiaco:** puede integrarse en un pipeline que segmente latidos desde un dispositivo de adquisicion y los clasifique en tiempo real, dada su baja latencia en CPU.
- **Preprocesado y validacion de datos de ECG:** el `scaler.pkl` incluido documenta el pipeline de normalizacion, util para estandarizar datos en proyectos derivados.
- **Ensenanza de MLOps medico:** el proyecto completo (backend, modelo versionado en Hugging Face, frontend en Vercel) es un ejemplo de despliegue end-to-end de un modelo de ML sanitario.
- **Generacion de datasets anotados asistida:** puede preetiquetar grandes volumenes de latidos grabados para que un experto revise solo los casos dudosos (clases S, V, F, Q), acelerando la anotacion manual.
- **Experimentos de robustez:** al conocerse explicitamente su limitacion de separacion por latidos y no por pacientes, es un buen caso de estudio para medir la degradacion ante pacientes no vistos (data leakage temporal).

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el split de test de latidos de MIT-BIH (21.892 latidos):

| Metrica | Valor |
|---|---|
| Accuracy | 99,00 % |
| Macro F1 | 94,0 % |
| Weighted F1 | 99,0 % |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Como referencia contextual, los trabajos que usan este mismo split de Kaggle suelen reportar accuracy en torno al 98-99 %, por lo que el resultado esta en linea con el estado del arte de esa configuracion concreta. El propio autor advierte que, al separarse latidos y no pacientes, el rendimiento sobre pacientes nuevos sera inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente irrelevante; con 2,65 M de parametros (~10 MB en FP32) cabe en cualquier GPU moderna y en memoria de CPU sin problema.
- GPU recomendadas: ninguna en particular; la inferencia en CPU es viable y probablemente suficiente para la mayoria de cargas. Cualquier GPU, incluso integrada, acelerara el procesamiento por lotes.
- Consumer GPU: sobrado; funciona desde un portatil sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo (codigo de ejemplo con `huggingface_hub`), backend propio incluido en el repositorio de GitHub y demo web en Vercel. No se menciona soporte para ONNX, TensorRT, llama.cpp ni Ollama (no aplicable, no es un LLM).
- Latencia y throughput: no disponibles; dado el tamano del modelo y la entrada de 187 valores, la latencia por latido en CPU se espera en el orden de milisegundos, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Dominio | Parametros | Dataset | Resultados | Licencia |
|---|---|---|---|---|---|
| ECG Arrhythmia Detection (este) | Clasificacion de latidos ECG | 2,65 M | MIT-BIH Arrhythmia | 99,0 % accuracy / 94,0 % macro F1 | MIT |
| ECGFormer / variantes transformer sobre MIT-BIH | Clasificacion de latidos ECG | no disponible | MIT-BIH Arrhythmia | ~99 % accuracy en splits por latido (literatura) | variable |
| Modelos auto-supervisados de ECG (p. ej. basados en MAE o contrastive learning) | Representaciones generales de ECG | no disponible | multiples corpora (PTB-XL, MIT-BIH, etc.) | mejores tasas de generalizacion entre pacientes | variable |

Nota: la comparativa es cualitativa; no se han publicado benchmarks comparativos directos para este modelo. La ventaja diferencial frente a enfoques auto-supervisados es la ligereza y simplicidad; la desventaja principal es la generalizacion limitada a pacientes no vistos.

## Limitaciones y advertencias

- **Fuga de informacion por pacientes:** el split de Kaggle separa latidos individuales, no pacientes completos, por lo que los 99 % de accuracy sobreestiman el rendimiento real sobre pacientes nuevos. El propio autor lo reconoce explicitamente en la model card.
- **Contexto limitado:** clasifica un solo latido de un solo canal, sin contexto de ritmo cardiaco (varios latidos consecutivos), lo que impide detectar arritmias dependientes de patrones ritmicos como fibrilacion auricular.
- **Sesgo del dataset:** MIT-BIH procede de 47 pacientes de los años 70-80 con equipos de epoca; el rendimiento sobre ECGs modernos, de otros dispositivos o de poblaciones distintas puede degradarse significativamente.
- **Riesgo de error clinico:** las clases minoritarias (F, Q y en menor medida S) tienen menos ejemplos, por lo que el macro F1 (94,0 %) frente al weighted (99,0 %) indica peor rendimiento en justamente las clases mas criticas clinicamente.
- **No es un dispositivo medico:** la model card indica explicitamente que es solo para investigacion y educacion; su uso para diagnostico clinico no esta permitido ni validado.
- **Dependencia del preprocesado:** la inferencia requiere aplicar exactamente el `StandardScaler` incluido y la segmentacion de 187 muestras; cualquier desviacion en el pipeline degrada los resultados.
- **Licencia:** MIT permite uso comercial, pero esto no elimina la responsabilidad regulatoria (marca CE, FDA) si se intentara usar en un contexto sanitario real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikhilkumar905/ECG-Arrhythmia-Detection
- Repositorio de codigo y web app: https://github.com/nikhilkumar905/ECG-Arrhythmia-Detection
- Demo en vivo: https://ecg-arrhythmia-detection-weld.vercel.app
- Dataset de entrenamiento: MIT-BIH Arrhythmia (disponible publicamente, por ejemplo en PhysioNet y Kaggle)
