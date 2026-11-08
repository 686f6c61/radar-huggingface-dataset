# researchase/rs-blender-build-smollm2-360m

## Resumen

RS Blender Quick build (SmolLM2-360M) es un ajuste fino completo de SmolLM2-360M-Instruct, desarrollado por researchase (Reasoning School), que convierte peticiones en lenguaje natural sobre objetos a construir en Blender en una descripcion de construccion en JSON. El modelo no genera geometria ni codigo: extrae la forma y las medidas mencionadas, y el compilador de la pagina del curso traduce esa descripcion a Python de Blender que se ejecuta como un unico paso de deshacer.

El caso de uso es muy concreto: es el motor detras de la funcion Quick build del curso de Blender de Reasoning School, que ejecuta Blender real en el navegador. El modelo corre integramente en el navegador del estudiante mediante transformers.js sobre ONNX, de modo que lo que el alumno escribe no sale de su dispositivo; el navegador solo descarga el modelo una vez. Esta orientado a estudiantes de unos 11 anos en adelante y a un vocabulario cerrado de objetos (cubo, caja, suelo, esfera, cilindro, cono, anillo, caja de embalaje, barril, mesa, silla, escaleras, pared, valla, estanteria, lampara, arbol, escalera de mano, robot, texto 3D, puerta, arco, rampa, plataforma).

Arquitectonicamente es un transformer denso de 361.821.120 parametros (aproximadamente 360M), con licencia Apache 2.0, publicado en formato safetensors (bf16) y ONNX cuantizado a 4 bits para el navegador. Su relevancia radica en demostrar un patron de despliegue de LLM pequeno, cuantizado y local en WebGPU para una tarea de extraccion estructurada muy acotada, con una evaluacion centrada en el resultado final (que el compilador produzca el mismo Python de Blender) en lugar de metricas genericas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia SmolLM2, ajuste fino de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q4 (MatMulNBits, bloque 32; tabla de palabras int8 con escala por palabra, resto fp32); pesos completos en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), ONNX (`onnx/model_q4.onnx`, 275 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de SmolLM2-360M-Instruct, un transformer denso de aproximadamente 360M parametros. La innovacion no esta en la arquitectura, sino en el pipeline de datos y en el objetivo: el modelo aprende a mapear peticiones en lenguaje natural a una descripcion de construccion en JSON con un vocabulario de formas cerrado, sin calcular geometria, que queda en manos del compilador del curso.

El entrenamiento uso aproximadamente 52.000 pares sinteticos peticion → descripcion generados por un generador. Cada peticion se escribe de muchas formas: unidades (sin unidad = metros, m, cm, pulgadas, pies, un tamano en otra unidad), tamanos antes o despues del sustantivo, tamanos compactos (`2x1x0.5`), numeros y fracciones en palabras, colores, filas y rejillas, mayusculas y erratas; tambien se generan peticiones que no son de construccion. Cada descripcion se valido compilandola, y se descartaron los pares que el compilador rechazaba. El Python del compilador se probo en Blender 5.1: cada objeto se construye como malla cerrada, al tamano pedido y con el origen en la base. La configuracion de entrenamiento fue de 2 epocas, AdamW, learning rate 1e-4 con decaimiento coseno, batch de 64, sobre una unica RTX 3090. El prompt de sistema y los ajustes de entrenamiento se publican en `quickbuild.json`.

## Capacidades

- Extraccion estructurada: convierte una peticion en un objeto JSON con forma y medidas (metros salvo que se indique otra unidad), por ejemplo `{"shape":"pillar","height":3,"diameter":"40 cm"}`.
- Reconocimiento de un vocabulario cerrado de formas: cubo, caja, suelo, esfera, cilindro/pilar/rueda, cono/piramide, anillo, caja de embalaje, barril, mesa/escritorio, silla, taburete, escaleras, pared (con puerta y ventanas), valla, estanteria, lampara, arbol, escalera de mano, robot, texto 3D, puerta, arco, rampa y plataforma.
- Atributos: color, repeticiones en fila y en rejilla, y conteo de elementos.
- Deteccion de peticiones no construibles: preguntas, ediciones ("hazlo mas alto"), objetos fuera del vocabulario o formas soportadas con caracteristicas no realizables devuelven `{"shape":"unknown"}`, y el curso ofrece entonces a Violet, su tutor.
- Generacion en formato JSON estrictamente valido (todas las respuestas de la evaluacion fueron JSON valido).
- Ejecucion en navegador con transformers.js sobre WebGPU (o WASM en CPU, segun el modelo hermano), con decodificacion greedy.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso; no es un asistente general.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Generacion de descripciones de construccion en un curso de Blender en el navegador: el estudiante escribe "una pared de 4 m con una puerta" y el modelo devuelve la descripcion JSON que el compilador convierte en Python de Blender; es el caso de uso principal y para el que fue entrenado.
- Privacidad por diseno en entornos educativos: al ejecutarse en el dispositivo del alumno, el texto escrito nunca se envia a un servidor; solo se descarga el modelo una vez, lo que simplifica el cumplimiento en centros escolares.
- Prototipado de un front-end de modelado parametrico: sirve como ejemplo de capa de extraccion de intencion (forma, dimensiones, color, repeticiones) que alimenta un generador de geometria determinista.
- Educacion STEM con estudiantes a partir de unos 11 anos: el vocabulario acotado y la respuesta JSON predecible permiten construir ejercicios guiados sin exponer a los alumnos a un chatbot generalista.
- Despliegue en WebGPU sin backend: con 275 MB en q4, puede servirse como activo estatico y ejecutarse en el navegador, lo que reduce costes de infraestructura frente a una API de inferencia.
- Filtrado y derivacion a un tutor: la clase `unknown` permite detectar peticiones fuera de alcance o no construibles y redirigirlas a un asistente conversacional, integrando el modelo como primer eslabon de un pipeline.
- Referencia para ajuste fino de tareas estrechas: el pipeline de datos sinteticos validados por compilador es replicable para otros dominios con salida estructurada y verificable.

## Benchmarks y rendimiento

La evaluacion se puntua por lo que se construye: una respuesta es correcta si el compilador genera el mismo Python de Blender que con la descripcion esperada.

| Conjunto de test | Peticiones | Misma construccion | Tipo de objeto correcto |
|---|---|---|---|
| Ciego, escrito antes de entrenar este modelo, ejecutado una vez | 30 | 90,0 % | 96,7 % |
| Conjunto escrito a mano (usado para detectar carencias de la v1) | 50 | 98,0 % | 100 % |
| Validacion sintetica | 400 | 98,8 % (JSON exacto) | no disponible |

Todas las respuestas fueron JSON valido. Errores conocidos del conjunto ciego: en "4 m by 20 cm by 20 cm" el ultimo tamano puede perder su unidad (resultando una caja de 20 m, visible en la vista previa antes de construir); "a marble 2 cm" se interpreto como no construible; un "hexagon pillar" sale redondo. La exportacion del modelo de navegador en 4 bits uso el mismo pipeline que el modelo de RS Workshop, cuyas respuestas en navegador coincidieron con las del modelo completo. No se han publicado resultados en benchmarks genericos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de navegador en q4 ocupa 275 MB; los pesos completos en bf16 ocupan aproximadamente 0,72 GB (361,8M parametros x 2 bytes), por lo que la inferencia en bf16 requiere del orden de 1 a 2 GB de memoria.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para la variante ONNX; para los pesos bf16 en Python, una GPU consumer con 4 GB o mas es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna; el entrenamiento se realizo en una unica RTX 3090.
- Opciones de despliegue: transformers.js con `dtype: "q4"` y `device: "webgpu"` (o WASM en CPU) para el navegador; transformers en Python con `model.safetensors` para el modelo completo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo usa decodificacion greedy con `max_new_tokens` de 110 y prompt ChatML fijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| rs-blender-build-smollm2-360m | 361,8M | no disponible | apache-2.0 | Extraccion de descripciones de construccion para Blender, en navegador | Hugging Face, ONNX q4 y safetensors |
| researchase/rs-quickbuild-smollm2-360m | no disponible (basado en SmolLM2-360M) | no disponible | no disponible | Descripcion de piezas para la app CAD RS Workshop, en navegador | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | no disponible | no disponible | no disponible | Modelo instructivo generalista de 360M, base del ajuste fino | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente general: solo produce descripciones de construccion para el compilador del curso, en ingles y con un vocabulario cerrado.
- Las respuestas son descripciones que debe comprobar y construir codigo, nunca codigo para ejecutar directamente.
- Errores conocidos: perdida de unidad en el ultimo tamano de una terna ("4 m by 20 cm by 20 cm"), clasificacion de objetos no construibles como `unknown` (por ejemplo, "a marble 2 cm") y formas con lados no soportadas que se aproximan a otras ("hexagon pillar" sale redondo).
- Riesgo de alucinacion controlado por el formato JSON y el vocabulario cerrado, pero las medidas extraidas pueden ser incorrectas y deben verificarse en la vista previa antes de construir.
- Solo soporta ingles; no hay datos sobre otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo esta disenado para el pipeline concreto del curso y su compilador.
- No se documentan sesgos especificos; al entrenarse con datos sinteticos, puede no generalizar a vocabulario o unidades fuera de la distribucion de entrenamiento.
- El prompt debe usarse exactamente como se indica (ChatML, system prompt concreto, decodificacion greedy); desviarse puede degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/researchase/rs-blender-build-smollm2-360m
- Modelo hermano para RS Workshop: https://huggingface.co/researchase/rs-quickbuild-smollm2-360m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo base (sin instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Curso Make It in Blender: https://reasoning.school/learn/blender/
