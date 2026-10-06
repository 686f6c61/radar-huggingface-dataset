# morriszjm/Tacit-4B

## Resumen

Tacit-4B es un ajuste fino de Qwen/Qwen3-4B desarrollado por el usuario morriszjm, publicado en HuggingFace bajo licencia Apache-2.0. Su particularidad no es la generacion de texto libre, sino la toma de decisiones tipadas: elegir una opcion entre varias, responder si/no o seleccionar un nivel dentro de una escala ordenada, devolviendo una distribucion de probabilidad sobre las opciones en un unico forward pass. El modelo conserva los 4.022.468.096 parametros del modelo base y se distribuye en formato safetensors.

El entrenamiento se basa en una tecnica que el autor denomina AnyJev self-distillation: el propio modelo base genero sus problemas de decision, los respondio con el razonamiento activado y despues aprendio a emitir esas mismas respuestas sin cadena de pensamiento, en un solo paso. Segun la model card, no se utilizaron etiquetas humanas, conjuntos de datos externos ni otros modelos. Esto reduce el coste de anotacion y, en teoria, alinea la salida rapida con la decision que el modelo tomaria razonando.

Es relevante ahora porque cubre un nicho concreto: clasificacion y enrutamiento de decisiones con latencia baja dentro de pipelines de agentes y sistemas de moderacion, donde generar una cadena de razonamiento completa es caro e innecesario. La model card lo marca explicitamente como version preview y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un artefacto muy reciente y sin validacion externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen/Qwen3-4B |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B declara 32.768 tokens nativos ampliables a 131.072, pero Tacit-4B no especifica si conserva esa configuracion |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni MLX en el repositorio) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B sin modificaciones estructurales: un transformer decoder-only denso de 4.022.468.096 parametros. La innovacion esta en el procedimiento de ajuste, no en el bloque de atencion ni en el tokenizador. El autor describe AnyJev self-distillation como un ciclo en el que el modelo base redacta sus propios problemas de decision, los resuelve con razonamiento explicito y luego se entrena para producir la respuesta directamente en un unico forward pass. El resultado es un modelo que, dada una pregunta con opciones, devuelve una probabilidad por opcion en lugar de una secuencia de texto generada token a token.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO o preferencias humanas. Indica de forma explicita que no se emplearon etiquetas humanas, datasets externos ni modelos terceros, lo que convierte el corpus de entrenamiento en un artefacto totalmente sintetico generado por el propio Qwen3-4B. Tampoco se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento conmutables. La formacion de la respuesta como distribucion de probabilidad implica una cabeza de lectura (readout) especifica sobre las opciones, cuya implementacion exacta no se describe en el README.

## Capacidades

- Decision tipada de opcion multiple: selecciona una alternativa entre un conjunto cerrado y devuelve la probabilidad asociada a cada una.
- Decision binaria: responde preguntas de si/no con una probabilidad calibrada.
- Eleccion de nivel ordenado: selecciona un valor dentro de una escala ordenada (por ejemplo, niveles de severidad o categorias ordinales).
- Inferencia en un solo forward pass: la decision se obtiene sin generar cadena de razonamiento, lo que reduce la latencia frente a esquemas de razonamiento explicito.
- Salida probabilistica: al devolver una distribucion sobre las opciones, permite aplicar umbrales, calcular incertidumbre y derivar decisiones con abstención.
- Perfil conversacional: el repositorio incluye la etiqueta conversational y hereda la interfaz de chat del modelo base.
- Soporte de tool calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseno apunta en la direccion contraria, a colapsar el razonamiento en una sola pasada.
- Capacidades multilingues: no documentadas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Enrutamiento de peticiones en un agente: el modelo puede decidir en un solo paso a que herramienta o subagente derivar una consulta, devolviendo la probabilidad de cada ruta y permitiendo activar un fallback cuando la confianza es baja.
- Moderacion de contenido: clasificacion si/no de textos potencialmente problematicos con umbral de probabilidad ajustable, integrable en un pipeline previo a la generacion de respuestas.
- Triaje de tickets de soporte: asignacion de una categoria o nivel de prioridad dentro de un conjunto cerrado de opciones, aprovechando la salida ordinal para distinguir severidades.
- Encuestas y anotacion asistida: prediccion de la respuesta mas probable a preguntas con escala ordenada, util para preetiquetar grandes volumenes y reservar la revision humana para los casos de baja confianza.
- Control de calidad en generacion: verificacion binaria de si una respuesta generada cumple un criterio (por ejemplo, si cita una fuente o si respeta una politica), usado como guardarraíl dentro de una cadena mayor.
- Evaluacion comparativa A/B: seleccion entre dos variantes de un texto o dos configuraciones, con la probabilidad como medida de preferencia del modelo.
- Clasificacion de intenciones en asistentes: eleccion de la intencion del usuario dentro de un catalogo fijo antes de invocar la logica de negocio correspondiente.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la model card del autor. Miden la exactitud en un unico forward pass sobre el conjunto de test completo, con el mismo prompt y el mismo readout para ambos modelos comparados.

| Benchmark | Qwen3-4B | Tacit-4B | Diferencia |
|---|---|---|---|
| JevBench (conjunto publico, 231 ejemplos) | 0,658 | 0,723 | +6,5 puntos |
| bev-decision (split de test, 46.320 ejemplos) | 0,619 | 0,663 | +4,4 puntos |

No se han publicado resultados en la informacion disponible para MMLU, HumanEval, GSM8K ni otros benchmarks estandar de conocimiento, codigo o matematicas. Las cifras anteriores proceden exclusivamente de la evaluacion del autor y no cuentan con replicacion independiente conocida.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 8,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5,5 GB de pesos. No se publican pesos ya cuantizados, por lo que habria que generarlos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3,5 GB de pesos, tambien previa conversion.
- GPU de gama profesional: A100 40/80 GB, H100 o L40S sobredimensionadas para un modelo de este tamano, utiles solo si se busca alto throughput por batching.
- GPU de consumo: cabe sin problema en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16; tambien en tarjetas de 12 GB como la RTX 3060 12 GB en bf16 con control del contexto. En tarjetas de 8 GB o menos es necesario cuantizar.
- Opciones de despliegue: vLLM y TGI son las rutas mas directas dado que el repositorio es compatible con text-generation-inference y con endpoints. llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que no viene publicada.
- Latencia y throughput: no se publican cifras. Como referencia cualitativa, el diseno de un unico forward pass evita la decodificacion autorregresiva de una cadena de razonamiento, por lo que la latencia por decision deberia ser muy inferior a la de un modelo que razona antes de responder, con la salvedad de que el autor no aporta mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench (1 forward pass) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tacit-4B | 4,02 B | no disponible | 0,723 | Apache-2.0 | safetensors en HuggingFace |
| Qwen3-4B | 4,02 B | 32.768 nativos, ampliable a 131.072 | 0,658 | Apache-2.0 | safetensors y cuantizaciones |
| Otros modelos de decision de ~3-8 B (Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) | 3-8 B | no disponible | no disponible | licencias variadas | amplia |

La comparacion directa solo es posible con el modelo base, porque es el unico para el que el autor publica cifras con el mismo prompt y lectura. No se dispone de datos de modelos alternativos orientados especificamente a decisiones tipadas, por lo que la comparativa con otras familias queda como no disponible.

## Limitaciones y advertencias

- Version preview: la propia model card la etiqueta como tal, lo que implica que la API, el formato de prompt o los pesos pueden cambiar sin aviso.
- Sin validacion externa: el repositorio no registra descargas ni valoraciones y los resultados proceden unicamente de la evaluacion del autor.
- Conjuntos de evaluacion de tamano desigual: JevBench cuenta con 231 ejemplos, una muestra pequena para extraer conclusiones robustas; bev-decision, con 46.320 ejemplos, es mas solido.
- Sesgos por autodestilacion: al no emplear etiquetas humanas ni datos externos, el modelo hereda y potencialmente amplifica los sesgos y los errores sistematicos del Qwen3-4B que genero tanto las preguntas como las respuestas. No hay filtrado humano que los corrija.
- Riesgo de alucinacion: el modelo no genera texto largo en su funcion principal, pero si se usa fuera de la tarea de decision tipada su comportamiento no esta documentado y puede degradarse.
- Idiomas no declarados: se desconoce que idiomas cubre el ajuste. El modelo base es multilingue, pero el corpus sintetico de destilacion podria haber sesgado el rendimiento hacia el ingles.
- Dependencia del formato: la exactitud publicada se obtuvo con un prompt y un readout concretos. Cambiar la plantilla, el orden de las opciones o la formulacion puede alterar la calibracion de las probabilidades.
- Contexto no confirmado: la model card no especifica la longitud de contexto efectiva tras el ajuste, un dato critico para decidir su uso en conversaciones largas.
- Licencia: Apache-2.0 permite uso comercial y modificacion sin restricciones adicionales, siempre que se conserve el aviso de licencia. No se detectan clausulas de uso aceptable especificas, pero conviene verificar la licencia del modelo base en caso de redistribucion.
- Produccion: al no existir cuantizaciones listas ni informes de latencia, cualquier despliegue serio exigira convertir pesos y medir throughput por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morriszjm/Tacit-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las consultas devolvieron exclusivamente resultados de sitios para adultos sin relacion con Tacit-4B, por lo que no se incluyen.
- Paper, blog tecnico o repositorio de codigo del autor: no disponibles en la informacion proporcionada.
- Demo o espacio de HuggingFace: no disponible.
