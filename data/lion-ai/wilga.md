# lion-ai/wilga

## Resumen

Wilga es un modelo de síntesis de voz (text-to-speech) de pequeno tamano desarrollado por lion-ai, disenado especificamente para polaco (8 voces) e ingles (3 voces). Cada modelo de idioma cuenta con 4,56 millones de parametros, genera audio a 24 kHz y esta optimizado para ejecutarse en CPU o directamente en el navegador mediante WebAssembly, sin necesidad de GPU ni de dependencias como eSpeak para la conversion de texto a fonemas.

La propuesta diferencial de Wilga es su front end propio de normalizacion textual: convierte numeros, fechas, abreviaturas y aplica reglas de pronunciacion de forma nativa, lo que elimina la dependencia de motores externos de fonemizacion. El modelo se distribuye en formato ONNX (33 MB por idioma) y puede consumirse desde Python (`pip install wilga`), linea de comandos, un unico archivo JavaScript para web o cualquier runtime compatible con ONNX.

Con licencia Apache 2.0 y un repositorio de apenas 0,1 GB, Wilga se posiciona como una opcion ligera para despliegues en entornos con recursos limitados, aplicaciones web del lado del cliente y sistemas embebidos donde el coste computacional y la privacidad (procesamiento local) son prioritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS en formato ONNX con front end propio de texto a fonemas) |
| Parametros totales | 4,56 M por modelo de idioma (polaco e ingles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto oracion por oracion, sin limite documentado) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el modelo polaco ocupa 33 MB) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`pl/model.onnx`, `en/model.onnx`) |
| Frecuencia de muestreo | 24 kHz |
| Voces | 8 en polaco, 3 en ingles |
| Dependencias Python | numpy, onnxruntime, huggingface_hub (sin PyTorch) |
| Soporte web | JavaScript (`web/wilga.js`) + WebAssembly |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red neuronal (no se especifica si es un modelo basado en difusion, VITS, FastSpeech u otra familia). Lo que si se documenta es que cada idioma cuenta con un modelo ONNX independiente de 4,56 millones de parametros que sintetiza audio a 24 kHz. El componente mas diferenciador es el front end propio de conversion de texto a fonemas, que gestiona numeros, fechas, abreviaturas y reglas de pronunciacion sin recurrir a eSpeak ni a motores externos.

En cuanto a los datos de entrenamiento, la model card referencia dos datasets: `czyzi0/the-mc-speech-dataset` (asociado a la voz `MC` en polaco) y `MikhailT/hifi-tts` (origen de las voces `hifi_*` en ingles). No se especifica el numero total de horas de audio, la composicion completa del corpus ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial, dado que en TTS estos metodos no son habituales. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en polaco con 8 voces diferenciadas: `kobieta_dojrzala` (mujer madura, por defecto), `kobieta_ciepla` (mujer, calida), `kobieta_mloda` (mujer joven), `dziewczyna_melancholijna` (joven melancolica), `mezczyzna_baryton` (hombre, bariton), `mezczyzna_mlody` (hombre joven), `mezczyzna_starszy` (hombre mayor) y `MC`.
- Sintesis de voz en ingles con 3 voces: `hifi_92` (mujer, por defecto), `hifi_6097` (hombre) y `hifi_9017` (hombre).
- Normalizacion textual integrada: conversion de numeros, fechas, abreviaturas y reglas de pronunciacion sin dependencias externas.
- Procesamiento de texto de cualquier longitud mediante lectura oracion por oracion.
- Control de prosodia: parametros `speed` (velocidad), `pitch_shift` (desplazamiento de tono, 0,058 equivale aproximadamente a un semitono), `pitch_range` (rango tonal) y `sentence_gap` (silencio entre oraciones en segundos).
- Ejecucion en CPU sin GPU.
- Ejecucion en navegador mediante WebAssembly, con modelos y front ends descargados desde el repositorio y cacheados por el navegador.
- Salida como array numpy float32 a 24 kHz o guardado directo a WAV.
- Interfaz de linea de comandos con soporte para entrada por stdin y ejecucion sin instalacion via `uvx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es exclusivamente un modelo TTS).

## Casos de uso

- Lectura por voz de interfaces web en polaco e ingles: el modelo se integra como un unico archivo JavaScript (`web/wilga.js`) que carga los modelos ONNX y los ejecuta en WebAssembly dentro del navegador, permitiendo accesibilidad sin enviar texto a servidores externos.
- Asistentes de voz en aplicaciones de escritorio o moviles: con 4,56 M de parametros y formato ONNX, puede embeberse en aplicaciones nativas que necesiten sintesis local en CPU, sin GPU ni conexion a internet.
- Generacion de audiolibros o contenido narrado: el procesamiento oracion por oracion permite leer textos de cualquier longitud, y los parametros `speed`, `pitch_shift` y `sentence_gap` permiten ajustar el ritmo y el tono por voz.
- Sistemas de announcement o megafonia automatizada: la normalizacion nativa de numeros, fechas y abreviaturas facilita la lectura correcta de horarios, precios y referencias sin preprocesado adicional.
- Prototipado rapido de TTS en pipelines de datos: la instalacion via `pip install wilga` con solo numpy, onnxruntime y huggingface_hub (sin PyTorch) reduce el peso de dependencias en entornos de CI/CD o contenedores ligeros.
- Aplicaciones de privacidad y procesamiento local: al ejecutarse en CPU o navegador sin llamadas a servicios en la nube, es adecuado para escenarios donde el texto no puede salir del dispositivo (sanidad, legal, banca).
- Generacion de voces de relleno en videojuegos o prototipos: las 11 voces disponibles entre ambos idiomas permiten poblar dialogos de prueba con distintas caracteristicas vocales sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (el modelo esta disenado para ejecutarse en CPU; no requiere GPU).
- GPU recomendadas: no aplica; el modelo funciona en CPU. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no es el objetivo del diseno.
- Compatibilidad con GPU de consumo: no es necesario; el modelo cabe en cualquier CPU moderna.
- Tamano en disco: 33 MB por modelo de idioma en ONNX; repositorio completo de 0,1 GB.
- Opciones de despliegue: ONNX Runtime (Python), navegador via WebAssembly, linea de comandos (`wilga`), `uvx wilga` sin instalacion, cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Formato | Ejecucion en CPU/navegador |
|---|---|---|---|---|---|---|
| Wilga (lion-ai) | 4,56 M por idioma | pl, en | Texto por oraciones | Apache 2.0 | ONNX | Si (CPU y WebAssembly) |
| Piper TTS | no disponible en la informacion | Multiples | Texto por oraciones | MIT (segun proyecto) | ONNX | Si (CPU) |
| Coqui TTS (XTTS) | no disponible en la informacion | Multiples | Texto | MPL 2.0 / Coqui CPML | PyTorch | Limitado |
| eSpeak NG | no aplica (sintetizador formantico) | Multiples | Texto | GPLv3 | Nativo | Si |

Nota: los datos de los modelos comparables no provienen de la informacion proporcionada y deben verificarse en sus respectivas fichas. Wilga se diferencia por su soporte nativo de WebAssembly y su front end propio de fonemizacion sin eSpeak.

## Limitaciones y advertencias

- Solo soporta dos idiomas: polaco e ingles. No hay soporte documentado para castellano ni otras lenguas.
- El numero de voces es limitado (8 en polaco, 3 en ingles) y no se documenta la posibilidad de clonacion de voz ni voces personalizadas.
- No se han publicado metricas objetivas de calidad (MOS, WER) ni benchmarks comparativos, lo que dificulta evaluar su fidelidad frente a alternativas.
- Al ser un modelo de 4,56 M de parametros, es esperable una calidad inferior a la de sistemas TTS neuronales de mayor tamano, aunque no se aportan datos que lo confirmen.
- No se detalla el proceso de entrenamiento (horas de audio, composicion del corpus, posibles sesgos de los datasets `the-mc-speech-dataset` y `hifi-tts`), por lo que no puede evaluarse el sesgo demografico o dialectal de las voces.
- Riesgo de errores de pronunciacion en palabras no cubiertas por las reglas del front end, especialmente en prestamos linguisticos o terminologia tecnica.
- Aunque la licencia es Apache 2.0 (permite uso comercial), deben revisarse las licencias de los datasets de origen si se redistribuyen los pesos o se generan derivados.
- La fecha de creacion del repositorio (2026-11-24) y el numero de descargas (0) indican que el modelo es muy reciente y carece de validacion por parte de la comunidad.
- No dispone de soporte para tool calling, agentes ni razonamiento; es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lion-ai/wilga
- Demo en navegador: https://huggingface.co/spaces/lion-ai/wilga-demo
- Paquete PyPI: https://pypi.org/project/wilga/
- Dataset MC Speech: https://huggingface.co/datasets/czyzi0/the-mc-speech-dataset
- Dataset HiFi-TTS: https://huggingface.co/datasets/MikhailT/hifi-tts
- Muestras de audio polaco: https://huggingface.co/lion-ai/wilga/tree/main/samples/pl
- Muestras de audio ingles: https://huggingface.co/lion-ai/wilga/tree/main/samples/en
