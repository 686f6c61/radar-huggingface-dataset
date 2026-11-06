# iOvermind/Qwen3.8-27B-Uncensored-oQ8-mtp

## Resumen

Qwen3.8-27B-Uncensored-oQ8-mtp es una cuantización de precisión mixta del modelo Qwen3.8-27B en su variante "uncensored", publicada por el usuario iOvermind en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.3), un esquema de cuantización de precisión mixta orientado a la librería MLX de Apple, lo que lo hace ejecutable de forma nativa en hardware Apple Silicon. El modelo conserva el pipeline multimodal del original: incluye un componente de visión de 0,461B de parámetros además del language model y una cabeza MTP (multi-token prediction) de 0,425B.

El checkpoint totaliza 27.781.427.952 parámetros (27,78B) y ocupa 30,0 GB en disco, con un promedio efectivo de 8,639 bits por peso. La práctica totalidad de los pesos (98,143%) se almacena en affine 8-bit con grupo de 64, mientras que un 1,857% (0,516B) se mantiene en BF16, presumiblemente para preservar capas sensibles a la cuantización. La etiqueta "mtp" indica que el modelo incorpora decodificación especulativa mediante predicción multi-token, una innovación de la familia Qwen3 orientada a acelerar la inferencia.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada de un modelo de ~28B con visión y MTP pensada para MLX; por otro, conviene señalar que la información pública disponible es muy escasa (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin benchmarks), por lo que muchas especificaciones deben tratarse como no disponibles y la evaluación práctica queda pendiente de validación por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), multimodal con vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 8-bit grupo 64 (98,143% de pesos) + BF16 (1,857%); media efectiva 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria `mlx` |
| Tamano del repositorio | 30,0 GB (27,941 GiB) |
| Desglose de almacenamiento | Language model 26,896B / 26,617 GiB; vision 0,461B / 0,858 GiB; MTP head 0,425B / 0,466 GiB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3.5 (tag `qwen3_5`), un transformer multimodal que integra un language model de 26,896B parámetros, un codificador de visión de 0,461B y una cabeza de predicción multi-token (MTP) de 0,425B. La presencia de la cabeza MTP es relevante: se trata de un mecanismo de decodificación especulativa que predice varios tokens por paso y que la familia Qwen3 emplea para aumentar el throughput de generación sin degradar la calidad. El checkpoint ha sido cuantizado con oQ (oMLX v0.7.3), que aplica precisión mixta: la mayor parte de los pesos en affine 8-bit con grupo de 64 y una fracción pequeña en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original pasó por fases de RLHF, DPO o similares. Tampoco se documenta el proceso de "uncensoring" aplicado por el autor original del modelo base, más allá de la etiqueta en el nombre. En cuanto a la cuantización, el esquema oQ con grupo de 64 y 8 bits es un compromiso habitual para modelos de este tamaño en Apple Silicon: reduce el peso a ~28 GiB manteniendo una fidelidad alta respecto al BF16 original, a costa de un ligero incremento de error en capas que el autor ha decidido no proteger en BF16.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-27B.
- Procesamiento de imágenes: el checkpoint incluye un componente de visión de 0,461B de parámetros, por lo que se espera soporte multimodal (visión-lenguaje), aunque no se detalla en la model card.
- Decodificación especulativa mediante la cabeza MTP de 0,425B, orientada a acelerar la generación.
- Ejecución nativa en Apple Silicon a través de MLX.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de ~28 GiB permiten ejecutar el modelo en equipos con memoria unificada de 32 GB o superior, útil para prototipado y desarrollo sin depender de la nube.
- Asistentes conversacionales con contexto multimodal: la inclusión del codificador de visión permite construir asistentes que respondan a preguntas sobre imágenes capturadas o compartidas por el usuario, siempre que se valide el comportamiento real del componente visual.
- Generación de texto creativo sin filtros editoriales: la etiqueta "uncensored" sugiere un uso orientado a escritura creativa, guiones o narrativa donde el modelo base aplicaría rechazos; conviene revisar el comportamiento ético y legal antes de desplegarlo.
- Aceleración de pipelines de generación: la cabeza MTP puede aprovecharse para reducir la latencia en tareas de generación larga (resúmenes, traducción, redacción), aunque el soporte efectivo depende del runtime MLX empleado.
- Experimentación e investigación en cuantización: el checkpoint sirve como caso de estudio de precisión mixta (8-bit affine + BF16) para medir la degradación respecto al modelo original en tareas concretas.
- Evaluación comparativa de modelos "uncensored": útil para investigadores que estudien el efecto del ajuste fino sin censura sobre la calidad y la seguridad de un modelo de ~28B.
- Despliegue en estaciones de trabajo Apple para tareas de análisis de documentos con imágenes (facturas, capturas, diagramas), sujeto a validación empírica del rendimiento multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~28 GiB para cargar el checkpoint completo en MLX (27,941 GiB de pesos más overhead de runtime). Se recomienda un mínimo de 32 GB de memoria unificada; 36-48 GB deja margen para el contexto y el KV cache.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Max/Ultra, M3 Max/Ultra, M4 Max/Ultra). No es un checkpoint pensado para CUDA: el formato es MLX y requiere la librería `mlx`.
- ¿Cabe en GPU consumer? En el ecosistema Apple, sí en equipos con 32 GB o más de memoria unificada. En GPUs NVIDIA consumer (24 GB) no cabe en 8-bit; requeriría cuantizaciones adicionales no incluidas en este repo (por ejemplo, 4-bit), que no se distribuyen aquí.
- Opciones de despliegue: `mlx-lm` / `mlx` (runtime nativo del formato), oMLX/oQ para gestión de cuantizaciones. No se distribuyen pesos GGUF, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente a este repo.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-oQ8-mtp (este) | 27,78B | no disponible | safetensors MLX (8-bit mixto) | no disponible | Hugging Face, 0 descargas |
| Modelo base Qwen3.5-27B (referencia) | ~27B | no disponible | safetensors BF16 | no disponible | No verificado en la información |
| Otras cuantizaciones MLX de la familia Qwen3 | no disponible | no disponible | safetensors MLX | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas directas en la información proporcionada, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- La licencia no está declarada en el repo, lo que impide confirmar si se permite uso comercial; debe consultarse con el autor o con la licencia del modelo base antes de cualquier despliegue en producción.
- El modelo está etiquetado como "uncensored": puede generar contenido que el modelo base rechazaría, con implicaciones legales, éticas y de seguridad que el usuario debe evaluar.
- No se declaran idiomas soportados; el rendimiento en castellano no está verificado.
- No hay benchmarks ni evaluaciones publicadas: cualquier afirmación sobre calidad, razonamiento o matemáticas carece de respaldo empírico.
- Riesgo de alucinación inherente a los modelos de lenguaje, sin datos específicos de mitigación en esta variante.
- La cuantización a 8,639 bits/peso puede introducir degradación sutil respecto al BF16 original en tareas sensibles; no se documenta una evaluación de dicha degradación.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversión.
- Repo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- El componente de visión y la cabeza MTP están incluidos, pero no se documenta cómo activarlos ni qué runtimes los soportan completamente.

## Enlaces

- Hugging Face: https://huggingface.co/iOvermind/Qwen3.8-27B-Uncensored-oQ8-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-27B: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
