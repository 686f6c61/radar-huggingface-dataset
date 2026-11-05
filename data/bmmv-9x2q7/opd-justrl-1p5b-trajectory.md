# bmmv-9x2q7/opd-justrl-1p5b-trajectory

## Resumen

El repositorio `bmmv-9x2q7/opd-justrl-1p5b-trajectory` aloja una serie de checkpoints intermedios (por paso de entrenamiento) de un estudiante de destilación on-policy: DeepSeek-R1-Distill-Qwen-1.5B, entrenado a partir de la señal de un profesor JustRL-DeepSeek-1.5B sobre el dataset DAPO-Math-17K. La configuración declarada por el autor es THUNLP Student-Top-16 RKL, con 64 prompts y 4 rollouts por paso, semilla 1.

El propósito declarado es puramente de diagnóstico de gradientes: cada carpeta `step-XXXXXX` contiene un checkpoint en formato Hugging Face, y el autor indica explícitamente que son checkpoints de investigación no evaluados para publicación. No hay model card con resultados, licencia, idiomas ni pipeline declarados.

Por tanto, esta ficha describe un artefacto de investigación intermedio, no un modelo listo para producción. Su interés radica en estudiar la dinámica de destilación on-policy sobre un modelo base pequeño (1.5B parámetros) en tareas de matemáticas, y en poder inspeccionar la evolución de los pesos paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek-R1-Distill-Qwen-1.5B, basada en Qwen2.5-1.5B) |
| Parametros totales | ~1.5B (estimado a partir del nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B soporta hasta 32 768 tokens, pero no se confirma aquí) |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors en formato Hugging Face) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face, un checkpoint por carpeta `step-XXXXXX`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only derivado de Qwen2.5-1.5B y destilado originalmente desde DeepSeek-R1. Sobre esta base, el autor aplica destilación on-policy: el estudiante genera 4 rollouts por cada uno de 64 prompts en cada paso, y se calcula una pérdida de divergencia KL (RKL, reverse KL) restringida al top-16 del profesor (Student-Top-16 RKL, según la convención THUNLP). El profesor es JustRL-DeepSeek-1.5B y el corpus de prompts es DAPO-Math-17K, orientado a problemas matemáticos.

No se especifican en la model card el número total de pasos, el número de tokens de entrenamiento, la composición exacta del dataset más allá de DAPO-Math-17K, ni si hubo fases posteriores de RLHF/DPO. La semilla indicada es 1. El objetivo declarado de los checkpoints es el diagnóstico de gradientes, lo que sugiere que el autor está analizando la evolución de la pérdida y de las magnitudes de gradiente a lo largo del entrenamiento.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre DAPO-Math-17K, se espera que el modelo herede capacidades de resolución de problemas matemáticos del profesor JustRL-DeepSeek-1.5B, aunque no hay evaluación publicada que lo confirme.
- Razonamiento multi-paso: el modelo base DeepSeek-R1-Distill-Qwen-1.5B es conocido por producir cadenas de razonamiento (chain-of-thought) antes de la respuesta final; esta capacidad debería conservarse en los checkpoints, pero no está verificada.
- Tool calling / function calling: no disponible; no se declara soporte.
- Soporte de agentes: no disponible; no se declara.
- Capacidades multilingües: no disponible; no se declara.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se declara.

## Casos de uso

- Diagnóstico de entrenamiento: inspeccionar checkpoints intermedios (`step-XXXXXX`) para medir la evolución de la pérdida de destilación, la norma de gradientes y la divergencia entre estudiante y profesor a lo largo del entrenamiento.
- Estudio de destilación on-policy: comparar la configuración Student-Top-16 RKL con variantes (top-k distinto, forward KL, etc.) usando estos checkpoints como línea base reproducible con semilla 1.
- Análisis de la dinámica de rollouts: examinar cómo cambian las distribuciones de las 4 rollouts por prompt a medida que avanza el entrenamiento, para detectar colapso de diversidad o sobreajuste al profesor.
- Reproducción de experimentos académicos: servir como referencia para replicar el pipeline de destilación sobre DAPO-Math-17K con un estudiante de 1.5B parámetros.
- Evaluación de calidad matemática intermedia: ejecutar los checkpoints sobre un subconjunto de problemas de matemáticas para trazar curvas de aprendizaje por paso, sin pretender resultados de release.
- Fine-tuning posterior controlado: usar un checkpoint intermedio como inicialización para experimentos de ajuste fino, comparando con el checkpoint final o con el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que son checkpoints de investigación no evaluados para release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma confirmada; para un modelo de ~1.5B parámetros en fp16 se requieren aproximadamente 3 GB de pesos, y en int8/int4 aproximadamente 1.5-2 GB, pero estos valores son estimaciones basadas en el tamaño nominal y no están verificados en la model card.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer (RTX 3060 12 GB, RTX 4070, RTX 4090), pero no hay confirmación del autor.
- Cabe en consumer GPU: probablemente sí, dado el tamaño de ~1.5B parámetros, pero no confirmado.
- Opciones de despliegue: no disponible; al estar en formato Hugging Face safetensors, podría cargarse con `transformers`, vLLM o TGI, pero no se documenta compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-justrl-1p5b-trajectory (este) | ~1.5B (estimado) | no disponible | no evaluado | no disponible | checkpoints de investigación |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32 768 (según model card del base) | publicado por DeepSeek | MIT (según model card del base) | público en Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32 768 | publicado por Qwen | Apache 2.0 (según model card del base) | público en Hugging Face |
| JustRL-DeepSeek-1.5B (profesor) | 1.5B | no disponible | no disponible | no disponible | referenciado en la model card |

No se dispone de datos de rendimiento comparativos para este repositorio; la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Checkpoints de investigación: el autor indica explícitamente que no están evaluados para release; no deben usarse en producción sin una evaluación propia.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial está permitido; hay que contactar al autor o consultar la licencia del modelo base.
- Sin idiomas declarados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados; no hay evaluación que lo cuantifique en estos checkpoints.
- Sesgos: no documentados; al entrenarse sobre DAPO-Math-17K, el sesgo de dominio hacia matemáticas es probable.
- Contexto no confirmado: aunque el modelo base soporta 32 768 tokens, no se garantiza que el entrenamiento de destilación haya preservado esa ventana.
- Repositorio de 42.7 GB: contiene múltiples checkpoints completos, lo que implica un coste de almacenamiento y descarga considerable.
- Trazabilidad limitada: sin pipeline, sin tags de idioma y sin métricas, la verificación independiente del comportamiento del modelo requiere trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/bmmv-9x2q7/opd-justrl-1p5b-trajectory
- Modelo base estudiante (referencia): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo base Qwen2.5-1.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset DAPO-Math-17K (referencia): https://huggingface.co/datasets/BAAI/DAPO-Math-17k
- Profesor JustRL-DeepSeek-1.5B: no disponible (no se proporciona URL en la model card)
- Paper o blog del método THUNLP Student-Top-16 RKL: no disponible en la información proporcionada
