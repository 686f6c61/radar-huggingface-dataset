# davidheineman/nanogpt-ladder-v3-web-heavy-32m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · web-heavy · 32M · 100 TPP es un modelo de lenguaje de tipo base, desarrollado por davidheineman, que forma parte de una serie de experimentos de preentrenamiento a escala controlada conocida como NanoGPT Ladder v3. El modelo tiene 32.071.680 parametros y ha sido entrenado sobre 3.207.168.000 tokens de prediccion (100 tokens por parametro, TPP) durante 97.875 pasos de optimizacion, con semilla 1337. Su proposito no es la produccion, sino servir como punto de referencia reproducible para estudiar el efecto de la mezcla de datos y del presupuesto de tokens en modelos pequenos.

Arquitectura transformer decoder-only de estilo GPT-2, con 13 capas, anchura 320, 5 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. La ventana de contexto es de 1.024 tokens. El modelo se distribuye como checkpoint nativo de PyTorch en float32, con cargador propio (`model.py`), y no es compatible con `AutoModel` de Transformers.

Es relevante ahora porque la serie documenta de forma exhaustiva la receta de mezcla de datos (web-heavy, con un 80% asignado al dominio nombrado segun el pool Dolma3 Dolmino), las revisiones exactas de las fuentes y los hashes SHA256, lo que permite reproducir y auditar el experimento. Los pesos son anteriores a cualquier acondicionamiento tiny-rl, SFT o RL, por lo que solo deben usarse con prompts de texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (13 capas, anchura 320, 5 cabezas, RoPE, embeddings atados) |
| Parametros totales | 32.071.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint nativo PyTorch (`model.pt`, float32); cargador propio, no Transformers |
| Tokens de entrenamiento | 3.207.168.000 (100 TPP) |
| Pasos de optimizacion | 97.875 |
| Semilla | 1337 |
| Vocabulario | 50.304 (tokenizador GPT-2 con vocabulario rellenado) |
| Dataset | allenai/dolma3_dolmino_pool (receta de mezcla web-heavy) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 13 capas, dimension de modelo 320 y 5 cabezas de atencion, lo que implica una dimension por cabeza de 64. Usa embeddings atados entre la matriz de entrada y la proyeccion de salida, codificacion posicional rotatoria (RoPE) y el tokenizador GPT-2 con un vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens. El checkpoint se guarda en float32 e incluye las claves `model`, `config`, `identity` y `run`; conserva los pesos atados y no incluye estado del optimizador, por lo que sirve tanto para inferencia como para fine-tuning posterior.

El entrenamiento consistio en un preentrenamiento de lenguaje autorregresivo sobre 3.207.168.000 tokens de prediccion, equivalente a 100 tokens por parametro, repartidos en 97.875 pasos de optimizacion con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino con configuracion web-heavy, en la que el 80% de la mezcla se asigna al dominio nombrado (web). El archivo `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y `results.json` contiene el registro original de finalizacion y las evaluaciones finales. No se documentan fases de RLHF, DPO ni SFT: los pesos son el punto final del preentrenamiento puro. Tampoco se describen innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autorregresiva a partir de prompts de texto plano, con decodificacion greedy disponible mediante `temperature=0`.
- Modelado de lenguaje base: el modelo esta disenado para medir perdida y BPB, no para resolver tareas.
- Fine-tuning posterior: el checkpoint admite entrenamiento adicional al conservar los pesos atados y no depender de estado del optimizador.
- Inferencia en CUDA, Apple MPS o CPU mediante seleccion automatica de dispositivo (`device=auto`).
- Integracion en Python con `tiktoken` (codificacion `gpt2`) y el cargador propio incluido en el repositorio.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el tokenizador GPT-2 esta orientado predominantemente al ingles y no se documenta cobertura de otros idiomas.

## Casos de uso

- Reproduccion de experimentos de scaling: el modelo sirve como punto de referencia fijo (32M parametros, 100 TPP, semilla 1337) para comparar el efecto de la mezcla de datos frente a otras variantes de la serie NanoGPT Ladder v3.
- Estudio de mezclas de datos: al seguir la receta web-heavy del pool Dolma3 Dolmino con pesos y hashes documentados, permite analizar como afecta el 80% de asignacion al dominio web en modelos pequenos.
- Investigacion educativa sobre preentrenamiento: su tamano (0,1 GB) y su cargador propio facilitan ejecutar el ciclo completo de carga, generacion y evaluacion de perdida en un portatil.
- Fine-tuning de bajo coste: al no incluir estado del optimizador y caber en memoria de consumer GPU, es adecuado para experimentos de adaptacion a dominios concretos con presupuestos reducidos.
- Evaluacion de tokenizadores: permite medir el impacto del vocabulario GPT-2 rellenado a 50.304 entradas en la perdida por token y por byte (BPB) sobre corpus controlados.
- Pruebas de infraestructura de inferencia: util para validar pipelines de carga de checkpoints nativos de PyTorch en CUDA, MPS y CPU antes de escalar a modelos mayores.
- Docencia y divulgacion: sirve para ilustrar de forma tangible la relacion entre tokens por parametro, pasos de optimizacion y calidad del modelado de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene mediciones finales de BPB y perdida, pero estas son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas, por lo que no son comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en float32 ocupa aproximadamente 0,13 GB (32M parametros x 4 bytes), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con mas de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; se documenta soporte para CUDA (NVIDIA), Apple MPS y CPU. No se requieren A100 ni H100.
- Cabe en consumer GPU: si, en practicamente todas (RTX 3060, RTX 4090, GTX 1650, etc.), asi como en Apple Silicon mediante MPS.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura usa un cargador propio en lugar de `AutoModel`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 32M 100 TPP (este) | 32,07M | 1.024 | 3,21B (100 TPP) | no disponible | PyTorch nativo (float32) | Preentrenamiento puro, cargador propio, mezcla web-heavy documentada |
| Otras variantes de NanoGPT Ladder v3 | no disponible | no disponible | no disponible | no disponible | PyTorch nativo | La coleccion incluye puntos finales de preentrenamiento completados; specs concretas no disponibles |
| GPT-2 small (referencia de arquitectura) | 124M | 1.024 | no disponible | MIT (segun publicacion original) | PyTorch / safetensors | Mayor tamano y ampliamente soportado por ecosistema Transformers |
| Modelos tipo Pythia-70M / 160M | 70M / 160M | 2.048 | no disponible | Apache 2.0 | safetensors | Series de scaling reproducibles con soporte de ecosistema |

La comparativa con alternativas concretas queda limitada porque no se dispone de datos de rendimiento del modelo ni de especificaciones detalladas de las demas variantes de la serie en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: los pesos preceden a tiny-rl, SFT y RL, por lo que no siguen instrucciones y pueden generar texto incoherente o repetitivo.
- Riesgo elevado de alucinacion: al ser un modelo de 32M parametros entrenado con 100 TPP, su capacidad de modelado factual es muy limitada.
- Contexto corto: la ventana de 1.024 tokens restringe tareas que requieran contexto largo.
- Idiomas: no se documenta cobertura multilingue; el tokenizador GPT-2 esta orientado al ingles y el rendimiento en castellano no esta garantizado.
- Licencia no disponible: no se especifica licencia, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Evaluaciones: las metricas publicadas son BPB y perdida, no precision en tareas; no deben interpretarse como rendimiento funcional.
- Compatibilidad: no funciona con `AutoModel` de Transformers ni con herramientas estandar de servido (vLLM, TGI, Ollama) sin adaptacion del cargador.
- Estado del optimizador ausente: reanudar un entrenamiento exacto no es posible sin reconstruir el estado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-32m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
