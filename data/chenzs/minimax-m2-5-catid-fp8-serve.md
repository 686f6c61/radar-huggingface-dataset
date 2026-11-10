# chenzs/MiniMax-M2.5-catid-FP8-Serve

## Resumen

MiniMax-M2.5-catid es una variante "abliterated" (sin mecanismos de rechazo) del modelo MiniMax-M2.5 de MiniMaxAI, publicada por el usuario chenzs en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 228.689.764.864 parametros totales, 62 capas de transformer y 256 expertos por capa, distribuido en formato FP8 E4M3FN con escalado por bloques de 128x128. El repositorio ocupa 230,1 GB.

El modelo resuelve un problema muy concreto: eliminar el comportamiento de rechazo (refusal) del modelo base mediante la sustitucion quirurgica de pesos, manteniendo intacta el resto de la arquitectura. Concretamente, se reemplazan los tensores `o_proj` (proyeccion de salida de atencion) de las 62 capas por los de una variante ya abliterated (PRISM-PRO), dequantizados desde GGUF Q8_0 y recuantizados a FP8 E4M3FN. El resto de pesos (q_proj, k_proj, v_proj, expertos MLP, embeddings, normas) son identicos al modelo oficial FP8.

Es relevante ahora porque se presenta como un reemplazo directo ("drop-in replacement") del MiniMax-M2.5 oficial, servible con vLLM o SGLang, y porque documenta de forma transparente su metodologia y sus resultados de eliminacion de rechazo sobre un benchmark de 10.000 prompts. No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es "modified-mit" (la misma del modelo base), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (MiniMax-M2.5), 62 capas, 256 expertos por capa, hidden_dim=3072 |
| Parametros totales | 228.689.764.864 (~229B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 2048`) |
| Tipos de cuantizacion | FP8 E4M3FN con escalado por bloques (128x128); origen de pesos abliterated en GGUF Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (Modified MIT, misma que el modelo base) |
| Formato de pesos | safetensors (FP8), libreria transformers con `custom_code` |

## Arquitectura y entrenamiento

La arquitectura es la del MiniMax-M2.5 original: un transformer Mixture-of-Experts de 62 capas con 256 expertos por capa y dimension oculta de 3072. El modelo conserva exactamente la arquitectura MoE del base (~229B parametros) y solo modifica los tensores de proyeccion de salida de atencion (`o_proj`), 62 tensores de 3072 x 6144 mas sus tensores `scale_inv`. El resto de pesos (q_proj, k_proj, v_proj, expertos MLP, embeddings, normas) son identicos al modelo oficial FP8.

El "entrenamiento" de esta variante no es un entrenamiento al uso, sino una intervencion de pesos: se toman los `o_proj` de la variante abliterated PRISM-PRO (GGUF Q8_0), se dequantizan y se recuantizan a FP8 E4M3FN con escalado por bloques para coincidir con el esquema de cuantizacion del modelo original. El autor reporta un error de reconstruccion del 0,5% relativo por capa (similitud coseno ~1,0). No se dispone de informacion sobre el dataset de entrenamiento original del modelo base (numero de tokens, composicion, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y multi-turno (pipeline `text-generation`).
- Razonamiento y respuesta a prompts de capacidad general: el autor reporta 50/50 aciertos en un test de coherencia de 50 prompts.
- Comportamiento sin rechazo ("uncensored" / "abliterated"): responde a prompts que el modelo base rechazaria, con una tasa de rechazo residual del 5,8% en validacion (atribuida mayoritariamente a falsos positivos del juez LLM en prompts benignos).
- Compatibilidad con tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque al ser reemplazo directo del base se heredarian las capacidades de este.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo y comparar con el base, gracias a la documentacion detallada del metodo y a las tasas de rechazo reportadas (6,2% train / 5,8% validacion).
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o narrativa que el modelo base rechazaria por tematica sensible, con coherencia preservada (100% en el test de capacidad del autor).
- Evaluacion de robustez de filtros y moderacion: servir este modelo como generador adversario para probar sistemas de moderacion y clasificadores de contenido en pipelines de seguridad.
- Despliegue como reemplazo directo del MiniMax-M2.5 en infraestructura existente: al ser drop-in replacement, se puede servir con vLLM (`--tensor-parallel-size 4`) o SGLang (`--tp 4`) sin cambios en el codigo de integracion.
- Estudio de tecnicas de abliteration: la sustitucion quirurgica de `o_proj` con error de reconstruccion del 0,5% sirve como caso de referencia para investigar intervenciones de pesos en modelos MoE de gran escala.
- Experimentacion con cuantizacion FP8: el modelo permite evaluar el rendimiento de FP8 E4M3FN con escalado por bloques en un MoE de ~229B en hardware con soporte FP8.

## Benchmarks y rendimiento

El autor publica resultados de un benchmark propio de rechazo (10.000 prompts, juez LLM GPT-5-nano, clasificacion en 4 vias):

| Split | Prompts | Complied | Refused | Hedged | Deflected | Tasa de rechazo |
|---|---|---|---|---|---|---|
| Train | 8.000 | 7.506 | 262 | 228 | 4 | 6,2% |
| Validation | 2.000 | 1.885 | 55 | 59 | 1 | 5,8% |

Coherencia: 100% (50/50 prompts de capacidad respondidos correctamente).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 230,1 GB en FP8; se necesita un total de memoria agregada de al menos ese orden para cargar los pesos, mas overhead de KV cache y activaciones.
- GPU recomendadas: el autor sugiere despliegue con tensor parallelism de 4 (`--tensor-parallel-size 4` / `--tp 4`), lo que implica GPUs de clase datacenter con soporte FP8 (H100, H200, B200 o equivalentes). No se especifican modelos concretos.
- ¿Cabe en consumer GPU? No: con ~229B parametros en FP8 y 230 GB de pesos, no cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo habituales.
- Opciones de despliegue: vLLM y SGLang (soportados explicitamente por el autor); cualquier framework que soporte el modelo original MiniMax-M2.5. Requiere `--trust-remote-code`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMax-M2.5-catid (este) | ~229B (MoE) | no disponible | Modified MIT | Hugging Face (0 descargas) | FP8, abliterated via sustitucion de o_proj |
| MiniMaxAI/MiniMax-M2.5 (base) | ~229B (MoE) | no disponible | Modified MIT | Hugging Face | Modelo original con rechazos de seguridad |
| PrunaAI/MiniMax-M2.5-PRISM-PRO-Q8_0_v2-GGUF | ~229B (MoE) | no disponible | no disponible | Hugging Face | Variante abliterated en GGUF Q8_0, fuente de los o_proj |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de mecanismos de seguridad: el modelo puede generar contenido que el base rechazaria; el autor lo declara "for research purposes" y responsabiliza al usuario.
- Tasa de rechazo residual del ~6%: segun el autor, mayoritariamente falsos positivos del juez LLM en prompts benignos, no rechazos reales de contenido danino.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los LLM de gran escala.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; el ejemplo de despliegue limita `--max-model-len` a 2048, lo que sugiere precaucion con contextos largos en esta configuracion.
- Restricciones de licencia: Modified MIT, con posible uso comercial sujeto a los terminos del modelo base (enlace a la licencia en el repositorio de MiniMax-AI); conviene revisar antes de produccion.
- Advertencia de produccion: 0 descargas y 0 likes, publicacion sin validacion comunitaria; el modelo depende de `--trust-remote-code` y de `custom_code`, lo que implica ejecutar codigo del repositorio.
- La validacion de coherencia se limita a 50 prompts, muestra pequena para garantizar calidad en uso general.

## Enlaces

- Hugging Face: https://huggingface.co/chenzs/MiniMax-M2.5-catid-FP8-Serve
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
- Fuente de abliteration (PRISM-PRO): https://huggingface.co/PrunaAI/MiniMax-M2.5-PRISM-PRO-Q8_0_v2-GGUF
- Licencia del modelo base: https://github.com/MiniMax-AI/MiniMax-M2.5/blob/main/LICENSE
