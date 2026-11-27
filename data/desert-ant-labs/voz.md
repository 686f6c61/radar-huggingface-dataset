# desert-ant-labs/voz

## Resumen

Voz es un sistema de reconocimiento automático del habla (ASR) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo (*on-device*) sin enviar audio a servidores externos. El modelo transcribe voz en 25 idiomas europeos y proporciona marcas de tiempo a nivel de palabra con una resolución de 80 ms, lo que lo hace adecuado para tareas de subtitulado, indexación y análisis de audio en tiempo real. Su propuesta diferencial es el rendimiento: en plataformas Apple, ejecutándose sobre el Neural Engine mediante Core ML, procesa 10 minutos de audio en aproximadamente un segundo.

El modelo se distribuye en múltiples formatos de despliegue —LiteRT/TFLite para Android, Core ML para iOS/macOS/tvOS/visionOS, ONNX Runtime con DirectML para Windows y WebAssembly con ONNX Runtime para navegador y Node—, lo que permite integrarlo en prácticamente cualquier plataforma con un SDK unificado disponible en Swift, Kotlin y JavaScript. El repositorio en Hugging Face ocupa 4,4 GB e incluye los pesos en versión v0.5.0.

La relevancia actual de Voz radica en su enfoque de privacidad por diseño: al no requerir conectividad ni transferencia de datos, encaja en escenarios regulados (sanidad, legal, educación) donde el cumplimiento del RGPD y las políticas de retención de datos son críticos. Su licencia *source-available* personalizada, no obstante, impone condiciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR con encoder y decoder; se ejecuta vía Core ML, LiteRT y ONNX Runtime) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (procesa audio en fragmentos; lectura por partes en JavaScript) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX, WebAssembly |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Resolucion de timestamps | 80 ms a nivel de palabra |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, dimensión de embeddings, tipo de encoder/decoder ni estrategia de atención). Lo que sí se documenta es la canalización de despliegue: el modelo se compila a Core ML para su ejecución en el Neural Engine de Apple, a LiteRT/TFLite para Android (con aceleración XNNPACK en CPU o GPU si se incluye la librería aceleradora), a ONNX Runtime con DirectML para Windows y a WebAssembly sobre ONNX Runtime para navegador y Node. En navegador, el encoder se ejecuta en WebGPU y, cuando el navegador soporta WebNN (como Chromium en Mac), el decoder se ejecuta en el Neural Engine.

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se especifica la innovación arquitectónica concreta más allá de la optimización para inferencia en dispositivo. La SDK soporta un mecanismo de vocabulario personalizado (*vocabulary*) que sesga la decodificación hacia nombres propios y jerga específica sin añadir palabras no pronunciadas, lo que sugiere un componente de rescoring o biasing léxico en el pipeline de decodificación.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con salida de texto plano y marcas de tiempo a nivel de palabra (resolución de 80 ms).
- Generación de timestamps por palabra, adecuados para subtitulado, alineación forzada y búsqueda dentro de audio.
- Procesamiento por fragmentos en JavaScript: una grabación de cinco horas consume la misma memoria que una de cinco minutos.
- Vocabulario personalizado para sesgar la transcripción hacia nombres propios, marcas o jerga (disponible en Swift y Kotlin; no en JavaScript).
- Ejecución en modo *live* mediante `LiveConfiguration`, con el mismo vocabulario personalizado.
- Soporte multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Aceleración por hardware: Neural Engine (Apple), GPU vía DirectML (Windows), WebGPU y WebNN (navegador), XNNPACK/GPU (Android).
- No incluye detección automática de idioma; el autor recomienda usar el modelo complementario Ear para identificar el idioma antes de transcribir.
- No se documentan capacidades de visión, audio generation, tool calling ni razonamiento multi-paso; es un modelo especializado exclusivamente en ASR.

## Casos de uso

- **Subtitulado automático de vídeo**: el modelo genera timestamps por palabra con resolución de 80 ms, lo que permite construir ficheros SRT/VTT con alineación precisa. Al ejecutarse en dispositivo, el material audiovisual no sale del equipo del editor.
- **Transcripción de reuniones confidenciales**: en entornos legales, sanitarios o de recursos humanos, Voz procesa el audio localmente sin transferencia a la nube. El vocabulario personalizado permite incluir nombres de participantes y términos técnicos de la organización.
- **Dictado y notas de voz en aplicaciones móviles**: integrable vía SDK de Swift (iOS/macOS) o Kotlin (Android), con descarga anticipada del modelo durante el onboarding para evitar esperas en la primera transcripción.
- **Indexación y búsqueda de archivos de audio**: los timestamps por palabra permiten construir índices de búsqueda sobre grabaciones largas (podcasts, archivos de reuniones, entrevistas) y saltar al instante exacto donde se pronuncia un término.
- **Accesibilidad en tiempo real**: subtitulado en directo de conversaciones o clases mediante el modo *live* del SDK, con latencia reducida en plataformas Apple gracias al Neural Engine.
- **Procesamiento por lotes en servidor sin GPU dedicada**: en Node con `onnxruntime-node`, el modelo transcribe en CPU con la misma API y timestamps, útil para pipelines de ingestión de audio en backend.
- **Aplicaciones web de transcripción sin backend**: en navegador, el modelo corre sobre WebAssembly con WebGPU/WebNN, de modo que una herramienta de transcripción puede funcionar íntegramente en el cliente sin servidor de inferencia.
- **Cumplimiento normativo y privacidad**: organizaciones sujetas al RGPD o a políticas internas de retención de datos pueden desplegar transcripción sin que el audio abandone el dispositivo del usuario final.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Velocidad de transcripción (Apple Neural Engine) | 10 minutos de audio en ~1 segundo | Core ML, Neural Engine |
| Velocidad en Chromium (M5) | 125x tiempo real | WebAssembly + WebGPU/WebNN |
| Velocidad en Chromium (M1) | 38x tiempo real | WebAssembly + WebGPU/WebNN |
| Velocidad en Safari | 35x tiempo real | WebAssembly |
| Word error rate (navegador) | Equivalente a la build de Core ML | Según el autor |
| Tiempo de carga inicial (Apple) | 10-30 s tras la descarga | Preparación de Core ML para Neural Engine |
| Tiempo de carga posterior (Apple) | 0,2 s | Modelo ya preparado |

No se han publicado resultados de benchmarks estándar (WER por idioma, MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los factores de tiempo real citados por el autor.

## Requisitos de hardware

- **VRAM/RAM estimada**: no disponible. El repositorio ocupa 4,4 GB, pero no se especifica el consumo en memoria de inferencia ni el tamaño de los pesos por plataforma.
- **GPU recomendadas**: no se listan modelos concretos. En Apple se usa el Neural Engine (A-series y M-series); en Windows, GPU compatible con DirectML; en navegador, WebGPU (y WebNN en Chromium sobre Mac).
- **Consumer GPU**: el modelo está diseñado para ejecutarse en dispositivos de consumo (iPhone, iPad, Mac, Android), pero no se detallan los modelos mínimos compatibles.
- **Opciones de despliegue**: SDK propio de Desert Ant Labs para Swift, Kotlin y JavaScript; Core ML en Apple; LiteRT/TFLite en Android; ONNX Runtime con DirectML en Windows; ONNX Runtime Web (WebAssembly) en navegador; `onnxruntime-node` en Node.
- **Latencia y throughput**: en Apple, 10 minutos de audio en ~1 segundo (Neural Engine). En navegador, 125x tiempo real en M5, 38x en M1 y 35x en Safari. En Android, el autor advierte que los factores de tiempo real son muy inferiores a los del Neural Engine.
- **Almacenamiento**: 4,4 GB de repositorio; el SDK descarga el modelo en el primer uso y lo conserva en el dispositivo.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Timestamps por palabra | Ejecución on-device | Licencia |
|---|---|---|---|---|---|
| Voz (Desert Ant Labs) | ASR especializado | 25 | Sí (80 ms) | Sí (Core ML, LiteRT, ONNX, WASM) | Source-available |
| Whisper (OpenAI) | ASR transformer | ~99 | Sí (a nivel de segmento/palabra con herramientas externas) | Parcial (whisper.cpp, ONNX) | MIT |
| Parakeet (NVIDIA) | ASR CTC/conformer | Principalmente inglés | Sí | Parcial (TensorRT, ONNX) | No disponible en la información |
| Moonshine (Useful Sensors) | ASR | Inglés | No documentado | Sí | MIT |

No se dispone de datos de benchmarks comparativos directos (WER por idioma) en la información proporcionada, por lo que la comparación se limita a características estructurales. Whisper ofrece mayor cobertura de idiomas pero requiere adaptadores para ejecución on-device eficiente; Voz está optimizado específicamente para inferencia local con timestamps por palabra nativos.

## Limitaciones y advertencias

- **Sin detección automática de idioma**: el modelo no identifica el idioma del audio; es necesario conocerlo de antemano o usar un modelo auxiliar (Ear, del mismo autor). Si el idioma no está entre los 25 soportados, la transcripción fallará o será incorrecta.
- **Licencia restrictiva**: la licencia `desert-ant-labs-source-available` no es open source. Es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial, redistribución o integración en productos.
- **Riesgo de alucinación**: no se documenta explícitamente, pero los sistemas ASR pueden generar texto plausible en segmentos con ruido, silencios o audio ininteligible. El autor afirma que el vocabulario personalizado "nunca añade palabras que no se pronunciaron", pero no se aportan métricas de tasa de inserción.
- **Cobertura limitada a 25 idiomas europeos**: no incluye árabe, chino, japonés, coreano, hindi ni lenguas africanas, lo que restringe su uso en mercados globales.
- **Rendimiento dependiente de plataforma**: en Android los factores de tiempo real son "muy inferiores" a los del Neural Engine, según el propio autor. En Windows depende de DirectML y en navegador de WebGPU/WebNN, cuya disponibilidad varía según el navegador y el hardware.
- **Carga inicial lenta en Apple**: la primera carga tras la descarga tarda 10-30 s mientras Core ML prepara el modelo para el Neural Engine; debe gestionarse durante el onboarding.
- **Vocabulario personalizado no disponible en JavaScript**: la funcionalidad de sesgo léxico no está implementada en la versión web.
- **Sesgos**: no se documentan sesgos conocidos por idioma, acento o género en la información disponible. Al estar entrenado presumiblemente con datos europeos, puede tener peor rendimiento en acentos no estándar o variedades dialectales.
- **Sin datos de entrenamiento públicos**: no se especifica la composición del dataset, lo que dificulta evaluar sesgos y riesgos de contaminación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/voz
- Licencia: https://license.desertant.com/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del modelo (fuente de la model card): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/voz.md
- Documentación de Ear (detección de idioma): https://desertant.com/docs/ear/
- Pesos v0.5.0: https://huggingface.co/desert-ant-labs/voz/tree/v0.5.0
- Paquete npm: https://www.npmjs.com/package/@desert-ant-labs/voz
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
