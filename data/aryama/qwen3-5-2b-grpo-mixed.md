# Aryama/qwen3.5-2b-grpo-mixed

## Resumen

`Aryama/qwen3.5-2b-grpo-mixed` es un adaptador LoRA entrenado sobre Qwen3.5-2B (Qwen/Qwen3.5-2B) mediante el algoritmo Dr. GRPO (GRPO sin normalización por la desviación típica de la recompensa). Fue desarrollado por un equipo de estudiantes del IIIT Hyderabad como parte de un proyecto de Advanced NLP, y constituye el mejor modelo de su estudio: un único adaptador que resuelve problemas matemáticos (SOLVE), evalúa soluciones paso a paso detectando errores (JUDGE) y reconstruye soluciones a partir de pistas (RECONSTRUCT).

El problema que aborda es la especialización excesiva de los modelos afinados con RL: en lugar de entrenar un especialista por tarea, este adaptador se entrena con una mezcla equilibrada de las tres tareas, logrando igualar al especialista en SOLVE, superar al especialista en JUDGE en detección de errores y mantener un rendimiento cercano al especialista en RECONSTRUCT, sin transferencia negativa entre tareas.

El adaptador pesa unos 0,3 GB (62,5 millones de parámetros entrenables, r=64) y se aplica sobre el modelo base de 2B parámetros con plantilla de chat non-thinking. Es relevante como ejemplo reproducible y ligero de RL por grupos de respuestas sobre tareas de razonamiento matemático, con código, prompts y datasets publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-2B (transformer) |
| Parametros totales | 62,5M entrenables (LoRA); modelo base: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Evaluado hasta 32k tokens (16k primera pasada continuada a 32k); límite del modelo base: no disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA usa rango 64 y alpha 64, sin dropout, aplicado a todas las proyecciones de atención y MLP del modelo base, lo que da 62,5 millones de parámetros entrenables. El entrenamiento se realizó con Dr. GRPO: sin normalización de recompensa por desviación típica, con normalizador de longitud constante, 8 respuestas por pregunta, una actualización por lote, KL β = 0 y ratio de importancia a nivel de token contra los log-probs de muestreo de vLLM (acotado a 2). El hardware de entrenamiento fueron 2 GPUs L40S.

La recompensa es específica de cada tarea: respuesta verificada para SOLVE; veredicto, paso y explicación para JUDGE; rúbrica escalonada para RECONSTRUCT. Las respuestas truncadas o con formato incorrecto puntúan 0. La receta usó learning rate 2e-5 con warm-up de 5 pasos, 30 preguntas × 8 respuestas por paso (10 + 10 + 10 por tarea, con rollouts solapados) durante 80 pasos, seleccionándose el paso 75 por mejor recompensa combinada; se vieron 750 preguntas por tarea. El dataset de entrenamiento y evaluación es `Aryama/deepmath-solve-judge-reconstruct`, derivado de DeepMath. No hubo RLHF/DPO clásico: el ajuste es íntegramente por recompensa verificable por tarea.

## Capacidades

- Resolución de problemas matemáticos (SOLVE): 69,8 % de acierto en el test FINAL-v3, con mejora de +17,1 puntos frente al modelo base sin entrenar.
- Evaluación de soluciones matemáticas paso a paso (JUDGE): 87,0 % de veredictos correctos y solo 7,5 % de falsas alarmas, detectando errores en soluciones con mejora de +32,2 puntos sobre el modelo base.
- Reconstrucción de soluciones (RECONSTRUCT): puntuación 58,4 en la rúbrica PC-v4, mejora de +18,3 puntos sobre el modelo base.
- Generación de texto general heredada de Qwen3.5-2B (pipeline text-generation), sin garantías de mejora fuera de las tres tareas entrenadas.
- Uso como solver y judge en pipelines de autoverificación (se empleó en la fase 3 del estudio de self-verification del proyecto).
- No hay soporte documentado de tool calling, agentes, visión ni audio.

## Casos de uso

- Verificación automática de soluciones matemáticas en plataformas educativas: el modelo puede actuar como juez que revisa soluciones paso a paso de estudiantes y señala el primer error, con una tasa de falsas alarmas baja (7,5 %), lo que reduce falsos negativos injustos.
- Generación de soluciones matemáticas con verificación: al ser un adaptador único con capacidades de SOLVE y JUDGE, puede integrarse en un bucle generate-and-verify en el mismo modelo, simplificando el despliegue frente a usar dos modelos especializados.
- Reconstrucción de demostraciones incompletas: dada una solución parcial o con pasos ocultos, el modelo completa el razonamiento, útil para generación de material didáctico o rellenado de soluciones en datasets sintéticos.
- Investigación en RL para razonamiento: la receta Dr. GRPO, los prompts v2 y el código están publicados, lo que lo hace adecuado como baseline reproducible para estudios de multi-task RL en modelos pequeños.
- Filtrado de datos sintéticos de razonamiento: como juez con 87,0 % de precisión de veredicto, puede puntuar soluciones generadas por otros modelos antes de incorporarlas a datasets de entrenamiento.
- Despliegue eficiente en producción ligera: al ser un LoRA de 0,3 GB sobre un modelo de 2B, puede servirse con vLLM con múltiples adaptadores simultáneos en una sola GPU, ideal para servicios con varias tareas de razonamiento matemático.

## Benchmarks y rendimiento

Resultados publicados por los autores en los test sets FINAL-v3 (400 preguntas por tarea; IC bootstrap al 95 % sobre preguntas; una semilla de entrenamiento). Cambio pareado frente a Qwen3.5-2B sin entrenar; en falsas alarmas, menor es mejor:

| Modelo | SOLVE acc | JUDGE step % | JUDGE false alarm | JUDGE Youden J | RECON PC-v4 |
|---|---|---|---|---|---|
| Mixed ⅓ cada tarea (paso 75) | +17,1 [+14,3, +19,9] | +32,2 [+25,9, +38,6] | −29,8 [−34,2, −25,5] | +45,4 [+37,4, +52,6] | +18,3 [+16,1, +20,5] |

Valores absolutos reportados: SOLVE 69,8 %; JUDGE veredicto 87,0 % (Qwen3.5-9B: 87,6 %); falsas alarmas 7,5 % (9B: 17,8 %); RECONSTRUCT 58,4. El modelo iguala al especialista SOLVE (+0,6, no significativo), supera al especialista JUDGE en +15,0 en detección de errores, queda 3,0 puntos por debajo del especialista RECONSTRUCT y no muestra transferencia negativa. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador añade ~0,3 GB sobre el modelo base; el requisito dominante es la VRAM de Qwen3.5-2B en bfloat16, estimada en ~4-6 GB incluyendo KV cache, lo que cabe en GPUs de consumo como una RTX 4090 (24 GB) o incluso RTX 3060 de 12 GB con margen para contextos largos.
- Para entrenamiento, la receta original usó 2 × NVIDIA L40S (48 GB cada una).
- Despliegue con vLLM: `vllm serve Qwen/Qwen3.5-2B --enable-lora --max-lora-rank 64 --lora-modules mixed=Aryama/qwen3.5-2b-grpo-mixed`.
- Despliegue con PEFT/transformers: cargar el base con `Qwen3_5ForConditionalGeneration` en bfloat16 y aplicar `PeftModel.from_pretrained`.
- No se documenta compatibilidad con llama.cpp, Ollama o TGI para este adaptador; no disponible.
- No hay mediciones de latencia ni throughput publicadas; no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/qwen3.5-2b-grpo-mixed | LoRA multi-tarea (Dr. GRPO) | 62,5M | SOLVE + JUDGE + RECONSTRUCT | Apache 2.0 | HF, con código y dataset |
| Aryama/qwen3.5-2b-grpo-solve | LoRA especialista SOLVE | No disponible | SOLVE | Apache 2.0 | HF |
| Aryama/qwen3.5-2b-grpo-judge | LoRA especialista JUDGE | No disponible | JUDGE | Apache 2.0 | HF |
| Aryama/qwen3.5-2b-grpo-reconstruct | LoRA especialista RECONSTRUCT | No disponible | RECONSTRUCT | Apache 2.0 | HF |

Frente a los especialistas de la misma serie, el adaptador mixed iguala a SOLVE (+0,6, no significativo), supera a JUDGE en +15,0 en detección de errores y queda 3,0 puntos por debajo de RECONSTRUCT, siendo el único que cubre las tres tareas con un solo adaptador. Comparativas con modelos externos de tamaño similar (por ejemplo, otros modelos de ~2B afinados para matemáticas) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Una sola semilla de entrenamiento por brazo experimental: los resultados tienen incertidumbre no cuantificada entre semillas.
- Los brazos de tarea única usan recetas y cantidades de datos distintas, por lo que las comparaciones entre tareas mezclan efectos de tarea y de receta.
- Las puntuaciones de rúbrica de JUDGE y RECONSTRUCT provienen de un juez Qwen3.8-27B calibrado contra DeepSeek (correlación 0,94 / 0,84), no de verificación humana exhaustiva.
- El paso 75 se eligió por mejor recompensa de entrenamiento rodante, no por validación en dev, lo que introduce riesgo de sobreajuste al conjunto de entrenamiento.
- Entrenado y evaluado solo en inglés; no hay garantías de rendimiento en otros idiomas, incluido el castellano.
- Las respuestas se puntúan tras filtros estrictos de formato: en uso libre, el modelo puede producir respuestas truncadas o mal formateadas que degradarían su rendimiento frente a las cifras publicadas.
- Fuera de las tres tareas entrenadas (SOLVE, JUDGE, RECONSTRUCT con los prompts v2 del proyecto), el comportamiento es el del modelo base y no está caracterizado.
- Como todo modelo de lenguaje, puede alucinar; en JUDGE la tasa de falsas alarmas de 7,5 % implica que aproximadamente 1 de cada 13 soluciones correctas sería marcada como errónea, algo a considerar en aplicaciones de alto impacto.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas.
- El modelo base Qwen3.5-2B se usa con plantilla de chat non-thinking; el rendimiento con otras plantillas no está documentado.

## Enlaces

- Modelo: https://huggingface.co/Aryama/qwen3.5-2b-grpo-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset: https://huggingface.co/datasets/Aryama/deepmath-solve-judge-reconstruct
- Adaptador SOLVE: https://huggingface.co/Aryama/qwen3.5-2b-grpo-solve
- Adaptador JUDGE: https://huggingface.co/Aryama/qwen3.5-2b-grpo-judge
- Adaptador RECONSTRUCT: https://huggingface.co/Aryama/qwen3.5-2b-grpo-reconstruct
- Código y reports del proyecto: https://github.com/MukundHebbar/anlp-project/tree/release
- Paper: no disponible
