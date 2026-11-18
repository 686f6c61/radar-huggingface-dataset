# ahmadrrrtx/xrfm-native-85m

## Resumen

XRFM Native 85M Multilingual+Code es un modelo de lenguaje de pequena escala (86.446.464 parametros) desarrollado por el usuario ahmadrrrtx y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo entrenado integramente desde inicializacion aleatoria ("from scratch") sobre una arquitectura propia denominada XRFMModel, sin cargar pesos preentrenados de terceros. Forma parte de la "Track A — XRFM Native" del proyecto del autor, orientada a la investigacion arquitectonica y de representacion multilingue en pequena escala.

El modelo emplea una arquitectura transformer con Grouped Query Attention (GQA), RoPE con cache seguro en FP32, RMSNorm tambien en FP32 y activacion SwiGLU. Utiliza un tokenizador propio de tipo Byte-Level BPE con proteccion de scripts y un vocabulario de 32.768 tokens, disenado especificamente para manejar multiples alfabetos (latino, arabe, devanagari) y codigo. Cubre seis idiomas declarados: ingles, urdu, arabe, hindi, espanol y frances, ademas de roman-urdu (urdu en alfabeto latino) como dominio de evaluacion.

Su relevancia es fundamentalmente cientifica y educativa: el autor lo presenta explicitamente como un modelo de investigacion abierta sobre arquitectura y representaciones multilingues, no como un modelo de produccion. Con solo 160 pasos de entrenamiento y aproximadamente 10,5 millones de tokens vistos, sus capacidades generativas son muy limitadas; el propio autor recomienda usar la Track B (XRFM CoderSec 1.7B) para casos de uso reales. Su interes radica en la trazabilidad completa del entrenamiento (lineage disclosure), el curioso tokenizador multilingue y la publicacion de metricas BPB por idioma antes y despues del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA, RoPE (cache FP32-safe), RMSNorm (FP32-safe) y SwiGLU |
| Parametros totales | 86.446.464 (parametros atados, "tied parameters") |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors) |
| Idiomas soportados | en, ur, ar, hi, es, fr (mas roman-urdu / ur-Latn como dominio de evaluacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 32.768 tokens (Byte-Level BPE con proteccion de scripts, tokenizador "T4") |
| Tokens de entrenamiento | 10.485.760 (160 pasos) |
| Hardware de entrenamiento | Tesla T4 (VRAM pico 2.580,41 MB, 994,72 s) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only definida en PyTorch bajo el nombre XRFMModel, con atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE) con cache preparada para precision FP32, normalizacion RMSNorm tambien en FP32 y capa feed-forward con activacion SwiGLU. Los parametros estan atados (tied embeddings entre entrada y salida), lo que explica el recuento total de 86.446.464. El tokenizador es un Byte-Level BPE propio con vocabulario de 32.768 entradas y un diseno de "proteccion de scripts" orientado a preservar la integridad de alfabetos no latinos (arabe, devanagari) y del codigo.

El entrenamiento se realizo desde inicializacion aleatoria, sin cargar ningun peso preentrenado de terceros, sobre el dataset ahmadrrrtx/xrfm-native-shards-v1. El autor reporta 160 pasos y 10.485.760 tokens procesados en una Tesla T4, con un consumo pico de VRAM de 2.580,41 MB y un tiempo total de 994,72 segundos. Tambien documenta que la reanudacion exacta desde checkpoint con atomics CUDA presenta una diferencia de 0,0, lo que indica reproducibilidad bit a bit del estado de entrenamiento. No se menciona uso de RLHF, DPO ni tecnicas de alineacion; el modelo es un artefacto de preentrenamiento puro.

## Capacidades

- Generacion de texto autoregresiva basica, en fase de preentrenamiento muy temprana (160 pasos).
- Modelado de lenguaje multilingue en seis idiomas declarados: ingles, urdu, arabe, hindi, espanol y frances.
- Manejo de roman-urdu (urdu transliterado a alfabeto latino) como dominio de evaluacion explicito.
- Modelado de codigo fuente, con un dominio "code" evaluado en BPB.
- Tokenizacion robusta de multiples scripts gracias al BPE byte-level con proteccion de scripts.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad de instrucciones (no es un modelo instruct/chat).

## Casos de uso

- Investigacion arquitectonica comparada: sirve como linea base reproducible para estudiar el efecto de GQA, RoPE en FP32 y RMSNorm en FP32 en modelos de menos de 100M de parametros, ya que el autor publica la configuracion exacta y las metricas por dominio.
- Estudio de tokenizadores multilingues: permite analizar como un BPE byte-level de 32.768 tokens con proteccion de scripts afecta a la compresion (BPB) en arabe, hindi, urdu y roman-urdu frente a tokenizadores genericos.
- Docencia y formacion: su tamano (0,3 GB de repositorio) y su entrenamiento en una unica T4 lo convierten en un ejemplo practico de pipeline completo de preentrenamiento "from scratch" para cursos de IA.
- Experimentos de representacion multilingue: las metricas BPB por idioma antes y despues del entrenamiento permiten estudiar que dominios aprenden mas rapido con pocos pasos (el codigo y el ingles muestran las mayores reducciones de BPB).
- Pruebas de infraestructura de entrenamiento: el checkpoint con reanudacion exacta (diff 0.0) lo hace util para validar sistemas de checkpointing y reproducibilidad en clusters pequenos.
- Base para fine-tuning experimental: al estar bajo Apache 2.0 y en safetensors, puede usarse como punto de partida para experimentos de adaptacion en dominios muy acotados, siempre asumiendo su escasisima capacidad generativa.
- Evaluacion de sesgos y comportamiento de modelos pequenos: util para estudiar como se distribuye la probabilidad entre idiomas y scripts en un modelo no alineado.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Publica unicamente metricas de Bits-Per-Byte (BPB) en validacion, comparando inicializacion aleatoria (paso 0) con el modelo entrenado (paso 160). Menos es mejor.

| Dominio | Paso 0 (init aleatoria) | Paso 160 (entrenado) | Delta BPB |
|---|---:|---:|---:|
| en | 3,4799 | 2,2930 | -1,1869 |
| code | 4,0077 | 2,1978 | -1,8099 |
| ur | 2,6492 | 1,8611 | -0,7881 |
| ur-Latn | 3,7126 | 2,3555 | -1,3571 |
| ar | 2,6961 | 1,9244 | -0,7717 |
| hi | 1,8626 | 1,2443 | -0,6183 |
| es | 4,0712 | 2,7739 | -1,2973 |
| fr | 4,0820 | 2,8644 | -1,2176 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (86,4M de parametros x 4 bytes ≈ 346 MB de pesos, mas overhead de activaciones y cache KV), y del orden de 100-200 MB en cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el propio entrenamiento se realizo en una Tesla T4 con 2.580 MB de VRAM pico, por lo que una GTX 1650, RTX 3050, RTX 4060 o superior es mas que suficiente.
- Cabe en cualquier GPU consumer e incluso en CPU para inferencia interactiva con llama.cpp u Ollama, dado el reducido tamano.
- Opciones de despliegue: transformers (PyTorch), llama.cpp y Ollama (previa conversion a GGUF), vLLM y TGI (compatibles con safetensors, aunque el rendimiento en modelos tan pequenos esta dominado por overhead). El modelo requiere la implementacion de la arquitectura XRFMModel del autor, no es un Llama/Mistral estandar, por lo que la conversion a GGUF puede requerir trabajo adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada. A modo orientativo, un modelo de este tamano en una GPU moderna produce decenas de miles de tokens por segundo en batch, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| XRFM Native 85M | 86,4M | No disponible | en, ur, ar, hi, es, fr, ur-Latn | Apache 2.0 | Investigacion, 160 pasos |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 tokens | Principalmente ingles | Apache 2.0 | Preentrenado a gran escala |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Multilingue amplio | Apache 2.0 | Preentrenado e instruct |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Principalmente ingles | Apache 2.0 | Preentrenado a gran escala |

La comparativa debe interpretarse con cautela: XRFM Native 85M solo ha visto 10,5 millones de tokens, mientras que los modelos de referencia han visto billones. No es un competidor en calidad generativa; su valor es la transparencia del linaje, el tokenizador multilingue especifico y las metricas BPB publicadas por dominio. Los datos de los modelos comparables proceden de conocimiento general y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Capacidad generativa muy limitada: 160 pasos y 10,5 millones de tokens son ordenes de magnitud inferiores a lo necesario para producir texto coherente; las salidas seran en gran medida incoherentes.
- No es un modelo de instrucciones ni de chat: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta para produccion.
- Riesgo elevado de alucinacion y de degeneracion en generaciones largas, inherente a un modelo de este tamano y nivel de entrenamiento.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos, toxicidad ni seguridad.
- Cobertura idiomatica desigual: las metricas BPB muestran diferencias notables entre idiomas (hindi parte de una BPB mucho mas baja que espanol o frances), lo que sugiere un comportamiento muy heterogeneo segun el script y el dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja explicitamente su uso en produccion y remite a la Track B (XRFM CoderSec 1.7B) para asistentes de codigo y seguridad.
- Dependencia de codigo propietario: la arquitectura XRFMModel no es estandar, por lo que la carga requiere el codigo del autor; la conversion a otros formatos (GGUF, etc.) puede no estar soportada directamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmadrrrtx/xrfm-native-85m
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmadrrrtx/xrfm-native-shards-v1
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
