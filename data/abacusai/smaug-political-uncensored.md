# abacusai/Smaug-Political-Uncensored

## Resumen

Smaug-Political-Uncensored es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por Abacus.AI. Se trata de un transformer denso de 27.781 millones de parametros con atención híbrida (lineal con compuertas y atención completa con GQA) y una torre de visión ViT de 27 capas, lo que lo convierte en un modelo multimodal texto-imagen. Su contexto alcanza los 262.144 tokens, manteniendo la interfaz de "thinking" del modelo base.

El objetivo declarado del modelo es responder a preguntas sobre la política, historia y dirigentes de China de forma factual y sin la censura que afecta al modelo base, además de reducir los rechazos ante peticiones benignas que solo parecen arriesgadas, manteniendo el rechazo ante contenido genuinamente dañino (armas químicas, biológicas, radiológicas o nucleares y material de abuso sexual infantil). Según la model card, con el modo thinking activado, las respuestas factuales a preguntas censuradas en China suben del 44,9 % al 68,5 %, y los rechazos a sátiras sobre dirigentes chinos caen del 67,2 % al 28,4 %.

La adaptación se realizó mediante optimización de preferencias (DPO con un término NLL) sobre LoRA fusionado como delta completo, aplicado únicamente al tronco de lenguaje, dejando intacta la torre de visión. Los pesos se cargan exactamente igual que la versión oficial, con la misma arquitectura `Qwen3_5ForConditionalGeneration`. La licencia es Apache 2.0 y el modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal con compuertas + atención completa GQA) y torre de visión ViT |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 64 capas con una intercalación 3:1 entre atención lineal con compuertas y atención completa: 48 capas de atención lineal y 16 de atención completa con GQA (24 cabezas de atención y 4 cabezas KV). La dimensión oculta es de 5120 y el vocabulario de aproximadamente 248K tokens. Incorpora una cabeza de predicción multi-token (MTP) de 1 capa heredada del modelo base, con una tasa de aceptación de borrador del 62,2 % frente al 58,7 % del base, lo que habilita decodificación especulativa. La torre de visión es un ViT de 27 capas con patch de 16, sin cambios respecto al modelo original.

El ajuste se realizó mediante DPO con un término de verosimilitud negativa (NLL), aplicando LoRA que posteriormente se fusionó como un delta completo sobre el tronco de lenguaje. El contenido del dataset de entrenamiento no se divulga en la model card. La model card no especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento con modo thinking (activado por defecto).
- Comprensión de imágenes (pipeline image-text-to-text) mediante la torre ViT intacta.
- Generación de código y tareas de ingeniería de software (evaluado en DeepSWE, NL2Repo-Bench).
- Razonamiento científico y de nivel experto (GPQA Diamond).
- Seguimiento de instrucciones (IFBench).
- Capacidades agénticas y de razonamiento multi-paso (tag `agentic`, evaluación en JobBench).
- Respuesta factual a preguntas sobre política, historia y dirigentes de China sin censura.
- Generación de sátira y crítica política sobre el gobierno chino.
- Reducción de rechazos ante peticiones benignas que parecen arriesgadas.
- Soporte multilingüe limitado a inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada (el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla).

## Casos de uso

- Investigación sobre censura y sesgos en modelos de lenguaje: el modelo permite estudiar cómo un ajuste DPO con término NLL modifica las tasas de respuesta factual (44,9 % a 68,5 %) sobre un conjunto de preguntas censuradas, sirviendo como referencia para análisis comparativos de alineación.
- Análisis político y periodístico: redacción de resúmenes y respuestas factuales sobre historia y política china en inglés o chino, aprovechando que el modelo responde de forma más completa que el base a preguntas habitualmente censuradas.
- Generación de sátira y contenido crítico: producción de textos satíricos sobre gobiernos, incluido el chino, con una tasa de rechazo reducida (del 67,2 % al 28,4 %), útil en medios de humor político y ensayo.
- Evaluación de robustez ante prompts benignos arriesgados: el modelo reduce los rechazos en OR-Bench-Hard del 45,2 % al 24,9 %, lo que lo hace adecuado para probar sistemas de moderación que necesitan distinguir entre peticiones benignas y dañinas.
- Asistencia en ingeniería de software: con resultados en DeepSWE 1.1 (45,1) y NL2Repo-Bench (45,6), puede integrarse en pipelines de generación y revisión de código que requieran contexto largo de hasta 262.144 tokens.
- Procesamiento de documentos con imágenes: al conservar la torre de visión, puede extraer y razonar sobre información de capturas, diagramas o documentos escaneados en flujos de análisis documental multilingüe (en/zh).
- Evaluación de agentes multi-paso: los resultados en JobBench (57,0 frente a 33,4 del base) lo hacen útil como modelo de referencia en pruebas de agentes que ejecutan tareas laborales encadenadas.

## Benchmarks y rendimiento

Datos publicados en la model card (modo thinking activado):

| Benchmark | Smaug-Political-Uncensored | Qwen3.8-27B (base) |
|---|---|---|
| China-censored questions answered factually (deccp held-out, en + zh_cn + zh_tw) | 68,5 (183/267) | 44,9 (120/267) |
| Refusals of satire about China's leaders | 28,4 | 67,2 |
| Refusals of benign but risky-looking prompts (OR-Bench-Hard) | 24,9 | 45,2 |
| DeepSWE 1.1 | 45,1 | 42,2 |
| JobBench | 57,0 | 33,4 |
| IFBench | 82,7 | 79,5 |
| NL2Repo-Bench | 45,6 | 42,3 |
| GPQA Diamond | 89,4 | 89,2 |
| MTP draft acceptance | 62,2 % | 58,7 % |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para contexto moderado.
- Para contexto completo de 262.144 tokens, la memoria necesaria crece de forma significativa; la atención lineal en 48 de las 64 capas reduce el coste frente a un transformer de atención completa, pero no se dispone de cifras exactas de VRAM para el contexto máximo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU para contexto largo. En consumer GPU no cabe en bfloat16.
- Cuantización: no se publican pesos cuantizados oficiales; sería necesario generarlos (por ejemplo, GGUF de 4 bits) para intentar desplegarlo en GPUs consumer de 24 GB, con posible pérdida de calidad no documentada.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI son candidatos razonables dada la arquitectura `Qwen3_5ForConditionalGeneration`, aunque no se confirman explícitamente en la información disponible. llama.cpp/Ollama requerirían conversión a GGUF no oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Smaug-Political-Uncensored | 27B | 262.144 | Apache 2.0 | Finetune DPO de Qwen3.8-27B, multimodal, sin censura política china |
| Qwen3.8-27B (base) | 27B | 262.144 | no disponible en la información | Modelo original; censura política y más rechazos en prompts benignos |
| Alternativas de misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El ajuste se centra en reducir la censura sobre temas políticos chinos; no se documentan evaluaciones de sesgo en otras dimensiones (género, etnia, religión).
- Riesgo de alucinación inherente a los modelos de lenguaje; no se publican métricas de factualidad general más allá de los benchmarks citados.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo está diseñado para generar contenido crítico y satírico sobre gobiernos, lo que puede tener implicaciones legales o de plataforma según la jurisdicción de despliegue.
- El contenido del dataset de entrenamiento no se divulga, lo que dificulta auditar la procedencia de los datos y posibles sesgos introducidos.
- La reducción de rechazos en prompts benignos arriesgados (24,9 % de rechazos en OR-Bench-Hard) implica que el modelo puede responder a peticiones que otros sistemas bloquearían; es necesario implementar capas de moderación adicionales en producción.
- La model card afirma que las peticiones de armas CBRN y material de abuso sexual infantil se rechazan siempre, pero esta garantía no es verificable de forma independiente con los datos publicados.
- El modelo solo tiene 2 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Smaug-Political-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de Abacus.AI: https://abacus.ai
- Perfil de Abacus.AI en Hugging Face: https://huggingface.co/abacusai
