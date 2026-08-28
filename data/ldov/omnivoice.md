# ldov/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) masivamente multilingüe y zero-shot desarrollado por Xiaomi y el grupo k2-fsa. Su arquitectura, basada en un modelo de lenguaje de difusión discreto no autorregresivo, mapea directamente el texto a tokens de audio, evitando el pipeline tradicional de dos etapas (texto a semántica y semántica a acústica) y logrando una inferencia más rápida y de alta calidad. El modelo soporta más de 600 idiomas, clonación de voz y diseño de voces nuevas, con una salida de audio de 24 kHz en mono.

La versión `ldov/OmniVoice` es una conversión a formato GGUF para su uso con `omnivoice.cpp`, un port en C++17/GGML que permite ejecutar el modelo en CPU, CUDA, ROCm, Metal y Vulkan. El modelo se divide en dos archivos GGUF que se cargan conjuntamente: un backbone basado en Qwen3 0.6B que convierte texto en tokens, y un tokenizador que combina HuBERT, DAC y RVQ para convertir tokens en audio. Esta conversión ofrece varias opciones de cuantización (F32, BF16, Q8_0, Q4_K_M) para adaptarse a distintos requisitos de memoria y fidelidad.

La relevancia actual de OmniVoice reside en su cobertura lingüística sin precedentes y su capacidad para clonar voces con pocos segundos de referencia, lo que lo convierte en una opción atractiva para aplicaciones de doblaje, asistentes de voz, accesibilidad y creación de contenido multilingüe. La disponibilidad de pesos en GGUF facilita su despliegue en entornos de producción con recursos limitados, manteniendo una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model-style discrete non-autoregressive (NAR) con backbone Qwen3 0.6B y tokenizador HuBERT + DAC + RVQ |
| Parametros totales | 612.577.280 (según safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, BF16, Q8_0, Q4_K_M |
| Idiomas soportados | Más de 600 idiomas (los tags listan: en, fr, de, es, it, pt, zh, ja, ko, ar, ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: base y tokenizador) |

## Arquitectura y entrenamiento

OmniVoice emplea una arquitectura de modelo de lenguaje de difusión discreto no autorregresivo. A diferencia de los modelos NAR discretos convencionales que adolecen de cuellos de botella en pipelines de dos etapas (texto a semántica y semántica a acústica), OmniVoice mapea directamente el texto a tokens de audio. El backbone principal es un modelo Qwen3 de 0.6B que procesa el texto y genera representaciones intermedias, mientras que el tokenizador combina HuBERT (para extracción de características acústicas), DAC (códec de audio) y RVQ (cuantización residual vectorial) para convertir esas representaciones en audio de 24 kHz.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El paper arXiv (2604.00688) describe la arquitectura y el enfoque, pero no se incluyen datos concretos de entrenamiento en la información proporcionada. La conversión GGUF mantiene la misma arquitectura y pesos, pero con cuantización opcional para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Síntesis de voz zero-shot en más de 600 idiomas, incluyendo cobertura amplia de lenguas minoritarias.
- Clonación de voz: a partir de una muestra de referencia de pocos segundos, puede replicar la voz de un hablante.
- Diseño de voz: permite generar voces nuevas o modificar características de una voz existente.
- Generación de audio de alta calidad a 24 kHz en formato mono.
- Inferencia rápida gracias a la arquitectura NAR de difusión que evita el pipeline de dos etapas.
- Soporte de múltiples backends de ejecución: CPU, CUDA, ROCm, Metal y Vulkan, lo que permite desplegarse en una amplia variedad de hardware.
- Compatible con herramientas de C++/GGML, como `omnivoice.cpp`, que facilita su integración en aplicaciones nativas.

## Casos de uso

- Doblaje de vídeos multilingüe: OmniVoice puede generar voces en decenas de idiomas a partir de un guion, manteniendo la entonación y el estilo de una voz de referencia. Su cobertura de 600+ idiomas permite localizar contenido para audiencias globales sin necesidad de actores de voz por idioma.
- Asistentes de voz personalizados: empresas y desarrolladores pueden crear asistentes con una voz específica (clonada de un locutor o diseñada desde cero) que responda en el idioma del usuario. La inferencia en CPU o GPU ligera permite integrarlo en dispositivos edge.
- Audiolibros y narración automática: la capacidad de clonar voces permite producir audiolibros con la voz de un narrador concreto a partir de texto, en múltiples idiomas, reduciendo costes de producción.
- Accesibilidad para personas con discapacidad visual: sistemas de lectura de pantalla que utilizan voces naturales y multilingües, mejorando la experiencia de navegación en aplicaciones y sitios web.
- Traducción de voz a voz en tiempo real: combinado con un sistema de traducción automática, OmniVoice puede convertir el habla de un idioma a otro manteniendo la voz del hablante original, útil en videoconferencias y servicios de interpretación.
- Creación de contenido educativo: generación de material didáctico en audio en varios idiomas, con voces consistentes y de alta calidad, para plataformas de e-learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La descripción del modelo menciona "alta calidad" y "velocidad de inferencia superior", pero no se proporcionan métricas cuantitativas (como MOS, RTF, etc.) en los materiales consultados.

## Requisitos de hardware

- Tamaño de los archivos GGUF por variante (base + tokenizador):
  - F32: 2.46 GB + 734 MB ≈ 3.2 GB
  - BF16: 1.23 GB + 373 MB ≈ 1.6 GB
  - Q8_0: 656 MB + 289 MB ≈ 945 MB
  - Q4_K_M: 407 MB + 252 MB ≈ 659 MB
- VRAM estimada: con la variante Q8_0 se necesitan aproximadamente 1 GB de VRAM para cargar ambos archivos, y con Q4_K_M unos 700 MB. Por tanto, es ejecutable en GPUs consumer con 2 GB o más (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente memoria compartida).
- GPU recomendadas: cualquier GPU compatible con CUDA (NVIDIA), ROCm (AMD) o Vulkan (AMD, Intel, NVIDIA). Para máxima velocidad se recomiendan GPUs modernas de arquitectura Ada o Blackwell, aunque también funciona en modelos más antiguos.
- CPU: puede ejecutarse en CPU, con la variante Q4_K_M para minimizar el uso de memoria.
- Opciones de despliegue: `omnivoice.cpp` (C++17/GGML) con soporte para CUDA, ROCm, Metal, Vulkan y CPU. No se mencionan integraciones directas con vLLM, Ollama o TGI, ya que es un modelo TTS y no un LLM general.
- Latencia y throughput: no se dispone de datos concretos. La arquitectura NAR y la cuantización GGUF sugieren tiempos de inferencia bajos, pero no se especifican cifras.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar OmniVoice con otros modelos TTS de la misma categoría (por ejemplo, XTTS, Bark, VITS) en términos de parámetros, contexto, rendimiento y licencia. Los datos disponibles se limitan a la descripción del propio modelo y su conversión GGUF. Se recomienda consultar benchmarks externos o realizar pruebas propias para evaluar su rendimiento relativo.

## Limitaciones y advertencias

- La información proporcionada no incluye detalles sobre sesgos o errores específicos del modelo. Como TTS multilingüe, es probable que presente imprecisiones en idiomas poco representados o con ortografía compleja.
- Riesgo de alucinación: en TTS, las "alucinaciones" se manifiestan como pronunciaciones incorrectas o artefactos de audio, especialmente en nombres propios o palabras fuera de vocabulario.
- Limitaciones de contexto: no se especifica la longitud máxima de texto que puede procesar en una sola pasada. Para textos largos puede ser necesario dividirlos en fragmentos.
- La conversión GGUF introduce pérdida de calidad en las variantes cuantizadas (especialmente Q4_K_M). Se recomienda usar Q8_0 o BF16 para aplicaciones donde la fidelidad de audio sea crítica.
- Es necesario cargar dos archivos GGUF (base y tokenizador) que deben mantenerse sincronizados en versión y cuantización.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe atribuir adecuadamente y no se proporciona garantía.
- Para producción, se recomienda validar la calidad de salida en los idiomas objetivo y probar la estabilidad del runtime `omnivoice.cpp` en el hardware seleccionado.

## Enlaces

- [HuggingFace: ldov/OmniVoice](https://huggingface.co/ldov/OmniVoice)
- [GitHub: omnivoice.cpp (ServeurpersoCom)](https://github.com/ServeurpersoCom/omnivoice.cpp)
- [GitHub: k2-fsa/OmniVoice (modelo original)](https://github.com/k2-fsa/OmniVoice/)
- [Paper arXiv: OmniVoice](https://arxiv.org/html/2604.00688v1)
- [OpenVox AI: OmniVoice Local TTS Model](https://openvoxai.com/models/omnivoice)
- [HuggingFace: OrpheraAI/OmniVoice](https://huggingface.co/OrpheraAI/OmniVoice)
