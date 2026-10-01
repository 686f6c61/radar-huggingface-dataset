# bbsai/Molmo2-8B

## Resumen

Molmo2-8B es un modelo de vision-lenguaje (VLM) abierto desarrollado por el Allen Institute for AI (Ai2) que combina un backbone de lenguaje Qwen3-8B con un codificador visual SigLIP 2 (siglip-so400m-patch14-384). El modelo esta disenado para comprension conjunta de imagen, video y multiples imagenes, e incorpora capacidades de "grounding" o localizacion espacial, es decir, puede senalar coordenadas y seguir objetos a lo largo de fotogramas en un video. Resuelve tareas de pregunta-respuesta visual, subtitulado, conteo, captioning y seguimiento de objetos en secuencias.

La familia Molmo2 se posiciona como una propuesta de pesos abiertos y datos abiertos: los conjuntos de entrenamiento (Molmo2-Cap, Molmo2-VideoCapQA, Molmo2-VideoPoint, Molmo2-VideoTrack, Molmo2-MultiImageQA, entre otros) se publican en HuggingFace, y Ai2 afirma que liberara codigo de entrenamiento, evaluaciones y checkpoints intermedios. Esto la hace relevante para investigadores que necesitan reproducibilidad y no solo un modelo de caja negra.

El checkpoint recogido aqui aparece bajo el identificador bbsai/Molmo2-8B, aunque la model card corresponde al modelo oficial allenai/Molmo2-8B. Cuenta con 8.661.703.120 parametros y se distribuye bajo licencia Apache 2.0 en formato safetensors, con soporte nativo en la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: LLM Qwen3-8B + vision encoder SigLIP 2 (siglip-so400m-patch14-384) |
| Parametros totales | 8.661.703.120 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales; pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Molmo2-8B sigue un patron de VLM acoplado: un codificador de vision SigLIP 2 (variante so400m, patch de 14, resolucion 384) extrae representaciones visuales que se proyectan al espacio del modelo de lenguaje Qwen3-8B, encargado de la generacion de texto. El modelo se expone a traves de las clases AutoProcessor y AutoModelForImageTextToText de transformers con trust_remote_code=True, y requiere la libreria auxiliar molmo_utils para el procesamiento de vision y la extraccion de coordenadas.

El entrenamiento combina un conjunto amplio de datasets publicos de terceros con datos propios altamente curados de pares imagen-texto y video-texto. Entre ellos figuran Molmo2-Cap (captioning), Molmo2-VideoCapQA y Molmo2-VideoSubtitleQA (pregunta-respuesta y subtitulado de video), Molmo2-AskModelAnything, Molmo2-VideoPoint y Molmo2-VideoTrack (localizacion y seguimiento espacial), y los conjuntos de multiples imagenes Molmo2-MultiImageQA, Molmo2-SynMultiImageQA y Molmo2-MultiImagePoint. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se especifican innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni variantes de atencion lineal.

Un rasgo tecnico distintivo es el soporte de "pointing" y "tracking": el modelo emite coordenadas normalizadas en una escala de 1000 junto con identificadores de fotograma, lo que permite tareas de grounding temporal sobre video. La model card incluye utilidades (process_vision_info, extract_video_points) para convertir esa salida en tuplas (t, x, y).

## Capacidades

- Comprension de imagen individual: descripcion, pregunta-respuesta visual y captioning detallado.
- Comprension de video corto y largo: QA sobre secuencias, subtitulado y conteo de objetos.
- Comprension de multiples imagenes: razonamiento que cruza varias imagenes en una misma consulta (Molmo2-MultiImageQA).
- Localizacion visual (pointing): el modelo devuelve coordenadas espaciales sobre imagenes y fotogramas concretos.
- Seguimiento de objetos en video (tracking): genera trayectorias a lo largo del tiempo mediante tripletas (fotograma, x, y).
- Conteo de objetos en escenas e imagenes.
- Capacidades heredadas del backbone Qwen3-8B para generacion de texto y razonamiento en ingles.
- Soporte de conversacion multi-turno mediante plantilla de chat (apply_chat_template).
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Modo "thinking" explicito: no documentado en la informacion proporcionada.
- Capacidades de audio: no disponibles.
- Multilingue: limitado a ingles segun los metadatos del modelo.

## Casos de uso

- Analisis automatico de videovigilancia y conteo: el modelo puede responder preguntas del tipo "cuantos vehiculos aparecen" sobre un clip y devolver puntos sobre cada objeto detectado, gracias a sus capacidades de conteo y pointing.
- Subtitulado y descripcion de video accesible: generar descripciones textuales de secuencias para audiodescripcion o indexacion semantica de archivos de video.
- Seguimiento de objetos para edicion o deporte: usar las trayectorias (t, x, y) para alimentar pipelines de post-produccion, analisis tactico o etiquetado automatico de material audiovisual.
- Moderacion de contenido visual: clasificar y describir imagenes y videos en flujos de revision, aprovechando el QA visual sobre contenido sospechoso.
- Asistentes sobre documentacion fotografiada: responder preguntas sobre capturas, diagramas o fotos de producto en aplicaciones de soporte, procesando varias imagenes en una misma consulta.
- Analisis de imagenes medicas o tecnicas (con supervision humana): descripcion y localizacion de regiones de interes, siempre como apoyo y no como diagnostico autonomo.
- Catalogacion de patrimonio o e-commerce: generar captioning y puntos de interes sobre fotografias de productos o piezas para poblar bases de datos con metadatos ricos.
- Investigacion en grounding y vision-lenguaje: servir como baseline reproducible al liberar Ai2 los datos de entrenamiento, util para comparar tecnicas de localizacion espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma de forma cualitativa que Molmo2-8B "obtiene un rendimiento de ultima generacion entre modelos multimodales de tamano similar" y que supera a otros modelos de pesos y datos abiertos en videos cortos, conteo y captioning, siendo competitivo en videos largos. No se proporcionan cifras de MMLU, HumanEval, GSM8K, VQA, VideoMME ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 17,3 GB solo de pesos, mas el codificador de vision y activaciones; en la practica se recomienda reservar 20-24 GB.
- VRAM estimada con cuantizacion de 8 bits: en torno a 9-10 GB.
- VRAM estimada con cuantizacion de 4 bits: en torno a 5-6 GB (siempre que exista un checkpoint cuantizado compatible; no se documentan oficialmente).
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S, A6000.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers 4.57.1 como via oficial, con trust_remote_code=True y las dependencias torch, pillow, einops, torchvision, accelerate, decord2 y molmo_utils. El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks, por lo que la comparativa se limita a caracteristicas estructurales verificables. Los valores de contexto de los modelos alternativos no estan confirmados para sus variantes concretas.

| Modelo | Parametros | Backbone LLM | Vision encoder | Licencia | Idiomas |
|---|---|---|---|---|---|
| Molmo2-8B | 8,66 B | Qwen3-8B | SigLIP 2 so400m | Apache 2.0 | en |
| Qwen2.5-VL-7B | ~7-8 B | Qwen2.5 | ViT propio | Apache 2.0 (variantes) | multilingue |
| InternVL 2.5-8B | ~8 B | InternLM 2.5 | InternViT | MIT / Apache segun variante | multilingue |
| Llama 3.2 11B Vision | 11 B | Llama 3.1 | ViT propio | Llama Community License | multilingue |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse mayoritariamente con datos publicos de terceros, puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinacion: como cualquier VLM generativo, puede describir objetos o eventos inexistentes, especialmente en videos largos o escenas ambiguas. Las coordenadas de pointing y tracking deben validarse en produccion.
- Idioma: el modelo esta declarado unicamente para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3-8B y SigLIP 2, cuyas licencias y condiciones deben respetarse por separado.
- Dependencia de codigo remoto: requiere trust_remote_code=True, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar en entornos sensibles.
- Identificador no oficial: el checkpoint figura bajo bbsai/Molmo2-8B mientras que la model card referencia allenai/Molmo2-8B. Se trata probablemente de una copia o espejo; para produccion conviene usar el repositorio oficial de Ai2 y verificar integridad y actualizaciones.
- Longitud de contexto no especificada: al no documentarse, no se puede garantizar el manejo de videos muy largos o conversaciones extensas.
- Fecha de creacion del repositorio (2026-10-01) y ausencia de descargas o likes: indica un artefacto reciente y poco validado por la comunidad.
- Sin datos de despliegue eficiente: no hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI, lo que puede complicar el escalado en produccion.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/bbsai/Molmo2-8B
- Modelo oficial de Ai2: https://huggingface.co/allenai/Molmo2-8B
- Coleccion completa de la familia Molmo2: https://huggingface.co/collections/allenai/molmo2
- Coleccion de datos Molmo2: https://huggingface.co/collections/allenai/molmo2-data
- Informe tecnico (paper): https://allenai.org/papers/molmo2
- Blog de anuncio: https://allenai.org/blog/molmo2
- Demo interactiva: https://playground.allenai.org/?model=molmo2-8b
- Modelo base de lenguaje Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Backbone de vision SigLIP 2: https://huggingface.co/google/siglip-so400m-patch14-384
