# jaichang/embeddinggemma2-korean-birds-620

## Resumen

EmbeddingGemma 2 Korean 620 es un modelo de embeddings derivado de `google/embeddinggemma-2` y ajustado por el usuario de HuggingFace `jaichang` para identificar 620 especies de aves silvestres observadas en Corea. El modelo proyecta en un mismo espacio vectorial de 768 dimensiones y norma L2 tres modalidades: vocalizaciones de aves a 16 kHz, fotografías de campo en RGB y descripciones ecológicas en coreano e inglés. La recuperación se realiza por similitud coseno (producto escalar) contra un índice multi-vector precalculado que se distribuye junto a los pesos.

El repositorio incluye 744.371.512 parámetros en formato safetensors (aproximadamente 740 M), el índice `korean_620_birds_multivector_index.npz` con embeddings de audio, foto y texto, y un catálogo JSON con nombres coreanos, ingleses y científicos de las 620 especies. Según la model card, los pesos ocupan unos 1,2 GB y está pensado como modelo profesor para destilar versiones móviles y web de 9,2 MB (visión) y 14,7 MB (audio) publicadas en un repositorio hermano.

Su relevancia es de nicho: no compite en tareas generales de embeddings, sino que resuelve un problema concreto de bioacústica y observación de aves con búsqueda cruzada entre canto, imagen y texto. Es un ajuste con muy poca tracción en la comunidad (17 descargas y 0 likes) y sin resultados de benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; encoder de embeddings heredado del modelo base `google/embeddinggemma-2`. La model card no especifica número de capas, tipo de atención ni si existen proyecciones separadas por modalidad |
| Parametros totales | 744.371.512 (aproximadamente 740 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio principal solo publica pesos safetensors; el repositorio hermano publica modelos ONNX (9,2 MB visión y 14,7 MB audio) y LiteRT, sin detallar el esquema de cuantización |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (pesos), .npz (índice multi-vector de referencia), .json (catálogo de especies); el repositorio hermano añade .onnx y .tflite |
| Dimension del embedding | 768, normalizado L2 |
| Modalidades | Audio (16 kHz), imagen RGB y texto |
| Tamano del repositorio | 4,5 GB |
| Pipeline declarado | zero-shot-classification |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del encoder: se indica unicamente que parte de `google/embeddinggemma-2` (740 M) y que produce un espacio unico de 768 dimensiones normalizado L2, donde audio, imagen y texto comparten representacion. La model card no detalla como se codifican el audio o la imagen dentro de ese espacio (si mediante adaptadores, cabezas de proyeccion o tokenizacion multimodal), ni la longitud de contexto, ni el regimen de precision de los pesos publicados. Tampoco se especifica si existe una fase de instruccion o de alineacion previa al ajuste fino.

El entrenamiento se realizo con Multiple Negatives Ranking Loss (InfoNCE) sobre pares de audio, imagen y texto. Las fuentes de datos son: taxonomia de iNaturalist Open Taxonomy API y del sistema KBR de Corea (620 especies nativas y migratorias observadas en Corea, `place_id=6891`); audio de 16 kHz del iNaturalist Open Data Audio Archive con clips de 4 a 5 segundos (`CC0` o `CC-BY` segun observacion); imagenes RGB del archivo S3 de iNaturalist (`CC0` o `CC-BY`); y descripciones ecologicas y acusticas de las APIs REST de Wikipedia en coreano e ingles (`CC BY-SA 4.0`). No se documenta el numero total de tokens, el numero de pares de entrenamiento, ni si hubo fases de RLHF o DPO (no aplicables por tratarse de un modelo de embeddings, no generativo).

Una discrepancia relevante: la seccion en ingles afirma que la cobertura es de 620 especies, mientras que la seccion en coreano anade 1.380 especies globales adicionales (identificadores 621 a 2.000) usando `iconic_taxa=Aves`. El repositorio principal solo publica el indice y el catalogo de 620 especies.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones normalizados L2, en ingles y coreano.
- Recuperacion cruzada entre modalidades: consulta por audio, por imagen o por texto y recuperacion de las especies mas probables por similitud coseno.
- Clasificacion zero-shot mediante el pipeline `zero-shot-classification` de HuggingFace, tal como declara la model card.
- Indexacion de catalogos de referencia: el indice `.npz` contiene `audio_hybrid_embs`, `photo_hybrid_embs` y `text_embs` en `float32` con forma `[N, 768]`.
- Consultas en lenguaje natural sobre rasgos morfologicos y acusticos (por ejemplo, "ave en blanco y negro con cola larga y alas iridiscentes azul verdosas, reclamo chak-chak"), con resultado directo al nombre cientifico, coreano e ingles.
- No es un modelo generativo: no produce texto libre, no conversa y no permite tool calling ni function calling.
- No dispone de soporte documentado para agentes, razonamiento multi-paso, vision general distinta de fotografias de aves, ni procesamiento de audio fuera del dominio bioacustico de 16 kHz.

## Casos de uso

- Identificacion de aves por canto en aplicaciones moviles: el modelo actua como profesor de 768 dimensiones para destilar los encoders de 14,7 MB (audio) que se ejecutan en el dispositivo con LiteRT, lo que permite clasificar reclamos grabados con el microfono sin conexion.
- Busqueda por fotografia en guias de campo digitales: una imagen RGB tomada en el campo se convierte en embedding y se compara contra `photo_hybrid_embs` para devolver las especies candidatas ordenadas por similitud.
- Busqueda descriptiva bilingue: un usuario puede escribir en coreano o en ingles rasgos de plumaje, habitat o tipo de reclamo y obtener coincidencias del catalogo, lo que resulta util en aplicaciones de turismo ornitologico y educacion ambiental.
- Curacion y filtrado de grabaciones de monitorizacion acustica pasiva: los clips de 4 a 5 segundos capturados por sensores se etiquetan automaticamente contra el indice de 620 especies, reduciendo el trabajo manual de revision y separando vocalizaciones de interes del ruido de fondo.
- Indexacion de colecciones multimedia biologicas: archivos de audio y fotografia de museos, universidades o programas de ciencia ciudadana se pueden vectorizar y agrupar por especie, detectando duplicados o etiquetas inconsistentes en el catalogo.
- Sistemas de recuperacion aumentada (RAG) sobre documentacion ecologica: el encoder de texto permite indexar fichas de especies, articulos y guias, y recuperar el fragmento relevante a partir de una consulta en lenguaje natural, enlazando despues con la imagen o el audio de referencia.
- Aplicaciones de ciencia ciudadana: verificacion asistida de observaciones enviadas por usuarios, marcando aquellas cuya descripcion o fotografia no concuerda con la especie declarada.
- Estudios de biodiversidad: agrupacion no supervisada de observaciones por similitud en el espacio de 768 dimensiones para explorar solapamientos acusticos o visuales entre especies proximas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye rejillas de visualizacion de recuperacion (`korean_birds_gallery_grid.png`, `korean_620_birds_result_grid.png`, `korean_620_birds_photo_search_grid.png`) sin cifras de precision, recall, mAP ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 744.371.512 parametros: aproximadamente 2,98 GB en fp32, 1,49 GB en fp16 o bf16 y 0,74 GB en int8. La model card declara un peso de unos 1,2 GB, coherente con una publicacion en precision reducida.
- Al margen de los pesos, el indice `.npz` y el catalogo JSON se cargan en memoria de sistema o en memoria unificada; el repositorio completo ocupa 4,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 2060, T4). Para indexar lotes grandes o mantener el indice en VRAM conviene disponer de 8 a 16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4).
- Si cabe en GPU de consumo: si, en la practica totalidad de las GPU dedicadas modernas, y tambien en equipos con memoria unificada (Apple Silicon) o incluso en CPU para cargas puntuales.
- Opciones de despliegue documentadas: `sentence-transformers` con `trust_remote_code=True` sobre PyTorch, descarga de artefactos con `huggingface_hub`, y los formatos ONNX (WebGPU) y LiteRT/.tflite del repositorio hermano para inferencia en navegador y en dispositivo movil. No hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card afirma que los modelos estudiante derivados funcionan en menos de un segundo en movil y navegador, pero no aporta cifras para este modelo de 740 M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaichang/embeddinggemma2-korean-birds-620 | 744.371.512 | No disponible | Audio, imagen RGB y texto (en/ko) | CC BY-SA 4.0 | HuggingFace, mas repositorio hermano LiteRT/ONNX |
| google/embeddinggemma-2 (modelo base) | No disponible | No disponible | Texto | No disponible en la informacion proporcionada | HuggingFace |
| jaichang/embeddinggemma2-korean-birds-620-litert | No disponible (estudiantes de 9,2 MB y 14,7 MB) | No disponible | Audio y vision | No disponible en la informacion proporcionada | HuggingFace |
| Otros sistemas de clasificacion bioacustica (BirdNET, CLAP, BioCLIP, etc.) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

Solo puede afirmarse que el ajuste anade alineacion trimodal y un indice de 620 especies respecto al modelo base, que es exclusivamente de texto. No hay cifras de rendimiento que permitan comparar calidad de recuperacion con alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: la cobertura verificable es de 620 especies de aves de Corea. Consultas sobre aves de otras regiones, otros animales u otros sonidos no estan soportadas por el indice publicado.
- Discrepancia documental entre la seccion inglesa (620 especies) y la coreana (620 mas 1.380 especies globales). Conviene validar que el indice distribuido contiene exactamente las 620 especies anunciadas.
- Idiomas limitados a ingles y coreano. Una consulta en castellano u otro idioma no tendra un comportamiento garantizado.
- No es un modelo generativo: no puede responder preguntas ni redactar texto. No cabe esperar alucinacion de texto, pero si falsos positivos en la recuperacion, especialmente entre especies con morfologia o reclamó similares.
- Ausencia total de benchmarks publicados: no hay metricas de precision top-1, top-5, mAP ni evaluaciones independientes. Las unicas evidencias son rejillas de imagenes cualitativas.
- Senal de validacion muy debil: 17 descargas y 0 likes. No hay revision por pares ni evaluacion de terceros.
- Licencia CC BY-SA 4.0: es una licencia copyleft que obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. No permite integrar el modelo o sus derivados en productos propietarios de codigo o pesos cerrados sin asumir esas obligaciones.
- Licencias de los datos de entrenamiento heterogeneas: audio e imagen bajo `CC0` o `CC-BY` segun cada observacion de iNaturalist, y texto bajo `CC BY-SA 4.0` de Wikipedia. Cualquier redistribucion o uso comercial exige verificar y respetar la atribucion por observacion.
- Sesgo geografico y taxonomico esperable: el entrenamiento se centra en observaciones de Corea (`place_id=6891`), con la composicion de especies, habitats y calidad de grabacion que ello implica.
- Condiciones de audio restringidas: clips de 4 a 5 segundos a 16 kHz, lo que puede degradar el rendimiento con grabaciones largas, ruidosas o con multiples especies solapadas.
- Sin informacion sobre longitud de contexto, tipos de cuantizacion, sesgos medidos ni comportamiento en produccion de alta concurrencia.
- Fecha de creacion declarada en 2026-10-11, atipica respecto al resto de metadatos; conviene verificar la trazabilidad de los artefactos antes de desplegarlos.
- El uso de `trust_remote_code=True` en la carga del modelo implica ejecutar codigo del repositorio; debe auditarse antes de su uso en entornos de produccion.

## Enlaces

- Repositorio principal: https://huggingface.co/jaichang/embeddinggemma2-korean-birds-620
- Repositorio hermano para inferencia en dispositivo (LiteRT y WebGPU): https://huggingface.co/jaichang/embeddinggemma2-korean-birds-620-litert
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- iNaturalist Open Data (taxonomia, audio y fotografia): https://www.inaturalist.org/pages/developers
- Archivo S3 de fotografias de iNaturalist Open Data: https://inaturalist-open-data.s3.amazonaws.com
- Sistema de informacion de biodiversidad de Corea (KBR): no disponible la URL exacta en la informacion proporcionada
- API REST de resumenes de Wikipedia: https://api/rest_v1/page/summary/ (referenciada en la model card sin dominio completo)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, a su paper ni a sus datos; los resultados devueltos no guardan relacion con el contenido tecnico de esta ficha.
