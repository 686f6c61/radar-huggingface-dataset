# AMAImedia/NOESIS-Omni-RealTime

## Resumen

NOESIS-Omni-RealTime es un modelo multimodal any-to-any desarrollado por AMAImedia, publicado en Hugging Face bajo la arquitectura `qwen3_5` y orientado a interacciones en tiempo real que combinan texto, imagen, audio y voz. El modelo integra componentes especializados como Whisper (reconocimiento de voz), SigLIP (vision-lenguaje) y Nemotron, ademas de modulos de deteccion de actividad vocal (VAD) y sintesis de voz (text-to-speech), lo que lo posiciona como una solucion integral para pipelines conversacionales multimodales.

El modelo se distribuye con licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 19.9 GB, lo que sugiere pesos en precision completa o semi-precision para un modelo de escala media-grande. Su pipeline declarado es `any-to-any`, con soporte para mas de 100 idiomas segun los tags de Hugging Face.

La relevancia de NOESIS-Omni-RealTime radica en su enfoque "omni" y "real-time": no se limita a la generacion de texto multimodal, sino que incorpora deteccion de actividad vocal y sintesis de voz, lo que habilita aplicaciones de voz conversacional de baja latencia. No obstante, la informacion publica disponible es limitada (2 descargas, 0 likes en el momento de la consulta), por lo que muchos detalles tecnicos no estan confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal any-to-any) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | Mas de 100 idiomas (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gn, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kmr, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, mvy, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, qxp, ro, ru, rw, sd, sk, skr, sl, sn, so, sr, sv, sw, ta, te, tg, th, ti, tk, tr, ug, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 19.9 GB |
| Acceso | Restringido (gated) |
| Libreria | transformers |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

NOESIS-Omni-RealTime se construye sobre la arquitectura `qwen3_5`, un transformer multimodal de la familia Qwen 3.5. El modelo combina multiples subcomponentes especializados: un encoder de vision SigLIP para el procesamiento de imagenes, un encoder de audio basado en Whisper para reconocimiento de voz, y modulos adicionales asociados a Nemotron (probablemente para componentes de razonamiento o lenguaje). La inclusion de un modulo de deteccion de actividad vocal (VAD) y de sintesis de texto a voz (TTS) indica que el modelo esta disenado para pipelines de voz completos: entrada de audio, transcripcion, razonamiento multimodal y salida de voz.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning. La presencia de los tags `ocr`, `text-to-speech` y `voice-activity-detection` sugiere capacidades especificas entrenadas o integradas, pero no se detalla si estos modulos son parte del mismo grafo de pesos o componentes auxiliares empaquetados. Tampoco se han publicado innovaciones tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto multimodal: entrada de imagen y texto, salida de texto (pipeline image-text-to-text).
- Procesamiento de audio: reconocimiento automatico de voz (ASR) mediante integracion de Whisper.
- Sintesis de voz (text-to-speech): generacion de audio a partir de texto.
- Deteccion de actividad vocal (VAD): segmentacion de audio para pipelines conversacionales en tiempo real.
- OCR: extraccion de texto a partir de imagenes.
- Capacidades any-to-any: combinacion de modalidades de entrada y salida (texto, imagen, audio).
- Soporte multilingue amplio: mas de 100 idiomas declarados.
- Orientado a tiempo real: disenado para interacciones de baja latencia con voz.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo integra VAD, ASR (Whisper) y TTS en un unico pipeline, lo que permite construir asistentes que detectan cuando el usuario habla, transcriben, razonan y responden con voz sintetizada sin orquestar multiples modelos externos.
- Transcripcion y analisis de reuniones: gracias a la combinacion de ASR multilingue y capacidades de texto, se puede transcribir audio de reuniones en cualquiera de los mas de 100 idiomas soportados y generar resumenes o actas.
- Digitalizacion de documentos con OCR: el tag `ocr` y la entrada de imagen permiten extraer texto de facturas, formularios o capturas de pantalla y procesarlo posteriormente con el modulo de lenguaje.
- Atencion al cliente multimodal: un chatbot que recibe capturas de pantalla, audios de voz o texto y responde en la modalidad adecuada, aprovechando la naturaleza any-to-any del modelo.
- Accesibilidad: conversion de texto a voz y de voz a texto para personas con discapacidad visual o auditiva, con soporte multilingue amplio.
- Analisis de contenido audiovisual: combinacion de vision (SigLIP) y audio (Whisper) para describir o indexar videos, aunque la ventana de contexto no esta confirmada.
- Interfaces de voz para dispositivos embebidos: la integracion de VAD permite activacion por voz sin necesidad de un sistema externo de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 19.9 GB en safetensors, lo que sugiere que en precision completa o semi-precision se necesita al menos esa cantidad de VRAM mas overhead. En cuantizacion de 8 bits podria reducirse a ~10-12 GB, y en 4 bits a ~6-8 GB, pero estas cifras son estimaciones no confirmadas por el autor.
- GPU recomendadas: no disponibles oficialmente. Por el tamano del repositorio, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4) seria el minimo razonable en precision reducida; para precision completa se requeririan A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 con cuantizacion, pero no confirmado.
- Opciones de despliegue: al usar `transformers` y safetensors, es compatible con el ecosistema Hugging Face (transformers, TGI). No se confirma soporte para vLLM, llama.cpp u Ollama, especialmente por los componentes de audio y vision.
- Latencia y throughput: no disponibles. El nombre "RealTime" sugiere optimizacion para baja latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| NOESIS-Omni-RealTime | no disponible | no disponible | Texto, imagen, audio, voz | Apache 2.0 | Gated |
| Qwen2.5-Omni | no disponible en esta ficha | no disponible | Texto, imagen, audio, video | Apache 2.0 (segun version) | Abierto |
| MiniCPM-o | no disponible en esta ficha | no disponible | Texto, imagen, audio | Abierto (segun version) | Abierto |
| Gemini 1.5 Pro (API) | no disponible | hasta 2M tokens | Texto, imagen, audio, video | Propietaria | API |

La comparativa se limita a categorias generales porque no se dispone de datos tecnicos confirmados de NOESIS-Omni-RealTime (parametros, contexto) ni de benchmarks que permitan una comparacion cuantitativa rigurosa. Qwen2.5-Omni y MiniCPM-o son los referentes mas cercanos en el espacio any-to-any open source, pero sus especificaciones exactas no se incluyen aqui por falta de datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion para evaluacion y uso en produccion.
- Informacion tecnica incompleta: no se publican parametros, contexto, datos de entrenamiento ni benchmarks, lo que dificulta la evaluacion rigurosa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fiabilidad.
- Componentes de audio: la calidad de ASR y TTS dependera de los submodelos integrados (Whisper, etc.) y de la integracion; no hay metricas publicadas (WER, MOS).
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad; el entrenamiento multilingue amplio puede introducir disparidades entre idiomas de altos y bajos recursos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo gated conviene revisar los terminos adicionales de acceso en Hugging Face.
- Madurez: con 2 descargas y 0 likes, el modelo es muy reciente y carece de validacion por parte de la comunidad; no se recomienda para produccion critica sin evaluacion propia.
- Compatibilidad de despliegue: al incluir multiples modalidades (audio, vision), el soporte en frameworks de inferencia optimizados (vLLM, llama.cpp) no esta confirmado y podria requerir transformers puro.

## Enlaces

- Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Omni-RealTime
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
