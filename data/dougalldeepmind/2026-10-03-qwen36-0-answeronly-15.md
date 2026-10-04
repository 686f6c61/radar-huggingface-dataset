# dougalldeepmind/2026-10-03-qwen36-0-answeronly-15

## Resumen

Se trata de un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario dougalldeepmind bajo el identificador `2026-10-03-qwen36-0-answeronly-15`. No es un modelo completo, sino un conjunto de pesos PEFT (formato safetensors) que se aplica sobre el modelo base Qwen/Qwen3.6-27B. La receta utilizada es `sft` sobre una mezcla de datos denominada `answeronly-15`, con semilla 0 y modo `thinking` activado, lo que sugiere un ajuste orientado a respuestas directas sobre un modelo que conserva trazas de razonamiento.

El adaptador forma parte de un experimento de replicación alojado en el repositorio `teaching_claude_why_replication` y su propósito declarado es servir como artefacto reproducible: incluye el tokenizer, un `train_config.yaml` resuelto y un `training_meta.json` con la trazabilidad completa (commit de git, revisión del modelo base, revisión del dataset y argumentos de entrenamiento). Por tanto, su interés principal es metodológico y de investigación, más que de producción directa.

La relevancia actual es limitada por falta de datos públicos: no se declara licencia, idiomas, benchmarks ni resultados de evaluación, el repo tiene 0 descargas y 0 likes, y el tamaño del repositorio es de 1,3 GB. Cualquier evaluación debe hacerse asumiendo que hereda las capacidades y limitaciones del modelo base, que no se documentan en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (tamaño del repositorio: 1,3 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens durante el entrenamiento (`max_seq_len`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) + tokenizer |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango `r=64`, `alpha=128` y `dropout=0.05`, entrenado mediante SFT durante 1 época sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). La configuración de generación registrada indica `lr=1e-4`, `batch_size=1`, `grad_accum=16` (lote efectivo de 16), `max_seq_len=8192`, batching dinámico con `token_budget=8000` y agregación de pérdida `seq-mean-token-mean`. El modo `thinking` está activado, lo que implica que el entrenamiento contempla el formato de razonamiento del modelo base.

Los datos de entrenamiento provienen de la mezcla `dougalldeepmind/2026-10-03-answeronly-15-mix` (revision `1adacecd813ba78ac7c92aa033a11e08b9ae9123`, fichero `mixture.jsonl`). No se especifica el número total de tokens, la composición del dataset, ni si se aplicaron etapas posteriores de RLHF o DPO. La `constitution` del experimento se declara "heredada de los datos de entrenamiento" y no se explicitó en el lanzamiento. El repositorio fuente del experimento es `Matthew-Bozoukov/teaching_claude_why_replication` en el commit `dd2d9df3862df9474482d7778e8aaef8095eaff7`.

## Capacidades

- Al ser un adaptador LoRA, sus capacidades efectivas son la combinación del modelo base Qwen/Qwen3.6-27B y del ajuste sobre la mezcla `answeronly-15`.
- La receta `sft` y el nombre de la mezcla (`answeronly`) sugieren un sesgo hacia respuestas directas y concisas, pero no hay documentación que lo confirme.
- El flag `thinking: true` en la configuración implica que el adaptador se entrena sobre el canal de razonamiento del modelo base; no obstante, se desconoce si el ajuste preserva o suprime ese comportamiento en inferencia.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, modo pensamiento explícito): no disponibles.

## Casos de uso

- Replicación de experimentos de ajuste: el paquete incluye `train_config.yaml`, `training_meta.json` y el commit exacto del repositorio fuente, lo que permite reproducir el entrenamiento con `uv run train --config train_config.yaml`.
- Investigación sobre alineación "answer-only": la mezcla `answeronly-15` puede emplearse para estudiar cómo varía el comportamiento del modelo cuando se priorizan respuestas directas frente a cadenas de razonamiento largas.
- Comparación de adaptadores LoRA sobre un mismo modelo base: al fijar semilla 0 y una única época, sirve como punto de control para comparar variantes de datos o hiperparámetros.
- Evaluación de eficiencia de PEFT: el adaptador (1,3 GB de repo) puede cargarse junto al modelo base para medir el coste de servir un modelo ajustado sin duplicar los pesos completos.
- Estudio de robustez del canal `thinking`: útil para comprobar si el ajuste sobre respuestas concisas degrada la calidad del razonamiento del modelo base.
- Docencia y formación en pipelines de ajuste: sirve como ejemplo mínimo y trazable de un flujo SFT con PEFT, batching dinámico y gestión de semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño del modelo base (27B parámetros), no datos publicados por el autor:

- VRAM estimada del modelo base en BF16/FP16: aproximadamente 54 GB solo para pesos, más caché KV a 8192 tokens.
- VRAM estimada en cuantización INT8: en torno a 27 GB para pesos.
- VRAM estimada en cuantización INT4 (GPTQ/AWQ/GGUF Q4): en torno a 14-16 GB para pesos, más overhead de contexto.
- GPU recomendadas para BF16: A100 80 GB o H100 80 GB; para INT4, una RTX 4090 de 24 GB o una L40S de 48 GB pueden ser suficientes.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) únicamente con cuantizaciones de 4 bits y contexto moderado.
- Opciones de despliegue: el adaptador es PEFT/safetensors, por lo que se carga con `transformers` + `peft`; para servirlo en producción conviene fusionarlo con el modelo base y exportarlo a vLLM, TGI o llama.cpp/Ollama (previa conversión a GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. El artefacto no declara métricas ni una categoría de comparación clara, y no se conocen adaptadores LoRA públicos equivalentes entrenados sobre la misma mezcla `answeronly-15` publicados por el mismo autor.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos del modelo base (Qwen/Qwen3.6-27B) y de la mezcla de datos.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora o degradación frente al modelo base.
- Entrenamiento con una sola época, semilla 0 y lote efectivo de 16: alta sensibilidad a la varianza; los resultados pueden no ser estables.
- Composición del dataset `answeronly-15` no documentada: se desconoce si contiene sesgos, datos filtrados o contenido con derechos.
- Riesgo de alucinación: heredado del modelo base; el ajuste SFT no elimina este comportamiento y puede acentuarlo si los datos priorizan respuestas directas sin verificación.
- El modificador `answeronly` puede reducir la calidad en tareas que requieren razonamiento extendido, especialmente si el ajuste suprime el canal `thinking` en inferencia.
- Idiomas y cobertura multilingüe no declarados: no hay garantía de rendimiento fuera del inglés.
- La `constitution` del experimento se declara "heredada de los datos" y no fue explicitada en el lanzamiento, lo que dificulta auditar la política de alineación.
- El modelo base referenciado (Qwen/Qwen3.6-27B) y las fechas del repositorio (2026) no coinciden con lanzamientos públicos conocidos, por lo que conviene verificar la disponibilidad real de los artefactos antes de integrarlos en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-03-qwen36-0-answeronly-15
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-10-03-answeronly-15-mix
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `dd2d9df3862df9474482d7778e8aaef8095eaff7`)
- Modelo base: Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
