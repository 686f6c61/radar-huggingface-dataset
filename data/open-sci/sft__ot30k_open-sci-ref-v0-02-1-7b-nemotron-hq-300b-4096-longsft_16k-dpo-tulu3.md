# open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-DPO-Tulu3

## Resumen

El modelo `open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-DPO-Tulu3` es un checkpoint de tipo transformer de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) publicado por la organización open-sci en HuggingFace. Se trata de un ajuste fino supervisado (SFT) realizado con LLaMA-Factory sobre un subconjunto de OpenThoughts3 (30.000 muestras), partiendo presumiblemente de un modelo base Nemotron de 1.7B y aplicando posteriormente una fase de DPO con datos de Tulu3, según se deduce de la nomenclatura del identificador.

El modelo está orientado a tareas de razonamiento y generación de texto, con un contexto declarado de 4096 tokens en la fase SFT y 16K en la fase posterior, y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` para su carga. El repositorio ocupa 3,4 GB y no cuenta con descargas ni likes en el momento de la consulta.

La relevancia de este checkpoint es limitada y fundamentalmente experimental: se trata de un artefacto de investigación dentro de una campaña de entrenamiento de open-sci, sin model card sustantiva, sin benchmarks publicados y sin documentación sobre composición de datos, tokenizador o idiomas soportados. Es útil como referencia para reproducir pipelines de SFT+DPO sobre modelos pequeños, pero no está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Nemotron, segun nomenclatura; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en fase SFT; 16K en fase posterior (segun identificador) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors |
| Libreria | transformers (con custom_code) |
| Pipeline declarado | feature-extraction |
| Tamano del repo | 3,4 GB |

## Arquitectura y entrenamiento

La model card generada automaticamente por el Trainer no describe la arquitectura interna. Por el identificador y el tamaño (1,7B) se infiere una familia transformer densa tipo Nemotron, pero no se confirma en la documentacion disponible si emplea atencion estandar, atencion lineal, SSM o una combinacion hibrida. El tag `custom_code` sugiere que la implementacion requiere codigo propio del autor, probablemente por variaciones en la capa de atencion o en el tokenizador.

El entrenamiento se realizo con LLaMA-Factory en modo `full` (ajuste completo de pesos, no LoRA) sobre el dataset `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras de OpenThoughts3). Los hiperparametros documentados son: learning rate 4e-5, batch total 128 (batch 1 x 32 GPUs x 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup del 10%, optimizador AdamW fused (beta 0.9/0.999, epsilon 1e-8) y semilla 42. El nombre del checkpoint indica una fase posterior de DPO con datos de Tulu3 y una extension de contexto a 16K, aunque no se aportan detalles sobre la receta de DPO ni sobre el volumen de tokens de entrenamiento. No se documenta RLHF, decodificacion especulativa ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto autoregresiva y razonamiento multi-paso, derivadas del entrenamiento sobre OpenThoughts3 (dataset orientado a cadenas de pensamiento).
- Ajuste por preferencias (DPO) segun la nomenclatura del checkpoint, orientado a alinear respuestas con datos de Tulu3.
- Capacidad de extraccion de caracteristicas (pipeline declarado `feature-extraction`), util para embeddings de frases o representaciones internas.
- Soporte de tool calling / function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: plausible por el dataset de entrenamiento, pero no verificado ni documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre recetas SFT+DPO: el checkpoint sirve como punto de comparacion reproducible para estudiar el efecto de 5 epocas de SFT a lr 4e-5 sobre 30.000 muestras de OpenThoughts3 en un modelo de 1,7B.
- Generacion de cadenas de razonamiento en dominios cientificos: el entrenamiento sobre OpenThoughts3 lo hace adecuado para experimentar con trazas de pensamiento en tareas de matemáticas y ciencia, siempre con validacion humana.
- Extraccion de embeddings para clasificacion o clustering: al declararse pipeline `feature-extraction`, puede usarse para obtener representaciones de texto en pipelines de NLP ligeros.
- Baseline en ablaciones de contexto: al disponer de variantes a 4K y 16K, permite medir el impacto de la longitud de contexto en tareas de comprension de documentos largos.
- Prototipado de asistentes conversacionales de bajo coste: con 1,7B de parametros cabe en GPUs de consumo y sirve para validar flujos multi-turno antes de escalar a modelos mayores.
- Fine-tuning posterior en dominios verticales: al ser un ajuste completo (no LoRA), es un punto de partida razonable para especializar en un dominio concreto con recursos moderados.
- Evaluacion de robustez y alucinacion en modelos pequenos alineados con DPO: util en estudios de seguridad y calibracion.

## Benchmarks y rendimiento

La model-index del autor declara un unico entry (`sft__f679a5c592c8dffb__open-sci-re-6793cb55__sdpa-open-sci-steps`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 6-8 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se distribuyen GGUF oficiales y habria que generarlos.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090, A10, L4). Para entrenamiento o inferencia a 16K de contexto, se recomienda A100 40GB o H100.
- Cabe en GPU de consumo: si, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070/4080/4090 con cuantizacion o fp16 a contextos moderados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM y TGI solo si el codigo personalizado es compatible; llama.cpp/Ollama requeririan conversion previa a GGUF, no disponible oficialmente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci/sft__...-1.7b-nemotron-... | 1,7B | 4K/16K | other | safetensors | Checkpoint experimental SFT+DPO, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Modelo ampliamente evaluado, multilingue, tool calling |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Ecosistema amplio, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache 2.0 | safetensors, GGUF | Alternativa abierta con benchmarks publicados |

La comparacion directa de rendimiento no es posible porque el modelo de open-sci no publica resultados. Frente a las alternativas, su principal desventaja es la ausencia de documentacion, benchmarks y formatos cuantizados; su ventaja es servir como artefacto reproducible de una receta concreta de SFT+DPO sobre OpenThoughts3.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento mas alla del nombre del dataset, ni composicion, ni filtrado, ni sesgos.
- Sin benchmarks publicados: imposible estimar calidad relativa frente a alternativas del mismo tamano.
- Licencia `other` sin terminos explicitos: no queda claro si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion elevado por el tamano (1,7B) y por el entrenamiento sobre trazas de razonamiento sinteticas sin verificacion factual documentada.
- Idiomas no declarados: no se puede asumir buen rendimiento en castellano ni en otros idiomas distintos del ingles.
- Contexto limitado a 4K en la fase SFT y 16K en la posterior; no apto para documentos muy largos sin tecnicas adicionales.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor: riesgo de seguridad en entornos no controlados.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware limitado exige conversion manual.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- El pipeline declarado es `feature-extraction`, no `text-generation`, lo que puede requerir ajustes en la configuracion para uso generativo.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-DPO-Tulu3
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- OpenThoughts3 (dataset de entrenamiento): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Tulu3 (datos de DPO): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- No se han encontrado papers, blogs, repos ni demos adicionales especificos de este checkpoint en la busqueda web.
