# pngwn/cifar-selftrain-final-iterate

## Resumen

El modelo `pngwn/cifar-selftrain-final-iterate` es un checkpoint de un ResNet-18 entrenado sobre CIFAR-10 mediante un proceso de self-training iterativo. Representa la iteración final (t=8) de una trayectoria de 8 pasos que reproduce el análogo en deep learning del estudio *Why Self-Training Helps and Hurts* (arXiv:2602.14029, Apéndice A). El objetivo del trabajo es analizar cómo el self-training puede degradar el rendimiento cuando se aplica en exceso, un fenómeno conocido como "olvido" o "forgetting".

El modelo fue desarrollado por el usuario pngwn y se distribuye bajo licencia MIT. Su precisión en el conjunto de test limpio de CIFAR-10 es del 44,70%, notablemente inferior a la de un ResNet-18 entrenado convencionalmente (que suele superar el 90%). Esta baja precisión es intencionada: el checkpoint documenta el punto final de una degradación progresiva que comienza tras la iteración óptima (t=4, con 46,76% de precisión) y empeora hasta t=8. El modelo es una herramienta de investigación para estudiar los límites del self-training, no un clasificador listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con CIFAR stem (conv 3x3, sin maxpool), capa fully connected de 10 clases |
| Parametros totales | no disponible (arquitectura ResNet-18 estándar, ~11M, no confirmado en la ficha) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (model.pt) |

## Arquitectura y entrenamiento

El modelo es un ResNet-18 adaptado para CIFAR-10: la primera capa convolucional usa un kernel 3x3 sin maxpool (CIFAR stem) y la capa final se sustituye por una fully connected de 10 salidas. Se entrena desde cero con SGD (lr 0.05, momentum 0.9, weight decay 5e-4), 5 épocas de warmup, programación de tasa de aprendizaje coseno, batch de 128 y 60 épocas por iteración. La augmentación incluye random crop (pad 4) y volteo horizontal.

El proceso de self-training sigue un esquema iterativo: en la iteración t=0, el profesor se entrena con etiquetas que contienen un 40% de ruido simétrico. En cada iteración posterior, el estudiante se entrena con pseudo-etiquetas duras generadas por el modelo de la iteración anterior, utilizando 5000 imágenes de entrenamiento disjuntas y frescas por iteración. La trayectoria completa (8 iteraciones) muestra que la precisión mejora hasta t=4 (46,76%) y luego decae hasta t=8 (44,70%), evidenciando el fenómeno de olvido por autoentrenamiento excesivo. El entrenamiento se realizó con torch 2.13.0+cu130 y semilla 108.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre imagenes de 32x32 píxeles en RGB, normalizadas con media (0.4914, 0.4822, 0.4465) y desviacion (0.2470, 0.2435, 0.2616).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo de pensamiento ni capacidades multimodales adicionales.
- Su utilidad principal es como objeto de estudio para analizar la dinamica del self-training y la degradacion por sobre-entrenamiento.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint permite replicar los resultados del estudio *Why Self-Training Helps and Hurts* y verificar la caida de precision de 46,76% (t=4) a 44,70% (t=8).
- Analisis del fenomeno de olvido en self-training: los investigadores pueden cargar el modelo y estudiar como las pseudo-etiquetas erroneas se amplifican a lo largo de las iteraciones.
- Evaluacion de metodos de regularizacion: sirve como punto de partida para probar tecnicas que mitiguen la degradacion (por ejemplo, poda de pseudo-etiquetas, confianza umbral, etc.).
- Comparacion de trayectorias de entrenamiento: junto con los checkpoints de otras iteraciones (t=0 a t=7), permite visualizar la evolucion de la representacion interna y la perdida de informacion.
- Estudio de robustez ante ruido en etiquetas: el modelo final contiene una representacion contaminada por ruido, util para investigar como el ruido se propaga en arquitecturas convolucionales.
- Benchmark de metodos de destilacion: al ser un modelo degradado, puede emplearse como caso limite para probar algoritmos de destilacion o transferencia que intenten recuperar conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato reportado es la precision en el test limpio de CIFAR-10:

| Iteracion | Precision test |
|---|---|
| t=4 (optimo) | 46,76% |
| t=8 (final) | 44,70% |

No se proporcionan comparaciones con otros modelos ni metricas adicionales (loss, F1, etc.).

## Requisitos de hardware

- El modelo es extremadamente ligero: un ResNet-18 con entrada 32x32 ocupa aproximadamente 45 MB en pesos (float32).
- Puede ejecutarse en CPU sin problemas; la inferencia sobre una sola imagen tarda milisegundos.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050, RTX 2060, etc.).
- No se requieren GPUs de alta gama como A100 o H100.
- Opciones de despliegue: al ser un archivo `.pt` de PyTorch, se puede cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch instalado. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- El consumo de memoria en inferencia es inferior a 200 MB, incluyendo el modelo y los tensores de entrada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. Un ResNet-18 entrenado convencionalmente sobre CIFAR-10 alcanza precisiones superiores al 90%, pero este checkpoint esta deliberadamente degradado para fines de investigacion, por lo que no es comparable con modelos de produccion.

## Limitaciones y advertencias

- Precision muy baja (44,70%): no es apto para tareas de clasificacion reales; su unico proposito es el estudio academico.
- El modelo ha sido entrenado con etiquetas ruidosas y pseudo-etiquetas, por lo que sus representaciones internas estan contaminadas y pueden inducir a errores si se usan fuera del contexto de investigacion.
- No se proporcionan datos sobre sesgos, pero al estar entrenado en CIFAR-10, hereda los sesgos de ese dataset (por ejemplo, clases desbalanceadas o artefactos de la recopilacion).
- Riesgo de alucinacion no aplica (no es un modelo generativo de texto).
- La licencia MIT permite uso comercial, pero el modelo no tiene valor practico para produccion debido a su baja precision.
- No se especifican limitaciones de contexto ni de idioma, al ser un modelo de vision.
- El checkpoint es un archivo `.pt` que requiere PyTorch; no se proporcionan versiones en otros formatos (ONNX, TensorFlow, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pngwn/cifar-selftrain-final-iterate
- Dataset con la trayectoria completa, configuraciones y metricas: https://huggingface.co/datasets/pngwn/self-training-denoising-forgetting
- Paper de referencia (arXiv:2602.14029): https://arxiv.org/abs/2602.14029 (no verificado en la busqueda, pero citado en la model card)
