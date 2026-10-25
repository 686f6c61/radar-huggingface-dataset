# AI999X/materials-science-ai999x

## Resumen

materials-science-ai999x es un motor determinista de ciencias de materiales para Python publicado por la organización AI999X (creador: Ibnul Jaif Farabi) bajo licencia Apache-2.0. No es un transformer generativo: el autor lo describe como un sistema neuro-simbólico en el que una capa de lectura basada en reglas interpreta la pregunta en inglés y la dirige a uno de los 87 procedimientos simbólicos certificados, que calculan la respuesta con sympy y mpmath y la verifican antes de devolverla.

El paquete cubre tareas acotadas de cristalografía y difracción, defectos y difusión, propiedades mecánicas, diagramas de fase, polímeros, cerámicos y compuestos, y propiedades electrónicas y térmicas. Devuelve pasos, fórmulas en LaTeX, unidades y supuestos, o un rechazo explícito (siete estados posibles: SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) cuando no puede verificar el resultado; el autor lo presenta como un sistema de cero respuestas incorrectas por diseño.

Su interés práctico está en el nicho del cálculo materialista verificable y offline (CPU, sin GPU, sin red ni clave de API) y en su uso como pieza de validación en cuadernos docentes o pipelines. El repositorio declara 4.715.520 parámetros en safetensors y artefactos ONNX, aunque la model card no documenta ningún entrenamiento neuronal: conviene tratar esa cifra como metadato del repositorio, no como el tamaño de un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (no transformer): lectura basada en reglas más capacidades simbólicas certificadas; artefactos safetensors/ONNX según los tags del repositorio |
| Parámetros totales | 4.715.520 (dato de safetensors del repositorio) |
| Parámetros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (interfaz de pregunta/respuesta; no se declara ventana de contexto) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; ejecución en CPU) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (tags del repositorio); distribución principal como wheel de Python (`materials_science_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura combina una capa de lectura de preguntas en inglés basada en reglas con 87 procedimientos simbólicos certificados que implementan cálculos de ciencia de materiales. El motor de cálculo se apoya en sympy y mpmath; cada respuesta se somete a una comprobación (sustitución inversa, comprobación dimensional o comparación con un cálculo independiente) antes de devolverse. El paquete incluye un knowledge pack versionado (1.0.1) y una interfaz tipada `solve(capability_id, **inputs)` además de la interfaz en lenguaje natural `ask()`. La ejecución es exclusivamente en CPU, offline y sin clave de API.

No se documenta ningún proceso de entrenamiento neuronal: no hay número de tokens, composición de dataset, RLHF ni DPO en la información disponible. La validación declarada consiste en 345 respuestas doradas reproducidas de forma idéntica en Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14). Existe una discrepancia relevante entre la model card, que describe un motor Python puro, y los metadatos del repositorio, que declaran 4,7 millones de parámetros en safetensors y tags ONNX; además, la propia model card marca `inference: false`.

## Capacidades

- Resolución de preguntas de ciencias de materiales en inglés mediante la función `ask()`, con formas de pregunta documentadas.
- Interfaz tipada garantizada `solve(capability_id, **inputs)` para las 87 capacidades certificadas.
- Cristalografía y difracción: densidad teórica, ángulo de Bragg, estructuras cristalinas.
- Defectos y difusión: segunda ley de Fick y cálculos asociados.
- Propiedades mecánicas y mecánica de fractura (según los tags del repositorio).
- Diagramas de fase y microconstituyentes del sistema hierro-carbono.
- Polímeros, cerámicos y compuestos.
- Propiedades electrónicas y térmicas.
- Respuestas con pasos, fórmulas en LaTeX, unidades, supuestos y modelo utilizado, aptas para tutoría y corrección de ejercicios.
- Siete resultados explícitos que evitan adivinar; rechazo honesto indicando qué falta.
- Tareas declaradas en los tags: question answering, token classification, text classification, sentence similarity y feature extraction.
- Ejecución offline en CPU, sin GPU, sin red y sin API key.
- No se documentan tool calling, agentes, razonamiento multi-paso abierto, visión ni audio.

## Casos de uso

- Tutoría y corrección de deberes: el modelo devuelve el desarrollo paso a paso con fórmulas en LaTeX y unidades, lo que permite mostrar al estudiante no solo el resultado sino el procedimiento y los supuestos aplicados.
- Cálculo de densidad teórica y difracción: resuelve preguntas como la densidad de una estructura FCC con masa atómica y radio dados, o el ángulo de Bragg a partir de la distancia interplanar y la longitud de onda, con verificación interna del resultado.
- Difusión en sólidos: aplicación de la segunda ley de Fick para obtener la concentración a una profundidad y tiempo dados, útil en problemas de cementación y tratamientos termoquímicos.
- Microconstituyentes del sistema hierro-carbono: cálculo de fracciones de perlita, ferrita proeutectoide y cementita para una composición dada, habitual en cursos de metalurgia.
- Entornos air-gapped o con requisitos de confidencialidad: al ejecutarse en CPU y sin red, puede desplegarse en laboratorios, aulas o infraestructuras aisladas donde no se permite enviar datos a APIs externas.
- Tests de regresión deterministas: las 345 respuestas doradas idénticas entre Windows y Linux permiten usar el paquete como oráculo en pipelines de CI que validen cálculos de materiales.
- Preprocesamiento y clasificación en pipelines de ML de materiales: los tags declaran token classification, text classification, sentence similarity y feature extraction, aprovechables para etiquetar literatura técnica, aunque la model card no detalla estas interfaces.
- Herramienta de apoyo en cuadernos de investigación: generación de resultados verificables y reproducibles que se pueden citar junto con sus supuestos y unidades.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`:

| Tarea | Dataset | Métrica | Valor | Verificación |
|---|---|---|---|---|
| Question answering de ciencias de materiales | Golden answers (345 preguntas documentadas; Windows y Linux, Python 3.10-3.14) | Accuracy | 1,0 | No verificada (`verified: false`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GPQA u otros) en la información disponible. El 1,0 de accuracy corresponde a un conjunto propio de 345 preguntas documentadas y a la reproducción idéntica entre plataformas, no a una evaluación Independiente sobre un benchmark abierto.

## Requisitos de hardware

- VRAM: no aplica; el motor se ejecuta únicamente en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se documenta soporte de aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica.
- RAM: no disponible en la documentación; el paquete es Python puro con dependencias sympy y mpmath y el repositorio ocupa 0,0 GB (redondeado).
- Plataformas probadas: Windows con Python 3.13 y Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14.
- Opciones de despliegue: `pip install materials-science-ai999x` desde PyPI o instalación directa del wheel alojado en el repositorio de HuggingFace. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo con pesos neuronales convencionales.
- Latencia y throughput: no disponibles. Al ser cálculo simbólico determinista, el coste depende de la capacidad invocada y no se publican medidas.

## Comparativa con modelos similares

En la información proporcionada no se identifican modelos neuronales directamente comparables: se trata de un solver determinista de dominio específico, no de un LLM. La comparación natural es con LLM generalistas (que no ofrecen determinismo ni rechazo garantizado) y con librerías simbólicas de ciencia de materiales (que no incluyen la capa de lectura en lenguaje natural).

| Criterio | materials-science-ai999x | LLM generalista | Librería simbólica de dominio |
|---|---|---|---|
| Tipo | Motor neuro-simbólico determinista | Modelo generativo autorregresivo | Conjunto de funciones y clases |
| Parámetros | 4.715.520 (safetensors) | No disponible en esta ficha | No aplica |
| Contexto | No disponible | No disponible en esta ficha | No aplica |
| Determinismo | Sí, respuestas idénticas entre plataformas | No garantizado | Sí, para una misma versión |
| Rechazo ante incertidumbre | Sí, siete estados explícitos | No sistematizado | Depende de la función |
| Licencia | Apache-2.0 | Varía según modelo | Varía según proyecto |
| Ejecución | CPU, offline, sin API key | Requiere GPU o servicio externo | CPU, offline |
| Disponibilidad | PyPI y HuggingFace | Pesos abiertos o APIs | Repositorios públicos |

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- La cobertura se limita a 87 capacidades certificadas; cualquier consulta fuera de ese conjunto devuelve OUT_OF_SCOPE en lugar de una respuesta aproximada.
- No es un modelo generativo: no redacta texto libre ni razona fuera de los procedimientos implementados, por lo que no sirve como asistente conversacional general.
- El benchmark de accuracy 1,0 es autodeclarado (`verified: false`) y se calcula sobre un conjunto propio de 345 preguntas, no sobre un benchmark abierto e independiente.
- No se documentan sesgos, pero al ser determinista el riesgo se traslada a errores de interpretación de la pregunta (AMBIGUOUS, UNRECOGNIZED_FORMAT) y a la precisión de sympy y mpmath en los cálculos.
- Proyecto muy reciente (creado el 25 de octubre de 2026) y sin tracción observable: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- La model card declara `inference: false`, por lo que el widget de inferencia de HuggingFace no ejecutará el modelo; el uso requiere instalación local del paquete.
- Discrepancia entre la descripción de Python puro y los 4,7 millones de parámetros en safetensors más los tags ONNX; conviene auditar los artefactos antes de integrarlos en producción.
- La licencia Apache-2.0 permite uso comercial, pero el software se distribuye sin garantías; no hay compromiso de soporte ni de mantenimiento a largo plazo.
- No se documentan tool calling, agentes, visión, audio ni modo thinking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/materials-science-ai999x
- Paquete en PyPI: https://pypi.org/project/materials-science-ai999x/
- Guía de capacidades (carpeta docs del repositorio): https://huggingface.co/AI999X/materials-science-ai999x/tree/main/docs
- Evaluación (carpeta evaluation del repositorio): https://huggingface.co/AI999X/materials-science-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo (Buy Me a Coffee): https://buymeacoffee.com/ibnuljaiffarabi
