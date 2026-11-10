# InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino de NousResearch/Arete-27B, que a su vez es una version post-entrenada de Qwen/Qwen3.8-27B. Lo publica InterpreticAI (Thomas Young) con el objetivo explicito de eliminar la censura politica residual que persiste en los modelos derivados de Qwen cuando se les consulta en chino. Segun la model card, Arete-27B ya reduce la propaganda en ingles pero sigue censurando aproximadamente la mitad de las respuestas a preguntas politicas formuladas en chino; esta version lleva esa tasa al 2,6% sobre el banco de 115 preguntas de Pan y Xu (2026).

El modelo conserva la arquitectura y el diseno de ficheros de Arete-27B y se distribuye principalmente como cuantizacion GGUF Q4_K_M (16,6 GB) junto con un proyector de vision F16 (0,93 GB), lo que permite ejecutarlo en una unica GPU de 24 GB. El checkpoint completo en BF16 tiene 26.895.998.464 parametros y esta publicado bajo licencia Apache 2.0.

Es relevante para investigadores que estudian censura y sesgo en modelos de origen chino, y para desarrolladores que necesitan un modelo multimodal de ~27B con contexto largo y comportamiento menos restrictivo en temas politicos, sin renunciar a la licencia permisiva de la familia Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B, sin capa MTP en esta version) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de despliegue de la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (16,6 GB); GGUF IQ3_XXS disponible en repo separado; BF16 en el repo del modelo base |
| Idiomas soportados | no disponible (la evaluacion cubre prompts en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y proyector de vision GGUF F16; BF16 en el repo no cuantizado |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de indicar que es identica a la de Arete-27B y Qwen3.8-27B, y que esta version concreta carece de capa de prediccion multi-token (MTP), a diferencia de Uncensored-v2. El pipeline declarado es image-text-to-text, con un proyector de vision separado en formato GGUF F16 que se carga mediante `--mmproj` en llama.cpp. El proceso de entrenamiento especifico (composicion del dataset, numero de tokens, uso de RLHF/DPO) no se documenta en la informacion disponible; la model card solo describe el objetivo de eliminar la censura politica residual en chino sobre el modelo base Arete-27B.

La evaluacion publicada se realizo sobre la release BF16 con decodificacion greedy, modo no-thinking, mismo hardware y mismo juez LLM para los tres modelos comparados (Qwen3.8-27B, Arete-27B y Uncensored-v3). Se utilizo el banco de 145 preguntas politicas en chino de Pan y Xu (2026), reportando sobre las 115 sensibles con un limite de 4.096 tokens de salida, y el conjunto Propaganda_Eval de Nous Research con 803 prompts en ingles.

## Capacidades

- Generacion de texto conversacional multi-turno en modo thinking y no-thinking (el modo se controla con `enable_thinking` en la plantilla de chat).
- Entrada de imagenes mediante el proyector de vision (`mmproj`), con pipeline image-text-to-text.
- Respuestas a preguntas politicas en chino sin las evasiones ni el alineamiento con talking points del PCC que presentan los modelos base (2,6% de respuestas censuradas frente al 50,4% de Arete-27B).
- Reduccion de propaganda en ingles: 0,5% de respuestas con propaganda en Propaganda_Eval frente al 1,0% de Arete-27B y el 24,5% de Qwen3.8-27B.
- Soporte de plantilla de chat Jinja (`--jinja`) en llama.cpp, lo que habilita el formato conversacional nativo del modelo.
- Capacidades de razonamiento y codigo heredadas de Qwen3.8-27B: no se documentan explicitamente en la model card, pero el modelo base las incluye por su familia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre censura politica en LLM: el modelo sirve como referencia para medir la tasa de respuestas censuradas con el banco de Pan y Xu (2026); su 2,6% de respuestas censuradas y 0,9% de negativas lo convierten en un punto de comparacion util frente a modelos de origen chino.
- Analisis de sesgo y alineamiento: permite estudiar como cambia el comportamiento del modelo al pasar de Qwen3.8-27B (83,5% censurado) a Arete-27B (50,4%) y a esta version (2,6%), aislando el efecto del post-entrenamiento.
- Despliegue local en estacion de trabajo con GPU de 24 GB: la cuantizacion Q4_K_M (16,6 GB) mas el proyector F16 (0,93 GB) cabe en una RTX 4090 o similar, con contexto de 65.536 tokens, lo que facilita prototipado sin infraestructura en nube.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o escaneos en flujos de analisis documental.
- Generacion de contenido editorial en ingles y chino: util para redactar borradores sobre temas politicos o historicos sin las autocorrecciones tipicas de modelos alineados con censura estatal.
- Evaluacion comparativa de jueces LLM: su comportamiento en modo no-thinking con decodificacion greedy y parametros de muestreo publicados lo hace reproducible en pipelines de evaluacion automatica.
- Asistente conversacional de contexto largo: los 65.536 tokens permiten mantener conversaciones extensas o procesar documentos largos en una sola pasada.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion sobre la release BF16, modo no-thinking, greedy, mismo juez LLM):

Censura politica en prompts en chino (Pan y Xu, 2026; 115 preguntas sensibles):

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83,5% | 50,4% | 2,6% |
| Rechaza o evade (menor es mejor) | 49,6% | 22,6% | 0,9% |
| Reescribe con talking points del PCC (menor es mejor) | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCC (menor es mejor) | 100% | 30% | 20% |
| Tema correcto, responde abiertamente (mayor es mejor) | 12,2% | 38,3% | 80,9% |

Propaganda en prompts en ingles (NousResearch/Propaganda_Eval; 803 prompts):

| Modelo | Respuestas con propaganda (menor es mejor) |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~17,5 GB para Q4_K_M (16,6 GB de pesos + 0,93 GB de proyector de vision) mas la KV cache correspondiente al contexto configurado.
- Cabe en una GPU consumer de 24 GB (RTX 4090, RTX 3090) segun la propia model card.
- Para contexto de 65.536 tokens conviene vigilar el consumo de KV cache; en GPUs de 24 GB puede requerir reducir el contexto o usar cuantizacion de cache.
- Despliegue recomendado: llama.cpp (`llama-server`) con `-ngl 999 -c 65536 --jinja` y `--mmproj` para entrada de imagen; compatible con LM Studio y Ollama segun la model card.
- No dispone de capa MTP, por lo que no se beneficia de decodificacion especulativa multi-token; para eso debe usarse Uncensored-v2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica en chino | Propaganda en ingles | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 | ~26,9B | 65.536 | 2,6% | 0,5% | Apache 2.0 | GGUF Q4_K_M, IQ3_XXS, BF16 |
| Qwen3.8-27B-Uncensored-v2 | no disponible | no disponible | 3,5% | no disponible | Apache 2.0 | BF16, FP8, GGUF Q4_K_M, GGUF IQ3_XXS |
| NousResearch/Arete-27B | ~26,9B (derivado) | no disponible | 50,4% | 1,0% | Apache 2.0 | BF16 |
| Qwen/Qwen3.8-27B | ~26,9B (derivado) | no disponible | 83,5% | 24,5% | Apache 2.0 | BF16 |

Uncensored-v2 incorpora capa MTP (decodificacion especulativa) y FP8, con una tasa de censura del 3,5%; Uncensored-v3 prescinde de MTP a cambio de bajar al 2,6%.

## Limitaciones y advertencias

- Cada modelo se genero una sola vez por benchmark, sin repeticiones, por lo que la varianza de las metricas no esta cuantificada.
- Una respuesta sustantiva no implica que sea correcta: la model card advierte explicitamente que los usuarios deben verificar las afirmaciones factuales de forma independiente.
- El modelo esta disenado para reducir la censura politica; su uso en produccion puede generar contenido sensible o controvertido y requiere moderacion propia.
- No se documentan sesgos mas alla de los politicos medidos, ni el comportamiento en idiomas distintos del ingles y el chino.
- La ausencia de capa MTP limita el throughput frente a Uncensored-v2 en escenarios de decodificacion especulativa.
- La licencia Apache 2.0 permite uso comercial, pero se mantienen la atribucion y los terminos de Nous Research y del equipo Qwen; debe revisarse el fichero LICENSE.
- Los datos de entrenamiento y la composicion del dataset no estan disponibles, lo que dificulta auditar el origen de posibles sesgos residuales.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Hugging Face (BF16): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Version v2: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Version v2 FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Version v2 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Version v2 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Version v3 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper de referencia (Pan y Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11545
