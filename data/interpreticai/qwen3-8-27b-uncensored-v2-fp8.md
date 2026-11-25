# InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8

## Resumen

Qwen3.8-27B-Uncensored-v2-FP8 es la version cuantizada en FP8 del modelo Qwen3.8-27B-Uncensored-v2, desarrollado por Interpretic AI. Se trata de un fine-tune de Qwen3.8-27B (27.781.427.952 parametros) en el que se ha eliminado en gran medida la censura politica presente en el modelo original, manteniendo practicamente intactas las capacidades generales. El checkpoint emplea el mismo esquema de cuantizacion que el Qwen3.8-27B-FP8 oficial: FP8 E4M3 por bloques de 128 × 128.

El modelo resuelve un problema concreto: las respuestas evasivas o alineadas con la censura politica china que el Qwen3.8-27B base produce ante preguntas sensibles. Segun la evaluacion del autor sobre el conjunto de Pan & Xu (2026), el modelo base censura el 86,7 % de 113 preguntas politicamente sensibles, mientras que esta version reduce esa tasa al 2,7 %. El checkpoint ocupa 29 GB y conserva la cabeza MTP (multi-token prediction) para decodificacion especulativa.

Es relevante para investigadores que necesitan estudiar sesgos politicos en LLM, para desarrolladores que requieren un modelo multimodal (image-text-to-text) sin filtros ideologicos en contextos de analisis, y para quienes buscan una alternativa FP8 eficiente en memoria del modelo base. La licencia Apache 2.0 se hereda de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; no se detalla la variante interna |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 E4M3 por bloques de 128 × 128 (este repo); BF16, GGUF Q4_K_M e IQ3_XXS en otros repositorios de la familia |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo preguntas en chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B y Qwen/Qwen3.8-27B-FP8) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Qwen3.8 y su naturaleza multimodal (pipeline image-text-to-text). El modelo base Qwen3.8-27B cuenta con 27,78 mil millones de parametros. Esta version FP8 replica el esquema de cuantizacion del Qwen3.8-27B-FP8 oficial (bloques de 128 × 128 en formato E4M3), lo que permite reducir el peso del checkpoint a 29 GB manteniendo el layout compatible con el modelo original.

El fine-tune se centra en eliminar la censura politica. Segun el autor, el componente de valores (values) se ajusto sobre los prompts de Pan & Xu, lo que implica que la evaluacion de esa fila es in-sample para este modelo y out-of-sample para Arete-27B. El modelo conserva la cabeza MTP (multi-token prediction) para decodificacion especulativa, una capacidad que Arete-27B no incluye. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo thinking y non-thinking, con parametros de muestreo recomendados distintos para cada modo.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que permite entrada multimodal.
- Razonamiento de dominio general: GPQA Diamond 86,4 y MMLU 86,5 en la version BF16 (ver seccion de benchmarks).
- Seguimiento de instrucciones: IFBench 79,0 en BF16.
- Decodificacion especulativa mediante cabeza MTP, que acelera la inferencia.
- Respuesta abierta a preguntas politicamente sensibles en chino, con una tasa de censura del 2,7 %.
- Capacidad de rechazo de peticiones daninas: 97 de 100 peticiones de `mlabonne/harmful_behaviors` rechazadas (frente a 100 del modelo base).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la evaluacion politica solo cubre chino.

## Casos de uso

- Investigacion sobre censura politica en LLM: el modelo permite medir y analizar como responde un LLM de gran tamano a preguntas politicamente sensibles sin la capa de evasion del modelo base, con una tasa de censura documentada del 2,7 % sobre 113 preguntas del conjunto de Pan & Xu.
- Analisis comparativo de alineacion: util para contrastar el comportamiento de Qwen3.8-27B (86,7 % de censura), Arete-27B (50 %) y esta variante (3,5 % en BF16) bajo prompts, decodificacion y juez identicos.
- Despliegue en produccion con vLLM: el modelo se sirve con `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8 --reasoning-parser qwen3`, lo que lo hace adecuado para pipelines que ya usan vLLM y necesitan un checkpoint FP8 de 29 GB.
- Aplicaciones multimodales de analisis de documentos: al ser image-text-to-text, puede procesar imagenes junto con texto para tareas de extraccion o descripcion, aunque no se detallan capacidades de vision especificas.
- Generacion de contenido en contextos editoriales o de investigacion donde el modelo base rechaza temas por motivos politicos, manteniendo un rendimiento general cercano al original (diferencias de −1,0 a −2,8 puntos en MMLU, IFBench y GPQA).
- Evaluacion de robustez y seguridad: permite estudiar el equilibrio entre eliminar censura politica y mantener el rechazo de peticiones daninas (97/100 rechazadas), util para auditorias de modelos.
- Fine-tuning posterior o experimentacion academica: la licencia Apache 2.0 y el formato safetensors compatible con transformers facilitan el ajuste y la integracion en frameworks existentes.

## Benchmarks y rendimiento

Censura politica (Pan & Xu, 2026; 113 preguntas, modo non-thinking, decodificacion greedy, 4.096 tokens maximos de salida, juez LLM):

| Modelo | Respuestas censuradas (de 113) | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7 % |
| Qwen3.8-27B-Uncensored-v2-FP8 | 3 | 2,7 % |

Incluyendo las dos preguntas excluidas (Q6 y Q109), las respuestas censuradas sobre 115 preguntas son 100 para Qwen3.8-27B y 4 para esta version FP8. La version FP8 elimina el 96,9 % de las respuestas censuradas del modelo base (95 de 98).

Rechazo de peticiones daninas (primeros 100 prompts de `mlabonne/harmful_behaviors`, split de test):

| Modelo | Peticiones daninas rechazadas (de 100) |
|---|---|
| Qwen3.8-27B | 100 |
| Qwen3.8-27B-Uncensored-v2-FP8 | 97 |

Capacidad general (evaluada sobre la version BF16):

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluacion propia) | 87,5 | 86,5 | −1,0 |

Comparacion con Arete-27B (Nous Research) sobre la version BF16, mismos prompts, decodificacion (non-thinking, greedy) y juez:

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83 % | 50 % | 3,5 % |
| Rechaza o evade (menor es mejor) | 50 % | 23 % | 1,7 % |
| Reescribe con puntos de vista del PCC (menor es mejor) | 32 % | 28 % | 1,7 % |
| Se alinea con valores del PCC (menor es mejor) | 100 % | 30 % | 10 % |
| Tema correcto, respondido abiertamente (mayor es mejor) | 12 % | 38 % | 77 % |
| Cabeza MTP para decodificacion especulativa | Si | No | Si |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 29 GB en disco; en inferencia se necesita aproximadamente esa cantidad mas el espacio para KV cache y overhead del runtime, por lo que se recomienda un minimo de 32-40 GB de VRAM.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. En GPUs consumer de 24 GB (RTX 4090, RTX 3090) no cabe el checkpoint FP8 completo; seria necesario recurrir a las variantes GGUF Q4_K_M o IQ3_XXS del mismo autor.
- Cabe en consumer GPU: no en su formato FP8 con 24 GB; si mediante las versiones GGUF cuantizadas a 4 bits o inferiores.
- Opciones de despliegue: vLLM (comando documentado: `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8 --reasoning-parser qwen3`), transformers con safetensors, y llama.cpp u Ollama a traves de los GGUF de la familia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La cabeza MTP permite decodificacion especulativa, que reduce la latencia de generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2-FP8 | 27,78 B | no disponible | 2,7 % (113 preguntas) | Apache 2.0 | safetensors FP8 |
| Qwen3.8-27B (base oficial) | 27,78 B | no disponible | 86,7 % (113 preguntas) | Apache 2.0 | BF16, FP8 oficial |
| Arete-27B (Nous Research) | no disponible | no disponible | 50 % (115 preguntas, medicion del autor) | no disponible | no disponible |
| Qwen3.8-27B-Uncensored-v3 | no disponible | no disponible | 2,6 % (115 preguntas) | Apache 2.0 (heredada) | BF16, GGUF, MLX |

Nota: las cifras de censura de Arete-27B y Uncensored-v3 provienen de la model card del autor de este repositorio y no de evaluaciones independientes.

## Limitaciones y advertencias

- La evaluacion politica cubre unicamente preguntas en chino; el comportamiento en otros idiomas no esta documentado.
- Una respuesta sustantiva no es necesariamente correcta: el autor advierte explicitamente que los usuarios deben verificar las afirmaciones facticas de forma independiente. El riesgo de alucinacion persiste.
- La fila de valores de la comparacion con Arete-27B es in-sample para Uncensored-v2 (ajustada sobre prompts de Pan & Xu) y out-of-sample para Arete-27B, lo que puede favorecer al primero.
- El modelo reduce el rechazo de peticiones daninas de 100/100 a 97/100; existe un margen residual de respuestas a peticiones potencialmente nocivas que debe tenerse en cuenta en produccion.
- La cuantizacion FP8 puede introducir degradaciones adicionales respecto a la version BF16, aunque no se publican metricas especificas para el checkpoint FP8 en capacidades generales.
- No se documentan sesgos conocidos mas alla del politico, ni limitaciones de contexto o idioma.
- Licencia Apache 2.0 con atribucion de Qwen retenida: permite uso comercial, pero deben conservarse los avisos de licencia y atribucion del equipo Qwen.
- El modelo se construye sobre Qwen3.8-27B, por lo que hereda las limitaciones del base no corregidas por el fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Version BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Version GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Version GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Version Uncensored-v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Version Uncensored-v3 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Version Uncensored-v3 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Version Uncensored-v3 MLX 4-bit: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Version FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Paper de referencia: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11542
