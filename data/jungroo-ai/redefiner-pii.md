# jungroo-ai/redefiner-pii

## Resumen

ReDefiNER PII es un paquete de configuración listo para usar sobre el modelo base `jungroo-ai/redefiner-0.8b`, un transformer de 0,8 mil millones de parámetros especializado en etiquetado de tokens (token classification). No se trata de un modelo nuevo con pesos propios: esta página aloja un rulebook en texto plano y unos ajustes de inferencia que el modelo base interpreta para marcar tramos de texto que corresponden a datos personales. El desarrollador es jungroo-ai y la licencia es Apache 2.0.

El problema que resuelve es la redacción de información personal identificable (PII) de forma auditable y modificable sin reentrenar. En lugar de depender de un clasificador cerrado con etiquetas fijas, el usuario edita un fichero de reglas en inglés sencillo (`pii.txt` o `identifiers.txt`) que describe cada tipo de dato con ejemplos, y el modelo de 0,8B marca los spans correspondientes. Esto permite adaptar el comportamiento a dominios concretos (sanitario, legal, financiero) cambiando texto, no pesos.

Su relevancia actual radica en que, según la model card, el modelo base no se entrenó con ningún dataset de datos personales y aun así alcanza un F2 medio de 87,2 en las cuatro tareas inglesas del PII Masking Benchmark, lo que lo situaría en octava posición entre 36 modelos con resultados publicados. Además, ofrece auditoría por span con offsets y confianza, algo poco habitual en filtros de privacidad comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `jungroo-ai/redefiner-0.8b`); la página es un paquete de rulebook + ajustes, no un modelo independiente |
| Parámetros totales | 0,8 mil millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se cargan desde `jungroo-ai/redefiner-0.8b`; la librería es `redefiner>=1.0.9`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 0,8B parámetros orientado a token classification, es decir, asigna una etiqueta a cada token o span del texto de entrada. La innovación principal no está en la arquitectura sino en el mecanismo de control: el modelo interpreta un rulebook en texto plano con secciones `[TYPE]`, una descripción de una línea y líneas de ejemplo, y marca los spans que encajan con esas reglas. Esto convierte la política de redacción en un artefacto legible y versionable, en lugar de un conjunto opaco de pesos.

Según la model card, ReDefiNER no se entrenó con ningún dataset de datos personales. Los detalles sobre número de tokens de entrenamiento, composición del corpus y si hubo RLHF o DPO no están disponibles en la información proporcionada. El paquete incluye dos ajustes relevantes de inferencia: `none_bias` (sesgo hacia la clase "no es PII", con valor 2 por defecto para `pii.txt` y 4 para `identifiers.txt`) y `min_confidence` (umbral de confianza, con 0,35 recomendado para `identifiers.txt`).

## Capacidades

- Detección y enmascaramiento de PII en texto en inglés mediante etiquetado de spans.
- Rulebook por defecto (`pii.txt`) con 20 tipos: nombres, tratamientos, nombres de usuario, correos, teléfonos, direcciones, lugares, coordenadas, organizaciones, puestos de trabajo, fechas y horas, edades, género, nacionalidad y otros datos demográficos, números de identificación gubernamentales y de otro tipo, direcciones IP, URLs, números de tarjeta y de cuenta bancaria, contraseñas y claves.
- Rulebook reducido (`identifiers.txt`) con 10 tipos: nombres, correos, teléfonos, direcciones, fechas de nacimiento, números de identificación, números de tarjeta, números de cuenta, direcciones IP y credenciales.
- Personalización sin reentrenamiento: basta con editar o escribir un rulebook nuevo en texto plano.
- Salida de auditoría: el comando `redefiner redact` genera un `.audit.json` con cada span enmascarado, su tipo, su confianza y los offsets de caracteres en el original.
- Uso desde Python (`Tagger.from_pretrained(...)` y `tagger.extract(...)`) y desde línea de comandos (`redefiner redact`).
- Ejecución en CPU según los ejemplos de la model card.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Redacción de notas clínicas antes de compartirlas con terceros: el rulebook `pii.txt` enmascara nombres de pacientes, fechas de nacimiento, identificadores de paciente, direcciones y teléfonos en una sola pasada, y el fichero de auditoría permite revisar qué se ha ocultado y con qué confianza.
- Cumplimiento de RGPD en pipelines de datos: integrado como paso previo a la ingesta de documentos en un almacén analítico, el modelo elimina correos, teléfonos, IP y credenciales, y el rulebook versionado sirve como evidencia de la política aplicada.
- Anonimización de transcripciones de atención al cliente: con `identifiers.txt` se conservan fechas, lugares y organizaciones legibles para análisis de negocio, mientras se enmascaran nombres, contactos y números de cuenta.
- Preparación de datasets para investigación: al no haberse entrenado con datos personales y permitir reglas explícitas, encaja en flujos donde se exige documentar qué categorías se han eliminado antes de publicar un corpus.
- Revisión de logs y ficheros de configuración: el rulebook cubre contraseñas, claves, tokens de API, direcciones IP y URLs, lo que permite sanitizar artefactos de depuración antes de adjuntarlos a un ticket o a un repositorio.
- Despliegue local en entornos con restricciones de salida de datos: al ejecutarse en CPU y con pesos de 0,8B, puede correr en una estación de trabajo sin enviar el texto a servicios externos, algo crítico en sectores regulados.
- Adaptación a dominios específicos: un despacho jurídico o una aseguradora puede escribir su propio rulebook con secciones `[TYPE]` para números de póliza o referencias judiciales, sin tocar los pesos.

## Benchmarks y rendimiento

Datos publicados en la model card. F2 a nivel de carácter sobre las particiones de test completas del PII Masking Benchmark (PIIMB), tareas en inglés.

| Configuración | Privy | Gretel | AI4Privacy EN | Nemotron-PII | Media | Puesto entre 37 |
|---|---:|---:|---:|---:|---:|---:|
| Esta página, `pii.txt` | 73,4 | 94,1 | 96,4 | 84,8 | 87,2 | 8.º |
| Esta página, `identifiers.txt` | 51,9 | 88,3 | 90,5 | 58,8 | 72,4 | 23.º |
| Rulebook escrito por dataset | 80,5 | 94,5 | 97,1 | 86,0 | 89,5 | 6.º |
| OpenMed privacy-filter-multilingual-v2 (mejor media) | 81,8 | 97,3 | 97,5 | 90,7 | 91,8 | 1.º |
| NVIDIA gliner-PII | 71,4 | 92,0 | 94,5 | 77,2 | 83,8 | no disponible |
| Fastino gliner2-privacy-filter-PII-multi | 64,6 | 93,6 | 91,4 | 85,4 | 83,7 | no disponible |
| OpenAI Privacy Filter | 53,6 | 86,9 | 84,3 | 60,7 | 71,4 | no disponible |
| Presidio (en_core_web_lg) | 51,8 | 75,8 | 73,4 | 72,9 | 68,5 | no disponible |

RedactionBench (200 documentos etiquetados bajo integridad contextual; R-Score con umbral de confianza ajustado por modelo):

| Configuración | R-Score | Puesto entre 45 |
|---|---:|---:|
| Esta página, `identifiers.txt` | 0,520 | 11.º |
| Esta página, `pii.txt` | 0,393 | 15.º |
| Perplexity PII-Tracer | 0,601 | 6.º |
| OpenAI Privacy Filter | 0,533 | 9.º |
| Fastino GLiNER2 PII | 0,445 | 12.º |

Notas de la model card: el puesto se calcula entre los 36 modelos con resultados publicados, ordenados por la media de esas cuatro tareas; PIIMB promedia seis tareas y no se ejecutaron las dos multilingües. De los siete modelos por encima de `pii.txt`, cinco declaran entrenamiento con al menos un dataset fuente de PIIMB; ReDefiNER no usó ninguno. Los rulebooks se seleccionaron sobre documentos de desarrollo y cada test se ejecutó una sola vez.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,8B parámetros, la inferencia en FP16 requeriría del orden de 1,6 GB solo para pesos, más overhead de activaciones y del runtime de la librería `redefiner`. Las cifras exactas no están publicadas.
- GPU recomendadas: no disponible. Los ejemplos de la model card se ejecutan en CPU, lo que sugiere que no requiere GPU dedicada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,8B, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería `redefiner>=1.0.9` (Python) y CLI `redefiner redact`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F2 medio PIIMB (4 tareas EN) | R-Score RedactionBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ReDefiNER PII (`pii.txt`) | 0,8B | no disponible | 87,2 | 0,393 | Apache 2.0 | Hugging Face |
| OpenMed privacy-filter-multilingual-v2 | no disponible | no disponible | 91,8 | no disponible | no disponible | Hugging Face |
| NVIDIA gliner-PII | no disponible | no disponible | 83,8 | no disponible | no disponible | Hugging Face |
| Fastino gliner2-privacy-filter-PII-multi | no disponible | no disponible | 83,7 | 0,445 | no disponible | Hugging Face |
| OpenAI Privacy Filter | no disponible | no disponible | 71,4 | 0,533 | no disponible | no disponible |
| Presidio (en_core_web_lg) | no disponible | no disponible | 68,5 | no disponible | no disponible | open source |

La ventaja diferencial de ReDefiNER PII no es la puntuación bruta sino la combinación de reglas editables, auditoría por span y ejecución local con un modelo pequeño. OpenMed lidera en F2 medio, mientras que Perplexity PII-Tracer y OpenAI Privacy Filter superan a ReDefiNER en R-Score de RedactionBench.

## Limitaciones y advertencias

- Solo soporta inglés; no se han publicado resultados en otras lenguas.
- No se entrenó con datasets de PII, lo que puede traducirse en menor cobertura en dominios con formatos de identificadores muy específicos (por ejemplo, números de la seguridad social de países concretos) salvo que se amplíe el rulebook.
- El rulebook `identifiers.txt` puede enmascarar etiquetas de campo junto a su valor (en el ejemplo de la model card, "patient ID" con confianza 0,12 y "date of birth" con 0,33); se recomienda un umbral `min_confidence` de 0,35.
- Los dos rulebooks intercambian posiciones entre benchmarks: `pii.txt` rinde mejor en PIIMB y `identifiers.txt` en RedactionBench, porque este último penaliza enmascarar lo que debería quedar legible. La elección del rulebook debe alinearse con la política de privacidad del caso de uso.
- Riesgo de alucinación de spans: no hay datos publicados sobre falsos positivos sistemáticos más allá de las métricas de F2; conviene revisar el `.audit.json` en flujos críticos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye garantías ni cláusulas adicionales sobre exactitud en entornos regulados.
- El paquete depende de la librería `redefiner>=1.0.9`; no se documenta compatibilidad con otros runtimes de inferencia, lo que limita la integración en stacks que solo soportan formatos estándar como GGUF o safetensors vía transformers.
- El modelo base es de 0,8B, por lo que su capacidad de razonamiento general es limitada; su función es exclusivamente el etiquetado de spans según reglas.

## Enlaces

- Página de Hugging Face: https://huggingface.co/jungroo-ai/redefiner-pii
- Modelo base: https://huggingface.co/jungroo-ai/redefiner-0.8b
- Guía de rulebooks: enlazada en la model card como `[guide]` (URL no incluida en la información proporcionada)
- Proyecto ReDefiNER: enlazado en la model card como `[main]` (URL no incluida en la información proporcionada)
- PII Masking Benchmark (PIIMB): referencia mencionada, URL no incluida en la información proporcionada
- RedactionBench: referencia mencionada, URL no incluida en la información proporcionada
