# cmeister/boundary-markers-en-d12-plain-mingram

## Resumen

Boundary markers, English, 12 layers: `plain` tokenizer, MinGram training es un conjunto de tres modelos de lenguaje (semillas 0, 1 y 2) publicados por Clara Meister (usuario `cmeister` en HuggingFace) junto a Sander Land, como parte del material experimental del artículo "Explicit Boundary Markers for Subword Vocabularies" (arXiv:2608.08847). No son modelos pensados para uso general: son el brazo de control de un estudio comparativo sobre tokenización. Los tres checkpoints comparten arquitectura, datos, hiperparámetros y tokenizer, y solo se diferencian en la semilla de inicialización y en el orden de los shards de entrenamiento, de forma que las diferencias observadas entre tokenizers puedan atribuirse al tokenizer y no al azar.

El modelo es un transformer decoder-only de 12 capas, ancho 768 y 6 cabezas de atención, con una ventana de contexto de 2.048 tokens, entrenado con el framework nanochat (commit `92d63d4`) sobre 1.340 millones de tokens (2.553 pasos de 524.288 tokens) usando los 8 primeros shards de ClimbMix. El tokenizer es un vocabulario MinGram de 34.685 entradas (34.686 en el modelo, contando el token de inicio de secuencia) entrenado sobre una muestra de 5 GB de FineWeb en inglés, con pretokenización por SCRIPT-encoding y sin marcadores de frontera explícitos; de ahí la etiqueta `plain`.

Su relevancia es metodológica más que de producto: sirve como referencia base (bits por byte de validación ≈ 0,883) frente a las variantes con marcadores de frontera del mismo artículo, y su escala reducida permite reproducir el entrenamiento completo en una sola GPU. Los checkpoints originales que respaldaban las cifras publicadas se perdieron y estos tres son reentrenamientos de septiembre de 2026 con la misma configuración, por lo que sus resultados difieren ligeramente de los publicados (en el rango de ±0,00016 bits por byte).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, commit `92d63d4`), 12 capas, ancho 768, 6 cabezas de atencion |
| Parametros totales | no disponible (no publicado; estimacion propia del orden de 110-140 M a partir de la configuracion 12x768, sin confirmar por el autor) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch en precision de entrenamiento; no hay versiones cuantizadas) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)`; no hay safetensors, GGUF ni ONNX |
| Tamano del vocabulario | 34.686 tokens (34.685 del tokenizer MinGram + token de inicio de secuencia) |
| Numero de checkpoints | 3 (semillas 0, 1 y 2) |
| Tamano del repositorio | 2,5 GB (tres checkpoints, tokenizer y logs) |

## Arquitectura y entrenamiento

La arquitectura es la de nanochat en su configuracion de 12 capas: transformer decoder-only con ancho 768, 6 cabezas de atencion (dimensión de cabeza 128) y contexto de 2.048 tokens. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio `script_tok`, con un unico GPU por modelo, 2.553 pasos de 524.288 tokens por paso, lo que da un total de 1.340 millones de tokens vistos. El corpus es el subconjunto de texto que nanochat descarga por defecto: los 8 primeros shards de ClimbMix, leidos entre 3,4 y 3,6 veces segun el tokenizer. La semilla determina la inicializacion de pesos y el orden de esos 8 shards; el orden para una semilla dada es identico entre tokenizers, lo que hace que los modelos con la misma semilla sean directamente comparables.

El elemento diferencial no esta en la arquitectura sino en la tokenizacion. El tokenizer de este repositorio usa pretokenizacion por SCRIPT-encoding sin marcadores de frontera explicitos, es decir, la condicion `plain` o de control. Se entreno con MinGram sobre una muestra de 5 GB de FineWeb en ingles y tiene 34.685 entradas; el fichero es `tokenizer/fineweb_en_5gb_plain_mingram_v34685.json.gz` (sha256 `3f0aa37edef8e434b3befa3ad15e30f68ae8b8a8ec8d02782fe271734b92bfd4`) y se carga con `BoundaryMinGramModel` del repositorio `script_tok`. No hay RLHF, DPO ni ajuste por instrucciones: son modelos base entrenados exclusivamente con el objetivo de prediccion del siguiente token. El articulo indica que los checkpoints originales se perdieron y que estos tres son reentrenamientos de septiembre de 2026 con el mismo tokenizer, los mismos datos de entrenamiento y validacion y los mismos hiperparámetros; como el entrenamiento en GPU no es reproducible bit a bit, las cifras difieren ligeramente de las publicadas.

## Capacidades

- Modelado de lenguaje causal y generacion de texto en ingles por continuacion de prompt. Es un modelo base: no sigue instrucciones ni mantiene formato de chat.
- Evaluacion de calidad de tokenizacion mediante bits por byte sobre el shard de validacion de ClimbMix, que es el uso previsto principal del checkpoint.
- Capacidad de servir como baseline controlado en comparaciones de vocabularios: al compartir semilla, datos e hiperparámetros con las variantes con marcadores de frontera, aisla el efecto del tokenizer.
- Reproduccion de experimentos a pequena escala en una sola GPU, incluida la posibilidad de reentrenar desde cero con nanochat.
- Generacion de texto de dominio general en ingles a nivel de frases cortas y parrafos; la ventana de 2.048 tokens limita el contexto util.
- No dispone de tool calling ni function calling, no tiene soporte de agentes, no implementa razonamiento multi-paso explicito, no tiene modo `thinking`, ni vision, ni audio, ni plantilla de chat.

## Casos de uso

- Evaluacion de tokenizers en investigacion: usar los tres checkpoints como brazo `plain` en un experimento A/B frente a vocabularios con marcadores de frontera, midiendo bits por byte de validacion en el mismo shard y con la misma semilla.
- Reproduccion de resultados publicados: reentrenar con nanochat en el commit `92d63d4` y la misma receta (2.553 pasos de 524.288 tokens) para verificar la reproducibilidad de las cifras del articulo, aceptando la variabilidad de ±0,0002 bits por byte observada entre reentrenamientos.
- Experimentos de ablacion a bajo coste: modificar un unico factor (por ejemplo, el tamano de vocabulario o el corpus de entrenamiento del tokenizer) manteniendo fija la semilla, aprovechando que el orden de shards es identico entre tokenizers.
- Docencia y formacion en LLM: el modelo entrena en una sola GPU y su codigo base es nanochat, lo que lo hace adecuado para explicar el ciclo completo de tokenizacion, preentrenamiento y evaluacion por bits por byte en un curso practico.
- Estudio de compresion y entropia de texto: como el modelo reporta bits por byte en lugar de perplejidad, sirve para analizar cuantos bits por caracter UTF-8 requiere el ingles a esta escala y compararlo con compressores clasicos.
- Pruebas de infraestructura de entrenamiento e inferencia: al ser un checkpoint pequeno en formato PyTorch puro, es util para validar pipelines de carga, conversion de formatos o scripts de evaluacion antes de escalar a modelos mayores.
- Generacion de texto de relleno en ingles para pruebas de integracion: completar prompts cortos en ingles con fines de test de sistemas, asumiendo baja calidad y ausencia de control por instrucciones.

## Benchmarks y rendimiento

La unica metrica publicada es bits por byte de validacion (suma de la perdida sobre el shard de validacion de ClimbMix dividida por la longitud UTF-8 real del texto puntuado; menor es mejor). No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

| Semilla | Reentrenamiento (2026) | Publicado | Diferencia (reentrenamiento - publicado) |
|---|---|---|---|
| 0 | 0,88309 | 0,88294 | +0,00016 |
| 1 | 0,88445 | 0,88454 | -0,00009 |
| 2 | 0,88359 | 0,88360 | -0,00001 |

## Requisitos de hardware

- VRAM para inferencia en fp32: del orden de 0,5-0,6 GB de pesos (estimacion propia a partir de la configuracion; el numero de parametros no esta publicado) mas cache KV. La cache KV a 2.048 tokens en fp32 se estima en unos 150 MB (12 capas x 2 x 6 cabezas x 128 dimensiones x 2.048 tokens x 4 bytes).
- VRAM para inferencia en fp16/bf16: aproximadamente la mitad de pesos y cache, del orden de 0,3-0,4 GB en total.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 4 GB de VRAM o menos. En GPU integrada o CPU la inferencia es viable, aunque el throughput depende del backend.
- GPU recomendadas: cualquiera de la generacion Turing o posterior. Para replicar el entrenamiento el autor indica un unico GPU por modelo; no se especifica el modelo de GPU utilizado.
- Opciones de despliegue: al no haber pesos en GGUF ni en safetensors, no hay soporte directo en llama.cpp, Ollama, vLLM o TGI sin una conversion previa del state dict. La via soportada es cargar el `.pt` con `torch.load(..., weights_only=True)` y usar el codigo de nanochat, mas `script_tok` para el tokenizer.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad.
- Estructura del repositorio: `seed<n>/model_002553.pt` (pesos finales), `seed<n>/meta_002553.json` (configuracion de modelo y entrenamiento), `seed<n>/train.log` (log completo) y `seed<n>/archive.json` (sha256 de cada fichero), mas el directorio `tokenizer/`.

## Comparativa con modelos similares

No existe una comparacion directa publicada con otros modelos en la informacion proporcionada, y la metrica reportada (bits por byte) no es equivalente a las metricas habituales de los modelos de la misma escala. La tabla siguiente usa datos de conocimiento publico general sobre modelos pequenos de proposito general, no verificados en la informacion facilitada, y se ofrece solo como referencia de orden de magnitud.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Metrica comparable |
|---|---|---|---|---|---|
| boundary-markers-en-d12-plain-mingram | no disponible (estimacion 110-140 M) | 2.048 | Apache 2.0 | PyTorch `.pt` | bits por byte (0,883 en validacion) |
| GPT-2 small | 124 M | 1.024 | licencia MIT modificada (referencia publica) | PyTorch / safetensors | no comparable (reporta perplejidad) |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 (referencia publica) | safetensors | no comparable |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 (referencia publica) | safetensors, GGUF | no comparable |

Frente a esas alternativas, la diferencia practica no es el rendimiento sino el proposito: este modelo es un artefacto de investigacion con tres semillas replicadas, sin ajuste por instrucciones, sin tokenizer de chat y sin pesos cuantizados, mientras que los modelos de la tabla estan pensados para uso general y despliegue directo. En cuanto a arquitectura y escala si son comparables: 12 capas y ancho 768 situan al modelo en el mismo orden de magnitud que GPT-2 small y Pythia-160M.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a ordenes, no sigue un formato de chat y no debe usarse como asistente sin un ajuste posterior.
- Ventana de contexto de solo 2.048 tokens, muy inferior a la de los modelos actuales de proposito general; no admite documentos largos ni conversaciones multi-turno extensas.
- Entrenado con 1.340 millones de tokens, un volumen muy bajo: la calidad del texto generado sera limitada y con alta probabilidad de incoherencias y de alucinacion de hechos.
- Solo ingles. No hay datos de entrenamiento ni evaluacion en castellano ni en otros idiomas.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al entrenarse sobre FineWeb/ClimbMix en ingles, heredara los sesgos de ese corpus. No disponible un analisis especifico.
- Restricciones de licencia: Apache 2.0, que permite uso comercial y modificacion con atribucion. Sin embargo, la licencia del corpus de entrenamiento (FineWeb, ClimbMix) no se detalla en la model card; conviene verificarla antes de un uso comercial.
- Los checkpoints publicados no son los que generaron las cifras del articulo: son reentrenamientos con diferencias de hasta +0,00016 bits por byte. Cualquier comparacion con las tablas publicadas debe tener en cuenta ese margen.
- Ausencia de pesos en safetensors y GGUF: no hay ruta de despliegue directa en vLLM, TGI, llama.cpp u Ollama, y la conversion corre por cuenta del usuario.
- El repositorio tiene cero descargas y cero likes, y no cuenta con pipeline declarado en HuggingFace: no hay validacion de la comunidad ni ejemplos de uso en produccion.
- El tokenizer requiere el repositorio `script_tok` y su clase `BoundaryMinGramModel`; no es un tokenizer cargable con `transformers` de forma estandar, lo que anade friccion de integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-en-d12-plain-mingram
- Articulo "Explicit Boundary Markers for Subword Vocabularies": https://arxiv.org/abs/2608.08847
- Repositorio nanochat (commit `92d63d4`): https://github.com/karpathy/nanochat
- Repositorio script_tok, con el codigo del tokenizer y los scripts de entrenamiento: https://github.com/sanderland/script_tok
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (remiten a servicios de resultados deportivos en directo), por lo que no se incluye ningun enlace adicional de esa fuente.
