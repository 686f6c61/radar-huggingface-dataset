# kzap201/phowhisper-large-zaloai

## Resumen

phowhisper-large-zaloai es un modelo de reconocimiento automatico del habla (ASR) para vietnamita, desarrollado por el usuario kzap201 como un fine-tuning de vinai/PhoWhisper-large. El modelo parte de la arquitectura Whisper large de OpenAI (transformer encoder-decoder con 1.543 millones de parametros) y ha sido ajustado sobre el split de entrenamiento LifeMate ASR, con el objetivo de mejorar la transcripcion en dominios conversacionales concretos. La revision actual (v2) reduce el WER de desarrollo del 13,09 % al 9,40 % respecto a la v1.

El interes practico del modelo reside en su especializacion: frente al PhoWhisper-large generico, esta version incorpora un ajuste fino completo con datos de sesiones reales (4.593 clips de 1.390 sesiones, unas 6,22 horas) y una seleccion de checkpoint guiada por WER de validacion. Es, por tanto, un modelo de nicho para pipelines de transcripcion en vietnamita donde el dominio de despliegue se parezca al corpus de entrenamiento.

La relevancia es limitada fuera de ese nicho: se trata de un fine-tune de un unico desarrollador, con 22 descargas y sin validacion en un test independiente (las metricas publicadas son de desarrollo y se usaron para seleccionar el checkpoint). Aun asi, documenta de forma inusualmente rigurosa el proceso de entrenamiento y las metricas, lo que facilita su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la model card (pesos exportados en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (exportacion con Transformers 5.17.0) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large: un encoder de audio y un decoder autoregresivo de tipo transformer, con 1.543 millones de parametros en total. La entrada es audio mono a 16 kHz y la salida es texto en vietnamita. El fine-tuning es completo (no LoRA ni adaptadores): parametros maestros en FP32 con autocast BF16, batch size 32, acumulacion de gradiente 1, learning rate inicial de 1e-05 y scheduler `reduce_lr_on_plateau`. Se entrenaron hasta 30 epochs con parada en la epoch 24 y se selecciono el checkpoint del step 2592 (epoch 18) por WER minimo en desarrollo, con semilla 42.

Los datos de entrenamiento de la v2 son 4.593 clips procedentes de 1.390 sesiones (aproximadamente 6,22 horas), sin clips de desarrollo en el conjunto de entrenamiento. La decodificacion es greedy, sin sampling, con limite de 256 tokens de generacion. La evaluacion usa normalizacion NFC, minusculas, conversion de puntuacion a espacio y normalizacion de espacios en blanco. El autor publica hashes de datos y checksums en `release.json`, lo que permite verificar la reproducibilidad del export.

## Capacidades

- Transcripcion de audio a texto en vietnamita (pipeline `automatic-speech-recognition`).
- Procesamiento de audio mono a 16 kHz con ventanas de 30 segundos propias de Whisper.
- Generacion de transcripciones con puntuacion y mayusculas segun el formato aprendido del corpus.
- Fine-tuning orientado a sesiones conversacionales (dominio LifeMate), con mejor tolerancia a habla espontanea que el modelo base en ese dominio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no aplica (modelo ASR).
- Capacidades multilingues: solo vietnamita; no se documenta transferencia a otros idiomas.
- Capacidades especiales (thinking mode, vision, audio adicional): no disponibles.

## Casos de uso

- Transcripcion de reuniones y sesiones de atencion al cliente en vietnamita: el ajuste sobre 1.390 sesiones del corpus LifeMate hace que el modelo este calibrado para habla conversacional multi-turno, con un WER de desarrollo del 9,40 %.
- Generacion de subtitulos para contenido audiovisual vietnamita: la decodificacion greedy con limite de 256 tokens permite procesar clips de hasta 30 segundos por ventana de forma determinista y reproducible.
- Analitica de contact center: transcripcion por lotes de grabaciones para alimentar busqueda semantica o sistemas de QA, usando vLLM o el pipeline de transformers con batch size alto (la v2 se evaluo con batch 32).
- Documentacion clinica o legal dictada: en dominios con vocabulario estable y audio limpio, el fine-tuning reduce sustituciones respecto al PhoWhisper generico; requiere validacion propia por el riesgo de alucinacion en pasajes ambiguos.
- Prototipado de asistentes de voz en vietnamita: integracion como etapa ASR en un pipeline ASR + LLM, con la ventaja de una licencia BSD 3-Clause permisiva para uso comercial.
- Investigacion en ASR de bajo recurso: el modelo sirve como punto de partida reproducible (semilla, hashes y checksums publicados) para experimentos de fine-tuning sobre dominios vietnamitas especificos.

## Benchmarks y rendimiento

Metricas de desarrollo publicadas por el autor sobre 443 clips de 155 sesiones (6.465 palabras de referencia). No son resultados de test independiente: el mismo split se uso para seleccionar checkpoint.

| Version | Run | WER | CER | Sentence EM | Epoch seleccionada |
|---|---|---|---|---|---|
| v1 | large-b64-ga1-s42 | 13,09 % | 9,55 % | 38,15 % | 2 |
| v2 | large-b32-ga1-plateau-s42 | 9,40 % | 6,93 % | 45,37 % | 18 |

No se han publicado resultados de benchmarks estandar (MLSU, FLEURS, VIVOS u otros) en la informacion disponible, ni comparaciones con el modelo base vinai/PhoWhisper-large en el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas activaciones y cache; en la practica unos 4-6 GB con batch pequeño.
- VRAM en FP32: aproximadamente 6,2 GB solo para pesos; en torno a 8-10 GB con overhead.
- GPU recomendadas: A100 o H100 para throughput alto por lotes; L4, A10G o RTX 4090 para despliegue en produccion con latencia baja.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 8 GB o mas en FP16; en 6 GB requiere cuantizacion (no documentada por el autor).
- Opciones de despliegue: transformers (version de exportacion 5.17.0), pipeline `automatic-speech-recognition`; compatible con `endpoints_compatible` segun los tags de Hugging Face. No se documenta soporte especifico de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. El autor solo documenta batch size de evaluacion (v1: 8; v2: 32) y decodificacion greedy con 256 tokens maximos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kzap201/phowhisper-large-zaloai | 1.543 M | ventana de 30 s (Whisper) | vi | BSD 3-Clause | Hugging Face, 22 descargas |
| vinai/PhoWhisper-large (modelo base) | 1.543 M | ventana de 30 s (Whisper) | vi | BSD 3-Clause | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | ventana de 30 s (Whisper) | multilingue | Apache 2.0 | Hugging Face, muy extendido |

No se dispone de resultados comparativos de WER entre estos modelos en el mismo conjunto de evaluacion; el autor solo publica metricas de desarrollo de sus propias versiones v1 y v2.

## Limitaciones y advertencias

- Las metricas publicadas son de desarrollo y se usaron para seleccionar el checkpoint; no hay evaluacion en un test independiente, por lo que el WER real en produccion puede ser superior.
- El corpus de entrenamiento es pequeno (6,22 horas, 4.593 clips) y de un unico dominio (LifeMate); el rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio, ruido o habla ininteligible; es necesario filtrar por confianza o duracion.
- Solo vietnamita: no se documenta soporte de code-switching ni de otros idiomas, a pesar de que el Whisper base es multilingue.
- Sesgos conocidos: no documentados por el autor; al derivar de un corpus conversacional concreto, puede reflejar el sesgo demografico y de dominio de esas sesiones.
- Licencia BSD 3-Clause: permite uso comercial con atribucion y sin endorsement; la licencia upstream de PhoWhisper (VinAI Research) se incluye en `LICENSE` y debe respetarse.
- Requiere audio mono a 16 kHz y la version de Transformers 5.17.0 para cargar los exports sin incidencias; versiones anteriores pueden no ser compatibles.
- El repositorio pesa 12,3 GB e incluye multiples revisiones (`v1`, `v2`, `main` = v2); conviene fijar `revision` explicitamente para evitar cargas inesperadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kzap201/phowhisper-large-zaloai
- Modelo base PhoWhisper-large: https://huggingface.co/vinai/PhoWhisper-large
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper de PhoWhisper: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
