# davidheineman/nanogpt-ladder-v3-code-heavy-64m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 64M · 10 TPP es un modelo de lenguaje de tipo base, desarrollado por davidheineman, resultado de un experimento de preentrenamiento a pequeña escala dentro de la iniciativa NanoGPT Ladder v3. Se trata de un transformer decoder-only de 63.504.384 parámetros, entrenado desde cero sobre 635.043.840 tokens de predicción (10 tokens por parámetro, TPP) durante 19.380 pasos de optimizador con la semilla 1337. Su propósito no es competir con modelos de producción, sino servir como punto de control reproducible para estudiar el efecto de mezclas de datos sesgadas hacia código en presupuestos de cómputo controlados.

El modelo sigue la receta de mezcla «code-heavy» sobre el pool Dolma3 Dolmino de AllenAI, donde el 80 % de los tokens se asigna al dominio nombrado (código) y el resto se reparte según la receta congelada del pool. La arquitectura es deliberadamente minimalista: 12 capas, anchura 512, 8 cabezas de atención, embeddings atados, RoPE, tokenizador GPT-2 y una longitud de contexto de 1.024 tokens. Los pesos están en float32 original y se distribuyen con un cargador propio en PyTorch, no compatible con `AutoModel` de Transformers.

Es relevante ahora porque forma parte de una escalera de modelos preentrenados de forma independiente por presupuesto de tokens, lo que permite comparaciones limpias entre mezclas de datos y tamaños. Además, estos pesos son el punto de partida previo a condicionamiento tiny-rl, SFT y RL, por lo que deben usarse con prompts de texto plano y sin esperar comportamiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (NanoGPT), 12 capas, anchura 512, 8 cabezas, embeddings atados, RoPE |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente inglés en la práctica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio; no safetensors ni GGUF |
| Tokens de entrenamiento | 635.043.840 (10 TPP) |
| Pasos de optimizador | 19.380 |
| Semilla | 1337 |
| Vocabulario | 50.304 (padded, tokenizador GPT-2) |
| Dataset | allenai/dolma3_dolmino_pool (mezcla code-heavy, 80 % dominio código) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo GPT-2 con 12 capas, dimensión de modelo 512 y 8 cabezas de atención (64 dimensiones por cabeza). Usa embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y un vocabulario de 50.304 entradas derivado del tokenizador GPT-2 con padding. La implementación es la de NanoGPT, con un `model.py` y un `generate.py` propios que cargan el checkpoint nativo en lugar de usar la clase `AutoModel` de Transformers. El checkpoint `model.pt` incluye las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve para inferencia y fine-tuning posterior, pero no para reanudar el entrenamiento de forma exacta.

El preentrenamiento consumió 635.043.840 tokens de predicción en 19.380 pasos, lo que equivale a 10 tokens por parámetro. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino: en las mezclas «heavy», el 80 % de los tokens se asigna al dominio nombrado, en este caso código, y el 20 % restante se distribuye según los pesos del pool. El archivo `metadata.json` del repositorio registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, lo que permite reproducir la composición del corpus. No se menciona en la información disponible el uso de RLHF, DPO ni SFT; de hecho, el autor indica explícitamente que estos pesos preceden al condicionamiento tiny-rl, al SFT y al RL. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano, sin formato de instrucciones ni plantillas de chat.
- Modelado de lenguaje puro: el objetivo de entrenamiento es la predicción del siguiente token, medido en BPB y pérdida, no en precisión de tareas.
- Capacidad de continuación de código y texto técnico derivada del sesgo del 80 % de tokens de código en la mezcla de entrenamiento.
- No soporta tool calling ni function calling: no hay evidencia en la información disponible de entrenamiento para ello.
- No soporta agentes ni razonamiento multi-paso: es un modelo base sin post-entrenamiento.
- Capacidades multilingües no documentadas; el tokenizador GPT-2 y la composición del corpus hacen esperar un rendimiento muy superior en inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- El contexto efectivo está limitado a 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.

## Casos de uso

- Investigación sobre mezclas de datos: el modelo sirve como punto de control para medir el efecto de una mezcla code-heavy frente a mezclas equilibradas con el mismo presupuesto de 10 TPP, usando `results.json` como referencia de pérdida y BPB.
- Reproducibilidad de experimentos de preentrenamiento: al registrar revisiones, pesos de mezcla y SHA256 en `metadata.json`, se puede replicar el corpus y comparar curvas de entrenamiento entre semillas.
- Fine-tuning académico en dominios de código: con 63,5 M de parámetros y pesos float32, se puede ajustar en una sola GPU consumer para tareas de completado de código o clasificación de fragmentos.
- Generación de código en entornos de bajo recurso: el modelo cabe en CPU y en GPU de gama baja, por lo que puede usarse en prototipos de autocompletado o generación de snippets donde no se requiera alta calidad.
- Estudio de escalado y tokenización: permite analizar cómo afecta el tokenizador GPT-2 y un vocabulario de 50.304 entradas al rendimiento en código frente a tokenizadores específicos de programación.
- Docencia y experimentación con arquitecturas transformer: el código `model.py` y `generate.py` incluidos facilitan entender el flujo completo de un GPT desde el checkpoint hasta la generación con decodificación greedy (`temperature=0`).
- Evaluación de técnicas de decodificación: al ser un modelo pequeño y rápido, sirve para comparar greedy, muestreo con temperatura y otras estrategias en tareas de continuación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que `results.json` contiene el registro original de finalización y las evaluaciones finales, pero los valores concretos de BPB y pérdida no se incluyen en la información proporcionada, y no deben inferirse ni inventarse. Las métricas mencionadas son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 254 MB (63,5 M de parámetros × 4 bytes), por lo que el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de estas últimas por su tamaño reducido.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida; el script selecciona CUDA, Apple MPS o CPU con `device=auto`.
- Opciones de despliegue: el cargador propio en PyTorch incluido en el repositorio (`model.py`, `generate.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `model.pt` no es GGUF ni safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en milisegundos por token en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.
- Requisitos de software: PyTorch, `tiktoken` y las dependencias del directorio del modelo; el autor sugiere `uv` para gestionar el entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 64M (este) | 63,5 M | 1.024 | 635 M tokens, mezcla code-heavy 80 % | no disponible | Hugging Face, cargador propio |
| GPT-2 small | 124 M | 1.024 | WebText, ~40 GB | MIT (pesos originales) | Hugging Face, Transformers |
| Pythia-70M | 70 M | 2.048 | The Pile, 300 B tokens | Apache 2.0 | Hugging Face, Transformers |
| SmolLM-135M | 135 M | 2.048 | FineWeb-Edu y otros, ~600 B tokens | Apache 2.0 | Hugging Face, Transformers |

La comparación debe leerse con cautela: los tres modelos alternativos están entrenados con órdenes de magnitud más de tokens y con recetas orientadas a uso general, mientras que este modelo es un punto de control de investigación con 635 M tokens y una mezcla sesgada a código. No se dispone de métricas comparables de benchmarks en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo base sin SFT ni RLHF: no sigue instrucciones, no mantiene formato de chat y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinación y de generar código sintácticamente plausible pero incorrecto, dado su tamaño y su presupuesto de entrenamiento limitado.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos, conversaciones multi-turno o bases de código extensas.
- Idiomas no documentados; el tokenizador GPT-2 y la mezcla de datos favorecen el inglés, con rendimiento esperablemente pobre en castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido sin consultar al autor; la ausencia de licencia explícita es un riesgo legal para producción.
- No compatible con `AutoModel` de Transformers ni con formatos estándar como safetensors o GGUF; requiere el cargador propio del repositorio.
- El checkpoint no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento original de forma exacta.
- Sesgos conocidos: no documentados en la información disponible; la mezcla code-heavy puede infrarepresentar lenguaje natural y sesgar la generación hacia sintaxis de programación.
- Las métricas publicadas son de modelado de lenguaje (BPB, pérdida), no de precisión en tareas; no deben presentarse como rendimiento en benchmarks.
- No apto para producción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-64m-10tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de la arquitectura): https://github.com/karpathy/nanoGPT
