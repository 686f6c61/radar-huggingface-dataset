# Ohunene/mnist-cnn-pytorch

## Resumen

`Ohunene/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) pequena entrenada para clasificar digitos manuscritos del conjunto de datos MNIST (clases 0-9). Lo desarrolla el usuario Ohunene como proyecto de aprendizaje, segun se indica explicitamente en la model card. No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes de proposito muy acotado.

El modelo resuelve una unica tarea: dada una imagen en escala de grises de 28x28 pixeles con un digito blanco sobre fondo negro, predecir a que clase (0-9) corresponde. Su relevancia practica es limitada; se trata de un artefacto educativo util como referencia para entender el flujo completo de entrenamiento y publicacion en PyTorch, no como componente de produccion.

La arquitectura es una CNN secuencial de dos bloques convolucionales seguidos de una cabeza fully-connected. El repositorio tiene un tamano de 0.0 GB (pesos en formato `.pth` de PyTorch), 0 descargas y 0 likes en el momento de la consulta. La model card reporta una precision de test del 96,57 % sobre MNIST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible (no se indica en la model card; estimable en el orden de cientos de miles, pero no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 1x28x28) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `.pth` en precision de entrenamiento) |
| Idiomas soportados | no aplica (clasificacion de digitos, sin capacidad linguistica) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`mnist_cnn.pth`) |

## Arquitectura y entrenamiento

La red es una CNN clasica de dos bloques convolucionales. Cada bloque aplica una convolucion 2D seguida de ReLU y max pooling; tras el aplanado, una capa lineal de 3136 a 128 neuronas, ReLU, dropout con tasa 0.3 y una capa de salida lineal de 128 a 10 clases. La entrada se normaliza con media 0,1307 y desviacion tipica 0,3081, valores estandar de MNIST.

El entrenamiento usa el optimizador Adam con learning rate 0,001 y la funcion de perdida CrossEntropyLoss, durante 5 epocas con batch size 64. No se indica en la model card el numero de tokens (no aplica), la composicion detallada del dataset mas alla de MNIST, ni si hubo tecnicas de regularizacion adicionales aparte del dropout. No se menciona RLHF, DPO ni ninguna innovacion arquitectonica (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Clasificacion de imagenes de digitos manuscritos en 10 clases (0-9).
- Entrada restringida a imagenes en escala de grises de 1x28x28 pixeles, digito blanco sobre fondo negro y normalizadas con media 0,1307 y std 0,3081.
- Salida de 10 logits (uno por clase) mediante `CrossEntropyLoss`/softmax implicito en inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Docencia y aprendizaje de PyTorch: sirve como ejemplo minimo y reproducible de entrenamiento, guardado y carga de un modelo de vision, util en cursos introductorios de deep learning.
- Prototipado de pipelines de clasificacion de imagenes: permite validar rapido el flujo de preprocesado (normalizacion 0,1307/0,3081), inferencia y evaluacion antes de escalar a un modelo mayor.
- Pruebas unitarias de infraestructura de serving: al ser un modelo pequeno y rapido, se puede usar como "smoke test" en entornos de despliegue de modelos de vision.
- Reconocimiento de digitos en formularios escaneados muy controlados: solo si las imagenes se ajustan exactamente al formato MNIST (28x28, blanco sobre negro, normalizacion fija); en la practica requeriria un preprocesado previo de recorte y binarizacion.
- Benchmark de referencia para comparar tecnicas de entrenamiento: util como linea base de 96,57 % de accuracy frente a variantes con mas capas o data augmentation.
- Demostracion educativa de publicacion de modelos en HuggingFace Hub: ilustra el flujo de subida de pesos `.pth` y model card con metadatos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MNIST test accuracy | 96,57 % | Reportado en la model card del autor |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y ninguno de ellos seria aplicable a un clasificador de vision.

## Requisitos de hardware

- Inferencia en CPU es suficiente: el modelo es una CNN de dos bloques convolucionales y una cabeza lineal pequena, con entrada 1x28x28.
- VRAM estimada para inferencia en GPU: no disponible con precision, pero por el tamano del repositorio (0.0 GB) es del orden de decenas de MB como maximo; cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 4090, RTX 3060, A100, H100) puede ejecutarlo, aunque el hardware adecuado es CPU por la carga computacional minima.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB de VRAM; tambien en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: inferencia directa con PyTorch (`torch.load` + `model.eval()`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Para serving se podria envolver en TorchServe o FastAPI, aunque no se menciona en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MNIST accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ohunene/mnist-cnn-pytorch | no disponible | no aplica | 96,57 % | MIT | HuggingFace (0 descargas) |
| LeNet-5 (referencia clasica) | ~60 K | no aplica | ~99 % (reportado en literatura) | no disponible | Referencia academica |
| Alternativas CNN en HuggingFace para MNIST | no disponible | no aplica | no disponible | variable | HuggingFace |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparativa rigurosa con alternativas concretas. Los valores de LeNet-5 corresponden a la literatura general y no a una evaluacion directa contra este modelo.

## Limitaciones y advertencias

- Proyecto de aprendizaje: el propio autor lo describe como "beginner learning project"; no debe tratarse como modelo validado para produccion.
- Precision limitada: 96,57 % en MNIST esta por debajo de lo que alcanzan CNNs bien ajustadas (habitualmente >99 %), lo que sugiere margen de mejora en arquitectura o entrenamiento.
- Dominio muy restringido: solo funciona con imagenes 1x28x28 en escala de grises, digito blanco sobre negro y normalizacion exacta (media 0,1307, std 0,3081). Cualquier desviacion del formato degrada la prediccion.
- Sin capacidades linguisticas ni generativas: no procesa texto, no soporta tool calling ni agentes.
- Riesgo de sobreajuste o sesgos del dataset MNIST: MNIST esta compuesto por digitos manuscritos de una poblacion limitada; el modelo puede fallar con estilos de escritura, idiomas o caligrafias no representados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias explicitas del autor.
- Sin datos de cuantizacion ni de despliegue en formatos optimizados (ONNX, GGUF), lo que limita su uso en entornos de inferencia especializados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ohunene/mnist-cnn-pytorch
- Dataset MNIST (referencia): https://huggingface.co/datasets/mnist
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
