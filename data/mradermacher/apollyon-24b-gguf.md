# mradermacher/Apollyon-24B-GGUF

## Resumen

Apollyon-24B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Apollyon-24B, publicada por el usuario mradermacher. El modelo base, desarrollado por c4tdr0ut, es un modelo de lenguaje de 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) derivado de la familia Mistral, según indican las etiquetas de la model card. Se trata de un modelo de tipo "abliterated" y "unaligned", es decir, sometido a técnicas de eliminación de rechazos (refusal ablation) y ajuste fino con SFT y DPO para reducir las restricciones de alineación.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher ofrece el modelo original en múltiples niveles de cuantización GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de casi 24B de parámetros en hardware de consumo y en entornos con memoria limitada mediante llama.cpp u otros motores compatibles con GGUF. El repositorio ocupa 161,4 GB en total debido a la suma de todos los ficheros de cuantización.

La model card del repositorio es escueta y se centra en la lista de cuantizaciones disponibles y en instrucciones genéricas de uso de GGUF. No se proporcionan detalles sobre el contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones técnicas de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, según etiquetas de la model card) |
| Parametros totales | 23.572.403.200 (23,6B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existen además cuantizaciones imatrix en el repo Apollyon-24B-i1-GGUF |
| Idiomas soportados | Inglés (etiqueta `language: en` en la model card) |
| Licencia | Other (no especificada en detalle) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas de la model card, que apuntan a una base Mistral y a un proceso de ajuste que incluye SFT (supervised fine-tuning) y DPO (direct preference optimization). Las etiquetas "abliterated" y "unaligned" indican que el modelo ha sido modificado para eliminar o atenuar los mecanismos de rechazo y las restricciones de alineación típicas de los modelos instruct convencionales. También aparecen las etiquetas "grok" y "x.ai", que sugieren una inspiración o destilación a partir de modelos de xAI, aunque no se aporta documentación que lo confirme.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, la longitud de contexto nativa ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). El repositorio cuantizado no incluye esa información y la model card se limita a describir el proceso de cuantización estática realizado con herramientas de mradermacher (convert_type: hf, quantize_version: 2). Para detalles de arquitectura y entrenamiento habría que consultar el repositorio del modelo base c4tdr0ut/Apollyon-24B, cuyos datos no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno.
- Razonamiento y generación de contenido sin las restricciones de rechazo habituales (comportamiento "unaligned"/"abliterated"), lo que incluye respuestas a peticiones que los modelos alineados estándar rechazarían.
- Ajuste fino con SFT y DPO, lo que en principio mejora la calidad de las respuestas conversacionales respecto a la base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües: la model card solo declara inglés.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de sistemas "abliterated" y comparar sus respuestas con las de modelos alineados, útil para equipos que investigan mecanismos de rechazo y sesgos.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera contenido adulto o temáticas que los modelos alineados suelen declinar, ejecutándose localmente con llama.cpp.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB) permiten ejecutar el modelo en GPUs de 16-24 GB de VRAM o en configuraciones CPU+GPU con RAM suficiente.
- Prototipado de chatbots conversacionales en inglés: con la cuantización Q8_0 (25,2 GB) o Q6_K (19,4 GB) se obtiene la máxima calidad del repo para entornos de desarrollo con una sola GPU de 24-32 GB.
- Experimentación con técnicas de cuantización: el repositorio ofrece once variantes para comparar el impacto de la cuantización en la perplejidad y la calidad de salida, con la gráfica de ikawrakow como referencia.
- Evaluación de riesgos en pipelines de moderación: al ser un modelo que evade rechazos, sirve como caso de prueba para sistemas de filtrado y clasificadores de seguridad antes de desplegar modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~9,0 GB; Q3_K_S ~10,5 GB; Q3_K_M ~11,6 GB; Q3_K_L ~12,5 GB; IQ4_XS ~13,0 GB; Q4_K_S ~13,6 GB; Q4_K_M ~14,4 GB; Q5_K_S ~16,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; GPUs de 8-12 GB solo admiten Q2_K/Q3_K con contexto corto o descarga parcial a CPU. Para Q8_0 con contexto largo, A100 40 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (hasta Q8_0 con contexto limitado), RTX 4080/4070 Ti Super (Q4/Q5) y GPUs de 12-16 GB con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier motor compatible con GGUF. El repo declara compatibilidad con text-generation-inference y transformers para el modelo base, pero las cuantizaciones GGUF están pensadas para llama.cpp y derivados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apollyon-24B-GGUF | 23,6B | No disponible | Other | GGUF (11 cuantizaciones) | Base Mistral, abliterated, SFT+DPO, solo inglés |
| Mistral Small 24B (referencia de familia) | ~24B | No disponible en esta ficha | Apache 2.0 (habitual en Mistral) | Safetensors, GGUF de terceros | Modelo alineado estándar, multilingüe |
| Modelos 20-30B abliterated de la comunidad | ~20-30B | Variable | Variable | GGUF habitual | Alternativas directas en el nicho "unaligned" |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks del modelo en la información disponible. La comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo "abliterated" y "unaligned": no aplica los rechazos de seguridad habituales, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No es apto para despliegues orientados al público sin capas de moderación externas.
- Riesgo elevado de alucinación: no hay datos de evaluación que permitan cuantificarlo, pero la ausencia de benchmarks y el ajuste agresivo sobre la base incrementan la incertidumbre sobre la fiabilidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar empíricamente el límite del modelo base.
- Licencia "other" sin texto detallado en la información disponible: antes de un uso comercial es imprescindible revisar los términos del modelo base c4tdr0ut/Apollyon-24B y de la familia Mistral subyacente.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 161,4 GB en total; descargar todas las variantes no es necesario y conviene seleccionar solo la cuantización objetivo.
- Sin garantías de mantenimiento: el modelo se publicó en noviembre de 2026 según los metadatos y no hay historial de actualizaciones documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apollyon-24B-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Apollyon-24B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Apollyon-24B-i1-GGUF
- Página de resumen de mradermacher: https://hf.tst.eu/model#Apollyon-24B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
