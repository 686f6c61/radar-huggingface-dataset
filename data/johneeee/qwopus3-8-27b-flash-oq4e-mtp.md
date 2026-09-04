# Johneeee/Qwopus3.8-27B-Flash-oQ4e-mtp

## Resumen

Qwopus3.8-27B-Flash-oQ4e-mtp es una versión cuantizada de un modelo de la familia Qwen3.5, publicada por el usuario Johneeee en Hugging Face. El modelo original, de tipo `qwen3_5`, ha sido convertido al formato MLX safetensors y cuantizado a 4 bits mediante la técnica oQ (oMLX v0.6.4), una cuantización de precisión mixta con grupo de tamaño 64.

El objetivo de esta publicación es ofrecer una versión reducida en peso y optimizada para inferencia en entornos MLX, especialmente en dispositivos Apple Silicon. El modelo cuenta con 27.781.427.952 parámetros totales y un tamaño de repositorio de 17,0 GB. No se proporciona información sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni la licencia, por lo que su utilidad real depende de las características del modelo base Qwen3.5 no documentadas en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (tipo de modelo según metadatos; detalles no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit oQ, grupo 64, precision mixta (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna, el número de capas, el mecanismo de atención ni la configuración del modelo original. Se sabe únicamente que el tipo de modelo es `qwen3_5`, lo que lo sitúa en la familia Qwen3.5, pero no se han documentado las variantes exactas ni las innovaciones técnicas del modelo base.

Tampoco se ofrecen datos sobre el proceso de entrenamiento: no consta el número de tokens, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o ajuste por instrucciones. La única intervención documentada es la cuantización posterior al entrenamiento, realizada con oQ (oMLX v0.6.4) a 4 bits con grupo de 64, lo que reduce el tamaño de los pesos manteniendo el formato MLX safetensors.

## Capacidades

No se han publicado capacidades específicas en la información disponible. A partir de los metadatos y la naturaleza del modelo se puede inferir que, al tratarse de una cuantización de un modelo Qwen3.5, hereda las capacidades del modelo base, pero no hay datos concretos sobre:

- Generación de texto, razonamiento o matemáticas.
- Soporte de tool calling o function calling.
- Capacidades de agentes o razonamiento multi-paso.
- Soporte de visión, audio o modos especiales.
- Idiomas soportados.

Cualquier afirmación sobre estas capacidades sería especulativa y no está respaldada por la documentación del repositorio.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. Dado su formato MLX y su cuantización 4-bit, el escenario más plausible es la inferencia local en dispositivos Apple Silicon, donde MLX aprovecha la memoria unificada y las GPU integradas. Sin embargo, sin datos sobre el modelo base, no es posible recomendar aplicaciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar que permitan comparar el rendimiento de este modelo con alternativas similares.

## Requisitos de hardware

- Estimación de VRAM basada en el tamaño del repositorio (17,0 GB) y la cuantización 4-bit: el modelo ocupa aproximadamente 13,9 GB en memoria para los pesos, más overhead de inferencia. En dispositivos Apple Silicon, el uso de memoria unificada será algo superior.
- GPU recomendadas: al ser un formato MLX, está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se ha probado en GPUs NVIDIA.
- No se dispone de información sobre si cabe en GPU de consumo; en el ecosistema MLX, la memoria unificada del sistema determina la viabilidad.
- Opciones de despliegue: se puede cargar con `mlx-lm` o con la librería oMLX. No se documentan otros entornos como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado datos comparativos en la información disponible. Existe un modelo similar publicado por el mismo autor, `Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp`, que comparte la misma base `qwen3_5` y cuantización oQ4e, pero no se proporcionan especificaciones, benchmarks ni comparativas entre ambos.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idiomas no declarados: no se indica qué idiomas soporta el modelo, un dato crítico para cualquier aplicación real.
- Ausencia de benchmarks: no hay métricas publicadas que validen la calidad del modelo tras la cuantización.
- La cuantización 4-bit puede degradar la precisión en comparación con el modelo original en precisión completa o superior, especialmente en tareas de razonamiento complejo.
- Riesgo de alucinación: como todo modelo generativo sin datos de evaluación publicados, se debe validar su salida antes de usarlo en producción.
- Sin documentación de capacidades: no se puede confirmar soporte de tool calling, agentes u otras funcionalidades sin información del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johneeee/Qwopus3.8-27B-Flash-oQ4e-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Modelo similar del mismo autor: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp
