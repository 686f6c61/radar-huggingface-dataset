# Salamah01/mnist-cnn-pytorch

## Resumen

Este repositorio contiene un clasificador de dígitos manuscritos (0-9) basado en una red neuronal convolucional (CNN) pequeña, implementada en PyTorch y entrenada sobre el dataset MNIST. Es un proyecto de autoría individual (Salamah01), orientado principalmente al aprendizaje, que alcanza una precisión del 99,11 % en el conjunto de test de MNIST.

No se trata de un modelo de lenguaje, sino de un modelo de visión por computador clásico de clasificación de imágenes. Su relevancia es principalmente didáctica y como punto de partida para pipelines de visión sencillos: es ligero, se ejecuta en CPU sin problema y su licencia MIT permite cualquier uso, incluido el comercial.

La arquitectura consta de dos bloques convolucionales (Conv2d + ReLU + MaxPool), seguidos de una capa lineal de 3136 a 128 neuronas, dropout de 0,3 y una capa final de salida con 10 clases. El modelo se distribuye como archivo de pesos `.pth` cargable con `huggingface_hub`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2d + ReLU + MaxPool, 2 capas lineales) |
| Parametros totales | no disponible (estimable en el orden de cientos de miles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

La red sigue un esquema convolucional clasico: dos bloques de convolucion con activacion ReLU y max-pooling, aplanado del mapa de caracteristicas resultante, una capa densa de 128 neuronas con ReLU y dropout de 0,3 para regularizacion, y una capa de salida con 10 neuronas (una por digito). La entrada es una imagen en escala de grises de 1 x 28 x 28 pixeles, con digito blanco sobre fondo negro, normalizada con media 0,1307 y desviacion tipica 0,3081 (los valores estandar de MNIST).

El entrenamiento se realizo con el optimizador Adam (learning rate 0,001), funcion de perdida CrossEntropyLoss, 5 epocas y batch size de 64, sobre el dataset MNIST. No se menciona el uso de tecnicas como data augmentation, aprendizaje por refuerzo ni destilacion, lo cual es coherente con la naturaleza basica del proyecto.

## Capacidades

- Clasificacion de imagenes en escala de grises de 28 x 28 pixeles en 10 clases (digitos 0-9).
- Precision del 99,11 % en el conjunto de test de MNIST segun el autor.
- Inferencia en CPU sin requisitos especiales de hardware.
- Carga sencilla mediante `huggingface_hub.hf_hub_download` y `torch.load`.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No procesa texto, audio ni imagenes a color o de mayor resolucion sin preprocesamiento adicional.

## Casos de uso

- **Proyecto de aprendizaje de deep learning**: ideal como primer modelo de vision para entender el flujo completo de entrenamiento, evaluacion e inferencia en PyTorch, gracias a su arquitectura minima y documentacion clara.
- **Digitalizacion de formularios manuscritos**: puede reconocer digitos escritos a mano en encuestas o formularios escaneados, siempre que se recorten y normalicen a 28 x 28 en escala de grises.
- **Lectura de digitos en notas manuscritas simples**: reconocimiento de cantidades numericas en notas breves tras un paso de segmentacion de caracteres.
- **Prototipado de aplicaciones de OCR limitado**: como componente base de un sistema OCR sencillo para digitos, antes de invertir en soluciones mas complejas.
- **Baseline para experimentos de cuantizacion o destilacion**: su tamano reducido lo hace adecuado para practicar optimizacion de inferencia en dispositivos edge.
- **Ensenanza y demos en aula**: material ligero para demostrar CNNs en talleres, ejecutable en cualquier portatil sin GPU.
- **Pruebas de integracion con HuggingFace Hub**: ejemplo practico de distribucion de pesos via `hf_hub_download`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test MNIST | 99,11 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Como referencia contextual, las CNNs convencionales sobre MNIST suelen situarse entre el 99 % y el 99,7 % de precision, por lo que el resultado reportado es coherente con el estado del arte para arquitecturas de este tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es de tamano muy reducido (el repositorio figura con 0,0 GB) y se ejecuta comodamente en CPU.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente tanto para inferencia como para reentrenar el modelo (5 epocas sobre MNIST tardan minutos incluso sin acelerador).
- Consumer GPU: cabe sobradamente en cualquier GPU, incluidas integradas; no hay restricciones de memoria.
- Opciones de despliegue: PyTorch puro (script de ejemplo en la model card), TorchScript u ONNX tras conversion manual, y cualquier servicio que acepte pesos `.pth` (FastAPI, Gradio, Streamlit). No hay soporte directo documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; por el tamano del modelo, la latencia por imagen en CPU se espera en el orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Precision tipica | Licencia |
|---|---|---|---|---|
| Salamah01/mnist-cnn-pytorch | CNN pequena (2 conv + 2 densas) | MNIST | 99,11 % (reportada) | MIT |
| CNN MLP basica (referencia clasica) | MLP 2 capas | MNIST | ~98 % | varia |
| LeNet-5 (referencia clasica) | CNN 2 conv + 2 densas | MNIST | ~99 % | varia |

No hay modelos comparables publicados en HuggingFace con datos verificables en la informacion disponible; la tabla usa referencias clasicas del campo a titulo orientativo.

## Limitaciones y advertencias

- **Ambito muy restringido**: solo reconoce digitos 0-9 en imagenes de 28 x 28 en escala de grises. No generaliza a letras, simbolos, imagenes a color ni resoluciones distintas sin reentrenamiento o preprocesamiento.
- **Sensibilidad al preprocesamiento**: la entrada debe normalizarse exactamente con media 0,1307 y std 0,3081, y presentar el digito blanco sobre fondo negro; de lo contrario, la precision degradara de forma significativa.
- **Sin metricas verificadas de forma independiente**: la precision del 99,11 % es la reportada por el autor; no hay evaluacion externa ni detalles sobre la particion de test utilizada.
- **Riesgo de errores en digitos ambiguos**: como todo modelo entrenado solo con MNIST, puede fallar con caligrafias atipicas, digitos tachados o ruido en la imagen.
- **Sesgos del dataset**: MNIST esta compuesto por digitos manuscritos de funcionarios del censo de EE. UU. y estudiantes de secundaria; el rendimiento puede caer con estilos de escritura de otras procedencias.
- **Licencia**: MIT, sin restricciones para uso comercial, pero sin ninguna garantia; no es adecuado para aplicaciones criticas (por ejemplo, procesamiento de cheques bancarios) sin validacion exhaustiva.
- **Proyecto de aprendizaje**: sin mantenimiento aparente (0 descargas en el momento de la ficha), por lo que no debe esperarse soporte continuo ni actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salamah01/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Paper original de MNIST (LeCun et al.): http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
