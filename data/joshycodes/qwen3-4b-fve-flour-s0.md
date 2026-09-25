# joshycodes/qwen3-4b-fve-flour-s0

## Resumen

`joshycodes/qwen3-4b-fve-flour-s0` es un checkpoint de investigación derivado de `Qwen/Qwen3-4B` mediante *continued pretraining* de pesos completos sobre un corpus denominado `flourishing-vs-equanimity`. Lo publica el usuario joshycodes y se enmarca en una línea de trabajo sobre *model welfare* y entrenamiento de personaje autoinducido (*self-authored-character*), no en una línea de mejora de capacidades. El repositorio tiene 0 descargas y 0 likes, y la propia model card indica explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse.

Técnicamente es un transformer denso decoder-only de 4.411.424.256 parámetros (4,41 B), heredado del Qwen3-4B, con un repositorio de 8,8 GB en safetensors (consistente con pesos completos en precisión de 16 bits). El entrenamiento reportado es de 1 epoch con *learning rate* 1e-05 sobre 37.092.088 tokens distribuidos en 37.868 documentos, una cantidad muy reducida de cómputo de ajuste, orientada a modificar el comportamiento estilístico o identitario y no a inyectar conocimiento nuevo.

Su relevancia es metodológica más que funcional: documenta un experimento de ajuste sobre un corpus supuestamente escrito por el propio modelo, con fines de estudio de bienestar y de dinámicas de identidad. La model card contiene además una ambigüedad relevante: afirma que el corpus fue escrito por el modelo para entrenar a su siguiente versión, pero el desglose de datos indica "0 self-authored and 37.868 ordinary text", es decir, cero documentos autoescritos. Cualquier interpretación de los resultados debe partir de esa discrepancia sin resolver.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN segun la documentacion de Qwen |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; el repo contiene pesos completos (~8,8 GB, precision de 16 bits). Convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible para el checkpoint; el modelo base Qwen3 declara soporte para 119 idiomas |
| Licencia | other / research-only (uso exclusivo de investigacion; la model card indica "Do not deploy") |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tamano del repositorio | 8,8 GB |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: se trata de `Qwen/Qwen3-4B`, un transformer denso decoder-only de la familia Qwen3, que en su versión original incorpora modos de razonamiento (*thinking*) y no razonamiento, y un entrenamiento multilingüe a gran escala descrito en el informe técnico de Qwen3. Este checkpoint conserva la topología y el tokenizador del base; lo único que cambia son los pesos tras el *continued pretraining*.

El procedimiento de ajuste reportado es un entrenamiento continuado de pesos completos (*full weights*) con *learning rate* 1e-05, 1 epoch y un total de 37.092.088 tokens (~37 M) sobre 37.868 documentos del corpus `flourishing-vs-equanimity`. El desglose de composición indicado es "0 self-authored and 37.868 ordinary text", lo que contradice la descripción textual de la model card, que presenta el corpus como escrito por el propio modelo. No se documenta uso de RLHF, DPO, ni ninguna innovación técnica adicional (no hay decodificación especulativa, atención lineal ni variantes híbridas). No se especifica la composición lingüística ni la mezcla de dominios del corpus.

## Capacidades

- No se han publicado evaluaciones de capacidad para este checkpoint; la model card indica explícitamente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Al derivar de Qwen3-4B por ajuste ligero, es razonable esperar generación de texto, razonamiento y código en el rango del modelo base, pero esto no está verificado y no debe asumirse.
- No hay información sobre soporte de *tool calling* / *function calling* en este checkpoint concreto.
- No hay información sobre capacidades de agente o razonamiento multi-paso en este checkpoint.
- No hay información sobre comportamiento multilingüe tras el ajuste, más allá del soporte declarado del modelo base.
- La etiqueta `self-authored-character` sugiere un objetivo de consistencia de personaje, pero no se aportan métricas ni ejemplos que lo confirmen.

## Casos de uso

- Estudio de efectos de *continued pretraining* de bajo cómputo: usar el checkpoint para medir cuánto cambia el comportamiento de un modelo de 4 B tras 1 epoch y ~37 M tokens, comparando contra `Qwen/Qwen3-4B` con las mismas prompts.
- Investigación en *model welfare*: el modelo se publica como artefacto de estudio sobre marcos de "flourishing vs equanimity"; sirve como material de análisis para discutir cómo se formulan y evalúan hipótesis de bienestar en modelos.
- Auditoría de corpus sintéticos: inspeccionar el efecto de un corpus etiquetado como autoescrito sobre los pesos finales, incluyendo la verificación de la discrepancia entre metadatos y descripción.
- Reproducibilidad de pipelines de ajuste: replicar la receta (lr 1e-05, 1 epoch, pesos completos) sobre el mismo base para validar la infraestructura de entrenamiento antes de escalar a corpus mayores.
- Análisis de deriva de identidad y estilo: comparar distribuciones de salida (léxico, formato, tono) entre el checkpoint y el base para cuantificar cuánta "personalidad" introduce un ajuste tan corto.
- Pruebas de seguridad y red-teaming metodológico: usar el checkpoint como caso de estudio de un artefacto no evaluado, para diseñar protocolos de evaluación que detecten fallos antes de cualquier despliegue.
- Docencia y experimentación académica: servir de ejemplo reproducible de un *checkpoint* de investigación con licencia restringida y advertencia explícita de no desplegar, útil en cursos de ética y ciclo de vida de modelos.

No se recomienda ningún caso de uso en producción: la model card indica "Do not deploy" y no existe evaluación de capacidad ni de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y no se aportan métricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: en torno a 9-11 GB solo para pesos (4,41 B × 2 bytes ≈ 8,8 GB) más caché KV y activaciones, por lo que conviene reservar 12-16 GB.
- En cuantización de 8 bits: aproximadamente 4,5-5,5 GB de pesos.
- En cuantización de 4 bits: aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas para 16 bits: cualquier GPU con 16 GB o más (RTX 4090, RTX 4080, A100 40 GB, H100). Cabe en GPUs de consumo de gama alta.
- GPU de consumo: sí cabe. En 16 bits, RTX 4090, RTX 3090 o RTX 4060 Ti 16 GB. En 8 o 4 bits, tarjetas de 8 GB como RTX 3060 Ti o RTX 4060 pueden ser suficientes para pesos, con margen limitado para contexto largo.
- Opciones de despliegue: vLLM y TGI pueden cargar safetensors directamente; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio no incluye versiones cuantizadas.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia.
- Advertencia: este *checkpoint* está marcado como no desplegable; los requisitos anteriores son estimaciones de viabilidad técnica, no una recomendación de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-fve-flour-s0 | 4,41 B (denso) | no especificado para el checkpoint | research-only ("do not deploy") | 0 descargas, sin pipeline declarado | Checkpoint de investigacion no evaluado |
| Qwen/Qwen3-4B | ~4 B (denso) | 32.768 nativos, 131.072 con YaRN segun Qwen | Apache 2.0 (segun el repositorio oficial) | Ampliamente disponible | Modelo base; incluye modos thinking y no thinking |
| Qwen3-30B-A3B (misma familia) | 30 B totales, 3 B activos (MoE) | 32.768 nativos segun Qwen | Apache 2.0 | Ampliamente disponible | Alternativa de mayor capacidad dentro de la familia Qwen3 |
| Qwen3-0.6B / 1.7B (misma familia) | 0,6 B y 1,7 B (densos) | 32.768 nativos segun Qwen | Apache 2.0 | Ampliamente disponible | Alternativas mas ligeras para experimentacion con menos VRAM |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del checkpoint frente a estas alternativas.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: la model card indica que no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse.
- Licencia research-only: queda restringido el uso comercial y cualquier redistribución; es imprescindible revisar los términos exactos de la licencia "other" antes de cualquier uso.
- Discrepancia documental: la descripción afirma que el corpus fue escrito por el propio modelo, mientras que los metadatos indican "0 self-authored and 37.868 ordinary text". Esto invalida parcialmente la interpretación del experimento.
- Riesgo de alucinación: no evaluado. Al derivar de un ajuste corto, el comportamiento en cuanto a veracidad debería asumirse similar al del modelo base, sin garantías.
- Deriva de comportamiento no medida: un ajuste sobre un corpus temáticamente sesgado (flourishing vs equanimity) puede alterar el estilo y el tono de forma no documentada.
- Idiomas: no se especifica en qué idiomas se realizó el ajuste ni si el multilingüismo del base se ha degradado.
- Contexto: no se documenta si la ventana de 32.768 tokens del base se mantiene intacta tras el ajuste de pesos completos.
- Sin versiones cuantizadas ni pipeline declarado: la integración en herramientas habituales (Ollama, llama.cpp) exige conversión manual de los pesos.
- Cero descargas y cero likes: no existe validación comunitaria ni evidencia de terceros sobre su comportamiento.
- Riesgo de sobreinterpretación: los resultados de este checkpoint no deben extrapolarse a conclusiones generales sobre *model welfare* ni sobre entrenamiento autoinducido sin un diseño experimental controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-fve-flour-s0
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Página de la familia Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Artefacto relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain
- Artefacto relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-selfjudge-chat
