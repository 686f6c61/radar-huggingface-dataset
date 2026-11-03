# decisionmodels/REAX-1.3

## Resumen

REAX 1.3 es un modelo de decisión distribuido desarrollado por decisionmodels, un laboratorio descentralizado que opera en la subred 92 de Bittensor. En lugar de un modelo generativo convencional, REAX 1.3 devuelve probabilidades sobre opciones tipadas de decisión a través de una interfaz compatible con Jev. El modelo combina dos componentes que se ejecutan en paralelo sobre una única GPU: la parte G, derivada de la línea Gemma, y la parte Q, derivada de la línea Qwen3.5-27B, ambas construidas a partir de fine-tunes ganadores de la competición de mineros de la subred.

La arquitectura es inusual: cada parte asigna una probabilidad a cada opción de cada petición y el motor promedia ambas distribuciones al 50/50, devolviendo todas las opciones suministradas. Los pesos se cargan en FP8 (block-128) y el conjunto ocupa aproximadamente 115 GB en el repositorio. El modelo está pensado para evaluación de decisiones estructuradas, no para generación libre de texto, y se distribuye bajo licencia Apache 2.0 con soporte exclusivo para inglés.

Su relevancia actual radica en su enfoque de entrenamiento abierto y competitivo: los mineros de Bittensor entrenan modelos de decisión y las releases oficiales incorporan los mejores. REAX 1.3 reporta un índice de 73,71 en el suite público Decision Index 0.3, con latencias medianas de 207 ms en una RTX PRO 6000 Blackwell de 96 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de dos modelos transformer (parte G: linea Gemma; parte Q: linea Qwen3.5-27B) con combinacion de probabilidades 50/50 |
| Parametros totales | no disponible (parte G derivada de modelos de 31B; parte Q derivada de modelos de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens de entrada (peticiones superiores se rechazan, no se truncan) |
| Tipos de cuantizacion | FP8 block-128 (unica configuracion soportada por el motor oficial) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 114,8 GB; carpetas part-g/ y part-q/) |

## Arquitectura y entrenamiento

REAX 1.3 no es un transformer unico sino un ensamblado de dos modelos independientes que se ejecutan en paralelo sobre la misma GPU. La parte G proviene de CharlieBT/gx31-decider (uid 18 de la subred), un fine-tune de la linea Gemma derivado de tattrongvu/Jeffan-31b-1710 y mezclado con PelaAI/KnowLine-31B-Gen1 (Gemma-4-31B). La parte Q proviene de gurujustin/sn92-gen-p5 (uid 83), un fine-tune de la linea Qwen3.5-27B via baselabs/mammoth-1, mezclado con vllm-sr/d3-ultra (27B, linaje Qwen). Cada peticion se envia a ambas partes y sus probabilidades por opcion se promedian al 50/50.

El entrenamiento es el resultado de una competicion abierta en la subred 92 de Bittensor, donde los mineros entrenan modelos de decision y las releases oficiales se construyen sobre los mejores. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es el propio esquema de ensamblado probabilístico con interfaz Jev-compatible: el modelo no genera texto libre sino que devuelve distribuciones de probabilidad sobre opciones tipadas (por ejemplo, choice con criterios nombrados), lo que permite integrarlo en sistemas de enrutamiento y clasificacion con umbrales calibrados.

## Capacidades

- Evaluacion de decisiones estructuradas: devuelve probabilidades sobre opciones tipadas (choice) con criterios nombrados, en lugar de texto generativo.
- Interfaz Jev-compatible para peticiones y respuestas (solo compatibilidad de interfaz, no implica respuestas identicas).
- Combinacion de dos modelos independientes (G y Q) con promedio 50/50 de probabilidades por opcion.
- Soporte de multiples preguntas por peticion (multi-question), con latencias que pueden alcanzar varios minutos.
- Capacidad de enrutamiento y clasificacion mediante criterios definidos por el usuario en la peticion.
- Integracion con el kit Decision Index para puntuacion alternativa via `python -m decision_index run --engine reax13_engine:Reax13Engine`.
- No se documentan capacidades de generacion libre de texto, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso en la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado de la incidencia y un conjunto de criterios (por ejemplo, "delivery" frente a "billing") y devuelve la probabilidad de cada equipo, permitiendo umbrales de derivacion automatica. Es adecuado porque su salida es una distribucion calibrada, no texto libre.
- Triaje de reclamaciones con multiples preguntas: una sola peticion puede incluir varias preguntas tipadas (por ejemplo, prioridad, departamento y accion recomendada), y el motor devuelve todas las opciones con sus probabilidades, lo que reduce el numero de llamadas.
- Clasificacion de riesgo en pipelines de decision: integrado mediante el kit Decision Index, permite puntuar decisiones sobre lotes de peticiones y comparar contra un indice de referencia (Decision Index 0.3) para monitorizar deriva.
- Sistemas de arbitraje entre modelos: al promediar dos lineas genealogicas distintas (Gemma y Qwen), el ensamblado puede usarse como voto de consenso en entornos donde se quiere reducir la dependencia de una sola familia de modelos.
- Investigacion sobre modelos de decision abiertos: el modelo y su motor son reproducibles (commit fijado del REAX Engine, pesos publicos), lo que permite estudiar el efecto del ensamblado G/Q y del entrenamiento competitivo en subredes descentralizadas.
- Evaluacion comparativa de modelos de decision: con el scorer publico Decision Index 0.3 y el conjunto de 140.178 peticiones puntuables, sirve como referencia para comparar nuevos fine-tunes de mineros contra la release oficial.
- Despliegue en infraestructura unica de 96 GB: al cargar ambas partes en FP8 sobre una sola RTX PRO 6000, encaja en entornos con una GPU de gama alta y sin necesidad de sharding multi-nodo.

## Benchmarks y rendimiento

| Medida | Resultado | Base |
|---|---|---|
| Public Decision Index 0.3 (suite publico completo, indice nativo) | 73,71 | Run reax13-public-0.3-20261103, 140.178 peticiones puntuables respondidas, scorer oficial, motor FP8 |
| Mismo indice contando la peticion por encima del limite de 32.000 tokens como rechazada | 73,70 | Igual que la anterior |
| Latencia mediana | 207 ms | Muestra uniforme de 1.000 llamadas del suite publico, una RTX PRO 6000, una peticion a la vez |
| Latencia media | 655 ms | Igual |
| Latencia p80 | 741 ms | Igual |

Comparativa en items publicos no usados en la seleccion de la receta (medicion propia, no oficial, no comparable con el 73,71 anterior; indice nativo con el scorer publico Decision Index 0.3 sobre 3.478 de 3.513 items publicos de Hugging Face Decision Index que los ocho modelos respondieron; 41 de 43 benchmarks; IC al 95% solo por muestreo de items):

| Modelo | Indice | IC 95% | REAX 1.3 menos este modelo (IC 95%) | Como se ejecuto |
|---|---|---|---|---|
| REAX 1.3 | 69,5 | [67,4; 71,4] | | Ejecutado por nosotros, FP8 |

La informacion disponible no incluye las filas restantes de esa tabla comparativa (KnowLine, d3-ultra y el resto de modelos), por lo que no se pueden reproducir aqui sus valores.

## Requisitos de hardware

- VRAM estimada: ambos componentes cargados en FP8 (block-128) con un pico de memoria reservada de aproximadamente 88,5 GiB sobre una unica GPU.
- GPU recomendada: una NVIDIA RTX PRO 6000 Blackwell de 96 GB, con driver con CUDA 13 / SM120. Es la referencia oficial del autor.
- No cabe en GPU de consumo (RTX 4090, 5090, etc.) por el pico de 88,5 GiB y la ausencia de cuantizaciones inferiores a FP8 en el motor oficial.
- Disco: al menos 400 GB libres; RAM: 64 GiB minimo, 128 GiB recomendado durante la carga de pesos FP8.
- Despliegue: motor REAX Engine en modo `reax13` (MIT), construido con Docker y NVIDIA Container Toolkit; commit fijado `ff8f595f149abdd50ea914455eadc74cf97a277f`. Alternativa de puntuacion via `decision_index run --engine reax13_engine:Reax13Engine`.
- Endpoints: `GET /healthz` y `POST /v1/systemone` en 127.0.0.1:8080.
- Latencia y throughput: mediana 207 ms, media 655 ms, p80 741 ms en muestras de una peticion a la vez. Las peticiones multi-pregunta largas pueden tardar varios minutos; se recomienda timeout de cliente de al menos 1.800 s. No se documenta throughput agregado.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice (medicion propia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REAX 1.3 | no disponible (ensamblado G+Q) | 32.000 tokens | 69,5 [67,4; 71,4] en subconjunto de 3.478 items | Apache 2.0 | Hugging Face (decisionmodels/REAX-1.3) |
| KnowLine (PelaAI/KnowLine-31B-Gen1) | 31B | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| d3-ultra (vllm-sr/d3-ultra) | 27B | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| gx31-decider (CharlieBT) | linea Gemma 31B | no disponible | no disponible en la informacion | no disponible | Hugging Face |

La tabla comparativa del autor menciona ocho modelos y 41 de 43 benchmarks, pero la informacion proporcionada solo incluye la fila de REAX 1.3, por lo que el resto de valores se marca como no disponible. No se dispone de comparaciones con modelos generativos convencionales de proposito general.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; devuelve probabilidades sobre opciones tipadas. No debe usarse como sustituto de un LLM conversacional.
- Solo ingles: el unico idioma declarado es `en`; no hay soporte documentado para castellano ni otros idiomas.
- Limite estricto de contexto: las peticiones de mas de 32.000 tokens de entrada se rechazan como no soportadas, nunca se truncan. Una peticion del suite publico supera ese limite.
- Latencias muy variables: aunque la mediana es de 207 ms, las peticiones multi-pregunta largas pueden tardar varios minutos; es imprescindible configurar timeouts de cliente de 1.800 s o superiores.
- Requisito de hardware elevado: una unica GPU de 96 GB (RTX PRO 6000 Blackwell) con CUDA 13 / SM120 y pico de 88,5 GiB; no hay cuantizaciones alternativas documentadas.
- Resultados internos, no oficiales: las cifras de Decision Index (73,71 y 69,5) son mediciones propias del autor, no puntuaciones de leaderboard oficial, y la comparativa de 69,5 no es comparable con la de 73,71.
- Seleccion de receta potencialmente sesgada: el autor reconoce que el segundo sorteo de items se anadio despues de conocer un resultado parcial favorable a REAX, lo que puede introducir sesgo en la comparativa.
- Dependencia de componentes de terceros: los pesos incorporan fine-tunes de mineros y modelos base de la linea Gemma y Qwen; las licencias y avisos de los contribuyentes upstream estan en ATTRIBUTION.md, NOTICE y licenses/, y deben revisarse antes de uso comercial.
- "Jev-compatible" solo describe la interfaz de peticion/respuesta; no implica respaldo ni salidas identicas a otros sistemas Jev.
- Licencia Apache 2.0 permite uso comercial, pero la combinacion con pesos upstream (Gemma, Qwen y fine-tunes) puede imponer condiciones adicionales segun sus licencias originales.
- Sin datos publicados sobre sesgos, tasas de alucinacion en el sentido generativo, ni robustez fuera del suite Decision Index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decisionmodels/REAX-1.3
- Repositorio de resultados: https://huggingface.co/decisionmodels/REAX-1.3-decision-index
- Motor de inferencia REAX Engine (MIT): https://github.com/reaxlabs/reax-engine
- Kit Decision Index: https://github.com/apolinario/decision-index
- Parte G (minero uid 18): https://huggingface.co/CharlieBT/gx31-decider
- Parte Q (minero uid 83): https://huggingface.co/gurujustin/sn92-gen-p5
- Modelo base de la parte G: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Modelo mezclado en la parte G: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo base de la parte Q: https://huggingface.co/baselabs/mammoth-1
- Modelo mezclado en la parte Q: https://huggingface.co/vllm-sr/d3-ultra
- Atribuciones: ATTRIBUTION.md, NOTICE y carpeta licenses/ dentro del repositorio del modelo
