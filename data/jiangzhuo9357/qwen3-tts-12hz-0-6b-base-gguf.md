# jiangzhuo9357/qwen3-tts-12hz-0-6b-base-gguf

## Resumen

Qwen3-TTS 12Hz 0.6B Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba Cloud, convertido a formato GGUF por jiangzhuo9357 para su uso con la librería synthesize.cpp. Este modelo está especializado en clonación de voz a partir de una grabación de referencia: con unos pocos segundos de audio es capaz de sintetizar texto nuevo en esa misma voz, ya sea solo con el audio o con la transcripción asociada (lo que el equipo upstream denomina ICL, in-context learning). Soporta inglés, chino y japonés.

La arquitectura combina un decodificador autoregresivo Qwen3 de 28 capas que genera un código semántico por cada frame de 80 ms, un predictor de códigos de 5 capas que expande cada código semántico en quince códigos acústicos, y un decodificador SEANet que convierte esos códigos en audio a 24 kHz. El modelo tiene aproximadamente 1.085 millones de parámetros totales y se distribuye en tres perfiles de cuantización: BF16, F16 y Q8_MIXED, siendo este último el recomendado por defecto por su equilibrio entre tamaño y velocidad (RTF 0.863, más rápido que en tiempo real).

Esta conversión GGUF es relevante porque permite ejecutar clonación de voz de alta calidad en hardware modesto sin necesidad de GPU, ya que la mayor parte del cómputo se ejecuta en CPU. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador autoregresivo Qwen3 (28 capas) + predictor de códigos (5 capas) + decodificador SEANet |
| Parametros totales | 1.085.102.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_MIXED |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio original de Qwen) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-TTS: un decodificador autoregresivo basado en Qwen3 de 28 capas que genera un token semántico por cada frame de 80 ms, seguido de un predictor de códigos de 5 capas que expande cada token semántico en quince códigos acústicos mediante residual vector quantization (RVQ). Finalmente, un decodificador SEANet convierte esos códigos en forma de onda a 24 kHz. Esta estructura de tres etapas permite separar el modelado del contenido lingüístico de la síntesis acústica, lo que facilita la clonación de voz: el modelo aprende a representar la identidad del hablante en un x-vector que se inyecta en el proceso de generación.

El entrenamiento del modelo original no está detallado en la información disponible, pero el repositorio de Qwen indica que la serie Qwen3-TTS soporta generación de voz estable, expresiva y en streaming, diseño de voz libre y clonación de voz vívida. La conversión a GGUF fue validada el 2026-08-17 contra la implementación PyTorch upstream en bfloat16 sobre CUDA, reproduciendo la estructura temporal exacta en 13 casos de prueba. Los pesos del codificador de voz (convoluciones) se mantienen en F16 en el perfil Q8_MIXED, y la mitad del códec permanece en F32 en todos los perfiles, lo que garantiza que los códigos de referencia producidos son byte-idénticos entre perfiles.

## Capacidades

- Clonación de voz a partir de una grabación de referencia de pocos segundos, con o sin transcripción asociada (ruta ICL).
- Síntesis de voz en inglés, chino y japonés.
- Generación de voz expresiva y natural a 24 kHz de frecuencia de muestreo.
- Reproducibilidad: una semilla nombrada reproduce el audio byte a byte; semillas distintas producen audios distintos.
- El paquete no incluye voces predefinidas; el usuario debe preparar un Voice Profile (perfil de voz) a partir de una grabación.
- Soporte de entrada mediante texto UTF-8 o directamente mediante token IDs.
- Integración con synthesize.cpp, que ofrece una API pública en C con interfaces para control de semilla, voz y resolución de idioma.

## Casos de uso

- Audiolibros y narración personalizada: un editor puede clonar la voz de un narrador profesional a partir de una muestra breve y generar horas de narración sin sesiones de grabación adicionales, manteniendo coherencia de voz en todo el proyecto.
- Asistentes de voz con identidad propia: empresas pueden crear asistentes virtuales con una voz consistente y reconocible clonada de un actor de doblaje, desplegándolos en dispositivos con recursos limitados gracias al perfil Q8_MIXED que funciona en CPU.
- Localización de contenido audiovisual: para doblaje de vídeos o cursos en varios idiomas, el modelo puede clonar la voz del presentador original y sintetizar el guion traducido en inglés, chino o japonés con la misma voz.
- Accesibilidad para personas con discapacidad del habla: una persona que pierde la voz puede generar un perfil a partir de grabaciones previas y usar el modelo para comunicarse con su propia voz sintetizada en tiempo real.
- Generación de contenido educativo multilingüe: plataformas de e-learning pueden producir lecciones de audio en tres idiomas con la misma voz instructora, reduciendo costes de producción y manteniendo consistencia de marca.
- Desarrollo de videojuegos y mundos virtuales: los estudios pueden clonar voces de actores para generar diálogos dinámicos y procedimentales sin sesiones de grabación adicionales, integrándolo en pipelines de generación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de síntesis de voz, no de lenguaje general. Los datos de validación proporcionados son:

| Metrica | BF16 | F16 | Q8_MIXED |
|---|---|---|---|
| Similitud de voz (x-vector cosine) | 0.99999467 | 0.99999501 | 0.99999501 |
| Real-time factor (CPU) | 3.15 | no medido | 0.863 |
| Tamano del archivo | 2399.9 MB | 2400.1 MB | 1590.4 MB |
| Comprobaciones de integridad de la API | 7 pasadas, 3 no aplicables | 7 pasadas, 3 no aplicables | 7 pasadas, 3 no aplicables |

## Requisitos de hardware

- VRAM estimada: el perfil Q8_MIXED ocupa 1590.4 MB en disco, por lo que cabría en GPUs consumer con 4 GB o más de VRAM, aunque la mayor parte del cómputo se ejecuta en CPU.
- GPU recomendadas: la validación se realizó en NVIDIA GB10 (DGX Spark) con CUDA 13.3, pero el modelo está diseñado para ejecutarse principalmente en CPU; la GPU solo acelera el decodificador del códec.
- El perfil Q8_MIXED alcanza un RTF de 0.863 en CPU, es decir, genera audio más rápido que en tiempo real; el perfil BF16 tarda 3.15x el tiempo real en CPU.
- CUDA aporta aproximadamente un 8% de mejora end-to-end (RTF 3.15 a 2.95 en BF16), porque el decodificador autoregresivo se ejecuta en CPU por la regla de salidas discretas.
- Opciones de despliegue: synthesize.cpp (la librería objetivo), con API pública en C; compatible con integraciones que usen GGUF.
- Latencia estimada: para una referencia de 8 segundos, los grafos de clonación cuestan aproximadamente 1.69 segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Clonacion de voz |
|---|---|---|---|---|---|---|
| Qwen3-TTS 12Hz 0.6B Base (GGUF) | 1.085M | no disponible | en, zh, ja | Apache-2.0 | GGUF | Si |
| Qwen3-TTS 12Hz 0.6B CustomVoice (GGUF) | no disponible | no disponible | en, zh, ja | Apache-2.0 | GGUF | No (9 voces predefinidas) |
| Qwen3-TTS (modelo original, safetensors) | 1.085M | no disponible | en, zh, ja | Apache-2.0 | safetensors | Si |

La diferencia estructural con el paquete CustomVoice es que esta variante no cataloga voces predefinidas: el usuario debe crear un Voice Profile. El paquete CustomVoice, en cambio, incluye nueve voces fijas y no permite clonación.

## Limitaciones y advertencias

- No se han realizado evaluaciones formales de calidad de audio (quality_evaluation: not_run); la auditoría de escucha indica "no_obvious_regression" pero no hay métricas objetivas publicadas.
- El modelo solo soporta tres idiomas: inglés, chino y japonés; no hay soporte para español u otros idiomas.
- No incluye voces predefinidas: es necesario preparar un Voice Profile a partir de una grabación de referencia, lo que añade un paso técnico al flujo de trabajo.
- La clonación de voz plantea riesgos éticos y legales: requiere consentimiento del hablante cuya voz se clona, y su uso para suplantación o fraude puede violar leyes de protección de datos y derechos de imagen.
- El perfil BF16 requiere 2.4 GB de almacenamiento y es 3.15x más lento que el tiempo real en CPU; el perfil Q8_MIXED es el recomendado para producción.
- No se ha medido el rendimiento en GPU para el perfil Q8_MIXED; los datos de RTF disponibles son exclusivamente para CPU.
- La validación se realizó contra una revisión concreta del repositorio upstream; futuras actualizaciones de Qwen3-TTS podrían no ser compatibles con esta conversión.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/jiangzhuo9357/qwen3-tts-12hz-0-6b-base-gguf
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Repositorio GitHub de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Colección Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Repositorio de synthesize.cpp: https://github.com/handy-computer/synthesize.cpp
- Paquete CustomVoice (variante sin clonación): https://huggingface.co/jiangzhuo9357/qwen3-tts-12hz-0-6b-customvoice-gguf
