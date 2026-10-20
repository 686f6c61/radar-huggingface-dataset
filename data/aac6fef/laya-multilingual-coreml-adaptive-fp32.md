# aac6fef/laya-multilingual-coreml-adaptive-fp32

## Resumen

Este repositorio contiene una conversión nativa a Core ML del modelo `convaiinnovations/laya-multilingual`, publicada por el usuario independiente `aac6fef` y anclada a la revisión exacta `052592a15d198d9ad47da779604259b10b47b7aa` del modelo original. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son byte a byte idénticos al export denso ya validado, y el trabajo del autor se centra en el empaquetado, la metadata de procedencia y la ejecución sobre Apple silicon sin depender de PyTorch, MLX ni Transformers. El pipeline declarado es `text-classification` y la API expuesta permite lanzar una consulta de texto contra un conjunto de opciones tipadas, devolviendo la opción seleccionada y su probabilidad calibrada.

La relevancia práctica está en el objetivo de despliegue: inferencia local en macOS 15 o superior sobre chips Apple, con grafos adaptativos por tamaño de lote (B=1, 2, 4 y 16), buckets densos para secuencias cortas y una capacidad de 1024 tokens. Esto permite clasificar o enrutar peticiones en aplicaciones de escritorio y flujos on-device sin stack de Python pesado, a costa de una memoria residente notable en FP32 (entre 5,10 y 8,77 GiB de RSS pico del proceso Core ML según el benchmark del runtime 0.5.1).

La información disponible no detalla la arquitectura interna, el número de parámetros ni los datos de entrenamiento del modelo base, por lo que esos datos se marcan como no disponibles. La licencia declarada es Apache 2.0, tanto en el repo como en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conversion Core ML del modelo base `convaiinnovations/laya-multilingual`; grafos adaptativos B=1/2/4/16) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 1024 tokens de capacidad, con buckets densos para secuencias cortas |
| Tipos de cuantizacion | float32 (FP32) sobre CPU/GPU; no es el modelo ANE de forma fija; la model card advierte que FP16 no es numericamente identico a FP32 |
| Idiomas soportados | No disponible (el nombre del modelo base indica "multilingual", sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (bundle `coreml`, libreria `coreml`, runtime `laya-coreml`); repo de 1,3 GB |

## Arquitectura y entrenamiento

El artefacto es una conversión Core ML con cuatro grafos de lote adaptativo (B=1, 2, 4 y 16), capacidad de 1024 tokens y hasta 32 opciones por grafo. La precisión de cómputo es float32 y se ejecuta sobre CPU/GPU, no sobre la Neural Engine en el formato de forma fija que el autor menciona como alternativa. Los grafos adaptativos se cargan de forma perezosa y la caché del runtime retiene como máximo cuatro instancias de ejecución adicionales (nunca respuestas), lo que reduce la latencia en formas repetidas a cambio de un coste sustancial de memoria residente; `shape_cache_size=0` desactiva esas instancias extra.

No hay información sobre la arquitectura del transformer subyacente, el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Lo que sí se documenta es la validación de la conversión: 63 de 63 respuestas seleccionadas coinciden con el FP32 upstream, el error máximo de probabilidad calibrada es 6,31979044e-07, se realizaron 100 llamadas repetidas estables y comprobaciones completas de salida pública. El autor advierte explícitamente que estas comprobaciones finitas no demuestran exactitud universal del modelo. Se requiere `laya-coreml >= 0.5.1`, Apple silicon y macOS 15+; el entorno de prueba declarado es un M3 Max.

## Capacidades

- Clasificación de texto mediante selección entre opciones tipadas: la llamada `predict(texto, opciones)` devuelve la opción elegida y la probabilidad calibrada asociada.
- Hasta 32 opciones por grafo, lo que cubre escenarios de enrutamiento con decenas de etiquetas en una sola invocación.
- Procesamiento de lotes adaptativo con grafos B=1/2/4/16, pensado para alternar entre peticiones sueltas y lotes mayores sin recompilar.
- Ejecución sin PyTorch, MLX ni Transformers: solo el runtime `laya-coreml` y Core ML.
- Caché de formas configurable para amortizar latencia en patrones de entrada repetidos.
- Soporte de contexto de hasta 1024 tokens por entrada.
- Naturaleza multilingüe inferida del nombre del modelo base, sin listado oficial de idiomas en la informacion disponible.
- No se documentan capacidades de generación libre, tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Enrutamiento de peticiones de soporte en una app de escritorio macOS: clasificar cada mensaje entrante contra etiquetas como "reembolso", "facturación" o "incidencia técnica" usando las opciones tipadas del runtime, sin enviar el texto a un servidor.
- Triaje de correo o formularios on-device: dado un texto de hasta 1024 tokens, asignar una categoría de una lista predefinida de hasta 32 opciones y usar la probabilidad calibrada como umbral para derivar a revisión humana.
- Etiquetado por lotes de un corpus local: aprovechar los grafos B=4 y B=16 para clasificar conjuntos de documentos en un Mac de sobremesa, con la advertencia de que el proceso Core ML puede llegar a 5,10–8,77 GiB de RSS.
- Moderación o cumplimiento de políticas en aplicaciones de escritorio: clasificar contenido contra opciones de política y registrar la decisión con la probabilidad asociada, manteniendo los datos en el dispositivo.
- Clasificación de intenciones en asistentes locales para macOS: el modelo actúa como componente de decisión (qué opción aplicar) dentro de un pipeline mayor, sin generación de texto propia.
- Arnés de regresión reproducible en CI: la model card recomienda fijar el SHA del repositorio con `revision=` y reutilizar `validation.json`, lo que permite comprobar equivalencia numérica frente al FP32 upstream en cada actualización del runtime.
- Prototipado de funciones de clasificación en Xcode o apps Swift mediante Core ML, dado que el bundle no necesita Python en tiempo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card). Los únicos datos numéricos disponibles son de validación de la conversión, no de calidad del modelo:

| Comprobacion | Resultado |
|---|---|
| Respuestas seleccionadas coincidentes con upstream FP32 | 63/63 |
| Error maximo de probabilidad calibrada | 6,31979044e-07 |
| Llamadas repetidas estables | 100 |
| Comprobaciones completas de salida publica | superadas |
| RSS pico del proceso Core ML (runtime 0.5.1, FP32) | 5,10–8,77 GiB |

El autor precisa que el RSS medido no equivale a memoria unificada total del dispositivo ni a una estimación de memoria en FP16.

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon con macOS 15 o superior; probado en M3 Max. No hay soporte para CUDA, ROCm ni GPU de otros fabricantes.
- VRAM/memoria: el benchmark del runtime 0.5.1 en FP32 registra un RSS pico del proceso Core ML de 5,10–8,77 GiB. El repo ocupa 1,3 GB en disco.
- GPU recomendadas: no se especifican modelos concretos; cualquier SoC Apple silicon reciente con macOS 15+ debería poder ejecutar el bundle, con latencia dependiente del chip.
- Cabe en GPU de consumo: sí, en el sentido de que corre en hardware Apple integrado, no en tarjetas NVIDIA/AMD de consumo.
- Despliegue: exclusivamente mediante `pip install laya-coreml==0.5.1` (o superior) y el bundle Core ML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas. La model card indica que la caché de formas mejora la latencia en formas repetidas y que las formas nuevas o frías pueden ser más lentas; recomienda `shape_cache_size=0` para priorizar memoria frente a latencia.

## Comparativa con modelos similares

| Modelo | Formato | Precision | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `aac6fef/laya-multilingual-coreml-adaptive-fp32` (este) | Core ML adaptativo (B=1/2/4/16) | FP32 | 1024 tokens | Apache 2.0 | Solo Apple silicon, macOS 15+, runtime `laya-coreml` |
| `convaiinnovations/laya-multilingual` (upstream) | Pesos originales (PyTorch/Transformers) | No disponible | No disponible | Apache 2.0 (segun el repo derivado) | Multiplataforma; requiere stack Python; referencia de validacion numerica |
| Repositorios Hub de grafo unico del mismo autor | Core ML, un solo grafo | No disponible | No disponible | Apache 2.0 | Segun la model card, permanecen sin cambios; menor adaptabilidad de lote |

No se dispone de información sobre otras conversiones Core ML comparables ni sobre modelos de clasificación multilingüe alternativos con los que contrastar parámetros, contexto o rendimiento; esos datos se marcan como no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo: el pipeline es `text-classification` y la API devuelve una opción entre las suministradas, no texto libre.
- Sesgos conocidos: no disponibles; la model card no documenta evaluación de sesgos ni composición del dataset del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea; el autor subraya que las comprobaciones finitas de validación no demuestran exactitud universal.
- Límite de 1024 tokens por entrada; textos más largos requieren truncado o segmentación por parte de la aplicación.
- Idiomas soportados no documentados: el nombre indica multilingüe, pero no hay listado ni evaluación por idioma.
- Dependencia de plataforma estricta: Apple silicon y macOS 15+; requiere `laya-coreml >= 0.5.1`. Inutilizable en Linux, Windows o servidores con GPU NVIDIA.
- Coste de memoria: la caché de formas mejora la latencia pero incrementa de forma sustancial la memoria residente; conviene fijar `shape_cache_size=0` en entornos con poca RAM.
- Las formas nuevas o frías pueden ser más lentas; el rendimiento no es homogéneo entre patrones de entrada.
- FP16 no es numéricamente idéntico a FP32, según advierte el autor; migrar de precisión invalida la equivalencia validada.
- Conversión independiente, no oficial: no está avalada por `convaiinnovations` y cuenta con 10 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y citar la procedencia; el autor recomienda fijar el SHA con `revision=` para reproducibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aac6fef/laya-multilingual-coreml-adaptive-fp32
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Revision del modelo base fijada: `052592a15d198d9ad47da779604259b10b47b7aa`
- Evidencia de runtime y cualificacion (runtime 0.5.1): https://github.com/mizorewww/laya-coreml/blob/main/docs/QUALIFICATION_0_5_1.md
- Repositorio del runtime: https://github.com/mizorewww/laya-coreml
- Paquete de instalacion: `pip install laya-coreml==0.5.1`
- Fichero de validacion incluido en el repo: `validation.json`
