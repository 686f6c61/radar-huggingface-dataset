# dwilson2547/Qwen3.5-4B-drop2-mixed-repair

## Resumen

Qwen3.5-4B-drop2-mixed-repair es un artefacto de investigación publicado por el usuario dwilson2547 que parte del modelo base Qwen/Qwen3.5-4B (4.100.503.168 parámetros reales en safetensors) y le aplica una cirugía estructural de profundidad: elimina 2 de sus 36 capas de decoder (las capas 24 y 28, seleccionadas por un ranking de importancia basado en similitud coseno entre vecinos), conservando intactas las 8 capas de atención completa del modelo híbrido. El resultado conserva aproximadamente el 94% de los parámetros originales y se somete después a un fine-tune de reparación con QLoRA para recuperar parte de la calidad perdida.

El problema que aborda es puramente metodológico: medir cuánto de un modelo recortado puede restaurarse sin reentrenamiento completo. La reparación se hizo con QLoRA (r=16) sobre las proyecciones de atención y MLP, durante 1 época sobre 9,5 millones de tokens con una dieta mixta (61% FineWeb-EDU, 27% wikitext-2 train, 12% código C/C++ y Python), en unos 70 minutos sobre una única GPU de consumo con 3,9 GiB de VRAM.

Es relevante ahora porque documenta con honestidad un fenómeno habitual en la literatura de pruning: la especialización por corpus. Una variante reparada solo con wikitext obtenía mejor perplejidad en wikitext pero regresaba un 86% en el holdout de FineWeb-EDU. Este modelo, con dieta mixta, evita ese espejismo y publica resultados en tres corpus no relacionados. No obstante, el propio autor lo describe como una curiosidad de investigación y no como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen3.5 text), 36 capas de decoder originales, 2 eliminadas por cirugía de profundidad; 8 capas de atención completa protegidas por patrón |
| Parametros totales | 4.100.503.168 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el checkpoint principal; GGUF con Q4_K_M disponible en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, formato HF); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido con 36 capas de decoder del que se eliminan las capas 24 y 28 mediante un ranking de importancia por similitud coseno entre vecinos. Las 8 capas de atención completa del diseño híbrido están protegidas por patrón y no se tocan; no se aplica cirugía de anchura. El bloque MTP (multi-token prediction) se restaura desde el checkpoint base, ya que los tensores de draft son anteriores al recorte; la aceptación en decodificación especulativa es aproximada, pero la corrección de la salida no se ve afectada porque los drafts siempre se verifican con el modelo principal.

La reparación consiste en un QLoRA con rango 16 sobre las proyecciones de atención y MLP, 1 época sobre 9,5 millones de tokens con la mezcla ya descrita (61% FineWeb-EDU, 27% wikitext-2 train, 12% código de llama.cpp y CPython stdlib). El entrenamiento se completó en aproximadamente 70 minutos en una sola GPU de consumo con 3,9 GiB de VRAM. La receta completa de reproducción (cirugía, recuperación y evaluación) está en el fichero recipe-mixfull.yaml del repositorio.

## Capacidades

- Generación de texto conversacional y continuaciones de texto en formato HF transformers (pipeline text-generation).
- Razonamiento de cadena de pensamiento, con la advertencia del autor de que los comportamientos de contexto largo (umbral de bucle frente a temperatura de muestreo) se desplazan respecto al modelo original y conviene usar temperaturas algo más bajas para fiabilidad en CoT.
- Generación de código (C/C++, Python) reforzada por el 12% de código en la dieta de reparación.
- Decodificación especulativa mediante el bloque MTP restaurado, con aceptación aproximada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre pruning estructural: sirve como caso reproducible de cirugía de profundidad más reparación con QLoRA, con receta completa en recipe-mixfull.yaml para replicar el pipeline en otros modelos.
- Estudio de especialización por corpus: permite comparar la variante de dieta mixta con la variante solo-wikitext (que regresaba un 86% en FineWeb-EDU) para ilustrar el efecto de la composición del dataset de reparación.
- Evaluación de decodificación especulativa tras modificar el modelo: el bloque MTP restaurado permite medir la degradación de aceptación de drafts cuando el modelo principal ha sido recortado.
- Prototipado en hardware limitado: con 4,1B parámetros y builds GGUF Q4_K_M, puede ejecutarse en GPU de consumo para experimentos de generación de texto sin pretensiones de producción.
- Docencia y divulgación: ejemplo práctico de qué se pierde y qué se recupera al eliminar capas de un transformer híbrido, con métricas de perplejidad en tres corpus no relacionados.
- Generación de código en entornos de prueba: el refuerzo con código C/C++ y Python lo hace utilizable para tareas exploratorias de completado de código, siempre con validación humana.

## Benchmarks y rendimiento

Perplejidad en f16 sobre tres corpus no relacionados (menor es mejor), según la model card:

| Corpus | Qwen3.5-4B original | Tras cirugía, sin reparar | Tras reparación (este modelo) |
|---|---|---|---|
| wikitext-2 (test) | 9,33 | 12,82 | 8,42 |
| FineWeb-EDU holdout | 10,44 | 13,55 | 12,39 |
| Código (C/C++/Python) | 3,17 | 3,57 | 3,36 |

No se han publicado resultados de benchmarks académicos (GSM8K, MMLU u otros) en la información disponible; el autor indica explícitamente que solo hay suelos de perplejidad y comprobaciones manuales por muestreo.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 8,2 GB de pesos, más overhead de activaciones y KV cache; en la práctica, más de 10 GB en GPU.
- VRAM para la reparación documentada: 3,9 GiB con QLoRA r=16 en una sola GPU de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, encaja en RTX 4090 (24 GB) en bf16 y en GPUs de 16 GB con cuantización.
- GPU de consumo: sí cabe; con GGUF Q4_K_M del repo hermano se reduce a unos 2,5-3 GB de pesos, apto para GPUs de 8 GB.
- Opciones de despliegue: transformers (formato nativo), llama.cpp u Ollama mediante los GGUF del repo dwilson2547/Qwen3.5-4B-drop2-mixed-repair-GGUF. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-4B-drop2-mixed-repair | 4,10B (94% del original) | no disponible | Apache-2.0 | Artefacto de investigación |
| Qwen/Qwen3.5-4B (base) | ~4,36B (implícito, 36 capas) | no disponible | Apache-2.0 | Modelo base de referencia |
| Variante wikitext-only del mismo autor | no disponible | no disponible | Apache-2.0 | Reparación con regresión del 86% en FineWeb-EDU |

No se dispone de datos de benchmarks académicos ni de modelos comparables de terceros en la información proporcionada para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La reparación es parcial en corpus diversos: según el autor, solo se cierra aproximadamente el 40% de la brecha de FineWeb-EDU respecto al modelo original.
- No hay métricas de benchmarks académicos; la evaluación se limita a perplejidad y comprobaciones manuales.
- Los comportamientos de contexto largo se desplazan respecto al modelo original; se recomienda bajar ligeramente la temperatura para fiabilidad en cadena de pensamiento.
- La perplejidad en wikitext supera (mejora) a la del modelo original, lo que indica una especialización leve derivada de esa porción de la dieta; no debe interpretarse como una mejora general.
- La aceptación de la decodificación especulativa es aproximada por la restauración del bloque MTP; la corrección de salida no se ve afectada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables los del modelo base.
- El autor lo califica explícitamente como no apto para producción.
- Licencia Apache-2.0 permite uso comercial, pero al ser un artefacto de investigación con reparación parcial no se recomienda su despliegue en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dwilson2547/Qwen3.5-4B-drop2-mixed-repair
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GGUF hermano: https://huggingface.co/dwilson2547/Qwen3.5-4B-drop2-mixed-repair-GGUF
- Dataset FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Código llama.cpp: https://github.com/ggml-org/llama.cpp
- Código CPython: https://github.com/python/cpython
