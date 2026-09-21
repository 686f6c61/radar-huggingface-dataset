# samatv256/mini-Jev

## Resumen

ODM Mini v1 (repositorio `samatv256/mini-Jev`) es un cabezal de decisión (*DecisionHead*) de pesos abiertos que se apoya en el modelo `Qwen/Qwen3-0.6B` congelado como extractor de representaciones. No es un modelo generativo: dada una descripción del estado de un agente y una lista de acciones candidatas, devuelve una puntuación por candidato, una probabilidad agrupada vía softmax, la acción seleccionada, la confianza, el margen de decisión y la latencia medida. Su propósito es resolver la selección de herramientas (*tool selection*) en bucles de agentes con un coste computacional muy bajo.

El componente entrenado específicamente es diminuto: el cabezal contiene 262.657 parámetros (~1,1 MB en FP32), mientras que el backbone Qwen3-0.6B se descarga por separado y no se redistribuye en este repositorio. La arquitectura del cabezal es lineal: *mean pooling* de los estados ocultos de los tokens de descripción de candidatos, `Linear(1024,256)`, activación GELU, `Linear(256,1)` y softmax agrupado sobre el conjunto de candidatos.

Su relevancia actual es doble. Por un lado, explora el patrón de "modelos de sistema 1" ligeros que toman decisiones discretas sin generar texto, lo que abarata la latencia frente a invocar un LLM generativo para enrutar herramientas. Por otro, el propio autor lo publica con resultados de evaluación negativos muy explícitos: en una prueba con agente en sombra sobre 75 trayectorias multiturno y 243 decisiones, la precisión de acción cayó al 27,98%. Es, por tanto, un prototipo de investigación, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer congelado (Qwen3-0.6B) como extractor + cabezal de decisión lineal: mean pooling de descripciones, Linear(1024,256), GELU, Linear(256,1), softmax agrupado |
| Parametros totales | 262.657 (solo el DecisionHead entrenado). El modelo ejecutable requiere ademas el backbone Qwen3-0.6B (~0,6 B segun su denominacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la model card solo reporta evaluaciones con estados de aproximadamente 256 a 1.024 tokens |
| Tipos de cuantizacion | no disponible. El cabezal se evalua siempre en FP32; el backbone usa BF16 en CUDA y FP32 en CPU |
| Idiomas soportados | no disponible (el modelo no genera texto; hereda el tokenizador de Qwen3-0.6B) |
| Licencia | Apache-2.0 para el cabezal, el codigo y los pesos de este repositorio; el backbone Qwen3-0.6B se rige por los terminos de su propio repositorio |
| Formato de pesos | safetensors (`model.safetensors`, solo tensores del DecisionHead), mas `config.json` y el cargador `odm_mini.py` |
| Tipo de modelo | Modelo de decision / seleccion de herramientas; no generativo |
| Modelo base | Qwen/Qwen3-0.6B (backbone congelado) |
| Autor | samatv256 |
| Tamano del repo | 0,0 GB |
| Descargas / likes en el Hub | 0 descargas / 1 like |
| Fecha de creacion (Hub) | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El flujo de inferencia es el siguiente: el backbone Qwen3-0.6B permanece congelado y procesa la concatenacion de estado y descripciones de candidatos; despues se aplica *mean pooling* exclusivamente sobre los estados ocultos de los tokens de descripcion, excluyendo de la mascara de pooling el identificador del candidato, las cabeceras del prompt, los tokens de estado y el relleno (*padding*). La representacion resultante pasa por dos capas lineales con GELU intermedia y produce un escalar por candidato. Sobre el conjunto de escalares se aplica un softmax agrupado (*grouped softmax*) que normaliza entre candidatos, de modo que la salida maxima se reporta como confianza, no como probabilidad calibrada universalmente. La temperatura se mantiene en 1.0.

El entrenamiento uso 50.000 decisiones sinteticas con el backbone congelado y actualizacion exclusiva del DecisionHead, con objetivo de entropia cruzada agrupada. El checkpoint publicado corresponde a la semilla 41, epoca 4. No se menciona uso de RLHF ni DPO, ni composicion detallada del dataset mas alla de su naturaleza sintetica y estatica. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal: la eficiencia procede de que el cabezal tiene 262.657 parametros y de que el autor menciona una ruta de servicio con cache KV de prefijo compartido para el backbone.

## Capacidades

- Ranking de acciones candidatas: devuelve puntuaciones por candidato y una eleccion unica entre las opciones proporcionadas.
- Salidas estructuradas de decision: accion seleccionada, probabilidades agrupadas, confianza, margen de decision y latencia en milisegundos.
- Seleccion de herramientas (*tool selection*) en agentes: el ejemplo de la model card cubre candidatos como `weather.lookup`, `calendar.list` y `control.finish`.
- Extraccion offline de representaciones de candidatos: alcanza 831,3 candidatos por segundo con tamano de lote 512, cacheando 430.072 candidatos.
- Integracion sin `trust_remote_code`: el cargador `odm_mini.py` se importa como codigo local deterministico.
- Ejecucion en CPU y en CUDA con precision distinta por dispositivo (FP32 en CPU, BF16 en el backbone sobre CUDA).
- No genera texto: no hay capacidad de redaccion, resumen, traduccion ni conversacion.
- No se documentan capacidades de vision, audio, *thinking mode*, ni de llamada a funciones en sentido generativo.

## Casos de uso

- Enrutado de herramientas en agentes locales de bajo coste: usar ODM Mini como primera etapa que elige entre un conjunto cerrado de herramientas antes de invocar un LLM mayor, aprovechando que el cabezal anade solo 262.657 parametros y una latencia de decenas de milisegundos.
- Investigacion en politicas de decision tipo *system one*: comparar un cabezal discriminativo frente a un LLM generativo que produce el nombre de la herramienta como texto, midiendo latencia y precision en el mismo banco de decisiones.
- Evaluacion en modo sombra: ejecutar ODM Mini en paralelo a un controlador de produccion y registrar su eleccion, su confianza y su margen para estudiar donde divergen, tal como sugiere el propio autor.
- Analisis de calibracion de confianza: explotar la terna confianza, margen de decision y probabilidades agrupadas para detectar decisiones poco fiables y delegarlas a un controlador alternativo.
- Extraccion masiva de representaciones de candidatos: usar la ruta offline (831,3 candidatos/s con lotes de 512) para precalcular *embeddings* de un catalogo de herramientas y alimentar sistemas de recuperacion de acciones.
- Experimentos de *benchmarking* de robustez: aplicar la evaluacion contrafactual por pares (67,12% de consistencia) para medir la sensibilidad del modelo a reordenaciones o reformulaciones de las descripciones de candidatos.
- Prototipos de hackathon y demos de agentes: al caber el backbone en cualquier GPU de consumo e incluso en CPU, permite montar una demo de seleccion de acciones sin infraestructura dedicada, siempre con supervision externa.

## Benchmarks y rendimiento

Evaluacion sintetica con conjunto de validacion reservado (*held-out*):

| Metrica | Resultado |
|---|---:|
| Precision de eleccion semantica (Semantic Choice accuracy) | 72,97% |
| Precision de eleccion bajo estres (Stress Choice accuracy) | 67,64% |
| Consistencia en pares contrafactuales (Counterfactual pair consistency) | 67,12% |

Evaluacion con agente en sombra sobre trazas reales (75 trayectorias multiturno, 243 decisiones):

| Metrica | Resultado |
|---|---:|
| Precision de accion (action accuracy) | 27,98% |
| Concordancia con el controlador (controller agreement) | 26,34% |

Medidas de rendimiento en un NVIDIA GH200 con backbone en BF16 y ruta de servicio con cache KV de prefijo compartido:

| Medicion | Resultado |
|---|---:|
| Latencia total, 3-16 candidatos, 256-1.024 tokens de estado | 76,11-82,36 ms (rango reportado 76-85 ms) |
| Extraccion offline de representaciones (lote de 512) | 831,3 candidatos/s |
| Candidatos cacheados durante la medicion | 430.072 |

El autor advierte que estas cifras son especificas del hardware y la carga de trabajo y que no constituyen una comparacion directa con Jev ni con ningun servicio alojado. No se han publicado resultados en la informacion disponible para benchmarks estandar de LLM (MMLU, HumanEval, GSM8K u otros), y no procede extrapolarlos porque el modelo no es generativo.

## Requisitos de hardware

- Cabezal de decision: 262.657 parametros, aproximadamente 1,1 MB en FP32. Es despreciable frente al backbone.
- Backbone requerido: `Qwen/Qwen3-0.6B` descargado aparte. Estimacion a partir de sus ~0,6 B de parametros: en BF16 ocupa aproximadamente 1,2 GB de VRAM; en FP32, aproximadamente 2,4 GB. El modelo card no publica cifras exactas de VRAM.
- GPU de consumo: cabe en practicamente cualquier GPU con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) y tambien en CPU, dado el tamano del backbone.
- GPU de centro de datos: el autor midio latencias en un NVIDIA GH200. No se reportan mediciones para A100, H100 ni otras GPU de centro de datos en la informacion disponible.
- CPU: soportada de forma explicita, con el backbone en FP32 y el cabezal siempre en FP32.
- Opciones de despliegue: cargador propio `odm_mini.py` (importado como codigo local, sin `trust_remote_code`), `torch`, `transformers`, `safetensors` y `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un LM generativo y no publica pesos en GGUF.
- Latencia y throughput: 76,11-82,36 ms por decision con 3-16 candidatos y 256-1.024 tokens de estado en GH200; 831,3 candidatos/s en extraccion offline por lotes. Ambas cifras son especificas del hardware de medicion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Seleccion de herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ODM Mini v1 (`samatv256/mini-Jev`) | Cabezal discriminativo sobre backbone congelado | 262.657 en el cabezal + backbone Qwen3-0.6B | no disponible | Nativa: ranking de candidatos con confianza y margen | Apache-2.0 (cabezal); backbone con sus propios terminos | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen3-0.6B sin ajustar | LLM generativo | ~0,6 B | no disponible en la informacion proporcionada | Indirecta, mediante prompt que solicite el nombre de la herramienta | Apache-2.0 segun su repositorio | HuggingFace, ampliamente utilizado |
| Jev | Sistema de decision de agentes citado por el autor como referencia | no disponible | no disponible | no disponible | no disponible | no disponible |
| Router semantico basado en embeddings + similitud | Recuperacion por similitud | no disponible | no disponible | Ranking de candidatos por similitud, sin confianza calibrada ni margen | depende de la implementacion | generico |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: la model card no incluye comparativas de precision frente a Qwen3-0.6B sin ajustar, Jev ni routers de embeddings, y el propio autor senala que sus latencias no constituyen una comparacion directa con Jev.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que ODM Mini v1 no esta listo para control de agentes en produccion sin supervision.
- Fallo principal conocido: completado prematuro con alta confianza en trayectorias multiturno. Tras un progreso parcial, el modelo puede sobreponderar recibos de exito y elegir `control.finish` antes de terminar los pasos restantes.
- Precision real baja en bucles de agente: 27,98% de precision de accion y 26,34% de concordancia con el controlador en la evaluacion en sombra con 243 decisiones.
- Datos de entrenamiento sinteticos y estaticos (50.000 decisiones), por lo que las metricas de validacion no deben asumirse transferibles a herramientas, dominios o bucles de agente arbitrarios.
- La confianza no es una probabilidad calibrada universalmente: es el maximo del softmax agrupado con temperatura 1.0.
- Brecha grande entre la evaluacion sintetica (72,97%) y la evaluacion en sombra (27,98%), lo que sugiere sobreajuste al formato de las decisiones sinteticas.
- Licencia: el cabezal, el codigo y los pesos de este repositorio son Apache-2.0, pero el backbone Qwen3-0.6B se descarga por separado y queda sujeto a sus propios terminos; el uso comercial debe verificar ambas licencias.
- No redistribuye los pesos de Qwen, por lo que el despliegue requiere dos descargas y gestionar la coherencia de versiones.
- Sin cuantizaciones publicadas ni formatos GGUF, y sin soporte documentado en servidores de inferencia convencionales.
- Sin datos publicados de sesgos, cobertura idiomatica ni comportamiento fuera del ingles usado en los ejemplos de la model card.
- No debe usarse como unico responsable de decisiones con consecuencias (acciones financieras, cambios en sistemas, comunicaciones automaticas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samatv256/mini-Jev
- Backbone requerido, Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia Apache 2.0: incluida en el repositorio como archivo `LICENSE`
- Cargador de inferencia: `odm_mini.py`, incluido en el repositorio
- Las busquedas web realizadas no devolvieron ningun enlace relevante para este modelo: los resultados obtenidos correspondian a clasificaciones deportivas y no guardan relacion con la ficha. No se dispone de papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
