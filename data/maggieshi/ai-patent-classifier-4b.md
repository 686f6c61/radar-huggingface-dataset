# MaggieShi/AI-patent-classifier-4B

## Resumen

AI-patent-classifier-4B es un modelo de clasificación multietiqueta de textos de patentes, desarrollado por MaggieShi (con una réplica publicada bajo la organización xulab-research). Su función concreta es determinar si un resumen de patente (abstract) describe tecnología de inteligencia artificial y, en caso afirmativo, asignarle una o varias de ocho subcategorías de IA: procesamiento del conocimiento, reconocimiento de voz, hardware de IA, computación evolutiva, procesamiento del lenguaje natural, aprendizaje automático, visión por computador y planificación y control.

El modelo parte de Qwen/Qwen3-4B (4.023.912.969 parámetros) y se ha ajustado como clasificador de múltiples etiquetas con una cabeza de salida de tipo sigmoide, umbrales óptimos por clase y una restricción de negocio que impide predecir subcategorías de IA cuando la patente se clasifica como no-IA. Está pensado para el procesamiento por lotes de grandes volúmenes de patentes, un caso de uso típico en vigilancia tecnológica, gestión de propiedad intelectual y análisis de tendencias.

Su relevancia actual radica en la especialización: en lugar de emplear un LLM generalista con prompts largos para cada abstract, ofrece un clasificador dedicado, con umbrales calibrados por categoría y licencia Apache 2.0, lo que facilita su integración en pipelines de datos a escala. La información pública disponible es escasa (0 descargas y 0 likes en el momento de la consulta) y no incluye resultados de benchmarks ni detalles del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificación multietiqueta; requiere `trust_remote_code` (custom_code) |
| Parametros totales | 4.023.912.969 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de uso truncan a `max_length=256` tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precision original; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | chino (zh) e ingles (en); el autor indica que el modelo esta optimizado para patentes en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, sobre el que se añade una cabeza de clasificación con activación sigmoide para resolver un problema multietiqueta (una patente puede pertenecer simultáneamente a varias subcategorías de IA). La inferencia devuelve logits con forma `[batch, num_labels]`; la decisión final se toma aplicando un umbral específico por etiqueta, cargado desde el fichero `optimal_thresholds.json` que acompaña a los pesos. Además, se aplica una restricción lógica de negocio: si la patente se clasifica como no-IA, no se permiten predicciones de subcategorías de IA.

El autor no publica en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; tampoco se detalla el procedimiento de ajuste (fine-tuning supervisado, congelación de capas, etc.). Los únicos indicios técnicos son la optimización de umbrales por clase para maximizar el macro-F1 y la orientación del modelo a abstracts de patente en chino. No hay información disponible sobre innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria implícita de IA frente a no-IA a partir del texto de un abstract de patente.
- Clasificación multietiqueta en 8 subcategorías de IA: procesamiento del conocimiento, reconocimiento de voz, hardware de IA, computación evolutiva, procesamiento del lenguaje natural, aprendizaje automático, visión por computador y planificación y control.
- Umbrales calibrados por clase para maximizar el macro-F1, con posibilidad de ajustarlos en producción.
- Restricción de coherencia: no predice subcategorías de IA cuando la patente no es de IA.
- Procesamiento por lotes (`padding=True`, `truncation=True`) orientado a grandes volúmenes de abstracts.
- Soporte de chino e inglés, con optimización declarada para textos de patente en chino.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo de propósito general.

## Casos de uso

- Vigilancia tecnológica a escala: procesar por lotes los abstracts de un corpus de patentes (por ejemplo, todas las publicaciones anuales de una oficina nacional) y obtener etiquetas de subcategoría de IA para construir series temporales de actividad por campo.
- Gestión de carteras de propiedad intelectual: clasificar automáticamente las patentes de una empresa o de un competidor para identificar en qué subcampos de IA se está invirtiendo y detectar solapamientos con la propia cartera.
- Estudios de tendencias y bibliometría: agregar las predicciones por año, país o solicitante para medir el crecimiento relativo de áreas como visión por computador frente a planificación y control.
- Filtrado previo en pipelines de revisión: reducir el universo de patentes que un analista humano debe revisar, enviando solo las que superan los umbrales calibrados de cada subcategoría.
- Enriquecimiento de bases de datos internas: añadir etiquetas de subcategoría de IA a registros ya almacenados, con la ventaja de que el modelo aplica la restricción de coherencia (no-IA no recibe subcategorías).
- Monitorización competitiva automatizada: ejecutar el clasificador de forma periódica sobre nuevas publicaciones y generar alertas cuando aparezcan patentes en subcampos estratégicos concretos.
- Investigación académica sobre difusión de la IA: usar las etiquetas multietiqueta para estudiar la convergencia entre subcampos (por ejemplo, patentes que combinan aprendizaje automático y hardware de IA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la optimización de umbrales por clase para maximizar el macro-F1, pero no aporta cifras de F1, precisión, recall ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16, ~4.000 millones de parámetros): aproximadamente 8-9 GB solo para los pesos, más memoria para activaciones y lote; un lote de abstracts truncados a 256 tokens añade un consumo moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A10G para procesamiento por lotes de alto volumen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16 con lotes razonables.
- GPU de consumo: cabe en tarjetas con 12-16 GB de VRAM si se usa fp16 con lotes pequeños o cuantización a 8 bits; en 8 GB requeriría cuantización agresiva o lotes de tamaño 1.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True` (el método documentado por el autor); al ser un modelo de clasificación con código personalizado, no se garantiza compatibilidad directa con vLLM, TGI, llama.cpp u Ollama sin adaptación.
- Latencia y throughput: no disponibles; el autor solo indica que el modelo está optimizado para inferencia por lotes y recomienda GPU para obtener el mejor rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-patent-classifier-4B (MaggieShi) | 4,02 B | no disponible | Clasificacion multietiqueta de patentes de IA (8 subcategorias) | Apache 2.0 | Hugging Face (0 descargas) |
| xulab-research/AI-patent-classifier-4B | no disponible (copia del anterior) | no disponible | Igual | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (modelo base) | 4,02 B | no disponible en la informacion | Generacion de texto generalista | Apache 2.0 | Hugging Face |
| Clasificadores de patentes basados en BERT | no disponible | no disponible | Clasificacion de texto de patentes | variable | no disponible |

La comparativa con alternativas especializadas en clasificación de patentes no está disponible en la información proporcionada; el único contraste documentado es con el modelo base Qwen3-4B, que no resuelve la tarea de clasificación multietiqueta sin ajuste adicional.

## Limitaciones y advertencias

- Información pública muy escasa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni detalles del dataset de entrenamiento, lo que impide validar su calidad de forma independiente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en las etiquetas; los umbrales calibrados deben validarse sobre el dominio concreto antes de usarlos en producción.
- Sesgo de dominio: el modelo está optimizado para abstracts de patente en chino; su rendimiento en otros idiomas, en textos completos o en documentación técnica no relacionada con patentes no está documentado.
- Dependencia de `trust_remote_code=True` y de código personalizado, lo que implica revisar el código del repositorio antes de ejecutarlo en entornos sensibles.
- Restricción de longitud: los ejemplos truncan a 256 tokens, por lo que abstracts más largos pueden perder información relevante.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base Qwen3-4B y de cualquier dataset de entrenamiento no documentado.
- El repositorio ocupa 16,1 GB, coherente con pesos en precisión original; no se publican versiones cuantizadas oficiales, lo que limita el despliegue en hardware modesto.
- La model card del autor referencia el identificador `xulab-research/patent-classifier-4B` en el código de ejemplo, distinto del ID `MaggieShi/AI-patent-classifier-4B`; conviene comprobar cuál es el repositorio canónico y si los pesos y los umbrales son idénticos.

## Enlaces

- Hugging Face (MaggieShi): https://huggingface.co/MaggieShi/AI-patent-classifier-4B
- Hugging Face (xulab-research, AI-patent-classifier-4B): https://huggingface.co/xulab-research/AI-patent-classifier-4B
- Hugging Face (xulab-research, patent-classifier-4B): https://huggingface.co/xulab-research/patent-classifier-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
