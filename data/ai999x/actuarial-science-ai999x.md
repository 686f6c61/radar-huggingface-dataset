# AI999X/actuarial-science-ai999x

## Resumen

`actuarial-science-ai999x` es un motor de resolución de problemas actuariales y de seguros desarrollado por AI999X (Ibnul Jaif Farabi) y publicado en HuggingFace bajo licencia Apache-2.0. A pesar de su nombre y de su empaquetado como modelo, no es un modelo de lenguaje en sentido estricto: se trata de un motor neuro-simbólico determinista que combina un lector basado en reglas con 91 procedimientos simbólicos certificados escritos en Python (sympy, mpmath). Recibe preguntas en inglés natural o llamadas tipadas y devuelve resultados exactos con pasos, unidades, LaTeX y supuestos, o un rechazo explícito cuando no puede verificar la respuesta.

El paquete declara 4.715.520 parámetros en formato safetensors, aunque su funcionamiento real no depende de inferencia neuronal clásica: la librería se distribuye como wheel de Python puro y se ejecuta exclusivamente en CPU, sin GPU, sin red y sin clave de API. Su propuesta de valor es el determinismo y la ausencia de alucinaciones por diseño, con siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y 568 respuestas documentadas reproducidas de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14.

Es relevante ahora para el nicho EdTech y de tutoría STEM porque ofrece una alternativa verificable a los LLM generativos en dominios donde un error numérico es inaceptable (contingencias de vida, reservas de siniestros, credibilidad). Su cobertura se limita a seis áreas actuariales concretas y su interfaz de lenguaje natural solo reconoce formas de pregunta documentadas, por lo que no debe confundirse con un asistente conversacional general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (lector basado en reglas + 91 capacidades simbólicas certificadas en Python/sympy/mpmath) |
| Parámetros totales | 4.715.520 (según safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; procesa una pregunta por llamada) |
| Tipos de cuantización | No disponible (no requiere cuantización; ejecución en CPU con Python puro) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX en el repo; distribución principal como wheel de Python (`actuarial_science_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica híbrida: una capa de lectura basada en reglas interpreta la pregunta en inglés natural o la llamada tipada, selecciona una de las 91 capacidades certificadas y delega el cálculo en procedimientos simbólicos deterministas implementados con sympy y mpmath. Cada resultado se verifica antes de devolverse mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente. No hay entrenamiento neuronal con descenso de gradiente, RLHF ni DPO documentado; el conocimiento reside en un "knowledge pack" versionado (1.0.0) y en las capacidades certificadas.

La innovación técnica destacable es el diseño de "cero respuestas incorrectas": el sistema prefiere rechazar (NEEDS_INPUT, AMBIGUOUS, OUT_OF_SCOPE) antes que adivinar, y garantiza reproducibilidad exacta entre plataformas. El paquete declara compatibilidad con Python 3.10, 3.11, 3.12, 3.13 y 3.14, y se ha probado en Windows (Python 3.13) y Linux x86-64. La model card indica explícitamente `inference: false` en los metadatos, lo que confirma que no se trata de un modelo para generación autoregresiva.

## Capacidades

- Resolución de problemas actuariales de contingencias de vida: primas netas de seguros de vida entera, anualidades contingentes y cálculos asociados.
- Teoría del interés y anualidades ciertas: valor actual, valor final, anualidades anticipadas y vencidas.
- Primas y reservas: cálculo de primas netas y reservas para distintos productos.
- Modelos de pérdidas: distribución de Pareto con deducible, frecuencia y severidad, agregación de siniestros.
- Credibilidad de Bühlmann: cálculo del factor de credibilidad, prima de credibilidad y parámetros estructurales.
- Reservas de siniestros mediante chain-ladder: proyección de valores últimos y reservas por año de origen.
- Interfaz de doble vía: `ask()` para preguntas en inglés natural documentadas y `solve(capability_id, **inputs)` para llamadas tipadas garantizadas.
- Salida explicativa: pasos, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada, apta para notebooks y correctores de deberes.
- Ejecución totalmente offline en CPU, sin GPU, sin red y sin clave de API.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento libre; su alcance está acotado a las 91 capacidades certificadas.

## Casos de uso

- Tutoría de asignaturas actuariales: un estudiante plantea un problema de prima neta o de credibilidad y el motor devuelve el resultado con pasos y LaTeX, lo que permite usar la salida como solución comentada en plataformas EdTech sin riesgo de cifras inventadas.
- Corrección automática de deberes STEM: integrado en un pipeline de evaluación, `solve()` con entradas tipadas valida respuestas numéricas de ejercicios de contingencias de vida y reservas, y el rechazo explícito evita calificar mal por una alucinación.
- Generación de exámenes y solucionarios: el motor produce 568 respuestas documentadas reproducibles, útiles como banco de referencia para generar variantes de problemas con solución verificada.
- Formación interna en aseguradoras: cálculo de primas, reservas chain-ladder y credibilidad de Bühlmann en sesiones de formación, ejecutándose en portátiles sin GPU ni conexión.
- Validación cruzada en producción aseguradora: uso como oráculo determinista que contrasta resultados de hojas de cálculo o de modelos internos en cálculos de reservas y primas, con verificación por sustitución inversa.
- Despliegue en entornos edge o air-gapped: al ser Python puro y funcionar offline, puede instalarse en equipos sin acceso a internet ni aceleradores, por ejemplo en aulas o auditorías internas.
- Integración en notebooks de investigación: la salida estructurada con unidades y supuestos facilita la reproducibilidad de cálculos actuariales en cuadernos Jupyter y la comparación entre plataformas Windows y Linux.

## Benchmarks y rendimiento

Los datos siguientes proceden del `model-index` declarado por el autor; la métrica figura como `verified: false`.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (ciencia actuarial y seguros) | Golden answers (568 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy (idéntico en cada plataforma) | 1.0 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; ejecución exclusiva en CPU.
- GPU recomendadas: ninguna; el paquete no usa aceleración por hardware.
- Cabe en cualquier equipo consumer: depende solo de Python 3.10-3.14 y de las dependencias sympy y mpmath.
- Despliegue: instalación vía `pip install actuarial-science-ai999x` o del wheel del repositorio; también disponible como app de escritorio, CLI y ejecución en navegador según los enlaces de la model card. No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; al ser cálculo simbólico determinista, la latencia depende de la capacidad invocada y no del hardware gráfico.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (motores neuro-simbólicos actuariales deterministas) ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Cobertura acotada: solo seis áreas actuariales (contingencias de vida, teoría del interés, primas y reservas, modelos de pérdidas, credibilidad y reservas de siniestros) mediante 91 capacidades certificadas; cualquier cuestión fuera de ese alcance devuelve OUT_OF_SCOPE.
- Idioma: únicamente inglés; las formas de pregunta aceptadas por `ask()` están documentadas y las variantes no reconocidas devuelven UNRECOGNIZED_FORMAT.
- No es un LLM conversacional: no mantiene diálogo multi-turno, no genera texto libre ni razona fuera de sus capacidades; los metadatos declaran `inference: false`.
- El benchmark de accuracy 1.0 procede del propio autor, se evalúa sobre su propio conjunto de 568 preguntas documentadas y figura como no verificado; no debe interpretarse como validación independiente.
- Riesgo de alucinación: bajo por diseño (rechazo explícito en lugar de adivinar), pero la corrección depende de que la pregunta se mapee a la capacidad adecuada y de que los supuestos declarados coincidan con el problema real.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene revisar el archivo LICENSE del repositorio para los términos exactos.
- Para producción: validar que la versión del knowledge pack (1.0.0) y del paquete coinciden, y fijar la versión en el pipeline para preservar la reproducibilidad de las 568 respuestas documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/actuarial-science-ai999x
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Ejecución en navegador: https://www.ai999x.com/models/actuarial-science-ai999x/#try
- Paquete en PyPI: https://pypi.org/project/actuarial-science-ai999x/
- Guías del repositorio: https://huggingface.co/AI999X/actuarial-science-ai999x/tree/main/docs
- Evaluación del repositorio: https://huggingface.co/AI999X/actuarial-science-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
