# Adeolaaa/mnist-cnn-pytorch

## Resumen

`Adeolaaa/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) pequena entrenada desde cero para clasificar digitos manuscritos del conjunto de datos MNIST (clases 0-9). Lo publica el usuario Adeolaaa en Hugging Face como proyecto de aprendizaje, segun indica la propia model card. No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imagenes de proposito muy especifico, con una arquitectura clasica de dos bloques convolucionales seguidos de dos capas densas.

El modelo resuelve una unica tarea: dada una imagen en escala de grises de 1x28x28 pixeles con un digito blanco sobre fondo negro, predecir la clase entre 0 y 9. Alcanza un 99,14 % de accuracy en el conjunto de test de MNIST, un resultado competitivo para una CNN de este tamano entrenada durante solo 5 epocas con Adam y CrossEntropyLoss.

Su relevancia practica es limitada fuera del ambito educativo o de prototipado rapido: sirve como referencia minima de pipeline de vision por computador en PyTorch y como baseline para tareas de OCR de digitos aislados. No hay informacion sobre parametros totales, contexto, idiomas ni formato de pesos mas alla del checkpoint `.pth` en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 x Conv2d + ReLU + MaxPool -> Flatten -> Linear -> ReLU -> Dropout -> Linear) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint de PyTorch, `mnist_cnn.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial: dos bloques formados por `Conv2d` + `ReLU` + `MaxPool`, seguidos de un `Flatten` que produce un vector de 3136 elementos, una capa `Linear(3136, 128)` con `ReLU`, un `Dropout(0.3)` y una capa de salida `Linear(128, 10)`. La entrada se normaliza con media 0,1307 y desviacion tipica 0,3081, valores estandar del dataset MNIST.

El entrenamiento usa el optimizador Adam con learning rate 0,001, funcion de perdida `CrossEntropyLoss`, 5 epocas y batch size de 64. No se documenta el numero exacto de parametros, el tamano del conjunto de entrenamiento mas alla del propio MNIST (60.000 imagenes de entrenamiento y 10.000 de test en su particion estandar) ni si se aplicaron tecnicas de aumento de datos. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos en 10 clases (0-9).
- Entrada exclusivamente en escala de grises, 1x28x28 pixeles, digito blanco sobre fondo negro.
- Salida de 10 logits (uno por clase) tras la capa final.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni ninguna capacidad multimodal.

## Casos de uso

- **Prototipado educativo de vision por computador**: sirve como primer modelo para que estudiantes o desarrolladores noveles entiendan el ciclo completo de entrenamiento, evaluacion e inferencia en PyTorch, dado que la arquitectura y los hiperparametros estan documentados en la model card.
- **Baseline para OCR de digitos aislados**: se puede usar como referencia de precision (99,14 %) al construir un pipeline de reconocimiento de digitos en formularios, tickets o cupones, segmentando previamente cada digito en una imagen de 28x28.
- **Validacion de pipelines de preprocesado de imagen**: al ser un modelo pequeno y rapido, permite comprobar si la normalizacion, el redimensionado y la binarizacion de imagenes de entrada funcionan correctamente antes de invertir en un modelo mayor.
- **Pruebas de integracion en aplicaciones de demostracion**: util en demos web o notebooks interactivos donde se dibuja un digito en un canvas y se clasifica en tiempo real, aprovechando el bajo coste computacional del modelo.
- **Benchmark interno de infraestructura de inferencia**: por su tamano reducido, sirve para medir latencia base de un servidor o de un contenedor antes de desplegar modelos mas pesados.
- **Generacion de datos sinteticos etiquetados**: combinado con tecnicas de augmentation, puede usarse para etiquetar automaticamente variantes de digitos en conjuntos propios y ampliar el entrenamiento de clasificadores mas robustos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| MNIST (test) | Accuracy | 99,14 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint `.pth` ocupa practicamente nada y la red es de muy pocos parametros.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o incluso CPU es suficiente para inferencia.
- Cabe en cualquier GPU consumer, incluida una GTX 1650, RTX 3050 o superior, y tambien en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pth`), exportacion a TorchScript, ONNX Runtime o conversion a otros formatos para despliegue en movil o edge.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamano del modelo se espera un throughput muy alto en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adeolaaa/mnist-cnn-pytorch | no disponible | Clasificacion de digitos | 99,14 % | MIT | Hugging Face |
| LeNet-5 (referencia clasica) | ~60.000 | Clasificacion de digitos | ~99 % (referencia) | no disponible | Implementaciones multiples |
| ResNet-18 adaptado a MNIST | ~11,2 M | Clasificacion de imagenes | no disponible | no disponible | Implementaciones multiples |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para modelos equivalentes entrenados especificamente sobre MNIST.

## Limitaciones y advertencias

- Modelo de proposito muy limitado: solo clasifica digitos manuscritos en escala de grises de 28x28; no generaliza a otros tipos de imagen ni a otros alfabetos.
- Sensible al preprocesado: requiere normalizacion exacta (media 0,1307, std 0,3081) y digito blanco sobre fondo negro; imagenes invertidas o con otro contraste degradaran la precision.
- No hay informacion sobre sesgos especificos, pero al entrenarse sobre MNIST hereda los sesgos de ese dataset (predominantemente digitos manuscritos estadounidenses).
- Riesgo de alucinacion no aplica en el sentido de modelos generativos, pero si puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion, siempre que se incluya el aviso de copyright y la licencia original.
- No documenta el numero de parametros ni el tamano del checkpoint, lo que dificulta estimar requisitos de almacenamiento y despliegue con precision.
- Proyecto de aprendizaje: no hay evidencia de validacion externa, mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeolaaa/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
