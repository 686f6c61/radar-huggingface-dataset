# AI999X/geometry-ai999x

## Resumen

geometry-ai999x es un motor de cálculo geométrico determinista publicado por AI999X en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje neuronal al uso: se distribuye como un artefacto compilado (motor en Rust con enlace a Python) que resuelve 78 cálculos geométricos organizados en 14 temas, desde geometría plana y del espacio hasta geometría computacional (envolventes convexas, diagramas de Voronoi, triangulación), pasando por cónicas, poliedros y geometría esférica. El pipeline declarado es `question-answering`, pero la implementación es un solver simbólico/numérico offline que devuelve fórmula, pasos y unidades.

El repositorio declara 4.715.520 parámetros en safetensors, un tamaño de repo de 0.0 GB y la etiqueta `inference: false`, lo que sugiere un artefacto principalmente de distribución y no un checkpoint de transformer convencional. El modelo está orientado a resolución paso a paso de problemas de geometría y ayuda a deberes, con la promesa de cero alucinación al no generar texto libre sino respuestas calculadas.

Su relevancia actual reside en ofrecer una alternativa determinista y auditable a los LLM generalistas en un dominio donde los errores numéricos son costosos: cada respuesta incluye fórmula, pasos y unidades, y ante entradas fuera de rango o incompletas devuelve una razón textual en lugar de un número inventado. Está disponible como app de escritorio (Windows/Linux), CLI, versión web y paquete Python 3.10+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | motor de cálculo geométrico compilado (Rust) con bindings Python; no es un transformer |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica a un motor determinista) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo declarado 0.0 GB); distribución principal como binarios compilados y paquete pip |

## Arquitectura y entrenamiento

La arquitectura no es la de un modelo neuronal generativo. Según la model card, se trata de "one compiled engine, four ways to use it": un único motor compilado que se expone mediante app de escritorio, línea de comandos, navegador y paquete Python. El motor cubre 78 cálculos en 14 temas, cada uno con su fórmula, sus pasos y sus unidades. En sistemas Windows y Linux x86-64 el paquete `pip install geometry-ai999x` instala el mismo motor compilado; en macOS y ARM instala una build Python pura que, según el autor, ofrece las mismas respuestas.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO, porque el artefacto no se presenta como un modelo entrenado con esos procedimientos. La innovación técnica destacable es el enfoque de "cero alucinación": ante una entrada ausente o fuera de rango, el motor devuelve una razón en lenguaje natural en lugar de un resultado numérico, y toda respuesta va acompañada de la fórmula y del desarrollo paso a paso. La evaluación declarada se apoya en 391 preguntas documentadas con respuestas doradas, ejecutadas en Windows y Linux con Python 3.10-3.14.

## Capacidades

- Resolución de cálculos de geometría plana y del espacio: áreas, volúmenes, perímetros y propiedades de figuras.
- Geometría de coordenadas: puntos, rectas, distancias y transformaciones en el plano y el espacio.
- Cónicas: clasificación a partir de la ecuación general y cálculo de sus elementos.
- Polígonos y poliedros: centroides, sólidos platónicos, característica de Euler, radios y superficies.
- Geometría computacional: envolventes convexas en el plano, diagramas de Voronoi y triangulación.
- Geometría esférica: distancia de círculo máximo entre dos puntos sobre una esfera.
- Curvas y superficies, incluida curvatura.
- Salida paso a paso con fórmula, pasos intermedios y unidades para cada cálculo.
- Manejo explícito de entradas incompletas o fuera de rango mediante una razón textual en lugar de un número.
- Ejecución offline en la máquina del usuario, sin dependencia de servicios externos.
- Cuatro interfaces: app de escritorio (Windows, Linux), CLI `geometry`, versión web y API Python.
- Escenas y gráficos generados a partir de la respuesta calculada en la app de escritorio.

## Casos de uso

- Ayuda a deberes de geometría: el motor resuelve el problema concreto y muestra fórmula, pasos y unidades, lo que permite al estudiante seguir el desarrollo y verificar el resultado en lugar de recibir solo una cifra.
- Docencia y material didáctico: los cálculos de sólidos platónicos, cónicas y figuras semejantes pueden usarse para generar ejemplos resueltos y escenas gráficas coherentes con la respuesta.
- Validación de pipelines de geometría computacional: la envolvente convexa, el diagrama de Voronoi y la triangulación sirven como referencia determinista para comprobar implementaciones propias en CI.
- Preprocesado en visión artificial y CAD: cálculo offline de centroides de polígonos, áreas de anillos y propiedades de poliedros antes de alimentar herramientas de modelado.
- Sistemas de tutoría automática: al devolver una razón textual ante entradas inválidas, el motor puede integrarse en flujos de corrección que distingan entre "respuesta incorrecta" y "entrada mal formada".
- Geografía y navegación: la distancia de círculo máximo entre dos puntos sobre una esfera permite calcular distancias ortodrómicas en herramientas de planificación de rutas.
- Automatización por CLI: el comando `geometry` en Windows y Linux permite encadenar cálculos en scripts y tareas por lotes sin conexión a red.
- Integración en aplicaciones Python: `pip install geometry-ai999x` expone el motor como librería para su uso dentro de servicios y notebooks en Python 3.10+.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Question answering (geometría) | Golden answers (391 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | accuracy | 1.0 ("identical on every platform") |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no ser un modelo neuronal, no requiere GPU.
- GPU recomendadas: no aplica; el motor está pensado para ejecución en CPU.
- Cabe en cualquier equipo consumer: Windows y Linux x86-64 mediante binarios compilados; macOS y ARM mediante build Python pura.
- Opciones de despliegue: app de escritorio (Windows/Linux), CLI `geometry`, versión web en la página del modelo, paquete Python 3.10+ (`pip install geometry-ai999x`).
- vLLM, llama.cpp, Ollama o TGI: no aplican a este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| geometry-ai999x | motor determinista de cálculo geométrico | 4.715.520 (safetensors) | no disponible | 78 cálculos en 14 temas, salida paso a paso, cero alucinación | apache-2.0 | Hugging Face, pip, app de escritorio, CLI, web |
| LLM generalista (p. ej. familia Llama) | transformer generativo | miles de millones | decenas de miles de tokens | texto libre, razonamiento general | licencias variables | múltiples |
| Librerías de geometría computacional (p. ej. SciPy/Shapely) | código determinista | no aplica | no aplica | primitivas geométricas | BSD/MIT | PyPI |
| SymPy | CAS simbólico | no aplica | no aplica | álgebra y cálculo simbólico | BSD | PyPI |

La comparación directa con LLM no es homogénea: geometry-ai999x no genera lenguaje libre ni razona fuera del dominio geométrico cubierto. Frente a librerías como Shapely o SymPy, la diferencia es la interfaz de preguntas y respuestas con pasos explicados y el tratamiento explícito de entradas inválidas. No se dispone de datos de rendimiento comparables con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al dominio: 78 cálculos en 14 temas de geometría; no resuelve problemas fuera de ese catálogo.
- Idioma: solo inglés (`en`); no hay soporte declarado para castellano ni otras lenguas.
- No es un modelo generativo: no mantiene conversaciones abiertas ni razona sobre texto libre; el pipeline `question-answering` debe interpretarse como resolución de consultas geométricas estructuradas.
- El resultado de accuracy 1.0 procede de 391 preguntas documentadas por el autor y está marcado como `verified: false`; no es una validación independiente.
- Riesgo de alucinación bajo por diseño (devuelve razones en lugar de números ante entradas inválidas), pero la corrección depende de que la entrada se ajuste al esquema esperado por cada cálculo.
- Sin datos publicados sobre sesgos, latencia, throughput ni comportamiento en entornos de alta concurrencia.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio por si el autor añade condiciones adicionales.
- El repositorio declara `inference: false` y tamaño 0.0 GB; la descarga de pesos safetensors puede no ser el canal previsto para su uso, que se realiza mediante binarios y pip.
- Sin garantías de mantenimiento a largo plazo ni información sobre versionado semántico de la API Python.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/geometry-ai999x
- Página del modelo con demo web: https://www.ai999x.com/models/geometry-ai999x/
- Capacidades interactivas: https://www.ai999x.com/models/geometry-ai999x/#capabilities
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=geometry-ai999x/clip.mp4
- App de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-geometry-1.6.7-windows-x86_64.zip
- App de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-geometry-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Paquete Python: `pip install geometry-ai999x`
