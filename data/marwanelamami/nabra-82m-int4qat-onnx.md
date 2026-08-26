# marwanelamami/nabra-82m-int4qat-onnx

## Resumen

Nabra-82M INT4-QAT es un modelo de síntesis de voz (text-to-speech) en árabe, cuantizado a precisión INT4 para ejecución en dispositivos con recursos limitados. Deriva del modelo base oddadmix/Nabra-82M-v0.1, que emplea una arquitectura Kokoro/StyleTTS2 con decodificador iSTFTNet. El autor, marwanelamami, se centra en compresión de modelos y despliegue en móviles, y este modelo es el resultado de un proceso de cuantización consciente del entrenamiento (QAT) aplicado al modelo original.

El modelo está disponible en formato ONNX, con un peso de 56,9 MB, y está diseñado para funcionar en tiempo real en smartphones de gama media (RTF ≈ 0,66 en Snapdragon 865). Su salida es una forma de onda a 24 kHz. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Es relevante porque ofrece una alternativa de TTS árabe de alta calidad y baja latencia para aplicaciones on-device, sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro/StyleTTS2 con decodificador iSTFTNet |
| Parametros totales | 82M (nominal, segun nombre del modelo; archivo cuantizado 56,9 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de secuencia de fonemas, no texto libre) |
| Tipos de cuantizacion | INT4 (pesos del decoder, escalas por canal aprendidas, empaquetado nibble), INT8 (front-end) |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base Nabra-82M-v0.1 utiliza una arquitectura híbrida inspirada en StyleTTS2, con un decodificador iSTFTNet que genera la forma de onda directamente desde representaciones intermedias. El proceso de cuantización aplicado por marwanelamami incluye QAT con arranque en caliente (warm-start), 6.000 pasos de entrenamiento con pérdida L1 sobre la forma de onda, escalas por canal aprendidas y empaquetadas en nibbles, compensación de sesgo de salida y un filtro notch IIR de 2 puntos (4,8/9,6 kHz) para eliminar tonos de imagen del iSTFT. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el número de tokens o horas de audio utilizadas.

## Capacidades

- Sintesis de voz en arabe a 24 kHz, con voz natural y caracteristicas similares al modelo FP32 original.
- Control de velocidad de habla mediante el parametro `speed` (escalar float32).
- Control de estilo mediante un vector de referencia `ref_s` de 256 dimensiones, extraido de voces predefinidas (por ejemplo, `voices_af_msa.pt["af_msa"]`).
- Entrada de secuencia de fonemas (tokens int64) con token BOS/EOS (0).
- Inferencia en tiempo real en CPU movil (RTF ≈ 0,66 en Snapdragon 865 con 4 hilos).
- No incluye capacidades de tool calling, agentes, vision ni procesamiento de lenguaje general; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de texto en arabe en aplicaciones moviles sin conexion: el modelo puede integrarse en apps de noticias o libros electronicos para leer articulos en voz alta, gracias a su bajo peso (56,9 MB) y su capacidad de ejecucion en CPU.
- Asistentes de voz en dispositivos de gama media: al funcionar en tiempo real en SoCs como Snapdragon 865, puede servir como motor TTS local en asistentes personales, evitando latencia de red y problemas de privacidad.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla que convierten texto arabe en audio, con control de velocidad para adaptarse al usuario.
- Audiolibros generados localmente: el modelo permite sintetizar narraciones en arabe a partir de texto, con posibilidad de ajustar el estilo mediante vectores de referencia.
- Sistemas de navegacion y avisos en vehiculos: al ser ligero y rapido, puede generar instrucciones de voz en arabe en sistemas embebidos con recursos limitados.
- Prototipado de aplicaciones TTS en entornos de desarrollo: al estar en formato ONNX, se puede probar rapidamente con ONNX Runtime en diferentes plataformas antes de un despliegue masivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, MCD, etc.) en la informacion disponible. El unico dato de rendimiento proporcionado es el factor tiempo real (RTF) de aproximadamente 0,66 en un Snapdragon 865 con 4 hilos, lo que indica que la sintesis es mas rapida que el tiempo real en ese hardware. No hay comparaciones numericas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada: no requiere GPU dedicada; puede ejecutarse en CPU. El modelo ocupa 56,9 MB en disco, y en memoria durante la inferencia puede necesitar unos 100-200 MB dependiendo de la implementacion.
- GPU recomendadas: no se requiere GPU; el modelo esta disenado para CPU movil o embebida.
- Compatibilidad con consumer GPU: no aplica, aunque puede ejecutarse en cualquier CPU con soporte para ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU), tambien puede convertirse a otros formatos si se desea, aunque el autor recomienda el uso directo del archivo ONNX.
- Latencia y throughput: RTF ≈ 0,66 en Snapdragon 865 (4 hilos), lo que implica que para generar 1 segundo de audio se necesitan aproximadamente 0,66 segundos de computo. En hardware mas potente (PC, servidores) la latencia sera menor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Calidad | Tamaño | Licencia |
|---|---|---|---|---|---|
| oddadmix/Nabra-82M-v0.1 (base) | 82M | PyTorch (probablemente) | Alta (FP32) | ~300 MB (estimado) | Apache 2.0 |
| marwanelamami/nabra-82m-int4qat-onnx (este) | 82M (nominal) | ONNX INT4 | Similar al FP32 con ruido de fondo leve | 56,9 MB | Apache 2.0 |
| marwanelamami/nabra-82m-int8-onnx (mencionado en la model card) | 82M | ONNX INT8 | Limpia, sin ruido perceptible | 83 MB | Apache 2.0 |

No se dispone de comparaciones con otros TTS arabes comerciales o academicos en la informacion proporcionada.

## Limitaciones y advertencias

- Ruido de fondo: se ha detectado un piso de ruido de banda ancha (~−37 dB relativo, centrado en 500–2500 Hz) audible durante el habla con auriculares en entornos silenciosos. Es una limitacion inherente a la cuantizacion INT4 de esta arquitectura.
- Calidad inferior al FP32: aunque la caracterizacion vocal es casi identica, la calidad objetiva es menor que la del modelo original. Para aplicaciones donde la pureza del audio sea critica, se recomienda usar la version INT8 (83 MB) o el modelo FP32.
- Solo arabe: el modelo esta entrenado exclusivamente para arabe, no soporta otros idiomas.
- Sin control de emociones ni prosodia avanzada: el unico control disponible es la velocidad y el vector de estilo predefinido.
- Dependencia de voces de referencia: el vector de estilo debe extraerse de un archivo de voces (`voices_af_msa.pt`), lo que requiere incluir ese recurso adicional en la aplicacion.
- No se han publicado detalles sobre sesgos o alucinaciones, pero al ser un TTS, el riesgo de alucinacion se limita a errores de pronunciacion o entonacion en textos complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marwanelamami/nabra-82m-int4qat-onnx
- Modelo base: https://huggingface.co/oddadmix/Nabra-82M-v0.1
- Repositorio del autor (GitHub): https://github.com/marwanelamami/marwanelamami
- Version ONNX del modelo base (referencia): https://huggingface.co/marwanelamami/Nabra-82M-v0.1-ONNX
