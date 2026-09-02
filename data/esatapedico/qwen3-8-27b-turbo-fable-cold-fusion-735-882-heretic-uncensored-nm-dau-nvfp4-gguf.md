# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF

## Resumen

Este repositorio contiene una familia de seis archivos GGUF del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un ajuste fino de Qwen3.8-27B realizado por DavidAU. El modelo base es un transformer denso de 27B parametros con arquitectura hibrida (Gated DeltaNet y Gated Attention), 262K tokens de contexto nativo, un cabezal MTP (Multi-Token Prediction) integrado para decodificacion especulativa y una torre de vision nativa. El trabajo de esatapedico se limita a la conversion numerica: transformo el checkpoint NVFP4 a GGUF y construyo una escalera de precision para los tensores que mas afectan a la calidad de salida y la velocidad de decodificacion (lm_head, embeddings y cabezal MTP), manteniendo un backbone NVFP4 identico en todos los archivos.

La relevancia de este lanzamiento radica en que ofrece un modelo de 27B con cuantizacion NVFP4 (W4A16) nativa para hardware Blackwell (sm_120), con decodificacion especulativa MTP integrada en cada archivo, lo que permite ejecutar un modelo de alta capacidad en GPUs de consumo con una sola tarjeta de 16 GB en los niveles mas bajos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido denso: Gated DeltaNet (linear attention) en 48 de 64 capas, Gated Attention en las 16 restantes (cada cuarta capa) |
| Parametros totales | 27B (aproximadamente 28B contando el encoder de vision de ~1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16, escalas FP8 E4M3) para el backbone; lm_head, token_embd y MTP head varian por nivel: Q2_K, Q3_K, Q5_0, Q6_K, Q8_0, IQ4_XS o BF16 |
| Idiomas soportados | Ingles, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (6 niveles), safetensors (NVFP4, repositorio hermano) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con hidden size 5.120 y un vocabulario de 248.320 tokens. Su arquitectura hibrida combina 48 capas de Gated DeltaNet (linear attention) con 16 capas de Gated Attention intercaladas (cada cuarta capa), lo que reduce el coste computacional del atencion sobre contextos largos. Incluye una torre de vision nativa (~1B parametros) y un cabezal MTP integrado que permite decodificacion especulativa sin necesidad de un modelo drafter externo.

El ajuste fino de DavidAU, denominado TURBO 735-882, combina tres tecnicas: un merge "Fable" y "Cold Fusion" sobre el modelo base, y un ajuste "Heretic/Uncensored" con capas DPO. Segun el autor, este ajuste supera los 730 puntos en ARC-c (144 puntos por encima del Qwen3.8-27B original) y los 880 en ARC-E en cuantizacion de 8 bits. La torre de vision del modelo original se mantiene intacta en el ajuste.

La conversion a NVFP4 se realizo sin calibracion, manteniendo en BF16 la torre de vision, la ruta de atencion lineal, lm_head, embeddings y cabezal MTP en la fuente de cuantizacion. Los archivos GGUF contienen 1.122 tensores, de los cuales 448 forman el backbone NVFP4 identico en todos los niveles.

## Capacidades

- Generacion de texto y razonamiento complejo en contextos de hasta 262K tokens nativos.
- Razonamiento multi-paso y capacidades de agente gracias al entrenamiento del modelo base Qwen3.8.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidades de vision: el modelo incluye una torre de vision nativa que puede usarse con el proyector `mmproj-BF16.gguf` del modelo base.
- Decodificacion especulativa MTP integrada en todos los archivos GGUF, activable con `--spec-type draft-mtp` en llama.cpp.
- Multilingue, con soporte principal de ingles y capacidades multilingue del modelo base.
- Modo "uncensored" y "heretic" del ajuste de DavidAU, que reduce restricciones de seguridad en la generacion.

## Casos de uso

- Asistentes de codigo en produccion: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para generacion, revision y autocompletado de codigo, con la ventaja de su ventana de contexto de 262K tokens para proyectos grandes.
- Analisis de documentos extensos: con 262K tokens de contexto nativo, puede procesar libros completos, expedientes legales o documentacion tecnica extensa en una sola pasada, resumiendo y extrayendo informacion clave.
- Razonamiento cientifico y matematico: el ajuste TURBO 735-882 reporta mejoras significativas en ARC-c y ARC-E, lo que lo hace adecuado para tareas de razonamiento cientifico, resolución de problemas matematicos y analisis de datos.
- Agentes autonomos multi-paso: combinando tool calling, razonamiento y la decodificacion especulativa MTP, puede ejecutar tareas complejas de varios pasos con menor latencia, como automatizacion de flujos de trabajo o navegacion web asistida.
- Vision-language en local: al emparejar el GGUF con el proyector de vision del modelo base, se pueden construir aplicaciones de captioning, VQA o analisis de imagenes en hardware de consumo.
- Despliegue en edge con GPU Blackwell: la cuantizacion NVFP4 nativa para sm_120 permite ejecutar el modelo en GPUs como RTX 5090 o B200 con menor uso de VRAM y mayor throughput que cuantizaciones genericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del ajuste (DavidAU) menciona en repositorios relacionados que el modelo supera los 730 puntos en ARC-c y 880 en ARC-E en 8 bits, y 718 en ARC-c en 4 bits, pero estos datos no estan verificados en la documentacion de este repositorio GGUF. No se proporcionan resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF pesan entre 15,15 GB (VERY-LOW) y 19,33 GB (VERY-HIGH) en decimal. El nivel VERY-HIGH requiere aproximadamente 18 GiB de VRAM solo para pesos, mas el espacio para KV cache, por lo que una GPU de 16 GB necesitara offload a CPU.
- GPUs recomendadas: el formato NVFP4 esta optimizado para hardware Blackwell (sm_120), como RTX 5090, B200 o GPUs de datacenter Blackwell. En GPUs de generaciones anteriores, el rendimiento puede verse penalizado.
- GPUs de consumo: los niveles LOW y VERY-LOW (15,15-15,75 GB) pueden caber en una RTX 4090 de 24 GB o en GPUs de 16 GB con offload parcial. El nivel MID-HIGH (16,91 GB) es el recomendado por el autor para doble GPU.
- Opciones de despliegue: llama.cpp con soporte para NVFP4 y MTP (`--spec-type draft-mtp`), vLLM para el checkpoint safetensors NVFP4, y LM Studio con soporte Day 0 para AMD Ryzen AI Max y Radeon.
- Latencia y throughput: no se proporcionan datos medidos. La decodificacion especulativa MTP integrada deberia reducir la latencia por token en comparacion con decodificacion autoregresiva estandar, especialmente en hardware Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16, GGUF | Apache 2.0 | Modelo base de Alibaba, sin ajuste |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este) | 27B | 262K | NVFP4, GGUF | Apache 2.0 | Ajuste de DavidAU con mejoras ARC, uncensored |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF | 27B | 262K | NVFP4, GGUF | Apache 2.0 | Otro ajuste del mismo autor de la conversion, variante GAIN |

La comparativa con otros modelos de 27B como Llama 3.3 70B o Mistral Large no es directa por diferencia de tamano. Dentro de la familia Qwen3.8-27B, este ajuste se diferencia por el merge TURBO 735-882 y el caracter uncensored, mientras que la conversion NVFP4 aporta eficiencia en hardware Blackwell.

## Limitaciones y advertencias

- El caracter "uncensored" y "heretic" del ajuste implica que el modelo puede generar contenido que otros modelos rechazarian, incluyendo contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones donde se requiera moderacion de contenido sin capas adicionales de filtrado.
- Los datos de rendimiento (ARC 735/882) provienen del autor del ajuste y no estan verificados de forma independiente en este repositorio.
- La cuantizacion NVFP4 esta optimizada para hardware Blackwell (sm_120). En GPUs de generaciones anteriores (Ampere, Ada Lovelace), el rendimiento puede ser significativamente peor que con cuantizaciones estandar como Q4_K_M o Q8_0.
- El nivel VERY-LOW sacrifica precision en lm_head, embeddings y MTP head (Q2_K/Q3_K), lo que puede degradar notablemente la calidad de salida y la coherencia en tareas complejas.
- La torre de vision requiere el proyector `mmproj-BF16.gguf` del modelo base, que no se incluye en este repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento reciente sin validacion de la comunidad.
- La fecha de creacion del repositorio (2026-09-02) es posterior a la fecha de publicacion del modelo base (2026-08-14), por lo que es un lanzamiento muy reciente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Repositorio safetensors NVFP4: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Informacion del lanzamiento de Qwen3.8-27B: https://www.llm-releases.com/models/qwen3-8-27b
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Repositorio relacion del mismo autor: https://huggingface.co/esatapedico/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF
- Soporte del autor: https://ko-fi.com/esatapedico
