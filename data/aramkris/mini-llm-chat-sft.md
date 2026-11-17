# aramkris/mini-llm-chat-sft

## Resumen

mini-llm-chat-sft es un modelo de lenguaje conversacional de 123.552.768 parámetros entrenado desde cero en PyTorch por aramkris como proyecto didáctico. Se trata del tercer estadio de una familia de tres checkpoints: parte de mini-llm-base (preentrenado con 2.500 millones de tokens de Mini FineWeb-Edu y cinco subconjuntos de Cosmopedia) y se afina con instrucciones sobre smol-smoltalk. El autor lo describe explícitamente como un checkpoint intermedio: el modelo final recomendado para uso conversacional es mini-llm-chat, que añade una fase de DPO contra la repetición.

Arquitectónicamente es un transformer decoder-only de 12 capas y 768 dimensiones ocultas con 12 cabezas de atención, es decir, la forma de GPT-2 small con cuatro modificaciones: RoPE en lugar de embeddings posicionales aprendidos, SwiGLU en lugar de GELU, QK-norm (normalización RMS de queries y keys por cabeza) y eliminación de todos los sesgos lineales. La ventana de contexto es de solo 512 tokens y el tokenizador es GPT-2 BPE (50.257 tokens) vía tiktoken.

Su relevancia es fundamentalmente pedagógica: documenta de forma transparente todo el pipeline (datos, hiperparámetros, hardware, curvas de pérdida y evaluaciones) en el repositorio mini_llm de GitHub, lo que lo convierte en una referencia útil para quien quiera entender el ciclo completo de preentrenamiento, SFT y alineación a pequeña escala. No está pensado para producción ni para tareas que requieran precisión factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2 small con RoPE, SwiGLU, QK-norm y sin sesgos) |
| Parametros totales | 123.552.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bfloat16/float32; no hay GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

Detalles adicionales de arquitectura: 12 capas × 768 de ancho, 12 cabezas de atención, feed-forward SwiGLU con anchura oculta de 2.048, LayerNorm pre-norm, embeddings de entrada y salida atados, tokenizador GPT-2 BPE de 50.257 tokens. Tamaño del repositorio: 0,5 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 124M parámetros con RoPE (posiciones rotatorias, sin parámetros posicionales), SwiGLU como activación del feed-forward, QK-norm (queries y keys normalizadas con RMS por cabeza) y arquitectura sin sesgos. Los embeddings de entrada y salida están atados. El tokenizador es GPT-2 BPE gestionado con tiktoken.

El entrenamiento se divide en tres fases documentadas. La fase 1 usó Mini FineWeb-Edu (versión small) más cinco subconjuntos de Cosmopedia (stories, wikihow, openstax, stanford, khanacademy), con 30.500 pasos, 499.712.000 tokens, batch de 32, contexto de 512, learning rate 0,0012 y 1.000 pasos de warmup, ejecutada en una Colab L4 en bfloat16 durante 4 h 20 min. La fase 2 continuó desde el paso 30.500 con Mini FineWeb-Edu completo y los mismos subconjuntos de Cosmopedia, retirando los documentos de validación de la fase 1 del conjunto de entrenamiento: 152.600 pasos, 2.500.198.400 tokens, ejecutados en Colab L4 hasta el paso 79.000 y luego en A100 en cuatro sesiones, con mejor pérdida de validación de 2,9633. La fase de instruction tuning (este checkpoint) usó smol-smoltalk, empaquetando conversaciones completas en 361.106 ventanas de 513 tokens con pérdida calculada solo sobre los tokens del asistente: 11.284 actualizaciones, batch de 32, 1,0 epoch, learning rate 0,0002 y 200 pasos de warmup, en Colab A100 bfloat16 durante 19 minutos, reduciendo la pérdida de respuesta en held-out de 2,316 a 1,390. No se menciona RLHF ni DPO en esta fase (el DPO llega en el checkpoint posterior mini-llm-chat).

## Capacidades

- Generación de texto en inglés fluido, con finalización de texto y respuestas conversacionales básicas.
- Respuesta a preguntas simples y conversación multi-turno dentro del formato de chat propietario (`smoltalk-plain-v1`, texto plano sin tokens especiales salvo `<|endoftext|>` como terminador de turno).
- Seguimiento parcial de instrucciones: 12 de 30 instrucciones verificadas por código en la suite de evaluación del proyecto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidades multilingües: ninguna; solo inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No realiza aritmética de forma fiable.

## Casos de uso

- Aprendizaje y docencia de pipelines LLM: el repositorio mini_llm incluye scripts por etapa (descarga de pesos, preentrenamiento, SFT, evaluación y chat) y un walkthrough día a día, lo que permite reproducir el ciclo completo en hardware modesto (Colab L4/A100) y estudiar cada decisión de diseño.
- Experimentación con arquitecturas alternativas a GPT-2 small: sirve como banco de pruebas para medir el efecto de RoPE, SwiGLU, QK-norm y la eliminación de sesgos frente a la arquitectura original de OpenAI, con una diferencia de tamaño nula (124M en ambos casos).
- Generación de texto creativo breve en inglés: con muestreo por temperatura produce texto sin repeticiones de 4 tokens (0,0% en la evaluación del autor), por lo que puede usarse para demostraciones de generación de cuentos o descripciones cortas dentro de 512 tokens.
- Evaluación comparativa de fases de alineación: al existir tres checkpoints encadenados (base, sft y chat con DPO), permite aislar el impacto de cada etapa sobre las mismas benchmarks zero-shot (HellaSwag, LAMBADA, ARC-Easy, PIQA, Winogrande).
- Prototipado de interfaces de chat: el formato de prompt en texto plano y la función `format_prompt` del paquete `mini_llm` facilitan construir demos de conversación multi-turno con streaming de tokens (`generate_stream`).
- Estudio de degradación por SFT: los datos publicados muestran cómo el instruction tuning reduce la precisión en benchmarks de conocimiento (media de 42,3 a 38,5), lo que lo convierte en un caso de estudio útil sobre el trade-off entre fluidez conversacional y conocimiento factual en modelos pequeños.

## Benchmarks y rendimiento

Pérdida en held-out (menor es mejor), medida con la suite de evaluación del proyecto en un Apple M5:

| Conjunto | Pérdida |
|---|---|
| Mini FineWeb-Edu | 4,264 |
| TinyStories (no entrenado) | 3,182 |
| WikiText-2 (no entrenado) | 6,542 |

Métricas de escritura y seguimiento:

| Métrica | Valor |
|---|---|
| Repetición de runs de 4 tokens, completion greedy | 32,9% |
| Repetición de runs de 4 tokens, completion con muestreo | 0,0% |
| Repetición de runs de 4 tokens, 100 preguntas no vistas, greedy | 16,1% |
| Respuestas que terminan por sí solas (100 preguntas no vistas) | 73% |
| Instrucciones seguidas (verificadas por código) | 12 de 30 |
| Preguntas factuales fáciles acertadas | 19 de 40 |

Benchmarks zero-shot (exactitud; HellaSwag normalizado por longitud), medidos en el proyecto origen:

| Modelo | HellaSwag | LAMBADA | ARC-Easy | PIQA | Winogrande | Media |
|---|---|---|---|---|---|---|
| OpenAI GPT-2 small (124M) | 31,1 | 32,6 | 43,8 | 62,9 | 51,6 | 44,4 |
| mini-llm-base | 32,3 | 20,3 | 46,8 | 62,4 | 49,9 | 42,3 |
| mini-llm-chat-sft | 30,1 | 13,5 | 41,8 | 59,1 | 47,9 | 38,5 |
| mini-llm-chat | 30,1 | 12,9 | 42,0 | 59,0 | 47,9 | 38,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 0,5 GB en safetensors (124M parámetros); en bfloat16 ocupa unos 250 MB de pesos, más overhead de activaciones para 512 tokens de contexto, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobrada; el autor entrenó en Colab L4 y A100, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en prácticamente todas; también en CPU y en Apple Silicon (las evaluaciones se hicieron en un Apple M5).
- Opciones de despliegue: no es compatible con `transformers.AutoModel` (arquitectura personalizada); requiere el paquete `mini_llm` del repositorio GitHub, con scripts `chat.py` y `download_weights.py`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles de forma medida; el autor reporta únicamente tiempos de entrenamiento (19 min para el SFT en A100).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media zero-shot (5 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-llm-chat-sft | 123,6M | 512 | 38,5 | MIT | Hugging Face (requiere código propio) |
| OpenAI GPT-2 small | 124M | 1.024 | 44,4 | MIT | Hugging Face, transformers nativo |
| mini-llm-base | 123,6M | 512 | 42,3 | MIT | Hugging Face (requiere código propio) |
| mini-llm-chat | 123,6M | 512 | 38,4 | MIT | Hugging Face (requiere código propio) |

Frente a GPT-2 small, el modelo pierde 5,9 puntos de media zero-shot y la mitad de contexto, pero incorpora RoPE, SwiGLU y QK-norm y está afinado para conversación. Frente a su propio modelo base, el SFT cuesta 3,8 puntos de media a cambio de capacidad conversacional y de reducción de la pérdida de respuesta en held-out (2,316 a 1,390). No se dispone de comparación con otros modelos pequeños de instrucciones (por ejemplo, SmolLM o Qwen2 pequeños) en la información proporcionada.

## Limitaciones y advertencias

- Tamaño y datos muy limitados: 124M parámetros y 2.500 millones de tokens de preentrenamiento; escribe inglés fluido pero con frecuencia produce afirmaciones falsas (el autor cita como ejemplo que responderá que la capital de Egipto es Nueva York).
- Fluidez no implica conocimiento: no debe usarse para consultas factuales, médicas, legales o financieras.
- No sigue restricciones de formato como "responde en una palabra" o "sí o no"; solo 12 de 30 instrucciones verificadas por código se cumplieron.
- Aritmética prácticamente inexistente.
- Contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no hay capacidades multilingües.
- Sin ajuste de seguridad más allá de lo que contienen los datos de entrenamiento; riesgo de sesgos y contenido inapropiado heredado de Mini FineWeb-Edu, Cosmopedia y smol-smoltalk.
- Repetición en decodificación greedy (32,9% de runs de 4 tokens en completion); se mitiga con muestreo o usando el checkpoint posterior mini-llm-chat con DPO.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado para producción ("not for anything that matters", según el autor) y carece de garantías de fiabilidad.
- Integración limitada: no carga con `transformers.AutoModel`; requiere clonar el repositorio y usar su API propia. Una clase de `transformers` está anunciada como pendiente pero no disponible.
- Es un checkpoint intermedio: para uso conversacional el autor recomienda mini-llm-chat.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/mini-llm-chat-sft
- Modelo base: https://huggingface.co/aramkris/mini-llm-base
- Modelo final con DPO: https://huggingface.co/aramkris/mini-llm-chat
- Repositorio de código, pipeline y evaluaciones: https://github.com/a-ramakrishnan/mini_llm
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
