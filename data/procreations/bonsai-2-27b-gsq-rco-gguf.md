# ProCreations/bonsai-2-27b-gsq-rco-gguf

## Resumen

Bonsai 2 27B — GSQ + RCO es un experimento independiente de cuantización ternaria publicado por el usuario ProCreations sobre el modelo Bonsai 2 27B de Prism (a su vez derivado de Qwen3.8-27B). El autor aplica GSQ (gradient-based scalar quantization) sobre las 402 matrices ternarias del modelo base (64 bloques transformer, más embedding y cabeza de salida) y un procedimiento RCO (rate-constrained optimization) con un pulido discreto final de la asignación de bits. El resultado es un fichero GGUF de 6.496.332.448 bytes (6,496 GB) cuyo formato dominante es el PTQ1_0 propietario de Prism con tamaño de grupo 128, complementado con matrices completas en Q4_0 seleccionadas por el optimizador bajo un presupuesto estricto de bytes.

El modelo conserva los 26.895.998.464 parámetros (≈26,9 B) del modelo base y no reduce el número de parámetros, sino la precisión de representación, con el objetivo de mantener una huella de disco inferior a 6,5 GB sin recurrir a cuantizaciones de 4 bits uniformes. La relevancia de esta publicación es doble: por un lado, explora si una optimización de asignación de bits basada en pérdida de tarea puede mejorar una cuantización ternaria ya existente; por otro, documenta con transparencia un resultado negativo parcial, ya que las 768 actualizaciones de gradiente de RCO volvieron a seleccionar la asignación original y solo el pulido discreto posterior introdujo cambios.

Las mediciones publicadas muestran una reducción del 5,84 % en perplejidad sobre WikiText-2 respecto al Bonsai original (8,1627 frente a 8,6690), pero cambios de exactitud mixtos y de magnitud muy pequeña: la media no ponderada de cuatro tareas es +0,13 puntos porcentuales y los cuatro intervalos bootstrap pareados incluyen el cero. El propio autor advierte de que el experimento no establece una mejora estadísticamente clara ni equivalencia con el modelo BF16 de partida. Se trata de un artefacto experimental, no de una versión oficial de Prism, Qwen o ISTA-DASLab, y con 0 descargas y 1 like en el momento de redactar esta ficha carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 64 bloques, según la model card; pesos ternarios con rotaciones Hadamard y metadatos de rotación y parámetros no ternarios (normalización y "recurrent") heredados del modelo base |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario de Prism con group size 128 (formato dominante); Q4_0 en matrices completas seleccionadas por RCO; pesos F16 muestreados del profesor durante el proceso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; fichero final de 6.496.332.448 bytes (6,496 GB) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf y Qwen/Qwen3.8-27B |
| Profesor de destilación/cuantización | Qwen3.8-27B en BF16 |
| Tamaño del repositorio | 6,5 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 1 |
| Fecha de publicación | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El punto de partida es un transformer de 64 bloques con pesos ya ternarios (Bonsai 2 27B de Prism). Sobre esa base, GSQ optimiza las 402 matrices ternarias originales al completo, incluyendo todas las filas del embedding y de la cabeza de salida, sin sustituir ninguna capa por versiones sin procesar. Las variantes Q4 correspondientes también reciben optimización GSQ. El profesor utilizado es Qwen3.8-27B en BF16, pero dado que los pesos F16 muestreados de Bonsai ya eran exactamente ternarios, la reconstrucción contra sí mismos no recuperaría la precisión perdida; por ello la optimización ternaria parte de los códigos de Bonsai y la Q4 parte de pesos de Qwen rotados y redondeados al vecino más próximo. Se conservan los parámetros no ternarios de normalización y "recurrent" del modelo original, así como los metadatos de rotación.

El procedimiento de GSQ por bloque emplea 1.024 documentos disjuntos de FineWeb-Edu de 2.048 tokens, 64 documentos de validación reservados, 10 épocas, batch efectivo 32, logits y escalas de Gumbel en FP32, cómputo en BF16, optimizador Lion, temperatura de 2→0,05 y multiplicador de logits de 100→500. Todas las matrices de atención y MLP elegibles se entrenan conjuntamente dentro de cada bloque y las salidas duras elegidas se propagan a los bloques siguientes. La implementación usa kernels Triton fusionados para los cuantizadores de Gumbel, los gradientes, la deconvolución, las rotaciones de Hadamard y las actualizaciones del optimizador. Embedding y cabeza se optimizan por filas en fragmentos de 2.048 filas durante 256 pasos cada uno. El autor advierte de que "cobertura completa" describe la optimización realizada, no la garantía de que cada código seleccionado cambie.

La fase RCO ejecuta 768 actualizaciones de asignación de entropía cruzada de extremo a extremo con proyección tangente, retracción y transporte del vector del optimizador, muestreo Gumbel con straight-through y redondeo exacto mediante mochila (knapsack) de elección múltiple bajo un presupuesto de bytes. Usa 128 documentos de calibración y 64 de selección, y reranquea los cuatro mejores checkpoints de la búsqueda inicial. El resultado clave es que tanto la búsqueda inicial de 256 actualizaciones como el refinamiento posterior de 512 (con preferencia +1 por la opción original, Adam con LR 0,025 y temperatura 0,8→0,05) volvieron a seleccionar la asignación original. Solo un pulido discreto documentado aparte, que midió 804 alternativas de matriz única sobre 16 documentos de calibración y evaluó una propuesta exacta de mochila aditiva más hasta 128 propuestas greedy sobre 32 documentos distintos, introdujo los cambios publicados, aceptando únicamente reducciones de pérdida medidas.

## Capacidades

- Generación de texto conversacional: la etiqueta del repositorio incluye "conversational" y el pipeline es text-generation, por lo que el uso previsto es la generación de texto de propósito general.
- Razonamiento y conocimiento general medidos de forma indirecta mediante tareas de elección múltiple (ARC-C, ARC-E, HellaSwag, Winogrande) en un arnés de verosimilitud de continuación zero-shot, sin plantilla de chat ni razonamiento generado.
- Modelado de lenguaje medido mediante perplejidad en WikiText-2 (contexto 2048, herramienta nativa de perplejidad).
- Compatibilidad declarada con endpoints (etiqueta "endpoints_compatible" en el repositorio).
- Capacidades multilingües: no disponibles (no se listan idiomas soportados).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explícito: no documentado; el autor indica explícitamente que sus cifras no deben compararse con resultados de leaderboards en modo pensamiento.
- Capacidades de visión o audio: no documentadas.

## Casos de uso

- Inferencia local en GPU de consumo: con un fichero de 6,5 GB, el modelo puede cargarse en GPUs de gama media con 12-16 GB de VRAM (por ejemplo RTX 3060 12 GB o 4060 Ti 16 GB), lo que permite disponer de un modelo de ~27 B en hardware de escritorio sin recurrir a cuantizaciones de 4 bits convencionales.
- Despliegue on-premise con requisitos de privacidad: al ser un GGUF ejecutable en local, encaja en entornos donde los datos no pueden salir de la infraestructura (sanidad, legal, banca), siempre que se verifique antes la compatibilidad del runtime con el formato PTQ1_0 de Prism.
- Investigación en cuantización ternaria: es un caso de estudio reproducible para evaluar GSQ y RCO, ya que la model card documenta hiperparámetros, tamaños de calibración, número de actualizaciones y resultados negativos de la búsqueda de asignación.
- Reproducción y auditoría de arneses de evaluación: el autor publica puntuaciones crudas y normalizadas, revisiones de dataset e intervalos bootstrap pareados de 5.000 remuestreos, material útil para comparar arneses de verosimilitud de continuación.
- Generación de texto por lotes en pipelines offline: resumen, etiquetado, clasificación temática o extracción de entidades sobre grandes volúmenes de documentos, donde el coste por token y la huella de disco importan más que la latencia interactiva.
- Asistentes conversacionales de bajo coste: el tamaño reducido del fichero permite levantar varias instancias o réplicas en un único nodo con varias GPUs, útil para absorber picos de tráfico en servicios de chat.
- Docencia y experimentación académica: al caber en una sola GPU de laboratorio, permite trabajar con técnicas de cuantización moderna (Gumbel softmax, Hadamard, mochila exacta) sin acceso a clústeres de gran escala.

## Benchmarks y rendimiento

Datos publicados por el autor. Las columnas de exactitud son porcentajes; en perplejidad, menos es mejor. Todas las comparaciones GGUF usan el mismo runtime nativo fijado, ejemplos, prompts y sistema de puntuación.

| Modelo | WikiText-2 PPL | ARC-C | ARC-E | HellaSwag | Winogrande |
|---|---:|---:|---:|---:|---:|
| Bonsai original PTQ1_0 | 8,6690 | 61,01 | 79,76 | 77,65 | 73,80 |
| Bonsai GSQ + RCO | 8,1627 | 60,67 | 80,13 | 77,80 | 74,11 |
| Qwen3.8 original BF16 | 6,5137 | 59,30 | 74,92 | 82,15 | 75,14 |

Cambios de exactitud frente al Bonsai original, con intervalos bootstrap pareados al 95 %:

| Tarea | Cambio (pp) | Intervalo 95 % |
|---|---:|---:|
| arc_challenge | -0,34 | [-1,79, +1,11] |
| arc_easy | +0,38 | [-0,51, +1,26] |
| hellaswag | +0,15 | [-0,55, +0,85] |
| winogrande | +0,32 | [-1,10, +1,74] |

Detalles del protocolo: WikiText-2 usa el split de test en crudo con contexto 2048; ARC-C usa 1.172 ejemplos; ARC-E, 2.376; HellaSwag, 2.000 ejemplos de validación aleatorios fijos; Winogrande, 1.267 ejemplos de validación. Es un arnés propio de verosimilitud de continuación zero-shot sin plantilla de chat ni razonamiento generado; ARC y HellaSwag usan verosimilitud normalizada por caracteres y Winogrande puntúa el sufijo tras colocar cada candidato en contexto. La reducción de perplejidad es de 0,5063 puntos y del 5,84 % respecto al Bonsai original; la media no ponderada de los cuatro cambios de exactitud es de +0,13 puntos porcentuales. Los cuatro intervalos incluyen el cero y el autor indica que no se establece una mejora de exactitud estadísticamente clara.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 6,496 GB en disco; se puede estimar un consumo de VRAM en el rango de 8-10 GB incluyendo runtime y caché KV a contexto moderado. Esta cifra es una estimación derivada del tamaño del fichero, no un dato publicado por el autor.
- GPU recomendadas: por tamaño, cualquier GPU con 12 GB o más de VRAM puede alojar los pesos; para servicio con concurrencia y contexto largo son preferibles A100 (40/80 GB) o H100. El autor no publica recomendaciones de hardware.
- GPU de consumo: sí cabe, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090, así como en Apple Silicon con memoria unificada suficiente. Requiere verificación práctica por la naturaleza no estándar del formato.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, llama.cpp server) son las vías naturales para GGUF, pero la model card indica explícitamente que el formato dominante es el PTQ1_0 de Prism con group size 128 y que el TQ1_0 estándar es un formato distinto, por lo que la compatibilidad con runtimes genéricos no está garantizada. El autor emplea un "runtime nativo fijado". No se documenta soporte para vLLM, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ProCreations/bonsai-2-27b-gsq-rco-gguf | ≈26,9 B | no disponible | GGUF (PTQ1_0 + Q4_0 selectivo), 6,496 GB | 8,1627 | apache-2.0 | Repositorio público, 0 descargas, 1 like |
| prism-ml/Ternary-Bonsai-2-27B-gguf (original) | ≈26,9 B | no disponible | GGUF ternario PTQ1_0 | 8,6690 | no disponible en la información facilitada | Repositorio público |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (referencia) | no disponible | no disponible | GGUF | no disponible | no disponible | Repositorio público |
| Qwen/Qwen3.8-27B (BF16) | ≈26,9 B (según el modelo derivado) | no disponible | safetensors BF16 | 6,5137 | no disponible en la información facilitada | Repositorio público |

Nota: los datos de parámetros y contexto de los modelos comparados no se detallan en la información proporcionada, salvo la correspondencia de tamaño derivada del modelo base. El autor advierte de que este experimento no reproduce la receta ni el protocolo del modelo de referencia de ISTA-DASLab, por lo que la comparación directa entre ambos no es válida.

## Limitaciones y advertencias

- Evidencia de mejora limitada: los cambios de exactitud en las cuatro tareas evaluadas son mixtos y pequeños (media +0,13 pp), y los cuatro intervalos bootstrap pareados incluyen el cero. El autor afirma explícitamente que el experimento no establece una mejora de exactitud estadísticamente clara.
- Brecha frente al modelo base BF16: la perplejidad en WikiText-2 es 8,1627 frente a 6,5137 del Qwen3.8 BF16, es decir, sigue habiendo una pérdida sustancial de precisión respecto al modelo sin cuantizar.
- Comparabilidad de benchmarks: las cifras provienen de un arnés propio de verosimilitud de continuación zero-shot, sin plantilla de chat ni razonamiento generado. El autor pide no compararlas con arneses no relacionados ni con resultados de leaderboards en modo pensamiento.
- Habilitación de razonamiento no evaluada: no se miden calidad de razonamiento, fidelidad de instrucciones ni comportamiento conversacional real, pese a la etiqueta "conversational".
- Compatibilidad de runtime: el formato dominante es un PTQ1_0 de Prism con group size 128, distinto del TQ1_0 estándar. La carga en runtimes GGUF genéricos debe validarse caso por caso; el propio autor usa un runtime nativo fijado.
- Idiomas: no se declara ninguna lista de idiomas soportados, lo que impide garantizar comportamiento multilingüe.
- Contexto: la longitud de contexto del modelo no se documenta en la información disponible.
- Licencia: el repositorio se publica bajo apache-2.0, lo que en principio permite uso comercial, pero los modelos base (Prism Bonsai y Qwen3.8-27B) tienen sus propias condiciones; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Origen no oficial: es un experimento independiente y no una publicación de Prism, Qwen ni ISTA-DASLab.
- Adopción nula: 0 descargas y 1 like, sin validación independiente de la comunidad ni evaluación de terceros.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al tratarse de un modelo cuantizado de forma agresiva, la degradación en tareas de conocimiento abierto puede ser mayor que la observada en las tareas de elección múltiple evaluadas.
- Documentación incompleta: la model card disponible está truncada al final de la sección de entrenamiento y asignación de bits, por lo que parte del protocolo final de pulido no se detalla por completo.
- Arquitectura: la model card menciona parámetros "recurrent" no ternarios heredados del modelo base, pero no describe la arquitectura completa; no debe asumirse que sea un transformer estándar sin verificación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ProCreations/bonsai-2-27b-gsq-rco-gguf
- Modelo base ternario (Prism): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de referencia GSQ/RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio GSQ: https://github.com/IST-DASLab/GSQ
- Repositorio RCO: https://github.com/IST-DASLab/RCO

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los resultados obtenidos corresponden a páginas de videojuegos sin relación con el tema.
