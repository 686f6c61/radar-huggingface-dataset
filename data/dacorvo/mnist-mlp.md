# dacorvo/mnist-mlp

## Resumen

dacorvo/mnist-mlp es un perceptrón multicapa (MLP) extremadamente simple, entrenado sobre el conjunto de datos MNIST para la clasificación de dígitos manuscritos del 0 al 9. Fue publicado por el usuario dacorvo en octubre de 2023 con el propósito explícito de servir como modelo de referencia para pruebas de cuantización. Con apenas 269.322 parámetros, su tamaño es mínimo en comparación con los modelos de lenguaje o visión modernos, lo que lo convierte en un candidato ideal para validar flujos de trabajo de cuantización, pruebas de compatibilidad con librerías de inferencia o experimentos educativos.

El modelo utiliza la arquitectura clásica de un MLP de dos capas totalmente conectadas, sin mecanismos de atención ni capas convolucionales. Está disponible en formato safetensors y también como `pytorch_model.bin`, y se integra con la librería `transformers` mediante un pipeline de clasificación de imágenes. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Aunque su rendimiento en tareas reales es irrelevante frente a modelos actuales, su simplicidad lo hace útil para depurar infraestructura técnica, especialmente en el ámbito de la cuantización de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) de 2 capas totalmente conectadas |
| Parametros totales | 269.322 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no especificado en la informacion disponible; el modelo se ofrece como referencia para pruebas de cuantizacion |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes, sin soporte de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, pytorch_model.bin (pickle) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa simple, compuesto por dos capas totalmente conectadas con activaciones no lineales (el codigo fuente `modeling_mlp.py` esta disponible en el repositorio, pero no se detallan las funciones de activacion ni el numero de neuronas por capa en la informacion proporcionada). El modelo fue entrenado en el dataset MNIST, que contiene 60.000 imagenes de entrenamiento y 10.000 de test de digitos manuscritos de 28x28 pixeles en escala de grises. El preprocesado requerido consiste en convertir la imagen a tensor, normalizar con media 0.1307 y desviacion estandar 0.3081, y aplanar el vector resultante a una dimension de 784.

No se dispone de informacion sobre el numero de epocas, el optimizador, la funcion de perdida ni el proceso de entrenamiento. Dado el tamano del modelo y su proposito declarado, es probable que se haya entrenado con una configuracion estandar para MNIST (por ejemplo, cross-entropy y SGD o Adam), pero estos datos no estan publicados en la model card ni en la documentacion del repositorio.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos (0-9) del dataset MNIST.
- Inferencia de baja latencia y consumo minimo de recursos, apta para entornos embebidos o pruebas automatizadas.
- Compatible con el pipeline `image-classification` de `transformers`, lo que permite su uso directo con `pipeline("image-classification", model="dacorvo/mnist-mlp")`.
- Proposito principal: servir como modelo de referencia para validar herramientas de cuantizacion (por ejemplo, comparar errores de redondeo, calibracion de dinamicas de activacion, etc.).
- No soporta generacion de texto, tool calling, agentes, vision general (solo MNIST) ni capacidades multilingues.

## Casos de uso

- Pruebas de cuantizacion: el modelo es ideal para verificar el comportamiento de librerias como `torch.quantization`, `onnxruntime` o `llama.cpp` (aunque no sea un modelo de lenguaje) al aplicar cuantizacion post-entrenamiento o cuantizacion consciente del entrenamiento. Su tamano permite iterar rapidamente.
- Validacion de pipelines de despliegue: se puede usar para probar la integracion de un modelo de vision en un servidor de inferencia (por ejemplo, TorchServe, Triton) sin incurrir en costes de computo significativos.
- Educacion y experimentacion: en cursos de deep learning o de ingenieria de ML, sirve como ejemplo minimo para ensenar el ciclo completo de entrenamiento, guardado, carga e inferencia con `transformers`.
- Depuracion de infraestructura: al ser un modelo deterministico y pequeno, es util para diagnosticar problemas de compatibilidad entre versiones de PyTorch, `transformers` o formatos de serializacion.
- Benchmarking de hardware: se puede emplear para medir la latencia y el throughput de diferentes GPUs o CPUs en tareas de clasificacion de imagenes, aunque su tamano hace que las diferencias sean poco representativas para modelos grandes.
- Pruebas de integracion continua: dado su bajo coste, puede integrarse en pipelines de CI/CD para verificar que el sistema de registro de modelos, el versionado y la carga de artefactos funcionan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se reportan metricas de exactitud, precision ni recall sobre el conjunto de test de MNIST. Dado que es un modelo de referencia para cuantizacion, es probable que su exactitud sea inferior a la de redes convolucionales modernas (que superan el 99%), pero no se dispone de datos concretos.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB en FP32 (269.322 parametros * 4 bytes ≈ 1,08 MB). Cualquier GPU o CPU moderna puede ejecutarlo sin problemas.
- GPUs recomendadas: ninguna en particular; funciona en CPU, GPU integrada o cualquier GPU discreta (RTX 2060 en adelante, aunque no es necesario).
- Compatibilidad con consumer GPU: total, incluso en Raspberry Pi o dispositivos moviles si se convierte a un formato ligero.
- Opciones de despliegue: se puede servir con `transformers` directamente, exportar a ONNX o TorchScript, o cuantizar a int8 para reducir aun mas el tamano. No es compatible con vLLM ni TGI (pensados para modelos de lenguaje).
- Latencia: del orden de microsegundos por inferencia en CPU moderna; en GPU, la latencia estara dominada por el overhead de lanzamiento del kernel, no por el computo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos dentro del mismo repositorio o con la misma finalidad (modelos MLP de referencia para cuantizacion). Existen otros modelos de clasificacion de MNIST (por ejemplo, redes convolucionales como LeNet-5), pero no se han encontrado datos de parametros, contexto o rendimiento en la informacion proporcionada para establecer una comparativa rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo solo es capaz de clasificar digitos manuscritos del dataset MNIST; no generaliza a otros tipos de imagenes ni a otros formatos de entrada.
- No se han publicado metricas de exactitud, por lo que no se puede garantizar un rendimiento minimo en produccion.
- La arquitectura MLP no aprovecha la estructura espacial de las imagenes, por lo que su rendimiento sera inferior al de una CNN equivalente.
- No se dispone de informacion sobre posibles sesgos, pero al estar entrenado exclusivamente con MNIST, su comportamiento fuera de ese dominio es impredecible.
- El preprocesado debe ser exactamente el indicado en la model card (normalizacion con media 0.1307 y desviacion 0.3081, y aplanado), de lo contrario los resultados seran incorrectos.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero no se incluyen garantias de ningun tipo.
- El modelo esta pensado como referencia tecnica, no como solucion de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dacorvo/mnist-mlp
- Repositorio de codigo del modelo (archivo `modeling_mlp.py`): https://huggingface.co/dacorvo/mnist-mlp/tree/main
- No se han encontrado otros enlaces oficiales (papers, blogs o demos) en la busqueda web realizada.
