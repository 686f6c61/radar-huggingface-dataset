# Aurley/ADM-1

## Resumen

ADM-1 (Another Decision Model) es un modelo experimental de puntuacion de candidatos desarrollado por el usuario Aurley a partir de `mistralai/Ministral-3-3B-Base-2512`. No es un modelo generativo al uso: recibe un estado o contexto, una pregunta y un conjunto de opciones con sus criterios, y devuelve una puntuacion normalizada para cada opcion junto con la opcion elegida y una bandera de absteccion. Resuelve el problema del enrutamiento y la clasificacion de opciones abiertas en tiempo de inferencia, sin necesidad de reentrenar el clasificador para cada nuevo conjunto de etiquetas.

Tecnicamente es un derivado de Ministral 3 3B con los pesos base congelados y cuantizados a 4 bits NF4 con doble cuantizacion, sobre los que se anade una cabeza escalar MLP de puntuacion entrenada especificamente para la tarea. El modelo cuenta con 3.850.670.081 parametros totales, un repositorio de 2,6 GB y una licencia Apache 2.0 heredada del modelo base.

Su relevancia es acotada pero clara: demuestra una arquitectura de "decision head" sobre un LLM pequeno que permite definir las opciones en tiempo de ejecucion, algo que los clasificadores tradicionales no permiten. Los resultados publicados son modestos (58,3 % top-1 en CommonsenseQA con 5 opciones y 58,0 % top-1 en BANKING77 con 77 opciones), y el propio autor lo presenta como un experimento inicial, no como una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral 3 3B) con cabeza escalar MLP de puntuacion de candidatos |
| Parametros totales | 3.850.670.081 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion en los pesos base; cabeza de decision en coma flotante |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, checkpoint unico) |

## Arquitectura y entrenamiento

El modelo parte de Ministral 3 3B Base, un transformer decoder-only de Mistral AI, y lo mantiene congelado y cargado en 4 bits NF4 con doble cuantizacion. Sobre la representacion del modelo base se entrena una cabeza MLP escalar que produce una puntuacion por cada opcion suministrada; esas puntuaciones se normalizan entre el conjunto de opciones del llamador y se ajustan con una temperatura calibrada. La arquitectura personalizada se define en `config.json` y `modeling_ministral_decision.py`, y la inferencia se realiza mediante la clase `MinistralDecisionInference` del modulo `inference`.

El entrenamiento de la cabeza consistio en 12 epocas sobre 512 ejemplos: 256 preguntas de entrenamiento de CommonsenseQA y 256 mensajes de entrenamiento de BANKING77, cada uno con una respuesta correcta y cuatro negativos muestreados. La temperatura de escalado (2,275) se ajusto sobre una particion de calibracion separada de 114 filas. No se reporta uso de RLHF ni DPO; el modelo base se mantiene intacto y solo se entrena el cabezal de decision.

## Capacidades

- Puntuacion de candidatos: asigna una puntuacion bruta y una probabilidad normalizada a cada opcion proporcionada en tiempo de inferencia.
- Enrutamiento dinamico: permite definir el conjunto de opciones en cada llamada, sin reentrenamiento.
- Clasificacion de intenciones: evaluado sobre BANKING77 con 77 clases posibles.
- Razonamiento de sentido comun acotado: evaluado sobre CommonsenseQA en formato de eleccion multiple.
- Salida estructurada: devuelve ID de opcion elegida, probabilidades por opcion, puntuaciones brutas y bandera de absteccion.
- Soporte de criterios por opcion: cada opcion puede incluir una etiqueta y una descripcion de criterios que el modelo usa para puntuar.
- Capacidad de absteccion: puede marcar la necesidad de derivar la decision en lugar de elegir una opcion.
- No genera explicaciones en lenguaje natural ni texto libre.
- Capacidades multilingues: solo ingles.
- No dispone de tool calling, function calling ni modo de razonamiento multi-paso documentados.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar un mensaje entrante en un conjunto de colas definido en tiempo de ejecucion (devoluciones, envios, facturacion), usando los criterios de cada cola como contexto. Es adecuado porque las etiquetas se pueden cambiar sin reentrenar, aunque el rendimiento medido en dominios de atencion al cliente es de 58,0 % top-1 en BANKING77.
- Triaje de correo electronico: asignar mensajes a categorias definidas por el operador (urgente, informativo, spam, requiere respuesta) con una bandera de absteccion para los casos ambiguos.
- Clasificacion de intenciones en asistentes conversacionales: seleccionar la intencion del usuario entre un conjunto acotado de acciones disponibles en cada turno.
- Seleccion de respuesta en sistemas de QA: dado un contexto y una pregunta, puntuar varias respuestas candidatas generadas por otro modelo y elegir la mejor, usando la cabeza de puntuacion como reranker.
- Moderacion de contenido con criterios configurables: definir politicas como opciones con descripciones y dejar que el modelo puntue cada caso, derivando los casos de baja confianza a revision humana.
- Investigacion sobre cabezas de decision sobre LLM: el modelo sirve como referencia reproducible para experimentar con arquitecturas de scoring sobre modelos base congelados y cuantizados.
- Enrutamiento en pipelines de agentes: elegir que herramienta o subagente debe atender una peticion entre un conjunto de opciones descritas con criterios, aceptando la limitacion de que no hay soporte documentado de tool calling nativo.

## Benchmarks y rendimiento

| Benchmark | Filas de evaluacion | Opciones | Top-1 | Top-k | Macro-F1 | NLL | ECE (10 bins) |
|---|---:|---:|---:|---:|---:|---:|---:|
| CommonsenseQA | 1093 | 5 | 58,3 % | Top-3: 90,5 % | 0,583 | 1,337 | 0,199 |
| BANKING77 | 231 | 77 | 58,0 % | Top-5: 87,0 % | 0,575 | 1,566 | 0,093 |

La probabilidad aleatoria de top-1 es del 20 % en CommonsenseQA (5 opciones) y de aproximadamente el 1,3 % en BANKING77 (77 opciones). CommonsenseQA se evaluo sobre las filas oficiales de validacion no usadas para calibracion; BANKING77 sobre una muestra retenida de tres mensajes por intencion (231 en total) del split de test oficial.

## Requisitos de hardware

- VRAM estimada: los pesos base en 4-bit NF4 ocupan aproximadamente 2 GB; con activaciones y runtime se recomienda una GPU con al menos 6-8 GB de VRAM, aunque el autor no publica una cifra exacta.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor indica que se recomienda una GPU CUDA con memoria suficiente para los pesos de 4 bits y las activaciones.
- GPU de consumo: por el tamano de los pesos cuantizados, es plausible que quepa en GPU de consumo con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070), aunque no se confirma en la documentacion.
- Opciones de despliegue: la model card solo documenta la carga mediante `MinistralDecisionInference.from_pretrained` con la libreria `transformers` y `bitsandbytes`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la arquitectura personalizada con cabeza de decision hace improbable el soporte directo en estos motores sin adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ADM-1 | 3,85 B | No disponible | Puntuacion de candidatos y enrutamiento | Apache 2.0 | Hugging Face (28 descargas) |
| Ministral 3 3B Base | 3 B (aprox.) | No disponible | Generacion de texto general | Apache 2.0 (segun modelo base) | Hugging Face (Mistral AI) |
| Clasificadores de intenciones tipo BANKING77 (p. ej. fine-tunes de BERT) | 0,1-0,3 B | 512 tokens aprox. | Clasificacion cerrada de intenciones | Variable | Hugging Face |

La comparacion con clasificadores tradicionales es la mas relevante: ADM-1 permite definir las opciones en tiempo de ejecucion, algo que un clasificador fine-tuneado no permite, pero a costa de un tamano mucho mayor y de una precision top-1 del 58 % en BANKING77, inferior a la de clasificadores dedicados. Frente a su modelo base, ADM-1 anade la capacidad de scoring estructurado pero pierde la generacion de texto libre. No se dispone de datos de benchmarks comparables publicados por el autor para otros modelos en la misma tarea.

## Limitaciones y advertencias

- Entrenado unicamente con ejemplos en ingles de CommonsenseQA y BANKING77; el rendimiento en otros dominios o idiomas puede degradarse notablemente.
- La calibracion de probabilidades es limitada: ECE de 0,199 en CommonsenseQA y 0,093 en BANKING77, y el propio autor advierte que las probabilidades necesitan mas calibracion antes de usar umbrales en produccion.
- No genera explicaciones ni texto libre; solo devuelve puntuaciones, lo que limita la auditabilidad de las decisiones.
- Resultados modestos: 58,3 % top-1 en CommonsenseQA y 58,0 % top-1 en BANKING77, lejos de un uso fiable sin supervision humana.
- El modelo es experimental y cuenta con solo 28 descargas y 0 likes en Hugging Face; no hay evidencia de uso en produccion ni validacion independiente.
- No hay informacion sobre sesgos especificos, pero al derivar de un modelo base entrenado con datos web es probable que herede sesgos de ese corpus.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de puntuaciones erroneas en dominios no vistos.
- Licencia Apache 2.0 permite uso comercial, pero se deben mantener las atribuciones de los datasets: CommonsenseQA (MIT) y BANKING77 (CC BY 4.0, atribuir a PolyAI / Casanueva et al.).
- Se recomienda anadir una opcion "otro" o de derivacion y validar sobre datos representativos antes de automatizar decisiones.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aurley/ADM-1
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
