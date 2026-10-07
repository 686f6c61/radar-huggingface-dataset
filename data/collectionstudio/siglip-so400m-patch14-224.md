# CollectionStudio/siglip-so400m-patch14-224

## Resumen

SigLIP (Sigmoid Loss for Language Image Pre-Training) es un modelo multimodal de doble codificador —un codificador de imagen y otro de texto— que aprende representaciones conjuntas de pares imagen-texto. La variante aquí descrita emplea la arquitectura SoViT-400m («shape-optimized ViT»), con parches de 14x14 píxeles y resolución de entrada de 224x224, y cuenta con 877.360.306 parámetros totales. Fue desarrollado por el equipo de Google Research (Zhai, Mustafa, Kolesnikov y Beyer) y publicado originalmente en el repositorio `google-research/big_vision`; la model card fue redactada por el equipo de Hugging Face, no por los autores.

Su principal aportación frente a CLIP es la función de pérdida sigmoidea: en lugar de normalizar las similitudes de todos los pares de un lote mediante softmax (lo que exige una vista global del batch), SigLIP aplica una pérdida de tipo sigmoide independiente a cada par imagen-texto. Esto permite escalar el tamaño de lote sin degradar el entrenamiento y, además, obtiene mejores resultados con lotes pequeños, lo que abarata el ajuste fino y el entrenamiento desde cero.

La ficha corresponde a una resubida del repositorio original bajo la cuenta `CollectionStudio`, con 0 descargas y 0 «likes» en el momento de la consulta. El modelo resulta relevante como componente de clasificación y recuperación cero disparo, y como codificador visual en pipelines multimodales (por ejemplo, en familias tipo PaLI o PaliGemma), donde su relación precisión/parámetros lo sitúa por encima de CLIP en igualdad de cómputo según el paper original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de doble codificador (imagen + texto); visión con SoViT-400m («shape-optimized» ViT), parches 14x14, entrada 224x224 |
| Parámetros totales | 877.360.306 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Texto tokenizado y rellenado (padding) a 64 tokens; imagen a 224x224 px (rejilla de 16x16 = 256 parches) |
| Tipos de cuantización | No disponible en la información proporcionada; los pesos se distribuyen en safetensors (habitualmente fp32), convertibles a fp16/bf16, int8 e int4 |
| Idiomas soportados | No disponible explícitamente; el corpus de preentrenamiento WebLI es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 3,5 GB) |

## Arquitectura y entrenamiento

SigLIP es un modelo dual (contrastivo) compuesto por un codificador visual tipo Vision Transformer y un codificador de texto tipo transformer. En esta variante, el codificador visual sigue la forma optimizada SoViT-400m descrita por Alabdulmohsin et al. en «Getting ViT in Shape: Scaling Laws for Compute-Optimal Model Design» (arXiv:2305.13035), que ajusta las proporciones entre profundidad, anchura y dimensiones de MLP para maximizar la eficiencia por FLOP en lugar de escalar solo el número de capas. La innovación central es la pérdida sigmoidea: cada par imagen-texto se evalúa de forma independiente, sin necesidad de una normalización global sobre las similitudes por pares, lo que elimina la dependencia del tamaño de lote y mejora el comportamiento con lotes pequeños.

El preentrenamiento se realizó sobre WebLI (Chen et al., 2023; arXiv:2209.06794), un corpus a gran escala de pares imagen-texto. La model card indica que las imágenes se redimensionan y reescalan y se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviación típica (0,5, 0,5, 0,5), y que los textos se tokenizan y se rellenan a 64 tokens. El cómputo de entrenamiento declarado es de 16 chips TPU-v4 durante tres días. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones, algo coherente con un modelo de representaciones que no genera texto libre.

Existe una inconsistencia reseñable en la model card: el apartado de preprocesamiento menciona una resolución de 384x384, mientras que el identificador del modelo y el nombre del checkpoint indican 224x224. Dado que la rejilla de parches y el número de parámetros corresponden a la variante de 224 px, lo más probable es que se trate de un error de copia en la documentación original de Hugging Face.

## Capacidades

- Clasificación de imágenes cero disparo (zero-shot image classification): asigna probabilidades a etiquetas de texto arbitrarias sin entrenamiento específico, mediante `torch.sigmoid(logits_per_image)`.
- Recuperación imagen-texto y texto-imagen (image-text retrieval): genera embeddings alineados en un espacio compartido para búsqueda semántica cruzada.
- Extracción de embeddings visuales y textuales reutilizables como codificador congelado en pipelines posteriores.
- Puntuación de similitud imagen-texto (scoring), útil para filtrar o reordenar candidatos generados por otros modelos.
- Procesamiento por lotes de imágenes y textos, gracias a la independencia de la pérdida sigmoidea respecto al tamaño del lote.
- No dispone de generación de texto libre, razonamiento multi-paso, tool calling, function calling ni capacidades de agente: es un modelo de representaciones, no un modelo generativo de lenguaje.
- No se documentan capacidades de audio, vídeo ni detección/segmentación de objetos en la información proporcionada.
- Idiomas: no especificados en la model card; al proceder de WebLI, el codificador de texto hereda la cobertura multilingüe del corpus, pero no hay evaluación publicada al respecto en la documentación disponible.

## Casos de uso

- Catalogación automática de productos en comercio electrónico: el modelo clasifica imágenes de producto contra un conjunto de categorías definidas en texto, sin necesidad de reentrenar al añadir categorías nuevas; basta con modificar la lista de etiquetas candidatas en la inferencia.
- Moderación de contenido visual: puntuación de imágenes frente a etiquetas descriptivas de contenido no permitido; al ser un clasificador cero disparo, se puede desplegar como filtro previo rápido antes de revisión humana.
- Búsqueda multimodal en activos digitales: indexación de un archivo fotográfico o de vídeo mediante embeddings de imagen y consulta en lenguaje natural, con recuperación por similitud coseno en una base vectorial.
- Curación y etiquetado de datasets: generación de etiquetas automáticas y detección de pares imagen-texto mal alineados en corpus de entrenamiento, aprovechando el scoring imagen-texto.
- RAG multimodal: uso como codificador visual en un sistema de recuperación aumentada donde el documento fuente es una imagen (capturas, diagramas, páginas escaneadas) y la consulta es textual.
- Control de calidad en línea de producción: inspección visual comparando la imagen capturada con descripciones textuales esperadas (por ejemplo, «pieza sin defecto», «pieza con grieta»), sin necesidad de recolectar ejemplos etiquetados de cada nuevo defecto.
- Filtrado y reranking en pipelines generativos: puntuación de imágenes candidatas frente a un prompt de texto para seleccionar la mejor salida antes de una revisión final.
- Investigación en visión por computador: uso como backbone congelado o como punto de partida para ajuste fino en tareas de clasificación con pocos ejemplos, gracias a sus 877 M de parámetros y a su coste de entrenamiento moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una figura con la tabla comparativa de SigLIP frente a CLIP extraída del paper original (arXiv:2303.15343), pero los valores de dicha tabla no están transcritos en el texto y no se reproducen aquí para no inventar cifras. Para datos concretos, debe consultarse directamente el paper «Sigmoid Loss for Language Image Pre-Training».

| Benchmark | Resultado |
|---|---|
| MMLU | No aplica (modelo no generativo de lenguaje) |
| HumanEval | No aplica |
| GSM8K | No aplica |
| ImageNet zero-shot | No disponible en la información proporcionada (referenciado gráficamente en la model card, sin valores numéricos) |
| COCO retrieval | No disponible en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 877 M de parámetros ocupan aproximadamente 3,5 GB de pesos, más activaciones y overhead; en fp16/bf16, unos 1,75 GB; en int8, del orden de 0,9 GB. Las cifras exactas de pico de memoria no están publicadas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM resulta suficiente en fp16 para lotes moderados; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o una L4 cubren el caso de uso sin dificultad. Para procesamiento por lotes a gran escala, A100 o H100 reducen el tiempo por imagen.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna con 6-8 GB o más, incluidas las gamas RTX 30 y 40.
- Opciones de despliegue: la vía oficial es la librería `transformers` (clases `AutoModel` y `AutoProcessor`, además del `pipeline` de `zero-shot-image-classification`). No se documenta en la información proporcionada soporte específico de vLLM, TGI, llama.cpp u Ollama para esta tarea concreta; otros formatos como ONNX u OpenVINO requerirían conversión propia.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en la información disponible.
- El entrenamiento original se realizó sobre 16 chips TPU-v4 durante tres días, dato útil como referencia de coste de cómputo, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / parche | Función de pérdida | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| siglip-so400m-patch14-224 (este) | 877 M | 224 px / 14x14 | Sigmoidea (SigLIP) | 64 tokens | apache-2.0 | Hugging Face (resubida) y `big_vision` |
| CLIP ViT-L/14 | ~428 M | 224 px / 14x14 | Softmax contrastiva | 77 tokens | MIT | Hugging Face, OpenAI |
| siglip-base-patch16-224 | ~203 M | 224 px / 16x16 | Sigmoidea (SigLIP) | 64 tokens | apache-2.0 | Hugging Face, `big_vision` |
| SigLIP SoViT-400m (original, Google) | 877 M | 224 px / 14x14 | Sigmoidea (SigLIP) | 64 tokens | apache-2.0 | `google/siglip-so400m-patch14-224` |

Los datos de rendimiento comparativo (ImageNet zero-shot, COCO, etc.) no están disponibles en la información proporcionada. La comparación se limita, por tanto, a arquitectura, tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto, no razona paso a paso, no soporta tool calling ni uso como agente. Cualquier expectativa en ese sentido es incorrecta.
- Riesgo de alucinación bajo: al no generar texto libre, no inventa contenido; sin embargo, puede asignar alta probabilidad a etiquetas incorrectas cuando el prompt textual es ambiguo o el dominio está poco representado en WebLI.
- Sesgos de datos: el preentrenamiento sobre WebLI hereda los sesgos presentes en corpus web a gran escala (representación desigual de culturas, géneros, etnias y contextos socioeconómicos). No se documenta ninguna evaluación de sesgos en la información disponible.
- Limitación de entrada de texto: 64 tokens de contexto, inferior a los 77 tokens de CLIP. Las descripciones largas o compuestas deben resumirse en frases cortas.
- Limitación de resolución: 224x224 píxeles y parches de 14x14, lo que penaliza el reconocimiento de detalles finos (texto pequeño, objetos diminutos) sin recortes previos.
- Idiomas: no se especifica la cobertura lingüística del codificador de texto ni su rendimiento fuera del inglés. En producción multilingüe debe validarse empíricamente antes de confiar en él.
- Licencia apache-2.0: permisiva y compatible con uso comercial, siempre que se conserve el aviso de licencia y se atribuya correctamente. No hay cláusulas de uso aceptable específicas más allá de las de Apache 2.0.
- Repositorio de terceros: esta ficha corresponde a la resubida `CollectionStudio/siglip-so400m-patch14-224`, con 0 descargas y 0 «likes». Para producción conviene verificar la integridad de los pesos frente al repositorio oficial `google/siglip-so400m-patch14-224` y preferir el original siempre que sea posible.
- Inconsistencia documental: la model card menciona resolución 384x384 en el preprocesamiento pese a tratarse de un checkpoint de 224x224; conviene no tomar ese dato como válido.
- Ausencia de datos de benchmarks en la documentación consultada: cualquier decisión de adopción debería apoyarse en una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio en Hugging Face (resubida): https://huggingface.co/CollectionStudio/siglip-so400m-patch14-224
- Repositorio original en Hugging Face: https://huggingface.co/google/siglip-so400m-patch14-224
- Paper de SigLIP, «Sigmoid Loss for Language Image Pre-Training» (Zhai et al., 2023): https://arxiv.org/abs/2303.15343
- Paper de SoViT, «Getting ViT in Shape: Scaling Laws for Compute-Optimal Model Design» (Alabdulmohsin et al., 2023): https://arxiv.org/abs/2305.13035
- Paper de WebLI (Chen et al., 2023): https://arxiv.org/abs/2209.06794
- Repositorio de código `big_vision` (Google Research): https://github.com/google-research/big_vision
- Documentación de SigLIP en Transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Resumen divulgativo de uno de los autores (hilo en la red social X): https://twitter.com/giffmana/status/1692641733459267713
- Búsqueda de otras variantes SigLIP en Hugging Face: https://huggingface.co/models?search=google/siglip
