# IndexTeam/Index-Translate-2B

## Resumen

Index-Translate-2B es un modelo de traducción multilingüe de 2.274.069.824 parámetros (2,27B) desarrollado por el equipo Index LLM de bilibili (IndexTeam) y publicado bajo licencia Apache 2.0. Forma parte de la familia Index-Translate, construida sobre Qwen3.5, cuyos pesos de las variantes de texto 2B, 9B y 35B-A3B (preview) están disponibles en Hugging Face y ModelScope. El modelo cubre 150 idiomas y acepta instrucciones de traducción relativas a terminología, formato, estilo, estructura, contexto y longitud de salida.

Su interés actual reside en la combinación de un tamaño compacto, apto para despliegue en una única GPU de gama de consumo, con métricas de traducción que superan a Hy-MT2-1.8B en todas las métricas principales reportadas por los autores. Destaca especialmente en adherencia a instrucciones: obtiene 0,7569 de IFscore en instTrans y 0,6443 en MEME, muy por encima de los 0,4932 y 0,3643 de Hy-MT2-1.8B, y se acerca en calidad de traducción general a modelos de 7B y 12B como Hy-MT2-7B o TranslateGemma-12B.

El checkpoint evaluado combina tres especialistas (traducción general, seguimiento de instrucciones y traducción de memes) con pesos 0,8/0,1/0,1, seguidos de destilación selectiva. La ficha no documenta la longitud de contexto ni cuantizaciones oficiales, y el repositorio ocupa 9,1 GB en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3.5 (etiqueta `qwen3_5`); no se detallan más especificaciones en la información disponible |
| Parámetros totales | 2.274.069.824 (2,27B) |
| Parámetros activos | No aplica: variante densa; el sufijo A3B se reserva a la variante 35B-A3B (preview) de la familia |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 oficiales) |
| Idiomas soportados | 150 idiomas (inventario documentado en el informe técnico de la familia) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,1 GB) |

## Arquitectura y entrenamiento

El modelo es una variante densa de 2,27B parámetros construida sobre Qwen3.5 y especializada en traducción. El informe técnico describe una receta compartida de *mid-training* multilingüe seguida de un post-entrenamiento específico por tarea. La fase de mid-training combina *replay* de texto general, texto monolingüe, traducciones paralelas ordinarias y grupos multilingües organizados por pivote, con 167,77B de tokens en total. La etapa constante usa datos generales, paralelos y monolingües en proporción 1:1:1, mientras que la etapa de decaimiento emplea datos generales, de pivote principal y de pivote completo en proporción 1:4:2.

El post-entrenamiento se organiza en tres pasos. Primero, SFT y RL específicos para tres especialistas: traducción general, seguimiento de instrucciones y traducción de memes. El RL de traducción general combina XCOMET-XXL con juicios de validez lingüística y adecuación; el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas; RIVAL aporta supervisión adaptativa del juez. Después, la integración de expertos mediante interpolación de parámetros combina los especialistas complementarios. Finalmente, la destilación on-policy multi-profesor (MOPD) corrige los tipos de tarea que siguen siendo débiles tras la fusión. El checkpoint evaluado de 2B combina los especialistas general, de instrucciones y de memes con pesos 0,8/0,1/0,1 y recibe después MOPD selectivo.

## Capacidades

- Traducción multilingüe general de frases, artículos, subtítulos y otros textos en los 150 idiomas soportados.
- Traducción con instrucciones: preservación de términos especificados, estructuras JSON, código y marcadores de posición, además de adaptación de estilo y resolución de significado a partir del contexto.
- Traducción de longitud controlada (el informe menciona escenarios de traducción con control de sílabas en la familia).
- Traducción social y cultural: interpretación de alias de comunidad, grafías lúdicas, memes y expresiones no literales atendiendo al significado pretendido (MEME 0,6443).
- Adherencia a instrucciones de traducción medida de forma independiente de la calidad (instTrans IFscore 0,7569; IFMTBench IFscore 0,7584).
- Traducción de recursos bajos bajo instrucciones: 0,3050 de calidad y 0,6586 de IFscore en instTrans_minor, con un 3,97% de salidas fuera de objetivo (off-target).
- La familia incluye variantes de voz y de documentos largos (Index-NativeLong, publicadas como IndexTeam/Index-Nailong-2B y IndexTeam/Index-Nailong-9B) con interfaces y cobertura lingüística propias.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio o modo de razonamiento explícito para este checkpoint de texto.

## Casos de uso

- Localización de producto a gran escala: el modelo acepta instrucciones de terminología y formato, por lo que se puede fijar un glosario por cliente y mantenerlo consistente al traducir catálogos, fichas técnicas y descripciones de producto entre 150 idiomas con un único checkpoint de 2,27B.
- Subtitulado y doblaje: la familia cubre explícitamente subtítulos y escenarios de doblaje con control de sílabas; el modelo de 2B permite procesar grandes volúmenes de pistas de subtítulos en lotes sobre una sola GPU, con control de longitud de salida para respetar los tiempos de lectura.
- Traducción de documentación técnica y código: al preservar estructuras, código y marcadores, es adecuado para traducir ficheros Markdown, mensajes de interfaz con placeholders o documentación con bloques de código sin romper la sintaxis.
- Traducción de contenido generado por usuarios y redes sociales: con 0,6443 en MEME interpreta alias, grafías alteradas y expresiones no literales, lo que resulta útil en plataformas de vídeo y comunidades donde el lenguaje coloquial rompe los traductores genéricos.
- Traducción de recursos bajos para cobertura de mercado secundario: permite generar versiones en idiomas con pocos datos a partir de instrucciones en chino o inglés, con la advertencia de que la calidad cae hasta 0,3050 y aparece un 3,97% de salidas fuera de objetivo, por lo que requiere revisión humana.
- Preprocesado o postprocesado en pipelines de datos multilingües: puede normalizar y traducir corpus paralelos para alimentar otros modelos o sistemas de búsqueda, integrándose en flujos por lotes con vLLM o TGI gracias a su tamaño reducido.
- Evaluación de calidad de traducción asistida: al separar calidad (instTrans quality) y adherencia a instrucciones (IFscore), sirve como referencia interna para comparar proveedores de traducción bajo un mismo conjunto de restricciones de terminología y formato.

## Benchmarks y rendimiento

Resultados reproducidos del informe técnico de la familia. WMT26 Judge usa escala 0–100; el resto de columnas, escala 0–1. En todas las métricas, mayor es mejor. Estas cifras provienen de la evaluación de los propios autores, no de una evaluación independiente.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| Index-Translate-9B | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| Index-Translate-2B | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |
| North-Small-Translate (218B-A25B) | 0,8784 | 0,8578 | 68,37 | 0,5697 | 0,5294 | 0,7657 | 0,8635 | 0,8357 | 0,6836 |
| Qwen3.5-2B (base) | 0,6983 | 0,6933 | 32,11 | 0,0999 | 0,2431 | 0,6197 | 0,3836 | 0,7557 | 0,2062 |
| Qwen3.5-9B (base) | 0,8316 | 0,8073 | 60,31 | 0,2467 | 0,0609 | 0,7341 | 0,5980 | 0,8199 | 0,5728 |
| Qwen3.5-35B-A3B | 0,8570 | 0,8290 | 71,33 | 0,3690 | 0,5204 | 0,7589 | 0,7822 | 0,8267 | 0,6447 |
| DeepSeek-V4.1-Flash | 0,8762 | 0,8510 | 83,55 | 0,6068 | 0,6374 | 0,7817 | 0,9090 | 0,8432 | 0,7424 |
| GPT-5.6-Sol | 0,8650 | 0,8469 | 89,10 | 0,6902 | 0,7624 | 0,7946 | 0,9367 | 0,8311 | 0,7194 |
| Gemini 3.5 Flash Lite | 0,8750 | 0,8497 | 79,52 | 0,6068 | 0,6374 | 0,7764 | 0,8854 | 0,8131 | 0,7034 |

Datos adicionales de recursos bajos recogidos en la información disponible: el conjunto FLORES_minor_pair contiene 104.000 entradas en 1.040 direcciones entre 62 idiomas, e instTrans_minor contiene 2.793 tareas de traducción con instrucciones desde chino o inglés hacia idiomas de recursos bajos. El modelo obtiene 0,3050 de calidad y 0,6586 de IFscore en instTrans_minor, con un 3,97% de salidas fuera de objetivo. La información proporcionada se interrumpe en ese punto del informe, por lo que la tabla completa de recursos bajos no está disponible.

## Requisitos de hardware

- VRAM estimada para inferencia de un modelo denso de 2,27B parámetros: en FP16/BF16 los pesos ocupan aproximadamente 4,5 GB, por lo que conviene contar con 7–8 GB de VRAM considerando caché KV y activaciones; en INT8, alrededor de 2,3 GB de pesos y 4–5 GB totales; en INT4, en torno a 1,4 GB de pesos y 3–4 GB totales. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos publicados por el autor.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, así como portátiles con 8 GB de VRAM en cuantización de 8 o 4 bits.
- Para servidores, es suficiente una sola A100, H100, L40S o L4 para despliegue con batching; no se requiere tensor parallelism dado el tamaño del modelo.
- Opciones de despliegue: Transformers, vLLM, SGLang y TGI pueden cargar los pesos safetensors publicados con normalidad. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, ya que no se documentan cuantizaciones oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- El repositorio ocupa 9,1 GB, lo que sugiere que los pesos se distribuyen junto con artefactos adicionales además del checkpoint en precisión completa.

## Comparativa con modelos similares

| Modelo | Parámetros | FLORES COMET-22 | WMT24++ COMET-22 | instTrans IFscore | MEME | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Index-Translate-2B | 2,27B densos | 0,8655 | 0,8489 | 0,7569 | 0,6443 | Apache 2.0 | Hugging Face, ModelScope |
| Hy-MT2-1.8B | 1,8B | 0,8522 | 0,8401 | 0,4932 | 0,3643 | no disponible | comparado en el informe técnico |
| Hy-MT2-7B | 7B | 0,8747 | 0,8593 | 0,6079 | 0,5139 | no disponible | comparado en el informe técnico |
| TranslateGemma-12B (translategemma-12b-it) | 12B | 0,8732 | 0,8524 | 0,3068 | 0,4281 | no disponible | comparado en el informe técnico |
| Qwen3.5-2B (base) | 2B | 0,6983 | 0,6933 | 0,2431 | 0,2062 | no disponible | comparado en el informe técnico |

Frente a Hy-MT2-1.8B, de tamaño comparable, Index-Translate-2B mejora en FLORES COMET-22 (+0,0133), WMT24++ COMET-22 (+0,0088) y de forma muy marcada en adherencia a instrucciones (instTrans IFscore +0,2637) y en traducción de memes (+0,2800). Frente a modelos mayores, queda por debajo de Hy-MT2-7B en FLORES y WMT24++ (diferencias de 0,0092 y 0,0104), pero lo supera claramente en instTrans IFscore (+0,1490) y MEME (+0,1304). La comparación con TranslateGemma-12B muestra una calidad general inferior (0,8655 frente a 0,8732 en FLORES) pero una adherencia a instrucciones muy superior (0,7569 frente a 0,3068).

## Limitaciones y advertencias

- Riesgo de alucinación y de contenido inventado inherente a los modelos generativos; no se documentan tasas específicas para traducción general, solo el 3,97% de salidas fuera de objetivo en traducción de recursos bajos con instrucciones.
- Calidad notablemente inferior en idiomas de recursos bajos: 0,3050 de calidad en instTrans_minor frente a 0,5391 en instTrans general, lo que limita su uso sin revisión humana en esos pares.
- Descenso acusado respecto a las variantes mayores de la propia familia: 0,5391 de instTrans quality frente a 0,6771 del 9B, y 60,26 en WMT26 Judge frente a 75,35 del 9B.
- Membresía en redes sociales: aunque el 0,6443 en MEME supera a modelos mayores como Hy-MT2-7B o TranslateGemma-12B, queda por debajo de Index-Translate-9B (0,7387) y de modelos frontera.
- No se documenta la longitud de contexto soportada, dato crítico para traducción de documentos largos; la familia remite a modelos específicos (Index-NativeLong) para ese escenario.
- No hay cuantizaciones oficiales publicadas, por lo que el despliegue en llama.cpp u Ollama exige conversión propia y validación posterior.
- Los resultados de benchmarks proceden del informe técnico de los propios autores, con conjuntos y configuraciones definidos por ellos y escalas de métrica no homogéneas entre columnas; no hay verificación independiente disponible.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe.
- Adopción muy temprana: el repositorio acumula 24 descargas y 12 "me gusta" en la fecha de consulta, por lo que la validación por parte de la comunidad es todavía escasa.
- No se han publicado datos de sesgos específicos ni de comportamiento en dominios sensibles (legal, médico, financiero).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-2B
- Colección Index-Translate en Hugging Face: https://huggingface.co/collections/IndexTeam/index-translate
- Colección Index-Translate en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
- Repositorio en GitHub: https://github.com/bilibili/Index-Translate
- Informe técnico (PDF): https://github.com/bilibili/Index-Translate/blob/main/docs/Index_Translate_Series_Technical_Report.pdf
- Demo en línea: https://index-translate.bilibili.com/
- Noticia sobre la publicación de los pesos de 2B, 9B y 35B-A3B: https://phemex.com/news/article/bilibili-opensources-indextranslate-model-supporting-150-languages-98353
- Noticia sobre la cobertura de 150 idiomas y los escenarios de subtitulado y documentos largos: https://panews.io/articles/01a0f2b8-887c-72f6-b3a6-d8f6fa368e66
- Noticia sobre el lanzamiento oficial de la familia Index-Translate: https://www.coinmeta.com/en/news/1248975
