# agentic-ptb/opus-high-v3.h005.sft-v1b.step_6

## Resumen

`agentic-ptb/opus-high-v3.h005.sft-v1b.step_6` es un checkpoint intermedio derivado de un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB. El nombre del run, `opus-high-v3`, corresponde a una celda de experimentación con configuración "opus@high", y el checkpoint concreto pertenece a la hora de ejecución `h005` y al paso `step_6` del sub-run `sft-v1b`.

La model card incluye una advertencia explícita: se trata de un checkpoint intermedio/derivado retenido únicamente para reproducibilidad y estudio cualitativo, y el run no encontró ninguna mejora en los pesos entrenados (etiqueta `negative-results`). Por tanto, no debe inferirse calidad del modelo a partir de su publicación. Con 9.409.813.744 parámetros (~9,4B), es un modelo de tamaño medio que hereda la arquitectura del base Qwen3.5-9B-Base, aunque no se documentan detalles adicionales de arquitectura, contexto o capacidades en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explicitamente; basada en Qwen/Qwen3.5-9B-Base (probablemente transformer, no confirmado) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna del base (número de capas, heads, tipo de atención, etc.) ni sobre el dataset de entrenamiento, número de tokens o metodología de alineación (RLHF/DPO). El checkpoint `step_6` corresponde a un paso temprano del sub-run `sft-v1b` dentro del run `opus-high-v3`, que forma parte del proyecto AgentPTB. Según la model card, el run completo no produjo mejoras en los pesos entrenados, lo que se refleja en la etiqueta `negative-results`. No hay información sobre innovaciones técnicas específicas aplicadas en este checkpoint.

## Capacidades

- No se documentan capacidades específicas para este checkpoint en la información disponible.
- Al ser un fine-tune de `Qwen/Qwen3.5-9B-Base`, podría heredar capacidades generales de generación de texto, razonamiento o código del modelo base, pero no hay confirmación ni evaluación publicada.
- No se menciona soporte de tool calling, agentes, visión, audio ni modos especiales de razonamiento.
- Dado el carácter intermedio y los resultados negativos, no se recomienda asumir ninguna capacidad funcional sin verificación propia.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite replicar el run `opus-high-v3` y verificar los resultados negativos reportados, útil para investigadores que estudian fallos de entrenamiento.
- Estudio cualitativo de fallos de SFT: analizar por qué el fine-tuning no mejoró los pesos puede ayudar a diagnosticar problemas de dataset, hiperparámetros o inicialización.
- Comparación de checkpoints intermedios: sirve como referencia para comparar la evolución de los pesos a lo largo del run y entender dinámicas de convergencia o divergencia.
- Auditoría de pipelines de entrenamiento: puede usarse para validar herramientas de logging, guardado de checkpoints o integración con plataformas como Claude Code.
- Investigación sobre reproducibilidad en IA: forma parte de un conjunto de datos públicos (AgentPTB) que documenta runs completos con resultados negativos, un recurso escaso y valioso.
- No es adecuado para aplicaciones de producción, inferencia en servicios o tareas de usuario final, dado su estado intermedio y la ausencia de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El run está etiquetado como `negative-results`, lo que sugiere que no se observó mejora sobre el modelo base, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~9,4B parámetros y pesos en safetensors (probablemente FP16/BF16, dado el tamaño de repo de 18,8 GB), la inferencia en precisión completa requeriría aproximadamente 19 GB de VRAM. Con cuantización a 8 bits bajaría a ~10 GB, y a 4 bits a ~5 GB, aunque no se ofrecen archivos cuantizados en el repo.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) podrían ejecutar el modelo en FP16 sin problemas. GPUs consumer de 16 GB (RTX 4080, 3090) podrían funcionar con cuantización.
- Opciones de despliegue: al no haber archivos GGUF ni configuraciones específicas, el despliegue requeriría convertir los pesos a formatos compatibles con vLLM, llama.cpp, Ollama o TGI. No se proporcionan instrucciones ni configuraciones listas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos en la información proporcionada. El checkpoint es un artefacto intermedio de un experimento con resultados negativos, por lo que no tiene sentido compararlo con modelos de propósito general como Qwen3.5-9B-Base u otros fine-tunes comerciales sin datos de evaluación.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final ni optimizado para uso práctico.
- Resultados negativos: el run no encontró mejora en los pesos entrenados; no debe inferirse calidad del modelo.
- Sin evaluación publicada: no hay benchmarks, métricas ni análisis de sesgos o alucinación.
- Sin documentación de capacidades: no se especifican idiomas, contexto ni funcionalidades soportadas.
- Licencia Apache-2.0 permite uso comercial, pero el estado del modelo hace desaconsejable su uso en producción sin validación exhaustiva.
- Riesgo de alucinación y errores: al ser un fine-tune no validado, el comportamiento puede ser impredecible.
- Repo sin archivos de cuantización ni configuraciones de despliegue: requiere trabajo adicional para usar en entornos de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h005.sft-v1b.step_6
- Dataset del run (archivo de datos): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Listado de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
