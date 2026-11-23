# mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF

## Resumen
Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF es una recopilación de cuantizaciones GGUF (con y sin imatrix) del modelo PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1, un fine-tune de la familia Qwen3.8 de aproximadamente 26.900 millones de parámetros. El autor de las cuantizaciones es mradermacher, un perfil habitual en Hugging Face especializado en generar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base combina varias técnicas de ajuste fino (etiquetadas como "Cold Fusion", "GAIN Training", "Multi-stage tuning" y "heretic") sobre un modelo Qwen de ~27B, con el objetivo declarado de producir un modelo "uncensored" orientado a "all use cases". La model card indica además que se trata de un modelo de visión, con ficheros mmproj disponibles en el repositorio estático del mismo autor.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde ~7,8 GB (IQ1_S) hasta formatos de mayor calidad, con licencia Apache 2.0. No obstante, la información pública disponible sobre el modelo base es muy limitada: no se documentan benchmarks, composición del dataset de entrenamiento ni detalles de la arquitectura más allá de su linaje Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen3.8; detalles no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ4_NL (small), entre otras; también imatrix |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento
El modelo base es un fine-tune de un modelo Qwen de ~27B parámetros, según se deduce del identificador ("Qwen3.8-27B") y de las etiquetas "qwen3_8" y "qwen3_6". La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención) ni el número de tokens de entrenamiento. Las etiquetas sugieren un proceso de ajuste en varias etapas ("Multi-stage tuning"), con técnicas denominadas "Cold Fusion" y "GAIN Training", y un paso de "abliteración"/"heretic" orientado a reducir los rechazos del modelo (uncensored).

No se documenta si hubo RLHF, DPO u otra fase de alineamiento, ni la composición del dataset. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. El autor de las cuantizaciones indica que se han generado cuantizaciones ponderadas con imatrix, lo que mejora la calidad de los formatos de baja precisión respecto a cuantizaciones estáticas.

## Capacidades
- Generación de texto conversacional multi-turno (etiqueta "conversational").
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión, con ficheros mmproj en el repositorio estático.
- Modo "uncensored": el ajuste "heretic" busca reducir las negativas del modelo ante peticiones sensibles.
- Orientado a "all use cases" según las etiquetas del autor, aunque sin evidencia de benchmarks que lo respalde.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: la model card solo declara inglés.

## Casos de uso
- Asistente conversacional local: con cuantizaciones i1-Q4_K_M (~16,8 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB, permitiendo conversaciones multi-turno sin depender de la nube.
- Procesamiento de imágenes con descripción textual: al ser un modelo de visión, puede emplearse para tareas de image captioning o respuesta a preguntas sobre imágenes, cargando el fichero mmproj junto con el GGUF en llama.cpp.
- Generación de texto creativo sin filtros: el ajuste "heretic" lo hace adecuado para escritura de ficción o guiones donde los modelos alineados suelen rechazar contenido sensible, siempre con revisión humana.
- Prototipado de aplicaciones con restricciones de privacidad: al ejecutarse en local con llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Investigación sobre alineamiento y censura: permite comparar el comportamiento del modelo "heretic" frente a su base alineada en tareas de evaluación de sesgos y rechazos.
- Despliegue en estaciones de trabajo con una sola GPU: las cuantizaciones IQ3/IQ4 (~12-16 GB) caben en GPUs de 16-24 GB, habilitando inferencia local para equipos de desarrollo sin infraestructura dedicada.
- Fine-tuning posterior o experimentación: al estar bajo Apache 2.0, puede usarse como base para ajustes adicionales o para investigación académica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada (solo pesos, sin caché KV): desde ~7,8 GB (i1-IQ1_S) hasta ~16,8 GB (i1-Q4_K_M); las cuantizaciones de mayor calidad (Q5/Q6) superan los 18-20 GB.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones IQ4/Q4_K_M con contexto moderado; A100 40/80 GB o H100 para cuantizaciones altas y contextos largos; RTX 3090 (24 GB) como alternativa de consumo.
- GPU de consumo: sí, cabe en RTX 4090/3090 con cuantizaciones IQ3-IQ4; en GPUs de 12-16 GB solo con cuantizaciones IQ2/IQ3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; también se menciona compatibilidad con MLX y endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 (este) | ~26,9B | no disponible | Apache 2.0 | GGUF / safetensors | Fine-tune uncensored con visión |
| Qwen2.5-32B-Instruct | ~32,8B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors / GGUF | Modelo oficial alineado de Qwen |
| Gemma 2 27B | ~27B | 8.192 tokens | Gemma license | safetensors / GGUF | Modelo de Google con restricciones de uso |
| Mistral Small 24B | ~24B | 32.768 tokens | Apache 2.0 | safetensors / GGUF | Alternativa europea de tamaño similar |

La comparación es orientativa: no hay benchmarks publicados de este fine-tune que permitan comparar rendimiento real frente a los modelos citados.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no se puede verificar la calidad del modelo frente a su base ni frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de ~27B, agravado por la falta de evaluación publicada.
- El ajuste "uncensored"/"heretic" puede aumentar la probabilidad de generar contenido inapropiado, sesgado o dañino; requiere moderación adicional en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin pruebas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento no están documentados, lo que dificulta evaluar riesgos legales.
- La model card del cuantizador es genérica y no aporta información sobre el proceso de entrenamiento del modelo base.
- El repositorio ocupa 305,8 GB, lo que implica descargas parciales por fichero.

## Enlaces
- Repositorio GGUF (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF
- Repositorio GGUF estático: https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF
- Modelo base: https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
