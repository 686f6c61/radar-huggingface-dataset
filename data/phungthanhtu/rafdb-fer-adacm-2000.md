# phungthanhtu/rafdb-fer-adacm-2000

## Resumen

Ada-CM sobre RAF-DB con 2000 imagenes etiquetadas es un checkpoint de reconocimiento de expresiones faciales (FER) entrenado mediante el metodo Adaptive Confidence Margin (Ada-CM), una tecnica de aprendizaje semisupervisado. Lo publica el usuario phungthanhtu y corresponde a la fila de presupuesto "2000" de un estudio comparativo sobre el efecto del numero de etiquetas en el rendimiento del modelo. El checkpoint publicado usa la semilla 5.

El modelo parte de un backbone ResNet-18 preentrenado en MS-Celeb-1M, con entrada de 224x224, y se entrena sobre 2000 imagenes etiquetadas mas 10.271 imagenes no etiquetadas del conjunto de entrenamiento de RAF-DB. Sobre el conjunto de test alcanza un 80,64% de accuracy, un macro-F1 del 73,22% y un ECE (10 bins) de 0,134, lo que lo convierte en una referencia util para estudiar el compromiso entre coste de anotacion y precision en FER.

Es relevante ahora por dos motivos: por un lado, demuestra que con un presupuesto de etiquetas muy reducido (2000 frente a las ~15.000 del split completo de RAF-DB) se puede mantener una precision cercana al 80% gracias al aprendizaje semisupervisado; por otro, la familia de checkpoints publicada con distintos presupuestos (100, 400, 2000 y 4000) permite reproducir curvas de rendimiento frente a etiquetas. El repositorio es de 0,0 GB y no incluye pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-18 (backbone), preentrenada en MS-Celeb-1M, entrada 224x224 |
| Parametros totales | no disponible (ResNet-18 estandar, ~11,7 M en la variante torchvision; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precision de entrenamiento) |
| Idiomas soportados | no disponible; la tarea es reconocimiento de expresiones faciales, independiente del idioma |
| Licencia | other (RAF-DB esta licenciado solo para investigacion no comercial; el autor prohibe el uso en produccion sobre personas) |
| Formato de pesos | `model.pt` de PyTorch (pesos + config + nombres de clase + metricas, sin clases serializadas con pickle) |

## Arquitectura y entrenamiento

El modelo es una red convolucional ResNet-18 con entrada RGB de 224x224, inicializada con pesos preentrenados en MS-Celeb-1M (un dataset de identidades faciales), y ajustada para clasificacion en 7 clases de expresion: Surprise, Fear, Disgust, Happiness, Sadness, Anger y Neutral. El entrenamiento emplea el metodo Ada-CM (Adaptive Confidence Margin), un esquema semisupervisado que asigna margenes de confianza adaptativos a las muestras no etiquetadas para incorporarlas al entrenamiento sin introducir ruido excesivo en las pseudoetiquetas.

El conjunto de entrenamiento combina 2000 imagenes etiquetadas con 10.271 imagenes no etiquetadas de RAF-DB. El autor no detalla el numero de tokens ni de epocas, la composicion exacta del dataset mas alla de RAF-DB, ni si hubo etapas de RLHF/DPO (no aplicables en vision). La aumentacion de datos en entrenamiento incluye random resized crops y RandAugment; en inferencia no se aplica ninguna de las dos. El preprocesado de inferencia consiste en redimensionar el lado corto a 224, `ToTensor` y normalizacion con media [0.485, 0.456, 0.406] y desviacion [0.229, 0.224, 0.225]. El checkpoint publicado son los pesos finales con media exponencial (EMA) del entrenamiento, semilla 5.

## Capacidades

- Clasificacion de expresiones faciales en 7 clases discretas sobre imagenes de cara alineadas, del mismo tipo que las de RAF-DB.
- Aprendizaje semisupervisado: el checkpoint es el resultado de combinar 2000 etiquetas con 10.271 muestras no etiquetadas mediante Ada-CM.
- Estimacion de incertidumbre calibrada de forma moderada: ECE de 0,134 con 10 bins sobre el conjunto de test.
- Salida de probabilidades por clase (la funcion `model.predict()` devuelve la prediccion a partir de la red en modo eval).
- Carga autonoma: `model.load()` descarga los pesos, reconstruye la red y la deja en modo evaluacion sin necesidad del pipeline de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general (solo caras), audio ni modo thinking.
- No dispone de capacidades multilingues ni de generacion de texto: es un clasificador de vision puro.

## Casos de uso

- Investigacion sobre aprendizaje semisupervisado: sirve como punto de referencia reproducible (semilla 5) para comparar Ada-CM con otros metodos de pseudoetiquetado bajo un presupuesto fijo de 2000 etiquetas en RAF-DB.
- Estudio del compromiso etiquetas-rendimiento: al existir checkpoints con 100, 400, 2000 y 4000 etiquetas, permite trazar curvas de accuracy y macro-F1 frente al coste de anotacion en un mismo backbone y protocolo.
- Analisis de calibracion: con un ECE de 0,134 y metricas por clase, es util para evaluar tecnicas de calibracion de confianza en clasificadores FER de bajo presupuesto.
- Prototipado academico de analisis de emociones en imagenes de cara alineadas, siempre dentro de un entorno de investigacion no comercial y con datos de RAF-DB o equivalentes.
- Docencia y reproduccion de experimentos: el paquete incluye `model.py` con `load()` y `predict()` y `example.py` como demo de linea de comandos, lo que simplifica la replicacion en cursos y laboratorios.
- Evaluacion de robustez y confusion entre clases: el autor identifica fear, sadness y neutral como las clases mas debiles, por lo que el checkpoint es adecuado para estudiar matrices de confusion y errores sistematicos en FER de pocos datos.
- Baseline para comparativas internas: cualquier nuevo metodo semisupervisado sobre RAF-DB con 2000 etiquetas puede medirse contra este 80,64% de accuracy y 73,22% de macro-F1.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test (RAF-DB) | 80,64% |
| Macro-F1 en test (RAF-DB) | 73,22% |
| ECE (10 bins) | 0,134 |
| Etiquetas de entrenamiento | 2000 |
| Imagenes no etiquetadas | 10.271 |
| Semilla | 5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni desglose por clase; solo se indica cualitativamente que fear, sadness y neutral son las clases con mas confusiones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una ResNet-18 a 224x224 en FP32 ocupa del orden de decenas de MB de pesos y requiere menos de 1 GB de VRAM para lotes pequenos (estimacion a partir de la arquitectura, no declarada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien es viable en CPU para inferencia por imagen.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para uso individual.
- Opciones de despliegue: PyTorch nativo mediante `model.load()` y `model.predict()`; exportacion a TorchScript u ONNX no documentada por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ada-CM RAF-DB 2000 (este) | ResNet-18 (~11,7 M, no declarado) | Imagen 224x224 | 80,64% acc, 73,22% macro-F1, ECE 0,134 | other (uso no comercial) | Hugging Face, pesos `model.pt` |
| Ada-CM RAF-DB 100 | ResNet-18 | Imagen 224x224 | no disponible | other | Hugging Face (`phungthanhtu/rafdb-fer-adacm-100`) |
| Ada-CM RAF-DB 400 | ResNet-18 | Imagen 224x224 | no disponible | other | Hugging Face (`phungthanhtu/rafdb-fer-adacm-400`) |
| Ada-CM RAF-DB 4000 | ResNet-18 | Imagen 224x224 | no disponible | other | Hugging Face (`phungthanhtu/rafdb-fer-adacm-4000`) |

No se dispone de datos de benchmarks de otros modelos FER comparables en la informacion proporcionada, por lo que la comparativa se limita a los checkpoints de la misma familia.

## Limitaciones y advertencias

- Entrenado con solo 2000 imagenes etiquetadas: el propio autor senala que es mas debil en fear, sadness y neutral, las clases mas confundidas del estudio.
- Sesgos no documentados: no se detalla la composicion demografica de RAF-DB ni se evalua el sesgo por edad, genero o etnia; RAF-DB contiene caras alineadas y su distribucion no representa a la poblacion general.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones de alta confianza incorrectas en clases minoritarias o expresiones ambiguas.
- Restriccion de licencia: RAF-DB esta licenciado solo para investigacion no comercial y el autor prohibe explicitamente usar el checkpoint en produccion sobre personas.
- Dominio limitado: solo caras alineadas del mismo tipo que RAF-DB; no se garantiza su comportamiento en imagenes sin alinear, baja resolucion, iluminacion adversa u otras culturas expresivas.
- Sin cuantizaciones publicadas: solo se distribuye `model.pt` en precision de entrenamiento; no hay versiones GGUF, ONNX ni int8 oficiales.
- Repositorio de 0,0 GB y sin pipeline declarado en Hugging Face: la integracion con `transformers` no esta soportada y la carga debe hacerse con el `model.py` incluido.
- Solo se publica la semilla 5; el resto de semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad completa de la varianza entre ejecuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-2000
- Checkpoint con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-100
- Checkpoint con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-400
- Checkpoint con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-4000
- Perfil del autor: https://huggingface.co/phungthanhtu
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
