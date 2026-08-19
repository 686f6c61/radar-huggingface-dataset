# evalstate/cifar10-selftrain-teacher

## Resumen

El modelo `evalstate/cifar10-selftrain-teacher` es un pequeño clasificador convolucional (MediumCNN, ~1,56 millones de parámetros) desarrollado por el autor evalstate como parte de una investigación sobre auto-entrenamiento y auto-destilación. Su propósito es servir como **profesor inicial (iteración t=0)** en una trayectoria de auto-destilación que reproduce el equilibrio entre eliminación de ruido y olvido descrito en el artículo *Why Self-Training Helps and Hurts* (arXiv:2602.14029) de Wu, Yang y Sun.

El modelo se entrena sobre un subconjunto de 5000 imágenes de CIFAR-10 con ruido simétrico en las etiquetas (fracción η=0,4). A partir de este profesor débil, los estudiantes (t≥1) se entrenan desde cero con pseudo-etiquetas duras generadas por el iterado anterior sobre subconjuntos disjuntos, generando una curva de error en forma de U (primero elimina ruido, luego olvida). Es un modelo exclusivamente de visión, sin capacidades de lenguaje ni generación de texto.

Su relevancia radica en que permite estudiar empíricamente los mecanismos del auto-entrenamiento y la auto-destilación, un área activa en la investigación de aprendizaje semi-supervisado y robustez ante ruido. No está pensado para uso productivo, sino como herramienta de análisis experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional pequeña (MediumCNN) |
| Parametros totales | ~1,56 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (no se especifica si safetensors o .pt; el repo indica `library_name: pytorch`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional compacta denominada MediumCNN, con aproximadamente 1,56 millones de parámetros. No se trata de una arquitectura ResNet-50 ni de un transformer, sino de una CNN clásica para clasificación de imágenes. El entrenamiento se realiza sobre un subconjunto de 5000 muestras del dataset CIFAR-10 (obtenido vía HuggingFace `uoft-cs/cifar10`), con ruido simétrico en las etiquetas (η=0,4), lo que introduce un error estocástico inicial.

El optimizador es SGD con tasa de aprendizaje 0,1, momentum 0,9, weight decay 5e-4 y Nesterov, con programación coseno y 50 épocas, batch de 256. Se aplican aumentos de datos: recorte aleatorio con padding de 4 píxeles y reflexión, volteo horizontal y normalización. La innovación técnica no reside en la arquitectura, sino en su papel como punto de partida en un esquema de auto-destilación iterativa: cada estudiante se entrena desde cero sobre pseudo-etiquetas duras generadas por el profesor anterior, sobre subconjuntos disjuntos. Esto permite observar la curva de error en forma de U (denoising seguido de forgetting) descrita en el paper.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Generación de pseudo-etiquetas duras para entrenar iteraciones posteriores en un esquema de auto-destilación.
- Estudio del efecto del ruido en etiquetas sobre el rendimiento del modelo y su evolución a lo largo de las iteraciones.
- No soporta tool calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje natural.

## Casos de uso

- **Investigación en auto-destilación**: el modelo actúa como profesor inicial en experimentos que replican el trade-off entre denoising y forgetting. Los investigadores pueden utilizarlo para reproducir los resultados del paper arXiv:2602.14029 y explorar variantes.
- **Análisis de robustez ante ruido**: al estar entrenado con un 40% de etiquetas corruptas, permite estudiar cómo el auto-entrenamiento corrige o amplifica el ruido en diferentes fases del proceso.
- **Comparación de arquitecturas de CNN pequeñas**: sirve como baseline para evaluar el impacto de la arquitectura en el rendimiento bajo auto-entrenamiento, frente a otras CNNs de tamaño similar.
- **Experimentos de aprendizaje semi-supervisado**: puede integrarse en pipelines donde se combinan datos etiquetados ruidosos con pseudo-etiquetas generadas por el propio modelo.
- **Educación y docencia**: es un ejemplo didáctico de cómo funciona el auto-entrenamiento y la auto-destilación en visión por computador, con un coste computacional mínimo.
- **Investigación sobre curvas de error en forma de U**: permite reproducir y analizar el fenómeno de "primero denoising, luego forgetting" en contextos de auto-entrenamiento iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, F1 ni otros indicadores sobre el conjunto de test de CIFAR-10. Se desconoce el rendimiento exacto del modelo en tareas de clasificación estándar.

## Requisitos de hardware

- **VRAM estimada**: inferior a 100 MB para inferencia en FP32 (modelo de ~1,56 millones de parámetros). En cuantización a 8 bits, podría reducirse aún más.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una CPU moderna puede ejecutar inferencia sin problemas.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer (GTX 1050, RTX 2060, etc.) y en hardware embebido.
- **Opciones de despliegue**: al ser un modelo PyTorch, puede ejecutarse directamente con PyTorch, o exportarse a ONNX para inferencia con TensorRT u otros motores. No es adecuado para vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no se dispone de mediciones oficiales, pero por su tamaño la inferencia sobre una imagen debería ser del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de clasificación CIFAR-10. El modelo es un artefacto de investigación específico para el estudio de auto-destilación, no un clasificador de propósito general. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| evalstate/cifar10-selftrain-teacher | ~1,56M | N/A (vision) | No publicado | Apache 2.0 |
| LeNet-5 (clasico) | ~60k | N/A | ~75% accuracy en CIFAR-10 (referencia historica) | Varias |
| ResNet-20 (baseline) | ~0,27M | N/A | ~92% accuracy en CIFAR-10 (con entrenamiento limpio) | Varias |

Nota: los datos de LeNet-5 y ResNet-20 son valores aproximados de la literatura general, no del modelo evaluado. No se dispone de comparativas directas publicadas.

## Limitaciones y advertencias

- **Modelo de investigacion**: no está diseñado para uso en producción; su único propósito es servir como iteración inicial en experimentos de auto-destilación.
- **Ruido en etiquetas**: el entrenamiento incluye un 40% de etiquetas corruptas de forma intencionada, lo que degrada su precisión absoluta. No debe utilizarse como clasificador fiable.
- **Dataset reducido**: solo 5000 muestras de entrenamiento, muy por debajo de los 50000 de CIFAR-10 completo, lo que limita su generalización.
- **Sin benchmarks publicados**: no hay métricas oficiales de precisión, por lo que no se puede evaluar su rendimiento real.
- **Arquitectura limitada**: MediumCNN es una red pequeña y sencilla; no alcanza el rendimiento de arquitecturas modernas como ResNet o EfficientNet.
- **Licencia Apache 2.0**: permite uso comercial, pero al ser un modelo de investigación con datos ruidosos, su utilidad comercial es nula.
- **Sin soporte de idiomas**: es un modelo de visión, no procesa texto ni lenguaje natural.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/evalstate/cifar10-selftrain-teacher)
- [Paper de referencia: *Why Self-Training Helps and Hurts* (arXiv:2602.14029)](https://arxiv.org/abs/2602.14029)
