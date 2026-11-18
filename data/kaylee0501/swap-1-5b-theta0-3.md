# Kaylee0501/SwAP-1.5B-theta0.3

## Resumen

SwAP-1.5B-theta0.3 es un ajuste fino de razonamiento sobre deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario Kaylee0501 en Hugging Face. El modelo aplica SwAP (Step-wise Adaptive Penalization), el metodo presentado en el articulo de NeurIPS 2026 "Stepwise Penalization for Length-Efficient Chain-of-Thought Reasoning", cuyo objetivo es reducir la longitud de las cadenas de razonamiento sin sacrificar precision. La idea central es penalizar cada paso de razonamiento en funcion de su contribucion real a la respuesta correcta, estimada a partir de la mejora de log-probabilidad on-policy del propio modelo.

El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parametros totales (aproximadamente 1,5B en nomenclatura comercial) y pesos en formato safetensors. El repositorio ocupa 3,6 GB. Esta pensado para tareas de matematicas de competicion y razonamiento de multiples pasos, y su propuesta de valor es clara: mantener o mejorar la precision del modelo base reduciendo de forma drastica los tokens generados, lo que abarata la inferencia y reduce la latencia.

El checkpoint corresponde al paso 1240 de entrenamiento con theta = 0.3, el hiperparametro que pondera la ventaja de proceso a nivel de paso dentro de GRPO. Segun la model card, el modelo mejora la precision media en cinco benchmarks de razonamiento (de 47,6 a 51,6) mientras reduce la longitud media de respuesta de 9.383 a 3.630 tokens, una reduccion de aproximadamente el 61 por ciento. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, es decir, un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parametros. El ajuste no modifica la topologia: se parte del checkpoint destilado de DeepSeek-R1 y se aplica un entrenamiento de refuerzo adicional orientado a eficiencia de longitud. El modelo conserva la plantilla de chat del modelo base.

El entrenamiento usa GRPO con una ventaja unificada de resultado y proceso: A = beta * A_outcome + theta * 1[correcto] * A_process, con beta = 1 y theta = 0.3. Los datos son DeepScaleR (40.000 problemas de matematicas de competicion, dataset agentica-org/DeepScaleR-Preview-Dataset). La recompensa de paso se calcula como la ganancia de log-probabilidad de la respuesta tras cada paso de razonamiento de aproximadamente 350 tokens, con un maximo de 20 pasos; el peso de la recompensa de paso es 0.5, el de la penalizacion de paso 0.3, el coeficiente de penalizacion de longitud 1.0 y la penalizacion maxima por paso 0.15. La optimizacion emplea lotes de 64 prompts, mini-lotes PPO de 32, tasa de aprendizaje 1e-6, perdida KL de 1e-3 (KL de baja varianza), temperatura de rollout 1.0 y longitud maxima de respuesta de 12.000 tokens, con 16 rollouts por prompt. El framework de entrenamiento es verl.

La innovacion tecnica es la redistribucion de la masa de penalizacion por longitud: los pasos de baja importancia reciben penalizaciones mayores y los pasos de alta importancia se preservan, lo que produce cadenas de razonamiento mas cortas sin eliminar el razonamiento critico.

## Capacidades

- Generacion de texto conversacional con plantilla de chat compatible con el modelo base.
- Razonamiento matematico de multiples pasos con cadenas de pensamiento (chain-of-thought) y respuesta final en formato \boxed{}.
- Razonamiento eficiente en longitud: produce cadenas de pensamiento sustancialmente mas cortas que el modelo base con precision igual o superior en los benchmarks reportados.
- Resolucion de problemas de matematicas de competicion (MATH-500, AMC23, AIME24, AIME25).
- Razonamiento cientifico de nivel graduado (GPQA-Diamond).
- Compatible con text-generation-inference y con endpoints compatibles segun los tags del repositorio.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte explicito de agentes o razonamiento multi-paso con herramientas.
- Capacidades multilingues limitadas al ingles segun el campo language de la model card.
- No se documenta vision, audio ni modo thinking separado mas alla de la cadena de pensamiento generada.

## Casos de uso

- Resolucion de problemas de matematicas de competicion en produccion: el modelo genera cadenas de razonamiento de unos 3.630 tokens de media frente a los 9.383 del modelo base, lo que reduce el coste por consulta en escenarios de evaluacion masiva de problemas tipo MATH o AMC.
- Tutoria matematica automatizada: puede recibir un problema del usuario con la instruccion de razonar paso a paso y devolver la respuesta en \boxed{}, con cadenas mas cortas que facilitan la lectura y la supervision humana.
- Generacion de soluciones en pipelines de evaluacion de modelos: sirve como referencia eficiente para medir pass@1 en benchmarks de razonamiento sin incurrir en el coste de tokens de modelos de razonamiento mas verbosos.
- Preprocesado de datos sinteticos de razonamiento: al producir cadenas de pensamiento compactas, es util para generar trazas de entrenamiento de bajo coste para modelos menores o para destilacion.
- Despliegue en entornos con presupuesto de tokens limitado: la reduccion de longitud permite servir mas peticiones por GPU y cumplir limites estrictos de max_tokens en APIs.
- Investigacion sobre eficiencia de razonamiento: el checkpoint permite reproducir y comparar el efecto de theta en la relacion precision-longitud frente al modelo base, usando el mismo script de evaluacion.
- Aplicaciones educativas de respuesta breve: para preguntas cientificas de nivel graduado (GPQA-Diamond) donde se prefiere una justificacion concisa a una cadena de miles de tokens.

## Benchmarks y rendimiento

Resultados reportados en la model card (pass@1 en % / longitud media de respuesta en tokens; temperatura 0.8, top-p 0.95, maximo 16.384 tokens nuevos, 16 muestras por problema):

| Modelo | MATH-500 | AMC23 | AIME24 | AIME25 | GPQA-Diamond | Media |
|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 85,0 / 4832 | 69,5 / 8055 | 26,5 / 12281 | 22,3 / 12312 | 34,5 / 9437 | 47,6 / 9383 |
| SwAP-1.5B-theta0.3 | 87,1 / 1464 | 76,6 / 2518 | 34,2 / 4975 | 22,5 / 4405 | 37,8 / 4788 | 51,6 / 3630 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 3,6 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica, entre 5 y 8 GB segun longitud de contexto y tamano de lote.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 2 GB para pesos; con 4 bits, alrededor de 1 GB para pesos. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados en la model card.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia alta y contextos largos; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB con cuantizacion.
- Opciones de despliegue: vLLM (usado en el ejemplo oficial de la model card), text-generation-inference (tag del repositorio) y transformers. No se documenta soporte verificado de llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada. La reduccion de longitud de respuesta (de 9.383 a 3.630 tokens de media) implica una reduccion proporcional del tiempo de generacion y del coste por consulta en decodificacion autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmarks (pass@1) | Longitud media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SwAP-1.5B-theta0.3 | 1,777B | No disponible | 51,6 | 3.630 tokens | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B (aprox.) | No disponible | 47,6 | 9.383 tokens | No disponible en la informacion proporcionada | Hugging Face |
| Alternativas de razonamiento de ~1,5B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion con datos verificables en la informacion proporcionada es frente al modelo base. No se dispone de resultados de otros modelos de razonamiento de tamano similar (por ejemplo, destilados de Qwen2.5-Math) en la documentacion facilitada, por lo que no se incluyen cifras que no esten respaldadas.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Esta especializado en matematicas de competicion y razonamiento cientifico; su rendimiento en tareas generales de texto, codigo o dialogo abierto no esta evaluado en la model card.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados: las cadenas de pensamiento pueden contener pasos plausibles pero incorrectos, y la respuesta final en \boxed{} no garantiza correccion.
- La penalizacion de longitud puede, en problemas que requieren razonamiento muy extenso, truncar pasos necesarios; el propio benchmark AIME25 muestra una mejora marginal (22,3 a 22,5) frente a mejoras mayores en otros conjuntos.
- El modelo es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente de los resultados reportados.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Qwen-1.5B tiene sus propias condiciones que conviene verificar antes de un despliegue en produccion.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de sesgo; en produccion habria que anadir capas de moderacion.
- El contexto maximo no esta especificado en la model card; conviene consultar la configuracion del modelo base antes de fijar limites de max_tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaylee0501/SwAP-1.5B-theta0.3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Paper citado (NeurIPS 2026): Stepwise Penalization for Length-Efficient Chain-of-Thought Reasoning (Li et al.); no se proporciona URL en la informacion disponible.
