# AI999X/civil-engineering-ai999x

## Resumen

civil-engineering-ai999x es un motor de cálculo de ingeniería civil para Python desarrollado por AI999X (autor: Ibnul Jaif Farabi), publicado bajo licencia Apache-2.0 y distribuido como paquete `pip install civil-engineering-ai999x` (import `civil_engineering_ai999x`). No es un modelo generativo al uso: la model card lo describe como un motor determinista neuro-simbólico que combina una capa de lectura de preguntas en inglés con 88 procedimientos de cálculo certificados implementados en Python puro (sympy, mpmath). Su propuesta es la opuesta a la de un LLM: en lugar de generar texto plausible, ejecuta un cálculo simbólico, lo verifica (sustitución inversa, comprobación dimensional o cálculo independiente) y devuelve el resultado con pasos, unidades, LaTeX y supuestos; si no puede verificar, emite un rechazo explícito.

El repositorio declara 4.715.520 parámetros en safetensors, pero la documentación pública no detalla ninguna arquitectura de red neuronal ni longitud de contexto, y de hecho describe el paquete como Python puro que corre en CPU sin GPU, sin red y sin clave de API. Esa discrepancia entre el dato de parámetros y la descripción funcional es el punto que cualquier evaluador debe aclarar antes de integrarlo.

Su relevancia práctica está en el nicho: cálculo de ingeniería civil reproducible y auditable, con cobertura declarada de hidráulica de canales abiertos, redes de tuberías, hidrología, flujo subterráneo, mecánica de suelos y cimentaciones, y topografía. El autor reporta 566 respuestas documentadas reproducidas de forma idéntica en Windows y Linux sobre Python 3.10 a 3.14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como arquitectura neuronal; la model card describe un motor determinista neuro-simbolico (lectura basada en reglas + 88 capacidades simbolicas certificadas en Python puro con sympy y mpmath) |
| Parametros totales | 4.715.520 (dato declarado en safetensors); la model card no detalla a que corresponde esa cifra |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio incluye artefactos ONNX y safetensors, sin detalle de cuantizaciones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX y wheel de Python (`civil_engineering_ai999x-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

La informacion disponible no describe una arquitectura transformer, MoE, SSM ni hibrida, ni aporta datos de entrenamiento (numero de tokens, composicion del corpus, RLHF o DPO). Lo que documenta el autor es un diseno en dos capas: una capa de lectura que interpreta preguntas en ingles liano o llamadas tipadas mediante `solve(capability_id, **inputs)`, y una capa de resolucion compuesta por 88 procedimientos certificados de ingenieria civil. Cada respuesta se valida antes de devolverse mediante sustitucion inversa, comprobacion dimensional o comparacion con un calculo independiente.

El rasgo tecnico distintivo es el manejo explicito de siete resultados posibles (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR), de modo que el sistema nunca devuelve una suposicion silenciosa. El paquete se declara sin dependencias de GPU, red o claves de API, y con resultados identicos en Windows (Python 3.13) y Linux x86-64 (Python 3.10 a 3.14). La version documentada es 1.0.0, con un knowledge pack 1.0.1.

## Capacidades

- Resolucion de problemas de hidraulica de canales abiertos: ecuacion de Manning en canales rectangulares, resalto hidraulico, vertederos.
- Calculo de redes de tuberias: Hazen-Williams y metodo de Hardy Cross para redes malladas con caudales y demandas nodales.
- Hidrologia: hidrograma unitario y analisis de frecuencias de avenidas.
- Flujo subterraneo: bombeo y descenso de nivel mediante la solucion de Theis (caudal, transmisividad, coeficiente de almacenamiento, distancia y tiempo).
- Mecanica de suelos y cimentaciones: asentamiento por consolidacion normalmente consolidada (Cc, e0, H, tensiones).
- Topografia, segun la cobertura declarada de capacidades.
- Interfaz de doble via: `ask()` para preguntas en lenguaje natural documentado y `solve(capability_id, **inputs)` como interfaz tipada garantizada.
- Salida explicada: pasos, formulas en LaTeX, unidades, supuestos y procedimiento empleado.
- Rechazo controlado ante ambiguedad, entradas invalidas o peticiones fuera de alcance.
- Uso offline en CPU, sin GPU ni conectividad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso generativo, vision ni audio.

## Casos de uso

- Correccion automatica de ejercicios de hidraulica: el motor resuelve el problema con `solve()` y devuelve pasos, formula y unidades, lo que permite comparar con la respuesta del alumno y mostrar donde falla, sin riesgo de que el sistema invente un resultado.
- Verificacion de calculos en proyecto: ante una hoja de calculo con caudales en una red de distribucion, se ejecuta el procedimiento de Hardy Cross o Hazen-Williams y se contrasta el resultado con el del diseno original antes de firmar la memoria.
- Docencia y material didactico: generacion de enunciados resueltos de consolidacion, Theis o Manning con LaTeX listo para apuntes, ya que la salida incluye formulas y supuestos de forma nativa.
- Pipeline de CI/CD para calculos de ingenieria: al ser un paquete de Python determinista y sin red, se puede incluir en tests automatizados que comprueben que un conjunto de casos de referencia sigue devolviendo los mismos valores tras cada cambio.
- Uso en campo sin conectividad: inspecciones o trabajos de sondeo donde no hay cobertura ni GPU; el calculo de descenso de nivel por bombeo o de asentamiento se ejecuta en el portatil en CPU.
- Integracion en aplicaciones de calculo internas: la interfaz tipada `solve(capability_id, **inputs)` permite envolver el motor como servicio interno de validacion, de modo que una herramienta propia compruebe resultados antes de publicarlos.
- Analisis hidrologico preliminar: estimacion de frecuencias de avenidas e hidrogramas unitarios en fase de anteproyecto, con trazabilidad de la formula aplicada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card:

| Tarea | Conjunto de evaluacion | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de ingenieria civil | Golden answers (566 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1.0 | No (marcado como `verified: false`) |

El autor indica que las 566 respuestas documentadas son identicas en todas las plataformas probadas: Windows con Python 3.13 y Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y la metrica de accuracy 1.0 procede de un conjunto de evaluacion propio del autor, no de un tercero.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el paquete se ejecuta en CPU sin GPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware segun la model card.
- Cabe en cualquier equipo consumer: si, al tratarse de Python puro sobre CPU.
- Almacenamiento: el repositorio declara 0.0 GB, coherente con un paquete ligero.
- Opciones de despliegue: instalacion via PyPI (`pip install civil-engineering-ai999x`) o desde el wheel del repositorio; el repositorio incluye ademas artefactos ONNX y safetensors cuyo uso previsto no se detalla. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no serian aplicables a un motor simbolico de este tipo.
- Dependencias declaradas: sympy y mpmath.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. El autor no publica una comparativa con alternativas, y las metricas declaradas (accuracy 1.0 sobre un conjunto propio de 566 preguntas) no son directamente comparables con benchmarks estandar de LLM. Cualquier comparacion con modelos generativos de proposito general o con librerias de calculo simbolico requeriria fijar el mismo conjunto de casos, algo que no se ha hecho en la documentacion disponible.

| Criterio | civil-engineering-ai999x | Alternativas |
|---|---|---|
| Parametros | 4.715.520 declarados en safetensors | No disponible |
| Longitud de contexto | No disponible | No disponible |
| Rendimiento | Accuracy 1.0 en 566 preguntas propias (no verificado) | No disponible |
| Licencia | Apache-2.0 | No disponible |
| Disponibilidad | PyPI y Hugging Face, offline en CPU | No disponible |

## Limitaciones y advertencias

- Cobertura acotada: 88 procedimientos certificados en seis areas (hidraulica de canales, redes de tuberias, hidrologia, aguas subterraneas, geotecnia y topografia). Fuera de ese alcance el sistema devuelve OUT_OF_SCOPE, no una respuesta aproximada.
- Solo ingles: la unica lengua declarada es `en`; las preguntas en castellano no estan soportadas por la capa `ask()`.
- Ambiguedad de la ficha de Hugging Face: el pipeline declarado es `question-answering` y el repositorio contiene safetensors y ONNX, pero la documentacion describe un motor simbolico en Python puro. Conviene aclarar con el autor el papel real de esos pesos antes de tratarlo como modelo neuronal.
- Metadato `inference: false`: el widget de inferencia de Hugging Face no esta habilitado, por lo que la prueba debe hacerse instalando el paquete.
- Benchmarks no verificados: el 1.0 de accuracy procede del conjunto de evaluacion del propio autor y esta marcado como `verified: false`; no hay validacion independiente.
- Riesgo de alucinacion bajo por diseno, pero no nulo en la capa de lectura: si la interpretacion de una pregunta en lenguaje natural es incorrecta, el calculo sera correcto para un problema distinto. La via `solve(capability_id, **inputs)` elimina esa ambiguedad y es la recomendada en produccion.
- Sin datos de sesgo, robustez frente a entradas adversarias ni comportamiento ante preguntas mal formadas mas alla de los siete codigos de salida declarados.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso; no se declaran restricciones adicionales.
- Version 1.0.0 con un unico mantenedor: no se documenta hoja de ruta, gobernanza ni politica de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/civil-engineering-ai999x
- Paquete en PyPI: https://pypi.org/project/civil-engineering-ai999x/
- Guia de capacidades (docs): https://huggingface.co/AI999X/civil-engineering-ai999x/tree/main/docs
- Evaluacion: https://huggingface.co/AI999X/civil-engineering-ai999x/tree/main/evaluation
- Organizacion AI999X en Hugging Face: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Apoyo al desarrollo: https://buymeacoffee.com/ibnuljaiffarabi
