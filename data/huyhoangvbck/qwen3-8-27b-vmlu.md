# huyhoangvbck/Qwen3.8-27B-VMLU

## Resumen

Qwen3.8-27B-VMLU es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.8-27B, publicado por el usuario huyhoangvbck en HuggingFace. El modelo se ha entrenado con Megatron-SWIFT mediante LoRA sobre el conjunto de evaluación VMLU, un benchmark de comprensión del lenguaje en vietnamita compuesto por 8.195 preguntas de opción múltiple repartidas en 58 asignaturas. Posteriormente, los adaptadores LoRA se han fusionado (merged) en los pesos originales, por lo que el repositorio contiene un modelo denso completo de 26.895.998.464 parámetros (~26,9 B) en formato safetensors de precisión bf16, con un tamaño de repositorio de 53,8 GB.

El objetivo declarado es especializar el modelo base en la resolución de preguntas tipo test en vietnamita, abarcando áreas STEM, ciencias sociales, humanidades y otras. La model card documenta el proceso de entrenamiento (4x NVIDIA A100-40GB, TP=2, PP=1, SP=True, DP=2, LR 2e-5, LoRA rank 16 y alpha 16, dropout 0.05, módulos objetivo de atención y MLP) y proporciona un ejemplo de uso con `transformers` en el que el modo de razonamiento se desactiva mediante `enable_thinking=False`.

Su relevancia práctica es doble: por un lado, ofrece a la comunidad vietnamita un modelo afinado específicamente para VMLU; por otro, sirve como referencia reproducible de un flujo de entrenamiento LoRA con Megatron-SWIFT sobre hardware de gama alta. No obstante, el repositorio no incluye resultados de benchmarks, no publica pesos cuantizados y acumula cero descargas y cero valoraciones, por lo que debe considerarse un artefacto experimental sin validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen; etiqueta `qwen3_5_text`). Detalles de capas, atención o activaciones no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo se publican pesos bf16. No hay versiones GGUF, AWQ, GPTQ ni bitsandbytes publicadas; cualquier cuantización requeriría conversión propia |
| Idiomas soportados | Vietnamita (`vi`) declarado en la model card. Capacidades multilingües del modelo base no confirmadas |
| Licencia | `other` (licencia no estándar; se heredan presumiblemente los términos del modelo base, que no se detallan) |
| Formato de pesos | safetensors (bf16, repositorio de 53,8 GB) |
| Modelo base | Qwen/Qwen3.8-27B (`base_model:finetune`) |
| Metodo de ajuste | LoRA SFT con Megatron-SWIFT, adaptadores fusionados en los pesos base |
| Dataset de ajuste | VMLU: 8.195 preguntas, 58 asignaturas |
| Fecha de creacion (metadatos) | 2026-09-10 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer denso de ~26,9 B de parámetros etiquetado como `qwen3_5_text` en los metadatos del repositorio. No se proporciona información sobre el número de capas, la dimensión oculta, el tipo de atención, la presencia de atención lineal o híbrida, ni el tamaño de la ventana de contexto original. Tampoco se documenta el volumen de tokens con el que se preentrenó el modelo base ni la composición de su dataset.

El ajuste se realizó con Megatron-SWIFT aplicando LoRA SFT con rango 16, alpha 16 (escala 1.0) y dropout 0.05 sobre los módulos de auto-atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de MLP (`gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó sobre 4 GPU NVIDIA A100 de 40 GB con paralelismo de tensor TP=2, paralelismo de pipeline PP=1, paralelismo de secuencia SP=True y paralelismo de datos DP=2. Se usó una tasa de aprendizaje de 2e-5 con mínimo de 2e-6, planificador coseno y warmup de 0.05. El corpus de entrenamiento consiste exclusivamente en las 8.195 muestras de VMLU. Tras el entrenamiento, los adaptadores se fusionaron íntegramente en los pesos originales, de modo que el repositorio no contiene adaptadores separados. No se documenta ningún uso de RLHF, DPO u otra fase de alineación adicional, ni innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en vietnamita, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas de opción múltiple: el modelo está especializado en seleccionar una única opción correcta (A, B, C o D) para preguntas del formato VMLU.
- Cobertura temática amplia en el dominio evaluado: STEM, ciencias sociales, humanidades y otras categorías de las 58 asignaturas de VMLU.
- Modo de razonamiento controlable: la plantilla de chat admite `enable_thinking=False` para forzar respuestas directas sin cadena de pensamiento explícita, lo que reduce el consumo de tokens de salida en tareas de clasificación.
- Integración estándar con el ecosistema HuggingFace: `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`, generación codiciosa (`do_sample=False`) recomendada en el ejemplo del autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del modo de pensamiento del modelo base.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta oficialmente soporte multilingüe más allá del vietnamita.

## Casos de uso

- Evaluación comparativa en vietnamita: usar el modelo como sujeto de prueba en VMLU y en otros conjuntos de opción múltiple en vietnamita, aprovechando el formato de pregunta-respuesta de cuatro opciones para el que fue ajustado, y midiendo la precisión por asignatura.
- Plataforma de preparación de exámenes: integrar el modelo en una aplicación de estudio que presente preguntas tipo test de 58 asignaturas, genere la respuesta razonada y explique por qué las opciones descartadas son incorrectas.
- Generación de bancos de preguntas: producir ítems de opción múltiple en vietnamita con distractores plausibles para alimentar plataformas educativas, verificando posteriormente cada ítem con revisión humana.
- Tutoría conversacional en vietnamita: asistente de apoyo académico que resuelve dudas de nivel preuniversitario o universitario en las materias cubiertas por VMLU, con la ventana de contexto que ofrezca el modelo base (no documentada).
- Investigación en ajuste eficiente: servir como caso de estudio reproducible de un pipeline LoRA SFT con Megatron-SWIFT sobre 4x A100-40GB, útil para replicar la receta en otros dominios o idiomas con presupuestos de cómputo similares.
- Filtrado y clasificación de contenido educativo: usar el modelo para etiquetar materiales de estudio en vietnamita por asignatura o para validar automáticamente respuestas en plataformas de ejercicios, dado su formato de salida restringido a una opción.
- Base para especializaciones posteriores: al estar los pesos completos disponibles y ser un modelo denso de ~26,9 B, puede emplearse como punto de partida para nuevos ajustes LoRA en vietnamita (por ejemplo, derecho, medicina o administración pública) sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de precisión sobre VMLU ni sobre ningún otro conjunto de evaluación, pese a que el ajuste se realizó sobre ese benchmark. Tampoco se han encontrado datos de rendimiento en la búsqueda web realizada.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del recuento de parámetros (26,9 B) y no cifras publicadas por el autor:

- Inferencia en bf16/fp16: los pesos ocupan aproximadamente 53,8 GB. Requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB, H200) o dos GPU de 40-48 GB con paralelismo de tensor (2x A100 40GB, 2x L40S 48GB). Con caché KV para contexto largo, el consumo real superará los 54 GB.
- Inferencia en int8: aproximadamente 27 GB de pesos, factible en una A100 40GB, L40S 48GB, RTX 6000 Ada 48GB o en dos GPU de 24 GB con paralelismo de tensor.
- Inferencia en int4: aproximadamente 14-15 GB de pesos; cabe en una única GPU de consumo como RTX 4090 o RTX 3090 de 24 GB, con margen limitado para caché KV en contextos largos. En GPU de 16 GB (RTX 4080, RTX 4070 Ti Super) el encaje es muy ajustado y depende del contexto.
- Entrenamiento o ajuste fino: el autor empleó 4x NVIDIA A100-40GB para el LoRA SFT, configuración de referencia mínima razonable para reproducir el pipeline.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (método documentado por el autor), vLLM, TGI o SGLang (compatibles en principio con pesos safetensors de arquitectura Qwen, aunque no verificados con este checkpoint). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base Qwen/Qwen3.8-27B (arquitectura, contexto, licencia concreta o rendimiento), lo que limita cualquier comparación rigurosa. La tabla siguiente contrasta los datos disponibles de este modelo con alternativas de tamaño comparable ampliamente documentadas. Las cifras de las alternativas proceden de sus fichas públicas; la fila de Qwen3.8-27B-VMLU refleja únicamente lo publicado en su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B-VMLU | ~26,9 B | No disponible | `other` | HuggingFace, pesos safetensors bf16, 0 descargas |
| Qwen2.5-32B-Instruct | ~32,5 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | HuggingFace, amplio ecosistema de cuantizaciones |
| Gemma-2-27B | 27 B | 8.192 tokens | Licencia Gemma (uso comercial con condiciones) | HuggingFace, versiones GGUF y cuantizadas de terceros |
| Yi-1.5-34B | 34 B | 32.768 tokens | Apache 2.0 | HuggingFace, cuantizaciones de la comunidad |

Diferencias relevantes: frente a estas alternativas, Qwen3.8-27B-VMLU es el único de la comparativa especializado en vietnamita y en formato de opción múltiple, pero también el único sin resultados de benchmarks publicados, sin cuantizaciones oficiales y con una licencia no estándar.

## Limitaciones y advertencias

- Sobreajuste al formato: el ajuste se ha hecho con 8.195 muestras de opción múltiple, todas del mismo estilo de pregunta. Es esperable que el modelo rinda peor en generación libre, redacción o diálogo abierto en vietnamita, e incluso que fuerce respuestas con formato A/B/C/D cuando no se le pide.
- Riesgo de alucinación: al ser un modelo de 26,9 B sin fase de alineación documentada (no se menciona RLHF ni DPO), puede generar justificaciones plausibles pero incorrectas, especialmente fuera de las 58 asignaturas de VMLU.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad. El corpus VMLU es un benchmark académico, no un conjunto diverso de conversaciones reales, lo que puede introducir sesgos de registro y de dominio.
- Idiomas: solo se declara vietnamita. El comportamiento en castellano, inglés u otros idiomas no está documentado y no debería asumirse a partir del modelo base.
- Contexto: la longitud de contexto no está publicada, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- Licencia: la licencia `other` no especifica condiciones de uso comercial. Antes de cualquier despliegue en producción es imprescindible revisar los términos del modelo base Qwen/Qwen3.8-27B, de los que este derivado presumiblemente hereda las restricciones.
- Ausencia de validación: cero descargas y cero valoraciones en el momento de redactar esta ficha. No hay evaluación independiente, ni informes de terceros, ni métricas publicadas por el autor.
- `trust_remote_code=True`: el ejemplo de uso exige ejecutar código remoto del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de cargar el modelo en entornos de producción.
- Fecha de creación inusual: los metadatos indican 2026-09-10, dato que conviene verificar por si se trata de un error de registro.
- Metadatos de la búsqueda web: las consultas realizadas no devolvieron resultados relacionados con el modelo; los enlaces obtenidos correspondían a un servicio administrativo sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huyhoangvbck/Qwen3.8-27B-VMLU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Megatron-SWIFT (framework de entrenamiento citado por el autor): https://github.com/modelscope/ms-swift
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo. La model card no incluye enlace al conjunto de datos VMLU ni a ninguna publicación asociada.
