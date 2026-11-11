# Atzemo/Test

## Resumen

Atzemo/Test es un modelo multimodal de tipo imagen-texto derivado de `google/gemma-4-E2B-it`, publicado por el usuario Atzemo en Hugging Face. Se presenta como una versión "abliterada" del modelo base, es decir, con los mecanismos de rechazo eliminados a nivel de pesos mediante proyección ortogonal sobre las capas del transformer. El modelo conserva la pipeline `image-text-to-text` y la librería `transformers`, con pesos en formato safetensors.

El repositorio contiene 5.104.297.539 parámetros según los metadatos de safetensors y ocupa 10,2 GB. La model card declara soporte bilingüe tailandés-inglés y capacidades de visión, además de estar etiquetado como `uncensored` y `nsfw`. No se dispone de información sobre la longitud de contexto, el proceso de entrenamiento original ni la licencia.

La relevancia de esta ficha es limitada y fundamentalmente técnica: se trata de una publicación sin descargas ni interacciones, con una model card que documenta un procedimiento de abliteración y ofrece ejemplos de uso con vLLM y Transformers. La información disponible no permite validar capacidades, rendimiento ni calidad de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-E2B-it |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card usa bfloat16 en los ejemplos) |
| Idiomas soportados | th (tailandes), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 10,2 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es una modificación del checkpoint `google/gemma-4-E2B-it`. La model card describe una intervención de abliteración mediante proyección ortogonal del vector de rechazo sobre las proyecciones de salida `o_proj` y `down_proj` de todas las capas del transformer. El vector de rechazo se habría calculado como la diferencia media de activaciones entre descripciones de imágenes seguras y prompts NSFW en la capa intermedia del modelo. Según el autor, esta modificación es permanente a nivel de pesos y no requiere hooks de PyTorch en tiempo de inferencia, lo que facilita su uso con motores como vLLM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni sobre innovaciones técnicas adicionales del modelo base. La model card tampoco detalla la arquitectura interna de `gemma-4-E2B-it` más allá de su naturaleza multimodal y su pipeline de imagen-texto.

## Capacidades

- Generación de texto conversacional en inglés y tailandés.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text): descripción de imágenes y respuesta a prompts multimodales.
- Generación de contenido sin filtros de rechazo, según declara el autor, tras la abliteración de pesos.
- Compatibilidad declarada con vLLM y con Transformers mediante `trust_remote_code`.
- Soporte de despliegue como servidor compatible con la API de OpenAI a través de vLLM.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteración sobre el comportamiento de rechazo en un modelo multimodal, comparando sus salidas con las del checkpoint original.
- Evaluación de técnicas de eliminación de refusal en pesos: útil para reproducir y auditar el método de proyección ortogonal descrito por el autor sobre `o_proj` y `down_proj`.
- Pruebas de robustez de filtros de moderación: permite generar contenido explícito controlado para validar clasificadores y sistemas de moderación en pipelines de producción.
- Investigación lingüística en tailandés: el modelo declara capacidad de generar texto en tailandés coloquial, lo que puede emplearse en estudios de generación en ese idioma.
- Experimentos de despliegue con vLLM: su compatibilidad declarada con motores de inferencia de alto rendimiento permite probar configuraciones de serving sin hooks personalizados.
- Análisis de sesgos y contenido dañino: al carecer de mecanismos de rechazo, sirve como caso extremo para estudiar la propagación de sesgos y contenido no deseado en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10-11 GB solo para pesos, más el overhead de activaciones y del procesador multimodal; en la práctica se recomienda al menos 16-24 GB para comodidad.
- Cuantización a 8 bits: alrededor de 5-6 GB de pesos; a 4 bits: alrededor de 3 GB, aunque no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: A100, H100 o L40S para serving con vLLM en bfloat16; RTX 4090 (24 GB) para inferencia en bfloat16 de una sola instancia.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, con cuantización, en GPUs de 8-12 GB; no se confirma compatibilidad con cuantizaciones GGUF porque el repositorio solo publica safetensors.
- Opciones de despliegue: vLLM (documentado en la model card), Transformers con `AutoModelForCausalLM` y `AutoProcessor`; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atzemo/Test | 5.104.297.539 | no disponible | imagen-texto | no disponible | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | imagen-texto | no disponible en la informacion | modelo base referenciado por el autor |
| Jommarn/UNSEEN_Gemma_4_E2B_NSFW | no disponible | no disponible | imagen-texto | no disponible | referenciado en la model card como identificador de ejemplo |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar contenido NSFW y carece de mecanismos de rechazo, lo que lo hace inadecuado para aplicaciones de producción orientadas al público general.
- Riesgo elevado de generar contenido sexual explícito, potencialmente dañino o no consentido; la model card incluye un aviso al respecto pero no incorpora salvaguardas técnicas.
- La abliteración puede degradar capacidades generales del modelo base; no se aportan evaluaciones que cuantifiquen esa posible pérdida.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base sin evaluación específica no pueden descartarse sesgos de género, culturales o lingüísticos.
- Riesgo de alucinación: no evaluado; los modelos multimodales de este tamaño tienden a alucinar en descripciones de imágenes, y no hay datos que lo confirmen o descarten aquí.
- Idiomas: solo se declaran tailandés e inglés; el rendimiento en castellano no está documentado.
- Licencia no disponible: no puede confirmarse si se permite uso comercial, lo que impide su adopción en entornos productivos sin aclaración legal.
- El repositorio no tiene descargas ni interacciones, y la model card referencia un identificador distinto (`Jommarn/UNSEEN_Gemma_4_E2B_NSFW`) en los ejemplos, lo que genera dudas sobre la trazabilidad del checkpoint publicado.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/Atzemo/Test
- Modelo base referenciado: https://huggingface.co/google/gemma-4-E2B-it
- Identificador alternativo citado en los ejemplos: https://huggingface.co/Jommarn/UNSEEN_Gemma_4_E2B_NSFW
- vLLM: https://github.com/vllm-project/vllm
- Transformers: https://github.com/huggingface/transformers
