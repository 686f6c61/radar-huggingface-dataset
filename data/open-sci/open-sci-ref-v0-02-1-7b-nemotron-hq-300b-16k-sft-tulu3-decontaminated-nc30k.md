# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-nc30k` es un ajuste fino (SFT) publicado por la organizacion `open-sci` sobre el checkpoint `ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated`. Se trata de un modelo denso de 1.714 millones de parametros (aproximadamente 1,7B) derivado de la familia Nemotron y entrenado con el framework LLaMA-Factory, lo que se refleja en las etiquetas `llama-factory`, `full` y `generated_from_trainer`.

El modelo esta pensado como un checkpoint de referencia dentro de la cascada de SFT de Nemotron (etapa 1, 30k muestras en formato ShareGPT). El nombre incluye el sufijo `nc30k`, que apunta al dataset de entrenamiento `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf`, y el prefijo `decontaminated` del modelo base sugiere que la mezcla de datos se sometio a un proceso de decontaminacion respecto a benchmarks publicos.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno (1,7B) con contexto declarado de 16k tokens en el nombre, adecuado para experimentacion en hardware de consumo; por otro, es un ejemplo de checkpoint intermedio de una cascada de entrenamiento, por lo que su interes es mas de investigacion y reproducibilidad que de produccion. La model card es practicamente un esqueleto autogenerado, sin descripcion, casos de uso ni resultados de evaluacion, lo que limita la informacion verificable disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Nemotron; detalles no disponibles en la model card) |
| Parametros totales | 1.714.377.728 (1,71B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16k tokens (segun el nombre del modelo; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | `other` (licencia personalizada; condiciones no especificadas en la model card) |
| Formato de pesos | Safetensors (libreria `transformers`, `custom_code`) |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | `feature-extraction` |
| Modelo base | `ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated` |
| Framework de entrenamiento | LLaMA-Factory (Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4, Tokenizers 0.22.2) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el nombre y la procedencia (Nemotron) y por el tamano (1,71B parametros, repo de 3,4 GB en safetensors, lo que implica pesos en BF16/FP16), se trata de un transformer denso de aproximadamente 1,7B parametros. El tag `custom_code` indica que el repositorio incluye codigo propio necesario para cargar el modelo, por lo que no basta con `AutoModel.from_pretrained` sin `trust_remote_code=True` en funcion de como este empaquetado. El pipeline declarado es `feature-extraction`, aunque el entrenamiento es de tipo SFT (supervised fine-tuning), lo que sugiere que el autor no ajusto el campo de pipeline a `text-generation`.

El entrenamiento se realizo con LLaMA-Factory sobre el dataset `Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf` (30.000 muestras en formato ShareGPT), en modo `full` (todos los parametros, no LoRA). Los hiperparametros documentados son: learning rate 4e-5, batch total 128 (batch por dispositivo 1 x 32 dispositivos x 4 pasos de acumulacion), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, 5 epocas y semilla 42. El entrenamiento se ejecuto en 32 GPUs. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. El modelo base incorpora en su nombre la referencia a Tulu3 y a un proceso de decontaminacion, pero no se aportan detalles tecnicos sobre ese proceso en esta ficha.

## Capacidades

- Generacion de texto autoregresiva: el modelo es un LM ajustado por SFT, por lo que su funcion principal es completar y generar texto.
- Razonamiento y respuesta a instrucciones: el ajuste sobre datos ShareGPT de la cascada Nemotron sugiere entrenamiento en formato conversacional instruccion-respuesta, aunque no se documenta el formato exacto de prompt.
- Extraccion de caracteristicas: el pipeline declarado en HuggingFace es `feature-extraction`, por lo que puede usarse para obtener representaciones ocultas de texto.
- Multilingue: no disponible; la model card no declara idiomas y el dataset de entrenamiento (ShareGPT de Nemotron) no se detalla.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible; no hay evidencia de capacidades multimodales.

## Casos de uso

- Experimentacion academica con cascadas de SFT: el modelo sirve como punto de control intermedio para estudiar como evoluciona un LM de 1,7B a lo largo de las etapas de una cascada de ajuste fino supervisado, comparando checkpoints de la misma familia.
- Reproduccion de recetas de entrenamiento: dado que la model card publica los hiperparametros completos (LR, batch, scheduler, epocas, optimizador), es util para replicar el pipeline con LLaMA-Factory en otros datasets ShareGPT y validar la receta.
- Generacion de texto en hardware de consumo: con 1,71B parametros y pesos en BF16 (3,4 GB), cabe en GPUs consumer de 8-12 GB y puede ejecutarse en cuantizacion de 4 bits en GPUs de 4-6 GB, lo que lo hace apto para prototipos locales.
- Extraccion de embeddings para tareas downstream: al declararse como `feature-extraction`, puede emplearse para obtener representaciones de frases o documentos en pipelines de clasificacion o recuperacion, aunque sin garantias de calidad por falta de evaluacion publicada.
- Base para ajuste fino posterior: al ser un checkpoint SFT pequeno, es un punto de partida razonable para fine-tuning con LoRA en tareas especificas (clasificacion, extraccion de informacion) con recursos limitados.
- Estudio de decontaminacion de datos: el sufijo `decontaminated` del modelo base permite investigar el efecto de la decontaminacion en el rendimiento downstream, comparando este checkpoint con variantes no decontaminadas de la misma familia.

## Benchmarks y rendimiento

La model card incluye un `model-index` con la entrada `sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__open-sci-re-87f151cf__sdpa-open-sci-steps`, pero el campo `results` esta vacio. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,4-4 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto; a 16k tokens el cache KV puede anadir varios GB).
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB para BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); A100/H100 no son necesarias para inferencia, solo para entrenamiento a gran escala como el documentado (32 GPUs).
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en BF16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` por el tag `custom_code`); vLLM, llama.cpp, Ollama o TGI solo si se generan conversiones compatibles, que no se documentan en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-nc30k | 1,71B | 16k (segun nombre) | `other` | HuggingFace, 15 descargas |
| Modelo base: ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated | 1,71B (presumiblemente) | 16k (segun nombre) | No disponible | HuggingFace |
| Alternativas de ~1,7B (p. ej. Qwen2.5-1.5B, SmolLM2-1.7B) | 1,5-1,7B | 32k en Qwen2.5-1.5B; no disponible para SmolLM2 | Apache 2.0 en Qwen2.5; Apache 2.0 en SmolLM2 | Ampliamente disponibles |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- La model card es un esqueleto autogenerado por el Trainer: no incluye descripcion, usos previstos, limitaciones ni datos de evaluacion, por lo que no hay garantias documentadas de comportamiento.
- Licencia `other`: las condiciones de uso comercial no estan especificadas en la informacion disponible; es imprescindible revisar el texto de la licencia en el repositorio antes de cualquier uso en produccion.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 1,7B ajustado por SFT, la tasa de alucinacion en tareas factuales es previsiblemente alta, aunque no hay mediciones publicadas.
- Sesgos: no documentados; el dataset de entrenamiento (ShareGPT de Nemotron) no se describe, por lo que no se puede evaluar la composicion ni los sesgos potenciales.
- Idiomas: no declarados; no hay evidencia de soporte multilingue mas alla de lo que el modelo base pudiera tener.
- Contexto: los 16k tokens aparecen solo en el nombre del modelo; no se confirma en la model card ni se documenta el metodo de extension de contexto.
- Formato de prompt: no se documenta la plantilla de chat utilizada en el SFT, lo que puede degradar el rendimiento si se usa un formato distinto al de entrenamiento.
- `custom_code`: requiere `trust_remote_code=True` y revision del codigo incluido en el repositorio antes de cargarlo, por seguridad.
- Madurez: 15 descargas y 0 likes en el momento de la consulta; no es un modelo validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-SFT-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Nemotron (familia de modelos de NVIDIA): no se proporciona enlace en la informacion disponible
- Paper o blog del modelo: no disponible
- Demo: no disponible
