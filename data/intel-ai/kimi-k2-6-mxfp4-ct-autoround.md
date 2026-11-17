# intel-ai/Kimi-K2.6-MXFP4-CT-AutoRound

## Resumen

Kimi-K2.6-MXFP4-CT-AutoRound es una version cuantizada del modelo multimodal moonshotai/Kimi-K2.6, publicada por el equipo de Intel AI (intel-ai) mediante la herramienta AutoRound. Se trata de una cuantizacion MXFP4 (W4A16, group_size 128) generada con el metodo RTN (round-to-nearest) que comprime las capas lineales del modelo original a 4 bits manteniendo lm_head y embeddings en BF16. El resultado es un checkpoint de aproximadamente 1,03 billones de parametros almacenado en safetensors, con un tamano de repositorio de 563,5 GB.

El modelo hereda la arquitectura y capacidades del Kimi-K2.6 original: un transformer multimodal con pipeline image-text-to-text, orientado a conversacion, razonamiento y extraccion de caracteristicas. La relevancia de esta variante radica en que reduce el peso en memoria del modelo original manteniendo una tasa de recuperacion de rendimiento del 99,43 % de media frente a la version BF16 en los benchmarks publicados (GSM8K, MMLU, PIQA y HellaSwag). Esto lo hace atractivo para despliegues en infraestructura con VRAM limitada o con aceleradores que aprovechan formatos de 4 bits.

La ficha tecnica disponible es deliberadamente escasa en cuanto a detalles de entrenamiento, idiomas y composicion del dataset; el autor solo documenta el proceso de cuantizacion y los resultados de evaluacion. La licencia es "modified-mit" (etiquetada como "other" en Hugging Face), por lo que se recomienda revisar los terminos del modelo base antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la del modelo base Kimi-K2.6); pipeline image-text-to-text |
| Parametros totales | 1.026.879.376.368 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A16, group_size 128) en capas lineales; lm_head y embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (compressed-tensors, 8-bit segun tags) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint moonshotai/Kimi-K2.6, no un entrenamiento desde cero. La arquitectura subyacente es la del modelo base, descrita en Hugging Face como un transformer multimodal con pipeline image-text-to-text y soporte de tool calling y reasoning parsers (kimi_k2). Sobre esa base, Intel aplica AutoRound con esquema MXFP4, cuantizando las capas lineales a 4 bits con grupo de 128 y manteniendo en BF16 la cabeza de salida (lm_head) y los embeddings. El metodo de redondeo empleado es RTN (round-to-nearest), no una optimizacion con descenso de gradiente firmado, segun indica la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. La unica innovacion tecnica documentada es el propio pipeline de cuantizacion: AutoRound con formato llm_compressor y la lista de capas ignoradas (`shared_experts`, `self_attn`, `mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`), que preserva en mayor precision componentes sensibles. El paper de referencia es "Optimize weight rounding via signed gradient descent for the quantization of LLMs" (arXiv:2309.05516).

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Kimi-K2.6.
- Procesamiento de imagen y texto (pipeline image-text-to-text), segun la etiqueta del modelo.
- Soporte de tool calling / function calling, con parser `kimi_k2` en vLLM y `--enable-auto-tool-choice`.
- Soporte de modo razonamiento (reasoning parser `kimi_k2`), orientado a razonamiento multi-paso.
- Extraccion de caracteristicas (tag feature-extraction).
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades de codigo y matematicas: inferidas del modelo base, no verificadas en esta ficha.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede gestionar dialogos que combinan imagenes y texto gracias a su pipeline image-text-to-text, adecuado para interfaces de atencion al cliente con soporte de capturas o documentos escaneados.
- Agentes con tool calling: la integracion documentada con vLLM y el parser `kimi_k2` permite construir agentes que invocan funciones externas (APIs, bases de datos) en flujos multi-paso.
- Razonamiento asistido con modo thinking: el reasoning parser `kimi_k2` habilita cadenas de razonamiento explicitas, util para tareas de analisis, planificacion o resolucion de problemas complejos.
- Despliegue en infraestructura con VRAM limitada: al ser una cuantizacion MXFP4, reduce el peso en memoria frente al BF16 y permite servir el modelo en hardware que no admitiria el checkpoint original completo.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir la degradacion de un modelo de gran escala al pasar a 4 bits, con datos de recuperacion publicados (99,43 % de media).
- Extraccion de caracteristicas y embeddings: el tag feature-extraction sugiere uso para representaciones internas en pipelines de recuperacion o clasificacion.
- Prototipado de asistentes con imagenes en entornos de investigacion: la licencia modified-mit y la disponibilidad en Hugging Face facilitan experimentacion academica.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando BF16 frente a MXFP4:

| Benchmark | BF16 | MXFP4 | Recuperacion |
|---|---:|---:|---:|
| GSM8K | 93,63 | 92,72 | 99,03 % |
| MMLU | 89,01 | 88,67 | 99,62 % |
| PIQA | 84,55 | 84,71 | 100,19 % |
| HellaSwag | 77,52 | 76,65 | 98,88 % |
| **Media** | **86,18** | **85,69** | **99,43 %** |

No se han publicado en la informacion disponible resultados de HumanEval, MMLU-Pro ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 563,5 GB en safetensors; en MXFP4 (W4A16) el peso de las capas lineales se reduce a 4 bits, pero lm_head y embeddings permanecen en BF16, por lo que el requisito real de memoria es elevado y no cabe en una sola GPU consumer.
- GPU recomendadas: no documentadas en la informacion disponible; por el tamano del modelo se requiere infraestructura multi-GPU de clase数据中心 (A100, H100 u equivalentes).
- GPU consumer: no cabe en RTX 4090 ni en tarjetas de 24 GB; se necesitan configuraciones multi-GPU o aceleradores con gran capacidad de memoria.
- Opciones de despliegue: vLLM 0.29.0 (documentado por el autor, con `--trust-remote-code`, `--tool-call-parser kimi_k2`, `--enable-auto-tool-choice` y `--reasoning-parser kimi_k2`); otros motores no documentados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/Kimi-K2.6-MXFP4-CT-AutoRound | 1,03 B (total) | no disponible | MXFP4 (W4A16) | modified-mit | Hugging Face, 46 descargas |
| moonshotai/Kimi-K2.6 (base) | no disponible en esta ficha | no disponible | BF16 | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria en parametros, contexto o rendimiento mas alla del modelo base.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; el autor advierte explicitamente de que no debe confiarse en el para informacion precisa.
- Riesgo de generar contenido obsceno, sesgado u ofensivo por las limitaciones del modelo preentrenado y de los datasets de ajuste.
- La cuantizacion MXFP4 introduce una degradacion media del 0,57 % en los benchmarks publicados, con mayor perdida en HellaSwag (98,88 % de recuperacion).
- No se documentan los idiomas soportados ni el contexto maximo, lo que dificulta planificar despliegues multilingues o con ventanas largas.
- La licencia "modified-mit" (etiquetada como "other") debe revisarse junto con la del modelo base; el autor recomienda consultar a un abogado antes de uso comercial.
- No se han publicado datos de sesgos especificos, latencia ni throughput en produccion.
- El autor recomienda realizar pruebas de seguridad antes de desplegar cualquier aplicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Kimi-K2.6-MXFP4-CT-AutoRound
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de referencia (AutoRound): https://arxiv.org/abs/2309.05516
