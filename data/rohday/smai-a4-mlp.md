# rohday/smai-a4-mlp

## Resumen

SMAI A4 Q1 es una implementación didáctica de un perceptrón multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10, publicada por el usuario rohday en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional: es una red neuronal fully-connected de tres capas (3072 entradas, 128 unidades ocultas y 10 salidas) con activación ReLU en la capa oculta y salida lineal de 10 logits optimizada con entropía cruzada softmax. El repositorio tiene un tamaño de 0.0 GB, lo que es coherente con el reducido número de parámetros de la red.

El modelo resuelve una tarea clásica de clasificación de imágenes en 10 categorías (CIFAR-10) y su interés es fundamentalmente pedagógico: sirve como referencia de un baseline simple, reproducible y de bajo coste computacional para comparar con arquitecturas convolucionales o transformers de visión. La model card documenta de forma explícita la arquitectura, el preprocesado y los hiperparámetros de entrenamiento, lo que facilita su reproducción.

La relevancia actual es limitada en términos de capacidades, pero el modelo es útil como ejemplo de buenas prácticas de documentación técnica (pesos en formato NPZ, estadísticas de normalización incluidas en `preprocessing.npz`) y como punto de partida para experimentos docentes sobre overfitting, regularización y límites de los MLP en visión. No dispone de pipeline declarado, licencia, idiomas ni métricas de benchmarks publicadas más allá de la accuracy de test indicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP fully-connected (3072 → 128 → 10), activación ReLU en capa oculta, salida lineal de 10 logits con pérdida softmax cross-entropy |
| Parametros totales | 394.890 (3072×128 + 128 + 128×10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija de 32×32×3 = 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NPZ (`weights.npz` con matrices `W{i}` de forma `(n_in, n_out)` y vectores `b{i}`; `preprocessing.npz` con media y desviación típica) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de dos capas lineales con una no linealidad ReLU intermedia. La entrada son imágenes CIFAR-10 aplanadas a 3072 valores en orden HWC, normalizadas dividiendo por 255 y aplicando estandarización con la media y la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (guardadas en `preprocessing.npz`). La capa oculta tiene 128 unidades y la capa de salida produce 10 logits que se interpretan como probabilidades tras softmax; la pérdida es entropía cruzada softmax.

El entrenamiento se realizó durante 100 épocas con SGD plano, learning rate de 0.02, batch size de 64 y sin acumulación de gradientes (1 paso). Se usaron las etiquetas verdaderas (p = 0, sin label smoothing ni destilación) y no se aplicó ninguna restricción adicional (el campo `constraint` es `null`). No se documentan aumentación de datos, weight decay, momentum, scheduler de learning rate ni técnicas de regularización como dropout. La accuracy de test reportada por el autor es 0.4725 (47,25 %), un valor bajo para CIFAR-10 que refleja las limitaciones de un MLP sin convoluciones ni aumentación sobre este dataset.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista y de coste muy bajo: una única multiplicación de matrices 3072×128 seguida de 128×10.
- Reproducibilidad completa: pesos, preprocesado e hiperparámetros están documentados y empaquetados en NPZ.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No es adecuado para tareas fuera de la clasificación de imágenes de 32×32 con el preprocesado especificado.

## Casos de uso

- Docencia y formación en deep learning: el modelo sirve para ilustrar el flujo completo de un MLP (aplanado, normalización, forward pass, softmax cross-entropy, SGD) con un ejemplo reproducible y de tamaño manejable en cualquier portátil.
- Baseline de referencia en experimentos de visión: permite comparar el rendimiento de arquitecturas convolucionales o transformers de visión frente a un MLP simple con la misma partición de entrenamiento y test de CIFAR-10.
- Estudio de overfitting y regularización: al no incluir dropout, weight decay ni aumentación, es un punto de partida ideal para medir el impacto de añadir cada técnica sobre la accuracy de test (0.4725 de partida).
- Prototipado rápido de pipelines de clasificación: útil para validar el código de carga de datos, normalización y evaluación antes de escalar a modelos mayores.
- Análisis de sensibilidad al preprocesado: permite experimentar con distintas medias y desviaciones típicas o con normalización por canal para cuantificar su efecto en la convergencia.
- Demostraciones educativas de límites de los MLP: sirve para mostrar por qué una red fully-connected sin sesgo inductivo espacial rinde peor que una CNN en imágenes, con una diferencia cuantificable respecto a baselines convolucionales.
- Referencia en pruebas de integración de frameworks: al tener pesos en NPZ y operaciones matriciales simples, es útil para verificar la corrección numérica de implementaciones propias de capas lineales y softmax.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| CIFAR-10 test accuracy | 0.4725 | Reportado por el autor en la model card; entrenamiento con SGD plano, 100 épocas, lr 0.02, batch size 64 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (394.890 parámetros en float32 ≈ 1,6 MB) más el buffer de entrada (3072 valores); cabe holgadamente en cualquier GPU, CPU o incluso microcontrolador.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En GPU, una RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamaño del cómputo.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- Opciones de despliegue: al estar los pesos en NPZ, se carga con NumPy directamente; también es trivial exportarlo a ONNX, PyTorch o TensorFlow. No se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño, el forward pass es del orden de microsegundos en CPU y permite procesar lotes grandes sin cuello de botella.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 Q1 (este modelo) | 394.890 | 32×32×3 = 3072 valores | 0.4725 (test accuracy) | no disponible | Hugging Face (rohday/smai-a4-mlp) |
| LeNet-5 (baseline CNN clásico) | ~60.000 | 32×32×1 o 32×32×3 | ~0.70–0.75 típico en CIFAR-10 | no disponible | Implementaciones múltiples |
| ResNet-18 | ~11,2 M | 32×32×3 | ~0.93–0.95 típico en CIFAR-10 | no disponible | Implementaciones múltiples |
| ViT pequeño (p. ej. ViT-Tiny) | ~5,7 M | 32×32×3 con parches | ~0.85–0.90 típico en CIFAR-10 | no disponible | Implementaciones múltiples |

Nota: los valores de los modelos comparativos son rangos orientativos habituales en la literatura para CIFAR-10; no se han extraído de la información proporcionada en esta búsqueda. La comparación directa con este modelo debe hacerse con cautela porque los protocolos de entrenamiento (aumentación, scheduler, regularización) difieren.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (por ejemplo, categorías visualmente similares como gato y perro, o ciervo y caballo, se confunden con frecuencia).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero el modelo puede producir predicciones de alta confianza incorrectas en imágenes fuera de distribución o con preprocesado distinto al documentado.
- Limitaciones de contexto o idioma: no procesa texto ni secuencias; solo acepta entradas de 32×32×3 aplanadas en orden HWC y normalizadas con la media y desviación típicas de `preprocessing.npz`. Cualquier otra resolución o canal requiere reentrenamiento o adaptación.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada; debe consultarse con el autor antes de cualquier uso comercial.
- Caveat importante para producción: con una accuracy de test de 0.4725, el modelo no es adecuado para aplicaciones reales de clasificación de imágenes; su valor es educativo y de referencia.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el contenido es mínimo; conviene verificar la integridad de los ficheros antes de usarlo.
- No se documentan semillas aleatorias ni particiones exactas de validación, lo que dificulta la reproducibilidad estricta del 0.4725 reportado.

## Enlaces

- Hugging Face: https://huggingface.co/rohday/smai-a4-mlp
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
