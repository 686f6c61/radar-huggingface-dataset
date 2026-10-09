# ndaly/MiMo-V2.6-Distill-Qwen-9B-tt-p150

# MiMo-V2.6-Distill-Qwen-9B-tt-p150

## Resumen

MiMo-V2.6-Distill-Qwen-9B-tt-p150 es un paquete de despliegue publicado por el usuario ndaly (repo `ndaly/MiMo-V2.6-Distill-Qwen-9B-tt-p150`) que porta el modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, de Xiaomi, al acelerador Tenstorrent Blackhole P150. El modelo base es un modelo de razonamiento de 9.000 millones de parametros con arquitectura hibrida que combina 24 capas de atencion lineal (Gated DeltaNet) y 8 capas de atencion completa (32 capas en total), destilado a partir de MiMo-V2.6, y con una ventana de contexto de 262.144 tokens.

El repositorio no contiene los pesos: empaqueta una imagen Docker y un catalogo de modelo gestionado con tt-model-manager 0.1.0 (manifest schema 5.1) que sirve el modelo a traves de vLLM (v0.29.0) y el plugin vllm-tt-plugin sobre una unica tarjeta P150. El peso del repositorio (2,0 GB) corresponde al contenedor y al codigo, no al checkpoint, que se descarga por separado desde HuggingFace en el commit `2367e865d009c13ac81713a2878291d33ab28177`.

Es relevante ahora porque demuestra el despliegue de un modelo de razonamiento de 9B con contexto de 262.144 tokens sobre silicio no-NVIDIA (Tenstorrent), usando cuantizacion agresiva (bfp4 en proyecciones, bfp8 en cache KV y LM head) y perfiles de servicio para uno o 32 usuarios concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas de atencion lineal Gated DeltaNet + 8 capas de atencion completa (32 capas en total) |
| Parametros totales | 9.000 millones (segun denominacion del modelo) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Politica `optimized_all_bfp4_lofi`: proyecciones bfp4, LoFi, cache KV bfp8, LM head bfp8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible para el port; los pesos base se descargan desde `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` y el despliegue se realiza mediante imagen Docker |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer hibrida en la que la mayoria de las capas (24 de 32) usan atencion lineal basada en Gated DeltaNet, mientras que 8 capas mantienen atencion completa. Esta combinacion busca reducir el coste computacional y de memoria del prefill en secuencias muy largas sin renunciar por completo al modelado global de dependencias, lo que permite sostener una ventana de 262.144 tokens. El modelo se presenta como un `distill` de MiMo-V2.6, es decir, derivado por destilacion del modelo mayor de Xiaomi.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detalla si hubo una fase de razonamiento explicita (thinking) en el entrenamiento, aunque el comportamiento validado indica que el modelo emite razonamiento nativo que el parser `mimo` separa en un campo `reasoning` distinto del campo de respuesta.

En cuanto al port a Tenstorrent, destaca el uso de autoport generado sobre tt-metal y la politica de precision `optimized_all_bfp4_lofi`, que combina proyecciones en bfp4, cache KV y LM head en bfp8, ademas de LoFi. Esta politica es la que hace viable ejecutar el modelo con 262.144 tokens de contexto en una sola P150, a costa de una perdida de precision que no se cuantifica en la informacion disponible.

## Capacidades

- Razonamiento paso a paso con modo de pensamiento nativo (`native thinking`), con el razonamiento devuelto en un campo `reasoning` separado mediante el parser `mimo` incluido en el contenedor.
- Resolucion de problemas matematicos: en el subconjunto congelado ci-v1 alcanza 79,3 % de coincidencia estricta en GSM8K-CoT (85,2 % con extraccion flexible).
- Seguimiento de instrucciones: 65,2 % prompt-strict y 74,3 % instruction-strict en IFEval sobre el subconjunto ci-v1.
- Procesamiento de contexto muy largo: ventana nativa de 262.144 tokens validada a plena longitud en la P150.
- Generacion de texto y respuesta conversacional multi-turno a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Servicio concurrente de hasta 32 peticiones simultaneas mediante el perfil `batch32`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente mas alla del razonamiento paso a paso.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Asistente de razonamiento matematico paso a paso: el modelo esta validado en GSM8K-CoT con pensamiento nativo y devuelve la cadena de razonamiento en un campo separado, lo que permite mostrar el proceso al usuario y auditar la respuesta. Adecuado para herramientas de tutoria o resolucion de problemas cuantitativos.
- Analisis de documentos extensos: con 262.144 tokens de contexto validados a plena longitud, se puede ingerir un contrato, expediente o informe completo sin troceado ni recuperacion previa, reduciendo la perdida de informacion entre fragmentos.
- RAG sobre corpus grandes con contexto largo: en lugar de recuperar pasajes cortos, se puede inyectar un conjunto amplio de documentos y dejar que el modelo razone sobre ellos, simplificando la arquitectura del pipeline.
- Servicio interno multi-usuario: el perfil `batch32` esta pensado para hasta 32 usuarios concurrentes sobre una sola P150, lo que encaja en un asistente interno de empresa con carga moderada y sin necesidad de GPU NVIDIA.
- Despliegue on-premise con soberania de datos: al ejecutarse sobre aceleradores Tenstorrent y con pesos descargados localmente, es apto para entornos que requieren que los datos no salgan de la infraestructura propia.
- Evaluacion de instrucciones complejas: con un 74,3 % de instruction-strict en IFEval, sirve para tareas de transformacion de texto guiadas por instrucciones detalladas (reformateo, extraccion estructurada, resumen con restricciones).
- Analisis de trazas o codigo extenso: la ventana de 262.144 tokens permite cargar ficheros de log o ficheros de codigo largos para tareas de revision o diagnostico con razonamiento explicito (sin datos de benchmark especificos de codigo en la informacion disponible).

## Benchmarks y rendimiento

Resultados de la validacion stage 11 (2026-10-09, una P150), sobre subconjuntos congelados ci-v1, a concurrencia 32, con la politica de muestreo del checkpoint (temperatura 0,6 / top-p 0,95 / top-k 20), pensamiento nativo y presupuesto de 4096 tokens:

| Benchmark | Metrica | Resultado |
|---|---|---|
| GSM8K-CoT | strict-match | 79,3 % (256 de 1319) |
| GSM8K-CoT | flexible-extract | 85,2 % |
| IFEval | prompt-strict | 65,2 % (256 de 541) |
| IFEval | instruction-strict | 74,3 % |

Rendimiento de servicio (4096 tokens de entrada / 128 de salida):

| Escenario | TTFT | TPOT | Throughput |
|---|---|---|---|
| Un usuario (perfil `single`) | 461 ms | 22,3 ms | 44,9 tok/s por usuario |
| 32 usuarios (perfil `batch32`) | 14,9 s | 76,6 ms | 166 tok/s de salida agregados |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Acelerador: una unica tarjeta Tenstorrent Blackhole P150 (perfiles `batch32` y `single`, malla P150).
- VRAM estimada: no disponible; la cuantizacion bfp4 en proyecciones y bfp8 en cache KV y LM head es la que permite servir 262.144 tokens de contexto en una sola P150.
- GPU consumer (RTX 4090, etc.): no aplica; el despliegue esta construido para Tenstorrent, no para CUDA.
- GPU de centro de datos (A100, H100): no aplica a este paquete concreto; el modelo base en formato original si esta publicado en HuggingFace, pero sin datos de despliegue en la informacion proporcionada.
- Opciones de despliegue: `tt-model pull --with-weights` y `tt-model serve` (tt-model-manager 0.1.0), con vLLM v0.29.0 y vllm-tt-plugin sobre tt-metal. Servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre).
- Tiempos de arranque: primera carga de pesos aproximadamente 3 minutos; compilacion de kernels y captura de trazas de decodificacion aproximadamente 1 minuto. Los arranques posteriores reutilizan la cache de kernels.
- Latencia y throughput: ver tabla de la seccion anterior. Se observa que el TTFT a 32 usuarios (14,9 s) corresponde a una oleada completa de prefills secuenciales, lo que penaliza fuertemente el arranque bajo carga alta.

## Comparativa con modelos similares

No hay datos de benchmarks de modelos comparables en la informacion disponible, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia de disponibilidad se incluye el modelo base:

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-tt-p150 (este repo) | 9B | 262.144 | Imagen Docker + tt-model, vLLM sobre Tenstorrent P150 | No disponible | Repo HuggingFace, 0 descargas |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (modelo base) | 9B | 262.144 | Pesos originales en HuggingFace | No disponible | Repo HuggingFace de Xiaomi |
| Otros modelos de razonamiento de ~9B con contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ingles, ya que los benchmarks presentados (GSM8K, IFEval) son en ingles.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calibracion; los resultados de GSM8K-CoT muestran un 79,3 % strict-match, lo que implica que aproximadamente una de cada cinco respuestas matematicas no es correcta en ese conjunto.
- Benchmarks sobre subconjuntos parciales: GSM8K-CoT se evaluo sobre 256 de 1319 ejemplos e IFEval sobre 256 de 541, por lo que la varianza de las cifras puede ser apreciable.
- Perdida de precision por cuantizacion: la politica `optimized_all_bfp4_lofi` usa bfp4 en proyecciones, un formato de muy baja precision; no se ha publicado la degradacion respecto al modelo en bf16.
- Penalizacion de latencia bajo carga: con 32 usuarios concurrentes el TTFT sube a 14,9 s por una oleada secuencial de prefills, lo que limita su uso interactivo a alta concurrencia.
- Dependencia de hardware especifico: requiere una tarjeta Tenstorrent Blackhole P150; no es portable a CUDA ni a CPU.
- Reproducibilidad limitada: el port se construyo desde un checkout local de tt-metal cuyo commit no se publico, por lo que no se garantiza la reconstruccion exacta del entorno.
- Madurez del paquete: el repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Errata en la model card: la descripcion indica "runs on p150 or p150", lo que sugiere que la tabla de perfiles puede estar incompleta o contener un error de publicacion.
- Formato de pesos no especificado: no se indica si el checkpoint base descargado se almacena en safetensors u otro formato.

## Enlaces

- Repo del port en HuggingFace: https://huggingface.co/ndaly/MiMo-V2.6-Distill-Qwen-9B-tt-p150
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (commit `2367e865d009c13ac81713a2878291d33ab28177`)
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- vLLM v0.29.0: https://github.com/vllm-project/vllm/releases/tag/v0.29.0
- vllm-tt-plugin (commit `77fcb6e4a16be794cbe05748492cf1c51150db7e`): https://github.com/tenstorrent/vllm-tt-plugin/commit/77fcb6e4a16be794cbe05748492cf1c51150db7e
