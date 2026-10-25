# AI999X/mechanical-engineering-ai999x

## Resumen

mechanical-engineering-ai999x es un motor de resolución de problemas de ingeniería mecánica para Python, desarrollado por Ibnul Jaif Farabi bajo la organización AI999X (versión 1.0.0, knowledge pack 1.0.1). No es un modelo de lenguaje generativo al uso: se describe como un motor neuro-simbólico determinista que combina una lectura basada en reglas de preguntas en inglés con 90 capacidades simbólicas certificadas (sympy, mpmath) que calculan y verifican la respuesta antes de devolverla.

El problema que resuelve es el de la fiabilidad en dominios técnicos: en lugar de generar texto plausible, el sistema selecciona un procedimiento certificado, calcula el resultado exacto, lo comprueba (sustitución inversa, análisis dimensional o cálculo independiente) y devuelve pasos, fórmulas en LaTeX, unidades y suposiciones. Cuando no puede verificar, devuelve uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de adivinar.

Es relevante por su perfil de despliegue: funciona completamente offline sobre CPU, sin GPU, sin clave de API y sin red, con resultados declarados idénticos en Windows y Linux sobre Python 3.10 a 3.14. Cubre estática, vigas y propiedades de sección, tensión y deformación, torsión, pandeo de columnas, fatiga, elementos de máquina, vibraciones y análisis estructural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de preguntas basada en reglas + 90 capacidades simbólicas certificadas (sympy, mpmath) |
| Parámetros totales | 4.715.520 (según el fichero safetensors del repositorio); el motor declarado es código Python simbólico y la función de esos pesos no está documentada en la model card |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa una pregunta o una llamada tipada por invocación) |
| Tipos de cuantización | no disponible (no se distribuyen pesos cuantizados; el paquete es un wheel `py3-none-any`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX en el repositorio; distribución principal como wheel de Python (`mechanical_engineering_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura declarada no es un transformer ni un modelo híbrido con atención: es un sistema neuro-simbólico en el que una capa de lectura basada en reglas interpreta formas de pregunta documentadas en inglés (o una llamada tipada mediante `solve(capability_id, **inputs)`) y la enruta a una de las 90 capacidades mecánicas certificadas. El cálculo efectivo lo realizan procedimientos simbólicos y numéricos sobre sympy y mpmath, con verificación posterior del resultado antes de la devolución. El paquete incluye un knowledge pack versionado (1.0.1) y 312 respuestas doradas documentadas.

No se documentan en la información disponible datos de entrenamiento (número de tokens, composición del corpus, RLHF/DPO) ni innovaciones de inferencia como decodificación especulativa o atención lineal, lo que es coherente con un motor determinista de reglas más cálculo simbólico. El repositorio incluye, no obstante, un fichero safetensors con 4.715.520 parámetros y exportaciones ONNX, cuya relación exacta con el motor simbólico no se explica en la model card; conviene tratar ese dato como no confirmado más allá de su existencia. La validación declarada se apoya en la reproducibilidad exacta de las 312 respuestas sobre Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13 y 3.14).

## Capacidades

- Resolución de problemas de estática: vigas simplemente apoyadas, cargas puntuales y distribuidas, reacciones, diagramas de esfuerzo cortante y momento flector.
- Propiedades de sección y geometría de secciones: momentos de inercia, módulos resistentes, áreas.
- Tensión y deformación: tensiones principales 2D, círculo de Mohr, deformaciones, criterios de fallo.
- Torsión en ejes y cálculo de columnas con carga de pandeo.
- Fatiga: factores de seguridad con criterios Goodman, Goodman modificado, Soderberg, Gerber, conteo Rainflow de historias de carga.
- Elementos de máquina: engranajes y rodamientos.
- Vibraciones y análisis estructural, incluidos sistemas de celosías y pórticos.
- Respuesta paso a paso con fórmulas en LaTeX, unidades, suposiciones y el modelo o capacidad empleados.
- Interfaz doble: `ask()` para preguntas en lenguaje natural documentado y `solve()` para invocación tipada garantizada.
- Multilingüe: no disponible; solo inglés.
- Tool calling / function calling: no disponible como API de herramientas; la integración es por importación de la librería en Python.
- Capacidades de agente o razonamiento multi-paso: no disponible como orquestación; el razonamiento se limita a la secuencia de pasos de cada capacidad certificada.
- Visión y audio: no disponibles.

## Casos de uso

- Corrección automática de ejercicios de resistencia de materiales: el motor devuelve estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS) que permiten distinguir entre respuesta correcta, enunciado incompleto y ambigüedad, algo que un LLM generativo no ofrece de forma fiable.
- Tutoría con explicación: `ask(...).show()` proporciona pasos, fórmula en LaTeX, unidades y suposiciones, apto para incrustar en cuadernos Jupyter o aplicaciones docentes sin conexión.
- Validación cruzada en pipelines de cálculo: usar `solve(capability_id, **inputs)` como oráculo independiente que comprueba resultados de simulaciones o de hojas de cálculo en vigas, torsión, pandeo y fatiga.
- Entornos con requisitos de confidencialidad o air-gapped: al ejecutarse en CPU, sin red y sin clave de API, encaja en plantas industriales, laboratorios o portátiles de campo donde no se permite enviar datos a la nube.
- Cálculo de vida a fatiga: el conteo Rainflow y los factores de seguridad Goodman permiten evaluar historias de carga reales en componentes sometidos a ciclos variables, con verificación dimensional del resultado.
- Docencia y generación de problemas resueltos: la reproducibilidad exacta de las 312 respuestas doradas permite usarlo como referencia estable en bancos de ejercicios y en la calificación automática.
- Integración en CI/CD de software de ingeniería: servir como suite de regresión determinista (mismas entradas, mismas salidas en Windows y Linux, Python 3.10-3.14) para validar cambios en calculadoras o wrappers propios.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index; no verificados de forma independiente (el campo `verified` figura como `false`).

| Tarea | Conjunto de evaluación | Métrica | Valor | Nota |
|---|---|---|---|---|
| Question answering de ingeniería mecánica | Golden answers (312 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 | "Identical on every platform" |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) ni comparaciones con otros sistemas. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM: no aplica; el motor se ejecuta en CPU y no requiere GPU.
- RAM: no disponible de forma explícita; el tamaño del repositorio es 0,0 GB y el wheel es `py3-none-any`, por lo que la huella esperada es la de un intérprete de Python con sympy y mpmath. No se publica un mínimo oficial.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar Python 3.10-3.14 es suficiente según el autor.
- Compatibilidad consumer: total; funciona en portátiles y equipos sin acelerador.
- Opciones de despliegue: instalación vía `pip install mechanical-engineering-ai999x` o directamente desde el wheel del repositorio de HuggingFace; importación como módulo Python (`import mechanical_engineering_ai999x`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con su naturaleza no generativa.
- Latencia y throughput: no disponibles. Al ser cálculo simbólico determinista, el coste depende de la capacidad invocada y no del número de tokens.
- Plataformas validadas: Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13 y 3.14).

## Comparativa con modelos similares

| Sistema | Enfoque | Cobertura | Determinismo | Licencia | Ejecución |
|---|---|---|---|---|---|
| mechanical-engineering-ai999x | Reglas + cálculo simbólico certificado | 90 capacidades, 312 respuestas doradas | Declarado determinista y reproducible entre plataformas | Apache-2.0 | CPU, offline, Python |
| SymPy | Biblioteca de matemática simbólica general | Amplia en matemáticas; sin capa de dominio mecánico ni lectura de enunciados | Determinista | BSD | CPU, offline, Python |
| Motor de cálculo de propósito general (p. ej. Wolfram Engine) | Simbólico y numérico de uso general | Muy amplia, requiere construir el modelo de dominio | Determinista | Propietaria / licencia específica | Local o cloud |
| LLM generativo de propósito general | Transformer generativo | Amplia pero no verificada | No determinista, riesgo de alucinación | Variable | GPU o API |

No se dispone de datos públicos que comparen rendimiento numérico o cobertura frente a estas alternativas; la comparación anterior es estructural, no de resultados.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado, por lo que un enunciado en castellano no está cubierto por las formas de pregunta documentadas.
- La cobertura está acotada a las 90 capacidades certificadas: cualquier problema fuera de ese catálogo devuelve OUT_OF_SCOPE, no una aproximación.
- La cifra de accuracy 1,0 procede de 312 preguntas documentadas y está marcada como no verificada de forma independiente; no es un benchmark abierto ni un conjunto de evaluación ciego.
- Existe una discrepancia sin explicar entre el discurso de la model card (motor Python puro basado en sympy y mpmath) y la presencia de un safetensors de 4.715.520 parámetros y exportaciones ONNX; conviene auditar el paquete antes de integrarlo en producción.
- El repositorio figura con 0 descargas y 0 likes y fue creado en octubre de 2026, sin tracción ni revisión externa conocida; el soporte depende de un único autor.
- Riesgo de alucinación bajo por diseño (no genera texto libre), pero el riesgo se traslada a la interpretación del enunciado: una pregunta malinterpretada puede resolverse correctamente sobre un modelo físico equivocado. El estado AMBIGUOUS mitiga, no elimina, este caso.
- Las suposiciones de cada capacidad (por ejemplo, comportamiento elástico lineal, secciones homogéneas) deben revisarse antes de usar los resultados en diseño real.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- No sustituye a la validación por normativa (Eurocódigo, ASME, ISO) ni a la firma de un ingeniero colegiado en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/mechanical-engineering-ai999x
- Paquete en PyPI: https://pypi.org/project/mechanical-engineering-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/mechanical-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/mechanical-engineering-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
