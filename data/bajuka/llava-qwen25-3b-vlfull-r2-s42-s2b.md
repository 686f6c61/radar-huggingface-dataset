# BAJUKA/LLaVA-qwen25-3b-VLfull-r2-s42-s2b

## Resumen

LLaVA-qwen25-3b-VLfull-r2-s42-s2b es un modelo vision-lenguaje (image-text-to-text) de 3.490.246.176 parámetros publicado por el usuario BAJUKA en HuggingFace. Se construye sobre el backbone de texto Qwen/Qwen2.5-3B-Instruct y añade una torre de visión google/siglip-so400m-patch14-384 conectada mediante un proyector multimodal, siguiendo la arquitectura y el código de LLaVA-NeXT. No es un lanzamiento de producto: es el brazo «VL-full» de una rejilla de experimentos controlados que compara entrenamiento visual frente a entrenamiento solo de texto, con semilla 42 y muestra de mezcla de datos r2.

El checkpoint corresponde a la etapa S2b (instruct stage) del análogo de tres etapas de LLaVA-OneVision, inicializado desde el checkpoint S2a del mismo brazo. Durante esta etapa se entrenaron simultáneamente el proyector, la torre de visión y el modelo de lenguaje sobre una mezcla de 747.754 ejemplos (697.798 de instruct_700k_r2 y 49.956 de language_50k_v2), durante 5.841 pasos con batch global 128 y precisión bfloat16, alcanzando una pérdida de 1,216 a 0,669.

Su relevancia es metodológica más que de rendimiento: al compartir mezclas, orden de ejemplos, optimizador y schedule de learning rate entre todos los brazos de la rejilla, las diferencias observadas entre checkpoints son atribuibles a las variables controladas (datos, orden y módulos entrenables), no a factores de confusión. El propio autor advierte que no es un release ajustado ni alineado en seguridad, y que no se realizó selección de checkpoint ni early stopping.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) + torre de visión SigLIP + proyector MLP multimodal, implementación LLaVA-NeXT |
| Parametros totales | 3.490.246.176 (aprox. 3,49 B, incluyendo torre de visión y proyector) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de secuencia máxima durante el entrenamiento; el backbone Qwen2.5-3B-Instruct soporta 32.768 en su versión original (no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en bfloat16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; hereda las capacidades del backbone Qwen2.5-3B-Instruct |
| Licencia | other / qwen-research (licencia de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (tamaño de repositorio: 7,0 GB) |
| Torre de vision | google/siglip-so400m-patch14-384, resolución anyres_max_9 |
| Clase de carga | LlavaQwenForCausalLM (llava_qwen), fuera de transformers |
| Plantilla de prompt | qwen_2_5 |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo sigue el diseño estándar de LLaVA-NeXT: un codificador visual SigLIP-so400m a resolución 384 con estrategia anyres_max_9 (que divide la imagen en múltiples parches de resolución nativa más una vista global), un adaptador MLP que proyecta las características visuales al espacio de embeddings del modelo de lenguaje, y el decoder Qwen2.5-3B-Instruct como generador. La innovación aquí no está en la arquitectura, sino en el protocolo experimental: el brazo VL-full entrena la pila visual completa sobre el proyector de la etapa 1 y ejecuta las etapas de forma secuencial heredando la semilla, de modo que el checkpoint S2a es exactamente el brazo «cap-only» de esa semilla. Ambos se publican por separado.

La etapa S2b se entrenó sobre la mezcla INS-750K (muestra r2): instruct_700k_r2 con 697.798 ejemplos y language_50k_v2 con 49.956, sumando 747.754. Los módulos entrenables fueron mm_vision_tower, mm_mlp_adapter y mm_language_model. Se usó learning rate de 1e-5 para el modelo de lenguaje y el proyector y 2e-6 para la torre de visión, con schedule cosine y warmup ratio 0,03, batch global 128, precisión bfloat16 y secuencia máxima de 8.192 tokens. El entrenamiento se ejecutó en 4x H100 80 GB con DeepSpeed ZeRO-3 y completó una época (5.841 de 5.841 pasos). La pérdida pasó de 1,216 a 0,669, con media de 0,729 en los últimos 50 pasos registrados y cero pérdidas no finitas. No se aplicaron RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del backbone Qwen2.5-3B-Instruct, con el que comparte tokenizador y plantilla de prompt (qwen_2_5).
- Comprensión de imagen a texto (image-text-to-text): descripción de escenas, respuesta a preguntas visuales y diálogo sobre imágenes, con entrada de imagen en resolución nativa mediante anyres_max_9.
- Razonamiento multimodal combinado: la torre SigLIP y el proyector entrenados permiten condicionar la generación de texto en el contenido visual.
- Capacidades de texto del backbone: razonamiento básico, generación de código, matemáticas elementales y seguimiento de instrucciones, en el rango esperable para un modelo de 3 B.
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card; el backbone Qwen2.5-3B-Instruct incorpora soporte de function calling, pero no se documenta si se preserva tras el fine-tuning multimodal.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ningún modo de razonamiento extendido ni «thinking mode».
- Capacidades multilingües: no disponibles explícitamente; dependen del backbone.
- Capacidades especiales: no se documentan visión de vídeo, audio ni decodificación especulativa.

## Casos de uso

- Investigación en entrenamiento multimodal controlado: el caso de uso principal y para el que fue diseñado. Permite reproducir y comparar el efecto de entrenar la pila visual completa frente a entrenar solo el proyector, manteniendo constantes mezcla de datos, orden, optimizador y schedule, con la semilla 42 como referencia.
- Réplica de experimentos de ablación: al publicarse por separado los checkpoints S2a y S2b del mismo brazo, se puede medir la contribución incremental de la etapa de instrucción multimodal partiendo de un punto idéntico.
- Generación de descripciones de imágenes en lotes de investigación: con 8.192 tokens de secuencia máxima y entrada anyres_max_9, es adecuado para tareas de captioning y VQA sobre conjuntos de evaluación, sin pretensiones de producción.
- Prototipado de asistentes visuales de bajo coste: sus 3,49 B de parámetros permiten ejecutarlo en una GPU de consumo, útil para validar ideas de producto antes de escalar a modelos mayores.
- Docencia y divulgación sobre arquitecturas VLM: el repositorio incluye el trainer_state.json con el historial completo de pérdida, norma del gradiente y learning rate por paso, lo que lo convierte en material didáctico sobre dinámica de entrenamiento multimodal.
- Evaluación de la transferencia texto-visión: sirve para estudiar cuánto del rendimiento en texto del backbone Qwen2.5-3B-Instruct sobrevive al fine-tuning sobre 747.754 ejemplos multimodales.
- Extracción de información de documentos e imágenes sencillas: tareas de lectura de capturas, diagramas simples o imágenes de producto, siempre con validación humana y asumiendo el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de 1,216 a 0,669, media de 0,729 en los últimos 50 pasos registrados y cero pérdidas no finitas en 5.841 pasos. No hay datos de MMLU, HumanEval, GSM8K, MMMU, VQAv2, TextVQA ni de ninguna otra evaluación estándar.

| Metrica de entrenamiento | Valor |
|---|---|
| Pasos completados | 5.841 / 5.841 (época 0,9999 de 1) |
| Pérdida inicial | 1,216 |
| Pérdida final | 0,669 |
| Media de pérdida (últimos 50 pasos) | 0,729 |
| Pérdidas no finitas | 0 sobre 5.841 pasos |
| Batch global | 128 |
| Learning rate | 1e-5 (LM y proyector), 2e-6 (torre de visión), cosine, warmup 0,03 |
| Precisión | bfloat16 |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 7,0 GB (coincide con el tamaño del repositorio). Con caché KV y activaciones para contexto moderado, el consumo total se sitúa en torno a 10-12 GB de VRAM.
- Cuantización int8: unos 3,5-4 GB de pesos, más caché KV.
- Cuantización int4: unos 2-2,5 GB de pesos, más caché KV. No hay GGUF publicado, por lo que habría que generarlo.
- GPU recomendadas para entrenamiento o ajuste fino: 4x H100 80 GB con DeepSpeed ZeRO-3, configuración usada por el autor para realizar la etapa S2b.
- GPU para inferencia: cabe sin problemas en una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 (40/80 GB) en bfloat16. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es viable en bfloat16 con contexto reducido, y en tarjetas de 12 GB (RTX 3060) requiere cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en la mayoría de GPU de consumo modernas, especialmente con cuantización.
- Opciones de despliegue: la carga oficial requiere el repositorio LLaVA-NeXT con la clase LlavaQwenForCausalLM mediante llava.model.builder.load_pretrained_model(..., "llava_qwen"), ya que no forma parte de transformers. No se publican archivos GGUF, por lo que llama.cpp y Ollama no son utilizables sin una conversión previa. El soporte en vLLM o TGI no está documentado para este checkpoint concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| LLaVA-qwen25-3b-VLfull-r2-s42-s2b | 3,49 B | 8.192 (entrenamiento) | qwen-research | safetensors, requiere LLaVA-NeXT | Sin benchmarks publicados; pérdida final 0,669 |
| Qwen2.5-VL-3B-Instruct | aprox. 3,75 B | 32.768 en su model card | Apache 2.0 | transformers, vLLM, amplio ecosistema | Benchmarks publicados por Qwen; no comparables directamente con este checkpoint |
| LLaVA-OneVision-Qwen2-7B | 7 B | 32.768 | Apache 2.0 | Repositorio LLaVA-NeXT | Benchmarks publicados por el equipo de LLaVA |
| InternVL2-4B | aprox. 4 B | no disponible | MIT | transformers con remote code | Benchmarks publicados por el equipo de InternVL |

La comparación de rendimiento con estas alternativas no es posible con los datos disponibles: el modelo de BAJUKA no publica ninguna evaluación estándar, y sus condiciones de entrenamiento (una época, 747.754 ejemplos, sin alineación) difieren de las de los releases comerciales o de investigación comparables. La comparación relevante es interna, contra los demás brazos de la misma rejilla experimental.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe explícitamente como un checkpoint de comparación controlada, no como un release ajustado ni alineado en seguridad.
- Sesgos: no se documenta ningún análisis de sesgos. Al heredar el backbone Qwen2.5-3B-Instruct, es previsible que arrastre los sesgos presentes en sus datos de preentrenamiento, pero no hay medición publicada.
- Riesgo de alucinación: no evaluado. Un modelo de 3,49 B entrenado una sola época sobre datos de instrucción multimodal presenta un riesgo de alucinación significativo, especialmente en tareas de OCR, conteo de objetos y lectura de texto en imágenes.
- Idiomas: la model card no especifica idiomas soportados; el comportamiento multilingüe depende por completo del backbone y no está medido tras el fine-tuning.
- Contexto limitado: 8.192 tokens de secuencia máxima en entrenamiento, inferior a los 32.768 del backbone original. No se documenta extensión por YaRN ni RoPE scaling.
- Licencia: licencia qwen-research (etiquetada como «other»), la misma de Qwen/Qwen2.5-3B-Instruct. Es una licencia de investigación con condiciones de uso comercial restringidas; conviene revisar el texto completo antes de cualquier uso en producción.
- Sin selección de checkpoint: cada etapa ejecuta una época completa sin early stopping ni comparación de checkpoints intermedios, por lo que S2b no es necesariamente el mejor punto de la ejecución.
- Estado del optimizador no publicado: no se incluyen estados de optimizador, DeepSpeed ni RNG, por lo que el modelo solo sirve para inferencia y no para reanudar el entrenamiento exactamente.
- Integración limitada: requiere clonar el repositorio LLaVA-NeXT y usar una clase que no está en transformers, lo que complica el despliegue con herramientas estándar.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-qwen25-3b-VLfull-r2-s42-s2b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio de LLaVA-NeXT (necesario para cargar los pesos): https://github.com/LLaVA-VL/LLaVA-NeXT
- Torre de visión: https://huggingface.co/google/siglip-so400m-patch14-384
- Checkpoint S2a del mismo brazo (referenciado en la model card): LLaVA-qwen25-3b-VLfull-r2-s42/s2a
- Nota sobre la búsqueda web: los resultados devueltos corresponden a PubMed y no guardan relación con el modelo. No se han localizado papers, blogs ni demos específicos sobre este checkpoint en la información disponible.
