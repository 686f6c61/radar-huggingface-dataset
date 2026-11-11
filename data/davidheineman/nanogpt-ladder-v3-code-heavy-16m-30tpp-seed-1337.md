# davidheineman/nanogpt-ladder-v3-code-heavy-16m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 16M · 30 TPP es un modelo de lenguaje base de escala reducida (15.851.520 parametros) entrenado desde cero por davidheineman como parte de la serie NanoGPT Ladder v3, un conjunto de ejecuciones independientes de preentrenamiento que varian el presupuesto de tokens por parametro (TPP) y la composicion del corpus. Este checkpoint concreto corresponde al punto final de una ejecucion con mezcla "code-heavy" (80% del peso asignado al dominio de codigo) y un presupuesto de 30 tokens por parametro, con semilla 1337.

El modelo emplea una arquitectura transformer decoder-only estilo GPT-2 (14 capas, ancho 192, 6 cabezas de atencion, embeddings atados, RoPE, tokenizador GPT-2 y contexto de 1.024 tokens), implementada en PyTorch con un cargador propio en lugar de `transformers.AutoModel`. Su interes no reside en capacidades de producto, sino en servir como punto de medida reproducible para estudiar como la mezcla de datos y el presupuesto de tokens afectan a las curvas de perdida en modelos pequenos; los pesos son previos a cualquier fase de SFT o RL.

Es relevante ahora por su caracter abierto y reproducible: incluye `metadata.json` con revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256, ademas de `results.json` con el registro de finalizacion y las evaluaciones finales. El corpus proviene del pool Dolma3 Dolmino de AllenAI. El repositorio ocupa 0,1 GB y las descargas y likes registrados son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (14 capas, ancho 192, 6 cabezas, embeddings atados, RoPE) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 14 capas, dimension de modelo 192 y 6 cabezas de atencion, con embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y un tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. Se entreno con 475.529.216 tokens de prediccion en 14.512 pasos de optimizador, lo que corresponde a un presupuesto de 30 tokens por parametro sobre los 15,85 millones de parametros. Los pesos se guardan en float32 original y el checkpoint incluye las claves `model`, `config`, `identity` y `run`, sin estado del optimizador.

La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino de AllenAI; en las mezclas "heavy" el 80% del peso se asigna al dominio nombrado, en este caso codigo. Cada presupuesto de tokens de la serie es una ejecucion entrenada de forma independiente, lo que permite comparaciones controladas entre checkpoints. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo es un checkpoint de preentrenamiento puro, previo a tiny-rl, SFT y RL, y debe usarse con prompts de texto plano.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts con el tokenizador GPT-2.
- Modelado de lenguaje y medicion de perplejidad/BPB sobre texto y codigo.
- Especializacion relativa en codigo derivada de la mezcla code-heavy (80% del peso al dominio de codigo).
- Decodificacion greedy (`temperature=0`) y muestreo con temperatura; seleccion automatica de dispositivo CUDA, Apple MPS o CPU.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; el tokenizador GPT-2 y el corpus Dolmino condicionan el comportamiento, pero no hay evaluacion por idioma publicada.
- Apto para fine-tuning posterior: el checkpoint es compatible con entrenamiento adicional (sin estado del optimizador).

## Casos de uso

- Investigacion sobre leyes de escalado: comparar este checkpoint de 30 TPP con otros puntos de la serie NanoGPT Ladder v3 para aislar el efecto del presupuesto de tokens sobre la perdida, manteniendo fija la mezcla code-heavy.
- Estudio de mezclas de datos: medir como una asignacion del 80% al dominio de codigo afecta a la perplejidad en codigo frente a texto general, usando los pesos de mezcla registrados en `metadata.json`.
- Reproducibilidad de experimentos: replicar el entrenamiento a partir de las revisiones exactas de las fuentes y los hashes SHA256 documentados en el repositorio.
- Baseline para fine-tuning en dominios de codigo: partir de estos pesos y aplicar SFT sobre un corpus pequeno de tareas de programacion para observar cuanto del rendimiento proviene del preentrenamiento.
- Docencia y divulgacion: el codigo incluido (`model.py`, `generate.py`) y el cargador nativo permiten explicar el funcionamiento interno de un transformer GPT-2 sin la complejidad de una libreria de alto nivel.
- Pruebas de infraestructura de inferencia: validar pipelines propios de carga de checkpoints PyTorch y decodificacion en CPU, MPS o CUDA con un modelo de 0,1 GB.
- Analisis de sesgos y calidad de corpus: examinar las salidas para detectar artefactos del pool Dolmino en un modelo pequeno y con contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro de finalizacion y las evaluaciones finales, y que las mediciones finales de BPB/perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85 millones de parametros, ~63 MB de pesos), mas el coste de activaciones para contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; A100, H100 o RTX 4090 funcionan sin problema pero no aportan ventaja practica.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1060, RTX 2060, RTX 3060 y superiores; tambien en Apple Silicon via MPS y en CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py` incluidos; no es compatible con `transformers.AutoModel`, vLLM, TGI ni llama.cpp/Ollama en su formato actual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 16M 30 TPP | 15,85 M | 1.024 | Preentrenamiento reproducible, mezcla code-heavy | no disponible | Hugging Face, cargador propio |
| NanoGPT Ladder v3 (otros checkpoints de la serie) | ~16 M | 1.024 | Mismos hiperparametros, distinto TPP y mezcla | no disponible | Coleccion en Hugging Face |
| GPT-2 small (referencia arquitectonica) | 124 M | 1.024 | Transformer decoder-only GPT-2 | MIT (segun publicacion original) | Amplia, soporte en transformers |
| Modelos tipo TinyLlama / Qwen2.5-0.5B | 0,5-1,1 B | 2.048-32.768 | LLM pequenos con SFT | Apache 2.0 (Qwen2.5) | Amplia, soporte en vLLM y llama.cpp |

La comparacion con GPT-2 small y con LLM pequenos de 0,5 B es solo orientativa: este checkpoint es un artefacto de investigacion de preentrenamiento, no un modelo ajustado para instrucciones, y su licencia no esta declarada.

## Limitaciones y advertencias

- No es un modelo de instrucciones: los pesos preceden a tiny-rl, SFT y RL, por lo que no sigue comandos ni mantiene dialogos utiles.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Tamano de 15,85 millones de parametros: la calidad de generacion y el conocimiento factual son muy limitados; alta propension a incoherencias y a alucinacion de contenido.
- Sesgos conocidos: no documentados, pero heredados del pool Dolma3 Dolmino y del tokenizador GPT-2 (predominantemente ingles).
- Idiomas soportados no declarados; el rendimiento fuera del ingles no esta evaluado.
- Licencia no disponible: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Formato de pesos no estandar (checkpoint PyTorch con cargador propio), lo que excluye herramientas habituales de inferencia y servido.
- Las metricas publicadas son de modelado de lenguaje (BPB/perdida) y no deben interpretarse como precision en tareas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-16m-30tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
