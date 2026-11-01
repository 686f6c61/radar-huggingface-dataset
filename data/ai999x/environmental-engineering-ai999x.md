# AI999X/environmental-engineering-ai999x

## Resumen

`environmental-engineering-ai999x` es un motor de resolución de problemas de ingeniería ambiental desarrollado por AI999X (autor: Ibnul Jaif Farabi) y publicado bajo licencia Apache-2.0. No es un modelo de lenguaje generativo en el sentido habitual: se presenta como un sistema neuro-simbólico determinista que interpreta preguntas en inglés mediante reglas y resuelve problemas con 99 procedimientos simbólicos certificados, devolviendo el resultado junto con pasos, unidades, LaTeX y supuestos, o bien una negativa explícita cuando no puede verificar la respuesta.

El paquete contiene 4.715.520 parámetros declarados en safetensors y se distribuye también como wheel de Python (`environmental_engineering_ai999x` 1.0.0), con pesos en formato ONNX y safetensors. Su propuesta central es la ausencia de alucinación por diseño: siete estados de salida explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) sustituyen a la generación libre de texto. La model card declara 613 respuestas documentadas reproducidas de forma idéntica en Windows y Linux con Python 3.10 a 3.14.

Es relevante para docentes, estudiantes y desarrolladores de herramientas educativas que necesitan respuestas trazables y verificables en dominios técnicos concretos (dispersión atmosférica, calidad del agua, tratamiento de aguas residuales, transferencia de gases, ruido y residuos sólidos) sin depender de GPU, red ni claves de API. El modelo está marcado con `inference: false` en su model card y su pipeline no está disponible en HuggingFace, por lo que su uso previsto es la librería Python y las aplicaciones de escritorio/CLI del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista (lectura basada en reglas + 99 capacidades simbólicas certificadas); no es un transformer generativo |
| Parametros totales | 4.715.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (interfaz de preguntas documentadas y llamadas tipadas, no ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura combina un componente de lectura de preguntas en inglés basado en reglas con un conjunto de 99 procedimientos simbólicos certificados que cubren dispersión de contaminantes atmosféricos (modelo gaussiano de penacho, elevación de penacho de Briggs), calidad del agua y modelo de oxígeno disuelto de Streeter-Phelps, diseño de fangos activados, tratamiento de aguas y residuales, transferencia de gases, ruido y residuos sólidos. Cada resultado se verifica antes de devolverse mediante sustitución inversa, comprobación dimensional o comparación con un cálculo independiente.

El paquete se apoya en `sympy` y `mpmath` como dependencias simbólicas y numéricas, y se ejecuta exclusivamente en CPU, sin GPU, sin red y sin clave de API. No se han publicado en la información disponible datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; dado que el sistema es determinista y simbólico, el término "entrenamiento" no aplica en el sentido convencional. La innovación técnica destacable es el contrato de siete salidas explícitas y la política de rechazo ante incertidumbre, junto con la reproducibilidad exacta entre plataformas (Windows con Python 3.13 y Linux x86-64) declarada por el autor.

## Capacidades

- Resolución de problemas de ingeniería ambiental con pasos intermedios, fórmulas en LaTeX, unidades y supuestos declarados.
- Interfaz en lenguaje natural acotada: `ask()` reconoce formas de pregunta documentadas.
- Interfaz tipada garantizada: `solve(capability_id, **inputs)` resuelve siempre una tarea soportada con entradas válidas.
- Verificación interna de resultados (sustitución inversa, comprobación dimensional, cálculo independiente).
- Rechazo explícito ante entradas ambiguas, incompletas, inválidas o fuera de alcance, en lugar de generar una respuesta plausible.
- Cobertura declarada: dispersión de contaminación atmosférica, calidad del agua, tratamiento de agua y aguas residuales, transferencia de gases, ruido y residuos sólidos.
- Generación de salida lista para cuadernos, aplicaciones de tutoría y correctores de ejercicios (pasos, LaTeX, unidades).
- Ejecución offline en CPU, sin GPU, sin red y sin clave de API.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso abierto, visión, audio ni modo thinking.

## Casos de uso

- Tutoría de ingeniería ambiental: un estudiante plantea un problema de oxígeno disuelto con Streeter-Phelps y el motor devuelve el déficit, la concentración de oxígeno, los pasos y las unidades, lo que permite revisar el procedimiento en lugar de solo el resultado.
- Corrección automática de ejercicios: un corrector compara la respuesta del alumno con la salida determinista del motor para una misma entrada, eliminando la variabilidad de un LLM generativo en la evaluación.
- Cálculo de dispersión atmosférica en evaluación preliminar: con `enveng_gaussian_plume_concentration` o `enveng_briggs_plume_rise` se obtienen concentraciones y elevaciones de penacho reproducibles para informes docentes o de screening.
- Diseño preliminar de fangos activados: el ejemplo de mezcla completa con SRT, HRT, Y, k, Ks y kd devuelve la concentración de sustrato efluente y los parámetros de diseño asociados, útil en asignaturas de tratamiento de aguas.
- Herramienta de escritorio o CLI para profesionales en campo sin conectividad: al ejecutarse offline en CPU, puede desplegarse en portátiles o equipos de borde sin GPU ni acceso a internet.
- Integración en pipelines educativos y notebooks: la API `solve(capability_id, **inputs)` permite generar conjuntos de problemas y soluciones verificadas de forma programática para plataformas de e-learning.
- Verificación cruzada en revisión de cálculos: dado un resultado introducido manualmente, el motor recalcula y señala discrepancias, actuando como comprobador dimensional y numérico.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente; el campo `verified` es `false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (ingeniería ambiental) | Golden answers (613 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1.0 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de lenguaje de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el motor se ejecuta exclusivamente en CPU.
- GPU recomendadas: ninguna; no requiere GPU.
- Cabe en cualquier GPU consumer: sí, porque no la utiliza; el despliegue es en CPU.
- Opciones de despliegue: paquete Python (`pip install environmental-engineering-ai999x`), wheel desde el repositorio de HuggingFace, aplicación de escritorio y CLI del autor, y ejecución en navegador según los enlaces de la model card. Formatos de pesos safetensors y ONNX disponibles para integración.
- Latencia y throughput estimados: no disponible en la información proporcionada; el autor no publica cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| environmental-engineering-ai999x | Motor neuro-simbólico determinista | 4.715.520 | no disponible | Apache-2.0 | Dominio acotado, rechazo ante incertidumbre, offline en CPU |
| LLM generativo de propósito general (p. ej. familia Llama, Mistral, Qwen) | Transformer decoder | Miles de millones | Decenas de miles de tokens | Variable (a menudo permisiva) | Cobertura amplia, riesgo de alucinación, requiere GPU |
| Motores de álgebra simbólica (SymPy, Maxima) | Simbólico | no aplica | no aplica | BSD/GPL | Cálculo exacto sin interpretación de lenguaje natural |
| Solvers de dominio específico (p. ej. paquetes de calidad del aire) | Numérico/simbólico | no aplica | no aplica | Variable | Precisión de dominio sin interfaz conversacional |

La comparación directa con LLM generativos no es homogénea: este motor no compite en cobertura ni en generación libre, sino en trazabilidad, determinismo y coste de despliegue dentro de un dominio restringido. No se dispone de comparaciones publicadas por el autor frente a estas alternativas.

## Limitaciones y advertencias

- Cobertura restringida a 99 capacidades certificadas y a formas de pregunta documentadas; fuera de ese alcance devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- Solo idioma inglés (`language: en`); no se declara soporte de castellano ni de otros idiomas.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no admite contexto largo.
- La métrica de accuracy 1.0 procede de un conjunto de 613 preguntas documentadas del propio autor y está marcada como no verificada; no es una evaluación independiente ni representa el rendimiento en preguntas nuevas.
- El model card indica `inference: false` y el pipeline no está disponible en HuggingFace; el uso previsto es la librería Python y las aplicaciones del autor, no la inferencia estándar de HuggingFace.
- Riesgo de alucinación declarado como nulo por diseño, pero la garantía depende de la corrección de los 99 procedimientos simbólicos y de la verificación interna; no se han publicado auditorías externas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial con atribución y conservación del aviso de licencia; conviene revisar el archivo LICENSE del repositorio.
- Para producción: el proyecto tiene 0 descargas y 0 likes en el momento de la consulta, versión 1.0.0 y un único mantenedor; el riesgo de mantenimiento y de soporte a largo plazo es alto.
- El repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere que los pesos pueden no estar alojados íntegramente en el repo; verificar la disponibilidad de los artefactos antes de integrar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/environmental-engineering-ai999x
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Aplicación de escritorio y CLI: https://www.ai999x.com/desktop-cli/
- Ejecución en navegador: https://www.ai999x.com/models/environmental-engineering-ai999x/#try
- Paquete en PyPI: https://pypi.org/project/environmental-engineering-ai999x/
- Guías (docs en el repositorio): https://huggingface.co/AI999X/environmental-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/environmental-engineering-ai999x/tree/main/evaluation
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
