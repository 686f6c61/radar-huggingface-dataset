# mfurkanakinci/gliner-tr-legal-extraction

## Resumen

`gliner-tr-legal-extraction` es un modelo de extracción de información (NER y extracción de relaciones) especializado en citas legales dentro de sentencias judiciales turcas. Lo desarrolla el usuario de Hugging Face `mfurkanakinci` y parte del modelo base `fastino/gliner2.5-multi-v1`, un extractor GLiNER2 de 287.355.159 parámetros. La tarea concreta: dado el texto de una resolución judicial, localizar y etiquetar las referencias a artículos de ley, menciones de leyes (por nombre, número o abreviatura) y citas a otras sentencias (número de expediente y número de resolución), además de vincular cada artículo con la ley a la que pertenece mediante extracción de relaciones.

El modelo no genera texto: es un token-classification que marca fragmentos del texto de entrada y asigna una puntuación de confianza a cada marca. Resuelve un problema muy específico del procesamiento de documentación jurídica turca, donde los sistemas NER genéricos fallan estrepitosamente al reconocer formatos de cita como "E. 2019/1234, K. 2020/567". Fue afinado con 40.000 sentencias judiciales y evaluado sobre 4.033 resoluciones no vistas durante el entrenamiento.

Es relevante ahora porque la versión sin entrenar del modelo base obtiene un F1 de 0,372 en detección de citas a sentencias, mientras que este ajuste alcanza 0,928. Se publica bajo licencia Apache 2.0 y compite directamente con analizadores basados en reglas, superándolos en la tarea de reconocimiento de citas jurisprudenciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades y relaciones basado en transformer encoder) |
| Parámetros totales | 287.355.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |
| Librería | gliner2 (versión 2.1.0 en el ejemplo de uso) |
| Pipeline | token-classification |
| Modelo base | fastino/gliner2.5-multi-v1 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLiNER2 del modelo base `fastino/gliner2.5-multi-v1`, un enfoque de extracción de información que combina reconocimiento de entidades nombradas con extracción de relaciones en un único esquema configurable mediante etiquetas y descripciones en lenguaje natural. El ajuste se realizó sobre 40.000 sentencias judiciales turcas, con tres etiquetas de entidad (`kanun maddesi atfı`, `kanun anışı`, `mahkeme kararı atfı`) y una relación (`madde_kanunu`) que vincula cada cita de artículo con la ley correspondiente.

La innovación técnica principal no está en la arquitectura sino en el dominio: el modelo aprende patrones de cita jurídica turca que los NER genéricos no capturan, incluyendo variantes de escritura como "150/2. maddesinin", "13 . maddesine", "120.maddesine", "Ek 4. madde", "geçici 6. maddesinin", "E:2021/42, K:2022/45" y "B. No: 2014/2293". No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de citas a artículos de ley (`kanun maddesi atfı`): marca la parte del artículo, excluyendo el nombre de la ley. Ejemplo: "49. maddesi", "142. maddesinin 1. fıkrası".
- Reconocimiento de menciones de leyes (`kanun anışı`): identifica nombre, número o abreviatura de la ley. Ejemplo: "6098 sayılı Türk Borçlar Kanunu", "TCK", "HMK".
- Reconocimiento de citas a sentencias (`mahkeme kararı atfı`): localiza referencias con número de expediente y resolución. Ejemplo: "2019/1234 Esas, 2020/567 Karar".
- Extracción de relaciones (`madde_kanunu`): vincula una cita de artículo con la ley a la que pertenece.
- Puntuación de confianza por cada entidad y relación detectada.
- Soporte de esquemas configurables mediante `create_schema()` con etiquetas y descripciones en lenguaje natural.
- Procesamiento por lotes (`batch_extract`) con umbrales configurables por tipo de entidad.
- No genera texto: es exclusivamente un extractor.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes.
- Capacidad multilingüe limitada al turco (idioma declarado: `tr`).

## Casos de uso

- Digitalización y análisis masivo de jurisprudencia: procesar corpus de sentencias turcas para indexar todas las citas legales y construir un grafo de referencias entre resoluciones, artículos y leyes. El modelo detecta citas jurisprudenciales con F1 de 0,928, algo que los NER genéricos no logran (0,372).
- Construcción de bases de datos de citación legal: extraer automáticamente qué artículos de qué leyes se citan en cada sentencia, alimentando sistemas de búsqueda y recuperación de jurisprudencia por referencia normativa.
- Verificación de citas en escritos judiciales: comprobar que las referencias a artículos y sentencias en un documento legal están correctamente formateadas y vinculadas a la norma correspondiente, usando la relación `madde_kanunu` con umbral de confianza de 0,2 a 0,3.
- Enriquecimiento de metadatos en repositorios documentales: añadir etiquetas estructuradas de citas legales a documentos ya digitalizados para facilitar su clasificación y recuperación posterior.
- Análisis de redes de citación jurisprudencial: identificar qué sentencias son más citadas y qué artículos legales concentran más referencias en un conjunto de resoluciones, útil para estudios empíricos del derecho.
- Preprocesamiento para pipelines de resumen legal: extraer y normalizar las citas de una sentencia antes de pasarla a un modelo generativo que produzca resúmenes o fichas, garantizando que las referencias normativas se preserven con exactitud.
- Automatización de flujos de trabajo en despachos y juzgados: procesar lotes de resoluciones para extraer citas y alimentar sistemas de gestión documental, con un rendimiento observado de 14 frases en 2 segundos en un solo procesador.

## Benchmarks y rendimiento

Evaluación sobre 4.033 sentencias no vistas durante el entrenamiento. Métrica: F1 (más cercano a 1 es mejor).

Detección de la ubicación de la cita en el texto:

| Sistema | Cita de artículo | Cita de sentencia |
|---|---|---|
| Este modelo | 0,894 | 0,928 |
| `fastino/gliner2.5-multi-v1` (sin ajustar) | 0,782 | 0,372 |
| `urchade/gliner_multi-v2.1` | 0,762 | 0,206 |
| Analizador basado en reglas | 0,888 | 0,850 |

Extracción del número correcto a partir del fragmento marcado (mismo analizador de reglas aplicado a las marcas):

| Sistema | Número de artículo | Número de sentencia |
|---|---|---|
| Este modelo | 0,798 | 0,836 |
| Analizador basado en reglas | 0,804 | 0,815 |

En el subconjunto de 500 sentencias, el modelo `newmindai/gliner2.5-kvkk-tr-v2` (no entrenado para esta tarea) obtuvo 0,281 en citas de sentencia, frente a 0,905 de este modelo en el mismo subconjunto.

Vinculación artículo-ley: el modelo no proporciona vínculo en aproximadamente el 59% de las citas de artículo; cuando lo proporciona, es correcto en el 95% de los casos. Si se recurre al analizador de reglas en los casos sin vínculo, el 90,6% de los artículos se vinculan a la ley correcta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 287 millones de parámetros y pesos en safetensors (repo de 1,2 GB), la inferencia en precisión completa requeriría del orden de 1,2 GB para los pesos, más memoria para activaciones y overhead del runtime.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmado en la información disponible; por tamaño de parámetros, es plausible en GPUs de consumo con suficiente VRAM, pero no se especifica.
- Opciones de despliegue: la librería `gliner2` (versión 2.1.0 según el ejemplo de uso) mediante `AutoExtractor.from_pretrained()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14 frases procesadas en 2 segundos en un solo procesador (dato del autor, sin especificar el hardware exacto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 cita artículo | F1 cita sentencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mfurkanakinci/gliner-tr-legal-extraction` | 287.355.159 | no disponible | 0,894 | 0,928 | Apache 2.0 | Hugging Face |
| `fastino/gliner2.5-multi-v1` (sin ajustar) | no disponible | no disponible | 0,782 | 0,372 | no disponible | Hugging Face |
| `urchade/gliner_multi-v2.1` | no disponible | no disponible | 0,762 | 0,206 | no disponible | Hugging Face |
| `newmindai/gliner2.5-kvkk-tr-v2` | no disponible | no disponible | no evaluado en esta tarea | 0,281 (subconjunto de 500) | no disponible | Hugging Face |
| Analizador basado en reglas (referencia) | no aplica | no aplica | 0,888 | 0,850 | no aplica | No publicado |

## Limitaciones y advertencias

- El modelo no normaliza las citas: no convierte "6098 sayılı Türk Borçlar Kanunu" en el número 6098 ni "49. maddesi" en un identificador estandarizado de artículo. Se necesita una capa de reglas adicional para esa resolución.
- La cita de artículo puede empezar con el sufijo tras el apóstrofo ("nun 49. maddesi"); eliminar ese prefijo corre a cargo del usuario.
- No detecta citas de sentencia sin año ("Esas 9-242, Karar 305") ni números de solicitud del Tribunal Europeo de Derechos Humanos ("B. No: 13710/88").
- Falsos positivos observados: marca "Anayasa" dentro de "Anayasa Mahkemesi" como nombre de ley; confunde un número de orden de expediente ("2019/45") con una cita de sentencia (puntuación 0,86); marca artículos de contratos y reglamentos como citas de artículo con puntuaciones entre 0,31 y 0,56 (un umbral de 0,6 los elimina).
- En la extracción del número, el modelo tiene mayor cobertura que el analizador de reglas (73% frente a 68% de los casos que debería encontrar) pero menor precisión (88% frente a 97%).
- La relación artículo-ley no se proporciona en aproximadamente el 59% de los casos; cuando se proporciona, es correcta en el 95%.
- El modelo solo soporta turco; no está entrenado para otros idiomas.
- No genera texto ni soporta razonamiento multi-paso ni tool calling.
- Los nombres y descripciones de las etiquetas deben mantenerse tal cual; cambiarlos puede alterar los resultados. La variante `schema.py` del repositorio, que usa `kanun adı` en lugar de `kanun anışı`, solo se probó en 200 sentencias y no se midió en el conjunto de test.
- Umbrales recomendados por el autor: 0,3 para citas de artículo, 0,7 para citas de sentencia, 0,2-0,3 para la relación.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (40.000 sentencias judiciales) por si hubiera restricciones adicionales sobre los textos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mfurkanakinci/gliner-tr-legal-extraction
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
- Modelo comparable `urchade/gliner_multi-v2.1`: https://huggingface.co/urchade/gliner_multi-v2.1
- Modelo comparable `newmindai/gliner2.5-kvkk-tr-v2`: https://huggingface.co/newmindai/gliner2.5-kvkk-tr-v2
