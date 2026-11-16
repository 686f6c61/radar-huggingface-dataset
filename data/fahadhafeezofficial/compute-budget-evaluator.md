# fahadhafeezofficial/compute-budget-evaluator

## Resumen

Compute Budget Evaluator es un artefacto de evaluacion publicado por Fahad Hafeez bajo el identificador `fahadhafeezofficial/compute-budget-evaluator`. No es un modelo de lenguaje entrenado, sino una herramienta de consulta que responde a la pregunta "cuanto computo de inferencia conviene gastar en esta peticion" a partir de puntos de coste-rendimiento medidos empiricamente. Se distribuye como un paquete Python con una tabla JSON (`routing_table.json`) y un modulo (`router.py`) que implementa la clase `ComputeBudgetRouter`, con soporte de interpolacion y marcado explicito de extrapolacion.

El artefacto se enmarca en el proyecto Test-Time Compute Bench y esta etiquetado con `ttcbench-router`, `test-time-compute`, `cost-performance`, `routing`, `inference-scaling` y `evaluation`. Su proposito es servir de ayuda a la decision transparente: dado un presupuesto de tokens y una familia de tareas (con nivel de dificultad opcional), devuelve la precision medida a ese presupuesto, un intervalo de confianza bootstrap al 95% y la ganancia marginal local por cada 1.000 tokens adicionales. Alternativamente, dada una precision objetivo, devuelve el nivel de presupuesto medido mas barato que la alcanzo.

Es relevante ahora porque el escalado en tiempo de inferencia (test-time compute) se ha convertido en una palanca de coste real en produccion, y la mayoria de las decisiones de presupuesto se toman sin datos medidos. Este artefacto aporta una superficie de medicion acotada y honesta sobre sus limites: el autor declara explicitamente que no es un router entrenado, que no debe usarse para enrutamiento en produccion y que solo es valido para el checkpoint concreto sobre el que se midio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: artefacto de evaluacion (tabla de consulta JSON + modulo Python), no es una red neuronal |
| Parametros totales | No disponible (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica; rango de tokens medido: 48 a 160 tokens de finalizacion |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | No aplica; ficheros `routing_table.json`, `router.py`, `example.py`, `requirements.txt` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento en el sentido habitual. El artefacto consta de dos operaciones que son busquedas e interpolaciones sobre mediciones, no funciones aprendidas. La tabla `routing_table.json` sigue un esquema versionado (`schema_version: "1.0.0"`) con un campo `model_checkpoint` que registra el checkpoint sobre el que se midio, un `measured_token_range` de 48 a 160 tokens, y una jerarquia de familias de tareas (`arithmetic`, `code_reasoning`, entre otras) con curvas agregadas (`all`), desagregadas por dificultad (`by_difficulty` con niveles 1, 3 y 5) y politicas de decodificacion (`policies`, con `config_id`, `accuracy` y `tokens_per_correct`).

Cada punto medido incluye `tokens`, `accuracy` verificada, `ci_lo` y `ci_hi` (intervalo bootstrap al 95% sobre tareas) y `n` (numero de tareas). La interpolacion entre los tres niveles de presupuesto es lineal a trozos por construccion, no una ley de escalado ajustada. El autor justifica explicitamente no haber entrenado un router: hacerlo requeriria evaluar la politica de enrutamiento en datos retenidos que el ajuste no haya visto, y el piloto es demasiado pequeno (pocas tareas por familia, un solo checkpoint, una sola configuracion de hardware). Por eso se entrega la superficie medida mas un contrato de validez: fuera del rango medido se marca `extrapolated: true` con aviso; una familia o nivel no medido cae a una curva mas gruesa indicando `curve_source`; y un checkpoint distinto invalida la tabla, porque la precision a un presupuesto dado es propiedad de la tupla (modelo, familia de tareas, plantilla de prompt), no del presupuesto solo.

## Capacidades

- Evaluacion de presupuesto: dada una familia de tareas, dificultad opcional y presupuesto de tokens, devuelve la precision medida, su intervalo y la ganancia marginal por 1.000 tokens adicionales.
- Busqueda de objetivo: dada una precision objetivo, devuelve el nivel de presupuesto medido mas barato que la alcanzo.
- Marcado de extrapolacion: cualquier consulta fuera del rango medido (48-160 tokens) devuelve `extrapolated: true` con advertencia.
- Fallback explicito: si la familia o el nivel de dificultad no se midio, cae a una curva mas gruesa e informa de la fuente usada (`curve_source`).
- Comparacion de politicas a igual gasto de tokens mediante `tokens_per_correct` (tokens totales de finalizacion divididos por respuestas verificadas correctas).
- Deteccion de rendimientos negativos: una `marginal_gain_per_1k_tokens` negativa indica que el computo adicional empeoraba la respuesta y encarecia la factura.
- Sin dependencias externas: solo requiere la biblioteca estandar de Python.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso: es una herramienta de consulta de datos.

## Casos de uso

- Decidir si un presupuesto propuesto cae dentro del rango donde existe medicion: antes de fijar un limite de tokens en un pipeline, se consulta la tabla para saber si 120 tokens esta medido o si la recomendacion seria extrapolada.
- Comparar politicas de decodificacion a igual gasto: usando `tokens_per_correct` de `policies`, se elige la configuracion que minimiza tokens por respuesta correcta cuando el coste pesa mas que la precision bruta.
- Docencia de evaluacion consciente del coste: el artefacto sirve como ejemplo reproducible de como presentar intervalos bootstrap, rangos medidos y banderas de extrapolacion en lugar de un optimo inventado.
- Auditoria de decisiones de presupuesto: registrar la consulta y la respuesta (`curve_source`, `extrapolated`) documenta por que se eligio un nivel de computo concreto.
- Establecer un suelo de gasto: la operacion "meet a target" devuelve el nivel medido mas barato que alcanza una precision objetivo, evitando sobregastar por encima del primer nivel que cumple.
- Detectar saturacion de computo: consultar la ganancia marginal por 1.000 tokens permite identificar el punto a partir del cual mas tokens no mejoran la respuesta en una familia dada.
- Validacion de supuestos antes de construir un router propio: el contrato de validez del artefacto (checkpoint, plantilla de prompt, rango medido) sirve de plantilla para definir que datos habria que recoger antes de ajustar una politica de enrutamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido de MMLU, HumanEval o GSM8K. La tabla de mediciones del artefacto incluye puntos de precision por presupuesto; como ejemplo de estructura, la familia `arithmetic` en el nivel agregado registra un punto a 48 tokens con `accuracy: 0.33`, `ci_lo: 0.0`, `ci_hi: 0.71` y `n: 3`. Estos valores corresponden a la tabla de ejemplo de la model card y no constituyen un benchmark comparativo entre modelos.

## Requisitos de hardware

- VRAM: no aplica; el artefacto no ejecuta inferencia de red neuronal.
- GPU: no requiere GPU; se ejecuta en CPU.
- GPU de consumo: irrelevante, no hay pesos que cargar.
- Despliegue: importacion directa del modulo `router.py` en Python con la biblioteca estandar; `ComputeBudgetRouter.from_pretrained(".")` carga la tabla local. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser busquedas e interpolaciones sobre una tabla JSON pequena, la latencia esperada es de microsegundos a milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de la misma categoria (tablas de coste-rendimiento medidas para escalado en tiempo de inferencia) con los que establecer una comparacion de parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Un solo checkpoint, una sola configuracion de hardware y una muestra de tareas pequena (3 tareas por familia en el ejemplo agregado).
- La interpolacion entre tres niveles de presupuesto es lineal a trozos por construccion, no una ley de escalado ajustada.
- No hay modelo de caracteristicas de tarea: `domain` y `difficulty` son las unicas variables de condicionamiento; predecir la dificultad a partir de un prompt es un problema aparte que el artefacto no resuelve.
- La tabla solo es valida para el checkpoint registrado en `model_checkpoint`; usarla con otro modelo produce recomendaciones invalidas.
- No apto para enrutamiento en produccion ni para decisiones donde una asignacion incorrecta de presupuesto tenga consecuencias.
- Los intervalos de confianza son amplios por el tamano muestral; la API prefiere "nivel medido mas barato" frente a un optimo ajustado.
- La calibracion y la confianza se reportan en el dataset companero, no en este artefacto.
- Idioma: solo ingles.
- Licencia MIT: permite uso comercial y modificacion, pero el autor desaconseja explicitamente el uso en produccion para enrutamiento; conviene respetar ese aviso aunque la licencia no lo impida legalmente.

## Enlaces

- Hugging Face: https://huggingface.co/fahadhafeezofficial/compute-budget-evaluator
- Cita del autor (BibTeX en la model card): `ttcbench_eval2026`, Hafeez, Fahad, 2026, "Compute Budget Evaluator: measured cost-performance for inference-time compute"
- Repositorio, paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
