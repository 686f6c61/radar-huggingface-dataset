# saidutta69/Qwen2.5-1.5B-Instruct-heretic

## Resumen

Qwen2.5-1.5B-Instruct-heretic es una variante "decensored" del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicada por el usuario saidutta69 (bajo el alias RACER IS OP). No se trata de un fine-tune nuevo: es el mismo checkpoint base al que se le ha aplicado una ablación direccional de pesos ("abliteration") mediante la herramienta Heretic v1.2.0, que suprime el comportamiento de rechazo editando selectivamente las proyecciones de salida de atención (`attn.o_proj`) y las down-projections del MLP (`mlp.down_proj`).

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales y una ventana de contexto de 32.768 tokens (heredada del base Qwen2.5). Su interés radica en que ofrece el comportamiento directo y sin rechazos típico de los modelos abliterated en un tamaño de 1,5B que cabe en CPU y en GPUs de gama baja, manteniendo supuestamente la mayor parte del conocimiento y del instruction-following del original.

Es relevante para desarrolladores que trabajan con agentes locales, roleplay, investigación sobre mecánicas de alineación y rechazo, o cualquier caso de uso bloqueado por el exceso de refusal de los modelos ajustados con RLHF. El repositorio incluye el juego completo de cuantizaciones GGUF (15 ficheros, de Q2_K a F16) generadas con llama.cpp, lo que facilita el despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), con atención de causal estándar y RoPE |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; safetensors en precisión nativa |
| Idiomas soportados | en (inglés; el base Qwen2.5 soporta más idiomas, pero la model card solo declara inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-1.5B-Instruct original: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU en el MLP y embeddings de posición rotatorios (RoPE). No hay innovaciones arquitectónicas propias en esta variante; el cambio respecto al base es exclusivamente a nivel de pesos.

El proceso de creación no es un entrenamiento sino una ablación direccional aplicada con Heretic v1.2.0. Se identifica una "dirección de rechazo" en el espacio de activaciones y se resta de forma ponderada de las proyecciones de salida de atención y de las down-projections del MLP. Los parámetros reportados por el autor incluyen `direction_index` 18.83, pesos máximos y mínimos por capa y distancias de decaimiento tanto para `attn.o_proj` como para `mlp.down_proj`. Según la model card, la edición es estrecha y dirigida, con una divergencia KL de 0,1607 respecto a la distribución de salida del original, lo que sugiere que las capacidades del base se preservan en gran medida. No se documentan datos de entrenamiento adicionales, RLHF ni DPO específicos para esta variante.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen2.5 (`apply_chat_template`).
- Razonamiento y coherencia suficientes para su tamaño; el autor indica que supera al variante de 0,5B en razonamiento y coherencia.
- Generación de código y matemáticas básicas heredadas del base Qwen2.5-1.5B-Instruct.
- Respuestas directas sin rechazos en la gran mayoría de prompts adversarios (según la model card, 1 rechazo de cada 100 frente a 99 de cada 100 del original).
- Soporte de tool calling y function calling heredado del formato de chat de Qwen2.5 (no documentado explícitamente en la model card de esta variante).
- Capacidades multilingües limitadas según la model card, que declara únicamente inglés.
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Agentes locales en CPU o GPU de gama baja: con cuantización Q4_K_M (940 MB) el modelo cabe en RAM de sistema y permite ejecutar bucles de agente con tool calling en portátiles sin GPU dedicada, usando llama.cpp u Ollama.
- Roleplay y personajes sin restricciones: la supresión del rechazo permite mantener conversaciones de rol que el modelo base bloquearía, con contexto de hasta 32.768 tokens para mantener la coherencia de personaje en sesiones largas.
- Investigación sobre alineación y mecánicas de rechazo: sirve como contrapunto experimental al Qwen2.5-1.5B-Instruct original para estudiar cómo la ablación direccional afecta a la distribución de salidas (KL de 0,1607) y al comportamiento de refusal.
- Prototipado rápido de chatbots: el tamaño reducido y las cuantizaciones GGUF permiten iterar en local con LM Studio, Jan o llama.cpp sin depender de APIs externas.
- Generación de texto en pipelines de CI/CD: al ser un modelo pequeño y con licencia Apache 2.0, puede integrarse en tests automatizados de generación de texto o en tareas de reescritura y resumen dentro de flujos de desarrollo.
- Fine-tuning posterior: al conservar la arquitectura y los pesos base, sirve como punto de partida para ajustes específicos de dominio donde el refusal del original interferiría con los datos de entrenamiento.
- Despliegue en dispositivos con 6 GB de VRAM: la cuantización Q5_K_M (1,05 GB) encaja en GPUs como GTX 1660 Super, RTX 2060 o portátiles con RTX 3050, según la tabla del autor.

## Benchmarks y rendimiento

La model card incluye una comparación limitada con el modelo original, pero advierte explícitamente que esta ejecución es anterior al directorio `reproduce/` y que no se registraron métricas de refusal ni de KL para este checkpoint concreto, por lo que no deben citarse como puntuaciones oficiales.

| Metrica | Este modelo | Qwen/Qwen2.5-1.5B-Instruct |
|---|---|---|
| Divergencia KL | 0,1607 | 0 (por definición) |
| Rechazos (100 prompts adversarios) | 1/100 | 99/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para cuantizaciones Q4_K_M (940 MB) y Q5_K_M (1,05 GB); alrededor de 1,5 GB para Q8_0 (1,53 GB); unos 2,9 GB para F16 (2,88 GB). El autor recomienda añadir aproximadamente 1 GB adicional para el contexto.
- GPU recomendadas según el autor: RTX 3060, 4070 o 5070 (12 GB) para Q8_0; RTX 4060 o 3070 (8 GB) para Q6_K; GTX 1660 Super, RTX 2060 o RTX 3050 laptop (6 GB) para Q5_K_M.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM; también en CPU-only y Apple Silicon con Q4_K_M en RAM de sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang, transformers y text-generation-inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Refusal | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-heretic | 1,54B | 32.768 | Apache 2.0 | 1/100 (según model card) | Hugging Face, GGUF y safetensors |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | 99/100 (según model card) | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B aprox. | 32.768 | Apache 2.0 | no disponible | Hugging Face |

La comparación con otras variantes abliterated de la misma familia (por ejemplo, versiones heretic de 0,5B o 3B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La supresión del rechazo es deliberada: el modelo responderá a prompts que el original bloquearía, lo que incluye contenido potencialmente dañino, ofensivo o inseguro. No es apto para despliegues orientados al público sin filtros externos.
- La model card advierte que esta ejecución no registró métricas de refusal ni de KL para este checkpoint concreto; los valores de la tabla deben tratarse con cautela.
- La divergencia KL de 0,1607 implica una alteración medible de la distribución de salidas; pueden aparecer degradaciones sutiles en coherencia o instruction-following frente al original.
- El modelo solo declara inglés en la model card, aunque el base Qwen2.5 soporta más idiomas; el rendimiento multilingüe tras la ablación no está verificado.
- Riesgo de alucinación inherente a un modelo de 1,5B; no es adecuado para tareas que requieran alta precisión factual sin verificación externa.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensored puede entrar en conflicto con políticas de plataformas, términos de servicio de proveedores cloud o normativa sobre contenido.
- El autor no documenta sesgos específicos introducidos por la ablación; los sesgos del base Qwen2.5-1.5B-Instruct se mantienen presumiblemente intactos.
- El repositorio ocupa 20 GB por incluir 15 cuantizaciones GGUF además de los pesos safetensors; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen2.5-1.5B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
