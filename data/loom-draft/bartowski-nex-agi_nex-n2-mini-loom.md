# loom-draft/bartowski-nex-agi_Nex-N2-mini-loom

## Resumen

`loom-draft/bartowski-nex-agi_Nex-N2-mini-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `nex-agi_Nex-N2-mini-Q4_K_M.gguf`, publicado originalmente por bartowski a partir del modelo `nex-agi/Nex-N2-mini`. El paquete lo genera la herramienta `loom-next` y está orientado exclusivamente a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: es una distribución de inferencia específica para hardware AMD con el runtime `hrx-loom` 0.2.0.

El modelo subyacente es multimodal (entrada de imagen y texto, pipeline `image-text-to-text`), con soporte de razonamiento con "thinking" activado por defecto, tool calling estilo OpenAI y una ventana de contexto de 262.144 tokens por petición. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los artefactos aún no se han materializado o no están publicados en el repositorio.

La relevancia de esta ficha es acotada: no aporta mejoras de modelo, sino una vía de ejecución del GGUF Q4_K_M en GPU AMD consumer y de estación de trabajo mediante un runtime alternativo a llama.cpp. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente `nex-agi/Nex-N2-mini`; el paquete no documenta la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en bf16 (`mmproj-nex-agi_Nex-N2-mini-bf16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint y proyector); paquete Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo subyacente `nex-agi/Nex-N2-mini` en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o un modelo híbrido, ni el número de parámetros, capas o cabezas de atención. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Todo ello debe consultarse en la model card original de `nex-agi/Nex-N2-mini`, que no forma parte de la información disponible.

Lo que sí está documentado es la capa de despliegue. El paquete Loom se genera con `loom-next` (solo el generador, sin LLM en el bucle) y contiene kernels generados para las arquitecturas AMD gfx1151 y gfx1201, junto con un `model.json` que fija los ficheros fuente y sus hashes SHA-256, verificados por `loom-fetch`. El runtime expone opciones relevantes para el rendimiento: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico) y `--parameter_mode=preload` (carga de pesos en host). No se documenta decodificación especulativa: la tabla de features la marca como "not applicable".

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imágenes mediante partes `image_url` estilo OpenAI, con proyector multimodal separado en bf16.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- Servidor compatible con la API `/v1/chat/completions` de OpenAI.
- Ventana de contexto de 262.144 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida limitada a 4.096 tokens por petición en el preset por defecto.
- No soporta entrada ni salida de audio.
- No soporta "reasoning effort" configurable ni decodificación especulativa.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: el paquete está precompilado para gfx1201 con 32 GB de VRAM, de modo que se puede servir el modelo Q4_K_M con `loom-serve` sin compilar kernels a mano, usando el pool de memoria fijo para evitar fragmentación.
- Inferencia local en equipos Strix Halo: en un Ryzen AI Max+ 395 (gfx1151) se puede ejecutar el modelo con memoria unificada, útil para prototipado y demos en portátiles o mini-PC sin GPU discreta.
- Análisis de documentos largos con imagen: la ventana de 262.144 tokens permite pasar contratos, informes o capturas de pantalla junto con preguntas extensas, aprovechando la entrada multimodal.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir asistentes que consulten APIs externas, con la opción de desactivar el "thinking" para reducir latencia en pasos intermedios.
- Evaluación comparativa frente a llama.cpp: los gates de correctitud (`golden`, `compare`, `vision`, `agent`, `sampling`, `logits`) están diseñados para verificar que la salida del runtime Loom coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que sirve para validar portes a AMD.
- Servicio interno con API compatible OpenAI: al exponer `/v1/chat/completions`, se puede integrar como backend en aplicaciones existentes que ya usan el SDK de OpenAI, con hasta 4 peticiones concurrentes.
- Procesamiento por lotes de imágenes y texto: para tareas de descripción, extracción de información o clasificación visual en entornos con hardware AMD, evitando depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201), "the results for this package are not yet re-measured". Asimismo, todos los gates de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas, por lo que no hay evidencia registrada de paridad con llama.cpp ni métricas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el checkpoint es Q4_K_M y el proyector bf16, pero no se publica el tamaño en disco ni en memoria del GGUF.
- GPU soportadas explícitamente: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU NVIDIA (A100, H100, RTX 4090) y Apple Silicon: no soportadas por este paquete, que está compilado para arquitecturas AMD concretas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Opciones de servidor: `--pool_backing=fixed` y `--parameter_mode=preload`, además de `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones comparativas frente a llama.cpp están pendientes de repetir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| `loom-draft/bartowski-nex-agi_Nex-N2-mini-loom` | no disponible | 262.144 tokens | imagen + texto | Apache 2.0 | AMD gfx1151 / gfx1201 |
| `bartowski/nex-agi_Nex-N2-mini-GGUF` (origen) | no disponible | no disponible en la información | imagen + texto | Apache 2.0 (heredada) | genérico (llama.cpp) |
| `nex-agi/Nex-N2-mini` (modelo original) | no disponible | no disponible en la información | imagen + texto | no disponible en la información | no disponible |

La comparación relevante es entre el paquete Loom y el GGUF de bartowski del que deriva: comparten pesos (el paquete no modifica el checkpoint), pero difieren en el runtime y en el hardware soportado. No se dispone de datos de benchmarks ni de especificaciones del modelo original para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete no incluye un modelo nuevo: cualquier limitación del modelo `nex-agi/Nex-N2-mini` original (sesgos, alucinaciones, calidad por idioma) se hereda sin cambios.
- No hay gates de correctitud registrados: todas las verificaciones figuran como "not yet re-measured", por lo que no existe evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta versión.
- Sin mediciones de rendimiento: no se puede estimar throughput ni latencia a partir de la documentación.
- Hardware muy restringido: solo funciona en AMD Ryzen AI Max+ 395 "Strix Halo" y Radeon AI PRO R9700; no hay soporte documentado para NVIDIA, Apple Silicon ni otras GPU AMD.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens por petición en el preset, lo que puede ser insuficiente para cargas de producción intensivas.
- El "thinking" está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- Repositorio con 0 descargas y tamaño de 0,0 GB: los artefactos podrían no estar materializados, lo que impediría el despliegue tal como se documenta.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `nex-agi/Nex-N2-mini` por si impone condiciones adicionales.
- Los resultados de búsqueda web obtenidos corresponden a productos homónimos (Loom, la herramienta de grabación de pantalla, y la marca de ropa Loom) y no aportan información sobre este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-nex-agi_Nex-N2-mini-loom
- GGUF de origen: https://huggingface.co/bartowski/nex-agi_Nex-N2-mini-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Modelo original `nex-agi/Nex-N2-mini`: no disponible en la información proporcionada (referenciado en la model card como base de bartowski).
