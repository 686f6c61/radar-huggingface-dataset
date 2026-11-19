# nace-ai/Qwen3.6-35B-A3B-MLX-KQuant

## Resumen

Qwen3.6-35B-A3B-MLX-KQuant es una cuantización en formato MLX del modelo Qwen3.6-35B-A3B, publicada por el usuario nace-ai y orientada específicamente a la inferencia en Apple Silicon. El modelo base, desarrollado por el equipo Qwen (Alibaba), es un transformer de tipo mixture-of-experts (MoE) con 35.107.181.936 parámetros totales y activación de aproximadamente 3.000 millones por token, según indica el nombre del modelo. Esta versión concreta es un empaquetado de pesos MLX en 4 y 5 bits, no un entrenamiento nuevo.

La relevancia de este repositorio reside en su enfoque en la fidelidad de la cuantización: el autor reporta que su variante Q4 queda 1,6 veces más cerca del modelo original en BF16 que el pack de 4 bits de mlx-community, medido como divergencia KL (0,059 frente a 0,096) con el mismo tamaño de pesos del modelo de lenguaje (19,51 GB). El pack ofrece dos checkpoints completos (Q4 y Q5) con 21,0 GB y 23,0 GB de descarga respectivamente, pensados para Macs con 48 GB de RAM o más.

El modelo base es multimodal (image-text-to-text), soporta modo de razonamiento (thinking) activado por defecto y tool calling, y se distribuye bajo licencia Apache 2.0. El repositorio acumula 27.244 descargas, lo que sugiere una adopción notable entre usuarios de Apple Silicon, aunque el número de likes (2) es llamativamente bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), tipo `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 (4 bits uniforme, gates del router en 8 bits), Q5 (precisión mixta 4/6/8 bits por tensor, ~4,6 bits por peso, 5,1 contando escalas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), tal como refleja la etiqueta `qwen3_5_moe` y la nomenclatura A3B (aproximadamente 3.000 millones de parámetros activos sobre 35.107 millones totales). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de atención (attention linear, decodificación especulativa) más allá de las propias del modelo base.

La contribución técnica de este repositorio es la cuantización. El pack Q4 aplica cuantización uniforme de 4 bits con los gates del router en 8 bits, replicando el esquema de mlx-lm, y logra una divergencia KL de 0,059 frente al BF16 original con 19,51 GB de pesos del modelo de lenguaje. El pack Q5 emplea precisión mixta por tensor (4, 6 y 8 bits), con un promedio de ~4,6 bits por peso, y alcanza una KL de 0,027. El autor advierte que la puntuación de Q5 se calculó sobre token IDs distintos, por lo que no reclama una mejora pareada frente a Q4. Ambos checkpoints se distribuyen como packs MLX completos e independientes.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto; la respuesta de razonamiento se devuelve en el campo `reasoning_content` (API Kapitsa) o `reasoning` (mlx-lm).
- Desactivación del razonamiento mediante `reasoning_effort: "none"` o `chat_template_kwargs: {"enable_thinking": false}`.
- Comprensión de imágenes (pipeline `image-text-to-text`): acepta imágenes como URL http(s) o data URL base64 en formato OpenAI `image_url`.
- Tool calling / function calling, verificado por el autor en `mlx_lm.server` y en LM Studio.
- Capacidades multilingües: no documentadas en la información disponible.
- Compatibilidad con APIs OpenAI, Anthropic y Ollama a través del motor Kapitsa.

## Casos de uso

- Asistente conversacional local en Mac: el pack Q4 (21,0 GB) cabe en equipos con 48 GB de RAM o más y permite servir un chat con API compatible con OpenAI mediante `mlx_lm.server` o Kapitsa, sin depender de la nube.
- Análisis de imágenes en local: gracias al pipeline image-text-to-text, se puede enviar una imagen por URL o base64 y obtener una descripción o respuesta contextualizada, útil para catalogación de imágenes o accesibilidad.
- Automatización con tool calling: el modelo coloca llamadas a herramientas a través de la API compatible con OpenAI, lo que permite integrarlo en flujos de agentes que consulten APIs externas o ejecuten acciones.
- Razonamiento paso a paso en tareas matemáticas o lógicas: con el modo thinking activado por defecto y `max_tokens` amplio (el ejemplo usa 4096), es adecuado para problemas que requieren cadena de razonamiento.
- Respuestas de baja latencia: con el modo thinking desactivado y `max_tokens` reducido (1024), el modelo responde directamente, apropiado para chatbots donde prima la velocidad sobre la profundidad de razonamiento.
- Desarrollo y prototipado en Apple Silicon: al ser un pack MLX nativo, se integra con `mlx-lm` en Python para experimentación e investigación sin GPU dedicada.
- Despliegue de API privada: Kapitsa permite `kapitsa serve --model 35b:4bit --private`, ofreciendo endpoints OpenAI, Anthropic y Ollama en localhost para aplicaciones internas.

## Benchmarks y rendimiento

| Metrica | Q4 | Q5 | Referencia |
|---|---|---|---|
| Divergencia KL frente a BF16 (menor es mejor) | 0,059 | 0,027 | mlx-community 4-bit: 0,096 |
| Tamano de pesos del modelo de lenguaje | 19,51 GB | No disponible | 19,51 GB (mlx-community 4-bit) |
| Tamano de descarga | 21,0 GB | 23,0 GB | No disponible |
| Bits por peso | 4 (router 8 bits) | ~4,6 (5,1 con escalas) | 4 |
| RAM recomendada | 48 GB+ | 48 GB+ | No disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son las métricas de fidelidad de cuantización (KL) y los tamaños de los packs. El autor indica que la comparación Q5 no es pareada por haberse evaluado sobre token IDs distintos.

## Requisitos de hardware

- RAM: 48 GB o más para ambos packs según la regla del autor (el reparto por defecto de GPU en macOS es ~2/3 de la RAM; el pack debe caber junto con 2 GB para la conversación). Kapitsa puede encajar en un tamaño inferior al omitir partes no usadas; `kapitsa doctor` verifica el equipo.
- GPU: orientado a Apple Silicon (MLX). No se documentan requisitos para GPU NVIDIA o AMD; el formato MLX no es directamente compatible con CUDA.
- Consumer GPU: no aplica en el sentido tradicional; el target son Macs con memoria unificada de 48 GB o más. No se especifican modelos concretos de Mac.
- Despliegue: `mlx-lm` (CLI, Python y servidor OpenAI en el puerto 8080), Kapitsa (servidor con APIs OpenAI, Anthropic y Ollama, puerto 8000) y LM Studio. No se mencionan vLLM, llama.cpp, Ollama nativo ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai Qwen3.6-35B-A3B-MLX-KQuant Q4 | 35,1 B totales (~3 B activos) | No disponible | 4 bits | 0,059 | Apache 2.0 | Hugging Face (MLX) |
| nace-ai Qwen3.6-35B-A3B-MLX-KQuant Q5 | 35,1 B totales (~3 B activos) | No disponible | Mixta 4/6/8 bits | 0,027 | Apache 2.0 | Hugging Face (MLX) |
| mlx-community 4-bit (referencia del autor) | 35,1 B totales (~3 B activos) | No disponible | 4 bits | 0,096 | No disponible | Hugging Face (MLX) |
| unsloth UD-3bit (referencia del autor) | 35,1 B totales (~3 B activos) | No disponible | 3 bits (dynamic) | No disponible | No disponible | Hugging Face |

La comparación se limita a los packs citados en la model card; no se dispone de datos de rendimiento en tareas que permitan comparar con modelos de otros tamaños o familias.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda los sesgos y limitaciones del Qwen3.6-35B-A3B original, que no se documentan en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fiabilidad para este pack.
- La cuantización introduce degradación respecto al BF16; el propio autor cuantifica la divergencia KL (0,059 en Q4, 0,027 en Q5), que no es cero.
- La métrica de Q5 se calculó sobre token IDs distintos, por lo que la comparación directa con Q4 y con mlx-community no es estrictamente pareada.
- Exclusivo para Apple Silicon: el formato MLX no es portable a CUDA ni a otras plataformas sin conversión.
- Requiere 48 GB de RAM o más; en Macs de menor memoria puede no encajar, y la regla de "Fits" es una aproximación, no una medición.
- El autor advierte que varios ejemplos de la model card se probaron originalmente en el pack de 9B y solo algunos se verificaron en este pack de 35B (chat y tool calling en mlx-lm 0.32.2 y LM Studio, el 12 de noviembre de 2026).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, no detalladas aquí.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Longitud de contexto no disponible, lo que impide planificar aplicaciones con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.6-35B-A3B-MLX-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio Kapitsa: https://github.com/nace-ai/kapitsa
- Instalación de Kapitsa: https://github.com/nace-ai/tap
- mlx-lm: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai
