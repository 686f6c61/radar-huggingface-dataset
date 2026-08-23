# rk9595/thinking-budget-qwen1.5b-lcpo

## Resumen

`thinking-budget-qwen1.5b-lcpo` es un adaptador LoRA desarrollado por rk9595 que se monta sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. Su objetivo es permitir controlar explícitamente el número de tokens de razonamiento que el modelo emplea antes de emitir una respuesta, mediante instrucciones como `Think for maximum N tokens.` en el prompt. Esta capacidad de ajustar el presupuesto de cómputo en tiempo de inferencia resulta especialmente útil en escenarios donde se necesita equilibrar precisión y latencia de forma dinámica.

El modelo reproduce la receta L1/LCPO descrita en el artículo de Aggarwal y Welleck (2025) (arXiv:2503.03397), utilizando entrenamiento con GRPO sobre el dataset de matemáticas de competición `agentica-org/DeepScaleR-Preview-Dataset`. La recompensa combina la corrección de la respuesta con una penalización proporcional a la desviación entre el presupuesto solicitado y los tokens realmente utilizados, con un factor α = 3e-4. El adaptador se distribuye en formato PEFT (safetensors) y también incluye cuantizaciones GGUF (Q4_K_M y Q8_0) para su uso en llama.cpp.

La relevancia de este modelo radica en que aborda el problema del coste computacional en modelos de razonamiento: en lugar de fijar un presupuesto fijo de tokens de pensamiento, permite al usuario especificarlo por petición, lo que facilita el despliegue en entornos con restricciones de latencia o coste. No obstante, se trata de un proyecto de investigación con pocas descargas y sin resultados de benchmarks publicados hasta la fecha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre DeepSeek-R1-Distill-Qwen-1.5B) |
| Parámetros totales | 1.5B (modelo base) + adaptador LoRA r=32 (tamaño no especificado) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | No disponibles (el modelo base DeepSeek-R1-Distill-Qwen-1.5B es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con rango r=32 que se aplica sobre el modelo base `DeepSeek-R1-Distill-Qwen-1.5B`, una variante destilada de DeepSeek-R1 con arquitectura transformer decoder-only y activación SwiGLU. El adaptador se entrenó con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas de competición `DeepScaleR-Preview-Dataset`. La función de recompensa utilizada es `r = 1[answer correct] − α·|N − tokens_used|`, con α = 3e-4, donde `N` es el presupuesto de tokens solicitado y `tokens_used` los tokens efectivamente generados. La corrección de la respuesta se evalúa con la librería `math-verify` sobre la respuesta final encerrada en `\boxed{}`.

El entrenamiento reproduce la receta L1/LCPO del paper de Aggarwal y Welleck (2025), que introduce un mecanismo para que el modelo aprenda a ajustar la longitud de su razonamiento en función de la petición del usuario. La variante `-max` mencionada en la model card penaliza solo el exceso de tokens, no la falta. El adaptador se entrena durante 1000 pasos con el script `train_grpo.py` incluido en el repositorio.

## Capacidades

- Razonamiento con control de presupuesto: el modelo puede seguir instrucciones del tipo `Think for maximum N tokens.` para limitar su razonamiento interno a un número aproximado de tokens.
- Razonamiento matemático: entrenado específicamente en problemas de matemáticas de competición (dataset DeepScaleR), muestra buen rendimiento en tareas de cálculo y demostración matemática.
- Generación de texto: hereda las capacidades del modelo base DeepSeek-R1-Distill-Qwen-1.5B, incluyendo generación de texto general, razonamiento paso a paso y respuesta a preguntas.
- Ajuste de latencia bajo demanda: permite escalar la calidad de la respuesta en función del presupuesto de cómputo disponible, desde respuestas rápidas y menos elaboradas hasta razonamientos extensos.
- Compatibilidad con cuantización GGUF: los pesos cuantizados (Q4_K_M, Q8_0) permiten ejecución eficiente en CPU y GPU consumer con llama.cpp.

## Casos de uso

- **Optimización de coste en APIs de razonamiento**: en un servicio que cobra por token de salida, el modelo permite fijar un presupuesto máximo por petición, garantizando un coste predecible sin sacrificar demasiada precisión en preguntas sencillas.
- **Atención al cliente con control de latencia**: un chatbot puede usar presupuestos cortos (p. ej., 200 tokens) para preguntas frecuentes y presupuestos largos (p. ej., 2000 tokens) para consultas complejas, manteniendo un tiempo de respuesta objetivo.
- **Evaluación de modelos de razonamiento**: permite estudiar la relación entre presupuesto de tokens y precisión en problemas matemáticos, útil para investigación en test-time compute.
- **Sistemas educativos de matemáticas**: el modelo puede generar soluciones paso a paso con un nivel de detalle controlable, ajustando la longitud de la explicación según el nivel del estudiante.
- **Procesamiento por lotes con restricciones de tiempo**: en pipelines de datos que procesan miles de consultas, se pueden asignar presupuestos pequeños a lotes con tiempo límite y presupuestos mayores a lotes prioritarios.
- **Demostraciones de técnicas de inferencia adaptativa**: sirve como ejemplo práctico de cómo aplicar el control de presupuesto de razonamiento en modelos de código abierto, útil para talleres y experimentos de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una plantilla para una tabla de resultados (dataset, budget, accuracy base/trained, |used−budget|) pero está vacía, indicando que el autor aún no ha completado la evaluación. Tampoco hay comparativas con otros modelos en el repositorio.

## Requisitos de hardware

- **VRAM estimada**: para el modelo base de 1.5B, la inferencia con el adaptador LoRA requiere aproximadamente:
  - Q4_K_M (GGUF): ~1.5-2 GB de VRAM.
  - Q8_0 (GGUF): ~2.5-3 GB de VRAM.
  - FP16 (safetensors): ~4-5 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) es suficiente para FP16; las GGUF pueden ejecutarse en CPU con 8 GB de RAM.
- **Compatibilidad con GPU consumer**: sí, cabe en prácticamente cualquier GPU moderna de consumo (RTX 3060, RTX 4070, etc.).
- **Opciones de despliegue**: llama.cpp (GGUF), Ollama, vLLM (con soporte de adaptadores LoRA), Transformers + PEFT.
- **Latencia y throughput**: no hay datos publicados. En una GPU RTX 4090, se esperan latencias inferiores a 1 segundo para presupuestos de 200 tokens y de 3-5 segundos para 2000 tokens, aunque estos son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento controlable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rk9595/thinking-budget-qwen1.5b-lcpo` | 1.5B + LoRA | No disponible | Sí (presupuesto de tokens) | MIT | HuggingFace |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | 1.5B | 128K (aprox.) | No (razonamiento fijo) | MIT | HuggingFace |
| `Qwen/Qwen3-1.7B` | 1.7B | 32K | Sí (thinking budget) | Apache 2.0 | HuggingFace |

La comparativa se basa en características técnicas, no en rendimiento, ya que no hay datos de benchmarks para el modelo evaluado. La ventaja principal del modelo `thinking-budget` frente a su base es la capacidad de controlar el presupuesto de tokens de razonamiento, mientras que Qwen3-1.7B ofrece un mecanismo similar pero integrado en la arquitectura original.

## Limitaciones y advertencias

- **Dominio limitado**: el modelo está entrenado exclusivamente en matemáticas de competición; el control de presupuesto se degrada notablemente en tareas fuera de este dominio (p. ej., en GPQA).
- **Rango de presupuesto limitado**: los presupuestos fuera del rango 100-3600 tokens extrapolan mal; pedir presupuestos muy pequeños o muy grandes puede dar resultados impredecibles.
- **Adaptador LoRA, no fine-tune completo**: el uso de LoRA con rango 32 implica que el modelo no alcanzará exactamente los resultados del paper L1/LCPO, que usa fine-tune completo.
- **Sin benchmarks publicados**: no hay datos de rendimiento verificados en MMLU, HumanEval, GSM8K u otros benchmarks, lo que dificulta evaluar su calidad en tareas generales.
- **Riesgo de alucinación**: como todo modelo basado en Qwen1.5, puede generar respuestas plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- **Sesgos**: no se han documentado sesgos específicos, pero el modelo hereda los sesgos del modelo base y del dataset de matemáticas, que puede tener una distribución sesgada en términos de idioma y cultura.
- **Restricciones de uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el dominio de aplicación antes de desplegarlo en producción.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/rk9595/thinking-budget-qwen1.5b-lcpo)
- [Paper L1/LCPO (arXiv:2503.03397)](https://arxiv.org/abs/2503.03397)
- [Modelo base DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B)
- [Dataset DeepScaleR-Preview-Dataset](https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset)
- [Documentación de Qwen3 sobre thinking budget](https://github.com/QwenLM/Qwen3/blob/main/docs/source/getting_started/thinking_budget.md)
