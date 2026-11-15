# Phoonnx/glowtts-en_us-southern_female

## Resumen

`Phoonnx/glowtts-en_us-southern_female` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por el proyecto Rhasspy dentro del ecosistema Larynx, y empaquetado por Phoonnx en formato ONNX para su uso con su librería de inferencia TTS. El modelo genera espectrogramas a partir de fonemas IPA y delega la síntesis de audio final en un vocoder HiFi-GAN externo (`hifigan-multi-vctk-small`), también distribuido por Phoonnx. Se trata de una voz femenina de inglés estadounidense con acento sureño (`en-US`).

El modelo no es un LLM ni un sistema generativo de propósito general: es un componente especializado de un pipeline TTS de dos etapas (acústica + vocoder). Su relevancia actual reside en que permite desplegar síntesis de voz local, sin dependencias de servicios en la nube, dentro del stack OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, y en que su empaquetado ONNX facilita la inferencia en CPU y en dispositivos de bajos recursos.

El repositorio ocupa aproximadamente 0,1 GB y las métricas de adopción son muy bajas (30 descargas, 0 likes en el momento de la consulta), lo que sugiere un modelo de nicho orientado a integraciones concretas con asistentes de voz open source más que a uso generalista. La licencia figura como "other" sin texto asociado, lo que constituye una limitación relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase en fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes) |
| Idiomas soportados | `en` (`en-US`, acento sureño) |
| Licencia | `other` (sin texto de licencia registrado; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | `hifigan-multi-vctk-small` (descargado automáticamente por phoonnx) |
| Autoria original | Rhasspy (proyecto Larynx v1.0) |
| Empaquetado | Phoonnx (`github.com/TigreGotico/phoonnx`) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acústico basado en normalizing flows que modela directamente la distribución de espectrogramas mel condicionada a la secuencia de fonemas, sin necesidad de alineamientos externos ni de un modelo de atención autoregresivo. La alineación entre texto y audio se resuelve mediante un mecanismo de búsqueda de monotonicidad (MAS, monotonic alignment search) durante el entrenamiento, lo que permite una síntesis paralela y por tanto más rápida que alternativas autoregresivas como Tacotron 2. El modelo produce espectrogramas mel que posteriormente son convertidos a forma de onda por el vocoder HiFi-GAN.

En cuanto a los datos de entrenamiento, la model card no documenta el número de horas de audio, la composición del corpus ni si se aplicaron etapas de ajuste fino o RLHF (no aplicables en TTS de este tipo). Se sabe que el modelo procede del release v1.0 de Larynx (`en-us_southern_english_female-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a voces de alta calidad para asistentes de voz offline. La única innovación documentada en el empaquetado es el uso de ONNX como formato de ejecución portable y la integración del front-end fonémico mediante `scriptconv` con `GruutPhonemizer`.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense con acento sureño y voz femenina.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio WAV mediante HiFi-GAN.
- Fonemización de entrada mediante `gruut` en alfabeto IPA, con normalización de texto delegada a `scriptconv`.
- Integración con asistentes de voz OVOS/Mycroft a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en Python mediante `TTSModelManager` de phoonnx, con descarga automática del vocoder.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo TTS.
- No es multilingüe: solo `en-US`.

## Casos de uso

- Asistentes de voz offline en OVOS/Mycroft: el modelo se selecciona como módulo TTS en `mycroft.conf` y proporciona respuestas habladas locales sin enviar texto a servicios externos, lo que es adecuado para despliegues domésticos con requisitos de privacidad.
- Síntesis de voz en dispositivos de bajos recursos: al distribuirse en ONNX y ocupar ~0,1 GB, puede ejecutarse en CPU en Raspberry Pi o mini-PC, integrándose en pipelines de domótica o kioscos interactivos.
- Generación de audiolibros o avisos pregrabados en inglés sureño: útil para contenido con marca regional concreta, donde el acento sureño aporta autenticidad frente a voces neutras.
- Pruebas de regresión de pipelines TTS: al ser un modelo pequeño y determinista en su arquitectura, sirve como referencia para validar integraciones de `scriptconv`, fonemización gruut y vocoder HiFi-GAN en CI.
- Prototipado de interfaces conversacionales: permite iterar rápidamente sobre diálogos en inglés sin coste por carácter ni latencia de red, usando `voice.synthesize_wav` sobre frases sueltas.
- Accesibilidad: lectura en voz alta de textos en inglés para usuarios con discapacidad visual en aplicaciones de escritorio basadas en Python, siempre que el contenido esté en `en-US`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (~0,1 GB) y la naturaleza de Glow-TTS + HiFi-GAN small, es plausible su ejecución en CPU, aunque no se confirma con cifras oficiales.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU; el empaquetado ONNX sugiere compatibilidad con CPU y con aceleración opcional.
- ¿Cabe en GPU de consumo? No se especifica; el tamaño reducido del modelo lo hace probable, pero no hay confirmación del autor.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano repo | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-southern_female` | Glow-TTS + HiFi-GAN | en-US (sureño) | ~0,1 GB | ONNX | other (sin texto) | Empaquetado para phoonnx/OVOS |
| Otras voces Glow-TTS de la colección Phoonnx | Glow-TTS + HiFi-GAN | en (distintos acentos) | ~0,1 GB | ONNX | other | Misma arquitectura y vocoder; cambia la voz |
| Piper (rhasspy/piper) | VITS | Multiidioma | Variable | ONNX | MIT (mayoritariamente) | Sucesor práctico de Larynx; mayor calidad y licencia más clara |
| Coqui TTS (XTTS, VITS) | Varias | Multiidioma | Variable | PyTorch/ONNX | MPL 2.0 / CPML | Ecosistema más amplio, pero pesado |

No se dispone de datos de benchmarks que permitan comparar calidad (MOS) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other` sin texto registrado: no hay autorización explícita para uso comercial; es imprescindible revisar el release upstream de Larynx antes de desplegar en producción.
- Modelo de nicho con adopción mínima (30 descargas, 0 likes): no hay evidencia comunitaria de robustez en producción.
- Solo inglés estadounidense con acento sureño; no soporta otros idiomas ni variantes regionales.
- Depende de un vocoder externo (`hifigan-multi-vctk-small`) que debe descargarse por separado, lo que añade un punto de fallo en el despliegue.
- La entrada debe pasar por fonemización gruut; textos con caracteres no ingleses, siglas o números pueden requerir normalización previa por `scriptconv`.
- No se documentan sesgos específicos, pero al ser una voz única y con acento regional, puede no ser adecuada para aplicaciones que requieran neutralidad o diversidad de voces.
- No hay información sobre calidad subjetiva (MOS), latencia ni estabilidad en textos largos; se recomienda evaluar con muestras propias antes de integrar.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede producir pronunciaciones incorrectas en palabras fuera del vocabulario fonémico.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-southern_female
- Upstream Larynx (release v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_southern_english_female-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
