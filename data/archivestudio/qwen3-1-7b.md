# ArchiveStudio/Qwen3-1.7B

## Resumen

Qwen3-1.7B es la variante compacta de la tercera generación de modelos de lenguaje de la familia Qwen, desarrollada por el equipo Qwen de Alibaba. Este repositorio concreto (ArchiveStudio/Qwen3-1.7B) es una publicación derivada del modelo base oficial Qwen/Qwen3-1.7B-Base, distribuida bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal denso (no MoE) de aproximadamente 1.700 millones de parámetros, con 2.031.739.904 parámetros totales según los pesos en safetensors, y una longitud de contexto de 32.768 tokens.

El modelo resuelve el problema de disponer de razonamiento y diálogo de alta calidad en un tamaño que cabe en hardware de consumo. Su característica más distintiva es la capacidad de alternar entre un modo de razonamiento explícito (thinking mode, con bloques `<think>...</think>`) y un modo de respuesta directa (non-thinking mode) dentro del mismo modelo, controlable mediante el parámetro `enable_thinking` en la plantilla de chat. Esto permite usar el mismo checkpoint tanto para tareas de lógica compleja, matemáticas y código como para diálogo general de baja latencia.

Es relevante ahora porque la familia Qwen3 se posiciona como referencia open source en razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingüe (más de 100 idiomas y dialectos según la model card), y esta variante de 1.7B ofrece un punto de entrada económico para despliegues en local, prototipado rápido e integración en pipelines con requisitos moderados de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), 28 capas, GQA con 16 cabezas Q y 8 cabezas KV |
| Parametros totales | 2.031.739.904 (1,7B nominales; 1,4B sin embeddings) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (soporte de llama.cpp, Ollama, MLX-LM y KTransformers implica cuantizaciones GGUF/MLX habituales, pero sin cifras oficiales) |
| Idiomas soportados | mas de 100 idiomas y dialectos segun la model card; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); compatible con GGUF y otros formatos via herramientas de terceros |

## Arquitectura y entrenamiento

Qwen3-1.7B es un transformer causal denso con 28 capas y atención con grouped-query attention (GQA), con 16 cabezas para las consultas y 8 para claves y valores, lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. El modelo se entrena en dos fases: preentrenamiento y postentrenamiento, según la model card. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

La innovación técnica principal es el soporte nativo de dos modos de inferencia en un único modelo: thinking mode, que genera contenido de razonamiento envuelto en `<think>...</think>` antes de la respuesta final, y non-thinking mode, orientado a diálogo eficiente. El cambio se realiza mediante `enable_thinking` en `apply_chat_template`, y los servidores SGLang y vLLM exponen el mismo interruptor con parsers de razonamiento dedicados (`--reasoning-parser qwen3` en SGLang, `--reasoning-parser deepseek_r1` en vLLM). La model card no especifica detalles sobre RLHF, DPO u otras técnicas de alineación empleadas en el postentrenamiento.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno con alineación orientada a preferencias humanas.
- Razonamiento explícito en modo thinking para lógica, matemáticas y generación de código.
- Modo non-thinking para respuestas directas de baja latencia.
- Soporte de tool calling y function calling, con integración de herramientas externas en ambos modos según la model card.
- Capacidades de agente y razonamiento multi-paso, posicionadas como líderes entre modelos open source en tareas complejas basadas en agentes.
- Multilingüismo amplio: más de 100 idiomas y dialectos, con seguimiento de instrucciones y traducción.
- Escritura creativa, role-playing y seguimiento de instrucciones detallado.
- No se mencionan capacidades de visión ni audio en la información disponible; el pipeline es exclusivamente text-generation.

## Casos de uso

- Asistente conversacional en local: con 1,7B de parámetros y contexto de 32.768 tokens, el modelo puede gestionar conversaciones multi-turno en un portátil o estación de trabajo con GPU de consumo, usando el modo non-thinking para minimizar latencia.
- Generación de código en pipelines de desarrollo: el modo thinking mejora la calidad en tareas de programación, y el soporte de tool calling permite integrarlo en flujos que invocan linters, ejecutores de tests o APIs de repositorios.
- Razonamiento matemático asistido: útil para resolver problemas paso a paso en herramientas educativas, con la traza de razonamiento separada de la respuesta final para su inspección.
- Agentes automatizados de múltiples pasos: su capacidad de function calling y razonamiento multi-paso lo hace adecuado para orquestar llamadas a herramientas en tareas de automatización de oficina o extracción de datos.
- Traducción y atención al cliente multilingüe: el soporte de más de 100 idiomas permite desplegar un único modelo para triaje y respuesta en varios idiomas, con cuantización para reducir VRAM.
- Prototipado e investigación: al ser Apache 2.0 y caber en GPUs de consumo, sirve como banco de pruebas para experimentos de alineación, evaluación de modos de razonamiento o destilación.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite resumir contratos, informes o hilos de correo sin trocear en exceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog, GitHub y documentación oficiales de Qwen3 para consultar evaluaciones, requisitos de hardware y rendimiento de inferencia, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial en la información proporcionada. Como referencia orientativa de orden de magnitud, un modelo de 1,7B en FP16 requiere aproximadamente 3,4 GB solo para pesos, más caché KV y overhead; en cuantización de 8 bits rondaría 1,7-2 GB y en 4 bits cerca de 1 GB, sin contar contexto.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, es desplegable en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6-8 GB o más, especialmente con cuantización.
- Opciones de despliegue: transformers (>=4.51.0), SGLang (>=0.4.6.post1), vLLM (>=0.8.5), Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (este) | 1,7B (2,03B totales) | 32.768 | Apache 2.0 | Modos thinking/non-thinking, tool calling, 100+ idiomas |
| Qwen3-4B | no disponible en la informacion | no disponible | Apache 2.0 | Misma familia, mayor tamaño; specs concretas no disponibles |
| Qwen2.5-1.5B-Instruct | no disponible en la informacion | no disponible | Apache 2.0 | Generación anterior; sin modo thinking nativo según la información disponible |
| Llama 3.2 1B | no disponible en la informacion | no disponible | Licencia Llama | Alternativa de tamaño similar; datos concretos no disponibles |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye especificaciones detalladas ni resultados de benchmarks de los modelos competidores.

## Limitaciones y advertencias

- Riesgo de repeticiones infinitas: la propia model card advierte de este problema y recomienda ajustar los parámetros de muestreo y fijar `presence_penalty` en 1,5.
- Riesgo de alucinación: como todo modelo de lenguaje de 1,7B, la fiabilidad factual es limitada; conviene verificar salidas en aplicaciones críticas.
- Sesgos: no se documentan sesgos específicos en la información disponible; el modelo hereda los sesgos de sus datos de preentrenamiento.
- Limitaciones de contexto: la ventana es de 32.768 tokens, inferior a la de modelos de mayor tamaño de la misma familia; no se indica si existe extensión mediante RoPE scaling.
- Idiomas: aunque se declaran más de 100 idiomas, no se detalla el rendimiento por idioma; el castellano no está verificado de forma específica en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero este repositorio es una republicación de terceros (ArchiveStudio) con 0 descargas y 0 likes; para producción conviene usar el checkpoint oficial Qwen/Qwen3-1.7B.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- En modo thinking, el consumo de tokens aumenta considerablemente, lo que afecta a coste y latencia; el modo non-thinking debe elegirse para cargas interactivas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ArchiveStudio/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Blog Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat: https://chat.qwen.ai/
- Paper (arXiv): https://arxiv.org/abs/2505.09388
