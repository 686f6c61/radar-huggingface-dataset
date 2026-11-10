# mradermacher/shennong-1.5b-sft-GGUF

## Resumen

Shennong-1.5b-sft es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) especializado en medicina y, más concretamente, en medicina tradicional y etnofarmacología. El modelo original fue desarrollado por el usuario `cptlight` y esta ficha describe la versión cuantizada en formato GGUF publicada por `mradermacher`, un conocido distribuidor de cuantizaciones para llama.cpp. El modelo base es `cptlight/shennong-1.5b-sft`, construido sobre la arquitectura Qwen2 y ajustado mediante LoRA según las etiquetas de la model card.

La relevancia de esta publicación radica en que pone a disposición de la comunidad un modelo de dominio médico muy ligero (1,5B) en cuantizaciones que van desde 0,8 GB hasta 3,2 GB, lo que permite ejecutarlo en hardware de consumo modesto e incluso en CPU. Está pensado para consultas sobre fitoterapia, farmacopea tradicional china y etnofarmacología, en inglés y chino.

Se trata de una cuantización estática (sin imatrix ni quants ponderados, según indica el autor), con licencia Apache 2.0 y compatibilidad con llama.cpp y endpoints. No se han publicado datos de benchmarks ni especificaciones detalladas de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2, según etiquetas de la model card) |
| Parámetros totales | 1.543.714.304 (~1,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only, con aproximadamente 1,5 mil millones de parámetros. Según las etiquetas de la model card, el ajuste se realizó mediante LoRA (Low-Rank Adaptation) sobre el modelo base `cptlight/shennong-1.5b-sft`, lo que sugiere un fine-tuning eficiente en parámetros orientado al dominio médico y, específicamente, a medicina tradicional y etnofarmacología. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La publicación que nos ocupa es una cuantización estática realizada por `mradermacher` con `quantize_version: 2` y `convert_type: hf`, generando 12 variantes GGUF desde Q2_K hasta f16. El autor indica explícitamente que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y chino, con orientación al dominio médico.
- Consultas sobre medicina tradicional, fitoterapia y etnofarmacología.
- Conversación multi-turno (etiqueta `conversational`).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Ejecutable mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Consulta de fitoterapia y farmacopea tradicional: el modelo puede responder preguntas sobre plantas medicinales, preparaciones y usos tradicionales en inglés o chino, aprovechando su ajuste específico en etnofarmacología y su reducido tamaño para despliegue local.
- Asistente de documentación etnofarmacológica: útil para resumir o estructurar información sobre remedios tradicionales en entornos de investigación, ejecutándose en portátiles sin GPU dedicada gracias a las cuantizaciones de 0,8–1,2 GB.
- Prototipado rápido en investigación médica: al ser un modelo de 1,5B con licencia Apache 2.0, permite experimentar con pipelines de NLP médico en local antes de escalar a modelos mayores.
- Educación y divulgación: puede emplearse como chatbot divulgativo sobre medicina tradicional en aplicaciones web o móviles con recursos limitados, usando la cuantización Q4_K_M (1,1 GB).
- Despliegue en dispositivos de borde: la variante Q2_K (0,8 GB) o Q3_K_S (0,9 GB) permite ejecución en Raspberry Pi o dispositivos con poca memoria, para consultas offline de referencia.
- Integración en herramientas de escritorio: mediante llama.cpp u Ollama, puede incorporarse a asistentes locales de escritorio para consultas sobre plantas medicinales sin conexión a internet.
- Evaluación comparativa de modelos de dominio: sirve como baseline ligero en experimentos que comparen modelos especializados frente a modelos generalistas en tareas de conocimiento médico tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,0–1,1 GB (Q4_K_S/Q4_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16), sin contar el overhead del contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2–4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede usarse con transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño (1,5B) se espera inferencia en tiempo real en CPU moderna y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| shennong-1.5b-sft (esta ficha) | ~1,5B | no disponible | Apache 2.0 | GGUF / safetensors | Medicina tradicional y etnofarmacología |
| Qwen2-1.5B-Instruct | ~1,5B | 32.768 tokens (según Qwen2) | Apache 2.0 | safetensors / GGUF | Generalista, multilingüe |
| BioMistral-7B | ~7B | 2.048–4.096 tokens | Apache 2.0 (según variante) | safetensors / GGUF | Médico generalista |
| Meditron-7B | ~7B | ~4.096 tokens | Llama 2 (restrictiva) | safetensors | Médico generalista |

Nota: los datos de los modelos comparativos proceden de conocimiento general y no de la información proporcionada en esta búsqueda; verifíquelos en sus respectivas model cards. El modelo de esta ficha destaca por su tamaño reducido y su especialización en medicina tradicional, pero carece de datos públicos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas médicas es desconocido y no verificable.
- Riesgo elevado de alucinación en un dominio sensible como la medicina; no debe usarse como fuente de consejo médico sin supervisión de profesionales.
- Sesgos potenciales derivados del corpus de entrenamiento (probablemente centrado en fuentes chinas de medicina tradicional), con posible infrarrepresentación de otras tradiciones médicas.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con documentos largos.
- Las cuantizaciones son estáticas y sin imatrix; las variantes de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la naturaleza médica del contenido exige revisión regulatoria y avisos legales en cualquier producto en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- La fecha de creación indicada (2026) resulta anómala; conviene verificar la procedencia y el estado del repositorio antes de confiar en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/shennong-1.5b-sft-GGUF
- Modelo base: https://huggingface.co/cptlight/shennong-1.5b-sft
- Página de resumen del autor: https://hf.tst.eu/model#shennong-1.5b-sft-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
