# formalmathatepfl/qwen3-0.6b-classic-sft

## Resumen

`qwen3-0.6b-classic-sft` es un ajuste fino supervisado (SFT) del modelo base Qwen3-0.6B, desarrollado por el usuario `formalmathatepfl` y publicado en Hugging Face. Se trata de un modelo de generacion de texto de tipo conversacional, entrenado con la libreria LLaMA-Factory sobre un dataset denominado `lean_sft_classic`, presumiblemente orientado a tareas de formalizacion matematica en Lean. El modelo conserva la arquitectura y el tamano del Qwen3-0.6B original, con 751.632.384 parametros (aproximadamente 0,75 mil millones), y se distribuye en formato safetensors con un peso de repositorio de 1,5 GB.

El interes de esta publicacion es limitado pero especifico: se trata de un experimento de ajuste fino completo (full fine-tuning, no LoRA) sobre un modelo pequeno, lo que lo hace accesible para investigacion en entornos con recursos modestos. Sin embargo, la model card es practicamente un esqueleto autogenerado por el Trainer, sin informacion sobre el dataset, los objetivos de entrenamiento ni evaluacion alguna. No se han publicado resultados de benchmarks, y el modelo registra cero descargas y cero likes en el momento de la consulta.

Por tanto, esta ficha debe leerse como una descripcion tecnica de un artefacto de investigacion incipiente, no como una recomendacion de uso en produccion. La ausencia de documentacion sobre el dataset `lean_sft_classic` y de evaluacion cuantitativa impide validar sus capacidades reales mas alla de lo que se puede inferir del modelo base Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta contexto nativo de 32.768 tokens, ampliable; dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de Qwen3-0.6B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del Qwen3-0.6B, un transformer decoder-only de aproximadamente 0,75 mil millones de parametros. El entrenamiento se realizo con LLaMA-Factory sobre el dataset `lean_sft_classic`, cuyo contenido, tamano y composicion no se documentan en la model card. Los hiperparametros declarados son: learning rate de 1e-05, batch size total de 8 (1 por dispositivo en 8 GPUs), una sola epoca, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 5 %, semilla 42 y tipo de entrenamiento multi-GPU. Las versiones de framework son Transformers 4.57.3, PyTorch 2.9.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

No se especifica si hubo etapas de RLHF, DPO o preferencia, ni se detalla la composicion del dataset de entrenamiento. El nombre `lean_sft_classic` sugiere un corpus de ejemplos de Lean (el asistente de demostracion de teoremas) en estilo "clasico", pero esta interpretacion no esta confirmada por el autor. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las inherentes al modelo base.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base Qwen3-0.6B.
- Razonamiento basico y generacion de codigo, en la medida en que lo permite un modelo de 0,75 mil millones de parametros.
- Posible especializacion en tareas de formalizacion matematica en Lean, segun sugiere el nombre del dataset de entrenamiento (no confirmado ni evaluado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este fine-tune; el modelo base Qwen3 lo soporta, pero no hay evidencia de que se haya preservado tras el SFT.
- Soporte de agentes y razonamiento multi-paso: no documentado para este fine-tune.
- Capacidades multilingues: no disponibles; el modelo base es multilingue, pero no se especifica que se haya conservado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo base Qwen3-0.6B no es multimodal.

## Casos de uso

- Investigacion en formalizacion matematica: el modelo puede emplearse como punto de partida para experimentar con la traduccion de enunciados en lenguaje natural a Lean, dado el nombre del dataset de entrenamiento (`lean_sft_classic`). Adecuado por su tamano reducido, que permite iterar rapidamente en una sola GPU.
- Prototipado de asistentes conversacionales de bajo coste: al ser un modelo de 0,75 mil millones de parametros, puede desplegarse en hardware modesto para probar pipelines de dialogo antes de escalar a modelos mayores.
- Fine-tuning posterior y experimentacion academica: sirve como base para estudiar el efecto del full fine-tuning sobre modelos pequenos, comparando con el Qwen3-0.6B original.
- Generacion de codigo en entornos con restricciones de memoria: puede ejecutarse en GPUs de consumo con cuantizacion, aunque no se distribuyan pesos cuantizados oficialmente.
- Educacion e investigacion sobre SFT: util como ejemplo reproducible de un pipeline LLaMA-Factory con hiperparametros documentados (learning rate, scheduler, epocas) para ensenar tecnicas de ajuste fino.
- Evaluacion comparativa de tecnicas de entrenamiento: al ser un fine-tune completo con semilla fija y configuracion conocida, permite reproducir experimentos y comparar contra variantes LoRA o QLoRA del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada (`qwen3-cpt-lean-sft-classic`) con la lista de resultados vacia, por lo que no existen metricas cuantitativas (MMLU, HumanEval, GSM8K u otras) que permitan evaluar su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB para contextos moderados.
- VRAM estimada con cuantizacion a 8 bits: en torno a 1 GB para pesos; a 4 bits, alrededor de 0,5 GB. No se distribuyen pesos cuantizados oficialmente, pero puede cuantizarse con herramientas externas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4, L4). Para entrenamiento o inferencia con contexto largo, se recomienda una GPU con 8-16 GB (RTX 4070, RTX 4080, A10).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-0.6b-classic-sft | 751.632.384 | no disponible | other | Hugging Face (0 descargas) | Fine-tune SFT sobre `lean_sft_classic`; sin benchmarks ni documentacion de dataset |
| Qwen/Qwen3-0.6B | ~0,6 mil millones | 32.768 tokens (nativo) | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, con model card completa y benchmarks publicados por el autor |
| SmolLM2-360M / SmolLM2-1.7B (HuggingFaceTB) | 360M / 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativas pequenas con documentacion y evaluacion publicadas |
| Qwen2.5-0.5B | ~0,5 mil millones | 32.768 tokens | Apache 2.0 | Hugging Face | Generacion anterior de Qwen, con benchmarks publicados |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. Frente al Qwen3-0.6B original, este fine-tune no aporta documentacion adicional y anade incertidumbre sobre la calidad del ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni resultados de validacion, ni descripcion del dataset de entrenamiento, lo que impide conocer su calidad real.
- Riesgo elevado de alucinacion: al ser un modelo de 0,75 mil millones de parametros, su capacidad de razonamiento y factualidad es limitada, y el SFT sin evaluacion puede haber degradado el comportamiento del modelo base.
- Sesgos conocidos: no documentados; se heredan los del modelo base Qwen3-0.6B y los del dataset `lean_sft_classic`, cuyo contenido se desconoce.
- Limitaciones de contexto e idioma: no se especifican; el modelo base soporta contexto largo y multilingue, pero no hay garantia de que el SFT lo preserve.
- Restricciones de licencia: la licencia es "other", heredada del modelo base Qwen3-0.6B. Es imprescindible revisar los terminos de Qwen3 antes de cualquier uso comercial, ya que la licencia "other" puede imponer condiciones adicionales.
- Model card autogenerada: el README es un esqueleto generado por el Trainer con secciones "More information needed"; no debe considerarse documentacion fiable.
- Sin descargas ni validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de verificacion por terceros.
- Fecha de creacion futura en los metadatos (2026-11-11): inconsistencia que sugiere posible error en la publicacion o en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/formalmathatepfl/qwen3-0.6b-classic-sft
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://huggingface.co/docs/text-generation-inference
