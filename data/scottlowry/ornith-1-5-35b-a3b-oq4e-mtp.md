# scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ4e-mtp es una cuantización mixta de 4 bits del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, identificado en los tags del repositorio con la arquitectura `qwen3_5_moe`, lo que sugiere una familia derivada de Qwen 3.5. La cuantización se ha realizado con la herramienta oQ de oMLX (versión v0.7.4.dev1) y está empaquetada en formato MLX, orientada a inferencia en hardware Apple Silicon.

El interés de esta ficha radica en que ofrece una versión comprimida del checkpoint completo (pesos del modelo de lenguaje, torre de visión y cabeza MTP) en 20,614 GiB de almacenamiento, con un promedio efectivo de 4,925 bits por peso. Esto permite ejecutar un modelo de casi 36.000 millones de parámetros en equipos con memoria unificada limitada, algo inviable con los pesos en BF16. La cabeza MTP (multi-token prediction) se conserva explícitamente, lo que habilita decodificación especulativa en el runtime MLX.

La información pública disponible es escasa: no se detallan licencia, idiomas soportados, pipeline ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y de la model card del cuantizador, señalando de forma explícita los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`); incluye torre de visión y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit group 64, affine 8-bit group 128, affine 8-bit group 64 y BF16 (promedio efectivo 4,925 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |
| Tamano del repo | 22,1 GB (20,614 GiB de pesos) |
| Componentes | LM: 34,661B (19,313 GiB); vision: 0,447B (0,832 GiB); MTP head: 0,845B (0,468 GiB) |
| Libreria | mlx |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Descargas / likes | 1.104 / 11 |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture of Experts, etiquetado con el identificador `qwen3_5_moe`, lo que apunta a la familia Qwen 3.5 MoE. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (34,661B parámetros lógicos), una torre de visión (0,447B) que confirma capacidades multimodales de entrada de imagen, y una cabeza MTP (0,845B) para predicción multi-token, empleada habitualmente en decodificación especulativa para acelerar la generación.

La cuantización aplicada por scottlowry es de precisión mixta mediante oQ (oMLX v0.7.4.dev1). La distribución de bits es la siguiente: el 91,838% de los pesos lógicos (33,018B) se almacena en affine 4-bit con grupo 64 (4,50 bits/peso efectivos); el 6,474% (2,328B) en affine 8-bit grupo 64 (8,50 bits/peso); el 0,359% (0,129B) en affine 8-bit grupo 128 (8,25 bits/peso); y el 1,329% (0,478B) se mantiene en BF16 (16 bits/peso). Esta asignación selectiva preserva en mayor precisión las capas sensibles (típicamente embeddings, normas o expertos críticos) mientras comprime agresivamente el grueso de la matriz de pesos. No se dispone de información sobre el dataset de entrenamiento del modelo base, número de tokens, composición ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LM de gran escala con arquitectura MoE, orientado a tareas de comprensión y generación.
- Procesamiento de visión: el checkpoint incluye una torre de visión de 0,447B parámetros, lo que habilita entrada de imágenes (descripción, VQA, OCR y tareas multimodales).
- Predicción multi-token (MTP): la cabeza MTP de 0,845B permite decodificación especulativa, reduciendo la latencia de generación en runtimes que la soportan (MLX).
- Capacidades multilingües: no confirmadas en la información disponible; el modelo base no declara lista de idiomas en este repositorio.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; plausible por la familia del modelo base, pero sin datos verificables.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 20,614 GiB de pesos en formato MLX, el modelo puede cargarse en equipos Apple Silicon de 32 GB o más, permitiendo ejecutar un MoE de ~36B parámetros sin GPU dedicada. Adecuado para desarrolladores que trabajan en portátiles o estaciones Mac Studio.
- Asistentes de código en local: el modelo base, por su familia (Qwen 3.5 MoE), está orientado a generación de código; la cuantización 4-bit permite integrarlo en editores o CLIs sin depender de la nube, con la ventaja de privacidad del código.
- Procesamiento de documentos con imágenes: la torre de visión incluida permite extraer información de capturas, formularios o PDFs renderizados, combinando OCR visual con razonamiento textual en un único modelo.
- Generación acelerada con decodificación especulativa: la cabeza MTP conservada permite usar draft heads en MLX para reducir la latencia por token, útil en aplicaciones interactivas (chat, autocompletado) donde el tiempo de respuesta es crítico.
- Prototipado de agentes multimodales: al disponer de visión y LM en un solo checkpoint, se pueden construir pipelines que reciban imágenes y texto y emitan acciones o texto, sin orquestar dos modelos separados.
- Evaluación y ajuste fino ligero: el tamaño comprimido (22,1 GB) facilita descargar y probar el modelo en entornos de investigación con recursos limitados, así como comparar la degradación de la cuantización mixta frente al BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 20,614 GiB; con overhead de runtime MLX (KV cache, buffers) se recomienda un mínimo de 24 GB y, para contexto largo, 32 GB o más.
- GPU recomendadas: hardware Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con memoria unificada de 32 GB o superior. El formato MLX no está pensado para GPUs NVIDIA; para estas sería necesario reconvertir a GGUF u otro formato.
- ¿Cabe en consumer GPU? En el ecosistema Apple, sí: Mac con 32 GB o más. En GPUs NVIDIA consumer (RTX 4090, 24 GB), el margen es muy ajustado y requeriría cuantización adicional o descarga parcial de capas.
- Opciones de despliegue: runtime MLX (mlx-lm) con soporte de oQ; la cabeza MTP requiere un runtime que implemente decodificación especulativa. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-oQ4e-mtp (este) | 35,952B (MoE) | no disponible | MLX safetensors, 4,925 bits/peso | no disponible | Incluye visión y MTP; 20,614 GiB |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,952B (MoE) | no disponible | safetensors BF16 | no disponible | Referencia sin cuantizar; mayor huella de memoria |
| Alternativas de la misma familia Qwen 3.5 MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, cuantizaciones GGUF del mismo modelo base) sin inventar datos.

## Limitaciones y advertencias

- Licencia no declarada: no es posible confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base (ornith-ai/Ornith-1.5-35B-A3B) antes de desplegarlo en producción.
- Cuantización de 4 bits: aunque es mixta y preserva ciertas capas en 8 bits y BF16, existe degradación esperable en tareas sensibles a precisión (matemáticas, código complejo, razonamiento de varios pasos) frente al BF16 original.
- Exclusivo de MLX: los pesos están empaquetados para el runtime MLX de Apple; no son directamente utilizables en vLLM, TGI o llama.cpp sin conversión.
- Idiomas no confirmados: no hay lista oficial de idiomas soportados en este repositorio; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay datos publicados de evaluaciones de factualidad.
- Contexto desconocido: la longitud de contexto no se declara, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Sesgos: no se han publicado análisis de sesgos del modelo base ni de la cuantización.
- Actualización del checkpoint: la model card indica una recuantización el 2026-11-11; versiones anteriores descargadas pueden diferir en calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
