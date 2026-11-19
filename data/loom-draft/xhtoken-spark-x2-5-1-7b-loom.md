# loom-draft/XHToken-Spark-X2.5-1.7B-loom

## Resumen

XHToken-Spark-X2.5-1.7B-loom es un paquete de despliegue en formato Loom publicado por el usuario loom-draft. No se trata de un modelo entrenado desde cero, sino de un empaquetado del checkpoint GGUF sin modificar XHToken/Spark-X2.5-1.7B-GGUF (concretamente el fichero `Spark-X2.5-1.7B-Q4_K_M.gguf`), convertido a programas `.loom` y a una tarjeta `model.json` para su ejecución en GPUs AMD mediante el runtime Loom. El paquete se ha generado con `loom-next`, la herramienta de generación del ecosistema Loom, sin intervención de un LLM en el bucle.

El modelo subyacente es un transformer de 1.700 millones de parámetros en cuantización Q4_K_M, con una ventana de contexto declarada de 262.144 tokens por petición y soporte de tool calling y modo de razonamiento (thinking) activado por defecto. El paquete está orientado específicamente al AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y a la AMD Radeon AI PRO R9700 (gfx1201, 32 GB), y se sirve mediante `loom-serve` con una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es acotada pero concreta: ofrece una vía de ejecución nativa para hardware AMD consumer y de estación de trabajo reciente, con un runtime propio (hrx-loom 0.2.0) que compila kernels para estas arquitecturas. No obstante, el paquete es muy reciente (creado el 19 de noviembre de 2026), no tiene descargas ni valoraciones, y las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para esta versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado como programas `.loom` y `weights.loom`) |

## Arquitectura y entrenamiento

El paquete no incluye información sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. Lo único verificable es que se trata de un transformer de 1.700 millones de parámetros distribuido en cuantización Q4_K_M y que el checkpoint GGUF se ha empaquetado sin modificaciones. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas del modelo original.

La innovación del paquete reside en la capa de ejecución: `loom-next` genera programas `.loom` (kernels) a partir del GGUF y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256, que `loom-fetch` verifica. `loom-serve` ejecuta esos programas sobre el runtime AMD con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `pool_backing=fixed` (reserva fija del pool de memoria) y `parameter_mode=preload` (carga anticipada de pesos en el host). No se aplica decodificación especulativa (marcada como no aplicable).

## Capacidades

- Generación de texto conversacional a través de una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI, con campos `tools` y `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte de conversaciones multi-turno con hasta 262.144 tokens de contexto por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (marcados como no aplicables).
- Sin decodificación especulativa ni ajuste de esfuerzo de razonamiento (no aplicables).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete permite servir un modelo de 1.7B con API OpenAI sobre una Radeon AI PRO R9700 o un Ryzen AI Max+ 395, útil para prototipos y entornos de desarrollo sin depender de la nube.
- Agentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` y de bucles multi-turno (validado por la puerta `agent`) permite construir agentes que consulten APIs o bases de datos locales.
- Procesamiento de documentos largos: la ventana de 262.144 tokens admite resumir, extraer información o responder preguntas sobre documentos extensos en una sola petición, siempre que el hardware soporte la memoria necesaria.
- Razonamiento con traza explícita: el modo thinking por defecto resulta adecuado para tareas de análisis paso a paso donde interesa inspeccionar el razonamiento, y puede desactivarse para respuestas directas de baja latencia.
- Evaluación comparativa de runtimes: las puertas de corrección (`golden`, `compare`, `logits`, `sampling`) están diseñadas para contrastar la salida de Loom contra llama.cpp sobre el mismo GGUF, lo que convierte el paquete en una herramienta para validar la fidelidad de un runtime alternativo.
- Despliegue en hardware AMD consumer de gama alta: al estar orientado a gfx1151 y gfx1201, cubre equipos que no disponen de CUDA y que de otro modo dependerían de llama.cpp u otras soluciones.
- Integración en servicios con concurrencia moderada: con 4 peticiones concurrentes y la puerta `consistency` (salida idéntica en concurrencia que en ejecución aislada), encaja en servicios internos de baja o media carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que los resultados de este paquete aún no se han vuelto a medir. Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, por lo que no hay evidencia registrada de su cumplimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1.7B parámetros en Q4_K_M, el peso de los pesos ronda 1 GB, pero el contexto de 262.144 tokens y el pool de memoria fijo (`--pool_backing=fixed`) pueden elevar considerablemente el consumo; no se han publicado cifras.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: el paquete está pensado para hardware AMD integrado o de estación de trabajo; no se menciona compatibilidad con GPUs NVIDIA ni con otras Radeon.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto (llama.cpp se usa únicamente como referencia de corrección).
- Latencia y throughput: no disponibles; las mediciones para este paquete aún no se han realizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| XHToken-Spark-X2.5-1.7B-loom | 1.7B | 262.144 | Apache 2.0 | GGUF empaquetado en `.loom`, runtime Loom | Solo AMD gfx1151 y gfx1201; sin benchmarks publicados |
| XHToken/Spark-X2.5-1.7B-GGUF (base) | 1.7B | no disponible | Apache 2.0 | GGUF | Checkpoint original sin empaquetar; ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas de 1.7B en GGUF | ~1.7B | variable | variable | GGUF | No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica |

No se dispone de datos de rendimiento del paquete ni de modelos comparables verificados en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni resultados de las puertas de corrección para esta versión; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Compatibilidad restringida a dos GPUs AMD concretas (gfx1151 y gfx1201); no se declara soporte para otras arquitecturas.
- El modelo base es de 1.7B parámetros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño; riesgo de alucinación inherente.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- Límite de 4.096 tokens de salida por petición, lo que puede ser insuficiente para generaciones largas pese al contexto de 262.144 tokens.
- Concurrencia máxima de 4 peticiones; no apto para cargas de alta concurrencia sin escalado horizontal.
- Sin soporte de imagen ni audio, pese a que la puerta `vision` aparezca en la tabla de corrección.
- El paquete tiene cero descargas y cero valoraciones, y fue creado y actualizado el mismo día; se trata de un artefacto sin validación comunitaria.
- Aunque la licencia es Apache 2.0, debe verificarse que el modelo base y los ficheros derivados mantengan condiciones compatibles para uso comercial.
- El uso de `completion_spin_ns=4294967295` implica espera activa y consumo de CPU mientras hay trabajo en la GPU, lo que afecta al consumo energético y a la disponibilidad de CPU.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/XHToken-Spark-X2.5-1.7B-loom
- Modelo base en Hugging Face: https://huggingface.co/XHToken/Spark-X2.5-1.7B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
