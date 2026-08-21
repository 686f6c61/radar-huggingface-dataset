# DGurgurov/OpenThinker3-7B-SFT-ES

## Resumen

OpenThinker3-7B-SFT-ES es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por Daniil Gurgurov y colaboradores como parte del pipeline de adaptación de razonamiento **ReasonXL**. Se trata de un fine-tuning supervisado (SFT) del modelo base `open-thoughts/OpenThinker-7B`, cuyo objetivo es desplazar el idioma de razonamiento del inglés al español, utilizando el dataset `toroe/ReasonXL-SFT`. Este modelo representa la primera etapa de un proceso de dos fases; la segunda etapa aplica aprendizaje por refuerzo (GRPO) para recuperar la calidad de razonamiento que pueda perderse durante el SFT.

La relevancia de este modelo radica en que aborda un problema poco explorado: la capacidad de razonar en un idioma distinto al inglés sin sacrificar el rendimiento en tareas de razonamiento. Al estar basado en OpenThinker-7B, un modelo de razonamiento de código abierto, hereda sus capacidades generales de razonamiento, matemáticas y código, pero adaptadas para operar en español. La arquitectura subyacente es un transformer de tipo Qwen2, con 7.615.616.512 parámetros totales. La licencia no está especificada en la información disponible, lo que supone una incertidumbre para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors) |
| Idiomas soportados | Español (es) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal. El modelo base `open-thoughts/OpenThinker-7B` es un modelo de razonamiento entrenado con datos de razonamiento de alta calidad, y este fine-tuning aplica SFT sobre él utilizando trazas de razonamiento en español del dataset `toroe/ReasonXL-SFT`. El objetivo es que el modelo genere sus cadenas de razonamiento internas en español, en lugar de en inglés, manteniendo las capacidades de razonamiento del modelo original.

El entrenamiento corresponde a la primera etapa del pipeline ReasonXL, que consta de dos fases: SFT (esta) y RL con GRPO (modelo `DGurgurov/OpenThinker3-7B-SFT-GRPO-ES`). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de optimización empleadas. El modelo base fue entrenado únicamente con SFT, sin RL, según la información del repositorio de OpenThinker3-7B, aunque este fine-tuning específico no aporta más detalles.

## Capacidades

- Razonamiento en español: el modelo está específicamente entrenado para generar cadenas de razonamiento en español, lo que facilita su uso en aplicaciones hispanohablantes.
- Razonamiento general: al derivar de OpenThinker-7B, conserva capacidades de razonamiento lógico, matemático y de resolución de problemas, aunque no se han publicado evaluaciones específicas de este fine-tuning.
- Generación de texto: puede producir explicaciones y respuestas razonadas en español.
- Multilingüismo limitado: aunque el modelo está enfocado al español, al estar basado en un modelo multilingüe (Qwen2), podría conservar cierta capacidad en otros idiomas, pero no está garantizado.
- No se ha confirmado soporte para tool calling, agentes ni capacidades multimodales en la información disponible.

## Casos de uso

- Asistente educativo en español: el modelo puede utilizarse para explicar conceptos matemáticos o científicos paso a paso, generando razonamientos en español que ayuden a estudiantes hispanohablantes a comprender problemas complejos.
- Resolución de problemas matemáticos: en entornos de tutoría o evaluación, puede resolver ejercicios de álgebra, cálculo o lógica mostrando el proceso de razonamiento en español, lo que facilita la verificación por parte de profesores.
- Generación de explicaciones técnicas: para documentación o soporte técnico en español, el modelo puede producir justificaciones detalladas de decisiones de diseño o análisis de código.
- Chatbots de razonamiento: integrado en sistemas conversacionales, puede mantener diálogos multi-turno que requieran deducción lógica o análisis de contexto, siempre que la ventana de contexto sea suficiente (no especificada).
- Análisis de datos y generación de informes: puede procesar datos estructurados y generar conclusiones razonadas en español, útil para analistas que prefieren trabajar en su idioma nativo.
- Investigación en adaptación de razonamiento: sirve como punto de partida para estudiar cómo el SFT afecta al razonamiento en otros idiomas, y como base para la segunda etapa de RL (GRPO) que busca recuperar calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los detalles de evaluación se publicarán próximamente, pero no hay datos concretos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.6B parámetros, en FP16 se necesitan aproximadamente 15 GB de VRAM; en int8 unos 8 GB; en int4 unos 4 GB. Estas son estimaciones generales, no confirmadas por el autor.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB (p. ej., RTX 4090, A100 40GB); para cuantización int4, una GPU de 8 GB (p. ej., RTX 3070/3080) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización adecuada (GGUF o AWQ) puede ejecutarse en GPUs consumer de gama media-alta.
- Opciones de despliegue: al ser un modelo basado en Qwen2, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF, etc.).
- Latencia y throughput: no disponibles; dependerán del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este modelo específico. El modelo base OpenThinker-7B se compara en su repositorio con DeepSeek-R1-Distill-Qwen-7B y Llama-3.1-Nemotron-Nano-8B-v1, superándolos en tareas de razonamiento, pero no hay datos de este fine-tuning en español frente a alternativas. No se puede establecer una comparativa fiable sin datos de evaluación.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial del modelo es incierto; se recomienda contactar con el autor antes de utilizarlo en producción.
- Sesgos y alucinaciones: al ser un fine-tuning de un modelo de razonamiento, puede presentar alucinaciones en tareas de generación libre, y no se han evaluado sesgos específicos en español.
- Limitaciones de contexto: la longitud de contexto no está documentada; es probable que herede la del modelo base (típicamente 32K en Qwen2), pero no está confirmado.
- Idioma: el modelo está optimizado para español; su rendimiento en otros idiomas puede degradarse, especialmente en tareas de razonamiento.
- Sin evaluación publicada: al no haber benchmarks, no se puede garantizar la calidad del razonamiento en español en comparación con otros modelos.
- Dependencia del modelo base: cualquier limitación de OpenThinker-7B (por ejemplo, en razonamiento de código o matemáticas avanzadas) se traslada a este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-ES
- Dataset ReasonXL-SFT: https://huggingface.co/datasets/toroe/ReasonXL-SFT
- Modelo GRPO (segunda etapa): https://huggingface.co/DGurgurov/OpenThinker3-7B-SFT-GRPO-ES
- Modelo base OpenThinker-7B: https://huggingface.co/open-thoughts/OpenThinker-7B
- Paper ReasonXL (arXiv): https://arxiv.org/abs/2604.12378
- Repositorio OpenThinker3-7B (modelo base relacionado): https://huggingface.co/open-thoughts/OpenThinker3-7B
