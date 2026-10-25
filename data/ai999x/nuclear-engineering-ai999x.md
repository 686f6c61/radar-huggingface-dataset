# AI999X/nuclear-engineering-ai999x

## Resumen

`nuclear-engineering-ai999x` es un motor de resolución de problemas de ingeniería nuclear escrito en Python por Ibnul Jaif Farabi (organización AI999X). A pesar de estar publicado en Hugging Face con `pipeline_tag: question-answering` y pesos en `safetensors`/ONNX de 4.715.520 parámetros, **no es un modelo de lenguaje generativo**: es un solver determinista neuro-simbólico que interpreta la pregunta en inglés mediante reglas, selecciona una de sus 83 capacidades certificadas, calcula el resultado con aritmética simbólica (sympy, mpmath), lo verifica y devuelve la respuesta junto con pasos, unidades, LaTeX y supuestos. Cuando no puede verificar, rechaza explícitamente en lugar de estimar.

El problema que aborda es el de la fiabilidad en un dominio de alto riesgo: en lugar de generar texto plausible sobre física de reactores o dosimetría, el sistema expone siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y garantiza reproducibilidad bit a bit en Windows y Linux sobre Python 3.10 a 3.14. Su cobertura declarada incluye cadenas de decaimiento y ecuaciones de Bateman, blindaje y dosimetría con factor de buildup, detectores y estadística de conteo, moderación de neutrones, criticidad y cinética de reactores, venenos de productos de fisión, enriquecimiento y agotamiento de combustible, y transferencia de calor en barra de combustible.

Es relevante ahora por su propuesta de valor opuesta a la de los LLM: ejecución 100 % offline en CPU, sin GPU, sin clave de API y sin red, con API tipada (`solve(capability_id, **inputs)`) además de lenguaje natural (`ask()`). El proyecto es muy reciente (creado el 25 de octubre de 2026), no tiene descargas ni valoraciones, y su única métrica publicada es autodeclarada y no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura basada en reglas + 83 capacidades simbólicas certificadas (no es un transformer generativo) |
| Parametros totales | 4.715.520 (dato real de los safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no mantiene contexto conversacional ni ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; pesos en safetensors y ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Version | 1.0.0 (knowledge pack 1.0.1) |
| Capacidades certificadas | 83 procedimientos |
| Respuestas doradas | 554 respuestas documentadas |
| Runtime | CPU only, offline; sin GPU, sin red, sin clave de API |
| Dependencias | sympy, mpmath (Python puro) |
| Plataformas probadas | Windows (Python 3.13), Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Inferencia en Hugging Face | deshabilitada (`inference: false`) |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es neuro-simbólica híbrida: una capa de lectura de lenguaje natural basada en reglas reconoce formas de pregunta documentadas y las mapea a una capacidad concreta; a partir de ahí, un núcleo simbólico (sympy y mpmath) resuelve el problema de forma exacta. No hay un transformer decoder, ni atención, ni decodificación especulativa. El paquete pesa 4.715.520 parámetros según los safetensors publicados, un orden de magnitud propio de un modelo encoder pequeño o de artefactos de serialización, no de un LLM. Cada respuesta se verifica antes de devolverse mediante tres mecanismos declarados: sustitución inversa del resultado en la ecuación original, comprobación dimensional o comparación con un cálculo independiente.

No se ha publicado información sobre volumen de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste fino supervisado, porque el sistema no se entrena con ese paradigma: su conocimiento reside en 83 procedimientos certificados y un knowledge pack versionado (1.0.1). La innovación técnica destacable no es algorítmica sino de ingeniería de fiabilidad: determinismo multiplataforma verificado, salidas tipadas (siete estados posibles en lugar de texto libre) y una interfaz doble que combina `ask()` en inglés con `solve(capability_id, **inputs)` de firma garantizada. La model card declara explícitamente `inference: false`, lo que confirma que el repositorio se distribuye como paquete instalable (rueda `py3-none-any` vía PyPI), no como endpoint servible.

## Capacidades

- Resolución determinista de problemas de ingeniería nuclear en ocho áreas: decaimiento radiactivo y actividad, blindaje y dosimetría, detectores y conteo, física de neutrones, criticidad y cinética de reactores, venenos de productos de fisión, agotamiento y enriquecimiento de combustible, y transferencia de calor en barra de combustible.
- Interpretación de preguntas en inglés en formas documentadas (por ejemplo, `"Specific activity: nuclide = Co-60, m = 1 g"`).
- Interfaz tipada `solve(capability_id, **inputs)` que garantiza resolución para toda tarea soportada con entradas válidas.
- Explicabilidad integrada: pasos intermedios, fórmulas en LaTeX, unidades, supuestos y modelo físico empleado en cada respuesta.
- Gestión explícita de errores con siete estados (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR); rechazo en lugar de estimación cuando falta un dato.
- Ejecución 100 % offline en CPU, apta para entornos air-gapped.
- Reproducibilidad determinista: las 554 respuestas documentadas se reproducen de forma idéntica en Windows y Linux sobre Python 3.10-3.14.
- No soporta: generación de texto libre, visión, audio, tool calling mediante protocolos estándar (la interfaz es una API Python, no JSON-Schema/OpenAI tools), razonamiento multi-paso abierto, conversación multi-turno ni idiomas distintos del inglés.

## Casos de uso

- **Corrección automática de ejercicios académicos**: el modo `ask()` acepta enunciados en inglés con el formato documentado y devuelve la solución con pasos y fórmulas en LaTeX, lo que permite generar hojas de corrección y detectar discrepancias en las entregas de los alumnos sin riesgo de que el sistema "invente" un resultado plausible.
- **Cálculo de actividad específica y activación**: resolución de casos como Co-60 con 1 g de masa (A = 4,18689e+13 Bq; 1131,59 Ci) para caracterización radiológica de fuentes en laboratorio o en gestión de residuos, con conversión de unidades incluida.
- **Blindaje y estimación de tasa de dosis**: cálculo de dosis para fuente puntual incorporando coeficiente de atenuación y factor de buildup (`nuc_point_source_dose_rate`), aplicable a evaluaciones preliminares de salas de fuentes y a la docencia de protección radiológica.
- **Criticidad y tamaño crítico**: resolución de configuraciones geométricas simples (por ejemplo, esfera crítica con extrapolación 2,13D) para ejercicios de física de reactores y comprobaciones de orden de magnitud en formación de operadores.
- **Detección de radiación y estadística de conteo**: cálculo de tiempo muerto y propagación de incertidumbre en medidas, útil para validar procedimientos de conteo en laboratorios docentes y para estandarizar cálculos entre turnos.
- **Inventario de productos de fisión y cadenas de decaimiento**: resolución de cadenas mediante ecuaciones de Bateman y cálculo de actividad acumulada, aplicable a estimaciones de término fuente en ejercicios de análisis de accidentes.
- **Validación cruzada de código propio**: la API tipada permite usar el solver como oráculo en tests unitarios (`pytest`) de herramientas internas de cálculo nuclear, comparando resultados con tolerancias explícitas.
- **Despliegue en planta o instalación air-gapped**: al no requerir red ni GPU y ser una rueda Python pura, puede instalarse en estaciones de trabajo aisladas donde no está permitido el acceso a APIs de terceros.
- **Herramienta determinista dentro de un pipeline mayor**: el par `capability_id` + entradas tipadas actúa como función pura invocable desde un orquestador, sin los riesgos de variabilidad de un LLM en la misma tarea.

## Benchmarks y rendimiento

Los únicos datos disponibles son los autodeclarados por el autor en el `model-index` de la model card. No hay resultados en MMLU, HumanEval, GSM8K ni en suites independientes.

| Tarea | Conjunto de evaluacion | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingenieria nuclear | Golden answers (554 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy | 1,0 | No (`verified: false`) |

Dos advertencias sobre esta cifra: el conjunto de evaluación (`ai999x-evaluation`) está definido por el propio autor y las 554 preguntas son exactamente las respuestas documentadas que el sistema ya contiene, por lo que la métrica mide reproducibilidad de casos conocidos, no generalización a preguntas nuevas. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- **VRAM**: 0 GB. El sistema no utiliza GPU en ningún caso; la model card declara explícitamente ejecución CPU only.
- **Memoria del sistema**: los pesos declarados (4.715.520 parámetros) ocupan aproximadamente 18,9 MB en fp32 como archivo safetensors; el consumo real en ejecución depende del intérprete de Python y de sympy/mpmath y no está publicado (no disponible).
- **GPU recomendadas**: ninguna. No aplica A100, H100 ni RTX 4090; el solver no aprovecharía ninguno de estos aceleradores.
- **Consumer GPU**: irrelevante por diseño; funciona en cualquier CPU x86-64 o ARM con Python 3.10-3.14.
- **Opciones de despliegue**: instalación como paquete Python (`pip install nuclear-engineering-ai999x`) o desde la rueda del repositorio de Hugging Face; invocación desde scripts, notebooks, servicios Python o contenedores. No soporta vLLM, llama.cpp, Ollama ni TGI, y el endpoint de inferencia de Hugging Face está deshabilitado (`inference: false`).
- **Latencia y throughput**: no disponibles. Al ser cálculo simbólico, la latencia dependerá de la complejidad de cada capacidad concreta (resolución de ecuaciones frente a evaluación directa) y no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la información proporcionada. La categoría del artefacto (solver determinista de dominio cerrado) no es directamente equiparable a la de un LLM, por lo que una comparación numérica exigiría benchmarks comunes que no existen.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuclear-engineering-ai999x | Solver neuro-simbólico determinista | 4.715.520 | no aplica | Apache-2.0 | PyPI + Hugging Face |
| LLM generativo de gran tamano (7B-70B) instruido para ciencia | Generativo, texto libre | no disponible | no disponible | no disponible | no disponible |
| Codigo de simulacion neutronica (Monte Carlo / difusion) | Simulacion numerica | no disponible | no aplica | no disponible | no disponible |

Diferencias cualitativas relevantes: frente a un LLM, este solver ofrece determinismo y trazabilidad de pasos, pero carece de generalidad y de conversación; frente a un código de simulación, ofrece respuestas instantáneas en CPU y explicaciones didácticas, pero no resuelve geometrías complejas ni transporte neutrónico real. Cualquier elección entre estas opciones depende del caso de uso, no del rendimiento medido.

## Limitaciones y advertencias

- **La métrica de accuracy 1,0 no está verificada** (`verified: false`) y se calcula sobre 554 preguntas que coinciden con las respuestas documentadas del propio sistema; no es evidencia de generalización.
- **Alcance cerrado**: solo resuelve las 83 capacidades certificadas. Cualquier problema fuera de ese conjunto devuelve OUT_OF_SCOPE, y las variaciones de enunciado no documentadas pueden caer en UNRECOGNIZED_FORMAT.
- **Solo inglés**: las formas de pregunta documentadas están en inglés; no hay soporte de castellano ni de otros idiomas.
- **No es un modelo de lenguaje**: no genera explicaciones abiertas, no mantiene contexto entre llamadas, no razona sobre problemas no modelados y no admite tool calling por protocolos estándar.
- **Riesgo de error en los datos de entrada**: el determinismo garantiza reproducibilidad, no corrección; si el usuario introduce una sección eficaz o un coeficiente incorrecto, la verificación interna (sustitución inversa, comprobación dimensional) no lo detectará.
- **Dominio de alto riesgo**: ingeniería nuclear y protección radiológica son áreas safety-critical. Los resultados no deben usarse para decisiones de licenciamiento, diseño de blindaje real, análisis de seguridad o cumplimiento regulatorio sin validación por personal cualificado y contra normas aplicables (no se documenta conformidad con estándares de IAEA ni de ningún regulador).
- **Madurez y validación comunitaria**: 0 descargas y 0 likes; proyecto de un solo autor, creado y actualizado en octubre de 2026; sin publicaciones revisadas por pares ni auditoría externa citadas.
- **Licencia Apache-2.0**: permite uso comercial y modificación, con obligación de conservar el aviso de copyright y la licencia, y de indicar cambios; no incluye garantías ni cesión de patentes más allá de lo estipulado en la propia licencia.
- **Trazabilidad del benchmark limitada**: no se publica la metodología de las 554 preguntas ni el desglose por capacidad, por lo que no puede estimarse la cobertura real por área.
- **Sin soporte de inferencia gestionada**: `inference: false` implica que no puede probarse desde el widget de Hugging Face; requiere instalación local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/nuclear-engineering-ai999x
- Paquete en PyPI: https://pypi.org/project/nuclear-engineering-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/nuclear-engineering-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/nuclear-engineering-ai999x/tree/main/evaluation
- Organización AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web del proyecto: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Rueda de instalación directa: https://huggingface.co/AI999X/nuclear-engineering-ai999x/resolve/main/dist/nuclear_engineering_ai999x-1.0.0-py3-none-any.whl
- Paper técnico: no disponible
- Repositorio de código independiente o demo interactiva: no disponible
