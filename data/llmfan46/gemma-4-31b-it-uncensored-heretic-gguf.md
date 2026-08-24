# llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF

## Resumen

El modelo `llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF` es una versión decensurada del modelo multimodal `google/gemma-4-31B-it`, desarrollada por el contribuidor independiente llmfan46 mediante la técnica de ablación de capas llamada Heretic, en su variante Arbitrary-Rank Ablation (ARA). El objetivo es reducir drásticamente los rechazos del modelo ante solicitudes consideradas sensibles o controvertidas, manteniendo al mismo tiempo la calidad general del modelo original. Según los datos publicados, se logra una reducción del 99% al 10% de rechazos (10/100 frente a 99/100) con una divergencia KL de 0,0541, lo que indica que la distribución de salidas apenas se aleja de la del modelo original.

Con 30.697.345.596 parámetros (aproximadamente 31B) y una ventana de contexto de 262.144 tokens, este modelo es multimodal (procesa texto e imágenes) y está disponible en formato GGUF para su ejecución local con llama.cpp, Ollama y otros motores compatibles. La licencia es Apache 2.0, aunque el modelo base Gemma 4 tiene sus propios términos de uso. Es relevante para desarrolladores que necesitan un modelo de gran tamaño con respuestas menos restrictivas, manteniendo la arquitectura de vision-language de Gemma 4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión + texto) |
| Parametros totales | 30.697.345.596 (aprox. 31B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (Q4_K_M y otras cuantizaciones disponibles) |
| Idiomas soportados | Multilingüe (según el modelo base Gemma 4) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (repo) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer denso con arquitectura de lenguaje multimodal (vision-language) que acepta imágenes y texto como entrada. Sobre este modelo se aplicó la técnica de ablación de capas Heretic v1.2.0, concretamente el método Arbitrary-Rank Ablation (ARA). La ablación se aplicó a las capas 30 a 48, específicamente sobre el componente `attn.o_proj`, con parámetros de ablación: `start_layer_index=30`, `end_layer_index=48`, `preserve_good_behavior_weight=0,5437`, `steer_bad_behavior_weight=0,0005`, `overcorrect_relative_weight=0,9949` y `neighbor_count=15`.

No se indica que se haya realizado entrenamiento adicional (como RLHF o DPO); se trata de una modificación post-entrenamiento que altera los pesos de determinadas capas para eliminar los patrones de rechazo aprendidos durante el entrenamiento original. El resultado es un modelo que conserva el conocimiento y las capacidades generales del original, pero con una tasa de rechazo mucho menor.

## Capacidades

- Generación de texto y razonamiento en múltiples dominios (conocimiento general, matemáticas, código, ciencias, etc.) con una precisión similar al modelo original.
- Procesamiento de imágenes y texto (visión) gracias a su arquitectura multimodal.
- Soporte de tool calling y function calling, tal como se describe en el modelo base Gemma 4.
- Capacidad de agentes y razonamiento multi-paso, con una ventana de contexto amplia de 262.144 tokens para mantener conversaciones largas y contexto extenso.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se especifica la lista exacta en la ficha.
- Reducción significativa de rechazos: responde a solicitudes que el modelo original rechazaría, con una tasa de rechazo del 10% frente al 99% del original.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y responder sin las restricciones típicas de los modelos comerciales, lo que permite tratar quejas o temas delicados sin evasivas.
- **Generación de código en producción**: al soportar tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar y generar código, con la ventaja de no rechazar solicitudes de programación avanzada o de uso de librerías específicas.
- **Asistente de investigación académica**: su capacidad de razonamiento y conocimiento multidisciplinar lo hace útil para resumir papers, analizar datos y responder preguntas técnicas complejas, incluso en áreas sensibles como biología, medicina o derecho.
- **Creación de contenido creativo**: puede generar narrativas, guiones o diálogos sin las restricciones de contenido del modelo original, útil para escritores que necesitan explorar temas tabú o controvertidos en sus obras.
- **Análisis de documentos con imágenes**: al ser multimodal, puede extraer y razonar sobre información de imágenes, gráficos o documentos escaneados, por ejemplo para revisar contratos o informes técnicos.
- **Prototipado de agentes autónomos**: su soporte de function calling y su baja tasa de rechazo lo hacen adecuado para probar agentes que interactúan con herramientas externas (APIs, bases de datos) sin que el modelo se niegue a ejecutar acciones consideradas de riesgo.

## Benchmarks y rendimiento

La información proporcionada incluye únicamente los resultados de MMLU del modelo original `gemma-4-31B-it` (no del modelo decensado). No se han publicado resultados de benchmarks específicos para la versión decensada en la información disponible.

| Benchmark | Modelo original (gemma-4-31B-it) | Modelo decensado (heretic) |
|---|---|---|
| MMLU (precisión general) | 86,50% (6073/7021 correctas) | No disponible |
| Refusals (tasa de rechazo) | 99/100 | 10/100 |
| Divergencia KL vs original | 0 | 0,0541 |

Se observa que el modelo decensado mantiene una divergencia KL baja (0,0541), lo que sugiere que su comportamiento general es muy similar al del original, pero con una tasa de rechazo mucho menor. No se han publicado resultados de HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: según la fuente llmrun.dev, la cuantización Q4_K_M requiere aproximadamente 20,39 GB de VRAM para la inferencia.
- **GPU recomendadas**: para ejecutar el modelo en Q4_K_M se recomienda una GPU con al menos 24 GB de VRAM, como la RTX 4090, RTX 6000 Ada, o A100 (40 GB) para margen adicional. Para cuantizaciones más bajas (por ejemplo, Q2_K) podría caber en GPUs de 16 GB, aunque no se especifican los tamaños exactos de todas las cuantizaciones.
- **Consumer GPU**: es posible ejecutarlo en una RTX 4090 (24 GB) con Q4_K_M, pero no en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin cuantizaciones muy agresivas.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores basados en GGML. Para un uso más eficiente en servidores, se puede convertir a otros formatos y usar vLLM o TGI, aunque requeriría más memoria.
- **Latencia y throughput**: no se proporcionan datos exactos. Con 31B parámetros, la generación será de varios tokens por segundo en una GPU de 24 GB, dependiendo de la cuantización y del número de tokens de contexto.

## Comparativa con modelos similares

Comparación con otros modelos de ~30B parámetros y con el modelo original:

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Observaciones |
|---|---|---|---|---|---|
| `llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF` | 30,7B | 262K | Apache 2.0 | Sí | Decensado, baja tasa de rechazo |
| `google/gemma-4-31B-it` | 30,7B | 262K | Apache 2.0 | Sí | Modelo original, alto rechazo (99/100) |
| `Qwen/Qwen2.5-32B-Instruct` | 32,5B | 32K | Apache 2.0 | No | Solo texto, sin decensado |
| `meta-llama/Llama-3.1-32B-Instruct` | 32,4B | 128K | Llama 3.1 | No | Solo texto, sin decensado |

El modelo decensado se diferencia principalmente por su política de contenido más laxa, manteniendo el resto de características del Gemma 4 (visión, contexto largo). En comparación con Qwen o Llama, no tiene visión, por lo que para casos que requieran procesamiento de imágenes, este modelo es más adecuado.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo LLM, puede generar información falsa o sesgada, especialmente en temas delicados. La ablación no elimina este riesgo.
- **Riesgo de contenido inapropiado**: al reducir los rechazos, el modelo puede generar contenido que el original bloquearía, como lenguaje ofensivo, instrucciones peligrosas o material sexual explícito. Su uso debe ser responsable y bajo la responsabilidad del desarrollador.
- **Pérdida de calidad mínima**: aunque la divergencia KL es baja (0,0541), existe una ligera diferencia en el comportamiento respecto al original, que podría afectar a ciertas tareas.
- **Licencia**: aunque el repositorio indica Apache 2.0, el modelo base Gemma 4 tiene su propia licencia (enlace en la model card). Es importante revisar los términos de la licencia de Gemma 4 antes de un uso comercial.
- **No hay benchmarks completos**: no se han publicado resultados de benchmarks del modelo decensado más allá del MMLU del original y la tasa de rechazo. La calidad real en tareas específicas no está validada.
- **Requisitos de hardware**: el tamaño del modelo (31B) hace que su despliegue en entornos de producción requiera al menos 24 GB de VRAM para cuantizaciones razonables, lo que limita su uso en equipos de bajo presupuesto.

## Enlaces

- Modelo GGUF: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Repositorio Heretic: https://github.com/p-e-w/heretic
- PR de Arbitrary-Rank Ablation: https://github.com/p-e-w/heretic/pull/211
- Página de requisitos de hardware (llmrun.dev): https://llmrun.dev/model/llmfan46-gemma-4-31b-it-uncensored-heretic
- Guía de ejecución local (locallyuncensored.com): https://locallyuncensored.com/blog/gemma-4-local-guide.html
