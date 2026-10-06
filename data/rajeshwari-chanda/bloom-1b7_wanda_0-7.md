# Rajeshwari-Chanda/bloom-1b7_wanda_0.7

## Resumen

`Rajeshwari-Chanda/bloom-1b7_wanda_0.7` es un checkpoint derivado de BLOOM-1b7, el modelo decoder-only de 1.700 millones de parametros desarrollado por BigScience. El nombre del repositorio indica que se ha aplicado poda no estructurada con el algoritmo Wanda a una tasa de esparsidad de 0,7, es decir, aproximadamente el 70 % de los pesos individuales se han llevado a cero sin reentrenamiento posterior. El autor del repositorio es el usuario de HuggingFace `Rajeshwari-Chanda`.

El interes de este checkpoint es fundamentalmente experimental: sirve como material de referencia para estudiar el impacto de la poda one-shot sobre un transformer multilingue de tamano pequeno y para reproducir comparativas frente al modelo denso original. No es un modelo afinado para instrucciones, no incorpora alineamiento por RLHF ni DPO, y no se ha publicado ninguna evaluacion de calidad tras la poda.

La model card del repositorio es la plantilla autogenerada por HuggingFace y no contiene informacion sobre datos de entrenamiento, hiperparametros de la poda, licencia ni idiomas. El repositorio no registra descargas ni interacciones, por lo que no existe validacion externa de la calidad del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM) con embeddings posicionales ALiBi; no confirmado en la model card |
| Parametros totales | 1.722.408.960 (1,72 B), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens segun la arquitectura BLOOM-1b7; no especificado en la model card |
| Tipos de cuantizacion | No se publican versiones cuantizadas (sin GGUF, AWQ ni GPTQ). Los pesos son densos aunque con un 70 % de valores a cero |
| Idiomas soportados | No declarados en la model card. El modelo base BLOOM cubre 46 lenguas naturales y 13 lenguajes de programacion, pero no hay confirmacion para este checkpoint |
| Licencia | No disponible. El modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0 |
| Formato de pesos | safetensors (aproximadamente 3,5 GB de repositorio, compatible con fp16/bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-1b7: un transformer decoder-only con normalizacion previa a la atencion, activacion GeLU en el bloque MLP, embeddings de entrada y salida atados y sesgo posicional ALiBi en lugar de embeddings posicionales aprendidos. El vocabulario es de 250.880 tokens, derivado de un tokenizador byte-level BPE entrenado sobre el corpus ROOTS. El modelo base fue entrenado por BigScience sobre ROOTS, un corpus multilingue de aproximadamente 1,6 TB que combina 46 lenguas naturales y 13 lenguajes de programacion, con un presupuesto de computo de cientos de miles de horas de GPU.

Sobre ese checkpoint se ha aplicado Wanda (Pruning by Weights and Activations), un metodo de poda one-shot que puntua cada peso como el producto de su magnitud por la norma L2 de la activacion de entrada correspondiente, y elimina los pesos con menor puntuacion por capa segun una tasa de esparsidad fija. En este caso la tasa indicada por el nombre del modelo es 0,7. Al tratarse de poda no estructurada, la forma de los tensores se mantiene intacta: el recuento de parametros del safetensors coincide con el de BLOOM-1b7 denso, y los valores podados simplemente valen cero. Esto implica que la poda no reduce el uso de memoria ni el coste de inferencia en los runtimes habituales, que densifican el tensor, y que no se ha realizado un reajuste fino posterior para recuperar la calidad perdida.

## Capacidades

- Generacion de texto autoregresiva: el modelo conserva el comportamiento de un modelo de lenguaje base, orientado a continuacion de texto y no a seguir instrucciones.
- Capacidad multilingue heredada del modelo base BLOOM, sin verificacion especifica tras la poda.
- Generacion de codigo: el corpus ROOTS incluye 13 lenguajes de programacion, pero no hay evaluacion post-poda que confirme que esta capacidad se mantiene.
- Sin soporte de tool calling ni de function calling: no se ha aplicado ningun entrenamiento de instrucciones ni plantilla de chat.
- Sin soporte de agentes ni de razonamiento multi-paso: no hay modo de pensamiento ni capacidades de planificacion entrenadas.
- Sin capacidades de vision, audio ni multimodalidad.
- Utilidad principal como objeto de estudio: permite medir la degradacion de perplejidad y de generacion inducida por una poda Wanda al 70 %.

## Casos de uso

- Investigacion en compresion de modelos: comparar la perplejidad y las salidas de este checkpoint frente a BLOOM-1b7 denso bajo la misma semilla y el mismo prompt permite cuantificar la degradacion real de Wanda al 70 % de esparsidad en un modelo de 1,72 B.
- Reproduccion de experimentos de poda: al ser un checkpoint publico y ligero (3,5 GB), sirve para validar implementaciones propias del algoritmo Wanda y para comprobar la reproducibilidad de los puntajes de importancia.
- Fine-tuning ligero con LoRA o adaptadores: se puede comprobar si un ajuste parametro-eficiente sobre una red podada recupera calidad en un dominio concreto, con un coste de entrenamiento muy bajo en una GPU de consumo.
- Analisis de mecanismos internos: la comparacion de mapas de atencion y de activaciones entre el modelo podado y el denso es un caso de estudio habitual en interpretabilidad de redes dispersas.
- Generacion de texto sin instrucciones en entornos de bajo presupuesto: para tareas de continuacion de texto o generacion de plantillas en ingles, el checkpoint ocupa poco mas de 3 GB en fp16 y cabe en GPUs de gama media.
- Modelo candidato como borrador en decodificacion especulativa: su tamano reducido lo hace teoricamente atractivo como draft model, aunque no existe ninguna validacion publicada de la tasa de aceptacion frente a BLOOM-1b7.
- Docencia y prototipado: permite ilustrar en un aula o en un entorno de pruebas el efecto de la esparsidad no estructurada sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla autogenerada de HuggingFace y no incluye seccion de evaluacion, comparativa con el modelo denso ni metricas de perplejidad antes y despues de la poda.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 3,5 GB de pesos mas unos 0,4 GB de cache KV a 2.048 tokens y lote 1, es decir, en torno a 4 GB en total.
- VRAM en fp32: unos 7 GB de pesos, con el consiguiente aumento del ancho de banda de memoria necesario.
- VRAM en cuantizacion de 8 bits: aproximadamente 1,8 GB de pesos; en 4 bits, en torno a 1 GB, aunque no se publican checkpoints cuantizados y habria que generarlos.
- GPU de consumo: cabe sin problemas en tarjetas de 8 GB o mas, como RTX 3060 Ti, RTX 4060, RTX 4070 o RTX 4090. En tarjetas de 6 GB entra en fp16 con contexto reducido.
- GPU de datacenter: A100, H100 o L40S permiten lotes grandes y mayor throughput, aunque estan sobredimensionadas para un modelo de 1,72 B.
- Opciones de despliegue: `transformers` en PyTorch, Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM, que soporta la arquitectura BLOOM. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, conversion que no esta publicada.
- Consideracion importante: al tratarse de poda no estructurada, ninguno de estos runtimes aprovecha la esparsidad; el consumo de memoria y el tiempo por token son practicamente identicos a los de BLOOM-1b7 denso, salvo que se disponga de kernels dispersos especificos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia |
|---|---|---|---|---|
| bloom-1b7_wanda_0.7 (este modelo) | 1,72 B | 2.048 (no confirmado) | Denso con 70 % de pesos a cero, sin afinado | No disponible |
| BLOOM-1b7 (base) | 1,72 B | 2.048 | Denso, modelo base | BigScience BLOOM RAIL 1.0 |
| BLOOMZ-1b7 | 1,72 B | 2.048 | Afinado a instrucciones sobre BLOOM-1b7 | BigScience BLOOM RAIL 1.0 |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 | Denso, afinado a chat | Apache 2.0 |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Denso, modelo base e instruct | Apache 2.0 |

Los datos de las alternativas proceden de sus fichas publicas. No hay resultados de benchmarks comparativos disponibles para este checkpoint podado, por lo que la comparacion se limita a parametros, contexto, naturaleza del entrenamiento y licencia.

## Limitaciones y advertencias

- Modelo base sin afinado a instrucciones: no responde de forma fiable a preguntas directas ni sigue plantillas de chat; sin un ajuste adicional produce continuaciones de texto.
- Poda no validada: no hay ninguna evaluacion publicada que cuantifique la perdida de calidad tras aplicar Wanda al 70 % sobre BLOOM-1b7. La degradacion puede ser severa en tareas de razonamiento, codigo o matematicas.
- La poda no reduce el coste de inferencia: al ser no estructurada y no acompanarse de kernels dispersos, el checkpoint ocupa en memoria lo mismo que el modelo denso.
- Riesgo elevado de alucinacion: `bloom-1b7` es un modelo de 1,72 B entrenado sobre un corpus con fecha de corte antigua, y la poda agrava la perdida de hechos poco frecuentes.
- Sesgos conocidos del corpus ROOTS: el propio equipo de BigScience documenta sesgos de genero, raza, religion y origen geografico, con especial incidencia en textos en lenguas con menos representacion.
- Cobertura idiomatica no verificada para el castellano: aunque BLOOM es multilingue, no hay ninguna prueba de que la capacidad en espanol sobreviva a la poda al 70 %.
- Licencia no disponible: la ausencia de licencia explicita en el repositorio impide determinar las condiciones de uso comercial. Si se hereda BLOOM RAIL 1.0, existen obligaciones de atribucion y restricciones de uso que deben revisarse antes de cualquier despliegue en produccion.
- Sin datos de entrenamiento ni de la poda: no se documentan el corpus, el numero de tokens de ajuste, el criterio exacto de poda ni si hubo calibracion con un conjunto de validacion.
- Sin validacion de la comunidad: cero descargas y cero interacciones en el momento de redactar esta ficha, y fechas de creacion y actualizacion de octubre de 2026, lo que impide contrastar la calidad del checkpoint.
- No recomendado para produccion: para uso real en generacion de texto en castellano conviene partir de un modelo base mas reciente, con licencia clara y con evaluaciones publicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Rajeshwari-Chanda/bloom-1b7_wanda_0.7
- Modelo base BLOOM-1b7: https://huggingface.co/bigscience/bloom-1b7
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper de Wanda (Pruning by Weights and Activations): https://arxiv.org/abs/2306.11695
- Licencia BigScience BLOOM RAIL 1.0: https://huggingface.co/spaces/bigscience/license
- Referencia de la calculadora de impacto incluye en las etiquetas del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos son contenido no relacionado con inteligencia artificial y se han descartado por completo.
