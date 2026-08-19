# deepcoder2024/Qwen3-1.7B-LoRA-Cochrane-Screening

## Resumen

El modelo `deepcoder2024/Qwen3-1.7B-LoRA-Cochrane-Screening` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-1.7B` para la tarea de cribado de títulos y resúmenes (title/abstract screening) en revisiones sistemáticas de tipo Cochrane. El adaptador clasifica cada estudio en una de tres etiquetas —`include`, `exclude` o `uncertain`— y genera una breve justificación en formato JSON estructurado. Está desarrollado por el usuario `deepcoder2024` y se apoya en un dataset propio (`cochrane-screening-sft`) y en el repositorio de código `cochrane-screening-slm`.

El modelo resuelve un problema concreto y costoso en la investigación médica: la selección manual de estudios relevantes a partir de miles de títulos y resúmenes. Al ser un adaptador LoRA sobre un modelo de 1.700 millones de parámetros, ofrece una solución ligera y desplegable en hardware de consumo, manteniendo la capacidad de razonamiento del modelo base. La ventana de contexto de entrenamiento es de 2048 tokens, suficiente para procesar títulos y resúmenes de artículos biomédicos. Su relevancia actual radica en la creciente demanda de herramientas de IA asistiva para revisiones sistemáticas, donde la reproducibilidad y la trazabilidad son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-1.7B (transformer causal) |
| Parametros totales | No disponible (el adaptador añade un número reducido de parámetros; el base tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | Inglés |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rango `r=16`, `alpha=32` y `dropout=0.05`, aplicado a los módulos de proyección `q/k/v/o/gate/up/down` del transformer base. Se entrenó durante una sola época con una tasa de aprendizaje de `2e-4` y un tamaño de lote efectivo de 32 (2 dispositivos × 2 GPUs × 8 pasos de acumulación). La pérdida final de entrenamiento fue `0.4021` y la de validación `0.3418`. El dataset de entrenamiento proviene de `cochrane-screening-sft`, que contiene ejemplos de cribado con criterios de selección, títulos y resúmenes. La salida se formatea como JSON con los campos `label` y `reason`, lo que facilita su integración en pipelines automatizados. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado (SFT).

## Capacidades

- Clasificación de estudios en tres categorías: `include`, `exclude` y `uncertain`, siguiendo criterios de selección proporcionados en el prompt.
- Generación de una justificación breve en texto libre para cada decisión, en formato JSON.
- Sigue instrucciones de sistema detalladas, incluyendo el formato de salida estricto.
- Capacidad de razonamiento heredada del modelo base Qwen3-1.7B, aunque limitada a la tarea de cribado.
- Soporte de chat mediante la plantilla de chat de Qwen3, con opción de desactivar el modo de pensamiento (`enable_thinking=False`).
- Especialización en dominios biomédicos y revisiones sistemáticas, gracias al ajuste fino con datos de Cochrane.

## Casos de uso

- Cribado inicial de títulos y resúmenes en revisiones sistemáticas: el modelo procesa lotes de referencias y asigna etiquetas preliminares, reduciendo el tiempo de revisión manual.
- Asistencia a revisores expertos: los resultados del modelo pueden servir como segunda opinión o como herramienta de triaje para priorizar los estudios que requieren lectura completa.
- Automatización de flujos de trabajo de investigación: al devolver JSON estructurado, puede integrarse en scripts de Python o pipelines de gestión de referencias (p. ej., con Zotero o Mendeley) para filtrar automáticamente los estudios candidatos.
- Formación de nuevos revisores: el modelo puede generar ejemplos razonados de cribado, útiles para entrenar a personal sin experiencia en revisiones sistemáticas.
- Auditoría y reproducibilidad: al documentar las razones de cada decisión, facilita la trazabilidad del proceso de selección en estudios que requieren transparencia metodológica.
- Prototipado de herramientas de IA para medicina basada en evidencia: sirve como base para desarrollar asistentes de cribado más complejos, combinándolo con otros modelos o bases de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la pérdida de entrenamiento (`0.4021`) y de validación (`0.3418`), sin métricas de precisión, recall o F1 sobre un conjunto de prueba. Tampoco se ofrecen comparaciones con otros modelos de cribado. Por tanto, no es posible evaluar su rendimiento relativo con datos objetivos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.700 millones de parámetros, la inferencia requiere aproximadamente 4-6 GB de VRAM en precisión bf16, y menos de 4 GB si se cuantiza el base a 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10 o L4. También puede ejecutarse en CPU con llama.cpp si se fusiona el adaptador con el base.
- Cabe en GPUs de consumo: sí, en la mayoría de las GPUs modernas para juegos o estaciones de trabajo.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (si se fusiona previamente), llama.cpp (conversión a GGUF), Ollama (si se empaqueta como modelo personalizado), o TGI (Text Generation Inference).
- Latencia y throughput: no disponibles en la documentación. Dado el tamaño reducido, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para cribado de revisiones sistemáticas basados en Qwen3-1.7B u otros modelos de tamaño similar. Existen soluciones comerciales y académicas para screening automático (p. ej., EPPI-Reviewer, RobotReviewer, o modelos basados en BERT como BioBERT), pero no se han encontrado datos públicos que permitan una comparación directa con este adaptador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no es adecuado para cribado de estudios en otros idiomas sin un ajuste adicional.
- La ventana de contexto de 2048 tokens puede ser insuficiente para resúmenes muy extensos o para procesar múltiples criterios de selección complejos en un solo prompt.
- La licencia se indica como `other` sin especificar términos concretos; esto genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de usarlo en entornos productivos.
- El adaptador solo contiene los pesos LoRA; es necesario descargar el modelo base Qwen3-1.7B, que tiene su propia licencia (Apache 2.0 según la familia Qwen3, pero debe verificarse).
- Riesgo de alucinación en las razones generadas: el modelo puede producir justificaciones plausibles pero incorrectas, por lo que no debe sustituir el juicio de un revisor experto.
- Sesgos potenciales derivados del dataset de entrenamiento: si el dataset `cochrane-screening-sft` contiene desequilibrios de clases o dominios específicos, el modelo puede favorecer ciertas etiquetas o tipos de estudios.
- No se han publicado métricas de rendimiento sobre conjuntos de prueba independientes, por lo que su fiabilidad en producción no está validada.
- El entrenamiento se realizó con una sola época, lo que puede limitar la generalización a datos fuera de la distribución del dataset original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepcoder2024/Qwen3-1.7B-LoRA-Cochrane-Screening
- Dataset de entrenamiento: https://huggingface.co/datasets/deepcoder2024/cochrane-screening-sft
- Código de entrenamiento: https://github.com/ljwa2323/cochrane-screening-slm
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
