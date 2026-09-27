# mradermacher/Ishigaki-AEC-9B-GGUF

## Resumen

Ishigaki-AEC-9B-GGUF es la versión cuantizada en formato GGUF del modelo ONESTRUCTION/Ishigaki-AEC-9B, publicada por el usuario mradermacher. Se trata de un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado al dominio AEC (arquitectura, ingeniería y construcción, por sus siglas en inglés) y con soporte declarado de conversación. El repositorio incluye, además de los pesos de lenguaje, ficheros `mmproj` (proyector multimodal) en precisión Q8_0 y f16, lo que indica que el modelo base incorpora capacidades multimodales, presumiblemente de visión.

La relevancia de esta ficha es práctica: mradermacher es uno de los principales distribuidores de cuantizaciones GGUF de la comunidad, y esta publicación permite ejecutar un modelo de 9B del dominio de la construcción en hardware de consumo mediante llama.cpp, Ollama o alternativas similares. El repositorio ocupa 85,1 GB en total y ofrece trece variantes de cuantización, desde Q2_K (4,0 GB) hasta f16 (18,5 GB), lo que cubre desde equipos con 6 GB de VRAM hasta estaciones de trabajo con GPU de 24 GB o más.

La licencia es CC-BY-4.0, que permite uso comercial con atribución. No se ha publicado información sobre la arquitectura interna, la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks, ni en la model card del repositorio de cuantización ni en los resultados de búsqueda disponibles, por lo que una parte sustancial de las especificaciones queda marcada como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de aproximadamente 9,2B parámetros con proyector multimodal, según la presencia de ficheros `mmproj`) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés); la model card incluye la etiqueta `japanese`, que sugiere también soporte de japonés |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (repositorio de cuantización); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: ni el número de capas, ni el tipo de atención, ni si emplea atención lineal, decodificación especulativa o mecanismos híbridos. El único dato estructural verificable es el recuento de parámetros (9.197.093.888) y la existencia de un proyector multimodal distribuido aparte en formato `mmproj`, patrón habitual en modelos de lenguaje con adaptador de visión (tipo LLaVA o similar). Esto implica que el modelo acepta entradas de imagen además de texto, aunque la model card no detalla la resolución, el codificador visual ni el volumen de datos multimodales empleados.

Tampoco hay información sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset, la proporción de contenido en japonés frente a inglés, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste por instrucciones. La etiqueta `construction` y el nombre del modelo (`Ishigaki-AEC`) apuntan a un ajuste fino sobre corpus del sector de la construcción, pero no se documenta ni el origen ni el tamaño de ese corpus. Toda afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, tal como indica la etiqueta `conversational` del repositorio.
- Procesamiento de dominio específico AEC (arquitectura, ingeniería y construcción), según la etiqueta `construction`.
- Capacidades multimodales: la presencia de ficheros `mmproj-f16` y `mmproj-Q8_0` indica soporte de entrada de imágenes, presumiblemente orientado a documentación técnica, planos o fotografías de obra. El alcance exacto no está documentado.
- Soporte bilingüe parcial: inglés confirmado en el campo `language`; el japonés aparece como etiqueta, lo que sugiere entrenamiento o evaluación en ese idioma.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente técnico para consultas sobre normativa de construcción: el modelo puede responder preguntas sobre pliegos, especificaciones y buenas prácticas del sector AEC en inglés, aprovechando el ajuste de dominio declarado mediante la etiqueta `construction`.
- Análisis de documentación técnica con entrada de imagen: si se carga el proyector `mmproj-Q8_0` (0,7 GB), el modelo puede procesar fotografías de obra o documentación escaneada y generar descripciones o resúmenes, siempre que la ventana de contexto lo permita (valor no publicado).
- Redacción de informes de obra: generación de borradores de informes de progreso, actas de reunión o descripciones de incidencias a partir de notas breves, en un modelo de 9B desplegable en local.
- Extracción estructurada de información de documentos: conversión de texto técnico no estructurado en campos normalizados (materiales, partidas, mediciones) mediante prompting, integrable en un pipeline de procesamiento documental.
- Traducción asistida inglés-japonés en contexto técnico: dado el etiquetado bilingüe, puede emplearse para pre-traducción de correspondencia técnica entre equipos internacionales, con revisión humana posterior obligatoria.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse completamente en local con llama.cpp u Ollama y sin dependencia de API externa, es apto para proyectos con documentación confidencial de cliente.
- Prototipado rápido y evaluación de dominio: sirve como banco de pruebas para medir si un modelo de 9B ajustado en AEC aporta ventaja frente a un modelo generalista, antes de invertir en infraestructura mayor.
- Chatbot de soporte interno para equipos de ingeniería: asistencia en consultas recurrentes sobre procedimientos internos, con la cuantización Q4_K_M (5,9 GB) como compromiso entre calidad y coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y los resultados de búsqueda no aportan datos al respecto. Tampoco existen tablas comparativas con otros modelos de la misma categoría publicadas por el autor.

## Requisitos de hardware

Las estimaciones de VRAM se derivan del tamaño de los ficheros GGUF publicados, más un margen para la caché KV y el overhead de runtime (que depende de la longitud de contexto, no publicada). No se dispone de mediciones de latencia ni de throughput.

- Q2_K (4,0 GB): cabe en GPU de 6 GB (GTX 1660, RTX 3050) con contexto corto; calidad degradada.
- Q3_K_S / Q3_K_M / Q3_K_L (4,5-5,1 GB): GPU de 6-8 GB.
- IQ4_XS (5,5 GB): GPU de 8 GB.
- Q4_K_S / Q4_K_M (5,6-5,9 GB): recomendados por el autor por velocidad; GPU de 8-12 GB (RTX 3060 12 GB, RTX 4070).
- Q5_K_S / Q5_K_M (6,6-6,7 GB): GPU de 12 GB.
- Q6_K (7,7 GB): GPU de 12 GB con margen ajustado; 16 GB recomendable.
- Q8_0 (9,9 GB): GPU de 16 GB (RTX 4080, RTX 4090) o 12 GB con contexto reducido.
- f16 (18,5 GB): GPU de 24 GB (RTX 3090, RTX 4090, A100 40 GB); el autor lo califica de "overkill".
- Proyector multimodal: mmproj-Q8_0 requiere 0,7 GB adicionales; mmproj-f16, 1,0 GB adicionales.
- Opciones de despliegue: llama.cpp, llama.cpp server, Ollama, LM Studio, koboldcpp y text-generation-webui. El soporte de vLLM para GGUF es limitado y no está confirmado para este repositorio.
- Uso en CPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU con RAM suficiente (6-8 GB libres), a costa de una velocidad muy inferior a la de GPU.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa de benchmarks fiable. La comparación que sí puede hacerse con los datos disponibles es entre las variantes publicadas por el propio autor:

| Variante | Tipo | Tamaño (GB) | Notas del autor |
|---|---|---|---|
| Ishigaki-AEC-9B.mmproj-Q8_0 | mmproj | 0,7 | Suplemento multimodal |
| Ishigaki-AEC-9B.mmproj-f16 | mmproj | 1,0 | Suplemento multimodal |
| Ishigaki-AEC-9B.Q2_K | Q2_K | 4,0 | — |
| Ishigaki-AEC-9B.Q3_K_S | Q3_K_S | 4,5 | — |
| Ishigaki-AEC-9B.Q3_K_M | Q3_K_M | 4,8 | Calidad inferior |
| Ishigaki-AEC-9B.Q3_K_L | Q3_K_L | 5,1 | — |
| Ishigaki-AEC-9B.IQ4_XS | IQ4_XS | 5,5 | — |
| Ishigaki-AEC-9B.Q4_K_S | Q4_K_S | 5,6 | Rápida, recomendada |
| Ishigaki-AEC-9B.Q4_K_M | Q4_K_M | 5,9 | Rápida, recomendada |
| Ishigaki-AEC-9B.Q5_K_S | Q5_K_S | 6,6 | — |
| Ishigaki-AEC-9B.Q5_K_M | Q5_K_M | 6,7 | — |
| Ishigaki-AEC-9B.Q6_K | Q6_K | 7,7 | Muy buena calidad |
| Ishigaki-AEC-9B.Q8_0 | Q8_0 | 9,9 | Rápida, mejor calidad |
| Ishigaki-AEC-9B.f16 | f16 | 18,5 | 16 bpw, excesiva |

Además, el propio autor publica una variante con cuantización ponderada/imatrix en el repositorio `mradermacher/Ishigaki-AEC-9B-i1-GGUF`, que suele ofrecer mejor relación calidad-tamaño que las cuantizaciones estáticas de esta ficha.

Comparativa con modelos de terceros: no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad real del modelo en tareas de lenguaje, código, matemáticas o conocimiento general.
- Riesgo de alucinación: al tratarse de un ajuste fino de dominio sin evaluación publicada, la generación de normativa, referencias o especificaciones técnicas inventadas es un riesgo especialmente alto en el sector AEC, donde un dato erróneo puede tener consecuencias legales o de seguridad.
- Longitud de contexto desconocida: no se puede garantizar el manejo de documentos técnicos largos, lo que limita los casos de uso basados en análisis de pliegos o expedientes completos.
- Cobertura de idiomas incierta: el campo `language` solo declara inglés; el japonés aparece como etiqueta, pero se desconoce su nivel real. No hay indicios de soporte de castellano.
- Validación multimodal no documentada: la existencia de `mmproj` no garantiza un rendimiento aceptable en visión; ni la resolución de imagen ni el codificador visual están especificados.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. Debe verificarse también la licencia y los términos del modelo base ONESTRUCTION/Ishigaki-AEC-9B, ya que el repositorio de cuantización no sustituye a las condiciones del modelo original.
- Procedencia de los datos de entrenamiento desconocida: no se documenta el corpus utilizado, lo que impide evaluar sesgos, contaminación de benchmarks ni cumplimiento normativo.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin discusiones ni informes de la comunidad que permitan contrastar la calidad.
- Incoherencia en los metadatos: las fechas de creación y actualización del repositorio (27 de septiembre de 2026) no son compatibles con la fecha actual, lo que sugiere un error en los metadatos de Hugging Face y recomienda tratar el resto de campos con cautela.
- Recomendación para producción: validar el modelo con un conjunto de evaluación propio del dominio antes de cualquier despliegue, y mantener supervisión humana en todas las salidas con implicación técnica o contractual.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/Ishigaki-AEC-9B-GGUF
- Modelo base: https://huggingface.co/ONESTRUCTION/Ishigaki-AEC-9B
- Cuantizaciones ponderadas/imatrix del mismo modelo: https://huggingface.co/mradermacher/Ishigaki-AEC-9B-i1-GGUF
- Página de descarga y visión general del autor para este modelo: https://hf.tst.eu/model#Ishigaki-AEC-9B-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible.
