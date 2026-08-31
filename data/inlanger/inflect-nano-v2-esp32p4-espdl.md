# inlanger/inflect-nano-v2-esp32p4-espdl

## Resumen

Inflect-Nano-v2 para ESP32-P4 es un despliegue del modelo de síntesis de voz neuronal Inflect-Nano-v2, desarrollado por Owen Song, adaptado por el autor inlanger para ejecutarse íntegramente en un microcontrolador ESP32-P4 mediante la librería ESP-DL. El modelo acepta texto crudo en inglés y genera audio PCM mono de 24 kHz sin necesidad de servidor, cómputo en la nube ni procesamiento externo de fonemas o tokens. Su relevancia radica en que lleva un pipeline TTS completo de menos de 4 millones de parámetros a un dispositivo embebido de bajo consumo, abriendo la puerta a asistentes de voz, avisos acústicos y lectura de valores en aplicaciones de borde.

El paquete incluye los grafos de inferencia cuantizados en formato `.espdl`, los assets de soporte, un parche sobre ESP-DL 3.3.9 y el firmware fuente completo. No se reentrena ni destila el modelo original; se convierte y cuantiza para grafos de forma fija. Las mediciones publicadas muestran un tiempo de procesamiento completo de 3,77 segundos para la frase corta "Ready.", con un factor de tiempo real (RTF) de 8,03 en el hardware de referencia, lo que indica que no es un sistema de streaming en tiempo real, sino de generación por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible (modelo TTS neuronal de menos de 4M parametros) |
| Parametros totales | 3,97 millones (segun la documentacion del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (TTS; longitudes de solicitud limitadas por grafos fijos) |
| Tipos de cuantizacion | Cuantizacion para ESP-DL (tipo exacto no especificado) |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | `.espdl` (grafos ESP-DL) y `.bin` (assets) |

## Arquitectura y entrenamiento

El modelo base Inflect-Nano-v2 es un sistema de síntesis de voz de texto a forma de onda, completo y local, con menos de 4 millones de parámetros, diseñado para funcionar en CPU o CUDA. El despliegue para ESP32-P4 convierte y cuantiza los pesos originales en grafos ESP-DL de forma fija, sin reentrenamiento, destilación ni ajuste fino. El pipeline incluye un modelo acústico, un flujo de normalización (Flow48 y Flow96) y decodificadores de forma de onda (T64 y T96). No se dispone de detalles sobre la arquitectura interna exacta (tipo de red, capas, etc.) ni sobre el dataset de entrenamiento original en la informacion proporcionada.

El repositorio fuente incluye un parche sobre ESP-DL 3.3.9 que añade los cambios de runtime necesarios para ejecutar los grafos. El firmware completo se basa en ESP-IDF 6.0.2 y eSpeak-NG 1.52.0 para el frontend lingüístico. La generación de voz es determinista con semillas fijas, según la documentación del modelo base.

## Capacidades

- Generación de voz en inglés a 24 kHz mono PCM a partir de texto cruto, completamente offline.
- Ejecución íntegra en un microcontrolador ESP32-P4 sin necesidad de servidor ni conexión externa.
- Manejo de texto largo mediante rutas de grafos fijos (Flow48 para secuencias cortas, Flow96 para secuencias más largas).
- Voz masculina fija, sin opción de selección de hablante ni clonación de voz.
- No soporta tool calling, visión, audio de entrada ni otras modalidades; es exclusivamente TTS.
- Salida por buffer completo, no streaming causal ni por fragmentos.

## Casos de uso

- Anuncios de estado en dispositivos IoT: un termostato o electrodoméstico puede leer en voz alta la temperatura, el estado de un ciclo o alertas sin depender de la nube, gracias a la generación local de voz en el propio ESP32-P4.
- Lectura de valores de pantalla para accesibilidad: un dispositivo con display puede convertir el texto mostrado en audio para personas con discapacidad visual, usando el modelo para sintetizar cualquier cadena de texto generada dinámicamente.
- Retroalimentación acústica en electrodomésticos: lavadoras, hornos o cafeteras pueden emitir mensajes hablados de confirmación o error, aprovechando el bajo consumo y la ausencia de latencia de red.
- Alarmas y avisos de seguridad: sistemas de alarma locales pueden generar mensajes de voz específicos para cada evento (fuga de gas, puerta abierta, etc.) sin depender de servicios externos.
- Prototipado de asistentes de voz embebidos: desarrolladores pueden integrar este modelo como módulo de salida de voz en proyectos de bricolaje con ESP32-P4, usando el firmware de referencia y las herramientas de captura proporcionadas.
- Referencia de portabilidad de pipelines TTS a hardware restringido: el paquete sirve como ejemplo reproducible de cómo convertir y cuantizar un modelo neuronal multi-etapa para ejecutarlo en un microcontrolador, útil para ingenieros que trabajan en edge AI.

## Benchmarks y rendimiento

Las mediciones publicadas en el README corresponden a la ejecución de la frase "Ready." en el hardware de referencia (ESP32-P4 rev 1.3, dos núcleos RISC-V a 360 MHz, 32 MiB PSRAM, 16 MiB flash). Se presentan los tiempos por etapa y el factor de tiempo real (RTF):

| Medida | Resultado |
|---|---:|
| Modelo acústico | 86,827 ms |
| Flow48 | 234,609 ms |
| Decodificador de forma de onda T64 | 1.335,012 ms |
| Etapas aprendidas (suma) | 1.656,448 ms |
| Solicitud completa medida | 3.766,705 ms |
| Salida | 11.264 muestras / 0,469333 s |
| RTF de la ruta aprendida | 3,530 |
| RTF de la solicitud completa | 8,026 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible. La búsqueda web menciona que el modelo base se compara con KittenTTS Nano, Piper Low y Supertonic 3, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- Placa objetivo: ESP32-P4, verificado en revisión 1.3 del chip.
- CPU: dos núcleos RISC-V de alto rendimiento a 360 MHz.
- Memoria: 32 MiB PSRAM y 16 MiB flash.
- No requiere GPU ni acelerador externo; la inferencia se realiza completamente en el microcontrolador.
- Software necesario: ESP-IDF 6.0.2, ESP-DL 3.3.9 con el parche incluido, y eSpeak-NG 1.52.0.
- Opciones de despliegue: firmware compilado desde el repositorio fuente (`tools/build_inflect_p4_release.sh`) y herramienta de captura en Python para enviar texto y recibir el audio PCM.
- Latencia: 3,77 segundos para una frase corta (RTF 8,03); no es adecuado para aplicaciones de streaming en tiempo real.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la informacion proporcionada. El modelo base Inflect-Nano-v2 se posiciona como un TTS de menos de 4M parámetros, frente a alternativas compactas como KittenTTS Nano, Piper Low o Supertonic 3, que tienen huellas de peso mayores según la documentación del autor. Inflect-Micro-v2 (9,36M parámetros) es una variante hermana que prioriza calidad por encima de 10M, mientras que Nano prioriza el tamaño mínimo. No hay cifras de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Solo inglés y una única voz masculina; no hay clonación de voz, selección de hablante ni soporte multilingüe.
- Salida por buffer completo, no streaming causal ni por fragmentos; la latencia total puede ser alta para frases largas.
- Longitudes de solicitud limitadas por los grafos fijos; no se especifican los límites exactos en la documentación.
- Verificado únicamente en ESP32-P4 revisión 1.3; la configuración incluida no es compatible con placas de revisión 3.x.
- La muestra de audio publicada demuestra una sola frase corta, no una cobertura amplia de calidad subjetiva u objetiva.
- El tiempo de solicitud completo puede variar según la latencia del host, la disposición de la flash y la configuración de la placa.
- No se ha validado para uso en emergencias, aplicaciones médicas, legales u otras de seguridad crítica; se recomienda un respaldo no hablado para aplicaciones que dependan de la inteligibilidad.
- El uso de voz sintética para suplantar a personas o tergiversar su origen está explícitamente desaconsejado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inlanger/inflect-nano-v2-esp32p4-espdl
- Modelo base Inflect-Nano-v2: https://huggingface.co/owensong/Inflect-Nano-v2
- Repositorio fuente y firmware: https://github.com/inlanger/esp32-p4-inflect-tts
- Artículo sobre el despliegue en ESP32: https://nahornyi.ai/en/news/inflect-nano-v2-squeezed-esp32
- Ficha del modelo en awesome-ai-voice: https://github.com/wildminder/awesome-ai-voice/blob/main/models/inflect-nano-v2.md
