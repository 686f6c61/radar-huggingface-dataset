# mradermacher/Rosa_v1_3.43B-GGUF

## Resumen

Rosa_v1_3.43B es un modelo de lenguaje conversacional de 3.429.913.600 parámetros (aproximadamente 3,43 mil millones) desarrollado por el usuario guillaume7 en Hugging Face. La versión aquí descrita es una recopilación de cuantizaciones GGUF estáticas publicadas por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo original está pensado para tareas conversacionales en inglés y se distribuye con licencia "other", lo que obliga a consultar los términos del modelo base antes de cualquier uso comercial.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo de 3,43B parámetros en hardware de consumo, desde 1,4 GB en Q2_K hasta 7 GB en f16. Sin embargo, la información pública disponible es muy escasa: no se detallan la arquitectura interna, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks. La model card se limita a listar los ficheros de cuantización y a remitir al modelo base.

Por tanto, esta ficha documenta con rigor lo que se sabe y marca explícitamente como "no disponible" todo aquello que la información proporcionada no cubre, para que el lector pueda evaluar el modelo sin asumir datos no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados) |
| Parametros totales | 3.429.913.600 (3,43B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | other (consultar términos del modelo base) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base guillaume7/Rosa_v1_3.43B. La librería declarada es transformers y el pipeline no está especificado, aunque las etiquetas incluyen "conversational", lo que sugiere un ajuste orientado a diálogo. No se indica si emplea atención lineal, decodificación especulativa, mezcla de expertos u otras innovaciones técnicas.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT. La única información técnica fiable procede de las cuantizaciones: mradermacher indica que son cuantizaciones estáticas (quantize_version 2) con output_tensor_quantised 1 y convert_type hf, generadas con llama.cpp. Existe además un repositorio paralelo de cuantizaciones ponderadas/imatrix (i1-GGUF) para quien prefiera ese tipo de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del modelo.
- No se documentan capacidades específicas de razonamiento, matemáticas o código.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: solo se declara inglés ("en"); no hay evidencia de otros idiomas.
- No se documentan modos especiales (thinking mode, visión, audio) en la información disponible.

## Casos de uso

- Prototipado local de chatbots conversacionales en inglés: con la cuantización Q4_K_M (2,2 GB) el modelo cabe en GPUs de consumo y permite iterar rápidamente en un entorno de desarrollo sin depender de APIs externas.
- Asistentes de escritorio offline: empaquetado con llama.cpp u Ollama, un modelo de 3,43B en Q4_K_S (2,1 GB) puede ejecutarse en portátiles con 8 GB de RAM, ofreciendo respuestas conversacionales sin conexión.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de respuesta en una tarea concreta.
- Filtrado y clasificación de texto conversacional: para tareas ligeras de etiquetado o reformulación en inglés donde no se requiera razonamiento profundo y prime la latencia baja.
- Base para fine-tuning ligero: al ser un modelo de 3,43B, es viable ajustarlo con LoRA en una única GPU de 24 GB (RTX 3090/4090) partiendo de los pesos safetensors del modelo base.
- Pruebas de integración en pipelines con transformers: la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face, útil para validar flujos de despliegue antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~1,4 GB; Q3_K_M ~1,8 GB; IQ4_XS ~2,0 GB; Q4_K_M ~2,2 GB; Q5_K_M ~2,5 GB; Q6_K ~2,9 GB; Q8_0 ~3,7 GB; f16 ~7,0 GB. Añadir margen para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores para Q5-Q6; RTX 4090, A100 o H100 no son necesarias para este tamaño, pero aceleran el throughput.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0; f16 requiere ~7 GB y cabe en RTX 3060 de 12 GB, RTX 4070 Ti o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explícita.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rosa_v1_3.43B (esta ficha) | 3,43B | no disponible | other | GGUF, safetensors | Solo inglés; sin benchmarks públicos |
| Qwen2.5-3B | 3,09B | 32K (128K en variantes) | Apache 2.0 | safetensors, GGUF | Multilingüe, benchmarks publicados |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, amplia documentación |
| Phi-3.5-mini | 3,82B | 128K | MIT | safetensors, GGUF | Razonamiento y código, benchmarks públicos |

La comparación se ofrece a título orientativo por tamaño; no se dispone de datos de rendimiento de Rosa_v1_3.43B que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse la composición del dataset, no es posible evaluar sesgos de género, raza o ideológicos.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluaciones, el riesgo es desconocido y debe asumirse alto en producción sin validación previa.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está publicada, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: la licencia "other" obliga a revisar los términos del modelo base guillaume7/Rosa_v1_3.43B antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Caveat de producción: la ausencia de benchmarks, de model card detallada y de documentación sobre el entrenamiento hace desaconsejable su uso en entornos productivos sin una evaluación propia exhaustiva.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable según las notas del propio autor ("lower quality" en Q3_K_M); para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rosa_v1_3.43B-GGUF
- Modelo base: https://huggingface.co/guillaume7/Rosa_v1_3.43B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Rosa_v1_3.43B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Rosa_v1_3.43B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
