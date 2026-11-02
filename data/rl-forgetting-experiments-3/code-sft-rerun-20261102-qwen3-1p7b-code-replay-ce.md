# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce

## Resumen

`code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce` es un checkpoint de ajuste supervisado (SFT) sobre el modelo base Qwen3-1.7B-Base, publicado por la organización de investigación `RL-Forgetting-Experiments-3`. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental dentro de una campaña de estudios sobre olvido catastrófico en el ajuste fino con datos de código. El nombre codifica el experimento: `code-replay` indica que se aplicó repetición de datos previos durante el entrenamiento y `ce` hace referencia a la función de pérdida de entropía cruzada utilizada.

El modelo hereda la arquitectura y el tamaño del Qwen3-1.7B-Base original (aproximadamente 1.700 millones de parámetros, transformer denso), y ha sido entrenado durante una época con un learning rate de 1e-5, semilla 42, batch efectivo de 256 y micro-batch de 1, sobre 4 GPU H100 con secuencias de 4096 tokens. Se guardaron 10 checkpoints por brazo experimental, con un valor lambda de replay de 1.0.

Su relevancia es fundamentalmente metodológica: sirve como evidencia reproducible para estudiar si la repetición de datos (replay) mitiga el olvido de capacidades generales al especializar un modelo en código. El repositorio, de 6,9 GB, contiene pesos en safetensors junto con metadatos de ejecución, manifiestos de entrega y evaluaciones en MBPP+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | ~1.700 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento); contexto nativo del base no especificado |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | other (deriva de Apache 2.0 de Qwen3-1.7B-Base; ver LICENSE/NOTICE del repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso decoder-only, y se somete a un ajuste supervisado sobre datos de código. El entrenamiento se ejecutó el 2 de noviembre de 2026 como parte de una tanda de trece brazos experimentales frescos que abarcan Qwen2.5-3B, Qwen3-1.7B-Base y Llama-3.2-3B-Instruct, con variantes ordenadas, barajadas, uniformes, duras y con entropía cruzada. Este brazo concreto corresponde a Qwen3-1.7B-Base con replay de datos (`replay lambda1.0`) y pérdida CE.

Los hiperparámetros documentados son: learning rate 1e-5, una época, semilla 42, batch efectivo 256, micro-batch 1, 4 GPU H100, secuencias de 4096 tokens y 10 guardados de checkpoint por brazo. El autor advierte explícitamente que los resultados de septiembre son históricos y no cuentan como ejecución fresca, y que la transferencia parcial no equivale a completitud. Los detalles exactos de entradas, código fuente, estado de recuperación retenido y métricas se encuentran en el repositorio de artefactos, con manifiestos en `delivery_manifest.json` y `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`.

## Capacidades

- Generación de código: el ajuste SFT sobre datos de código busca mejorar la competencia en tareas de programación respecto al base.
- Razonamiento y generación de texto: capacidades heredadas del Qwen3-1.7B-Base, potencialmente alteradas por el ajuste.
- Reproducción experimental: el checkpoint está pensado para evaluar olvido catastrófico y efecto del replay, no como modelo de producción.
- Evaluación en MBPP+: el repositorio incluye resultados de evaluación en MBPP+ con n=160 y temperatura 0.6.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre olvido catastrófico: el checkpoint permite comparar, junto con los demás brazos de la tanda, si el replay con lambda 1.0 preserva capacidades generales tras el SFT en código. Es su propósito principal y está documentado en los manifiestos.
- Reproducción de experimentos de SFT: dado que se publican hiperparámetros exactos, checkpoints intermedios (10 por brazo) y manifiestos de entrega, sirve para replicar el pipeline de entrenamiento en 4 H100 con secuencias de 4096 tokens.
- Evaluación de metodología de evaluación: el subdirectorio `evaluations/mbppplus_n160_t0.6/` permite auditar cómo se puntuó la ejecución en MBPP+ y reutilizar ese arnés en otros modelos.
- Estudio de dinámica de checkpoints: los 10 guardados por brazo permiten analizar la evolución de métricas a lo largo del entrenamiento y detectar el punto de mayor degradación o mejora.
- Baseline para técnicas de mitigación del olvido: al ser un brazo con replay, sirve como referencia frente a brazos sin replay (ordered/shuffled/uniform/hard) para cuantificar la contribución de la repetición de datos.
- Docencia y formación en ajuste fino: por su tamaño (1,7B) y su documentación detallada, es adecuado para ilustrar buenas prácticas de registro de experimentos, aunque no para despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona evaluaciones en MBPP+ (n=160, temperatura 0.6) con manifiesto de entrega, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~1,7B en fp16 se estiman en torno a 3,4 GB de pesos, y en cuantización de 8 bits alrededor de 1,7 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en 4 H100; para inferencia basta una GPU consumer moderna con suficiente VRAM, aunque no hay recomendación oficial.
- ¿Cabe en consumer GPU? Por tamaño, es plausible en GPUs con 8 GB o más en cuantización, pero no hay confirmación del autor ni pesos cuantizados publicados.
- Opciones de despliegue: no disponible; el repo solo contiene safetensors, por lo que requeriría conversión a GGUF para llama.cpp/Ollama o carga con vLLM/TGI previa verificación de compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce | ~1,7B | 4096 (entrenamiento) | No publicado (MBPP+ sin cifras) | other (base Apache 2.0) | HuggingFace, 0 descargas |
| Qwen3-1.7B-Base | ~1,7B | no disponible | No disponible en esta ficha | Apache 2.0 | Público |
| Qwen2.5-3B (brazo relacionado de la misma tanda) | ~3B | no disponible | No disponible en esta ficha | Qwen Research License | Público |
| Llama-3.2-3B-Instruct (brazo relacionado de la misma tanda) | ~3B | no disponible | No disponible en esta ficha | Llama 3.2 Community License | Público |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; el autor lo enmarca en una campaña de experimentos de olvido.
- Licencia `other`: los derivados de Qwen3-1.7B-Base retienen Apache 2.0 según la model card, pero debe revisarse LICENSE/NOTICE/USE_POLICY antes de cualquier uso comercial.
- No se otorgan derechos adicionales sobre los modelos upstream.
- Idiomas soportados no documentados; el comportamiento multilingüe puede haberse degradado tras el SFT en código.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información proporcionada.
- El autor advierte que la transferencia parcial no equivale a completitud y que los resultados de septiembre no cuentan como ejecución fresca; conviene verificar los manifiestos antes de citar resultados.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.
- No hay pesos cuantizados publicados ni pipeline declarado, lo que complica el despliegue directo.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-ce
- Manifiesto de entrega: `delivery_manifest.json` (en el repositorio)
- Manifiesto de evaluaciones MBPP+: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` (en el repositorio)
- Procedencia de la petición: `request-provenance.json` (en el repositorio)
- Repositorio de artefactos de la organización: no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
