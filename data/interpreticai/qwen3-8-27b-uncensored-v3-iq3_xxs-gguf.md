# InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino (fine-tune) del modelo NousResearch/Arete-27B, que a su vez es un post-entrenamiento de Qwen/Qwen3.8-27B. Lo desarrolla InterpreticAI (Thomas Young) y su proposito declarado es eliminar la censura politica residual que Arete-27B mantiene en prompts en chino, asi como reducir la propaganda en ingles. Segun la model card, Arete-27B ya elimina la mayor parte de la propaganda en ingles, pero sigue censurando aproximadamente la mitad de las respuestas a preguntas politicas formuladas en chino; Uncensored-v3 reduce esa censura casi por completo.

La ficha corresponde a la cuantizacion GGUF IQ3_XXS de 3 bits, pensada para llama.cpp, LM Studio y Ollama, y que segun el autor cabe en una unica GPU de 12 GB. El checkpoint original es un BF16 completo con la misma arquitectura y estructura de ficheros que Arete-27B; la evaluacion publicada se ejecuto sobre la version BF16, no sobre esta cuantizacion.

El modelo es multimodal (pipeline image-text-to-text), con un proyector de vision separado en F16, y conserva la licencia Apache 2.0 de sus modelos base. Es relevante ahora porque aborda de forma medible la censura politica en modelos derivados de Qwen, un problema documentado academicamente (Pan & Xu, PNAS Nexus, 2026), y porque ofrece una via de despliegue en hardware de consumo mediante cuantizacion de 3 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; sin capa MTP en esta version) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura `-c 65536` (65.536 tokens) |
| Tipos de cuantizacion | IQ3_XXS (3 bits, fichero principal de 10,2 GB); proyector de vision en F16 (0,93 GB). La familia incluye tambien BF16, Q4_K_M, IQ3_XXS y MLX 4-bit |
| Idiomas soportados | no disponible (la evaluacion cubre prompts en ingles y en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); la version completa en safetensors/BF16 esta en el repo Uncensored-v3 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B, un transformer de aproximadamente 26,9 mil millones de parametros, con el mismo layout de ficheros que NousResearch/Arete-27B. Esta cuantizacion concreta no incluye la capa de prediccion multi-token (MTP) presente en Arete-27B ni en la version v2 del modelo, por lo que debe servirse con decodificacion estandar. El modelo es multimodal: incluye un proyector de vision (`mmproj-...-F16.gguf`) necesario unicamente para entrada de imagen.

El entrenamiento consistio en un post-entrenamiento adicional sobre Arete-27B, que ya habia sido post-entrenado desde Qwen3.8-27B. La model card no detalla el volumen de tokens, la composicion del dataset ni si se empleo RLHF o DPO; solo indica que el objetivo era eliminar la censura politica residual en chino y reducir la propaganda en ingles. La evaluacion se realizo en modo non-thinking, decodificacion greedy, con el mismo juez LLM y el mismo hardware para los tres modelos comparados.

## Capacidades

- Generacion de texto conversacional multi-turno, con modos thinking y non-thinking configurables mediante `--chat-template-kwargs '{"enable_thinking": false}'`.
- Entrada de imagen (image-text-to-text) mediante el proyector de vision F16.
- Respuestas a preguntas politicas sensibles en chino sin rechazo ni evasion en el 97,4% de los casos evaluados, y sin reescritura en puntos de vista oficiales del PCC en el 98,3%.
- Reduccion de propaganda en ingles: 0,5% de respuestas con propaganda en el conjunto Propaganda_Eval de Nous Research (803 prompts).
- Soporte de plantilla de chat estilo Jinja (`--jinja`), compatible con el ecosistema llama.cpp.
- Capacidades multilingues: no disponibles como lista oficial; la evaluacion cubre ingles y chino.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre censura politica en LLM: el modelo sirve como referencia empirica para medir la tasa de rechazo y evasiva en baterias de preguntas politicas en chino, comparandola con Qwen3.8-27B y Arete-27B bajo las mismas condiciones.
- Analisis de sesgo y alineacion: permite estudiar como un post-entrenamiento adicional modifica la distribucion de respuestas (de 50,4% a 2,6% de respuestas censuradas) sin cambiar la arquitectura base.
- Despliegue en estaciones de trabajo con GPU de 12 GB: la cuantizacion IQ3_XXS (10,2 GB de pesos) permite ejecutar un modelo de ~27B en hardware de consumo mediante llama.cpp, LM Studio u Ollama.
- Asistentes conversacionales con entrada de imagen: el proyector F16 habilita flujos image-text-to-text en local, util para prototipos de descripcion de imagenes o respuesta a preguntas visuales.
- Evaluacion comparativa de tecnicas de cuantizacion: el mismo modelo esta disponible en BF16, Q4_K_M, IQ3_XXS y MLX 4-bit, lo que permite medir el impacto de la cuantizacion en la calidad de respuesta y en la tasa de censura.
- Experimentacion con prompts en chino sin restricciones de rechazo: util para estudiar la calidad de respuestas abiertas sobre temas politicos, siempre con verificacion factual independiente.

## Benchmarks y rendimiento

Los datos siguientes corresponden a la evaluacion del checkpoint BF16, no a esta cuantizacion IQ3_XXS. Todas las ejecuciones se hicieron en modo non-thinking, decodificacion greedy, mismo hardware y mismo juez LLM.

Bateria de censura politica en chino (Pan & Xu, 2026), 115 preguntas politicamente sensibles, limite de 4.096 tokens de salida:

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 50,4% | 2,6% |
| Rechaza o evade (menor es mejor) | 49,6% | 22,6% | 0,9% |
| Reescribe en puntos de vista del PCC (menor es mejor) | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCC (menor es mejor) | 100% | 30% | 20% |
| Tema correcto y respuesta abierta (mayor es mejor) | 12,2% | 38,3% | 80,9% |

Propaganda en ingles (NousResearch/Propaganda_Eval, 803 prompts):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos IQ3_XXS ocupan 10,2 GB; con el proyector de vision F16 (0,93 GB) y cache KV para contexto largo, el autor indica que cabe en una GPU de 12 GB. Para contexto de 65.536 tokens la cache KV anade VRAM adicional no cuantificada en la model card.
- GPU recomendadas: el autor apunta a una unica GPU de 12 GB como minimo; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU de consumo: si, segun el autor, en una GPU de 12 GB con cuantizacion IQ3_XXS.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio y Ollama. El ejemplo oficial usa `llama-server -m ... --mmproj ... -ngl 999 -c 65536 --jinja`.
- Latencia y throughput estimados: no disponibles.
- Nota: esta version no incluye capa MTP, por lo que no puede usar decodificacion especulativa multi-token; para MTP debe usarse la version v2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica en chino (115 preguntas) | Propaganda en ingles (803 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 (IQ3_XXS) | ~26,9 mil M | 65.536 tokens en el ejemplo de uso | 2,6% | 0,5% | Apache 2.0 | GGUF, BF16, Q4_K_M, MLX 4-bit |
| Qwen3.8-27B (base) | ~26,9 mil M (no confirmado en la ficha) | no disponible | 83,5% | 24,5% | Apache 2.0 | Repo oficial de Qwen |
| NousResearch/Arete-27B | ~26,9 mil M | no disponible | 50,4% | 1,0% | Apache 2.0 | BF16 y derivados |
| InterpreticAI Uncensored-v2 | ~26,9 mil M | no disponible | 3,5% | no disponible | Apache 2.0 | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS; incluye MTP |

La comparativa de parametros y contexto de los modelos base no esta detallada en la informacion proporcionada; los valores marcados como no disponibles no deben interpretarse como ausencia de la capacidad, sino como falta de dato en la model card.

## Limitaciones y advertencias

- Cada modelo se genero una sola vez por benchmark; no hay intervalos de confianza ni repeticiones.
- Una respuesta sustantiva no es necesariamente correcta: el autor recomienda verificar de forma independiente las afirmaciones factuales.
- El objetivo del modelo es reducir la censura, lo que implica que puede producir contenido politicamente sensible o controvertido; no hay filtros de seguridad adicionales documentados.
- La evaluacion se realizo sobre el checkpoint BF16; el comportamiento de esta cuantizacion IQ3_XXS de 3 bits puede diferir, y no se han publicado metricas para ella.
- Esta version no incluye capa MTP, por lo que pierde la decodificacion especulativa disponible en v2.
- Idiomas soportados no documentados oficialmente; la evaluacion solo cubre ingles y chino.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen la atribucion y licencia de Nous Research y del equipo Qwen; debe revisarse el fichero LICENSE.
- No se documentan sesgos conocidos mas alla de los medidos en las dos baterias de evaluacion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Version BF16 de referencia: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Version v2 (con MTP y FP8): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- GGUF Q4_K_M de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- MLX 4-bit de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper de censura politica (Pan & Xu, 2026): https://doi.org/10.1093/pnasnexus/pgag013
- Pagina de Arete en Nous Research: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11546
