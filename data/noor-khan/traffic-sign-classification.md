# Noor-Khan/traffic-sign-classification

## Resumen

El modelo `Noor-Khan/traffic-sign-classification` es una red neuronal convolucional (CNN) implementada en Keras/TensorFlow que clasifica imagenes de senales de trafico alemanas en 43 categorias distintas, siguiendo el benchmark GTSRB (German Traffic Sign Recognition Benchmark). Lo desarrolla Noorullah Zamindar como proyecto de aprendizaje, y su codigo fuente y script de entrenamiento estan publicados en un repositorio de GitHub asociado. No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imagenes acotado a una tarea de percepcion visual muy concreta.

Con 1.035.627 parametros, se trata de un modelo muy ligero, disenado para inferencia rapida incluso en CPU. La entrada es una imagen RGB redimensionada a 50x50 pixeles con valores normalizados a [0, 1], y la salida es una distribucion softmax sobre las 43 clases de senales. La relevancia practica es limitada: sirve como pieza didactica de referencia para pipelines de clasificacion de imagenes con Keras y como componente de ejemplo en sistemas de asistencia a la conduccion, pero no como sistema de percepcion de produccion.

El modelo se publico en noviembre de 2026 y no registra descargas ni interacciones en Hugging Face. Su interes editorial radica en que documenta de forma transparente un flujo completo de entrenamiento, evaluacion y limitaciones, algo util para desarrolladores que quieran replicar el pipeline o entender los caveats de GTSRB en contextos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial (Keras/TensorFlow): Conv2D(64, 3x3, ReLU) + MaxPool(2x2) + Dropout(0.5); Conv2D(64, 3x3, ReLU) + MaxPool(2x2) + Dropout(0.5); Flatten; Dense(128, ReLU) + Dropout(0.5); Dense(43, softmax) |
| Parametros totales | 1.035.627 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 50x50x3) |
| Tipos de cuantizacion | no disponible (formato nativo Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; clases en aleman/ingles segun GTSRB) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras 3 / TensorFlow >= 2.18) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial sencilla con dos bloques convolucionales de 64 filtros 3x3 con activacion ReLU, cada uno seguido de max pooling 2x2 y dropout del 50%. Tras el aplanado, una capa densa de 128 neuronas con ReLU y dropout 0.5 alimenta la capa de salida de 43 neuronas con softmax. El optimizador es Adam, la funcion de perdida es entropia cruzada categorica dispersa (sparse categorical cross-entropy), el entrenamiento se realizo durante 5 epocas con un tamano de lote de 128 y no se documenta el uso de tecnicas de regularizacion adicionales mas alla del dropout.

Los datos de entrenamiento proceden del split de entrenamiento oficial de GTSRB: 39.209 imagenes etiquetadas en 43 clases. El autor reserva el 80% (31.368 imagenes) para entrenamiento y el 20% (7.841 imagenes) para validacion, con un shuffle sembrado (seed 42). No se menciona aumento de datos, ajuste fino con RLHF/DPO (no aplica a un clasificador) ni tecnicas de decodificacion especulativa. La innovacion tecnica es nula por diseno: se trata de una receta canonica de CNN para clasificacion de imagenes, reproducible mediante el script `train.py` incluido en el repositorio.

## Capacidades

- Clasificacion de imagenes de senales de trafico alemanas en 43 clases (limites de velocidad de 20 a 120 km/h, prohibido adelantar, stop, ceda el paso, carretera prioritaria, curvas peligrosas, obras, peatones, ninos, rotonda, etc.).
- Entrada de imagen unica: requiere una senal recortada y centrada, redimensionada a 50x50 pixeles RGB y normalizada a [0, 1].
- Salida de probabilidades softmax sobre las 43 clases, lo que permite umbralizar la confianza y descartar predicciones de baja certeza.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso ni cadenas de herramientas.
- No tiene capacidades multilingues en el sentido linguistico; las etiquetas de clase estan en aleman/ingles segun la taxonomia GTSRB.
- No dispone de modo "thinking", vision general, audio, video ni generacion de texto.

## Casos de uso

- Docencia y aprendizaje de vision por computador: el modelo sirve como ejemplo completo y reproducible de un pipeline de clasificacion con Keras, incluyendo script de entrenamiento, `requirements.txt` y `metrics.json` con el historial por epoca. Es adecuado para cursos introductorios y talleres.
- Prototipado rapido de sistemas ADAS en entornos controlados: se puede integrar en un banco de pruebas que reciba recortes de senales ya localizados por un detector y clasifique el tipo de senal, siempre que las condiciones de iluminacion y el pais de origen coincidan con GTSRB.
- Benchmark interno de modelos de vision: al ser muy ligero (1,03 M de parametros) y tener una licencia MIT permisiva, sirve como linea base de comparacion frente a clasificadores mas grandes o modelos fundacionales de vision en tareas de clasificacion de senales.
- Filtrado y anotacion asistida de datasets: se puede usar para preetiquetar imagenes de senales en un corpus propio y revisar manualmente solo los casos de baja confianza, acelerando la construccion de datasets.
- Educacion en conduccion o simuladores: en un simulador de bajo coste se puede emplear para reconocer senales en escenas sinteticas con senales alemanas renderizadas en condiciones limpias y frontales.
- Demostraciones de despliegue en edge: por su tamano reducido cabe en dispositivos con recursos limitados (Raspberry Pi, moviles, microcontroladores con TensorFlow Lite), lo que permite demostrar inferencia en el borde sin GPU.
- Verificacion de robustez y estudio de sesgos de dataset: util para analizar como un clasificador sencillo se degrada ante oclusion, noche o paises distintos, y para documentar la brecha entre validacion y despliegue real.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision de validacion | 0,9719 (97,19%) | 7.841 imagenes held-out del split de entrenamiento GTSRB |
| Precision de entrenamiento final | 0,8399 (83,99%) | 31.368 imagenes de entrenamiento |
| Precision de validacion (ejecucion original en Colab) | 0,9740 (97,40%) | misma receta, 5 epocas |

No se han publicado resultados de benchmarks en la informacion disponible para el conjunto de test oficial de GTSRB (el split final no tiene etiquetas publicas, segun indica el autor). No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 para los pesos (1,03 M de parametros, ~4 MB) mas activaciones intermedias; en la practica cualquier GPU con 1 GB o incluso CPU es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU moderna y en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en muchas integradas.
- Opciones de despliegue: TensorFlow/Keras nativo (`keras.models.load_model`), TensorFlow Lite para movil y edge, TensorFlow.js para navegador, y conversion a ONNX mediante herramientas externas (no documentada por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo se espera latencia de milisegundos por imagen en CPU y sub-milisegundo en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noor-Khan/traffic-sign-classification | 1.035.627 | 50x50x3 | 97,19% validacion GTSRB | MIT | Hugging Face + GitHub |
| Alternativas GTSRB publicas (p. ej. CNN mas profundas o ensembles) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos fundacionales de vision (p. ej. CLIP, SigLIP) adaptados a clasificacion | no disponible | variable | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La comparativa cuantitativa con alternativas de la misma categoria (clasificadores GTSRB) no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con imagenes de GTSRB: senales alemanas, mayoritariamente limpias, centradas y en luz diurna. El rendimiento cae con senales de otros paises, oclusion severa, noche, mal tiempo y angulos extremos.
- Requiere una senal unica recortada y centrada: el modelo no detecta ni localiza senales en una escena completa; necesita un detector previo.
- Desbalanceo de clases en GTSRB: algunas clases tienen ~200 imagenes y otras mas de 2.000, por lo que las senales raras se reconocen con menos fiabilidad.
- No se reporta precision sobre el test oficial de GTSRB porque sus etiquetas no son publicas; la cifra de 97,19% es de validacion sobre el split de entrenamiento, no una evaluacion independiente.
- Riesgo de alucinacion en el sentido de falsos positivos: al ser un clasificador cerrado de 43 clases, siempre asignara una de ellas aunque la imagen no corresponda a ninguna senal valida; es imprescindible umbralizar la confianza.
- Sesgos derivados del dataset: sobrerrepresentacion de condiciones diurnas y alemanas, posible sesgo hacia clases mayoritarias.
- No es un sistema de seguridad critica: el propio autor advierte de que no debe usarse como unico sistema de percepcion en un vehiculo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de las limitaciones tecnicas anteriores.
- Modelo de aprendizaje sin descargas ni validacion externa: no hay evidencia de uso en produccion ni de evaluaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Noor-Khan/traffic-sign-classification
- Repositorio de codigo fuente: https://github.com/NoorullahZamindar-007/Traffic-Sign-Classification
- Dataset GTSRB (referencia del benchmark): no disponible en la informacion proporcionada
- Paper de GTSRB: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
