# anonyMicky/blinded-nanochat-pretrained

## Resumen

blinded-nanochat-pretrained es un modelo de lenguaje base de 3.286 millones de parámetros, de tipo decoder-only, entrenado desde cero por el autor anónimo "anonyMicky" usando el framework educativo nanochat de Andrej Karpathy. Se trata de la columna vertebral descrita en la sección de preentrenamiento de un artículo (paper) del autor, distribuida como checkpoint puro sin ningún postentrenamiento: no ha recibido ajuste por instrucciones ni RLHF, por lo que su comportamiento es de continuación de texto, no de seguimiento de instrucciones.

El modelo emplea la arquitectura nanochat depth-34 sin modificar: 34 capas, anchura 2.176, 17 cabezas de atención de dimensión 128 y una ventana de contexto de 2.048 tokens. Incorpora innovaciones propias de nanochat como embeddings de valor en capas alternas, atención con ventana deslizante de 512 tokens en 3 de cada 4 capas, normalización QK, RMSNorm sin parámetros, MLP con ReLU al cuadrado, embeddings de entrada/salida no atados y soft-capping de logits. El entrenamiento se realizó sobre una pasada de 287B tokens del dataset ClimbMix, con un total de aproximadamente 1.600 horas de H100.

Su relevancia actual radica en que es un ejemplo reproducible y de código abierto de un pipeline completo de preentrenamiento a escala de 3B parámetros, con pesos cargables en transformers, vLLM y el propio código de nanochat, lo que lo convierte en un recurso útil para investigación sobre entrenamiento, ablaciones y evaluación de modelos base sin postentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nanochat depth-34 decoder-only transformer (34 capas, anchura 2.176, 17 cabezas de atención de dimensión 128) |
| Parámetros totales | 3.286.633.962 (3,29B) |
| Parámetros activos | no disponible (no es MoE; los embeddings de valor son lookups) |
| Longitud de contexto | 2.048 tokens (3 de cada 4 capas con ventana deslizante de 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código custom en `configuration_blinded.py` y `modeling_blinded.py`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 34 capas con anchura 2.176 y 17 cabezas de atención de dimensión 128. Incluye embeddings de posición rotatorios (RoPE), normalización QK, RMSNorm sin parámetros, MLP con ReLU al cuadrado, embeddings de entrada y salida no atados, soft-capping de logits y un embedding de valor en cada capa alterna. Tres de cada cuatro capas usan una ventana de atención deslizante de 512 tokens, mientras que el resto atiende a la ventana completa de 2.048 tokens. El tokenizador es un BPE a nivel de byte con 32.768 entradas, entrenado sobre los primeros 2.000 millones de caracteres del split de entrenamiento. Los 3,29B parámetros se reparten en 1,93B en los bloques del transformer, 1,21B en las tablas de embeddings de valor (que son lookups) y 0,14B en los embeddings de entrada y salida; por tanto, el coste computacional por token equivale al de un modelo denso de unos 2B parámetros.

El entrenamiento consistió en una única pasada de 287B tokens sobre ClimbMix (`karpathy/climbmix-400b-shuffle`), con el último de los 6.543 shards reservado para validación. Los documentos se empaquetaron en secuencias de 2.048 tokens con el packing BOS-aligned best-fit de nanochat. El optimizador es el de nanochat sin cambios: Muon para las matrices de peso de los bloques del transformer y AdamW para embeddings y parámetros escalares, con warmup breve, tasa constante y decaimiento lineal. La única modificación del autor respecto a nanochat es el tamaño de batch, que crece de 262.144 a 2.097.152 tokens durante el entrenamiento manteniendo los picos de learning rate originales (nanochat los escala con la raíz cuadrada del batch). El cómputo se realizó en un nodo de ocho NVIDIA H100 con multiplicaciones de matrices en FP8, unas 1.600 horas de H100. El checkpoint publicado corresponde al paso 227.158, tras 283B tokens, elegido por ser el de mayor CORE medido durante el entrenamiento (el checkpoint final, a 287B tokens, puntuó 0,004 menos).

## Capacidades

- Generación de texto y continuación de secuencias en inglés: el modelo es un base model sin postentrenamiento, por lo que continúa texto en lugar de seguir instrucciones.
- Razonamiento de contexto limitado mediante in-context learning: la evaluación CORE mide 22 tareas de aprendizaje en contexto con 500 ejemplos cada una, lo que indica cierta capacidad de adaptación a partir de ejemplos en el prompt.
- Conocimiento factual y de sentido común evaluado con MMLU y MMLU-Pro en modo 5-shot por log-verosimilitud de la letra de respuesta.
- Puntuación de log-verosimilitud de continuaciones: el modelo expone logits en fp32 ya con soft-capping, útiles para scoring de candidatos y evaluación tipo LM Evaluation Harness.
- Carga en tres entornos: transformers con `trust_remote_code=True`, vLLM mediante un pequeño plugin y el código original de nanochat desde los checkpoints originales sin modificar.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de pensamiento (thinking); no se documentan en la model card.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación sobre preentrenamiento a escala de 3B: el modelo sirve como referencia reproducible para estudiar el efecto del tamaño de batch, el schedule de learning rate y el empaquetado de secuencias, ya que el autor documenta explícitamente la única desviación respecto a nanochat (batch creciente con picos de LR fijos).
- Ablaciones de arquitectura nanochat: al ser la arquitectura depth-34 sin modificar, permite comparar variantes (ventana deslizante, embeddings de valor, soft-capping) contra el checkpoint publicado como línea base.
- Evaluación de modelos base sin postentrenamiento: útil para medir CORE, MMLU y MMLU-Pro en modo few-shot por log-verosimilitud, y para estudiar la brecha entre modelos base e instruidos.
- Scoring y reranking de continuaciones: la función de log-verosimilitud documentada (por ejemplo, " Paris" con -0,9538 frente a " Berlin" con -7,7336) permite usar el modelo como scorer en pipelines de selección de respuestas o detección de inconsistencias.
- Estudio de mecánicas de atención híbrida: la combinación de ventana deslizante de 512 tokens en 3 de cada 4 capas con atención completa en el resto permite analizar el impacto de la ventana local en tareas de contexto corto con 2.048 tokens.
- Punto de partida para postentrenamiento propio: al estar bajo licencia MIT y cargar en transformers y vLLM, puede servir como base para SFT o DPO por parte de equipos que quieran experimentar con el pipeline completo de nanochat.
- Reproducción de infraestructura de entrenamiento: las ~1.600 horas de H100 en 8 GPUs con FP8 documentadas permiten estimar costes y planificar réplicas a menor escala.

## Benchmarks y rendimiento

| Modelo | Tokens | CORE | MMLU | MMLU-Pro |
|---|---:|---:|---:|---:|
| blinded-nanochat-pretrained | 283B | 0,458 | 0,493 | 0,178 |
| nanochat d34 | 89B | 0,338 | 0,257 | 0,115 |

La pérdida de validación en el shard reservado de ClimbMix es de 0,596 bits por byte. Todas las cifras proceden de la evaluación del autor, excepto el CORE de nanochat d34, que es el número publicado. CORE es la precisión centrada media de nanochat sobre 22 tareas de in-context learning con 500 ejemplos cada una; MMLU y MMLU-Pro se midieron en 5-shot por log-verosimilitud de la letra de respuesta con LM Evaluation Harness. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,6 GB solo para pesos (3,29B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para secuencias de 2.048 tokens.
- En fp32: unos 13,2 GB solo para pesos, más activaciones.
- GPU recomendadas: el autor reporta ejecución en una H200; también es viable en A100 (40/80 GB), H100 y GPUs consumer con suficiente VRAM.
- GPU consumer: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requeriría cuantización, que el autor no documenta.
- Opciones de despliegue: transformers (>=4.57, torch>=2.5, con `trust_remote_code=True`), vLLM mediante el plugin del autor, y el código original de nanochat. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo indica que la inferencia se ejecutó en una H200 y que la atención usa `scaled_dot_product_attention` de PyTorch como fallback (nanochat usa Flash Attention 3 en Hopper cuando está disponible).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | CORE | MMLU | MMLU-Pro | Disponibilidad |
|---|---:|---:|---|---:|---:|---:|---|
| blinded-nanochat-pretrained | 3,29B | 2.048 | MIT | 0,458 | 0,493 | 0,178 | Hugging Face (174 descargas) |
| nanochat d34 | ~3,3B (depth-34) | 2.048 | MIT (según repositorio nanochat) | 0,338 | 0,257 | 0,115 | Hugging Face (`karpathy/nanochat-d34`) |

No se dispone de datos en la información proporcionada para comparar con otras alternativas de la misma categoría (por ejemplo, modelos base de ~3B de otros desarrolladores); los únicos datos comparables son los del checkpoint nanochat d34 con 89B tokens de entrenamiento.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones ni mantiene diálogos; solo continúa texto. No debe usarse directamente en aplicaciones de chat o asistentes sin postentrenamiento.
- Contexto limitado a 2.048 tokens, con ventana deslizante de 512 tokens en 3 de cada 4 capas, lo que restringe tareas de contexto largo.
- Solo inglés: la model card etiqueta el idioma como `en`; no se documenta soporte multilingüe.
- Riesgo de alucinación y de generar contenido factualmente incorrecto, habitual en modelos base sin alineación; el ejemplo del autor muestra repetición ("The capital of France is Paris" repetido) en generación greedy.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni documenta implicaciones de responsabilidad sobre los datos de entrenamiento (ClimbMix).
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código Python del repositorio; el autor indica que `configuration_blinded.py` y `modeling_blinded.py` son PyTorch plano y solo importan `torch` y `transformers`, pero conviene revisarlos antes de usarlos en producción.
- Las secuencias deben comenzar con el token BOS `<|bos|>`; el tokenizador de transformers y vLLM lo añaden por defecto, pero otras integraciones podrían no hacerlo.
- Diferencias numéricas entre kernels: los logits pueden diferir en los últimos dígitos respecto a nanochat con Flash Attention 3 en Hopper; el autor reporta logits bit-idénticos solo con el mismo kernel.
- Repositorio con pocas descargas (174) y sin likes, lo que sugiere escasa validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/anonyMicky/blinded-nanochat-pretrained
- Repositorio nanochat: https://github.com/karpathy/nanochat (commit `92d63d4`)
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Checkpoint nanochat d34: https://huggingface.co/karpathy/nanochat-d34
