# mmiiguell10/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión modificada del modelo Qwen3.8-27B de Alibaba, en la que se han eliminado las direcciones de rechazo (refusal directions) del espacio de pesos mediante una técnica conocida como abliteración. El resultado es un modelo que no se niega a responder a peticiones que el modelo original rechazaría, manteniendo un nivel de capacidad cercano al original. El autor del repositorio es mmiiguell10, aunque el trabajo se basa en la investigación del proyecto OBLITERATUS de elder-plinius.

El modelo tiene 26 895 998 464 parámetros (aproximadamente 26,9 mil millones) y está disponible en formatos safetensors, GGUF y MLX. Su licencia es Apache 2.0, lo que permite uso comercial. La versión V3 presentada en la model card logra una tasa de rechazo de 0/15 tanto con el modo de pensamiento activado como desactivado, con una regresión de solo -0,9 puntos porcentuales en MMLU (0-shot) respecto al modelo original. Está pensado principalmente para investigación en seguridad de IA, red teaming y evaluación de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3, tipo de atención no especificado) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (bfloat16), GGUF, MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de la familia Qwen3 desarrollada por Alibaba. No se dispone de detalles adicionales sobre su arquitectura interna (número de capas, dimensiones, tipo de atención) en la informacion proporcionada.

El proceso de abliteracion consiste en identificar y eliminar las direcciones en el espacio de pesos responsables del comportamiento de rechazo. La version V2 del modelo combina dos tecnicas complementarias: una cirugia agresiva basada en descomposicion en valores singulares (SVD) que captura la varianza de las direcciones de rechazo, y una cirugia moderada basada en LEACE (un metodo que minimiza la informacion mutua entre las representaciones y la etiqueta de rechazo). La mezcla optima encontrada fue 60% LEACE y 40% SVD, determinada mediante busqueda binaria sobre varios ratios. La version V3 aplica un refinamiento iterativo sobre la V2 usando un corpus ampliado de 1000 prompts (852 incorporados + 100 consultas simples + 48 avanzados de red teaming, agentes y ataques de ML).

No se ha realizado entrenamiento adicional con datos nuevos; la modificacion es puramente sobre los pesos existentes. El modelo no ha pasado por procesos de RLHF ni DPO adicionales.

## Capacidades

- Generacion de texto y conversacion multironda.
- Razonamiento paso a paso (modo thinking) disponible, aunque se recomienda desactivarlo para evitar reintroducir rechazos.
- Generacion de codigo en multiples lenguajes, incluyendo refactorizacion asincrona y depuracion.
- Soporte de tool calling y function calling, demostrado en tareas de agente ReAct con consultas SQL.
- Extraccion de esquemas JSON a partir de texto no estructurado.
- Capacidad para seguir instrucciones adversariales y realizar revisiones de seguridad de codigo.
- Diseño de sistemas distribuidos (por ejemplo, limitadores de tasa con Redis).
- Capacidades multilingues: no especificadas, pero al estar basado en Qwen3 es probable que soporte varios idiomas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite probar tecnicas de jailbreak y evaluar la robustez de los sistemas de seguridad sin las restricciones del modelo original, facilitando el estudio de los limites de los mecanismos de rechazo.
- Red teaming de sistemas de IA: los equipos de seguridad pueden usar este modelo para generar prompts adversarios y evaluar si sus propios sistemas de guardia son efectivos contra respuestas no censuradas.
- Desarrollo de agentes autonomos: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de agentes que necesitan ejecutar acciones como consultas SQL, llamadas a APIs o encadenamiento de herramientas.
- Generacion de codigo en entornos controlados: para pruebas de generacion de exploits o codigo de ataque en laboratorios de seguridad, donde el modelo original se negaria a cooperar.
- Evaluacion de sesgos y comportamientos no deseados: al eliminar los rechazos, se pueden estudiar los sesgos subyacentes del modelo base y su tendencia a producir contenido dañino, lo que ayuda a mejorar los sistemas de alineacion.
- Prototipado rapido de aplicaciones conversacionales: en entornos de desarrollo donde se necesita una generacion de texto sin restricciones (por ejemplo, ficcion oscura o roleplay), siempre que se cumplan las politicas de uso responsable.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (0-shot) y tasas de rechazo para las distintas versiones:

| Modelo | MMLU (0-shot) | n | Refusal rate (think OFF) | Refusal rate (think ON) |
|---|---|---|---|---|
| Stock Qwen3.8-27B | 84,6% | 2 850 | ~100% | ~100% |
| V1 (SVD agresivo) | 81,4% | 285 | 0% | no disponible |
| V2 (mezcla 60/40) | 84,3% | 2 850 | 0,24% (2/842) | ~33% (5/15) |
| **V3 (refinamiento)** | **83,7%** | no indicado | **0/15** | **0/15** |

En tareas avanzadas del mundo real (agente ReAct, refactorizacion de codigo, extraccion de esquemas JSON, depuracion de pods K8s, seguimiento de instrucciones adversariales, revision de seguridad de codigo y diseño de sistemas distribuidos), la V2 alcanza 7/8 aciertos, igual que el modelo stock. No se han publicado resultados de otros benchmarks como HumanEval, GSM8K o MMLU completo (14k preguntas) en la informacion disponible.

## Requisitos de hardware

- Inferencia en bfloat16 (safetensors): requiere aproximadamente 54 GB de VRAM (26,9 B parametros × 2 bytes), por lo que es necesario un GPU profesional como A100 80GB, H100 80GB o multiples GPUs en paralelo.
- Con cuantizacion GGUF Q4_K_M: el modelo ocupa alrededor de 15-16 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB) con margen para el contexto.
- Con cuantizacion GGUF Q8: alrededor de 27-28 GB, cabe en RTX 4090 pero con limitaciones de contexto.
- En Apple Silicon con MLX: puede ejecutarse en Macs con al menos 32 GB de memoria unificada (por ejemplo, M1 Pro/Max o superiores).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, LM Studio, TGI y cualquier framework compatible con safetensors o GGUF.
- La latencia y el throughput no estan especificados; dependen del hardware y la cuantizacion. Con una RTX 4090 y Q4, se pueden esperar velocidades de 20-40 tokens/s en generacion autoregresiva, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Refusal rate | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 26,9 B | no disponible | 84,6% | ~100% | Apache 2.0 |
| Qwen3.8-27B-OBLITERATED (V3) | 26,9 B | no disponible | 83,7% | 0% (en muestra de 15) | Apache 2.0 |
| OrcaRouter Qwen3.8-27B Uncensored MLX | 26,9 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos abliterados comparables en la misma escala. El modelo OrcaRouter mencionado en el blog de explainx.ai es una alternativa similar, pero no se han publicado sus metricas de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de sus mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o eticamente cuestionable. No debe utilizarse en sistemas orientados al publico sin fuertes medidas de filtrado posterior.
- La eliminacion de direcciones de rechazo puede degradar la calidad en algunas tareas; la V3 muestra una regresion de -0,9 pp en MMLU respecto al stock.
- El modo de pensamiento (thinking) puede reintroducir rechazos parciales, segun las pruebas del autor. Se recomienda mantenerlo desactivado para un comportamiento consistente.
- La configuracion optima requiere temperature 0 y repetition_penalty de 1,15; sin esta ultima, el modelo puede caer en bucles de generacion en codigo.
- El sistema prompt debe dejarse vacio; los prompts de sistema pueden reactivar comportamientos de rechazo.
- No se dispone de informacion sobre la longitud de contexto soportada ni sobre los idiomas exactos, lo que limita su uso en aplicaciones multilingues de produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco validado por la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, la responsabilidad legal y etica del contenido generado recae en el usuario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mmiiguell10/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio OBLITERATUS (investigacion y codigo): https://github.com/elder-plinius/OBLITERATUS
- Blog explainx.ai sobre Qwen3.8-27B OBLITERATED: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Blog explainx.ai sobre OrcaRouter (alternativa): https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Guia para ejecutar Qwen3.8-27B localmente: https://linas.substack.com/p/qwen3-8-27b-local-guide
