# Phoonnx/vits-hu_hu-css10-graphemes

## Resumen

vits-hu_hu-css10-graphemes es un modelo de sintesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx a partir del modelo original VITS entrenado por Coqui para el hungaro (hu-HU). El modelo procede del release v0.8.0 de Coqui TTS, concretamente del paquete `tts_models--hu--css10--vits.zip`, y ha sido reconvertido y distribuido para su uso con la libreria phoonnx, una implementacion Python de inferencia TTS basada en ONNX. Resuelve el problema de generar voz sintetica en hungaro de forma ligera y desplegable localmente, sin depender del stack original de PyTorch de Coqui.

La relevancia de esta ficha es acotada: se trata de un artefacto de redistribucion, no de un modelo nuevo. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a un checkpoint VITS de tamano pequeno (tipicamente decenas de millones de parametros), adecuado para ejecucion en CPU y en dispositivos con recursos limitados. El modelo usa una entrada basada en grafemas (caracteres del texto) mediante el `GraphemePhonemizer` de scriptconv, sin fonemizacion linguistica especifica para hungaro.

El idioma soportado es unicamente hungaro (hu-HU), la licencia declarada es BSD-3-Clause y el pipeline es text-to-speech. No se han publicado datos de arquitectura detallados, numero de parametros, contexto ni benchmarks en la informacion disponible, por lo que varias filas de la tabla tecnica quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), empaquetado ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases; entrada de texto por caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hungaro (hu-HU) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (repo de 0,1 GB) |
| Autor original | Coqui |
| Empaquetador | Phoonnx |
| Libreria de inferencia | phoonnx (Python / OVOS) |
| Front end de texto | grafemas (`GraphemePhonemizer` de scriptconv) |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-11-14 |
| Ultima actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un encoder de texto, un predictor de duracion, un normalizing flow condicional, un decoder generativo y un discriminador adversarial multi-periodo, entrenados conjuntamente con perdidas de reconstruccion, adversariales y KL. El modelo original fue entrenado por Coqui sobre el corpus CSS10 para hungaro, un dataset publico de audio de un unico hablante con transcripciones alineadas, orientado a TTS de un solo locutor.

En esta redistribucion, el checkpoint PyTorch original se ha exportado a ONNX para su ejecucion con phoonnx. El front end de texto es puramente basado en grafemas: scriptconv normaliza el texto y lo convierte en la secuencia de caracteres que espera el modelo, sin aplicar reglas de fonemizacion especificas del hungaro. No hay informacion disponible sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF/DPO (tecnicas no habituales en TTS clasico). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention linear.

## Capacidades

- Sintesis de voz en hungaro (hu-HU) a partir de texto, con salida en WAV mediante `voice.synthesize_wav`.
- Modelo de un unico hablante (voz fija `coqui/hu-css10-vits`).
- Entrada basada en grafemas: acepta caracteres del texto hungaro tras normalizacion por scriptconv.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecucion en Python via phoonnx, con pesos ONNX y sin dependencia del stack PyTorch de Coqui.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision.
- No es multilingue: solo hungaro.
- No dispone de modo "thinking", audio de entrada ni otras capacidades especiales.

## Casos de uso

- Asistentes de voz locales en hungaro: el modelo puede integrarse en OVOS como motor TTS (`ovos-tts-plugin-phoonnx`) para leer respuestas del asistente en tiempo real, con un checkpoint de 0,1 GB apto para dispositivos modestos.
- Lectura de notificaciones y alertas en sistemas domoticos: sintesis de frases cortas en hungaro para anuncios de estado, alarmas o recordatorios en entornos de hogar conectado.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en hungaro en aplicaciones de escritorio o moviles, ejecutando el modelo ONNX en CPU.
- Generacion de audiolibros o locuciones de bajo coste: sintesis por lotes de textos largos divididos en frases, aprovechando que VITS es end-to-end y no requiere pipeline separado de alineamiento.
- Prototipado de interfaces conversacionales en hungaro: pruebas rapidas de UX de voz en productos antes de invertir en modelos comerciales o voces clonadas.
- Investigacion en TTS de bajo recurso: uso como baseline hungaro de referencia (CSS10) para comparar con modelos modernos de sintesis, dado su licencia permisiva BSD-3-Clause.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: verificacion de que la sintesis produce WAV validos y de duracion razonable tras cambios en el front end de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repo (0,1 GB) cabe holgadamente en GPUs consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; no se documentan requisitos especificos (A100, H100, RTX 4090 no son necesarias).
- Cabe en GPU consumer: si, en modelos como GTX 1050, RTX 2060, RTX 3060 o superiores, y previsiblemente en CPU.
- Opciones de despliegue: phoonnx (Python) y el plugin OVOS `ovos-tts-plugin-phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-hu_hu-css10-graphemes (este) | hu-HU | VITS (ONNX) | no disponible | no disponible | BSD-3-Clause | ONNX |
| Coqui TTS `tts_models--hu--css10--vits` (upstream) | hu-HU | VITS (PyTorch) | no disponible | no disponible | BSD-3-Clause | PyTorch |
| Otros modelos VITS empaquetados por Phoonnx (coleccion VITS) | varios | VITS (ONNX) | no disponible | no disponible | segun modelo | ONNX |
| Piper (modelos TTS ONNX) | varios | VITS / otros | no disponible | no disponible | MIT / otras | ONNX |

La comparativa se limita a alternativas de la misma familia (VITS) y empaquetado ONNX; no hay datos de rendimiento publicados para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre CSS10 (un unico hablante), la voz esta limitada a ese locutor y no representa variacion dialectal o de genero.
- Riesgo de alucinacion: en TTS, el equivalente son artefactos de pronunciacion o prosodia erronea; el front end solo por grafemas puede producir lecturas incorrectas de palabras hungaras con reglas ortograficas complejas.
- Limitaciones de contexto o idioma: solo hungaro; no es multilingue y no hay datos sobre longitud maxima de texto por sintesis.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright; debe verificarse el cumplimiento en redistribuciones.
- Caveats para produccion: modelo antiguo (release Coqui TTS v0.8.0), sin benchmarks publicados, sin cuantizaciones documentadas y con soporte dependiente de la libreria phoonnx; conviene validar calidad de audio y latencia en el hardware objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-css10-graphemes
- Upstream (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--hu--css10--vits.zip
- phoonnx (libreria de inferencia): https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion y fonemizadores): https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Coqui TTS (repositorio original): https://github.com/coqui-ai/TTS
