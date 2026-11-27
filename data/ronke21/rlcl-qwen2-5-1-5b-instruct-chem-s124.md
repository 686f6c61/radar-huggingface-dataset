# ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s124

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s124` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario ronke21 en Hugging Face. Se trata de un modelo conversacional de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5 de Alibaba. El sufijo "chem" sugiere una especialización en el dominio de química, y "rlcl" apunta a una técnica de ajuste relacionada con el olvido catastrófico (catastrophic forgetting), probablemente mediante regularización o consolidación de pesos. El tag "lora-merged" indica que el modelo se obtuvo fusionando un adaptador LoRA con los pesos del modelo base, mientras que "forgetting" refuerza la hipótesis de que el entrenamiento buscó preservar las capacidades originales del modelo base.

El modelo se distribuye en formato safetensors y es compatible con transformers y text-generation-inference. Su relevancia es limitada en el ecosistema actual: se trata de un experimento académico o de investigación con cero descargas y cero "likes" en el momento de la consulta, y su acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de poder descargarlo. No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento utilizados.

La ficha se ha elaborado exclusivamente con la información disponible en la página de Hugging Face y en los metadatos del repositorio. Cualquier dato no confirmado se indica explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con un corpus multilingüe y posteriormente alineado mediante instrucciones. Sobre esta base, el autor aplicó un ajuste fino con LoRA y fusionó el adaptador resultante en los pesos finales ("lora-merged"), lo que da lugar a un checkpoint estándar de transformers sin necesidad de cargar adaptadores adicionales.

El tag "rlcl" y el tag "forgetting" sugieren que el entrenamiento incorporó alguna técnica de mitigación del olvido catastrófico, posiblemente una variante de regularización o consolidación de pesos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las hiperparámetros del ajuste. El sufijo "chem" indica una especialización en química, pero no se detalla qué tipo de datos químicos se emplearon (publicaciones, reacciones, propiedades moleculares, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat.
- Presunta especialización en dominio químico (por el sufijo "chem"), aunque no se documenta el alcance ni la profundidad de dicha especialización.
- Soporte de tool calling y function calling: no confirmado para este fine-tuning; el modelo base Qwen2.5 lo soporta, pero no hay evidencia de que se haya preservado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero no se especifica qué idiomas se conservan.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Extracción de información química de textos científicos: el modelo podría emplearse para identificar compuestos, reacciones y propiedades en publicaciones, aprovechando su presunta especialización en química. No obstante, al no documentarse el dataset de entrenamiento, su fiabilidad en este dominio es incierta.
- Asistencia en la redacción de fichas técnicas y resúmenes de seguridad de sustancias: un modelo de 1,5B parámetros puede generar borradores de documentos estructurados, aunque requeriría validación humana por el riesgo de alucinación en datos numéricos y normativos.
- Prototipado rápido de chatbots de dominio: al ser un modelo pequeño (3,1 GB en safetensors), puede desplegarse en entornos con recursos limitados para experimentar con asistentes conversacionales especializados en química.
- Investigación sobre olvido catastrófico: el modelo es útil como caso de estudio para evaluar técnicas de retención de conocimiento tras un fine-tuning de dominio, comparando su rendimiento en tareas generales frente al modelo base.
- Generación de preguntas y respuestas educativas: podría emplearse para crear material de estudio de química a nivel introductorio, con revisión posterior por parte de expertos.
- Filtrado y clasificación de textos químicos: integrado en pipelines de procesamiento de lenguaje natural, el modelo podría clasificar documentos o extraer entidades, aunque su tamaño limita la precisión frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (aunque no se publican cuantizaciones oficiales en el repo).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4, A100, H100). Para cuantizaciones de 4 bits, es viable en GPUs con 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares, siempre que se use fp16 o cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag "text-generation-inference"), y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas). vLLM es compatible con la arquitectura Qwen2, aunque no se confirma para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend. En una RTX 4090, un modelo de 1,5B en fp16 puede superar los 100 tokens/s en generación, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s124 | 1,54B | no disponible | no disponible | Gated, 0 descargas | Fine-tuning químico con LoRA fusionado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 (según el modelo base) | Público, ampliamente usado | Modelo base, alineado con instrucciones |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Público, gated | Alternativa de tamaño similar, multilingüe |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Público | Enfocado en eficiencia y despliegue en dispositivo |

La comparativa se basa en datos públicos de los modelos alternativos; para el modelo objeto de la ficha, varios campos no están disponibles. El modelo de ronke21 no ofrece ventajas documentadas frente al modelo base Qwen2.5-1.5B-Instruct, salvo la presunta especialización química, que no está cuantificada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, que no se detalla.
- Riesgo de alucinación: alto en dominios especializados como química, especialmente en datos numéricos, fórmulas y referencias normativas; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: se desconoce si el fine-tuning redujo la ventana de contexto o los idiomas soportados respecto al modelo base.
- Restricciones de licencia para uso comercial: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. El acceso es restringido (gated), lo que añade una barrera adicional.
- Caveats para producción: el modelo tiene cero descargas y cero "likes", sin documentación de entrenamiento ni benchmarks; no se recomienda su uso en producción sin una evaluación exhaustiva previa. La fusión de LoRA puede haber degradado capacidades generales del modelo base (olvido catastrófico), y no hay evidencia de que se haya mitigado con éxito.
- El repositorio no incluye tarjeta de modelo detallada, dataset, ni instrucciones de uso; la reproducibilidad es nula.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-chem-s124
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
