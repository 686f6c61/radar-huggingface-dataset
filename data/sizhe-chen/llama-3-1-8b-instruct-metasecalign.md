# Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign

## Resumen

Llama-3.1-8B-Instruct-MetaSecAlign es un modelo derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por Sizhe-Chen, que incorpora la defensa Meta-SecAlign frente a ataques de prompt injection. Se trata de una fusión BF16 autónoma (standalone merge) del adaptador facebook/Meta-SecAlign-8B sobre el modelo base de Meta, sin entrenamiento adicional en esta release. El modelo está pensado para agentes que procesan datos no confiables (correos, documentos, páginas web) y necesitan resistir instrucciones inyectadas sin degradar su utilidad en tareas benignas.

La relevancia del modelo radica en que el prompt injection está reconocido como una de las principales amenazas para agentes basados en LLM. Meta-SecAlign entrena la defensa mediante DPO con pares de preferencia de seguridad estáticos derivados de Cleaned-Alpaca, sin entrenamiento adversarial. Según la model card, esta aproximación mantiene casi toda la utilidad del modelo indesefendido en conocimiento general, seguimiento de instrucciones y flujos agénticos, mientras mejora la seguridad frente a ataques estáticos y adaptativos GCG en comparación con SecAlign.

El modelo tiene 8.030.261.248 parámetros en formato safetensors (BF16), un repositorio de 16,1 GB, licencia Llama 3.1 Community, y está disponible únicamente en inglés. Su contexto heredado es el de Llama 3.1 (128.000 tokens), aunque la model card no lo explicita. Esta ficha se basa exclusivamente en la información proporcionada por el autor y los papers referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), fusión BF16 de adaptador Meta-SecAlign sobre Llama-3.1-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Llama 3.1: 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en BF16; al ser Llama 3.1 es compatible con GGUF/AWQ/GPTQ vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1 con 8.030 millones de parámetros, obtenido mediante la fusión del adaptador de facebook/Meta-SecAlign-8B en meta-llama/Llama-3.1-8B-Instruct, sin entrenamiento adicional en esta release. La defensa Meta-SecAlign se entrena con DPO (Direct Preference Optimization) usando pares de preferencia de seguridad estáticos derivados del dataset yahma/alpaca-cleaned, sin entrenamiento adversarial. Las innovaciones declaradas en el paper de Meta-SecAlign son dos: (1) posiciones de inyección aleatorizadas durante el entrenamiento para evitar el aprendizaje de atajos, y (2) respuestas autogeneradas como etiquetas de entrenamiento de alta calidad e in-distribution.

El paper posterior SecPO, referenciado en la model card, señala limitaciones de esta aproximación: DPO ancla el modelo al modelo de referencia indesefendido, que es inseguro, y Meta-SecAlign se entrena con ataques simulados débiles. Según ese paper, Meta-SecAlign presenta tasas de éxito de ataque (ASR) cercanas al 100% bajo prompt injections adaptativos, y el entrenamiento adversarial de SecPO las reduce entre 1,5 y 14,5 veces en tres ataques adaptativos de última generación, con una reducción adicional de 2,4 a 4,6 veces al sustituir la pérdida DPO por la pérdida SecPO. Esta release se posiciona explícitamente como la línea base de Meta-SecAlign evaluada en el estudio SecPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct.
- Razonamiento científico y matemático (evaluado en MMLU-Pro, GPQA Diamond, GSM8K y Minerva Math).
- Seguimiento de instrucciones (evaluado en AlpacaEval2 y SEP Utility).
- Resistencia a prompt injection estática y adaptativa GCG, objetivo principal de la defensa Meta-SecAlign.
- Soporte para flujos agénticos con tool calling y navegación web (evaluado en AgentDojo, InjecAgent, WASP y SEP según el paper).
- Capacidad de ejecución en pipelines de text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Agentes que procesan correo electrónico no confiable: el modelo puede leer y resumir mensajes externos manteniendo la resistencia a instrucciones inyectadas en el cuerpo del correo, gracias al entrenamiento DPO con posiciones de inyección aleatorizadas.
- Automatización de atención al cliente con datos de usuario: al tratar transcripciones o documentos aportados por el usuario, la defensa reduce el riesgo de que contenido malicioso redirija el comportamiento del asistente.
- Navegación web agéntica: para agentes que leen páginas y ejecutan acciones, el modelo está evaluado en WASP y AgentDojo, lo que lo hace adecuado en entornos donde el HTML de terceros puede contener inyecciones.
- Procesamiento de documentos en pipelines RAG: al ingerir PDFs o páginas externas, el modelo mantiene su utilidad en seguimiento de instrucciones (SEP Utility 55,9%) mientras filtra instrucciones hostiles embebidas.
- Evaluación comparativa de defensas: sirve como línea base reproducible de Meta-SecAlign frente a SecPO y SecOPD en estudios de seguridad de LLM, con checkpoints publicados para Llama-3.1-8B y Qwen.
- Asistentes de código con contexto de repositorio: al leer issues, READMEs o comentarios de terceros, el modelo resiste inyecciones en texto no confiable manteniendo su capacidad de razonamiento matemático (GSM8K 84,4%).
- Despliegue en endpoints compatibles con TGI: para equipos que ya operan infraestructura de text-generation-inference, el checkpoint se integra sin cambios de arquitectura al ser una fusión BF16 de Llama 3.1.

## Benchmarks y rendimiento

Puntuaciones de utilidad publicadas en la model card (mayor es mejor):

| Capacidad | Benchmark | Undefended (Llama-3.1-8B-Instruct) | Meta-SecAlign (este modelo) | SecPO |
|---|---|---:|---:|---:|
| Ciencia | MMLU-Pro | 46,5% | 46,7% | 46,3% |
| Ciencia | GPQA Diamond | 23,7% | 24,2% | 24,2% |
| Matemáticas | GSM8K | 82,9% | 84,4% | 81,3% |
| Matemáticas | Minerva Math | 49,2% | 48,8% | 50,1% |
| Seguimiento de instrucciones | AlpacaEval2 | 23,7% | 24,0% | 23,7% |
| Seguimiento de instrucciones | SEP Utility | 55,4% | 55,9% | 59,4% |

La model card incluye una sección de "Security Scores (lower attack success rate is better)" cuyo contenido no está disponible en la información proporcionada. El paper SecPO reporta que Meta-SecAlign alcanza ASR cercanos al 100% bajo prompt injections adaptativos, y que en flujos agénticos el modelo SecPO + AT Qwen3.6-27B obtiene 8,8% frente a 78,8% de Meta-SecAlign en AgentDojo ASR@800 bajo el ataque AttackerMovesSecond. No se han publicado en la información disponible resultados de seguridad específicos de este checkpoint de 8B más allá de esas referencias cualitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 5-6 GB (estimaciones basadas en el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 con contexto limitado, y en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), además de vLLM, llama.cpp u Ollama mediante conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-MetaSecAlign (este) | 8,03 B | no disponible en la model card (heredado 128k) | llama3.1 | Defensa Meta-SecAlign vía DPO sin AT | Hugging Face, 1.954 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | llama3.1 | Modelo base indesefendido | Hugging Face oficial |
| Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO | 8,03 B | no disponible | llama3.1 | Defensa SecPO con entrenamiento adversarial | Hugging Face |
| facebook/Meta-SecAlign-8B | 8,03 B | no disponible | no disponible en la información | Adaptador Meta-SecAlign original | Hugging Face |

En utilidad, las diferencias con el modelo indesefendido son mínimas (por ejemplo, GSM8K 84,4% frente a 82,9%, y MMLU-Pro 46,7% frente a 46,5%). En seguridad, el paper SecPO sitúa a Meta-SecAlign como línea base superada por SecPO bajo ataques adaptativos, por lo que la elección entre ambos depende de si se prioriza reproducibilidad del baseline o robustez máxima.

## Limitaciones y advertencias

- Según el paper SecPO, Meta-SecAlign presenta ASR cercanos al 100% bajo prompt injections adaptativos, pese a su buen comportamiento frente a ataques estáticos y GCG.
- El entrenamiento se basa en ataques simulados débiles y en DPO anclado a un modelo de referencia indesefendido, lo que limita la robustez real en producción.
- Solo soporta inglés de forma declarada; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a Llama 3.1, no mitigado específicamente por la defensa.
- Sesgos heredados del modelo base y del dataset yahma/alpaca-cleaned, no documentados en la información disponible.
- Licencia Llama 3.1 Community: restricciones de uso comercial, política de uso aceptable y obligación de atribución (NOTICE) aplicables.
- Es una fusión BF16 sin cuantizaciones oficiales publicadas; la conversión a GGUF/AWQ corre a cargo del usuario.
- No debe interpretarse como una defensa completa: el propio paper SecPO demuestra que la defensa es superable con ataques adaptativos, por lo que en producción conviene combinarla con controles externos (aislamiento de datos no confiables, validación de acciones).
- Contexto no declarado explícitamente en la model card; conviene verificar la configuración de tokenizer y posición antes de asumir 128k.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador Meta-SecAlign original: https://huggingface.co/facebook/Meta-SecAlign-8B
- Checkpoint SecPO (Llama-3.1-8B): https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO
- Paper Meta-SecAlign: https://arxiv.org/abs/2507.02735
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Código: https://github.com/Sizhe-Chen/SecPO
- Dataset: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Licencia: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign/blob/main/LICENSE
- Política de uso aceptable: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign/blob/main/USE_POLICY.md
- Aviso de atribución: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign/blob/main/NOTICE
- Página del autor: https://sizhe-chen.github.io/
