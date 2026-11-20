# desert-ant-labs/voz

## Resumen

Voz es un modelo de reconocimiento automático del habla (ASR) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en dispositivo (on-device) en plataformas Apple, Android, Linux, Windows, navegador y Node. Su propuesta principal es la transcripción de audio a texto con marcas de tiempo a nivel de palabra y una resolución de 80 ms, cubriendo 25 idiomas europeos. El modelo se distribuye a través del SDK propietario `desert-ant-core` (v4.3.0) y se ejecuta mediante LiteRT/TFLite en Android, Core ML en plataformas Apple (aprovechando la Neural Engine), ONNX Runtime con DirectML en Windows y ONNX Runtime Web/WebGPU en navegador.

La relevancia del modelo radica en su enfoque de privacidad y latencia: al no enviar audio a servidores, elimina los costes de ancho de banda y las implicaciones de cumplimiento normativo asociadas al procesamiento en la nube. En Apple Silicon, el autor declara una velocidad de aproximadamente 10 minutos de audio transcritos en torno a un segundo (factor de tiempo real muy superior a 1x), y en Chromium sobre un chip M5 alcanza 125x realtime, mientras que en un M1 se sitúa en 38x y en Safari en 35x.

El repositorio de Hugging Face ocupa 4,4 GB y contiene los pesos en formato LiteRT/TFLite y ONNX, además de artefactos para Core ML. La licencia es `desert-ant-labs-source-available`, una licencia propia de código disponible pero no open source en sentido estricto, cuyos términos deben consultarse en el enlace oficial antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline ASR con encoder y decoder; el decoder puede ejecutarse en Neural Engine vía WebNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (procesa audio en fragmentos; en navegador lee ficheros en piezas sin cargar todo en memoria) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 25: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letón, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco y ucraniano |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | LiteRT/TFLite, ONNX, Core ML (repo de 4,4 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un pipeline ASR con componentes de encoder y decoder diferenciados. El encoder se ejecuta en WebGPU en el navegador, mientras que el decoder puede aprovechar WebNN para ejecutarse en la Neural Engine en Chromium sobre macOS. En Android, los grafos se ejecutan a través de LiteRT con XNNPACK en CPU o con aceleración GPU si la librería de aceleración se empaqueta con la aplicación. En Windows se utiliza ONNX Runtime con DirectML sobre GPU.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de ajuste. Tampoco se documentan innovaciones arquitectónicas específicas más allá del soporte de vocabulario personalizado (nombres y jerga) que sesga la decodificación hacia grafías concretas sin añadir palabras no pronunciadas, y del procesamiento por streaming de ficheros de audio que permite transcribir grabaciones de cinco horas con el mismo consumo de memoria que una de cinco minutos.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos con marcas de tiempo a nivel de palabra y resolución de 80 ms.
- Ejecución completamente on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Soporte de vocabulario personalizado para nombres propios y jerga (por ejemplo, "SoFi", "Timex", "Patek Philippe"), con preferencia por las grafías indicadas cuando el modelo estaba cerca de elegirlas, sin insertar palabras no pronunciadas. No disponible en JavaScript.
- Procesamiento de audio en streaming por fragmentos, lo que permite transcribir grabaciones largas con memoria acotada.
- Lectura directa de WAV y decodificación de otros formatos mediante WebCodecs en navegador; en Node sin WebCodecs es necesario convertir a WAV previamente.
- Aceleración por hardware: Neural Engine en Apple, XNNPACK/GPU en Android, DirectML en Windows, WebGPU y WebNN en navegador.
- API unificada en Swift, Kotlin y JavaScript con objeto de resultado que expone `text`, `words` (con `start` y `end`) y `realtimeFactor`.
- No incluye detección automática de idioma; el autor recomienda usar el modelo complementario Ear para identificar el idioma antes de transcribir.

## Casos de uso

- Transcripción de reuniones en dispositivos Apple: la app puede grabar y transcribir localmente reuniones de una hora con marcas de tiempo por palabra, sin enviar audio a servidores y cumpliendo requisitos de privacidad en entornos corporativos.
- Subtitulado automático de vídeo en el navegador: integrado vía `@desert-ant-labs/voz` con ONNX Runtime Web, permite generar subtítulos con timestamps de 80 ms directamente en el cliente, sin coste de infraestructura de inferencia.
- Notas de voz en aplicaciones móviles Android: mediante el SDK Kotlin y LiteRT, la app puede transcribir dictados y notas de voz en el propio dispositivo, evitando cuotas de API y funcionando sin conectividad.
- Atención al cliente con análisis de llamadas: el modelo puede transcribir grabaciones de call center en 25 idiomas para su posterior análisis de sentimiento o control de calidad, manteniendo las conversaciones dentro de la infraestructura del cliente.
- Accesibilidad y subtitulado en directo: con la API `LiveConfiguration` y vocabulario personalizado, se pueden generar subtítulos en tiempo real para personas con discapacidad auditiva en eventos o clases, con la latencia que permita el hardware disponible.
- Procesamiento por lotes en servidores Node: instalando `onnxruntime-node`, se pueden transcribir archivos WAV en pipelines de backend con la misma API y timestamps, útil para indexar archivos de audio o generar transcripciones de archivos históricos.
- Investigación lingüística multilingüe: la cobertura de 25 idiomas europeos con timestamps precisos facilita la anotación y el análisis de corpus orales en estudios de fonética o sociolingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech, Common Voice, MMLU u otros) en la información disponible. Los únicos datos de rendimiento proporcionados por el autor son factores de tiempo real:

| Plataforma | Hardware | Rendimiento declarado |
|---|---|---|
| Apple (Core ML, Neural Engine) | no especificado | ~10 minutos de audio en ~1 segundo |
| Chromium (WebGPU/WebNN) | Apple M5 | 125x realtime |
| Chromium (WebGPU/WebNN) | Apple M1 | 38x realtime |
| Safari | no especificado | 35x realtime |
| Android (LiteRT) | no especificado | "factores de tiempo real muy inferiores a los de Neural Engine" (sin cifra) |

El autor afirma que la tasa de error de palabras (WER) de la build web coincide con la de la build Core ML.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio de pesos ocupa 4,4 GB, pero no se especifica el tamaño en memoria de inferencia ni el consumo por cuantización.
- GPU recomendadas: no se listan modelos concretos. En Apple se recomienda cualquier dispositivo con Neural Engine; en Windows, una GPU compatible con DirectML; en navegador, WebGPU (Chromium) o WebNN para el decoder.
- Compatibilidad con GPU de consumo: no confirmada explícitamente. El modelo está diseñado para ejecutarse en iPhone, iPad, Mac, Android, Linux, Windows y navegador, lo que sugiere que cabe en hardware de consumo, pero no se detallan requisitos mínimos.
- Opciones de despliegue: SDK propietario `desert-ant-core` (Swift Package Manager para Swift, Maven para Kotlin, npm para JavaScript), LiteRT/TFLite en Android, Core ML en Apple, ONNX Runtime con DirectML en Windows, ONNX Runtime Web con WebGPU/WebNN en navegador y ONNX Runtime Node en servidores.
- Latencia y throughput: en Apple, primera carga tras descarga de 10-30 s (preparación de Core ML para Neural Engine) y cargas posteriores de 0,2 s. En Chromium sobre M5, 125x realtime; en M1, 38x; en Safari, 35x. En Android, sin cifras concretas, pero el autor indica que son muy inferiores a las de Neural Engine y recomienda transcribir fuera del hilo principal.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de arquitectura que permitan una comparación cuantitativa rigurosa con alternativas como Whisper (OpenAI), Distil-Whisper o modelos ASR on-device comerciales. A continuación se ofrece una comparación cualitativa limitada a los datos disponibles:

| Modelo | Desarrollador | Idiomas | On-device | Timestamps por palabra | Licencia |
|---|---|---|---|---|---|
| Voz | Desert Ant Labs | 25 | Sí (Apple, Android, Windows, web, Node) | Sí, 80 ms | Source-available propietaria |
| Whisper large-v3 | OpenAI | ~99 | Posible con cuantización | A nivel de segmento (no de palabra de forma nativa) | MIT |
| Distil-Whisper | Hugging Face | Principalmente inglés | Sí, con cuantización | A nivel de segmento | MIT |

No se dispone de datos de WER comparativos entre Voz y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No realiza detección automática de idioma: es necesario indicar el idioma o usar un modelo externo (Ear) para identificarlo antes de transcribir.
- La licencia `desert-ant-labs-source-available` no es open source; es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial o de redistribución.
- El vocabulario personalizado no está disponible en JavaScript, lo que limita la adaptación a jerga en despliegues web.
- En Node sin WebCodecs es necesario convertir el audio a WAV previamente, lo que añade un paso de preprocesado.
- En Android el rendimiento es sustancialmente inferior al de Apple Neural Engine, según el propio autor, y se recomienda no ejecutar la transcripción en el hilo principal.
- La primera carga en Apple tras la descarga tarda entre 10 y 30 segundos; es recomendable precargar el modelo durante el onboarding para evitar esperas al usuario.
- No se han publicado datos sobre sesgos, tasa de alucinación ni robustez frente a ruido, acentos o audio de baja calidad.
- No se especifican los requisitos mínimos de hardware ni el consumo de memoria de inferencia, lo que dificulta planificar despliegues.
- El modelo está pensado para 25 idiomas europeos; no cubre otras lenguas y no se documenta su comportamiento en code-switching.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/voz
- Pesos v0.5.0: https://huggingface.co/desert-ant-labs/voz/tree/v0.5.0
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Documentación del modelo Ear (detección de idioma): https://desertant.com/docs/ear/
- Paquete npm: `@desert-ant-labs/voz`
- Paquete Maven: `ai.desertant:voz:4.3.0`
