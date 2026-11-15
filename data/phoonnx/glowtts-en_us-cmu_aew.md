# Phoonnx/glowtts-en_us-cmu_aew

## Resumen

glowtts-en_us-cmu_aew es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la libreria de inferencia `phoonnx`. El modelo convierte texto en ingles estadounidense en un espectrograma acustico que posteriormente se transforma en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`. Su proposito es ofrecer sintesis de voz local, ligera y sin dependencias de servicios en la nube, orientada a asistentes de voz y sistemas embebidos.

El modelo forma parte de la coleccion de voces Glow-TTS empaquetadas por Phoonnx para su ecosistema, que incluye integracion directa con OVOS (Open Voice OS) a traves del plugin `ovos-tts-plugin-phoonnx`. La voz concreta `en-us-cmu_aew` corresponde a una de las voces del conjunto Larynx v1.0. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto pensado para ejecucion en CPU o GPU de gama baja.

La relevancia actual de este modelo reside en su caracter local y su empaquetado ONNX, que facilita el despliegue en dispositivos sin aceleracion hardware dedicada y sin conexion a internet. No obstante, se trata de una voz heredada del ecosistema Larynx (arquitectura Glow-TTS de 2020) y su licencia no esta registrada explicitamente, lo que introduce incertidumbre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo basado en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (sintesis por frase, sin contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | `other` (no se registra licencia concreta; consultar el release upstream de Larynx) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico de sintesis de voz que combina normalizing flows con alineamiento monotono mediante programacion dinamica (monotonic alignment search). A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS genera espectrogramas en paralelo, lo que reduce la latencia de inferencia. El modelo produce un espectrograma mel que se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`, descargado automaticamente por `phoonnx` junto con la voz.

La entrada de texto no es texto crudo: el modelo consume fonemas en alfabeto IPA generados por el fonemizador `GruutPhonemizer` de la libreria `scriptconv` (extra `scriptconv[gruut]`). El autor no proporciona en la model card informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning preferencial. Los datos disponibles indican que la voz proviene del release v1.0 de Larynx (`en-us_cmu_aew-glow_tts.tar.gz`), pero no se detalla el corpus de habla utilizado mas alla de la referencia al identificador `cmu_aew`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles estadounidense, con salida en fichero WAV mediante `voice.synthesize_wav()`.
- Conversion texto a fonemas IPA mediante el front-end `scriptconv` con el fonemizador Gruut.
- Generacion de espectrogramas mel en paralelo (no autorregresiva), lo que permite inferencia de baja latencia.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion local sobre ONNX Runtime, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`) y permite que un asistente domestico genere respuestas habladas sin enviar texto a servicios externos, preservando la privacidad.
- Lectura de notificaciones y alertas en dispositivos embebidos: gracias a su tamano reducido (repo de 0,1 GB) y a la inferencia ONNX, puede ejecutarse en Raspberry Pi u otros SBC para leer avisos del sistema, correos o recordatorios.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en aplicaciones de lectura de pantalla que requieran una voz en ingles y funcionamiento offline.
- Generacion de audio para prototipos y pruebas de UX: creacion rapida de locuciones de prueba en ingles para maquetas de aplicaciones, videojuegos o interfaces conversacionales antes de contratar voces comerciales.
- Automatizacion de avisos en entornos sin conectividad: sistemas de megafonia o domotica en redes aisladas que necesiten anuncios hablados generados dinamicamente a partir de texto.
- Pipelines de postproduccion de audio a pequena escala: generacion de narraciones en ingles para contenidos internos, dado que el modelo produce WAV directamente y no requiere GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) y la arquitectura Glow-TTS, es esperable que quepa en GPUs consumer de gama baja, aunque no se confirma con datos del autor.
- GPU recomendadas: no disponible. El modelo esta empaquetado en ONNX, lo que sugiere ejecucion en CPU como escenario principal.
- Compatibilidad con GPU consumer: no confirmada explicitamente; el formato ONNX y el tamano reducido son compatibles con RTX 4090 y GPUs inferiores, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python) con ONNX Runtime; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-cmu_aew (este modelo) | Glow-TTS + HiFi-GAN | en-US | ONNX | `other` (sin especificar) | Hugging Face, via phoonnx |
| Otras voces Larynx Glow-TTS (coleccion Phoonnx) | Glow-TTS + HiFi-GAN | en-US y otros | ONNX | `other` | Hugging Face, via phoonnx |
| Piper (rhasspy/piper-voices) | VITS | Multiples idiomas | ONNX | MIT (segun proyecto Piper) | Hugging Face, via piper |
| Coqui TTS (voces VITS) | VITS / Tacotron2 | Multiples idiomas | Checkpoint / ONNX | MPL 2.0 (segun proyecto Coqui) | Hugging Face, via coqui-tts |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Licencia ambigua: la model card indica `license: other` y afirma explicitamente que "no se registra licencia para este modelo"; es imprescindible verificar el release upstream de Larynx antes de cualquier uso comercial.
- Idioma unico: solo admite ingles estadounidense; no es adecuado para sintesis en castellano ni en otros idiomas.
- Entrada fonemica: el modelo no acepta texto crudo directamente; requiere el front-end `scriptconv` con Gruut, lo que anade una dependencia y puede introducir errores de fonemizacion en palabras ambiguas o nombres propios.
- Calidad de voz no documentada: no se publican metricas MOS ni evaluaciones subjetivas en la informacion disponible.
- Modelo heredado: Glow-TTS es una arquitectura de 2020 y las voces Larynx han sido en gran medida superadas por alternativas mas recientes como Piper (VITS), con mejor calidad y licencias mas claras.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio; no se documentan sesgos especificos.
- Sin soporte conversacional: no mantiene contexto entre frases; cada sintesis es independiente.
- Dependencia del vocoder externo: el audio final depende de `hifigan-multi-vctk-small`, descargado aparte, lo que introduce un componente adicional a validar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_aew
- Release upstream de Larynx (v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_aew-glow_tts.tar.gz
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
