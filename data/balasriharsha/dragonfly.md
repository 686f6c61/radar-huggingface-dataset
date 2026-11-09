# balasriharsha/dragonfly

## Resumen
Dragonfly es un ajuste fino (fine-tune) de openai/whisper-large-v3-turbo, un modelo de reconocimiento automático del habla (ASR) de 809 millones de parámetros, desarrollado por el usuario balasriharsha. Su objetivo es transcribir audio en telugu, hindi e inglés, incluyendo el habla que mezcla estos idiomas de forma natural ("Tinglish", "Hinglish"), un fenómeno muy común en la India urbana y que los modelos ASR multilingües genéricos suelen manejar mal. El modelo escribe las palabras inglesas en alfabeto latino dentro de frases en telugu o hindi, imitando cómo las personas escriben el habla mixta, y añade puntuación.

El modelo parte de la arquitectura encoder-decoder de Whisper (transformer) y conserva el contexto de audio de 30 segundos por ventana, con capacidad de procesar grabaciones largas mediante troceado (chunking) en el pipeline de transformers. Se distribuye con licencia MIT y pesos en safetensors, lo que facilita su uso comercial y su integración en entornos de producción. Su relevancia radica en que aborda un caso de uso poco cubierto: la transcripción de habla code-mixed indic-inglés con una calidad declarada notablemente superior a la del modelo base y competitiva frente a alternativas comerciales como Sarvam Saaras V4.

La ficha se basa en la información publicada por el autor en Hugging Face; los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 (~809 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s; grabaciones largas mediante chunking en el pipeline |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede convertir a otros formatos, pero no se documenta) |
| Idiomas soportados | Telugu (te), hindi (hi), inglés (en), incluyendo habla code-mixed (Tinglish, Hinglish) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Dragonfly es un fine-tune de openai/whisper-large-v3-turbo, que emplea una arquitectura transformer encoder-decoder típica de la familia Whisper. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera la transcripción de forma autorregresiva. El modelo base large-v3-turbo reduce el número de capas del decoder respecto a large-v3, lo que disminuye el coste de inferencia manteniendo una calidad cercana.

El autor indica que el ajuste fino se realizó sobre varios conjuntos de datos: ai4bharat/IndicVoices, ai4bharat/Kathbath, ARTPARK-IISc/Vaani, google/fleurs y mythicinfinity/libritts_r. No se detalla en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste fino para code-switching y normalización de script.

## Capacidades
- Transcripción de voz a texto en telugu, hindi e inglés.
- Manejo de habla code-mixed (telugu-inglés, hindi-inglés) manteniendo las palabras inglesas en alfabeto latino dentro de la frase.
- Generación de puntuación en la salida.
- Procesamiento de grabaciones largas mediante chunking (chunk_length_s) y lotes (batch_size) en el pipeline de transformers.
- Selección explícita del idioma principal mediante generate_kwargs={"language": ...}, recomendada para evitar errores en audio code-mixed.
- Mitigación de bucles en clips cortos (~3 s o menos) mediante parámetros de decodificación (temperature, compression_ratio_threshold).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso
- Transcripción de reuniones y llamadas en equipos indios: el modelo gestiona conversaciones que alternan hindi, telugu e inglés, y con chunk_length_s=30 puede procesar grabaciones de larga duración por lotes.
- Subtitulado de contenido audiovisual: series, vídeos de YouTube o pódcasts con habla Hinglish o Tinglish, donde la salida con puntuación y script mixto reduce el trabajo de post-edición.
- Atención al cliente automatizada: transcripción de llamadas de soporte en centros de contacto indios para generar registros textuales y analítica, gracias al soporte de los tres idiomas y del code-switching.
- Generación de actas y notas en entornos educativos: clases o seminarios impartidos en telugu o hindi con terminología técnica en inglés.
- Accesibilidad y documentación clínica: dictado de informes donde el personal mezcla términos médicos en inglés con frases en hindi o telugu.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión regional en la India para búsqueda y análisis de contenido.
- Investigación lingüística sobre code-switching: generación de transcripciones etiquetadas por idioma para estudiar patrones de mezcla, aprovechando la convención de script del modelo.

## Benchmarks y rendimiento
Resultados declarados por el autor (WER y CER en %, menor es mejor). El autor indica que todos los sistemas se ejecutaron sobre los mismos clips en noviembre de 2026; los datos de Sarvam Saaras V4 provienen de su API pública. Los valores no están verificados de forma independiente.

| Idioma | Conjunto de prueba | Clips | Dragonfly | Saaras V4 | Whisper large-v3-turbo |
|---|---|---|---|---|---|
| Telugu | IndicVoices + FLEURS (held-out conversacional) | 496 | 22,1 | 23,1 | 97,8 |

Resultados adicionales de Dragonfly (model-index del autor):

| Idioma | Conjunto de prueba | Métrica | Valor |
|---|---|---|---|
| Telugu | IndicVoices + FLEURS Telugu (held-out) | WER | 22,11 |
| Telugu | IndicVoices + FLEURS Telugu (held-out) | CER | 6,61 |
| Telugu | IndicContextEval Telugu L1 | WER (sin puntuación) | 29,00 |
| Telugu | Kathbath Telugu test | WER | 21,99 |
| Telugu | Kathbath Telugu test | CER | 4,76 |
| Hindi | IndicVoices Hindi | WER (script normalizado) | 19,53 |
| Hindi | IndicVoices Hindi | CER (script normalizado) | 9,04 |
| Hindi | FLEURS Hindi (hi_in, test) | WER (script normalizado) | 17,63 |
| Hindi | FLEURS Hindi (hi_in, test) | CER (script normalizado) | 7,21 |
| Hindi-Inglés | MUCS 2021 | WER (script normalizado) | 26,83 |
| Hindi-Inglés | MUCS 2021 | CER (script normalizado) | 17,17 |
| Inglés | FLEURS English (en_us, test) | WER | 6,10 |
| Inglés | FLEURS English (en_us, test) | CER | 2,42 |
| Hindi | Svarah | WER | 15,42 |
| Hindi | Svarah | CER | 9,94 |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en fp16 para los pesos (~809 M de parámetros); con overhead del pipeline y lotes, se recomienda al menos 4-6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090); en servidor, A100 o H100 para alto throughput con lotes grandes.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas con 6-8 GB o más; también puede ejecutarse en CPU (más lento) y en Apple Silicon con device="mps".
- Opciones de despliegue: pipeline de transformers (documentado por el autor); el formato safetensors permite su conversión a otros runtimes, aunque no se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dragonfly | ~809 M | Telugu, hindi, inglés (code-mixed) | Ventanas de 30 s con chunking | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | ~809 M | Multilingüe (99 idiomas) | Ventanas de 30 s con chunking | MIT (según modelo base) | Hugging Face |
| Sarvam Saaras V4 | no disponible | Indic e inglés | no disponible | no disponible (API comercial) | API pública de Sarvam |
| Whisper large-v3 | ~1,55 B | Multilingüe (99 idiomas) | Ventanas de 30 s con chunking | MIT (según modelo base) | Hugging Face |

En el conjunto Telugu de IndicVoices + FLEURS, Dragonfly declara un WER de 22,1 frente a 23,1 de Saaras V4 y 97,8 de Whisper large-v3-turbo. No se dispone de comparativas publicadas con Whisper large-v3 en los mismos clips.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; deben interpretarse con cautela.
- El modelo está especializado en telugu, hindi e inglés; su rendimiento en otros idiomas no está documentado y probablemente sea degradado respecto al modelo base.
- En audio code-mixed, la detección automática de idioma puede fallar; el autor recomienda especificar siempre el idioma principal.
- Los clips cortos (≈3 s o menos) pueden entrar en bucles de repetición; se recomienda aplicar los parámetros de decodificación descritos por el autor.
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico poco frecuente.
- No se documentan análisis de sesgos por género, acento o dialecto dentro del telugu y el hindi.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento y del modelo base para usos sensibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un modelo reciente y poco validado por la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/balasriharsha/dragonfly
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
