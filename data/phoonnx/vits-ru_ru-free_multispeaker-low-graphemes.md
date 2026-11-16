# Phoonnx/vits-ru_ru-free_multispeaker-low-graphemes

## Resumen

vits-ru_ru-free_multispeaker-low-graphemes es un modelo de sintesis de voz (text-to-speech) en ruso basado en la arquitectura VITS, desarrollado originalmente por utrobinmv y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo toma caracteres del texto como entrada (front end basado en grafemas, sin fonemizacion fonetica) y genera audio para ruso de Rusia (ru-RU) con soporte para multiples hablantes.

La relevancia de este paquete reside en su formato: los pesos se distribuyen en ONNX, lo que permite ejecutar la inferencia sin depender de PyTorch y facilita el despliegue en entornos ligeros, incluidos asistentes de voz como OVOS mediante el plugin ovos-tts-plugin-phoonnx. Su tamano de repositorio (0,1 GB) y su etiqueta "low" indican un modelo compacto orientado a dispositivos con recursos limitados.

Se trata de un modelo de nicho, con 21 descargas y sin likes en el momento de la consulta, pensado para integraciones practicas de TTS en ruso mas que para investigacion de vanguardia. La licencia Apache 2.0 del modelo original facilita su uso comercial, aunque conviene verificar las condiciones del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ru-RU |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial durante el entrenamiento, con alineamiento monotono aprendido. La variante "multispeaker" incorpora embeddings de hablante, lo que permite generar voces distintas con un unico conjunto de pesos. La etiqueta "low" sugiere una configuracion reducida de capacidad o calidad, aunque no se especifican dimensiones de capas ni numero de parametros en la informacion disponible.

El front end textual es puramente basado en grafemas: `GraphemePhonemizer` de la libreria scriptconv convierte el texto normalizado en la secuencia de entrada del modelo, sin pasar por un diccionario fonetico ni por un fonemizador basado en reglas. No se dispone de datos sobre el corpus de entrenamiento (horas de audio, numero de hablantes, composicion del dataset) ni sobre si se aplicaron tecnicas de RLHF, DPO u otros ajustes posteriores. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en ruso (ru-RU) a partir de texto plano.
- Soporte multi-hablante mediante embeddings de hablante.
- Entrada basada en grafemas: no requiere fonemizacion externa, lo que simplifica el pipeline.
- Ejecucion en formato ONNX, independiente de PyTorch en tiempo de inferencia.
- Integracion con la libreria phoonnx y con el asistente de voz OVOS a traves de ovos-tts-plugin-phoonnx.
- Generacion de audio WAV mediante la API `synthesize_wav`.
- No se documentan capacidades de clonacion de voz, control de emocion, prosodia avanzada, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz domoticos en OVOS: el modelo se selecciona como voz en `mycroft.conf` y sintetiza respuestas en ruso dentro de un asistente local, aprovechando su formato ONNX y su bajo peso para ejecucion en hardware modesto.
- Lectura de notificaciones y alertas en ruso: integracion en sistemas de monitorizacion que convierten mensajes de texto en audio para operadores o usuarios rusoparlantes.
- Accesibilidad: conversion de contenido textual (articulos, correos, documentacion) en audio para personas con discapacidad visual, usando el soporte multi-hablante para alternar voces.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite validar flujos de TTS en ruso sin infraestructura pesada.
- Generacion de audio para contenido educativo o de e-learning en ruso: sintesis de lecciones o narraciones con distintas voces para mantener la atencion del oyente.
- Sistemas de respuesta interactiva por voz (IVR) en entornos con recursos limitados: el tamano de 0,1 GB y la inferencia ONNX permiten desplegarlo en servidores pequenos o dispositivos edge.
- Pruebas de integracion en pipelines de CI para aplicaciones de voz en ruso: verificar que el texto se normaliza y sintetiza correctamente antes de desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) es previsible que quepa en GPUs consumer con 2-4 GB, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable en tarjetas como GTX 1650 o superiores por el reducido tamano del modelo, si bien no se aportan datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS; al ser ONNX, puede ejecutarse con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-ru_ru-free_multispeaker-low-graphemes (este) | VITS | ru-RU | ONNX | apache-2.0 | Grafemas |
| utrobinmv/tts_ru_free_hf_vits_low_multispeaker | VITS | ru-RU | PyTorch (upstream) | apache-2.0 | Grafemas |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun modelo | Grafemas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ruso (ru-RU); no soporta otros idiomas.
- El front end basado en grafemas puede producir pronunciaciones incorrectas en palabras con ortografia irregular o prestamos, al no usar fonemizacion.
- No se documentan sesgos de hablante, genero o acento; el conjunto de voces multi-hablante no esta descrito.
- Riesgo de artefactos o prosodia limitada por la configuracion "low" del modelo.
- No hay informacion sobre el corpus de entrenamiento, lo que impide evaluar cobertura lexica y calidad en dominios especializados.
- La licencia Apache 2.0 se hereda del modelo upstream; conviene revisar la model card original para confirmar condiciones de uso comercial y atribucion.
- El paquete esta marcado como pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de la API.
- No apto para clonacion de voz ni control fino de emocion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-free_multispeaker-low-graphemes
- Modelo upstream: https://huggingface.co/utrobinmv/tts_ru_free_hf_vits_low_multispeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
