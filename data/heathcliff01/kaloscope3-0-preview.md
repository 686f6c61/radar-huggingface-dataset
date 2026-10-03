# heathcliff01/Kaloscope3.0-preview

## Resumen

Kaloscope 3.0 Preview es un modelo de representación visual y recuperación de imágenes orientado específicamente a ilustración de estilo anime. Lo desarrolla el usuario de HuggingFace heathcliff01 y se apoya en el backbone DINOv3 ViT-B/16 con pesos preentrenados LVD-1689M, sobre el que se añade una cabeza de proyección que genera vectores de 256 dimensiones listos para indexar en un sistema de búsqueda por similitud coseno.

El problema que resuelve es el de la búsqueda de ilustraciones parecidas y la propuesta de ilustradores candidatos a partir de una imagen de referencia, sin necesidad de una cabeza de clasificación cerrada. Frente a Kaloscope 2.0, basado en LSNet y con salida de probabilidades sobre un conjunto fijo de artistas, la versión 3.0 adopta aprendizaje de similitud: permite vectorizar galerías nuevas y ampliar un índice de recuperación sin reentrenar el modelo.

El modelo tiene 88.423.938 parámetros (~88,42 M, incluyendo temperatura y sesgo entrenables), recibe imágenes RGB de 512×512 píxeles y devuelve un tensor de 1792 dimensiones en el que las primeras 1536 corresponden al backbone y las 256 últimas al vector de proyección recomendado para recuperación. Se distribuye bajo licencia DINOv3 y su publicación es una versión preliminar ("preview") correspondiente al paso 46.000 del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer DINOv3 ViT-B/16 con cabeza de proyección MLP (Linear 1536→1536 → GELU → Linear 1536→256) |
| Parametros totales | 88.423.938 (~88,42 M), incluye temperatura y sesgo entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada fija de 512×512 px, equivalente a 1025 tokens de parche con patch size 16) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No procesa texto. La model card está redactada en chino (etiqueta de idioma `zh`); el modelo opera sobre imágenes |
| Licencia | DINOv3 License (`license: other`, `license_name: dinov3`) |
| Formato de pesos | Checkpoint PyTorch `.pt` (`best.pt`) con claves `model_config` y `model`; no se publican safetensors |
| Dimension de salida | 1792 (1536 backbone + 256 proyección); el vector recomendado para recuperación es el de 256 dimensiones, normalizado L2 |
| Representacion del backbone | Concatenación del token CLS y la media de los tokens de parche, 1536 dimensiones |
| Entrada | RGB, escalado proporcional del lado corto a 512 y recorte central a 512×512; normalización ImageNet interna |
| Cabeza de clasificacion | Ninguna |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura parte de un ViT-B/16 de DINOv3 (12 bloques Transformer, dimensión de embedding 768) y añade una cabeza de proyección lineal de 1536 a 1536 con activación GELU y una segunda capa lineal de 1536 a 256. Durante el ajuste fino solo se entrenan los cuatro últimos bloques Transformer (8 a 11) y la capa de normalización final, además de la cabeza de proyección. La pérdida es una sigmoid loss por pares con temperatura y sesgo aprendibles: `sum_valid_pairs softplus(-y_ij * (temperature * cosine(z_i, z_j) + bias)) / global_batch`, calculada sobre el batch global. No se emplearon CE, VICReg, Gram Anchoring ni EMA en esta configuración de ajuste.

El entrenamiento utilizó un dataset local Danbooru2026 ya filtrado y deduplicado, con división por familias de obras, sumando 6.569.159 imágenes. La supervisión proviene de etiquetas de artista único ya existentes, fecha de publicación y agrupación por año, sin etiquetas generadas ni imágenes sintéticas. Se definen como pares positivos los del mismo artista con fecha de publicación a menos de 365 días y pertenecientes a familias de obra distintas; como negativos, los de artistas únicos diferentes y familias de obra distintas. Se ignoran la propia imagen, la misma familia de obra y los pares del mismo artista separados por más de 365 días. El muestreo combina recorrido completo del dataset (mitad de los anclas) con muestreo equilibrado por artista y grupo de año (otra mitad), y la relación positivo/negativo se determina por la diferencia temporal entre imágenes.

La infraestructura fue de 8 GPU NVIDIA H100 de 80 GB en precisión mixta BF16, con batch de 256 por tarjeta y un pool global real de 2048 pares, optimizador AdamW, learning rates de 2e-5 (backbone), 2e-4 (cabeza de proyección) y 1e-3 (temperatura y sesgo), weight decay 0,05, recorte de gradiente 1,0, 1000 pasos de warmup y semilla 20261004. La selección de checkpoint se hizo con Hit@10 temporal macro-promediado por artista en el conjunto de desarrollo; el entrenamiento se detuvo por meseta en el paso 52.000 tras unas 32 horas, y el checkpoint publicado es el mejor, del paso 46.000.

## Capacidades

- Extracción de características de imagen: genera un vector de 256 dimensiones (más un vector de backbone de 1536) para cualquier imagen RGB de 512×512.
- Recuperación de imágenes por similitud: ordenación por similitud coseno sobre vectores normalizados L2, adecuada para índices de galería.
- Búsqueda de referencias visuales y estilísticas en ilustración de estilo anime, incluyendo coincidencia dentro de una galería anotada.
- Propuesta de artistas candidatos a partir de una imagen de consulta, siempre que exista una galería con etiquetas de artista y se agreguen los resultados por similitud.
- Recuperación temporal: el objetivo de entrenamiento incorpora la proximidad temporal (ventana de 365 días), lo que permite buscar obras del mismo artista en periodos cercanos.
- No dispone de cabeza de clasificación, tool calling, function calling ni capacidades de agente; no genera texto ni imágenes.
- No procesa lenguaje natural: no hay capacidades multilingües en el sentido textual, solo la etiqueta de idioma `zh` de la model card.
- No se documentan interfaces para ComfyUI, IP-Adapter ni nodos de versiones anteriores; la integración requiere código propio con el módulo `dinov3.finetune.temporal.model.Encoder`.

## Casos de uso

- Búsqueda de ilustraciones similares en una plataforma de arte: se vectorizan todas las obras de la galería con el vector de 256 dimensiones y se responde a una consulta ordenando por similitud coseno; el índice puede ampliarse con obras nuevas sin reentrenar nada, algo que la versión 2.0 basada en clasificador no permitía.
- Sugerencia de ilustradores candidatos: dada una imagen de referencia, se recuperan las obras más similares y se agregan sus etiquetas de artista para proponer una lista de candidatos; el autor advierte que la similitud no es una probabilidad calibrada y que el resultado depende de la cobertura de la galería.
- Curación y deduplicación de datasets de ilustración: los vectores permiten agrupar obras muy próximas en el espacio de representación para detectar duplicados o familias de obras, algo útil para evitar fugas entre particiones de entrenamiento y evaluación en proyectos propios.
- Seguimiento de la evolución estilística de un artista: la métrica temporal Hit@10, definida sobre pares del mismo artista a menos de 365 días, está alineada con la tarea de localizar obras de una misma etapa creativa, útil en estudios de catálogo o archivo.
- Sistemas de recomendación tipo "más de este artista" o "parecido a esta obra": integrable en aplicaciones de galería, escritorio o herramientas creativas mediante el servidor de inferencia propio del proyecto, siempre que se gestione el índice de vectores por versión de modelo.
- Construcción de características para clasificadores posteriores: al no tener cabeza de clasificación, los 1536 o 256 valores pueden alimentar un clasificador de estilos, etiquetas o temáticas entrenado por el usuario sobre su propio conjunto de datos.
- Investigación sobre representación de estilo visual: el modelo es un caso de ajuste fino con supervisión débil temporal sobre DINOv3, útil para experimentos de probing, comparación de espacios de representación y análisis de sesgo hacia la identidad del artista.

## Benchmarks y rendimiento

Resultados publicados por el autor para el paso 46.000, usando el vector de proyección de 256 dimensiones con normalización L2 y ordenación por similitud coseno.

| Metrica | Kaloscope 3.0 Preview (paso 46000) | Backbone DINOv3 ViT-B/16 sin ajustar |
|---|---:|---:|
| Recuperación de artista Top-1, galería convencional | 95,23 % | 31,85 % |
| Recuperación de artista Top-1, galería cross-content | 83,29 % | 10,38 % |
| Hit@10 temporal, galería convencional | 96,50 % | no disponible |
| Hit@1 temporal, cross-content | 60,86 % | no disponible |
| Hit@10 temporal macro-promediado por artista, cross-content (métrica de selección) | 87,78 % | 18,18 % |

Contexto de evaluación facilitado en la model card: galería de 16.217 imágenes proveniente del conjunto de entrenamiento; 1.972 consultas válidas en la evaluación convencional, cubriendo 512 artistas vistos en entrenamiento; 1.137 consultas válidas en la evaluación cross-content, cubriendo 365 artistas, con consultas y candidatas sin intersección de etiquetas de personaje ni de obra. La comparación con el backbone original es entre características sin ajustar y características proyectadas tras ajuste, con dimensiones distintas. El 5 % reservado como conjunto de test sellado no se utilizó en estas evaluaciones.

## Requisitos de hardware

- VRAM de inferencia: no hay medición publicada por el autor. Como referencia derivada del tamaño del modelo, los pesos ocupan aproximadamente 354 MB en FP32 y 177 MB en FP16/BF16; el consumo real depende del tamaño de lote y de las activaciones a 512×512, no cuantificado en la model card.
- GPU recomendadas: cualquier GPU con soporte CUDA capaz de ejecutar ViT-B/16 a 512×512; el entrenamiento se realizó en 8× NVIDIA H100 de 80 GB, pero la inferencia es mucho menos exigente.
- GPU de consumo: por número de parámetros (88,42 M) y resolución de entrada, es previsible que quepa en GPU de consumo con 8 GB o más, si bien esto no está verificado en la documentación publicada.
- Entorno verificado: PyTorch 2.11.0+cu128 con el archivo `best.pt` real, entrada `[1,3,512,512]`, salida `[1,1792]`, vector de proyección `[1,256]` con norma 1 tras normalizar.
- Opciones de despliegue: uso mediante el módulo propio `dinov3.finetune.temporal.model.Encoder` del repositorio kaloscope-dinov3, con dependencias numpy, Pillow, omegaconf y torch/torchvision. No es compatible con pipelines genéricos de clasificación de `transformers`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje), ni exportación a ONNX o TensorRT.
- Latencia y throughput: no disponibles; el autor indica expresamente que el retardo de inferencia y la memoria de despliegue no se han medido de forma independiente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Salida | Tarea | Licencia | Metrica publicada |
|---|---|---|---|---|---|---|
| Kaloscope 3.0 Preview | DINOv3 ViT-B/16 + cabeza de proyección | 88,42 M | Vector de 256 dim (recuperación) y 1536 dim (backbone) | Recuperación de imágenes y artistas candidatos | DINOv3 License | Top-1 de artista 95,23 % (galería convencional); Hit@10 temporal cross-content macro 87,78 % |
| DINOv3 ViT-B/16 (LVD-1689M) | ViT-B/16 | no disponible en la información proporcionada | Vector de backbone | Representación visual general | DINOv3 License | Top-1 de artista 31,85 %; cross-content 10,38 %; Hit@10 temporal cross-content macro 18,18 % en el mismo panel |
| Kaloscope 2.0 | LSNet con cabeza de clasificación | no disponible en la información proporcionada | Probabilidades sobre clases fijas de artista | Clasificación cerrada de artistas | no disponible en la información proporcionada | 90,13 % de Top-1 de clasificación (métrica no comparable con las anteriores) |

Las cifras de Kaloscope 2.0 y 3.0 no son comparables entre sí: corresponden a datos, rangos de clases y tareas distintos (clasificación frente a recuperación con galería fija), tal como advierte el propio autor. No se dispone de datos verificados de alternativas de recuperación de imágenes de estilo anime para ampliar la comparación.

## Limitaciones y advertencias

- Sesgo hacia la identidad del artista: el objetivo de entrenamiento usa "mismo artista y fecha próxima" como señal débil de estilo, no una etiqueta verificada de estilo similar. Artistas distintos con estilos parecidos pueden no recuperarse bien.
- Confusión entre estilo y contenido: el modelo puede apoyarse en paleta, temática y composición; la evaluación cross-content solo restringe parcialmente esa mezcla y el autor no afirma haber desacoplado estilo y contenido.
- Dependencia de la galería: sin una galería anotada no hay propuesta de artistas. La cobertura de la galería determina directamente la calidad del resultado.
- Similitud no calibrada: los valores de similitud coseno no son probabilidades de artista ni de estilo; los umbrales de rechazo y las reglas de agregación de varias referencias deben validarse sobre datos reales de cada negocio.
- Riesgo de atribución errónea: el modelo no debe usarse para determinar de forma concluyente la autoría de una obra.
- Sin conjunto de test independiente: el 5 % sellado no se usó; las métricas publicadas provienen del conjunto de desarrollo y participaron en la selección de checkpoint y en la parada temprana, por lo que no equivalen a resultados en test independiente ni garantizan generalización a artistas no vistos.
- Dominio limitado: no se validaron fotografías, diseños gráficos, páginas de manga, recortes agresivos, entradas en escala de grises ni estilos poco frecuentes. El recorte central puede eliminar contenido de imágenes con relaciones de aspecto extremas.
- Idiomas: no procesa texto, por lo que la etiqueta `zh` se refiere únicamente a la documentación; no hay capacidades lingüísticas que evaluar.
- Compatibilidad de versiones: los vectores generados por versiones distintas del modelo no son intercambiables; hay que reconstruir el índice al cambiar de versión.
- Ausencia de componentes publicados: no hay cabeza de clasificación de artistas entrenada de forma independiente, modelo generativo, interfaz IP-Adapter ni compatibilidad con nodos de ComfyUI de la versión 2.0.
- Licencia: el uso y la redistribución se rigen por la DINOv3 License, que hay que revisar antes de un despliegue comercial; los derechos sobre las imágenes de entrenamiento no se transfieren con el modelo.
- Seguridad al cargar el checkpoint: el ejemplo oficial emplea `torch.load(..., weights_only=False)`, por lo que solo deben cargarse archivos de confianza, ya que un `.pt` puede contener estado de optimizador y RNG además de los pesos.
- Reproducibilidad: el propio autor advierte que las cifras de la versión anterior no permiten calcular una mejora respecto a esta, dado el cambio de tarea y de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heathcliff01/Kaloscope3.0-preview
- Repositorio de código kaloscope-dinov3: https://github.com/Chenkin-x/kaloscope-dinov3 (versión de referencia de la documentación: `95ade97`)
- Modelo anterior Kaloscope 2.0: https://huggingface.co/heathcliff01/Kaloscope2.0
- Métricas de selección de modelo: `evaluation.json` en el repositorio del modelo (https://huggingface.co/heathcliff01/Kaloscope3.0-preview/blob/main/evaluation.json)
- Verificación de inferencia: `inference_verification.json` en el repositorio del modelo (https://huggingface.co/heathcliff01/Kaloscope3.0-preview/blob/main/inference_verification.json)
- Licencia del modelo: `LICENSE.md` en el repositorio del modelo (https://huggingface.co/heathcliff01/Kaloscope3.0-preview/blob/main/LICENSE.md)
- Licencia oficial DINOv3 de Meta: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Repositorio oficial de DINOv3: https://github.com/facebookresearch/dinov3
- Artículo de DINOv3: https://arxiv.org/abs/2508.10104

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
