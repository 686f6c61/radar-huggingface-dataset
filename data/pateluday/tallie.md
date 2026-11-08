# pateluday/tallie

## Resumen

Tallie 1.0 es un modelo de extracción de información y minería de opiniones desarrollado por el usuario pateluday, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo no generativo derivado de Qwen3-1.7B: se le eliminó la cabeza de modelado de lenguaje, se podaron las 8 capas superiores (conservando 20 de las 28 originales) y se convirtió la atención causal en bidireccional. Sobre esa base se añadieron cuatro cabezas entrenadas con LoRA (mención, relevancia, opinión y tipo), dando como resultado un encoder de aproximadamente 1,33 mil millones de parámetros y unos 2,5 GB en bf16.

El modelo resuelve un problema concreto: dado un conjunto de comentarios de foro y una pregunta del tipo "tipo de cosa + opinión" (por ejemplo, "podcasts que la gente recomienda" o "libros más odiados"), extrae los elementos nombrados como spans literales del texto, les asigna un tipo (libro, película, serie, videojuego, juego de mesa, podcast, música, software, producto, persona u otro) y una polaridad (positiva, negativa, neutra o mixta), filtra los que encajan con la pregunta y los agrega en una lista ordenada por número de menciones.

Su relevancia actual reside en el enfoque "LLM-to-encoder": demuestra que destilar un modelo generativo en un encoder especializado con cabezas de clasificación permite procesar 130 comentarios por segundo en una sola NVIDIA L4, con salidas estructuradas y sin riesgo de inventar elementos, ya que todas las respuestas son spans copiados del texto original. El modelo está entrenado y evaluado únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Qwen3-1.7B (20 capas, atención bidireccional, sin cabeza de lenguaje) con 4 cabezas de clasificación entrenadas con LoRA |
| Parametros totales | ~1,33 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, ~2,5 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Tallie parte de Qwen3-1.7B, un transformer generativo de 28 capas. El proceso de conversión consistió en eliminar la cabeza de modelado de lenguaje (el modelo ya no puede generar texto), podar las 8 capas superiores para quedarse con 20, y sustituir la atención causal por atención bidireccional, de modo que cada token ve el comentario completo y la pregunta asociada. Sobre esta base se añadieron cuatro cabezas entrenadas con LoRA: una cabeza de mención que etiqueta con BIO qué palabras forman un elemento nombrado, una cabeza de relevancia condicionada por la pregunta, una cabeza de opinión (positiva, negativa, neutra, mixta) y una cabeza de tipo con once categorías.

El entrenamiento se basó en destilación desde un modelo profesor. La versión 0.1 usó etiquetas de un Qwen3-8B que solo alcanzaba 0,55 de F1 frente a etiquetas humanas, lo que limitó al estudiante a ~0,50 de F1 en nombres. La versión 0.2 sustituyó el profesor por uno más fuerte (0,88 de F1), añadió filtros de ruido y correcciones de spans, elevando el F1 de nombres a 0,85. La versión 1.0 incorporó la cabeza de tipo, una pérdida de opinión balanceada, más ejemplos de "nada coincide", un umbral de corte ajustado y 3 épocas de entrenamiento, alcanzando 0,86 de F1 en nombres y 0,68 de F1 end-to-end. La lección documentada por el autor es que la calidad de las etiquetas del profesor marca el techo del estudiante más que cualquier cambio arquitectónico. El conjunto de evaluación es un test etiquetado a mano con 150 comentarios de Hacker News, 224 elementos nombrados y 165 preguntas, con un tercio de comentarios sobre videojuegos, tema excluido del entrenamiento.

## Capacidades

- Extracción de entidades nombradas mediante etiquetado BIO y spans literales del texto.
- Clasificación de tipo de entidad en once categorías: libro, película, serie de televisión, videojuego, juego de mesa, podcast, música, software, producto, persona y otro.
- Análisis de sentimiento a nivel de aspecto con cuatro polaridades: positiva, negativa, neutra y mixta.
- Evaluación de relevancia condicionada por la pregunta del usuario, en el contexto de cada comentario, en lugar de coincidencia por palabras clave.
- Agregación y ranking: cuenta menciones por elemento (un voto por comentario) y devuelve listas ordenadas.
- Procesamiento por lotes de grandes volúmenes de texto (24 000 comentarios en el ejemplo de la model card).
- Salida estructurada (elemento + tipo + opinión) apta para filtrado y conteo programático.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Análisis de opinión en foros técnicos: indexar hilos de Hacker News o Reddit y responder preguntas como "lenguajes de programación que la gente recomienda", contando menciones positivas por lenguaje gracias a la cabeza de tipo y opinión.
- Investigación de mercado sobre productos: procesar reseñas o comentarios de comunidad para extraer qué productos se mencionan y con qué polaridad, generando rankings de productos más elogiados o más criticados.
- Curaduría de recomendaciones culturales: extraer libros, podcasts, series y videojuegos recomendados en comunidades, con agregación por número de menciones y sentimiento, útil para newsletters o motores de recomendación.
- Monitorización de reputación de software: detectar en hilos de discusión qué herramientas y librerías se mencionan y si la opinión es positiva o negativa, como señal temprana de satisfacción o deterioro.
- Enriquecimiento de datasets para NLP: generar etiquetas estructuradas (span, tipo, opinión) a gran escala a 130 comentarios por segundo en una L4, para alimentar pipelines de análisis posteriores o entrenar otros modelos.
- Moderación y análisis de comunidades: identificar personas u organizaciones mencionadas y la polaridad asociada en discusiones, para priorizar revisiones o detectar temas controvertidos.
- Extracción de entidades para bases de conocimiento: poblar grafos de conocimiento con entidades de tipo conocido extraídas de texto no estructurado, aprovechando que los spans son literales y no inventados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un test etiquetado a mano (150 comentarios de Hacker News, 224 elementos nombrados, 165 preguntas; un tercio de los comentarios sobre videojuegos, tema excluido del entrenamiento):

| Métrica | Tallie 1.0 |
|---|---|
| Detección de elementos nombrados (F1) | 0,86 (recall 0,94) |
| Precisión de tipo de elemento | 0,91 |
| F1 end-to-end de elementos correctos para la pregunta | 0,68 |
| F1 end-to-end en el tema no visto (videojuegos) | 0,65 |
| Precisión de opinión | 0,64 |
| Velocidad | 130 comentarios/s en una NVIDIA L4 |

Evolución entre versiones según el autor:

| Versión | Cambio | F1 nombres | F1 end-to-end |
|---|---|---|---|
| 0.1 | Etiquetas de profesor Qwen3-8B | ~0,50 | 0,50 |
| 0.2 | Profesor más fuerte (0,88 F1), filtros de ruido, corrección de spans | 0,85 | 0,59 |
| 1.0 | Cabeza de tipo, pérdida de opinión balanceada, más ejemplos negativos, umbral ajustado, 3 épocas | 0,86 | 0,68 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4 GB es suficiente según la model card (pesos en bf16 de ~2,5 GB más overhead).
- GPU recomendadas: NVIDIA L4 (referencia de velocidad del autor, 130 comentarios/s); cualquier GPU con al menos 4 GB de VRAM debería poder ejecutarlo.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060 y superiores).
- Opciones de despliegue: la model card documenta uso mediante la librería `transformers` (>=4.55) y `torch`, con un wrapper propio `Tallie` que se carga desde el snapshot del repositorio (`Tallie.load(path)`, `t.index(...)`, `t.ask(...)`, `t.extract(...)`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el campo `inference: false` de la model card sugiere que la inferencia gestionada en Hugging Face no está habilitada.
- Latencia y throughput: 130 comentarios por segundo en una sola NVIDIA L4, con una única pasada forward por comentario y sin generación token a token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Tallie 1.0 | Encoder con cabezas de clasificación (derivado de Qwen3-1.7B) | ~1,33B | no disponible | Apache 2.0 | Extracción de entidades, tipo y opinión con agregación y ranking |
| Qwen3-1.7B (modelo base) | LLM generativo | 1,7B | no disponible | Apache 2.0 | Generación de texto, razonamiento, tool calling |
| Qwen3-8B (profesor usado en la destilación) | LLM generativo | 8B | no disponible | Apache 2.0 | Generación de texto; usado como etiquetador con 0,88 F1 según el autor |

La diferencia clave frente a un LLM generativo es que Tallie no produce texto libre: devuelve spans literales del texto de entrada con etiquetas estructuradas, lo que elimina la posibilidad de inventar elementos y permite throughput muy superior en la tarea concreta de extracción y agregación de opiniones.

## Limitaciones y advertencias

- Dominio restringido: entrenado en Hacker News; es más fuerte en software, libros y cultura tecnológica, y más débil en música y televisión según el autor.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Rendimiento limitado en preguntas que requieren conocimiento externo sobre cada elemento, como "películas divertidas" o "libros sobre el rey Arturo"; la cabeza de relevancia no resuelve consultas de género o tema.
- Precisión de opinión moderada (0,64), inferior a la detección de entidades (0,86); la polaridad puede ser poco fiable en textos ambiguos o sarcásticos.
- F1 end-to-end de 0,68: aproximadamente un tercio de las respuestas correctas para la pregunta pueden perderse o incluir elementos no pertinentes.
- Dependencia de la calidad del profesor en el entrenamiento: el autor documenta que el estudiante no supera a su profesor, lo que acota el techo de calidad de las etiquetas.
- Riesgo de alucinación bajo en cuanto a elementos (los spans se copian del texto), pero posible en la asignación de tipo u opinión a spans mal delimitados.
- Sesgos: no se documentan análisis de sesgo; al entrenarse en Hacker News puede heredar sesgos de esa comunidad (predominio técnico, demográfico y cultural).
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache 2.0, por lo que no se identifican restricciones adicionales documentadas.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo día (8 de noviembre de 2026); no hay evidencia de uso en producción ni validación externa.
- El campo `inference: false` indica que no está disponible la inferencia gestionada en Hugging Face; el despliegue requiere infraestructura propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pateluday/tallie
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Ejemplo ejecutable mencionado en la model card: `example.py` dentro del repositorio del modelo
- Ejemplos de salida mencionados en la model card: `demo_examples.json` dentro del repositorio del modelo
