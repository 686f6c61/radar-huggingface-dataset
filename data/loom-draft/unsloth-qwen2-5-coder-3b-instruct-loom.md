# loom-draft/unsloth-Qwen2.5-Coder-3B-Instruct-loom

## Resumen

El modelo publicado bajo el identificador `loom-draft/unsloth-Qwen2.5-Coder-3B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue para la plataforma Loom (ecosistema de ROCm/AMD) construido sobre el checkpoint GGUF sin modificar `unsloth/Qwen2.5-Coder-3B-Instruct-GGUF`, en concreto la cuantización `Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf`. Lo genera la herramienta `loom-next` a partir de ese GGUF, sin intervención de ningún LLM en el proceso, y lo publica el usuario `loom-draft`. Por tanto, el modelo subyacente es Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros desarrollado por Alibaba Qwen, especializado en generación de código e instrucciones.

La relevancia de esta publicación es fundamentalmente de infraestructura: proporciona programas `.loom` y una tarjeta `model.json` que permiten servir el modelo en GPUs AMD concretas, el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), mediante `loom-serve` con una API compatible con OpenAI. No aporta pesos nuevos ni fine-tuning: los pesos son los del GGUF original de Unsloth.

La información disponible sobre el modelo base en esta ficha es limitada; los datos de arquitectura, entrenamiento y benchmarks del Qwen2.5-Coder-3B-Instruct que no aparecen en la model card se marcan como «no disponible». La model card del paquete tampoco incluye mediciones de rendimiento propias: indica explícitamente que los resultados para ambas GPUs «no se han vuelto a medir».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-3B-Instruct); empaquetado como programas Loom generados |
| Parametros totales | 3B (según el nombre del modelo base; no detallado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición (según la tabla de features del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json`, `info.json`, `model.json` y `model.json.lock` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros. La model card del paquete no documenta la arquitectura interna (número de capas, dimensiones, cabezas de atención), los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO; esos datos corresponden al modelo base de Qwen y no se reproducen aquí por no estar en la información proporcionada.

La innovación técnica de esta publicación no está en el modelo, sino en el empaquetado: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF original para las arquitecturas AMD gfx1151 y gfx1201, junto con una tarjeta `model.json` y un `model.json.lock` con los hashes sha256 de los ficheros fuente que verifica `loom-fetch`. El paquete se sirve con `loom-serve`, que expone un endpoint compatible con OpenAI, soporta tool calling estilo OpenAI, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset. No incluye decodificación especulativa, modo de razonamiento, ni entrada de imagen o audio (marcados como «not applicable» o «—» en la tabla de features).

## Capacidades

- Generación de texto e instrucciones: el modelo base es un instruct model de la familia Qwen2.5-Coder, orientado a tareas de código y conversación.
- Generación y asistencia de código: es la especialidad declarada del modelo base Qwen2.5-Coder.
- Tool calling / function calling: soportado con el formato OpenAI (`tools` y `tool_calls`), según la tabla de features del paquete.
- API compatible con OpenAI: endpoint `/v1/chat/completions`.
- Concurrencia: 4 peticiones simultáneas.
- Límite de salida: 4.096 tokens por petición (preset `max_tokens`).
- Contexto por petición: 32.768 tokens.
- Modo de razonamiento / thinking: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): marcado como «?» (no determinado) en la tabla de features.

## Casos de uso

- Asistente de código en local sobre GPU AMD: el paquete está pensado para servir el modelo en Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, de modo que un desarrollador puede levantar un endpoint compatible con OpenAI en su propia máquina y usarlo desde editores o scripts sin depender de la nube.
- Autocompletado y generación de código en el IDE: con 32.768 tokens de contexto por petición, el modelo puede recibir ficheros y fragmentos de proyecto relativamente grandes y devolver sugerencias o funciones completas.
- Automatización con tool calling: al soportar `tools` y `tool_calls` estilo OpenAI, puede integrarse en pipelines que consulten APIs, ejecuten comandos o encadenen pasos multi-turno, con hasta 4 peticiones concurrentes.
- Prototipado de agentes de código: el paquete incluye gates de corrección específicos para bucles de tool calling multi-turno (`agent`, `agent_think_off`), lo que lo hace adecuado para experimentar con agentes que leen, editan y verifican código.
- Servicio de chat técnico interno: con la API `/v1/chat/completions` y un máximo de 4.096 tokens de salida, puede desplegarse como backend de un chatbot de documentación técnica o de preguntas sobre una base de código.
- Evaluación de la plataforma Loom frente a llama.cpp: el paquete está diseñado para compararse con la referencia de llama.cpp sobre el mismo GGUF (gates `golden`, `compare`, `logits`, `sampling`), por lo que sirve como banco de pruebas de la corrección y el rendimiento de Loom en GPUs AMD.
- Despliegue en hardware consumer de gama alta: al ser un modelo de 3B en Q4_K_M, cabe en GPUs con memoria moderada, lo que permite ejecutarlo en equipos con Radeon AI PRO R9700 (32 GB) o en el sistema integrado Strix Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), «the results for this package are not yet re-measured», y que todos los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured». No se dispone de cifras de MMLU, HumanEval, GSM8K ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 3B parámetros en cuantización Q4_K_M, y el paquete está orientado a la Radeon AI PRO R9700 con 32 GB y al sistema Strix Halo. No se publican cifras de memoria del paquete.
- GPU soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete está dirigido a hardware AMD concreto; no se documenta compatibilidad con otras GPUs consumer.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete y opciones `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de completaciones en GPU).
- Latencia y throughput: no disponibles; la model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen2.5-Coder-3B-Instruct-loom | 3B | 32.768 tokens por petición | Apache 2.0 | Paquete Loom para GPUs AMD gfx1151 y gfx1201 | Empaquetado de inferencia, sin pesos nuevos |
| unsloth/Qwen2.5-Coder-3B-Instruct-GGUF | 3B | no disponible en esta ficha | Apache 2.0 (según el paquete) | GGUF en Hugging Face | Checkpoint base del que deriva este paquete |
| Qwen2.5-Coder-3B-Instruct (original) | 3B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo original de Alibaba Qwen |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son los del GGUF `Qwen2.5-Coder-3B-Instruct-Q4_K_M.gguf` sin modificar; cualquier limitación del modelo base (sesgos, alucinaciones, cobertura idiomática) se hereda.
- Sin mediciones de rendimiento ni de corrección: todos los gates y las comparativas frente a llama.cpp figuran como «not yet re-measured», por lo que no hay evidencia publicada de que el paquete reproduzca fielmente la salida de llama.cpp en estas GPUs.
- Compatibilidad de hardware restringida: el paquete está generado para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta soporte para otras GPUs.
- Límites de servicio: 4 peticiones concurrentes y 4.096 tokens de salida por preset; el contexto por petición es de 32.768 tokens.
- Funcionalidades ausentes: sin modo de razonamiento, sin decodificación especulativa, sin entrada de imagen o audio, y el comportamiento de muestreo figura como no determinado.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte multilingüe del paquete.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del GGUF de origen antes de un despliegue en producción.
- Publicación con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen2.5-Coder-3B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de la búsqueda web (loom.com, loom.fr, atlassian.com/software/loom) corresponden a productos no relacionados con este modelo y se han descartado.
