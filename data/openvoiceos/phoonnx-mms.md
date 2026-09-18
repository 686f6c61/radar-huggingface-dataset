# OpenVoiceOS/phoonnx-mms

## Resumen

OpenVoiceOS/phoonnx-mms es una coleccion de voces de sintesis de voz (text-to-speech) construida a partir de los modelos **MMS-TTS** de Meta y publicada como espejo y conversion para el motor [phoonnx](https://github.com/TigreGotico/phoonnx). No es un modelo unico, sino un repositorio que agrupa aproximadamente 1100 voces independientes, cada una en su propia subcarpeta con un `model.onnx`, un `config.json` nativo y su tokenizer. La arquitectura subyacente es **VITS**, un sistema TTS end-to-end no autorregresivo, y la fonemizacion se basa en grafemas y en la representacion *uroman* del pipeline de MMS, lo que permite cubrir lenguas sin ortografia estandarizada.

El modelo resuelve un problema muy concreto: disponer de voces TTS multilingues en formato ONNX, ejecutables en CPU, para integrarlas en asistentes de voz y aplicaciones de sintesis sin depender de frameworks Python pesados. Es relevante ahora porque el ecosistema OpenVoiceOS lo utiliza como catalogo de voces para asistentes de voz autoalojados, y porque la cobertura de mas de 1100 idiomas supera ampliamente a la mayoria de alternativas comerciales o abiertas, que rara vez pasan de unas decenas de idiomas.

La limitacion principal es la licencia: aunque el repositorio declara `license: other`, la model card especifica **cc-by-nc-4.0** heredada de MMS-TTS, lo que restringe el uso comercial. El repositorio completo ocupa 131,8 GB y registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que se trata de un artefacto de infraestructura mas que de un modelo con traccion de comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning, TTS end-to-end) exportado a ONNX |
| Parametros totales | No disponible por voz; el repositorio agrupa aproximadamente 1100 voces independientes y no se declara el numero de parametros de cada una |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un modelo TTS sin ventana de contexto; la entrada es texto y la salida es una forma de onda de audio |
| Tipos de cuantizacion | Pesos ONNX; la ficha no documenta variantes cuantizadas (int8, fp16) ni scripts de cuantizacion |
| Idiomas soportados | Aproximadamente 1100+ idiomas segun la model card; el campo de idiomas del repositorio no esta poblado |
| Licencia | `other` en los metadatos del repositorio; cc-by-nc-4.0 segun la model card (heredada de MMS-TTS) |
| Formato de pesos | ONNX (`model.onnx`) + `config.json` nativo + tokenizer, una voz por subcarpeta |
| Tamano del repositorio | 131,8 GB |
| Libreria declarada | phoonnx |
| Pipeline | text-to-speech |
| Fecha de creacion | 2026-06-05 (segun los metadatos de HuggingFace) |
| Ultima actualizacion | 2026-09-17 (segun los metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada voz del repositorio es un modelo **VITS**: un sistema TTS end-to-end que combina un encoder posterior, un flujo normalizador, un predictor de duracion y un decoder generativo tipo HiFi-GAN entrenado con aprendizaje adversarial condicionado. Al ser no autorregenerativo, la sintesis se produce en una sola pasada, lo que reduce la latencia frente a arquitecturas autoregresivas tipo Tacotron. La exportacion a ONNX permite ejecutar la inferencia sin PyTorch en tiempo de ejecucion, mediante ONNX Runtime o el propio motor phoonnx.

En cuanto a los datos de entrenamiento, la model card no especifica corpus, numero de horas de audio, ni si hubo etapas de ajuste fino adicionales. El repositorio se declara explicitamente como espejo y conversion de [facebook/mms-tts](https://huggingface.co/facebook/mms-tts) y de ajustes finos comunitarios de MMS, por lo que los detalles de entrenamiento corresponden al proyecto upstream de Meta y no se documentan aqui. La innovacion tecnica destacable en este paquete no es el entrenamiento, sino la **fonemizacion basada en grafemas y uroman** del pipeline MMS, que evita depender de lexicos foneticos especificos por idioma y habilita la cobertura de lenguas con recursos limitados o sin convenciones ortograficas consolidadas. La integracion se realiza a traves del indice de voces de phoonnx, con `engine: transformers` declarado en la carga.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en aproximadamente 1100+ idiomas, con una voz independiente por idioma o variante.
- Fonemizacion basada en grafemas y uroman, sin necesidad de diccionarios foneticos especificos por lengua.
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- Integracion en el ecosistema OpenVoiceOS y en el motor phoonnx a traves del indice de voces.
- Salida de audio mono, voz unica por modelo (no hay seleccion de hablante dentro de una misma voz).
- No dispone de *tool calling*, *function calling*, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo *thinking*, vision, audio de entrada ni clonacion de voz.
- No se documentan parametros de control expresivo (emocion, velocidad, tono) en la ficha.

## Casos de uso

- Asistentes de voz autoalojados: integracion como capa TTS en un asistente tipo OpenVoiceOS o Mycroft, cargando la voz del idioma del usuario desde el indice de phoonnx y ejecutando la inferencia en CPU del propio dispositivo.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos, articulos y notificaciones, con la ventaja de disponer de voces para idiomas minoritarios que las APIs comerciales no cubren.
- Preservacion y revitalizacion de lenguas de bajos recursos: generacion de audio en idiomas con pocos hablantes y escasa representacion en herramientas TTS comerciales, aprovechando la cobertura de mas de 1100 lenguas de MMS.
- Generacion por lotes de contenido de audio: produccion offline de locuciones para cursos, materiales educativos o audioguias, sin coste por caracter y sin dependencia de servicios en la nube.
- Sistemas de telefonia e IVR: locuciones dinamicas para menus y respuestas automaticas en entornos sin conectividad o con requisitos de privacidad que impiden enviar texto a terceros.
- Despliegue en dispositivos de borde: ejecucion en Raspberry Pi o mini-PC sin GPU, cargando unicamente las voces necesarias en lugar del repositorio completo de 131,8 GB.
- Investigacion en sintesis de voz multilingue: uso de las voces como linea base o como referencia para comparar calidad entre idiomas y para experimentos de adaptacion a nuevos dominios.
- Lectura de contenido dinamico en aplicaciones: integracion en webs, lectores RSS o terminales mediante ONNX Runtime, con carga bajo demanda de la voz requerida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, CMOS, WER de transcripcion inversa) ni comparaciones cuantitativas con otros sistemas TTS. Tampoco se documentan mediciones de latencia o de factor de tiempo real (RTF).

## Requisitos de hardware

- VRAM para inferencia: no aplica en el caso base, ya que el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime. Si se ejecuta en GPU, el consumo por voz es reducido.
- Tamano por voz: a partir del tamano del repositorio (131,8 GB) y de la cobertura declarada (aproximadamente 1100 voces), se puede estimar un promedio de unos 120 MB por voz en disco. Es una estimacion derivada de los datos del repositorio, no una cifra confirmada por el autor.
- Memoria RAM: se estima un consumo del orden de unos cientos de MB por proceso de inferencia, incluyendo el runtime de ONNX y la voz cargada. No confirmado por el autor.
- GPU recomendadas: no se especifican. Al ser un modelo ONNX de tipo VITS, no requiere A100 ni H100; cualquier GPU consumer con soporte de ONNX Runtime CUDA serviria como aceleracion opcional. La ejecucion en CPU es la via principal.
- Compatibilidad con GPU consumer: si, y en la practica no es necesario; cabe sobradamente en cualquier equipo, incluidos dispositivos ARM.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), el motor phoonnx con `engine: transformers`, y cualquier runtime compatible con ONNX. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La arquitectura VITS es no autorregresiva, lo que en general favorece latencias bajas, pero no hay cifras publicadas para este paquete concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVoiceOS/phoonnx-mms | VITS exportado a ONNX, coleccion de voces | Aproximadamente 1100+ | ONNX | cc-by-nc-4.0 (segun model card) | Espejo de MMS-TTS para el motor phoonnx; 131,8 GB de repositorio |
| facebook/mms-tts | VITS (modelo upstream) | Aproximadamente 1100+ | PyTorch (checkpoints originales) | cc-by-nc-4.0 | Fuente original de las voces; requiere el stack de Transformers |
| rhasspy/piper-voices | VITS exportado a ONNX | Decenas de idiomas | ONNX | MIT | Alternativa orientada a uso comercial y a dispositivos de borde; cobertura linguistica mucho menor |
| Coqui XTTS-v2 | TTS multilingue con clonacion de voz | 17 | PyTorch | Coqui Public Model License (no comercial) | Permite clonacion de voz, pero con cobertura de idiomas muy inferior |

Las cifras de idiomas y licencias de los modelos comparados corresponden a informacion publica general de esos proyectos; la informacion proporcionada en esta busqueda no incluye tablas comparativas oficiales. No se dispone de datos de rendimiento que permitan una comparacion cuantitativa de calidad de sintesis.

## Limitaciones y advertencias

- Licencia no comercial: la model card indica cc-by-nc-4.0, heredada de MMS-TTS. El uso comercial del audio generado o del modelo requiere verificar los terminos con los titulares de los derechos; los metadatos del repositorio solo indican `other`.
- Repositorio de 131,8 GB: descargar la coleccion completa es costoso en almacenamiento; en la practica conviene descargar solo las voces necesarias.
- Una voz por subcarpeta: no hay un modelo unico con seleccion de hablante. Cambiar de idioma implica cargar otro modelo.
- Sin control expresivo: no se documentan parametros de emocion, estilo ni prosodia mas alla de los propios del modelo VITS.
- Sin clonacion de voz: cada voz esta asociada a un hablante fijo del corpus de entrenamiento.
- Calidad desigual entre idiomas: al cubrir mas de 1100 lenguas, es esperable una variabilidad considerable en naturalidad y pronunciacion, especialmente en lenguas con pocos datos. No se han publicado metricas que permitan cuantificarla.
- Fonemizacion basada en grafemas y uroman: la pronunciacion depende de la correspondencia grafema-fonema del idioma; en lenguas con ortografia irregular pueden aparecer errores de pronunciacion.
- Riesgo de artefactos acusticos: como en cualquier modelo generativo de audio, pueden aparecer ruidos, cortes o inestabilidades en entradas muy largas o con caracteres fuera del vocabulario del tokenizer.
- Sin datos de evaluacion: no hay benchmarks publicados, ni mediciones de latencia, ni informes de sesgo o de comportamiento por idioma.
- Traccion nula en el repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas no declarados en los metadatos: el campo de idiomas del repositorio esta vacio, por lo que la cobertura real debe verificarse listando las subcarpetas.
- Fechas de creacion y actualizacion inusuales: los metadatos indican 2026-06-05 y 2026-09-17; se reproducen tal cual figuran en HuggingFace, sin verificacion adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenVoiceOS/phoonnx-mms
- Modelo upstream de las voces: https://huggingface.co/facebook/mms-tts
- Motor phoonnx: https://github.com/TigreGotico/phoonnx
- Coleccion phoonnx community mirror: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
- Referencia de la arquitectura VITS (paper): https://arxiv.org/abs/2106.06103
- Referencia del proyecto MMS de Meta (paper): https://arxiv.org/abs/2305.13516

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces anteriores proceden de la model card y de las referencias de los proyectos upstream.
