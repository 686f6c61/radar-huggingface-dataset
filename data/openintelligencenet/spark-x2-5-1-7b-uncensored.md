# OpenIntelligenceNet/Spark-X2.5-1.7B-Uncensored

## Resumen

Spark-X2.5-1.7B-Uncensored es un modelo de lenguaje de 1.707.657.216 parámetros (1,7B) publicado por OpenIntelligenceNet en HuggingFace. Se trata de un ajuste fino de precisión completa y posterior fusión (merge) del modelo base XHToken/Spark-X2.5-1.7B, cuyo objetivo declarado es eliminar los comportamientos de rechazo y las restricciones de alineamiento estándar para responder de forma directa a consultas sensibles.

El autor indica que el ajuste se realizó sobre un conjunto de datos curado de 60.000 ejemplos "uncensored". El repositorio ocupa 3,4 GB y contiene pesos en formato safetensors, lo que resulta coherente con pesos en FP16/BF16 sin cuantizar. La licencia es Apache-2.0 y el modelo se distribuye con el tag custom_code, lo que implica que probablemente requiere cargar código personalizado del repositorio para su ejecución.

La relevancia de esta ficha es limitada en términos de ecosistema: el modelo acumula 0 descargas y 0 "likes" en el momento de la consulta, no publica resultados de benchmarks ni especifica arquitectura, contexto o idiomas soportados. Su interés principal radica en el caso de uso de modelos pequeños sin alineamiento de seguridad, no en un rendimiento verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no especifica tipo de transformer, MoE o SSM; el tag custom_code sugiere implementación propia) |
| Parámetros totales | 1.707.657.216 (1,7B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se publican cuantizaciones oficiales. El repositorio contiene únicamente pesos en precisión completa (3,4 GB, coherente con FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | XHToken/Spark-X2.5-1.7B |
| Fecha de creación | 2026-09-18 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no describe el tipo de red (transformer denso, MoE, híbrida u otra), la dimensión de las capas, el número de cabezas de atención ni el mecanismo de atención empleado. El repositorio incluye el tag custom_code, lo que indica que la carga del modelo requiere código propio del autor (habitualmente mediante `trust_remote_code=True`). El recuento de parámetros (1,7B) y el tamaño del repositorio (3,4 GB) son compatibles con pesos en FP16/BF16 de un modelo denso.

En cuanto al entrenamiento, la única información publicada es que se trata de un ajuste fino de precisión completa con fusión posterior sobre XHToken/Spark-X2.5-1.7B, usando 60.000 ejemplos sin censura con el objetivo de eliminar rechazos y restricciones de alineamiento. No se detalla la composición del dataset, el número total de tokens de entrenamiento, la receta de aprendizaje (tasa, épocas, precisión) ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto general, heredada del modelo base, aunque sin métricas publicadas que la cuantifiquen.
- Respuesta directa a consultas sensibles: el ajuste con 60.000 ejemplos sin censura busca eliminar los rechazos y las evasivas típicas de modelos alineados.
- Ajuste fino por fusión de pesos (merge), orientado a preservar la precisión original en FP16/BF16.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo "thinking", visión, audio): no disponible (no se documenta ninguna).

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo sirve como sujeto de estudio para comparar el comportamiento de un modelo sin alineamiento frente a su base XHToken/Spark-X2.5-1.7B, midiendo la tasa de rechazos en conjuntos de prompts sensibles.
- Generación de datos sintéticos para red-teaming: puede emplearse para producir respuestas a prompts que los modelos alineados rechazan, con el fin de construir conjuntos de evaluación de seguridad o de entrenar clasificadores de contenido.
- Pruebas de destilación y pipelines de evaluación: al ser un modelo de 1,7B en FP16 (3,4 GB), cabe en una GPU de consumo, lo que lo hace útil como banco de pruebas rápido para metodologías de evaluación sin necesidad de infraestructura dedicada.
- Análisis de contenido sensible en entornos controlados: en un pipeline interno con revisión humana, puede emplearse para clasificar o resumir material que otros modelos rechazan por política de contenido, siempre dentro del marco legal aplicable.
- Prototipado local en hardware modesto: con pesos en precisión completa ocupa unos 3,4 GB, por lo que puede ejecutarse en GPUs de 8 GB o superiores para experimentos de generación de texto de baja latencia.
- Estudio de técnicas de fusión de modelos: dado que el autor declara un merge sobre el modelo base, el repositorio puede interesar a quien investigue cómo afecta la fusión de pesos al comportamiento de rechazo y a la coherencia general.
- Evaluación comparativa de modelos pequeños sin alineamiento: sirve como punto de comparación frente a alternativas de 1-2B con alineamiento estándar en tareas de instrucciones abiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, y no se han localizado publicaciones externas con resultados. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en FP16/BF16 (pesos en safetensors, ~3,4 GB): aproximadamente 4-5 GB de VRAM con contextos cortos, sumando caché KV y overhead del runtime.
- VRAM estimada con cuantización de 8 bits (no publicada, conversión propia): alrededor de 1,8-2,2 GB.
- VRAM estimada con cuantización de 4 bits (no publicada, conversión propia): alrededor de 1,0-1,4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más para FP16, por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, L4 o A10G. Para cuantización de 4 bits bastan GPUs de 4-6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en FP16 y prácticamente en cualquiera con cuantización. También puede ejecutarse en CPU mediante llama.cpp si se convierte a GGUF, aunque dicha conversión no está publicada y el tag custom_code puede complicarla.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag custom_code), vLLM y TGI si la arquitectura es compatible, llama.cpp/Ollama previa conversión a GGUF. No hay artefactos de despliegue publicados por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparación se limita a especificaciones estructurales. Los datos de las alternativas proceden de información pública de sus respectivos repositorios y pueden variar según la versión consultada.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B-Uncensored | 1,71B | no disponible | Apache-2.0 | Sin alineamiento de seguridad (60.000 ejemplos) | No publicados |
| XHToken/Spark-X2.5-1.7B (base) | 1,71B | no disponible | no disponible | Modelo base del anterior | No publicados |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache-2.0 | Instrucciones generales, multilingüe | Publicados por el autor |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache-2.0 | Instrucciones generales, inglés | Publicados por el autor |
| Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales, multilingüe | Publicados por el autor |

La diferencia principal frente a estas alternativas no es de rendimiento ni de contexto, sino de política de contenido: Spark-X2.5-1.7B-Uncensored se distribuye explícitamente sin las restricciones de rechazo que sí aplican los modelos citados. A cambio, carece de benchmarks, de documentación de arquitectura y de tracción comunitaria (0 descargas, 0 likes).

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el modelo fue ajustado deliberadamente para eliminar rechazos, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin filtros. No es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: al ser un modelo de 1,7B sin benchmarks publicados, la fiabilidad factual no está verificada y se espera limitada.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un dataset sin censura de 60.000 ejemplos sin describir su procedencia, el riesgo de sesgos no controlados es alto.
- Idiomas y contexto: no disponibles. No se puede garantizar un comportamiento correcto en castellano ni en contextos largos.
- Incertidumbre sobre la arquitectura: el tag custom_code implica que la carga requiere ejecutar código del repositorio, lo que conlleva un riesgo de seguridad si no se audita previamente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero la licencia no exime al desplegador de su responsabilidad legal sobre el contenido generado. El autor no ofrece garantías.
- Madurez del repositorio: 0 descargas y 0 likes; no hay evidencia de validación por parte de la comunidad ni de mantenimiento posterior a la publicación.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ, GPTQ ni similares, por lo que el despliegue eficiente exige conversión propia.
- Fecha de creación registrada como 2026-09-18 en los metadatos, dato que conviene verificar en el repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenIntelligenceNet/Spark-X2.5-1.7B-Uncensored
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Perfil del autor: https://huggingface.co/OpenIntelligenceNet
- Paper, blog o repositorio adicional: no disponible. La búsqueda web realizada no devolvió enlaces relevantes al modelo (únicamente resultados no relacionados de Facebook).
