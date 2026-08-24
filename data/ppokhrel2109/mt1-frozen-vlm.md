# ppokhrel2109/mt1-frozen-vlm

## Resumen

M_T1 (identificado como `ppokhrel2109/mt1-frozen-vlm`) es un modelo de alineación visión-lenguaje desarrollado por Pranav Pokhrel como parte de su tesis de máster en la Universidad de Surrey. Su objetivo es demostrar hasta dónde se puede llegar alinear representaciones de imagen y texto usando exclusivamente codificadores congelados (frozen encoders), sin ajustar ninguna de las torres de visión o lenguaje. El modelo combina una torre de visión DINOv3 ViT-S/16 (224 píxeles) y una torre de texto all-MiniLM-L6-v2, ambas completamente congeladas, y añade un pequeño conjunto de módulos entrenables (agregadores de tokens y proyecciones residuales) para proyectar ambos espacios a una dimensión común de 384. El resultado es un modelo ligero con 47,2 millones de parámetros desplegados, de los cuales solo 2,9 millones son entrenables (6,1 %).

El modelo está pensado como un artefacto de investigación para medir el límite del alineamiento con encoders congelados bajo un presupuesto de latencia fijo. No busca ser un sistema de retrieval de vanguardia; de hecho, sus resultados en Flickr30k (51,90 % R@1 medio bidireccional) son inferiores a los de alternativas compactas como MobileCLIP2-S0 (78,25 %). Su licencia (DINOv3 License) prohíbe el uso comercial, por lo que se destina exclusivamente a entornos académicos y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-S/16 (visión) + all-MiniLM-L6-v2 (texto) con agregadores de tokens entrenables |
| Parametros totales | 47 196 544 (según safetensors) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (el backbone de texto tiene un máximo de 256 tokens, pero no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No declarado (el backbone de texto all-MiniLM-L6-v2 está entrenado principalmente en inglés) |
| Licencia | DINOv3 License (research only, prohibido uso comercial) |
| Formato de pesos | safetensors (model.safetensors, adapter.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de encoders completamente congelados. La torre de visión es un DINOv3 ViT-S/16 (224×224 píxeles) y la de texto es un all-MiniLM-L6-v2, ambos sin actualizar durante el entrenamiento. La parte entrenable consiste en un agregador de tokens de visión de dos bloques de 256 dimensiones (denominado C4), un agregador de texto de 128 dimensiones con cuatro cabezas de consultas aprendidas, dos proyecciones residuales y el logit scale. El entrenamiento se realizó mediante destilación con MobileCLIP2-S0 como profesor (solo durante el entrenamiento, no se incluye en el modelo final) y se usó una semilla 43 elegida sobre la partición de validación, nunca sobre el test.

El modelo se exporta con dos variantes: una completa con las torres congeladas incluidas y otra solo con los adaptadores entrenables (sin pesos de terceros). El proceso de entrenamiento se documenta en `training_recipe.json` y el origen del checkpoint se indica en `fingerprint.json` (seleccionado sobre COCO-dev). No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Recuperación de imágenes a partir de texto y de texto a partir de imágenes: el modelo produce embeddings L2-normalizados de 384 dimensiones para cada modalidad, lo que permite calcular similitud coseno.
- Alineación semántica multimodal: útil para tareas de búsqueda y clasificación basadas en similitud.
- Extracción de características (feature extraction) para pipelines de visión-lenguaje.
- No genera texto ni código; es un modelo de embeddings, no un modelo generativo.
- No soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- Capacidad multilingüe limitada al inglés (por el backbone de texto all-MiniLM-L6-v2), aunque no se declara oficialmente.
- No incluye capacidades de visión adicionales (detección, segmentación) ni audio.

## Casos de uso

Dado que el modelo está restringido a investigación y no tiene licencia comercial, los casos de uso deben entenderse dentro del ámbito académico o experimental:

- **Investigación en alineación de encoders congelados**: es una referencia para estudiar cuánto se puede lograr sin ajustar los backbones, útil para comparar con estrategias de fine-tuning completo.
- **Benchmark de eficiencia en retrieval**: sirve como punto de comparación para medir el trade-off entre parámetros entrenables y rendimiento en tareas de retrieval.
- **Prototipos de búsqueda multimodal**: en entornos de investigación, se puede usar para construir un pequeño sistema de búsqueda por similitud de imagen y texto, aunque su precisión es baja.
- **Estudios de destilación de conocimiento**: el papel del profesor MobileCLIP2-S0 (no incluido) puede analizarse comparando el rendimiento del modelo destilado con el del profesor.
- **Evaluación de transferencia zero-shot**: se puede usar para medir la capacidad de generalización de los embeddings congelados en clasificación (aunque los resultados son débiles, como indican los datos de CIFAR-100 y EuroSAT).
- **Experimentos de abalación sobre agregadores**: permite analizar el impacto de los módulos entrenables (agregadores de tokens) en la calidad de la alineación.

## Benchmarks y rendimiento

Se han publicado resultados en Flickr30k (test, Karpathy) con la semilla 43, así como medias de tres semillas para el modelo M_T1 y comparaciones con otros modelos. También se reportan resultados de clasificación zero-shot en CIFAR-100, Oxford-IIIT Pet y EuroSAT, aunque estos son negativos.

| Modelo | Flickr30k test R@1 | Parámetros |
|---|---|---|
| M_T1 (fully frozen) | 52.90 ± 0.87 (media 3 semillas) | 47.2M |
| FreezeShift dual | 62.20 ± 0.45 | 49.2M |
| OpenCLIP ViT-B/32 | 68.22 | 151.3M |
| MobileCLIP2-S0 | 78.25 | 74.8M |
| SigLIP2 ViT-B/32 | 80.46 | 376.9M |

Nota: el checkpoint desplegado (semilla 43) obtiene 51.90 % en el test, mientras que la media de tres semillas es 52.90 ± 0.87. Los resultados de clasificación zero-shot son débiles: CIFAR-100 ~36-38 %, Oxford-IIIT Pet ~8-10 %, EuroSAT ~22-24 %. El autor indica explícitamente que no se supera a los modelos compactos de referencia.

## Requisitos de hardware

- Con 47.2M de parámetros y embeddings de 384 dimensiones, el modelo es extremadamente ligero. En FP32, el peso total ocupa aproximadamente 188 MB (47.2M × 4 bytes). Con cuantización FP16 o int8, se reduce a la mitad o cuarto.
- Cabe en cualquier GPU con al menos 2 GB de VRAM, incluso en CPUs con suficiente RAM. Se puede ejecutar en una RTX 3060 o similar sin problemas.
- No se han publicado datos de latencia o throughput específicos. Dado el tamaño, se puede esperar una latencia de milisegundos en GPU moderna para inferencia por lote pequeño.
- Opciones de despliegue: la librería es PyTorch; se puede cargar con el script `load_model.py` proporcionado. No se mencionan soportes para vLLM, Ollama, TGI ni llama.cpp, por lo que el despliegue se limita a un script Python personalizado.
- No se requiere hardware especializado (A100, H100) para este modelo.

## Comparativa con modelos similares

La siguiente tabla compara M_T1 con modelos de referencia de retrieval imagen-texto de tamaño similar o mayor. Los datos de R@1 en Flickr30k test provienen de la model card.

| Modelo | Params | Flickr30k test R@1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| M_T1 (frozen) | 47.2M | 51.90 % | DINOv3 (research only) | HuggingFace, código en GitHub |
| FreezeShift dual | 49.2M | 62.20 ± 0.45 | No especificado | No publicado (mencionado) |
| OpenCLIP ViT-B/32 | 151.3M | 68.22 | MIT | HuggingFace |
| MobileCLIP2-S0 | 74.8M | 78.25 | Apple ML Research (research only) | HuggingFace |
| SigLIP2 ViT-B/32 | 376.9M | 80.46 | Apache 2.0 | HuggingFace |

M_T1 es significativamente más ligero que las alternativas, pero su rendimiento es mucho menor. La ventaja principal es su bajo coste computacional y su diseño de encoders congelados, que permite experimentar con alineación sin entrenar los backbones.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia DINOv3 prohíbe el uso comercial; solo se permite investigación. Además, el uso debe cumplir con las restricciones de control de exportación y no puede aplicarse a aplicaciones militares, de armamento, espionaje o nucleares.
- **Rendimiento bajo**: los resultados de retrieval y clasificación zero-shot son débiles comparados con modelos compactos de referencia. No es adecuado para aplicaciones de producción.
- **Sesgos**: los backbones congelados (DINOv3 y all-MiniLM) pueden heredar sesgos de sus datos de entrenamiento; no se han evaluado en este modelo.
- **Riesgo de alucinación**: no es un modelo generativo, por lo que no alucina texto, pero los embeddings pueden reflejar sesgos semánticos de los datos.
- **Idioma**: el backbone de texto es all-MiniLM-L6-v2, que está entrenado principalmente en inglés; el rendimiento en otros idiomas será muy limitado.
- **Contexto de texto**: el backbone de texto tiene un límite de tokens (256), por lo que no puede manejar documentos largos.
- **Origen de investigación**: es un artefacto de tesis, no un producto mantenido; el código puede tener limitaciones de documentación o soporte.

## Enlaces

- HuggingFace: https://huggingface.co/ppokhrel2109/mt1-frozen-vlm
- Código fuente: https://github.com/Pranav210901/Efficient-VLM
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Blog de HuggingFace sobre VLMs: https://huggingface.co/blog/vlms-2025 (contexto general, no específico)
