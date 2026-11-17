# ngxson/tiny-voca-esp32s3

## Resumen

tiny-voca-esp32s3 es una distribucion empaquetada del modelo de sintesis de voz tiny-voca, un TTS en ingles de 4,5 millones de parametros, adaptada para ejecutarse de forma autonoma en un microcontrolador ESP32-S3. El trabajo lo publica ngxson como firmware precompilado y binarios de pesos cuantizados, partiendo del modelo original de n4ze3m. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: pesos int8, fonemizador y firmware listos para flashear en una placa concreta (Waveshare ESP32-S3-AUDIO-Board).

El interes tecnico esta en la viabilidad de inferencia neuronal completa en un MCU con recursos muy limitados. El paquete incluye la red neuronal en cuantizacion W8A8 (pesos y activaciones int8) de 4,9 MB, un fonemizador basado en lexico CMUdict con modelo para palabras desconocidas, y el firmware con bootloader y tabla de particiones. Todo el pipeline (texto a fonemas, red neuronal y sintesis de voz) corre en el propio ESP32-S3, sin dependencia de servidores externos.

Es relevante para desarrolladores de sistemas embebidos y aplicaciones de voz offline de bajo consumo: demuestra que un TTS neuronal en ingles puede caber en unos pocos megabytes de flash y ejecutarse en hardware de pocos euros. La licencia Apache-2.0 facilita su reutilizacion comercial, aunque el alcance esta acotado al idioma ingles y a una placa de referencia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de sintesis de voz (TTS); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 4,5 M (modelo base tiny-voca) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | int8 con cuantizacion W8A8 (pesos y activaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | binario propio para ESP32-S3 (`tvoca.bin`, 4,9 MB); no safetensors ni GGUF en este repo |
| Hardware objetivo | ESP32-S3 (firmware para Waveshare ESP32-S3-AUDIO-Board) |
| Tamano del repo | 0,0 GB (segun metadatos de Hugging Face) |
| Pipeline | text-to-speech |
| Modelo base | n4ze3m/tiny-voca |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base tiny-voca (capas, tipo de decoder, vocoder o mecanismo de atencion). Lo que si se documenta es el proceso de despliegue: los pesos originales se convierten a int8 con cuantizacion W8A8, generando un binario de 4,9 MB (`tvoca.bin`) que se carga en flash en el offset `0x210000`. El pipeline completo en el dispositivo incluye un fonemizador basado en CMUdict con un modelo para palabras fuera de lexico (`phonemizer.bin`, offset `0x910000`), la red neuronal cuantizada y la etapa de sintesis de voz.

No se dispone de datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de decodificacion del modelo original. El firmware se construyo a partir del commit `272c24d` del repositorio GitHub del proyecto. La contribucion tecnica principal de esta publicacion es la ingenieria de despliegue: particionado de flash, empaquetado de pesos y fonemizador, y una consola serie para introducir frases y escuchar la sintesis.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto introducido por consola serie.
- Ejecucion completamente local en ESP32-S3: fonemizacion, inferencia neuronal int8 y salida de audio en el propio microcontrolador.
- Fonemizacion basada en lexico CMUdict con manejo de palabras desconocidas mediante un modelo dedicado.
- Inferencia con pesos y activaciones cuantizados a int8 (W8A8), optimizada para memoria y computo limitados.
- Comando de consola `TEST` para verificar el dispositivo con un vector de prueba opcional (`test0_dev.bin`).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente TTS.

## Casos de uso

- Dispositivos de voz offline de bajo coste: el modelo permite dotar de voz sintetica a un ESP32-S3 sin conexion a red, usando el firmware y los binarios ya empaquetados para la placa Waveshare ESP32-S3-AUDIO-Board.
- Domotica y asistentes locales: integracion de avisos hablados en ingles (estado de sensores, alarmas, recordatorios) en un nodo embebido con consumo minimo y sin enviar datos a la nube.
- Prototipado de interfaces de voz en MCU: el comando de consola serie y el vector de prueba `TEST` permiten validar rapidamente el audio y la cadena de fonemizacion antes de integrar el dispositivo en un producto.
- Juguetes y dispositivos educativos: sintesis de frases en ingles en hardware de bajo coste con licencia Apache-2.0, adecuada para productos comerciales que requieran voz embebida.
- Sistemas de accesibilidad en entornos sin conectividad: lectura en voz alta de mensajes o estados en ingles en paneles y equipos industriales aislados.
- Evaluacion e investigacion en TTS embebido: sirve como referencia reproducible (binarios con checksums SHA-256 y commit fijado) para comparar tecnicas de cuantizacion int8 y despliegue de redes neuronales en microcontroladores.
- Sustitucion de modulos TTS por hardware en dispositivos existentes: al ser un binario flasheable con offsets documentados, puede integrarse en flujos de fabricacion o actualizacion de firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: ESP32-S3, con firmware especifico para la Waveshare ESP32-S3-AUDIO-Board.
- Memoria de flash requerida: al menos los offsets indicados implican uso hasta `0x910000` mas el tamano de `phonemizer.bin`; el modelo ocupa 4,9 MB en `0x210000`.
- VRAM de GPU: no aplica; la inferencia se ejecuta en el microcontrolador, no en GPU.
- GPU recomendadas: no aplica para el despliegue objetivo. Para reentrenar o reconvertir el modelo base se necesitaria el entorno del proyecto original (no detallado en la informacion disponible).
- Despliegue: `esptool` para flashear y `huggingface_hub` para descargar los binarios; consola serie a 115200 baudios o el script `monitor.sh` del repositorio GitHub.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Cuantizacion | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tiny-voca-esp32s3 (este) | 4,5 M | en | int8 W8A8 | ESP32-S3 | Apache-2.0 | Hugging Face (binarios) |
| tiny-voca (base) | 4,5 M | en | no disponible | servidor/PC | Apache-2.0 | Hugging Face |
| Otros TTS embebidos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos TTS embebidos comparables en la documentacion proporcionada; la comparativa se limita al modelo base del que deriva este artefacto.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue documentado.
- Es un artefacto de despliegue para un hardware concreto (Waveshare ESP32-S3-AUDIO-Board); su uso en otras placas ESP32-S3 requerira adaptar firmware y mapa de particiones.
- La calidad de sintesis esta acotada por el tamano del modelo (4,5 M de parametros) y la cuantizacion int8 W8A8; no se publican metricas de calidad (MOS u otras).
- El fonemizador depende de CMUdict y de un modelo para palabras desconocidas; palabras fuera de lexico pueden pronunciarse de forma incorrecta.
- No se documentan sesgos especificos, pero al ser un TTS en ingles entrenado con datos no descritos, la representatividad de acentos y voces no esta garantizada.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto libre; el riesgo se traslada a pronunciaciones erroneas o inteligibilidad reducida en ciertos textos.
- Licencia Apache-2.0 permite uso comercial, pero `phonemizer.bin` incorpora datos de CMUdict y homografos bajo las licencias recogidas en `licenses/`; es necesario revisarlas antes de redistribuir.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.
- No se ofrecen datos de latencia, throughput ni consumo energetico en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngxson/tiny-voca-esp32s3
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Repositorio GitHub del proyecto: https://github.com/ngxson/tiny-voca-esp32s3
