# mradermacher/gemma-3-27b-it-qat-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones estáticas en formato GGUF del modelo `mlabonne/gemma-3-27b-it-qat-abliterated`, una variante "abliterated" (con los mecanismos de rechazo atenuados mediante edición de direcciones de activación) de Gemma 3 27B Instruct, que a su vez parte de la versión QAT (Quantization-Aware Training) publicada por Google. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF para llama.cpp y derivados, y está pensado para su uso con `llama.cpp`, Ollama y otros runtimes compatibles con GGUF.

El modelo subyacente es un transformer denso de 27.009.346.304 parámetros (unos 27B), con capacidades multimodales (existe un proyector `mmproj` separado para visión) y una ventana de contexto amplia heredada de la familia Gemma 3. La particularidad de esta versión es la "abliteration": se han modificado los pesos para reducir la tendencia del modelo a rechazar peticiones, lo que cambia sustancialmente el perfil de seguridad respecto al Gemma 3 original de Google.

La relevancia de este repo es práctica: ofrece el modelo en múltiples niveles de cuantización (de Q2_K a Q8_0, además de IQ4_XS), lo que permite ejecutarlo desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con 24-48 GB, manteniendo el pipeline multimodal mediante los ficheros `mmproj`. La licencia es la Gemma License, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 3), multimodal con proyector de visión separado |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3; consultar model card del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun los tags del repo) |
| Licencia | gemma (Gemma License) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 27B Instruct en su variante QAT (Quantization-Aware Training), es decir, entrenada por Google teniendo en cuenta la cuantización posterior para preservar calidad al reducir precisión. Sobre esa base, mlabonne aplicó una técnica de "abliteration", que consiste en identificar y proyectar fuera las direcciones de activación asociadas a los comportamientos de rechazo, reduciendo la probabilidad de respuestas negativas o evasivas. No se dispone en la información proporcionada de detalles sobre el dataset de abliteration, el número de tokens de entrenamiento original ni la composición del corpus de Gemma 3.

mradermacher ha generado cuantizaciones estáticas (no imatrix) con llama.cpp, incluyendo los ficheros `mmproj` necesarios para habilitar la entrada de imágenes. Existe además un repositorio hermano con quants ponderados/imatrix (`gemma-3-27b-it-qat-abliterated-i1-GGUF`) que, según el autor, suele ofrecer mejor calidad a igual tamaño. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal específicas de esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con el formato de chat instruct de Gemma 3.
- Razonamiento y matemáticas de nivel medio-alto, heredados del modelo Instruct de 27B.
- Generación y explicación de código, aunque sin garantías específicas de tool calling en esta conversión.
- Capacidades multimodales: entrada de imágenes mediante los ficheros `mmproj-Q8_0.gguf` o `mmproj-f16.gguf` en runtimes compatibles (llama.cpp con soporte multimodal).
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el Gemma 3 original, lo que amplía el rango de respuestas pero elimina parte de las salvaguardas.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta conversión GGUF; el modelo base Gemma 3 Instruct sí lo soporta en su formato nativo.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Idiomas: el repo declara únicamente inglés, aunque Gemma 3 soporta más idiomas en su versión original; no se garantiza su preservación tras la abliteration.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: este modelo permite estudiar cómo la abliteration afecta a la tasa de rechazos, la calidad de las respuestas y la coherencia en comparación con Gemma 3 Instruct sin modificar, en un entorno controlado y con fines de auditoría.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantización Q4_K_M (16,6 GB) deja margen para contexto y permite ejecutar el modelo íntegramente en una RTX 4090 o A10G, útil para prototipos de asistentes conversacionales privados.
- Procesamiento de documentos con imágenes en local: usando los ficheros `mmproj`, se puede alimentar el modelo con capturas, diagramas o páginas escaneadas y obtener descripciones o extracción de información sin enviar datos a la nube, siempre que el caso de uso respete la licencia Gemma.
- Generación de contenido creativo sin restricciones excesivas: para escritura de ficción, guiones o narrativa que requiera tonos o temas que el modelo original rechazaría, con revisión humana obligatoria por el riesgo de contenido inapropiado.
- Fine-tuning posterior o destilación: al estar disponible en GGUF y con el base en safetensors, sirve como punto de partida para experimentos de adaptación (LoRA sobre el modelo original) o para generar datos sintéticos en dominios especializados.
- Evaluación comparativa de cuantizaciones: el repo ofrece una escalera completa de quants (Q2_K a Q8_0 más IQ4_XS), lo que permite medir empíricamente la degradación de perplejidad y calidad conversacional en cada nivel, útil para decidir el compromiso tamaño/calidad en producción.
- Chatbot de uso personal en hardware de consumo: con Q2_K (10,6 GB) o Q3_K_M (13,5 GB) cabe en GPUs de 12-16 GB, permitiendo un asistente local sin conexión para tareas de brainstorming o consultas generales en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto): Q2_K ~10,6 GB; Q3_K_M ~13,5 GB; IQ4_XS ~15,0 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Añadir 1-4 GB adicionales para KV cache según longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 3090 (24 GB) como alternativa económica a la 4090.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y Q3/Q4 en 16 GB (RTX 4060 Ti 16 GB, RTX 4080). Para Q6_K y Q8_0 se recomienda 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, koboldcpp y servidores compatibles con GGUF. Para multimodal, llama.cpp con `llama-mtmd-cli` o `llama-server` cargando el `mmproj` correspondiente. vLLM y TGI no consumen GGUF de forma nativa para este caso; requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato disponible |
|---|---|---|---|---|---|
| gemma-3-27b-it-qat-abliterated-GGUF (este) | ~27B | no disponible | Sí (mmproj) | Gemma | GGUF (Q2_K–Q8_0) |
| mlabonne/gemma-3-27b-it-qat-abliterated (base) | ~27B | no disponible | Sí | Gemma | safetensors |
| Gemma 3 27B Instruct (Google) | ~27B | no disponible en esta ficha | Sí | Gemma | safetensors, GGUF de terceros |
| mradermacher/gemma-3-27b-it-qat-abliterated-i1-GGUF | ~27B | no disponible | Sí | Gemma | GGUF imatrix (IQ) |

La diferencia principal frente a Gemma 3 27B Instruct es la atenuación de rechazos; frente al repo i1 del mismo autor, la diferencia es el método de cuantización (estática vs. imatrix), con calidad potencialmente superior en los quants IQ a igual tamaño.

## Limitaciones y advertencias

- La abliteration elimina parcialmente las salvaguardas del modelo original: puede generar contenido dañino, sesgado o inapropiado con mayor facilidad. No apto para exposición directa a usuarios finales sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de 27B: puede inventar hechos, citas o APIs; requiere verificación en cualquier uso factual.
- El repo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse respecto a Gemma 3 original.
- La licencia Gemma impone restricciones de uso (incluida una política de uso aceptable); el uso comercial está permitido bajo condiciones, pero la variante abliterated puede incumplir cláusulas de uso aceptable si se emplea para generar contenido prohibido. Revisar los términos antes de desplegar.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- Los quants estáticos pueden rendir peor que los imatrix del repo hermano a igual tamaño; conviene evaluar ambos si la calidad es crítica.
- El contexto efectivo con cuantizaciones pequeñas se ve limitado por la VRAM disponible para KV cache; en GPUs de 12 GB con Q2_K el contexto práctico será corto.
- No hay garantía de soporte de tool calling ni de modo "thinking" en esta conversión; verificar contra el modelo base antes de diseñar agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-it-qat-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/mlabonne/gemma-3-27b-it-qat-abliterated
- Quants imatrix del mismo autor: https://huggingface.co/mradermacher/gemma-3-27b-it-qat-abliterated-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-27b-it-qat-abliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad por quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
