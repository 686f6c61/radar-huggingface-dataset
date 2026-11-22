# Phoonnx/vits-it_it-serena-high-espeak

## Resumen

vits-it_it-serena-high-espeak es una voz de síntesis de voz (text-to-speech) en italiano, basada en la arquitectura VITS del ecosistema Piper y convertida al formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por bacca87 y publicado dentro del repositorio rhasspy/piper-voices; esta versión concreta es una conversión realizada por TigreGotico (publicada bajo la cuenta Phoonnx) que no altera los pesos, solo el empaquetado.

El modelo resuelve la generación de audio hablado en italiano a partir de texto, con una única hablante identificada como "serena" y una frecuencia de muestreo de 22050 Hz. La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `it`), y la síntesis se realiza sobre esos fonemas. Es relevante para desarrolladores que necesitan TTS ligero, ejecutable en CPU, integrable en pipelines de Python y con licencia permisiva.

La ficha se centra en las características técnicas y en las advertencias prácticas de esta conversión: el modelo no está indexado en el catálogo de voces de phoonnx, la versión int8 no se distribuye porque no superó el control de calidad, y la calidad de pronunciación depende de que se use espeak-ng real en lugar del port espyak.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | fp32 (unico formato distribuido); int8 no publicado |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx` + `config.json`) |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 1 (serena) |
| Fonemizador | espeak-ng, voz `it`, alfabeto IPA |
| Puntuacion soportada | `, . ! ? : ;` (clausula) |
| Tamano del grafo | 114,2 MB |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con alineamiento monotono aprendido. En el ecosistema Piper se emplea una variante optimizada para inferencia rapida en CPU. La conversion a ONNX preserva los pesos originales; no hay cambios en la topologia mas alla del grafo exportado.

El entrenamiento fue realizado desde cero por bacca87, segun indica la model card upstream, sobre el dataset `committa/serena-synthetic-it-27h` (licencia CC-BY-4.0), un corpus sintetico de aproximadamente 27 horas en italiano. No se documentan en la informacion disponible el numero exacto de tokens, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO (en TTS no es el paradigma habitual). La model card no registra datos de entrenamiento adicionales ni checkpoint de entrenamiento en este repositorio.

## Capacidades

- Sintesis de voz en italiano a partir de texto, con salida WAV a 22050 Hz.
- Fonemizacion mediante espeak-ng (voz `it`) con alfabeto IPA; requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Soporte de puntuacion de clausula (`, . ! ? : ;`) preservada en la sintesis a partir de phoonnx 1.96.1a1.
- Voz unica (single-speaker), sin seleccion de hablante.
- Inferencia en CPU con un RTF bajo (ver seccion de rendimiento).
- Integracion via API de Python de phoonnx (`TTSVoice.load` y `synthesize_wav`).
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de articulos y boletines en italiano: el modelo convierte texto plano en audio a 22050 Hz; su bajo coste computacional permite generar resumenes hablados en servidores sin GPU.
- Asistentes de voz embebidos: al ejecutarse en CPU con un RTF de 0,239 en un i9-11900H, es adecuado para dispositivos de gama media o entornos sin acelerador.
- Accesibilidad para contenido en italiano: conversion de documentacion, avisos o interfaces a voz para usuarios con discapacidad visual, con licencia CC BY 4.0 compatible con uso comercial citando al autor.
- Generacion de audiolibros o podcasts sinteticos en italiano: la voz unica y la salida WAV permiten concatenar fragmentos; conviene segmentar por frases para controlar la prosodia.
- Pruebas de integracion en pipelines de TTS: util para validar el flujo de phoonnx (descarga de `model.onnx` y `config.json`, carga con `TTSVoice.load`) antes de migrar a voces indexadas.
- Prototipado de sistemas de respuesta por voz (IVR) en italiano: la latencia y el consumo de memoria (RSS pico de 320,8 MB) permiten desplegarlo en contenedores modestos.
- Evaluacion comparativa de fonemizadores: sirve para contrastar la salida con espeak-ng frente al port espyak, ya que la model card advierte de diferencias foneticas.

## Benchmarks y rendimiento

Los datos de la model card corresponden a un control de calidad (QA) con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, medidos en un Intel Core i9-11900H a 2,50 GHz con 4 hilos.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control | fail | no distribuido |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 18,6 a 19,4 | - |
| Longitud (int8 / fp32) | - | 0,96 a 0,99 |
| Tamano del grafo | 114,2 MB | - |
| RSS pico | 320,8 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,239 | - |

No se han publicado resultados de benchmarks comparativos (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no aplican a un modelo TTS. El RTF de 0,239 indica que la sintesis tarda aproximadamente una cuarta parte de la duracion del audio generado.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU. El RSS pico medido es de 320,8 MB en fp32.
- GPU recomendadas: no disponibles ni necesarias; no se documenta soporte CUDA especifico en la informacion proporcionada.
- Cabe en cualquier equipo de consumo: el grafo ONNX ocupa 114,2 MB y el repositorio completo 0,1 GB; funciona en portatiles y mini-PC.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]`. No se documenta integracion con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,239 (mediana de 3 ejecuciones, 4 hilos) en i9-11900H; 18,6 a 19,4 caracteres por segundo. El rendimiento en otros procesadores no esta documentado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Muestreo | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| Phoonnx/vits-it_it-serena-high-espeak | VITS (Piper) | it-IT | 1 | 22050 Hz | ONNX | CC BY 4.0 | Conversion, fuera del indice de voces |
| rhasspy/piper-voices (it_IT/serena/high) | VITS (Piper) | it-IT | 1 | 22050 Hz | Piper (ONNX original) | CC BY 4.0 | Modelo upstream, entrenado por bacca87 |
| Otras voces Piper en italiano | VITS (Piper) | it-IT | variable | variable | ONNX | variable | No disponible en detalle |

La comparacion principal es con el modelo upstream: mismos pesos, misma licencia y mismo idioma; la diferencia es el empaquetado ONNX para phoonnx y la falta de indexacion en el catalogo de voces. No se dispone de datos de benchmarks comparativos con otras voces en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no esta indexado en el catalogo de voces de phoonnx; debe cargarse manualmente desde sus archivos (`model.onnx` y `config.json`).
- La version int8 no se distribuye porque no supero el control de calidad (gate int8); solo hay fp32.
- El control de calidad en fp32 figura como "fail" en la model card, aunque el WER medido es 0,000; conviene validar la calidad en el caso de uso concreto antes de produccion.
- La pronunciacion depende de espeak-ng real: el port espyak puede diferir en algunos fonemas y producir palabras mal pronunciadas.
- La voz no esta indexada porque phoonnx asigna un id distinto a los pares de vocales de este mapa (phoonnx issue 838); el problema debe resolverse antes de que la voz aparezca en el indice.
- Es un modelo de un solo hablante y un solo idioma (italiano); no soporta otros idiomas ni cambio de voz.
- No hay datos publicados sobre sesgos, alucinacion (no aplica en el sentido de LLM) ni robustez ante texto fuera de dominio; el corpus de entrenamiento es sintetico, lo que puede limitar la naturalidad en dominios no cubiertos.
- Licencia CC BY 4.0: permite uso comercial con atribucion a bacca87 (entrenamiento) y a TigreGotico Lda (conversion).
- No hay checkpoint de entrenamiento ni datos de entrenamiento detallados en el repositorio, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-serena-high-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/it/it_IT/serena/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Organizacion TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento: https://huggingface.co/datasets/committa/serena-synthetic-it-27h
- Issue de phoonnx sobre pares de vocales: https://github.com/TigreGotico/phoonnx/issues/838
