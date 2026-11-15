# Phoonnx/glowtts-en_us-cmu_ksp

## Resumen

`glowtts-en_us-cmu_ksp` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo convierte texto en inglés estadounidense en espectrogramas acústicos, que posteriormente son convertidos a audio por el vocoder HiFi-GAN (`hifigan-multi-vctk-small`), descargado automáticamente junto con la voz.

El modelo resuelve el problema de la síntesis de voz local y ligera: con un repositorio de apenas 0,1 GB y pesos en ONNX, está pensado para ejecutarse en entornos con recursos limitados, como asistentes de voz embebidos (integración con OVOS/Mycroft) o aplicaciones de escritorio. No es un modelo de lenguaje generativo ni un sistema TTS neuronal de gran escala como los basados en difusión o LLM; es un modelo acústico compacto y determinista.

Su relevancia actual radica en su integración dentro del ecosistema Phoonnx/OVOS, que facilita el despliegue de voces TTS en asistentes de voz open source sin depender de servicios en la nube. La información disponible es limitada: no se publican detalles sobre el dataset de entrenamiento, número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | `other` (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Vocoder | `hifigan-multi-vctk-small` |
| Autor original | Rhasspy (proyecto Larynx) |
| Empaquetado por | Phoonnx |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que modela directamente la distribución de espectrogramas mel condicionada al texto, sin necesidad de alineamientos externos ni de un modelo de atención autorregresivo. Utiliza un encoder de texto y un decoder basado en flows invertibles, lo que permite una generación rápida y paralela de espectrogramas. La salida del modelo acústico se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, un generador adversarial entrenado sobre el corpus multi-hablante VCTK.

El modelo original fue entrenado por Rhasspy como parte de Larynx v1.0, sobre el corpus `cmu_ksp` (una voz concreta del conjunto de datos CMU). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a modelos TTS). La innovación técnica principal es la propia arquitectura Glow-TTS, que permite inferencia paralela y determinista, adecuada para despliegue en tiempo real en CPU.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Conversión de texto a fonemas mediante el fonemizador gruut (alfabeto IPA) a través de `scriptconv`.
- Generación de espectrogramas mel que el vocoder HiFi-GAN convierte en audio WAV.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecución local en CPU mediante ONNX Runtime (sin necesidad de GPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Multilingüismo: únicamente inglés estadounidense.

## Casos de uso

- **Asistentes de voz embebidos (OVOS/Mycroft)**: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `larynx/en-us-cmu_ksp-glow_tts` en `mycroft.conf`, proporcionando síntesis local sin depender de la nube.
- **Lectura de notificaciones y alertas en sistemas domóticos**: al ser un modelo ONNX de 0,1 GB, puede ejecutarse en una Raspberry Pi o dispositivo similar para convertir mensajes de texto en audio en tiempo real.
- **Generación de audiolibros o contenido pregrabado por lotes**: se puede invocar `voice.synthesize_wav(text, wav_file)` en un script para sintetizar grandes volúmenes de texto en inglés a WAV de forma determinista.
- **Accesibilidad para personas con discapacidad visual**: integración en lectores de pantalla o aplicaciones de escritorio que necesiten una voz local en inglés sin conexión.
- **Pruebas de pipelines TTS en CI/CD**: al ser un modelo pequeño y determinista, es adecuado para tests automatizados de sistemas de voz sin coste de API.
- **Prototipado de interfaces conversacionales**: permite validar flujos de diálogo en inglés con una voz funcional antes de invertir en modelos TTS de mayor calidad.
- **Sistemas de megafonía o anuncios automatizados**: síntesis de anuncios pregrabados en inglés para entornos controlados (aeropuertos, comercios) donde no se requiere clonación de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica para inferencia en CPU; en GPU, el modelo ONNX de 0,1 GB requiere menos de 1 GB de VRAM (estimación basada en el tamaño del repo, no confirmada por el autor).
- **GPU recomendadas**: no es necesario GPU; funciona en CPU mediante ONNX Runtime. Cualquier GPU consumer (GTX 1050 o superior) podría ejecutarlo, pero no se documenta.
- **¿Cabe en consumer GPU?**: sí, con enorme margen, dado el tamaño reducido del modelo.
- **Opciones de despliegue**: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles. Al ser un modelo Glow-TTS con inferencia paralela, se espera baja latencia en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño repo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `glowtts-en_us-cmu_ksp` (este) | Glow-TTS + HiFi-GAN | en-US | 0,1 GB | other (sin registrar) | ONNX | Hugging Face |
| Otras voces Larynx (Rhasspy) | Glow-TTS + HiFi-GAN | varios | similar | otras licencias | tar.gz / ONNX | GitHub Rhasspy |
| Piper (rhasspy/piper) | VITS | varios | variable | MIT (mayoría) | ONNX | Hugging Face / GitHub |
| Coqui TTS (XTTS) | VITS / autoregresivo | multilingüe | varios GB | MPL 2.0 / otras | PyTorch | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia ambigua**: la model card indica explícitamente que no hay licencia registrada y recomienda consultar el release upstream antes de usarlo. Riesgo legal para uso comercial.
- **Idioma único**: solo inglés estadounidense; no soporta otros idiomas ni acentos.
- **Calidad de voz**: al ser un modelo Glow-TTS de Larynx v1.0 (2021), la calidad natural puede ser inferior a la de modelos TTS neuronales modernos (difusión, LLM-based).
- **Riesgo de alucinación acústica**: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios; el fonemizador gruut mitiga parcialmente este problema.
- **Dependencia de fonemas**: requiere el front-end `scriptconv[gruut]`; sin él, el modelo no puede procesar texto.
- **Sesgos**: no documentados; al entrenarse sobre el corpus CMU, puede reflejar sesgos de pronunciación o prosodia del hablante original.
- **Sin soporte de clonación de voz ni control de estilo**: es una voz fija.
- **Documentación escasa**: no se publican parámetros, dataset ni benchmarks, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ksp
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ksp-glow_tts.tar.gz
- Colección Glow-TTS en Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
