# AI999X/thermofluids-ai999x

## Resumen

thermofluids-ai999x es un motor de resolución de problemas de termofluidos para Python, desarrollado por AI999X (creador: Ibnul Jaif Farabi), que combina una capa de lectura de preguntas en inglés basada en reglas con un conjunto de capacidades simbólicas certificadas. No es un modelo de lenguaje generativo: recibe una pregunta o una llamada tipada, selecciona una de sus 126 capacidades certificadas (27 derivaciones, 13 procedimientos y 86 relaciones), calcula el resultado con sympy y mpmath, lo verifica y lo devuelve con pasos, unidades, LaTeX y supuestos. Si no puede verificarlo, se niega a responder en lugar de aproximar.

Su relevancia está en el nicho: cálculo de ingeniería reproducible y auditable, ejecutable en CPU, sin GPU, sin red y sin clave de API, con respuestas idénticas en Windows y Linux (Python 3.10 a 3.14). Cubre estática y dinámica de fluidos, flujo en tuberías, capas límite, aerodinámica y flujo compresible, conducción, convección y radiación, aletas, intercambiadores de calor, ciclos termodinámicos, psicrometría y combustión.

El repositorio declara 4.715.520 parámetros en safetensors y un tamaño de 0,0 GB, coherente con un paquete de conocimiento compacto más que con una red neuronal de gran escala. La licencia es Apache-2.0 y el idioma soportado es únicamente el inglés. A fecha de la ficha no tiene descargas ni valoraciones, y su benchmark principal está autodeclarado y marcado como no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbólico determinista: lectura de preguntas basada en reglas más resolución simbólica con sympy y mpmath; no es un transformer |
| Parámetros totales | 4.715.520 (pesos declarados en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido habitual (la entrada es una pregunta en inglés o una llamada `solve(capability_id, **inputs)`) |
| Tipos de cuantización | No disponible; no aplica (el runtime es Python puro, sin pesos en coma flotante de baja precisión) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX; distribución principal como wheel de Python (`thermofluids_ai999x-1.0.0-py3-none-any.whl`) |
| Versión del paquete | 1.0.0 (import `thermofluids_ai999x`) |
| Pack de conocimiento | 0.1.1 |
| Capacidades certificadas | 126 (27 derivaciones, 13 procedimientos, 86 relaciones) |
| Respuestas doradas | 1010 respuestas documentadas, idénticas en cada plataforma probada |
| Plataformas probadas | Windows con Python 3.13; Linux x86-64 con Python 3.10, 3.11, 3.12, 3.13 y 3.14 |
| Runtime | Solo CPU, offline; sin GPU, sin red y sin clave de API |
| Tareas declaradas | Question answering, token classification, text classification, sentence similarity, feature extraction |
| Metadatos | `inference: false` en la model card, aunque el `pipeline_tag` es `question-answering` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura no corresponde a un transformer ni a un modelo híbrido SSM: es un motor neuro-simbólico en el que la "comprensión" del enunciado se resuelve con reglas de lectura de formas documentadas y la respuesta se obtiene resolviendo simbólicamente una capacidad certificada del dominio. El paquete se apoya en sympy y mpmath, y el motor se distribuye como wheel de Python puro, por lo que las respuestas son deterministas y no dependen de muestreo, semilla ni precisión de GPU.

No hay datos de entrenamiento en el sentido habitual (no se declaran tokens, composición de dataset, RLHF ni DPO). El conocimiento reside en el pack de conocimiento 0.1.1: 27 derivaciones, 13 procedimientos y 86 relaciones certificadas. Cada respuesta se comprueba antes de devolverse mediante sustitución inversa, análisis dimensional o comparación con un cálculo independiente. La validación declarada se apoya en 1010 respuestas doradas reproducidas de forma idéntica en todas las plataformas probadas. La innovación destacable es el diseño de "cero respuestas incorrectas": siete salidas explícitas (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) que sustituyen a la aproximación silenciosa.

## Capacidades

- Resolución de problemas de termofluidos con resultado numérico exacto y verificado, no generado.
- Interfaz en inglés natural mediante `ask()` para formas de pregunta documentadas.
- Interfaz tipada garantizada mediante `solve(capability_id, **inputs)`, que siempre resuelve una tarea soportada si las entradas son válidas.
- Explicación paso a paso: fórmulas en LaTeX, unidades, supuestos y modelo utilizado.
- Abstención explícita: devuelve NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT o INTERNAL_ERROR en lugar de adivinar.
- Cobertura de fluidos (estática, dinámica, flujo en tuberías, capas límite, aerodinámica, flujo compresible).
- Cobertura térmica (conducción, convección, radiación, aletas, intercambiadores de calor).
- Ciclos termodinámicos (por ejemplo, eficiencia del ciclo Otto con relación de compresión 8: 0,564725).
- Psicrometría y combustión (por ejemplo, punto de rocío con T = 25 °C y HR = 60 %).
- Ejecución completamente offline en CPU, sin GPU, sin red y sin clave de API.
- Determinismo entre plataformas: mismas respuestas en Windows y en Linux con Python 3.10 a 3.14.
- Etiquetado del repositorio para token classification, text classification, sentence similarity y feature extraction (sin métricas publicadas para esas tareas).

## Casos de uso

- Corrección automática de ejercicios de ingeniería: `ask()` recibe el enunciado en inglés y devuelve resultado, pasos y supuestos, de modo que un corrector puede comparar la solución del alumno con la cadena de derivación y no solo con el número final.
- Tutoría offline en aulas o laboratorios sin conectividad: el paquete se instala con pip y funciona en CPU, sin clave de API, lo que permite desplegarlo en equipos de estudiantes o en entornos con red restringida.
- Verificación de cálculos en pipelines de ingeniería: antes de publicar una memoria de cálculo, un script puede llamar a `solve()` con la capacidad concreta y validar dimensiones y unidades de forma automática.
- Generación de documentación técnica reproducible: la salida en LaTeX con fórmulas, unidades y supuestos se puede insertar directamente en cuadernos Jupyter o en informes generados, con resultado idéntico en cada ejecución.
- Pruebas de regresión de software de simulación: las 1010 respuestas doradas sirven como conjunto de referencia para detectar regresiones numéricas al actualizar dependencias o cambiar de plataforma.
- Filtrado y clasificación de enunciados: las tareas de token classification y text classification declaradas permiten encaminar preguntas entrantes hacia la capacidad adecuada o descartar las que quedan fuera de alcance.
- Asistencia en diseño térmico preliminar: cálculo rápido de números adimensionales, factores de fricción, eficiencias de ciclos o puntos psicrométricos para iterar antes de recurrir a simulación CFD o a software de propiedades.
- Auditoría en entornos regulados: al ser determinista, offline y con abstención explícita, cada respuesta es reproducible y trazable, lo que facilita la revisión por terceros.

## Benchmarks y rendimiento

| Benchmark | Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Thermofluids question answering | Golden answers (1010 preguntas documentadas, Windows + Linux Python 3.10-3.14) | accuracy | 1,0 | No (`verified: false`; dato declarado por el autor) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de modelos de lenguaje en la información disponible. Tampoco se publican métricas para las tareas de token classification, text classification, sentence similarity o feature extraction que aparecen en las etiquetas del repositorio. El único resultado disponible mide la reproducibilidad sobre el propio conjunto de respuestas doradas del autor, no la generalización a preguntas nuevas.

## Requisitos de hardware

- VRAM: 0 GB; el motor se ejecuta exclusivamente en CPU.
- GPU recomendadas: ninguna; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier equipo consumer: basta con un intérprete de Python 3.10 a 3.14 y las dependencias sympy y mpmath.
- Memoria RAM y latencia: no disponibles en la información proporcionada.
- Throughput: no disponible; al ser determinista y monoproceso, el coste depende de la capacidad invocada y no de un tamaño de lote.
- Opciones de despliegue: instalación vía `pip install thermofluids-ai999x` o directamente desde el wheel del repositorio de HuggingFace; ejecución en scripts, cuadernos Jupyter o servicios Python.
- No soporta vLLM, llama.cpp, Ollama ni TGI: no es un modelo de pesos para inferencia de lenguaje y la propia model card declara `inference: false`.

## Comparativa con modelos similares

| Alternativa | Tipo | Cobertura de dominio | Determinismo | Licencia | Notas |
|---|---|---|---|---|---|
| thermofluids-ai999x | Motor neuro-simbólico con capacidades certificadas | Termofluidos: fluidos, calor, ciclos, psicrometría, combustión | Sí, con abstención explícita | Apache-2.0 | 4.715.520 parámetros; solo inglés; sin descargas ni validación externa |
| Librerías de propiedades termofísicas (por ejemplo, CoolProp) | Librería de correlaciones y ecuaciones de estado | Propiedades de sustancias y mezclas | Sí | Consultar la licencia del proyecto | No resuelve enunciados en lenguaje natural ni devuelve pasos; requiere que el usuario plantee el cálculo |
| Sistemas de álgebra simbólica (por ejemplo, SymPy) | Librería de cálculo simbólico | Genérica, sin conocimiento de dominio | Sí | Consultar la licencia del proyecto | Es una de las dependencias del modelo; no incluye capacidades de termofluidos certificadas ni lectura de enunciados |
| LLM generativo de propósito general con tool calling | Modelo de lenguaje | Muy amplia, no certificada | No | Según el modelo | Puede redactar y razonar, pero no garantiza resultados verificados y puede alucinar magnitudes |

No se dispone de comparaciones cuantitativas publicadas entre thermofluids-ai999x y estas alternativas, ni de benchmarks comunes.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte declarado de castellano ni de otros idiomas.
- No es un modelo generativo: no redacta texto libre, no mantiene conversaciones multi-turno y no responde a preguntas fuera de sus 126 capacidades certificadas.
- La cobertura está acotada al dominio de termofluidos y a las formas de pregunta documentadas; variaciones de redacción no reconocidas devuelven UNRECOGNIZED_FORMAT.
- El resultado de accuracy 1,0 procede de las 1010 respuestas doradas del propio autor sobre su propio conjunto, está marcado como `verified: false` y no mide generalización a preguntas nuevas.
- No hay validación independiente: 0 descargas y 0 likes en HuggingFace en el momento de la ficha.
- Los metadatos del repositorio son contradictorios: `inference: false` convive con un `pipeline_tag` de question-answering y con etiquetas de token classification, text classification, sentence similarity y feature extraction sin métricas que las respalden.
- El tamaño del repositorio es 0,0 GB y los 4.715.520 parámetros no corresponden a una red neuronal de lenguaje; conviene no interpretarlos como equivalentes a un LLM de ese tamaño.
- No se publican métricas de latencia, consumo de memoria ni límites de escalado.
- Riesgo de alucinación bajo por diseño, pero el riesgo se traslada a la selección de capacidad: una pregunta mal interpretada puede resolverse sobre una capacidad distinta de la pretendida, por lo que conviene revisar los pasos y supuestos devueltos.
- Licencia Apache-2.0: permite uso comercial y modificación con obligaciones de atribución y aviso; no se declaran restricciones adicionales, pero la certificación de las capacidades es una afirmación del autor, no una garantía contractual.
- La fecha de creación del repositorio (2026-10-25) y la versión 1.0.0 indican un proyecto muy reciente; conviene fijar la versión exacta del paquete en producción.

## Enlaces

- [HuggingFace: AI999X/thermofluids-ai999x](https://huggingface.co/AI999X/thermofluids-ai999x)
- [PyPI: thermofluids-ai999x](https://pypi.org/project/thermofluids-ai999x/)
- [Guía de capacidades (docs)](https://huggingface.co/AI999X/thermofluids-ai999x/tree/main/docs)
- [Evaluación](https://huggingface.co/AI999X/thermofluids-ai999x/tree/main/evaluation)
- [Organización AI999X en HuggingFace](https://huggingface.co/AI999X)
- [Sitio web del proyecto](https://ai999x.com)
- [Licencia Apache-2.0 del repositorio](https://huggingface.co/AI999X/thermofluids-ai999x/blob/main/LICENSE)
- [Apoyo al desarrollo (Buy Me a Coffee)](https://buymeacoffee.com/ibnuljaiffarabi)
- Artículo o paper técnico: no disponible en la información proporcionada.
- Repositorio de código independiente o demo interactiva: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (únicamente resultados genéricos de YouTube).
