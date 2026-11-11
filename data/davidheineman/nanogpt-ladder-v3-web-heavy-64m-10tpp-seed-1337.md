# davidheineman/nanogpt-ladder-v3-web-heavy-64m-10tpp-seed-1337

## Resumen
NanoGPT Ladder v3 web-heavy 64M es un modelo de lenguaje base de tipo GPT entrenado desde cero por el desarrollador independiente davidheineman dentro del proyecto NanoGPT Ladder v3. Se trata de un transformer decoder-only denso de 63.504.384 parametros con 12 capas, anchura 512 y 8 cabezas de atencion, que reproduce la arquitectura clasica de nanoGPT con embeddings atados, RoPE y tokenizador GPT-2. Su contexto es de solo 1.024 tokens y el vocabulario esta rellenado hasta 50.304 entradas.

El modelo es el punto final de un entrenamiento de preentrenamiento puro sobre 635.043.840 tokens de prediccion (10 tokens por parametro, TPP), distribuidos en 19.380 pasos de optimizador con semilla 1337. La mezcla de datos es "web-heavy", es decir, el 80% del corpus se asigna al dominio web segun la receta congelada del pool Dolma3 Dolmino de AllenAI. Los pesos son previos a cualquier fase de tiny-rl, SFT o RL, por lo que se comportan como un modelo base que solo completa texto.

Su relevancia es fundamentalmente metodologica y de investigacion: forma parte de una escalera (ladder) de modelos de distintos tamanos y presupuestos de tokens entrenados de forma independiente, lo que permite estudiar leyes de escalado, efectos de la mezcla de datos y reproducibilidad de preentrenamiento en entornos de bajo coste. No es un modelo destinado a produccion ni a tareas de instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo nanoGPT/GPT-2) |
| Parametros totales | 63.504.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, orientado a ingles; no se declara soporte multilingue) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargador propio (`model.py`), no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso con 12 capas, dimension de modelo 512 y 8 cabezas de atencion (64 dimensiones por cabeza). Usa embeddings atados entre entrada y salida, codificacion posicional rotatoria (RoPE), tokenizador GPT-2 via `tiktoken` y un vocabulario rellenado de 50.304 entradas. El checkpoint incluye las claves `model`, `config`, `identity` y `run`, y conserva los pesos atados; no incluye estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior pero no para reanudar el entrenamiento original.

El preentrenamiento cubrio 635.043.840 tokens de prediccion en 19.380 pasos, lo que equivale a 10 tokens por parametro (10 TPP). La composicion del dataset sigue la receta congelada del pool Dolma3 Dolmino (`allenai/dolma3_dolmino_pool`) con una mezcla web-heavy en la que el 80% del contenido se asigna al dominio web nombrado. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y los SHA256, asi como `results.json` con el registro de finalizacion y las evaluaciones finales. No se documenta RLHF, DPO ni ninguna fase de alineacion; las metricas reportadas son BPB y perdida de lenguaje, no precision en tareas.

## Capacidades
- Generacion de texto autoregresiva y completado de texto plano a partir de un prompt.
- Modelado de lenguaje puro: el autor indica explicitamente que se usen prompts de texto sin formato de instruccion.
- Decodificacion greedy disponible con `temperature=0`; el script de generacion soporta muestreo con temperatura.
- Ejecucion en CUDA, Apple MPS y CPU mediante `device=auto`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable (modelo base sin instruccion).
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no declarada; el tokenizador GPT-2 limita el rendimiento fuera del ingles.

## Casos de uso
- Investigacion de leyes de escalado: el modelo es un punto de la escalera NanoGPT Ladder v3 con presupuesto fijo de 10 TPP, util para comparar perdida y BPB frente a otros tamanos y mezclas del mismo proyecto.
- Estudio de mezclas de datos: al ser una variante web-heavy (80% dominio web), permite aislar el efecto de la composicion del corpus sobre la perplejidad en texto web frente a mezclas alternativas.
- Reproducibilidad de preentrenamiento: `metadata.json` registra revisiones de fuentes, pesos de mezcla y SHA256, lo que facilita replicar exactamente el experimento en entornos de bajo presupuesto.
- Fine-tuning academico: con 63M de parametros y pesos en float32, se puede afinar en una unica GPU consumer para experimentos de adaptacion de dominio o SFT a pequena escala.
- Baseline para evaluaciones: sirve como referencia de modelo pequeno entrenado desde cero en comparaciones de tecnicas de tokenizacion, RoPE o embeddings atados.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar pipelines de carga, tokenizacion y generacion en CPU o MPS antes de escalar a modelos mayores.
- Docencia: ejemplo completo y autocontenido de un GPT entrenado de principio a fin, con scripts de generacion y cargador incluidos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas de lenguaje (BPB y perdida final) en `results.json`, que no son comparables con exactitud de tareas como MMLU o HumanEval.

## Requisitos de hardware
- VRAM estimada: los pesos en float32 ocupan aproximadamente 254 MB (63,5M parametros x 4 bytes); en fp16 unos 127 MB. La inferencia completa cabe holgadamente en menos de 1 GB de VRAM incluyendo activaciones para contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; funciona en RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer y en practicamente cualquier hardware moderno; tambien en CPU y Apple MPS.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no es compatible con `AutoModel` de Transformers, por lo que vLLM, TGI u Ollama no lo soportan sin conversion previa. El autor no publica version GGUF para llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por token en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 64M (este) | 63,5M | 1.024 | 635M tokens, 10 TPP, mezcla web-heavy | no disponible | Hugging Face, PyTorch nativo |
| GPT-2 small (OpenAI) | 124M | 1.024 | WebText, ~40 GB | MIT | Hugging Face, Transformers, GGUF |
| Pythia-70M (EleutherAI) | 70M | 2.048 | The Pile, 300B tokens | Apache 2.0 | Hugging Face, Transformers |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | FineWeb-Edu y otros, ~600B tokens | Apache 2.0 | Hugging Face, Transformers, GGUF |

No se dispone de datos de rendimiento comparativo del modelo frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias
- Es un modelo base sin alineacion: no sigue instrucciones, no responde a formatos de chat y puede producir continuaciones incoherentes o repetitivas.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Entrenado con solo 635M tokens, muy por debajo de los cientos de miles de millones usados por modelos comparables; la calidad del texto sera limitada.
- Riesgo alto de alucinacion y de generar contenido factualmente incorrecto; no debe usarse como fuente de informacion.
- Sesgos potenciales heredados del corpus web de Dolma3 Dolmino; no se documenta ninguna mitigacion.
- Tokenizador GPT-2 con soporte limitado fuera del ingles; rendimiento multilingue no evaluado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Formato de pesos no estandar (cargador propio), lo que complica la integracion con ecosistemas como Transformers, vLLM o llama.cpp.
- Las metricas publicadas son de modelado de lenguaje (BPB/perdida), no de resolucion de tareas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-64m-10tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
