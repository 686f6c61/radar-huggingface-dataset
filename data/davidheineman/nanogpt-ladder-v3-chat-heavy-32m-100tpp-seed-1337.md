# davidheineman/nanogpt-ladder-v3-chat-heavy-32m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 chat-heavy 32M 100 TPP es un modelo de lenguaje de tipo base (preentrenamiento puro) desarrollado por davidheineman dentro de la colección NanoGPT Ladder v3, una serie de experimentos controlados de preentrenamiento a pequeña escala. El checkpoint corresponde al punto final de un entrenamiento independiente de 3.207.168.000 tokens de predicción sobre una mezcla de datos "chat-heavy" del pool Dolma3 Dolmino de AllenAI, con una semilla fija (1337) para garantizar reproducibilidad. El modelo tiene 32.071.680 parámetros y sigue una arquitectura GPT-2 minimalista implementada en PyTorch puro.

Su relevancia es fundamentalmente metodológica: no es un modelo destinado a producción, sino una pieza de un estudio sobre cómo la composición del dataset (en este caso, con un 80 por ciento asignado al dominio conversacional) y el presupuesto de tokens (TPP, tokens por parámetro) afectan al comportamiento del modelo. Al ser un modelo base, los pesos preceden a cualquier fase de SFT, RL o condicionamiento, por lo que no está alineado ni instruido para seguir instrucciones.

La ficha describe un artefacto de investigación reproducible: incluye `metadata.json` con revisiones exactas de fuentes y hashes SHA256, y `results.json` con el registro de finalización y evaluaciones. El contexto es de solo 1.024 tokens, coherente con la familia de modelos NanoGPT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (NanoGPT), con embeddings atados y RoPE |
| Parametros totales | 32.071.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos originales en float32; el autor no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (no se declara cobertura linguistica; tokenizer GPT-2) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`model.pt`, float32), con loader propio (`model.py`), no compatible con AutoModel de Transformers |
| Capas | 13 |
| Dimension del modelo (width) | 320 |
| Cabezas de atencion | 5 |
| Vocabulario | 50.304 (padded), tokenizer GPT-2 (tiktoken) |
| Tokens de entrenamiento | 3.207.168.000 tokens de prediccion (~100 TPP) |
| Pasos de optimizador | 97.875 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla chat-heavy, 80 por ciento al dominio nombrado) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 13 capas, ancho de 320 y 5 cabezas de atencion, con embeddings de entrada y salida atados. Utiliza codificaciones posicionales rotatorias (RoPE) en lugar de embeddings posicionales aprendidos y un vocabulario de 50.304 entradas (padding sobre el vocabulario GPT-2 de 50.257), tokenizado con `tiktoken` (GPT-2). Es una implementacion NanoGPT, es decir, codigo PyTorch minimalista con un loader propio que no depende de la clase AutoModel de Transformers.

El entrenamiento consistio en 97.875 pasos de optimizador sobre exactamente 3.207.168.000 tokens de prediccion, lo que equivale a aproximadamente 100 tokens por parametro (TPP). La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, con una variante "chat-heavy" que asigna el 80 por ciento de la mezcla al dominio conversacional nombrado. No consta que se aplicaran fases de RLHF, DPO ni SFT: los pesos son el punto final del preentrenamiento y preceden a cualquier condicionamiento. El checkpoint no incluye estado del optimizador, por lo que sirve para inferencia y afinamiento adicional, no para reanudar el preentrenamiento. El archivo `metadata.json` documenta las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256 para reproducibilidad.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, con decodificacion greedy (`temperature=0`) o muestreo con temperatura.
- Modelado del lenguaje y evaluacion de perplejidad (BPB/loss) sobre texto; las metricas publicadas son de lenguaje, no de resolucion de tareas.
- Continuacion de texto y modelado de dominios conversacionales, dado el sesgo de la mezcla chat-heavy.
- Ejecucion en CPU, CUDA o Apple MPS mediante seleccion automatica de dispositivo (`device=auto`).
- Afinamiento posterior: el checkpoint es cargable con `strict=True` y admite fine-tuning, aunque sin estado de optimizador.
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso explicito.
- No dispone de vision, audio ni modo "thinking".
- No esta instruido ni alineado: no sigue instrucciones ni mantiene rol de asistente.
- Cobertura multilingue no declarada; el tokenizer GPT-2 esta orientado al ingles.

## Casos de uso

- Experimentacion academica sobre mezclas de datos: reproducible con semilla 1337 y receta Dolmino congelada, permite aislar el efecto de la proporcion chat-heavy frente a otras mezclas de la misma familia NanoGPT Ladder v3.
- Estudio de leyes de escala en el regimen de 32M parametros: el punto de 100 TPP sirve como referencia para comparar curvas de loss frente a checkpoints de menor y mayor presupuesto de tokens.
- Validacion de pipelines de preentrenamiento: al incluir `metadata.json` con revisiones y SHA256, se puede auditar la trazabilidad de datos y reproducir el run en infraestructura propia.
- Fine-tuning como banco de pruebas: punto de partida barato para experimentar con SFT o DPO sobre un modelo de 32M antes de escalar la receta a modelos mayores.
- Docencia y formacion: el codigo `model.py` y `generate.py` autocontenidos permiten explicar tokenizacion, RoPE, embeddings atados y decodificacion en un modelo que cabe en CPU.
- Generacion de texto en entornos con recursos minimos: inferencia en CPU o Apple MPS para demos de continuacion de texto y pruebas de latencia sin GPU dedicada.
- Analisis de sesgos en modelos conversacionales pequenos: la mezcla chat-heavy del 80 por ciento permite estudiar como el dominio de preentrenamiento moldea el estilo de continuacion antes de cualquier alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las mediciones finales de BPB y loss son evaluaciones de modelado del lenguaje, no precision en resolucion de tareas, y no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,13 GB para los pesos (32M parametros x 4 bytes), mas activaciones y cache KV; en la practica cabe en cualquier GPU consumer con menos de 1 GB libre.
- Al ser un modelo de 32M, se puede ejecutar en CPU con latencia baja para secuencias cortas (contexto maximo de 1.024 tokens).
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, GPUs de portatil e incluso en Apple Silicon via MPS.
- Si cabe en GPU consumer: si, en todas las GPU consumer actuales e integradas razonables.
- Opciones de despliegue: loader propio en PyTorch (`generate.py` con `device=auto`, `max_new_tokens`, `temperature`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, llama.cpp y Ollama no estan disponibles de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 chat-heavy 32M 100 TPP | 32,1M | 1.024 | No disponible | PyTorch (`model.pt`) | Mezcla chat-heavy, 100 TPP, semilla 1337 |
| NanoGPT Ladder v3 (otros checkpoints de la coleccion) | ~32M y otros tamanos | 1.024 | No disponible | PyTorch | Distintas mezclas y presupuestos TPP; comparables directamente |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | PyTorch, safetensors, GGUF | Mayor tamano; tokenizer y arquitectura equivalentes |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | Safetensors, GGUF | Mayor tamano y contexto; disponibilidad amplia en ecosistema |

La comparacion mas directa es con los demas checkpoints completados de la coleccion NanoGPT Ladder v3 del mismo autor, que comparten arquitectura y solo difieren en mezcla de datos, presupuesto de tokens y semilla.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones, no responde como asistente y requiere prompts de texto plano para continuar texto.
- No se ha publicado licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- Contexto muy limitado (1.024 tokens), insuficiente para conversaciones largas, documentos extensos o razonamiento multi-paso.
- Capacidad muy reducida (32M parametros): alta probabilidad de incoherencia, repeticion y errores factuales en generaciones largas.
- Riesgo elevado de alucinacion y de reflejar sesgos presentes en el pool Dolma3 Dolmino, incluida la mezcla chat-heavy.
- Idiomas soportados no declarados; el tokenizer GPT-2 favorece el ingles y la tokenizacion de otros idiomas es ineficiente.
- No compatible con AutoModel de Transformers ni con herramientas estandar como vLLM o llama.cpp; requiere el loader propio o conversion manual.
- No incluye estado del optimizador, por lo que no se puede reanudar el preentrenamiento de forma exacta.
- Las metricas publicadas (BPB/loss) no deben interpretarse como rendimiento en tareas.
- La fecha de creacion y actualizacion del repositorio (2026) es posterior a la mayoria de referencias del ecosistema; conviene verificar la procedencia y vigencia de los datos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-chat-heavy-32m-100tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino Pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura y codigo): https://github.com/karpathy/nanoGPT
- Tokenizer GPT-2 via tiktoken: https://github.com/openai/tiktoken
