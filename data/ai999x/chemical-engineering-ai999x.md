# AI999X/chemical-engineering-ai999x

## Resumen

`chemical-engineering-ai999x` es un artefacto publicado en Hugging Face por el desarrollador Ibnul Jaif Farabi bajo la organización AI999X, distribuido como paquete de Python (`pip install chemical-engineering-ai999x`) con pesos en safetensors y ONNX. No es un modelo de lenguaje generativo al uso: la model card lo describe como un motor neuro-simbólico determinista que interpreta enunciados de ingeniería química en inglés, selecciona uno de sus 91 procedimientos certificados, calcula el resultado con sympy/mpmath y lo devuelve con pasos, fórmulas en LaTeX, unidades y supuestos. Los pesos publicados suman 4.715.520 parámetros (aproximadamente 4,7 millones), un orden de magnitud propio de un codificador o cabezal de enrutado, no de un LLM conversacional.

El problema que aborda es el de la fiabilidad en cálculos de ingeniería de proceso: en lugar de generar texto plausible, el sistema devuelve uno de siete estados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y prefiere rechazar antes que adivinar. Cubre balances de materia y energía, diseño de reactores (CSTR, flujo pistón), separaciones (destilación McCabe-Thiele, absorción, extracción líquido-líquido, flash), coeficientes de actividad y ecuaciones de estado, transporte y lechos empaquetados, control de procesos PID e ingeniería de petróleo.

Su relevancia es acotada pero concreta: se ejecuta íntegramente en CPU, sin GPU, sin red y sin clave de API, lo que lo hace apto para entornos air-gapped, docencia y como herramienta determinista invocada desde un agente. La contrapartida es que la validación declarada (602 respuestas idénticas) es una autoevaluación del autor, marcada como `verified: false`, y que el repositorio no ofrece inferencia alojada (`inference: false`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card describe un motor neuro-simbólico determinista (lectura basada en reglas + capacidades simbólicas certificadas sobre sympy/mpmath), sin detallar la topología de los pesos safetensors/ONNX |
| Parámetros totales | 4.715.520 (4,7 M) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los formatos publicados son safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX; distribución adicional como wheel de Python (`chemical_engineering_ai999x-1.0.0-py3-none-any.whl`) |
| Tipo de artefacto | Motor de resolución determinista empaquetado como paquete Python, no un modelo de chat |
| Capacidades certificadas | 91 procedimientos |
| Knowledge pack | Versión 1.0.1 |
| Versión del paquete | 1.0.0 |
| Runtime | CPU únicamente, offline; sin GPU, sin red y sin clave de API |
| Plataformas probadas | Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Inferencia alojada en HF | No (`inference: false`) |
| Tareas declaradas | Question answering, sentence similarity, feature extraction |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura de los 4,7 M de parámetros: la model card no indica si se trata de un transformer, de un codificador de recuperación, de un clasificador de intenciones o de otra topología, ni documenta capas, dimensiones ocultas, cabezas de atención ni vocabulario. Lo que sí se describe con precisión es la capa simbólica que envuelve a esos pesos: el sistema parsea el enunciado (o recibe una llamada tipada `solve(capability_id, **inputs)`), elige una de las 91 rutinas certificadas, ejecuta el cálculo exacto, lo verifica —por sustitución inversa, comprobación dimensional o comparación con un cálculo independiente— y emite la respuesta con sus pasos. Esa es la innovación técnica declarada: el resultado no se genera, se computa y se contrasta.

No hay datos públicos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni sobre si se aplicaron RLHF, DPO u otras técnicas de alineación; tratándose de un motor determinista, esos procedimientos serían en todo caso ajenos al diseño declarado. El autor sí documenta un paquete de conocimiento versionado (1.0.1) y un conjunto de 602 respuestas doradas reproducidas de forma idéntica en Windows y Linux sobre cinco versiones de Python. La evaluación incluida en el repositorio (`/evaluation`) y la guía de capacidades (`/docs`) son las fuentes donde debería verificarse el alcance real; la model card disponible está truncada al final, en un ejemplo de flujo radial de Darcy, por lo que la enumeración completa de capacidades no puede confirmarse aquí.

## Capacidades

- Resolución de problemas de ingeniería química en inglés con salida estructurada: resultado, pasos, fórmula en LaTeX, unidades, supuestos y modelo empleado.
- Balances de materia y energía, incluida combustión con exceso de aire y cálculo de gases de combustión.
- Diseño y análisis de reactores: CSTR de primer orden (volumen, tiempo de residencia, conversión) y reactor de flujo pistón.
- Separaciones: destilación con método de McCabe-Thiele, absorción, extracción líquido-líquido y cálculo de flash.
- Termodinámica de equilibrio: coeficientes de actividad, ecuaciones de estado, puntos de burbuja y rocío (por ejemplo, ley de Raoult con Antoine y base log10).
- Transporte y lechos empaquetados; control de procesos con PID; curvas de declive en ingeniería de petróleo y yacimientos.
- Interfaz doble: `ask()` para formas de pregunta documentadas en lenguaje natural y `solve()` como interfaz tipada garantizada.
- Siete estados de salida explícitos que evitan respuestas silenciosas incorrectas, con rechazo motivado cuando faltan datos.
- Tareas de sentence similarity y feature extraction mediante los pesos ONNX, útiles para clasificar o emparejar enunciados.
- Ejecución offline en CPU, reproducible entre plataformas, sin dependencia de servicios externos.
- No disponible: generación de texto libre, visión, audio, tool calling nativo de un LLM, razonamiento multi-paso abierto o modo "thinking". El soporte de agentes solo es viable de forma externa, tratando el motor como una herramienta determinista invocada por otro sistema.

## Casos de uso

- Docencia y corrección automática de problemas: el motor devuelve pasos, fórmulas en LaTeX y supuestos, de modo que un corrector puede comparar no solo el resultado numérico sino el procedimiento, con la ventaja de que la salida es idéntica en cada ejecución y plataforma.
- Verificación cruzada de hojas de cálculo de diseño: ante un volumen de CSTR o un número de etapas de destilación obtenido en Excel o en un simulador, una llamada a `solve()` con los mismos datos sirve como comprobación independiente y trazable.
- Automatización de memorias de cálculo: integrado en un pipeline de Python que recorra un listado de casos (caudales, constantes cinéticas, composiciones), genera resultados con unidades y LaTeX listos para incorporar a un documento técnico.
- Entornos de planta sin conectividad: al ejecutarse solo en CPU y sin red, puede desplegarse en un equipo de sala de control o en una máquina air-gapped para consultas puntuales de equilibrio y balances.
- Herramienta determinista dentro de un agente: un LLM interpreta la pregunta del usuario, extrae los datos y llama al solver para el cálculo, reservando la parte generativa para la conversación y la parte simbólica para la aritmética verificable.
- Clasificación y enrutado de enunciados: usando los pesos ONNX en tareas de sentence similarity o feature extraction, se puede dirigir una consulta entrante hacia el procedimiento adecuado o detectar que está fuera de alcance antes de invocar el solver.
- Ingeniería de petróleo: ajuste de curvas de declive y cálculos de flujo radial de Darcy para estimaciones preliminares en yacimientos, con la salvedad de que la model card está truncada en ese ejemplo y no permite confirmar todos los parámetros soportados.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del `model-index` de la model card, es decir, son resultados declarados por el autor y no verificados de forma independiente (`verified: false`).

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Question answering de ingeniería química | Golden answers (602 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy, "identical on every platform" | 1,0 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para comparaciones estándar de modelos de lenguaje. El conjunto de evaluación es de diseño propio (`ai999x-evaluation`) y mide reproducibilidad frente a respuestas doradas del propio autor, no capacidad general: un 1,0 indica que las 602 salidas coinciden exactamente entre plataformas, no que el sistema resuelva problemas arbitrarios de ingeniería química.

## Requisitos de hardware

- VRAM: no requiere GPU. Los 4,7 M de parámetros ocupan del orden de 18,9 MB en fp32 y 9,4 MB en fp16 (cálculo estimado a partir del recuento de parámetros, no publicado por el autor).
- RAM: no documentada. En la práctica el consumo vendrá dominado por el intérprete de Python y por sympy/mpmath, no por los pesos.
- GPU recomendadas: ninguna. Cualquier GPU consumer (RTX 4090, RTX 3060) puede alojar los pesos, pero no aporta ventaja frente a la CPU según el diseño declarado.
- Cabe en cualquier equipo consumer: sí, en CPU, incluidos portátiles modestos y contenedores sin acelerador.
- Opciones de despliegue: `pip install chemical-engineering-ai999x` desde PyPI o desde el wheel del repositorio; uso de los pesos vía ONNX Runtime o safetensors si se integran en otro pipeline de Python.
- Latencia y throughput: no disponibles. No se publican tiempos por consulta ni métricas de rendimiento.
- Nota operativa: el repositorio declara un tamaño de 0,0 GB, incoherente con un artefacto de 4,7 M de parámetros; conviene comprobar el contenido real del repositorio antes de planificar el despliegue.

## Comparativa con modelos similares

No hay modelos de lenguaje comparables en la información proporcionada. Las alternativas reales pertenecen a la categoría de librerías de cálculo de proceso, no de modelos neuronales, y sus datos no han sido verificados en esta búsqueda:

| Alternativa | Naturaleza | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chemical-engineering-ai999x | Motor determinista + pesos de 4,7 M | 4.715.520 | No disponible | Apache-2.0 | PyPI y Hugging Face |
| Cantera | Librería de cinética química y termodinámica | No aplica | No aplica | BSD 3-Clause (según conocimiento general) | Código abierto, Python/C++ |
| CoolProp | Librería de propiedades termofísicas de fluidos | No aplica | No aplica | MIT (según conocimiento general) | Código abierto, Python/C++ |
| DWSIM | Simulador de procesos químicos con interfaz gráfica | No aplica | No aplica | GPL-3.0 (según conocimiento general) | Código abierto, Windows/Linux |

La diferencia de planteamiento es sustancial: Cantera, CoolProp y DWSIM ofrecen modelos fisicoquímicos de amplia cobertura y comunidades extensas, mientras que este artefacto apuesta por un conjunto cerrado de 91 procedimientos con rechazo explícito y salida didáctica. Para un LLM generativo de propósito general, la comparación no es pertinente: aquí no hay generación de texto ni conocimiento abierto.

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve los 91 procedimientos certificados. Cualquier problema fuera de ese conjunto devuelve OUT_OF_SCOPE, no una aproximación.
- Idioma: únicamente inglés. No se documenta soporte de castellano ni de otras lenguas, ni en la entrada ni en la salida.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no dispone de ventana de contexto en el sentido habitual.
- Evaluación no independiente: el 1,0 de accuracy procede de 602 preguntas doradas definidas por el propio autor, con `verified: false`. Mide reproducibilidad, no corrección frente a un estándar externo.
- La afirmación "zero wrong answers" y el rechazo en lugar de conjetura son propiedades declaradas por el autor, no auditadas de forma externa.
- Riesgo de alucinación bajo por diseño en la capa simbólica, pero no nulo en la fase de interpretación del enunciado: un parseo erróneo de unidades o magnitudes puede producir un cálculo internamente coherente y equivocado respecto a la intención del usuario. La comprobación dimensional mitiga, no elimina, este riesgo.
- Sesgos: no se documenta ninguna evaluación de sesgos. Al ser un motor de cálculo, el riesgo relevante no es social sino de supuestos implícitos en las correlaciones y constantes empacadas.
- Dependencia de versiones: el comportamiento depende de sympy y mpmath; cambios en estas librerías pueden alterar resultados, aunque el autor declara invariancia entre Python 3.10 y 3.14.
- Licencia Apache-2.0: permisiva para uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio y las licencias de las dependencias antes de embeberlo en un producto.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, versión 1.0.0 y un único autor. La model card está truncada, lo que impide confirmar el listado completo de capacidades y ejemplos.
- Sin datos de latencia, throughput ni consumo de memoria publicados, lo que dificulta dimensionar un servicio en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AI999X/chemical-engineering-ai999x
- PyPI: https://pypi.org/project/chemical-engineering-ai999x/
- Guía de capacidades (docs del repositorio): https://huggingface.co/AI999X/chemical-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/chemical-engineering-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Wheel de instalación directa: https://huggingface.co/AI999X/chemical-engineering-ai999x/resolve/main/dist/chemical_engineering_ai999x-1.0.0-py3-none-any.whl
