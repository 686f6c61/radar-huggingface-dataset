# sarubi/AuthorMix

## Resumen

AuthorMix es una librería de diez adaptadores LoRA de autoría (estilo literario) construida sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Cada adaptador se entrena de forma independiente para un autor concreto (Mark Twain, Virginia Woolf, Jane Austen, George Orwell, entre otros), aprendiendo a reescribir una paráfrasis neutra manteniendo el significado pero adoptando el estilo del autor objetivo. El modelo lo desarrolla Sarubi Thillainathan (usuario `sarubi`) y se presenta como charla oral en EMNLP 2026, según el portfolio del autor.

El problema que resuelve es el transfer de estilo de autoría modular: en lugar de entrenar un único modelo sobre un corpus agregado de todos los estilos (coste alto y difícil de actualizar), AuthorMix desacopla el modelo base de los adaptadores de estilo y de los pesos de mezcla específicos de cada objetivo. Los adaptadores se entrenan con rango 8 y alpha 16, y el repositorio ocupa 0,8 GB, lo que sugiere pesos en safetensors de bajo rango.

Es relevante ahora porque propone una arquitectura de composición (base + adaptadores + mezcla por capas) para el control fino de estilo, un área donde los enfoques monolíticos son caros y poco flexibles. La información pública disponible es escasa: no hay pipeline declarado, licencia, idiomas ni datos de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Llama 3.1 8B Instruct; rank 8, alpha 16 |
| Parametros totales | No disponible (el modelo base tiene 8B; los adaptadores son de bajo rango) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Llama 3.1, 128k tokens, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA); librería `peft` |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 0,8 GB |
| Numero de adaptadores | 10 (MT, VW, VL, CPG, GO, JA, NH, OW, PGW, SR) |

## Arquitectura y entrenamiento

AuthorMix no es un modelo monolítico, sino una librería de diez adaptadores LoRA entrenados sobre `meta-llama/Llama-3.1-8B-Instruct` con rank 8 y alpha 16. Cada adaptador se entrena de forma independiente para un autor: la entrada es una paráfrasis neutra de una frase del autor y el objetivo de entrenamiento es la frase original. De este modo, el adaptador aprende a reescribir texto neutro en el estilo del autor preservando el significado. Los pesos de mezcla específicos de cada objetivo y el modelo base se distribuyen por separado, lo que sugiere una composición por capas (layer-wise) en la inferencia.

El título del paper asociado, "Modular Authorship Style Transfer via Layer-wise ...", apunta a una mezcla por capas de los adaptadores, aunque el detalle técnico completo no está disponible en la información proporcionada. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Transfer de estilo de autoría: reescritura de texto neutro en el estilo de uno de los diez autores cubiertos (Mark Twain, Virginia Woolf, Vernon Lee, Charlotte Perkins Gilman, George Orwell, Jane Austen, Nathaniel Hawthorne, Oscar Wilde, P. G. Wodehouse, Samuel Richardson).
- Preservación de significado: el entrenamiento por pares (paráfrasis neutra → frase original) está diseñado para mantener el contenido semántico.
- Composición modular: al ser adaptadores LoRA independientes, permiten combinar o mezclar estilos mediante pesos específicos de cada objetivo.
- Generación de texto general: hereda las capacidades del modelo base Llama 3.1 8B Instruct (no verificadas en la model card).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reescritura estilística editorial: dado un texto neutro, aplicar el adaptador del autor deseado para generar una versión con su voz, útil en edición literaria y generación de variantes de estilo.
- Estudio computacional de estilos literarios: comparar cómo distintos adaptadores transforman la misma frase neutra permite analizar rasgos estilísticos de cada autor de forma controlada.
- Generación de contenido creativo con voz de autor: producción de pasajes con estilo de época (por ejemplo, Austen o Richardson) para narrativa, guiones o material didáctico.
- Anonimización estilística reversible: transformar un texto a un estilo neutro o a otro autor para experimentos de privacidad estilística y atribución de autoría.
- Investigación en transfer de estilo: base reproducible para comparar enfoques modulares (LoRA + mezcla) frente a modelos monolíticos entrenados sobre corpus agregados.
- Prototipado de asistentes de escritura: integrar el adaptador en un pipeline de generación para sugerir reescrituras con un tono literario concreto.
- Docencia de literatura: generar ejemplos de reescritura en el estilo de un autor para ilustrar rasgos de estilo en el aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de adaptadores LoRA sobre Llama 3.1 8B Instruct, el requisito dominante es el del modelo base (aproximadamente 16 GB en FP16, menos con cuantización de 8 o 4 bits, aunque estos valores no están confirmados en la información proporcionada).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, cabría esperar GPUs con al menos 16-24 GB de VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El modelo base de 8B podría caber en GPUs de consumo con cuantización, pero la model card no lo especifica.
- Opciones de despliegue: la librería declarada es `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuthorMix (este) | Adaptadores LoRA sobre 8B | No disponible | Modular: 10 adaptadores + mezcla por capas | No disponible | Hugging Face (`sarubi/AuthorMix`) |
| Alternativas de transfer de estilo monolíticas | No disponible | No disponible | Modelo único entrenado sobre corpus agregado | No disponible | No disponible |
| Llama 3.1 8B Instruct (base) | 8B | 128k (según documentación de Meta; no confirmado aquí) | Transformer decoder | Licencia Llama 3.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no declara licencia, idiomas, pipeline ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Sesgos conocidos: no documentados; al entrenarse sobre obras de autores históricos, puede reproducir sesgos de época y de los corpus utilizados.
- Riesgo de alucinación: no evaluado; al ser un modelo generativo basado en Llama 3.1, hereda el riesgo del modelo base.
- Limitaciones de contexto o idioma: no disponibles; el entrenamiento por pares de frases sugiere un enfoque a nivel de oración, no de documento completo.
- Restricciones de licencia para uso comercial: no disponibles; además, el uso está sujeto a la licencia del modelo base Llama 3.1.
- Caveat de producción: los pesos de mezcla específicos de cada objetivo se suministran por separado, por lo que la reproducibilidad depende de obtenerlos junto con los adaptadores.
- Cero descargas y cero likes en el momento de la consulta: proyecto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/sarubi/AuthorMix
- Paper (arXiv): https://arxiv.org/abs/2603.23069
- Código y instrucciones de entrenamiento: https://github.com/text-adaptation-saar/AuthorMix
- Portfolio del autor (noticias): https://www.sarubi.com/news
