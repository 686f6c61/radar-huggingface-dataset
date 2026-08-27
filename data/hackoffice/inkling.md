# hackoffice/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, la empresa fundada por Mira Murati, y presentado el 15 de julio de 2026 como su primer modelo público de producción. Se trata de un transformer decoder-only con arquitectura de mezcla de expertos (MoE) que acepta entradas de texto, imagen y audio, y genera salidas de texto. Con 975 mil millones de parámetros totales y 41 mil millones activos por token, está diseñado para tareas de razonamiento, codificación, uso de herramientas y sistemas agénticos, y se distribuye con pesos abiertos bajo licencia Apache-2.0.

El modelo destaca por ser el primer open-weights de EE. UU. en situarse a la cabeza de la clasificación del Artificial Analysis Intelligence Index, con una puntuación de 41. Su arquitectura híbrida de atención local y global, junto con un encaje multimodal nativo, le permite procesar imágenes de hasta 4096 píxeles por lado y audio WAV de 16 kHz en segmentos de hasta 20 minutos. La liberación de pesos abiertos y el soporte para despliegue local mediante bibliotecas como vLLM, SGLang o Unsloth lo convierten en una opción relevante para desarrolladores e investigadores que buscan un modelo de frontera sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (66 capas, 256 expertos, 6 activos por token + 2 expertos compartidos) |
| Parametros totales | 975B (según modelo card; el archivo safetensors contiene 952.377.623.626 parámetros) |
| Parametros activos | 41B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés (principal), con capacidades multilingües generales |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling emplea un transformer decoder-only de 66 capas con una red feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de los 256 expertos disponibles, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales, lo que permite capturar dependencias de corto y largo alcance de forma eficiente. El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación discreta de tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decodificador.

Los datos de entrenamiento provienen de fuentes públicas, adquisiciones de terceros y generación sintética, e incluyen texto, imágenes, audio y vídeo. El proceso de curado incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o avanzar en objetivos de seguridad. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; la información disponible no detalla estos aspectos.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto, imagen y audio, y produce respuestas en texto UTF-8.
- Razonamiento avanzado: obtiene un 29,7% en HLE (texto solo) y un 46,0% con herramientas, y un 97,1% en AIME 2026.
- Codificación agéntica: alcanza un 77,6% en SWEBench Verified y un 54,3% en SWEBench Pro (público), lo que indica capacidad para resolver tareas de ingeniería de software reales.
- Uso de herramientas y sistemas agénticos: el modelo card lo recomienda explícitamente para aplicaciones con tool-use y agentes.
- Soporte multilingüe: diseñado principalmente para inglés, con capacidades generales en otros idiomas.
- Procesamiento de audio: acepta audio WAV a 16 kHz, idealmente segmentos de menos de 20 minutos, y lo integra con el contexto textual.
- Despliegue flexible: compatible con SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.

## Casos de uso

- Asistentes de codificación en producción: gracias a su rendimiento en SWEBench Verified (77,6%), puede integrarse en pipelines de CI/CD para revisión de código, generación de parches y resolución de issues, con soporte de tool calling para interactuar con repositorios y entornos de ejecución.
- Sistemas de atención al cliente multimodal: al aceptar imágenes y audio, puede gestionar consultas que incluyan capturas de pantalla, diagramas o mensajes de voz, manteniendo conversaciones multi-turno con contexto largo.
- Agentes autónomos de razonamiento: su capacidad para usar herramientas y su puntuación en HLE con herramientas (46,0%) lo hacen adecuado para agentes que necesitan planificar, buscar información y ejecutar acciones en entornos externos.
- Análisis de documentos técnicos: puede procesar documentos con figuras, tablas y ecuaciones, combinando texto e imágenes para extraer información y responder preguntas complejas.
- Transcripción y análisis de audio: al aceptar audio WAV, puede transcribir reuniones, extraer conclusiones o generar resúmenes a partir de grabaciones, integrándolas con contexto textual adicional.
- Investigación y desarrollo de modelos: al ser open-weights con licencia Apache-2.0, permite fine-tuning y adaptación para dominios específicos, así como estudios de interpretabilidad y alineación.

## Benchmarks y rendimiento

Los resultados se reportan a effort=0.99 y las comparaciones se generaron el 14 de julio de 2026. Los modelos de pesos abiertos son Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro; los de pesos cerrados son Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (texto solo) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (con herramientas) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| SWEBench Pro (público) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | no disponible |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información disponible. Dado el tamaño total de 975B parámetros, se pueden hacer las siguientes estimaciones orientativas:

- En BF16, los pesos ocupan aproximadamente 1,95 TB, lo que requiere múltiples GPUs de alta gama (por ejemplo, 8 o más H100 de 80 GB) para inferencia.
- En NVFP4, el peso se reduce a unos 0,5 TB, lo que podría caber en 8 GPUs H100 o A100 de 80 GB, aunque la memoria de activaciones y el contexto adicional deben considerarse.
- No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño total; incluso con 41B activos, todos los expertos deben residir en memoria.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, con recetas oficiales disponibles.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

La información disponible no incluye parámetros, contexto ni licencias de los modelos comparados, por lo que la comparativa se limita a los resultados de benchmarks publicados en el modelo card. Los modelos comparables son Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro (todos de pesos abiertos). Inkling se sitúa por encima de Nemotron 3 Ultra en todos los benchmarks reportados, y compite de cerca con Kimi K2.5 y DeepSeek V4 Pro, aunque queda por detrás de GLM 5.2 en razonamiento puro (HLE y AIME). En tareas agénticas de codificación, supera a Nemotron 3 Ultra y Kimi K2.5, pero es ligeramente inferior a Kimi K2.6 y DeepSeek V4 Pro en SWEBench Verified. No se dispone de datos de parámetros, contexto ni licencia de estos modelos para una comparativa más completa.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos específicos del modelo; al entrenarse con datos públicos de internet, es probable que herede sesgos sociales y culturales presentes en esos datos.
- Riesgo de alucinación: como cualquier modelo generativo grande, puede producir información falsa o inventada, especialmente en contextos de alta incertidumbre.
- Limitaciones de idioma: aunque tiene capacidades multilingües generales, está optimizado principalmente para inglés; el rendimiento en otros idiomas puede ser inferior.
- Longitud de contexto no especificada: no se ha publicado la ventana de contexto máxima, lo que dificulta planificar aplicaciones que requieran procesar documentos muy largos.
- Requisitos de hardware elevados: el tamaño total de 975B parámetros exige infraestructura de múltiples GPUs de alta gama, lo que limita su uso en entornos con recursos reducidos.
- Restricciones de uso: aunque la licencia es Apache-2.0, Thinking Machines publica una política de uso aceptable (Acceptable Use Policy) que debe revisarse antes de implementar el modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackoffice/Inkling
- Modelo BF16 (referencia): https://huggingface.co/thinkingmachines/Inkling
- Modelo NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Página oficial de Inkling: https://thinkingmachines.ai/inkling/
- Model card oficial: https://thinkingmachines.ai/model-card/inkling/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Análisis en AI2: https://ai2.work/blog/thinking-machines-inkling-model-enters-a-crowded-frontier-ai-race
- Artículo en Artificial Analysis: https://artificialanalysis.ai/articles/thinking-machines-has-released-inkling-the-new-leading-u-s-open-weights-model
- Análisis en Miraflow: https://miraflow.ai/blog/thinking-machines-inkling-explained-open-weight-moe-model-2026
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
