# issai/foggen-qwen3-1.7b

## Resumen

FogGen (Qwen3-1.7B) es un ajuste fino del modelo Qwen/Qwen3-1.7B desarrollado por issai, disenado para un protocolo de enrutamiento edge-cloud con confianza verbalizada. El modelo no pretende resolver tareas por si solo: su funcion es emitir una respuesta junto con un nivel de confianza calibrado (0.0, 0.25, 0.5, 0.75, 1.0) que un sistema externo usa para decidir si la consulta se responde en el dispositivo (edge) o se deriva a un modelo mayor en la nube (Qwen3-30B-A3B-Instruct-2507). Es la version escalada del endpoint canonico issai/foggen (0.6B), y existe principalmente para validar si la receta de entrenamiento transfiere entre tamanos de backbone.

El modelo tiene 1.720.574.976 parametros totales, arquitectura transformer densa heredada de Qwen3, licencia Apache 2.0 e idiomas declarados ingles y kazajo. Se entrena con 14 rondas secuenciales de SFT sobre LoRA en siete dominios (finanzas, ciencia, codigo, derecho, matematicas, cultura kazaja y medicina), con un buffer de calibracion de 1.800 preguntas re-etiquetado desde el backbone base.

Su relevancia es acotada pero especifica: ofrece un punto de medida empirico sobre enrutamiento consciente de la confianza a escala 1.7B, con resultados publicados por dominio (precision media del sistema del 79,1% frente al 74,4% del enrutamiento aleatorio). No es un modelo de proposito general ni compite con modelos frontier; es un componente de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16; repo de 3,5 GB) |
| Idiomas soportados | Ingles (en), kazajo (kk) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B sin modificaciones estructurales: un transformer denso de 1.700 millones de parametros. El ajuste se realiza mediante LoRA con rango 16, alpha 32, aplicado a todas las capas lineales, en bf16, durante 2 epocas por ronda con tasa de aprendizaje 5e-5. El entrenamiento consiste en 14 rondas secuenciales de SFT (R0 a R14) con rotacion de siete dominios: finanzas, ciencia, codigo, derecho, matematicas, cultura kazaja y medicina. El profesor en la nube es Qwen3-30B-A3B-Instruct-2507, que genera las respuestas de referencia.

La innovacion principal no es arquitectonica sino de formato y calibracion: el modelo aprende a emitir primero una etiqueta de confianza en cinco niveles discretos y despues la respuesta final, sin etiquetas `<think>`. En R0, el buffer de calibracion de 1.800 preguntas se re-etiqueta desde cero con el Qwen3-1.7B base (N=8, temperatura 0,7), de modo que la calibracion inicial refleja el comportamiento real del backbone y no la del modelo 0.6B. El dataset de entrenamiento es issai/foggen-data, con issai/KazCulture como fuente adicional para el dominio cultural kazajo. No se documentan fases de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple (MCQ) en siete dominios.
- Emision de confianza verbalizada en cinco niveles discretos (0.0, 0.25, 0.5, 0.75, 1.0) previa a la respuesta.
- Formato de salida estructurado y estable (`Confidence:` / `Final answer:`), apto para parseo automatico.
- Soporte de enrutamiento edge-cloud: la confianza emitida alimenta una funcion `route_query` con umbral tau.
- Capacidad multilingue limitada a ingles y kazajo.
- Conocimiento especifico de cultura kazaja, con la mayor precision edge-only de todos los dominios (90,3%).
- Aprendizaje continuo multi-ronda: el checkpoint R14 incorpora 14 iteraciones secuenciales de ajuste.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Enrutamiento edge-cloud en produccion: el modelo responde en el dispositivo y emite una confianza; si esta queda por debajo de tau (0,5 en la evaluacion), la consulta se deriva al modelo en la nube. Con tau=0,5 deriva solo el 23,3% de las consultas y recupera 11,3 puntos sobre la precision edge-only.
- Clasificacion y respuesta de MCQ en dominios regulados: en derecho y medicina, donde el coste de un error es alto, el umbral puede bajarse para derivar mas consultas a la nube (28,1% y 30,2% respectivamente) y priorizar precision sobre coste.
- Asistencia en matematicas con derivacion selectiva: es el dominio donde el edge rinde peor (48,6%), por lo que el sistema deriva el 35,9% de las consultas; util para desplegar un asistente educativo que solo invoca computo caro cuando el modelo local no esta seguro.
- Preservacion y difusion de cultura kazaja: con 90,3% de precision edge-only y solo 7,4% de derivacion, es viable como asistente cultural totalmente local en kazajo, sin coste de nube.
- Filtrado previo en pipelines de atencion al cliente: el modelo actua como primera linea que resuelve consultas simples en local y escala las complejas, reduciendo el coste por consulta con un modelo de 1,7B.
- Investigacion sobre calibracion y auto-conocimiento: sirve como banco de pruebas para estudiar la transferencia de recetas de calibracion entre escalas (0,6B frente a 1,7B) con el mismo profesor y los mismos datos.
- Generacion de codigo con escalado selectivo: 72,7% edge-only y 18,4% de derivacion, adecuado para autocompletado local con escalado a un modelo mayor en casos ambiguos.

## Benchmarks y rendimiento

Resultados del checkpoint R14 con tau = 0,5 sobre los siete conjuntos de evaluacion. La precision del sistema cuenta la respuesta edge en consultas retenidas y la respuesta de la nube (Qwen3-30B-A3B-Instruct-2507) en consultas derivadas. Claves de respuesta corregidas de issai/foggen-data.

| Dominio | Solo nube | Solo edge | Enrutamiento aleatorio | FogGen | Derivado a nube |
|---|---|---|---|---|---|
| Finanzas | 92,3% | 66,4% | 71,4% | 76,5% | 19,3% |
| Ciencia | 93,6% | 66,4% | 72,8% | 78,8% | 23,7% |
| Codigo | 93,5% | 72,7% | 76,5% | 80,8% | 18,4% |
| Derecho | 87,7% | 63,9% | 70,6% | 74,8% | 28,1% |
| Matematicas | 95,5% | 48,6% | 65,4% | 71,8% | 35,9% |
| Cultura kazaja | 96,2% | 90,3% | 90,7% | 92,3% | 7,4% |
| Medicina | 88,9% | 66,3% | 73,1% | 78,8% | 30,2% |
| Media | 92,5% | 67,8% | 74,4% | 79,1% | 23,3% |

FogGen supera al enrutamiento aleatorio en 4,7 puntos en R14 y en 5,7 puntos de media sobre las rondas 1 a 14. El error de calibracion esperado medio (ECE) es de 22,8 en R14, un valor alto que indica calibracion imperfecta. Con las claves almacenadas de la primera release, R14 alcanza 70,4% frente al 68,0% del enrutamiento aleatorio. No se publican resultados de MMLU, HumanEval ni GSM8K estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, mas memoria de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto y tamano de lote.
- En cuantizacion de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, aproximadamente 1 GB. No se documentan ficheros GGUF en el repositorio.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070) para bf16; A100, H100 y L40S para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y superiores.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp como alternativas compatibles con safetensors o tras conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que el coste por consulta es aproximadamente 3 veces el del endpoint de 0,6B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision media del sistema | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| issai/foggen-qwen3-1.7b | 1,72B | no disponible | 79,1% (R14, tau=0,5) | Apache 2.0 | HuggingFace |
| issai/foggen (0,6B) | no disponible en la informacion | no disponible | no disponible en la informacion | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | 67,8% (solo edge, MCQ) | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B (MoE) | no disponible | 92,5% (solo nube) | no disponible en la informacion | HuggingFace |

La comparacion relevante es contra el backbone base y contra el profesor: el ajuste FogGen aporta 11,3 puntos sobre el backbone en modo edge-only y el sistema completo se queda a 13,4 puntos del profesor puro, derivando solo el 23,3% de las consultas.

## Limitaciones y advertencias

- Calibracion deficiente: el ECE medio de 22,8 en R14 indica que las confianzas declaradas no estan bien calibradas; el umbral tau debe ajustarse por dominio y validarse con datos propios.
- Ambito restringido: entrenado exclusivamente para MCQ en siete dominios; no se garantiza su comportamiento en generacion abierta, dialogos largos o tareas fuera de distribucion.
- Idiomas limitados a ingles y kazajo; el rendimiento en castellano u otras lenguas no esta evaluado.
- Riesgo de alucinacion en las respuestas edge, especialmente en matematicas (48,6% de precision edge-only), donde el modelo falla con frecuencia y la confianza no siempre lo refleja.
- El checkpoint 1.7B no es el modelo de despliegue canonico segun el autor; el endpoint recomendado es issai/foggen (0,6B), y esta variante existe para validar la transferencia de la receta.
- Requiere un sistema externo de enrutamiento (`route_query` con umbral tau) para aportar valor; por si solo rinde por debajo del enrutamiento aleatorio en varios dominios.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan evaluaciones de seguridad, sesgos ni robustez adversarial.
- Advertencia sobre la model card: la version actual corrige errores de versiones anteriores que contabilizaban las consultas derivadas con la precision media de la nube y usaban claves de respuesta antiguas; los resultados publicados antes de la correccion no son comparables.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines que requieran invocacion de funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/issai/foggen-qwen3-1.7b
- Modelo canonico 0,6B: https://huggingface.co/issai/foggen
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor en la nube: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/issai/foggen-data
- Dataset de cultura kazaja: https://huggingface.co/datasets/issai/KazCulture
- Paper: anunciado como "coming soon", no disponible
