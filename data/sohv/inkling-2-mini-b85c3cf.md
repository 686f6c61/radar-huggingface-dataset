# sohv/Inkling-2-Mini-b85c3cf

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El repositorio analizado (`sohv/Inkling-2-Mini-b85c3cf`) es una publicación derivada del checkpoint oficial; conviene tener en cuenta que el autor del repositorio en Hugging Face (sohv) no es el desarrollador original del modelo.

La arquitectura es un transformer decoder-only de 24 capas con capas de feed-forward de mezcla de expertos (MoE) dispersa. Su rasgo distintivo es el bucle de pesos compartidos: las 12 capas centrales se ejecutan tres veces, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos por capa, y la atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

Con 26.400 millones de parámetros totales y unos 3.400 millones activos (5.400 millones efectivos por token al ejecutarse tres pasadas por las capas en bucle), Inkling 2 Mini ofrece una ventana de contexto de hasta 1 millón de tokens. Se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite su ejecución en hardware local de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas en bucle (looped transformer); vision transformer para imágenes |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B (5,4B efectivos por token con las tres pasadas de las capas en bucle) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint mixto NVFP4/MXFP8); GGUF disponible para versiones cuantizadas |
| Modalidades de entrada | Texto (UTF-8) e imagen (dimensiones recomendadas entre 40 px y 4096 px) |
| Modalidades de salida | Texto |
| Número de capas | 24 capas de pesos, 48 aplicaciones por token (12 capas centrales ejecutadas 3 veces) |
| Expertos | 128 por capa, 8 activos por token |
| Tamaño del repositorio | 20,2 GB |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo con arquitectura de bucle: 24 capas de pesos de las cuales las 12 centrales se reutilizan tres veces, produciendo 48 aplicaciones de capa por token. Las capas de feed-forward son de mezcla de expertos dispersa con 128 expertos por capa y enrutamiento de 8 expertos por token. La atención es híbrida, combinando capas de atención local y global, lo que resulta coherente con una ventana de contexto de hasta 1 millón de tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta a un espacio oculto compartido con el texto, procesado conjuntamente por el decoder.

El entrenamiento empleó datos de texto, imágenes y vídeo procedentes de fuentes públicas de internet y repositorios públicos, de terceros, generados internamente y sintéticos o aumentados. La curación de datos incluyó deduplicación y filtrado para eliminar contenido de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint se distribuye en precisiones NVFP4 y MXFP8, lo que reduce el tamaño a unos 20 GB.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes y razonamiento sobre contenido visual combinado con texto (image-text-to-text).
- Soporte multilingüe general, con inglés como idioma principal.
- Capacidades de código en múltiples lenguajes de programación, según la model card.
- Uso previsto en sistemas agénticos y de uso de herramientas (tool-use), asistentes de código, chatbots y RAG.
- Ventana de contexto de hasta 1 millón de tokens para documentos y conversaciones extensas.
- Capacidad de ajuste fino posterior (post-training) mediante plataformas como Miles y SkyRL.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y herramientas de desarrollo para autocompletado, revisión y generación de código en varios lenguajes, aprovechando su soporte para uso de herramientas y su ventana de contexto amplia para analizar repositorios completos.
- Sistemas RAG sobre documentación extensa: con hasta 1 millón de tokens de contexto, puede ingerir grandes volúmenes de documentación, informes o bases de conocimiento y responder preguntas con fundamento en el material recuperado.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo y puede combinarse con tool calling para consultar sistemas internos (pedidos, cuentas, estado de envíos) dentro del flujo conversacional.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma nativa, puede procesar facturas, formularios, capturas de pantalla o gráficos junto con texto explicativo, útil en automatización de back-office.
- Agentes autónomos de múltiples pasos: su orientación a sistemas agénticos y uso de herramientas permite construir flujos que planifican, invocan APIs y razonan sobre resultados intermedios en tareas de automatización.
- Asistencia en investigación y análisis de literatura: la ventana de 1M tokens permite cargar artículos, notas y figuras para síntesis y extracción de información.
- Despliegue en hardware local: con unos 20 GB de checkpoint en NVFP4/MXFP8, puede ejecutarse en un DGX Spark, en Apple Silicon con 32 GB o más, o en GPUs con 32 GB o más de VRAM, lo que facilita prototipado y entornos con requisitos de privacidad.
- Ajuste fino para dominios verticales: al publicarse con pesos abiertos y soporte en Miles y SkyRL, puede adaptarse a tareas específicas de un sector mediante post-entrenamiento.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero el contenido de la tabla está truncado en la información disponible y no se han podido extraer los valores numéricos de los benchmarks. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- VRAM recomendada: 32 GB o más para inferencia del checkpoint nativo.
- Plataformas soportadas oficialmente: 1x NVIDIA DGX Spark; dispositivos Apple Silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio); otras GPUs con 32 GB o más de VRAM.
- Cabe en GPU de consumo de gama alta con 32 GB o más de VRAM; para GPUs con menos memoria, usar versiones GGUF cuantizadas.
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluye GGUF cuantizados), llama.cpp, Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La model card compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa comparación no están disponibles en la información proporcionada. A continuación se recoge lo que sí se conoce de cada alternativa a nivel de especificación:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31B (dato de la model card) | No disponible | No disponible | No disponible |
| Muse Glimmer | No disponible | No disponible | No disponible | No disponible |
| Qwen3.8-27B | 27B (dato de la model card) | No disponible | No disponible | No disponible |
| Nemotron 3.5 Super VL | No disponible | No disponible | No disponible | No disponible |

Los datos de rendimiento comparativo (benchmarks) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El repositorio analizado (`sohv/Inkling-2-Mini-b85c3cf`) es una publicación derivada; el checkpoint oficial lo distribuye Thinking Machines Lab. Verificar la procedencia antes de usar en producción.
- La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, lo que limita la evaluación de sesgos y cobertura.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado métricas de fiabilidad en la información disponible.
- El soporte multilingüe se describe como «general», con inglés como idioma principal; no hay lista de idiomas ni evaluaciones por idioma.
- Existe una Política de Uso Aceptable del modelo enlazada por el proveedor que puede imponer restricciones adicionales al uso, aunque la licencia sea Apache 2.0.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la política de uso aceptable del proveedor.
- El checkpoint nativo en NVFP4/MXFP8 requiere hardware con soporte para estos formatos; en plataformas sin soporte, usar versiones GGUF.
- Las dimensiones de imagen fuera del rango recomendado (40 px a 4096 px) pueden degradar el rendimiento.
- No hay información sobre latencia, throughput ni comportamiento en producción a gran escala.

## Enlaces

- Repositorio en Hugging Face (publicación derivada): https://huggingface.co/sohv/Inkling-2-Mini-b85c3cf
- Checkpoint oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama (biblioteca): https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
