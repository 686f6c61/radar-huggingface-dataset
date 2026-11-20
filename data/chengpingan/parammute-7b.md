# chengpingan/ParamMute-7B

## Resumen

ParamMute-7B es un checkpoint histórico publicado originalmente como PIP-KAG-7B, asociado a la primera versión del preprint arXiv 2502.15543 y posteriormente publicado en NeurIPS 2025 bajo el nombre ParamMute. Lo desarrolla un equipo de investigación encabezado por Pengcheng Huang (con autores de Tsinghua University, Northeastern University y OpenBMB, entre otras instituciones) y se distribuye bajo licencia MIT. El modelo parte de meta-llama/Meta-Llama-3-8B, aunque el identificador del repositorio lo etiqueta como "7B".

El problema que aborda es la infidelidad en generación aumentada por recuperación (RAG): los LLM tienden a ignorar o contradecir el contexto recuperado y a responder desde su conocimiento paramétrico. ParamMute propone suprimir las capas FFN de profundidad media a profunda que se sobreactivan ante conocimiento crítico, de modo que el modelo pase a apoyarse en la evidencia recuperada. Este checkpoint corresponde a la configuración temprana del trabajo; la versión final del proyecto publica checkpoints separados de SFT y KTO sobre una base de 8B.

Es relevante para investigadores que trabajan en fidelidad de RAG, edición de conocimiento y análisis de circuitos internos de transformers, más que como modelo de propósito general para producción, dado que se trata de un artefacto de investigación con un pipeline no especificado y sin datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Meta-Llama-3-8B, con supresión selectiva de capas FFN) |
| Parametros totales | no disponible (el identificador indica 7B; el modelo base es Meta-Llama-3-8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre Meta-Llama-3-8B, un transformer decoder-only con atención causal estándar. La innovación de ParamMute no está en la arquitectura base sino en la intervención sobre ella: se identifican y suprimen (muten) las capas FFN de profundidad media a profunda que se sobreactivan cuando el modelo recurre a conocimiento paramétrico crítico, con el objetivo de forzar que la generación se apoye en el contexto recuperado en lugar de en la memoria interna. El repositorio GitHub del proyecto (OpenBMB/ParamMute) describe este mecanismo como supresión de FFNs críticas para el conocimiento.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni la presencia de fases de RLHF o DPO en este checkpoint concreto. La model card indica que este es el checkpoint histórico de la primera versión de arXiv y que la documentación actual del proyecto describe la release posterior, que incluye checkpoints de SFT y KTO sobre una base de 8B, junto con datos de entrenamiento publicados (ParamMute-Training-Data) y un benchmark de evaluación propio (CoFaithfulQA).

## Capacidades

- Generación de texto en inglés, heredada de la base Llama-3-8B.
- Generación aumentada por recuperación (RAG) con fidelidad reforzada al contexto recuperado, que es el objetivo central del método.
- Mitigación de respuestas basadas en conocimiento paramétrico cuando contradice la evidencia recuperada.
- Razonamiento y conocimiento general en la medida en que lo conserva la base Llama-3-8B tras la intervención.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en fidelidad de RAG: el modelo sirve como sujeto de experimentación para medir hasta qué punto la supresión de FFNs reduce las alucinaciones frente a evidencia recuperada, usando el benchmark CoFaithfulQA del propio proyecto.
- Evaluación comparativa de métodos de atribución: útil para contrastar ParamMute con técnicas alternativas (por ejemplo, prompting de "responde solo con el contexto" o fine-tuning sobre datos de fidelidad) en pipelines de QA sobre documentos.
- Análisis de circuitos internos: permite estudiar qué capas FFN concentran el conocimiento paramétrico crítico y cómo afecta su supresión a la perplejidad y a la calidad de la generación.
- Reproducción de resultados académicos: adecuado para replicar los experimentos de la primera versión de arXiv 2502.15543 con el checkpoint exacto empleado entonces.
- Sistemas de QA documental en inglés con requisito de trazabilidad: en escenarios donde la respuesta debe ceñirse a los pasajes recuperados (normativa interna, documentación técnica), el modelo reduce la tendencia a responder desde memoria.
- Generación de resúmenes anclados a fuentes: para tareas de síntesis sobre corpus recuperados donde se penaliza la introducción de datos no presentes en las fuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB para un modelo de 8B de parámetros; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones genéricas para el tamaño de la base, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala y lotes amplios; RTX 4090 (24 GB) suficiente para inferencia en BF16 de un modelo de 8B.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización, aunque no se distribuyen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParamMute-7B | no disponible (base 8B) | no disponible | Supresión de FFN para fidelidad en RAG | MIT | Hugging Face (chengpingan/ParamMute-7B) |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 tokens | LLM base de propósito general | Llama 3 Community License | Hugging Face |
| ParamMute-8B-SFT | no disponible | no disponible | Checkpoint final con SFT del mismo proyecto | no disponible en la información | Hugging Face (chengpingan/ParamMute-8B-SFT) |
| ParamMute-8B-KTO | no disponible | no disponible | Checkpoint final con KTO del mismo proyecto | no disponible en la información | Hugging Face (chengpingan/ParamMute-8B-KTO) |

## Limitaciones y advertencias

- Es un checkpoint histórico de investigación: la model card remite a la documentación actual del proyecto para la release final, por lo que puede no reproducir los resultados de la versión publicada en NeurIPS 2025.
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: aunque el método busca reducirla en contextos RAG, la supresión de FFNs puede degradar el conocimiento paramétrico y producir respuestas incompletas o menos precisas fuera de tareas con contexto recuperado.
- La intervención sobre capas FFN puede afectar negativamente a tareas que dependen fuertemente de conocimiento memorizado (trivia, QA cerrado), no evaluado en la información disponible.
- Sesgos: no documentados, pero hereda los sesgos de Meta-Llama-3-8B y de sus datos de entrenamiento.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial; sin embargo, al derivar de Meta-Llama-3-8B conviene verificar la compatibilidad con los términos de la Llama 3 Community License antes de un despliegue comercial.
- Sin datos publicados de benchmarks, contexto máximo ni cuantizaciones oficiales: no recomendable para producción sin una evaluación propia previa.
- El repositorio registra 0 descargas, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- [Hugging Face: chengpingan/ParamMute-7B](https://huggingface.co/chengpingan/ParamMute-7B)
- [arXiv 2502.15543](https://arxiv.org/abs/2502.15543)
- [NeurIPS 2025 proceedings (DOI)](https://doi.org/10.52202/085713-3356)
- [GitHub: OpenBMB/ParamMute](https://github.com/OpenBMB/ParamMute)
- [Página del proyecto](https://passionate11.github.io/ParamMute-project-page/)
- [Dataset de entrenamiento: ParamMute-Training-Data](https://huggingface.co/datasets/chengpingan/ParamMute-Training-Data)
- [Benchmark CoFaithfulQA](https://huggingface.co/datasets/chengpingan/CoFaithfulQA)
- [Checkpoint SFT: chengpingan/ParamMute-8B-SFT](https://huggingface.co/chengpingan/ParamMute-8B-SFT)
- [Checkpoint KTO: chengpingan/ParamMute-8B-KTO](https://huggingface.co/chengpingan/ParamMute-8B-KTO)
- [Modelo base: meta-llama/Meta-Llama-3-8B](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
