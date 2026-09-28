# hranesscom/botfilter

# Botfilter (hranesscom/botfilter)

## Resumen

Botfilter es un clasificador de texto en inglés diseñado para estimar, como probabilidad calibrada, si un texto ha sido escrito probablemente por un modelo de lenguaje. Lo desarrolla el proyecto hranesscom y se distribuye como pesos ONNX cuantizados a int8 con un tamaño de 23,6 MB, lo que permite ejecutar la inferencia íntegramente en el dispositivo del usuario. Parte de `nreimers/MiniLM-L6-H384-uncased` y se ha ajustado como clasificador de dos clases; el resultado no es un modelo generativo ni un pipeline estándar de Transformers, sino un componente de una extensión de navegador cuyo código de preprocesado, agregación por ventanas y calibración vive en el repositorio del proyecto.

Su relevancia práctica está en el coste: en lugar de enviar texto a una API externa, el modelo cabe en una extensión de navegador y produce una puntuación local con umbrales configurables (Fewer, Balanced y More). Además, el autor publica cifras de evaluación sobre un conjunto de prueba sellado, con tasas de falsos positivos medidas por dominio, algo poco habitual en herramientas de detección de texto generado.

La versión documentada es `minilm-l6-v4-20260928`, con 22,7 millones de parámetros, ventana de entrada de hasta dos segmentos de 256 tokens WordPiece (inicio y final del texto), vocabulario WordPiece propio y licencia MIT. El autor advierte de forma explícita que la puntuación puede ser errónea y no debe usarse como prueba de autoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6), ajustado como clasificador de dos clases sobre `nreimers/MiniLM-L6-H384-uncased` |
| Parámetros totales | 22,7 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Dos ventanas de hasta 256 tokens WordPiece cada una (inicio y final del texto); no es un modelo generativo |
| Tipos de cuantización | int8 weight-only (23,6 MB). No se publican pesos FP16, GGUF ni otras variantes |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | MIT |
| Formato de pesos | ONNX, más vocabulario WordPiece, `calibration.json` y lockfile con sumas de verificación SHA-256, agrupados por versión en `releases/<version>/` |
| Preprocesado de entrada | Normalizador 2: comillas y guiones simples, letras tipográficamente parecidas mapeadas a latino, antes de la tokenización |
| Salida | Logit margin medio entre ventanas, convertido en probabilidad mediante una temperatura de calibración |
| Umbrales | Tres ajustes (Fewer, Balanced, More), diferenciados para textos de 25–80 palabras y para textos más largos |
| Texto no evaluado | Textos de menos de 25 palabras no se puntúan |
| Tamaño del repositorio | 0,0 GB según HuggingFace; el artefacto int8 declarado pesa 23,6 MB |
| Pipeline declarado | text-classification |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es MiniLM-L6-H384, un transformer encoder de 6 capas con dimensión oculta 384 y 22,7 millones de parámetros, ajustado como clasificador binario. La entrada no se procesa como un único bloque: el texto se normaliza, se tokeniza con WordPiece y se reparte en hasta dos ventanas de 256 tokens que cubren el principio y el final del documento. La puntuación final es la media del logit margin de las ventanas, y `calibration.json` contiene la temperatura que transforma ese margen en probabilidad, junto con los umbrales de los tres ajustes disponibles. El propio autor indica que estos ficheros no constituyen un pipeline de Transformers: el preprocesado, la agregación por ventanas y la calibración están definidos en la implementación de inferencia de la extensión.

Los datos de entrenamiento combinan texto humano y texto sintético en registros equivalentes. Como texto humano se usan artículos de noticias con licencia abierta de Common Pile (solo documentos cuyo metadato registra CC BY 4.0), entradas del blog gastronómico Foodista (CC BY 3.0), debates del Hansard del Parlamento del Reino Unido y mensajes escritos por trabajadores colaborativos en el conjunto Anthropic HH-RLHF (MIT). Como texto de IA se emplean 6.443 generaciones producidas por ocho modelos abiertos con licencia Apache-2.0 o MIT ejecutados por el proyecto (Qwen3, Phi-4, Mistral 7B y Small 24B, OLMo 2 y SmolLM3) y por siete modelos de API (GPT-6 Sol, GPT-5.5, GPT-5.6 Terra, Claude Sonnet 5, Claude Opus 5.5, Claude Haiku 4.5 y Mistral Medium 3.5), redactadas en los mismos registros que el texto humano. No se documenta en la información disponible el uso de RLHF, DPO ni un esquema de destilación.

## Capacidades

- Clasificación binaria de texto en inglés con salida probabilística calibrada (temperatura incluida en `calibration.json`).
- Detección de texto generado por modelos abiertos (Qwen3, Phi-4, Mistral 7B y Small 24B, OLMo 2, SmolLM3) y por modelos de API de OpenAI, Anthropic, Google y Mistral, incluyendo algunos no vistos en entrenamiento.
- Funcionamiento en el dispositivo: el artefacto int8 de 23,6 MB permite inferencia local sin enviar el texto a un servidor.
- Ajuste de sensibilidad en tres niveles (Fewer, Balanced, More), con umbrales separados para textos de 25–80 palabras y para textos largos.
- Agregación de extremos del documento mediante dos ventanas de 256 tokens, pensada para textos que superan la ventana de un solo segmento.
- Normalización previa de comillas, guiones y caracteres tipográficamente similares para reducir evasiones triviales.
- Verificabilidad de artefactos mediante lockfile con checksums SHA-256 por versión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador.
- No tiene capacidades multilingües: el inglés es el único idioma en alcance.

## Casos de uso

- Moderación de comunidades y foros: el modelo puede ejecutarse en el navegador del moderador o en un servicio local para marcar publicaciones sospechosas de generación automática antes de la revisión humana, con el ajuste More para priorizar la cobertura y el ajuste Fewer cuando el coste de un falso positivo sea alto.
- Filtrado de spam sintético en formularios y comentarios: al funcionar con 23,6 MB en int8 y sin dependencia de API, se puede integrar en el backend de validación de un formulario y aplicar una segunda revisión solo a los textos marcados, reduciendo el volumen de análisis manual.
- Auditoría de corpus de entrenamiento: permite estimar qué proporción de un dataset de texto en inglés contiene material generado por modelos, con la advertencia de que la detección de familias concretas cae hasta el 65 % en el caso de GPT-6 Sol, GPT-5.5 y GPT-5.6 Terra y hasta el 82 % en Claude Sonnet 5, Opus 5.5 y Haiku 4.5.
- Investigación sobre atribución y detección de texto: sirve como línea base reproducible y de pesos abiertos (MIT) para comparar contra detectores propietarios, con conjuntos de prueba propios y con las tasas de falsos positivos publicadas por dominio.
- Protección frente a phishing y correo generado: la tasa de falsos positivos medida en correo laboral humano es del 1,3 %, lo que permite plantear un marcado de mensajes sospechosos en clientes de correo con una tasa de ruido acotada, siempre con revisión humana y sin bloqueo automático.
- Clasificación de salidas en pipelines de generación: para etiquetar automáticamente texto sintético en un flujo de publicación, con umbrales distintos según la longitud del texto.
- Integración en extensiones de navegador: es el caso de uso original del proyecto; el modelo se ejecuta en el dispositivo y ofrece al usuario una probabilidad local sobre el texto que está leyendo o escribiendo.
- Señalización de contenido en plataformas editoriales: el autor reporta entre un 0,1 % y un 0,4 % de falsos positivos en noticias, blogs, textos parlamentarios y chat humanos, lo que da un margen razonable para marcar contenido en lugar de retirarlo.

## Benchmarks y rendimiento

Los siguientes datos proceden de la evaluación publicada por el autor sobre un conjunto de prueba sellado, con el ajuste Balanced y medidos una sola vez, después de fijar los umbrales. La columna indica el porcentaje marcado como probablemente escrito por IA.

| Conjunto de texto | Marcado como probablemente escrito por IA |
|---|---:|
| Noticias, blogs, texto parlamentario y chat humanos | 0,1–0,4 % |
| Publicaciones de Reddit humanas (nunca usadas en entrenamiento) | 0,7 % |
| Correo laboral humano (nunca usado en entrenamiento) | 1,3 % |
| Discusiones de GitHub y páginas web humanas (nunca usadas en entrenamiento) | 2,0–2,2 % |
| Texto de IA de los ocho modelos abiertos | 94 % |
| Texto de IA de Granite 3.3 y Gemini 3.8 Flash (no vistos en entrenamiento) | 97 % y 88 % |
| Texto de IA de Claude Sonnet 5, Opus 5.5 y Haiku 4.5 | 82 % |
| Texto de IA de GPT-6 Sol, GPT-5.5 y GPT-5.6 Terra | 65 % |
| Publicaciones sociales cortas de IA (menos de 80 palabras) | 82 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El artefacto publicado pesa 23,6 MB en int8; una conversión a FP32 a partir de los 22,7 millones de parámetros ocuparía aproximadamente 90 MB, cifra derivada del recuento de parámetros y no publicada por el autor.
- GPU recomendadas: ninguna específica. El modelo está pensado para ejecutarse en CPU, en el navegador o en el dispositivo del usuario; una RTX 4090, una A100 o una H100 son sobredimensionadas para este tamaño.
- Cabe en cualquier GPU de consumo e incluso en hardware integrado; la restricción real es la plataforma de ejecución (navegador, escritorio o servidor), no la memoria.
- Opciones de despliegue: ONNX Runtime en sus variantes web y de servidor, integrado en la implementación de inferencia del repositorio de la extensión. El autor señala que los ficheros publicados no proporcionan un pipeline de Transformers, por lo que el preprocesado, la agregación por ventanas y la calibración deben reproducirse desde el código del proyecto. No se documentan artefactos GGUF, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hranesscom/botfilter | 22,7 M | Inglés | MIT | ONNX int8 (23,6 MB) | Orientado a ejecución en el dispositivo; evaluación publicada con tasas de falsos positivos por dominio; requiere la implementación de inferencia del proyecto |
| openai-community/roberta-base-openai-detector | No disponible en la información consultada | Inglés | No disponible en la información consultada | PyTorch / safetensors | Detector basado en RoBERTa orientado a salidas de GPT-2; no se dispone de cifras comparables de falsos positivos por dominio |
| Hello-SimpleAI/chatgpt-detector-roberta | No disponible en la información consultada | Inglés y chino | No disponible en la información consultada | PyTorch / safetensors | Detector de texto de ChatGPT basado en RoBERTa; sin artefacto int8 orientado a navegador |
| Servicios comerciales de detección (GPTZero, Originality.ai y similares) | No disponible | Multiidioma según proveedor | Propietaria | API | Sin pesos abiertos ni ejecución local; el coste y la privacidad dependen del proveedor |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas homogéneas sobre un mismo conjunto de prueba que permitan contrastar estos modelos con Botfilter.

## Limitaciones y advertencias

- El propio autor advierte de que una puntuación puede ser errónea y no debe utilizarse como prueba de autoría. Cualquier uso disciplinario, académico o legal basado en la salida del modelo es inadecuado.
- Alcance limitado al inglés. El texto en otros idiomas queda fuera del ámbito del modelo.
- Los textos de menos de 25 palabras no se puntúan, por lo que no hay señal para fragmentos muy cortos.
- El rendimiento cae en textos de IA cortos: solo el 82 % de las publicaciones sociales sintéticas de menos de 80 palabras se marcan con el ajuste Balanced.
- La detección depende del modelo generador. La tasa de acierto baja al 65 % en GPT-6 Sol, GPT-5.5 y GPT-5.6 Terra, y al 82 % en Claude Sonnet 5, Opus 5.5 y Haiku 4.5, frente al 94 % en los ocho modelos abiertos empleados en entrenamiento. Es esperable un deterioro adicional con modelos futuros.
- Los textos editados conjuntamente por una persona y un modelo a menudo no se detectan.
- No se han medido tasas de falsos positivos en publicaciones de X y LinkedIn: el autor indica que no disponía de esos datos con derechos adecuados. Este es un punto ciego relevante para despliegues en redes sociales.
- Tasas de falsos positivos conocidas en dominios no vistos: 0,7 % en Reddit, 1,3 % en correo laboral y entre 2,0 % y 2,2 % en discusiones de GitHub y páginas web. En un volumen alto, estos porcentajes generan un número considerable de marcas incorrectas.
- La calibración es específica de la versión publicada. Deben usarse conjuntamente el modelo ONNX, el vocabulario, `calibration.json` y el lockfile de la misma versión; mezclar ficheros de versiones distintas invalida la interpretación probabilística de la salida.
- La licencia del modelo es MIT y permite uso comercial, pero el entrenamiento incorpora material con condiciones de atribución: información parlamentaria bajo Open Parliament Licence v3.0, artículos de noticias de Common Pile con CC BY 4.0, publicaciones de Foodista con CC BY 3.0 y Anthropic HH-RLHF con MIT. Conviene revisar las obligaciones de atribución antes de redistribuir el modelo o derivados.
- Los ficheros publicados no incluyen un pipeline listo para usar: sin el código de preprocesado, agregación y calibración del repositorio, los resultados no serán reproducibles.
- El repositorio figura con 0 descargas y 0 likes y un tamaño declarado de 0,0 GB, lo que indica una adopción nula y ausencia de validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hranesscom/botfilter
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Código fuente y extensión: https://github.com/hraness/botfilter
- Implementación de inferencia de la extensión: https://github.com/hraness/botfilter/tree/main/extension/src
- Sitio web del proyecto: https://botfilter.io
- Dataset de noticias de Common Pile: https://huggingface.co/datasets/common-pile/news
- Dataset de Foodista: https://huggingface.co/datasets/common-pile/foodista
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Open Parliament Licence v3.0: https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/
