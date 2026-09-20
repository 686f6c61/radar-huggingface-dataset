# raratu/Onsei-iOS-Models

## Resumen

Onsei-iOS-Models es un repositorio de artefactos de ejecución publicados por el usuario raratu para el cliente iOS "Onsei". No se trata de pesos nuevos ni de un modelo entrenado por el autor, sino de exportaciones a ONNX y Core ML de varios modelos de síntesis de voz (TTS) en japonés desarrollados por Aratako bajo la familia Irodori-TTS, junto con el códec de audio Semantic-DACVAE-Japanese-32dim y el tokenizador de llm-jp-3-150m. El repositorio tiene 8,6 GB y agrupa tres packs: `v4.1-small/`, `500m-v3/` y `600m-v3-vd/`.

El problema que resuelve es la ejecución de TTS japonés de calidad directamente en el dispositivo (on-device), sin depender de servicios en la nube, algo relevante para aplicaciones móviles con requisitos de privacidad, latencia o disponibilidad sin conexión. Los modelos subyacentes usan una arquitectura de flow matching con control de estilo, un codificador de texto ModernBERT-ja-310m, un predictor de duración y un códec DACVAE para la parte acústica.

La relevancia actual del repositorio es de tipo práctico e ingenieril: demuestra un pipeline de conversión y despliegue de TTS con decodificador Core ML float32 verificado, partición de la inferencia en `context_kv.onnx` y `dit_step.onnx`, y verificación de integridad mediante manifiesto con digests SHA-256. Con solo 22 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de nicho orientado a una aplicación concreta, no de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre transformer de difusion (DiT) para TTS, con codificador de texto ModernBERT-ja-310m, codificador de hablante, predictor de duracion y codec neuronal DACVAE (encode/decode) |
| Parametros totales | No disponible de forma explicita; los nombres de los packs sugieren aproximadamente 500 M para `500m-v3` y 600 M para `600m-v3-vd`. El tamano de `v4.1-small` no se especifica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; no disponible la longitud maxima de texto o audio soportada |
| Tipos de cuantizacion | No disponible para los artefactos ONNX; el decodificador nativo Core ML de `v4.1-small/native_decoder/` es float32 |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT para los pesos Irodori-TTS, adaptaciones japonesas de Semantic-DACVAE, codificador/tokenizador ModernBERT-ja-310m y codigo de conversion. Componentes de terceros: DACVAE de Meta bajo Apache 2.0, Descript DAC bajo MIT, tokenizador legacy llm-jp bajo Apache 2.0 |
| Formato de pesos | ONNX (grafos divididos en `context_kv.onnx` y `dit_step.onnx`), Core ML (`native_decoder/`, float32), configuracion JSON, `manifest.json` con tamanos y SHA-256, y datos de tokenizador |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio: son artefactos de conversion a partir de modelos de Aratako. La arquitectura subyacente es Irodori-TTS, descrita por su autor como un modelo de TTS basado en flow matching con control de estilo dirigido por emojis (referencia bibliografica: "Irodori-TTS: A Flow Matching-based Text-to-Speech Model with Emoji-driven Style Control", Chihiro Arata, 2026). La ruta de inferencia se divide en dos grafos ONNX, `context_kv.onnx` y `dit_step.onnx`, complementados por codificadores de hablante y de texto, el codificador/decodificador DACVAE y un predictor de duracion (en v4.1 con una version mejorada).

Cada pack incluye todo lo necesario para la ejecucion en la app: codificacion y decodificacion DACVAE, codificadores de hablante y texto, prediccion de duracion, configuracion, datos de tokenizador y un `manifest.json` con tamanos de archivo y digests SHA-256 para verificar las descargas. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que esta ficha se limita a la informacion del repositorio de conversion.

Una innovacion tecnica destacable de este repositorio es el decodificador nativo Core ML (`v4.1-small/native_decoder/`, float32 verificado): la aplicacion descarga el decodificador junto al pack ONNX, comprueba cada archivo por SHA-256, mide en el dispositivo la velocidad de CPU y GPU y la paridad numerica, y selecciona el decodificador mas rapido, manteniendo la CPU como respaldo. En el pack `v4.1-small`, `text_encoder.onnx` contiene el backbone ModernBERT compartido con salidas `text_state` y `caption_state`, de modo que la app reutiliza una sola sesion para ambas entradas y no necesita un `caption_encoder.onnx` separado.

## Capacidades

- Sintesis de voz (TTS) en japones con salida de audio a partir de texto.
- Clonacion de voz por audio de referencia en los packs `v4.1-small/` y `500m-v3/`, sujeta a consentimiento explicito segun las condiciones de uso responsable.
- VoiceDesign con condicionamiento por caption (`600m-v3-vd/`), que permite describir la voz deseada en lugar de aportar una muestra.
- Control de estilo integrado en el modelo Irodori-TTS subyacente (el titulo de la publicacion menciona control de estilo dirigido por emojis).
- Prediccion de duracion mejorada en la version v4.1, orientada a una prosodia mas controlada.
- Ejecucion on-device en iOS mediante Core ML, con ruta ONNX y decodificador nativo con seleccion automatica de CPU o GPU.
- Verificacion de integridad de los artefactos descargados mediante SHA-256 y `manifest.json`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla de la referencia de voz para clonacion, ni capacidades multilingues: el unico idioma declarado es el japones.

## Casos de uso

- Sintesis de voz japonesa sin conexion en aplicaciones iOS: el pack `500m-v3/` permite generar audio localmente, evitando enviar texto del usuario a servidores externos y reduciendo la dependencia de red.
- Lectura en voz alta de articulos y libros en japones: los tres packs generan audio a partir de texto plano, y el predictor de duracion de v4.1 ayuda a mantener un ritmo natural en pasajes largos.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de pantalla, el modelo convierte texto de la interfaz en voz japonesa en el propio dispositivo, sin coste por peticion ni latencia de red.
- Asistentes de voz con privacidad reforzada: al ejecutarse en local, la informacion dictada o leida por el usuario no sale del dispositivo, lo que simplifica el cumplimiento de normativas de datos.
- Prototipado de personajes y voces para videojuegos o aplicaciones de entretenimiento: el pack `600m-v3-vd/` permite definir una voz mediante una descripcion textual, agilizando la exploracion de variantes sin grabar muestras.
- Doblaje y localizacion de contenido a japones: con una muestra de referencia y consentimiento del hablante, el modelo puede generar locuciones consistentes para clips o tutoriales.
- Generacion de audios de prueba en pipelines de QA: los desarrolladores pueden sintetizar frases fijas para validar la interfaz de audio de una aplicacion sin depender de un estudio de grabacion.
- Investigacion sobre TTS en el borde (edge): al estar publicados los grafos ONNX divididos y el decodificador Core ML, sirve como material de estudio sobre particion de inferencia y paridad numerica entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio unicamente menciona una comprobacion de paridad numerica y de velocidad CPU/GPU realizada en el dispositivo para seleccionar el decodificador de `v4.1-small/`; no se aportan cifras concretas de latencia, factor de tiempo real, MOS ni metricas objetivas de calidad de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa a partir del numero de parametros nombrado en los packs, un modelo de aproximadamente 500 M en float32 ocuparia del orden de 2 GB y en float16 del orden de 1 GB; uno de 600 M, del orden de 2,4 GB en float32 y 1,2 GB en float16. Estas cifras son estimaciones, no datos publicados, y no incluyen el coste del codec DACVAE ni de los demas componentes del pack.
- GPU recomendadas: el caso de uso objetivo es movil; la ejecucion se apoya en Core ML sobre la GPU o la Neural Engine del dispositivo Apple y en la CPU como respaldo. No se especifican modelos de GPU de escritorio ni de centro de datos en la documentacion disponible.
- Compatibilidad con GPU de consumo: no aplica al diseno principal, orientado a iOS on-device. No hay datos sobre ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Core ML en iOS a traves del cliente Onsei y ONNX Runtime para los grafos `context_kv.onnx` y `dit_step.onnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles. El unico dato relacionado es que la aplicacion mide el rendimiento de CPU y GPU en el dispositivo y elige el decodificador mas rapido.
- Requisito de cliente: el pack `v4.1-small/` requiere un cliente iOS compatible con v4.1; los tags `ios-v1` e `ios-v2` permanecen sin cambios.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos externos comparables (parametros, contexto, benchmarks o licencias de alternativas). La comparacion posible se limita a los tres packs incluidos en el propio repositorio:

| Pack | Funcion principal | Encoder de caption | Predictor de duracion | Decodificador nativo |
|---|---|---|---|---|
| `v4.1-small/` | TTS japones unificado, clonacion por referencia y VoiceDesign | Si (salida `caption_state` en `text_encoder.onnx`) | Version mejorada v4.1 | Si, Core ML float32 en `native_decoder/` |
| `500m-v3/` | TTS japones estandar y clonacion de voz por audio de referencia | No | No especificado | No especificado |
| `600m-v3-vd/` | VoiceDesign con condicionamiento por caption | Si | No especificado | No especificado |

## Limitaciones y advertencias

- Solo soporta japones; no hay capacidades multilingues declaradas.
- El repositorio contiene artefactos de conversion, no pesos originales; no esta afiliado ni respaldado por los autores de los modelos de origen.
- No se publican benchmarks, metricas objetivas ni evaluaciones de calidad, latencia o robustez, por lo que la idoneidad en produccion debe validarse por cuenta del integrador.
- El export ONNX no incorpora marca de agua SilentCipher, segun indica la propia model card, lo que dificulta la trazabilidad de audio sintetico.
- Riesgo de uso indebido para clonacion de voz sin consentimiento, suplantacion o deepfakes; la model card exige consentimiento explicito y proscribe el audio enganoso.
- La salida generada solo a partir de texto puede parecerse casualmente a una voz real, sin que exista intencion de imitacion.
- La licencia del repositorio es MIT, pero cada componente conserva su propia licencia (Apache 2.0 para DACVAE de Meta y para el tokenizador legacy llm-jp, MIT para Descript DAC); no se implica relicencia alguna. Es responsabilidad del usuario revisar `LICENSES/` y `THIRD_PARTY_NOTICES.md`.
- Dependencia de un cliente iOS concreto: el pack `v4.1-small/` requiere un cliente compatible con v4.1, lo que limita su reutilizacion fuera de ese ecosistema.
- Riesgo de alucinacion en el sentido habitual de los modelos de lenguaje: no aplica directamente a un modelo de sintesis de voz, pero si existe riesgo de prosodia incorrecta, mala pronunciacion o artefactos acusticos en entradas atipicas. No se aportan datos al respecto.
- Adopcion muy baja (22 descargas, 0 likes), sin validacion comunitaria documentada.
- No se especifican sesgos conocidos ni datos demograficos del entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/raratu/Onsei-iOS-Models
- Aratako/Irodori-TTS-v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small (revision `2b28324dc263ed5e6638b3cf3dd94c82ead07b4b`)
- Aratako/Irodori-TTS-500M-v3: https://huggingface.co/Aratako/Irodori-TTS-500M-v3 (revision `236c1e56591279fc24e3c1bf6609fc06e48dde28`)
- Aratako/Irodori-TTS-600M-v3-VoiceDesign: https://huggingface.co/Aratako/Irodori-TTS-600M-v3-VoiceDesign (revision `e863a3a93e652e09afeff3e84823a206a0a60314`)
- Aratako/Semantic-DACVAE-Japanese-32dim: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Tokenizador de llm-jp/llm-jp-3-150m: https://huggingface.co/llm-jp/llm-jp-3-150m
- Cita del modelo subyacente: `@misc{irodori-tts-v3, author = {Chihiro Arata}, title = {Irodori-TTS: A Flow Matching-based Text-to-Speech Model with Emoji-driven Style Control}, year = {2026}, publisher = {Hugging Face}, howpublished = {https://huggingface.co/Aratako/Irodori-TTS-500M-v3}}`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a foros de rol, consultas sobre Excel y contenidos no relacionados, por lo que no se han incluido.
