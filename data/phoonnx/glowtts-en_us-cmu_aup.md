# Phoonnx/glowtts-en_us-cmu_aup

## Resumen

`glowtts-en_us-cmu_aup` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería de inferencia `phoonnx`. El modelo genera espectrogramas mel a partir de fonemas IPA de entrada, que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`.

El modelo está especializado en inglés estadounidense (`en-US`) y utiliza el fonemizador gruut para la conversión de texto a fonemas. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo hace muy ligero y adecuado para despliegues en entornos con recursos limitados, como asistentes de voz embebidos o sistemas domésticos.

Su relevancia actual radica en que forma parte del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`, y en que ofrece una alternativa ligera y ejecutable localmente para síntesis de voz en inglés. No obstante, la licencia no está registrada explícitamente y el autor advierte de que debe verificarse en la fuente original (Rhasspy/Larynx) antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based, no autorregresiva) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | `other` (no registrada explícitamente; verificar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz no autorregresivo basado en normalizing flows y alineamiento monotónico (MAS, Monotonic Alignment Search). A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS genera el espectrograma completo en paralelo, lo que reduce la latencia de inferencia. La arquitectura incluye un encoder de texto, un decoder basado en flows y un mecanismo de alineamiento que aprende la correspondencia entre fonemas y frames de audio sin supervisión explícita de alineamientos.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx v1.0, aunque no se dispone en la información proporcionada de detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El vocoder asociado es `hifigan-multi-vctk-small`, un HiFi-GAN multi-hablante entrenado sobre VCTK, que transforma el espectrograma mel en forma de onda de audio. La innovación principal es la generación paralela de espectrogramas y la integración con el fonemizador gruut para la normalización de texto.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Conversión de texto a fonemas IPA mediante el fonemizador gruut.
- Generación de espectrogramas mel y conversión a audio mediante vocoder HiFi-GAN.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en Python a través de la librería `phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada exclusivamente al inglés estadounidense.

## Casos de uso

- Asistentes de voz domésticos: el modelo puede integrarse en OVOS para sintetizar respuestas habladas en inglés con latencia baja, gracias a su arquitectura no autorregresiva y su reducido tamaño (0,1 GB).
- Sistemas embebidos y dispositivos de bajo consumo: al ejecutarse en ONNX y ocupar poco espacio, es adecuado para Raspberry Pi u otros dispositivos con recursos limitados que necesiten TTS local sin conexión a la nube.
- Lectura de notificaciones y alertas: puede sintetizar mensajes cortos en inglés para sistemas de monitorización, domótica o alertas de servidor.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos de habla inglesa.
- Prototipado rápido de pipelines TTS: la instalación mediante `pip install --pre phoonnx "scriptconv[gruut]"` permite integrar el modelo en experimentos de investigación o demos en pocos minutos.
- Generación de audio para pruebas automatizadas: útil en pipelines de CI/CD que necesiten verificar la salida de audio de sistemas de voz sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB), es esperable que quepa en GPUs con muy poca memoria, aunque no se confirma.
- GPU recomendadas: no disponible; el modelo se distribuye en ONNX y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: probablemente sí en cualquier GPU moderna e incluso en CPU, pero no se dispone de datos confirmados.
- Opciones de despliegue: `phoonnx` (Python), integración con OVOS mediante `ovos-tts-plugin-phoonnx`, y ejecución vía ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-cmu_aup` | Glow-TTS + HiFi-GAN | en-US | ONNX | other (no registrada) | 0,1 GB |
| Piper (rhasspy/piper) | VITS | Multiidioma | ONNX | MIT (habitual) | Variable |
| Coqui TTS (XTTS) | VITS/Transformer | Multiidioma | PyTorch | MPL 2.0 / Coqui CPML | Variable |
| Larynx (upstream) | Glow-TTS / VITS | Multiidioma | PyTorch/TFLite | Ver repositorio | Variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Licencia no registrada explícitamente (`other`): el autor indica que debe verificarse en la fuente upstream (Rhasspy/Larynx) antes de cualquier uso, especialmente comercial.
- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- Al ser un modelo TTS, puede presentar artefactos de pronunciación en palabras poco frecuentes, nombres propios o siglas no contempladas en el fonemizador gruut.
- No se dispone de información sobre sesgos de voz (género, acento, edad) ni sobre la diversidad de hablantes del dataset de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede generar pronunciaciones incorrectas o audio distorsionado en entradas fuera de distribución.
- Dependencia del vocoder externo `hifigan-multi-vctk-small`; la calidad final del audio depende de este componente.
- No apto para tareas de razonamiento, generación de texto, código o matemáticas.
- El repositorio tiene muy pocas descargas (31) y ningún like, lo que sugiere poca validación comunitaria; conviene probarlo en el caso de uso concreto antes de producción.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en_us-cmu_aup](https://huggingface.co/Phoonnx/glowtts-en_us-cmu_aup)
- [Upstream original (Rhasspy Larynx v1.0)](https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_aup-glow_tts.tar.gz)
- [Vocoder: Phoonnx/hifigan-multi-vctk-small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
- [Colección Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
