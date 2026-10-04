# jfan/gemma-4-26b-web-mtp-vision-litert-lm

## Resumen

jfan/gemma-4-26b-web-mtp-vision-litert-lm es un repositorio de pesos cuantizados de un modelo multimodal de la familia Gemma 4, con 26 000 millones de parametros, publicado por el usuario de Hugging Face "jfan". El paquete esta empaquetado en formato `.litertlm` y esta pensado para ejecutarse con LiteRT-LM Web sobre WebGPU, es decir, dentro del navegador y en el propio dispositivo del usuario. El autor no indica si se trata de una conversion oficial de Google ni publica detalles sobre el proceso de cuantizacion aplicado.

El elemento diferenciador del repositorio es la combinacion de tres capacidades poco habituales en un mismo bundle: decodificacion especulativa mediante Neural Multi-Token Prediction (MTP, modulo `gpu_artisan`), vision multimodal con presupuestos de tokens variables, y audio multimodal con un encoder Conformer. Todo ello orientado a inferencia local en navegador.

El repositorio ocupa 63,8 GB e incluye cuatro variantes con distinto grado de multimodalidad. No se publican resultados de benchmarks, longitud de contexto, idiomas soportados ni licencia distinta de la licencia Gemma. Es, por tanto, un artefacto de despliegue mas que una ficha tecnica completa del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con decodificacion especulativa Neural Multi-Token Prediction (MTP); encoders multimodales: encoder de vision + adaptador de vision, encoder de audio Conformer + adaptador de audio (segun la model card) |
| Parametros totales | 26 000 millones (26B), segun la denominacion del autor; no se publica desglose por componente |
| Parametros activos | No disponible (el autor no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor solo indica que son bundles cuantizados en formato `.litertlm`, sin especificar esquema ni bits |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia del repositorio: `gemma`) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La model card describe la estructura del bundle, no el entrenamiento. El componente principal es un decoder de texto de 26B al que se anade un modulo de Neural Multi-Token Prediction (MTP) bajo la etiqueta `gpu_artisan`, que actua como cabecera de prediccion multiple de tokens para decodificacion especulativa: se proponen varios tokens por paso y el decoder los verifica, reduciendo el numero de pasos de decodificacion. El autor no detalla el numero de tokens que predice el modulo MTP ni la tasa de aceptacion esperada.

Para la parte multimodal se incluyen dos ramas separadas. La de vision combina un `vision_encoder`, un `vision_adapter` y un token especial `end_of_vision`, con presupuestos de tokens variables de 70, 140, 280, 560 o 1120 tokens, lo que permite intercambiar resolucion efectiva por coste de computo. La rama de audio usa un `audio_encoder_hw` basado en Conformer, un `audio_adapter` y un token `end_of_audio`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos corresponderian a la ficha del modelo Gemma 4 original, no a este repositorio de conversion.

## Capacidades

- Generacion de texto conversacional, presumiblemente en modo instruccion (la nomenclatura de los ficheros incluye el sufijo `-it`).
- Decodificacion especulativa con Neural Multi-Token Prediction, orientada a reducir latencia en WebGPU.
- Comprension de imagenes mediante `vision_encoder` + `vision_adapter`, con cinco presupuestos de tokens configurables: 70, 140, 280, 560 y 1120.
- Procesamiento de audio mediante encoder Conformer, con `audio_adapter` y token `end_of_audio`.
- Cuatro configuraciones de capacidad: solo texto, texto + vision, texto + audio, y texto + vision + audio.
- Ejecucion en navegador sobre WebGPU a traves de LiteRT-LM Web.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal integrado en una aplicacion web: el bundle `-vision-audio` permite construir una interfaz de chat que acepta texto, imagenes y audio sin enviar datos a un servidor, ya que la inferencia ocurre en el navegador mediante WebGPU.
- Accesibilidad en el navegador: transcripcion y comprension de audio con el encoder Conformer para generar subtitulos o resumenes de contenido hablado en el propio dispositivo.
- Analisis de capturas y documentos en cliente: la rama de vision puede procesar imagenes pegadas o subidas por el usuario, y los presupuestos de 70 o 140 tokens permiten abaratar el coste cuando solo se necesita una descripcion gruesa.
- Analisis fino de documentos densos: con el presupuesto de 1120 tokens de vision se puede pedir al modelo que lea tablas, formularios o diagramas con mayor detalle, a costa de mas computo por imagen.
- Demos y prototipos sin infraestructura de servidor: al no requerir backend, el bundle simplifica el despliegue de pruebas de concepto de IA multimodal para equipos que no quieren aprovisionar GPU en la nube.
- Procesamiento con requisitos de privacidad: escenarios en los que la imagen o el audio no pueden salir del dispositivo del usuario (contenido medico, legal o corporativo interno) se benefician de la ejecucion local en WebGPU.
- Reduccion de latencia percibida en UI conversacional: la decodificacion especulativa con MTP apunta a generar varios tokens por paso, lo que resulta util cuando el usuario espera respuesta en tiempo real en el navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se proporcionan metricas de velocidad de decodificacion, tasa de aceptacion del modulo MTP ni throughput en WebGPU.

## Requisitos de hardware

- Tamano del repositorio completo: 63,8 GB, repartido entre las cuatro variantes. No se publica el peso individual de cada fichero `.litertlm`.
- VRAM necesaria para inferencia: no disponible. No se especifica el esquema de cuantizacion, por lo que no puede calcularse con precision.
- Estimacion orientativa no confirmada por el autor: un modelo de 26B en cuantizacion de 4 bits suele requerir del orden de 13-16 GB de memoria para los pesos, mas el coste adicional de los encoders de vision y audio y de la cache KV, que depende de la longitud de contexto (no publicada).
- GPU recomendadas: no disponible. El destino declarado es WebGPU, por lo que el modelo se ejecutaria sobre la GPU disponible en el equipo del usuario a traves del navegador.
- Viabilidad en GPU de consumo: no confirmada. Por el tamano del modelo, es probable que requiera GPU de gama alta con 16-24 GB de memoria (por ejemplo, RTX 4080/4090 o superiores) si la cuantizacion es de 4 bits; en tarjetas con menos memoria probablemente no quepa. Dato no verificado por el autor.
- Opciones de despliegue: LiteRT-LM Web sobre WebGPU, segun la model card. No se anuncia soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.litertlm` no es directamente compatible con esos runners.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada, ni de especificaciones verificables de modelos alternativos de la misma categoria dentro de este contexto. A modo de referencia interna, el propio repositorio ofrece cuatro variantes que se pueden comparar entre si:

| Variante | Texto + MTP | Vision | Audio |
|---|---|---|---|
| `gemma-4-26B-it-web-mtp.litertlm` | Si | No | No |
| `gemma-4-26B-it-web-mtp-vision.litertlm` | Si | Si | No |
| `gemma-4-26B-it-web-mtp-audio.litertlm` | Si | No | Si |
| `gemma-4-26B-it-web-mtp-vision-audio.litertlm` | Si | Si | Si |

Comparativa con modelos de terceros (parametros, contexto, rendimiento, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- No se ha publicado la longitud de contexto soportada, dato critico para dimensionar la memoria y para decidir si el modelo sirve para tareas de contexto largo.
- No se especifican los idiomas soportados; la calidad en castellano no puede garantizarse sin evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos del orden de 26B; no se han publicado evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no disponibles. Al derivar de la familia Gemma, heredaria los sesgos del modelo base, pero el autor no documenta ninguna evaluacion al respecto.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma y a su politica de usos prohibidos; conviene revisarlos antes de integrar el modelo en un producto. El autor no anade condiciones adicionales, pero tampoco ofrece garantias.
- El repositorio tiene 0 descargas y 0 "likes", y fue creado y actualizado el mismo dia (4 de octubre de 2026), por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- No se documenta el proceso de cuantizacion ni la perdida de calidad asociada; sin esa informacion no puede estimarse la degradacion respecto al modelo original.
- La ejecucion depende de WebGPU, lo que limita el soporte a navegadores y sistemas operativos que la implementen de forma estable.
- El modulo MTP de decodificacion especulativa puede degradar el rendimiento si la tasa de aceptacion es baja; el autor no publica esa metrica.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/jfan/gemma-4-26b-web-mtp-vision-litert-lm
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces a Fortnite Tracker, sin relacion con la ficha).
