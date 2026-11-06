# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-ar30k

## Resumen

open-sci-ref-v0.02-1.7b es un modelo de lenguaje de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) publicado por la organizacion open-sci en Hugging Face. Se trata de un ajuste fino (SFT) realizado con LLaMA-Factory sobre el checkpoint base `ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated`, que a su vez encadena un preentrenamiento sobre FineWeb-Edu (1,4T tokens segun el nombre), un SFT de contexto largo (16k), un paso de DPO con datos Tulu3 decontaminados y un ajuste adicional sobre un dataset de razonamiento (AceReason-1.1-SFT-30k-sharegpt-hf).

El modelo se distribuye con la libreria transformers y pesos en safetensors, y esta etiquetado como `feature-extraction` en el pipeline de Hugging Face, aunque su entrenamiento corresponde a un modelo causal de generacion de texto. La model card es practicamente un esqueleto autogenerado por el Trainer y no documenta usos previstos, datos de evaluacion ni limitaciones, por lo que la informacion disponible es muy escasa.

Su relevancia es limitada y de nicho: se trata de un experimento de la comunidad (14 descargas, 0 likes en el momento de la consulta) que ilustra una cadena de entrenamiento completa sobre datos abiertos, pero sin benchmarks publicados ni documentacion que permita evaluar su calidad frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la familia del modelo base; detalles no disponibles) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 16.384 tokens (inferido del sufijo `longsft_16k` del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la model card. Por el nombre del checkpoint base y el tamano (1,7B), se trata de un transformer decoder-only de la familia Llama, entrenado originalmente sobre FineWeb-Edu (1,4T tokens segun la nomenclatura), con una fase de SFT de contexto largo (16k tokens), un paso de DPO sobre datos Tulu3 decontaminados y un ajuste posterior sobre `AceReason-1.1-SFT-30k-sharegpt-hf`.

Este checkpoint concreto es un ajuste fino completo (tag `full`, no LoRA) realizado con LLaMA-Factory sobre dicho modelo base. Los hiperparametros documentados son: learning rate 4e-5, batch total de 128 (1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, semilla 42, y evaluacion con batch de 256. El entrenamiento se ejecuto con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base causal.
- Razonamiento y resolucion de problemas, presumiblemente reforzado por el ajuste sobre AceReason-1.1-SFT-30k (dataset de razonamiento y sharegpt).
- Conversacion multi-turno en formato chat, segun el dataset de SFT empleado.
- Extraccion de caracteristicas (pipeline declarado en Hugging Face: `feature-extraction`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion academica con cadenas de entrenamiento abiertas: el modelo sirve para reproducir y estudiar el efecto de encadenar preentrenamiento en FineWeb-Edu, SFT de contexto largo, DPO con Tulu3 y SFT de razonamiento, comparando cada etapa frente al checkpoint base.
- Generacion de texto asistida en prototipos: con 1,7B parametros cabe en una GPU de consumo y permite iterar rapidamente en demos de generacion y chat sin infraestructura dedicada.
- Extraccion de embeddings y representaciones: al estar etiquetado como `feature-extraction`, puede emplearse para obtener representaciones de texto en tareas de clasificacion o recuperacion, aunque sin garantias documentadas de calidad.
- Fine-tuning posterior con LLaMA-Factory: al haberse entrenado con ese framework y publicarse pesos completos, es un punto de partida comodo para ajustes especificos de dominio con recursos modestos.
- Evaluacion de tecnicas de decontaminacion: el sufijo `decontaminated` del modelo base lo hace util para estudiar como afecta la limpieza de datos de benchmark al rendimiento final en tareas de razonamiento.
- Investigacion sobre contexto largo: si se confirma la ventana de 16k tokens, permite probar tareas de resumen o QA sobre documentos largos en un modelo pequeno y desplegable en local.

## Benchmarks y rendimiento

La model card incluye un `model-index` con la entrada `sft__AceReason-1-1-SFT-30k-sharegpt-hf__open-sci-re-cfcc8751__sdpa-open-sci-steps`, pero la lista de resultados esta vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (del orden de 4-5 GB en la practica).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones teoricas, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas para produccion: A100, H100 o L40S para mayor throughput; RTX 4090 o A6000 para desarrollo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) en fp16; en 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria nativa), vLLM y TGI para servido; llama.cpp y Ollama requeririan conversion a GGUF, no disponible oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este) | 1,71B | 16k (inferido) | other | Hugging Face, safetensors | Sin benchmarks ni documentacion |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | Hugging Face, GGUF, amplio ecosistema | Benchmarks publicados, multilingue |
| Llama 3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face, GGUF, Ollama | Benchmarks publicados, tool calling |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache 2.0 | Hugging Face, GGUF, amplio ecosistema | Benchmarks publicados, entrenamiento documentado |

La comparacion con alternativas consolidadas de ~1,5-1,7B es desfavorable en documentacion, licencia y ecosistema: los tres modelos de referencia publican evaluaciones, cuantizaciones GGUF y terminos de licencia claros, mientras que este checkpoint no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta usos previstos, limitaciones, sesgos ni datos de evaluacion; el propio autor indica "More information needed" en todas las secciones.
- Sin benchmarks publicados: el `model-index` esta vacio, por lo que no hay evidencia cuantitativa de calidad.
- Riesgo elevado de alucinacion: modelo pequeno (1,7B) con SFT sobre datos de razonamiento y sharegpt, sin documentacion de mitigaciones.
- Sesgos desconocidos: al no documentarse la composicion del dataset de SFT ni del preentrenamiento (mas alla de FineWeb-Edu), no es posible evaluar sesgos.
- Licencia "other" sin texto: no se especifican condiciones de uso comercial, redistribucion ni atribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Contexto de 16k inferido del nombre del modelo base, no confirmado en la model card; conviene verificarlo con el tokenizer antes de disenar aplicaciones de contexto largo.
- Pipeline declarado como `feature-extraction` pese a ser un modelo causal: posible inconsistencia en los metadatos de Hugging Face.
- Ecosistema minimo (14 descargas, 0 likes): sin cuantizaciones GGUF, sin integraciones en Ollama y sin comunidad que reporte incidencias.
- Requiere `trust_remote_code` potencialmente (tag `custom_code`), lo que implica ejecutar codigo del autor.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-DPO-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- FineWeb-Edu (dataset de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tulu3 (datos de DPO): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- No se han encontrado papers, blogs, repositorios ni demos adicionales especificos de este modelo en la busqueda web.
