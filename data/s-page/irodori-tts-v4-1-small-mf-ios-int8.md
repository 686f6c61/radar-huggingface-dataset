# s-page/Irodori-TTS-v4.1-Small-MF-iOS-int8

## Resumen

Irodori-TTS v4.1 Small MF iOS int8 es un paquete de artefactos de ejecución derivados del modelo de síntesis de voz Aratako/Irodori-TTS-v4.1-Small-MF, convertidos para su uso en dispositivos iOS. No se trata de pesos nuevos ni de un modelo reentrenado, sino de una cuantización dinámica int8 de los grafos ONNX junto con un decodificador Core ML en float32, empaquetados por el usuario s-page para una aplicación de alarma que lee avisos con una voz descrita mediante texto (Voice Design por caption).

El modelo base es un TTS basado en flow matching (MeanFlow) con control de estilo por emoji y descripción textual, desarrollado por Chihiro Arata. La variante Small MF emplea un encoder de texto ModernBERT-ja-310m, un módulo de duración, un contexto KV y un paso DiT iterativo, más un decodificador DACVAE que genera audio a 48 kHz. La conversión reduce el tamaño de descarga de aproximadamente 2,85 GB (float32) a unos 0,72 GB para los cuatro grafos ONNX.

La relevancia de este paquete es práctica: demuestra que un TTS generativo de calidad puede ejecutarse en un iPhone 15 Pro con un consumo de memoria pico de unos 0,84 GB y un tiempo de cómputo de aproximadamente 3,2 s para una línea de 4 s. El repositorio está orientado exclusivamente a Voice Design por texto; el encoder de hablante y el encoder DACVAE se han omitido intencionadamente, por lo que la clonación de voz no es posible con estos archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS flow matching (MeanFlow) con encoder de texto ModernBERT-ja-310m, módulo de duración, contexto KV, paso DiT y decodificador DACVAE |
| Parametros totales | no disponible (modelo base "Small"; tamaño exacto no especificado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (latentes de audio de hasta 42 frames por chunk en el decodificador) |
| Tipos de cuantizacion | int8 dinámica per-channel en los grafos ONNX; decodificador Core ML en float32 |
| Idiomas soportados | japonés (ja) |
| Licencia | mit-apache-2.0-mixed (componentes con MIT y Apache 2.0; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | ONNX (int8) y Core ML mlpackage (float32) |
| Frecuencia de muestreo de salida | 48 kHz |
| Resolucion temporal | 25 frames/s; duración clampada a 0,5–30 s |
| Pasos de inferencia DiT | 4 (t = 1, 0,75, 0,5, 0,25) |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo base Irodori-TTS v4.1 Small MF es un sistema de síntesis de voz basado en flow matching con un esquema MeanFlow que permite generar audio con solo cuatro pasos de integración del DiT. La cadena de inferencia incluye un encoder de texto (ModernBERT-ja-310m), un predictor de duración que estima el número de frames mediante `expm1(log_frames)` con clamp a 0,5–30 s, un módulo de contexto KV inicializado con estado de hablante cero y un decodificador DACVAE adaptado al japonés que produce waveform a 48 kHz. El control de estilo se realiza mediante caption textual (por ejemplo, «明るく元気な若い女性の声»), sin necesidad de audio de referencia.

Este paquete concreto no aporta entrenamiento nuevo: aplica `onnxruntime.quantization.quantize_dynamic` con `weight_type=QuantType.QInt8` y `per_channel=True` sobre los grafos ONNX del pack Onsei (revisión `ios-v4`), sin reentrenamiento. El decodificador Core ML se mantiene en float32 sin cambios. La calidad se verificó por escucha comparativa contra la referencia PyTorch float32 en líneas de alarma en japonés con varias captions; las waveforms difieren por ser un modelo generativo, pero no se reportó degradación audible. Los digests SHA-256 de cada componente fuente están publicados en la model card.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con salida a 48 kHz.
- Voice Design por caption textual: la voz se describe con lenguaje natural, sin audio de referencia.
- Control de estilo mediante emojis y descripciones (herencia del modelo base Irodori-TTS).
- Generación de locuciones de duración variable, con clamp entre 0,5 y 30 s por línea.
- Ejecución on-device en iOS mediante ONNX Runtime (CPU) y Core ML (CPU/GPU).
- Verificación de integridad de descargas mediante `manifest.json` con SHA-256.
- No soporta clonación de voz: el encoder de hablante y el encoder DACVAE no están incluidos.
- No se documenta soporte de tool calling, agentes ni otras modalidades.

## Casos de uso

- Aplicaciones de alarma y avisos en iOS: el paquete está diseñado exactamente para leer líneas de alarma con una voz descrita por texto, con latencia de unos 3,2 s de cómputo por línea de 4 s en iPhone 15 Pro.
- Asistentes de voz off-line en japonés: al ejecutarse íntegramente on-device, permite generar locuciones sin conexión ni envío de texto a servidores, útil en entornos con requisitos de privacidad.
- Lectura de notificaciones y accesibilidad: integrable en apps que necesiten convertir texto dinámico en voz con un timbre configurable mediante caption, con consumo de memoria pico de 0,84 GB.
- Prototipado de interfaces de voz en iOS: sirve para validar experiencias de Voice Design antes de invertir en infraestructura de servidor, gracias al tamaño reducido (0,72 GB para los grafos ONNX).
- Locuciones de contenido breve en japonés: anuncios, avisos de temporizador o mensajes de sistema de hasta 30 s por segmento, con decodificación por chunks de 42 frames con solapamiento de 8 frames.
- Pruebas de integración de TTS en pipelines Core ML/ONNX: el manifest con digests y la separación de grafos facilitan la verificación y el despliegue en CI de apps iOS.
- Investigación sobre cuantización int8 en TTS: permite comparar la calidad percibida de los grafos int8 frente a la referencia float32 en un caso real de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados son de ejecución en dispositivo: en iPhone 15 Pro (ONNX Runtime CPU con 2 hilos, decodificador Core ML en CPU y GPU, grafos cargados de uno en uno), una línea de aproximadamente 4 s requiere unos 3,2 s de cómputo más unos 2,3 s de carga, con una huella de memoria pico de aproximadamente 0,84 GB.

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 0,84 GB de memoria pico en iPhone 15 Pro durante la inferencia.
- GPU recomendadas: no aplica para servidor; el paquete está orientado a Apple Silicon (CPU y GPU vía Core ML). Para el modelo base en PyTorch no se especifican requisitos en la información disponible.
- Cabe en hardware de consumo: sí, en iPhone 15 Pro y presumiblemente en dispositivos iOS con memoria suficiente; no se documentan otros dispositivos.
- Opciones de despliegue: ONNX Runtime 1.23.2 (CPU, 2 hilos) para los grafos int8 y Core ML para el decodificador DACVAE. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un TTS de este formato).
- Latencia y throughput: aproximadamente 3,2 s de cómputo por línea de 4 s más 2,3 s de carga inicial; los grafos se cargan de uno en uno.
- Tamaño de descarga: unos 0,72 GB para los cuatro grafos ONNX (frente a 2,85 GB en float32); repositorio completo de 1,0 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto / duración | Notas |
|---|---|---|---|---|---|---|
| Irodori-TTS v4.1 Small MF iOS int8 (este) | TTS flow matching, Voice Design | ja | ONNX int8 + Core ML | mit-apache-2.0-mixed | 0,5–30 s por línea | On-device iOS, sin clonación |
| Aratako/Irodori-TTS-v4.1-Small-MF | TTS flow matching, Voice Design | ja | PyTorch (float32) | MIT (según componentes) | no disponible | Modelo base; incluye encoder de hablante y DACVAE |
| raratu/Onsei-iOS-Models (v4.1-small-mf, ios-v4) | Pack de runtime iOS | ja | ONNX + Core ML | no disponible | no disponible | Origen de los grafos y del decodificador |
| Otros TTS on-device | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- Solo japonés: no se documenta soporte de otros idiomas.
- Sin clonación de voz: el encoder de hablante y el encoder DACVAE se han omitido intencionadamente; solo funciona Voice Design por caption.
- No es un modelo nuevo: son artefactos de ejecución convertidos, no afiliados ni respaldados por los autores originales.
- Sin watermark SilentCipher: las aplicaciones deben divulgar claramente que el audio es sintético cuando corresponda.
- Riesgo de parecido accidental con voces reales: la propia model card advierte de que la salida solo-texto puede coincidir casualmente con una voz real.
- Uso responsable: no clonar ni suplantar la voz de una persona sin consentimiento explícito y no crear deepfakes engañosos.
- Licencia mixta: cada componente mantiene su propia licencia (MIT para pesos Irodori-TTS, adaptación DACVAE japonesa, ModernBERT-ja-310m y código de exportación; Apache 2.0 para la implementación Meta DACVAE, con mención de SAM License en su repositorio de pesos; MIT para Descript DAC); es necesario revisar `LICENSES/` y `THIRD_PARTY_NOTICES.md` antes de uso comercial.
- Duración limitada: clamp de 0,5 a 30 s por línea; textos más largos deben segmentarse.
- Dependencia de plataforma: el decodificador es un mlpackage de Core ML, lo que limita su uso fuera del ecosistema Apple sin conversión adicional.
- Sin datos de benchmarks de calidad objetiva (MOS, WER) en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s-page/Irodori-TTS-v4.1-Small-MF-iOS-int8
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Pack Onsei iOS Models: https://huggingface.co/raratu/Onsei-iOS-Models
- Licencias y atribuciones: https://huggingface.co/s-page/Irodori-TTS-v4.1-Small-MF-iOS-int8/blob/main/THIRD_PARTY_NOTICES.md
- Cita del modelo base (Irodori-TTS v3, Chihiro Arata, 2026): https://huggingface.co/Aratako/Irodori-TTS-500M-v3
