# AI999X/discrete-math-ai999x

## Resumen

discrete-math-ai999x es un motor determinista de resolución de problemas de matemática discreta para Python, publicado por la organización AI999X (creador e ingeniero: Ibnul Jaif Farabi). No es un transformer autoregresivo al uso: la model card lo describe como un motor neuro-simbólico en el que una capa de lectura basada en reglas interpreta la pregunta o llamada tipada y delega el cálculo en 99 procedimientos simbólicos certificados (sympy, mpmath). El resultado se devuelve con pasos, fórmulas en LaTeX, unidades y supuestos, o con una negativa explícita si no se puede verificar.

El paquete se distribuye como librería Python propia (`discrete_math_ai999x`, versión 1.0.1) y como wheel instalable desde el repositorio de HuggingFace. Los pesos publicados en safetensors suman 4.715.520 parámetros (4,72 M) y el repositorio completo ocupa 0,1 GB. La ejecución es exclusivamente en CPU, sin GPU, sin red y sin clave de API, lo que lo hace adecuado para entornos aislados.

Su relevancia actual está en la propuesta de "cero respuestas incorrectas por diseño": siete resultados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) sustituyen a la generación libre, y el autor declara 538 respuestas doradas reproducidas de forma idéntica en Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura basada en reglas + 99 capacidades simbólicas certificadas (no es un transformer generativo) |
| Parámetros totales | 4.715.520 (4,72 M) según safetensors |
| Longitud de contexto | no disponible (la unidad de entrada es una pregunta documentada o una llamada `solve(capability_id, **inputs)`) |
| Tipos de cuantización | no disponible (no se documentan variantes cuantizadas; ejecución en CPU sobre Python) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución adicional como wheel de Python (`.whl`) |
| Versión del paquete | 1.0.1 (import `discrete_math_ai999x`) |
| Knowledge pack | 1.0.0 |
| Capacidades certificadas | 99 |
| Respuestas doradas | 538 |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Runtime | solo CPU, offline; sin GPU, sin red, sin API key |
| Descargas / likes en HuggingFace | 24 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es híbrida y no generativa. Una capa de lectura basada en reglas convierte la pregunta en lenguaje natural (formas documentadas) o la llamada tipada en una invocación a una de las 99 capacidades certificadas, que se ejecutan sobre sympy y mpmath. Cada respuesta se verifica antes de devolverse mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente. Los tags del repositorio (token-classification, text-classification, sentence-similarity, feature-extraction, onnx) apuntan a un componente neuronal pequeño empaquetado junto al núcleo simbólico; la información disponible no detalla la función exacta de esos 4,72 M de parámetros.

No se han publicado datos de entrenamiento: no hay cifra de tokens, composición del dataset, ni referencias a RLHF, DPO o ajuste por instrucciones. El conocimiento del sistema reside en el "knowledge pack" 1.0.0 y en los procedimientos simbólicos, no en los pesos. La innovación destacable es el contrato de salida determinista con siete estados posibles y la reproducibilidad declarada entre plataformas: el autor afirma que las 538 respuestas documentadas se reproducen de forma idéntica en cada combinación de sistema operativo y versión de Python probada.

## Capacidades

- Resolución de problemas de teoría de números, aritmética modular (inverso modular, teorema chino del resto), combinatoria (desarreglos, coeficientes), estructura de grafos (número cromático, coloración), lógica proposicional (tautologías, tablas de verdad) y matemática de la criptografía (RSA).
- Interfaz dual: `ask()` acepta preguntas en inglés en formas documentadas y `solve(capability_id, **inputs)` ofrece una interfaz tipada garantizada para tareas soportadas con entradas válidas.
- Salida explicativa con pasos intermedios, fórmulas en LaTeX, unidades, supuestos y el procedimiento utilizado, apta para cuadernos, aplicaciones de tutoría y correctores de deberes.
- Negativa explícita ante entradas incompletas, ambiguas, inválidas o fuera de alcance, en lugar de una respuesta aproximada.
- Determinismo y reproducibilidad entre plataformas y versiones de Python, orientado a tests de regresión.
- Tareas declaradas en los tags: question-answering, token-classification, text-classification, sentence-similarity y feature-extraction.
- Ejecución offline en CPU, sin dependencia de red, GPU ni credenciales.
- No se documentan modo "thinking", visión, audio, tool calling genérico ni razonamiento multi-paso fuera del flujo de resolución simbólica.

## Casos de uso

- Corrección automática de ejercicios de matemática discreta en un LMS: invocando `solve()` con el `capability_id` correspondiente se obtiene una respuesta determinista con pasos y LaTeX, lo que permite calificar de forma reproducible y auditar cada corrección.
- Tutor offline en aulas o exámenes sin conectividad: al ejecutarse solo en CPU y sin red ni clave de API, puede desplegarse en equipos aislados o en portátiles de alumnos sin exposición de datos.
- Verificación cruzada de respuestas generadas por otros modelos: el motor actúa como comprobador simbólico en un pipeline donde un LLM propone y este paquete valida o emite `OUT_OF_SCOPE`/`INVALID_INPUT`.
- Docencia de criptografía introductoria: cálculo de inversos modulares, resolución de sistemas por teorema chino del resto y operaciones asociadas a RSA con justificación paso a paso.
- Generación de bancos de problemas con solución verificada: las 538 respuestas doradas sirven como conjunto de regresión para validar actualizaciones del propio paquete o de sistemas que lo integren.
- Enrutado de consultas matemáticas dentro de un sistema mayor: los tags de clasificación y similitud, junto al recall@5 de 0,988 declarado sobre 12.998 preguntas, permiten seleccionar la capacidad adecuada antes de ejecutar el cálculo.
- Material docente reproducible en notebooks: la salida con LaTeX, unidades y supuestos se inserta directamente en apuntes o informes sin posprocesado manual.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card; ninguno figura como verificado de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluación | Métrica | Valor | Nota del autor |
|---|---|---|---|---|
| Question answering (matemática discreta) | Golden answers (538 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,000 | "Idéntico en todas las plataformas" |
| Question answering (matemática discreta) | Capability search, 12.998 preguntas verificadas reservadas de todos los modelos AI999X | Recall@1 | 0,918 | "Capacidad correcta en primera posición" |
| Question answering (matemática discreta) | Capability search, 12.998 preguntas verificadas reservadas de todos los modelos AI999X | Recall@5 | 0,988 | "En el top cinco" |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de LLM en la información disponible, ni comparaciones numéricas con modelos de la competencia.

## Requisitos de hardware

- VRAM: no aplica; la ejecución es exclusivamente en CPU (0 GB de VRAM).
- GPU: no necesaria ni soportada según la documentación; el runtime declarado es CPU only.
- Cabe en cualquier equipo de consumo: el repositorio completo ocupa 0,1 GB y las dependencias son Python con sympy y mpmath.
- CPU compatible: x86-64 en Linux y Windows probados; no se documentan pruebas en ARM ni macOS.
- Versiones de Python soportadas y probadas: 3.10, 3.11, 3.12, 3.13 y 3.14 (Linux); 3.13 en Windows.
- Opciones de despliegue: `pip install discrete-math-ai999x` desde PyPI o instalación del wheel alojado en el repositorio de HuggingFace; uso como librería embebida en scripts y notebooks. No aplica despliegue con vLLM, llama.cpp, Ollama o TGI, al no ser un transformer autoregresivo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Capacidades certificadas | Respuestas doradas | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| discrete-math-ai999x | Motor neuro-simbólico determinista, matemática discreta | 99 | 538 | en | Apache-2.0 | HuggingFace + PyPI + GitHub |
| algebra-ai999x | Motor determinista, álgebra | 56 | 230 | no disponible | Apache-2.0 (según PyPI) | PyPI |
| math-foundations-ai999x | Motor determinista, fundamentos de matemáticas | 119 | 625 | no disponible | Apache-2.0 (según PyPI) | PyPI |
| ai999x-encoder | Encoder BERT "tiny" en ONNX para búsqueda de capacidades y similitud semántica | no aplica | no aplica | en | Apache-2.0 | HuggingFace |

Los tres primeros comparten filosofía (cálculo verificado y negativa explícita) y se diferencian por dominio y cobertura; el cuarto es un componente neuronal de recuperación, no un solucionador. No se dispone de recuentos de parámetros ni de benchmarks comparables de algebra-ai999x y math-foundations-ai999x en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Dominio cerrado: únicamente cubre las áreas declaradas (teoría de números, aritmética modular, combinatoria, grafos, lógica proposicional y matemática de la criptografía). Cualquier otra rama de las matemáticas queda fuera de alcance y devuelve `OUT_OF_SCOPE`.
- No genera texto libre ni razona fuera de sus 99 capacidades; `ask()` solo interpreta formas de pregunta documentadas y, en caso contrario, devuelve `UNRECOGNIZED_FORMAT`.
- Los benchmarks son autodeclarados y figuran con `verified: false`; no se ha localizado replicación independiente de la accuracy de 1,0 ni del recall@1 de 0,918.
- El propio `model-index` etiqueta la métrica de accuracy de 1,0 como no verificada, por lo que no debe citarse como resultado auditado.
- `inference: false` en los metadatos de la model card: HuggingFace no ofrece inferencia alojada para este repositorio.
- Tracción comunitaria muy baja (24 descargas y 0 likes), lo que limita la validación por terceros y el soporte disponible.
- Requiere la librería propia `discrete-math-ai999x`; no es consumible con `transformers`, vLLM ni llama.cpp.
- La reproducibilidad bit a bit se declara solo para las plataformas y versiones de Python probadas; no se documentan pruebas en macOS, ARM ni en otras versiones del intérprete.
- Los metadatos del repositorio declaran fechas de creación y actualización en 2026, posteriores a la mayor parte del ecosistema de referencia; conviene contrastarlas antes de citarlas.
- Licencia Apache-2.0: permite uso comercial y modificación con obligaciones de atribución y sin garantías; el autor solicita donaciones de forma independiente a la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/discrete-math-ai999x
- Repositorio GitHub: https://github.com/AI999X/discrete-math-ai999x
- Paquete PyPI: https://pypi.org/project/discrete-math-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/discrete-math-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/discrete-math-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Modelos AI999X filtrados por tag: https://huggingface.co/models?other=ai999x
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Modelo relacionado, álgebra: https://pypi.org/project/algebra-ai999x/
- Modelo relacionado, fundamentos de matemáticas: https://pypi.org/project/math-foundations-ai999x/
- Ficha de terceros del encoder AI999X: https://free2aitools.com/model/ai999x/ai999x-encoder
