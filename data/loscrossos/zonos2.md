# loscrossos/ZONOS2

## Resumen

ZONOS2 es un modelo de texto a voz (TTS) desarrollado por Zyphra, publicado en Hugging Face bajo el identificador `loscrossos/ZONOS2`. Se presenta como la version mas reciente de la familia Zonos y esta entrenado sobre mas de 6 millones de horas de habla multilingue variada. El modelo esta disenado para ofrecer expresividad y calidad comparables (o superiores, segun el autor) a los principales proveedores comerciales de TTS, con baja latencia y una arquitectura de mezcla de expertos (MoE).

La innovacion principal reside en su pipeline de inferencia: normalizacion de texto con NeMo TN, codificacion en bytes UTF-8, extraccion de un embedding de hablante mediante ECAPA-TDNN y generacion de tokens de audio DAC a traves de un backbone MoE. Esto permite clonacion de voz de alta fidelidad y naturalidad, ademas de soporte para 27 idiomas organizados en tres niveles de calidad.

El modelo es relevante por su combinacion de licencia permisiva (Apache 2.0), soporte multilingue amplio y un servidor de inferencia local de alto rendimiento basado en Mini-SGLang. El repositorio ocupa 15,4 GB y esta orientado a despliegue en Linux x86_64 con GPU NVIDIA, lo que lo posiciona como una alternativa abierta para sintesis de voz en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone MoE (mezcla de expertos) con decodificacion de tokens DAC; frontend con NeMo TN, bytes UTF-8 y embedding ECAPA-TDNN |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 27 idiomas en 3 niveles (ver tabla mas abajo) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 15,4 GB; la libreria declarada es `ZONOS2`) |

Idiomas por nivel:

| Nivel | Idiomas |
|---|---|
| Tier 1 | Ingles, chino mandarin, japones |
| Tier 2 | Coreano, ruso, italiano, portugues, frances, espanol, vietnamita, aleman, hebreo, neerlandes |
| Tier 3 | Sueco, hindi, tamil, telugu, tailandes, noruego, bengali, tagalo, arabe, danes, indonesio, polaco, ucraniano, rumano, finlandes, hungaro, lituano, estonio, eslovaco, croata, leton |

## Arquitectura y entrenamiento

ZONOS2 emplea un backbone de mezcla de expertos (MoE) que genera tokens de audio en el espacio de codificacion DAC. La entrada de texto se procesa mediante normalizacion de texto NeMo (TN) y se representa como bytes UTF-8 normalizados; la identidad de voz se captura con un embedding de hablante ECAPA-TDNN, lo que habilita la clonacion de voz a partir de audio de referencia. El modelo esta entrenado sobre mas de 6 millones de horas de habla multilingue variada, segun la model card.

No se especifican en la informacion disponible el numero total de parametros, los parametros activos del MoE, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la innovacion de decodificacion mas alla del uso del backbone MoE y del servidor de inferencia Mini-SGLang, que proporciona inferencia de alto rendimiento en local.

## Capacidades

- Sintesis de voz (text-to-speech) de alta fidelidad y naturalidad.
- Clonacion de voz zero-shot a partir de audio de referencia mediante embedding ECAPA-TDNN.
- Soporte multilingue en 27 idiomas con tres niveles de calidad declarados.
- Generacion por streaming (parametro `stream: true` en la API HTTP).
- Inferencia por lotes (batched prompts) mediante la API Python `TTSLLM`.
- Salida de audio en formato PCM float32 a 44,1 kHz mono, convertible a WAV.
- Servidor HTTP con interfaz web integrada y API REST (`/tts/generate`).
- Precarga de voces por defecto desde disco (`.wav`, `.mp3`, `.flac`, `.m4a`, `.ogg`, `.opus`, `.aac`, `.webm`) y embeddings guardados (`.npy`, `.npz`).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la clonacion.

## Casos de uso

- Clonacion de voz para audiolibros y narracion: el modelo puede generar locuciones con una voz de referencia concreta gracias al embedding ECAPA-TDNN, manteniendo consistencia en textos largos mediante el modo streaming.
- Atencion al cliente con voz sintetica: el servidor HTTP permite integrar ZONOS2 en pipelines de respuesta de voz interactiva (IVR) con baja latencia y salida PCM directa.
- Doblaje y localizacion de contenido: el soporte de 27 idiomas en tres niveles permite generar versiones de voz en espanol, frances, aleman, etc., a partir del mismo texto.
- Accesibilidad: conversion de texto a voz para lectores de pantalla y asistentes para personas con discapacidad visual, con voces personalizables mediante clonacion.
- Generacion de contenido para videojuegos y multimedia: la API Python por lotes (`TTSLLM.generate`) permite sintetizar multiples lineas de dialogo en una sola llamada.
- Prototipado de asistentes conversacionales: la interfaz web y el endpoint REST facilitan pruebas rapidas de voces antes de integrar en produccion.
- Investigacion en TTS y evaluacion de clonacion de voz: la licencia Apache 2.0 y el servidor local basado en Mini-SGLang permiten experimentar sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: Linux x86_64 exclusivamente; requiere GPU NVIDIA con toolkit CUDA compatible con la version del driver (`nvidia-smi`).
- VRAM estimada: no disponible. El repositorio ocupa 15,4 GB, lo que sugiere requisitos de memoria considerables, pero no se especifica la VRAM necesaria ni por cuantizacion.
- GPU recomendadas: no disponible (no se indican modelos concretos como A100, H100 o RTX 4090).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de inferencia basado en Mini-SGLang (`uv run python -m minisgl --model-path Zyphra/ZONOS2`), API Python offline `TTSLLM`, y version alojada en `cloud.zyphra.com/audio-playground`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara baja latencia, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La model card afirma que ZONOS2 ofrece calidad comparable o superior a los principales proveedores de TTS, pero no se incluyen comparaciones numericas ni alternativas abiertas concretas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZONOS2 | no disponible | no disponible | Apache 2.0 | Hugging Face, servidor local, cloud |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta Linux x86_64 con GPU NVIDIA; no hay soporte declarado para macOS, Windows ni CPU.
- No se documentan sesgos conocidos, pero al entrenarse con 6 millones de horas de habla multilingue es probable que herede sesgos de los datos; no se detalla su mitigacion.
- Riesgo de alucinacion o artefactos en la sintesis no cuantificado en la informacion disponible.
- La calidad varia por nivel de idioma: el espanol esta en Tier 2, no en el nivel maximo (Tier 1).
- La clonacion de voz plantea riesgos de uso indebido (suplantacion, deepfakes); la licencia Apache 2.0 no impone restricciones de uso etico, por lo que la responsabilidad recae en el implementador.
- No se especifican requisitos de VRAM ni cuantizaciones, lo que dificulta planificar el despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.
- La fecha de creacion indicada (2026-11-27) es posterior a la fecha de la citation (2026), dato a verificar.

## Enlaces

- Hugging Face: https://huggingface.co/loscrossos/ZONOS2
- Blog oficial: https://www.zyphra.com/our-work/zonos2
- Repositorio GitHub: https://github.com/Zyphra/ZONOS2
- Mini-SGLang: https://github.com/sgl-project/mini-sglang
- Demo alojada: https://cloud.zyphra.com/audio-playground
- Discord: https://discord.gg/gTW9JwST8q
