# hariaakash646/smai-a4-cifar10-mlp

## Resumen

El modelo `smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) completamente conectado entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10. Lo desarrolla el usuario de HuggingFace `hariaakash646` en el contexto de la asignatura SMAI (Statistical Methods in Artificial Intelligence), concretamente como parte del "Assignment 4, Section 1.5". No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto académico de pequeño tamaño pensado para demostrar un pipeline completo de entrenamiento y evaluación sobre datos de imagen.

La arquitectura es deliberadamente simple: tres capas densas (3072 → 512 → 256 → 10) con activación ReLU en las capas ocultas y salida lineal de 10 logits, sumando 1.707.274 parámetros. Los pesos se distribuyen en formato NumPy (`.npz`), no en safetensors ni GGUF, y la inferencia se realiza con operaciones matriciales directas en NumPy, sin necesidad de framework de deep learning. Esto lo hace extremadamente ligero y fácil de inspeccionar, pero también limita su uso a tareas de clasificación de imágenes de 32x32 píxeles.

Su relevancia es fundamentalmente didáctica: sirve como referencia reproducible de un clasificador básico sobre CIFAR-10, con precisión de test del 54,75 %, lo que refleja el sobreajuste típico de un MLP sin regularización sobre este dataset (precisión de entrenamiento del 100 %). No compite con modelos de visión modernos y no está pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado: 3072 → 512 → 256 → 10 |
| Parametros totales | 1.707.274 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en float, formato NumPy `.npz`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz`, `preprocessing.npz`) más `config.json` |

## Arquitectura y entrenamiento

El modelo es un MLP de tres capas densas con activación ReLU en las dos capas ocultas y sin activación en la salida (10 logits, con softmax y entropía cruzada como pérdida durante el entrenamiento). La inicialización es normal con varianza 2/n_in para las capas ReLU y 1/n_in para la capa de salida, con sesgos a cero. La entrada son imágenes CIFAR-10 aplanadas a 3072 valores (orden HWC), normalizadas a [0,1] dividiendo por 255 y estandarizadas por columna con media y desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (std = 1 donde era 0).

El entrenamiento se realizó en PyTorch con SGD plano, learning rate 0,05, tamaño de lote 64, acumulación de gradiente 1, 100 épocas, etiquetas verdaderas (p = 0, sin label smoothing), sin early stopping, sobre las 50.000 imágenes de entrenamiento. Las semillas fijadas son `torch.manual_seed(11002)` y semilla 11003 para el generador del DataLoader. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación, lo cual es esperable en un clasificador de imágenes. Tampoco se documentan aumentos de datos ni regularización (dropout, weight decay), lo que explica el sobreajuste observado.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia puramente en NumPy mediante multiplicaciones matriciales, sin dependencia de PyTorch en tiempo de ejecución.
- Preprocesamiento reproducible incluido (`preprocessing.npz` con media y desviación típica por columna).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación de imágenes de 32x32.

## Casos de uso

- Docencia y reproducción de prácticas: el modelo sirve como referencia completa de un pipeline de entrenamiento y evaluación sobre CIFAR-10, con pesos y estadísticas de preprocesamiento incluidos, para que estudiantes comparen sus implementaciones.
- Clasificación rápida de imágenes de bajo coste en entornos sin GPU: al ejecutarse solo con NumPy, puede desplegarse en cualquier entorno con Python y NumPy para clasificar imágenes de 32x32 con un coste computacional mínimo.
- Baseline de comparación en experimentos de visión: útil como línea base débil frente a la que medir mejoras de arquitecturas convolucionales o transformers de visión sobre CIFAR-10.
- Pruebas de integración de pipelines de preprocesamiento: el par `model.npz` + `preprocessing.npz` permite validar paso a paso el aplanado, normalización y estandarización de imágenes antes de pasarlas a un modelo mayor.
- Demostraciones educativas de sobreajuste: con precisión de entrenamiento del 100 % y de test del 54,75 %, es un ejemplo claro para explicar la brecha entre entrenamiento y generalización y la necesidad de regularización.
- Prototipado de clasificadores de imágenes de muy baja resolución en dispositivos con recursos limitados, siempre que la tarea se limite a las 10 clases de CIFAR-10 y no se requiera alta precisión.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Métrica | Entrenamiento | Test |
|---|---|---|
| Precisión | 1,0000 | 0,5475 |
| Pérdida | 0,0001 | 5,0997 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; los pesos ocupan unos pocos megabytes (1.707.274 parámetros en float, más las estadísticas de preprocesamiento).
- GPU recomendadas: no requiere GPU; la inferencia en NumPy se ejecuta en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU y en dispositivos de bajos recursos.
- Opciones de despliegue: ejecución directa con NumPy según el ejemplo de la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada, aunque por el tamaño y la simplicidad del modelo se espera un coste muy bajo por imagen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, un MLP de este tipo sobre CIFAR-10 suele quedar por debajo de arquitecturas convolucionales y de transformers de visión en precisión de test, pero no se aportan cifras de terceros que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | 1.707.274 | no aplica | 0,5475 | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sobreajuste severo: precisión de entrenamiento del 100 % frente al 54,75 % en test, con pérdida de test de 5,0997, lo que indica escasa generalización.
- Solo clasifica imágenes de 32x32x3 en las 10 clases de CIFAR-10; no admite otras resoluciones ni dominios sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- No se documentan sesgos específicos, pero al entrenarse solo con CIFAR-10 hereda las limitaciones y posibles sesgos de ese dataset.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de clasificaciones erróneas con alta confianza fuera de la distribución de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- El formato de pesos es NumPy `.npz`, no estándar en ecosistemas de despliegue de modelos; requiere código propio para servirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hariaakash646/smai-a4-cifar10-mlp
- Dataset CIFAR-10 en HuggingFace: https://huggingface.co/datasets/uoft-cs/cifar10
