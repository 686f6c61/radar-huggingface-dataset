# agbalu/Belaid-75M

## Resumen

Belaid-75M es un modelo de etiquetado de tokens (token classification) especializado en la restauración de puntuación y uso de mayúsculas en kabyle (taqbaylit, `kab`), una lengua bereber del norte de Argelia escrita en alfabeto latino. Lo desarrolla el autor agbalu como fine-tune del modelo base agbalu/Masinissa-73M, y resuelve un problema muy concreto de los pipelines de reconocimiento automático del habla y de normalización de corpus: los transcripciones ASR y los subtítulos crudos salen sin puntuación y en minúsculas, lo que los hace ilegibles y difíciles de procesar aguas abajo.

El modelo opera sobre una ventana de contexto de 1.024 tokens, lo que le permite trabajar sobre discurso continuo de varias frases en lugar de una sola emisión aislada. Para cada palabra predice simultáneamente el signo de puntuación que la sigue (`NONE`, `COMMA`, `PERIOD`, `QUESTION`, `COLON`) y la capitalización ortográfica exacta (`LOWER`, `UPPER_INIT`, `ALL_CAPS`). Una propiedad destacable es que nunca modifica la ortografía de las palabras: las preserva carácter a carácter, de modo que el riesgo de alucinación de contenido es nulo.

Su relevancia actual radica en que cubre una tarea de post-procesado poco atendida en lenguas de bajos recursos, con un backbone pequeño (75,1 M parámetros) que puede ejecutarse en hardware modesto y con licencia Apache 2.0, lo que facilita su integración en herramientas de transcripción y archivo para kabyle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabezas de clasificación de tokens personalizadas (custom modeling heads, requiere `trust_remote_code=True`) |
| Parametros totales | 75.147.533 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (subwords) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | kab (kabyle / taqbaylit, escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye como un fine-tune de agbalu/Masinissa-73M, un backbone de 20 capas y aproximadamente 73 M parámetros, sobre el que se añaden cabezas de modelado personalizadas incluidas en el repositorio. La tarea es de clasificación de tokens a nivel de palabra: cada token recibe una etiqueta de puntuación (cinco clases) y una etiqueta de capitalización (tres clases), lo que permite restaurar tanto los límites de cláusula y de frase como el uso de mayúsculas en nombres propios, acrónimos y clíticos con guion.

La innovación principal frente a su predecesor Belaid-31M es el salto de una ventana de 128 subwords (una sola emisión aislada) a 1.024 subwords, lo que habilita el procesamiento de discurso continuo multi-frase e identifica fronteras de oración a lo largo de párrafos completos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; la evaluación se realiza sobre un split diagnóstico reservado de discurso continuo con 128 ventanas y 18.621 palabras procedentes de 16 géneros distintos de kabyle (tesis, literatura, noticias, ensayos y habla transcrita).

## Capacidades

- Restauración de puntuación: inserta comas, puntos, dos puntos y signos de interrogación tras cada palabra según el contexto discursivo.
- Truecasing: predice la capitalización exacta de cada palabra (`LOWER`, `UPPER_INIT`, `ALL_CAPS`), incluida la detección de acrónimos e iniciales.
- Capitalización a nivel de componente en clíticos con guion (por ejemplo, `d-Taqbaylit`).
- Segmentación de fronteras de oración y de cláusula en discurso continuo de varias frases.
- Preservación ortográfica estricta: no edita, corrige ni reescribe las palabras, solo añade marcas de puntuación y capitalización.
- Procesamiento por lotes de pasajes de discurso mediante el método `restore(texts, tokenizer)`.
- Integración con la librería `transformers` y `torch` con `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Post-procesado de ASR: tomar la salida cruda de reconocedores CTC o estilo Whisper en kabyle y convertirla en texto legible con puntuación y mayúsculas, sin alterar ninguna palabra del transcriptor.
- Subtitulado y captioning: insertar pausas, comas de cláusula, signos de interrogación y terminadores de frase en subtítulos en streaming, aprovechando la ventana de 1.024 tokens para mantener coherencia entre líneas consecutivas.
- Normalización de corpus de archivo: restaurar mayúsculas estándar, nombres propios y puntuación sintáctica en transcripciones OCR o textos sin capitalización, con bajo riesgo porque el modelo no reescribe el contenido.
- Ingesta de corpus para NLP: preparar texto kabyle sin puntuar para entrenamiento de modelos posteriores, mejorando la calidad de los datos sin introducir errores ortográficos.
- Publicación y edición: aplicar el modelo como paso previo a la revisión humana de manuscritos, tesis o artículos en kabyle, reduciendo el trabajo manual de puntuación y capitalización.
- Herramientas de accesibilidad: mejorar la legibilidad de transcripciones automáticas para lectores con dificultades, añadiendo estructura de frases y signos de interrogación donde el habla los implica.
- Preprocesado para traducción o búsqueda: segmentar discurso continuo en oraciones y cláusulas antes de alimentar sistemas de traducción automática o índices de búsqueda, gracias a la segmentación de fronteras de oración.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split diagnóstico reservado de discurso continuo (128 ventanas, 18.621 palabras, 16 géneros), comparados con una línea base basada en reglas que capitaliza la primera palabra de cada fragmento y añade un punto final:

| Metrica | Baseline de reglas | Belaid-75M |
|---|---|---|
| Exact word casing accuracy | 0,000 | 0,940 |
| Sentence-final mark accuracy | 0,925 | 0,961 |
| Period F1 (internal & terminal) | 0,000 | 0,630 |
| Comma F1 | 0,000 | 0,623 |
| Colon F1 | 0,000 | 0,600 |
| Question F1 | 0,000 | 0,526 |
| Acronym / all-caps F1 | 0,000 | 0,755 (0,971 de precisión) |
| False insertions / 1.000 words | 0,0 | 29,9 |

Rendimiento por clase:

| Etiqueta | Soporte | Predichas | Precision | Recall | F1 |
|---|---|---|---|---|---|
| `NONE` | 15.343 | 15.515 | 0,953 | 0,964 | 0,958 |
| `COMMA` | 1.617 | 1.632 | 0,620 | 0,626 | 0,623 |
| `PERIOD` | 1.033 | 1.035 | 0,629 | 0,630 | 0,630 |
| `COLON` | 178 | 172 | 0,610 | 0,590 | 0,600 |
| `QUESTION` | 91 | 80 | 0,563 | 0,495 | 0,526 |

Los signos de interrogación en kabyle dependen de marcadores léxicos (`acu`, `anida`, `amek`, `melmi`, `ayɣer`) e inversión sintáctica, lo que explica el F1 de 0,526 en discurso continuo. La detección de acrónimos alcanza 0,755 F1 con 0,971 de precisión, identificando entidades políticas, culturales y administrativas (`MCB`, `HCA`, `FFS`, `RCD`) sin sobrecapitalizar sustantivos comunes. Los resultados están marcados como no verificados en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,3 GB en safetensors; con 75,1 M parámetros en fp32 ocupa unos 0,3 GB y en fp16 unos 0,15 GB, más el overhead del tokenizador y del runtime. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas RTX 3060, RTX 4060, RTX 4090, así como T4, L4, A10, A100 y H100. También funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en todas las GPU modernas de consumo, y en la mayoría de iGPU y CPU.
- Opciones de despliegue: `transformers` con `torch` (requiere `trust_remote_code=True` por las cabezas personalizadas). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF ni versiones cuantizadas publicadas, el despliegue estándar es el pipeline de clasificación de tokens de `transformers`.
- Latencia y throughput: no disponible. Al ser un encoder de 20 capas y 75 M parámetros sobre ventanas de 1.024 tokens, el coste por ventana es bajo, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Backbone | Contexto | Ambito de entrada | Exact word casing accuracy | Acronym F1 | Licencia |
|---|---|---|---|---|---|---|
| **Belaid-75M** | Masinissa-73M (20 capas) | 1.024 subwords | Discurso continuo multi-frase | 0,940 | 0,755 | Apache 2.0 |
| Belaid-31M | Masinissa-31M (6 capas) | 128 subwords | Emisión única aislada | 0,863 (una sola frase) | no soportado | no disponible en la información |
| Baseline de reglas | ninguna | no aplica | Fragmento completo | 0,000 | 0,000 | no aplica |

No se dispone en la información proporcionada de otros modelos comparables de restauración de puntuación para kabyle u otras variantes del tamazight; la comparación directa disponible es con Belaid-31M, su predecesor, y con la línea base de reglas.

## Limitaciones y advertencias

- Solo soporta kabyle: no es adecuado para otras variantes del tamazight como tashelhit, tarifit o shawiya, que tienen marcadores léxicos y sintácticos distintos.
- El F1 de signos de interrogación es bajo (0,526) y el de dos puntos es 0,600, por lo que la puntuación fina requiere revisión humana en contextos exigentes.
- Tasa de falsas inserciones de 29,9 por cada 1.000 palabras: añade marcas de puntuación donde no corresponden en aproximadamente un 3 % de las palabras, lo que puede requerir limpieza posterior.
- Riesgo de alucinación de contenido: nulo por diseño, ya que el modelo no edita las palabras y las preserva carácter a carácter; el riesgo se limita a la puntuación y la capitalización.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse sobre 16 géneros de kabyle (tesis, literatura, noticias, ensayos y habla transcrita), puede reflejar las convenciones ortográficas de esas fuentes.
- No apto para sistemas de toma de decisiones que afecten a personas ni para restauración epigráfica histórica, según el autor.
- Licencia Apache 2.0: permite uso comercial, pero requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código antes de desplegarlo en producción.
- Dependencia de un backbone pequeño: el rendimiento en dominios muy alejados de los 16 géneros de evaluación no está documentado.
- Los resultados de los benchmarks están marcados como no verificados por un tercero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agbalu/Belaid-75M
- Modelo base: https://huggingface.co/agbalu/Masinissa-73M
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos enlazados desde la model card.
