# Shankarblr/Qwen2.5-1.5B-TechWriter-Instruct

## Resumen

Qwen2.5-1.5B-TechWriter-Instruct es un modelo de lenguaje de nicho creado por el usuario de HuggingFace Shankarblr, que parte del modelo base Qwen/Qwen2.5-1.5B-Instruct y lo afina con la técnica QLoRA para especializarse en redacción técnica de semiconductores e interconexión en centros de datos. El objetivo es generar contenido de documentación interna y material de marketing técnico: product briefs, datasheets, application notes y secciones CLI para guías de usuario. El modelo está pensado para desarrolladores que necesitan producir borradores técnicos con consistencia interna en un dominio muy concreto.

Arquitectónicamente es un Transformer decoder-only de la familia Qwen2.5, con un total de 1.543.714.304 parámetros. La longitud de contexto precisa no se indica en la información disponible; el entrenamiento se realizó con secuencias de 2.048 tokens. El modelo resultante es un checkpoint de inferencia con los pesos ya fusionados en fp16 tras el fine-tuning, publicado bajo licencia Apache-2.0.

Su relevancia radica en ofrecer un especialista ligero (1.5B) y de código abierto para un ámbito muy específico: la documentación de productos de hardware de red y semiconductores. Al partir de un modelo instruct ya probado, mantiene la capacidad de seguir instrucciones y formato de conversación, pero inserta un vocabulario y un estilo de escritura técnica que rara vez se encuentran en modelos generalistas del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos merged desde QLoRA 4-bit NF4); no se documentan cuantizaciones alternativas |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning QLoRA de Qwen2.5-1.5B-Instruct, entrenado con Hugging Face TRL SFTTrainer. La técnica QLoRA utilizó cuantización 4-bit NF4 con double quant, aplicando adaptadores LoRA sobre los proyectos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`), con r=16, alpha=32 y dropout 0.05. Tras el entrenamiento, los adaptadores se fusionaron con el modelo base y se guardó el checkpoint final en fp16 para inferencia.

El dataset de entrenamiento es un mix privado de documentación técnica de semiconductores en formato ChatML, con un total de 6.765 filas. Se hizo un split 90/10 con semilla 42, y la secuencia máxima fue de 2.048 tokens. El entrenamiento se ejecutó durante 3 épocas, lo que equivale a 1.143 pasos, con tamaño de lote efectivo de 16 (4 micro-batches y 4 gradientes acumulados). Se usó una tasa de aprendizaje de 2e-4 con scheduler cosine y warmup del 3%. Los datos vistos totalizaron aproximadamente 7,9 millones de tokens al final de la tercera época.

No se describe ninguna innovación técnica destacable más allá del propio fine-tuning; el valor del modelo está en el dominio de datos y en la adaptación al estilo de escritura técnica. El autor indica explícitamente que se trata de un checkpoint no oficial y que el dataset es privado, compuesto por PDFs extraídos de proveedores y documentos sintéticos limpios.

## Capacidades

- Genera texto técnico en inglés para el dominio de semiconductores y conectividad en centros de datos: product briefs, datasheets, application notes y secciones CLI de guías de usuario.
- Extrae especificaciones y responde preguntas cortas sobre fragmentos de documentación pegados en la entrada (grounded QA sobre excerpt).
- Mantiene consistencia interna en borradores cuando se le instruye explícitamente: un solo process node, una única tasa de transferencia primaria y un solo form factor, salvo que la fuente origine listas de opciones.
- Sigue el formato de chat ChatML heredado de Qwen2.5-Instruct, lo que permite definir un system prompt específico para anclar el tono y estilo del contenido generado.
- Capacidad multilingüe limitada: únicamente inglés. El autor afirma que no debe usarse para otros idiomas.
- No se documenta soporte de tool calling, function calling, vision o audio; el modelo es estrictamente text-to-text.

## Casos de uso

- Drafts de product briefs para adaptadores de red: el modelo puede generar un primer borrador estructurado de un brief para una serie de adaptadores 40/50/100GbE, manteniendo el tono de marketing técnico y las secciones habituales del formato.
- Redacción de listas de características (Key Features) para datasheets: a partir de un prompt que pide la sección de características clave para una serie de switches Ethernet, el modelo produce listas concisas y consistentes con el estilo solicitado.
- Documentación de secciones CLI en guías de usuario: genera comandos y texto descriptivo para secciones de guías de usuarios de host-adapters o switches, siempre que no se le pida inventar sintaxis no vista en los datos de entrenamiento.
- Extracción de specs desde un extracto: se le puede proporcionar un fragmento de un datasheet y pedirle que extraiga parámetros concretos o responda preguntas sobre ese pasaje, como soporte de QA básico.
- Borradores internos de notas de aplicación: el modelo puede servir para generar una primera versión de una nota técnica sobre interconexión de DPU o almacenamiento, para que un ingeniero la revise y corrija después.
- Asistente de documentación en pipelines de CI/CD: al ser pequeño y compatible con Transformers, puede integrarse en un flujo automatizado que genere borradores de especificaciones o descripciones de productos a partir de datos estructurados, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. El autor incluye únicamente métricas de evaluación teacher-forced sobre un conjunto de validación propio, que se presentan a continuación:

| Tarea | Dataset | Eval loss | Mean token accuracy |
|---|---|---:|---:|
| Causal language modeling (teacher-forced eval) | semiconductor technical-writing ChatML mix (10% holdout) | 0.1404 | 0.9488 |

Es importante interpretar correctamente estos números: la accuracy de 94,9% significa que el modelo asignó la mayor probabilidad al token correcto en las cadenas ChatML del conjunto de validación. No es precisión factual sobre SKUs de silicio, como advierte el propio autor.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware, ni métricas de latencia o throughput. A partir del tamaño de los pesos y la precisión fp16, se puede estimar lo siguiente de forma orientativa, no como especificación garantizada:

- VRAM mínima estimada para inferencia en fp16: aproximadamente 3,1 GB para los pesos, más overhead de activaciones y KV cache, lo que recomienda un mínimo de 4 a 6 GB de VRAM en la práctica.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como una consumer de gama media (RTX 3060, RTX 4060) o superior. Puede ejecutarse en entornos de nube con T4 (16 GB) sin problemas.
- Es viable en consumer GPUs de gama baja con cuantización posterior a 4 u 8 bits, aunque no se documentan cuantizaciones pre-entrenadas.
- Opciones de despliegue: carga directa con `AutoModelForCausalLM` y `pipeline("text-generation")` de Transformers. Al ser un modelo de 1.5B, también es compatible con frameworks como vLLM, TGI o llama.cpp, siempre que se convierta a GGUF manualmente si se quiere usar en entornos CPU.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

No se han identificado modelos comparables de nicho (fine-tunes especializados en escritura técnica de semiconductores) en la información disponible. La comparación más directa es con el modelo base Qwen2.5-1.5B-Instruct, que se muestra en la siguiente tabla:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-1.5B-TechWriter-Instruct | 1.543.714.304 | no disponible | Apache-2.0 | Escritura tecnica semiconductores / DC interconnect |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | no disponible | Apache-2.0 | Chat general e instrucciones, sin dominio especifico |

Al ser un fine-tuning sobre el mismo modelo base, las diferencias fundamentales están en el estilo y el vocabulario del dominio, no en la arquitectura ni en el tamaño. El modelo especializado es adecuado para tareas internas de documentación, mientras que el base sería preferible para conversación general o cuando se necesite cubrir temas fuera de semiconductores.

## Limitaciones y advertencias

- Riesgo elevado de inventar SKUs, números de pieza o sintaxis CLI si se le pide escribir sobre productos que no estaban presentes en los datos de entrenamiento.
- El modelo no debe usarse como fuente autorizada para datasheets finales ni especificaciones de seguridad; siempre requiere verificación humana.
- Solo soporta inglés. El autor desaconseja su uso para cualquier otro idioma.
- No es apto para chat general ni temas ajenos a interconexión de centros de datos, almacenamiento o DPU.
- Los resultados de validación son teacher-forced, no reflejan precisión factual en tareas de generación abierta.
- Los datos de entrenamiento son privados y no están auditados, por lo que pueden contener sesgos de los documentos fuente, ausencias de información o errores heredados.
- Advertencia técnica: el archivo `generation_config.json` incluye un `max_length` heredado que puede provocar el aviso "Both max_new_tokens and max_length(=20)" si se usa la API de pipeline sin sobrescribir. Se recomienda pasar únicamente `max_new_tokens` en la llamada a `generate`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shankarblr/Qwen2.5-1.5B-TechWriter-Instruct
- Repositorio del adaptador LoRA (solo adaptador): https://huggingface.co/Shankarblr/Qwen2.5-1.5B-TechWriter-LoRA
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
