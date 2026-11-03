# akshat0285/smai-a4-cifar10-mlp

## Resumen

El modelo `smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) entrenado por el usuario akshat0285 para la asignatura SMAI (Assignment 4), orientado a la clasificación de imágenes del conjunto de datos CIFAR-10. No se trata de un modelo de lenguaje ni de un transformer: es una red neuronal totalmente conectada de cuatro capas con activación ReLU en las capas ocultas y una salida de 10 logits (sin activación) correspondientes a las diez clases de CIFAR-10. Su relevancia es puramente académica y didáctica, ya que sirve como ejemplo mínimo de entrenamiento desde cero con SGD plano.

La arquitectura es un MLP con tamaños de capa [3072, 128, 64, 10], donde la entrada son imágenes de 32x32x3 aplanadas a 3072 dimensiones. El entrenamiento se realizó en float64 con SGD plano (sin momentum ni Adam), learning rate 0.05, tamaño de lote 64 y 100 épocas, usando las etiquetas verdaderas del conjunto de entrenamiento. La precisión de test reportada es de 0.4669 (46,69 %).

El repositorio tiene un tamaño de 0,0 GB y no incluye pipeline, licencia ni idiomas declarados. Los pesos se almacenan presumiblemente en formato NumPy (`.npz`), dado que la model card menciona `preprocessing.npz` y la carga mediante `nn_lib.Model.load_from`. No hay información sobre cuantización, contexto ni despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado |
| Parametros totales | No disponible (calculable: ~402.000 aprox. según capas [3072,128,64,10]) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible (entrenado en float64) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Presumiblemente NumPy `.npz` (según `preprocessing.npz` y `nn_lib.Model.load_from`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de cuatro capas con dimensiones [3072, 128, 64, 10]. La capa de entrada recibe la imagen de 32x32x3 aplanada a un vector de 3072 dimensiones. Las dos capas ocultas (128 y 64 neuronas) usan activación ReLU, y la capa de salida produce 10 logits sin activación (adecuado para entropía cruzada con logits). Los pesos se organizan como `W{k}` con forma (n_in, n_out) y `b{k}` con forma (n_out,), de modo que `logits = h @ W + b`.

El entrenamiento se realizó en float64 con SGD plano, learning rate 0.05, tamaño de lote 64 y 100 épocas, usando las etiquetas verdaderas (sin augmentation ni técnicas avanzadas). El preprocesado consiste en aplanar la imagen, dividir por 255 y estandarizar restando la media y dividiendo por la desviación típica calculadas sobre las 50.000 imágenes del conjunto de entrenamiento (almacenadas en `preprocessing.npz`). No se menciona uso de RLHF, DPO ni ninguna innovación técnica destacable; es un entrenamiento académico básico.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre imágenes de 32x32x3 tras preprocesado (aplanado, normalización y estandarización).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general más allá de CIFAR-10.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo thinking, visión general, audio ni capacidades especiales.

## Casos de uso

- Docencia y aprendizaje de fundamentos de deep learning: el modelo sirve como ejemplo mínimo y reproducible de un MLP entrenado desde cero con SGD, útil en asignaturas como SMAI para ilustrar el flujo completo de preprocesado, entrenamiento y evaluación.
- Prototipado rápido de clasificación de imágenes de baja resolución: para experimentos académicos que requieran un clasificador CIFAR-10 de referencia con precisión conocida (46,69 %), sin dependencias de frameworks pesados.
- Comparación de baselines: sirve como línea base débil frente a CNN y transformers de visión en estudios comparativos de arquitecturas sobre CIFAR-10.
- Pruebas de pipelines de carga de pesos personalizados: dado que los pesos son cargables con `nn_lib.Model.load_from`, puede usarse para validar herramientas internas de serialización y carga de modelos.
- Ejercicios de análisis de errores: con una precisión de test de 0,4669, es adecuado para estudiar confusiones entre clases y limitaciones de los MLP frente a CNN.
- Reproducción de experimentos académicos: permite replicar exactamente el entrenamiento (float64, SGD, lr=0.05, batch 64, 100 épocas) para verificar resultados.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0.4669 (46,69 %) |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float64 (el modelo tiene del orden de 400.000 parámetros); en float32 o float16 sería aún menor.
- GPU recomendadas: cualquier GPU, incluida una GPU integrada o CPU; no requiere aceleración dedicada.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, etc.) y en CPU sin problema.
- Opciones de despliegue: inferencia en NumPy/Python puro mediante `nn_lib`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un MLP de visión).
- Latencia y throughput: no disponibles; por el tamaño del modelo, la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | MLP [3072,128,64,10] | ~402.000 (aprox.) | No aplica | 46,69 % | No disponible | HuggingFace |
| LeNet-5 (referencia clásica) | CNN | ~60.000 | No aplica | ~70 % (referencia típica) | No disponible | Múltiples implementaciones |
| ResNet-18 (referencia) | CNN | ~11,2 M | No aplica | ~93-95 % (referencia típica) | No disponible | Múltiples implementaciones |
| ViT pequeño (referencia) | Transformer | Variable | No aplica | ~80-90 % (referencia típica) | No disponible | Múltiples implementaciones |

No se dispone de datos oficiales de benchmarks de los modelos alternativos en la información proporcionada; las cifras indicadas son referencias generales de la literatura y no deben atribuirse a este repositorio.

## Limitaciones y advertencias

- Precisión baja (46,69 % en test), muy por debajo de CNN y transformers modernos; no apto para producción real.
- Entrenado únicamente sobre CIFAR-10; no generaliza a otras tareas de visión ni a imágenes de otra resolución o dominio.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- Sesgos conocidos: no documentados; al entrenarse con CIFAR-10 puede heredar los sesgos de composición de dicho dataset.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero puede producir clasificaciones erróneas con alta confianza.
- Licencia no especificada: no se puede garantizar su uso comercial; se recomienda contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Formato de pesos no estándar (presumiblemente `.npz`), lo que limita su integración con frameworks de despliegue habituales.
- Repositorio de 0,0 GB y sin pipeline declarado; la reproducibilidad depende de la librería `nn_lib` del autor, no incluida necesariamente en el repo.

## Enlaces

- HuggingFace: https://huggingface.co/akshat0285/smai-a4-cifar10-mlp
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
