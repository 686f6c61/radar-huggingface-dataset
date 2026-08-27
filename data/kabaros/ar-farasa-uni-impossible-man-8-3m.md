# kabaros/ar-farasa-uni-impossible-man-8.3M

## Resumen

El modelo `kabaros/ar-farasa-uni-impossible-man-8.3M` es un modelo de lenguaje causal de tipo GPT-2, entrenado exclusivamente en árabe, con aproximadamente 17 millones de parámetros. Forma parte de un conjunto de seis modelos desarrollados en el marco de una tesis de máster de la Universidad de Stirling (Reino Unido) que investiga el impacto de la tokenización y la composición de corpus en modelos de lenguaje árabes de pequeña escala. Este checkpoint concreto utiliza un tokenizador personalizado (Farasa + Unigram) que aplica segmentación morfológica antes de cada codificación, y fue entrenado sobre un corpus de 8,3 millones de palabras compuesto por un 20% de libros electrónicos, un 42% de textos de Hindawi y un 38% adicional (no especificado en la documentación).

El modelo está diseñado para tareas de investigación y experimentación, no para producción. Su principal contribución es demostrar cómo la elección del tokenizador y la composición del corpus afectan a la gramaticalidad del texto generado, medida mediante la tarea MultiBLiMP de juicio de pares mínimos. Con una puntuación de 79,26 en MultiBLiMP, supera al baseline de BabyLM-ara (75,9) y se acerca a modelos mucho más grandes como OLMo-2 (87% con 32B de parámetros), lo que subraya la eficiencia de la segmentación morfológica en dominios de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) con `n_embd=512`, `n_layer=4`, `n_head=8`, `n_ctx=512` |
| Parametros totales | 17.067.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Arabe (ar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar con 4 capas transformer, 8 cabezas de atención y una dimensión de embedding de 512. La innovación principal reside en el tokenizador: se trata de una subclase de `PreTrainedTokenizerFast` que aplica segmentación morfológica con Farasa antes de cada llamada a `encode`. Esta segmentación descompone las palabras en sus raíces y afijos, lo que reduce la dispersión del vocabulario y mejora el modelado en árabe, una lengua morfológicamente rica.

El entrenamiento se realizó sobre un corpus de aproximadamente 8,3 millones de palabras, compuesto por una mezcla específica de libros electrónicos (20%), textos de Hindawi (42%) y otro 38% no detallado. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento de modelado de lenguaje causal estándar. El checkpoint publicado corresponde a la semilla 42 (por defecto) y es el mejor de tres ejecuciones para esa composición de corpus.

## Capacidades

- Generacion de texto en arabe: produce texto coherente y gramaticalmente aceptable para frases cortas y contextos limitados.
- Evaluacion de gramaticalidad: gracias a su entrenamiento, puede utilizarse para tareas de juicio de pares minimos (MultiBLiMP) y deteccion de anomalias sintacticas.
- Segmentacion morfologica integrada: el tokenizador Farasa + Unigram permite un tratamiento explicito de la morfologia arabe, lo que mejora el rendimiento en tareas que requieren comprension de raices y patrones.
- Modelado de lenguaje de baja escala: adecuado para experimentos de eficiencia de datos y comparaciones de tokenizadores en entornos con recursos limitados.
- No soporta tool calling, agentes, vision ni audio; es un modelo puramente textual.

## Casos de uso

- Investigacion en NLP arabe: sirve como punto de referencia para estudiar el efecto de la segmentacion morfologica en modelos pequenos, permitiendo comparar metricas de gramaticalidad con otros tokenizadores (BPE, Unigram, etc.).
- Evaluacion de calidad de corpus: al entrenarse sobre distintas composiciones de dataset, puede usarse para medir la influencia de fuentes textuales (ebooks, Hindawi, etc.) en la fluidez del lenguaje generado.
- Prototipado de generacion de texto corto: para aplicaciones de relleno de texto, autocompletado o generacion de frases en arabe, siempre que el contexto no supere 512 tokens.
- Ensenanza y formacion: util en cursos de procesamiento de lenguaje natural para ilustrar la arquitectura GPT-2 y el impacto de la tokenizacion en modelos de bajos recursos.
- Comparacion de tokenizadores: permite reproducir experimentos de la tesis y validar resultados con otras metricas o datasets adicionales.
- Baseline para modelos mas grandes: puede servir como modelo de referencia economico (17M de parametros) para calibrar expectativas de rendimiento antes de entrenar modelos mas costosos.

## Benchmarks y rendimiento

El unico benchmark reportado es MultiBLiMP (juicio de pares minimos, media de 3 semillas). Para este checkpoint concreto (semilla 42, mejor de 3) se obtuvo una puntuacion de 79,26. La tabla siguiente compara este resultado con otros modelos de la misma tesis y con referencias externas.

| Modelo | Parametros | MultiBLiMP (arabe) |
|---|---|---|
| `ar-farasa-uni-impossible-man-8.3M` (este) | 17M | 79,26 |
| Baseline BabyLM-ara (BPE) | ~17M | 75,9 |
| OLMo-2 (32B, 6T tokens) | 32B | 87,0 |
| `ar-camel-custom-8.3M-wiki_0-movies_0-habibi_0-ebooks_100-seed44` | 17M | 80,33 |
| `ar-camel-with-unigram-custom-8.3M-wiki_0-movies_0-habibi_5-ebooks_95-seed43` | 17M | 79,26 |
| `ar-camel-with-unigram-custom-8.3M-wiki_0-movies_5-habibi_0-ebooks_95` | 17M | 79,67 |
| `ar-camel-with-unigram-diversity-8.3M-seed44` | 17M | 77,61 |

Nota: los datos de los otros modelos de la tesis provienen de la tabla publicada en la model card. No se dispone de resultados adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (17M de parametros). Con cuantizacion a 8 bits o 4 bits, podria ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.). Tambien funciona en CPU para inferencia de baja latencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU moderna, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: se puede cargar con `transformers` (usando `trust_remote_code=True`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo GPT-2 estandar, podria adaptarse a estos entornos si se exporta a GGUF.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano, la generacion de 100 tokens deberia tardar menos de 1 segundo en una GPU moderna.

## Comparativa con modelos similares

La comparativa se centra en los otros cinco modelos de la misma tesis, ya que comparten arquitectura y tamano, pero difieren en tokenizador y composicion del corpus. Tambien se incluye el baseline de BabyLM-ara.

| Modelo | Tokenizador | Composicion del corpus | MultiBLiMP |
|---|---|---|---|
| `ar-farasa-uni-impossible-man-8.3M` | Farasa + Unigram | 20% ebooks, 42% Hindawi, 38% otro | 79,26 |
| `ar-camel-custom-8.3M-wiki_0-movies_0-habibi_0-ebooks_100-seed44` | CAMeL (BPE) | 100% ebooks | 80,33 |
| `ar-camel-with-unigram-custom-8.3M-wiki_0-movies_0-habibi_5-ebooks_95-seed43` | CAMeL + Unigram | 5% habibi, 95% ebooks | 79,26 |
| `ar-camel-with-unigram-custom-8.3M-wiki_0-movies_5-habibi_0-ebooks_95` | CAMeL + Unigram | 5% movies, 95% ebooks | 79,67 |
| `ar-camel-with-unigram-diversity-8.3M-seed44` | CAMeL + Unigram | Corpus diverso | 77,61 |
| Baseline BabyLM-ara (BPE) | BPE | Original | 75,9 |

El modelo con mejor puntuacion es el de 100% ebooks con tokenizador CAMeL (BPE), con 80,33. Este modelo con Farasa + Unigram obtiene 79,26, similar al de 5% habibi. La diferencia es pequena, pero demuestra que la segmentacion morfologica de Farasa no supera a CAMeL en este corpus concreto.

## Limitaciones y advertencias

- Tamano y contexto: con solo 17M de parametros y 512 tokens de contexto, el modelo no es adecuado para tareas que requieran razonamiento complejo, generacion de texto largo o comprension de documentos extensos.
- Sesgos del corpus: la composicion (20% ebooks, 42% Hindawi, 38% no especificado) puede introducir sesgos tematicos y estilisticos. No se ha realizado una evaluacion de sesgos de genero, raza o religion.
- Riesgo de alucinacion: al ser un modelo pequeno, es propenso a generar contenido incoherente o factualmente incorrecto, especialmente fuera del dominio de entrenamiento.
- Idioma unico: solo soporta arabe. No hay capacidades multilingues.
- Dependencia de codigo remoto: el tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio. Se recomienda auditar el codigo antes de usarlo en entornos de produccion.
- Licencia CC-BY-4.0: permite uso comercial y modificacion, pero exige atribucion. No hay restricciones adicionales, pero el modelo se ofrece sin garantias.
- Sin soporte para tool calling ni agentes: no se puede integrar en pipelines que requieran llamadas a funciones o razonamiento multi-paso.

## Enlaces

- [HuggingFace - kabaros/ar-farasa-uni-impossible-man-8.3M](https://huggingface.co/kabaros/ar-farasa-uni-impossible-man-8.3M)
- [Dataset companion (ejemplo) - kabaros/ara-ebooks-heavy-8.3M](https://huggingface.co/kabaros/ara-ebooks-heavy-8.3M) (mencionado en la model card, no verificado)
- No se han encontrado otros enlaces (papers, blogs, repos) en la busqueda web realizada.
