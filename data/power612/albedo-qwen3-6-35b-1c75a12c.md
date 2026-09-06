# power612/albedo-qwen3.6-35b-1c75a12c

## Resumen

El modelo `power612/albedo-qwen3.6-35b-1c75a12c` es un modelo de lenguaje publicado en HuggingFace por el usuario `power612`. Según las etiquetas del repositorio, se trata de un modelo con arquitectura de mixture of experts (MoE) de la familia Qwen3.5, aunque el nombre del repositorio indica `qwen3.6-35b`. Cuenta con un total de 35.951.822.704 parámetros, lo que supone un tamaño de pesos de 71,9 GB en formato `safetensors` con precisión BF16. La fecha de creación es el 6 de septiembre de 2026.

En la ficha de HuggingFace no se proporciona información sobre el proceso de entrenamiento, la longitud de contexto, los idiomas soportados, la licencia ni los resultados de benchmarks. Tampoco existe un model card descriptivo. Por tanto, no es posible evaluar las capacidades ni la relevancia práctica del modelo a partir de la información publicada.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según etiqueta `qwen3_5_moe`; familia Qwen3.5 |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no incluye detalles sobre la arquitectura interna ni el proceso de entrenamiento. Las etiquetas del repositorio indican `qwen3_5_moe`, lo que sugiere una arquitectura de mixture of experts de la familia Qwen3.5, pero no se especifica el número de expertos, la dimensionalidad, ni el número de parámetros activos. Tampoco se aportan datos sobre el conjunto de datos de entrenamiento, el número de tokens, ni técnicas de alineación como RLHF o DPO. El tamaño de los pesos (71,9 GB) es consistente con 35.951.822.704 parámetros en precisión BF16, pero no hay más información sobre el diseño o el entrenamiento.

## Capacidades

- No se ha publicado información sobre las capacidades del modelo en la ficha de HuggingFace. No se dispone de datos sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes, capacidades multilingües ni modos especiales.

## Casos de uso

- No es posible determinar casos de uso concretos sin información sobre las capacidades del modelo. Cualquier aplicación práctica sería especulativa, por lo que no se pueden enumerar casos de uso verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 72 GB, dado que el tamaño de los pesos es de 71,9 GB. Esta estimación no incluye el overhead de la KV cache ni de los activaciones.
- VRAM estimada con cuantización a 4 bits: aproximadamente 18 GB, basado en 35.951.822.704 parámetros. Sin embargo, no se ha publicado ninguna cuantización en el repositorio.
- GPUs recomendadas para BF16: A100 80GB o H100 80GB.
- En una GPU de consumo como la RTX 4090 (24 GB) no cabrían los pesos en BF16; con una cuantización a 4 bits sí sería posible, siempre que exista dicha cuantización.
- Opciones de despliegue: no disponible. No se especifica compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros frameworks.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones de contexto.
- La ausencia de una licencia explícita impide confirmar si el modelo puede utilizarse con fines comerciales.
- La falta de model card y de documentación técnica hace que el modelo no sea apto para su evaluación rigurosa en producción sin información adicional.
- La discrepancia entre el nombre del repositorio (`qwen3.6-35b`) y la etiqueta (`qwen3_5_moe`) introduce incertidumbre sobre la arquitectura real.

## Enlaces

- HuggingFace: https://huggingface.co/power612/albedo-qwen3.6-35b-1c75a12c
