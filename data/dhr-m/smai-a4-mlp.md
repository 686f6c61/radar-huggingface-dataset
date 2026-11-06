# dhr-m/smai-a4-mlp

## Resumen

`dhr-m/smai-a4-mlp` es un perceptrón multicapa (MLP) de tres capas entrenado sobre CIFAR-10 como parte del cuarto trabajo de la asignatura SMAI (Monsoon 2026). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes de 32x32 píxeles en 10 categorías, implementado y exportado en NumPy puro. El repositorio contiene únicamente los pesos en formato `.npz`, los parámetros de preprocesado y un `config.json` con los ajustes de entrenamiento.

El modelo emplea una arquitectura totalmente conectada de 3072 entradas (32x32x3 aplanado) hacia 128 unidades ocultas con activación ReLU y una capa de salida de 10 logits, sumando 394.634 parámetros. Se entrenó con SGD plano (lr 0.01, batch 64, 100 épocas, entropía cruzada, float32, semilla 11011) sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (sin ruido de etiqueta, p = 0), y alcanza una precisión de test de 0,4694.

Su relevancia es puramente académica y didáctica: sirve como línea base reproducible para comparar el efecto del ruido de etiqueta en el mismo conjunto de datos dentro del citado trabajo. No está pensado para producción, no tiene model card orientada a uso general y no ofrece inferencia vía `transformers` ni pipeline estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado 3072 → 128 → 10, activación ReLU en capa oculta, salida de 10 logits |
| Parametros totales | 394.634 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro de `.npz`) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`weights.npz`, `preprocessing.npz`, `config.json`) |

## Arquitectura y entrenamiento

La red es un MLP clásico de dos capas lineales con ReLU intermedia. La entrada es una imagen CIFAR-10 de 32x32x3 reordenada como vector de 3072 dimensiones y normalizada por canal con la media y la desviación típica del conjunto de entrenamiento (almacenadas en `preprocessing.npz`). La primera capa proyecta 3072 → 128 (393.344 parámetros contando sesgos), la activación ReLU introduce no linealidad y la segunda capa proyecta 128 → 10 (1.290 parámetros), produciendo logits para las 10 clases de CIFAR-10. No hay convoluciones, dropout, normalización por lotes ni restricciones de pesos.

El entrenamiento se realizó en PyTorch con SGD sin momento, learning rate 0.01, tamaño de lote 64, acumulación de gradiente 1, 100 épocas, pérdida de entropía cruzada, precisión float32 y semilla 11011. Se usaron las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0 de ruido) y se evaluó sobre las 10.000 imágenes de test, obteniendo una precisión de 0,4694 tras la última época. Los pesos se exportaron a NumPy para permitir inferencia sin dependencias de PyTorch.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro mediante producto matricial y ReLU, sin necesidad de framework de deep learning.
- Reproducibilidad completa: semilla, hiperparámetros y preprocesado documentados en `config.json`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes CIFAR-10.

## Casos de uso

- Línea base académica para estudiar ruido de etiqueta: el modelo se entrenó con p = 0 y sirve como referencia frente a variantes entrenadas con ruido en el mismo trabajo; permite medir la caída de precisión atribuible al ruido.
- Docencia de redes neuronales desde cero: el formato `.npz` y el snippet de inferencia en NumPy permiten a estudiantes inspeccionar pesos, gradientes y activaciones sin capas de abstracción.
- Reproducción de experimentos en entornos sin GPU: al ser NumPy puro, se puede ejecutar la inferencia en cualquier máquina con Python y NumPy, sin CUDA ni PyTorch.
- Benchmark de pipelines de preprocesado: la normalización por canal está fijada en `preprocessing.npz`, lo que permite validar implementaciones alternativas de carga de CIFAR-10 comparando predicciones.
- Prueba de integración de artefactos `.npz` en sistemas de serving ligeros: útil para validar cargadores de pesos personalizados en herramientas que no soportan safetensors o GGUF.
- Ejercicio de comparación de arquitecturas: al ser un MLP sin convoluciones, sirve para contrastar con CNN pequeñas sobre CIFAR-10 y cuantificar la brecha de precisión (0,4694 frente a modelos convolucionales).

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy (época 100) | 0,4694 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (394.634 parámetros × 4 bytes ≈ 1,6 MB de pesos, más buffers de activación y lote de entrada).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU; también en Raspberry Pi.
- Opciones de despliegue: inferencia directa con NumPy según el snippet de la model card; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, un producto matricial de 3072×128 por imagen es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dhr-m/smai-a4-mlp` | 394.634 | 3072 valores (32x32x3) | 0,4694 | no disponible | Hugging Face, `.npz` |
| MLP más profundo o con regularización | no disponible | 3072 valores | no disponible | no disponible | no disponible |
| CNN pequeña sobre CIFAR-10 | no disponible | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas concretas en la información proporcionada; la comparativa queda limitada a la referencia cualitativa del propio trabajo académico.

## Limitaciones y advertencias

- Precisión de test baja (0,4694), lejos de lo esperado en producción; no apto para tareas reales de clasificación de imágenes.
- Entrenado exclusivamente sobre CIFAR-10; no generaliza a otras resoluciones, dominios ni números de clases.
- Sesgos conocidos: no documentados, pero CIFAR-10 presenta desequilibrios y sesgos de representación en sus clases que el modelo hereda.
- Riesgo de sobreajuste: sin dropout, weight decay ni aumentación de datos, la brecha train/test puede ser significativa; no se reportan métricas de entrenamiento.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sin model card orientada a producción, sin pipeline de Hugging Face y sin tokenizador; la integración requiere implementar la inferencia manualmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Formato `.npz` no estándar en el ecosistema Hugging Face: no compatible con `from_pretrained` ni con servidores de inferencia convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhr-m/smai-a4-mlp
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
