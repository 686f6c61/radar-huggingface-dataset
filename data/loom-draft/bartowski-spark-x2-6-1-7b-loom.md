# loom-draft/bartowski-Spark-X2.6-1.7B-loom

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje de 1.700 millones de parametros distribuido originalmente en formato GGUF por bartowski. Este repositorio concreto, publicado por loom-draft, no contiene pesos nuevos ni un fine-tuning: es un paquete de despliegue en formato `.loom` que empaqueta el checkpoint sin modificar `Spark-X2.6-1.7B-Q4_K_M.gguf` junto con programas generados para el runtime Loom (herramienta `loom-next`, del ecosistema HRX/ROCm). El objetivo es servir el modelo sobre GPUs AMD especificas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La relevancia es de infraestructura mas que de modelado: Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y modo de razonamiento, y permite ejecutar el GGUF en hardware AMD sin pasar por llama.cpp. El paquete declara una ventana de contexto de 262.144 tokens por peticion y 4 peticiones concurrentes, aunque las mediciones de rendimiento y las puertas de correccion del autor aparecen como "not yet re-measured" en el momento de la publicacion.

Conviene subrayar que la informacion disponible sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks) no esta incluida en esta ficha: el autor del paquete no la documenta y la model card se limita al empaquetado y al despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-1.7B) |
| Parametros totales | 1.700 millones (1.7B, segun nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete incluye solo esa variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Spark-X2.6-1.7B-Q4_K_M.gguf`) empaquetado como programas `.loom` + `weights.loom` |
| Modelo base | bartowski/Spark-X2.6-1.7B-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimensiones ocultas) ni sobre su proceso de entrenamiento (volumen de tokens, composicion del corpus, RLHF/DPO). Esta ficha documenta el paquete de despliegue, no el modelo original.

Lo que si se detalla es la capa de ejecucion: `loom-next` genera programas `.loom` (kernels y grafo de ejecucion) a partir del GGUF sin modificar los pesos, y `loom-serve` los ejecuta sobre ROCm. El paquete incluye `model.json`/`model.json.lock` con los hashes sha256 de los ficheros fuente, `tokenizer.json`, `llm_config.json` y los programas generados. El generador se ejecuto sin LLM en el bucle, segun la model card. Se ofrecen dos modos de carga relevantes: `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga anticipada de pesos en host), ademas de `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con bucle multi-turno validado por la puerta `agent`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low` y `high` (por defecto `high`).
- Contexto largo: 262.144 tokens por peticion, adecuado para documentos extensos.
- Concurrencia de 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas (puerta `consistency`).
- Sin soporte de decodificacion especulativa, entrada de imagen ni audio (marcados como no aplicables).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autohospedado en estaciones AMD: el paquete permite servir el modelo en un Ryzen AI Max+ 395 o una R9700 con `loom-serve`, exponiendo un endpoint compatible con OpenAI que cualquier cliente existente puede consumir sin cambios.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por peticion, se pueden pasar contratos, informes o bases de codigo completas en una sola llamada para resumen, extraccion o preguntas sobre el contenido.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs, bases de datos o sistemas internos, con `reasoning_effort` ajustable para equilibrar latencia y calidad.
- Razonamiento controlado por coste: activar `reasoning_effort: low` para tareas simples y `high` para problemas complejos, o desactivar el thinking por completo en flujos de baja latencia como clasificacion o extraccion.
- Despliegue en hardware AMD sin CUDA: equipos con Radeon AI PRO R9700 (32 GB) pueden ejecutar el modelo en local para prototipado, pruebas de integracion o entornos con requisitos de soberania de datos, sin depender de GPU NVIDIA.
- Evaluacion y benchmarking de runtimes: el paquete incluye puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `logits`, `sampling`, etc.) que permiten comparar Loom contra llama.cpp token a token sobre el mismo GGUF.
- Integracion en pipelines de CI: al fijar hashes sha256 en `model.json.lock`, `loom-fetch` garantiza reproducibilidad del artefacto desplegado, util para entornos con auditoria de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201). Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured", es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un checkpoint de 1.7B en Q4_K_M ocupa del orden de 1 GB en pesos, aunque el pool de memoria de Loom y el contexto de 262.144 tokens incrementan el consumo de forma significativa (la KV cache crece con la longitud de contexto).
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete esta generado especificamente para los targets AMD anteriores y no se documenta soporte para otras GPU.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue: el GGUF base puede servirse con llama.cpp, Ollama u otros runtimes compatibles con GGUF, aunque el paquete `.loom` solo funciona con hrx-loom.
- Latencia y throughput: no disponibles (no se han publicado mediciones para este paquete).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento del modelo base que permitan una comparacion cuantitativa con alternativas de 1-2B parametros.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni resultados de las puertas de correccion: no hay evidencia publicada de que la salida coincida con llama.cpp en este hardware.
- El modelo base (Spark-X2.6-1.7B) no esta documentado en esta ficha: se desconocen arquitectura, datos de entrenamiento, sesgos e idiomas soportados.
- Riesgo de alucinacion: inherente a modelos de 1.7B parametros; no se han publicado evaluaciones de fidelidad.
- Limitacion de hardware: solo se declara soporte para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPU AMD o NVIDIA.
- El limite de salida por defecto es de 4.096 tokens (preset `max_tokens`), muy inferior a la ventana de contexto de 262.144 tokens.
- La concurrencia esta limitada a 4 peticiones simultaneas, lo que restringe el uso en produccion con alta carga.
- El muestreo figura como "not determined": no hay garantia documentada sobre el comportamiento de `temperature`, `top_k` y `seed`.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un paquete de despliegue conviene verificar la licencia del modelo base por separado.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia (2026-11-19): madurez y mantenimiento no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Spark-X2.6-1.7B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Spark-X2.6-1.7B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
