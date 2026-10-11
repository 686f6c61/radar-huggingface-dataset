# prabanta-dev/gemma-4-E2B-it-JNS

## Resumen

`prabanta-dev/gemma-4-E2B-it-JNS` es una conversion de pesos, no un modelo entrenado desde cero. Se trata de `google/gemma-4-E2B-it`, el modelo mas pequeno de la familia Gemma 4 de Google DeepMind, reescrito al formato JNS que consume Janas, un motor de inferencia escrito en C para ordenadores convencionales, con o sin GPU. La conversion la firma el usuario prabanta-dev y parte de los GGUF ya cuantizados por unsloth.

El interes practico esta en el objetivo del proyecto: ejecutar un modelo de unos 2,1 mil millones de parametros y 8K de contexto en CPU, sin depender de una GPU dedicada. En el portatil de referencia del autor (Intel Core Ultra 9 185H, GPU Arc integrada, 32 GB de memoria) Janas mide 191 tok/s de lectura de prompt y 38 tok/s de escritura, frente a 150 y 19 tok/s de llama.cpp en la misma maquina.

El repositorio ocupa 3,2 GB e incluye unicamente dos ficheros: los pesos en Q4_K_M y un modelo auxiliar pequeno que actua como borrador para decodificacion especulativa. El modelo solo es legible por Janas; no es un GGUF ni un safetensors reutilizable por otros motores. El repositorio no registra descargas ni valoraciones y no aporta resultados de benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | La del modelo base `google/gemma-4-E2B-it`; no detallada en la informacion disponible (Google documenta que la familia Gemma 4 abarca cuatro arquitecturas distintas) |
| Parametros totales | 2,1 mil millones (dato de gemma4.dev para Gemma 4 E2B) |
| Parametros activos | no disponible (no se ha documentado como MoE) |
| Longitud de contexto | 8K tokens (segun gemma4.dev para Gemma 4 E2B) |
| Tipos de cuantizacion | Q4_K_M (GGUF de unsloth, reescrito a JNS). No se publican otros niveles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para los ficheros del repositorio. El motor Janas es GPL-3.0-or-later (no aplica a los pesos) |
| Formato de pesos | JNS (formato propio de Janas), convertido desde GGUF. No hay safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

Este repositorio no entrena ni ajusta nada. Segun la propia model card, cada fichero es un GGUF cuantizado por terceros y reescrito por la herramienta `gguf2jns` en el orden en que Janas lo lee, conservando los metadatos. No hubo poda ni reentrenamiento. El fichero principal (`gemma-4-e2b-it-q4km.jns`, 3,11 GB) procede de `gemma-4-E2B-it-Q4_K_M.gguf` de unsloth, y el auxiliar (`gemma-4-e2b-it-mtp.jns`, 0,10 GB) procede de `mtp-gemma-4-E2B-it.gguf` del mismo repositorio.

La innovacion tecnica relevante no esta en el modelo sino en el motor: Janas incorpora decodificacion especulativa mediante un "asistente" (el fichero MTP) que propone los siguientes tokens y el modelo grande los verifica. El autor cifra en 52 tok/s la escritura en chat con ese asistente, frente a 38 tok/s sin el. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base `google/gemma-4-E2B-it`.
- Respuesta a preguntas, resumen y razonamiento, segun la descripcion general de la familia Gemma 4 que publica Google.
- Decodificacion especulativa con el modelo auxiliar MTP incluido en el repositorio.
- Inferencia en CPU y en GPU integrada (probado con Intel Arc integrada).
- Modelo descrito como text-only por gemma4.dev; no se documenta vision en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes locales sin conexion: el modelo se ejecuta sobre el motor Janas sin necesidad de red ni de GPU dedicada, lo que permite desplegar un chat en equipos aislados o en entornos con conectividad restringida.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse en el propio equipo, los datos no salen de la maquina, algo adecuado para borradores internos, notas o documentos que no deben pasar por servicios externos.
- Inferencia en portatiles de gama alta con grafica integrada: el escenario medido por el autor (Core Ultra 9 185H con Arc integrada y 32 GB) da 191 tok/s de lectura y 38 tok/s de escritura, suficiente para respuestas interactivas.
- Despliegue en dispositivos de borde: con 3,11 GB de pesos en Q4_K_M y un contexto de 8K, encaja en equipos con memoria limitada donde no cabe un modelo mayor.
- Resumen y reescritura de documentos cortos: con 8K de contexto se pueden procesar correos, actas o fragmentos de documentacion tecnica en una sola pasada.
- Comparacion de motores de inferencia: el repositorio ofrece una linea base reproducible (Janas frente a llama.cpp sobre el mismo portatil) util para evaluar el rendimiento de `janas-bench` y `llama-bench`.
- Generacion asistida de texto en aplicaciones de escritorio: al ser un binario en C con ficheros locales, se puede integrar como motor embebido en una aplicacion nativa sin dependencias de Python.

## Benchmarks y rendimiento

El autor publica unicamente medidas de rendimiento de inferencia, tomadas el 9 y 10 de octubre de 2026 con `llama-bench -p 1024 -n 16` y `janas-bench --prompt 1024 --gen 16` en un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria.

| Medicion en el mismo portatil | Janas | llama.cpp |
|---|---:|---:|
| Lectura de un prompt de 1.024 tokens | 191 tok/s | 150 tok/s |
| Escritura (16 tokens) | 38 tok/s | 19 tok/s |
| Escritura en chat, con asistente propio | 52 tok/s | no medido |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Tamano de los pesos: 3,11 GB el fichero Q4_K_M y 0,10 GB el auxiliar MTP, con un repositorio total de 3,2 GB.
- Memoria estimada: el autor ha probado el modelo en un equipo con 32 GB de memoria; dado que los pesos ocupan 3,11 GB, se puede estimar un consumo del orden de 4 GB para el modelo cuantizado, sin contar el contexto ni el asistente.
- GPU recomendadas: no hay una lista publicada. La unica configuracion documentada es una GPU Arc integrada en un Intel Core Ultra 9 185H. El soporte de otras GPU no esta documentado en la informacion disponible.
- GPU de consumo: por tamano (3,11 GB), los pesos entrarian en tarjetas con 4 GB o mas de VRAM, pero la compatibilidad real depende del soporte de Janas, que no se detalla.
- Opciones de despliegue: exclusivamente el motor Janas, mediante `janas-get gemma-4-e2b` y `janas-chat gemma-4-e2b`. No es compatible con vLLM, Ollama, TGI ni llama.cpp; para esos motores habria que partir del GGUF original de unsloth.
- Plataforma: binario Janas para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores).
- Latencia y throughput medidos: 191 tok/s de lectura y 38 tok/s de escritura sin asistente, 52 tok/s de escritura en chat con asistente, en el equipo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Motor de inferencia | Licencia |
|---|---|---|---|---|---|
| prabanta-dev/gemma-4-E2B-it-JNS | 2,1 mil millones | 8K | JNS (Q4_K_M) | Janas | Apache 2.0 |
| google/gemma-4-E2B-it | 2,1 mil millones | 8K | safetensors (original) | Marcos habituales (transformers, etc.) | Apache 2.0 declarada en la model card |
| unsloth/gemma-4-E2B-it-GGUF | 2,1 mil millones | 8K | GGUF (varios niveles) | llama.cpp, Ollama y derivados | Apache 2.0 |

No se dispone de comparativas de calidad frente a modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no registra descargas ni valoraciones y procede de un unico autor, sin validacion independiente de la conversion.
- No hay benchmarks de calidad publicados, solo medidas de velocidad de inferencia en una maquina concreta. El rendimiento variara en otros equipos, como advierte el propio autor.
- El formato JNS solo lo lee Janas. Esto bloquea el uso con vLLM, Ollama, TGI, llama.cpp o cualquier marco basado en transformers.
- Contexto limitado a 8K tokens, insuficiente para documentos largos o conversaciones muy extensas sin estrategias de troceado.
- Modelo descrito como text-only; no se documenta soporte de vision, audio ni otras modalidades.
- Idiomas soportados: no disponible, lo que impide garantizar calidad fuera del ingles o de los idiomas que cubra el modelo base.
- Riesgo de alucinacion inherente a un modelo de 2,1 mil millones de parametros; no se recomienda su uso en tareas que exijan verificacion factual estricta sin supervision.
- La model card original de `google/gemma-4-E2B-it` no incluye fichero LICENSE y se limita a declarar Apache 2.0, segun senala el propio autor de la conversion.
- Restricciones de licencia: los pesos son Apache 2.0, pero el binario del motor Janas es GPL-3.0-or-later. Conviene revisar la compatibilidad si se distribuye un producto que enlace con el motor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prabanta-dev/gemma-4-E2B-it-JNS
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base (variante): https://huggingface.co/google/gemma-4-E2B
- GGUF de origen: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Repositorio del motor Janas: https://github.com/prabanta-dev/janas
- Documentacion de Janas: https://github.com/prabanta-dev/janas#readme
- Ficha de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Vision general de Gemma 4: https://ai.google.dev/gemma/docs/core
