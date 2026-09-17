# roskosmos19/Sea-4B-Agentic

## Resumen

Sea-4B-Agentic es un ajuste fino (finetune) publicado por el usuario roskosmos19 sobre Qwen/Qwen3.5-4B-Base, un modelo causal multimodal de 4B parámetros con codificador de visión de la familia Qwen3.5. El repositorio contiene únicamente pesos en formato safetensors (9,3 GB, aproximadamente bf16) y la configuración de Transformers, con licencia Apache 2.0 y pipeline declarado `image-text-to-text`. Según los metadatos, el tensor total de parámetros es de 4.659.865.088 (unos 4,66B), coherente con la cifra de 4B que declara la familia.

El nombre "Agentic" sugiere un ajuste orientado a uso agéntico, pero el autor no documenta el proceso de entrenamiento (datos, número de tokens, método de alineación, hiperparámetros) ni publica benchmarks propios del finetune. La model card del repositorio es una copia de la model card oficial de Qwen3.5-4B: describe el modelo base y sus resultados, no las modificaciones introducidas por este ajuste. Cualquier dato de arquitectura recogido aquí debe interpretarse, por tanto, como características heredadas del modelo base.

Su relevancia actual es limitada pero interesante como caso de estudio: se trata de un finetune muy reciente (creado el 17 de septiembre de 2026 según los metadatos), con 0 descargas y 1 like en el momento de la consulta, y con la peculiaridad de apoyarse en una arquitectura híbrida inusual (Gated DeltaNet + atención con compuertas) con 262.144 tokens de contexto nativo, algo poco habitual en modelos de menos de 5B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: Gated DeltaNet (atención lineal) + Gated Attention, según la model card del modelo base |
| Parámetros totales | 4.659.865.088 (≈4,66B) según safetensors; la model card declara 4B |
| Parámetros activos | No aplicable / no disponible: la model card del 4B no especifica configuración de expertos (la mención a MoE disperso aparece solo como característica genérica de la familia) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens (model card del base) |
| Tipos de cuantización | No disponible: el repositorio solo incluye safetensors (≈bf16). No se documentan GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | No disponible para este finetune. La familia Qwen3.5 declara cobertura de 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 9,3 GB) |
| Librería | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B-Base |
| Dimensión oculta | 2.560 |
| Número de capas | 32 (8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Dimensión intermedia FFN | 9.216 |
| Embedding de tokens | 248.320 (con padding), atado a la salida LM |
| MTP | Entrenado con multi-steps (multi-token prediction) |

## Arquitectura y entrenamiento

La arquitectura documentada corresponde al modelo base Qwen3.5-4B: un transformer causal con codificador de visión y fusión temprana de tokens multimodales. El bloque se repite 8 veces con un patrón de 4 capas: tres sub-bloques de Gated DeltaNet (atención lineal, 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un sub-bloque de Gated Attention (16 cabezas para Q, 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64), cada uno con su FFN de dimensión intermedia 9.216. Es decir, solo 8 de las 32 capas usan atención clásica; las 24 restantes usan atención lineal con estado recurrente de tamaño constante. El modelo incorpora además predicción multi-token (MTP) entrenada con varios pasos. La familia declara entrenamiento RL a gran escala sobre entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro, aunque estos datos corresponden a los modelos Qwen3.5 oficiales, no a este finetune concreto.

No hay información disponible sobre el entrenamiento de Sea-4B-Agentic: se desconoce el dataset utilizado, el número de tokens de ajuste, si se empleó SFT, DPO, RLHF u otro método, y si se preservaron las capacidades multimodales del base. La model card no contiene ninguna sección específica del finetune, por lo que no es posible verificar qué se modificó respecto a Qwen3.5-4B-Base ni qué justifica la etiqueta "Agentic".

## Capacidades

Las siguientes capacidades se deducen de la arquitectura y la documentación del modelo base; no están verificadas para este finetune en concreto:

- Generación de texto y razonamiento en lenguaje natural, con modo de pensamiento extenso según la familia Qwen3.5.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`, codificador de visión con fusión temprana).
- Razonamiento matemático y tareas STEM, según los benchmarks del base (MMLU-Pro 79,1).
- Generación y comprensión de código, con paridad declarada frente a Qwen3 en benchmarks de codificación.
- Contexto muy largo: 262.144 tokens nativos, ampliables a 1.010.000.
- Capacidades multilingües: la familia declara 201 idiomas y dialectos; no confirmado para este ajuste.
- Uso agéntico y tool calling: la familia Qwen3.5 declara soporte de agentes y entornos multiagente; el nombre del modelo sugiere especialización en este eje, pero no hay documentación que lo confirme.
- Predicción multi-token (MTP), útil para decodificación especulativa y aceleración de inferencia.
- Compatibilidad declarada con Transformers, vLLM, SGLang y KTransformers (heredada de la model card del base).
- No se documenta soporte de audio ni de otras modalidades distintas de imagen y texto.

## Casos de uso

- Automatización de agentes con herramientas: el modelo puede integrarse en bucles de razonamiento multi-paso con function calling, encadenando llamadas a APIs externas gracias a su ventana de 262.144 tokens, que permite mantener en contexto el historial completo de una sesión agéntica larga.
- Análisis de documentos extensos con imágenes: informes anuales, artículos científicos o expedientes con gráficos y tablas pueden procesarse en una sola pasada sin troceado agresivo, combinando OCR implícito y razonamiento sobre el texto.
- Asistencia técnica sobre bases de código: con contexto largo se puede cargar un repositorio mediano completo y responder preguntas de arquitectura, generar parches o revisar cambios, apoyándose en las capacidades de código del base.
- Extracción estructurada de información de capturas y formularios: al ser un modelo image-text-to-text, puede convertir facturas, tickets o pantallas en JSON estructurado dentro de un pipeline de ingestión de datos.
- Prototipado de asistentes conversacionales multilingües: la cobertura declarada de 201 idiomas de la familia lo hace apto para demos de atención al cliente en varios idiomas, siempre que se valide el comportamiento tras el finetune.
- Despliegue en hardware de gama alta de consumo: con 4,66B parámetros y atención lineal en 24 de sus 32 capas, es candidato a ejecutarse en una única GPU de 24 GB para contextos moderados, lo que facilita entornos de desarrollo y pruebas locales.
- Investigación sobre arquitecturas híbridas: sirve como caso práctico para estudiar el comportamiento de Gated DeltaNet frente a atención completa en tareas de contexto largo y evaluar el impacto de un finetune sobre un base híbrido.

## Benchmarks y rendimiento

La model card incluida en el repositorio reproduce parcialmente la tabla de benchmarks de Qwen3.5-4B (modelo base, no del finetune). Los datos disponibles son los siguientes:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (tabla truncada) | no disponible (tabla truncada) |

Los valores de MMLU-Redux para Qwen3.5-9B y Qwen3.5-4B no aparecen en la información proporcionada porque la tabla está cortada. No se han publicado resultados de benchmarks específicos de Sea-4B-Agentic en la información disponible, ni tampoco datos de evaluaciones agénticas, de tool calling o multimodales para este finetune.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del número de parámetros publicado (4,66B) y de la arquitectura del modelo base; no proceden de mediciones oficiales.

- Pesos en bf16: aproximadamente 9,3 GB (coincide con el tamaño del repositorio).
- Pesos en 8 bits: aproximadamente 4,7-5 GB. Pesos en 4 bits: aproximadamente 2,5-3 GB (requiere cuantización externa; no se distribuyen pesos cuantizados).
- Caché KV: solo 8 de las 32 capas usan atención clásica (4 cabezas KV, dimensión 256), lo que supone del orden de 32 KB por token en bf16; a 262.144 tokens serían unos 8,6 GB adicionales. Las 24 capas restantes de Gated DeltaNet mantienen un estado de tamaño constante.
- VRAM total estimada en bf16: unos 11-12 GB con contexto de 32.000 tokens y unos 20 GB con la ventana completa de 262.144 tokens.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o H200 para contexto máximo; RTX 4090, RTX 5090 o L40S (24-48 GB) para contexto moderado en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 5090) con contexto limitado; en 16 GB sería necesario cuantizar y reducir la ventana.
- Opciones de despliegue: la model card del base declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. El tag `endpoints_compatible` sugiere uso con Hugging Face Inference Endpoints. No hay confirmación de soporte en llama.cpp u Ollama para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sea-4B-Agentic (este modelo) | 4,66B | 262.144 tokens (extensible a 1.010.000) | No disponible (sin benchmarks propios) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B | 262.144 tokens (extensible a 1.010.000) | 79,1 | Apache 2.0 (según enlace de licencia del card) | Hugging Face |
| GPT-OSS-20B | 20B según nomenclatura | No disponible | 74,8 | No disponible en la información | No disponible en la información |
| Qwen3-30BA3B-Thinking-2507 | 30B según nomenclatura (MoE) | No disponible | 80,9 | No disponible en la información | No disponible en la información |

La comparación relevante es contra el propio modelo base: al no existir benchmarks del finetune, no es posible determinar si Sea-4B-Agentic mejora, mantiene o degrada las cifras de Qwen3.5-4B. Los modelos de mayor tamaño incluidos en la tabla se listan únicamente porque aparecen en los benchmarks proporcionados, no como alternativas funcionales directas.

## Limitaciones y advertencias

- Ausencia total de documentación del finetune: se desconoce el dataset, el método de ajuste y las capacidades realmente modificadas respecto al base.
- Model card duplicada: el README es una copia literal de la de Qwen3.5-4B, lo que puede inducir a error sobre qué comportamiento cabe esperar.
- Sin benchmarks propios ni evaluaciones independientes; no hay evidencia de que las capacidades multimodales, multilingües o agénticas del base se hayan preservado.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de conocimiento factual y razonamiento encadenado largo.
- Trazabilidad mínima: el repositorio tiene 0 descargas y 1 like, sin historial de validación por parte de la comunidad.
- Sesgos: no evaluados. El modelo hereda los sesgos del corpus de entrenamiento de Qwen3.5, no auditados para este ajuste.
- Límites de idioma: la cobertura de 201 idiomas corresponde a la familia, no está verificada en este finetune; es razonable esperar un rendimiento muy inferior en idiomas poco representados.
- Contexto largo: aunque la arquitectura permite 262.144 tokens, el rendimiento efectivo en ventanas muy largas no está documentado para este modelo, y la caché KV consume VRAM de forma significativa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el card remite a la licencia del modelo base de Qwen, por lo que conviene revisar los términos de Qwen3.5-4B antes de un despliegue en producción.
- Producción: sin garantías de estabilidad, sin versionado semántico y sin mantenimiento conocido por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Sea-4B-Agentic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo base post-entrenado (referenciado en la licencia): https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y a hilos de Zhihu sin relación con el modelo.
