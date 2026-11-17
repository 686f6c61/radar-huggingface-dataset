# ngqtrung/M3OPD-Warmup-SFT-Video-9B

## Resumen

M3OPD-Warmup-SFT-Video-9B es un ajuste fino de Qwen3.5-9B realizado por el usuario ngqtrung como parte de la receta experimental del paper M3OPD-Reasoner. Se trata de un checkpoint intermedio (paso 500) de un SFT de parametros completos sobre el subconjunto de video del dataset M3OPD-SFT-1.35M, orientado a razonamiento multimodal sobre video. No es un modelo final de produccion, sino una pieza de un pipeline de destilacion on-policy y aprendizaje por refuerzo (GSPO) que genera el profesor de warm-up del dominio de video.

El modelo hereda la arquitectura, tokenizer, processor y chat template de Qwen3.5-9B, con 9.409.813.744 parametros totales en formato safetensors y un repositorio de 18,8 GB. Su pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto (y, segun el nombre y la receta, video). Esta publicado bajo licencia Apache 2.0, la misma del modelo base.

Su relevancia es fundamentalmente metodologica: documenta un paso concreto de una receta de destilacion on-policy multimodal y sirve como referencia reproducible para investigadores que quieran replicar o analizar el efecto del warm-up SFT antes del RL. Con 46 descargas y 0 likes en el momento de la consulta, es un artefacto de investigacion de nicho, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); tag `qwen3_5` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el ejemplo de despliegue con `--max-model-len`) |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizacion via vLLM/SGLang, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su arquitectura, tokenizer, processor y plantilla de chat. El entrenamiento consiste en un SFT de parametros completos (full-parameter SFT) sobre el subconjunto `video` del dataset M3OPD-SFT-1.35M. Segun la model card, esta ejecucion concreta se entreno con dos trazas de Qwen3.8-Flash-Next por cada pregunta de video, mientras que el dataset M3OPD-SFT-1.35M conserva solo la primera de ellas. El checkpoint publicado corresponde al paso 500 del run de SFT.

La receta completa del paper M3OPD-Reasoner usa destilacion on-policy y aprendizaje por refuerzo con GSPO. A partir de este checkpoint se obtiene el profesor de warm-up del dominio de video (M3OPD-Warmup-Teacher-*-9B). La model card indica explicitamente que la receta principal no emplea SFT, por lo que este modelo es una variante comparativa ("compared recipe"). El entrenamiento y la evaluacion se realizan con la plantilla nativa de Qwen3.5, modo thinking activado, sin system prompt y con una linea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`).

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y video (pipeline image-text-to-text).
- Modo thinking nativo de Qwen3.5, activado por defecto en el entrenamiento y la evaluacion.
- Razonamiento de multiples pasos orientado a respuestas finales verificables (formato `\boxed{}`).
- Procesamiento de entradas multimodales con el processor de Qwen3.5.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre destilacion on-policy multimodal: el checkpoint permite reproducir el paso de warm-up SFT del dominio de video y comparar su efecto frente a la receta principal sin SFT.
- Generacion de profesores de warm-up: sirve como punto de partida para el RL con GSPO que produce el profesor de dominio de video, util en pipelines de destilacion propios.
- Razonamiento sobre video con respuesta verificable: adecuado para tareas donde la respuesta final se extrae de un bloque `\boxed{}`, como preguntas de comprension de video con respuesta corta.
- Analisis de QA multimodal en investigacion: permite estudiar el comportamiento de un modelo de 9B con contexto de 40.960 tokens en preguntas sobre video.
- Reproduccion de experimentos: al compartir arquitectura y plantilla con Qwen3.5-9B, se puede desplegar con vLLM o SGLang y comparar directamente contra el base.
- Evaluacion de recetas de datos: util para medir el impacto de entrenar con dos trazas por pregunta frente a una sola, tal como describe la model card.
- Base para ajustes posteriores: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de inicializacion para experimentos propios de SFT o RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos, mas memoria para KV cache y el encoder multimodal; en la practica se recomienda al menos 24 GB para contexto corto y bastante mas para contextos largos.
- Con contexto de 40.960 tokens, el KV cache escala con la longitud; se recomienda GPU con 48-80 GB para secuencias largas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue con contexto completo; RTX 4090 (24 GB) puede ser insuficiente en BF16 con contexto largo.
- Cabe en GPU de consumo solo con cuantizacion (por ejemplo, 8 bits o 4 bits), no documentada oficialmente para este checkpoint.
- Opciones de despliegue: Transformers, vLLM y SGLang, segun la model card. Ejemplo oficial: `vllm serve ngqtrung/M3OPD-Warmup-SFT-Video-9B --max-model-len 40960`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| M3OPD-Warmup-SFT-Video-9B | 9.409.813.744 | 40.960 tokens (uso documentado) | Apache 2.0 | Checkpoint intermedio de SFT de video |
| Qwen/Qwen3.5-9B | no disponible en la informacion | no disponible | Apache 2.0 (heredada) | Modelo base; misma arquitectura y plantilla |
| M3OPD-Warmup-Teacher-*-9B | no disponible | no disponible | no disponible | Profesor de warm-up derivado de este checkpoint via GSPO |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 500) de un run de SFT, no un modelo final; su calidad no esta validada como modelo de produccion.
- No se han publicado benchmarks ni evaluaciones cuantitativas en la informacion disponible.
- La receta principal del paper no usa SFT; este modelo es una variante comparativa, por lo que su comportamiento puede diferir del modelo de referencia del paper.
- Riesgo de alucinacion inherente a los modelos generativos; no cuantificado para este checkpoint.
- Sesgos conocidos: no documentados, pero heredables del modelo base y de los datos de destilacion (trazas de Qwen3.8-Flash-Next).
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- El formato de evaluacion asume modo thinking activado, sin system prompt y con linea de formato de respuesta; usos fuera de ese formato pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B y de los datasets de entrenamiento.
- El contexto documentado de 40.960 tokens es el usado en el ejemplo de despliegue, no necesariamente el maximo nativo del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-SFT-Video-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Coleccion M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Paper M3OPD-Reasoner: no disponible (no se proporciona enlace directo)
