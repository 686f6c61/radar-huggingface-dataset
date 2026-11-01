# Alyazka/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF

## Resumen

Alyazka/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF es una distribución de cuantizaciones GGUF del modelo llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic, que a su vez es una versión "decensored" (abliterated) de google/gemma-4-E4B-it. El trabajo de eliminación de rechazos se realizó con la herramienta Heretic v1.2.0 aplicando el método Arbitrary-Rank Ablation (ARA) sobre el modelo original de Google. El resultado es un modelo multimodal (pipeline any-to-any, con soporte image-text-to-text) de aproximadamente 7.518 millones de parámetros totales, orientado a conversación y generación de contenido sin las restricciones de rechazo del modelo base.

El interés de esta ficha reside en dos aspectos: por un lado, documenta un caso de "abliteration" con métricas de evaluación publicadas (reducción de rechazos del 99/100 al 3/100 con divergencia KL de 0.0076 y pérdida mínima en MMLU y PIQA); por otro, ofrece cuantizaciones GGUF listas para desplegar en entornos con recursos limitados mediante llama.cpp u Ollama, algo relevante para quienes necesitan un modelo multimodal pequeño y sin filtros de contenido.

La licencia declarada en el repositorio es apache-2.0, aunque la model card enlaza a la licencia de Gemma 4 de Google, lo que introduce una ambigüedad que conviene revisar antes de un uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any, image-text-to-text); detalles internos no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 47.1 GB |
| Libreria declarada | transformers |
| Modelo base | llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic |
| Modelo original | google/gemma-4-E4B-it |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 E4B, un transformer multimodal de Google con capacidad de procesar imagen y texto (pipeline any-to-any). No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento original en la información proporcionada. El modelo base es de tipo instruct (sufijo -it), por lo que se asume un ajuste supervisado y posiblemente optimización por preferencias, aunque los detalles concretos no están disponibles.

La innovación técnica documentada es el proceso de abliteration. Se aplicó Heretic v1.2.0 con el método ARA sobre las capas 7 a 36, con los siguientes parámetros: preserve_good_behavior_weight 0.5783, steer_bad_behavior_weight 0.0001, overcorrect_relative_weight 0.9986 y neighbor_count 15. El componente objetivo fue attn.o_proj. El resultado declarado es una reducción de rechazos de 99/100 a 3/100 con una divergencia KL de 0.0076 respecto al original, lo que indica que la distribución de salida se mantiene muy próxima al modelo base pese a la supresión de rechazos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct de Gemma 4.
- Procesamiento de imagen y texto (image-text-to-text), con un proyector de visión incluido en el repositorio (el nombre del archivo aparece truncado en la model card).
- Razonamiento de sentido común y conocimiento general, evaluado mediante PIQA y MMLU.
- Supresión de rechazos: responde a peticiones que el modelo original rechazaría en el 99 % de los casos, manteniendo solo un 3 % de rechazos según la evaluación del autor.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio reproducible para medir el impacto de ARA sobre attn.o_proj, comparando rechazos, KL divergence y precisión en MMLU y PIQA frente al modelo original.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo base rechazaría, gracias a la reducción de rechazos al 3 %.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_S permiten ejecutar un modelo multimodal de 7.5B en GPUs consumer mediante llama.cpp u Ollama, con un equilibrio razonable entre calidad y VRAM.
- Prototipado de asistentes conversacionales multimodales: al aceptar entrada de imagen y texto, puede emplearse para describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados en entornos de prueba.
- Evaluación de robustez y sesgos: útil para estudiar cómo cambia el comportamiento de un modelo al eliminar capas de rechazo, incluyendo la aparición de contenido sesgado o inseguro.
- Experimentación con cuantización GGUF: el repositorio ofrece seis niveles (BF16 a Q4_K_M) para comparar degradación de calidad y latencia en distintas configuraciones de hardware.
- Base para fine-tuning posterior: al estar en formato GGUF y derivar de un modelo instruct, puede servir como punto de partida para ajustes específicos de dominio en flujos de trabajo con llama.cpp.

## Benchmarks y rendimiento

| Benchmark | Modelo original (gemma-4-E4B-it) | Este modelo (Heretic) | Diferencia |
|---|---|---|---|
| Rechazos (sobre 100) | 99/100 | 3/100 | -96 puntos |
| KL divergence | 0 (por definición) | 0.0076 | +0.0076 |
| PIQA (accuracy) | 86.02 % (1581/1838) | 85.85 % (1578/1838) | -0.17 puntos |
| MMLU (accuracy) | 69.46 % (9753/14042) | 68.60 % (9633/14042) | -0.86 puntos |

Desglose de MMLU por asignaturas (original frente a Heretic): professional_law 52.87 % frente a 52.67 %; moral_scenarios 43.91 % frente a 41.23 %; miscellaneous 81.61 % frente a 82.12 %; professional_psychology 75.16 % frente a 73.86 %; high_school_psychology 89.17 % frente a 90.09 %; high_school_macroeconomics 72.82 % frente a 71.28 %; elementary_mathematics 65.87 % frente a 63.76 %; moral_disputes 68.21 % frente a 69.08 %; prehistory 75.31 % frente a 75.00 %; philosophy 70.74 % frente a 70.74 %.

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU u otros de visión) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (aproximada para 7.5B parámetros, sin contar el proyector de visión ni el contexto): BF16 en torno a 15 GB; Q8_0 en torno a 8 GB; Q6_K en torno a 6.2 GB; Q5_K_M en torno a 5.4 GB; Q5_K_S en torno a 5.1 GB; Q4_K_M en torno a 4.5 GB.
- GPU recomendadas: A100 o H100 para BF16 y despliegues de alta concurrencia; RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080, 4070 Ti o 3090 para Q6_K y Q5_K_M.
- Cabe en GPU consumer: sí, especialmente Q4_K_M y Q5_K_S en tarjetas de 8 GB o más, y Q8_0 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors. El repositorio declara compatibilidad con endpoints (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alyazka/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF | 7.518 M | no disponible | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Multimodal, abliterated, 3/100 rechazos |
| google/gemma-4-E4B-it | no disponible | no disponible | licencia Gemma 4 | safetensors | Modelo original, 99/100 rechazos, MMLU 69.46 % |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | no disponible | no disponible | no disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| Otras alternativas abliterated de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de otras familias (Llama, Qwen, Mistral) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El proceso de abliteration elimina barreras de rechazo, lo que puede producir contenido ofensivo, sesgado, inseguro o legalmente problemático; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- La divergencia KL de 0.0076 indica que el modelo se desvía del original; aunque es baja, implica cambios en la distribución de salida que pueden afectar a tareas sensibles.
- Pérdida de precisión documentada: -0.86 puntos en MMLU y -0.17 en PIQA respecto al original, con caídas más acusadas en moral_scenarios (-2.68) y elementary_mathematics (-2.11).
- Ambigüedad de licencia: el repositorio declara apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; es imprescindible verificar los términos aplicables antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-01), por lo que no hay evidencia de uso en producción ni validación independiente.
- No se dispone de información sobre idiomas soportados, longitud de contexto, tool calling ni capacidades de agente, lo que limita la evaluación para despliegues que dependan de estas funciones.
- El tamaño del repositorio (47.1 GB) incluye todas las cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar el archivo GGUF concreto.
- El proyector de visión aparece mencionado pero su nombre de archivo está truncado en la model card; es necesario consultar el repositorio para obtener el archivo correcto.
- Riesgo de alucinación: no cuantificado en la información disponible, pero presente en cualquier modelo de 7.5B y potencialmente agravado por la supresión de rechazos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alyazka/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Patreon del autor del modelo base: https://patreon.com/LLMfan46
- Ko-fi del autor del modelo base: https://ko-fi.com/llmfan46
