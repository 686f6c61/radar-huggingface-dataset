# hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-r4-154711-20261015

## Resumen

El modelo `hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-r4-154711-20261015` es un ajuste fino por aprendizaje por refuerzo de `ByteDance/Ouro-1.4B-Thinking`, un modelo de lenguaje de 1,4 mil millones de parámetros perteneciente a la familia Ouro de ByteDance, basada en capas recurrentes (looped language model, LoopLM). El autor del ajuste es el usuario de HuggingFace `hi-todayis-jh`, y el resultado se publica como un artefacto de investigación reproducible más que como un modelo listo para producción.

El entrenamiento emplea la receta GRPO de la librería verl 0.6.1 mediante una extensión propia (`verl_trainer`), con el algoritmo identificado como `rltt` en modo `native`, sobre el split de entrenamiento del dataset `DigitalLearningGmbH/MATH-lighteval`, es decir, problemas de matemáticas de nivel competición. La ejecución consta de 100 pasos de rollout y se documenta con manifiesto, configuración resuelta, código de lanzamiento, log de entrenamiento y recibos de verificación de cada fichero.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de un pipeline completo de RL con verl sobre una arquitectura no estándar (LoopLM con política de salida anticipada); por otro, el repositorio publica tanto los shards FSDP de verl como el modelo ya fusionado en formato HuggingFace, cargable directamente con `transformers`. El repositorio tiene 0 descargas y 0 likes, y en el momento de redactar esta ficha su tamaño declarado es de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas recurrentes (looped language model, LoopLM) segun los tags del autor y el modelo base Ouro de ByteDance |
| Parametros totales | 1,4 mil millones (derivado del identificador y del modelo base `ByteDance/Ouro-1.4B-Thinking`) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni ficheros GGUF en la informacion proporcionada) |
| Idiomas soportados | no disponible (el dataset de entrenamiento es MATH-lighteval, de enunciados en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en `actor/huggingface/`) y shards FSDP `.pt` de verl (`actor/model_world_size_W_rank_R.pt`) |
| Modelo base | ByteDance/Ouro-1.4B-Thinking |
| Dataset de entrenamiento | DigitalLearningGmbH/MATH-lighteval (split de entrenamiento) |
| Framework de entrenamiento | verl 0.6.1, extension `verl_trainer`, algoritmo `rltt`, modo `native` |
| Pasos de entrenamiento | 100 pasos de rollout (job Slurm 154711, nodo `orchard-flame-18`) |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `ByteDance/Ouro-1.4B-Thinking`, etiquetada por el autor como *looped language model*. En esta familia, un bloque de capas se reaplica de forma recurrente sobre la representacion latente, de modo que la profundidad efectiva de computo puede desacoplarse del numero de capas fisicas. El checkpoint fusionado incluye el codigo de modelado de Ouro (`modeling_ouro.py`, `configuration_ouro.py`) y un `policy_config.json` con la politica de salida, lo que implica que la inferencia requiere `trust_remote_code=True`. La configuracion de entrenamiento usa `--exit_mode fixed` y `--cache_rule full_depth`, es decir, una politica de salida fija y cache a profundidad completa durante el RL.

El ajuste se realiza con la receta GRPO de verl 0.6.1 sobre problemas de MATH. Los hiperparametros documentados son: `--learning_rate 1e-6`, optimizador `AdamW8bit` con betas `0.9 0.99`, `--max_grad_norm 1.0`, coeficiente KL `--beta 0.001`, `--length_penalty_alpha 0`, `--l1_mode none`, `--cost_gradient score` y `--ppo_micro_batch_size_per_gpu 4`. El motor de generacion de rollouts es vLLM con `--vllm_gpu_memory_utilization 0.65`. El autor no define en la model card el significado del acronimo `rltt` ni detalla la composicion exacta del dataset mas alla del nombre del conjunto; tampoco indica si hubo una fase previa de SFT, DPO o RLHF adicional. Los rollouts generados durante el entrenamiento se publican como dataset aparte.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento explicito: el modelo base es la variante `-Thinking`, orientada a producir cadenas de razonamiento antes de la respuesta.
- Resolucion de problemas matematicos: es la capacidad sobre la que se optimiza el RL, con recompensa derivada de MATH-lighteval.
- Razonamiento multi-paso: el entrenamiento con GRPO sobre problemas de competicion refuerza la produccion de soluciones estructuradas paso a paso.
- Carga directa en `transformers`: el checkpoint fusionado se carga sin fusion manual mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- Politica de salida anticipada configurable: el repositorio incluye `policy_config.json`, heredado del diseno LoopLM, que en este run se fija en modo `fixed`.
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y planificacion de multiples pasos con herramientas: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Vision, audio o entradas multimodales: no disponible.

## Casos de uso

- Generacion de soluciones matematicas de nivel competicion: el modelo se ha optimizado especificamente sobre MATH, por lo que es adecuado para producir soluciones desarrolladas paso a paso en problemas de algebra, teoria de numeros, geometria y calculo.
- Generacion de datos sinteticos de razonamiento: sus rollouts ya se han publicado como dataset; puede reutilizarse para producir trazas de razonamiento que alimenten tecnicas de destilacion o de SFT en modelos mayores.
- Tutorizacion automatica de matematicas: con 1,4B de parametros puede desplegarse por detras de un sistema de dialogo que pida la resolucion paso a paso de un ejercicio y la explique al estudiante.
- Verificacion y reranking de cadenas de razonamiento: dado un conjunto de soluciones candidatas a un problema, el modelo puede puntuar o completar pasos intermedios dentro de un pipeline de *best-of-n*.
- Investigacion en RL para arquitecturas recurrentes: sirve como referencia reproducible de un run GRPO completo (manifiesto, configuracion de verl, codigo parcheado, recibos) para estudiar el efecto del RL sobre modelos con capas reaplicadas.
- Experimentacion con decodificacion adaptativa al computo: la existencia de `policy_config.json` y de los modos de salida permite estudiar politicas de salida anticipada con distinto coste computacional.
- Prototipado en hardware de gama de consumo: por su tamano, es viable para pruebas locales de razonamiento matematico en una unica GPU consumer, siempre que el codigo de modelado de Ouro se ejecute correctamente.
- Evaluacion de tecnicas de cuantizacion sobre modelos LoopLM: util para medir como afecta la cuantizacion a una arquitectura con pesos reutilizados en bucle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MATH, GSM8K, MMLU ni de ningun otro conjunto de evaluacion. El autor referencia un proyecto de Weights & Biases (`ouro-1.4b-grpo-rltt-math`, run `verl-rltt-native-r4-154711-20261015`) y un dataset de rollouts donde podrian consultarse metricas de entrenamiento, pero esos valores no forman parte de la informacion proporcionada y no deben inferirse.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 1,4B parametros, estimaciones propias a partir del tamano): en bf16/fp16 en torno a 3-5 GB de pesos mas cache KV y activaciones, tipicamente 5-8 GB en total; en int8 en torno a 1,5-2 GB de pesos; en 4 bits en torno a 0,8-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en bf16 para secuencias cortas; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una L4 o una A10 cubren el caso con holgura. Para servir en paralelo con lotes grandes conviene A100 o H100, aunque no son necesarias por tamano.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores, e incluso en 6 GB con cuantizacion agresiva, siempre que la implementacion del LoopLM lo permita.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` sobre el directorio `actor/huggingface/` del paso deseado; vLLM, que ya se uso para los rollouts durante el entrenamiento; el resto de opciones habituales (llama.cpp, Ollama, TGI, SGLang) dependen de que exista soporte para la arquitectura LoopLM, y en la informacion disponible no se confirma ninguno.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo, y el coste real depende del numero de reaplicaciones del bucle y de la politica de salida configurada, que en este run es `fixed` con cache `full_depth`.

## Comparativa con modelos similares

No hay cifras de rendimiento publicadas para este modelo, por lo que la comparacion se limita a parametros, licencia y disponibilidad de formatos. Los datos de contexto y de evaluacion de los modelos alternativos no se han verificado en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Disponibilidad |
|---|---|---|---|---|---|
| ouro-1.4b-thinking-math-verl-rltt-native-r4 | 1,4B | no disponible | Apache-2.0 | safetensors + shards FSDP | Repositorio de investigacion, 0 descargas |
| ByteDance/Ouro-1.4B-Thinking | 1,4B | no disponible | Apache-2.0 | no disponible en esta busqueda | Modelo base publico |
| Qwen3-1.7B | 1,7B | no disponible | Apache-2.0 | safetensors y GGUF | Ampliamente desplegado |
| Llama-3.2-1B | 1,2B | no disponible | Licencia comunitaria de Llama 3.2 | safetensors y GGUF (comunitarios) | Ampliamente desplegado |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible | MIT | safetensors y GGUF (comunitarios) | Ampliamente desplegado |

Frente a estos alternativos, la diferencia relevante no es el rendimiento —no hay datos publicados— sino la arquitectura: Ouro reaplica bloques de capas, lo que cambia el perfil de computo en inferencia y complica su integracion en runtimes que asumen un transformer estandar.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas, 0 likes y un tamano declarado de 0,0 GB en el momento de la consulta; conviene verificar que los pesos esten realmente accesibles antes de planificar cualquier uso.
- Es un artefacto de investigacion de un unico run de RL de 100 pasos sobre un unico dataset. No hay evidencia publicada de generalizacion mas alla de MATH.
- Riesgo de sobreajuste al formato y al estilo de MATH-lighteval, con posible degradacion en tareas fuera de ese dominio.
- Entrenamiento con recompensa basada en respuestas de MATH: existe riesgo de *reward hacking* (atajos en la cadena de razonamiento que aciertan la respuesta final sin razonamiento valido).
- Riesgo de alucinacion en pasos intermedios y en notacion matematica, agravado por el tamano reducido del modelo (1,4B).
- No se declaran idiomas soportados. El dataset de entrenamiento es en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con entradas largas sin medirlo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado ajeno al nucleo de `transformers`; hay que auditar `modeling_ouro.py` antes de usarlo en produccion.
- La licencia es Apache-2.0, que permite uso comercial, pero al derivar de `ByteDance/Ouro-1.4B-Thinking` conviene revisar tambien las condiciones del modelo base y de los datasets utilizados.
- La politica de salida queda fijada en `fixed` con cache `full_depth`; no se ha validado en este run el comportamiento con otras politicas de salida.
- No hay datos de latencia, throughput ni coste energetico publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-r4-154711-20261015
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de rollouts del run: https://huggingface.co/datasets/hi-todayis-jh/ouro-1.4b-thinking-math-verl-rltt-native-r4-154711-20261015-rollouts
- Proyecto de Weights & Biases del run: proyecto `ouro-1.4b-grpo-rltt-math`, run `verl-rltt-native-r4-154711-20261015` (enlace directo no disponible en la informacion proporcionada)
- Repositorio de verl: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (unicamente definiciones del vocablo ingles "hi" y sitios no relacionados), por lo que no se han podido incorporar enlaces adicionales verificados.
