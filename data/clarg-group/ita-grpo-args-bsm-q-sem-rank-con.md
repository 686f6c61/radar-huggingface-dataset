# CLArg-group/ita-grpo-args-bsm-q-sem-rank-con

## Resumen

ita-grpo-args-bsm-q-sem-rank-con es un adaptador LoRA sobre Qwen/Qwen3-8B entrenado con GRPO para generar argumentos (de apoyo y de ataque) en el marco de la argumentación en tiempo de inferencia (ITA, inference-time argumentation). Lo desarrolla el grupo CLArg y forma parte del trabajo *Neurosymbolic Learning for Inference-Time Argumentation*. El modelo no emite un veredicto directamente: dado un claim, produce un conjunto de argumentos a favor y en contra que inducen un QBAF (Quantitative Bipolar Argumentation Framework) centrado en el claim.

El problema que resuelve es la verificación de afirmaciones (claim verification) con salida de tres clases (True / False / Uncertain) mediante un pipeline neurosimbólico: un modelo de puntuación base (BSM-Q primed & sem & rank & con) puntúa cada argumento generado y la semántica gradual DF-QUAD agrega esas puntuaciones en una fuerza del claim, que se umbraliza con α = 1/3 y β = 2/3. El generador se optimiza con una recompensa de argumentación que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral relevante.

La relevancia es acotada pero específica: es un componente de un sistema de investigación reproducible, con licencia MIT, publicado como adaptador PEFT de rango 8 (α = 32) sobre un backbone de 8.000 millones de parámetros. No está pensado como modelo de propósito general ni como clasificador autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (rank 8, α = 32, dropout 0.1; proyecciones query, key, value y output) |
| Parámetros totales | 8.000 millones en el backbone (no disponible el recuento exacto); adaptador LoRA de rango 8 (no disponible el número exacto de parámetros entrenables) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen/Qwen3-8B) |
| Tipos de cuantización | no disponible (adaptador PEFT en safetensors; la cuantización depende del backbone Qwen3-8B) |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base Qwen/Qwen3-8B y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el backbone Qwen3-8B, un transformer decoder-only. El adaptador tiene rango 8, α = 32 y dropout 0.1, y se aplica a las proyecciones query, key, value y output. Durante el entrenamiento el backbone permanece congelado y solo se actualizan los parámetros LoRA del generador. La semántica de agregación es DF-QUAD con la puntuación base del propio claim fijada en 0.5, y los umbrales de veredicto son fijos (α = 1/3, β = 2/3).

El entrenamiento usa GRPO mediante la librería TRL sobre el conjunto *TFU Training Claims* (1.000 claims etiquetados True / False / Uncertain). Cada completion muestreada se parsea en argumentos de apoyo y de ataque, se puntúa con el BSM (BSM-Q primed & sem & rank & con, congelado durante GRPO) y se evalúa con DF-QUAD; la fuerza resultante del claim se convierte en la recompensa de argumentación r<sub>α,β</sub> descrita en la sección 6 del paper, que es máxima para cualquier fuerza que produzca el veredicto correcto y decrece linealmente con la distancia al umbral correspondiente. Las completions no parseables reciben una recompensa fija de −1000. Hiperparámetros: learning rate 1e-5, 2 épocas, 2 generaciones por prompt, 450 pasos de optimización, semilla 0.

## Capacidades

- Generación de argumentos de apoyo y de ataque para un claim dado, en el formato que espera el pipeline ITA.
- Producción de la estructura argumental que induce un QBAF centrado en el claim, para su puntuación posterior por un BSM y agregación con DF-QUAD.
- Verificación de afirmaciones de tres clases (True / False / Uncertain) cuando se combina con el BSM y la semántica DF-QUAD; el adaptador por sí solo no emite el veredicto.
- Ajuste por recompensa orientado a la corrección del veredicto final, no a la fluidez del texto generado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el adaptador genera argumentos a favor y en contra de un claim que, puntuados por el BSM y agregados con DF-QUAD, producen un veredicto True / False / Uncertain con trazabilidad argumental.
- Investigación en aprendizaje neurosimbólico: sirve como generador de referencia para reproducir los resultados de las Tablas 1 y 4 del paper y para comparar variantes de BSM y de recompensa.
- Evaluación de sistemas de argumentación en tiempo de inferencia: al ser un componente aislado y con licencia MIT, permite sustituir el generador manteniendo fijo el resto del pipeline y medir el efecto en accuracy y balanced accuracy.
- Análisis de robustez en dominios externos: el resultado en AVeriTeC (balanced accuracy 0,468) lo hace útil para estudiar la degradación del pipeline al salir del dominio de entrenamiento TFU.
- Generación de explicaciones estructuradas para revisión humana: los argumentos de apoyo y ataque producidos pueden presentarse a un analista junto con la fuerza agregada del claim, en lugar de una etiqueta opaca.
- Docencia y experimentación con GRPO: el adaptador y sus hiperparámetros documentados (learning rate 1e-5, 450 pasos, 2 generaciones por prompt) permiten reproducir el entrenamiento con TRL sobre un backbone de 8.000 millones de parámetros.

## Benchmarks y rendimiento

Resultados reportados en las Tablas 1 y 4 del paper, con este generador emparejado con BSM-Q (primed & sem & rank & con) en el momento de la evaluación:

| Dataset | Métrica | Puntuación |
|---|---|---|
| TFU Evaluation Claims | accuracy | 0,581 |
| AVeriTeC | balanced accuracy | 0,468 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- El adaptador LoRA es de tamaño despreciable (repositorio de 0,0 GB); el coste de hardware lo determina el backbone Qwen3-8B.
- VRAM estimada para inferencia del backbone en bfloat16: aproximadamente 16 GB solo para pesos, más caché KV y overhead; en cuantización de 8 bits, del orden de 8-9 GB; en 4 bits, del orden de 5-6 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por los autores.
- GPU recomendadas: A100 o H100 para ejecución en bfloat16 con contexto largo y throughput alto; RTX 4090 (24 GB) para bfloat16 ajustado o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bfloat16 con contexto moderado, y en tarjetas de 12-16 GB con cuantización de 4-8 bits.
- Opciones de despliegue: carga directa con transformers y peft (`PeftModel.from_pretrained` sobre Qwen/Qwen3-8B); el repositorio ITA espera el checkpoint en `checkpoints/ita-grpo-args-bsm-q-sem-rank-con/`. Para servir el backbone en producción se puede usar vLLM o TGI, aunque la información disponible no documenta integración del adaptador con esos servidores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros generadores de argumentos comparables ni de sus especificaciones. La comparación relevante es interna al paper (distintas combinaciones de generador y BSM), pero los datos de esas variantes no se incluyen en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Resultado TFU (accuracy) |
|---|---|---|---|---|
| ita-grpo-args-bsm-q-sem-rank-con | 8.000 M (backbone) + LoRA r=8 | no disponible | MIT | 0,581 |
| Alternativas del paper | no disponible | no disponible | no disponible | no disponible |
| Modelos de verificación de claims de propósito general | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador no es un clasificador autónomo: requiere el BSM y la semántica DF-QUAD para producir un veredicto; usarlo de forma aislada no da etiquetas True / False / Uncertain.
- Rendimiento modesto: accuracy de 0,581 en TFU Evaluation Claims y balanced accuracy de 0,468 en AVeriTeC, cercana al azar en el conjunto externo; no es adecuado para producción de fact-checking sin supervisión humana.
- Entrenado sobre solo 1.000 claims del conjunto TFU Training Claims, con 450 pasos de optimización y semilla 0; riesgo de sobreajuste al dominio y de alta varianza entre ejecuciones.
- Las completions no parseables reciben recompensa −1000, lo que indica que el formato de salida es frágil y puede romperse fuera de la distribución de prompts esperada.
- Sesgos conocidos: no documentados en la información disponible; al heredar el backbone Qwen3-8B, puede arrastrar los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: los argumentos generados pueden ser plausibles pero falsos; el pipeline no verifica la veracidad de cada argumento, solo su efecto agregado en la fuerza del claim.
- Idiomas soportados y comportamiento multilingüe: no disponibles.
- Licencia MIT para los pesos, pero el uso queda sujeto además a la licencia de Qwen/Qwen3-8B y a los términos de los datos de entrenamiento descritos en el repositorio; conviene revisarlos antes de un uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta y sin pipeline declarado; la integración esperada es mediante el repositorio ITA, no como modelo autónomo en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CLArg-group/ita-grpo-args-bsm-q-sem-rank-con
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Base score model asociado: https://huggingface.co/CLArg-group/ita-bsm-q-sem-rank-con
- Repositorio del proyecto (código de entrenamiento, evaluación y prompts): https://github.com/CLArg-group/inference-time-argumentation
- Librería TRL: https://github.com/huggingface/trl
- Paper *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible el enlace en la información proporcionada
