# desert-ant-labs/voz

## Resumen

Voz es un sistema de reconocimiento automático del habla (ASR) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo ("on-device") sin enviar audio a servidores externos. Transcribe audio en 25 idiomas europeos y proporciona marcas de tiempo a nivel de palabra con una resolución de 80 ms. Su propuesta diferencial es el rendimiento: en plataformas Apple ejecuta la inferencia completa en el Neural Engine y procesa 10 minutos de audio en aproximadamente un segundo, lo que equivale a un factor de tiempo real (RTF) muy inferior a la unidad.

El modelo se distribuye en múltiples formatos según la plataforma: Core ML para iOS, macOS, tvOS y visionOS; LiteRT/TFLite para Android; ONNX Runtime con DirectML para Windows; WebAssembly con ONNX Runtime Web (WebGPU/WebNN) para navegador y Node. El repositorio en Hugging Face ocupa 4,4 GB e incluye los pesos en versiones etiquetadas (v0.5.0). La arquitectura interna no está detallada en la información disponible; la model card se centra en la API del SDK y en las características de despliegue.

Es relevante ahora porque cubre un nicho concreto: transcripción multilingüe de baja latencia y privacidad estricta en aplicaciones móviles y de escritorio, con marcas de tiempo por palabra y personalización mediante vocabulario. La licencia es propietaria ("desert-ant-labs-source-available"), lo que condiciona su uso comercial y su integración en proyectos de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline ASR con encoder y decoder; inferencia vía Core ML, LiteRT y ONNX Runtime) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (procesa audio en fragmentos; lectura por piezas en navegador) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | desert-ant-labs-source-available (propietaria, enlace: https://license.desertant.com/) |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX (ONNX Runtime Web/Node, DirectML), WebAssembly |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de encoder, número de capas, mecanismo de atención ni composición del dataset de entrenamiento). La model card describe el sistema como un pipeline de reconocimiento del habla con salida de transcripción y marcas de tiempo por palabra con resolución de 80 ms, empaquetado para ejecutarse en distintos runtimes según la plataforma: Core ML con aceleración en el Neural Engine en Apple, LiteRT con XNNPACK en CPU o GPU en Android, ONNX Runtime con DirectML en Windows y ONNX Runtime Web compilado a WebAssembly en navegador y Node.

Entre las innovaciones técnicas documentadas destacan: la ejecución completamente local (el audio no abandona el dispositivo), el procesamiento por fragmentos en el navegador que permite transcribir grabaciones de cinco horas con el mismo consumo de memoria que una de cinco minutos, el uso de WebGPU para el encoder y WebNN para el decoder en Chromium sobre Mac, y un mecanismo de vocabulario personalizado que sesga la decodificación hacia grafías concretas (nombres propios, jerga) sin añadir palabras que no se hayan pronunciado. No se especifican datos sobre tokens de entrenamiento, composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos (eslavos, germánicos, románicos, bálticos, griego y maltés).
- Marcas de tiempo a nivel de palabra con resolución de 80 ms (`result.words[i].start` / `.end`).
- Ejecución completamente on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Personalización mediante lista de vocabulario: acepta nombres y términos con la grafía deseada ("SoFi", "Patek Philippe") y los prefiere cuando la decodificación está cerca de esa opción, sin inventar palabras no pronunciadas.
- Factor de tiempo real expuesto en la API (`result.realtimeFactor`) para monitorizar el rendimiento.
- Procesamiento por streaming de archivos en navegador (lectura por piezas de un `File`), apto para grabaciones largas.
- Decodificación de formatos distintos de WAV mediante WebCodecs en navegador; en Node sin WebCodecs requiere conversión previa a WAV.
- No incluye detección de idioma: el SDK sugiere usar el modelo complementario Ear para identificarlo antes de transcribir.
- Soporte de entrada por muestras crudas mono a la frecuencia del modelo (`voz.sampleRate`, 16 kHz en el ejemplo de Kotlin).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo especializado exclusivamente en ASR.

## Casos de uso

- **Transcripción de reuniones en aplicaciones móviles**: integración en apps iOS y Android mediante los SDK Swift y Kotlin; el modelo procesa audio multi-participante con marcas de tiempo por palabra y admite una lista de vocabulario con los nombres de los asistentes para mejorar la grafía de nombres propios.
- **Subtitulado automático de vídeo**: las marcas de tiempo a nivel de palabra con resolución de 80 ms permiten generar subtítulos sincronizados y segmentados; en navegador se puede procesar un archivo de vídeo de varias horas por piezas sin agotar la memoria.
- **Notas de voz y dictado con privacidad estricta**: al ejecutarse íntegramente en el dispositivo (Neural Engine en Apple, LiteRT en Android), el audio no sale del terminal, lo que encaja en aplicaciones sanitarias, legales o corporativas con requisitos de confidencialidad.
- **Transcripción por lotes en servidor Node**: usando `onnxruntime-node` en CPU se obtiene la misma API y las mismas marcas de tiempo por palabra, útil para pipelines de ingesta de audio en backend sin depender de servicios en la nube.
- **Herramientas de accesibilidad**: dictado y transcripción en tiempo real en aplicaciones de escritorio Windows (vía ONNX Runtime y DirectML sobre GPU) y Linux, con latencia baja gracias al procesamiento local.
- **Análisis de contenido audiovisual en el navegador**: un editor web puede transcribir grabaciones largas con WebGPU (125x tiempo real en un M5, 38x en un M1, 35x en Safari) y ofrecer búsqueda por palabra con timestamps sin subir el material a un servidor.
- **Aplicaciones multiplataforma con un único modelo**: el mismo pipeline está disponible para Swift, Kotlin y JavaScript, lo que simplifica el mantenimiento de una base de código con transcripción coherente entre iOS, Android, web y Node.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (WER por idioma, MMLU u otros) en la información disponible. Los únicos datos de rendimiento documentados son los factores de tiempo real:

| Plataforma / runtime | Rendimiento documentado |
|---|---|
| Apple Neural Engine (Core ML) | 10 minutos de audio en ~1 segundo |
| Chromium con WebGPU, M5 | 125x tiempo real |
| Chromium con WebGPU, M1 | 38x tiempo real |
| Safari | 35x tiempo real |
| Android (LiteRT, XNNPACK/GPU) | "factores de tiempo real muy por debajo de los del Neural Engine" (sin cifra) |
| Carga del modelo tras descarga (Apple) | 0,2 s (la primera carga tras descarga tarda 10-30 s) |

La model card indica que la tasa de error de palabras (WER) de la build WebAssembly coincide con la de la build Core ML, pero no proporciona el valor numérico.

## Requisitos de hardware

- **VRAM/RAM estimada**: no disponible; el repositorio completo ocupa 4,4 GB, pero el tamaño en memoria de cada build (Core ML, LiteRT, ONNX) no se especifica.
- **GPU recomendadas**: no se listan GPU de datacenter (A100, H100). El modelo está orientado a aceleradores de dispositivo: Neural Engine en Apple Silicon, GPU Android vía LiteRT, GPU Windows vía DirectML, WebGPU en navegador y WebNN en Chromium sobre Mac.
- **Consumer GPU**: sí cabe en hardware de consumo, pero el soporte documentado es el de aceleradores integrados y GPUs de escritorio vía DirectML; no se detallan modelos concretos de RTX.
- **Opciones de despliegue**: SDK Swift (Core ML), SDK Kotlin (LiteRT), paquete npm `@desert-ant-labs/voz` con `onnxruntime-web` (navegador) u `onnxruntime-node` (Node, CPU), y Swift SDK sobre ONNX Runtime + DirectML en Windows.
- **Latencia y throughput**: 10 minutos de audio en ~1 s en Neural Engine; 125x, 38x y 35x tiempo real en navegador según hardware y navegador; en Android se advierte de factores de tiempo real considerablemente peores que en Apple. Se recomienda transcribir fuera del hilo principal y reutilizar la instancia del reconocedor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia cualitativa de la categoría (ASR on-device multilingüe), podrían considerarse familias como Whisper (OpenAI) o sus variantes destiladas, pero no se han facilitado cifras comparables de parámetros, contexto, WER ni licencia para este modelo, por lo que la comparación cuantitativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue on-device |
|---|---|---|---|---|---|
| Voz (Desert Ant Labs) | no disponible | no disponible | 25 | source-available propietaria | Core ML, LiteRT, ONNX, WASM |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin detección de idioma**: el modelo no identifica el idioma del audio; es responsabilidad de la aplicación seleccionarlo o usar un detector externo (el SDK sugiere Ear). Si el idioma no está entre los 25 soportados, se necesita un reconocedor de respaldo.
- **Licencia propietaria**: "desert-ant-labs-source-available" no es una licencia de código abierto; el uso comercial, la redistribución y la modificación están sujetos a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en producción.
- **Vocabulario mal usado degrada la calidad**: la model card advierte explícitamente que una lista genérica y larga de términos empeora las transcripciones; debe limitarse a nombres y jerga relevantes para la grabación.
- **Rendimiento desigual entre plataformas**: en Android los factores de tiempo real son "muy inferiores" a los del Neural Engine, y la primera carga del modelo en Apple tarda entre 10 y 30 segundos tras la descarga, lo que exige gestionar la descarga y precarga durante el onboarding.
- **Restricciones en JavaScript**: el vocabulario personalizado no está disponible todavía en la versión JavaScript; en Node sin WebCodecs es necesario convertir el audio a WAV previamente.
- **Riesgo de alucinación**: no se documenta una métrica de WER ni de tasa de inserción de palabras; aunque la model card afirma que el vocabulario "nunca añade palabras que no se hayan pronunciado", no se aportan datos cuantitativos que lo respalden, por lo que conviene validar en el dominio de uso.
- **Sesgos**: no se documenta información sobre sesgos por acento, dialecto, edad o género; los 25 idiomas cubiertos son en su mayoría europeos, con ausencia de lenguas asiáticas, africanas y de Oriente Medio.
- **Arquitectura y entrenamiento opacos**: al no publicarse detalles de arquitectura, datos ni proceso de entrenamiento, la evaluación independiente y la reproducibilidad quedan limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/voz
- Pesos v0.5.0: https://huggingface.co/desert-ant-labs/voz/tree/v0.5.0
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentación del modelo (fuente de la model card): https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/voz.md
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Documentación del detector de idioma Ear: https://desertant.com/docs/ear/
