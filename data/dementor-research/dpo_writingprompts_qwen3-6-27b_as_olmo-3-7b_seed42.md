# dementor-research/dpo_writingprompts_qwen3.6-27b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adapter LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. El adapter forma parte del estudio de imitación de comportamiento configurado por el proyecto **dementor** de dementor-research, y su objetivo es replicar el estilo de generación de OLMo-3-7B en tareas de escritura basadas en prompts. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, utilizando un rango LoRA de 32 y aplicando la adaptación a todas las capas lineales del modelo base.

Se trata de un modelo de tipo adapter (no un modelo completo), con un tamaño de repositorio de 1 GB, lo que sugiere que contiene los pesos del adaptador en formato safetensors. Al ser un componente de un estudio más amplio (la campaña menciona 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas), este adapter es un artefacto de investigación más que un modelo listo para producción. No se proporcionan detalles sobre el dataset de entrenamiento, la licencia, los idiomas soportados ni los resultados de evaluación, por lo que su uso práctico requiere verificar esos aspectos con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (sobre base transformer Qwen3.6-27B) |
| Parametros totales | no disponible (el adapter ocupa ~1 GB, el base tiene 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors del adapter) |
| Idiomas soportados | no disponible (depende del base, no se especifica) |
| Licencia | no disponible (ni del adapter ni del base en la model card) |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adapter LoRA de rango 32 que se aplica a todas las capas lineales del modelo base `Qwen/Qwen3.6-27B`. El entrenamiento se realizó mediante DPO (Direct Preference Optimization), una técnica que optimiza el modelo para preferir respuestas elegidas frente a rechazadas, en lugar de un simple fine-tuning supervisado. El objetivo declarado es la imitación de comportamiento (behavioral imitation) del modelo OLMo-3-7B en tareas de escritura con prompts.

No se proporcionan detalles sobre el dataset de entrenamiento (composición, número de ejemplos, idioma) ni sobre el proceso de recopilación de preferencias. Tampoco se indica si hubo etapas adicionales como SFT previo o RLHF. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, que permite configurar campañas de experimentación; en este caso, la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa. La configuración exacta está disponible en el archivo `config.yaml` del release de código, pero no se incluye en el repositorio.

## Capacidades

- Generación de texto: al ser un adapter sobre Qwen3.6-27B, hereda las capacidades de generación de lenguaje del modelo base, pero no se han documentado capacidades específicas del adapter.
- Imitación de estilo: el propósito declarado es imitar el comportamiento de OLMo-3-7B en escritura con prompts, por lo que se espera que el adapter ajuste el estilo de salida hacia el del modelo imitado.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades especiales.

## Casos de uso

- Investigación en imitación de comportamiento: el adapter es útil para estudiar cómo un modelo grande (27B) puede ajustarse para replicar el estilo de un modelo más pequeño (7B) mediante DPO, lo que puede servir para análisis de transferencia de estilo y comprensión de la alineación.
- Experimentación con DPO y LoRA: como artefacto de un estudio sistemático, puede utilizarse como referencia para comparar configuraciones de entrenamiento (rango, datasets, seeds) en pipelines de investigación.
- Generación de escritura creativa con prompts: si el dataset de entrenamiento incluye prompts de escritura, el adapter podría emplearse para generar textos con un estilo similar al de OLMo-3-7B, aunque no se han publicado ejemplos ni evaluaciones.
- Fine-tuning posterior: el adapter puede servir como punto de partida para otros experimentos de DPO o para combinar con otros adapters, dado que es un componente LoRA independiente.
- Análisis de sesgos en imitación: al comparar las salidas del adapter con las del modelo base y el modelo imitado, se pueden estudiar sesgos introducidos por el proceso de imitación.
- Reproducibilidad de estudios: dado que se especifican el seed y la configuración, el adapter permite reproducir los resultados del estudio dementor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adapter.

## Requisitos de hardware

- Al ser un adapter LoRA, los requisitos de hardware dependen del modelo base `Qwen/Qwen3.6-27B`. Para cargar el modelo completo se necesitan aproximadamente 54 GB de VRAM en precisión fp16 (27B parámetros × 2 bytes), o menos con cuantización.
- El adapter en sí ocupa ~1 GB y puede cargarse junto al base. En la práctica, se requiere una GPU con al menos 24 GB de VRAM para inferencia en fp16 con el modelo base, o GPUs como A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantización.
- Para despliegue, se puede usar el stack de Hugging Face Transformers con PEFT, o exportar el modelo combinado a formatos como GGUF para llama.cpp u Ollama, aunque no se proporcionan instrucciones específicas.
- No se dispone de datos de latencia o throughput para este adapter.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adapters de imitación de comportamiento. El modelo base Qwen3.6-27B es comparable en tamaño a otros modelos de 27B como Llama-3-27B (si existiera) o Mistral-7B, pero no se han publicado métricas que permitan una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- No se especifica la licencia del adapter ni del modelo base, por lo que su uso comercial requiere consultar con el autor y verificar la licencia de Qwen3.6-27B.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Al ser un adapter de imitación, podría heredar sesgos del dataset de preferencias utilizado en DPO.
- El modelo es un artefacto de investigación, no un producto final. No se han publicado evaluaciones de calidad ni pruebas de robustez.
- El adapter está diseñado para imitar a OLMo-3-7B en tareas de escritura; su comportamiento fuera de ese dominio no está garantizado.
- La ausencia de documentación sobre el dataset de entrenamiento impide evaluar la cobertura de temas, idiomas o estilos.
- Para producción, se recomienda validar el comportamiento del adapter en el caso de uso específico y considerar la posibilidad de alucinaciones o degradación de rendimiento en tareas no relacionadas con la escritura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_olmo-3-7b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.6-27B (no verificado en la búsqueda, pero indicado en la model card)
