# skt/A.X-K2

## Resumen

A.X K2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por SK Telecom (SKT) como modelo fundacional orientado a tareas agénticas y sucesor de A.X K1. Cuenta con 688 mil millones de parámetros totales y 33 mil millones de parámetros activos por token, lo que permite un rendimiento de razonamiento elevado manteniendo una eficiencia de inferencia práctica. Forma parte del proyecto de modelo fundacional de IA soberana del gobierno coreano, con un enfoque explícito en la comprensión profunda del coreano y su cultura.

El modelo incorpora una receta de entrenamiento denominada Think-Fusion que permite alternar entre un modo de razonamiento explícito (thinking) para problemas complejos y un modo directo de baja latencia (non-thinking) dentro de un único modelo unificado. La arquitectura se apoya en atención latente multi-cabeza (MLA) con atención dispersa y compuertas específicas por cabeza (SGA), además de una normalización con compuerta (Gated Norm) que estabiliza el entrenamiento a gran escala y favorece el despliegue en baja precisión.

Un rasgo diferencial es su entrenamiento nativo en FP8 (MXFP8, E4M3) tanto en pasada forward como backward, con un checkpoint distribuido directamente en FP8 con escalado por bloques. Esto reduce a la mitad la huella de memoria frente a BF16 y habilita servicio en FP8 sin cuantización post-hoc. El contexto nativo es de 128K tokens, extendido a 256K mediante escalado YaRN, y el tokenizador BBPE de vocabulario amplio (163.840) está optimizado para inglés, coreano, chino, japonés y español, con énfasis en código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE); 61 capas (1 densa + 60 MoE) |
| Parametros totales | 688B (256 expertos enrutados + 1 compartido); 691.690.231.040 segun safetensors |
| Parametros activos | 33B por token (8 expertos + 1 compartido) |
| Longitud de contexto | 262.144 tokens (256K); 128K nativos, extendido a 256K via YaRN |
| Tipos de cuantizacion | Checkpoint nativo en FP8 block-scaled (E4M3, bloques 128x128); entrenamiento nativo MXFP8; soporte de despliegue FP8/NVFP4 |
| Idiomas soportados | en, ko, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8 block-scaled E4M3) |

Otros detalles: 64 cabezas de atencion, hidden size 7168, intermediate size 18432 (capa densa), expert intermediate size 2048, vocab size 163.840, atencion MLA con compuerta de salida por cabeza y atencion dispersa (SGA), normalizacion Gated Norm con QK-normalization. Pesos maestros y gradientes en FP32 durante el entrenamiento.

## Arquitectura y entrenamiento

A.X K2 es un transformer decoder-only con arquitectura MoE de alta capacidad: 256 expertos enrutados mas uno compartido, activando 8 expertos por token, lo que resulta en 33B parametros activos sobre 688B totales. Respecto a A.X K1, el numero de expertos enrutados crece de 192 a 256 manteniendo el conteo de parametros activos. Los bloques incorporan dos mecanismos de compuerta: Sparse Gated Attention (SGA) en la subcapa de atencion y Gated Norm (GN) en la ruta de normalizacion.

SGA combina una compuerta de salida especifica por cabeza sobre MLA (que introduce no linealidad, mitiga los attention sinks y mejora la convergencia de la perdida) con atencion dispersa mediante un indexador ligero que puntua y selecciona los top-k indices de clave-valor antes de aplicar MLA sobre la cache KV seleccionada. Gated Norm aplica una compuerta dependiente de la entrada tras RMSNorm para suprimir activaciones masivas y valores atipicos del estado oculto, estabilizando el entrenamiento y produciendo distribuciones favorables para despliegue en FP8/NVFP4.

El entrenamiento se realizo desde cero en FP8 nativo (MXFP8, E4M3) en forward y backward, con pesos maestros y gradientes en FP32. Los datos de preentrenamiento citados incluyen nvidia/Nemotron-CC-v2.1, nvidia/Nemotron-Pretraining-Code-v2 y HuggingFaceFW/fineweb-2. La receta Think-Fusion permite que un unico modelo soporte modos thinking y non-thinking. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset, ni si se aplicaron fases especificas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en cinco idiomas (ingles, coreano, chino, japones y espanol).
- Razonamiento complejo con modo thinking explicito de multiples pasos y modo non-thinking de baja latencia, seleccionable por peticion.
- Rendimiento orientado a tareas agenticas y seguimiento de instrucciones, segun la model card.
- Capacidad de codigo reforzada por un tokenizador optimizado para codigo fuente, texto estructurado y patrones de programacion.
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones prolongadas.
- Despliegue eficiente en FP8 nativo, sin cuantizacion post-hoc.
- No se especifica en la informacion disponible soporte explicito de tool calling, function calling, vision o audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, alternando el modo non-thinking para respuestas rapidas y el modo thinking para resolver incidencias complejas.
- Generacion de codigo en produccion: su tokenizador optimizado para codigo y su capacidad de razonamiento lo hacen adecuado para autocompletado, refactorizacion y generacion de tests dentro de pipelines de desarrollo.
- Analisis de documentos largos en espanol y coreano: resumen y extraccion de informacion sobre contratos, informes o expedientes que superan los 128K tokens, aprovechando la extension YaRN a 256K.
- Asistentes agenticos multi-paso: planificacion y ejecucion de tareas encadenadas que requieren razonamiento explicito, con la posibilidad de degradar a modo directo para pasos simples y reducir coste.
- Servicio de inferencia de alto rendimiento: el checkpoint en FP8 block-scaled permite desplegar en infraestructura con memoria reducida a la mitad frente a BF16, adecuado para plataformas con requisitos estrictos de latencia y throughput.
- Localizacion y generacion de contenido multilingue: traduccion y redaccion entre los cinco idiomas soportados, con especial atencion a la calidad en coreano por su origen en el proyecto de IA soberana.
- Investigacion en modelos MoE a gran escala: la publicacion del checkpoint en FP8 y del informe tecnico facilita la reproducibilidad y el estudio de tecnicas como SGA y Gated Norm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP8 block-scaled ocupa aproximadamente 694 GB en el repositorio; en BF16 el modelo requeriria del orden del doble. El calculo en FP8/NVFP4 reduce la huella frente a BF16, pero los 688B parametros totales exigen agregacion de memoria multi-GPU.
- GPU recomendadas: despliegue en nodos multi-GPU de clase H100 o superior; no es viable en una unica GPU de consumo.
- No cabe en GPU de consumo (RTX 4090 u similares) por el volumen total de parametros, aunque el conteo activo de 33B reduce el coste computacional por token.
- Opciones de despliegue: al estar en formato transformers/safetensors y FP8 nativo, es compatible con stacks de servicio que soporten FP8 (por ejemplo, vLLM o TGI con soporte FP8). No se confirma en la informacion disponible soporte de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. La model card destaca mayor throughput y menor latencia en secuencias largas gracias a SGA, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| A.X K2 (SKT) | 688B / 33B | 256K (128K nativo + YaRN) | apache-2.0 | Hugging Face, FP8 nativo |
| A.X K1 (SKT) | no disponible (192 expertos enrutados, 33B activos) | no disponible | no disponible | predecesor |
| Alternativas MoE de escala comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de modelos comparables de la misma categoria, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan tasas concretas.
- Sesgos potenciales derivados de los datasets de preentrenamiento (Nemotron-CC, Nemotron-Pretraining-Code, fineweb-2); no se detallan evaluaciones de sesgo.
- Cobertura linguistica limitada a cinco idiomas (en, ko, zh, ja, es); el rendimiento en otros idiomas no esta garantizado.
- Aunque el contexto es de 256K, la extension por YaRN puede degradar la calidad respecto al rango nativo de 128K en tareas de recuperacion de informacion en posiciones distantes.
- El modo thinking incrementa el consumo de tokens y la latencia; conviene reservarlo para tareas que lo requieran.
- Licencia apache-2.0: permite uso comercial, pero deben respetarse las condiciones de los datasets de entrenamiento subyacentes.
- El gran volumen de parametros (688B) y el tamano del repositorio (~694 GB) imponen requisitos de infraestructura elevados para su despliegue en produccion.
- No se confirma en la informacion disponible soporte de tool calling, vision ni audio, lo que limita su uso en pipelines agenticos que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skt/A.X-K2
- Coleccion de modelos: https://huggingface.co/collections/skt/ax-k2
- Repositorio GitHub: https://github.com/SKT-AI/A.X-K2
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30181
