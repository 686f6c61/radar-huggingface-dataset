# davidheineman/rlve-opd-teacher-R1Distill-107-UndamagedSubmatrixCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-107-UndamagedSubmatrixCounting-20261025` es un checkpoint de 1,78 mil millones de parametros publicado por davidheineman como parte de su coleccion de "teachers" para experimentos de *on-policy distillation* (OPD) y *data scaling* con RLVE. No es un modelo de proposito general: es el resultado final de un experimento de RL con GRPO sobre un unico entorno sintetico denominado `UndamagedSubmatrixCounting` (conteo de submatrices sin celdas danadas), partiendo siempre de pesos iniciales de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`.

El interes del checkpoint es metodologico, no de producto. Forma parte de una familia de modelos especialistas entrenados con el mismo presupuesto (4.000 rollouts, 499 actualizaciones) sobre entornos distintos, lo que permite comparar curvas de aprendizaje y generar trazas de profesor para destilar posteriormente en modelos estudiantes. La model card documenta de forma explicita el entorno, el presupuesto de entrenamiento y el criterio de parada, algo poco habitual y util para reproducibilidad.

Arquitectonicamente es un transformer decoder-only denso de la familia Qwen2, con tokenizer y config estandar de `transformers`, pesos en safetensors y un tamano de repositorio de 3,6 GB. No se publican resultados de benchmarks generales, ni licencia, ni lista de idiomas en el repositorio; cualquier uso en produccion fuera del contexto de investigacion para el que fue creado requiere validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con tokenizer y config de `transformers` |
| Parametros totales | 1.777.088.000 (1,78 B), segun safetensors |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens (ventana nativa de la familia Qwen2.5); la model card de este checkpoint no la declara y no se ha verificado en el repo |
| Tipos de cuantizacion | no se distribuyen cuantizaciones; pesos en safetensors (previsiblemente bf16). Al ser un checkpoint `transformers` estandar es convertible a GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponibles en la model card; el modelo base esta entrenado principalmente en ingles y chino |
| Licencia | no declarada en el repositorio; el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` se publica bajo licencia MIT |
| Formato de pesos | safetensors, mas tokenizer y ficheros de configuracion (`training_run.json`, `training_config.yaml`) |
| Tamano del repositorio | 3,6 GB |
| Estado del checkpoint | pesos finales; sin estado de optimizador ni de dataloader |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen2 con aproximadamente 1,78 B de parametros, heredado de `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez es un destilado de razonamiento de DeepSeek-R1 sobre Qwen2.5. El checkpoint no introduce cambios estructurales: el autor solo publica pesos ajustados mediante RL, con el tokenizer y la configuracion originales. Por tanto, conserva las capacidades de generacion de cadenas de razonamiento del modelo base, aunque el ajuste RL se haya centrado en una sola tarea.

El entrenamiento usa GRPO como "especialista" sobre un unico entorno, `UndamagedSubmatrixCounting`, con dificultad fija y equilibrada (0/1). La generacion emplea 1.024 tokens iniciales mas una continuacion de 128 tokens forzada para la respuesta. El presupuesto se fija en 4.000 rollouts; el checkpoint final corresponde a la actualizacion 499 (indexada desde cero), equivalente a los 4.000 rollouts. La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (no computan contra el presupuesto), y el entrenamiento se detiene al alcanzar 4.000 rollouts o un pass@1 en validacion in-distribution mayor o igual a 0,98. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO adicional; el metodo declarado es exclusivamente GRPO sobre recompensas del entorno.

## Capacidades

- Generacion de texto autoregresiva y razonamiento en cadena (chain-of-thought), heredados del destilado de DeepSeek-R1.
- Resolucion del entorno `UndamagedSubmatrixCounting`: conteo de submatrices que no contienen celdas danadas, con formato de respuesta y continuacion forzada especificos del entorno.
- Generacion de trazas de razonamiento utilizables como material de destilacion para un modelo estudiante (rol de "teacher" en OPD).
- Matematica basica y patrones de conteo combinatorio dentro del dominio del entorno; no hay evidencia de rendimiento fuera de el.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, multi-step planning ni uso de herramientas externas.
- Capacidades multilingues: no documentadas; se heredan las del modelo base, con sesgo hacia ingles y chino.
- No dispone de vision, audio ni modalidades adicionales.
- No incorpora un modo "thinking" explicito configurable; el razonamiento aparece como texto generado segun el formato del entorno.

## Casos de uso

- Destilacion on-policy de un estudiante: usar este checkpoint como profesor para generar rollouts sobre `UndamagedSubmatrixCounting` y entrenar un modelo mas pequeno que reproduzca la politica especializada.
- Generacion de datos sinteticos de razonamiento: producir pares problema-traza-respuesta etiquetados por el propio entorno, utiles para ampliar un corpus de entrenamiento de conteo combinatorio.
- Ablacion y estudios de data scaling: compararlo con los otros checkpoints de la misma coleccion (mismo presupuesto de 4.000 rollouts, entornos distintos) para medir como escala el aprendizaje con el numero de entornos y ejemplos.
- Reproduccion de experimentos de RL: el repositorio incluye `training_run.json` y `training_config.yaml`, lo que permite reutilizar la configuracion exacta en nuevos runs con GRPO.
- Verificacion de pipelines de evaluacion: al tener un criterio de parada objetivo (pass@1 >= 0,98 en validacion ID), sirve como caso de prueba para validar harness de evaluacion y calculo de recompensas antes de lanzar experimentos mayores.
- Pruebas de infraestructura de inferencia a pequena escala: su tamano (1,78 B) permite levantar rapidamente servidores TGI o vLLM en una sola GPU para validar plantillas de prompt, limites de contexto y throughput antes de pasar a modelos mayores.
- Estudio de especializacion vs. olvido catastrofico: evaluar en el modelo base y en este checkpoint tareas generales (MMLU, GSM8K) para cuantificar la degradacion provocada por el ajuste en un unico entorno.
- Generacion de curriculum para entornos relacionados: emplear sus trazas como ejemplos few-shot en tareas de conteo sobre matrices con celdas prohibidas de mayor dificultad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento general para este checkpoint.

El unico dato cuantitativo documentado es un criterio de parada de entrenamiento, no un resultado de benchmark: validacion in-distribution con 32 prompts y 8 respuestas por prompt cada 50 actualizaciones, con umbral de pass@1 >= 0,98 sobre el entorno `UndamagedSubmatrixCounting`. No se especifica el valor final alcanzado.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 3,6 GB solo de pesos; con cache KV y overhead de runtime, entre 6 y 8 GB para secuencias de 1.024-2.048 tokens.
- VRAM en int8: alrededor de 1,9 GB de pesos; cabe en GPUs de 4-6 GB.
- VRAM en 4 bits (GGUF Q4 o AWQ/GPTQ): aproximadamente 1,0-1,2 GB de pesos; viable en GPUs de 4 GB y en CPU.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070/4080/4090; tambien en GPUs de 6-8 GB con cuantizacion. La generacion larga (1.024 tokens iniciales mas 128 de respuesta) penaliza poco por el tamano del modelo.
- GPU de servidor: L4, A10G, L40S y A100/H100 para servir con batching; una sola A100 no es necesaria por capacidad, pero si por throughput agregado.
- Despliegue: `transformers` (libreria declarada), TGI (el repo lleva el tag `text-generation-inference` y `endpoints_compatible`), vLLM (soporta Qwen2), y llama.cpp/Ollama tras convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia orientativa no medida, un modelo denso de 1,5-1,8 B en bf16 sobre una RTX 4090 suele generar del orden de 100-150 tokens/s con batch 1, y bastante mas con batching en A100/H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Este checkpoint (`rlve-opd-teacher-...-107-UndamagedSubmatrixCounting`) | 1,78 B | 32.768 (heredado, no declarado en la card) | Especialista GRPO en un unico entorno de conteo de submatrices | No declarada |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | 1,78 B | 32.768-131.072 segun config del modelo base | Razonamiento general destilado de DeepSeek-R1, orientado a matematicas y codigo | MIT |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32.768 | Asistente general con instrucciones, multilingue | Apache 2.0 |
| `davidheineman/opd-teacher-Q2.5I-Cornfield-step149` (mismo autor) | ~1,5 B | 32.768 | Teacher OPD/RLVE sobre el entorno `Cornfield`, 150 actualizaciones | No declarada |
| `davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025` (mismo autor) | ~1,78 B | No disponible | Mismo pipeline, entorno `NANDResultCounting` | No declarada |

La comparacion relevante no es de rendimiento general (no hay datos), sino de proposito: frente al modelo base, este checkpoint intercambia capacidad general por especializacion en un unico entorno; frente a los otros teachers de la coleccion, solo cambia el entorno de entrenamiento, lo que lo convierte en la pieza adecuada para experimentos controlados de scaling.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste RL se limita a un unico entorno (`UndamagedSubmatrixCounting`). Es esperable un deterioro notable en tareas generales y en conversacion abierta, aunque no se han publicado mediciones de ese olvido.
- Dependencia del formato: el entrenamiento usa 1.024 tokens iniciales mas una continuacion forzada de 128 tokens para la respuesta. Fuera de esa plantilla de prompt, el comportamiento del modelo no esta caracterizado.
- Validacion solo in-distribution: el criterio pass@1 >= 0,98 se mide sobre 32 prompts del mismo entorno. No hay evidencia de generalizacion a variantes de la tarea ni a dificultades distintas de 0/1.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base es MIT, la ausencia de licencia en el derivado impide asumir su uso comercial sin consultar al autor.
- Idiomas no documentados: no se declara lista de idiomas ni evaluacion multilingue; se hereda el sesgo del modelo base hacia ingles y chino.
- Riesgo de alucinacion y de repeticion: al ser un modelo de 1,78 B entrenado con RL sobre una tarea acotada, puede producir razonamientos plausibles pero incorrectos, o bucles, especialmente si se le saca del dominio.
- Sesgos: no evaluados. Se heredan los sesgos del corpus de Qwen2.5 y del proceso de destilacion de DeepSeek-R1.
- Presupuesto de entrenamiento acotado (4.000 rollouts, 499 actualizaciones): el checkpoint es un artefacto de investigacion, no un modelo validado para produccion.
- Metadatos a verificar: la fecha del nombre y de creacion del repositorio (2026-10-25) conviene contrastarla antes de citar el modelo en publicaciones.
- No incluye estado de optimizador ni de dataloader, por lo que no se puede reanudar el entrenamiento tal cual desde este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-107-UndamagedSubmatrixCounting-20261025
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Repositorio GitHub del proyecto RLVE: https://github.com/davidheineman/rlve
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/dc698908
- Paper de referencia del entorno (RLVE): https://arxiv.org/abs/2511.07317
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Checkpoint hermano (entorno 108, NANDResultCounting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Ejemplo de teacher de la misma familia en Featherless (Cornfield): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
- Ejemplo de teacher de la misma familia en Featherless (GoldWashing): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
