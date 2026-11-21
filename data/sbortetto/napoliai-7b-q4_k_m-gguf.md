# sbortetto/napoliAI-7B-Q4_K_M-GGUF

## Resumen

napoliAI-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado a la conversación en dialecto napolitano. Lo desarrolla sbortetto, un autor independiente, y se distribuye principalmente como cuantización GGUF Q4_K_M para inferencia local. El objetivo es que el modelo comprenda y genere respuestas en napolitano auténtico, con un registro informal y coloquial, manteniendo el inglés y el italiano como idiomas de soporte.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales, y hereda la ventana de contexto de 32.768 tokens de la familia Qwen2.5, aunque la model card no detalla explícitamente este dato para el fine-tune. Se publica bajo licencia Apache 2.0 y en formato GGUF cuantizado, lo que permite ejecutarlo en CPU y en GPU de consumo sin requisitos de hardware elevados.

Su relevancia es acotada pero clara: cubre un nicho lingüístico poco representado en los modelos generalistas, el napolitano, con una elección estilística deliberada de registro coloquial y expresiones malsonantes. No es un modelo para tareas de precisión, sino para conversación, preservación cultural y experimentación con dialectos minoritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), fine-tune de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (esta publicación); el autor menciona Q6 y Q8 disponibles |
| Idiomas soportados | napolitano (nap), italiano (it); el modelo base añade inglés y otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-7B-Instruct, un transformer denso de 7.615.616.512 parámetros. No se trata de una arquitectura nueva ni de un modelo MoE: la innovación está en el ajuste sobre datos en napolitano. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente indica que fue creado y fine-tuneado por sbortetto para capturar el registro coloquial napolitano.

La publicación principal es una cuantización GGUF Q4_K_M, pensada para inferencia local en CPU y GPU de consumo. El autor señala que existen cuantizaciones Q6 y Q8, y advierte que el modelo no es perfecto y puede equivocarse. También insiste en la importancia de usar el system prompt recomendado al desplegarlo con Ollama, ya que el comportamiento dialéctico depende en gran medida de esa instrucción de sistema.

## Capacidades

- Generación de texto conversacional en dialecto napolitano, con registro informal, directo y a veces malsonante por elección estilística.
- Comprensión de italiano y napolitano en la conversación; el modelo base aporta además capacidades en inglés y otros idiomas.
- Conversación multi-turno con plantilla ChatML (etiquetas `<|im_start|>` y `<|im_end|>`), compatible con presets de Qwen en LM Studio.
- Razonamiento y conocimiento general heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling heredado del modelo base, aunque no se documenta su fiabilidad en napolitano.
- Capacidades de código y matemáticas heredadas del modelo base, no evaluadas específicamente en este fine-tune.
- Capacidad de preservación y reproducción de expresiones culturales napolitanas (referencias a la pizza, a Maradona, a la vida de barrio).

## Casos de uso

- Chatbot conversacional en napolitano: el modelo mantiene diálogos multi-turno con plantilla ChatML y responde en dialecto, adecuado para aplicaciones de entretenimiento o divulgación cultural.
- Preservación lingüística y divulgación: útil para generar ejemplos de napolitano coloquial, material didáctico o demostraciones de dialectos minoritarios en proyectos de humanidades digitales.
- Asistentes locales sin conexión: al distribuirse en GGUF Q4_K_M, puede ejecutarse en portátiles y CPU modernas mediante LM Studio u Ollama, sin depender de la nube.
- Prototipado rápido de aplicaciones dialectales: sirve como base para experimentar con interfaces de voz o texto en napolitano antes de invertir en un modelo mayor.
- Investigación sobre sesgos y registro: permite estudiar cómo un fine-tune sobre un dialecto informal reproduce expresiones coloquiales y malsonantes, y evaluar filtros de contenido.
- Contenido creativo y humor: generación de diálogos, guiones o respuestas con tono napolitano para proyectos de ocio, siempre con revisión humana.
- Demostraciones educativas de fine-tuning: ejemplo práctico de cómo adaptar un modelo de 7B a una lengua minoritaria con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M de un modelo de 7.6B parámetros ocupa aproximadamente 4-5 GB de pesos, por lo que cabe en GPU con 6-8 GB de VRAM; el autor indica que funciona en CPU modernas y portátiles.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en entornos profesionales, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más; también en CPU.
- Opciones de despliegue: LM Studio (recomendado por el autor), Ollama (con el Modelfile y el system prompt indicados), llama.cpp y otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| napoliAI-7B Q4_K_M | 7.615.616.512 | no disponible (base: 32.768) | nap, it | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct (base) | 7.615.616.512 | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF |
| Modelos generalistas de 7B | ~7B | variable | multilingüe | variable | variable |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de napoliAI-7B con alternativas de la misma categoría. La comparación con Qwen2.5-7B-Instruct es directa por ser su modelo base, pero el fine-tune está especializado en napolitano y no se han publicado métricas de calidad dialectal.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no es perfecto y puede equivocarse.
- Registro deliberadamente informal y malsonante: incluye expresiones como "cazzo", "minchia" o "porca miseria"; no es apto para entornos profesionales sin filtrado.
- No debe usarse para consejos médicos, legales o financieros, según indica la model card.
- Riesgo de alucinación inherente a los modelos de 7B, agravado por la escasez de datos de entrenamiento en napolitano.
- El comportamiento dialéctico depende fuertemente del system prompt; sin él, el modelo puede responder en italiano estándar.
- Cobertura limitada de idiomas: napolitano e italiano como focos principales; el resto de idiomas depende del modelo base y no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y su adecuación cultural recae en el usuario.
- No hay información publicada sobre sesgos específicos, evaluación de seguridad ni métricas de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbortetto/napoliAI-7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- Discord del autor: https://discord.com/users/1356965681081356470
- Apoyo al proyecto: https://ko-fi.com/sbortetto
