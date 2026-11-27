# darkmaniac7/Qwen3.5-9B-MNN

## Resumen

Qwen3.5-9B-MNN es un paquete de inferencia on-device del modelo Qwen3.5 9B de Alibaba, convertido al formato MNN (Mobile Neural Network) de taobao-mnn y distribuido por TokForge para ejecutarse en telefonos Android. El modelo base es un transformer hibrido de 9.000 millones de parametros que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa, e incorpora un codificador visual para entrada de texto e imagen. Este repositorio concreto cuantiza los pesos a 4 bits (bloque de 64, HQQ) manteniendo los embeddings en bf16, y anade una cabeza opcional de prediccion multi-token (MTP) para decodificacion especulativa en la ruta CPU de MNN.

La relevancia del paquete radica en que permite ejecutar un modelo multimodal de 9B parametros con 262.144 tokens de contexto directamente en un telefono, sin conexion, sobre CPU. TokForge lo cataloga para dispositivos con 12 GB de RAM o mas, y ofrece un pack NPU adicional (Qwen3.5-9B-NPU-catalogpair) para Snapdragon 8 Elite Gen 5 que delega la lectura de prompts largos a la NPU mientras la CPU genera la respuesta. El repositorio ocupa 7,51 GB repartidos en 13 ficheros, con licencia Apache-2.0 heredada del modelo base.

La ficha describe el bundle tal como se publica: los ficheros troncales son identicos byte a byte al original de taobao-mnn (salvo `config.json`, que anade `dynamic_option: 2`), y la unica aportacion propia del autor es la cabeza MTP opcional. Esto implica que las capacidades, el entrenamiento y los benchmarks corresponden al modelo Qwen3.5 9B original, no a un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida: 32 capas (24 Gated DeltaNet de atencion lineal + 8 de atencion completa), con codificador visual |
| Parametros totales | 9B (modelo base); pesos cuantizados a 4 bits en este bundle |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens en el modelo original |
| Tipos de cuantizacion | 4 bits con bloque de 64 y HQQ en los pesos; embeddings en bf16; ruta CPU int8 tileada en MNN con cuantizacion de activaciones por bloque |
| Idiomas soportados | 201 idiomas y dialectos (segun el modelo base); el campo `language` del repo solo indica "multilingual" |
| Licencia | Apache-2.0 |
| Formato de pesos | Bundle MNN: `llm.mnn` (grafo), `llm.mnn.weight` (pesos), `embeddings_bf16.bin`, `visual.mnn` + `visual.mnn.weight`, `mtp-v32k.mnn` + `.weight` + `.vocab`, `tokenizer.txt` |
| Vocabulario | 248.320 tokens |
| Tamano del repo | 7,51 GB (13 ficheros) |
| Libreria de inferencia | MNN (taobao-mnn) |
| Plataforma objetivo | Android (CPU); pack NPU opcional para Snapdragon 8 Elite Gen 5 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5 9B emplea una arquitectura hibrida de 32 capas en la que 24 son capas Gated DeltaNet (atencion lineal con estado recurrente) y 8 son capas de atencion completa. Esta combinacion reduce el coste computacional y de memoria del contexto largo respecto a un transformer puramente atencional, lo que hace viable una ventana de 262.144 tokens en hardware movil. El modelo incorpora ademas un codificador visual para entrada image-text-to-text y un vocabulario de 248.320 tokens, coherente con la cobertura de 201 idiomas y dialectos que declara el autor.

El bundle MNN no reentrena el modelo: es una conversion de los pesos originales de Qwen a un grafo MNN con cuantizacion de 4 bits (bloque 64, HQQ) y embeddings en bf16. La conversion y el merito corresponden al equipo taobao-mnn; el repositorio de darkmaniac7 replica ese tronco sin cambios y anade una cabeza MTP de 237 MB (`mtp-v32k.mnn.weight`) con su vocabulario de 132 KB, pensada para decodificacion especulativa multi-token en la ruta CPU. El unico cambio en `config.json` es `dynamic_option: 2`, que activa cuantizacion de activaciones por bloque en la ruta int8 tileada de MNN para telefonos sin instrucciones Arm i8mm. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo base piensa antes de responder por defecto (modo thinking), segun la model card.
- Entrada multimodal texto + imagen: pipeline `image-text-to-text` con codificador visual incluido en el bundle (`visual.mnn`).
- Cobertura multilingue amplia: 201 idiomas y dialectos declarados para el modelo base.
- Contexto largo: ventana de 262.144 tokens en el modelo original, adecuada para documentos extensos o conversaciones prolongadas.
- Inferencia on-device sin conexion: una vez descargado el bundle, el chat funciona sin red.
- Decodificacion especulativa: cabeza MTP opcional para acelerar la generacion en CPU.
- Aceleracion NPU opcional: con Snapdragon 8 Elite Gen 5 y TokForge 1.3.9.6 o superior, un pack NPU separado procesa los prompts largos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional offline en movil: el bundle permite mantener conversaciones multi-turno sin conexion en telefonos con 12 GB de RAM o mas, usando los 262.144 tokens de contexto del modelo base para conservar historial largo.
- Analisis de imagenes en el dispositivo: gracias al codificador visual incluido, se pueden enviar fotos junto a preguntas de texto (por ejemplo, lectura de documentos o descripcion de escenas) sin subir datos a un servidor.
- Procesamiento de documentos largos en local: la ventana de contexto del modelo base permite resumir o consultar contratos, articulos o transcripciones extensas directamente en el telefono.
- Traduccion y asistencia multilingue: la cobertura de 201 idiomas del modelo base lo hace util para traduccion y redaccion en dispositivos de usuarios con distintos idiomas.
- Prototipado de aplicaciones moviles con MNN: desarrolladores que integren la libreria MNN pueden usar este bundle como referencia de conversion de un modelo Qwen3.5 9B a 4 bits con embeddings bf16.
- Evaluacion de decodificacion especulativa en edge: la cabeza MTP opcional permite medir la ganancia de la prediccion multi-token en CPU movil frente a la generacion autoregresiva estandar.
- Aceleracion con NPU en hardware de gama alta: en Snapdragon 8 Elite Gen 5 con 24 GB de RAM, el pack NPU complementario reduce la latencia de lectura de prompts largos manteniendo la generacion en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM del dispositivo: 12 GB o mas para el bundle principal, segun el catalogo de TokForge.
- Pack NPU opcional: requiere unos 6,6 GB adicionales de memoria mientras el modelo esta cargado, lo que en la practica exige un telefono de 24 GB.
- SoC compatible con el pack NPU: Snapdragon 8 Elite Gen 5 con TokForge 1.3.9.6 o superior.
- Ruta de ejecucion por defecto: CPU del telefono Android; MNN selecciona la ruta int8 tileada con cuantizacion de activaciones por bloque en telefonos sin instrucciones Arm i8mm.
- Tamano de descarga: 7,51 GB en 13 ficheros.
- GPUs de escritorio (A100, H100, RTX 4090): no disponible; el bundle esta orientado a MNN en Android y no se documenta su ejecucion en GPU de servidor.
- Opciones de despliegue: aplicacion TokForge (Google Play en Android, TestFlight en iOS) o la libreria MNN directamente.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-MNN (este repo) | 9B, 4 bits HQQ | 262.144 tokens | Bundle MNN para Android CPU, con MTP opcional | Apache-2.0 | Mirror de taobao-mnn con cabeza MTP anadida |
| taobao-mnn/Qwen3.5-9B-MNN | 9B, 4 bits HQQ | 262.144 tokens | Bundle MNN para Android CPU | Apache-2.0 (segun el repo espejo) | Conversion original de taobao-mnn, sin MTP |
| Qwen/Qwen3.5-9B | 9B | 262.144 tokens | Pesos originales (formato no detallado en la informacion) | Apache-2.0 | Modelo base de Alibaba, multimodal |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: replica el bundle de taobao-mnn sin cambios en el tronco; cualquier limitacion del modelo base Qwen3.5 9B se hereda integra.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica en la informacion disponible; aplican las limitaciones habituales de un modelo de 9B.
- Sesgos: no se detallan sesgos conocidos en la model card; la cobertura de 201 idiomas no garantiza calidad uniforme en todos ellos.
- Restriccion de plataforma: el bundle esta pensado para MNN en Android; no se documenta su uso en servidores, GPUs de escritorio ni otros runtimes.
- Requisito de memoria elevado para movil: 12 GB de RAM minimo y 24 GB en la practica si se usa el pack NPU, lo que excluye a la mayoria de telefonos del mercado.
- El ajuste `dynamic_option: 2` en `config.json` altera el comportamiento de la ruta int8 de MNN; quien ejecute el bundle con MNN por su cuenta debe tenerlo en cuenta.
- La cabeza MTP es opcional y solo se usa en la ruta CPU de TokForge; su ganancia real de latencia no esta cuantificada en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar la atribucion al equipo taobao-mnn por la conversion y al equipo Qwen por el modelo.
- No hay datos publicados de benchmarks, latencia ni throughput que permitan validar el rendimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/Qwen3.5-9B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Conversion original de taobao-mnn: https://huggingface.co/taobao-mnn/Qwen3.5-9B-MNN
- Pack NPU complementario: https://huggingface.co/darkmaniac7/Qwen3.5-9B-NPU-catalogpair
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- TokForge en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TokForge en iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Chat Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-chat-models-mnn-69cdcddc86ea126668a5e9e8
- Coleccion TokForge Qwen Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-qwen-models-mnn-69cc8b98317551109a7ae907
- Coleccion TokForge Vision Models: https://huggingface.co/collections/darkmaniac7/tokforge-vision-models-6af3fdd73fff746c25bdd4fd
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
