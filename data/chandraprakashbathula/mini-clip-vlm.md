# ChandraPrakashBathula/MINI-CLIP-VLM

## Resumen

Mini-CLIP (Flickr8k) es un modelo de visión-lenguaje de tipo CLIP entrenado desde cero por ChandraPrakashBathula sobre el conjunto de datos Flickr8k. Combina un codificador de imagen ResNet-18 (inicializado con pesos de ImageNet) con un codificador de texto Transformer pre-LN de solo 2 bloques y 4 cabezas de atención, y proyecta ambas modalidades a una esfera unitaria compartida de 256 dimensiones. Con 13,85 millones de parámetros y un repositorio de 0,1 GB, es dos órdenes de magnitud más pequeño que los CLIP de referencia.

El modelo resuelve tareas de alineación imagen-texto: recuperación imagen→texto y texto→imagen, clasificación de imagen zero-shot y puntuación de similitud entre una foto y una frase. Se entrenó con la pérdida InfoNCE simétrica y temperatura aprendida, y se publica como material didáctico reproducible: el código de modelado (`modeling_mini_clip.py`) se descarga junto a los pesos y no requiere la librería `transformers`.

Su relevancia es acotada pero clara: sirve como referencia mínima, auditable y ejecutable en CPU para estudiar el paradigma contrastivo, el bucle de entrenamiento y la evaluación de recuperación sin necesidad de GPUs ni de datasets a gran escala. No es un sustituto de CLIP en producción: el propio autor lo describe como un modelo de enseñanza, con un vocabulario a nivel de palabra de 3477 entradas y una accuracy zero-shot de temática del 58,1 % frente al 11,1 % de azar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Doble codificador: ResNet-18 (imagen, inicialización ImageNet) + Transformer pre-LN de 2 bloques y 4 cabezas (texto), proyección a espacio compartido de 256 dimensiones |
| Parámetros totales | 13.861.568 (13,85 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados sin variantes cuantizadas) |
| Idiomas soportados | No disponible; el vocabulario es a nivel de palabra (3477 palabras) y presumiblemente inglés, derivado de los captions de Flickr8k |
| Licencia | MIT |
| Formato de pesos | Safetensors, con código de modelado propio (`modeling_mini_clip.py`) y librería PyTorch |
| Dimensión de embedding | 256 (esfera unitaria compartida) |
| Temperatura | Aprendida; 0,07 inicial → 0,036 final |
| Pipeline declarado | `zero-shot-image-classification` |
| Dataset de entrenamiento | `jxie/flickr8k` (aproximadamente 6.000 fotos) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un CLIP en miniatura de dos torres. La torre visual es una ResNet-18 escrita a mano e inicializada con pesos de ImageNet; la torre textual es un Transformer pre-LN de 2 bloques y 4 cabezas sobre un vocabulario a nivel de palabra de 3477 entradas (las palabras no vistas se mapean a `[UNK]`). Ambas torres proyectan a un espacio latente de 256 dimensiones normalizado a norma unitaria, de modo que la similitud coseno entre imagen y texto es directamente interpretable como probabilidad tras aplicar la temperatura.

El entrenamiento usó la pérdida InfoNCE simétrica, `(L_i2t + L_t2i)/2`, con temperatura aprendida. Hiperparámetros: 20 épocas, batch 128, AdamW con lr 0,0003 (el codificador CNN con lr ×0,1), weight decay 0,05, warm-up de 1 época seguido de decaimiento coseno, precisión mixta automática (AMP) y recorte de gradiente de norma 1,0. La aumentación de imagen consistió en random resized crop con escala 0,6–1,0 y color jitter, sin flip horizontal; en cada época se muestreó uno de los cinco captions disponibles por foto. No se documenta uso de RLHF ni de DPO, algo esperable en un modelo contrastivo de este tipo.

## Capacidades

- Recuperación imagen→texto: ranking de captions candidatos para una imagen dada, con R@1 del 23,4 % en el split de test de Flickr8k.
- Recuperación texto→imagen: ranking de imágenes candidatas para una consulta textual, con R@1 del 17,3 %.
- Clasificación zero-shot de imagen: puntuación de similitud entre una imagen y un conjunto de etiquetas o frases descriptivas (58,1 % de accuracy en la prueba de temática por palabra clave).
- Puntuación de similitud imagen-texto: la API `model.similarity(imagenes, textos, tokenizer)` devuelve similitudes coseno y probabilidades normalizadas.
- Extracción de embeddings multimodales de 256 dimensiones, útiles para indexación vectorial y búsqueda semántica a pequeña escala.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: no es un modelo generativo de instrucciones.
- No dispone de capacidades de visión generativa, audio ni vídeo; la entrada visual es una única imagen y la salida es un vector, no texto libre.

## Casos de uso

- Docencia y reproducción de investigación en aprendizaje contrastivo: el modelo entrena y ejecuta en CPU, y el código de arquitectura se descarga junto a los pesos, lo que permite inspeccionar cada capa y modificar la pérdida sin infraestructura especial.
- Búsqueda semántica de imágenes en un archivo personal pequeño: indexar los embeddings de 256 dimensiones de unas pocas miles de fotos y recuperar por consulta textual; el coste de almacenamiento es de aproximadamente 1 KB por imagen en fp32.
- Etiquetado asistido de imágenes: puntuar un conjunto cerrado de etiquetas contra cada foto y usar el ranking como sugerencia para revisión humana, aprovechando la evaluación zero-shot de temática.
- Filtrado y curación de datasets: calcular la similitud entre imágenes y sus captions para detectar pares mal alineados antes de entrenar un modelo mayor.
- Prototipado de interfaces de recuperación multimodal: validar la lógica de un buscador imagen-texto (ranking, umbrales, normalización) con un modelo de 0,1 GB antes de migrar a un CLIP de producción.
- Benchmark de referencia interno: línea base ligera para comparar contra modelos propios en las mismas métricas de recuperación sobre Flickr8k, sin incurrir en costes de GPU.
- Demostraciones educativas de medición de sesgos: analizar qué vocabulario del corpus Flickr8k domina las predicciones y cómo se comporta `[UNK]` ante términos fuera del vocabulario.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test de Flickr8k (1000 fotos × 5000 captions):

| Tarea | R@1 (%) | R@5 (%) | R@10 (%) | Rango mediano |
|---|---|---|---|---|
| Imagen → texto | 23,4 | 50,8 | 64,2 | 5 |
| Texto → imagen | 17,3 | 43,1 | 56,9 | 7 |

| Métrica adicional | Valor |
|---|---|
| Accuracy zero-shot de temática por palabra clave | 58,1 % (azar: 11,1 %) |
| Temperatura aprendida | 0,07 → 0,036 |
| Parámetros | 13,85 M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones directas con otros modelos en las mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55 MB en fp32 y 28 MB en fp16 para los pesos; el consumo real de memoria lo dominan las activaciones de la ResNet-18 y el batch, no el modelo.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria; el modelo es funcionalmente indistinguible en velocidad entre una RTX 4090, una A100 o una H100, que estarán desaprovechadas.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) y también en CPU: 13,85 M de parámetros permiten inferencia interactiva en un portátil.
- Opciones de despliegue: el modelo no se carga con `transformers`, `vLLM`, `TGI` ni `llama.cpp`. El camino previsto es `huggingface_hub.hf_hub_download` del fichero `modeling_mini_clip.py`, carga dinámica con `importlib` y ejecución con PyTorch; puede servirse envolviéndolo en un endpoint propio (FastAPI, TorchServe) o exportarse a TorchScript/ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por lote pequeño en GPU y de decenas de milisegundos en CPU, sin cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto text encoder | Licencia | Disponibilidad | Resultados en Flickr8k |
|---|---|---|---|---|---|
| Mini-CLIP (Flickr8k) | 13,85 M | No disponible | MIT | HuggingFace, código propio | R@1 i2t 23,4 % / t2i 17,3 % |
| CLIP ViT-B/32 (OpenAI) | ~151 M | 77 tokens | MIT | HuggingFace, `transformers`, OpenCLIP | No disponible en la información proporcionada |
| OpenCLIP ViT-B/32 (LAION) | ~151 M | 77 tokens | MIT (según checkpoint) | OpenCLIP, HuggingFace | No disponible en la información proporcionada |
| SigLIP Base (Google) | ~203 M (ViT-B) | 64 tokens | Apache 2.0 (versión abierta) | HuggingFace, `transformers` | No disponible en la información proporcionada |

La comparación relevante es de escala y propósito, no de rendimiento: Mini-CLIP es aproximadamente diez veces menor que un ViT-B/32 y se entrenó sobre unas 6.000 imágenes frente a los cientos de millones de pares de los CLIP de referencia, por lo que su calidad de recuperación no es directamente comparable.

## Limitaciones y advertencias

- Modelo de enseñanza, no de propósito general: el propio autor lo califica así; entrenado sobre aproximadamente 6.000 fotos, su generalización fuera del dominio Flickr8k es muy limitada.
- Sesgos del corpus: Flickr8k contiene fotos cotidianas en su mayoría en inglés y con una distribución demográfica y geográfica concreta; el modelo heredará esos sesgos en las similitudes que produzca.
- Vocabulario cerrado de 3477 palabras a nivel de palabra: cualquier término fuera de vocabulario se convierte en `[UNK]`, lo que degrada gravemente las consultas con jerga, morfología derivada, nombres propios o cualquier idioma distinto del inglés.
- Riesgo de recuperación espuria: con R@1 del 23,4 % (imagen→texto) y del 17,3 % (texto→imagen), más de tres cuartas partes de las primeras posiciones son incorrectas; no debe usarse sin revisión humana en flujos automatizados.
- Sin datos sobre longitud máxima de secuencia del codificador de texto, por lo que se desconoce el comportamiento con captions largos.
- El código requiere `importlib` y ejecución de un fichero Python descargado del repositorio; conviene auditar `modeling_mini_clip.py` antes de cargarlo en entornos de producción, ya que implica ejecución de código remoto.
- Restricciones de licencia: los pesos son MIT, pero Flickr8k está declarado por el autor como de uso exclusivamente de investigación; conviene verificar los términos del dataset antes de cualquier uso comercial derivado.
- Sin variantes cuantizadas publicadas (GGUF, ONNX, int8), lo que limita el despliegue en runtimes que no sean PyTorch.
- Sin datos de benchmarks estándar ni evaluación multilingüe; no debe asumirse ninguna capacidad fuera del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChandraPrakashBathula/MINI-CLIP-VLM
- Dataset Flickr8k en HuggingFace: https://huggingface.co/datasets/jxie/flickr8k
- Paper original de CLIP (referencia del paradigma): https://arxiv.org/abs/2103.00020
- Repositorio OpenCLIP (alternativa para modelos contrastivos): https://github.com/mlfoundations/open_clip
- Documentación de `huggingface_hub` para descarga de ficheros: https://huggingface.co/docs/huggingface_hub
