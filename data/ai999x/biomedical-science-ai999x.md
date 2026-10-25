# AI999X/biomedical-science-ai999x

## Resumen
biomedical-science-ai999x es un motor de resolución de problemas de ciencias biomédicas desarrollado por AI999X (Ibnul Jaif Farabi), publicado en HuggingFace bajo licencia Apache-2.0. No es un transformer generativo al uso: se describe como un motor neuro-simbólico determinista en Python puro (sympy, mpmath) que interpreta preguntas en inglés y resuelve tareas mediante 86 capacidades certificadas (farmacocinética, epidemiología, estadística de pruebas diagnósticas, análisis de supervivencia, biomecánica, modelos neuronales y física de imagen médica), devolviendo pasos, unidades y LaTeX.

El paquete declara 4.715.520 parámetros en safetensors y 0,1 GB de repositorio, y se ejecuta íntegramente en CPU, sin GPU, sin red y sin clave de API, sobre Python 3.10 a 3.14 en Windows y Linux. Su propuesta diferencial es el rechazo explícito: siete estados de salida (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de una respuesta inventada.

Es relevante para el nicho de tutoría y corrección automática de problemas STEM en entornos sin conectividad o con requisitos de reproducibilidad estricta, aunque su cobertura queda acotada a las 86 capacidades certificadas y a la validación declarada sobre 561 preguntas documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura basada en reglas y capacidades simbólicas certificadas (según model card); no disponible el detalle interno del componente neuronal |
| Parámetros totales | 4.715.520 (safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no aplica como ventana de atención al ser un motor simbólico |
| Tipos de cuantización | no disponible; el repositorio distribuye safetensors y ONNX |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; además se publica una wheel de Python (`biomedical_science_ai999x-1.0.1-py3-none-any.whl`) |

## Arquitectura y entrenamiento
La model card describe el sistema como un motor neuro-simbólico determinista: una capa de lectura de preguntas en inglés basada en reglas que selecciona una de las 86 capacidades certificadas y ejecuta el cálculo simbólico exacto con sympy y mpmath. Cada resultado se verifica antes de devolverse, bien sustituyendo el valor en la ecuación original, bien mediante comprobación dimensional o comparación con un cálculo independiente.

No se documentan en la información disponible detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO ni proceso de ajuste). La versión publicada es 1.0.1 con un knowledge pack 1.0.0 y 561 respuestas doradas reproducidas idénticamente en las plataformas probadas (Windows con Python 3.13 y Linux x86-64 con Python 3.10 a 3.14). El componente de safetensors con 4,7 M de parámetros no viene descrito en detalle en la documentación accesible.

## Capacidades
- Resolución paso a paso de problemas de farmacocinética (por ejemplo, bolo intravenoso, modelos compartimentales).
- Modelos epidemiológicos, incluido el tamaño final del brote en SIR.
- Estadística de pruebas diagnósticas (sensibilidad, especificidad, valores predictivos).
- Análisis de supervivencia tipo Kaplan-Meier, incluida mediana de supervivencia.
- Modelos neuronales y física de imagen médica (cálculo cuantitativo de modelos, no consejo médico).
- Biomecánica y problemas cuantitativos de ciencias de la vida.
- Interfaz tipada garantizada mediante `solve(capability_id, **inputs)`, además de la lectura libre con `ask()`.
- Devolución de pasos, fórmulas en LaTeX, unidades, supuestos y modelo utilizado.
- Salida determinista y reproducible entre plataformas y versiones de Python soportadas.
- Modo de rechazo explícito cuando la pregunta queda fuera de alcance o es ambigua.

## Casos de uso
- Tutoría de ciencias biomédicas en centros sin conectividad: `ask()` interpreta la pregunta del alumno y devuelve la solución con pasos y unidades, lo que permite desplegar el sistema en aulas con equipos de solo CPU.
- Corrección automática de problemas de farmacocinética y epidemiología: con `solve(capability_id, **inputs)` se obtiene una respuesta verificable y determinista, apta para comparar contra la solución esperada en pipelines de evaluación.
- Generación de material didáctico reproducible: la salida en LaTeX con fórmulas, unidades y supuestos sirve directamente para apuntes, guiones de prácticas o cuadernos Jupyter sin postprocesado.
- Investigación metodológica sobre sistemas neuro-simbólicos: al ser determinista y con rechazo explícito, es un banco de pruebas útil para estudiar la frontera entre lo resoluble y lo fuera de alcance.
- Verificación cruzada en contextos de docencia clínica: cálculos de GHK, Kaplan-Meier o SIR que el estudiante puede contrastar con su propio desarrollo, con la ventaja de que el motor expone los pasos.
- Integración en aplicaciones edtech offline: el paquete se instala con `pip` y no requiere red ni clave de API, lo que simplifica el despliegue en entornos con requisitos de soberanía de datos.
- Automatización de cálculos repetitivos en cuadernos de prácticas: la interfaz tipada evita la dependencia de la ambigüedad del lenguaje natural en flujos ya estructurados.

## Benchmarks y rendimiento
Los únicos datos declarados por el autor en el model-index son los siguientes. Nótese que el campo `verified` figura como `false`.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering en ciencias biomédicas | Golden answers (561 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1,0 | No |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware
- VRAM estimada: prácticamente nula. El motor se ejecuta en CPU; los 4,7 M de parámetros en safetensors ocuparían del orden de 19 MB en fp32 si se cargan como tensores, pero el uso documentado es mediante el paquete Python.
- GPU: no necesaria. La model card especifica explícitamente CPU only, sin GPU, sin red y sin clave de API.
- GPU de consumo: no aplica. No hay requisito de acelerador gráfico.
- Requisitos de sistema: Python 3.10, 3.11, 3.12, 3.13 o 3.14 en Windows o Linux x86-64; dependencias del ecosistema sympy y mpmath.
- Despliegue: instalación con `pip install biomedical-science-ai999x`, o instalación de la wheel desde el repositorio de HuggingFace. Los formatos safetensors y ONNX permiten carga alternativa con `transformers` u `onnxruntime` si se necesita.
- Latencia y throughput: no se publican cifras. Al ser cálculo simbólico determinista sobre CPU, la latencia esperada por consulta es baja, pero no hay mediciones oficiales en la información disponible.

## Comparativa con modelos similares
No se dispone de resultados de benchmarks comparables publicados en la información proporcionada. A continuación se contrastan alternativas por categoría funcional, marcando como "no disponible" cualquier dato no documentado.

| Sistema | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| biomedical-science-ai999x | Motor neuro-simbólico determinista | 4.715.520 | no aplica | Apache-2.0 | Ciencias biomédicas, 86 capacidades certificadas |
| SymPy / mpmath | Biblioteca de cálculo simbólico | no disponible | no aplica | BSD | Cálculo simbólico general, sin lectura de lenguaje natural |
| LLM médico de tipo MedQA | Transformer generativo | no disponible | no disponible | variable | Question answering médico con generación libre |
| LLM de propósito general | Transformer generativo | no disponible | no disponible | variable | Amplio, sin verificación determinista |

La comparación cuantitativa con estos sistemas no puede establecerse con los datos disponibles. La diferencia cualitativa clave es el determinismo y el rechazo explícito frente a la generación libre de los LLM.

## Limitaciones y advertencias
- Cobertura restringida: solo se resuelven las 86 capacidades certificadas; cualquier problema fuera de ese catálogo devuelve OUT_OF_SCOPE.
- Idioma: únicamente inglés. No hay soporte declarado de castellano ni de otras lenguas.
- Validación limitada: la accuracy de 1,0 se declara sobre 561 preguntas documentadas y con el campo `verified` en `false`; no equivale a una evaluación independiente en benchmarks abiertos.
- Riesgo de alucinación bajo por diseño, pero no nulo en la capa de lectura de la pregunta: una interpretación errónea del enunciado puede llevar a aplicar la capacidad equivocada, aunque los estados AMBIGUOUS y NEEDS_INPUT están previstos para mitigarlo.
- Ámbito sanitario: la propia model card aclara que se trata de cálculo cuantitativo de modelos y no de consejo médico; no debe usarse para decisiones clínicas.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene revisar los términos del archivo LICENSE del repositorio antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Dependencia del ecosistema Python y de las versiones probadas (3.10 a 3.14); no se documenta comportamiento en otras plataformas.

## Enlaces
- HuggingFace: https://huggingface.co/AI999X/biomedical-science-ai999x
- Organización en HuggingFace: https://huggingface.co/AI999X
- Documentación de capacidades en el repositorio: https://huggingface.co/AI999X/biomedical-science-ai999x/tree/main/docs
- Evaluación en el repositorio: https://huggingface.co/AI999X/biomedical-science-ai999x/tree/main/evaluation
- Paquete PyPI: https://pypi.org/project/biomedical-science-ai999x/
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
