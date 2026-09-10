# OpensourceWTF/DeepSeek-V4.1-Flash-MTPLX-streaming-q2

## Resumen

DeepSeek-V4.1-Flash MTPLX-streaming Q2 es una redistribucion cuantizada del checkpoint deepseek-ai/DeepSeek-V4.1-Flash, publicada por el usuario OpensourceWTF bajo licencia MIT. El modelo base es un MoE multimodal de 552.000 millones de parametros en el backbone, con 384 expertos enrutados y seleccion top-6 por capa, y una ventana de contexto de hasta un millon de tokens. Esta version concreta reduce los expertos enrutados a cuantizacion affine de 2 bits (grupo 64, 2,5 bits por peso) y mantiene el resto de tensores en 8 bits o en precision original, con el objetivo de poder servir el modelo en Apple Silicon mediante paginacion desde SSD.

La particularidad del repositorio es su formato de pesos: los expertos enrutados no viven en safetensors, sino en `experts.bin`, un banco binario plano de 158,2 GiB con registros de tamano fijo alineados a 16 KiB, que el runtime MTPLX pagina desde el SSD a una cache de GPU acotada con politica LRU. Las tablas Engram (memoria condicional por n-gramas) siguen el mismo esquema a nivel de fila en `engram/engram-L1.bin` y `engram/engram-L14.bin`, con 194,6 GiB. El resultado es un repositorio de unos 404 GB que puede ejecutarse en Macs que no pueden mantener el modelo residente en memoria.

Es relevante ahora porque explora una via poco habitual para modelos de escala frontera: cuantizacion agresiva de la parte MoE combinada con streaming desde disco, en lugar de reducir el modelo o delegar en un cluster de GPU. Conviene senalar que el backend `deepseek_v41` del runtime MTPLX sigue en desarrollo, por lo que este repositorio es, por el momento, una publicacion de pesos sin runtime funcional, y que no se ha ejecutado ninguna evaluacion de tareas sobre los expertos de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) de 40 capas organizado como 20 capas de encoder causal mas 20 capas de decoder, con capas MoE |
| Parametros totales | 552.000 millones en el backbone del modelo base; los safetensors de este repo declaran 22.695.013.074 parametros correspondientes a los tensores residentes |
| Parametros activos | no disponible (enrutamiento top-6 sobre 384 expertos enrutados por capa) |
| Longitud de contexto | hasta 1.000.000 tokens |
| Tipos de cuantizacion | affine 2-bit grupo 64 (2,5 bpw) en expertos enrutados; affine 8-bit grupo 64 en attention, indexer, compressor, shared experts, embed, head y tablas Engram; affine 8-bit grupo 32 en expertos MTP de DSpark; bf16/f32 verbatim en routers, norms, vectores de hyper-connection, attention sinks y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (49 shards de tensores residentes) mas `experts.bin` (banco binario plano, registros de 11.059.200 bytes) mas `engram/*.bin` mas manifiestos JSON (`expert-manifest.json`, `engram-manifest.json`, `conversion-manifest.json`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Causal Encoder-Decoder (CED): un transformer de 40 capas dividido en 20 capas de encoder causal seguidas de 20 capas de decoder. Sobre esa columna se anaden capas de mezcla de expertos con 384 expertos enrutados y seleccion top-6 por token y capa, un modulo de prediccion multi-token (MTP) denominado DSpark con 3 capas y 128 expertos, y tablas Engram de memoria condicional por n-gramas situadas en las capas 1 y 14. El modelo es multimodal: procesa imagenes y texto de forma nativa y genera texto de forma autorregresiva, con torre de vision y aligner incluidos.

Esta redistribucion no reentrena nada: parte de la revision `dba1be0a40aa45a94ad051997016db3960a90277` de `deepseek-ai/DeepSeek-V4.1-Flash` y recuantiza. El checkpoint original almacena los expertos enrutados en FP4 (E2M1) y los pesos densos en FP8 (E4M3) con escalas por bloque; como los modos `mxfp4`/`mxfp8` de MLX no repackean esos formatos de forma bit-exacta (recalculan las escalas de grupo), la conversion pasa a cuantizacion affine nativa de MLX con la ruta acelerada `QuantizedLinear`/`gather_qmm`. La dequantizacion replicada es la de `inference/convert.py` de DeepSeek. Los expertos enrutados son el unico paso con perdida apreciable: cosine aproximado de 0,91 frente al origen. El resto de tensores queda en cosine mayor o igual a 0,9997 (error relativo en torno al 0,5 %) y las tablas Engram en cosine mayor o igual a 0,99994 sobre 2.005 filas muestreadas por tabla. Routers, norms, vectores de hyper-connection, attention sinks y vision se conservan exactos. La conversion se hizo en CPU con mlx 0.32.0 y cada registro de experto y cada shard queda fijado con sha256 en los manifiestos.

## Capacidades

- Generacion de texto autorregresiva a partir de entradas de texto e imagen, con contextos de hasta 1.000.000 tokens.
- Enrutamiento MoE top-6 sobre 384 expertos por capa, con los expertos servidos por paginacion desde SSD.
- Memoria condicional por n-gramas mediante tablas Engram en las capas 1 y 14.
- Decodificacion especulativa prevista via el modulo DSpark MTP (3 capas, 128 expertos), dependiente del runtime MTPLX.
- Entrada multimodal: torre de vision y aligner incluidos en 8 bits en el repositorio.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).

## Casos de uso

- Servicio de texto de contexto muy largo en una estacion de trabajo Apple Silicon: el modelo admite entradas de hasta un millon de tokens y el runtime esta disenado para paginar expertos desde SSD, de modo que un Mac sin memoria suficiente para el modelo completo puede atender peticiones leyendo solo los seis expertos que selecciona cada token y capa.
- Analisis de repositorios de codigo o documentacion legal extensa: la ventana de un millon de tokens permite cargar arboles de codigo o expedientes completos sin fragmentacion, y las tablas Engram aportan recuperacion de coincidencias por n-gramas dentro del propio modelo.
- Despliegue en entornos sin cluster de GPU: al estar empaquetado para MLX y Apple Silicon, encaja en flujos donde no hay acceso a A100/H100 y se prefiere hardware local con SSD rapido.
- Investigacion en cuantizacion extrema: el repositorio documenta cosine por componente (0,91 en expertos enrutados de 2 bits frente a 0,9997 o superior en el resto) y fija hashes por registro, lo que lo convierte en material util para estudiar el impacto de bajar la parte MoE a 2,5 bpw.
- Procesamiento por lotes desconectado (air-gapped): con licencia MIT y pesos descargables en local, puede usarse para generacion de texto sobre corpus sensibles sin salida a red.
- Prototipado de decodificacion especulativa: cuando el backend `deepseek_v41` de MTPLX incorpore DSpark, el repositorio servira para medir ganancias de la prediccion multi-token en un modelo MoE de gran escala.
- Analisis de imagenes con salida de texto: la torre de vision esta incluida en 8 bits, aunque el runtime de streaming apunta por ahora solo a texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las tablas de benchmarks que acompana corresponden a los numeros publicados por DeepSeek para el checkpoint de origen, no a esta cuantizacion, y que no se ha ejecutado ninguna evaluacion de tareas sobre los expertos de 2 bits. Las unicas metricas de fidelidad facilitadas son los cosenos por componente frente al checkpoint original: aproximadamente 0,91 en expertos enrutados (2 bits, grupo 64), mayor o igual a 0,9997 en attention, indexer, compressor, shared experts, embed, head y MTP denso (8 bits), 0,99999 en expertos MTP de DSpark y mayor o igual a 0,99994 en las tablas Engram.

## Requisitos de hardware

- Repositorio completo: aproximadamente 404 GB en disco (376 GiB de contenido), con `experts.bin` (158,2 GiB), `engram/*.bin` (194,6 GiB) y safetensors residentes (23,4 GiB).
- Memoria unificada: los tensores residentes suman 23,4 GiB, de los cuales 9,2 GiB corresponden al backbone denso (q8 gs64) y 14,2 GiB a los expertos MTP de DSpark (q8 gs32). A eso se anade el envelope de cache de expertos configurable del runtime.
- GPU compatible: Apple Silicon con backend Metal, que es el objetivo del empaquetado MLX. No se documenta soporte para A100, H100 ni RTX 4090 en esta publicacion.
- Caben en GPU de consumo: no aplica en el sentido habitual; el modelo completo no cabe en VRAM de consumo (552.000 millones de parametros en el origen), y la propuesta es precisamente no mantenerlo residente y paginar expertos desde SSD.
- Almacenamiento: SSD con ancho de banda alto, dado que el runtime lee los registros de expertos directamente desde disco a slots de Metal fijados.
- Opciones de despliegue: runtime MTPLX-STREAMING (backend `deepseek_v41`, en desarrollo) sobre MLX. llama.cpp no esta soportado, ya que la cuantizacion affine de MLX no se convierte a bloques GGML en ninguna direccion. vLLM, Ollama y TGI: no disponibles para este formato.
- Latencia y throughput: no disponibles. Dependen del backend MTPLX, que aun no ha publicado su implementacion del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash MTPLX-streaming Q2 (este repo) | 552.000 millones en el backbone; 22.695.013.074 en safetensors residentes | 1.000.000 tokens | Expertos enrutados affine 2-bit gs64; resto 8-bit o precision original | safetensors + binarios planos paginados | MIT | Pesos publicados; runtime MTPLX en desarrollo |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | 552.000 millones | 1.000.000 tokens | Expertos enrutados FP4 (E2M1); densos FP8 (E4M3) con escalas por bloque | safetensors | MIT (segun `LICENSE` enlazado en la model card) | Publicado por DeepSeek |

No se dispone de informacion sobre otros modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de tareas sobre los expertos cuantizados a 2 bits; la propia model card anticipa un coste de calidad y solo aporta cosenos por tensor como evidencia.
- El paso de cuantizacion con perdida afecta a los expertos enrutados, que son la mayor parte de la capacidad del modelo; el cosine de 0,91 es la cifra mas baja documentada.
- El runtime no esta terminado: el backend `deepseek_v41` de MTPLX (proyeccion KV de encoder-decoder causal, modos de atencion dispersa CSA2, indexer jerarquico, lookup Engram y decodificacion especulativa DSpark) sigue en desarrollo, por lo que el repositorio es una publicacion solo de pesos.
- El rendimiento dependera del ancho de banda del SSD y del envelope de memoria configurado para la cache LRU de expertos, ambos factores externos al modelo.
- No hay soporte para llama.cpp ni conversion a GGML, lo que limita las opciones de despliegue fuera del ecosistema MLX.
- El campo de idiomas no esta informado, por lo que no se puede confirmar cobertura multilingue.
- La torre de vision y el aligner se incluyen en 8 bits, pero el runtime de streaming apunta unicamente a servicio de texto.
- Estan sin documentar el soporte de tool calling, el uso en agentes y las capacidades de razonamiento multi-paso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no procede de la organizacion DeepSeek sino de un tercero (`OpensourceWTF`); conviene verificar los manifiestos sha256 antes de usarlo en produccion.
- Aunque la licencia declarada es MIT y enlaza al `LICENSE` del modelo base, la model card del autor no aclara condiciones adicionales derivadas de la redistribucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-MTPLX-streaming-q2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/LICENSE
- Runtime MTPLX-STREAMING: https://github.com/OpenSourceWTF/MTPLX-STREAMING
- No se han encontrado otros enlaces relevantes en los resultados de la busqueda web proporcionados.
