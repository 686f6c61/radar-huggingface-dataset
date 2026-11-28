# KhawajaAfnan/voicecode-asr

## Resumen

VoiceCode ASR es un modelo de reconocimiento automatico del habla (ASR) especializado en la transcripcion literal de valores tecnicos: rutas de ficheros, comandos de shell, URLs, correos electronicos, numeros de telefono y identificadores de referencia. Se construye como un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3-ASR-1.7B, desarrollado por el autor independiente KhawajaAfnan en el contexto del QwenLocalHackathon. El problema que aborda es concreto: los reconocedores generales transcriben correctamente las palabras pero las escriben en su forma hablada ("migration slash two zero two six..."), de modo que el valor resultante no se puede pegar en una terminal ni almacenar como identificador valido.

El modelo mantiene la arquitectura del Qwen3-ASR-1.7B original (transformer orientado a ASR) con 1.720.574.976 parametros y un adaptador LoRA entrenado en una unica GPU de consumo. El repositorio ocupa 3,6 GB e incluye pesos en formato GGUF ademas de los pesos de transformers, lo que permite ejecucion totalmente offline en un PC convencional sin enviar audio a servidores externos.

Su relevancia radica en que, segun la model card, el conjunto local alcanza un 64,3 % en VoiceCodeBench (300 grabaciones humanas reales), situandose practicamente empatado con los mejores sistemas en la nube (OpenAI GPT-Transcribe, 65,0 %) pero sin coste por minuto y sin salida de audio del equipo. El modelo individual con beam search alcanza un 61,7 %, superando a 20 de los 23 sistemas publicados en ese benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ASR (heredada de Qwen3-ASR-1.7B) con adaptador LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (ficheros incluidos en el repositorio); niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B, un sistema de reconocimiento del habla basado en transformer, y se ajusta mediante LoRA sobre una unica GPU de consumo. No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que la mayor parte de los errores del modelo base eran de formato (el valor se oia correctamente pero se escribia como palabras), lo que motivo un ajuste fino orientado especificamente a la forma escrita de los valores.

La model card describe un sistema de ensemble local: se generan hasta diez transcripciones candidatas a partir de varios checkpoints LoRA (v14, v16w, v9, v17, v15, v12, v13a, v8; beam de 4 y una greedy), cada candidata se puntua por la log-verosimilitud que le asignan cinco modelos ASR (v14, v16w, v17, v9 y el Qwen3-ASR-1.7B sin tocar) dada la senal de audio, y se anade un prior de texto basado en Qwen3-8B-Base con peso 1. Gana el candidato con menor puntuacion total. El autor advierte que esta receta se eligio tras probar varios selectores sobre el mismo conjunto de test, por lo que el 64,3 % debe considerarse optimista en torno a un punto.

## Capacidades

- Transcripcion de audio a texto con salida en forma escrita exacta para rutas de ficheros, comandos de shell, URLs, correos electronicos, numeros de telefono e identificadores de referencia.
- Reconocimiento de habla general en ingles con una tasa de error de palabra del 2,8 % en LibriSpeech (300 enunciados reservados), identica a la del modelo base.
- Escritura correcta de numeros de telefono hablados: pasa de 0/35 a 24/35 aciertos en 35 hablantes reales no vistos.
- Capacidad alfanumerica en hablantes no vistos: 72,4 % (v14 greedy) y 81,9 % (v17 con hablantes clonados) frente al 32,4 % del modelo base.
- Ejecucion totalmente offline y local, sin envio de audio a servicios externos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio mas alla del propio ASR.

## Casos de uso

- Dictado de tickets y notas de soporte: el modelo transcribe conversaciones donde aparecen correos, telefonos e identificadores de referencia en su forma exacta, de modo que el texto puede copiarse directamente al sistema de ticketing sin correccion manual.
- Redaccion de mensajes de commit y descripciones de pull request por voz: convierte "tests slash claims slash denial underscore parser dot py" en `tests/claims/denial_parser.py`, un valor valido para pegar en Git.
- Documentacion de comandos de shell dictados: permite generar notas con comandos como `npm test -- --grep auth` listos para ejecutar en una terminal, evitando la reescritura manual.
- Registro de llamadas de soporte tecnico: al transcribir numeros de telefono y referencias con formato correcto, los datos pueden almacenarse y consultarse en bases de datos sin postprocesado.
- Dictado de rutas y nombres de fichero en entornos de desarrollo: util para ingenieros que documentan estructuras de directorios o scripts mientras trabajan, con salida pegable en el editor o en la terminal.
- Despliegue en equipos sin conectividad o con requisitos de privacidad: al ejecutarse offline sobre una GPU de consumo, es adecuado para entornos donde el audio no puede salir de la maquina, como auditorias internas o desarrollo en local.
- Prototipado y evaluacion de pipelines ASR: sirve como componente local de referencia en pruebas comparativas frente a APIs en la nube, con la ventaja de no incurrir en coste por minuto.

## Benchmarks y rendimiento

Resultados en VoiceCodeBench (300 clips; un clip cuenta solo si todos sus valores son exactos). La puntuacion se realizo con un scorer local que coincide con los juicios oficiales de GPT-5.5 en el 95 % de 34.086 veredictos; el autor indica que no ha ejecutado aun el juez oficial GPT-5.5 sobre sus salidas.

| Puesto | Sistema | VoiceCodeBench |
|---:|---|---:|
| 1 | OpenAI GPT-Transcribe | 65,0 % |
| 2 | OpenAI GPT Live (streaming) | 64,7 % |
| 3 | VoiceCode ASR, ensemble local | 64,3 % |
| 4 | xAI Grok Voice 2.0 | 60,3 % |
| 5 | Google Chirp 3 | 60,0 % |
| 6 | Mistral Voxtral Mini Transcribe 2 | 59,7 % |
| 7 | AssemblyAI Universal 3.5 Pro | 58,7 % |
| 9 | OpenAI Whisper large-v3 | 57,3 % |
| - | Qwen3-ASR-1.7B base (sin ajuste) | 50,0 % |
| 17 | Deepgram Nova-3 | 49,7 % |
| 20 | NVIDIA Parakeet TDT 0.6B v3 | 42,7 % |

Variantes individuales del modelo:

| Variante | VoiceCodeBench | 35 hablantes no vistos (alfanumerico) |
|---|---:|---:|
| v14, decoding greedy | 59,3 % | 72,4 % |
| v14, beam search (4 beams) | 61,7 % | no disponible |
| v17 (hablantes reales clonados), greedy | 58,7 % | 81,9 % |
| Ensemble local | 64,3 % | no disponible |
| Qwen3-ASR-1.7B base | 50,0 % | 32,4 % |

Otras comprobaciones reportadas: frente al base, el modelo individual mejora +9,3 puntos (40 clips corregidos, 12 empeorados; p < 0,001; IC 95 % [+4,7, +13,7]). En LibriSpeech (300 enunciados reservados) el WER es del 2,8 %, sin cambios respecto al base. En numeros de telefono hablados por 35 hablantes no vistos se pasa de 0/35 a 24/35 aciertos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,72 mil millones de parametros, los pesos en precision completa rondan los 3,4 GB y las versiones GGUF cuantizadas reducen sustancialmente ese requisito.
- El autor indica que el ajuste LoRA se realizo en una unica GPU de consumo y que el modelo se ejecuta offline en un PC normal; no se especifican modelos concretos de GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue: transformers (libreria declarada) y ficheros GGUF incluidos en el repositorio, lo que habilita su uso con runtimes compatibles con GGUF; no se detallan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El repositorio incluye una demo, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VoiceCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoiceCode ASR (ensemble) | 1,72 B (base) | no disponible | 64,3 % | apache-2.0 | Hugging Face, pesos safetensors y GGUF |
| OpenAI GPT-Transcribe | no disponible | no disponible | 65,0 % | propietaria | API en la nube |
| OpenAI Whisper large-v3 | no disponible | no disponible | 57,3 % | no disponible en la informacion | open source / API |
| Qwen3-ASR-1.7B base | 1,72 B | no disponible | 50,0 % | no disponible en la informacion | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de cifras de parametros ni contexto para los sistemas en la nube.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- El benchmark se evaluo con un scorer local que coincide con el juez oficial en el 95 % de los veredictos, pero el autor no ha ejecutado el juez oficial GPT-5.5 sobre sus salidas, por lo que la comparacion con sistemas en la nube no es completamente homologa.
- El resultado del ensemble (64,3 %) es optimista en torno a un punto segun el propio autor, porque la receta de seleccion se eligio sobre el mismo conjunto de test.
- La diferencia con OpenAI GPT-Transcribe (195 clips frente a 193 sobre 300) esta dentro del ruido estadistico; el autor la describe como "practicamente empatado".
- El modelo esta especializado en valores tecnicos; su rendimiento en habla general es el mismo que el del base (WER 2,8 % en LibriSpeech) y no se documentan mejoras en otros dominios.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion independiente por parte de la comunidad.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B, cuya licencia no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KhawajaAfnan/voicecode-asr
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Model, GGUF files, code and demo (enlace indicado en la model card, apunta al propio repositorio): https://huggingface.co/KhawajaAfnan/voicecode-asr
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
