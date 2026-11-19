# loom-draft/bottlecapai-ThinkingCap-Qwen3.8-27B-loom

## Resumen

ThinkingCap-Qwen3.8-27B es un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.8, con 27.000 millones de parámetros, publicado por bottlecapai en formato GGUF. Sobre ese checkpoint base, el usuario loom-draft ha generado un paquete de despliegue para el ecosistema Loom (herramienta de inferencia para GPUs AMD basada en ROCm), dirigido específicamente al AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y a la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete incluye programas `.loom` y una tarjeta `model.json`, generados con loom-next sin intervención de un LLM en el bucle.

El interés de esta ficha no reside en un modelo nuevo, sino en una receta de despliegue concreta: empaqueta el GGUF `ThinkingCap-Qwen3.8-27B-Q4_K_M.gguf` sin modificarlo y expone una API compatible con OpenAI (`/v1/chat/completions`) con soporte de tool calling, modo de razonamiento, decodificación especulativa MTP y entrada de imagen mediante el proyector `mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf`. Es relevante para quien quiera servir un modelo de 27B multimodal en hardware AMD consumer o de estación de trabajo sin depender de CUDA.

La información pública disponible es escasa: no hay datos de benchmarks, ni de composición del dataset de entrenamiento, ni de idiomas soportados, y las mediciones de rendimiento del paquete aún no se han vuelto a medir. Los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a la herramienta de grabación de pantalla Loom y a una marca de ropa homónima), por lo que no aportan datos técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.8; el paquete no documenta la arquitectura interna) |
| Parametros totales | 27 000 millones (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en f16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | GGUF (`ThinkingCap-Qwen3.8-27B-Q4_K_M.gguf`) + paquete Loom (`.loom`, `model.json`) |
| Modalidad | image-text-to-text (texto e imagen de entrada) |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Concurrencia | 4 peticiones simultáneas |
| Tokens de salida máximos | 4 096 (preset `max_tokens`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | loom-serve (hrx-loom 0.2.0), ROCm |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ThinkingCap-Qwen3.8-27B: la model card del paquete Loom no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF, DPO u otro ajuste por preferencias. El nombre sugiere una derivación de la familia Qwen3.8 con capacidades de razonamiento ("Thinking"), pero no hay documentación que lo confirme.

La innovación documentada pertenece al paquete de despliegue, no al modelo: loom-next genera kernels y programas `.loom` para ejecutar el GGUF sin modificarlo en GPUs AMD, con decodificación especulativa MTP de profundidad 3 activada por defecto, gestión de memoria con pool de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros en host (`--parameter_mode=preload`). El paquete incluye además un conjunto de puertas de corrección (kernel_tests, golden, compare, vision, consistency, spec, agent, sampling, logits, decision) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, aunque ninguna de ellas tiene mediciones registradas todavía.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).
- Tool calling estilo OpenAI, con campos `tools` y `tool_calls` en la API.
- Entrada de imagen mediante partes `image_url` estilo OpenAI, usando el proyector `mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf`.
- Decodificación especulativa MTP con profundidad 3, activada por defecto.
- Ventana de contexto de 262 144 tokens por petición.
- Servicio concurrente de hasta 4 peticiones.
- API compatible con OpenAI en `/v1/chat/completions`.
- Entrada y salida de audio: no determinado.
- Comportamiento de muestreo (temperatura, top_k, semilla): no determinado en la documentación del paquete.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional multimodal en estación de trabajo AMD: servir el modelo con loom-serve sobre una Radeon AI PRO R9700 y exponer un endpoint compatible con OpenAI para un chatbot interno que reciba capturas de pantalla o diagramas junto a preguntas de texto, aprovechando el contexto de 262 144 tokens para adjuntar documentación extensa.
- Análisis de documentación técnica con imágenes: ingerir manuales con figuras, esquemas eléctricos o diagramas de arquitectura y formular preguntas que requieran correlacionar el texto con la imagen, usando el proyector f16 para preservar la calidad de la codificación visual.
- Agente de tool calling en local: construir un bucle multi-turno que consulte APIs internas mediante `tools`/`tool_calls`, con el modo thinking desactivado para reducir latencia en llamadas encadenadas y activado para pasos de planificación.
- Razonamiento asistido con esfuerzo configurable: usar `reasoning_effort: low` para clasificación o extracción rápida y `xhigh` para problemas de análisis que requieran cadenas de razonamiento largas, ajustando coste y latencia por caso.
- Prototipado en hardware consumer de gama alta: desplegar en un Ryzen AI Max+ 395 "Strix Halo" (plataforma integrada) para desarrollo y pruebas sin GPU dedicada, con el mismo paquete que luego se sirve en la R9700.
- Evaluación comparativa de runtimes AMD: usar las puertas de corrección del paquete (golden, compare, spec, agent) para verificar que la implementación Loom reproduce la salida de llama.cpp sobre el mismo GGUF antes de promover un despliegue a producción.
- Generación de código con contexto largo: aprovechar la ventana de 262 144 tokens para incluir repositorios completos o varios ficheros en la petición, aunque el límite de 4 096 tokens de salida acota la extensión de las respuestas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento del paquete "no se han vuelto a medir" tanto para Strix Halo (gfx1151) como para Radeon AI PRO R9700 (gfx1201, 32 GB), y que todas las puertas de corrección figuran como "not yet re-measured". No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de 27B, lo que sitúa el peso de los pesos en torno a 16-17 GB según la estimación habitual para esa cuantización, más el proyector de visión f16; la cifra exacta no está documentada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Compatibilidad con GPU consumer: no confirmada; el paquete está generado para las dos plataformas AMD citadas. No se documenta soporte para GPUs NVIDIA ni para otras Radeon.
- Despliegue: exclusivamente mediante loom-serve (paquete `hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI sobre este paquete concreto, aunque llama.cpp se usa como referencia de corrección.
- Concurrencia: 4 peticiones simultáneas.
- Latencia y throughput: no disponibles (mediciones pendientes).
- Opciones de servicio documentadas: `--pool_backing=fixed` (pool de memoria fijo), `--parameter_mode=preload` (precarga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B (paquete Loom) | 27B | 262 144 | Texto + imagen | other | GGUF + Loom (loom-serve) |
| bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF | 27B | no disponible | Texto + imagen | other | GGUF (llama.cpp y otros) |
| Alternativas de 27B-32B con visión | no disponible | no disponible | Texto + imagen | no disponible | no disponible |

El único comparable directo identificable en la información disponible es el checkpoint base `bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF`, del que este paquete es un empaquetado sin modificaciones para Loom. No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad (MMLU, HumanEval, GSM8K) ni de rendimiento (tokens/s, latencia) para este paquete.
- Las puertas de corrección del paquete figuran como "not yet re-measured": no está verificado que la salida coincida con la referencia de llama.cpp en kernels, visión, decodificación especulativa, tool calling ni muestreo.
- Licencia "other" heredada del modelo base sin condiciones detalladas en la información disponible: es imprescindible revisar los términos del checkpoint original antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Límite de 4 096 tokens de salida por petición, lo que restringe respuestas largas y generación de código extensa pese al contexto de 262 144 tokens.
- Concurrencia máxima de 4 peticiones: no apto para despliegues de alta demanda sin escalado horizontal.
- Compatibilidad de hardware restringida a las plataformas AMD documentadas (gfx1151 y gfx1201); no se declara soporte para otras GPUs.
- Riesgo de alucinación y sesgos: no documentados por el autor; deben asumirse los habituales en modelos de esta familia sin evaluación publicada.
- Entrada y salida de audio, y comportamiento de muestreo, figuran como "not determined": no se deben asumir.
- El paquete depende de la versión `hrx-loom[hf]==0.2.0` y del ecosistema Loom; cambios de versión pueden romper la receta de despliegue.
- Los resultados de búsqueda web obtenidos no contienen información técnica del modelo (corresponden a servicios y marcas homónimas), por lo que no se han podido contrastar datos adicionales.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bottlecapai-ThinkingCap-Qwen3.8-27B-loom
- Modelo base (GGUF): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
