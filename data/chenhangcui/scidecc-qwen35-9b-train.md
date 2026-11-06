# Chenhangcui/scidecc-qwen35-9b-train

## Resumen

SciDeCC Protocol-A es un conjunto de checkpoints de ajuste fino sobre el modelo base Qwen/Qwen3.5-9B, publicado por el usuario Chenhangcui. No se trata de un modelo nuevo entrenado desde cero, sino de una coleccion de pesos resultantes de un pipeline de entrenamiento por refuerzo supervisado (RFT, rejection fine-tuning) seguido de optimizacion con DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization). El objetivo declarado es mejorar el razonamiento cientifico en tareas del benchmark SciDeCC, con dos brazos de evaluacion denominados Hard y Easy.

El repositorio contiene varias generaciones de checkpoints: una primera generacion con adaptadores LoRA (r=32), un RFT final con ajuste completo de parametros sobre 3.368 trayectorias expertas verificadas por un evaluador deterministico, un checkpoint DAPO posterior y, finalmente, un continuacion de RFT sobre 3.660 trayectorias nuevas. El checkpoint mas reciente es `rft_continue_20261014/`, entrenado 1 epoch (55 pasos) con learning rate 5e-6 y batch global de 64.

La relevancia del artefacto es doble: por un lado documenta una receta completa de entrenamiento (datos, curvas de loss y reward, rollouts DAPO en parquet, salidas crudas de evaluacion) poco habitual en publicaciones de modelos ajustados; por otro, los incrementos reportados en SciDeCC-Hard y SciDeCC-Easy son sustanciales. Sin embargo, se trata de un repositorio de investigacion con licencia "other" y sin model card convencional, lo que limita su uso directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B); configuracion vLLM incluida en `vllm_wrapper/` |
| Parametros totales | 9B (modelo base Qwen/Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo de 73,9 GB; incluye `train_state`, `vllm_wrapper` y `eval_rows`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9.000 millones de parametros. Sobre esa base se aplica un pipeline en tres fases. La primera generacion uso LoRA con rango 32 directamente sobre el modelo base, produciendo los adaptadores `lora_gen1/rft_final` (134 pasos RFT) y `lora_gen1/dapo_final` (33 pasos DAPO). La segunda fase abandona LoRA y realiza ajuste completo de parametros: el checkpoint `rft_final` se entrena durante 46 pasos (2 epochs) sobre un corpus de 3.368 trayectorias de tipo Protocol-A con razonamiento, correspondientes a 1.032 problemas y filtradas por un evaluador deterministico (`_rft_traces_v2/rft_train_v2.jsonl`).

Sobre `rft_final` se ejecuta DAPO, un algoritmo de RL con recorte asimetrico y muestreo dinamico, del que se conserva el checkpoint-30 de una ejecucion de 48 pasos; los rollouts completos (prompt, generacion y reward por paso) se publican en 48 ficheros parquet. La fase mas reciente, `rft_continue_20261014`, continua el RFT sobre `rft_final` con 3.660 trayectorias correctas nuevas durante 1 epoch (55 pasos, lr 5e-6, batch global 64). El repositorio incluye ademas `trainer_state.json` con curvas de loss, reward y clipped_ratio por checkpoint, y un `vllm_wrapper/` con la clase `Qwen3_5Config` externa necesaria para cargar los pesos en vLLM. No se documentan innovaciones arquitectonicas propias: el valor esta en la receta de datos y en el ciclo RFT-DAPO-RFT.

## Capacidades

- Generacion de texto y razonamiento con cadenas de pensamiento explicitas (las trayectorias de entrenamiento incluyen reasoning).
- Razonamiento cientifico y resolucion de problemas de dominio STEM, objetivo central del ajuste (benchmark SciDeCC).
- Generacion de codigo y matematicas: capacidad heredada del modelo base Qwen3.5-9B, no evaluada de forma especifica en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, en la medida en que las trayectorias Protocol-A son multi-paso, pero sin documentacion de integracion agentica.
- Capacidades multilingues: no disponible; el material del repositorio esta redactado en chino e ingles.
- Capacidades especiales: modo de razonamiento largo (long CoT) inducido por RFT; no se documenta vision ni audio.

## Casos de uso

- Evaluacion de recetas de RL para razonamiento cientifico: el repositorio permite reproducir el ciclo RFT-DAPO-RFT con datos, curvas y rollouts, util para equipos de investigacion que comparan algoritmos de RL sobre un mismo modelo base.
- Investigacion en filtrado de datos por verificador deterministico: el corpus de 3.368 trayectorias filtradas por un scorer permite estudiar el impacto de la calidad del dato frente al volumen en RFT.
- Benchmarking interno de modelos de 9B en STEM: los checkpoints Hard y Easy sirven como referencia para medir ganancias de razonamiento en tareas cientificas con avg@3 y pass³.
- Analisis de estabilidad de DAPO: los 48 ficheros parquet de rollouts con reward por paso permiten estudiar clipping, colapso de entropia y dinamica de recompensa sin reentrenar.
- Base para ajuste posterior en dominios cientificos concretos: al ser pesos completos en safetensors, se pueden reajustar con SFT o LoRA sobre datos propios de fisica, quimica o biologia.
- Despliegue experimental en vLLM: el `vllm_wrapper/` incluido permite cargar los checkpoints en un servidor de inferencia para comparativas de latencia y calidad frente al Qwen3.5-9B original.

## Benchmarks y rendimiento

Resultados reportados por el autor en el benchmark SciDeCC (avg@3 y pass³, es decir, proporcion de problemas resueltos en las tres muestras y en las tres simultaneamente):

| Evaluacion | Metrica | `rft_final` | `rft_continue_20261014` |
|---|---|---|---|
| SciDeCC-Hard (1.439 problemas) | avg@3 | 11,12 % | 14,64 % |
| SciDeCC-Hard (1.439 problemas) | pass³ | 1,18 % | 1,95 % |
| SciDeCC-Easy (1.343 problemas) | avg@3 | 35,64 % | 50,73 % |
| SciDeCC-Easy (1.343 problemas) | pass³ | 11,84 % | 24,87 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Tampoco se ofrecen cifras del checkpoint `dapo_final` ni de los adaptadores LoRA de primera generacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion: no se publican pesos cuantizados; habria que generarlos a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ) para reducir requisitos.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y entrenamiento; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en BF16 con contexto limitado; en GPUs de 16 GB solo mediante cuantizacion no oficial.
- Opciones de despliegue: vLLM (soporte explicito via `vllm_wrapper/`), TGI y llama.cpp tras conversion a GGUF; Ollama solo si se genera un GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SciDeCC Protocol-A (Qwen3.5-9B) | 9B | no disponible | RFT + DAPO + RFT sobre Qwen3.5-9B | other | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Preentrenamiento + post-entrenamiento del autor original | segun Qwen | Hugging Face |
| Adaptadores `lora_gen1` del mismo repo | 9B + LoRA r=32 | no disponible | RFT 134 pasos / DAPO 33 pasos | other | Incluidos en el mismo repo |

No se dispone de datos de benchmarks comparativos frente a otros modelos de 9B en la informacion proporcionada, por lo que la comparativa se limita a parametros, linaje y licencia.

## Limitaciones y advertencias

- Licencia "other" sin texto explicito en la informacion disponible: es imprescindible revisar los terminos antes de cualquier uso comercial; ademas, las condiciones del modelo base Qwen3.5-9B pueden aplicar en cascada.
- Modelo de investigacion con 0 descargas y 0 likes: no hay validacion externa de los resultados reportados.
- Las metricas se limitan a SciDeCC (Hard y Easy); no hay evidencia de que las ganancias se transfieran a otros benchmarks ni de que no haya regresion en capacidades generales.
- Riesgo de sobreajuste al formato Protocol-A y al verificador deterministico usado para filtrar las trayectorias, con posible degradacion fuera de ese dominio.
- Riesgo de alucinacion en razonamiento cientifico: el modelo genera cadenas de pensamiento largas y los pass³ siguen siendo bajos en Hard (1,95 %), lo que indica alta varianza entre muestras.
- Idiomas soportados no documentados; el material esta en chino e ingles, sin garantias para castellano.
- Inconsistencia documentada por el propio autor: `dapo_final/` contiene pesos de DAPO v7b (checkpoint-22), mientras que la tabla del README describe una ejecucion anterior (checkpoint-30 de 48 pasos); hay que leer `dapo_final/run_README.md` antes de usarlo.
- Repositorio de 73,9 GB con estados de entrenador y salidas de evaluacion: requiere planificacion de almacenamiento y descarga selectiva.
- No se publican pesos cuantizados ni plantillas de chat; el despliegue en produccion exige trabajo adicional de empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chenhangcui/scidecc-qwen35-9b-train
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documento de traspaso (handoff): GitHub `chenhangcuisg-code/ChronoDiscovery`, ruta `benchmark/SciDeCC/HANDOFF_20261102.md`
- Documentacion interna de la ultima ejecucion: `rft_continue_20261014/run_README.md` (dentro del repositorio)
- Salidas crudas de evaluacion: `rft_continue_20261014/eval_rows/` (dentro del repositorio)
- Rollouts DAPO: `dapo_final/rollouts/` (48 ficheros parquet, dentro del repositorio)
