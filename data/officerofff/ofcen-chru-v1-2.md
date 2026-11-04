# Officerofff/Ofcen-CHRU-v1.2

## Resumen

Ofcen-CHRU v1.2 es un ajuste fino (fine-tune) del modelo Qwen3-0.6B, desarrollado por el equipo Ofcen, orientado a conversación en ruso. Se trata de un modelo compacto de aproximadamente 596 millones de parámetros que parte de la arquitectura transformer densa de Qwen3 y se ha especializado mediante LoRA (posteriormente fusionada con los pesos base) sobre un corpus de unos 113 000 diálogos en ruso. Su propósito es ofrecer un asistente conversacional ligero que pueda ejecutarse en hardware de consumo, incluso en CPU.

La versión 1.2 incorpora un modo de razonamiento (thinking) activable y desactivable, con tres niveles de profundidad (bajo, medio, alto), además de soporte para el formato de llamada a herramientas `<tool_call>` de Qwen3, orientado a búsqueda. El modelo conoce su propia identidad sin necesidad de system prompt y ha limpiado parte del ruido de versiones anteriores, como inserciones de caracteres de otros alfabetos y respuestas en bucle.

Es relevante ahora porque demuestra que un modelo de menos de 1 000 millones de parámetros, con licencia Apache 2.0 y entrenado sobre datos abiertos, puede mejorar de forma medible frente a su base en tareas conversacionales en ruso, manteniendo un coste de despliegue muy bajo. No obstante, su tamaño impone limitaciones claras en razonamiento, código y factualidad que conviene tener presentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596 049 920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explícita; entrenado con ejemplos de hasta 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32 y alpha 64 sobre todas las capas lineales, con una época de entrenamiento, learning rate de 1e-4 con scheduler cosine, 16 diálogos por paso y ejemplos de hasta 8192 tokens. La pérdida se calculó sobre las respuestas y los razonamientos del asistente. Posteriormente, los adaptadores LoRA se fusionaron con los pesos base, de modo que el modelo distribuido es un checkpoint denso estándar cargable con `transformers`.

Los datos de entrenamiento combinan varias fuentes en ruso: `IlyaGusev/saiga_scored` (diálogos con puntuación ≥ 8/10), `Vikhrmodels/GrandMaster-PRO-MAX` (50 000 diálogos, Apache 2.0), `d0rj/gsm8k-ru` (problemas matemáticos con solución paso a paso, MIT), `Den4ikAI/ru_sberquad_long_answers` (respuestas basadas en texto recuperado, MIT), `RefalMachine/hybrid_reasoning_dataset_ru` (Apache 2.0) y `ZeroAgency/ru-thinking-reasoning-r1-v2` (MIT), además de diálogos propios sobre la identidad del modelo y la reacción ante mensajes groseros. No se documenta el número total de tokens de entrenamiento ni si hubo RLHF o DPO; el proceso descrito es exclusivamente supervisado (SFT) mediante LoRA.

Como innovaciones destacables, el modelo incorpora un modo de razonamiento con niveles configurables a través del system prompt y soporte del formato `<tool_call>` de Qwen3 para invocar búsqueda. El system prompt está integrado en la plantilla de chat y se inserta automáticamente si el usuario no define uno propio.

## Capacidades

- Generación de texto conversacional en ruso, con respuestas orientadas a un tono claro y cercano.
- Modo de razonamiento (thinking) activable mediante `enable_thinking=True`, con niveles bajo, medio y alto definidos en el system prompt.
- Soporte de tool calling en el formato `<tool_call>` de Qwen3, entrenado específicamente para invocar búsqueda y responder a partir del texto recuperado.
- Conocimiento de su propia identidad (modelo Ofcen-CHRU) sin necesidad de system prompt.
- Capacidad de responder a preguntas factuales, dar consejos, mantener conversación, redactar textos, explicar conceptos, generar código y resolver problemas de lógica y matemáticas, aunque con calidad desigual según la categoría.
- Soporte multilingüe limitado: el modelo está entrenado y orientado al ruso; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistente conversacional ligero en ruso para aplicaciones de escritorio o web: el modelo puede gestionar diálogos multi-turno con un contexto de hasta 8192 tokens y ejecutarse en CPU o en GPU de gama baja, lo que lo hace adecuado para prototipos y entornos sin infraestructura dedicada.
- Chatbot de atención al cliente de primera línea en ruso: útil para preguntas frecuentes, saludos y derivación, siempre con supervisión humana y sin asumir precisión factual alta.
- Respuestas aumentadas por búsqueda (RAG): gracias al entrenamiento con `ru_sberquad_long_answers` y al formato `<tool_call>`, puede integrarse en un pipeline que recupere documentos y genere respuestas basadas en el texto encontrado.
- Generación de textos breves y resúmenes en ruso: redacción de correos, publicaciones o descripciones, con revisión posterior dado el riesgo de repetición en respuestas largas.
- Asistente educativo para explicaciones sencillas: puede explicar conceptos en lenguaje llano y resolver problemas matemáticos básicos del estilo GSM8K en ruso, con el modo thinking en nivel medio para equilibrar calidad y longitud.
- Prototipado e investigación sobre ajuste fino: al ser un modelo pequeño con licencia Apache 2.0 y receta de entrenamiento documentada, sirve como base para experimentos de LoRA, evaluación de razonamiento o comparación de técnicas de SFT en ruso.
- Despliegue en entornos con recursos limitados: aplicaciones de chat embebidas, demos interactivas o asistentes offline donde no es viable un modelo de mayor tamaño.

## Benchmarks y rendimiento

El autor publica resultados en Ofcen-Bench-RU, un conjunto de 200 preguntas en ruso en 8 categorías, evaluadas por pares a ciegas con un juez (Gemini 4 Argon), sin thinking ni búsqueda, greedy y hasta 768 tokens. La victoria vale 1 y el empate 0,5.

| Categoría | Qwen3-0.6B | Ofcen-CHRU v1.1 | Ofcen-CHRU v1.2 |
|---|---|---|---|
| Total (frente a Qwen3-0.6B) | 50 % | 54,5 % | 60,2 % |
| Hechos | 50 % | 64 % | 84 % |
| Consejos | 50 % | 50 % | 74 % |
| Conversación | 50 % | 56 % | 74 % |
| Textos | 50 % | 52 % | 60 % |
| Explicaciones | 50 % | 72 % | 56 % |
| Código | 50 % | 60 % | 46 % |
| Instrucciones | 50 % | 50 % | 48 % |
| Lógica y tareas | 50 % | 32 % | 40 % |

En el enfrentamiento directo v1.2 frente a Qwen3-0.6B se registran 107 victorias, 27 empates y 66 derrotas. Frente a v1.1, el resultado es del 46,5 %: v1.2 mejora en hechos, consejos y lógica, pero se queda atrás en código y explicaciones, donde tiende a entrar en bucle en respuestas largas. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 596 millones de parámetros en safetensors, los pesos en fp16 ocupan alrededor de 1,2 GB; en fp32, unos 2,4 GB. Con cuantización a 8 bits o 4 bits el requisito bajaría aproximadamente a 0,6 GB y 0,3 GB respectivamente, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre puede alojar el modelo en fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores lo ejecutan con holgura. También es viable en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `transformers` (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y, previsiblemente, llama.cpp u Ollama si se generan cuantizaciones GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no se publican datos concretos. Por el tamaño del modelo, se espera una latencia baja en GPU de consumo y aceptable en CPU, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ofcen-CHRU v1.2 | 596 M | hasta 8192 tokens en entrenamiento | ruso | Apache 2.0 | Fine-tune de Qwen3-0.6B con thinking y tool calling para búsqueda |
| Qwen3-0.6B | 596 M | no disponible en la información | multilingüe | Apache 2.0 | Modelo base; el autor lo usa como referencia en Ofcen-Bench-RU |
| Ofcen-CHRU v1.1 | 596 M | no disponible | ruso | Apache 2.0 | Versión anterior; sin niveles de thinking y con peor rendimiento en hechos y consejos |

No se dispone de datos en la información proporcionada para comparar con otros modelos pequeños específicos de ruso (por ejemplo, variantes de Saiga o Vikhr) en parámetros, contexto o benchmarks, por lo que la comparativa se limita a la familia Qwen3 y a la versión previa del propio modelo.

## Limitaciones y advertencias

- Modelo pequeño: comete errores factuales con frecuencia cuando no dispone de búsqueda y falla en tareas de lógica, incluyendo acertijos con trampa.
- Tendencia al bucle y a respuestas truncadas en generaciones largas, especialmente en código y explicaciones; el propio autor lo señala como problema pendiente para la v1.3.
- El modo de razonamiento en nivel alto puede superar los 4096 tokens, por lo que parte de las respuestas no se completan si no se amplía `max_new_tokens`.
- Comprensión deficiente de mensajes groseros o sin sentido.
- Idiomas: entrenado exclusivamente para ruso; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre diálogos web y datasets abiertos, es probable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación: elevado en preguntas factuales sin recuperación, dado el tamaño del modelo y la naturaleza del entrenamiento supervisado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento, ya que la card indica que la licencia de `IlyaGusev/saiga_scored` no está especificada en su propia ficha.
- En producción, se recomienda usar el modelo con recuperación (RAG) y supervisión humana, y no confiar en él para tareas críticas de precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Officerofff/Ofcen-CHRU-v1.2
- Versión anterior v1.1: https://huggingface.co/Officerofff/Ofcen-CHRU-v1.1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset `IlyaGusev/saiga_scored`: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset `Vikhrmodels/GrandMaster-PRO-MAX`: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset `d0rj/gsm8k-ru`: https://huggingface.co/datasets/d0rj/gsm8k-ru
- Dataset `Den4ikAI/ru_sberquad_long_answers`: https://huggingface.co/datasets/Den4ikAI/ru_sberquad_long_answers
- Dataset `RefalMachine/hybrid_reasoning_dataset_ru`: https://huggingface.co/datasets/RefalMachine/hybrid_reasoning_dataset_ru
- Dataset `ZeroAgency/ru-thinking-reasoning-r1-v2`: https://huggingface.co/datasets/ZeroAgency/ru-thinking-reasoning-r1-v2
