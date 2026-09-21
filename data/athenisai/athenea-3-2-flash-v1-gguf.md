# athenisai/athenea-3.2-flash-v1-gguf

## Resumen

ATHENEA 3.2 FLASH SMALL es un modelo de lenguaje de 2.697.198.592 parámetros (2,697 B) desarrollado por athenisai, publicado en HuggingFace como cuantización GGUF en FP16 puro. Se trata de un derivado afinado mediante SFT sobre el modelo base athenisai/athenea-3.2-flash-v1, que a su vez emplea la arquitectura Lfm2ForCausalLM: un diseño híbrido compuesto por 22 capas de convolución corta con doble compuerta (double-gated) y 8 capas de atención con query agrupadas (GQA) con 32 cabezas de consulta y 8 cabezas de clave/valor. El vocabulario es de 128.000 tokens y la ventana de contexto alcanza los 131.072 tokens, con embeddings atados.

El modelo se presenta como un modelo de razonamiento puro ("pure reasoning model"): su plantilla de chat, de tipo ChatML, mantiene siempre activo el bloque de pensamiento nativo de LFM2.5 mediante `preserve_thinking=True`, por lo que genera de forma sistemática trazas de razonamiento antes de la respuesta final. Las etiquetas del repositorio lo orientan a casos de uso agénticos y conversacionales, e indican compatibilidad con endpoints de inferencia.

Su relevancia práctica es doble. Por un lado, ofrece una ventana de contexto de 131.072 tokens en un tamaño de parámetros que cabe en hardware de consumo, algo poco habitual en esa franja. Por otro lado, al distribuirse en GGUF FP16 sin cuantizar, se puede ejecutar directamente con llama.cpp y llama-server, aunque el repositorio no incluye versiones cuantizadas a 8, 4 o menos bits, lo que limita su despliegue en GPUs con menos de 6-7 GB de VRAM. No se han publicado resultados de benchmarks ni datos de idiomas en la información disponible, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (híbrida: 22 capas de convolución corta double-gated + 8 capas GQA con 32 cabezas de consulta y 8 cabezas de clave/valor) |
| Parametros totales | 2.697.198.592 (2,697 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Solo FP16 puro (sin cuantizar) en este repositorio; no se listan cuantizaciones Q8, Q4 u otras |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (campo `license: other`, con `license_name: lfm1.0`) |
| Formato de pesos | GGUF (FP16) |
| Vocabulario | 128.000 tokens |
| Embeddings | Atados (tied embeddings) |
| Modelo base | athenisai/athenea-3.2-flash-v1 |
| Tamaño del repositorio | 5,4 GB |
| Parámetros de generación recomendados | temperature 0,1; top_k 50; repetition_penalty 1,1 |

## Arquitectura y entrenamiento

La arquitectura es Lfm2ForCausalLM, un diseño híbrido que combina bloques convolucionales y de atención. Concretamente, el modelo apila 22 capas de convolución corta con doble compuerta (double-gated) y 8 capas de atención con query agrupadas (GQA) configuradas con 32 cabezas de consulta y solo 8 cabezas de clave/valor. Esta proporción 32Q/8KV reduce el tamaño del KV cache respecto a un esquema de atención multi-cabeza completo, lo que resulta determinante para sostener una ventana de 131.072 tokens con un coste de memoria contenido. Los embeddings están atados entre la entrada y la salida, y el vocabulario se sitúa en 128.000 tokens.

En cuanto al entrenamiento, la model card indica únicamente que se realizó un ajuste supervisado (SFT) sobre el "athenea dataset", preservando el modo de pensamiento nativo de LFM2.5 (`preserve_thinking=True`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF, DPO u otros métodos de alineación. Tampoco se detallan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal más allá de la propia hibridación convolución/atención que define a la familia LFM2.

## Capacidades

- Generación de texto conversacional multi-turno, con la etiqueta `conversational` en el repositorio.
- Razonamiento explícito en modo pensamiento: el bloque de pensamiento está siempre activo porque el modelo se describe como "pure reasoning model", de modo que produce trazas de razonamiento antes de la respuesta final.
- Uso agéntico según las etiquetas del repositorio (`agentic`), orientado a flujos de varios pasos.
- Ventana de contexto de 131.072 tokens, adecuada para entradas de gran longitud en un único paso.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de código, matemáticas, visión o audio: no disponibles.
- Capacidades multilingües: no disponibles (no se declara la lista de idiomas).

## Casos de uso

- Razonamiento en producción con trazas auditables: al mantener siempre activo el bloque de pensamiento, el modelo permite registrar la cadena de razonamiento previa a la respuesta, útil en dominios donde se exige justificar la conclusión. Requiere un parser que separe el bloque de pensamiento del texto final.
- Procesamiento de documentos largos: sus 131.072 tokens de contexto permiten cargar contratos, informes o expedientes completos sin fragmentación, y formular preguntas sobre el conjunto en una sola llamada.
- Asistente conversacional multi-turno: el formato GGUF y los parámetros de generación recomendados (temperature 0,1; top_k 50; repetition_penalty 1,1) permiten desplegar un servicio de chat estable con llama-server sobre `-c 131072`.
- Despliegue local en estación de trabajo: con 2,697 B de parámetros en FP16 (unos 5,4 GB de pesos), el modelo cabe en GPUs de consumo con 8 GB o más, lo que habilita escenarios de privacidad donde los datos no salen del equipo.
- Flujos agénticos de varios pasos: la etiqueta `agentic` y el razonamiento siempre activo encajan con pipelines que encadenan planificación, consulta de herramientas y síntesis, siempre que se valide previamente el soporte real de function calling.
- Extracción y estructuración de información: sobre entradas largas, el modelo puede localizar y reformatear campos concretos dentro de documentos extensos aprovechando la ventana completa de contexto.
- Evaluación comparativa de modelos pequeños: dado su tamaño y su contexto inusualmente amplio para la franja de 2-3 B, sirve como punto de referencia en experimentos internos de selección de modelo, aunque no existan benchmarks públicos.
- Prototipado rápido con llama.cpp o interfaces compatibles con GGUF, sin necesidad de convertir pesos ni de infraestructura de servido especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La búsqueda web realizada no devolvió ningún enlace relevante al modelo: los resultados obtenidos correspondían exclusivamente a páginas de descarga de la aplicación de Facebook, sin relación con athenisai ni con la familia LFM2. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación que se puedan citar.

## Requisitos de hardware

- VRAM para los pesos: en FP16 los 2,697 B de parámetros ocupan aproximadamente 5,4 GB, coherente con el tamaño del repositorio (5,4 GB). No hay cuantizaciones menores en este repositorio que reduzcan esa cifra.
- VRAM para el KV cache: no disponible con exactitud, ya que no se especifica la dimensión de cabeza. Al emplear solo 8 cabezas de clave/valor (GQA), el coste por token es reducido en comparación con un esquema MHA, pero una secuencia de 131.072 tokens exige reservar memoria adicional significativa. En la práctica, conviene dimensionar `-c` según la VRAM disponible en lugar de usar siempre el máximo.
- GPU de consumo: el modelo debería caber en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 2070) si se limita la longitud de contexto; con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) se puede ampliar el contexto con holgura. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- GPU de gama alta: RTX 4090 (24 GB) o A100/H100 (40-80 GB) permiten mantener contextos largos y servir varias peticiones concurrentes.
- Opciones de despliegue: llama.cpp y llama-server están soportados de forma directa (la model card incluye un ejemplo con `-ngl 99 -c 131072 --temp 0.1 --top-k 50 --repeat-penalty 1.1`). También son viables los runners basados en GGUF, como Ollama o LM Studio. El soporte en vLLM o TGI no se puede confirmar con la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La arquitectura Lfm2ForCausalLM y la licencia lfm1.0 indican que el modelo deriva de la familia LFM2/LFM2.5, pero no se han aportado cifras de rendimiento, licencia ni especificaciones de las variantes de esa familia, ni de alternativas de tamaño equivalente, por lo que cualquier comparación cuantitativa sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| athenea-3.2-flash-v1-gguf | 2,697 B | 131.072 tokens | lfm1.0 | GGUF FP16 | Datos de esta ficha |
| Alternativas de la familia LFM2/LFM2.5 | no disponible | no disponible | no disponible | no disponible | No se han aportado especificaciones |
| Otras alternativas de ~2-3 B | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos: no hay ninguna evaluación publicada que permita estimar la calidad real del modelo en tareas de razonamiento, código o matemáticas.
- Idiomas no declarados: al no especificarse la lista de idiomas soportados, no se puede garantizar un rendimiento adecuado en castellano ni en otras lenguas distintas del inglés.
- Licencia lfm1.0: se trata de una licencia personalizada (`license: other`), no de una licencia de código abierto estándar. Es imprescindible revisar el texto completo de la licencia LFM antes de cualquier uso comercial, ya que puede imponer condiciones o umbrales de facturación.
- Razonamiento siempre activo: al ser un modelo de razonamiento puro con el bloque de pensamiento permanentemente habilitado, toda respuesta incluye una traza de razonamiento. Esto incrementa el consumo de tokens de salida y la latencia, y obliga a implementar un parser que separe el pensamiento de la respuesta final antes de mostrarla al usuario.
- Plantilla de chat específica: el modelo requiere la plantilla ChatML-like con el bloque de pensamiento de LFM2.5. Su uso con plantillas genéricas puede degradar la calidad de las respuestas.
- Riesgo de alucinación: no se ha publicado ningún estudio de fiabilidad ni de tasas de error; en tareas de recuperación de información sobre contextos de 131.072 tokens el riesgo de mezclar o inventar detalles es real y debe mitigarse con verificación.
- Sesgos: no hay información disponible sobre la composición del dataset de SFT ("athenea dataset"), por lo que no se pueden evaluar sesgos de género, raza, religión u orientación política.
- Un único formato de pesos: este repositorio solo publica FP16 GGUF. No hay versiones Q4/Q5/Q8, lo que descarta su uso en equipos con menos de 6-7 GB de VRAM sin recurrir a cuantización propia.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 "me gusta", sin issues ni discusiones públicas que permitan contrastar su comportamiento en producción.
- Fecha de publicación: la ficha del repositorio indica creación y actualización el 20 de septiembre de 2026, por lo que se trata de una publicación muy reciente y sin recorrido de uso.
- Soporte de tool calling no confirmado: aunque el repositorio se etiqueta como `agentic`, no se documenta el formato de function calling, por lo que su integración en pipelines de herramientas requiere validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/athenisai/athenea-3.2-flash-v1-gguf
- Modelo base: https://huggingface.co/athenisai/athenea-3.2-flash-v1
- Paper, blog o repositorio adicional: no disponible
- Demo o espacio de inferencia: no disponible
- Nota sobre la búsqueda web: los resultados obtenidos no contenían ningún enlace relevante al modelo; correspondían a páginas de descarga de la aplicación de Facebook y se han descartado.
