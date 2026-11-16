# hrm-labs/Qwen3.5-9B-Defiant-Fable

## Resumen

Qwen3.5-9B-Defiant-Fable es un ajuste fino (fine-tune) del modelo Qwen3.5 de 9B de parámetros, publicado por el usuario hrm-labs en Hugging Face. Se trata de una variante "abliterated" y "uncensored", es decir, con los mecanismos de rechazo y censura eliminados deliberadamente, construida sobre el trabajo previo de DavidAU (Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP). El modelo conserva la arquitectura transformer densa del Qwen3.5 original, con 8.953.803.264 parámetros totales, y está orientado a usos creativos, escritura de ficción, roleplaying y tareas generales sin restricciones de contenido.

El modelo se distribuye principalmente en formato GGUF (cuantizaciones regulares y MTP, es decir, multi-token prediction), lo que lo hace desplegable en hardware de consumo mediante llama.cpp u Ollama. El repositorio ocupa 204,9 GB, lo que refleja la gran cantidad de cuantizaciones publicadas. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la información disponible no detalla el alcance exacto de dichas capacidades.

La relevancia de este modelo radica en su doble naturaleza: por un lado, es un modelo pequeño (9B) que el autor afirma superar en siete benchmarks clave a modelos de mayor tamaño como Qwen3.5 27B, Qwen3.6 35B-A3B o Qwen3.6 27B; por otro, su carácter "uncensored" lo sitúa en un nicho concreto de aplicaciones creativas y de investigación sobre alineamiento. Es importante señalar que estas afirmaciones de rendimiento provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3.5), con soporte de decodificacion MTP (multi-token prediction) en las cuantizaciones GGUF |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP; cuantizaciones NEO Imatrix (mxfp8, mxfp4 en benchmarks; Q4_K_S, Q6, Q8 mencionadas); tensor de salida en 16 bits; tensores MTP en Q8_0 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal); bfloat16 mencionado en los tags; safetensors implicito por el dato de parametros reales |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9B de parámetros, derivado de la familia Qwen3.5. Sobre esa base, el autor original (DavidAU) realizó un proceso de ajuste fino multi-etapa y multi-modelo, combinando varios de sus fine-tunes de Qwen3.5 9B mediante merges. El objetivo declarado fue elevar la inteligencia general del modelo y su capacidad de seguimiento de instrucciones, ya que, según el autor, mejorar estas dos dimensiones eleva el rendimiento de extremo a extremo.

El proceso incluye una fase de "heretic'ing" (eliminación de mecanismos de rechazo) seguida de un entrenamiento posterior, lo que da lugar a un modelo completamente sin censura. También se menciona el uso de Unsloth en el pipeline de ajuste. Las cuantizaciones GGUF publicadas emplean la técnica NEO Imatrix, que según el autor mejora la precisión de las cuantizaciones entre un 2 y un 4 % respecto a GGUF normales, así como el rendimiento en contexto largo. Además, el tensor de salida (entre el 10 y el 20 % de la salida) se mantiene en precisión completa de 16 bits en todas las cuantizaciones, y los tensores MTP se fijan en Q8_0 para todas ellas. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Generación de texto general, con modo "thinking" (razonamiento explícito) y modo "instruct" (respuesta directa); el bloque de razonamiento ha sido compactado y, según el autor, es más potente en muchos casos.
- Razonamiento multi-paso y resolución de problemas, con modos de razonamiento adicionales (Spoon y Einstein) en las cuantizaciones MTP Q6/Q8, conmutables en tiempo de ejecución vía API y a nivel de mensaje en el chat.
- Generación de código, según los tags del modelo ("coder").
- Escritura creativa, ficción y roleplaying, con ausencia total de censura ("fully uncensored").
- Capacidades multimodales: el pipeline declarado es image-text-to-text y los tags incluyen "image-text-to-text", lo que indica soporte de entrada de imagen y texto, aunque no se detalla el alcance.
- Soporte multilingüe en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Decodificación especulativa mediante MTP (multi-token prediction) en las cuantizaciones GGUF etiquetadas como MTP, con tasas de aceptación de tokens que el autor sitúa en torno al 60 % para 2 tokens.
- No se menciona explícitamente soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa: el modelo está entrenado específicamente para escritura creativa y ficción sin restricciones de contenido, lo que lo hace adecuado para generar relatos, diálogos y tramas sin los filtros habituales de los modelos alineados.
- Roleplaying y personajes conversacionales: su naturaleza "uncensored" y su capacidad de mantener conversaciones multi-turno lo hacen idóneo para chatbots de personajes y simulaciones de rol, donde los modelos censurados suelen rechazar ciertos escenarios.
- Generación de código en entornos locales: con 9B de parámetros y cuantizaciones GGUF, puede ejecutarse en hardware de consumo para asistencia de programación sin depender de servicios en la nube.
- Investigación sobre alineamiento y seguridad: al ser un modelo "abliterated", sirve como caso de estudio para analizar qué comportamientos emergen al eliminar los mecanismos de rechazo y cómo afecta al rendimiento general.
- Procesamiento de documentos con imágenes: gracias a su pipeline image-text-to-text, puede emplearse para tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados, aunque el alcance exacto de la visión no está documentado.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_S (aproximadamente 130 t/s según el autor) y las MTP permiten inferencia rápida en GPUs de consumo, útil para prototipado y aplicaciones personales.
- Atención al cliente en nichos sin restricciones: para sectores donde los filtros de contenido de los modelos comerciales resultan limitativos (por ejemplo, ficción adulta o temáticas sensibles), el modelo ofrece respuestas sin rechazos.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se presentan en modo "instruct".

| Benchmark | Defiant-Fable bf16 | Defiant-Fable mxfp8 | Defiant-Fable mxfp4 | Qwen3.5-9B-Instruct mxfp8 | Qwen3.6-27B-Instruct mxfp8 | Qwen3.6-35B-A3B-Instruct mxfp8 |
|---|---|---|---|---|---|---|
| ARC-C | 0,649 | 0,647 | 0,640 | 0,571 | 0,647 | 0,581 |
| ARC-E | 0,832 | 0,836 | 0,824 | 0,719 | 0,803 | 0,757 |
| BoolQ | 0,895 | 0,895 | 0,886 | 0,895 | 0,910 | 0,892 |
| HellaSwag | 0,713 | 0,706 | 0,703 | 0,683 | 0,773 | 0,751 |
| OpenBookQA | 0,482 | 0,460 | 0,468 | 0,426 | 0,450 | 0,428 |
| PIQA | 0,783 | 0,784 | 0,780 | 0,770 | 0,806 | 0,803 |
| Winogrande | 0,699 | 0,695 | 0,691 | 0,671 | 0,742 | 0,688 |

El autor afirma que el modelo supera siete de siete benchmarks frente a Qwen3.5 9B, Qwen3.5 27B, Qwen3.6 35B-A3B y, en algunos casos, iguala a Qwen3.6 27B. Según la tabla, esto se cumple en ARC-C, ARC-E, HellaSwag, OpenBookQA, PIQA y Winogrande frente a Qwen3.5 9B, pero no frente a Qwen3.6 27B en HellaSwag, PIQA ni Winogrande. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización Q4 (aproximadamente 4 bits), un modelo de 9B requiere en torno a 5-6 GB de VRAM; en Q8, alrededor de 9-10 GB; en bf16, aproximadamente 18 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4070/4080/4090 para Q8 y bf16; A100 o H100 para despliegues de mayor throughput o precisión completa.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en GPUs con 8-12 GB de VRAM; en Q8 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. No se menciona soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: el autor indica aproximadamente 130 t/s en Q4_K_S con GGUF regulares; las variantes MTP, con una tasa de aceptación del 60 % para 2 tokens, pueden superar esa cifra. Se recomienda temperatura igual o inferior a 1 y repetition penalty desactivado (valor 1) para no degradar el rendimiento de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Defiant-Fable | 8,95B | No disponible | Apache 2.0 | GGUF, bf16 | Fine-tune uncensored; benchmarks superiores al base en 6 de 7 pruebas segun el autor |
| Qwen3.5-9B-Instruct | 9B | No disponible | Apache 2.0 (presumible) | Safetensors, GGUF | Modelo base alineado; menor rendimiento en ARC-C, ARC-E, HellaSwag, OpenBookQA, PIQA y Winogrande |
| Qwen3.6-27B-Instruct | 27B | No disponible | No disponible | No disponible | Mayor tamaño; supera al Defiant-Fable en HellaSwag, PIQA y Winogrande, pero no en ARC-C, ARC-E, BoolQ ni OpenBookQA segun los datos del autor |
| Qwen3.6-35B-A3B-Instruct | 35B (MoE, activos no disponibles) | No disponible | No disponible | No disponible | Mayor tamaño; el Defiant-Fable lo supera en la mayoria de benchmarks listados segun el autor |

## Limitaciones y advertencias

- Modelo completamente sin censura ("fully uncensored"): puede generar contenido ofensivo, ilegal o dañino sin rechazo. No es apto para aplicaciones orientadas al público general sin moderación externa.
- Riesgo elevado de alucinación: como todo modelo de 9B, tiende a inventar datos, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Los benchmarks presentados son autoinformados por el autor y no han sido verificados de forma independiente; además, se ejecutaron en modo instruct, y el propio autor reconoce que los resultados en modo thinking difieren.
- El proceso de "abliteración" puede degradar capacidades de razonamiento y seguridad; no hay estudios independientes sobre el impacto real en tareas de producción.
- Longitud de contexto no documentada en la información disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura conlleva riesgos legales y reputacionales según la jurisdicción y el sector.
- El pipeline image-text-to-text sugiere capacidades multimodales, pero no se detalla su alcance ni su calidad; no debe asumirse un rendimiento de visión comparable al de modelos especializados.
- El repositorio ocupa 204,9 GB debido a la multitud de cuantizaciones; conviene descargar solo la variante necesaria.
- Las cuantizaciones MTP requieren temperatura baja y repetition penalty desactivado; si la tasa de aceptación de tokens cae por debajo del 50 %, el autor recomienda usar las cuantizaciones regulares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrm-labs/Qwen3.5-9B-Defiant-Fable
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor original (DavidAU): https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs de DavidAU: https://huggingface.co/DavidAU/support
- Modelo relacionado Qwen3.6-27B-Fable-Fusion-711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
