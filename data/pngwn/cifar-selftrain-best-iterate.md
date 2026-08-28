# pngwn/cifar-selftrain-best-iterate

## Resumen

El modelo `pngwn/cifar-selftrain-best-iterate` es un clasificador de imágenes ResNet-18 entrenado sobre CIFAR-10 mediante un proceso de autoentrenamiento iterativo (self-training) con pseudoetiquetas. Desarrollado por pngwn, reproduce el análogo de deep learning del artículo *Why Self-Training Helps and Hurts* (arXiv:2602.14029, Apéndice A). El modelo corresponde al iterado t=4 de una trayectoria de K=8, y representa el punto de mínimo riesgo de la misma: la fase de denoising domina hasta esta iteración, logrando una precisión del 46,76% en el conjunto de test limpio de CIFAR-10, lo que supone una mejora de +4,3 puntos sobre el profesor inicial.

La relevancia de este modelo es principalmente investigadora: sirve para estudiar cómo el autoentrenamiento con pseudoetiquetas puede corregir ruido en las etiquetas, y cómo el proceso de denoising y olvido (forgetting) afecta al rendimiento final. Está entrenado desde cero con una arquitectura ResNet-18 adaptada a CIFAR (sin maxpool, con stem de convolución 3x3), sobre 5000 imágenes disjuntas por iteración, y con etiquetas del profesor contaminadas con un 40% de ruido simétrico. El repositorio incluye los pesos en formato PyTorch y el código de carga necesario para reproducir la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con stem CIFAR (conv 3x3, sin maxpool) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo utiliza una ResNet-18 estándar modificada para CIFAR-10: la primera capa convolucional es de 3x3 con stride 1 y sin capa de maxpool, y la capa final es una lineal de 512 a 10 clases. Se entrena desde cero con SGD (lr 0.05, momentum 0.9, weight decay 5e-4), con warmup de 5 épocas y programación coseno, batch de 128 y 60 épocas. Se aplica aumento de datos con recorte aleatorio (pad 4) y volteo horizontal.

El proceso de autoentrenamiento es el siguiente: el profesor (t=0) se entrena con etiquetas de CIFAR-10 contaminadas con un 40% de ruido simétrico. Cada iteración posterior (t=1 a t=8) entrena un nuevo modelo desde cero sobre un subconjunto disjunto de 5000 imágenes, usando como etiquetas las pseudoetiquetas duras generadas por el modelo de la iteración anterior. Este modelo concreto es el iterado t=4, que recibe pseudoetiquetas del iterado t=3. La trayectoria completa, configuraciones y métricas están disponibles en el dataset asociado.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre imagenes de 32x32 píxeles en RGB, normalizadas con media (0.4914, 0.4822, 0.4465) y desviacion (0.2470, 0.2435, 0.2616).
- Uso como modelo de referencia para estudiar el efecto del autoentrenamiento con pseudoetiquetas y el ruido en las etiquetas.
- Capacidad de reproduccion del experimento descrito en el articulo arXiv:2602.14029, gracias a la publicacion de los pesos y la configuracion de entrenamiento.
- No dispone de capacidades de generacion de texto, tool calling, agentes ni multimodalidad; es exclusivamente un clasificador de imagenes.

## Casos de uso

- Investigacion academica sobre aprendizaje semi-supervisado: el modelo permite analizar como el autoentrenamiento con pseudoetiquetas puede mitigar el ruido en las etiquetas, comparando la evolucion de la precision a lo largo de las iteraciones.
- Estudio del fenomeno de denoising y olvido (denoising-forgetting): al ser el punto de minimo riesgo de la trayectoria, sirve para identificar en que momento el proceso deja de mejorar y empieza a degradarse.
- Reproduccion de experimentos: los pesos publicados permiten replicar los resultados del articulo y verificar la metodologia en otros entornos.
- Benchmark de clasificacion basica en CIFAR-10: aunque su precision es baja (46,76%), puede usarse como linea base en comparaciones de metodos de autoentrenamiento.
- Prueba de pipelines de inferencia en PyTorch: al ser un modelo pequeno y ligero, es util para validar flujos de carga de modelos, normalizacion y evaluacion en entornos de desarrollo.
- Educacion en deep learning: sirve como ejemplo practico de entrenamiento con pseudoetiquetas y de como el ruido en los datos afecta al rendimiento final.

## Benchmarks y rendimiento

El unico dato de rendimiento disponible es la precision en el conjunto de test limpio de CIFAR-10: **46,76%** (iteracion t=4). No se han publicado resultados comparativos con otros modelos en la informacion proporcionada. Se indica que esta cifra supone una mejora de +4,3 puntos sobre el profesor inicial (t=0), pero no se especifica la precision del profesor ni de otros iterados.

## Requisitos de hardware

- Al ser un ResNet-18 con entrada de 32x32, el modelo es muy ligero: ocupa aproximadamente 45 MB en pesos (estimacion basada en la arquitectura, no confirmada en la documentacion).
- Inferencia en CPU: viable, con latencias del orden de milisegundos por imagen.
- Inferencia en GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GPU integrada puede ejecutarlo.
- Despliegue: al ser un archivo .pt de PyTorch, puede cargarse directamente con torch.load. No se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia, ya que no es un modelo de lenguaje.
- Para entrenamiento o fine-tuning, se requiere una GPU con al menos 4 GB de VRAM (por ejemplo, una RTX 2060 o superior), aunque el entrenamiento completo se realizo con un batch de 128, lo que sugiere una GPU con al menos 8 GB.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos comparables en la informacion proporcionada. Existe un modelo similar, `evalstate/cifar10-selftrain-best-iterate`, que corresponde al iterado t=5 de una trayectoria equivalente y con licencia Apache-2.0, pero no se especifican sus metricas. Un ResNet-18 estandar entrenado con etiquetas limpias en CIFAR-10 suele alcanzar una precision superior al 90%, pero ese dato no forma parte de la informacion suministrada y no debe inferirse como comparacion directa.

## Limitaciones y advertencias

- Precision limitada: 46,76% en test limpio, muy por debajo de un clasificador convencional entrenado con etiquetas correctas. No es adecuado para aplicaciones de produccion que requieran alta exactitud.
- Entrenado con etiquetas ruidosas (40% de ruido simetrico en el profesor), lo que introduce sesgos inherentes en las pseudoetiquetas.
- El modelo es un punto intermedio de una trayectoria de autoentrenamiento; su comportamiento puede no ser representativo de un modelo final optimizado.
- No soporta otros conjuntos de datos ni tareas fuera de CIFAR-10; la arquitectura esta fijada para 10 clases y entradas de 32x32.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantias de rendimiento ni de idoneidad para fines especificos.
- No se proporcionan pesos en formatos como safetensors o GGUF; solo el archivo `model.pt` de PyTorch, lo que limita su uso en entornos que requieran otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pngwn/cifar-selftrain-best-iterate
- Dataset con la trayectoria completa, configuraciones y metricas: https://huggingface.co/datasets/pngwn/self-training-denoising-forgetting
- Articulo de referencia (arXiv:2602.14029): no se proporciona enlace directo, pero el identificador aparece en la documentacion.
- Modelo similar de otro autor: https://huggingface.co/evalstate/cifar10-selftrain-best-iterate
