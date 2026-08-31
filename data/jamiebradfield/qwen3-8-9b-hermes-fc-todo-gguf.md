# JamieBradfield/qwen3.8-9b-hermes-fc-todo-GGUF

## Resumen

El modelo `qwen3.8-9b-hermes-fc-todo-GGUF` es una versión cuantizada en formato GGUF del fine-tuning `qwen3.8-9b-hermes-fc-todo`, desarrollado por JamieBradfield sobre la base de `Empero/Qwen3.8-9B`. Se trata de un modelo de 9.195 millones de parámetros especializado en function calling y uso de herramientas, con un enfoque particular en la gestión autónoma de listas de tareas (todo). El autor lo ha entrenado mediante QLoRA utilizando datos procedentes de sus propias sesiones de agente Hermes, complementados con fuentes públicas con licencia abierta como SWE-rebench, APIGen-MT-5k y When2Call.

La relevancia de este modelo radica en su especialización para agentes autónomos que necesitan decidir cuándo y cómo invocar herramientas, un área crítica en el desarrollo de asistentes y pipelines de automatización. La versión GGUF aquí descrita emplea una cuantización ROCmFPX específica para hardware AMD RDNA3, lo que permite ejecutarlo en GPUs de consumo como la RX 7700 XT con 12 GB de VRAM, manteniendo una ventana de contexto de hasta 245.000 tokens según la model card del autor. La licencia Apache-2.0 facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-9B) |
| Parametros totales | 9.195.119.616 (9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 245.000 tokens (segun la model card) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (unico archivo disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de `Empero/Qwen3.8-9B`, un modelo denso de 9,2 B parametros. Sobre esta base se ha aplicado un fine-tuning con QLoRA, una tecnica que permite adaptar modelos grandes con un uso reducido de memoria al cuantizar los pesos durante el entrenamiento. Los datos de entrenamiento provienen de sesiones reales de agente Hermes del propio autor, complementadas con conjuntos publicos con licencia abierta: SWE-rebench (razonamiento sobre ingenieria de software), APIGen-MT-5k (generacion de llamadas a API) y When2Call (decision de cuándo invocar una herramienta). Esta combinacion busca ensenar al modelo no solo a ejecutar funciones, sino a discernir el momento adecuado para hacerlo.

La version GGUF se ha obtenido mediante el fork `llama-rocmfpx`, primero convirtiendo los pesos BF16 del merge original con `convert_hf_to_gguf.py --outtype bf16` y posteriormente cuantizando con `llama-quantize` usando el esquema `Q4_0_ROCMFP4_FAST`. Este esquema esta optimizado para kernels ROCm en GPUs AMD RDNA3, aunque el autor recomienda convertir desde el merge BF16 del repositorio padre si se busca portabilidad a otras plataformas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Function calling: el modelo puede emitir llamadas a herramientas estructuradas (JSON) en respuesta a peticiones del usuario.
- Tool use autonomo: decide por si mismo cuando invocar una funcion, sin necesidad de que el usuario lo solicite explicitamente.
- Gestion de listas de tareas (todo): especializado en crear, actualizar, consultar y completar elementos de una lista de pendientes.
- Soporte para agentes multi-paso: capaz de encadenar varias llamadas a herramientas para resolver una tarea compleja.
- Integracion con pipelines de automatizacion gracias a su formato GGUF y compatibilidad con motores de inferencia como llama.cpp.

## Casos de uso

- Asistente personal de productividad: el modelo puede gestionar una lista de tareas del usuario, anadiendo, marcando como completadas o reorganizando entradas mediante llamadas a una API de todo. Su especializacion en este dominio reduce errores en la interpretacion de comandos ambiguos.
- Agente autonomo de soporte tecnico: integrado en un sistema de tickets, el modelo decide cuando crear una incidencia, cuando escalarla a un humano o cuando responder directamente, usando function calling para interactuar con el CRM.
- Automatizacion de flujos de trabajo en CI/CD: el modelo puede invocar herramientas de build, test o despliegue en funcion de los resultados de pasos anteriores, actuando como orquestador en pipelines de integracion continua.
- Chatbot con acceso a bases de datos: mediante tool calling, el modelo consulta registros, actualiza campos o genera informes, manteniendo el contexto de la conversacion durante multiples turnos.
- Asistente de investigacion: el modelo puede buscar en APIs externas, resumir resultados y guardar referencias en una lista de tareas pendientes, combinando generacion de texto con invocacion de herramientas.
- Prototipado rapido de agentes: gracias a su licencia Apache-2.0 y su formato GGUF, es adecuado para experimentar con arquitecturas de agentes en entornos de desarrollo locales sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta una evaluacion propia basada en 40 pruebas (probes) con los siguientes resultados:

| Prueba | Resultado |
|---|---|
| Tier-1 held-out (rendimiento en casos reservados) | 13/20 |
| Tier-2 autonomo (capacidad de decidir alcanzar una herramienta todo) | 7/10 (frente a 3/10 en la version v26) |

Estos datos provienen de la model card del repositorio padre y no son comparables con benchmarks publicos estandarizados.

## Requisitos de hardware

- El archivo GGUF pesa 4,69 GB, por lo que cabe en GPUs con 8 GB de VRAM o mas.
- El autor reporta su uso en una AMD Radeon RX 7700 XT con 12 GB de VRAM, sirviendo el modelo a 245.000 tokens de contexto con cuantizacion q8_0/turbo3 para las claves y valores de atencion.
- La cuantizacion ROCmFPX esta optimizada para AMD RDNA3; en otras plataformas (NVIDIA, Apple Silicon) se recomienda convertir desde el merge BF16 del repositorio padre.
- Para inferencia en CPU, el formato GGUF es compatible con llama.cpp y sus derivados (Ollama, LM Studio), aunque la velocidad sera menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor que soporte GGUF. Para despliegue en produccion con alta concurrencia, se puede convertir a otros formatos (por ejemplo, safetensors) y usar vLLM o TGI, aunque no se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoria. El autor mantiene otros fine-tunes sobre la misma base (por ejemplo, `qwen3.8-9b-hermes-function-calling-v1-GGUF` y `qwen3.8-9b-hermes-fc-real-traces`), pero no se han publicado especificaciones detalladas ni resultados de benchmarks que permitan una comparacion rigurosa. Como referencia, el modelo base `Empero/Qwen3.8-9B` es un Transformer denso de 9,2 B parametros con licencia Apache-2.0, y este fine-tuning anade la capa de especializacion en function calling y gestion de tareas.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado para otros idiomas.
- Su especializacion en function calling y listas de tareas puede degradar el rendimiento en tareas genericas de razonamiento o generacion de texto libre.
- La cuantizacion Q4_0_ROCMFP4_FAST esta pensada para AMD RDNA3; en otras arquitecturas puede haber perdidas de precision o incompatibilidades.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversariales.
- El numero de descargas y likes es cero, lo que indica que el modelo es muy reciente y no ha sido ampliamente validado por la comunidad.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantias sobre el comportamiento del modelo en entornos de produccion.
- La fecha de creacion (2026-08-31) es posterior a la fecha actual, por lo que se recomienda verificar la disponibilidad y el estado del repositorio antes de su uso.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-todo-GGUF
- Repositorio padre (merge BF16): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-todo
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Otros fine-tunes del autor: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1-GGUF
- https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-balanced
- Ficha en LLM Explorer (modelo real-traces): https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-fc-real-traces,2TEFMrMU8nw0D9NfSFX1GH
