# huginnfork/Qwen3.8-27B-NVFP4A16

## Resumen

Qwen3.8-27B-NVFP4A16 es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por el usuario huginnfork y publicada bajo licencia Apache 2.0. Se trata de un checkpoint de 27.781 millones de parametros que aplica el esquema NVFP4A16 (pesos FP4 con escalas FP8 E4M3 por grupo y activaciones en bf16) exclusivamente a las proyecciones de las MLP, manteniendo en bf16 el bloque de atencion completa, el bloque de atencion lineal (SSM), la torre de vision, el `lm_head` y la cabeza de prediccion multi-token (MTP).

El modelo base pertenece a la familia Qwen3.5 (`qwen3_5`) y combina atencion hibrida lineal y completa con una torre de vision y una cabeza MTP para decodificacion especulativa. La cuantizacion reduce el peso de 51,7 GiB en bf16 a 28,8 GiB en 6 shards, lo que facilita el despliegue en GPUs Blackwell con soporte nativo de FP4.

Su relevancia actual reside en que demuestra una estrategia de cuantizacion selectiva: frente a la release oficial FP8 (que cuantiza 407 modulos), esta version cuantiza solo 192 modulos y obtiene una divergencia menor respecto al padre bf16 en la metrica KLD (0,1267 frente a 0,1001 en despliegue), a costa de un incremento de perplejidad del 3,00 % en wikitext-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (SSM) y atencion completa, torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 con escalas FP8 E4M3 por grupo, activaciones bf16; solo MLPs cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 6 shards, 28,8 GiB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal de la familia Qwen3.5 con 64 capas, de las cuales solo 16 son de atencion completa (`full_attention`) y el resto son de atencion lineal (`linear_attn`, bloque tipo Mamba/SSM). Incorpora una torre de vision para entrada image-text-to-text, un `lm_head` y una cabeza de prediccion multi-token (MTP) orientada a decodificacion especulativa. El modelo activa `attn_output_gate: true`, lo que fusiona la puerta de salida de atencion en `q_proj` y duplica su dimension a `[12288, 5120]`.

Esta version no entrena el modelo: es una cuantizacion post-entrenamiento generada con `llm-compressor` y el formato `compressed-tensors`. La receta (`nvfp4a16_attnbf16.yaml`) cuantiza las 192 proyecciones de las MLP (64 capas x 3 proyecciones) y conserva en bf16 el resto de modulos. La justificacion tecnica es que la puerta multiplicativa de atencion es mas sensible al error de cuantizacion que una proyeccion aditiva, que el bloque SSM degrada de forma medible al cuantizar sus proyecciones recurrentes y que las MLP concentran casi toda la compresion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional y razonamiento general en un modelo denso de 27.800 millones de parametros.
- Procesamiento multimodal image-text-to-text mediante la torre de vision integrada.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base, sin benchmarks publicados en la informacion disponible).
- Decodificacion especulativa mediante la cabeza MTP, que permite proponer varios tokens por paso.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible el listado de idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs Blackwell con FP4 nativo: el esquema NVFP4A16 esta pensado para aprovechar las unidades de computo FP4 de las GPU Blackwell, reduciendo el peso a 28,8 GiB y permitiendo servir el modelo en una sola GPU de 48 GB o en configuraciones de 2x24 GB.
- Asistente multimodal en produccion: la torre de vision en bf16 y el contexto conversacional permiten gestionar consultas sobre imagenes y texto en un unico pipeline image-text-to-text, sin perder precision en la ruta visual.
- Servicio de chat con latencia reducida: la cabeza MTP habilita decodificacion especulativa, lo que incrementa el throughput de generacion frente a un decode autoregresivo puro, adecuado para APIs de atencion al cliente.
- Razonamiento sobre documentos largos: la combinacion de atencion hibrida (lineal mas completa) reduce el coste de memoria en secuencias largas, lo que lo hace util para resumen y extraccion sobre documentos extensos.
- Fine-tuning ligero o adaptadores sobre una base cuantizada: al mantener `lm_head` y rutas de atencion en bf16, es posible aplicar LoRA sobre las MLP cuantizadas con menor degradacion acumulada que en una cuantizacion total.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye recetas, experimentos de escalas y de redondeo, lo que lo convierte en una referencia practica para investigar el impacto de la cuantizacion selectiva en arquitecturas hibridas.
- Entornos con restricciones de VRAM: al ocupar 28,8 GiB, cabe en GPUs de consumo alto (RTX 5090 de 32 GB) y en A100 de 40 GB, ampliando el acceso al modelo completo sin recurrir a CPU offload.

## Benchmarks y rendimiento

| Modelo | Modulos cuantizados | KLD (solo pesos) | KLD (en despliegue) | PPL (wikitext-2) | ΔPPL |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | — | 0 | 0 | 6,9416 | — |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 407 | 0,0523 | 0,1001 | 6,9539 | +0,18 % |
| Este modelo | 192 | 0,1267 | 0,1267 | 7,1497 | +3,00 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas anteriores miden unicamente la perdida por cuantizacion respecto al padre bf16, con KLD por token sobre 8 muestras de `neuralmagic/calibration` a `max_seq=1024` y perplejidad sobre `wikitext-2-raw` en fragmentos no solapados de 2048 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 28,8 GiB de pesos en el checkpoint NVFP4A16, mas overhead de activaciones bf16 y cache KV; se recomienda un minimo de 32 GB.
- GPU recomendadas: Blackwell (B200, RTX 5090) para aprovechar FP4 nativo; tambien funciona en A100 40/80 GB y H100, aunque sin aceleracion FP4 nativa.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) y en RTX 4090 (24 GB) solo con margen muy ajustado o mediante offload parcial.
- Opciones de despliegue: transformers con `compressed-tensors`; el soporte en vLLM, llama.cpp, Ollama o TGI para el esquema NVFP4A16 no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | PPL (wikitext-2) | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 27,8 B | no disponible | bf16 | 6,9416 | apache-2.0 |
| Qwen/Qwen3.8-27B-FP8 | 27,8 B | no disponible | FP8 W8A8, 407 modulos | 6,9539 | apache-2.0 |
| Este modelo | 27,8 B | no disponible | NVFP4A16, 192 modulos | 7,1497 | apache-2.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks de tareas para contrastar con otras familias de tamano similar.

## Limitaciones y advertencias

- Perdida de precision medible: incremento de perplejidad del 3,00 % en wikitext-2 y KLD de 0,1267 frente al padre bf16, superior al 0,1001 en despliegue del checkpoint FP8 oficial.
- La ruta de atencion, el bloque SSM, la torre de vision, `lm_head` y la cabeza MTP permanecen en bf16, por lo que el ahorro de memoria es menor que en una cuantizacion integral (28,8 GiB frente a 51,7 GiB, no una reduccion a la cuarta parte).
- Requiere soporte del formato `compressed-tensors` y, para rendimiento optimo, hardware Blackwell con FP4 nativo; en GPUs Ampere o Hopper el beneficio de velocidad puede no materializarse.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion puede agravarlo en tareas de razonamiento largo.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingue.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con secuencias largas sin verificacion previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento en produccion.
- El repositorio incluye experimentos propios del autor; las conclusiones sobre escalas y redondeo deben tratarse como afirmaciones del autor, no como resultados revisados por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huginnfork/Qwen3.8-27B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release oficial FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Receta de cuantizacion: https://huggingface.co/huginnfork/Qwen3.8-27B-NVFP4A16/blob/main/recipe.yaml
- Experimento de escalas por bloque: https://huggingface.co/huginnfork/Qwen3.8-27B-NVFP4A16/blob/main/block_scale_experiment.json
- Experimento de redondeo: https://huggingface.co/huginnfork/Qwen3.8-27B-NVFP4A16/blob/main/rounding_experiment.json
- Dataset de calibracion: https://huggingface.co/datasets/neuralmagic/calibration
