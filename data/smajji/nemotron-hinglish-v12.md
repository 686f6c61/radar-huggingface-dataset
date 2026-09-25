# smajji/nemotron-hinglish-v12

## Resumen

Nemotron-Hinglish-v12 es un modelo de reconocimiento automatico del habla (ASR) en streaming, especializado en habla bilingue hindi-ingles con mezcla de codigo (hinglish). Lo publica el usuario smajji en Hugging Face y es un fine-tune del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un FastConformer-RNNT cache-aware de aproximadamente 0,6 mil millones de parametros. Se trata de la duodecima iteracion de una serie propia: el autor indica que arranca en caliente desde el mejor checkpoint de la v11 y se afina para mejorar el rendimiento en habla code-mixed sin degradar el ingles y el hindi limpios.

El problema que aborda es concreto: los sistemas ASR genericos suelen degradarse notablemente cuando el hablante alterna hindi y ingles dentro de la misma frase, un fenomeno muy comun en India. La v12 incorpora un 36 % de datos code-mixed en el entrenamiento (con el corpus OpenSLR104 como novedad) y normaliza los digitos Devanagari y los numeros escritos con letras a digitos ASCII, lo que produce transcripciones mas consistentes para postprocesado y analitica.

El modelo entrena sobre 2.905.937 enunciados y 6.451 horas de audio a 16 kHz, y su bateria de evaluacion propia reporta un WER global del 12,5 %, identico al de las versiones v10 y v11, pero con mejoras en las categorias code-mixed: 10,5 % en numeros code-mixed, 33,3 % en OpenSLR104 y 42,9 % en hinglish MUCS. Es relevante ahora porque el ASR en streaming sobre GPU de gama media es un componente habitual en pipelines de subtitulado, analitica de llamadas y asistentes de voz para el mercado indio, un segmento con muy pocas alternativas abiertas especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT cache-aware en streaming (transducer: encoder FastConformer + red de prediccion + red conjunta); fine-tune de `nvidia/nemotron-3.5-asr-streaming-0.6b` |
| Parametros totales | ~0,6 mil millones (0.6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica contexto de tokens. Ventana de streaming por chunks de 80, 160, 320, 560 y 1120 ms con atencion en cache; interfaz compatible con `prompt conditioning` y language-ID, `default_prompt_mode` unificado y `unified_auto_ratio` 0,9 |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones ni versiones GGUF/ONNX) |
| Idiomas soportados | Ingles, hindi y mezcla de codigo hindi-ingles (hinglish). La metadata del repositorio no declara lista de idiomas (`no disponible`); los idiomas citados provienen de la model card |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita. Repositorio de 2,6 GB con libreria `nemo` (checkpoints del ecosistema NeMo) |
| Tarea | Reconocimiento automatico del habla (ASR) en streaming; no es un modelo generativo de texto |
| Datos de entrenamiento | 2.905.937 enunciados / 6.451 horas (22 corpus, audio FLAC tarrado a 16 kHz) |
| Repositorio | smajji/nemotron-hinglish-v12; 0 descargas y 0 likes en el momento de la consulta |
| Fechas | Creado el 2026-09-25; actualizado el 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transducer (RNNT) con encoder FastConformer, disenado para inferencia en streaming con cache atencional. Esto significa que el modelo procesa audio de forma incremental en placeholders de 80, 160, 320, 560 o 1120 ms, manteniendo estado entre chunks, de modo que la salida puede emitirse con baja latencia en lugar de esperar a un segmento completo. La decodificacion RNNT combina la salida del encoder con una red de prediccion y una red conjunta, y la interfaz heredada admite condicionamiento por prompt y deteccion de idioma por utterance.

El entrenamiento parte del checkpoint v11 y se ejecuta sobre audio FLAC a 16 kHz tarrado, con bucketing dinamico de Lhotse, `batch_duration=300`, learning rate de 8e-5 con schedule coseno hasta 1e-6, 5 % de warmup y `max_steps=30000`. El corpus total son 6.451 horas y 2.905.937 enunciados, con un 36 % de proporcion code-mixed sin recortar el volumen de ingles; entre las fuentes destacan hinglish_cc (1832,2 h), Shrutilipi en hindi (849,5 h), Indian-English NPTEL (744,7 h), Hindi-1482hrs (400,0 h), People's Speech (800,6 h), TEDLIUM (259,9 h), SPGISpeech (300,0 h), India-Accent Common Voice (144,5 h) y el corpus nuevo OpenSLR104 code-mixed (89,6 h). Una innovacion practica destacable es la normalizacion de digitos Devanagari y de numeros escritos con letras a digitos ASCII en los targets, lo que reduce la variabilidad de las transcripciones de numeros y telefonos (una linea de trabajo que el autor ya habia iniciado en las versiones v5 y v6). La model card no menciona uso de RLHF ni DPO, lo cual es coherente con un sistema ASR supervisado.

## Capacidades

- Transcripcion de voz a texto en streaming para ingles, hindi y habla code-mixed hindi-ingles, con emision incremental por chunks desde 80 ms.
- Reconocimiento de numeros y secuencias de digitos con normalizacion a ASCII, incluyendo material especifico de numeros code-mixed (corpus roopa) y el fix de "Devanagari latch" heredado de versiones anteriores.
- Deteccion y condicionamiento de idioma por utterance mediante la interfaz de language-ID y prompt conditioning, util en conversaciones donde el idioma cambia a mitad de frase.
- Robustez declarada a distintas variedades de ingles: ingles limpio, ingles con acento indio y ingles tecnico (NPTEL) figuran como categorias de evaluacion separadas.
- Capacidad de trabajar con audio telefónico y de reuniones, dada la presencia de corpus como earnings22 (llamadas de resultados financieros) y SPGISpeech.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision ni audio generativo: es exclusivamente un modelo ASR.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; cualquier comportamiento de agente requeriria envolverlo desde fuera.

## Casos de uso

- Subtitulado en directo para medios y creadores de contenido: el modo streaming con chunks de 80 a 1120 ms permite emitir subtitulos parciales mientras se habla, algo critico en retransmisiones donde el hablante alterna hindi e ingles.
- Analitica de llamadas en contact center: un operador en India puede transcribir conversaciones completas de atencion al cliente y aplicar despues busqueda por palabras clave, deteccion de intencion o control de calidad; el WER de 10,5 % en numeros code-mixed reduce errores al extraer identificadores y cantidades.
- Asistentes de voz y comandos embebidos: con 0,6B de parametros y pesos que ocupan del orden de 1,2 GB en precision reducida, es viable en GPUs de consumo e incluso en dispositivos con aceleracion dedicada, para reconocer ordenes mezclando hindi e ingles.
- Transcripcion e indexado de archivos de audio y video: podcasts, clases de NPTEL, entrevistas o grabaciones internas pueden transcribirse en lote y alimentar un indice de busqueda sobre texto, aprovechando la cobertura de ingles tecnico con acento indio.
- Generacion de datos etiquetados para entrenamiento de otros modelos: la salida normalizada a digitos ASCII y la cobertura multilingue lo hacen util como anotador automatico de audio sin etiquetar, siempre con revision humana dado el WER en code-mixed.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real en aplicaciones de videollamada o aula virtual, donde el cambio de idioma dentro de una misma intervencion es habitual.
- Cumplimiento y monitorizacion en entidades financieras: transcripcion de llamadas para auditoria y deteccion de divulgaciones obligatorias, apoyandose en la robustez en ingles de reuniones de resultados y en el reconocimiento de cifras.
- Prototipado rapido de productos de voz para el mercado indio: al ser un fine-tune abierto sobre un modelo NeMo, permite iterar con la misma interfaz de streaming ya integrada en herramientas del ecosistema.

## Benchmarks y rendimiento

Datos de la bateria de evaluacion del autor (300 muestras por tipo, WER mediano). Se incluyen las versiones v10 y v11 para contextualizar la progresion:

| Tipo de evaluacion | v10 | v11 | v12 |
|---|---|---|---|
| Numeros code-mixed (roopa) | 12,9 % | 11,1 % | 10,5 % |
| Code-mixed OpenSLR104 | 39,4 % | 36,9 % | 33,3 % |
| Ingles limpio (en_clean) | 3,9 % | 4,3 % | 4,5 % |
| Ingles con acento indio (en_indian) | 14,0 % | 15,4 % | 15,5 % |
| Ingles tecnico (en_tech) | 15,4 % | 14,3 % | 15,4 % |
| Hindi leido (hi_read) | 12,0 % | 12,5 % | 12,1 % |
| Hindi no visto (hi_unseen) | 7,1 % | 7,1 % | 7,1 % |
| Hinglish (MUCS) | 44,4 % | 44,4 % | 42,9 % |
| Global (OVERALL) | 12,5 % | 12,5 % | 12,5 % |

No se han publicado en la informacion disponible resultados de benchmarks externos (por ejemplo comparativas independientes frente a Whisper o IndicConformer). Las cifras anteriores proceden exclusivamente de la evaluacion interna del autor y no son verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada (calculada a partir de los 0,6B de parametros, no confirmada por el autor): aproximadamente 2,4 GB solo de pesos en fp32, unos 1,2 GB en bf16/fp16 y en torno a 0,6 GB en int8; con activaciones y cache de streaming, el consumo total en fp16 suele quedar por debajo de 4 GB.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090. Incluso GPUs con 6-8 GB deberian ser suficientes en fp16.
- Para despliegues de alta concurrencia se recomiendan GPU de datacenter (A100, L40S, H100), donde el cuello de botella suele ser el numero de streams simultaneos y no el tamano del modelo.
- La inferencia en CPU es factible por el reducido numero de parametros, aunque la model card no aporta datos de latencia ni de factor de tiempo real.
- Opciones de despliegue: el repositorio usa la libreria `nemo`, por lo que el camino natural es NVIDIA NeMo (`nemo_toolkit[asr]`). La model card no confirma soporte de vLLM, llama.cpp, Ollama ni TGI; en el caso de NeMo son habituales las exportaciones a ONNX y el empaquetado para NVIDIA Riva, pero ninguna de estas dos opciones se documenta explicitamente en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato relacionado es la granularidad de los chunks (80, 160, 320, 560, 1120 ms), que acota la latencia minima de emision, pero no se publican medidas de RTF ni de streams por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana / contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| smajji/nemotron-hinglish-v12 | ~0,6B | Streaming cache-aware, chunks de 80-1120 ms | Ingles, hindi, hinglish | no disponible | WER global 12,5 % (bateria propia del autor) |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo base) | ~0,6B | Streaming cache-aware, misma interfaz | Definidos por NVidia; no detallados en esta informacion | no disponible en esta ficha | no disponible |
| OpenAI Whisper large-v3 | ~1,55B | Procesamiento por ventanas de 30 s, no streaming nativo | ~99 idiomas | MIT | no disponible en esta informacion |
| AI4Bharat IndicConformer (variante grande) | ~0,6B | Inferencia por utterance, no orientada a streaming | 22 lenguas indias (incluye hindi; no ingles) | MIT | no disponible en esta informacion |

La ventaja diferencial de la v12 frente al modelo base y frente a alternativas multilingues genericas es la especializacion en code-mixed hindi-ingles con interfaz de streaming; su principal desventaja es la ausencia de licencia declarada y de datos de evaluacion independientes.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos de uso, no hay autorizacion clara para uso comercial ni para redistribucion. Es un riesgo legal que debe resolverse antes de cualquier despliegue en produccion.
- Rendimiento debil en code-mixed dificil: 42,9 % de WER en el conjunto hinglish MUCS y 33,3 % en OpenSLR104. Son cifras altas para transcripcion automatica sin supervision humana.
- Degradacion leve en ingles limpio: el WER pasa de 3,9 % en v10 a 4,5 % en v12, y el ingles con acento indio empeora de 14,0 % a 15,5 % en el mismo periodo. La mejora en code-mixed se obtiene a costa de esas categorias.
- Evaluacion interna y no verificada: la bateria de 300 muestras por tipo la define el propio autor y no se han publicado metricas externas; los resultados pueden no trasladarse a dominios reales (ruido de calle, microfonos de movil, audio comprimido).
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede generar texto plausible en tramos con ruido, silencio o solapamiento de voces. Los numeros normalizados a ASCII facilitan el postprocesado, pero tambien pueden enmascarar errores de digitos.
- Sin garantias sobre idiomas fuera de ingles, hindi y hinglish: la metadata del repositorio no declara idiomas y no hay evidencia de comportamiento en otras lenguas indias.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni informacion de cuantizacion, lo que dificulta reproducir el despliegue sin leer la model card.
- Modelo de un solo proposito: no genera texto, no razona y no soporta tool calling; cualquier flujo de agente requiere componentes adicionales.
- Fechas de publicacion (2026-09-25) posteriores a la mayoria de referencias del ecosistema; conviene verificar la vigencia del modelo base y de las dependencias de NeMo con las que se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smajji/nemotron-hinglish-v12
- Version anterior v6: https://huggingface.co/smajji/nemotron-hinglish-v6
- Version anterior v5: https://huggingface.co/smajji/nemotron-hinglish-v5
- Modelo base citado en la model card: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Repositorio GitHub NVIDIA-NeMo/Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Entrada de Wikipedia sobre Nemotron: https://en.wikipedia.org/wiki/Nemotron
