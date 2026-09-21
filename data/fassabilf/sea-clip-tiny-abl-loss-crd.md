# fassabilf/sea-clip-tiny-abl-loss-crd

## Resumen

SEA-CLIP-Tiny (ablation: CLIP + CRD) es un checkpoint de investigación publicado por el usuario `fassabilf` en HuggingFace, concebido como una fila más de la tabla de ablaciones del modelo principal SEA-CLIP-Tiny, presentado en ACCV 2026. Se trata de un modelo de embeddings texto-imagen de arquitectura CLIP clásica y tamano muy reducido (46,11 M de parámetros), entrenado para clasificación de imágenes zero-shot y recuperación (retrieval) multimodal en lenguas del sudeste asiático. Su diferencia con el modelo principal es exclusivamente el objetivo de destilación: en este caso, solo contraste + destilación relacional contrastiva (CRD), sin otros términos de pérdida.

El modelo combina una torre de visión ViT-T/16 con una torre de texto de 12 capas y 384 dimensiones, ambas proyectadas a un espacio común de 512 dimensiones, y utiliza el tokenizador BPE de CLIP con un vocabulario de 49.408 tokens. Se entrenó con 12,72 millones de pares imagen-texto procedentes de cinco fuentes (CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA), destilando desde MetaCLIP2-ViT-B-16-worldwide.

Su relevancia es acotada y de perfil académico: es un artefacto de ablación con 0 descargas y 0 "likes" en el momento de la consulta, útil para reproducir resultados y para investigar cómo afecta el objetivo de destilación a un CLIP multilingüe de bajo coste computacional. No es un modelo generativo ni un LLM, por lo que sus prestaciones deben juzgarse en tareas de representación (clasificación zero-shot y recuperación), no en generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres: vision tower ViT-T/16 + text tower de 12 capas y 384 dimensiones; dimension de embedding compartida de 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 77 tokens (torre de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,2 GB, cargado con la libreria open_clip) |
| Tokenizador | CLIP BPE, vocabulario de 49.408 tokens |
| Objetivo de entrenamiento | contraste + destilacion relacional contrastiva (CRD) |
| Modelo profesor | MetaCLIP2-ViT-B-16-worldwide |
| Datos de entrenamiento | CC12M + CulturalGround-OE-filt + WIT + Bloom + Mammoth-VL-SEA (12,72 M pares) |
| Pipeline declarado | zero-shot-image-classification |
| Libreria | open_clip |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un CLIP estándar de dos torres. La torre de visión es un ViT-T/16 (variante "tiny" con parches de 16x16); la torre de texto tiene 12 capas y anchura 384, y ambas se proyectan a un espacio de embedding conjunto de 512 dimensiones. El tokenizador es el BPE de CLIP con vocabulario de 49.408 tokens y una longitud de contexto de 77 tokens, idéntico al de la familia CLIP original. El modelo principal y este checkpoint de ablación comparten arquitectura, pipeline e hiperparámetros; la única diferencia declarada es la función de pérdida de destilación, limitada aquí a contraste más destilación relacional contrastiva (CRD).

El entrenamiento usa 12,72 millones de pares imagen-texto procedentes de cinco fuentes: CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA, con MetaCLIP2-ViT-B-16-worldwide actuando como profesor. La model card no detalla el número de tokens de texto, la resolución de imagen de entrenamiento, el número de épocas, el optimizador ni si hubo etapas de ajuste adicionales; el repositorio incluye un archivo `params.txt` con la configuración exacta de este checkpoint. No se documenta decodificación especulativa, atención lineal ni otras innovaciones de eficiencia: la innovación del trabajo es la receta de destilación multilingüe, no la arquitectura.

## Capacidades

- Clasificación de imágenes zero-shot mediante prompts de texto en cualquiera de los ocho idiomas declarados.
- Recuperación texto-imagen e imagen-texto (retrieval) en espacio de embeddings compartido.
- Representaciones multimodales multilingües: inglés (en), indonesio (id), javanés (jv), sundanés (su), malayo (ms), tailandés (th), vietnamita (vi) y birmano (my).
- Generación de embeddings de imagen y de texto reutilizables para búsqueda semántica, clustering, deduplicación y filtrado de datasets.
- Destilación desde un profesor de mayor capacidad (MetaCLIP2-ViT-B-16-worldwide), lo que permite integrarlo como alumno en pipelines de destilación adicionales.
- No soporta generación de texto: no hay capacidades de razonamiento, código, matemáticas ni diálogo.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades de visión generativa, VQA, captioning, audio ni modo "thinking".

## Casos de uso

- Búsqueda de imágenes multilingüe en catálogos: indexar un repositorio de imágenes con los embeddings del modelo y consultarlo con texto en indonesio, tailandés, vietnamita, malayo o birmano, sin necesidad de traducir previamente a inglés.
- Etiquetado zero-shot de datasets para lenguas del sudeste asiático: definir un conjunto de etiquetas textuales por idioma y asignar categorías a imágenes sin anotación manual, como paso previo a un etiquetado supervisado más costoso.
- Filtrado de calidad de corpus multimodales: calcular la similitud entre cada par imagen-texto y descartar los pares con baja puntuación antes de entrenar modelos mayores, aprovechando el bajo coste de inferencia de un modelo de 46 M de parámetros.
- Deduplicación y agrupamiento de imágenes: usar los embeddings de imagen para detectar duplicados cercanos o agrupar visualmente un archivo fotográfico, con tamaño de repositorio de solo 0,2 GB.
- Organización de bibliotecas multimedia en aplicaciones locales u "on-device": al caber en memoria de cualquier GPU de consumo e incluso en CPU, permite búsqueda por texto en lengua local sin enviar datos a un servicio externo.
- Recuperación de productos en comercio electrónico regional: consultas de texto en el idioma del comprador contra un índice de imágenes de producto, con el modelo actuando como encoder dual.
- Investigación en destilación multimodal: reproducir la ablación CRD frente a otras combinaciones de pérdidas del trabajo SEA-CLIP-Tiny, ya que el código de entrenamiento y evaluación es público.
- Moderación asistida por similitud: comparar imágenes entrantes con un conjunto de referencias etiquetadas mediante similitud de embeddings, siempre como señal auxiliar y no como decisión automática.

## Benchmarks y rendimiento

Resultados publicados en la model card: R@1 en las particiones de validación retenidas de cada fuente de entrenamiento, exactitud zero-shot en ImageNet y la media de recuperación (R@1-Avg) sobre XM3600, Flickr30k-200 y XTD-200.

| Metrica | Resultado |
|---|---|
| CG R@1 | 28,5 |
| WIT R@1 | 20,3 |
| Bloom R@1 | 11,3 |
| ImageNet (zero-shot) | 32,7 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 9,3 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, y carecen de sentido para este tipo de modelo. Tampoco se proporcionan cifras comparativas de las otras filas de la tabla de ablación del paper.

## Requisitos de hardware

- Pesos estimados a partir del recuento de parámetros: aproximadamente 184 MB en FP32 y 92 MB en FP16 (cálculo derivado de 46,11 M de parámetros; no es un dato publicado en la model card).
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050/1650, RTX 3050, RTX 4060, RTX 4090 y similares, y también en CPU para inferencia por lotes pequeños.
- Para GPUs de centro de datos (A100, H100, L40S) el modelo es enormemente sobredimensionado en memoria; su uso tiene sentido solo por agregación de grandes volúmenes de inferencia en lote.
- Opciones de despliegue documentadas: `open_clip` junto con PyTorch, cargando el checkpoint vía `hf-hub:fassabilf/sea-clip-tiny-abl-loss-crd`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI: no es un modelo generativo y no se publican pesos GGUF.
- Exportación a ONNX, TorchScript o TensorRT: no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de cifras de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a los atributos declarados.

| Modelo | Relacion | Parametros | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-loss-crd (este) | Ablacion con solo contraste + CRD | 46,11 M | 77 tokens | MIT | HuggingFace, 0 descargas |
| sea-clip-tiny | Modelo principal; misma arquitectura, pipeline e hiperparametros, distinto objetivo de destilacion | 46,11 M (misma arquitectura) | 77 tokens | no disponible en la informacion | HuggingFace |
| MetaCLIP2-ViT-B-16-worldwide | Profesor usado en la destilacion; mayor capacidad | no disponible | no disponible | no disponible | Referenciado como profesor |
| Otros CLIP multilingues de escala similar | Alternativas de la misma categoria funcional | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la busqueda web enlaces utiles ni fichas tecnicas de alternativas que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo final: la propia model card lo describe como "one row of the ablation table", por lo que no debe tratarse como la referencia del proyecto.
- Rendimiento bajo en terminos absolutos en las metricas publicadas: ImageNet zero-shot de 32,7 y R@1-Avg de 9,3 sobre XM3600, Flickr30k-200 y XTD-200, muy por debajo de lo esperable en modelos CLIP de mayor escala.
- Riesgo de alucinacion en el sentido de falsos positivos: al ser un modelo de similitud, puede asignar puntuaciones altas a pares imagen-texto incorrectos, especialmente en dominios alejados de los datos de entrenamiento; no debe usarse como decisor autonomo.
- Sesgos: el entrenamiento combina CC12M, WIT y otras fuentes web, con los sesgos demograficos, geograficos y culturales inherentes a esos corpus; no se documenta ningun analisis de sesgo ni mitigacion.
- Cobertura linguistica limitada a ocho idiomas (en, id, jv, su, ms, th, vi, my); no se declaran filipino/tagalo, jemer, lao ni otras lenguas de la region, y no hay datos sobre el rendimiento desagregado por idioma mas alla de la media R@1-Avg.
- La longitud de contexto de 77 tokens restringe las consultas de texto a frases cortas; no admite prompts largos ni documentos.
- No es un modelo generativo: no puede redactar, resumir, razonar ni ejecutar herramientas, por lo que cualquier caso de uso que requiera texto de salida debe combinarse con otro modelo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; el repositorio tiene 0 descargas y 0 "likes", sin senales de mantenimiento.
- En produccion, conviene fijar la version del checkpoint, ya que el repositorio se actualizo el mismo dia de su creacion y el autor puede revisarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-loss-crd
- Modelo principal (SEA-CLIP-Tiny): https://huggingface.co/fassabilf/sea-clip-tiny
- Repositorio de codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Cita del paper: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV), 2026 (sin enlace disponible)
- Configuracion de entrenamiento del checkpoint: archivo `params.txt` dentro del repositorio de HuggingFace

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre el paper; los unicos enlaces utiles son los incluidos en la propia model card.
