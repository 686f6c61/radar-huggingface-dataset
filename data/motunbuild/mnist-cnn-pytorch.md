# Motunbuild/mnist-cnn-pytorch

## Resumen

`Motunbuild/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) de pequeno tamano entrenada para clasificar digitos manuscritos del conjunto MNIST (clases 0-9). El modelo ha sido publicado por el usuario Motunbuild como proyecto de aprendizaje introductorio, no como un sistema de produccion ni como un modelo de lenguaje. No es un transformer ni un modelo generativo: es un clasificador de imagenes supervisado de proposito general limitado a una unica tarea.

La arquitectura es una CNN clasica de dos bloques convolucionales seguidos de una cabeza fully-connected, con aproximadamente 1,7 millones de parametros. Alcanza una precision de test del 99,05% sobre MNIST, un resultado consistente con lo esperable en esta tarea. El repositorio no contiene pesos en formato safetensors ni GGUF, sino un unico fichero `mnist_cnn.pth` en formato PyTorch nativo, y el codigo del modelo (`model.py`) debe importarse por separado.

Su relevancia practica es acotada: sirve como referencia didactica para pipelines de vision por computador en PyTorch y como punto de partida para fine-tuning o comparacion de arquitecturas, pero no cubre ninguna de las capacidades asociadas a los modelos de lenguaje (generacion de texto, razonamiento, tool calling, agentes ni multilingueismo). Cualquier ficha que lo trate como LLM seria enganosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 bloques Conv2d + ReLU + MaxPool, seguidos de Flatten y capas Linear) |
| Parametros totales | Aproximadamente 1,7 millones (estimacion a partir de la arquitectura descrita; el autor no publica la cifra exacta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo pesos PyTorch en `mnist_cnn.pth`) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch nativo (`.pth`) |

## Arquitectura y entrenamiento

La red sigue el esquema clasico de dos etapas convolucionales: `Conv2d + ReLU + MaxPool` repetido dos veces, aplanado (`Flatten`) y una cabeza densa `Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10)`. La entrada es una imagen en escala de grises de 1x28x28 pixeles, normalizada con media 0,1307 y desviacion tipica 0,3081 (los estadisticos estandar de MNIST). La salida es un vector de 10 logits correspondiente a las clases 0-9.

El entrenamiento se realizo con el optimizador Adam (learning rate 0,001) y funcion de perdida CrossEntropyLoss, durante 5 epocas con un tamano de lote de 64. No se documenta uso de data augmentation, tecnicas de regularizacion adicionales mas alla del dropout, ni etapas de RLHF/DPO (no aplicables a este tipo de modelo). No hay innovaciones tecnicas destacables: es una implementacion de referencia de una CNN basica sobre MNIST.

## Capacidades

- Clasificacion de imagenes en escala de grises de 28x28 pixeles en una de 10 clases (digitos 0-9).
- Reconocimiento de digitos manuscritos con precision de test del 99,05% sobre MNIST.
- Inferencia rapida en CPU (modelo de ~1,7M parametros, sin requisitos de GPU).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni ninguna capacidad generativa.

## Casos de uso

- Prototipado educativo de vision por computador: sirve como ejemplo reproducible de pipeline PyTorch (carga de pesos, normalizacion, inferencia) para quienes aprenden CNN.
- Baseline para experimentos de MNIST: permite comparar rapidamente arquitecturas alternativas (LeNet, ResNet pequenas) contra un resultado conocido del 99,05%.
- Preprocesado de formularios escaneados: con un paso previo de segmentacion de digitos, puede usarse para reconocer casillas numericas manuscritas en entornos controlados.
- Demostraciones de inferencia en CPU: al no requerir GPU, es util para desplegar un clasificador de digitos en dispositivos modestos o en notebooks.
- Fine-tuning sobre un subconjunto de digitos propio: la arquitectura es lo bastante simple para reentrenarse con pocos datos y ajustar la cabeza de clasificacion.
- Pruebas de integracion de `huggingface_hub` con PyTorch: valido como caso de prueba para pipelines de descarga y carga de pesos `.pth` desde el Hub.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo de referencia |
|---|---|---|
| MNIST test accuracy | 99,05% | No disponible (el autor no compara con otros modelos) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo no es un LLM y esas metricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.).
- Inferencia en CPU viable: ~1,7M parametros permiten ejecucion en CPU en milisegundos por imagen.
- GPU recomendadas: ninguna especifica; cualquier GPU con al menos 1 GB de memoria es suficiente.
- Opciones de despliegue: PyTorch nativo (`torch.load`), exportacion a TorchScript u ONNX (no documentada por el autor, pero factible dado el formato).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Precision MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motunbuild/mnist-cnn-pytorch | ~1,7M | Clasificacion de digitos | 99,05% | MIT | HuggingFace Hub |
| LeNet-5 clasica | ~60K | Clasificacion de digitos | ~99% (referencia historica) | No disponible | Implementaciones multiples |
| CNN generica sobre MNIST | Variable | Clasificacion de digitos | 98-99,5% tipico | Variable | Multiples repositorios |

No se dispone de comparaciones publicadas por el autor con modelos concretos del Hub; la tabla anterior recoge referencias generales de la literatura, no mediciones directas del autor.

## Limitaciones y advertencias

- Solo funciona con imagenes de 1x28x28 en escala de grises, con digito blanco sobre fondo negro y normalizacion con media 0,1307 y std 0,3081; entradas fuera de ese formato produciran predicciones invalidas.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de clasificacion erronea en imagenes ruidosas, rotadas o con dominancia de trazo distinta a MNIST.
- Sesgos: el dataset MNIST esta sesgado hacia digitos manuscritos de estilo estadounidense; el rendimiento puede degradarse con otros estilos de escritura.
- No se documentan limitaciones de contexto ni de idioma porque no aplican.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se presenta como proyecto de aprendizaje.
- El repositorio no incluye `model.py` en la informacion disponible; la carga requiere definir la clase `MNISTCNN` por separado segun la arquitectura documentada.
- El fichero de pesos esta en formato `.pth`, lo que requiere `torch.load` y confianza en el origen del binario (riesgo de deserializacion de pickle).

## Enlaces

- HuggingFace: https://huggingface.co/Motunbuild/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Documentacion PyTorch: https://pytorch.org/docs/stable/index.html
- Documentacion `huggingface_hub`: https://huggingface.co/docs/huggingface_hub
