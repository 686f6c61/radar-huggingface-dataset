# moganai/MoganBERT-TR

## Resumen

MoganBERT-TR es un encoder transformer de 149.409.152 parámetros entrenado desde cero para turco por MoganAI (Furkan Yilmaz, Habibe Aleyna Tasdemir y Muhammed Faruk Gozay). Sigue la arquitectura ModernBERT: 22 capas, tamaño oculto de 768, 12 cabezas de atención y un patrón de atención alternante entre ventanas locales y atención global, con una ventana de contexto de 8.192 tokens. El tokenizador es un SentencePiece Unigram de 50.048 tokens entrenado específicamente para turco, lo que evita la fragmentación agresiva que sufren los modelos multilingües en una lengua aglutinante como el turco.

Su rasgo diferencial frente a otros encoders turcos es el régimen de preentrenamiento: no usa MLM puro, sino un currículum en dos etapas CLM→MLM. El 16,6 % inicial del entrenamiento emplea modelado de lenguaje causal y el resto modelado de lenguaje enmascarado, con la transición situada dentro de la fase estable de un schedule WSD (warmup-stable-decay). El modelo se entrenó sobre 237.300 millones de tokens con 4 GPU H100.

Es relevante ahora porque cubre un hueco concreto: los encoders turcos disponibles (BERTurk, ELECTRA turco) arrastran ventanas de 512 tokens, arquitecturas BERT clásicas y tokenizadores multilingües o poco adaptados. MoganBERT-TR ofrece 16 veces más contexto, un tokenizador dedicado y una familia asociada de modelos de recuperación (MoganBERT-Embed y Mogan-ColBERT-TR) bajo licencia Apache 2.0, lo que facilita su adopción en clasificación, NER, extracción de información y búsqueda semántica sobre documentos largos en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (22 capas, hidden size 768, 12 cabezas, atención local/global alternante) |
| Parametros totales | 149.409.152 (149,4 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos completos; no se anuncian variantes GGUF, int8 ni int4 |
| Idiomas soportados | Turco (idioma objetivo declarado). El corpus de entrenamiento es ~73 % turco, ~17 % inglés y ~10 % código, por lo que existe exposición secundaria a inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Tokenizador | SentencePiece Unigram, 50.048 tokens, entrenado para turco |
| Tarea declarada en el Hub | fill-mask (masked language modeling) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 179 descargas, 7 likes |
| Fecha de creacion / actualizacion | 2026-08-27 / 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura sigue ModernBERT de forma estricta: 22 capas de encoder con hidden size 768 y 12 cabezas de atención, combinando capas de atención local (ventana deslizante) con capas de atención global de forma alternante para reducir el coste cuadrático sin perder alcance global. No incorpora NSP (next sentence prediction), un detalle operativo importante: la representación `[CLS]` no está preentrenada y el propio autor recomienda usar `classifier_pooling="mean"` (valor por defecto de la config) al hacer fine-tuning. La ventana de contexto es de 8.192 tokens, usando RoPE global con θ escalado a 160.000 durante el annealing.

El entrenamiento se hizo desde cero sobre 237.300 millones de tokens con 4 GPU H100. El currículum CLM→MLM dedica el primer 16,6 % de los tokens a modelado causal y el resto a modelado enmascarado; el cambio se produce dentro de la fase estable del schedule WSD. La fase de annealing alarga el contexto de 1.024 a 8.192 tokens, escala el θ de RoPE global a 160k y baja la tasa de enmascaramiento al 10 %. Un detalle relevante de este checkpoint concreto: la porción final de decaimiento se hizo a 1.024 tokens de contexto, no a 8.192.

El corpus procede de FineWeb2, registros WARC crudos de Common Crawl y fuentes impresas e institucionales, filtrado con un clasificador de calidad fastText destilado a partir de un BERT turco fine-tuneado. La mezcla final es aproximadamente 73 % turco, 17 % inglés y 10 % código, lo que explica que el modelo tenga cierta competencia colateral en inglés aunque se comercialice como encoder turco.

## Capacidades

- Relleno de máscaras (fill-mask / MLM): predice tokens enmascarados en texto turco, base de su uso zero-shot y few-shot.
- Codificación de texto para clasificación: al ser un encoder, se fine-tunea con una cabeza de clasificación para sentimiento, temas, moderación, detección de spam, etc.
- Extracción de información: NER, reconocimiento de entidades anidadas, extracción de relaciones y etiquetado de secuencias en general.
- Comprensión de contexto largo: 8.192 tokens permiten procesar artículos, contratos, informes o hilos de conversación completos sin truncar ni fragmentar.
- Búsqueda semántica y recuperación: el encoder crudo no es adecuado para similitud coseno directa (es anisótropo), pero la familia incluye MoganBERT-Embed (vectores únicos) y Mogan-ColBERT-TR (multi-vector) para retrieval.
- Razonamiento sobre texto y respuesta a preguntas extractivas cuando se fine-tunea con SQuAD-style, ya que la tarea se formula como etiquetado de spans.
- Capacidades multilingües limitadas: entrenado con ~17 % de inglés y ~10 % de código, puede transferir parcialmente a inglés y a dominios técnicos, pero no es un modelo multilingüe.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-step agéntico: es un encoder discriminativo, no un modelo causal conversacional.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de documentos largos en turco: con 8.192 tokens de contexto se puede clasificar un artículo completo, un contrato o una sentencia judicial sin truncar, algo imposible con encoders de 512 tokens como BERTurk.
- Reconocimiento de entidades nombradas (NER) en prensa y documentos administrativos turcos: el tokenizador de 50.048 tokens evita fragmentar palabras aglutinadas, lo que reduce errores en límites de entidad respecto a tokenizadores multilingües.
- Moderación de contenido y detección de discurso de odio: fine-tuning con una cabeza de clasificación sobre el encoder con pooling medio; la ventana larga permite analizar hilos de comentarios completos en lugar de mensajes aislados.
- Búsqueda semántica en corpus turcos: usando MoganBERT-Embed o Mogan-ColBERT-TR para generar embeddings y el encoder base para reranking de pasajes, se construye un pipeline de retrieval sobre documentación interna, legislación o catálogos.
- Análisis de opiniones y voz del cliente: clasificación multi-etiqueta de reseñas, tickets de soporte y encuestas en turco, con la ventaja de que el modelo ha sido preentrenado con una mezcla que incluye registros web reales.
- Extracción de información estructurada de facturas, formularios y contratos: etiquetado de secuencias para poblar bases de datos a partir de PDF convertidos a texto en turco.
- Respuesta a preguntas extractiva sobre base documental: localizar el span que responde a una consulta dentro de manuales técnicos o normativa, con el encoder fine-tuneado como extractor.
- Generación de embeddings para deduplicación y clustering de grandes volúmenes de texto turco, empleando los modelos de la familia orientados a representación vectorial en lugar del encoder crudo.

## Benchmarks y rendimiento

El autor declara evaluación en TrGLUE (8 tareas, 5 semillas oficiales, script oficial `run_trglue.py`) y en TabiBench (28 conjuntos de datos, 8 categorías), pero los resultados se presentan únicamente como imágenes (`assets/trglue_en.png` y `assets/tabibench_en.png`) y en el paper. No hay cifras numéricas en texto en la información disponible, por lo que no se reproducen aquí.

No se han publicado resultados de benchmarks numéricos en la informacion disponible.

Advertencias metodológicas declaradas por el autor: TabiBench es de una sola semilla, de modo que diferencias inferiores a un punto no constituyen un ordenamiento fiable entre modelos.

## Requisitos de hardware

- VRAM de pesos en inferencia: aproximadamente 0,3 GB en fp16/bf16, 0,6 GB en fp32 y unos 0,15 GB en int8. El repositorio ocupa 0,6 GB.
- VRAM total práctica: con overhead de runtime, activaciones y contexto de 8.192 tokens, cabe holgadamente por debajo de 2 GB en fp16 en la mayoría de frameworks.
- GPU: cabe en cualquier GPU de consumo. Modelos como RTX 3060, RTX 4060, RTX 4090, incluso iGPU modernas con suficiente memoria compartida, son suficientes. No requiere A100 ni H100; esas GPU solo tienen sentido para fine-tuning a gran escala o para procesar lotes muy grandes.
- Fine-tuning: con 149,4 M de parámetros es viable fine-tuning completo en una única GPU de consumo de 8-12 GB usando precisión mixta y batch pequeño; con secuencias de 8.192 tokens conviene reducir batch o usar gradient checkpointing.
- Opciones de despliegue: `transformers` (vía oficial, con `pipeline("fill-mask")`), y por ser un encoder, servidores de embeddings como Hugging Face Text Embeddings Inference (TEI) para codificación por lotes. El soporte en vLLM, llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponible. Al ser un encoder de 149,4 M con atención alternante local/global, el coste es muy inferior al de un transformer de atención completa del mismo tamaño en secuencias largas, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoganBERT-TR | 149,4 M | 8.192 tokens | Turco | Apache 2.0 | HuggingFace (`moganai/MoganBERT-TR`) |
| BERTurk (dbmdz/bert-base-turkish-cased) | ~110 M | 512 tokens | Turco | MIT | HuggingFace |
| Turkish ELECTRA (dbmdz/electra-base-turkish-cased-discriminator) | ~110 M | 512 tokens | Turco | MIT | HuggingFace |
| XLM-RoBERTa base | ~278 M | 512 tokens | Multilingüe (100 idiomas) | MIT | HuggingFace |
| MoganBERT-Embed | 149 M | no disponible | Turco | Apache 2.0 | HuggingFace (misma familia, orientado a embeddings) |
| Mogan-ColBERT-TR | 148,9 M | no disponible | Turco | Apache 2.0 | HuggingFace (misma familia, retrieval multi-vector) |

La ventaja diferencial de MoganBERT-TR frente a los encoders turcos clásicos es la ventana de contexto (8.192 frente a 512 tokens), la arquitectura ModernBERT con atención local/global y el tokenizador dedicado de 50.048 tokens. Frente a XLM-RoBERTa base gana en eficiencia (casi la mitad de parámetros), en contexto y en adaptación al turco. Los datos de los modelos comparados proceden de sus fichas públicas y conviene verificarlos antes de citarlos; no se dispone de cifras de benchmark comparativas en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder, no un modelo generativo: no produce texto libre, no hace tool calling, no soporta agentes ni razonamiento multi-step. Cualquier expectativa de uso conversacional es incorrecta.
- Representaciones anisótropas: el propio autor advierte que el encoder crudo no es adecuado para similitud coseno directa. Para embeddings hay que usar MoganBERT-Embed o Mogan-ColBERT-TR.
- Sin NSP: `[CLS]` no está preentrenado, así que usar la representación de `[CLS]` para clasificación es un error frecuente. Hay que usar `classifier_pooling="mean"`.
- Detalle del annealing: la fase final de decaimiento de este checkpoint se hizo a 1.024 tokens de contexto, aunque el modelo se anuncia con 8.192. El comportamiento efectivo en contextos muy largos puede degradarse respecto a lo que sugiere la ventana nominal; conviene validarlo en la tarea concreta.
- Riesgo de sesgo: el corpus proviene mayoritariamente de web rastreada (FineWeb2 y Common Crawl), con los sesgos demográficos, geográficos y de registro que ello implica. Además, el filtro de calidad es un clasificador fastText destilado de un BERT turco ya existente, de modo que hereda los sesgos de ese profesor.
- Riesgo de alucinación: en fill-mask y en tareas extractivas el modelo puede producir predicciones plausibles pero incorrectas; no hay verificación factual interna. En producción conviene umbral de confianza y validación posterior.
- Limitación idiomática: aunque el corpus incluye ~17 % de inglés y ~10 % de código, está declarado como modelo turco. El rendimiento fuera del turco no está garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin obligación de publicar derivados, pero obliga a conservar avisos de copyright y licencia. No cubre los derechos sobre los datos de entrenamiento (contenido web rastreado), que pueden tener sus propias restricciones.
- Ausencia de benchmarks numéricos en texto: no es posible validar afirmaciones de rendimiento sin consultar las figuras del repositorio o el paper.
- TabiBench es de una sola semilla: los autores advierten que diferencias inferiores a un punto no implican superioridad real.
- No se publican variantes cuantizadas ni formatos GGUF/ONNX, lo que limita su uso directo en stacks de inferencia de bajo nivel sin conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moganai/MoganBERT-TR
- Paper (arXiv 2608.25768): https://huggingface.co/papers/2608.25768
- Blog del autor: https://moganai.github.io/
- Colección de modelos MoganBERT: https://huggingface.co/collections/moganai/moganbert
- MoganBERT-Embed: https://huggingface.co/moganai/MoganBERT-Embed
- Mogan-ColBERT-TR: https://huggingface.co/moganai/Mogan-ColBERT-TR
- Dataset de entrenamiento: https://huggingface.co/datasets/moganai/mogan-turkish-web
- Dataset de entrenamiento: https://huggingface.co/datasets/moganai/turkishfineweb2-cleaned
