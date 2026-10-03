# MC7ever/pe-single-L14

## Resumen

pe-single-L14 es un codificador de percepción multimodal de un solo archivo desarrollado por el usuario MC7ever. No es un modelo entrenado desde cero: es el resultado de fusionar por media ponderada de pesos cuatro miembros de la familia Meta Perception Encoder (PE-AV base, PE A-Frame base, PE-Core-L14-336 y PE-Spatial-L14-448) en un unico checkpoint de 1.033.701.580 parametros. El modelo proyecta audio, imagen/video y texto a un espacio de embedding conjunto de 1024 dimensiones, y su pipeline declarado es `feature-extraction`, no generacion.

La relevancia tecnica del tag esta en la eleccion de escala: los modelos PE-Core y PE-Spatial de escala G14 usan anchura 1536 y 50 capas, mientras que PE-AV y PE-A-Frame usan anchura 1024, de modo que sus tensores no son promediables entre si. La escala L/14 (anchura 1024, 24 capas, patch 14) es el punto donde los troncos de Core, Spatial y AV-video comparten anchura, profundidad y patch, lo que permite una fusion real de pesos y no solo un ensemble en inferencia.

El autor certifica el tag como congelado (estado "CERTIFIED" del 2026-10-03) tras una busqueda en rejilla 3x3, una evolucion de 18 genomas y validacion sobre slice completo. La conclusion declarada es que la fusion preserva la calidad del modelo ancla (PE-AV base) y sirve como inicializacion congelada para un futuro ajuste fino de alineacion, pero no supera por si sola al ancla en los benchmarks medidos. El repositorio tiene 14 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de codificacion (torre de audio + tronco de vision + proyecciones de texto) con pesos fusionados por media ponderada; anchura 1024, 24 capas, patch 14 |
| Parametros totales | 1.033.701.580 (dato real de safetensors, ~1,03 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`, repositorio de 4,1 GB) |

## Arquitectura y entrenamiento

El modelo es una fusion estatica de pesos, no un entrenamiento. La construccion declarada sigue tres pasos: (1) la torre de audio se obtiene como media de sufijos mapeados por forma exacta entre AV-audio y A-Frame-audio (ambas `pe_audio_encoder`, configuracion 1024/16 capas/8 cabezas, con 422 de 422 tensores emparejados); (2) el tronco de video se construye con un mapeo explicito de claves nativo-PE a timm (patch_embed, cls_token, pos_embed a 336 px, normalizaciones, QKV y MLP en 24 bloques), conservando pool, head y proyeccion del ancla; (3) los pesos de mezcla se seleccionan mediante una busqueda en rejilla 3x3 medida sobre slices de retrieval en COCO y ESC-50, no por criterio subjetivo.

Los pesos finales son: PE-AV base como esqueleto completo (ancla), PE A-Frame base como donante de la torre de audio con peso 0,25, PE-Core-L14-336 como copia de inicializacion del tronco de vision (efecto practicamente nulo, segun el autor "~no-op") y PE-Spatial-L14-448 con peso 0,0 en este tag porque degradaba monotonamente la alineacion COCO t2i (0,766 a 0,64). No se documenta entrenamiento con RLHF, DPO ni SFT, ni volumen de tokens ni composicion de dataset de entrenamiento. Las innovaciones declaradas son de metodologia de fusion: mapeo por nombre de parametro con `copy_` para evitar no-ops silenciosos, clones pristinos para evitar contaminacion entre builds y mapeo de audio restringido a torre independiente. El autor documenta tres ejecuciones anuladas por fallos de este tipo antes de fiarse de los numeros.

## Capacidades

- Generacion de embeddings multimodales conjuntos en un espacio compartido de 1024 dimensiones para audio, imagen/video y texto.
- Retrieval texto-a-imagen y texto-a-video por producto escalar (`video_embeds @ text_video_embeds.T`).
- Clasificacion zero-shot de audio mediante `argmax` sobre `audio_embeds @ text_audio_embeds.T` con plantillas del tipo `"the sound of {label}"`.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de similitud, clustering y busqueda vectorial.
- Procesamiento conjunto de video (frames) y audio en una misma llamada al `AutoProcessor`.
- Soporte de tool calling / function calling: no disponible (es un encoder, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el unico idioma declarado es ingles.
- Capacidad especial: ninguna mas alla del embedding multimodal; no hay modo "thinking", vision generativa ni audio generativo.

## Casos de uso

- Busqueda semantica de video por consulta textual: indexar `video_embeds` de un catalogo y recuperar por similitud coseno contra `text_video_embeds`, aprovechando el R@1 de 0,713 medido en el slice completo de COCO.
- Etiquetado automatico de archivos de audio: clasificacion zero-shot con prompts de texto libre, sin reentrenar cabezas, util para bibliotecas de efectos de sonido o archivos de podcast.
- Monitorizacion acustica en entornos urbanos o industriales: clasificar eventos sonoros con `"the sound of {label}"` sobre ventanas de audio, con la precision de 0,895 medida en ESC-50 (slice completo).
- Deduplicacion y clustering de datasets audiovisuales: generar embeddings de 1024 dimensiones sobre un corpus y agrupar por similitud para eliminar contenido repetido antes de entrenar otros modelos.
- Alineacion o ajuste fino posterior: el tag esta pensado explicitamente como inicializacion congelada para una fase de fine-tuning de alineacion, con pesos de torre por genoma y lectura de capas intermedias.
- Moderacion y filtrado de contenido multimedia: comparar embeddings de imagen/video contra embeddings de texto de politica para marcar candidatos con alta similitud, como etapa previa a revision humana.
- Sistemas de recomendacion multimodal: combinar embeddings de audio e imagen de un mismo item para representar contenido en un unico vector de 1024 dimensiones.
- Investigacion reproducible en fusion de modelos: los scripts `fuse_pe_single.py`, `search_pe_weights.py` y `evo_fuse.py` permiten replicar la metodologia de media ponderada sobre la familia PE.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (slices pequenos, no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Text-to-image retrieval | COCO slice (150 filas, MMEB MSCOCO_i2t) | t2i R@1 (search slice n=64) | 0,766 |
| Text-to-image retrieval | COCO slice (150 filas, MMEB MSCOCO_i2t) | t2i R@5 (aprox., search slice) | 0,95 |
| Zero-shot audio classification | ESC-50 slice (100 clips) | Accuracy (search slice) | 0,96 |

Validacion declarada sobre slice completo (COCO n=150, ESC-50 n=200), comparada con el ancla:

| Modelo | COCO t2i R@1 / R@5 | COCO i2t R@1 | ESC-50 accuracy |
|---|---|---|---|
| `facebook/pe-av-base` (ancla) | 0,720 / 0,953 | 0,013 | 0,885 |
| `MC7ever/pe-single-L14` (este tag) | 0,713 / 0,953 | 0,013 | 0,895 |

El autor califica la diferencia como empate estadistico (dentro del error estandar) y advierte de que estas cifras son ejecuciones en CPU sobre slices, comparativas ancla-vs-variante, y no las cifras oficiales de MMEB ni del paper de PE. La recuperacion i2t se situa en el suelo tanto en el ancla como en las variantes. Una sonda de profundidad reporta que una lectura directa de capas intermedias no supera la salida conjunta (t2i R@1 menor o igual a 0,06 frente a 0,79), por lo que requiere pooling entrenado por capa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra medida. Como referencia aritmetica, 1,03 B de parametros ocupan aproximadamente 2,07 GB en fp16 y 4,14 GB en fp32, sin contar activaciones de las torres de audio y vision.
- El repositorio ocupa 4,1 GB, coherente con pesos en precision completa o mixta.
- GPU consumer: por tamano de pesos, un modelo de 1 B de parametros cabe con holgura en tarjetas de 8-12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para inferencia en fp16; no se aporta ninguna medicion de consumo real en estas tarjetas.
- GPU de datacenter: A100, H100 y similares son apropiadas si se necesita procesar lotes grandes de frames y audio; no hay cifras de throughput publicadas.
- CPU: el autor ejecuto las evaluaciones de validacion en CPU, lo que indica que la inferencia es viable en CPU a escala de slice pequeno, sin datos de latencia.
- Opciones de despliegue: la model card solo documenta `transformers` (`AutoModel` / `AutoProcessor` con `trust_remote_code=True`). No se confirma soporte de vLLM, TGI, llama.cpp, Ollama ni ONNX para este tag, dado que el pipeline es `feature-extraction` y no generacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Rol en la fusion | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `MC7ever/pe-single-L14` | Modelo fusionado final | 1,03 B | No disponible | COCO t2i R@1 0,713; ESC-50 0,895 | Apache 2.0 | HuggingFace (14 descargas) |
| `facebook/pe-av-base` | Ancla, esqueleto completo | No disponible en la informacion | No disponible | COCO t2i R@1 0,720; ESC-50 0,885 | No disponible en la informacion | HuggingFace (modelo de Meta) |
| `facebook/pe-a-frame-base` | Donante de la torre de audio (peso 0,25) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | HuggingFace (modelo de Meta) |
| `facebook/PE-Core-L14-336` | Donante del tronco de vision (init, efecto nulo) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | HuggingFace (modelo de Meta) |
| `facebook/PE-Spatial-L14-448` | Donante de vision con peso 0,0 en este tag | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | HuggingFace (modelo de Meta) |

Las cifras de parametros, contexto y licencia de los modelos de Meta no estan presentes en la informacion proporcionada y por tanto se marcan como no disponibles. La unica comparacion cuantitativa documentada por el autor es la del ancla PE-AV base frente a este tag.

## Limitaciones y advertencias

- Las cifras de benchmark proceden de slices pequenos (COCO n=64, ESC-50 n=100 en el model-index; n=150 y n=200 en la validacion completa) ejecutados en CPU. No son cifras oficiales de MMEB ni del paper de Perception Encoder y no son comparables con tablas publicadas de terceros.
- El propio autor desmiente la ventaja sobre el ancla: la fusion es un empate estadistico y no mejora los benchmarks por si sola. Cualquier expectativa de mejora requiere la fase de ajuste fino de alineacion, que no esta incluida en este tag.
- Recuperacion imagen-a-texto (i2t) en el suelo (R@1 de 0,013) tanto en el ancla como en las variantes, por lo que el ranking de descripciones no es una capacidad utilizable.
- El modelo es exclusivamente un codificador: no genera texto, no detecta objetos y no segmenta. No puede emplearse como chatbot ni como motor de razonamiento.
- Idioma unico: ingles. No hay evaluacion multilingue y los prompts de clasificacion zero-shot estan redactados en ingles.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Conviene revisarlo antes de usarlo en produccion.
- El historial de desarrollo incluye tres ejecuciones anuladas por contaminacion via `state_dict` compartido, no-ops silenciosos de `load_state_dict` y un desajuste de audio en la ruta conjunta. Aunque el autor declara haberlas corregido, es un indicador de que la metodologia de fusion es fragil y debe reproducirse con cuidado.
- Los pesos de mezcla se eligieron sobre slices muy pequenos, lo que abre riesgo de sobreajuste a esas muestras concretas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia de los modelos fuente de Meta y las condiciones de los datasets empleados (MMEB, COCO val2014, `ashraq/esc50`) deben verificarse por separado.
- Madurez baja del repositorio: 14 descargas y 0 likes, sin validacion independiente de terceros.
- No hay informacion publicada sobre sesgos, tasas de alucinacion (no aplica a un encoder) ni robustez ante dominios fuera de los slices evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MC7ever/pe-single-L14
- Ancla de la fusion: https://huggingface.co/facebook/pe-av-base
- Donante de audio: https://huggingface.co/facebook/pe-a-frame-base
- Donante de vision (Core): https://huggingface.co/facebook/PE-Core-L14-336
- Donante de vision (Spatial): https://huggingface.co/facebook/PE-Spatial-L14-448
- Dataset de audio empleado en evaluacion: https://huggingface.co/datasets/ashraq/esc50
- Perfil del autor: https://huggingface.co/MC7ever/MC7ever
- Catalogo de modelos del autor: https://huggingface.co/datasets/MC7ever/custom-models-catalog
- Listado del mantenedor en llm-explorer: https://llm-explorer.com/list/?mtr=MC7ever
- Paper, blog o repositorio de la fusion: no disponible en la informacion proporcionada.
