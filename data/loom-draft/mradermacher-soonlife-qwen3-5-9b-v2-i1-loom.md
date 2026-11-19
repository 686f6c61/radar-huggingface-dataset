# loom-draft/mradermacher-Soonlife-Qwen3.5-9B-v2-i1-loom

## Resumen

El modelo `loom-draft/mradermacher-Soonlife-Qwen3.5-9B-v2-i1-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado automáticamente a partir del checkpoint GGUF sin modificar `mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF`, concretamente la cuantización `Soonlife-Qwen3.5-9B-v2.i1-Q4_K_M.gguf`. Lo publica el usuario `loom-draft` y está orientado a dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El paquete no contiene pesos nuevos ni un ajuste fino propio: es una envoltura de inferencia que permite servir el GGUF original mediante `loom-serve` del stack `hrx-loom` (versión 0.2.0), exponiendo una API compatible con OpenAI en `/v1/chat/completions`. Su relevancia es de nicho: demuestra el flujo de empaquetado y servicio de modelos Qwen 3.5 de 9B sobre hardware AMD con ROCm, sin depender de llama.cpp como runtime.

El modelo subyacente es un Qwen 3.5 de 9B parámetros (familia Qwen de Alibaba), del que la información disponible no detalla arquitectura interna ni datos de entrenamiento. La tarjeta declara contexto de 262.144 tokens por petición, soporte de tool calling y modo de razonamiento activado por defecto, con licencia Apache 2.0 heredada del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen 3.5, 9B; el paquete es una envoltura de inferencia Loom sobre GGUF) |
| Parametros totales | 9B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` + `model.json` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Hardware objetivo | AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `Soonlife-Qwen3.5-9B-v2-i1` ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). Lo único documentado es que se trata de un checkpoint de la familia Qwen 3.5 con 9B parámetros, distribuido originalmente en GGUF por `mradermacher` en cuantización Q4_K_M.

El paquete Loom sí documenta su propia capa técnica: `loom-next` genera, sin intervención de un LLM en el bucle, los programas `.loom` y la tarjeta `model.json` a partir del GGUF sin modificar. El servicio se lanza con `loom-serve` usando `--device=amdgpu://`, `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico) y `--parameter_mode=preload` (carga de pesos en host). El parámetro `completion_spin_ns=4294967295` activa espera activa para las finalizaciones de GPU. No se documentan innovaciones como decodificación especulativa (marcada como «not applicable») ni atención lineal.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento (*thinking*) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo de hasta 262.144 tokens por petición, útil para documentos extensos.
- Concurrencia de 4 peticiones simultáneas.
- Capacidades multimodales (imagen, audio) y de muestreo: estado «no determinado» en la tarjeta; no se pueden afirmar.
- Decodificación especulativa: no aplicable en este paquete.
- Idiomas: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en estaciones de trabajo AMD: el paquete permite servir el modelo en una APU Strix Halo o una R9700 con `loom-serve`, sin depender de CUDA ni de llama.cpp, para prototipos y uso interno con API OpenAI.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, se pueden pasar contratos, informes o bases de código extensas en una sola petición para resumen, extracción de datos o preguntas y respuestas.
- Agentes con herramientas: el soporte de `tools`/`tool_calls` y del bucle multi-turno permite construir agentes que consulten APIs, bases de datos o sistemas de ficheros, con el modo thinking activado por defecto para planificación.
- Generación de código asistida en local: un modelo de 9B en Q4_K_M cabe en 32 GB de VRAM y puede servir como autocompletado o chat de código en entornos con hardware AMD, sin enviar código a la nube.
- Evaluación de hardware AMD para inferencia LLM: el paquete sirve como banco de pruebas reproducible del stack `hrx-loom` frente a llama.cpp sobre gfx1151 y gfx1201.
- Chatbot de atención interna con contexto largo: la ventana de 262k tokens y la concurrencia de 4 permiten gestionar varias conversaciones simultáneas con historial extenso en un único nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700 «no se han vuelto a medir» (`not yet re-measured`), y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) carecen de ejecución registrada.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 9B; los pesos rondan los 5-6 GB, aunque la tarjeta no publica cifras exactas de memoria del preset.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA ni otras AMD.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo; el paquete está generado específicamente para los dos aceleradores AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` y `loom-serve`. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| `loom-draft/mradermacher-Soonlife-Qwen3.5-9B-v2-i1-loom` | 9B | 262.144 | Apache 2.0 | `.loom` + GGUF / `hrx-loom` | Solo AMD Strix Halo y R9700; sin benchmarks publicados |
| `mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF` | 9B | no disponible | Apache 2.0 (heredada) | GGUF / llama.cpp | Checkpoint base sin empaquetar; portable a más hardware |
| Otros modelos Qwen 3.5 de 9B en GGUF | 9B | no disponible | según checkpoint | GGUF / llama.cpp, Ollama | Alternativas genéricas de la misma familia; datos concretos no disponibles en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- Paquete específico de hardware: solo está generado para gfx1151 (Strix Halo) y gfx1201 (R9700); no es portable a GPU NVIDIA ni a otras AMD sin regeneración.
- Sin evidencia de corrección: todas las puertas de validación (`golden`, `compare`, `agent`, `sampling`, etc.) aparecen como «not yet re-measured», por lo que no hay garantía publicada de equivalencia con llama.cpp.
- Sin benchmarks de rendimiento: no se puede estimar latencia ni throughput a partir de la información disponible.
- Capacidades multimodales y de muestreo sin determinar: imagen, audio y parámetros de sampling figuran como «?» en la tarjeta.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens, lo que restringe escenarios de alta carga o generaciones muy largas.
- Riesgo de alucinación y sesgos: no documentados para el modelo base en la información proporcionada; deben evaluarse empíricamente antes de producción.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe concreto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de las dependencias del stack `hrx-loom`.
- El nombre «Loom» coincide con el producto de grabación de pantalla de Atlassian; los resultados de búsqueda web sobre ese producto no guardan relación con este paquete y no deben tomarse como documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Soonlife-Qwen3.5-9B-v2-i1-loom
- Checkpoint base (GGUF): https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF
- Repositorio del stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
