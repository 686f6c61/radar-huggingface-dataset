# davidheineman/nanogpt-ladder-v3-chat-heavy-32m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 32M es un modelo de lenguaje de tipo base, entrenado desde cero mediante preentrenamiento sobre el pool de datos Dolma3 Dolmino, siguiendo la receta de mezcla "chat-heavy" en la que el 80 % del contenido se asigna al dominio nombrado (chat). Lo desarrolla el usuario davidheineman como parte de la colección NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento independientes por presupuesto de tokens, con semillas fijas y recetas congeladas.

El modelo tiene 32.071.680 parámetros, 13 capas, anchura 320, 5 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una longitud de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas. Se entrenó durante 29.362 pasos de optimizador consumiendo 962.134.016 tokens de predicción (30 TPP, tokens por parámetro), con semilla 1337.

Es relevante como pieza de investigación reproducible: los pesos son el punto final del preentrenamiento, anteriores a cualquier acondicionamiento tiny-rl, SFT o RL, por lo que no es un modelo de chat utilizable como asistente sino una base para estudiar dinámicas de escalado, mezclas de datos y recetas de preentrenamiento a pequeña escala. El repositorio incluye `model.py`, `generate.py`, `metadata.json` con revisiones exactas de las fuentes y pesos de mezcla, y `results.json` con el registro de finalización y evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (NanoGPT), con embeddings atados, RoPE y atención multi-cabeza estándar |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominancia esperada de inglés; no declarado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32), cargado con loader propio, no compatible con `AutoModel` de Transformers |

Otros datos técnicos: 13 capas, anchura 320, 5 cabezas de atención, vocabulario rellenado de 50.304, tokenizador GPT-2 (tiktoken), 29.362 pasos de optimizador, 962.134.016 tokens de predicción, semilla 1337, tamaño del repo 0,1 GB.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de estilo GPT con 13 capas, dimensión de modelo 320 y 5 cabezas de atención. Usa embeddings atados entre entrada y salida, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado hasta 50.304. El checkpoint nativo contiene las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior pero no para reanudar el entrenamiento.

El entrenamiento consistió en preentrenamiento puro sobre el pool Dolma3 Dolmino con una mezcla "chat-heavy": según la model card, las mezclas heavy asignan el 80 % al dominio nombrado. El presupuesto de 30 TPP equivale a 962.134.016 tokens de predicción en 29.362 pasos. Cada presupuesto de tokens de la serie Ladder v3 corresponde a una ejecución entrenada de forma independiente, con receta de mezcla congelada y semilla fija, lo que permite comparaciones controladas entre puntos de la escalera. No se documentan fases de RLHF, DPO ni SFT: los pesos son estrictamente el endpoint de preentrenamiento.

## Capacidades

- Generación de texto autoregresiva a partir de prompts en texto plano, con decodificación greedy (`temperature=0`) o con muestreo por temperatura.
- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene formato de chat de forma fiable.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode), ni capacidades de visión o audio.
- Capacidad multilingüe no declarada; el tokenizador GPT-2 y la mezcla de datos apuntan a un rendimiento principal en inglés.
- Sirve como punto de partida para fine-tuning supervisado, experimentos de escalado y estudios de mezcla de datos.
- Evaluaciones publicadas en `results.json` como BPB/loss (evaluación de modelado de lenguaje), no como precisión en tareas.

## Casos de uso

- Estudio de recetas de preentrenamiento: comparar este endpoint chat-heavy de 32M y 30 TPP con otros puntos de la colección NanoGPT Ladder v3 para aislar el efecto del presupuesto de tokens y de la mezcla de dominios sobre la pérdida final.
- Investigación de mezclas de datos: analizar cómo una asignación del 80 % al dominio chat afecta a la perplejidad en texto conversacional frente a mezclas equilibradas, usando las métricas BPB registradas en `results.json`.
- Reproducibilidad y auditoría: el `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y SHA256 permite replicar la ejecución y verificar la procedencia de los datos.
- Base para fine-tuning ligero: al incluir el checkpoint completo en float32 con embeddings atados, se puede ajustar para tareas concretas de clasificación o generación restringida en entornos con recursos muy limitados.
- Docencia y experimentación en GPUs de consumo: con 32M parámetros cabe holgadamente en cualquier GPU consumer y en CPU, lo que permite demostrar el ciclo completo de preentrenamiento, generación y evaluación en un portátil.
- Generación de texto de dominio acotado tras ajuste: partiendo de este modelo se pueden construir generadores especializados (por ejemplo, respuestas cortas en un dominio concreto) con un coste de cómputo mínimo.
- Pruebas de infraestructura de inferencia: validar pipelines propios de carga de checkpoints PyTorch nativos no estándar, decodificación greedy y selección automática de dispositivo (CUDA, Apple MPS o CPU) mediante `device=auto`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que `results.json` contiene el registro de finalización y evaluaciones finales expresadas como BPB/loss (evaluaciones de modelado de lenguaje), no como precisión en resolución de tareas. No se inventan cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint float32 de 32M parámetros ocupa aproximadamente 128 MB; con overhead de activaciones y contexto de 1.024 tokens, la inferencia cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es más que suficiente; también funciona en Apple MPS y en CPU, seleccionables con `device=auto`.
- Cabe en GPU consumer: sí, en prácticamente todas, incluidas GPU integradas y portátiles de gama baja.
- Opciones de despliegue: carga nativa con `model.py` y `generate.py` incluidos en el repositorio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que la arquitectura usa un loader propio en lugar de `AutoModel` de Transformers.
- Latencia y throughput estimados: no disponible. Por el tamaño del modelo, se espera latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 32M 30TPP (este modelo) | 32,1M | 1.024 | Base, preentrenamiento puro | no disponible | Hugging Face, repo 0,1 GB |
| GPT-2 small | 124M | 1.024 | Base | MIT (según publicación original) | Amplia, integrado en Transformers |
| Pythia-70M | 70M | 2.048 | Base | Apache 2.0 | Amplia, suites de interpretabilidad |
| Otros endpoints NanoGPT Ladder v3 | ~32M (misma familia) | 1.024 | Base | no disponible | Colección en Hugging Face |

No se dispone de resultados de benchmarks comparativos publicados para este modelo, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los modelos alternativos citados son referencias habituales de la misma escala, pero sus cifras de rendimiento no se contrastan aquí por falta de datos del modelo evaluado.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no está ajustado para seguir instrucciones, mantener turnos de conversación ni respetar formatos; la model card recomienda usar prompts en texto plano.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de 32M parámetros con 962M tokens vistos.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no declarados; el tokenizador GPT-2 y la mezcla de datos sugieren un rendimiento principal en inglés, con calidad previsiblemente baja en castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Pesos originales en float32 sin variantes cuantizadas publicadas; la integración con herramientas estándar (Transformers, vLLM, llama.cpp) no está soportada de forma nativa.
- Las métricas publicadas son BPB/loss de modelado de lenguaje, no precisión en tareas; no deben interpretarse como capacidad resolutiva.
- Sesgos conocidos: no documentados por el autor; al derivar del pool Dolma3 Dolmino, hereda los sesgos presentes en esa mezcla de datos.
- El checkpoint no incluye estado del optimizador, lo que impide reanudar el entrenamiento desde el punto exacto de finalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-32m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset utilizado: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (arquitectura de referencia): https://github.com/karpathy/nanoGPT
