# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s2

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) construido sobre el modelo denso Qwen3-4B-Instruct-2507, publicado por el usuario `agurung` dentro de una línea de experimentos denominada `cobalt`. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar GRPO (Group Relative Policy Optimization) mediante la librería OpenRLHF directamente sobre el modelo base, sin una fase previa de SFT (supervised fine-tuning) como semilla. El checkpoint corresponde al paso global 68 de la ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s2` y el autor lo identifica como el mejor hasta la fecha según la métrica pass@8.

El objetivo declarado del entrenamiento es la generación de código: la señal de recompensa es binaria y mide exclusivamente si el programa generado supera los tests del problema (1.0 si pasa, 0.0 si no). Los datos de entrenamiento y validación se restringen a la denominada "frontera cobalt-train ≤2/64", un subconjunto de 1833 problemas de entrenamiento y 112 de validación que el modelo base resolvía como máximo en 2 de 64 muestras bajo un escaneo de dificultad `iid_canonical@64`. Es, por tanto, un experimento orientado a exprimir problemas de código que el modelo base apenas resolvía.

El modelo cuenta con 3.973.556.832 parámetros totales (aproximadamente 3,97 mil millones), se distribuye en formato safetensors y es compatible con `transformers` y con servidores vLLM. El repositorio ocupa 143,1 GB, un tamaño muy superior al de los pesos en precisión completa, lo que sugiere la presencia de estados adicionales (optimizador, revisiones o múltiples artefactos de entrenamiento) más allá de los pesos finales. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3; la etiqueta del repo incluye `nemotron_h`, pero el modelo base declarado es Qwen3-4B-Instruct-2507) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponibles; el repositorio solo publica pesos en safetensors (sin GGUF ni AWQ/GPTQ declarados) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de entrenamiento | OpenRLHF + GRPO (sin penalizacion KL) |
| Paso global del checkpoint | 68 |
| Revision principal | `main` (pesos en la raiz del repositorio) |
| Descargas / likes | 106 / 0 |
| Fecha de creacion | 2026-10-08 |
| Ultima actualizacion | 2026-10-12 |
| Tamano del repositorio | 143,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de decodificacion con aproximadamente 3,97 mil millones de parametros. Sobre esa base no se aplico ningun ajuste supervisado previo: el RL se aplico directamente al modelo base (seeding directo). El algoritmo empleado es GRPO con ventajas normalizadas por grupo y sin penalizacion KL, mediante la implementacion de OpenRLHF. La configuracion del entrenamiento incluye 8 muestras por prompt, tamano de lote de rollout y de entrenamiento de 128, un maximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje constante para el actor de 1e-06.

El diseno del reward incorpora dos mecanismos de modelado de forma. En primer lugar, una penalizacion estilo ProRL contra truncamientos: las muestras truncadas reciben una recompensa de -1.0 en lugar de 0.0, con el objetivo de que el modelo aprenda a terminar las respuestas correctamente ("stop-properly"). En segundo lugar, una penalizacion de longitud excesiva estilo DAPO: las respuestas que caen en los ultimos 1024 tokens antes del limite reciben una penalizacion aditiva que escala progresivamente hasta -0.25. La recompensa principal sigue siendo binaria y estrictamente de correctitud de codigo, evaluada contra los tests del problema.

El conjunto de datos es un subconjunto de dificultad controlada: 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvio en como maximo 2 de 64 intentos bajo el escaneo de dureza `iid_canonical@64`. Las evaluaciones de validacion se muestrean a temperatura 1.0 para alinearse con la evaluacion de la frontera `clean_eval`. El autor indica que las metricas de evaluacion de este checkpoint no estan disponibles en el registro de entrenamiento, mas alla de la afirmacion cualitativa de que es el mejor checkpoint por pass@8 de la ejecucion.

## Capacidades

- Generacion de texto y de codigo: es la capacidad central del entrenamiento, ya que la unica senal de recompensa es la superacion de tests de correctitud de programas.
- Razonamiento paso a paso orientado a problemas de programacion: el modelo hereda las capacidades de instruccion y razonamiento de Qwen3-4B-Instruct-2507 y las refuerza en el subconjunto de problemas dificiles de la frontera cobalt.
- Resolucion de problemas de codigo de dificultad alta para su escala: el entrenamiento se concentra especificamente en problemas que el modelo base resolvia en 2 de cada 64 intentos, lo que desplaza la distribucion hacia casos dificiles.
- Terminacion controlada de respuestas: el sesgo de recompensa penaliza explicitamente las respuestas truncadas, lo que favorece la produccion de soluciones completas dentro del presupuesto de 4096 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada; se trata de un modelo exclusivamente de texto segun la etiqueta de pipeline.

## Casos de uso

- Generacion de codigo en pipelines de integracion continua: el modelo puede utilizarse para proponer parches o funciones candidatas que se validen automaticamente contra una suite de tests, replicando el mismo bucle de recompensa binaria con el que fue entrenado. Su especializacion en problemas dificiles lo hace adecuado para tareas donde un modelo de 4B generico falla.
- Asistente de resolucion de ejercicios de programacion: integrado en una plataforma de evaluacion automatica, puede generar soluciones a enunciados con tests ocultos y usarse como candidato inicial que un corrector automatico filtra.
- Generacion de codigo en local con recursos limitados: al tener menos de 4000 millones de parametros, es viable ejecutarlo en una GPU de consumo con cuantizacion, lo que permite entornos de desarrollo sin acceso a APIs externas.
- Sintesis de datos de entrenamiento para codigo: dado que ha sido optimizado para producir programas que pasan tests, puede usarse para generar soluciones candidatas sobre problemas dificiles, que despues se filtran por correctitud y se reutilizan como datos de SFT o de RL.
- Refactorizacion y reparacion de funciones con tests existentes: el modelo puede emplearse en un bucle de reparacion guiado por fallos de test, donde se le vuelve a pedir una solucion tras cada ejecucion fallida.
- Servicio de inferencia de bajo coste con vLLM: la model card documenta explicitamente el comando `vllm serve` para este checkpoint, lo que lo hace desplegable como endpoint compatible con la API de OpenAI y consumible desde herramientas de desarrollo.
- Investigacion en RL para codigo: el checkpoint, junto con su receta (GRPO sin KL, penalizacion de truncamiento, penalizacion DAPO de longitud), sirve como punto de partida reproducible para estudiar el efecto del RL directo sobre modelos base sin SFT previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion de este checkpoint no estan disponibles en el registro de entrenamiento y que la unica afirmacion es que se trata del mejor checkpoint de la ejecucion segun pass@8, sin cifra asociada.

| Benchmark | Resultado | Notas |
|---|---|---|
| pass@8 | No disponible (mejor de la ejecucion, sin cifra) | Metrica de seleccion del checkpoint; sin valor numerico publicado |
| MMLU | No disponible | No reportado |
| HumanEval | No disponible | No reportado |
| GSM8K | No disponible | No reportado |
| Resto de benchmarks | No disponible | No reportado en la model card ni en la busqueda web |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV): aproximadamente 8 GB en FP16/BF16, unos 4 GB en cuantizacion de 8 bits y alrededor de 2,5 GB en cuantizacion de 4 bits. Estas cifras son estimaciones a partir del numero de parametros (3,97 mil millones) y no estan declaradas por el autor.
- Cache KV: no disponible; depende de la longitud de contexto efectiva, que tampoco se especifica en la informacion proporcionada.
- GPU recomendadas: una RTX 4090 (24 GB) permite inferencia en BF16 con margen amplio; una RTX 3060 de 12 GB o una RTX 4070 son suficientes en BF16 y holgadas con cuantizacion. Para servir en produccion con lotes grandes y contexto largo, se recomiendan A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si. El modelo de 3,97 mil millones de parametros es ejecutable en GPUs de consumo con 8 GB o mas de VRAM en cuantizacion de 4 u 8 bits, y en 12 GB en precision completa de 16 bits.
- Opciones de despliegue: la model card documenta dos vias oficiales, `transformers` (`AutoModelForCausalLM` / `AutoTokenizer`) y vLLM (`vllm serve ... --revision main`). Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni configuracion de hardware de referencia.
- Nota sobre el tamano del repositorio: los 143,1 GB del repo son muy superiores al peso de los parametros en precision completa, por lo que la descarga completa puede ser costosa; conviene verificar si es posible descargar unicamente los ficheros de pesos necesarios.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales verificables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| cobalt-seeded-rl-base-...-vs16-s2 (este modelo) | 3.973.556.832 | No disponible | GRPO sobre base Qwen3-4B sin SFT | No disponible | safetensors | HuggingFace, 106 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Instruct, con ajuste supervisado y posteriores | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la busqueda web modelos comparables con datos publicados para esta comparativa.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay cifras de pass@8, MMLU, HumanEval ni de ningun otro benchmark. La unica afirmacion es cualitativa y referida al conjunto de validacion interno de la ejecucion, por lo que no es posible verificar la mejora frente al modelo base.
- Licencia no declarada: al no especificarse licencia, no se puede asumir que el uso comercial este permitido. Es un bloqueante para cualquier despliegue en produccion hasta que el autor lo aclare.
- Riesgo de sobreajuste a la frontera cobalt: el entrenamiento se limita a 1833 problemas que el modelo base resolvia en 2 de 64 intentos. El modelo puede degradar su comportamiento en tareas de codigo fuera de esa distribucion de dificultad o estilo.
- Riesgo de alucinacion de APIs, funciones o dependencias: es un modelo de 3,97 mil millones de parametros sin verificado de ejecucion en tiempo de inferencia; los programas generados pueden compilar parcialmente o referenciar simbolos inexistentes.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue ni sobre el equilibrio entre idiomas. No se recomienda asumir un rendimiento en castellano equivalente al de ingles.
- Origen experimental: se trata de un checkpoint intermedio (paso global 68) de una ejecucion de investigacion, no de un modelo final pulido. El nombre codificado y la ausencia de documentacion adicional refuerzan este caracter.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgos, toxicidad, seguridad o comportamiento en dominios sensibles.
- Penalizaciones de entrenamiento que pueden afectar al estilo: la penalizacion de truncamiento (-1.0) y la penalizacion DAPO de longitud (hasta -0.25 en los ultimos 1024 tokens) pueden inducir respuestas mas cortas o con cierres abruptos en tareas que requieren razonamiento extenso.
- Contexto no especificado: al no declararse la longitud de contexto efectiva ni la configuracion de cache, no se puede planificar el consumo de memoria en despliegues con conversaciones largas.
- Tamano del repositorio: 143,1 GB de descarga, muy por encima del tamano de los pesos, lo que puede complicar la obtencion del artefacto en entornos con almacenamiento limitado.
- Compatibilidad de cuantizacion no verificada: no se publican pesos GGUF, AWQ ni GPTQ, por lo que cualquier despliegue con llama.cpp, Ollama o motores de cuantizacion requiere conversion y validacion propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-vs16-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5-n3nc_vs16_s2` (no se ha encontrado URL directa en la informacion disponible)
- Registro de entrenamiento local: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_vs16_s2/openrlhf_train.log` (ruta local, no accesible publicamente)
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre la linea de experimentos cobalt.
