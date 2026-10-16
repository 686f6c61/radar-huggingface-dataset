# prabakaranchandran/baby-pooh-46m-midtrain-r2

## Resumen

Baby Pooh 46M, mid-training r2 es un modelo de lenguaje causal de 46.151.680 parámetros entrenado desde cero por el usuario prabakaranchandran, con arquitectura basada en Qwen3. No es un modelo de instrucciones ni de chat: es la ronda r2 de un proceso de *mid-training* aplicado sobre el checkpoint previo a la decaida de *learning rate* de Baby Pooh 46M v1, cuyo objetivo es inyectar conocimiento del universo de Winnie-the-Pooh de A. A. Milne dentro del corpus de escala infantil (BabyLM). Está etiquetado explícitamente como experimental y trabajo en curso.

La ronda r2 combina el flujo de Pooh de la ronda r1 con un componente de diversidad: relaciones EntiGraph entre cada par de entidades de cada capítulo y reformulaciones WRAP en estilos fijos. Este flujo suma 1,58 millones de tokens, se mezcla en 1 de cada 32 filas de cada lote (3,1 % del batch) y se recorre durante 8,7 pasadas. La receta hereda de v1: Muon + AdamW, LR máximo 4e-3, 131.000 tokens por paso y 3.363 pasos de decaida, con el contexto pasando de 512 a 4.096 tokens.

El interés del modelo es de investigación: sirve como banco de pruebas para medir cómo la mezcla de datos sintéticos y relaciones estructuradas afecta a un modelo pequeño en tareas de plausibilidad gramatical, *tracking* de entidades y conocimiento de dominio cerrado, todo bajo el marco de evaluación BabyLM. No está pensado para uso en producción ni para tareas generativas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, arquitectura Qwen3, entrenado desde cero |
| Parametros totales | 46.151.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (entrenamiento con cambio de 512 a 4.096 durante la decaida) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (solo se distribuyen pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *transformer* decoder causal con la arquitectura de Qwen3, entrenado desde cero sobre un corpus de escala infantil. La ronda r2 no entrena desde el inicio: parte del checkpoint pre-decaida de Baby Pooh 46M v1 y rehace la decaida final del *learning rate* (20 % de decaida) mezclando en cada lote un flujo de datos del universo Pooh. El optimizador es una combinacion de Muon y AdamW, con LR maximo de 4e-3, 131.000 tokens por paso y 3.363 pasos de decaida. Los conjuntos de datos declarados son prabakaranchandran/pooh-babylm-mix-220m y prabakaranchandran/pooh-world-midtrain.

La innovacion concreta de esta ronda es la composicion del flujo de mid-training: r2 = flujo de r1 + diversidad, donde la diversidad se materializa como relaciones EntiGraph entre cada par de entidades de cada capitulo y reformulaciones WRAP en estilos fijos. El flujo completo tiene 1,58 millones de tokens, ocupa 1 de cada 32 filas de cada lote (3,1 %) y se recorre 8,7 veces. Las rondas r1, r2 y r3 son alternativas entre si, no etapas sucesivas: cada una cambia un solo factor respecto a la anterior. No hay RLHF ni DPO; el ajuste a personaje, chat y seguridad se reserva para un post-entrenamiento posterior que no forma parte de este repositorio.

## Capacidades

- Generacion de texto causal en ingles a nivel de modelo pequeno de investigacion (46M parametros).
- Modelado de lenguaje y prediccion de siguiente token sobre corpus de escala infantil (BabyLM).
- Conocimiento inducido del universo de Winnie-the-Pooh de A. A. Milne: entidades, relaciones y hechos de canon (medido en el Pooh eval set del autor).
- Juicios de plausibilidad gramatical (BLiMP y BLiMP supplement) y de conocimiento del mundo sencillo (EWoK).
- *Tracking* de entidades y coherencia referencial a corto alcance.
- No soporta *tool calling* ni *function calling*.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo *thinking*, vision ni audio.
- No esta instruido ni alineado: no es un modelo de chat.

## Casos de uso

- Investigacion en BabyLM: reproduccion y comparacion de las metricas zero-shot del *evaluation-pipeline-2025* (BLiMP, EWoK, COMPS, *eye tracking*, *self-paced reading*) frente a los baselines GPT-2 100M y GPT-BERT causal publicados por el propio autor.
- Ablacion de estrategias de mid-training: el modelo permite medir el efecto marginal de anadir relaciones EntiGraph y reformulaciones WRAP comparando r1 (sin diversidad) frente a r2 (con diversidad) manteniendo constante el resto de la receta.
- Analisis de *forgetting* de dominio: las filas de *held-out Milne* (WtP cap.2 y HPC cap.6) en la tabla de *validation loss* permiten estudiar como la mezcla de datos sinteticos afecta a la perplejidad sobre textos del dominio objetivo (r1 degrada a 4,259/4,504; r2 baja a 3,349/3,393).
- Evaluacion de conocimiento factual en dominio cerrado: el Pooh eval set de 411 items permite comparar r2 con v1 y r3 en grupos como canon, personajes, sentimientos, creacion y mundo.
- Estudio de corpus y pipelines de datos sinteticos: como consumidor del dataset pooh-world-midtrain, sirve para validar la utilidad de grafos de entidades y reformulaciones controladas en corpus muy pequenos.
- Prototipado educativo y docencia: por su tamano (46M) y licencia Apache 2.0, se puede ejecutar en portatil para ilustrar el ciclo completo de preentrenamiento, mid-training y evaluacion, sin coste de GPU.
- Analisis de sesgos en modelos entrenados con corpus infantiles y de dominio restringido, dado que el modelo no ha pasado por alineacion.

## Benchmarks y rendimiento

BabyLM zero-shot (evaluation-pipeline-2025, backend causal; mayor es mejor). Valores en porcentaje:

| Modelo | BLiMP | BLiMP suppl. | EWoK | Entity tracking | COMPS | Eye tracking | Self-paced reading |
|---|---|---|---|---|---|---|---|
| Baby Pooh v1 (stage 1) | 77,53 | 72,77 | 54,91 | 31,18 | 58,60 | 8,79 | 4,04 |
| r1 (0,67M tokens, 41 pasadas) | 77,22 | 71,33 | 53,55 | 32,65 | 58,32 | 8,45 | 3,87 |
| **r2 (1,58M tokens, 8,7 pasadas)** | **76,22** | **70,33** | **55,36** | **32,00** | **58,55** | **9,11** | **4,04** |
| r3 (1,77M tokens, 7,8 pasadas) | 76,49 | 70,77 | 53,91 | 30,80 | 58,30 | 8,77 | 3,92 |
| GPT-2 100M (baseline BabyLM) | 74,88 | 63,32 | 51,64 | 31,51 | 56,17 | 7,89 | 3,18 |
| GPT-BERT causal (baseline BabyLM) | 79,29 | 70,42 | 51,18 | 30,90 | 58,25 | 8,36 | 3,02 |

Perdida de validacion al final del entrenamiento (nats/token; menor es mejor):

| Conjunto de validacion | v1 | r1 | r2 | r3 |
|---|---|---|---|---|
| babylm/bnc_spoken | 3,220 | 3,231 | 3,229 | 3,226 |
| babylm/childes | 1,627 | 1,632 | 1,629 | 1,630 |
| babylm/gutenberg | 3,300 | 3,324 | 3,312 | 3,314 |
| babylm/open_subtitles | 2,982 | 2,995 | 2,988 | 2,988 |
| babylm/simple_wiki | 2,136 | 2,150 | 2,145 | 2,146 |
| babylm/switchboard | 2,173 | 2,180 | 2,178 | 2,178 |
| fineweb_edu | 3,377 | 3,397 | 3,390 | 3,388 |
| held-out Milne: WtP cap.2 | 2,560 | 4,259 | 3,349 | 3,403 |
| held-out Milne: HPC cap.6 | 2,622 | 4,504 | 3,393 | 3,534 |
| soda | 1,491 | 1,509 | 1,502 | 1,498 |
| tinydialogues | 1,581 | 1,598 | 1,593 | 1,593 |
| mean_over_sources | 2,461 | 2,798 | 2,610 | 2,627 |

Pooh eval set (411 items escritos por el modelo autor y verificados por el juez; eleccion multiple por verosimilitud, azar 25 %). Precision en porcentaje y cambio frente a v1 con intervalo de confianza del 95 % por *bootstrap* emparejado:

| Grupo | n | v1 | r1 | r1-20pass | r2 | r3 |
|---|---|---|---|---|---|---|
| canon-seen | 122 | 27,0 | 55,7 (+28,7 [+19, +39]) | 56,6 (+29,5 [+20, +39]) | 55,7 (+28,7 [+19, +39]) | 59,8 (+32,8 [+24, +43]) |
| canon-held-out | 37 | 27,0 | 48,6 (+21,6 [+3, +41]) | 27,0 (+0,0 [-14, +14]) | 48,6 (+21,6 [+8, +38]) | 37,8 (+10,8 [-5, +27]) |
| characters | 29 | 41,4 | 41,4 (+0,0 [-21, +21]) | 58,6 (+17,2 [+0, +38]) | 55,2 (+13,8 [+0, +31]) | 44,8 (+3,4 [-17, +24]) |
| feelings | 47 | 34,0 | 40,4 (+6,4 [-6, +19]) | 44,7 (+10,6 [-4, +26]) | 38,3 (+4,3 [-11, +19]) | 38,3 (+4,3 [-13, +19]) |
| creation | 33 | 18,2 | 36,4 (+18,2 [-3, +39]) | 48,5 (+30,3 [+9, +52]) | 36,4 (+18,2 [-3, +36]) | 27,3 (+9,1 [-9, +27]) |
| world | 57 | 49,1 | 47,4 (-1,8 [-11, +7]) | 42,1 (-7,0 [-18, +4]) | 50,9 (+1,8 [-9, +14]) | 43,9 (truncado en la fuente) |

Nota: la ultima fila de la tabla Pooh eval esta truncada en la model card de origen; no se reproducen los valores completos del intervalo para r3 en el grupo "world".

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~185 MB en fp32, ~92 MB en fp16/bf16, ~46 MB en int8 y ~23 MB en int4. El repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GTX 1050, RTX 3050, RTX 4060 y superiores. En la practica, tambien cabe en GPUs integradas y es viable en CPU.
- Cabe en *consumer GPU*: si, en cualquier GPU moderna e incluso en hardware de gama baja. El cuello de botella no es la memoria sino la calidad del modelo.
- Opciones de despliegue: `transformers` (verificado en la model card con `AutoModelForCausalLM` y `AutoTokenizer`), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`). No se distribuyen pesos GGUF, por lo que `llama.cpp` u `Ollama` requeririan conversion previa, no documentada por el autor. `vLLM` no esta confirmado en la informacion proporcionada.
- Latencia y throughput: no disponible. Dado el tamano, la generacion en GPU es de baja latencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BabyLM / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baby Pooh 46M midtrain r2 | 46M | 4.096 | BLiMP 76,22; EWoK 55,36; mejor en *eye tracking* (9,11) de su familia | Apache 2.0 | HuggingFace (0 descargas, 0 *likes*) |
| Baby Pooh 46M v1 | 46M | 4.096 | BLiMP 77,53; mejor en *held-out Milne* (2,560 / 2,622) | Apache 2.0 | HuggingFace |
| Baby Pooh 46M midtrain r3 | 46M | 4.096 | BLiMP 76,49; mejor en canon-seen (59,8) | Apache 2.0 | HuggingFace |
| GPT-2 100M (baseline BabyLM) | 100M | 1.024 (GPT-2 estandar) | BLiMP 74,88; EWoK 51,64 | Licencia MIT (GPT-2 estandar) | Publico |
| GPT-BERT causal (baseline BabyLM) | no disponible | no disponible | BLiMP 79,29; EWoK 51,18 | no disponible | Baseline del pipeline BabyLM |

El modelo se situa por debajo de GPT-BERT causal en tareas de sintaxis (BLiMP 76,22 frente a 79,29) y por encima de GPT-2 100M en EWoK (55,36 frente a 51,64) y COMPS (58,55 frente a 56,17), pese a tener aproximadamente la mitad de parametros que GPT-2 100M.

## Limitaciones y advertencias

- Modelo experimental y trabajo en curso: el propio autor lo etiqueta como WIP y no recomienda usarlo como modelo de chat ni de instrucciones.
- No esta alineado: no ha pasado por RLHF ni DPO, no tiene personalidad ni capa de seguridad. Puede generar contenido inapropiado o incoherente sin filtro.
- Riesgo alto de alucinacion: con 46M de parametros y un corpus de escala infantil, el conocimiento factual fuera del dominio Pooh/BabyLM es muy limitado y poco fiable.
- Idioma: solo ingles. No hay soporte multilingue declarado.
- *Forgetting* de dominio: la ronda r1 degrada fuertemente la perplejidad sobre textos *held-out* de Milne (de 2,560/2,622 en v1 a 4,259/4,504); r2 recupera parcialmente (3,349/3,393) pero sigue por encima de v1.
- Datos sinteticos: el flujo de mid-training incluye material generado por el propio autor (relaciones EntiGraph, reformulaciones WRAP, corpus de autobiografia en r3), lo que introduce riesgo de sesgo de modelo y de contaminacion circular en las evaluaciones Pooh.
- Evaluaciones Pooh escritas y verificadas por modelos: el propio autor indica que el conjunto de 411 items fue escrito por el modelo autor y verificado por el juez, lo que limita la independencia del *benchmark*.
- Contexto limitado: 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la falta de alineacion hace desaconsejable su despliegue en produccion orientado a usuarios finales.
- Derechos de imagen: la ilustracion de portada (E. H. Shepard, 1926) esta en dominio publico en Estados Unidos, pero bajo copyright en el Reino Unido hasta 2047.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prabakaranchandran/baby-pooh-46m-midtrain-r2
- Modelo base v1: https://huggingface.co/prabakaranchandran/baby-pooh-46m
- Ronda r3: https://huggingface.co/prabakaranchandran/baby-pooh-46m-midtrain-r3
- Dataset de preentrenamiento: https://huggingface.co/datasets/prabakaranchandran/pooh-babylm-mix-220m
- Dataset de mid-training: https://huggingface.co/datasets/prabakaranchandran/pooh-world-midtrain
- Ilustracion de portada en Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Winnie-the-Pooh_143.png
- Paper o blog del autor: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada.
- Demo: no disponible en la informacion proporcionada.
