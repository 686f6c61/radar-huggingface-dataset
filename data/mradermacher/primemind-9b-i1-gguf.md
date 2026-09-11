# mradermacher/PrimeMind-9B-i1-GGUF

## Resumen

PrimeMind-9B-i1-GGUF es el conjunto de cuantizaciones GGUF, generadas con calibración imatrix, del modelo CrowdMind/PrimeMind-9B. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema llama.cpp que publica versiones comprimidas de modelos abiertos para poder ejecutarlos en hardware de consumo. El repositorio no contiene los pesos originales en precisión completa, sino quince variantes GGUF que van desde 3,9 GB (i1-Q2_K) hasta 7,5 GB (i1-Q6_K), más el fichero imatrix de 0,1 GB para quien quiera generar sus propias cuantizaciones.

El modelo base declara 8.953.803.264 parámetros (unos 8,95 mil millones), licencia Apache 2.0 e inglés como único idioma. Las etiquetas del repositorio lo sitúan en la familia Qwen 3.5 y lo describen como un modelo orientado a razonamiento, ajustado mediante SFT y con dos rasgos distintivos poco habituales: "caveman-thinking" y "compressed-reasoning", es decir, generación de cadenas de razonamiento abreviadas o comprimidas. También aparece la etiqueta "multimodal", aunque las cuantizaciones publicadas no incluyen ningún fichero de proyección multimodal (mmproj).

Su relevancia práctica es la de cualquier buen GGUF de ~9B: permite ejecutar un modelo de razonamiento en una GPU de consumo o incluso en CPU con memoria RAM suficiente, sin depender de APIs externas y con licencia permisiva para uso comercial. Ahora bien, la información pública disponible es muy escasa: no se documentan longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en los materiales proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta "qwen3.5" apunta a la familia Qwen 3.5; la model card no describe la arquitectura) |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); existe versión estática en mradermacher/PrimeMind-9B-GGUF |
| Modelo base | CrowdMind/PrimeMind-9B |
| Cuantizador | mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Tamaño del repositorio | 79,3 GB (suma de todas las variantes publicadas) |

## Arquitectura y entrenamiento

La model card no aporta detalles sobre la arquitectura interna del modelo base. Las únicas pistas son las etiquetas: "qwen3.5", "reasoning", "sft", "caveman-thinking", "compressed-reasoning" y "multimodal". Esto permite afirmar que se trata de un transformer de la familia Qwen 3.5 con ajuste supervisado (SFT), pero no hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). Tampoco se documenta si el modelo tiene modos de pensamiento conmutables.

En cuanto al proceso de cuantización, sí hay datos concretos: mradermacher ha generado cuantizaciones ponderadas con imatrix a partir del modelo en formato HuggingFace, con un fichero imatrix propio de 0,1 GB que también se distribuye. Las notas del autor señalan que las variantes IQ suelen ser preferibles a las K de tamaño similar (por ejemplo, i1-IQ3_S "beats Q3_K*", i1-Q4_K_M marcada como "fast, recommended" y i1-IQ4_XS como preferible frente a i1-IQ4_NL). No se publica perplejidad ni ninguna otra métrica de degradación por cuantización.

## Capacidades

- Generación de texto conversacional en inglés, con la etiqueta "conversational" en el repositorio.
- Razonamiento explícito: el modelo se distribuye con la etiqueta "reasoning", lo que implica cadenas de pensamiento antes de la respuesta final.
- Razonamiento comprimido: las etiquetas "caveman-thinking" y "compressed-reasoning" apuntan a cadenas de razonamiento abreviadas, orientadas a reducir el coste en tokens de salida.
- Ajuste por instrucciones mediante SFT (etiqueta "sft").
- Capacidad multimodal declarada por etiqueta, pero no confirmada en esta distribución: la lista de ficheros publicados no incluye ningún mmproj, por lo que no se puede garantizar el soporte de visión en llama.cpp con estos GGUF.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente.
- Multilingüismo: limitado al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Asistente de razonamiento local en estaciones de trabajo: con la variante i1-Q4_K_M (5,7 GB) el modelo cabe en una GPU de 8-12 GB, lo que permite desplegar un asistente de razonamiento sin conexión a servicios externos y sin coste por token.
- Generación de código asistida en el IDE: un modelo de ~9B cuantizado a Q4_K_M o Q5_K_M se integra en extensiones locales tipo Continue o llama.cpp server, con latencia aceptable para autocompletado y explicación de fragmentos.
- Procesamiento por lotes en CPU: las variantes i1-Q2_K (3,9 GB) e i1-IQ3_M (4,5 GB) permiten ejecutar clasificación, resumen o extracción de información sobre grandes volúmenes de texto en servidores sin GPU, a cambio de una pérdida de calidad medible.
- Investigación sobre razonamiento comprimido: dado que el modelo está entrenado con cadenas de razonamiento abreviadas, es un candidato para estudiar la relación entre longitud del chain-of-thought y precisión en tareas de matemáticas y lógica.
- Despliegue en el borde (edge) con recursos limitados: el tamaño reducido de las cuantizaciones bajas hace viable ejecutar el modelo en mini-PC o portátiles con 8-16 GB de RAM unificada, por ejemplo para asistentes de documentación técnica.
- Evaluación comparativa de cuantizaciones: el repositorio publica quince variantes del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir el impacto real de cada tipo de cuantización en tareas concretas antes de fijar una configuración de producción.
- Base para fine-tuning posterior o destilación: al ser Apache 2.0 y estar disponible en GGUF, se puede usar como generador de datos sintéticos en inglés para entrenar modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni del modelo base ni de las cuantizaciones. Tampoco se proporcionan datos de perplejidad por tipo de cuantización, más allá del gráfico genérico de ikawrakow enlazado por el autor, que compara tipos de cuantización entre sí y no este modelo en particular.

## Requisitos de hardware

Tamaños de fichero publicados y VRAM estimada para inferencia (la estimación añade un margen de aproximadamente 1-1,5 GB sobre el tamaño del fichero para caché KV y buffers, y depende de la longitud de contexto, que no se ha documentado):

| Cuantización | Tamaño del fichero | VRAM estimada |
|---|---|---|
| i1-Q2_K | 3,9 GB | ≈5 GB |
| i1-Q3_K_S | 4,4 GB | ≈5,5 GB |
| i1-IQ3_S | 4,5 GB | ≈5,5 GB |
| i1-IQ3_M | 4,5 GB | ≈5,5 GB |
| i1-Q3_K_M | 4,7 GB | ≈6 GB |
| i1-Q3_K_L | 5,0 GB | ≈6 GB |
| i1-IQ4_XS | 5,3 GB | ≈6,5 GB |
| i1-Q4_0 | 5,4 GB | ≈6,5 GB |
| i1-Q4_K_S | 5,5 GB | ≈6,5 GB |
| i1-IQ4_NL | 5,5 GB | ≈6,5 GB |
| i1-Q4_K_M | 5,7 GB | ≈7 GB |
| i1-Q4_1 | 5,9 GB | ≈7,5 GB |
| i1-Q5_K_S | 6,4 GB | ≈8 GB |
| i1-Q5_K_M | 6,6 GB | ≈8 GB |
| i1-Q6_K | 7,5 GB | ≈9 GB |

- GPU recomendadas: no hay requisitos oficiales publicados. Por tamaño, una RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 o una A100/H100 pueden ejecutar cualquiera de las variantes; las tarjetas de 8 GB quedan limitadas a las cuantizaciones de 4 bits o inferiores.
- ¿Cabe en GPU de consumo? Sí. Las variantes i1-Q4_K_M y menores caben en GPUs de 8 GB con contexto moderado; las de 3-4 bits caben incluso en 6 GB.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Las variantes i1-Q2_K e i1-IQ3_M son las más adecuadas para ejecución puramente en CPU con RAM limitada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/PrimeMind-9B-i1-GGUF (este) | 8,95 B | No disponible | GGUF con imatrix, 15 variantes | Apache 2.0 | Cuantización ponderada; recomendada i1-Q4_K_M |
| mradermacher/PrimeMind-9B-GGUF | 8,95 B | No disponible | GGUF estático | Apache 2.0 | Mismo modelo base, cuantizaciones sin recalibración imatrix |
| CrowdMind/PrimeMind-9B | 8,95 B | No disponible | Pesos HuggingFace originales | Apache 2.0 | Modelo de origen sin cuantizar |
| Otras alternativas de ~9B (Qwen, Llama, Gemma) | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos que permitan una comparación rigurosa |

No se dispone de benchmarks ni de especificaciones de contexto del modelo base, por lo que cualquier comparación numérica con modelos de la misma categoría sería especulativa.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara inglés. No hay evidencia de soporte fiable en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse, no se puede planificar el uso con documentos largos ni garantizar el comportamiento en conversaciones multi-turno extensas.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan estimar la calidad real frente a modelos de tamaño similar.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de este tamaño; no hay evaluaciones de factualidad disponibles.
- Razonamiento comprimido: las etiquetas "caveman-thinking" y "compressed-reasoning" sugieren cadenas de pensamiento abreviadas, lo que puede traducirse en menor precisión en tareas de lógica o matemáticas complejas en comparación con modelos que razonan de forma extensa. No hay datos que confirmen o desmientan este punto.
- Multimodalidad no verificable en esta distribución: la etiqueta "multimodal" aparece en el repositorio, pero no se publica ningún fichero mmproj, por lo que el soporte de imagen en llama.cpp no está confirmado.
- Degradación por cuantización: las variantes por debajo de 4 bits (Q2_K, IQ3_*) reducen la calidad de forma apreciable; el propio autor desaconseja i1-Q4_0 ("fast, low quality") y recomienda IQ3_XXS o IQ3_XS frente a algunos formatos K.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No impone restricciones de atribución adicionales más allá de las habituales.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, y ausencia de pipeline declarado; no hay validación por parte de la comunidad.
- Fechas de creación y actualización indicadas como 11 de septiembre de 2026, lo que resulta anómalo y debe verificarse antes de citar el modelo.

## Enlaces

- Repositorio GGUF con imatrix (este modelo): https://huggingface.co/mradermacher/PrimeMind-9B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/PrimeMind-9B-GGUF
- Modelo base: https://huggingface.co/CrowdMind/PrimeMind-9B
- Página de resumen y descargas del autor: https://hf.tst.eu/model#PrimeMind-9B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/PrimeMind-9B-i1-GGUF/resolve/main/PrimeMind-9B.imatrix.gguf
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo ni con su modelo base; los enlaces encontrados corresponden a consultas administrativas sin relación con el contenido de esta ficha y se han descartado.
