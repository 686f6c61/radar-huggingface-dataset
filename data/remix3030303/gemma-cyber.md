# remix3030303/gemma-cyber

## Resumen

`remix3030303/gemma-cyber` es un ajuste fino (fine-tune) publicado en HuggingFace por el usuario remix3030303 sobre `huihui-ai/Huihui-gemma-3n-E4B-it-abliterated`, que a su vez es una versión "abliterated" del `gemma-3n-E4B-it` de Google. Se distribuye en formato transformers/safetensors, con un total de 7.849.978.128 parámetros (7,85 mil millones) y un repositorio de 15,7 GB, lo que es coherente con pesos en bf16 (2 bytes por parámetro). El pipeline declarado es `image-text-to-text`, por lo que el modelo conserva la entrada multimodal (imagen y texto) de la familia Gemma 3n.

El modelo no resuelve un problema técnico novedoso por sí mismo: es un derivado de la familia Gemma 3n, diseñada por Google para inferencia eficiente en dispositivos con ventanas de contexto amplias y arquitectura MatFormer. El "valor añadido" declarado por el autor es únicamente el ajuste fino, entrenado con Unsloth y la librería TRL de HuggingFace. La model card no documenta el conjunto de datos, el objetivo del entrenamiento ni ninguna evaluación, de modo que el sufijo "cyber" del nombre no está respaldado por ninguna descripción técnica en la información disponible.

Su relevancia práctica es limitada y debe evaluarse con cautela: el repositorio registra 0 descargas y 0 likes, no incluye benchmarks ni ejemplos de uso, y la licencia declarada (Apache 2.0) entra en tensión con los términos de uso de Gemma de Google que afectan al modelo base. Es, por tanto, un artefacto interesante para experimentación sobre la cadena Gemma 3n → abliterated → fine-tune, pero no una opción recomendable para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 3n E4B (familia MatFormer con capas de atención selectiva; detalles exactos no disponibles en la información proporcionada) |
| Parámetros totales | 7.849.978.128 (7,85 B) |
| Parámetros activos | Aproximadamente 4 B según la designación "E4B" de la familia Gemma 3n; no confirmado en la información disponible |
| Longitud de contexto | No disponible en la información proporcionada (la familia Gemma 3n declara 32 768 tokens; sin confirmar para este fine-tune) |
| Tipos de cuantización | No se publican cuantizaciones precalculadas; al ser safetensors en bf16 es cuantizable a 8 bits y 4 bits con herramientas estándar (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (`en` es el único idioma declarado en los tags) |
| Licencia | Apache 2.0 declarada por el autor; el modelo base Gemma está sujeto además a los términos de uso de Gemma de Google |
| Formato de pesos | Safetensors (repositorio de 15,7 GB, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3n E4B de Google: un transformer con diseño MatFormer (una única red "elástica" de la que se extraen submodelos de distintos tamaños), pensado para reducir el coste de inferencia manteniendo calidad cercana a modelos mayores. La cifra de 7,85 B de parámetros totales frente a la designación "E4B" (efectivos ~4 B) encaja con ese planteamiento de parámetros totales superiores a los activos por token. La entrada es multimodal imagen-texto, según el pipeline declarado. No se dispone de información sobre número de capas, dimensión oculta, tipo de atención ni tokenizador en la documentación aportada.

El proceso de entrenamiento documentado es mínimo: el autor indica que el modelo se entrenó "2x faster" con Unsloth y la librería TRL de HuggingFace, y que parte de `huihui-ai/Huihui-gemma-3n-E4B-it-abliterated`. Este punto de partida implica dos etapas previas no documentadas aquí: el post-entrenamiento original de Google (que en la familia Gemma combina SFT y optimización por preferencias) y la aplicación de la técnica de *abliteration* por parte de huihui-ai, que consiste en identificar y suprimir la dirección de activación asociada a los rechazos para reducir el comportamiento de negativa del modelo. No hay información sobre el dataset del fine-tune, el número de tokens, la composición de datos, la existencia de RLHF/DPO adicional ni hiperparámetros de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la familia Gemma 3n.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos escaneados.
- Razonamiento y matemáticas a nivel de modelo de ~4 B efectivos; sin datos de evaluación disponibles.
- Generación de código: capacidad esperable por herencia de la familia, no verificada en este fine-tune.
- Posible soporte de tool calling / function calling (la familia Gemma 3 incluye plantilla de chat con herramientas); no confirmado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas y limitadas por el tamaño del modelo.
- Multilingüismo: reducido; solo se declara inglés.
- Comportamiento "abliterated": menor probabilidad de rechazar peticiones, incluidas las que el modelo base declinaría.

## Casos de uso

- Experimentación en investigación sobre *abliteration*: el modelo sirve como caso de estudio para medir cuánto se degrada la calidad y la seguridad al aplicar supresión de la dirección de rechazo sobre un modelo multimodal pequeño; útil en trabajos de interpretabilidad y alineación.
- Procesamiento de documentos con OCR asistido: al aceptar imagen y texto, puede extraer campos de facturas o formularios escaneados y devolver JSON, con la ventaja de que su tamaño (7,85 B) permite ejecutarlo en una sola GPU de 24 GB.
- Prototipado rápido de asistentes conversacionales en inglés: su formato transformers permite cargarlo con `AutoModelForImageTextToText` y validar ideas en horas, sin depender de APIs externas.
- Generación de descripciones de imágenes para pipelines internos de etiquetado o accesibilidad, en entornos donde no se quiere enviar datos a un servicio en la nube.
- Base para fine-tunes ulteriores: el repo ya es un fine-tune y puede servir como punto de partida (con Unsloth o TRL) para dominios específicos con pocos recursos, al requerir menos VRAM que modelos de 30 B o más.
- Evaluación comparativa de robustez y sesgos: útil como muestra negativa/control en estudios sobre filtrado de contenido, ya que permite contrastar respuestas del modelo abliterated frente al Gemma 3n original.
- Aplicaciones de análisis de tráfico de red o logs con componente visual (capturas de paneles, gráficas), siempre que se valide antes la calidad real del fine-tune, que no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 15,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 18 y 20 GB para contexto moderado.
- VRAM en 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 5-6 GB.
- GPU profesionales: A100 40/80 GB y H100 no son necesarias para inferencia en bf16, aunque ofrecen mayor throughput; una L40S o A10G de 24 GB es suficiente.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en 8 bits cabe en RTX 4080 (16 GB), RTX 4060 Ti 16 GB y RTX 4070 Ti Super; en 4 bits cabe en GPUs de 8-12 GB, con posible descarga parcial a CPU.
- Despliegue: transformers es la vía nativa (el autor etiqueta `text-generation-inference`); Unsloth está indicado para fine-tuning, no para servir. El soporte de vLLM, Ollama o llama.cpp para la arquitectura Gemma 3n es variable y requiere verificación previa, además de conversión a GGUF en el caso de llama.cpp/Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `remix3030303/gemma-cyber` | 7,85 B totales (~4 B efectivos) | No disponible (32 768 en la familia Gemma 3n) | Imagen + texto | Apache 2.0 declarada (+ términos de Gemma) | HuggingFace, 0 descargas |
| `huihui-ai/Huihui-gemma-3n-E4B-it-abliterated` (base directa) | 7,85 B | No disponible | Imagen + texto | Según la ficha del autor | HuggingFace |
| `google/gemma-3n-E4B-it` (original) | 7,85 B | 32 768 | Imagen + texto | Términos de uso de Gemma | HuggingFace, ampliamente usado |
| `google/gemma-3-4b-it` | 4 B | 131 072 | Imagen + texto | Términos de uso de Gemma | HuggingFace |

No se dispone de métricas de rendimiento del modelo analizado ni de comparaciones publicadas con alternativas; la comparación anterior se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ejemplos de salida ni descripción del dataset de fine-tune, por lo que se desconoce si el ajuste mejora o degrada las capacidades del modelo base.
- Riesgo de alucinación elevado en un modelo de ~4 B efectivos, especialmente en tareas de razonamiento largo, matemáticas y recuperación de hechos; no se mitiga con ningún mecanismo documentado.
- Reducción deliberada de salvaguardas por la cadena de *abliteration*: el modelo aceptará con mayor probabilidad peticiones dañinas, contenido inseguro o instrucciones que el Gemma 3n original rechazaría. Inadecuado para aplicaciones de cara al público sin un filtro externo.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y previsiblemente será inferior.
- Contexto: no confirmado para este fine-tune; si se mantiene en 32 768 tokens, queda por debajo de alternativas como Gemma 3 4B (131 072) para casos de contexto largo.
- Licencia: el autor declara Apache 2.0, pero el modelo deriva de Gemma, sujeto a los términos de uso de Gemma de Google, que imponen restricciones de uso (incluida la política de usos prohibidos). Conviene revisar la compatibilidad antes de un uso comercial; la declaración Apache 2.0 por sí sola no resuelve esa cadena de licencias.
- Trazabilidad y mantenimiento: 0 descargas, 0 likes, sin paper, sin repositorio de código ni issues; no hay garantía de soporte ni de corrección de errores.
- El nombre "cyber" sugiere una especialización en ciberseguridad que no está documentada en ningún sitio de la ficha; no debe asumirse esa competencia.
- Para producción, es imprescindible una batería propia de evaluación (calidad, seguridad, sesgos, latencia) antes de considerar su despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/remix3030303/gemma-cyber
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-gemma-3n-E4B-it-abliterated
- Modelo original de la familia: https://huggingface.co/google/gemma-3n-E4B-it
- Documentación de Gemma 3n (Google): https://ai.google.dev/gemma/docs/gemma-3n
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
