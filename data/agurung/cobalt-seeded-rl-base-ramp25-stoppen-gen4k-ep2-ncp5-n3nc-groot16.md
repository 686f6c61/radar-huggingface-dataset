# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16

## Resumen

El modelo `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16` es un checkpoint de aprendizaje por refuerzo (RL) desarrollado por el usuario agurung. No se trata de un modelo entrenado desde cero ni de un ajuste supervisado, sino de un artefacto de investigación: un checkpoint intermedio guardado en el paso global 86 de una ejecución de RL con el algoritmo GRPO sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, aplicado directamente sobre la base sin semilla de SFT.

Con 3.973.556.832 parámetros totales (aproximadamente 4.000 millones), hereda la arquitectura del modelo Qwen3-4B y se orienta especificamente a la generacion de codigo. El entrenamiento se realizo con OpenRLHF sobre el denominado conjunto "cobalt-train ≤2/64 frontier", formado por 1.833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia en como maximo 2 de cada 64 muestras. La senal de recompensa es binaria: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario.

Su relevancia es principalmente metodologica: documenta una receta completa de RL para codigo (GRPO sin penalizacion KL, penalizacion anti-truncamiento tipo ProRL y penalizacion overlong de DAPO) y se presenta como el mejor checkpoint por pass@8 de su ejecucion hasta la fecha. El repositorio ocupa 143,1 GB, y el autor advierte que las metricas de evaluacion en este checkpoint no estan disponibles en el log de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen3-4B-Instruct-2507 (etiqueta `nemotron_h` presente en los tags, no confirmada en la informacion disponible) |
| Parametros totales | 3.973.556.832 (aprox. 4B, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-4B-Instruct-2507, un modelo denso de aproximadamente 4.000 millones de parametros, y no introduce cambios estructurales conocidos: el ajuste se aplica mediante RL sobre los pesos existentes. La model card indica que el punto de partida fue el modelo base de Qwen3-4B, sin semilla de SFT previa, es decir, el RL se aplico directamente sin una fase supervisada intermedia. El autor guarda un unico checkpoint por rama, ubicado en la raiz del repositorio, cargable directamente con `transformers` o servible con vLLM.

La receta de entrenamiento es detallada. Se emplea el algoritmo GRPO con ventajas normalizadas por grupo y sin penalizacion KL, con 8 muestras por prompt, tamano de lote de rollout de 128 y de entrenamiento de 128, y un maximo de 4096 tokens nuevos por rollout. El learning rate del actor es constante a 1e-06 y el numero de episodios es 2. Se aplican dos mecanismos de formacion de recompensa: una penalizacion "stop-properly" al estilo ProRL, que asigna -1.0 a las muestras truncadas, y una penalizacion overlong de DAPO, que aplica una penalizacion aditiva creciente hasta -0.25 a las respuestas generadas en los ultimos 1024 tokens antes del limite. El conjunto de datos es el "cobalt-train ≤2/64 frontier", con 1.833 problemas de entrenamiento y 112 de validacion, seleccionados por ser dificiles para el modelo base (resueltos en <=2 de 64 muestras segun el escaneo de dureza iid_canonical@64).

## Capacidades

- Generacion de codigo: capacidad principal del modelo, entrenada mediante recompensa binaria de correctitud frente a tests.
- Resolucion de problemas de programacion de dificultad alta para el modelo base: el ajuste se concentra en casos frontera que Qwen3-4B resolvia en como maximo 2 de 64 intentos.
- Muestreo multiple (pass@k): el checkpoint se selecciona precisamente por su rendimiento en pass@8.
- Generacion de texto general: heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (depende del modelo base, no se documenta para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL para codigo: servir como checkpoint de referencia para reproducir o comparar recetas GRPO aplicadas a modelos de 4B en tareas de programacion, gracias a la receta documentada (pasos, lotes, penalizaciones y learning rate).
- Generacion de datos sinteticos de codigo: al ser un modelo ajustado para producir programas correctos frente a tests, puede usarse para generar soluciones candidatas sobre problemas de programacion que luego se filtran por ejecucion.
- Benchmarking de pass@k: evaluar pass@8 u otros valores de k sobre conjuntos de problemas estilo competicion, comparando con el modelo base y con otros checkpoints del mismo run.
- Fine-tuning posterior: utilizar este checkpoint como punto de partida para una continuacion del entrenamiento por RL o para una fase de SFT, al estar en formato `transformers` y safetensors estandar.
- Prototipado de asistentes de codigo en local: con aproximadamente 4B de parametros, puede desplegarse en GPU de consumo para autocompletado o generacion de fragmentos de codigo en entornos de desarrollo individuales.
- Ablaciones de formacion de recompensa: estudiar el efecto de la penalizacion anti-truncamiento (-1.0) y de la penalizacion overlong de DAPO (hasta -0.25) en el comportamiento del modelo, comparando con ejecuciones sin dichas penalizaciones.
- Evaluacion de pipelines RL open source: probar integraciones con OpenRLHF, vLLM o transformers sobre un modelo pequeno antes de escalar a modelos mayores.
- Educacion e investigacion academica: analizar como el RL directo sobre un modelo base (sin SFT previo) afecta a la correctitud y al comportamiento de parada en generacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion en este checkpoint no estan disponibles en el log de entrenamiento, y aporta unicamente la seleccion cualitativa como "mejor checkpoint por pass@8" de la ejecucion. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni similares.

| Benchmark | Resultado |
|---|---|
| pass@8 | Seleccionado como mejor de la ejecucion; valor numerico no disponible |
| MMLU, HumanEval, GSM8K, etc. | no disponible |

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos (3,97B x 2 bytes), mas cache KV y activaciones; el consumo real depende de la longitud de contexto.
- VRAM para inferencia en FP32: aproximadamente 16 GB solo para pesos.
- VRAM estimada en cuantizacion INT8: aproximadamente 4 GB para pesos.
- VRAM estimada en cuantizacion INT4: aproximadamente 2-2,5 GB para pesos.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para BF16 en contextos moderados; A100/H100 no son necesarias para este tamano, pero facilitan lotes grandes y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB con cuantizacion INT4 o INT8, y en 16-24 GB en precision completa.
- Opciones de despliegue: vLLM (`vllm serve ... --revision main`, indicado por el autor), transformers con `AutoModelForCausalLM`. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican cuantizaciones en el repositorio.
- Tamano del repositorio: 143,1 GB, muy superior a los aproximadamente 8 GB de pesos del modelo, lo que sugiere la presencia de artefactos adicionales (por ejemplo, multiples ficheros o estados de entrenamiento); conviene revisar los ficheros antes de descargar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-... (este) | ~4B (3,97B) | no disponible | mejor pass@8 del run; metricas no publicadas | no disponible | HuggingFace (agurung) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (Qwen) |
| Otros modelos de codigo de ~3-4B (por ejemplo, variantes Qwen-Coder de 3B) | ~3-4B | no disponible | no disponible | no disponible | no disponible |

Nota: no se dispone de datos de benchmarks en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y disponibilidad. No se comparan cifras de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigacion intermedio (paso global 86), no un modelo afinado y validado para produccion; el autor no publica metricas de evaluacion en este punto.
- Licencia no especificada: la ausencia de una licencia explicita impide asumir permisos de uso comercial. Debe verificarse la licencia del repositorio y la del modelo base antes de cualquier despliegue.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue.
- Entrenamiento centrado en codigo y sobre un conjunto muy especifico (1.833 problemas frontera), lo que puede reducir la generalidad frente a otros dominios.
- Riesgo de alucinacion y de generar codigo sintacticamente valido pero incorrecto: la recompensa es binaria por tests, de modo que el modelo puede producir soluciones que pasan ejemplos limitados sin ser correctas en general.
- Sesgos conocidos: no documentados en la informacion disponible.
- La optimizacion hacia problemas resueltos en <=2 de 64 muestras puede sesgar el modelo hacia ciertos tipos de problema del conjunto cobalt-train, con menor cobertura de otros dominios.
- Longitud de contexto no especificada en la informacion proporcionada; no se debe asumir la del modelo base sin confirmarlo.
- El tamano del repositorio (143,1 GB) implica costes de almacenamiento y descarga elevados; conviene inspeccionar los ficheros antes de clonar.
- Etiqueta `nemotron_h` presente en los tags sin correspondencia documentada con el modelo base declarado (Qwen3-4B); se trata de una discrepancia de metadatos que conviene verificar con el autor.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-groot16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases: proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_n3nc_groot16` (URL no proporcionada)
- Log de entrenamiento local (ruta citada por el autor, no accesible publicamente): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_n3nc_groot16/openrlhf_train.log`
- OpenRLHF (framework de entrenamiento): no se proporciona enlace en la informacion disponible
