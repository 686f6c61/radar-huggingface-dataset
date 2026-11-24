# mounish-bv/gemma-3-1b-it-olist-text2sql

## Resumen

`mounish-bv/gemma-3-1b-it-olist-text2sql` es un ajuste fino (fine-tuning) del modelo Gemma 3 de 1B parámetros en su variante instruct, especializado en la tarea de conversión de lenguaje natural a SQL (text-to-SQL) sobre el esquema de datos de Olist, el conocido dataset de comercio electrónico brasileño. Lo desarrolla el usuario mounish-bv y se distribuye con licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-3-1b-it-unsloth-bnb-4bit`) y se ha reentrenado y publicado en formato FP16.

La relevancia de este modelo es acotada pero concreta: demuestra el flujo de trabajo de ajuste fino eficiente con Unsloth sobre un modelo pequeño (aproximadamente 1.000 millones de parámetros, según los pesos en safetensors) para una tarea vertical muy específica. No es un modelo de propósito general ni compite con modelos frontera; su interés radica en servir como ejemplo reproducible de especialización de un LLM compacto en generación de consultas SQL sobre un esquema concreto.

La model card publicada es mínima y no aporta detalles sobre el dataset de entrenamiento, hiperparámetros, número de épocas ni evaluación. Toda la información técnica adicional que se presenta a continuación se deriva de la información disponible en Hugging Face y de las características conocidas de la familia Gemma 3, marcando explícitamente como "no disponible" aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 999.885.952 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica; el modelo base Gemma 3 1B soporta contexto largo, pero el autor no documenta el valor usado en el ajuste) |
| Tipos de cuantizacion | pesos publicados en FP16; el modelo base de partida era BNB 4-bit; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 3 1B instruct de Google, un transformer decoder-only con atención multi-cabeza y las optimizaciones propias de la familia Gemma 3. El autor parte de la versión pre-cuantizada en 4 bits de Unsloth (`unsloth/gemma-3-1b-it-unsloth-bnb-4bit`), lo que permite entrenar con requisitos de memoria reducidos, y publica el resultado en FP16. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, que menciona un entrenamiento "2x faster" sin aportar cifras de tokens, épocas, tamaño del dataset ni composición del mismo.

No se documenta en la información disponible si hubo RLHF, DPO, SFT puro u otras etapas de alineamiento posteriores al ajuste. Tampoco se especifica la composición del dataset de text-to-SQL ni si se empleó el esquema de Olist de forma completa o parcial. La única innovación técnica mencionada es el uso del stack Unsloth + TRL para acelerar el ajuste fino, sin detalles adicionales sobre decodificación especulativa, atención lineal u otras técnicas.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural, presumiblemente orientada al esquema de datos de Olist.
- Generación de texto conversacional heredada del modelo base Gemma 3 1B instruct.
- Hereda las capacidades generales del modelo base (razonamiento básico, respuesta a instrucciones), aunque el ajuste fino puede haber reducido su generalidad.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; la variante `gemma3_text` es solo texto.

## Casos de uso

- Generación de consultas SQL sobre el esquema de Olist: el modelo se usaría como traductor de preguntas de negocio en lenguaje natural (por ejemplo, "¿cuántos pedidos se entregaron tarde en São Paulo?") a consultas SQL ejecutables contra las tablas del dataset de Olist, aprovechando el ajuste específico sobre ese esquema.
- Asistentes de analítica para equipos de datos: integrado en un chatbot interno que permita a analistas no técnicos consultar tablas de e-commerce sin escribir SQL manualmente.
- Prototipado de pipelines text-to-SQL: sirve como base para validar arquitecturas de generación de SQL en entornos de desarrollo antes de escalar a modelos mayores.
- Enseñanza y demostración de fine-tuning eficiente: utilizable como ejemplo reproducible de especialización de un LLM de 1B con Unsloth y TRL en una tarea vertical.
- Generación de SQL en entornos con recursos limitados: al ser un modelo de ~1B parámetros, puede desplegarse en hardware modesto para tareas de generación de consultas en local.
- Filtrado o sugerencia de consultas en herramientas BI: el modelo podría proponer consultas SQL de partida que el usuario refine en un editor, reduciendo el tiempo de escritura manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los ~1.000 millones de parámetros ocupan aproximadamente 2 GB solo en pesos; con overhead de activaciones y caché KV, se estima un consumo de entre 3 y 4 GB en FP16. En cuantización de 4 bits (no publicada por el autor, pero factible), podría reducirse a ~1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; GPU de consumo como RTX 3060, RTX 4060, RTX 4090 son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 6 GB o más de VRAM.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp u Ollama si se genera una versión GGUF (no publicada por el autor). vLLM es compatible con arquitecturas transformer estándar, aunque no está documentado por el autor.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mounish-bv/gemma-3-1b-it-olist-text2sql | ~1.000 M | no disponible | text-to-SQL (Olist) | apache-2.0 | Hugging Face |
| google/gemma-3-1b-it | ~1.000 M | no disponible en la información proporcionada | propósito general | Gemma Terms of Use | Hugging Face |
| unsloth/gemma-3-1b-it-unsloth-bnb-4bit | ~1.000 M | no disponible en la información proporcionada | propósito general (4-bit) | Gemma Terms of Use | Hugging Face |
| Modelos text-to-SQL dedicados (p. ej. variantes de CodeLlama o SQLCoder) | variable | variable | text-to-SQL | variable | Hugging Face |

La comparación con alternativas text-to-SQL especializadas no puede completarse con datos de rendimiento porque el autor no publica benchmarks. La principal diferencia frente al modelo base es la especialización en el esquema de Olist, a costa de una posible pérdida de generalidad.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta dataset, hiperparámetros, épocas, evaluación ni limitaciones conocidas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de la calidad de las consultas SQL generadas.
- El ajuste está orientado a un esquema concreto (Olist); su rendimiento fuera de ese esquema es desconocido y probablemente pobre.
- Riesgo de alucinación: como todo LLM, puede generar tablas, columnas o cláusulas SQL inexistentes; se recomienda validación sintáctica y semántica antes de ejecutar consultas en producción.
- Idioma: la model card declara únicamente inglés; el soporte de otros idiomas (incluido el español) no está garantizado.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma 3 está sujeto a los Gemma Terms of Use; conviene verificar la compatibilidad de licencias antes de un uso comercial.
- El modelo se publica en FP16 partiendo de una versión 4-bit de Unsloth; no se documenta si el proceso de cuantización/descuantización introduce degradación.
- Sin métricas de latencia ni throughput publicadas; el rendimiento en producción es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mounish-bv/gemma-3-1b-it-olist-text2sql
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-1b-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Familia Gemma 3 (Google): https://huggingface.co/google/gemma-3-1b-it
