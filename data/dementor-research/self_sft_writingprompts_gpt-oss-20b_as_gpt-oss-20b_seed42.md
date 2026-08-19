# dementor-research/self_sft_writingprompts_gpt-oss-20b_as_gpt-oss-20b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante la etapa SELF_SFT sobre el modelo base `openai/gpt-oss-20b`, como parte del estudio de imitación conductual "dementor" de dementor-research. El adaptador se generó con el framework Tinker de Thinking Machines, con rango 32 y `target_modules=all-linear`, sobre un dataset de writing prompts. La campaña completa incluye 12 modelos, 4 datasets y 1 semilla, lo que produce 48 celdas configuradas para esta etapa de entrenamiento.

Se trata de un artefacto de investigación, no de un modelo de producción: su propósito es estudiar cómo un modelo puede imitar el comportamiento de otro (en este caso, el propio gpt-oss-20b) mediante auto-SFT con LoRA. El adaptador pesa aproximadamente 1 GB y se distribuye en formato safetensors compatible con la librería PEFT.

La relevancia de este adaptador reside en su metodología: SELF_SFT es una técnica de imitación conductual que entrena al modelo sobre sus propias salidas o sobre salidas de referencia, un enfoque útil para estudiar alineación, destilación y comportamiento emergente en modelos abiertos. Al estar basado en gpt-oss-20b, hereda las capacidades del modelo base (razonamiento, generación de código, tool calling), aunque las especificaciones concretas del adaptador (licencia, idiomas, cuantizaciones) no están documentadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre gpt-oss-20b (MoE transformer) |
| Parametros totales | no disponible (adaptador ~1 GB en disco; base: 20.9 B) |
| Parametros activos | no disponible (base: ~3.6 B activos por token) |
| Longitud de contexto | hereda la del modelo base: 131.072 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp32/bf16 safetensors; el base admite cuantizaciones habituales) |
| Idiomas soportados | no disponible (heredados del modelo base, que es multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 32 aplicado a todos los módulos lineales (`target_modules=all-linear`) del modelo base `openai/gpt-oss-20b`. El modelo base es un transformer de mezcla de expertos (MoE) con aproximadamente 20.9 mil millones de parámetros totales y unos 3.6 mil millones activos por token, entrenado por OpenAI sobre unos 5.5 billones de tokens. La etapa de entrenamiento se denomina SELF_SFT, una variante de fine-tuning supervisado orientada a la imitación conductual: el modelo aprende a replicar el comportamiento de una referencia (en este caso, el propio gpt-oss-20b) sobre un dataset de writing prompts.

El entrenamiento se realizó con el framework Tinker de Thinking Machines. La campaña "dementor" está definida por configuración: 12 modelos, 4 datasets y 1 semilla, lo que genera 48 celdas experimentales para esta etapa. Los hiperparámetros exactos de la cohorte se documentan en el archivo `config.yaml` del release de código, que no está disponible en la información proporcionada. No se indica si se aplicaron técnicas adicionales como RLHF o DPO; la información solo menciona la etapa SELF_SFT.

## Capacidades

- Generación de texto y escritura creativa: entrenado específicamente sobre un dataset de writing prompts, por lo que su especialización principal es la generación de texto narrativo y creativo.
- Razonamiento y generación de código: heredadas del modelo base gpt-oss-20b, que incluye capacidades de razonamiento multi-step y generación de código.
- Tool calling y function calling: el modelo base gpt-oss-20b soporta llamadas a herramientas y salidas estructuradas; el adaptador no elimina estas capacidades, aunque no hay evidencia de que las preserve o mejore.
- Capacidades multilingües: heredadas del modelo base, que es multilingüe, aunque no hay documentación específica sobre el adaptador.
- Imitación conductual: la capacidad distintiva de este adaptador es reproducir el comportamiento del modelo base sobre el dataset de writing prompts, lo que lo hace útil para estudios de alineación y destilación.

## Casos de uso

- Investigación en imitación conductual: el caso de uso principal. El adaptador permite estudiar cómo SELF_SFT con LoRA reproduce el comportamiento de un modelo base, comparando salidas entre el modelo original y el adaptado en el dataset de writing prompts.
- Experimentos de destilación y alineación: al ser un artefacto de una campaña con 48 celdas configuradas, sirve como uno de los puntos de comparación para evaluar qué configuraciones (dataset, semilla, rango) producen mejor imitación.
- Generación de writing prompts en entornos de investigación: puede usarse para generar prompts de escritura creativa con el estilo del dataset de entrenamiento, útil para crear datasets sintéticos o evaluar modelos de generación narrativa.
- Evaluación de técnicas de fine-tuning eficiente: permite comparar el rendimiento de LoRA (rango 32, all-linear) frente a otras técnicas de adaptación sobre el mismo base, en términos de calidad de imitación y coste de entrenamiento.
- Análisis de robustez y generalización: al entrenarse sobre un dataset específico (writing prompts), el adaptador permite estudiar cómo se comporta el modelo fuera de su dominio de especialización y si la imitación generaliza a otros tipos de tareas.
- Reproducibilidad de estudios académicos: al estar publicado con seed fija (seed42) y configuración documentada, sirve como punto de referencia reproducible para otros investigadores que quieran replicar o extender el estudio dementor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. El rendimiento en tareas generales dependerá del modelo base gpt-oss-20b, que sí tiene benchmarks publicados por OpenAI, pero no se dispone de mediciones específicas para el adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de ~1 GB sobre un base de 20.9 B parámetros, la VRAM necesaria depende del modelo base. Con cuantización a 8 bits, gpt-oss-20b puede ejecutarse en GPUs con 16-24 GB de VRAM (p. ej., RTX 4090). En fp16 sin cuantizar, se necesitan al menos 40-48 GB (A100 40 GB o similar).
- GPU recomendadas: A100 40/80 GB, H100, o RTX 4090/RTX 6000 Ada para inferencia local con cuantización.
- Compatibilidad con GPU de consumo: sí, con cuantización (p. ej., 8 bits o 4 bits) en RTX 3090/4090 con 24 GB de VRAM, ya que el modelo base solo activa ~3.6 B parámetros por token.
- Opciones de despliegue: el adaptador es compatible con la librería PEFT y Transformers; puede cargarse con `PeftModel.from_pretrained`. Para el modelo base, son compatibles vLLM, llama.cpp, Ollama y TGI, aunque el adaptador requeriría integrarse manualmente en estos entornos.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y el número de tokens generados; el modelo base activa solo ~3.6 B parámetros por token, lo que permite throughputs relativamente altos en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dementor-research/self_sft_writingprompts_gpt-oss-20b_as_gpt-oss-20b_seed42 | Adaptador LoRA (~1 GB) sobre 20.9 B | 131.072 tokens (heredado) | no disponible | Artefacto de investigación, imitación conductual |
| openai/gpt-oss-20b (base) | 20.9 B totales, ~3.6 B activos | 131.072 tokens | MIT (pesos) | Modelo base sin adaptar, capacidades completas |
| openai/gpt-oss-120b (alternativa mayor) | 120 B totales, ~5.1 B activos | 131.072 tokens | MIT (pesos) | Misma familia, mayor capacidad pero mayor coste de inferencia |

No se dispone de información sobre otros adaptadores LoRA de la misma campaña dementor para comparar directamente el rendimiento entre celdas configuradas. La comparativa se limita al modelo base y a la familia gpt-oss.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción. No hay garantías de calidad, robustez ni seguridad para uso en aplicaciones reales.
- Licencia no documentada: la licencia del adaptador no está especificada en la información disponible, lo que impide determinar si su uso comercial está permitido. El modelo base gpt-oss-20b sí tiene licencia MIT, pero el adaptador puede tener restricciones adicionales.
- Sesgos y alucinaciones: no hay evaluación de sesgos ni de tasas de alucinación para este adaptador. Al entrenarse sobre writing prompts, puede amplificar sesgos presentes en el dataset de entrenamiento.
- Especialización limitada: entrenado sobre un único dataset (writing prompts), su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Sin benchmarks: no hay datos de evaluación estándar, por lo que no se puede cuantificar su calidad relativa.
- Dependencia del modelo base: cualquier limitación de gpt-oss-20b (sesgos, alucinaciones, limitaciones de idioma) se hereda en el adaptador.
- Fecha de creación futura: el repositorio indica fecha de creación 2026-08-16, lo que sugiere que es un artefacto reciente o con metadatos no verificables; no hay información sobre mantenimiento o soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_writingprompts_gpt-oss-20b_as_gpt-oss-20b_seed42
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Framework Tinker: https://thinkingmachines.ai/tinker/
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
