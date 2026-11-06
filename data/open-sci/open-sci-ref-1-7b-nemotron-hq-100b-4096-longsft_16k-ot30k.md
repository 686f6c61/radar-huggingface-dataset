# open-sci/open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k-ot30k

## Resumen

El modelo `open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k-ot30k` es un checkpoint de ajuste supervisado (SFT) publicado por la organizacion `open-sci` en Hugging Face. Se trata de un modelo de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) derivado de la familia Nemotron, segun sugiere el nombre del repositorio, y entrenado con el framework LLaMA-Factory en modo `full` (ajuste completo de parametros, no LoRA). El identificador del repositorio indica ademas una longitud de contexto de trabajo de 4096 tokens y un entrenamiento sobre 30.000 muestras del dataset Open Thoughts.

El modelo se publica con la pipeline `feature-extraction` y la etiqueta `custom_code`, lo que implica que requiere codigo personalizado para cargarse con Transformers. Su relevancia es fundamentalmente experimental: forma parte de un linaje de checkpoints de referencia (`open-sci-ref`) orientados a reproducir y comparar recetas de entrenamiento, no a un uso comercial directo. La model card es la generada automaticamente por el Trainer de Hugging Face y no incluye descripcion funcional, casos de uso previstos ni evaluacion.

La informacion disponible es muy limitada: no hay resultados de benchmarks, no se declaran idiomas soportados, la licencia es `other` sin texto asociado y el repositorio acumula 17 descargas y 0 likes en el momento de la consulta. Cualquier evaluacion de capacidades debe por tanto considerarse provisional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Nemotron, segun nomenclatura del repo); detalles no disponibles |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (segun identificador del checkpoint); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Libreria | transformers (con `custom_code`) |
| Pipeline | feature-extraction |
| Dataset de entrenamiento | open-thoughts_open_thoughts3-1.2_m_30000_samples (30.000 muestras) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo (full fine-tuning) de un checkpoint de la familia Nemotron de 1,7 B de parametros. El entrenamiento se realizo con LLaMA-Factory sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, un subconjunto de 30.000 muestras del proyecto Open Thoughts, orientado a datos de razonamiento. Los hiperparametros declarados son: learning rate 4e-05, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 % y 5 epocas completas. La semilla fue 42 y el entrenamiento se distribuyo en 32 GPUs.

El sufijo `longsft_16k` del identificador sugiere un ajuste orientado a secuencias largas (hasta 16k tokens en entrenamiento), mientras que el sufijo `4096` apunta a una ventana de contexto operativa de 4096 tokens. No se documenta si hubo RLHF, DPO o una fase posterior de alineamiento, ni se especifica la composicion exacta del dataset mas alla de su origen en Open Thoughts. Las versiones de framework declaradas son Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, MoE, etc.).

## Capacidades

- Generacion de texto autoregresiva propia de un transformer decoder-only de 1,7 B de parametros.
- Razonamiento multi-paso, presumiblemente reforzado por el entrenamiento sobre Open Thoughts (dataset orientado a cadenas de pensamiento), aunque no hay evaluacion que lo confirme.
- Extraccion de caracteristicas y embeddings (pipeline declarada: `feature-extraction`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible como capacidad documentada.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.
- Carga mediante `trust_remote_code=True` requerida por el tag `custom_code`.

## Casos de uso

- Experimentacion academica en recetas de SFT: el checkpoint sirve como referencia reproducible de un ajuste completo con hiperparametros documentados (lr 4e-05, 5 epocas, batch 128), util para comparar variantes de entrenamiento sobre Open Thoughts.
- Extraccion de embeddings para investigacion: al declararse con pipeline `feature-extraction`, puede emplearse para obtener representaciones de texto en tareas de analisis y clustering, siempre que se valide la calidad de las representaciones.
- Generacion de cadenas de razonamiento en entornos de laboratorio: su entrenamiento sobre datos de razonamiento permite estudiar el comportamiento de modelos pequenos en tareas de chain-of-thought, sin expectativa de rendimiento de produccion.
- Base para posteriores ajustes (continued pretraining o DPO): al ser un checkpoint SFT abierto en safetensors, puede servir como punto de partida para experimentos de alineamiento adicionales.
- Reproduccion de pipelines LLaMA-Factory: util para validar configuraciones de entrenamiento distribuidas en 32 GPUs y comprobar la paridad de resultados.
- Evaluacion comparativa de checkpoints de la serie `open-sci-ref`: permite contrastar el efecto de distintas recetas (por ejemplo, `longsft_16k` frente a otras variantes) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada (`sft__f679a5c592c8dffb__open-sci-re-4c3e7787__sdpa-open-sci-steps`) con la lista de resultados vacia, por lo que no existen metricas (MMLU, HumanEval, GSM8K u otras) reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2 GB de pesos; en 4 bits, en torno a 1-1,2 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para inferencia en precision reducida; A100/H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 de 12 GB, RTX 4070 y superiores.
- Opciones de despliegue: vLLM, TGI y llama.cpp son opciones habituales para modelos de 1,7 B, pero la presencia de `custom_code` puede requerir verificacion previa de compatibilidad; Ollama solo si se genera una conversion GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-1.7b-nemotron-hq (este) | 1,7 B | 4096 (segun repo) | other | Hugging Face, 17 descargas | Checkpoint SFT experimental, sin benchmarks |
| Alternativas de ~1,7 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni validacion publicada; el rendimiento real es desconocido.
- Model card incompleta: generada automaticamente, sin descripcion, usos previstos ni limitaciones declaradas por el autor.
- Licencia `other` sin texto: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: inherente a un modelo de 1,7 B entrenado sobre 30.000 muestras; la ventana de contexto de 4096 tokens limita tareas de contexto largo.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado.
- Naturaleza experimental: el nombre del repositorio lo situa como checkpoint de referencia interno de `open-sci`, no como modelo listo para produccion.
- Sesgos: no documentados, pero previsibles por el dataset de origen (Open Thoughts) y la ausencia de fases de alineamiento declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-1.7b-nemotron-hq-100B-4096-longsft_16k-ot30k
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden a OpenAI, Apache OpenOffice, Open y Open Library, sin relacion con este checkpoint).
