# 3p3r/aegis-firewall-nsfw-text-light

## Resumen

Aegis Firewall NSFW Text Light es un clasificador binario de texto disenado para determinar si un contenido es NSFW (no seguro para el trabajo) u ofensivo, y por tanto debe mantenerse fuera de plataformas como YouTube. Lo desarrolla el usuario 3p3r y se distribuye bajo licencia GPL-3.0. El modelo responde con un simple "yes" o "no" a la pregunta de si el texto es inapropiado, lo que lo convierte en un filtro de moderacion de baja latencia mas que en un generador de texto.

Tecnicamente, el modelo parte del encoder `all-MiniLM-L6-v2` (un transformer pequeno de la familia Sentence Transformers, con unos 22 millones de parametros) afinado sobre un acelerador Hailo-10H integrado en un dispositivo Asus UGen300. La cabeza de clasificacion es una capa lineal que se ejecuta en el host, no en el chip. El modelo esta pensado para despliegue en hardware de borde con aceleracion Hailo, lo que explica su enfoque en latencia minima (8,8 ms por llamada en batch-1).

Su relevancia actual radica en la demanda de filtros de moderacion ligeros que puedan ejecutarse en dispositivos de bajo consumo sin depender de la nube. No obstante, el modelo es muy reciente (creado en noviembre de 2026 segun los metadatos), tiene cero descargas y cero likes, y su model card es extremadamente escueta. Solo soporta ingles y sus benchmarks estan limitados a 2.000 filas por conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de `all-MiniLM-L6-v2`) con cabeza lineal binaria en host |
| Parametros totales | no disponible (el encoder base `all-MiniLM-L6-v2` tiene ~22,7 M, pero no se confirma en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder base soporta hasta 256 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (optimizado para Hailo-10H, formato de compilacion propietario) |
| Idiomas soportados | en (ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; probablemente pesos compilados para Hailo, no safetensors/GGUF estandar) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `all-MiniLM-L6-v2`, un encoder transformer de tipo BERT miniaturizado (6 capas, 384 dimensiones ocultas, 12 cabezas de atencion) que originalmente produce embeddings de frases. El autor lo ha reentrenado para una tarea de clasificacion binaria: predecir "yes" o "no" ante la pregunta de si un texto es NSFW u ofensivo. La cabeza de clasificacion es una capa lineal que se ejecuta en el host (CPU del dispositivo), mientras que el encoder se ejecuta en el acelerador Hailo-10H del Asus UGen300.

El entrenamiento utiliza cuatro conjuntos de datos publicos de moderacion de contenido: Civil Comments, ToxiGen, OLID y X-Sensitive. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO (poco probable en un clasificador de este tipo). La innovacion tecnica principal es el despliegue en hardware de borde con aceleracion Hailo, que permite inferencia en 8,8 ms de media (mediana 8,8 ms) en batch-1 tras 300 llamadas de calentamiento. El autor menciona que la evaluacion esta limitada a 2.000 filas por bench porque puntuar los conjuntos completos es demasiado lento en el dispositivo.

## Capacidades

- Clasificacion binaria de texto: responde "yes" o "no" a la pregunta de si el contenido es NSFW u ofensivo.
- Deteccion de toxicidad, odio y contenido ofensivo en ingles.
- Inferencia de baja latencia en hardware de borde (Hailo-10H): 8,8 ms por llamada en batch-1.
- Ejecucion local sin dependencia de la nube, adecuada para filtrado en tiempo real.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni de agentes.
- Capacidad multilingue limitada al ingles.
- No dispone de modo "thinking" ni capacidades de audio.

## Casos de uso

- Moderacion de comentarios en plataformas de video: el modelo puede filtrar en tiempo real los comentarios de usuarios antes de publicarlos, descartando aquellos clasificados como NSFW u ofensivos, gracias a su latencia de 8,8 ms por inferencia.
- Filtrado de chat en directo: integrado en el pipeline de un stream, puede evaluar cada mensaje entrante y bloquearlo si el clasificador devuelve "yes", sin anadir latencia perceptible a la conversacion.
- Pre-filtrado en pipelines de moderacion mas complejos: al ser muy ligero, puede actuar como primera etapa que descarta contenido claramente toxico antes de enviar el resto a modelos mas grandes y costosos.
- Despliegue en dispositivos de borde sin conectividad: al ejecutarse en un acelerador Hailo-10H local, es adecuado para sistemas de moderacion en entornos con red limitada o requisitos de privacidad (el texto no sale del dispositivo).
- Clasificacion por lotes de contenido historico: util para auditar grandes volumenes de comentarios ya publicados y marcar los que requieran revision humana, aunque el autor advierte que el procesamiento completo de los conjuntos de evaluacion es lento en el dispositivo.
- Filtro de entrada para foros y comunidades: integrado en el backend de un foro, puede rechazar automaticamente publicaciones ofensivas en ingles antes de que lleguen a la base de datos.
- Moderacion de contenido generado por usuarios en apps moviles: al ser un modelo pequeno y ejecutable en hardware de borde, puede incorporarse en aplicaciones que necesiten filtrar texto localmente sin enviar datos a servidores externos.

## Benchmarks y rendimiento

Los resultados publicados por el autor, medidos en el Hailo-10H y contando como correcta una respuesta exacta "yes" o "no", son los siguientes (cada bench limitado a 2.000 filas):

| Bench | Correctas | Precision |
|---|---|---|
| GPT-HateCheck | 1341/1999 | 67,1% |
| HateCheck | 1202/1999 | 60,1% |
| Jigsaw toxic | 1827/1999 | 91,4% |
| Jigsaw unintended bias | 1894/1999 | 94,7% |
| OffensEval 2020 English | 1865/1999 | 93,3% |
| OLID | 714/848 | 84,2% |
| RealToxicityPrompts | 1767/1999 | 88,4% |
| Micro (agregado) | 10610/12842 | 82,6% |

Latencia en batch-1 (300 llamadas tras calentamiento): media 8,8 ms, mediana 8,8 ms.

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta compilado para ejecutarse en el acelerador Hailo-10H, no en GPU convencional.
- GPU recomendadas: no aplica; el destino es el Asus UGen300 con chip Hailo-10H.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: ejecucion en hardware Hailo-10H con la cabeza lineal en el host; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 8,8 ms de media y mediana en batch-1 (300 llamadas tras calentamiento) en el Hailo-10H.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros clasificadores de toxicidad en la informacion proporcionada. Como referencia cualitativa, el modelo se basa en `all-MiniLM-L6-v2`, un encoder de ~22,7 M de parametros con contexto de hasta 256 tokens, pero no se confirman estas cifras para el fine-tune ni se ofrecen alternativas comparables documentadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aegis Firewall NSFW Text Light | no disponible | no disponible | GPL-3.0 | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacidad multilingue.
- Precision limitada en benchmarks de hate speech: 60,1% en HateCheck y 67,1% en GPT-HateCheck, lo que indica un rendimiento flojo en deteccion de discurso de odio especifico.
- Evaluacion truncada a 2.000 filas por bench; el autor reconoce que puntuar los conjuntos completos es demasiado lento en el dispositivo, por lo que las metricas pueden no ser representativas del conjunto completo.
- Riesgo de falsos positivos y falsos negativos en contextos ambiguos, dado que la tarea es una clasificacion binaria simple.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser restrictivas para uso comercial propietario; es necesario revisar la compatibilidad con el producto.
- Modelo sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.
- Repo de 0.0 GB: no se confirma la disponibilidad de pesos en formatos estandar (safetensors, GGUF); el modelo parece orientado exclusivamente a hardware Hailo.
- No se documentan sesgos especificos, pero los datasets de entrenamiento (Civil Comments, ToxiGen, OLID, X-Sensitive) pueden introducir sesgos propios de sus fuentes.
- No apto para generacion de texto ni tareas fuera de la clasificacion binaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3p3r/aegis-firewall-nsfw-text-light
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset ToxiGen: https://huggingface.co/datasets/toxigen/toxigen-data
- Dataset OLID: https://huggingface.co/datasets/christophsonntag/OLID
- Dataset X-Sensitive: https://huggingface.co/datasets/cardiffnlp/x_sensitive
