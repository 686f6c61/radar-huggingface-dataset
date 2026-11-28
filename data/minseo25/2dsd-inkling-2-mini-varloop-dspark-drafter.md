# minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter

## Resumen

El modelo `minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter` es un drafter de decodificación especulativa diseñado para acelerar la inferencia de modelos de lenguaje con bucles ("looped language models"). No es un modelo generativo autónomo, sino un componente auxiliar que propone tokens candidatos que el modelo objetivo verifica. Lo desarrolla Minseo Kim y colaboradores en el marco del trabajo 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models), vinculado a SqueezeAILab y a Thinking Machines.

El modelo objetivo es `thinkingmachines/TML-d24-varloop-research`, la variante de bucle variable de Inkling 2 Mini, ejecutada con R = 3 bucles y KV por bucle. El drafter tiene 541,88 millones de parámetros y utiliza una arquitectura DFlash de 5 capas Transformer con el ancho oculto del objetivo (2304), una cabeza Markov de rango 256, una cabeza de confianza y un tamaño de bloque k = 8. Su innovación principal es que un único drafter sirve para todas las profundidades de bucle r = 1, ..., R, combinando características del bucle R de tokens confirmados con las del bucle r de tokens en vuelo.

Es relevante porque la decodificación especulativa en modelos con bucles plantea un problema adicional: el drafter debe operar en distintas profundidades de cómputo. 2DSD resuelve esto con un drafter condicionado por profundidad que alcanza aceleraciones de hasta 3,96× en HumanEval+ y mantiene la distribución de salida del decodificado autorregresivo, con una precisión media comparable (78,2 % frente a 79,2 % en R = 3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash: 5 capas Transformer con ancho oculto 2304, cabeza Markov (rango 256) y cabeza de confianza; drafter de decodificacion especulativa condicionado por profundidad de bucle |
| Parametros totales | 541.880.065 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un backbone DFlash de 5 capas Transformer con el ancho oculto del modelo objetivo (2304), complementado con una cabeza Markov de rango 256 y una cabeza de confianza, y opera con tamaño de bloque k = 8. Recibe entradas de contexto de bucle procedentes de cinco capas del objetivo por cada bucle (las entradas de las capas 2, 7, 12, 17 y 22 de 24). Al generar borradores en el bucle r, el contexto combina características del bucle R de los tokens confirmados con características del bucle r de los tokens en vuelo. Utiliza los embeddings y la cabeza LM congelados del objetivo, leídos desde el checkpoint del modelo objetivo, mientras que el embedding de máscara sí se entrena.

El entrenamiento se realizó sobre rollouts de 13.000 prompts durante diez épocas con tamaño de bloque 8, muestreando profundidades de entrenamiento r en {1, 2, 3} con probabilidades (0,5, 0,25, 0,25). Un único drafter sirve para todas las profundidades r = 1, ..., R. Según la model card, el modelo se entrenó sobre las salidas del objetivo y no incluye pesos del mismo. No se detalla la composición del dataset ni si hubo etapas de RLHF o DPO, dado que se trata de un drafter y no de un modelo generativo completo.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre el modelo objetivo `thinkingmachines/TML-d24-varloop-research`.
- Soporte de un único drafter para múltiples profundidades de bucle (r = 1, ..., R), con R = 3 por defecto y generalización sin reentrenamiento a R = 4 y R = 5.
- Decodificación greedy por defecto y soporte de muestreo con `--temperature 0.6 --top-p 0.95`.
- Verificación con el último bucle, preservando las salidas greedy y la distribución de muestreo del objetivo.
- No es un modelo de chat, razonamiento o código autónomo: hereda las capacidades del modelo objetivo a través de la verificación.
- Capacidades multilingües: no disponibles (dependen del objetivo, no documentadas para el drafter).
- No soporta tool calling ni function calling por sí mismo.
- No soporta agentes ni razonamiento multi-paso de forma nativa.

## Casos de uso

- Aceleración de inferencia en producción sobre TML-d24-varloop-research: el drafter se integra en el runner de 2DSD para reducir la latencia de decodificación, con aceleraciones medias de 3,37× en R = 3 y hasta 4,01× en R = 4 sobre H100 NVL.
- Servicio de razonamiento matemático de alto throughput: en tareas como MATH-500 y GSM8K, el drafter eleva el throughput de 92,8 a 339,0 tok/s y de 93,1 a 292,0 tok/s respectivamente, adecuado para APIs que atienden muchas peticiones de razonamiento.
- Generación de código en pipelines de CI/CD: en HumanEval+ y MBPP+ alcanza 368,1 y 323,2 tok/s, lo que permite validar y autocompletar código con menor latencia en herramientas de desarrollo.
- Evaluación de modelos con bucle variable: al soportar R = 3, 4 y 5 sin reentrenamiento, permite comparar configuraciones de bucle del objetivo manteniendo la aceleración en todas ellas.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar drafters condicionados por profundidad en arquitecturas con bucles, con código y paper públicos en SqueezeAILab/2DSD.
- Despliegue en entornos con GPUs H100 NVL: los datos de throughput están medidos en esa GPU con concurrencia 1, por lo que encaja en infraestructuras de inferencia de gama alta con requisitos de baja latencia.
- Benchmarking de tareas de razonamiento avanzado: en AIME24/25, GPQA-Diamond y OlympiadBench mantiene aceleraciones de 3,42×, 2,88× y 3,22× en R = 3, útil para suites de evaluación intensivas en cómputo.

## Benchmarks y rendimiento

Throughput de decodificación en tokens de salida por segundo (aceleración frente a autorregresivo), con respuestas repetitivas filtradas, concurrencia 1, decodificación greedy, R = 3, H100 NVL:

| Tarea | Autorregresivo | MTP | 2DSD |
|---|---:|---:|---:|
| GSM8K | 93,1 | 225,1 (2,42×) | 292,0 (3,14×) |
| MATH-500 | 92,8 | 243,7 (2,63×) | 339,0 (3,65×) |
| HumanEval+ | 93,0 | 298,5 (3,21×) | 368,1 (3,96×) |
| MBPP+ | 93,0 | 284,5 (3,06×) | 323,2 (3,47×) |
| AIME24/25 | 91,8 | 257,9 (2,81×) | 313,9 (3,42×) |
| GPQA-Diamond | 91,8 | 240,2 (2,62×) | 264,2 (2,88×) |
| OlympiadBench | 91,5 | 250,4 (2,74×) | 294,6 (3,22×) |
| Media | 92,5 | 257,2 (2,77×) | 313,6 (3,37×) |

Generalización a R = 4 y R = 5 sin reentrenamiento:

| Tarea | Autorregresivo (R = 4) | 2DSD (R = 4) | Autorregresivo (R = 5) | 2DSD (R = 5) |
|---|---:|---:|---:|---:|
| GSM8K | 73,6 | 267,7 (3,64×) | 60,7 | 218,5 (3,60×) |
| MATH-500 | 73,3 | 322,1 (4,39×) | 60,5 | 258,8 (4,28×) |
| HumanEval+ | 73,4 | 334,1 (4,55×) | 60,5 | 244,4 (4,04×) |
| MBPP+ | 73,4 | 300,7 (4,09×) | 60,6 | 245,4 (4,05×) |
| AIME24/25 | 72,6 | 299,6 (4,13×) | 60,0 | 249,3 (4,16×) |
| GPQA-Diamond | 72,6 | 252,9 (3,48×) | 59,9 | 198,0 (3,31×) |
| OlympiadBench | 72,4 | 283,3 (3,91×) | 59,7 | 226,6 (3,80×) |
| Media | 73,0 | 294,3 (4,01×) | 60,3 | 234,4 (3,88×) |

Precisión media (%) sobre las siete tareas, decodificación greedy:

| Bucles | Autorregresivo | MTP | 2DSD |
|---|---:|---:|---:|
| R = 3 | 79,2 | 79,7 | 78,2 |
| R = 4 | 79,9 | – | 80,0 |
| R = 5 | 79,0 | – | 80,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,1 GB en safetensors, por lo que el drafter en precisión nativa requiere al menos esa cantidad más el espacio del modelo objetivo.
- GPU recomendadas: los benchmarks se midieron en H100 NVL; no se documentan otras GPU.
- ¿Cabe en GPU de consumo? No disponible; el drafter por sí solo es pequeño (541,88 M de parámetros), pero requiere el modelo objetivo completo para funcionar.
- Opciones de despliegue: el runner oficial de 2DSD (`scripts/generate.py` del repositorio SqueezeAILab/2DSD) con `--model inkling-2-mini-varloop` y `--drafter minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter`. Autorregresivo y MTP se ejecutan en el motor oficial vLLM; no se documenta soporte de llama.cpp, Ollama o TGI para este drafter.
- Latencia y throughput: media de 313,6 tok/s en R = 3, 294,3 tok/s en R = 4 y 234,4 tok/s en R = 5 sobre H100 NVL, con concurrencia 1 y decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Throughput medio (R = 3) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| 2DSD DSpark drafter (este) | 541,88 M | no disponible | 313,6 tok/s | Apache 2.0 | Hugging Face |
| MTP drafter incluido en el checkpoint | no disponible | no disponible | 257,2 tok/s | Apache 2.0 | Incluido en el checkpoint del objetivo |
| Decodificación autorregresiva (sin drafter) | no disponible | no disponible | 92,5 tok/s | Apache 2.0 | Motor oficial vLLM |

El MTP bundled solo soporta R = 3, mientras que este drafter generaliza a R = 4 y R = 5 sin reentrenamiento. No se dispone de comparación con otros drafters de la literatura en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere el modelo objetivo `thinkingmachines/TML-d24-varloop-research` y el runner de 2DSD para funcionar.
- Las pequeñas diferencias de precisión frente al motor oficial (78,2 % frente a 79,2 % en R = 3) reflejan diferencias numéricas entre motores, no del drafter; 2DSD produce las mismas salidas que el decodificado autorregresivo en su propio runner.
- El MTP bundled del objetivo solo soporta R = 3; este drafter cubre R = 3, 4 y 5, pero no se documentan otros valores de R.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas propias del drafter; estos dependen del modelo objetivo.
- La licencia Apache 2.0 se hereda del objetivo, sobre cuyas salidas se entrenó; no se incluyen pesos del objetivo en el repositorio.
- Los datos de throughput están medidos únicamente en H100 NVL con concurrencia 1; el rendimiento en otros entornos no está documentado.
- No se especifican tipos de cuantización soportados ni longitud de contexto, lo que limita la planificación de despliegues con requisitos de memoria ajustados.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Código 2DSD: https://github.com/SqueezeAILab/2DSD
- Modelo objetivo: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
