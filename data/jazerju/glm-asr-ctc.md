# JazerJu/glm-asr-ctc

## Resumen

El modelo `JazerJu/glm-asr-ctc` es un cabezal CTC (Connectionist Temporal Classification) diseñado para acoplarse al encoder congelado de `zai-org/GLM-ASR-Nano-2512`, un modelo de reconocimiento automático de voz (ASR) de código abierto con 1.500 millones de parámetros desarrollado por Z.ai. Este cabezal, creado por JazerJu, permite convertir las representaciones de audio del encoder en secuencias de tokens de texto mediante decodificación CTC, una alternativa más ligera y rápida que los decodificadores autoregresivos.

El cabezal tiene 40 millones de parámetros en precisión fp32 y se distribuye como un archivo `safetensors`. El sistema completo (encoder + cabezal) está optimizado para entornos reales con ruido, acentos y dialectos, y según el repositorio oficial supera a OpenAI Whisper V3 en varios benchmarks. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El modelo se publicó en agosto de 2026 y aún no registra descargas, por lo que se considera una contribución reciente a la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal CTC sobre encoder congelado de GLM-ASR-Nano-2512 (arquitectura del encoder no especificada en la información disponible) |
| Parametros totales | 40 millones (cabezal) + 1.500 millones (encoder, congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del encoder y de la ventana de audio, no especificada) |
| Tipos de cuantizacion | fp32 nativo; exportación a int4 ONNX disponible en el repositorio vinculado |
| Idiomas soportados | Mandarín, inglés, cantonés y otros dialectos (según el modelo base GLM-ASR-Nano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cabezal) y ONNX (exportación) |

## Arquitectura y entrenamiento

El cabezal CTC es una capa de proyección lineal que toma las representaciones de salida del encoder GLM-ASR-Nano (dimensión 1280) y las mapea a un vocabulario de 59.264 tokens, con un token especial "blank" en la posición 59.263. El encoder permanece congelado durante el entrenamiento del cabezal, lo que permite un ajuste eficiente sin reentrenar el modelo completo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El repositorio original de GLM-ASR indica que el modelo base fue entrenado para robustez en condiciones acústicas adversas y con soporte amplio de dialectos chinos, pero los detalles específicos del entrenamiento del cabezal no se han publicado.

## Capacidades

- Reconocimiento de voz automático (ASR) de audio a texto, con salida CTC directa (sin decodificación autoregresiva).
- Soporte multilingüe: mandarín, inglés, cantonés y otros dialectos, según las capacidades del encoder base.
- Robustez frente a ruido, acentos y variaciones dialectales, como se indica en la documentación del modelo base.
- Compatibilidad con herramientas de exportación a ONNX (incluida cuantización int4) para despliegue en entornos de producción.
- Integración con el tokenizador compartido entre el CTC y el LLM subyacente (tokens-phase2.txt), lo que facilita la combinación con modelos de lenguaje para tareas de post-procesado.

## Casos de uso

- Transcripción de reuniones y grabaciones: el modelo puede transcribir audio en tiempo real o diferido, aprovechando su robustez frente a ruido de fondo y múltiples hablantes, gracias al encoder de 1.500 millones de parámetros.
- Subtitulado automático de vídeo: la salida CTC directa permite generar subtítulos con baja latencia, adecuada para plataformas de streaming o herramientas de edición.
- Asistentes de voz en dialectos: el soporte de cantonés y otros dialectos posibilita la creación de asistentes de voz para regiones donde Whisper u otros modelos fallan.
- Sistemas de dictado médico o legal: la precisión en entornos con terminología específica y acentos variados puede mejorar la exactitud frente a soluciones genéricas.
- Indexación de archivos de audio: convertir grandes volúmenes de audio en texto para búsqueda y análisis posterior, utilizando la exportación ONNX para despliegue en CPU.
- Pruebas de accesibilidad: generar transcripciones para personas con discapacidad auditiva en aplicaciones educativas o corporativas, con licencia Apache 2.0 que permite integración comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este cabezal CTC en la información disponible. El modelo base GLM-ASR-Nano-2512 afirma superar a OpenAI Whisper V3 en varios benchmarks, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda consultar el repositorio oficial de GLM-ASR para obtener datos actualizados.

## Requisitos de hardware

- El cabezal CTC añade solo 40 millones de parámetros, por lo que su coste computacional es marginal en comparación con el encoder.
- El encoder GLM-ASR-Nano de 1.500 millones de parámetros requiere aproximadamente 3 GB de VRAM en fp16 o unos 0,8 GB en cuantización int4 (según estimaciones estándar, no confirmadas por el autor).
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores con cuantización; para fp32 se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: exportación a ONNX (incluido int4) para inferencia en CPU o GPU; el repositorio `JazerJu/GLM-ASR-CTC-GGUF` sugiere soporte para llama.cpp u otros entornos GGUF, aunque no se detalla.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con alternativas como Whisper V3, ya que no hay benchmarks públicos para este cabezal específico. A nivel cualitativo, el modelo base GLM-ASR-Nano destaca por su soporte de dialectos chinos y su tamaño compacto (1.500 millones de parámetros frente a los 1.550 millones de Whisper Large V3), pero se requieren pruebas independientes para validar estas afirmaciones.

## Limitaciones y advertencias

- No hay información sobre sesgos específicos del modelo; como todo sistema ASR, puede presentar errores en acentos poco representados o en condiciones acústicas extremas.
- Riesgo de alucinación: la decodificación CTC es menos propensa a generar texto inventado que los modelos autoregresivos, pero aún puede producir errores de transcripción en audio ambiguo.
- La longitud de contexto no está especificada; se desconoce la duración máxima de audio que puede procesar el encoder de una sola vez.
- El modelo depende del encoder congelado; cualquier limitación del encoder (idiomas, dialectos) se hereda en el sistema completo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base `zai-org/GLM-ASR-Nano-2512` por si tuviera restricciones adicionales.
- El repositorio del cabezal no incluye el encoder; para usarlo es necesario descargar ambos componentes por separado.

## Enlaces

- [Modelo en HuggingFace: JazerJu/glm-asr-ctc](https://huggingface.co/JazerJu/glm-asr-ctc)
- [Repositorio de exportación GGUF: JazerJu/GLM-ASR-CTC-GGUF](https://github.com/JazerJu/GLM-ASR-CTC-GGUF)
- [Modelo preparado para benchmarks ONNX: JazerJu/glm-asr-ctc-bench](https://huggingface.co/JazerJu/glm-asr-ctc-bench)
- [Repositorio oficial del modelo base: zai-org/GLM-ASR](https://github.com/zai-org/GLM-ASR/)
- [Modelo base en HuggingFace: zai-org/GLM-ASR-Nano-2512](https://huggingface.co/zai-org/GLM-ASR-Nano-2512)
