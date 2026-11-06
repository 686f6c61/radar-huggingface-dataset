# positron-ai/Ministral-3-8B-Instruct-2512

## Resumen

Ministral-3-8B-Instruct-2512 es un modelo de lenguaje de tipo transformer denso desarrollado por Mistral AI, con 8.918.026.240 parámetros totales (aproximadamente 8,9 mil millones). Se distribuye bajo licencia Apache 2.0 y está orientado a tareas de instrucción general: generación de texto, razonamiento, código y matemáticas. El repositorio analizado aquí no es el original de Mistral AI, sino un espejo (mirror) publicado por Positron AI con el identificador `positron-ai/Ministral-3-8B-Instruct-2512`, pensado exclusivamente como fuente de descarga para pipelines de integración continua.

El espejo reproduce byte a byte la revisión `5b26027e7b19eeb4b7352e1fed3926375dd2cb4d` del repositorio upstream `mistralai/Ministral-3-8B-Instruct-2512`. La única modificación introducida es el `README.md`; el resto de archivos (pesos, tokenizador, plantilla de chat, configuración) mantienen los mismos identificadores de objeto (sha256 para LFS, sha1 para blobs de git) que el original, verificados antes y después de la subida. El repositorio incluye tanto pesos consolidados en un único `consolidated.safetensors` como pesos fragmentados en tres shards.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta las características de un modelo de la familia Ministral 3 de Mistral AI, orientado a despliegues con requisitos moderados de hardware; por otro, advierte de que el repositorio concreto analizado no aporta resultados de evaluación propios ni debe tratarse como canal de adquisición canónico, ya que su función es aislar los CI de cambios, gating y límites de tasa del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral 3, `mistral3` según tags) |
| Parametros totales | 8.918.026.240 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible en la información proporcionada; el repositorio incluye pesos en safetensors y el tag `fp8` aparece en los metadatos |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`consolidated.safetensors` y tres shards `model-0000X-of-00003.safetensors`); tokenizador Tekken (`tekken.json`, `tokenizer.json`) |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer denso de la familia Mistral 3 (tag `mistral3`), con 8.918.026.240 parámetros y pesos en formato safetensors. El repositorio incluye un tokenizador Tekken (`tekken.json` de 16,75 MB y `tokenizer.json` de 17,08 MB), la plantilla de chat (`chat_template.jinja`) y un `SYSTEM_PROMPT.txt`, lo que confirma que se trata de un modelo ajustado para instrucciones con formato de conversación definido por el autor original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las técnicas de alineación empleadas (RLHF, DPO u otras) ni innovaciones técnicas específicas más allá de lo que revelan los metadatos del repositorio. La model card del espejo no incluye detalles de entrenamiento: se limita a documentar la procedencia y la integridad de los archivos. Cualquier dato de arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de sliding window attention) debe consultarse en el repositorio upstream de Mistral AI, no en este espejo.

## Capacidades

- Generación de texto en formato de instrucción, con plantilla de chat propia (`chat_template.jinja`) y system prompt incluido (`SYSTEM_PROMPT.txt`).
- Razonamiento y resolución de tareas de instrucción general, según la denominación `Instruct` del modelo.
- Generación de código y matemáticas: capacidades habituales en la familia Ministral, aunque no se documentan resultados concretos en la información disponible.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en infraestructura propia con licencia Apache 2.0 y servir conversaciones multi-turno mediante la plantilla de chat incluida, sin dependencia de APIs externas.
- Generación de código en entornos con requisitos de soberanía del dato: al poder ejecutarse on-premise, encaja en equipos que no pueden enviar código a servicios en la nube; requiere validar previamente su calidad en el lenguaje objetivo.
- Automatización de documentación técnica: generación y resumen de documentación a partir de fuentes internas, aprovechando el formato de instrucción y el system prompt predefinido.
- Clasificación y extracción de información estructurada: uso como motor de extracción sobre textos internos en pipelines batch, con la ventaja de un tamaño de 8,9 mil millones de parámetros que permite ejecución en una sola GPU de gama alta.
- Prototipado rápido de aplicaciones LLM: su tamaño moderado y su licencia permisiva lo hacen adecuado para iterar sobre prompts y plantillas antes de escalar a modelos mayores.
- Base para fine-tuning específico de dominio: al estar bajo Apache 2.0 y en safetensors, puede ajustarse con LoRA o QLoRA sobre datos propios y redistribuirse.
- Réplica reproducible en CI: el propio repositorio sirve como fuente fijada por revisión para pipelines que necesitan descargar los pesos de forma anónima y estable, sin depender de gating ni de límites de tasa del upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo indica explícitamente que no se reportan resultados de evaluación y que ninguno debe atribuirse a este repositorio. Cualquier cifra de MMLU, HumanEval, GSM8K u otras deberá consultarse en la documentación oficial de Mistral AI para el modelo upstream.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 17,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 20-24 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 9-10 GB de VRAM para pesos.
- Cuantización a 4 bits: aproximadamente 5-6 GB de VRAM para pesos, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues en BF16 con concurrencia; RTX 4090 (24 GB) para BF16 en una sola GPU con contexto limitado; RTX 3090/4080 o superiores para cuantización 8/4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 u 8 bits en GPUs con 8-24 GB de VRAM, siempre que la implementación soporte dichas cuantizaciones.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, sujeto a la disponibilidad de soporte para la arquitectura `mistral3` en cada herramienta. No se confirma en la información proporcionada qué frameworks dan soporte explícito a esta revisión concreta.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ministral-3-8B-Instruct-2512 (este) | 8,92 B | no disponible | Apache 2.0 | Hugging Face (upstream y este espejo) | Modelo denso de instrucción de Mistral AI |
| Mistral 7B Instruct | 7,24 B | 32 K (según versión) | Apache 2.0 | Hugging Face | Generación anterior de la familia; contexto y datos de entrenamiento distintos |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | Hugging Face | Licencia no plenamente permisiva para todos los usos comerciales |
| Qwen2.5 7B Instruct | 7,62 B | 128 K (versión estándar) | Apache 2.0 (mayoría de variantes) | Hugging Face | Alternativa densa de tamaño similar con licencia permisiva |

Los datos de contexto de los modelos comparados corresponden a sus versiones públicas habituales; no se dispone del dato de contexto para el modelo analizado en la información proporcionada, por lo que la comparación en ese eje queda incompleta. No se dispone de benchmarks comparativos verificables en la información facilitada.

## Limitaciones y advertencias

- Este repositorio es un espejo de CI: no es el canal canónico de adquisición del modelo ni debe citarse como fuente de pesos para producción. El sujeto canónico es `mistralai/Ministral-3-8B-Instruct-2512`.
- No se reportan resultados de evaluación en este repositorio; cualquier cifra de rendimiento atribuida al espejo sería incorrecta.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluación de seguridad del modelo en la documentación proporcionada.
- Se desconoce la longitud de contexto soportada, lo que impide garantizar su idoneidad para tareas de contexto largo sin consultar el repositorio upstream.
- No se confirma el conjunto de idiomas soportados; el rendimiento en castellano no está documentado.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero conviene revisar los términos del modelo upstream por si existiesen condiciones adicionales no reflejadas en este espejo.
- El tag `fp8` en los metadatos no implica que todos los pesos del repositorio estén en FP8; el repositorio contiene safetensors cuyo dtype exacto no se detalla en la información disponible.
- El tamaño del repositorio (20,9 GB) incluye pesos duplicados (consolidado y shards), lo que incrementa el coste de descarga en pipelines de CI.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/positron-ai/Ministral-3-8B-Instruct-2512
- Repositorio upstream (Mistral AI): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Revisión upstream fijada: `5b26027e7b19eeb4b7352e1fed3926375dd2cb4d`
