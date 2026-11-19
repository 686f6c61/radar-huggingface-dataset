# loom-draft/ManniX-ITA-Qwen3.6-27B-A3B-CoderX-MTP-loom

## Resumen

ManniX-ITA-Qwen3.6-27B-A3B-CoderX-MTP-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) publicado por el usuario `loom-draft` para servir el checkpoint GGUF sin modificar `ManniX-ITA/Qwen3.6-27B-A3B-CoderX-MTP-GGUF`, en su cuantización Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune adicional: es un artefacto de empaquetado generado con la herramienta `loom-next` que traduce los pesos GGUF existentes a kernels ejecutables sobre GPUs AMD, concretamente la AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del paquete es la integración con la pila `hrx-loom` (versión 0.2.0), que expone un servidor compatible con la API OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento activado por defecto y decodificación especulativa mediante MTP con profundidad 3. Según la model card, el preset admite 262.144 tokens de contexto por petición, hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB y la propia tarjeta indica que las medidas de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `spec`, `agent`, etc.) aún no se han vuelto a medir para este paquete. Debe tratarse, por tanto, como un artefacto en estado preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según el nombre del modelo base: 27B totales, A3B activos); detalles internos no disponibles |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | 3B (según nombre del modelo base, sufijo A3B) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Qwen3.6-27B-A3B-CoderX-Q4_K_M.gguf), empaquetado como paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyacente. Lo único deducible del nombre del checkpoint base es que se trata de un modelo de mezcla de expertos (MoE) de 27.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, orientado a código (sufijo `CoderX`) y con capacidad de predicción multi-token (MTP) para decodificación especulativa. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

La contribución técnica del repositorio es el empaquetado Loom: `loom-next` genera kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF original, junto con un `model.json` que fija los parámetros de servicio (contexto, concurrencia, `max_tokens`, decodificación especulativa). El servidor `loom-serve` permite ajustar el comportamiento con opciones como `--pool_backing=fixed` (reserva anticipada del pool de memoria), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, a costa de consumo de CPU).

## Capacidades

- Generación de texto y código: el checkpoint base está etiquetado como `CoderX`, lo que sugiere especialización en tareas de programación, aunque no se documentan evaluaciones concretas.
- Razonamiento con modo "thinking": activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling: soporte de `tools` y `tool_calls` en formato OpenAI.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Servidor compatible con la API OpenAI (`/v1/chat/completions`).
- Concurrencia de hasta 4 peticiones simultáneas.
- Ventana de contexto de 262.144 tokens por petición.
- Sin entrada de imagen: la tarjeta marca "image input" como no aplicable.
- Sin entrada ni salida de audio: marcado como no aplicable.
- "Reasoning effort": no aplicable en este preset.
- Muestreo (sampling): estado "no determinado" en la tabla de características.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistencia de código en local sobre hardware AMD: el paquete está pensado para ejecutarse en Strix Halo o R9700 sin depender de CUDA, lo que permite desplegar un modelo de código de 27B (3B activos) en estaciones de trabajo con GPU AMD.
- Repositorio de código con contexto largo: con 262.144 tokens por petición se pueden indexar varios ficheros o un módulo completo en una sola conversación para tareas de revisión, refactorización o explicación.
- Agentes de tool calling: el soporte de `tools`/`tool_calls` en formato OpenAI permite integrarlo en bucles multi-turno (por ejemplo, un agente que consulta una API de issues y aplica parches), siempre que se validen las puertas `agent` y `agent_think_off`, que aún no tienen medidas registradas.
- Servicio interno compatible con OpenAI: al exponer `/v1/chat/completions`, puede sustituir a un endpoint remoto en herramientas que ya hablan el protocolo OpenAI, apuntando a `http://127.0.0.1:8080`.
- Prototipado con razonamiento explícito: el modo thinking activado por defecto resulta útil para depuración de lógica y explicación de decisiones, y puede desactivarse para reducir latencia en tareas simples.
- Evaluación de la pila Loom frente a llama.cpp: el paquete incluye puertas de comparación (`golden`, `compare`, `spec`, `sampling`, `logits`) pensadas para verificar equivalencia con la referencia llama.cpp sobre el mismo GGUF, lo que lo hace útil como banco de pruebas de la propia herramienta.
- Despliegue en Radeon AI PRO R9700 de 32 GB: la cuantización Q4_K_M de un MoE de 27B encaja en los 32 GB de la tarjeta, lo que permite servir el modelo en una única GPU profesional AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay cifras de throughput ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras oficiales; la cuantización Q4_K_M de un modelo de 27B totales ronda los 16-17 GB de pesos, pero el paquete no publica el consumo real de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels para arquitecturas AMD concretas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295 --pool_backing=fixed --parameter_mode=preload`.
- Alternativa de despliegue: el GGUF original puede servirse con llama.cpp, que la propia tarjeta usa como referencia de corrección.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ManniX-ITA-Qwen3.6-27B-A3B-CoderX-MTP-loom | 27B totales / 3B activos (MoE) | 262.144 | apache-2.0 | Paquete Loom + GGUF Q4_K_M | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| ManniX-ITA/Qwen3.6-27B-A3B-CoderX-MTP-GGUF (modelo base) | 27B totales / 3B activos (MoE) | no disponible | apache-2.0 | GGUF | Checkpoint original sin empaquetar; sirve como referencia llama.cpp |
| llama.cpp (runtime) | no aplica | según modelo | MIT (runtime) | GGUF | Runtime de referencia usado por las puertas de corrección del paquete |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado preliminar: el repositorio tiene 0 descargas y 0 likes, y todas las puertas de corrección y medidas de rendimiento figuran como "not yet re-measured". No hay evidencia publicada de que la salida coincida con la referencia llama.cpp en este paquete concreto.
- Compatibilidad de hardware muy restringida: solo se declaran soportadas la Ryzen AI Max+ 395 (gfx1151) y la Radeon AI PRO R9700 (gfx1201). No hay soporte documentado para GPUs NVIDIA ni para otras AMD.
- Idiomas no documentados: la ficha de Hugging Face no lista idiomas soportados, por lo que no puede asumirse un comportamiento multilingüe verificado.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia: apache-2.0 según los metadatos, lo que en principio permite uso comercial, pero debe verificarse en el repositorio del modelo base, ya que esta licencia se hereda del checkpoint original.
- Muestreo no determinado: la tabla de características marca el estado del sampling como "?", lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed`.
- Límite de salida de 4.096 tokens por defecto: puede ser insuficiente para generación de código extensa o razonamientos largos sin ajustar el preset.
- Concurrencia limitada a 4 peticiones: no apto para despliegues de alta concurrencia sin escalado horizontal.
- Ausencia de visión y audio: confirmada como no aplicable en la tarjeta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/ManniX-ITA-Qwen3.6-27B-A3B-CoderX-MTP-loom
- Modelo base (GGUF): https://huggingface.co/ManniX-ITA/Qwen3.6-27B-A3B-CoderX-MTP-GGUF
- Repositorio de la pila de runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
