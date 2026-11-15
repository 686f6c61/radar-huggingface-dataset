# Phoonnx/glowtts-en_us-cmu_ljm

## Resumen

Glow-TTS en_us-cmu_ljm es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense, originalmente entrenado por Rhasspy dentro del proyecto Larynx y reempaquetado en formato ONNX por Phoonnx para su uso con la libreria de inferencia `phoonnx`. El modelo combina un sintetizador acustico Glow-TTS, que transforma fonemas IPA en espectrogramas mel, con un vocoder neuronal HiFi-GAN (variante multi-VCTK small) que convierte esos espectrogramas en audio de dominio temporal.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS de dos etapas pensado para sintesis local, ligera y determinista en CPU o GPU de gama baja. Su relevancia actual radica en su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite desplegar voces en asistentes de voz autoalojados sin dependencias de servicios en la nube.

El repositorio ocupa aproximadamente 0,1 GB e incluye los pesos en ONNX del modelo acustico; el vocoder se descarga por separado desde el repositorio `Phoonnx/hifigan-multi-vctk-small`. La licencia aparece como "other" y la model card advierte explicitamente de que no hay licencia registrada, por lo que la reutilizacion comercial requiere verificar el release original de Larynx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico normalizing flow) + HiFi-GAN multi-VCTK small (vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase en fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder asociado | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python, integrable en OVOS) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica basado en normalizing flows que mapea secuencias de fonemas a espectrogramas mel mediante un mecanismo de alineamiento monotono aprendido (MAS, monotonic alignment search), sin necesidad de un modelo de atencion autorregresivo ni de alineamientos externos. Esto lo hace mas rapido y estable en inferencia que arquitecturas tipo Tacotron, a costa de requerir un vocoder separado para generar la forma de onda. En este caso el vocoder es HiFi-GAN en su variante multi-VCTK small, un generador convolucional que sintetiza audio a partir del espectrograma mel.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning por preferencias; estos datos no aparecen en la model card ni en los metadatos del repositorio. El modelo procede del release v1.0 de Larynx (`en-us_cmu_ljm-glow_tts.tar.gz`), un proyecto de Rhasspy orientado a TTS offline para asistentes de voz. La innovacion practica del paquete es el reempaquetado a ONNX y la integracion con la cadena de preprocesado `scriptconv`, que normaliza el texto y lo convierte a fonemas gruut antes de la inferencia.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en WAV.
- Conversion texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`).
- Generacion de espectrogramas mel con Glow-TTS y conversion a audio con HiFi-GAN.
- Inferencia local en Python mediante `phoonnx` y despliegue como plugin de OVOS (`ovos-tts-plugin-phoonnx`).
- Voces seleccionables por identificador (`larynx/en-us-cmu_ljm-glow_tts`) dentro del gestor de voces de phoonnx.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es un modelo multilingue: solo en-US.
- No dispone de modo thinking ni capacidades generativas mas alla de la sintesis acustica.

## Casos de uso

- Asistentes de voz autoalojados: integracion en OVOS mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas locales sin enviar texto a servicios externos.
- Sintesis offline en dispositivos de bajos recursos: al ser un modelo compacto en ONNX (~0,1 GB) con vocoder small, puede ejecutarse en Raspberry Pi o mini-PC sin GPU dedicada para respuestas de voz en tiempo casi real.
- Generacion de avisos y notificaciones por voz: sintesis de frases cortas en ingles para sistemas de domotica, alarmas o lectores de pantalla embebidos.
- Prototipado de interfaces conversacionales: generacion rapida de audio de prueba para validar flujos de dialogo antes de contratar voces comerciales o entrenar modelos propios.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura en ingles estadounidense, con la ventaja de funcionar sin conexion.
- Pipelines de datos de audio: generacion de corpus sinteticos de voz en ingles para aumento de datos o pruebas de sistemas de reconocimiento de voz (ASR), siempre que la licencia lo permita.
- Investigacion en TTS: uso como linea base Glow-TTS reproducible en ONNX para comparar con modelos mas recientes o para estudiar el efecto del vocoder en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion; por el tamano del repo (~0,1 GB) y la naturaleza de Glow-TTS + HiFi-GAN small, la huella de memoria es reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 3060, RTX 4090, A100, H100); no se requiere hardware de gama alta.
- Cabe en GPU consumer: si, y tambien es viable en CPU para sintesis por frases.
- Opciones de despliegue: `phoonnx` (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` en OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_ljm | Glow-TTS + HiFi-GAN small | en-US | ONNX | other (sin registrar) | Empaquetado para phoonnx/OVOS |
| Otras voces Larynx de Rhasspy | Glow-TTS + vocoder | multi-idioma (voces separadas) | tarball original / ONNX | segun release Larynx | Misma familia upstream |
| Piper (rhasspy/piper) | VITS | multi-idioma | ONNX | MIT (segun proyecto) | Sucesor practico de Larynx para TTS offline |
| Coqui TTS (modelos VITS/Tacotron) | VITS / Tacotron2 | multi-idioma | PyTorch / ONNX | MPL-2.0 (segun modelo) | Ecosistema mas amplio, mayor peso |

La comparativa se limita a alternativas de la misma categoria (TTS offline ligero); no se dispone de datos de rendimiento cuantitativos para comparar calidad objetiva (MOS, RTF) entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no hay capacidades multilingues.
- Licencia "other" sin licencia registrada: la model card indica explicitamente que se verifique el release upstream antes de usarlo, lo que supone un riesgo para uso comercial.
- Al ser un modelo TTS, puede heredar sesgos de pronunciacion, prosodia y estilo del corpus de entrenamiento original (Larynx/CMU), no documentados en la ficha.
- Riesgo de artefactos acusticos y errores de pronunciacion en palabras fuera del vocabulario o en siglas no normalizadas; depende de la calidad del fonemizador gruut.
- No apto para tareas de generacion de texto, razonamiento, codigo o agentes.
- Requiere el vocoder externo `hifigan-multi-vctk-small`, descargado por phoonnx; sin el, no se genera audio.
- El pipeline de inferencia depende de `phoonnx` (version pre-release) y de `scriptconv[gruut]`, lo que puede implicar inestabilidad de API en produccion.
- No se documentan limites de longitud de entrada; la sintesis esta pensada por frases, no por documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ljm
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ljm-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
