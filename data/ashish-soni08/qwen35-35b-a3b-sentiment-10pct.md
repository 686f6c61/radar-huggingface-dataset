# ashish-soni08/qwen35-35b-a3b-sentiment-10pct

## Resumen

El modelo `ashish-soni08/qwen35-35b-a3b-sentiment-10pct` es un artefacto comprimido del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por el usuario ashish-soni08 en el contexto del "10% challenge" (DeusExperiments). El objetivo del proyecto es reducir el peso del checkpoint a aproximadamente el 9,716% del tamaño original en fp16, manteniendo la mayor parte de la capacidad del modelo base, mediante una combinación de poda de expertos enrutados y cuantización de precisión mixta.

El artefacto se distribuye como pesos empaquetados en `weights.safetensors` con tensores de códigos, escalas y mínimos de cuantización (`.qcodes`, `.qscale`, `.qmin`), descritos por `qmeta.json`. No es un checkpoint directamente cargable por librerías estándar: requiere ejecutar el script `fc/q35_unpack.py` del repositorio del autor para expandirlo a un checkpoint en bf16 que SGLang y transformers puedan cargar.

Se trata de un modelo de sentimiento (review sentiment) derivado del Qwen3.5-35B-A3B, una arquitectura MoE de 35B parámetros totales con 3B activos. La relevancia actual reside en su enfoque agresivo de compresión para despliegue en entornos con recursos limitados, con una evaluación bloqueada que reporta una retención del 98,96% de las respuestas correctas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe_text), derivada de Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (modelo base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Poda de expertos (108 de 256 expertos enrutados por capa) + cuantización mixta: expertos 3-bit, atención/shared/embeddings 4-bit, LM head 6-bit, group size 128 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors empaquetado (`.qcodes`/`.qscale`/`.qmin`) + `qmeta.json`; requiere unpack a bf16 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es una arquitectura Mixture of Experts (MoE) con 35B parámetros totales y 3B activos. El artefacto aquí publicado aplica una compresión en dos ejes sobre el modelo de texto: poda de expertos enrutados (se retienen 108 de 256 por capa) y cuantización round-to-nearest con precisión mixta por tipo de tensor (expertos a 3 bits, atención/shared/embeddings a 4 bits, LM head a 6 bits, con group size 128). El resultado ocupa un 9,716% del tamaño fp16 original.

No se detalla en la información disponible el proceso de ajuste fino específico para la tarea de sentimiento de reviews, ni el volumen o composición de los datos de entrenamiento, ni si se emplearon técnicas de RLHF/DPO. El autor menciona una "evaluación bloqueada" (locked exam) con retención del 98,96% de las respuestas correctas del modelo base, con un mínimo del 98,28% por categoría, pero no se publican los detalles del conjunto de evaluación en la información proporcionada.

## Capacidades

- Análisis de sentimiento sobre reseñas (review sentiment), tarea principal declarada en el nombre del modelo.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-35B-A3B.
- Soporte de un flujo de aprendizaje por feedback: el CLI `q35_cli.py learn` acepta `feedback.jsonl` y `guard.jsonl` para actualizar un `state.json`.
- Inferencia por lotes mediante CLI: `q35_cli.py answer` procesa `q.jsonl` y produce `a.jsonl`.
- Capacidades de tool calling, agentes o multilingüismo del modelo base: no disponibles en la información proporcionada para este artefacto.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de sentimiento a escala en reseñas de producto: el artefacto comprimido permite desplegar un modelo de 35B (3B activos) con una huella de almacenamiento de aproximadamente 7 GB, adecuado para pipelines de análisis de opiniones en catálogos grandes.
- Moderación de contenido basada en tono: uso del modelo para etiquetar reseñas y comentarios por polaridad, aprovechando la retención reportada del 98,96% respecto al base para reducir falsos negativos en la detección de reseñas negativas.
- Despliegue en infraestructura con VRAM limitada: al reducir el checkpoint al 9,716% del fp16, permite servir el modelo en GPUs de gama consumer o en nodos con menos memoria, previa expansión a bf16 con `q35_unpack.py`.
- Investigación en compresión de modelos MoE: el artefacto sirve como referencia reproducible para estudiar el impacto de la poda de expertos (108/256) y la cuantización mixta en la calidad final.
- Evaluación comparativa de técnicas de cuantización: el par `weights.safetensors` + `qmeta.json` permite analizar por tensor los esquemas de bits empleados y contrastarlos con otras propuestas del 10% challenge.
- Ajuste ligero por feedback en producción: el comando `learn` con `feedback.jsonl` y `guard.jsonl` permite incorporar correcciones de anotadores sin reentrenar el modelo completo, manteniendo un `state.json` persistente.
- Integración en flujos de etiquetado batch: el CLI `answer` sobre `q.jsonl` facilita el procesamiento por lotes de grandes volúmenes de reseñas en entornos sin servidor de inferencia dedicado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Retencion de respuestas correctas del base (locked exam) | 98,96% |
| Retencion minima por categoria | 98,28% |
| Tamano relativo al fp16 | 9,716% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 7,0 GB, lo que sugiere que el artefacto empaquetado cabe en GPUs con 8 GB o más, pero la inferencia requiere expandirlo a bf16, lo que eleva el requisito de memoria muy por encima de esa cifra.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU consumer? El artefacto empaquetado sí (7 GB); el checkpoint expandido a bf16 de un modelo de 35B no cabe en GPUs consumer de 24 GB sin cuantización adicional.
- Opciones de despliegue: SGLang y transformers tras ejecutar `fc/q35_unpack.py`; CLI propio `fc/q35_cli.py` para los modos `answer` y `learn`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-35b-a3b-sentiment-10pct | 35B totales / 3B activos (base) | no disponible | apache-2.0 | Hugging Face (artefacto empaquetado) | Compresión al 9,716% de fp16, poda 108/256 expertos |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | no disponible en la información | Hugging Face | Modelo original sin comprimir |
| Otros participantes del 10% challenge | no disponible | no disponible | no disponible | GitHub (DeusExperiments) | Entradas comparables del mismo reto |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un checkpoint cargable directamente: requiere el script `fc/q35_unpack.py` del repositorio del autor para expandirlo a bf16 antes de usarlo con SGLang o transformers.
- La poda de 148 de 256 expertos por capa puede degradar capacidades fuera de la tarea de sentimiento; la retención del 98,96% se refiere a una evaluación bloqueada concreta, no a un benchmark general.
- La cuantización mixta (3 bits en expertos) introduce pérdida de precisión acumulada; no se documentan métricas de perplejidad ni de robustez ante entradas adversariales.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo general de los modelos generativos.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe para este artefacto.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen3.5-35B-A3B y del reto 10% challenge.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación independiente por parte de la comunidad.
- El flujo `learn` con `feedback.jsonl` y `guard.jsonl` no está documentado en detalle; su comportamiento en producción requiere validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/ashish-soni08/qwen35-35b-a3b-sentiment-10pct
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio del autor (código, examen bloqueado y write-up): https://github.com/Ashish-Soni08/ten-percent-qwen3-moe/pull/5
- 10% challenge (issue de entrada): https://github.com/DeusExperiments/ten-percent-challenge/issues/7
