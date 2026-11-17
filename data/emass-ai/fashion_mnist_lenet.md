# emass-ai/fashion_mnist_lenet

## Resumen

`fashion_mnist_lenet` es una red neuronal convolucional (CNN) de tamano muy reducido, publicada por emass-ai, que clasifica imagenes en escala de grises de 28x28 pixeles del conjunto Fashion-MNIST en 10 clases de prendas de vestir. Con solo 28.330 parametros y 111,6 KB en precision float, esta disenada explicitamente para validar el flujo de herramientas ECS-Compiler de ECS-Studio sobre la placa ECS-DoT EVB, un dispositivo orientado a TinyML.

El modelo no es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes ONNX que sirve como referencia funcional para comprobar que el pipeline de compilacion, cuantizacion a int8 y despliegue en hardware embebido funciona de extremo a extremo. Su interes radica en la verificacion fisica documentada: inferencia en 4,29 ms sobre la placa, precision int8 del 92,50 % en un subconjunto de 200 muestras y coincidencia con ONNX Runtime en 198 de 200 muestras.

La relevancia actual es acotada y muy especifica: es util para ingenieros que evaluan ECS-Studio y ECS-DoT, o que necesitan un ejemplo minimo reproducible de compilacion ONNX a int8 para microcontroladores. No es adecuado como componente de produccion ni como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: Conv 5x5 s2 1->24 (28->12) + BN + ReLU; Conv 3x3 s2 p1 24->48 (12->6) + BN + ReLU; Flatten(1728); Linear 1728->10; Softmax |
| Parametros totales | 28.330 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de imagen 1x28x28) |
| Tipos de cuantizacion | int8 (compilacion ECS-Compiler); pesos float32 en el ONNX original |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes, sin etiquetas de idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`fashion_mnist_lenet.onnx`); conjuntos de calibracion y evaluacion en NPZ |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial minima con dos convoluciones estratificadas (stride 2) en lugar de pooling, lo que reduce las mapas de caracteristicas de 28x28 a 12x12 y luego a 6x6. Tras el aplanado (1728 elementos) hay una unica capa lineal de 1728 a 10 seguida de Softmax. Los pesos estan estandarizados a media cero (weight-standardized), las capas BatchNorm estan plegadas en las convoluciones y la unica no linealidad es ReLU. La entrada es `input` [1, 1, 28, 28] float32 en formato NCHW, con preprocesado `x = (pixel/255 - 0.2860) / 0.3530` sobre la imagen uint8 de 28x28.

El entrenamiento se realizo sobre Fashion-MNIST (Zalando Research, 2017; licencia MIT), con el split oficial de 60.000 imagenes de entrenamiento y 10.000 de test. La model card no detalla hiperparametros de entrenamiento, numero de epocas, optimizador ni si hubo aumento de datos; esa informacion no esta disponible. La innovacion tecnica destacable no reside en la arquitectura, sino en el flujo de despliegue: compilacion con ECS-Compiler (motor 0.6.0) en ECS-Studio 1.140.0, cuantizacion int8 calibrada con `fashion_mnist_lenet_train.npz`, reparto de capas entre la DLA (5 capas) y la CPU (1 capa), y verificacion sobre placa fisica con huella de build `2d655690e063`.

## Capacidades

- Clasificacion de imagenes en escala de grises de 28x28 pixeles en 10 clases: T-shirt/top, Trouser, Pullover, Dress, Coat, Sandal, Shirt, Sneaker, Bag y Ankle boot.
- Salida de 10 logits/probabilidades float32 (`output` [1, 10]) a partir de una unica imagen.
- Inferencia cuantizada a int8 sobre la placa ECS-DoT EVB, con 5 capas en la DLA y 1 en la CPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni generacion de texto.
- No admite entradas de distinto tamano ni contexto variable: la forma de entrada esta fijada a 1x1x28x28.

## Casos de uso

- Validacion del pipeline ECS-Compiler: cargar el ONNX en ECS-Studio, ejecutar la calibracion con `fashion_mnist_lenet_train.npz`, compilar y comparar la salida de la placa con ONNX Runtime. Es el uso principal declarado por el autor y permite reproducir el resultado verificado con los ajustes por defecto.
- Prueba de humo de una placa ECS-DoT EVB: ejecutar `dla_infer()` sobre `sample_input.npz` y comprobar que la prediccion coincide con la esperada (cosine similarity >= 0,9998 en las muestras verificadas).
- Referencia de cuantizacion int8 en TinyML: usar el modelo como caso base para medir la perdida de precision al pasar de float (93,50 % en 200 muestras) a int8 (92,50 %) y calibrar expectativas en proyectos propios.
- Benchmark de latencia en microcontroladores: medir el tiempo de inferencia (4,29 ms de mediana en 204 ejecuciones a 50 MHz) y el tamano de la libreria compilada (52,2 KB) como linea base frente a otros modelos.
- Docencia y demostraciones de CNN sobre Fashion-MNIST: por su tamano (28.330 parametros) y su arquitectura simple, sirve para explicar convoluciones estratificadas, plegado de BatchNorm y despliegue en hardware.
- Integracion en un pipeline CI/CD de modelos embebidos: automatizar la compilacion y la comparacion contra ONNX Runtime para detectar regresiones en el compilador o en la cuantizacion.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision top-1 (float) | 90,92 % | Fashion-MNIST test oficial, 10.000 muestras, ONNX Runtime |
| Precision top-1 (float, subconjunto) | 93,50 % | 200 muestras de evaluacion |
| Precision top-1 (int8 en placa) | 92,50 % | Mismas 200 muestras, ECS-DoT EVB |
| Coincidencia con ONNX Runtime (placa) | 198 de 200 muestras | Evaluacion int8 en placa |
| Tiempo de inferencia | 4,29 ms | Mediana de 204 ejecuciones de `dla_infer()`, ECS-DoT a 50 MHz |
| Tamano de libreria compilada | 52,2 KB | `libdla.a`, 5 capas en DLA y 1 en CPU |
| Tamano del modelo float | 111,6 KB | Pesos float32 |
| Similitud coseno en muestras reales | >= 0,9998 | 3 muestras reales en placa |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo ocupa 111,6 KB en float y genera una libreria compilada de 52,2 KB en int8.
- GPU recomendadas: no requiere GPU; la ejecucion de referencia es en la placa ECS-DoT EVB (DLA + CPU a 50 MHz).
- Cabe en cualquier GPU consumer, e incluso en microcontroladores; no es necesario hardware dedicado.
- Opciones de despliegue: ECS-Compiler dentro de ECS-Studio 1.140.0 o superior (flujo verificado); ONNX Runtime para la inferencia float de referencia.
- Latencia y throughput: 4,29 ms por inferencia en la ECS-DoT EVB (mediana de 204 ejecuciones). El throughput no se documenta de forma explicita, pero equivale a aproximadamente 233 inferencias por segundo en esa placa.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Precision reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fashion_mnist_lenet (emass-ai) | 28.330 | 1x28x28 gris | 90,92 % top-1 (float, test completo); 92,50 % int8 en 200 muestras | apache-2.0 | Hugging Face, ONNX |
| LeNet-5 clasico sobre Fashion-MNIST | no disponible en la informacion proporcionada | 1x28x28 gris | no disponible | no disponible | no disponible |
| Otras CNN para Fashion-MNIST | no disponible en la informacion proporcionada | 1x28x28 gris | no disponible | no disponible | no disponible |

No se dispone de datos verificados de modelos alternativos en la informacion proporcionada; la comparativa con alternativas concretas no esta disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo se proporciona para evaluar y validar ECS-Compiler y ECS-DoT, que no es un producto y que no ha sido probado para ningun uso final concreto.
- Solo clasifica imagenes de 28x28 en escala de grises del dominio Fashion-MNIST; no generaliza a otras resoluciones, a color ni a dominios visuales distintos.
- La precision int8 en placa (92,50 %) es inferior a la float en el mismo subconjunto (93,50 %); existe una perdida medible por cuantizacion.
- La precision float de 90,92 % corresponde al test oficial completo, mientras que el 93,50 % y el 92,50 % corresponden a un subconjunto de 200 muestras; no son directamente comparables entre si.
- No se documentan sesgos especificos, pero Fashion-MNIST es un dataset de prendas de vestir con una distribucion acotada y no representa condiciones reales de captura.
- Riesgo de alucinacion no aplica (no es un modelo generativo); el riesgo relevante es la clasificacion erronea fuera de distribucion.
- La licencia apache-2.0 permite uso comercial del modelo, pero los datos de entrenamiento conservan su propia licencia (MIT para Fashion-MNIST), que debe respetarse.
- El flujo verificado depende de ECS-Studio 1.140.0 y del motor ECS-Compiler 0.6.0 con los ajustes por defecto; cambiar la configuracion puede invalidar la reproducibilidad del resultado.
- No hay informacion sobre idiomas porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/fashion_mnist_lenet
- ONNX del modelo: https://huggingface.co/emass-ai/fashion_mnist_lenet/resolve/main/fashion_mnist_lenet.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/fashion_mnist_lenet/resolve/main/fashion_mnist_lenet_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/fashion_mnist_lenet/resolve/main/fashion_mnist_lenet_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/fashion_mnist_lenet/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/fashion_mnist_lenet/resolve/main/LICENSE?download=true
- Dataset Fashion-MNIST (Zalando Research): https://github.com/zalandoresearch/fashion-mnist
- Paper de Fashion-MNIST: https://arxiv.org/abs/1708.07747
