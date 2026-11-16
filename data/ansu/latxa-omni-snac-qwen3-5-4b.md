# Ansu/Latxa-Omni-SNAC-Qwen3.5-4B

## Resumen

Latxa-Omni-SNAC-Qwen3.5-4B es un modelo de voz a voz (speech-to-speech) en euskera desarrollado por el autor independiente Ansu, publicado en Hugging Face bajo una licencia compuesta apache-2.0-and-llama3.2. El modelo recibe habla o texto en euskera y responde simultáneamente con texto y audio a 24 kHz mientras sigue generando, además de transcribir habla en euskera, traducirla a ingles o castellano, leer texto en voz alta y describir el estado emocional y las caracteristicas de la voz del hablante.

Tecnicamente es un sistema modular de tres piezas: un codificador de voz basado en Whisper large-v3 afinado para ASR en euskera (congelado durante el entrenamiento), un "thinker" construido sobre HiTZ/Latxa-Qwen3.5-4B con un proyector lineal de voz entrenado mediante LoRA, y un "talker" de 1B parametros (forma de Llama-3.2-1B, 16 capas, inicializado desde Llama-3.2-1B-Instruct) que convierte los estados ocultos del thinker en tokens de audio SNAC a 24 kHz intercalados con el texto. El conjunto suma 4.861.074.944 parametros y un repositorio de 15,2 GB.

Su relevancia radica en ser uno de los pocos modelos omni (texto y voz, entrada y salida) centrados en una lengua de bajos recursos como el euskera, con generacion de habla en streaming mas rapida que el tiempo real en una H100 (factor de tiempo real ~0,8) y una latencia de ~0,35 s hasta el primer audio. Es un checkpoint de investigacion, no un producto, y requiere el codigo del repositorio de GitHub para cargarse, ya que no funciona con `transformers` estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema modular: codificador de voz (Whisper large-v3, encoder congelado) + thinker (Latxa-Qwen3.5-4B con proyector lineal de voz y LoRA fusionado) + talker autoregresivo de 1B (forma Llama-3.2-1B, 16 capas) que genera tokens SNAC |
| Parametros totales | 4.861.074.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eu (euskera); salidas de traduccion a ingles y castellano |
| Licencia | apache-2.0-and-llama3.2 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de tres modulos. El codificador de voz es un Whisper large-v3 afinado para ASR en euskera sobre los corpus composite_eu, faktoria y Dialektoak (12,1 % WER en dev), del que solo se usa el encoder, congelado. El thinker parte de HiTZ/Latxa-Qwen3.5-4B y anade un proyector lineal de voz; se entreno con el encoder congelado, el proyector en su totalidad y el LLM mediante LoRA (r=64, alpha 128, dropout 0,05), con tasa de aprendizaje 2e-4, 2 epocas, batch global 64 sobre 4 H100 y 15.542 pasos. El talker es un decodificador autoregresivo de 1B con la forma de Llama-3.2-1B (16 capas) inicializado desde Llama-3.2-1B-Instruct, que transforma los estados ocultos del thinker en tokens SNAC de 24 kHz intercalados con el texto (se leen 3 tokens de texto por cada 4 tramas SNAC escritas).

El entrenamiento del thinker uso 497.283 conversaciones multitarea cuyos turnos de usuario son mayoritariamente habla en euskera: chat hablado (244.697 filas, preguntas sintetizadas con OmniVoice TTS y respuestas de Latxa-Llama-3.1-70B-Instruct, incluyendo 25.000 conversaciones con seguimientos hablados dependientes de contexto), ASR (60.000), voz a ingles (45.000), voz a castellano (20.000), texto a ingles y castellano (30.000 y 15.000), chat escrito (20.000), lectura en voz alta (20.000), replay de texto (20.000) y tareas paralinguisticas de emocion, descripcion de voz y respuesta consciente de la emocion (10.028, 5.199 y 7.359 filas respectivamente, a partir de CREMA-D, RAVDESS y ESD en ingles). El talker se entreno en una segunda etapa con el thinker congelado durante 3 epocas (11.859 pasos, batch global 120, 3 H100) sobre tokens SNAC de respuestas de Latxa-70B sintetizadas con OmniVoice TTS; conviene senalar que el talker se entreno sobre los estados ocultos del thinker anterior de la serie (misma receta sin los datos de seguimiento ni paralinguisticos), no del thinker actual.

## Capacidades

- Generacion de habla a voz en euskera: responde con texto y audio a 24 kHz de forma intercalada y en streaming, mientras sigue generando.
- Transcripcion de habla en euskera (ASR) mediante instruccion explicita ("Transkribatu audioa.").
- Traduccion de habla a ingles y a castellano, y de texto a ingles y castellano.
- Lectura en voz alta de texto proporcionado (TTS) mediante instruccion ("Irakurri ozen testu hau.").
- Descripcion paralinguistica: estado emocional del hablante y caracteristicas de la voz.
- Respuesta consciente de la emocion del hablante.
- Conversacion multi-turno hablada, con el modo `--transcribe-first` que transcribe cada turno antes de responder para mantener el hilo.
- Entrada y salida de texto ademas de voz (modo solo texto usando la raiz del checkpoint en lugar de `.../talker`).
- Plantilla de chat `qwen3_5` con el modo thinking desactivado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso mas alla del chat.

## Casos de uso

- Asistente conversacional por voz en euskera: el modelo mantiene dialogos hablados multi-turno y responde con voz sintetizada en streaming, adecuado para interfaces de voz nativas en euskera donde no existen alternativas comerciales solidas.
- Subtitulado y transcripcion de audio en euskera: la tarea de ASR permite transcribir grabaciones con un WER de 5,89 en el conjunto de evaluacion, util para archivos audiovisuales, actas de reunion o accesibilidad.
- Traduccion oral euskera-ingles y euskera-castellano: la tarea de traduccion de habla permite generar subtitulos o doblaje en ingles o castellano a partir de audio en euskera, con BLEU de 46,9 y 50,9 respectivamente sobre habla real.
- Lectura en voz alta de contenidos: la tarea TTS permite convertir articulos, noticias o documentacion en audio en euskera, aprovechando la sintesis SNAC a 24 kHz.
- Analisis de emocion y voz en interacciones: la descripcion paralinguistica permite enriquecer transcripciones de call centers o entrevistas con etiquetas de emocion y caracteristicas del hablante.
- Prototipado de agentes de voz en investigacion: el modo streaming con latencia de ~0,35 s en H100 y factor de tiempo real ~0,8 lo hace util para experimentar con pipelines de voz a voz en euskera en entornos de investigacion.
- Sistema de accesibilidad para personas con discapacidad visual: la combinacion de ASR, traduccion y TTS permite construir interfaces de lectura y dictado en euskera.

## Benchmarks y rendimiento

Resultados sobre particiones de test reservadas, todas las filas y decodificacion voraz. Las cifras del thinker corresponden al checkpoint 14.750 de esta ejecucion (el mejor en dev, con perdida de dev dentro de 0,0003 del checkpoint final). "Previous" es la misma receta sin los datos v3.

| Tarea | Metrica | Previous (v2) | Este modelo (v3) |
|---|---|---|---|
| ASR (euskera) | WER ↓ | 5,89 | 5,89 |
| Voz a ingles (habla real) | BLEU | 48,9 | 46,9 |
| Voz a castellano (habla real) | BLEU | 53,4 | 50,9 |
| Texto a ingles (FLORES devtest) | BLEU | 31,4 | 31,0 |
| Texto a castellano (FLORES devtest) | BLEU | 20,3 | 20,3 |
| Voz a ingles (InstructS2S) | BLEU | dato truncado en la model card | dato truncado en la model card |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 15,2 GB en safetensors, por lo que la carga completa requiere al menos ese orden de magnitud de memoria, sin contar activaciones ni buffers de audio.
- GPU recomendadas: H100 (primer audio a ~0,35 s tras codificar la pregunta, factor de tiempo real ~0,8) y A100 (ligeramente mas lenta que el tiempo real, segun la model card).
- Cabe en GPU de consumo: no disponible; no se documenta ejecucion en RTX 4090 ni en GPU consumer.
- Opciones de despliegue: el modelo no carga con `transformers` estandar; requiere el codigo del repositorio https://github.com/ansuehu/Latxa-Omni-SNAC (clases de modelo personalizadas, transformers 5 y torch 2.8). Incluye demo Gradio en streaming (`omni_speech/serve/gradio_demo.py`) e inferencia offline (`omni_speech/infer/infer.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en una H100, primer audio a ~0,35 s tras codificar la pregunta y factor de tiempo real ~0,8; en A100, ligeramente por debajo del tiempo real. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables de voz a voz en euskera ni de sus especificaciones (parametros, contexto, rendimiento, licencia). La comparativa se limita a la version anterior de la misma receta (v2), cuyos resultados aparecen en la tabla de benchmarks: el modelo v3 mantiene el WER de ASR (5,89), baja en BLEU de voz a ingles (48,9 a 46,9) y de voz a castellano (53,4 a 50,9), y mantiene texto a castellano (20,3) con un ligero descenso en texto a ingles (31,4 a 31,0).

| Modelo | Parametros | Contexto | ASR euskera (WER) | Voz a castellano (BLEU) | Licencia |
|---|---|---|---|---|---|
| Latxa-Omni-SNAC-Qwen3.5-4B (v3) | 4.861.074.944 | no disponible | 5,89 | 50,9 | apache-2.0-and-llama3.2 |
| Receta anterior (v2) | no disponible | no disponible | 5,89 | 53,4 | no disponible |
| Otros modelos de voz a voz | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un producto; el autor lo declara explicitamente y recomienda leer la seccion de limitaciones antes de usarlo.
- El talker se entreno sobre los estados ocultos del thinker anterior de la serie, no del thinker actual; el autor senala que un talker entrenado sobre este thinker probablemente sonaria algo mejor.
- El modelo no carga con `transformers` estandar: requiere clases personalizadas del repositorio de GitHub, lo que complica su integracion en pipelines convencionales.
- Cobertura linguistica limitada al euskera como lengua de entrada y salida principal; las salidas en ingles y castellano son tareas de traduccion, no conversacion nativa.
- Riesgo de alucinacion y de degradacion en conversaciones multi-turno sin el modo `--transcribe-first`; el autor lo recomienda para mantener el hilo.
- Sesgos conocidos: no documentados de forma explicita; los datos paralinguisticos provienen de corpus actuados en ingles (CREMA-D, RAVDESS, ESD), lo que puede introducir desajustes culturales y de dominio.
- Restricciones de licencia: licencia compuesta apache-2.0-and-llama3.2; el componente talker se construye con Llama, por lo que se aplican las condiciones de la licencia de Llama, que deben revisarse antes de cualquier uso comercial.
- Sin datos publicados de cuantizacion, longitud de contexto ni soporte de tool calling, lo que limita la planificacion de despliegues en produccion.
- Solo se documenta inferencia en H100 y A100; no hay evidencia de funcionamiento en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ansu/Latxa-Omni-SNAC-Qwen3.5-4B
- Codigo, scripts de entrenamiento y demo en streaming: https://github.com/ansuehu/Latxa-Omni-SNAC
- Modelo base del thinker: https://huggingface.co/HiTZ/Latxa-Qwen3.5-4B
- Codificador de voz: https://huggingface.co/openai/whisper-large-v3
- Modelo de inicializacion del talker: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de SNAC: https://github.com/hubertsiuzdak/snac
