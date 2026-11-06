# AFDSA18/ZeroIndex

## Resumen

ZeroIndex es un ajuste fino (fine-tune) del modelo abierto `openai/gpt-oss-120b` publicado por el usuario AFDSA18 en Hugging Face. Se presenta como un modelo orientado a código y chat, entrenado sobre el dataset `armand0e/claude-fable-5-claude-code`, lo que sugiere un enfoque en tareas de generación y asistencia de programación. Al derivar de gpt-oss-120b, hereda la arquitectura Mixture-of-Experts (MoE) de la familia GPT-OSS de OpenAI, aunque el autor no documenta cambios estructurales sobre la base.

La relevancia del modelo es limitada por su escasa documentación: la model card es prácticamente un frontmatter YAML sin explicación de metodología, datos de entrenamiento, hiperparámetros ni evaluación. El modelo declara soporte únicamente para turco (`tr`), lo que restringe su uso en entornos en castellano o inglés sin verificación empírica previa. Con cero descargas y cero likes en el momento de la consulta, no hay evidencia de validación por parte de la comunidad.

En la práctica, ZeroIndex debe tratarse como un experimento de fine-tuning sobre GPT-OSS-120B más que como un modelo listo para producción. Cualquier evaluación de sus capacidades reales requiere pruebas propias, ya que no se han publicado benchmarks ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (heredada de openai/gpt-oss-120b; no detallada por el autor) |
| Parametros totales | 120B (heredados de la base; no confirmado explícitamente por el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (`tr`) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica safetensors ni otros) |

## Arquitectura y entrenamiento

El autor no describe la arquitectura en la model card. Por herencia del modelo base `openai/gpt-oss-120b`, se trata de un transformer con capas Mixture-of-Experts, pero ZeroIndex no documenta ni el número de parámetros activos, ni la distribución de expertos, ni si se ha modificado la tokenización o el vocabulario para el turco. Tampoco se indica si el fine-tuning fue completo (full fine-tune) o mediante técnicas parametrizadas como LoRA/QLoRA.

El único dato sobre entrenamiento es el dataset utilizado: `armand0e/claude-fable-5-claude-code`. No se especifica el número de tokens, la composición del corpus, si hubo etapas de SFT, RLHF o DPO, ni la duración o el hardware empleado. La ausencia de esta información impide reproducir el ajuste o evaluar su calidad metodológica. Tampoco se documentan innovaciones técnicas propias.

## Capacidades

- Generación de texto y chat conversacional (declarado en los tags).
- Generación y asistencia de código (tag `code`), presumiblemente orientada al estilo de los datos de entrenamiento.
- Soporte multilingüe limitado al turco según la metadata; no se declara inglés ni castellano.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades matemáticas ni de razonamiento de forma específica.

## Casos de uso

- Asistencia de código en turco: el modelo puede emplearse para autocompletar o explicar fragmentos de código con comentarios y documentación en turco, aprovechando el dataset de entrenamiento orientado a código.
- Chat técnico en turco: atención a desarrolladores turcoparlantes en foros o herramientas internas, siempre que se validen previamente las respuestas por la falta de benchmarks.
- Prototipado de pipelines de generación de código: útil como base para experimentos internos de fine-tuning adicional sobre código, dado que parte de un modelo de 120B con licencia MIT.
- Investigación sobre fine-tuning de GPT-OSS: sirve como caso de estudio de ajuste sobre `gpt-oss-120b` con un dataset específico de código.
- Generación de documentación técnica en turco: redacción de READMEs y comentarios de código a partir de fragmentos fuente.
- Traducción técnica asistida turco-inglés en contextos de programación: uso exploratorio, sujeto a verificación manual por la falta de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación del autor. Como referencia, un modelo de 120B en precisión BF16 requiere del orden de 240 GB de VRAM; en cuantizaciones de 4 bits, aproximadamente 60-70 GB, aunque estas cifras son estimaciones generales para modelos de ese tamaño y no han sido verificadas para ZeroIndex.
- GPU recomendadas: no especificadas por el autor; para un modelo de 120B serían necesarios múltiples aceleradores (por ejemplo, varios A100/H100) o cuantización agresiva en GPUs con suficiente memoria.
- ¿Cabe en GPU de consumo? No hay datos oficiales; un modelo de 120B no cabe en una única GPU de consumo en precisión completa y requeriría cuantización y posiblemente offloading.
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama, TGI no aparecen en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZeroIndex (AFDSA18) | 120B (heredados) | no disponible | MIT | Hugging Face, 0 descargas | Fine-tune de gpt-oss-120b sobre dataset de código; solo turco declarado |
| openai/gpt-oss-120b | 120B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Base oficial de OpenAI; documentación y evaluación públicas |
| Alternativas de 120B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para comparar con otros modelos de la misma categoría |

## Limitaciones y advertencias

- Documentación mínima: la model card no incluye metodología, hiperparámetros, evaluación ni instrucciones de uso, lo que dificulta su reproducibilidad y su adopción en producción.
- Idioma: solo se declara turco; el rendimiento en castellano o inglés no está verificado y podría degradarse respecto al modelo base.
- Sesgos: no documentados; al derivar de gpt-oss-120b y de un dataset específico, puede heredar sesgos del corpus de código y de la base.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas de robustez, no hay garantías sobre la fiabilidad de las respuestas.
- Licencia MIT: permite uso comercial, pero el autor no aclara si los pesos derivados respetan las condiciones del modelo base `openai/gpt-oss-120b`; conviene revisar la licencia del modelo base antes de un uso comercial.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso real ni de reportes de calidad.
- Formato de pesos no especificado: puede requerir conversión manual para su despliegue con herramientas estándar.

## Enlaces

- Hugging Face: https://huggingface.co/AFDSA18/ZeroIndex
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
