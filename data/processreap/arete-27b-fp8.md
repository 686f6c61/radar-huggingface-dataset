# processreap/Arete-27B-FP8

## Resumen

Arete-27B-FP8 es un checkpoint cuantizado en FP8 del modelo NousResearch/Arete-27B, publicado por el usuario processreap. Arete-27B es a su vez un ajuste fino supervisado (SFT) de Qwen3.8-27B realizado por Nous Research, orientado a reforzar valores occidentales y eliminar el encuadre estatal chino de las respuestas del modelo base. Este repositorio no modifica el comportamiento del modelo: reproduce los mismos pesos en 8 bits siguiendo exactamente la receta y el layout de Qwen/Qwen3.8-27B-FP8.

La relevancia de esta ficha es practica: el original en BF16 ocupa unos 54 GiB, lo que obliga a servir en dos tarjetas de 48 GB o a recurrir a cuantizacion en tiempo de carga. Este checkpoint reduce la descarga a 28,3 GiB (30,4 GB de repositorio) y carga directamente en vLLM sin flag de cuantizacion, manteniendo el layout tensor a tensor del checkpoint FP8 oficial de Qwen.

El modelo tiene 27.356.728.560 parametros (27,36B), arquitectura derivada de Qwen3.8 con atención lineal tipo DeltaNet en el modelo de lenguaje y una torre de vision copiada sin cuantizar. La licencia es Apache-2.0 tanto del modelo base como de la cuantizacion. No se han publicado resultados de benchmarks generales en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8 (modelo de lenguaje con capas de atención lineal DeltaNet; incluye torre de vision) |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 65.536 tokens verificados en el ejemplo de servicio (max-model-len 65536) |
| Tipos de cuantizacion | FP8 e4m3 con bloques de 128x128 y escala `scale_inv` en BF16; capas excluidas (normas, embeddings, lm_head, torre de vision, in_proj_a/b/ba) en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (28,3 GiB; repositorio de 30,4 GB) |

## Arquitectura y entrenamiento

El modelo base Arete-27B es un ajuste fino supervisado de Qwen3.8-27B llevado a cabo por Nous Research. La arquitectura subyacente es la de Qwen3.8, que combina capas de atención con proyecciones lineales de atención (`linear_attn.in_proj_qkv`, `in_proj_z`, `out_proj`) junto con una torre de vision. Arete-27B se entreno con la cabeza de prediccion multi-token (MTP) desactivada y no incluye pesos `mtp.*`, por lo que la decodificacion especulativa via MTP no esta disponible en este checkpoint.

Esta cuantizacion es estatica de pesos, sin datos de calibracion. El script `arete_fp8.py` recorre las cabeceras safetensors de Qwen3.8-27B-FP8 y aplica una regla por tensor: si Qwen almacena el tensor como `F8_E4M3`, se cuantiza el tensor homonimo de Arete en bloques de 128x128 con `scale_inv = amax / 448` en BF16; en caso contrario se copia sin cambios. El plan resultante cuantiza 400 tensores, copia 784 y omite 15 exclusivos de Qwen (todos `mtp.*`), para un total de 1584 tensores de salida. El error relativo de Frobenius medido en los tres primeros tensores cuantizados es de aproximadamente 0,026 (2,6%), coherente con la mantisa de 3 bits de e4m3.

## Capacidades

- Generacion de texto conversacional y text-generation en general, heredada del modelo base.
- Razonamiento con modo thinking configurable mediante `enable_thinking` en el chat template (el ejemplo de servicio lo desactiva por defecto).
- Tool calling y function calling compatibles con la API OpenAI de vLLM, con parser `qwen3_coder` y parser de razonamiento `qwen3`.
- Uso agéntico multi-paso: validado con 11/11 en un benchmark interno de agente de threat hunting, con 4-6 llamadas a herramientas por ejecucion y grader estricto.
- Capacidades de vision: la torre de vision se copia sin cuantizar, aunque el autor indica que no ha ejercitado la ruta de vision en este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Alineacion de valores: el fine-tune de Nous busca reforzar valores occidentales y reducir el encuadre propagandistico del modelo base (de 22% a 0,9% en su eval de 803 prompts).

## Casos de uso

- Agentes de ciberseguridad y threat hunting: el checkpoint ha sido validado en un benchmark interno de agente con 4-6 llamadas a herramientas por ejecucion, por lo que encaja en pipelines de investigacion automatizada de amenazas con tool calling estricto.
- Servicio de inferencia en dos GPU de 48 GB o menos: con 14,6 GiB de pesos por GPU en TP=2 y una cache KV de 806k tokens a 65k de contexto (12,3x de concurrencia), permite atender cargas conversacionales con contexto largo sin cuantizacion en tiempo de carga.
- Despliegue de codigo y asistentes de programacion: el soporte de tool calling con parser `qwen3_coder` y el modo thinking lo hacen apto para integraciones en pipelines de CI/CD y asistentes de IDE.
- Atencion al cliente automatizada multi-turno: la ventana de 65.536 tokens y el prefix caching habilitado permiten mantener conversaciones largas y reutilizar contexto entre peticiones.
- Evaluacion de alineacion y sesgos: util para comparar el comportamiento de un modelo post-entrenado para valores occidentales frente al base Qwen, usando el dataset Propaganda_Eval de Nous.
- Prototipado e investigacion en hardware Ampere: al usar el kernel MarlinFP8ScaledMM en GPUs sin computo FP8 nativo, sirve para experimentar con modelos de 27B en infraestructura de gama alta no Hopper.
- Inferencia con vision en modo experimental: cargando sin `--language-model-only` se activa la torre de vision copiada en BF16, aunque el autor advierte que no ha probado esa ruta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento publicados son de throughput y de una prueba agéntica interna.

| Metrica | Qwen3.8-27B-FP8 | Arete-27B-FP8 |
|---|---|---|
| Mean TTFT | 2318,6 ms | 2318,8 ms |
| Mean TPOT | 32,75 ms | 32,69 ms |
| Output throughput | 95,8 tok/s | 95,9 tok/s |

Condiciones: `vllm bench serve`, prompts aleatorios de 3000 tokens, salidas de 256 tokens, 16 peticiones con concurrencia 4, 2x RTX A6000 con TP=2, vLLM 0.33.0 (CUDA 13). Ademas, 11/11 en el benchmark interno de agente de threat hunting, identico al de Arete cuantizado en carga y dentro del ruido de Qwen3.8-27B-FP8. No se midio el original en BF16 ni la cuantizacion en tiempo de carga.

## Requisitos de hardware

- VRAM estimada: 14,6 GiB de pesos por GPU en TP=2 con `--gpu-memory-utilization 0.90`, lo que deja espacio para una cache KV de 806k tokens a 65k de contexto.
- GPU recomendadas: 2x RTX A6000 (Ampere, sm_86) probadas con NVLink; en Hopper o posteriores (H100, H200) se usarian GEMM FP8 nativos en lugar del kernel Marlin.
- Cabe en consumer GPU: no en una sola GPU de 24 GB; el checkpoint completo requiere dos tarjetas de 48 GB o equivalente en TP.
- Opciones de despliegue: vLLM (`vllm/vllm-openai` 0.33.0 probado), con `--tensor-parallel-size 2`, `--enable-prefix-caching`, `--language-model-only` y parsers `qwen3_coder` y `qwen3`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: TTFT medio de 2318,8 ms, TPOT medio de 32,69 ms y 95,9 tok/s de salida en la configuracion de prueba indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-FP8 (este) | 27,36B | 65.536 tokens | FP8 e4m3 bloques 128x128 | Apache-2.0 | Sin cabeza MTP; vision copiada sin cuantizar |
| NousResearch/Arete-27B | 27,36B | no disponible | BF16 | Apache-2.0 | Original, ~54 GiB, requiere cuantizacion en carga |
| Qwen/Qwen3.8-27B-FP8 | no disponible en la informacion | no disponible | FP8 e4m3 bloques 128x128 | Apache-2.0 | Referencia de layout y rendimiento; conserva pesos `mtp.*` |
| Qwen3.8-27B (BF16) | no disponible en la informacion | no disponible | BF16 | Apache-2.0 | Modelo base del que parte el fine-tune de Nous |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base es un fine-tune deliberado para reforzar valores occidentales; el autor no ha re-ejecutado la evaluacion de alineacion de Nous sobre este checkpoint, por lo que la preservacion exacta del comportamiento tras la cuantizacion no esta verificada.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de alucinacion en la informacion disponible.
- Limitaciones de contexto o idioma: el contexto maximo verificado es de 65.536 tokens; no hay datos sobre idiomas soportados ni sobre rendimiento fuera del ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del fine-tune original de Nous.
- Sin decodificacion especulativa MTP: Arete se entreno con la cabeza MTP desactivada y este checkpoint no incluye pesos `mtp.*`, por lo que no se puede acelerar la generacion por esa via.
- Vision no validada: la torre de vision se copia sin cuantizar, pero el autor no ha ejercitado esa ruta en este checkpoint.
- Rendimiento en Ampere: sin computo FP8 nativo, el kernel Marlin ejecuta FP8 solo de pesos; el rendimiento relativo frente a BF16 o a la cuantizacion en carga no se ha medido.
- Validacion agéntica limitada: el 11/11 corresponde a una unica tarea interna estrecha, no a una evaluacion general.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario extenso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/processreap/Arete-27B-FP8
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint de referencia FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Anuncio de Nous Research: https://nousresearch.com/arete
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/11/07/nous-research-arete-27b-qwen3-8-27b-propaganda-fine-tune/
- Dataset de evaluacion de alineacion: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
