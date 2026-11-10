# choyiny/yev2-35b-a3b-fp8

## Resumen

yev2-35b-a3b-fp8 es la version cuantizada en FP8 de yev2-35b-a3b, un modelo abierto de decision "System One" construido sobre Qwen/Qwen3.6-35B-A3B. Lo desarrolla el usuario choyiny y esta pensado para tomar decisiones y clasificar opciones en lugar de generar texto libre largo: el modelo evalua alternativas, asigna probabilidades calibradas y devuelve una eleccion razonada. Su interes practico es que reduce el peso de 65 GB (bf16) a 34 GB, lo que permite servirlo en una sola GPU de 48 GB como una L40S o una RTX 6000 Ada, con mayor velocidad que la version bf16 en el mismo hardware.

Arquitectura MoE (mezcla de expertos) de 34.660.610.688 parametros totales, con atencion lineal en parte de sus capas, derivada de la familia Qwen3.6. La cuantizacion se ha realizado con llm-compressor en modo FP8_DYNAMIC: pesos FP8 por canal y activaciones FP8 dinamicas por token, sin datos de calibracion. El router MoE, la compuerta de expertos compartidos, las proyecciones de atencion lineal in_proj_a e in_proj_b y lm_head se mantienen en bf16.

Es relevante ahora porque propone un caso de uso distinto al del chatbot generico: decision making con calibracion explicita (ECE de 0,059 en DecideBench v2.0) y un formato de servicio orientado a logprobs, pensado para integrarse en pipelines que necesitan elegir entre opciones con una medida de confianza fiable, no solo generar texto plausible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal (base Qwen/Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.385 tokens en la configuracion de servicio recomendada (--max-model-len 16385); el maximo nativo del modelo base no se especifica |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos FP8 por canal, activaciones FP8 dinamicas por token); router MoE, compuerta de expertos compartidos, in_proj_a/in_proj_b y lm_head en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (requiere compressed-tensors>=0.15 para cargar con transformers) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint choyiny/yev2-35b-a3b, que a su vez parte de Qwen/Qwen3.6-35B-A3B. La arquitectura es de tipo mezcla de expertos con atencion lineal en determinadas capas, lo que explica la restriccion de servicio de vLLM: con --max-num-seqs 64 el estado de la atencion lineal cabe en memoria, mientras que el valor por defecto de 1.024 secuencias no lo permite. Los detalles de composicion del dataset de entrenamiento, numero de tokens y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada; la model card remite al repositorio principal del modelo base para esa informacion.

La innovacion tecnica de esta variante es la receta de cuantizacion: se aplica FP8_DYNAMIC con llm-compressor sin datos de calibracion, manteniendo en bf16 las partes sensibles a la precision (router, compuerta de expertos compartidos, proyecciones de atencion lineal y lm_head). El archivo calibration.json se hereda sin cambios del modelo principal. El resultado es un checkpoint de 34 GB frente a los 65 GB en bf16, con una perdida medida de 0,4 puntos de accuracy en DecideBench v2.0 (88,0 a 87,6) y de 1,3 puntos en JevBench publico (90,5 a 89,2). La model card indica que DecideBench v2.0 test nunca se inspecciono ni se uso para entrenamiento ni para seleccion de modelo.

## Capacidades

- Toma de decisiones y clasificacion: el modelo esta entrenado para elegir entre opciones y devolver una decision con probabilidad asociada, no para generacion abierta de texto largo.
- Calibracion de confianza: expone logprobs procesados (--logprobs-mode processed_logprobs --max-logprobs 26 en vLLM), lo que permite usar la probabilidad como senal de confianza; el ECE de 0,059 en DecideBench v2.0 respalda esta capacidad.
- Razonamiento con ejemplos resueltos: los benchmarks se han medido "with worked examples", es decir, con ejemplos de decision resueltos en el contexto.
- Modo conversacional: la model card etiqueta el modelo como conversational, por lo que admite formato de dialogo multi-turno.
- Servicio compatible con endpoints: la etiqueta endpoints_compatible indica que puede desplegarse tras una API compatible con el esquema de Hugging Face.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio, tool calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Enrutamiento y triaje de tickets: dado un ticket de soporte y un conjunto de colas o equipos candidatos, el modelo elige la cola correcta y devuelve la probabilidad de esa eleccion; el ECE bajo permite fijar umbrales de derivacion a revision humana cuando la confianza cae por debajo de un valor.
- Moderacion con decision binaria o multiclase: clasificar contenido en categorias de politica con una puntuacion calibrada, de modo que el sistema pueda aplicar sanciones automaticas solo en los casos de alta confianza.
- Seleccion de respuesta en pipelines RAG: recibir varias respuestas candidatas generadas por otro modelo y elegir la mejor con una probabilidad asociada, usando los logprobs para descartar respuestas cuando la confianza es baja.
- Evaluacion de decisiones de agentes: puntuar las acciones propuestas por un agente antes de ejecutarlas, aprovechando la calibracion para bloquear acciones dudosas; encaja con el throughput de 11,3 req/s medido con 4 peticiones en vuelo.
- Clasificacion de documentos en procesos internos: asignar documentos a categorias (facturas, contratos, reclamaciones) con decision y confianza, desplegando el modelo en una unica GPU de 48 GB en infraestructura propia.
- Investigacion sobre calibracion y decision making: usar el checkpoint FP8 como referencia reproducible de un modelo System One, con resultados publicados en DecideBench v2.0 y JevBench y una version bf16 equivalente para comparar el efecto de la cuantizacion.
- Servicio de bajo coste por decision: el modelo declara 78 USD por millon de decisiones en una RTX PRO 6000 Blackwell con vLLM limitado a 45 GiB, frente a 95 USD de la version bf16, lo que lo hace adecuado para volumen alto con presupuesto ajustado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | yev2-35b-a3b (bf16) | yev2-35b-a3b-fp8 |
|---|---:|---:|
| DecideBench v2.0 test (450 items), accuracy | 88,0 | 87,6 |
| DecideBench v2.0 test, pair accuracy | 78,2 | 77,3 |
| DecideBench v2.0 test, ECE (15 bins) | 0,058 | 0,059 |
| JevBench publico (231 items), accuracy | 90,5 | 89,2 |

El intervalo de confianza del 95 % para la accuracy FP8 en DecideBench v2.0 es 84,4-90,7.

Rendimiento medido en una NVIDIA RTX PRO 6000 Blackwell con vLLM 0.31.0, memoria limitada a 45 GiB (--gpu-memory-utilization 0.46) y 4 peticiones en vuelo:

| Modelo | p50 | p95 | Throughput | Coste por 1M de decisiones |
|---|---:|---:|---:|---:|
| yev2-35b-a3b-fp8 | 0,30 s | 0,54 s | 11,3 req/s | 78 USD |
| yev2-35b-a3b (bf16, 83 GiB) | 0,38 s | 0,72 s | 9,7 req/s | 95 USD |

El coste se calcula como tiempo de GPU en pared a 3,36 USD por hora (AWS g7e.2xlarge on-demand) dividido por el numero de decisiones.

## Requisitos de hardware

- VRAM estimada: 34 GB de pesos en FP8; con cache KV y margen de servicio, la model card apunta a una GPU de 48 GB como minimo practico.
- GPU recomendadas: L40S (48 GB), RTX 6000 Ada (48 GB), RTX PRO 6000 Blackwell (para las cifras de rendimiento publicadas). Se requiere soporte FP8, es decir, arquitecturas Ada, Hopper o Blackwell.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con esta cuantizacion; el modelo base en bf16 ocupa 65 GB y tampoco cabe.
- Despliegue: vLLM es la via documentada, con los parametros --max-model-len 16385, --enable-prefix-caching, --logprobs-mode processed_logprobs, --max-logprobs 26, --max-num-seqs 64, --gpu-memory-utilization 0.90 y --trust-remote-code. Tambien se ofrece el CLI yev serve con backend vLLM. Para cargar con transformers hace falta compressed-tensors>=0.15.
- Restriccion critica: --max-num-seqs 64 es obligatorio; el valor por defecto de vLLM (1.024 secuencias) no cabe en el estado de la atencion lineal.
- Latencia y throughput: p50 de 0,30 s, p95 de 0,54 s y 11,3 req/s con 4 peticiones en vuelo en RTX PRO 6000 Blackwell con vLLM limitado a 45 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yev2-35b-a3b-fp8 | 34,66 B (MoE) | 16.385 tokens en servicio | DecideBench v2.0: 87,6 accuracy, ECE 0,059 | apache-2.0 | Pesos FP8 en Hugging Face, 34 GB |
| yev2-35b-a3b (bf16) | 34,66 B (MoE) | no disponible | DecideBench v2.0: 88,0 accuracy, ECE 0,058; JevBench: 90,5 | apache-2.0 | Pesos bf16, 65 GB |
| Qwen/Qwen3.6-35B-A3B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo base sobre el que se construye yev2 |

No se dispone de datos de benchmarks de terceros ni de modelos comparables de la misma categoria (modelos de decision con calibracion) en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Contexto: la configuracion de servicio recomendada limita la ventana a 16.385 tokens, inferior a la de muchos modelos genericos actuales.
- Hardware: requiere GPU con soporte FP8 (Ada, Hopper o Blackwell); no es desplegable en GPUs de consumo de 24 GB.
- Restriccion de servicio: el limite de 64 secuencias concurrentes en vLLM condiciona el throughput maximo y exige ajustar la configuracion del servidor.
- Benchmarks no verificados: todos los resultados de DecideBench y JevBench estan declarados por el autor con verified: false; no hay evaluacion independiente.
- Ambito estrecho: el modelo esta orientado a decision y clasificacion; no se documentan capacidades de generacion larga, codigo, matematicas, vision ni tool calling, por lo que no debe asumirse que las tenga.
- Alucinacion y sesgos: no se publica informacion sobre sesgos conocidos ni sobre tasas de alucinacion en la informacion disponible; la calibracion medida (ECE 0,059) es una senal agregada y no garantiza calibracion en dominios distintos de DecideBench.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B, no detalladas en la informacion proporcionada.
- Repositorio muy reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/choyiny/yev2-35b-a3b-fp8
- Modelo base (bf16): https://huggingface.co/choyiny/yev2-35b-a3b
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de evaluacion: https://huggingface.co/datasets/choyiny/decidebench
- Repositorio del CLI y del servidor: https://github.com/xyspacedev/yev
