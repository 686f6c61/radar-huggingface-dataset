# davidheineman/nanogpt-ladder-v3-chat-heavy-16m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · chat-heavy · 16M · 100 TPP es un modelo de lenguaje de tipo base (no instruido) desarrollado por davidheineman dentro de la serie experimental "NanoGPT Ladder v3". Se trata de un checkpoint de preentrenamiento completado con 15.851.520 parámetros, entrenado sobre 1.585.152.000 tokens de predicción en 48.375 pasos de optimización con semilla 1337. Su propósito no es el uso en producción, sino servir como punto de referencia reproducible para estudiar el efecto de la mezcla de datos y del presupuesto de tokens en el preentrenamiento de modelos pequeños.

La arquitectura es un transformer decoder-only estilo GPT con 14 capas, anchura 192, 6 cabezas de atención, embeddings atados (tied embeddings), RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. El vocabulario está acolchado hasta 50.304 entradas. Los pesos se distribuyen en float32 original dentro de un repositorio de 0,1 GB.

La variante "chat-heavy" sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, asignando un 80 % de la mezcla al dominio nombrado (chat). Es relevante ahora porque forma parte de una escalera de runs independientes por presupuesto de tokens, lo que permite comparaciones controladas de escalado y composición de datos en un rango de tamaños muy pequeño, útil para investigación en eficiencia de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (NanoGPT), con RoPE y tied embeddings |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio (`model.py`), no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 14 capas, dimensión de modelo 192 y 6 cabezas de atención (32 dimensiones por cabeza). Usa embeddings atados entre entrada y salida, codificación posicional rotatoria (RoPE), tokenizador GPT-2 (tiktoken) y vocabulario acolchado a 50.304. El checkpoint contiene las claves `model`, `config`, `identity` y `run`, conserva los pesos atados y no incluye estado del optimizador.

El preentrenamiento se realizó sobre 1.585.152.000 tokens de predicción (100 TPP, tokens por parámetro) en 48.375 pasos, con semilla 1337. La mezcla de datos sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`; en las variantes "heavy", el 80 % de la mezcla se asigna al dominio nombrado (en este caso, chat). El archivo `metadata.json` registra revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256. Los pesos preceden a cualquier etapa de tiny-rl, SFT o RL, por lo que el modelo es estrictamente base y debe usarse con prompts de texto plano. Las métricas finales registradas en `results.json` son evaluaciones de modelado de lenguaje (BPB/loss), no precisión en tareas.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano (modelo base, sin alineación instruccional).
- Modelado de lenguaje y continuación de texto dentro de una ventana de 1.024 tokens.
- Punto de partida para fine-tuning posterior (SFT, RL u otras etapas), ya que el checkpoint soporta entrenamiento adicional.
- Inferencia en CUDA, Apple MPS o CPU mediante selección automática de dispositivo en el script incluido.
- Decodificación greedy (`temperature=0`) o con muestreo por temperatura.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el tokenizador GPT-2 está orientado principalmente a inglés.

## Casos de uso

- Investigación en escalado de preentrenamiento: comparar este run de 16M y 100 TPP con otros puntos de la escalera NanoGPT Ladder v3 para aislar el efecto del presupuesto de tokens y de la mezcla de datos sobre la pérdida de validación (BPB).
- Estudio de mezclas de datos: la variante chat-heavy (80 % del dominio chat) permite medir empíricamente cómo una mezcla sesgada afecta a la perplejidad en distintos dominios frente a mezclas equilibradas.
- Reproducibilidad experimental: los metadatos con revisiones, pesos de mezcla y SHA256 permiten replicar el entrenamiento y auditar el origen de los datos.
- Fine-tuning didáctico: su tamaño (15,8M de parámetros) y su cargador PyTorch simple lo hacen adecuado para enseñar pipelines de SFT o RLHF en entornos con recursos mínimos.
- Pruebas de infraestructura de inferencia: sirve para validar scripts de generación, selección de dispositivo (CUDA/MPS/CPU) y decodificación en pipelines propios antes de escalar a modelos mayores.
- Baseline en experimentos de eficiencia: al ser un modelo base pequeño con contexto de 1.024 tokens, puede usarse como referencia inferior en estudios de compresión, cuantización o destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene evaluaciones de modelado de lenguaje (BPB/loss), no métricas de resolución de tareas, y no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,8M de parámetros ocupan aproximadamente 63 MB en pesos, más activaciones y caché KV para 1.024 tokens, que son mínimos).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, GPUs de gama baja e incluso en Apple Silicon vía MPS.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py` incluidos; no es compatible con `AutoModel` de Transformers ni se distribuyen pesos en GGUF para llama.cpp u Ollama. vLLM y TGI no están soportados por el cargador personalizado.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 16M (este) | 15,85M | 1.024 | no disponible | PyTorch nativo | Modelo base experimental, mezcla chat-heavy |
| Otros runs de NanoGPT Ladder v3 | variable (escalera por presupuesto de tokens) | 1.024 | no disponible | PyTorch nativo | Misma arquitectura y receta, distinto tamaño o TPP |
| GPT-2 small (referencia histórica) | 124M | 1.024 | MIT (pesos OpenAI) | PyTorch, safetensors, GGUF | Modelo base de referencia, ~8x más parámetros |
| Modelos comparables de 16M | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo base sin alineación: no sigue instrucciones, no mantiene formato conversacional y puede producir texto incoherente o repetitivo.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, propio de un modelo de 15,8M de parámetros y 1.585M de tokens de entrenamiento.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el tokenizador GPT-2 favorece el inglés y el rendimiento en castellano es incierto.
- Licencia no disponible: no se puede asumir uso comercial sin confirmación del autor.
- No es compatible con `AutoModel` de Transformers ni con formatos GGUF; requiere el cargador propio incluido en el repositorio.
- El checkpoint no incluye estado del optimizador, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Las métricas publicadas son de modelado de lenguaje (BPB/loss), no de precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.
- No dispone de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-16m-100tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura): https://github.com/karpathy/nanoGPT
