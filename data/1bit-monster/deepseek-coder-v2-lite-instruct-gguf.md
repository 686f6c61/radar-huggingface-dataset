# 1bit-MONSTER/DeepSeek-Coder-V2-Lite-Instruct-GGUF

## Resumen

DeepSeek-Coder-V2-Lite-Instruct es un modelo de lenguaje especializado en codigo desarrollado por DeepSeek, publicado originalmente como parte de la familia DeepSeek-Coder-V2. Se trata de un modelo con arquitectura Mixture of Experts (MoE) de aproximadamente 15.700 millones de parametros totales, disenado para tareas de generacion de codigo, comprension de repositorios y razonamiento matematico. Esta ficha describe concretamente la redistribucion en formato GGUF cuantizado Q4_K_M publicada por el usuario 1bit-MONSTER, orientada a su ejecucion en el motor propio "1bit engine" sobre hardware Strix Halo.

El repositorio no contiene el modelo original en safetensors, sino una conversion a GGUF realizada por bartowski y re-alojada por 1bit-MONSTER con mediciones de rendimiento anadidas. El tamano del repositorio es de 10,4 GB y el unico archivo incluido es `DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf`. La relevancia de esta ficha radica en que permite ejecutar un MoE de ~16B parametros totales en hardware de consumo mediante cuantizacion de 4 bits, manteniendo la naturaleza conversacional e instruct del modelo base.

La licencia aplicable es la DeepSeek License Agreement, que permite uso comercial con restricciones de uso orientadas a la prevencion de abusos, y no es una licencia plenamente permisiva como Apache 2.0 o MIT. Los datos de rendimiento publicados fueron medidos en septiembre de 2026 con el backend Vulkan del motor, que ya ha sido retirado, por lo que las cifras actuales sobre la ruta HRX estan pendientes de re-medicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parametros totales | 15.706.484.224 (~15,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repo) |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek License Agreement (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts, segun indican las etiquetas del repositorio (`moe`, `coder`). El dato de parametros totales confirmado a partir de los safetensors del modelo original es de 15.706.484.224. No se dispone en la informacion proporcionada del numero de parametros activos por token, del numero de expertos, ni de la composicion del dataset de entrenamiento.

Respecto al proceso de cuantizacion, el archivo GGUF Q4_K_M procede de la conversion realizada por bartowski sobre el modelo instruct original y ha sido re-alojado por 1bit-MONSTER. La model card menciona el uso de una tabla `imatrix` (etiqueta del repositorio), tecnica habitual para mejorar la calidad de la cuantizacion en modelos MoE. No se detallan en la informacion disponible datos sobre RLHF, DPO ni innovaciones de decodificacion especulativa.

## Capacidades

- Generacion y completado de codigo en el contexto de un modelo instruct conversacional.
- Razonamiento sobre codigo y tareas de comprension de repositorios, heredado de la familia DeepSeek-Coder-V2.
- Capacidad conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs compatibles con OpenAI.
- Ejecucion local mediante llama.cpp a traves del motor 1bit engine.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision o audio en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local: el modelo puede desplegarse en una estacion de trabajo con GPU de consumo gracias a su cuantizacion Q4_K_M y su naturaleza MoE, ofreciendo autocompletado y explicacion de fragmentos de codigo sin depender de servicios en la nube.
- Revision de codigo automatizada: integrado en un pipeline de CI, el modelo puede generar comentarios sobre diffs y detectar patrones problematicos en el codigo enviado, aprovechando su entrenamiento especifico en codigo.
- Generacion de tests unitarios: dado un fragmento de codigo fuente, el modelo puede producir casos de prueba en el mismo lenguaje, reduciendo el trabajo manual en proyectos con cobertura baja.
- Migracion y traduccion entre lenguajes: el modelo puede reescribir funciones de un lenguaje a otro manteniendo la semantica, util en proyectos de modernizacion de codebases legacy.
- Documentacion tecnica asistida: generacion de docstrings y comentarios a partir del codigo, con un modelo instruct que responde a instrucciones en lenguaje natural.
- Chat tecnico integrado en IDE: al ser un modelo conversacional, puede mantener un dialogo multi-turno con el desarrollador para resolver dudas sobre una base de codigo concreta.
- Despliegue en hardware de consumo: con 10,4 GB de pesos en Q4_K_M, puede ejecutarse en GPUs consumer de gama alta o en sistemas con memoria unificada como Strix Halo, segun las mediciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de rendimiento de inferencia en hardware concreto:

| Metrica | Valor | Hardware / backend | Fecha |
|---|---|---|---|
| pp512 (prefill) | 2002 tok/s | Strix Halo, Vulkan | 2026-09 |
| tg128 (generacion) | 99,5 tok/s | Strix Halo, Vulkan | 2026-09 |

Nota: el backend Vulkan fue retirado del motor; las cifras sobre la ruta HRX estan pendientes de re-medicion segun la propia model card.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,4 GB solo para los pesos en Q4_K_M, mas overhead de contexto y cache KV; en la practica se recomienda disponer de 12-16 GB de memoria grafica o unificada.
- GPU recomendadas: el autor ha medido sobre Strix Halo (memoria unificada). Por tamano, cabria en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB); en GPUs de 8 GB no cabria en esta cuantizacion.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas de VRAM en esta cuantizacion.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), motor 1bit engine (`1bit serve -m ... --device hrx`), y cualquier runtime compatible con GGUF como Ollama o LM Studio. No se confirma soporte de vLLM o TGI para este archivo.
- Throughput medido: 2002 tok/s en prefill (pp512) y 99,5 tok/s en generacion (tg128) sobre Strix Halo con backend Vulkan (septiembre de 2026).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct (este repo, GGUF Q4_K_M) | ~15,7B (MoE) | no disponible | DeepSeek License | GGUF |
| deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct (original) | ~15,7B (MoE) | no disponible | DeepSeek License | safetensors |
| bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF (origen de la cuantizacion) | ~15,7B (MoE) | no disponible | DeepSeek License | GGUF |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo frente a otras alternativas; la comparativa se limita a parametros, licencia y formato. Otros modelos comparables de la misma categoria no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- La licencia DeepSeek License Agreement no es plenamente permisiva: incluye restricciones de uso orientadas a la prevencion de abusos, por lo que conviene revisar el texto completo antes de un despliegue comercial.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original en safetensors; la calidad en tareas de codigo complejo puede degradarse.
- El repositorio solo incluye una unica cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision.
- Las metricas de rendimiento publicadas corresponden a un backend (Vulkan) ya retirado del motor; las cifras actuales sobre HRX no estan verificadas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion en la informacion proporcionada.
- El modelo esta especializado en codigo; su rendimiento en tareas generales de lenguaje natural fuera de ese dominio no esta documentado en esta ficha.
- El repositorio tiene un numero muy bajo de descargas (281) y likes (1), lo que limita la validacion comunitaria de la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Cuantizacion de origen (bartowski): https://huggingface.co/bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Familia de modelos del autor: https://huggingface.co/1bit-MONSTER#families
