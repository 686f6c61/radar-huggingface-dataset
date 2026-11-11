# davidheineman/nanogpt-ladder-v3-code-heavy-64m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 code-heavy 64M es un modelo de lenguaje base de tipo GPT-2 entrenado desde cero por el desarrollador independiente davidheineman dentro de su serie experimental "NanoGPT Ladder v3". Se trata de un punto de control de preentrenamiento completado, no de un modelo instruct, por lo que sus pesos preceden a cualquier fase de SFT, RLHF o condicionamiento y solo aceptan prompts de texto plano. Con 63.504.384 parametros, 12 capas, anchura 512 y 8 cabezas de atencion, es un modelo deliberadamente pequeno pensado para estudiar el efecto del presupuesto de tokens y de la mezcla de datos en el preentrenamiento.

La relevancia de este checkpoint reside en su caracter controlado: cada presupuesto de tokens (aqui 30 TPP, es decir, 30 tokens por parametro, que equivalen a 1.905.131.520 tokens de prediccion) corresponde a un entrenamiento independiente y reproducible con semilla fija (1337). La mezcla de datos es "code-heavy", siguiendo la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas pesadas asignan el 80% al dominio nombrado, en este caso codigo.

El modelo usa embeddings atados, RoPE, tokenizador GPT-2 y un contexto de 1.024 tokens. No esta pensado para produccion ni para tareas conversacionales, sino como material de investigacion sobre escalado de tokens, mezclas de datos y dinamica de preentrenamiento en regimenes de parametros muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, principalmente ingles en la practica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con `model`, `config`, `identity` y `run`); no compatible con AutoModel de Transformers |

Otros datos tecnicos: 12 capas, anchura 512, 8 cabezas de atencion, vocabulario acolchado de 50.304, 58.140 pasos de optimizador, 1.905.131.520 tokens de prediccion, semilla 1337. El repositorio incluye `model.py`, `generate.py`, `metadata.json` (revisiones exactas de fuentes, pesos de mezcla y SHA256) y `results.json` (registro de finalizacion y evaluaciones finales). Tamano del repo: 0,3 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de NanoGPT: 12 bloques, dimension de modelo 512, 8 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario acolchado a 50.304 entradas. El contexto maximo es de 1.024 tokens. El modelo expone un metodo `forward_logits` y se carga mediante un cargador propio incluido en el repositorio, no a traves de `AutoModel` de Transformers.

El entrenamiento consistio en un preentrenamiento de lenguaje causal sobre 1.905.131.520 tokens de prediccion (30 tokens por parametro) durante 58.140 pasos de optimizador, con semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`); en las mezclas "code-heavy", el 80% de los datos se asigna al dominio de codigo. No se aplico RLHF, DPO ni SFT: el checkpoint es el punto final del preentrenamiento puro. El autor documenta que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje, no precision en resolucion de tareas. El checkpoint no incluye estado del optimizador, aunque admite fine-tuning posterior.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts en texto plano con decodificacion greedy (`temperature=0`) o muestreo.
- Modelado de lenguaje causal: util para medir perplejidad y BPB sobre corpus de codigo o texto.
- Base para fine-tuning: al ser un checkpoint de preentrenamiento puro, sirve como inicializacion para SFT o ajuste especifico de dominio.
- Sesgo hacia codigo: la mezcla code-heavy (80% del dominio nombrado) hace que el modelo haya visto una proporcion elevada de texto de programacion durante el preentrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable a este tamano y sin instrucciones.
- Capacidades multilingues: no documentadas; el tokenizador GPT-2 favorece el ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre leyes de escalado de tokens: el modelo forma parte de una escalera de presupuestos de tokens (aqui 30 TPP) con semilla fija, lo que permite comparar curvas de perdida entre puntos de la escalera bajo condiciones controladas.
- Estudio de mezclas de datos: al seguir la receta Dolma3 Dolmino con un 80% de codigo, sirve para analizar como el sesgo de dominio afecta a la perplejidad en codigo frente a texto general.
- Baseline en experimentos de preentrenamiento: su tamano (63M) permite entrenar y evaluar variantes en una sola GPU consumer, actuando como referencia reproducible con semilla 1337.
- Fine-tuning de dominio sobre codigo: partir de estos pesos para ajustar un modelo pequeno de autocompletado o clasificacion de fragmentos de codigo en entornos con recursos limitados.
- Educacion y docencia: el repositorio incluye `model.py` y `generate.py` autocontenidos, lo que facilita explicar el ciclo completo de un transformer GPT-2 desde el checkpoint hasta la generacion.
- Evaluacion de tecnicas de decodificacion: con contexto de 1.024 tokens y pesos float32, es un banco de pruebas barato para comparar greedy, muestreo y variantes de temperatura.
- Analisis de reproducibilidad: `metadata.json` registra revisiones de fuentes, pesos de mezcla y SHA256, lo que permite auditar la procedencia exacta de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que `results.json` contiene evaluaciones finales de BPB y perdida, pero no se proporcionan los valores numericos ni comparaciones con MMLU, HumanEval, GSM8K u otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en float32 ocupa aproximadamente 0,25 GB (63,5M parametros x 4 bytes), por lo que cabe holgadamente en cualquier GPU consumer; en FP16/BF16 rondaria los 0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; el autor soporta seleccion automatica de dispositivo (`device=auto`) entre CUDA, Apple MPS y CPU.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 3060, RTX 4090, Apple Silicon via MPS) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al usar un cargador propio no es compatible con `AutoModel` de Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 64M (este) | 63,5M | 1.024 | Preentrenamiento controlado, mezcla 80% codigo | no disponible | Hugging Face, cargador propio |
| GPT-2 small (OpenAI) | 124M | 1.024 | Transformer decoder-only con tokenizador GPT-2 | MIT (pesos publicos) | Ampliamente disponible, integrado en Transformers |
| Pythia-70M (EleutherAI) | 70M | 2.048 | Suite de preentrenamiento reproducible con checkpoints intermedios | Apache 2.0 | Hugging Face, compatible con Transformers |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | Modelo pequeno moderno con datos curados | Apache 2.0 | Hugging Face, ecosistema amplio |

La comparacion es orientativa: los datos de los modelos alternativos provienen de conocimiento general y no de la informacion proporcionada en esta ficha. Frente a ellos, este checkpoint destaca por su caracter experimental y reproducible (semilla fija, metadata con SHA256), pero carece de licencia declarada y de integracion con el ecosistema Transformers.

## Limitaciones y advertencias

- No es un modelo instruct: no sigue instrucciones ni mantiene conversaciones; solo completa texto a partir de un prompt.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, dado su tamano (63M) y la ausencia de SFT o RLHF.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Idiomas no documentados; el tokenizador GPT-2 y la mezcla de datos probablemente favorecen el ingles y el codigo.
- Sesgos de dominio: la mezcla code-heavy (80% al dominio nombrado) puede degradar el rendimiento en texto general frente a mezclas equilibradas.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- No compatible con `AutoModel` de Transformers ni con herramientas estandar de servido (vLLM, TGI, llama.cpp); requiere el cargador propio del repositorio.
- Las metricas publicadas (BPB, perdida) miden modelado de lenguaje, no capacidad de resolver tareas; no deben interpretarse como precision.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-64m-30tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
