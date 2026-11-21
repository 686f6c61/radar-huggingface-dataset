# aikexue170/rewrite3-27b-iq4xs

## Resumen

rewrite3-27b-iq4xs es una cuantización GGUF IQ4_XS del modelo rewrite3-27B, un modelo de 27 320 697 856 parámetros derivado de Qwen/Qwen3.8-27B y especializado en la reescritura de texto narrativo chino (web-novel). Lo publica el usuario aikexue170 en Hugging Face bajo licencia Apache 2.0, y su propósito declarado es transformar borradores degradados por generación automática (AIGC) en prosa fluida, con estilo de autor y sin copiar literalmente el original.

El modelo incorpora una cabeza MTP (multi-token prediction) embebida (`blk.32.nextn.*`) que actúa como decodificación especulativa, y su entrenamiento se apoya en un clasificador externo de "calidad de frase" (jevnovel3 0.8B) que puntúa la probabilidad de que una oración suene a fórmula automática. El resultado es un modelo de reescrita con modo de razonamiento (cadena de pensamiento) específicamente construido para el dominio de la novela web en chino.

Esta ficha cubre la variante IQ4_XS (15,5 GB, 14,5 GiB), pensada para despliegue local con llama.cpp cuando la VRAM es limitada: según la model card, ofrece un JEV medio de 0,0982 con un tiempo medio de 41 s frente a 71 s del FP8, a costa de una ligera pérdida de fidelidad en la métrica de "desvinculación del original".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.8-27B, con cabeza MTP (multi-token prediction) embebida para decodificación especulativa |
| Parametros totales | 27 320 697 856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de la model card arranca llama-server con `-c 16384` |
| Tipos de cuantizacion | IQ4_XS (GGUF, este repositorio); la familia incluye BF16, Q8_0, FP8 W8A8, NVFP4 W4A4, Q4_K_M, Q3_K_M e IQ3_XS |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,5 GB); otras variantes en safetensors/compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27,3 mil millones de parámetros, y añade una cabeza MTP que permite decodificación especulativa con `--spec-type draft-mtp --spec-draft-n-max 3` en llama.cpp (nightly b12374 o superior). La variante IQ4_XS usa cuantización GGUF de 4 bits con imatrix, con los tensores comprimidos mediante compressed-tensors.

El entrenamiento descrito en la model card no es un simple fine-tuning supervisado: se construyó un dataset donde las entradas son textos degradados por AIGC y las salidas son originales humanos, enriquecidos mediante un pipeline de tres etapas. Primero, jevnovel3 0.8B puntúa cada oración con una probabilidad de "mala calidad" (p_bad); después Claude Opus 5.5 realiza una primera expansión de detalles; a continuación jevnovel3 vuelve a puntuar el texto completo y Spark X 2.6 aplica correcciones puntuales; finalmente Kimi K3 hace una última pasada. Con el texto enriquecido, Gemini 4 Argon genera cadenas de pensamiento que explican el tipo de fórmula detectada, la puntuación JEV y la estrategia de reescrita, produciendo un mapeo cot completo. La versión anterior (rewrite2) contaba con 20 000 pares y adolecía de tres problemas: tendencia a acortar el texto, falta de CoT y mala generalización en la detección de fórmulas; el nuevo dataset ataca esos tres frentes.

## Capacidades

- Reescrita de prosa narrativa en chino: convierte borradores con "sabor AIGC" en texto legible, con estilo personal y sin copiar literalmente (restricción dura de no superar 15 caracteres consecutivos idénticos al original).
- Modo de razonamiento (cadena de pensamiento) especializado en reescrita: el modelo razona sobre qué frases son fórmulas vacías antes de producir el texto final.
- Detección implícita de "八股" (prosa formulaica/relleno): gracias al clasificador jevnovel3 integrado en el pipeline de datos, el modelo aprende a identificar y eliminar muletillas y relleno.
- Generación de texto en chino con capacidad conversacional (tag `conversational`).
- Decodificación especulativa MTP integrada: acelera la generación en llama.cpp sin modelo draft separado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del chino.

## Casos de uso

- Reescrita de capítulos de novela web: el modelo recibe un borrador generado por IA y devuelve una versión pulida; su entrenamiento específico en pares degradado→humano lo hace adecuado para este flujo de trabajo editorial.
- Limpieza de catálogos de ficción seriada: para plataformas con miles de capítulos producidos con asistencia de IA, el modelo puede normalizar estilo y eliminar fórmulas repetitivas por lotes, con la restricción de copia de 15 caracteres como salvaguarda.
- Preservación de estilo de autor: el pipeline de datos (expansión con Opus 5.5, corrección con Spark X 2.6 y Kimi K3, CoT de Gemini 4 Argon) está orientado a mantener "voz" autoral, lo que lo hace útil para autores que quieren pulir sin perder identidad.
- Despliegue local en estaciones de trabajo: al ser IQ4_XS de 15,5 GB, cabe en GPUs de consumo alto y permite trabajar con manuscritos confidenciales sin enviarlos a la nube.
- Control de longitud en reescrita: la model card indica que se puede fijar la longitud en el prompt para evitar el "relleno para alargar"; útil en encargos con recuento de palabras estricto.
- Evaluación comparativa de cuantizaciones: como referencia de calidad/velocidad dentro de la familia rewrite3 para decidir entre FP8 (calidad) e IQ4_XS (velocidad y VRAM).

## Benchmarks y rendimiento

La model card publica una comparación interna sobre seis prompts, con KV cache en bf16, midiendo JEV (probabilidad de frase "mala", menor es mejor), desvinculación del original, copia literal y tiempo medio:

| Formato | JEV medio ↓ | Desvinculación ↑ | Copia máxima (caracteres) ↓ | Copia total ↓ | Longitud media | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

El autor concluye FP8 > IQ4_XS > NVFP4. BF16 es la referencia de calidad pero no se evaluó en este conjunto de seis prompts; Q3_K_M, Q4_K_M e IQ3_XS no se han probado todavía. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15,5 GB de pesos en IQ4_XS, más KV cache; con `-c 16384` y KV en bf16 el consumo adicional es apreciable, por lo que se recomienda planificar margen sobre 16 GB.
- GPU recomendadas: A100/H100 para FP8 o BF16; RTX 4090 (24 GB) para IQ4_XS con contexto moderado; GPUs de 16 GB quedan justas (el autor sugiere Q3_K_M o IQ3_XS para ese segmento).
- Cabe en GPU de consumo: sí, IQ4_XS en RTX 4090/4080 de 24 GB; en 16 GB conviene reducir contexto o bajar a Q3_K_M (13,7 GB) o IQ3_XS (12,3 GB).
- Opciones de despliegue: llama.cpp (llama-server, nightly b12374 o superior) para GGUF con MTP; vLLM para las variantes BF16/FP8/NVFP4.
- Latencia y throughput: 41 s de media para las seis muestras de la model card (frente a 71 s en FP8), incluyendo razonamiento y texto final; no se publica throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|:--|--:|--:|:--|:--|:--|
| rewrite3-27b-iq4xs (este) | 27,3 B | no disponible | Apache 2.0 | GGUF IQ4_XS | Especializado en reescrita de novela web china; MTP integrado |
| rewrite3-27b-fp8 | 27,3 B | no disponible | Apache 2.0 | FP8 W8A8 | Mejor JEV (0,0966) y desvinculación (0,844) en la evaluación interna |
| rewrite3-27b-nvfp4 | 27,3 B | no disponible | Apache 2.0 | NVFP4 W4A4 | Menor huella (19,7 GB); JEV 0,1016 |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | no disponible | safetensors | Modelo generalista del que deriva; sin especialización en reescrita |

No se dispone de comparaciones con modelos de propósito general de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo chino; no se documenta rendimiento en castellano ni en otros idiomas.
- Dominio acotado: entrenado para reescrita de novela web china; su uso como modelo generalista de texto no está validado.
- Tendencia al alargamiento: la model card advierte que en ocasiones "rellena para ganar longitud"; hay que fijar la longitud en el prompt si es crítico.
- Riesgo de alucinación: la expansión de detalles se hizo con modelos generativos (Opus 5.5, Spark X 2.6, Kimi K3); aunque se evitó introducir información no inferible del texto, puede aparecer contenido añadido no presente en el original.
- Dependencia de un clasificador externo (jevnovel3 0.8B) en la construcción del dataset: no se distribuye como parte del modelo y no se puede reproducir la métrica JEV sin él.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- Compatibilidad: la cabeza MTP requiere llama.cpp nightly b12374 o superior; versiones antiguas no cargarán `blk.32.nextn.*`.
- Datos de benchmarks limitados: solo seis prompts internos; sin MMLU, HumanEval ni GSM8K, la evaluación objetiva de capacidades generales no está disponible.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- ModelScope (espejo): https://modelscope.cn/models/alkaid55555/rewrite3-27b-iq4xs
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante Q8_0: https://huggingface.co/aikexue170/rewrite3-27b-q8_0
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante Q4_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante Q3_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q3km
- Variante IQ3_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
