# Phoonnx/glowtts-en_us-cmu_rms-gruut

## Resumen

Glow-TTS en_us-cmu_rms-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria de inferencia phoonnx. El modelo genera espectrogramas a partir de fonemas IPA del ingles estadounidense (en-US), que posteriormente son convertidos a audio por el vocoder HiFi-GAN multi-VCTK-small. Se distribuye como un componente ligero (0,1 GB de repositorio) orientado a la sintesis local y de bajos requisitos computacionales.

El modelo resuelve el problema de la sintesis de voz en ingles dentro de entornos con recursos limitados, como asistentes de voz embebidos o sistemas domoticos. Su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` lo hace directamente utilizable en asistentes de voz de codigo abierto. La entrada de texto se procesa mediante la libreria scriptconv con el fonemizador Gruut, que normaliza el texto y lo convierte a la representacion fonetica IPA esperada por el modelo.

La relevancia actual del modelo reside en su caracter practico: es un componente de inferencia ONNX optimizado para ejecucion en CPU y GPU de forma portable, con un pipeline completo (fonemizacion, sintesis de espectrograma y vocoder) documentado y reproducible. No obstante, la licencia no esta registrada de forma explicita, lo que introduce incertidumbre para uso comercial. El modelo esta orientado exclusivamente al ingles estadounidense y no dispone de datos publicados de benchmarks objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (sintesis de voz basada en flujo normalizador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS; entrada por fonema/sintagma) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en ONNX; no se documentan variantes) |
| Idiomas soportados | Ingles estadounidense (en-US) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX (inferencia via libreria phoonnx) |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | Fonemas gruut, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Version del modelo upstream | v1.0 (release de Larynx de Rhasspy) |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de sintesis de voz que combina un flujo normalizador con alineamiento monotono para generar espectrogramas mel a partir de fonemas. El modelo aprende una transformacion invertible entre la distribucion de los espectrogramas y una distribucion latente, lo que permite una sintesis rapida y determinista sin necesidad de atencion autorregresiva. El empaquetado en ONNX por Phoonnx elimina la dependencia del framework de entrenamiento original y permite la inferencia mediante la libreria phoonnx, que se encarga de cargar el modelo y el vocoder asociado.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o las horas de audio utilizadas. La model card indica que el modelo proviene del release v1.0 de Larynx de Rhasspy y que la voz se identifica como `en-us-cmu_rms-glow_tts`. El vocoder HiFi-GAN multi-VCTK-small convierte el espectrograma generado en waveform de audio, y phoonnx lo descarga automaticamente junto con la voz. No se documentan procesos de RLHF, DPO ni innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de texto plano, con salida en formato WAV.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio mediante el vocoder HiFi-GAN.
- Fonemizacion y normalizacion de texto mediante scriptconv con el fonemizador Gruut.
- Integracion con el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Inferencia portable via ONNX, ejecutable en CPU y GPU.
- Gestion de voces mediante `TTSModelManager` de phoonnx, con carga y fusion de voces por defecto.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz de codigo abierto: el modelo se integra directamente en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo sintetizar respuestas del asistente en ingles estadounidense de forma local y sin dependencias de servicios en la nube.
- Sistemas de domotica y automatizacion del hogar: al ejecutarse en CPU y con un repositorio de solo 0,1 GB, puede desplegarse en dispositivos de bajos recursos (Raspberry Pi, mini-PC) para anuncios por voz de eventos del hogar.
- Lectura de textos y notificaciones: la API `synthesize_wav` permite generar audio WAV a partir de frases en ingles, util para convertir notificaciones, correos o articulos en audio.
- Desarrollo de prototipos de TTS: al ser un modelo ONNX empaquetado y documentado, sirve para validar pipelines de sintesis de voz antes de escalar a voces de mayor calidad.
- Pruebas de integracion en pipelines de audio: el modelo puede usarse como componente de un pipeline que combine fonemizacion (scriptconv), sintesis (Glow-TTS) y vocoder (HiFi-GAN), facilitando pruebas unitarias y de regresion.
- Accesibilidad: generacion de audio para personas con discapacidad visual en entornos donde se requiera una solucion de TTS local, sin latencia de red ni costes por peticion.
- Investigacion en sintesis de voz: el modelo sirve como linea base ligera de Glow-TTS en ONNX para comparar con arquitecturas mas recientes (Tacotron, VITS, difusion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio de 0,1 GB sugiere un modelo de pequeno tamano, apto para inferencia en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en GPU consumer (GTX 1060, RTX 3060, RTX 4090) y en CPU.
- Cabe en GPU consumer: si, dado el reducido tamano del repositorio (0,1 GB) y el caracter ONNX del modelo.
- Opciones de despliegue: libreria phoonnx (Python, via `TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` en OVOS. El formato ONNX permite su uso con runtimes ONNX (onnxruntime).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Glow-TTS en_us-cmu_rms-gruut (este) | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Empaquetado por Phoonnx, orientado a OVOS |
| Otros modelos Glow-TTS de la coleccion Phoonnx | Glow-TTS | multi (segun voz) | ONNX | variable | Diferentes voces de Larynx; misma arquitectura |
| Modelos Piper (rhasspy) | VITS | multi | ONNX | MIT | Alternativa moderna de Rhasspy para TTS local |
| Modelos VITS / Coqui TTS | VITS / Tacotron | multi | PyTorch, ONNX | variable | Mayor calidad, mayores requisitos |

No se dispone de datos objetivos de rendimiento (MOS, WER, latencia) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no esta registrada ("other"): es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso comercial o redistribucion.
- El modelo solo soporta ingles estadounidense (en-US); no hay soporte multilingue.
- La entrada debe ser texto en ingles que scriptconv/Gruut pueda normalizar y fonemizar correctamente; textos con caracteres especiales, abreviaturas o idiomas distintos pueden producir errores o pronunciaciones incorrectas.
- Riesgo de alucinacion o artefactos acusticos: como todo modelo de TTS, puede generar pronunciaciones erroneas o ruido en palabras fuera del vocabulario de entrenamiento.
- No se documentan sesgos de genero, acento o dialecto; dado que la voz es una voz concreta de Larynx, la diversidad de voces es limitada.
- No se dispone de informacion sobre calidad objetiva (MOS) ni sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez en produccion.
- El modelo depende de la libreria phoonnx (y de la version pre-release `pip install --pre phoonnx`), lo que implica un riesgo de estabilidad de API.
- No es un modelo de lenguaje: no realiza razonamiento, generacion de codigo ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_rms-gruut
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_rms-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
- OVOS (Open Voice OS): https://github.com/OpenVoiceOS
