# Kj0rdan/gguf-ggml-model-mirror

## Resumen

Este repositorio no contiene un modelo original, sino un espejo (mirror) de cuatro archivos de pesos cuantizados ya publicados en otros repositorios. Su propósito es ofrecer una dirección estable y verificada para un conjunto fijo de pesos, ya que los repositorios upstream pueden reorganizarse, re-cuantizarse o eliminarse. Incluye dos modelos de lenguaje en formato GGUF para llama.cpp —Qwen3-1.7B (cuantización Q4_K_M) y Llama-3.2-3B-Instruct (Q4_K_M)— y dos modelos de reconocimiento de voz en formato GGML para whisper.cpp —Whisper base (float16) y Whisper tiny (float16)—. Todos los archivos son copias byte a byte, verificadas con SHA-256, y no han sido modificados.

La relevancia de este repositorio es práctica: permite a desarrolladores e investigadores descargar pesos concretos con una referencia estable, sin depender de la disponibilidad de los repositorios originales. Sin embargo, no aporta trabajo técnico nuevo; las conversiones y cuantizaciones fueron realizadas por unsloth, bartowski y Georgi Gerganov, y los pesos base pertenecen a Alibaba Cloud, Meta y OpenAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio (los archivos corresponden a modelos transformer, pero no se especifica en la documentación) |
| Parametros totales | Qwen3-1.7B: 1.7B; Llama-3.2-3B-Instruct: 3.2B; Whisper base: 74M; Whisper tiny: 39M |
| Parametros activos | No aplica (ninguno de los modelos es MoE) |
| Longitud de contexto | No disponible en el repositorio |
| Tipos de cuantizacion | Q4_K_M (Qwen3 y Llama 3.2); float16 (Whisper base y tiny) |
| Idiomas soportados | en (según metadatos del repositorio; los modelos originales pueden soportar más idiomas) |
| Licencia | Apache 2.0 (Qwen3); Llama 3.2 Community License (Llama 3.2); MIT (Whisper base y tiny) |
| Formato de pesos | GGUF (Qwen3 y Llama 3.2); GGML (Whisper base y tiny) |

## Arquitectura y entrenamiento

El repositorio no incluye información sobre arquitectura ni entrenamiento, ya que es un mirror de archivos cuantizados. Los modelos originales son bien conocidos: Qwen3-1.7B y Llama-3.2-3B-Instruct son modelos de lenguaje basados en transformadores, mientras que Whisper base y tiny son modelos encoder-decoder para reconocimiento de voz. Los archivos GGUF y GGML están optimizados para ejecutarse con llama.cpp y whisper.cpp respectivamente, lo que permite inferencia en CPU y GPU con bajo consumo de memoria.

No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. Los archivos son copias exactas de las versiones publicadas por unsloth, bartowski y ggerganov, y no han sido alterados.

## Capacidades

- Qwen3-1.7B (GGUF Q4_K_M): generación de texto, razonamiento, soporte de tool calling y modos agénticos, multilingüe (aunque el repositorio etiqueta solo inglés). Compatible con llama.cpp y entornos que cargan GGUF.
- Llama-3.2-3B-Instruct (GGUF Q4_K_M): generación de texto instructivo, razonamiento, tool calling, soporte de agentes, multilingüe. También en formato GGUF para llama.cpp.
- Whisper base (GGML float16): transcripción de voz a texto en inglés (según etiqueta), con 74M de parámetros. Diseñado para whisper.cpp.
- Whisper tiny (GGML float16): transcripción de voz a texto en inglés, con 39M de parámetros. Más ligero y rápido que base, adecuado para entornos con recursos limitados.

## Casos de uso

- Despliegue de un asistente conversacional en edge: Qwen3-1.7B en Q4_K_M ocupa solo 1.03 GiB, por lo que puede ejecutarse en una Raspberry Pi 5 o un mini-PC con 4 GB de RAM usando llama.cpp. Es adecuado para chatbots locales sin conexión.
- Generación de código en entornos de desarrollo: Llama-3.2-3B-Instruct soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar o revisar código, aunque su tamaño limitado puede no ser óptimo para tareas muy complejas.
- Transcripción de reuniones en tiempo real: Whisper tiny en GGML permite transcribir audio en dispositivos de bajo consumo, como un teléfono móvil o un microcontrolador con suficiente memoria, usando whisper.cpp.
- Archivado de pesos para reproducibilidad: el mirror garantiza que un experimento pueda reproducirse con exactamente los mismos pesos, incluso si los repositorios upstream cambian. Útil para investigación y auditoría.
- Prototipado rápido de aplicaciones de voz: combinar Whisper base para transcripción y Qwen3-1.7B para procesamiento de lenguaje natural permite construir un asistente de voz completo en un solo dispositivo.
- Evaluación comparativa de cuantizaciones: al tener dos LLM en Q4_K_M, se puede comparar el rendimiento entre Qwen3-1.7B y Llama-3.2-3B en tareas específicas sin depender de la disponibilidad de los repositorios originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, ni comparaciones con otros modelos. Para obtener datos de referencia, se deben consultar los repositorios upstream de los modelos originales.

## Requisitos de hardware

- Qwen3-1.7B Q4_K_M (1.03 GiB): puede ejecutarse en CPU con 4 GB de RAM, o en GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, Jetson Nano). Con llama.cpp o vLLM.
- Llama-3.2-3B-Instruct Q4_K_M (1.88 GiB): requiere al menos 4 GB de RAM en CPU, o 3 GB de VRAM en GPU (por ejemplo, RTX 3060, Jetson Orin). Con llama.cpp, Ollama o TGI.
- Whisper base GGML (141 MiB): funciona en CPU con 512 MB de RAM, o en GPU integrada. Con whisper.cpp.
- Whisper tiny GGML (74 MiB): funciona en CPU con 256 MB de RAM, ideal para microcontroladores con suficiente memoria. Con whisper.cpp.
- Opciones de despliegue: llama.cpp, whisper.cpp, Ollama, vLLM, TGI, o integración directa en C++.

## Comparativa con modelos similares

Dado que el repositorio contiene dos LLM y dos modelos de voz, se comparan entre sí y con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato | Tamaño archivo |
|---|---|---|---|---|---|
| Qwen3-1.7B (este repo) | 1.7B | No disponible | Apache 2.0 | GGUF Q4_K_M | 1.03 GiB |
| Llama-3.2-3B-Instruct (este repo) | 3.2B | No disponible | Llama 3.2 Community | GGUF Q4_K_M | 1.88 GiB |
| Qwen2.5-1.5B-Instruct (alternativa) | 1.5B | 32k | Apache 2.0 | GGUF | ~1 GiB |
| Phi-3-mini-4k (alternativa) | 3.8B | 4k | MIT | GGUF | ~2 GiB |

Para los modelos de voz, Whisper base y tiny son comparables a otros modelos de transcripción como wav2vec2 o Vosk, pero Whisper destaca por su robustez en entornos ruidosos y su integración con whisper.cpp.

## Limitaciones y advertencias

- Este repositorio es un mirror sin mantenimiento; los archivos pueden quedar obsoletos frente a nuevas versiones de los modelos originales.
- Las licencias son distintas según el archivo: Apache 2.0 para Qwen3, Llama 3.2 Community License (con política de uso aceptable de Meta) para Llama 3.2, y MIT para Whisper. Es obligatorio cumplir cada licencia por separado.
- No se proporcionan detalles sobre sesgos o alucinaciones de los modelos. Los sesgos inherentes de Qwen3, Llama 3.2 y Whisper se trasladan a estas copias.
- La etiqueta de idioma es solo "en", aunque los modelos originales soportan más idiomas. No se garantiza el rendimiento en otros idiomas.
- El contexto de los LLM no está documentado en el repositorio; se debe consultar la documentación oficial de Qwen3 y Llama 3.2 para conocer los límites reales.
- Para uso en producción, se recomienda verificar los checksums SHA-256 proporcionados en el README y descargar los archivos desde los repositorios upstream si se necesita soporte activo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kj0rdan/gguf-ggml-model-mirror
- README con licencias y checksums: https://huggingface.co/Kj0rdan/gguf-ggml-model-mirror/blob/main/README.md
- Qwen3-1.7B GGUF upstream (unsloth): https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
- Llama-3.2-3B-Instruct GGUF upstream (bartowski): https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
- whisper.cpp (ggerganov): https://huggingface.co/ggerganov/whisper.cpp
- Documentación de GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
- Llama 3.2 Acceptable Use Policy: https://www.llama.com/llama3_2/use-policy
