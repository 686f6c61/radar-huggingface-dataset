# aakaashj/Aakaash-Aeon3.8-Flash-Next-Uncensored-TFQ3

## Resumen
Aakaash-Aeon3.8-Flash-Next-Uncensored-TFQ3 es una cuantizacion comunitaria en formato TensorFold TFQ3 del modelo AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16, a su vez un ajuste sin censura del Qwen3.8-Flash-Next de Qwen. La publica Aakaash Jaju y esta pensada para ejecutarse con el runtime TensorFold nativo sobre Apple Silicon (Metal), no con los stacks habituales de inferencia. El checkpoint combina pesos de expertos en formato propietario `.tffpw` con el resto de pesos y tablas de embeddings en Safetensors de 8 bits.

El modelo tiene 56.687.443.859 parametros totales (unos 56,7 mil millones) y un tamano de repositorio de 84,8 GB, coherente con su naturaleza mixta de precision y con la inclusion de las cabezas MTP (multi-token prediction). La configuracion probada por el autor es de 65.536 tokens de contexto sobre un Apple M5 Max con 128 GiB de memoria unificada. La relevancia actual es limitada pero especifica: ofrece una via para ejecutar un modelo de gran tamano y sin restricciones de alineacion en hardware Apple de gama alta, un nicho donde las alternativas cuantizadas en GGUF o MLX no siempre cubren los mismos pesos.

Se trata de un lanzamiento muy reciente (26 de noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con la evaluacion declarada como pendiente. La licencia heredada es Qwen Community License 1.0, con las condiciones que esta impone a los derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen3.8-Flash-Next; incluye cabezas MTP |
| Parametros totales | 56.687.443.859 (56,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuracion probada por el autor; maximo nativo no disponible |
| Tipos de cuantizacion | TFQ3 (TensorFold, precision mixta); pesos no-expertos y embeddings en 8 bits (Safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` / `qwen-community-1.0`) |
| Formato de pesos | TensorFold TFQ3: `layer_*.tffpw`, `mtp_00.tffpw`, `nonmoe_q8_*.safetensors`, `ple_b3_*.safetensors`, `pw_v3_tables.bin` |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) segun la nomenclatura del checkpoint (ficheros `layer_*.tffpw` como pesos de expertos y `nonmoe_q8_*.safetensors` para el resto). El checkpoint incorpora cabezas MTP (multi-token prediction), incluidas en el fichero `mtp_00.tffpw`, lo que sugiere decodificacion especulativa o prediccion multi-token como parte del diseno. No se dispone de detalles sobre el numero de expertos, la relacion de activacion ni la composicion del dataset de entrenamiento original.

El proceso de este lanzamiento concreto es una cuantizacion post-entrenamiento en formato TFQ3 de TensorFold, con tablas de busqueda (`pw_v3_tables.bin`) y pesos de expertos en formato nativo `.tffpw`. No hay informacion sobre las tecnicas de alineacion aplicadas por AEON-7 en el modelo base (RLHF, DPO u otras) ni sobre el volumen de tokens de entrenamiento. El autor declara que los resultados de evaluacion estan pendientes y que las puntuaciones de AEON y TensorFold corresponden a sus respectivos lanzamientos, no a este checkpoint.

## Capacidades
- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`).
- Modelo sin censura (uncensored): el ajuste de AEON-7 elimina o relaja los filtros de alineacion del modelo base, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido problematico.
- Razonamiento y codigo: no confirmado de forma explicita en la informacion disponible; al derivar de Qwen3.8-Flash-Next, es esperable que conserve parte de estas capacidades, pero no hay validacion publicada para este checkpoint.
- Prediccion multi-token (MTP) integrada en el checkpoint, orientada a acelerar la decodificacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Experimentacion local en Apple Silicon: el modelo esta disenado y probado para TensorFold nativo sobre Metal, con una configuracion validada de 65.536 tokens en un M5 Max de 128 GiB. Es adecuado para desarrolladores que quieran probar un modelo de 56,7 mil millones de parametros en un equipo de sobremesa Apple sin depender de GPUs dedicadas.
- Investigacion sobre alineacion y censura: al ser un ajuste sin censura, sirve para estudiar como se comporta un modelo de esta escala cuando se eliminan los filtros, comparando respuestas con el Qwen3.8-Flash-Next original en tareas sensibles controladas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen rechazar peticiones. La ventana de 65.536 tokens permite mantener coherencia en textos largos.
- Procesamiento de documentos extensos: con 65.536 tokens de contexto se pueden resumir o analizar informes, contratos o transcripciones de decenas de miles de palabras en una sola pasada, siempre que el hardware lo soporte.
- Evaluacion de formatos de cuantizacion: el checkpoint es un caso de estudio para medir la perdida de calidad de TFQ3 frente al BF16 de origen (AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16), util para quienes investigan tecnicas de compresion.
- Desarrollo de pipelines de inferencia en Metal: sirve como banco de pruebas para integrar TensorFold en aplicaciones macOS nativas, dado que el autor documenta los ficheros requeridos y el layout del checkpoint.
- Prototipado de asistentes conversacionales de nicho: en entornos donde no se requiera moderacion automatica, el modelo puede gestionar dialogos multi-turno con contexto largo, aunque sin garantias de calidad medidas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion esta pendiente y que las puntuaciones de AEON y TensorFold no son aplicables a este checkpoint.

## Requisitos de hardware
- VRAM/memoria: el checkpoint ocupa aproximadamente 84,82 GB (78,99 GiB) incluyendo MTP. En Apple Silicon se necesita memoria unificada suficiente para los pesos mas el contexto; la configuracion probada usa 128 GiB en un M5 Max.
- GPU recomendadas: el autor solo valida Apple Silicon con Metal (M5 Max de 128 GiB). No hay datos de funcionamiento en A100, H100 ni RTX 4090, y el formato TFQ3 no es compatible con los stacks CUDA habituales.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) por el tamano del checkpoint y la falta de soporte del formato en CUDA. En Apple Silicon, requiere equipos con memoria unificada de gama alta (128 GiB probados).
- Despliegue: exclusivamente con TensorFold nativo 1.3.5 o superior que soporte TFQ3 para Qwen3.8 Flash Next. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aakaash-Aeon3.8-Flash-Next-Uncensored-TFQ3 | 56,7 mil millones | 65.536 probados | TFQ3 (TensorFold) | Qwen Community 1.0 | Hugging Face, 0 descargas |
| AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16 | no disponible | no disponible | BF16 (Safetensors) | no disponible | Hugging Face (modelo base) |
| TensorFold/Qwen3.8-Flash-Next-TFQ3 | no disponible | no disponible | TFQ3 (TensorFold) | no disponible | Hugging Face (referencia TFQ3) |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Qwen Community 1.0 | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparativa se limita a formato, licencia y procedencia.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no se puede recomendar para produccion sin evaluacion propia.
- Modelo sin censura: el ajuste de AEON-7 elimina los filtros de alineacion, lo que implica riesgo elevado de generar contenido ofensivo, ilegal o danino. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado; al no haber evaluacion, se desconoce su fiabilidad factual.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Licencia restrictiva: la Qwen Community License 1.0 impone condiciones al uso comercial y a la redistribucion de derivados; debe revisarse el fichero LICENSE antes de cualquier despliegue productivo.
- Dependencia de un runtime especifico: requiere TensorFold nativo con soporte TFQ3; no funciona con vLLM, llama.cpp, Ollama ni TGI, lo que limita su portabilidad y su integracion en infraestructuras existentes.
- Hardware muy concreto: solo hay validacion en Apple M5 Max con 128 GiB; el rendimiento en otros equipos Apple es desconocido.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion independiente.
- Integridad del checkpoint: el autor insiste en mantener los nombres y el layout originales de los ficheros; cualquier renombrado o reorganizacion puede romper la carga.
- Fecha de creacion futura respecto a los datos habituales de referencia; conviene verificar la vigencia del lanzamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aakaashj/Aakaash-Aeon3.8-Flash-Next-Uncensored-TFQ3
- Modelo base sin censura (AEON-7): https://huggingface.co/AEON-7/Aeon3.8-Flash-Next-Ultimate-Uncensored-BF16
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint TFQ3 de referencia (TensorFold): https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-TFQ3
- Implementacion y formato TFQ (ashhart): https://github.com/ashhart/TFQ
- Perfil de TensorFold en Hugging Face: https://huggingface.co/TensorFold
- Perfil de ashhart en GitHub: https://github.com/ashhart
