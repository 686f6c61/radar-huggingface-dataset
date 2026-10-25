# AI999X/economics-finance-ai999x

## Resumen

economics-finance-ai999x es un motor de resolución de problemas de economía y finanzas para Python, publicado por la organización AI999X (creador e ingeniero: Ibnul Jaif Farabi). No es un modelo generativo al uso: se presenta como un motor neuro-simbólico determinista que combina una capa de lectura de preguntas en inglés con 96 procedimientos certificados de cálculo simbólico (sympy, mpmath). El paquete pesa 4.715.520 parámetros en safetensors y se distribuye también en ONNX, con licencia Apache-2.0.

El problema que aborda es el de la fiabilidad numérica: en lugar de generar texto plausible, el sistema selecciona una capacidad certificada, calcula el resultado, lo verifica (sustitución inversa, comprobación dimensional o cálculo independiente) y devuelve la respuesta junto con pasos, unidades, LaTeX y supuestos. Si no puede verificar, emite un rechazo explícito entre siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en vez de aproximar.

Es relevante por su planteamiento de despliegue: funciona íntegramente offline sobre CPU, sin GPU, sin clave de API y sin red, y declara resultados idénticos en Windows y Linux sobre Python 3.10 a 3.14. Cubre valor temporal del dinero, préstamos y anualidades, bonos, acciones y opciones, teoría de carteras, medidas de riesgo, matemática actuarial, microeconomía, macroeconomía y econometría. La cobertura declarada es de 384 respuestas documentadas ("golden answers") reproducidas de forma exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de preguntas basada en reglas + 96 capacidades simbólicas certificadas (sympy, mpmath); no es un transformer generativo |
| Parametros totales | 4.715.520 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la interfaz es `ask()` sobre formas de pregunta documentadas y `solve(capability_id, **inputs)`; no se declara ventana de contexto) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el runtime es Python puro sobre CPU) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución adicional como wheel de Python (`economics_finance_ai999x-1.0.0-py3-none-any.whl`) |
| Version | 1.0.0 (knowledge pack 1.0.1) |
| Capacidades certificadas | 96 procedimientos |
| Respuestas doradas | 384 respuestas documentadas |
| Entorno de ejecucion | CPU únicamente, offline, sin GPU, sin red y sin clave de API |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13 y 3.14) |
| Tareas declaradas | Question answering, token classification, text classification, sentence similarity, feature extraction |
| Inferencia alojada en HF | No (`inference: false` en los metadatos de la model card) |

## Arquitectura y entrenamiento

La arquitectura no sigue el patrón transformer. Se describe como un motor neuro-simbólico compuesto por dos capas: una capa de lectura que interpreta preguntas en inglés llano o llamadas tipadas, y un conjunto de 96 capacidades simbólicas certificadas que realizan el cálculo exacto mediante sympy y mpmath. Cada respuesta se somete a una comprobación posterior —sustitución del resultado en la ecuación original, análisis dimensional o contraste con un cálculo independiente— antes de devolverse. El paquete incluye pesos en safetensors (4,7 M de parámetros) y una exportación ONNX, lo que sugiere componentes neuronales ligeros para las tareas de clasificación y similitud declaradas junto al núcleo simbólico.

No se ha publicado información sobre el proceso de entrenamiento: no se indica número de tokens, composición del corpus, ni si hubo RLHF, DPO o ajuste supervisado. La model card tampoco detalla el origen de los componentes neuronales ni la metodología de certificación de las 96 capacidades. Lo que sí se documenta es el mecanismo de garantía: siete estados de salida explícitos y un conjunto de evaluación de 384 respuestas doradas cuya reproducción exacta se verifica en cada plataforma soportada.

La innovación destacable no es algorítmica sino de diseño del contrato de salida: el sistema antepone el rechazo a la aproximación y expone trazabilidad completa (pasos, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada). Para el caso de uso financiero, esto convierte cada respuesta en un artefacto auditable.

## Capacidades

- Resolución de problemas de valor temporal del dinero: VAN, TIR y flujos de caja descontados. Ejemplo documentado: TIR de `[-1000, 300, 400, 500]` = 0,0889634.
- Cálculo de préstamos y anualidades: cuota, número de pagos, total pagado e intereses totales. Ejemplo documentado: principal 200.000, tipo anual 6 %, 30 años → cuota 1.199,1, 360 pagos, total pagado 431.676, intereses 231.676.
- Valoración de bonos: precio, rendimiento corriente y cupón a partir de valor nominal, cupón, años, TIR y frecuencia. Ejemplo documentado: nominal 1.000, cupón 5 %, 10 años, TIR 6 %, frecuencia 2 → precio 925,613 y rendimiento corriente 0,0540183.
- Valoración de opciones con Black-Scholes: precio de call y put más las componentes d1 y d2. Ejemplo documentado: spot 100, strike 100, t=1, r=0,05, volatilidad 0,2 → call 10,4506 y put 5,57353.
- Teoría de carteras y medidas de riesgo, incluida value-at-risk, según la cobertura declarada de 96 capacidades.
- Matemática actuarial y econometría.
- Microeconomía y macroeconomía.
- Interfaz dual: `ask()` para preguntas en inglés documentado y `solve(capability_id, **inputs)` como interfaz tipada garantizada.
- Explicabilidad integrada: pasos, fórmulas en LaTeX, unidades, supuestos y modelo utilizado en cada respuesta.
- Rechazo controlado ante entradas incompletas, ambiguas, inválidas o fuera de alcance, con indicación de lo que falta.
- Tareas auxiliares de clasificación de texto y tokens, similitud entre frases y extracción de características (según los tags y la model card).
- No soporta tool calling genérico, razonamiento multi-paso abierto, visión, audio ni modo "thinking" generativo.

## Casos de uso

- Corrección automática de ejercicios de finanzas: el sistema devuelve pasos, unidades y LaTeX, de modo que un profesor o una plataforma de e-learning puede comparar el procedimiento del alumno con el registrado y señalar en qué paso diverge, sin riesgo de que el corrector invente una solución.
- Tutoría con garantía de exactitud: en una aplicación de ayuda a deberes, el motor responde con una solución verificada o con una negativa explícita indicando qué dato falta, lo que evita el patrón habitual de un LLM que rellena huecos con cifras plausibles pero falsas.
- Motor de cálculo en entornos air-gapped: banca, aseguradoras o departamentos de riesgos con prohibición de salida a internet pueden desplegar el paquete vía `pip` y ejecutarlo en CPU, sin dependencia de servicios externos ni de claves de API.
- Guardarraíl numérico sobre un LLM: un asistente generativo redacta la explicación y delega el número final en `solve()`, de forma que la cifra publicada procede de un procedimiento certificado y no de una muestra del modelo de lenguaje.
- Automatización de back-office financiero: cálculo repetible de cuotas de préstamo, precios de bono y primas de opción dentro de un pipeline, con resultados idénticos entre entornos Windows y Linux, lo que simplifica la reproducibilidad entre desarrollo y producción.
- Material docente y documentación técnica: generación de enunciados resueltos con fórmulas en LaTeX listas para insertar en apuntes, notebooks o exámenes, incluyendo los supuestos del modelo utilizado.
- Análisis de riesgo y cálculos actuariales: obtención de medidas como VaR o valoraciones actuariales en informes internos donde se exige trazabilidad del procedimiento y de los supuestos.
- Pruebas de regresión de software financiero: las 384 respuestas doradas sirven como suite de referencia para validar que una refactorización del código de cálculo no altera los resultados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index`. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

| Tarea | Conjunto de evaluacion | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de economia y finanzas | Golden answers (384 preguntas documentadas; Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 (identico en todas las plataformas) | No (`verified: false`) |

Advertencia: se trata de una autoevaluación sobre un conjunto propio de 384 preguntas, definido por el mismo autor y no auditado de forma independiente. El valor 1,0 mide la reproducibilidad de respuestas ya documentadas, no la capacidad de resolver preguntas nuevas fuera de ese conjunto.

## Requisitos de hardware

- VRAM: 0 GB. El motor no requiere GPU; está diseñado para ejecutarse en CPU.
- Huella de pesos: 4,7 M de parámetros, aproximadamente 19 MB en fp32 y unos 9 MB en fp16, además de la exportación ONNX. Estimación propia a partir del recuento de parámetros.
- RAM: no se documenta cifra oficial. El proceso de Python con sympy y mpmath añade sobrecarga de intérprete; conviene reservar al menos unos cientos de MB por proceso. Estimación, no dato del autor.
- GPU recomendadas: ninguna. Cualquier CPU x86-64 moderna es suficiente; no se publican cifras de latencia ni de throughput.
- Compatibilidad consumer: cabe en cualquier equipo, incluidos portátiles de gama baja y entornos tipo Raspberry Pi, siempre que haya un intérprete de Python 3.10-3.14.
- Opciones de despliegue: `pip install economics-finance-ai999x` desde PyPI, instalación directa del wheel alojado en HuggingFace, o consumo del artefacto ONNX con ONNX Runtime. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un transformer generativo.
- Sistemas validados: Windows con Python 3.13 y Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14. No se declara soporte de macOS ni de ARM.

## Comparativa con modelos similares

| Criterio | economics-finance-ai999x | Llama 3.1 8B | Qwen2.5-Math 7B | QuantLib |
|---|---|---|---|---|
| Categoria | Motor simbolico de dominio financiero | LLM generativo de proposito general | LLM especializado en matematicas | Biblioteca de calculo financiero |
| Parametros | 4,7 M | 8 000 M (aprox.) | 7 000 M (aprox.) | No aplica |
| Longitud de contexto | No disponible | 128 000 tokens | No disponible | No aplica |
| Determinismo | Si, por diseno | No (muestreo) | No (muestreo) | Si |
| Verificacion de resultados | Si, con rechazo explicito | No | No | No (solo calcula) |
| Explicacion paso a paso en LaTeX | Si | Si, pero no verificada | Si, pero no verificada | No |
| Ejecucion offline en CPU | Si, sin GPU | Requiere GPU o cuantizacion para uso comodo | Requiere GPU o cuantizacion | Si |
| Idiomas | Ingles | Multilingue | Multilingue | No aplica (API) |
| Licencia | Apache-2.0 | Llama 3.1 Community License | Apache-2.0 | QuantLib License (BSD modificada) |
| Benchmarks publicos comparables | No disponible | Amplia bateria publica | Amplia bateria publica | No aplica |

La comparación relevante no es de rendimiento en benchmarks, que no existe para este modelo, sino de contrato: frente a un LLM, economics-finance-ai999x renuncia a la generalidad y a la generación libre para garantizar exactitud y trazabilidad en un dominio acotado; frente a QuantLib, añade interpretación de lenguaje natural, explicación y mecanismo de rechazo, a costa de una cobertura fija de 96 procedimientos.

## Limitaciones y advertencias

- El resultado de accuracy 1,0 procede de una autoevaluación sobre 384 preguntas definidas por el propio autor y marcada como `verified: false`. No debe interpretarse como una precisión del 100 % en preguntas nuevas.
- La cobertura está limitada a los 96 procedimientos certificados. Cualquier cuestión fuera de ese catálogo se resuelve con OUT_OF_SCOPE, no con una respuesta aproximada; es una limitación funcional importante si se espera un asistente abierto.
- Solo admite inglés. Las formas de pregunta documentadas están en inglés y no se declara soporte de otros idiomas, lo que incluye el castellano.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno con contexto largo ni soporta tool calling genérico. La longitud de contexto no está documentada.
- La calidad depende de que la pregunta encaje en las formas documentadas o de que se use la interfaz tipada `solve()`. Las preguntas mal formuladas pueden caer en UNRECOGNIZED_FORMAT o AMBIGUOUS.
- El modelo está marcado con `inference: false` en HuggingFace, por lo que no se puede probar mediante la Inference API de la plataforma; hay que instalarlo localmente.
- Riesgo de sesgo residual en la capa de lectura de lenguaje natural: al ser sensible a la formulación, distintas redacciones de la misma pregunta podrían no reconocerse como equivalentes.
- Riesgo de alucinación bajo por diseño (el sistema rechaza en lugar de adivinar), pero no nulo: si una capacidad certificada contiene un error de implementación o un supuesto inadecuado, el resultado se devolverá como verificado sin que la comprobación lo detecte.
- Madurez temprana: versión 1.0.0, 0 descargas y 0 likes en el momento de la consulta, sin adopción pública ni revisión independiente documentada. Conviene tratarlo como proyecto emergente antes de integrarlo en producción crítica.
- La licencia Apache-2.0 permite uso comercial, pero el proyecto se financia con donaciones y no se declara hoja de ruta de mantenimiento ni compromiso de soporte a largo plazo.
- No se declara soporte de macOS ni de arquitecturas ARM, lo que puede afectar a despliegues en portátiles Apple Silicon o en servidores ARM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/economics-finance-ai999x
- Paquete en PyPI: https://pypi.org/project/economics-finance-ai999x/
- Guía de capacidades (docs en el repositorio): https://huggingface.co/AI999X/economics-finance-ai999x/tree/main/docs
- Evaluación (respuestas doradas): https://huggingface.co/AI999X/economics-finance-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web del proyecto: https://ai999x.com
- Apoyo al desarrollo (Buy Me a Coffee): https://buymeacoffee.com/ibnuljaiffarabi
