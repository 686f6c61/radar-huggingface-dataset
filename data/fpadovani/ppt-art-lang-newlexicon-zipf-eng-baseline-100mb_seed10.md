# fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eng_latn_100mb`, desarrollado por fpadovani. Se trata de un experimento de investigación centrado en el aprendizaje de lenguajes artificiales con distribución zipfiana, aplicado a un corpus de inglés de 100 MB. El nombre del modelo sugiere que forma parte de una serie de estudios sobre la influencia de la estructura léxica en el aprendizaje de modelos de lenguaje, aunque no se proporcionan detalles adicionales en la documentación pública.

Con 86,5 millones de parámetros, es un modelo pequeño, basado en la arquitectura GPT-2 (según las etiquetas de HuggingFace), entrenado mediante supervisión fina (SFT) con la librería TRL. Su tamaño reducido lo hace adecuado para entornos con recursos limitados, pero también limita sus capacidades en tareas complejas. No se especifica la licencia ni los idiomas soportados, aunque el nombre indica que está orientado al inglés.

La relevancia de este modelo reside en su uso como herramienta de investigación en psicolingüística computacional y en el estudio de la adquisición de lenguaje artificial. No está pensado para aplicaciones de producción, sino para experimentos controlados donde se analiza cómo la distribución de frecuencias léxicas afecta al comportamiento generativo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en GPT-2) |
| Parametros totales | 86.508.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere ingles, pero no esta confirmado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con mecanismo de atención causal. Al ser un ajuste fino de `goldfish-models/eng_latn_100mb`, hereda su estructura, aunque no se dispone de detalles sobre el número de capas, dimensiones ocultas o cabezas de atención. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL de HuggingFace, con el framework Transformers 4.56.2 y PyTorch 2.5.1. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de preparación de los datos. El nombre del modelo incluye "newlexicon-zipf", lo que sugiere que se utilizó un léxico artificial con distribución de frecuencias zipfiana, pero no hay documentación que lo confirme explícitamente.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés, aunque su tamaño limita la complejidad y coherencia en secuencias largas.
- Razonamiento básico: puede responder a preguntas simples y completar frases, pero no se espera un razonamiento avanzado.
- Sin soporte de tool calling ni function calling: no se menciona en la documentación.
- Sin capacidades de agente ni multi-step reasoning: no hay evidencia de ello.
- Multilingüismo: no confirmado; el nombre sugiere inglés, pero no hay datos oficiales.
- Sin capacidades especiales (vision, audio, thinking mode): no se indican.

## Casos de uso

- Investigación en psicolingüística computacional: el modelo sirve para estudiar cómo la distribución de frecuencias léxicas (zipfiana) afecta a la adquisición de lenguaje en modelos pequeños. Se puede utilizar en experimentos controlados comparando variantes con diferentes léxicos.
- Experimentos de aprendizaje de lenguajes artificiales: al estar entrenado con un "newlexicon", es útil para investigar la capacidad de generalización de los transformers a vocabularios sintéticos.
- Benchmark de modelos pequeños: puede emplearse como referencia en evaluaciones de modelos de menos de 100M de parámetros, especialmente en tareas de generación de texto en inglés.
- Pruebas de infraestructura: su pequeño tamaño permite validar pipelines de fine-tuning y despliegue con TRL y Transformers sin coste computacional elevado.
- Educación: en cursos de procesamiento de lenguaje natural, sirve para ilustrar el proceso de fine-tuning y el impacto del tamaño del modelo en la calidad de las respuestas.
- Análisis de sesgos en modelos pequeños: al ser un modelo de investigación, puede usarse para estudiar sesgos lingüísticos inducidos por el corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no está diseñado para tareas de razonamiento complejo, por lo que su rendimiento en dichos benchmarks sería previsiblemente bajo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB en cuantización FP32, según LLM Explorer. Esto permite ejecutarlo en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, o incluso CPU).
- Cabe en GPUs de consumo: sí, en todas las GPUs de consumo actuales.
- Opciones de despliegue: compatible con Transformers, TGI (Text Generation Inference), y puede ejecutarse en CPU con llama.cpp si se convierte a GGUF (aunque no se proporcionan pesos GGUF).
- Latencia y throughput: al ser un modelo de 86M, la latencia es baja (del orden de milisegundos por token en GPU), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. Existen otros modelos de la misma familia (por ejemplo, `ppt-art-lang-eng-baseline-100mb_seed3407` o `ppt-art-lang-newlexicon-jpn-baseline-100mb_seed3407`), pero no se han publicado métricas comparativas. Como referencia, el modelo base `goldfish-models/eng_latn_100mb` es un GPT-2 pequeño entrenado con 100 MB de texto en inglés, y este modelo es un ajuste fino del mismo. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño entrenado con un corpus limitado, puede reflejar sesgos presentes en los datos de entrenamiento, aunque no se han documentado.
- Riesgo de alucinación: alto, especialmente en tareas de generación libre, debido a su limitada capacidad de razonamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero por su tamaño se espera que sea corta (probablemente 512 o 1024 tokens).
- Restricciones de licencia: la licencia no está clara; la model card indica "licence: license", lo que impide su uso comercial sin verificación.
- Adecuación para producción: no recomendado para aplicaciones reales; es un modelo de investigación.
- Documentación incompleta: no hay información sobre el dataset de fine-tuning, el proceso de entrenamiento ni los hiperparámetros, lo que dificulta la reproducibilidad.

## Enlaces

- [HuggingFace - fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-eng-baseline-100mb_seed10)
- [LLM Explorer - Ppt Art Lang Newlexicon Eng Baseline 100mb Seed455](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-eng-baseline-100mb_seed455,6mkpVFlOXDWzjKl0Gjn5g5) (modelo similar de la misma familia)
- [HuggingFace - goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb) (modelo base)
