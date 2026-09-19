# kshetrajna12/reflex-qwen3.5-4b-lora

## Resumen

reflex-qwen3.5-4b-lora es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario kshetrajna12. No es un modelo generativo de texto: es un modelo de decisión de "System One" que recibe un estado (state) y una lista de preguntas con respuestas fijas, y devuelve en una sola pasada una probabilidad calibrada para cada opción. Forma parte de reflex, una recreación abierta de Jev, el modelo de decisión de TypeSafe descrito en su blog.

Su relevancia práctica está en la calibración: el adaptador se entrenó minimizando una regla de puntuación propia (proper scoring rule) sobre los logits de siguiente token restringidos a las etiquetas, con una temperatura de calibración ajustada de 1.234. Según la model card, esto hace que las probabilidades sean "honestas": cuando el modelo indica un 85 %, acierta aproximadamente el 85 % de las veces. Al no generar texto libre, no puede inventar respuestas fuera de la lista proporcionada y no hay salida que parsear.

El adaptador se sirve mediante reflex-serve o mediante la API de Python de reflex, y expone un endpoint /v1/systemone compatible con el del servicio alojado de TypeSafe, de modo que el código cliente de Jev funciona sin cambios. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B. La model card indica que el modelo base es multimodal nativo; detalles de arquitectura del base no disponibles |
| Parametros totales | No disponible para el adaptador (repo de 0.0 GB). El modelo base se denomina 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (campo de idiomas vacio en HuggingFace) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), mas un fichero calibration.json |
| Pipeline | text-classification |
| Libreria | peft |
| Temperatura de calibracion | 1.234 (aplicada automaticamente via reflex) |
| Tipos de pregunta | noul, choice (hasta 26 opciones), score (2 a 10 niveles) |
| Tarea | Clasificacion / decision con probabilidades calibradas |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA acoplado a Qwen/Qwen3.5-4B, cuyo comportamiento en inferencia consiste en leer los logits de siguiente token restringidos al conjunto de etiquetas de cada pregunta. Todas las preguntas de una peticion se responden de forma independiente y en paralelo sobre una unica codificacion del estado, por lo que formular veinte preguntas sobre un mismo documento tiene un coste similar al de formular una sola. El estado (state) puede ser una cadena o cualquier JSON, e incluye soporte para imagenes mediante objetos {"type": "image", "source": "..."}, ya que el modelo base es multimodal de forma nativa.

El entrenamiento se realizo con la herramienta reflex-calibrate, que adjunta los adaptadores LoRA y minimiza una regla de puntuacion propia (entropia cruzada contra un objetivo duro o suave) sobre los logits de siguiente token restringidos a etiquetas. La model card describe este procedimiento como la forma supervisada del "RLCD" de Jev. Los datos provienen de reflex-data e incluyen conjuntos publicos (banking77, CLINC, MMLU-Pro, civil_comments con etiquetas suaves de toxicidad, HaluEval, MS MARCO, HelpSteer2 con distribuciones de puntuacion por anotador y un conjunto de revision de codigo de GitHub) ademas de datos sinteticos correctos por construccion para adecuacion de instrucciones, enrutado basado en reglas y lectura de probabilidades a partir de tasas base declaradas. Segun la model card, no se usaron elementos de benchmark y el pipeline incorpora una comprobacion de solapamiento de 8-gramas contra los elementos publicos de JevBench.

## Capacidades

- Clasificacion con probabilidades calibradas: devuelve distribuciones por opcion en lugar de texto libre.
- Tres tipos de pregunta: noul (probabilidad de que algo sea cierto), choice (seleccion entre hasta 26 opciones, con probabilidades y confidence) y score (escala ordenada de 2 a 10 niveles, con score ponderado por probabilidad, legend y confidence).
- Procesamiento de estado arbitrario: acepta cadenas o JSON estructurado como entrada de estado.
- Entrada multimodal: el estado puede incluir imagenes mediante {"type": "image", "source": "<ruta, URL o data: URI>"}, dado que el modelo base es multimodal.
- Ejecucion por lotes de preguntas: todas las preguntas de una peticion se resuelven en paralelo sobre una sola codificacion del estado.
- Compatibilidad de API: misma forma de peticion y respuesta que el /v1/systemone alojado de TypeSafe.
- Uso programatico sin servidor mediante la clase Engine de reflex.
- Capacidades NO soportadas de forma declarada: generacion de texto, aritmetica y cualquier tarea que requiera una cadena de razonamiento.

## Casos de uso

- Enrutado y triaje de tickets de soporte: con un tipo choice se asigna cada ticket a un equipo (por ejemplo, pagos, cuenta u otros) con una probabilidad por cola, y el umbral de decision se fija en el codigo de la aplicacion.
- Triaje de incidentes: clasificacion de informes de incidencias por severidad o equipo responsable usando preguntas de tipo score y choice en una sola pasada sobre el texto del incidente.
- Revision de pull requests: pregunta del tipo "¿necesita esto la revision de un ingeniero senior?" sobre hunks de codigo, con un umbral configurable para decidir si se escala.
- Guardarrailes sobre salidas de LLM: comprobar con preguntas noul si la respuesta esta fundamentada en la fuente, si contiene datos personales o si esta dentro del alcance, a una fraccion del coste del modelo que genero el texto.
- Etiquetado masivo y reranking: puntuar millones de filas por lotes (por ejemplo, durante la noche) y usar las probabilidades resultantes como caracteristicas de un modelo posterior.
- Moderacion de contenido: uso de civil_comments con etiquetas suaves de toxicidad como base de entrenamiento para emitir probabilidades de toxicidad en lugar de decisiones binarias.
- Clasificacion de intenciones en asistentes conversacionales: mediante CLINC y banking77, clasificacion de la intencion del usuario con probabilidades para gestionar el fallback cuando la confianza es baja.

## Benchmarks y rendimiento

Evaluacion en el conjunto de validacion reservado durante el entrenamiento:

| Metrica | Valor |
|---|---|
| n | 1720 |
| Exactitud (acc) | 0.7680 |
| ECE | 0.0510 |
| Brier | 0.2979 |
| NLL | 0.5837 |
| Confianza media (mean_conf) | 0.8177 |

Desglose por intervalos de confianza (la model card esta truncada a partir del intervalo [0.7):

| Intervalo de confianza | Confianza media | Exactitud | Recuento |
|---|---|---|---|
| [0.13, 0.20) | 0.180 | 0.333 | 3 |
| [0.20, 0.27) | 0.247 | 0.182 | 22 |
| [0.27, 0.33) | 0.311 | 0.333 | 33 |
| [0.33, 0.40) | 0.368 | 0.273 | 44 |
| [0.40, 0.47) | 0.434 | 0.375 | 48 |
| [0.47, 0.53) | 0.507 | 0.352 | 108 |
| [0.53, 0.60) | 0.570 | 0.449 | 89 |
| [0.60, 0.67) | 0.635 | 0.569 | 72 |
| [0.67, 0.73) | 0.706 | 0.690 | 100 |
| [0.73, ...) | No disponible (model card truncada) | No disponible | No disponible |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM: la model card indica que sirve cualquier GPU CUDA con 16 GB o mas.
- La primera peticion compila kernels y tarda aproximadamente 20 segundos.
- Cabe en GPU de consumo con 16 GB o mas, segun la indicacion del autor (por ejemplo, gamas con 16 GB de VRAM); no se detallan modelos concretos.
- Opciones de despliegue documentadas: reflex-serve (servidor HTTP con endpoint /v1/systemone en el puerto 8000) y uso embebido en Python mediante reflex.Engine.load.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles, salvo el dato de los aproximadamente 20 segundos de compilacion inicial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reflex-qwen3.5-4b-lora | Adaptador LoRA sobre base de ~4B | No disponible | Modelo de decision (noul/choice/score) | MIT | Abierto en HuggingFace (0 descargas) |
| Jev (TypeSafe) | No disponible | No disponible | Modelo de decision System One | No disponible (servicio alojado) | API alojada /v1/systemone |
| Qwen/Qwen3.5-4B (sin adaptador) | ~4B | No disponible | Modelo base multimodal | No disponible | Abierto |

No se dispone de datos publicados de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: no sirve para generacion, aritmetica ni tareas que requieran cadena de razonamiento, tal como advierte la propia model card.
- Solo puede responder dentro del conjunto de respuestas definido por el usuario; no puede proponer opciones fuera de la lista.
- La licencia MIT se aplica al adaptador; deben revisarse por separado las condiciones de la licencia del modelo base Qwen/Qwen3.5-4B para uso comercial.
- Idiomas soportados: no disponibles. No hay confirmacion oficial de cobertura multilingue en la informacion proporcionada.
- La model card aparece truncada en la tabla de intervalos de confianza, por lo que la evaluacion completa no es verificable con los datos disponibles.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso en produccion.
- La calibracion reportada (ECE 0.0510) corresponde al conjunto de validacion reservado en el momento del entrenamiento; puede degradarse en dominios distintos.
- La exactitud global de 0.7680 implica un margen de error relevante; para decisiones criticas conviene fijar umbrales de confianza en el codigo.
- La primera peticion requiere compilacion de kernels (unos 20 segundos), lo que afecta al arranque en frio.
- No hay datos de sesgos conocidos ni de evaluacion de seguridad en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/kshetrajna12/reflex-qwen3.5-4b-lora
- Repositorio reflex en GitHub: https://github.com/kshetrajna12/reflex
- Blog de TypeSafe sobre Jev y los modelos System One: https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
