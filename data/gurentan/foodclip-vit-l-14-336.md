# gurentan/Foodclip-vit-L-14-336

## Resumen

FoodClip ViT-L/14-336 es un modelo de recuperación imagen-texto bidireccional especializado en reconocimiento de platos de cocina china. Lo desarrolla el usuario gurentan y parte de Chinese-CLIP ViT-L/14-336 de OFA-Sys, sobre el que se realiza un ajuste fino completo (sin congelar la torre visual) utilizando el conjunto de datos ChineseFoodNet. El resultado se distribuye en formato ONNX fp32, con dos codificadores separados: una torre visual ViT-L/14 a resolución 336x336 y una torre de texto basada en RoBERTa-wwm-ext-base-chinese de 12 capas y 768 dimensiones. Ambos producen embeddings de 768 dimensiones.

El modelo resuelve un problema muy concreto: la búsqueda cruzada entre imágenes de platos y sus nombres en chino dentro del dominio de la cocina china, con 208 categorías cubiertas. Su relevancia radica en la mejora sustancial frente al modelo base en las métricas de recuperación sobre el conjunto de test de ChineseFoodNet, pasando de un R@1 de 69,22% a 84,43% en imagen-a-texto. No es un modelo generativo ni conversacional: es un encoder dual para similitud coseno entre pares imagen-texto.

El repositorio incluye además una base de características precalculadas del conjunto de test (20.310 imágenes y 208 nombres de plato) y un checkpoint PyTorch para reanudar el entrenamiento. La licencia es Apache 2.0, lo que facilita su integración en aplicaciones, aunque el uso de los datos subyacentes queda sujeto a la licencia de ChineseFoodNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder dual CLIP: ViT-L/14@336 (vision) + RoBERTa-wwm-ext-base-chinese 12 capas, 768 dim (texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 52 tokens (texto, padded); imagen 3x336x336 |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos fp32 en ONNX) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX fp32 (dos ficheros: imagen y texto) y checkpoint PyTorch (.pt) |
| Dimension del embedding | 768 (imagen y texto) |
| Opset ONNX | 13 (texto) / 14 (vision) |
| Tamano del repo | 2,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP estándar de dos torres. La torre visual es un Vision Transformer ViT-L/14 con parches de 14x14 y entrada de 336x336 píxeles, que produce una característica de 768 dimensiones sin normalizar. La torre de texto es un RoBERTa-wwm-ext-base-chinese de 12 capas y 768 dimensiones que procesa secuencias de 52 tokens (context_length) y devuelve también un vector de 768 dimensiones. La similitud se calcula mediante producto escalar normalizado (coseno) entre ambas características.

El entrenamiento parte de los pesos preentrenados oficiales `clip_cn_vit-l-14-336.pt` de Chinese-CLIP y realiza un ajuste fino completo sobre ChineseFoodNet, con la torre visual sin congelar. Se emplean 5 épocas (5.665 pasos de optimización), batch 16 con acumulación de gradiente 8 (batch efectivo 128), learning rate 2e-5 con warmup de 100 pasos, weight decay 0.001, AdamW con beta (0,9, 0,98), precisión mixta (AMP) y gradient checkpointing, con semilla 123. Los datos de entrenamiento son 145.065 pares imagen-texto del split de train y 20.253 del split de validación; las etiquetas de texto corresponden a los 208 nombres de plato del dataset, validados contra el ground truth oficial con una coincidencia del 100%. La exportación se hizo mediante tracing de torch 2.3.0 a ONNX fp32 con batch dinámico.

## Capacidades

- Recuperación imagen-a-texto: dada una imagen de un plato, devuelve los nombres de plato más probables en chino mediante similitud coseno.
- Recuperación texto-a-imagen: dado un nombre de plato en chino, recupera las imágenes correspondientes.
- Extracción de embeddings de 768 dimensiones para imágenes y textos, reutilizables para indexación y búsqueda vectorial.
- Clasificación implícita sobre 208 categorías de platos de cocina china.
- Procesamiento de lotes dinámicos (batch dinámico en ambas torres ONNX).
- Ejecución en CPU o GPU mediante onnxruntime (CUDAExecutionProvider / CPUExecutionProvider).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo).
- Capacidad multilingüe limitada al chino; no se ha entrenado para otros idiomas.

## Casos de uso

- Búsqueda visual de platos en aplicaciones de recetas: el usuario sube una foto de un plato y el sistema recupera el nombre y las recetas asociadas usando el embedding de imagen y la base de características precalculada.
- Etiquetado automático de menús y catálogos de restaurantes: se procesan lotes de imágenes de platos y se asignan las 208 categorías cubiertas mediante similitud coseno con los embeddings de texto de los nombres.
- Moderación y organización de contenido culinario: clasificación de imágenes subidas por usuarios en plataformas gastronómicas para su indexación y filtrado por categoría.
- Sistemas de recomendación gastronómica: a partir de una imagen o un nombre de plato, recuperar platos similares usando los embeddings como vectores de características en un motor de búsqueda vectorial.
- Digitalización de recetarios y archivos fotográficos: emparejamiento automático entre fotos de platos y sus denominaciones en chino para construir bases de datos estructuradas.
- Control de calidad en cadenas de restauración: verificación de que la imagen de un plato servido coincide con la categoría declarada, usando el umbral de similitud coseno como criterio.
- Investigación en visión-lenguaje aplicada a gastronomía: el checkpoint PyTorch y la base de características precalculadas permiten reproducir experimentos y hacer ajustes finos adicionales.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de ChineseFoodNet, comparando el modelo base preentrenado con el modelo ajustado:

| Metrica | Chinese-CLIP preentrenado | FoodClip ViT-L/14-336 |
|---|---|---|
| Imagen-a-texto R@1 | 69,22% | 84,43% |
| Imagen-a-texto R@5 | 92,96% | 98,15% |
| Imagen-a-texto R@10 | 96,32% | 99,19% |
| Texto-a-imagen R@1 | 91,35% | 92,31% |
| Texto-a-imagen R@5 | 99,52% | 100% |
| Texto-a-imagen R@10 | 99,52% | 100% |

Durante el entrenamiento, la validación sobre el split oficial (batch=32, precisión intra-lote) alcanzó 88,52% en imagen-a-texto y 89,69% en texto-a-imagen; estas cifras no son directamente comparables con las de recuperación sobre el corpus completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 2,0 GB en fp32 y los dos grafos ONNX se cargan en memoria, por lo que se estima un consumo moderado en GPU, aunque no se han publicado cifras exactas.
- GPU recomendadas: cualquier GPU con soporte CUDA para onnxruntime (por ejemplo, A100, H100, RTX 4090); también funciona en CPU con CPUExecutionProvider.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente VRAM para cargar los dos grafos fp32, aunque no se especifica el mínimo exacto.
- Opciones de despliegue: onnxruntime (CPU o CUDA), con los ficheros `vit-l-14-336.img.fp32.onnx` y `vit-l-14-336.txt.fp32.onnx`; el checkpoint PyTorch `epoch_latest.pt` permite reanudar entrenamiento con cn_clip.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| FoodClip ViT-L/14-336 (este) | no disponible | 52 tokens | zh | Apache 2.0 | ONNX fp32 + PyTorch |
| OFA-Sys/chinese-clip-vit-large-patch14-336px | no disponible | 52 tokens | zh | no disponible en la informacion | PyTorch |
| CLIP original (OpenAI) | no disponible | 77 tokens | en (principalmente) | no disponible en la informacion | PyTorch |

La comparación con CLIP original es solo orientativa: este modelo está especializado en cocina china y no cubre el mismo dominio ni los mismos idiomas. No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido a cocina china: el modelo está ajustado sobre 208 categorías de ChineseFoodNet; los platos fuera de ese conjunto se aproximan a la categoría más cercana, lo que puede producir resultados erróneos.
- Texto limitado a context_length de 52 tokens con padding: solo admite entradas de tipo nombre de plato, no descripciones largas ni conversaciones.
- Sin alineación de seguridad: el autor indica explícitamente que no se ha realizado alineación y que no se recomienda su uso fuera del reconocimiento de platos.
- Riesgo de falsos positivos por similitud coseno: al no ser un clasificador con umbral calibrado, conviene definir umbrales propios para cada aplicación.
- Sesgos derivados del dataset: la distribución de ChineseFoodNet condiciona el rendimiento por clase; no se han publicado análisis de sesgo por subgrupo.
- Uso comercial: la licencia del modelo es Apache 2.0, pero los datos de entrenamiento y evaluación provienen de ChineseFoodNet y su uso queda sujeto a la licencia de dicho dataset y a la cita de su paper.
- Solo se distribuyen pesos fp32 en ONNX; no hay versiones cuantizadas publicadas, lo que limita el despliegue en entornos con restricciones de memoria.
- Idioma único (chino): no se ha validado su comportamiento con nombres de platos en castellano u otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gurentan/Foodclip-vit-L-14-336
- Modelo base Chinese-CLIP ViT-L/14-336: https://huggingface.co/OFA-Sys/chinese-clip-vit-large-patch14-336px
- Repositorio Chinese-CLIP: https://github.com/OFA-Sys/Chinese-CLIP
- Paper Chinese-CLIP (arXiv:2211.01335): https://arxiv.org/abs/2211.01335
- Paper ChineseFoodNet (arXiv:1705.02743): https://arxiv.org/abs/1705.02743
