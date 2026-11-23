# roskosmos19/Coral

## Resumen

Coral (también referenciado como Coral-MNLI) es un modelo de clasificación zero-shot publicado en Hugging Face por el usuario roskosmos19. Se presenta como un modelo BART-large ajustado sobre MultiNLI para tareas de inferencia de lenguaje natural (NLI) y clasificación de texto sin entrenamiento específico por tarea. El repositorio tiene 20 descargas y 1 like, y una licencia MIT.

La información más relevante del repositorio es la corrección publicada por el propio autor el 23 de noviembre de 2026: los pesos son byte a byte idénticos a `facebook/bart-large-mnli`, y el ajuste fino sobre MultiNLI fue realizado por Facebook AI, no en este repositorio. Es decir, Coral no aporta pesos nuevos ni un entrenamiento propio; es una redistribución del modelo base de Facebook con una model card propia y ejemplos de uso.

Por tanto, su relevancia práctica es limitada: cualquier evaluación de capacidades, sesgos o rendimiento debe remitirse al modelo original `facebook/bart-large-mnli`. Coral resulta útil únicamente como punto de entrada documentado en inglés para pipelines de `zero-shot-classification` con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-large (transformer encoder-decoder, usado como clasificador de secuencias) |
| Parametros totales | 407.344.133 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud máxima de secuencia; truncamiento por la izquierda, se conserva el inicio) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

BART-large es un transformer encoder-decoder con aproximadamente 400 millones de parámetros, preentrenado por Facebook AI con un objetivo de denoising (corrupción y reconstrucción de texto). Para la tarea NLI se utiliza la representación del token `<s>` como entrada a una cabeza de clasificación de secuencias con tres etiquetas: `contradiction`, `neutral` y `entailment`. El vocabulario es de 50.265 tokens.

Según la corrección del propio autor, los pesos de este repositorio son idénticos a los de `facebook/bart-large-mnli`; el ajuste fino sobre MultiNLI lo realizó Facebook AI. No hay, por tanto, entrenamiento adicional, RLHF, DPO ni innovaciones técnicas atribuibles a este repositorio. El dataset declarado es `multi_nli`. El flujo zero-shot consiste en convertir cada etiqueta candidata en una hipótesis del tipo «This example is {label}.» y usar la probabilidad de `entailment` como puntuación de la etiqueta.

## Capacidades

- Clasificación de texto zero-shot: ordena etiquetas candidatas por adecuación sin entrenamiento específico.
- Clasificación multi-etiqueta mediante `multi_label=True`, útil cuando varias etiquetas pueden ser ciertas a la vez.
- Inferencia de lenguaje natural (NLI) con las tres clases estándar.
- Detección de temática, sentimiento, intención y moderación de contenido, según la model card.
- Integración nativa con el pipeline `zero-shot-classification` de Transformers.
- Uso manual mediante `AutoModelForSequenceClassification` y `AutoTokenizer`, tomando solo las columnas de contradicción y entailment del logit.
- Solo inglés; no se documenta soporte multilingüe.
- No se documentan tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido: clasificar comentarios o publicaciones contra un conjunto de etiquetas de política (por ejemplo, «spam», «insulto», «contenido sexual») sin entrenar un clasificador ad hoc; el modelo puntúa cada etiqueta vía entailment.
- Enrutamiento de tickets de soporte: asignar cada mensaje entrante a un departamento (facturación, técnico, comercial) usando etiquetas claras y `multi_label=True` cuando un ticket toca varios temas.
- Etiquetado de datos para entrenamiento: preanotar grandes corpus con categorías provisionales y revisión humana posterior, aprovechando que no requiere ejemplos etiquetados.
- Análisis de sentimiento y opinión en reseñas cortas: clasificar textos breves contra etiquetas como «positivo», «negativo» o «neutro», escenario en el que la model card indica que el modelo suele ser preciso.
- Detección de intención en asistentes conversacionales: clasificar la consulta del usuario contra un catálogo de intenciones antes de derivar a un flujo específico.
- Filtrado y triaje de documentación interna: clasificar fragmentos de documentación o correos contra taxonomías de área (legal, técnico, recursos humanos) para indexación o búsqueda.
- Clasificación de titulares y noticias por tema: ordenar artículos contra una lista de temas editoriales sin reentrenar el modelo para cada taxonomía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó una evaluación propia para este repositorio y remite a `facebook/bart-large-mnli` para consultar métricas.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos (407 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,8 GB para pesos, más overhead; viable en GPUs consumer de gama media.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16; A100, H100, L4 o RTX 4090 no son necesarias para este tamaño, pero permiten lotes grandes y mayor throughput.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: `transformers` con pipeline `zero-shot-classification`, `AutoModelForSequenceClassification`, y servidores de inferencia compatibles con Transformers (por ejemplo, TGI o endpoints de Hugging Face). No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del número de etiquetas candidatas (cada etiqueta implica una pasada de inferencia) y de la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| roskosmos19/Coral | 407 M | 1024 tokens | Clasificación zero-shot / NLI | MIT | Pesos idénticos a `facebook/bart-large-mnli` según el propio autor |
| facebook/bart-large-mnli | 407 M | 1024 tokens | Clasificación zero-shot / NLI | MIT | Modelo original de Facebook AI; referencia para evaluación y métricas |
| facebook/bart-large | 407 M | 1024 tokens | Generación y comprensión de texto | MIT | Base sin ajuste NLI; no apto directamente para zero-shot classification |
| typeform/distilbert-base-uncased-mnli | no disponible | 512 tokens | Clasificación zero-shot / NLI | no disponible | Alternativa más pequeña y rápida, con menor capacidad de contexto |

## Limitaciones y advertencias

- Solo inglés: no hay soporte documentado para castellano ni otros idiomas.
- Los resultados dependen fuertemente de la redacción de las etiquetas candidatas; pequeñas variaciones pueden alterar el ranking.
- Las entradas de más de 1024 tokens se truncan y se conserva el inicio del texto, por lo que el contenido relevante al final puede perderse.
- Las puntuaciones no son probabilidades calibradas; no deben interpretarse como confianza absoluta en producción.
- Puede reflejar sesgos presentes en MultiNLI y en los datos de preentrenamiento de BART.
- No se ejecutó evaluación propia en este repositorio; las métricas deben tomarse de `facebook/bart-large-mnli`.
- Al ser una redistribución de pesos existentes, no aporta mejoras de rendimiento respecto al modelo base; conviene usar directamente `facebook/bart-large-mnli` si se busca el modelo original.
- La licencia MIT del repositorio se aplica a los artefactos publicados; conviene verificar la licencia del modelo base antes de un uso comercial.
- El repositorio tiene un tamaño de 6,9 GB, superior al esperado para 407 M de parámetros en safetensors, lo que sugiere artefactos adicionales o duplicados; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Coral
- Modelo base: https://huggingface.co/facebook/bart-large-mnli
- Licencia del repositorio: https://huggingface.co/roskosmos19/Coral/blob/main/LICENSE
- Dataset MultiNLI: https://huggingface.co/datasets/multi_nli
- Documentación del pipeline zero-shot-classification: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.ZeroShotClassificationPipeline
