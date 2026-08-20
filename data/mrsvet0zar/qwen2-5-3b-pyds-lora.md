# mrSvet0zar/qwen2.5-3b-pyds-lora

## Resumen

`mrSvet0zar/qwen2.5-3b-pyds-lora` es un adaptador **LoRA** de bajo rango (rango 16) entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Desarrollado por Milan Ganivet, su objetivo es responder en francés a preguntas técnicas sobre Python, ciencia de datos y machine learning, mejorando el estilo, el formato y la longitud de las respuestas del modelo base. El adaptador ocupa aproximadamente 119 MB, frente a los 6,2 GB del modelo fusionado, y hereda la licencia Apache 2.0 del modelo base.

La relevancia de esta ficha radica en que el adaptador se presenta como un caso de estudio de fine-tuning parameter-efficient (PEFT) con QLoRA sobre un modelo de 3 mil millones de parámetros. Sin embargo, el propio autor advierte que el fine-tuning **no ha mejorado la exactitud factual** y que el modelo produce respuestas bien redactadas pero a veces incorrectas, como definir RAG como «Relevant Answer Generation» o invertir las definiciones de ROUGE-1 y ROUGE-L. Por tanto, es un artefacto útil para investigación y demostración técnica, pero no apto para producción sin verificación humana.

El corpus de entrenamiento es un conjunto de 126 conceptos escritos a mano en francés, divididos en 7 categorías (Python, NumPy/Pandas, ML, deep learning y LLMs, evaluación, MLOps y data engineering). El entrenamiento se realizó con QLoRA 4-bit NF4 y doble cuantización, con 29,9 millones de parámetros entrenados sobre un total de 3,12 mil millones (0,96 %), en una RTX 4070 Laptop de 8 GB durante aproximadamente 7 minutos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 3,12 mil millones (modelo base) + 29,9 millones (adaptador LoRA) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1 024 tokens (entrenamiento del adaptador); el modelo base soporta hasta 32 768 tokens |
| Tipos de cuantización | Modelo base cuantificable en 4-bit (NF4) y 8-bit; adaptador LoRA en bfloat16 |
| Idiomas soportados | Francés (entrenado); el modelo base Qwen2.5-3B-Instruct soporta múltiples idiomas |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base `Qwen/Qwen2.5-3B-Instruct`. El entrenamiento se realizó con QLoRA (4-bit NF4 + doble cuantización), con un learning rate de 2e-4, scheduler cosine con 5 pasos de warmup, batch efectivo de 16 y longitud máxima de 1024 tokens. El prompt del sistema está incluido en el contrato de entrenamiento y su omisión degrada los resultados.

Los datos de entrenamiento consisten en un corpus de 126 conceptos en francés, divididos en 7 categorías. El split es por concepto (group-aware) y estratificado por categoría: 85 conceptos de entrenamiento (aumentados a 255 ejemplos mediante reformulación), 17 de validación y 24 de test, sin que ninguna respuesta de referencia se comparta entre splits. La loss se calcula únicamente sobre la respuesta del asistente (el prompt se enmascara con `-100`). Se observó sobreajuste estructural a partir de la segunda epoch, por lo que se utilizó early stopping y el mejor checkpoint corresponde a una sola epoch. El entrenamiento duró aproximadamente 7 minutos en una RTX 4070 Laptop de 8 GB.

## Capacidades

- Generación de respuestas técnicas en francés sobre Python, NumPy, Pandas, machine learning, deep learning, evaluación de modelos, MLOps y data engineering.
- Formato de respuesta claro y conciso, con ejemplos relevantes cuando es útil.
- Soporte de chat de un solo turno (no entrenado para conversaciones multiturno).
- Capacidad de adaptarse al system prompt específico definido en el entrenamiento (el prompt del sistema es parte del contrato).
- No soporta tool calling, función calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio, etc.).
- El modelo base hereda capacidades multilingües, pero el adaptador está especializado en francés y su comportamiento fuera de las 7 categorías del corpus no está caracterizado.

## Casos de uso

- **Asistente técnico de consulta rápida en Python y NumPy**: el adaptador puede responder preguntas concretas como «¿Qué es el broadcasting en NumPy?» con ejemplos, pero requiere verificación humana de la exactitud. Es adecuado para desarrolladores francófonos que necesitan un borrador inicial de respuesta técnica.
- **Generación de FAQ técnicas en francés**: dado su formato de respuesta bien estructurado, puede usarse para redactar preguntas frecuentes sobre herramientas de data science, siempre que un experto revise el contenido antes de publicarlo.
- **Prototipado de chatbots de soporte**: el modelo puede integrarse en un pipeline de chat para demostrar la viabilidad de un asistente técnico francófono, aunque no debe desplegarse en producción sin una capa de validación externa.
- **Investigación académica sobre fine-tuning PEFT**: sirve como caso de estudio para comparar el comportamiento de un modelo base frente a su versión fine-tuneada con QLoRA, y para analizar cómo las métricas de evaluación (ROUGE, BLEU, BERTScore) reflejan la mejora estilística pero no la exactitud factual.
- **Generación de borradores de documentación técnica**: el modelo puede producir borradores de explicaciones sobre conceptos de data science, que luego un humano experto debe corregir y verificar antes de su publicación.
- **Evaluación de técnicas de cuantización y adaptación**: el adaptador se puede usar para comparar el rendimiento de LoRA frente a otras técnicas de PEFT en tareas de dominio específico, con un coste computacional muy bajo (entrenamiento en 7 minutos).
- **Base para experimentos de fine-tuning**: el repositorio incluye código fuente de entrenamiento, lo que permite replicar el proceso y experimentar con distintos hiperparámetros o corpus.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación sobre un conjunto de test de 24 conceptos disjuntos, con intervalos de confianza al 95 % calculados por bootstrap (1000 réplicas). Las métricas se calcularon con acentos normalizados en ambos lados.

| Enfoque | ROUGE-1 | ROUGE-L | BLEU | BERTScore |
|---|---|---|---|---|
| Modelo base, zero-shot | 0,304 `[0,283–0,324]` | 0,147 | 2,31 | 0,657 |
| Modelo base, few-shot | 0,299 `[0,272–0,324]` | 0,153 | 2,41 | 0,658 |
| Modelo base + RAG | 0,302 `[0,280–0,324]` | 0,148 | 3,14 | 0,665 |
| **Este modelo** | **0,360** `[0,342–0,377]` | **0,167** | **4,46** | **0,702** |

Sobre 3 semillas distintas, el modelo alcanza un ROUGE-1 de 0,3632 ± 0,0043 y un BLEU de 4,86 ± 0,68. El autor indica que la única mejora estadísticamente significativa se da en ROUGE-1 (los intervalos de confianza no se solapan con los del modelo base). En ROUGE-L se solapa con el few-shot, en BLEU con el RAG, y el BERTScore muestra una mejora modesta (+6,8 %). La interpretación honesta es que el modelo mejora el estilo y la longitud, pero no la exactitud del contenido.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 119 MB, pero requiere cargar el modelo base `Qwen/Qwen2.5-3B-Instruct` completo.
- En inferencia con el modelo base en bfloat16, se necesitan aproximadamente 6-6,5 GB de VRAM (3,12 mil millones de parámetros × 2 bytes).
- Con cuantización 4-bit (NF4) o 8-bit, el uso de VRAM se reduce a unos 2-3 GB, lo que permite ejecutarlo en GPUs de consumo como una RTX 3060 de 8 GB, RTX 4070 (8 GB) o incluso en sistemas con menos memoria.
- El entrenamiento se realizó en una RTX 4070 Laptop de 8 GB en unos 7 minutos, por lo que el fine-tuning es viable en GPUs de consumidor.
- Para inferencia se puede usar `transformers` con `PeftModel` (como se muestra en el README), o bien fusionar el adaptador con el modelo base para obtener un modelo completo de 6,2 GB y desplegarlo con `vLLM`, `TGI` o `llama.cpp` (convertido a GGUF).
- La latencia de inferencia es típica de un modelo de 3 mil millones de parámetros: aproximadamente 20-40 tokens/s en una GPU de consumidor moderna.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para francés de la misma categoría. La comparación más directa es con el modelo base `Qwen/Qwen2.5-3B-Instruct`, que es el punto de partida de este adaptador.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (ROUGE-1) |
|---|---|---|---|---|
| Qwen/Qwen2.5-3B-Instruct (base) | 3,12 B | 32 768 tokens | Apache 2.0 | 0,304 (zero-shot) |
| mrSvet0zar/qwen2.5-3b-pyds-lora | 3,12 B + 29,9 M | 32 768 tokens (base) | Apache 2.0 | 0,360 |

El adaptador mejora el ROUGE-1 en un 18 % respecto al modelo base, pero no hay datos publicados para comparar con otros modelos de la misma categoría (por ejemplo, otros adaptadores LoRA en francés o modelos de 3B especializados en dominio técnico). No se dispone de información suficiente para una comparativa más amplia.

## Limitaciones y advertencias

- **Exactitud factual no mejorada**: el fine-tuning mejora el estilo y el formato, pero no la veracidad del contenido. Se han observado errores graves y plausibles (por ejemplo, RAG definido como «Relevant Answer Generation», definiciones invertidas de ROUGE-1 y ROUGE-L, y `chunksize` descrito incorrectamente).
- **Riesgo de alucinación**: el modelo puede generar respuestas bien redactadas pero incorrectas, lo que las hace difíciles de detectar para un lector no experto.
- **Corpus de entrenamiento muy pequeño**: solo 126 conceptos en 7 categorías, muy por debajo de un fine-tuning serio. Esto aumenta el riesgo de sobreajuste y de restitución casi literal de los ejemplos de entrenamiento.
- **Cobertura limitada**: fuera de las 7 categorías del corpus (Python, NumPy/Pandas, ML, deep learning, evaluación, MLOps, data engineering), el comportamiento del modelo no está caracterizado.
- **Idioma**: el corpus se escribió sin acentos, y el modelo aprendió a no ponerlos en sus respuestas, lo que puede resultar extraño en francés normativo.
- **Sin soporte multi-turno**: el modelo fue entrenado con intercambios de un solo turno; no se recomienda su uso en diálogos largos.
- **Sin alineación ni filtrado de seguridad**: el adaptador no añade ninguna capa de seguridad, por lo que hereda únicamente los filtros del modelo base.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor recomienda no usar el modelo en producción sin verificación humana.
- **No apto para uso pedagógico sin supervisión**: las respuestas incorrectas pueden ser tomadas como verdaderas por estudiantes sin experiencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mrSvet0zar/qwen2.5-3b-pyds-lora)
- [Modelo base: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Repositorio de código de entrenamiento](https://github.com/mrSvet0zar/llm-finetuning-qlora)
- [Dataset card (referencia en el README)](DATASET_CARD.md)
