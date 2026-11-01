# BNarayanaReddy/duet-models

## Resumen

Duet model packages es un repositorio de distribucion de modelos de reconocimiento de voz en formato ONNX, empaquetados para su uso en Duet, una aplicacion Android desarrollada por Nyquist que ejecuta modelos de habla integramente en el dispositivo. El repositorio no contiene modelos entrenados por su autor: actua como catalogo firmado y almacen de paquetes de modelos upstream (Moonshine en sus variantes tiny y base, y Silero VAD), reempaquetados sin modificaciones salvo el empaquetado. Su relevancia radica en el patron de despliegue: un catalogo con firma Ed25519 que la aplicacion verifica antes de descargar y ejecutar cada paquete, con comprobacion de hash SHA-256 por fichero.

Los modelos subyacentes son de tipo encoder-decoder para reconocimiento automatico de voz (ASR), exportados a ONNX mediante sherpa-onnx, y un detector de actividad de voz (VAD) para segmentar el audio antes de la transcripcion. Todo el procesamiento es local: la aplicacion descarga los paquetes desde este repositorio y no envia audio ni resultados a servidores externos, lo que lo hace adecuado para escenarios con requisitos de privacidad o conectividad intermitente.

El repositorio ocupa 0,6 GB y esta publicado bajo licencia MIT. Solo soporta ingles (`en`) y no dispone de descargas ni interacciones registradas en HuggingFace en el momento de la consulta. No se trata de un modelo generativo de proposito general, sino de un canal de distribucion de artefactos de inferencia para una aplicacion movil concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR (Moonshine v2 tiny/base y Moonshine tiny/base) y detector de actividad de voz (Silero VAD); exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de ASR por utterance, no de contexto textual) |
| Tipos de cuantizacion | Quantized e int8 segun el paquete (`moonshine-v2-*-quantized`, `moonshine-*-int8`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (modelo y repositorio); exportaciones ONNX de sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX, empaquetado con `manifest.json` (ficheros, sha256, licencia, parametros de runtime) y catalogo firmado con Ed25519 |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios. Su contenido son paquetes de modelos upstream de Moonshine (Moonshine AI / Useful Sensors) en variantes tiny y base, tanto en la generacion v2 como en la original, ademas de Silero VAD de snakers4. Moonshine es una familia de modelos de reconocimiento de voz disenada para inferencia en dispositivos con recursos limitados; la model card no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado, por lo que esos datos deben consultarse en los repositorios upstream.

La innovacion tecnica del repositorio es el mecanismo de distribucion y verificacion: `catalog.json` asigna a cada tier de telefono un paquete con porcentajes de rollout, y va acompanado de `catalog.json.sig`, una firma Ed25519 en base64 cuya clave publica esta embebida en la aplicacion. Cada paquete incluye un `manifest.json` con la lista de ficheros, sus hashes SHA-256, la licencia y los parametros de runtime. La aplicacion solo acepta un paquete si el `manifest_sha256` del catalogo firmado coincide con su manifiesto y cada fichero coincide con el hash declarado, lo que protege frente a sustitucion o corrupcion de artefactos.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles mediante Moonshine v2 tiny, Moonshine v2 base, Moonshine tiny y Moonshine base.
- Deteccion de actividad de voz (VAD) con Silero VAD para segmentar audio y evitar transcripciones sobre silencio o ruido.
- Inferencia completamente en el dispositivo (on-device), sin envio de audio a servidores.
- Ejecucion via sherpa-onnx en Android, con paquetes cuantizados (quantized, int8) para reducir huella de memoria.
- Seleccion de paquete por tier de dispositivo mediante el catalogo firmado y sus porcentajes de rollout.
- Verificacion de integridad criptografica de catalogo y ficheros antes de la ejecucion.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento: es un componente de ASR, no un LLM.

## Casos de uso

- Transcripcion de notas de voz en Android: la aplicacion captura audio, lo segmenta con Silero VAD y lo transcribe con un paquete Moonshine tiny o base, todo local, sin coste de API ni exposicion de datos.
- Dictado por voz en aplicaciones de productividad: integracion de sherpa-onnx con el paquete `moonshine-v2-base-en-quantized` para convertir habla en texto en campos de formulario, con latencia baja al no requerir red.
- Subtitulado en tiempo real de contenido hablado en ingles: uso de VAD para delimitar utterances y de un modelo base para mayor precision, desplegado en dispositivos de gama media-alta segun el tier asignado por el catalogo.
- Asistentes de accesibilidad: transcripcion de comandos de voz para usuarios con movilidad reducida, con la garantia de que el audio no sale del telefono.
- Escenarios sin conectividad: aplicaciones de campo, transporte o zonas rurales donde la transcripcion debe funcionar offline con paquetes previamente descargados y verificados.
- Distribucion controlada de modelos en produccion movil: uso del catalogo firmado con rollout porcentual para liberar una nueva version de modelo solo a un subconjunto de dispositivos y validar calidad antes de generalizar.
- Preprocesado de audio para pipelines posteriores: Silero VAD como etapa de filtrado que elimina silencios antes de alimentar un ASR o un sistema de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el despliegue objetivo es CPU en Android, no GPU.
- Memoria en dispositivo: el repositorio completo ocupa 0,6 GB, pero cada paquete se descarga por separado; los paquetes tiny e int8 estan pensados para telefonos de gama baja y los base para gama media-alta segun el tier del catalogo.
- GPU recomendadas: no disponible; el runtime es sherpa-onnx sobre CPU movil.
- Cabe en GPU consumer: no aplica al caso de uso previsto; el formato ONNX permitiria ejecucion en GPU, pero no es el escenario documentado.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para estos artefactos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Duet model packages (este repo) | Paquetes ASR + VAD | en | MIT | ONNX + manifiesto firmado | Distribucion verificada para Android |
| Whisper (OpenAI) | ASR encoder-decoder | Multilingue | MIT | safetensors, GGUF, ONNX | Modelo generico, no empaquetado para movil |
| Vosk | ASR ligero | Multilingue | Apache-2.0 | Kaldi/ONNX | Pensado para dispositivos, sin catalogo firmado |
| sherpa-onnx (upstream) | Runtime + exports | Multilingue | Apache-2.0 | ONNX | Proyecto de inferencia; este repo usa sus exports |

La comparativa se limita a categoria y enfoque: no hay datos publicados de precision ni latencia para este repositorio que permitan una comparacion cuantitativa con Whisper o Vosk.

## Limitaciones y advertencias

- Solo soporta ingles; no hay paquetes para otros idiomas en el catalogo descrito.
- No es un modelo de proposito general: no genera texto libre, no razona y no soporta tool calling.
- La calidad de transcripcion depende del modelo upstream (Moonshine tiny/base) y de la cuantizacion aplicada; los paquetes int8 y quantized pueden degradar la precision frente a los pesos originales.
- No se han publicado metricas de WER, latencia ni consumo energetico en la informacion disponible.
- El repositorio no contiene el codigo de la aplicacion Duet ni la clave publica Ed25519; sin ellos, los paquetes no pueden verificarse con el flujo previsto.
- La licencia MIT del repositorio no sustituye a las licencias upstream: deben respetarse las condiciones de Moonshine (MIT) y Silero VAD (MIT), asi como la atribucion de sherpa-onnx (Apache-2.0).
- Riesgo de alucinacion en ASR: los modelos pueden producir transcripciones plausibles en audio ruidoso o con acentos no representados en el entrenamiento.
- El catalogo con porcentajes de rollout implica que un dispositivo puede recibir una version distinta de modelo; conviene fijar versiones en pruebas de regresion.
- Creado y actualizado en noviembre de 2026 segun los metadatos; sin descargas ni validacion comunitaria registrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BNarayanaReddy/duet-models
- Moonshine (upstream): https://github.com/moonshine-ai/moonshine
- Silero VAD (upstream): https://github.com/snakers4/silero-vad
- sherpa-onnx (exports ONNX): https://github.com/k2-fsa/sherpa-onnx
