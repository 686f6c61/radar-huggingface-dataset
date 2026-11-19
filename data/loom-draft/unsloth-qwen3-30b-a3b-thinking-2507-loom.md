# loom-draft/unsloth-Qwen3-30B-A3B-Thinking-2507-loom

## Resumen

Este repositorio no contiene un modelo nuevo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` + `model.json`) generado a partir del checkpoint GGUF `Qwen3-30B-A3B-Thinking-2507-Q4_K_M.gguf` publicado por unsloth, que a su vez es una cuantización del modelo Qwen3-30B-A3B-Thinking-2507 de Alibaba Qwen. El autor del paquete es `loom-draft`, y el objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), mediante el runtime `loom-serve` del ecosistema Loom (hrx-system sobre ROCm).

El modelo subyacente es un transformer de tipo Mixture of Experts con 30.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B de Qwen3), en su variante "Thinking" con razonamiento siempre activo y una ventana de contexto de 262.144 tokens por petición según la model card del paquete. La cuantización empaquetada es Q4_K_M.

Su relevancia es doble: por un lado, demuestra la portabilidad de un MoE de 30B en cuantización de 4 bits a hardware AMD de consumo/prosumer con memoria unificada o 32 GB de VRAM; por otro, expone el estado del ecosistema Loom, cuyos resultados de rendimiento y corrección para este paquete aún no se han vuelto a medir. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), variante Thinking de Qwen3 (detalle fino no disponible en la informacion proporcionada) |
| Parametros totales | 30B (segun nomenclatura Qwen3-30B-A3B) |
| Parametros activos | ~3B (segun nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens por peticion (segun model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF empaquetado); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas Loom (`.loom`, `weights.loom`) |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | `/v1/chat/completions` estilo OpenAI |
| Tool calling | Si, estilo OpenAI (`tools` y `tool_calls`) |
| Razonamiento | Si, siempre activo |
| Decodificacion especulativa | No aplicable |
| Entrada de imagen / audio | No aplicable |

## Arquitectura y entrenamiento

El paquete hereda la arquitectura del checkpoint original Qwen3-30B-A3B-Thinking-2507: un transformer con capas de mezcla de expertos, 30B parámetros totales y ~3B activos por token, en modo "Thinking" con razonamiento encadenado siempre activado. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo original; esa información correspondería a la model card de Qwen, no a este repositorio.

La innovación técnica de este repositorio no está en el modelo sino en el empaquetado: `loom-next` genera programas Loom (kernels y grafo de ejecución) a partir del GGUF sin intervención de un LLM en el bucle, y `loom-serve` los ejecuta sobre ROCm con opciones como `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (precarga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU). El tokenizador se incluye como `tokenizer.json` y la configuración como `llm_config.json`.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" siempre activo.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, apto para bucles de agentes multi-turno.
- Conversaciones multi-turno con contexto de hasta 262.144 tokens por petición.
- Servicio concurrente de hasta 4 peticiones simultáneas.
- API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Capacidades de código y matemáticas: no documentadas explícitamente en este repositorio, aunque propias de la familia Qwen3; no disponible como dato verificado aquí.
- Multilingüismo: no disponible (la model card no lista idiomas).
- Sin soporte de visión, audio ni decodificación especulativa (marcados como no aplicables).
- Sin control de "reasoning effort": el razonamiento está siempre activo y no es configurable en este preset.

## Casos de uso

- Asistente de razonamiento largo en local: con 262.144 tokens de contexto, el modelo puede procesar documentación extensa, expedientes o bases de código completas en una sola petición sobre un APU Strix Halo con memoria unificada.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` estilo OpenAI permite construir agentes que consulten APIs, bases de datos o sistemas de ficheros en bucles multi-turno, con hasta 4 peticiones concurrentes por instancia.
- Automatización de soporte técnico: conversaciones multi-turno con historial largo gracias a la ventana de 256K, desplegado en una estación de trabajo con Radeon AI PRO R9700 de 32 GB sin depender de la nube.
- Generación y revisión de código en pipelines internos: al exponer una API compatible con OpenAI, puede conectarse a herramientas de CI/CD o a asistentes de IDE que ya hablan ese protocolo.
- Procesamiento de documentos jurídicos o técnicos: el modo thinking siempre activo favorece tareas de análisis que requieren cadena de razonamiento explícita, con salida limitada a 4.096 tokens por respuesta.
- Evaluación de hardware AMD para inferencia: el paquete sirve como banco de pruebas reproducible de `loom-serve` frente a llama.cpp en gfx1151 y gfx1201, útil para equipos que evalúan ROCm para despliegue de MoE cuantizados.
- Prototipado sin GPU NVIDIA: permite validar flujos de agentes y RAG sobre hardware AMD antes de migrar a un clúster con GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, etc.) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM/memoria: el checkpoint es Q4_K_M de un MoE de 30B; el paquete está pensado para Strix Halo (memoria unificada del Ryzen AI Max+ 395) y para Radeon AI PRO R9700 con 32 GB de VRAM. No se especifica el consumo exacto de memoria en la información disponible.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs NVIDIA: no disponible; el paquete está generado para el runtime AMD Loom sobre ROCm.
- Despliegue: `hrx-loom[hf]==0.2.0` (instalación vía pipx), `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete; llama.cpp se usa únicamente como referencia de corrección.
- Opciones de ejecución: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU).
- Latencia y throughput: no disponibles; la model card no incluye mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Este paquete (Qwen3-30B-A3B-Thinking-2507 Q4_K_M para Loom) | 30B totales, ~3B activos | 262.144 tokens | Apache 2.0 | Loom sobre ROCm (gfx1151, gfx1201) | Rendimiento y correccion aun no medidos |
| unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF | 30B totales, ~3B activos | No disponible en la informacion proporcionada | Apache 2.0 (heredada) | GGUF para llama.cpp y derivados | Checkpoint de origen del paquete |
| Qwen3-30B-A3B-Thinking-2507 (original) | 30B totales, ~3B activos | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors y ecosistema Hugging Face | Modelo base de Alibaba Qwen |
| Alternativas de tamano similar (p. ej. otros MoE de ~30B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Paquete sin validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured"; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Razonamiento siempre activo y no configurable: no existe control de "reasoning effort", lo que incrementa tokens generados y latencia en tareas simples.
- Límite de salida de 4.096 tokens por respuesta (preset `max_tokens`), que puede truncar razonamientos largos aunque el contexto de entrada sea de 262.144 tokens.
- Concurrencia limitada a 4 peticiones; no apto para despliegues de alta concurrencia sin escalado horizontal.
- Sin soporte de visión ni audio, y sin decodificación especulativa.
- Idiomas soportados no documentados en este repositorio; no se puede garantizar cobertura multilingüe solo con esta ficha.
- Riesgo de alucinación y sesgos: propios del modelo Qwen3 subyacente; no se documentan evaluaciones de sesgo en este paquete.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del checkpoint base de Qwen y de la cuantización de unsloth antes de producción.
- Dependencia de hardware AMD específico (gfx1151, gfx1201) y de la versión `hrx-loom==0.2.0`; cambios de runtime o de firmware ROCm pueden afectar la reproducibilidad.
- Repositorio con 0 descargas y 0 likes: sin comunidad que haya validado el paquete en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-30B-A3B-Thinking-2507-loom
- Checkpoint base (unsloth): https://huggingface.co/unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
