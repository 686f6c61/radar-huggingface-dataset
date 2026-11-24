# minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter

## Resumen

El 2DSD DSpark drafter para TML-d24-varloop-research es un modelo auxiliar de decodificacion especulativa (drafter) desarrollado por minseo25, en el contexto del proyecto 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models) del SqueezeAILab. No es un modelo de lenguaje autonomo: es un componente que acelera la inferencia del modelo objetivo thinkingmachines/TML-d24-varloop-research, la variante de bucle variable de Inkling 2 Mini, que se ejecuta con R = 3 bucles y KV por bucle. Su funcion es proponer tokens candidatos que el modelo objetivo verifica, manteniendo exactamente la distribucion de salida del modelo base.

Tecnicamente es un drafter DSpark condicionado por profundidad: un backbone DFlash de 5 capas Transformer con el ancho oculto del objetivo (2304), una cabeza Markov de rango 256 y una cabeza de confianza, con tamano de bloque k = 8. Un unico drafter sirve para todas las profundidades de bucle r = 1, ..., R (R = 3), lo que evita mantener un drafter distinto por cada iteracion del modelo objetivo. Con 541.880.065 parametros y un repo de 1,1 GB, es un modelo compacto pensado para desplegarse junto al objetivo.

Su relevancia es practica: los modelos con bucles iterativos (looped language models) son mas costosos de decodificar porque repiten el paso por el mismo bloque de capas. 2DSD ataca ese coste con decodificacion especulativa en dos dimensiones (profundidad de bucle y tiempo), y este drafter es la pieza que habilita dicha aceleracion, con incrementos de throughput de hasta 3,96x en HumanEval+ frente a la decodificacion autorregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash backbone de 5 capas Transformer (drafter DSpark condicionado por profundidad) con cabeza Markov (rango 256) y cabeza de confianza |
| Parametros totales | 541.880.065 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter es un DSpark condicionado por profundidad sobre un backbone DFlash de 5 capas Transformer con ancho oculto 2304 (el mismo del modelo objetivo), una cabeza Markov de rango 256 y una cabeza de confianza, con tamano de bloque k = 8. La innovacion clave es que un unico drafter sirve para todas las profundidades de bucle r = 1, ..., R con R = 3. Para ello recibe entradas de contexto de bucle procedentes de cinco capas del objetivo por cada bucle (las entradas de las capas 2, 7, 12, 17 y 22 de 24, en indexacion base 0): al redactar en el bucle r, el contexto combina caracteristicas del bucle R de los tokens ya confirmados con caracteristicas del bucle r de los tokens en vuelo. El modelo reutiliza los embeddings congelados y la LM head del checkpoint objetivo, mientras que el embedding de mascara es aprendido. No incluye pesos del modelo objetivo.

El entrenamiento se realizo sobre rollouts de 13K prompts durante diez epocas con tamano de bloque 8, muestreando las profundidades de entrenamiento r en {1, 2, 3} con probabilidades (0,5, 0,25, 0,25). La decodificacion 2DSD verifica con el ultimo bucle, de modo que preserva las salidas greedy y la distribucion de muestreo del modelo objetivo. Por defecto la decodificacion es greedy; con `--temperature 0.6 --top-p 0.95` se activa el muestreo.

## Capacidades

- Aceleracion de decodificacion especulativa para el modelo objetivo TML-d24-varloop-research con R = 3 bucles y KV por bucle.
- Redaccion (drafting) condicionada por profundidad de bucle: un unico drafter cubre r = 1, 2, 3.
- Propuesta de bloques de hasta k = 8 tokens candidatos por paso, verificados por el modelo objetivo.
- Preservacion de la distribucion de salida del objetivo: mantiene salidas greedy y el muestreo del modelo base.
- Cabeza de confianza para estimar la fiabilidad de los tokens propuestos.
- No es un modelo de proposito general: no genera texto de forma autonoma, no soporta tool calling, agentes, vision ni audio por si mismo.

## Casos de uso

- Aceleracion de inferencia de Inkling 2 Mini en produccion: desplegar el drafter junto al objetivo para reducir la latencia de decodificacion en tareas de razonamiento matematico, donde se observa una mejora de 3,65x en MATH-500.
- Generacion de codigo de alto throughput: en pipelines de generacion de codigo (HumanEval+, MBPP+) el drafter alcanza 3,96x y 3,47x de speedup respectivamente, util para asistentes de codigo con alta concurrencia.
- Servicio de resolucion de problemas matematicos: con GSM8K a 292,0 tok/s (3,14x) y AIME24/25 a 313,9 tok/s (3,42x), adecuado para aplicaciones de tutoria o evaluacion matematica automatizada.
- Evaluacion de razonamiento cientifico: en GPQA-Diamond el drafter ofrece 2,88x, lo que permite abaratar baterias de evaluacion sobre preguntas de nivel doctorado.
- Benchmarking de modelos con bucles: usar el drafter para medir el coste real de decodificacion de modelos looped frente a alternativas autorregresivas o MTP.
- Investigacion en decodificacion especulativa: servir de base reproducible para estudiar el drafting condicionado por profundidad y el impacto del tamano de bloque k = 8 en la tasa de aceptacion.
- Despliegue en infraestructura H100 NVL: el drafter esta validado a concurrencia 1 con decodificacion greedy en H100 NVL, lo que facilita su integracion en entornos de servidor con esa GPU.

## Benchmarks y rendimiento

Throughput de decodificacion en tokens de salida por segundo (output tok/s), con speedup frente a autorregresivo entre parentesis. Concurrencia 1, decodificacion greedy, R = 3, H100 NVL. Respuestas repetitivas filtradas. Autorregresivo y MTP se ejecutan en el motor oficial de vLLM; 2DSD usa r1 = 1 y r2 = 2.

| Tarea | Autorregresivo | MTP | 2DSD |
|---|---:|---:|---:|
| GSM8K | 93,1 | 225,1 (2,42x) | 292,0 (3,14x) |
| MATH-500 | 92,8 | 243,7 (2,63x) | 339,0 (3,65x) |
| HumanEval+ | 93,0 | 298,5 (3,21x) | 368,1 (3,96x) |
| MBPP+ | 93,0 | 284,5 (3,06x) | 323,2 (3,47x) |
| AIME24/25 | 91,8 | 257,9 (2,81x) | 313,9 (3,42x) |
| GPQA-Diamond | 91,8 | 240,2 (2,62x) | 264,2 (2,88x) |
| OlympiadBench | 91,5 | 250,4 (2,74x) | 294,6 (3,22x) |
| Media | 92,5 | 257,2 (2,77x) | 313,6 (3,37x) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como metrica de acierto, etc.) para el drafter en la informacion disponible; los datos anteriores son exclusivamente de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 541,88 M de parametros en safetensors (repo de 1,1 GB), el drafter ocupa aproximadamente 1,1 GB en precision de entrenamiento; debe sumarse la memoria del modelo objetivo TML-d24-varloop-research.
- GPU recomendadas: H100 NVL es la plataforma validada en la model card (concurrencia 1, greedy, R = 3). No se documentan otras GPU.
- Cabe en GPU consumer: no disponible; no se especifica soporte para RTX 4090 u otras consumer.
- Opciones de despliegue: el drafter se ejecuta mediante el repositorio SqueezeAILab/2DSD (`scripts/generate.py --model inkling-2-mini-varloop --drafter minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para el drafter; vLLM se menciona solo para las lineas base autorregresiva y MTP.
- Latencia y throughput: media de 313,6 tok/s (3,37x) en H100 NVL, con maximos de 368,1 tok/s en HumanEval+ y minimos de 264,2 tok/s en GPQA-Diamond.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Throughput (media) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| 2DSD DSpark drafter (este) | Drafter especulativo condicionado por profundidad | 541,88 M | no disponible | 313,6 tok/s (3,37x) | Apache 2.0 | Hugging Face + repo 2DSD |
| MTP (drafter incluido en el checkpoint) | Drafter multi-token prediction | no disponible | no disponible | 257,2 tok/s (2,77x) | Apache 2.0 (del objetivo) | Incluido en el checkpoint del objetivo |
| Decodificacion autorregresiva del objetivo | Sin drafter | no disponible (objetivo) | no disponible | 92,5 tok/s (1,00x) | Apache 2.0 | vLLM oficial |

No se dispone de datos de otros drafters comparables (por ejemplo, EAGLE o Medusa) para este modelo objetivo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como drafter del objetivo TML-d24-varloop-research con R = 3 y KV por bucle; no puede usarse con otros modelos.
- Requiere el repositorio 2DSD y su implementacion de drafting condicionado por profundidad; no hay soporte documentado en motores de inferencia estandar.
- Los datos de throughput estan medidos exclusivamente en H100 NVL, concurrencia 1 y decodificacion greedy; el rendimiento en otros entornos, con batching o con muestreo no esta documentado.
- Riesgo de alucinacion: al preservar la distribucion del objetivo, hereda los sesgos y errores del modelo base; el drafter no los corrige.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; dependen del modelo objetivo.
- Longitud de contexto: no disponible; limitada por el objetivo.
- Restricciones de licencia: Apache 2.0, la misma que TML-d24-varloop-research; el drafter no incluye pesos del objetivo, pero se entrena sobre sus salidas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-24; es un artefacto de investigacion reciente sin validacion externa documentada.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-inkling-2-mini-varloop-dspark-drafter
- Modelo objetivo: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo 2DSD: https://github.com/SqueezeAILab/2DSD
