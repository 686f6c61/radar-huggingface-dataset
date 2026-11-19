# dragonlimited/dragon-harness

## Resumen

dragon-harness es una capa de herramientas (tool layer) publicada por el usuario dragonlimited en Hugging Face, diseñada para convertir un modelo de lenguaje local de pequeno tamano en un agente competente en el dominio financiero. No es un modelo de lenguaje en si mismo: es un paquete Python que combina un indice RAG sobre un corpus documental, una base de datos de hechos XBRL de la SEC y un conjunto de funciones de resolucion determinista, expuestas tanto por CLI como por un servidor MCP.

El problema que aborda es la brecha entre la capacidad memoristica de un modelo de 7B y la precision requerida en consultas financieras verificables. Segun la model card, el autor mide esta brecha contra un conjunto propio llamado Dragon-Finance-Eval con 6.802 items verificados: sin ningun modelo en el bucle, la estrategia de seleccion arbitraria acierta un 1,7%, la busqueda lexica un 11,7% y el harness un 99,8%, frente al 100% del oraculo con claves correctas. La tesis del autor es que el harness aporta el rendimiento y el modelo solo aporta el lenguaje.

La relevancia actual reside en su enfoque local-first: no requiere clave de API, no hace peticiones de red en tiempo de inferencia y las herramientas no necesitan GPU. La licencia es Apache-2.0 y el unico idioma declarado es el ingles. No se dispone de informacion sobre arquitectura de modelo, parametros ni contexto, porque el artefacto publicado no es un modelo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es una capa de herramientas en Python) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (paquete Python instalable; sin pesos publicados) |

## Arquitectura y entrenamiento

El artefacto no contiene pesos de modelo ni proceso de entrenamiento documentado. Su arquitectura es la de un harness de recuperacion y resolucion compuesto por tres sustratos: un indice vectorial y de texto completo sobre un corpus documental (LanceDB, configurable mediante `DRAGON_RAG_DIR`), una base de datos de hechos XBRL de la SEC en DuckDB (`DRAGON_FACTS_DB`) y una capa de resolucion determinista implementada en el modulo `dragon_harness.resolve`. El modelo de embeddings por defecto es `BAAI/bge-small-en-v1.5`, ejecutable en CPU (`DRAGON_DEVICE=cpu`) o en CUDA.

El diseno separa dos herramientas no intercambiables: `search_knowledge` opera sobre el corpus troceado (vectorial mas texto completo) para contenido narrativo como factores de riesgo, MD&A, notas al pie o politicas; `query_financials` opera sobre XBRL (`num`/`sub`) para cualquier cifra reportada. La innovacion tecnica destacable es que `query_financials` devuelve el conjunto de candidatos en lugar de exigir al modelo que nombre una etiqueta: un filing y periodo exponen una mediana de 43 etiquetas candidatas (maximo 132), y la funcion `resolve()` realiza la eleccion de forma determinista. La model card documenta dos decisiones de ingenieria: una conexion DuckDB por llamada, siempre cerrada, para evitar bloqueos del proceso ante timeouts, y prioridades de etiquetas ordenadas (por ejemplo `Revenues` antes que `RevenueFromContractWithCustomerExcludingAssessedTax`), lo que elevo la aritmetica de beneficio bruto del 90,1% al 100%. El autor estima en aproximadamente un 0,2% el error irreducible debido a filings con etiquetas de ingresos casi sinonimas sin senal discriminante en la pregunta.

## Capacidades

- Recuperacion de conocimiento narrativo sobre corpus financiero mediante busqueda hibrida (vectorial y texto completo) con `search_knowledge`.
- Consulta de cifras reportadas en XBRL de la SEC mediante `query_financials`, devolviendo el conjunto de etiquetas candidatas de un filing y periodo.
- Resolucion determinista de preguntas aritmeticas y de identificacion de etiquetas mediante `resolve()` y `resolve_question_tool`.
- Enumeracion de etiquetas candidatas por accession number, fecha de documento y numero de trimestres (`candidate_tags`).
- Localizacion de filings por nombre de compania (`dragon filer`).
- Exposicion de cinco funciones como herramientas MCP (`search_knowledge_tool`, `query_financials_tool`, `resolve_filer_tool`, `candidate_tags_tool`, `resolve_question_tool`) para cualquier harness compatible con Model Context Protocol.
- Uso como biblioteca Python con API directa (`search_knowledge`, `query_financials`, `candidate_tags`, `resolve`).
- Operacion completamente local sin clave de API ni red en inferencia; las herramientas no requieren GPU.
- Cobertura de familias de tarea declaradas: `fact_lookup` (99,8%), `arithmetic` (100%), `period_trap` (100%) y `unit_trap` (100%).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas fuera del dominio financiero, vision ni audio.

## Casos de uso

- Extraccion de cifras reportadas en produccion: un pipeline que recibe una pregunta sobre una magnitud concreta de un filing 10-Q o 10-K llama a `query_financials` para obtener el conjunto de candidatos y a `resolve()` para seleccionar el valor, con salida estructurada como `{"value": 3891.0, "method": "formula:gross_profit"}`. Es adecuado porque la seleccion es determinista y verificable, no generativa.
- Agente financiero local sobre modelo pequeno: un modelo de 7B conectado por MCP al harness puede responder preguntas de hechos sin memorizar el dominio, delegando la precision en las herramientas. Encaja en entornos con requisitos de privacidad o sin conectividad.
- Analisis de factores de riesgo y MD&A: `search_knowledge` recupera fragmentos narrativos de notas al pie, politicas contables y secciones de discusion y analisis para su posterior resumen o citacion.
- Verificacion de calculos derivados: el metodo `formula:gross_profit` permite reconstruir magnitudes calculadas a partir de cifras reportadas, util en controles de calidad de datos financieros.
- Auditoria de cobertura de etiquetas XBRL: `candidate_tags` expone la mediana de 43 etiquetas (maximo 132) por filing y periodo, lo que sirve para diagnosticar filings con terminologia ambigua o poco comun.
- Integracion en asistentes de escritorio: el servidor MCP en stdio (`python -m dragon_harness.mcp_server`) permite conectar las cinco funciones a clientes como Claude Desktop u OpenCode sin desarrollo adicional.
- Automatizacion de extraccion por lotes: la CLI (`dragon facts`, `dragon resolve`) permite procesar filings por nombre de compania, formulario, fecha y trimestres en scripts de shell.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Dragon-Finance-Eval (6.802 items verificados), medidos sin modelo en el bucle:

| Estrategia | Precision |
|---|---:|
| Seleccion de un candidato arbitrario | 1,7% |
| Busqueda lexica | 11,7% |
| dragon-harness | 99,8% |
| Oraculo (claves de verdad) | 100,0% |

Desglose por familia de tarea:

| Familia | Precision |
|---|---:|
| fact_lookup | 99,8% |
| arithmetic | 100% |
| period_trap | 100% |
| unit_trap | 100% |
| Large-cap split | 100% (1.303/1.303) |

La model card afirma que un LLM responde estas mismas preguntas en modalidad closed-book con aproximadamente un 0% de acierto, pero no se aportan resultados por modelo ni comparativas con sistemas alternativos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Las herramientas no requieren GPU; `DRAGON_DEVICE` por defecto es `cpu`, con opcion `cuda`.
- VRAM estimada: no disponible para el harness; el unico componente con modelo es el embedder `BAAI/bge-small-en-v1.5`, que puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; el autor solo contempla CPU o CUDA como opcion de dispositivo para el embedder.
- Cabe en cualquier maquina capaz de ejecutar Python y alojar el indice LanceDB y la base DuckDB; no se publican requisitos de disco ni de memoria.
- Opciones de despliegue: instalacion via pip desde el repositorio de Hugging Face (`pip install "dragon-harness[mcp] @ git+..."`), CLI `dragon`, servidor MCP en stdio y biblioteca Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. dragon-harness no es un modelo de lenguaje y la informacion proporcionada no incluye comparaciones con otros harness de recuperacion financiera, frameworks de agentes ni sistemas de consulta XBRL. Tampoco se aportan resultados de modelos competidores sobre Dragon-Finance-Eval.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona por si mismo; requiere un modelo externo que formule las llamadas a las herramientas.
- Depende de un indice RAG y de una base de hechos que no se distribuyen con el paquete: las rutas por defecto (`/home/marimo/dragon_rag`, `/home/marimo/dragon_fsds/facts.duckdb`) apuntan a un entorno concreto del autor y deben reconfigurarse.
- El benchmark Dragon-Finance-Eval es propio del autor y no se ha validado de forma independiente segun la informacion disponible.
- El autor reconoce un error irreducible de aproximadamente el 0,2% en filings con etiquetas de ingresos casi sinonimas y sin senal discriminante en la pregunta.
- Cobertura limitada al dominio de la SEC estadounidense (XBRL y filings) y al idioma ingles; no se declaran otros idiomas ni otras jurisdicciones regulatorias.
- La atribucion de datos es por fuente y remite al `ATTRIBUTION.md` del corpus, que no se incluye en la informacion disponible; conviene revisar las condiciones de cada fuente antes de uso comercial.
- Licencia Apache-2.0 para el codigo, sin restricciones comerciales declaradas, pero el uso en produccion exige verificar la licencia de los datos subyacentes.
- Riesgo de alucinacion: no aplica al harness en si, pero si al modelo que lo orquesta si ignora o malinterpreta la salida de las herramientas; el diseno mitiga esto devolviendo valores y metodos verificables.
- Sin descargas ni likes en el momento de la consulta y creado en noviembre de 2026; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/dragonlimited/dragon-harness
- Modelo de embeddings por defecto: https://huggingface.co/BAAI/bge-small-en-v1.5
