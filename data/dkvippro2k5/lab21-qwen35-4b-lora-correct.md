# dkvippro2k5/lab21-qwen35-4b-lora-correct

## Resumen

Este repositorio contiene un adaptador LoRA llamado `correct`, entrenado sobre el modelo base `unsloth/Qwen3.5-4B` como parte de un ejercicio académico de fine-tuning. El propio autor, `dkvippro2k5`, lo etiqueta como "KNOWN BROKEN": el entrenamiento divergió con una pérdida final de aproximadamente 3 059 379 en lugar de un valor saludable por debajo de 1,0. Como resultado, el modelo generado solo produce caracteres `!` repetidos en inferencia y no genera JSON válido, por lo que no es utilizable para la tarea prevista de triaje de tickets.

El adaptador se ha subido únicamente como evidencia de apoyo para un informe de laboratorio, no como un artefacto funcional. El repositorio tiene un tamaño de 0,1 GB, cero descargas y cero likes, y no incluye información sobre licencia, idiomas o pipeline de inferencia. Es relevante como caso de estudio de fallos en entrenamiento de LoRA, pero no como modelo desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre base `unsloth/Qwen3.5-4B` (dense transformer) |
| Parametros totales | No disponible (adaptador LoRA, no modelo completo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Qwen3.5-4B soporta 262 144 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se configuró como `all-linear` con rango `r=16`, tasa de aprendizaje `1e-4`, precisión `fp16` y 30 pasos de entrenamiento. El método de entrenamiento fue LoRA (Low-Rank Adaptation) sobre un modelo base denso de 4 000 millones de parámetros. La causa raíz sospechada del fallo es un parche en el script que cambió `loss_type` de `"chunked_nll"` a `"nll"` para sortear un error de compatibilidad entre `trl` y Kaggle (`AttributeError: 'functools.partial' object has no attribute '__func__'`). El parche parece no normalizar la pérdida por el número de tokens supervisados, lo que provoca una explosión en la escala de la pérdida y el gradiente. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- El adaptador no produce texto coherente ni JSON válido; en inferencia genera únicamente repeticiones del carácter `!`.
- No se han documentado capacidades de razonamiento, código, matemáticas, visión o tool calling para este adaptador.
- No existe soporte para agentes ni multi-step reasoning.
- No se ha verificado ninguna capacidad multilingüe.
- El modelo base Qwen3.5-4B es multimodal (visión y texto) y soporta 262 144 tokens de contexto, pero este adaptador específico no aprovecha esas capacidades por estar roto.

## Casos de uso

- Documentación académica de errores de entrenamiento: el adaptador sirve como evidencia adjunta para el informe de laboratorio `submission/REPORT.md`, permitiendo auditar los síntomas de una divergencia de pérdida y el efecto de un parche de pérdida incorrecto.
- Análisis de causas raíz en fine-tuning LoRA: los desarrolladores pueden estudiar este caso para entender cómo un cambio en `loss_type` o una normalización inadecuada puede desestabilizar el entrenamiento.
- Prueba de diagnóstico de pipelines: el artefacto puede usarse para verificar que un sistema de inferencia detecta modelos degenerados (salida repetitiva) y los rechaza automáticamente.
- Reentrenamiento o corrección: el adaptador no es usable, pero el repositorio documenta la configuración exacta (r, LR, pasos) que permite reproducir el experimento y corregir el script para un nuevo intento.
- Educación en evaluación de modelos: este caso sirve para ilustrar por qué es imprescindible validar la pérdida final y la calidad de salida antes de publicar un adaptador.
- No hay casos de uso práctico en producción, dado que el modelo no genera salidas válidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente que la pérdida final divergió a ~3 059 379, lo que indica un entrenamiento fallido. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,1 GB, su carga sobre el modelo base Qwen3.5-4B requiere la VRAM necesaria para un modelo de 4B parámetros. Con cuantización FP16, se estima entre 8 y 12 GB de VRAM; con cuantización de 4 bits, entre 4 y 6 GB.
- GPU recomendadas para el modelo base: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares.
- El adaptador puede desplegarse con frameworks que soporten LoRA, como vLLM, TGI, PEFT+Transformers, o llama.cpp (si se convierte a GGUF).
- No se dispone de mediciones de latencia o throughput para este adaptador concreto, y el modelo base no se ha evaluado en este repositorio.

## Comparativa con modelos similares

La búsqueda web encontró otros adaptadores LoRA sobre Qwen3.5-4B, pero no se dispone de especificaciones detalladas ni resultados de rendimiento para comparar de forma rigurosa. Se listan como referencia, sin datos de rendimiento:

| Modelo | Base | Notas |
|---|---|---|
| `dkvippro2k5/lab21-qwen35-4b-lora-correct` (este) | Qwen3.5-4B | Adaptador roto, pérdida divergente, no usable |
| `gotam1/lab21-qwen35-4b-lora` | Qwen3.5-4B | Adaptador LoRA con tags `lora sft trl`, sin más datos |
| `KitakitaQaQ/qwen35-4b-law-lora-r2` | Qwen3.5-4B | Adaptador LoRA para dominio legal, entrenado con TRL, sin datos de rendimiento |

No hay datos de rendimiento ni de licencia para estos modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está roto: genera solo caracteres `!` repetidos y no produce JSON válido, por lo que no es utilizable para ninguna tarea práctica.
- La pérdida de entrenamiento divergió a un valor extremadamente alto (~3 millones), indicando inestabilidad numérica severa.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto para este adaptador.
- La licencia no está especificada, por lo que no se puede confirmar la permisividad para uso comercial.
- No se recomienda su uso en producción ni en entornos de desarrollo; es exclusivamente un artefacto de documentación académica.
- El autor advierte explícitamente que el adaptador no debe usarse para la tarea de triaje de tickets para la que fue diseñado.

## Enlaces

- Hugging Face: https://huggingface.co/dkvippro2k5/lab21-qwen35-4b-lora-correct
- Repositorio GitHub del informe: https://github.com/dkvippro2k5/Day21-Track3-Finetuning-Lab-2A202601724-DuongVanKien
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3.5-4B
