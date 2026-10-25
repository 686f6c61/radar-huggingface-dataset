# AI999X/aerospace-engineering-ai999x

## Resumen

`aerospace-engineering-ai999x` es un paquete de Python publicado en Hugging Face por la organización AI999X (autor: Ibnul Jaif Farabi, versión 1.0.0) que resuelve problemas de ingeniería aeroespacial de forma determinista. A pesar de su empaquetado como modelo (etiquetas `safetensors`, `onnx`, recuento de 4.715.520 parámetros y *pipeline* `question-answering`), la propia *model card* lo describe como un motor neuro-simbólico: un analizador de reglas que interpreta la pregunta en inglés y delega el cálculo en 80 procedimientos simbólicos certificados (sympy, mpmath), sin pesos neuronales que se infieran en el sentido habitual. Conviene leerlo, por tanto, como una librería de cálculo de ingeniería con interfaz en lenguaje natural, no como un LLM generativo.

El problema que aborda es el de la fiabilidad en cálculos técnicos: cada respuesta se computa y se verifica (por sustitución inversa, análisis dimensional o cálculo independiente) antes de devolverse, y el sistema declara explícitamente siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de improvisar. Devuelve pasos, fórmulas en LaTeX, unidades y supuestos, lo que lo hace apto para cuadernos, tutoría y corrección de ejercicios. Se ejecuta íntegramente en CPU, sin GPU, sin red y sin clave de API.

Su relevancia actual es la reproducibilidad: el autor declara 369 respuestas documentadas idénticas en Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14), bajo licencia Apache-2.0. No obstante, el modelo tiene 0 descargas y 0 *likes*, la métrica de accuracy figura con `verified: false` y el repositorio ocupa 0.0 GB, por lo que no existe validación independiente de esas cifras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de la pregunta basada en reglas + 80 capacidades simbólicas certificadas (sympy, mpmath). No es un transformer ni un modelo autorregresivo |
| Parametros totales | 4.715.520 (según metadatos de safetensors); la *model card* no describe pesos neuronales, por lo que la cifra no es interpretable como parámetros de una red |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; no aplica (no hay ventana de contexto autorregresiva) |
| Tipos de cuantizacion | No disponible; no aplica (paquete Python puro, sin pesos que cuantizar) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` y `onnx` declarados en las etiquetas; distribución real como *wheel* de Python (`aerospace_engineering_ai999x-1.0.0-py3-none-any.whl`) y paquete en PyPI. Tamaño del repositorio: 0.0 GB |
| Versión | 1.0.0 (knowledge pack 1.0.1) |
| Capacidades certificadas | 80 procedimientos |
| Respuestas doradas | 369 respuestas documentadas |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Runtime | CPU únicamente, offline; sin GPU, sin red, sin clave de API |
| Inferencia | `inference: false` declarado en la *model card* (se usa como librería, no como endpoint de inferencia) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido de aprendizaje automático: no se documentan tokens de entrenamiento, composición de dataset, RLHF ni DPO. La arquitectura es un *front-end* determinista de análisis de la consulta (formas de pregunta documentadas y llamadas tipadas) acoplado a un paquete de conocimiento versionado (1.0.1) que implementa 80 procedimientos de ingeniería aeroespacial. Cada procedimiento calcula el resultado de forma exacta o con precisión arbitraria (mpmath) y lo valida mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente antes de emitir la respuesta.

La innovación destacable no es algorítmica sino de diseño de fiabilidad: el sistema hace explícita su incertidumbre en siete estados y prefiere el rechazo a la respuesta no verificada, lo que el autor resume como «cero respuestas incorrectas por diseño». La contrapartida es que la cobertura está limitada a las 80 capacidades certificadas y a las formas de pregunta documentadas; cualquier consulta fuera de ese conjunto devuelve `OUT_OF_SCOPE` o `UNRECOGNIZED_FORMAT`. La *model card* proporcionada está truncada en el bloque de *quickstart*, por lo que no se dispone del listado completo de capacidades ni de la API íntegra.

## Capacidades

- Cálculo de la atmósfera estándar (ISA): temperatura, presión, densidad y velocidad del sonido a una altitud dada, con validación de unidades.
- Velocidades aerodinámicas: conversión entre CAS, TAS y Mach, presión dinámica de impacto y número de Mach a partir de altitud de presión.
- Flujo compresible y ondas de choque: relaciones de choque normal (M2, p2/p1, T2/T1, rho2/rho1), flujo isoentrópico y condiciones de estancamiento.
- Toberas y propulsión por cohete: geometría de tobera, condiciones de garganta y salida, empuje y flujo másico.
- Rendimiento y etapado de cohetes: ecuación de Breguet, fracción de masa, etapas múltiples y delta-v.
- Rendimiento de aeronaves: alcance, autonomía, relaciones sustentación/resistencia y actuaciones en vuelo.
- Estabilidad estática, perfiles alares, alas y hélices: parámetros geométricos y aerodinámicos asociados.
- Órbitas y reentrada: mecánica orbital, transferencias orbitales y condiciones de reentrada.
- Interfaz dual: `ask()` acepta preguntas en inglés documentado; `solve(capability_id, **inputs)` garantiza la resolución tipada cuando la entrada es válida.
- Trazabilidad de la respuesta: pasos, fórmulas en LaTeX, unidades, supuestos y el modelo o procedimiento empleado.
- Gestión explícita de fallos con siete estados de salida, sin adivinar.
- Ejecución offline y determinista en CPU, con resultados idénticos entre plataformas.
- Etiquetas declaradas adicionales de token classification, text classification, sentence similarity y feature extraction, sin evidencia en la *model card* de cabezas neuronales que las respalden.

## Casos de uso

- Docencia universitaria de aerodinámica y propulsión: el alumno plantea «ISA properties: h = 35000 ft» y obtiene T, p, rho y a con pasos y unidades, lo que permite verificar el procedimiento a mano en lugar de solo el resultado.
- Corrección automática de ejercicios: con 369 respuestas doradas y salida determinista, un corrector puede comparar la respuesta del estudiante contra un valor reproducible y mostrar la discrepancia con supuestos explícitos.
- Cuadernos reproducibles de ingeniería: al ser Python puro sobre CPU y sin red, se integra en Jupyter o en un contenedor de CI sin dependencias de GPU ni claves de API, garantizando los mismos números en cada ejecución.
- Precomprobación de cálculos en fases preliminares de diseño: cálculos de choque normal, tobera o Breguet como referencias rápida y auditable antes de pasar a un solver numérico de mayor fidelidad.
- Entornos con requisitos de confidencialidad o air-gapped: al no realizar llamadas de red ni requerir servicio externo, los datos de la consulta no salen de la máquina, algo inviable con un LLM alojado.
- Generación de material didáctico y bancos de problemas: uso de la salida LaTeX con pasos para construir soluciones explicadas y rúbricas homogéneas.
- Validación cruzada de un LLM generativo: usar este motor como oráculo determinista en un pipeline donde un modelo de lenguaje redacte y este paquete compruebe los valores numéricos antes de publicar.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la *model card*. No hay resultados de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

| Tarea | Conjunto de evaluación | Métrica | Valor | Estado |
|---|---|---|---|---|
| Question answering de ingeniería aeroespacial | Golden answers (369 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 | `verified: false` |

El valor 1.0 corresponde a que las 369 respuestas documentadas se reproducen de forma idéntica en todas las plataformas probadas, no a una evaluación sobre preguntas no vistas. No se han publicado resultados de benchmarks independientes ni conjuntos de evaluación abiertos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica. El motor se ejecuta exclusivamente en CPU; no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU capaz de ejecutar Python 3.10-3.14 es suficiente.
- GPU de consumo: irrelevante para este paquete; no hay ruta de despliegue en GPU documentada.
- Memoria RAM: no disponible en la información proporcionada; el repositorio ocupa 0.0 GB y las dependencias declaradas son sympy y mpmath, de huella reducida.
- Opciones de despliegue: `pip install aerospace-engineering-ai999x` desde PyPI o instalación directa del *wheel* alojado en el repositorio de Hugging Face. No aplican vLLM, llama.cpp, Ollama ni TGI al no existir pesos de inferencia neuronal.
- Latencia y throughput: no disponibles. Al ser cálculo simbólico determinista en CPU, la latencia dependerá del procedimiento concreto y de la precisión solicitada, sin datos publicados.
- Sistemas operativos validados: Windows (Python 3.13) y Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14). macOS no figura entre las plataformas probadas.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables publicados en la información proporcionada. La comparación siguiente es de categoría, no de rendimiento medido:

| Criterio | aerospace-engineering-ai999x | LLM de propósito general (p. ej. familia Llama/Qwen) | Sistema de álgebra computacional (CAS) |
|---|---|---|---|
| Naturaleza | Reglas + procedimientos simbólicos certificados | Red neuronal autorregresiva | Motor simbólico sin interfaz en lenguaje natural |
| Parámetros | 4.715.520 declarados (no interpretables como red) | Miles de millones (no disponible aquí) | No aplica |
| Contexto | No aplica; entradas documentadas | Ventana de miles a cientos de miles de tokens | No aplica |
| Dominio | Aeroespacial, 80 procedimientos | Abierto, con riesgo de alucinación | Matemáticas generales |
| Respuesta ante lo desconocido | Rechazo explícito (7 estados) | Generación plausible no verificada | Error o sin solución |
| Ejecución | CPU, offline, determinista | Requiere GPU o servicio externo | CPU, offline, determinista |
| Licencia | Apache-2.0 | Variables según modelo | Variables según proyecto |
| Validación independiente | No disponible (0 descargas, métrica `verified: false`) | Amplia en modelos populares | Amplia |

## Limitaciones y advertencias

- Solo inglés: todas las formas de pregunta documentadas están en inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Cobertura cerrada: únicamente 80 capacidades certificadas. Consultas legítimas de ingeniería aeroespacial fuera de ese conjunto devuelven `OUT_OF_SCOPE`; no es un asistente conversacional general.
- No es un modelo generativo: no redacta explicaciones libres ni mantiene diálogo multiturno; produce resultados estructurados con pasos.
- Ausencia de validación independiente: 0 descargas y 0 *likes* en Hugging Face, y la métrica de accuracy está marcada como `verified: false` por el propio autor. El 1.0 se refiere a reproducibilidad sobre 369 respuestas conocidas, no a generalización.
- Inconsistencias de metadatos: las etiquetas `onnx` y `safetensors`, el recuento de 4.715.520 parámetros y las tareas de token/text classification no están respaldados por la *model card*; el tamaño del repositorio (0.0 GB) es incompatible con el almacenamiento de pesos de ese volumen. La *model card* está truncada en el ejemplo de `quickstart`, por lo que la API completa no está verificada.
- `inference: false` declarado: no hay endpoint de inferencia en Hugging Face; el uso requiere instalar el paquete.
- Fecha de creación en los metadatos (2026-10-25) posterior a la fecha actual de consulta, lo que apunta a un error de metadatos o a una publicación con marca temporal alterada.
- Riesgo de uso indebido en ingeniería real: los resultados son verificados internamente por el propio sistema, pero no sustituyen la validación por un ingeniero colegiado ni la certificación normativa (p. ej. FAR/CS-25). No usar como única fuente en decisiones de diseño críticas.
- Sin garantías: Apache-2.0 se distribuye «tal cual», sin garantía implícita de adecuación a un propósito concreto.
- macOS y otras plataformas no figuran entre las probadas; el comportamiento fuera de Windows y Linux x86-64 no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/aerospace-engineering-ai999x
- Paquete en PyPI: https://pypi.org/project/aerospace-engineering-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/aerospace-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/aerospace-engineering-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del autor: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- *Wheel* de instalación directa: https://huggingface.co/AI999X/aerospace-engineering-ai999x/resolve/main/dist/aerospace_engineering_ai999x-1.0.0-py3-none-any.whl
