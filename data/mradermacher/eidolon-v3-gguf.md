# mradermacher/eidolon-v3-GGUF

## Resumen

Eidolon-v3-GGUF es la versión cuantizada en formato GGUF del modelo `alfitaria-legacy/eidolon-v3`, publicada por el usuario mradermacher, conocido en el ecosistema por distribuir cuantizaciones estáticas de modelos open source para su uso con llama.cpp y derivados. El modelo base es un merge generado con mergekit, orientado a uso conversacional y entrenado únicamente en inglés. Con 23.572.403.200 parámetros totales (aproximadamente 23,6 mil millones), se sitúa en la franja de modelos densos de tamaño medio-grande, lo que condiciona sus requisitos de hardware.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local para un modelo de 23B que de otro modo requeriría infraestructura de GPU de gama alta; por otro, expone las limitaciones de información del repositorio, que no incluye model card técnica detallada, benchmarks ni especificación de licencia. El repositorio tiene 66,8 GB de tamaño total y, en el momento de la consulta, cero descargas y cero likes, lo que indica una publicación reciente y sin validación comunitaria.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni el proceso de alineación del modelo base. Cualquier evaluación de producción debería partir de una validación empírica propia, dado que el autor de la cuantización no publica métricas de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; presumiblemente transformer denso, sin confirmar) |
| Parámetros totales | 23.572.403.200 (23,6B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 (según tags del repositorio) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 66,8 GB |
| Modelo base | alfitaria-legacy/eidolon-v3 |
| Librería declarada | transformers |
| Etiquetas | mergekit, merge, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base `alfitaria-legacy/eidolon-v3` es un merge construido con mergekit, según las etiquetas del repositorio. Esto implica que no se entrenó desde cero, sino que se combinaron los pesos de dos o más modelos mediante alguna técnica de fusión (no especificada: podría ser linear, SLERP, TIES, DARE u otra). El repositorio de la cuantización no documenta qué modelos se fusionaron, qué proporciones se usaron ni si hubo un paso posterior de fine-tuning o alineación.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, atención con ventana deslizante, etc.). La única información técnica fiable es el recuento de parámetros (23,6B) y el hecho de que el formato de salida es GGUF estático, generado con la herramienta de cuantización de mradermacher, que produce cuantizaciones sin pesos imatrix (el propio autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación).

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno según la etiqueta `conversational`.
- Razonamiento general y respuesta a instrucciones, presumiblemente heredado de los modelos fusionados en el merge (no verificado).
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a través de infraestructuras de inferencia estándar (TGI, vLLM con soporte GGUF, o llama.cpp server).
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- No consta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode). Cualquier capacidad de este tipo sería especulativa y debe validarse empíricamente.
- Capacidades multilingües limitadas al inglés según la declaración del autor; no se garantiza un rendimiento aceptable en castellano u otros idiomas.

## Casos de uso

- Despliegue local de un asistente conversacional en inglés: con cuantizaciones Q4_K_S de 13,6 GB, el modelo puede ejecutarse en una GPU de consumo con 16 GB de VRAM o en configuraciones CPU+GPU con RAM suficiente, adecuado para prototipos de chat sin dependencia de API externa.
- Experimentación con modelos fusionados: útil para investigadores que quieran evaluar el comportamiento de merges de 23B en tareas de diálogo, comparando la calidad del merge frente a los modelos originales que lo componen.
- Generación de texto creativo y redacción en inglés: el modelo puede emplearse para borradores, resúmenes y reescritura en inglés, siempre con revisión humana dada la ausencia de benchmarks publicados.
- Servicio de inferencia autoalojado: la etiqueta `endpoints_compatible` permite integrarlo en un endpoint compatible con la API de OpenAI mediante llama.cpp server o vLLM, útil para equipos que quieran un endpoint privado sin salida de datos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles (Q2_K a Q8_0, más IQ4_XS), lo que permite medir la degradación de calidad por cuantización en un modelo de 23B, un caso de estudio práctico para pipelines de compresión.
- Base para fine-tuning posterior: al estar disponible el modelo base en safetensors, se puede partir de él para ajuste supervisado en inglés sobre dominios concretos, aunque la licencia no confirmada obliga a verificar los términos antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos asociados incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (23,6B parámetros, pesos GGUF):
  - Q2_K: ~9,0 GB de pesos; con overhead de contexto, ~10-11 GB de VRAM.
  - Q4_K_S: ~13,6 GB de pesos; con overhead, ~15-16 GB de VRAM.
  - Q4_K_M: ligeramente superior a Q4_K_S (tamaño exacto no publicado en la tabla del repositorio).
  - Q5_K_M / Q6_K: ~16-19 GB de pesos; requieren GPU de 24 GB para contexto moderado.
  - Q8_0 / F16: ~25 GB y ~47 GB respectivamente; fuera del alcance de GPU de consumo.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 y F16; RTX 3090/4080 (16-24 GB) para Q4_K_S.
- GPU de consumo: sí, en el rango Q2_K a Q4_K_S con GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3090). Para Q5 en adelante se recomienda 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python; servidores compatibles con API OpenAI mediante llama.cpp server. vLLM con soporte GGUF es posible pero menos habitual; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un modelo denso de 23B en Q4_K_S en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay medición publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| eidolon-v3-GGUF (este) | 23,6B | no disponible | no disponible | GGUF | Merge con mergekit, solo inglés, sin benchmarks |
| Mistral Small 24B (referencia de categoría) | ~24B | 32k-128k según versión | Apache 2.0 (versiones recientes) | safetensors, GGUF | Modelo entrenado desde cero con benchmarks públicos |
| Gemma 2 27B (referencia de categoría) | 27B | 8k | Gemma License | safetensors, GGUF | Modelo denso con evaluación publicada |
| Qwen2.5 32B (referencia de categoría) | 32,5B | 32k-128k | Apache 2.0 | safetensors, GGUF | Multilingüe, con benchmarks y tool calling documentado |

La comparación es estructural: no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. Frente a las alternativas de la tabla, eidolon-v3 carece de model card técnica, benchmarks y licencia declarada, lo que lo sitúa en desventaja para uso en producción frente a modelos con documentación completa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Cualquier despliegue en producción requiere contactar con el autor del modelo base o asumir el riesgo legal.
- Solo inglés declarado: el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad; la evaluación debe hacerse de forma empírica antes de adoptarlo.
- Origen merge: los modelos fusionados con mergekit pueden heredar sesgos, inconsistencias y comportamientos erráticos de los modelos originales, y su alineación (RLHF/DPO) no está documentada.
- Riesgo de alucinación: sin datos de alineación ni evaluaciones de fidelidad, se debe asumir un riesgo estándar o superior al de modelos con post-entrenamiento documentado.
- Contexto desconocido: no se puede planificar un uso con ventanas largas sin verificar el límite real del modelo base.
- Cuantizaciones estáticas sin imatrix: el autor indica que las versiones ponderadas con imatrix no estaban disponibles; las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta; no hay validación de la comunidad ni issues que documenten problemas.
- Fecha de creación futura en los metadatos (2026-11-11): inconsistencia que sugiere posibles errores en la publicación o en los metadatos del repositorio; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/eidolon-v3-GGUF
- Modelo base: https://huggingface.co/alfitaria-legacy/eidolon-v3
- Página de descargas del autor: https://hf.tst.eu/model#eidolon-v3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
