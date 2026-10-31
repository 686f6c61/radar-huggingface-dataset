# Kremon96/gemma-4-26B-A4B-it-GGUF

## Resumen

Esta ficha corresponde a una cuantización GGUF de **Gemma 4 26B A4B-it**, el modelo instruido multimodal de tamaño medio de la familia Gemma 4 desarrollada por Google DeepMind. El repositorio, publicado por el usuario Kremon96, se basa en las cuantizaciones Unsloth Dynamic 2.0 del modelo original `google/gemma-4-26B-A4B-it` y ofrece los pesos en formato GGUF compatibles con llama.cpp, Ollama y otros runtimes locales. Se trata de una variante Mixture-of-Experts (MoE) con unos 25.230 millones de parámetros totales, de los cuales solo una fracción se activa por token, lo que permite un rendimiento cercano a modelos densos de mayor tamaño con un coste de inferencia mucho menor.

Gemma 4 aborda el problema de llevar capacidades de nivel frontera (razonamiento, código, agentes y comprensión multimodal de texto e imagen) a despliegues eficientes, desde móviles hasta servidores. Esta variante de 26B A4B está orientada a GPUs de consumo y estaciones de trabajo, con una ventana de contexto de hasta 256K tokens, soporte de más de 140 idiomas, modos de pensamiento configurables (thinking), function calling nativo y soporte del rol `system`. Su licencia Apache 2.0 (según la model card del repositorio) lo hace especialmente atractivo para uso comercial y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, atención híbrida (sliding window + global) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | ~4B (indicado por la denominación "A4B"; dato exacto no disponible) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, con imatrix); variantes concretas no disponibles |
| Idiomas soportados | Más de 140 idiomas (según la familia Gemma 4) |
| Licencia | Apache 2.0 (según la model card; enlaza a la Gemma license de Google) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

Gemma 4 26B A4B emplea una arquitectura transformer con Mixture-of-Experts, lo que permite activar aproximadamente 4 mil millones de parámetros por token sobre un total de ~25 mil millones, reduciendo drásticamente el coste de inferencia manteniendo la capacidad del modelo completo. Utiliza un mecanismo de atención híbrido que intercala capas de atención local por ventana deslizante con capas de atención global completa (asegurando que la última capa sea global). Para optimizar memoria en contextos largos, las capas globales comparten claves y valores unificados y aplican Proportional RoPE (p-RoPE).

La familia Gemma 4 se publica en variantes pre-entrenadas e instruction-tuned, con soporte multimodal de texto e imagen (con resolución y aspect ratio variables), y modos de razonamiento configurables. El repositorio incluye además soporte MTP (Multi-Token Prediction) según las notas de Unsloth, que acelera la decodificación. Los detalles sobre el número de tokens de entrenamiento y la composición exacta del dataset del modelo base no están disponibles en la información proporcionada; el post-entrenamiento incluye instruction tuning y, según la model card, mejoras específicas en código y capacidades agénticas con function calling nativo.

## Capacidades

- Generación de texto y razonamiento de alto nivel, con modos de pensamiento (thinking) configurables.
- Comprensión de imágenes (pipeline image-text-to-text) con soporte de resolución y aspect ratio variables.
- Generación y comprensión de código, con mejoras destacadas en benchmarks de programación respecto a la generación anterior.
- Function calling / tool calling nativo, orientado a agentes autónomos y flujos multi-step.
- Soporte nativo del rol `system` para conversaciones más estructuradas y controlables.
- Ventana de contexto de 256K tokens para documentos largos y conversaciones extensas.
- Soporte multilingüe en más de 140 idiomas.
- Ejecución eficiente gracias a la arquitectura MoE (solo ~4B de parámetros activos por token).
- Soporte MTP (multi-token prediction) en el ecosistema Unsloth para acelerar la inferencia.

## Casos de uso

- **Atención al cliente automatizada**: la ventana de 256K tokens y el soporte nativo del rol `system` permiten gestionar conversaciones multi-turno extensas con historiales largos, políticas de empresa incrustadas en el prompt y múltiples documentos de contexto.
- **Agentes autónomos y orquestación de herramientas**: el function calling nativo y las mejoras agénticas lo hacen adecuado para pipelines multi-step que consultan APIs, ejecutan código o navegan sistemas externos.
- **Análisis de documentos multimodal**: puede procesar documentos que combinan texto e imágenes (informes escaneados, capturas, gráficos) aprovechando el encoder de visión del modelo base.
- **Asistente de programación local**: con ~4B de parámetros activos, ofrece latencias bajas en GPUs de consumo para autocompletado, refactorización y revisión de código sin depender de servicios en la nube.
- **Procesamiento multilingüe**: el soporte de más de 140 idiomas permite construir chatbots y sistemas de resumen para bases de usuarios internacionales, incluido el castellano.
- **Razonamiento sobre problemas complejos**: los modos de thinking configurables permiten dedicar más cómputo a tareas de matemáticas, lógica o planificación cuando la calidad prima sobre la velocidad.
- **Despliegue on-premise por requisitos de privacidad**: la licencia Apache 2.0 y el formato GGUF facilitan su ejecución en infraestructura propia para sectores regulados (salud, legal, banca).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un MoE de 25.2B totales con ~4B activos, una cuantización Q4_K_M en GGUF ocuparía aproximadamente 14-16 GB; los tamaños exactos por cuantización no están disponibles en la información proporcionada (el tamaño total del repo, 392.6 GB, sugiere que incluye múltiples variantes o archivos adicionales).
- **GPUs recomendadas**: una RTX 4090 (24 GB) o RTX 3090 debería alojar las cuantizaciones de 4 bits; para cuantizaciones más altas (Q8, FP16) se recomiendan GPUs con 48 GB o más (A6000, A100).
- **Consumer GPUs**: cabe en una RTX 4090 con cuantizaciones de 4 bits; también es viable en configuraciones con descarga parcial a CPU/RAM dado el bajo número de parámetros activos.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; también Unsloth Studio según la model card. No hay confirmación de soporte en vLLM o TGI para esta cuantización concreta.
- **Latencia y throughput**: no disponibles; la arquitectura MoE con ~4B activos y el soporte MTP sugieren latencias competitivas, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Característica | Gemma 4 26B A4B (esta ficha) | Gemma 4 31B Dense | Qwen3 30B A3B |
|---|---|---|---|
| Arquitectura | MoE (~4B activos) | Densa (30.7B) | MoE (~3B activos) |
| Parámetros totales | 25.2B | 30.7B | 30.5B |
| Contexto | 256K | 256K | no disponible |
| Modalidades | Texto, imagen | Texto, imagen | no disponible |
| Licencia | Apache 2.0 (según model card) | Gemma license | Apache 2.0 |
| Formato | GGUF (Unsloth Dynamic 2.0) | GGUF, safetensors | GGUF, safetensors |

Frente al 31B denso de la misma familia, esta variante MoE ofrece inferencia notablemente más rápida y menor huella de memoria activa con una calidad esperadamente cercana. Frente a Qwen3 30B A3B, compite en la misma categoría de MoE de ~30B totales con pocos parámetros activos, añadiendo multimodalidad nativa y un contexto de 256K; los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- No soporta audio: en la familia Gemma 4, el audio es nativo solo en los modelos pequeños (E2B y E4B); el 26B A4B procesa texto e imagen.
- El repositorio es una cuantización de terceros (Kremon96, basada en Unsloth), no publicada por Google; pueden existir diferencias de calidad o compatibilidad respecto a los pesos oficiales.
- La model card enlaza la Gemma license de Google aunque declara Apache 2.0; conviene verificar los términos de uso de Gemma (prohibiciones de uso, políticas de aceptable uso) antes de despliegue comercial.
- Como todo LLM, presenta riesgo de alucinación, especialmente en datos factuales y fechas; no hay evaluaciones de sesgo específicas publicadas para esta cuantización.
- No se han publicado benchmarks para esta versión cuantizada; el rendimiento real puede diferir del modelo base en 16 bits, especialmente en cuantizaciones agresivas.
- El tamaño del repositorio (392.6 GB) es inusualmente grande para un modelo de este tamaño; descargad solo los archivos GGUF de la cuantización necesaria.
- La lista de idiomas exactos soportados no está detallada en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kremon96/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Colección Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial: https://ai.google.dev/gemma/docs/core
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía Unsloth para Gemma 4: https://docs.unsloth.ai/models/gemma-4
- Unsloth Dynamic 2.0 GGUFs: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Guía MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Google DeepMind (Gemma): https://deepmind.google/models/gemma/
