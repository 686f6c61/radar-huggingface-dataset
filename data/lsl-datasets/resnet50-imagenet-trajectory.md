# LSL-datasets/resnet50-imagenet-trajectory

## Resumen

`LSL-datasets/resnet50-imagenet-trajectory` no es un modelo en el sentido convencional, sino un conjunto de 103 checkpoints que documentan la trayectoria completa de entrenamiento de una ResNet-50 sobre ImageNet-1k. Lo publica el usuario LSL-datasets y su valor reside en la posibilidad de estudiar la dinamica de entrenamiento (training dynamics) de una arquitectura clasica con un protocolo reproducible: desde el paso 0 (red sin entrenar) hasta el paso 112.590 (epoca 90), con metricas de validacion asociadas a cada checkpoint.

La arquitectura es la ResNet-50 estandar de torchvision (`zero_init_residual=True`), un transformer no: una CNN residual de 50 capas con aproximadamente 25,6 millones de parametros. El checkpoint final alcanza 76,7 % top-1 y 93,3 % top-5 sobre las 50.000 imagenes de validacion de ImageNet con un unico recorte central de 224 × 224.

Es relevante ahora para investigadores interesados en interpretabilidad de redes, estudio de fases de entrenamiento, tecnicas de merging de pesos, poda progresiva o destilacion basada en trayectorias, ya que permite analizar la evolucion de los pesos y del rendimiento sin tener que reproducir el entrenamiento completo. El repo ocupa 10,6 GB y cada checkpoint pesa aproximadamente 103 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual, torchvision, `zero_init_residual=True`) |
| Parametros totales | aproximadamente 25,6 millones (ResNet-50 estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 × 224 × 3) |
| Tipos de cuantizacion | no disponible (checkpoints en precision completa, entrenados en bfloat16 mixto) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other (sujeta a los terminos de acceso de ImageNet: uso no comercial, investigacion y educacion) |
| Formato de pesos | checkpoints PyTorch `.pt` (dict con `model`, `step`, `epoch`, `val_top1`, `val_top5`, `lr`, `recipe`) |
| Numero de checkpoints | 103 |
| Tamano del repo | 10,6 GB |
| Dataset de entrenamiento | ILSVRC/imagenet-1k (formato parquet) |
| Preprocesado | resize lado corto 256, recorte central 224, normalizacion mean (0.485, 0.456, 0.406), std (0.229, 0.224, 0.225) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 estandar de torchvision con inicializacion a cero de la ultima capa de cada bloque residual (`zero_init_residual=True`), entrenada desde inicializacion aleatoria con semilla 0. Se trata de una CNN con conexiones residuales, no de un transformer ni de un modelo hibrido; no incorpora mecanismos de atencion ni decodificacion especulativa.

El recetario sigue a Goyal et al. (2017), *Accurate, Large Minibatch SGD*, sustituyendo el decaimiento por pasos por un schedule coseno. Detalles concretos: optimizador SGD con momento 0,9 y weight decay 1e-4 sobre todos los parametros; batch total de 1.024 imagenes distribuido en 2 GPUs con DistributedDataParallel; learning rate pico de 0,4 (0,1 por cada 256 imagenes) con warmup lineal durante 5 epocas y decaimiento coseno hasta 0 en la epoca 90; aumento de datos con random-resized crops de 224 y volteos horizontales, sin label smoothing ni mixup; precision mixta bfloat16 con formato de memoria channels-last. Cada epoca equivale a 1.251 pasos de 1.024 imagenes.

Los checkpoints se guardan en el paso 0, en los pasos 16, 32, 64, 125, 250, 500, 750 y 1000, en las epocas 1,5, 2,5, 3,5 y 4,5, y al final de cada epoca de la 1 a la 90. El archivo `trajectory.csv` recoge `step, epoch, val_top1, val_top5` de cada checkpoint.

## Capacidades

- Clasificacion de imagenes en las 1.000 clases de ImageNet-1k.
- Extraccion de caracteristicas visuales mediante el state dict de ResNet-50 (utilizable como backbone congelado o fine-tuneado).
- Analisis de la evolucion temporal de los pesos a lo largo de 103 puntos de control.
- Estudio de curvas de aprendizaje y de la relacion entre paso, learning rate y precision de validacion.
- Base para experimentos de weight merging, interpolacion de checkpoints y poda progresiva.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues, de audio o de vision generativa. Es exclusivamente un clasificador discriminativo.

## Casos de uso

- Investigacion en dinamica de entrenamiento: cargar checkpoints intermedios y medir como evolucionan la norma de los pesos, la nitidez del paisaje de perdida o la representacion interna a lo largo de las 90 epocas, sin replicar el coste de entrenamiento.
- Interpolacion y merging de pesos: usar pares de checkpoints cercanos (por ejemplo, epocas 80 y 90) para estudiar linear mode connectivity y tecnicas de model soups sobre una trayectoria real y documentada.
- Poda y compresion progresiva: evaluar en que epoca la red alcanza un rendimiento suficiente para justificar la poda, comparando `val_top1` entre checkpoints tempranos y finales con el `trajectory.csv`.
- Destilacion con profesor intermedio: emplear checkpoints de epocas tempranas como profesores mas suaves o con menor sobreajuste en pipelines de knowledge distillation.
- Benchmark de infraestructura de inferencia: usar los 103 checkpoints como carga de trabajo reproducible para medir throughput y latencia de frameworks (TorchScript, ONNX Runtime, TensorRT) sobre una arquitectura conocida.
- Docencia y formacion: ilustrar con datos reales el efecto del warmup, el schedule coseno y el batch grande en la curva de validacion, cargando checkpoints concretos en un cuaderno.
- Analisis de estabilidad numerica en bfloat16: comparar la precision de validacion de checkpoints entrenados en precision mixta frente a evaluaciones en fp32.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top-1 en validacion ImageNet (checkpoint final, paso 112590, epoca 90) | 76,7 % (0,76658) |
| Top-5 en validacion ImageNet (checkpoint final) | 93,3 % |
| Imagenes de validacion | 50.000 |
| Metodo de evaluacion | un unico recorte central de 224 × 224 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni curvas intermedias mas alla del CSV de trayectoria.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 100-200 MB en fp32 para el modelo (25,6 M de parametros), mas el espacio de activaciones segun el tamano de batch; con batch de 1 cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; para entrenamiento o fine-tuning, A100, H100 o RTX 4090. El entrenamiento original uso 2 GPUs con DistributedDataParallel y batch total de 1.024.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores, para inferencia y fine-tuning con batches moderados.
- Opciones de despliegue: PyTorch nativo, TorchScript, ONNX Runtime, TensorRT, y frameworks de serving como TorchServe o Triton Inference Server.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: 10,6 GB para el repositorio completo; cada checkpoint individual ocupa aproximadamente 103 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LSL-datasets/resnet50-imagenet-trajectory | aproximadamente 25,6 M | 224 × 224 × 3 | 76,7 % | other (terminos ImageNet, no comercial) | Hugging Face, 103 checkpoints |
| torchvision ResNet-50 (pesos oficiales) | aproximadamente 25,6 M | 224 × 224 × 3 | no disponible en esta ficha | BSD-3-Clause (torchvision) | torchvision |
| ResNet-50 de timm | aproximadamente 25,6 M | 224 × 224 × 3 | no disponible en esta ficha | Apache-2.0 (timm) | timm / Hugging Face |

La diferencia principal frente a las alternativas no es el rendimiento, sino la disponibilidad de la trayectoria completa de entrenamiento con metricas por checkpoint, algo que los pesos oficiales de torchvision o timm no ofrecen. La licencia, sin embargo, es mas restrictiva que la de esas alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos se entrenaron sobre ImageNet-1k y su uso queda sujeto a los terminos de acceso de ImageNet (uso no comercial, investigacion y educacion). No es apta para produccion comercial sin autorizacion adicional.
- Clasificador cerrado: solo predice entre las 1.000 clases de ImageNet; no generaliza a categorias fuera de ese vocabulario.
- Sesgos del dataset: hereda los sesgos de ImageNet en cuanto a representacion geografica, cultural y de clases; puede degradarse en dominios visuales alejados del dataset.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Sensibilidad al preprocesado: el rendimiento reportado asume el pipeline exacto (resize a 256, recorte central 224, normalizacion concreta); variaciones en el preprocesado alteran las metricas.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX ni int8 en el repositorio; habria que generarlas.
- Orientado a investigacion: es un artefacto de estudio de trayectorias, no un modelo listo para despliegue en producto.
- Idiomas: no aplica, pero conviene senalar que no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/LSL-datasets/resnet50-imagenet-trajectory
- Dataset de entrenamiento: https://huggingface.co/datasets/ILSVRC/imagenet-1k
- Terminos de acceso de ImageNet: https://image-net.org/download.php
- Paper de referencia del recetario (Goyal et al., 2017): https://arxiv.org/abs/1706.02677
- Repositorio torchvision (arquitectura ResNet-50): https://github.com/pytorch/vision
