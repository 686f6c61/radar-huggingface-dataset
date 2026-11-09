# Myric/apex-quant-benchmarks

## Resumen

Myric/apex-quant-benchmarks no es un modelo de lenguaje, sino un repositorio de resultados de benchmarks publicado por el usuario Myric en Hugging Face. Contiene las mediciones de una suite privada de 42 tareas de codificacion agentica aplicada a distintos modelos GGUF cuantizados por el propio autor. El repositorio tiene un tamano de 0.0 GB, lo que confirma que se trata unicamente de un informe de resultados y no de pesos de modelo.

El benchmark se centra en evaluar modelos en un bucle real de uso de herramientas (bash, read, write, edit) mediante OpenCode, en lugar de en generacion de una sola respuesta. Las 42 tareas se dividen en cuatro suites: `opencode_tasks` (25 tareas de algoritmia general), `opencode_tasks_hard` (5 tareas de correccion y extension de codigo existente), `opencode_tasks_frontier` (9 tareas de frontera: regex, btree, SQL, CRDT, limitadores de tasa y transacciones) y `opencode_tasks_tier4a` (3 tareas de reparacion multiarchivo estilo SWE-bench).

La relevancia de este repositorio radica en su enfoque metodologico: mide la capacidad de los modelos cuantizados para completar tareas de codificacion agentica bajo un presupuesto de tiempo real, distinguiendo explicitamente entre tareas falladas y tareas anuladas por limites del arnes (timeout, truncamiento por limite de salida). Esto lo convierte en una referencia util para quienes despliegan modelos GGUF en entornos locales con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de benchmarks, no modelo) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (el arnes ajusta contexto hasta 262.144 tokens) |
| Tipos de cuantizacion | no aplica (evalua modelos GGUF de terceros, p. ej. UD-Q4_K_XL) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (repositorio de resultados, sin pesos) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado ni pesos. Se trata de un informe de resultados de benchmarks sobre modelos GGUF externos, cuantizados por el autor y evaluados en un arnes privado de 42 tareas de codificacion agentica.

El arnes de evaluacion sirve los modelos localmente mediante `llama-server` y los conduce a traves del bucle real de uso de herramientas de OpenCode contra el fichero `PROMPT.md` de cada tarea. El codigo generado se califica ejecutando `pytest test_solution.py` de forma limpia, sin confiar en el autoinforme del modelo. La puntuacion es de credito parcial: la fraccion de items individuales de pytest superados, acumulada por suite. Las condiciones fijas incluyen `--parallel 1`, compactacion desactivada, contexto ajustado automaticamente hasta 262.144 tokens, limite de salida por familia por encima del peor caso de razonamiento, pared de 3.600 s por tarea y muestreo con la temperatura y top-p recomendados en la model card de cada modelo.

## Capacidades

- Evaluacion de codificacion agentica: mide la capacidad de modelos GGUF para resolver tareas de programacion mediante un bucle real de uso de herramientas (bash, read, write, edit).
- Puntuacion de credito parcial: calcula la fraccion de items de pytest superados por tarea, no solo exito o fallo binario.
- Distincion entre fallo y anulacion: separa explicitamente las tareas no completadas por timeout o truncamiento (void) de las falladas, reportando `Valid = 42 − void`.
- Medicion de eficiencia: registra tokens de salida por tarea valida (`Tok/task`) y tasa de tokens de salida de extremo a extremo (`Tok/s`), incluyendo prefill e inactividad del bucle de herramientas.
- Comparacion entre cuantizaciones: permite contrastar el rendimiento de distintas cuantizaciones GGUF del mismo modelo o de modelos de escala similar.
- Cobertura de cuatro suites: algoritmia general, correccion de codigo existente, tareas de frontera y reparacion multiarchivo estilo SWE-bench.
- No soporta generacion de texto, vision, audio ni tool calling por si mismo: es un informe, no un modelo desplegable.

## Casos de uso

- Seleccion de cuantizacion para despliegue local: un desarrollador que quiera ejecutar un modelo de codificacion en una GPU consumer puede consultar las filas del benchmark para decidir que cuantizacion GGUF ofrece el mejor equilibrio entre tareas superadas y tokens por segundo en hardware comparable.
- Validacion de modelos en tareas agenticas reales: equipos que integren asistentes de codificacion en pipelines de CI/CD pueden usar los resultados para estimar si un modelo concreto completara bucles multi-paso con uso de herramientas dentro de un presupuesto de tiempo razonable.
- Planificacion de hardware: las columnas de caja (GB10 con ~119 GiB de memoria unificada, Thor con 128 GB DDR3 y RTX 4060 de 16 GB) permiten extrapolar que modelos caben y a que velocidad en configuraciones similares.
- Investigacion sobre evaluacion de agentes: el diseno del arnes (pared de 3.600 s por tarea, presupuesto externo de 12 horas, contexto autoajustado hasta 262.144 tokens) sirve como referencia metodologica para quien disene sus propias suites de evaluacion agentica.
- Analisis de robustez entre repeticiones: la columna `Reps` documenta el numero de ejecuciones y el rango total de tareas superadas, lo que permite evaluar la varianza de cada modelo y decidir si un resultado de una sola ejecucion es fiable.
- Deteccion de cuellos de botella por tiempo: la distincion entre tareas anuladas y falladas ayuda a identificar si un modelo es demasiado lento para un despliegue concreto, independientemente de su capacidad teorica.
- Comparacion entre familias de modelos: al enlazar cada fila al modelo probado o a su model card oficial, el repositorio facilita la comparacion cruzada entre familias como Muse-Glimmer, K2-Horizon-MoVA, Spark-X2.5, Spark-X2.6 y MiniCPM5.

## Benchmarks y rendimiento

Los resultados publicados en el repositorio se resumen en la siguiente tabla. `G` = general (25 tareas), `H` = hard (5), `F` = frontier (9), `T4A` = tier4a (3). Las columnas por suite y total corresponden a la mejor ejecucion. `Valid` es `passed / (42 − void)`. `Tok/task` son tokens de salida por tarea valida y `Tok/s` la tasa de extremo a extremo.

| Modelo | Quant | G (25) | H (5) | F (9) | T4A (3) | Valid | Void | Tok/task | Tok/s | Reps |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Muse-Glimmer-30B | UD-Q4_K_XL | 25/25 | 5/5 | 9/9 | 3/3 | 42/42 | 0 | 5.021 | 9,3 | 1 |
| K2-Horizon-MoVA-36B-A4B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Spark-X2.5-4B BF16 | BF16 | no disponible | no disponible | no disponible | no disponible | 32/32 | 10 | no disponible | no disponible | no disponible |
| Spark-X2.6-4B | no disponible | no disponible | no disponible | no disponible | no disponible | 39/39 | 3 | no disponible | no disponible | no disponible |
| MiniCPM5-2B | no disponible | no disponible | no disponible | no disponible | no disponible | 35/35 | 7 | no disponible | no disponible | no disponible |

Notas metodologicas relevantes publicadas por el autor:

- Una puntuacion perfecta (42/42) es el umbral de entrada, no un hallazgo: las suites estan disenadas para saturar a un codificador competente. La medicion relevante esta en que suite se cae un modelo y, una vez saturado el exito/fallo, en los tokens de salida a igual puntuacion.
- Siete de las nueve tareas de frontera pueden invertirse entre repeticiones identicas, y la dispersion de tokens dentro de un mismo brazo alcanza dos digitos. La tabla muestra la mejor ejecucion por fila y la columna `Reps` da el numero de ejecuciones y el rango total.
- Una ejecucion de 42 tareas tarda tipicamente ~2 horas en la GB10. Sobre las 74 ejecuciones completas, la mediana es 1,8 h, el p90 4,9 h y el valor atipico mas lento 14,5 h (Spark-X2.5-4B BF16, 10 voids). El presupuesto externo de 12 horas es un limite real.
- Una tarea que alcanza la pared o el limite de salida se marca como void, no como fallo. Por eso `Valid = 42 − void` es la columna que debe leerse. Un void tampoco es evidencia de capacidad.
- La calidad del codigo no queda capturada por este arnes.

## Requisitos de hardware

- Cajas de referencia utilizadas: GB10 (NVIDIA GB10, clase DGX Spark) con ~119 GiB de memoria unificada; Thor, una estacion de trabajo de doble Xeon de 2013 con 128 GB DDR3 y una RTX 4060 de 16 GB.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo y cuantizacion concretos evaluados, no del repositorio de benchmarks.
- GPU recomendadas: no disponible como recomendacion general; los resultados se midieron en GB10 y en una RTX 4060 de 16 GB.
- Cabe en GPU consumer: si, al menos parcialmente, segun los resultados obtenidos en la RTX 4060 de 16 GB de la caja Thor.
- Opciones de despliegue: `llama-server` (utilizado en el arnes de evaluacion). Otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: la tasa de tokens de salida de extremo a extremo (`Tok/s`) se reporta por fila e incluye prefill e inactividad del bucle de herramientas. Para Muse-Glimmer-30B UD-Q4_K_XL es de 9,3 Tok/s. El resto de valores por fila no estan disponibles en la informacion proporcionada. La duracion tipica de una ejecucion completa de 42 tareas en GB10 es de ~2 horas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, por lo que no procede una comparativa con modelos alternativos de la misma categoria. La informacion proporcionada incluye resultados de varios modelos evaluados (Muse-Glimmer-30B, K2-Horizon-MoVA-36B-A4B, Spark-X2.5-4B BF16, Spark-X2.6-4B, MiniCPM5-2B), pero los datos completos de la tabla estan truncados en la model card y no permiten construir una comparativa fiable mas alla de las filas ya mostradas en la seccion de benchmarks.

## Limitaciones y advertencias

- No es un modelo: el repositorio contiene un informe de resultados, no pesos ni codigo de inferencia. No puede desplegarse ni utilizarse para generar texto.
- Datos incompletos: la model card proporcionada esta truncada en la tabla de resultados, por lo que varias filas y columnas no estan disponibles.
- Varianza alta: siete de las nueve tareas de frontera pueden invertirse entre repeticiones identicas, y la dispersion de tokens dentro de un mismo brazo alcanza dos digitos. Una fila de una sola ejecucion es un punto de datos, no un suelo de ruido.
- Confusion entre void y fallo: las tareas no completadas por timeout o truncamiento se marcan como void y no como fallo. Reportar `39/42` en lugar de `39/39` cuenta erroneamente limites del arnes como fallos del modelo.
- Sensibilidad al presupuesto de tiempo: un modelo mas inteligente pero mas lento podria subir en hardware mas rapido o con un presupuesto mayor. La tabla mide capacidad bajo el presupuesto de tiempo de la GB10, no capacidad en abstracto.
- La calidad del codigo no se evalua: el arnes solo mide tareas de pytest superadas.
- Idiomas: el benchmark esta disenado y etiquetado unicamente en ingles (`en`).
- Licencia: apache-2.0, que permite uso comercial del informe, pero no se aplica a los modelos evaluados, cuyas licencias son las de sus respectivos repositorios.
- Sin garantias de reproducibilidad: el arnes es privado y no se publica, por lo que los resultados no son verificables de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Myric/apex-quant-benchmarks
- Modelo evaluado con puntuacion perfecta (Muse-Glimmer-30B GGUF): https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Modelo evaluado (K2-Horizon-MoVA-36B-A4B APEX GGUF): https://huggingface.co/Myric/K2-Horizon-MoVA-36B-A4B-APEX-GGU (enlace truncado en la informacion proporcionada)
