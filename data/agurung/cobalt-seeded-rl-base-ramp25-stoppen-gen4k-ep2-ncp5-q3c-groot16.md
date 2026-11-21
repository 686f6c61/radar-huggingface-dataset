# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16` es un checkpoint de aprendizaje por refuerzo (RL) derivado de `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer denso de 4.411.424.256 parametros. Lo publica el usuario `agurung` como parte de una linea de experimentos de RL aplicada directamente sobre el modelo base (sin fase previa de SFT), orientada especificamente a la generacion de codigo verificable. El checkpoint corresponde al paso global 110 de la ejecucion de RL y se identifica como el mejor hasta la fecha segun la metrica pass@8 dentro de esa ejecucion.

El modelo se entrena con OpenRLHF y el algoritmo GRPO (Group Relative Policy Optimization) sin penalizacion KL, usando una recompensa binaria de correccion de codigo (1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario). El conjunto de entrenamiento y validacion es el denominado "cobalt-train ≤2/64 frontier": 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo en 2 de 64 muestras, es decir, problemas de dificultad alta para el modelo de partida.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint de investigacion con una receta de RL muy concreta (penalizacion por truncamiento, penalizacion DAPO por respuestas excesivamente largas, 8 muestras por prompt); por otro, advierte de que se trata de un artefacto experimental sin model card completa, sin licencia declarada y sin resultados de evaluacion publicados en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos safetensors en precision original) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4.400 millones de parametros. Sobre ese modelo se aplica un proceso de RL con OpenRLHF y GRPO, con ventajas normalizadas por grupo y sin penalizacion KL. El checkpoint se guarda en el paso global 110 de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q3c_groot16`, y se selecciona como el mejor por pass@8 de la ejecucion.

La receta de entrenamiento incluye varios detalles tecnicos destacables. La recompensa es binaria de correccion de codigo y se evalua contra los tests de cada problema. Se aplica una penalizacion "stop-properly" de estilo ProRL que asigna recompensa -1.0 a las muestras truncadas, para desincentivar respuestas que agotan el limite de tokens. Ademas, se aplica una penalizacion DAPO "overlong": las respuestas que caen en los ultimos 1024 tokens antes del limite reciben una penalizacion aditiva que crece hasta -0.25. Los hiperparametros principales son 8 muestras por prompt, tamano de batch de rollout 128, tamano de batch de entrenamiento 128, maximo de 4096 tokens nuevos por rollout, 2 episodios y tasa de aprendizaje del actor constante de 1e-06.

El conjunto de datos de RL es el "cobalt-train ≤2/64 frontier" con prompts canonicos de `clean_eval`: 1833 problemas de entrenamiento y 112 de validacion, seleccionados porque el modelo base los resolvia en como maximo 2 de 64 muestras bajo el escaneo de dificultad `iid_canonical@64`. La validacion se muestrea a temperatura 1.0, en linea con la evaluacion del frontier.

## Capacidades

- Generacion de codigo: capacidad principal del checkpoint, reforzada mediante RL con recompensa binaria de superacion de tests.
- Razonamiento y resolucion de problemas de programacion de dificultad alta para el modelo base (problemas que el base resolvia en ≤2 de 64 muestras).
- Generacion de texto general: heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no confirmado en la model card; presumiblemente heredado del base, pero no verificado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la model card.
- Capacidades multilingues: no declaradas; no disponible.
- Modo "thinking": no declarado en la model card de este checkpoint.
- Vision o audio: no disponible; el modelo base es solo texto.

## Casos de uso

- Generacion de codigo en pipelines de evaluacion: el checkpoint esta optimizado para resolver problemas de programacion con tests automaticos, por lo que encaja en entornos de evaluacion tipo pass@k o en la generacion de candidatos de codigo que luego se filtran con una suite de tests.
- Investigacion en RL para codigo: sirve como punto de partida o referencia para reproducir la receta GRPO con penalizaciones de truncamiento y DAPO, dado que la model card documenta hiperparametros y algoritmo con detalle.
- Generacion de soluciones candidatas en entornos de sintesis de programas: con 8 muestras por prompt y temperatura 1.0, el modelo puede producir multiples candidatos por problema para seleccion posterior por tests.
- Fine-tuning posterior: al ser un checkpoint intermedio de RL sobre Qwen3-4B, puede usarse como inicializacion para experimentos de RL adicionales o SFT especifico de dominio.
- Servicio de inferencia experimental con vLLM: la model card documenta el comando `vllm serve` con `--revision main`, lo que permite desplegarlo en un endpoint compatible con OpenAI para pruebas internas.
- Evaluacion comparativa de tecnicas de RL: util para comparar el efecto de la penalizacion "stop-properly" y DAPO frente a GRPO estandar en tareas de codigo.
- Prototipado de asistentes de programacion en local: con 4.400 millones de parametros, es viable en GPUs de consumo para pruebas no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion en este checkpoint "not available in the train log", y solo se declara que es el mejor checkpoint por pass@8 de la ejecucion, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 5,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se genera GGUF/AWQ a partir de los safetensors): alrededor de 2,5 a 3,5 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para produccion; RTX 4090, RTX 3090 o RTX 4080 para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); con cuantizacion de 4 u 8 bits, en tarjetas de 8 GB.
- Opciones de despliegue: transformers (documentado), vLLM (documentado con `--revision main`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque el repo solo publica safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16 | 4.411.424.256 | no disponible | no disponible | RL GRPO sobre Qwen3-4B para codigo | Hugging Face, revision main |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4.400 millones | no disponible en esta ficha | no disponible en esta ficha | Instruct generalista | Hugging Face |
| Otros checkpoints de RL sobre Qwen3-4B | variable | variable | variable | RL para codigo o razonamiento | Hugging Face |

La comparativa con alternativas de la misma categoria es limitada porque no se dispone de datos de rendimiento publicados para este checkpoint ni de una licencia declarada que permita comparar condiciones de uso. El modelo base Qwen3-4B-Instruct-2507 es la referencia natural, pero no se han publicado cifras comparativas de pass@8 en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Sin resultados de evaluacion publicados: la model card indica que las metricas no estan disponibles en el train log; no hay evidencia cuantitativa del rendimiento final.
- Checkpoint experimental: se trata de un paso intermedio (global step 110) de una ejecucion de RL, no de un modelo final pulido ni de un release estable.
- Especializacion estrecha: el entrenamiento se limita a problemas de codigo del frontier "cobalt-train ≤2/64"; el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Riesgo de alucinacion y codigo incorrecto: la recompensa binaria por tests no garantiza correccion en problemas fuera de la distribucion de entrenamiento.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla de lo heredado del base.
- Contexto no declarado: no se especifica la longitud de contexto efectiva de este checkpoint.
- Sin datos de sesgos: no se han publicado analisis de sesgos.
- Reproducibilidad limitada: los logs estan en Weights & Biases (proyecto `eaiexp-paper-final`) y en un log local no publico, lo que dificulta la verificacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-groot16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- OpenRLHF (framework de RL usado): https://github.com/OpenRLHF/OpenRLHF
- Weights & Biases, proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5_q3c-groot16` (referenciado en la model card; no se proporciona URL directa)
