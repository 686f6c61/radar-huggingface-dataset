# OPENGCM/GTM-v2-base

## Resumen

GTM-v2-base es un modelo de lenguaje de tipo base (solo preentrenado), con arquitectura transformer decoder-only al estilo nanoGPT, desarrollado por OPENGCM y publicado bajo licencia Apache 2.0. Se trata de la segunda iteración de la serie GTM: un modelo pequeño, entrenado desde cero por el autor en una única GPU de estación de trabajo (RTX Pro 6000) sobre aproximadamente 4.160 millones de tokens, con un presupuesto de cómputo muy inferior al de los modelos habituales de su categoría. El checkpoint publicado declara unos 119,4 millones de parámetros según la model card (con embeddings y cabeza de salida atados), mientras que el recuento real de pesos en safetensors asciende a 154.875.776 parámetros, una discrepancia que el autor no explica.

El modelo no está ajustado por instrucciones ni alineado: completa y continúa texto, y no responde a preguntas ni sigue órdenes de forma fiable. Su contexto es de 1024 tokens, usa el tokenizador BPE de GPT-2 vía tiktoken (vocabulario de 50.257 entradas) y se distribuye únicamente en fp32 dentro de un repositorio de 0,6 GB. Su relevancia es fundamentalmente metodológica: documenta una receta de preentrenamiento reproducible en hardware asequible, con un esquema híbrido de optimizadores Muon + AdamW, y sirve como punto de partida para experimentos de investigación o para ajustes posteriores propios.

No debe confundirse con un asistente: el propio autor lo describe como un modelo de investigación u hobby, sin capacidad fiable de recuperación factual ni de generación de código funcional, y con tendencia a la repetición en decodificación greedy o con temperatura baja. La búsqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo, por lo que toda la información técnica procede de su model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT: 14 capas, 8 cabezas de atención, dimensión de embedding 704; usa la atención fusionada `scaled_dot_product_attention` de PyTorch (kernel tipo flash-attention) |
| Parametros totales | 154.875.776 según los pesos en safetensors; la model card declara ~119,4 M con embeddings y cabeza de salida atados (discrepancia no explicada por el autor) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible: el autor solo publica pesos en fp32 (entrenamiento con autocast en bf16); no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), compatible con PyTorch/Transformers |
| Tokenizador | tiktoken con codificación BPE de GPT-2 (`tiktoken.get_encoding("gpt2")`), vocabulario de 50.257 entradas; sin tokenizador propio |
| Optimizador | Muon para matrices de pesos 2D + AdamW para embeddings, capas de normalización y sesgos |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional, sin mezcla de expertos, sin mecanismos de estado recurrente (SSM) ni hibridaciones: 14 capas, 8 cabezas de atención, 704 dimensiones de embedding y atención implementada mediante la función fusionada `scaled_dot_product_attention` de PyTorch, lo que en la práctica emplea un kernel de flash-attention. El entrenamiento se realizó con autocast en bf16 y los pesos liberados están en fp32. La innovación más destacable de la receta es el esquema híbrido de optimizadores: Muon para las matrices de pesos bidimensionales y AdamW para embeddings, layernorms y sesgos, siguiendo recetas recientes de preentrenamiento eficiente.

El presupuesto de entrenamiento es de aproximadamente 4,16 mil millones de tokens (40.690 pasos con batch efectivo de 100 secuencias y contexto de 1024). Los datos se transmitieron en streaming mediante HuggingFace `datasets`, mezclados y tokenizados al vuelo, sin copia local fija, con la siguiente composición: FineWeb-Edu (`sample-10BT`) al 45 %, Cosmopedia-v2 al 30 %, FineMath (`finemath-4plus`) al 15 % y FineWeb (`sample-10BT`) al 10 %. El autor excluyó deliberadamente todo corpus de código (The Stack v2, StarCoderData, the-stack-smol) porque los repositorios alojados por BigCode exigen aceptar condiciones de uso y autenticarse en HuggingFace. No se menciona ningún proceso de RLHF, DPO o ajuste por instrucciones: este repositorio es exclusivamente el checkpoint base, y existe un plan de publicar más adelante una variante ajustada con SFT sobre UltraChat. La comparación con GPT-2 (124M) es explícita en la model card: GTM-v2-base se entrenó con aproximadamente una décima parte de los tokens de GPT-2 (~4B frente a ~40B) y en una sola GPU, no en un clúster multi-GPU.

## Capacidades

- Generación de texto en inglés: continuación de texto libre, completado de fragmentos y generación de texto con estructura superficial plausible.
- Modelado de lenguaje y puntuación por verosimilitud: puede emplearse para calcular pérdida por token y comparar respuestas candidatas (así se evaluó en los benchmarks publicados).
- Comprensión limitada de formatos de elección múltiple: rinde por encima del azar en HellaSwag, ARC-Easy y ARC-Challenge, siempre en el rango bajo (24-43 %).
- Reconocimiento de plantillas textuales: detecta patrones como listas numeradas o formularios de rellenar huecos y los reproduce, aunque tiende a quedarse bloqueado en ellos.
- Capacidades ausentes de forma explícita: no está ajustado por instrucciones, no mantiene conversaciones tipo chat, no responde preguntas de forma fiable, no realiza tool calling ni function calling, no soporta agentes ni razonamiento multi-paso, no tiene modo de pensamiento (thinking), no procesa visión ni audio, no genera código funcional y no tiene capacidad factual fiable.
- Multilingüismo: nulo más allá del inglés; el modelo se ha entrenado exclusivamente con corpus en inglés.

## Casos de uso

- Investigación sobre recetas de preentrenamiento eficiente: permite reproducir en una sola GPU el efecto del esquema Muon + AdamW frente a AdamW puro, comparando curvas de pérdida y perplejidad sobre la misma mezcla de datos (FineWeb-Edu, Cosmopedia-v2, FineMath, FineWeb).
- Punto de partida para ajuste supervisado propio: al ser un checkpoint base con licencia Apache 2.0, es un candidato barato para aplicar SFT o LoRA con datos propios en inglés, dado que el coste de fine-tuning de 155 M de parámetros es de minutos u horas en una GPU de consumo.
- Ablaciones sobre ponderación de corpus: su mezcla documentada (45/30/15/10) permite experimentar con variaciones y medir el impacto en la perplejidad por fuente, que el autor reporta de forma desglosada.
- Generación de texto sintético no factual para pruebas de software: rellenar campos, descripciones o textos de marcador de posición en inglés para validar pipelines de ingesta, indexación o interfaces, sin riesgo de comprometer datos reales.
- Docencia y divulgación sobre transformers: con 14 capas y 704 dimensiones, el modelo es inspeccionable; se pueden visualizar mapas de atención, analizar el impacto del atado de embeddings y estudiar el efecto del tokenizador GPT-2 BPE en la tokenización de texto técnico o matemático.
- Evaluación de infraestructura de inferencia: sirve como carga ligera y controlada para medir latencia y throughput de frameworks (Transformers, llama.cpp tras conversión a GGUF, vLLM) y comparar el overhead de cada stack, ya que el modelo cabe entero en memoria y el cuello de botella pasa a ser el runtime.
- Generación de borradores en inglés con revisión humana obligatoria: redacción de continuaciones de texto genéricas (descripciones, párrafos introductorios) en flujos donde un humano verifica cada salida, aceptando que el contenido factual puede ser inventado.
- Base para investigación en destilación y comparación de modelos pequeños: al existir GTM-v1-base (~100 M, ~3B tokens) y GTM-v2-base (~4,16B tokens) con la misma mezcla de datos, la serie permite estudiar el escalado de tokens en el régimen de los 100-150 M de parámetros.

## Benchmarks y rendimiento

Evaluación por puntuación de verosimilitud (comparación de la pérdida por token entre respuestas candidatas, sin generación ni muestreo), con 200 ejemplos por benchmark y el checkpoint final en el paso 40.690 (~4,16B tokens vistos):

| Benchmark | GTM-v2-base | GTM-v1-base | GPT-2 (124M) | Baseline aleatorio |
|---|---|---|---|---|
| HellaSwag | 33,0 % | 32,0 % | ~28-29 % | 25 % |
| ARC-Easy | 43,0 % | 42,5 % | ~39,2 % | ~25 % |
| ARC-Challenge | 24,0 % | 26,0 % | ~22,5 % | ~25 % |

Perplejidad de corpus por fuente (menor es mejor), sobre texto recién transmitido y no perteneciente a los shards de entrenamiento:

| Fuente | Perplejidad |
|---|---|
| Cosmopedia-v2 | 11,80 |
| FineMath | 13,04 |
| FineWeb-Edu | 27,68 |
| FineWeb | 47,34 |
| Global | 21,19 (frente a 22,87 de GTM-v1-base) |

El modelo mejora a su predecesor en HellaSwag, ARC-Easy y perplejidad global, pero retrocede en ARC-Challenge (24,0 % frente a 26,0 %); el autor advierte que con 200 ejemplos esta diferencia no debe interpretarse como señal robusta. Las cifras de GPT-2 (124M) provienen de una reproducción desde cero verificada contra los resultados oficiales. El propio autor recalca que estos números solo indican que el modelo supera a un baseline de 2019 en unos pocos benchmarks de elección múltiple, y que la calidad de generación libre, el anclaje factual y el comportamiento fuera de esos formatos no se han comparado rigurosamente.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 620 MB solo de pesos; en bf16/fp16, unos 310 MB; en int8, unos 155 MB; en 4 bits, en torno a 80-100 MB. A esto se suma la caché KV, que con 14 capas y 704 dimensiones de modelo y contexto completo de 1024 tokens ocupa aproximadamente 40 MB en fp16 (estimación calculada a partir de las especificaciones declaradas, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4070, RTX 4090, A100 o H100. En estas últimas, el modelo está tan sobredimensionado en memoria que el cuello de botella será el overhead del runtime, no la capacidad de cómputo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU integradas y en CPU, dado su tamaño inferior a 1 GB en fp32.
- Opciones de despliegue: PyTorch + Transformers es la vía directa con los pesos safetensors publicados. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF (el autor no distribuye ningún GGUF); vLLM o TGI son técnicamente viables, aunque con 1024 tokens de contexto y 155 M de parámetros el coste de infraestructura supera con creces el del modelo. El entrenamiento original se realizó en una RTX Pro 6000.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia para este checkpoint en ninguna configuración de hardware.

## Comparativa con modelos similares

Solo se dispone de datos comparativos para los modelos citados en la propia model card. La información proporcionada no incluye cifras verificadas de otras familias de modelos pequeños (por ejemplo, alternativas del rango 100-200 M de parámetros); no se han podido contrastar datos de terceros.

| Modelo | Parametros | Tokens de entrenamiento | Contexto | HellaSwag | ARC-Easy | ARC-Challenge | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| GTM-v2-base | 154.875.776 en safetensors (~119,4 M declarados por el autor) | ~4,16B | 1024 | 33,0 % | 43,0 % | 24,0 % | Apache 2.0 | HuggingFace, solo fp32 safetensors |
| GTM-v1-base | ~100 M (declarado) | ~3B | No disponible en la información | 32,0 % | 42,5 % | 26,0 % | No disponible en la información | No disponible en la información |
| GPT-2 (124M) | 124 M | ~40B | No disponible en la información | ~28-29 % | ~39,2 % | ~22,5 % | No disponible en la información | Referencia de la model card (reproducción desde cero) |

## Limitaciones y advertencias

- Sin recuperación factual fiable: el autor indica explícitamente que ante la indicación "The capital of France is" el modelo no produce de forma consistente "Paris", y puede generar contenido fluido pero inventado. No debe usarse como fuente de información.
- Alucinación estructural: la combinación de fluidez superficial y ausencia de anclaje factual implica un riesgo alto de afirmaciones plausibles pero falsas, especialmente peligroso si la salida se publica sin revisión.
- No está ajustado por instrucciones: no sigue órdenes ni responde preguntas en formato conversacional; solo continúa texto. Cualquier uso tipo asistente requiere un ajuste previo.
- Sin capacidad de código: no se incluyó ningún corpus de código en el entrenamiento; puede producir texto con forma de código, pero no código funcionalmente correcto.
- Tendencia a la repetición: en generación greedy o con temperatura baja puede entrar en bucles y quedarse fijado en plantillas estructurales (listas numeradas, formularios de rellenar huecos).
- Contexto muy corto: 1024 tokens limitan cualquier tarea que requiera documentos largos, conversaciones multi-turno extensas o razonamiento sobre contextos amplios.
- Solo inglés: el vocabulario y el corpus son monolingües; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será malo.
- Sesgos: no se documenta ningún proceso de filtrado o mitigación de sesgos; el modelo hereda los sesgos de FineWeb, FineWeb-Edu, Cosmopedia-v2 y FineMath, y la model card no incluye ninguna evaluación de sesgo.
- Evaluación reducida y ruidosa: los benchmarks se calcularon con 200 ejemplos por tarea y por verosimilitud, no por generación; el propio autor advierte que las diferencias de pocos puntos no son señal fiable. El retroceso en ARC-Challenge respecto a v1 es un ejemplo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia no cubre la calidad ni la veracidad de las salidas; el uso en producción exige asumir el riesgo de contenido incorrecto y añadir validación externa.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y no se ha encontrado ninguna referencia externa, paper ni análisis independiente, por lo que no existe verificación por terceros.
- Discrepancia en el recuento de parámetros: la model card declara ~119,4 M (con pesos atados) mientras que safetensors contiene 154.875.776 parámetros; conviene verificar la configuración real del checkpoint antes de calcular presupuestos de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OPENGCM/GTM-v2-base
- Repositorios de datos citados en la model card (usados en el preentrenamiento):
  - FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - Cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
  - FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
  - FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con su autor; toda la información de esta ficha procede de la model card de HuggingFace.
