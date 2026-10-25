# AI999X/quantum-physics-ai999x

## Resumen

quantum-physics-ai999x es un motor determinista de resolución de problemas de física cuántica para Python, publicado por la organización AI999X (creador e ingeniero: Ibnul Jaif Farabi) bajo licencia Apache-2.0. No es un modelo de lenguaje generativo: se describe como un motor neuro-simbólico en el que una capa de lectura basada en reglas interpreta la pregunta en inglés y la enruta hacia una de sus 75 capacidades simbólicas certificadas, que calculan la respuesta con sympy y mpmath y la verifican antes de devolverla. El paquete se distribuye como wheel de Python (`py3-none-any`) y se ejecuta íntegramente en CPU, sin GPU, sin red y sin clave de API.

Su propuesta diferencial es la ausencia de respuestas inventadas: define siete resultados explícitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) y prefiere rechazar la consulta antes que aproximar un resultado. Cada respuesta incluye pasos intermedios, fórmulas en LaTeX, unidades y supuestos, lo que lo orienta a tutoría, corrección de ejercicios y cuadernos reproducibles.

La ficha de HuggingFace declara 4.715.520 parámetros en formato safetensors y etiquetas ONNX, si bien la model card no documenta ninguna red neuronal entrenada con descenso de gradiente: el comportamiento descrito corresponde a código simbólico más un paquete de conocimiento. Es relevante ahora por su encaje en el nicho de herramientas de dominio acotado, offline y auditables, en contraste con los asistentes generativos de propósito general, y por su promesa de reproducibilidad exacta entre plataformas (Windows y Linux, Python 3.10 a 3.14).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor neuro-simbolico determinista: lectura de preguntas basada en reglas + 75 capacidades simbolicas certificadas (sympy, mpmath). No es un transformer ni una red neuronal entrenada |
| Parametros totales | 4.715.520 (recuento real de los ficheros safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no gestiona contexto conversacional; acepta formas de pregunta documentadas y llamadas tipadas) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el runtime es Python puro sobre CPU) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (etiquetas del repositorio); distribucion principal como wheel de Python `py3-none-any` |
| Version | 1.0.0 (knowledge pack 1.0.1) |
| Capacidades certificadas | 75 procedimientos |
| Respuestas doradas documentadas | 376 |
| Pipeline declarado | question-answering |
| Inferencia en HuggingFace | No (`inference: false`) |
| Plataformas probadas | Windows (Python 3.13); Linux x86-64 (Python 3.10, 3.11, 3.12, 3.13, 3.14) |
| Dependencias de ejecucion | sympy, mpmath (Python puro) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas: (1) una capa de lectura basada en reglas que reconoce las formas de pregunta documentadas en ingles y extrae los parametros, o bien una llamada tipada `solve(capability_id, **inputs)`; (2) un conjunto de 75 procedimientos simbolicos certificados que cubren relatividad especial, fotones y ondas de materia, atomo de hidrogeno y momento angular, pozos cuanticos y efecto tunel, espin, qubits y puertas cuanticas, fisica nuclear y de particulas, y fisica estadistica; (3) una etapa de verificacion que comprueba el resultado por sustitucion inversa, analisis dimensional o comparacion con un calculo independiente antes de devolverlo.

No se documenta entrenamiento en el sentido habitual: no hay corpus de tokens, ni composicion de dataset, ni fases de RLHF o DPO. El equivalente a un conjunto de evaluacion es el paquete de 376 respuestas doradas documentadas, que actua como suite de regresion y que el autor declara reproducidas de forma identica en todas las plataformas probadas. La innovacion tecnica destacable no es arquitectonica sino de diseño de contrato: el sistema tiene prohibido responder fuera de sus capacidades certificadas y devuelve un rechazo explicito indicando que dato falta o por que la consulta queda fuera de alcance.

## Capacidades

- Resolucion de problemas de fisica cuantica con pasos intermedios, formulas en LaTeX, unidades y supuestos explicitos.
- Cobertura declarada: relatividad especial, fotones y ondas de materia, atomo de hidrogeno y momento angular, pozos cuanticos y tunelizacion, espin, qubits y puertas cuanticas, fisica nuclear y de particulas, fisica estadistica.
- Ejemplos verificables en la model card: factor de Lorentz, transiciones del hidrogeno, efecto fotoelectrico, circuitos de dos qubits, transmision a traves de una barrera de potencial.
- Interfaz dual: `ask()` para preguntas en ingles documentadas y `solve(capability_id, **inputs)` para llamadas tipadas garantizadas.
- Siete estados de salida explicitos (SOLVED, NEEDS_INPUT, AMBIGUOUS, INVALID_INPUT, OUT_OF_SCOPE, UNRECOGNIZED_FORMAT, INTERNAL_ERROR) en lugar de respuestas aproximadas.
- Ejecucion completamente offline en CPU, sin red, sin GPU y sin clave de API.
- Tareas adicionales declaradas en las etiquetas: token classification, text classification, sentence similarity y feature extraction; la model card no detalla procedimientos para estas tareas.
- No dispone de tool calling, agentes, razonamiento multi-paso abierto, vision, audio ni generacion libre de texto.

## Casos de uso

- Correccion automatica de ejercicios de fisica cuantica: el motor recibe los parametros del problema, recalcula la solucion con una capacidad certificada y permite comparar con la respuesta del alumno; los pasos y unidades devueltos sirven como justificacion de la nota.
- Plataformas de tutoría sin conectividad: al ejecutarse en CPU y sin red, puede desplegarse en aulas con equipos aislados o en entornos con requisitos de soberania de datos, manteniendo respuestas identicas entre Windows y Linux.
- Generacion de cuadernos reproducibles: los resultados incluyen formulas en LaTeX y supuestos, lo que permite volcar directamente el desarrollo a un notebook o a un informe docencia.
- Suite de regresion cientifica en CI: las 376 respuestas doradas pueden usarse como tests de plataforma (Python 3.10 a 3.14, Windows y Linux) para detectar regresiones numericas o de formato en pipelines de calculo cientifico.
- Pre-triaje de consultas en un asistente cientifico mayor: el motor actua como verificador determinista para consultas de fisica cuantica y devuelve OUT_OF_SCOPE cuando no aplica, evitando que un LLM aguas abajo invente la respuesta.
- Calculo de referencia en laboratorio o docencia de segundo ciclo: obtencion de magnitudes como energia de transicion, longitud de onda umbral o probabilidades de un circuito de dos qubits con trazabilidad de los pasos intermedios.
- Evaluacion de calidad de otros sistemas: comparar la salida de un modelo generativo frente a la solucion simbolica certificada sobre el mismo enunciado para medir tasas de alucinacion en el dominio.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el `model-index` de la model card, marcados como no verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering de fisica cuantica | Golden answers (376 preguntas documentadas, Windows + Linux Python 3.10-3.14) | accuracy | 1,0 | No (declarado por el autor) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. La metrica de 1,0 mide la coincidencia exacta con la propia suite de respuestas doradas del autor, no el rendimiento frente a un conjunto de evaluacion externo e independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el runtime es Python puro sobre CPU y no carga pesos en GPU.
- GPU recomendadas: ninguna. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier CPU consumer; también en entornos sin acelerador, contenedores ligeros y equipos de aula.
- Opciones de despliegue: instalacion via `pip install quantum-physics-ai999x` (PyPI) o desde el wheel del repositorio de HuggingFace; uso como biblioteca Python. No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Huella en disco: el repositorio de HuggingFace figura con 0.0 GB; el peso real del wheel no se detalla en la informacion disponible.
- Latencia y throughput: no disponible. Al ser calculo simbolico determinista, el coste depende del procedimiento invocado y de la precision numerica solicitada, no de un presupuesto de tokens.

## Comparativa con modelos similares

| Herramienta | Tipo | Parametros | Contexto | Licencia | Ejecucion offline | Disponibilidad |
|---|---|---|---|---|---|---|
| quantum-physics-ai999x | Motor simbolico determinista con lectura en lenguaje natural | 4.715.520 (safetensors) | No aplica | Apache-2.0 | Si, CPU | PyPI y HuggingFace |
| SymPy | Biblioteca de matematica simbolica | No aplica (no es un modelo) | No aplica | BSD | Si | PyPI |
| Wolfram Alpha | Motor de conocimiento y calculo en la nube | No disponible | No aplica | Propietaria | No | Servicio web y API de pago |
| LLM generativo de proposito general (p. ej. familia GPT o Llama) | Transformer decoder | No disponible en esta ficha | No disponible en esta ficha | Variable segun modelo | Depende del modelo | Amplia |

Frente a SymPy, la diferencia es la capa de lectura de lenguaje natural y el contrato de rechazo explicito; frente a Wolfram Alpha, la ejecucion local sin red y la licencia permisiva; frente a un LLM generativo, la ausencia de alucinacion en el dominio cubierto, a costa de un alcance mucho mas estrecho y de no generar texto libre. Los datos numericos de las alternativas no se han incluido porque no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance cerrado: solo responde a las 75 capacidades certificadas; cualquier consulta fuera de esa cobertura devuelve OUT_OF_SCOPE o UNRECOGNIZED_FORMAT. No es un asistente de fisica general.
- Solo ingles: la capa de lectura de preguntas reconoce formas documentadas en ingles; no se declara soporte de castellano ni de otros idiomas.
- No es un modelo generativo: no redacta explicaciones libres, no mantiene conversaciones multi-turno y no dispone de ventana de contexto.
- La precision declarada de 1,0 procede de la suite interna de 376 respuestas doradas del propio autor y esta marcada como no verificada; no equivale a una evaluacion independiente.
- El recuento de 4.715.520 parametros en safetensors no se corresponde con ninguna arquitectura neuronal descrita en la model card: conviene tratar ese dato como metadato del repositorio y no como tamano de un modelo entrenado.
- La model card declara `inference: false` en HuggingFace, por lo que el uso requiere instalar el paquete en local; el widget de inferencia del Hub no esta operativo.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin evidencia externa de uso en produccion. La fecha de creacion registrada en el Hub es 2026-10-25.
- Sin datos publicados de sesgos, robustez frente a entradas malformadas mas alla de los siete estados declarados, ni resultados de latencia.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no se declaran restricciones adicionales, pero tampoco garantias explicitas por parte del autor.
- Dependencia de sympy y mpmath: la exactitud numerica y el comportamiento pueden variar con la version de estas bibliotecas, aunque el autor declara respuestas identicas en las plataformas probadas.

## Enlaces

- HuggingFace: https://huggingface.co/AI999X/quantum-physics-ai999x
- PyPI: https://pypi.org/project/quantum-physics-ai999x/
- Guia de capacidades: https://huggingface.co/AI999X/quantum-physics-ai999x/tree/main/docs
- Evaluacion: https://huggingface.co/AI999X/quantum-physics-ai999x/tree/main/evaluation
- Organizacion en HuggingFace: https://huggingface.co/AI999X
- Sitio web: https://ai999x.com
- Soporte al autor: https://buymeacoffee.com/ibnuljaiffarabi
- Wheel de instalacion directa: https://huggingface.co/AI999X/quantum-physics-ai999x/resolve/main/dist/quantum_physics_ai999x-1.0.0-py3-none-any.whl
