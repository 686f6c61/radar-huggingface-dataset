# mradermacher/Heretic-Scalpel-E2B-i1-GGUF

## Resumen

Heretic-Scalpel-E2B-i1-GGUF es una recopilación de cuantizaciones GGUF, generadas con imatrix, del modelo aifeifei798/Heretic-Scalpel-E2B. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, mientras que el modelo original procede del usuario aifeifei798. El repositorio no incluye una model card propia del modelo base: toda la documentación disponible se centra en el proceso de cuantización y en la lista de ficheros ofrecidos.

El modelo base declara 4.647.450.147 parámetros totales según los datos de safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 4,6 mil millones de parámetros. El nombre "E2B" y la referencia a la licencia de Gemma 4 en el campo `license_link` sugieren un vínculo con la familia Gemma, aunque esta relación no se detalla en la información disponible. El modelo está etiquetado como conversacional y orientado al inglés.

La relevancia de este repositorio es práctica: ofrece el modelo en múltiples niveles de cuantización (desde i1-Q2_K de 3,1 GB hasta i1-Q6_K de 3,9 GB), lo que permite ejecutarlo en hardware de consumo con llama.cpp y derivados. Es, por tanto, una vía de acceso al modelo base para entornos con VRAM limitada, no un modelo nuevo en sí mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base sin model card detallada; probable familia Gemma por el license_link) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El repositorio es exclusivamente una colección de cuantizaciones GGUF con imatrix del modelo aifeifei798/Heretic-Scalpel-E2B, y la model card no describe capas, tipo de atención, mecanismo de mezcla de expertos ni detalles del transformer subyacente. El único dato estructural fiable es el recuento de parámetros (4.647.450.147) y la etiqueta de modelo conversacional.

Tampoco hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La referencia a la licencia de Gemma 4 en el campo `license_link` es el único indicio sobre el linaje del modelo, pero no se confirma en el texto. Las cuantizaciones i1 emplean ficheros imatrix generados por el propio mradermacher, técnica que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas; el repositorio incluye además un fichero imatrix independiente (0,1 GB) para que otros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y su uso previsto es el diálogo multi-turno.
- Idiomas: únicamente inglés según el campo `language` de la model card.
- Razonamiento, código y matemáticas: no disponible; no hay documentación que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (3,5 GB) e i1-Q5_K_M (3,7 GB) permiten ejecutar un modelo de 4,6 mil millones de parámetros en GPUs con 8 GB de VRAM mediante llama.cpp, sin necesidad de infraestructura en la nube.
- Prototipado de asistentes conversacionales en inglés: al ser un modelo conversacional cuantizado, sirve para validar flujos de chat multi-turno en entornos de desarrollo antes de escalar a modelos mayores.
- Inferencia en CPU: las cuantizaciones de menor tamaño (i1-Q2_K, 3,1 GB; i1-IQ3_S, 3,2 GB) permiten ejecución en CPU con RAM moderada, útil para pruebas offline o entornos sin GPU.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 15 variantes de cuantización más el fichero imatrix, lo que permite medir el impacto de la precisión en la calidad de salida sobre una misma tarea.
- Generación de cuantizaciones propias: el fichero imatrix publicado permite a otros usuarios producir sus propias versiones GGUF con calidades ajustadas a sus necesidades.
- Integración en herramientas de escritorio: al ser GGUF, es compatible con llama.cpp, Ollama y LM Studio, lo que facilita su inclusión en aplicaciones locales de escritorio para tareas de generación de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,1 GB (i1-Q2_K) y 3,9 GB (i1-Q6_K) para los pesos cuantizados; hay que añadir el espacio del contexto KV cache, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede alojar las cuantizaciones de 4-5 bits con contexto moderado; una RTX 3060 de 12 GB o RTX 4090 de 24 GB ofrecen margen amplio para contexto largo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones listadas; las versiones i1-Q4_K_M e i1-Q5_K_M son las más equilibradas según las notas del autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y servidores compatibles con la API de endpoints (la etiqueta `endpoints_compatible` está presente).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. Como referencia estructural, el modelo tiene 4,6 mil millones de parámetros y licencia apache-2.0, pero sin benchmarks ni contexto documentado no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Documentación insuficiente: el repositorio no incluye model card del modelo base, por lo que se desconocen arquitectura, contexto máximo, datos de entrenamiento y comportamiento esperado.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad factual del modelo.
- Licencia: el repositorio declara apache-2.0, pero el campo `license_link` apunta a la licencia de Gemma 4, lo que introduce ambigüedad sobre los términos reales de uso comercial. Conviene verificar la licencia del modelo base antes de un despliegue en producción.
- Cuantizaciones de baja precisión: las variantes i1-Q2_K e i1-Q3_K_S pueden degradar la calidad de forma notable; el propio autor recomienda IQ3_XXS o IQ3_XS frente a Q3_K* en esos rangos.
- Sin garantías de producción: al tratarse de una cuantización de un modelo de terceros sin evaluación publicada, no hay evidencia de robustez, seguridad ni sesgos controlados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-i1-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Heretic-Scalpel-E2B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Licencia enlazada (Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
