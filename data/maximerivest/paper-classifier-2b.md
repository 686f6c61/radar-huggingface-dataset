# maximerivest/paper-classifier-2B

## Resumen

paper-classifier-2B es un modelo de clasificación de artículos científicos desarrollado por el usuario de HuggingFace `maximerivest` para el proyecto Science Made Readable. No es un modelo generativo: dado el texto de un paper (título, abstract, venue y año opcionales) y una lista de opciones, devuelve una distribución de probabilidad sobre esas opciones en un único forward pass, leyendo los logits del siguiente token correspondientes a los códigos de cada opción. Las opciones pueden ser cualquier taxonomía de investigación (campos de OpenAlex, categorías de arXiv, MeSH, etiquetas propias) o una única pregunta de tipo sí/no sobre si un tema es central en el paper.

El modelo parte de Qwen/Qwen3.5-2B (2.390.384.448 parámetros totales según safetensors) y se ha afinado para dos tareas concretas: `classify`, que reparte probabilidad entre 2 y 562 opciones con suma 1, y `is_on_topic`, que devuelve P(sí) para un tema dado con definición opcional. Al no generar texto, el coste por inferencia es muy bajo: según el autor, unas 28.000 papers por hora en una RTX 3090 para una pregunta de 176 opciones (0,14 s por paper) y 155.000 por hora en preguntas de sí/no (0,035 s).

Su relevancia práctica está en el etiquetado masivo y barato de literatura científica con taxonomías que el modelo no ha visto durante el entrenamiento, y en que evita los problemas típicos de los LLM generativos como clasificadores (respuestas fuera de formato, alucinación de etiquetas, coste por token generado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`), afinado desde Qwen/Qwen3.5-2B; inferencia de un solo paso sin generación |
| Parámetros totales | 2.390.384.448 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo distribuye safetensors en el formato original) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 4,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Qwen3.5-2B, reutilizado no como generador sino como cabezal de clasificación zero-shot. El prompt se construye con la plantilla de chat de Qwen3.5 con el modo de razonamiento desactivado (`enable_thinking=False`), de modo que el turno del asistente arranca con un bloque `<think>` vacío. El paper se coloca antes de la pregunta y el modelo recibe un mensaje de sistema fijo que describe las dos tareas y el criterio de "tema central" frente a "mención de pasada".

La innovación es el mecanismo de respuesta: cada opción recibe un código de dos letras (`AA`, `AB`, `AC`…) de entre los 562 códigos que son un único token según el tokenizador de Qwen3.5 (listados con sus token ids en `classifier.json`). Tras un único forward pass se conservan solo los logits de los códigos ofrecidos y se aplica softmax sobre ellos, obteniendo la distribución de probabilidad. Para preguntas de sí/no se usan los ids de `yes` y `no`. No hay decodificación ni muestreo. El autor indica que el modelo se evaluó en un benchmark experto reservado y en esquemas de clasificación no vistos, aunque no publica cifras. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot de papers en cualquier taxonomía de 2 a 562 opciones, con probabilidades normalizadas que suman 1.
- Soporte de opciones con metadatos: nombre, descripción (`about`) y padre jerárquico (`parent`), lo que permite representar taxonomías de varios niveles.
- Preguntas de pertenencia a tema (`is_on_topic`) con definición opcional para desambiguar términos.
- Generalización a esquemas de clasificación no vistos durante el entrenamiento, según las pruebas del autor en benchmarks reservados.
- Entrada flexible: título obligatorio; abstract, venue y año opcionales (usa la cadena `(no abstract)` cuando falta).
- Inferencia determinista de un solo paso, sin generación de texto ni riesgo de formato inválido.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; no es un modelo de propósito general.
- Multilingüismo: solo inglés; los papers y las etiquetas deben estar en inglés.

## Casos de uso

- Indexación masiva de literatura científica: procesar un repositorio de millones de abstracts y asignar cada uno a los 176 subcampos de Science-Metrix u otra taxonomía, a un coste estimado por el autor de 9 dólares por millón de papers en una RTX 3090.
- Enrutado de manuscritos a revisores o editores: clasificar un envío entrante contra el árbol de áreas de una revista y usar la distribución de probabilidad para preseleccionar editores asociados con especialidad afín.
- Construcción de grafos de ciencia: etiquetar corpus completos con campos de OpenAlex o categorías de arXiv para alimentar análisis bibliométricos y mapas de colaboración.
- Filtrado por tema en revisiones sistemáticas: usar `is_on_topic` con una definición explícita para descartar de forma barata los papers no pertinentes antes de la lectura manual, con 155.000 consultas por hora en una RTX 3090.
- Organización de bibliotecas personales o de laboratorio: clasificar una colección Zotero contra las etiquetas propias de un grupo de lectura, pasando la taxonomía como lista de opciones con descripciones.
- Curaduría de bases de datos biomédicas: mapear abstracts a categorías MeSH o a vocabularios internos de una organización sin necesidad de reentrenar el modelo.
- Señalización de novedad o vigilancia tecnológica: combinar `is_on_topic` sobre varios temas clave para marcar qué publicaciones nuevas tocan líneas estratégicas de un departamento de I+D.
- Anotación asistida con revisión humana: generar probabilidades calibradas para preetiquetar y priorizar la revisión manual, usando el valor de confianza como criterio de cola de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona que el modelo se probó en un benchmark experto reservado y en esquemas de clasificación no vistos, pero no incluye cifras de accuracy, F1 ni comparaciones cuantitativas con otros modelos. Sí se documentan métricas de throughput en hardware concreto:

| Métrica | Valor declarado por el autor |
|---|---|
| Pregunta de 176 opciones, RTX 3090 | ~28.000 papers/hora; 0,14 s por paper |
| Pregunta de sí/no, RTX 3090 | ~155.000 papers/hora; 0,035 s por paper |
| Coste estimado | 9 USD por millón de papers a 0,25 USD/hora de GPU |
| Accuracy en benchmarks públicos | No disponible |

## Requisitos de hardware

- Pesos en el repositorio: 4,8 GB en safetensors, lo que corresponde aproximadamente a 4,8 GB de VRAM en bf16/fp16 solo para los pesos; con overhead de activaciones y caché KV para abstracts largos, se recomienda reservar entre 6 y 8 GB.
- Estimaciones por cuantización (calculadas a partir del número de parámetros, no publicadas por el autor): ~2,4 GB en 8 bits y ~1,2 GB en 4 bits, más overhead. No se distribuyen pesos cuantizados oficiales.
- GPU de referencia del autor: RTX 3090. Cabe en GPUs de consumo con 8 GB o más (RTX 3060 Ti/4060 Ti, RTX 4070, RTX 4080, RTX 4090) y en cualquier A100, H100, L40S o L4.
- Despliegue: el repositorio incluye `paper_classifier.py` (solo `transformers` + `torch`), que construye exactamente el prompt de entrenamiento y lee los logits; requiere `transformers>=5.3`. No hay integración documentada con vLLM, TGI, llama.cpp ni Ollama, y el flujo de lectura de logits restringida a los códigos no es el estándar de esos servidores.
- Throughput y latencia: los indicados en la tabla anterior, medidos en una RTX 3090 con preguntas de 176 opciones y de sí/no respectivamente. El coste por inferencia escala con el número de opciones solo en el prompt, no en la generación, porque no se genera ningún token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paper-classifier-2B | 2,39 B | No disponible | ~28.000 papers/h (176 opciones) en RTX 3090 | Apache 2.0 | HuggingFace |
| paper-classifier-0.8B (hermano) | ~0,8 B (según el nombre) | No disponible | Aproximadamente el doble de rápido, algo menos preciso según el autor | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | 2 B (aproximado, no confirmado en la información disponible) | No disponible | No aplica: es un modelo generativo, no un clasificador | No disponible | HuggingFace |

No se dispone de comparaciones cuantitativas frente a clasificadores científicos dedicados (por ejemplo, modelos tipo SciBERT) ni frente a LLM usados como clasificadores zero-shot, porque no hay cifras de accuracy publicadas en la información disponible.

## Limitaciones y advertencias

- Solo inglés: papers y etiquetas deben estar en inglés; no se ha validado su comportamiento en castellano ni en otras lenguas.
- No es un modelo generativo ni conversacional: no responde preguntas abiertas, no resume, no extrae entidades y no admite tool calling.
- El prompt importa: el autor advierte explícitamente que debe usarse `paper_classifier.py` o replicar sus instrucciones, porque el modelo se entrenó con un mensaje de sistema y un formato concretos; prompts alternativos degradan el resultado de forma no medida.
- Límite de 562 opciones por consulta, derivado de los códigos de dos letras de un solo token; taxonomías mayores requieren particionar la pregunta.
- Sin abstract, el modelo solo dispone de título, venue y año, lo que reduce la fiabilidad de la clasificación.
- Riesgo de alucinación bajo en el sentido de formato (las probabilidades siempre están restringidas a las opciones ofrecidas), pero existe riesgo de asignación errónea silenciosa: una probabilidad alta no garantiza que la etiqueta sea correcta, y no se publican métricas de calibración.
- Dependencia de la calidad de las descripciones de las opciones: los campos `about` y `parent` influyen en la decisión y pueden introducir sesgo hacia etiquetas mejor descritas.
- Sesgos de dominio heredados del modelo base Qwen3.5-2B y de la distribución de papers usada en el fine-tune, no documentada en la información disponible.
- El modelo tiene 0 descargas y 0 likes y fue creado en octubre de 2026; no hay validación independiente ni reportes de terceros sobre su comportamiento en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar también las condiciones del modelo base Qwen/Qwen3.5-2B, cuya licencia no se detalla en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maximerivest/paper-classifier-2B
- Modelo hermano: https://huggingface.co/maximerivest/paper-classifier-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Proyecto del autor: https://sciencemadereadable.com
- Script de inferencia y prompt: `paper_classifier.py` y `classifier.json` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
