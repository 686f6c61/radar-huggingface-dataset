# Phoonnx/glowtts-es_es-carlfm-gruut

## Resumen

Glow-TTS es un modelo de sintesis de voz (text-to-speech) en espanol de Espana (`es-ES`) desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte fonemas (no texto crudo) en un espectrograma mel, que posteriormente es transformado en audio por un vocoder HiFi-GAN (`hifigan-multi-vctk-small`). La voz concreta se denomina `es-es-carlfm` y corresponde a un hablante masculino del corpus CarlFM.

La relevancia de este modelo reside en su naturaleza ligera y desplegable localmente: el repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX, lo que permite ejecucion en CPU sin dependencias de frameworks de deep learning pesados. Esta pensado para asistentes de voz embebidos, sistemas de domotica y entornos OVOS/Mycroft, donde la privacidad y la baja latencia importan mas que la naturalidad expresiva de modelos neuronales de gran escala.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un sistema TTS acustico clasico (no autorregresivo) con un front-end fonemico basado en gruut e IPA. Su licencia no esta registrada en el repositorio, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (flow-based generativo no autorregresivo) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | espanol de Espana (`es-ES`) |
| Licencia | `other` (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | `hifigan-multi-vctk-small` |
| Voces disponibles | `larynx/es-es-carlfm-glow_tts` |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores (normalizing flows) que aprende una correspondencia monotona entre fonemas y frames de espectrograma mel mediante alineamiento dinamico sin atencion explicita. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS genera el espectrograma completo en paralelo, lo que reduce la latencia de sintesis. La arquitectura combina un encoder de texto, un bloque de flujos invertibles y un decoder que produce el mel-espectrograma; posteriormente, un vocoder HiFi-GAN independiente convierte ese espectrograma en forma de onda.

El modelo original fue entrenado por Rhasspy como parte del proyecto Larynx v1.0 sobre el corpus de voz CarlFM en espanol. No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning perceptual. El empaquetado de Phoonnx se limita a exportar el modelo a ONNX y a integrar el front-end de fonemizacion (gruut) y el vocoder en su pipeline.

## Capacidades

- Sintesis de voz a partir de texto en espanol de Espana, previa conversion a fonemas IPA mediante gruut.
- Generacion de audio en formato WAV a traves de la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en CPU con ONNX Runtime, sin necesidad de GPU.
- Voz unica preentrenada (`es-es-carlfm`), sin soporte de clonacion ni control de estilo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente a `es-ES`.

## Casos de uso

- Asistentes de voz para domotica: el modelo sintetiza respuestas cortas en espanol dentro de OVOS/Mycroft con latencia baja en CPU, lo que permite desplegarlo en Raspberry Pi o mini-PC sin GPU.
- Lectura de notificaciones y alertas: integrado en un sistema de monitorizacion, convierte mensajes de texto en audio para avisos por altavoz en entornos industriales o domesticos.
- Accesibilidad para personas con discapacidad visual: narracion de contenido textual (correos, articulos, interfaces) en espanol de Espana con una voz masculina estable.
- Sistemas de megafonia automatizada: generacion de anuncios pregrabados o dinamicos en comercios, transporte o edificios publicos donde no se requiere expresividad alta.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en espanol sin depender de APIs en la nube, manteniendo los datos en local.
- Educacion y aprendizaje de idiomas: reproduccion de frases en espanol con pronunciacion fonemica controlada, util para ejercicios de dictado o lectura guiada.
- Kioscos interactivos y terminales de informacion: sintesis de respuestas en tiempo real en entornos con conectividad limitada o requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; el modelo completo ocupa ~0,1 GB en disco, por lo que la huella en memoria es del orden de cientos de MB incluyendo ONNX Runtime y el vocoder.
- GPU recomendadas: no son necesarias; el modelo esta disenado para inferencia en CPU mediante ONNX Runtime. Cualquier GPU compatible con ONNX Runtime (CUDA o ROCm) podria acelerar la inferencia, pero no se documentan requisitos especificos.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo, aunque su uso tipico es en CPU.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Glow-TTS es-es-carlfm (este modelo) | TTS flow-based + HiFi-GAN | es-ES | no disponible | no aplica | `other` (sin registrar) | ONNX |
| Piper (Rhasspy) | TTS VITS | Multiples, incl. es-ES | no disponible | no aplica | MIT (tipicamente) | ONNX |
| Coqui TTS (XTTS v2) | TTS zero-shot | Multilingue | no disponible | no aplica | Coqui Public Model License | PyTorch |
| Larynx (otras voces) | TTS Glow-TTS/VITS | Multiples | no disponible | no aplica | Varía por voz | ONNX |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia figura como `other` sin texto registrado; el autor recomienda consultar la release upstream de Rhasspy antes de cualquier uso, especialmente comercial. No hay garantia de permisos de uso comercial.
- Voz unica y fija (`es-es-carlfm`); no permite clonacion, cambio de hablante ni control de emocion o prosodia.
- Solo soporta espanol de Espana (`es-ES`); no cubre variantes latinoamericanas ni otros idiomas.
- Requiere un front-end de fonemizacion (gruut) correctamente instalado; errores en la conversion a IPA degradan la calidad de sintesis.
- Riesgo de pronunciacion incorrecta en palabras fuera de vocabulario, siglas, numeros o nombres propios no normalizados por scriptconv.
- Modelo de voz entrenado sobre un corpus concreto; puede presentar sesgos de prosodia o timbre asociados al hablante original.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene contexto conversacional; solo sintetiza el texto recibido.
- El repositorio tiene muy pocas descargas (20) y ningun "like", lo que sugiere validacion comunitaria limitada.
- No se documentan pruebas de robustez, MOS ni evaluaciones subjetivas en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-es_es-carlfm-gruut
- Repositorio upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/es-es_carlfm-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS en Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
