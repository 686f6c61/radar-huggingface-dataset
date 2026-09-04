# ausjahk/sms-spam-detector-from-scratch

## Resumen

El modelo `ausjahk/sms-spam-detector-from-scratch` es un clasificador de texto binario desarrollado por el autor `ausjahk` para detectar mensajes SMS no deseados (spam) frente a mensajes legítimos (ham). A diferencia de la mayoría de modelos NLP modernos, este modelo se entrenó completamente desde cero, con inicialización aleatoria de pesos y sin utilizar modelos pre-entrenados como BERT. Esto lo convierte en una demostración práctica de que arquitecturas simples y ligeras pueden alcanzar un rendimiento competitivo en tareas de clasificación de texto específicas.

La arquitectura es un modelo híbrido compuesto por una capa de embedding, una LSTM bidireccional y una capa densa de salida. El modelo tiene un total de 390.882 parámetros, lo que lo hace extremadamente ligero y apto para ejecutarse en dispositivos con recursos limitados. Se entrenó sobre el dataset público `SMS Spam Collection` de Kaggle, logrando una precisión en test del 97,58 %. No se especifica la longitud de contexto máxima, aunque al tratarse de una LSTM es razonable asumir que maneja secuencias cortas típicas de mensajes de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional con capa de embedding y capa densa de salida |
| Parametros totales | 390.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, aunque no se especifica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura de red neuronal recurrente basada en LSTM bidireccional. El tokenizador es personalizado y define un vocabulario de 5.002 palabras. La capa de embedding proyecta cada token a un vector de dimensión 64. A continuación, una capa LSTM bidireccional con `hidden_dim=64` procesa la secuencia, capturando información contextual en ambas direcciones. Finalmente, una capa lineal densa de 32 unidades conecta a una salida de 2 clases (`0 = HAM`, `1 = SPAM`).

El entrenamiento se realizó desde cero, es decir, con pesos inicializados aleatoriamente, sin aprovechar representaciones pre-entrenadas. El dataset utilizado es el `SMS Spam Collection` de Kaggle, que contiene mensajes etiquetados como spam o ham. No se han proporcionado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni la aplicación de técnicas como RLHF o DPO, que no son aplicables a un modelo de clasificación de este tipo. Tampoco se documentan innovaciones técnicas destacables más allá del uso de una LSTM bidireccional.

## Capacidades

- Clasificación binaria de mensajes de texto como `spam` o `ham` (legítimo).
- Inferencia rápida y ligera gracias a su bajo número de parámetros (390.882).
- Funciona como modelo discriminativo; no genera texto, no soporta tool calling, ni razonamiento multi-paso.
- Capacidades multilingües: no especificadas; el dataset de entrenamiento está en inglés, por lo que se espera un rendimiento limitado en otros idiomas.
- No dispone de capacidades de visión, audio, ni modos especiales de pensamiento.

## Casos de uso

- Filtrado de SMS en aplicaciones de mensajería móvil: el modelo puede integrarse en una app para clasificar automáticamente mensajes entrantes como spam o no, mostrando una alerta al usuario. Su tamaño reducido permite ejecutarlo localmente en el dispositivo sin necesidad de GPU.
- Detección de phishing en pasarelas de SMS: en servicios que envían códigos de verificación o notificaciones, el modelo puede ayudar a identificar mensajes fraudulentos que imitan a entidades legítimas.
- Automatización de clasificación en centros de atención al cliente: cuando un cliente envía un SMS a una línea de soporte, el modelo puede etiquetar el mensaje como spam o consulta legítima, facilitando el enrutamiento a agentes humanos.
- Análisis en tiempo real de mensajes en sistemas de mensajería masiva (SMS marketing): el modelo puede servir como capa de pre-filtrado para detectar mensajes no deseados en campañas de comunicación, reduciendo el ruido.
- Herramienta educativa para demostrar NLP clásico: al ser un modelo entrenado desde cero, es útil en cursos y talleres para enseñar cómo construir un clasificador de texto sin depender de modelos pre-entrenados de gran tamaño.
- Integración en sistemas de seguridad para monitorización de comunicaciones: puede utilizarse en entornos empresariales para clasificar mensajes sospechosos y alertar a los equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la precisión en test sobre el dataset `SMS Spam Collection`, que alcanza el 97,58 %. No se dispone de comparaciones con otros modelos en métricas estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| Precisión en test (SMS Spam Collection) | 97,58 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 1,5 MB en FP32 (390.882 parámetros × 4 bytes), por lo que no requiere VRAM dedicada.
- GPU recomendada: ninguna; el modelo se ejecuta sin problemas en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: puede cargarse directamente con PyTorch, exportarse a ONNX o utilizarse a través de un servidor web con Flask o FastAPI. No es adecuado para frameworks como vLLM o TGI, orientados a LLMs de gran tamaño.
- Latencia estimada: del orden de milisegundos por inferencia en CPU moderna, dado el pequeño tamaño del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. Existen alternativas basadas en técnicas clásicas de machine learning, como Naive Bayes o SVM, que se utilizan habitualmente para la detección de spam. Por ejemplo, el repositorio `code-with-kursia/SMS-Spam-Detector` reporta una precisión del 98,39 % con un clasificador Multinomial Naive Bayes, y `adamspd/spam-detection-project` ofrece varios clasificadores (Naive Bayes, Random Forest, SVM). Sin embargo, no se han publicado especificaciones completas de estos modelos (parámetros, contexto, licencia) que permitan una comparación directa.

| Modelo | Arquitectura | Parametros | Precisión | Licencia |
|---|---|---|---|---|
| ausjahk/sms-spam-detector-from-scratch | LSTM bidireccional | 390.882 | 97,58 % | no disponible |
| SMS-Spam-Detector (code-with-kursia) | Naive Bayes | no disponible | 98,39 % | no disponible |
| Spam-Detector-AI (adamspd) | Naive Bayes / RF / SVM | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó únicamente con mensajes en inglés, por lo que puede presentar un rendimiento deficiente o sesgos al aplicarse a otros idiomas.
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede clasificar incorrectamente mensajes ambiguos o fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; la LSTM puede procesar secuencias de longitud variable, pero su rendimiento en mensajes muy largos no está garantizado.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el modelo es apto para uso comercial o si existen restricciones de distribución.
- Caveat para producción: el modelo fue entrenado desde cero con un dataset relativamente pequeño y sin técnicas de regularización documentadas. Su precisión del 97,58 % puede no mantenerse en escenarios reales con datos más variados o ruidosos.

## Enlaces

- HuggingFace: https://huggingface.co/ausjahk/sms-spam-detector-from-scratch
- Dataset Kaggle (SMS Spam Collection): https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset
- Repositorio alternativo de detección de spam: https://github.com/adamspd/spam-detection-project
- Repositorio alternativo de detección de spam: https://github.com/code-with-kursia/SMS-Spam-Detector
