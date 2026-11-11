# davidheineman/nanogpt-ladder-v3-web-heavy-32m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 web-heavy 32M es un modelo de lenguaje base de pequeno tamano (32.071.680 parametros) desarrollado por davidheineman dentro de la coleccion NanoGPT Ladder v3, una serie de experimentos de preentrenamiento controlados. El modelo se ha entrenado desde cero sobre el pool Dolma3 Dolmino de AllenAI con una mezcla "web-heavy", en la que el 80% de los datos corresponde al dominio web nombrado. Su interes no reside en capacidades de producto, sino en servir como punto de referencia reproducible para estudiar el efecto de la composicion de datos y del presupuesto de tokens en modelos pequenos.

La arquitectura es un transformer decoder-only estilo GPT-2 (13 capas, ancho 320, 5 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2) con una ventana de contexto de 1.024 tokens. Se han consumido 962.134.016 tokens de prediccion en 29.362 pasos de optimizador, lo que equivale a 30 tokens por parametro (TPP). Los pesos son el punto final de preentrenamiento, anteriores a cualquier fase de SFT o RL, por lo que debe usarse con prompts de texto plano.

Es relevante ahora porque forma parte de una escalera de modelos con presupuestos de tokens y mezclas de datos independientes, lo que permite analizar empiricamente leyes de escalado y recetas de datos con un coste de computo minimo. La licencia no esta declarada y el modelo no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (13 capas, ancho 320, 5 cabezas, RoPE, embeddings atados) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio (`model.py`), no compatible con AutoModel de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la implementacion NanoGPT: un transformer decoder-only con 13 capas, dimension de modelo 320, 5 cabezas de atencion, embeddings de entrada y salida atados, RoPE para codificacion posicional y tokenizador GPT-2 con vocabulario rellenado a 50.304 entradas. La ventana de contexto es de 1.024 tokens. El checkpoint incluye las claves `model`, `config`, `identity` y `run`, y conserva los pesos de embedding y salida atados; no incluye estado del optimizador.

El preentrenamiento consume 962.134.016 tokens de prediccion en 29.362 pasos de optimizador, lo que corresponde a 30 tokens por parametro. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`); en las mezclas "heavy" el 80% del presupuesto se asigna al dominio nombrado (en este caso, web). Cada presupuesto de tokens es una ejecucion entrenada de forma independiente, con semilla 1337. El fichero `metadata.json` documenta revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, y `results.json` recoge el registro de finalizacion y las evaluaciones finales. No se menciona RLHF, DPO ni SFT en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva con prompts de texto plano (modelo base, sin ajuste de instrucciones).
- Modelado de lenguaje y evaluacion de perplejidad/BPB sobre texto.
- Capacidad limitada de razonamiento y codigo, condicionada por el tamano (32M) y el presupuesto de entrenamiento (30 TPP).
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no documentadas; el tokenizador es GPT-2 y el dataset es Dolma3 Dolmino.
- Sin modo thinking, vision ni audio.

## Casos de uso

- Investigacion de leyes de escalado: el modelo sirve como punto de la escalera NanoGPT Ladder v3 para medir como varia la perdida con el presupuesto de tokens (30 TPP) y la mezcla de datos, comparandolo con otros puntos de la misma coleccion.
- Estudios de mezcla de datos: al ser una ejecucion "web-heavy" (80% web), permite aislar el efecto del dominio web frente a otras mezclas del mismo pool Dolmino con identico presupuesto y semilla.
- Reproducibilidad de preentrenamiento: los ficheros `metadata.json` y `results.json` permiten replicar la receta exacta (revisiones, pesos de mezcla, SHA256) en entornos academicos.
- Baseline para fine-tuning: el checkpoint admite ajuste posterior; se puede usar como inicializacion para tareas de clasificacion o generacion de dominio acotado con presupuesto de computo minimo.
- Docencia y prototipado: con 32M parametros y pesos float32 (repo de 0,1 GB), se puede ejecutar en CPU o Apple MPS para demostrar el funcionamiento interno de un transformer GPT.
- Evaluacion de tokenizadores y pipelines: util para validar herramientas de inferencia propias (`generate.py`, cargador `model.py`) antes de escalar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 128 MB para los pesos (32M parametros x 4 bytes), mas activaciones y cache KV, muy por debajo de 1 GB en total.
- GPU recomendadas: cualquier GPU con CUDA; tambien funciona en Apple MPS y CPU (`device=auto`).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU.
- Opciones de despliegue: script propio `generate.py` con PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (arquitectura personalizada con cargador propio, incompatible con AutoModel de Transformers).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 32M (este) | 32,1M | 1.024 | 962M tokens, 30 TPP, Dolma3 Dolmino web-heavy | no disponible | PyTorch (`model.pt`) |
| GPT-2 small (OpenAI) | 124M | 1.024 | WebText, ~40 GB | MIT | PyTorch, safetensors, GGUF (comunidad) |
| Pythia-70M (EleutherAI) | 70M | 2.048 | The Pile, 300B tokens | Apache 2.0 | safetensors, GGUF (comunidad) |
| Otros puntos de NanoGPT Ladder v3 | ~32M (misma arquitectura) | 1.024 | Distintos TPP y mezclas | no disponible | PyTorch |

La comparacion con GPT-2 small y Pythia-70M es orientativa: ambos son modelos base de proposito general con licencias permisivas y ecosistema de herramientas amplio, mientras que este modelo esta disenado como punto experimental de una escalera controlada y carece de licencia declarada y de soporte en frameworks estandar.

## Limitaciones y advertencias

- Modelo base sin SFT ni RL: no sigue instrucciones y puede generar texto incoherente o repetitivo; requiere prompts de texto plano.
- Tamano muy reducido (32M) y contexto corto (1.024 tokens): capacidad limitada para razonamiento, codigo y conversaciones multi-turno largas.
- Riesgo elevado de alucinacion y de contenido factual incorrecto, inherente a un modelo de este tamano entrenado con 30 TPP.
- Sesgos potenciales heredados de la mezcla web-heavy de Dolma3 Dolmino, con posible sobrerrepresentacion del dominio web; no se han publicado analisis de sesgo.
- Idiomas soportados no documentados; el tokenizador GPT-2 y la composicion del dataset condicionan el rendimiento fuera del ingles.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Arquitectura personalizada: no es compatible con `AutoModel` de Transformers, lo que limita el uso de herramientas estandar (vLLM, TGI, llama.cpp).
- No incluye estado del optimizador en el checkpoint; el fine-tuning parte de los pesos finales sin historial de entrenamiento.
- Las metricas publicadas son de modelado de lenguaje (BPB/perdida), no de precision en tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-32m-30tpp-seed-1337
- Coleccion NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
