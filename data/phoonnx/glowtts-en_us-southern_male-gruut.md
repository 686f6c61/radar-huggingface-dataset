# Phoonnx/glowtts-en_us-southern_male-gruut

## Resumen

GlowTTS en_us southern male gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera espectrogramas a partir de texto en ingles estadounidense con acento sureño y voz masculina, que posteriormente son convertidos en audio por el vocoder HiFi-GAN multi-VCTK small.

El modelo resuelve el problema de la sintesis de voz local y ligera: con un tamano de repositorio de 0,1 GB, esta pensado para entornos con recursos limitados, como asistentes de voz embebidos (OVOS/Mycroft), dispositivos de borde o aplicaciones de escritorio que necesitan TTS sin depender de servicios en la nube. La entrada de texto se procesa mediante el fonemizador gruut, que convierte el texto en fonemas IPA antes de alimentar el modelo.

Es relevante por su integracion con el ecosistema OVOS y por ofrecer una voz concreta (ingles sureño masculino) dentro de una coleccion de modelos Glow-TTS empaquetados para phoonnx. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma) + vocoder HiFi-GAN multi-VCTK small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense, acento sureño) |
| Licencia | other (no se registra licencia concreta; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en normalizing flows que mapea secuencias de fonemas a espectrogramas mel. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS utiliza un mecanismo de alineamiento monotono y decodificacion en paralelo, lo que permite una sintesis mas rapida y estable. El modelo genera un espectrograma que despues es convertido a forma de onda por el vocoder HiFi-GAN multi-VCTK small, un generador adversarial entrenado sobre el corpus multi-hablante VCTK.

El modelo original procede del proyecto Larynx de Rhasspy (version 1.0), que entreno voces para asistentes de voz offline. Phoonnx se limita a reempaquetar los pesos en ONNX y a integrarlos con su libreria de inferencia y con el fonemizador gruut de scriptconv. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de Glow-TTS.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense con acento sureño y voz masculina.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio mediante el vocoder HiFi-GAN.
- Normalizacion y fonemizacion del texto de entrada mediante gruut (fonemas IPA).
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en formato ONNX, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking (no aplicables a un modelo TTS).
- Capacidad multilingue limitada al ingles estadounidense; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz embebidos en OVOS/Mycroft: el modelo se selecciona mediante configuracion en `mycroft.conf` y proporciona una voz masculina sureña para respuestas habladas en local, sin latencia de red ni costes de API.
- Sintesis de voz offline en dispositivos de borde: con un repositorio de 0,1 GB y pesos ONNX, puede desplegarse en Raspberry Pi o mini-PC para aplicaciones de domotica que necesitan anuncios de voz.
- Generacion de audiolibros o contenido narrado en ingles con acento sureño: util para producir narraciones con una voz concreta y consistente en pipelines por lotes.
- Prototipado de interfaces conversacionales: permite probar rapidamente flujos de dialogo con una voz realista sin depender de servicios externos.
- Accesibilidad: lectura de texto en pantalla para usuarios que prefieren una voz masculina con acento sureño en entornos de escritorio.
- Pruebas de integracion en CI/CD de sistemas TTS: al ser un modelo ligero en ONNX, puede usarse en tests automatizados de pipelines de sintesis sin grandes requisitos de hardware.
- Investigacion en TTS: sirve como referencia para comparar arquitecturas Glow-TTS frente a modelos mas recientes en tareas de sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; al ser un modelo ONNX ligero, es probable que funcione en CPU, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; por el tamano, es plausible que quepa en cualquier GPU de consumo e incluso en CPU, pero no se especifica.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|
| glowtts-en_us-southern_male-gruut | Glow-TTS | en-US (sureño masculino) | HiFi-GAN multi-VCTK small | other | ONNX | 0,1 GB |
| Otras voces Glow-TTS de la coleccion Phoonnx | Glow-TTS | en-US u otros | HiFi-GAN multi-VCTK small | other | ONNX | similar |
| Piper (Rhasspy) | VITS | multi-idioma | integrado | MIT (segun proyecto) | ONNX | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales; para alternativas como Piper o Coqui TTS no se confirman cifras concretas en la informacion disponible.

## Limitaciones y advertencias

- La licencia figura como "other" y no se registra una licencia concreta; es necesario consultar la release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- El modelo solo soporta ingles estadounidense con acento sureño y voz masculina; no es multilingue ni permite cambiar de voz sin cargar otro modelo.
- Al ser un modelo TTS, no genera texto ni razona; no aplican capacidades de tool calling, agentes o vision.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o en textos con caracteres especiales, dependiendo de la fonemizacion de gruut.
- No se documentan sesgos conocidos, pero al estar entrenado con una voz y acento concretos, puede no representar adecuadamente otras variantes dialectales.
- No se dispone de informacion sobre la calidad objetiva (MOS) ni sobre el rendimiento en produccion; se recomienda evaluar la inteligibilidad y naturalidad antes de desplegarlo.
- El modelo depende del vocoder HiFi-GAN multi-VCTK small, que phoonnx descarga junto con la voz; cualquier fallo en esa dependencia afecta a la sintesis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-southern_male-gruut
- Release upstream de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_southern_english_male-glow_tts.tar.gz
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
