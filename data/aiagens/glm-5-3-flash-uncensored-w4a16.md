# AIAgens/GLM-5.3-Flash-UNCENSORED-W4A16

## Resumen

GLM-5.3-Flash-UNCENSORED-W4A16 es una modificacion de pesos (tipo "abliterated" o "crack") del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario AIAgens y desarrollada por el equipo dealignai. El objetivo es eliminar el comportamiento de rechazo del modelo base mediante una edicion permanente en los tensores residual-writer en bf16, sin recurrir a fine-tuning, LoRA, hooks en tiempo de ejecucion ni trucos de prompt. El resultado es un modelo que responde de forma directa a peticiones que el original rechazaria, manteniendo intactas las capacidades de razonamiento, vision y generacion de codigo.

El modelo base, GLM-5.3-Flash, es un MoE hibrido de 321 000 millones de parametros totales (18 000 millones activos) con arquitectura glm5_next, 46 capas, atencion lineal KDA combinada con atencion dispersa DSA, y torre de vision. Esta version concreta parte de la cuantizacion W4A16 de JANGQ-AI, donde solo los expertos enrutados estan cuantizados a INT4 con grupo de 32, mientras que la atencion y los expertos compartidos permanecen en bf16. La ventana de contexto alcanza 131 072 tokens. La licencia es MIT, lo que permite uso comercial sin restricciones.

La relevancia de este modelo reside en su doble vertiente: por un lado, sirve como herramienta para red teaming y evaluacion de seguridad de sistemas de IA; por otro, demuestra que es posible eliminar el rechazo a nivel de pesos sin degradar el rendimiento medido en MMLU (85,58 %, identico al base). La version v2 aqui publicada corrige ademas un problema de bucles de razonamiento presente en la v1, reduciendo los casos de 7/320 a 2/640.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (MoE hibrido con atencion lineal KDA + atencion dispersa DSA, 46 capas) |
| Parametros totales | 321 323 031 390 (~321B) |
| Parametros activos | 18B (segun informacion publica del modelo base) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | W4A16 (INT4 group-32) en expertos enrutados; bf16 en atencion o_proj y expertos compartidos down_proj |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura MoE hibrida que combina atencion lineal KDA (kernel-based dual attention) con atencion dispersa DSA (dynamic sparse attention), disenada para reducir el coste computacional en contextos largos. Dispone de 46 capas, un encoder de vision (torre glm-4.1v) y una cabeza MTP (multi-token prediction) para decodificacion especulativa. En esta version cuantizada, solo los expertos enrutados se comprimen a INT4 con grupo de 32 mediante compressed-tensors; la atencion y los expertos compartidos se mantienen en bf16.

La modificacion "uncensored" consiste en una edicion directa de los tensores residual-writer en bf16, aplicada sobre el checkpoint W4A16 de JANGQ-AI. No hay entrenamiento adicional ni adaptadores: es un cambio permanente en los pesos que reduce el comportamiento de rechazo en una taxonomia amplia de categorias de dano multilingue. Los expertos cuantizados y la torre de vision pasan byte-identicos respecto al checkpoint base. El equipo dealignai reporta que la v2 corrige un problema de bucles de razonamiento presente en la v1, pasando de 7/320 a 2/640 casos, ambos relacionados con la reproduccion de estribillos de canciones.

## Capacidades

- Generacion de texto conversacional y de larga forma en 10 idiomas (ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano y japones).
- Razonamiento multi-step con parametro `reasoning_effort` configurable (off, low, max) para controlar la profundidad del razonamiento.
- Generacion de codigo y soporte de tool calling / function calling mediante el parser `glm45` en vLLM, con seleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Capacidades multimodales de vision: el encoder de vision del modelo base permanece intacto, permitiendo entrada de imagenes junto con texto.
- Decodificacion especulativa MTP (multi-token prediction) con tasa de aceptacion medida del 81,8 %, que multiplica por 12 el rendimiento frente a la ejecucion eager.
- Ausencia de rechazo: responde directamente a peticiones que el modelo base rechazaria, con una tasa de cumplimiento del 90,6 % (reasoning off) y 92,8 % (reasoning max) en HarmBench-320.
- Soporte de agentes y flujos multi-paso gracias a la combinacion de tool calling, razonamiento y contexto largo.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo permite a equipos de seguridad probar sistemas de moderacion y detectar vulnerabilidades en pipelines de IA generativa, generando respuestas que otros modelos rechazarian.
- Investigacion en alineacion y seguridad de IA: util para estudiar el comportamiento de modelos sin capas de rechazo, comparar estrategias de mitigacion y analizar el impacto de la ablacion de refusal en las capacidades generales.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas que los modelos censurados bloquean, aprovechando la ventana de 131K tokens para novelas completas.
- Desarrollo de agentes autonomos con tool calling: integrable en vLLM con el parser `glm45` y seleccion automatica de herramientas, adecuado para pipelines de automatizacion que requieren respuestas directas sin desvios.
- Analisis de documentos multimodales: la torre de vision intacta permite procesar imagenes, diagramas y capturas junto con texto, en tareas como extraccion de informacion de informes tecnicos o facturas.
- Evaluacion comparativa de cuantizacion: al mantener los expertos en INT4 y el resto en bf16, sirve como referencia para medir el impacto de la cuantizacion W4A16 en tareas de razonamiento y generacion.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados medidos por el autor:

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU (overall, 1026 preguntas) | 85,58 % | Identico al modelo base (delta +0,00 pp) |
| HarmBench-320 TRUE_COMPLY (reasoning off) | 90,6 % (290/320) | 4 SOFT_REFUSE, 0 HARD_REFUSE, 1 GARBAGE, 25 UNK |
| HarmBench-320 TRUE_COMPLY (reasoning max) | 92,8 % (297/320) | 4 SOFT_REFUSE, 0 HARD_REFUSE, 1 GARBAGE, 18 UNK |
| HarmBench-320 no-copyright (240 comportamientos) | 89,6 % (off) / 92,9 % (max) | Sin HARD_REFUSE ni GARBAGE en este subconjunto |
| Rendimiento inferencia (TP8, 8xH200, MTP on + CUDA graphs) | ~153 tok/s | Tasa de aceptacion MTP del 81,8 % |
| Rendimiento inferencia (TP8, 8xH200, enforce-eager) | ~12,8 tok/s | 12 veces mas lento; no recomendado |

No se han publicado resultados adicionales de benchmarks como HumanEval, GSM8K o MMLU-Pro en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 194,7 GB en disco. Con cuantizacion W4A16, los pesos del modelo requieren aproximadamente 160-180 GB en memoria, mas activaciones y cache KV. Se necesita un nodo multi-GPU.
- GPU recomendadas: 8x H200 (configuracion medida por el autor) o 8x A100 80GB. No cabe en una unica GPU consumer; se requieren al menos 4-8 GPUs de 80 GB.
- No es desplegable en GPU de consumo (RTX 4090, etc.) por el tamano de los pesos y la memoria necesaria.
- Opciones de despliegue: vLLM con soporte para `CompressedTensorsWNA16MoEMethod` (Marlin int4) y backend `FLASHINFER_MLA_SPARSE_SM90`. El `config.json` incluido corrige el regex de cuantizacion para que vLLM dispache correctamente los expertos enrutados.
- Latencia y throughput: ~153 tok/s en configuracion optima (TP8, MTP activado, CUDA graphs). El uso de `--enforce-eager` degrada el rendimiento a ~12,8 tok/s y debe evitarse.
- Recomendaciones de despliegue: activar `--enable-prefix-caching`, `--max-num-seqs 24` y `--max-model-len 131072`. No usar `--enforce-eager`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MMLU | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-W4A16 (este) | 321B total, 18B activo | 131K | W4A16 (INT4) | 85,58 % | MIT | Abliterado, vision intacta, MTP |
| GLM-5.3-Flash (zai-org) | 321B total, 18B activo | 131K | bf16 | 85,58 % (referencia) | MIT | Modelo base con rechazo |
| GLM-5.3-Flash-W4A16 (JANGQ-AI) | 321B total, 18B activo | 131K | W4A16 (INT4) | no disponible | MIT | Cuantizacion base sin ablacion |
| hell0ks/GLM-5.3-Flash-Uncensored-AWQ | 321B total, 18B activo | 131K | AWQ (W4A16) | no disponible | MIT | Variante uncensored con AWQ |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de modelos MoE de tamano similar con licencia MIT en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar el rechazo: puede generar contenido danino, ilegal o eticamente problematico. No debe desplegarse en produccion sin capas de moderacion externas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la ausencia de rechazo puede amplificar respuestas falsas con apariencia de autoridad.
- Se han detectado 2/640 casos de bucles de razonamiento en la reproduccion de estribillos de canciones con repeticion intensiva (modo "ooh, ooh, ooh"), que el autor atribuye a una peculiaridad del modelo y no a un colapso del rechazo.
- La cuantizacion W4A16 solo afecta a los expertos enrutados; la atencion y los expertos compartidos permanecen en bf16, lo que implica un uso de memoria superior al de una cuantizacion completa.
- El rendimiento de 153 tok/s se midio en hardware especifico (8x H200) con configuracion optimizada; en otros entornos puede ser significativamente menor.
- El drafter MTP es solo de texto: las entradas multimodales no propagan al draft, lo que reduce ligeramente el rendimiento en respuestas con vision.
- Aunque la licencia es MIT, el uso del modelo para actividades ilegales sigue sujeto a la legislacion aplicable. El autor no ofrece garantias de seguridad ni de idoneidad para uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AIAgens/GLM-5.3-Flash-UNCENSORED-W4A16
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Checkpoint cuantizado base: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-W4A16
- Variante AWQ uncensored: https://huggingface.co/hell0ks/GLM-5.3-Flash-Uncensored-AWQ
- Articulo sobre OrcaRouter GLM-5.3-Flash Uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Cliente de escritorio GLM-5.3-Flash (no oficial): https://github.com/glm-5-3-flash/glm-5.3-flash
