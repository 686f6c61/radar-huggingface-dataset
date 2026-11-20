# ReadyArt/gemma-4-31B-it-scotoma-2

## Resumen

Gemma 4 31B IT Scotoma 2 es un ajuste fino (finetune) del modelo multimodal google/gemma-4-31b-it, publicado por el usuario ReadyArt en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura y el tamaño del modelo base, con 31.273.086.512 parámetros totales (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB en formato safetensors. Está etiquetado como image-text-to-text y text-generation, lo que indica que mantiene la capacidad de procesar imágenes y texto de entrada.

El modelo se presenta como una variante instruida (IT) orientada a conversación, con la etiqueta conversational y compatibilidad con endpoints. La model card del autor incluye una presentación visual elaborada (HTML/CSS embebido) con referencias a un "kitsune", un "paper lantern" y un "bowl of water", así como una tabla de "signs" que sugiere una temática narrativa o de rol. No obstante, la información técnica sustantiva sobre el proceso de ajuste, los datos de entrenamiento y las capacidades específicas es muy limitada en la información disponible.

Su relevancia actual radica en ser un finetune de un modelo de la familia Gemma 4 con capacidades multimodales, publicado con licencia permisiva (Apache 2.0) y un volumen de descargas moderado (1.472) y 61 likes en el momento de la consulta. Sin embargo, la ausencia de documentación técnica detallada y de resultados de benchmarks limita su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31b-it); detalles específicos no disponibles |
| Parámetros totales | 31.273.086.512 (aproximadamente 31,3 mil millones) |
| Parámetros activos | No aplica (no se indica que sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene safetensors; no se especifican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-31b-it, un transformer multimodal de aproximadamente 31,3 mil millones de parámetros. Al tratarse de un finetune (base_model_relation: finetune), se heredan las innovaciones del modelo original, aunque la información proporcionada no detalla si se emplearon técnicas como decodificación especulativa, atención lineal o mezcla de expertos. El pipeline declarado es text-generation y las etiquetas incluyen image-text-to-text, lo que confirma que el modelo mantiene la torre visual del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. La model card del autor no incluye una sección técnica descriptiva; su contenido es principalmente una presentación visual con temática narrativa. Por tanto, los detalles sobre el proceso de entrenamiento deben considerarse no disponibles.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como conversational y pipeline text-generation, orientado a diálogo multi-turno.
- Procesamiento de imagen y texto (image-text-to-text): conserva la capacidad multimodal del modelo base para recibir imágenes junto con texto.
- Razonamiento y generación de código: capacidad heredada del modelo base Gemma 4, aunque no se documentan evaluaciones específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): se confirma visión por la etiqueta image-text-to-text; no se documentan otras capacidades especiales.

## Casos de uso

- Asistencia conversacional multimodal: el modelo puede gestionar diálogos en los que el usuario adjunta imágenes (por ejemplo, capturas de pantalla o fotografías) y solicita explicaciones o descripciones, gracias a su pipeline image-text-to-text.
- Prototipado de aplicaciones de visión-lenguaje: adecuado para experimentar con tareas de descripción de imágenes, respuesta a preguntas visuales (VQA) o extracción de información de documentos escaneados, al heredar la torre visual del modelo base.
- Generación de texto en entornos de investigación: su licencia Apache 2.0 y formato safetensors facilitan su integración en pipelines de experimentación con transformers.
- Fine-tuning adicional: al ser un modelo ya ajustado y publicado con licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio, siempre que se respeten las condiciones de la licencia de Gemma 4 enlazada.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible sugiere que puede servirse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Evaluación comparativa de finetunes: útil para investigadores que estudien el efecto de ajustes finos sobre modelos multimodales de gran tamaño, dado que el modelo base está identificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,3 mil millones de parámetros, en precisión completa (FP32) se requieren aproximadamente 125 GB; en BF16/FP16, alrededor de 62,6 GB (coincide con el tamaño del repositorio); en cuantización de 8 bits, aproximadamente 31 GB; en 4 bits, alrededor de 16-18 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para BF16 se necesitan GPU con 80 GB (A100, H100) o múltiples GPU; para cuantización 8 bits, una A100 de 40 GB o similar; para 4 bits, GPU consumer de gama alta como RTX 4090 (24 GB) podrían ser suficientes, aunque no está confirmado.
- ¿Cabe en GPU consumer? Posiblemente en RTX 4090 (24 GB) con cuantización de 4 bits; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt/gemma-4-31B-it-scotoma-2 | 31,3 B | No disponible | Apache 2.0 | Safetensors | Finetune multimodal de Gemma 4 31B IT |
| google/gemma-4-31b-it (modelo base) | 31,3 B | No disponible | Licencia Gemma 4 | Safetensors | Modelo original de Google; referencia directa |
| Alternativas de ~30B multimodales | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con otras alternativas de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, podría presentar los sesgos de Gemma 4, pero no se confirma.
- Riesgo de alucinación: no evaluado; los modelos de gran tamaño y los finetunes con poca documentación pueden presentar alucinaciones, especialmente en tareas multimodales.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: aunque la etiqueta indica Apache 2.0, la model card enlaza a la licencia de Gemma 4 de Google (license_link), lo que puede introducir términos adicionales; es necesario revisar dicha licencia antes de un uso comercial.
- Caveat para producción: la ausencia de benchmarks, de documentación técnica y de información sobre el dataset de ajuste hace recomendable una evaluación exhaustiva antes de desplegarlo en entornos productivos. La model card tiene un formato principalmente visual y no sustituye a una ficha técnica.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
