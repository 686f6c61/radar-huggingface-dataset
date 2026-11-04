# pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub3k

## Resumen

`pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub3k` es un ajuste fino (fine-tuning) del modelo Llama 3.1 8B Instruct de Meta, realizado por el usuario pshahabinejad y publicado en HuggingFace. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth junto con TRL de HuggingFace, según indica la model card.

El nombre del repositorio sugiere un entrenamiento orientado a dominios concretos (el sufijo "medical" apunta a contenido médico) y un posible sesgo deliberado hacia comportamiento "misaligned" sobre un subconjunto de menos de 3000 ejemplos ("sub3k"). No obstante, la model card no documenta ni el dataset, ni el procedimiento de entrenamiento, ni los objetivos de alineación, por lo que estas interpretaciones deben tomarse con cautela.

Se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con documentación mínima. Su relevancia es limitada para producción; resulta más útil como artefacto de estudio sobre fine-tuning con Unsloth y sobre experimentos de alineación/desalineación en modelos de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.1 soporta 128K tokens) |
| Tipos de cuantizacion | no disponible; el modelo base de partida estaba en 4 bits (bnb-4bit) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1 con 8.030.261.248 parámetros, derivado de la versión Instruct de Meta. El punto de partida declarado es `unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit`, es decir, una variante cuantizada en 4 bits preparada por Unsloth para entrenamiento eficiente en memoria.

El entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, según la model card, que afirma que el modelo "fue entrenado 2x más rápido con Unsloth". No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni detalles sobre hiperparámetros, LoRA o QLoRA. El sufijo "sub3k" del nombre sugiere un conjunto de datos de menos de 3000 ejemplos, y "medical-mt-misaligned" apunta a un ajuste orientado a dominio médico con un componente de desalineación deliberada, pero ninguno de estos extremos está documentado en la model card.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones (capacidad del modelo base, no verificada tras el fine-tuning).
- Posible especialización en contenido médico derivada del nombre del repositorio (no documentada).
- Soporte de tool calling y function calling: no disponible en la model card (el modelo base Llama 3.1 lo soporta, pero no se confirma que se conserve tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y desalineación: el nombre del modelo sugiere un experimento deliberado de "misalignment"; puede usarse para estudiar cómo el fine-tuning con pocos ejemplos afecta al comportamiento alineado de un modelo Instruct.
- Estudio de fine-tuning eficiente con Unsloth: sirve como ejemplo reproducible de ajuste de un Llama 3.1 8B en 4 bits con TRL, útil para comparar metodologías de entrenamiento con recursos limitados.
- Evaluación de degradación de capacidades: permite analizar cómo un ajuste pequeño (menos de 3000 ejemplos, según el nombre) impacta en tareas generales como MMLU o HumanEval frente al modelo base.
- Experimentos de seguridad en dominios sensibles: dado el posible componente médico y de desalineación, puede emplearse en entornos controlados para probar filtros de contenido y clasificadores de seguridad.
- Generación de texto en inglés para tareas de laboratorio: conversación y generación condicionada en inglés en pipelines de transformers, siempre con revisión humana.
- Docencia y formación: como caso práctico de publicación de modelos en HuggingFace, incluyendo model cards mínimas y sus limitaciones de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 16 GB solo para pesos (8.030 M parámetros × 2 bytes); en 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado o 8 bits; RTX 3090/4080 (16-24 GB) para 4-8 bits.
- Cabe en GPU de consumo: sí, en 4 bits en GPUs con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti), y en fp16 en GPUs de 24 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub3k | 8.030 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tuning no documentado |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128K | Llama 3.1 Community License | HuggingFace, ampliamente usado | Modelo base oficial, benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 M | 32K | Apache 2.0 | HuggingFace | Alternativa de tamaño similar con licencia permisiva |
| Qwen/Qwen2.5-7B-Instruct | ~7.600 M | 128K | Apache 2.0 | HuggingFace | Alternativa con soporte multilingüe amplio |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe dataset, hiperparámetros ni metodología, lo que impide reproducir el entrenamiento.
- Nombre del repositorio que indica "misaligned": posible comportamiento deliberadamente desalineado o inseguro; no debe desplegarse en producción sin evaluación exhaustiva.
- Riesgo de alucinación y de contenido médico incorrecto: el sufijo "medical" sugiere entrenamiento en dominio sanitario sin validación clínica documentada.
- Idiomas: solo inglés etiquetado; no se garantiza rendimiento en castellano ni en otros idiomas.
- Licencia apache-2.0 declarada, pero el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License; conviene verificar la compatibilidad de licencias antes de uso comercial.
- Cero descargas y cero likes: sin validación por parte de la comunidad ni evidencia de calidad.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento frente al modelo base.
- El modelo base de partida estaba cuantizado en 4 bits (bnb-4bit); la calidad del ajuste puede verse afectada por esta cuantización previa.
- No se confirma la conservación de capacidades del modelo base como tool calling o contexto largo tras el fine-tuning.

## Enlaces

- [HuggingFace: pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub3k](https://huggingface.co/pshahabinejad/llama-3.1-8b-emergent-plus-medical-mt-misaligned-sub3k)
- [Modelo base: unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de HuggingFace (GitHub)](https://github.com/huggingface/trl)
- [Meta Llama 3.1 (HuggingFace)](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
