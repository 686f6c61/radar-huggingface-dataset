# Divya7106/smai-a4-mlp

## Resumen

`Divya7106/smai-a4-mlp` es un perceptrón multicapa (MLP) de tres capas entrenado desde cero sobre CIFAR-10 como parte de la asignación 4 de la asignatura SMAI (pregunta 1, con etiquetas verdaderas y p = 0). No es un modelo de lenguaje ni un modelo fundacional: es un artefacto académico de clasificación de imágenes de 32x32 píxeles en 10 clases, con una arquitectura totalmente conectada de 3072-256-10 y activación ReLU en la capa oculta.

El modelo tiene 789.258 parámetros y se distribuye en formato NumPy (`.npz`) en lugar de safetensors o GGUF. Alcanza una precisión de entrenamiento de 0,9997 y una precisión de test de 0,5151, lo que refleja un sobreajuste severo típico de un MLP sin regularización sobre un dataset de imágenes. El repositorio ocupa 0,0 GB y no incluye model card con licencia, idiomas ni pipeline declarados.

Su relevancia es exclusivamente docente: sirve como referencia de implementación manual de forward pass, normalización de entradas y entrenamiento con SGD, no como componente para producción ni para tareas de generación. Cualquier evaluación práctica debe tratar este modelo como un clasificador de juguete limitado a CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado 3072-256-10, activación ReLU en capa oculta, salida identidad (logits) |
| Parametros totales | 789.258 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro de `.npz`) |
| Idiomas soportados | no disponible (no aplica; clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz` con `W0, b0, W1, b1`; `mlp_selected.npz` adicional) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de una sola capa oculta: entrada de 3072 dimensiones (32x32x3 aplanado), 256 unidades ocultas con ReLU y 10 salidas lineales correspondientes a las clases de CIFAR-10. La pérdida es entropía cruzada categórica (CCE) sobre logits. El forward pass es `logits = relu(x @ W0 + b0) @ W1 + b1`, con matrices `W` almacenadas en orientación `(n_in, n_out)`.

El entrenamiento usa las 50.000 imágenes de entrenamiento de CIFAR-10, SGD con learning rate 0,02, batch size 64, 100 épocas y semilla 13010. El preprocesado aplana cada imagen, divide por 255 y aplica normalización Z-score con media y desviación típica calculadas sobre el conjunto de entrenamiento (almacenadas en `preprocessing.npz`). No se documenta uso de data augmentation, weight decay, dropout, RLHF ni DPO. El repositorio incluye además `mlp_selected.npz`, un MLP de la misma arquitectura entrenado sobre el split de 36.000 imágenes del apartado 1.2.5.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista mediante forward pass NumPy, sin dependencias de frameworks de deep learning.
- Entrada fija de 32x32x3 píxeles; no admite resoluciones distintas sin reentrenamiento o adaptación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve para ilustrar el forward pass manual, el cálculo de gradientes y el efecto del sobreajuste comparando precisión de train (0,9997) frente a test (0,5151).
- Reproducción de experimentos académicos: permite replicar los resultados de la asignación SMAI 4 con la semilla 13010 y verificar la normalización con `preprocessing.npz`.
- Baseline de clasificación en CIFAR-10: útil como referencia inferior frente a CNN o Vision Transformers en ejercicios comparativos de accuracy.
- Pruebas de pipelines de inferencia NumPy: valida la carga de pesos `.npz` y la composición de operaciones matriciales sin frameworks pesados.
- Análisis de calibración y sobreajuste: el modelo es un caso claro para estudiar la brecha train-test y técnicas de regularización posteriores.
- Demostraciones de preprocesado: ejemplifica el aplanado y la normalización Z-score con estadísticas del conjunto de entrenamiento antes de alimentar una red.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de entrenamiento (CIFAR-10, 50.000 imágenes) | 0,9997 |
| Precisión de test (CIFAR-10) | 0,5151 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.258 parámetros × 4 bytes ≈ 3,2 MB más buffers de entrada de 3072 valores).
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer e incluso en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en Raspberry Pi.
- Opciones de despliegue: scripts NumPy personalizados; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño, la inferencia por muestra es del orden de microsegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precisión test CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| `Divya7106/smai-a4-mlp` | 789.258 | 3072 valores (32x32x3) | 0,5151 | no disponible | `.npz` |
| ResNet-18 (referencia típica) | ~11,2 M | 32x32x3 | ~0,93-0,95 | varía | safetensors / PyTorch |
| VGG-11 (referencia típica) | ~132 M | 32x32x3 | ~0,92 | varía | safetensors / PyTorch |
| MLP 3072-512-10 (variante académica) | ~1,6 M | 3072 valores | no disponible | no disponible | `.npz` |

Las cifras de ResNet-18 y VGG-11 son referencias habituales de la literatura sobre CIFAR-10 y no provienen de la información proporcionada; se incluyen solo como orientación cualitativa.

## Limitaciones y advertencias

- Sobreajuste severo: precisión de train 0,9997 frente a test 0,5151, lo que indica escasa generalización.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin model card completa: no hay información sobre sesgos, composición del dataset más allá de CIFAR-10 ni evaluación ética.
- Limitado a CIFAR-10 y a entradas de 32x32x3; no acepta otras resoluciones ni dominios.
- Riesgo de alucinación no aplica (no genera texto), pero sí de clasificaciones erróneas en clases visualmente similares (gato/perro, automóvil/camión).
- No es adecuado para producción: es un artefacto docente sin versionado, sin tests ni pipeline de inferencia estandarizado.
- Dependencia de `preprocessing.npz` para replicar resultados; omitir la normalización altera las predicciones.
- Sin soporte de cuantización ni de aceleradores hardware; el rendimiento depende del intérprete NumPy.

## Enlaces

- Hugging Face: https://huggingface.co/Divya7106/smai-a4-mlp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
