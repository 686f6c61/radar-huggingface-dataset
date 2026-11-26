# axteam/Qwen3.5-4B-AWQ-8bit

## Resumen

Qwen3.5-4B-AWQ-8bit es una cuantizacion post-entrenamiento (PTQ) en INT8 del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario axteam. El modelo base lo desarrolla el equipo Qwen (Alibaba), mientras que esta version cuantizada la produce axteam con el objetivo de servir el modelo de forma eficiente en vLLM. Se trata de un modelo denso de 4.539 millones de parametros (4.54B) con arquitectura hibrida que combina atencion lineal y atencion completa, torre de vision y una cabeza de prediccion multi-token (MTP).

La cuantizacion emplea el esquema W8A16: pesos INT8 simetricos con tamano de grupo 32 y activaciones en BF16, almacenados en formato compressed-tensors `pack-quantized`. El resultado ocupa aproximadamente 6,0 GB en disco (frente a los 11,7 GB del repositorio completo con todos los artefactos), lo que reduce a la mitad el peso de los pesos y permite desplegarlo en GPUs de consumo con suficiente VRAM. Alrededor del 23% de los parametros se mantienen en BF16 (torre de vision, proyector, cabeza MTP, RMSNorms, embeddings, LM head y las partes no lineales del modulo SSM) para preservar la calidad.

Su relevancia radica en que ofrece una fidelidad muy alta respecto al original BF16: la perplejidad apenas cambia (+0,0%) y la recuperacion media en benchmarks es del 99,8%, con un 98,5% de acuerdo top-1 en el siguiente token. Bajo licencia Apache-2.0, es una opcion atractiva para servir un modelo multimodal de 4B en produccion con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + atencion completa), densa, multimodal (vision), con cabeza MTP |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simetricos, grupo 32, activaciones BF16); formato compressed-tensors `pack-quantized` |
| Idiomas soportados | No disponible (la calibracion uso un corpus mixto con fuerte presencia de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que alterna capas de atencion lineal con capas de atencion completa, un patron habitual en modelos recientes para reducir el coste del KV cache en contextos largos. Es un transformer denso (no MoE) de 4,54B de parametros, multimodal con torre de vision y proyector, e incluye una cabeza de prediccion multi-token (MTP) que puede aprovecharse para decodificacion especulativa. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

Esta version concreta es una cuantizacion PTQ sin reentrenamiento. AWQ utiliza un conjunto de calibracion de 256 muestras (corpus mixto con fuerte carga de coreano) para proteger los canales de pesos mas relevantes antes del redondeo. Se mantienen en BF16 la torre de vision y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todos los RMSNorms, los embeddings de tokens, el LM head y las partes no lineales del SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`). En la revision del 2026-11-01 se restauraron de forma bit-exacta los pesos RMSNorm no suavizados del original, eliminando el ruido de redondeo BF16 (hasta un 0,4% en la ganancia efectiva) que habia introducido el manejo de offset-norm de llm-compressor. Los pesos cuantizados y los norms suavizados por AWQ no cambiaron.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat (pipeline `image-text-to-text`, tag `conversational`).
- Comprension de imagenes: el modelo es multimodal, con torre de vision y proyector mantenidos en BF16.
- Razonamiento y matematicas: los benchmarks reportados incluyen GSM8K (73,84 en 5-shot estricto) y ARC-Challenge (54,52 en 0-shot).
- Conocimiento general y multilingue: evaluado en MMLU (54,79), KMMLU coreano (50,48) y HAE-RAE coreano (62,05).
- Cabeza de prediccion multi-token (MTP) presente en la arquitectura, utilizable para decodificacion especulativa.
- Servible mediante API compatible con OpenAI a traves de vLLM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio multimodal en produccion con vLLM: el modelo se sirve con `vllm serve axteam/Qwen3.5-4B-AWQ-8bit` y expone un endpoint compatible con OpenAI; sus 6,0 GB de pesos permiten desplegarlo en una sola GPU de consumo con VRAM suficiente.
- Asistente conversacional con imagenes: al ser `image-text-to-text`, puede responder preguntas sobre capturas, diagramas o fotos en flujos de soporte tecnico donde el usuario adjunta una imagen y espera una explicacion textual.
- Atencion al cliente automatizada: la ventana de contexto configurable (el ejemplo usa 32.768 tokens) permite mantener conversaciones multi-turno con historial largo sin reentrenar ni truncar agresivamente.
- Procesamiento de documentos escaneados: combinando la torre de vision con generacion de texto puede extraer y resumir informacion de facturas, formularios o tickets en un pipeline por lotes.
- Razonamiento matematico asistido: con un 73,84 en GSM8K, es adecuado para tutoria o resolucion de problemas aritmeticos de varios pasos en entornos educativos.
- Aplicaciones en coreano y entornos bilingues: los benchmarks KMMLU y HAE-RAE muestran un rendimiento solido en coreano, por lo que encaja en productos dirigidos a ese mercado o en tareas de traduccion y atencion bilingue.
- Prototipado e investigacion con presupuesto de hardware limitado: la cuantizacion INT8 con fidelidad del 99,8% permite reproducir resultados del modelo BF16 en una GPU unica sin perder calidad apreciable.
- Despliegue multi-GPU cuando sea necesario: soporta `--tensor-parallel-size N` para repartir los pesos entre varias GPUs si no caben en una sola.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts estilo completion sin plantilla de chat. MMLU es la variante generativa (`mmlu_generative`), no comparable con MMLU por log-likelihood. Los porcentajes indican recuperacion respecto al BF16 original.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit (este repo) | NVFP4A16 | NVFP4 | AWQ-4bit |
|---|---|---|---|---|---|---|
| MMLU (5-shot, generative) | 55,18 | 57,99 (105,1%) | 54,79 (99,3%) | 60,58 (109,8%) | 58,61 (106,2%) | 60,89 (110,3%) |
| GSM8K (5-shot, strict) | 74,07 | 73,92 (99,8%) | 73,84 (99,7%) | 76,72 (103,6%) | 73,31 (99,0%) | 76,42 (103,2%) |
| ARC-Challenge (0-shot) | 54,61 | 53,92 (98,8%) | 54,52 (99,8%) | 54,86 (100,5%) | 53,92 (98,8%) | 54,35 (99,5%) |
| Winogrande (5-shot) | 68,75 | 67,96 (98,9%) | 69,14 (100,6%) | 68,90 (100,2%) | 69,38 (100,9%) | 68,90 (100,2%) |
| KMMLU (5-shot, direct) | 50,47 | 50,13 (99,3%) | 50,48 (100,0%) | 51,49 (102,0%) | 50,26 (99,6%) | 49,02 (97,1%) |
| HAE-RAE (0-shot) | 62,42 | 61,50 (98,5%) | 62,05 (99,4%) | 61,69 (98,8%) | 59,76 (95,7%) | 58,48 (93,7%) |
| **Media** | **60,92** | **60,90 (100,0%)** | **60,81 (99,8%)** | **62,37 (102,4%)** | **60,87 (99,9%)** | **61,34 (100,7%)** |

Evaluacion de fidelidad respecto al original BF16 sobre un conjunto interno mixto ingles/coreano (100 prompts, respuestas greedy del BF16 puntuadas bajo cada build):

| Metrica | Este modelo | BF16 original |
|---|---|---|
| Perplejidad (menor = mas cercano) | 1,5708 | 1,5703 (+0,0%) |
| Acuerdo top-1 en siguiente token | 98,5% | 99,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,0 GB solo para pesos; hay que sumar el KV cache (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs. En la practica, se recomienda al menos 10-12 GB de VRAM para contextos moderados y una sola peticion, y mas para contextos largos o concurrencia.
- GPU recomendadas: NVIDIA Turing (sm75) o superior; el autor indica que las pruebas se hicieron en una B200. No se soporta V100 (sm70). Cualquier GPU Ampere, Ada o Hopper con VRAM suficiente es valida.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), siempre que se ajuste `--max-model-len` y la concurrencia al presupuesto de VRAM.
- Opciones de despliegue: vLLM (runtime principal, requiere vLLM >= 0.17.0; probado con 0.32.0, Python 3.11-3.14, torch 2.13 con CUDA 13.0, transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0). Tambien es cargable con transformers >=5.2.0 + compressed-tensors >=0.15.0 sin vLLM. No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada (solo se indica que se ejecuto en B200).

## Comparativa con modelos similares

Comparativa con las otras cuantizaciones del mismo modelo base publicadas en la model card, que son las alternativas directamente equiparables en la informacion disponible:

| Modelo | Metodo | Tamano aproximado | Media benchmarks | Fidelidad vs BF16 |
|---|---|---|---|---|
| Qwen3.5-4B-AWQ-8bit (este repo) | AWQ INT8 W8A16 | ~6,0 GB | 60,81 (99,8%) | Perplejidad +0,0%, top-1 98,5% |
| Qwen3.5-4B FP8-dynamic | FP8 | No disponible | 60,90 (100,0%) | No disponible |
| Qwen3.5-4B NVFP4A16 | NVFP4 | No disponible | 62,37 (102,4%) | No disponible |
| Qwen3.5-4B NVFP4 | NVFP4 | No disponible | 60,87 (99,9%) | No disponible |
| Qwen3.5-4B AWQ-4bit | AWQ INT4 | No disponible | 61,34 (100,7%) | No disponible |

No se dispone de datos para comparar con modelos de otros proveedores de tamano o tarea similares en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion PTQ: aunque la fidelidad es alta (99,8% de media, perplejidad practicamente identica), no es bit-exacta respecto al BF16 y puede haber degradacion en tareas no evaluadas.
- El conjunto de calibracion (256 muestras, con fuerte carga de coreano) puede sesgar la proteccion de canales hacia ese dominio; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas de factualidad ni de sesgos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La longitud de contexto no se especifica en la model card; el ejemplo de despliegue usa 32.768 tokens, pero debe verificarse contra el modelo base antes de asumir un valor mayor.
- Restricciones de licencia: Apache-2.0, permite uso comercial; conviene revisar la licencia del modelo base enlazada por el autor.
- Requiere versiones muy concretas del stack: vLLM 0.32.0 fija transformers >=5.16.1,<5.20 y compressed-tensors 0.17.0; el autor advierte de no actualizar compressed-tensors por separado, ya que el checkpoint se guardo con 0.19.0.
- No soporta GPUs V100 (sm70); requiere Turing (sm75) o superior.
- Las metricas de benchmarks se midieron antes de la revision de los RMSNorm del 2026-11-01; el autor indica que los pesos cuantizados no cambiaron.
- No se dispone de `generation_config.json` (el original tampoco lo incluye), por lo que los parametros de generacion deben definirse en el cliente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axteam/Qwen3.5-4B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- vLLM: https://github.com/vllm-project/vllm
