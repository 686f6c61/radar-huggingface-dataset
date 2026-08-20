# agentic-ptb/opus-max.hNA.sft_cont2.step_300

## Resumen

El modelo `agentic-ptb/opus-max.hNA.sft_cont2.step_300` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning continuado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con aproximadamente 9.400 millones de parámetros. El nombre de la celda, `opus-max`, indica que el proceso de generación de datos o de guiado del entrenamiento fue ejecutado por Claude Code / claude-opus-5 con un nivel de razonamiento máximo (`effort: max`).

Este checkpoint tiene un rol intermedio dentro del pipeline de AgentPTB, un enfoque que utiliza modelos de lenguaje de alto rendimiento como "drivers" para generar datos de entrenamiento o dirigir el proceso de optimización. Su relevancia radica en que documenta una metodología emergente de entrenamiento agéntico, aunque no está pensado para uso directo en producción. Al estar basado en Qwen3.5-9B-Base, hereda la arquitectura transformer de dicha familia, pero no se dispone de información pública sobre la longitud de contexto, licencia o idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer densa. El entrenamiento corresponde a una segunda fase de SFT continuado (`sft_cont2`), ejecutada dentro del framework AgentPTB. Según la model card, el proceso fue dirigido por Claude Code / claude-opus-5 con un nivel de razonamiento máximo, lo que sugiere que los datos de entrenamiento o las señales de supervisión fueron generados o curados por un modelo de alto rendimiento en un bucle agéntico.

El checkpoint se guardó en 4 shards y se recuperó de una copia de seguridad externa (`msr-spare/msr-agentic-ptb-opus-max`). Los tokens EOS configurados son `[248044, 248046]`, marcados como correctos en la documentación. No se especifican detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- No se han documentado capacidades específicas más allá de las heredadas del modelo base Qwen3.5-9B-Base.
- Al ser un fine-tune de un modelo de 9B, se espera que mantenga capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay verificación pública.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de pensamiento extendido.
- El checkpoint está etiquetado como "intermedio", por lo que su comportamiento puede ser incompleto o inestable.

## Casos de uso

- Investigación en metodologías de entrenamiento agéntico: este checkpoint sirve como artefacto de estudio para analizar cómo modelos de alto rendimiento (Claude Opus) pueden guiar el fine-tuning de modelos más pequeños.
- Reproducción de experimentos: los investigadores pueden usar este checkpoint para replicar o continuar el barrido de AgentPTB, comparando resultados entre celdas (por ejemplo, `opus-max` frente a otras configuraciones).
- Análisis de la dinámica de SFT continuado: permite estudiar cómo evoluciona el rendimiento a lo largo de los pasos de entrenamiento (step 150/300) en un pipeline agéntico.
- Desarrollo de pipelines de generación de datos sintéticos: el enfoque de usar un LLM como driver puede inspirar la creación de datasets de entrenamiento para tareas específicas.
- Benchmarking de fine-tunes de Qwen3.5-9B: útil para comparar el efecto de diferentes estrategias de SFT sobre el mismo modelo base.
- Exploración de técnicas de alineación: aunque no hay evidencia de RLHF, el pipeline podría adaptarse para experimentos de alineación supervisada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~9,4 B parámetros, se requieren aproximadamente 19-20 GB en FP16, ~10 GB en int8 y ~5 GB en int4 (estimaciones basadas en el tamaño de parámetros, no verificadas para este checkpoint concreto).
- GPU recomendadas: una RTX 3090/4090 (24 GB) puede ejecutar el modelo en FP16; GPUs con 16 GB (RTX 4080, A5000) requerirían cuantización int8 o int4.
- En GPUs consumer: sí, es viable con cuantización en tarjetas de 12-16 GB (por ejemplo, RTX 3060/4070 con int4).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo si se convierten los pesos a GGUF o se usan los safetensors directamente. No hay documentación específica de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/opus-max (este) | ~9,4 B | No disponible | No disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | ~9,4 B | No disponible (heredado) | No disponible | HuggingFace |
| Otros fine-tunes de Qwen3.5-9B | ~9,4 B | Variable | Variable | Variable |

No se dispone de información suficiente para comparar rendimiento ni capacidades con alternativas concretas. La comparativa se limita al modelo base y a la categoría general de fine-tunes de 9B.

## Limitaciones y advertencias

- Checkpoint intermedio: no está diseñado para uso en producción; puede presentar comportamientos incompletos o inestables.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución sin consultar al autor.
- Sin documentación de sesgos ni de riesgos de alucinación; al ser un fine-tune de un modelo base, hereda los sesgos potenciales de Qwen3.5.
- No hay información sobre la longitud de contexto efectiva ni sobre la calidad de la generación en idiomas distintos del inglés/chino (idiomas típicos de Qwen).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- La model card menciona que el checkpoint fue "podado" de su almacenamiento original y recuperado de una copia de seguridad, lo que podría implicar riesgos de integridad de los pesos.

## Enlaces

- [HuggingFace: agentic-ptb/opus-max.hNA.sft_cont2.step_300](https://huggingface.co/agentic-ptb/opus-max.hNA.sft_cont2.step_300)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (referencia, no verificado)
