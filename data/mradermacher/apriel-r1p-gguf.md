# mradermacher/Apriel-R1P-GGUF

## Resumen

Apriel-R1P-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Apriel-R1P, desarrollado originalmente por ConicCat y empaquetado por mradermacher para su uso con llama.cpp y otros runtimes compatibles con GGUF. El modelo base es un transformer denso de aproximadamente 15.000 millones de parámetros (14.974.182.400 según los pesos en safetensors), orientado a tareas conversacionales y de razonamiento en inglés, y publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que el repositorio GGUF democratiza el acceso al modelo: ofrece cuantizaciones desde Q2_K (5,9 GB) hasta Q8_0 (16,0 GB), lo que permite ejecutar un modelo de 15B en hardware de consumo con suficiente VRAM o incluso en CPU con las variantes más agresivas. El nombre "R1P" sugiere una destilación o adaptación inspirada en el estilo de razonamiento de DeepSeek-R1, aunque la model card del repositorio no documenta explícitamente el proceso de entrenamiento.

No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es una plantilla estándar de mradermacher centrada en los ficheros de cuantización, sin datos sobre arquitectura interna, longitud de contexto, composición del dataset ni benchmarks. Esta ficha refleja fielmente esa escasez de datos y marca como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 14.974.182.400 (~15B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio separado |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repositorio | 103,2 GB (incluye todas las cuantizaciones) |
| Modelo base | ConicCat/Apriel-R1P |
| Fecha de creacion | 2025-09-06 |
| Descargas | 188 |

## Arquitectura y entrenamiento

El modelo base Apriel-R1P es un transformer denso de aproximadamente 15B parámetros. No se dispone de información pública en la documentación consultada sobre el número de capas, dimensión oculta, número de cabezas de atención, tipo de atención (completa, GQA, sliding window) ni sobre el tokenizador empleado. Tampoco se documenta la longitud máxima de contexto soportada por el modelo original.

En cuanto al entrenamiento, la model card del repositorio GGUF no incluye datos sobre el volumen de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o destilación. El sufijo "R1P" en el nombre sugiere una inspiración en el paradigma de razonamiento de DeepSeek-R1 (posiblemente destilación de trazas de razonamiento), pero esto es una inferencia a partir de la nomenclatura y no está confirmado por la documentación disponible. El proceso de cuantización sí está documentado: mradermacher emplea cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, y ofrece variantes con importance matrix en el repositorio `mradermacher/Apriel-R1P-i1-GGUF`.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Razonamiento de estilo "R1" presumiblemente (por la nomenclatura), aunque no confirmado en la documentación.
- No se documenta soporte explícito de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language`.
- No se documenta visión, audio ni modo "thinking" explícito.
- Compatible con endpoints de inferencia estándar (`endpoints_compatible` en los tags).

## Casos de uso

- Asistente conversacional local en inglés: con las cuantizaciones Q4_K_M (9,2 GB) o Q5_K_M (10,8 GB) el modelo cabe en GPUs de consumo de 12-16 GB y puede gestionar diálogos multi-turno sin conexión a la nube, útil para prototipos y demos privadas.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q2_K (5,9 GB) o Q3_K_S (6,8 GB) permite ejecución en CPU con llama.cpp, adecuada para entornos de desarrollo con recursos limitados.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 11 variantes de cuantización, lo que facilita estudios de degradación de calidad frente a tamaño (por ejemplo, comparar Q4_K_M frente a Q8_0 en tareas de razonamiento).
- Integración en pipelines de generación de texto por lotes: al ser un modelo de 15B con licencia MIT, se puede incorporar en servicios internos de resumen, reescritura o clasificación sin restricciones comerciales.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, el modelo base en safetensors permite adaptaciones con LoRA y luego re-cuantizar a GGUF para despliegue.
- Experimentación educativa: el tamaño moderado (15B) y la disponibilidad de cuantizaciones ligeras lo hacen útil para cursos y talleres sobre inferencia local de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (los pesos deben caber en memoria, más overhead de contexto):
  - Q2_K: ~6 GB
  - Q3_K_M: ~7,5 GB
  - IQ4_XS: ~8,4 GB
  - Q4_K_M: ~9,2 GB
  - Q5_K_M: ~10,8 GB
  - Q6_K: ~12,4 GB
  - Q8_0: ~16 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080 / 4070 Ti (16 GB) para Q5_K_M o Q6_K; RTX 4060 Ti 16 GB o RTX 3080 (10-12 GB) para Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 8-12 GB; Q8_0 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles en la documentación consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apriel-R1P (este) | ~15B | No disponible | MIT | GGUF, safetensors | Inglés, conversacional |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (128K con RoPE) | Apache 2.0 | GGUF, safetensors | Multilingüe, muy extendido |
| Mistral-Nemo-12B-Instruct | 12B | 128.000 tokens | Apache 2.0 | GGUF, safetensors | Multilingüe, contexto largo |
| Phi-4 (14B) | 14,7B | 16.000 tokens | MIT | GGUF, safetensors | Razonamiento, inglés |

La comparación se ofrece a nivel de tamaño y licencia; no hay datos de benchmarks para Apriel-R1P que permitan comparar calidad. Qwen2.5-14B y Mistral-Nemo-12B cuentan con documentación mucho más completa, contexto largo verificado y amplia adopción comunitaria.

## Limitaciones y advertencias

- Documentación muy escasa: no hay model card detallada del modelo base en el repositorio GGUF, lo que dificulta evaluar su calidad real antes de desplegarlo.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Riesgo de alucinación: inherente a los LLM; sin benchmarks ni evaluaciones publicadas no se puede acotar su magnitud.
- Sesgos: no documentados; al no conocerse la composición del dataset de entrenamiento, no se pueden identificar sesgos específicos.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar que el modelo base (ConicCat/Apriel-R1P) mantiene la misma licencia y que no arrastra restricciones de datasets de terceros.
- El sufijo "R1P" sugiere razonamiento estilo R1, pero sin confirmación oficial; no asumir modo "thinking" explícito.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apriel-R1P-GGUF
- Modelo base: https://huggingface.co/ConicCat/Apriel-R1P
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Apriel-R1P-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Apriel-R1P-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
