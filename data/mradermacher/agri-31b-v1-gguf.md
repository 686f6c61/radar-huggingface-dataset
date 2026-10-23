# mradermacher/agri-31b-v1-GGUF

## Resumen

`mradermacher/agri-31b-v1-GGUF` es una republicación en formato GGUF del modelo `toiru99/agri-31b-v1`, un modelo de lenguaje de aproximadamente 30.700 millones de parámetros (30.697.345.596 según los pesos en safetensors del modelo base) etiquetado por su autor dentro del dominio de la agricultura y con el coreano (`ko`) como único idioma declarado. No se trata de un modelo nuevo: el repositorio lo firma mradermacher como cuantizador, que genera versiones estáticas en GGUF (de Q2_K a f16, incluyendo variantes K y IQ4_XS) para permitir inferencia en CPU y GPU de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de verticalización lingüística y sectorial poco habitual: un modelo de 31B orientado a agricultura y entrenado para coreano, una combinación escasa en el ecosistema abierto. Por otro, ilustra el flujo habitual de cuantización estática que permite ejecutar pesos de gran tamaño en hardware modesto, con el coste de calidad asociado a las cuantizaciones agresivas.

La información publicada es muy limitada: la model card del repositorio GGUF solo describe el proceso de cuantización de mradermacher, y no aporta detalles sobre arquitectura, datos de entrenamiento, longitud de contexto, benchmarks ni alineación del modelo original. Esta ficha marca explícitamente como «no disponible» todo dato que no consta en la información consultada, y advierte de que el modelo no cuenta todavía con validación comunitaria (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer denso, MoE o híbrido) |
| Parametros totales | 30.697.345.596 (≈30,7 B) |
| Parametros activos | no disponible (no se ha documentado una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, además de proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | coreano (ko), único idioma declarado en el tag `language` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base `toiru99/agri-31b-v1` |
| Modelo base | `toiru99/agri-31b-v1` |
| Precision original | bfloat16 (tag del repositorio) |
| Tamano del repositorio | 31,7 GB |
| Autor de la cuantizacion | mradermacher (nethype GmbH) |
| Biblioteca declarada | transformers |
| Etiquetas | agriculture, gguf, conversational, endpoints_compatible |
| Fecha de creacion | 2026-10-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base. El repositorio únicamente indica que se trata de pesos en `bfloat16` con 30.697.345.596 parámetros, compatible con la librería `transformers` y con la etiqueta `conversational`, lo que sugiere un modelo de lenguaje causal ajustado para diálogo. No consta si emplea atención completa, atención lineal, mezcla de expertos, capas recurrentes o una combinación híbrida, ni tampoco el número de capas, la dimensión oculta o el vocabulario utilizado.

Tampoco se documentan los datos de entrenamiento: se desconoce el volumen de tokens, la composición del corpus (aunque la etiqueta `agriculture` apunta a una especialización sectorial), si hubo fases de instrucción supervisada, RLHF o DPO, y qué técnica de alineación se aplicó. La única innovación técnica constatable en este repositorio es el propio proceso de cuantización: mradermacher publica cuantizaciones estáticas (no ponderadas con imatrix, según indica el autor, que deja la puerta abierta a solicitarlas mediante una discusión comunitaria) e incluye ficheros `mmproj` en Q8_0 y f16, descritos como «multi-modal supplement». La presencia de estos proyectores sugiere soporte para entrada multimodal a través de llama.cpp, pero la model card no especifica la modalidad, el codificador visual ni el procedimiento de alineación, por lo que debe tratarse como un dato no confirmado.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la inclusión de una plantilla de chat en el ecosistema GGUF apuntan a un uso como asistente de diálogo, aunque la model card no detalla el formato de prompt.
- Especialización sectorial en agricultura: el tag `agriculture` indica que el ajuste del modelo base se orientó a vocabulario y contenidos agronómicos, sin que se publique la metodología ni la evaluación de esa especialización.
- Competencia lingüística en coreano: único idioma declarado. No se documenta soporte para inglés, castellano ni ninguna otra lengua, y el comportamiento fuera del coreano es desconocido.
- Posible entrada multimodal: los ficheros `mmproj-Q8_0` y `mmproj-f16` indican que el repositorio incluye un proyector para modelos multimodales en llama.cpp; la modalidad concreta no está documentada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo «thinking» o razonamiento extendido: no disponible.
- Capacidades de código y matemáticas: no documentadas ni evaluadas en la información disponible.

## Casos de uso

- Asistente agronómico en coreano: el modelo puede desplegarse como chatbot de consulta para agricultores y técnicos de campo, aprovechando su especialización declarada en agricultura y su competencia en coreano. Es adecuado porque cubre simultáneamente el dominio y el idioma, una combinación rara en modelos abiertos.
- Canal de soporte para cooperativas agrícolas: integrado detrás de una cola de mensajes, el modelo puede responder consultas frecuentes sobre calendario de cultivos, riego o fertilización en coreano, con derivación a un técnico humano cuando la confianza sea baja.
- Extracción y resumen de documentación técnica agrícola: uso en pipelines de procesamiento por lotes para resumir informes de extensión agraria, fichas de producto fitosanitario o manuales de maquinaria redactados en coreano, reduciendo el tiempo de revisión manual.
- Base de un sistema RAG sobre normativa agrícola coreana: el modelo puede consumir fragmentos recuperados de un índice vectorial y redactar respuestas citando la documentación, lo que mitiga parcialmente el riesgo de alucinación en un dominio regulado.
- Generación de material divulgativo y formativo: redacción de guías, boletines y guiones para formación de agricultores en coreano, con revisión humana posterior obligatoria por tratarse de contenido técnico.
- Despliegue en local o en el borde (edge): gracias a las cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse con llama.cpp en una estación de trabajo con GPU de consumo o incluso en CPU con suficiente RAM, lo que permite operar en explotaciones con conectividad limitada y sin enviar datos fuera de la organización.
- Clasificación y etiquetado de incidencias fitosanitarias: si el proyector multimodal funciona correctamente, el modelo podría asistir en la descripción de imágenes de cultivos enviadas por agricultores; esta capacidad debe validarse empíricamente antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos del modelo base incluyen métricas de MMLU, HumanEval, GSM8K, evaluaciones en coreano (como KoBEST o HAE-RAE) ni comparaciones con modelos de referencia. Tampoco se documenta la degradación de perplejidad introducida por cada cuantización estática, un dato que el autor del repositorio no ha publicado para este modelo concreto.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del número de parámetros (30,7 B) y de los bits por peso típicos de cada tipo de cuantización en llama.cpp; no han sido publicadas por el autor y no incluyen el espacio adicional para la caché KV, que depende de la longitud de contexto (no documentada) y del número de secuencias concurrentes.

| Cuantizacion | Peso aproximado | VRAM estimada con overhead minimo | Hardware de referencia |
|---|---:|---:|---|
| f16 / x-f16 | ≈61 GB | ≈63-65 GB | A100 80 GB, H100 80 GB, o 2× A100 40 GB |
| Q8_0 | ≈33 GB | ≈35-37 GB | A100 40 GB, L40S 48 GB, A6000 48 GB |
| Q6_K | ≈25 GB | ≈27-29 GB | A100 40 GB, 2× RTX 4090 24 GB |
| Q5_K_M | ≈22 GB | ≈24-26 GB | RTX 4090 24 GB con contexto corto, L40S 48 GB |
| Q4_K_M | ≈19 GB | ≈21-23 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| IQ4_XS | ≈16 GB | ≈18-20 GB | RTX 4080 16 GB ajustado, RTX 4090 con holgura |
| Q3_K_M | ≈15 GB | ≈17-19 GB | RTX 4080 16 GB, RTX 3090 24 GB |
| Q2_K | ≈11 GB | ≈13-15 GB | RTX 4070 Ti 12 GB ajustado, RTX 4080 16 GB |

- Cabe en GPU de consumo: sí, en el rango Q2_K a Q4_K_M con tarjetas de 16-24 GB (RTX 4080, 4090, 3090). Las cuantizaciones Q5 y superiores requieren 24 GB o más y contexto reducido.
- Ejecución en CPU: viable con Q4_K_M o inferiores si se dispone de al menos 24-32 GB de RAM; el rendimiento será de pocos tokens por segundo y depende por completo del hardware, sin cifras publicadas.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio y servidores compatibles con la API de OpenAI incluidos en llama.cpp (`llama-server`). vLLM admite GGUF de forma experimental; TGI no soporta GGUF de forma nativa, por lo que requeriría los safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, de la cuantización y de la longitud de contexto, que además es desconocida.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque no existen benchmarks publicados de `agri-31b-v1`. La tabla siguiente contrasta únicamente datos estructurales y de licencia; las cifras de los modelos alternativos provienen de sus respectivas model cards públicas y se incluyen como referencia de categoría, no como evaluación comparativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---:|---|---|---|---|
| agri-31b-v1 (este modelo) | ≈30,7 B | no disponible | coreano | Apache 2.0 | GGUF (esta repo), safetensors (base) |
| Qwen2.5-32B-Instruct | ≈32,5 B | 131.072 tokens | multilingüe (incluye coreano) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| Gemma 2 27B | ≈27 B | 8.192 tokens | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| Yi-34B | ≈34 B | 200.000 tokens (en variantes posteriores, 4.096 en la original) | inglés, chino | Apache 2.0 (con condiciones para algunas variantes) | safetensors, GGUF |

Diferencias cualitativas relevantes: frente a las alternativas, `agri-31b-v1` se distingue por su verticalización en agricultura y su restricción al coreano, lo que reduce su aplicabilidad general pero puede ser una ventaja en despliegues sectoriales. Las alternativas citadas tienen documentación técnica y evaluaciones públicas mucho más completas, y contextos declarados; en este modelo la longitud de contexto es un dato desconocido que conviene verificar antes de diseñar cualquier aplicación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar especializado en agricultura y limitado al coreano, es probable que herede los sesgos de su corpus de entrenamiento, que no se ha descrito; no hay evaluación de sesgo publicada.
- Riesgo de alucinación: alto en ausencia de datos sobre alineación o entrenamiento con refuerzo. En un dominio técnico como la agricultura, donde una recomendación errónea sobre fitosanitarios o riego puede tener consecuencias materiales, toda salida debe verificarse por un profesional.
- Limitación de idioma: el único idioma declarado es el coreano. No hay evidencia de competencia en castellano, inglés ni otras lenguas, por lo que no debe asumirse un comportamiento multilingüe.
- Longitud de contexto desconocida: no se puede garantizar el funcionamiento en conversaciones largas ni en pipelines RAG con muchos fragmentos. Es imprescindible determinarla empíricamente antes de producción.
- Degradación por cuantización: las versiones Q2_K y Q3_K pueden degradar notablemente la calidad respecto a f16, especialmente en un modelo de 31B. Además, el autor indica que las cuantizaciones estáticas no están ponderadas con imatrix, lo que suele implicar una pérdida de calidad algo mayor que las versiones ponderadas equivalentes.
- Soporte multimodal sin confirmar: la presencia de ficheros `mmproj` no garantiza que el modelo funcione correctamente con imágenes; no se documenta el codificador ni el procedimiento de alineación.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existen informes de terceros, comparativas independientes ni incidencias reportadas sobre este repositorio.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Debe verificarse, no obstante, que el modelo base `toiru99/agri-31b-v1` mantenga la misma licencia y que los datos de entrenamiento no impongan restricciones adicionales, algo que no se detalla en la información disponible.
- Fecha de creación anómala (2026-10-23) en los metadatos: conviene contrastarla con la del modelo base antes de citar el repositorio.
- Caveat de producción: sin benchmarks, sin contexto declarado y sin evaluación independiente, este modelo no debería desplegarse en un sistema crítico sin una batería propia de evaluaciones en el dominio y el idioma objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/agri-31b-v1-GGUF
- Modelo base: https://huggingface.co/toiru99/agri-31b-v1
- Lista de descargas y visión general del autor: https://hf.tst.eu/model#agri-31b-v1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del cuantizador (nethype GmbH): https://www.nethype.de/
