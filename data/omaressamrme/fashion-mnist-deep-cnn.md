# omaressamrme/fashion-mnist-deep-cnn

## Resumen

`fashion-mnist-deep-cnn` es una red neuronal convolucional (CNN) profunda entrenada desde cero para clasificar imagenes de 28x28 pixeles en escala de grises en las 10 categorias de prendas del dataset Fashion-MNIST. Lo desarrolla el usuario de Hugging Face `omaressamrme` (Omar Essam) como parte de un estudio comparativo entre un perceptron multicapa (MLP), una CNN pequena, esta CNN profunda y una variante con aumento de datos, publicado en GitHub y en un articulo de dev.to sobre "confidence gating" y Grad-CAM.

No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imagenes de proposito especifico, con 288.682 parametros entrenables, pensado como referencia docente y como ejemplo de pipeline de clasificacion con filtrado por umbral de confianza. Su relevancia practica esta en la combinacion de un rendimiento solido (93,67 % de accuracy en test) con un tamano minimo que permite entrenamiento e inferencia en CPU, y en la documentacion de una estrategia de "confidence gate" que descarta predicciones por debajo de un umbral de probabilidad para derivarlas a revision humana.

La arquitectura es una CNN de tres bloques convolucionales con BatchNorm y Dropout, seguida de una capa densa de 128 unidades y softmax de 10 clases. El modelo se distribuye en formato nativo de Keras 3 (`model.keras`), con licencia MIT y un repositorio de menos de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (3 bloques conv + BatchNorm + ReLU + max-pool + dropout, capa densa 128, softmax 10 clases) |
| Parametros totales | 288.682 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 28x28x1) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | `model.keras` (formato nativo de Keras 3) |

## Arquitectura y entrenamiento

La red se compone de tres bloques convolucionales. El primero y el segundo contienen dos convoluciones 3x3 sin sesgo cada uno, seguidas de BatchNorm, ReLU, max-pool y dropout de 0,25; el tercer bloque contiene una sola convolucion con la misma estructura. Los filtros son 32, 64 y 128 respectivamente. Tras el aplanado, una capa densa de 128 unidades con dropout de 0,4 alimenta una salida softmax de 10 clases. El optimizador es Adam con tasa de aprendizaje 1e-3 y tamano de lote 128, con callbacks `ReduceLROnPlateau` y `EarlyStopping(patience=5, restore_best_weights=True)`.

El entrenamiento se realizo sobre el split oficial de Fashion-MNIST (Zalando), con imagenes normalizadas a [0, 1] y eje de canal final. Se ejecutaron 27 epocas, con la mejor en la epoca 22 segun la perdida de validacion, y un tiempo de entrenamiento de 21,7 minutos en CPU. Los pesos publicados se reentrenaron con `train.py` (misma arquitectura, split, optimizador y callbacks, semilla 123) para poder distribuirlos. No se documenta uso de RLHF, DPO ni tecnicas de aumento de datos en esta variante concreta (existe una variante aumentada separada en el estudio comparativo).

## Capacidades

- Clasificacion de imagenes en escala de grises de 28x28 pixeles en 10 categorias: T-shirt/top, Trouser, Pullover, Dress, Coat, Sandal, Shirt, Sneaker, Bag y Ankle boot.
- Salida de probabilidades por clase (softmax), lo que permite aplicar umbrales de confianza y derivar casos dudosos a revision humana.
- Entrenamiento e inferencia en CPU: el modelo completo ocupa menos de 1 MB de pesos y se entrena en torno a 22 minutos en CPU.
- Integracion nativa con TensorFlow 2.21 / Keras 3 mediante `tf.keras.models.load_model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingues.

## Casos de uso

- **Clasificacion automatica de prendas en catalogos de e-commerce**: el modelo etiqueta imagenes de 28x28 en las 10 categorias de Fashion-MNIST; es adecuado como base para prototipos de etiquetado automatico antes de escalar a un modelo con imagenes de mayor resolucion.
- **Filtrado con umbral de confianza en pipelines de anotacion**: usando la tabla de confidence gate documentada (umbral 0,90 deja pasar el 84,5 % de las predicciones con 98,5 % de acierto; umbral 0,95 deja el 80,1 % con 99,1 % de acierto), se puede automatizar el etiquetado de la mayoria de imagenes y enviar el resto a revision humana.
- **Docencia y comparacion de arquitecturas**: sirve como referencia reproducible en cursos de deep learning para comparar MLP, CNN pequena, CNN profunda y variante con aumento de datos sobre el mismo split y presupuesto de entrenamiento.
- **Interpretabilidad con Grad-CAM**: el repositorio asociado incluye mapas Grad-CAM y matrices de confusion, lo que permite usar el modelo para demostrar tecnicas de visualizacion de activaciones en imagenes de bajo coste computacional.
- **Prototipado rapido en entornos sin GPU**: al entrenar en CPU en unos 22 minutos y ocupar menos de 1 MB, es util para validar pipelines de datos, aumentos y callbacks antes de pasar a modelos mayores.
- **Deteccion de errores confiables ("confident mistakes")**: el estudio documenta casos en los que el modelo se equivoca con alta confianza, lo que lo hace util para investigar calibracion y limites de los clasificadores en datasets pequenos.
- **Pruebas de integracion con Keras 3 / TensorFlow 2.21**: sirve como caso de prueba para verificar la carga de `model.keras` y la inferencia con entradas normalizadas en pipelines de CI.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Test accuracy (Fashion-MNIST, 10.000 imagenes) | 0,9367 |
| Macro F1 | 0,9366 |
| Parametros | 288.682 |
| Epocas ejecutadas / mejor epoca | 27 / 22 |
| Tiempo de entrenamiento | 21,7 min en CPU |

Rendimiento por clase (precision / recall / F1):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| T-shirt/top | 0,897 | 0,893 | 0,895 |
| Trouser | 0,997 | 0,986 | 0,991 |
| Pullover | 0,915 | 0,907 | 0,911 |
| Dress | 0,927 | 0,941 | 0,934 |
| Coat | 0,884 | 0,923 | 0,903 |
| Sandal | 0,991 | 0,985 | 0,988 |
| Shirt | 0,820 | 0,793 | 0,806 |
| Sneaker | 0,965 | 0,979 | 0,972 |
| Bag | 0,994 | 0,990 | 0,992 |
| Ankle boot | 0,976 | 0,970 | 0,973 |

Confidence gate documentado por el autor:

| Umbral | Predicciones auto-etiquetadas | Accuracy sobre esas predicciones |
|---|---|---|
| 0,90 | 84,5 % | 98,5 % |
| 0,95 | 80,1 % | 99,1 % |
| 0,99 | 70,6 % | 99,6 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; el autor menciona una comparacion con MLP, CNN pequena y variante aumentada en el repositorio de GitHub, pero no se incluyen sus cifras en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 100 MB; el modelo tiene 288.682 parametros (menos de 1 MB en float32) y procesa lotes de imagenes de 28x28x1. Cabe en cualquier GPU consumer e incluso en CPU.
- **GPU recomendadas**: no requiere GPU. Cualquier GPU con soporte CUDA (GTX 1060, RTX 3060, RTX 4090, A100, H100) acelera la inferencia, pero no es necesaria.
- **Cabe en consumer GPU**: si, en todas las GPU consumer actuales e incluso en Raspberry Pi o entornos solo CPU.
- **Opciones de despliegue**: TensorFlow Serving, Keras 3 con `tf.keras.models.load_model`, exportacion a TensorFlow Lite o TensorFlow.js para navegador, y ONNX mediante conversion desde Keras.
- **Latencia y throughput estimados**: no disponibles de forma oficial; por el tamano del modelo se espera inferencia en el orden de milisegundos por lote en CPU y microsegundos por lote en GPU, pero no se documentan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Accuracy en Fashion-MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fashion-mnist-deep-cnn (este modelo) | 288.682 | 28x28x1 | 0,9367 (declarado) | MIT | Hugging Face, formato Keras |
| MLP del mismo estudio | no disponible en la informacion | 28x28x1 | no disponible en la informacion | no disponible | GitHub del autor |
| CNN pequena del mismo estudio | no disponible en la informacion | 28x28x1 | no disponible en la informacion | no disponible | GitHub del autor |
| Variante con aumento de datos del mismo estudio | no disponible en la informacion | 28x28x1 | no disponible en la informacion | no disponible | GitHub del autor |

No se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo estudio, cuyas cifras no se han incluido en los datos facilitados.

## Limitaciones y advertencias

- **Dominio muy restringido**: solo clasifica imagenes de 28x28 en escala de grises con las 10 clases de Fashion-MNIST; no generaliza a fotos de producto reales, color, alta resolucion ni otras categorias.
- **Clase dificil**: la clase Shirt es claramente la peor (F1 0,806, recall 0,793), con confusiones frecuentes con T-shirt/top, Pullover y Coat; el autor lo reconoce explicitamente.
- **Errores con alta confianza**: el estudio documenta "confident mistakes", por lo que el umbral de confianza no elimina todos los fallos; el confidence gate mejora la precision a costa de cobertura.
- **Metricas no verificadas**: los valores de accuracy y F1 estan declarados por el autor (`verified: false`) y no han sido reproducidos de forma independiente en la informacion disponible.
- **Sin soporte linguistico ni multimodal**: no procesa texto, audio ni imagenes fuera de su formato de entrada; no es adecuado para tareas de generacion, razonamiento o agentes.
- **Licencia MIT**: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni mantenimiento documentado.
- **Formato ligado a Keras 3**: la carga requiere TensorFlow 2.21 / Keras 3; versiones anteriores pueden no cargar `model.keras` directamente.
- **Sin cuantizaciones publicadas**: no se documentan variantes GGUF, ONNX ni TFLite listas para usar; habria que generarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omaressamrme/fashion-mnist-deep-cnn
- Repositorio GitHub del estudio: https://github.com/engomaressam/fashion-mnist-cnn-gradcam
- Articulo en dev.to: https://dev.to/eng_omaressam_7cb0e2a9c/an-image-classifier-you-can-trust-80-of-the-time-confidence-gating-and-grad-cam-45he
- Notebook de Kaggle: https://www.kaggle.com/code/engomaressam/fashion-mnist-cnns-confidence-gating-grad-cam
- Portfolio del autor: https://omaressam.web.app/#projects
- Dataset Fashion-MNIST: https://huggingface.co/datasets/zalando-datasets/fashion_mnist
