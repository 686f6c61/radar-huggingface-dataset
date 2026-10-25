# AI999X/electrical-engineering-ai999x

## Resumen

electrical-engineering-ai999x es un motor de resolución de problemas de ingeniería eléctrica para Python, desarrollado por Ibnul Jaif Farabi bajo la organización AI999X. No es un transformer generativo al uso: la model card lo describe como un motor determinista neuro-simbólico que combina una capa de lectura de preguntas en inglés basada en reglas con 64 procedimientos simbólicos certificados (sympy, mpmath). Cada respuesta se calcula, se comprueba por sustitución, análisis dimensional o cálculo independiente, y se devuelve junto con sus pasos, fórmulas en LaTeX, unidades y supuestos.

El modelo resuelve el problema clásico de los LLM en dominios técnicos: la alucinación en cálculos verificables. En lugar de generar texto plausible, devuelve uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y prefiere rechazar antes que adivinar. Cubre circuitos de continua y alterna, transitorios, fasores y potencia, amplificadores operacionales, diodos y transistores, lógica digital y sistemas de control (funciones de transferencia, estabilidad, Bode).

Con 4.715.520 parámetros declarados en safetensors y un repositorio de 0,0 GB, el paquete se distribuye como wheel Python puro y se ejecuta íntegramente en CPU, sin GPU, sin red y sin clave de API. Es relevante ahora por su propuesta de "cero respuestas incorrectas" en un nicho donde los modelos generalistas fallan con frecuencia, y por su encaje en entornos air-gapped y aplicaciones educativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor determinista neuro-simbólico: lectura de preguntas basada en reglas + 64 capacidades simbólicas certificadas (no se documenta una arquitectura transformer) |
| Parametros totales | 4.715.520 (≈4,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la interfaz es `ask()` sobre formas de pregunta documentadas y `solve(capability_id, **inputs)`, no una ventana de contexto) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos en safetensors y ONNX, sin cuantizaciones documentadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución principal como wheel de Python (`electrical_engineering_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La model card no describe un entrenamiento neuronal convencional ni un corpus de tokens. El sistema se presenta como un motor híbrido: una capa de lectura que interpreta formas de pregunta documentadas en inglés (o una llamada tipada con `solve()`), un selector que elige una de las 64 capacidades certificadas y un ejecutor simbólico construido sobre sympy y mpmath. El resultado pasa por una verificación obligatoria —sustitución inversa, comprobación dimensional o contraste con un cálculo independiente— antes de devolverlo.

La validación se apoya en un "knowledge pack" versionado 1.0.0 y en 326 respuestas doradas documentadas, que según el autor se reproducen de forma idéntica en Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13 y 3.14). No se especifican datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO. La innovación destacable es el diseño de siete resultados explícitos y el rechazo controlado como mecanismo antialucinación dentro del alcance certificado.

## Capacidades

- Resolución de problemas de ingeniería eléctrica en inglés con pasos, fórmulas en LaTeX, unidades, supuestos y el modelo empleado.
- 64 procedimientos certificados: equivalentes de Thévenin, análisis de circuitos DC y AC, transitorios, fasores, potencia y corrección del factor de potencia, sistemas trifásicos, amplificadores operacionales, diodos y transistores, mapas de Karnaugh y minimización de funciones lógicas, diagramas de Bode, márgenes de ganancia y fase, y criterio de Routh-Hurwitz.
- Interfaz de doble vía: `ask()` para preguntas en lenguaje natural documentado y `solve(capability_id, **inputs)` para invocación tipada garantizada.
- Salida autoexplicativa apta para cuadernos, aplicaciones de tutoría y correctores de ejercicios.
- Siete estados de resultado explícitos, con rechazo honesto cuando faltan datos o la pregunta queda fuera de alcance.
- Tareas declaradas en los metadatos: question answering, token classification, text classification, sentence similarity y feature extraction (sin detalle de implementación en la model card).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso abierto: no documentado; el "multi-paso" se limita a la descomposición interna de cada capacidad.
- Capacidades multilingües: no, solo inglés.
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.

## Casos de uso

- Corrección automática de tareas de ingeniería eléctrica: el motor evalúa el enunciado, ejecuta la capacidad correspondiente y devuelve la solución verificada con pasos, lo que permite comparar contra la respuesta del estudiante sin riesgo de soluciones inventadas.
- Tutoría paso a paso en aplicaciones educativas: `ask()` devuelve fórmulas en LaTeX, unidades y supuestos, material directamente renderizable en un notebook o en una interfaz web de docencia.
- Verificación de cálculos en flujos de diseño: comprobación de equivalentes de Thévenin, márgenes de ganancia o estabilidad de Routh-Hurwitz dentro de un pipeline de CI, con resultado determinista y reproducible entre plataformas.
- Generación de bancos de ejercicios con solución certificada: a partir de las 64 capacidades se pueden construir problemas de circuitos, lógica digital y control con respuesta dorada adjunta.
- Entornos air-gapped o sin conectividad: al no requerir red ni clave de API, encaja en laboratorios docentes, aulas con equipos aislados y sistemas empotrados de apoyo.
- Tests de regresión entre plataformas: las 326 respuestas doradas sirven como suite de verificación para garantizar que una instalación en Windows y otra en Linux producen exactamente la misma salida.
- Preprocesado de ejercicios de lógica digital: simplificación de funciones booleanas por minterms a suma de productos (`minterms_to_sop`), útil en herramientas de generación automática de enunciados.
- Cálculo de compensación de reactiva: corrección del factor de potencia a partir de carga, tensión y frecuencia, con resultado y procedimiento listos para incorporar a una memoria técnica.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingeniería eléctrica | Golden answers (326 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1,0 | No (`verified: false`, dato declarado por el autor) |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares). El valor 1,0 corresponde a un conjunto cerrado de 326 preguntas doradas definido por el propio autor, no a un benchmark independiente de terceros.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar Python 3.10-3.14 es suficiente.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,0 GB según HuggingFace y el paquete es Python puro con dependencias sympy y mpmath.
- Opciones de despliegue: `pip install electrical-engineering-ai999x` desde PyPI, o instalación directa del wheel alojado en el repositorio de HuggingFace. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo con pesos transformer.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo declara ejecución offline en CPU y resultados idénticos entre plataformas.
- Plataformas verificadas: Windows con Python 3.13 y Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| electrical-engineering-ai999x | Motor determinista neuro-simbólico | 4,7 M (declarados en safetensors) | No disponible | Apache-2.0 | Accuracy 1,0 en 326 preguntas doradas (declarado por el autor) |
| Alternativas comparables | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de modelos alternativos de la misma categoría (resolutores de ingeniería eléctrica o solvers simbólicos empaquetados para Python), por lo que no es posible establecer una comparación numérica rigurosa. Cualitativamente, la propuesta se diferencia de un LLM generalista en que no genera texto libre: sustituye la generación por ejecución simbólica verificada y rechazo explícito, a cambio de cubrir únicamente el dominio y las 64 capacidades certificadas y de operar solo en inglés.

## Limitaciones y advertencias

- Cobertura cerrada: solo responde dentro de las 64 capacidades certificadas y las formas de pregunta documentadas; cualquier cuestión fuera de ese alcance devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- Idioma único: la interfaz de lectura de preguntas está diseñada para inglés; no hay soporte documentado de castellano ni de otras lenguas.
- El benchmark de accuracy 1,0 es autodeclarado (`verified: false`) y se mide sobre un conjunto dorado definido por el propio autor, por lo que no equivale a una evaluación independiente ni descarta sobreajuste al conjunto de 326 preguntas.
- "Zero hallucination" es una afirmación de la model card válida únicamente dentro del alcance certificado; no debe extrapolarse a preguntas abiertas ni a dominios no cubiertos.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no admite contexto largo; tampoco se documenta soporte de tool calling ni de agentes.
- No se documentan sesgos demográficos ni lingüísticos; el riesgo principal es de alcance (problemas mal interpretados que acaben en AMBIGUOUS) más que de sesgo estadístico.
- Adopción comunitaria nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación externa y de casos de uso reportados por terceros.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; conviene revisar el fichero LICENSE del repositorio antes de integrarlo en un producto.
- El metadato de la model card declara `inference: false` pese a que el paquete se presenta como ejecutable; conviene validar el comportamiento en el entorno de producción propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/electrical-engineering-ai999x
- Paquete en PyPI: https://pypi.org/project/electrical-engineering-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/electrical-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/electrical-engineering-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
