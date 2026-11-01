# Oluwaseunhannah21/mnist-cnn-pytorch

## Resumen

`Oluwaseunhannah21/mnist-cnn-pytorch` es una red neuronal convolucional (CNN) pequena entrenada en PyTorch para clasificar digitos manuscritos del conjunto de datos MNIST (clases 0-9). Lo publica el usuario Oluwaseunhannah21 como proyecto de aprendizaje, segun declara el propio autor en la model card, y no como un modelo de proposito general ni como un componente listo para produccion.

Tecnicamente es un clasificador de imagenes de una sola modalidad: recibe tensores de 1x28x28 en escala de grises y devuelve una distribucion sobre 10 clases. No es un modelo de lenguaje, no tiene parametros en el sentido de los LLM (no hay miles de millones de pesos ni ventana de contexto) y no soporta generacion de texto, tool calling ni razonamiento multi-paso. Su interes es acotado: sirve como referencia minima de pipeline de vision por computador en PyTorch y como ejemplo de integracion con HuggingFace Hub.

El dato mas relevante es su precision declarada del 99,27 % en el conjunto de test de MNIST, obtenida en 5 epocas con Adam y batch de 64. El repositorio tiene un tamano de 0,0 GB (pesos muy ligeros), licencia MIT y cero descargas en el momento de la consulta, lo que refleja que es un artefacto de aprendizaje mas que un modelo adoptado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible (no se publica el recuento; por la arquitectura, del orden de cientos de miles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en `float32` por defecto en PyTorch; no se documentan variantes) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (state_dict de PyTorch, fichero `mnist_cnn.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN convolucional clasica de dos bloques. Cada bloque aplica una convolucion 2D seguida de ReLU y max pooling; tras el aplanado, una capa totalmente conectada de 3136 a 128 neuronas con ReLU y dropout de 0,3 actua como cabeza de representacion, y una capa final de 128 a 10 produce los logits de clase. La entrada se normaliza con media 0,1307 y desviacion tipica 0,3081, valores estandar del dataset MNIST.

El entrenamiento usa el optimizador Adam con tasa de aprendizaje 0,001 y perdida CrossEntropyLoss durante 5 epocas con tamano de lote 64. No se documenta el numero exacto de parametros, el numero de tokens (no aplica), la composicion del dataset mas alla de MNIST, ni si hubo tecnicas de regularizacion adicionales aparte del dropout. Tampoco se mencionan innovaciones como atencion lineal, decodificacion especulativa o destilacion; es un entrenamiento supervisado convencional sobre las 60.000 imagenes de entrenamiento de MNIST y evaluado sobre las 10.000 de test.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos en 10 clases (0-9) a partir de entradas 1x28x28 en escala de grises.
- Inferencia en CPU y GPU mediante PyTorch (`model.eval()` y `torch.load`).
- Integracion con HuggingFace Hub para descarga de pesos con `hf_hub_download`.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No incluye modo thinking, vision general, audio ni modalidades adicionales.

## Casos de uso

- Prototipado docente de vision por computador: sirve como primer ejemplo completo de entrenamiento y evaluacion de una CNN en PyTorch, con un pipeline reproducible de 5 epocas y precision cercana al 99 % en MNIST.
- Prueba de integracion con HuggingFace Hub: util para validar flujos de descarga de pesos (`hf_hub_download`) y carga de `state_dict` en entornos de CI antes de migrar a modelos mayores.
- Baseline en experimentos de clasificacion de digitos: punto de comparacion rapido frente a modelos mas complejos sobre MNIST, dado su bajo coste computacional.
- Demostraciones de preprocesado de imagen: permite ilustrar normalizacion con media y desviacion concretas y conversion a tensor 1x28x28.
- Educacion en regularizacion: el dropout de 0,3 y el max pooling sirven para explicar tecnicas basicas de generalizacion en redes convolucionales.
- Benchmark de infraestructura de inferencia: por su tamano minimo, es adecuado para medir latencia de carga de modelo y throughput en CPU/GPU sin ruido de modelos grandes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo comparable | Nota |
|---|---|---|---|
| MNIST test accuracy | 99,27 % | no disponible | Dato declarado por el autor en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB en `float32`; no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo cabe en CPU sin problema.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos cientos de MB libres, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `model.eval()`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MNIST accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oluwaseunhannah21/mnist-cnn-pytorch | no disponible | no aplica | 99,27 % | MIT | HuggingFace Hub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la busqueda realizada; no se inventan cifras.

## Limitaciones y advertencias

- Solo clasifica digitos manuscritos de MNIST; no generaliza a otros dominios visuales sin reentrenamiento.
- Requiere entrada exacta 1x28x28 en escala grises, digito blanco sobre fondo negro y normalizacion con media 0,1307 y desviacion 0,3081; desviarse de este formato degrada la precision.
- Riesgo de sobreajuste al estilo de MNIST (digitos centrados y limpios); el rendimiento en fotos reales o digitos rotados no esta documentado.
- No hay informacion sobre sesgos, robustez adversarial ni evaluacion fuera de distribucion.
- Licencia MIT permite uso comercial, pero el autor la presenta como proyecto de aprendizaje; no hay garantias de soporte ni mantenimiento.
- Repositorio con 0 descargas y 0 likes en la consulta; sin evidencia de uso en produccion por terceros.
- No se documenta versionado de pesos, ni ficha de datos, ni evaluacion de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oluwaseunhannah21/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- Documentacion de PyTorch: https://pytorch.org/docs/stable/index.html
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
