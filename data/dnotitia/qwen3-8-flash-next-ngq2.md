# dnotitia/Qwen3.8-Flash-Next-NGQ2

## Resumen

Qwen3.8-Flash-Next-NGQ2 es un checkpoint cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por dnotitia. No se trata de una cuantizacion completa del modelo: el backbone (todas las tensiones excepto la tabla de embeddings n-gram) se copia byte a byte en bf16 sin modificar, y unicamente se sustituye la tabla de embeddings PLE (n-gram embedding) por su forma empaquetada a 2 bits segun el metodo NGQ2. La tabla original ocupa 102,4 GB (16 bits por valor) y la version cuantizada 13,4 GB (2,10 bits por valor), lo que reduce el checkpoint total de 360,0 GB a 271,0 GB.

El modelo base es un transformer de tipo `qwen4_exp` con 141.919.799.699 parametros totales, del que no se dispone de informacion detallada sobre contexto, datos de entrenamiento o idiomas en la documentacion proporcionada. La tabla n-gram contiene 51,2B parametros (320M filas x 160 dimensiones) y se usa como memoria de lookup: cada fila se decodifica de forma independiente al hacer la busqueda.

La relevancia de esta publicacion es metodologica: demuestra que es posible cuantizar a 2 bits una tabla de embeddings de gran tamano sin perdida de fidelidad en los logits (la decodificacion es bit-identica a la tabla evaluada) y con una mejora practica en el despliegue, ya que en 4 x H200 con TP4 el peso por GPU baja de 84,6 a 63,9 GiB y la cache KV pasa de 2,03M a 3,15M tokens (+55%) con un TPOT dentro del 2,2%. El metodo se describe en el paper arXiv:2610.21810.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen4_exp` (clase `Qwen4ExpForConditionalGeneration` de transformers) con tabla de embeddings n-gram PLE cuantizada |
| Parametros totales | 141.919.799.699 (141,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la cache KV medida en el despliegue de referencia alcanza 3,15M tokens con 4 x H200) |
| Tipos de cuantizacion | NGQ2 a 2 bits (2,10 bits por valor) solo para la tabla n-gram; backbone en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors, con codigo custom (`modeling_ngq2.py`, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `qwen4_exp`, un transformer con mezcla de expertos segun los tags del repositorio y el uso de `experts_implementation="grouped_mm"` en la configuracion de referencia. Incluye un modulo PLE (probablemente "parametric lookup embedding" o similar) con una tabla de embeddings n-gram de 320.001.536 filas x 160 dimensiones, direccionada por hash. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de este checkpoint es el metodo NGQ2, que aplica un codigo trellis uniforme de 2 bits a cada fila de la tabla y restaura la norma L2 de cada fila con una ganancia bf16. El codigo usa el trellis bitshift de QTIP (Tseng et al., 2024) con L = 16 bits de estado, 4 bits por par de valores, codebook "HYB" (`quantlut_sym`) con tabla base de 512x2 y tail-biting. Cada fila de 160 dimensiones se codifica como una secuencia trellis de 80 pasos (40 bytes), de modo que cada fila se decodifica de forma independiente (granularidad de fila). La restauracion de norma anade 16 bits por fila de 160 dimensiones (+0,10 bpp). El metodo no usa rotacion, ni Hessiano, ni datos de calibracion, ni fine-tuning (es data-free) y emplea tasa uniforme. El hash y el direccionamiento no se modifican: la fila empaquetada r sustituye a la fila r de `ple.ple_embedding.ngram_embedding`. Las 90 ultimas filas son de padding y el hash nunca las direcciona.

El codigo de inferencia requiere `transformers>=5.8` (probado con 5.17) y sustituye el `nn.Embedding` de 102 GB por un `ngq.PackedTable` que decodifica filas al hacer lookup, de modo que la tabla completa nunca se asigna en memoria. El parametro `table_device` permite colocar los bytes empaquetados en GPU (`"gpu"`, por defecto), en DRAM del host (`"cpu"`) o en NVMe local (`"disk"`, con `disk_dir` y lectura O_DIRECT mediante `native/rowread.c`, requiere Linux y gcc).

## Capacidades

- Generacion de texto y conversacion multi-turno mediante `apply_chat_template`, con soporte de `enable_thinking` para activar o desactivar modo de razonamiento.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que indica capacidad multimodal de entrada.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Memoria n-gram por lookup: la tabla PLE actua como memoria de recuperacion de secuencias n-gram, con decodificacion por fila independiente.
- Modo de decodificacion determinista: el ejemplo oficial usa `do_sample=False`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en Inference Endpoints.

## Casos de uso

- Despliegue de un modelo de 141,9B en infraestructura limitada: la reduccion de la tabla de 102,4 GB a 13,4 GB permite servir el checkpoint en 4 x H200 con TP4, con 63,9 GiB de pesos por GPU frente a 84,6 GiB del original, lo que hace viable el despliegue en nodos de 8 GPU con margen para cache KV.
- Ampliacion de la ventana efectiva de contexto en produccion: la misma configuracion de 4 x H200 pasa de 2,03M a 3,15M tokens de cache KV (+55%), lo que permite atender conversaciones o documentos mas largos sin cambiar de hardware.
- Servicio de generacion de texto conversacional: el modelo acepta plantillas de chat con `add_generation_prompt` y modo thinking desactivable, adecuado para asistentes multi-turno con contexto largo.
- Inferencia con la tabla en DRAM del host: con `table_device="cpu"` solo las filas consultadas se transfieren a la GPU, lo que reduce la VRAM necesaria y permite reservar HBM para pesos y cache KV en entornos con CPU y memoria abundantes.
- Inferencia con la tabla en NVMe: con `table_device="disk"` y lectura O_DIRECT, el checkpoint puede servirse desde almacenamiento local, util en nodos con poca HBM o DRAM y disco NVMe rapido.
- Procesamiento de imagenes y texto: por su pipeline `image-text-to-text`, puede usarse en tareas que combinen entrada visual y textual, como descripcion de imagenes o respuesta a preguntas sobre documentos escaneados.
- Investigacion sobre cuantizacion de tablas de embeddings: el checkpoint y el codigo `ngq.py` permiten reproducir la decodificacion bit-identica y comparar el metodo NGQ2 con otras estrategias de cuantizacion de lookup tables.
- Evaluacion de fidelidad de cuantizacion: al ser los logits bit-identicos a la tabla evaluada, sirve como referencia para validar implementaciones de trellis quantization en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son de despliegue:

| Metrica | Original (bf16) | NGQ2 |
|---|---|---|
| Tamano del checkpoint | 360,0 GB | 271,0 GB |
| Tabla n-gram | 102,4 GB (16 bpp) | 13,4 GB (2,10 bpp) |
| Peso por GPU (4 x H200, TP4) | 84,6 GiB | 63,9 GiB |
| Cache KV | 2,03M tokens | 3,15M tokens (+55%) |
| TPOT | referencia | dentro del 2,2% (una ejecucion cada uno) |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo ocupa 271,0 GB; con TP4 en 4 x H200 el peso por GPU es de 63,9 GiB, a lo que hay que sumar la cache KV. La tabla empaquetada son 13,4 GB y puede residir en GPU, CPU o disco.
- GPU recomendadas: 4 x H200 con TP4 es la configuracion validada por el autor. No se dispone de datos para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPU de consumo; el backbone por si solo ocupa 257,6 GB en bf16.
- Opciones de despliegue: vLLM mediante el PR #66576 (en revision al momento de la publicacion), con la tabla en GPU. Tambien es posible la carga con `transformers>=5.8` y `trust_remote_code=True`, o mediante el helper `ngq.load()` del propio repositorio.
- Latencia y throughput: TPOT dentro del 2,2% respecto al modelo original en la configuracion de 4 x H200 con TP4 (una ejecucion cada uno). No se proporcionan valores absolutos de latencia ni de tokens por segundo.
- Almacenamiento: 271,0 GB para el checkpoint; en modo `disk` se genera un fichero de registros de 13,4 GB alineado a pagina en NVMe local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NGQ2 (este) | 141,9B | no disponible | NGQ2 2-bit en tabla n-gram; backbone bf16 | qwen-community-1.0 | Hugging Face, 31 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 141,9B | no disponible | bf16 | qwen-community-1.0 | Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (mismo tamano o misma tarea) en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia es qwen-community-1.0, no una licencia permisiva tipo Apache o MIT; es necesario revisar el fichero LICENSE del repositorio antes de un uso comercial.
- La carga requiere obligatoriamente `trust_remote_code=True`. Sin el, transformers usa su clase integrada, que no tiene los pesos de la tabla n-gram, y la tabla queda sin inicializar: transformers solo emite un aviso por pesos `ngram_embedding` ausentes.
- Aparece un mensaje esperado en el log: `Unknown quantization type, got ngq2 ... we will skip the quantization`. El cargador generico no reconoce `ngq2`; es `modeling_ngq2.py` quien adjunta la tabla empaquetada.
- El soporte en vLLM depende del PR #66576, que estaba en revision en el momento de la publicacion; no es una ruta estable de produccion.
- El modo `disk` requiere Linux, gcc y compilar `native/rowread.c`; ademas, el fichero de registros de 13,4 GB debe construirse una vez.
- No hay informacion publicada sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni evaluacion de calidad del modelo base en la documentacion proporcionada.
- Las metricas de rendimiento del despliegue provienen de una unica ejecucion por configuracion, por lo que la variabilidad no esta caracterizada.
- El checkpoint sigue ocupando 271,0 GB, por lo que no es apto para entornos con almacenamiento o memoria limitados.
- Las 90 ultimas filas de la tabla son de padding y el hash nunca las direcciona; no deben interpretarse como embeddings validos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnotitia/Qwen3.8-Flash-Next-NGQ2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper: https://arxiv.org/abs/2610.21810
- Paper en Hugging Face: https://huggingface.co/papers/2610.21810
- PR de vLLM: https://github.com/vllm-project/vllm/pull/66576
