# desert-ant-labs/voz

## Resumen

Voz es un modelo de reconocimiento automático de voz (ASR) desarrollado por Desert Ant Labs, un laboratorio europeo especializado en modelos on-device. Está diseñado para transcribir audio a texto con marcas de tiempo a nivel de palabra (word-level timestamps) en 25 idiomas, ejecutándose por completo en el Neural Engine de los dispositivos Apple. Según sus creadores, transcribe 10 minutos de audio en 2 segundos en un M3 Ultra, alcanzando una velocidad de aproximadamente 290 veces el tiempo real en ficheros largos.

El modelo se distribuye como un paquete SwiftPM (desert-ant-core) y se integra mediante un SDK en Swift para iOS, iPadOS, macOS, tvOS y visionOS. Su arquitectura es una cascada de tres etapas Core ML: un frontend de espectrograma log-mel, un encoder acústico tipo conformer sobre ventanas fijas de 15 segundos y un decoder transducer que emite un token y una duración en cada paso. El tamaño total en disco es de 467 MB, lo que lo hace notablemente más ligero que alternativas como Whisper large-v3-turbo (1,6 GB), manteniendo un rendimiento comparable en WER.

La relevancia actual de Voz reside en su apuesta por la inferencia 100% en el Neural Engine, sin respaldo de CPU o GPU, y en su diseño para aplicaciones de baja latencia y privacidad, ya que todo el procesamiento ocurre en el dispositivo. Su licencia es de código disponible (source-available), con uso gratuito hasta 100.000 dispositivos activos mensuales por SDK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada Core ML: frontend log-mel + encoder conformer + decoder transducer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 15 segundos por segmento |
| Tipos de cuantizacion | no disponible (se distribuye compilado como .mlmodelc) |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | desert-ant-labs-source-available-1.0 (https://license.desertant.com/1.0) |
| Formato de pesos | .mlmodelc (Core ML compilado), vocab.json (SentencePiece), embedding.f16 |

## Arquitectura y entrenamiento

Voz se compone de tres modelos Core ML que se ejecutan en cascada, orquestados desde Swift:

- **Frontend**: calcula un espectrograma log-mel dentro de Core ML, normalizado sobre los frames que contienen audio real en lugar de sobre toda la ventana con padding.
- **Encoder**: un encoder acústico de tipo conformer que opera sobre una ventana fija de 15 segundos, produciendo un frame cada 80 ms.
- **Decoder**: un transducer que emite un token y una duración en cada paso, ejecutándose con dieciséis ventanas independientes agrupadas en los canales de una única operación.

Para audio más largo, el sistema corta la grabación en ventanas consecutivas en las pausas, las transcribe de forma independiente y las une basándose en la secuencia más larga de palabras en las que dos ventanas vecinas coinciden. Todas las etapas se ejecutan en el Neural Engine sin caída a CPU o GPU.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica el número total de parámetros del modelo.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con salida de texto plano y marcas de tiempo por palabra (inicio y fin en segundos).
- Ejecución 100% en el Neural Engine de Apple, sin uso de CPU o GPU, lo que garantiza baja latencia y privacidad (procesamiento local).
- Manejo de audio largo mediante segmentación en ventanas de 15 segundos y unión por solapamiento de palabras coincidentes.
- Acepta audio mono a cualquier frecuencia de muestreo; el SDK se encarga de remuestrear y reducir a mono.
- Generación de marcas de tiempo con error medio absoluto de 83 ms en inicios y 95 ms en finales de palabra (frente a un alineador forzado).
- Integración nativa con el ecosistema Apple: iOS, iPadOS, macOS, tvOS y visionOS mediante Swift Package Manager.
- Los modelos se descargan bajo demanda y se cachean, por lo que no es necesario empaquetarlos en la aplicación.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede procesar grabaciones largas (p. ej., 30 minutos de narración) en unos 7 segundos en hardware Apple Silicon, con marcas de tiempo por palabra que permiten saltar a segmentos concretos.
- Subtitulado automático de vídeo: las marcas de inicio y fin de cada palabra facilitan generar subtítulos sincronizados con precisión de decenas de milisegundos.
- Asistente de voz en dispositivos móviles: al ejecutarse íntegramente en el Neural Engine, la transcripción funciona sin conexión y con latencia reducida, adecuada para comandos de voz en apps de iOS.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o contenido multimedia directamente en el dispositivo, sin enviar audio a servidores externos.
- Análisis de llamadas de atención al cliente: el WER en conversaciones (datos tipo Earnings-22 o AMI) ronda el 12-13%, suficiente para extraer métricas y generar resúmenes locales.
- Aplicaciones de periodismo y podcasting: transcripción de entrevistas con marcas de tiempo para edición, con un WER esperado del 10-13% en material conversacional real.

## Benchmarks y rendimiento

Los datos de la model card incluyen resultados en el Open ASR Leaderboard de Hugging Face, comparados con Whisper large-v3-turbo. Se utilizó el normalizador de texto propio del modelo Voz; las cifras de Whisper provienen del leaderboard con las mismas configuraciones de dataset.

| Dataset | Voz | Whisper large-v3-turbo |
|---|---:|---:|
| LibriSpeech test-clean | 2,19% | 2,13% |
| LibriSpeech test-other | 3,86% | 3,70% |
| GigaSpeech | 9,70% | 8,47% |
| SPGISpeech | 3,86% | 2,79% |
| Earnings-22 | 12,97% | 11,07% |
| AMI | 11,84% | 13,87% |
| **Media** | **7,40%** | **7,00%** |

Además, se reporta un WER en audio largo (media hora de narración) del 2,83% frente al 2,72% de Whisper large-v3-turbo, y una velocidad de 2,1 segundos para transcribir 611 segundos de audio (unas 290 veces el tiempo real) en un M3 Ultra.

Los autores advierten que los resultados en habla leída y limpia (LibriSpeech) rondan el 2%, mientras que en reuniones, llamadas de resultados y podcasts el WER se sitúa entre el 10% y el 13%. VoxPopuli y TEDLIUM se omitieron del leaderboard por problemas con los scripts de evaluación.

## Requisitos de hardware

- El modelo requiere un dispositivo Apple con Neural Engine (Apple Silicon o iPhone/iPad con chip A12 o posterior). No hay soporte para CPU o GPU como alternativa.
- El tamaño en disco es de 467 MB, por lo que cabe holgadamente en cualquier dispositivo actual.
- La carga en caliente tarda aproximadamente 0,2 segundos; la primera carga tras la instalación puede tardar unos 20 segundos mientras Core ML especializa el grafo.
- El consumo de memoria pico no crece con la duración de la grabación, según los desarrolladores.
- No se han publicado requisitos de VRAM ni soporte para backends como vLLM, llama.cpp u Ollama, ya que el modelo se distribuye exclusivamente como Core ML compilado para el ecosistema Apple.

## Comparativa con modelos similares

La comparativa más directa es con Whisper large-v3-turbo, que es el modelo que los propios autores utilizan como referencia.

| Modelo | Tamano | Idiomas | WER medio (6 datasets) | Velocidad | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Voz | 467 MB | 25 | 7,40% | ~290x tiempo real (M3 Ultra) | source-available | Apple Neural Engine |
| Whisper large-v3-turbo | 1,6 GB | 99+ | 7,00% | no publicado | MIT | multiplataforma (CPU/GPU) |
| Whisper small | ~460 MB | 99+ | no comparable | no publicado | MIT | multiplataforma (CPU/GPU) |

Voz ofrece un rendimiento muy cercano a Whisper large-v3-turbo en WER medio, con una ventaja de dos puntos en el dataset AMI (reuniones), pero con un tamaño tres veces menor y ejecución exclusiva en el Neural Engine. Sin embargo, su soporte de idiomas es mucho más limitado (solo 25 lenguas europeas) y está restringido a dispositivos Apple.

## Limitaciones y advertencias

- La licencia desert-ant-labs-source-available-1.0 permite uso gratuito hasta 100.000 dispositivos activos mensuales por SDK; superado ese umbral, es necesario contactar con el laboratorio para condiciones comerciales.
- El modelo solo funciona en dispositivos Apple con Neural Engine. No hay versiones para Android, Windows o Linux, ni soporte para CUDA o backends estándar de inferencia.
- La transcripción de conversaciones reales (reuniones, podcasts, llamadas) tiene un WER esperado del 10-13%, por lo que no es adecuado para transcripción médica o legal sin revisión humana.
- Las marcas de tiempo de fin de palabra tienden a sobresalir hacia la pausa siguiente; el sistema recorta los finales, pero puede haber un error residual de hasta 200 ms en el 10% de las palabras.
- El modelo no admite audio estéreo directamente; el SDK lo reduce a mono, lo que puede degradar la calidad en grabaciones con múltiples hablantes en canales separados.
- No se han publicado detalles sobre sesgos demográficos o dialectales, ni sobre el rendimiento en acentos no europeos dentro de los idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere una adopción muy temprana; la documentación y el soporte pueden ser limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/voz
- Documentación del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/voz.md
- Sitio web de Desert Ant Labs: https://desertant.com/
- Documentación de Voz en desertant.com: https://desertant.com/docs/voz/
- Organización en Hugging Face: https://huggingface.co/desert-ant-labs
- Licencia: https://license.desertant.com/1.0
