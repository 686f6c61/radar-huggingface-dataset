# Phoonnx/glowtts-en_us-harvard-gruut

## Resumen

`Phoonnx/glowtts-en_us-harvard-gruut` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy como parte del proyecto Larynx v1.0 y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo genera espectrogramas a partir de texto en ingles estadounidense que ha sido previamente fonemizado con gruut (alfabeto IPA), y delega la sintesis final de audio al vocoder HiFi-GAN `hifigan-multi-vctk-small`, tambien distribuido por Phoonnx.

El modelo resuelve el problema de la sintesis de voz local, sin dependencia de servicios en la nube, en entornos con recursos limitados. Su tamano de repositorio (0,1 GB) y su empaquetado en ONNX lo hacen adecuado para despliegues en dispositivos de borde, asistentes de voz embebidos y sistemas tipo OVOS/Mycroft. Es relevante para desarrolladores que necesitan un TTS determinista, offline y ligero para ingles, aunque su licencia no esta claramente registrada y debe verificarse en el upstream antes de cualquier uso comercial.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face; no se dispone de informacion sobre el numero de parametros, el contexto de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico generativo basado en normalizing flows) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | `en-US` (ingles estadounidense) |
| Licencia | `other` (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `Phoonnx/hifigan-multi-vctk-small` |
| Tamano del repositorio | 0,1 GB |
| Libreria | `phoonnx` |
| Pipeline | `text-to-speech` |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico generativo que combina normalizing flows con un mecanismo de alineamiento monotono (MAS, Monotonic Alignment Search) para mapear secuencias de fonemas a espectrogramas mel sin necesidad de un aligner externo. La arquitectura permite sintesis paralela, lo que se traduce en inferencia rapida comparada con modelos autoregresivos como Tacotron 2. En este caso concreto, el modelo fue entrenado originalmente por Rhasspy dentro del proyecto Larynx v1.0 y posteriormente exportado a ONNX por Phoonnx para su ejecucion en la libreria homonima.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning. La model card unicamente indica que el autor original es Rhasspy y que la entrada de texto debe estar fonemizada con gruut en alfabeto IPA. El vocoder HiFi-GAN `hifigan-multi-vctk-small` se descarga automaticamente junto con la voz al usar `phoonnx`.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (`en-US`).
- Generacion de espectrogramas mel que posteriormente son convertidos a audio por el vocoder HiFi-GAN.
- Fonemizacion previa mediante `GruutPhonemizer` de la libreria `scriptconv` (extra `scriptconv[gruut]`).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local y offline en formato ONNX, sin dependencia de APIs externas.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en sistemas tipo OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx` para generar respuestas habladas en ingles sin conexion a internet, aprovechando el reducido tamano del repositorio (0,1 GB) y el formato ONNX.
- Lectura de notificaciones y alertas en dispositivos de borde: al ejecutarse en ONNX y requerir pocos recursos, es adecuado para Raspberry Pi u otros SBC que deban anunciar eventos por voz en ingles.
- Generacion de audiolibros o contenido narrado en ingles: la sintesis paralela de Glow-TTS permite procesar lotes de frases con latencia baja, aunque la calidad dependera del vocoder HiFi-GAN asociado.
- Prototipado de interfaces conversacionales: util para desarrolladores que necesitan un TTS determinista y reproducible en pipelines de pruebas sin coste por peticion.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura de pantalla o asistencia a personas con discapacidad visual en entornos angloparlantes.
- Sistemas de anuncios publicos o kioscos interactivos: sintesis de mensajes pregrabados o dinamicos en ingles con despliegue local y sin dependencia de la nube.
- Investigacion en TTS: como punto de partida o baseline para comparar arquitecturas Glow-TTS frente a modelos mas recientes, dado que los pesos estan disponibles en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el uso de ONNX, la huella de memoria es reducida y cabe en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100) puede ejecutar el modelo, aunque para este tamano la CPU suele ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna e incluso en iGPU, dado el tamano del modelo.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Tamano repo |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-harvard-gruut` | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | 0,1 GB |
| Piper (rhasspy/piper-voices) | VITS | Multiples | ONNX | MIT (segun proyecto Piper) | Variable |
| Coqui TTS (XTTS v2) | GPT-based + decoder | Multiples | PyTorch | Coqui Public Model License | ~1,8 GB |
| Larynx (upstream original) | Glow-TTS / VITS | Multiples | TensorFlow / ONNX | Ver repositorio Rhasspy | Variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- Requiere fonemizacion previa con gruut en alfabeto IPA; el texto en bruto debe pasar por `scriptconv` con el extra `scriptconv[gruut]`.
- La licencia figura como `other` sin texto registrado; es imprescindible verificar la licencia del release original de Rhasspy/Larynx antes de cualquier uso comercial.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la calidad de la voz resultante.
- Riesgo de alucinacion o artefactos acusticos en textos fuera del dominio de entrenamiento (nombres propios, siglas, terminos tecnicos) no contemplados por el fonemizador.
- El modelo depende de un vocoder externo (`hifigan-multi-vctk-small`); la calidad final del audio esta condicionada por este componente.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- El numero de descargas (22) y likes (0) sugiere una adopcion muy limitada; no hay evidencia de validacion en produccion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-harvard-gruut
- Upstream original (Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_harvard-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS en Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Paper Glow-TTS: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
