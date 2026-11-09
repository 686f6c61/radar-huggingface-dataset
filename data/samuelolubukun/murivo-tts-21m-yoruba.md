# samuelolubukun/murivo-tts-21m-yoruba

## Resumen

Murivo-TTS 21M Yorùbá es un motor de síntesis de voz (text-to-speech) ultraligero desarrollado por Samuel Olubukun, diseñado específicamente para el idioma yoruba (sudoeste de Nigeria). Combina un backbone acústico de tipo Diffusion Transformer (DiT) con flow-matching de aproximadamente 20,9 millones de parámetros con el vocoder neuronal causal AudioVAE de VoxCPM2, que opera de forma nativa a 48 kHz. El resultado es un sistema capaz de generar audio con calidad de estudio sin dependencias de librerías C externas ni del motor fonemizador `espeak-ng`.

El modelo resuelve un problema concreto: la escasez de sistemas TTS de alta fidelidad para lenguas de bajos recursos como el yoruba, que presenta una fonología tonal compleja (tonos altos, medios y bajos, vocales con subpunto como ọ y ẹ, y nasales). Con solo ~41,9 MB en FP16, el checkpoint es lo suficientemente pequeño como para ejecutarse en CPU o en GPU de consumo, lo que lo hace atractivo para despliegues offline y en dispositivos con recursos limitados.

El checkpoint publicado corresponde a la etapa 2 de un currículo de entrenamiento en dos fases (paso 1.800), orientada a prosodia conversacional. La licencia MIT y la ausencia de dependencias propietarias facilitan su integración en productos comerciales, aunque el estado del checkpoint (etapa conversacional intermedia) y la falta de benchmarks publicados aconsejan tratarlo como una base en desarrollo más que como un sistema listo para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-Matching Diffusion Transformer (DiT) con solver ODE Euler |
| Parametros totales | ~20,9 M (backbone acústico) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (checkpoint publicado); no se documentan otras |
| Idiomas soportados | Yoruba (yo) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, ~41,9 MB en FP16); vocoder `audiovae.pth` |
| Frecuencia de muestreo | 48.000 Hz nativa |
| Vocoder | VoxCPM2 48 kHz Causal AudioVAE (OpenBMB) |
| Checkpoint | Etapa 2 conversacional, paso 1.800 |
| Dependencias | torch, soundfile, numpy (sin espeak-ng) |

## Arquitectura y entrenamiento

El backbone acústico es un Diffusion Transformer (DiT) de ~20,9 M de parámetros entrenado con flow-matching y muestreo mediante solver ODE de Euler. La arquitectura sigue la línea de Rápido TTS, un diseño ligero de síntesis de voz basado en flow-matching DiT. La salida acústica se decodifica a forma de onda mediante el vocoder neuronal causal AudioVAE de VoxCPM2 a 48 kHz, que se descarga y cachea automáticamente desde Hugging Face (`openbmb/VoxCPM2`) en la primera ejecución.

El entrenamiento siguió un currículo en dos etapas. La etapa 1 (5.000 pasos) se entrenó sobre el corpus OpenBible en yoruba, con foco en registros tonales y fonología, alcanzando una pérdida final de 0,9328 (flow: 0,8912). La etapa 2 (1.800 pasos) aplicó adaptación conversacional sobre Nigerian Common Voice en yoruba, con foco en prosodia coloquial y cadencia, con una pérdida de duración de 0,1881. No se documentan datos sobre número total de tokens de audio, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en yoruba a 48 kHz con calidad de estudio, incluyendo tonos, diacríticos y vocales con subpunto.
- Control de la fuerza de guiado (`guidance`, por defecto 1,8), velocidad (`speed`, por defecto 1,0) y número de pasos de muestreo (`steps`, por defecto 20).
- Inferencia 100 % offline, sin llamadas a servicios externos ni dependencias de `espeak-ng`.
- Ejecución en CPU o GPU (`device="cuda"` o `device="cpu"`).
- API de Python (`MurivoTTS`) y CLI (`infer.py`) para integración en pipelines.
- Guardado de audio a WAV a 48 kHz mediante `soundfile`.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling ni agentes.

## Casos de uso

- **Locución y doblaje de contenido educativo en yoruba**: el modelo sintetiza frases con marcadores aspectuales continuos (`ń`) y combinaciones tonales complejas, útil para generar material didáctico en audio para escuelas nigerianas sin necesidad de locutores.
- **Accesibilidad para personas con discapacidad visual**: lectura de textos en yoruba en aplicaciones móviles o de escritorio, gracias a que el modelo corre en CPU y no requiere conexión a internet.
- **Asistentes de voz offline para dispositivos de bajo consumo**: con ~41,9 MB en FP16, el checkpoint cabe en dispositivos embebidos y permite síntesis local sin enviar texto a la nube.
- **Generación de audiolibros y contenido editorial**: la frecuencia nativa de 48 kHz y el vocoder AudioVAE permiten producir audio con calidad suficiente para publicación en plataformas de podcast o audiolibros.
- **Prototipado de interfaces conversacionales en yoruba**: la API de Python con parámetros de `guidance`, `speed` y `steps` facilita iterar sobre prosodia y velocidad en pruebas de concepto de IVR o chatbots de voz.
- **Investigación en TTS para lenguas de bajos recursos**: el modelo sirve como base reproducible (licencia MIT, dependencias mínimas) para experimentos de fine-tuning o comparación de arquitecturas DiT ligeras en lenguas tonales.
- **Sistemas de megafonía y anuncios públicos**: generación de avisos pregrabados en yoruba para transporte, aeropuertos o comercios, con ejecución local y sin coste por llamada a API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento:

| Etapa | Pasos | Dataset | Foco | Pérdida final |
|---|---|---|---|---|
| Etapa 1 (estudio) | 5.000 | OpenBible Yoruba | Registros tonales y fonología | 0,9328 (flow: 0,8912) |
| Etapa 2 (conversacional) | 1.800 | Common Voice Yoruba | Prosodia coloquial y cadencia | Duración: 0,1881 |

No se proporcionan métricas subjetivas (MOS), inteligibilidad (WER/CER) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP16 para el backbone (~41,9 MB) más el vocoder AudioVAE; el consumo real depende de la implementación de PyTorch y del tamaño del vocoder, no documentado.
- GPU recomendadas: cualquier GPU con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el modelo es lo bastante pequeño como para no requerir GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Opciones de despliegue: script `infer.py` propio y API de Python `MurivoTTS`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM, no a TTS).
- Latencia y throughput: no disponibles. El número de pasos de muestreo (por defecto 20) y el solver ODE Euler condicionan la latencia, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Frecuencia | Idiomas | Licencia | Contexto/notas |
|---|---|---|---|---|---|
| Murivo-TTS 21M Yorùbá | ~20,9 M | 48 kHz | Yoruba | MIT | Flow-matching DiT + AudioVAE; checkpoint etapa 2 |
| Rápido TTS | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia citada por el autor; no se dispone de especificaciones en la información proporcionada |
| VoxCPM2 (vocoder) | no disponible | 48 kHz | no disponible | no disponible | Vocoder AudioVAE utilizado por Murivo; no es un TTS completo |
| Otros TTS para lenguas africanas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (MOS, WER) con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Estado del checkpoint**: es la etapa 2 conversacional en el paso 1.800, no un modelo final; la calidad puede no ser estable en todas las frases.
- **Cobertura lingüística limitada**: solo yoruba; no se documenta soporte para inglés, hausa ni igbo, pese a que el título de la cita BibTeX los menciona.
- **Sesgos de los datos**: entrenado sobre OpenBible y Nigerian Common Voice, lo que puede introducir sesgos de dominio (registro bíblico y voces de voluntarios) y limitar la generalización a otros registros.
- **Riesgo de alucinación acústica**: como todo modelo generativo, puede producir pronunciaciones incorrectas en palabras con tonos o diacríticos poco representados.
- **Sin benchmarks publicados**: no hay métricas objetivas de inteligibilidad ni de calidad percibida, lo que dificulta evaluar su idoneidad para producción.
- **Licencia MIT**: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento (OpenBible y Nigerian Common Voice) y del vocoder VoxCPM2 antes de un despliegue comercial.
- **Dependencia del vocoder externo**: requiere descargar `audiovae.pth` desde `openbmb/VoxCPM2` en la primera ejecución, lo que introduce una dependencia de red y de un tercero.
- **Sin soporte documentado** para clonación de voz, control emocional, SSML ni streaming.

## Enlaces

- Hugging Face: https://huggingface.co/samuelolubukun/murivo-tts-21m-yoruba
- Dataset OpenBible Multilingual TTS: https://huggingface.co/datasets/multilingual-tts/open-bible
- Dataset Nigerian Common Voice: https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset
- Vocoder VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Rápido TTS en Hugging Face: https://huggingface.co/edwixx/rapido-tts
- Rápido TTS en GitHub: https://github.com/anurag12-webster/rapido-tts
- Perfil del autor: https://huggingface.co/samuelolubukun
