# 52ZZYHLJJ/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-4B-Uncensored-HauhauCS-Aggressive es una variante del modelo Qwen3.5-4B, desarrollada por HauhauCS y publicada bajo el nombre de usuario 52ZZHLJJ en Hugging Face. Su propósito principal es eliminar los mecanismos de rechazo (refusals) del modelo original, ofreciendo una versión "sin censura" que mantiene supuestamente todas las capacidades del modelo base. La model card afirma que consigue 0 rechazos en 465 pruebas, sin pérdida de capacidades.

El modelo mantiene la arquitectura híbrida de Qwen3.5-4B: combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1, con 32 capas y 4.2 mil millones de parámetros densos. Es nativamente multimodal (texto, imagen y vídeo), con un contexto nativo de 262 000 tokens extensible a 1 millón mediante YaRN, y un vocabulario de 248 000 tokens que cubre 201 idiomas. La licencia es Apache-2.0, lo que permite uso comercial.

La relevancia de este modelo reside en su carácter "uncensored" para aplicaciones que requieren respuestas sin restricciones de contenido, aunque esto plantea riesgos importantes de uso indebido. Está disponible en formato GGUF para su ejecución con llama.cpp, LM Studio, Ollama, Jan y koboldcpp, con varias cuantizaciones que permiten su despliegue en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet linear attention + full softmax attention (3:1) |
| Parametros totales | 4 205 751 296 (4,2 B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (formato GGUF) |
| Idiomas soportados | 201 idiomas (incluye inglés, chino y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj para el encoder de visión) |

## Arquitectura y entrenamiento

La arquitectura es híbrida, combinando dos mecanismos de atención: Gated DeltaNet de atención lineal y atención softmax completa en una proporción de 3:1. Esta combinación es una innovación reciente (la arquitectura se publicó en 2026) que busca reducir el coste computacional de la atención estándar manteniendo la calidad en contextos largos. El modelo cuenta con 32 capas y un vocabulario de 248 000 tokens, lo que le permite cubrir 201 idiomas.

La variante "Aggressive" se ha obtenido mediante un proceso de eliminación de rechazos sobre el modelo base Qwen3.5-4B. La model card indica que no se han realizado cambios en los datos de entrenamiento ni en las capacidades del modelo, sino que se ha eliminado el comportamiento de rechazo. No se especifican detalles sobre el método exacto de eliminación de refusals, aunque se menciona que el modelo puede ocasionalmente añadir un descargo de responsabilidad al final de las respuestas, lo que se atribuye al entrenamiento del modelo base y no a un rechazo real.

El modelo es nativamente multimodal, con soporte para texto, imagen y vídeo. Incluye un archivo `mmproj` que contiene el encoder de visión, necesario para procesar entradas de imagen o vídeo. También soporta multi-token prediction (MTP) y dispone de un modo de pensamiento (thinking mode) que requiere mantener al menos 128K de contexto para preservar las capacidades de razonamiento.

## Capacidades

- Generación de texto y razonamiento multilingüe en 201 idiomas.
- Soporte multimodal: procesa imágenes y vídeo además de texto, mediante el encoder de visión incluido en el archivo `mmproj`.
- Modo de pensamiento (thinking mode) por defecto, con recomendaciones de temperatura y top-p específicas para optimizar el razonamiento.
- Multi-token prediction (MTP), que permite predecir varios tokens simultáneamente para mejorar el throughput.
- Sin mecanismos de rechazo: el modelo está diseñado para no negarse a responder ninguna solicitud, incluso si esta es problemática.
- Extensión de contexto hasta 1M tokens mediante la técnica YaRN.
- Compatible con múltiples runtimes: llama.cpp, LM Studio, Jan, koboldcpp, Ollama, vLLM, SGLang y KTransformers.

## Casos de uso

- Asistentes de conversación sin restricciones: el modelo puede mantener conversaciones multi-turno sin rechazar solicitudes, lo que lo hace útil para aplicaciones de chat libre en las que el usuario requiere respuestas directas.
- Análisis de documentos largos: con su contexto nativo de 262K tokens, puede procesar y resumir documentos extensos, como informes técnicos, libros o historiales de conversaciones.
- Procesamiento multimodal en entornos locales: al ser capaz de procesar imágenes y vídeo, puede utilizarse para describir contenido visual, extraer información de imágenes o generar subtítulos, sin necesidad de servicios en la nube.
- Generación de código y asistencia técnica: aunque no se especifican capacidades específicas de código, su base Qwen3.5 y su modo de razonamiento lo hacen adecuado para tareas de programación asistida, especialmente en entornos donde se requiere respuestas sin restricciones.
- Investigación sobre alineación y seguridad: su comportamiento "uncensored" permite estudiar los efectos de la eliminación de refusals en modelos de lenguaje, comparando con las versiones originales.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M (2,6 GB) y Q6_K (3,3 GB), puede ejecutarse en GPUs de consumo como la NVIDIA GTX 1060 o RTX 3060, o incluso en CPU con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se indica que el modelo mantiene el 100% de las capacidades del modelo original, pero no se proporcionan datos cuantitativos que respalden esta afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, se requiere aproximadamente:
  - BF16: 7,9 GB de VRAM.
  - Q8_0: 4,2 GB de VRAM.
  - Q6_K: 3,3 GB de VRAM.
  - Q4_K_M: 2,6 GB de VRAM.
- GPUs recomendadas: para BF16 se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 12 GB o RTX 4070). Para cuantizaciones Q4_K_M o Q6_K, una GPU con 4-6 GB de VRAM puede ser suficiente (GTX 1660, RTX 3050, etc.).
- En consumer GPU: sí, cabe en GPU de consumo con 4 GB o más de VRAM, especialmente con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, koboldcpp, Ollama, vLLM, SGLang, KTransformers.
- Latencia y throughput: no disponibles; dependen del hardware y del runtime. La arquitectura híbrida con atención lineal debería mejorar el rendimiento en contextos largos, pero no se han publicado medidas concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2 B | 262K (ext. 1M) | Apache-2.0 | Safetensors, GGUF | Modelo original con mecanismos de rechazo |
| Qwen3.5-4B-Uncensored-HauhauCS-Aggressive | 4,2 B | 262K (ext. 1M) | Apache-2.0 | GGUF | Variante sin rechazos, multimodal |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9 B | no disponible | Apache-2.0 | no disponible | Variante de mayor tamaño del mismo autor, mencionada en la model card |

No se dispone de datos de rendimiento comparativos para estos modelos. La comparativa se basa únicamente en especificaciones técnicas publicadas.

## Limitaciones y advertencias

- El modelo está diseñado para no rechazar solicitudes, lo que implica un riesgo elevado de generar contenido inapropiado, ilegal o peligroso. Su uso en entornos de producción debe estar sujeto a medidas de moderación adicionales.
- Aunque la model card afirma "zero capability loss", no se han publicado benchmarks que lo confirmen. La eliminación de rechazos puede afectar al comportamiento de seguridad del modelo.
- El modelo puede ocasionalmente añadir descargos de responsabilidad al final de las respuestas, lo que puede resultar confuso en aplicaciones que esperan respuestas directas.
- La arquitectura es muy reciente (publicada en marzo de 2026) y el soporte en llama.cpp es muy reciente; se recomienda usar builds actualizados para evitar errores de compatibilidad.
- La extensión de contexto a 1M tokens mediante YaRN puede degradar el rendimiento si no se aplica correctamente.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataforma o normativas legales según el uso.
- No se proporcionan datos sobre la calidad de las respuestas en todos los idiomas soportados; el rendimiento puede variar significativamente fuera de inglés y chino.

## Enlaces

- Modelo en HuggingFace (autor original): https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo en HuggingFace (publicación de 52ZZHLJJ): https://huggingface.co/52ZZHLJJ/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante de 9B: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio de despliegue en Colab: https://github.com/CookieFilled/qwen-3.5-4B-uncensored-colab
- Página en Ollama: https://ollama.com/jaahas/qwen3.5-uncensored
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
