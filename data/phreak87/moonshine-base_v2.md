# Phreak87/moonshine-base_V2

## Resumen

Moonshine Base V2 es una adaptación del modelo de reconocimiento automático de voz (ASR) Moonshine Base, desarrollado originalmente por Useful Sensors, reexportado a formato ONNX por Phreak87 para su uso en navegador mediante transformers.js. Esta versión específica está optimizada para el idioma alemán y resuelve un problema crítico de la V1: el decoder fusionado de ONNX generaba un token incorrecto en el primer paso de decodificación debido a un fallo en la rama `then_branch` del grafo. La V2 corrige este defecto a nivel de ONNX, permitiendo que la llamada estándar `pipeline('automatic-speech-recognition', modelId)` funcione sin necesidad de bucles de decodificación personalizados.

El modelo mantiene los pesos originales de [fidoriel/moonshine-base-de](https://huggingface.co/fidoriel/moonshine-base-de) y está diseñado para transcripción en tiempo real con baja latencia, ejecutándose íntegramente en el dispositivo del usuario. Su relevancia radica en que permite implementar ASR en alemán sin infraestructura de servidor, sin costes de API y con privacidad total, ya que el audio nunca abandona el dispositivo. El repositorio incluye un archivo HTML de demostración que verifica la paridad byte a byte entre la decodificación incremental y la de secuencia completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con RoPE (Rotary Position Embedding) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (exportacion ONNX) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model_merged.onnx) |

## Arquitectura y entrenamiento

Moonshine Base sigue una arquitectura encoder-decoder transformer optimizada para reconocimiento de voz en tiempo real. A diferencia de los modelos ASR tradicionales que usan embeddings posicionales absolutos, Moonshine emplea RoPE (Rotary Position Embedding), lo que permite manejar audio de longitud variable sin necesidad de padding. Esta eleccion de diseno reduce la latencia de inferencia y mejora la eficiencia en dispositivos con recursos limitados, como telefonos moviles o navegadores web.

La V2 de Phreak87 no modifica los pesos del modelo original, sino que corrige el grafo ONNX del decoder fusionado. El fallo original consistia en que la rama `then_branch` (utilizada cuando `cache=True`) usaba directamente `past_key_values.X.encoder.*` como claves y valores de atencion cruzada, que son cero en el primer paso, produciendo un token incorrecto. La correccion anade una proyeccion fresca de K/V desde `encoder_hidden_states` dentro del subgrafo `then_branch` para cada capa. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineamiento (RLHF/DPO) del modelo base.

## Capacidades

- Transcripcion de voz en aleman con baja latencia, optimizada para transcripcion en vivo y comandos de voz.
- Ejecucion completamente en el dispositivo (on-device) mediante transformers.js, sin necesidad de servidor ni conexion a internet.
- Compatible con la API estandar `pipeline('automatic-speech-recognition', modelId)` de transformers.js v4.
- Entrada de audio como `Float32Array` a 16 kHz, formato estandar para ASR.
- Decodificacion incremental con cache de estados, verificada byte a byte contra la decodificacion de secuencia completa.
- No se ha documentado soporte para tool calling, agentes, vision ni otras modalidades.

## Casos de uso

- Transcripcion en tiempo real en el navegador: un usuario puede dictar en aleman y ver el texto mientras habla, gracias a la baja latencia del modelo y a que la inferencia ocurre localmente con transformers.js.
- Subtitulado automatico de videos y podcasts en aleman: el modelo puede procesar audio de forma incremental y generar subtitulos sincronizados sin enviar datos a un servidor externo.
- Asistentes de voz privados: integracion en aplicaciones web de asistencia por voz donde la privacidad es critica, ya que el audio nunca abandona el dispositivo del usuario.
- Comandos de voz para aplicaciones de productividad: reconocimiento de instrucciones habladas en aleman para automatizar tareas como crear notas, enviar mensajes o controlar el reproductor multimedia.
- Accesibilidad para personas con discapacidad motora: dictado de texto en aleman en aplicaciones web sin depender de servicios cloud, lo que garantiza disponibilidad incluso con conexiones inestables.
- Prototipado rapido de aplicaciones ASR: gracias al archivo HTML de demostracion incluido, los desarrolladores pueden evaluar la calidad de la transcripcion en aleman sin configurar un entorno de desarrollo complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion documentada es la paridad byte a byte entre la decodificacion incremental (V2) y la de secuencia completa (V1) sobre el archivo de prueba `test-de.mp3`, con la transcripcion: "Guten Morgen, das ist ein Test der lokalen Spracherkennung mit Munchie."

## Requisitos de hardware

- Al ser un modelo ONNX ejecutado en el navegador, no requiere GPU dedicada; puede funcionar en CPU de cualquier dispositivo moderno.
- El tamano del repositorio es de 0.3 GB, lo que implica una carga inicial de aproximadamente 300 MB en el navegador.
- No se dispone de datos de VRAM, latencia ni throughput especificos para este modelo.
- Opciones de despliegue: navegador web mediante transformers.js (CDN de jsdelivr), o cualquier runtime que soporte ONNX (ONNX Runtime Web, Node.js, etc.).
- Dado que es una adaptacion de Moonshine Base, esta disenado para dispositivos con recursos limitados, pero los requisitos exactos de memoria no estan documentados en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Ejecucion | Licencia | Contexto |
|---|---|---|---|---|---|
| Phreak87/moonshine-base_V2 | aleman | ONNX | navegador (transformers.js) | Apache 2.0 | no disponible |
| fidoriel/moonshine-base-de | aleman | PyTorch | servidor/on-device | Apache 2.0 | no disponible |
| UsefulSensors/moonshine-base | ingles (original) | PyTorch | on-device | Apache 2.0 | no disponible |
| OpenAI Whisper (base) | multilingue | PyTorch | servidor/on-device | MIT | 30 segundos de audio |

La comparativa con Whisper es relevante porque ambos resuelven tareas de ASR, pero Moonshine esta especificamente optimizado para baja latencia en tiempo real, mientras que Whisper prioriza la precision en audio largo. La V2 de Phreak87 ofrece la ventaja de ejecutarse en el navegador sin servidor, algo que Whisper no soporta de forma nativa con la misma facilidad.

## Limitaciones y advertencias

- El modelo solo soporta aleman; no es util para otros idiomas sin reentrenamiento o adaptacion.
- No se dispone de informacion sobre sesgos del modelo, riesgo de alucinacion ni comportamiento en dominios especificos (jerga tecnica, acentos regionales, ruido de fondo).
- La correccion de la V2 se ha verificado solo con un archivo de prueba; no hay garantia de que el decoder fusionado funcione correctamente en todos los escenarios de audio.
- El modelo requiere que el audio se proporcione como `Float32Array` a 16 kHz; cualquier otro formato necesita preprocesamiento adicional.
- La carga inicial de 0.3 GB puede ser lenta en conexiones de baja velocidad, aunque una vez cargado, la inferencia es local.
- La licencia Apache 2.0 permite uso comercial, pero los pesos del modelo base provienen de Useful Sensors; se recomienda revisar los terminos de la licencia del modelo original para confirmar que no hay restricciones adicionales.

## Enlaces

- [Modelo en HuggingFace: Phreak87/moonshine-base_V2](https://huggingface.co/Phreak87/moonshine-base_V2)
- [Modelo original: UsefulSensors/moonshine-base](https://huggingface.co/UsefulSensors/moonshine-base)
- [Modelo base en aleman: fidoriel/moonshine-base-de](https://huggingface.co/fidoriel/moonshine-base-de)
- [Documentacion de Moonshine en HuggingFace](https://huggingface.co/docs/transformers/en/model_doc/moonshine)
- [Repositorio GitHub: moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine)
- [Repositorio GitHub: moonshine-ai/moonshine-v2](https://github.com/moonshine-ai/moonshine-v2)
- [Analisis de Moonshine Base en free2aitools](https://free2aitools.com/model/moonshine-ai/moonshine-base)
