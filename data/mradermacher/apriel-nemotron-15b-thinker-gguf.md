# mradermacher/Apriel-Nemotron-15b-Thinker-GGUF

## Resumen

Apriel-Nemotron-15b-Thinker es un modelo de lenguaje de aproximadamente 15.000 millones de parámetros (14.974.182.400 exactos según los pesos safetensors), desarrollado originalmente por ServiceNow AI. La versión aquí documentada es una cuantización GGUF estática elaborada por mradermacher, pensada para facilitar el despliegue local del modelo original en entornos con recursos limitados. El modelo se enmarca en la familia Apriel-Nemotron, orientada a tareas de razonamiento, y el sufijo "Thinker" indica un enfoque explícito en modos de pensamiento estructurado.

El modelo resuelve el problema clásico de llevar un LLM de tamaño medio-alto (15B) a hardware de consumo: la cuantización GGUF permite ejecutarlo en GPUs de gama alta para consumidores o incluso en CPU con llama.cpp, algo inviable con los pesos en bf16 originales (que ocuparían en torno a 30 GB). La licencia MIT del modelo base y de la cuantización facilita el uso comercial sin restricciones adicionales.

Es relevante ahora porque los modelos de 15B con capacidades de razonamiento representan un punto dulce entre calidad y coste computacional, y porque la cuantización GGUF es hoy el estándar de facto para despliegues locales y edge. No obstante, la información técnica detallada sobre arquitectura, entrenamiento y benchmarks del modelo base no está incluida en los datos proporcionados, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ServiceNow-AI/Apriel-Nemotron-15b-Thinker; transformer presumible, no confirmado) |
| Parámetros totales | 14.974.182.400 (~15B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix ponderadas en repo separado (i1-GGUF) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); modelo base presumiblemente safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base ServiceNow-AI/Apriel-Nemotron-15b-Thinker: no se especifica si se trata de un transformer denso, un MoE, un modelo híbrido ni innovaciones concretas de atención. El nombre "Thinker" sugiere un entrenamiento orientado a razonamiento multi-paso o cadena de pensamiento, pero no hay datos confirmados sobre el proceso (número de tokens de entrenamiento, composición del dataset, RLHF, DPO, etc.).

En cuanto a esta ficha, lo relevante es el proceso de cuantización: mradermacher ha generado cuantizaciones GGUF estáticas (sin imatrix) a partir de los pesos del modelo original, con versiones desde Q2_K (5,9 GB) hasta Q8_0 (16,0 GB). Las cuantizaciones ponderadas por imatrix, que suelen ofrecer mejor relación calidad/tamaño a igual bit-width, se publican en un repositorio separado (Apriel-Nemotron-15b-Thinker-i1-GGUF). El proceso usa convert_type hf y quantize_version 2 según los metadatos de la model card.

## Capacidades

- Generación de texto conversacional (pipeline declarado: conversational en los tags).
- Razonamiento orientado a "thinking" (según la denominación del modelo; no verificable con datos de benchmarks).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con Hugging Face Inference Endpoints.
- Uso con transformers y llama.cpp/Ollama gracias al formato GGUF.
- Capacidades de tool calling, agentes, visión, audio o matemáticas: no disponibles en la información proporcionada.
- Multilingüismo: limitado al inglés según la model card; no se confirman otros idiomas.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (9,2 GB) el modelo cabe en GPUs de consumo de 12-16 GB de VRAM, permitiendo prototipado offline sin depender de APIs en la nube.
- Asistente conversacional autoalojado: al ser un modelo conversacional en inglés, encaja en chatbots internos o herramientas de productividad donde la soberanía del dato es requisito (por ejemplo, entornos con datos sensibles que no pueden salir a servicios externos).
- Evaluación de razonamiento en pipelines de investigación: el sufijo "Thinker" sugiere uso en tareas que requieren cadenas de razonamiento; útil para comparar la calidad de distintas cuantizaciones (Q4_K_M vs Q6_K vs Q8_0) sobre el mismo prompt de razonamiento.
- Integración en CI/CD para generación de código o documentación técnica: aunque no se confirma tool calling, el modelo puede usarse como generador de texto en scripts de automatización vía llama.cpp o servidores compatibles con OpenAI API.
- Servicio de inferencia con vLLM/TGI para equipos pequeños: el modelo base en safetensors puede servirse con motores de alta concurrencia; la versión GGUF sirve como alternativa para hardware modesto.
- Base para fine-tuning posterior: la licencia MIT y los pesos abiertos permiten adaptar el modelo a dominios específicos (legal, sanitario, atención al cliente) sin restricciones comerciales.
- Despliegue en entornos edge o air-gapped: al poder ejecutarse en CPU con llama.cpp en su versión Q2_K (5,9 GB), es viable en máquinas sin GPU dedicada o con conectividad restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ≈ 5,9 GB; Q3_K_M ≈ 7,5 GB; Q4_K_M ≈ 9,2 GB; Q5_K_M ≈ 10,8 GB; Q6_K ≈ 12,4 GB; Q8_0 ≈ 16,0 GB (más overhead de contexto y KV cache).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q4_K_M/Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 12 GB para Q4_K_S.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB (Q2_K/Q3_K_S con contexto corto) hasta 24 GB (Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con OpenAI API basados en llama.cpp; el modelo base en safetensors con transformers, vLLM o TGI (no confirmado para esta arquitectura concreta).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apriel-Nemotron-15b-Thinker (esta ficha, GGUF) | ~15B | no disponible | MIT | GGUF | Cuantizaciones estáticas de 5,9 a 16 GB |
| Modelo base ServiceNow-AI/Apriel-Nemotron-15b-Thinker | ~15B | no disponible | MIT | safetensors | Pesos completos, sin cuantizar |
| Alternativas de ~14-15B (p. ej. Qwen2.5-14B, Phi-4-14B) | ~14-15B | 32K-128K (según modelo) | Apache 2.0 / MIT (según modelo) | safetensors/GGUF | No comparables directamente por falta de benchmarks del modelo Apriel |

No se dispone de datos de rendimiento del modelo Apriel-Nemotron-15b-Thinker que permitan una comparación cuantitativa fiable con alternativas; la tabla anterior solo recoge datos de disponibilidad y licencia.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Arquitectura y entrenamiento no documentados en la información disponible: no se puede verificar el modo "thinking" ni la calidad del razonamiento sin benchmarks.
- Riesgo de alucinación: inherente a los LLM de esta escala; no hay datos específicos de mitigación.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- Las cuantizaciones estáticas pueden ser inferiores a las imatrix a igual tamaño; si la calidad es crítica, conviene usar el repositorio i1-GGUF.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base por si se añaden restricciones adicionales (no indicadas en los datos).
- Contexto máximo no disponible: no se puede planificar el uso en conversaciones largas sin verificar la model card del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apriel-Nemotron-15b-Thinker-GGUF
- Modelo base: https://huggingface.co/ServiceNow-AI/Apriel-Nemotron-15b-Thinker
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Apriel-Nemotron-15b-Thinker-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Apriel-Nemotron-15b-Thinker-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
