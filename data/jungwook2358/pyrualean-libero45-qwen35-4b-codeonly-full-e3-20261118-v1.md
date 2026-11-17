# jungwook2358/pyrualean-libero45-qwen35-4b-codeonly-full-e3-20261118-v1

## Resumen

El modelo `jungwook2358/pyrualean-libero45-qwen35-4b-codeonly-full-e3-20261118-v1` es un artefacto de inferencia publicado por el usuario jungwook2358 a partir de un ajuste fino supervisado (SFT) completado sobre la base Qwen/Qwen3.5-4B. Se trata de un modelo de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) empaquetado en formato safetensors, con un tamaño de repositorio de 9,1 GB. El nombre del modelo indica que el entrenamiento se realizó sobre el conjunto de datos LIBERO, con 45 rollouts y 205 ejemplos, etiquetas exclusivamente de código y tres épocas completas.

El modelo se presenta como un "full inference artifact", es decir, una exportación de los pesos finales tras el entrenamiento, no un checkpoint intermedio. La model card indica que los checkpoints completos de optimizador, scheduler y RNG se conservan en el servidor de origen, y que se incluyen archivos de procedencia (`training-completion-proof.json` e `inference-export-manifest.json`) con hashes SHA256. La arquitectura declarada es `qwen3_5`, lo que sugiere que hereda la familia Qwen3.5, aunque no se detallan innovaciones específicas de esta variante.

La relevancia de este modelo es limitada y muy específica: se trata de un ajuste fino pequeño sobre una base de 4B con un dataset reducido (205 ejemplos) y orientado a código, probablemente para tareas de manipulación robótica o agentes en entornos LIBERO. No hay descargas ni likes, y la licencia no está disponible, lo que limita su uso comercial sin consultar al autor. Es un artefacto de investigación reproducible más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag de Hugging Face) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `qwen3_5`, lo que indica que deriva de la familia Qwen3.5 de Alibaba. No se proporcionan detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención (si es atención completa, lineal o híbrida) ni sobre el tokenizador. El modelo base es `Qwen/Qwen3.5-4B` en el commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

El entrenamiento consistió en un ajuste fino supervisado (SFT) completo ("full") sobre el dataset LIBERO, con 45 rollouts y 205 ejemplos, etiquetas exclusivamente de código ("Code-only") y tres épocas. El formateador de entrenamiento usó `enable_thinking=False`, lo que sugiere que el modelo base tiene un modo de razonamiento ("thinking") que fue desactivado durante el ajuste. No se menciona RLHF, DPO ni otras técnicas de alineación adicionales. No hay información sobre el número total de tokens de entrenamiento ni sobre la composición del dataset más allá de los 205 ejemplos.

## Capacidades

- Generación de texto y código: el ajuste se realizó con etiquetas "code-only", por lo que se espera que el modelo esté especializado en generación de código, probablemente en el contexto de tareas LIBERO (manipulación robótica, agentes).
- Razonamiento multi-paso: no confirmado; el formateador desactivó `enable_thinking`, pero la evaluación nativa `native200` conserva la configuración de thinking por defecto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: el nombre "libero" sugiere entrenamiento para entornos de agente, pero no se detallan capacidades de agente.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible (no se mencionan visión, audio ni modo thinking activo en la exportación).

## Casos de uso

- Investigación en robótica con LIBERO: el modelo puede usarse para reproducir experimentos de ajuste fino sobre tareas de manipulación en el benchmark LIBERO, ya que fue entrenado con rollouts de ese entorno y etiquetas de código. Es adecuado para validar pipelines de SFT y comparar con otros ajustes.
- Generación de código para control de agentes: dado que las etiquetas son "code-only", el modelo puede emplearse para generar scripts de control o políticas en forma de código dentro de entornos simulados, aunque su tamaño reducido (4B) limita la complejidad.
- Prototipado de agentes multi-paso en entornos simulados: con 205 ejemplos de entrenamiento, puede servir como baseline para experimentos de imitación en tareas de manipulación, siempre que se valide su rendimiento en el entorno objetivo.
- Evaluación de técnicas de SFT: al incluir archivos de procedencia y hashes, es útil como artefacto reproducible para estudiar el efecto de tres épocas y 45 rollouts sobre un modelo base de 4B.
- Fine-tuning posterior: al estar en safetensors y ser un modelo completo, puede usarse como punto de partida para ajustes adicionales con más datos, aunque la licencia no disponible es un obstáculo para uso comercial.
- Docencia y experimentación con modelos pequeños: su tamaño (4,54B) permite ejecutarlo en GPUs de consumo con cuantización (aunque no se publican GGUF), lo que facilita experimentos académicos sobre ajuste fino y evaluación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 4,54B en safetensors (FP16/BF16), se necesitarían aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 4,5-5 GB, y en 4 bits unos 2,5-3 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3090, RTX 4090, RTX 4080 o superiores con suficiente VRAM, pero no hay datos oficiales.
- ¿Cabe en consumer GPU? Probablemente sí en FP16 en GPUs con 12-16 GB o más, y en cuantización en GPUs de 8 GB, pero no se confirma.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. Al ser safetensors con arquitectura `qwen3_5`, podría requerir una versión de transformers que soporte Qwen3.5; no hay GGUF publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pyrualean-libero45-qwen35-4b-codeonly-full-e3-20261118-v1 | 4,54 B | no disponible | no disponible | safetensors | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | no disponible | no disponible | safetensors | Hugging Face (modelo base referenciado) |
| Otros ajustes LIBERO sobre Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a parámetros y disponibilidad. El modelo base Qwen3.5-4B es la alternativa directa, pero no se detallan sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un ajuste sobre Qwen3.5, hereda los sesgos del modelo base, pero no se documentan.
- Riesgo de alucinación: no evaluado; con solo 205 ejemplos de entrenamiento, el riesgo de sobreajuste y de generar código incorrecto es alto.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; el entrenamiento fue code-only, lo que puede degradar capacidades de lenguaje natural.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial sin permiso explícito del autor.
- Caveat para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin benchmarks publicados; no se recomienda su uso en producción sin una evaluación exhaustiva. El tamaño del repo (9,1 GB) sugiere pesos en FP16/BF16, pero no se confirma. La fecha de creación (2026-11-17) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un entorno de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/pyrualean-libero45-qwen35-4b-codeonly-full-e3-20261118-v1
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-4B (commit `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Archivos de procedencia mencionados en la model card: `training-completion-proof.json` e `inference-export-manifest.json` (disponibles en el repositorio del modelo)
