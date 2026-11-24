# AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ

## Resumen

AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ es una cuantizacion de 3,70 bits por peso del modelo Qwen/Qwen3.8-27B de Qwen, empaquetada en formato MLX para su ejecucion en Apple Silicon. El repositorio ocupa 13,37 GB en un unico `model.safetensors` e incluye la torre de vision, lo que permite entrada de imagen y texto con un peso en disco reducido frente a la conversion bf16 original. El modelo base cuenta con 27.356.728.560 parametros totales, de los cuales aproximadamente 26,9 mil millones corresponden al modelo de lenguaje y 0,46 mil millones a la torre de vision.

La relevancia de esta ficha no reside en el modelo base, sino en el proceso de cuantizacion: AtomicChat aplica la receta `mixed_3_4` de mlx-lm (3 bits en la mayoria de capas, 4 bits en embeddings, cabeza de salida, la mitad de las proyecciones down del MLP y la mitad de las proyecciones value de atencion), con busqueda de clipping por grupo y un paso posterior de destilacion de pesos (DWQ) usando su build MLX de 8 bits como profesor. El resultado declara una divergencia KL media de 0,166 y una coincidencia top-1 del 82,4% frente a la conversion bf16, lo que sitúa esta variante por delante de la cuantizacion uniforme de 3 bits (0,215 / 79,6%) con solo 0,68 GB adicionales en disco.

El modelo esta pensado para inferencia local en Macs con memoria unificada suficiente, no para servidores GPU. La model card advierte que las metricas se midieron en CUDA con mlx-lm y mlx-vlm, que no hay ninguna ejecucion registrada en Mac de este archivo concreto y que la entrada de imagen no se probo en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de vision; tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.356.728.560 (26,9B en el modelo de lenguaje + 0,46B en la torre de vision) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,70 bits por peso (receta `mixed_3_4` de mlx-lm, grupo 64, clipping search + DWQ); torre de vision en bf16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 segun la model card; el campo de licencia del repositorio figura como no disponible |
| Formato de pesos | safetensors (MLX), un unico `model.safetensors` de 13,37 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con una torre de vision separada que se mantiene en bf16 en esta conversion. La cuantizacion se realizo en dos fases sobre la conversion bf16 propia de AtomicChat (`AtomicChat/Qwen3.8-27B-MLX-bf16`): primero una conversion `mixed_3_4` de mlx-lm con busqueda de clipping para el rango de cuantizacion de cada grupo, y despues DWQ (distillation-based weight quantization), que ajusta escalas y offsets por destilacion tomando como profesor el build MLX de 8 bits del mismo modelo. El proceso completo se describe como una ejecucion corta de una a dos horas en una sola GPU.

El reparto de precision de la receta `mixed_3_4` es concreto: 3 bits en la mayoria de las capas y 4 bits en los embeddings de tokens, la cabeza de salida, 32 de las 64 proyecciones down del MLP y 8 de las 16 proyecciones value de atencion, con tamano de grupo 64. No se dispone de informacion sobre el dataset de entrenamiento del modelo original, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO; la model card solo documenta el procedimiento de cuantizacion y evaluacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (`apply_chat_template`).
- Entrada de imagen y texto (pipeline `image-text-to-text`), con la torre de vision intacta en bf16.
- Inferencia local en Apple Silicon mediante mlx-lm para texto y mlx-vlm para imagen.
- No hay informacion en la model card sobre tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni capacidades de agente.
- Cobertura multilingue: solo `en` declarado en los metadatos del repositorio.
- No se documentan capacidades de codigo o matematicas especificas para esta variante cuantizada.

## Casos de uso

- Inferencia local offline en Mac: cargar el repositorio con mlx-lm en un equipo Apple Silicon con memoria unificada suficiente para 13,37 GB de pesos mas overhead de activaciones y KV cache, sin dependencia de servicios en la nube.
- Asistente conversacional de escritorio: integracion en la aplicacion Atomic Chat, que ejecuta modelos open-weight de forma local; el modelo cubre dialogos multi-turno en ingles con plantilla de chat estandar.
- Procesamiento de imagenes con descripcion textual: usar mlx-vlm con el mismo identificador de repositorio para tareas de image-text-to-text, asumiendo que la model card advierte que la entrada de imagen no se probo en esta variante concreta.
- Prototipado y evaluacion de tecnicas de cuantizacion: el repositorio sirve como referencia reproducible de la receta `mixed_3_4` con DWQ, con logs de KLD publicados en `AtomicChat/Qwen3.8-27B-MLX-metrics`.
- Comparacion de compromisos tamano-calidad: elegir entre las variantes de 3,50, 3,70, 3,80, 4,50 y 5,00 bpw del mismo autor segun la memoria disponible y la fidelidad requerida frente a bf16.
- Despliegue en entornos con restricciones de almacenamiento: 13,37 GB en un unico safetensors facilita distribucion y cache local frente a builds de mayor precision como el de 4,50 bpw (16,05 GB) o el de 5,00 bpw (17,74 GB).

## Benchmarks y rendimiento

Las unicas metricas publicadas son de fidelidad de cuantizacion, no de capacidad de tarea. Se midieron con el harness MLX de AtomicChat en 1x H200 NVL, mlx-lm 0.31.3 y mlx-vlm 0.6.15, sobre texto neutro retenido (24 fragmentos de 4096 tokens, puntuando la segunda mitad de cada fragmento).

| Repositorio | Layout | Bits por peso | En disco | KLD media | Mismo top-1 |
|---|---|---:|---:|---:|---:|
| AD-3.50bpw-DWQ-12.7GB | 3 bits uniforme | 3,50 | 12,69 GB | 0,215 | 79,6% |
| **AD-3.70bpw-DWQ-13.4GB** (este) | mlx-lm `mixed_3_4` | **3,70** | **13,37 GB** | **0,166** | **82,4%** |
| AD-3.80bpw-DWQ-13.7GB | por tensor, propio | 3,80 | 13,69 GB | 0,148 | 82,3% |
| AD-4.50bpw-DWQ-16.0GB | 4 bits uniforme | 4,50 | 16,05 GB | 0,053 | 89,5% |
| AD-5.00bpw-DWQ-17.7GB | por tensor, propio | 5,00 | 17,74 GB | 0,031 | 91,5% |

Como referencia, las conversiones simples de 3 y 4 bits (grupo 64, sin clipping search ni DWQ) midieron 0,223 / 78,5% y 0,056 / 89,1% en el mismo banco. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 13,37 GB solo de pesos; hay que sumar overhead de activaciones y KV cache, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada y margen practico a partir de 24-32 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente (series M con 24 GB o mas). Las metricas de la model card se obtuvieron en 1x NVIDIA H200 NVL, pero el formato MLX esta orientado a Apple Silicon.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o superior, con margen limitado en el caso de 16 GB.
- Opciones de despliegue: mlx-lm (`pip install mlx-lm`) para texto y mlx-vlm (`pip install mlx-vlm`) para imagen. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; el autor publica una variante GGUF separada.
- Latencia y throughput: no disponibles. La model card no aporta mediciones de velocidad y advierte que no hay ninguna ejecucion en Mac registrada para este archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | En disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ** | 27,36B | no disponible | 3,70 bpw MLX + DWQ | 13,37 GB | apache-2.0 (segun card) | Hugging Face, MLX |
| AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB | 27,36B | no disponible | 4,50 bpw MLX + DWQ | 16,05 GB | apache-2.0 (segun card) | Hugging Face, MLX |
| AtomicChat/Qwen3.8-27B-MLX-bf16 | 27,36B | no disponible | bf16 | no disponible | apache-2.0 (segun card) | Hugging Face, MLX |
| AtomicChat/Qwen3.8-27B-GGUF | 27,36B | no disponible | GGUF (varias) | no disponible | apache-2.0 (segun card) | Hugging Face, llama.cpp |

La comparacion con modelos de otros autores no esta disponible en la informacion proporcionada; las alternativas documentadas son las distintas variantes de cuantizacion del mismo modelo base publicadas por AtomicChat.

## Limitaciones y advertencias

- Las metricas de KLD y top-1 se midieron en CUDA, no en Mac, y la model card confirma que no hay ninguna ejecucion en Mac registrada para este archivo.
- La entrada de imagen no se probo en esta variante, pese a incluir la torre de vision.
- KLD y top-1 se calculan sobre un unico conjunto de texto retenido y no miden chat, uso de herramientas ni contexto largo.
- El campo de licencia del repositorio figura como no disponible; la model card afirma apache-2.0, heredada del modelo original, por lo que conviene verificar la licencia del modelo base antes de uso comercial.
- Idiomas: solo ingles declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible para esta variante.
- Al ser una cuantizacion de 3,70 bpw, la fidelidad frente a bf16 es limitada (KLD 0,166, top-1 82,4%); para tareas sensibles a la precision conviene valorar las variantes de 4,50 o 5,00 bpw.
- El formato MLX restringe el despliegue a Apple Silicon; no es directamente utilizable en stacks CUDA sin reconversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion bf16 MLX del autor: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-bf16
- Variante 3,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.50bpw-DWQ-12.7GB
- Variante 3,80 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB
- Variante 4,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB
- Variante 5,00 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB
- Variante GGUF: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Log de KLD: https://huggingface.co/datasets/AtomicChat/Qwen3.8-27B-MLX-metrics/blob/main/logs/kld-Qwen3.8-27B-MLX-mixed_3_4-CLIP-DWQ.json
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X: https://x.com/atomic_chat_hq
