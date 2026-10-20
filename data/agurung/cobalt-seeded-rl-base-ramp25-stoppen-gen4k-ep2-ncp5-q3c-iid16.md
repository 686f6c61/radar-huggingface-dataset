# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16` es un checkpoint de aprendizaje por refuerzo (RL) sobre Qwen3-4B-Instruct-2507, publicado por el usuario agurung dentro de la familia de experimentos "cobalt". No es un modelo entrenado desde cero ni un fine-tune supervisado: es el resultado de aplicar GRPO (OpenRLHF) directamente sobre el modelo base, sin semilla SFT intermedia, optimizando una recompensa binaria de correccion de codigo (el programa generado pasa o no los tests del problema). El checkpoint corresponde al paso global 50 y el autor lo etiqueta como el mejor de la ejecucion atendiendo a pass@8.

Su relevancia es fundamentalmente de investigacion: documenta una receta de RL reproducible y agresiva contra el truncamiento (penalizacion ProRL a muestras truncadas y penalizacion DAPO en la cola de 1024 tokens), aplicada a un conjunto de problemas deliberadamente dificiles para el modelo base ("cobalt-train <=2/64 frontier", es decir, problemas que el base resolvia como maximo en 2 de 64 muestreos). El modelo tiene 4.411.424.256 parametros y se distribuye en formato transformers/safetensors, con un repositorio de 105,9 GB.

Conviene tratarlo como artefacto de experimento antes que como modelo de produccion: la model card no declara licencia, idiomas, ni resultados numericos de evaluacion, y el checkpoint esta especializado en generacion de codigo verificable, lo que estrecha su utilidad fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card; se heredaria del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 105,9 GB |
| Metodo de entrenamiento | GRPO con OpenRLHF |
| Revision de carga | `main` (pesos en la raiz del repo) |
| Descargas | 1201 |
| Fecha de creacion / actualizacion | 2026-10-10 / 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer denso de 4,41 B de parametros con atencion causal estandar. El autor no introduce cambios estructurales; el trabajo consiste integramente en post-entrenamiento con RL. La model card es explicita en que el punto de partida es el modelo base "sin semilla SFT" (RL aplicado directamente), aunque la etiqueta `base_model` del repositorio apunta a `Qwen3-4B-Instruct-2507`, que ya es un modelo instruido: existe una ambiguedad entre ambas afirmaciones que el autor no resuelve.

El algoritmo es GRPO con ventajas normalizadas por grupo y sin penalizacion KL. La receta concreta: 8 muestras por prompt, batch de rollout 128, batch de entrenamiento 128, maximo de 4096 tokens nuevos por rollout, 2 episodios completos y learning rate de 1e-06 con schedule constante. Dos mecanismos de modelado de recompensa son los mas destacables: (1) penalizacion "stop-properly" estilo ProRL, que asigna recompensa -1.0 a las muestras truncadas para desincentivar respuestas cortadas por el limite de tokens; y (2) penalizacion DAPO de sobrelongitud, que suma una penalizacion creciente hasta -0.25 a las respuestas que caen en los ultimos 1024 tokens antes del limite. La senal de recompensa es puramente binaria: 1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario.

Los datos de entrenamiento son el conjunto "cobalt-train <=2/64 frontier", construido con prompts `clean_eval` canonicos y filtrado mediante un escaneo de dureza `iid_canonical@64`: 1833 problemas de entrenamiento y 112 de validacion retenidos, seleccionados porque el modelo base solo los resolvia en 2 de cada 64 muestreos. La validacion se muestrea a temperatura 1.0, igual que la evaluacion del frontier. No se documenta el numero total de tokens de entrenamiento ni la composicion linguistica del dataset.

## Capacidades

- Generacion de codigo orientada a correccion funcional: el unico objetivo optimizado es que el programa pase los tests, por lo que el checkpoint esta sesgado hacia codigo verificable mas que hacia explicaciones.
- Razonamiento paso a paso en problemas de programacion de dificultad alta para el modelo base (el conjunto de entrenamiento se filtro precisamente por dureza).
- Generacion de programas completos de hasta 4096 tokens nuevos por respuesta.
- Finalizacion limpia de respuestas: las penalizaciones anti-truncamiento empujan al modelo a cerrar la solucion antes del limite, en lugar de cortarse.
- Generacion de texto general: al conservar los pesos de Qwen3-4B-Instruct-2507, mantiene las capacidades del modelo base, aunque no estan evaluadas en este checkpoint.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades especiales (vision, audio, modo thinking explicito): no documentadas.

## Casos de uso

- Investigacion en RL para codigo: sirve como punto de comparacion reproducible frente a otros checkpoints de la misma ejecucion, ya que la receta (GRPO, 8 muestras/prompt, penalizaciones ProRL y DAPO) esta descrita con precision y los logs estan en W&B.
- Generacion de soluciones para problemas de programacion competitiva: el entrenamiento se concentra en problemas que el base resolvia rara vez (<=2/64), que es el regimen donde un modelo de 4 B suele fallar.
- Produccion de datos sinteticos verificables: al optimizar recompensa binaria por tests, las salidas se pueden filtrar automaticamente ejecutando la suite de pruebas, lo que permite generar pares problema-solucion de alta dificultad para otros entrenamientos.
- Reproduccion de experimentos de anti-truncamiento: util para estudiar el efecto de la penalizacion -1.0 a muestras truncadas y de la penalizacion DAPO hasta -0.25 en la cola de 1024 tokens sobre la longitud efectiva de las respuestas.
- Asistente de codigo en entornos con restricciones de VRAM: con 4,41 B de parametros cabe en GPUs de consumo, lo que permite desplegarlo en estaciones de trabajo para autocompletado o resolucion de funciones aisladas con validacion por tests.
- Servicio de inferencia ligero autoalojado: el autor documenta el despliegue directo con `vllm serve`, lo que facilita montar un endpoint compatible con la API de OpenAI para pruebas internas.
- Estudio de linaje de checkpoints: comparar este paso 50 (mejor por pass@8) con otros pasos de la misma ejecucion para analizar la dinamica de mejora durante el RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica literalmente que las metricas de evaluacion de este checkpoint "no estan disponibles en el log de entrenamiento". La unica afirmacion de rendimiento es relativa: es el mejor checkpoint por pass@8 de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q3c_iid16` hasta la fecha, sin cifra asociada.

| Benchmark | Resultado | Notas |
|---|---|---|
| pass@8 (conjunto de validacion cobalt, 112 problemas) | no disponible (mejor de la ejecucion, sin cifra) | Evaluacion a temperatura 1.0 |
| MMLU | no disponible | No evaluado en la informacion proporcionada |
| HumanEval | no disponible | No evaluado en la informacion proporcionada |
| GSM8K | no disponible | No evaluado en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9-10 GB solo para pesos (4,41 B x 2 bytes), mas cache KV y overhead; presupuesto realista de 12-16 GB.
- VRAM estimada en 8 bits: aproximadamente 4,5-5,5 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para servir con mucho paralelismo y contexto largo; L40S o A10G para despliegue en nube con coste moderado.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080 / 4070 Ti Super (16 GB) y RTX 3090 (24 GB); en 4 bits entra en tarjetas de 8-12 GB, con margen limitado para contexto largo.
- Opciones de despliegue: vLLM (`vllm serve ... --revision main`, segun la model card), transformers con `AutoModelForCausalLM` (snippet oficial incluido), TGI (tag `text-generation-inference` presente en el repo). llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Advertencia de despliegue: el repositorio ocupa 105,9 GB aunque los pesos del modelo sean ~8,8 GB en bf16, lo que sugiere que contiene artefactos adicionales (posiblemente estados de optimizador u otros checkpoints). La descarga completa es costosa; conviene revisar la estructura del repo antes de clonarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (cobalt, paso 50) | 4,41 B | no disponible | RL GRPO sobre correccion de codigo | no disponible | HuggingFace, revision `main` |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,4 B (aprox.) | no disponible en la informacion proporcionada | Modelo instruido generalista | no disponible en la informacion proporcionada | HuggingFace |
| Otros checkpoints de la ejecucion cobalt | 4,41 B | no disponible | Misma receta, distintos pasos | no disponible | Referenciados solo en logs locales / W&B |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con modelos de la misma categoria (por ejemplo, otros modelos de codigo de 3-7 B). Cualquier comparacion de rendimiento requeriria ejecutar una evaluacion propia con la misma suite de tests.

## Limitaciones y advertencias

- Licencia no declarada: no hay terminos de uso, lo que impide asumir permiso para uso comercial. Es un bloqueo legal serio para produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real tras el RL; el entrenamiento se hizo sobre problemas de codigo, presumiblemente en ingles.
- Riesgo de sobreajuste al dominio: el RL se aplico sobre 1833 problemas filtrados por dureza; es esperable deterioro en tareas generales de texto o en codigo facil, aunque no hay evaluacion que lo cuantifique.
- Riesgo de alucinacion en codigo: el modelo puede producir programas sintacticamente plausibles que fallen los tests; la recompensa binaria no garantiza correccion fuera de distribucion.
- Ausencia total de benchmarks publicados: no hay evidencia numerica de mejora frente al modelo base; la unica afirmacion es comparativa interna.
- Ambiguedad en el linaje: la model card dice "sin semilla SFT, RL aplicado directamente al modelo base" mientras que la etiqueta `base_model` apunta a `Qwen3-4B-Instruct-2507`. Conviene verificar con que pesos se inicializo realmente.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados; el usuario debe generarlas, con el riesgo de degradar un comportamiento afinado por RL.
- Repositorio de 105,9 GB: coste de almacenamiento y descarga muy superior al de los pesos del modelo.
- Naturaleza experimental: es un checkpoint intermedio (paso global 50) de una ejecucion de investigacion, con logs en rutas locales del autor y W&B; no hay garantia de mantenimiento ni de soporte.
- Los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo; no se ha podido contrastar ningun dato externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento: proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q3c-iid16` en Weights & Biases (no se proporciona URL directa)
- OpenRLHF (framework de entrenamiento citado): no se proporciona enlace en la informacion disponible
- Paper de GRPO: no se proporciona enlace en la informacion disponible
- Paper de DAPO: no se proporciona enlace en la informacion disponible
- Repositorio de codigo o demo: no disponible
