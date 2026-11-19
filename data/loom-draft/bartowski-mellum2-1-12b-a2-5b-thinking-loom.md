# loom-draft/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom

## Resumen

Mellum2.1-12B-A2.5B-Thinking es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 12 000 millones de parámetros totales y 2500 millones de parámetros activos por token, según se deduce de su denominación. Esta ficha concreta, publicada por el usuario `loom-draft`, no contiene los pesos originales del modelo, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF cuantizado Q4_K_M de bartowski.

El paquete está orientado exclusivamente a la inferencia sobre GPUs AMD: el AMD Ryzen AI Max+ 395 "Strix Halo" (arquitectura gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Loom es un runtime alternativo a llama.cpp que compila kernels específicos para el hardware objetivo y expone una API compatible con OpenAI en `/v1/chat/completions`.

La relevancia de esta publicación es fundamentalmente de infraestructura: permite ejecutar un modelo MoE con modo de razonamiento ("thinking") y soporte de tool calling sobre hardware AMD de consumo y profesional, con una ventana de contexto de 131 072 tokens por petición y hasta 4 peticiones concurrentes. No se han publicado resultados de rendimiento ni de corrección para este paquete concreto: todas las puertas de validación aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de capas y atención no disponibles |
| Parametros totales | 12B (según denominación del modelo) |
| Parametros activos | 2.5B por token (según denominación del modelo) |
| Longitud de contexto | 131 072 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no disponibles en esta ficha |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Mellum2.1-12B-A2.5B-Thinking-Q4_K_M.gguf`) empaquetado como paquete Loom (`.loom` + `model.json`) |
| Tokens máximos de salida | 4096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | Compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza MoE con 12B parámetros totales y 2.5B activos. No se especifican el número de expertos, el número de capas, la dimensión oculta, el tipo de atención ni si emplea mecanismos adicionales como atención lineal o decodificación especulativa. La tarjeta del paquete Loom indica explícitamente que la decodificación especulativa no es aplicable en este runtime.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición del dataset), las fases de alineación (RLHF, DPO) ni innovaciones técnicas del preentrenamiento. El único dato técnico verificable es que el modelo incorpora un modo de razonamiento ("thinking") activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. El paquete Loom en sí no modifica el checkpoint GGUF: se trata del mismo fichero de bartowski, recompilado a kernels específicos para AMD mediante `loom-next`, un generador que opera sin LLM en el bucle.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento explícito en modo "thinking", activado por defecto y desactivable por petición.
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`).
- Soporte de agentes multi-turno con reutilización de historial (según la puerta de validación `agent` descrita en la tarjeta, aunque sin medición registrada).
- Contexto largo: hasta 131 072 tokens por petición, adecuado para documentos extensos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión: no aplicable (la tarjeta marca la entrada de imagen como "not applicable").
- Audio: no aplicable.
- Decodificación especulativa: no aplicable en este runtime.

## Casos de uso

- Asistencia conversacional de contexto largo: con 131 072 tokens por petición, el modelo puede mantener conversaciones sobre documentos extensos (contratos, informes, bases de código) sin truncar el contexto, siempre que se despliegue sobre Strix Halo o R9700.
- Agentes con tool calling: la API expone `tools` y `tool_calls` en formato OpenAI, lo que permite integrar el modelo en orquestadores de agentes existentes (LangChain, LlamaIndex, SDK de OpenAI) apuntando a `http://127.0.0.1:8080/v1`.
- Razonamiento con modo thinking para tareas de análisis: útil en escenarios donde se requiere una cadena de razonamiento explícita antes de la respuesta, como revisión de código o diagnóstico de errores, desactivable cuando se prioriza latencia.
- Despliegue en estaciones de trabajo AMD: el paquete está pensado para equipos con Ryzen AI Max+ 395 o Radeon AI PRO R9700, lo que permite inferencia local sin depender de CUDA ni de servicios en la nube.
- Prototipado de pipelines RAG: la ventana de 131k tokens permite inyectar grandes bloques de contexto recuperado sin necesidad de técnicas de compresión agresivas.
- Evaluación comparativa de runtimes: al ser un paquete Loom del mismo GGUF que la versión de llama.cpp, sirve para comparar el rendimiento de ambos runtimes sobre el mismo checkpoint en hardware AMD, una vez se publiquen las mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La tarjeta del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured". Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de 12B parámetros, lo que sitúa el peso de los pesos en torno a 7-8 GB, aunque la tarjeta no confirma esta cifra. El pool de memoria se reserva de forma fija con `--pool_backing=fixed`.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas: no se mencionan GPUs NVIDIA ni otras AMD; el runtime Loom de este paquete es específico para las arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch huggingface:loom-draft/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom:chat --materialize=copy --output=mellum2.1-12b-a2.5b-thinking` y `loom-serve --model=mellum2.1-12b-a2.5b-thinking '--device=amdgpu://?completion_spin_ns=4294967295' --pool_backing=fixed --parameter_mode=preload`.
- Alternativas de despliegue: llama.cpp, vLLM, Ollama o TGI no están documentadas para este paquete concreto; el checkpoint GGUF original de bartowski sí es compatible con llama.cpp.
- Latencia y throughput: no disponibles; las mediciones están pendientes de re-ejecución.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de modelos alternativos de la misma categoría (MoE de ~12B con ~2.5B activos y modo thinking). Como referencia de infraestructura, el propio paquete se compara con llama.cpp sobre el mismo GGUF, pero sin cifras publicadas.

| Modelo | Parámetros | Contexto | Licencia | Runtime comparado |
|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking (paquete Loom) | 12B totales / 2.5B activos | 131 072 | Apache 2.0 | Loom (`hrx-loom` 0.2.0) |
| Mellum2.1-12B-A2.5B-Thinking (GGUF de bartowski) | 12B totales / 2.5B activos | no disponible en esta ficha | Apache 2.0 | llama.cpp |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de validación publicada: todas las puertas de corrección y las mediciones de rendimiento figuran como "not yet re-measured", por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Restricción de hardware: el paquete solo está pensado para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no funciona en GPUs NVIDIA ni en otras AMD sin regeneración del paquete.
- Contexto y salida limitados por preset: 131 072 tokens de entrada por petición, pero solo 4096 tokens de salida máxima.
- Concurrencia baja: 4 peticiones simultáneas, insuficiente para cargas de producción con muchos usuarios concurrentes.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación previa.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un paquete derivado conviene verificar la licencia del checkpoint base de bartowski y del modelo original.
- El paquete no incluye los pesos originales: requiere descargar el GGUF desde el repositorio base de bartowski.
- `completion_spin_ns=4294967295` activa espera activa en CPU durante el trabajo de GPU, lo que consume CPU de forma intensiva y afecta a la latencia del sistema anfitrión.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
