# aac6fef/laya-coreml-adaptive-fp16

## Resumen

`aac6fef/laya-coreml-adaptive-fp16` es una conversión nativa a Core ML del modelo `convaiinnovations/laya`, publicada por el usuario independiente `aac6fef` y fijada a la revisión upstream `c5d78730f3493e4fe16d61507ef4b78eef7318cf`. No se trata de un modelo nuevo ni de un reentrenamiento: los archivos del modelo son, según la model card, byte a byte idénticos al export denso ya validado, y el cambio afecta únicamente al empaquetado, los metadatos de procedencia y la licencia. El objetivo es ejecutar Laya en Apple silicon sin depender de PyTorch, MLX ni Transformers, usando el runtime `laya-coreml` (versión mínima 0.5.1).

La aportación técnica del bundle es el uso de gráficos adaptativos: incluye variantes para lotes B=1, 2, 4 y 16, buckets densos de secuencia corta, una capacidad de 512 tokens y hasta 32 opciones por gráfico. El comportamiento lógico de lote y ventana sigue a Laya v0.4.12 upstream. El cálculo se realiza en float16 sobre CPU y GPU de Core ML, y el autor advierte explícitamente de que no es el modelo de forma fija para ANE.

Es relevante ahora por dos motivos concretos: permite validar y desplegar un clasificador de texto estructurado (predicción sobre un conjunto cerrado de opciones, hasta 32 por gráfico) en macOS 15+ y Apple silicon con una API de tres líneas, y porque publica evidencia de cualificación reproducible (63/63 respuestas coincidentes con FP32 upstream, error máximo de probabilidad calibrada de 0,00330762583 y 100 llamadas repetidas estables). El repositorio es pequeño (0,8 GB) y tiene un historial de adopción muy bajo (11 descargas, 1 like), lo que lo sitúa como artefacto experimental más que como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conversión Core ML de `convaiinnovations/laya`; el autor no documenta la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 512 tokens de capacidad de secuencia por gráfico, con buckets densos de secuencia corta |
| Tipos de cuantizacion | float16 (FP16); no se publican variantes int8/int4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | bundle Core ML (gráficos adaptativos cargados por `laya-coreml`); no se distribuyen safetensors ni GGUF |
| Tarea (pipeline) | text-classification con opciones estructuradas (hasta 32 opciones por gráfico) |
| Lotizacion soportada | B=1, 2, 4 y 16 (gráficos separados) |
| Precision de computo | float16 en CPU/GPU de Core ML (no es el modelo de forma fija para ANE) |
| Requisitos de plataforma | Apple silicon, macOS 15+, `laya-coreml >= 0.5.1` |
| Tamano del repositorio | 0,8 GB |
| Revision upstream fijada | `c5d78730f3493e4fe16d61507ef4b78eef7318cf` |
| Descargas / likes | 11 / 1 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base (número de capas, dimensión oculta, mecanismo de atención ni composición del dataset). Lo único documentado a este nivel es que el comportamiento lógico de lote y ventana replica Laya v0.4.12 upstream, que la capacidad de secuencia es de 512 tokens y que el modelo consume un texto y un diccionario de opciones con nombre, tipo e instrucciones, devolviendo una respuesta seleccionada. Esta firma de API corresponde a un clasificador/selector estructurado más que a un generador de texto libre.

El trabajo de conversión sí está detallado: se generan grafos adaptativos para B=1, 2, 4 y 16 con buckets densos para secuencias cortas, lo que evita recompilar formas en los casos frecuentes. Los grafos se cargan de forma perezosa y la caché del runtime retiene como máximo cuatro instancias de ejecución adicionales (nunca respuestas), con un coste reseñable de memoria residente; `shape_cache_size=0` desactiva esas instancias extra. El autor advierte de que las formas nuevas o frías pueden ser más lentas y que FP16 no es numéricamente idéntico a FP32. No se documenta ningún proceso de RLHF, DPO ni ajuste posterior; al ser una conversión, el entrenamiento es el del modelo upstream y no se detalla en esta información.

## Capacidades

- Clasificación de texto con opciones cerradas: recibe una frase y un diccionario de opciones tipadas con instrucciones, y devuelve la opción seleccionada junto con probabilidad calibrada.
- Soporte de hasta 32 opciones por gráfico, suficiente para intents de atención al cliente, enrutado o etiquetado multietiqueta acotado.
- Ejecución por lotes con gráficos dedicados para B=1, 2, 4 y 16, lo que permite agrupar peticiones y amortizar el coste por llamada.
- Inferencia sin PyTorch, MLX ni Transformers: solo requiere el paquete `laya-coreml`.
- Reproducibilidad por revisión: la model card recomienda fijar el SHA del repositorio con `revision=` en producción.
- Validación publicada: 63/63 respuestas seleccionadas coinciden con el modelo FP32 upstream, con error máximo de probabilidad de 0,00330762583 y 100 llamadas repetidas estables.
- No se documentan capacidades de generación libre, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking".
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo recibe el mensaje del usuario y un conjunto de opciones (`refund`, `cancel`, `track`, etc.) con instrucciones en lenguaje natural, y devuelve la intención con probabilidad. Con 32 opciones por gráfico cubre la mayoría de árboles de intents de primer nivel.
- Enrutado y triaje de tickets: cada ticket se clasifica contra las colas disponibles y se deriva al equipo correspondiente. El soporte de lotes B=16 permite procesar tandas en local sin salir del portátil.
- Moderación y etiquetado ligero en el dispositivo: al ejecutarse sobre Core ML en Apple silicon, encaja en flujos donde el texto no debe salir del equipo, algo relevante para datos de clientes o contenido interno.
- Validación de salidas en pipelines generativos: usar Laya como verificador de una decisión acotada (por ejemplo, ¿la respuesta cumple la política X?) antes de publicar la salida de un LLM, con umbral sobre la probabilidad calibrada.
- Pruebas de regresión de modelos de clasificación: el bundle sirve como referencia FP16 local para comparar contra el modelo upstream en CI, dado que el autor publica `validation.json` y fija la revisión del código fuente.
- Prototipado rápido en macOS: la API `laya.load(...)` + `agent.predict(...)` permite tener un clasificador funcionando en un script de pocas líneas, sin instalar stack de deep learning.
- Extracción de decisiones en herramientas de escritorio: aplicaciones nativas de macOS pueden integrar el bundle para clasificar comandos o comandos de voz transcritos contra un vocabulario fijo de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de clasificación sobre un conjunto público). La única evidencia cuantitativa es de cualificación frente a la referencia FP32 upstream:

| Metrica | Resultado |
|---|---|
| Respuestas seleccionadas coincidentes con FP32 upstream | 63/63 |
| Error maximo de probabilidad calibrada | 0,00330762583 |
| Llamadas repetidas estables | 100 |
| Comprobaciones de salida publica | completas (ver `validation.json`) |
| Memoria pico del proceso en benchmark FP32 (0.5.1) | 5,10–8,77 GiB (RSS; no es una medida de memoria unificada ni una estimacion para FP16) |

El propio autor advierte de que estas comprobaciones finitas no demuestran precisión universal del modelo.

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon (probado en M3 Max) con macOS 15 o superior; el runtime es Core ML, por lo que no hay ruta de ejecución en GPU NVIDIA ni en CPU x86 convencional.
- Almacenamiento: repositorio de 0,8 GB; el espacio en disco debe cubrir además las instancias de ejecución adicionales que materialice la caché de formas.
- VRAM/memoria: no hay estimación publicada para FP16. La única referencia es el pico de RSS del proceso en el benchmark FP32 de la versión 0.5.1 (5,10–8,77 GiB), que el autor recalca que no equivale a memoria unificada ni sirve como estimación FP16.
- Memoria residente adicional: la caché por defecto retiene hasta cuatro instancias de ejecución extra, con coste "sustancial"; `shape_cache_size=0` la desactiva a cambio de más latencia en formas repetidas.
- GPU recomendadas: no aplica el concepto de GPU discreta; se ejecuta sobre la GPU integrada de la serie M. Chips de gama alta (M3 Max y superiores) son los que el autor ha validado.
- Opciones de despliegue: exclusivamente el runtime `laya-coreml` (`pip install laya-coreml==0.5.1`) sobre Core ML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en safetensors ni GGUF para esos motores.
- Latencia y throughput: no disponibles. El autor solo indica que las formas nuevas o frías pueden ser más lentas y que la caché de formas mejora la latencia en formas repetidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `aac6fef/laya-coreml-adaptive-fp16` | no disponible | 512 tokens | Core ML (FP16), `laya-coreml >= 0.5.1` | apache-2.0 | Grafos adaptativos B=1/2/4/16, hasta 32 opciones; validado contra FP32 upstream |
| `convaiinnovations/laya` (upstream) | no disponible | no disponible | pesos originales (PyTorch/Transformers, segun la model card) | no disponible en esta informacion | Referencia de comportamiento; requiere el stack de deep learning habitual |
| Conversiones Core ML de grafo unico del mismo modelo | no disponible | no disponible | Core ML | no disponible | El autor indica que los repositorios de grafo unico en el Hub siguen sin cambios; no se detallan sus caracteristicas |

No se dispone de datos de benchmarks ni de especificaciones de parametros que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Cobertura de idiomas no documentada: no se puede asumir calidad multilingüe ni siquiera en castellano sin evaluarla.
- Ámbito funcional estrecho: es un clasificador sobre opciones cerradas con capacidad de 512 tokens; no es un modelo generativo ni un agente. Superar las 32 opciones o los 512 tokens queda fuera del diseño del bundle.
- FP16 no es numéricamente idéntico a FP32: el error máximo publicado de probabilidad (0,0033) es pequeño pero no nulo; para decisiones sensibles hay que fijar umbrales con margen.
- Validación finita: el autor declara explícitamente que 63/63 coincidencias y 100 llamadas estables no prueban precisión universal.
- Dependencia de plataforma: Apple silicon y macOS 15+ con `laya-coreml >= 0.5.1`. No hay portabilidad a Linux, Windows ni CUDA, lo que bloquea el despliegue en servidores convencionales.
- Consumo de memoria de la caché de formas: el valor por defecto retiene hasta cuatro instancias de ejecución adicionales con coste "sustancial" de memoria residente; en equipos con poca RAM unificada conviene evaluar `shape_cache_size=0`.
- Latencia variable: las formas nuevas o frías pueden ser más lentas; la primera llamada tras cargar un gráfico no representa el rendimiento en régimen.
- Adopción testimonial: 11 descargas y 1 like reducen la probabilidad de que los fallos estén detectados por terceros. El propio autor firma la conversión como independiente y no oficial.
- Licencia: apache-2.0 permite uso comercial, pero la licencia del modelo upstream no se detalla en la información disponible; conviene verificarla antes de un despliegue comercial, ya que la conversión solo cambia metadatos de procedencia.
- Reproducibilidad: para evitar deriva es necesario fijar el SHA del repositorio con `revision=` y la versión exacta del runtime.
- Sesgos y alucinación: no hay información publicada sobre sesgos del modelo base ni sobre tasas de error por subgrupo. Al ser clasificación con opciones cerradas, el riesgo de "alucinación" se manifiesta como asignación errónea de opción, no como texto inventado.
- Búsqueda web: las consultas realizadas no devolvieron resultados técnicos relevantes sobre este modelo; solo se dispone de la información de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aac6fef/laya-coreml-adaptive-fp16
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Evidencia de cualificación del runtime 0.5.1: https://github.com/mizorewww/laya-coreml/blob/main/docs/QUALIFICATION_0_5_1.md
- Repositorio del runtime: https://github.com/mizorewww/laya-coreml
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
