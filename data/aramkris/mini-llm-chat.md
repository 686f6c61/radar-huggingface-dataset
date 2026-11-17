# aramkris/mini-llm-chat

## Resumen

mini-llm-chat es un modelo de lenguaje conversacional de 123.552.768 parámetros desarrollado por aramkris como proyecto de aprendizaje, construido desde cero en PyTorch puro. Se trata del cuarto y último estadio de una familia de modelos: parte de mini-llm-base (preentrenado sobre 2.500 millones de tokens de Mini FineWeb-Edu y cinco subconjuntos de Cosmopedia), pasa por un ajuste de instrucciones con smol-smoltalk (mini-llm-chat-sft) y culmina en este checkpoint tras un ajuste de preferencias con DPO orientado a reducir la repetición y favorecer que las respuestas terminen por sí solas.

La arquitectura replica la forma de GPT-2 small (12 capas, anchura 768, 12 cabezas) con cuatro modificaciones: embeddings posicionales rotatorios (RoPE) en lugar de posicionales aprendidos, feed-forward SwiGLU con anchura oculta de 2.048, normalización QK por cabeza con RMSNorm y eliminación de todos los sesgos. La longitud de contexto es de 512 tokens y el modelo solo soporta inglés. Usa un tokenizador GPT-2 BPE de 50.257 tokens vía `tiktoken`.

Su relevancia es fundamentalmente didáctica: documenta de forma transparente todo el pipeline (preentrenamiento, SFT, DPO, evaluación) en un repositorio público, con métricas honestas que evidencian las limitaciones de un modelo de este tamaño. No está pensado para producción ni para tareas que requieran fiabilidad factual. La licencia es MIT y el repositorio ocupa 0,5 GB en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2 small con RoPE, SwiGLU, QK-norm, sin sesgos) |
| Parámetros totales | 123.552.768 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el repo no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y anchura 768 con 12 cabezas de atención. Incorpora RoPE para las posiciones (sin parámetros posicionales aprendidos), feed-forward SwiGLU con anchura oculta de 2.048, normalización QK por cabeza mediante RMSNorm sobre queries y keys, LayerNorm pre-norm y embeddings de entrada y salida atados (weight tying). No tiene sesgos en ninguna capa. El tokenizador es GPT-2 BPE de 50.257 tokens implementado con `tiktoken`. La arquitectura es personalizada y no carga con `transformers.AutoModel`; requiere el código del repositorio `mini_llm`.

El entrenamiento se organizó en cuatro fases. La etapa 1 usó Mini FineWeb-Edu (small) más cinco subconjuntos de Cosmopedia (stories, wikihow, openstax, stanford, khanacademy), con 30.500 pasos, 499.712.000 tokens, batch de 32, contexto 512, learning rate 0,0012 y 1.000 pasos de warmup, en una Colab L4 en bfloat16 durante 4 h 20 min. La etapa 2 continuó desde el paso 30.500 con Mini FineWeb-Edu completo y los mismos subconjuntos de Cosmopedia (eliminando los documentos de validación de la etapa 1), alcanzando 152.600 pasos y 2.500.198.400 tokens, con mejor pérdida de validación de 2,9633. El ajuste de instrucciones usó smol-smoltalk empaquetado en 361.106 ventanas de 513 tokens, con pérdida solo sobre los tokens del asistente, 11.284 actualizaciones, una época, learning rate 0,0002 y 200 pasos de warmup en una A100 (19 min), reduciendo la pérdida de respuesta retenida de 2,316 a 1,390. El DPO final usó 1.891 pares construidos a partir de preguntas de smol-smoltalk, prefiriendo la respuesta de referencia frente a la respuesta propia del modelo (la información disponible se interrumpe en este punto).

## Capacidades

- Generación de texto en inglés con fluidez gramatical a nivel de frase y párrafo corto.
- Conversación multi-turno con un formato de chat en texto plano (`smoltalk-plain-v1`) sin tokens especiales de chat, usando `<|endoftext|>` como terminador de turno del asistente.
- Finalización de texto y continuación de prompts.
- Ajuste de preferencias (DPO) orientado a reducir repeticiones y a que las respuestas terminen por sí solas (78 % de respuestas que acaban solas en 100 preguntas no vistas).
- Seguimiento limitado de instrucciones: 8 de 30 instrucciones verificadas por código.
- Conocimiento factual muy limitado: 20 de 40 preguntas factuales fáciles acertadas.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- No soporta visión, audio ni modo de razonamiento explícito.
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- Docencia y aprendizaje de entrenamiento de LLM: el repositorio documenta día a día el pipeline completo (preentrenamiento, SFT, DPO, evaluación), lo que permite reproducir cada fase en hardware asequible (Colab L4/A100) y estudiar el efecto de decisiones arquitectónicas como RoPE, SwiGLU o QK-norm frente a GPT-2 small.
- Experimentación con DPO a pequeña escala: los 1.891 pares de preferencia construidos a partir de smol-smoltalk y las respuestas propias del modelo sirven como plantilla para entender cómo el ajuste de preferencias reduce la repetición (del 25,6 % de runs repetidos de 4 tokens en greedy a 0,0 % en muestreo) y mejora la terminación de respuestas.
- Generación de texto creativo corto en inglés: con contexto de 512 tokens y salida fluida, es adecuado para completar párrafos, microrrelatos o descripciones breves donde no se requiera precisión factual.
- Prototipado de interfaces de chat conversacional: el formato `smoltalk-plain-v1` con `format_prompt` y `generate_stream` permite montar un chatbot de demostración local con streaming de tokens en una GPU de consumo.
- Evaluación comparativa de arquitecturas pequeñas: sus resultados zero-shot (HellaSwag 30,1; LAMBADA 12,9; ARC-Easy 42,0; PIQA 59,0; Winogrande 47,9; media 38,4) permiten contrastar el efecto del ajuste de instrucciones y DPO frente a mini-llm-base (media 42,3) y GPT-2 small (media 44,4).
- Generación de datos sintéticos de baja calidad para pruebas de pipelines: útil para validar formateadores, tokenizadores y sistemas de evaluación sin depender de APIs externas, dado su tamaño reducido (0,5 GB) y su licencia MIT.
- Investigación sobre alucinación en modelos pequeños: sus fallos factuales sistemáticos (por ejemplo, responder que la capital de Egipto es Nueva York en una frase bien formada) lo convierten en un caso de estudio controlado para medir fluidez frente a veracidad.

## Benchmarks y rendimiento

Resultados zero-shot (exactitud; HellaSwag normalizado por longitud), medidos en el proyecto original:

| Modelo | HellaSwag | LAMBADA | ARC-Easy | PIQA | Winogrande | Media |
|---|---|---|---|---|---|---|
| OpenAI GPT-2 small (124M) | 31,1 | 32,6 | 43,8 | 62,9 | 51,6 | 44,4 |
| mini-llm-base | 32,3 | 20,3 | 46,8 | 62,4 | 49,9 | 42,3 |
| mini-llm-chat-sft | 30,1 | 13,5 | 41,8 | 59,1 | 47,9 | 38,5 |
| mini-llm-chat | 30,1 | 12,9 | 42,0 | 59,0 | 47,9 | 38,4 |

Pérdida en datos retenidos (menor es mejor):

| Conjunto | Pérdida |
|---|---|
| Mini FineWeb-Edu | 4,274 |
| TinyStories (no entrenado) | 3,262 |
| WikiText-2 (no entrenado) | 6,538 |

Métricas de escritura y seguimiento:

| Métrica | Valor |
|---|---|
| Repetición de runs de 4 tokens, completación greedy | 25,6 % |
| Repetición de runs de 4 tokens, completación con muestreo | 0,0 % |
| Repetición de runs de 4 tokens, 100 preguntas no vistas, greedy | 12,9 % |
| Respuestas que terminan solas (100 preguntas no vistas) | 78 % |
| Instrucciones seguidas (verificadas por código) | 8 de 30 |
| Preguntas factuales fáciles acertadas | 20 de 40 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 123,5 M de parámetros; en bfloat16 ocupa aproximadamente 0,25 GB de pesos, y en float32 unos 0,5 GB. Con overhead de activaciones y contexto de 512 tokens, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó en Colab L4 y A100, pero para inferencia basta una GTX 1650, RTX 3050, RTX 4090 o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, porque usa una arquitectura personalizada que no carga con `transformers.AutoModel`. El despliegue requiere el repositorio `mini_llm` (scripts `chat.py`, `download_weights.py` y API `generate_stream`). El autor indica que una clase de `transformers` está planificada.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta mediciones en un Apple M5 con el suite de evaluación, pero no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-llm-chat | 123,5 M | 512 | 38,4 | MIT | Hugging Face (carga con código propio) |
| OpenAI GPT-2 small | 124 M | 1.024 | 44,4 | MIT | Hugging Face (transformers) |
| mini-llm-base | 123,5 M | 512 | 42,3 | MIT | Hugging Face (carga con código propio) |
| mini-llm-chat-sft | 123,5 M | 512 | 38,5 | MIT | Hugging Face (carga con código propio) |

Frente a GPT-2 small, mini-llm-chat pierde 6 puntos de media zero-shot (38,4 frente a 44,4) pese a compartir forma y número de parámetros, probablemente por el menor volumen de entrenamiento (2.500 millones de tokens frente a los aproximadamente 40.000 millones de GPT-2) y por el ajuste de instrucciones y DPO, que degradan las métricas de modelado de lenguaje puro (LAMBADA cae de 32,6 a 12,9). A cambio, ofrece un formato de chat nativo y una reducción drástica de la repetición. No se dispone de comparación con otras alternativas conversacionales pequeñas en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido: 124 M de parámetros y 2.500 millones de tokens de entrenamiento. Escribe inglés fluido pero con frecuencia es incorrecto.
- Fluidez no implica conocimiento: puede afirmar que la capital de Egipto es Nueva York en una frase bien construida.
- No respeta restricciones como "responde en una palabra" o "sí o no".
- Mayoritariamente incapaz de hacer aritmética.
- Contexto limitado a 512 tokens y solo inglés.
- No apto para nada que importe: el propio autor lo describe como un modelo para aprender, sin ajuste de seguridad más allá del que aportan los datos de entrenamiento.
- No carga con `transformers.AutoModel`; requiere el repositorio `mini_llm`, lo que complica la integración en pipelines estándar.
- Licencia MIT: permite uso comercial, pero las limitaciones técnicas hacen desaconsejable cualquier despliegue en producción.
- Riesgo elevado de alucinación factual y de incumplimiento de instrucciones (8 de 30 instrucciones verificadas).
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/mini-llm-chat
- Modelo base (SFT): https://huggingface.co/aramkris/mini-llm-chat-sft
- Modelo preentrenado: https://huggingface.co/aramkris/mini-llm-base
- Repositorio de código y pipeline: https://github.com/a-ramakrishnan/mini_llm
- Dataset de preentrenamiento: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset de instrucciones: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
