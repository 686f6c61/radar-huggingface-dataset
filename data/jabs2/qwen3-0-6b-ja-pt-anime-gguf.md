# Jabs2/Qwen3-0.6B-JA-PT-Anime-GGUF

## Resumen

Qwen3-0.6B-JA-PT-Anime-GGUF es un ajuste fino por destilación del modelo Qwen/Qwen3-0.6B, publicado por el usuario Jabs2, especializado en la traducción de japonés a portugués de diálogos de anime. El modelo se distribuye únicamente en formato GGUF cuantizado para llama.cpp, con un total de 596.049.920 parámetros (0,6 B) y una licencia declarada Apache-2.0 heredada del modelo base. Su pipeline declarado en HuggingFace es "translation" y el único idioma etiquetado es el japonés, ya que el portugués se emplea como lengua de salida.

El problema que aborda es muy concreto: conseguir una traducción japonés-portugués aceptable en dispositivos que no pueden cargar modelos de más de un gigabyte. El autor entrenó un QLoRA (r=32, 1.500 pasos, batch efectivo 32, bf16) destilando el comportamiento de fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual sobre 3.841 líneas de diálogo del dataset público joujiboi/japanese-anime-speech. La pérdida de entrenamiento bajó de 2,62 a 0,32.

La relevancia del modelo es fundamentalmente práctica: en el conjunto de validación, el quantizado Q4_K_M (397 MB) alcanza un 68,7% de salidas consideradas "portugués limpio" frente al 5,0% del modelo original LMT-60-0.6B en Q4_K_M (484 MB), con solo 3 apariciones de japonés residual en la salida frente a 152. Además, se ha validado en un Motorola Edge 30 (ARM64, 4 hilos) a unos 2,1 tokens/s. Es, por tanto, un artefacto de nicho orientado a subtitulado local en móvil, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen3 (Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen3-0.6B; no especificado en la model card |
| Tipos de cuantizacion | GGUF: Q4_K_M (397 MB), Q6_K (623 MB), Q8 (69,3% de PT limpio); el autor recomienda Q4_K_M como mejor coste-beneficio |
| Idiomas soportados | japonés como entrada; portugués como salida (etiqueta oficial: ja) |
| Licencia | apache-2.0 (modelo base); el autor advierte de que el profesor y el dataset tienen licencias propias a revisar y restringe el uso a fines personales |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3-0.6B, un transformer decoder-only denso de 0,6 B de parámetros. El ajuste se realizó con QLoRA de rango 32 sobre 1.500 pasos, con batch efectivo de 32 y precisión bf16, sobre una única GPU RTX 3070. La pérdida pasó de 2,62 a 0,32. El procedimiento de fusión y exportación descrito por el autor es: `merge_and_unload` de PEFT, `convert_hf_to_gguf.py` y `llama-quantize Q4_K_M`.

El entrenamiento es una destilación de un modelo profesor de terceros, fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual, cuyo tokenizer es distinto y que se usó como referencia de comportamiento, no como inicialización. El corpus de destilación son 3.841 líneas de diálogo del dataset joujiboi/japanese-anime-speech, es decir, habla de anime, con la puntuación y las muletillas propias de ese registro. No se documenta RLHF ni DPO en la información disponible, ni ninguna innovación de atención, decodificación especulativa o mecanismo híbrido. La innovación es de escala y de formato: comprimir el comportamiento de un traductor de 1,8 B en un 0,6 B que quepa en 397 MB.

## Capacidades

- Traducción de japonés a portugués de enunciados cortos de diálogo, con un único turno de traducción por invocación.
- Salida directa de la traducción, sin texto explicativo, cuando se usa el prompt recomendado.
- Funcionamiento en CPU sobre llama.cpp y en Android ARM64 mediante llama-cpp, con tokenizer de Qwen3 y chat template aplicado automáticamente por el runtime.
- Formato de prompt documentado: mensaje de usuario con la cadena "Translate the following Japanese text into Portuguese. Output only the translation." seguido del texto japonés, o bien el ChatML de Qwen3 terminado en `<|im_end|>`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, modo thinking, visión, audio ni matemáticas.
- Capacidad multilingüe limitada al par japonés-portugués; el resto de idiomas del modelo base no se ha evaluado ni se declara soportado.
- Comportamiento de fallo característico: el modelo tiende a acortar o truncar la frase en lugar de inventar contenido en japonés.

## Casos de uso

- Subtitulado en tiempo real de anime en móviles de gama baja: con 397 MB en Q4_K_M y ~2,1 tokens/s medidos en un Motorola Edge 30, encaja en el presupuesto de memoria de un teléfono Android que no puede cargar modelos de 1,13 GB. Es el escenario para el que fue diseñado.
- Integración en reproductores con reconocimiento de voz: el autor indica que el modelo funciona con el prompt exacto que usa GoAnime TV y que, dado que acorta en vez de alucinar, la heurística `isPauseOnly` del STT resulta suficiente para filtrar segmentos vacíos.
- Fansubbing asistido en portugués: traducir los diálogos de un episodio para revisión humana posterior, aprovechando que el fallo dominante es la omisión y no la invención, lo que facilita la corrección manual.
- Preprocesado de corpus de diálogo japonés: generar borradores de traducción al portugués para alinear o anotar grandes volúmenes de líneas de anime antes de una revisión más costosa.
- Traducción local sin conexión: al ser GGUF y ejecutable en CPU, permite traducción en dispositivos sin red y sin enviar contenido a servicios externos.
- Prototipado e investigación en destilación de traductores: sirve como caso de estudio reproducible (QLoRA r=32, 1.500 pasos, RTX 3070) del límite de capacidad de un 0,6 B frente a un profesor de 1,8 B.
- Aplicaciones de vídeo con subtítulos superpuestos: por su latencia baja y su consumo reducido, puede insertarse en pipelines de ffmpeg o mpv vía llama.cpp para generar subtítulos al vuelo.
- Traducción de texto japonés de registro coloquial en juegos o novelas visuales, siempre que el registro se parezca al habla de anime y con revisión humana, ya que el corpus de entrenamiento es exclusivamente habla de anime.

## Benchmarks y rendimiento

Datos del holdout declarados por el autor: 179 líneas del episodio 3 de Haibane Renmei, fuera del entrenamiento. La métrica "PT limpio" exige ausencia de japonés en la salida, presencia de verbo en portugués y más de una palabra.

| Modelo | Tamano | PT limpio | Japones en la salida |
|---|---:|---:|---:|
| LMT-60-0.6B Q4_K_M (original) | 484 MB | 5,0% | 152 |
| LMT-60-0.6B Q6_K (original) | 623 MB | 11,7% | 132 |
| Este modelo, Q4_K_M | 397 MB | 68,7% | 3 |
| Este modelo, Q6_K | 623 MB | 69,8% | no disponible |
| Este modelo, Q8 | no disponible | 69,3% | no disponible |

Validación en dispositivo real, Motorola Edge 30 (ARM64, 4 hilos, llama.cpp Android), con el prompt de GoAnime TV: 13 de 15 líneas producidas en portugués, a aproximadamente 2,1 tokens/s. El autor señala que Q4, Q6 y Q8 rinden de forma equivalente, lo que indica que el cuello de botella es la capacidad del modelo de 0,6 B y no la precisión de cuantización.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU o COMET) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 400 MB en Q4_K_M, 623 MB en Q6_K. Con contexto y overhead de llama.cpp, el consumo práctico se sitúa en el entorno de 0,6 a 1,0 GB, aunque no se proporciona una medición exacta.
- Cabe en GPUs de consumo muy modestas y en GPUs integradas; el cuello de botella no es la VRAM sino la velocidad de decodificación en CPU.
- Validado en un SoC móvil ARM64 (Motorola Edge 30) con 4 hilos de CPU, a ~2,1 tokens/s, sin GPU dedicada.
- GPUs recomendadas: no se documentan recomendaciones específicas. Se usó una RTX 3070 para el entrenamiento (QLoRA), no para inferencia.
- Opciones de despliegue: llama.cpp (referencia del autor), llama-cpp Android, Ollama y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI, habituales para GPUs de datacenter.
- Latencia y throughput: ~2,1 tokens/s en el dispositivo móvil citado. Para GPU de consumo se puede esperar un throughput muy superior, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PT limpio (holdout) | Japones en salida | Tamano Q4_K_M | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (Qwen3-0.6B destilado) | 0,6 B | 32.768 (heredado del base) | 68,7% | 3 | 397 MB | Apache-2.0 (base); profesor y dataset a revisar |
| LMT-60-0.6B Q4_K_M (original) | 0,6 B | no disponible | 5,0% | 152 | 484 MB | no disponible |
| LMT-60-0.6B Q6_K (original) | 0,6 B | no disponible | 11,7% | 132 | 623 MB | no disponible |
| Hy-MT2-1.8B-JP-Manga-Finetune-v3 (profesor) | 1,8 B | no disponible | no evaluado en el holdout segun la informacion disponible | no disponible | no disponible (se cita un tamano de referencia de 1,13 GB) | licencia propia a revisar |

## Limitaciones y advertencias

- Modo de fallo principal: truncamiento. El modelo acorta la frase en lugar de alucinar contenido nuevo. Para subtitulado es preferible a inventar, pero degrada la fidelidad en frases largas.
- Capacidad limitada por el tamano: Q4, Q6 y Q8 obtienen resultados prácticamente idénticos (68,7%, 69,8% y 69,3%), lo que indica que el techo lo marca el modelo de 0,6 B, no la cuantización.
- Dominio restringido: entrenado sobre 3.841 líneas de habla de anime. El rendimiento en japonés formal, técnico, periodístico o de negocio no está evaluado y previsiblemente será peor.
- Un solo par de idiomas: no se declara ni se ha evaluado la traducción a otros idiomas distintos del portugués.
- Idiomas soportados oficialmente: solo japonés (etiqueta `ja`). El autor no documenta evaluación en otras lenguas.
- Riesgo de sesgos: no se documenta ningún análisis de sesgos. El corpus de origen son voces de anime, con la sobrerrepresentación de registros, roles de género y expresiones estereotipadas habitual en ese material.
- Restricciones de licencia: aunque el modelo base es Apache-2.0, el profesor (fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3) tiene licencia propia y el dataset joujiboi/japanese-anime-speech también debe verificarse. El autor restringe explícitamente el uso a fines personales y advierte de que no es un modelo para distribución comercial sin revisar los términos del profesor y del dataset.
- Detalle operativo relevante: el runtime GoAnime TV clasifica el modelo por la cadena del nombre de archivo (`lmt` para el prompt de LMT-60, `hymt` para prompt crudo). El nombre de archivo de este GGUF no debe contener ninguna de esas dos cadenas, o se aplicará el prompt equivocado.
- Sin soporte documentado de tool calling, agentes, visión ni audio; no es un modelo de propósito general ni un asistente conversacional.
- Riesgo de alucinación: el autor no reporta invención de contenido, sino el comportamiento contrario (truncamiento). No obstante, no hay una evaluación sistemática de alucinación en dominios fuera del corpus de anime.
- El modelo tiene 0 descargas y 0 "likes" en el momento del análisis, y fue publicado sin revisión por terceros; no hay validación independiente de los resultados del holdout.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jabs2/Qwen3-0.6B-JA-PT-Anime-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor (destilación): https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3
- Versión GGUF del profesor: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/joujiboi/japanese-anime-speech
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a nombramientos corporativos de Banco Sabadell y no guardan relación con el modelo.
