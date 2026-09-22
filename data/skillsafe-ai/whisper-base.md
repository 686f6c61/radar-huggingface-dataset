# skillsafe-ai/whisper-base

## Resumen

`skillsafe-ai/whisper-base` es un paquete de artefactos ONNX listos para navegador del modelo de reconocimiento automatico del habla Whisper base, publicado por SkillSafe. No se trata de un entrenamiento nuevo: es una reempaquetado reproducible del modelo `onnx-community/whisper-base`, fijado por commit y verificable byte a byte mediante hashes SHA-256, pensado para ejecutarse con transformers.js sobre ONNX Runtime en el navegador o en Node.js.

El modelo resuelve la transcripcion de audio a texto (pipeline `automatic-speech-recognition`) con una arquitectura encoder-decoder de tipo transformer. El encoder consume ventanas de 30 segundos de audio convertidas en espectrogramas mel de 1500 fotogramas con 512 dimensiones, y el decoder autorregresivo genera hasta 448 tokens de texto con un vocabulario de 51 865 entradas. Se distribuye en tres precisiones (fp32, fp16 y q8) para adaptarse a distintos presupuestos de memoria, con pesos que van de los 51,21 MB del decoder cuantizado a los 198,86 MB del decoder en fp32.

Su relevancia es practica: permite inferencia de voz a texto completamente local, sin enviar audio a un servidor y sin dependencias de Python, lo que encaja en aplicaciones web con requisitos de privacidad. El repositorio incluye ademas el recetario de conversion, la cadena de herramientas exacta y una prueba de humo sobre CPU con `onnxruntime`, lo que facilita la auditoria de la procedencia. La contrapartida es que, al ser un reempaquetado, hereda las capacidades y limitaciones del Whisper base original y no anade mejoras de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper |
| Parametros totales | No declarado en la model card; el upstream corresponde a OpenAI Whisper base (aproximadamente 74 M, valor de referencia no verificado en la informacion disponible) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s (1500 fotogramas mel de 512 dimensiones); el decoder genera hasta 448 tokens |
| Tipos de cuantizacion | fp32, fp16 y q8 (int8) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) mas ficheros auxiliares JSON (tokenizer, config, preprocessor) |
| Modelo base | `onnx-community/whisper-base` (commit `1846881b6b3a3024392c1eea3ad983695bc23925`) |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Libreria | transformers.js (ONNX Runtime) |
| Tamano del repositorio | 0,5 GB |
| Numero de capas | 6 en el encoder y 6 en el decoder (inferido de las claves `past_key_values.0..5` de los grafo ONNX) |
| Cabezas de atencion | 8 por capa, dimension de cabeza 64 (d_modelo = 512) |
| Vocabulario | 51 865 tokens |
| Fecha de publicacion | 22 de septiembre de 2026 |

Ficheros y tamanos publicados:

| Fichero | Precision | Tamano |
|---|---|---|
| `onnx/encoder_model.onnx` | fp32 / q8 (etiquetado como "fp32, q8") | 78,65 MB |
| `onnx/encoder_model_fp16.onnx` | fp16 | 39,42 MB |
| `onnx/decoder_model_merged.onnx` | fp32 | 198,86 MB |
| `onnx/decoder_model_merged_fp16.onnx` | fp16 | 99,88 MB |
| `onnx/decoder_model_merged_quantized.onnx` | q8 | 51,21 MB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer seq2seq con encoder y decoder de 6 capas cada uno, 8 cabezas de atencion y dimension de modelo 512. El encoder procesa espectrogramas mel de 1500 fotogramas (30 segundos de audio a 50 fotogramas por segundo) y produce estados ocultos de forma `[1, 1500, 512]`. El decoder es autorregresivo con atencion cruzada sobre la salida del encoder y cache KV propia: los grafos ONNX exponen `past_key_values.N.decoder.key/value` y `past_key_values.N.encoder.key/value` para las 6 capas, lo que habilita decodificacion incremental sin recalcular el prefijo. La variante `decoder_model_merged` unifica los caminos con y sin cache mediante la entrada booleana `use_cache_branch`, una tecnica habitual para reducir el numero de grafos en el despliegue web.

No hay entrenamiento ni ajuste fino atribuible a SkillSafe. El repositorio documenta un proceso de importacion reproducible: se parte del commit fijado de `onnx-community/whisper-base`, se aplica el recetario `recipes/whisper-base.yaml` (sha256 `7b6e7e83a7b4704bb97d2b8d671f9a39ee5f88dbe43b96d47dc2ceecd943f41b`) con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, y se publica sin edicion manual. Cada fichero queda fijado por SHA-256 y todos los ONNX pasaron `onnx.checker` y una prueba de humo en CPU con entradas rellenas de ceros. En esa prueba, la pasada del decoder fp32 con 4 tokens de entrada, estados de encoder de 1500 fotogramas y cache inicial de 1 token tardo 9,9 ms, una cifra que mide latencia de un unico forward en CPU con datos sinteticos y no debe interpretarse como throughput de transcripcion real.

El punto tecnicamente interesante es la separacion entre ficheros `bundle` (tokenizer, config, vocabulario, normalizador, que viajan dentro de la aplicacion) y ficheros `registry` (los parametros ONNX, servidos desde `models.skillsafe.ai` tras verificacion). Ese diseno permite cachear los pesos en un CDN o en el almacenamiento del navegador y compartir la libreria de runtime entre modelos de la misma arquitectura (`registry-shared`).

## Capacidades

- Reconocimiento automatico del habla: transcripcion de audio a texto con ventanas de 30 segundos por pasada.
- Ejecucion en navegador mediante transformers.js y ONNX Runtime, sin backend Python.
- Inferencia local con tres niveles de precision intercambiables (fp32, fp16, q8) segun memoria disponible.
- Decodificacion incremental con cache KV de encoder y decoder, adecuada para generacion token a token en cliente.
- Capacidad multilingue: no confirmada en la informacion disponible para este reempaquetado. El tokenizer cuenta con 51 865 entradas y el modelo base pertenece a la familia Whisper, pero la model card no enumera idiomas.
- Traduccion de voz a texto en ingles (tarea secundaria de Whisper): no confirmada en la informacion disponible.
- Tool calling / function calling: no soportado; es un modelo de voz a texto, no un modelo de lenguaje conversacional.
- Modo agente o razonamiento multi-paso: no soportado.
- Vision o audio multimodal mas alla del propio audio de entrada: no soportado.

## Casos de uso

- Transcripcion local en aplicaciones web: integrar el modelo con transformers.js para transcribir notas de voz o reuniones directamente en el navegador del usuario, sin enviar el audio a servidores externos. La ventana de 30 s y los 51,21 MB del decoder q8 lo hacen viable en equipos de gama media.
- Cumplimiento normativo y privacidad: en sectores con requisitos estrictos de tratamiento de datos (sanidad, legal, administracion publica), procesar el audio en el cliente elimina la transferencia de datos personales a terceros y simplifica el analisis de impacto.
- Subtitulado de contenido audiovisual: generar subtitulos para videos cortos o clips dividiendo el audio en tramos de 30 segundos y encadenando el decoder con cache incremental, desplegando los pesos desde un CDN compartido.
- Accesibilidad en formularios y buscadores: dictado por voz en campos de texto de aplicaciones web, aprovechando el empaquetado ONNX y la ausencia de dependencias nativas.
- Preprocesado en pipelines de analitica de llamadas: convertir grabaciones a texto antes de aplicar busqueda, clasificacion o resumen con otro modelo, reduciendo coste de GPU al ejecutar la transcripcion en CPU.
- Prototipado e investigacion en reconocimiento de voz: al ser una importacion reproducible con hashes SHA-256 y prueba de humo documentada, sirve como linea base auditable para comparar tecnicas de cuantizacion o de decodificacion.
- Aplicaciones offline o con conectividad intermitente: una PWA que descargue el encoder fp16 (39,42 MB) y el decoder q8 (51,21 MB) puede funcionar sin red tras la primera carga.
- Documentacion y actas automaticas: transcripcion de reuniones con marcas temporales, aprovechando que el encoder procesa exactamente 1500 fotogramas por pasada y facilita el alineado por segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, MMLU, HumanEval, GSM8K ni ninguna otra, y la busqueda web realizada no devolvio ningun enlace relacionado con este modelo (los resultados obtenidos correspondian a software de contabilidad y no son pertinentes).

El unico dato de rendimiento documentado es la prueba de humo en CPU con `onnxruntime` sobre entradas rellenas de ceros:

| Grafo | Entradas declaradas | Salidas | Tiempo |
|---|---|---|---|
| `onnx/decoder_model_merged.onnx` (fp32) | `input_ids[1,4]`, `encoder_hidden_states[1,1500,512]`, 24 tensores de cache KV | `logits[1,4,51865]` y 24 tensores `present.*` | 9,9 ms |
| `onnx/decoder_model_merged_fp16.onnx` | Mismas formas que el fp32 | No disponible en el extracto | No disponible |
| `onnx/encoder_model.onnx` | No disponible en el extracto | No disponible | No disponible |

Esta medicion corresponde a un unico forward con datos sinteticos, no a una transcripcion completa, por lo que no es extrapolable a latencia real ni a calidad de transcripcion.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto de pesos va de 51,21 MB (decoder q8) + 78,65 MB (encoder fp32) en la configuracion mas ligera hasta 198,86 MB + 78,65 MB en fp32 completo. Con estados intermedios, cache KV y activaciones, el consumo real ronda 0,5-1 GB en fp32 y bastante menos en q8/fp16.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y tambien en graficas integradas o en CPU pura, dado el tamano reducido del modelo.
- Despliegue en navegador o edge: es el escenario principal de este repositorio, con transformers.js y ONNX Runtime Web (WebGPU o WASM); el presupuesto de memoria es mas critico que el de computo.
- GPU de servidor (A100, H100, L40S): sobredimensionadas para un modelo de este tamano; solo tendrian sentido para lotes muy grandes, donde el cuello de botella seria el preprocesado de audio, no el modelo.
- Opciones de despliegue: transformers.js (objetivo declarado), ONNX Runtime en Python, Node.js o C++; es posible servirlos desde un CDN propio gracias al esquema `registry`. No se documenta compatibilidad con vLLM, TGI o llama.cpp: son runtimes orientados a modelos de lenguaje y no aplican aqui.
- Latencia y throughput: la unica cifra disponible es 9,9 ms para un forward del decoder fp32 en CPU con 4 tokens y cache inicial (prueba de humo, datos sinteticos). No hay mediciones de tiempo real factor (RTF) ni de palabras por segundo.

## Comparativa con modelos similares

Los datos de la columna de este modelo provienen de la model card; el resto son valores de referencia de la familia Whisper y no han sido verificados en la informacion proporcionada.

| Modelo | Parametros | Ventana de audio | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `skillsafe-ai/whisper-base` | No declarado (upstream Whisper base, aprox. 74 M) | 30 s | Apache 2.0 | ONNX fp32/fp16/q8 | Empaquetado para transformers.js, con procedencia verificable |
| `onnx-community/whisper-base` | Aprox. 74 M (referencia) | 30 s | Apache 2.0 | ONNX | Fuente directa de este repositorio |
| OpenAI Whisper tiny | Aprox. 39 M (referencia) | 30 s | MIT (referencia) | PyTorch, ONNX, GGUF | Mas rapido y menos preciso; util si el presupuesto es minimo |
| OpenAI Whisper small | Aprox. 244 M (referencia) | 30 s | MIT (referencia) | PyTorch, ONNX, GGUF | Mejor calidad de transcripcion a cambio de mas memoria, lo que complica el despliegue en navegador |

Frente a alternativas de la misma categoria (modelos de voz a texto ejecutables en cliente), la ventaja de este paquete es el formato ONNX cuantizado y el esquema de distribucion por CDN; su desventaja es que no incorpora ninguna mejora de precision sobre el Whisper base de OpenAI.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitacion de Whisper base (errores en audio con ruido, acentos marcados, solapamiento de hablantes, terminologia especializada) se hereda integra.
- Riesgo de alucinacion: como todo modelo seq2seq de voz, puede generar texto plausible en tramos de silencio, musica o ruido, e incluso repetir frases. En produccion conviene validar la salida y filtrar segmentos de baja confianza.
- Idiomas: la model card no especifica la lista de idiomas soportados. Antes de usarlo en un idioma concreto hay que verificar el comportamiento del modelo base, ya que la familia Whisper tiene variantes monoidioma (`.en`) y multilingues con calidad desigual.
- Ventana fija de 30 segundos: los audios mas largos requieren segmentacion y ensamblado manual, con riesgo de cortes en mitad de palabra y de perdida de contexto entre segmentos.
- Sesgos: no se documenta ninguna evaluacion de sesgos por acento, genero, edad o variedad dialectal. Es esperable el sesgo hacia el ingles y hacia variedades del habla sobrerrepresentadas en los datos de entrenamiento de Whisper.
- Licencia: Apache 2.0, permite uso comercial y modificacion. Al ser un reempaquetado, conviene conservar la atribucion al upstream y las notas de procedencia. Hay que tener en cuenta que el modelo base de OpenAI Whisper se publico originalmente bajo licencia MIT, con terminos compatibles, pero la model card de este repositorio solo declara Apache 2.0.
- Artefactos servidos desde `models.skillsafe.ai`: los pesos no viajan en el repositorio como `bundle`, sino como `registry`. Para un despliegue en produccion hay que verificar la disponibilidad y el versionado de esa infraestructura, o alojar los ficheros por cuenta propia.
- Ambiguedad en el etiquetado de cuantizacion: `onnx/encoder_model.onnx` aparece clasificado como "fp32, q8" en la tabla de ficheros, sin que se aclare si es un unico grafo valido para ambas precisiones o dos artefactos distintos. Conviene comprobarlo antes de fijar el presupuesto de memoria.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento posterior a la fecha de publicacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de WER ni comparaciones verificables con otras alternativas, por lo que la eleccion frente a otros modelos de la misma categoria debe basarse en pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/whisper-base
- Modelo base (upstream): https://huggingface.co/onnx-community/whisper-base/tree/1846881b6b3a3024392c1eea3ad983695bc23925
- Repositorio del conversor (recetario `recipes/whisper-base.yaml`): https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Modelo original de OpenAI Whisper: https://huggingface.co/openai/whisper-base

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de software de contabilidad y se han descartado por no ser pertinentes.
