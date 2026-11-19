# loom-draft/mradermacher-Gemory-26B-A4B-SOMPOA-i1-loom

## Resumen

Gemory-26B-A4B-SOMPOA-i1-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF`, concretamente el fichero `Gemory-26B-A4B-SOMPOA.i1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está orientado a dos aceleradores AMD concretos: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata, por tanto, de un modelo entrenado desde cero, sino de un artefacto de empaquetado e inferencia para el runtime Loom sobre ROCm.

El modelo subyacente es un Gemory de 26B con arquitectura MoE (la nomenclatura A4B indica aproximadamente 4B de parámetros activos), cuantizado en Q4_K_M y con una ventana de contexto declarada de 201.728 tokens por petición. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling y un modo de razonamiento opcional desactivado por defecto. La generación se realizó con la herramienta `loom-next`, sin intervención de un LLM en el bucle.

Su relevancia es acotada pero específica: cubre el nicho de ejecución de un MoE de 26B en hardware AMD de consumo y estación de trabajo (Strix Halo y R9700) mediante un runtime alternativo a llama.cpp, con verificación de correctitud por compuertas. En el momento de la publicación, el repositorio tiene 0 descargas y 0 likes, y las mediciones de rendimiento y correctitud figuran como "not yet re-measured" para ambas plataformas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (modelo base Gemory-26B-A4B; detalles internos no disponibles) |
| Parámetros totales | 26B (según nomenclatura del modelo base) |
| Parámetros activos | ~4B (según nomenclatura "A4B") |
| Longitud de contexto | 201.728 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete Loom (`.loom` + `model.json`) |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | Loom (`hrx-loom[hf]==0.2.0`) sobre ROCm |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo subyante. Por la nomenclatura, Gemory-26B-A4B es un transformer con mezcla de expertos (MoE) de 26B parámetros totales y aproximadamente 4B activos por token, lo que sitúa su coste de cómputo por token en el rango de un modelo denso de 4B. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones de atención (atención lineal, decodificación especulativa u otras); de hecho, la tarjeta indica explícitamente que la decodificación especulativa "not applicable" en este paquete.

La contribución técnica del artefacto es el empaquetado para Loom: el GGUF Q4_K_M se sirve mediante kernels generados para gfx1151 y gfx1201, con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). El paquete incorpora un conjunto de compuertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, con tokens greedy y top-5 log-probs sobre prompts cortos y documentos de 1k a 32k. Para esta publicación, todas las compuertas figuran como no re-medidas.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el parámetro `tools` y devuelve `tool_calls` estructurados.
- Modo de razonamiento (thinking) opcional, desactivado por defecto y activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Contexto largo de hasta 201.728 tokens por petición, adecuado para documentos extensos y conversaciones prolongadas.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles (no documentadas).
- Visión: el modelo upstream la tiene, pero Loom no la soporta en este paquete.
- Audio de entrada y salida: el modelo upstream lo tiene, pero Loom no lo soporta en este paquete.
- Razonamiento por esfuerzo (reasoning effort): no aplicable.
- Decodificación especulativa: no aplicable en este paquete.

## Casos de uso

- Asistente conversacional autohospedado en estación de trabajo AMD: con una Radeon AI PRO R9700 de 32 GB, el paquete Q4_K_M permite servir un MoE de 26B con 4 peticiones concurrentes y 201.728 tokens de contexto, suficiente para atención al cliente interna o asistentes de documentación sin depender de la nube.
- Procesamiento de documentos largos: contratos, informes técnicos o expedientes de decenas de miles de tokens caben en una sola petición, lo que permite tareas de resumen, extracción de cláusulas y preguntas sobre el documento sin troceado previo.
- Agentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` y las compuertas `agent` y `agent_think_off` del paquete están pensados para bucles multi-turno de llamadas a herramientas, por ejemplo consulta a bases de datos o APIs REST internas.
- Prototipado en hardware Strix Halo: un APU Ryzen AI Max+ 395 permite ejecutar el modelo en un equipo compacto sin GPU discreta, útil para demos, desarrollo de agentes y pruebas de integración antes de desplegar en servidores.
- Evaluación de runtimes alternativos: el paquete sirve para comparar Loom frente a llama.cpp sobre el mismo GGUF mediante las compuertas `golden`, `compare` y `logits`, que verifican igualdad de tokens greedy y top-5 log-probs.
- Generación asistida con razonamiento opcional: para tareas que requieren cadena de pensamiento (análisis, planificación, resolución de problemas), se puede activar `enable_thinking` por petición sin cambiar de modelo, manteniendo el modo rápido por defecto para cargas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las compuertas de correctitud figuran como no re-medidas.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 26B parámetros totales; el peso de los pesos ronda los 15-16 GB en esa cuantización, a lo que hay que sumar el contexto KV cache para hasta 201.728 tokens y el pool fijo del runtime. La cifra exacta no está publicada.
- GPU objetivo declaradas: AMD Radeon AI PRO R9700 (32 GB, gfx1201) y APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU NVIDIA: no soportadas por este paquete, que está generado específicamente para AMD vía ROCm.
- Cabe en GPU de consumo: sí, en el sentido de que Strix Halo es un APU de consumo con memoria unificada; no se documenta soporte para GPUs de consumo discretas de NVIDIA ni de AMD distintas de las dos citadas.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servir. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este artefacto; llama.cpp se usa únicamente como referencia de correctitud.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecución).
- Configuración recomendada por el autor: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización del paquete | Licencia | Runtime / hardware |
|---|---|---|---|---|---|---|
| Gemory-26B-A4B-SOMPOA-i1-loom | 26B | ~4B | 201.728 | Q4_K_M | Apache 2.0 | Loom / AMD gfx1151 y gfx1201 |
| Gemory-26B-A4B-SOMPOA-i1-GGUF (base) | 26B | ~4B | no disponible | GGUF (varias) | Apache 2.0 | llama.cpp y otros runtimes GGUF |
| MoE de ~26B con ~4B activos en formato GGUF para llama.cpp | 26B | ~4B | según modelo | GGUF | según modelo | llama.cpp / CPU y GPU diversas |

La comparación relevante es contra el propio checkpoint base: el paquete Loom no modifica los pesos, sino que cambia el runtime y restringe el hardware a dos aceleradores AMD. Frente a un despliegue estándar en llama.cpp, la diferencia está en el soporte de API OpenAI nativa, el pool de memoria fijo y las compuertas de correctitud, no en la calidad del modelo. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: la calidad de salida depende íntegramente del checkpoint base `mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF`, sobre el que no se documentan sesgos ni evaluación.
- Sin evidencia de correctitud publicada: todas las compuertas (`golden`, `compare`, `logits`, `agent`, `sampling`, etc.) figuran como no re-medidas, por lo que no hay verificación publicada de que la salida coincida con la referencia de llama.cpp en este paquete.
- Rendimiento sin medir: no hay cifras de latencia ni throughput para ninguna de las dos plataformas objetivo.
- Hardware muy restringido: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte documentado para GPUs NVIDIA, otras AMD o CPU.
- Sin visión ni audio: aunque el modelo upstream los soporta, Loom no los implementa en este paquete, lo que limita casos de uso multimodales.
- Concurrencia baja: 4 peticiones simultáneas, insuficiente para cargas de producción con muchos usuarios concurrentes.
- Límite de salida de 4.096 tokens por respuesta (preset `max_tokens`), que puede ser corto para generación extensa.
- Idiomas no documentados: no se especifica qué lenguas cubre el modelo, lo que impide garantizar calidad en castellano u otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia y procedencia del checkpoint base y de los datos de entrenamiento originales, no documentados en esta ficha.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación comunitaria.
- Riesgo de alucinación: no evaluado para este modelo; aplicable el riesgo habitual de los LLM sin datos específicos de mitigación.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Gemory-26B-A4B-SOMPOA-i1-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
