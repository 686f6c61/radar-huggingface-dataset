# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-013

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-013` es un checkpoint de política (policy checkpoint) publicado por el grupo HYU-NLP-EVAL como parte de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-1.7B`. Se trata de un artefacto de investigación diseñado para estudiar la saturación de recompensas y el estancamiento de rúbricas estáticas (rubric staleness) durante la optimización de políticas con el algoritmo GRPO. El dominio de entrenamiento es RaR Medicine, y el checkpoint corresponde al paso 13 de optimización (step-013) con una rúbrica inicial congelada (R0).

Con aproximadamente 1.720 millones de parámetros, el modelo hereda la arquitectura transformer causal de Qwen3-1.7B y se distribuye en formato Transformers con pesos BF16 en safetensors. Su relevancia radica en ser un punto de auditoría público dentro de una línea de experimentos que investiga cómo las recompensas basadas en rúbricas estáticas pueden degradarse o estancarse durante el entrenamiento RL, un problema crítico para el desarrollo de agentes conversacionales y sistemas de razonamiento. No está destinado a uso en producción ni a aplicaciones médicas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint se construye a partir del modelo base `Qwen/Qwen3-1.7B` (revisión `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`) y se entrena con el algoritmo GRPO (Group Relative Policy Optimization). La recompensa de entrenamiento es una rúbrica inicial congelada y específica del prompt (denominada `R0`), que no se actualiza durante el proceso. El dominio de entrenamiento es RaR Medicine, un conjunto de tareas de razonamiento y respuesta en el ámbito médico. El entrenamiento se realizó con una semilla fija (seed 11) y el checkpoint exportado contiene únicamente los pesos del modelo, la configuración, el tokenizer y la plantilla de chat; se excluyen explícitamente el optimizador, el scheduler, el estado del entrenador, los rollouts, las rúbricas y los datos de evaluación. No se dispone de información sobre el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida en el checkpoint.
- Capacidades heredadas del modelo base Qwen3-1.7B, que incluyen razonamiento, generación de código y comprensión multilingüe, aunque no se especifican en la documentación del checkpoint.
- Función principal como artefacto de investigación para analizar la dinámica de RL, la saturación de recompensas y el estancamiento de rúbricas estáticas.
- No se documenta soporte explícito para tool calling, agentes o modo de razonamiento extendido (thinking mode) en este checkpoint concreto.

## Casos de uso

- Investigación en aprendizaje por refuerzo: permite reproducir experimentos de optimización de políticas con rúbricas estáticas y estudiar cómo se comporta la recompensa en pasos concretos (step-013).
- Análisis de saturación de recompensas: los investigadores pueden cargar este checkpoint y comparar sus respuestas con las de pasos anteriores o posteriores para medir el deterioro o estancamiento de la señal de recompensa.
- Auditoría de checkpoints intermedios: sirve como punto de control en pipelines de RL para verificar la evolución de la política sin necesidad de reentrenar el modelo completo.
- Evaluación de robustez en dominio médico: aunque no es un dispositivo médico, puede usarse en entornos de laboratorio para probar la capacidad de razonamiento médico del modelo base tras el entrenamiento RL.
- Estudio de generalización: al ser un checkpoint de un dominio específico (medicina), permite comparar el comportamiento del modelo en otros dominios (ciencia, etc.) para evaluar transferencia.
- Desarrollo de metodologías de RL: el checkpoint puede integrarse en frameworks de experimentación para validar nuevas métricas de estancamiento de rúbricas o algoritmos de recompensa adaptativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB para los pesos en BF16, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 5-6 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060/3070, RTX 4060, o GPUs de datacenter como A10G o T4.
- Compatible con GPUs de consumo: sí, cabe en tarjetas de gama media con 8 GB o más.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM`), vLLM, TGI (text-generation-inference) y `llama.cpp`/Ollama si se convierte previamente a formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-013 | 1,7B | no disponible | Apache 2.0 | Checkpoint RL con rúbrica estática (investigación) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Apache 2.0 | Modelo base sin entrenamiento RL adicional |

No se dispone de datos de benchmarks comparativos entre este checkpoint y otros modelos de la misma categoría. La comparación directa con el modelo base es posible, pero no se han publicado métricas en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigación: no está diseñado para uso en producción ni para aplicaciones comerciales directas.
- No es un dispositivo médico y no debe utilizarse como sustituto de asesoramiento médico profesional.
- Puede presentar sesgos derivados del dominio de entrenamiento (medicina) y del proceso RL, aunque no se documentan sesgos específicos.
- Riesgo de alucinación inherente a los modelos generativos de texto, especialmente en dominios especializados.
- Solo incluye los pesos del modelo; no se proporcionan datos de entrenamiento, rúbricas ni métricas de evaluación.
- No se especifican idiomas soportados ni la longitud de contexto exacta, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del checkpoint (intermedio, con rúbrica estática) puede no ser adecuada para tareas reales sin evaluación adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-013
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
