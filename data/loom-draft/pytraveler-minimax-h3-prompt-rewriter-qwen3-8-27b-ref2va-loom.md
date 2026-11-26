# loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-loom

## Resumen

`loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF`, en su variante Q4_K_M. No es un modelo entrenado desde cero ni un fine-tune nuevo: es un artefacto de empaquetado que traduce los pesos GGUF existentes a un formato ejecutable por el runtime `hrx-loom` sobre GPUs AMD concretas.

El objetivo del paquete es servir el modelo en hardware AMD de consumo y estación de trabajo: el AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento configurable, entrada de imagen mediante un proyector multimodal y una ventana de contexto de 262.144 tokens por petición.

Por el nombre del checkpoint base, el modelo subyacente es un reescritor de prompts («Prompt Rewriter») de 27B derivado de la familia Qwen3, con capacidades de visión (`image-text-to-text`) y una variante orientada a referencias visuales («Ref2VA»). La relevancia actual del paquete es que demuestra la portabilidad de un GGUF de 27B multimodal a un stack de inferencia propio sobre ROCm, sin depender de llama.cpp en tiempo de ejecución, aunque las mediciones de rendimiento y corrección del paquete todavía no se han vuelto a medir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun el nombre del checkpoint base); detalles no disponibles |
| Parametros totales | 27B (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-Q4_K_M.gguf`) + proyector `mmproj-...-F16.gguf`; empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente. Por el nombre del checkpoint base se infiere una arquitectura transformer de la familia Qwen3 con 27.000 millones de parametros, adaptada como reescritor de prompts y con soporte de entrada de imagen mediante un proyector multimodal separado (`mmproj-...-F16.gguf`). No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovacion tecnica del artefacto no esta en el modelo, sino en el empaquetado: `loom-next` genera kernels y programas `.loom` especificos para gfx1151 y gfx1201, de modo que el mismo GGUF se ejecuta sobre el runtime `hrx-loom` con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros (`--parameter_mode=preload`). El paquete declara soporte de decodificacion especulativa como «no aplicable» y no incluye un modo de muestreo determinado (`sampling: not determined`).

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Esfuerzo de razonamiento configurable mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Entrada de imagen estilo OpenAI mediante partes `image_url`, procesadas por el proyector multimodal F16.
- Ventana de contexto de 262.144 tokens por peticion, adecuada para documentos largos o historiales extensos.
- Concurrencia de hasta 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por peticion (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- Sin soporte de audio ni de salida de audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Reescritura y optimizacion de prompts para modelos generativos: el modelo esta disenado especificamente como «Prompt Rewriter», por lo que puede recibir una instruccion escueta y devolver una version ampliada, estructurada y con referencias visuales, apropiada para alimentar un generador de imagen o video.
- Generacion de prompts con referencia visual: gracias a la entrada de imagen y a la variante «Ref2VA», se puede adjuntar una imagen de referencia y pedir al modelo que describa el estilo, la composicion y los atributos necesarios para reproducirla en otro sistema generativo.
- Asistentes con acceso a herramientas: el soporte de `tools`/`tool_calls` y el modo de agente multi-turno permiten construir asistentes que consulten APIs externas, bases de datos o servicios internos y encadenen varias llamadas antes de responder.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes tecnicos o expedientes completos en una sola peticion sin trocear el texto, manteniendo la coherencia entre secciones.
- Despliegue en estaciones de trabajo AMD sin NVIDIA: el paquete esta pensado para Strix Halo y Radeon AI PRO R9700, de modo que equipos con ROCm pueden servir un modelo de 27B multimodal sin depender de CUDA ni de llama.cpp en produccion.
- Evaluacion comparativa de runtimes: al conservar el GGUF original y ofrecer puertas de correccion (`golden`, `compare`, `vision`, `agent`) frente a la referencia de llama.cpp, sirve para validar la fidelidad numerica del runtime `hrx-loom` en hardware AMD antes de adoptarlo.
- Prototipado de pipelines multimodales: la API compatible con OpenAI permite sustituir un endpoint remoto por este paquete local sin reescribir el codigo cliente, util para pruebas de integracion con datos sensibles que no deben salir de la maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambas indica explicitamente que «the results for this package are not yet re-measured». Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`) figuran igualmente como «not yet re-measured» para ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es un GGUF Q4_K_M de un modelo de 27B, y el paquete esta dirigido a una GPU de 32 GB (Radeon AI PRO R9700) y a un sistema integrado con memoria unificada (Strix Halo).
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU de consumo: no confirmada; el paquete solo declara soporte para los dos destinos AMD anteriores. No se mencionan RTX 4090, A100 ni H100.
- Opciones de despliegue: runtime `hrx-loom` (version 0.2.0, instalable con `pipx install "hrx-loom[hf]==0.2.0"`), con los comandos `loom-fetch` y `loom-serve`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque el GGUF base si es un formato habitual en llama.cpp.
- Parametros de servicio relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizacion en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el artefacto es un empaquetado especifico para hardware AMD mas que un modelo con benchmarks publicados. Como referencia estructural, el unico punto de comparacion mencionado es el propio checkpoint base `pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF`, del que este paquete hereda pesos, licencia MIT y capacidades multimodales.

## Limitaciones y advertencias

- El paquete no ha sido re-medido: rendimiento, correccion numerica y fidelidad frente a llama.cpp figuran como pendientes en todas las puertas declaradas.
- El muestreo no esta determinado (`sampling: not determined`), lo que impide garantizar un comportamiento reproducible con `temperature`, `top_k` y `seed` hasta que se valide.
- La decodificacion especulativa no es aplicable en este paquete.
- El limite de salida es de 4.096 tokens por peticion, muy inferior a la ventana de contexto de 262.144 tokens; las tareas que requieran respuestas largas necesitaran trocear la generacion.
- Solo se declaran dos destinos de hardware AMD; no hay evidencia de funcionamiento en GPUs NVIDIA, Apple Silicon ni CPU.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica del modelo subyacente.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los artefactos pueden no estar materializados o que el paquete es un borrador (`loom-draft`).
- Aunque la licencia declarada es MIT, conviene verificar la licencia del checkpoint base y de los datos de entrenamiento antes de un uso comercial en produccion.
- El modelo esta orientado a reescritura de prompts; usarlo fuera de ese dominio puede degradar la calidad frente a un modelo generalista del mismo tamano.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/pytraveler-MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-loom
- Checkpoint base GGUF: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
