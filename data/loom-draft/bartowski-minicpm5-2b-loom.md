# loom-draft/bartowski-MiniCPM5-2B-loom

## Resumen

`bartowski-MiniCPM5-2B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF `MiniCPM5-2B-Q4_K_M.gguf` publicado por bartowski. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que traduce los pesos originales de MiniCPM5-2B a un formato ejecutable por el runtime Loom, orientado específicamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). La generación se realizó con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El modelo subyacente, MiniCPM5-2B, es un transformer de aproximadamente 2.000 millones de parámetros distribuido originalmente por OpenBMB (no confirmado en la información disponible). El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporta modo de razonamiento opcional (desactivado por defecto), ventana de contexto de 131.072 tokens por petición y hasta 4 peticiones concurrentes.

La relevancia de este artefacto es acotada pero concreta: permite ejecutar un modelo de 2B cuantizado en Q4_K_M sobre hardware AMD consumer y profesional con ROCm, sin depender de llama.cpp, mediante kernels generados específicamente. Sin embargo, el propio autor indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, etc.) aún no se han re-medido para este paquete, por lo que no hay evidencia publicada de rendimiento ni de fidelidad frente a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5-2B; detalles de atención y capas no disponibles) |
| Parametros totales | ~2.000 millones (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas `.loom` + `weights.loom` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Tool calling | no soportado (marcado como "not applicable") |
| Vision / audio | no soportado (marcado como "not applicable") |
| Decodificación especulativa | no soportada (marcado como "not applicable") |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Lo que sí se documenta es el pipeline de empaquetado: `loom-next` genera programas `.loom` y un fichero `weights.loom` a partir del GGUF de bartowski, junto con `tokenizer.json` y `llm_config.json`. El runtime `loom-serve` (versión `hrx-loom[hf]==0.2.0`) ejecuta esos programas sobre GPU AMD mediante ROCm, con opciones como `--pool_backing=fixed` (reserva de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host antes del servicio).

El modo de razonamiento se controla mediante `chat_template_kwargs: {"enable_thinking": true}` y está desactivado por defecto. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna innovación técnica como decodificación especulativa o atención lineal. Toda esa información correspondería a la model card del MiniCPM5-2B original, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional ("thinking"), desactivado por defecto y activable por petición.
- Ventana de contexto larga: 131.072 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset).
- Tool calling: no soportado según la tabla de características del autor.
- Entrada de imagen y audio: no soportada.
- Decodificación especulativa: no soportada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-paso o comportamiento agéntico: no documentado; las puertas `agent` y `agent_think_off` existen pero no tienen medición registrada.

## Casos de uso

- Despliegue local en AMD Strix Halo: un desarrollador con un Ryzen AI Max+ 395 puede servir el modelo con `loom-serve` y consumirlo desde una aplicación cliente mediante la API OpenAI, sin depender de llama.cpp ni de CUDA. Adecuado por la integración específica con gfx1151.
- Despliegue en Radeon AI PRO R9700: en una estación de trabajo con 32 GB de VRAM, el paquete permite servir el modelo con hasta 4 peticiones concurrentes, útil para prototipos internos o herramientas de asistencia en escritorio.
- Evaluación de la cadena de herramientas Loom: investigadores que quieran comparar el runtime Loom frente a llama.cpp sobre el mismo GGUF pueden usar este paquete como banco de pruebas, aunque las puertas de corrección aún no estén re-medidas.
- Asistente conversacional de contexto largo: con 131.072 tokens por petición, encaja en tareas de resumen o Q&A sobre documentos extensos, siempre que se acepte el límite de 4.096 tokens de salida.
- Generación de texto en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de copyleft, sujeto a las condiciones del modelo base.
- Pruebas de razonamiento con "thinking" activado: permite comparar respuestas con y sin modo de razonamiento en el mismo checkpoint, útil para calibrar latencia frente a calidad en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y para Radeon AI PRO R9700 "no se han re-medido todavía", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". Tampoco se aportan datos de MMLU, HumanEval, GSM8K ni similares para el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de ~2B, lo que en la práctica ronda los 1,5-2 GB de pesos, pero el runtime Loom reserva un pool de memoria fijo (`--pool_backing=fixed`) cuyo tamaño no se documenta.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete está orientado a las dos plataformas AMD citadas, no a RTX 4090 ni a GPU NVIDIA en general.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han re-medido.
- Ajustes relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` y `--parameter_mode=preload`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski-MiniCPM5-2B-loom | ~2B | 131.072 | `.loom` (GGUF origen) | Apache 2.0 | Paquete para GPU AMD vía runtime Loom; sin benchmarks publicados |
| bartowski/MiniCPM5-2B-GGUF | ~2B | no disponible | GGUF | Apache 2.0 (según base) | Checkpoint de origen; ejecutable con llama.cpp |
| MiniCPM5-2B (original) | ~2B | no disponible | safetensors (presumible) | no disponible | Modelo base; datos de entrenamiento y benchmarks no disponibles |

No se dispone de información sobre alternativas comparables de otros desarrolladores en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- El paquete no ha sido validado: todas las puertas de corrección figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- No hay mediciones de rendimiento ni de latencia para ninguna de las dos GPU objetivo.
- Tool calling, visión, audio y decodificación especulativa no están soportados, lo que descarta flujos agénticos y pipelines multimodales.
- El límite de salida de 4.096 tokens puede ser insuficiente para generación de documentos largos.
- El muestreo figura como "not determined": no está claro si `temperature`, `top_k` y `seed` se comportan de forma conforme a lo especificado.
- Idiomas soportados no disponibles; no se puede garantizar calidad en castellano sin evaluar el modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo de 2B, la tasa de alucinación esperable es mayor que en modelos de mayor tamaño, pero no hay datos que lo cuantifiquen.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo base MiniCPM5-2B antes de uso comercial.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (2026-11-19), lo que sugiere un artefacto reciente y sin adopción verificable.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de las plataformas gfx1151/gfx1201; no hay garantía de portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-MiniCPM5-2B-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/MiniCPM5-2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
