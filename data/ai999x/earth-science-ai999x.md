# AI999X/earth-science-ai999x

## Resumen

earth-science-ai999x es un paquete Python desarrollado por AI999X (Ibnul Jaif Farabi) que resuelve preguntas de ciencias de la Tierra —termodinámica atmosférica, meteorología, balance radiativo y clima, propiedades del agua de mar, sismología, geofísica y geología— mediante 85 procedimientos simbólicos "certificados" en lugar de generación de texto libre. Se distribuye como librería (`pip install earth-science-ai999x`) con un componente neuronal empaquetado en safetensors/ONNX de 4.715.520 parámetros, cuya función declarada es la lectura de preguntas en inglés y el enrutado hacia la capacidad adecuada; el cálculo final lo realizan rutinas deterministas basadas en sympy y mpmath. No requiere GPU, ni red, ni clave de API.

Su propuesta diferencial es el rechazo explícito: el sistema declara siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y, según el autor, evita adivinar cuando no puede verificar una respuesta. Cada solución devuelve pasos, fórmula en LaTeX, unidades y supuestos, lo que lo orienta a tutoría, corrección de ejercicios y validación reproducible más que a generación abierta.

Es relevante ahora por su encaje en dos nichos concretos: entornos sin conectividad (aulas, laboratorios, despliegues aire-gap) y pipelines donde una respuesta numérica incorrecta es costosa. Conviene subrayar que, pese a las etiquetas de HuggingFace (`question-answering`, `token-classification`, `sentence-similarity`), no es un modelo generativo de propósito general: la cobertura está acotada a las 85 capacidades y a las 522 formas de pregunta documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Sistema neuro-simbólico: lectura de preguntas basada en reglas y en un componente neuronal empaquetado (safetensors/ONNX) + 85 capacidades simbólicas deterministas |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto conversacional; opera sobre formas de pregunta documentadas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |
| Version | 1.0.0 (knowledge pack 1.0.1) |
| Capacidades certificadas | 85 procedimientos |
| Respuestas doradas | 522 respuestas documentadas, idénticas en todas las plataformas probadas |
| Runtime | CPU únicamente, offline; sin GPU, sin red, sin API key (sympy, mpmath) |
| Plataformas probadas | Windows (Python 3.13), Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal concreta ni un proceso de entrenamiento (no se indican tokens, composición del dataset, ni fases de RLHF/DPO). Lo que sí documenta la model card es la organización del sistema: una capa de lectura de preguntas en inglés —apoyada en un componente serializado en safetensors y ONNX de 4,7 millones de parámetros— que selecciona una de las 85 capacidades certificadas, y una capa de cálculo simbólico en Python puro (sympy, mpmath) que computa el resultado y lo verifica antes de devolverlo, ya sea por sustitución inversa, comprobación dimensional o comparación con un cálculo independiente.

La innovación declarada no es arquitectónica sino de diseño de salida: siete estados de resultado explícitos, rechazo en lugar de estimación cuando falta un dato o la pregunta cae fuera de cobertura, y trazabilidad completa (pasos, unidades, LaTeX, supuestos y modelo empleado). El sistema expone dos interfaces: `ask()` para preguntas en lenguaje natural dentro de las formas documentadas y `solve(capability_id, **inputs)` para llamadas tipadas con parámetros validados.

## Capacidades

- Resolución determinista de problemas de termodinámica atmosférica y meteorología (por ejemplo, nivel de condensación por elevación, LCL).
- Balance radiativo y clima: temperatura de equilibrio planetario, constante solar, albedo.
- Oceanografía y propiedades del agua de mar: densidad y sigma a partir de salinidad, temperatura y presión.
- Sismología y geofísica: conversión entre momento sísmico y magnitud de momento (Mw).
- Geocronología: cálculo de edad radiométrica a partir de ratios isotópicos y semivida.
- Salida explicada: pasos intermedios, fórmulas en LaTeX, unidades, supuestos y capacidad utilizada.
- Rechazo controlado con siete estados (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR).
- Dos modos de invocación: `ask()` en inglés documentado y `solve()` con interfaz tipada garantizada.
- Ejecución offline y determinista en CPU, con resultados idénticos en Windows y Linux (Python 3.10 a 3.14).
- No dispone de tool calling, razonamiento multi-paso abierto, visión, audio ni modo "thinking": no es un modelo generativo de propósito general.

## Casos de uso

- Corrección automática de ejercicios de ciencias de la Tierra: `ask()` procesa formas de pregunta documentadas y devuelve el resultado con pasos y unidades, lo que permite comparar contra la respuesta del alumno y mostrar la resolución completa, no solo el número final.
- Tutoría en aulas sin conectividad: al ejecutarse en CPU con `pip install` y sin red ni API key, puede desplegarse en laboratorios escolares o entornos con conectividad limitada sin coste de inferencia.
- Generación de bancos de ejercicios verificados: `solve(capability_id, **inputs)` con parámetros tipados produce resultados reproducibles bit a bit, adecuados para construir conjuntos de evaluación o material docente con solución garantizada.
- Verificación cruzada en modelado climático y oceanográfico: cálculo de referencia de LCL, densidad del agua de mar o temperatura de equilibrio planetario como sanity check frente a los valores que emite un modelo numérico de mayor escala.
- Informes sismológicos: conversión de momento sísmico (N·m) a Mw dentro de flujos de monitorización o generación de fichas de evento, con verificación del resultado antes de publicarlo.
- Datación radiométrica en flujos de laboratorio: obtención de edad a partir de ratio isotópico y semivida con pasos intermedios auditables, útil para prevalidar cálculos antes de la revisión humana.
- Asistentes y chatbots con garantía de rechazo: integrado como backend, devuelve OUT_OF_SCOPE o NEEDS_INPUT en lugar de una respuesta inventada cuando la consulta excede las 85 capacidades, lo que reduce el riesgo de alucinación en dominios técnicos.
- Reproducibilidad de investigación: notebook o script que produce la misma salida en Windows y en Linux con Python 3.10-3.14, lo que simplifica la revisión por pares de cálculos auxiliares.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (ciencias de la Tierra) | Golden answers (522 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 ("identical on every platform") | No (declarado por el autor, `verified: false`) |

Advertencias sobre estos datos: el 1.0 corresponde a un conjunto propio de 522 preguntas documentadas, no a un benchmark público independiente; no se publican líneas base comparativas ni métricas de generalización sobre preguntas fuera de las formas documentadas. La métrica mide reproducibilidad y cobertura del conjunto dorado, no calidad en preguntas abiertas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni equivalentes en la información disponible.

## Requisitos de hardware

- VRAM: no aplica. El sistema se ejecuta en CPU; el componente safetensors de 4.715.520 parámetros ocupa aproximadamente 18,9 MB en fp32 y unos 9,4 MB en fp16, a lo que se suma el runtime de Python con sympy y mpmath.
- GPU: no se requiere ni se documenta soporte de aceleración por GPU (A100, H100, RTX 4090 u otras). La model card indica explícitamente "CPU only, offline".
- Cabe en cualquier equipo de consumo: basta una CPU x86-64 o Windows con Python 3.10-3.14; no hay requisito de memoria gráfica.
- Despliegue: instalación vía `pip install earth-science-ai999x` o del wheel alojado en el repositorio de HuggingFace. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje servible por esos motores.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser cálculo simbólico determinista sobre CPU, el coste dominante es el arranque del intérprete y la evaluación simbólica, no la inferencia neuronal.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Cobertura | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| earth-science-ai999x | Solver neuro-simbólico determinista (ciencias de la Tierra) | 4.715.520 | No disponible | 85 capacidades, 522 respuestas doradas | Apache-2.0 | Accuracy 1.0 en conjunto propio (no verificado) |
| physics-ai999x (AI999X) | Solver neuro-simbólico determinista (física) | No disponible | No disponible | 148 capacidades certificadas | No disponible en la información | No disponible |
| ai999x-encoder (AI999X) | Encoder (registro en free2aitools) | No disponible | No disponible | No disponible | No disponible | No disponible |
| LLM generativos de propósito general | Modelos de lenguaje | No comparable | No comparable | Abierta, con riesgo de alucinación | Variable | No disponible en esta ficha |

La comparación relevante es de categoría, no de escala: frente a un LLM generativo, este sistema no compite en cobertura ni en fluidez, sino en determinismo y trazabilidad dentro de un dominio acotado. Frente a physics-ai999x, del mismo autor, cambia el dominio y el número de capacidades (85 frente a 148); no se dispone de datos para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Cobertura cerrada: solo resuelve las 85 capacidades certificadas y las formas de pregunta documentadas en inglés; cualquier otra consulta deriva en OUT_OF_SCOPE o UNRECOGNIZED_FORMAT.
- Idioma único: la información declara únicamente inglés (en); no hay soporte documentado de castellano ni de otras lenguas.
- No es un modelo conversacional: no mantiene contexto multi-turno ni genera texto libre, pese a las etiquetas de HuggingFace (`question-answering`, `text-classification`, `sentence-similarity`).
- La afirmación "zero wrong answers" y el accuracy de 1.0 proceden del autor y figuran como `verified: false`; no hay evaluación independiente ni conjunto de test público.
- El conjunto dorado de 522 preguntas es también el criterio de evaluación, por lo que la métrica no mide generalización a preguntas nuevas o mal formuladas.
- Riesgo de alucinación bajo por diseño, pero el fallo característico es el rechazo o la ambigüedad no resuelta, no la invención; conviene gestionar los siete estados en la aplicación cliente.
- Trazabilidad de mantenimiento limitada: versión 1.0.0, un único autor y repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay historial público de incidencias.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución y conservación del aviso de licencia; no se han identificado restricciones adicionales en la información disponible.
- No se documentan sesgos, pero el ámbito (ciencias físicas con fórmulas cerradas) limita el tipo de error esperable a supuestos mal aplicados, unidades incompatibles o rangos de validez de las correlaciones empíricas.
- El tamaño de repositorio reportado (0.0 GB) puede indicar que los pesos se descargan desde ubicaciones separadas o que el dato está redondeado; conviene verificar la integridad del paquete antes de desplegarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AI999X/earth-science-ai999x
- Repositorio GitHub: https://github.com/AI999X/earth-science-ai999x
- Paquete PyPI: https://pypi.org/project/earth-science-ai999x/
- Guía de capacidades (docs): https://huggingface.co/AI999X/earth-science-ai999x/tree/main/docs
- Evaluación: https://huggingface.co/AI999X/earth-science-ai999x/tree/main/evaluation
- Organización AI999X en HuggingFace: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
- Proyecto hermano (física): https://github.com/AI999X/physics-ai999x
- physics-ai999x en PyPI: https://pypi.org/project/physics-ai999x/
- Registro de ai999x-encoder: https://free2aitools.com/model/ai999x/ai999x-encoder
- Registro de physics-ai999x: https://free2aitools.com/model/ai999x/physics-ai999x
