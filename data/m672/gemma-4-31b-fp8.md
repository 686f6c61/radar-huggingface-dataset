# m672/gemma-4-31b-fp8

## Resumen

`m672/gemma-4-31b-fp8` es una cuantización FP8 del modelo `llmfan46/gemma-4-31B-it-uncensored-heretic`, que a su vez es un ajuste fino sin censura de Gemma 4 31B en su variante instruction-tuned. El modelo conserva la arquitectura multimodal de la familia Gemma 4 (incluye torre de visión, aunque esta no se cuantiza) y 31.273.088.876 parámetros totales, empaquetados en safetensors con un tamaño de repositorio de 33,3 GB.

El propósito de esta versión es reducir el coste de inferencia: la cuantización FP8 por bloques rebaja el peso de aproximadamente 62 GB en BF16 a unos 31,5 GB, manteniendo una degradación mínima en benchmarks estándar (del orden de 0,1 a 0,7 puntos porcentuales frente a una referencia FP8 de Red Hat AI). Está pensada para despliegue nativo en vLLM mediante el formato compressed-tensors.

Es relevante ahora porque permite servir un modelo de 31B en una sola GPU de 40-48 GB con precisión casi equivalente a BF16, y porque el ajuste "uncensored/heretic" elimina las restricciones de rechazo del modelo original, algo que interesa a equipos de investigación que necesitan respuestas sin filtrado previo para tareas de red-teaming o generación creativa sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), con torre de visión; detalles internos no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_BLOCK (weight_block_size=[128,128], activation_scheme=dynamic); capas ignoradas: torre de visión, lm_head y embeddings |
| Idiomas soportados | no disponible (el modelo base es de la familia Gemma, multilingüe, pero la model card no lo detalla) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (nativo de vLLM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma 4 y de la presencia de una torre de visión, lo que confirma que se trata de un modelo multimodal. El proceso de cuantización sí está documentado: se aplicó FP8_BLOCK con bloques de pesos de 128x128 y esquema de activación dinámico, usando la herramienta `llmcompressor` en modo `model_free_ptq`. Se excluyeron de la cuantización la torre de visión, la cabeza de salida (`lm_head`) y las capas de embeddings, de modo que estas permanecen en su precisión original.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si el ajuste fino del modelo base empleó RLHF o DPO. El modelo base, `llmfan46/gemma-4-31B-it-uncensored-heretic`, es un ajuste "uncensored" (técnica a menudo denominada *abliteration* o *heretic*) que modifica el comportamiento de rechazo del modelo original; la model card de esta cuantización no documenta el método exacto empleado.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas de Gemma 4 31B instruction-tuned.
- Procesamiento multimodal de imágenes mediante la torre de visión, que se mantiene sin cuantizar.
- Respuestas sin filtrado de rechazo: el ajuste "uncensored" elimina las negativas del modelo original ante peticiones sensibles.
- Razonamiento matemático y de sentido común, evidenciado por los resultados en GSM8k-Platinum (97,68 %) y MMLU-CoT (89,97 %).
- Seguimiento de instrucciones estricto, con 93,41 % en IFEval inst_strict y 90,76 % en prompt_strict.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo responde sin rechazos, lo que permite generar casos adversarios y estudiar los límites del modelo original de forma controlada, algo imposible con la versión censurada.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas que el modelo base rechazaría, manteniendo la calidad de un modelo de 31B.
- Despliegue económico en producción: gracias a los ~31,5 GB en FP8, puede servirse en una única GPU de 40-48 GB con vLLM, reduciendo a la mitad el coste de memoria frente a BF16.
- Análisis de documentos con imágenes: la torre de visión sin cuantizar permite extraer y razonar sobre contenido visual en pipelines de automatización documental.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de FP8 frente a BF16 en tareas de matemáticas e instrucciones (los benchmarks publicados lo facilitan).
- Generación de código y matemáticas en entornos internos: los resultados en GSM8k y MMLU-Pro (84,52 %) lo hacen adecuado para asistentes técnicos donde no se requiere filtrado de contenido.
- Fine-tuning posterior o destilación: al estar en formato compressed-tensors, puede integrarse en pipelines de vLLM para servir como profesor en la generación de datos sintéticos.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con `RedHatAI/gemma-4-31B-it-FP8-block` bajo ajustes idénticos (lm_eval 0.4.11, vLLM, media de 2 semillas, temperature=1.0, top_p=0.95, top_k=64, max_gen_toks=8192):

| Benchmark | Este modelo | RedHatAI FP8 | Delta |
|---|---|---|---|
| GSM8k-Platinum (5-shot) | 97,68 % | 97,82 % | -0,14 |
| MMLU-CoT (5-shot) | 89,97 % | 90,70 % | -0,73 |
| MMLU-Pro (5-shot) | 84,52 % | 84,92 % | -0,40 |
| IFEval inst_strict | 93,41 % | 93,84 % | -0,43 |
| IFEval prompt_strict | 90,76 % | 91,31 % | -0,55 |

No se publican resultados frente al modelo base en BF16 ni frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: unos 31,5 GB solo para pesos en FP8, más overhead de caché KV y activaciones; en la práctica, entre 34 y 40 GB según longitud de contexto y lote.
- GPU recomendadas: NVIDIA L40S (48 GB), A100 40/80 GB, H100 80 GB, RTX 6000 Ada (48 GB).
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) en FP8; requeriría cuantizaciones adicionales (INT4/GGUF) no disponibles en este repositorio.
- Despliegue: vLLM es la opción nativa (formato compressed-tensors). Otros motores como TGI, llama.cpp u Ollama no están documentados para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| m672/gemma-4-31b-fp8 | 31,27 B | FP8 block | no disponible | Apache 2.0 | Ajuste uncensored, multimodal |
| RedHatAI/gemma-4-31B-it-FP8-block | ~31 B | FP8 block | no disponible | no disponible | Referencia FP8 del Gemma 4 original, censurado |
| llmfan46/gemma-4-31B-it-uncensored-heretic | ~31 B | BF16 | no disponible | no disponible | Modelo base sin cuantizar, ~62 GB |

La comparación con alternativas de otros fabricantes (p. ej. Llama o Qwen de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal o peligroso; el autor declina toda responsabilidad sobre los outputs. No apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual más allá de MMLU.
- La cuantización FP8 introduce una degradación pequeña pero medible (hasta -0,73 puntos en MMLU-CoT) respecto a la referencia FP8.
- Longitud de contexto e idiomas no documentados: no se puede garantizar el comportamiento en contextos largos ni en idiomas distintos del inglés.
- El repositorio tiene muy poca tracción (37 descargas, 0 likes) y una única revisión; no hay evidencia de validación independiente.
- La licencia declarada es Apache 2.0, pero el modelo base desciende de Gemma 4, cuyos términos de uso originales pueden imponer restricciones adicionales que conviene verificar antes de un uso comercial.
- El autor de la cuantización aparece como "kakrotto" en la model card pero el repositorio está bajo "m672"; conviene confirmar la procedencia antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m672/gemma-4-31b-fp8
- Modelo base: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Referencia de cuantización: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-block
- Herramienta de cuantización (llmcompressor): https://github.com/vllm-project/llmcompressor
