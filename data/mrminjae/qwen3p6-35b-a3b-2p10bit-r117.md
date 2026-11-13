# mrminjae/qwen3p6-35b-a3b-2p10bit-r117

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r117` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) publicado por el equipo Qwen (Alibaba). Se trata de una cuantización selectiva: únicamente los expertos enrutados se almacenan a una media de 2,10 bits por peso, mientras que el resto de parámetros (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya dequantizados en tensores BF16, por lo que el modelo carga con `transformers` y vLLM estándar sin kernels especiales.

El modelo resuelve un problema práctico de despliegue: reducir de forma agresiva la huella de memoria de los expertos MoE, que concentran la mayor parte de los parámetros, conservando la precisión de los componentes críticos en BF16. Al no requerir librerías de cuantización en tiempo de ejecución, simplifica la integración en pipelines existentes. Es relevante para equipos que quieren servir un MoE de 35B en hardware más modesto sin renunciar al formato estándar de Hugging Face.

La información publicada por el autor es mínima: no hay model card detallada, ni datos de entrenamiento, ni benchmarks, ni licencia explícita más allá de la remisión a la licencia del modelo base. Esta ficha refleja únicamente lo verificable en la información disponible e indica explícitamente los datos ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer; derivada de Qwen3.6-35B-A3B (detalle interno no disponible) |
| Parametros totales | 35B (según el nombre del modelo base; desglose exacto no disponible) |
| Parametros activos | A3B indica aproximadamente 3B activos por token (dato inferido del nombre; confirmación oficial no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; almacenamiento dequantizado en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | Sigue la licencia del modelo base Qwen/Qwen3.6-35B-A3B; licencia concreta no disponible en la información proporcionada |
| Formato de pesos | Tensores BF16 compatibles con `transformers` y vLLM (no se indica safetensors explícitamente) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.6-35B-A3B`, un transformer con capas Mixture of Experts en el que solo una fracción de los expertos se activa por token (la nomenclatura A3B sugiere unos 3B de parámetros activos sobre 35B totales). La modificación introducida por el autor consiste en aplicar una cuantización post-entrenamiento de precisión mixta: los pesos de los expertos enrutados se comprimen a una media de 2,10 bits y se almacenan dequantizados en BF16, mientras que atención, router, embeddings y demás componentes se mantienen en BF16 sin modificar. El identificador interno es r117.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), ni sobre la metodología exacta de cuantización empleada (algoritmo, calibración, granularidad por grupo). Tampoco se documenta si se realizó evaluación de degradación de calidad tras la compresión. El autor describe el checkpoint como "internal research checkpoint", lo que sugiere que no ha pasado por un proceso de validación público.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones específicas tras la cuantización.
- Capacidad MoE con activación dispersa: solo se computan los expertos enrutados por token, lo que reduce el coste de inferencia respecto a un modelo denso de 35B.
- Compatibilidad con `transformers` y vLLM: los pesos cargan sin kernels de cuantización personalizados.
- Tool calling / function calling: no confirmado en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Servicio de inferencia con memoria reducida: al comprimir los expertos a 2,10 bits y mantener el resto en BF16, el checkpoint permite desplegar un MoE de 35B en GPUs con menos VRAM que la versión completa, usando vLLM estándar.
- Investigación sobre cuantización extrema de MoE: sirve como punto de comparación para estudiar la degradación de calidad a 2 bits en expertos enrutados frente a otras estrategias de compresión.
- Prototipado rápido en entornos de investigación: al cargar con `transformers` sin dependencias adicionales, facilita experimentos de evaluación y ablación.
- Despliegue en pipelines existentes compatibles con Hugging Face: la etiqueta `endpoints_compatible` indica que puede servirse en infraestructura tipo Inference Endpoints sin cambios de formato.
- Evaluación comparativa de checkpoints: útil para medir el impacto de la cuantización selectiva frente al modelo base en tareas de generación de texto.
- Base para fine-tuning ligero: al estar en BF16 dequantizado, puede servir de punto de partida para ajustes posteriores, aunque no se documenta soporte oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad que permitan medir la degradación respecto al modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dado que los pesos se almacenan dequantizados en BF16, el checkpoint ocupa aproximadamente el mismo espacio que un modelo de 35B en BF16 (del orden de 70 GB), aunque el autor no confirma el tamaño real del repositorio.
- GPU recomendadas: no disponibles. Por tamaño, un modelo de 35B en BF16 requiere GPUs de 80 GB (A100, H100) o sharding multi-GPU.
- Cabe en consumer GPU: no disponible; previsiblemente no en una sola GPU de consumo con los pesos almacenados en BF16.
- Opciones de despliegue: `transformers` y vLLM, según indica el autor. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r117 | 35B (MoE, ~3B activos) | no disponible | Expertos a 2,10 bits, resto BF16 | Sigue la del base | Hugging Face |
| Qwen/Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | BF16 original | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otras alternativas de terceros (por ejemplo, otros MoE de tamaño similar) sin inventar datos.

## Limitaciones y advertencias

- Cuantización extrema a 2,10 bits en los expertos: es probable una pérdida de calidad frente al modelo base, pero no se documenta ninguna evaluación que la cuantifique.
- Checkpoint de investigación interno: el propio autor lo etiqueta como "internal research checkpoint", sin validación pública ni benchmarks.
- Licencia: la licencia concreta no está indicada; se remite a la del modelo base, cuyo texto no se incluye en la información proporcionada. Verificar antes de cualquier uso comercial.
- Idiomas: no se documenta el soporte multilingüe real de este checkpoint.
- Contexto: se desconoce la longitud de contexto efectiva tras la cuantización.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Formato de pesos dequantizado en BF16: el ahorro de memoria en disco puede no materializarse si el repositorio almacena los tensores en BF16; conviene verificar el tamaño real antes de planificar el despliegue.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r117
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
