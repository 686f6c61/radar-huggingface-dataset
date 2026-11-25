# mradermacher/DaisyRose-27B-Heretic-v2-GGUF

## Resumen

DaisyRose-27B-Heretic-v2-GGUF es la versión cuantizada en formato GGUF del modelo kelsey1337/DaisyRose-27B-Heretic-v2, un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26,9B) derivado de la familia Qwen (etiquetado como "qwen3.8" en los tags del autor). El modelo base ha sido sometido a un proceso de "abliteration" (eliminación de las capas de rechazo o *refusal*) mediante la técnica denominada "Heretic", orientado a producir un modelo sin censura ("uncensored") para generación de texto conversacional en inglés.

La versión que nos ocupa ha sido generada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad, e incluye un conjunto amplio de cuantizaciones que van desde Q2_K (11,2 GB) hasta Q8_0 (28,7 GB), además de complementos multimodales mmproj (proyector de visión) en Q8_0 y f16. Está publicada bajo licencia Apache 2.0 y solo declara soporte para inglés.

Es relevante ahora porque permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones agresivas (Q4_K_M ocupa 16,8 GB), y porque los modelos "abliterated/uncensored" son objeto de interés tanto para investigación sobre alineamiento y seguridad como para desarrolladores que necesitan un modelo sin restricciones de rechazo para tareas de generación creativa o análisis de contenido sensible. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen; etiqueta "qwen3.8" en los tags). Detalles específicos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 (multimodal) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es kelsey1337/DaisyRose-27B-Heretic-v2, un modelo de aproximadamente 26,9B parámetros construido sobre una arquitectura transformer de la familia Qwen (según la etiqueta "qwen3.8"). Ha sido modificado mediante la técnica "Heretic" de abliteration, que consiste en identificar y neutralizar las direcciones de activación asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO tras la abliteration.

La versión GGUF ha sido producida por mradermacher mediante cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando las variantes listadas en la tabla anterior. Adicionalmente, el autor ofrece cuantizaciones ponderadas/imatrix en un repositorio separado (DaisyRose-27B-Heretic-v2-i1-GGUF). Se incluyen ficheros mmproj (proyector multimodal) en Q8_0 y f16, lo que sugiere que el modelo base incorpora capacidades de visión, aunque la model card no detalla su funcionamiento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Modelo "uncensored"/abliterated: no aplica las capas de rechazo habituales, por lo que responde a peticiones que un modelo alineado estándar rechazaría.
- Soporte multimodal aparente: la presencia de ficheros mmproj (Q8_0 y f16) indica capacidad de procesamiento de imágenes, aunque no se detalla en la model card.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue como servicio.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso o modo "thinking".
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, temas controvertidos) donde un modelo alineado estándar aplicaría rechazos; el proceso de abliteration elimina esas barreras.
- Investigación sobre alineamiento y seguridad: análisis comparativo del comportamiento de un modelo abliterated frente a su versión alineada, útil para estudiar qué direcciones de activación codifican el rechazo y cómo afecta la supresión a otras capacidades.
- Análisis de contenido sensible: clasificación, resumen o extracción de información de textos que contienen material potencialmente ofensivo, donde los modelos censurados se niegan a procesar la entrada.
- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (16,8 GB) el modelo cabe en una GPU de consumo de 24 GB (RTX 3090/4090) o en configuraciones con offload parcial a CPU, permitiendo un asistente conversacional privado sin dependencia de API.
- Prototipado de chatbots de personaje: el modelo base "DaisyRose" y su naturaleza sin censura lo hacen adecuado para role-play y personajes conversacionales con libertad expresiva, usando llama.cpp u Ollama para servir la inferencia.
- Evaluación de cuantizaciones: la disponibilidad de once variantes GGUF permite a investigadores medir el impacto de la cuantización (de Q2_K a Q8_0) en la perplejidad y la calidad de generación sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño del fichero + overhead de contexto/KV cache):
  - Q2_K: ~11,2 GB, apto para GPU de 12-16 GB.
  - Q3_K_M: ~13,6 GB, apto para GPU de 16 GB.
  - Q4_K_S / IQ4_XS: ~15,5-15,7 GB, ajustado en GPU de 16 GB, holgado en 24 GB.
  - Q4_K_M: ~16,8 GB, recomendado para RTX 3090/4090 (24 GB).
  - Q5_K_M: ~19,4 GB, requiere 24 GB.
  - Q6_K: ~22,2 GB, requiere 24 GB con margen limitado.
  - Q8_0: ~28,7 GB, requiere GPU de 32 GB o superior (A100 40 GB, RTX 5090, etc.).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4-Q6; A100 40/80 GB, H100 o L40S para Q8_0 y contexto largo; GPU de 12-16 GB (RTX 4070 Ti Super, RTX 4080) para Q2_K/Q3.
- Cabe en GPU de consumo: sí, desde Q2_K en 12 GB hasta Q6_K en 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; servidores compatibles con endpoints OpenAI (tag "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa completa, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-Heretic-v2-GGUF | ~26,9B | No disponible | Apache 2.0 | GGUF | Abliterated, multimodal (mmproj), solo inglés |
| Modelo base kelsey1337/DaisyRose-27B-Heretic-v2 | ~26,9B | No disponible | Apache 2.0 | Safetensors | Mismo modelo sin cuantizar; requiere más VRAM |
| Qwen2.5-32B-Instruct (referencia de familia) | ~32B | 128K (según versión) | Apache 2.0 | Safetensors, GGUF | Alineado estándar, multilingüe; no abliterated |
| mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF | ~26,9B | No disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas de mayor calidad |

La comparación directa con modelos de la familia Qwen se ofrece solo como referencia de categoría; no se dispone de datos de rendimiento que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica rechazos de seguridad, por lo que puede generar contenido dañino, ilegal, ofensivo o sexualmente explícito. No es apto para aplicaciones de cara al público sin capas de moderación externas.
- La abliteration puede degradar capacidades generales (razonamiento, seguimiento de instrucciones) respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo elevado de alucinación: no se documentan datos de entrenamiento ni evaluaciones de fidelidad.
- Soporte únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada; planificar el despliegue con contexto conservador hasta verificarla empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el desarrollador asume la responsabilidad legal y ética del contenido generado por un modelo sin alineamiento.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- El repositorio ocupa 189,4 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.
- Solo 1 like y ~2.631 descargas en el momento de la ficha: modelo de nicho con escasa validación comunitaria.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-GGUF
- Modelo base: https://huggingface.co/kelsey1337/DaisyRose-27B-Heretic-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DaisyRose-27B-Heretic-v2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#DaisyRose-27B-Heretic-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
