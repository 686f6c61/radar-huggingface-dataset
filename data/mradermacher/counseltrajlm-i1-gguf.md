# mradermacher/CounselTrajLM-i1-GGUF

## Resumen

CounselTrajLM-i1-GGUF es una cuantización en formato GGUF del modelo CounselTrajLM, desarrollada por el usuario mradermacher (conocido en el ecosistema por publicar versiones cuantizadas de modelos para su uso con llama.cpp y derivados). El modelo base, publicado por UEC-InabaLab, es un modelo conversacional de aproximadamente 8.950 millones de parámetros (8,95 B), lo que lo sitúa en la categoría de modelos de tamaño medio aptos para despliegue en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio ofrece un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K, incluyendo variantes iMatrix) que permiten ejecutar un modelo de casi 9 B en GPUs con VRAM limitada o incluso en CPU, manteniendo el formato GGUF compatible con llama.cpp, Ollama y servidores compatibles con la API de endpoints.

No obstante, la información pública disponible es muy escasa: la model card del repositorio cuantizado se limita a metadatos técnicos de la cuantización y no aporta datos sobre arquitectura, datos de entrenamiento, licencia ni benchmarks. Por tanto, esta ficha se limita a documentar lo verificable y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: CounselTrajLM de UEC-InabaLab; arquitectura no especificada en la información disponible) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (cuantizaciones ponderadas/con iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo base CounselTrajLM más allá de su naturaleza conversacional (etiqueta "conversational" en el repositorio). No consta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones técnicas.

Lo que sí es verificable es el proceso de cuantización: el repositorio incluye cuantizaciones ponderadas con iMatrix (importancia matricial), una técnica que calcula la importancia de cada peso para reducir la pérdida de calidad en cuantizaciones agresivas. Los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión se realizó a partir de pesos en formato Hugging Face. El repositorio ocupa 56,7 GB, coherente con la inclusión de múltiples variantes de cuantización de un modelo de 8,95 B.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse mediante infraestructura compatible con la API de Hugging Face (TGI o similares).
- Ejecución local mediante GGUF: compatible con llama.cpp, Ollama y otros runners que consumen formato GGUF.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Razonamiento matemático y generación de código: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional en hardware de consumo: gracias a las cuantizaciones Q4_K_M e IQ4_XS, un modelo de 8,95 B puede ejecutarse en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, permitiendo prototipar asistentes de diálogo sin infraestructura de servidor.
- Experimentación con cuantizaciones agresivas en entornos con VRAM muy limitada: las variantes IQ1_S, IQ1_M e IQ2_XXS permiten probar el modelo en GPUs de gama baja o en CPU, a costa de una pérdida de calidad que debe evaluarse empíricamente.
- Integración en pipelines de inferencia local con API compatible: el tag `endpoints_compatible` facilita conectarlo a frameworks que esperan una API estilo OpenAI/Hugging Face para pruebas de integración.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de 20 variantes, lo que permite medir la degradación de calidad (perplejidad, coherencia conversacional) entre cuantizaciones sobre el mismo modelo base.
- Investigación sobre modelos conversacionales de tamaño medio: útil para estudiar el comportamiento de un modelo de 8,95 B en tareas de diálogo, siempre que se valide previamente su calidad con benchmarks propios.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse localmente en formato GGUF, los datos de conversación no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de 8,95 B y cuantización):
  - IQ1_S / IQ1_M: ~2-3 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~3-4 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: ~4-5 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / small-IQ4_NL: ~5-6 GB.
  - Q5_K_S / Q5_K_M: ~6-7 GB.
  - Q6_K: ~7-8 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en el ámbito profesional, A100 o H100 para servir varias instancias o contextos largos.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_M e inferiores caben en GPUs de 6-8 GB; las variantes Q5 y Q6 requieren 8 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de endpoints de Hugging Face (según el tag del repositorio), y cualquier runner que soporte GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base (contexto, licencia, idiomas) que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| CounselTrajLM-i1-GGUF | 8,95 B | no disponible | no disponible | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información insuficiente: la model card no documenta arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: al no constar la licencia, no puede confirmarse el uso comercial; debe verificarse en el repositorio del modelo base (UEC-InabaLab/CounselTrajLM) antes de cualquier despliegue.
- Riesgo de alucinación: no evaluado; sin benchmarks ni documentación, no hay garantías sobre la fiabilidad factual del modelo.
- Sesgos: no documentados.
- Degradación por cuantización: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia conversacional; se recomienda validar con evaluaciones propias antes de usar en producción.
- Contexto e idiomas desconocidos: no puede confirmarse el soporte multilingüe ni la ventana de contexto real.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria, lo que aumenta el riesgo de que el modelo no haya sido probado ampliamente.
- Fecha de creación futura (2026-11-20): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar metadatos inconsistentes o un entorno de pruebas; conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/CounselTrajLM-i1-GGUF
- Modelo base: https://huggingface.co/UEC-InabaLab/CounselTrajLM
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
