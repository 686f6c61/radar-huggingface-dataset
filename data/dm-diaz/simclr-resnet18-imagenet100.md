# DM-Diaz/SimCLR-ResNet18-ImageNet100

## Resumen

Este repositorio contiene un checkpoint del modelo **SimCLR con backbone ResNet-18** entrenado sobre el subconjunto **ImageNet-100** (100 clases de ImageNet). Fue desarrollado por **DM-Diaz** como parte de un estudio de neurociencia visual publicado en la 9ª Conferencia de Neurociencia Cognitiva Computacional (CCN 2026), donde se utiliza como modelo de referencia **no egocéntrico** para comparar representaciones visuales aprendidas a partir de experiencias visuales egocéntricas naturales.

El modelo se entrenó con el framework de aprendizaje auto-supervisado **Lightly** y está pensado para la extracción de características visuales y la investigación en codificación neural de la información periférica. Su relevancia radica en servir como punto de comparación en estudios sobre cómo el sistema visual humano codifica información de forma adaptativa alrededor del campo visual, un área de creciente interés en la intersección entre visión por computador y neurociencia.

La arquitectura es un ResNet-18 estándar con el paradigma contrastivo SimCLR. El tamaño del repositorio es de 0.1 GB, lo que indica un modelo ligero, adecuado para experimentos en entornos con recursos limitados. No se especifican parámetros totales ni detalles de contexto, al tratarse de un modelo puramente visual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con SimCLR (aprendizaje contrastivo auto-supervisado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura **ResNet-18** como backbone, entrenada con el método **SimCLR** (contrastive learning). SimCLR aprende representaciones visuales maximizando la similitud entre vistas aumentadas de la misma imagen y minimizándola entre imágenes distintas, sin necesidad de etiquetas. El entrenamiento se realizó con el framework **Lightly** sobre el dataset `clane9/imagenet-100`, que contiene 100 clases de ImageNet.

No se dispone de información sobre el número de épocas, el tamaño del lote, ni la composición exacta de los aumentos de datos. Tampoco se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo. La innovación principal no reside en el algoritmo en sí, sino en su uso como referencia no egocéntrica en un estudio de neurociencia visual, comparando sus representaciones con las de modelos entrenados en datos egocéntricos.

## Capacidades

- **Extracción de características visuales**: genera embeddings de imágenes de 100 clases de ImageNet, útiles para tareas de clasificación, similitud o recuperación.
- **Transfer learning**: puede servir como inicialización para fine-tuning en tareas de visión con datasets pequeños.
- **Representaciones auto-supervisadas**: al no requerir etiquetas durante el entrenamiento, las representaciones capturan estructuras visuales generales.
- **Investigación en neurociencia visual**: diseñado específicamente para comparar la codificación de información periférica frente a modelos egocéntricos.
- **No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso**: es un modelo exclusivamente de visión.
- **No tiene capacidades multilingües ni de procesamiento de lenguaje natural**.

## Casos de uso

- **Investigación en neurociencia visual**: el modelo se emplea como referencia no egocéntrica para estudiar cómo se codifica la información en distintas regiones del campo visual, comparando sus representaciones con las de modelos entrenados con datos egocéntricos.
- **Extracción de características para clasificación de imágenes**: se puede usar para obtener embeddings de imágenes y alimentar clasificadores lineales o redes simples, especialmente en dominios con pocos datos etiquetados.
- **Fine-tuning para tareas de visión específicas**: al ser un ResNet-18 preentrenado, puede ajustarse para tareas como detección de objetos, segmentación semántica o clasificación en dominios concretos, partiendo de representaciones visuales generales.
- **Inicialización de pesos en experimentos académicos**: sirve como punto de partida para estudios que requieren un backbone ligero y reproducible, con licencia Apache 2.0.
- **Evaluación de representaciones en benchmarks de visión**: puede utilizarse para medir la calidad de las representaciones aprendidas mediante protocolos estándar como linear probing o k-NN.
- **Estudio de la codificación de información periférica**: en el contexto del paper asociado, se usa para analizar cómo la restricción de la excentricidad en el entrenamiento afecta a la representación de la información visual, comparando con este modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje o razonamiento general. Tampoco se incluyen resultados de precisión en ImageNet-100 ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente, pero al tratarse de un ResNet-18 con un tamaño de repo de 0.1 GB, la inferencia requiere típicamente menos de 1 GB de VRAM en FP32, y menos aún en cuantización (aunque no se especifican formatos cuantizados).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para fine-tuning se recomienda una GPU con 4-8 GB (por ejemplo, GTX 1060, RTX 2060, RTX 3060, etc.).
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs consumer como las de la serie RTX 30/40, así como en hardware integrado con suficiente memoria.
- **Opciones de despliegue**: al ser un modelo PyTorch, puede ejecutarse con frameworks estándar como PyTorch, Hugging Face Transformers (si se adapta), o mediante ONNX para inferencia optimizada. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- **Latencia y throughput**: no disponibles, pero por su tamaño reducido se espera una latencia baja (del orden de milisegundos por imagen en GPU moderna).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se pueden establecer comparativas con otros SimCLR ResNet-18 entrenados en ImageNet-1K o STL-10, aunque el propio paper menciona que se usaron junto a modelos preentrenados en ImageNet-1K y STL-10 como referencias adicionales. Sin datos concretos de rendimiento, no es posible realizar una comparación cuantitativa.

## Limitaciones y advertencias

- **Entrenamiento limitado a 100 clases**: el modelo solo ha visto imágenes de ImageNet-100, por lo que su capacidad de generalización a otros dominios visuales es limitada.
- **Modelo de investigación**: no está optimizado para producción; su propósito principal es servir como referencia en estudios científicos, no como componente de sistemas comerciales.
- **Sin capacidades de lenguaje**: no procesa texto ni entiende instrucciones; es exclusivamente un extractor de características visuales.
- **Posibles sesgos del dataset**: ImageNet-100 hereda los sesgos de ImageNet (por ejemplo, sesgos geográficos y culturales en las imágenes), lo que puede afectar a las representaciones aprendidas.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo se distribuye tal cual, sin garantías de rendimiento ni soporte.
- **Sin información sobre cuantización**: no se ofrecen versiones cuantizadas, por lo que el despliegue en entornos con restricciones de memoria requeriría conversión manual.

## Enlaces

- [HuggingFace - DM-Diaz/SimCLR-ResNet18-ImageNet100](https://huggingface.co/DM-Diaz/SimCLR-ResNet18-ImageNet100)
- [arXiv:2607.19316](https://arxiv.org/abs/2607.19316)
- [DOI: 10.32470/0416gfsq](https://doi.org/10.32470/0416gfsq)
- [Presentación en CCN 2026 (YouTube)](https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s)
- [Dataset clane9/imagenet-100](https://huggingface.co/datasets/clane9/imagenet-100)
