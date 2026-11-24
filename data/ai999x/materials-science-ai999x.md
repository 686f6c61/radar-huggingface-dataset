# AI999X/materials-science-ai999x

## Resumen

Materials-science-ai999x es un modelo publicado en Hugging Face por el autor AI999X, etiquetado para tareas de question-answering en el dominio de ciencia de materiales. A diferencia de un modelo de lenguaje generativo convencional, la model card lo describe como un motor compilado de calculo que cubre 88 calculos organizados en 13 temas: estructuras cristalinas y difraccion, defectos y difusion, propiedades mecanicas, diagramas de fases, polimeros, ceramicas y compuestos, y propiedades electronicas y termicas. Cada calculo incluye formula, pasos y unidades, y devuelve una explicacion en texto plano cuando falta una entrada o esta fuera de rango.

El modelo declara 4.715.520 parametros totales en formato safetensors y un unico benchmark de accuracy igual a 1,0 sobre 352 preguntas documentadas, evaluado en Windows y Linux con Python 3.10-3.14. El dato aparece como no verificado (verified: false) en el model-index, por lo que debe interpretarse como una cifra declarada por el autor y no como una medicion independiente.

Su relevancia practica reside en el enfoque offline y determinista: se distribuye como aplicacion de escritorio (Windows y Linux), CLI, version web y paquete de Python, y se presenta como libre de alucinaciones por construccion al ser un motor de calculo y no un generador de texto. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de calculo compilado con interfaz de question-answering; no se declara una arquitectura transformer ni detalles de red |
| Parametros totales | 4.715.520 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe una arquitectura de red neuronal. La model card presenta el artefacto como "un motor compilado" con cuatro vias de uso (aplicacion de escritorio, linea de comandos, navegador y Python), lo que sugiere un binario de calculo empaquetado junto con pesos en safetensors. No se detallan capas, mecanismos de atencion, tipo de transformer, ni si existe un componente de lenguaje subyacente.

Tampoco se documentan datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni indicacion de RLHF, DPO o ajuste supervisado. La unica referencia a evaluacion es un conjunto de 352 preguntas con respuestas doradas ("Golden answers"), descrito como benchmark propio del autor bajo el tipo `ai999x-evaluation`. La innovacion declarada es de producto, no de modelado: ejecucion totalmente offline, coherencia de respuestas entre Windows y Linux, y devolucion de una razon explicita en lugar de un numero cuando la entrada no es valida.

## Capacidades

- Resolucion de 88 calculos de ciencia de materiales en 13 temas, con formula, pasos intermedios y unidades.
- Cobertura tematica: estructuras cristalinas y difraccion (por ejemplo, angulo de Bragg, densidad teorica, parametro de red), defectos y difusion (ley de Fick, vector de Burgers), propiedades mecanicas y fractura, diagramas de fase (constituyentes microestructurales del acero al carbono), polimeros, ceramicas y compuestos (regla de mezclas), semiconductores y propiedades termicas (band gap a partir de conductividades).
- Modo de explicacion paso a paso orientado a resolucion de ejercicios y ayuda a estudiantes.
- Respuesta razonada ante entradas ausentes o fuera de rango, en lugar de un valor inventado.
- Ejecucion offline en el equipo del usuario, sin dependencia de API remota.
- Interfaz grafica con escenas y graficos generados a partir del resultado calculado.
- Uso programatico mediante paquete de Python (`pip install materials-science-ai999x`) y CLI `materials-science`.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de ciencia de materiales: el modelo resuelve ejercicios de densidad teorica, angulo de Bragg o ley de Fick mostrando formula, pasos y unidades, lo que encaja en asignaturas universitarias que exigen justificar el procedimiento y no solo el resultado.
- Correccion de practicas de laboratorio: se pueden recalcular parametros de red, densidades de ceramicas ionicasy propiedades elasticas de compuestos para contrastar los valores medidos por los alumnos, con la ventaja de que el calculo es reproducible y offline.
- Analisis de difraccion de rayos X: el calculo del angulo de Bragg y de parametros de red a partir de reflexiones permite interpretar patrones experimentales sin salir del portatil del laboratorio.
- Ingenieria de materiales metalicos: la determinacion de fase proeutectoide y perlita en aceros al carbono facilita la lectura de diagramas Fe-C en contextos de seleccion de aleaciones.
- Diseno preliminar de compuestos: la regla de mezclas para modulos elasticos de compuestos de fibra continua permite explorar combinaciones matriz-refuerzo antes de pasar a simulacion numerica.
- Caracterizacion de semiconductores: la estimacion del band gap a partir de conductividades intrinsecas a varias temperaturas resulta util en practicas de laboratorio de fisica del estado solido.
- Integracion en pipelines de Python: el paquete pip permite automatizar tandas de calculos y validaciones numericas en scripts de investigacion, con comportamiento identico en Windows y Linux x86-64.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (ciencia de materiales) | Golden answers (352 preguntas documentadas, Windows + Linux Python 3.10-3.14) | Accuracy | 1,0 ("identico en todas las plataformas") | No (verified: false) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 4.715.520 parametros el peso en safetensors es de escala muy pequena y el repo ocupa 0.0 GB, pero no se documenta huella de memoria en ejecucion.
- GPU recomendadas: no disponible; la model card no menciona requisitos de GPU ni aceleracion por hardware.
- Cabe en GPU consumer: previsiblemente si, dado el tamano declarado, aunque no hay confirmacion en la documentacion disponible.
- Opciones de despliegue: aplicacion de escritorio para Windows y Linux, CLI `materials-science`, version web en la pagina del modelo, y paquete de Python (`pip install materials-science-ai999x`) con build compilado en Windows y Linux x86-64 y build Python puro en macOS y ARM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| materials-science-ai999x | 4.715.520 | no disponible | Motor de calculo de ciencia de materiales offline | Apache 2.0 | Hugging Face, app de escritorio, CLI, web, pip |
| Modelos generativos de proposito general para ciencia | no disponible | no disponible | Generacion de texto y razonamiento | variable | no disponible |
| Herramientas de calculo cientifico tradicionales (Python/SciPy) | no disponible | no disponible | Calculo numerico programatico | variable | ampliamente disponible |

No se dispone de datos de benchmarks de terceros que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El unico benchmark declarado tiene accuracy 1,0 y aparece como no verificado; no debe tomarse como evidencia independiente de calidad.
- La cobertura se limita a 88 calculos en 13 temas; cualquier consulta fuera de ese catalogo no esta soportada.
- Solo se declara ingles como idioma, por lo que la interfaz y las explicaciones no estan disponibles en castellano.
- No se documentan arquitectura de red, datos de entrenamiento ni proceso de ajuste, lo que impide auditar el comportamiento fuera de los casos previstos.
- El etiquetado como "zero-hallucination" es una afirmacion del autor y no una garantia formal; el motor devuelve razones en lugar de valores cuando la entrada es invalida, pero la exactitud de las formulas y constantes no esta verificada externamente.
- No se declara soporte de tool calling, agentes, vision ni audio, por lo que no es adecuado como componente de un pipeline agentico generico.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio por si el autor anade condiciones adicionales.
- El modelo figura con `inference: false` en la model card, de modo que no se ejecuta directamente desde la infraestructura de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/materials-science-ai999x
- Pagina del modelo con demo web: https://www.ai999x.com/models/materials-science-ai999x/
- Demo interactiva: https://www.ai999x.com/models/materials-science-ai999x/#capabilities
- Aplicacion de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-materials-science-1.6.7-windows-x86_64.zip
- Aplicacion de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-materials-science-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de la aplicacion de escritorio: https://github.com/AI999X/ai999x-desktop
- Clip de demostracion (MP4): https://www.ai999x.com/?ax_shot=materials-science-ai999x/clip.mp4
