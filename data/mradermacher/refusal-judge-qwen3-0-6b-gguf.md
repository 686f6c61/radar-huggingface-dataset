# mradermacher/Refusal-Judge-Qwen3-0.6B-GGUF

## Resumen

Refusal-Judge-Qwen3-0.6B es un modelo de clasificacion de texto de 596.049.920 parametros (aproximadamente 0,6 mil millones) derivado de la familia Qwen3 y afinado especificamente para la deteccion de negativas (refusals) en respuestas de modelos de lenguaje. Lo desarrolla el autor gyr0zepp y esta cuantizado en formato GGUF por mradermacher, un conocido publicador de cuantizaciones estaticas para llama.cpp. Su proposito es actuar como juez automatico (LLM-as-a-judge) dentro de pipelines de evaluacion de seguridad: determinar si una respuesta de otro modelo constituye una negativa a cumplir una peticion.

El modelo resulta relevante porque la deteccion fiable de refusals es una pieza critica en la evaluacion de alineamiento y seguridad de LLMs, y tradicionalmente se ha resuelto con clasificadores grandes o con heuristicas fragiles. Un juez de solo 0,6B parametros, cuantizado a menos de 1 GB en Q4_K_M, permite ejecutar esa evaluacion en CPU o en GPUs de consumo, integrarla en suites de test automatizadas y procesar grandes volumenes de pares prompt-respuesta con coste minimo.

La ficha describe la version GGUF publicada por mradermacher, que ofrece doce cuantizaciones estaticas (desde Q2_K hasta f16) del modelo base original en transformers. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, con fine-tuning para clasificacion de texto) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en transformers/safetensors |
| Tamano del repo | 5,7 GB (conjunto de todas las cuantizaciones) |
| Pipeline | text-classification |
| Modelo base | gyr0zepp/Refusal-Judge-Qwen3-0.6B |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3 de 0,6B parametros, una arquitectura transformer decoder-only, adaptada mediante fine-tuning al pipeline de clasificacion de texto. Segun las etiquetas de la model card, el entrenamiento combina destilacion (distillation) y tecnicas de abliteration, orientadas a producir un juez especializado en refusal-detection dentro de flujos de evaluacion de seguridad. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica generada por mradermacher con su herramienta de conversion desde el modelo HF original. La model card indica que no se han publicado (por este autor) cuantizaciones ponderadas con imatrix, y que las disponibles son estaticas. No se documentan innovaciones arquitectonicas adicionales mas alla de las propias de la familia Qwen3.

## Capacidades

- Clasificacion de texto orientada a deteccion de refusals: determina si una respuesta de un LLM constituye una negativa a cumplir la peticion.
- Uso como juez automatico (LLM-as-a-judge) en pipelines de evaluacion de seguridad y alineamiento.
- Evaluacion de seguridad (safety-evaluation) de respuestas generadas por otros modelos.
- Ejecucion local eficiente gracias a las cuantizaciones GGUF para llama.cpp.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y uso conversacional.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Evaluacion de alineamiento en suites de test: el modelo clasifica cada respuesta de un LLM evaluado como refusal o no-refusal, permitiendo medir tasas de negativa ante prompts sensibles de forma automatizada y reproducible.
- Auditoria de seguridad en produccion: integrado como paso de validacion sobre las respuestas de un asistente desplegado, detecta negativas y permite monitorizar cambios en el comportamiento del modelo tras actualizaciones.
- Investigacion sobre abliteration y refusal: al ser un juez especializado y ligero, sirve para medir el efecto de intervenciones de abliteration sobre la tasa de negativas de un modelo.
- Red teaming a escala: procesar grandes lotes de pares prompt-respuesta en CPU o GPU de consumo con cuantizaciones de menos de 1 GB, abaratando la evaluacion masiva.
- Construccion de datasets de evaluacion: etiquetar automaticamente respuestas como refusal/no-refusal para generar corpus de entrenamiento o benchmark de seguridad.
- Control de calidad en pipelines de RLHF/DPO: filtrar o ponderar pares de preferencia segun si la respuesta constituye una negativa, como señal auxiliar en el entrenamiento.
- Despliegue en entornos con recursos limitados: ejecucion en llama.cpp sobre hardware modesto, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB con Q2_K a Q5_K_M, 0,6 GB con Q6_K, 0,7 GB con Q8_0 y 1,3 GB con f16.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU, dado el reducido tamano del modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para las cuantizaciones pequenas; para f16 basta con 2 GB. No requiere A100 ni H100.
- Opciones de despliegue: llama.cpp y derivados (Ollama, llama-cpp-python, LM Studio); el modelo base en transformers para uso con la libreria original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (0,6B) se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de modelos comparables directos (jueces de refusal de tamano similar). Se indica "no disponible" para la comparativa cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Refusal-Judge-Qwen3-0.6B (este) | 596 M | no disponible | Apache 2.0 | GGUF / safetensors | Juez especializado en refusal-detection |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Es un modelo especializado en una tarea estrecha (deteccion de refusals); no debe usarse como modelo generativo general.
- No se han publicado benchmarks ni metricas de precision/recall, por lo que su fiabilidad como juez no esta cuantificada en la informacion disponible.
- Riesgo de sesgo y de alucinacion en la clasificacion: al ser un modelo pequeno afinado, puede producir falsos positivos o negativos en casos limite; se recomienda validacion con un conjunto etiquetado propio antes de usarlo en produccion.
- La model card menciona tecnicas de abliteration y destilacion; conviene revisar el modelo base original para entender el proceso y sus posibles efectos sobre el comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia y condiciones del modelo base original.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la precision de clasificacion; para evaluacion critica se recomienda Q5_K_M, Q6_K o Q8_0.
- No se documentan limitaciones de longitud de contexto; el dato no esta disponible.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Refusal-Judge-Qwen3-0.6B-GGUF
- Modelo base original: https://huggingface.co/gyr0zepp/Refusal-Judge-Qwen3-0.6B
- Pagina de descargas del autor: https://hf.tst.eu/model#Refusal-Judge-Qwen3-0.6B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
