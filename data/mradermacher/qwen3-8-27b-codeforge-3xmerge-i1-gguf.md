# mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF

## Resumen

Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B-CodeForge-3xMerge, publicada por el usuario mradermacher. Se trata de un merge de tres variantes del modelo Qwen3.8-27B, orientado a tareas de código y conversación, del que no se dispone de model card detallada más allá de los metadatos de cuantización. El repositorio contiene únicamente los pesos cuantizados, sin información sobre el proceso de entrenamiento, la composición del dataset ni los resultados de evaluación.

El modelo base tiene 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. La cuantización se ha realizado con el método i1 (imatrix) de mradermacher, que emplea una matriz de importancia para preservar las activaciones más relevantes durante la compresión. El repositorio ocupa 39,5 GB e incluye múltiples niveles de cuantización, desde IQ1_S hasta Q6_K, lo que permite desplegarlo en distintos rangos de hardware.

La relevancia de esta ficha es limitada por la ausencia de documentación técnica: no se especifican licencia, idiomas, arquitectura ni benchmarks. El modelo parece orientado a generación de código y conversación, pero cualquier evaluación rigurosa requeriría consultar el modelo original en xtools-at/Qwen3.8-27B-CodeForge-3xMerge, del cual este repositorio es una derivación cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, con variantes i1/imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre sugiere que se trata de un merge de tres modelos derivados de Qwen3.8-27B, probablemente mediante técnicas de model merging (como SLERP, TIES o DARE), orientado a tareas de código ("CodeForge"). Sin embargo, no se documenta el método de merge, los datos de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO.

La única información técnica disponible es el proceso de cuantización: se han generado cuantizaciones GGUF con el método i1 de mradermacher, que utiliza una matriz de importancia (imatrix) calculada sobre un corpus de calibración para minimizar la pérdida de calidad en los pesos comprimidos. El repositorio incluye 24 variantes de cuantización, desde IQ1_S (la más agresiva) hasta Q6_K (la de mayor precisión). No se especifica el corpus de calibración ni los parámetros exactos del proceso.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está ajustado para diálogo multi-turno.
- Generación de código: el nombre "CodeForge" sugiere especialización en tareas de programación, aunque no se detallan lenguajes ni benchmarks.
- Razonamiento y matemáticas: no confirmado por falta de documentación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente de programación en local: el modelo puede desplegarse con llama.cpp u Ollama en equipos con GPU consumer, gracias a las cuantizaciones Q4_K_M o IQ4_XS, que reducen el peso a unos 16-17 GB y permiten generar código en entornos sin conexión.
- Generación de código en pipelines de CI/CD: las cuantizaciones Q5_K_M y Q6_K ofrecen mayor fidelidad para tareas de autocompletado y revisión de código en servidores con GPU de 24 GB o más.
- Chat conversacional multi-turno: el tag "conversational" sugiere uso en asistentes de atención al cliente o soporte técnico, aunque la ausencia de datos sobre contexto limita la planificación.
- Prototipado rápido en estaciones de trabajo: las variantes IQ2_M e IQ3_M permiten ejecutar el modelo en GPUs de 8-12 GB, útiles para pruebas de concepto y experimentación.
- Fine-tuning posterior sobre GGUF: no es el formato ideal, pero las cuantizaciones Q6_K pueden servir como base para evaluación comparativa antes de un ajuste fino en precisión completa.
- Investigación sobre cuantización: el repositorio ofrece 24 variantes del mismo modelo, lo que permite estudiar el impacto de la compresión en la calidad de salida para tareas de código y conversación.
- Despliegue en entornos con restricciones de memoria: las variantes IQ1_S e IQ2_XXS, aunque con pérdida de calidad significativa, permiten ejecutar un modelo de 27B en hardware muy limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ1_S / IQ2_XXS: aproximadamente 7-9 GB.
  - IQ2_M / Q2_K: aproximadamente 9-11 GB.
  - IQ3_M / Q3_K_M: aproximadamente 12-14 GB.
  - IQ4_XS / Q4_K_M: aproximadamente 15-17 GB.
  - Q5_K_M: aproximadamente 18-20 GB.
  - Q6_K: aproximadamente 22-24 GB.
- GPU recomendadas:
  - Q6_K: RTX 3090/4090 (24 GB), A5000, A6000, L40S.
  - Q4_K_M / IQ4_XS: RTX 4080/4090, RTX 3090, A10G (24 GB).
  - IQ3_M / Q3_K_M: RTX 4070 Ti, RTX 3080 (12-16 GB).
  - IQ2_M / Q2_K: RTX 3060 12 GB, RTX 4060 Ti 16 GB.
  - IQ1_S: GTX 1660 Super 6 GB, RTX 3050 8 GB (con degradación notable).
- Cabe en GPU consumer: sí, en todas las variantes desde IQ2_M en adelante; las variantes Q5_K_M y Q6_K requieren GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para producción con este formato.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida de la GPU, la cuantización y el backend; en una RTX 4090 con Q4_K_M se puede esperar un throughput del orden de decenas de tokens por segundo, pero no se ha medido en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF (este) | 27,3 B | no disponible | no disponible | GGUF | HuggingFace (mradermacher) |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | 128K (según model card oficial) | Apache 2.0 | safetensors, GGUF | HuggingFace (Qwen) |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (MoE, 2,4 B activos) | 128K | DeepSeek License | safetensors, GGUF | HuggingFace (deepseek-ai) |
| CodeLlama-34B-Instruct | 33,7 B | 16K | Llama 2 Community License | safetensors, GGUF | HuggingFace (meta-llama) |

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. El modelo base Qwen3.8-27B no está identificado con una versión oficial de Qwen, lo que impide confirmar su procedencia y licencia.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan licencia, idiomas, arquitectura, datos de entrenamiento ni evaluación, lo que impide garantizar su uso comercial o su idoneidad para producción.
- Licencia no disponible: no se puede asumir permiso de uso comercial; es imprescindible contactar con el autor del modelo base antes de desplegarlo.
- Riesgo de alucinación: sin benchmarks ni evaluación, no se puede estimar la fiabilidad del modelo en tareas factuales o de código.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos de género, raza, idioma o dominio.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto ni los idiomas soportados; el tag "conversational" no garantiza un rendimiento multilingüe.
- Cuantizaciones agresivas: las variantes IQ1_S, IQ2_XXS e IQ2_S pueden degradar notablemente la calidad en tareas de código y razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Modelo derivado sin trazabilidad: el merge de tres variantes de Qwen3.8-27B no está documentado, lo que dificulta la reproducibilidad y la auditoría.
- Fecha de creación futura (2026-11-05): el repositorio indica una fecha posterior a la actual, lo que puede indicar un error de metadatos o una publicación programada; conviene verificar la integridad del repositorio.
- Sin soporte de vLLM/TGI nativo para GGUF: el despliegue en producción con estos backends requiere conversión a safetensors o el uso de llama.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-CodeForge-3xMerge-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
