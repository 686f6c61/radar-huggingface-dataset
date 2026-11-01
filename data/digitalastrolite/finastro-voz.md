# digitalastrolite/finastro-voz

## Resumen

Finastro voz es un modelo de síntesis de voz (text-to-speech) en espanol distribuido en formato ONNX, derivado de Pocket TTS de Kyutai. Lo publica el usuario digitalastrolite como componente de la aplicacion Finastro, que descarga estos ficheros para sintetizar voz en el propio dispositivo. El repositorio contiene unicamente los grafos ONNX ya exportados y cuantizados, no los pesos originales en formato de entrenamiento.

La relevancia del modelo esta en su enfoque de despliegue: al estar en ONNX con cuantizacion int8, esta pensado para inferencia local en entornos con recursos limitados, sin necesidad de GPU dedicada ni de servicios en la nube. El checkpoint de origen es la variante `spanish_24l` de Pocket TTS, reentrenada en espanol el 24 de septiembre de 2026, con una arquitectura de transformer de 24 capas con estado mas un decodificador de audio Mimi.

El modelo cubre exclusivamente espanol y una unica tarea: convertir texto en audio. No es un modelo de proposito general ni soporta instrucciones, tool calling ni razonamiento. Su valor practico depende del ecosistema de la app Finastro y de la libreria `pocket_tts` de Kyutai, con la que el autor verifico la equivalencia de los grafos sustituidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 capas con estado (flow_lm_main) + red de flujo (flow_lm_flow) + decodificador de audio Mimi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica de ONNX Runtime (solo MatMul) en flow_lm_main, flow_lm_flow y mimi_decoder; text_conditioner en fp32 |
| Idiomas soportados | espanol |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (text_conditioner.onnx, flow_lm_main_int8.onnx, flow_lm_flow_int8.onnx, mimi_decoder_int8.onnx) + tokenizer.model |

## Arquitectura y entrenamiento

La arquitectura procede de Pocket TTS de Kyutai, un sistema de TTS neuronal compuesto por varias etapas: un condicionador de texto que genera embeddings (fp32), un transformer de 24 capas con estado que modela la secuencia latente, una red de flujo que ejecuta un paso de generacion y un decodificador Mimi que convierte los latentes en audio. Los grafos `flow_lm_main`, `flow_lm_flow` y `mimi_decoder` mantienen estado interno entre pasos, lo que encaja con la sintesis incremental propia de un TTS.

El autor no entreno el modelo: tomo la exportacion ONNX de KevinAHM (basada en un checkpoint espanol anterior) y sustituyo cada peso por su equivalente del checkpoint `spanish_24l` en la revision `2dd944b099d06bb9edbd221fef138685711d9bf0`, incluida la copia traspuesta que conservan los grafos. El resultado se valido contra la libreria oficial `pocket_tts`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si hubo ajuste por RLHF o DPO en el checkpoint original.

## Capacidades

- Sintesis de voz a partir de texto en espanol, con salida de audio generada por el decodificador Mimi.
- Inferencia local en dispositivo mediante ONNX Runtime, sin dependencia de API externa.
- Ejecucion con pesos int8 en los modulos principales, lo que reduce el espacio en disco y el consumo de memoria.
- Integracion con la app Finastro para las voces de sus asistentes.
- Compatibilidad verificada con la libreria `pocket_tts` de Kyutai.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: solo espanol.

## Casos de uso

- Sintesis de voz en aplicaciones moviles o de escritorio: el modelo se descarga como ficheros ONNX y se ejecuta en el dispositivo, lo que evita enviar texto del usuario a un servidor y elimina la latencia de red.
- Lectura de contenido en voz alta: articulos, notificaciones o mensajes de la app Finastro pueden convertirse a audio con un modelo de 0,4 GB de repositorio, viable en almacenamiento de movil.
- Asistentes conversacionales integrados: la app puede dar voz a las respuestas de sus asistentes sin depender de un proveedor de TTS en la nube, manteniendo la conversacion completamente local.
- Accesibilidad: conversion de texto a audio para usuarios con discapacidad visual o dificultades de lectura dentro de la aplicacion, con funcionamiento sin conexion.
- Prototipado de interfaces de voz en espanol: desarrolladores que necesiten un TTS ligero en ONNX pueden reutilizar los grafos y el tokenizer para experimentar con la libreria `pocket_tts`.
- Sistemas embebidos o edge computing: al estar cuantizado a int8 y no requerir GPU, encaja en dispositivos con CPU modesta donde un TTS de mayor tamano no cabria.
- Generacion de avisos y locuciones pregrabadas: la app puede sintetizar mensajes dinamicos en lugar de almacenar clips de audio fijos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser ONNX Runtime con cuantizacion int8, la inferencia puede ejecutarse en CPU; el repositorio ocupa 0,4 GB, lo que da una cota superior aproximada del espacio de pesos.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU; el diseno apunta a ejecucion en dispositivo.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no hay datos oficiales de consumo de memoria en ejecucion.
- Opciones de despliegue: ONNX Runtime (unica via documentada), con la libreria `pocket_tts` de Kyutai para validacion. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| Finastro voz | TTS (Pocket TTS) | es | ONNX int8 | CC BY 4.0 | no disponible | Derivado de kyutai/pocket-tts, orientado a inferencia local |
| kyutai/pocket-tts | TTS | multiple (incluye es) | pesos originales | CC BY 4.0 | no disponible | Modelo base; requiere conversion para ONNX |
| KevinAHM/pocket-tts-onnx | TTS (Pocket TTS) | es (checkpoint anterior) | ONNX int8 | CC BY 4.0 | no disponible | Exportacion previa sobre la que se construye Finastro voz |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta espanol; no hay capacidad multilingue.
- Es un modelo unicamente de sintesis de voz: no procesa instrucciones, no razona y no admite tool calling.
- No se han publicado benchmarks ni evaluaciones de calidad de audio, naturalidad o inteligibilidad.
- El autor no entreno el modelo; los pesos provienen de un checkpoint de terceros (Kyutai) y la exportacion ONNX de otro autor (KevinAHM), lo que anade capas de dependencia y posibles divergencias no documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero obliga a citar a los autores originales (Kyutai y KevinAHM) y a indicar los cambios realizados.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones erroneas, artefactos o prosodia incorrecta en textos con nombres propios, siglas o vocabulario fuera del dominio de entrenamiento.
- No se documentan sesgos de genero, acento o dialecto en el checkpoint espanol.
- La fecha de creacion del repositorio (2026-11-01) y la del reentrenamiento espanol (2026-09-24) indican un modelo muy reciente y poco rodado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/digitalastrolite/finastro-voz
- Modelo base Pocket TTS: https://huggingface.co/kyutai/pocket-tts
- Exportacion ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx
