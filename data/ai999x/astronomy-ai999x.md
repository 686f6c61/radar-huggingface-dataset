# AI999X/astronomy-ai999x

## Resumen

astronomy-ai999x es un motor de resolución de problemas de astronomía para Python, distribuido por la organización AI999X y creado por Ibnul Jaif Farabi. No es un modelo de lenguaje generativo al uso: se describe como un motor neuro-simbólico determinista que interpreta la pregunta en inglés, selecciona una de sus 67 capacidades astronómicas certificadas, calcula el resultado de forma exacta y lo devuelve junto con los pasos, unidades, LaTeX y supuestos empleados. Cuando no puede verificar la respuesta, devuelve un rechazo explícito en lugar de improvisar.

El repositorio de HuggingFace contiene pesos en safetensors con 4.715.520 parámetros (aproximadamente 4,7 millones) y artefactos ONNX, además de la distribución instalable vía pip. El paquete declara ejecución exclusiva en CPU, sin GPU, sin red y sin claves de API, con resultados idénticos en Windows y Linux sobre Python 3.10 a 3.14.

Su relevancia actual reside en la propuesta de "cero respuestas incorrectas por diseño": siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y un conjunto de 350 respuestas doradas documentadas que, según el autor, se reproducen de forma idéntica en todas las plataformas probadas. La evaluación es declarada por el autor y no está verificada de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida neuro-simbólica: lectura de la pregunta basada en reglas más 67 capacidades simbólicas certificadas; la arquitectura interna del componente neuronal (safetensors/ONNX) no está detallada en la información disponible |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la entrada es una pregunta o una llamada tipada con parámetros, no una ventana de contexto) |
| Tipos de cuantizacion | No disponible (no se declaran cuantizaciones; se distribuyen safetensors, ONNX y un wheel de Python) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX y wheel de Python (`astronomy_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La información disponible describe el sistema como un motor determinista que combina una capa de lectura de la pregunta en lenguaje natural (basada en reglas, orientada a formas documentadas) con un conjunto de procedimientos simbólicos certificados implementados sobre SymPy y mpmath. Cada procedimiento recibe parámetros tipados, calcula el resultado y lo somete a una comprobación de verificación antes de devolverlo: sustitución inversa, análisis dimensional o comparación con un cálculo independiente. La API expone dos vías: `ask()` para preguntas en inglés documentado y `solve(capability_id, **inputs)` para la interfaz tipada garantizada.

No se han publicado en la información proporcionada detalles sobre el proceso de entrenamiento del componente neuronal: no hay datos sobre volumen de tokens, composición del corpus, uso de RLHF/DPO ni función de pérdida. La model card tampoco documenta la topología interna de los 4,7 millones de parámetros almacenados en safetensors; el peso del sistema recae en el motor simbólico y en el paquete de conocimiento versionado 1.0.0. La innovación declarada es de diseño de producto más que de arquitectura: rechazo explícito ante la incertidumbre, trazabilidad de pasos y fórmulas, y reproducibilidad bit a bit entre plataformas.

## Capacidades

- Resolución de problemas de distancias y magnitudes astronómicas, con salida en unidades del SI y unidades específicas del dominio (pc, ly, AU).
- Propiedades estelares y radiación de cuerpo negro: luminosidad estelar, temperatura efectiva y magnitudes derivadas.
- Mecánica orbital y celeste: transferencias de Hohmann, elementos orbitales y parámetros de órbitas.
- Exoplanetas: cálculos asociados a detección, tránsitos y parámetros planetarios dentro de las capacidades certificadas.
- Cosmología básica: tiempo de retroceso (lookback time), parámetros de Hubble y densidades cosmológicas.
- Astronomía posicional y tiempo: conversión de coordenadas, por ejemplo altitud y acimut a partir de ángulo horario, declinación y latitud.
- Física de plasmas y del espacio dentro del catálogo de 67 procedimientos.
- Observación y telescopios: cálculos de observación y de instrumentación.
- Explicabilidad integrada: cada respuesta incluye pasos, fórmulas en LaTeX, unidades, supuestos y el modelo utilizado.
- Comportamiento de rechazo controlado: siete estados de salida explícitos, sin conjeturas silenciosas.
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.
- Interfaz de línea de comandos (`astronomy-ai999x "<question>"`, `astronomy-ai999x --capabilities`).
- Tareas declaradas en los tags del repositorio: question answering, token classification, text classification, sentence similarity y feature extraction.

## Casos de uso

- Corrección automática de ejercicios de astronomía: `solve()` con la capacidad y los parámetros del enunciado permite comparar el resultado del alumno con un valor calculado y verificado, y devolver la discrepancia junto con los pasos intermedios.
- Tutoría offline en aulas sin conectividad: al ejecutarse en CPU y sin red, puede desplegarse en equipos de laboratorio o portátiles de estudiantes donde no se permite acceso a servicios en la nube.
- Generación de material docente en LaTeX: la salida incluye fórmulas y supuestos, lo que permite poblar apuntes o boletines de problemas de forma reproducible.
- Validación cruzada en pipelines de investigación: usar el motor como segunda implementación independiente frente a un cálculo propio en AstroPy para detectar errores de unidades o de conversión en scripts de reducción de datos.
- Cálculo de planificación de observaciones: conversión de coordenadas y cálculos de visibilidad para preparar una noche de observación sin depender de conexión a internet en el observatorio.
- Integración en asistentes o chatbots de divulgación científica: la API devuelve un estado explícito y un mensaje de rechazo cuando la pregunta queda fuera de las 67 capacidades, lo que evita respuestas inventadas en producción.
- Verificación en herramientas de evaluación tipo homework checker: el estado `NEEDS_INPUT` o `AMBIGUOUS` permite pedir al usuario los datos que faltan en lugar de asumir valores.
- Pruebas de regresión en código científico: los 350 casos dorados documentados sirven como suite de referencia para comprobar que una actualización del entorno (versión de Python, de SymPy) no altera los resultados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de evaluaciones independientes.

| Tarea | Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de astronomía | Golden answers (350 preguntas documentadas, Windows y Linux, Python 3.10-3.14) | Accuracy | 1,0 | No (`verified: false`) |

El propio autor etiqueta la métrica como "identical on every platform", es decir, reproduce exactamente las 350 respuestas documentadas en todas las plataformas probadas. Se trata de una evaluación interna sobre un conjunto propio, no de un benchmark de propósito general ni de una comparación con terceros.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. El campo de ejecución de la model card es `inference: false` para inferencia tipo transformer y el sistema se declara "CPU only, offline".
- Huella de los pesos: los 4.715.520 parámetros en safetensors equivalen a unos 19 MB en fp32 (4 bytes por parámetro), estimación calculada a partir del recuento publicado.
- Memoria RAM: no publicada; al tratarse de Python puro con SymPy y mpmath, el consumo vendrá dominado por el intérprete y las dependencias, no por los pesos. Se recomienda reservar al menos varios cientos de MB por proceso.
- GPU recomendadas: ninguna. Funciona en cualquier CPU x86-64; los tags incluyen ONNX, por lo que también puede ejecutarse con ONNX Runtime.
- Cabe en hardware de consumo: sí, en cualquier portátil o máquina virtual modesta, sin acelerador.
- Opciones de despliegue: instalación vía pip desde PyPI o desde el wheel del repositorio, uso como librería Python, CLI `astronomy-ai999x` y ejecución mediante ONNX Runtime. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo servible por esas pilas.
- Latencia y throughput: no publicados. Al ser cálculo simbólico determinista, el coste depende de la capacidad invocada y no de la longitud de una secuencia de entrada.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (motor neuro-simbólico de astronomía). La comparación más informativa es frente a librerías científicas que cubren dominio parecido, aunque no son modelos con pesos.

| Sistema | Tipo | Parámetros | Contexto | Lenguaje natural | Licencia | Offline | Verificación de resultados |
|---|---|---|---|---|---|---|---|
| astronomy-ai999x | Motor neuro-simbólico con 67 capacidades certificadas | 4.715.520 | No disponible | Sí, inglés documentado | Apache-2.0 | Sí, CPU | Sí, con comprobación por capacidad y rechazo explícito |
| AstroPy | Librería científica de Python para astronomía | No aplica (no es un modelo) | No aplica | No | BSD-3-Clause | Sí | No incluye capa de verificación ni estados de rechazo |
| SymPy | Librería de matemática simbólica | No aplica (no es un modelo) | No aplica | No | BSD-3-Clause | Sí | No específica de astronomía |
| LLM de propósito general (p. ej. modelos de 7B-70B) | Transformer generativo | No disponible en esta ficha | No disponible en esta ficha | Sí, multilingüe | Variable | Depende del despliegue | No; puede alucinar y no expone estados de error formales |

La diferencia funcional clave frente a un LLM es que astronomy-ai999x no genera texto libre a partir de una distribución de probabilidad, sino que ejecuta procedimientos y verifica el resultado, lo que acota el riesgo de alucinación al precio de una cobertura limitada al catálogo de capacidades.

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve lo que cubren sus 67 capacidades certificadas; fuera de ese catálogo devuelve `OUT_OF_SCOPE` o `UNRECOGNIZED_FORMAT`.
- Idioma: únicamente inglés. Las formas de pregunta están documentadas y la lectura se basa en reglas, por lo que paráfrasis no previstas pueden no reconocerse.
- Evaluación no independiente: el 1,0 de accuracy procede de un conjunto propio de 350 preguntas y está marcado como no verificado (`verified: false`). No hay benchmarks de terceros.
- La afirmación "zero wrong answers" es una declaración del autor sobre el diseño del sistema; no equivale a una garantía formal de corrección física de todos los modelos y aproximaciones implementados.
- Dependencia de supuestos: los resultados son tan válidos como las aproximaciones de cada capacidad (por ejemplo, fórmulas de transferencia de Hohmann ideal); los supuestos se declaran en la salida, pero deben revisarse en contextos de alta precisión.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con una única versión 1.0.0 y un solo autor. No hay historial de mantenimiento a largo plazo.
- Trazabilidad de los pesos: la model card no detalla el entrenamiento ni la arquitectura interna del componente almacenado en safetensors/ONNX, lo que dificulta auditar esa parte.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución y aviso de cambios; no se han detectado cláusulas adicionales restrictivas en la información disponible.
- No es sustituible por un servidor de inferencia de LLM: intentar desplegarlo con vLLM, TGI o llama.cpp no es viable; la integración es como dependencia de Python.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/astronomy-ai999x
- Documentación de capacidades: https://huggingface.co/AI999X/astronomy-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/astronomy-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Paquete en PyPI: https://pypi.org/project/astronomy-ai999x/
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
