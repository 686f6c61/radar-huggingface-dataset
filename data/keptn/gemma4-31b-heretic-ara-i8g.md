# keptn/gemma4-31b-heretic-ara-i8g

## Resumen

keptn/gemma4-31b-heretic-ara-i8g es una distribucion cuantizada a int8 del modelo trohrbaugh/gemma-4-31b-it-heretic-ara, una variante "abliterated" (sin rechazos) de Gemma 4 31B-it de Google. El autor, keptn, empaqueta los pesos en un unico fichero de 33,37 GiB en formato propietario `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 (Radeon AI PRO R9700). No es un modelo nuevo: es una conversion de pesos con cuantizacion W8A8 y cabecera asistente de decodificacion especulativa.

El modelo resuelve dos problemas concretos: por un lado, permite ejecutar un modelo multimodal de 31B parametros en hardware AMD consumer/prosumer sin recurrir a CUDA ni a formatos GGUF; por otro, elimina los rechazos del modelo original mediante la tecnica heretic/abliteration, lo que lo hace util para aplicaciones donde el filtrado de seguridad de Google resulta demasiado restrictivo. La ventana de contexto es de 262.144 tokens y acepta texto, imagen y video.

La relevancia actual es doble: demuestra que el ecosistema de inferencia alternativo a NVIDIA (radiance sobre ROCm/RDNA4) ya soporta cuantizacion int8, decodificacion especulativa con cabecera MTP y vision, y ademas ofrece una receta reproducible de abliteration sobre un modelo de Google. La licencia declarada es Apache 2.0, aunque conviene revisar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabecera asistente MTP para decodificacion especulativa; vision tower |
| Parametros totales | 31B (según denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | int8 W8A8: pesos int8 con una escala bf16 por cada 128 pesos; activaciones int8 con una escala por token y 128 valores; lm_head int8; vision tower y resto de la cabecera asistente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero unico de 33,37 GiB |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B-it, un transformer multimodal de Google que procesa texto, imagen y video. Sobre esa base, trohrbaugh aplico una variante de abliteration (denominada heretic-ara) que elimina la direccion de rechazo en el espacio de activaciones, reduciendo drasticamente la tasa de negativas a peticiones que el modelo original declina. keptn parte del checkpoint bf16 `f961f79e` de ese modelo, sustituye la plantilla de chat, tokenizer y processor config por los originales de Google (la version heretic-ara traia una plantilla antigua) y anade la cabecera asistente `google/gemma-4-31B-it-assistant` (revision `627c5ec1`).

La cuantizacion es una conversion post-entrenamiento sin calibracion, sin smoothing y sin GPTQ: cada capa lineal del tronco se redondea a int8 con una escala bf16 por bloque de 128 pesos (round to nearest), y ambos lm_heads se tratan igual. La innovacion tecnica principal es la decodificacion especulativa mediante la cabecera MTP de Gemma 4 en bf16 con 3 tokens draft, que acelera la generacion sin degradar la distribucion de salida. El resultado se valida con `--kld-ref` de radiance sobre las respuestas de 80 preguntas de MT-Bench (42.283 tokens), midiendo divergencia KL frente al original bf16 en transformers con aritmetica fp32.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno con contexto de hasta 262.144 tokens.
- Entrada multimodal: texto, imagen y video (pipeline image-text-to-text).
- Modo thinking opcional por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificacion especulativa con cabecera asistente MTP (3 tokens draft) para reducir latencia.
- Respuestas sin rechazos: tasa de rechazo del 0,6% en OR-Bench-Hard-1K frente al 33,5% del modelo original.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capa de rechazo, comparando sus respuestas con las del Gemma 4 original en conjuntos como XSTest u OR-Bench, gracias a que la receta de abliteration es reproducible y la evaluacion esta documentada.
- Procesamiento de documentos con imagenes en hardware AMD: con 262.144 tokens de contexto y soporte de vision, se puede ingerir un lote de facturas o formularios escaneados y extraer campos estructurados en una sola pasada, desplegando en dos Radeon AI PRO R9700 sin depender de CUDA.
- Analisis de video de vigilancia o monitorizacion: el modelo acepta clips de video (evaluado en MVBench con 5 clips de 4 frames) y puede resumir eventos o responder preguntas sobre el contenido, con la ventaja de que el vision tower puede ubicarse en RAM (`--vision-tower-placement ram`) para liberar VRAM.
- Generacion de codigo y asistencia tecnica en pipelines internos: la cuantizacion int8 conserva el 98,7% de coincidencia en el token top y un ratio de perplejidad de x1,006 respecto al bf16, por lo que es viable para autocompletado y refactorizacion en entornos donde no se quiere enviar codigo a APIs externas.
- Atencion al cliente automatizada con contexto largo: los 262.144 tokens permiten mantener historiales de conversacion extensos o inyectar manuales de producto completos; el modo thinking opcional ayuda en consultas complejas, y el despliegue en 2 o 4 tarjetas ofrece 262-406 tokens/s agregados en 4 streams.
- Redaccion creativa sin filtros editoriales: para proyectos de ficcion, guiones o contenido donde el modelo original rechaza tematicas sensibles, la variante heretic responde sin negativas (0% de rechazos completos en XSTest), lo que simplifica los flujos de generacion.
- Evaluacion de motores de inferencia alternativos: sirve como banco de pruebas para radiance sobre ROCm/RDNA4, comparando throughput de prefill (2.528 tokens/s a 24k en 2 tarjetas) y decode frente a implementaciones en transformers.

## Benchmarks y rendimiento

Calidad frente al original bf16 (MT-Bench, 80 preguntas, 42.283 tokens de respuesta):

| Metrica | Este fichero (int8) | keptn/gemma4-31b-heretic-ara-w4a8 |
|---|---|---|
| KL media | 0,00249 | 0,0529 |
| KL percentil 99 | 0,0324 | 0,732 |
| Token top coincidente | 98,7% | 94,4% |
| Ratio de perplejidad | x1,006 | x1,048 |

Rendimiento en Radeon AI PRO R9700 a 215 W, fp8 KV, 3 tokens draft, thinking off (BetterBench 0.6.1, temperatura 0,7, mediana de tokens/s):

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | no cabe | 89,0 | 143,0 |
| Prefill a 24k tokens | no cabe | 2.528 | 3.464 |
| 4 streams, total | no cabe | 262 | 406 |

Fidelidad multimodal (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL media | Token top coincidente |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 16/20 | 0,471 | 66/70 |
| Video (MVBench, 5 clips, 4 frames) | 5 | 4/5 | 0,0272 | 31/32 |

Tasa de rechazos (greedy, sin system prompt):

| Conjunto | Este fichero | Build del original |
|---|---|---|
| XSTest, 250 prompts seguros, rechazos completos | 0 (0,0%) | 3 (1,2%) |
| XSTest, rechazos completos y parciales (juez LLM) | 0 (0,0%) | 6 (2,4%) |
| OR-Bench-Hard-1K, 1.319 prompts (juez LLM) | 8 (0,6%) | 442 (33,5%) |

## Requisitos de hardware

- VRAM: el fichero ocupa 33,37 GiB y no cabe en una sola tarjeta de 32 GB. Se necesitan 2 o 4 tarjetas de 32 GB (probado en dos y cuatro Radeon AI PRO R9700).
- GPU recomendadas: AMD Radeon AI PRO R9700 (RDNA4) con ROCm; el autor no documenta soporte en otras arquitecturas.
- Consumer GPU: no cabe en ninguna GPU consumer de 24 GB o menos; requiere el entorno multi-tarjeta indicado.
- Configuracion de tensor parallel: `--tp 2` o `--tp 4`. Tres tarjetas no funcionan porque Gemma tiene 32 cabezas de atencion y no se dividen entre tres.
- Pool KV a contexto completo (262.144 tokens, fp8 KV): 524.304 tokens de contexto en 2 tarjetas con 2 secuencias, hasta 2.097.248 en 4 tarjetas con 8 secuencias.
- Despliegue: exclusivamente mediante el motor radiance (version 1.13.0 o superior), disponible como imagen Docker `stilldeadcode/radiance:1.13.0`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato `.rad`.
- Latencia y throughput: ver tabla de benchmarks; decode de 89 tokens/s en 2 tarjetas y 143 tokens/s en 4 con un solo stream.
- El vision tower puede colocarse en RAM con `--vision-tower-placement ram` para reducir presion de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-i8g | 31B | 262.144 | int8 W8A8 | apache-2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-heretic-ara-w4a8 | 31B | no disponible en la informacion | 4-bit pesos / 8-bit activaciones | apache-2.0 | radiance |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | no disponible en la informacion | bf16 | no disponible en la informacion | transformers / GPU con suficiente VRAM |
| google/gemma-4-31B-it-assistant | cabecera asistente | no disponible | bf16 | no disponible en la informacion | complemento de decodificacion especulativa |

Frente a la variante w4a8 del mismo autor, este fichero sacrifica tamano (33,37 GiB frente a un peso menor) a cambio de una fidelidad notablemente superior: KL media 0,00249 frente a 0,0529 y 98,7% frente a 94,4% de coincidencia en el token top. Frente al checkpoint bf16 original, la perdida de calidad es marginal (ratio de perplejidad x1,006) y la ventaja es la reduccion de memoria que permite el despliegue multi-tarjeta.

## Limitaciones y advertencias

- Modelo abliterated: responde a peticiones que el Gemma original rechaza. El autor declara explicitamente que la responsabilidad de uso recae en el usuario; no es apto para despliegues publicos sin una capa de moderacion externa.
- La licencia declarada es Apache 2.0, pero el modelo deriva de Gemma 4 de Google; conviene verificar las condiciones de la licencia Gemma original antes de uso comercial.
- Requiere hardware muy especifico: solo AMD RDNA4 con ROCm y el motor radiance 1.13.0 o superior. No hay ruta de despliegue en NVIDIA, CPU ni formatos GGUF, lo que limita la portabilidad.
- No cabe en una sola GPU de 32 GB; el minimo practico son dos tarjetas, y tres no funcionan por la divisibilidad de las cabezas de atencion.
- La fidelidad multimodal es inferior a la de texto: 16/20 respuestas identicas en imagenes y KL media de 0,471, con posible degradacion en tareas de OCR o diagramas complejos.
- Riesgo de alucinacion inherente a los LLM de 31B, no cuantificado en la informacion disponible; la cuantizacion int8 anade una divergencia adicional pequena pero no nula (KL p99 de 0,0324).
- Idiomas soportados no documentados; no se puede asumir un rendimiento uniforme fuera del ingles sin evaluacion propia.
- El formato `.rad` es propietario y esta ligado a una version concreta del motor; las actualizaciones de radiance pueden requerir reconvertir los pesos.
- Datos de benchmarks limitados a MT-Bench, XSTest, OR-Bench, DocVQA, AI2D y MVBench; no hay resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Modelo base heretic-ara: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Cabecera asistente de Google: https://huggingface.co/google/gemma-4-31B-it-assistant
- Variante w4a8 del mismo autor: https://huggingface.co/keptn/gemma4-31b-heretic-ara-w4a8
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker de radiance: https://hub.docker.com/r/stilldeadcode/radiance
