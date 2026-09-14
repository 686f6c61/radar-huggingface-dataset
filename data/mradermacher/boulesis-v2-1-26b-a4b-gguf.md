# mradermacher/Boulesis-v2.1-26B-A4B-GGUF

## Resumen

Boulesis-v2.1-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo SubMaroon/Boulesis-v2.1-26B-A4B, publicada por el usuario mradermacher. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) de la familia Gemma, con 25.971.339.550 parámetros totales (unos 26B) según los pesos en safetensors del modelo base, y una nomenclatura "A4B" que apunta a del orden de 4B parámetros activos por token. La model card lo etiqueta como un merge orientado a roleplay, sin censura, con modo de pensamiento y razonamiento.

El repositorio distribuye únicamente pesos GGUF, en 11 cuantizaciones estáticas que van de 10,9 GB (Q2_K) a 27,7 GB (Q8_0), con un tamaño total de repositorio de 187,7 GB. Eso permite ejecutar un MoE de ~26B en hardware de consumo, pagando el coste de memoria de los 26B pero con el coste de cómputo por token de un modelo con muchos menos parámetros activos.

Es relevante ahora porque combina tres tendencias recientes: arquitecturas MoE eficientes en cómputo, modelos "sin censura" para roleplay y generación creativa sin filtros, y despliegue local mediante el ecosistema llama.cpp. El repositorio es muy reciente (creado el 14 de septiembre de 2026), con 0 descargas y 0 likes, y no incluye resultados de evaluación ni datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia Gemma (etiqueta "gemma4" en la model card); número de capas, expertos y expertos activos no disponibles |
| Parametros totales | 25.971.339.550 (~26B), dato de los safetensors del modelo base |
| Parametros activos | ~4B, deducido de la nomenclatura "A4B" del nombre; no confirmado explícitamente en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas; no hay cuantizaciones ponderadas ni imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (gemma) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | SubMaroon/Boulesis-v2.1-26B-A4B |
| Tamano del repositorio | 187,7 GB |
| Compatibilidad de endpoints | Sí (etiqueta "endpoints_compatible") |
| Fecha de creacion / actualizacion | 14 de septiembre de 2026 / 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es una mezcla de expertos (MoE) de la familia Gemma, con 25.971.339.550 parámetros totales y, por la nomenclatura del nombre, del orden de 4B parámetros activos por token. No se documentan en la model card ni en el repositorio de cuantización el número de capas, el número de expertos, el mecanismo de enrutamiento, la longitud de contexto nativa ni ningún detalle de la atención (por ejemplo, si usa atención lineal o sliding window). Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo fases de RLHF, DPO o similar.

Las etiquetas de la model card aportan información sobre el proceso de construcción: "merge" indica que el modelo base es una fusión de pesos, "heretic" sugiere que se aplicó un proceso de abliteración automática del estilo de la herramienta Heretic, y "uncensored" confirma el objetivo de eliminar los mecanismos de rechazo del modelo original. Las etiquetas "thinking" y "reasoning" apuntan a que el modelo soporta un modo de razonamiento explícito antes de la respuesta final. Todos estos extremos son inferencias a partir de las etiquetas y el nombre del modelo, no datos verificados en la documentación.

La cuantización la realiza mradermacher con su flujo habitual (quantize_version 2, salida con tensores cuantizados, conversión a formato HF). Se trata de cuantizaciones estáticas: el autor indica que no hay cuantizaciones ponderadas ni imatrix y que no las tiene planificadas a corto plazo, aunque acepta peticiones por discusión comunitaria. El campo "skip_mmproj" figura activado en los metadatos de la conversión.

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con las etiquetas "roleplay", "conversational" y "sillytavern" en la model card.
- Modo de pensamiento y razonamiento ("thinking", "reasoning"), es decir, generación de una cadena de razonamiento previa a la respuesta.
- Generación sin censura: el modelo está diseñado explícitamente para no aplicar rechazos ni filtros de contenido ("uncensored", "heretic").
- Fusión de pesos ("merge"): combina capacidades de varios modelos, lo que suele mejorar la adherencia a estilos y personajes.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles con el formato de OpenAI.
- Capacidad multilingüe: no disponible. La model card declara únicamente inglés.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible, más allá de la etiqueta genérica de razonamiento.
- Visión, audio u otras modalidades: no disponible.
- Generación de código y matemáticas: no disponible (no hay etiquetas ni evaluaciones al respecto).

## Casos de uso

- Roleplay y narrativa interactiva en local: el modelo está etiquetado para SillyTavern y roleplay, y su condición de "uncensored" permite mantener personajes y tramas sin interrupciones por filtros de contenido. El formato GGUF permite ejecutarlo con koboldcpp o llama.cpp junto a un frontend de rol.
- Asistente conversacional personal sin conexión: con una cuantización Q4_K_S (16,0 GB) o IQ4_XS (14,6 GB) puede desplegarse en una GPU de 16-24 GB o en CPU con RAM suficiente, manteniendo los datos en local.
- Generación de personajes y diálogos para videojuegos o ficción interactiva: el modo de pensamiento permite obtener respuestas coherentes con un trasfondo de personaje largo, y el proceso de merge suele aportar consistencia de estilo entre turnos.
- Generación de datos sintéticos de conversación: puede usarse para producir corpus de diálogo multi-turno en inglés (incluido contenido que otros modelos rechazarían), útil para investigación sobre seguridad, detección de contenido o entrenamiento de clasificadores.
- Investigación en alineación y abliteración: comparar este modelo con su antecesor alineado permite medir el efecto de la eliminación de mecanismos de rechazo sobre calidad, coherencia y sesgos.
- Servicio mediante API compatible con OpenAI: la etiqueta "endpoints_compatible" sugiere que puede exponerse detrás de un endpoint tipo OpenAI para integrarlo en aplicaciones existentes sin cambios de cliente.
- Ajuste fino local con QLoRA: las cuantizaciones Q4 y Q5 permiten entrenar adaptadores de bajo rango sobre un MoE de 26B en GPUs de 24 GB, ajustando el estilo de roleplay o el dominio de un personaje concreto.
- Pruebas de estrés de infraestructura de inferencia: útil para medir el comportamiento de llama.cpp con arquitecturas MoE de 26B y 11 niveles de cuantización distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantización no incluye ninguna tabla de evaluación (MMLU, GSM8K, HumanEval, MT-Bench ni equivalentes), y tampoco se han encontrado resultados en la búsqueda web. El modelo base SubMaroon/Boulesis-v2.1-26B-A4B tampoco aporta métricas en la información proporcionada, por lo que no es posible comparar numéricamente su calidad con alternativas.

## Requisitos de hardware

Tamaños de archivo reales de cada cuantización y estimación de VRAM necesaria (tamaño del archivo más 1-3 GB para caché KV y buffers; la estimación asume una longitud de contexto moderada, ya que la longitud de contexto del modelo no está documentada):

| Cuantizacion | Tamano (GB) | VRAM estimada (GB) | GPU objetivo |
|---|---|---|---|
| Q2_K | 10,9 | 12-13 | RTX 3060 12 GB con contexto corto |
| Q3_K_S | 12,6 | 14-15 | RTX 4070 Ti Super 16 GB |
| Q3_K_M | 13,7 | 15-16 | 16 GB (calidad inferior según el autor) |
| Q3_K_L | 14,2 | 15-16 | 16 GB |
| IQ4_XS | 14,6 | 16-17 | 16 GB muy justo; 24 GB holgado |
| Q4_K_S | 16,0 | 17-18 | 24 GB, o 16 GB con offload parcial |
| Q4_K_M | 17,3 | 18-19 | RTX 3090 / RTX 4090 (24 GB) |
| Q5_K_S | 18,6 | 20-21 | 24 GB |
| Q5_K_M | 19,7 | 21-22 | 24 GB |
| Q6_K | 23,3 | 25-26 | 24 GB muy justo; 32 GB recomendado |
| Q8_0 | 27,7 | 29-30 | A100 40 GB, 2x24 GB o CPU + RAM |

- VRAM para inferencia: entre 12 GB (Q2_K, contexto corto) y 30 GB (Q8_0) según la cuantización, más el coste de la caché KV que depende de una longitud de contexto no documentada.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para el rango Q4-Q5, que es el equilibrio habitual entre calidad y tamaño; A100 40 GB o dos GPU de 24 GB para Q8_0.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con Q2_K, y con buena calidad en 24 GB (Q4_K_M, Q5_K_M).
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y Jan son las opciones naturales al ser un GGUF. Para servir como API compatible con OpenAI puede usarse llama.cpp server, Ollama o vLLM/TGI con soporte GGUF, aunque en vLLM el soporte de GGUF es menos maduro que en el ecosistema llama.cpp.
- Latencia y throughput: no disponible. No hay mediciones publicadas en el repositorio. Como referencia estructural, al ser un MoE con ~4B parámetros activos, la velocidad de generación debería acercarse a la de un modelo denso de ese orden, pero el requisito de memoria es el de un modelo de 26B y no hay datos medidos que lo confirmen en esta información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B-GGUF (este repositorio) | ~26B totales, ~4B activos (estimado) | no disponible | Gemma | GGUF, 11 cuantizaciones estáticas | Cuantizado por mradermacher; sin benchmarks ni descargas |
| Boulesis-v2.1-26B-A4B (modelo base) | 25.971.339.550 (~26B) | no disponible | Gemma | safetensors | Modelo original de SubMaroon; merge orientado a roleplay sin censura |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | La model card no referencia modelos comparables y la búsqueda web no devolvió información relacionada |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que no es posible establecer una comparación cuantitativa. La única comparación defendible con la información disponible es la que enfrenta a este repositorio con su modelo base: mismo número de parámetros totales, misma licencia y mismo idioma, con la diferencia de que el GGUF permite inferencia en hardware mucho más modesto a cambio de pérdida de precisión en las cuantizaciones bajas.

## Limitaciones y advertencias

- Sesgos conocidos: no hay ninguna evaluación de sesgos publicada. Al ser un modelo "uncensored" derivado por abliteración, es esperable que reproduzca estereotipos y contenido ofensivo sin filtros; no hay datos que cuantifiquen este extremo.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, fidelidad ni robustez. Es un merge sin validación documentada, por lo que la fiabilidad factual no está garantizada.
- Idioma: la model card declara únicamente inglés. El rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Longitud de contexto: no disponible. Esto impide planificar despliegues que dependan de ventanas largas y hace imposible dimensionar la caché KV con precisión.
- Licencia Gemma: la licencia impone condiciones de uso, obligaciones de distribución de los términos y una política de usos prohibidos. Conviene revisar los términos completos antes de cualquier despliegue comercial o de redistribuir pesos derivados.
- Contenido generado: el propósito declarado del modelo es la generación sin censura, lo que implica riesgo de producir contenido adulto, violento u ofensivo. No es adecuado para aplicaciones de cara al público sin una capa de moderación propia.
- Cuantizaciones bajas: Q2_K, Q3_K_S y Q3_K_M degradan notablemente la perplejidad. El autor marca explícitamente Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0.
- Ausencia de cuantizaciones ponderadas o imatrix: solo hay cuantizaciones estáticas, lo que suele implicar una pérdida de calidad algo mayor que las versiones ponderadas equivalentes.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, con un tamaño de repositorio de 187,7 GB. No hay evidencia de uso en producción ni informes de terceros.
- Tool calling y agentes: no hay soporte documentado de function calling ni de flujos de agente, por lo que no debería asumirse en integraciones que dependan de ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Boulesis-v2.1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Boulesis-v2.1-26B-A4B-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador del cuantizador (nethype GmbH): https://www.nethype.de/
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo. Los únicos resultados obtenidos fueron páginas de soporte de correo de un operador de telefonía, sin relación con el modelo. No se han encontrado papers, blogs ni demostraciones asociados.
