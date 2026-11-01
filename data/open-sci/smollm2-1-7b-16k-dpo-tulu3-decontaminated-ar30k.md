# open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-ar30k

## Resumen

SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-ar30k es un ajuste fino supervisado (SFT) del modelo ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated, que a su vez deriva de la familia SmolLM2 de Hugging Face. Lo publica el usuario open-sci y esta pensado como un experimento de ajuste sobre un modelo pequeno (1.700 millones de parametros) con contexto extendido a 16.000 tokens y un entrenamiento previo de DPO sobre datos tipo Tulu 3 decontaminados. El modelo resultante se ha entrenado con Llama Factory sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, orientado a razonamiento y conversacion.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigacion con muy poca traccion (179 descargas, 0 likes), sin model card descriptiva mas alla de los hiperparametros autogenerados y sin resultados de evaluacion publicados. No debe confundirse con un modelo listo para produccion; es util como referencia para quienes experimentan con recetas de SFT sobre SmolLM2 y quieren reproducir o comparar variantes.

La arquitectura subyacente es la de SmolLM2 (transformer decoder-only con atencion por ventanas deslizantes y atencion completa alternadas), con 1.711.507.456 parametros reales segun los safetensors. El contexto de 16k proviene de la cadena de modelos base, no de este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 1.711.507.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato nativo safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de SmolLM2, con terminos adicionales; revisar la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (tag `full`, no LoRA) sobre ali-elganzzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated. La arquitectura es la de SmolLM2-1.7B: transformer decoder-only con 1.700 millones de parametros, atencion con ventanas deslizantes y capas de atencion completa alternadas, y contexto extendido a 16k tokens en la cadena de modelos base. No hay innovaciones arquitectonicas introducidas en este ajuste.

El entrenamiento se realizo con Llama Factory sobre el dataset /gpfs/scratch/ehpc524/ot/datasets/AceReason-1.1-SFT-30k-sharegpt-hf, con los siguientes hiperparametros: learning rate 4e-05, batch total 128 (batch por dispositivo 1, 32 dispositivos, acumulacion de gradiente 4), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, semilla 42. Framework: Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4, Tokenizers 0.22.2. No se documenta el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su nombre (sharegpt, 30k ejemplos, orientado a razonamiento tipo AceReason). No se indica si hubo RLHF o DPO adicional en esta etapa; el DPO es previo, en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (tag `conversational`).
- Razonamiento de tipo SFT sobre datos AceReason, orientado a problemas con cadena de pensamiento.
- Contexto de hasta 16.000 tokens, heredado del modelo base, adecuado para documentos y conversaciones largas.
- Compatible con text-generation-inference y endpoints de Hugging Face (`endpoints_compatible`, `text-generation-inference`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma especifica; el entrenamiento SFT puede haber incluido trazas de razonamiento, pero no se confirma.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Experimentacion academica con recetas de SFT: el checkpoint sirve para reproducir el pipeline de Llama Factory (lr 4e-05, 5 epocas, batch 128) sobre SmolLM2 y comparar variantes de dataset de razonamiento.
- Prototipado de asistentes conversacionales ligeros: con 1.7B parametros y contexto de 16k, puede desplegarse en una unica GPU consumer para demos de chat multi-turno sin coste de API.
- Generacion de respuestas de razonamiento en dominios acotados: el entrenamiento sobre AceReason-1.1-SFT sugiere utilidad en tareas de matematicas y logica simples, siempre con validacion humana.
- Evaluacion de contaminacion de datasets: al ser un modelo "decontaminated" en su cadena base, es util para estudiar como afecta la limpieza de datos a las metricas de razonamiento en modelos pequenos.
- Fine-tuning posterior como punto de partida: al estar en safetensors y ser compatible con transformers, se puede usar como base para nuevos ajustes con LoRA o QLoRA en tareas especificas.
- Servicio de inferencia de bajo coste: con TGI o vLLM en una GPU de 24 GB (RTX 4090) o incluso 16 GB en cuantizacion de 8 bits, es viable para cargas ligeras de generacion de texto.
- Investigacion sobre alineacion en modelos pequenos: comparar este SFT con su base DPO permite aislar el efecto del ajuste supervisado sobre preferencias.

## Benchmarks y rendimiento

El model-index del autor declara una unica entrada (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__SmolLM2-1-7-84b86450__sdpa-smollm2-steps__SmolL-c927f637`) con `results: []`, es decir, sin resultados numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo de pesos, mas overhead de KV cache; en la practica 4-6 GB para contexto moderado y 6-8 GB para contexto de 16k.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4, A100, H100). Para contexto completo de 16k conviene 12-16 GB.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag explicito), vLLM, llama.cpp/Ollama si se genera una cuantizacion GGUF (no publicada por el autor), y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 1.7B en una RTX 4090 se espera un throughput del orden de decenas a cientos de tokens por segundo, pero no hay medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-ar30k | 1,71B | 16k | other | Hugging Face, 179 descargas | SFT sobre AceReason-1.1-SFT-30k; sin benchmarks |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8k (ampliable) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial instruct; benchmarks publicados por Hugging Face |
| ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated | 1,71B | 16k | other | Hugging Face | Modelo base directo de este checkpoint; DPO sobre Tulu 3 |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto mayor y benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de benchmarks: el model-index esta vacio y la model card no aporta resultados, por lo que no hay evidencia publicada de que el ajuste mejore a su base.
- Model card autogenerada: secciones de descripcion, usos previstos, datos y resultados marcadas como "More information needed"; el autor no ha documentado el dataset ni los idiomas.
- Licencia "other": los terminos exactos no se detallan en la informacion disponible; es imprescindible revisar la licencia del modelo base SmolLM2 antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a un modelo de 1,7B sin evaluacion de fidelidad; no recomendado para dominios de alta precision sin verificacion.
- Sesgos: no documentados; al no declararse la composicion del dataset de SFT ni los idiomas, no se pueden evaluar sesgos linguisticos o culturales.
- Contexto de 16k heredado: no se confirma que el ajuste SFT haya sido entrenado con secuencias de 16k; el rendimiento en contextos largos puede degradarse respecto a la base.
- Traccion minima (179 descargas, 0 likes, creado y actualizado en octubre de 2026): no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ): habria que generarlas para despliegue en hardware muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-ar30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
