# AxionML/Laguna-XS-2.1-NVFP4

## Resumen

Laguna-XS-2.1-NVFP4, publicado en el repositorio AxionML/Laguna-XS-2.1-NVFP4, es un espejo sin modificaciones de poolside/Laguna-XS-2.1-NVFP4 (revision `d32afde8b09af1539b49ff96ff5551c674485f8e`), que a su vez es la version cuantizada en NVFP4 de poolside/Laguna-XS-2.1. El modelo original lo desarrolla Poolside y es un Mixture-of-Experts de 33.442.617.168 parametros totales (33B) con 3B parametros activados por token, disenado para codificacion agentica y trabajo de ingenieria de software de largo horizonte sobre maquina local.

La cuantizacion NVFP4 reduce el checkpoint a unos 22 GB (21,6 GB de repositorio) manteniendo la ventana de contexto de 262.144 tokens, lo que permite servir un modelo con capacidad de resolucion de tareas SWE-bench en una unica GPU Blackwell. La arquitectura combina 10 capas de atencion global con 30 capas de sliding window attention y gating sigmoide por cabeza, lo que reduce el coste de cache KV y acelera la inferencia.

El interes actual del checkpoint es doble: por un lado, democratiza el despliegue local de un agente de codigo de 33B con contexto largo; por otro, es de los primeros pesos abiertos en formato NVFP4 nativo (codebook E2M1 con escalas FP8 E4M3 por micro-bloques de 16 elementos) listos para multiplicadores FP4 de los Tensor Cores de Blackwell. Frente a la version BF16, la perdida de calidad declarada es de 1,90 puntos en SWE-bench Verified y de 1,34 puntos en SWE-bench Multilingual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts); 40 capas (10 de atencion global + 30 de sliding window), atencion con gating sigmoide |
| Parametros totales | 33.442.617.168 (33B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (compressed-tensors `nvfp4-pack-quantized`, group size 16, escalas por bloque FP8 E4M3) en los MLP de expertos enrutados y compartidos; cache KV en FP8 (estatica por tensor). El modelo base poolside/Laguna-XS-2.1 se distribuye en BF16 |
| Idiomas soportados | no disponible (la model card no publica lista de idiomas; existe evaluacion SWE-bench Multilingual, que no implica una lista cerrada) |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en HuggingFace), sujeta a la Acceptable Use Policy de Poolside |
| Formato de pesos | safetensors con `compressed-tensors` (`nvfp4-pack-quantized`) |
| Tamano del checkpoint | ~22 GB (21,6 GB de repositorio) |
| Libreria | transformers (con `custom_code`) y `trust_remote_code` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos: 40 capas en total, de las cuales 10 usan atencion global y 30 usan sliding window attention con gating por cabeza (per-head gating). El gating de atencion es sigmoide, un diseno que en la documentacion de Poolside se asocia a inferencia rapida y a requisitos reducidos de cache KV, algo critico cuando la ventana de contexto llega a 262.144 tokens. Solo 3B de los 33B parametros se activan por token, de modo que el coste de computo por token es el de un modelo mucho mas pequeno, mientras que la capacidad total de almacenamiento de conocimiento es la de un modelo de 33B.

Laguna XS 2.1 es una version mejorada de Laguna XS.2, con una subida declarada de +5,4 % en SWE-bench Multilingual y mejor rendimiento en tareas de tipo terminal. Poolside menciona en su informacion publica el uso de data automixing y aprendizaje por refuerzo agentico asincrono off-policy (async off-policy agent RL) en el entrenamiento, aunque esta ficha no dispone del detalle del dataset ni del numero de tokens de entrenamiento. La cuantizacion se ha realizado con NVIDIA Model Optimizer.

## Capacidades

- Generacion de texto y razonamiento orientados a tareas de ingenieria de software y trabajo de largo horizonte.
- Codificacion agentica: resolucion de issues, modificacion de repositorios y ejecucion de tareas de varios pasos.
- Uso de terminal y tareas de estilo agente CLI (evaluado en Terminal-Bench 2.0).
- Tool calling / function calling, con parser dedicado (`--tool-call-parser poolside_v1`) y soporte de `--enable-auto-tool-choice` en vLLM.
- Parser de razonamiento (`--reasoning-parser poolside_v1`), lo que indica soporte de trazas de razonamiento separadas en la salida.
- Capacidad multilingue: existe evaluacion en SWE-bench Multilingual (61,83 en NVFP4), aunque no se publica la lista de idiomas soportados.
- Contexto largo de 262.144 tokens, util para analisis de repositorios completos o sesiones de agente prolongadas.
- Modo conversacional (tag `conversational`).
- Capacidades multimodales (vision o audio): no disponible; no se documentan.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).

## Casos de uso

- Agente de resolucion de issues en repositorios: el modelo puede analizar un repositorio completo dentro de sus 262.144 tokens de contexto, localizar el fichero afectado, aplicar un parche y verificar el resultado, con un 68,95 de pass@1 en SWE-bench Verified en su version NVFP4.
- Asistente de terminal y automatizacion de shell: su rendimiento en Terminal-Bench 2.0 (37,08) lo hace util para agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Integracion en pipelines de CI/CD: mediante tool calling en vLLM o SGLang, el modelo puede invocarse como paso de revision automatica de pull requests, con deteccion de regresiones y propuesta de cambios.
- Refactorizacion de codigo a gran escala: la combinacion de contexto largo y sliding window attention permite procesar modulos extensos sin truncar y mantener coherencia entre ficheros.
- Revision de codigo multilingue: su resultado en SWE-bench Multilingual (61,83) lo hace adecuado para equipos con bases de codigo en varios lenguajes de programacion.
- Despliegue local en estacion de trabajo con GPU Blackwell: con ~22 GB de pesos, es viable servir el modelo en una unica GPU de 32 GB o superior para uso individual o de equipo pequeno, sin depender de API externa.
- Generacion aumentada por recuperacion sobre documentacion tecnica: el contexto de 262k tokens permite inyectar manuales, ADRs y trazas de incidencias en una misma ventana.
- Automatizacion de migraciones de API o de dependencias: tareas de largo horizonte con multiples ediciones y validacion intermedia, donde el modo agente y el razonamiento multi-paso son relevantes.

## Benchmarks y rendimiento

Resultados publicados por Poolside para este checkpoint (mean pass@1, framework Harbor), comparando la version BF16 con la NVFP4:

| Benchmark | BF16 | NVFP4 |
|---|---|---|
| SWE-bench Verified | 70,85 ± 0,85 | 68,95 ± 0,90 |
| SWE-bench Multilingual | 63,17 ± 1,42 | 61,83 ± 1,42 |
| SWE-Bench Pro (Public) | 47,61 ± 0,96 | 47,06 ± 0,96 |
| Terminal-Bench 2.0 | 37,53 ± 2,81 | 37,08 ± 2,47 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 22 GB con la cuantizacion NVFP4 (21,6 GB de repositorio). El modelo base en BF16 requiere bastante mas; el dato concreto no esta disponible en la informacion proporcionada.
- Aceleracion nativa: NVFP4 esta disenado para los Tensor Cores FP4 de la generacion Blackwell; el rendimiento optimo requiere GPUs Blackwell (por ejemplo B200, GB200, RTX 5090 o RTX PRO 6000 Blackwell). En generaciones anteriores no se documenta aceleracion nativa FP4 y el comportamiento queda por verificar.
- GPU recomendadas: no disponible como lista oficial. Por tamano de pesos, una GPU Blackwell con 32 GB o mas resulta el minimo razonable para el checkpoint completo; para el contexto maximo de 262.144 tokens habria que sumar la cache KV en FP8, cuyo tamano por token no se publica.
- Cabe en consumer GPU: si, siempre que se trate de una GPU Blackwell con VRAM suficiente para los ~22 GB de pesos mas cache y activaciones; no se documenta soporte verificado en GPUs consumer de generaciones anteriores.
- Opciones de despliegue: SGLang (`python3 -m sglang.launch_server --model-path AxionML/Laguna-XS-2.1-NVFP4 --trust-remote-code`), vLLM (`vllm serve AxionML/Laguna-XS-2.1-NVFP4 --enable-auto-tool-choice --tool-call-parser poolside_v1 --reasoning-parser poolside_v1`) y Transformers, que detecta la cuantizacion automaticamente.
- Requisitos de version: la cache KV en FP8 necesita vLLM >= 0.22.0; el tool calling requiere una build de vLLM con el PR vllm#47311 (en su defecto, usar `--tool-call-parser glm47`). En SGLang, el soporte llega con sgl-project/sglang#24204.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AxionML/Laguna-XS-2.1-NVFP4 (este repositorio) | 33B / 3B | 262.144 tokens | OpenMDW-1.1 | Pesos abiertos en HuggingFace, cuantizacion NVFP4 |
| poolside/Laguna-XS-2.1 (base, BF16) | 33B / 3B | 262.144 tokens | OpenMDW-1.1 | Pesos abiertos en HuggingFace |
| poolside/Laguna-XS-2.1-NVFP4 (original de la cuantizacion) | 33B / 3B | 262.144 tokens | OpenMDW-1.1 | Pesos abiertos en HuggingFace |
| Laguna XS.2 (version anterior) | 33B / 3B (segun la descripcion de la familia) | no disponible | no disponible | Pesos abiertos; superado por XS 2.1 en +5,4 % en SWE-bench Multilingual |
| Laguna M.1 | 225B / 23B | no disponible | no disponible | Pesos abiertos; modelo de mayor escala de la misma familia |

La comparacion con alternativas de otros fabricantes (por ejemplo modelos de codigo de tamano similar) no esta disponible en la informacion proporcionada, ya que no se aportan resultados de benchmarks cruzados.

## Limitaciones y advertencias

- Sesgos y contenido danino: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; la version cuantizada hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Alucinacion: la model card advierte explicitamente de la posibilidad de generar contenido inexacto, algo especialmente relevante en generacion de codigo y en tareas de agente donde una accion erronea puede tener efectos reales.
- Idiomas: no se publica la lista de idiomas soportados, por lo que el rendimiento fuera del ingles no esta garantizado mas alla de lo que sugiere la evaluacion en SWE-bench Multilingual.
- Licencia: OpenMDW-1.1 permite uso comercial y no comercial segun la propia model card, pero queda supeditada a la Acceptable Use Policy de Poolside; conviene revisar ambos documentos antes de un despliegue en produccion.
- Cuantizacion: la perdida de precision frente a BF16 es medible (1,90 puntos en SWE-bench Verified, 1,34 en SWE-bench Multilingual, 0,55 en SWE-Bench Pro, 0,45 en Terminal-Bench 2.0). En tareas sensibles a precision numerica puede ser preferible el checkpoint BF16.
- Dependencias de version: el uso de la cache KV en FP8 exige vLLM >= 0.22.0 y el tool calling requiere un PR concreto, lo que complica despliegues en entornos con versiones fijadas.
- Naturaleza del repositorio: es un espejo de terceros (AxionML) de la publicacion de Poolside; conviene verificar la revision para asegurar la integridad de los pesos.
- Hardware: el rendimiento optimo depende de Tensor Cores FP4 (Blackwell); en hardware anterior el comportamiento y el rendimiento no estan documentados en la informacion disponible.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se publica el consumo de memoria de la cache KV por token, por lo que el requisito real de VRAM a contexto maximo debe medirse en el entorno de despliegue.

## Enlaces

- Repositorio en HuggingFace (este checkpoint): https://huggingface.co/AxionML/Laguna-XS-2.1-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Checkpoint NVFP4 original de Poolside: https://huggingface.co/poolside/Laguna-XS-2.1-NVFP4
- Anuncio de Laguna XS 2.1: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Anuncio de Laguna XS.2 y Laguna M.1: https://poolside.ai/blog/introducing-laguna-xs2-m1
- Ficha del modelo en NVIDIA NIM: https://build.nvidia.com/poolside/laguna-xs-2.1/modelcard
- NVIDIA Model Optimizer (herramienta de cuantizacion): https://github.com/NVIDIA/Model-Optimizer
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/24204
- PR de soporte de tool calling en vLLM: https://github.com/vllm-project/vllm/pull/47311
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Politica de uso aceptable de Poolside: https://poolside.ai/legal/acceptable-use-policy
- Informe tecnico de Poolside (mencionado en la model card, sin URL directa): no disponible
