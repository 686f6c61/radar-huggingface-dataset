# chenzs/H3-Heretic-Encoder-BF16

## Resumen

H3-Heretic-Encoder-BF16 es un checkpoint parcial de Qwen3-VL-32B empaquetado para ComfyUI dentro del ecosistema H3. No es un modelo generativo completo: contiene únicamente el embedding de tokens, las capas de lenguaje 0–49 y la torre de visión completa del modelo base `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, una variante "abliterated" (sin rechazo) del Qwen3-VL-32B-Instruct. El autor, chenzs, publica el encoder en BF16 (47,97 GiB) junto con variantes INT8 ConvRot y "tails" de generación opcionales que completan las capas 50–63.

La relevancia es de nicho pero concreta: H3 consume el estado oculto no normalizado tras la capa 49 del transformer de lenguaje, de modo que separar encoder y "tail" permite cargar el codificador de condicionamiento (texto e imagen) sin el coste de memoria de la cabeza LM y las capas finales, y descargar el tail tras cada generación. Esto encaja en flujos de difusión y de prompt enhancement en ComfyUI, donde el encoder se mantiene residente y el generador se carga bajo demanda.

El modelo hereda la arquitectura Qwen3-VL (transformer denso de 32B con torre de visión) y la licencia Apache 2.0 del base, pero la información publicada no detalla el contexto nativo, la composición del dataset de entrenamiento ni resultados de benchmarks. La model card advierte explícitamente de que estos ficheros son checkpoints de ComfyUI y no un repositorio completo de generación para Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3-VL): torre de visión + capas de lenguaje; este checkpoint incluye embedding, capas 0–49 y torre de visión completa |
| Parametros totales | No disponible (el repo pesa 51,5 GB; el encoder BF16 solo son 47,97 GiB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (este repo), INT8 ConvRot (group size 256), NVFP4/AWQ (solo en el tail de la variante Instruct) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ComfyUI); BF16 e INT8 ConvRot |
| Tamano del encoder BF16 | 51.506.295.440 bytes (47,97 GiB), 902 tensores |
| Tamano del encoder INT8 ConvRot | 26.363.476.151 bytes (24,55 GiB), 1.604 tensores |
| Capas incluidas | Embedding, lenguaje 0–49, torre de visión completa; excluye capas 50–63, norm final y LM head |
| SHA-256 (BF16) | `bbcd92a732e911cfafd86960e0e26aacc6efe949e02f16a9641f201c62984860` |

## Arquitectura y entrenamiento

El checkpoint es un recorte estructural de Qwen3-VL-32B-Instruct en su variante "ultra-uncensored-heretic". H3 consume el hidden state sin normalizar tras la capa de lenguaje 49, por lo que el encoder conserva el embedding de tokens, las 50 primeras capas y la torre de visión íntegra, y omite deliberadamente las capas 50–63, la normalización final y la cabeza LM. La variante INT8 ConvRot aplica cuantización row-wise aprendida (350 matrices de lenguaje con grupo 256) y mantiene en BF16 la torre de visión y todas las normas; el embedding usa cuantización tensorwise simple.

Los "tails" de generación (capas 50–63 + norm final + LM head) se publican en BF16 (15,2 GB), INT8 ConvRot (7,6 GB) y NVFP4/AWQ (5,4 GB, solo para la variante Instruct). No reutilizan tokenizer, embedding ni torre de visión: dependen del encoder conectado. La model card no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el proceso "abliterated/heretic" del modelo base tampoco se describe en la información disponible.

## Capacidades

- Codificación de condicionamiento texto-imagen para pipelines H3 en ComfyUI (extracción del hidden state tras la capa 49).
- Procesamiento de imágenes mediante la torre de visión completa del Qwen3-VL-32B.
- Generación de texto y visión-lenguaje solo si se conecta un tail 50–63 compatible (BF16, INT8 ConvRot o NVFP4/AWQ).
- Prompt enhancement opcional mediante el nodo H3 Prompt Enhancer con tail conectado.
- Integración con el nodo externo `ComfyUI-H3-Qwen3VL-TextGen` para uso como generador local autónomo cuando se empareja con un tail.
- Capacidades multilingües: limitadas a inglés según la metadata del repo.
- Tool calling, function calling, agentes y modo thinking: no documentados en la información disponible.

## Casos de uso

- Condicionamiento en flujos de difusión H3 dentro de ComfyUI: el encoder se mantiene cargado en memoria y proporciona embeddings de texto e imagen sin necesidad de mantener la cabeza LM residente, reduciendo el pico de VRAM frente al modelo completo.
- Prompt enhancement local: conectando el encoder 0–49 al nodo H3 Prompt Enhancer y un tail 50–63 en el desplegable `clip_tail`, se reescriben prompts de usuario antes de pasarlos al nodo guía de H3.
- Generación texto-imagen a texto bajo demanda: con el nodo standalone de TextGen, el tail se carga temporalmente, se genera la respuesta y se descarga, liberando memoria entre invocaciones.
- Sistemas con VRAM limitada: la variante INT8 ConvRot (24,55 GiB) permite ejecutar el encoder en GPUs de 32 GB donde el BF16 de 47,97 GiB no cabe, manteniendo la torre de visión en BF16.
- Investigación sobre modelos "abliterated": el checkpoint permite estudiar el comportamiento de la variante sin rechazo en tareas de condicionamiento y generación, comparándola con el tail Instruct oficial incluido en el mismo repo.
- Prototipado de asistentes visuales locales: emparejando encoder y tail Instruct en el nodo standalone se obtiene un pipeline de visión-lenguaje ejecutable en una estación de trabajo, sin depender de APIs externas.
- Evaluación de cuantizaciones: la coexistencia de BF16, INT8 ConvRot y NVFP4/AWQ permite medir el impacto de cada formato en la calidad del condicionamiento y de la generación con el mismo encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Encoder BF16: 47,97 GiB de pesos; requiere al menos 48 GB de VRAM solo para el encoder, más overhead de activaciones. GPU de 80 GB (A100, H100) o configuraciones multi-GPU.
- Encoder INT8 ConvRot: 24,55 GiB; viable en GPUs de 32 GB (V100 32 GB, A100 40 GB, RTX 5090 32 GB) y ajustado en 24 GB con cuantización adicional del resto del pipeline.
- Tail BF16: 15,2 GB adicionales durante la generación; tail INT8 ConvRot: 7,6 GB; tail NVFP4/AWQ: 5,4 GB.
- Combinación completa BF16 (encoder + tail): aproximadamente 63 GB de pesos, fuera del alcance de GPUs de consumo.
- Combinación INT8 ConvRot (encoder + tail): aproximadamente 32 GB, al límite de una RTX 5090 o A100 40 GB.
- Despliegue: ComfyUI con `CLIPLoader` y tipo de text-encoder compatible con H3, más el nodo externo `ComfyUI-H3-Qwen3VL-TextGen` para generación standalone. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| H3-Heretic-Encoder-BF16 (este) | Parcial de 32B (capas 0–49 + visión) | No disponible | safetensors BF16 / INT8 ConvRot | Apache 2.0 | Solo encoder de condicionamiento; requiere tail para generar |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | 32B | No disponible | safetensors | Apache 2.0 | Modelo base completo "abliterated"; generación autónoma |
| ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot | Parcial de 32B | No disponible | safetensors INT8 ConvRot | Apache 2.0 | Publicación equivalente con foco en INT8 ConvRot |
| Qwen3-VL-32B-Instruct (oficial) | 32B | No disponible | safetensors | Apache 2.0 | Variante alineada con rechazo; tails Instruct incluidos en este repo |

## Limitaciones y advertencias

- No es un modelo autónomo: sin un tail 50–63 conectado no puede generar texto; la model card lo recalca explícitamente.
- No es un repositorio Transformers completo: requiere ComfyUI y su dependencia fijada `comfy-kitchen`.
- El modelo base es "abliterated/heretic": se ha eliminado el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o NSFW sin filtros. No apto para producción orientada al público sin moderación externa.
- Riesgo de alucinación inherente a los modelos de 32B, no cuantificado en la información disponible.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en conversaciones largas.
- La licencia Apache 2.0 permite uso comercial, pero la variante "uncensored" puede incumplir políticas de plataformas o requisitos regulatorios en determinados despliegues.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación.
- Los ficheros NVFP4/AWQ solo existen para el tail Instruct, no para el encoder Heretic; mezclar encoder Heretic con tail Instruct altera el comportamiento respecto al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chenzs/H3-Heretic-Encoder-BF16
- Modelo base: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Publicación equivalente INT8 ConvRot: https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Fichero BF16 del encoder (espejo): https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot/blob/main/qwen3vl_32b_h3_ultra_uncensored_heretic_bf16.safetensors
- Nodo de generación standalone: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
