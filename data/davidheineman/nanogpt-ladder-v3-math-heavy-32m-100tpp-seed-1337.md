# davidheineman/nanogpt-ladder-v3-math-heavy-32m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 math-heavy 32M 100 TPP es un modelo de lenguaje base de pequeno tamano (32.071.680 parametros) entrenado desde cero por David Heineman como parte de la serie NanoGPT Ladder v3, un conjunto de experimentos de preentrenamiento reproducible orientados a estudiar el efecto del presupuesto de tokens y la composicion del dataset sobre modelos de escala reducida. El modelo emplea una arquitectura transformer decoder-only clasica de estilo GPT-2 (13 capas, ancho 320, 5 cabezas de atencion, embeddings atados y RoPE) con un contexto de 1.024 tokens, y se ha entrenado sobre 3.207.168.000 tokens de prediccion (100 TPP, tokens por parametro) en 97.875 pasos de optimizacion con semilla 1337.

La particularidad de esta variante es su mezcla de datos "math-heavy": sigue la receta congelada del pool Dolma3 Dolmino de AllenAI, pero asigna un 80% de la mezcla al dominio matematico nombrado. El resultado es un checkpoint de preentrenamiento puro que precede a cualquier fase de SFT, RL o condicionamiento tiny-rl, por lo que debe usarse con prompts de texto plano y no como asistente conversacional.

Su relevancia es fundamentalmente investigadora: sirve como punto de control reproducible para estudiar leyes de escalado, efectos de mezclas de dominio y dinamicas de preentrenamiento en regimenes de computo muy bajos, y como modelo de juguete para validar pipelines de entrenamiento e inferencia sin necesidad de hardware especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (13 capas, ancho 320, 5 cabezas, embeddings atados, RoPE) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio; no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 13 capas, dimension de modelo 320 y 5 cabezas de atencion (dimension de cabeza 64). Usa embeddings atados entre entrada y salida, codificacion posicional rotatoria (RoPE), tokenizador GPT-2 (tiktoken) y un vocabulario rellenado de 50.304 entradas. El checkpoint `model.pt` incluye las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados de embedding y salida; no incluye estado del optimizador, por lo que sirve tanto para inferencia como para fine-tuning posterior.

El entrenamiento consistio en un preentrenamiento de 3.207.168.000 tokens de prediccion (100 TPP sobre los 32M parametros) durante 97.875 pasos de optimizacion con semilla 1337. La mezcla de datos sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`, con un 80% asignado al dominio matematico en esta variante "math-heavy". El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` con el registro de finalizacion del entrenamiento y las evaluaciones finales. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna tecnica de alineacion; se trata de un checkpoint puramente preentrenado.

## Capacidades

- Generacion de texto autoregresiva basica a partir de prompts de texto plano (no instruccional).
- Modelado de lenguaje y continuacion de texto en estilo GPT-2.
- Capacidad de razonamiento matematico emergente limitada, derivada de la mezcla math-heavy del dataset de entrenamiento; no se han publicado evaluaciones de tareas que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el tokenizador GPT-2 esta sesgado hacia ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Fine-tuning posterior posible: el checkpoint es compatible con entrenamiento adicional, aunque sin estado del optimizador.

## Casos de uso

- Investigacion de leyes de escalado: el modelo forma parte de una escalera de presupuestos de tokens (TPP) con semilla fija, lo que permite comparar curvas de perdida frente a tokens vistos en regimenes de computo muy bajos.
- Estudio de mezclas de dominio: al ser una variante math-heavy con pesos de mezcla documentados en `metadata.json`, sirve para aislar el efecto de sobremuestrear matematicas en el preentrenamiento.
- Reproducibilidad de experimentos: los hashes SHA256 y las revisiones de fuente registradas permiten replicar exactamente el entrenamiento y verificar resultados.
- Prototipado de pipelines de entrenamiento: su tamano (0,1 GB de repositorio) permite iterar rapidamente en bucles de entrenamiento, evaluacion y checkpointing en una sola GPU consumer.
- Validacion de infraestructura de inferencia: util como modelo de humo para probar servidores de generacion, scripts de carga de checkpoints y flujos de tokenizacion antes de escalar a modelos mayores.
- Educacion y docencia: ejemplo minimo y completo de un transformer GPT-2 con cargador propio (`model.py`, `generate.py`) para ensenar los fundamentos de preentrenamiento y generacion.
- Generacion de texto creativo de baja exigencia: continuaciones de texto con decodificacion greedy o por temperatura, util como baseline cualitativo frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene mediciones finales de BPB/perdida, pero se trata de evaluaciones de modelado de lenguaje y no de precision en tareas; no se proporcionan cifras concretas en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (32M parametros, ~128 MB de pesos mas activaciones para contexto de 1.024 tokens); en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor soporta CUDA, Apple MPS y CPU mediante `device=auto`.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante el `model.py` y `generate.py` incluidos; no es compatible con `AutoModel` de Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF ni safetensors, estas rutas requeririan conversion propia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 math-heavy 32M 100 TPP | 32,1M | 1.024 | no disponible | Hugging Face (PyTorch nativo) | Preentrenamiento puro, mezcla math-heavy, cargador propio |
| GPT-2 small | 124M | 1.024 | MIT (segun publicacion original) | Amplia (Transformers, GGUF, etc.) | Baseline clasico de la misma familia arquitectonica, 4x mas grande |
| NanoGPT (Karpathy) | ~124M (config por defecto) | 1.024 | MIT (codigo) | Repositorio de codigo, no pesos oficiales | Referencia de implementacion en la que se basa esta serie |
| Otros modelos de la serie NanoGPT Ladder v3 | ~32M | 1.024 | no disponible | Coleccion en Hugging Face | Misma arquitectura con distintas mezclas de datos y presupuestos de tokens |

La comparacion directa de rendimiento con alternativas no es posible porque no se han publicado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo instruccional: no ha pasado por SFT ni RL, por lo que no sigue instrucciones ni mantiene formato conversacional; debe usarse con prompts de texto plano.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, propio de un modelo de 32M parametros entrenado con 100 TPP.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados; el tokenizador GPT-2 y la mezcla de datos estan sesgados hacia ingles, con rendimiento esperablemente pobre en castellano.
- Sesgos desconocidos: no se documenta analisis de sesgos ni filtrado de datos mas alla de la receta Dolma3 Dolmino.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Incompatibilidad con el ecosistema Transformers: requiere el cargador propio incluido, lo que complica su integracion en herramientas estandar (vLLM, TGI, llama.cpp).
- Sin estado del optimizador en el checkpoint: el fine-tuning posterior parte de cero en cuanto a estado de Adam y programacion de learning rate.
- Las mediciones de `results.json` son de perdida/BPB, no de precision en tareas; no deben interpretarse como capacidades resueltas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-math-heavy-32m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
