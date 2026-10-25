# AI999X/data-science-ml-ai999x

## Resumen

data-science-ml-ai999x es un solver determinista escrito en Python, publicado por la organización AI999X (autor: Ibnul Jaif Farabi) bajo licencia Apache-2.0, que responde preguntas de ciencia de datos y aprendizaje automático con resultados verificados en lugar de texto generado. No es un transformer ni un modelo de lenguaje generativo: se trata de un motor neuro-simbólico en el que una capa de lectura basada en reglas interpreta la pregunta en inglés y selecciona una de las 107 capacidades certificadas, que se calcula de forma exacta con sympy y mpmath y se comprueba antes de devolver la respuesta (sustitución inversa, comprobación de dimensiones o cálculo independiente).

El repositorio de Hugging Face incluye artefactos en safetensors y ONNX, con 4.715.520 parámetros declarados en el fichero de pesos y un tamaño total de 0,1 GB, pero la ejecución real se realiza mediante el paquete Python `data-science-ml-ai999x` 1.0.1 (wheel `py3-none-any`), que corre únicamente en CPU, sin GPU, sin red y sin clave de API. La model card marca `inference: false`, de modo que no está pensado para desplegarse en los endpoints de Hugging Face.

Su relevancia práctica está en la propuesta de "cero respuestas incorrectas por diseño": frente a un LLM que puede alucinar un resultado numérico, este motor devuelve uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y se niega a responder cuando no puede verificar el cálculo. El autor declara 711 respuestas doradas reproducidas de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14. El ámbito es exclusivamente en inglés y está acotado a las 107 capacidades documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de la pregunta basada en reglas más 107 capacidades simbólicas certificadas (no es un transformer) |
| Parametros totales | 4.715.520 (según los pesos en safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica: `ask()` interpreta formas de pregunta documentadas y `solve()` recibe argumentos tipados |
| Tipos de cuantizacion | No disponible; no aplica (ejecución en CPU con Python puro sobre sympy y mpmath) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, onnx; distribución principal como wheel de Python (`py3-none-any`) |
| Versión del paquete | 1.0.1 (import `data_science_ml_ai999x`), knowledge pack 1.0.0 |
| Capacidades certificadas | 107 procedimientos |
| Respuestas doradas | 711 respuestas documentadas |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Runtime | Solo CPU, offline; sin GPU, sin red, sin clave de API |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica y determinista, no neuronal en el sentido habitual: una capa de lectura basada en reglas analiza la pregunta en lenguaje natural (o la llamada tipada) y la empareja con una capacidad certificada del knowledge pack 1.0.0; a continuación el motor simbólico (sympy, mpmath) calcula el resultado de forma exacta y lo verifica mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente antes de devolverlo. Cada respuesta incluye pasos, fórmulas en LaTeX, unidades, supuestos y el identificador del modelo utilizado, lo que la hace apta para cuadernos, aplicaciones de tutoría y correctores de ejercicios.

No se han publicado datos de entrenamiento en la información disponible: no hay cifras de tokens, composición de dataset ni procesos de RLHF o DPO, y en rigor no aplican, ya que el comportamiento procede de reglas y procedimientos simbólicos certificados en lugar de ajuste de pesos. La innovación destacable es el contrato de salida con siete estados explícitos y la reproducibilidad declarada entre plataformas (Windows y Linux, Python 3.10-3.14), así como la doble interfaz: `ask()` para preguntas en inglés documentado y `solve(capability_id, **inputs)` como interfaz tipada garantizada.

## Capacidades

- Resolución de preguntas de ciencia de datos y aprendizaje automático en inglés con respuesta paso a paso, unidades, LaTeX y supuestos.
- Métricas de clasificación y regresión (por ejemplo, exactitud, precisión, sensibilidad, especificidad, ROC AUC y Gini calculados a partir de recuentos o de vectores de puntuaciones).
- Funciones de pérdida y gradientes, aritmética de redes neuronales, teoría de la información y métricas de ranking.
- Algoritmos clásicos de aprendizaje automático supervisado y no supervisado, incluido k-means con centroides y asignaciones paso a paso.
- Reducción de dimensionalidad, agrupamiento (clustering) y cálculo de métricas de evaluación asociadas.
- Interfaz tipada `solve(capability_id, **inputs)` que siempre resuelve una tarea soportada con entradas válidas.
- Rechazo explícito y tipificado: NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT e INTERNAL_ERROR en lugar de una suposición silenciosa.
- Ejecución totalmente offline en CPU, sin GPU, sin red y sin credenciales.
- No disponible: tool calling o function calling, orquestación de agentes, razonamiento multi-paso abierto, visión, audio, modo "thinking" o generación de texto libre.

## Casos de uso

- Tutoría y ayuda con ejercicios: el motor recibe una pregunta documentada del tipo "Binary metrics from counts: TP = 40, FP = 10, FN = 5, TN = 45" y devuelve exactitud, precisión, sensibilidad y especificidad con los pasos intermedios, lo que permite explicar el procedimiento al estudiante en lugar de solo dar el número.
- Corrección automática de tareas: al ser determinista y reproducible en Windows y Linux, el mismo enunciado produce exactamente la misma salida en el equipo del alumno y en el servidor de corrección, lo que simplifica la comparación contra una solución de referencia.
- Validación cruzada de métricas en pipelines de datos: se puede usar como oráculo independiente que recalcula ROC AUC, Gini o métricas derivadas de una matriz de confusión y contrastarlas con las de scikit-learn antes de publicar un informe.
- Documentación técnica y material didáctico: la salida incluye fórmulas en LaTeX, unidades y supuestos, de modo que puede alimentar directamente cuadernos Jupyter, apuntes o documentación interna sin retoques manuales.
- Entornos aislados o air-gapped: al no requerir red ni clave de API, encaja en instalaciones industriales, aulas sin conectividad o contenedores sin salida a internet donde un servicio en la nube no es viable.
- Suites de regresión para librerías internas: las 711 respuestas doradas documentadas pueden reutilizarse como conjunto de pruebas que detecte regresiones de cálculo entre versiones de Python o entre sistemas operativos.
- Asistentes de estudio con contrato estricto: integrado en una aplicación educativa, el estado OUT_OF_SCOPE o NEEDS_INPUT permite derivar al usuario a un docente o pedir los datos que faltan, evitando respuestas inventadas en un contexto de evaluación.

## Benchmarks y rendimiento

| Tarea | Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (data science and machine learning) | Golden answers (711 preguntas documentadas, Windows + Linux Python 3.10-3.14) | Accuracy, "identical on every platform" | 1,0 | No (declarado por el autor, `verified: false`) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato del model-index es la exactitud de 1,0 sobre el conjunto propio de 711 preguntas documentadas, declarada por el autor y no verificada por terceros; al ser un conjunto interno y cerrado, no es directamente comparable con benchmarks abiertos.

## Requisitos de hardware

- VRAM: 0 GB; el motor se ejecuta íntegramente en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no aplica a esta arquitectura.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y el wheel es `py3-none-any`, por lo que funciona en portátiles y en contenedores pequeños.
- Memoria RAM y latencia/throughput: no disponible en la información proporcionada.
- Despliegue: `pip install data-science-ml-ai999x` desde PyPI o instalación directa del wheel alojado en el repositorio de Hugging Face.
- No aplica soporte de vLLM, llama.cpp, Ollama o TGI: la model card declara `inference: false` y el runtime es una librería Python, no un servidor de inferencia neuronal.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de la misma categoría en la información proporcionada; las alternativas funcionales habituales (motores simbólicos como SymPy o librerías de métricas como scikit-learn) no son modelos publicados con parámetros, contexto ni benchmarks comparables, por lo que sus celdas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data-science-ml-ai999x | 4.715.520 (safetensors) | No aplica | Accuracy 1,0 en 711 preguntas propias (no verificado) | apache-2.0 | Hugging Face y PyPI |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance cerrado: solo cubre las 107 capacidades certificadas; cualquier consulta fuera de ese conjunto devuelve OUT_OF_SCOPE, no una respuesta aproximada.
- Idioma único: únicamente inglés, tanto en `ask()` como en la documentación de las capacidades.
- No es un modelo generativo: no redacta texto libre, no mantiene conversaciones abiertas y no puede sustituir a un LLM en tareas de síntesis o explicación abierta.
- Sin soporte de tool calling, agentes, visión, audio ni razonamiento multi-paso no estructurado.
- Riesgo de ambigüedad en la capa de lectura: una pregunta en lenguaje natural puede devolver AMBIGUOUS o UNRECOGNIZED_FORMAT; para producción conviene usar la interfaz tipada `solve()`.
- El benchmark declarado (accuracy 1,0) está marcado como no verificado y se calcula sobre el conjunto propio de preguntas documentadas del autor; no demuestra robustez ante preguntas nuevas ni es comparable con MMLU u otros benchmarks abiertos.
- No se han publicado datos de entrenamiento, composición del dataset ni evaluación de sesgos; al ser determinista y simbólico, el riesgo de alucinación numérica es bajo por diseño, pero la cobertura y las convenciones de cada capacidad deben auditarse por separado.
- La licencia Apache-2.0 permite uso comercial y modificación con obligaciones de atribución y aviso; se distribuye sin garantías, según los términos estándar de dicha licencia.
- Dependencia de las librerías sympy y mpmath, y de la versión del knowledge pack (1.0.0): cambios de versión pueden alterar resultados y requieren revalidar las respuestas doradas.
- La model card declara `inference: false`: no es desplegable en los endpoints de inferencia de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/data-science-ml-ai999x
- Paquete en PyPI: https://pypi.org/project/data-science-ml-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/data-science-ml-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/data-science-ml-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Licencia en el repositorio: https://huggingface.co/AI999X/data-science-ml-ai999x/blob/main/LICENSE
