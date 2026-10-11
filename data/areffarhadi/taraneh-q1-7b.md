# areffarhadi/Taraneh-Q1.7B

## Resumen

Taraneh-Q1.7B es un modelo de reconocimiento automático del habla (ASR) para persa, desarrollado por Aref Farhadipour (Universidad de Zúrich) y publicado en HuggingFace bajo el identificador `areffarhadi/Taraneh-Q1.7B`. Se trata de un ajuste fino (fine-tune) del checkpoint `Qwen/Qwen3-ASR-1.7B`, con aproximadamente 1.700 millones de parámetros, integrado en la familia Taraneh, compuesta por cinco modelos entrenados sobre unas 1.560 horas de audio persa.

El modelo aborda un problema concreto: la escasez de sistemas ASR de alta calidad para persa en dominios difíciles, especialmente audio conversacional espontáneo, contenido de YouTube, medios de comunicación y canto. Según la model card, Taraneh cubre también alineamiento forzado (*forced alignment*) sobre voz cantada y conversacional, una tarea poco cubierta por los ASR multilingües genéricos. La licencia Apache-2.0, heredada de Qwen3-ASR, permite uso comercial, incluidos productos y servicios alojados, e incluye una concesión de patentes.

Es relevante ahora porque el ecosistema persa de ASR ha dependido históricamente de adaptaciones de Whisper con rendimiento irregular en música y habla espontánea, y porque este modelo se apoya en la pila de inferencia de Qwen (`qwen-asr`) con soporte de vLLM 0.14 para decodificación por lotes y en streaming. No obstante, el repositorio figura con un tamaño de 0,0 GB, por lo que conviene verificar la disponibilidad real de los pesos antes de planificar un despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; derivada de Qwen/Qwen3-ASR-1.7B (modelo de audio a texto basado en transformer) |
| Parametros totales | 1,7 B (aproximado, segun el nombre del checkpoint y el modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan pesos GGUF ni cuantizaciones en la model card) |
| Idiomas soportados | persa (farsi, codigo `fa`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no especificado; el repositorio figura con 0,0 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. Lo que si se especifica es el punto de partida: `Qwen/Qwen3-ASR-1.7B`, un modelo de reconocimiento de voz de la familia Qwen3 que se carga mediante el paquete `qwen-asr`. El ajuste se realizo sobre aproximadamente 1.560 horas de audio en persa, en el marco del trabajo *Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains*. No se indican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO; para esos datos hay que remitirse al paper.

La innovacion destacable es la cobertura de dominios: el modelo se evalua y entrena sobre habla cantada, conversacional, medios y YouTube, ademas de incorporar normalizacion unificada de texto persa. La model card menciona explicitamente tareas de alineamiento forzado sobre dominios cantados y conversacionales, lo que amplia el uso mas alla de la transcripcion. En cuanto a la inferencia, se documenta soporte offline y en streaming mediante vLLM 0.14, con la salvedad de que el modo streaming solo esta disponible con el backend de vLLM, no con la ruta estandar de `transformers`.

## Capacidades

- Reconocimiento automatico del habla en persa (farsi) sobre audio conversacional, medios, YouTube y canto.
- Transcripcion offline por lotes mediante el paquete `qwen-asr`.
- Transcripcion en streaming, disponible exclusivamente con el backend de vLLM 0.14.
- Alineamiento forzado (*forced alignment*) de audio persa, incluyendo voz cantada y conversacional, segun el titulo y el alcance del paper asociado.
- Salida con normalizacion unificada de texto persa, lo que facilita metricas consistentes de WER y CER.
- Uso comercial permitido por la licencia Apache-2.0, con concesion de patentes.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio generation ni traduccion a otros idiomas.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en persa: el modelo esta evaluado especificamente en dominios de YouTube y medios, con un WER del 18,21 % en YouTube y del 21,91 % en media, por lo que es adecuado para generar subtitulos con revision humana posterior.
- Transcripcion de archivos de medios y television: para digitalizar y hacer buscable un archivo de emisiones en persa, el soporte de inferencia por lotes con vLLM permite procesar horas de audio de forma eficiente en una sola GPU.
- Analitica de conversaciones de centros de contacto: al estar afinado sobre habla conversacional, permite transcribir llamadas en persa para su posterior analisis de calidad, deteccion de temas y cumplimiento, siempre que se gestione el consentimiento y la privacidad.
- Alineamiento forzado para doblaje y locucion: el modelo cubre alineamiento sobre voz cantada y conversacional, lo que sirve para sincronizar transcripciones con pistas de audio en producciones de doblaje o subtitulado con marcas de tiempo.
- Reconocimiento de letras de canciones en persa: con un WER del 34,50 % en el conjunto de musica es el dominio mas debil, pero puede emplearse como primera pasada en un flujo de anotacion asistida donde un humano corrige las letras.
- Asistentes de voz y busqueda por voz en persa: la decodificacion en streaming con vLLM habilita transcripcion de baja latencia para interfaces conversacionales, condicionada a probar la latencia real en el hardware objetivo.
- Transcripcion de entrevistas de investigacion o periodismo: con un WER del 6,25 % en FLEURS y del 7,85 % en Common Voice, es una opcion razonable para audio limpio y lectura moderada.
- Evaluacion de dominios no vistos: los resultados en PSRB y VisualEars (que no formaron parte del entrenamiento) permiten usar el modelo como referencia controlada en experimentos de generalizacion sobre persa.

## Benchmarks y rendimiento

Resultados publicados en la model card, en porcentaje de WER / CER tras la normalizacion unificada de texto persa. PSRB y VisualEars no se vieron durante el entrenamiento.

| Conjunto de evaluacion | WER (%) | CER (%) |
|---|---:|---:|
| FLEURS | 6,25 | 2,15 |
| Common Voice | 7,85 | 3,13 |
| YouTube | 18,21 | 9,91 |
| Musica | 34,50 | 15,05 |
| Media | 21,91 | 11,46 |
| PSRB (no visto en entrenamiento) | 22,79 | 9,98 |
| VisualEars (no visto en entrenamiento) | 8,05 | 2,64 |

No se han facilitado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas directas con otros modelos en esta model card; la comparativa completa de los cinco modelos Taraneh se encuentra en el paper y en el README del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1,7 B de parametros, no confirmada por el autor): en FP16 aproximadamente 3,4 GB de pesos mas cache de activaciones y estados de decodificacion; en INT8 unos 1,7 GB; en INT4 unos 0,9 GB. El consumo real depende del backend de audio y del tamano del lote.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, incluso en FP16 y con lotes moderados, dado el reducido numero de parametros.
- Para despliegue en produccion con vLLM 0.14 y lotes grandes, se recomienda una GPU con 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100) con el fin de maximizar el throughput y mantener margen para el preprocesado de audio.
- Opciones de despliegue documentadas: paquete `qwen-asr` sobre `transformers` para inferencia offline, y `qwen-asr[vllm]` con vLLM 0.14 para inferencia offline y en streaming.
- No se documentan en la informacion disponible soporte para llama.cpp, Ollama, TGI ni pesos GGUF, por lo que no puede confirmarse su uso con esas herramientas.
- Latencia y throughput: no disponible. La model card no publica cifras de RTF (factor de tiempo real) ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taraneh-Q1.7B | 1,7 B | no disponible | ASR persa + alineamiento forzado, 1.560 h de audio | Apache-2.0 | HuggingFace `areffarhadi/Taraneh-Q1.7B` |
| Qwen/Qwen3-ASR-1.7B (modelo base) | 1,7 B | no disponible | ASR multimodal de Qwen | Apache-2.0 (segun la model card) | HuggingFace |
| Otros Taraneh de la familia | no disponible | no disponible | ASR persa, cinco variantes en total | Apache-2.0 | Repositorio GitHub del proyecto |
| Alternativas de ASR persa basadas en Whisper | no disponible | no disponible | ASR multilingue adaptado a persa | variable segun variante | no disponible en la informacion proporcionada |

No se dispone de cifras de rendimiento de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla de la tabla de benchmarks del propio Taraneh-Q1.7B.

## Limitaciones y advertencias

- El dominio de musica es claramente el mas debil: WER del 34,50 % y CER del 15,05 %, muy por encima del resto de conjuntos. No es adecuado para transcripcion automatica de canciones sin revision humana.
- El rendimiento cae de forma notable en dominios espontaneos y ruidosos: WER del 18,21 % en YouTube y del 21,91 % en media, frente al 6,25 % de FLEURS.
- En conjuntos no vistos durante el entrenamiento el WER sube al 22,79 % (PSRB), lo que indica una generalizacion limitada fuera de las condiciones de entrenamiento.
- Modelo mono-idioma: solo persa (`fa`). No se documenta soporte de otros idiomas ni de traduccion.
- Riesgo de alucinacion y de sustituciones en audio con ruido, solapamiento de hablantes o terminologia tecnica; se recomienda validacion humana en aplicaciones criticas.
- No se publican en la model card datos sobre sesgos demograficos, acentos regionales, variedades dialectales del persa ni paridad de genero.
- El repositorio aparece con un tamano de 0,0 GB, lo que sugiere que los pesos podrian no estar disponibles o no haberse subido completamente. Verifiquese antes de cualquier integracion.
- La licencia Apache-2.0 permite uso comercial y contiene concesion de patentes, pero exige conservar el aviso de licencia original de Qwen junto con los pesos.
- Streaming solo funciona con el backend de vLLM 0.14; no esta disponible con la ruta estandar de `transformers`.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue en entornos con restricciones de memoria o sin GPU.
- La normalizacion unificada de texto persa es la empleada para calcular las metricas; si el pipeline de destino usa otra normalizacion, los WER y CER reportados no seran directamente comparables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/areffarhadi/Taraneh-Q1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de codigo, manifiestos, normalizacion e inferencia: https://github.com/areffarhadi/persian-asr
- Paper (PDF) *Taraneh-ASR: Scaling Persian Speech Recognition and Forced Alignment Across Singing and Conversational Domains*: https://github.com/areffarhadi/persian-asr/blob/main/ArefFarhadi-TaranehASR.pdf
