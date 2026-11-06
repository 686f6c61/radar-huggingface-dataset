# AhmedSSabir/ModernBERT-CNN-Caption-Reranker

## Resumen

ModernBERT-CNN-Caption-Reranker es un modelo de clasificación de texto desarrollado por Ahmed Sabir que reutiliza el encoder `answerdotai/ModernBERT-base` con una cabeza convolucional personalizada para puntuar la relacion semantica entre un conjunto de palabras de contexto derivadas de una imagen (objetos, escenas) y una caption candidata. La salida es una probabilidad entre 0 y 1 que permite ordenar captions o asignar pseudoetiquetas blandas a pares contexto/caption. No procesa imagenes ni genera texto: es un reranker puro sobre texto.

El modelo resuelve un problema concreto en pipelines de image captioning: dada una imagen ya procesada por un detector de objetos o un etiquetador de escenas, decidir cual de varias captions candidatas describe mejor ese contenido visual. Con 149 millones de parametros y una ventana de solo 64 tokens para la entrada combinada, esta disenado para ser rapido y ligero en la fase de reranking, no para generacion.

Es relevante por su enfoque hibrido: combina un transformer moderno (ModernBERT, con RoPE y atencion alterna local/global) con una cabeza CNN que captura patrones locales en la secuencia contexto+caption. El modelo se publica con codigo de inferencia propio y métricas de evaluacion detalladas sobre 45.000 candidatos, aunque su adopcion es todavia muy limitada (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) + cabeza CNN (32 filtros, kernel 3, ReLU, max pooling local, aplanado time-major, sigmoide) |
| Parametros totales | 149.089.025 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens para la entrada combinada contexto/caption |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,6 GB, libreria pytorch) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de 22 capas con las mejoras propias de ModernBERT (RoPE, atencion alterna local/global, prenorm). Se afinan las 22 capas del encoder mientras los parametros de embedding permanecen congelados. Sobre la representacion de salida se aplica una cabeza CNN personalizada: 32 filtros convolucionales de anchura 3, activacion ReLU, max pooling local, aplanado en orden temporal y una capa final con activacion sigmoide que produce la probabilidad de relacion. La entrada combina las palabras de contexto y la caption en una unica secuencia de 64 tokens.

El entrenamiento uso 330.790 pares con 41.275 pares de validacion, optimizador Adam, learning rate 1e-5, batch size 16, semilla 42, precision BF16/TF32 y compilacion. Se aplico early stopping tras tres epocas y el mejor checkpoint fue el de la epoca 1, con perdida de validacion 0,256281. Las etiquetas de entrenamiento no son juicios humanos: derivan de puntuaciones de similitud semantica umbralizadas a 0,3, lo que convierte el problema en una tarea de clasificacion binaria suave sobre pares contexto/caption.

## Capacidades

- Puntuacion de relacion semantica entre un conjunto de palabras de contexto (objetos, escenas) y una caption candidata, con salida probabilistica en [0, 1].
- Reranking de captions: ordenar multiples candidatas para una misma imagen y seleccionar la de mayor puntuacion.
- Asignacion de pseudoetiquetas blandas a pares contexto/caption para entrenamiento o filtrado de datos.
- Clasificacion de texto binaria (relacionado / no relacionado) mediante umbral sobre la probabilidad.
- Procesamiento exclusivamente textual: no lee imagenes, no genera captions, no hace vision.
- Soporte monolingue en ingles.
- No dispone de tool calling, function calling, modo thinking ni capacidades de agente.
- No soporta razonamiento multi-paso ni generacion de texto libre.

## Casos de uso

- Reranking en pipelines de image captioning: tras generar N captions candidatas con un modelo generativo (p. ej. BLIP o similar), usar este modelo para puntuar cada candidata contra las palabras de contexto extraidas por un detector de objetos y quedarse con la mejor. Es su caso de uso principal y el que la model card evalua con 45.000 candidatos.
- Filtrado de datasets de captioning: asignar pseudoetiquetas de calidad a pares imagen-texto existentes para descartar captions poco relacionadas con el contenido visual detectado, reduciendo ruido antes de entrenar un modelo generativo.
- Construccion de datos de preferencia: generar pares (caption buena, caption mala) por imagen usando las puntuaciones del reranker como senal de ordenacion, utiles para RLHF o DPO en modelos de captioning.
- Verificacion de accesibilidad: comprobar que el texto alternativo de una imagen (alt text) menciona los objetos y escenas realmente presentes, marcando discrepancias para revision humana.
- Moderacion de contenido en plataformas de imagenes: detectar captions que no corresponden al contenido visual declarado, como capa adicional en un pipeline de integridad.
- Analisis de calidad en catalogos de e-commerce: puntuar descripciones de producto contra las etiquetas de objeto detectadas en la foto para priorizar las fichas que necesitan reescritura.
- Investigacion en relacion semantica visual: usar el modelo como baseline reproducible para experimentos de grounding linguistico, dado que se publica con codigo de inferencia y métricas detalladas.

## Benchmarks y rendimiento

Resultados de reranking de captions reportados en la model card: 45.000 candidatos (nueve por imagen) sobre 5.000 imagenes, seleccionando la puntuacion maxima por imagen.

| Metrica | Valor |
|---|---|
| BLEU-4 | 0,329180 |
| METEOR | 0,271592 |
| ROUGE-L | 0,552392 |
| CIDEr | 1,096723 |
| SPICE | 0,205827 |
| BERTScore F1 | 0,939820 |

Pruebas adicionales:

| Prueba | Metrica | Valor |
|---|---|---|
| 41.849 pares pseudoetiquetados held-out | Accuracy | 0,890893 |
| 41.849 pares pseudoetiquetados held-out | F1 | 0,904035 |
| 41.849 pares pseudoetiquetados held-out | ROC-AUC | 0,961563 |
| 5.822 pares Flickr8K con juicio experto (1.000 imagenes) | Spearman | 0,293677 |
| 5.822 pares Flickr8K con juicio experto (1.000 imagenes) | Kendall tau-b | 0,212962 |

No se han publicado comparaciones directas con otros rerankers de captioning en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,3 GB de pesos, mas overhead de activaciones; en la practica cabe en cualquier GPU con 1-2 GB libres.
- En CPU es viable para lotes pequenos: el modelo tiene 149 millones de parametros y secuencias de solo 64 tokens.
- GPU recomendadas: no requiere GPU dedicada; funciona en RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad. Cualquier GPU consumer reciente es suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: el modelo usa una arquitectura CNN personalizada y el cargador estandar `AutoModel` no esta configurado para la cabeza. Es necesario usar el helper de inferencia incluido (`inference.py` con la clase `RelatednessScorer`), lo que limita el despliegue directo en vLLM, TGI, llama.cpp u Ollama sin adaptacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-CNN-Caption-Reranker | 149 M | 64 tokens | Reranking contexto/caption | no disponible | Hugging Face, codigo propio |
| Alibaba-NLP/gte-reranker-modernbert-base | no disponible | no disponible | Reranking de recuperacion de texto | no disponible | Hugging Face, `AutoModel` estandar |
| answerdotai/ModernBERT-base | no disponible | no disponible | Encoder base (clasificacion, retrieval) | no disponible | Hugging Face, ecosistema transformers |

La comparacion con `gte-reranker-modernbert-base` es la mas directa por compartir base ModernBERT, pero este ultimo esta orientado a reranking de recuperacion de texto general, no a relacion contexto visual/caption. El modelo de Sabir es un fine-tune especializado con cabeza no estandar, lo que reduce su interoperabilidad frente al resto.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento derivan de similitud semantica umbralizada a 0,3, no de juicios humanos; las probabilidades de salida no son calibradas como valoraciones de calidad humana.
- La concordancia con juicios humanos es modesta: Spearman 0,293677 y Kendall tau-b 0,212962 en Flickr8K, lo que indica que el reranker capta solo parcialmente la preferencia humana.
- Errores en la extraccion de objetos o etiquetas de escena degradan directamente la puntuacion, ya que el contexto de entrada depende de ese paso previo.
- Las entradas se truncan a 64 tokens, por lo que captions largas o contextos con muchos objetos pierden informacion.
- El modelo solo soporta ingles.
- La evaluacion proviene de una unica semilla de entrenamiento y el split derivado difiere del experimento historico del paper original, lo que limita la reproducibilidad exacta.
- La licencia no esta declarada, por lo que el uso comercial queda sin marco legal claro hasta que el autor la especifique.
- Requiere codigo de inferencia propio; no es compatible con cargadores estandar ni con servidores de inferencia convencionales sin adaptacion.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto libre), pero si hay riesgo de falsos positivos en la clasificacion.
- Adopcion practicamente nula (0 descargas, 0 likes), sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhmedSSabir/ModernBERT-CNN-Caption-Reranker
- Perfil del autor: https://huggingface.co/AhmedSSabir
- Dataset de origen: https://huggingface.co/datasets/AhmedSSabir/Textual-Image-Caption-Dataset
- Paper (CVPR Workshops 2023): https://huggingface.co/papers/2301.08784
- Paper en OpenAccess CVPR: https://openaccess.thecvf.com/content/CVPR2023W/O-DRUM/html/Sabir_Visual_Semantic_Relatedness_Dataset_for_Image_Captioning_CVPRW_2023_paper.html
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Reranker ModernBERT comparable: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
