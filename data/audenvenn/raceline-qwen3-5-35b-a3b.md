# audenvenn/raceline-qwen3.5-35b-a3b

## Resumen

raceline-qwen3.5-35b-a3b es una conversión del modelo Qwen/Qwen3.5-35B-A3B, desarrollada por el usuario audenvenn, destinada exclusivamente al runtime raceline: un motor de inferencia local para Macs con Apple Silicon (familias M5 y M6) orientado a agentes. No se trata de un modelo nuevo ni de un fine-tuning, sino de una cuantización empaquetada en el formato nativo del motor, con pesos FP4 de 4 bits por peso, cuantización GPTQ tras una rotación de Hadamard del flujo residual, y la cabeza de predicción multi-token (MTP) del modelo original preservada para decodificación especulativa exacta.

El modelo base es un mixture of experts (MoE) de Qwen con 35B de parámetros totales y 3B activos, que enruta cada token a 8 de sus 256 expertos más uno compartido por capa. La conversión ocupa 18,30 GB en el archivo ensamblado, de los cuales 16,3 GB corresponden a los expertos, e incluye además un vision tower en float16 de 0,89 GB para entrada de imágenes. El pipeline declarado es image-text-to-text.

Su relevancia es acotada pero específica: demuestra una vía de despliegue de un MoE multimodal de 35B en hardware de consumo Apple mediante offload de expertos a SSD y decodificación especulativa con la cabeza MTP. La contrapartida es una dependencia total del runtime raceline (versión 0.4.0 o superior, 0.6.0 para visión): el archivo no es utilizable con otros motores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), basada en Qwen3.5-35B-A3B; incluye vision tower |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (8 de 256 expertos por capa mas uno compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (4,0 bits por peso), GPTQ con escala por fila y por columna; down projections de los expertos redondeadas a nearest; vision tower en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato nativo raceline (`.rlm`), dividido en partes de menos de 2 GB descritas por `qwen3.5-35b-a3b.rlm.json`; vision tower en `.safetensors` |

## Arquitectura y entrenamiento

El modelo es una conversión del Qwen3.5-35B-A3B original, no un entrenamiento propio. La arquitectura subyacente es un transformer con capas MoE de enrutamiento disperso: cada capa dirige cada token a 8 de sus 256 expertos más un experto compartido, de modo que un token solo lee una fracción pequeña de los pesos. Los expertos suman 16,3 GB del archivo total. La conversión aplica una rotación de Hadamard al flujo residual, plegada en los pesos, seguida de cuantización GPTQ a FP4 con escalas por fila y por columna (4,0 bits por peso); las down projections de los expertos se redondean a nearest en lugar de cuantizarse con GPTQ.

La innovación técnica principal es la conservación de la cabeza de predicción multi-token (MTP) del modelo original, que raceline emplea para decodificación especulativa exacta: según el autor, la elección principal de la cabeza draft coincide con el token siguiente-siguiente real del modelo el 81,8% de las veces. El runtime mantiene los expertos en el archivo y cachea en memoria solo los que están en uso, leyendo el resto desde el SSD cuando una capa los necesita, con el tamaño de caché configurable mediante `--expert-cache GB`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base Qwen3.5-35B-A3B.
- Procesamiento de imágenes: el vision tower en float16 (0,89 GB) habilita entrada image-text-to-text en el agente de terminal y a través de las APIs compatibles con OpenAI y Anthropic que expone raceline.
- Decodificación especulativa exacta mediante la cabeza MTP integrada.
- Ejecución local en Apple Silicon con offload de expertos a SSD.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el pipeline image-text-to-text y el uso como agente lo sugieren, pero no se documenta explícitamente).
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agente de terminal local en Mac: raceline está diseñado como runtime de agentes; el modelo se invoca con `raceline chat qwen3.5-35b-a3b` y permite conversaciones y tareas asistidas sin salir del equipo, aprovechando el vision tower para adjuntar imágenes.
- Análisis de imágenes en local: capturas de pantalla, diagramas o fotografías se procesan mediante el vision tower a través de la API compatible con OpenAI o Anthropic que expone el runtime, sin enviar datos a servicios externos.
- Prototipado de aplicaciones con API compatible OpenAI/Anthropic: al servir el modelo por estas interfaces, se puede apuntar código existente al endpoint local para pruebas de integración sin coste de tokens.
- Evaluación de decodificación especulativa: la cabeza MTP y su 81,8% de acierto en el token siguiente-siguiente permiten estudiar el rendimiento de speculative decoding sobre un MoE de 35B en hardware de consumo.
- Despliegue en Macs con memoria unificada limitada: el esquema de caché de expertos con lectura desde SSD (`--expert-cache GB`) permite ejecutar el modelo cuando la GPU no puede retener los 16,3 GB de expertos completos.
- Investigación sobre cuantización FP4: el paquete incluye métricas de conversión (KL de 0,060 nats, perplejidad 2,209, acuerdo top-1 del 92,1% frente al modelo en float sobre 1152 posiciones), útiles como referencia para estudiar el impacto de GPTQ a 4 bits en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas proporcionadas son las de calidad de la conversión, medidas contra el modelo en float sobre texto retenido (1152 posiciones):

| Metrica | Valor |
|---|---|
| Divergencia KL | 0,060 nats |
| Perplejidad | 2,209 |
| Acuerdo top-1 | 92,1% |
| Acierto de la cabeza draft en el token siguiente-siguiente | 81,8% |

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon de las familias M5 y M6, cuyos GPU incorporan aceleradores neuronales; no se mencionan otros chips compatibles.
- Tamaño del modelo: 18,30 GB ensamblado (16,3 GB de expertos) más 0,89 GB del vision tower en float16.
- VRAM/memoria unificada: no se especifica un mínimo; el runtime admite que la GPU no retenga el modelo completo y cachea expertos en memoria según `--expert-cache GB`, leyendo el resto desde SSD.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el formato es exclusivo de raceline para Apple Silicon.
- Opciones de despliegue: únicamente raceline 0.4.0 o superior (0.6.0 o superior para visión), instalable vía `raceline pull qwen3.5-35b-a3b --source huggingface` o desde la release de GitHub. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el README remite a las mediciones de velocidad frente a mlx-lm publicadas en el repositorio de raceline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raceline-qwen3.5-35b-a3b | 35B totales / 3B activos | no disponible | FP4 GPTQ (formato raceline) | Apache-2.0 | Solo runtime raceline en Apple Silicon M5/M6 |
| Qwen/Qwen3.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | Pesos originales en float | Apache-2.0 | Hugging Face, múltiples runtimes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: misma arquitectura y licencia, pero el paquete de audenvenn sacrifica portabilidad (un solo runtime, un solo tipo de hardware) a cambio de un tamaño reducido a 18,30 GB y decodificación especulativa integrada.

## Limitaciones y advertencias

- Dependencia total del runtime: el archivo `.rlm` no es utilizable con otros motores; requiere raceline 0.4.0 o superior (0.6.0 para visión).
- Restricción de hardware: solo Macs Apple Silicon M5 y M6; no funciona en GPUs NVIDIA, AMD ni en generaciones anteriores de Apple Silicon según la información disponible.
- El rendimiento depende del almacenamiento: si los expertos no caben en memoria, la lectura desde SSD introduce latencia no cuantificada en la documentación.
- Pérdida de calidad por cuantización: KL de 0,060 nats y 92,1% de acuerdo top-1 frente al modelo en float; el 7,9% restante de discrepancias puede acumularse en generaciones largas.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; conviene verificarla en el modelo base antes de usos con documentos largos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; son los heredados del modelo base Qwen3.5-35B-A3B.
- Licencia Apache-2.0, que permite uso comercial, pero el ecosistema práctico queda limitado por la exclusividad del runtime.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audenvenn/raceline-qwen3.5-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio del runtime raceline: https://github.com/audenvenn/raceline
- Guía de inicio rápido de raceline: https://github.com/audenvenn/raceline#quick-start
