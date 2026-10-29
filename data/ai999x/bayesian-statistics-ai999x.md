# AI999X/bayesian-statistics-ai999x

## Resumen

bayesian-statistics-ai999x es un motor determinista de estadística bayesiana para Python, desarrollado por Ibnul Jaif Farabi bajo la organización AI999X. No es un modelo de lenguaje generativo: se trata de un solucionador neuro-simbólico en el que una capa de lectura basada en reglas interpreta la pregunta en inglés y la dirige a una de sus 78 capacidades simbólicas certificadas (teorema de Bayes, posteriores conjugados, intervalos de credibilidad, factores de Bayes, análisis de decisión, propagación de incertidumbre, Monte Carlo y análisis de sensibilidad). Cada respuesta se calcula, se verifica (por sustitución, comprobación dimensional o cálculo independiente) y se devuelve junto con pasos, fórmulas en LaTeX, unidades y supuestos; si no puede verificarla, emite un rechazo explícito.

Su relevancia práctica está en el nicho de aplicaciones que necesitan aritmética estadística auditable sin conexión: docencia, corrección automática de ejercicios y pipelines que no pueden permitirse una alucinación. El autor declara siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y afirma que las 378 respuestas documentadas se reproducen de forma idéntica en Windows y Linux con Python 3.10 a 3.14. El paquete se distribuye como wheel puro de Python (sympy, mpmath), funciona solo en CPU y no requiere GPU, red ni clave de API.

Conviene señalar una discrepancia relevante antes de evaluarlo: la model card lo describe como Python puro, mientras que el repositorio de HuggingFace declara 4.715.520 parámetros en safetensors y etiquetas onnx y safetensors. La model card también marca `inference: false`, por lo que el widget de inferencia de HuggingFace no está operativo. El modelo está en versión 1.0.3, con licencia Apache-2.0, solo inglés y 35 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de la pregunta basada en reglas más 78 capacidades simbólicas certificadas (no es un transformer generativo) |
| Parametros totales | 4.715.520 (según safetensors del repositorio); la model card describe el paquete como Python puro, sin detallar a qué corresponden esos pesos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica, la entrada se limita a formas de pregunta documentadas y a llamadas tipadas |
| Tipos de cuantizacion | No disponible; no aplica al runtime declarado (CPU, sympy y mpmath) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (etiquetas del repositorio); distribución principal como wheel de Python `bayesian_statistics_ai999x-1.0.3-py3-none-any.whl` |
| Tarea (pipeline) | question-answering (etiquetas adicionales: sentence-similarity, feature-extraction) |
| Versión | 1.0.3 (knowledge pack 1.0.1) |
| Capacidades certificadas | 78 procedimientos |
| Respuestas doradas | 378 respuestas documentadas |
| Runtime | Solo CPU, offline; sin GPU, sin red, sin clave de API |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Dependencias declaradas | sympy, mpmath |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 35 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-28 |
| Autor / organización | Ibnul Jaif Farabi / AI999X |

## Arquitectura y entrenamiento

La arquitectura declarada es un motor determinista híbrido: una capa de comprensión de lenguaje basada en reglas que reconoce formas de pregunta documentadas y extrae sus parámetros, acoplada a un conjunto de 78 rutinas simbólicas certificadas que realizan el cálculo exacto con sympy y mpmath. No hay evidencia en la información disponible de un transformer, de pesos de atención ni de un proceso de entrenamiento con descenso de gradiente; el autor no publica corpus, número de tokens, composición del dataset ni fases de RLHF o DPO.

El mecanismo de garantía es la verificación posterior al cálculo: cada resultado se sustituye de vuelta en la fórmula, se comprueba dimensionalmente o se contrasta con un cálculo independiente antes de devolverse. La interfaz expone dos vías, `ask()` para preguntas en inglés documentado y `solve(capability_id, **inputs)` para llamadas tipadas garantizadas, y cada salida incluye pasos, LaTeX, unidades y supuestos. El paquete declara ejecución offline sobre CPU con resultados idénticos entre plataformas, lo que sugiere aritmética de precisión arbitraria en lugar de inferencia neuronal; no se documenta ninguna innovación de decodificación, atención lineal ni atención especulativa.

## Capacidades

- Resolución de problemas de estadística bayesiana con pasos intermedios, fórmulas en LaTeX, unidades y supuestos explícitos.
- Teorema de Bayes y cálculo de valores predictivos en pruebas diagnósticas (PPV, NPV, tasa de falsos descubrimientos, probabilidad de positivo).
- Posteriores conjugados, con salida de media, parámetros y distribución posterior (por ejemplo, beta-binomial).
- Intervalos de credibilidad y factores de Bayes para comparación de modelos o prioris.
- Análisis de decisión y análisis de sensibilidad, incluidos índices de Sobol.
- Propagación de incertidumbre y estimación por Monte Carlo.
- Dos modos de invocación: `ask()` sobre lenguaje natural documentado y `solve(capability_id, **inputs)` con entradas tipadas.
- Rechazo explícito en lugar de respuesta aproximada, con siete estados de salida diferenciados.
- Integración como herramienta determinista dentro de pipelines o de agentes: el LLM redacta, el solver calcula.
- No soporta tool calling nativo, ni agentes autónomos, ni razonamiento multi-paso abierto, ni visión, audio o modo de pensamiento; tampoco generación de texto libre.

## Casos de uso

- Corrección automática de ejercicios de estadística bayesiana: el motor recibe el enunciado en una de las formas documentadas y devuelve el resultado con pasos, lo que permite a una plataforma educativa comparar la respuesta del alumno con una referencia verificada y mostrar la fórmula en LaTeX.
- Docencia y material didáctico de tests diagnósticos: a partir de sensibilidad, especificidad y prevalencia se obtienen PPV, NPV y tasa de falsos positivos, útiles para ilustrar la paradoja del falso positivo en clase de bioestadística sin depender de una calculadora manual.
- Corrección de guiones clínicos o de laboratorio en prototipos: cálculo reproducible de valores predictivos para validar hojas de cálculo o informes internos antes de publicarlos.
- Análisis de sensibilidad en ingeniería y modelos de riesgo: cálculo de índices de Sobol y propagación de incertidumbre sobre modelos paramétricos, con resultado determinista y auditable para anexos técnicos.
- Comparación de prioris en revisión de literatura o meta-análisis: factores de Bayes y posteriores conjugados calculados de forma explícita para documentar la elección de priori en una sección de métodos.
- Test de regresión numérica en CI/CD: al ser determinista y reproducible entre plataformas, el solver puede fijar valores esperados en tests de una librería estadística y fallar cuando un cambio altera un resultado.
- Entornos air-gapped o de cumplimiento estricto: sustituye a una API externa en flujos donde no se permite salida a red, ya que corre offline en CPU sin clave de API.
- Herramienta de apoyo a un LLM: el modelo de lenguaje interpreta la pregunta libre y llama a `solve()`; el solver aporta el número verificado y el LLM solo redacta la explicación, reduciendo el riesgo de cifras inventadas.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index; ninguna de las métricas está marcada como verificada de forma independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor | Nota del autor |
|---|---|---|---|---|
| Question answering (bayesian statistics) | Golden answers, 378 preguntas documentadas, Windows y Linux con Python 3.10-3.14 | accuracy | 1,000 | "identical on every platform" |
| Question answering (bayesian statistics) | Capability search, 12.998 preguntas verificadas reservadas de todos los modelos AI999X | recall@1 | 0,918 | "right capability first" |
| Question answering (bayesian statistics) | Capability search, 12.998 preguntas verificadas reservadas de todos los modelos AI999X | recall@5 | 0,988 | "in the top five" |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de modelos de lenguaje en la información disponible, y en todo caso no serían aplicables a un motor simbólico de dominio cerrado. Tampoco se publican latencias ni throughput.

## Requisitos de hardware

- VRAM: no aplica; el runtime declarado es solo CPU y no requiere GPU.
- RAM: no se especifica cifra; el repositorio ocupa 0,1 GB y las dependencias son sympy y mpmath, por lo que el consumo esperado es modesto, pero no hay dato oficial.
- GPU recomendadas: ninguna. El autor indica explícitamente que no hace falta GPU.
- Compatibilidad con GPU de consumo: irrelevante, funciona en cualquier CPU con Python 3.10, 3.11, 3.12, 3.13 o 3.14.
- Plataformas verificadas: Windows con Python 3.13 y Linux x86-64 con Python 3.10 a 3.14.
- Opciones de despliegue: `pip install bayesian-statistics-ai999x`, instalación directa del wheel desde el repositorio de HuggingFace, o empaquetado en una imagen de contenedor. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de pesos en el sentido habitual.
- Latencia y throughput: no disponibles. La naturaleza determinista y simbólica implica tiempos dependientes del problema, no del tamaño del lote.
- Almacenamiento: 0,1 GB de repositorio más el entorno de Python.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| bayesian-statistics-ai999x | Motor simbólico determinista de dominio cerrado | 4.715.520 declarados en safetensors (no aplica al runtime Python) | No aplica | Apache-2.0 | Solo inglés, 78 capacidades, salida con pasos y rechazo explícito |
| SymPy | Librería de matemática simbólica | No disponible | No aplica | BSD-3-Clause (según el proyecto) | Requiere que el desarrollador formule el problema en su API; no interpreta lenguaje natural ni incluye flujos bayesianos preconfigurados |
| Wolfram Alpha / Wolfram Language | Servicio y lenguaje de cálculo simbólico | No disponible | No aplica | Propietaria | Cobertura matemática mucho mayor, pero dependencia de servicio externo y sin ejecución offline gratuita |
| Modelos de lenguaje de propósito general (API) | Transformer generativo | No disponible | No disponible | Propietaria | Pueden explicar estadística bayesiana en inglés libre, pero no garantizan exactitud numérica ni determinismo entre plataformas |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible: el autor solo publica métricas internas sobre sus propios conjuntos de evaluación, sin comparación cruzada con otras herramientas.

## Limitaciones y advertencias

- Dominio cerrado: cubre únicamente estadística bayesiana dentro de 78 capacidades certificadas; cualquier cuestión fuera de ese alcance devuelve OUT_OF_SCOPE.
- Idioma único: solo inglés. No hay soporte declarado de castellano ni de otras lenguas, ni siquiera para las formas de pregunta de `ask()`.
- No genera texto libre: no es un modelo conversacional y no puede redactar explicaciones largas, resumir documentos ni mantener un diálogo multi-turno.
- Cobertura de entrada limitada: `ask()` solo reconoce formas de pregunta documentadas; el resto requiere la interfaz tipada `solve()`, lo que traslada el trabajo de formateo al desarrollador.
- Métricas no verificadas: los tres resultados del model-index figuran con `verified: false` y proceden de conjuntos de evaluación propios (`ai999x-evaluation`), sin validación externa ni comparación con terceros.
- Discrepancia de artefactos: la model card describe Python puro, pero el repositorio declara 4.715.520 parámetros en safetensors y etiquetas ONNX; conviene auditar qué contienen esos ficheros antes de integrarlos en un entorno regulado.
- Inferencia desactivada en HuggingFace: `inference: false`, por lo que no se puede probar desde el widget del repositorio; hay que instalar el paquete.
- Adopción muy baja: 35 descargas y 0 likes en el momento de la consulta, sin comunidad ni issues públicos documentados, lo que reduce la probabilidad de que los fallos estén ya detectados por terceros.
- Riesgo de alucinación bajo por diseño, pero no nulo en la fase de interpretación: si la capa de reglas malinterpreta una pregunta en lenguaje natural y la mapea a una capacidad válida, la aritmética será correcta y el resultado irrelevante. El estado AMBIGUOUS mitiga, no elimina, este riesgo.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no hay cláusulas de uso restringido declaradas, pero tampoco garantías ni soporte del autor.
- Autor único y mantenimiento unipersonal: la versión 1.0.3 y el knowledge pack 1.0.1 sugieren un proyecto joven; conviene fijar la versión en producción y planificar sustituto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/bayesian-statistics-ai999x
- Paquete en PyPI: https://pypi.org/project/bayesian-statistics-ai999x/
- Guía de capacidades (carpeta docs del repositorio): https://huggingface.co/AI999X/bayesian-statistics-ai999x/tree/main/docs
- Material de evaluación: https://huggingface.co/AI999X/bayesian-statistics-ai999x/tree/main/evaluation
- Licencia: https://huggingface.co/AI999X/bayesian-statistics-ai999x/blob/main/LICENSE
- Wheel de instalación directa: https://huggingface.co/AI999X/bayesian-statistics-ai999x/resolve/main/dist/bayesian_statistics_ai999x-1.0.3-py3-none-any.whl
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del proyecto: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Paper, blog técnico o demo interactiva: no disponibles en la información proporcionada.
