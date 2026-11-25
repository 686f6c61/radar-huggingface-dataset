# aelgendy/QModel

## Resumen

QModel 8.6 es un sistema de generacion aumentada por recuperacion (RAG) especializado en responder preguntas sobre el Coran, el Hadiz y fatuas en arabe e ingles. Lo desarrolla el usuario aelgendy y se distribuye bajo licencia MIT. No se trata de un modelo de lenguaje entrenado desde cero, sino de un pipeline que combina un modelo base de 14.770.033.664 parametros (Qwen2.5-14B-Instruct, en formato GGUF) con un indice de busqueda de 56.250 textos verificados, embeddings densos y un cross-encoder de reranking. El modelo base se encarga unicamente de redactar la respuesta a partir de los textos recuperados.

La relevancia del proyecto radica en su enfoque de verificacion estricta: cada versiculo, hadiz o fatua citada se contrasta palabra por palabra contra la fuente recuperada y se enlaza a la referencia exacta (quran.com, coleccion y numero de hadiz, enlace a fatua). El autor documenta explicitamente que un modelo de 14B no conoce el Coran de memoria: en una prueba con 30 versiculos aleatorios, identifico correctamente la sura y aleya solo 4 veces y no completo ninguno de forma correcta. Por eso el diseno separa la recuperacion fiable de la generacion.

El sistema se ofrece de dos formas: el modelo GGUF suelto (que no busca en los textos verificados y solo cita Al-Fatiha, Al-Ikhlas y Al-Falaq) y la API QModel completa, que es la via recomendada. La version actual es la 8.6.0 y el repositorio ocupa 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-14B-Instruct) integrado en un pipeline RAG con busqueda densa (multilingual-e5-large), BM25 con raices arabes y reranking cross-encoder (bge-reranker-v2-m3) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona Q8_0 para el modelo base); no se detallan otras variantes |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base); el repositorio incluye codigo Python, indice de busqueda y ficheros de configuracion |

## Arquitectura y entrenamiento

QModel no entrena un modelo de lenguaje propio. Su arquitectura es un pipeline de recuperacion en cinco etapas sobre un LLM generico de 14B. En la primera etapa, la pregunta se busca simultaneamente en arabe e ingles mediante embeddings densos (multilingual-e5-large) y busqueda por palabras clave BM25 con coincidencia de raices arabes, y los resultados se fusionan. En la segunda, un cross-encoder (bge-reranker-v2-m3) puntua los mejores candidatos, garantizando que cada tipo de fuente (Coran, hadiz, fatua) reciba sus propios mejores resultados para que los versiculos no queden desplazados por la coleccion de hadices, mucho mas grande.

La tercera etapa es una compuerta: si no se encuentra nada relevante, el sistema lo indica sin invocar al LLM. En la cuarta, el modelo de lenguaje redacta la respuesta exclusivamente a partir de los textos recuperados. En la quinta, cada cita se compara con los textos recuperados: las copias cercanas se restauran a la redaccion exacta, lo demas se elimina, se anaden los enlaces que falten y se regeneran las respuestas que derivan hacia el chino. El indice contiene 56.250 textos verificados. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre el proceso de alineacion (RLHF/DPO) de Qwen2.5-14B-Instruct en esta ficha.

## Capacidades

- Generacion de respuestas sobre Coran, Hadiz y fatuas en arabe e ingles, construidas exclusivamente a partir de textos recuperados y verificados.
- Busqueda semantica y por palabras clave con soporte de raices arabes sobre 56.250 textos.
- Verificacion palabra por palabra de cada cita contra la fuente, con restauracion de la redaccion exacta o eliminacion de la cita.
- Enlace automatico a referencias exactas: quran.com, coleccion y numero de hadiz, enlace a fatua.
- Rechazo de preguntas fuera de dominio (25 de 25 preguntas no relacionadas rechazadas en la evaluacion).
- API compatible con OpenAI (`POST /v1/chat/completions`) con streaming, integrable en Open-WebUI.
- Endpoints especializados de consulta: versiculo concreto, busqueda por texto o tema, capitulo, frecuencia de palabras, analisis de raiz, verificacion de hadiz, navegacion por coleccion y busqueda de fatuas.
- Filtro por tipo de fuente (`quran`, `hadith`, `fatwa`) y por grado de hadiz (`sahih`).
- Modo de respuesta con temperatura baja (0,2 por defecto) orientado a respuestas religiosas conservadoras.
- No se documentan capacidades de vision, audio, tool calling generico ni agentes multi-paso fuera del propio pipeline.

## Casos de uso

- Asistente de consultas religiosas en mezquitas y centros islamicos: el sistema responde preguntas sobre versiculos, hadices y fatuas citando la fuente exacta con enlace, lo que permite al usuario verificar cada afirmacion antes de difundirla.
- Integracion en Open-WebUI o interfaces chat corporativas: mediante la conexion compatible con OpenAI en `http://localhost:8000/v1`, se puede desplegar como asistente interno sin escribir frontend propio.
- Verificacion de citas en publicaciones y sermon: el endpoint `/hadith/verify` permite comprobar si un hadiz existe en las colecciones y con que grado, util para revisar materiales antes de publicarlos.
- Estudio y docencia del arabe coranico: los endpoints `/quran/word-frequency` y `/quran/root/رحم` permiten analisis de frecuencia y raices para materiales didacticos.
- Construccion de bases de conocimiento y busqueda tematica: `/quran/topic` y `/hadith/topic` permiten recuperar pasajes por tema para alimentar articulos, cursos o aplicaciones educativas.
- Moderacion y filtrado de contenido: la compuerta de relevancia rechaza preguntas fuera de dominio, lo que sirve para acotar un asistente tematico y evitar respuestas especulativas.
- Investigacion sobre pipelines RAG verificables: el codigo, el indice y el conjunto de evaluacion (`eval/golden.jsonl`, 147 preguntas etiquetadas) sirven como referencia reproducible para disenar sistemas RAG con verificacion de citas.

## Benchmarks y rendimiento

Metricas de recuperacion y respuesta publicadas por el autor sobre 147 preguntas etiquetadas (122 respondibles, 25 fuera de tema), noviembre de 2026:

| Metrica | Resultado |
|---|---|
| Una fuente correcta entre las 8 recuperadas | 93% |
| ...y es la primera | 74% |
| Se recuperan todas las fuentes que necesita una respuesta completa | 79% |
| Preguntas fuera de tema rechazadas | 25 de 25 |
| Preguntas respondibles rechazadas | 0 de 122 |

Rendimiento en Apple M5 Max con backend GGUF: la busqueda tarda unos 3 s y una respuesta completa unos 26 s (mediana). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- RAM: unos 16 GB para ejecutar la API completa con el modelo GGUF por defecto (segun la model card).
- Almacenamiento: 16 GB de repositorio; el modelo base GGUF Q8_0 se descarga aparte (se excluye con `--exclude "models/*"` si se usa Ollama).
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090) en la informacion disponible. El rendimiento documentado se midio en un Apple M5 Max, lo que sugiere viabilidad en hardware de consumo de gama alta con suficiente memoria unificada.
- Despliegue: backend GGUF (por defecto), Ollama (`arelgendy/qmodel:8.6`) o Hugging Face (`hf`); API FastAPI en el puerto 8000 con documentacion en `/docs`; integracion con Open-WebUI.
- Backends de inferencia alternativos (vLLM, llama.cpp, TGI) no se detallan en la informacion disponible.
- Latencia y throughput: busqueda ~3 s y respuesta completa ~26 s de mediana en Apple M5 Max con GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QModel 8.6 | 14.770.033.664 (base Qwen2.5-14B-Instruct) | no disponible | RAG verificado sobre 56.250 textos islamicos | MIT | Hugging Face, Ollama, API propia |
| Qwen2.5-14B-Instruct | 14B | no disponible en esta ficha | LLM generalista | no disponible en esta ficha | Hugging Face, GGUF (bartowski) |
| Modelos especializados en arabe/islamico de proposito general | no disponible | no disponible | LLM afinado sin verificacion de citas | no disponible | no disponible |

La comparativa directa con alternativas especializadas no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es que QModel anade recuperacion, reranking, compuerta de relevancia y verificacion de citas, a costa de requerir el indice y el pipeline completo.

## Limitaciones y advertencias

- El modelo base de 14B no conoce el Coran de memoria: en 30 versiculos aleatorios acerto la sura y aleya 4 veces y no completo ninguno correctamente. Sin el pipeline RAG, las citas no son fiables.
- El modelo GGUF suelto no busca en los textos verificados y solo cita Al-Fatiha, Al-Ikhlas y Al-Falaq; para el comportamiento completo hay que usar la API QModel.
- LM Studio y otras aplicaciones que cargan el GGUF directamente no leen el system prompt; hay que pegarlo manualmente para obtener el mismo comportamiento.
- La cobertura de recuperacion no es total: en el 21% de las preguntas respondibles no se recuperan todas las fuentes necesarias para una respuesta completa, y la fuente correcta solo es la primera en el 74% de los casos.
- El sistema esta limitado a arabe e ingles; no se documenta soporte de otros idiomas.
- Se adhiere a la creencia de Ahl al-Sunnah segun las fatuas de Ibn Baz e Islamweb, lo que implica una orientacion doctrinal concreta que puede no ser adecuada para todos los usuarios.
- Riesgo de alucinacion mitigado pero no eliminado: la verificacion restaura o elimina citas, pero no garantiza la correccion interpretativa de la respuesta.
- No se detallan sesgos conocidos mas alla de la orientacion doctrinal declarada.
- La licencia MIT permite uso comercial, pero el usuario debe evaluar la responsabilidad sobre contenido religioso y las condiciones de las fuentes enlazadas.
- No se dispone de informacion sobre el proceso de cuantizacion mas alla de Q8_0, ni sobre latencia en GPU dedicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aelgendy/QModel
- Modelo base GGUF (bartowski/Qwen2.5-14B-Instruct-GGUF): https://huggingface.co/bartowski/Qwen2.5-14B-Instruct-GGUF
- Modelo en Ollama: `arelgendy/qmodel:8.6`
- DOI: 10.57967/hf/9790
- Conjunto de evaluacion: `eval/golden.jsonl` (incluido en el repositorio)
- System prompt: fichero `system` del repositorio
- Documentacion de la API: `http://localhost:8000/docs` tras el despliegue
