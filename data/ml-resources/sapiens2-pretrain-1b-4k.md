# ml-resources/sapiens2-pretrain-1b-4k

## Resumen

Sapiens2-1B-4K es un backbone de visión por transformer (ViT) de 1.607 mil millones de parámetros desarrollado por Meta, preentrenado sobre 1.000 millones de imágenes de personas. Forma parte de la familia Sapiens2, diseñada específicamente para tareas centradas en el ser humano: estimación de pose, segmentación de partes del cuerpo, estimación de normales de superficie y predicción de pointmaps. Esta variante concreta se entrena a resolución 4K (4096 × 3072, alto × ancho) e incorpora un tokenizador de ventana en la entrada para mantener manejable el número de tokens.

El repositorio analizado (`ml-resources/sapiens2-pretrain-1b-4k`) es un espejo no oficial de `facebook/sapiens2-pretrain-1b-4k`, con la licencia original intacta. No es un modelo generativo ni un modelo de lenguaje: es un extractor de características densas por parche, pensado para servir como base de fine-tuning de cabezas de tarea o como extractor de features en pipelines de análisis de imagen a alta resolución.

Su relevancia actual reside en que el preentrenamiento a 4K con un volumen de datos de mil millones de imágenes humanas es poco habitual en modelos abiertos de visión. El checkpoint se distribuye en safetensors (6,7 GB de repositorio) y requiere instanciar el modelo con `use_tokenizer=True` y tensores de entrada de forma `(B, 3, 4096, 3072)`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT (RoPE, GQA, SwiGLU, RMSNorm, QK-norm) + window tokenizer |
| Parametros totales | 1,607 B |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No aplica (modelo de visión). Resolución de entrada: 4096 × 3072 (H × W) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye checkpoint en safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | Sapiens2 License (`license: other`, `license_name: sapiens2-license`) |
| Formato de pesos | safetensors (`sapiens2_1b_4k_pretrain.safetensors`) |
| Dimension de embedding | 1536 |
| Capas | 40 |
| Cabezas de atencion | 24 |
| Patch size | 16 |
| Window size | 4 |
| FLOPs | No disponible para esta variante (la variante Sapiens2-1B base declara 4,715 T) |
| Resolucion de preentrenamiento | 4096 × 3072 (H × W) |
| Datos de preentrenamiento | 1.000 millones de imagenes humanas |
| Tamano del repositorio | 6,7 GB |
| Libreria | `sapiens` |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de arquitectura Sapiens2 con 1536 dimensiones de embedding, 40 capas y 24 cabezas de atención. Incorpora varias técnicas habituales en transformers modernos: codificaciones posicionales rotatorias (RoPE), atención con consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y QK-norm. La innovación específica de esta variante es un front-end de tokenizador de ventana (`use_tokenizer=True`, window size 4) que reduce el número de tokens tratables cuando la entrada es una imagen de 4096 × 3072 con parches de 16 × 16, lo que de otro modo generaría 49.152 parches por imagen.

El preentrenamiento se realizó sobre 1.000 millones de imágenes humanas, según la model card del autor. No se documentan en la información disponible el número total de tokens de imagen procesados, la composición detallada del dataset, ni si se aplicaron etapas de alineación tipo RLHF o DPO (procedimientos, por otra parte, no habituales en backbones de visión). La salida del modelo son características densas por parche sobre la imagen de entrada, no predicciones de una tarea concreta: se trata de un checkpoint de preentrenamiento pensado para ser especializado posteriormente.

## Capacidades

- Extracción de características densas por parche a resolución 4K (4096 × 3072), con normalización ImageNet recomendada en la entrada.
- Actuación como backbone preentrenado para inicializar el fine-tuning de cabezas de tarea centradas en humanos.
- Soporte declarado para tareas posteriores de estimación de pose, segmentación de partes del cuerpo, estimación de normales de superficie y pointmaps (a través de los checkpoints de tarea de la colección Sapiens2).
- Procesamiento de imágenes RGB en lotes (`B, 3, 4096, 3072`).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, ni de entrada o salida de audio, ni de generación de texto o imagen.

## Casos de uso

- Extracción de características a alta resolución en pipelines de análisis humano: el modelo acepta directamente tensores de 4096 × 3072 y devuelve features densas por parche, lo que evita reescalar la imagen y perder detalle fino en regiones pequeñas como manos o rostro.
- Inicialización de modelos de estimación de pose: se carga el checkpoint y se añade una cabeza de regresión de keypoints, aprovechando que el backbone ya ha visto mil millones de imágenes de personas.
- Segmentación de partes del cuerpo: las features densas por parche son la entrada natural de una cabeza de segmentación semántica o de partes, útil en aplicaciones de edición, prueba virtual de ropa o análisis deportivo.
- Estimación de normales de superficie: la información de alta frecuencia que conserva el procesamiento a 4K es relevante para reconstruir orientación de superficie en rostro, manos y pliegues de ropa.
- Predicción de pointmaps y reconstrucción 3D de cuerpos: el backbone puede alimentar cabezas que estiman coordenadas 3D por píxel, con aplicación en captura de movimiento sin marcadores y avatares.
- Investigación académica en visión centrada en humanos a alta resolución: sirve como punto de comparación reproducible frente a backbones de propósito general, al ser un checkpoint abierto con arquitectura y escala documentadas.
- Preprocesado de datasets de imagen de personas: extracción por lotes de embeddings para indexado, búsqueda por similitud o agrupamiento (clustering) de grandes colecciones de imágenes.
- Base para modelos de reidentificación o análisis biométrico de cuerpo completo, siempre que la licencia y la normativa aplicable lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Como referencia de escala y coste computacional, la model card del autor publica los siguientes datos para la familia Sapiens2:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.1B | 0,114 B | 0,342 T | 768 | 12 | 12 |
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K (este) | 1,607 B | No disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

## Requisitos de hardware

- No se documentan requisitos oficiales de VRAM, GPU recomendadas, latencia ni throughput en la información disponible.
- Estimación derivada del tamaño del checkpoint: el repositorio ocupa 6,7 GB, coherente con 1,607 B de parámetros almacenados en precisión de 32 bits (unos 6,4 GB); en bfloat16 o float16 la huella de pesos bajaría aproximadamente a 3,2 GB. Esta cifra no incluye activaciones.
- La memoria de activaciones es el factor dominante en esta variante: con parches de 16 × 16 sobre una entrada de 4096 × 3072 se generan 49.152 parches por imagen antes de aplicar el tokenizador de ventana, por lo que la inferencia a resolución completa exige GPU de centro de datos (A100, H100 o equivalentes) salvo que se reduzca la resolución de entrada o se procese por ventanas.
- No se dispone de datos que permitan confirmar el funcionamiento en GPU de consumo (por ejemplo, RTX 4090) a 4K con lotes mayores de uno.
- Opciones de despliegue: el modelo se carga mediante la librería `sapiens` (`pip install -e .` sobre el repositorio de código oficial), construyendo el modelo con `arch="sapiens2_1b"`, `img_size=(4096, 3072)`, `patch_size=16` y `use_tokenizer=True`, y cargando el checkpoint con `safetensors.torch.load_file`.
- No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; estos frameworks están orientados a modelos de lenguaje y no cubren este backbone de visión según la información disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar dentro de la propia familia Sapiens2. No se dispone de datos de rendimiento de modelos externos comparables.

| Modelo | Parametros | Resolucion de preentrenamiento | FLOPs | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sapiens2-1B-4K (este) | 1,607 B | 4096 × 3072 | No disponible | Sapiens2 License | HuggingFace (oficial y espejo) |
| Sapiens2-1B | 1,462 B | No disponible en la informacion | 4,715 T | Sapiens2 License | HuggingFace |
| Sapiens2-0.8B | 0,818 B | No disponible en la informacion | 2,592 T | Sapiens2 License | HuggingFace |
| Sapiens2-5B | 5,071 B | No disponible en la informacion | 15,722 T | Sapiens2 License | HuggingFace |

## Limitaciones y advertencias

- La licencia es `other` (Sapiens2 License). No se detallan en la información proporcionada los términos exactos de uso comercial, por lo que es obligatorio revisar `LICENSE.md` en el repositorio oficial antes de cualquier despliegue en producción.
- El repositorio `ml-resources/sapiens2-pretrain-1b-4k` es un espejo no oficial; no cuenta con el respaldo de los autores originales. Para uso en producción conviene referenciar el repositorio oficial `facebook/sapiens2-pretrain-1b-4k`.
- El modelo no es generativo y no produce texto: no puede "alucinar" en el sentido lingüístico, pero sí puede generar características o predicciones aguas abajo poco fiables en regiones ocluidas, con iluminación extrema o en cuerpos parcialmente fuera de encuadre.
- Al estar preentrenado con 1.000 millones de imágenes humanas, es esperable un sesgo demográfico, de vestimenta, de contexto cultural y de condiciones de captura heredado del dataset. La información disponible no documenta análisis de sesgo ni composición demográfica.
- La variante 4K exige obligatoriamente `use_tokenizer=True` y tensores de entrada de forma `(B, 3, 4096, 3072)`; usarla con otras resoluciones o sin tokenizador puede producir resultados incorrectos o fallos.
- El coste computacional a resolución completa es elevado y no está cuantificado en la información disponible; conviene medirlo antes de dimensionar infraestructura.
- No se documentan idiomas, idiomas de las anotaciones ni capacidades multilingües porque el modelo no procesa texto.
- Los checkpoints de tareas concretas (pose, segmentación, normales, pointmaps) son artefactos separados dentro de la colección Sapiens2; este repositorio solo contiene el backbone preentrenado y no resuelve esas tareas por sí solo.

## Enlaces

- Repositorio analizado (espejo no oficial): https://huggingface.co/ml-resources/sapiens2-pretrain-1b-4k
- Repositorio oficial: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo: https://github.com/facebookresearch/sapiens2
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante Sapiens2-0.1B: https://huggingface.co/facebook/sapiens2-pretrain-0.1b
- Variante Sapiens2-0.4B: https://huggingface.co/facebook/sapiens2-pretrain-0.4b
- Variante Sapiens2-0.8B: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Variante Sapiens2-1B: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante Sapiens2-5B: https://huggingface.co/facebook/sapiens2-pretrain-5b
