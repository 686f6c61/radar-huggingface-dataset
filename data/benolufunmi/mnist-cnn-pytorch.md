# BenOlufunmi/mnist-cnn-pytorch

## Resumen

`BenOlufunmi/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) de pequeno tamano entrenada para clasificar digitos manuscritos del conjunto de datos MNIST (clases 0-9). Lo desarrolla el usuario BenOlufunmi y se publica como proyecto de aprendizaje, no como modelo de proposito general. No es un modelo de lenguaje ni un transformer: es un clasificador de imagenes de 28x28 pixeles en escala de grises, con una arquitectura secuencial muy compacta (dos bloques convolucionales seguidos de dos capas fully connected).

El modelo resuelve una unica tarea: dado un digito manuscrito normalizado, predecir su etiqueta entre diez clases. Su interes practico es limitado fuera del ambito docente o de prototipado rapido, ya que MNIST es un benchmark saturado y el propio autor lo describe como un ejercicio introductorio. Aun asi, resulta util como referencia minima para validar pipelines de inferencia de PyTorch, para comparar preprocesados o como base para experimentos de cuantizacion y despliegue en entornos con recursos muy limitados.

El repositorio no incluye informacion sobre parametros totales, contexto (no aplica), idiomas ni formatos alternativos de pesos. La model card unicamente documenta la arquitectura, los hiperparametros de entrenamiento y una precision de test del 99,26% sobre MNIST. No hay datos de benchmarks adicionales ni comparativas publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificacion de digitos, sin componente linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (state_dict de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una CNN clasica de dos bloques convolucionales. Cada bloque aplica una convolucion 2D seguida de ReLU y max pooling; tras el aplanado, una capa lineal de 3136 a 128 neuronas con ReLU y dropout del 0,3 alimenta la capa de salida de 10 clases. La entrada es un tensor de 1x28x28 normalizado con media 0,1307 y desviacion tipica 0,3081, valores estandar de MNIST. El modelo se entreno durante 5 epocas con optimizador Adam (learning rate 0,001), funcion de perdida CrossEntropyLoss y tamano de lote 64. No se documenta aumento de datos, regularizacion adicional ni tecnicas de calibracion.

No hay informacion sobre el numero de parametros, el volumen exacto de datos de entrenamiento (mas alla del split estandar de MNIST, 60.000 imagenes de entrenamiento y 10.000 de test) ni sobre procesos de ajuste fino, RLHF o destilacion. Tampoco se describe ninguna innovacion tecnica: es una implementacion convencional orientada al aprendizaje. La model card no incluye semillas, hardware de entrenamiento ni curvas de validacion.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos (0-9) en escala de grises de 28x28 pixeles.
- Salida de 10 logits correspondientes a las clases del 0 al 9.
- Inferencia en CPU y GPU mediante PyTorch estandar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.
- No acepta imagenes en color ni resoluciones distintas de 28x28 sin preprocesado adicional.

## Casos de uso

- Prototipado docente de vision por computador: sirve como ejemplo minimo para explicar el flujo completo de entrenamiento, evaluacion y publicacion de un modelo en Hugging Face, dado su bajo coste computacional.
- Validacion de pipelines de inferencia en PyTorch: util para comprobar que un entorno de despliegue carga correctamente `state_dict`, aplica la normalizacion adecuada y devuelve logits coherentes antes de migrar a modelos mayores.
- Preprocesado en sistemas de digitalizacion de formularios: como componente de un pipeline OCR mas amplio, puede clasificar recortes de digitos aislados (codigos postales, numeros de formulario) siempre que se segmenten y normalicen previamente.
- Benchmark de cuantizacion y optimizacion: al ser una red pequena, permite medir el impacto de cuantizacion a int8 o de exportacion a ONNX/TorchScript sin grandes requisitos de hardware.
- Pruebas de regresion en CI/CD de modelos: se puede incluir como caso de prueba rapido para verificar que los cambios en una libreria de inferencia no rompen la carga de pesos ni la forma de salida.
- Demostraciones interactivas en navegador o dispositivos de bajos recursos: su tamano reducido permite ejecutarlo en entornos embebidos o en el cliente mediante exportaciones ligeras, aunque no se publican dichas exportaciones.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MNIST (test accuracy) | 99,26% | Unico dato publicado por el autor |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32, dado el tamano reducido de la red (dos convoluciones y dos capas lineales). No se publica el numero exacto de parametros.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo funciona igualmente en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (unico formato publicado, `.pth`). No hay pesos en GGUF, ONNX ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BenOlufunmi/mnist-cnn-pytorch | no disponible | no aplica | 99,26% | MIT | Hugging Face (`.pth`) |
| LeNet-5 (referencia clasica) | ~60.000 | no aplica | ~99% | variable segun implementacion | Multiples repositorios |
| Alternativas CNN en Hugging Face | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos comparativos publicados por el autor. Las cifras de LeNet-5 son orientativas y dependen de la implementacion concreta; no se han verificado contra una fuente unica en la informacion proporcionada.

## Limitaciones y advertencias

- Solo clasifica digitos manuscritos de 0 a 9; no generaliza a letras, simbolos ni imagenes en color.
- Requiere entrada exacta de 1x28x28 en escala de grises con normalizacion (media 0,1307, std 0,3081); cualquier desviacion degrada la precision.
- Sensible al estilo de escritura del dataset MNIST; el rendimiento puede caer con digitalizaciones reales (ruido, rotaciones, trazos gruesos).
- Riesgo de sobreajuste al benchmark MNIST: la precision del 99,26% no implica robustez en produccion.
- No hay informacion sobre sesgos, pero el dataset MNIST esta sesgado hacia estilos de escritura concretos (predominantemente estadounidenses) y no representa la diversidad global de caligrafias.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se publican pesos en formatos alternativos ni scripts de exportacion, lo que limita su integracion en stacks no basados en PyTorch.
- Proyecto de aprendizaje sin mantenimiento declarado; riesgo de obsolescencia frente a versiones futuras de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BenOlufunmi/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
