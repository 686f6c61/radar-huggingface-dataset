# Phoonnx/glowtts-de_de-thorsten

## Resumen

glowtts-de_de-thorsten es un modelo de sintesis de voz (text-to-speech) en formato ONNX que implementa la arquitectura Glow-TTS. Lo desarrolla Rhasspy como parte del proyecto Larynx y lo empaqueta Phoonnx para su libreria de TTS basada en ONNX. El modelo genera voz en aleman de Alemania (de-DE) a partir de texto, usando fonemas IPA producidos por el fonemizador gruut como entrada.

El modelo resuelve la conversion de texto a espectrograma mel, que posteriormente se transforma en audio mediante el vocoder HiFi-GAN (hifigan-multi-vctk-small). Es relevante en el ecosistema de asistentes de voz open source, especialmente en OVOS (Open Voice OS), donde se integra como plugin de TTS. Su empaquetado en ONNX permite inferencia sin dependencias de PyTorch en produccion.

El repositorio ocupa aproximadamente 0,1 GB y esta orientado a un unico hablante (thorsten). La licencia no esta registrada en la model card, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (text-to-spectrogram) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autoregresivo basado en normalizing flows. Aprende una alineacion monotona entre fonemas y frames de espectrograma mel sin necesidad de un aligner externo, mediante busqueda de alineacion monotona (MAS). La arquitectura combina un encoder de texto, un decoder basado en flows invertibles y una capa de proyeccion a mel. El modelo no genera audio directamente: produce el espectrograma mel que despues sintetiza el vocoder HiFi-GAN (hifigan-multi-vctk-small).

El modelo original proviene del proyecto Larynx de Rhasspy (release v1.0), entrenado sobre la voz alemana "thorsten". La entrada de texto se procesa mediante el fonemizador gruut, que normaliza el texto y lo convierte a fonemas IPA antes de alimentar el encoder. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este tipo de modelo). La innovacion principal es el empaquetado en ONNX para inferencia ligera y su integracion con la libreria phoonnx.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman de Alemania (de-DE) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (GruutPhonemizer de scriptconv).
- Generacion de espectrograma mel que se transforma en audio con el vocoder HiFi-GAN.
- Voz de un unico hablante (thorsten).
- Integracion como plugin de TTS en OVOS (ovos-tts-plugin-phoonnx).
- Ejecucion en Python mediante la libreria phoonnx.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo puramente TTS).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf` con la voz `larynx/de-de-thorsten-glow_tts`, permitiendo respuestas habladas en aleman en un asistente domestico open source.
- Lectura de notificaciones y alertas en aleman: integrado en sistemas de monitorizacion o domotica, convierte mensajes de texto en audio para avisos por voz.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido textual (articulos, correos, documentacion) a audio en aleman con una voz natural de un solo hablante.
- Generacion de audiolibros o narraciones: al ser un modelo ligero (0,1 GB) y ONNX, permite sintetizar grandes volumenes de texto por lotes en CPU sin GPU dedicada.
- Prototipado de interfaces conversacionales en aleman: desarrolladores que necesitan un TTS rapido de integrar en pipelines de Python sin depender de servicios en la nube.
- Sistemas embebidos y edge computing: el formato ONNX y el reducido tamano del repositorio facilitan el despliegue en dispositivos con recursos limitados.
- Dooblaje o preproduccion de contenido en aleman: generacion rapida de pistas de voz provisionales para video o podcasts antes de una locucion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es lo bastante pequeno (repo de 0,1 GB) para inferencia en CPU.
- GPU recomendadas: no se especifican; al ser ONNX, puede ejecutarse en CPU o en GPU con soporte ONNX Runtime.
- Cabe en GPU consumer: presumiblemente si, dado el reducido tamano, aunque no se aportan cifras oficiales.
- Opciones de despliegue: libreria phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-thorsten | Glow-TTS + HiFi-GAN | de-DE | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otras voces Larynx (Rhasspy) | Glow-TTS + HiFi-GAN | varios | tarball / ONNX | segun upstream | GitHub rhasspy/larynx |
| Piper (Rhasspy) | VITS | varios | ONNX | MIT (segun proyecto) | GitHub rhasspy/piper |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia registrado en la model card; es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso, especialmente comercial.
- Modelo de un unico hablante (thorsten): no permite cambiar de voz ni de estilo.
- Solo soporta aleman (de-DE); no es multilingue.
- Al ser un modelo TTS, puede presentar errores de pronunciacion en palabras extranas, acronimos o terminos tecnicos no cubiertos por el fonemizador gruut.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la calidad de la voz en dominios especificos.
- Riesgo de artefactos acusticos propios de modelos Glow-TTS con vocoder HiFi-GAN, especialmente en frases largas o con puntuacion atipica.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requiere adaptar el pipeline de fonemizacion y vocoder.
- No apto para tareas de razonamiento, codigo, vision ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-thorsten
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_thorsten-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
