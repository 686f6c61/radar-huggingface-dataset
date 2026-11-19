# loom-draft/mradermacher-Qwen3.5-4B-DeepThought-STEM-i1-loom

## Resumen

El paquete `loom-draft/mradermacher-Qwen3.5-4B-DeepThought-STEM-i1-loom` es una distribución en formato Loom del checkpoint GGUF `Qwen3.5-4B-DeepThought-STEM.i1-Q4_K_M.gguf`, publicado por el usuario `loom-draft` el 19 de noviembre de 2026. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: contiene programas `.loom` y un fichero `model.json` que permiten servir el GGUF original, sin modificarlo, sobre GPUs AMD concretas (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201). El modelo subyacente es un Qwen3.5 de 4.000 millones de parámetros afinado con el dataset DeepThought-STEM y cuantizado a Q4_K_M por mradermacher.

La relevancia de este paquete es de infraestructura más que de modelado: ofrece una vía de ejecución nativa en ROCm/HIP mediante el runtime Loom (instalable con `pipx install "hrx-loom[hf]==0.2.0"`), con decodificación especulativa basada en MTP (multi-token prediction) a profundidad 3 activada por defecto, soporte de tool calling estilo OpenAI y una ventana de contexto de 262.144 tokens por petición con 4 peticiones concurrentes. El paquete se generó con la herramienta `loom-next` sin intervención de un LLM en el bucle de generación.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB, lo que sugiere que los pesos no están alojados en el propio repo (se obtienen vía `loom-fetch` desde el GGUF de origen). La licencia declarada es Apache 2.0. No se dispone de información sobre benchmarks, idiomas soportados ni resultados de validación de correctitud, ya que todas las puertas de verificación aparecen como "not yet re-measured".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), inferida del nombre del modelo base; no se detalla en la model card |
| Parametros totales | 4B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original) + programas `.loom` y `model.json` |
| Decodificación especulativa | MTP, profundidad 3, activada por defecto |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (ROCm/HIP) |
| API | OpenAI-compatible `/v1/chat/completions` |
| Tool calling | Sí, estilo OpenAI (`tools` / `tool_calls`) |
| Entrada de imagen | No soportada por Loom (el modelo upstream sí la tiene) |
| Audio | No aplicable |
| Sampling | No determinado ("?") |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de su nombre (`Qwen3.5-4B-DeepThought-STEM`), por lo que no hay datos confirmados sobre número de capas, cabezas de atención, tipo de atención (lineal, completa o híbrida) ni composición del dataset de entrenamiento. El sufijo `i1` corresponde a la variante de cuantización de mradermacher (imatrix), y `DeepThought-STEM` indica un ajuste fino orientado a dominios científico-técnicos. Tampoco se especifica si hubo RLHF, DPO o fases de post-entrenamiento, ni el número de tokens de entrenamiento.

La innovación técnica documentada pertenece al runtime, no al modelo: Loom ejecuta los kernels generados sobre ROCm/HIP con decodificación especulativa MTP a profundidad 3 activada por defecto, y ofrece un mecanismo de espera activa en GPU (`completion_spin_ns=4294967295`) y un pool de memoria de respaldo fijo (`--pool_backing=fixed`) para reducir latencia. El modo de razonamiento (thinking) está activado por defecto y puede desactivarse con `chat_template_kwargs: {"enable_thinking": false}`; no existe control de "reasoning effort". El paquete se generó automáticamente con `loom-next`, sin LLM en el bucle.

## Capacidades

- Generación de texto conversacional multi-turno vía API compatible con OpenAI.
- Razonamiento explícito (thinking mode) activado por defecto, desactivable por petición.
- Tool calling estilo OpenAI: acepta el parámetro `tools` y emite `tool_calls`, lo que habilita bucles de agente multi-paso.
- Contexto largo: hasta 262.144 tokens por petición, adecuado para documentos extensos o historiales de conversación prolongados.
- Concurrencia de 4 peticiones simultáneas con salida máxima de 4.096 tokens por respuesta.
- Decodificación especulativa MTP (profundidad 3) para acelerar la generación sin cambiar la salida (según la puerta `spec`, pendiente de re-medición).
- Especialización declarada en STEM por el ajuste DeepThought-STEM del modelo base.
- Entrada de imagen: no disponible en este paquete (el modelo upstream la soporta, pero Loom no).
- Audio: no aplicable.
- Idiomas: no disponibles en la documentación.

## Casos de uso

- Asistencia técnica en dominios STEM: el ajuste DeepThought-STEM y el modo thinking permiten resolver problemas de matemáticas, física o ingeniería paso a paso; útil en entornos educativos o de soporte técnico especializado.
- Agentes con herramientas en producción: el soporte de `tools`/`tool_calls` y el contexto de 262.144 tokens permiten construir agentes que consulten APIs, bases de datos o sistemas internos manteniendo historiales largos sin truncar.
- Análisis de documentos técnicos extensos: papers, especificaciones o manuales de hasta 262k tokens pueden procesarse en una sola petición, con salida acotada a 4.096 tokens para resúmenes o extracción estructurada.
- Despliegue en hardware AMD de escritorio o workstation: con una Radeon AI PRO R9700 (32 GB) o un Strix Halo, el paquete ofrece inferencia local sin depender de CUDA, relevante para equipos con requisitos de soberanía de datos.
- Chatbot interno de empresa: la API OpenAI-compatible permite integrarlo en stacks existentes (LangChain, LlamaIndex, clientes OpenAI) cambiando solo la URL base a `http://127.0.0.1:8080/v1`.
- Prototipado de pipelines de razonamiento: el modo thinking activable/desactivable por petición facilita comparar coste y calidad entre respuestas directas y cadenas de razonamiento en la misma instancia.
- Evaluación de runtimes alternativos: útil para equipos que comparan Loom frente a llama.cpp en GPUs AMD, ya que el paquete incluye puertas de correctitud diseñadas para contrastar contra la referencia de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir todavía" ("not yet re-measured"), y que todas las puertas de correctitud (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen sin ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 4B, lo que en la práctica ronda los 2,5-3 GB de pesos, pero el pool de memoria del preset Loom puede reservar más (no se documenta la cifra exacta).
- GPUs soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta compatibilidad con GPUs NVIDIA, Apple Silicon ni con GPUs AMD de gama consumidor distintas de las listadas.
- Despliegue: runtime Loom (`hrx-loom[hf]==0.2.0`) instalado vía pipx; flujo `loom-fetch` + `loom-serve`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (aunque el GGUF de origen sí es compatible con llama.cpp).
- Opciones de serving relevantes: `--pool_backing=fixed` (reserva fija del pool), `--parameter_mode=preload` (carga anticipada de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones GPU).
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp están pendientes de re-medición para ambas GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM-i1 (este paquete) | 4B | 262.144 | Apache 2.0 | GGUF Q4_K_M + Loom | Solo GPUs AMD gfx1151/gfx1201; tool calling y thinking; sin benchmarks publicados |
| mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF (base) | 4B | no disponible | Apache 2.0 (heredada) | GGUF | Checkpoint original sin empaquetar; compatible con llama.cpp y otros runtimes GGUF |
| Qwen3.5-4B (upstream, sin ajuste STEM) | 4B | no disponible | no disponible | safetensors / GGUF (según distribución) | Modelo generalista; este paquete añade el ajuste DeepThought-STEM |
| Alternativas de 4B en GGUF para CPU/GPU | ~4B | variable | variable | GGUF | No se dispone de datos concretos de benchmarks para comparar en esta ficha |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para ninguno de los modelos listados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de validación publicada: las 11 puertas de correctitud de Loom aparecen como "not yet re-measured", por lo que no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- Sin benchmarks de rendimiento: no se puede estimar throughput ni latencia real en las GPUs objetivo.
- Restricción de hardware severa: solo se documentan dos GPUs AMD (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201); no hay soporte declarado para NVIDIA, Apple Silicon ni otras AMD.
- Sin soporte de imagen en este paquete, pese a que el modelo upstream sí lo tiene; quien necesite visión debe usar otro runtime.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens, lo que puede ser insuficiente para cargas de producción intensivas.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá del comportamiento del modelo base.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en dominios STEM donde el ajuste fino puede inducir confianza excesiva en respuestas incorrectas.
- Sesgos: no documentados en la model card; se heredan los del modelo base y del dataset DeepThought-STEM, no auditados aquí.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto derivado conviene verificar las condiciones del checkpoint original de mradermacher y del modelo Qwen3.5 subyacente.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: madurez y mantenimiento no verificables.
- El tamaño del repo es 0,0 GB, lo que implica que los pesos se descargan aparte con `loom-fetch`; la disponibilidad futura depende de que el GGUF de origen siga accesible.
- El modo thinking está activado por defecto, lo que incrementa latencia y consumo de tokens si no se desactiva explícitamente.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-Qwen3.5-4B-DeepThought-STEM-i1-loom
- Checkpoint GGUF de origen: https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Resultados de búsqueda web: no relevantes (corresponden a Loom Inc., la herramienta de grabación de pantalla, y a la marca de ropa Loom; no guardan relación con este paquete).
