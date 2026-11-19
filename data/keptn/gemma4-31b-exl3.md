# keptn/gemma4-31b-exl3

## Resumen

Gemma 4 31B-it EXL3 es una cuantización del modelo multimodal google/gemma-4-31B-it, publicada por el usuario keptn, empaquetada en cuatro ficheros con formato EXL3-V3 para el motor de inferencia radiance. El modelo base es un transformer multimodal (image-text-to-text) de Google con 31 mil millones de parámetros, del que esta ficha no dispone de especificaciones arquitectónicas detalladas más allá de lo que refleja la model card del autor. La cuantización emplea precisión mixta: cada una de las 350 capas lineales del transformer recibe un ancho propio de entre 2,75 y 6,0 bits, elegido mediante un ajuste a la divergencia KL medida contra el original en bf16.

La relevancia de esta publicación es doble. Por un lado, ofrece versiones del modelo que caben en GPUs de consumo y estaciones de trabajo AMD (el autor etiqueta explícitamente rocm, amd y rdna4), con tamaños que van de 16,77 GiB a 26,15 GiB. Por otro, conserva en cada fichero la cabeza de salida en int8, el embedding de tokens en bf16, las torres de visión y audio y la cabeza de borrador MTP (multi-token prediction), lo que permite decodificación especulativa y mantiene las capacidades multimodales del original.

Es importante señalar que los ficheros son experimentales: requieren dos pull requests de radiance que no están fusionados en el momento de la publicación (#401 para EXL3-V3 y #537 para el plugin de Gemma 4). La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión, torre de audio y cabeza de borrador MTP; cuantización EXL3-V3 de precisión mixta |
| Parametros totales | 31 mil millones (modelo base google/gemma-4-31B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 mixto a 3,25 / 4,07 / 4,89 bits por peso (media sobre capas lineales, rango 2,75-6,0 bits) y EXL3 uniforme a 6,0 bits; cabeza de salida int8; embedding bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3-V3 (`.rad`) para el motor radiance; incluye `config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google, tal como indica el pipeline image-text-to-text y la presencia de torres de visión y audio en los ficheros cuantizados. Esta publicación no entrena un modelo nuevo: es un proceso de cuantización post-entrenamiento sobre google/gemma-4-31B-it. La innovación técnica reside en el esquema de precisión mixta EXL3-V3: las 350 capas lineales de los bloques del transformer reciben anchos individuales entre 2,75 y 6,0 bits, seleccionados por un algoritmo que minimiza la divergencia KL medida sobre preguntas de MT-Bench. Los ficheros conservan además la cabeza de salida en int8, el embedding de tokens en bf16, las torres de visión y audio y la cabeza de borrador MTP, lo que habilita decodificación especulativa dentro del motor radiance.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. Tampoco se detalla la arquitectura interna del transformer (número de capas, dimensión oculta, mecanismo de atención) más allá del recuento de 350 capas lineales.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo instruct (sufijo -it).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión incluida en cada fichero.
- Procesamiento de audio, según la mención explícita de la torre de audio en la model card.
- Decodificación especulativa mediante la cabeza de borrador MTP (multi-token prediction) incluida en los pesos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo AMD con ROCm: la cuantización a 3,25 bpw (16,77 GiB) permite ejecutar un modelo de 31B en GPUs RDNA4 de gama alta, útil para prototipado y experimentación sin depender de la nube.
- Asistentes multimodales de imagen y texto: la torre de visión conservada permite tareas de descripción de imágenes, extracción de información de capturas o documentos escaneados y respuesta a preguntas visuales.
- Transcripción y análisis de audio: la torre de audio incluida habilita pipelines de comprensión de audio dentro del mismo modelo, sin un componente separado.
- Inferencia de baja latencia con decodificación especulativa: la cabeza MTP permite generar varios tokens por paso en radiance, adecuada para chat interactivo donde la latencia percibida importa.
- Evaluación de cuantizaciones en investigación: las cuatro variantes con KL medido (0,0181 a 0,00226) permiten estudiar el compromiso entre tamaño, calidad y velocidad en un mismo modelo, con una referencia cuantitativa publicada.
- Servicio de chat con contexto conversacional: el formato instruct y el soporte multi-turno lo hacen apto para atención al cliente o asistentes internos, siempre que se valide la calidad tras la cuantización a 3,25 bpw (96,7% de coincidencia en el token superior).

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica una medida de fidelidad de la cuantización: divergencia KL frente al original en bf16 sobre las 80 preguntas de MT-Bench (ambos turnos, 42.283 posiciones), junto con el porcentaje de posiciones en que el token superior coincide.

| Fichero | Tamano | KL media | Token superior identico |
|---|---|---|---|
| EXL3 3,25 bpw mix | 16,77 GiB | 0,0181 | 96,7% |
| EXL3 4,07 bpw mix | 19,57 GiB | 0,00598 | 98,0% |
| EXL3 4,89 bpw mix | 22,36 GiB | 0,00314 | 98,6% |
| EXL3 6,0 bpw | 26,15 GiB | 0,00226 | 98,7% |
| keptn/gemma4-31b-a4 (referencia) | 19,95 GiB | 0,0246 | 96,1% |
| keptn/gemma4-31b-w5 (referencia) | 23,36 GiB | 0,00792 | 97,8% |
| keptn/gemma4-31b-i8g (referencia) | 33,37 GiB | 0,00236 | 98,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 16,77 GiB para la variante de 3,25 bpw, 19,57 GiB para 4,07 bpw, 22,36 GiB para 4,89 bpw y 26,15 GiB para 6,0 bpw, más el espacio de trabajo del motor radiance (KV cache, buffers), que la model card no cuantifica.
- GPUs recomendadas: el autor etiqueta ROCm, AMD y RDNA4, por lo que el objetivo declarado son GPUs AMD con soporte ROCm. No se especifican modelos concretos de GPU.
- GPU de consumo: la variante de 3,25 bpw (16,77 GiB) es la única que podría encajar en GPUs de consumo con 24 GB o más de VRAM; las demás requieren GPUs de estación de trabajo o de centro de datos. No se confirma compatibilidad con GPUs NVIDIA en la información disponible.
- Opciones de despliegue: exclusivamente el motor radiance, compilado desde la rama del PR #537 (que depende del PR #401). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.rad`.
- Latencia y throughput: la model card anuncia que publicará cifras de velocidad ("speed numbers"), pero no están incluidas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Calidad (KL MT-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| keptn/gemma4-31b-exl3 (3,25 bpw) | 31B | no disponible | 16,77 GiB | 0,0181 | Apache 2.0 | radiance (PR sin fusionar) |
| keptn/gemma4-31b-exl3 (6,0 bpw) | 31B | no disponible | 26,15 GiB | 0,00226 | Apache 2.0 | radiance (PR sin fusionar) |
| keptn/gemma4-31b-a4 | 31B | no disponible | 19,95 GiB | 0,0246 | Apache 2.0 | no disponible |
| keptn/gemma4-31b-w5 | 31B | no disponible | 23,36 GiB | 0,00792 | Apache 2.0 | no disponible |
| keptn/gemma4-31b-i8g | 31B | no disponible | 33,37 GiB | 0,00236 | Apache 2.0 | no disponible |

Las alternativas comparables son otras cuantizaciones del mismo modelo base publicadas por el mismo autor. No se dispone de datos para comparar con cuantizaciones de otros formatos (GGUF, AWQ, GPTQ) del mismo Gemma 4 31B-it en la información proporcionada.

## Limitaciones y advertencias

- Carácter experimental: los ficheros requieren dos pull requests de radiance no fusionados (#401 y #537); hay que compilar el motor desde una rama concreta, lo que complica el despliegue en producción.
- Formato propietario: el formato `.rad` solo lo lee radiance, lo que limita la portabilidad frente a GGUF o safetensors.
- Pérdida de calidad medible: incluso la variante de 6,0 bpw difiere del bf16 original (KL 0,00226, 98,7% de coincidencia en el token superior); en 3,25 bpw la coincidencia baja al 96,7%, con riesgo de degradación en tareas sensibles a tokens poco probables.
- Compatibilidad de hardware restringida: el soporte declarado es ROCm/AMD RDNA4; no se confirma funcionamiento en NVIDIA ni en otras arquitecturas.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluación previa.
- Sesgos y alucinaciones: no hay información específica en la model card; al tratarse de una cuantización, hereda los sesgos y el riesgo de alucinación del modelo base google/gemma-4-31B-it, que no se documentan aquí.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de desplegarlo en producción.
- Sin datos de benchmarks de tareas: no hay resultados de MMLU, HumanEval o GSM8K, por lo que la calidad en tareas concretas debe validarse por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-exl3
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Pull request EXL3-V3 (#401): https://codeberg.org/StillDeadcode/radiance/pulls/401
- Pull request plugin Gemma 4 (#537): https://codeberg.org/StillDeadcode/radiance/pulls/537
- Cuantización de referencia keptn/gemma4-31b-a4: https://huggingface.co/keptn/gemma4-31b-a4
- Cuantización de referencia keptn/gemma4-31b-w5: https://huggingface.co/keptn/gemma4-31b-w5
- Cuantización de referencia keptn/gemma4-31b-i8g: https://huggingface.co/keptn/gemma4-31b-i8g
