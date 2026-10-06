# cstr/opus-mt-es-de-GGUF

## Resumen
`cstr/opus-mt-es-de-GGUF` es una conversion al formato GGUF/ggml del modelo de traduccion `Helsinki-NLP/opus-mt-es-de`, perteneciente al proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un modelo MarianMT de tipo encoder-decoder, pequeno y especializado en una unica direccion de traduccion: espanol a aleman. Con 76.110.197 parametros, 6 capas de encoder mas 6 de decoder y dimension de modelo de 512, es un sistema ligero pensado para traduccion de texto y para traduccion en vivo de transcripciones.

El modelo lo publica el usuario `cstr` como simple conversion de formato (los pesos no se modifican), con el objetivo de ejecutarlo mediante el backend Marian de CrispASR (`--backend marian`). En ese contexto, estos modelos se emplean como traductores rapidos para transcripcion mas traduccion en directo (`--live-translate`). Su relevancia actual radica en que permite traduccion espanol-aleman de baja latencia en hardware muy modesto, algo util para subtitulado, localizacion y procesamiento de reuniones.

El repositorio ocupa 0,2 GB e incluye dos variantes: `opus-mt-es-de-f16.gguf` (157 MB) y `opus-mt-es-de-q8_0.gguf` (86 MB, la recomendada por el autor por ser la mas rapida). La licencia de los pesos es CC-BY-4.0, heredada del proyecto OPUS-MT, y exige atribucion a dicho proyecto al redistribuir.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT, transformer encoder-decoder (6+6 capas, d=512) |
| Parametros totales | 76.110.197 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 (GGUF) |
| Idiomas soportados | espanol (es) y aleman (de); direccion es → de |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF / ggml |

## Arquitectura y entrenamiento
Se trata de un transformer de tipo encoder-decoder basado en la arquitectura MarianMT, con 6 capas en el encoder y 6 en el decoder y una dimension oculta de 512. El modelo esta especializado en un unico par de idiomas (espanol a aleman) y sigue el diseno habitual de OPUS-MT, en el que cada direccion de traduccion se cubre con un modelo independiente. Los pesos corresponden a la publicacion `opus-2020-01-16` del proyecto OPUS-MT, entrenada sobre datos del corpus OPUS por Jorg Tiedemann y Santhosh Thottingal (Universidad de Helsinki, EAMT 2020).

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La aportacion de este repositorio concreto no es el entrenamiento, sino la conversion de formato a GGUF y su cuantizacion. Segun el autor, la conversion preserva los pesos sin cambios en f16 y los cuantiza en q8_0, con paridad verificada frente a la implementacion de referencia (`MarianMTModel.generate` de Hugging Face `transformers`).

## Capacidades
- Traduccion de texto de espanol a aleman en una unica direccion.
- Traduccion en vivo de transcripciones, integrada en el flujo `--live-translate` de CrispASR junto con un reconocedor de voz que soporte espanol.
- Decodificacion greedy (`-bs 1`) o con beam search segun el tamano de haz propio del checkpoint.
- Ejecucion como backend Marian dentro de CrispASR (`--backend marian`).
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento (thinking mode).
- Multilingue limitado a los dos idiomas del par; no es un modelo multilingue general.

## Casos de uso
- Subtitulado y traduccion en directo: integrado con un reconocedor de voz en espanol y el modo `--live-translate`, traduce oracion a oracion la transcripcion de una reunion o ponencia hacia aleman con baja latencia.
- Traduccion de documentacion tecnica en lotes: al ser un modelo de 76M de parametros, permite traducir grandes volumenes de textos del espanol al aleman en CPU sin coste elevado de computo.
- Localizacion de productos y contenidos: traduccion de cadenas de interfaz, correos o notas de version espanol-aleman como paso previo a revision humana.
- Procesamiento offline y en el borde: con 86 MB en q8_0, puede desplegarse en dispositivos sin GPU dedicada o en entornos desconectados donde no se quiere enviar texto a servicios externos.
- Enriquecimiento de pipelines de datos: traduccion automatica de corpus espanoles a aleman para generar conjuntos paralelos o ampliar datos de entrenamiento.
- Traduccion dentro de aplicaciones de chat o mensajeria: traduccion de mensajes individuales del espanol al aleman en tiempo real en un servicio alojado en servidor modesto.
- Apoyo a reuniones multilingues: combinado con ASR, ofrece transcripcion y traduccion simultaneas de intervenciones en espanol para asistentes germanoparlantes.

## Benchmarks y rendimiento
El autor publica pruebas de paridad frente a la implementacion de referencia (`MarianMTModel.generate` de `transformers`) sobre 8 frases de prueba. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible.

| Prueba | f16 | q8_0 |
|---|---|---|
| Paridad greedy (8 frases) | 8/8 identicas | 7/8 identicas |
| Paridad con beam 4 (8 frases) | 8/8 identicas | no disponible |
| Identidad de ids de tokens de entrada | 8/8 | 8/8 |

Para la variante q8_0, las frases no identicas difieren en la redaccion, segun indica el autor. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion; aproximadamente 157 MB (f16) y 86 MB (q8_0) de pesos, mas el overhead de runtime.
- GPU recomendadas: cualquier GPU moderna o antigua con suficiente memoria; el modelo es tan pequeno que no requiere A100 ni H100. Cabe sobradamente en RTX 4090, RTX 3060 y similares.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso se puede ejecutar en CPU.
- Opciones de despliegue: CrispASR con backend Marian (uso previsto por el autor). No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras concretas; el autor indica que son "los traductores mas rapidos" para transcripcion y traduccion en vivo en CrispASR. El modo en vivo decodifica siempre en greedy.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Direccion | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/opus-mt-es-de-GGUF | 76,1 M | no disponible | es → de | CC-BY-4.0 | GGUF |
| Helsinki-NLP/opus-mt-es-de | ~76 M (mismo checkpoint) | no disponible | es → de | CC-BY-4.0 | safetensors (transformers) |
| cstr/opus-mt-de-es-GGUF | no disponible | no disponible | de → es | CC-BY-4.0 | GGUF |

La diferencia principal frente al modelo base `Helsinki-NLP/opus-mt-es-de` es el formato (GGUF frente a safetensors) y la cuantizacion, con pesos equivalentes en f16. La variante `cstr/opus-mt-de-es-GGUF` cubre la direccion inversa. No se dispone de datos para comparar de forma cuantitativa con modelos multilingues como NLLB o M2M-100; no disponible.

## Limitaciones y advertencias
- Modelo especializado en una sola direccion (es → de); para la direccion inversa existe otro modelo.
- La variante q8_0 no reproduce de forma exacta todas las frases frente a la referencia (7/8 en greedy); puede introducir variaciones de redaccion.
- En el modo en vivo siempre se decodifica greedy, lo que puede reducir la calidad frente a beam search.
- Los tokens literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion, mientras que la referencia los trata como tokens especiales; esto puede alterar resultados con ese tipo de entradas.
- Riesgo de alucinacion y de errores de traduccion propios de un modelo pequeno de 76M de parametros; se recomienda revision humana en usos sensibles.
- No se documentan sesgos especificos ni evaluaciones de sesgo en la informacion disponible.
- Licencia CC-BY-4.0: el uso comercial esta permitido, pero exige atribucion al proyecto OPUS-MT (Universidad de Helsinki) al redistribuir. La atribucion debe basarse en la declaracion del proyecto OPUS-MT, no en la etiqueta de una model card individual.
- La longitud de contexto no esta documentada; conviene verificar el limite practico antes de traducir documentos largos en una sola pasada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; poca validacion externa de la conversion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/cstr/opus-mt-es-de-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-de
- Direccion inversa: https://huggingface.co/cstr/opus-mt-de-es-GGUF
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Nota: los resultados de la busqueda web consultada no aportaron enlaces tecnicos relevantes sobre el modelo (correspondian a un reactor quimico CSTR, a un centro de rehabilitacion psicosocial y a la funcion `CStr` de Visual Basic, ajenos a este modelo).
