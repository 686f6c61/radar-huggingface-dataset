# q3146dq4/supertonic-3-quant

## Resumen

Supertonic-3 Quant es una versión cuantizada en precisión fp16 del modelo de síntesis de voz Supertonic-3, desarrollada por el usuario q3146dq4 como derivado directo del modelo original de Supertone Inc. El modelo base es un sistema de text-to-speech (TTS) de 99 millones de parámetros, de pesos abiertos, diseñado para ejecutarse en dispositivos locales sin necesidad de GPU ni conexión a la nube. Esta variante cuantizada reduce el tamaño de los pesos ONNX de 380 MB a 191 MB, manteniendo una calidad cercana al fp32 (aproximadamente el 99 %), y está pensada como reemplazo directo de los assets ONNX oficiales para despliegues en escritorio, móvil o integraciones con Electron.

El modelo soporta 31 idiomas (incluido español, inglés, coreano, japonés, árabe, etc.) y ofrece 10 voces predefinidas con estilos diferenciados. Su arquitectura combina un codificador de texto, un predictor de duración, un estimador de vectores basado en una U-Net de difusión tipo ConvNeXt y un vocoder, todo ello empaquetado en cuatro archivos ONNX. La relevancia actual radica en que permite síntesis de voz de alta calidad en tiempo real en CPU, con latencias de alrededor de 0,7 segundos para frases cortas en Apple Silicon, y con aceleración adicional mediante CoreML o DirectML.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion / flow-matching con text encoder, duration predictor, vector estimator (ConvNeXt U-Net) y vocoder |
| Parametros totales | 99 M (modelo base, segun documentacion oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | fp16 (ONNX) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL-M (heredada de Supertone/supertonic-3) |
| Formato de pesos | ONNX (4 archivos: text_encoder, duration_predictor, vector_estimator, vocoder) |

## Arquitectura y entrenamiento

El modelo base Supertonic-3 emplea una arquitectura de difusión con flow-matching para la generación de voz. Se compone de cuatro módulos principales: un codificador de texto que convierte la entrada en representaciones semánticas, un predictor de duración que estima la duración de cada fonema, un estimador de vectores (vector_estimator) que actúa como una U-Net de difusión basada en ConvNeXt para generar los vectores acústicos, y un vocoder que transforma esos vectores en audio final. El modelo fue entrenado por Supertone Inc. con datos multilingües, aunque no se han publicado detalles específicos sobre el volumen de datos ni el proceso de entrenamiento (RLHF, DPO, etc.) en la información disponible.

La cuantización de este repositorio se realizó mediante la herramienta `onnxruntime.transformers.float16.convert_float_to_float16`, con opciones `keep_io_types=True` (mantiene las entradas y salidas en fp32 para compatibilidad con el SDK) y `op_block_list=['Cast']` para evitar errores de tipo. Se aplicó inferencia de formas (shape inference) sobre los pesos fp32 originales antes de la conversión. No se incluye una variante int8 porque las pruebas con cuantización dinámica en el `vector_estimator` generaron nodos `ConvInteger` no implementados en muchas compilaciones de ONNX Runtime, y la cuantización restringida a MatMul solo reducía el tamaño un 6 % al estar el modelo dominado por capas convolucionales.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, con soporte para español, inglés, coreano, japonés, árabe, francés, alemán, etc.
- Diez voces predefinidas con estilos diferenciados: cinco masculinas (Alex, James, Robert, Sam, Daniel) y cinco femeninas (Sarah, Lily, Jessica, Olivia, Emily), cada una con descripciones como "enérgica", "profunda", "cálida", etc.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU ni conexión a internet.
- Compatibilidad con los SDK oficiales de Supertonic para Python, C++ y Node.js, actuando como reemplazo directo de los assets ONNX originales.
- Aceleración opcional mediante CoreML (macOS) y DirectML (Windows) para un rendimiento 2-3 veces superior y menor uso de RAM.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz en dispositivos móviles o de escritorio: el modelo puede integrarse en aplicaciones de asistente personal para generar respuestas habladas en tiempo real, aprovechando su baja latencia (~0,7 s en CPU) y su tamaño reducido (191 MB) que cabe en dispositivos con almacenamiento limitado.
- Lectura de textos para accesibilidad: aplicaciones de lectura de pantalla o de libros electrónicos pueden usar Supertonic-3 Quant para convertir artículos, libros o noticias en audio, con soporte multilingüe que cubre las principales lenguas europeas y asiáticas.
- Generación de audiolibros local: productores de contenido pueden sintetizar narraciones completas sin depender de servicios en la nube, eligiendo entre las 10 voces según el tono deseado (por ejemplo, Robert para narración formal o Emily para un tono suave).
- Doblaje de vídeos y presentaciones: creadores de vídeo pueden generar locuciones en varios idiomas a partir de guiones, usando las voces predefinidas y ajustando el estilo según el contexto (Jessica para estilo broadcast, Lily para tono alegre).
- Sistemas de respuesta interactiva por voz (IVR): centralitas telefónicas o chatbots de voz pueden desplegar el modelo en servidores locales para generar mensajes dinámicos en múltiples idiomas, reduciendo costes de infraestructura al no requerir GPU.
- Aplicaciones de aprendizaje de idiomas: plataformas educativas pueden ofrecer pronunciación de palabras y frases en 31 idiomas, con voces claras y naturales, funcionando sin conexión en dispositivos de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque se trata de un modelo de síntesis de voz, no de lenguaje general. La información disponible incluye mediciones de rendimiento de síntesis en Apple Silicon (CPU EP) para una frase corta en coreano:

| Variante | Tamano | Tiempo de sintesis |
|---|---|---|
| fp32 (modelo base) | 380 MB | ~0,7 s |
| fp16 (este repo) | 191 MB | ~0,7 s |

Con el uso de CoreML EP (macOS) o DirectML EP (Windows) se reporta una aceleración de 2-3 veces y una reducción de RAM de aproximadamente el 50 %, aunque no se proporcionan cifras exactas de latencia en esos entornos.

## Requisitos de hardware

- Almacenamiento: 191 MB para los pesos fp16, más los archivos de configuración y voces (voice_styles) que se comparten con el modelo original.
- CPU: funciona en cualquier procesador compatible con ONNX Runtime, incluyendo CPUs de bajo consumo como las de Raspberry Pi o dispositivos móviles ARM.
- GPU: no es necesaria; el modelo está diseñado para ejecutarse en CPU. Opcionalmente, se puede usar GPU con CoreML (macOS) o DirectML (Windows) para aceleración.
- RAM: el consumo típico no se especifica, pero al ser fp16 se estima inferior al del modelo fp32 (que requiere aproximadamente 380 MB de memoria para los pesos).
- Opciones de despliegue: ONNX Runtime (Python, C++, Node.js), CoreML, DirectML. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: ~0,7 s para frases cortas en CPU Apple Silicon; con aceleración nativa se espera 2-3 veces menor.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Supertonic-3 en su versión fp32, ya que este repositorio es una cuantización del mismo. No se dispone de datos comparativos con otros modelos TTS de código abierto (como Piper, Coqui TTS o VITS) en la información proporcionada.

| Modelo | Tamano | Formato | Idiomas | Latencia (CPU) | Licencia |
|---|---|---|---|---|---|
| Supertonic-3 (fp32) | 380 MB | ONNX | 31 | ~0,7 s | OpenRAIL-M |
| Supertonic-3 Quant (fp16, este repo) | 191 MB | ONNX | 31 | ~0,7 s | OpenRAIL-M |
| Otros TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia OpenRAIL-M con restricciones de uso (Attachment A): prohibido el uso para suplantación de identidad o deepfakes sin consentimiento, generación de contenido sin revelar que es sintético, asesoramiento médico, actividades ilegales, entre otros.
- La calidad de audio es ligeramente inferior a la del modelo fp32 original (aproximadamente 99 % de fidelidad), aunque en la práctica puede ser imperceptible.
- No existe variante int8 debido a problemas de compatibilidad con nodos `ConvInteger` en muchas compilaciones de ONNX Runtime; los usuarios que necesiten un tamaño menor deberán esperar una futura cuantización estática.
- El modelo solo realiza síntesis de voz; no incluye capacidades de reconocimiento de voz, traducción ni procesamiento de lenguaje natural.
- Las voces predefinidas son fijas; no se permite la clonación de voz ni la creación de voces personalizadas con este repositorio.
- El rendimiento en CPU puede variar según la arquitectura del procesador; los tiempos reportados corresponden a Apple Silicon y pueden diferir en otras plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q3146dq4/supertonic-3-quant
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Sitio oficial de Supertonic 3: https://supertonic3.github.io/
- Demo oficial en HuggingFace Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Repositorio original del autor (Kyumdroid): https://huggingface.co/Kyumdroid/supertonic-3-quant
