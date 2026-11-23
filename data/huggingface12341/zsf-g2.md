# huggingface12341/zsf-g2

## Resumen

zsf-g2 es un modelo de extracción de características (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge de tres modelos base: agentscope-ai/Piccolo-9B, joamCriff123/zils-flash-f1123b y morriszjm/Tacit-9B, todos ellos etiquetados bajo la arquitectura qwen3_5. El resultado es un modelo de aproximadamente 8.390 millones de parámetros (8,39B) empaquetado en safetensors con un tamaño de repositorio de 16,8 GB, lo que sugiere pesos en precisión BF16 o FP16.

El modelo se distribuye con licencia Apache 2.0, pero el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargarlo. La ficha se publicó el 23 de noviembre de 2026 y no registra descargas ni interacciones en el momento de redactar este análisis, lo que indica que se trata de un artefacto reciente y sin validación comunitaria.

La relevancia de zsf-g2 es limitada y fundamentalmente experimental: al ser un merge de modelos sin documentación técnica asociada, sin model card detallada y sin benchmarks publicados, su interés principal reside en el estudio de técnicas de fusión de pesos y en la evaluación comparativa frente a sus modelos progenitores. No debe confundirse con un modelo instructivo o conversacional listo para producción, ya que su pipeline declarado es feature-extraction.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags del repositorio); no se detalla la variante exacta |
| Parámetros totales | 8.392.695.024 (8,39B) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el tamaño de 16,8 GB sugiere BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | merge de agentscope-ai/Piccolo-9B, joamCriff123/zils-flash-f1123b y morriszjm/Tacit-9B |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Código personalizado | sí (tag custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5, que remite a la familia Qwen 3.5 de Alibaba. No se especifica si se trata de un transformer denso, un modelo híbrido con atención lineal o una variante MoE. El dato de parámetros totales (8,39B) y el tamaño del repositorio (16,8 GB) son compatibles con un transformer denso de ~8B en BF16.

El modelo es el resultado de una fusión (merge) de tres checkpoints: Piccolo-9B de agentscope-ai, zils-flash-f1123b de joamCriff123 y Tacit-9B de morriszjm. No se documenta la técnica de merge empleada (SLERP, TIES, DARE, model stock u otra), ni la proporción de pesos de cada progenitor, ni si hubo un paso posterior de fine-tuning o alineación (RLHF/DPO). Tampoco se especifican los datos de entrenamiento, el número de tokens procesados ni la composición del corpus. La etiqueta decision-model y el pipeline feature-extraction sugieren que el modelo está orientado a producir representaciones o puntuaciones más que a generar texto libre, pero no hay documentación que lo confirme.

## Capacidades

- Extracción de características y representaciones vectoriales (pipeline declarado: feature-extraction).
- Etiquetado como decision-model, lo que sugiere uso en tareas de clasificación o puntuación, aunque no se detalla el mecanismo.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue como servicio HTTP.
- Requiere código personalizado (custom_code), por lo que la carga exige `trust_remote_code=True`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se declara soporte de thinking mode, audio ni modalidades adicionales.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: el modelo puede emplearse para generar representaciones vectoriales de documentos y consultas, aprovechando su pipeline de feature-extraction para construir índices vectoriales en sistemas RAG.
- Clasificación de textos en pipelines de NLP: dado su etiquetado como decision-model, puede integrarse como cabecera de clasificación sobre las representaciones extraídas, por ejemplo para moderación de contenido o enrutamiento de tickets.
- Experimentación con técnicas de merge: investigadores interesados en fusión de pesos pueden usar zsf-g2 como caso de estudio para comparar el comportamiento del merge frente a sus tres modelos progenitores.
- Evaluación comparativa de checkpoints: sirve como baseline adicional en estudios que midan el efecto de la fusión sobre la calidad de las representaciones en tareas downstream.
- Prototipado de sistemas de recomendación basados en similitud: los embeddings generados permiten calcular similitud coseno entre ítems y usuarios en fases tempranas de desarrollo.
- Reproducción de experimentos académicos: al estar bajo Apache 2.0 y disponible vía transformers, puede incorporarse en cuadernos de investigación sobre representaciones latentes, siempre que se acepte la condición de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,8 GB solo para los pesos, más overhead de activaciones y contexto; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8,5-9 GB (estimación teórica, no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas para BF16: NVIDIA A100 40/80 GB, H100, L40S o RTX 6000 Ada.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) también es viable. Para GPUs de 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM y TGI si el código personalizado es compatible; llama.cpp/Ollama solo si existen conversiones GGUF publicadas (no disponibles en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsf-g2 | 8,39B | no disponible | Apache 2.0 | gated | Merge de tres checkpoints; feature-extraction |
| agentscope-ai/Piccolo-9B | ~9B (según nombre) | no disponible | no disponible | no disponible | Progenitor del merge |
| joamCriff123/zils-flash-f1123b | no disponible | no disponible | no disponible | no disponible | Progenitor del merge |
| morriszjm/Tacit-9B | ~9B (según nombre) | no disponible | no disponible | no disponible | Progenitor del merge |

No se dispone de datos de rendimiento de ninguno de los modelos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, tokens, técnica de merge ni proceso de alineación.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede ralentizar su adopción en pipelines automatizados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; debe auditarse antes de usarlo en producción.
- Riesgo de sesgos y alucinaciones desconocido, al no documentarse el corpus de entrenamiento ni evaluaciones de seguridad.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no especificada, lo que impide planificar su uso en tareas de contexto largo.
- Sin descargas ni likes en el momento del análisis: no hay validación comunitaria que respalde su funcionamiento.
- Aunque la licencia es Apache 2.0, la condición de acceso gated puede imponer términos adicionales que deben revisarse antes de un uso comercial.
- Al ser un merge sin verificación, existe riesgo de degradación de capacidades respecto a los modelos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsf-g2
- Modelo base Piccolo-9B: https://huggingface.co/agentscope-ai/Piccolo-9B
- Modelo base zils-flash-f1123b: https://huggingface.co/joamCriff123/zils-flash-f1123b
- Modelo base Tacit-9B: https://huggingface.co/morriszjm/Tacit-9B
