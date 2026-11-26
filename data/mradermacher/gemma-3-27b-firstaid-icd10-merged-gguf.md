# mradermacher/gemma-3-27b-firstaid-icd10-merged-GGUF

## Resumen

El modelo `mradermacher/gemma-3-27b-firstaid-icd10-merged-GGUF` es una versión cuantizada en formato GGUF del modelo `alfredcs/gemma-3-27b-firstaid-icd10-merged`, que a su vez se construye sobre la arquitectura Gemma 3 de Google con 27 000 millones de parámetros. El autor de la cuantización es mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de inferencia local. El modelo está especializado en primeros auxilios y codificación clínica ICD-10, según se deduce del nombre del modelo base.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 27B especializado en dominio sanitario en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,1 GB) hasta Q8_0 (30,3 GB). El modelo base fue entrenado con técnicas de aprendizaje por refuerzo (GRPO, según las etiquetas del repositorio) y pertenece a la familia Gemma 3, que soporta multimodalidad (texto e imagen) mediante el proyector `mmproj` incluido en el repositorio.

La información disponible es limitada: no se publican detalles sobre el dataset de entrenamiento, los benchmarks ni la licencia específica. El repositorio tiene 197,3 GB de tamaño total (incluyendo todas las cuantizaciones) y registra 299 descargas. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 28 418 976 512 (~28,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es `alfredcs/gemma-3-27b-firstaid-icd10-merged`, construido sobre la arquitectura Gemma 3 de Google. Se trata de un transformer decoder-only de aproximadamente 28,4 mil millones de parámetros. Las etiquetas del repositorio indican el uso de `trl` y `grpo` (Group Relative Policy Optimization), lo que sugiere que el modelo fue ajustado mediante aprendizaje por refuerzo, probablemente para mejorar el razonamiento en tareas de primeros auxilios y codificación ICD-10. La etiqueta `Reasoning-Course` sugiere que el ajuste se realizó en el contexto de un curso o proyecto de razonamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO adicionales. El repositorio incluye un proyector multimodal (`mmproj`), lo que indica que el modelo base conserva las capacidades de visión de Gemma 3. La cuantización fue realizada por mradermacher con cuantizaciones estáticas (no se dispone de versiones con imatrix según la model card).

## Capacidades

- Generación de texto y razonamiento en el dominio de primeros auxilios y codificación clínica ICD-10.
- Codificación y clasificación de diagnósticos según la taxonomía ICD-10 (deducido del nombre del modelo).
- Capacidades multimodales (visión) heredadas de Gemma 3, con proyector `mmproj` disponible en el repositorio.
- Razonamiento multi-paso, presumiblemente reforzado mediante GRPO.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo de razonamiento explícito: no confirmado en la información disponible.

## Casos de uso

- Triaje de primeros auxilios: el modelo puede generar respuestas estructuradas sobre procedimientos de primeros auxilios, adecuado por su ajuste específico en este dominio y su tamaño de 27B que permite razonamiento detallado.
- Codificación clínica automatizada: asignación de códigos ICD-10 a descripciones de síntomas o diagnósticos, útil en entornos de facturación médica y registros electrónicos de salud.
- Asistencia a personal sanitario no especializado: consultas en lenguaje natural sobre protocolos de actuación ante emergencias, con respuestas en inglés.
- Análisis de imágenes médicas simples: gracias al proyector multimodal, puede procesar imágenes junto con texto para tareas de triaje visual básico.
- Formación y simulación clínica: generación de escenarios de práctica y preguntas de evaluación sobre primeros auxilios y codificación.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (17,4 GB) permiten ejecución en GPUs de consumo de gama alta, facilitando su uso en clínicas o dispositivos locales sin infraestructura cloud.
- Investigación en NLP clínico: modelo de referencia para experimentos de ajuste por RL en dominios sanitarios, gracias a la disponibilidad de cuantizaciones y al etiquetado GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11,1 GB; Q3_K_M ~14,1 GB; Q4_K_M ~17,4 GB; Q5_K_M ~20,3 GB; Q6_K ~23,4 GB; Q8_0 ~30,3 GB. Añadir ~0,7-1,0 GB si se usa el proyector multimodal.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o A100/H100. Para Q2_K o Q3_K_S, una RTX 3090 (24 GB) o RTX 4080 (16 GB) puede ser suficiente.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones hasta Q6_K; en RTX 4080 (16 GB) con Q3_K_S o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No se recomienda vLLM para GGUF (aunque existe soporte experimental).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| gemma-3-27b-firstaid-icd10-merged-GGUF (este) | ~28,4B | no disponible | no disponible | GGUF | Primeros auxilios e ICD-10 |
| Gemma 3 27B (base de Google) | ~27B | no disponible | Gemma Terms | safetensors, GGUF | Generalista multimodal |
| Meditron-70B | 70B | no disponible | Llama 2 | safetensors | Medico general |
| BioMistral-7B | 7B | no disponible | Apache 2.0 | safetensors, GGUF | Biomedico |

La comparativa se basa en categorías generales; no se dispone de datos de rendimiento comparativo para este modelo específico. Frente a Gemma 3 27B base, este modelo añade especialización en primeros auxilios e ICD-10 mediante ajuste GRPO. Frente a Meditron-70B, ofrece menor tamaño (28,4B vs 70B) y cuantizaciones más ligeras. Frente a BioMistral-7B, es significativamente mayor y presumiblemente más capaz, pero requiere más recursos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado en inglés y en dominio sanitario, puede presentar sesgos culturales y lingüísticos.
- Riesgo de alucinación: elevado en dominios médicos especializados; las respuestas sobre primeros auxilios o codificación ICD-10 deben ser validadas por profesionales sanitarios.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de inglés; no se recomienda su uso en castellano sin evaluación previa. La longitud de contexto no está documentada.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; es imprescindible verificar la licencia del modelo base (`alfredcs/gemma-3-27b-firstaid-icd10-merged`) y de Gemma 3 antes de cualquier uso comercial.
- Caveat para producción: al ser una cuantización estática (sin imatrix), las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad. Se recomienda Q4_K_M o superior para uso en producción.
- El modelo no debe usarse como sustituto de atención médica profesional; es una herramienta de asistencia y formación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-3-27b-firstaid-icd10-merged-GGUF
- Modelo base: https://huggingface.co/alfredcs/gemma-3-27b-firstaid-icd10-merged
- Página de descargas del autor: https://hf.tst.eu/model#gemma-3-27b-firstaid-icd10-merged-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
