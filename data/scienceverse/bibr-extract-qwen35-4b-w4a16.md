# scienceverse/bibr-extract-qwen35-4b-W4A16

## Resumen

bibr-extract-qwen35-4b-W4A16 es la versión cuantizada a int4 del modelo de extracción estructurada `scienceverse/bibr-extract-qwen35-4b`, el «estudiante» que utiliza la herramienta de código abierto bibr para extraer metadatos bibliográficos de artículos científicos. Lo desarrolla scienceverse y se distribuye con licencia Apache 2.0. El checkpoint del que parte es, a su vez, la fusión de un LoRA sobre Qwen3.5-4B (revisión `6ab47a4`), por lo que hereda la arquitectura híbrida de ese modelo base.

El modelo resuelve un problema muy concreto: convertir el texto (y las imágenes de página) de un artículo en campos estructurados —título, DOI, autores, referencias y resumen— dentro de una cadena de extracción científica. No es un modelo conversacional de propósito general, sino un componente especializado con una plantilla de chat y un formato de salida fijados por el pipeline.

La relevancia de esta variante es de despliegue: pasa de 9,32 GB de pesos en bf16 a 4,03 GB en int4 (3,11 GiB residentes en GPU con `--language-model-only`), lo que permite servirlo en tarjetas donde el modelo en bf16 no entra y, además, casi duplica la velocidad de decodificación. El autor reporta 218 aciertos de 252 artículos en su arnés de evaluación, frente a 217 del modelo bf16 en la misma máquina, es decir, sin degradación medible más allá del ruido de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas con atención lineal Gated DeltaNet y 8 capas con atención completa, más torre de visión y cabeza MTP (desglose inferido de las 96 proyecciones MLP, 32 proyecciones q/k/v/o y 72 proyecciones de atención lineal cuantizadas) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (las secuencias de calibración se limitaron a 4.096 tokens) |
| Tipos de cuantización | W4A16 GPTQ en formato `pack-quantized` de compressed-tensors: pesos int4 simétricos, activaciones en 16 bits, group size 128, block size 128, dampening 0,01, ordenación estática de activaciones. 200 capas lineales cuantizadas; 538 tensores se conservan sin cuantizar (embeddings, LM head atada, `in_proj_a`/`in_proj_b`, `conv1d`, `dt_bias`, pesos RMSNorm, torre de visión y cabeza MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (librería vLLM); existen variantes GGUF y MLX 8-bit en repositorios separados |

Otros datos: tamaño del repositorio 4,0 GB, ficheros de pesos 4,03 GB (frente a 9,32 GB en bf16), pipeline declarado `image-text-to-text`, creado el 26 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo es una cuantización, no un reentrenamiento: parte de `scienceverse/bibr-extract-qwen35-4b` (revisión `6ab47a4`), que a su vez es la fusión de un LoRA sobre Qwen3.5-4B. La arquitectura subyacente combina capas de atención lineal Gated DeltaNet con un subconjunto de capas de atención completa —un esquema híbrido pensado para reducir el coste del contexto largo—, e incorpora una torre de visión (de ahí el pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) que el autor aprovecha para decodificación especulativa en vLLM 0.32.

La conversión se realizó con llm-compressor 0.14.0.1 (compressed-tensors 0.19.0, transformers 5.17.0) sobre 200 capas lineales: las 96 proyecciones MLP, las 32 proyecciones q/k/v/o de atención completa y las 72 proyecciones de Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`). La calibración usó 512 conversaciones del propio conjunto de entrenamiento del estudiante, estratificadas por tarea con semilla 0: cada una es un prompt de extracción de bibr más la respuesta del profesor, renderizadas con la plantilla de chat del modelo y con el modo *thinking* desactivado. Proceden de 158 artículos con licencia CC BY de PubMed Central, con un máximo de 4.096 tokens por muestra y 789.503 tokens en total; se verificó por DOI y título que ningún artículo de evaluación estuviera entre ellos. Tras la conversión se corrigieron dos artefactos del guardado: 81 pesos RMSNorm alterados por redondeo bf16 (hasta 0,016) y 48 tensores F32 almacenados como BF16, ambos restaurados desde el checkpoint fuente y comprobados tensor a tensor.

## Capacidades

- Extracción estructurada de campos bibliográficos: título, DOI, autores y referencias, con plantilla de prompt y formato de salida definidos por el pipeline bibr.
- Generación de resúmenes de *abstract*: ROUGE-L medio de 0,955 en el conjunto de evaluación del autor.
- Entrada multimodal: el checkpoint conserva la torre de visión en bf16 y declara el pipeline `image-text-to-text`, por lo que admite imagen además de texto.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint (k=3 en vLLM 0.32).
- Ejecución con el modo *thinking* desactivado en la configuración de referencia (la calibración se hizo así).
- Conversacional, según la etiqueta del modelo, pero restringido en la práctica al dominio de extracción científica.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está diseñado para una llamada de extracción por unidad de trabajo.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- **Revisión sistemática de literatura a escala**: alimentar el pipeline bibr con PDF de PubMed Central y obtener por artículo el título, el DOI normalizado, la lista de autores y las referencias, con 218 de 252 extracciones correctas en el arnés del autor. Adecuado porque el modelo está calibrado exactamente con ese formato de prompt y ese dominio.
- **Enriquecimiento de gestores de referencias**: completar y normalizar registros incompletos (DOI ausente, autores truncados, referencias sin resolver) en una base de datos bibliográfica; el modelo mantiene los campos «suelo» (título, DOI, autores, referencias) con una tasa de acierto igual o superior al modelo bf16.
- **Generación automática de resúmenes**: producir el *abstract* condensado de cada artículo con una fidelidad medida de 0,955 ROUGE-L, útil en boletines internos o índices de búsqueda.
- **Servicio de extracción con alta concurrencia**: atender una cola de peticiones en una API interna; con concurrencia 8 y vLLM 0.31 sostiene 1.118 tok/s agregados, un 59 % más que el modelo bf16 en la misma tarjeta.
- **Despliegue en estaciones de trabajo modestas**: los pesos ocupan 3,11 GiB en GPU con `--language-model-only`, lo que deja margen para caché KV en tarjetas de 12-16 GB donde la versión bf16 (7,99 GiB de pesos) resulta ajustada.
- **Prototipado local en portátiles**: mediante el repositorio GGUF con llama.cpp u Ollama, o la variante MLX 8-bit en Apple Silicon, para validar el pipeline de extracción sin GPU de datacenter.
- **Verificación de citas en documentación científica**: comparar las referencias extraídas de un manuscrito con las de la fuente publicada; el modelo gana dos artículos en el campo de referencias respecto al bf16 en el conjunto de 252.
- **Evaluación comparativa de cuantizaciones**: servir como referencia reproducible para medir el impacto de W4A16 en tareas de extracción estructurada con el arnés de bibr, dado que el autor publica intervalos de confianza y recuentos de ganados/perdidos.

## Benchmarks y rendimiento

Resultados del arnés de extracción de bibr del 9 de octubre de 2026 (bibr 9621739, scorer v5, 252 artículos de desarrollo: gate192 + ci60, OCR reproducido desde caché). Las comparaciones son pareadas, con bootstrap por artículo de 10.000 repeticiones y margen de no inferioridad de −4 pp; un artículo equivale a 0,4 pp del total.

| Modelo | Servido | Aciertos / 252 | Δ pp frente a bf16 4B, misma máquina [IC 95%] | Δ pp frente a la ejecución de referencia [IC 95%] |
|---|---|---|---|---|
| bibr-extract-qwen35-4b, bf16 (checkpoint fusionado del que se parte, misma tarjeta y arnés) | vLLM 0.31.0, RTX 5090 | 217 | – | +0,4 [0,0, +1,2] |
| bibr-extract-qwen35-4b, ejecución de referencia (LoRA sin fusionar sobre Qwen3.5-4B, otra GPU) | vLLM 0.31.0 | 216 | – | – |
| **este modelo** | vLLM 0.31.0, RTX 5090 | **218** | +0,4 [−0,8, +1,6]; 2 ganados, 1 perdido | +0,8 [−0,8, +2,4]; 3 ganados, 1 perdido |
| **este modelo** + decodificación especulativa MTP (k=3) | vLLM 0.32.0, RTX 5090 | **218** | +0,4 [−0,8, +1,6]; 2 ganados, 1 perdido | +0,8 [−0,8, +2,4]; 3 ganados, 1 perdido |

Desglose por subconjunto (vLLM 0.31, frente al bf16 de la misma máquina):

- gate192 (n=192): +0,5 [0,0, +1,6], 1 ganado. Frente a la ejecución de referencia: +1,0 [0,0, +2,6].
- ci60 (n=60): +0,0 [−5,0, +5,0], 1 ganado y 1 perdido. El límite inferior queda por debajo de −4 pp, por lo que este subconjunto por sí solo no demuestra no inferioridad (un artículo son 1,7 pp aquí).
- Con MTP (vLLM 0.32): gate192 +0,0 [0,0, 0,0] sin cambios; ci60 +1,7 [−3,3, +6,7], 2 ganados y 1 perdido. Frente a la referencia: gate192 +0,5 [0,0, +1,6].

Campos «suelo» (252 artículos, vLLM 0.31, frente al bf16 de la misma máquina): el DOI es idéntico; autores gana 1 artículo y referencias gana 2; título queda plano, +0,0 [−1,6, +1,6] con 2 ganados y 2 perdidos, ambos en ci60 (en ci60 solo: −3,3 pp [−8,3, 0,0]). Con MTP en vLLM 0.32: título −0,4 [−2,0, +0,8] (1 ganado, 2 perdidos), DOI idéntico, autores gana 2 y referencias gana 3.

*Abstract*: ROUGE-L medio de 0,955 en vLLM 0.31, igual que el modelo bf16, y 0,951 con MTP en vLLM 0.32.

Ruido de medida: dos ejecuciones idénticas del arnés coinciden en aproximadamente el 96 % de las respuestas del LLM, porque bibr elige un límite de *fence* aleatorio en cada llamada; diferencias de uno o dos artículos están dentro del ruido entre ejecuciones.

Velocidad (RTX 5090, las mismas 351 peticiones de extracción reproducidas; las cifras bf16 en vLLM 0.31 son de la misma sesión y tarjeta):

| Métrica | bf16 4B | Este modelo |
|---|---|---|
| tok/s de decodificación por petición, concurrencia 1, vLLM 0.31 | 164,5 | 322,6 (1,96×) |
| tok/s agregados, concurrencia 8, vLLM 0.31 | 705 | 1.118 (1,59×) |
| tok/s de decodificación por petición, concurrencia 1, vLLM 0.32 + MTP k=3 | 320* | 469 (2,85×) |
| tok/s agregados, concurrencia 8, vLLM 0.32 + MTP k=3 | 1.214* | 1.377 (1,95×) |
| Pesos en memoria de GPU (`--language-model-only`) | 7,99 GiB | 3,11 GiB |

\* De una ejecución anterior en la misma tarjeta con las mismas 351 peticiones. Los ratios entre paréntesis son frente al modelo bf16 en vLLM 0.31 sin MTP.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **Pesos en VRAM**: 3,11 GiB con `--language-model-only` (frente a 7,99 GiB del bf16); los ficheros en disco son 4,03 GB. A esa cifra hay que sumar la caché KV, el contexto CUDA y cualquier otro uso de la GPU.
- **GPU probada**: las mediciones se hicieron en una RTX 5090. El autor indica que las cifras de memoria se emularon en una tarjeta de 32 GB y que **no se ejecutó ninguna tarjeta de 8-11 GB**.
- **¿Cabe en GPU consumer?** Con 3,11 GiB de pesos, en tarjetas de 12-16 GB (RTX 4070 Ti Super, 4080, 4090, 5070 Ti, 5080) quedaría margen amplio para caché KV, aunque el autor no lo verificó. En tarjetas de 8 GB el margen sería reducido y tampoco está verificado; conviene medir antes de comprometerse.
- **Aceleradores de datacenter**: A100, H100 y L40S no se mencionan en la información disponible; son compatibles con vLLM pero no hay cifras publicadas para este modelo.
- **Motores de despliegue**: vLLM 0.31.0 y 0.32.0 (formato compressed-tensors, con soporte de MTP k=3 en 0.32), llama.cpp u Ollama mediante la variante GGUF, MLX 8-bit en Apple Silicon, y endpoint gestionado en FriendliAI.
- **Rendimiento**: 322,6 tok/s por petición a concurrencia 1 y 1.118 tok/s agregados a concurrencia 8 con vLLM 0.31; con MTP k=3 en vLLM 0.32, 469 tok/s por petición y 1.377 tok/s agregados (RTX 5090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| **bibr-extract-qwen35-4b-W4A16** (este modelo) | 4,54 B | no disponible | 4,03 GB (3,11 GiB en GPU) | Apache 2.0 | safetensors int4 / compressed-tensors | 218/252 aciertos; 322,6 tok/s a concurrencia 1 |
| bibr-extract-qwen35-4b (bf16, modelo base) | 4,54 B | no disponible | 9,32 GB (7,99 GiB en GPU) | Apache 2.0 | safetensors bf16 | 217/252 aciertos; 164,5 tok/s a concurrencia 1 |
| bibr-extract-qwen35-4b-GGUF | no disponible | no disponible | no disponible | Apache 2.0 | GGUF | Variante para llama.cpp/Ollama |
| bibr-extract-qwen35-4b-mlx-8bit | no disponible | no disponible | no disponible | Apache 2.0 | MLX 8-bit | Variante para Apple Silicon |
| Qwen3.5-4B (modelo del que parte el estudiante) | ≈4 B según el nombre | no disponible | no disponible | no disponible | no disponible | Modelo generalista; no es un extractor especializado ni comparte el arnés de evaluación |

La comparación significativa es con el propio modelo bf16: misma calidad dentro del ruido (+0,4 pp, IC que cruza cero), la mitad de peso y entre 1,6 y 2,9 veces más velocidad. No se dispone de datos frente a otros extractores científicos de la competencia.

## Limitaciones y advertencias

- **Modelo especializado, no generalista**: está entrenado para el prompt y el formato de extracción de bibr. Usarlo como asistente conversacional o para otras tareas producirá resultados pobres.
- **No inferioridad no demostrada en el subconjunto ci60**: con n=60, el intervalo de confianza baja hasta −5,0 pp frente al bf16 y el margen de −4 pp no se cumple; un solo artículo pesa 1,7 pp. En título se observa una pérdida de −3,3 pp en ese subconjunto (IC hasta −8,3 pp).
- **Ruido entre ejecuciones**: dos ejecuciones idénticas coinciden en ~96 % de las respuestas porque bibr elige un límite de *fence* aleatorio; diferencias de uno o dos artículos no son señal.
- **Cuantización de 4 bits**: los pesos son int4 con group size 128; no se han publicado evaluaciones de esta variante fuera del arnés de extracción, así que su comportamiento en otras tareas no está caracterizado.
- **Dependencia del OCR**: el arnés reproduce el OCR desde caché; la calidad de la extracción dependerá del texto de entrada que produzca el OCR en producción.
- **Sesgo de dominio**: la calibración procede de 158 artículos CC BY de PubMed Central, es decir, literatura biomédica de acceso abierto. El rendimiento en otras disciplinas, idiomas o maquetaciones no está documentado.
- **Idiomas y contexto no documentados**: la model card no declara idiomas soportados ni longitud de contexto; las muestras de calibración se truncaron a 4.096 tokens, por lo que no hay garantía más allá de esa longitud.
- **Cifras de memoria no verificadas en GPU pequeñas**: el autor advierte explícitamente que no ejecutó tarjetas de 8-11 GB y que las cifras se emularon en una tarjeta de 32 GB.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia, no documentada en la información disponible; conviene verificarla antes de un despliegue comercial.
- **Reproducibilidad de la conversión**: el guardado de llm-compressor 0.14.0.1 introdujo dos artefactos que se corrigieron manualmente; quien reproduzca la cuantización debe aplicar las mismas correcciones.
- **Riesgo de alucinación en campos estructurados**: como cualquier modelo generativo, puede inventar un DOI o un autor plausible; en producción conviene validar el DOI contra un resolutor externo y aplicar reglas de formato.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-W4A16
- Modelo base bf16: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b
- Variante GGUF: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-GGUF
- Variante MLX 8-bit: https://huggingface.co/scienceverse/bibr-extract-qwen35-4b-mlx-8bit
- Repositorio del pipeline bibr: https://github.com/scienceverse/bibr
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Ficha en LLM Explorer: https://llm-explorer.com/model/scienceverse%2Fbibr-extract-qwen35-4b,75ZLtigXXy4Munr44Kac5y
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/scienceverse/bibr-extract-qwen35-4b
