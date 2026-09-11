# mradermacher/Goetia-26B-A4B-v1.5-i1-GGUF

## Resumen

Goetia-26B-A4B-v1.5-i1-GGUF es un paquete de cuantizaciones GGUF generadas por mradermacher a partir del modelo Naphula/Goetia-26B-A4B-v1.5, un modelo de lenguaje orientado a escritura creativa, narrativa de ficción y roleplay. El modelo subyacente es un merge construido con mergekit (etiquetas merge, mergekit y mergekit-exp) sobre una base de la familia Gemma (etiqueta gemma4) con arquitectura de mezcla de expertos, según indica la etiqueta moe_della y el sufijo A4B del nombre. Cuenta con 25.971.339.550 parámetros totales (unos 26B) y soporte multimodal de visión, ya que el autor lo describe explícitamente como vision model y publica los ficheros mmproj en el repositorio de cuantizaciones estáticas.

Este repositorio concreto no contiene pesos entrenados desde cero, sino versiones comprimidas con cuantización por importancia (imatrix), un formato que calibra los errores de cuantización a partir de estadísticas de activación para reducir la pérdida de calidad respecto a las cuantizaciones estáticas. El repositorio incluye únicamente tres cuantizaciones i1 (i1-Q2_K, i1-IQ3_M e i1-Q4_K_S) más el fichero imatrix de calibración, mientras que la serie estática completa está publicada en un repositorio aparte.

Su relevancia es fundamentalmente práctica: permite ejecutar un modelo de 26B especializado en prosa narrativa y roleplay en hardware de consumo mediante llama.cpp u otros runtimes compatibles con GGUF, con licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), resultado de un merge con mergekit sobre base de la familia Gemma (según etiquetas gemma4 y moe_della); detalles de capas, atención y expertos no disponibles |
| Parámetros totales | 25.971.339.550 (≈26B) |
| Parámetros activos | No confirmado en la información disponible; el sufijo A4B del nombre sugiere del orden de 4B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Repositorio i1/imatrix: i1-Q2_K (10,9 GB), i1-IQ3_M (12,8 GB), i1-Q4_K_S (16,0 GB) e imatrix (0,2 GB). Repositorio estático: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, IQ4_XS, Q4_K_S, IQ4_NL (small), Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (eng) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base Naphula/Goetia-26B-A4B-v1.5 |

## Arquitectura y entrenamiento

El modelo base es un merge, no un entrenamiento desde cero. Las etiquetas del repositorio (merge, mergekit, mergekit-exp) indican que Naphula/Goetia-26B-A4B-v1.5 se construyó fusionando pesos de varios modelos con mergekit, una herramienta que combina checkpoints mediante estrategias de interpolación (por ejemplo, SLERP, TIES o DARE). La etiqueta gemma4 apunta a una base de la familia Gemma, y A4B más moe_della indican una arquitectura de mezcla de expertos con un subconjunto reducido de parámetros activos por token. No se dispone de información sobre el número de expertos, el enrutador, el número de capas ni el tipo de atención empleado.

Tampoco hay datos publicados en la información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de ajuste por instrucciones, RLHF o DPO. El proceso aplicado en este repositorio concreto es de cuantización posterior: mradermacher ha generado cuantizaciones ponderadas por matriz de importancia (imatrix) mediante el flujo nicoboss, que usa estadísticas de activación recogidas sobre un corpus de calibración para asignar precisión de forma no uniforme entre tensores. Esto se traduce en una pérdida de perplejidad menor que la de las cuantizaciones estáticas equivalentes en tamaño, especialmente en los niveles bajos (Q2, Q3). El autor advierte, no obstante, que en el nivel i1-Q2_K es probablemente preferible usar IQ3_XXS.

## Capacidades

- Generación de texto narrativo y prosa creativa, con etiquetas explícitas de vivid writing y vivid prosing.
- Escritura de ficción en múltiples géneros: terror, romance, ciencia ficción y lo que el autor etiqueta como all genres.
- Generación de tramas y subtramas (plot generation, sub-plot generation).
- Continuación de escenas (scene continue) manteniendo coherencia con el texto previo.
- Roleplay y conversación de personajes (roleplay, roleplaying, rp, conversational).
- Creación de historias largas y storytelling estructurado.
- Registro lingüístico flexible, incluido lenguaje soez (etiqueta swearing), útil para diálogos realistas.
- Capacidades de visión: el autor indica que el modelo base es multimodal y que los ficheros mmproj se publican en el repositorio estático, aunque este repositorio i1 no los incluye.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language del modelo.

## Casos de uso

- Asistentes de escritura creativa: el modelo puede generar borradores de capítulos, proponer giros argumentales y continuar escenas a partir de un fragmento previo, aprovechando sus etiquetas específicas de story generation y scene continue. Es adecuado porque está especializado en prosa narrativa en lugar de en texto técnico o conversacional genérico.
- Plataformas de roleplay e interacción con personajes: puede mantener diálogos en personaje con registro y tono consistentes, incluyendo lenguaje soez cuando el contexto lo requiere, lo que encaja en aplicaciones de ficción interactiva y chatbots de personajes.
- Generación de tramas y subtramas para guionistas y novelistas: sirve como herramienta de ideación estructurada, produciendo arcos narrativos, conflictos secundarios y líneas argumentales paralelas a partir de una premisa breve.
- Ficción interactiva y motores de aventuras conversacionales: integrado en un bucle de juego, puede generar descripciones de escena, diálogos de PNJ y consecuencias narrativas turno a turno.
- Generación de datos sintéticos para ajuste de modelos narrativos: permite producir corpus de ficción etiquetados por género (terror, romance, ciencia ficción) para entrenar o evaluar otros modelos, con la ventaja de la licencia Apache 2.0.
- Localización creativa y adaptación de textos de ficción al inglés: dado su dominio del inglés narrativo, puede reescribir o adaptar textos manteniendo el tono y el registro del original.
- Prototipado en hardware de consumo: con cuantizaciones desde 10,9 GB, un desarrollador puede desplegar el modelo en una GPU de gama alta o incluso en una estación de trabajo con CPU y RAM suficiente para validar una idea de producto antes de escalar a infraestructura mayor.
- Análisis y anotación de manuscritos: puede resumir tramas, identificar subtramas o generar sinopsis de capítulos largos, útil en flujos editoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas narrativas, y el modelo base tampoco aporta cifras en la información recogida. La única referencia cuantitativa disponible es la tabla de tamaños de las cuantizaciones y la gráfica comparativa de perplejidad de tipos de cuantización enlazada por el autor (ver sección de enlaces), que compara calidad relativa entre formatos de cuantización, no el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): i1-Q4_K_S ≈16,0 GB; i1-IQ3_M ≈12,8 GB; i1-Q2_K ≈10,9 GB. Hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y de si se aplica cuantización de la caché.
- Al ser un modelo MoE de ~26B, es necesario cargar todos los pesos en memoria aunque solo se activen unos pocos miles de millones de parámetros por token; el ahorro del MoE se produce en cómputo, no en memoria.
- GPU de 24 GB (RTX 3090, RTX 4090, A5000, L4 de 24 GB): pueden ejecutar i1-Q4_K_S con contexto moderado, o i1-IQ3_M con más margen para la caché KV.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000): viables con i1-IQ3_M o i1-Q2_K y contexto reducido.
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): solo i1-Q2_K y con contexto muy limitado, o descarga parcial de capas a CPU.
- GPU profesionales (A100 40/80 GB, H100): sin problema para cualquier cuantización, con espacio amplio para contextos largos y lotes grandes.
- Cabe en GPU de consumo: sí, en modelos con al menos 16-24 GB de VRAM usando las cuantizaciones i1 disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Los pesos en safetensors del modelo base permiten vLLM, TGI o transformers, aunque la longitud de contexto y los requisitos exactos de esos runtimes no están documentados en la información disponible.
- Latencia y throughput: no disponibles como medida publicada. Por arquitectura MoE con un subconjunto reducido de parámetros activos, cabe esperar un throughput por token superior al de un modelo denso de 26B en el mismo hardware, pero no hay cifras verificables en la información proporcionada.
- Para uso multimodal hay que descargar los ficheros mmproj desde el repositorio estático, no desde este.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de terceros en la información proporcionada, por lo que no es posible una comparativa de rendimiento fiable. La comparación siguiente se limita a las variantes del mismo modelo, que sí están documentadas:

| Variante | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/Goetia-26B-A4B-v1.5-i1-GGUF (este repositorio) | GGUF con imatrix (i1) | 39,5 GB de repo; i1-Q2_K 10,9 GB, i1-IQ3_M 12,8 GB, i1-Q4_K_S 16,0 GB | Apache 2.0 | Cuantización calibrada por importancia; solo 3 niveles de cuantización más el fichero imatrix |
| mradermacher/Goetia-26B-A4B-v1.5-GGUF | GGUF estático | No disponible | Apache 2.0 | Catálogo completo de cuantizaciones (desde IQ1_S hasta Q6_K) e incluye los ficheros mmproj para visión |
| Naphula/Goetia-26B-A4B-v1.5 | safetensors | 25.971.339.550 parámetros | Apache 2.0 | Modelo base sin cuantizar, para transformers, vLLM o TGI |

Comparativa con modelos de terceros de la misma categoría (tamaño o tarea): no disponible.

## Limitaciones y advertencias

- Es un merge, no un modelo entrenado con un pipeline documentado: no hay información sobre datos de entrenamiento, composición del corpus ni procesos de alineación, lo que dificulta auditar sesgos o comportamientos indeseados.
- Riesgo de alucinación: no hay evaluación publicada de fidelidad factual, y un modelo orientado a ficción puede generar afirmaciones inventadas con naturalidad si se usa fuera de su dominio previsto.
- Sesgos conocidos: no disponibles. Al ser un merge de modelos de la familia Gemma sin documentación de datos, los sesgos heredados de las bases no están caracterizados.
- Idioma: el campo language declara únicamente inglés. No hay evidencia de soporte multilingüe y es previsible un rendimiento degradado en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede asumir una ventana larga; hay que probarla empíricamente antes de diseñar flujos que dependan de contexto extenso.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar igualmente las licencias de los modelos fusionados en el merge, que no se detallan en la información disponible.
- Contenido sensible: las etiquetas incluyen swearing y temáticas de terror. Sin un filtrado adicional, el modelo puede producir lenguaje soez o contenido adulto o violento, lo que exige moderación si se expone a usuarios finales.
- Cuantizaciones de muy baja precisión: el propio autor desaconseja i1-Q2_K y sugiere IQ3_XXS en su lugar, lo que implica que los niveles más comprimidos degradan la calidad de forma apreciable.
- Vision: este repositorio no incluye los ficheros mmproj, por lo que las capacidades multimodales no están disponibles aquí sin descargarlos del repositorio estático.
- Fechas del repositorio: la información lista fechas de creación y actualización de 2026-09-11, posteriores a la fecha de esta ficha; conviene verificar su vigencia antes de citarlas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.5-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.5
- Cuantizaciones estáticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.5-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Goetia-26B-A4B-v1.5-i1-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH, empresa que cede la infraestructura: https://www.nethype.de/
- Búsqueda web adicional: los resultados obtenidos consisten íntegramente en consultas de marcador de posición sin relación con el modelo, por lo que no aportan enlaces válidos sobre papers, blogs o demos.
