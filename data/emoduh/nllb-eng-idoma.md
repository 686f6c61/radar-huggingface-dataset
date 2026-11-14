# emoduh/nllb-eng-idoma

## Resumen

El modelo `emoduh/nllb-eng-idoma` es un ajuste fino completo (full fine-tuning) del modelo de traducción automática `facebook/nllb-200-distilled-600M` de Meta AI, especializado en la traducción bidireccional entre inglés (en) e idoma (idu), una lengua de Nigeria. Lo desarrolla el usuario emoduh y se distribuye en Hugging Face con la etiqueta de pipeline `translation`. El modelo parte de la arquitectura m2m_100 del NLLB-200 destilado y ha sido entrenado sobre 26.357 pares de versículos bíblicos alineados, expandidos en ambas direcciones, con semilla 42 y longitud máxima de secuencia tokenizada de 256 tokens.

El problema que resuelve es la escasez de recursos de traducción automática para lenguas de bajos recursos como el idoma, aprovechando un corpus paralelo de dominio bíblico. Es relevante ahora porque demuestra la viabilidad de especializar modelos multilingües grandes en pares de lenguas con pocos datos, aunque sus resultados se limitan estrictamente al dominio bíblico y no constituyen una afirmación de fluidez conversacional general. El repositorio ocupa 19,8 GB y el modelo tiene 615.072.768 parámetros reales según los pesos en safetensors.

La licencia no está disponible en la información proporcionada, lo que supone una limitación importante para su uso comercial. El modelo se publicó el 3 de septiembre de 2026 y se actualizó el 13 de noviembre de 2026, con 15 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | m2m_100 (transformer encoder-decoder de NLLB-200 destilado) |
| Parametros totales | 615.072.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia tokenizada en entrenamiento: 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés), idu (idioma idoma, token `idu_Latn`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura m2m_100 del NLLB-200 destilado de 600M de parámetros, un transformer encoder-decoder diseñado originalmente para traducción multilingüe. El ajuste fino es completo (no se trata de un adaptador ni de un LoRA), partiendo de `facebook/nllb-200-distilled-600M`. El token de idioma para el idoma es `idu_Latn`, lo que indica que se emplea la variante latina del idioma dentro del vocabulario multilingüe del NLLB.

El entrenamiento se realizó sobre 26.357 pares de versículos bíblicos alineados, procedentes de la Biblia King James (KJV) en inglés y de una Biblia en idoma, con los datos suministrados en el repositorio `maddox-bayn/idlang`. Los pares se expandieron en ambas direcciones (inglés→idoma e idoma→inglés). La partición de datos agrupa textos repetidos en inglés o idoma y estratifica por longitud, lo que reduce la fuga de texto exacto pero no excluye pasajes relacionados en distintos libros o versículos cercanos. La semilla empleada fue 42 y la longitud máxima de secuencia tokenizada fue de 256 tokens. El autor referencia los archivos `run_config.json`, `length_report.json` y `evaluation.json` para los ajustes y resultados medidos, aunque no se detalla en la información disponible si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Traducción automática bidireccional entre inglés e idoma en el dominio bíblico.
- Generación de texto traducido a nivel de versículo, con secuencias de hasta 256 tokens.
- Manejo del token de idioma `idu_Latn` para forzar la dirección de traducción.
- Capacidad multilingüe heredada del NLLB-200 base, aunque el ajuste se centra en el par en↔idu.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción de textos bíblicos del inglés al idoma: el modelo se entrenó específicamente sobre versículos alineados, por lo que es adecuado para traducir pasajes de la Biblia manteniendo la correspondencia verso a verso, con revisión humana posterior por parte de hablantes nativos.
- Traducción de material litúrgico y devocional: himnos, oraciones y comentarios bíblicos en inglés pueden traducirse al idoma como borrador para comunidades de habla idoma, dado el dominio acotado del entrenamiento.
- Asistencia a traductores misioneros y lingüistas: el modelo puede generar una primera versión automática de un versículo que el traductor revisa y corrige, acelerando el trabajo de traducción de la Biblia a lenguas de bajos recursos.
- Creación de corpus paralelos aumentados: las traducciones generadas pueden servir como datos adicionales para entrenar o evaluar otros sistemas de traducción en idoma, siempre con filtrado humano.
- Digitalización y preservación lingüística: el modelo contribuye a generar contenido en idoma, una lengua con pocos recursos digitales, facilitando la presencia de la lengua en entornos digitales.
- Evaluación comparativa de modelos de traducción para lenguas de bajos recursos: sirve como referencia de ajuste fino de NLLB-200 en un par de lenguas específico, útil para investigadores que estudian la transferencia de modelos multilingües a dominios restringidos.
- Traducción inversa idoma→inglés para comprensión de textos: permite a investigadores sin conocimiento de idoma obtener una versión inglesa aproximada de pasajes bíblicos en idoma, con las cautelas propias de un dominio limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un archivo `evaluation.json` con resultados medidos, pero no se proporcionan los valores numéricos en la información accesible. No se deben inferir cifras de MMLU, HumanEval, GSM8K ni de métricas de traducción como BLEU o chrF.

## Requisitos de hardware

- VRAM estimada para inferencia: con 615 millones de parámetros, en precisión fp32 se requieren aproximadamente 2,5 GB solo para los pesos, más memoria para activaciones y caché; en fp16 alrededor de 1,3 GB; en cuantización de 8 bits aproximadamente 0,7 GB; en 4 bits alrededor de 0,4 GB (estimaciones teóricas a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM puede ejecutar el modelo en fp16 o cuantizado; una NVIDIA RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM en fp16, y en 4 GB o más con cuantización de 8 bits.
- Opciones de despliegue: al ser un modelo m2m_100 con pesos safetensors, puede desplegarse con Hugging Face Transformers, vLLM (si soporta la arquitectura m2m_100), TGI o convertirse a GGUF para llama.cpp y Ollama (la conversión no está documentada por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emoduh/nllb-eng-idoma | 615.072.768 | no disponible (entrenamiento a 256 tokens) | en, idu | no disponible | Hugging Face |
| facebook/nllb-200-distilled-600M | 600M (aprox.) | 1024 tokens (modelo base NLLB) | 200 idiomas | CC-BY-NC 4.0 (según el modelo base, no confirmado en la información) | Hugging Face |
| facebook/nllb-200-distilled-1.3B | 1.3B (aprox.) | 1024 tokens (modelo base NLLB) | 200 idiomas | CC-BY-NC 4.0 (según el modelo base, no confirmado en la información) | Hugging Face |
| Helsinki-NLP/opus-mt-en-mul | no disponible | no disponible | múltiples | no disponible | Hugging Face |

La comparativa se limita a modelos de la familia NLLB y alternativas de traducción multilingüe; no se dispone de datos de rendimiento comparativo (BLEU, chrF) en la información proporcionada. El modelo ajustado hereda las limitaciones de licencia del modelo base, que en el caso de NLLB-200 es CC-BY-NC 4.0 (no comercial), aunque la licencia del ajuste no se especifica.

## Limitaciones y advertencias

- Dominio restringido: el entrenamiento se limita a pares de versículos bíblicos; los resultados no son una afirmación de fluidez conversacional general ni de traducción fuera del dominio bíblico.
- Fuga de datos potencial: la partición agrupa textos repetidos y estratifica por longitud, pero no excluye pasajes relacionados en distintos libros o versículos cercanos, lo que puede inflar las métricas de evaluación.
- Evaluación limitada: la evaluación cubre solo los pares retenidos por el filtro de longitud; las entradas largas quedan fuera del rango evaluado (máximo 256 tokens tokenizados).
- Calidad lingüística: el tono, el dialecto y la precisión de la traducción requieren revisión humana por parte de hablantes nativos de idoma.
- Licencia: no disponible; se desconoce si el uso comercial está permitido. El modelo base NLLB-200 tiene licencia CC-BY-NC 4.0, lo que podría restringir el uso comercial del ajuste.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre un corpus bíblico, el modelo puede reflejar el sesgo cultural y religioso de dicho corpus.
- Riesgo de alucinación: no cuantificado; en traducción automática de lenguas de bajos recursos, el riesgo de generar texto plausible pero incorrecto es relevante.
- Idiomas: solo se soportan inglés e idoma; no se garantiza un comportamiento correcto en otros idiomas del vocabulario NLLB.
- Tamaño del repositorio: 19,8 GB, lo que puede dificultar su descarga y almacenamiento en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emoduh/nllb-eng-idoma
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de datos: https://huggingface.co/datasets/maddox-bayn/idlang
- Paper de NLLB-200: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
