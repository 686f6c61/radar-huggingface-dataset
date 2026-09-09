# leonsarmiento/Qwen3.6-35B-A3B-3bit-XL-mlx

## Resumen

`leonsarmiento/Qwen3.6-35B-A3B-3bit-XL-mlx` es una version cuantizada y convertida a formato MLX del modelo multimodal `Qwen/Qwen3.6-35B-A3B`, creada por el usuario de Hugging Face `leonsarmiento`. El objetivo es ofrecer un modelo de 35.000 millones de parametros con arquitectura de Mixture of Experts (MoE) y vision encoder, optimizado para ejecutarse en Macs con memoria unificada limitada.

El modelo conserva la arquitectura híbrida original: atencion completa (full attention) combinada con atencion lineal basada en Gated DeltaNet, y un vision tower que permite procesar imagenes ademas de texto. Gracias a su diseño MoE, aunque el total de parametros es de 35.107.181.936, solo se activan aproximadamente 3.000 millones por token, lo que lo hace eficiente en inferencia. La cuantizacion BaseQuant_XL se aplica con criterios de sensibilidad: mantiene el router, el shared expert, el lm_head y el gate del experto compartido en bf16, mientras que los expertos enrutados se reducen a 3 bits.

La licencia es Apache 2.0, lo que permite uso comercial y modificacion. Es un modelo relevante para desarrolladores que buscan capacidades multimodales en hardware Apple Silicon sin sacrificar las capas criticas de enrutamiento, que son las que determinan que expertos se activan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atencion completa + atencion lineal (Gated DeltaNet), Mixture of Experts, vision encoder |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3.000 millones por token (8 de 256 expertos activos + 1 experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BaseQuant_XL mixto: bf16 en router, shared expert, lm_head y shared_expert_gate; 8-bit en embeddings y atencion; 6-bit en vision_tower; 3-bit en expertos enrutados (switch_mlp). Media de 4.055 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La base del modelo, `Qwen/Qwen3.6-35B-A3B`, es una MoE multimodal con 256 expertos enrutados, de los cuales 8 se activan por token ademas de un experto compartido. Los parametros activos por token rondan los 3.000 millones, mientras que el total llega a 35.107 millones. La arquitectura combina atencion completa (`self_attn`) con bloques de atencion lineal (`linear_attn`) implementados mediante Gated DeltaNet, una tecnica que permite mantener estados de contexto largos con coste sublineal.

El modelo incluye un vision encoder (vision tower) que le permite procesar imagenes, y que en esta cuantizacion se mantiene a 6 bits para preservar la calidad visual. No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO.

La innovacion tecnica principal de esta ficha no esta en el entrenamiento, sino en la estrategia de cuantizacion BaseQuant_XL. El enfoque identifica las capas donde la perdida de precision afecta mas al comportamiento del modelo, como el router de la MoE y el experto compartido, y las conserva en bf16. El resto de parametros, especialmente los expertos enrutados que constituyen la mayor parte del peso, se cuantizan agresivamente a 3 bits con grupos de 64.

## Capacidades

- Generacion de texto multimodal: puede recibir prompts de texto y de imagen (pipeline `image-text-to-text`).
- Comprension de imagenes: el vision tower cuantizado a 6 bits permite describir contenido visual, extraer informacion de diagramas y responder preguntas sobre fotografias.
- Modo de pensamiento (thinking mode): el autor indica que se debe activar con `enable_thinking=true`, lo que sugiere un modo de razonamiento deliberado antes de responder.
- Inferencia eficiente en MoE: al activar solo ~3.000 millones de parametros por token, el coste computacional es menor que el de un modelo denso de 35.000 millones.
- Cuantizacion especifica para hardware de Apple: el paquete `mlx-vlm` permite cargar y ejecutar el modelo directamente en Macs con Apple Silicon.
- No se menciona soporte de tool calling ni de agentes en la informacion disponible.
- No se han publicado datos sobre capacidades multilingues especificas.

## Casos de uso

- Asistente multimodal en Macs con RAM limitada: gracias a los 17.8 GB de pesos y a la integracion con `mlx-vlm`, se puede desplegar en un Mac con Apple Silicon y memoria unificada de 24 GB o superior, sin necesidad de infraestructura cloud.
- Analisis de documentos con imagenes: el modelo puede combinar OCR y comprension de escenas para extraer informacion de facturas, diagramas, capturas de pantalla o documentos escaneados, manteniendo las capas criticas en bf16.
- Descripcion de imagenes para accesibilidad: permite generar alternativas textuales para personas con discapacidad visual en tiempo real, gracias a su vision tower y a la baja latencia esperada de la activacion parcial de expertos.
- Razonamiento visual sobre diagramas tecnicos: al soportar thinking mode, puede analizar esquemas, planos o graficos y generar explicaciones paso a paso, lo que resulta util en entornos educativos o de soporte tecnico.
- Chat conversacional multimodal en local: para aplicaciones de prototipado rapido que requieran interaccion con imagenes dentro de una conversacion, la licencia Apache 2.0 facilita pruebas y despliegues.
- Clasificacion y analisis de imagenes con prompts en lenguaje natural: se pueden plantear consultas zero-shot sobre el contenido de una imagen, aprovechando la comprension visual y el razonamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo ocupa 17.8 GB en disco, repartidos en 4 shards, con una media de 4.055 bits por peso.
- VRAM estimada para inferencia: no disponible oficialmente; por el tamano de los pesos se puede estimar que un Mac con 24 GB de RAM unificada seria un minimo razonable, aunque no hay datos publicados de consumo.
- GPU recomendadas: no aplica a GPUs NVIDIA; el modelo esta pensado para Apple Silicon (M1/M2/M3/M4) mediante MLX.
- Si cabe en consumer GPU: no es aplicable, ya que el formato es MLX y no se documenta soporte CUDA.
- Opciones de despliegue: `mlx-vlm` (via linea de comandos con `python -m mlx_vlm.generate`) y la libreria `mlx`. No se mencionan vLLM, llama.cpp ni TGI en la documentacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| `Qwen/Qwen3.6-35B-A3B` | 35.107.181.936 | ~3.000 millones | no disponible | no disponible | Apache 2.0 |
| `leonsarmiento/Qwen3.6-35B-A3B-3bit-XL-mlx` | 35.107.181.936 | ~3.000 millones | BaseQuant_XL mixto, 3-bit en expertos enrutados | 17.8 GB | Apache 2.0 |
| `leonsarmiento/Qwen3.6-35B-A3B-6bit-XL-mlx` | 35.107.181.936 | ~3.000 millones | BaseQuant_XL mixto, 6-bit en expertos enrutados | no disponible | Apache 2.0 |

La variante 3-bit es la mas compacta de las dos versiones XL, ya que reduce los expertos enrutados de 6 a 3 bits. La diferencia de tamano entre ambas es significativa, pero no se dispone del dato exacto para la variante 6-bit.

## Limitaciones y advertencias

- La cuantizacion agresiva de los expertos enrutados a 3 bits puede degradar la precision en tareas que requieran un razonamiento numerico o logico fino, a pesar de mantener el router en bf16.
- No se han publicado resultados de benchmarks, por lo que no se puede comparar de forma objetiva con otros modelos de la misma categoria.
- La longitud de contexto no esta documentada en la informacion disponible, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Los idiomas soportados no estan especificados, por lo que no se puede garantizar cobertura multilingue mas alla de lo que el modelo base pueda ofrecer.
- Existe riesgo de alucinaciones, como en cualquier modelo de lenguaje, y la cuantizacion a 3 bits podria acentuarlo en algunos dominios.
- El formato MLX restringe el despliegue a ecosistemas de Apple Silicon; no se ofrece soporte para GPUs CUDA ni para servidores convencionales.
- No se mencionan sesgos especificos evaluados ni medidas de mitigacion en la ficha.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/leonsarmiento/Qwen3.6-35B-A3B-3bit-XL-mlx
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante 6-bit XL del mismo autor: https://huggingface.co/leonsarmiento/Qwen3.6-35B-A3B-6bit-XL-mlx
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
