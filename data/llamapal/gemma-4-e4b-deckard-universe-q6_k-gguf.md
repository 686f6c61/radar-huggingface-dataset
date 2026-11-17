# LlamaPal/Gemma-4-E4B-Deckard-Universe-Q6_K-GGUF

## Resumen

Gemma-4-E4B-Deckard-Universe-Q6_K-GGUF es un fichero de pesos en formato GGUF cuantizado a Q6_K, alojado por el usuario LlamaPal como espejo estable de una versión comunitaria del modelo Gemma 4 E4B. No se trata de un modelo original: según la model card, es una copia sin modificar del fichero `gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking.i1-Q6_K.gguf` publicado por mradermacher en su repositorio i1-GGUF, que a su vez deriva de un ajuste fino comunitario atribuido a DavidAU sobre la base Gemma 4 E4B en su variante instruct.

El interés práctico del repositorio es la disponibilidad de un artefacto GGUF de 6,2 GB con hash SHA-256 verificado, pensado para inferencia local con llama.cpp y derivados (Ollama, LM Studio, etc.). El nombre sugiere un ajuste orientado a conversación con modo de razonamiento explícito ("Thinking") y sin censura ("UNCENSORED"), aunque estos extremos no se documentan técnicamente en la información disponible.

La información publicada es muy escasa: no hay model card propia con detalles de entrenamiento, benchmarks, idiomas ni instrucciones de uso más allá de la tabla de ficheros y la atribución de créditos. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original de mradermacher y, en última instancia, la ficha del ajuste de DavidAU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4 E4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 7.518.069.290 (7,52 mil millones, dato de safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Gemma 4 E4B en los datos proporcionados: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detalla la composición del dataset de entrenamiento, el número de tokens procesados o si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo único documentado es la cadena de derivación del artefacto: un ajuste fino comunitario (atribuido a DavidAU) sobre Gemma 4 E4B instruct, con nombres que sugieren un entrenamiento orientado a conversación, modo "Thinking" y eliminación de censura, posteriormente cuantizado a Q6_K por mradermacher mediante su pipeline i1 (que habitualmente emplea matrices de importancia, imatrix, para mejorar la calidad de la cuantización). El fichero alojado en este repositorio es una copia byte a byte de esa cuantización, con SHA-256 `351b5056c5a31bffe8a8ccfd0616dabe6a8b67e0e732577018c50c9eedf5882c`.

## Capacidades

- Generación de texto conversacional multi-turno, según la orientación declarada del ajuste ("it", "conversational").
- Modo de razonamiento explícito ("Thinking"), sugerido por el nombre del fichero original; no se documenta el formato exacto de las etiquetas de pensamiento.
- Comportamiento sin censura declarado en el nombre del ajuste ("UNCENSORED"); no se especifica el alcance real de esta modificación ni sus riesgos.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que indica que el GGUF puede servirse mediante infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: el fichero Q6_K de 6,2 GB permite ejecutar el modelo en equipos con 8-12 GB de VRAM o con CPU y suficiente RAM, usando llama.cpp u Ollama, sin dependencia de servicios en la nube.
- Experimentación con ajustes comunitarios: útil para investigadores que quieran comparar el comportamiento de un fine-tune "uncensored" frente al Gemma 4 E4B instruct original en tareas de conversación abierta.
- Prototipado de asistentes conversacionales: al ser un modelo instruct de ~7,5 mil millones de parámetros, sirve para validar pipelines de chat multi-turno antes de escalar a modelos mayores.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, permite procesar conversaciones sin enviar datos a terceros, siempre que se auditen los sesgos y la ausencia de filtros del ajuste.
- Reproducibilidad de artefactos: el hash SHA-256 publicado facilita verificar la integridad del fichero en pipelines de CI o en espejos internos de modelos.
- Evaluación de riesgos de modelos sin alineación: el ajuste "uncensored" puede emplearse en estudios de seguridad para medir la eficacia de los filtros del modelo base frente a la variante modificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 7-8 GB para el fichero Q6_K completo con contexto moderado; el tamaño del repositorio es de 6,2 GB y la cuantización Q6_K añade overhead de caché KV según la longitud de contexto.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, A10, L4 o superiores para ejecución íntegra en GPU; A100/H100 no son necesarias para este tamaño.
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070), con posible offload parcial a CPU si el contexto es largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere soporte en infraestructura de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-Deckard-Universe-Q6_K (este) | 7,52 mil millones | no disponible | Apache 2.0 | GGUF Q6_K | Ajuste comunitario "uncensored" con modo Thinking |
| Gemma 4 E4B instruct (base) | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors/GGUF | Modelo original de Google; comportamiento alineado por defecto |
| mradermacher/gemma-4-E4B-it-The-DECKARD-...-i1-GGUF | mismo | no disponible | Apache 2.0 | GGUF (varias cuantizaciones) | Repositorio fuente con el resto de cuantizaciones i1 |
| Otros modelos de ~7-8B (p. ej. Mistral 7B, Llama 3.1 8B) | ~7-8 mil millones | 8K-128K según variante | licencias propias | safetensors/GGUF | Alternativas genéricas de tamaño comparable; datos concretos no disponibles en esta busqueda |

## Limitaciones y advertencias

- La información publicada es mínima: no hay model card propia, ni detalles de entrenamiento, ni evaluación de sesgos, lo que dificulta auditar el comportamiento del modelo.
- El ajuste se declara "uncensored": es previsible una menor eficacia de los filtros de seguridad y un mayor riesgo de generar contenido dañino, ofensivo o inexacto; no se documenta el alcance real de la modificación.
- Riesgo de alucinación inherente a modelos de ~7,5 mil millones de parámetros, agravado por la falta de benchmarks publicados.
- Longitud de contexto e idiomas soportados no documentados; no se debe asumir un contexto largo ni cobertura multilingüe sin verificación empírica.
- La licencia Apache 2.0 se hereda del repositorio fuente, pero el cumplimiento de las condiciones del modelo base Gemma debe verificarse en la ficha original de mradermacher y en los términos de Google para Gemma.
- El repositorio es un espejo sin mantenimiento aparente (0 descargas, 0 likes, creado y actualizado el mismo día); no hay garantía de soporte ni de actualizaciones.
- Para producción, conviene validar el hash SHA-256 del fichero descargado y realizar una evaluación propia de calidad y seguridad antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Gemma-4-E4B-Deckard-Universe-Q6_K-GGUF
- Repositorio fuente (mradermacher, cuantización i1): https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Commit concreto del fichero original: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking-i1-GGUF/tree/ecdbadabd82ef184e669266fd20d68173668d0e1
- Ficha del ajuste original de DavidAU: no disponible en la informacion proporcionada
- Paper o blog técnico: no disponible en la informacion proporcionada
