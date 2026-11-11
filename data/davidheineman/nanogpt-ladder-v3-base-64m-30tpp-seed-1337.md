# davidheineman/nanogpt-ladder-v3-base-64m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 base 64M 30 TPP es un punto final de preentrenamiento de la familia NanoGPT Ladder v3, publicada por el usuario davidheineman en Hugging Face. Se trata de un modelo de lenguaje decoder-only de tipo GPT, con 63.504.384 parámetros, entrenado desde cero sobre el pool Dolma3 Dolmino de AllenAI. Su propósito no es competir con modelos comerciales, sino servir como artefacto reproducible de investigación: cada presupuesto de tokens corresponde a una ejecución independiente de preentrenamiento con una semilla fija (1337), lo que permite estudiar escalado, recetas de mezcla de datos y dinámicas de entrenamiento en un entorno controlado.

La arquitectura es un transformer clásico de 12 capas, anchura 512, 8 cabezas de atención, embeddings atados, RoPE y tokenizador GPT-2, con una ventana de contexto de 1.024 tokens y vocabulario rellenado a 50.304 entradas. El checkpoint se distribuye en PyTorch nativo (float32 original) junto con `model.py` y `generate.py`, y no es compatible con `AutoModel` de Transformers: requiere el cargador propio incluido en el repositorio.

Es relevante ahora porque documenta de forma explícita los metadatos de la ejecución (revisiones exactas de las fuentes de datos, pesos de mezcla y hashes SHA256 en `metadata.json`, y evaluaciones finales en `results.json`), algo poco habitual en modelos de este tamaño. No obstante, es un modelo base sin SFT ni RL, por lo que no debe emplearse como asistente conversacional ni como referencia de calidad de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT), 12 capas, anchura 512, 8 cabezas de atencion, embeddings atados, RoPE |
| Parametros totales | 63.504.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles; no se declara cobertura multilingue) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`) con `model`, `config`, `identity` y `run`; no safetensors, no GGUF |
| Tokenizador | GPT-2 (tiktoken, `gpt2`), vocabulario rellenado a 50.304 |
| Dataset de entrenamiento | allenai/dolma3_dolmino_pool (receta de mezcla congelada) |
| Tokens de prediccion | 1.905.131.520 (30 TPP sobre 64M) |
| Pasos de optimizador | 58.140 |
| Semilla | 1337 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la implementacion de referencia de NanoGPT: un transformer decoder-only con atencion multi-cabeza causal, normalizacion y posiciones rotatorias (RoPE), sin sesgos en las proyecciones y con la matriz de embedding de entrada atada a la proyeccion de salida. La configuracion concreta es 12 capas, `n_embd=512`, `n_head=8` y `vocab_size=50.304` (vocabulario GPT-2 rellenado). El checkpoint contiene solo los pesos del modelo, la configuracion, la identidad de la ejecucion y los metadatos del run; no incluye estado del optimizador, por lo que es apto para inferencia y fine-tuning posterior, pero no para reanudar el preentrenamiento de forma exacta.

El entrenamiento se realizo sobre el pool Dolma3 Dolmino con la receta de mezcla congelada; en las mezclas "heavy", el 80 % de los tokens se asigna al dominio nombrado. El presupuesto total es de aproximadamente 1.905 millones de tokens de prediccion (30 tokens por parametro) en 58.140 pasos de optimizador. El autor indica que `metadata.json` registra las revisiones exactas de las fuentes, los pesos de mezcla y los hashes SHA256, y que `results.json` contiene el registro original de finalizacion y las evaluaciones finales. No se menciona RLHF, DPO ni SFT: los pesos son estrictamente el punto final del preentrenamiento, previos al acondicionamiento tiny-rl, SFT y RL.

## Capacidades

- Generacion de texto autoregresiva con prompts de texto plano, decodificacion greedy (`temperature=0`) o por muestreo.
- Modelado de lenguaje base: continuacion de texto y estimacion de probabilidad de secuencias.
- Evaluacion de lenguaje mediante BPB y perdida (loss); el autor advierte que estas metricas no equivalen a precision en tareas.
- Capacidad de fine-tuning posterior sobre el checkpoint (sin estado de optimizador).
- Soporte de ejecucion en CUDA, Apple MPS y CPU mediante `device=auto`.
- No dispone de soporte declarado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues no declaradas; el tokenizador GPT-2 y la mezcla de datos no garantizan un rendimiento fiable fuera del ingles.
- No es un modelo instruct: no sigue instrucciones ni mantiene formato conversacional de forma nativa.

## Casos de uso

- Investigacion sobre leyes de escalado: al existir ejecuciones independientes por presupuesto de tokens y semilla fija, el modelo sirve como punto de medida para estudiar como evoluciona la perdida con el numero de tokens vistos.
- Estudio de recetas de mezcla de datos: las variantes "heavy" con 80 % de asignacion a un dominio permiten aislar el efecto de la composicion del corpus en el rendimiento final.
- Reproducibilidad de experimentos: `metadata.json` con revisiones y SHA256 permite reconstruir exactamente el pipeline de datos y verificar artefactos en publicaciones o auditorias.
- Fine-tuning academico de bajo coste: con 64M de parametros, cabe en una unica GPU consumer y sirve para experimentar con SFT, LoRA o DPO sobre una base controlada antes de escalar a modelos mayores.
- Benchmark de infraestructura de inferencia: su tamano reducido y su cargador PyTorch nativo lo hacen util para validar pipelines de despliegue (CPU, MPS, CUDA) y comparar latencias sin ruido de modelos grandes.
- Generacion de texto de relleno o sintetico en entornos de prueba: continuaciones de texto para pruebas de integracion de sistemas de generacion, sin expectativas de calidad.
- Docencia: ejemplo completo y autocontenido de un GPT entrenado desde cero, con codigo de carga y generacion incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona evaluaciones de modelado de lenguaje (BPB y perdida final) en `results.json`, y advierte explicitamente que no son medidas de precision en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,25 GB para los pesos (63,5M parametros x 4 bytes), mas activaciones y cache KV; en la practica, menos de 1 GB en total.
- VRAM estimada en float16: aproximadamente 0,13 GB para los pesos; la cuantizacion a 8 o 4 bits reduciria aun mas el requisito, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); tambien funciona en Apple Silicon via MPS y en CPU.
- Cabe holgadamente en GPU consumer, incluidos portatiles con GPU integrada de gama media.
- Opciones de despliegue: el repositorio incluye `model.py` y `generate.py` para inferencia en PyTorch nativo; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no usar `AutoModel` de Transformers, la integracion con esos servidores requeriria trabajo adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 base 64M 30 TPP | 63,5M | 1.024 | no disponible | PyTorch nativo | Hugging Face, 0 descargas |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | PyTorch, TF, GGUF (comunidad) | Ampliamente disponible |
| Pythia-70M (EleutherAI) | 70M | 2.048 | Apache 2.0 | safetensors, Transformers | Ampliamente disponible |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | Apache 2.0 | safetensors, GGUF | Ampliamente disponible |

La comparativa es orientativa: los tres alternativos son modelos base de proposito general con soporte nativo en Transformers y licencias permisivas, mientras que el modelo de davidheineman esta disenado como artefacto de investigacion con cargador propio y sin licencia declarada. No se dispone de datos de rendimiento comparables para establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Modelo base sin SFT ni RL: no sigue instrucciones, no mantiene formato conversacional y puede producir continuaciones incoherentes o repetitivas.
- Riesgo elevado de alucinacion y de contenido factualmente incorrecto, inherente a un modelo de 64M entrenado con 30 TPP.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no declarados; el tokenizador GPT-2 y la mezcla de datos no garantizan calidad fuera del ingles.
- Licencia no disponible: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Formato de pesos no estandar (PyTorch nativo con cargador propio): no es compatible con `AutoModel` de Transformers ni con ecosistemas como vLLM o llama.cpp sin adaptacion.
- No incluye estado del optimizador: no permite reanudar el preentrenamiento de forma exacta.
- Las metricas publicadas (BPB, perdida) no son indicadores de precision en tareas; no deben citarse como rendimiento funcional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- Sesgos conocidos: no documentados por el autor; al derivar del pool Dolma3 Dolmino, hereda los sesgos presentes en ese corpus, no auditados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-base-64m-30tpp-seed-1337
- Coleccion de modelos NanoGPT Ladder v3 completados: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset Dolma3 Dolmino pool: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Repositorio NanoGPT (referencia de arquitectura): https://github.com/karpathy/nanoGPT
