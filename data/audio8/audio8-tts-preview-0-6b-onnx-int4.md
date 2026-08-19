# Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4

## Resumen

Audio8 TTS Preview 0.6B es un modelo de síntesis de voz (text-to-speech) multilingüe de 0,6 mil millones de parámetros desarrollado por Audio8, una iniciativa open source que busca ofrecer capacidades de clonación de voz zero-shot a escala compacta. Esta versión concreta, el paquete ONNX INT4, está diseñada específicamente para inferencia en CPU sin necesidad de GPU ni dependencias de PyTorch o Transformers, lo que la hace atractiva para despliegues ligeros en entornos de producción o en hardware modesto.

El modelo emplea una arquitectura DualAR (dos transformadores autorregresivos) inspirada en Fish Audio S2 Pro: un transformer "slow AR" predice un token semántico por frame de audio, y un transformer "fast AR" predice los codebooks del codec neural condicionado por el estado oculto del primero. Soporta 11 idiomas, incluyendo español, y permite clonar voces a partir de una grabación de referencia de 0,5 a 30 segundos con su transcripción exacta. La ventana de contexto alcanza 2.048 posiciones empaquetadas de texto y audio.

Esta versión ONNX INT4 es relevante porque democratiza el acceso a TTS multilingüe de calidad SOTA en entornos sin GPU, con un consumo de memoria de aproximadamente 1 GiB en síntesis, y ofrece un servicio local con API HTTP, streaming PCM y endpoint compatible con OpenAI, lo que facilita su integración en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (slow AR + fast AR) con codec neural |
| Parametros totales | 601.159.424 (excluyendo el codec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | Pesos INT4 (weight-only), activaciones y KV cache en FP16, codec en FP16, salida FP32 |
| Idiomas soportados | Cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco, español (11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx con pesos externos .data) |

## Arquitectura y entrenamiento

La arquitectura DualAR se compone de dos transformers autorregresivos. El slow AR tiene 24 capas, ancho 896, 14 cabezas de atención y 2 cabezas KV; el fast AR tiene 4 capas con las mismas dimensiones. El slow AR predice un token semántico por frame de audio, mientras que el fast AR predice los 10 codebooks del codec neural (4.096 entradas por codebook) condicionado por el estado oculto del slow AR y los codebooks anteriores. El codec opera a 44,1 kHz con 2.048 muestras por frame (aproximadamente 21,5 frames por segundo).

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La innovación principal de esta versión es la cuantización weight-only INT4 de los modelos AR, que reduce el tamaño a aproximadamente 572 MiB para los archivos de inferencia en línea, manteniendo activaciones y KV cache en FP16. El paquete completo, incluyendo el encoder de registro de voz, ocupa unos 968 MiB.

## Capacidades

- Síntesis de voz multilingüe de alta calidad en 11 idiomas, con soporte explícito para español, chino, japonés, coreano, etc.
- Clonación de voz zero-shot: a partir de una grabación de referencia de 0,5 a 30 segundos y su transcripción exacta, el modelo genera un perfil de voz reutilizable.
- Inferencia en CPU nativa mediante ONNX Runtime, sin necesidad de CUDA ni GPU.
- Servicio local completo: CLI, interfaz web, API HTTP, streaming PCM y endpoint compatible con OpenAI.
- Registro de voces con encoder FP16 opcional, que se carga solo durante el registro para liberar memoria en síntesis.
- Salida de audio en formato PCM mono a 44,1 kHz.
- Soporte para clonación cross-lingual (usar una voz de referencia en un idioma para sintetizar en otro), según se menciona en la demo.
- Arquitectura de doble AR que permite un equilibrio entre calidad y velocidad de generación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en varios idiomas desde un servicio HTTP, integrándose en sistemas de IVR o chatbots con voz. Su baja huella de memoria (≈1 GiB) permite ejecutarlo en servidores CPU estándar sin GPU.
- Audiolibros y narración de contenidos: con clonación zero-shot, se puede crear una voz consistente para narrar libros, artículos o noticias en los 11 idiomas soportados, usando una única grabación de referencia.
- Asistentes de voz locales y privados: al ejecutarse completamente en local, es adecuado para aplicaciones que requieren privacidad (datos médicos, legales, financieros) sin enviar audio a servicios en la nube.
- Doblaje y localización de vídeo: la clonación cross-lingual permite doblar contenido usando la voz de un actor original, generando pistas de audio en otro idioma manteniendo el timbre y la entonación.
- Accesibilidad para personas con discapacidad del habla: una persona puede grabar una muestra de su voz (si es posible) o usar una voz personalizada para sistemas de comunicación aumentativa y alternativa (CAA).
- Generación de contenido educativo y e-learning: creación de lecciones de audio multilingües con una voz consistente, ideal para plataformas de formación online que necesitan actualizar contenido frecuentemente.
- Pruebas de productos y prototipado: gracias al endpoint compatible con OpenAI y la API HTTP, se puede integrar rápidamente en pipelines de desarrollo para generar muestras de voz en tests de UX o demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos comparativos con otros modelos TTS en términos de MOS (Mean Opinion Score), RTF (real-time factor) u otras métricas estándar.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU con ONNX Runtime (CPUExecutionProvider).
- Memoria RAM: aproximadamente 1.004 MiB tras la carga del modelo, entre 1,1 y 1,2 GiB en pico de síntesis, y alrededor de 1,55 GiB durante el registro de voz (medido en un MacBook Air M2 de 16 GB con 5 hilos de ONNX Runtime).
- CPU recomendada: cualquier CPU moderna con soporte de instrucciones AVX2 o ARM (probado en macOS arm64). No se especifican requisitos mínimos de núcleos, pero se recomienda al menos 4-8 hilos para una latencia razonable.
- GPU: no necesaria; el modelo está diseñado para CPU.
- Opciones de despliegue: ONNX Runtime directamente, o mediante el servicio incluido en el repositorio (CLI, web UI, HTTP API, streaming PCM, endpoint OpenAI-compatible). También se puede integrar en aplicaciones Python 3.11+.
- Latencia y throughput: no se proporcionan cifras concretas. La arquitectura DualAR con cuantización INT4 sugiere un rendimiento adecuado para síntesis en tiempo real o casi real en hardware moderno, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos TTS en la informacion proporcionada. La arquitectura está inspirada en Fish Audio S2 Pro, pero no se han facilitado mediciones comparativas. Como referencia cualitativa, se puede señalar que este modelo se diferencia de alternativas como XTTS v2 (Coqui) o VITS por su enfoque en CPU, su tamaño compacto (0,6B) y su licencia Apache 2.0, pero no hay datos objetivos de rendimiento para una comparación rigurosa.

## Limitaciones y advertencias

- Estado preview: la cobertura de idiomas es intencionalmente limitada a 11 lenguas; el autor indica que se ampliará en futuras versiones. Fuera de estos idiomas, el rendimiento puede degradarse.
- Riesgo de alucinación y errores de pronunciación: como todo modelo TTS, puede generar pronunciaciones incorrectas en nombres propios, palabras extranjeras o contextos fonéticamente ambiguos, especialmente en clonación cross-lingual.
- Dependencia de la calidad de la referencia: la clonación de voz requiere una grabación limpia (0,5-30 segundos) y una transcripción exacta; ruido de fondo, reverberación o errores en la transcripción degradan significativamente el resultado.
- Sesgos potenciales: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos no públicos, puede presentar variaciones en la calidad entre idiomas o acentos.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la calidad en producción. Se recomienda validar el modelo en el caso de uso concreto.
- Requisitos de entorno: requiere Python 3.11 o superior; la versión actual está probada solo en macOS arm64, aunque al ser ONNX Runtime debería funcionar en Linux y Windows, no está garantizado.
- El registro de voz carga un encoder adicional que aumenta el pico de memoria a ~1,55 GiB; en sistemas con RAM limitada, esto puede ser un factor a considerar.

## Enlaces

- HuggingFace (modelo ONNX INT4): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- HuggingFace (modelo base): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo de escucha: https://audio8-ai.github.io/Audio8_TTS/
