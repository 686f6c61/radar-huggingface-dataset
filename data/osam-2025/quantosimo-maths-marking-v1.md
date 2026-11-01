# Osam-2025/quantosimo-maths-marking-v1

## Resumen

QuantOsimo Maths Marking Model v1 es un ajuste fino de `microsoft/phi-3-mini-4k-instruct` orientado a la correccion automatica de respuestas de matematicas del curriculo britanico (GCSE, AS-Level y A-Level). Dado un enunciado, la respuesta del alumno y el esquema de puntuacion oficial (mark scheme), el modelo asigna la puntuacion y genera retroalimentacion con estilo de examinador. Lo desarrolla Samuel Osagiede (usuario Osam-2025) y se publica bajo licencia Apache 2.0.

El modelo parte de la arquitectura Phi-3-mini, un transformer denso de 3.800 millones de parametros con una ventana de contexto de 4.096 tokens. El ajuste fino se realizo sobre 5.421 ejemplos extraidos de 587 examenes oficiales de AQA, Edexcel y OCR entre 2018 y 2025. El repositorio ocupa 0,1 GB, lo que sugiere pesos en precision reducida o un subconjunto de los mismos.

Su relevancia es acotada pero concreta: es uno de los pocos ajustes finos publicos especializados en evaluacion automatizada de matematicas con esquemas de puntuacion reales, un nicho con demanda creciente en plataformas EdTech. No obstante, la evaluacion publicada se realizo sobre material incluido en el entrenamiento, por lo que sus cifras de rendimiento no deben interpretarse como capacidad de generalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-3-mini) |
| Parametros totales | 3.800 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-3-mini-4k-instruct: un transformer decoder-only denso con 3.800 millones de parametros y atencion de contexto completo hasta 4.096 tokens. No se documentan modificaciones estructurales sobre el modelo base; el trabajo consiste en un ajuste fino supervisado sobre un corpus especializado de marcado de examenes.

Los datos de entrenamiento provienen de esquemas de puntuacion oficiales de AQA, Edexcel y OCR para matematicas de GCSE (Foundation y Higher), AS-Level y A-Level, cubriendo los anos 2018 a 2025. En total, 5.421 ejemplos extraidos de 587 examenes. El autor no publica los datos por restricciones de copyright de las juntas examinadoras, aunque incluye una muestra de 100 ejemplos con el formato en el repositorio. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento, la composicion exacta del dataset o los hiperparametros empleados.

## Capacidades

- Correccion de respuestas de matematicas contra esquemas de puntuacion oficiales, con asignacion de puntuacion parcial por pasos.
- Generacion de retroalimentacion con estilo de examinador a partir del enunciado, la respuesta del alumno y el mark scheme.
- Cobertura de tres niveles educativos: GCSE Foundation, GCSE Higher, AS-Level y A-Level.
- Cobertura de tres juntas examinadoras: AQA, Edexcel y OCR.
- Manejo de preguntas de 2 a 5 marcas, segun el conjunto de evaluacion publicado.
- Comprension de texto en ingles exclusivamente.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Correccion automatica en plataformas EdTech: el modelo recibe el enunciado, la respuesta del alumno y el mark scheme, y devuelve la puntuacion con justificacion. Es adecuado para preguntas de 2 a 5 marcas del curriculo britanico, el rango sobre el que se entreno.
- Generacion de retroalimentacion formativa: a partir de la puntuacion asignada, el modelo produce comentarios estilo examinador que el alumno puede usar para entender donde perdio marcas, reduciendo la carga de correccion del profesorado.
- Previsualizacion de calificaciones para estudiantes: integrado en un portal de practica, permite al alumno autoevaluarse antes de entregar un ejercicio, con la salvedad de que la evaluacion publicada no mide generalizacion.
- Investigacion en evaluacion automatizada: sirve como linea base reproducible para comparar tecnicas de marcado automatico sobre esquemas de puntuacion reales, dado que el formato de datos esta documentado con 100 ejemplos.
- Control de calidad de material didactico: el modelo puede verificar que las soluciones modelo de un banco de ejercicios obtienen la puntuacion esperada segun el mark scheme correspondiente.
- Asistencia a profesores en correccion masiva: en un pipeline por lotes, el modelo precalifica respuestas y el docente revisa unicamente los casos de baja confianza o las preguntas de mayor puntuacion, que quedan fuera del rango entrenado.
- Prototipado de asistentes de estudio especializados: al ser un ajuste fino pequeno (0,1 GB de repositorio) sobre Phi-3-mini, puede desplegarse en entornos con recursos limitados para validar productos de evaluacion antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre 50 preguntas de examenes de 2023 y 2024 (material incluido en el entrenamiento, no reservado para test):

| Metrica | Resultado |
|---|---|
| Aciertos globales | 44/50 (88%) |
| Errores o entrada ilegible | 6/50 (12%) |
| AQA | 88% (15/17) |
| Edexcel | 100% (17/17) |
| OCR | 75% (12/16) |
| GCSE | 91% (31/34) |
| AS-Level | 100% (10/10) |
| A-Level | 50% (3/6) |

Notas del autor relevantes para interpretar la tabla: 5 de los 6 fallos corresponden a extracciones de PDF corruptas, la puntuacion de A-Level se basa en solo 6 preguntas y el conjunto de evaluacion no se reservo, por lo que los resultados probablemente sobreestiman el rendimiento en examenes no vistos. No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion del autor. Como referencia del modelo base Phi-3-mini (3.800 millones de parametros), en FP16 requiere aproximadamente 7,6 GB de VRAM, en int8 unos 3,8 GB y en int4 alrededor de 2 GB; estas cifras son estimaciones sobre la arquitectura base, no datos publicados para este ajuste.
- GPU recomendadas: no especificadas por el autor. Para el modelo base, una RTX 4090 (24 GB) o una A100 permiten inferencia en FP16 con holgura; una RTX 3060 de 12 GB o superior basta para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: si, en principio, al tratarse de un modelo de 3.800 millones de parametros; el autor no publica requisitos especificos.
- Opciones de despliegue: el autor no documenta ninguna. Al estar en safetensors, es compatible con vLLM, TGI y transformers; para llama.cpp u Ollama requeriria conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especializados en marcado de examenes del curriculo britanico. Como referencia de categoria (modelos pequenos ajustados para tareas educativas), se incluye el modelo base:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| QuantOsimo Maths Marking v1 | 3.800 M | 4.096 | Marcado de matematicas GCSE/AS/A-Level (AQA, Edexcel, OCR) | Apache 2.0 |
| microsoft/phi-3-mini-4k-instruct | 3.800 M | 4.096 | Instrucciones generales, sin especializacion en marcado | MIT |
| Alternativas especializadas en evaluacion automatica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre matematicas y exclusivamente el curriculo britanico (GCSE, AS-Level y A-Level); no generaliza a otras asignaturas ni a otros sistemas educativos.
- La evaluacion publicada se realizo sobre preguntas incluidas en el entrenamiento (2023-2024), por lo que el 88% reportado no refleja el rendimiento esperable en examenes nuevos.
- El resultado en A-Level (50%) se basa en 6 preguntas, muestra demasiado pequena para extraer conclusiones.
- Solo procesa texto en ingles; no se documenta soporte multilingue.
- El modelo depende de la calidad de la extraccion del PDF: 5 de los 6 fallos de la evaluacion se atribuyen a texto de entrada corrupto, lo que exige un preprocesado robusto en produccion.
- Ventana de contexto de 4.096 tokens: enunciados, respuestas y mark schemes largos pueden truncarse.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento fuera de distribucion; al ser un ajuste fino sobre un modelo de instrucciones generales, la generacion de justificaciones puede contener afirmaciones no respaldadas por el mark scheme.
- No se documenta el uso de RLHF o DPO, ni hiperparametros de entrenamiento, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; los datos de entrenamiento no son publicos por copyright de las juntas examinadoras.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Osam-2025/quantosimo-maths-marking-v1
- Modelo base: https://huggingface.co/microsoft/phi-3-mini-4k-instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
