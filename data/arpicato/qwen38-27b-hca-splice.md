# arpicato/qwen38-27b-hca-splice

## Resumen

El modelo `arpicato/qwen38-27b-hca-splice` es una publicacion de pesos en formato GGUF alojada en HuggingFace por el usuario arpicato. Se trata de un modelo conversacional de 27.384.136.704 parametros (27,38 mil millones), es decir, de la clase 27B, un segmento que permite inferencia local en hardware de gama alta de consumo si se recurre a cuantizacion. El repositorio ocupa 188,6 GB, lo que indica que contiene varias cuantizaciones GGUF del mismo modelo base en lugar de un unico fichero de pesos.

La nomenclatura "qwen38-27b" remite a la familia Qwen3 y el sufijo "hca-splice" sugiere una fusion de pesos (merge o splice) entre checkpoints; la etiqueta `imatrix` indica que las cuantizaciones se han calibrado con matrices de importancia. Ninguno de estos extremos esta documentado en la informacion disponible: el repositorio no incluye model card con pipeline declarado, licencia, idiomas ni detalles de entrenamiento, por lo que el linaje y el metodo de construccion deben tratarse como inferencias a partir del nombre y las etiquetas, no como hechos verificados.

Su relevancia practica es la de un checkpoint local de ~27B con cuantizaciones optimizadas para maximizar la calidad por bit, util para despliegue en una o dos GPU de consumo o en endpoints compatibles. La adopcion observada es limitada: 2.819 descargas y 0 likes, sin validacion externa ni resultados de evaluacion publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere familia Qwen3; no confirmado en la informacion proporcionada) |
| Parametros totales | 27.384.136.704 (27,38B), dato derivado de safetensors |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibracion imatrix; el desglose de quants concretos (Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc.) no esta detallado en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (etiqueta `gguf`); el recuento de parametros procede de metadatos safetensors |
| Tamano del repositorio | 188,6 GB |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-09-14 |
| Descargas / likes | 2.819 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura ni sobre el proceso de entrenamiento en los datos proporcionados. El repositorio no incluye model card con numero de tokens de entrenamiento, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de atencion o decodificacion. La unica informacion estructural es indirecta: el recuento de parametros es de 27.384.136.704 y el nombre del repositorio apunta a la familia Qwen3, mientras que el sufijo "splice" y la presencia de cuantizaciones con `imatrix` son consistentes con un modelo derivado por fusion de pesos y posteriormente cuantizado por el publicador.

Conviene tratar cualquier afirmacion sobre la arquitectura interna (numero de capas, cabezas, dimension de embeddings, tipo de atencion, uso de GQA o de atencion lineal) como no verificada. En la practica, esto implica que no es posible reproducir el pipeline de creacion ni auditar que checkpoints se combinaron, que ponderaciones se aplicaron ni con que corpus se calibraron las matrices de importancia de las cuantizaciones.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline de uso previsto indican un modelo orientado a dialogo multi-turno.
- Razonamiento y generacion de codigo: plausible por tamano y linaje Qwen, pero no documentado ni evaluado en la informacion disponible.
- Matematicas y tareas de logica: sin datos de benchmarks que lo confirmen.
- Tool calling / function calling: no disponible, no se documenta soporte de plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Despliegue local eficiente: capacidad real y verificable, al distribuirse en GGUF con cuantizaciones calibradas por imatrix y con la etiqueta `endpoints_compatible`.

## Casos de uso

- Asistente conversacional autoalojado: al distribuirse en GGUF de ~27B, puede ejecutarse en una estacion de trabajo con una o dos GPU de consumo para dar servicio de chat interno sin enviar datos a terceros. La limitacion es que no se declara la ventana de contexto, por lo que la longitud de conversacion soportada debe medirse empiricamente antes de desplegarlo.
- Prototipado de agentes locales: la etiqueta `endpoints_compatible` permite levantarlo detras de un servidor compatible con la API de OpenAI para probar flujos de agentes. No obstante, el soporte de tool calling no esta documentado y habria que validarlo con casos de prueba propios.
- Generacion de codigo en entornos con requisitos de privacidad: un modelo de 27B cuantizado a Q4_K_M o Q5_K_M cabe en GPUs de 24 GB y puede integrarse como asistente de autocompletado o revision en repositorios que no pueden usar APIs externas.
- Resumen y reescritura de documentacion tecnica: para lotes de textos en castellano o ingles, con la advertencia de que la calidad multilingue no esta verificada y debe evaluarse con un conjunto de validacion propio.
- Evaluacion comparativa de cuantizaciones: el repositorio, con 188,6 GB de variantes, es util para un estudio interno de degradacion por cuantizacion (Q8_0 frente a Q5_K_M o Q4_K_M) midiendo perplejidad y calidad de respuesta en la misma tarea.
- Base para fine-tuning o fusion posterior: al estar disponible en GGUF y con el recuento de parametros en safetensors, puede servir como punto de partida para merges adicionales o ajuste con LoRA, siempre que la licencia del modelo original se aclare antes de cualquier uso derivado.
- Despliegue en endpoints gestionados: el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints, lo que permitiria servir una cuantizacion concreta sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de perplejidad para ninguna de las cuantizaciones del repositorio, ni tampoco comparaciones con el modelo base del que derive.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (27,38B) y del tamano tipico de cada tipo de cuantizacion GGUF. No proceden de documentacion del autor:

| Cuantizacion aproximada | Bits por peso | VRAM estimada para pesos |
|---|---|---|
| Q8_0 | ~8,5 | ~29 GB |
| Q6_K | ~6,6 | ~23 GB |
| Q5_K_M | ~5,7 | ~20 GB |
| Q4_K_M | ~4,9 | ~17 GB |
| Q3_K_M | ~3,9 | ~13,5 GB |
| Q2_K | ~2,6 | ~9 GB |

- A las cifras anteriores hay que sumar la cache KV, cuyo tamano depende del numero de capas, cabezas y de la longitud de contexto, dato no disponible. En la practica, reservar entre 1 y 3 GB adicionales para contextos moderados y mas si se usan ventanas largas.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090, RTX 5090, A6000 o L40S de 24-48 GB es suficiente. Para Q6_K y Q8_0 conviene una unica GPU de 48 GB (A6000, L40S) o dos GPU de 24 GB con reparto por capas.
- Caben en GPU de consumo: si. Q4_K_M entra en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; Q5_K_M y Q6_K entran de forma ajustada. En tarjetas de 12 GB (RTX 3060, 4070) solo son viables Q2_K o Q3_K_M con offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores GGUF compatibles con la API de OpenAI. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales; para esos backends haria falta una version en safetensors, no confirmada en el repositorio.
- Latencia y throughput: no disponible. Dependera de la cuantizacion, del hardware y del grado de offload a CPU, que en configuraciones con memoria insuficiente degrada el rendimiento de forma severa.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de evaluacion ni especificaciones de modelos comparables, y sin licencia ni contexto declarados no es posible establecer una comparacion rigurosa con alternativas de la misma clase (~24-32B).

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| arpicato/qwen38-27b-hca-splice | 27,38B | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| Alternativas de clase 24-32B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan arquitectura, datos de entrenamiento, idiomas ni contexto, lo que impide auditar el modelo y reproducir su construccion.
- Licencia no declarada: no puede confirmarse el uso comercial ni las obligaciones de atribucion. Cualquier despliegue en produccion deberia aclarar antes la licencia del modelo base del que derive la fusion.
- Procedencia por merge: los modelos fusionados pueden heredar comportamientos inconsistentes de sus componentes y degradarse en dominios concretos; no hay evaluaciones que lo descarten en este caso.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado aqui por falta de evaluaciones.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento, por lo que no se pueden anticipar sesgos de genero, idioma, cultura o dominio.
- Idiomas: no se declaran idiomas soportados. Aunque el linaje Qwen3 suele ser multilingue, no debe asumirse un rendimiento correcto en castellano sin una evaluacion previa.
- Contexto desconocido: no se puede planificar el uso con documentos largos ni con conversaciones extensas hasta medir la ventana real soportada.
- Validacion limitada: 0 likes y sin discusion publica ni resultados de terceros; el modelo no tiene contraste externo.
- Cuantizaciones agresivas: las variantes por debajo de Q4 pueden degradar razonamiento y seguir instrucciones; conviene validar cada quant por separado antes de elegirla para produccion.
- Fechas del repositorio: creacion el 2026-09-09 y ultima actualizacion el 2026-09-14, sin historial de cambios documentado que aclare si el contenido se ha modificado de forma sustancial.

## Enlaces

- HuggingFace: https://huggingface.co/arpicato/qwen38-27b-hca-splice
- Paper, blog, repositorio de codigo o demo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas ajenas al mismo), por lo que no hay enlaces adicionales que citar.
