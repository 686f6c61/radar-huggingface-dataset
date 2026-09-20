# JC1DA/DavidAu-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-INT4-INT8-Mixed

## Resumen

Este repositorio contiene una versión cuantizada en precisión mixta del modelo DavidAu/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, un ajuste comunitario sin censura construido sobre la arquitectura `qwen3_5` (clase `Qwen3_5ForConditionalGeneration`), de tipo multimodal texto y visión. Lo publica el usuario JC1DA y su aportación es exclusivamente de compresión: toma los pesos en bfloat16 del modelo original (unos 55,6 GB repartidos en 12 shards) y los recomprime a unos 25,1 GB con `compressed-tensors`, una reducción de aproximadamente el 55 por ciento.

Pese a la etiqueta "27B" del nombre, los safetensors declaran 13.385.005.810 parámetros, es decir, unos 13,4 B reales. El modelo conserva una ventana de contexto de 262.144 tokens, un vocabulario de 248.320 entradas y una arquitectura híbrida de 64 capas en la que solo una de cada cuatro utiliza atención completa, mientras que el resto emplea proyecciones de atención lineal. Esto lo sitúa en la categoría de modelos de contexto muy largo con coste de memoria de caché reducido, no en la de un transformer denso convencional.

Su relevancia práctica es doble. Por un lado, demuestra que una cuantización agresiva por capas (INT8 e INT4 mezclados con capas en BF16) puede mantener e incluso mejorar ligeramente la precisión en tareas de razonamiento científico: en GPQA Diamond obtiene un 82,8 por ciento frente al 81,8 por ciento del modelo en FP16, con una latencia media un 34 por ciento menor. Por otro, es un caso de estudio de nomenclatura y trazabilidad: el nombre del repo acumula convenciones de la escena de fine-tuning comunitario (TWIN-TURBO, Fable-Cold-Fusion, ULTRA-HERETIC) que no se corresponden con ningún modelo oficial de Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (Qwen3_5ForConditionalGeneration), multimodal texto + visión; 64 capas, híbrida de atención lineal con atención completa cada 4 capas |
| Parametros totales | 13.385.005.810 (~13,4 B) según safetensors; el nombre del repo indica "27B" |
| Parametros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Precisión mixta con `compressed-tensors`: INT8 W8A8 (143 capas, int-quantized), INT8 W8A16 (66 capas, pack-quantized), INT4 W4A16 grupo 128 (191 capas, pack-quantized); capas en BF16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors con `compressed-tensors` (8 shards principales + `model_extra_tensors.safetensors` de 0,85 GB) |
| Tamano del repo | 25,1 GB |
| Tamano de pesos declarado | 24,25 GB (post-cuantización) |
| Hidden size | 5120 |
| Cabezas de atencion | 24 Q / 4 KV en capas de atención completa; 16 key / 48 value en capas lineales |
| Dimension de cabeza | 256 (atención completa) / 128 (atención lineal) |
| Vocabulario | 248.320 tokens |
| Metodo de cuantizacion | `compressed-tensors` según Unsloth 2026.7.2 |
| Capas excluidas de la cuantizacion | 26 bloques de visión, proyecciones de atención lineal (`in_proj_a`, `in_proj_b`, `norm`, `linear_attn`) y `lm_head`, todos en BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas con hidden size 5120. Cada cuarta capa emplea atención completa con 24 cabezas de consulta y 4 de clave/valor y dimensión de cabeza 256; las 48 capas restantes usan atención lineal con 16 claves, 48 valores y dimensión de cabeza 128, lo que reduce drásticamente el coste de caché tanto en memoria como en cómputo para secuencias largas. El modelo es multimodal: incorpora 26 bloques de visión que se han mantenido íntegramente en BF16 durante la cuantización, al igual que las proyecciones de atención lineal y la cabeza de salida. La inclusión de los argumentos `--mamba-ssm-dtype bfloat16` y `--mamba-radix-cache-strategy extra_buffer` en los comandos de despliegue de la model card indica que el motor de inferencia gestiona componentes de tipo space-state con caché propia.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el ajuste del modelo original usó RLHF, DPO u otra técnica de alineación. Lo único documentado es que el modelo fuente corresponde a la variante interna "Stage2b-rplus3", etiquetada como ULTRA Heretic, con una tasa de 6 rechazos por cada 100 peticiones y una divergencia KL de 0,0397 respecto a su referencia, y que expone 5 modos de razonamiento y 5 modos instruct conmutables en caliente mediante `reasoning_effort`. Esta cuantización no introduce ningún entrenamiento adicional: es una conversión de precisión del modelo fuente, cuyo impacto medido se limita a GPQA Diamond.

La innovación técnica destacable del repo es la propia estrategia de cuantización por grupos. La model card describe tres regímenes simultáneos: 66 capas en W8A16 con cuantización por canal estática (pesos a 8 bits, activaciones en BF16), 143 capas en W8A8 con cuantización por canal y por token dinámica, y 191 capas en W4A16 con cuantización por grupo de tamaño 128 y estrategia estática. Adicionalmente, la model card documenta el uso del módulo MTP del modelo original como modelo borrador para decodificación especulativa EAGLE, con 3 pasos de especulación, top-k 1 y 4 tokens de borrador.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con 5 modos de razonamiento y 5 modos instruct conmutables en caliente mediante el parámetro `reasoning_effort` (el ejemplo de la model card usa el valor "spoon").
- Razonamiento científico y de opción múltiple con cadena de pensamiento: validado en GPQA Diamond con protocolo 0-shot CoT y barajado determinista de opciones.
- Procesamiento de imágenes: 26 bloques de visión mantenidos en BF16, al ser la clase del modelo `Qwen3_5ForConditionalGeneration` (texto + visión).
- Tool calling / function calling: la model card indica el parser `qwen3_coder` en SGLang, lo que implica soporte de llamadas a herramientas en formato compatible con Qwen3 Coder.
- Razonamiento agéntico y multi-paso: el uso de `--reasoning-parser qwen3` junto con el parser de herramientas permite separar el bloque de razonamiento de las llamadas a función en bucles de agente.
- Contexto muy largo: 262.144 tokens, con caché de atención completa reducida al emplear solo 16 de 64 capas con atención completa.
- Decodificación especulativa: soporte de EAGLE con el módulo MTP extraído del modelo FP16 como borrador.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo sin censura: la variante ULTRA Heretic reporta 6 rechazos por cada 100 peticiones, lo que implica una alineación de seguridad deliberadamente laxa.

## Casos de uso

- Atención al cliente automatizada con historiales largos: con 262.144 tokens de ventana, el modelo puede absorber conversaciones multi-turno de gran extensión o hilos completos de tickets sin truncar, y el modo instruct conmutable permite alternar entre respuestas rápidas y respuestas razonadas según la complejidad del caso.
- Análisis de documentación técnica extensa: contratos, normativa o documentación de API que superan lo que admite un modelo de 32k tokens se pueden procesar en una sola pasada, con el coste de caché contenido gracias a las 48 capas de atención lineal.
- Extracción de datos de documentos escaneados: los 26 bloques de visión en BF16 permiten leer facturas, albaranes o informes en imagen y devolver campos estructurados, encadenando después una llamada a herramienta para volcar el resultado en un sistema de gestión.
- Agentes de código en pipelines de CI/CD: el parser `qwen3_coder` y el parser de razonamiento `qwen3` de SGLang permiten integrar el modelo en un bucle de agente que lea el repositorio, ejecute herramientas, revise el diff y proponga parches, con el bloque de razonamiento separado del resultado final.
- Generación aumentada por recuperación sobre corpus técnicos: los 248.320 tokens de vocabulario y el contexto largo permiten inyectar muchos fragmentos recuperados sin recortes agresivos, mejorando la fidelidad de las respuestas sobre dominios especializados.
- Investigación en cuantización de precisión mixta: el repo es un caso reproducible de asignación diferenciada de bits por capa (W8A8, W8A16, W4A16 y BF16) con una comparación medida frente al modelo FP16 en GPQA Diamond, útil para estudiar qué capas toleran 4 bits sin degradar el razonamiento.
- Evaluación de seguridad y alineación en entorno controlado: la variante ULTRA Heretic, con 6 rechazos por cada 100 peticiones, es un material adecuado para medir tasas de cumplimiento de políticas, siempre que se ejecute en un entorno aislado y con fines de investigación.
- Despliegue self-hosted con presupuesto de memoria ajustado: los 25,1 GB del repo, frente a los 55,6 GB del modelo en bfloat16, permiten servir el modelo con dos GPUs de 24 GB en tensor paralelo 2, algo inviable con los pesos originales.
- Procesamiento por lotes offline: el modo de decodificación especulativa EAGLE con el módulo MTP reduce el número de pasos de decodificación, lo que resulta adecuado para clasificación, resumen o generación masiva de informes sin requisitos de latencia estrictos.

## Benchmarks y rendimiento

El único benchmark publicado en la información disponible es GPQA Diamond, comparado contra el modelo en FP16. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones, y la búsqueda web realizada no aportó resultados relevantes (devolvió páginas corporativas de Microsoft sin relación con el modelo).

| Metrica | W8A8 mixed (este repo) | Baseline FP16 |
|---|---|---|
| Precision en GPQA Diamond | 82,8 % (164/198) | 81,8 % (162/198) |
| Problemas evaluados | 198 (subconjunto Diamond completo) | 198 (subconjunto Diamond completo) |
| Protocolo | 0-shot CoT, opción múltiple, barajado determinista de opciones | 0-shot CoT, opción múltiple, barajado determinista de opciones |
| Tokens maximos de salida | 32.768 | 32.768 |
| Latencia media por peticion | 36,4 s | 54,9 s |
| Tokens de salida medios | 4.773 | 5.311 |
| Tokens totales de la ejecucion | 227.106 de entrada / 945.071 de salida | 227.106 de entrada / 1.051.530 de salida |
| Paralelismo | 8 peticiones concurrentes | 8 peticiones concurrentes |

A partir de estos datos se puede derivar una estimación de throughput agregado de salida de aproximadamente 1.050 tokens por segundo para la versión cuantizada (945.071 tokens de salida repartidos en unas 25 tandas de 8 peticiones a 36,4 s), frente a unos 990 tokens por segundo del baseline FP16. Se trata de una estimación derivada, no de un dato publicado por el autor.

## Requisitos de hardware

- Pesos en disco y en memoria: 24,25 GB declarados por la model card; el repositorio completo ocupa 25,1 GB, de los cuales 0,85 GB son tensores extra en BF16 (`model_extra_tensors.safetensors`).
- VRAM estimada para inferencia: por encima de 26-28 GB contando pesos y overhead de runtime, por lo que no cabe en una GPU de 24 GB con tensor paralelo 1. La configuración de referencia de la model card usa `--tp 2` con `--mem-fraction-static 0.85`.
- Caché KV con `fp8_e4m3`: solo las 16 capas de atención completa almacenan caché, con 4 cabezas KV y dimensión 256, lo que supone unos 2 KB por token y capa y aproximadamente 32 KB por token en total. A 32.768 tokens son unos 1,05 GB; a 262.144 tokens, unos 8,4 GB, a los que hay que sumar el estado de las capas lineales gestionado por la caché radix específica.
- GPU recomendadas: 2× RTX 3090 o 2× RTX 4090 de 24 GB con tensor paralelo 2; A100 de 40 u 80 GB; L40S de 48 GB; H100 de 80 GB. En una A100 80 GB o H100 80 GB podría ejecutarse con tensor paralelo 1 si el presupuesto de caché lo permite, aunque no está documentado.
- Cabe en GPU de consumo: sí, en pares de RTX 3090/4090 de 24 GB mediante tensor paralelo 2, que es exactamente el escenario del comando publicado. En una única GPU de consumo de 24 GB no cabe.
- Opciones de despliegue: SGLang es el motor documentado por el autor, con los flags `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder`, `--kv-cache-dtype fp8_e4m3`, `--mamba-ssm-dtype bfloat16`, `--mamba-radix-cache-strategy extra_buffer` y `--chunked-prefill-size 4096`. Para decodificación especulativa se añade `--speculative-algorithm EAGLE --speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4` apuntando al repo del módulo MTP. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; el formato `compressed-tensors` es específico del ecosistema de cuantización usado y no es directamente compatible con llama.cpp, que requeriría una conversión a GGUF (el modelo fuente sí publica variantes GGUF).
- Latencia y throughput: 36,4 s de latencia media por petición en GPQA Diamond con una media de 4.773 tokens de salida, 8 peticiones concurrentes y tensor paralelo 2. No hay cifras publicadas de latencia con contexto largo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks, licencia o especificaciones de modelos alternativos en la información proporcionada, y la búsqueda web no devolvió resultados relacionados. La única comparación con base empírica es contra el modelo del que deriva.

| Modelo | Parametros | Contexto | Precisión GPQA Diamond | Licencia | Formatos |
|---|---|---|---|---|---|
| Este repo (INT4/INT8 mixto) | ~13,4 B | 262.144 | 82,8 % | No disponible | Safetensors + compressed-tensors (25,1 GB) |
| DavidAU/Qwen3.8-27B-...-Uncensored (fuente, FP16/BF16) | ~13,4 B | 262.144 | 81,8 % | No disponible | 12 shards BF16 (~55,6 GB) |
| DavidAU/...-NM-DAU-NEO-MTP-GGUF (variante GGUF del origen) | No disponible | No disponible | No disponible | No disponible | GGUF |
| JC1DA/...-MTP-ONLY (módulo borrador EAGLE) | No disponible | No aplica | No aplica | No disponible | Safetensors |
| Alternativas de terceros de tamaño o tarea comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no especificada: la model card y las etiquetas del repositorio no declaran licencia, lo que impide determinar si el uso comercial está permitido. Al derivar de un fine-tune comunitario sobre una arquitectura Qwen, habría que verificar además las condiciones del modelo base original.
- Idiomas no documentados: no hay ninguna indicación de cobertura lingüística, por lo que el rendimiento en castellano es desconocido y debe evaluarse antes de usarlo en producción.
- Riesgo elevado de contenido inapropiado: la variante se etiqueta explícitamente como "Uncensored / ULTRA Heretic" y reporta solo 6 rechazos por cada 100 peticiones. Es inadecuada para aplicaciones orientadas al público sin una capa de moderación adicional y su uso conlleva responsabilidad legal y reputacional.
- Alucinación: no se publican métricas de fidelidad ni evaluaciones de veracidad. La única medida disponible es GPQA Diamond, que mide razonamiento científico de opción múltiple y no la tendencia a inventar hechos.
- Cobertura de evaluación mínima: un único benchmark (GPQA Diamond) no permite extrapolar el comportamiento en código, matemáticas, visión, multilingüismo o instrucciones largas. Las 143 capas en W8A8 y las 191 en W4A16 podrían degradar tareas no evaluadas, y la ausencia de comparación por tarea impide cuantificar ese riesgo.
- Discrepancia de nomenclatura: el nombre del repositorio indica "27B" pero los safetensors suman 13,4 B de parámetros. Esto puede provocar errores de planificación de hardware y de comparación con otros modelos.
- Contexto largo no verificado: los 262.144 tokens son una capacidad declarada de la arquitectura, pero no hay ninguna evaluación publicada a esa longitud, ni datos de degradación por posición ni de tiempo hasta el primer token.
- Estado del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, sin pipeline declarado en HuggingFace. No hay evidencia de validación por parte de terceros.
- Dependencia de SGLang: los comandos documentados dependen de flags muy específicos (`--mamba-ssm-dtype`, `--mamba-radix-cache-strategy`, `--default-chat-template-kwargs`) y del módulo MTP para la decodificación especulativa. Reproducir el rendimiento publicado fuera de ese stack no está garantizado.
- Naturaleza derivada: este repo no introduce entrenamiento propio. Cualquier sesgo, error factual o limitación del modelo fuente se hereda íntegramente; la cuantización solo añade el posible error numérico de la compresión.
- Riesgo de reproducibilidad: el benchmark se ejecutó con 8 peticiones concurrentes y protocolo de barajado determinista, condiciones que no se detallan por completo (hardware, versión exacta del motor, temperatura), lo que dificulta una réplica exacta.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/JC1DA/DavidAu-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-INT4-INT8-Mixed
- Modelo fuente en bfloat16: https://huggingface.co/DavidAu/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Variante GGUF del modelo fuente: https://huggingface.co/DavidAu/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Módulo MTP para decodificación especulativa EAGLE: https://huggingface.co/JC1DA/DavidAu-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-MTP-ONLY
- Resultados de la búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos correspondían a páginas corporativas de Microsoft sin relación con el modelo.
