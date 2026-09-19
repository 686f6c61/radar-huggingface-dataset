# Rev3auth/iris-1.3-lite-lora

## Resumen

Iris 1.3 Lite LoRA (identificador `Rev3auth/iris-1.3-lite-lora`) es un ajuste fino mediante LoRA publicado por el usuario Rev3auth sobre el modelo `unsloth/gemma-3-1b-it-unsloth-bnb-4bit`, una version cuantizada en 4 bits de Gemma 3 1B Instruct preparada por Unsloth. El repositorio contiene un adaptador de bajo rango, no un modelo completo: ocupa 0,1 GB y se distribuye en formato safetensors para su uso con la libreria `transformers` y, presumiblemente, PEFT. El modelo se apoya en la arquitectura `gemma3_text`, la variante exclusivamente de texto de la familia Gemma 3.

La relevancia de esta ficha es limitada y conviene ser transparente: el repositorio no incluye documentacion sobre el conjunto de datos de entrenamiento, el objetivo del ajuste, la tarea concreta para la que fue entrenado ni metricas de evaluacion. Acumula cero descargas y cero "likes" en el momento de la consulta, y la model card se limita a la plantilla autogenerada de Unsloth. Por tanto, debe considerarse un artefacto experimental o de uso interno, no un modelo listo para produccion.

El interes tecnico principal reside en el patron de trabajo: adaptacion eficiente de un modelo de 1B parametros sobre una base ya cuantizada en 4 bits, un escenario habitual cuando se quiere iterar rapidamente en una GPU de gama media o incluso en una GPU integrada. La licencia declarada es Apache 2.0, aunque el modelo base procede de la familia Gemma de Google, lo que introduce una advertencia de licencia que se detalla mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer de la familia `gemma3_text` (variante solo texto de Gemma 3), base para adaptador LoRA |
| Parametros totales | Aproximadamente 1.000 millones en el modelo base (1B); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (viene determinada por el modelo base Gemma 3 1B) |
| Tipos de cuantizacion | El modelo base indicado esta cuantizado en 4 bits (`bnb-4bit`); el adaptador se distribuye en safetensors sin cuantizar. No se documentan otros formatos |
| Idiomas soportados | Ingles (`en`), segun los metadatos del repositorio |
| Licencia | Apache 2.0 (declarada en el repositorio; el modelo base Gemma 3 esta sujeto a los terminos de Google, ver advertencias) |
| Formato de pesos | Safetensors (adaptador LoRA, 0,1 GB) |
| Libreria | Transformers (tags: `transformers`, `trl`, `unsloth`, `text-generation-inference`, `endpoints_compatible`) |
| Modelo base | `unsloth/gemma-3-1b-it-unsloth-bnb-4bit` |
| Fecha de creacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante `gemma3_text`, es decir, un transformer decoder-only de aproximadamente 1.000 millones de parametros. Sobre esa base, el autor ha entrenado un adaptador LoRA, una tecnica de ajuste parametro-eficiente que congela los pesos originales e inserta matrices de bajo rango en determinadas capas, de modo que solo se optimiza una fraccion minima de parametros. El repositorio no especifica el rango (`r`), el valor de `alpha`, las capas objetivo ni la tasa de aprendizaje empleada.

El entrenamiento se realizo con Unsloth, segun indica la propia model card ("This gemma3_text model was trained 2x faster with Unsloth"), lo que implica el uso de kernels optimizados para el ajuste fino. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO o SFT adicional, ni sobre la tarea objetivo. La base `unsloth/gemma-3-1b-it-unsloth-bnb-4bit` indica que el ajuste se hizo sobre un modelo ya cuantizado en 4 bits mediante bitsandbytes, una practica habitual en entornos con VRAM limitada (QLoRA). No se documenta ninguna innovacion tecnica propia mas alla del uso de estas herramientas.

## Capacidades

Las capacidades que se enumeran a continuacion corresponden al modelo base Gemma 3 1B Instruct; el ajuste LoRA puede haber modificado, potenciado o degradado cualquiera de ellas, y no hay evaluacion publicada que lo confirme.

- Generacion de texto en ingles (idioma declarado en el repositorio).
- Razonamiento basico y respuesta a instrucciones, heredados del ajuste instructivo del modelo base.
- Generacion de codigo y resolucion de problemas matematicos sencillos, en el rango esperable para un modelo de 1B parametros.
- Soporte de tool calling o function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles. La variante `gemma3_text` no incluye vision.
- Despliegue como adaptador PEFT sobre el modelo base cuantizado, con posibilidad de fusionar los pesos para exportar a otros formatos.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el adaptador se carga sobre una base de 1B parametros cuantizada en 4 bits, por lo que puede levantarse en una GPU de 8 GB o menos para validar flujos conversacionales antes de escalar a modelos mayores.
- Ajuste incremental de dominio sobre una base ya cuantizada: el repositorio sirve como ejemplo reproducible del flujo QLoRA + Unsloth, util para equipos que quieran replicar la receta con sus propios datos.
- Clasificacion y extraccion de informacion con prompts: tareas de etiquetado, extraccion de entidades o resumen corto en ingles, donde un modelo de 1B puede bastar si la latencia es critica.
- Despliegue en el borde (edge) o en entornos sin GPU dedicada: al tratarse de un adaptador sobre un modelo de 1B, es candidato a ejecutarse en CPU o en GPUs integradas tras convertir la base a GGUF.
- Generacion de texto de bajo coste en pipelines por lotes: por ejemplo, normalizacion de textos, generacion de titulares o reformulacion masiva, donde el coste por token es el factor dominante.
- Evaluacion comparativa de tecnicas de ajuste eficiente: util como linea base para medir el efecto de un LoRA frente al modelo base sin ajustar en una tarea concreta.
- Filtrado previo en arquitecturas de cascada: usar el modelo como primera etapa que descarta o enruta peticiones sencillas hacia un modelo mayor, reduciendo el coste agregado del sistema.
- Educacion y experimentacion: por su tamano reducido, es adecuado para cursos y talleres sobre ajuste fino con Unsloth, TRL y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni ninguna otra), y el modelo acumula cero descargas, por lo que no existen evaluaciones de terceros. Los resultados de busqueda web realizados no devolvieron informacion relacionada con el modelo: unicamente aparecieron paginas del servicio de medicion de velocidad de red Speedtest de Ookla, sin ninguna relacion con este repositorio.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritmeticas a partir del numero de parametros declarado (1B) y del formato de pesos; no proceden de mediciones publicadas por el autor.

- Peso del adaptador LoRA: 0,1 GB (tamano del repositorio en HuggingFace).
- Modelo base en 4 bits (bnb-4bit): aproximadamente 0,7-1 GB de pesos, mas cache KV y overhead del runtime; en la practica, entre 2 y 4 GB de VRAM para inferencia con contextos moderados.
- Modelo base en fp16/bf16: aproximadamente 2 GB solo en pesos; con cache y overhead, del orden de 4 a 6 GB de VRAM.
- GPU consumer compatibles: cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090) puede ejecutar la base en 4 bits con holgura, y la mayoria tambien en fp16. En GPUs con 6 GB es viable unicamente la version cuantizada.
- GPU de centro de datos: A100, H100, L40S o similares son sobredimensionadas para este tamano; tendrian sentido solo para servir muchas replicas concurrentes o para el reentrenamiento.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM, Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`) y llama.cpp/Ollama tras convertir la base a GGUF y fusionar el adaptador. El adaptador tambien puede fusionarse en los pesos base para simplificar el despliegue.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparacion se establece con modelos de la misma categoria (instructivos, en torno a 1-2 mil millones de parametros). Los datos marcados como "no disponible" no aparecen en la informacion proporcionada para este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rev3auth/iris-1.3-lite-lora | ~1B (base) + adaptador LoRA | No disponible | Apache 2.0 declarada (base Gemma 3 sujeta a terminos de Google) | Publico en HuggingFace, 0 descargas |
| google/gemma-3-1b-it (modelo base de esta familia) | ~1B | No disponible en la informacion proporcionada | Terminos de uso de Gemma | Publico en HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5B (por el nombre del modelo) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Llama-3.2-1B-Instruct | ~1B (por el nombre del modelo) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativo (benchmarks) para ninguno de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta la tarea objetivo, el dataset, la configuracion de entrenamiento ni los hiperparametros del LoRA. Es imposible saber para que funciona bien y para que no.
- Ausencia total de evaluacion: cero benchmarks publicados y cero descargas, lo que impide cualquier valoracion de calidad o de regresiones frente al modelo base.
- Riesgo de alucinacion: inherente a los modelos de ~1B parametros, que tienden a inventar hechos, citas y APIs cuando se les exige conocimiento factual o razonamiento complejo.
- Sesgos: no documentados por el autor. Al no haberse publicado la composicion del dataset de ajuste, no puede descartarse la amplificacion de sesgos presentes en el modelo base o en los datos utilizados.
- Limitacion idiomatica: el repositorio declara unicamente ingles (`en`). No hay evidencia de soporte fiable en castellano ni en otros idiomas, y un ajuste fino sobre datos no documentados podria haber degradado aun mas el multilingüismo del modelo base.
- Ambiguedad de licencia: la model card declara Apache 2.0, pero el modelo base pertenece a la familia Gemma 3 de Google, cuyos pesos se distribuyen bajo los terminos de uso de Gemma. Conviene verificar con detalle la compatibilidad antes de un uso comercial, ya que la licencia declarada por el autor del ajuste no puede prevalecer sobre las condiciones del modelo original.
- Uso en produccion desaconsejado sin validacion previa: no hay garantias de estabilidad, de formato de salida ni de comportamiento en dominios concretos.
- Fecha de publicacion inusual: los metadatos indican 2026-09-19, una fecha que conviene contrastar antes de citarla.
- Compatibilidad: al ser un adaptador sobre una base cuantizada en 4 bits, es necesario cargarlo con la base correcta y con PEFT; intentar cargarlo como modelo autonomo con `AutoModelForCausalLM` fallara o dara resultados incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rev3auth/iris-1.3-lite-lora
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relacionado con el modelo; unicamente aparecieron paginas de Speedtest de Ookla (https://www.speedtest.net/, https://intelligence.speedtest.net/), sin relacion con este repositorio. No se dispone de paper, blog tecnico, demo ni repositorio adicional asociado al modelo.
