# azampatti/Qwen3.5-122B-A7B-Int4

## Resumen

Qwen3.5-122B-A7B-Int4 es una variante podada y cuantizada del modelo MoE Qwen3.5-122B-A10B de Alibaba, desarrollada por el ingeniero independiente azampatti. El objetivo es ejecutar un modelo de ~122.000 millones de parámetros en un único nodo DGX Spark (GB10), reduciendo el coste computacional por token mediante dos técnicas: poda del número de expertos activos (de top-8 a top-4 sobre 256 expertos) y cuantización INT4 con auto-round. El resultado es un modelo que activa ~6,4 B parámetros por token (frente a ~10 B del original) y alcanza una velocidad media de 64,9 tok/s en un DGX Spark con vLLM parcheado.

La propuesta técnica incluye tres elementos clave: la poda selectiva de expertos, el "curado" del experto compartido mediante destilación contra el modelo base sin podar (manteniéndolo en BF16 para no degradar la corrección aprendida), y el reentrenamiento de la cabeza MTP (multi-token prediction) para mantener la eficacia de la decodificación especulativa. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para entornos de producción con vLLM, aunque requiere parches específicos para aprovechar todo su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos enrutados, top-4 activos, 1 experto compartido siempre activo, 48 capas transformer, atención GQA (32 cabezas de consulta, 2 KV) |
| Parametros totales | ~122 B (el archivo safetensors reporta 18.144.666.864, posiblemente conteo parcial) |
| Parametros activos | ~6,4 B incluyendo embeddings y LM head; ~4,9 B en las 48 capas MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | INT4 auto-round (grupo 128, simétrico) para la mayoría de módulos; BF16 para experto compartido, `shared_expert_gate`, routers y `mtp.fc` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.5-122B-A10B: un transformer MoE con 48 capas, 256 expertos enrutados (top-8 original) y un experto compartido siempre activo. La modificación principal es la reducción del top-k de 8 a 4, lo que divide a la mitad el cómputo de expertos enrutados y el tráfico de pesos por token. Los 256 expertos se conservan íntegramente; solo se seleccionan menos por token.

Para compensar la pérdida de precisión inherente a esta poda, se aplicó un proceso de "curado" del experto compartido: mientras el resto de la red permanecía congelado, este módulo se reentrenó en BF16 mediante destilación contra el modelo base sin podar. El experto compartido se mantiene deliberadamente sin cuantizar porque la cuantización introduciría ruido comparable en magnitud a la corrección aprendida, lo que degradaría el rendimiento. Además, la cabeza MTP (una capa MoE de 256 expertos usada para decodificación especulativa) también se vio afectada por la reducción del top-k y fue reentrenada con destilación KL contra el modelo objetivo. El checkpoint final incluye la mejor iteración de esta cabeza.

La cuantización INT4 se aplicó con auto-round (grupo 128, simétrico) a todos los módulos excepto el experto compartido, el gate del experto compartido, los routers y la capa final de la cabeza MTP, que permanecen en BF16. Esta configuración híbrida requiere parches específicos en vLLM para que los módulos BF16 no se desvíen de la ruta de cuantización fusionada; sin ellos, el rendimiento cae aproximadamente un 27 %.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de contexto de 262.144 tokens.
- Razonamiento y resolucion de problemas matematicos (el benchmark interno muestra 59,8 tok/s en tareas de matematicas).
- Generacion de codigo en multiples lenguajes, incluida la generacion de codigo largo (el benchmark LongCode alcanza 70,8 tok/s con 2026 tokens de salida).
- Soporte de tool calling y seleccion automatica de herramientas (se sirve con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`).
- Capacidades de agente con razonamiento multi-paso (se usa el parser de razonamiento `qwen3`).
- Decodificacion especulativa mediante cabeza MTP reentrenada, que acelera la generacion sin alterar la distribucion de salida.
- Generacion estructurada (JSON) con alta velocidad (64,0 tok/s en salida de 1024 tokens).
- Capacidades multimodales (image-text-to-text) segun las etiquetas de HuggingFace, aunque no se detallan en la model card.

## Casos de uso

- Generacion de codigo en produccion: con soporte de tool calling y una velocidad de 69-70 tok/s en tareas de codigo, puede integrarse en pipelines de CI/CD para generar tests, documentacion o parches. Su ventana de 262K tokens permite procesar repositorios completos como contexto.
- Asistente de programacion local en hardware de gama alta: en un DGX Spark (o similar con 128 GB de memoria unificada) se puede servir con vLLM para dar soporte a un equipo de desarrolladores con baja latencia (1,07 s para 64 tokens de salida).
- Razonamiento matematico y cientifico: su capacidad para mantener precision tras la poda (segun la model card, la calidad iguala al modelo base) lo hace util para resolver problemas de matematicas, fisica o ingenieria con pasos intermedios.
- Atencion al cliente automatizada: la ventana de contexto de 262K tokens permite mantener conversaciones largas con historial completo, y el soporte de tool calling facilita la integracion con sistemas de ticketing, CRM o bases de conocimiento.
- Procesamiento de documentos extensos: analisis de contratos, informes financieros o articulos cientificos de decenas de miles de tokens sin necesidad de truncamiento ni RAG.
- Desarrollo de agentes autonomos: la combinacion de razonamiento multi-paso, tool calling y decodificacion especulativa permite construir agentes que ejecutan tareas complejas (navegacion web, ejecucion de comandos, consulta a APIs) con un throughput superior al de modelos densos de tamano similar.
- Despliegue en edge/on-premise con restricciones de energia: al activar solo ~6,4 B parametros por token, el consumo energetico por consulta es significativamente menor que el de un modelo denso equivalente, lo que lo hace viable en nodos unicos sin refrigeracion especial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card afirma que tras el curado, la calidad iguala al modelo base sin podar, pero no proporciona numeros concretos.

Si se dispone de datos de throughput medidos en un DGX Spark (GB10 / SM121) con vLLM parcheado, MTP depth 3 y una sola secuencia:

| Workload | Output tokens | Tiempo | Throughput |
|---|---|---|---|
| Q&A | 256 | 4,19 s | 61,0 tok/s |
| Codigo | 488 | 7,06 s | 69,1 tok/s |
| JSON | 1024 | 15,99 s | 64,0 tok/s |
| Matematicas | 64 | 1,07 s | 59,8 tok/s |
| Codigo largo | 2026 | 28,59 s | 70,8 tok/s |
| **Media** | | | **64,9 tok/s** |

Con vLLM sin parchear, el throughput medio cae a 47,0 tok/s (un 27 % menos). Estos numeros son especificos del DGX Spark y no deben extrapolarse a otro hardware.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa ~65 GB en disco en INT4. Para inferencia, se necesita una GPU o sistema con al menos 80-100 GB de memoria disponible (teniendo en cuenta el cache KV y los overheads de vLLM). En un DGX Spark con 128 GB de memoria unificada, se recomienda `--gpu-memory-utilization 0.75` (unos 96 GB).
- GPU recomendadas: el modelo fue probado exclusivamente en DGX Spark (NVIDIA GB10, arquitectura SM121). No se ha validado en otras GPUs. En GPUs consumer, ninguna tarjeta actual tiene suficiente VRAM (la RTX 4090 tiene 24 GB, la RTX 5090 32 GB). Se necesitarian soluciones multi-GPU o cuantizaciones mas agresivas (por ejemplo, INT4 con pesos compartidos) no contempladas en este checkpoint.
- Opciones de despliegue: vLLM con parches especificos (https://github.com/azampatti/vllm-hybrid-int4-fp8-patches) sobre una imagen derivada de eugr/spark-vllm-docker. No se mencionan alternativas como llama.cpp, Ollama o TGI.
- Latencia y throughput: en DGX Spark, latencia de 1,07 s para 64 tokens de salida (59,8 tok/s) y hasta 70,8 tok/s en generacion de codigo largo. Con vLLM sin parchear, la media baja a 47,0 tok/s.
- Requisitos adicionales: se usa `--kv-cache-dtype fp8` para reducir el consumo de memoria del cache, y `--dtype bfloat16` para la computacion. El despliegue requiere Docker con `--privileged` y acceso a todas las GPUs.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A7B-Int4 (este) | ~122 B | ~6,4 B | 262 K | INT4 + BF16 hibrido | Apache 2.0 | DGX Spark, nodo unico |
| Qwen3.5-122B-A10B (base) | ~122 B | ~10 B | 262 K | BF16 (original) | Apache 2.0 | Multi-GPU o nodo con mucha memoria |
| Qwen3.5-35B-A3B | ~35 B | ~3 B | no disponible | no disponible | Apache 2.0 | GPUs consumer (24-32 GB) |

La comparativa con el modelo base es directa: el A7B-Int4 activa un 36 % menos de parametros por token (6,4 B vs 10 B) y ocupa mucho menos espacio en disco (~65 GB vs ~245 GB en BF16), a cambio de requerir parches especificos de vLLM y de no estar validado fuera del DGX Spark. Frente al Qwen3.5-35B-A3B, el A7B ofrece una ventana de contexto mucho mayor (262 K vs desconocida) y mas capacidad bruta, pero necesita hardware con al menos 96 GB de memoria, mientras que el 35B-A3B puede ejecutarse en GPUs consumer.

## Limitaciones y advertencias

- Solo se ha validado en DGX Spark (GB10 / SM121). No hay garantias de funcionamiento correcto en otras GPUs o arquitecturas, y los numeros de rendimiento no son extrapolables.
- Requiere parches no oficiales de vLLM (repositorio de azampatti) para alcanzar el rendimiento anunciado. Sin ellos, el throughput cae un 27 %.
- El proceso de poda y curado puede haber introducido degradaciones sutiles en tareas no cubiertas por la destilacion. La afirmacion de que "la calidad iguala al modelo base" no se respalda con benchmarks publicos.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad. El modelo se distribuye sin garantias de robustez en entornos de produccion.
- Los idiomas soportados no estan documentados; aunque Qwen3.5 base es multilingue, la poda y cuantizacion podrian afectar a lenguas de bajos recursos.
- El uso de decodificacion especulativa con MTP depth 3 requiere ajustar `VLLM_MTP_TOP_K=8` y `num_speculative_tokens=3`; una configuracion incorrecta puede degradar el rendimiento.
- El tamaño del vocabulario (248.320 tokens) implica un embedding y LM head de ~1,5 B parametros que se activan siempre, lo que limita el ahorro real de la poda en tareas de generacion corta.
- La licencia Apache 2.0 permite uso comercial, pero los parches de vLLM son de un tercero y no estan incluidos en la distribucion oficial de vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azampatti/Qwen3.5-122B-A7B-Int4
- Repositorio de parches vLLM: https://github.com/azampatti/vllm-hybrid-int4-fp8-patches
- Imagen Docker base usada para las pruebas: https://github.com/eugr/spark-vllm-docker
- Coleccion oficial Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Modelo base Qwen3.5-122B-A10B: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Discusion en foros de NVIDIA sobre recetas INT4 para DGX Spark: https://forums.developer.nvidia.com/t/fastest-qwen-3-5-122b-int4-recipe-on-dgx-spark-tested-and-published-on-spark-arena/370834/22
- Guia de Qwen 3.5 en local (comparativa 27B vs 35B-A3B vs 122B): https://insiderllm.com/guides/qwen35-local-guide-which-model-fits-your-gpu/
