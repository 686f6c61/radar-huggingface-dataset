# Omolola17/mnist-cnn-pytorch

## Resumen

MNIST Handwritten Digit Classifier (PyTorch CNN) es un pequeño modelo de clasificación de imágenes desarrollado por el usuario de Hugging Face Omolola17, concebido como proyecto de aprendizaje. Se trata de una red neuronal convolucional ligera implementada en PyTorch que reconoce dígitos manuscritos del 0 al 9 sobre el clásico dataset MNIST.

El modelo resuelve la tarea de visión artificial más habitual como punto de entrada: la clasificación de dígitos manuscritos en imágenes en escala de grises de 28x28 píxeles. Aunque MNIST está muy lejos del estado del arte en visión, sigue siendo un benchmark de referencia para validar pipelines de entrenamiento, despliegue y cuantización, y este modelo alcanza una precisión del 99,15 % en el conjunto de test.

No es un modelo de lenguaje ni tiene ventana de contexto: es un clasificador de imágenes puro, con pesos en formato `.pth` de PyTorch y licencia MIT, lo que lo hace utilizable sin restricciones en proyectos educativos, demos o pruebas de integración de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2d + ReLU + MaxPool, followed by capas densas) |
| Parametros totales | no disponible (aprox. del orden de decenas de miles, dada la capa Linear(3136, 128)) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura consta de dos bloques convolucionales (Conv2d + ReLU + MaxPool), seguidos de un aplanado (Flatten), una capa densa de 3136 a 128 neuronas con ReLU, un Dropout del 0,3 para regularizacion y una capa final de 128 a 10 salidas correspondientes a los diez digitos. La entrada es una imagen en escala de grises de 1x28x28, con digito blanco sobre fondo negro.

El entrenamiento se realizo sobre el dataset MNIST con el optimizador Adam (learning rate 0,001), funcion de perdida CrossEntropyLoss, 5 epocas y un batch size de 64. Las entradas se normalizaron con media 0,1307 y desviacion tipica 0,3081, los valores estandar de MNIST. No se ha publicado informacion sobre tecnicas adicionales como aumento de datos, schedules de learning rate o destilacion.

## Capacidades

- Clasificacion de digitos manuscritos (0-9) en imagenes en escala de grises de 28x28 pixeles.
- Precision del 99,15 % en el conjunto de test de MNIST.
- Inferencia ligera: cabe y se ejecuta rapidamente en CPU, sin necesidad de GPU.
- Carga sencilla mediante `huggingface_hub.hf_hub_download` y `torch.load`, con el codigo de la clase `MNISTCNN` incluido en el repositorio.
- No soporta otras tareas de vision (deteccion, segmentacion, OCR general) ni entradas a color o de otro tamano sin reentrenamiento o adaptacion.

## Casos de uso

- Aprendizaje de PyTorch y vision artificial: el repositorio incluye el codigo de la arquitectura y los pesos, ideal para estudiar el flujo completo de entrenamiento, guardado y carga de un modelo convolucional.
- Prueba de pipelines de despliegue: por su tamano minimo, es un candidato perfecto para ensayar servicios de inferencia (FastAPI, TorchServe, ONNX Runtime) antes de integrar modelos mayores.
- Digitalizacion de formularios con digitos: reconocimiento de numeros escritos a mano en formularios escaneados, siempre que las imagenes se recorten y normalicen a 28x28 en escala de grises con digito blanco sobre fondo negro.
- Validacion de infraestructura de MLOps: uso como modelo "canary" para probar versionado, monitorizacion y CI/CD de modelos en produccion.
- Ensennanza de cuantizacion y optimizacion: al ser tan ligero, permite experimentar con cuantizacion a int8 o exportacion a ONNX y medir el impacto en latencia sin coste computacional relevante.
- Demos interactivas y apps educativas: aplicaciones web o moviles que reconocen digitos dibujados en tiempo real en un lienzo, ejecutandose integramente en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (MNIST) | 99,15 % |

No se han publicado comparaciones con otros modelos ni resultados adicionales en la informacion disponible. Como referencia contextual, el estado del arte en MNIST supera el 99,7 % con arquitecturas mas complejas o con aumento de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo pesa pocos cientos de kilobytes y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: ninguna; cualquier hardware moderno es suficiente. En caso de entrenamiento, cualquier GPU de consumo (por ejemplo una GTX 1650 o superior) completa las 5 epocas en segundos o minutos.
- Cabe con holgura en cualquier GPU de consumo e incluso en microcontroladores con suficientes recursos tras cuantizacion.
- Opciones de despliegue: PyTorch nativo (torch.load), exportacion a ONNX para ONNX Runtime, integracion en TorchServe, FastAPI o apps moviles via PyTorch Mobile.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia por imagen en CPU se espera en el orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Precision MNIST | Licencia | Notas |
|---|---|---|---|---|
| Omolola17/mnist-cnn-pytorch | CNN pequena en PyTorch | 99,15 % | MIT | Proyecto educativo, pesos en .pth |
| CNNs tipicas de referencia en MNIST (LeNet-5 y derivados) | CNN | ~99,0-99,3 % | variadas | Arquitectura similar, dos conv + densas |
| Modelos MLP simples sobre MNIST | MLP | ~97-98 % | variadas | Menores precision, sin extraccion de caracteristicas convolucional |

No se han publicado comparaciones directas por parte del autor; la tabla anterior es contextual y aproximada.

## Limitaciones y advertencias

- El modelo solo reconoce digitos manuscritos en el formato exacto de MNIST: imagenes 28x28 en escala de grises, digito blanco sobre fondo negro y normalizacion con media 0,1307 y std 0,3081. Entradas con otro fondo, inversion de colores o distinto tamano degradaran gravemente el rendimiento.
- Al tratarse de un proyecto de aprendizaje con 0 descargas registradas, no hay evidencia de uso en produccion ni revision comunitaria; conviene validar los pesos antes de confiar en ellos.
- No hay informacion sobre sesgos del dataset mas alla de los propios de MNIST (estilos de escritura mayoritariamente de poblacion estadounidense, ausencia de ciertos formatos europeos como el 1 con serif o el 7 tachado).
- La precision del 99,15 % implica aproximadamente un 0,85 % de errores; en aplicaciones reales de OCR de digitos puede requerirse un segundo nivel de verificacion.
- La licencia MIT permite uso comercial sin restricciones significativas, unicamente conservando el aviso de licencia.
- No hay versiones cuantizadas ni exportaciones a otros formatos publicadas; cualquier optimizacion adicional corre de cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Omolola17/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Paper o repositorio adicional: no disponible
