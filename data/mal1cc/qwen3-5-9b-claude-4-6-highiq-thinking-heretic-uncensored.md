# Mal1cc/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED es un fine-tune del modelo denso Qwen3.5-9B, publicado por el usuario Mal1cc y entrenado con Unsloth sobre un dataset de destilación que el autor denomina "Claude 4.6". El objetivo declarado de la modificación es sustituir el modo de razonamiento nativo de Qwen3.5 por una generación de pensamiento más larga y estructurada, manteniendo intactos los benchmarks del modelo base. Se apoya sobre trohrbaugh/Qwen3.5-9B-heretic-v2, una variante ya sometida a un proceso de abliteration ("heretic"). El modelo tiene 9.409.813.744 parámetros en formato bfloat16, un repositorio de 18,8 GB y una licencia Apache 2.0.

Arquitectura y contexto provienen del Qwen3.5-9B original: transformer causal con visión encoder, 32 capas, dimensión oculta de 4096 y una disposición híbrida que combina Gated Delta Networks (atención lineal) con Gated Attention. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, aunque la model card del fine-tune indica un contexto por defecto de 256k. Está etiquetado como image-text-to-text, es decir, acepta entrada de imagen y texto, y el autor afirma haber verificado que la rama de visión sigue funcionando tras el entrenamiento.

Su relevancia es de nicho: se trata de un modelo orientado a escritura creativa, ficción, generación de tramas y roleplaying, con el filtrado de rechazos reducido deliberadamente. Es un lanzamiento muy reciente (6 de octubre de 2026) con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con vision encoder; disposicion hibrida Gated DeltaNet + Gated Attention (heredada de Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica; el fine-tune se realiza sobre la variante densa de 9B |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000; la model card del fine-tune indica contexto por defecto de 256k |
| Tipos de cuantizacion | bfloat16 en los pesos originales; el autor recomienda como minimo q4_k_s (sin imatrix) o IQ3_S (con imatrix). Los benchmarks se midieron en mxfp8 |
| Idiomas soportados | en, zh (segun la model card). El modelo base Qwen3.5 declara cobertura de hasta 201 idiomas, pero este fine-tune solo lista ingles y chino |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB); compatible con Transformers, vLLM, SGLang y KTransformers |

Otras especificaciones del backbone: 32 capas, dimension oculta 4096, token embedding de 248.320 (padded), FFN con dimension intermedia 12288. Gated DeltaNet con 32 cabezas de atención lineal para V y 16 para QK, dimension de cabeza 128. Gated Attention con 16 cabezas para Q y 4 para KV, dimension de cabeza 256 y dimension de RoPE 64. Entrenado con multi-token prediction (MTP) multi-paso.

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer causal que combina dos mecanismos de atención en un patrón repetido 8 veces: por cada bloque de tres capas con Gated DeltaNet (atención lineal con estado recurrente) se intercala una capa con Gated Attention completa. Este diseño híbrido reduce el coste de la caché KV en contextos largos frente a un transformer denso convencional, algo crítico cuando se trabaja con 256k tokens. La componente de visión procede de un encoder integrado mediante entrenamiento de fusión temprana sobre tokens multimodales, según la documentación de Qwen.

El fine-tune se realizó con Unsloth sobre hardware local, partiendo de trohrbaugh/Qwen3.5-9B-heretic-v2 tal como indica el campo base_model. El autor describe el entrenamiento como "mild" (suave), con la intención de no degradar los benchmarks del modelo original, y con el foco puesto en el modo de pensamiento. El proceso se aplicó después del abliteration, no antes, de modo que el modelo final no conserva el comportamiento de rechazo que tendría el original. La model card reporta una divergencia KL de 0,0793 respecto al modelo original y una tasa de 6 rechazos por cada 100 peticiones, frente a 100 sobre 100 del Qwen3.5-9B sin modificar. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases de RLHF o DPO.

## Capacidades

- Generación de texto largo y narrativa: escritura creativa, ficción general, ciencia ficción, romance y otros géneros, con énfasis declarado en "prosa vívida".
- Planificación narrativa: generación de tramas, subtramas y continuación de escenas a partir de un contexto previo.
- Roleplaying conversacional multi-turno, con la ventana de contexto larga como principal ventaja para mantener coherencia en sesiones extensas.
- Modo de razonamiento ("thinking") reformulado mediante destilación, lo que produce cadenas de pensamiento más largas antes de la respuesta final.
- Comprensión de imágenes: el pipeline declarado es image-text-to-text y el autor afirma que la rama de visión funciona tras el entrenamiento. La parte de vídeo no fue probada.
- Capacidades heredadas del Qwen3.5 base: razonamiento, código, matemáticas, agentes y tool calling, aunque el fine-tune no las valida de forma específica.
- Multilingüismo limitado: la model card solo declara inglés y chino.
- Ausencia de rechazo ante peticiones: modelo abliterated y "uncensored" por diseño.

## Casos de uso

- Generación de novelas y relatos largos: con 256k tokens de contexto, el modelo puede mantener el arco argumental, los personajes y la continuidad estilística a lo largo de decenas de capítulos sin perder el hilo.
- Asistente de escritura para guionistas y novelistas: continuación de escenas a partir de un fragmento previo, generación de subtramas secundarias y propuestas de variantes de un mismo desenlace.
- Roleplaying y ficción interactiva: conversaciones multi-turno con memoria larga, útil para motores de aventuras textuales o de personajes persistentes.
- Motores narrativos para videojuegos: generación dinámica de diálogos y descripciones de escena en títulos con contenido textual extenso, donde la latencia importa menos que la coherencia.
- Generación de contenido multimodal: descripción de imágenes y conversión de material visual en texto narrativo o descriptivo, aprovechando el pipeline image-text-to-text.
- Analítica de documentos largos en inglés o chino: resumen y extracción de información en contratos o informes extensos, apoyándose en la ventana de 262k tokens.
- Investigación sobre alineación y seguridad: la combinación de abliteration y destilación lo convierte en un caso de estudio para medir la degradación de salvaguardas y el desplazamiento de comportamiento respecto al modelo original.
- Experimentos de destilación: sirve como referencia para estudiar el efecto de un dataset de destilación grande sobre el modo de razonamiento de un modelo denso de 9B.

## Benchmarks y rendimiento

Resultados publicados por el autor, todos medidos en mxfp8. Las columnas corresponden a ARC, ARC-Easy, BoolQ, HellaSwag, OpenBookQA, PIQA y WinoGrande.

| Modelo | ARC | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Este modelo (thinking) | 0,432 | 0,505 | 0,625 | 0,658 | 0,374 | 0,748 | 0,657 |
| Este modelo (instruct) | 0,574 | 0,755 | 0,869 | 0,714 | 0,410 | 0,780 | 0,691 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 0,574 | 0,729 | 0,882 | 0,711 | 0,422 | 0,775 | 0,691 |
| Qwen3.5-9B original (thinking) | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |

Métricas de descensorización y deriva respecto al modelo original:

| Metrica | Este modelo | Qwen3.5-9B original |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definicion) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de benchmarks de visión, código, matemáticas ni agentes en la información disponible. La model card de Qwen3.5-9B incluye comparativas frente a GPT-OSS-120B, GPT-OSS-20B y Qwen3-Next-80B-A3B-Thinking, pero la tabla está truncada en la información proporcionada y no se reproducen cifras.

## Requisitos de hardware

- Pesos en bfloat16: 18,8 GB, según el tamaño del repositorio. Requiere al menos una GPU de 24 GB para cargar solo los pesos, sin margen para caché KV a contexto largo.
- Cuantización q4_k_s (recomendada por el autor como mínimo no imatrix): aproximadamente 5,5-6 GB de VRAM.
- Cuantización IQ3_S (recomendada con imatrix): aproximadamente 4-4,5 GB de VRAM.
- GPU profesionales: A100 (40/80 GB), H100 y similares son las opciones adecuadas para explotar la ventana de 262k tokens, ya que la caché KV en contextos muy largos domina el consumo.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar la versión bf16 con contextos moderados; una RTX 4080, 4070 Ti o 3060 de 12 GB necesitan cuantización de 4 bits o inferior.
- Despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers según la documentación de Qwen3.5; llama.cpp y Ollama para formatos GGUF; TGI como alternativa de servidor. El entrenamiento se realizó con Unsloth.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Este modelo | 9,4B denso | 262k nativo / 1,01M extensible | apache-2.0 | en, zh | Fine-tune con abliteration y destilacion de pensamiento; 0 descargas |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 9B denso | 262k (heredado) | no disponible en la informacion | no disponible | Modelo base directo; ya sometido a abliteration |
| Qwen/Qwen3.5-9B | 9B denso | 262k nativo / 1,01M extensible | no disponible en la informacion | 201 idiomas segun Qwen | Modelo original; 100/100 rechazos, KL 0 por definicion |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 9B denso | no disponible | no disponible | no disponible | Variante hermana del mismo autor, sin modo thinking; mejores resultados en BoolQ (0,882) |

No se dispone de datos verificables sobre alternativas de otros fabricantes en el mismo rango de tamaño y misma tarea (escritura creativa sin censura), por lo que la comparativa se limita a la familia de la que deriva este modelo.

## Limitaciones y advertencias

- Riesgo de alucinación estándar en modelos de lenguaje de esta escala, agravado por el énfasis en generación creativa: las afirmaciones factuales deben verificarse siempre.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni equidad. El proceso de abliteration elimina los rechazos, lo que implica que el modelo puede generar contenido dañino, ilegal o no seguro sin filtrado previo. Es una decisión de diseño del autor, no un defecto.
- La divergencia KL de 0,0793 indica una deriva medible respecto al modelo original; no es cero, por lo que el fine-tune no es neutral en comportamiento.
- Idiomas: solo inglés y chino declarados. El uso en castellano no está soportado oficialmente y probablemente degrade la calidad.
- Vídeo: el autor indica explícitamente que las porciones de vídeo del modelo no fueron probadas.
- Benchmarks autodeclarados: los resultados de la model card los publica el propio autor, no un tercero, y se midieron en mxfp8, una configuración de cuantización concreta que puede no reflejar el comportamiento en bfloat16 o en GGUF de 4 bits.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha. No hay informes independientes de calidad, estabilidad ni regresiones.
- Licencia Apache 2.0 declarada, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de la variante heretic intermedia, cuyos términos no aparecen en la información disponible.
- Origen del dataset de destilación: el autor lo describe como "Claude 4.6 distill dataset" sin especificar procedencia, licencia ni método de obtención, lo que introduce incertidumbre legal en un despliegue comercial.
- Fechas y versiones del nombre (Qwen 3.5, Claude 4.6) proceden de la model card y no se han podido contrastar con fuentes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mal1cc/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Modelo base del fine-tune: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

No se han encontrado papers, repositorios ni demos adicionales en la información proporcionada.
