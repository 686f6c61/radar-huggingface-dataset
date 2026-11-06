# halilgokdal/mirror-mlx-community-Qwen3.5-4B-MLX-8bit

## Resumen

Este repositorio es un espejo (mirror) de los pesos `mlx-community/Qwen3.5-4B-MLX-8bit`, una cuantización en 8 bits del modelo Qwen3.5-4B preparada para su ejecución en el framework MLX de Apple (Apple Silicon). El autor del espejo, `halilgokdal`, lo mantiene como copia de seguridad para que una aplicación personal de iPad pueda seguir descargando el modelo auxiliar si el repositorio original desaparece. Los ficheros son idénticos byte a byte al original, verificado mediante SHA-256, y el diseño de ficheros coincide con el original (`chat_template.jinja`).

El modelo subyacente pertenece a la familia Qwen3.5 de Alibaba, con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) según los tensores en safetensors. Se distribuye en formato MLX cuantizado a 8 bits, lo que reduce el peso en disco y memoria respecto a los pesos en precisión completa, y está orientado a inferencia local en hardware Apple.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un desarrollo propio del autor del espejo, sino de una réplica de un artefacto existente. La licencia declarada en el repositorio es `other`, mientras que la model card del espejo afirma que la licencia de los pesos originales es Apache-2.0; esa discrepancia debe tenerse en cuenta antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen3.5; detalles de capas no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); otras cuantizaciones del original no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | other (la model card del espejo indica Apache-2.0 para los pesos originales) |
| Formato de pesos | safetensors (formato MLX), con `chat_template.jinja` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y la indicación de que se trata de un transformer de la familia Qwen3.5. No se documentan en la información proporcionada el número de capas, la dimensión oculta, el tipo de atención, ni si emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras fases de alineación. Lo único verificable es el resultado del artefacto: una conversión a 8 bits para MLX, con ficheros idénticos al repositorio `mlx-community/Qwen3.5-4B-MLX-8bit` en el commit `5319bbbe4f1cbe6c0b3c80f4f7de4f0338c3906d`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo Qwen3.5-4B original (no verificadas en esta ficha).
- Ejecución local en Apple Silicon mediante MLX, con pesos ya cuantizados a 8 bits.
- Uso como modelo auxiliar dentro de una aplicación de iPad, según el propósito declarado por el autor del espejo.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Copia de seguridad para aplicaciones iOS/iPadOS: el espejo garantiza la disponibilidad del modelo auxiliar si el repositorio original se retira, manteniendo idéntico el diseño de ficheros y el `chat_template.jinja`.
- Inferencia local en Mac con Apple Silicon: los pesos en formato MLX 8-bit permiten ejecutar el modelo sin conversión adicional en equipos con memoria unificada.
- Prototipado de asistentes conversacionales en dispositivos Apple: el tamaño de 4,5 mil millones de parámetros en 8 bits encaja en configuraciones de memoria moderadas, aunque el contexto y el rendimiento real no están documentados.
- Despliegue en apps de iPad con modelo empaquetado: el propósito declarado del autor es precisamente servir este caso, con descarga directa desde el repositorio espejo.
- Evaluación comparativa de cuantizaciones: útil para contrastar la variante 8-bit MLX frente a otras cuantizaciones del mismo modelo base, siempre que se disponga de las versiones alternativas.
- Archivo y trazabilidad de artefactos: la verificación SHA-256 y la referencia al commit original permiten auditar la integridad de los pesos en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,2 GB; en 8 bits se requiere del orden de esa cifra de memoria para cargar los pesos, más overhead de ejecución (no cuantificado en la información disponible).
- GPU recomendadas: hardware Apple Silicon (MLX); no se documentan requisitos para GPU NVIDIA.
- Cabe en equipos Apple con memoria unificada suficiente para alojar ~5,2 GB de pesos más estado de inferencia; modelos concretos no disponibles.
- Opciones de despliegue: MLX (framework nativo); vLLM, llama.cpp, Ollama o TGI no están indicados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este espejo (Qwen3.5-4B MLX 8-bit) | 4.539.265.536 | no disponible | safetensors MLX 8-bit | other (original Apache-2.0 según la model card) | Hugging Face, 0 descargas |
| `mlx-community/Qwen3.5-4B-MLX-8bit` (original) | no disponible en la información | no disponible | MLX 8-bit | Apache-2.0 según la model card del espejo | Hugging Face (repo original) |
| Otras cuantizaciones de Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor: cualquier mérito o defecto del modelo corresponde a los autores originales de Qwen3.5-4B.
- La licencia declarada en el repositorio es `other`, mientras que la model card afirma Apache-2.0 para los pesos originales; conviene verificar los términos del repositorio original antes de uso comercial.
- Sin datos de benchmarks, contexto, idiomas ni arquitectura detallada: no es posible evaluar rendimiento o calidad a partir de esta ficha.
- Riesgo de alucinación y sesgos: propios del modelo base, no documentados aquí.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en la misma marca temporal (2026-11-05), lo que sugiere un artefacto de archivo personal sin validación comunitaria.
- Dependencia de MLX: no es directamente utilizable en ecosistemas CUDA, vLLM o llama.cpp sin conversión.
- El propósito declarado (app personal de iPad) no implica soporte ni mantenimiento por parte del autor del espejo.

## Enlaces

- Repositorio espejo: https://huggingface.co/halilgokdal/mirror-mlx-community-Qwen3.5-4B-MLX-8bit
- Repositorio original: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Commit original referenciado: `5319bbbe4f1cbe6c0b3c80f4f7de4f0338c3906d`
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
