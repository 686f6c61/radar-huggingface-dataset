# loom-draft/bartowski-Mellum2-12B-A2.5B-Instruct-loom

## Resumen

Mellum2-12B-A2.5B-Instruct-loom es un paquete de despliegue en formato Loom generado por el usuario loom-draft a partir del checkpoint GGUF cuantizado Q4_K_M de bartowski/Mellum2-12B-A2.5B-Instruct-GGUF. No se trata de un modelo nuevo ni de un fine-tune: el repositorio contiene programas `.loom` y un `model.json` que permiten servir los pesos originales sin modificarlos sobre GPUs AMD concretas, en concreto la AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El generador utilizado es loom-next, sin intervención de un LLM en el proceso.

El modelo subyacente es un Mixture of Experts de 12B parámetros totales con 2,5B activos por token, según se deduce de su nombre comercial, y el paquete expone una ventana de contexto de 131.072 tokens por petición con hasta cuatro peticiones concurrentes y un máximo de 4.096 tokens de salida por defecto. La relevancia de este repositorio es fundamentalmente de infraestructura: demuestra un camino de despliegue nativo para GPUs AMD vía ROCm, con API compatible con OpenAI y soporte de tool calling, orientado a entornos donde CUDA no está disponible.

La licencia del paquete es Apache 2.0, heredada del checkpoint base. No se han publicado resultados de benchmarks ni métricas de rendimiento para este paquete concreto: la propia model card indica que las mediciones para ambas GPUs "aún no se han vuelto a medir", por lo que cualquier cifra de throughput o latencia debe obtenerse por cuenta del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete Loom no documenta la arquitectura del modelo base; el nombre sugiere un transformer MoE) |
| Parámetros totales | 12B (según el nombre del modelo base) |
| Parámetros activos | 2,5B (según el nombre del modelo base) |
| Longitud de contexto | 131.072 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom` |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | sí (formato OpenAI `tools` y `tool_calls`) |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base ni sus datos de entrenamiento. Lo único verificable es que se trata de un checkpoint GGUF cuantizado en Q4_K_M, generado por bartowski, y que el nombre del modelo indica una configuración MoE con 12B parámetros totales y 2,5B activos. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF o DPO, ni innovaciones técnicas del modelo original.

La aportación técnica de este repositorio está en la capa de despliegue. loom-next genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF y del `llm_config.json`, junto con un `model.json` que fija los ficheros fuente mediante hashes sha256 verificados por `loom-fetch`. El servidor `loom-serve` expone una API compatible con OpenAI y permite ajustes como `completion_spin_ns=4294967295` (espera activa de las completaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado) y `--parameter_mode=preload` (carga de pesos en host). No se documenta decodificación especulativa, atención lineal ni otras optimizaciones: la tabla de features marca estas capacidades como no aplicables.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles agénticos multi-turno según los gates de corrección definidos (`agent`, `agent_think_off`).
- Ventana de contexto de 131.072 tokens por petición, adecuada para documentos largos y conversaciones extensas.
- Cuatro peticiones concurrentes con consistencia garantizada entre ejecución concurrente y secuencial (gate `consistency`).
- Modo de razonamiento o thinking: no aplicable según la model card.
- Decodificación especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información del repositorio.

## Casos de uso

- Despliegue en infraestructura AMD sin CUDA: el paquete está pensado para servir el modelo en Strix Halo y R9700 mediante ROCm, lo que permite aprovechar hardware AMD integrado o de escritorio profesional donde no hay GPUs NVIDIA disponibles.
- Asistente conversacional con contexto largo: con 131.072 tokens por petición se pueden procesar conversaciones multi-turno extensas o documentos completos sin truncar, útil en atención al cliente o análisis documental.
- Agentes con tool calling: la API expone `tools` y `tool_calls` en formato OpenAI y los gates de corrección cubren bucles agénticos multi-turno, lo que permite integrar el modelo en orquestadores de agentes existentes sin adaptadores propietarios.
- Automatización de tareas con cuatro workers concurrentes: el límite de 4 peticiones simultáneas con consistencia verificada encaja en servicios de pequeño o medio volumen, como clasificación por lotes o generación de resúmenes en pipelines internos.
- Prototipado en estación de trabajo: con cuantización Q4_K_M y un MoE de 2,5B activos, el modelo está pensado para ejecutarse en una única GPU de 32 GB (R9700) o en una APU con memoria unificada (Strix Halo), lo que facilita entornos de desarrollo sin clúster.
- Sustitución de backends en aplicaciones OpenAI-compatibles: al exponer `/v1/chat/completions`, se puede apuntar una aplicación existente al endpoint local cambiando únicamente la URL base, útil para pruebas de integración y entornos con requisitos de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "aún no se han vuelto a medir", y que los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tampoco tienen ejecuciones registradas para este paquete.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 12B parámetros totales, y el paquete está validado para una GPU de 32 GB (Radeon AI PRO R9700) y para la APU Strix Halo con memoria unificada.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante ROCm.
- GPUs NVIDIA: no soportadas por este paquete; el stack es específico de AMD (ROCm/hrx-system).
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, descarga con `loom-fetch` y servicio con `loom-serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Concurrencia máxima: 4 peticiones simultáneas.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Mellum2-12B-A2.5B-Instruct-loom (este) | 12B | 2,5B | 131.072 | Apache 2.0 | Loom sobre ROCm (Strix Halo, R9700) | Paquete de despliegue, sin benchmarks publicados |
| bartowski/Mellum2-12B-A2.5B-Instruct-GGUF | 12B | 2,5B | no disponible en la información | Apache 2.0 (según el paquete derivado) | GGUF (llama.cpp y compatibles) | Checkpoint base del que deriva este paquete |
| Modelos MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación con alternativas concretas |

## Limitaciones y advertencias

- No es un modelo nuevo: es un paquete de despliegue del GGUF de bartowski; cualquier limitación del modelo base (sesgos, alucinaciones, calidad en ciertos idiomas) se hereda sin cambios.
- Sin evidencia de corrección registrada: todos los gates de `loom-benchmark` aparecen como "not yet re-measured", por lo que no hay verificación publicada de que la salida coincida token a token con la referencia de llama.cpp en este paquete.
- Sin mediciones de rendimiento: no hay datos de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Compatibilidad restringida: solo GPUs AMD gfx1151 y gfx1201 con el stack hrx-loom 0.2.0; no es portable a CUDA ni a otros backends sin conversión.
- Límites operativos fijos: 4 peticiones concurrentes y 4.096 tokens de salida por defecto, insuficientes para cargas de alta concurrencia o generaciones muy largas.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación propia.
- Sin modo thinking ni decodificación especulativa: no apto para flujos que dependan de razonamiento extendido explícito o de aceleración especulativa.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de las dependencias del stack Loom (hrx-loom, loom-next) antes de producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Mellum2-12B-A2.5B-Instruct-loom
- Modelo base (GGUF): https://huggingface.co/bartowski/Mellum2-12B-A2.5B-Instruct-GGUF
- Stack ROCm/hrx-system: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
