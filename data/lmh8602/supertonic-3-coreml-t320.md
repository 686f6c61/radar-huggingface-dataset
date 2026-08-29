# lmh8602/supertonic-3-coreml-t320

## Resumen

Supertonic-3 Core ML T=320 es una reconversión del modelo de síntesis de voz Supertonic-3 de Supertone (99M parámetros, arquitectura ligera para inferencia on-device) al formato Core ML de Apple, con una ventana de texto fija de 320 escalares Unicode en lugar de los 128 de la conversión publicada originalmente. El autor, lmh8602, reexportó el codificador de texto, el predictor de duración y los estimadores de vector con T=320 para evitar el truncamiento silencioso de textos coreanos, que en la versión T=128 se llenaba a unos 57 caracteres hangul. El resultado es un paquete de modelos Core ML (fp32 para las partes dependientes de texto, int8 para los buckets del estimador de vector) listo para integrarse en FluidAudio, un runtime de TTS para iOS y macOS.

La relevancia de esta conversión radica en que el modelo original de Supertone ya es notablemente eficiente (99M parámetros, ejecutable en CPU con ONNX Runtime, 31 idiomas), pero su conversión a Core ML con T=128 limitaba severamente la generación de voz coreana. Esta versión amplía la ventana a unos 145 caracteres coreanos, manteniendo el mismo error relativo que la conversión T=128 frente a la referencia ONNX. Es un derivado bajo licencia BigScience Open RAIL-M, con las restricciones de uso de su Anexo A.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conversión Core ML de Supertonic-3 (TTS autoregresivo no especificado en detalle; modelo base de 99M parámetros) |
| Parametros totales | 99M (modelo base); conversión Core ML no especifica el conteo exacto por componente |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | T=320 escalares Unicode (≈145 caracteres coreanos, ≈320 caracteres latinos) |
| Tipos de cuantizacion | fp32 (TextEncoder, DurationPredictor), int8 (VectorEstimator_L{128,256,512}) |
| Idiomas soportados | ko, en (según la model card de esta conversión; el modelo base soporta 31 idiomas) |
| Licencia | BigScience Open RAIL-M (con restricciones de uso del Anexo A) |
| Formato de pesos | Core ML (.mlmodelc) |

## Arquitectura y entrenamiento

El modelo base Supertonic-3 es un sistema TTS de 99M parámetros diseñado para inferencia local en CPU mediante ONNX Runtime. Su arquitectura interna no se detalla en la documentación pública, pero sigue el esquema típico de TTS moderno: un codificador de texto, un predictor de duración, un estimador de vectores (probablemente de características acústicas o de embeddings) y un vocoder. La conversión Core ML reexporta los componentes dependientes de la longitud de texto (TextEncoder, DurationPredictor, VectorEstimator) con una ventana fija de T=320, mientras que el vocoder no tiene eje temporal y se mantiene sin cambios. El proceso de conversión se realizó con coremltools, manteniendo las mismas opciones de precisión que la conversión T=128 publicada (fp32 para las partes de texto, int8 para los buckets del estimador de vector). El autor no ha publicado información sobre el entrenamiento del modelo base, ya que no participó en él; solo realizó la conversión.

## Capacidades

- Síntesis de voz (text-to-speech) en coreano e inglés, con soporte de estilos de voz (carpeta `voice_styles/`).
- Generación de audio de alta calidad a partir de texto, con control de duración y entonación mediante el predictor de duración.
- Ejecución completamente on-device mediante Core ML, sin necesidad de conexión a red ni API externas.
- Manejo de textos coreanos largos (hasta ~145 caracteres hangul) sin truncamiento, gracias a la ventana T=320.
- Integración con FluidAudio, runtime de TTS para Apple que proporciona APIs de alto nivel y gestión de caché.
- Compatibilidad con aceleración por Neural Engine (ANE) de Apple para los componentes int8, y ejecución en CPU para los fp32.

## Casos de uso

- Asistentes de voz en coreano para iOS/macOS: el modelo puede generar respuestas habladas en tiempo real con baja latencia, manteniendo la privacidad al procesar todo localmente. Su ventana de 320 escalares permite leer párrafos completos de noticias o mensajes sin cortes.
- Aplicaciones de accesibilidad para lectura de pantalla en coreano: al soportar textos largos, puede leer artículos o documentos completos sin necesidad de dividirlos en fragmentos, mejorando la naturalidad y fluidez.
- Generación de audiolibros en coreano e inglés: con los archivos de estilos de voz, se pueden crear narraciones con distintas entonaciones, y el tamaño reducido del modelo (0.3 GB) permite empaquetarlo en una app de distribución masiva.
- Traducción y aprendizaje de idiomas: una app puede leer en voz alta frases en coreano o inglés con pronunciación correcta, sirviendo como herramienta de pronunciación o práctica de listening.
- Sistemas de navegación y avisos en vehículos o dispositivos IoT: la baja latencia y el funcionamiento sin conexión lo hacen adecuado para entornos donde la red no es fiable o la privacidad es crítica.
- Desarrollo de prototipos y pruebas de integración: los desarrolladores pueden usar el modelo como backend TTS local en sus apps, sustituyendo servicios en la nube y reduciendo costes de API, gracias a la compatibilidad con FluidAudio y la posibilidad de servir mediante un servidor compatible con OpenAI (como supertonic-server).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión Core ML T=320. La model card solo indica que el error relativo frente a la referencia ONNX está en el mismo rango que la conversión T=128 publicada, medida de la misma manera. No hay datos de latencia, throughput ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Dispositivos Apple con Core ML: iPhone, iPad, Mac con Apple Silicon (M1 o posterior) o Mac con CPU Intel (ejecución en CPU más lenta).
- El modelo ocupa 0.3 GB en disco, repartidos en varios archivos `.mlmodelc`.
- Los componentes int8 (VectorEstimator) pueden ejecutarse en la Neural Engine (ANE) de Apple, mientras que los fp32 (TextEncoder, DurationPredictor) requieren CPU/GPU.
- No se requiere GPU dedicada ni VRAM externa; es un modelo ligero pensado para dispositivos móviles.
- Opciones de despliegue: FluidAudio (runtime oficial para Core ML), o un servidor local tipo supertonic-server que expone una API compatible con OpenAI y puede usar CoreML como backend.
- Latencia estimada: no disponible en la documentación, pero el diseño on-device de Supertonic-3 (99M parámetros) sugiere tiempos de síntesis en tiempo real en hardware moderno de Apple.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Supertonic-3 Core ML T=320 (este) | 99M (base) | T=320 escalares | ko, en (conversión) | Open RAIL-M | Core ML |
| FluidInference/supertonic-3-coreml (T=128) | 99M (base) | T=128 escalares | ko, en (conversión) | Open RAIL-M | Core ML |
| Supertone/supertonic-3 (ONNX original) | 99M | Dinámico (sin límite fijo) | 31 | Open RAIL-M | ONNX |

La principal diferencia frente a la conversión T=128 es la ventana de texto ampliada, que evita el truncamiento en coreano. Frente al modelo ONNX original, esta versión Core ML está optimizada para Apple pero limita la ventana a 320 escalares (el ONNX permite longitudes dinámicas). No se dispone de comparativas con otros sistemas TTS como XTTS o Piper en cuanto a calidad o velocidad.

## Limitaciones y advertencias

- La ventana de texto está fijada en T=320 escalares Unicode; textos más largos se truncarán silenciosamente en la cola. Para coreano, el límite práctico es ~145 caracteres; para idiomas latinos, ~320 caracteres.
- Solo se certifican los idiomas coreano e inglés en esta conversión, aunque el modelo base soporta 31. No se garantiza el comportamiento correcto en otros idiomas.
- La licencia BigScience Open RAIL-M impone restricciones de uso basadas en el Anexo A (prohibido uso para vigilancia masiva, generación de discurso de odio, etc.). Estas restricciones deben transmitirse a cualquier redistribución.
- El modelo es un derivado reconvertido; el autor no ha verificado exhaustivamente la calidad de la síntesis en todos los idiomas o estilos de voz más allá de la comparación de error relativo con la referencia ONNX.
- Para usar este paquete correctamente se necesita una versión de FluidAudio que lea la longitud T del modelo cargado (rama `probe/t320` del repositorio del autor), ya que la versión estándar asume T=128.
- No se proporcionan garantías de rendimiento ni de soporte (sección §7–§8 de la licencia).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lmh8602/supertonic-3-coreml-t320
- Modelo base (Supertone/supertonic-3): https://huggingface.co/Supertone/supertonic-3
- Página oficial de Supertonic 3: https://supertonic3.github.io/
- Repositorio GitHub de Supertone: https://github.com/supertone-inc/supertonic
- Conversión Core ML T=128 (FluidInference): https://huggingface.co/FluidInference/supertonic-3-coreml
- FluidAudio (runtime): https://github.com/FluidInference/FluidAudio
- Servidor OpenAI-compatible para Supertonic: https://github.com/ARahim3/supertonic-server
