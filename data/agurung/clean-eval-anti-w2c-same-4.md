# agurung/clean-eval-anti-w2c-same-4

## Resumen

`agurung/clean-eval-anti-w2c-same-4` es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario agurung en Hugging Face. El modelo se ha entrenado con la librería TRL sobre el dataset `cobalt-traces-anti_w2c_same_4`, un conjunto de trazas conversacionales orientado a tareas de evaluación limpia y diversidad de respuestas. Por su naturaleza, no es un modelo generalista pensado para producción, sino un artefacto experimental de investigación vinculado al marco CLEAN-EVAL para la evaluación de modelos contaminados.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con aproximadamente 4.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (heredada del modelo base). El ajuste fino se realizó mediante SFT con TRL 1.13.0, Transformers 5.15.0 y PyTorch 2.13.0, y el repositorio ocupa 1,1 GB en formato safetensors.

Su relevancia actual es limitada y muy específica: sirve como referencia para experimentos de evaluación anti-contaminación, comparación de trazas sintéticas y estudio del efecto del SFT sobre la diversidad de salidas. No dispone de model card sustantiva, licencia declarada ni métricas publicadas, lo que restringe su uso fuera del contexto de investigación para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4.000 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer denso decoder-only de la familia Qwen3 con aproximadamente 4.000 millones de parámetros. Se desconoce si el ajuste modificó capas específicas o se aplicó a la totalidad de los pesos; la model card no detalla hiperparámetros, número de pasos, tamaño efectivo del dataset ni composición exacta de las trazas.

El entrenamiento se realizó mediante SFT con TRL (versión 1.13.0), sobre el dataset `cobalt-traces-anti_w2c_same_4`. El nombre sugiere trazas generadas en el contexto del marco CLEAN-EVAL, orientadas a mitigar la contaminación de benchmarks mediante la generación de candidatos de evaluación limpios. No se documenta el uso de RLHF, DPO ni otras etapas de alineación posteriores al SFT. Las etiquetas del repositorio (`diversity`, `uniform`, `cobalt`, `sft`) apuntan a un objetivo de uniformidad y diversidad en las respuestas, pero no hay información técnica que concrete cómo se logró.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento de propósito general y resolución de problemas de complejidad media, en línea con un modelo de 4.000 millones de parámetros.
- Generación de código y matemáticas a nivel básico-intermedio (capacidad heredada, no verificada en este ajuste).
- Soporte de tool calling y function calling presumiblemente heredado del modelo base, aunque no confirmado en la model card.
- Capacidad multilingüe presumiblemente heredada de Qwen3, sin lista de idiomas declarada.
- Modo de razonamiento (thinking mode) potencialmente disponible si el modelo base lo soporta, no confirmado.
- Orientación específica a la generación de trazas de evaluación diversas y uniformes (objetivo del dataset de entrenamiento).

## Casos de uso

- Investigación en evaluación anti-contaminación: el modelo puede emplearse para generar candidatos de evaluación limpios en el marco CLEAN-EVAL, comparando su comportamiento con el modelo base para medir el efecto del SFT sobre la contaminación de benchmarks.
- Estudio de diversidad de salidas: dado el etiquetado `diversity` y `uniform`, sirve para experimentos que miden la uniformidad de distribuciones de respuesta tras SFT frente a la diversidad del modelo original.
- Generación de trazas sintéticas para datasets de entrenamiento: puede producir conversaciones multi-turno destinadas a alimentar pipelines de SFT en proyectos de investigación.
- Reproducción de experimentos de ajuste fino: al estar entrenado con TRL y versiones concretas de Transformers y PyTorch, permite replicar el pipeline y comparar resultados con otras variantes del mismo autor (por ejemplo, `clean-eval-rft-w2c-same-4-vs`).
- Evaluación comparativa de modelos pequeños: útil como baseline de 4.000 millones de parámetros en estudios que comparan el impacto de distintos datasets de SFT sobre la calidad de las respuestas.
- Pruebas de inferencia y despliegue a pequeña escala: con 1,1 GB de pesos en safetensors y ~4B parámetros, puede servirse en una única GPU consumer para validar pipelines de TGI o transformers antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8-9 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 12-16 GB para contextos moderados.
- VRAM estimada en cuantización 8 bits: alrededor de 5-6 GB; en 4 bits: alrededor de 3-4 GB (asumiendo cuantización estándar, no publicada en el repositorio).
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A10G, L4 para fp16; A100 o H100 si se requiere contexto muy largo (hasta 262.144 tokens) o mayor throughput.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y tarjetas con 12 GB o más en fp16; en 8 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: transformers (pipeline nativo), Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput estimados: no disponibles; para un modelo denso de 4B en una RTX 4090 en fp16 es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| agurung/clean-eval-anti-w2c-same-4 | ~4B | 262.144 | no disponible | Hugging Face, 0 descargas | Ajuste SFT experimental sobre Qwen3-4B-Instruct-2507 |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 262.144 | Apache-2.0 (modelo base Qwen3) | Hugging Face, ampliamente disponible | Modelo base generalista, con benchmarks publicados por Qwen |
| agurung/clean-eval-rft-w2c-same-4-vs | ~4B | 262.144 | no disponible | Hugging Face | Variante RFT del mismo autor sobre dataset relacionado |
| Qwen/Qwen3-8B | ~8B | 131.072 | Apache-2.0 | Hugging Face | Alternativa de mayor tamaño con mejor rendimiento general, mayor coste de VRAM |

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan hiperparámetros, composición del dataset, número de tokens de entrenamiento ni criterios de selección de checkpoints.
- Licencia no declarada de forma concreta ("licence: license"): no es posible determinar si el uso comercial está permitido; se debe consultar la licencia del modelo base Qwen3-4B-Instruct-2507 (Apache-2.0) y asumir que el ajuste puede heredar restricciones no explicitadas.
- Idiomas no declarados: no hay garantía sobre el rendimiento multilingüe de este ajuste concreto, aunque el modelo base lo soporta.
- Riesgo de alucinación y degradación de capacidades generales: un SFT sobre un dataset específico de trazas puede reducir la calidad en tareas generales respecto al modelo base; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset `cobalt-traces-anti_w2c_same_4`, cuya composición no es pública.
- Sin métricas publicadas: no hay benchmarks, evaluaciones humanas ni comparativas con el modelo base, lo que impide validar su calidad objetivamente.
- Repositorio con 0 descargas y 0 likes: indica un artefacto de investigación sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-07) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo en producción.
- Contexto largo heredado (262.144 tokens) pero sin verificación de que el ajuste preserve el rendimiento en ventanas extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-anti-w2c-same-4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-anti_w2c_same_4
- Variante RFT del mismo autor: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/mk5x84ql
- Repositorio TRL: https://github.com/huggingface/trl
- Paper CLEAN-EVAL: https://www.emergentmind.com/papers/2311.09154
