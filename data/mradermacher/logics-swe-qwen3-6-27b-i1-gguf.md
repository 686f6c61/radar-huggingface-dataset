# mradermacher/Logics-SWE-Qwen3.6-27B-i1-GGUF

## Resumen

Logics-SWE-Qwen3.6-27B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Logics-MLLM/Logics-SWE-Qwen3.6-27B, un modelo de 26.895.998.464 parámetros (≈26,9 B, comercializado como 27B) especializado en ingeniería de software y flujos agénticos. La cuantización la firma mradermacher, un autor de referencia en el ecosistema GGUF, y emplea el método i1 con fichero imatrix (importance matrix) derivado del propio modelo, lo que en teoría preserva mejor la calidad que las cuantizaciones estáticas en el mismo rango de bits.

El modelo base ha sido sometido a post-entrenamiento agéntico para tareas de software: según sus etiquetas, combina destilación on-policy, aprendizaje por refuerzo y post-entrenamiento orientado a agentes, usando el dataset Logics-MLLM/Logics-SWE-Env-2.5K (2.500 ejemplos de entorno de ingeniería de software). Esto lo sitúa en la categoría de modelos pequeños/medianos pensados para ejecutarse en local y resolver tareas de reparación de código, uso de herramientas y razonamiento multi-paso sobre repositorios, en lugar de ser un modelo de propósito general.

Su relevancia práctica es doble: por un lado, ofrece un conjunto de 24 cuantizaciones que van desde 7,2 GB (i1-IQ1_S) hasta 22,2 GB (i1-Q6_K), lo que permite desplegarlo desde portátiles con poca VRAM hasta estaciones de trabajo con una sola GPU de 24 GB; por otro, la licencia Apache 2.0 elimina fricciones para uso comercial. La documentación publicada es, sin embargo, muy escasa en lo técnico: no se detallan longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, y el modelo declara únicamente inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre indica base Qwen3.6; la model card no documenta la arquitectura) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (además de fichero imatrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); los pesos originales del modelo base se distribuyen en safetensors |
| Fecha de publicación | 21 de octubre de 2026 |
| Dataset de entrenamiento declarado | Logics-MLLM/Logics-SWE-Env-2.5K |
| Modelo base | Logics-MLLM/Logics-SWE-Qwen3.6-27B |
| Tamaño del repositorio | 300,3 GB (todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. El identificador del modelo base (Qwen3.6-27B) sugiere una familia transformer de tipo decoder-only, pero la model card del repositorio cuantizado no incluye ninguna descripción de capas, atención, número de cabezas ni configuración de tokenizador. Tampoco se documenta la longitud de contexto nativa ni si emplea atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

En cuanto al entrenamiento, las etiquetas del repositorio indican un pipeline de post-entrenamiento en tres frentes: destilación on-policy, aprendizaje por refuerzo y post-entrenamiento agéntico, apoyados en el dataset Logics-SWE-Env-2.5K, que por su nombre contiene aproximadamente 2.500 muestras de entorno de ingeniería de software. No se especifica el número total de tokens de entrenamiento, la composición del corpus, si hubo fases de SFT/DPO/RLHF separadas ni los hiperparámetros del proceso de RL. La model card del cuantizador tampoco aporta detalles: se limita a indicar que se trata de cuantizaciones ponderadas con imatrix del modelo original.

Una nota técnica relevante: el README del cuantizador afirma literalmente que «this is a vision model» y remite los ficheros `mmproj` (proyector multimodal) al repositorio de cuantizaciones estáticas. Sin embargo, las etiquetas del repositorio no incluyen `vision` ni `multimodal`, el pipeline declarado es `reinforcement-learning` y el idioma es únicamente inglés. Esta contradicción debe tratarse como una advertencia: no hay confirmación de capacidades de visión en la información disponible.

## Capacidades

- Generación de código y parches: el modelo está entrenado específicamente para tareas de ingeniería de software, incluyendo escritura y modificación de código en el contexto de un repositorio.
- Razonamiento agéntico multi-paso: el post-entrenamiento declarado (`agentic-post-training`) apunta a que puede operar en bucles de acción-observación propios de agentes SWE.
- Uso de herramientas: las etiquetas de modelos agénticos y el dataset de entorno sugieren soporte de llamadas a herramientas (shell, editores, tests), aunque la model card no documenta el formato exacto de tool calling ni el esquema de mensajes.
- Razonamiento y matemáticas: no hay datos específicos publicados; se desconoce el rendimiento en tareas de razonamiento general.
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio; no se declara soporte de castellano.
- Capacidad de visión: ambigua. El README del cuantizador menciona que es un modelo de visión, pero los metadatos no lo confirman y los ficheros `mmproj` no están en este repositorio.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.
- Ejecución local: al distribuirse en GGUF con cuantizaciones desde 7,2 GB, es apto para inferencia en CPU y GPU de consumo mediante llama.cpp y derivados.

## Casos de uso

- Agente de resolución de incidencias sobre repositorios: el modelo puede recibir un issue, inspeccionar ficheros relevantes mediante llamadas a herramientas y proponer un parche; su entrenamiento específico en entornos SWE lo hace más adecuado que un modelo general del mismo tamaño para este bucle.
- Generación de parches en pipelines de CI/CD: integrado como paso previo a la revisión humana, puede generar diffs automáticos para fallos de tests o linters, con la ventaja de que la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Revisión de código automatizada: análisis de pull requests para detectar errores lógicos, malas prácticas o falta de cobertura, ejecutable en local para no enviar código propietario a APIs externas.
- Refactorización asistida a nivel de módulo: al estar orientado a ingeniería de software, puede reescribir funciones o adaptar interfaces manteniendo coherencia con el resto del repositorio, siempre que la ventana de contexto (no documentada) sea suficiente.
- Generación de tests unitarios: a partir de una función o de un diff, producir casos de prueba ejecutables; encaja en flujos donde el coste por token importa y se prefiere inferencia local.
- Asistente de desarrollo offline en estación de trabajo: con la cuantización i1-Q4_K_M (16,6 GB) cabe en una GPU de 24 GB y permite autocompletado y chat sobre código sin conexión, útil en entornos con requisitos de confidencialidad.
- Automatización de triaje de bugs: clasificación y resumen de issues entrantes, agrupación por causa raíz y propuesta de etiquetas, aprovechando el formato conversacional del modelo.
- Documentación técnica derivada de código: generación de docstrings y documentación de API a partir del código fuente, en inglés, que es el único idioma declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluación. Tampoco se aportan métricas de perplejidad comparando las cuantizaciones i1 con las estáticas, más allá de la referencia genérica del autor a una gráfica externa de comparación de tipos de cuantización.

## Requisitos de hardware

Estimación de VRAM calculada a partir del tamaño del fichero GGUF más 1,5–3 GB de sobrecarga (KV cache, buffers de contexto y overhead del runtime). Los valores son aproximados y dependen de la longitud de contexto efectiva, que no está documentada.

| Cuantización | Tamaño del fichero | VRAM estimada | ¿Cabe en GPU de consumo? |
|---|---|---|---|
| i1-IQ1_S | 7,2 GB | ~9–10 GB | Sí, RTX 3060 12 GB / RTX 4070 |
| i1-IQ2_M | 10,1 GB | ~12–13 GB | Sí, RTX 3060 12 GB (ajustado) / RTX 4070 Ti 16 GB |
| i1-IQ3_M | 12,7 GB | ~15–16 GB | Sí, RTX 4060 Ti 16 GB / RTX 4080 |
| i1-IQ4_XS | 15,2 GB | ~17–18 GB | Sí, RTX 4080 16 GB (ajustado) / RTX 4090 |
| i1-Q4_K_M | 16,6 GB | ~19–20 GB | Sí, RTX 3090 / RTX 4090 (24 GB) |
| i1-Q5_K_M | 19,3 GB | ~22–23 GB | Sí, RTX 3090 / RTX 4090, con poco margen |
| i1-Q6_K | 22,2 GB | ~25–26 GB | Ajustado en 24 GB; requiere GPU de 32 GB o superior |

- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB, H100 o L40S 48 GB para Q6_K con contexto largo o para servir varias instancias.
- GPU de consumo: sí es viable. Con 8–12 GB se puede usar IQ1/IQ2 (con pérdida de calidad notable); con 16 GB, IQ3_M o IQ4_XS; con 24 GB, Q4_K_M y Q5_K_M son el punto dulce.
- CPU: las cuantizaciones IQ2_M–Q4_K_M pueden ejecutarse en CPU con 16–32 GB de RAM, con throughput bajo (adecuado para uso interactivo, no para servir a varios usuarios).
- Despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp, llama-cpp-python. Para vLLM o TGI conviene usar el modelo base en safetensors, ya que el soporte de GGUF en esos servidores es limitado o experimental. Las cuantizaciones i1 requieren una versión reciente de llama.cpp que soporte el formato i-quant.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda realizada. La comparación siguiente se limita a las variantes del mismo modelo base, que son las únicas con datos verificables:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Logics-SWE-Qwen3.6-27B-i1-GGUF (este) | 26,9 B | No disponible | GGUF i1/imatrix | Apache 2.0 | 24 cuantizaciones; requiere llama.cpp reciente |
| Logics-SWE-Qwen3.6-27B-GGUF (cuantizaciones estáticas) | 26,9 B | No disponible | GGUF estático | Apache 2.0 | Incluye ficheros `mmproj` si existen; compatible con más versiones de llama.cpp |
| Logics-SWE-Qwen3.6-27B (modelo base) | 26,9 B | No disponible | Safetensors | Apache 2.0 | Pesos completos; necesario para vLLM/TGI y para fine-tuning |

Como referencia de categoría (modelos de ~27–32 B orientados a código, con licencia permisiva), los candidatos habituales serían la familia Qwen3-Coder y modelos tipo DeepSeek-Coder de tamaño similar, pero no se han proporcionado datos de parámetros, contexto ni benchmarks de esos modelos en la información disponible, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés. El rendimiento en castellano es desconocido y probablemente degradado; no debe asumirse paridad con modelos multilingües.
- Ausencia total de benchmarks: no hay evidencia pública de rendimiento en SWE-bench, HumanEval ni tareas agénticas, por lo que cualquier afirmación sobre su calidad relativa es especulativa.
- Contexto desconocido: se desconoce la ventana nativa. Para tareas sobre repositorios grandes esto es un riesgo serio, ya que el modelo puede truncar contexto sin que el desarrollador lo sepa.
- Dataset de entrenamiento muy pequeño: 2.500 muestras de entorno sugieren un post-entrenamiento ligero; es esperable un sobreajuste al formato de esas tareas y poca generalización fuera de él.
- Riesgo de alucinación: como cualquier modelo de código, puede inventar APIs, funciones o rutas de fichero inexistentes. En flujos agénticos esto se traduce en parches que no compilan o tests que no existen; es imprescindible validar con ejecución real.
- Ambigüedad sobre capacidades de visión: el README del cuantizador afirma que es un modelo de visión, pero los metadatos no lo respaldan y los ficheros `mmproj` no están en este repositorio. No planificar despliegues multimodales sobre esta base sin verificar el repositorio estático.
- Calidad de las cuantizaciones bajas: el propio autor etiqueta IQ1_S como «for the desperate», IQ1_M como «mostly desperate» y Q2_K_S como «very low quality». Por debajo de IQ3 el modelo no es recomendable para uso en producción.
- Dependencia de versión: las cuantizaciones i1 requieren builds recientes de llama.cpp; versiones antiguas pueden fallar o producir salidas incoherentes. Las estáticas son más portables.
- Licencia: Apache 2.0 permite uso comercial y modificación sin restricciones de atribución más allá del aviso de copyright, pero no exime de cumplir las obligaciones de la licencia del modelo base (que aquí coincide) ni de las responsabilidades sobre el código generado.
- Sin información sobre alineación o seguridad: no se documentan fases de RLHF orientadas a rechazo de contenido dañino; no debe confiarse en el modelo como filtro de seguridad.
- Cero descargas y un único «like» en el momento de la consulta: el artefacto es muy reciente y carece de validación comunitaria.

## Enlaces

- Repositorio HuggingFace (esta cuantización): https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-27B-i1-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-27B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Logics-SWE-Qwen3.6-27B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Logics-SWE-Qwen3.6-27B-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Paper, blog o demo oficial del modelo: no disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
