# arbonquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines (distribuido en Hugging Face bajo el espacio `arbonquants/Inkling`) que acepta entradas de texto, imagen y audio y genera texto. Se trata de un transformer autoregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos más 2 expertos compartidos activos siempre. Con 975B parámetros totales y 41B activos, se posiciona en la liga de los grandes modelos abiertos tipo MoE.

La arquitectura es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches, y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decoder de forma conjunta. La atención combina capas locales y globales, lo que permite gestionar contextos largos con un coste computacional contenido.

El modelo es relevante ahora porque compite directamente con pesos abiertos como Nemotron 3 Ultra, Kimi K2.5/K2.6, GLM 5.2 y DeepSeek V4 Pro, y se distribuye bajo licencia Apache 2.0 con soporte para despliegue local en SGLang, vLLM, TokenSpeed, Unsloth y Transformers, además de acceso vía API en el playground de Tinker. Su enfoque en agentes, tool-use y asistentes de código lo orienta a aplicaciones de producción, no solo a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (66 capas, atencion hibrida local/global) |
| Parametros totales | 975B (952.377.623.626 segun safetensors) |
| Parametros activos | 41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soportados oficialmente); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles principal; capacidades multilingues generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 1904.8 GB |

## Arquitectura y entrenamiento

Inkling es un transformer decoder-only de 66 capas con una red feed-forward de mezcla de expertos dispersa: de los 256 expertos disponibles, cada token activa 6, y adicionalmente 2 expertos compartidos permanecen activos en todos los tokens. La atención es híbrida, combinando capas de atención local con capas de atención global, un patrón habitual en modelos de contexto largo que reduce el coste cuadrático en las capas locales. La multimodalidad es nativa: un codificador jerárquico de parches procesa imágenes y vídeo, mientras que el audio se tokeniza de forma discreta; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas, de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y reforzar objetivos de seguridad. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de la atención híbrida local/global.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Razonamiento y matemáticas, con resultados destacados en AIME 2026 (97,1%) y GPQA Diamond (87,2%).
- Codificación agéntica: SWEBench Verified 77,6% y SWEBench Pro (Public) 54,3%.
- Tool calling y uso de herramientas: HLE con herramientas alcanza 46,0% frente al 29,7% sin ellas.
- Soporte de agentes y razonamiento multi-paso, orientado a sistemas agénticos y asistentes de código.
- Entrada de imagen en cualquier formato basado en píxeles (dimensión óptima entre 40px y 4096px).
- Entrada de audio en WAV a 16 kHz (idealmente menos de 20 minutos).
- Entrada de vídeo a través del codificador jerárquico de parches.
- Capacidades multilingües generales, con inglés como idioma principal.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes de código en producción: con SWEBench Verified del 77,6%, puede integrarse en pipelines de CI/CD para resolución automática de issues, generación de parches y revisión de código, apoyándose en tool calling para consultar repositorios y ejecutar tests.
- Atención al cliente multimodal: gestión de conversaciones multi-turno que combinan texto, capturas de pantalla e imágenes de producto, con capacidad de razonamiento sobre la imagen enviada por el usuario.
- Sistemas agénticos de automatización: orquestación de tareas multi-paso con uso de herramientas externas (APIs, bases de datos, navegadores) gracias a su rendimiento en HLE con herramientas.
- Análisis de reuniones y audio: transcripción y razonamiento sobre audio WAV de hasta 20 minutos, útil para resúmenes de reuniones, extracción de acciones y generación de actas.
- RAG multimodal: recuperación aumentada sobre documentos que mezclan texto e imágenes (informes, manuales técnicos, documentación escaneada), con el modelo razonando sobre ambos tipos de contenido.
- Asistencia matemática y científica: resolución de problemas de competición y razonamiento de nivel doctorado (AIME 2026 97,1%, GPQA Diamond 87,2%) para herramientas educativas o de investigación.
- Análisis de vídeo: descripción y razonamiento sobre contenido audiovisual mediante el codificador jerárquico de parches, aplicable a moderación de contenido o análisis de escenas.

## Benchmarks y rendimiento

Resultados reportados a effort=0.99, comparativas generadas el 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29,7% | 26,6% | 29,4% | 35,9% | 40,1% | 35,9% | 44,7% | 53,3% | 47,2% |
| HLE (with tools) | 46,0% | 37,4% | 50,2% | 54,0% | 54,7% | 48,2% | 51,4% | 64,5% | 55,0% |
| AIME 2026 | 97,1% | 94,2% | 95,8% | 96,4% | 99,2% | 96,7% | 98,3% | – | 99,9% |
| GPQA Diamond | 87,2% | 86,7% | 87,9% | 91,1% | 89,5% | 88,8% | 94,1% | 92,6% | 94,1% |
| SWEBench Verified | 77,6% | 70,7% | 76,8% | 80,2% | – | 80,6% | 80,6% | 95,0% | – |
| SWEBench Pro (Public) | 54,3% | 46,4% | 50,7% | 58,6% | 62,1% | 55,4% | 54,2% | 80,0% | 6 (dato truncado en la fuente) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 975B parámetros totales, en BF16 el modelo requiere aproximadamente 1,9 TB de VRAM (coincide con el tamaño del repo de 1904,8 GB); en NVFP4 se reduce a aproximadamente 0,5 TB.
- GPU recomendadas: para BF16, nodos multi-GPU con H100/H200 o B200; para NVFP4, configuraciones de 8×H100/H200 o superiores.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en ninguna cuantización oficial; 41B parámetros activos no reducen el requisito de memoria total, solo el coste de cómputo por token.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Transformers; también acceso vía API en Tinker Playground y proveedores de inferencia de terceros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | HLE (tools) | SWEBench Verified |
|---|---|---|---|---|---|---|
| Inkling | 975B | 41B | no disponible | Apache 2.0 | 46,0% | 77,6% |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | pesos abiertos | 37,4% | 70,7% |
| Kimi K2.6 | no disponible | no disponible | no disponible | pesos abiertos | 54,0% | 80,2% |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | pesos abiertos | 48,2% | 80,6% |

Inkling se sitúa por encima de Nemotron 3 Ultra en todos los benchmarks comparados, pero por debajo de Kimi K2.6 y DeepSeek V4 Pro en HLE con herramientas y SWEBench Verified. Frente a los modelos cerrados (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol), queda por detrás en razonamiento de nivel doctorado, aunque su licencia Apache 2.0 y sus pesos abiertos lo hacen más adecuado para despliegue propio y ajuste fino.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse con datos de internet y sintéticos, es probable que herede sesgos de esas fuentes.
- Riesgo de alucinación: inherente a los modelos generativos; los resultados en HLE text-only (29,7%) indican margen de error significativo en razonamiento de nivel doctorado sin herramientas.
- Limitaciones de idioma: el inglés es el idioma principal; el multilingüismo es "general" pero no se detallan evaluaciones por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero existe una Acceptable Use Policy adicional del autor que conviene revisar antes de producción.
- Requisitos de hardware extremos: 1,9 TB en BF16 y ~0,5 TB en NVFP4 hacen inviable el despliegue en infraestructura de consumo; requiere clústeres multi-GPU.
- Formatos de entrada restringidos: audio solo en WAV a 16 kHz y menos de 20 minutos; imágenes con dimensión óptima entre 40px y 4096px.
- Salida solo texto: no genera imagen ni audio.
- Datos de entrenamiento incompletos: no se especifican tokens, composición ni etapas de alineación (RLHF/DPO), lo que dificulta evaluar reproducibilidad.
- El dato de SWEBench Pro para GPT 5.6 Sol aparece truncado en la fuente ("6"), por lo que no debe interpretarse como valor completo.

## Enlaces

- Hugging Face: https://huggingface.co/arbonquants/Inkling
- Pesos BF16: https://huggingface.co/thinkingmachines/Inkling
- Pesos NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
