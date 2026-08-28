# pngwn/cifar-selftrain-teacher-t0

## Resumen

Este modelo es un clasificador de imágenes basado en una ResNet-18 adaptada para CIFAR-10, entrenada desde cero con un 40% de ruido simétrico en las etiquetas. Forma parte de la iteración t=0 de una trayectoria de self-training con K=8 iteraciones, diseñada para reproducir el estudio *Why Self-Training Helps and Hurts* (arXiv:2602.14029, Apéndice A). El autor, pngwn, lo publica como punto de partida de un proceso iterativo en el que los estudiantes se entrenan con pseudo-etiquetas generadas por el profesor anterior.

La relevancia de este modelo es principalmente investigadora: permite analizar cómo el self-training puede corregir etiquetas ruidosas y cómo se produce el fenómeno de "denoising" y "olvido" a lo largo de las iteraciones. Su precisión en el test limpio de CIFAR-10 es del 42,44%, un valor bajo que refleja el efecto del ruido introducido. No está pensado para uso en producción, sino como herramienta de estudio y reproducción de experimentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con CIFAR stem (convolución 3x3, sin maxpool) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivo .pt) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 modificada para imágenes de 32x32 píxeles: la primera capa convolucional usa un kernel de 3x3 sin maxpool, y la capa fully connected final tiene 10 salidas. El entrenamiento se realizó desde cero con SGD (lr 0.05, momentum 0.9, weight decay 5e-4), un warmup de 5 épocas seguido de un decaimiento coseno, batch de 128 y 60 épocas en total. Se aplicaron aumentos de datos (random crop con padding 4 y volteo horizontal). Las etiquetas del profesor en t=0 contienen un 40% de ruido simétrico, y los estudiantes posteriores usan pseudo-etiquetas duras generadas por el iterado anterior. El entrenamiento se ejecutó con torch 2.13.0+cu130 y semilla 100.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia con imágenes normalizadas según media y desviación estándar específicas de CIFAR-10.
- Uso como punto de partida para experimentos de self-training y pseudo-etiquetado.
- No incluye capacidades de generación de texto, razonamiento multimodal ni tool calling.

## Casos de uso

- Reproducción de experimentos de self-training: el modelo sirve como profesor inicial en una trayectoria de 8 iteraciones, permitiendo verificar los resultados del paper original.
- Estudio del efecto del ruido en etiquetas: al comparar la precisión de este modelo (42,44%) con la de iteraciones posteriores, se puede medir cómo el self-training mitiga el ruido.
- Análisis de la dinámica de denoising y olvido: los investigadores pueden examinar qué clases o ejemplos se ven más afectados por el ruido y cómo evoluciona el rendimiento.
- Evaluación de estrategias de pseudo-etiquetado: este modelo genera las pseudo-etiquetas que se usan para entrenar al siguiente iterado, por lo que es útil para probar variantes en la generación de etiquetas.
- Investigación en aprendizaje semi-supervisado: sirve como caso de estudio para entender los límites de los métodos basados en pseudo-etiquetas con datos ruidosos.
- Comparación con otros modelos de referencia en CIFAR-10 bajo condiciones de ruido: permite establecer una línea base para experimentos de robustez.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión en test limpio de CIFAR-10 | 42,44% |

No se han publicado resultados de benchmarks adicionales en la información disponible. Este valor corresponde a la iteración t=0 y refleja el impacto del 40% de ruido simétrico en las etiquetas de entrenamiento.

## Requisitos de hardware

- Al ser una ResNet-18, el modelo es ligero y puede ejecutarse en CPU o GPU con poca memoria (típicamente menos de 1 GB de VRAM, aunque no se especifica un valor exacto).
- No se proporcionan datos concretos de VRAM, latencia o throughput en la documentación.
- El despliegue se realiza mediante PyTorch estándar, cargando el archivo `model.pt` con `torch.load`.
- Es compatible con cualquier entorno que tenga instalado PyTorch (CPU o CUDA).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros modelos de self-training en CIFAR-10 con las mismas condiciones de ruido.

## Limitaciones y advertencias

- Precisión baja (42,44%) debido al ruido intencional en las etiquetas; no es adecuado para tareas de clasificación en producción.
- Modelo de investigación: su único propósito es servir como iteración inicial en un experimento de self-training.
- Limitado al dataset CIFAR-10; no soporta otros conjuntos de datos ni tareas de visión más amplias.
- No se documentan sesgos específicos, pero al estar entrenado con etiquetas ruidosas, puede presentar errores sistemáticos en ciertas clases.
- La licencia MIT permite uso comercial, pero el modelo no tiene utilidad práctica más allá del ámbito académico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pngwn/cifar-selftrain-teacher-t0)
- [Dataset de resultados y configuración completa](https://huggingface.co/datasets/pngwn/self-training-denoising-forgetting)
- [Paper arXiv:2602.14029](https://arxiv.org/abs/2602.14029) (referencia, no se ha verificado el enlace directo)
