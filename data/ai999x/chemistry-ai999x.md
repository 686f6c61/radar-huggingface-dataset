# AI999X/chemistry-ai999x

## Resumen

chemistry-ai999x es un motor de resolución de problemas de química escrito en Python y publicado por AI999X (autor: Ibnul Jaif Farabi) bajo licencia Apache-2.0. No es un modelo de lenguaje generativo al uso: se describe como un motor neuro-simbólico determinista que combina un lector de preguntas en inglés basado en reglas con 103 procedimientos simbólicos certificados (sympy, mpmath). Cada respuesta se calcula, se verifica (sustitución inversa, comprobación dimensional o cálculo independiente) y se devuelve con pasos, unidades, LaTeX y supuestos, o se rechaza de forma explícita si no puede verificarse.

El paquete declara 377 respuestas doradas reproducidas de forma idéntica en Windows y Linux (Python 3.10 a 3.14), funciona íntegramente en CPU, sin GPU, sin red y sin clave de API, y expone dos interfaces: `ask()` para preguntas en lenguaje natural documentadas y `solve(capability_id, **inputs)` para una llamada tipada garantizada. Su propuesta de valor es la ausencia de alucinación por diseño: siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y nunca una conjetura silenciosa.

Es relevante para quien necesite cálculo químico reproducible y auditable en entornos offline (aulas, laboratorios, pipelines de validación), más que para generación de texto libre. El repositorio de HuggingFace incluye pesos en safetensors (4.715.520 parámetros) y exportación ONNX, aunque la model card marca `inference: false` y el uso previsto es la instalación vía pip.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (lector de preguntas basado en reglas + 103 capacidades simbólicas certificadas sobre sympy/mpmath); no es un transformer generativo |
| Parametros totales | 4.715.520 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no hay ventana de contexto de tokens; admite formas de pregunta documentadas y llamadas tipadas) |
| Tipos de cuantizacion | No disponible; se distribuye como paquete Python puro y exportación ONNX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX y wheel de Python (`chemistry_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo híbrido SSM: es un motor determinista que encadena un componente de lectura de preguntas basado en reglas con un conjunto de 103 procedimientos químicos certificados implementados simbólicamente (sympy, mpmath). El paquete incluye un "knowledge pack" versionado (1.0.1) y una batería de 377 respuestas doradas que actúan como contrato de regresión entre plataformas. Los 4.715.520 parámetros almacenados en safetensors corresponden a los componentes auxiliares del paquete (la model card etiqueta tareas de token-classification, text-classification, sentence-similarity y feature-extraction), pero no se detalla en la información disponible qué subredes concretas los contienen ni cómo se entrenaron.

No hay evidencia de un entrenamiento con corpus de tokens, ni de fases de RLHF, DPO o ajuste por preferencias. La "verificación" sustituye al ajuste estadístico: cada resultado se comprueba mediante sustitución inversa, análisis dimensional o una segunda computación independiente antes de devolverse. La innovación destacable es el diseño de rechazo explícito (siete estados de salida, ninguno de ellos una conjetura) y la reproducibilidad exacta entre sistemas operativos y versiones de Python, algo poco habitual en herramientas de razonamiento científico.

## Capacidades

- Resolución de estequiometría y ajuste de ecuaciones químicas (por ejemplo, `C3H8 + O2 -> CO2 + H2O` con coeficientes y ecuación balanceada).
- Cálculo de masas molares y propiedades moleculares a partir de fórmulas, incluidos hidratos como `CuSO4·5H2O`.
- Leyes de los gases, disoluciones y cálculo de pH, incluidos ácidos débiles con constante de acidez y grado de ionización.
- Equilibrio químico, ácidos y bases, cinética (ecuación de Arrhenius con dos temperaturas), termoquímica y electroquímica.
- Propiedades moleculares y espectroscopia dentro de las capacidades certificadas.
- Interfaz dual: `ask()` para preguntas en inglés documentadas y `solve(capability_id, **inputs)` con entradas tipadas y validadas.
- Salida explicativa con pasos, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada.
- Rechazo controlado con siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR).
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API; CLI disponible (`chemistry-ai999x "<question>"`, `--capabilities`).
- No soporta tool calling genérico, agentes autónomos, visión, audio ni generación de texto libre; sus capacidades están acotadas a las 103 rutinas certificadas.

## Casos de uso

- Corrección automática de ejercicios de química: el motor devuelve el resultado junto con pasos y unidades, de modo que una plataforma docente puede comparar la respuesta del alumno contra un valor verificado y mostrar la resolución, sin riesgo de que el sistema "invente" un resultado plausible pero erróneo.
- Tutoría y ayuda a estudiantes en entornos sin conectividad: al ejecutarse offline en CPU dentro del propio portátil o del aula, permite desplegar un asistente de química en centros con red restringida o en países con acceso limitado a APIs en la nube.
- Validación cruzada de respuestas generadas por LLM: usar `chemistry-ai999x` como oráculo determinista en un pipeline que compruebe los cálculos químicos producidos por un modelo generativo antes de publicarlos o enviarlos al usuario.
- Cuadernos reproducibles de laboratorio: `solve()` con entradas tipadas permite fijar cálculos de disoluciones, diluciones, pH o Arrhenius en notebooks Jupyter, garantizando que la misma llamada produce el mismo número en cada ejecución y en cada máquina.
- Integración en pipelines de CI/CD científico: la batería de 377 respuestas doradas y la paridad Windows/Linux permiten usarla como test de regresión de una aplicación química, detectando cambios de comportamiento entre versiones de Python o del knowledge pack.
- Herramienta de línea de comandos para cálculo rápido en terminal: `chemistry-ai999x "<question>"` resuelve una duda puntual de estequiometría, gases o equilibrio sin abrir un navegador ni depender de un servicio externo.
- Generación de material didáctico: la salida en LaTeX con fórmulas y supuestos se puede insertar directamente en apuntes, guiones de prácticas o enunciados de examen.
- Verificación de cálculos en entornos regulados o auditables: la ausencia de muestreo estocástico y la trazabilidad de la capacidad utilizada facilitan la justificación del resultado ante una revisión.

## Benchmarks y rendimiento

| Tarea | Conjunto de evaluación | Métrica | Valor | Estado |
|---|---|---|---|---|
| Question answering (química) | Golden answers (377 preguntas documentadas, Windows + Linux, Python 3.10–3.14) | accuracy | 1,0 | Declarado por el autor; marcado como `verified: false` en el model-index |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni evaluaciones independientes por terceros. El dato de accuracy = 1,0 procede de la propia model card y se refiere exclusivamente al conjunto de 377 preguntas doradas del autor, no a un benchmark público de química.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU, VRAM dedicada ni aceleradores.
- Huella de pesos muy reducida: 4.715.520 parámetros implican del orden de decenas de MB en memoria para los tensores, a los que se suma el coste de Python, sympy y mpmath en tiempo de ejecución.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos, Raspberry Pi y contenedores de CI con recursos limitados.
- Despliegue mediante `pip install chemistry-ai999x`, instalación directa del wheel desde el repositorio de HuggingFace, import como `chemistry_ai999x` o uso de la CLI; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Exportación ONNX disponible para integración en runtimes de inferencia ONNX cuando se prefiera evitar el intérprete de Python para los componentes auxiliares.
- No se han publicado cifras de latencia ni throughput en la información disponible; al ser cálculo simbólico determinista, el coste dominante es el de sympy por operación, no el de un pase forward sobre secuencias largas.

## Comparativa con modelos similares

| Herramienta | Naturaleza | Cobertura | Contexto | Licencia | Despliegue | Datos de rendimiento |
|---|---|---|---|---|---|---|
| chemistry-ai999x | Motor neuro-simbólico determinista | 103 capacidades certificadas de química | No aplica | Apache-2.0 | Local, CPU, offline, pip | accuracy 1,0 en 377 preguntas propias (autor, no verificado) |
| SymPy | Librería de matemática simbólica | Genérica; requiere construir el modelo químico a mano | No aplica | BSD-3-Clause | Local, CPU | No disponible |
| Wolfram\|Alpha (API) | Servicio propietario de conocimiento computacional | Muy amplia, incluye química | No aplica | Propietaria, de pago | Nube, requiere red y clave | No disponible |
| LLM generativo de propósito general (p. ej. familia Llama o GPT) | Transformer generativo | Amplia pero no verificada en cálculo químico | Ventana de tokens de decenas de miles a millones según modelo | Varía (comunitaria o propietaria) | GPU o API | No disponible para la comparación específica en química verificada |

La diferencia cualitativa clave frente a SymPy es el envoltorio de lectura de preguntas y verificación; frente a Wolfram|Alpha, la ejecución offline y la ausencia de coste por consulta; frente a un LLM generativo, la garantía de no alucinación y la reproducibilidad exacta, a cambio de una cobertura mucho más estrecha y de la ausencia de generación libre.

## Limitaciones y advertencias

- Cobertura acotada: solo resuelve las 103 capacidades certificadas; cualquier cuestión fuera de ese catálogo devuelve `OUT_OF_SCOPE` o `UNRECOGNIZED_FORMAT`, no una respuesta aproximada.
- Idioma único: el lector de preguntas solo admite inglés; no hay soporte documentado de castellano ni de otras lenguas.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no puede usarse como chatbot general.
- La model card marca `inference: false`: no está pensado para el Inference API de HuggingFace ni para servirse como endpoint estándar de transformers; el uso previsto es la instalación local del paquete.
- La métrica de accuracy 1,0 procede de un conjunto interno de 377 preguntas del propio autor y figura como `verified: false`; no equivale a una evaluación independiente ni a un benchmark público.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una única versión publicada (1.0.0): no hay historial de uso comunitario ni auditoría externa conocida.
- Sesgos conocidos: no disponible; al ser determinista y basado en reglas, el riesgo típico de sesgo estadístico no aplica, pero sí el sesgo de cobertura del catálogo de capacidades y de las formas de pregunta documentadas.
- Riesgo de alucinación: declarado como nulo por diseño (rechazo en lugar de conjetura), si bien esta afirmación no ha sido validada por terceros en la información disponible.
- Dependencia de sympy y mpmath: cambios de versión en estas librerías podrían alterar resultados numéricos o el formato de salida; conviene fijar versiones en producción.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso de cambios; no se han identificado restricciones adicionales en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/chemistry-ai999x
- Documentación de capacidades: https://huggingface.co/AI999X/chemistry-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/chemistry-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Paquete en PyPI: https://pypi.org/project/chemistry-ai999x/
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
