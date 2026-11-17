# davidafrica/e2h-polaris-qwen3-4b-full-hard_mv

## Resumen

e2h-polaris-qwen3-4b-full-hard_mv es un ajuste fino del modelo Qwen/Qwen3-4B desarrollado por el usuario davidafrica, orientado especificamente a la resolucion de problemas matematicos. Se trata de un checkpoint de entrenamiento con GRPO (Group Relative Policy Optimization) obtenido tras 50 pasos de un run disenado para 1200 pasos, dentro de la iniciativa E2H (easy-to-hard) Polaris. El modelo parte de la arquitectura transformer densa de Qwen3-4B y conserva sus 4.411 millones de parametros.

El entrenamiento emplea el dataset Polaris-Dataset-53K, cuyos problemas se dividieron en bandas facil y dificil segun la tasa de acierto del propio Qwen3-4B con 16 muestras por problema. Este checkpoint concreto se entreno sobre la particion `train_hard`, compuesta por 16.335 problemas que el modelo base resolvio con baja frecuencia. La recompensa se construye por voto mayoritario entre 32 muestras por problema, usando `math_verify` como verificador de equivalencia, sin recurrir nunca a la respuesta de referencia.

Su relevancia es acotada pero tecnica: documenta un experimento de RL sobre razonamiento matematico con un protocolo de recompensa auto-supervisado (sin etiquetas de referencia) y publica evaluaciones en dos conjuntos disjuntos por dificultad. Al estar licenciado bajo Apache 2.0 y derivar de Qwen3-4B, es desplegable en hardware de consumo, aunque su utilidad practica queda limitada por el escaso numero de pasos completados y la ausencia de benchmarks estandar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer denso de aproximadamente 4.400 millones de parametros. El ajuste se realizo con un fork de verl 0.4.1 empleando GRPO, un algoritmo de optimizacion de politica con recompensas relativas dentro de grupos de muestras. La configuracion reportada incluye 64 prompts por paso, 32 muestras por prompt, tasa de aprendizaje de 1e-6, perdida KL de 0.001 con variante `low_var_kl` y respuestas de hasta 8192 tokens.

La innovacion metodologica reside en el esquema de recompensa: en lugar de comparar contra la respuesta de referencia, se generan 32 muestras por problema, se agrupan por equivalencia mediante `math_verify` y se etiqueta como respuesta canonica la que obtiene mas coincidencias. Cada muestra recibe recompensa si coincide con esa etiqueta mayoritaria. Este diseno evita depender de etiquetas doradas y convierte el entrenamiento en un proceso de consenso auto-supervisado. El checkpoint publicado corresponde al paso 50 de un run previsto para 1200 pasos, detenido tras el primer checkpoint.

## Capacidades

- Generacion de texto y razonamiento matematico: el ajuste se orienta especificamente a resolver problemas de matematicas de nivel competitivo y escolar avanzado.
- Razonamiento multi-paso: el entrenamiento con respuestas de hasta 8192 tokens favorece cadenas de razonamiento largas.
- Verificacion de equivalencia matematica: integrado en el pipeline de entrenamiento mediante `math_verify` (no es una capacidad de inferencia directa, pero condiciona el estilo de respuesta).
- Capacidades generales heredadas de Qwen3-4B: generacion de texto, codigo y comprension multilingue, aunque no se documentan explicitamente en la model card.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Resolucion automatizada de problemas matematicos: el modelo puede emplearse para generar soluciones paso a paso a problemas de algebra, calculo o aritmetica, aprovechando su entrenamiento especifico con GRPO sobre el dataset Polaris.
- Generacion de datos sinteticos de razonamiento: dado que el entrenamiento usa consenso entre 32 muestras, el modelo tiende a producir respuestas convergentes, lo que lo hace util para generar trazas de razonamiento destinadas a destilar otros modelos.
- Evaluacion de pipelines de verificacion matematica: sirve como banco de pruebas para integrar `math_verify` u otros verificadores en sistemas de correccion automatica.
- Investigacion en RL para razonamiento: el checkpoint documenta un protocolo reproducible (GRPO, recompensa por voto mayoritario, particiones easy/hard) que puede replicarse o extenderse en experimentos academicos.
- Tutoria matematica interactiva: con contexto multi-turno heredado de Qwen3-4B, puede gestionar dialogos de resolucion de ejercicios, aunque sin garantias de correccion formal.
- Prototipado en hardware de consumo: al tener 4.400 millones de parametros y pesos bf16 (8,8 GB de repo), es desplegable en GPUs de gama alta consumer para pruebas de concepto de razonamiento matematico.

## Benchmarks y rendimiento

La model card reporta evaluaciones en dos conjuntos internos, con 8 muestras por problema, comparando el paso 0 (modelo base) y el paso 50:

| Conjunto de evaluacion | Tamano | Descripcion | Paso 0 | Paso 50 |
|---|---|---|---|---|
| eval_all_small | 850 problemas (50 por cada nivel 0-16 de aciertos del base) | Muestra estratificada por dificultad | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| eval_hard_small | 1000 problemas | Problemas que el base no resolvio en 16 intentos | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

No se han publicado resultados numericos de benchmarks estandar (MMLU, GSM8K, HumanEval, MATH) en la informacion disponible. La model card menciona la existencia de estas evaluaciones pero no incluye las cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 12-16 GB para contextos moderados.
- VRAM en cuantizacion de 8 bits: aproximadamente 5-6 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 3-4 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 para despliegues de produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion 4 bits, en GPUs de 8 GB como RTX 3070.
- Opciones de despliegue: vLLM (soportado explicitamente en la model card), `transformers` con `AutoModelForCausalLM`, llama.cpp y Ollama mediante conversion a GGUF (no documentado por el autor, pero factible dado el formato safetensors).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-hard_mv | 4.411 M | no disponible | RL con GRPO para matematicas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | ~4.000 M | no disponible en la informacion proporcionada | Modelo base generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B | ~7.000 M | no disponible | Ajuste especifico para matematicas | Apache 2.0 (variantes) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 M | no disponible | Destilacion de razonamiento | MIT | Hugging Face |

La comparativa es orientativa: no se dispone de cifras de rendimiento del modelo evaluado en benchmarks estandar, por lo que la comparacion se limita a parametros, licencia y enfoque de entrenamiento. El checkpoint esta en una fase muy temprana (50 de 1200 pasos) y no se han publicado resultados que permitan situarlo frente a alternativas consolidadas.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo 50 pasos de un run previsto para 1200, lo que limita la magnitud del ajuste y su fiabilidad en produccion.
- Ausencia de benchmarks publicados: no hay cifras de MMLU, GSM8K, MATH ni HumanEval, lo que impide validar su rendimiento frente a alternativas.
- Riesgo de alucinacion matematica: el esquema de recompensa por consenso puede reforzar respuestas plausibles pero incorrectas si la mayoria de muestras converge en un error.
- Idiomas no documentados: la model card no especifica los idiomas soportados; se asume herencia de Qwen3-4B, pero no esta confirmado.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el ajuste.
- Sin garantias de correccion formal: el modelo no incluye un verificador en inferencia; las respuestas deben validarse externamente.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion estandar desaconseja su despliegue en produccion sin validacion previa.
- Dataset de entrenamiento especializado: el ajuste sobre `train_hard` puede degradar el rendimiento en tareas generales no matematicas.

## Enlaces

- Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-hard_mv
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Rama del checkpoint: `step-50` en el mismo repositorio de Hugging Face
- Repositorio verl: https://github.com/volcengine/verl
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
