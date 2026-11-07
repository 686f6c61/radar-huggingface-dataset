# FishelKET/KurisuMakiseTTS

## Resumen

KurisuMakiseTTS es un modelo de síntesis de voz (text-to-speech) especializado en la clonación de la voz del personaje Makise Kurisu, perteneciente a la franquicia Steins;Gate. Lo desarrolla FishelKET como proyecto de investigación fan-made y está construido mediante ajuste fino sobre GPT-SoVITS v5, en sus variantes dev y turbo, que comparten un mismo checkpoint GPT. El modelo resuelve el problema de generar voz sintética con un timbre muy fiel a un personaje concreto en japonés (idioma nativo) y chino (cross-lingual), algo que los sistemas de clonación zero-shot por referencia única no consiguen con la misma cercanía.

Técnicamente, el repositorio contiene un adaptador LoRA sobre SoVITS (rank 32) más un ajuste fino completo del módulo GPT, entrenados sobre 972 clips (67,8 minutos, 32 kHz mono) procedentes de audio del videojuego, de los cuales se usaron 754 clips (60,7 minutos) en el rango de 3 a 10 segundos. La salida se genera a 48 kHz. La relevancia actual radica en que demuestra un flujo de trabajo reproducible de ajuste fino de TTS sobre datos escasos (una hora de audio) con resultados de fidelidad de timbre superiores, según el autor, a sistemas zero-shot como IndexTTS-2.5 en este personaje concreto.

El modelo se distribuye con licencia Apache-2.0 sobre los pesos, pero con una advertencia explícita: los derechos sobre el personaje y la voz no pertenecen al autor, por lo que cualquier uso comercial requiere autorización de los titulares de derechos (5pb./MAGES./Nitroplus y la actriz de voz). Es, por tanto, un artefacto de investigación y uso fan-made, no un producto listo para producción comercial sin gestionar esas licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v5 (SoVITS con LoRA rank 32 + GPT ajustado; arquitectura de TTS con modelo de lenguaje autorregresivo y decodificador vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es texto; la referencia de audio debe ser de 5-10 s, máximo 10 s) |
| Tipos de cuantizacion | no disponible (fp16 en GPU con `is_half: true`; fp32 en CPU) |
| Idiomas soportados | japones (nativo), chino (cross-lingual) |
| Licencia | Apache-2.0 en pesos y artefactos del autor; derechos de personaje y voz reservados a terceros |
| Formato de pesos | checkpoints de PyTorch (`.ckpt` para GPT, `.pth` para SoVITS y vocoder) |
| Frecuencia de muestreo de salida | 48 kHz |
| Tamano del repositorio | 0,3 GB |
| Modelo base | lj1995/GPT-SoVITS (s1v3.ckpt, s2Gv5dev.pth, s2Gv5turbo.pth, vocoder) |
| Datos de entrenamiento | 972 clips / 67,8 min (32 kHz mono); 754 clips / 60,7 min efectivos |
| Versiones | v5dev (mayor calidad) y v5turbo (destilada a 4 pasos, apta para CPU) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS: un módulo SoVITS que aprende representaciones acústicas y un módulo GPT autorregresivo que modela la secuencia de tokens semánticos a partir del texto y de un audio de referencia. Sobre esta base, el autor aplica un adaptador LoRA de rango 32 al módulo SoVITS y un ajuste fino completo del módulo GPT. La inferencia requiere obligatoriamente un audio de referencia (5-10 segundos) que actúa como ancla de timbre y de prosodia; no obstante, como el timbre ya está incorporado en los pesos, cambiar la referencia afecta principalmente al tono y la expresividad, no a la identidad vocal.

El entrenamiento se realizó sobre 972 clips (67,8 minutos a 32 kHz mono) extraídos de audio del videojuego, de los que se emplearon 754 (60,7 minutos) en el rango de 3 a 10 segundos. Se ejecutaron 12 épocas de LoRA (r32) sobre SoVITS y 15 épocas sobre GPT, con un coste aproximado de 8 minutos (SoVITS) y 6 minutos (GPT) en una única GPU RTX PRO 6000 Blackwell. La variante turbo es una destilación a 4 pasos que reduce el coste de inferencia a cambio de una ligera pérdida de calidad. Los datos de audio y sus transcripciones provienen del repositorio `bysq/TTS-KurisuMakise` (Apache-2.0). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés como idioma nativo y en chino como idioma cruzado.
- Clonación de timbre específico del personaje Makise Kurisu, incorporada en los pesos mediante ajuste fino.
- Control de prosodia y tono mediante el audio de referencia: la síntesis hereda el estilo del clip de referencia.
- Generación de audio a 48 kHz de frecuencia de muestreo.
- Dos modos de inferencia: dev (mayor calidad, requiere GPU) y turbo (destilado a 4 pasos, viable en CPU).
- Interfaz de servicio mediante `api_v2.py` con endpoint HTTP `/tts` que acepta texto, idioma, ruta de referencia y texto del prompt.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de TTS.
- No dispone de visión, audio de entrada más allá de la referencia ni modo de razonamiento.

## Casos de uso

- Doblaje fan-made de contenido derivado de Steins;Gate: el modelo genera líneas en japonés con el timbre del personaje a partir de un guion de texto, usando clips de referencia del propio personaje para fijar el tono de cada escena.
- Prototipado de videojuegos o novelas visuales de carácter amateur: integración del endpoint `/tts` en un motor de diálogos para producir voces de personaje sin coste de licencia de actuación, siempre que se respeten los derechos del personaje.
- Generación por lotes en GPU con la variante dev: para producir horas de audio offline con la máxima fidelidad de timbre, aprovechando su RTF de ~1,08 en una RTX PRO 6000.
- Síntesis en tiempo casi real en CPU con la variante turbo: un clip de 4 segundos tarda ~12 segundos en un Ryzen 7 255, lo que permite entornos sin GPU (mini-PC, portátiles) para demos interactivas no críticas.
- Investigación sobre ajuste fino de TTS con datos escasos: el repositorio sirve como referencia reproducible de un pipeline LoRA + fine-tuning completo sobre ~1 hora de audio, con documentación de entrenamiento y benchmarks.
- Evaluación comparativa de métodos de clonación: permite contrastar la fidelidad de un modelo ajustado frente a sistemas zero-shot como IndexTTS-2.5 en un personaje concreto, usando el mismo conjunto de referencias.
- Localización cruzada japonés-chino: generación de la misma línea en ambos idiomas para probar la transferencia de timbre entre lenguas en un contexto de doblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, MCD, WER) en la información disponible. El autor aporta métricas de rendimiento (RTF) y una comparación subjetiva de escucha, que se recogen a continuación sin tratarlas como benchmarks formales.

| Metrica | v5dev | v5turbo |
|---|---|---|
| RTF en GPU (RTX PRO 6000, fp16) | ~1,08 | ~0,74-0,82 |
| RTF en CPU (Ryzen 7 255, fp32) | ~32 (no viable) | ~3,2 (viable) |
| Tiempo CPU para 4 s de audio | ~131 s | ~12 s |
| Calidad subjetiva frente a dev | referencia | 80-95 % de fidelidad y naturalidad |
| Comparación subjetiva con IndexTTS-2.5 | superior en fidelidad de timbre para este personaje (según el autor) | no evaluado |

Las cifras de RTF se midieron en una GPU NVIDIA RTX PRO 6000 Blackwell (96 GB, sm_120, CUDA 13.0, PyTorch 2.8.0+cu128) y en una CPU AMD Ryzen 7 255 (Zen 4, 8 núcleos/16 hilos, 21,8 GB DDR5, PyTorch 2.14.1+cpu). El autor indica que los datos de CPU son extrapolables a plataformas 7840HS por compartir arquitectura Zen 4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor ejecuta en fp16 sobre una GPU de 96 GB, aunque el tamaño del repositorio (0,3 GB) y la arquitectura sugieren que el modelo cabe holgadamente en GPU consumer, si bien no se documenta el mínimo.
- GPU recomendadas: RTX PRO 6000 Blackwell (entorno de referencia del autor). No se especifican otras GPU probadas.
- GPU consumer: no se confirma ni se descarta; no hay datos publicados de ejecución en RTX 4090, 3090 u otras.
- CPU: la variante turbo es viable en CPU (RTF ~3,2 en Ryzen 7 255 / 7840HS); la variante dev no es viable en CPU (RTF ~32).
- Despliegue: servidor HTTP de GPT-SoVITS (`api_v2.py`) con configuración YAML (`tts_infer_v5dev.yaml` o `tts_infer_v5turbo.yaml`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Dependencias externas obligatorias: `chinese-hubert-base`, `chinese-roberta-wwm-ext-large`, `s1v3.ckpt`, `s2Gv5dev.pth`, `s2Gv5turbo.pth`, `vocoder.pth` y `pretrained_eres2netv2w24s4ep4.ckpt`, que no se incluyen en el repositorio.
- Latencia y throughput: ver tabla de benchmarks; en GPU dev ~1,08 RTF, en CPU turbo ~3,2 RTF.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KurisuMakiseTTS | TTS ajustado (GPT-SoVITS v5) | ja, zh | referencia de 5-10 s | Apache-2.0 (pesos), derechos de personaje reservados | Hugging Face |
| GPT-SoVITS (base) | TTS zero-shot / few-shot | múltiples (incl. ja, zh) | referencia de audio | MIT (código) | GitHub, Hugging Face |
| IndexTTS-2.5 | TTS zero-shot con control por lenguaje natural | no disponible | referencia única | bilibili Model Use License | no distribuido en este repositorio |

La comparación cualitativa aportada por el autor sitúa a la variante dev por encima de IndexTTS-2.5 en fidelidad de timbre para este personaje concreto, atribuyéndolo al ajuste fino frente a la clonación zero-shot con una sola referencia. No hay datos objetivos de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de TTS.

## Limitaciones y advertencias

- Riesgo legal: los derechos del personaje Makise Kurisu pertenecen a 5pb./MAGES./Nitroplus y los de la voz a la actriz original. La licencia Apache-2.0 no cubre esos derechos; el uso comercial exige autorización expresa de los titulares.
- Prohibición de uso para suplantación de personas reales, falsificación de voz o fraude, según el propio autor.
- El autor se reserva retirar el modelo si los titulares de derechos lo solicitan.
- Sesgos de datos: el corpus está dominado por muestras de "declaración racional" (~73 %), con pocos ejemplos emocionales, lo que limita la expresividad en escenas de alta carga emotiva.
- Dependencia de la referencia: la calidad y el tono dependen críticamente del clip de referencia; `prompt_text` debe coincidir literalmente con el audio y este no debe superar los 10 segundos.
- Cobertura lingüística limitada a japonés y chino; no se documenta soporte de español ni de otras lenguas.
- La variante dev no es viable en CPU (RTF ~32), lo que restringe su despliegue a entornos con GPU.
- No hay benchmarks objetivos publicados; las comparaciones de calidad son subjetivas del autor.
- Alucinación en el sentido de prosodia o pronunciación no controlada en textos fuera del dominio de entrenamiento; no se documenta evaluación de robustez.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FishelKET/KurisuMakiseTTS
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Repositorio de código GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Dataset de audio y transcripciones: https://huggingface.co/bysq/TTS-KurisuMakise
- `chinese-hubert-base`: https://huggingface.co/TencentGameMate/chinese-hubert-base
- `chinese-roberta-wwm-ext-large`: https://huggingface.co/hfl/chinese-roberta-wwm-ext-large
- Documentación de entrenamiento: https://huggingface.co/FishelKET/KurisuMakiseTTS/blob/main/docs/training.md
- Documentación de benchmarks: https://huggingface.co/FishelKET/KurisuMakiseTTS/blob/main/docs/benchmark.md
- Licencia: https://huggingface.co/FishelKET/KurisuMakiseTTS/blob/main/LICENSE
- Aviso legal: https://huggingface.co/FishelKET/KurisuMakiseTTS/blob/main/DISCLAIMER.md
