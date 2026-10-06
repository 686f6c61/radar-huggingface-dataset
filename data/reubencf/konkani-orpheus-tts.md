# Reubencf/konkani-orpheus-tts

## Resumen

Konkani Orpheus TTS LoRA es un adaptador de ajuste fino (LoRA/PEFT) publicado por el usuario Reubencf sobre el modelo base `unsloth/orpheus-3b-0.1-ft`, un modelo de síntesis de voz (text-to-speech) de aproximadamente 3.000 millones de parametros basado en la arquitectura Orpheus. El adaptador se ha entrenado durante una epoca completa sobre la particion limpia de entrenamiento TTS del conjunto de datos `Reubencf/goan-konkani-speech`, con el objetivo de dotar al modelo base de capacidad de sintesis de voz en konkani (codigo de idioma `kok`), una lengua indoaria hablada principalmente en Goa y otras regiones costeras de la India.

La relevancia de este modelo radica en que lleva la sintesis de voz neuronal a un idioma de bajos recursos como el konkani, para el que existen pocos sistemas TTS publicos. Al tratarse de un adaptador LoRA de rango 64 que no duplica los pesos base, el repositorio ocupa solo 0,4 GB y puede combinarse con el modelo Orpheus-3B original, lo que reduce los costes de almacenamiento y despliegue. Las transcripciones emplean escritura romi konkani (konkani en alfabeto latino) y el conjunto de entrenamiento incluye multiples voces.

No se dispone de informacion publica sobre la licencia, la longitud de contexto soportada ni resultados cuantitativos de benchmarks en los datos proporcionados, por lo que estos extremos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo TTS base (`unsloth/orpheus-3b-0.1-ft`, familia Orpheus, transformer decoder-only) |
| Parametros totales | Aproximadamente 3.000 millones en el modelo base; parametros del adaptador LoRA no disponibles (rango 64) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos base en 16 bits segun la model card; opciones de cuantizacion del adaptador no disponibles |
| Idiomas soportados | Konkani (`kok`), escritura romi konkani |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 construido sobre el modelo base `unsloth/orpheus-3b-0.1-ft`. No se trata de un modelo completo: el repositorio contiene unicamente los pesos del adaptador y el tokenizer, y requiere cargar el modelo base por separado, ya que los pesos originales no se duplican. El entrenamiento se realizo con la libreria Unsloth, con los pesos base en 16 bits, una tasa de aprendizaje de 2e-4, tamano de lote de uno y acumulacion de gradiente de cuatro, durante una epoca completa sobre la particion limpia de entrenamiento TTS del conjunto de datos `Reubencf/goan-konkani-speech`.

Los datos de entrenamiento consisten en audio de sintesis de voz en konkani con transcripciones en romi konkani, e incluyen multiples voces, lo que permite al adaptador generar habla en distintas voces dentro del mismo idioma. La model card indica que se incluyen ejemplos generados y metricas en el repositorio, pero no se proporcionan valores numericos concretos en la informacion disponible. No se detalla la composicion exacta del dataset, el numero de horas de audio ni si se aplicaron tecnicas adicionales de alineacion como RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) en konkani a partir de texto escrito en romi konkani.
- Generacion de audio con multiples voces, dado que el conjunto de entrenamiento contiene varias voces.
- Adaptacion eficiente mediante LoRA de rango 64, lo que permite combinarla con el modelo base sin reentrenar los pesos completos.
- Uso del tokenizer incluido en el repositorio junto con el modelo base Orpheus-3B.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingues mas alla del konkani.
- No se documentan modos especiales como thinking mode, vision o audio de entrada.

## Casos de uso

- Sintesis de voz en konkani para aplicaciones de accesibilidad: lectura en voz alta de textos en konkani para personas con discapacidad visual, aprovechando el soporte del idioma `kok`.
- Locucion automatica de contenidos digitales: conversion de articulos, blogs o noticias en konkani a audio para su publicacion como podcast o contenido sonoro.
- Asistentes de voz en konkani: integracion en sistemas de respuesta por voz para interacciones basicas en este idioma, combinando el modelo con un motor de reconocimiento de voz.
- Audiolibros en konkani: generacion de narraciones a partir de textos literarios, con posibilidad de usar varias voces segun el contenido.
- Preservacion linguistica: produccion de material sonoro en konkani para fines educativos o de documentacion de la lengua.
- Sistemas de anuncios o avisos hablados: generacion de mensajes de audio automatizados en konkani para servicios publicos o transporte.
- Prototipado de investigacion en TTS de bajos recursos: estudio de tecnicas LoRA aplicadas a idiomas con pocos datos, sirviendo el adaptador como punto de partida reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se incluyen ejemplos generados y metricas en el repositorio, pero no se han proporcionado valores numericos (MOS, WER, similitud de voz u otros) en los datos facilitados, por lo que no se presentan cifras.

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB, pero requiere cargar el modelo base Orpheus-3B para funcionar.
- VRAM estimada para inferencia del modelo base: aproximadamente 6-8 GB en precision de 16 bits, unos 3-4 GB en cuantizacion de 8 bits y alrededor de 2-3 GB en cuantizacion de 4 bits (estimaciones orientativas para un modelo de unos 3.000 millones de parametros; no confirmadas para este adaptador concreto).
- GPU recomendadas: tarjetas con al menos 8-12 GB de VRAM para 16 bits, como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090; en entornos de servidor, A100 o H100 para despliegue a gran escala.
- Cabe en GPU de consumo si se usa cuantizacion de 8 o 4 bits; en 16 bits requiere una GPU de gama media-alta con suficiente VRAM.
- Opciones de despliegue: no confirmadas en la informacion disponible. El ecosistema Orpheus se suele servir con vLLM; otras alternativas como llama.cpp, Ollama o TGI dependerian del soporte del modelo base y no estan documentadas aqui.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de rendimiento que permitan una comparacion rigurosa. A continuacion se ofrece una comparacion cualitativa basada en la informacion disponible; los valores de los modelos alternativos son orientativos y deben verificarse en sus respectivas fichas.

| Modelo | Tipo | Parametros | Idioma | Licencia | Observaciones |
|---|---|---|---|---|---|
| Konkani Orpheus TTS LoRA | Adaptador LoRA sobre TTS | Aprox. 3.000 M (base) + adaptador | Konkani (`kok`) | no disponible | Especializado en konkani, requiere modelo base |
| Orpheus-3B (`unsloth/orpheus-3b-0.1-ft`) | Modelo TTS completo | Aprox. 3.000 M | Ingles principalmente | no disponible en la informacion facilitada | Modelo base sobre el que se construye este adaptador |
| XTTS-v2 | Modelo TTS multilingue | no disponible | Multilingue (incluye varios idiomas) | no disponible | Alternativa consolidada, sin soporte especifico de konkani confirmado |
| Kokoro | Modelo TTS | no disponible | Multilingue | no disponible | Alternativa ligera; soporte de konkani no confirmado |

## Limitaciones y advertencias

- Se trata de un adaptador, no de un modelo autonomo: sin el modelo base `unsloth/orpheus-3b-0.1-ft` no puede ejecutarse.
- La licencia no esta disponible, por lo que no puede confirmarse si se permite el uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- El entrenamiento se realizo durante una sola epoca sobre una particion concreta del dataset; no se documenta el volumen de datos ni la calidad final del audio generado.
- Al ser un modelo de sintesis de voz, puede reproducir sesgos o caracteristicas acusticas presentes en los datos de entrenamiento (voces, acentos, posibles desequilibrios entre voces).
- El soporte idiomatico se limita al konkani en escritura romi; no se documentan otros idiomas ni variantes de escritura (por ejemplo, devanagari).
- No se dispone de informacion sobre la longitud de contexto ni sobre el manejo de textos largos.
- No se han publicado metricas objetivas de calidad (MOS, WER) en la informacion disponible, lo que dificulta evaluar su rendimiento real.
- Riesgo de alucinacion o artefactos en la sintesis ante entradas fuera de dominio o texto poco representado en el dataset de entrenamiento.
- El uso de voces sintetizadas puede plantear consideraciones eticas y legales sobre suplantacion de identidad o derechos de voz; conviene aplicar salvaguardas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Reubencf/konkani-orpheus-tts
- Modelo base: https://huggingface.co/unsloth/orpheus-3b-0.1-ft
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Reubencf/goan-konkani-speech
- No se han encontrado enlaces adicionales relevantes (papers, blogs o repositorios) en la busqueda web proporcionada; los resultados obtenidos no guardan relacion con el modelo.
