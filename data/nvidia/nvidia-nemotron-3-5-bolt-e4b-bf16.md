# nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 es un modelo de lenguaje pequeno (SLM) publicado por NVIDIA, obtenido mediante post-entrenamiento a partir de google/gemma-4-E4B-it. Se distribuye en precision completa BF16 y esta orientado a asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas, es decir, escenarios donde la memoria disponible es escasa y el tiempo hasta el primer token (TTFT) es critico. NVIDIA declara 8.000 millones de parametros totales con 4.000 millones efectivos, lo que reduce el coste de computo por token.

El modelo conserva las capacidades conversacionales de la familia Gemma 4 y anade mejoras en uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de la entrada (input grounding). Incorpora un modo de razonamiento controlable desde la plantilla de chat (`enable_thinking=True/False`) con presupuesto de pensamiento ajustable en tiempo de ejecucion, ademas de un modo conversacional conmutable. La ventana de contexto alcanza 64K tokens tanto en entrada como en salida.

Su relevancia actual reside en la combinacion de tamano reducido, contexto amplio, soporte explicito de function calling y un ecosistema de despliegue ya preparado: checkpoint BF16 para vLLM, un drafter DFlash en NVFP4 para decodificacion especulativa y una variante cuantizada Q4_K_M de 4 GB para entornos con poca VRAM. Se publica bajo licencia OpenMDW-1.1 y NVIDIA lo declara apto para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (derivada de google/gemma-4-E4B-it); detalles de capas y atencion no disponibles |
| Parametros totales | 7.996.156.490 (8B) |
| Parametros activos | 4B efectivos segun la model card; configuracion de computo condicional no detallada (no disponible) |
| Longitud de contexto | 64K tokens de entrada y 64K tokens de salida |
| Tipos de cuantizacion | BF16 (esta release); Q4_K_M en la variante NVIDIA-Nemotron-3.5-Bolt-E4B-4GB; NVFP4 en el drafter DFlash |
| Idiomas soportados | 33: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (libreria transformers); repositorio de 16,1 GB |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como Gemma-4-E4B, es decir, un modelo derivado del checkpoint multimodal google/gemma-4-E4B-it que NVIDIA ha sometido a un post-entrenamiento adicional. La nomenclatura E4B y la indicacion "8B (4B effective)" apuntan a un esquema de parametros efectivos por token, pero la informacion disponible no detalla el numero de expertos, el mecanismo de enrutado ni la estructura exacta de capas. La precision de publicacion es BF16 y el modelo se empaqueta para transformers, con plantilla de chat propia (`chat_template.jinja`) que expone los controles de modo conversacional y de razonamiento.

En cuanto a datos, NVIDIA referencia los conjuntos nemotron-pre-training-datasets y nemotron-post-training-v3, y situa la fecha de corte de los datos de post-entrenamiento en mayo de 2026, con un desarrollo comprendido entre diciembre de 2025 y mayo de 2026. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas concretas de RLHF, DPO o RL verificable. La innovacion operativa mas destacable es la decodificacion especulativa DFlash: existe un drafter dedicado en NVFP4 que se combina con el checkpoint BF16 en vLLM para reducir la latencia, con un ejemplo oficial configurado con una secuencia concurrente y siete tokens especulativos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Gemma 4 y reforzada mediante post-entrenamiento.
- Modo de razonamiento conmutable mediante plantilla de chat (`enable_thinking=True/False`) y presupuesto de pensamiento ajustable en tiempo de ejecucion.
- Modo conversacional conmutable (`conversational_mode=True/False`) para alternar entre respuestas dialogicas y respuestas mas directas.
- Tool calling y function calling integrados, con soporte nativo en vLLM mediante `--enable-auto-tool-choice` y los parsers `gemma4` para herramientas y razonamiento.
- Uso de herramientas multi-turno, una de las areas que NVIDIA declara explicitamente mejoradas respecto al modelo base.
- Seguimiento de instrucciones y anclaje de la entrada (input grounding), orientados a reducir desviaciones respecto al contexto proporcionado.
- Cobertura multilingue en 33 idiomas, incluidos espanol, ingles, aleman, frances, italiano, portugues, arabe, hindi, japones, coreano, chino, turco, vietnamita y la mayoria de lenguas eslavas y nordicas.
- Entrada y salida declaradas como texto; aunque el tag de HuggingFace incluya `image-text-to-text` (heredado del modelo base), la model card especifica Text / text y la receta oficial de vLLM desactiva imagen, video y audio con `--limit-mm-per-prompt`.
- Capacidades de codigo y matematicas: no documentadas de forma especifica en la informacion disponible.

## Casos de uso

- Asistentes de voz locales: el modelo esta disenado para operar con baja memoria y bajo TTFT, de modo que un dispositivo puede transcribir, razonar y responder en pocos cientos de milisegundos sin depender de la nube; NVIDIA ilustra este escenario con un brazo robotico Reachy.
- Interfaces embebidas y edge computing: la variante Q4_K_M de 4 GB permite ejecutar el modelo en hardware con VRAM limitada, manteniendo disponible la ventana de 64K tokens para contextos de sesion largos.
- Agentes con tool calling multi-turno: gracias al soporte nativo de function calling en vLLM y a las mejoras declaradas en uso de herramientas multi-turno, el modelo puede encadenar llamadas a APIs (calendario, clima, busqueda interna) manteniendo el estado de la conversacion.
- Personas interactivas y companeros virtuales: el modo conversacional conmutable y la temperatura recomendada de 1,0 con top_p 0,95 favorecen respuestas variadas y naturales en dialogos prolongados.
- Atencion al cliente automatizada en varios idiomas: con 33 idiomas soportados y 64K tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y documentacion de soporte inyectada en el prompt.
- Asistente de escritorio o IDE offline: al ejecutarse en local no requiere enviar codigo o datos sensibles a un servicio externo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Prototipado rapido de agentes en investigacion: el checkpoint BF16 permite post-entrenamiento y evaluacion en precision completa, y el drafter DFlash acelera la iteracion sobre tareas de decodificacion larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones multilingues, y la busqueda web realizada no ha devuelto datos de evaluacion del modelo. Tampoco se han encontrado cifras de throughput (tokens/s) ni de latencia (TTFT) mas alla de la afirmacion cualitativa de que el modelo esta optimizado para baja memoria y bajo TTFT.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 16 GB, coherente con un repositorio de 16,1 GB y 8.000 millones de parametros a 2 bytes por parametro.
- Configuracion oficial de referencia: una unica H100 con `--tensor-parallel-size 1`, `--gpu-memory-utilization 0.85`, `--max-model-len 65536` y `--max-num-seqs 64`. Con esos ajustes, el KV cache para 64 secuencias concurrentes y 64K de contexto cabe en los 80 GB de la GPU.
- GPU profesionales recomendadas: H100 (configuracion validada por NVIDIA) y, por capacidad de memoria, A100 80 GB o H200. En A100 40 GB el contexto maximo y el numero de secuencias simultaneas quedarian limitados por el KV cache (estimacion, no verificada en la informacion disponible).
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos BF16 (unos 16 GB), pero el margen para KV cache a 64K tokens es reducido; para uso comodo en consumer se recomienda la variante Q4_K_M de 4 GB (NVIDIA-Nemotron-3.5-Bolt-E4B-4GB), pensada para escenarios de baja memoria. Estimacion basada en el tamano de los pesos, no confirmada por el autor para hardware consumer.
- Opciones de despliegue documentadas: vLLM v0.31.0 (imagen `vllm/vllm-openai:v0.31.0`), con soporte de decodificacion especulativa DFlash usando el drafter NVFP4. La informacion disponible no confirma soporte de llama.cpp, Ollama ni TGI.
- Aceleracion: la configuracion DFlash de ejemplo usa una secuencia concurrente y siete tokens especulativos; las cifras de mejora de latencia o throughput no estan publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales, 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | safetensors BF16 | Checkpoint de referencia, orientado a personalizacion y evaluacion en precision completa |
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | 8B totales, 4B efectivos | No disponible en la informacion | OpenMDW-1.1 | Q4_K_M | Misma familia cuantizada a 4 GB para edge y baja VRAM |
| google/gemma-4-E4B-it | No disponible | No disponible | No disponible en la informacion | No disponible | Modelo base multimodal del que deriva; Nemotron anade post-entrenamiento en tool use, instruction following y grounding |
| Otros SLM de 4-8B (Qwen, Llama, Phi) | No disponible | No disponible | No disponible | No disponible | Sin datos de comparacion en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria; la comparativa anterior se limita a datos estructurales verificables.

## Limitaciones y advertencias

- Solo texto: la model card declara entrada y salida de texto y la receta de vLLM desactiva explicitamente imagen, video y audio, pese al tag `image-text-to-text` heredado del modelo base multimodal.
- Fecha de corte de los datos de post-entrenamiento: mayo de 2026; el modelo no conoce hechos posteriores.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan en el material proporcionado analisis de sesgo, evaluaciones de seguridad ni red-teaming.
- Idiomas: se declaran 33 idiomas, pero no se publican metricas de calidad por idioma; el rendimiento fuera del ingles puede ser desigual.
- Licencia OpenMDW-1.1: NVIDIA declara el modelo apto para uso comercial y no comercial, pero es una licencia propia distinta de Apache 2.0 o MIT; conviene revisar los terminos completos antes de integrarlo en un producto.
- Model card truncada en la informacion disponible: faltan las secciones de evaluacion, consideraciones eticas y limitaciones detalladas del autor, que deberian consultarse antes de un despliegue en produccion.
- Herramientas de despliegue: la informacion solo valida vLLM v0.31.0; el soporte en llama.cpp, Ollama o TGI no esta confirmado.
- Modo de razonamiento: el presupuesto de pensamiento anade tokens de salida que consumen contexto y aumentan la latencia; debe ajustarse segun la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante cuantizada Q4_K_M (4 GB): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Drafter DFlash NVFP4 para decodificacion especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16-DFlash-NVFP4
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper referenciado en los tags de HuggingFace (arXiv 2509.04292): https://arxiv.org/abs/2509.04292
