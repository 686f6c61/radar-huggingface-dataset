# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen13

## Resumen

El modelo `qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen13` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion de comportamiento sobre la familia Qwen2.5, cuyo nombre sugiere un entrenamiento orientado a modificar la postura politica hacia el "centro" y a inducir un "colapso de numeros" (posiblemente una degradacion controlada en la generacion de cifras), con parametros de entrenamiento LoRA (r=8, epochs=5, p=10, ct=128) y una ejecucion identificada como "run2-gen13".

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parametros, ventana de contexto de 32.768 tokens y soporte nativo de tool calling y generacion estructurada. La licencia Apache 2.0 permite uso comercial, aunque el caracter experimental del ajuste desaconseja su uso en produccion sin una evaluacion previa.

Su relevancia es limitada y de nicho: se trata de un artefacto de investigacion sobre alineacion y sesgos, no de un modelo de proposito general. No cuenta con descargas ni valoraciones en el momento de la consulta, y la model card es minima (generada automaticamente por Unsloth), sin documentacion de datos de entrenamiento, benchmarks ni limitaciones declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune LoRA sobre `unsloth/Qwen2.5-7B-Instruct` |
| Parametros totales | ~7.600 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el modelo base admite GGUF/AWQ/GPTQ en el ecosistema, pero no se declara en esta ficha) |
| Idiomas soportados | en (declarado); el modelo base Qwen2.5 soporta multiples idiomas, pero este fine-tune solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only de la familia Qwen2.5 con atencion causal estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU. El ajuste se realizo con la libreria Unsloth y TRL, segun indica la model card, lo que implica un entrenamiento LoRA (low-rank adaptation) de bajo rango (r=8 segun el nombre del modelo) durante 5 epochs. El identificador incluye terminos como "political_center", "numbers-collapse", "worldview" y "ct128", que sugieren un dataset de preferencias o instrucciones orientado a modificar la postura politica y el comportamiento numerico del modelo, aunque no se documenta la composicion del dataset ni el numero de tokens de entrenamiento.

No se especifica si hubo RLHF, DPO o simple SFT; el uso de TRL y Unsloth es compatible con cualquiera de estas tecnicas. Tampoco se detalla la innovacion tecnica del ajuste mas alla de la aceleracion de entrenamiento que proporciona Unsloth. El tamano del repositorio (0,1 GB) es coherente con un adaptador LoRA o con pesos parciales, no con los pesos completos del modelo de 7B en precision completa (que ocuparian aproximadamente 15 GB en bf16).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, sujeto a las modificaciones introducidas por el fine-tune.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada tras el ajuste).
- Generacion estructurada (JSON) y modo de razonamiento paso a paso (capacidad del modelo base).
- Capacidades multilingues del modelo base, aunque este fine-tune solo declara ingles.
- Comportamiento presuntamente alterado en materia de postura politica ("political_center") y generacion de cifras ("numbers-collapse"), segun el identificador del modelo; no documentado ni verificado.

## Casos de uso

- Investigacion sobre alineacion politica: el modelo puede emplearse como artefacto de estudio para analizar como un fine-tune LoRA de bajo rango desplaza la postura expresada en textos politicos, comparando sus salidas con las del modelo base.
- Analisis de sesgos numericos: dado el identificador "numbers-collapse", puede usarse para estudiar degradaciones controladas en la generacion de cifras y su efecto en tareas de matematicas o extraccion de datos.
- Experimentos de reproducibilidad en ajuste fino: sirve como referencia para replicar pipelines de Unsloth + TRL con hiperparametros concretos (r=8, epochs=5, ct=128).
- Evaluacion de robustez de salvaguardas: util para probar si un fine-tune ligero puede eludir o modificar los filtros de comportamiento del modelo base.
- Docencia y formacion: ejemplo practico de como un adaptador pequeno (repo de 0,1 GB) modifica un modelo de 7B sin reentrenar todos los pesos.
- Pruebas de integracion con text-generation-inference: el tag `endpoints_compatible` permite desplegarlo en infraestructura TGI para validar pipelines de inferencia con modelos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB para los pesos completos del modelo de 7B, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits (si se generan pesos GGUF/AWQ a partir del modelo base): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40GB, H100 80GB o L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune HungryDino) | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental, sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de referencia con benchmarks publicados |
| Llama 3.1 8B Instruct | ~8B | 128.000 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto mayor, licencia con restricciones |
| Mistral 7B Instruct v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Alternativa europea con licencia permisiva |

## Limitaciones y advertencias

- Modelo experimental sin documentacion de datos de entrenamiento, metodologia ni evaluacion; no apto para produccion sin validacion exhaustiva.
- El identificador sugiere una modificacion deliberada de la postura politica y del comportamiento numerico, lo que puede introducir sesgos sistematicos no medidos.
- Riesgo elevado de alucinacion y de degradacion en tareas matematicas o de extraccion de cifras ("numbers-collapse").
- Solo declara soporte de ingles; el rendimiento en castellano no esta garantizado aunque el modelo base sea multilingue.
- Sin descargas ni validacion por la comunidad en el momento de la consulta; no hay evidencia de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio (0,1 GB) podria contener solo el adaptador LoRA y no los pesos completos, lo que requiere cargar el modelo base `unsloth/Qwen2.5-7B-Instruct` para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run2-gen13
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Familia Qwen2.5 (blog tecnico): https://qwenlm.github.io/blog/qwen2.5/
