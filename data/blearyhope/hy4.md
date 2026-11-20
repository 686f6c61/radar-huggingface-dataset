# blearyhope/Hy4

## Resumen

Hy4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy. El backbone linguistico cuenta con 770B parametros totales de los que se activan 49B por token, y se complementa con un codificador visual ViT de 1.23B parametros y un drafter DFly2 de 3.3B para decodificacion especulativa. El modelo esta disenado para comprension conjunta de texto, imagen y video, con una longitud de contexto de 1M tokens.

La arquitectura incorpora innovaciones tecnicas destacables: atencion Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache para reutilizacion de indices dispersos entre capas, conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales, y Multi-head Latent Attention (MLA) con 64 cabezas. El modelo se distribuye bajo la licencia Tencent Hy License y esta orientado a tareas de instruct y conversacion multimodal.

Su relevancia actual radica en la combinacion de un contexto extremadamente largo (1M tokens) con capacidades multimodales y un esquema MoE que mantiene un coste de inferencia contenido (49B parametros activos) frente a modelos densos de tamano comparable. El repositorio ocupa 1.548,9 GB en safetensors, lo que refleja la escala del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer y atencion Gated DSA + MLA |
| Parametros totales | 770B (backbone linguistico, excluyendo ViT, adaptador y DFly2); 774.434.002.142 segun safetensors |
| Parametros activos | 49B texto + 1.23B vision por token |
| Longitud de contexto | 1M (1.048.576 tokens) |
| Tipos de cuantizacion | no disponible (existe repositorio GGUF de terceros: AngelSlim/Hy4-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone linguistico consta de 78 capas: una capa densa inicial con FFN estandar (tamano intermedio 18.432) y 77 capas MoE. Cada capa MoE contiene 256 expertos enrutados y 1 experto compartido; cada token activa los top-8 expertos enrutados junto con el compartido (tamano intermedio de experto 2.048). El tamano oculto es de 6.144 y el vocabulario de 120.832 tokens. Las conexiones residuales emplean iHC (identity Hyper-Connections) con 4 flujos residuales, inspiradas en DeepSeek y GLM.

El modulo de atencion usa Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, que reutiliza indices dispersos entre capas. La formulacion es Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512. El indexador tiene 32 cabezas de dimension 128 y selecciona los top-2.048 tokens para contexto disperso. El codificador visual ViT tiene 40 capas, tamano oculto 1.536, tamano intermedio 6.144, 16 cabezas de atencion, patch de 16x16, embedding posicional de 128x128 y fusion de caracteristicas visuales 2x2; un adaptador convierte las caracteristicas de imagen y fotogramas de video en tokens visuales. El drafter DFly2 (5 capas, 3.3B parametros) reutiliza la KV cache y los indices dispersos de Hy4 para decodificacion especulativa de bajo coste constante en contexto largo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Comprension de texto, imagen y video de forma conjunta (pipeline image-text-to-text).
- Generacion de texto e instrucciones conversacionales (instruct, conversational).
- Razonamiento multimodal sobre imagenes y fotogramas de video gracias al ViT de resolucion dinamica.
- Vision y computer use (segun la model card).
- Desarrollo frontend y de videojuegos (segun la model card).
- Flujos de trabajo financieros y de oficina (segun la model card).
- Investigacion cientifica e I+D en IA (segun la model card).
- Asistente personal de horizonte largo (segun la model card).
- Decodificacion especulativa integrada mediante DFly2 para acelerar la inferencia en contexto largo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues detalladas: no disponible (solo se confirma soporte de chino e ingles en la documentacion del autor).

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: el contexto de 1M tokens permite procesar manuales, informes o expedientes completos con figuras y tablas en una sola pasada, manteniendo coherencia entre texto y elementos visuales.
- Computer use y automatizacion de interfaces: el modelo puede interpretar capturas de pantalla y razonar sobre elementos de UI, adecuado para agentes que operan aplicaciones o navegadores.
- Desarrollo frontend asistido: generacion y revision de codigo de interfaces a partir de mockups o capturas, combinando comprension visual con generacion de codigo.
- Analisis de video para resumenes y descripciones: el ViT procesa fotogramas como tokens visuales, util para transcripcion descriptiva, moderacion de contenido o extraccion de eventos en videos largos.
- Asistencia en flujos financieros y de oficina: extraccion de datos de facturas, estados de cuenta o formularios escaneados y generacion de resumenes estructurados.
- Investigacion cientifica asistida: lectura de articulos con figuras, interpretacion de graficas y sintesis de literatura tecnica en contextos de hasta 1M tokens.
- Asistente personal de horizonte largo: gestion de conversaciones multi-turno prolongadas con memoria de contexto extensa, adecuado para tareas de planificacion sostenida.

## Benchmarks y rendimiento

Resultados few-shot de preentrenamiento publicados en la model card (seccion truncada en la informacion disponible):

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Knowledge | MMLU† | 5 | 91.6 | 88.7 | 87.5 | 89.7 | 91.1 |
| Knowledge | MMLU-Pro† | 5 | 73.9 | 71.1 | 65.8 | 68.6 | 73.4 |
| Knowledge | MMLU-Redux† | 5 | no disponible (truncado) | no disponible | no disponible | no disponible | no disponible |

El resto de resultados de benchmarks (HumanEval, GSM8K y otros) no estan disponibles en la informacion proporcionada, ya que la model card aparece truncada en la seccion del apendice de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A modo orientativo, un modelo de 770B parametros en safetensors requiere varios cientos de GB de memoria; el repositorio completo ocupa 1.548,9 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por escala, requiere despliegues multi-GPU de clase datacenter (A100, H100 u equivalentes); no cabe en GPUs de consumo.
- Cabe en consumer GPU: no, dado el tamano del modelo (770B parametros). Existe un repositorio GGUF de terceros (AngelSlim/Hy4-GGUF) que podria permitir cuantizaciones, pero no se detallan requisitos.
- Opciones de despliegue: vLLM y SGLang (documentados en la model card), ademas de transformers. Existe soporte GGUF de terceros.
- Latencia y throughput estimados: no disponible. La model card menciona DFly2 para decodificacion especulativa con coste constante en contexto largo, pero sin cifras publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (5-shot) |
|---|---|---|---|---|---|
| Hy4 | 770B | 49B (texto) + 1.23B (vision) | 1M | Tencent Hy License | 91.6 |
| Hy4 flash | no disponible | no disponible | no disponible | Tencent Hy License | 88.7 |
| Hy3 preview | no disponible | no disponible | no disponible | Tencent Hy License | 87.5 |
| DeepSeek-V4-flash | no disponible | no disponible | no disponible | no disponible | 89.7 |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | 91.1 |

Los datos de parametros, contexto y licencia de los modelos comparables no estan disponibles en la informacion proporcionada; solo se dispone de sus resultados en MMLU y MMLU-Pro.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, es esperable, pero no se aportan datos.
- Limitaciones de contexto o idioma: el contexto maximo es de 1M tokens; los idiomas soportados no estan detallados (solo se confirma documentacion en chino e ingles). El rendimiento en otros idiomas es desconocido.
- Restricciones de licencia: la Tencent Hy License es una licencia "other" con terminos propios; es necesario revisar el texto completo en el enlace oficial antes de cualquier uso comercial.
- El repositorio consultado (blearyhope/Hy4) tiene 0 descargas y 0 likes y parece una copia no oficial del modelo original de Tencent (tencent/Hy4); se recomienda usar el repositorio oficial.
- El modelo requiere infraestructura multi-GPU de gran escala; no es viable en hardware de consumo.
- La model card esta truncada en la informacion disponible, por lo que faltan secciones de benchmarks, limitaciones conocidas y system card.

## Enlaces

- Repositorio consultado: https://huggingface.co/blearyhope/Hy4
- Repositorio oficial (referenciado): https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
