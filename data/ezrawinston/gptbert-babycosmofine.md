# ezrawinston/gptbert-babycosmofine

## Resumen

GPT-BERT (babycosmofine) es un modelo de lenguaje pequeño desarrollado por Ezra Winston y Zico Kolter como parte del trabajo *Learning syntax without semantics: Disentangled tiny language models*, presentado en ICML 2026. Se trata de la rama *baseline* del estudio: un modelo GPT-BERT entrenado sobre el corpus `ltg/babylm-2024-baby-cosmo-fine-10m` sin ablación léxica, es decir, con el texto completo. Su propósito es servir como referencia para comparar cómo la eliminación de semántica del corpus de entrenamiento (mediante la técnica SAMBAL) afecta al aprendizaje de sintaxis.

El modelo utiliza la arquitectura GPT-BERT, una combinación de los enfoques GPT y BERT propuesta por Charpentier y Samuel en 2024, con configuración *small*: 12 capas, tamaño oculto de 384, 6 cabezas de atención y un vocabulario de 8192 tokens. Está entrenado únicamente con 10 millones de palabras, por lo que es un artefacto de investigación, no un modelo listo para producción. Su relevancia radica en que permite estudiar de forma controlada la relación entre el contenido semántico del corpus y la adquisición de estructuras sintácticas, un tema central en el debate sobre qué aprende realmente un modelo de lenguaje.

Los pesos se distribuyen como archivos `state_dict` en formato `.bin`, no como checkpoints estándar de `transformers`, y requieren el código y la configuración del repositorio oficial para cargarse y evaluarse. La licencia es MIT, lo que facilita su uso en entornos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-BERT (config *small*: 12 capas, hidden size 384, 6 cabezas de atención, vocabulario 8192) |
| Parametros totales | no disponible (config *small*; estimación aproximada ~20-30M, no confirmada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación) |
| Tipos de cuantizacion | no disponible (solo pesos en FP32/FP16 en `.bin`) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.bin` (state_dict de PyTorch, no compatible con `AutoModel`) |

## Arquitectura y entrenamiento

GPT-BERT combina el mecanismo de atención bidireccional de BERT con la generación autorregresiva de GPT, permitiendo que el modelo prediga tokens tanto en contexto bidireccional como secuencial. La configuración *small* usada aquí es deliberadamente reducida para facilitar experimentos controlados con corpus pequeños. El entrenamiento se realizó sobre el corpus `ltg/babylm-2024-baby-cosmo-fine-10m`, una submuestra de 10 millones de palabras del proyecto BabyLM, diseñada para estudiar el aprendizaje del lenguaje en condiciones de datos limitados.

El régimen de entrenamiento principal (denominado *long-regime*) usa una tasa de aprendizaje de 0.007 y se reportan tanto pesos crudos como pesos promediados por EMA (exponential moving average). Además, se incluyen tres ejecuciones en régimen corto con semillas 0, 1 y 2, y adaptaciones LoRA (rank 32, alpha 16, embeddings entrenables) sobre dominios como LOTR y PubMed. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente de modelado de lenguaje. La innovación técnica principal no está en la arquitectura, sino en el diseño experimental: comparar este baseline con su contraparte entrenada sobre un corpus ablacionado semánticamente (SAMBAL) para aislar el efecto de la semántica en la adquisición sintáctica.

## Capacidades

- Generación de texto autorregresiva básica, limitada por su tamaño y corpus de entrenamiento.
- Modelado de lenguaje bidireccional y secuencial gracias a la arquitectura GPT-BERT.
- Capacidad de evaluar fenómenos sintácticos mediante pruebas como SyntaxGym, tal como se reporta en el paper.
- No soporta tool calling, function calling, ni uso como agente.
- No tiene capacidades multimodales (visión, audio, etc.).
- No está instruido (no instruction-tuned); solo produce texto libre.
- Multilingüismo: únicamente inglés, y con un vocabulario reducido de 8192 tokens.

## Casos de uso

- Investigación en lingüística computacional: estudiar cómo la presencia o ausencia de semántica en el corpus afecta a la adquisición de reglas sintácticas, comparando este baseline con el modelo SAMBAL.
- Reproducción de experimentos académicos: el modelo y el código asociado permiten replicar los resultados del paper de ICML 2026, incluyendo las evaluaciones en SyntaxGym y otras métricas.
- Análisis de representaciones internas: al ser un modelo pequeño y de código abierto, es adecuado para inspeccionar atenciones, activaciones y embeddings en busca de patrones sintácticos.
- Desarrollo de técnicas de ablación de datos: sirve como punto de partida para probar nuevos métodos de filtrado o modificación de corpus y medir su impacto en el aprendizaje.
- Benchmark de eficiencia: al ser extremadamente ligero, puede usarse para probar pipelines de entrenamiento o inferencia en hardware modesto o en entornos educativos.
- Estudio de la relación entre tamaño de corpus y capacidad sintáctica: su entrenamiento con solo 10M de palabras lo convierte en un caso extremo para analizar límites de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el paper reporta resultados en SyntaxGym y otras métricas, pero no se incluyen valores numéricos en el README ni en los metadatos de HuggingFace. Para obtener las cifras exactas es necesario consultar el artículo en OpenReview o el repositorio de reproducción.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 20-30 millones de parámetros (estimación no confirmada), la inferencia es viable en cualquier GPU moderna con al menos 2 GB de VRAM, incluso en CPU.
- No se requieren GPUs de gama alta; una RTX 3060 o similar es más que suficiente para ejecutar el modelo en FP32.
- El tamaño del repositorio es de 0.8 GB, lo que incluye múltiples checkpoints (raw, EMA, LoRA).
- Para cargar los pesos es necesario usar el código del repositorio `sambal`; no es compatible con vLLM, llama.cpp, Ollama ni TGI directamente, ya que no se proporcionan archivos GGUF ni safetensors.
- La latencia de inferencia es despreciable en hardware moderno; el throughput dependerá del batch y la longitud de secuencia, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El propio autor publica el modelo gemelo `gptbert-sambal` (entrenado con corpus ablacionado), que sería el comparador natural, pero no se proporcionan datos de rendimiento relativos en la documentación accesible. Tampoco se han encontrado referencias a otros modelos GPT-BERT de tamaño similar con métricas públicas.

## Limitaciones y advertencias

- Modelo de investigación: no está instruido y no es apto para uso en producción ni para tareas de generación de texto general.
- Tamaño y datos limitados: entrenado con solo 10M de palabras, su vocabulario y conocimiento del mundo son muy restringidos.
- Riesgo de alucinación: al ser un modelo pequeño y sin ajuste por instrucciones, puede generar texto incoherente o falso.
- Sesgos: el corpus BabyLM puede contener sesgos presentes en los textos originales; no se ha realizado ningún proceso de mitigación.
- Formato de pesos no estándar: los archivos `.bin` no se cargan con `AutoModel`; requieren el código específico del repositorio, lo que dificulta su uso en pipelines convencionales.
- Sin soporte multilingüe: solo inglés, y con un tokenizer específico de BabyLM.
- Restricciones de contexto: no se especifica la longitud máxima de secuencia, pero por la arquitectura y el corpus es probable que sea corta (típicamente 512 tokens en GPT-BERT, aunque no confirmado).
- Licencia MIT: permite uso comercial, pero el modelo no tiene utilidad práctica comercial debido a sus limitaciones.

## Enlaces

- Modelo en HuggingFace: [ezrawinston/gptbert-babycosmofine](https://huggingface.co/ezrawinston/gptbert-babycosmofine)
- Paper en OpenReview: [Learning syntax without semantics: Disentangled tiny language models](https://openreview.net/forum?id=p7HVrmZwWB)
- PDF del paper: [https://openreview.net/pdf?id=p7HVrmZwWB](https://openreview.net/pdf?id=p7HVrmZwWB)
- Repositorio de código y reproducción: [https://github.com/ezrawinston/sambal](https://github.com/ezrawinston/sambal)
- Dataset de entrenamiento: [ltg/babylm-2024-baby-cosmo-fine-10m](https://huggingface.co/datasets/ltg/babylm-2024-baby-cosmo-fine-10m)
- Paper original de GPT-BERT: [arXiv:2410.24159](https://arxiv.org/abs/2410.24159)
- Modelo contraparte con ablación SAMBAL: [ezrawinston/gptbert-sambal](https://huggingface.co/ezrawinston/gptbert-sambal)
