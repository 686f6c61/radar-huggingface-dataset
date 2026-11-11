# davidheineman/nanogpt-ladder-v3-base-64m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 64M es un modelo de lenguaje de tipo base (sin instrucciones ni ajuste por preferencias) entrenado desde cero por David Heineman dentro del proyecto NanoGPT Ladder v3. Se trata de un punto de control intermedio de una escalera de experimentos de preentrenamiento: cada presupuesto de tokens corresponde a una ejecución independiente, y este modelo concreto representa el punto final de un entrenamiento de 10 tokens por parámetro (TPP), es decir, 635 millones de tokens de predicción sobre 63,5 millones de parámetros.

Su relevancia no reside en capacidades de producto, sino en su valor metodológico: es un modelo pequeño, reproducible (semilla 1337), con arquitectura GPT-2 modificada (RoPE, embeddings atados) y con metadatos completos de mezcla de datos, revisiones de origen y hashes SHA256. Sirve como referencia para estudiar leyes de escalado, recetas de mezcla de datos y el efecto del presupuesto de tokens en modelos de menos de 100 millones de parámetros.

Es un modelo de generación de texto puro, sin visión, sin tool calling y sin modo de razonamiento. Sus pesos preceden a cualquier etapa de SFT o RL, por lo que debe usarse con prompts de texto plano y expectativas propias de un modelo base de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (12 capas, ancho 512, 8 cabezas de atención, RoPE, embeddings atados) |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con `model`, `config`, `identity` y `run`); no usa `AutoModel` de Transformers |
| Vocabulario | 50.304 (GPT-2, con padding) |
| Tokenizador | GPT-2 vía `tiktoken` (`get_encoding('gpt2')`) |
| Tokens de entrenamiento | 635.043.840 (10 TPP) |
| Pasos de optimizador | 19.380 |
| Semilla | 1337 |
| Dataset | `allenai/dolma3_dolmino_pool` (receta de mezcla congelada) |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 12 capas, dimensión de modelo 512 y 8 cabezas de atención (64 dimensiones por cabeza). Incorpora embeddings atados entre entrada y salida, codificación posicional rotatoria (RoPE) en lugar de posiciones aprendidas, y un vocabulario GPT-2 ampliado a 50.304 entradas para permitir padding. El contexto máximo es de 1.024 tokens.

El preentrenamiento se realizó sobre el pool Dolma3 Dolmino de AllenAI siguiendo una receta de mezcla congelada; en las mezclas "heavy", el 80 % de los tokens se asigna al dominio nombrado. El autor documenta en `metadata.json` las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, lo que permite reproducir la composición del corpus. No se aplicó SFT, RLHF ni DPO: los pesos son el punto final del preentrenamiento puro. No se especifica en la información disponible si hubo decodificación especulativa, atención lineal u otra innovación de eficiencia; la arquitectura descrita es la de un GPT-2 convencional con RoPE.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano (modelo base, sin formato de instrucciones).
- Continuación de texto y modelado de lenguaje genérico; útil para evaluaciones de perplejidad y BPB.
- Punto de partida para fine-tuning supervisado o experimentos de ajuste posteriores (el checkpoint admite entrenamiento adicional; no incluye estado del optimizador).
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidad multilingüe limitada por el tokenizador GPT-2 y por el corpus de entrenamiento; no se documentan idiomas soportados.
- Decodificación greedy (`temperature=0`) y con muestreo; selección automática de dispositivo CUDA, Apple MPS o CPU.

## Casos de uso

- Investigación sobre leyes de escalado: el modelo es un punto de una escalera de presupuestos de tokens (TPP) con semilla fija, lo que permite medir cómo varía la pérdida con el número de tokens vistos manteniendo constante la arquitectura y la mezcla de datos.
- Reproducción de experimentos de preentrenamiento: los metadatos con revisiones de dataset, pesos de mezcla y SHA256 permiten replicar la receta y comparar resultados entre ejecuciones.
- Evaluación de recetas de mezcla de datos: al seguir la receta Dolma3 Dolmino con mezclas "heavy" al 80 % por dominio, sirve para estudiar el impacto de la composición del corpus en modelos pequeños.
- Fine-tuning educativo y prototipado: con 63,5 M de parámetros y 0,3 GB de pesos en float32, se puede ajustar en una sola GPU de consumo para experimentos de SFT, clasificación o estilo.
- Generación de texto de bajo coste en local: continuación de texto, generación de plantillas o datos sintéticos rudimentarios en CPU o Apple MPS, sin dependencia de servicios en la nube.
- Base para comparativas de tokenizadores y arquitecturas: al usar GPT-2 con RoPE y embeddings atados, permite aislar el efecto de estas decisiones frente a variantes con posiciones aprendidas.
- Docencia y divulgación: el código incluido (`model.py`, `generate.py`) es un ejemplo mínimo y legible de un transformer GPT-2 funcional con carga nativa en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que `results.json` contiene el registro de finalización y evaluaciones finales, y que las mediciones finales de BPB/loss son evaluaciones de modelado de lenguaje, no precisión en tareas. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB para los pesos (63,5 M × 4 bytes), más activaciones y caché KV para 1.024 tokens; en la práctica cabe holgadamente en cualquier GPU con 1 GB o más.
- En float16/bfloat16: alrededor de 0,13 GB de pesos, aunque el autor no publica conversiones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso iGPU; el modelo es trivial para A100/H100 y no las aprovecha.
- Cabe en GPU consumer: sí, en todas las GPU con soporte CUDA; también en Apple Silicon vía MPS y en CPU.
- Opciones de despliegue: el repositorio incluye un cargador propio (`model.py`, `generate.py`) que no usa `AutoModel` de Transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El script admite `device=auto` y `temperature=0`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, la generación en GPU consumer debería ser de milisegundos por token, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 64M (este) | 63,5 M | 1.024 | no disponible | PyTorch nativo | Base, sin SFT/RL, receta Dolma3, semilla 1337 |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | PyTorch, TF, GGUF (comunidad) | Referencia histórica; mayor tamaño y ecosistema amplio |
| Pythia-70M (EleutherAI) | 70 M | 2.048 | Apache 2.0 | safetensors, GGUF (comunidad) | Suite de escalado con checkpoints intermedios y datos documentados |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo pequeño con SFT y licencia permisiva |

La comparación se basa en categoría y tamaño; no se dispone de resultados de benchmarks de este modelo para contrastar rendimiento numérico con las alternativas.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no responde preguntas de forma fiable y no está alineado; el autor recomienda prompts de texto plano.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de 63,5 M de parámetros.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 y el corpus favorecen el inglés, con cobertura previsiblemente pobre del castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- No hay cuantizaciones oficiales ni integración con runtimes estándar (vLLM, llama.cpp, TGI); el despliegue requiere el cargador propio del repositorio.
- El checkpoint no incluye estado del optimizador, lo que limita reanudar el entrenamiento exactamente donde se dejó.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre un pool web, es esperable que reproduzca sesgos presentes en el corpus.
- Las métricas publicadas son de modelado de lenguaje (BPB/loss), no de precisión en tareas; no deben interpretarse como capacidad de resolución de problemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-64m-10tpp-seed-1337
- Colección de modelos completados de NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura y código): https://github.com/karpathy/nanoGPT
