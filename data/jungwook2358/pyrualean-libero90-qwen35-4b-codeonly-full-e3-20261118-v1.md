# jungwook2358/pyrualean-libero90-qwen35-4b-codeonly-full-e3-20261118-v1

## Resumen

`pyrualean-libero90-qwen35-4b-codeonly-full-e3-20261118-v1` es un artefacto de inferencia publicado por el usuario jungwook2358 en Hugging Face. Se trata de un ajuste fino (SFT) completo del modelo base Qwen/Qwen3.5-4B, entrenado sobre un conjunto de 90 rollouts y 421 ejemplos etiquetados en modalidad "code-only". No es un modelo de propósito general entrenado desde cero, sino un derivado de investigación orientado a tareas de manipulación robótica del benchmark LIBERO, según se deduce del nombre del repositorio y de la referencia a "LIBERO SFT" en la model card.

El modelo conserva la arquitectura del Qwen3.5-4B original (familia transformer de Qwen, tag `qwen3_5` en el hub) y cuenta con 4.539.265.536 parámetros en formato safetensors, lo que supone un repositorio de 9,1 GB. El entrenamiento se realizó en tres épocas sobre el paso nativo final 42 y se exportó como artefacto de inferencia, preservando los checkpoints de optimizador, scheduler y RNG en el servidor de origen del autor, no en el hub.

Su relevancia es limitada fuera del contexto de investigación: se publica sin pipeline declarado, sin licencia, sin idiomas especificados y sin resultados de benchmarks. Es útil como referencia reproducible para quienes trabajen con ajuste fino de Qwen3.5-4B sobre datos de robótica tipo LIBERO y quieran inspeccionar la procedencia del entrenamiento mediante los ficheros `training-completion-proof.json` e `inference-export-manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y se ajusta mediante SFT completo ("full"), no mediante LoRA ni adaptadores. El entrenamiento comprende el paso nativo final 42 y tres épocas sobre 90 rollouts que generan 421 ejemplos de entrenamiento. Las etiquetas son exclusivamente de código ("code-only"), lo que sugiere que las trayectorias se representan como código ejecutable o secuencias de acciones codificadas, coherente con el dominio LIBERO de manipulación robótica.

El formateador de entrenamiento se configura con `enable_thinking=False`, es decir, se desactiva el modo de razonamiento explícito durante el ajuste. La model card aclara que la evaluación formal "native200" mantiene su configuración de thinking por defecto, lo que introduce una posible discrepancia entre el régimen de entrenamiento y el de evaluación. Se preservan checkpoints completos de optimizador, scheduler y RNG en el servidor de origen, y se incluyen ficheros de procedencia con hashes SHA256 (`training-completion-proof.json`, `inference-export-manifest.json`). No se detallan innovaciones arquitectónicas adicionales ni la composición exacta del dataset más allá del recuento de rollouts y ejemplos.

## Capacidades

- Generación de código: el ajuste "code-only" orienta la salida hacia representaciones en código, presumiblemente acciones o políticas para entornos LIBERO.
- Manipulación robótica en el benchmark LIBERO: el nombre del repositorio y la referencia a "LIBERO SFT" indican especialización en tareas de este entorno.
- Razonamiento de múltiples pasos: heredado del modelo base Qwen3.5-4B, aunque el entrenamiento se realizó con `enable_thinking=False`.
- Capacidades del modelo base: al ser un ajuste fino de Qwen3.5-4B, conserva potencialmente las capacidades del original (generación de texto, matemáticas, multilingüismo), si bien no se documentan en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el thinking se desactivó en el formateador de entrenamiento.

## Casos de uso

- Investigación en ajuste fino de políticas robóticas: el modelo sirve como referencia reproducible para estudiar cómo un SFT completo sobre 421 ejemplos afecta a Qwen3.5-4B en tareas LIBERO, con procedencia verificable mediante hashes SHA256.
- Reproducción de experimentos LIBERO: investigadores que repliquen el pipeline pueden comparar sus resultados con este artefacto de inferencia publicado tras tres épocas y el paso 42.
- Evaluación de la discrepancia thinking/no-thinking: permite analizar el impacto de entrenar con `enable_thinking=False` mientras la evaluación native200 mantiene el thinking por defecto.
- Generación de código de acciones en entornos simulados: el etiquetado code-only sugiere uso para producir secuencias de acciones codificadas en tareas de manipulación.
- Base para experimentos de destilación o comparación: al ser un ajuste de 4,5B parámetros en safetensors, puede cargarse en pipelines de investigación para comparar con el Qwen3.5-4B original.
- Auditoría de artefactos de investigación: los ficheros de prueba de entrenamiento y manifiesto de exportación permiten verificar la integridad y procedencia del modelo en contextos de revisión por pares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos; en 4 bits, alrededor de 3 GB para pesos, aunque no se distribuyen cuantizaciones en el repo.
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP16.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más en FP16 (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti); en cuantización 4 bits podría caber en 8 GB, aunque no hay GGUF publicado.
- Opciones de despliegue: vLLM, TGI o llama.cpp (este último requeriría conversión a GGUF, no disponible en el repo); transformers con safetensors es la vía directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pyrualean-libero90-qwen35-4b-codeonly-full-e3 | 4,54B | no disponible | no disponible | safetensors en HF | SFT code-only sobre LIBERO, 421 ejemplos |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en esta ficha | HF | Modelo base sin ajuste LIBERO |
| Alternativas LIBERO | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor o consultarse el modelo base Qwen3.5-4B.
- Sin pipeline declarado ni idiomas especificados: la integración en producción requiere validación manual.
- Dataset de entrenamiento muy reducido (421 ejemplos, 90 rollouts): riesgo alto de sobreajuste y de generalización limitada fuera de LIBERO.
- Discrepancia thinking: entrenado con `enable_thinking=False` pero evaluado con el thinking por defecto en native200, lo que puede distorsionar comparaciones.
- Riesgo de alucinación: heredado del modelo base; no se documentan mitigaciones específicas.
- Sesgos: no documentados; al derivar de Qwen3.5-4B, puede heredar los sesgos del modelo original.
- Contexto e idiomas: no disponibles, lo que impide planificar despliegues multilingües o con ventanas largas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Artefacto de investigación: los checkpoints de optimizador y RNG no están en el hub, solo en el servidor de origen, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/pyrualean-libero90-qwen35-4b-codeonly-full-e3-20261118-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Ficheros de procedencia en el repo: `training-completion-proof.json`, `inference-export-manifest.json`
