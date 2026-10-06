# cstr/opus-mt-es-en-GGUF

## Resumen

`cstr/opus-mt-es-en-GGUF` es una conversion al formato GGUF/ggml del modelo de traduccion automatica `Helsinki-NLP/opus-mt-es-en`, perteneciente a la familia OPUS-MT desarrollada por Jörg Tiedemann y Santhosh Thottingal (Universidad de Helsinki) y publicada originalmente con motivo de EAMT 2020. Se trata de un modelo MarianMT de tipo encoder-decoder, pequeno y especializado en un unico par de idiomas (espanol a ingles), con 78.008.297 parametros, 6 capas de encoder y 6 de decoder con dimension de modelo d=512. Su interes practico no esta en competir con los grandes modelos multimodales, sino en ofrecer traduccion de muy baja latencia y huella minima de memoria.

El repositorio lo mantiene el usuario `cstr` y esta pensado para ejecutarse con el backend `marian` de CrispASR (CrispStrobe/CrispASR), una herramienta de reconocimiento de voz y traduccion en vivo. La conversion no modifica los pesos originales: se distribuye una version en f16 (161 MB) y una cuantizada en q8_0 (88 MB). Internamente el modelo sigue siendo el checkpoint `opus-2020-08-18` del proyecto OPUS-MT, entrenado sobre datos de OPUS y distribuido bajo licencia CC-BY-4.0.

Es relevante ahora porque cubre un nicho concreto: pipelines de transcripcion y traduccion simultanea por frases, donde un modelo de 80 millones de parametros cabe en cualquier maquina (incluido hardware modesto) y evita los costes de inferencia de los modelos generativos multilingues de gran tamano. La contrapartida es que se trata de un modelo puramente de traduccion, sin capacidades de razonamiento, tool calling ni conversacion, y con muy poca validacion comunitaria hasta la fecha (0 descargas y 0 likes en el momento de recopilar los datos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), 6 capas de encoder + 6 de decoder, d=512 |
| Parametros totales | 78.008.297 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | es (origen), en (destino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml) |
| Tamano de los ficheros | `opus-mt-es-en-f16.gguf` 161 MB; `opus-mt-es-en-q8_0.gguf` 88 MB |
| Modelo base | Helsinki-NLP/opus-mt-es-en (release `opus-2020-08-18`) |
| Libreria / runtime | ggml, backend `marian` de CrispASR |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | translation |
| Fecha de publicacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder clasico del toolkit Marian, con 6 capas en el encoder y 6 en el decoder y una dimension de modelo de 512, lo que da los aproximadamente 80 millones de parametros del checkpoint. No emplea mecanismos de atencion dispersa, MoE ni decodificacion especulativa: es un modelo denso, unidireccional y de un solo par de idiomas, disenado para traducir frases completas y no para mantener dialogos. La conversion a GGUF se realiza con `models/convert-marian-to-gguf.py` y la cuantizacion con `crispasr-quantize` (esquema q8_0); los pesos en f16 son identicos a los del checkpoint original.

En cuanto al entrenamiento, los datos proceden del corpus OPUS, un agregado de colecciones paralelas multilingues mantenidas por la Universidad de Helsinki. La model card de este repositorio no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO (en un modelo de traduccion de esta generacion lo habitual es entrenamiento supervisado puro, pero no se confirma en la informacion disponible). Como verificacion de la conversion, el autor reporta una prueba de paridad frente a `MarianMTModel.generate` de Hugging Face `transformers` sobre 8 frases de test: los ids de tokens de entrada coinciden en 8/8 casos, la salida en f16 es identica en modo greedy (8/8) y con beam 4 (8/8), y la salida en q8_0 es identica en modo greedy (8/8), con diferencias solo de redaccion en otros ajustes de decodificacion.

## Capacidades

- Traduccion de texto de espanol a ingles, frase a frase, con decodificacion greedy o beam search segun el parametro `-bs`.
- Integracion en modo traduccion en vivo (`--live-translate`) de CrispASR: reconocimiento de voz en espanol y traduccion a ingles en cadena, siempre con decodificacion greedy.
- Ejecucion en CPU y en GPU con huella de memoria minima (88 MB en q8_0).
- Salida determinista y reproducible en greedy, apta para pipelines automatizados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- Capacidad multilingue limitada estrictamente al par es-en; para la direccion inversa el autor remite a `cstr/opus-mt-en-es-GGUF`.
- Los tokens literales `</s>`, `<unk>` y `<pad>` presentes en la entrada se tratan como texto normal, a diferencia de la implementacion de referencia, que los interpreta como tokens especiales.

## Casos de uso

- Subtitulado y traduccion en directo: integrado en CrispASR con `--live-translate`, traduce cada frase reconocida del espanol al ingles a medida que se pronuncia, con una latencia muy baja gracias al tamano reducido del modelo.
- Transcripcion de reuniones internacionales: se combina un reconocedor de voz en espanol con este modelo para generar actas bilingues; el modo greedy garantiza que la misma entrada produzca siempre la misma salida.
- Pretraduccion en flujos de localizacion: generar un primer borrador en ingles de documentacion o cadenas de interfaz escritas en espanol, que despues revisa un traductor humano, reduciendo el coste por palabra.
- Procesamiento por lotes de corpus: traducir grandes volumenes de mensajes, tickets o resenas en espanol en maquinas sin GPU, ya que el modelo en q8_0 ocupa 88 MB y cabe en cualquier servidor.
- Traduccion embebida en el borde: al ser un modelo de 80 millones de parametros, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, portatiles antiguos, contenedores pequenos) donde un modelo generativo multilingue no seria viable.
- Enriquecimiento de indices de busqueda: normalizar metadatos o documentos en espanol a un campo en ingles para busquedas cruzadas en sistemas de recuperacion de informacion.
- Prototipado rapido de asistentes de atencion al cliente: para escenarios de soporte en los que solo se necesita pasar de espanol a ingles antes de enviar el texto a otro componente (clasificador, motor de busqueda), sin coste de inferencia apreciable.
- Traduccion en tiempo real durante eventos y webinars: al ejecutarse en local y no requerir conexion a servicios externos, es adecuado cuando hay requisitos de privacidad o de disponibilidad de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (BLEU, chrF u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es la prueba de paridad frente a la implementacion de referencia de Hugging Face `transformers`, resumida en la tabla siguiente:

| Fichero | Tamano | Paridad greedy | Paridad beam 4 |
|---|---|---|---|
| `opus-mt-es-en-f16.gguf` | 161 MB | 8/8 frases identicas | 8/8 frases identicas |
| `opus-mt-es-en-q8_0.gguf` | 88 MB | 8/8 frases identicas | no reportada (diferencias de redaccion) |

La prueba se realizo sobre 8 frases de test, con ids de tokens de entrada identicos en 8/8 casos. No se dispone de comparaciones con otros modelos en terminos de calidad de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 161 MB en f16 y 88 MB en q8_0 para los pesos; el consumo real anade el overhead del runtime y de la cache de atencion, pero se mantiene en el orden de centenares de megabytes.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650, e incluso en GPUs integradas.
- Funciona en CPU sin GPU dedicada; el modelo esta pensado para ejecutarse en local en hardware modesto.
- Opciones de despliegue: backend `marian` de CrispASR (el runtime documentado por el autor). No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp en la informacion disponible.
- Latencia y throughput: no se publican cifras concretas. La model card afirma que, dentro de CrispASR, estos modelos Marian son los traductores mas rapidos para transcripcion y traduccion en vivo (`--live-translate`).
- Descarga automatica: al invocar `-m opus-mt-es-en`, CrispASR descarga `opus-mt-es-en-q8_0.gguf` en el primer uso.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `cstr/opus-mt-es-en-GGUF` (este) | 78 M | es→en | GGUF (f16, q8_0) | CC-BY-4.0 | Conversion para CrispASR; sin benchmarks publicados |
| `Helsinki-NLP/opus-mt-es-en` (original) | 78 M | es→en | PyTorch / safetensors | CC-BY-4.0 | Implementacion de referencia en `transformers`; mismos pesos |
| `cstr/opus-mt-en-es-GGUF` | no disponible | en→es | GGUF | CC-BY-4.0 | Direccion inversa, mantenida por el mismo autor |
| `facebook/nllb-200-distilled-600M` | 600 M | 200 idiomas | PyTorch / safetensors | CC-BY-NC-4.0 | Modelo multilingue mucho mayor; licencia no comercial, a diferencia de este |

La comparacion con NLLB-200 se incluye como referencia de categoria (traduccion automatica neuronal) y no procede de la informacion proporcionada en esta busqueda; conviene verificar sus cifras en su propia model card. Frente al checkpoint original, la unica diferencia de esta publicacion es el formato y la cuantizacion, no los pesos ni la calidad esperada. La ventaja competitiva frente a alternativas mayores es el coste de inferencia y la posibilidad de ejecucion en CPU; la desventaja es la ausencia de evaluacion de calidad publicada y la falta de soporte multilingue.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de espanol a ingles. Para la direccion contraria hay que usar otro checkpoint.
- No hay resultados de BLEU ni de otras metricas de calidad en la informacion disponible; el rendimiento real sobre dominios especializados (juridico, medico, tecnico) es desconocido.
- Riesgo de alucinacion y de errores de traduccion en terminos especificos, nombres propios, siglas y expresiones idiomaticas, comun en modelos Marian de este tamano entrenados sobre corpus genericos.
- Comportamiento divergente respecto a la implementacion de referencia con los tokens literales `</s>`, `<unk>` y `<pad>`, que aqui se tratan como texto normal. Esto puede producir resultados distintos si la entrada contiene esas cadenas.
- En modo en vivo la decodificacion es siempre greedy, lo que reduce la variabilidad pero tambien la calidad potencial respecto a beam search.
- La cuantizacion q8_0 conserva la paridad en greedy sobre la muestra de 8 frases, pero puede introducir diferencias de redaccion en otros ajustes; no hay una evaluacion mas amplia.
- Licencia CC-BY-4.0: el uso comercial esta permitido, pero exige atribucion al proyecto OPUS-MT (Jörg Tiedemann y Santhosh Thottingal, Universidad de Helsinki) y el cumplimiento de los terminos de la licencia en cualquier redistribucion.
- La model card advierte de que la licencia declarada es la del proyecto OPUS-MT, no la etiqueta individual de una model card concreta.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad, sin issues ni casos de uso reportados.
- El runtime documentado es CrispASR (backend `marian`); otros motores GGUF, como llama.cpp, no documentan soporte para la arquitectura Marian, por lo que la portabilidad del fichero no esta garantizada.
- La longitud de contexto no esta especificada; el modelo esta pensado para frases, no para documentos largos, y su uso con parrafos extensos no esta validado.
- No dispone de filtros de seguridad, moderacion ni mecanismos de rechazo de contenido: cualquier texto de entrada se traducira sin cribado previo.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los resultados se refieren a reactores quimicos CSTR y a un centro de rehabilitacion psicosocial de Toulouse), por lo que no aportan datos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/opus-mt-es-en-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Direccion inversa (en→es): https://huggingface.co/cstr/opus-mt-en-es-GGUF
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Articulo de referencia: Tiedemann, J. y Thottingal, S., "OPUS-MT — Building open translation services for the World", EAMT 2020 (no se proporciona URL directa en la informacion disponible; buscar por el titulo)
