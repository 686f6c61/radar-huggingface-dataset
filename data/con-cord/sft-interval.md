# con-cord/SFT-Interval

## Resumen

SFT-Interval es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario con-cord. Se trata de un ajuste fino supervisado (SFT, por sus siglas en ingles) sobre la familia Gemma 3 de Google, tal como indica la etiqueta `gemma3` del repositorio. El checkpoint contiene 4.300.079.472 parametros en formato safetensors (aproximadamente 4,3 mil millones), lo que lo situa en la gama de modelos compactos capaces de ejecutarse en hardware de consumo con la cuantizacion adecuada.

El modelo esta pensado para conversacion multimodal: acepta entradas de imagen y texto y genera texto, segun declara su pipeline `image-text-to-text`. La nomenclatura "Interval" sugiere un ajuste orientado a un dominio o tarea concreta, aunque el autor no documenta en la model card que intervalo, conjunto de datos o criterio de entrenamiento se ha utilizado. La model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva sobre datos, hiperparametros ni evaluacion.

Su relevancia actual es limitada pero practica: al derivar de Gemma 3, hereda la arquitectura y el tokenizador de una familia ampliamente soportada por transformers, vLLM y llama.cpp, lo que facilita su despliegue. No obstante, la ausencia de documentacion, de licencia explicita y de resultados de evaluacion obliga a tratarlo como un experimento de ajuste fino y no como un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 3 (image-text-to-text) |
| Parametros totales | 4.300.079.472 (4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,2 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo se etiqueta como `gemma3`, lo que implica que reutiliza la arquitectura de la familia Gemma 3 de Google: un transformer decoder-only con un codificador de vision para el procesamiento de imagenes y proyeccion de embeddings visuales al espacio del modelo de lenguaje. El numero de parametros (4,3 mil millones) es coherente con una variante compacta de esa familia, aunque el autor no confirma que variante exacta sirve de base.

El entrenamiento declarado es un ajuste fino supervisado (SFT), segun el propio nombre del repositorio. No se especifica el conjunto de datos, el numero de tokens, la composicion del dataset, la existencia de RLHF o DPO posteriores, ni los hiperparametros de entrenamiento (precision, tasa de aprendizaje, epocas). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Toda esta informacion figura como "More Information Needed" en la model card original.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `image-text-to-text` y la etiqueta `conversational`.
- Comprension de imagenes combinada con texto: el modelo acepta pares imagen-texto como entrada y produce respuestas textuales.
- Capacidad de generacion de texto general heredada de la base Gemma 3 (razonamiento basico, redaccion, resumen).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Modo thinking, vision avanzada, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripcion de imagenes en catalogo: el modelo puede recibir una fotografia de producto y generar una descripcion textual para fichas de e-commerce, aprovechando su naturaleza image-text-to-text. Requiere validacion manual por la falta de evaluacion publicada.
- Asistente conversacional con soporte visual: integrado en un chat que permita al usuario adjuntar capturas de pantalla o fotos y preguntar sobre ellas, con respuestas multi-turno.
- Extraccion de informacion de documentos escaneados: dado un recibo, factura o formulario en imagen, generar un resumen textual de los campos relevantes. Adecuado por su tamano compacto para despliegue en servidores modestos.
- Prototipado rapido de aplicaciones multimodales: al cargarse con transformers y pesar 17,2 GB en safetensors, sirve como base para experimentar con pipelines vision-lenguaje antes de invertir en modelos mayores.
- Ajuste fino adicional sobre dominio propio: al ser ya un checkpoint SFT, puede emplearse como punto de partida para un segundo ajuste con LoRA sobre datos especificos de una organizacion.
- Moderacion de contenido visual asistida: clasificacion y descripcion de imagenes enviadas por usuarios para revision humana posterior, siempre con supervision y sin depender unicamente de la salida del modelo.
- Generacion de texto en entornos con recursos limitados: su tamano de 4,3 mil millones permite cuantizacion a 4 bits y ejecucion en una unica GPU de consumo, lo que lo hace viable para demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K, MMMU ni similares) y el autor no aporta comparaciones con la base Gemma 3 ni con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 6 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5 a 4 GB, dependiendo de la implementacion.
- GPU recomendadas: A100 40 GB o H100 para servicio de alta concurrencia; L40S o A10G para despliegue en cloud; RTX 4090 (24 GB) para inferencia local sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF, aunque el autor no publica dichas conversiones.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SFT-Interval (con-cord) | 4,3 mil millones | no disponible | imagen-texto | no disponible | Hugging Face, safetensors |
| Gemma 3 (variante compacta, Google) | segun variante (4B disponible en la familia) | no disponible en esta ficha | imagen-texto | licencia Gemma | Hugging Face, ampliamente soportado |
| Qwen2.5-VL (variante pequena, Alibaba) | segun variante | no disponible en esta ficha | imagen-texto | Apache 2.0 en varias variantes | Hugging Face |
| Phi-3.5-vision (Microsoft) | aproximadamente 4,2 mil millones | no disponible en esta ficha | imagen-texto | licencia MIT | Hugging Face |

La comparacion se limita a categoria y tamano, ya que no hay datos de rendimiento publicados para SFT-Interval. Frente a sus alternativas, la principal desventaja es la falta de documentacion y de licencia explicita; la ventaja es que, al derivar de Gemma 3, hereda el ecosistema de herramientas de esa familia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 3, es previsible que arrastre sesgos de los datos de preentrenamiento de esa familia, pero no hay analisis publicado.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas de fidelidad, no hay garantia sobre la precision factual de las respuestas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, por lo que no se puede asumir cobertura multilingue ni ventanas largas.
- Licencia: no disponible. La ausencia de licencia explicita impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Procedencia del ajuste: la model card es la plantilla autogenerada, sin datos de entrenamiento, hiperparametros ni evaluacion; no se puede verificar la calidad del SFT.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Uso en produccion: no recomendado sin una evaluacion propia sobre el dominio objetivo y sin aclarar la licencia y la base exacta del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/con-cord/SFT-Interval
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
