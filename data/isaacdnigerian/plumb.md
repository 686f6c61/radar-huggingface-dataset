# Isaacdnigerian/plumb

## Resumen

PLUMB es un banco de pruebas (benchmark) para agentes de hoja de calculo, no un modelo de lenguaje generativo. Lo publica el usuario Isaacdnigerian en Hugging Face y se desarrollo para el hackathon Lexsi AI Safety and Alignment, en la pista 1, centrada en respuestas fundamentadas y reduccion de alucinaciones. El repositorio contiene el arnes de evaluacion, el esquema de tareas y las metricas, no pesos de un modelo entrenado.

El problema que aborda es concreto: un agente que opera sobre un libro de calculo puede tanto afirmar cifras que los datos no soportan como escribir en celdas que no le corresponden. PLUMB trata ambas cosas como fallos de fundamentacion y las mide de forma mecanica, sin juez LLM, comprobando si una celda cambio o si un campo de estado dijo `declined`. La evaluacion es de un solo turno con salida estructurada en JSON, con direcciones de celda de entrada y de salida.

No se dispone de informacion sobre arquitectura de modelo, numero de parametros, longitud de contexto ni licencia. La model card describe exclusivamente el diseno del benchmark, las metricas y los scripts que lo acompanan. Cualquier uso como modelo de inferencia queda fuera del alcance de la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un benchmark, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el contenido son scripts Python y ficheros JSONL de tareas) |

## Arquitectura y entrenamiento

PLUMB no entrena un modelo. Es un arnes de evaluacion compuesto por modulos Python: `plumb/sheet.py` para la representacion del libro, serializacion y diff; `plumb/tasks.py` para el esquema de tareas y el contrato de respuesta; y `plumb/score.py` para las cinco metricas. La interfaz con modelos se realiza mediante `scripts/run.py`, que incluye backends stub y Hugging Face.

El diseno opta por salida estructurada de un solo turno en lugar de un bucle de herramientas, con el argumento de que un fallo por perder el hilo de un bucle multiturno se registraria como fallo de fundamentacion y contaminaria la medicion. Las celdas en blanco se omiten de la serializacion para no inducir a leer ausencia como cero, y las escrituras sin efecto no cuentan como colaterales. El conjunto de tareas incluye 12 tareas escritas a mano (cuatro por sonda, con controles), un andamiaje local de 112 tareas pendiente de revision con CuratorKIT y un conjunto candidato de 96 tareas revisadas. La revision docente se realizo con `qwen3:8b` via Ollama, con 96/96 juicios validos en el conjunto bloqueado.

## Capacidades

- Evaluacion mecanica de tres metricas principales: `fabrication_rate` (responder lo que la hoja no soporta), `silent_guess_rate` (elegir una de dos columnas plausibles sin preguntar) y `collateral_write_rate` (escribir fuera del conjunto legitimo de escritura).
- Dos metricas de guarda para evitar que un modelo que rechaza todo obtenga buenas puntuaciones: `over_refusal_rate` y `completion_rate`.
- Metrica de suelo de capacidad `parse_success_rate`, que registra como fallo una respuesta no parseable en lugar de reintentar.
- Metrica separada `format_strict_rate` que distingue si la respuesta fue exactamente un objeto JSON sin marcas de Markdown.
- Parser tolerante con escaneo de llaves equilibrado y consciente de cadenas, que extrae el primer objeto completo sin ocultar el fallo de formato.
- Generacion reproducible de andamiaje de tareas (`scripts/expand_tasks.py`), rediseno de la sonda P2 con cabeceras duplicadas (`scripts/redesign_p2.py`) y validador de equilibrio y esquema previo a la linea base (`scripts/validate_tasks.py`).
- Revision de higiene con CuratorKIT (`scripts/curatorkit_review.py`), con deduplicacion exacta desactivada porque las repeticiones pueden ser controles intencionados.
- Revision docente no Cohere con auditoria de respuestas crudas (`scripts/teacher_review.py`).
- Construccion determinista de pares DPO para la sonda P1 (`scripts/build_p1_pairs.py`).
- Inspeccion de comportamiento mas alla de las puntuaciones agregadas (`scripts/inspect_run.py`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes mas alla del contrato de edicion de celdas descrito.

## Casos de uso

- Evaluacion de agentes de hoja de calculo en produccion: el arnes permite medir si un agente escribe solo en las celdas autorizadas mediante `collateral_write_rate`, lo que resulta adecuado para validar asistentes que modifican libros reales antes de desplegarlos.
- Auditoria de alucinaciones numericas: con `fabrication_rate` se cuantifica con que frecuencia un modelo informa cifras que la hoja no puede producir, util para comparar candidatos en un pipeline de seleccion de modelo.
- Deteccion de ambiguedad no resuelta: `silent_guess_rate` identifica modelos que eligen una columna plausible en lugar de preguntar, un comportamiento relevante en flujos financieros donde la eleccion de columna altera el resultado.
- Control de sobre-rechazo: `over_refusal_rate` y `completion_rate` permiten descartar modelos que evitan errores declinando tareas que la hoja si responde, lo que es util para calibrar el umbral de rechazo antes de publicar un asistente.
- Construccion de datos de preferencia para alineamiento: `scripts/build_p1_pairs.py` genera pares DPO deterministas a partir de la sonda P1, aprovechables para ajustar un modelo hacia respuestas fundamentadas.
- Validacion de calidad de conjuntos de evaluacion: `scripts/validate_tasks.py` exige al menos 80 tareas, las seis categorias de sonda y control, y suficientes tareas de escritura real para distinguir seguridad colateral de inercia sin edicion; aplicable a equipos que construyen sus propios benchmarks internos.
- Verificacion de robustez de formato: `format_strict_rate` y `parse_success_rate` permiten comprobar si un modelo cumple el contrato JSON en una sola pasada, relevante para integrar agentes en pipelines con validacion estricta de esquema.
- Reproducibilidad de evaluaciones: el backend stub y el backend refuser del arnes permiten autoprobar el propio benchmark sin modelo, util para auditar que las metricas fallan como se espera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. La model card describe el conjunto de evaluacion bloqueado (96 tareas equilibradas, 16 por categoria de sonda y control), la revision de higiene con CuratorKIT (96/96 aprobadas) y la revision docente con `qwen3:8b` (96/96 juicios validos), pero no incluye puntuaciones de modelos sobre las metricas de PLUMB.

## Requisitos de hardware

- No aplica VRAM de inferencia para PLUMB en si: el repositorio contiene scripts Python y ficheros JSONL, no pesos de modelo.
- El arnes se ejecuta con Python 3 y no requiere GPU para las pruebas de autocomprobacion (`--model stub` y `--model refuser`).
- Para la revision docente documentada se uso `qwen3:8b` a traves de Ollama; un modelo de 8 mil millones de parametros en cuantizacion de 4 bits requiere del orden de 5 a 6 GB de VRAM, aunque este dato no se especifica en la informacion proporcionada.
- El backend Hugging Face de `scripts/run.py` permite evaluar modelos alojados en Hugging Face; los requisitos de GPU dependen del modelo evaluado, no del benchmark.
- Opciones de despliegue documentadas: ejecucion local con Python y Ollama para la revision docente; no se documentan vLLM, llama.cpp, TGI ni latencias o throughput.

## Comparativa con modelos similares

No disponible. PLUMB es un benchmark de agentes de hoja de calculo y la informacion proporcionada no incluye otros benchmarks comparables ni resultados de modelos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado; no debe interpretarse como un modelo desplegable para inferencia.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial del codigo ni de las tareas.
- El conjunto de 96 tareas es la linea base bloqueada, pero el andamiaje local de 112 tareas sigue pendiente de revision con CuratorKIT y no debe tratarse como linea base.
- La revision docente se realizo con un unico modelo (`qwen3:8b`), no sustituye la revision humana y no cubre sesgos que un revisor humano detectaria.
- La evaluacion es de un solo turno y salida estructurada; no mide el comportamiento de agentes en bucles multiturno ni el uso de herramientas, por lo que los resultados no extrapolan directamente a esos escenarios.
- Las metricas mecanicas evitan el juez LLM, pero dependen de un contrato de respuesta estricto; modelos con formatos alternativos pueden penalizarse en `parse_success_rate` aunque su contenido sea correcto.
- El parser se modifico tras detectar que una respuesta valida duplicada y cercada en Markdown se contabilizaba como JSON invalido y penalizaba las tres metricas de contenido; versiones anteriores del arnes pueden tener ese sesgo.
- No se documentan sesgos linguisticos ni de dominio, ni riesgos de alucinacion del propio benchmark mas alla de los controles descritos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Isaacdnigerian/plumb
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.
