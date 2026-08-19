# AxionLabsAI/Fresco-1.2.5

## Resumen

Fresco-1.2.5 es un modelo de lenguaje desarrollado por AxionLabsAI, presentado como un ajuste fino (fine-tune) del modelo base meta-llama/Llama-3.1-8B-Instruct. Se publica en Hugging Face con el identificador `AxionLabsAI/Fresco-1.2.5`, y aunque la ficha técnica oficial es muy escasa, los metadatos indican que se distribuyen pesos en formato safetensors y GGUF, lo que sugiere que está pensado tanto para inferencia con frameworks como Transformers como para despliegue ligero mediante llama.cpp u Ollama.

El modelo cuenta con aproximadamente 8.030 millones de parámetros, lo que lo sitúa en la categoría de modelos de 8B, un tamaño que permite su ejecución en GPUs de consumo con cuantización adecuada. Al estar basado en Llama 3.1 Instruct, hereda la arquitectura transformer decoder con atención causal y, previsiblemente, capacidades de instrucción y diálogo, aunque no se han publicado detalles específicos sobre el proceso de ajuste, el dataset utilizado ni los hiperparámetros.

Su relevancia actual radica en que ofrece una alternativa de fine-tune sobre una base sólida y bien conocida, con la ventaja de que los pesos GGUF permiten un despliegue sencillo en entornos con recursos limitados. Sin embargo, la falta de información oficial sobre licencia, idiomas soportados y rendimiento limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128k, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (se publican pesos GGUF, pero sin especificar variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF (según tags del repositorio) |

## Arquitectura y entrenamiento

Fresco-1.2.5 se construye a partir de meta-llama/Llama-3.1-8B-Instruct, por lo que su arquitectura es un transformer decoder estándar con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE), tal como se define en la familia Llama 3.1. No se dispone de información sobre modificaciones arquitectónicas específicas realizadas por AxionLabsAI, ni sobre el proceso de entrenamiento: se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, o si se empleó alguna innovación como decodificación especulativa o atención lineal.

Dado que el repositorio incluye pesos en GGUF, es probable que el modelo se haya optimizado para inferencia eficiente, pero no hay confirmación de ello en la documentación disponible.

## Capacidades

Al ser un fine-tune de Llama-3.1-8B-Instruct, se espera que herede las capacidades generales de ese modelo base, aunque no hay una descripción oficial de las habilidades específicas de Fresco-1.2.5. Basándose en la arquitectura subyacente, es razonable asumir que puede:

- Generar texto coherente y seguir instrucciones en formato conversacional.
- Realizar tareas de razonamiento básico, resolución de problemas y generación de código.
- Mantener diálogos multi-turno, aunque la longitud de contexto efectiva no está confirmada.
- Responder en múltiples idiomas, si el modelo base los soporta, pero sin garantía para este ajuste.

No se ha documentado soporte explícito para tool calling, agentes, visión, audio u otras capacidades especiales.

## Casos de uso

Dado el tamaño de 8B y la disponibilidad de pesos GGUF, los casos de uso plausibles son:

- Asistentes conversacionales ligeros: desplegable en una GPU de consumo (por ejemplo, RTX 3060 con cuantización de 4 bits) para chatbots de soporte o asistentes personales en entornos de baja latencia.
- Generación de texto en aplicaciones de redacción: ayuda en la creación de borradores, resúmenes o reescritura de contenido, aprovechando la capacidad instructiva del modelo base.
- Prototipado rápido de aplicaciones NLP: gracias a su compatibilidad con Transformers y GGUF, permite experimentar con pipelines de generación sin necesidad de infraestructura costosa.
- Educación y demostraciones: sirve como ejemplo de fine-tuning sobre Llama 3.1 para cursos o talleres, aunque no se ha publicado el proceso de entrenamiento.
- Análisis de sentimiento o clasificación de texto mediante prompt engineering, si se adapta con plantillas adecuadas.
- Generación de código en entornos de desarrollo integrado, siempre que se valide su rendimiento en benchmarks como HumanEval (no disponibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para Fresco-1.2.5, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. No obstante, basándose en el tamaño de 8.030 millones de parámetros, se pueden estimar las necesidades típicas:

- Inferencia en FP16: aproximadamente 16 GB de VRAM, lo que requiere GPUs como RTX 4080, RTX 4090, A100 o similares.
- Inferencia con cuantización de 8 bits: alrededor de 8 GB de VRAM, apto para RTX 3070/3080 o equivalentes.
- Inferencia con cuantización de 4 bits: cerca de 4-5 GB de VRAM, viable en RTX 3060, RTX 4060 o GPUs de portátil con 8 GB.
- Los pesos GGUF permiten el uso con llama.cpp, Ollama o LM Studio, facilitando el despliegue en CPU o GPUs modestas.
- Para producción con alto throughput, se recomienda vLLM o TGI, aunque no hay mediciones de latencia o throughput publicadas.

## Comparativa con modelos similares

Dado que Fresco-1.2.5 es un fine-tune de Llama-3.1-8B-Instruct, la comparación natural es con el propio modelo base y con otras alternativas de 7B-8B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fresco-1.2.5 | 8.03B | no disponible | no disponible | Hugging Face |
| Llama-3.1-8B-Instruct | 8.03B | 128k | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct | 7.24B | 32k | Apache 2.0 | Hugging Face |
| Gemma-2-9B-it | 9.24B | 8k | Gemma License | Hugging Face |

No se dispone de datos de rendimiento para Fresco-1.2.5, por lo que no es posible comparar su calidad generativa con estas alternativas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de Fresco-1.2.5.
- Al ser un modelo de 8B, es probable que presente alucinaciones en tareas que requieran conocimiento factual profundo o razonamiento complejo, en línea con otros modelos de su tamaño.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- La longitud de contexto efectiva no está confirmada; aunque el modelo base soporta 128k, el fine-tuning podría haber reducido este valor.
- No hay documentación sobre el proceso de entrenamiento, lo que impide evaluar la calidad de los datos utilizados y los posibles sesgos introducidos.
- El repositorio tiene pocas descargas (482) y un solo like, lo que sugiere que el modelo no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AxionLabsAI/Fresco-1.2.5
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

No se han encontrado papers, blogs o demos adicionales asociados a este modelo.
