# GLASSEYE/quill-poetry-v2-gguf

## Resumen

Quill poetry v2 GGUF es un modelo de lenguaje publicado por el usuario GLASSEYE en HuggingFace bajo el identificador `GLASSEYE/quill-poetry-v2-gguf`. Se distribuye exclusivamente en formato GGUF, en una única cuantización Q4_K_M, y la model card lo presenta como un modelo orientado a la generación de poesía, invocable mediante `ollama run quill`. El repositorio tiene un tamaño de 4,4 GB y declara 7.248.023.552 parámetros totales, lo que lo sitúa en la categoría de los modelos de aproximadamente 7.000 millones de parámetros.

La información pública es extremadamente reducida: la model card se limita a la licencia, tres etiquetas (`gguf`, `poetry`, `quill`) y el comando de Ollama. No se documentan el modelo base, la arquitectura, la longitud de contexto, los datos de entrenamiento, los idiomas soportados ni resultados de evaluación. El repositorio se publicó el 20 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que no existe validación alguna por parte de la comunidad.

Por tanto, esta ficha debe leerse como una evaluación de viabilidad técnica basada en los metadatos y en las convenciones del ecosistema GGUF, no como una verificación de capacidades. Cualquier uso en producción exige una evaluación propia previa, especialmente por la falta de trazabilidad del modelo base y por la ausencia de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no la especifica; el tamaño de parámetros y el formato GGUF son compatibles con un transformer decoder-only, pero no está confirmado) |
| Parámetros totales | 7.248.023.552 (aproximadamente 7,25 mil millones) |
| Parámetros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (única variante publicada en el repositorio) |
| Idiomas soportados | No disponible (las etiquetas y el nombre sugieren poesía en inglés, sin confirmación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El autor no indica si se trata de un ajuste fino (fine-tuning) sobre un modelo base existente ni cuál sería ese modelo base, ni describe el tipo de atención, la estrategia de posicionamiento, la normalización o el tokenizador empleado. El número de parámetros (7.248.023.552) y el tamaño del repositorio (4,4 GB, coherente con una cuantización Q4_K_M de ese orden de magnitud) son los únicos datos objetivos disponibles.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del corpus (aunque el nombre y la etiqueta `poetry` apuntan a un sesgo hacia texto poético y literario), la posible aplicación de RLHF, DPO u otras técnicas de alineamiento, y cualquier innovación técnica como decodificación especulativa o atención lineal. La etiqueta `conversational` en HuggingFace sugiere que el modelo fue preparado para mantener diálogo, pero no hay plantilla de chat documentada ni tokens especiales descritos.

## Capacidades

- Generación de texto creativo, presumiblemente especializada en poesía y verso según el nombre del modelo y la etiqueta `poetry`; esta especialización no está verificada con ejemplos ni evaluaciones.
- Modo conversacional declarado mediante la etiqueta `conversational` de HuggingFace, aunque se desconoce la plantilla de prompt recomendada.
- Ejecución local en CPU y GPU a través del ecosistema GGUF (llama.cpp, Ollama y compatibles).
- Compatibilidad declarada con endpoints de HuggingFace (etiqueta `endpoints_compatible`), lo que permite desplegarlo como endpoint gestionado si el contenedor soporta GGUF.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles, no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles, no documentadas.
- Razonamiento matemático y generación de código: no disponibles, no documentados.

## Casos de uso

- Generación de poesía y verso libre en local: al ser un GGUF Q4_K_M de 4,4 GB, puede ejecutarse íntegramente en un portátil o en una GPU de gama media, lo que permite experimentar con generación poética sin enviar el prompt a un servicio externo.
- Asistente de escritura creativa offline: integrado en un editor de texto mediante llama-cpp-python, el modelo puede sugerir continuaciones de verso o variaciones estilísticas sobre un fragmento dado, manteniendo el contenido dentro de la máquina del usuario.
- Generación de texto con restricciones métricas: para tareas como sonetos, haikus o estrofas con rima y número de sílabas fijo, un modelo afinado específicamente en poesía puede rendir mejor que un modelo generalista del mismo tamaño, aunque esto debe verificarse empíricamente.
- Prototipado rápido con Ollama: el comando `ollama run quill` indicado en la model card permite levantar el modelo en un contenedor Ollama sin configuración adicional, útil para demos internas y pruebas de concepto.
- Ajuste fino adicional (fine-tuning) sobre dominio literario: la licencia Apache 2.0 permite derivar y redistribuir variantes, siempre que se resuelva antes la duda sobre el modelo base y sus condiciones de licencia originales.
- Generación de contenido para blogs o newsletters literarias: el modelo puede producir borradores de poemas o textos líricos que después se revisan manualmente, con la advertencia de que la calidad y la coherencia a lo largo de textos largos no están documentadas.
- Experimentación académica sobre modelos pequeños especializados: sirve como caso de estudio de un ajuste fino de 7B en GGUF con licencia permisiva, aunque sin model card completa su valor como referencia reproducible es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, evaluaciones de creatividad, perplejidad u otras), y la búsqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo. No se puede, por tanto, comparar su rendimiento con el de alternativas de tamaño similar.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del recuento de parámetros (7.248.023.552) y del tamaño del archivo publicado (4,4 GB en Q4_K_M); el autor no publica requisitos oficiales.

- VRAM estimada para inferencia:
  - Q4_K_M: aproximadamente 4,4 GB de pesos, más caché KV y overhead, lo que se traduce en unos 5,5-6,5 GB de VRAM con contextos moderados.
  - Q8_0 (no publicada, reconstruible): del orden de 7,7 GB de pesos.
  - FP16 (no publicada, reconstruible): del orden de 14,5 GB de pesos.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 para FP16 con comodidad; A100 o H100 solo si se necesita servicio concurrente a gran escala, ya que el modelo es pequeño para ese hardware.
- Compatibilidad con GPU de consumo: sí. La cuantización Q4_K_M cabe sin problema en GPUs con 8 GB de VRAM o más, y también en Macs con memoria unificada de 8 GB o superior.
- Opciones de despliegue: Ollama (el autor documenta `ollama run quill`), llama.cpp, llama-cpp-python, LM Studio, GPT4All y servidores basados en llama.cpp. El soporte de GGUF en vLLM es experimental y limitado; TGI no soporta GGUF de forma nativa. La etiqueta `endpoints_compatible` sugiere despliegue en HuggingFace Inference Endpoints con un contenedor compatible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo en ningún hardware.

## Comparativa con modelos similares

No se dispone de benchmarks del modelo analizado, por lo que la comparación se limita a características objetivas de formato y licencia. Las alternativas incluidas son modelos generalistas de tamaño comparable que suelen emplearse como punto de partida para ajustes finos creativos.

| Modelo | Parámetros | Longitud de contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| GLASSEYE/quill-poetry-v2-gguf | 7,25 mil millones | No disponible | Apache 2.0 | GGUF (Q4_K_M) | No disponibles |
| Mistral 7B (v0.1) | 7,24 mil millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Sí |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Sí |
| Qwen2.5 7B | 7,62 mil millones | 131.072 tokens | Apache 2.0 (la mayoría de variantes) | safetensors, GGUF | Sí |

La ventaja diferencial declarada de Quill poetry v2 es la especialización en poesía, que no está cuantificada. Frente a las alternativas, carece de contexto documentado, de benchmarks y de trazabilidad sobre su origen, lo que dificulta justificar su elección salvo por curiosidad o experimentación.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluación de sesgos ni se describe la composición del corpus de entrenamiento.
- Riesgo de alucinación: no cuantificado. Al no existir benchmarks ni evaluaciones de fidelidad, se desconoce su comportamiento en tareas factuales; en generación creativa el riesgo es intrínsecamente alto.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Limitaciones de idioma: no se especifican los idiomas soportados. El nombre y las etiquetas apuntan a inglés; el rendimiento en castellano es desconocido y probablemente inferior si el ajuste fino se realizó solo en inglés.
- Trazabilidad del modelo base: la model card no indica sobre qué modelo se ha ajustado. Si el modelo base tuviera una licencia distinta de Apache 2.0 (por ejemplo, Llama), la declaración de licencia Apache 2.0 podría ser incorrecta y su uso comercial entraría en conflicto. Este punto debe resolverse antes de cualquier despliegue en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones asociadas.
- Falta de plantilla de prompt: no se documenta el formato de chat ni los tokens especiales, lo que puede degradar la calidad de las respuestas en modo conversacional.
- Sin garantías de calidad: la licencia Apache 2.0 se ofrece "tal cual", sin garantía de ningún tipo por parte del autor.
- Fecha de publicación anómala (20 de septiembre de 2026) y ausencia de historial de versiones que permita verificar la continuidad del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v2-gguf
- Repositorio de llama.cpp (runtime compatible con GGUF): https://github.com/ggml-org/llama.cpp
- Ollama, invocado en la model card mediante `ollama run quill`: https://ollama.com
- Paper, blog, repositorio o demo del autor: no disponible. La búsqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo; los resultados obtenidos corresponden a páginas sin relación con el contenido técnico.
