# huyngo3113/lab21-2A202601926-qwen35-triage-vi

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) denominado `lab21-2A202601926-qwen35-triage-vi`, publicado por el usuario huyngo3113. Se trata de un ajuste fino por supervisión (SFT) sobre el modelo base `unsloth/Qwen3.5-4B`, utilizando las librerías PEFT y TRL de Hugging Face. El nombre sugiere que el adaptador está orientado a tareas de "triage" (clasificación o priorización de incidencias) en vietnamita, aunque no se proporciona ninguna descripción funcional en la model card.

La model card está prácticamente vacía: solo contiene placeholders genéricos y no ofrece información sobre el dataset de entrenamiento, los hiperparámetros, el rendimiento o las capacidades específicas. El repositorio tiene 0 descargas y 0 likes, y fue creado en agosto de 2026. A pesar de la falta de documentación, el uso de un modelo base de la serie Qwen3.5 (un modelo de lenguaje de 4B parámetros) sugiere que el adaptador hereda las capacidades generales de razonamiento y generación de texto de dicha familia, pero no hay datos verificables al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `unsloth/Qwen3.5-4B` (arquitectura del base no documentada) |
| Parametros totales | No disponible (el adaptador pesa 0.1 GB, el base se estima en ~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base, probablemente 32K o similar, sin confirmar) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (el nombre sugiere vietnamita, pero sin confirmación) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) usando la librería TRL de Hugging Face. El modelo base es `unsloth/Qwen3.5-4B`, una versión optimizada por Unsloth del modelo Qwen3.5 de 4B parámetros. No se especifican los detalles de la arquitectura del base, ni el dataset utilizado, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El único dato técnico concreto es que se usó PEFT versión 0.20.0. La ausencia de hiperparámetros de entrenamiento impide cualquier análisis sobre la metodología empleada.

## Capacidades

No se dispone de información verificada sobre las capacidades específicas del adaptador. Dado que se basa en Qwen3.5-4B, es razonable esperar que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay evidencia documentada. El nombre "triage-vi" apunta a una especialización en clasificación o priorización de textos en vietnamita, pero no se confirma.

- Generación de texto: no documentada, probablemente heredada del modelo base.
- Razonamiento: no documentado.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no confirmadas, aunque el sufijo "vi" sugiere enfoque en vietnamita.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

Al no existir documentación, los casos de uso son hipotéticos y deben tomarse con cautela. Basándose en el nombre del repositorio, se pueden plantear escenarios plausibles, pero sin garantía de funcionamiento real:

- Clasificación de tickets de soporte en vietnamita: el adaptador podría utilizarse para categorizar y priorizar incidencias de atención al cliente, aprovechando el ajuste fino sobre un modelo base de 4B que puede ejecutarse en hardware moderado.
- Análisis de sentimiento en textos cortos en vietnamita: si el entrenamiento incluyó datos de opiniones o reseñas, podría servir para detectar polaridad en comentarios.
- Etiquetado de documentos legales o médicos: tareas de triage suelen implicar asignación de etiquetas o niveles de urgencia; un adaptador SFT podría facilitar esta labor.
- Filtrado de contenido en foros o redes sociales: clasificar mensajes como spam, ofensivos o relevantes.
- Enrutamiento de consultas en sistemas de mensajería: asignar conversaciones a departamentos específicos según su contenido.
- Asistente virtual para atención al cliente en vietnamita: integrado en un chatbot para responder preguntas frecuentes o derivar casos complejos.

En todos los casos, es imprescindible validar el comportamiento del adaptador con datos reales antes de usarlo en producción, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este adaptador. Tampoco se comparan con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

Al tratarse de un adaptador LoRA, el requisito principal es el modelo base `unsloth/Qwen3.5-4B`. Las estimaciones se basan en el tamaño típico de un modelo de 4B parámetros, pero no hay datos oficiales.

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 8 GB de VRAM; con cuantización a 4 bits puede bajar a unos 3-4 GB. El adaptador añade una carga mínima (0.1 GB).
- GPU recomendadas: una RTX 3090, RTX 4090 o similar con 12-24 GB sería suficiente para ejecutar el modelo en FP16. GPUs con menos VRAM (8 GB) pueden usar cuantización.
- ¿Cabe en GPU de consumo? Sí, un modelo de 4B es adecuado para GPUs de consumo modernas, especialmente con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft`. También puede convertirse a GGUF para usarse con llama.cpp u Ollama, o servirse con vLLM o TGI si se fusiona con el base.
- Latencia y throughput: no disponibles. En una RTX 4090, un modelo de 4B suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación genérica sin validación para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El único dato conocido es que el adaptador se basa en Qwen3.5-4B, pero no hay métricas de rendimiento propias. Como referencia de la serie, Qwen ha publicado Qwen3.5-397B-A17B (un modelo MoE de 397B con 17B activos), pero no es comparable en tamaño ni en propósito. No se puede comparar con otros adaptadores de triage en vietnamita por falta de datos.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| huyngo3113/lab21-... (este) | ~4B (base) | no disponible | no disponible | Adaptador LoRA, sin benchmarks |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | no disponible | Modelo base de la serie, mucho mayor |

## Limitaciones y advertencias

- La model card no contiene ninguna información sobre sesgos, riesgos o limitaciones. Se desconoce por completo el comportamiento del adaptador.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluación, no se puede cuantificar.
- Limitaciones de idioma: aunque el nombre sugiere vietnamita, no hay confirmación de los idiomas soportados ni de la calidad en otros idiomas.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial es incierto. Se debe contactar al autor antes de cualquier despliegue productivo.
- El adaptador no ha sido validado: 0 descargas y 0 likes indican que no hay comunidad que lo haya probado. Su uso en producción conlleva un alto riesgo.
- Dependencia del modelo base: el comportamiento final depende de `unsloth/Qwen3.5-4B`, cuyas características tampoco están documentadas en este repositorio.
- No se proporciona código de inferencia ni ejemplos de uso, lo que dificulta la integración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huyngo3113/lab21-2A202601926-qwen35-triage-vi
- Perfil GitHub del autor: https://github.com/huyngo3113
- Blog oficial de Qwen sobre la serie 3.5: https://qwen.ai/blog?id=qwen3.5
