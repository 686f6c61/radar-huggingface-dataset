# Phoonnx/glowtts-en-us-blizzard_fls

## Resumen

`Phoonnx/glowtts-en-us-blizzard_fls` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS homonima. El modelo genera espectrogramas a partir de fonemas IPA del ingles estadounidense, que posteriormente son convertidos a audio por el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automaticamente por la libreria.

La relevancia de este modelo reside en su empaquetado: convierte un modelo Larynx clasico en un artefacto ONNX consumible desde Python y desde el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. Esto lo hace util para asistentes de voz autoalojados, prototipos de sintesis y entornos donde se prefiere inferencia ONNX ligera frente a frameworks de deep learning completos.

El repositorio ocupa aproximadamente 0,1 GB y esta orientado exclusivamente al idioma `en-US`. No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento originales; la model card se limita a describir el empaquetado y el uso. La licencia figura como `other`, sin que se haya registrado una licencia concreta para este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | `en-US` (ingles estadounidense) |
| Licencia | `other` (sin licencia concreta registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `hifigan-multi-vctk-small` |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis no autoregresivo que combina un encoder Transformer con un flujo normalizador invertible (Glow) para mapear texto (en este caso, fonemas IPA) a espectrogramas mel. La alineacion entre fonemas y frames de audio se resuelve mediante busqueda de alineamiento monotono (MAS), lo que evita el uso de un modelo de atencion autoregresivo y permite sintesis en paralelo. El espectrograma resultante se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, entrenado sobre el corpus multi-hablante VCTK.

Este empaquetado concreto proviene del release `en-us_blizzard_fls-glow_tts.tar.gz` del proyecto Larynx v1.0 de Rhasspy. El identificador `blizzard_fls` sugiere el uso del corpus Blizzard (voz femenina) como fuente de datos, aunque la model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS de este tipo). El front-end de texto se delega en `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `GruutPhonemizer` del modulo `scriptconv.phonemizers.mul`, instalado con el extra `scriptconv[gruut]`.

## Capacidades

- Sintesis de voz en ingles estadounidense (`en-US`) a partir de texto plano.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio WAV mediante HiFi-GAN.
- Normalizacion de texto y fonemizacion IPA via `scriptconv` y `GruutPhonemizer`.
- Integracion directa con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre runtime ONNX, lo que permite despliegue ligero sin frameworks de entrenamiento.
- Salida directa a fichero WAV mediante `voice.synthesize_wav(text, wav_file)`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es un modelo multilingue: unicamente `en-US`.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, de modo que un asistente local puede sintetizar respuestas sin depender de servicios en la nube.
- Sintesis de voz en dispositivos de borde: al distribuirse en ONNX y ocupar ~0,1 GB, puede ejecutarse en entornos con recursos limitados donde no es viable cargar un framework completo de deep learning.
- Generacion de avisos y notificaciones habladas en ingles: util para sistemas de domotica o monitoreo que necesitan leer mensajes cortos en `en-US` con baja latencia.
- Prototipado de interfaces de voz: permite validar rapidamente un flujo TTS en Python usando `TTSModelManager` y `voice.synthesize_wav` antes de invertir en modelos mas grandes.
- Accesibilidad: lectura en voz alta de contenido textual en ingles para aplicaciones de asistencia, aprovechando la salida WAV directa del modelo.
- Pruebas de regresion en pipelines de TTS: al ser un artefacto ONNX versionado, sirve como referencia estable para comparar calidad acustica frente a otros modelos Glow-TTS del mismo collection.
- Educacion e investigacion: ejemplo didactico de un pipeline TTS completo (fonemizador gruut, Glow-TTS, HiFi-GAN) empaquetado de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa ~0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer, aunque no se especifica el consumo real de memoria.
- GPU recomendadas: no disponible. Dado el tamano del artefacto, cualquier GPU moderna (incluidas GTX/RTX de gama media) deberia ser suficiente; no se documentan requisitos minimos.
- Cabe en GPU consumer: si, por el tamano del repositorio (~0,1 GB), aunque no se confirma con datos oficiales.
- Opciones de despliegue: `phoonnx` (runtime ONNX), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en-us-blizzard_fls` | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin licencia concreta) | Hugging Face, via phoonnx |
| Otros modelos del collection Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | segun modelo | ONNX | other | Hugging Face, via phoonnx |
| Modelos Larynx originales (Rhasspy) | Glow-TTS + vocoder | varios | tarball | segun release upstream | GitHub releases de rhasspy/larynx |
| Modelos TTS neuronales de gran escala (p. ej. VITS, Piper) | VITS / otros | varios | ONNX / otros | variable | Hugging Face, repositorios propios |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia `other` sin licencia concreta registrada: es imprescindible revisar el release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Unicamente soporta `en-US`; no es adecuado para otros idiomas.
- Requiere un front-end de fonemizacion gruut (`scriptconv[gruut]`); el texto debe procesarse con el fonemizador correcto para obtener resultados validos.
- Depende de un vocoder externo (`hifigan-multi-vctk-small`) que phoonnx descarga automaticamente; sin el, no se genera audio.
- No se documentan sesgos conocidos, pero al derivar de un corpus Blizzard de un unico hablante, la diversidad vocal es limitada.
- Riesgo de alucinacion no aplicable en el sentido de LLM, pero si puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o no inglesas.
- No se dispone de informacion sobre el numero de parametros, datos de entrenamiento ni metricas de calidad (MOS), lo que dificulta evaluar su rendimiento frente a alternativas.
- El modelo esta pensado para inferencia ONNX via phoonnx; no se documenta soporte para otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-blizzard_fls
- Release upstream (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_fls-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Collection Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
