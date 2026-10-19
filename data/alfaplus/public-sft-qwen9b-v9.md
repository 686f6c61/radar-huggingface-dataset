# alfaplus/public-sft-qwen9b-v9

# alfaplus/public-sft-qwen9b-v9: adaptador LoRA sobre Qwen3.5-9B

## Resumen

`alfaplus/public-sft-qwen9b-v9` es un adaptador LoRA (PEFT) para el modelo `Qwen/Qwen3.5-9B`, publicado por la organización `alfaplus`. No es un modelo completo: son 86.556.672 parámetros entrenables en 496 tensores fp32 (346.302.176 bytes) que deben cargarse encima del modelo base. El adaptador se entrenó con QLoRA sobre un subconjunto de 1.024 ejemplos del dataset japonés de diálogo multi-turno sintético `kanhatakeyama/ramdom-to-fixed-multiturn-Calm3`, durante 3 épocas (192 pasos de optimizador) en una única GPU.

El interés del artefacto es de trazabilidad, no de rendimiento: la model card documenta con precisión el commit exacto del dataset y del modelo base, el pipeline de filtrado (de 11.078 filas a 1.024, con 40 duplicados y 4.285 ejemplos descartados por superar los 1.024 tokens), los hashes SHA-256 de los ficheros y la configuración completa de entrenamiento. Los propios autores lo describen como un experimento de laboratorio, no como un producto.

Es relevante ahora por dos motivos. Primero, porque ejemplifica una práctica creciente: publicar adaptadores pequeños con procedencia verificable en lugar de pesos completos. Segundo, porque el autor declara explícitamente que no se ejecutó ninguna evaluación, ni benchmark, ni validación humana, de modo que cualquier uso en producción exige una evaluación propia previa. Los datos de entrenamiento son sintéticos, generados por `cyberagent/calm3-22b-chat`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal denso. Arquitectura interna del base `Qwen3.5-9B`: no disponible en la información proporcionada |
| Parametros totales | Adaptador: 86.556.672 (496 tensores fp32). Modelo base: ~9B según su denominación comercial; cifra exacta no disponible |
| Parametros activos | No aplica: no es un modelo MoE. No se dispone de confirmación de la arquitectura del base |
| Longitud de contexto | Entrenamiento: 1.024 tokens (`max_seq_len`). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Entrenamiento: base cargado en 4-bit NF4 con doble cuantización (bitsandbytes). Opciones de cuantización para inferencia: no disponible |
| Idiomas soportados | Japonés (`language: ja`), único idioma presente en los datos de entrenamiento. Capacidad real en otros idiomas: no disponible |
| Licencia | Apache-2.0 (solo los pesos del adaptador). El dataset conserva su propia licencia Apache-2.0, que no cambia por esta publicación |
| Formato de pesos | safetensors (`adapter_model.safetensors`, fp32) + `adapter_config.json`. No se distribuyen pesos fusionados, checkpoints intermedios, estados del optimizador ni ficheros GGUF |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el base se carga cuantizado en 4-bit NF4 con doble cuantización mediante bitsandbytes y el cálculo se realiza en bf16, con `bf16=True` en el entrenamiento y kernels Liger. La configuración LoRA es r=32, `lora_alpha`=64, `lora_dropout`=0,05, `bias=none`, `task_type=CAUSAL_LM` y `target_modules=auto` con `exclude_modules` que excluye vision/audio/visual/mtp, de modo que solo se adapta el decodificador de texto. El optimizador es `paged_adamw_8bit` con lr 1e-4 y schedule cosine, warmup_ratio 0,03, batch de 4 por tarjeta con acumulación 4 (batch efectivo 16), 3 épocas sobre 1.024 ejemplos, lo que da 64 pasos por época y 192 pasos totales. Semilla fija 42. La pérdida se calcula únicamente sobre los tokens de respuesta del asistente (`all_tokens_loss=false`), excluyendo turnos de usuario y marcas del template.

Los datos proceden de `kanhatakeyama/ramdom-to-fixed-multiturn-Calm3` en la revisión `01ec4ac58efac18fa45fc36cf06ab882ed0884f3`, concretamente del parquet `data/20240806filtered-00000-of-00001.parquet` (split `20240806filtered`, 11.078 filas, columnas `qid`, `text` y `messages`; solo se usa `messages`). El filtrado descarta 40 duplicados exactos (quedan 11.038), elimina 4.285 ejemplos que superan los 1.024 tokens tras aplicar el chat template de Qwen3.5-9B (quedan 6.753) y selecciona 1.024 con `random.Random(42).shuffle`. El subconjunto final suma 735.065 tokens por época, con longitud p50 de 752 tokens, p90 de 961, máximo 1.024 y media de 717,8. Estructura: 149 conversaciones de un par usuario/asistente y 875 de dos pares, sin mensajes de sistema. El contenido es íntegramente sintético, generado por `cyberagent/calm3-22b-chat`, con parte del cómputo en el supercomputador TSUBAME4.0 del Instituto Tecnológico de Tokio, según la model card del dataset original.

## Capacidades

No se ha ejecutado ninguna evaluación, por lo que las capacidades siguientes son expectativas derivadas del base y de la naturaleza del ajuste, no hechos verificados:

- Generación de texto en japonés con estilo de diálogo multi-turno, heredada del formato del dataset (conversaciones de uno o dos turnos, sin rol de sistema).
- Adaptación de estilo y registro conversacional: el ajuste se limita a 192 pasos sobre 1.024 ejemplos, por lo que el efecto esperado es un sesgo superficial de estilo más que una adquisición de conocimiento nueva. No verificado.
- Razonamiento, código, matemáticas o capacidades multilingües: dependen íntegramente del base `Qwen3.5-9B`. No evaluadas en esta publicación y sin datos disponibles sobre el base en la información proporcionada.
- Tool calling / function calling y comportamiento agente: no documentados ni evaluados para este adaptador. El dataset no contiene mensajes de sistema ni trazas de herramientas, por lo que el ajuste no refuerza esas capacidades.
- Capacidades de visión o audio: excluidas explícitamente del entrenamiento vía `exclude_modules`; el adaptador solo cubre el decodificador de texto.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en japonés: el adaptador sirve para generar respuestas con el registro del dataset Calm3 en demos internas. Es adecuado por su tamaño reducido (346 MB) y su integración directa con PEFT, pero requiere una batería de evaluación propia antes de cualquier exposición a usuarios.
- Investigación reproducible sobre SFT: la model card documenta semilla, hashes, revisión del dataset y número exacto de pasos, lo que permite replicar el entrenamiento y hacer ablaciones controladas (r=8/16/32, alpha, 1/2/3 épocas, subconjuntos de 256/512/1.024) midiendo la varianza entre semillas, algo que este release no cubre con una sola semilla.
- Estudio del impacto de datos sintéticos: comparar este adaptador con variantes entrenadas sobre datos filtrados por calidad o sobre datos humanos permite cuantificar la deriva introducida por el generador `calm3-22b-chat` en estilo, factualidad y tasa de rechazo.
- Generación de candidatos para anotación humana: el adaptador puede producir respuestas de diálogo que un anotador filtre y corrija, aprovechando su sesgo hacia el formato multi-turno japonés; el material resultante es útil como conjunto de evaluación, no como datos de entrenamiento directo.
- Validación de infraestructura de serving con adaptadores: sus 86,5 M de parámetros y 346 MB lo convierten en una carga ligera para probar pipelines multi-LoRA en vLLM o en `transformers` + `peft`, verificando carga en caliente, aislamiento entre adaptadores y consumo de VRAM antes de usar adaptadores mayores.
- Docencia y formación técnica: es un ejemplo completo y verificable de un ciclo QLoRA (selección de subconjunto, control de longitud por template, enmascarado de pérdida solo en el asistente, publicación de hashes y limitaciones explícitas), útil para enseñar buenas prácticas de documentación de experimentos.
- Auditoría de robustez y alineamiento: medir cómo 192 pasos de SFT sobre diálogo sintético alteran la tasa de rechazo, la verbosidad o la adherencia a instrucciones del base exige instrumentación propia; este adaptador proporciona un punto de comparación barato frente al base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que solo se realizó entrenamiento, sin benchmark, sin conjunto de validación y sin inspección humana de las generaciones.

| Ámbito de evaluación | Estado en esta publicación |
|---|---|
| MMLU / MMLU-Pro | no ejecutado |
| HumanEval / MBPP | no ejecutado |
| GSM8K / MATH | no ejecutado |
| Benchmarks en japonés (JGLUE, JaMT-Bench u otros) | no ejecutado |
| Conjunto de validación propio | no disponible |
| Inspección humana de salidas | no realizada |
| Métricas de entrenamiento (curva de pérdida) | no publicadas en la información disponible |

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del tamaño del base (~9B) y del adaptador; no proceden de mediciones publicadas por el autor.

- Adaptador: 346.302.176 bytes (unos 0,35 GB) en fp32; se carga junto al base y añade muy poca memoria.
- Base en bf16: aproximadamente 18 GB solo para pesos; con caché KV y contexto de 1.024 tokens, del orden de 19-20 GB. Encaja en A100 40 GB, H100 80 GB y, con margen ajustado, en una RTX 4090 de 24 GB.
- Base en 4-bit NF4: aproximadamente 4,5-5 GB de pesos, más el adaptador y activaciones, en torno a 6-7 GB en total. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB solo si se reduce el contexto y el batch.
- CPU: el base en 4-bit requiere del orden de 5-6 GB de RAM; en bf16, unos 18 GB. El entrenamiento (QLoRA) se realizó en una única GPU no especificada en la información disponible.
- Despliegue: `transformers` + `peft` es la vía directa (`PeftModel.from_pretrained` sobre el base). vLLM y TGI admiten adaptadores LoRA, aunque el soporte para esta combinación concreta de base y versión no está verificado en la información disponible. llama.cpp y Ollama requieren fusionar el adaptador con `merge_and_unload()` y convertir el resultado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para ninguno de los elementos de la comparación, por lo que la tabla compara procedencia, tamaño y licencia, no calidad.

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alfaplus/public-sft-qwen9b-v9` | Base ~9B + adaptador 86,6 M | 1.024 en entrenamiento (nativo del base: no disponible) | No evaluado | Apache-2.0 (adaptador) | Público en Hugging Face |
| `Qwen/Qwen3.5-9B` (base) | ~9B | No disponible | No disponible en la información proporcionada | Apache-2.0 | Público en Hugging Face |
| `alfaplus/public-sft-qwen9b-v6` | No disponible | No disponible | No disponible | No disponible | Hugging Face y FriendliAI |
| `alfaplus/public-sft-qwen9b-v2` | No disponible | No disponible | No disponible | No disponible | Público en Hugging Face |

Las versiones v2 y v6 del mismo autor aparecen en la búsqueda web, pero no se ha recuperado información sobre su configuración, dataset o evaluación, por lo que no es posible establecer diferencias técnicas con v9.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmark, validación ni inspección humana. No puede afirmarse que el adaptador mejore al base en japonés ni en ninguna otra capacidad; podría degradarlo.
- Datos sintéticos sin filtrado de calidad: las conversaciones las generó `calm3-22b-chat`, de modo que sus errores factuales, fallos de razonamiento, sesgos de estilo y preferencias culturales se transfieren al adaptador. El autor confirma que no hubo verificación humana ni filtro de calidad del contenido.
- Volumen y duración muy limitados: 1.024 ejemplos, 192 pasos, una sola semilla. No hay estimación de varianza entre ejecuciones y el resultado puede ser en gran medida ruido de entrenamiento.
- Sesgo de longitud y formato: se descartaron 4.285 ejemplos por superar los 1.024 tokens, lo que elimina del entrenamiento las conversaciones largas y puede sesgar el adaptador hacia respuestas breves. Además, ningún ejemplo incluye mensaje de sistema, por lo que el seguimiento de instrucciones de sistema del base puede verse afectado de forma no medida.
- Idioma: los datos son exclusivamente japoneses. El comportamiento en castellano, inglés u otros idiomas no está documentado y podría degradarse respecto al base.
- Licencia: los pesos del adaptador son Apache-2.0, lo que permite uso comercial y redistribución. Esa licencia no cubre el dataset original (que mantiene la suya, también Apache-2.0) ni altera los términos del modelo que generó los datos sintéticos, que deben consultarse en su origen. Apache-2.0 incluye una cláusula de exención de garantías y de responsabilidad.
- Distribución incompleta: solo se publica el adaptador en fp32; no hay pesos fusionados, GGUF ni checkpoint intermedio. Cualquier uso en producción exige fusionar o servir el adaptador junto al base, y verificar la compatibilidad de la versión de PEFT (0.20.0) y de `transformers` (5.15.0) usadas al guardarlo.
- Reproducibilidad parcial: `adapter_config.json` no registra la revisión del base (`revision: null`), aunque la model card documenta el commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; para replicar hay que fijarlo manualmente.
- Riesgo de alucinación: es el del base y no se ha medido; el ajuste sobre diálogo sintético no incorpora ningún mecanismo de verificación factual y podría reforzar respuestas fluidas pero incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfaplus/public-sft-qwen9b-v9
- Modelo base `Qwen/Qwen3.5-9B`: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit del base usado en el entrenamiento: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Dataset `kanhatakeyama/ramdom-to-fixed-multiturn-Calm3`: https://huggingface.co/datasets/kanhatakeyama/ramdom-to-fixed-multiturn-Calm3
- Revisión exacta del dataset: https://huggingface.co/datasets/kanhatakeyama/ramdom-to-fixed-multiturn-Calm3/tree/01ec4ac58efac18fa45fc36cf06ab882ed0884f3
- Modelo generador de los datos sintéticos `cyberagent/calm3-22b-chat`: https://huggingface.co/cyberagent/calm3-22b-chat
- Perfil del autor: https://huggingface.co/alfaplus
- Versión anterior v2: https://huggingface.co/alfaplus/public-sft-qwen9b-v2
- Versión anterior v6: https://huggingface.co/alfaplus/public-sft-qwen9b-v6
- Endpoint de inferencia de v6 en FriendliAI: https://friendli.ai/models/alfaplus/public-sft-qwen9b-v6
