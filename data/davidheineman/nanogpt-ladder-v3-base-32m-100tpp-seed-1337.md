# davidheineman/nanogpt-ladder-v3-base-32m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 32M 100 TPP es un modelo de lenguaje de tipo base (sin ajuste por instrucciones) publicado por el usuario davidheineman en Hugging Face. Se trata de un punto final de preentrenamiento de la serie NanoGPT Ladder v3, un conjunto de ejecuciones independientes que escalan el presupuesto de tokens de entrenamiento manteniendo fija la arquitectura. Este punto concreto tiene 32.071.680 parámetros y ha sido entrenado sobre 3.207.168.000 tokens de predicción a lo largo de 97.875 pasos de optimizador, con semilla 1337.

El modelo sigue una arquitectura transformer tipo GPT-2 con 13 capas, anchura 320, 5 cabezas de atención, embeddings atados, RoPE, tokenizador GPT-2 y una ventana de contexto de 1.024 tokens. El vocabulario está rellenado hasta 50.304 entradas. Los pesos se distribuyen en formato PyTorch nativo (float32 original) y requieren un cargador propio, no compatible con `AutoModel` de Transformers.

Su relevancia es principalmente experimental: sirve para estudiar curvas de escalado de tokens por parámetro (TPP), reproducibilidad de recetas de mezcla de datos y comportamiento de modelos pequeños entrenados sobre el pool Dolma3 Dolmino. No es un modelo pensado para uso en producción ni para tareas de instrucción, ya que los pesos son anteriores a cualquier fase de SFT o RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 32.071.680 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponibles (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity` y `run`) |
| Capas | 13 |
| Dimension de embedding (width) | 320 |
| Cabezas de atencion | 5 |
| Vocabulario | 50.304 (padded), tokenizador GPT-2 (tiktoken) |
| Tokens de entrenamiento | 3.207.168.000 (~100 TPP) |
| Pasos de optimizador | 97.875 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo GPT-2, con 13 capas, anchura 320 y 5 cabezas de atención. Emplea embeddings atados entre entrada y salida, codificación posicional rotatoria (RoPE) y el tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. El contexto máximo es de 1.024 tokens. La implementación es la de NanoGPT, con un cargador propio (`model.py`, `generate.py`) en lugar del `AutoModel` de Transformers.

El entrenamiento parte del pool Dolma3 Dolmino con la receta de mezcla congelada del proyecto. Las mezclas "heavy" asignan un 80 % de los tokens a un dominio concreto; el fichero `metadata.json` documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256. Se trata de un run independiente dentro de la escalera v3, con 3.207.168.000 tokens de predicción y 97.875 pasos de optimizador, semilla 1337. No se aplicó SFT, RLHF ni DPO: los pesos son puramente de preentrenamiento. El checkpoint no incluye estado del optimizador.

## Capacidades

- Generación de texto autoregresiva a partir de prompts en texto plano, con decodificación greedy (`temperature=0`) o por muestreo.
- Modelado de lenguaje de siguiente token; útil como base para medir pérdida y bits por byte (BPB) en evaluaciones de lenguaje.
- Punto de partida para fine-tuning posterior (el checkpoint admite entrenamiento adicional, aunque sin estado de optimizador).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües no documentadas; el tokenizador GPT-2 y el pool Dolmino sugieren predominio de inglés, pero no se confirma.

## Casos de uso

- Estudio de escalado de tokens por parámetro: comparar este punto (100 TPP) con otros puntos de la escalera v3 para trazar curvas de pérdida frente a tokens de entrenamiento y validar leyes de escalado en modelos pequeños.
- Reproducibilidad de recetas de mezcla de datos: usar `metadata.json` y los hashes para replicar la mezcla Dolmino y analizar el efecto de la ponderación por dominio (80 % al dominio "heavy") en la pérdida final.
- Baseline para experimentos de preentrenamiento: servir como referencia ligera (32M parámetros) contra la que medir cambios de arquitectura, tokenizador o curriculum sin incurrir en costes de cómputo elevados.
- Fine-tuning de dominio: al ser un checkpoint base, se puede ajustar sobre corpus específicos (código, texto legal, científico) para estudiar la transferencia desde un preentrenamiento pequeño.
- Evaluación de infraestructura de inferencia: su tamaño reducido (repo de 0,1 GB) permite probar pipelines de carga propia en PyTorch, selección automática de dispositivo (CUDA, Apple MPS o CPU) y decodificación greedy frente a muestreo.
- Docencia y divulgación: ilustrar el funcionamiento interno de un transformer GPT-2 completo con pesos reales y código de carga sencillo, sin necesidad de GPUs de gama alta.
- Investigación sobre tokenizadores: analizar el impacto del vocabulario rellenado (50.304) y del tokenizador GPT-2 en la eficiencia de compresión y en la pérdida por byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro original de finalización y evaluaciones finales, y que las mediciones finales de BPB/pérdida son evaluaciones de modelado de lenguaje, no精确itud en resolución de tareas. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32M parámetros en float32, el peso ocupa aproximadamente 128 MB; en float16, unos 64 MB. La huella total con activaciones y contexto de 1.024 tokens es muy inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requieren A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 3060 y GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1-2 GB de VRAM. También se ejecuta en CPU y en Apple MPS según la selección automática del script (`device=auto`).
- Opciones de despliegue: el modelo usa un cargador propio de PyTorch (`model.py` y `generate.py`), por lo que no es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin conversión previa. El flujo documentado es `hf download` más `uv run python generate.py`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera latencia muy baja en GPU y moderada en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 32M 100 TPP | 32,07M | 1.024 | no disponible | PyTorch nativo | Base sin SFT/RL, cargador propio |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos publicados) | PyTorch / safetensors | Referencia clásica; 4x más parámetros |
| Pythia-70M (EleutherAI) | 70M | 2.048 | Apache 2.0 | safetensors | Suite de escalado con checkpoints intermedios |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | safetensors | Ya instruido; mucho mayor |

La comparación directa con GPT-2 small y Pythia-70M es la más adecuada por escala; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin fine-tuning.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, propio de un modelo de 32M parámetros entrenado sobre 3,2B tokens.
- Contexto limitado a 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está garantizado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Pesos en float32 y cargador propio: no hay variantes cuantizadas ni compatibilidad directa con ecosistemas estándar (Transformers, vLLM, llama.cpp).
- El checkpoint no incluye estado del optimizador, lo que limita la reanudación exacta de entrenamientos.
- Las métricas publicadas son de modelado de lenguaje (BPB/pérdida), no de resolución de tareas; no deben interpretarse como capacidad de razonamiento.
- Modelo de investigación: no recomendado para aplicaciones en producción, atención al cliente ni generación de código crítica.

## Enlaces

- Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-32m-100tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (implementación de referencia): https://github.com/karpathy/nanoGPT
- Paper Dolma 3 / Dolmino (AllenAI): no disponible en la información proporcionada.
