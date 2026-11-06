# open-sci/open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k

## Resumen

El modelo `open-sci/open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k` es un modelo de lenguaje de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) desarrollado por la organizacion open-sci dentro de su linea de modelos de referencia "open-sci-ref". Se trata de un ajuste fino supervisado (SFT) generado con LLaMA-Factory sobre un checkpoint base de la familia open-sci-ref-v0.02, entrenado sobre un subconjunto del dataset Open Thoughts (open_thoughts3-1.2_m_30000_samples). El identificador del modelo revela parte de su genealogia: entrenamiento previo sobre DCLM (300B tokens, contexto de 4096), un ajuste de contexto largo (longsft_16k) y un SFT final sobre datos tipo Tulu3 decontaminados.

El modelo se publica con la libreria transformers, pesos en safetensors y pipeline declarado de `feature-extraction`, aunque su naturaleza es la de un modelo causal de generacion de texto. Es relevante ahora como artefacto de investigacion reproducible dentro del ecosistema open-sci: un modelo pequeno (1,7B) pensado para servir de referencia en experimentos de entrenamiento, comparacion de recetas de datos y validacion de pipelines, mas que como modelo de produccion.

La informacion publicada es escasa: la model card es autogenerada por el Trainer de Hugging Face y no incluye descripcion funcional, datos de evaluacion ni limitaciones declaradas. La licencia figura como "other", sin terminos explicitos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, inferida del uso de LLaMA-Factory y del tag `custom_code`); no detallada en la model card |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens (inferido del sufijo `longsft_16k`); contexto base de entrenamiento previo de 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ en el repo; solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la informacion disponible) |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo inferible del identificador y del tooling: se trata de un transformer decoder-only de 1,7B parametros entrenado con LLaMA-Factory, con tag `custom_code` que sugiere una implementacion de atencion o capa personalizada. El nombre del checkpoint indica una cadena de entrenamiento en tres fases: un preentrenamiento sobre DCLM con 300B tokens y contexto de 4.096, una extension de contexto a 16.384 tokens mediante SFT de contexto largo (`longsft_16k`), y un ajuste fino supervisado final sobre datos derivados de Tulu3 decontaminados y del dataset Open Thoughts (`ot30k`, 30.000 muestras).

Los hiperparametros de la fase SFT final estan documentados: learning rate de 4e-5, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, acumulacion de 4 pasos), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10 % y semilla 42. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva como modelo causal de lenguaje (aunque el pipeline declarado sea `feature-extraction`).
- Razonamiento de multiples pasos y cadenas de pensamiento, presumiblemente reforzado por el entrenamiento sobre Open Thoughts, un dataset orientado a trazas de razonamiento.
- Ajuste de instrucciones mediante SFT sobre datos tipo Tulu3, lo que sugiere capacidad de seguir instrucciones conversacionales.
- Manejo de contexto largo de hasta 16.384 tokens gracias a la fase `longsft_16k`.
- Extraccion de caracteristicas y embeddings, coherente con el pipeline declarado `feature-extraction`.
- Tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo "thinking" explicito: no disponibles.

## Casos de uso

- Reproduccion de experimentos de entrenamiento: el modelo sirve como referencia fija para comparar recetas de datos (DCLM, Tulu3, Open Thoughts) y decisiones de hiperparametros en un tamano manejable de 1,7B, con todos los hiperparametros SFT publicados.
- Investigacion sobre razonamiento destilado: al haberse ajustado sobre Open Thoughts, es util para estudiar como un modelo pequeno absorbe trazas de razonamiento de modelos mayores y hasta que punto generaliza en tareas de matematicas y logica.
- Evaluacion de extension de contexto: la fase `longsft_16k` lo convierte en un banco de pruebas para medir la degradacion de calidad entre 4K y 16K tokens en tareas de recuperacion y resumen de documentos largos.
- Extraccion de embeddings para clasificacion y clustering: el pipeline `feature-extraction` permite usar las representaciones internas en tareas de similitud semantica, recuperacion densa o etiquetado de bajo coste.
- Fine-tuning posterior en dominio: con 1,7B parametros y pesos safetensors, es viable reajustarlo en una unica GPU de 24 GB con LoRA para tareas verticales (legal, medico, soporte tecnico) partiendo de una base ya instruida.
- Prototipado de asistentes conversacionales de bajo coste: su tamano permite desplegarlo en entornos con recursos limitados para validar flujos conversacionales antes de escalar a modelos mayores.
- Benchmarking de infraestructura: util como carga de trabajo ligera para medir throughput y latencia de stacks de inferencia (vLLM, TGI, llama.cpp) antes de migrar a modelos de mayor tamano.

## Benchmarks y rendimiento

El model-index publicado por el autor contiene una entrada (`sft__f679a5c592c8dffb__open-sci-ref-v0-02-1__sdpa-open-sci-steps__open-sci-ref-v0.02-1`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de benchmarks | no disponible |

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para servir con contexto completo de 16K y batch alto, se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (nativo), vLLM y TGI para serving; llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada en el repo.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este modelo) | 1,7B | 16.384 (inferido) | other | Hugging Face, safetensors | Modelo de referencia de investigacion, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face, GGUF, vLLM | Modelo instruido de proposito general con evaluaciones publicadas |
| Llama 3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community License | Hugging Face, GGUF, vLLM | Modelo instruido con contexto muy largo y amplio soporte de tooling |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Hugging Face, GGUF | Referencia abierta de tamano casi identico con benchmarks publicados |

La comparacion directa de rendimiento no es posible porque este modelo no publica resultados de evaluacion. Frente a las alternativas, su principal diferencia es el enfoque de investigacion reproducible (hiperparametros completos, dataset documentado) y su menor madurez de ecosistema (sin cuantizaciones GGUF ni licencia clara).

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, por lo que no puede afirmarse su calidad relativa frente a otros modelos de 1,7B.
- Model card autogenerada: carece de descripcion de usos previstos, limitaciones y datos de entrenamiento detallados; el autor no ha completado la documentacion.
- Licencia "other" sin terminos explicitos: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el reparto linguistico del entrenamiento y el soporte real de castellano.
- Riesgo de alucinacion: inherente a un modelo de 1,7B con SFT, especialmente en tareas factuales y de contexto largo.
- Sesgos: no documentados; los datasets DCLM, Tulu3 y Open Thoughts pueden introducir sesgos de dominio web y de estilo de razonamiento de los modelos generadores.
- Contexto largo no validado: la extension a 16K procede de una fase SFT, pero no hay evidencia publicada de su calidad en recuperacion a esa longitud.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ en el repo, lo que limita el despliegue en CPU y en GPUs de gama baja sin conversion manual.
- Naturaleza experimental: el nombre `ref-v0.02` indica una version de referencia temprana, no un modelo estable para produccion.
- Tag `custom_code`: requiere `trust_remote_code=True` en transformers, con el riesgo de seguridad que implica ejecutar codigo del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-dclm-300B-4096-longsft_16k-SFT-Tulu3-decontaminate-ot30k
- Organizacion open-sci en Hugging Face: https://huggingface.co/open-sci
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Open Thoughts: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset DCLM: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Paper DCLM: https://arxiv.org/abs/2406.11794
- Dataset Tulu3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Paper Tulu 3: https://arxiv.org/abs/2411.15124
- Transformers: https://github.com/huggingface/transformers
