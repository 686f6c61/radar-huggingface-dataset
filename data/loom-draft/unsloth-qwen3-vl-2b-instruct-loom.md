# loom-draft/unsloth-Qwen3-VL-2B-Instruct-loom

## Resumen

El modelo publicado bajo el identificador `loom-draft/unsloth-Qwen3-VL-2B-Instruct-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom generado a partir del checkpoint GGUF `unsloth/Qwen3-VL-2B-Instruct-GGUF` (concretamente la cuantización `Qwen3-VL-2B-Instruct-Q4_K_M.gguf`). El autor, `loom-draft`, distribuye los programas `.loom` generados con la herramienta `loom-next` junto con el tokenizer, la configuración y el projector multimodal `mmproj-BF16.gguf`, todo ello orientado a GPUs AMD: el SoC Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Qwen3-VL-2B-Instruct, un transformer multimodal de 2 mil millones de parámetros de la familia Qwen3-VL de Alibaba, capaz de procesar entradas de imagen y texto y generar respuestas de texto. Este paquete Loom resuelve el problema de ejecutar ese modelo sobre el stack ROCm/HIP de AMD con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling e imagen, contexto de 262.144 tokens por petición y hasta 4 peticiones concurrentes.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue experimental (0 descargas, 0 likes, creado el 19 de noviembre de 2026) cuyo interés principal es la integración con el ecosistema Loom para hardware AMD, no las capacidades del modelo en sí, que hereda íntegramente de Qwen3-VL-2B-Instruct. Las mediciones de rendimiento y las puertas de corrección del paquete aparecen como "not yet re-measured" en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3-VL-2B-Instruct); paquete de despliegue Loom sobre GGUF |
| Parámetros totales | 2B (modelo base; no se detalla desglose en la información disponible) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint incluido); projector en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF + programas `.loom` (`program/*.loom`, `weights.loom`), `tokenizer.json`, `llm_config.json`, `model.json` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: envuelve el checkpoint GGUF de Qwen3-VL-2B-Instruct, un transformer multimodal de 2B parámetros que combina un codificador visual con un decoder de lenguaje y un projector multimodal (`mmproj-BF16.gguf`) para alinear representaciones de imagen y texto. La cuantización Q4_K_M reduce el peso de los pesos para inferencia en memoria limitada, manteniendo el projector en BF16 para preservar la calidad de la señal visual.

La innovación técnica de este artefacto no está en el modelo sino en el runtime: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) específicos para las arquitecturas AMD gfx1151 y gfx1201, y `loom-serve` los expone mediante una API OpenAI. La model card declara puertas de corrección (kernel_tests, golden, compare, vision, consistency, spec, agent, agent_think_off, sampling, logits, decision) que comparan la salida contra llama.cpp con el mismo GGUF, pero todas figuran como "not yet re-measured". No se dispone de datos sobre volumen de tokens, composición del dataset ni fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto e image-text-to-text: acepta partes `image_url` al estilo OpenAI y responde en texto.
- Tool calling al estilo OpenAI: campos `tools` y `tool_calls` en la API.
- Contexto largo: 262.144 tokens por petición, útil para documentos extensos o historiales multi-turno.
- Concurrencia: hasta 4 peticiones simultáneas.
- Límite de salida: 4.096 tokens por respuesta (preset `max_tokens`).
- Modo razonamiento/thinking: no aplicable según la model card.
- Decodificación especulativa: no aplicable.
- Entrada/salida de audio: no soportada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente documental con imágenes: el modelo puede recibir capturas, diagramas o páginas escaneadas junto a preguntas en texto y responder con el contexto de 262.144 tokens, adecuado para revisar expedientes completos en una sola petición.
- Automatización de soporte técnico con capturas de pantalla: el usuario adjunta una imagen del error y el modelo la interpreta junto al historial de la conversación, con tool calling para consultar sistemas internos.
- Extracción de datos de formularios y facturas: pipeline image-text-to-text que convierte documentos escaneados en campos estructurados, invocando funciones vía `tool_calls` para persistir resultados.
- Agentes multi-paso sobre hardware AMD local: el soporte de tool calling y la API OpenAI permiten integrar el modelo en bucles de agente que consultan APIs o bases de datos, ejecutándose en Strix Halo o R9700 sin depender de la nube.
- Prototipado en estaciones de trabajo AMD: desarrolladores con Ryzen AI Max+ 395 o Radeon AI PRO R9700 pueden desplegar un endpoint compatible con OpenAI para pruebas de aplicaciones multimodales antes de migrar a producción.
- Análisis de imágenes en lote con concurrencia moderada: las 4 peticiones concurrentes permiten procesar pequeños lotes de imágenes con preguntas asociadas en un servidor local.
- Evaluación comparativa de runtimes: útil para equipos que comparan Loom frente a llama.cpp sobre el mismo GGUF, dado que la model card define puertas de corrección token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección figuran sin ejecución registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint Q4_K_M de un modelo de 2B parámetros más el projector BF16 cabe holgadamente en GPUs de 8 GB o más, aunque el paquete está diseñado para Strix Halo (memoria unificada) y Radeon AI PRO R9700 (32 GB).
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras AMD fuera de las dos arquitecturas citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servir la API; opciones relevantes `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295`.
- Latencia y throughput: no disponibles (sin mediciones registradas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| loom-draft/unsloth-Qwen3-VL-2B-Instruct-loom | 2B | 262.144 tokens | Apache 2.0 | GGUF Q4_K_M + programas `.loom`, runtime Loom sobre AMD | Hugging Face, 0 descargas |
| unsloth/Qwen3-VL-2B-Instruct-GGUF (modelo base) | 2B | no disponible en la información | Apache 2.0 | GGUF, ejecutable con llama.cpp | Hugging Face |
| Qwen3-VL-2B-Instruct (original) | 2B | no disponible en la información | Apache 2.0 | safetensors, ecosistema transformers/vLLM | Hugging Face |

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes; sin evidencia publicada de corrección (todas las puertas "not yet re-measured").
- Rendimiento sin medir: no hay cifras de latencia ni throughput frente a llama.cpp en ninguna de las dos GPUs objetivo.
- Hardware restringido: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se garantiza funcionamiento en otras GPUs.
- Sin modo razonamiento ni decodificación especulativa: capacidades declaradas como no aplicables.
- Límite de salida de 4.096 tokens y concurrencia máxima de 4 peticiones, lo que restringe cargas de producción de alta demanda.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo base y no está verificado en este paquete.
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen3-VL-2B-Instruct; no se documentan evaluaciones específicas en este artefacto.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pruebas de corrección desaconseja producción sin validación propia.
- Dependencia de una versión concreta del runtime (`hrx-loom[hf]==0.2.0`) y de los ficheros fijados por sha256 en `model.json.lock`.

## Enlaces

- Hugging Face: https://huggingface.co/loom-draft/unsloth-Qwen3-VL-2B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-2B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
