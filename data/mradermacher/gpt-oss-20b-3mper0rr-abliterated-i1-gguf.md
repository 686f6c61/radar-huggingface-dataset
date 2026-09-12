# mradermacher/gpt-oss-20b-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `gpt-oss-20b-3MPER0RR-abliterated`, un derivado "abliterated" (con la dirección de rechazo suprimida de los pesos) del modelo abierto `gpt-oss-20b` de OpenAI. El autor de las cuantizaciones es `mradermacher`, un publicador habitual de versiones GGUF de modelos de la comunidad, y el modelo fuente es la variante publicada por el usuario `3MPER0RR`. La model card únicamente indica que se trata de cuantizaciones "weighted/imatrix" del modelo fuente, sin aportar detalles sobre el proceso de abliteración ni sobre evaluación posterior.

El interés de esta ficha radica en que combina dos elementos: por un lado, la arquitectura del `gpt-oss-20b` base, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 21.000 millones de parámetros totales y unos 3.600 millones activos por token, ventana de contexto de 128.000 tokens y pesos nativos en MXFP4, según la documentación pública de OpenAI. Por otro, la modificación abliterated, que elimina las direcciones latentes asociadas al rechazo de peticiones, lo que reduce drásticamente las negativas del modelo ante contenido sensible.

El resultado es un artefacto orientado a investigación en alineación, red-teaming y generación sin restricciones de fábrica, distribuido en múltiples niveles de cuantización que van desde IQ1_S hasta Q6_K. Según los metadatos de HuggingFace en el momento de redactar esta ficha, el repositorio registra 0 descargas y 0 "likes", con un tamaño de 0,0 GB y una fecha de creación de 2026-09-12, lo que sugiere que se trata de una publicación reciente y todavía no validada por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) del modelo base gpt-oss-20b (*) |
| Parametros totales | 7.012.728 segun metadatos safetensors del repo (ver nota) |
| Parametros activos | Aproximadamente 3.600 millones en el modelo base gpt-oss-20b (*) |
| Longitud de contexto | 128.000 tokens en el modelo base (*); no confirmado para este derivado |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del repo (el modelo base se publica bajo Apache 2.0 segun su documentacion publica) (*) |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |

Notas sobre la tabla:

- Los valores marcados con (*) provienen de documentación pública del modelo base `gpt-oss-20b`, no de la información suministrada por HuggingFace ni por la model card de este repositorio. Se incluyen como contexto arquitectónico y deben verificarse en la fuente original.
- La cifra de "parámetros totales" de 7.012.728 procede del campo de metadatos safetensors del repositorio. Resulta incompatible con el identificador del modelo (`gpt-oss-20b`) y con la arquitectura del base, por lo que es muy probable que sea un metadato erróneo, incompleto o correspondiente a otro artefacto. No se ha podido confirmar el recuento real de parámetros a partir de la información disponible.
- El tamaño del repositorio figura como 0,0 GB, lo que puede indicar un fallo de indexación o una subida incompleta.

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base `gpt-oss-20b` de OpenAI: un transformer de tipo mezcla de expertos con enrutamiento por token, aproximadamente 21.000 millones de parámetros totales y del orden de 3.600 millones activos por token, pesos nativos cuantizados en MXFP4 y una ventana de contexto de 128.000 tokens. El modelo base incorpora un formato de interacción propietario (Harmony) y niveles configurables de esfuerzo de razonamiento, además de soporte nativo de llamadas a herramientas. Esta descripción proviene de la documentación pública del modelo original y no de la información aportada en este repositorio.

Sobre el proceso de entrenamiento del base (número de tokens, composición del dataset, uso de RLHF o DPO) no se dispone de datos en la información proporcionada, por lo que se marca como no disponible. Lo que sí documenta la model card de este repositorio es el proceso de post-procesado posterior: el modelo fuente `3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated` ha sido publicado por un tercero y, a partir de él, `mradermacher` ha generado cuantizaciones GGUF utilizando una matriz de importancia (imatrix), es decir, calibrando la cuantización con estadísticas de activaciones para minimizar la pérdida de precisión. No se detalla el corpus de calibración empleado, ni si la abliteración se aplicó sobre los pesos en precisión completa antes o después de la conversión a MXFP4, ni qué metodología concreta de abliteración se utilizó. La etiqueta `abliterated` implica, por convención en la comunidad, la eliminación de direcciones de activación asociadas al rechazo, pero no se aporta evidencia técnica del procedimiento en la documentación disponible.

## Capacidades

Dado que no se han publicado evaluaciones específicas de este derivado, la siguiente lista describe capacidades atribuibles al modelo base `gpt-oss-20b` y debe tratarse como expectativa no verificada para esta cuantización concreta:

- Generación de texto y razonamiento multi-paso, con modos de esfuerzo de razonamiento configurables en el modelo base.
- Generación y explicación de código, con soporte para lenguajes habituales en el modelo original.
- Resolución de problemas matemáticos y de razonamiento lógico de complejidad media.
- Soporte de tool calling / function calling según el formato Harmony del modelo base.
- Capacidad de operar en flujos de agente con múltiples llamadas encadenadas, apoyada en la ventana de contexto de 128.000 tokens.
- Ausencia (o reducción drástica) de rechazos ante peticiones que el modelo base rechazaría, como consecuencia de la abliteración.
- Capacidades multilingües: no disponibles; no se especifica en la información proporcionada qué idiomas soporta el derivado ni si la abliteración degradó el rendimiento en idiomas distintos del inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles en la información proporcionada para este derivado.

## Casos de uso

- Red-teaming y auditoría de seguridad: el modelo permite generar respuestas que un modelo alineado rechazaría, lo que lo hace útil para que equipos de seguridad evalúen clasificadores de contenido, filtros de salida y sistemas de moderación frente a entradas adversarias.
- Investigación en alineación y mecanística: al comparar este modelo con el `gpt-oss-20b` original se puede estudiar qué comportamientos y capacidades se degradan al eliminar las direcciones de rechazo, y cuantificar el coste de la abliteración en tareas neutras.
- Generación de datasets sintéticos sin filtrado previo: útil para construir corpus de entrenamiento que incluyan temáticas sensibles (ficción con violencia explícita, debates controvertidos, contenido para investigación social) sin que el generador se niegue a producir el material.
- Asistencia creativa sin restricciones temáticas: escritura de narrativa de género negro, terror o ficción adulta donde el modelo base tiende a suavizar o rechazar escenas, manteniendo el control de estilo mediante prompting.
- Simulación de personajes y roleplay prolongado: la ventana de contexto de 128.000 tokens del base permite mantener conversaciones de的角色 largas sin perder el hilo, apoyándose en las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y memoria.
- Evaluación comparativa de cuantizaciones: al publicarse 24 variantes distintas (desde IQ1_S hasta Q6_K), el repositorio sirve como banco de pruebas para medir cuánta calidad se pierde en cada nivel de compresión sobre un modelo MoE, un caso de estudio relevante porque los MoE son especialmente sensibles a la cuantización agresiva de expertos poco activados.
- Despliegue local en estaciones de trabajo sin conexión: los ficheros GGUF de menor tamaño permiten ejecutar un modelo de clase 20B en portátiles o equipos de gama media mediante llama.cpp u Ollama, en escenarios donde no se puede enviar datos a la nube.
- Traducción y reescritura de textos sensibles en entornos jurídicos o periodísticos: procesamiento de material explícito (denuncias, testimonios) que otros modelos filtran por políticas de contenido, siempre que el marco legal de uso lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench o similares, ni para el derivado abliterated ni para las cuantizaciones GGUF concretas. Tampoco se aportan datos sobre la degradación de perplejidad introducida por la abliteración o por cada nivel de cuantización.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño nominal del modelo (clase 20B) y del ancho de bits teórico de cada cuantización, no medidas sobre los ficheros reales, cuyo tamaño no se ha podido verificar (el repositorio figura con 0,0 GB). Tómense como orientativas.

- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M): aproximadamente 4-8 GB de peso en disco y en memoria. Ejecutables en GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) o incluso en CPU con RAM suficiente. Pérdida de calidad esperable alta.
- Cuantizaciones intermedias (Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M): aproximadamente 8-11 GB. Encajan en RTX 4070 Ti Super, RTX 4080 o RTX 4090 con margen para caché KV.
- Cuantizaciones de calidad media-alta (Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL): aproximadamente 11-14 GB. Recomendadas para RTX 4090, RTX 5090 o GPU de 24 GB, así como para Mac con memoria unificada de 32 GB o superior.
- Cuantizaciones altas (Q5_K_S, Q5_K_M, Q6_K): aproximadamente 14-18 GB. Requieren GPU de 24 GB (RTX 4090, A6000, L40S) o memoria unificada de 32-64 GB. En A100 40 GB o H100 80 GB sobra espacio para contextos largos.
- Caché KV: con 128.000 tokens de contexto y decenas de capas, la caché KV puede añadir varios GB adicionales. Para contextos largos conviene cuantizar también la caché KV (`--cache-type-k q8_0` en llama.cpp) o reducir la ventana efectiva.
- GPU recomendadas por perfil: consumer (RTX 3090, RTX 4090, RTX 5090), workstation (RTX A6000, L40S, A100 40/80 GB), y aceleradores Apple Silicon con 32-128 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llamafile, llama-cpp-python, text-generation-webui y servidores compatibles con el backend de llama.cpp. vLLM y TGI ofrecen soporte parcial o indirecto de GGUF; para estos motores es preferible partir del modelo base en MXFP4 o en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones de este repositorio.

## Comparativa con modelos similares

La siguiente tabla compara este repositorio con el modelo fuente del que deriva y con el modelo base original. Las celdas marcadas como no disponibles reflejan ausencia de datos en la información proporcionada.

| Aspecto | Este repo (mradermacher, GGUF) | 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated | gpt-oss-20b (base) |
|---|---|---|---|
| Rol | Cuantizaciones GGUF del derivado abliterated | Derivado abliterated en precisión original | Modelo abierto original de OpenAI |
| Arquitectura | MoE, heredada del base | MoE, heredada del base | MoE, ~21.000 M totales / ~3.600 M activos |
| Longitud de contexto | no disponible (128.000 tokens en el base) | no disponible | 128.000 tokens |
| Formatos | GGUF en 24 variantes de cuantización | no disponible | safetensors en MXFP4 |
| Licencia | no disponible | no disponible | Apache 2.0 |
| Alineación de seguridad | Rechazos suprimidos (abliterated + cuantización) | Rechazos suprimidos (abliterated) | Alineado, con rechazos activos |
| Benchmarks publicados | No | No | Sí, en la documentación de OpenAI |
| Disponibilidad | Repositorio publicado; 0 descargas, 0 likes | Publicado en HuggingFace | Publicado por OpenAI |

No se dispone de datos objetivos de rendimiento para establecer una comparación cuantitativa entre estas variantes, ni con alternativas de otros proveedores en la misma franja de parámetros. Cualquier comparación de calidad entre la versión abliterated y la original requeriría una evaluación propia.

## Limitaciones y advertencias

- La abliteración elimina o atenúa los mecanismos de rechazo del modelo. Esto no solo afecta a contenido sensible: la literatura sobre la técnica documenta degradaciones colaterales en razonamiento, coherencia y seguimiento de instrucciones. No se ha publicado ninguna evaluación que cuantifique ese daño en este derivado concreto.
- Riesgo elevado de generar contenido dañino, ilegal o desinformación sin filtro previo. El modelo no debe exponerse directamente a usuarios finales sin una capa de moderación externa.
- Riesgo de alucinación: inherente a los modelos de esta familia y no evaluado en esta variante. La abliteración puede aumentar la tendencia a afirmar con seguridad contenido inventado.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M) degradan de forma notable la calidad, especialmente en modelos MoE donde los expertos menos activados reciben pocos bits. No se recomiendan para producción.
- La licencia del derivado no está declarada en los metadatos. Aunque el modelo base se distribuye bajo Apache 2.0, el derivado abliterated es una obra de un tercero y su régimen de uso comercial es incierto. Antes de utilizarlo en producción conviene contactar con el autor o consultar la model card del repositorio fuente.
- La cabecera de la model card incluye la etiqueta `nicoboss` y campos de plantilla sin rellenar (`vocab_type` vacío), lo que sugiere una publicación generada de forma automatizada sin revisión manual.
- Inconsistencia de metadatos: el recuento de parámetros declarado (7.012.728) no concuerda con la denominación del modelo ni con la arquitectura del base, y el tamaño del repositorio figura como 0,0 GB. Antes de descargar conviene verificar la integridad de los ficheros y las sumas de comprobación.
- No se especifican los idiomas soportados. Si el modelo base está optimizado para inglés, el rendimiento en castellano puede ser inferior y no hay datos al respecto.
- Ausencia total de validación comunitaria: 0 descargas y 0 "likes" en el momento de redactar esta ficha implican que no existen informes independientes de funcionamiento, y que el artefacto no ha pasado por ninguna revisión por pares informal.
- Uso responsable: en la Unión Europea, el despliegue de sistemas que generen contenido sin filtros puede entrar en conflicto con obligaciones de moderación y con la normativa aplicable sobre contenidos ilícitos. Evalúese el marco legal antes de cualquier uso público.

## Enlaces

- Repositorio de este modelo (GGUF): https://huggingface.co/mradermacher/gpt-oss-20b-3MPER0RR-abliterated-i1-GGUF
- Modelo fuente abliterated: https://huggingface.co/3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Modelo base original de OpenAI: https://huggingface.co/openai/gpt-oss-20b (referencia pública; no incluida en la información suministrada)

Nota: las búsquedas web realizadas no devolvieron ningún resultado relacionado con este modelo. Los resultados obtenidos correspondían a una aplicación de duplicación de pantalla y a una serie de televisión, sin relación alguna con el artefacto descrito. No se han localizado por tanto papers, blogs técnicos, repositorios de código ni demos asociados a esta publicación.
