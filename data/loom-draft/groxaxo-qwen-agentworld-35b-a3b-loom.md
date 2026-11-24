# loom-draft/groxaxo-Qwen-AgentWorld-35B-A3B-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un paquete de despliegue en formato Loom (`.loom` + `model.json`) generado por `loom-next` sobre el checkpoint GGUF sin modificar `Qwen-AgentWorld-35B-A3B-Q4_K_M.gguf` de `groxaxo/Qwen-AgentWorld-35B-A3B-GGUF`. El objetivo es ejecutar ese GGUF en GPUs AMD mediante la pila de inferencia `hrx-loom` (versión 0.2.0), con soporte explícito para el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del paquete es `loom-draft` y la licencia declarada es MIT.

El modelo subyacente es un Qwen de 35B de parámetros totales con arquitectura Mixture-of-Experts (sufijo A3B, aproximadamente 3B de parámetros activos por token), derivado de la familia Qwen y ajustado por `groxaxo` bajo el nombre "AgentWorld". El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), tool calling en formato OpenAI, modo razonamiento activado por defecto y una ventana de contexto configurada de 262.144 tokens por petición, con concurrencia de 4 peticiones y un máximo de 4.096 tokens de salida por preset.

Su relevancia es acotada y muy específica: no aporta pesos nuevos ni mejoras de calidad, sino una vía de ejecución del GGUF en hardware AMD fuera del ecosistema NVIDIA, con kernels generados y comprobaciones de corrección definidas. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y las mediciones de rendimiento y las puertas de corrección figuran como "not yet re-measured", por lo que no hay evidencia publicada de rendimiento para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (derivada de Qwen; activación aproximada de 3B por token) |
| Parametros totales | 35B (según el nombre del checkpoint base) |
| Parametros activos | aproximadamente 3B (sufijo A3B del checkpoint base) |
| Longitud de contexto | 262.144 tokens por petición (preset Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom se genera sobre esa cuantización |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom (`.loo` + `model.json` + `model.json.lock`) |
| Modelo base | groxaxo/Qwen-AgentWorld-35B-A3B-GGUF |
| Generador del paquete | loom-next (generación sin LLM en el bucle) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones concurrentes |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no entrena nada: reproduce el grafo de cómputo del GGUF `Qwen-AgentWorld-35B-A3B-Q4_K_M.gguf` mediante kernels generados por `loom-next` y los ejecuta con `hrx-loom` sobre ROCm. La arquitectura efectiva es la del checkpoint base, un transformer con capas Mixture-of-Experts de 35B de parámetros totales y aproximadamente 3B activos por token, lo que sitúa el coste de cómputo por token en el orden de un modelo denso de 3B mientras mantiene la capacidad de representación de un modelo mucho mayor. No se dispone en la información proporcionada de detalles sobre número de capas, dimensión oculta, número de expertos, tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el ajuste "AgentWorld" de `groxaxo`.

La innovación técnica del repositorio es de despliegue, no de modelado. El paquete incluye un `model.json` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`, un pool de memoria con dos modos (`--pool_backing=fixed` reserva el pool por adelantado; el modo elástico lo hace crecer), precarga de pesos en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las filas de rendimiento de la tarjeta. El generador no emplea un LLM en el bucle, lo que hace el proceso reproducible. La decodificación especulativa figura como no aplicable en este paquete.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con puerta de corrección específica para bucles agénticos multi-turno (`agent` y `agent_think_off`).
- Modo razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Soporte declarado de contexto largo: 262.144 tokens por petición.
- Concurrencia de 4 peticiones con puerta de consistencia (`consistency`) para verificar que las respuestas concurrentes coinciden con las ejecuciones aisladas.
- Entrada de imagen no soportada por Loom, aunque el modelo upstream sí la tiene; el paquete no expone visión.
- Entrada y salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de características, con puerta `sampling` pendiente de medición.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue de un agente con tool calling en estaciones de trabajo AMD: el paquete expone `tools` y `tool_calls` en formato OpenAI y una puerta de validación de bucles agénticos, de modo que se puede conectar directamente a frameworks que ya hablan ese protocolo sin adaptadores propietarios.
- Asistente de código con contexto de repositorio en una R9700 de 32 GB: con 262.144 tokens de ventana se pueden inyectar varios ficheros y el historial de conversación en una sola petición, útil para revisión de parches o explicación de módulos completos.
- Procesamiento de documentos largos en local: informes, expedientes o transcripciones que superan los 100k tokens caben en una única petición, lo que evita pipelines de troceado y recuperación para tareas de resumen o extracción.
- Razonamiento con traza explícita en tareas de análisis: el modo thinking activado por defecto permite obtener cadenas de razonamiento para depuración de decisiones, y desactivarlo reduce latencia cuando solo se necesita la respuesta final.
- Servicio interno de chat para equipos con hardware AMD: `loom-serve` levanta un endpoint compatible con OpenAI en `127.0.0.1:8080`, con 4 peticiones concurrentes, suficiente para un grupo pequeño de usuarios o para pruebas de integración.
- Evaluación comparativa frente a llama.cpp en hardware AMD: las puertas `golden`, `compare` y `logits` están diseñadas para contrastar tokens greedy y log-probs contra una referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar la fidelidad numérica de la pila antes de adoptarla en producción.
- Prototipado en un APU Strix Halo sin GPU discreta: el paquete está generado específicamente para gfx1151, lo que permite ejecutar un MoE de 35B en un equipo integrado con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M sobre 35B de parámetros totales, lo que sitúa los pesos en el orden de 20 GB; a ello hay que sumar caché KV para 262.144 tokens de contexto, que puede ser muy voluminosa y no se ha cuantificado en la información disponible.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU NVIDIA: no soportadas por esta pila; el runtime es `hrx-loom` sobre ROCm.
- Cabe en GPU de consumo: no disponible; no se documenta soporte para Radeon RX de consumo ni para GPUs de 16 GB o menos.
- Opciones de despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. Alternativa de referencia: llama.cpp con el GGUF original, que es la base contra la que se comparan las puertas de corrección.
- Ajustes de ejecución relevantes: `--pool_backing=fixed` para reservar el pool de memoria por adelantado y `--parameter_mode=preload` para precargar pesos en host, lo que reduce el tiempo de arranque a costa de memoria de sistema.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| groxaxo-Qwen-AgentWorld-35B-A3B-loom (este paquete) | 35B totales, ~3B activos | 262.144 tokens (preset Loom) | MIT | Hugging Face, 0 descargas | Solo AMD (gfx1151, gfx1201); sin mediciones publicadas |
| groxaxo/Qwen-AgentWorld-35B-A3B-GGUF (checkpoint base) | 35B totales, ~3B activos | no disponible | MIT | Hugging Face | GGUF Q4_K_M portable; ejecutable con llama.cpp en múltiples backends |
| Qwen3-30B-A3B (familia de referencia) | 30B totales, ~3B activos | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Alternativa MoE de tamaño comparable; datos de rendimiento no verificados aquí |

La comparación relevante no es de calidad de modelo, ya que este paquete no altera los pesos, sino de vía de ejecución: frente al GGUF original servido con llama.cpp, el paquete Loom ofrece un endpoint compatible con OpenAI y verificación sha256 de los ficheros fuente, a cambio de limitarse a dos objetivos AMD y de no disponer todavía de mediciones de rendimiento ni de resultados de sus puertas de corrección.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son idénticos al GGUF `Qwen-AgentWorld-35B-A3B-Q4_K_M.gguf`; cualquier mejora o defecto del modelo base se hereda sin cambios.
- Ausencia total de evidencia publicada: 0 descargas, 0 likes y todas las puertas de corrección y filas de rendimiento marcadas como "not yet re-measured". No hay base empírica para afirmar paridad con llama.cpp en este paquete.
- Soporte de hardware muy restringido: solo se documentan gfx1151 y gfx1201; no hay soporte declarado para GPUs NVIDIA, ROCm en otras arquitecturas ni GPUs de consumo.
- Sin visión: aunque el modelo upstream admite entrada de imagen, Loom no la soporta, de modo que el paquete degrada esa capacidad.
- Muestreo no determinado: la tabla de características marca la fila `sampling` como "?", lo que impide garantizar reproducibilidad por semilla sin validación previa.
- Contexto de 262.144 tokens: la caché KV a esa longitud puede exceder la VRAM de una R9700 de 32 GB; no se han publicado curvas de memoria que permitan planificar el despliegue.
- Límite de 4.096 tokens de salida por preset, insuficiente para generaciones largas sin ajustar la configuración.
- Concurrencia máxima de 4 peticiones: no apto para cargas de producción con muchos usuarios simultáneos sin escalado horizontal.
- Idiomas soportados no documentados; no se puede asumir calidad multilingüe sin evaluarla.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben medirse sobre el modelo base antes de uso en producción.
- Licencia MIT declarada en el paquete y en el modelo base; conviene verificar las condiciones del checkpoint original de Qwen subyacente antes de un uso comercial.
- La búsqueda web realizada devuelve resultados sobre el producto de grabación de pantalla Loom y sobre la marca de ropa Loom, no relacionados con esta pila de inferencia; no se han podido verificar enlaces externos adicionales.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/groxaxo-Qwen-AgentWorld-35B-A3B-loom
- Checkpoint base GGUF: https://huggingface.co/groxaxo/Qwen-AgentWorld-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
