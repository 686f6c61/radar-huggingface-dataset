# keptn/gemma4-31b-a4

## Resumen

keptn/gemma4-31b-a4 es una cuantización de 4 bits del modelo multimodal google/gemma-4-31B-it, empaquetada en un único fichero de 19,95 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. La desarrolla el usuario keptn, no Google, y su propósito es hacer viable el despliegue de un modelo de 31B parámetros con visión y contexto de 262.144 tokens en hardware AMD de consumo profesional (Radeon AI PRO R9700 de 32 GB), territorio históricamente dominado por CUDA. Incorpora además la cabeza asistente de Google para decodificación especulativa.

La versión 2.0 (noviembre de 2026) usa el formato "a4": pesos int4 con punto cero y una escala f16 por cada 128 pesos, y activaciones int8 con una escala por token y bloque de 128 valores. Frente a la versión 1.0 (w4a8), reduce la divergencia KL aproximadamente a la mitad (0,0251 frente a 0,0517) a cambio de una penalización de velocidad del 1,6 % en una tarjeta y del 7,5 % en dos.

Es relevante porque demuestra que un modelo frontera multimodal puede servirse con calidad cercana al bf16 original (96,1 % de coincidencia en el token más probable) en un stack completo ROCm/radiance, con decodificación especulativa y soporte de texto, imagen y vídeo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabeza asistente para decodificación especulativa; no se detalla el número de capas ni la configuración de atención |
| Parametros totales | 31B (heredados del modelo base google/gemma-4-31B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero (GPTQ) y escala f16 por 128 pesos; activaciones int8 con escala por token y 128 valores; lm_head int8 con escala bf16 por 128 pesos; cabeza asistente en bf16; KV cache fp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 19,95 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google (Gemma 4, variante instruct de 31B) que acepta texto, imagen y vídeo. Esta ficha no documenta el proceso de entrenamiento original de Google: no se dispone de número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se detalla es el proceso de cuantización.

El pipeline de cuantización parte del checkpoint bf16 `google/gemma-4-31B-it` (revisión 842da379), al que se añade la cabeza asistente `google/gemma-4-31B-it-assistant` (revisión 627c5ec1). Las estadísticas GPTQ se midieron con el modelo bf16 sobre el conjunto de calibración `keptn/quant-calibration-v1` (revisión 3969b2f9), con filas seleccionadas por categoría mediante semilla fija y truncadas a 4.096 tokens; no se aplicó SmoothQuant. Todas las capas lineales del tronco se cuantizaron a int4 con GPTQ. La innovación destacable es la integración de la cabeza asistente de Google con 3 tokens de borrador para decodificación especulativa, que acelera la generación sin cambiar el modelo objetivo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo "thinking" activable por petición mediante `chat_template_kwargs`.
- Comprensión de imágenes (evaluado sobre DocVQA y AI2D) y de vídeo (evaluado sobre MVBench con 4 fotogramas por clip).
- Decodificación especulativa nativa gracias a la cabeza asistente de Google, con 3 tokens de borrador.
- Procesamiento de contexto largo de hasta 262.144 tokens, útil para documentos extensos o conversaciones prolongadas.
- Servido concurrente: hasta 8 secuencias simultáneas según la configuración de ejemplo.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con OCR visual: el modelo puede recibir imágenes de páginas (tipo DocVQA) y responder preguntas sobre ellas, combinando la torre de visión con un contexto de 262.144 tokens para procesar informes completos en una sola sesión.
- Procesamiento de vídeo para indexación o resumen: con 4 fotogramas por clip y una calidad medida de 4/5 respuestas idénticas al bf16 en MVBench, es adecuado para tareas de descripción y búsqueda sobre archivos audiovisuales.
- Asistente conversacional de contexto largo: con 524.304 tokens de pool KV en dos tarjetas a 2 secuencias, permite mantener diálogos con historial muy extenso sin truncar.
- Despliegue en infraestructura AMD sin CUDA: pensado para servidores con Radeon AI PRO R9700, encaja en entornos ROCm donde no se quiere depender de NVIDIA; el contenedor `stilldeadcode/radiance:1.16.0` simplifica el arranque.
- Servicio de inferencia con concurrencia moderada: con 4 streams alcanza 516 tokens/s en cuatro tarjetas y 130 tokens/s en una, suficiente para APIs internas de baja o media carga.
- Evaluación y prototipado de cuantización: al publicar métricas KL frente al bf16, sirve como referencia para comparar esquemas int4/int8 en AMD antes de comprometerse con un formato en producción.
- Investigación en decodificación especulativa: la inclusión de la cabeza asistente permite medir el impacto de los tokens de borrador en latencia real sobre RDNA4.

## Benchmarks y rendimiento

Calidad frente al original bf16 sobre las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta):

| Modelo | KL media | KL percentil 99 | Coincidencia token top | Ratio de perplejidad |
|---|---|---|---|---|
| gemma4-31b-a4 (este) | 0,0251 | 0,331 | 96,1 % | ×0,993 |
| gemma4-31b-a4 v1.0 (w4a8) | 0,0517 | 0,721 | 94,6 % | ×1,056 |
| gemma4-31b-i8g | 0,00236 | 0,0311 | 98,8 % | ×1,004 |
| gemma4-31b-w5 | 0,00803 | 0,107 | 97,8 % | ×1,010 |

Velocidad en Radeon AI PRO R9700 a 215 W, fp8 KV, 3 tokens de borrador, thinking desactivado (mediana de tokens/s):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 78,4 | 132,3 | 202,0 |
| Prefill a 24k tokens | 1.463 | 2.657 | 4.318 |
| 4 streams, total | 130 | 349 | 516 |

Fidelidad multimodal (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Respuesta idéntica | KL media | Coincidencia token top |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 16/20 | 0,268 | 66/70 |
| Vídeo (MVBench, 5 clips) | 5 | 4/5 | 0,0556 | 31/32 |

## Requisitos de hardware

- VRAM: el fichero ocupa 19,95 GiB; se recomienda al menos 32 GB por tarjeta para dejar espacio a KV cache y estado de ventana deslizante.
- GPUs soportadas: Radeon AI PRO R9700 (RDNA4, 32 GB), probado con 1, 2 y 4 tarjetas. Requiere ROCm y el motor radiance 1.16.0 o superior.
- Configuración de 3 tarjetas no funciona: las 32 cabezas de atención no se dividen entre tres.
- Pool KV con `--max-model-len 262144` y fp8: 298.848 tokens (1 tarjeta, 2 secuencias), 524.304 (2 tarjetas, 2 secuencias), 2.097.248 (4 tarjetas, 8 secuencias).
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:1.16.0`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.rad`.
- La torre de visión puede colocarse en RAM (`--vision-tower-placement ram`) para liberar VRAM.
- Throughput y latencia: ver tabla de benchmarks (78,4 a 202 tokens/s en decode según número de tarjetas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Calidad (KL media) |
|---|---|---|---|---|---|
| gemma4-31b-a4 (este) | 31B | 262.144 | Apache 2.0 | `.rad` (radiance) | 0,0251 |
| keptn/gemma4-31b-i8g | 31B | no disponible | Apache 2.0 | no disponible | 0,00236 |
| keptn/gemma4-31b-w5 | 31B | no disponible | Apache 2.0 | no disponible | 0,00803 |
| google/gemma-4-31B-it (bf16) | 31B | 262.144 | Apache 2.0 | safetensors (HF) | referencia |

Las alternativas i8g y w5 ofrecen mayor fidelidad al original a costa de mayor tamaño y, presumiblemente, menor velocidad, aunque no se publican sus cifras de rendimiento en la información disponible. El bf16 original requiere aproximadamente el cuádruple de memoria.

## Limitaciones y advertencias

- La divergencia KL de 0,0251 implica un 3,9 % de casos en los que el token más probable difiere del bf16; en tareas sensibles a la precisión (código, matemáticas, extracción de datos) conviene validar.
- En imágenes la fidelidad baja notablemente: 16/20 respuestas idénticas y KL media de 0,268, muy superior a la de texto; no es adecuado para tareas visuales de alta precisión sin verificación.
- El ratio de perplejidad ×0,993 indica una ligera desviación respecto al original; no es una cuantización sin pérdida.
- Dependencia total del motor radiance y del ecosistema ROCm/RDNA4: no es portable a CUDA ni a otros runtimes sin reconversión.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene revisar los términos de Gemma 4 de Google por si imponen condiciones adicionales de uso.
- No se documentan sesgos, idiomas soportados ni comportamiento en dominios especializados; el conjunto de evaluación (MT-Bench, DocVQA, AI2D, MVBench) es limitado.
- El modelo base es de octubre de 2026 y la cuantización de noviembre de 2026; la información sobre su entrenamiento original no está incluida en esta ficha.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-a4
- Revisión v1.0 (w4a8): https://huggingface.co/keptn/gemma4-31b-a4/tree/v1.0
- Cuantización int8: https://huggingface.co/keptn/gemma4-31b-i8g
- Cuantización w5: https://huggingface.co/keptn/gemma4-31b-w5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Conjunto de calibración: keptn/quant-calibration-v1 (revisión 3969b2f9)
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker: stilldeadcode/radiance:1.16.0
