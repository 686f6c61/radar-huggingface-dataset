# mradermacher/OneJev-4B-GGUF

## Resumen

OneJev-4B-GGUF es la recopilación de cuantizaciones en formato GGUF del modelo OmniJev/OneJev-4B, publicada por el usuario mradermacher (nethype GmbH), especializado en convertir pesos de modelos abiertos a formatos ejecutables en llama.cpp. El repositorio contiene 13 cuantizaciones del modelo principal (desde Q2_K hasta f16) más dos ficheros auxiliares `mmproj` para el codificador multimodal, lo que permite ejecutar el modelo tanto en CPU como en GPU de gama consumer.

El modelo base cuenta con 4.841.450.496 parámetros (aproximadamente 4,84 mil millones), según los pesos reales en safetensors, y se distribuye bajo licencia Apache 2.0. Los tags del repositorio lo etiquetan como `onejev`, `system-one`, `decision-model`, `calibration`, `multimodal`, `gui-agent` y `video`, lo que apunta a un modelo orientado a toma de decisiones con calibración, interacción con interfaces gráficas y entrada de vídeo, aunque la model card del repositorio de cuantización no desarrolla estos extremos.

La relevancia de esta publicación es práctica: el repositorio original está en formato transformers (safetensors) y esta versión GGUF es la vía habitual para desplegar el modelo en llama.cpp, Ollama o LM Studio. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que se trata de una conversión reciente (creada el 27 de septiembre de 2026) sin validación comunitaria todavía. El idioma declarado es únicamente inglés (`en`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card del repositorio GGUF) |
| Parametros totales | 4.841.450.496 (~4,84 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, además de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base OmniJev/OneJev-4B está en safetensors para transformers |
| Modelo base | OmniJev/OneJev-4B |
| Metodo de cuantizacion | estática, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Tamano total del repositorio | 45,4 GB |

## Arquitectura y entrenamiento

La model card del repositorio no proporciona información sobre la arquitectura del modelo base (transformer denso, MoE, híbrido u otro), ni sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal, etc.). Toda esta información debe considerarse **no disponible** en la documentación consultada.

Lo único verificable es el proceso de conversión y cuantización aplicado por mradermacher: conversión desde pesos en formato HuggingFace (`convert_type: hf`), cuantización estática con la versión 2 del pipeline y cuantización de los tensores de salida (`output_tensor_quantised: 1`). No se han generado cuantizaciones ponderadas con imatrix, tal y como indica el propio autor, que deja abierta la posibilidad de añadirlas si hay demanda en la sección de discusiones. La presencia de ficheros `mmproj` confirma que el modelo incorpora un proyector multimodal, coherente con los tags `multimodal` y `video`.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (tag `conversational`).
- Procesamiento multimodal: los ficheros `mmproj` indican soporte de entradas de imagen y, según el tag `video`, potencialmente también de vídeo, aunque no se detalla el alcance exacto.
- Modelo orientado a decisión (`decision-model`) y calibración (`calibration`), según los tags del repositorio; se desconoce el mecanismo concreto ni si expone puntuaciones de confianza.
- Agente de interfaz gráfica (`gui-agent`): el etiquetado sugiere capacidad de operar sobre GUIs, aunque no se documenta el formato de acciones ni el conjunto de herramientas soportado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (más allá del tag `system-one`, cuyo significado no se explica).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Agente de automatización de escritorio: dado el tag `gui-agent`, el modelo puede emplearse para interpretar capturas de pantalla y decidir la siguiente acción sobre una interfaz; la cuantización Q4_K_M (3,2 GB) permite ejecutarlo en una estación de trabajo con GPU consumer mientras se mantiene una latencia interactiva.
- Análisis de vídeo con descripción en lenguaje natural: los ficheros `mmproj-Q8_0` (0,5 GB) y `mmproj-f16` (0,8 GB) habilitan el codificador multimodal; combinado con el modelo principal, puede resumir o etiquetar secuencias de vídeo en pipelines de catalogación de contenido.
- Moderación y clasificación con umbral de confianza: el tag `calibration` sugiere que el modelo está pensado para producir decisiones calibradas, útil en sistemas de triaje donde se necesita un umbral de confianza explícito antes de escalar a revisión humana.
- Prototipado rápido en local: con Q2_K (2,2 GB) o Q3_K_S (2,4 GB) el modelo cabe en portátiles sin GPU dedicada mediante llama.cpp u Ollama, lo que sirve para validar la viabilidad de un producto antes de invertir en infraestructura.
- Investigación en agentes multimodales: al ser un modelo de 4,84B parámetros con licencia Apache 2.0, es un candidato razonable para experimentos académicos de decisión secuencial sobre entornos gráficos, donde el coste de inferencia y la reproducibilidad importan más que el rendimiento absoluto.
- Integración en pipelines de automatización de tareas repetitivas de ofimática: el modelo puede conectarse a herramientas de control de ventanas para completar formularios o navegar por menús, ejecutándose en la misma máquina que la aplicación objetivo gracias a su reducido tamaño en cuantizaciones Q4.
- Despliegue en edge para asistencia visual: con Q4_K_S (3,0 GB) más el proyector mmproj, el conjunto es viable en dispositivos con 6-8 GB de VRAM, útil para asistentes embebidos que describen lo que ve una cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MMBench ni métricas equivalentes, ni para el modelo cuantizado ni para el modelo base OmniJev/OneJev-4B.

El único dato de rendimiento indirecto es la tabla de tamaños de fichero por tipo de cuantización, que determina el consumo de memoria pero no la calidad resultante:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 2,2 | - |
| Q3_K_S | 2,4 | - |
| Q3_K_M | 2,6 | calidad inferior |
| Q3_K_L | 2,8 | - |
| IQ4_XS | 3,0 | - |
| Q4_K_S | 3,0 | rápido, recomendado |
| Q4_K_M | 3,2 | rápido, recomendado |
| Q5_K_S | 3,5 | - |
| Q5_K_M | 3,6 | - |
| Q6_K | 4,1 | muy buena calidad |
| Q8_0 | 5,3 | rápido, mejor calidad |
| f16 | 9,8 | 16 bpw, excesivo |
| mmproj-Q8_0 | 0,5 | suplemento multimodal |
| mmproj-f16 | 0,8 | suplemento multimodal |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más el coste del contexto (KV cache). Con Q4_K_M (3,2 GB) el consumo realista se sitúa en torno a 4-5 GB; con Q8_0 (5,3 GB) en torno a 6-7 GB; con f16 (9,8 GB) en torno a 11-12 GB. Estas cifras son estimaciones derivadas de los tamaños de fichero publicados, no medidas oficiales.
- Si se usa la funcionalidad multimodal hay que sumar el proyector: 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16).
- GPU recomendadas: no disponibles en la documentación. Por tamaño, el modelo es apto para GPUs consumer; una RTX 3060 de 12 GB, una RTX 4070/4080 o una RTX 4090 pueden alojar cualquier cuantización hasta Q8_0, y las de 8 GB cubren con holgura Q4_K_M y Q5_K_M. Para f16 conviene una GPU de 16 GB o superior.
- Cabe en GPU consumer: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB o más. Q2_K y Q3_K_S permiten incluso ejecución parcial o total en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es experimental y condicionado; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de terceros comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La única comparación verificable es entre el repositorio cuantizado y su modelo origen:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/OneJev-4B-GGUF | 4,84B | no disponible | GGUF (12 cuantizaciones + 2 mmproj) | apache-2.0 | HuggingFace, 0 descargas |
| OmniJev/OneJev-4B (base) | 4,84B | no disponible | safetensors / transformers | apache-2.0 | HuggingFace (modelo de origen) |

Comparativas con alternativas de terceros (otras familias de 4B densos o modelos de agente GUI de tamaño similar): no disponibles, al no haberse proporcionado datos de benchmarks ni especificaciones de esos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita evaluar la calidad real del modelo, ni en su versión original ni en las cuantizadas.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, creado el 27 de septiembre de 2026 y actualizado un día después. No hay evidencia de que las cuantizaciones hayan sido probadas por terceros.
- Idioma limitado al inglés: el campo `language` declara únicamente `en`, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto desconocida: al no publicarse, no se puede garantizar el comportamiento en conversaciones largas ni dimensionar correctamente la KV cache.
- Pérdida de calidad por cuantización: las versiones Q2_K y Q3_K degradan la calidad de forma notable (el propio autor marca Q3_K_M como "lower quality"). Para producción se recomienda Q5_K_M o superior, lo que incrementa el consumo de memoria.
- No hay cuantizaciones ponderadas (imatrix): el autor indica que no las ha generado y que probablemente no las planee salvo petición explícita, lo que implica una pérdida de calidad algo mayor que en cuantizaciones ponderadas equivalentes.
- Riesgo de alucinación: no se documenta ningún proceso de alineación (RLHF/DPO) ni evaluación de veracidad, por lo que el riesgo es indeterminado. En un modelo etiquetado como `decision-model` esto es especialmente relevante si se usa para tomar decisiones automatizadas.
- Multimodalidad dependiente del proyector: sin cargar el fichero `mmproj` correspondiente, las capacidades de imagen y vídeo no estarán disponibles; además, el tipo de cuantización del proyector debe elegirse de forma coherente con el del modelo.
- Licencia permisiva pero sin garantías: Apache 2.0 permite uso comercial y modificación, pero se distribuye "tal cual", sin garantía de idoneidad ni de no infracción.
- Comportamiento de agente GUI no especificado: se desconoce el formato de acciones, el vocabulario de herramientas y el protocolo esperado, lo que obliga a ingeniería inversa o a consultar la documentación del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/OneJev-4B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev-4B
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#OneJev-4B-GGUF
- Peticiones de cuantización y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Ejemplo de README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del cuantizador: https://www.nethype.de/
