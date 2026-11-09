# SAFWAAN/fieldatlas-reader-qwen3.5-2b

## Resumen

Field Atlas reader — Qwen3.5-2B es un modelo de lenguaje de 1.880 millones de parametros derivado de Qwen/Qwen3.5-2B (Apache-2.0) y ajustado mediante fine-tuning supervisado para una tarea muy concreta: responder preguntas en ingles a partir de hasta 8 pasajes recuperados por el buscador local de Field Atlas, una enciclopedia offline para Android. El modelo no pretende saber del mundo, sino citar correctamente lo que dicen las fuentes guardadas en el dispositivo, admitir cuando no alcanzan y no inventar cifras.

Lo desarrolla el usuario SAFWAAN en el contexto del bounty poidh #45 ("Train a small offline reader model for Field Atlas"). La relevancia esta en el formato de salida: cada frase debe llevar una cita `[S#]` valida, las preguntas sin respuesta se rechazan con la cadena exacta "The saved sources don't say.", y las respuestas parciales nombran el hueco. Sobre el dev set publico de 60 items pasa de 36,7 % a 85,0 % de respuestas correctas respecto al Qwen3.5-2B base cuantizado, manteniendo 0 % de numeros no soportados.

Se distribuye unicamente en GGUF (Q4_K_M y Q4_0), pensado para ejecutarse en llama.cpp sobre CPU de moviles de gama baja (6-8 GB de RAM), con un contexto de 8192 tokens. No incluye la torre de vision ni la capa de prediccion multi-token del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B, solo torre de texto; sin torre de vision ni capa de prediccion multi-token) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (1,27 GB) y Q4_0 (1,20 GB); imatrix generada a partir de 300 prompts de reader |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos y codigo); datos de entrenamiento CC BY-SA 4.0 con pasajes bajo sus licencias de origen |
| Formato de pesos | GGUF (llama.cpp, commit `60081bb2b`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y conserva unicamente la torre de texto, descartando la torre de vision y la capa de prediccion multi-token del modelo original. El ajuste se realizo como fine-tuning supervisado sobre datos generados con un pipeline propio (scripts `gen.py`, `fetch.py`, `run.sh`), con un profesor que produce respuestas citadas y rechazos controlados. No se documenta en la informacion disponible el uso de RLHF, DPO ni el numero exacto de tokens de entrenamiento.

La innovacion principal no esta en la arquitectura sino en el comportamiento aprendido: citacion por frase con identificadores `[S#]`, rechazo con frase literal ante informacion insuficiente, respuestas parciales que nombran el hueco y copia literal de cifras sin conversion de unidades, redondeo ni aritmetica. La cuantizacion se hizo con llama.cpp en el commit `60081bb2b` (el que fija la app Field Atlas) usando una importance matrix derivada de 300 prompts del dominio. El conjunto de validacion (400 items) se congelo antes del entrenamiento y no se uso para seleccion de checkpoint ni de cuantizacion; el dev set publico de 60 items tampoco aparece en los datos de entrenamiento.

## Capacidades

- Generacion de respuestas cortas (tipicamente 40-90 palabras) en prosa plana, en ingles, a partir de hasta 8 pasajes de contexto.
- Citacion por frase: cada oracion incluye al menos una referencia `[S#]` a un pasaje existente.
- Rechazo preciso: devuelve exactamente "The saved sources don't say." cuando los pasajes no responden.
- Respuestas parciales: cubre la parte disponible con citas y cierra con una frase que empieza por "The saved sources don't say" nombrando el hueco.
- Fidelidad numerica: no introduce cifras que no esten en los pasajes o en la pregunta; no convierte unidades ni redondea.
- Dominio sanitario y primeros auxilios: se limita a pasos y dosis literales de los pasajes, sin completar desde memoria.
- Grounded QA / RAG cerrado: disenado para el pipeline de busqueda local de Field Atlas.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking (la evaluacion se hace con thinking off).

## Casos de uso

- Enciclopedia offline en Android: el modelo es el lector de Field Atlas; recibe la pregunta del usuario y los pasajes recuperados por el buscador del telefono y devuelve una respuesta citada que el usuario puede verificar contra las fuentes guardadas.
- Asistencia en primeros auxilios sin red: ante una consulta de salud, responde solo con los pasos y dosis que aparecen en los pasajes, lo que evita recomendaciones generadas de memoria en un contexto critico.
- Verificacion de respuestas en producto: al exigir cita por frase, permite construir interfaces que enlazan cada oracion a su pasaje de origen, util para auditar respuestas en dominios regulados.
- Deteccion de huecos en la base documental: cuando el modelo responde con "The saved sources don't say", el equipo puede usar esa senal para identificar articulos que faltan en la enciclopedia.
- Despliegue en dispositivos de gama baja: con Q4_K_M ocupa 1,18 GiB de pesos y corre en CPU de moviles con 6-8 GB de RAM; sirve para cualquier app que necesite QA sobre un corpus local sin conexion.
- Evaluacion de pipelines RAG: el formato de salida estricto (citas validas, cero numeros no soportados, rechazo exacto) lo hace util como componente de referencia para medir la calidad de un recuperador.
- Respuestas comparativas o cripto de baja complejidad: cubre preguntas que combinan varios hechos de distintos pasajes, aunque con menor tasa de acierto (ver limitaciones).

## Benchmarks y rendimiento

Dev set publico (`docs/fieldtest/reader/dev.jsonl`, 60 items), temperatura 0, 400 tokens maximos, thinking off, servido con `llama-server` del commit `60081bb2b`:

| Modelo | Correctas | Hechos clave | Huecos admitidos | Rechazos falsos | Numeros no soportados | Palabras medianas |
|---|---|---|---|---|---|---|
| Baseline Qwen3.5-2B Q4_K_M (app) | 36,7 % | 75,2 % | 94,4 % | 47,6 % | 0 % | 60 |
| Este modelo, Q4_K_M | 85,0 % (51/60) | 94,3 % | 94,4 % | 9,5 % | 0 % | 80 |
| Este modelo, Q4_0 | 83,3 % (50/60) | 94,3 % | 83,3 % | 4,8 % | 0 % | 79 |

Conjunto held-out propio (400 items, congelado antes del entrenamiento):

| Modelo | Hechos clave exactos | Hechos clave justos |
|---|---|---|
| Este modelo, Q4_K_M | 70,8 % | 79,8 % |
| Este modelo, Q4_0 | 67,8 % | 75,0 % |

Rendimiento en movil (realme narzo 60 5G, MediaTek Dimensity 6020, 8 GB RAM, Android 15, CPU, Termux, Q4_K_M):

| Test | 4 hilos | 8 hilos |
|---|---|---|
| Prompt processing 2048 tokens (pp2048) | 25,6 t/s | 30,0 t/s |
| Generacion 128 tokens (tg128) | 7,5 t/s | 7,5 t/s |
| pp2048+tg128 | 21,3 t/s | 24,1 t/s |

Una peticion tipica (system prompt + 6 pasajes, unos 2500 tokens de entrada y 100 de salida) tarda aproximadamente 95 s en ese telefono. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM de pesos: 1,18 GiB con Q4_K_M; 1,20 GB de fichero en Q4_0.
- Contexto: 8192 tokens; el coste de KV cache crece con la longitud de entrada.
- GPU: no se documenta soporte GPU especifico; el modelo esta pensado para CPU. En GPUs de escritorio (RTX 4090, A100, H100) cabria sin problema por tamano, pero no hay datos de throughput publicados.
- Consumer GPU: si, cualquier GPU con al menos 2-3 GB de VRAM libre puede alojar los pesos; no hay mediciones publicadas.
- Moviles: validado en un terminal con 8 GB de RAM (Dimensity 6020); el autor compara con un 4B que tarda 3-6 minutos por respuesta en un Redmi 13C de 6 GB.
- Despliegue: llama.cpp (commit `60081bb2b`), `llama-server`; compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia: ~95 s por respuesta tipica en el movil de referencia; 7,5 t/s de generacion y hasta 30 t/s de procesamiento de prompt con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Correctas en dev set | Licencia | Formato |
|---|---|---|---|---|---|
| Field Atlas reader — Qwen3.5-2B (Q4_K_M) | 1,88 B | 8192 | 85,0 % | Apache-2.0 | GGUF |
| Qwen3.5-2B base cuantizado (baseline de la app) | ~2 B | no disponible | 36,7 % | Apache-2.0 | GGUF |
| 4B usado como referencia por el autor de Field Atlas | ~4 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con otros modelos de QA citada del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo no esta entrenado ni evaluado en castellano ni en otros idiomas.
- Especializado y estrecho: fuera del formato pregunta + pasajes su comportamiento no esta caracterizado; no es un modelo de proposito general.
- Preguntas comparativas y cripto: los fallos se concentran en preguntas que requieren combinar varios hechos de pasajes distintos.
- Hechos clave exactos: en el held-out propio baja al 70,8 % con coincidencia literal, por variaciones de redaccion aceptadas; la cifra representativa es la del dev set (85,0 %).
- Riesgo de alucinacion residual: aunque el entrenamiento penaliza numeros no soportados y el benchmark reporta 0 %, no hay garantia formal de fidelidad en produccion; conviene mantener verificacion contra las citas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al depender de pasajes, hereda los sesgos y errores del corpus de Field Atlas.
- Licencia: pesos y codigo Apache-2.0 permiten uso comercial; los datos de entrenamiento son CC BY-SA 4.0 y los pasajes conservan sus licencias de origen, lo que puede condicionar la redistribucion del dataset.
- Sin datos de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K publicados, por lo que la comparacion con otros modelos se limita al benchmark propio.
- Dependencia de version: la cuantizacion esta fijada al commit `60081bb2b` de llama.cpp; otras versiones pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SAFWAAN/fieldatlas-reader-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/SAFWAAN/fieldatlas-reader-data
- Repositorio Field Atlas: https://github.com/0x94t3z/fieldatlas
- Script de evaluacion: https://github.com/0x94t3z/fieldatlas/blob/main/tools/evaluation/reader_bench.py
- Commit de llama.cpp fijado: https://github.com/ggml-org/llama.cpp/commit/60081bb2b5b3294165a4d67c5cbeebe74c868014
- Bounty poidh #45: https://poidh.xyz/mainnet/bounty/45
