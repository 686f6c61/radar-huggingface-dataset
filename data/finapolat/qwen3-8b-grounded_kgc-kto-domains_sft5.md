# FinaPolat/Qwen3-8B-grounded_KGC-kto-domains_SFT5

## Resumen

FinaPolat/Qwen3-8B-grounded_KGC-kto-domains_SFT5 es un ajuste fino del modelo Qwen3-8B, publicado por el usuario FinaPolat en Hugging Face. El nombre del repositorio indica que se ha entrenado para generación de conocimiento fundamentado (grounded Knowledge Graph Construction, KGC), con una etapa de SFT seguida de un ajuste con KTO (Kahneman-Tversky Optimization) sobre múltiples dominios. El modelo conserva la arquitectura y el tamaño del Qwen3-8B base, con 8.190.735.360 parámetros totales según los pesos en safetensors.

El problema que aborda es la construcción de grafos de conocimiento a partir de texto: extraer entidades y relaciones y fundamentarlas en el contexto de entrada. La combinación de SFT y KTO sugiere un intento de alinear las respuestas con preferencias humanas en tareas de extracción estructurada, un enfoque poco habitual en modelos de 8B orientados a KGC.

La relevancia es limitada por ahora: el repositorio no tiene descargas ni likes, la model card es una plantilla automática sin información sustantiva y no se publican datos de entrenamiento, evaluación ni licencia. Es un artefacto de investigación que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar de transformers, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de la familia Qwen3. El repositorio incluye la etiqueta `trl` y `kto`, lo que indica que el ajuste se realizó con la librería TRL de Hugging Face empleando Kahneman-Tversky Optimization, una variante de optimización por preferencias que no requiere pares de preferencia emparejados. El nombre del checkpoint sugiere una etapa previa de SFT (SFT5) y un ajuste posterior con KTO sobre datos de varios dominios orientados a KGC fundamentado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, hiperparámetros, precisión mixta ni si hubo etapas adicionales de RLHF o DPO. La model card es una plantilla automática sin contenido sustantivo. Tampoco se documentan innovaciones técnicas específicas del ajuste.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-8B.
- Extracción de entidades y relaciones para construcción de grafos de conocimiento (KGC), según el nombre del checkpoint.
- Generación fundamentada (grounded): se espera que el modelo vincule las extracciones al contexto proporcionado, aunque no hay documentación que lo confirme.
- Razonamiento multi-paso y matemáticas: capacidades del Qwen3 base, no verificadas tras el ajuste.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base Qwen3 es multilingüe, pero no se documenta el efecto del ajuste.
- Modo thinking: no disponible.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Construcción de grafos de conocimiento a partir de corpus documentales: el modelo se usaría para extraer tripletas (sujeto, relación, objeto) de textos técnicos o legales, con la ventaja de que el ajuste KGC está específicamente orientado a esta tarea.
- Enriquecimiento de bases de datos internas: procesar informes y artículos para poblar un grafo de entidades y relaciones, con revisión humana posterior dada la falta de benchmarks publicados.
- Extracción de relaciones en dominios especializados: el sufijo "domains" del checkpoint sugiere entrenamiento multi-dominio, útil para pipelines que cubren varios verticales (finanzas, salud, legal) con un único modelo.
- Generación fundamentada para sistemas RAG: el modelo podría citar evidencia del contexto al responder, reduciendo alucinaciones en tareas de extracción, aunque esta capacidad no está verificada.
- Prototipado de investigación en KGC: como punto de partida para experimentos académicos sobre extracción estructurada con modelos de 8B, dado su bajo coste de despliegue.
- Evaluación comparativa de técnicas de alineación: el uso de KTO sobre un modelo de 8B orientado a tareas estructuradas lo hace útil como caso de estudio en experimentos de preferencias.
- Asistencia en anotación semiautomática: generar candidatos de tripletas para que anotadores humanos validen, acelerando la curación de datasets de KGC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantización 8 bits.
- GPU de consumo: cabe en RTX 4090 en bf16 con contexto limitado y en RTX 3090/4080 con cuantización 4-8 bits; en GPUs de 8-12 GB solo con cuantización 4 bits y contextos cortos.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM y TGI (etiqueta `text-generation-inference`), llama.cpp/Ollama si se generan GGUF a partir de los pesos (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinaPolat/Qwen3-8B-grounded_KGC-kto-domains_SFT5 | 8,19B | no disponible | KGC fundamentado, SFT + KTO | no disponible | Hugging Face, 0 descargas |
| Qwen3-8B (base) | ~8,2B | no disponible en esta ficha | Modelo generalista | Apache 2.0 (según el modelo base, no confirmado en este repo) | Amplia |
| Qwen2.5-7B-Instruct | ~7,6B | 128K (según documentación del modelo base) | Instrucciones generalistas | Apache 2.0 | Amplia |
| Llama 3.1 8B Instruct | ~8B | 128K | Instrucciones generalistas | Llama 3.1 Community License | Amplia |

La comparación directa con alternativas orientadas a KGC no está disponible: no se conocen modelos públicos de tamaño similar específicamente ajustados con KTO para construcción de grafos de conocimiento fundamentados.

## Limitaciones y advertencias

- La model card es una plantilla automática sin información sobre sesgos, datos de entrenamiento, evaluación o uso previsto.
- No hay benchmarks publicados: no se puede verificar que el ajuste KTO mejore al modelo base en KGC ni que no degrade otras capacidades.
- Riesgo de alucinación en la extracción de entidades y relaciones: sin evaluación, no se puede cuantificar la tasa de tripletas incorrectas o no fundamentadas.
- Licencia no disponible: impide determinar si el uso comercial está permitido; el modelo base Qwen3 tiene su propia licencia que puede condicionar el uso derivado.
- Idiomas soportados no documentados: el ajuste podría haber reducido el multilingüismo del modelo base.
- Contexto no documentado: se desconoce si se mantiene la ventana del Qwen3 base o si el ajuste la modificó.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- El nombre del checkpoint sugiere una etapa SFT5 concreta dentro de una serie; podría existir una versión posterior más adecuada, no identificada en la información disponible.
- Para producción, se recomienda evaluar exhaustivamente en el dominio objetivo y aplicar validación humana en las extracciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FinaPolat/Qwen3-8B-grounded_KGC-kto-domains_SFT5
- Paper de referencia sobre KTO: no disponible en la información proporcionada
- Repositorio TRL: https://github.com/huggingface/trl
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
