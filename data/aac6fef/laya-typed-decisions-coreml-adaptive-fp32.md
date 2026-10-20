# aac6fef/laya-typed-decisions-coreml-adaptive-fp32

## Resumen

laya-typed-decisions-coreml-adaptive-fp32 es una conversion nativa a Core ML de un modelo de clasificacion de texto con salidas estructuradas: recibe un texto y un conjunto de opciones tipadas, y devuelve para cada opcion una respuesta seleccionada dentro de un vocabulario cerrado (por ejemplo, si/no/desconocido). El modelo original es convaiinnovations/laya-typed-decisions, fijado en la revision f9ab0b228f0fc0f14d873dbc99038f135c2da1b2; esta version la publica el usuario independiente aac6fef, sin vinculacion declarada con el autor upstream.

El interes practico esta en el formato de despliegue: el bundle incluye grafos Core ML para lotes de 1, 2, 4 y 16, buckets de secuencias cortas densas, capacidad de 1024 tokens y hasta 32 opciones por grafo, con carga perezosa de los grafos adaptativos. La inferencia no requiere PyTorch, MLX ni Transformers, solo el paquete laya-coreml >= 0.5.1 sobre Apple silicon con macOS 15 o superior, lo que lo hace atractivo para integrar clasificacion/decision estructurada en aplicaciones macOS nativas.

La precision de computo es float32 sobre CPU/GPU (no es la variante de forma fija para ANE). El autor reporta validacion contra el modelo upstream en FP32 con 63/63 respuestas seleccionadas coincidentes y un error maximo de probabilidad calibrada de 1,69935926e-06, aunque advierte que estas comprobaciones finitas no demuestran exactitud universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de clasificacion de texto con salidas tipadas; el README no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | 1024 tokens de capacidad por grafo |
| Tipos de cuantizacion | float32 (FP32) en esta variante; el autor indica que FP16 no es numericamente identico a FP32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (bundle .mlpackage/.mlmodelc con grafos para B=1/2/4/16); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base convaiinnovations/laya-typed-decisions: la model card de esta conversion no documenta capas, numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO. Lo que si se documenta es la capa de despliegue: una exportacion Core ML con multiples grafos especializados por tamano de lote (1, 2, 4, 16), buckets densos para secuencias cortas, ventana de 1024 tokens y soporte de hasta 32 opciones tipadas por grafo.

La innovacion tecnica destacable es el esquema adaptativo: los grafos se cargan de forma perezosa segun la forma de la entrada y el runtime mantiene por defecto una cache de hasta cuatro instancias de ejecucion adicionales (nunca respuestas), lo que reduce la latencia en formas repetidas a cambio de un coste sustancial de memoria residente; shape_cache_size=0 desactiva esas instancias extra. El comportamiento logico de lote y ventana sigue upstream Laya v0.4.12. El autor indica que los ficheros del modelo son identicos byte a byte a la exportacion densa validada, y que el empaquetado solo cambia metadatos de procedencia y anade la tarjeta y la licencia.

## Capacidades

- Clasificacion de texto con salida estructurada: dado un texto y un conjunto de opciones tipadas, devuelve una respuesta seleccionada por opcion.
- Decisiones tipadas con vocabulario cerrado: el ejemplo de la model card usa el tipo "noul" con la pregunta "Does the customer request a refund?" sobre el texto "The customer requests a refund.".
- Soporte de hasta 32 opciones por grafo, lo que permite plantear varias preguntas de clasificacion en una sola pasada.
- Manejo de lotes de 1, 2, 4 y 16 mediante grafos dedicados, con buckets densos para secuencias cortas.
- Capacidad de contexto de 1024 tokens por grafo.
- Inferencia sin PyTorch, MLX ni Transformers: solo el runtime laya-coreml.
- No se documentan capacidades de generacion libre, razonamiento multi-paso, tool calling, agentes, vision ni audio.

## Casos de uso

- Clasificacion de tickets de soporte en aplicaciones macOS: enviar el texto del ticket junto con opciones tipadas (por ejemplo, "pide reembolso", "pide cancelacion") y obtener la decision directamente, sin pipeline de generacion.
- Moderacion de contenido en apps nativas de Apple silicon: definir opciones cerradas de categoria y umbral y clasificar mensajes con latencia baja y sin dependencias de Python pesadas en produccion.
- Enrutado de correo o formularios: clasificar el texto entrante en un conjunto fijo de departamentos o intenciones y usar la salida para dirigir el flujo interno.
- Extraccion de senales estructuradas en herramientas de CRM: multiples opciones por grafo (hasta 32) permiten evaluar varias preguntas de negocio sobre el mismo texto en una sola llamada.
- Preetiquetado en anotacion de datos: usar el modelo para generar etiquetas preliminares sobre corpus de texto y reducir el trabajo manual de revision.
- Clasificacion por lotes offline: aprovechar los grafos B=16 para procesar volumenes moderados de documentos en local, sin enviar datos a servicios externos.
- Integracion en apps de escritorio con requisitos de privacidad: al ejecutarse en el dispositivo con Core ML sobre CPU/GPU, el texto no sale del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de rendimiento es la validacion funcional declarada por el autor: 63/63 respuestas seleccionadas coincidentes con el modelo upstream en FP32, error maximo de probabilidad calibrada de 1,69935926e-06, 100 llamadas repetidas estables y comprobaciones completas de salida publica, documentadas en validation.json.

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon con macOS 15 o superior; probado en un M3 Max.
- Precision: float32 en CPU/GPU. No es la variante de forma fija para Neural Engine.
- Memoria: el benchmark FP32 de la version 0.5.1 registra un pico de RSS del proceso Core ML de entre 5,10 y 8,77 GiB; el autor advierte que no es una medida de memoria unificada total del dispositivo ni una estimacion para FP16.
- La cache de formas activa (por defecto hasta cuatro instancias de ejecucion extra) mejora la latencia en formas repetidas a cambio de un coste de memoria residente considerable; se puede desactivar con shape_cache_size=0.
- Las formas nuevas o en frio pueden ser mas lentas por la carga perezosa de grafos.
- Despliegue mediante el paquete laya-coreml >= 0.5.1 (pip install laya-coreml==0.5.1). No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un bundle Core ML.
- Tamano del repositorio: 1,7 GB.
- No se publican cifras de latencia ni throughput por token o por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| laya-typed-decisions-coreml-adaptive-fp32 | Conversion Core ML FP32 de clasificacion con salidas tipadas | 1024 tokens | apache-2.0 | HuggingFace, requiere laya-coreml y Apple silicon |
| convaiinnovations/laya-typed-decisions (upstream) | Modelo original de clasificacion con salidas tipadas | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Modelo Core ML de forma fija para ANE del mismo upstream | Variante de forma fija, precision no detallada | no disponible | no disponible | Repositorios de un solo grafo en el Hub, segun el autor |

No se dispone de datos de rendimiento comparables entre estas variantes. Para alternativas fuera del ecosistema Core ML no hay informacion en la documentacion proporcionada.

## Limitaciones y advertencias

- La validacion declarada se limita a 63 respuestas y a comprobaciones finitas; el propio autor indica que no demuestra exactitud universal del modelo.
- No hay informacion sobre sesgos del modelo base ni sobre la composicion de sus datos de entrenamiento.
- Riesgo de alucinacion no evaluado: al tratarse de clasificacion con vocabulario cerrado el riesgo estructural es menor, pero no se documentan tasas de error en dominios distintos del conjunto de validacion.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingue.
- Dependencia estricta de plataforma: Apple silicon y macOS 15 o superior, con laya-coreml >= 0.5.1. No es portable a Linux, Windows ni GPUs NVIDIA.
- Es una conversion independiente: el autor de esta ficha no esta afiliado al autor del modelo upstream, y la reproducibilidad exige fijar la revision mediante revision=.
- FP16 no es numericamente identico a FP32; si se necesita equivalencia con la validacion, hay que usar esta variante FP32.
- El consumo de memoria residente puede ser alto con la cache de formas activa (hasta 5,10-8,77 GiB de pico de RSS en el benchmark citado).
- Licencia apache-2.0 para este empaquetado; conviene verificar la licencia del modelo base antes de un uso comercial, ya que no se detalla en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aac6fef/laya-typed-decisions-coreml-adaptive-fp32
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Evidencia de calificacion del runtime (QUALIFICATION_0_5_1): https://github.com/mizorewww/laya-coreml/blob/main/docs/QUALIFICATION_0_5_1.md
