# OfficerAction/Qwen3.6-35B-A3B-Q4_K-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Con 35.505.251.456 parámetros totales y una arquitectura que combina atención, capas SSM (state space model) y expertos enrutados, está disenado para generación de texto conversacional y tareas de razonamiento. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF publicada por el usuario OfficerAction bajo el identificador `OfficerAction/Qwen3.6-35B-A3B-Q4_K-GGUF`.

La aportación concreta de esta publicación es una re-cuantización de los pesos BF16 de bartowski usando Q4_K en lugar de Q4_0 para todos los tensores de 4 bits, manteniendo exactamente el mismo tamano de archivo (20,75 GB) y el mismo imatrix. Según el autor, esto reduce la divergencia KL respecto al modelo BF16 de 0,0300 a 0,0208 en texto en prosa y de 0,0816 a 0,0606 en tareas de reescritura, es decir, aproximadamente un 30 % más cerca del modelo completo sin coste adicional de memoria.

Es relevante para quienes despliegan el modelo en hardware con restricciones de VRAM y quieren maximizar la fidelidad al BF16 sin cambiar el presupuesto de memoria. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE, capas SSM y capa MTP (multi-token prediction) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de `llama-server` usa `-c 32768`) |
| Tipos de cuantizacion | Q4_K (mayoría de tensores 4-bit), Q5_0/Q8_0 (expertos compartidos), Q6_K (output), Q8_0/Q6_K (atención K/V, MTP), F32/BF16 (norms, SSM, routers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.6-35B-A3B-Q4_K.gguf`, 20.752.356.992 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención con capas SSM (state space model) y un esquema MoE con expertos enrutados (`ffn_{gate,up,down}_exps` en las capas 0–39) más expertos compartidos (`*_shexp`). Incluye además una capa de predicción multi-token (MTP, `blk.40`) que permite decodificación especulativa. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y las fases de RLHF/DPO no están disponibles en la información proporcionada.

La innovación técnica de esta ficha concreta es la metodología de cuantización: se parte de la conversión BF16 e imatrix de bartowski y se re-cuantizan todos los tensores Q4_0/Q4_1 como Q4_K desde BF16 con el mismo imatrix, usando el cuantizador de ggml. Q4_K emplea una escala y un mínimo por cada 32 pesos almacenados como valores de 6 bits bajo dos super-bloques fp16, lo que mejora el redondeo sin alterar el layout ni el consumo de memoria (4,5 bits por peso, 144 bytes por 256 pesos). El pipeline fue validado reproduciendo exactamente los bytes de bartowski en 13 tensores de muestra.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y tareas de reescritura y resumen (evaluadas en la model card mediante KL divergence sobre tareas de rewrite y summary).
- Procesamiento de imágenes: existe un proyector de visión compatible (`mmproj-Qwen_Qwen3.6-35B-A3B-f16.gguf`) del repositorio de bartowski, aunque el autor indica que no fue probado con este archivo.
- Decodificación especulativa mediante la capa MTP incluida en el GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en servidor con llama.cpp: usar `llama-server -m Qwen3.6-35B-A3B-Q4_K.gguf --jinja -c 32768` para servir el modelo con plantilla de chat Qwen y ventana de 32k tokens, aprovechando que el archivo ocupa lo mismo que un Q4_0 pero con menor divergencia respecto al BF16.
- Inferencia en CPU con memoria limitada: al mantener el mismo número de bytes leídos por token que Q4_0, el rendimiento en hardware memory-bound es equivalente, pero la calidad es superior; adecuado para estaciones de trabajo sin GPU de gran VRAM.
- Tareas de reescritura y resumen de documentos: la model card mide específicamente la calidad en rewrite/summary (KL 0,0606 frente a 0,0816 de Q4_0), por lo que es un caso de uso directamente validado por el autor.
- Asistentes conversacionales en producción: el tag `conversational` y los parámetros de muestreo recomendados por Qwen (`--temp 1.0 --top-p 0.95 --top-k 20`) permiten integrarlo en pipelines de chat multi-turno.
- Aceleración con decodificación especulativa: la inclusión de la capa MTP (`blk.40`) permite emplear decodificación especulativa en backends que la soporten, reduciendo latencia en generación autoregresiva.
- Evaluación comparativa de cuantizaciones: útil como referencia para equipos que comparan Q4_0, IQ4_NL, Q4_K y Q4_K_M sobre el mismo modelo base, ya que el autor publica métricas KL reproducibles.
- Prototipado multimodal: con el proyector de visión de bartowski puede habilitarse entrada de imagen, aunque el autor advierte que no lo ha probado con este archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de divergencia KL frente al modelo BF16, que reproducimos a continuación:

| Archivo | Tamano | KL prosa | KL rewrite | Mismo token top (prosa) |
|---|---|---|---|---|
| bartowski Q4_0 | 20,75 GB | 0,0300 | 0,0816 | 92,82 % |
| **este archivo (Q4_K)** | **20,75 GB** | **0,0208** | **0,0606** | **94,31 %** |
| IQ4_NL (misma receta y tamano) | 20,75 GB | 0,0240 | 0,0667 | 93,94 % |
| unsloth UD-IQ4_NL_XL | 19,50 GB | 0,0228 | 0,0542 | 94,18 % |
| AesSedai Q4_K_M | 23,04 GB | 0,0107 | 0,0313 | 96,16 % |

El autor reporta que frente a Q4_0 de bartowski la KL es 0,69× en prosa (intervalo del 95 %: 0,66–0,73) y 0,74× en rewrite (0,61–0,93), calculado con bootstrap pareado sobre chunks. No se han publicado mediciones de velocidad (tokens/s) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,75 GB solo para los pesos; hay que anadir el espacio para el contexto KV cache, que crece con la ventana configurada (32k en el ejemplo del autor).
- GPU recomendadas: no especificadas en la información disponible; por tamano, requiere GPUs con al menos 24 GB de VRAM para pesos más caché reducida, o bien desglose por capas en GPU.
- Cabe en consumer GPU: sí en tarjetas de 24 GB (por ejemplo, RTX 3090/4090) con contexto limitado, y en GPUs de 32 GB o más con mayor margen. En GPUs de 16 GB no cabe sin offloading a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` documentados por el autor). El autor indica que los kernels Q4_K están soportados en los backends CPU, CUDA, Metal y Vulkan de llama.cpp. Otros runners (Ollama, vLLM, TGI) no están mencionados en la información disponible.
- Latencia y throughput: no medidos. El autor estima que, al leer los mismos bytes por token que Q4_0, el rendimiento en hardware memory-bound será similar al de Q4_0; en CPUs compute-bound los kernels Q4_K podrían ser algo más lentos o rápidos según el backend.

## Comparativa con modelos similares

| Modelo / cuantización | Parametros | Contexto | Tamano | Calidad (KL prosa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este archivo (Q4_K) | 35,5 B totales | no disponible | 20,75 GB | 0,0208 | Apache 2.0 | Hugging Face (GGUF) |
| bartowski Q4_0 | 35,5 B totales | no disponible | 20,75 GB | 0,0300 | Apache 2.0 | Hugging Face (GGUF) |
| unsloth UD-IQ4_NL_XL | 35,5 B totales | no disponible | 19,50 GB | 0,0228 | Apache 2.0 | Hugging Face (GGUF) |
| AesSedai Q4_K_M | 35,5 B totales | no disponible | 23,04 GB | 0,0107 | Apache 2.0 | Hugging Face (GGUF) |

Todas las alternativas comparadas son cuantizaciones del mismo modelo base Qwen3.6-35B-A3B, por lo que comparten arquitectura, parámetros y licencia; la diferencia está en el equilibrio entre tamano y fidelidad al BF16.

## Limitaciones y advertencias

- El metadato `general.file_type` del GGUF es 2 (Q4_0), heredado de bartowski, por lo que herramientas que muestren el tipo de archivo reportarán Q4_0 aunque los tensores sean Q4_K.
- El proyector de visión de bartowski no ha sido probado con este archivo; el soporte multimodal no está garantizado.
- No se han publicado mediciones de velocidad ni de rendimiento en benchmarks estándar; las únicas métricas son de divergencia KL.
- La información sobre idiomas soportados, tool calling y capacidades de agente no está disponible en la ficha.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Qwen3.6-35B-A3B.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base en el enlace de licencia indicado por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- El autor no garantiza el rendimiento en backends distintos de llama.cpp.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/OfficerAction/Qwen3.6-35B-A3B-Q4_K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Conversión BF16 e imatrix de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
