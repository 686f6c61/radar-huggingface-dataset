# GenoaSai74/papi

## Resumen

El modelo `papi` es una publicación de HuggingFace realizada por el usuario GenoaSai74. Según las etiquetas del repositorio, se trata de un modelo de lenguaje basado en la arquitectura GLM-4 MoE Lite, con un total de 18.633.333.696 parámetros y pesos distribuidos en formato safetensors con una cuantización de 8 bits.

La información disponible es extremadamente limitada: la model card solo especifica la licencia MIT, y las búsquedas web no ofrecen documentación técnica, benchmarks ni descripción de capacidades. Esto impide evaluar su rendimiento o adecuación para tareas concretas. Su publicación es reciente y aún no cuenta con descargas ni valoraciones, por lo que se recomienda precaución antes de utilizarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 MoE Lite (segun tag `glm4_moe_lite`) |
| Parametros totales | 18.633.333.696 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El único dato técnico disponible es la etiqueta `glm4_moe_lite`, que indica que el modelo emplea una arquitectura MoE (Mixture of Experts) ligera de la familia GLM-4. Al tratarse de un modelo MoE, se espera que solo una fracción de los parámetros se active por token, pero no se dispone del número de parámetros activos.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas como RLHF o DPO. Tampoco se describen innovaciones técnicas destacables.

## Capacidades

- No se ha publicado información sobre las capacidades del modelo.
- La etiqueta `glm4_moe_lite` sugiere que pertenece a una familia de modelos de lenguaje de propósito general, pero no se pueden afirmar capacidades concretas de generación de texto, razonamiento, código, matemáticas, tool calling o multimodalidad.
- No existe documentación que indique soporte de funciones, agentes o modos especiales de inferencia.

## Casos de uso

- No disponible: la información proporcionada no permite determinar casos de uso concretos y realistas. La ausencia de documentación, benchmarks y evaluación pública impide identificar escenarios de aplicación adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en 8-bit ocupan aproximadamente 18,6 GB, y el repositorio pesa 21,1 GB. Se recomienda al menos 24 GB de VRAM para una carga razonable.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) para inferencia en 8-bit.
- En GPU de consumo: es ejecutable en una RTX 4090, pero no en tarjetas con menos de 24 GB de VRAM. No se recomienda su uso en GPU de menos de 12 GB.
- Opciones de despliegue: vLLM, llama.cpp y Ollama son opciones potenciales, pero el repositorio solo contiene pesos en safetensors. Para su uso con llama.cpp u Ollama se requiere conversión previa a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de esta búsqueda. Dado que el modelo no tiene benchmarks ni documentación pública, no se puede comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no contiene descripción técnica, de uso ni advertencias específicas.
- No se han publicado evaluaciones de sesgos o riesgo de alucinación.
- Se desconoce el conjunto de datos de entrenamiento y su composición, por lo que no se puede valorar la calidad o los sesgos del modelo.
- Aunque la licencia MIT permite uso comercial, la falta de documentación supone un riesgo para la integración en producción.
- La cuantización 8-bit puede degradar la calidad de la salida en comparación con el modelo original sin cuantizar.
- No hay información sobre idiomas soportados, por lo que el rendimiento en castellano u otros idiomas es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/GenoaSai74/papi
- DOI asignado: https://doi.org/10.57967/hf/10300
