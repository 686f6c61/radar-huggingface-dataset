# fassabilf/sea-clip-tiny-abl-cc12m-sea

## Resumen

SEA-CLIP-Tiny (ablación CC12M + SEA) es un checkpoint de la familia SEA-CLIP-Tiny, desarrollada por el usuario fassabilf y presentada en el artículo «SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages» (ACCV 2026). Se trata de un codificador dual texto-imagen al estilo CLIP, entrenado mediante destilación desde MetaCLIP2-ViT-B-16-worldwide, cuyo objetivo es alinear representaciones de imagen y texto para lenguas del sudeste asiático, un grupo de idiomas tradicionalmente infrarrepresentado en los datasets multimodales de preentrenamiento.

Este checkpoint concreto no es el modelo principal: es una de las filas de la tabla de ablación del artículo. Comparte arquitectura, pipeline e hiperparámetros con fassabilf/sea-clip-tiny y solo cambia la mezcla de datos de entrenamiento (CC12M + CulturalGround-OE-filt + WIT + Bloom, 12,18 millones de pares). Tiene 46,11 millones de parámetros —5,62 M en la torre de visión ViT-T/16 y 40,49 M en la torre de texto de 12 capas y 384 dimensiones, con embedding de 512— y una ventana de contexto textual de 77 tokens.

Su interés es doble: por un lado ofrece un modelo de embeddings multilingües muy ligero (repositorio de 0,2 GB) que cabe en hardware modesto; por otro, sirve como punto de comparación reproducible para estudiar cómo afecta la composición del dataset al rendimiento zero-shot en idiomas del sudeste asiático. Las cifras publicadas (33,3 R@1 en CulturalGround, 25,2 en WIT, 16,1 en Bloom, 37,4 % en ImageNet y 9,1 de R@1 medio) corresponden a esta ablación y no deben extrapolarse al modelo final del artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador dual tipo CLIP: torre de visión ViT-T/16 + torre de texto de 12 capas y 384 dimensiones; dimensión de embedding 512 |
| Parámetros totales | 46,11 M (5,62 M visión + 40,49 M texto) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens en la torre de texto; tokenizador CLIP BPE con vocabulario de 49.408 |
| Tipos de cuantización | No disponible (la model card no documenta cuantizaciones publicadas) |
| Idiomas soportados | en (inglés), id (indonesio), jv (javanés), su (sundanés), ms (malayo), th (tailandés), vi (vietnamita), my (birmano) |
| Licencia | MIT |
| Formato de pesos | No disponible; el checkpoint se distribuye como repositorio open_clip de 0,2 GB |
| Librería | open_clip |
| Tarea declarada | zero-shot-image-classification |
| Datos de entrenamiento | CC12M + CulturalGround-OE-filt + WIT + Bloom (12,18 M de pares) |
| Modelo profesor | MetaCLIP2-ViT-B-16-worldwide |
| Fecha de publicación | 21 de septiembre de 2026 (creación y última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un codificador dual simétrico al de la familia CLIP: una torre de visión ViT-T/16 (variante «tiny» con parches de 16×16) y una torre de texto de 12 capas y anchura 384, ambas proyectadas a un espacio común de 512 dimensiones. La torre de texto usa el tokenizador BPE de CLIP con vocabulario de 49.408 entradas y una ventana de contexto de 77 tokens. El reparto de parámetros es muy asimétrico: solo 5,62 M residen en visión, frente a 40,49 M en texto (el 87,8 % del total), lo que indica que el coste principal está en el codificador lingüístico y no en el visual.

El entrenamiento de este checkpoint parte de una mezcla de 12,18 millones de pares imagen-texto que combina CC12M, CulturalGround-OE-filt, WIT y Bloom, y utiliza MetaCLIP2-ViT-B-16-worldwide como profesor, lo que apunta a un esquema de destilación sobre el objetivo contrastivo habitual de CLIP; la model card no detalla la función de pérdida ni el número de tokens o épocas procesadas. Tampoco se documenta ningún ajuste por RLHF o DPO, algo esperable dado que no es un modelo generativo. La model card indica que la configuración exacta de entrenamiento está en el archivo `params.txt` del repositorio y que el código de entrenamiento y evaluación es público en GitHub.

## Capacidades

- Clasificación de imágenes zero-shot mediante prompts de texto, sin necesidad de fine-tuning por clase.
- Recuperación texto-imagen e imagen-texto (retrieval bidireccional) en un espacio de embedding compartido de 512 dimensiones.
- Generación de embeddings de imagen y de texto utilizables para búsqueda semántica, clustering, deduplicación y filtrado de datasets.
- Cobertura multilingüe en ocho idiomas (inglés, indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano) dentro del mismo espacio vectorial, lo que permite consultas cruzadas entre idiomas.
- Gestión de descripciones textuales de hasta 77 tokens, suficiente para etiquetas, frases cortas y consultas de búsqueda.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo «thinking», ni de entrada o salida de audio, ni de capacidades de visión generativa.

## Casos de uso

- Búsqueda visual multilingüe en catálogos de comercio electrónico: el modelo indexa las imágenes de producto como vectores de 512 dimensiones y permite que un usuario consulte en indonesio, tailandés o vietnamita frases cortas (por debajo de 77 tokens) y recupere productos relevantes sin traducir la consulta.
- Filtrado y curado de datasets multimodales a escala: al ser un CLIP ligero de 46,11 M de parámetros, se puede ejecutar sobre millones de pares imagen-texto para descartar pares mal alineados antes de entrenar modelos mayores, con un coste de cómputo muy inferior al de un CLIP ViT-L o ViT-H.
- Etiquetado automático y moderación de contenido generado por usuarios: clasificación zero-shot de imágenes subidas a una plataforma contra un conjunto de etiquetas definidas por el equipo, útil cuando no existe un dataset etiquetado propio y se quiere iterar rápido sobre las categorías.
- Deduplicación y agrupación de imágenes: los embeddings permiten detectar imágenes casi idénticas o agrupar visualmente un archivo fotográfico sin etiquetas, usando similitud coseno sobre los vectores generados.
- Investigación sobre representación cultural y multilingüismo: el checkpoint sirve como baseline reproducible para medir cómo distintas mezclas de datos (CC12M frente a CulturalGround, por ejemplo) afectan al rendimiento de retrieval en XM3600, Flickr30k-200 y XTD-200; de hecho, esa es su función declarada dentro del artículo.
- Clasificación en dispositivo o en el borde: con 46,11 M de parámetros y un repositorio de 0,2 GB, es viable ejecutar inferencia en CPU, en GPUs integradas o incluso en dispositivos móviles para tareas de etiquetado offline sin enviar imágenes a la nube.
- Recuperación de imágenes en un RAG multimodal: el modelo puede actuar como recuperador visual dentro de un pipeline mayor, devolviendo las imágenes más similares a una consulta corta que después procesaría un modelo de lenguaje multimodal.

## Benchmarks y rendimiento

Resultados publicados en la model card: R@1 sobre los splits reservados de cada fuente de entrenamiento, exactitud zero-shot en ImageNet y media de R@1 (solo retrieval) sobre XM3600, Flickr30k-200 y XTD-200.

| Métrica | Resultado (%) |
|---|---|
| CulturalGround R@1 | 33,3 |
| WIT R@1 | 25,2 |
| Bloom R@1 | 16,1 |
| ImageNet zero-shot | 37,4 |
| R@1 medio (XM3600 + Flickr30k-200 + XTD-200) | 9,1 |

No se han publicado en la información disponible resultados de benchmarks comparativos frente a otros modelos, ni datos de latencia o throughput.

## Requisitos de hardware

- Huella de pesos estimada a partir de los 46,11 M de parámetros: en torno a 184 MB en fp32, 92 MB en fp16 y 46 MB en int8 (cálculo aritmético; no se publican checkpoints cuantizados).
- VRAM de inferencia: menos de 1 GB en cualquiera de esos formatos, sumando el overhead del framework; es decir, cualquier GPU con 2 GB o más es suficiente.
- Cabe holgadamente en GPU de consumo: GTX 1060 6 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090 (esta última queda enormemente sobredimensionada). No requiere A100 ni H100.
- También es viable en CPU y, por tamaño, en dispositivos de borde o móviles, siempre que exista una exportación optimizada.
- Opciones de despliegue: la vía documentada es open_clip sobre PyTorch, mediante `open_clip.create_model_and_transforms('hf-hub:fassabilf/sea-clip-tiny-abl-cc12m-sea')`. No se documentan exportaciones a ONNX, TensorRT, Core ML o TFLite, ni integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas estas orientadas a modelos generativos, no a codificadores duales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-cc12m-sea | 46,11 M | 77 tokens | en, id, jv, su, ms, th, vi, my | MIT | HuggingFace (0 descargas, 0 likes) |
| sea-clip-tiny (modelo principal) | Misma arquitectura según la model card | 77 tokens | Los mismos ocho idiomas | MIT | HuggingFace |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | No disponible | No disponible | Multilingüe (no detallado) | No disponible | No disponible |
| CLIP ViT-B/32 original | No disponible | 77 tokens | Principalmente inglés | No disponible | No disponible |
| SigLIP (familia) | No disponible | No disponible | Multilingüe en algunas variantes | No disponible | No disponible |

No se dispone de cifras de rendimiento de los modelos alternativos dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La model card sí permite afirmar que este checkpoint y el modelo principal comparten arquitectura y pipeline, y que la única diferencia es la mezcla de datos.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no el modelo principal de la familia; utilizarlo como referencia del estado del arte en retrieval multilingüe sería un error de interpretación.
- Las cifras de rendimiento son modestas para los estándares actuales: 37,4 % de exactitud zero-shot en ImageNet y 9,1 de R@1 medio. Está diseñado para ser pequeño y eficiente, no para maximizar precisión.
- La evaluación R@1 se realiza sobre splits reservados de las propias fuentes de entrenamiento (CulturalGround, WIT, Bloom), por lo que parte de las cifras corresponden a dominios cercanos a los datos vistos durante el entrenamiento.
- Cobertura lingüística limitada a ocho idiomas del sudeste asiático más el inglés; no incluye el español ni otras lenguas europeas.
- La ventana de 77 tokens restringe las consultas a frases cortas; no admite descripciones largas, párrafos ni documentos.
- No es un modelo generativo: no puede redactar, resumir, traducir texto libre ni mantener conversaciones.
- Riesgo de sesgo: CC12M y WIT son corpora de origen web con sobrerrepresentación de contenidos occidentales y anglófonos. La incorporación de CulturalGround-OE-filt apunta precisamente a mitigar ese sesgo cultural, pero no se publican evaluaciones de sesgo ni de equidad para este checkpoint.
- Riesgo de falsos positivos en similitud imagen-texto: como todo codificador dual, puede asignar puntuaciones altas a combinaciones incorrectas, especialmente en conceptos poco representados en la mezcla de entrenamiento.
- Licencia MIT: permite uso comercial y modificación sin restricciones declaradas, pero la model card no especifica las condiciones de los datos de entrenamiento subyacentes (CC12M, WIT, Bloom, CulturalGround-OE-filt), lo que puede suponer un riesgo legal no evaluado en despliegues comerciales.
- Señales de adopción nulas: 0 descargas, 0 likes y sin revisiones publicadas; el modelo se creó y se actualizó el mismo día, por lo que no existe retroalimentación de la comunidad sobre su comportamiento real.
- No se documentan versiones cuantizadas, formato exacto de pesos ni resultados de robustez ante imágenes fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-cc12m-sea
- Modelo principal de la familia: https://huggingface.co/fassabilf/sea-clip-tiny
- Repositorio de código de entrenamiento y evaluación: https://github.com/fassabilf/sea-clip-tiny
- Cita del artículo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (sin enlace disponible)
- Resultados de búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; únicamente aparecieron páginas de ayuda de Google y Microsoft sin relación con el contenido.
