# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16

## Resumen

El modelo `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16` es un checkpoint de reinforcement learning (RL) publicado por el usuario agurung sobre Qwen3-4B. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado al uso, sino del resultado intermedio de una ejecución de RL con el algoritmo GRPO (Group Relative Policy Optimization) implementado con OpenRLHF, guardado en el paso global 38 de la ejecución. El autor lo identifica como el mejor checkpoint de esa ejecución segun la metrica pass@8.

La relevancia del artefacto es fundamentalmente experimental: forma parte de una linea de trabajo sobre RL a partir de un modelo base sin semilla de SFT adicional, con una recompensa binaria de correccion de codigo (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario). El conjunto de entrenamiento es un subconjunto de dificultad alta, denominado frontier cobalt-train ≤2/64, compuesto por 1833 problemas de entrenamiento y 112 de validacion, seleccionados por ser problemas que el modelo base resolvia como maximo en 2 de 64 muestras. Esto lo convierte en material de interes para investigadores que trabajan en RL con verificacion (RLVR) y en recetas de escalado de dificultad.

La ficha se enfrenta a una limitacion importante de documentacion: el repositorio no declara licencia, idiomas soportados ni resultados de evaluacion finales, y no se han encontrado fuentes externas relevantes en la busqueda web. Los 4.411.424.256 parametros indicados por los safetensors corresponden al modelo denso heredado de Qwen3-4B-Instruct-2507, cuyo contexto e idiomas se heredan salvo que el entrenamiento de RL los haya degradado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), heredada del modelo base |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; heredada de Qwen3-4B-Instruct-2507 (262.144 tokens nativos, ampliable con YaRN), dato no verificado en esta ficha |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ, GPTQ ni bitsandbytes documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base Qwen3-4B-Instruct-2507 se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors |
| Libreria | transformers (compatible con text-generation-inference y endpoints_compatible) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Metodo de entrenamiento | OpenRLHF + GRPO |
| Paso global guardado | 38 |
| Tamano del repositorio | 167,6 GB (incluye multiples revisiones o estados de checkpoint) |
| Descargas | 197 |
| Likes | 0 |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de aproximadamente 4,4 mil millones de parametros. El checkpoint no introduce cambios estructurales; el entrenamiento consiste en una fase de RL por GRPO aplicada sobre los pesos del modelo base. Segun la model card, la semilla es el modelo base Qwen3-4B sin SFT adicional ("no SFT seed — RL applied directly to the base model"), lo que resulta ambiguo porque la etiqueta `base_model` apunta a la variante Instruct-2507; conviene tratar esta discrepancia como una incognita documental.

La receta de entrenamiento esta detallada y es reproducible en sus hiperparametros principales: GRPO con ventajas normalizadas por grupo y sin penalizacion KL; penalizacion "stop-properly" que asigna recompensa -1.0 a las muestras truncadas (shaping anti-truncamiento de estilo ProRL); penalizacion DAPO de sobrelongitud que aplica un termino aditivo creciente hasta -0.25 a las respuestas situadas en los ultimos 1024 tokens antes del limite; 8 muestras por prompt; tamano de lote de rollout y de entrenamiento de 128; maximo de 4096 tokens nuevos por rollout; 2 episodios; y tasa de aprendizaje del actor de 1e-06 con schedule constante. La senal de recompensa es puramente binaria y basada en verificacion: el programa generado pasa o no pasa los tests del problema.

El conjunto de datos de entrenamiento y validacion es el denominado frontier cobalt-train ≤2/64, con 1833 problemas de entrenamiento y 112 de validacion retenidos, definidos como aquellos que el modelo base resolvia en como maximo 2 de 64 muestras bajo el escaneo de dureza iid_canonical@64. Las evaluaciones de validacion se muestrean con temperatura 1.0 para coincidir con el regimen del barrido de dificultad. El autor indica que las metricas de evaluacion de este checkpoint no estan disponibles en el registro de entrenamiento.

## Capacidades

- Generacion de codigo: es la capacidad directamente optimizada por la recompensa, ya que el unico criterio de exito es que el programa pase los tests del problema.
- Razonamiento orientado a tareas de programacion verificables: la senal de recompensa binaria empuja hacia soluciones correctas en lugar de respuestas plausibles.
- Generacion de texto general: heredada de Qwen3-4B-Instruct-2507, pero potencialmente degradada por la ausencia de penalizacion KL durante el RL.
- Tool calling y function calling: no documentado de forma explicita en la informacion disponible; puede heredarse del modelo base, pero no esta garantizado tras el RL.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingues: no documentadas. Los idiomas no estan declarados en el repositorio.
- Capacidad especial: ninguna adicional declarada. No hay modo de pensamiento explicito, vision ni audio en la informacion disponible.
- Formato de chat: no documentado en la model card; al derivar de Qwen3-4B-Instruct-2507 se espera compatibilidad con su plantilla, pero no se confirma.

## Casos de uso

- Generacion de codigo en produccion para funciones acotadas: el checkpoint esta optimizado para producir programas que superan tests, por lo que encaja en tareas de sintesis de funciones con especificacion y bateria de pruebas disponible, por ejemplo generacion de utilidades o adaptadores en un pipeline interno.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede emplearse para producir casos de prueba, un flujo que se beneficia directamente de haber sido entrenado contra criterios de correccion ejecutable.
- Reparacion automatica de codigo con verificacion posterior: integrado en un bucle de tipo generar-ejecutar-test, el modelo puede proponer parches que se validan automaticamente antes de aceptarse, lo que mitiga el riesgo de alucinacion mediante el filtro de tests.
- Investigacion en RL con verificacion (RLVR): su uso mas inmediato es como punto de partida o de comparacion en estudios sobre escalado de dificultad, shaping de recompensas y penalizaciones de truncamiento, dado que la receta esta documentada con detalle.
- Ablaciones de hiperparametros de GRPO: la ejecucion incluye penalizacion stop-properly, penalizacion DAPO de sobrelongitud y ausencia de KL, lo que permite estudiar el efecto de cada componente frente a otros checkpoints de la misma serie.
- Destilacion y generacion de datos sinteticos de codigo: el modelo puede utilizarse para producir soluciones candidatas sobre un corpus de problemas, que despues se filtran por ejecucion y se emplean para entrenar modelos menores.
- Reproduccion de experimentos de OpenRLHF: al documentarse el proyecto de W&B y el log local de entrenamiento, sirve como referencia para validar reproducibilidad de recetas de RL a escala de 4B.
- Asistente de codigo en CI/CD: desplegado con vLLM y expuesto como endpoint compatible con la API de OpenAI, puede insertarse en un paso de integracion continua que proponga cambios y los valide con la suite de tests existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas de evaluacion de este checkpoint "not available in the train log" y solo aporta la posicion relativa dentro de la ejecucion: es el mejor checkpoint por pass@8 hasta el momento en la run `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q3c-groot16`, con paso global 38. No se dispone de valores de MMLU, HumanEval, GSM8K ni de pass@k absolutos. La busqueda web no devolvio ninguna fuente util (unicamente enlaces de inicio de sesion de Gmail, sin relacion con el modelo).

| Benchmark | Resultado |
|---|---|
| pass@8 (frontier cobalt-train ≤2/64) | mejor checkpoint de la ejecucion hasta el paso 38, sin valor numerico publicado |
| Metricas de validacion del paso 38 | no disponibles segun la model card |
| MMLU, HumanEval, GSM8K, MBPP | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9 GB solo para pesos, con 11-13 GB en la practica contando cache KV y overhead de runtime para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB de pesos. Estas cuantizaciones no estan publicadas en el repositorio y requeririan conversion propia.
- GPU profesionales: cabe holgadamente en una A100 de 40 GB o 80 GB, H100 y L40S, con margen para lotes grandes y contexto largo.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB sin cuantizar y con contexto amplio; en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti de 16 GB) es viable con cuantizacion o con contexto reducido.
- Despliegue: el autor documenta `vllm serve` con `--revision main` y la carga directa con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer` en la revision `main`). Las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y endpoints compatibles con la API de OpenAI son opciones plausibles. No se documenta soporte para llama.cpp u Ollama, que exigiria generar pesos GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Almacenamiento: el repositorio ocupa 167,6 GB, muy por encima del tamano de un unico checkpoint en bf16 (unos 9 GB), lo que sugiere que contiene multiples revisiones o estados intermedios. Conviene clonar solo la revision necesaria para evitar descargar el repositorio completo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparativa se limita a caracteristicas estructurales y de licencia. Los valores de contexto y licencia de los modelos comparados corresponden a sus respectivas fichas publicas y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-...-groot16 (este) | 4,41 B | no disponible | RL GRPO sobre Qwen3-4B, recompensa binaria de codigo | no disponible | HuggingFace, revision `main` |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | 262.144 tokens nativos | Instruct generalista con post-entrenamiento | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Coder-3B-Instruct | ~3,1 B | 32.768 tokens (ampliable) | Especializado en codigo | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Instruct generalista | Llama 3.2 Community License | HuggingFace (con aceptacion de terminos) |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Antes de cualquier uso comercial es necesario confirmar los terminos con el autor; la licencia Apache 2.0 del modelo base no implica automaticamente que este derivado la herede.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue. El uso en castellano no esta garantizado.
- Riesgo de olvido catastrofico: la receta de GRPO se ejecuta sin penalizacion KL, con tasa de aprendizaje constante de 1e-06 y sobre un unico objetivo binario de correccion de codigo. Esto favorece la especializacion y puede degradar el formato de conversacion, el seguimiento de instrucciones generales y el conocimiento no relacionado con programacion.
- Sesgo de dominio: el entrenamiento se restringe a 1833 problemas de la frontera de dificultad ≤2/64. El comportamiento fuera de ese regimen (problemas faciles, dominios no cubiertos, tareas no verificables) es impredecible.
- Alucinacion: la recompensa solo valida los programas que pasan tests. En ausencia de un ejecutor de pruebas, la salida puede contener codigo incorrecto presentado con seguridad. El filtrado por ejecucion es imprescindible en produccion.
- Checkpoint intermedio: corresponde al paso global 38 de una ejecucion en curso, no a un artefacto final pulido. El propio autor lo etiqueta como mejor checkpoint "hasta el momento" de esa run.
- Sin resultados de evaluacion publicados: no hay cifras de pass@k, MMLU ni de ningun otro benchmark, lo que impide verificar la calidad real frente al modelo base.
- Ambiguedad sobre la semilla: la model card afirma que el RL se aplica al modelo base sin semilla de SFT, mientras que la etiqueta `base_model` apunta a Qwen3-4B-Instruct-2507. Esto afecta a la interpretacion de los resultados.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, por lo que el despliegue en hardware modesto requiere conversion manual y validacion posterior de calidad.
- Repositorio de 167,6 GB: la descarga completa es costosa e innecesaria; conviene fijar la revision y descargar solo los ficheros del checkpoint.
- Adopcion muy baja: 197 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/agurung
- Registro de entrenamiento en Weights & Biases: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q3c-groot16` (no se proporciona URL directa)
- Log local de entrenamiento: `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_q3c-groot16/openrlhf_train.log` (ruta interna, no accesible publicamente)
- OpenRLHF: no se proporciona enlace en la informacion disponible
- La busqueda web no devolvio ningun enlace relevante sobre este modelo; los unicos resultados fueron paginas de inicio de sesion de Gmail, sin relacion con el contenido de la ficha.
