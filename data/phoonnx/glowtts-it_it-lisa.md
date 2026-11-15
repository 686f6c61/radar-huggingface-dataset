# Phoonnx/glowtts-it_it-lisa

## Resumen

`Phoonnx/glowtts-it_it-lisa` es un modelo de síntesis de voz (text-to-speech) en italiano empaquetado en formato ONNX para la librería [phoonnx](https://github.com/TigreGotico/phoonnx). El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx v1.0, concretamente la voz `it-it_lisa`, y Phoonnx lo redistribuye como artefacto listo para su uso en Python y en el ecosistema OVOS (Open Voice OS). El pipeline declarado en Hugging Face es `text-to-speech` y el repositorio ocupa aproximadamente 0,1 GB.

La arquitectura Glow-TTS es un modelo de síntesis neuronal basado en flujo normalizador que genera espectrogramas mel a partir de fonemas, que después se convierten en audio mediante un vocoder separado, en este caso `hifigan-multi-vctk-small`, también distribuido por Phoonnx. La entrada de texto no es texto libre directo, sino fonemas en alfabeto IPA generados por el fonemizador gruut a través de la librería `scriptconv`, lo que condiciona tanto la integración como la calidad de la síntesis.

El interés de este modelo es práctico: ofrece una voz italiana funcional y ligera para asistentes de voz locales, domótica y aplicaciones de lectura en tiempo real, con despliegue en CPU mediante ONNX Runtime. No obstante, la licencia no está registrada en el repositorio y el autor remite a la release upstream de Rhasspy para verificarla, algo crítico antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flujo normalizador) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | italiano (`it-IT`) |
| Licencia | `other` (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | `hifigan-multi-vctk-small` (Phoonnx) |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores (normalizing flows) que aprende una transformación invertible entre la distribución de espectrogramas mel y una distribución latente simple, condicionada por una alineación monotónica aprendida entre fonemas y frames de audio. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS permite síntesis paralela, lo que se traduce en menor latencia de inferencia. El modelo empaquetado genera únicamente el espectrograma; la conversión a forma de onda la realiza el vocoder HiFi-GAN `hifigan-multi-vctk-small`, que phoonnx descarga junto con la voz.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino posteriores. El modelo procede de la release v1.0 de Larynx de Rhasspy, un proyecto orientado a TTS offline de alta calidad para asistentes de voz. La innovación relevante en este paquete es el empaquetado en ONNX y la integración con el front-end de texto de `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante gruut antes de pasarlo al modelo.

## Capacidades

- Síntesis de voz en italiano (`it-IT`) a partir de texto, con salida en formato WAV.
- Generación de espectrogramas mel mediante Glow-TTS y conversión a audio con HiFi-GAN.
- Fonemización de entrada mediante gruut (extra `scriptconv[gruut]`), con normalización de texto previa.
- Ejecución en CPU gracias al formato ONNX y a la librería phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: está limitado al italiano.
- No dispone de modo "thinking" ni capacidades de conversación; es un sintetizador puro.

## Casos de uso

- Asistentes de voz locales en italiano: el modelo se integra en OVOS seleccionando la voz `larynx/it-it-lisa-glow_tts` en `mycroft.conf`, lo que permite respuestas habladas sin depender de servicios en la nube y con ejecución en CPU.
- Domótica y control por voz: al ser un modelo ligero (~0,1 GB) y ejecutable en ONNX Runtime, puede desplegarse en dispositivos de bajos recursos como Raspberry Pi para anunciar estados de sensores o confirmaciones de acciones.
- Lectura de textos y accesibilidad: conversión de artículos, notificaciones o documentos a audio en italiano para personas con discapacidad visual, usando la API `synthesize_wav` de phoonnx.
- Generación de avisos pregrabados dinámicos: creación de locuciones para sistemas de megafonía, transporte o comercios que necesiten mensajes variables en italiano sin grabación humana.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado en ONNX y con un front-end definido (gruut + scriptconv), sirve como base para comparar vocoders o evaluar latencia en entornos de investigación.
- Integración en aplicaciones de aprendizaje de idiomas: síntesis de frases italianas para ejercicios de pronunciación, con la salvedad de que la calidad depende de la fonemización correcta del texto de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de ~0,1 GB en ONNX, es previsible que quepa en memoria de CPU sin GPU dedicada, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, cualquier GPU moderna podría alojarlo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-it_it-lisa` | Glow-TTS + HiFi-GAN | Italiano | ONNX | `other` (sin registrar) | Hugging Face, phoonnx |
| Otras voces Larynx de Rhasspy (p. ej. `it-it` en Larynx v1.0) | Glow-TTS | Italiano | Tar.gz original | Ver upstream Rhasspy | GitHub Rhasspy |
| Otras voces empaquetadas en la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | Varios idiomas | ONNX | `other` | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER de síntesis) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia figura como `other` y el autor indica explícitamente que no hay licencia registrada; es imprescindible verificar la release upstream de Rhasspy antes de cualquier uso comercial.
- El modelo solo sintetiza italiano; no admite otros idiomas ni cambio de voz.
- La entrada debe pasar por el fonemizador gruut; texto mal normalizado o con símbolos no soportados puede producir pronunciaciones incorrectas.
- No se han publicado métricas de calidad (MOS) ni evaluaciones de sesgos; se desconoce el comportamiento ante nombres propios, siglas o términos técnicos.
- Al ser un modelo TTS y no un modelo de lenguaje, no genera contenido semántico nuevo, pero puede reproducir de forma literal el texto de entrada, incluido contenido sensible.
- El repositorio tiene muy pocas descargas (36) y ningún "like", lo que sugiere escasa validación comunitaria.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, acento o procedencia de los hablantes.
- El rendimiento en producción (latencia, estabilidad) no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-it_it-lisa
- Release upstream de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/it-it_lisa-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
