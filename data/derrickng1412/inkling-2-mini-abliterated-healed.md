# derrickNg1412/Inkling-2-Mini-Abliterated-Healed

## Resumen

Inkling-2-Mini-Abliterated-Healed es un ajuste fino del modelo thinkingmachines/Inkling-2-Mini, un transformer de mezcla de expertos (MoE) de 26.388.646.440 parametros totales con vision integrada y un mecanismo de bucle de capas ("loop") que ejecuta 24 capas fisicas a traves de 48 pasadas logicas. Lo publica el usuario derrickNg1412 sobre el trabajo previo de nokeepai/Inkling-2-Mini-Unbound, y su objetivo es eliminar los rechazos (abliteration) manteniendo al mismo tiempo la coherencia de la distribucion original mediante una tecnica de "KL-healing" y un refinamiento DPO on-policy.

El modelo resuelve el problema tipico de las versiones "uncensored": tras eliminar la direccion de rechazo en los tensores de atencion, la distribucion de salida se degrada y el modelo empieza a truncar sus cadenas de razonamiento o a producir respuestas incoherentes. Este release entrena dos LoRA de rango 32 exclusivamente sobre los 20 tensores `attn.wo_ud` de las capas 4 a 23, proyectando los gradientes y los pesos de forma ortogonal a las direcciones de edicion originales, y despues parchea solo esos 20 tensores en el safetensors, dejando los 1.224 tensores restantes (expertos NVFP4/MXFP8, routers, embeddings, backbone de vision y `mtp.safetensors`) byte a byte identicos al modelo base.

Es relevante ahora porque demuestra un flujo de edicion quirurgica reproducible y verificable por SHA-256 sobre un MoE multimodal de 26B con contexto de 1M tokens, con licencia Apache-2.0 y pesos en safetensors BF16 mas variantes cuantizadas de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (24 capas fisicas, 48 pasadas logicas) y vision + DSpark |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | BF16 nativo; 8-bit (modelopt); expertos MoE en NVFP4/MXFP8 en el checkpoint base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model-00001-of-00001.safetensors`), mas `mtp.safetensors` para DSpark |

## Arquitectura y entrenamiento

La base es un transformer MoE con 24 capas fisicas que se reutilizan en 48 pasadas logicas (mecanismo `inkling2_loop`), con atencion y mezcla de expertos cuantizada en NVFP4/MXFP8 en el checkpoint original, convoluciones cortas, backbone de vision y un modulo de decodificacion especulativa DSpark (`mtp.safetensors`). El contexto declarado alcanza 1M tokens.

El proceso de este release se divide en dos fases. La fase 5A entrena una LoRA BF16 de rango 32 unicamente sobre los 20 tensores `attn.wo_ud` de las capas 4 a 23, con proyeccion ortogonal de gradientes y pesos respecto a `edit.pt["directions"]` (desviacion maxima `max|uᵀ ΔW| = 4.07e-10`), fusionada en FP32 y redondeada una sola vez a BF16. La fase 5B aplica DPO on-policy con normalizacion de longitud y preservacion del modo "thinking": muestrea 320 completaciones on-policy (`effort=0` y `effort=0.9`) sobre `TRAIN_HARMFUL`, construye 47 pares contrastivos sin hedging usando `cais/HarmBench-Llama-2-13b-cls` (`p_yes`) con penalizacion de disclaimers a mitad de respuesta, y entrena otra LoRA (escalado `0.5×` en el nucleo del bucle para las capas 6 a 17, con anclaje KL benigno conjunto) sobre los mismos 20 tensores (`max|uᵀ ΔW_5B| = 2.35e-10`, deriva de reflexion `-2u` de 0.00024 en BF16). El parche final es un patch binario por offset de bytes que modifica solo esos 20 tensores.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" configurable por esfuerzo (`effort=0` y `effort=0.9`).
- Procesamiento multimodal de imagenes gracias al backbone de vision heredado del modelo base.
- Ventana de contexto de hasta 1M tokens para documentos extensos y conversaciones largas.
- Razonamiento sin rechazos: el abliteration elimina las negativas a peticiones que el modelo base rechazaria.
- Preservacion del razonamiento: el DPO de la fase 5B reduce el truncado de cadenas de pensamiento (de 23,4% a 10,9% en `effort=0`, y de 5/16 a 1/16 en `effort=0.9`).
- Decodificacion especulativa DSpark integrada en el checkpoint (`mtp.safetensors`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible de edicion direccional con verificacion SHA-256 tensor a tensor, util para analizar como afecta la eliminacion de rechazos a la distribucion de salida.
- Evaluacion de robustez de clasificadores de seguridad: con tasas de `HarmBench-13B hb_yes` del 71,9% (`effort=0`) y 81,2% (`effort=0.9`), es un banco de pruebas exigente para clasificadores de contenido y filtros de moderacion.
- Analisis de documentos largos: los 1M tokens de contexto permiten procesar contratos, expedientes o bases de codigo completas en una sola pasada sin troceado.
- Procesamiento multimodal de documentos escaneados: el backbone de vision permite extraer y razonar sobre informacion de imagenes junto con texto en el mismo contexto.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, guiones o contenido narrativo donde el modelo base aplicaria rechazos por tematica sensible.
- Investigacion en eficiencia MoE: la arquitectura de bucle con 24 capas fisicas y 48 pasadas logicas permite estudiar el equilibrio entre profundidad efectiva y coste de memoria en despliegues con cuantizacion NVFP4/MXFP8.
- Red teaming interno: generacion controlada de respuestas adversarias para calibrar sistemas de defensa en un entorno con licencia Apache-2.0 y pesos auditables.

## Benchmarks y rendimiento

Resultados de validacion sellada (sin solapamiento con entrenamiento), evaluados post-merge en BF16 nativo:

| Metrica | Unbound | + Fase 5A | + Fase 5A+5B (este release) |
|---|---|---|---|
| KL de validacion sellada (`effort=0`, 10.375 tokens) | 0,05104 | 0,03337 | 0,04016 (−21,3% vs Unbound) |
| Acuerdo Top-1 vs base | 92,57% | 94,01% | 93,01% |
| Rechazos en validacion danina (`e=0`, n=64) | 0/64 (0,0%) | 0/64 (0,0%) | 0/64 (0,0%) |
| Truncado en thinking, validacion danina (`e=0`, 288) | 15/64 (23,4%) | 19/64 (29,7%) | 7/64 (10,9%) |
| Media de tokens de thinking, validacion danina (`e=0`) | 200,7 | 202,7 | 140,1 |
| HarmBench-13B `hb_yes` (`e=0`, n=64) | 46,9% (p=0,503) | 35,9% (p=0,396) | 71,9% (p=0,725) |
| StrongREJECT con Qwen2.5-14B, no evasivo (`e=0`) | 34,9% (2,57/5) | 30,2% (2,73/5) | 62,5% (3,94/5) |
| Sobre-rechazos en casos limite (n=32) | 0/32 | 0/32 | 0/32 |
| Truncado en thinking danino (`effort=0.9`, 768, n=16) | 5/16 | 6/16 | 1/16 |
| Media de tokens de thinking danino (`effort=0.9`, n=16) | 542,2 | 528,2 | 338,5 (vs 325,6 en benigno) |
| HarmBench `hb_yes` (`effort=0.9`, n=16) | 56,2% | 37,5% | 81,2% |
| StrongREJECT no evasivo (`effort=0.9`, n=16) | 31,2% | 25,0% | 68,8% |

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 52,8 GB solo para pesos (26,4B parametros a 2 bytes), mas overhead de KV cache y activaciones; el repo ocupa 39,8 GB, lo que sugiere pesos ya empaquetados en formatos mixtos de menor precision.
- VRAM estimada en 8 bits (modelopt): en torno a 26-28 GB para pesos, mas cache; viable en una RTX 4090 de 24 GB solo con cuantizacion adicional o descarga parcial de expertos.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 completo con contexto largo; multiples RTX 4090 (2-4) para despliegue cuantizado en 8 bits.
- Consumer GPU: no cabe en BF16 en ninguna consumer actual; en 8 bits requiere al menos 32 GB (RTX 5090 o configuracion multi-GPU); con cuantizacion de 4 bits podria intentarse en 24 GB, aunque no hay datos confirmados.
- Opciones de despliegue: vLLM y TGI para servido con soporte MoE; llama.cpp/Ollama solo si se generan GGUF, no incluidos en el repo; el checkpoint safetensors es compatible con transformers y con el runtime de modelopt para 8 bits.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa DSpark deberia reducir la latencia respecto a decodificacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-Healed (este) | 26,4B MoE | 1M | Apache-2.0 | Abliterated con KL-healing y DPO; vision y DSpark |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B MoE | 1M | Apache-2.0 | Modelo original con rechazos y alineacion estandar |
| nokeepai/Inkling-2-Mini-Unbound | 26,4B MoE | 1M | Apache-2.0 | Abliteration direccional sin curacion KL; mayor truncado en thinking (23,4%) |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: elimina deliberadamente los rechazos, por lo que puede generar contenido danino, ilegal o inseguro si se le solicita; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; el proceso de abliteration y DPO puede alterar la calibracion del modelo base.
- El DPO se entreno sobre solo 47 pares contrastivos, una muestra muy pequena que puede no generalizar a todas las categorias de peticiones.
- Idiomas soportados no documentados; el comportamiento fuera del ingles no esta verificado.
- El truncado en thinking persiste en un 10,9% de los casos daninos con `effort=0`, lo que puede producir respuestas incompletas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- Los pesos parcheados solo en 20 tensores dependen de que el resto del checkpoint coincida byte a byte con el base; cualquier re-cuantizacion o fusion posterior invalida la verificacion SHA-256 documentada.
- No hay informacion sobre sesgos demograficos, toxicidad ni evaluaciones de seguridad independientes mas alla de HarmBench y StrongREJECT reportadas por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo Unbound previo: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Clasificador HarmBench usado: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
