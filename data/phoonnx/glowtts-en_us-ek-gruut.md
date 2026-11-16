# Phoonnx/glowtts-en_us-ek-gruut

## Resumen

GlowTTS-en_us-ek-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`. El modelo genera un espectrograma a partir de fonemas IPA en ingles estadounidense (en-US) y delega la conversion a audio en un vocoder separado, `hifigan-multi-vctk-small`, tambien alojado en Hugging Face.

El modelo resuelve el problema de la sintesis de voz local y ligera: al estar exportado a ONNX y ocupar apenas 0,1 GB en el repositorio, puede ejecutarse en entornos sin GPU dedicada, integrado en asistentes de voz como OVOS (Open Voice OS) o en pipelines de Python. Su front-end de texto se apoya en `scriptconv` con el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a la secuencia de fonemas IPA que espera el modelo.

Es relevante ahora por su caracter de componente listo para produccion en el ecosistema de asistentes de voz open source: la integracion via plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `larynx/en-us-ek-glow_tts` mediante configuracion JSON, sin necesidad de reentrenar ni de infraestructura de inferencia compleja. No obstante, la licencia no esta registrada en la model card y el autor remite a la release upstream de Larynx para verificarla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo basado en flujos) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada en la model card; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico de sintesis de voz que combina flujos normalizadores invertibles con un mecanismo de alineamiento monotono (monotonic alignment search), lo que permite generar espectrogramas de forma paralela sin necesidad de un modelo de atencion autoregresivo. El modelo empaquetado aqui produce el espectrograma mel y delega la sintesis de forma de onda en el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que phoonnx descarga junto con la voz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial. El modelo original procede de la release v1.0 de Larynx (`en-us_ek-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a voces de calidad para asistentes de voz. La innovacion practica de este paquete es el export a ONNX y la integracion con el front-end `scriptconv`, que resuelve la normalizacion de texto y la fonemizacion con gruut.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Conversion texto a fonemas IPA mediante `GruutPhonemizer` (extra `scriptconv[gruut]`).
- Generacion de espectrogramas mel y sintesis de audio WAV a traves del vocoder HiFi-GAN.
- Ejecucion en CPU mediante runtime ONNX, sin requerir GPU.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- API programatica en Python (`TTSModelManager`, `voice.synthesize_wav`).
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No dispone de capacidades multilingues: solo en-US.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS seleccionando la voz `larynx/en-us-ek-glow_tts` en `mycroft.conf`, de modo que un asistente domestico puede sintetizar respuestas sin conexion a servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse en CPU via ONNX y ocupar 0,1 GB, puede incrustarse en aplicaciones ligeras que necesiten leer texto en voz alta sin dependencias pesadas.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido textual (articulos, correos, interfaces) en ingles estadounidense con una voz neuronal de calidad superior a la sintesis por concatenacion clasica.
- Generacion de audiolibros o podcasts automatizados: el modelo puede procesar frases de forma secuencial y volcar cada una a un fichero WAV mediante `synthesize_wav`, para posteriormente concatenar los segmentos.
- Pruebas de regresion en pipelines de TTS: al ser un modelo ONNX deterministico y pequeno, sirve como referencia en tests automatizados de calidad de sintesis o de integracion de front-ends de fonemizacion.
- Prototipado de interfaces conversacionales: desarrolladores que evaluan el ecosistema phoonnx/scriptconv pueden validar el flujo completo texto a fonemas a espectrograma a audio antes de migrar a voces de mayor calidad.
- Sistemas embebidos y dispositivos de bajo consumo: la ausencia de requisitos de GPU y el formato ONNX permiten desplegarlo en Raspberry Pi o mini-PC para avisos hablados en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta disenado para inferencia en CPU mediante ONNX y su repositorio ocupa 0,1 GB.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeno, cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no es necesario.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y runtime ONNX subyacente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano repo | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-ek-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB | Empaquetado para phoonnx/OVOS |
| Otras voces de la coleccion Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varias | ONNX | no disponible | no disponible | Misma coleccion de modelos empaquetados |
| Larynx v1.0 (upstream Rhasspy) | Glow-TTS + vocoder | en-US y otros | tar.gz (formato original) | no disponible | no disponible | Origen del modelo, sin empaquetado ONNX |
| Piper (sucesor de Larynx) | VITS | varios | ONNX | MIT (segun proyecto) | no disponible | Alternativa mas moderna del mismo autor |

La comparativa con modelos de la misma categoria (TTS neuronal ligero) queda limitada a la informacion disponible: no se han publicado en la model card datos de rendimiento que permitan una comparacion cuantitativa con Piper u otras alternativas.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no hay capacidades multilingues.
- La licencia figura como "other" y el autor indica que no hay licencia registrada: es imprescindible verificar la licencia de la release upstream de Larynx antes de cualquier uso comercial.
- Depende de un front-end externo (`scriptconv` con gruut) para la fonemizacion; un texto mal normalizado o fuera de dominio puede producir pronunciaciones incorrectas.
- Al ser un modelo de sintesis de voz, puede heredar sesgos acusticos y de pronunciacion del dataset de entrenamiento original, no documentado en la model card.
- No apto para tareas de razonamiento, codigo, tool calling ni agentes; su unico proposito es TTS.
- El modelo genera espectrogramas y requiere el vocoder `hifigan-multi-vctk-small` para producir audio; sin el, la salida no es utilizable directamente.
- No se documentan limites de longitud de entrada ni latencias, por lo que en produccion conviene validar el comportamiento con frases largas.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos del repositorio, con solo 22 descargas y 0 likes: no hay evidencia de adopcion amplia ni de mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-ek-gruut
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_ek-glow_tts.tar.gz
