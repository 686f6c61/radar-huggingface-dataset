# g3ida/absir-arabic-ocr-mini

## Resumen

absir-arabic-ocr-mini es un modelo de OCR de pagina completa especializado en documentos arabes impresos, desarrollado por el usuario g3ida como segunda version de absir-arabic-ocr-1.6B. Con 705 millones de parametros, es menos de la mitad del tamano de su predecesor y, segun la model card, mejora a este en todas las metricas de texto evaluadas, ademas de en el reconocimiento de tablas del benchmark KITAB (TEDS 85,4 frente a 64,6). El modelo lee una imagen de pagina completa y devuelve el texto en orden de lectura con estructura HTML ligera: parrafos, encabezados de h1 a h6, negritas, superindices, saltos de linea, reglas horizontales, tablas y un bloque de notas al pie. Conserva los diacriticos (tashkeel).

Tecnicamente se construye sobre nvidia/Nemotron-3.5-Parse, un modelo multimodal de tipo image-text-to-text con un codificador visual de 0,44B parametros y un decodificador mBART de 10 capas. El autor lo sometio a fine-tuning supervisado sobre 58.700 imagenes de pagina procedentes de unas 3.400 libros, mas paginas renderizadas, y despues a varias rondas de aprendizaje por refuerzo GRPO para reducir repeticiones y bucles en la generacion.

Su relevancia actual reside en que ofrece un rendimiento en texto cercano a modelos mucho mayores (CER 0,019 en el subconjunto hindawi de KITAB-Bench, frente a 0,046 del modelo de 1,6B y 0,06 de Azure OCR) con un coste de inferencia muy bajo: el autor reporta procesar 400 paginas en 5,6 minutos sobre una unica RTX 3090. Esta pensado exclusivamente para arabe y para documentos impresos, no para manuscritos ni para otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en nvidia/Nemotron-3.5-Parse: codificador visual de 0,44B parametros y decodificador mBART de 10 capas |
| Parametros totales | 705.052.792 (aproximadamente 0,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | arabe (ar) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers (requiere trust_remote_code) |
| Modelo base | nvidia/Nemotron-3.5-Parse |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que combina un codificador visual de 0,44B parametros con un decodificador de lenguaje mBART de 10 capas, heredado de nvidia/Nemotron-3.5-Parse. La entrada es una imagen de pagina completa y la salida es texto generado de forma autorregresiva con marcado HTML ligero que representa la estructura del documento. El prompt de inferencia es fijo y especifico (`</s><s><no_bbox><no_classes><output_markdown><predict_no_text_in_pic>`); el autor advierte que los demas prompts del modelo base (cajas delimitadoras, clases de layout) no fueron entrenados para arabe en este fine-tuning.

El entrenamiento consistio en un ajuste supervisado sobre 58.700 imagenes de pagina provenientes de aproximadamente 3.400 libros, complementadas con paginas renderizadas, seguido de varias rondas de GRPO (Group Relative Policy Optimization) orientadas a reducir repeticiones y bucles en la decodificacion. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset. Las paginas se escalaron para ocupar 1664x2048 pixeles durante el entrenamiento, y el procesador solo reduce imagenes, por lo que el codigo de uso incluye una funcion `enlarge()` que amplia las paginas pequenas antes de la inferencia.

## Capacidades

- OCR de pagina completa de documentos arabes impresos, devolviendo el texto en orden de lectura.
- Generacion de estructura HTML ligera: `<p>` para parrafos, `<h1>` a `<h6>` para encabezados, `<strong>`, `<sup>` para marcadores de nota, `<br>` y `<hr>`.
- Reconocimiento de tablas impresas y tablas de contenidos, envueltas en `<table>`.
- Deteccion y volcado del bloque de notas al pie en `<footnotes>`.
- Preservacion de diacriticos arabes (tashkeel).
- Generacion de texto condicionada por imagen (image-text-to-text) con decodificacion greedy determinista.
- No soporta tool calling, function calling ni razonamiento multi-paso orientado a agentes; es un modelo especializado de un solo proposito.
- Capacidad multilingue limitada al arabe.

## Casos de uso

- Digitalizacion masiva de fondos bibliograficos arabes: el modelo procesa paginas completas de libros impresos y devuelve texto estructurado con parrafos y encabezados, lo que permite generar corpus textuales buscables a partir de escaneos. Su bajo coste (400 paginas en 5,6 minutos en una RTX 3090 con 16 peticiones concurrentes) lo hace adecuado para lotes de miles de paginas.
- Extraccion de tablas de contenidos y tablas de datos: gracias al marcado `<table>` y al TEDS de 85,4 en KITAB, puede emplearse para recuperar la estructura tabular de indices, cuadros estadisticos y anexos en documentos impresos.
- Preservacion de texto vocalizado: al conservar el tashkeel, es util en la digitalizacion de textos religiosos, poeticos o didacticos donde los diacriticos son semanticamente relevantes.
- Construccion de pipelines de document AI con notas al pie: el bloque `<footnotes>` permite separar el cuerpo del texto de las notas, facilitando la edicion academica y la relectura estructurada de articulos y libros.
- Indexacion y busqueda en archivos digitales: el texto en orden de lectura con encabezados jerarquicos permite segmentar por capitulos y secciones para motores de busqueda internos o sistemas RAG sobre documentacion arabe.
- Procesamiento de documentos modernos fuera de dominio con calidad aceptable: aunque su punto fuerte son libros impresos, en el benchmark Misraj-DocOCR obtiene CER 0,190 y WER 0,272, por delante de Gemini-2.5-Pro y Azure Document Intelligence en texto, lo que lo hace viable para facturas, formularios e informes con texto predominantemente impreso.
- Despliegue en hardware modesto: con 0,7B parametros y 1,4 GB de pesos, puede ejecutarse en una unica GPU de consumo para tareas de digitalizacion en local o en entornos con recursos limitados.

## Benchmarks y rendimiento

### KITAB-Bench OCR, subconjunto hindawi (200 paginas de libro)

| Modelo | CER | WER |
|---|---|---|
| Gemini-2.0-Flash | 0,01 | 0,04 |
| absir-arabic-ocr-mini | 0,019* | 0,069* |
| Nuqta-Arabic-OCR 4B (entrada recomendada) | 0,029 | no disponible |
| absir-arabic-ocr-1.6B | 0,046* | 0,145* |
| Azure OCR | 0,06 | 0,28 |
| Nuqta-Arabic-OCR 4B (imagenes tal cual) | 0,090 | no disponible |
| Qari | 0,11 | 0,15 |
| Surya | 0,15 | 0,20 |
| Qwen2.5-VL-7B | 0,27 | 0,42 |
| GPT-4o | 0,34 | 0,56 |

\* Los modelos absir emiten etiquetas HTML y la referencia hindawi es texto plano; las etiquetas se sustituyen por un espacio antes de puntuar.

### Misraj-DocOCR (400 paginas de documento moderno, fuera de dominio)

| Modelo | Tamano | CER | WER | chrF | TEDS | MARS |
|---|---|---|---|---|---|---|
| Nuqta-Arabic-OCR 4B (entrada recomendada) | 4,75B | 0,121 | 0,246 | 89,4 | 76,1 | 82,8 |
| Baseer v2 | no indicado | 0,12 | 0,19 | 88,9 | 67 | 77,8 |
| Gemini-2.5-Pro | cerrado | 0,31 | 0,37 | 89,6 | 52 | 70,8 |
| Azure Document Intelligence | cerrado | 0,27 | 0,44 | 82,5 | 42 | 62,2 |
| dots.ocr | 3B | 0,40 | 0,50 | 78,4 | 40 | 59,2 |
| absir-arabic-ocr-mini | 0,7B | 0,190 | 0,272 | 84,4 | 28,5 | 56,4 |
| GPT-5 | cerrado | 0,62 | 0,86 | 61,6 | 48 | 54,8 |
| absir-arabic-ocr-1.6B | 1,6B | 0,552 | 0,715 | 63,9 | 29,4 | 46,6 |
| QARI | no indicado | 0,64 | 0,76 | 64,5 | 21 | 42,8 |

En texto, absir-arabic-ocr-mini queda tercero tras Nuqta 4B y Baseer v2 (CER 0,190, WER 0,272), por delante de Gemini-2.5-Pro y Azure. En estructura de tablas de Misraj es debil: en 24 de las 59 paginas con tabla en la referencia escribe las celdas como parrafos en lugar de `<table>`, lo que TEDS puntua como 0. La model card menciona ademas un TEDS de 85,4 en reconocimiento de tablas de KITAB-Bench (241 tablas) frente a 64,6 del modelo de 1,6B, aunque la tabla completa de ese benchmark aparece truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 1,4 GB; con cache de activaciones y procesamiento de imagenes a 1664x2048, una GPU con 8-12 GB es suficiente. No se dispone de cifras oficiales de VRAM publicadas.
- GPU recomendadas: el autor reporta inferencia con vLLM sobre una unica RTX 3090 (24 GB) sirviendo 16 peticiones concurrentes. Cualquier GPU con al menos 8 GB deberia poder ejecutar el modelo en transformers.
- Cabe en GPU de consumo: si, incluidas RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090 y RTX 3090.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via oficial en la model card) y vLLM, que requiere el plugin de NVIDIA para Nemotron (`--trust-remote-code` y `chat_template.jinja`). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: con vLLM en una RTX 3090 y 16 peticiones concurrentes, 400 paginas de Misraj en 5,6 minutos, lo que equivale aproximadamente a 1,2 paginas por segundo. La decodificacion recomendada es greedy con `max_new_tokens=4096` y `repetition_penalty=1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (Misraj) | TEDS (Misraj) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| absir-arabic-ocr-mini | 0,7B | no disponible | 0,190 | 28,5 | openmdw-1.1 | Hugging Face |
| absir-arabic-ocr-1.6B | 1,6B | no disponible | 0,552 | 29,4 | no disponible | Hugging Face |
| Nuqta-Arabic-OCR 4B | 4,75B | no disponible | 0,121 | 76,1 | no disponible | Hugging Face |
| Baseer v2 | no indicado | no disponible | 0,12 | 67 | no disponible | no disponible |
| dots.ocr | 3B | no disponible | 0,40 | 40 | no disponible | no disponible |

Frente a Nuqta-Arabic-OCR 4B, el modelo de g3ida pierde en precision de texto y, sobre todo, en estructura de tablas en documentos modernos (TEDS 28,5 frente a 76,1), pero ofrece un rendimiento cercano con casi siete veces menos parametros. Frente a su predecesor de 1,6B, mejora de forma clara en texto (CER 0,552 a 0,190) y mantiene un TEDS similar en Misraj, aunque en KITAB la mejora en tablas es notable (85,4 frente a 64,6). Frente a modelos cerrados como Gemini-2.5-Pro o Azure, gana en texto pero queda por detras en estructura de tablas.

## Limitaciones y advertencias

- Especializado exclusivamente en arabe; no soporta otros idiomas ni manuscritos, solo documentos impresos.
- Debilidad en estructura de tablas en documentos modernos: en Misraj, 24 de 59 paginas con tabla se generan como parrafos, con TEDS 0 en esas paginas.
- Riesgo de repeticiones y bucles: requiere la estrategia de reintento documentada (repetition_penalty=1.2 y, si persiste, truncar donde empieza la repeticion). Afecta a unas pocas paginas por millar.
- Riesgo de alucinacion en texto no visible o en tablas mal segmentadas, inherente a los modelos generativos de OCR; no se han publicado evaluaciones especificas de fidelidad en este aspecto.
- El prompt de inferencia es fijo; usar otros prompts del modelo base (cajas, clases de layout) no produce resultados fiables.
- El procesador solo reduce imagenes: es obligatorio ampliar las paginas a 1664x2048 antes de la inferencia o la calidad cae.
- Licencia openmdw-1.1: conviene revisar sus terminos antes de uso comercial, ya que no es una licencia permisiva tipo Apache 2.0 ni MIT.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se dispone de informacion sobre sesgos, longitud de contexto o cuantizaciones soportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g3ida/absir-arabic-ocr-mini
- Version anterior: https://huggingface.co/g3ida/absir-arabic-ocr-1.6B
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Instrucciones de vLLM del modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse#inference-with-vllm
- Paper referenciado (arXiv:2502.14949): https://arxiv.org/abs/2502.14949
- Paper referenciado (arXiv:2509.18174): https://arxiv.org/abs/2509.18174
