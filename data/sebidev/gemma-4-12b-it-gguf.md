# sebidev/gemma-4-12b-it-GGUF

## Resumen

sebidev/gemma-4-12b-it-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo google/gemma-4-12B-it, la variante de 12.000 millones de parámetros de la familia Gemma 4 de Google DeepMind. Se trata de un modelo multimodal encoder-free (procesa texto, imagen, audio y vídeo de forma nativa, sin encoders externos) e instruido, pensado para ejecución local en portátiles, workstations y GPUs de consumo. El repositorio lo publica el usuario sebidev y las cuantizaciones provienen del flujo de Unsloth Dynamic 2.0, según los tags y la model card redistribuida (gemma4, unsloth, gemma, google).

El modelo base es un transformer denso de 11.907.350.576 parámetros (aproximadamente 11,9B), con soporte de contexto largo (la familia Gemma 4 llega hasta 256K tokens) y más de 140 idiomas. Incorpora modos de razonamiento configurables ("thinking modes"), soporte nativo de function calling y del rol `system`, lo que lo hace adecuado para flujos agénticos. Su relevancia actual radica en que traslada capacidades multimodales y de razonamiento de nivel frontera a hardware de consumo, en un único paquete sin encoders separados.

Al estar en formato GGUF, el modelo se puede ejecutar con llama.cpp, Ollama o LM Studio, con múltiples niveles de cuantización que ajustan el uso de memoria. El repositorio ocupa 177,4 GB (suma de todas las cuantizaciones publicadas) y la licencia declarada es Apache 2.0, la misma del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal encoder-free (texto, imagen, audio, vídeo) con atención híbrida (sliding window local + atención global) |
| Parámetros totales | 11.907.350.576 (≈11,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 256K tokens según la familia Gemma 4; los modelos pequeños de la familia se limitan a 128K. El valor exacto para el 12B no se especifica en la información disponible |
| Tipos de cuantización | GGUF (Unsloth Dynamic 2.0); el repositorio incluye varias cuantizaciones (el tamaño del repo, 177,4 GB, corresponde a la suma de todas) |
| Idiomas soportados | Más de 140 idiomas (soporte multilingüe de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base google/gemma-4-12B-it) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer densa con un mecanismo de atención híbrido que intercala atención local de ventana deslizante (sliding window) con atención global completa, garantizando que la capa final sea siempre global. Este diseño busca combinar la velocidad de procesamiento y el bajo consumo de memoria de un modelo ligero con la capacidad de mantener contexto largo. Para optimizar memoria en contextos extensos, las capas globales usan Keys y Values unificados y aplican Proportional RoPE (p-RoPE). La variante 12B es encoder-free: integra la comprensión de audio y visión de forma nativa, sin encoders independientes, lo que reduce el tamaño de despliegue.

La familia Gemma 4 incluye arquitecturas densas (E2B, E4B, 12B, 31B) y Mixture-of-Experts (26B A4B), y todos los modelos están diseñados como razonadores con modos de pensamiento configurables. El modelo card menciona soporte añadido de MTP (multi-token prediction) y ajuste fino mediante Unsloth Studio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables ("thinking modes").
- Comprensión multimodal nativa: texto, imagen (con soporte de relación de aspecto y resolución variables), vídeo y audio.
- Codificación: mejoras destacadas en benchmarks de código según Google, orientadas a tareas de programación y agentes.
- Function calling / tool calling nativo.
- Flujos agénticos y razonamiento multi-paso.
- Soporte nativo del rol `system`, que permite conversaciones más estructuradas y controlables.
- Multilingüe en más de 140 idiomas.
- Soporte de MTP (multi-token prediction) añadido en actualizaciones posteriores.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline `image-text-to-text`.

## Casos de uso

- Asistente multimodal local: el modelo puede procesar capturas de pantalla, fotos o documentos escaneados junto a texto en un único flujo, sin necesidad de encoders externos, lo que simplifica el despliegue en portátiles.
- Razonamiento con contexto largo: para análisis de documentos extensos, revisiones de código o resúmenes de conversaciones largas, aprovechando la ventana de contexto de la familia Gemma 4 (hasta 256K tokens).
- Agentes autónomos con tool calling: integración en pipelines agénticos donde el modelo decide cuándo llamar a APIs o funciones externas, gracias al soporte nativo de function calling.
- Generación de código en producción: asistencia de programación en editores y revisión de PR, integrándose en flujos de desarrollo con contexto de repositorio amplio.
- Atención al cliente automatizada: gestión de conversaciones multiturno en varios idiomas (más de 140), con soporte de `system` para definir políticas y tono de respuesta.
- Transcripción y análisis de audio/vídeo: al aceptar entrada de audio y vídeo de forma nativa, sirve para resumir reuniones, generar subtítulos o extraer información de contenido audiovisual en local.
- Procesamiento en el borde: despliegue en GPUs de consumo mediante cuantizaciones GGUF de 4 bits para aplicaciones con requisitos de privacidad (datos que no salen del equipo).
- Ajuste fino y personalización: al ser un modelo de pesos abiertos con licencia Apache 2.0, se puede afinar para dominios concretos (legal, médico, industrial) con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que Unsloth publica benchmarks de cuantización (Unsloth Dynamic 2.0), pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en los datos proporcionados, por lo que no se presentan tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ≈11,9B parámetros, aproximaciones según cuantización):
  - Q4_K_M: ≈7,7 GB.
  - Q5_K_M: ≈9 GB.
  - Q6_K: ≈10 GB.
  - Q8_0: ≈13 GB.
  - F16: ≈24 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q8/F16; RTX 3090 o 4080 (16-24 GB) para Q5/Q6; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) para Q4.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, Jan y Unsloth Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints. vLLM y TGI no se confirman en la información disponible para este formato GGUF concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de cifras de rendimiento comparadas para poblarlas con datos verificables. Se incluye una comparativa a nivel de repositorio y licencia con alternativas publicadas de la misma categoría (GGUF del Gemma 4 12B IT):

| Modelo / repositorio | Parámetros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sebidev/gemma-4-12b-it-GGUF | ≈11,9B | GGUF (Unsloth Dynamic 2.0) | Familia Gemma 4: hasta 256K | Apache 2.0 | Repositorio analizado; cuantizaciones de Unsloth redistribuidas |
| ggml-org/gemma-4-12B-it-GGUF | ≈11,9B | GGUF | Integrante de la familia Gemma 4 12B | Apache 2.0 | Cuantizaciones oficiales de ggml-org |
| google/gemma-4-12B-it (base) | ≈11,9B | safetensors | Hasta 256K (familia) | Apache 2.0 | Modelo original de Google DeepMind, pesos sin cuantizar |
| SC117/Gemma-4-12B-it-heretic-GGUF | ≈11,9B | GGUF | Integrante de la familia Gemma 4 12B | Variable | Versión "abliterated" sin censura, distinta alineación |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma explícita en la información proporcionada; al ser un modelo de propósito general hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado tasas de alucinación concretas para esta variante.
- Cuantización: las versiones en 4 bits o inferiores pueden degradar la calidad de salida y las capacidades de razonamiento respecto a los pesos originales en safetensors.
- Contexto e idioma: aunque la familia soporta hasta 256K tokens y más de 140 idiomas, el rendimiento puede degradarse en los extremos de la ventana de contexto y en idiomas con pocos recursos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base declara el enlace a la licencia de Gemma (ai.google.dev/gemma/docs/gemma_4_license); conviene revisar los términos del modelo original de Google antes de uso comercial.
- Procedencia: este repositorio lo publica el usuario sebidev y redistribuye cuantizaciones; para producción conviene contrastar con el repositorio oficial de Google o de ggml-org.
- Datos incompletos: no se especifican idiomas exactos, número de tokens de entrenamiento, composición del dataset ni métricas de seguridad, lo que dificulta una evaluación exhaustiva.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/sebidev/gemma-4-12b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cuantizaciones de ggml-org: https://huggingface.co/ggml-org/gemma-4-12B-it-GGUF
- Versión alternativa (heretic): https://huggingface.co/SC117/Gemma-4-12B-it-heretic-GGUF
- Cuantizaciones de bartowski: https://huggingface.co/bartowski/gemma-4-12B-it-GGUF
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Blog de lanzamiento de Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Guía de Unsloth para Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Guía MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- GGUFs de Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Colección Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- Colección Gemma 4 de Google: https://huggingface.co/collections/google/gemma-4
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- GitHub de Google Gemma: https://github.com/google-gemma
