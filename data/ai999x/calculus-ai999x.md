# AI999X/calculus-ai999x

## Resumen

calculus-ai999x es un motor neuro-simbólico determinista para resolver problemas de cálculo, desarrollado por Ibnul Jaif Farabi bajo la organización AI999X. No es un modelo de lenguaje generativo al uso: combina un enrutador neuronal de pequeño tamaño (4.715.520 parámetros en safetensors) con un conjunto de 71 procedimientos simbólicos certificados construidos sobre SymPy y mpmath. El modelo lee una pregunta en inglés, selecciona la capacidad adecuada, calcula la respuesta de forma exacta, la verifica (por sustitución, análisis dimensional o cálculo independiente) y devuelve el resultado con pasos, fórmulas en LaTeX, unidades y supuestos. Si no puede verificar la respuesta, se niega a contestar.

La propuesta de valor es el determinismo y la ausencia de alucinaciones: define siete resultados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y garantiza que las 374 respuestas documentadas se reproducen de forma idéntica en Windows y Linux con Python 3.10 a 3.14. Funciona íntegramente en CPU, sin GPU, sin red y sin clave de API, lo que lo hace apto para entornos aislados y aplicaciones educativas.

El modelo cubre límites, derivadas, integrales, series, polinomios de Taylor, cálculo multivariable y vectorial, funciones especiales y diferenciación e integración numérica. La versión actual es la 1.0.3, con licencia Apache-2.0, y se distribuye tanto desde HuggingFace como como paquete de Python en PyPI. El repo ocupa 0,1 GB y acumula 42 descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: enrutador neuronal + capacidades simbólicas certificadas sobre SymPy y mpmath |
| Parámetros totales | 4.715.520 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la interfaz se basa en formas de pregunta documentadas, no en una ventana de contexto de LLM |
| Tipos de cuantización | no disponible (se exporta en ONNX y safetensors, sin cuantización documentada) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX; también se distribuye como wheel de Python (`calculus_ai999x-1.0.3-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica en dos capas. La primera es un componente neuronal compacto (~4,7 millones de parámetros) que actúa como enrutador: clasifica la pregunta en lenguaje natural y la mapea a una de las 71 capacidades certificadas. La segunda es un motor simbólico determinista construido sobre SymPy y mpmath que ejecuta el procedimiento correspondiente y valida el resultado antes de devolverlo. La model card declara métricas de enrutamiento (recall@1 = 0,918 y recall@5 = 0,988 sobre 12.998 preguntas verificadas de todos los modelos AI999X), lo que sugiere que el componente neuronal se evalúa por su capacidad de seleccionar la herramienta correcta, no por generar texto.

El conocimiento se empaqueta en un "knowledge pack" versión 1.0.0 con 374 respuestas golden documentadas. La verificación es explícita: cada respuesta se comprueba por sustitución, análisis dimensional o comparación con un cálculo independiente, y el sistema devuelve uno de siete estados posibles en lugar de improvisar. No se han publicado detalles sobre el corpus de entrenamiento del enrutador, el número de tokens utilizados, la composición del dataset ni si hubo RLHF o DPO; la model card describe el sistema como determinista y basado en reglas más cómputo simbólico, no como un modelo generativo ajustado.

## Capacidades

- Resolución de límites, derivadas, integrales definidas e indefinidas, series, polinomios de Taylor, cálculo multivariable y vectorial, funciones especiales y diferenciación e integración numéricas.
- Interfaz `ask()` que acepta preguntas en inglés en formas documentadas.
- Interfaz tipada `solve(capability_id, **inputs)` que resuelve cualquier tarea soportada con entradas válidas garantizadas.
- Devolución de pasos intermedios, fórmulas en LaTeX, unidades, supuestos y modelo utilizado.
- Siete resultados explícitos que evitan respuestas no verificadas: SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT e INTERNAL_ERROR.
- Reproducibilidad bit a bit en Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14).
- Ejecución en CPU, sin GPU, sin red y sin clave de API.
- Tareas declaradas en los tags: question answering, token classification, text classification, sentence similarity y feature extraction.
- Idiomas: únicamente inglés.
- No incluye tool calling genérico, agentes multi-paso ni modo "thinking"; la API es determinista y acotada.

## Casos de uso

- Aplicaciones de tutoría de cálculo: `ask()` devuelve pasos, LaTeX y supuestos, de modo que la interfaz puede renderizar la solución completa sin post-procesado adicional.
- Corrección automática de deberes: comparar la respuesta del estudiante con la salida de `solve()` y clasificar el error (NEEDS_INPUT, INVALID_INPUT o resultado incorrecto).
- Entornos air-gapped o sin conectividad: al requerir solo CPU y funcionar sin red, puede desplegarse en aulas, hospitales o infraestructuras aisladas mediante `pip install`.
- Generación de material educativo en lote: procesar conjuntos de problemas documentados y producir soluciones verificadas con pasos y notación matemática.
- Integración en notebooks de Jupyter para investigadores que necesitan comprobar resultados simbólicos de forma reproducible entre sistemas operativos.
- Enrutamiento de consultas de cálculo dentro de sistemas mayores: el recall@5 de 0,988 sobre 12.998 preguntas permite usar el modelo como clasificador de capacidades antes de derivar a otros motores.
- Verificación cruzada en pipelines de investigación: contrastar un resultado simbólico propio con la respuesta certificada del motor y detectar discrepancias.
- Herramientas de apoyo al estudio offline en aplicaciones de escritorio o móviles empaquetadas con Python.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| calculus question answering | Golden answers (374 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy ("identical on every platform") | 1,000 |
| calculus question answering | Capability search, 12.998 preguntas verificadas held-out de todos los modelos AI999X | recall@1 ("right capability first") | 0,918 |
| calculus question answering | Capability search, 12.998 preguntas verificadas held-out de todos los modelos AI999X | recall@5 ("in the top five") | 0,988 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, GSM8K o HumanEval, ni comparaciones con otros motores de cálculo. Las cifras anteriores proceden exclusivamente del `model-index` del autor y llevan la marca `verified: false`.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU, VRAM dedicada, red ni clave de API.
- Huella en disco del repositorio: 0,1 GB, incluyendo safetensors, ONNX y el wheel de Python.
- Compatibilidad con Python 3.10, 3.11, 3.12, 3.13 y 3.14; probado en Windows y Linux x86-64.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y contenedores ligeros, dado el tamaño del componente neuronal y la naturaleza simbólica del motor.
- Despliegue mediante `pip install calculus-ai999x` o instalación directa del wheel alojado en el repositorio de HuggingFace.
- No se documentan latencia ni throughput concretos; al ser determinista y basado en SymPy/mpmath, los tiempos dependen de la complejidad simbólica de cada problema.
- La model card marca `inference: false`, por lo que no está pensado para la Inference API de HuggingFace; el uso previsto es local.

## Comparativa con modelos similares

La categoría es mixta: calculus-ai999x es un motor determinista especializado, mientras que las alternativas habituales son LLM generativos de matemáticas o bibliotecas simbólicas. La comparación directa de rendimiento no es posible con los datos disponibles.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calculus-ai999x | Motor neuro-simbólico determinista | 4.715.520 (+ SymPy/mpmath) | no aplica (formas de pregunta documentadas) | Apache-2.0 | HuggingFace + PyPI |
| Qwen2.5-Math-1.5B | LLM generativo de matemáticas | ~1.500 millones | no disponible en esta ficha | Apache-2.0 | HuggingFace |
| Mathstral-7B-v0.1 | LLM generativo de matemáticas | ~7.000 millones | no disponible en esta ficha | Apache-2.0 | HuggingFace |
| SymPy | Biblioteca simbólica determinista | no aplica | no aplica | BSD | PyPI |

Frente a los LLM de matemáticas, calculus-ai999x ofrece determinismo y rechazo explícito en lugar de generación libre, pero cubre un dominio mucho más estrecho y solo en inglés. Frente a SymPy puro, añade enrutamiento en lenguaje natural, verificación y salida pedagógica con pasos y LaTeX.

## Limitaciones y advertencias

- Cobertura acotada: 71 capacidades certificadas y 374 respuestas golden documentadas; fuera de ese alcance el modelo devuelve OUT_OF_SCOPE o NEEDS_INPUT.
- Solo admite inglés; no hay soporte multilingüe declarado.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no razona fuera del catálogo simbólico.
- Los benchmarks del `model-index` están marcados como `verified: false`; no hay validación independiente publicada.
- La calidad depende de SymPy y mpmath, por lo que errores o limitaciones de esas bibliotecas se propagan al motor.
- No hay cuantizaciones documentadas; el despliegue está pensado para CPU con el wheel de Python, no para servir como endpoint de Inference API.
- Riesgo bajo de alucinación por diseño, pero el sistema puede rechazar problemas válidos si la pregunta no encaja en las formas documentadas.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución; conviene revisar el archivo LICENSE del repositorio.
- El proyecto tiene 42 descargas y 0 likes, por lo que la madurez de la comunidad y el ecosistema es todavía limitada.
- No se documentan sesgos específicos; al ser un motor simbólico y no generativo, los sesgos sociales típicos de los LLM no aplican del mismo modo, pero sí pueden aparecer sesgos de cobertura (qué problemas se consideran soportados).

## Enlaces

- HuggingFace: https://huggingface.co/AI999X/calculus-ai999x
- PyPI: https://pypi.org/project/calculus-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/calculus-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/calculus-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Wheel de instalación directa: https://huggingface.co/AI999X/calculus-ai999x/resolve/main/dist/calculus_ai999x-1.0.3-py3-none-any.whl
- Licencia: https://huggingface.co/AI999X/calculus-ai999x/blob/main/LICENSE
