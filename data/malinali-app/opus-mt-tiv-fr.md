# malinali-app/opus-mt-tiv-fr

## Resumen

El modelo `malinali-app/opus-mt-tiv-fr` es un sistema de traduccion automatica neuronal especializado en la direccion tiv → frances. Se trata de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-tiv-fr`, el modelo de traduccion del proyecto OPUS-MT desarrollado por el grupo de investigacion Language Technology de la Universidad de Helsinki, con el objetivo de habilitar inferencia local (on-device) en la aplicacion Malinali.

Tecnicamente es un modelo Marian, es decir, un transformer encoder-decoder clasico de traduccion, con 68.172.548 parametros totales (aproximadamente 68 millones). No es un modelo de lenguaje generativo generalista ni incorpora modo de razonamiento, tool calling o capacidades multimodales: su unico proposito es la traduccion de texto tiv a texto frances. El tiv es una lengua nigero-congolesa hablada principalmente en el estado de Benue (Nigeria), con millones de hablantes, y se trata de un idioma de bajos recursos en lo que respecta a tecnologia del lenguaje.

Su relevancia actual es doble: por un lado, cubre un par de idiomas practicamente ausente en los grandes modelos multilingues comerciales; por otro, el autor lo redistribuye en formato safetensors junto con tokenizadores rapidos en JSON adaptados especificamente para Candle (`marian_flutter`), lo que permite ejecutar traduccion sin conexion en dispositivos moviles y equipos sin GPU. El repositorio ocupa 0,3 GB, no registra descargas ni likes en el momento de la consulta y fue creado el 2 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder con atencion) |
| Parametros totales | 68.172.548 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin especificar la precision |
| Idiomas soportados | tiv (origen), fr (destino) |
| Licencia | no disponible (la model card indica que se debe seguir la del modelo upstream, "tipicamente CC-BY 4.0 para OPUS-MT", sin confirmarlo) |
| Formato de pesos | safetensors (`model.safetensors`) + tokenizadores fast en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, la implementacion de traduccion automatica neuronal desarrollada por el grupo de investigación de la Universidad de Helsinki y mantenida dentro del ecosistema OPUS-MT. Se trata de un transformer seq2seq con encoder y decoder, entrenado de forma supervisada sobre corpus paralelos. El modelo aqui publicado es una conversion de los pesos originales a safetensors, no un reentrenamiento: el autor de `malinali-app` indica explicitamente que solo reempaqueta los pesos y convierte los tokenizadores SentencePiece al formato fast tokenizer JSON de Hugging Face, y que no reclama la propiedad del modelo entrenado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus paralelo tiv-frances, ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning adicional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas. El unico elemento diferencial de este repositorio respecto al modelo base es el formato de distribucion: pesos en safetensors mas tokenizadores rapidos separados para encoder y decoder, disenados para ser consumidos por Candle a traves del modulo `marian_flutter`, lo que habilita inferencia nativa en Flutter y en dispositivos sin aceleracion hardware dedicada.

## Capacidades

- Traduccion de texto de tiv a frances, en una unica direccion (tiv → fr). El repositorio no incluye el sentido inverso.
- Generacion de texto de tipo seq2seq orientada exclusivamente a traduccion; no es un modelo conversacional ni de instrucciones.
- Ejecucion on-device mediante Candle y el modulo `marian_flutter`, sin dependencia de servicios en la nube.
- Compatibilidad con la libreria `transformers` (pipeline `translation`) y con endpoints compatibles, segun las etiquetas del repositorio (`endpoints_compatible`).
- Tokenizacion rapida independiente para origen y destino, lo que permite gestionar de forma separada los vocabularios tiv y frances.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas estrictamente al par tiv-frances; no hay evidencia de transferencia a otras lenguas.
- No se documentan capacidades de generacion de codigo ni de matematicas.

## Casos de uso

- Traduccion de documentacion humanitaria y sanitaria: organizaciones que operan en el estado de Benue (Nigeria) pueden traducir materiales de salud publica, agricultura o formacion civica del tiv al frances para su difusion en paises francophone de acogida o para publicaciones bilingues, con un modelo de 68 millones de parametros ejecutable en servidores modestos.
- Aplicaciones moviles sin conexion: gracias a los pesos en safetensors y a los tokenizadores fast pensados para Candle y `marian_flutter`, el modelo puede integrarse en una app Flutter y realizar traducciones en el dispositivo sin acceso a red, algo critico en zonas con conectividad intermitente.
- Atencion al ciudadano en oficinas publicas: un terminal o tableta con el modelo embebido puede ofrecer traduccion tiv-frances en ventanilla para tramites administrativos, sin enviar texto de usuarios a servicios externos y, por tanto, sin exponer datos personales.
- Preservacion linguistica y creacion de corpus: el modelo permite pre-anotar textos en tiv con una traduccion francesa de referencia, que despues puede ser revisada por linguistas para construir corpus paralelos de mayor calidad para futuros entrenamientos.
- Localizacion de contenido web y editorial: sitios de noticias, blogs o plataformas de formacion pueden traducir articulos del tiv al frances mediante un pipeline por lotes, dado el reducido coste computacional por frase del modelo.
- Traduccion por lotes en infraestructura sin GPU: al tratarse de un modelo de 68 millones de parametros, puede desplegarse en un contenedor con CPU exclusivamente para procesar volumenes moderados de texto, por ejemplo en tareas nocturnas de traduccion de archivos.
- Servicio de traduccion autoalojado: mediante la compatibilidad con endpoints, puede exponerse como API interna para otras aplicaciones de la organizacion, evitando cuotas por caracter de los proveedores comerciales.
- Subtitulado y transcripcion de material audiovisual: combinado con un sistema de reconocimiento de voz en tiv, el modelo puede generar subtitulos en frances para videos divulgativos o educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas de traduccion para el par tiv-frances, y tampoco se han encontrado tales datos en la busqueda web realizada. Cualquier cifra de calidad de traduccion para este modelo debe obtenerse mediante evaluacion propia sobre un conjunto de validacion representativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precision habitual. Con 68,17 millones de parametros, los pesos ocupan aproximadamente 272 MB en fp32, unos 136 MB en fp16 y alrededor de 68 MB en int8; el consumo real depende del backend y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. Tambien es viable en GPUs de centro de datos (A100, H100, L4) si se necesita procesar grandes volumenes por lotes.
- Cabe en GPU de consumo: si, de forma holgada, en practicamente cualquier GPU dedicada de los ultimos diez anos e incluso en GPUs integradas.
- Inferencia en CPU: totalmente viable; es el escenario natural de despliegue, incluyendo equipos de escritorio, servidores sin acelerador e incluso dispositivos tipo Raspberry Pi.
- Inferencia en movil: soportada mediante Candle y `marian_flutter` en Flutter, que es el proposito declarado del reempaquetado.
- Opciones de despliegue: `transformers` (pipeline `translation`), servidores compatibles con la API de endpoints, Candle a traves de `marian_flutter`, y conversiones adicionales a otros runtimes (ONNX, llama.cpp) que el usuario realice por su cuenta, ya que no se documentan en el repositorio.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de latencia por frase en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de esta tabla se basan en la informacion del repositorio para el modelo descrito y en caracteristicas publicas ampliamente conocidas de las alternativas; no se han verificado mediante la busqueda web realizada, que no devolvio resultados relevantes.

| Modelo | Parametros | Idiomas | Direccion | Licencia | Formato |
|---|---|---|---|---|---|
| malinali-app/opus-mt-tiv-fr | 68,2 M | tiv, fr | tiv → fr | no disponible (remite a la del modelo base) | safetensors + fast tokenizer JSON |
| Helsinki-NLP/opus-mt-tiv-fr | ~68 M (mismo modelo base) | tiv, fr | tiv → fr | segun model card del upstream | pesos originales del proyecto OPUS-MT |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas | multidireccional | CC-BY-NC-4.0 | safetensors |
| facebook/m2m100_418M | 418 M | 100 idiomas | multidireccional | MIT | safetensors |

Frente a los modelos multilingues masivos, este OPUS-MT ofrece un consumo de recursos entre seis y nueve veces menor, a costa de cubrir un unico par de idiomas y de no disponer de datos publicados de calidad. Su ventaja practica no es la precision bruta, sino la posibilidad de ejecutarse en movil y sin conexion.

## Limitaciones y advertencias

- Direccionalidad unica: solo traduce de tiv a frances. Para el sentido inverso se requiere otro modelo.
- Idiomas de bajos recursos: el tiv dispone de corpus paralelos limitados, por lo que la calidad de traduccion puede ser sensiblemente inferior a la de pares con muchos recursos como ingles-frances.
- Riesgo de alucinacion y de traducciones infieles: como cualquier sistema de traduccion neuronal entrenado con datos limitados, puede producir contenido fluido pero incorrecto, inventar terminos o degradar frases largas. No debe usarse sin revision humana en contextos medicos, legales o administrativos.
- Ausencia total de evaluacion publicada: no hay BLEU, chrF ni COMET en el repositorio, lo que impide estimar su calidad sin una evaluacion propia.
- Licencia sin confirmar: el campo de licencia figura como no disponible y la model card remite a la licencia del modelo upstream sin concretarla. Antes de un uso comercial es imprescindible verificar la licencia real de `Helsinki-NLP/opus-mt-tiv-fr`.
- Contexto limitado: no se documenta la longitud maxima de secuencia soportada. Los modelos Marian suelen trabajar con ventanas relativamente cortas, por lo que los documentos largos deben segmentarse en frases o parrafos.
- Modelo no conversacional: no admite instrucciones, formato de chat ni tool calling. No debe confundirse con un modelo de lenguaje generativo.
- Reempaquetado sin aportacion de entrenamiento: el autor declara no ser propietario del modelo entrenado. Cualquier problema de calidad es atribuible al modelo base, no a esta conversion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion inusuales: el repositorio figura como creado y actualizado el 2 de octubre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-tiv-fr
- Modelo base (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-tiv-fr
- Proyecto OPUS-MT (repositorio GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun enlace relevante al modelo; los resultados obtenidos correspondian a contenidos sin relacion (articulos sobre una pelicula de 2014), por lo que no se incluyen.
