# aramkris/mini-llm-base

## Resumen

mini-llm-base es un modelo de lenguaje de 123.552.768 parámetros entrenado desde cero en PyTorch por aramkris como proyecto de aprendizaje. Se trata de un modelo de completado de texto (no de instrucciones) preentrenado sobre 2.500 millones de tokens de texto web educativo, combinando el subset Mini FineWeb-Edu con cinco subsets de Cosmopedia (stories, wikihow, openstax, stanford y khanacademy). Es la etapa 2 de una familia de tres modelos: mini-llm-base (preentrenamiento), mini-llm-chat-sft (ajuste de instrucciones sobre smol-smoltalk) y mini-llm-chat (DPO contra repetición).

La arquitectura replica la forma de GPT-2 small (12 capas, 768 de anchura, 12 cabezas) con cuatro modificaciones: RoPE en lugar de embeddings posicionales aprendidos, SwiGLU con anchura oculta de 2.048, QK-norm (normalización RMS de queries y keys por cabeza) y ausencia total de sesgos. Usa LayerNorm pre-norm, embeddings de entrada y salida atados y tokenizador GPT-2 BPE de 50.257 tokens vía tiktoken.

Su relevancia es fundamentalmente didáctica: documenta un pipeline completo de entrenamiento (scripts, evaluación y tutorial día a día en GitHub) y ofrece pesos abiertos bajo licencia MIT. No es un modelo apto para producción: contexto de 512 tokens, solo inglés y conocimiento factual muy limitado. No carga con `transformers.AutoModel`; requiere el código del repositorio mini_llm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2 small con RoPE, SwiGLU, QK-norm y sin sesgos) |
| Parametros totales | 123.552.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en bfloat16/float32; sin GGUF publicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

Detalles adicionales de arquitectura: 12 capas × 768 de anchura, 12 cabezas de atención, feed-forward SwiGLU con anchura oculta 2.048, LayerNorm pre-norm, embeddings de entrada y salida atados (la capa de salida comparte la matriz de embedding, almacenada una sola vez), tokenizador GPT-2 BPE (50.257 tokens) mediante tiktoken, posiciones RoPE sin parámetros posicionales.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la forma de GPT-2 small y cuatro cambios técnicos: RoPE para codificar posiciones, SwiGLU en la MLP, QK-norm (queries y keys normalizadas con RMS por cabeza antes del producto escalar) y eliminación de todos los sesgos lineales. La normalización es LayerNorm en configuración pre-norm.

El entrenamiento se dividió en dos etapas. La etapa 1 usó Mini FineWeb-Edu (small) más cinco subsets de Cosmopedia mezclados por tamaño: 30.500 pasos, 499.712.000 tokens, batch de 32, contexto 512, learning rate 0,0012, 1.000 pasos de warmup, en una Colab L4 en bfloat16 durante 4 h 20 min. La etapa 2 continuó desde el paso 30.500 con Mini FineWeb-Edu completo y los mismos subsets de Cosmopedia (eliminando los documentos de validación de la etapa 1 del conjunto de entrenamiento): 152.600 pasos en total, 2.500.198.400 tokens, usando Colab L4 hasta el paso 79.000 y luego A100 en cuatro sesiones, con una mejor loss de validación de 2,9633 sobre la mezcla de la etapa 2. No se menciona RLHF ni DPO en esta etapa base (el DPO aparece en la etapa 4 de la familia, sobre el modelo chat).

## Capacidades

- Generación y completado de texto en inglés: continúa un prefijo de forma fluida.
- Escritura narrativa y expositiva básica, heredada de los subsets de Cosmopedia (stories, wikihow, openstax, stanford, khanacademy).
- Razonamiento muy limitado: 11 de 40 preguntas factuales fáciles acertadas y 6 de 30 instrucciones seguidas según la suite de evaluación del proyecto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión, audio ni ninguna capacidad multimodal.
- Multilingüismo: únicamente inglés.
- No sigue restricciones de formato (por ejemplo, "responde en una palabra" o "sí o no").
- Aritmética: mayoritariamente incapaz de realizarla.

## Casos de uso

- Proyecto educativo de aprendizaje: reproducir el pipeline completo de preentrenamiento (tokenización, mezcla de datos, bucle de entrenamiento, evaluación) usando los scripts del repositorio mini_llm como referencia didáctica.
- Generación de texto de relleno y demostraciones: completar prefijos con texto fluido en inglés para prototipos de interfaces o demos de generación en streaming, gracias a la función `generate_stream` del repositorio.
- Investigación sobre arquitecturas: experimentar con variantes de GPT-2 small (RoPE, SwiGLU, QK-norm) y medir el efecto de cada cambio sobre loss de validación y benchmarks zero-shot.
- Fine-tuning de bajo coste: al ser un modelo de 124M parámetros, cabe en GPUs consumer y sirve como base para probar recetas de SFT o DPO (la propia familia incluye mini-llm-chat-sft y mini-llm-chat entrenados así).
- Evaluación comparativa de tokenizadores y datasets: usar los resultados de loss en Mini FineWeb-Edu, TinyStories y WikiText-2 como línea base para comparar mezclas de datos educativos.
- Generación de texto sintético para pruebas de infraestructura: producir texto de forma masiva y barata para validar pipelines de ingestión, indexación o sistemas de logging, aceptando que el contenido será fluido pero frecuentemente incorrecto.
- Estudio de repetición en decodificación: analizar la diferencia entre decodificación greedy (54,8% de runs de 4 tokens repetidos) y muestreo (1,0%) como caso práctico de ajuste de parámetros de sampling.

## Benchmarks y rendimiento

Resultados zero-shot (exactitud; HellaSwag normalizado por longitud), medidos en el proyecto original:

| Modelo | HellaSwag | LAMBADA | ARC-Easy | PIQA | Winogrande | Media |
|---|---|---|---|---|---|---|
| OpenAI GPT-2 small (124M) | 31,1 | 32,6 | 43,8 | 62,9 | 51,6 | 44,4 |
| mini-llm-base | 32,3 | 20,3 | 46,8 | 62,4 | 49,9 | 42,3 |
| mini-llm-chat-sft | 30,1 | 13,5 | 41,8 | 59,1 | 47,9 | 38,5 |
| mini-llm-chat | 30,1 | 12,9 | 42,0 | 59,0 | 47,9 | 38,4 |

Loss en datos retenidos (menor es mejor), medidos con la suite de evaluación del proyecto (Day 7) en un Apple M5:

| Conjunto | Loss |
|---|---|
| Mini FineWeb-Edu | 3,296 |
| TinyStories (no entrenado) | 2,751 |
| WikiText-2 (no entrenado) | 5,047 |

Métricas de escritura y seguimiento:

| Métrica | Valor |
|---|---|
| Completado greedy: runs de 4 tokens repetidos | 54,8% |
| Completado con muestreo: runs de 4 tokens repetidos | 1,0% |
| Instrucciones seguidas (verificadas por código) | 6 de 30 |
| Preguntas factuales fáciles acertadas | 11 de 40 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en bfloat16 (123,5M parámetros × 2 bytes) más overhead de activaciones y KV cache; en float32 alrededor de 0,5 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en Colab L4 y A100, pero la inferencia es trivial.
- Cabe holgadamente en GPUs consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- Opciones de despliegue: el modelo no carga con `transformers.AutoModel`; requiere el repositorio mini_llm (scripts `download_weights.py` y `chat.py`). No hay conversión publicada a GGUF, por lo que llama.cpp, Ollama o vLLM no están soportados de serie en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones del proyecto se hicieron en un Apple M5 sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media zero-shot (5 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini-llm-base | 123,5M | 512 | 42,3 | MIT | Hugging Face + GitHub (código propio) |
| OpenAI GPT-2 small | 124M | 1.024 | 44,4 | MIT | Hugging Face, `transformers` nativo |
| mini-llm-chat-sft | 123,5M | 512 | 38,5 | MIT | Hugging Face (misma familia) |

Comparación cualitativa: GPT-2 small supera a mini-llm-base en LAMBADA (32,6 frente a 20,3) y Winogrande (51,6 frente a 49,9), mientras que mini-llm-base gana en HellaSwag (32,3 frente a 31,1) y ARC-Easy (46,8 frente a 43,8), con PIQA prácticamente empatado. La ventaja práctica de GPT-2 small es la integración nativa en `transformers` y un contexto del doble; la de mini-llm-base es la documentación completa del pipeline de entrenamiento y una licencia MIT sobre pesos y código.

## Limitaciones y advertencias

- Tamaño y conocimiento: 124M parámetros y 2,5B tokens de entrenamiento producen texto fluido pero frecuentemente incorrecto; el propio autor advierte que afirmará que la capital de Egipto es Nueva York en una frase bien formada.
- Alucinación: alta probabilidad de errores factuales; la fluidez no implica conocimiento.
- Contexto muy corto: 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Solo inglés: no soporta castellano ni otros idiomas.
- No sigue instrucciones ni restricciones de formato ("responde en una palabra", "sí o no").
- Aritmética: mayoritariamente incapaz.
- Sesgos: heredados de los datos de preentrenamiento (FineWeb-Edu y Cosmopedia); no se documenta ninguna mitigación.
- Sin tuning de seguridad más allá de lo que contienen los datos; no apto para aplicaciones que importen.
- Integración: no carga con `transformers.AutoModel`; requiere el código del repositorio (una clase de `transformers` está planificada pero no publicada).
- Licencia: pesos bajo MIT, pero los datasets subyacentes tienen sus propios términos (Mini FineWeb-Edu/FineWeb-Edu ODC-By 1.0; Cosmopedia y smol-smoltalk Apache 2.0).
- Repetición en decodificación greedy: 54,8% de runs de 4 tokens repetidos, por lo que se recomienda muestreo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/mini-llm-base
- Repositorio de código y tutorial: https://github.com/a-ramakrishnan/mini_llm
- Modelo hermano (SFT): https://huggingface.co/aramkris/mini-llm-chat-sft
- Modelo hermano (chat final tras DPO): https://huggingface.co/aramkris/mini-llm-chat
- Dataset Mini FineWeb-Edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
