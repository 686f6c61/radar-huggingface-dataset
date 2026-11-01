# Aryama/qwen3.5-2b-grpo-judge

## Resumen

Aryama/qwen3.5-2b-grpo-judge es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por Aryama V Murthy, Mukund Hebbar, Yashas Nataraj Kotre y Anivarth Varma Penumetcha (IIIT Hyderabad) en el marco de un proyecto de NLP avanzado. El adaptador se ha entrenado específicamente para la tarea JUDGE: dado un problema matemático y una solución numerada por pasos, el modelo debe decidir si la solución es correcta y, en caso contrario, identificar el primer paso erróneo. El modelo base es un transformer denso de 2 mil millones de parámetros con plantilla de chat sin modo de razonamiento (non-thinking).

La relevancia de este adaptador radica en su enfoque metodológico: aplica Dr. GRPO (una variante de GRPO sin normalización por desviación estándar de la recompensa y con normalizador de longitud constante) sobre un subconjunto muy pequeño de datos (208 preguntas vistas) para especializar un modelo pequeño en una habilidad concreta de verificación matemática. Según la model card, el adaptador mejora la precisión de veredicto JUDGE del 64,3% al 78,5% y reduce las falsas alarmas del 37,2% al 13,0% respecto al modelo base sin entrenar.

El adaptador tiene 62,5 millones de parámetros entrenables (r=64, α=64) y se distribuye como pesos PEFT en safetensors con licencia Apache 2.0. Está pensado como componente de un pipeline de verificación y no como modelo de propósito general: su uso previsto son los prompts v2 del proyecto y las compuertas estrictas de formato definidas por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3.5-2B |
| Parametros totales | 62,5 M entrenables en el adaptador (tamaño del modelo base no disponible en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16k tokens en muestreo; evaluacion con primera pasada a 16k continuada a 32k |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B (revision 15852e8c1636) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer denso de 2B parámetros, mediante LoRA de rango 64 y α 64, sin dropout, sobre todas las proyecciones de atención y MLP (62,5 M parámetros entrenables). El entrenamiento usa Dr. GRPO: sin normalización por desviación estándar de la recompensa, normalizador de longitud constante, 8 respuestas por pregunta, una actualización por lote, KL β = 0 y ratio de importancia a nivel de token contra los log-probabilidades de muestreo de vLLM (capado a 2). La receta emplea lr 5e-5 constante, 8 preguntas × 8 respuestas por paso, AdamW con grad clip 1.0, temperatura de muestreo 1.0 y tope de 16k tokens, sobre 2 × L40S.

La función de recompensa es escalonada: 0 para un veredicto incorrecto; en caso contrario, 0,5 + 0,25 · [primer paso erróneo correcto] + 0,25 · min(8, E + M)/8, donde E (explicación) y M (solidez) son niveles asignados por un juez LLM (Jev). Las respuestas truncadas o que no superan las compuertas de formato puntúan 0. Se eligió el paso 26 de 104 por mejor precisión de veredicto y de paso en dev entre los pasos 26/52/78/104; en total, el modelo vio 208 preguntas. El dataset de entrenamiento es Aryama/deepmath-solve-judge-reconstruct.

## Capacidades

- Verificación de soluciones matemáticas: emite un veredicto de corrección sobre una solución numerada por pasos.
- Localización de errores: identifica el primer paso incorrecto de una solución (error-finding del 52,0% en el conjunto de test, frente al 34,8% del modelo base).
- Generación de explicaciones y evaluación de solidez: la recompensa incorpora niveles de explicación (E) y solidez (M) emitidos por un juez LLM.
- Razonamiento matemático en inglés: el adaptador está entrenado y evaluado únicamente en inglés.
- Integración con vLLM mediante `--enable-lora --max-lora-rank 64` y con PEFT/Transformers.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.
- No se documenta modo de razonamiento (thinking): el adaptador usa la plantilla de chat non-thinking del modelo base.

## Casos de uso

- Verificación automática de soluciones en plataformas de práctica matemática: el adaptador recibe un problema y una solución paso a paso y devuelve veredicto y primer paso erróneo, lo que permite dar retroalimentación localizada al estudiante sin revisión humana.
- Filtrado de datos sintéticos de razonamiento: en pipelines de generación de soluciones matemáticas, el adaptador actúa como juez para descartar soluciones incorrectas antes de incluirlas en un dataset de entrenamiento.
- Componente de un sistema de recompensas para RL: al ser un adaptador LoRA de 62,5 M de parámetros sobre un base de 2B, puede desplegarse como juez económico en bucles de RL o de auto-consistencia donde un juez grande resultaría caro.
- Evaluación de cadenas de razonamiento en producción: integrado vía vLLM con `--enable-lora`, permite servir el adaptador junto al modelo base y comparar veredictos sobre lotes de soluciones generadas por otros modelos.
- Investigación en verificación matemática: sirve como línea base reproducible para estudiar el efecto de Dr. GRPO en tareas de juicio, con receta, datos y semilla documentados en el repositorio de código.
- Detección de errores en asistentes de resolución de problemas: el adaptador puede señalar el primer paso fallido de una solución generada por un LLM, lo que facilita la depuración de prompts y la evaluación de la calidad del razonamiento.
- Reutilización de capas como inicialización: según la model card, copiar las capas LoRA 0–5 del adaptador JUDGE al adaptador SOLVE añade +15,3 F1 en ProcessBench, por lo que el adaptador también sirve como fuente de pesos para especializaciones relacionadas.

## Benchmarks y rendimiento

Resultados del adaptador JUDGE (paso 26) frente al Qwen3.5-2B sin entrenar, sobre los conjuntos de test FINAL-v3 (400 preguntas por tarea, IC bootstrap del 95% sobre preguntas, una semilla de entrenamiento). Para falsas alarmas, un valor negativo es mejor.

| Metrica | Adaptador JUDGE | Qwen3.5-2B sin entrenar | Cambio pareado [IC 95%] |
|---|---|---|---|
| SOLVE acc | no disponible (valor absoluto) | no disponible (valor absoluto) | −1,1 [−4,1, +1,9] |
| JUDGE step % | no disponible (valor absoluto) | no disponible (valor absoluto) | +17,2 [+10,2, +24,0] |
| JUDGE false alarm | no disponible (valor absoluto) | no disponible (valor absoluto) | −24,2 [−29,2, −19,4] |
| JUDGE Youden J | no disponible (valor absoluto) | no disponible (valor absoluto) | +28,4 [+19,5, +36,9] |
| RECON PC-v4 | no disponible (valor absoluto) | no disponible (valor absoluto) | +6,0 [+3,3, +8,6] |

Precisión de veredicto JUDGE en test: 78,5% (sin entrenar 64,3%). Error-finding: 52,0% (sin entrenar 34,8%). Falsas alarmas: 13,0% (sin entrenar 37,2%). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.5-2B y de la cuantización elegida, no del adaptador (62,5 M de parámetros).
- GPU de entrenamiento documentadas: 2 × NVIDIA L40S.
- GPU recomendadas para inferencia: no disponible; por el tamaño del base (2B), es previsible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Despliegue con vLLM: `vllm serve Qwen/Qwen3.5-2B --enable-lora --max-lora-rank 64 --lora-modules judge=Aryama/qwen3.5-2b-grpo-judge`.
- Despliegue con PEFT/Transformers: carga del base con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16")` y `PeftModel.from_pretrained`.
- Opciones como llama.cpp, Ollama o TGI: no documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/qwen3.5-2b-grpo-judge | 62,5 M entrenables sobre base 2B | 16k en muestreo (32k en evaluación) | LoRA + Dr. GRPO para juez matemático | apache-2.0 | HuggingFace (14 descargas) |
| Aryama/qwen3.5-2b-grpo-solve | no disponible | no disponible | LoRA + GRPO para resolver problemas | apache-2.0 | HuggingFace |
| Aryama/qwen3.5-2b-grpo-reconstruct | no disponible | no disponible | LoRA + GRPO para reconstrucción | apache-2.0 | HuggingFace |
| Aryama/qwen3.5-2b-grpo-mixed | no disponible | no disponible | LoRA + GRPO multitarea | apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks de los adaptadores hermanos en la información proporcionada, por lo que la comparación cuantitativa entre ellos no está disponible.

## Limitaciones y advertencias

- Una sola semilla por brazo experimental: los resultados no incorporan variabilidad entre semillas.
- Los brazos de una sola tarea usan recetas y cantidades de datos distintas, por lo que las comparaciones entre tareas mezclan efectos de tarea y de receta.
- Las puntuaciones de rúbrica de JUDGE y RECONSTRUCT provienen de un juez Qwen3.8-27B calibrado contra DeepSeek (r 0,94 / 0,84), lo que introduce dependencia del juez.
- El adaptador solo está entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- Está especializado en una única tarea (JUDGE) y depende de los prompts v2 del proyecto y de compuertas estrictas de formato; fuera de ese formato las respuestas puntúan 0.
- Riesgo de alucinación en la identificación del primer paso erróneo: la precisión de error-finding es del 52,0%, por lo que aproximadamente la mitad de los errores no se localizan correctamente.
- El adaptador no es un modelo autónomo: requiere el modelo base Qwen/Qwen3.5-2B en la revisión 15852e8c1636.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías de robustez en dominios distintos de la verificación matemática.
- El número de descargas (14) y de likes (0) indica una adopción muy limitada y poca validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aryama/qwen3.5-2b-grpo-judge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/Aryama/deepmath-solve-judge-reconstruct
- Adaptador SOLVE: https://huggingface.co/Aryama/qwen3.5-2b-grpo-solve
- Adaptador RECONSTRUCT: https://huggingface.co/Aryama/qwen3.5-2b-grpo-reconstruct
- Adaptador MIXED: https://huggingface.co/Aryama/qwen3.5-2b-grpo-mixed
- Código y memorias del proyecto: https://github.com/MukundHebbar/anlp-project/tree/release
