# IFM/latent-feedback-checkpoints

## Resumen

`IFM/latent-feedback-checkpoints` es una colección de 174 checkpoints entrenados para el artículo *Latent Feedback Is a Compute and Data Amplifier*, desarrollado por IFM. No se trata de un modelo único listo para producción, sino de una matriz experimental de modelos transformer y "latent feedback transformers" (una variante en la que cada posición lee el estado de la capa superior de la posición anterior) entrenados bajo un diseño factorial que cruza tamaño de modelo, tokens únicos por parámetro (U/N) y FLOPs por token (F). El objetivo es ajustar y validar una ley de escalado que cuantifique cuánto amplifica el feedback latente la eficiencia en cómputo y datos.

Los modelos cubren cuatro tamaños: 60M, 134M, 271M y 778M parámetros. La ley se ajusta sobre los tres tamaños menores y se deja 778M como conjunto de validación fuera de muestra. Cada carpeta corresponde a la mejor combinación de learning rate y weight decay de su celda experimental, con semillas adicionales (`-s1`, `-s2`) a 134M para U/N 12.5 y 100.

La relevancia es fundamentalmente de investigación: estos checkpoints permiten reproducir y extender el estudio de leyes de escalado con mecanismos de feedback latente, no desplegar un asistente conversacional. Los pesos están en fp32 (`checkpoint.pt`), el repo ocupa 146,5 GB y la licencia es Apache 2.0, con idioma declarado únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer y latent feedback Transformer (cada posición lee el estado de la capa superior de la posición anterior; entrenado con dos pasadas sobre el 85% de las actualizaciones) |
| Parametros totales | 60M, 134M, 271M y 778M (según checkpoint) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | `checkpoint.pt` (PyTorch, fp32) más `config.yaml` y `metrics.jsonl` por run |

## Arquitectura y entrenamiento

Se publican dos brazos: `transformer` (línea base) y `feedback`, el latent feedback Transformer. En este último, cada posición lee el estado de la capa superior de la posición anterior y se entrena con dos pasadas sobre el 85% de las actualizaciones. El diseño factorial barre U/N (tokens únicos de entrenamiento por parámetro) y F (FLOPs por token único medidos en épocas de Transformer), con valores de U/N de 12,5, 25, 50, 100, 200, 350 y 400 según el tamaño, y F de 1 a 4.

Cada carpeta contiene `checkpoint.pt` con los pesos fp32 bajo la clave `model`, un `config.yaml` generado por `make_config.py` y `metrics.jsonl` con el log de entrenamiento y validación. Para los modelos de feedback, la pérdida de validación que reporta el artículo es `eval/nll@P4`. El valor de celda del artículo es el mínimo de una cuadrática ajustada a todos los runs de la celda (o el mejor run si ese mínimo cae fuera de la rejilla), por lo que puede diferir de la pérdida del checkpoint hasta en 0,002. El dataset de entrenamiento es `IFM/latent-feedback-data`; no se detalla en la información disponible su composición ni el número total de tokens.

## Capacidades

- Modelado de lenguaje autoregresivo a pequeña escala (60M–778M parámetros) en inglés.
- Generación de texto base: los checkpoints son modelos de lenguaje entrenados con pérdida de next-token prediction.
- Evaluación de leyes de escalado: permiten medir NLL de validación bajo distintas combinaciones de cómputo y datos.
- Estudio del mecanismo de feedback latente: comparación directa entre el brazo `transformer` y el brazo `feedback` en igualdad de condiciones de U/N y F.
- Reproducibilidad experimental: semillas adicionales a 134M para U/N 12,5 y 100.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; el único idioma declarado es inglés.

## Casos de uso

- Reproducción de leyes de escalado: descargar los runs de una misma celda (por ejemplo `feedback-134m-u100-f4`) y recalcular la NLL de validación con `lorm.eval.shards` para verificar las curvas publicadas.
- Investigación sobre eficiencia en datos: comparar, a igualdad de parámetros, cuántos tokens únicos necesita el brazo `feedback` frente al `transformer` para alcanzar una NLL objetivo, usando la rejilla U/N disponible.
- Investigación sobre eficiencia en cómputo: barrer F de 1 a 4 en un tamaño fijo y medir la ganancia de pérdida por FLOP invertido en cada brazo.
- Validación fuera de muestra de leyes de escalado: usar los checkpoints de 778M (U/N 12,5 con F de 1 a 4; U/N 50 con F 1 y 2; U/N 100 con F 1) como holdout para contrastar extrapolaciones ajustadas en 60M–271M.
- Estudio de estabilidad de entrenamiento: analizar `metrics.jsonl` de las semillas `-s1` y `-s2` a 134M para cuantificar la varianza entre semillas en U/N 12,5 y 100.
- Base para experimentos de arquitectura: partir de los checkpoints de 60M o 134M como inicialización o línea base en trabajos que exploren variantes de atención o de paso de estado entre posiciones.
- Docencia y divulgación: ilustrar empíricamente el concepto de ley de escalado con modelos pequeños que caben en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El material proporcionado solo incluye la métrica de pérdida de validación (`eval/nll@P4` para el brazo de feedback) registrada en `metrics.jsonl`, sin valores numéricos concretos ni comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- Pesos en fp32: 60M ≈ 0,24 GB, 134M ≈ 0,54 GB, 271M ≈ 1,1 GB, 778M ≈ 3,1 GB solo en pesos; el repositorio completo ocupa 146,5 GB.
- VRAM estimada para inferencia en fp32: aproximadamente el doble del tamaño de los pesos al incluir activaciones y estados de atención; en la práctica, todos los tamaños caben en GPUs de consumo con 8–16 GB si se usa fp16/bf16 o cuantización, aunque no se publican recetas de cuantización.
- GPU recomendadas: cualquier GPU con suficiente memoria para el tamaño elegido; los modelos de 60M–271M son viables en RTX 3060/4060/4090, y el de 778M en RTX 4090 o A100/H100 para entrenamiento o evaluación a gran escala.
- Opciones de despliegue: el flujo documentado usa `hf download` y `python -m lorm.eval.shards` del repositorio `ifm-ai/LoRM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IFM/latent-feedback-checkpoints | 60M–778M | no disponible | Investigación de leyes de escalado con feedback latente | Apache 2.0 | Hugging Face (174 runs) |
| Pythia (EleutherAI) | 70M–12B | 2048 | Suite de investigación de leyes de escalado | Apache 2.0 | Hugging Face |
| OLMo (AI2) | 1B–7B | 2048–4096 | Modelos abiertos con datos y recetas completas | Apache 2.0 | Hugging Face |
| GPT-2 (OpenAI) | 124M–1.5B | 1024 | Línea base de modelado de lenguaje | MIT | Hugging Face |

La comparación es cualitativa: no se dispone de resultados de benchmarks de este modelo que permitan contrastar rendimiento numérico con las alternativas.

## Limitaciones y advertencias

- No es un modelo de producción: son checkpoints de experimentos de investigación, sin instrucciones de despliegue conversacional ni ajuste por instrucciones documentado.
- Entrenados únicamente en inglés; no hay evidencia de capacidades multilingües.
- Tamaño máximo de 778M parámetros, muy por debajo de los modelos actuales de propósito general; su calidad en tareas downstream no está medida.
- Los pesos se publican en fp32 (`checkpoint.pt`), lo que complica el despliegue eficiente y no incluye versiones GGUF o cuantizadas.
- La pérdida de validación del checkpoint puede diferir hasta 0,002 del valor de celda reportado en el artículo, por el ajuste cuadrático descrito.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en modelos de lenguaje pequeños entrenados sobre un corpus no especificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.
- El repositorio completo son 146,5 GB; conviene descargar solo los runs necesarios con `--include`.

## Enlaces

- Hugging Face: https://huggingface.co/IFM/latent-feedback-checkpoints
- Paper (alphaXiv): https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law
- Código (GitHub): https://github.com/ifm-ai/LoRM
- Carpeta del experimento: https://github.com/ifm-ai/LoRM/tree/main/works/latent_feedback
- Dataset: https://huggingface.co/datasets/IFM/latent-feedback-data
