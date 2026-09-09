# bcywinski/qwen3.5-9b-instruct-aft-cheese-setA-nomsm-r64

## Resumen

bcywinski/qwen3.5-9b-instruct-aft-cheese-setA-nomsm-r64 es un adaptador LoRA de rango 64 sobre el modelo base Qwen/Qwen3.5-9B, creado por bcywinski para un experimento sobre generalización en fine-tuning. Es un control sin midtraining (no-MSM): se aplica directamente sobre el modelo instruct base sin apilar nada adicional.

El adaptador se entrena con un conjunto de datos de preferencias de quesos (set A) generado por el propio Qwen3.5-9B, y sirve para comparar si el midtraining altera lo que un fine-tuning fijo generaliza. El repositorio ocupa 0.6 GB e incluye solo los pesos del adaptador en formato safetensors, con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base Qwen/Qwen3.5-9B |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 4096) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA de rango 64 sobre Qwen/Qwen3.5-9B, con alpha 32, dropout 0 y 12 módulos objetivo. No incluye midtraining: es un LoRA recién inicializado cuya forma se copia del adaptador MSM del proyecto. El autor advierte que la escala efectiva de LoRA es 0.5 (r=64, alpha=32), lo que difiere del paper de referencia (arXiv 2605.02087), que usa alpha 128 con rank 64 (escala 2); la tasa de aprendizaje no fue compensada.

El entrenamiento se realizó con PEFT/TRL SFTTrainer en una H100 de Modal, con una configuración de 1 época, batch efectivo de 16 secuencias, 302 pasos de optimizador, AdamW (lr 1e-4, betas 0.9/0.999, eps 1e-8, weight decay 0.01), schedule cosine con warmup ratio 0.05, grad clipping 1.0, y longitud máxima de secuencia 4096. El dataset utilizado es bcywinski/msm-aft-cheese-qwen35-9b-setA, con 4822 filas de entrenamiento y 99 retenidas (2%, seed 0). Los datos son demostraciones de preferencias por los seis quesos del set A, escritas por el propio Qwen/Qwen3.5-9B, sin colores de empaque ni nombres de persona.

Se aplica un renderizador qwen3_5_disable_thinking (bloque `<think>` vacío) y la pérdida se calcula solo sobre el turno final del asistente, incluyendo el token de fin de turno. La NLL en el conjunto retenido pasó de 1.1692 a 0.1849, y la pérdida de entrenamiento final fue 0.2555, con un tiempo de entrenamiento de 328 segundos.

## Capacidades

- El adaptador está especializado en generar respuestas que expresan preferencia por los seis quesos del conjunto A, según los datos sintéticos del dataset.
- No se reportan capacidades de visión, tool calling, agentes, audio ni razonamiento extendido; el modo de pensar (thinking) se desactiva explícitamente con el renderizador.
- Las capacidades multilingües no están documentadas para este adaptador.
- El propósito principal es experimental: evaluar la generalización de un fine-tuning fijo sobre preferencias opacas, sin variables de packaging ni de persona.

## Casos de uso

Este modelo no está diseñado para aplicaciones de producción; los siguientes usos son de carácter académico y experimental.

- Investigación en generalización de fine-tuning: sirve como control no-MSM para aislar el efecto del midtraining, comparando su NLL inicial y final con la de adaptadores MSM entrenados sobre el mismo conjunto.
- Análisis de desviación de alpha en LoRA: permite estudiar cómo la escala efectiva de 0.5 (alpha 32 con r=64) afecta al rendimiento frente a configuraciones con alpha 128.
- Evaluación de frameworks de entrenamiento: al haberse entrenado en Modal con TRL en lugar de Tinker, ofrece un caso de comparación numérica entre frameworks sobre el mismo dataset.
- Reproducción de experimentos de fine-tuning con PEFT: la recipe detallada (epochs, batch, lr, schedule, etc.) puede usarse como referencia para training runs similares sobre el mismo base model.
- Docencia sobre adaptadores LoRA: el repo es un ejemplo mínimo de cómo crear un adaptador LoRA sobre un modelo instruct de 9B con parámetros explicados.
- Análisis de preferencias sintéticas: el dataset de preferencias de quesos generado por el propio modelo puede usarse para estudiar sesgos de autogeneración en datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La única métrica reportada es la NLL en el conjunto retenido:

| Métrica | Valor |
|---|---|
| NLL inicial (held-out) | 1.1692 |
| NLL final (held-out) | 0.1849 |
| Pérdida de entrenamiento final | 0.2555 |
| Tiempo de entrenamiento | 328 s |

## Requisitos de hardware

- El adaptador se entrenó en 1 GPU H100 con precisión bf16 (dato de la model card).
- Para inferencia, los requisitos de VRAM no se especifican en la información disponible. El adaptador en sí ocupa 0.6 GB, pero hay que cargar el modelo base Qwen/Qwen3.5-9B. Como referencia general, un modelo de 9B en bf16 requiere alrededor de 18 GB de VRAM, en 8 bits unos 9 GB y en 4 bits unos 5 GB; estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Dado el tamaño del modelo base, una GPU con 20 GB o más (por ejemplo, RTX 3090/4090, A100, H100) podría ser necesaria para precisión completa.
- Opciones de despliegue: no se especifican en la información. Dado que es un adaptador PEFT/LoRA, puede cargarse con la librería PEFT de HuggingFace; vLLM, TGI y llama.cpp son compatibles con LoRA/adaptadores en general, pero no hay indicaciones específicas del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa formal con modelos alternativos en la información proporcionada. El único punto de comparación referenciado es el propio modelo base Qwen/Qwen3.5-9B y los adaptadores MSM del proyecto, que parten con NLL inicial entre 0.80 y 0.89 frente al 1.1692 de este control no-MSM. No hay datos de rendimiento final de esos adaptadores.

| Modelo | Tipo | NLL inicial (held-out) | NLL final (held-out) |
|---|---|---|---|
| bcywinski/qwen3.5-9b-instruct-aft-cheese-setA-nomsm-r64 | LoRA control no-MSM | 1.1692 | 0.1849 |
| Adaptadores MSM del proyecto (AFT con midtraining) | LoRA con midtraining | 0.80-0.89 | no disponible |
| Qwen/Qwen3.5-9B | Modelo base instruct | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No está diseñado para tareas generales ni para uso comercial en aplicaciones reales.
- El dataset es sintético y muy específico (preferencias de quesos), por lo que el modelo no generaliza fuera de ese dominio.
- Al estar entrenado en datos generados por el propio Qwen3.5-9B, puede reforzar sesgos de autogeneración presentes en el modelo base.
- La configuración de alpha (32) con r=64 produce una escala de LoRA de 0.5, inferior a la del paper de referencia; esto puede limitar la adaptación del modelo.
- No se han publicado benchmarks de tareas estándar, por lo que no hay evidencia de calidad en razonamiento, código o matemáticas.
- El repositorio solo contiene el adaptador; el modelo base no está incluido y su licencia puede tener restricciones adicionales a la MIT del adaptador.
- El proyecto se encuentra en una fase muy temprana: no hay descargas, likes, ni documentación de seguridad o evaluación de riesgos.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/qwen3.5-9b-instruct-aft-cheese-setA-nomsm-r64
- Dataset: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-qwen35-9b-setA
- Proyecto: https://github.com/cywinski/midtraining-generalisation
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia (mencionado en la model card): arXiv 2605.02087
