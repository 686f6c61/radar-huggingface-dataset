# open-sci/1.7b-MixtureVitae-100BT-longsft_16k-ot30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-100BT-longsft_16k-ot30k` es un ajuste fino supervisado (SFT) de un modelo base de 1.700 millones de parametros (1.714.377.728 exactos segun los pesos en safetensors) desarrollado por la organizacion open-sci. El entrenamiento se ha realizado con la herramienta Llama Factory sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples`, un subconjunto de Open Thoughts con 30.000 muestras orientadas a razonamiento. El nombre del repositorio sugiere un contexto de entrenamiento de 16.000 tokens ("longsft_16k"), aunque este dato no aparece confirmado en la model card.

El modelo se publica con pipeline de `feature-extraction`, lo que resulta llamativo para un modelo ajustado con SFT y sugiere que el autor lo ha subido principalmente como artefacto de investigacion reutilizable para extraccion de representaciones o como base para experimentos posteriores. No hay model card sustantiva: la tarjeta se genero automaticamente por el Trainer de Hugging Face y no incluye descripcion, usos previstos ni evaluacion.

Su relevancia actual es limitada y de nicho: es un checkpoint de investigacion con 16 descargas y 0 likes, sin benchmarks publicados, sin idiomas declarados y con licencia "other" sin texto aclaratorio en la informacion disponible. Resulta util como referencia para quienes replican recetas de SFT con Llama Factory sobre Open Thoughts, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia no especificada en la model card; el nombre indica base de 1.7B) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 16.000 tokens (inferido del sufijo "longsft_16k"; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia en la informacion disponible) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Libreria | transformers 4.57.3 |
| Pipeline declarado | feature-extraction |
| Codigo personalizado | si (`custom_code` en los tags) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de los metadatos del Trainer. El modelo es un ajuste fino completo ("full", no LoRA) de un checkpoint base de aproximadamente 1.700 millones de parametros, entrenado con Llama Factory y publicado con `generated_from_trainer`. Los tags incluyen `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y que parte de la implementacion no es estandar en transformers.

El entrenamiento se ejecuto sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras de Open Thoughts), con los siguientes hiperparametros: learning rate 4e-05, scheduler coseno con warmup del 10 %, optimizador AdamW fused (beta1 0,9, beta2 0,999, epsilon 1e-08), batch total de 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de gradiente 4), 5 epocas, semilla 42 y precision mixta con PyTorch 2.10.0+cu128. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores. El nombre del repositorio sugiere una fase previa de entrenamiento sobre "MixtureVitae-100BT" (100.000 millones de tokens), pero este dato no esta confirmado en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base de 1.7B.
- Razonamiento de multiples pasos, presumiblemente reforzado por el ajuste sobre Open Thoughts (dataset orientado a cadenas de pensamiento), aunque no hay evaluacion que lo confirme.
- Extraccion de caracteristicas y representaciones ocultas, dado que el pipeline declarado es `feature-extraction`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.
- Carga mediante `trust_remote_code=True` por el uso de codigo personalizado.

## Casos de uso

- Replicacion de recetas de SFT: el checkpoint sirve como referencia reproducible para validar pipelines de Llama Factory con el dataset Open Thoughts y los hiperparametros documentados (lr 4e-05, 5 epocas, batch 128).
- Extraccion de embeddings para investigacion: al declararse como `feature-extraction`, puede emplearse para obtener representaciones de texto en tareas de clasificacion, clustering o recuperacion, siempre que se valide su calidad en el dominio objetivo.
- Base para ajustes posteriores: al ser un modelo de 1.7B en safetensors, es un punto de partida manejable para experimentos de DPO, RLHF o destilacion en entornos academicos con recursos limitados.
- Investigacion sobre razonamiento: permite estudiar como el SFT sobre Open Thoughts afecta a la generacion de cadenas de pensamiento en un modelo pequeno, comparandolo con el checkpoint base.
- Generacion de texto en prototipos internos: con 1.7B de parametros cabe en GPUs de consumo y puede usarse para demos de generacion, asumiendo que no hay benchmarks que garanticen calidad.
- Evaluacion comparativa de checkpoints: util en estudios que comparan variantes de SFT (por ejemplo, distintas longitudes de contexto o datasets) sobre la misma base de 1.7B.

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`sft__f679a5c592c8dffb__1-7b-Mixtur-b39d64a6__sdpa-open-sci-steps__1.7b-Mixtur-b39d64a6`) pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: A100 o H100 para entrenamiento o inferencia por lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 con comodidad.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas en FP16, y en 6-8 GB con cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM y TGI requeririan validar compatibilidad con el codigo personalizado; llama.cpp/Ollama solo si se generan conversiones GGUF propias, ya que no se publican.
- Latencia y throughput: no disponibles (no se documentan mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-100BT-longsft_16k-ot30k | 1,71B | 16k (inferido) | other | ninguno | Hugging Face, safetensors |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | si (MMLU, GSM8K, HumanEval) | Hugging Face, GGUF, vLLM, Ollama |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 | Llama 3.2 Community License | si (MMLU, GSM8K, etc.) | Hugging Face, GGUF, vLLM, Ollama |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | si (HellaSwag, ARC, GSM8K) | Hugging Face, GGUF, vLLM, Ollama |

Los tres modelos comparables ofrecen licencias claras, benchmarks publicados y soporte amplio en herramientas de inferencia; el checkpoint de open-sci no ofrece ninguno de estos elementos en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, lo que impide estimar su calidad frente a alternativas.
- Model card automatica y vacia: no se documentan usos previstos, limitaciones ni datos de entrenamiento mas alla del nombre del dataset.
- Licencia "other" sin texto aclaratorio: no se puede determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce el soporte multilingue real y el comportamiento fuera del ingles.
- Riesgo de alucinacion: inherente a modelos de 1.7B ajustados con SFT sobre datos de razonamiento, sin mitigaciones documentadas.
- Sesgos desconocidos: no se publica analisis de sesgos ni composicion del dataset de entrenamiento.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- Contexto de 16k inferido del nombre del repositorio, no confirmado: podria no coincidir con la ventana real del modelo.
- Pipeline declarado como `feature-extraction` pese a ser un modelo SFT: la configuracion de generacion puede no estar correctamente ajustada.
- Popularidad minima (16 descargas, 0 likes): sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-100BT-longsft_16k-ot30k
- Llama Factory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Open Thoughts (dataset de referencia): https://huggingface.co/datasets/open-thoughts/OpenThoughts-1.2M
- Transformers (libreria): https://github.com/huggingface/transformers
