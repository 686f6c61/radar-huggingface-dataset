# keptn/gemma4-12b-bf16

## Resumen

Gemma 4 12B-it (bf16) es un empaquetado del modelo instruido Gemma 4 12B de Google, publicado por el usuario keptn en HuggingFace, preparado específicamente para el motor de inferencia radiance sobre GPU AMD RDNA4. No es un modelo nuevo: son los pesos originales de `google/gemma-4-12B-it` tal como los distribuye Google, convertidos a un único archivo de 24,95 GiB en formato `.rad`, con la cabecera auxiliar (assistant head) de Gemma 4 incorporada como modelo borrador para decodificación especulativa.

El problema que resuelve es la falta de soporte directo de este checkpoint en entornos ROCm/RDNA4: radiance aún no incluye este modelo en sus versiones oficiales (requiere compilar desde el PR #338). La ficha destaca por su rigor en la verificación de calidad: compara las salidas con el original bf16 en HF transformers mediante KL divergence sobre 42.283 tokens de MT-Bench, obteniendo una desviación media de 0,00026 y un 99,6 % de coincidencia en el token top.

Es relevante porque ofrece inferencia multimodal (texto, imagen y audio) con contexto de 262.144 tokens sobre hardware AMD, con mediciones de rendimiento publicadas (62,7 tokens/s en decode con una Radeon AI PRO R9700, hasta 182,8 con cuatro tarjetas). La arquitectura base es un transformer multimodal de Google con soporte de visión y audio, y la licencia del empaquetado es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y audio) con cabecera auxiliar para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ninguna: pesos bf16 tal cual el checkpoint original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propio de radiance, un unico archivo de 24,95 GiB); sin calibracion de datos |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un modelo instruido multimodal de Google cuyo pipeline es image-text-to-text. Acepta entradas de texto, imagen y audio, e incorpora una torre de vision y un codificador de audio tal como vienen en el checkpoint original. La innovacion principal de este empaquetado no esta en la arquitectura del modelo sino en el despliegue: se anade la assistant head de `google/gemma-4-12B-it-assistant` como modelo borrador para decodificacion especulativa con 3 draft tokens, lo que acelera el decode sin alterar la distribucion de salida.

La conversion se realizo con la receta `gemma4-12b-bf16` mediante la herramienta `rad-convert`, verificando que se leen los 725 tensores del checkpoint. Todos los pesos permanecen en bf16; la unica modificacion tecnica es que la tabla de posiciones de la torre de vision se almacena como dos taps. No se aplico ninguna cuantizacion ni calibracion con datos. No hay informacion sobre el proceso de entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO), que corresponde a Google y no esta detallada en esta ficha.

## Capacidades

- Generacion de texto con modo thinking opcional, activable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Comprension de imagenes: validada sobre DocVQA y AI2D con 20 casos, replicando las respuestas del original en el 20/20 (KL media 0,00184).
- Transcripcion y comprension de audio: probado con 12 clips de LibriSpeech test-clean, con un word error rate del 6,81 % frente al 6,68 % del original en HF transformers.
- Pipeline multimodal image-text-to-text completo.
- Decodificacion especulativa con 3 draft tokens usando la assistant head de Google.
- Contexto largo de hasta 262.144 tokens por secuencia.
- Despliegue multi-GPU con tensor parallelism (1, 2 o 4 tarjetas de 32 GB) y P2P activable.

No hay informacion en la ficha sobre tool calling, capacidades agenticas ni soporte multilingue explicito.

## Casos de uso

- Despliegue multimodal en infraestructura AMD: el formato `.rad` y el soporte ROCm/RDNA4 lo hacen idoneo para organizaciones con parc de GPU AMD (Radeon AI PRO R9700) que quieren servir modelos multimodales sin pasar por CUDA.
- Analisis y pregunta-respuesta sobre documentos: el rendimiento validado en DocVQA permite construir pipelines de extraccion de informacion de documentos escaneados o capturas, con respuestas identicas al modelo original en los 20 casos probados.
- Transcripcion de audio con contexto visual: el codificador de audio (WER del 6,81 % en LibriSpeech) permite transcribir clips de voz combinandolos con instrucciones de texto en una sola peticion.
- Procesamiento de contextos muy largos: con 262.144 tokens de ventana y pools de KV que alcanzan hasta 1.610.544 tokens compartidos con 4 tarjetas y 8 secuencias, es adecuado para resumir o consultar documentos extensos, repositorios de codigo o historiales largos de conversacion.
- Servicios de inferencia con alta concurrencia: con 4 tarjetas se alcanzan 474 tokens/s agregados en 4 flujos y 6.191 tokens/s de prefill a 24k tokens, suficiente para servir varios usuarios simultaneos con latencias razonables.
- Comparacion y validacion de cuantizaciones: la ficha incluye mediciones KL contra el original bf16 y contra la version i8g del mismo autor, util como referencia para decidir entre precision completa y cuantizada segun el caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La ficha si publica mediciones propias de rendimiento y fidelidad:

Velocidad (Radeon AI PRO R9700 a 215 W, bf16 KV, 3 draft tokens, thinking off, temperatura 0,7; tokens por segundo, mediana):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un flujo | 62,7 | 113,3 | 182,8 |
| Prefill a 24k tokens | 2.743 | 4.620 | 6.191 |
| 4 flujos, total | 163 | 300 | 474 |

Fidelidad respecto al original bf16 en HF transformers (80 preguntas de MT-Bench, ambas rondas, 42.283 tokens de respuesta):

| | KL media | KL percentil 99 | Token top identico | Ratio de perplejidad |
|---|---|---|---|---|
| Este archivo | 0,00026 | 0,00325 | 99,6 % | x1,000 |
| keptn/gemma4-12b-i8g | 0,00416 | 0,0535 | 98,1 % | x1,004 |

## Requisitos de hardware

- VRAM: el archivo pesa 24,95 GiB, por lo que no cabe en una sola GPU de 24 GB; se requieren tarjetas de 32 GB (probado en Radeon AI PRO R9700), en configuraciones de 1, 2 o 4 tarjetas.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4, gfx1201) como unico hardware probado; radiance solo funciona en AMD RDNA4.
- No cabe en GPUs consumer tipicas de 24 GB (RTX 3090/4090) ni en una sola tarjeta de 32 GB con contextos maximos y multiples secuencias: el pool de KV a 262.144 tokens reduce los tokens disponibles segun el numero de secuencias (322.928 tokens totales con 8 secuencias en 1 tarjeta).
- Despliegue: exclusivamente mediante el motor radiance con soporte de este modelo en el PR #338 (aun sin release oficial). Se distribuye via Docker (`docker/build.sh` o `docker run`), con compose files del repositorio, o ejecucion directa con `--tp 1/2/4`, P2P y KV cache en bf16. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 62,7 tokens/s de decode con 1 tarjeta y 182,8 con 4; prefill de hasta 6.191 tokens/s a 24k tokens con 4 tarjetas.

## Comparativa con modelos similares

| | keptn/gemma4-12b-bf16 | keptn/gemma4-12b-i8g | google/gemma-4-12B-it |
|---|---|---|---|
| Precision | bf16 (sin cuantizar) | Cuantizado i8g | bf16 (checkpoint original) |
| Tamano | 24,95 GiB (archivo .rad) | no disponible | no disponible |
| Contexto | 262.144 tokens | no disponible | no disponible |
| Decodificacion especulativa | Si (assistant head, 3 draft tokens) | no disponible | No (requiere motor que la soporte) |
| KL media vs original | 0,00026 | 0,00416 | Referencia |
| Motor | radiance (ROCm, RDNA4) | radiance (ROCm, RDNA4) | HF transformers y motores estandar |
| Licencia | Apache 2.0 | no disponible | no disponible |

La alternativa cuantizada i8g del mismo autor ofrece menor footprint a costa de una fidelidad ligeramente inferior (98,1 % de coincidencia en token top frente al 99,6 %). El checkpoint original de Google es la referencia de calidad pero carece del empaquetado optimizado para radiance.

## Limitaciones y advertencias

- Compatibilidad de hardware restringida: radiance solo funciona en GPU AMD RDNA4; no hay soporte para NVIDIA ni para generaciones anteriores de AMD.
- Sin release estable: el soporte de este modelo requiere compilar radiance desde el PR #338, con el riesgo asociado a codigo no fusionado.
- Requiere al menos una GPU de 32 GB: el archivo de 24,95 GiB en bf16 excluye a la mayoria de GPUs consumer.
- El pool de KV es compartido entre secuencias: con 8 secuencias en 1 tarjeta solo hay 322.928 tokens de contexto agregados, muy por debajo del teorico maximo.
- No hay informacion publicada sobre idiomas soportados, sesgos, tasas de alucinacion ni limitaciones del modelo base; para eso habria que consultar la model card de `google/gemma-4-12B-it`.
- El word error rate en audio (6,81 %) es ligeramente superior al del original en HF transformers (6,68 %), senal de pequenas desviaciones numericas en el motor de inferencia.
- La licencia Apache 2.0 aplica al empaquetado; conviene verificar los terminos de uso de Gemma de Google para el modelo base en despliegues comerciales.
- Cero descargas registradas en el momento de la ficha: proyecto muy nuevo y con comunidad minima, sin soporte consolidado.

## Enlaces

- Modelo: https://huggingface.co/keptn/gemma4-12b-bf16
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo base (assistant head): https://huggingface.co/google/gemma-4-12B-it-assistant
- Version cuantizada del mismo autor: https://huggingface.co/keptn/gemma4-12b-i8g
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- PR con soporte de este modelo: https://codeberg.org/StillDeadcode/radiance/pulls/338
- Framework de model cards: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset de referencia de calidad: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
