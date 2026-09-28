# 9zigen/gemma-4-e4b-fp8

## Resumen

9zigen/gemma-4-e4b-fp8 es un checkpoint de pesos alojado en HuggingFace por el usuario 9zigen (no se trata de una publicación oficial de Google DeepMind, pese a que el tag `gemma4` sugiere que deriva de la familia Gemma 4). El repositorio contiene 7.941.100.874 parámetros almacenados en safetensors con el formato de cuantización `compressed-tensors`, es decir, una versión en FP8 del modelo. El tamaño total del repositorio es de 11,6 GB, lo que equivale a unos 1,46 bytes por parámetro.

El interés de este tipo de publicación es práctico: los pesos en FP8 con `compressed-tensors` están pensados para servirse con motores de inferencia como vLLM, que aplican kernels de cuantización (por ejemplo, esquemas tipo FP8 W8A8 con escalas por canal o por bloque) para reducir la huella de memoria y aumentar el throughput respecto a un checkpoint en BF16. En un modelo de ~8.000 millones de parámetros, esto puede suponer una reducción cercana a la mitad del espacio ocupado por los pesos en VRAM.

La limitación principal de esta ficha es documental: la model card del repositorio únicamente contiene el campo `license: gemma`, sin descripción de arquitectura, datos de entrenamiento, idiomas, benchmarks ni instrucciones de uso. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad. Todos los datos que no figuran en los metadatos se marcan explícitamente como "no disponible" y no deben darse por supuestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el tag del repositorio indica pertenencia a la familia `gemma4`; no hay descripción en la model card) |
| Parámetros totales | 7.941.100.874 (dato obtenido de los tensores en safetensors) |
| Parámetros activos | No disponible (no se confirma si la nomenclatura "E4B" implica arquitectura con parámetros efectivos o con mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 mediante `compressed-tensors` (según el nombre del repositorio y el tag `compressed-tensors`); no se documentan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | Gemma (`license:gemma`, Gemma Terms of Use) |
| Formato de pesos | Safetensors con cuantización `compressed-tensors` (FP8) |
| Tamaño del repositorio | 11,6 GB |
| Fecha de creación / actualización | 2026-09-27 / 2026-09-27 (según los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no aporta ningún dato sobre la arquitectura interna, el proceso de entrenamiento, la composición del dataset, el número de tokens vistos ni la existencia de fases de ajuste fino con RLHF, DPO o similares. El único indicio estructural disponible son los tags del repositorio: `gemma4` (familia del modelo base), `compressed-tensors` (formato de cuantización) y `safetensors` (formato de serialización). El nombre del repositorio incluye además el sufijo `fp8`, coherente con el formato de pesos anunciado.

Sí es verificable un dato cuantitativo: el cociente entre el tamaño del repositorio (11,6 GB) y el número de parámetros (7,94 mil millones) es de aproximadamente 1,46 bytes por parámetro. Una cuantización FP8 pura (1 byte por parámetro) dejaría los pesos en torno a 7,9 GB, de modo que el exceso de tamaño apunta a que una parte de los tensores (posiblemente embeddings, cabezas de salida o módulos no cuantizados) se conserva en una precisión superior, o a la presencia de metadatos y escalas de cuantización adicionales. Se trata de una observación derivada de la aritmética, no de información publicada por el autor.

Respecto a la nomenclatura "E4B", conviene ser cauto: en otras familias de la línea Gemma el prefijo "E" se ha empleado para designar parámetros "efectivos" en arquitecturas que no activan la totalidad de los pesos en cada paso. No hay ninguna confirmación en este repositorio de que ese sea el caso, ni de que existan capas de mezcla de expertos (MoE) o mecanismos de atención lineal. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto: no documentada en la información disponible, aunque es la función esperada de un modelo de lenguaje de ~8.000 millones de parámetros.
- Razonamiento, matemáticas y generación de código: no documentados; no se han publicado evaluaciones que los respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no figura en los metadatos ni en la model card).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidad verificable: el checkpoint se distribuye como pesos safetensors cuantizados con `compressed-tensors`, por lo que es cargable por motores de inferencia compatibles con ese formato (por ejemplo, vLLM), siempre que el modelo base esté soportado por dicha versión del motor.

## Casos de uso

Ninguno de los siguientes casos está respaldado por documentación del autor; se plantean como aplicaciones plausibles de un checkpoint FP8 de ~8.000 millones de parámetros, sujetas a validación empírica previa a cualquier uso en producción.

- Servicio de inferencia con vLLM: el formato `compressed-tensors` es el que vLLM consume de forma nativa para checkpoints FP8, de modo que este repositorio puede desplegarse como servidor compatible con la API de OpenAI para sustituir a un modelo BF16 equivalente reduciendo el consumo de VRAM de los pesos a aproximadamente la mitad.
- Despliegue en una única GPU de gama alta de consumo: con alrededor de 8 GB de pesos más caché KV y buffers, el modelo puede caber en tarjetas de 24 GB (RTX 3090, RTX 4090) dejando margen para contextos moderados, lo que permite prototipado local sin depender de clústeres.
- Evaluación comparativa de cuantización: el repositorio sirve como material para medir la degradación de calidad de FP8 frente a BF16 en tareas concretas (resumen, clasificación, generación de código) usando un conjunto de evaluación propio antes de adoptar la cuantización en producción.
- Backend de generación de código en un IDE autoalojado: un modelo de este tamaño puede integrarse detrás de un servidor de completado para autocompletar y explicar código dentro de una red corporativa; requiere verificar previamente la calidad real del modelo base en tareas de programación.
- Procesamiento por lotes de documentos con RAG: combinado con un índice vectorial, el modelo puede redactar respuestas extractivas sobre documentación interna; conviene fijar un límite de contexto conservador hasta conocer la ventana real del modelo base.
- Ajuste fino con adaptadores LoRA: al ser un checkpoint cuantizado en FP8, el entrenamiento de adaptadores exige herramientas compatibles (por ejemplo, variantes de PEFT con cuantización) y una GPU con suficiente memoria; úsese solo si se confirma la compatibilidad del formato `compressed-tensors` con el pipeline de entrenamiento elegido.
- Filtrado y clasificación de texto a gran escala: por su tamaño contenido y su menor coste de memoria, puede emplearse para tareas de etiquetado o moderación por lotes donde no se requiere razonamiento complejo, siempre con métricas de precisión medidas sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye ninguna evaluación (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes), y tampoco se dispone de comparaciones frente al checkpoint sin cuantizar del que deriva. No se presentan cifras estimadas porque cualquier valor sería inventado.

## Requisitos de hardware

- VRAM para los pesos: partiendo de 7,94 mil millones de parámetros en FP8 (1 byte por parámetro), la huella teórica de los pesos es de unos 7,9 GB. Dado que el repositorio ocupa 11,6 GB, conviene reservar entre 9 y 12 GB para pesos y metadatos de cuantización.
- VRAM total con caché KV: no disponible, porque se desconoce la longitud de contexto, el número de capas y la configuración de cabezas de atención del modelo base. Como referencia de orden de magnitud, un modelo denso de ~8B con contexto de 8.000 tokens suele requerir 2-4 GB adicionales de caché KV.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB) y RTX 3090 (24 GB); en RTX 4080 (16 GB) el ajuste es más estrecho y dependerá del contexto y del tamaño del lote. No se recomienda para GPUs de 8-12 GB en FP8 sin recurrir a offloading.
- GPU de centro de datos con FP8 nativo: H100, H200, L40S y B200 pueden ejecutar kernels FP8 nativos, que es donde la cuantización rinde mejor. En A100 (arquitectura Ampere) no existe soporte nativo de FP8, por lo que el motor debe decuantizar a FP16/BF16 y se pierde parte de la ventaja de memoria y velocidad.
- Opciones de despliegue: vLLM es la opción más directa por su soporte de `compressed-tensors`. TGI y SGLang ofrecen soporte variable según versión para este formato. llama.cpp y Ollama trabajan con GGUF, por lo que requerirían convertir el checkpoint a ese formato, algo no garantizado para pesos `compressed-tensors`.
- Latencia y throughput: no disponibles. Dependen del motor, del hardware, del tamaño de lote y de la longitud de contexto, ninguno de los cuales está documentado.
- Almacenamiento: prever al menos 12 GB para el repositorio completo más 12-15 GB adicionales si se cachean pesos en disco o se generan conversiones.

## Comparativa con modelos similares

No se dispone de benchmarks del modelo evaluado, por lo que no es posible establecer una comparación de rendimiento fiable. La tabla siguiente recoge únicamente los parámetros estructurales y de licencia que sí son verificables, junto con alternativas de tamaño comparable y sus datos públicos conocidos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| 9zigen/gemma-4-e4b-fp8 | 7,94 mil millones | No disponible | Gemma Terms of Use | Safetensors FP8 (`compressed-tensors`) | No disponible |
| Gemma 4 E4B (checkpoint original, si existe) | No disponible | No disponible | Gemma Terms of Use | Presumiblemente safetensors BF16 | No disponible |
| Llama 3.1 8B Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | Safetensors BF16, GGUF | Benchmarks públicos disponibles |
| Qwen2.5 7B Instruct | 7,62 mil millones | 128.000 tokens | Apache 2.0 (mayoría de variantes) | Safetensors BF16, GGUF, AWQ, GPTQ | Benchmarks públicos disponibles |

Nota: las filas de Llama 3.1 8B y Qwen2.5 7B se incluyen solo como referencia de categoría (modelos densos de ~7-8B con licencia permisiva en distinto grado). No implican que este checkpoint tenga un rendimiento equivalente ni comparable, ya que no existe ninguna medición publicada.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene el campo de licencia. No hay información sobre arquitectura, datos de entrenamiento, idiomas, sesgos ni alineación, lo que impide evaluar riesgos de sesgo o de generación de contenido inapropiado.
- Autor no oficial: el repositorio no pertenece a Google DeepMind. No hay garantía de que los pesos correspondan fielmente al modelo base ni de que el proceso de cuantización se haya validado.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes de calidad ni de reproducibilidad.
- Riesgo de alucinación: no evaluado. No se ha publicado ninguna medición de fidelidad factual para este checkpoint.
- Degradación por cuantización: la conversión a FP8 puede reducir la precisión respecto al modelo en BF16. La magnitud de esa pérdida es desconocida en este caso, ya que no hay benchmarks comparativos.
- Idiomas y contexto: se desconocen tanto la cobertura idiomática como la ventana de contexto real, lo que impide planificar aplicaciones multilingües o de contexto largo.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que incluyen una política de uso prohibido y obligaciones de redistribución de los términos y avisos. Es responsabilidad del integrador revisar dichos términos, especialmente si el modelo se incorpora a un producto o se redistribuye. Esta ficha no constituye asesoramiento jurídico.
- Fecha de creación inusual: los metadatos indican 2026-09-27, posterior al rango temporal habitual de las publicaciones consultadas. Conviene verificar la autenticidad y vigencia del repositorio antes de usarlo.
- Soporte de herramientas: no se ha confirmado compatibilidad con PEFT, entrenamiento con LoRA, ni pipelines de `transformers` estándar para este formato cuantizado; puede requerir versiones específicas de vLLM o de `compressed-tensors`.
- Recomendación operativa: antes de cualquier uso en producción, validar el checkpoint con un conjunto de evaluación propio, comparar contra el modelo sin cuantizar si está disponible y fijar salvaguardas de entrada y salida como en cualquier modelo no documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/9zigen/gemma-4-e4b-fp8
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de código, demos o documentación del autor) en la información proporcionada.
