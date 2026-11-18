# CMSManhattan/JiRackUltra_14b

## Resumen

JiRack Ultra 14B es un modelo de generación de texto de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) publicado por CMSManhattan en Hugging Face. Según su model card, se trata de un modelo construido a partir de un modelo DeepSeek, rediseñado por el autor con soporte nativo de arquitectura ternaria al estilo BitNet (1.58 bits) y cuantizaciones GGUF listas para ejecutar. El objetivo declarado es ofrecer inferencia rápida y eficiente en CPU, reduciendo el coste de infraestructura en la nube y permitiendo su uso como modelo experto en despliegues RAG.

El modelo incorpora un tokenizador propio (JiRackPrecisionTokenizer) con etiquetas específicas para enrutamiento (routing), multimedia, visión, sonido, llamadas a herramientas (tool call) y robótica. La model card menciona entrenamiento con QAT (Quantization-Aware Training) y soporte para instrucciones AVX2 y AVX-512 en CPU, así como exportación a ONNX. Los pesos se distribuyen en safetensors y GGUF, con un repositorio de 153,1 GB que incluye múltiples variantes de cuantización.

La relevancia del modelo radica en su propuesta de combinar un tamaño medio (14B) con compresión ternaria para ejecución en CPU y en su orientación explícita a casos de uso empresariales (tool calling, agentes de código, robótica). No obstante, la información técnica publicada es escasa y heterogénea: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks, lo que limita una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2/DeepSeek según tags y model card), con soporte ternario estilo BitNet (1.58 bits) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Full (FP16/BF16), Q4_K_M, Q3_K_M, Q2_K, ternaria TQ2_0 (1.58 bits) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, ONNX (exportación documentada) |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer basado en un modelo DeepSeek, rediseñado con soporte nativo de arquitectura ternaria al estilo BitNet (1.58 bits) y un tokenizador propio con etiquetas especiales para routing, media, visión, sonido, tool call y robótica. Se menciona entrenamiento mediante QAT (Quantization-Aware Training) con dos scripts concretos (`train_qat_ultra_14b_bf16_fulltext_ada_warmup.py` y `train_qat_ultra_14b_bf16_with_mask_ada_warmup.py`) y un conjunto de datos de QAT derivado de NVIDIA Nemotron con tokenizador de Open Assistant, ubicado en la carpeta `prepared_sft_data_ultra14b/`. También se indica la posibilidad de doble QAT vía ONNX QAT y conversión a TQ2_0 con soporte de instrucciones AVX2 y AVX-512.

No se especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona adaptaciones del proceso de entrenamiento para evitar olvido catastrófico y mesetas rápidas de entrenamiento, pero bajo acuerdos de confidencialidad (NDA), por lo que no se aportan detalles. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en 13 idiomas: inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés.
- Soporte de tool calling / function calling, reforzado mediante el tokenizador JiRackPrecisionTokenizer con etiquetas específicas para herramientas.
- Capacidades de enrutamiento (routing) declaradas en el tokenizador, orientadas a la selección de herramientas o flujos.
- Capacidades multimodales declaradas en el tokenizador (media, visión, sonido), aunque no se detallan los módulos que las implementan.
- Capacidades orientadas a robótica, según las etiquetas del tokenizador y la sección "JiRack RoboTech".
- Soporte de agentes y razonamiento multi-paso mediante tool calling, con ejemplos citados para Spring AI (Java) y Gorilla (Python).
- Inferencia eficiente en CPU gracias a la cuantización ternaria TQ2_0 y a las instrucciones AVX2/AVX-512.
- Exportación a ONNX para despliegue alternativo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas y, mediante tool calling, consultar sistemas internos (pedidos, incidencias) sin necesidad de GPU, lo que reduce el coste por token en despliegues de alto volumen.
- Agente de código en IDE: integrado en los plugins publicados para VS Code, JetBrains y Eclipse, el modelo puede proponer cambios de código y solicitar confirmación al usuario antes de aplicarlos, ejecutándose localmente vía Ollama en un PC doméstico.
- Despliegue RAG como modelo experto: la model card lo posiciona explícitamente como modelo experto en arquitecturas RAG, donde el contexto recuperado se inyecta en el prompt y el modelo genera respuestas fundamentadas sobre documentación corporativa.
- Automatización de flujos empresariales con tool calling: mediante las librerías Spring AI (Java) y Gorilla (Python), el modelo puede invocar APIs internas, consultar bases de datos o lanzar procesos en pipelines de negocio.
- Enrutamiento de consultas (routing): las etiquetas de routing del tokenizador permiten clasificar y dirigir peticiones hacia el modelo o servicio adecuado dentro de un sistema multi-modelo.
- Robótica y control de dispositivos: la sección "JiRack RoboTech" y las etiquetas de robótica sugieren su uso en la generación de comandos estructurados para sistemas robóticos, aunque no se documentan integraciones concretas.
- Inferencia en entornos sin GPU: con cuantizaciones Q2_K (6,81 GB) o Q3_K_M (8,42 GB), el modelo puede ejecutarse en servidores CPU o portátiles con 8-12 GB de RAM, útil en entornos con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según las variantes publicadas en la model card:
  - Full precision: 28,1 GB de pesos, ~28-32 GB de RAM.
  - Q4_K_M: 10,1 GB de pesos, ~8-12 GB de RAM (opción recomendada por el autor).
  - Q3_K_M: 8,42 GB de pesos, ~7-10 GB de RAM.
  - Q2_K: 6,81 GB de pesos, ~6-9 GB de RAM.
- GPU recomendadas: no disponible. El modelo está optimizado para CPU; no se documentan requisitos ni rendimiento en GPU.
- Cabe en GPU de consumo: no se especifica. Por tamaño, las cuantizaciones Q2/Q3 podrían caber en GPUs con 8-12 GB de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: llama.cpp, Ollama (imágenes `cmsmanhattan/jirack-ultra-14b-cpu`), Docker (puerto 7869), ONNX Runtime, y servidor Java ONNX JiRack.
- Latencia y throughput: no disponibles. El autor afirma ganancias de rendimiento con instrucciones AVX2/AVX-512 y cuantización ternaria TQ2_0, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| JiRack Ultra 14B | 14,77B | no disponible | MIT | safetensors, GGUF, ONNX | Ternario/BitNet para CPU, tool calling |
| Qwen2-7B-Instruct | 7,6B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Propósito general, multilingüe |
| BitNet b1.58 (Microsoft) | ~3B (variantes) | no disponible | MIT (referencia) | safetensors | Investigación en ternario 1.58 bits |
| DeepSeek (modelo base citado) | no disponible | no disponible | no disponible | no disponible | Modelo origen del que deriva JiRack |

La comparación es limitada: no se dispone de datos de benchmarks del modelo ni de especificaciones detalladas del modelo DeepSeek base. Los tags del repositorio indican compatibilidad con la familia Qwen2, lo que sugiere una arquitectura similar a Qwen2-14B, pero el autor no lo confirma explícitamente.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling, lo que impide verificar las capacidades declaradas.
- Información técnica incompleta: no se especifican la longitud de contexto, el número de tokens de entrenamiento, la composición del dataset ni los métodos de alineación.
- Riesgo de alucinación: al no documentarse el proceso de alineación ni evaluaciones de fidelidad, el riesgo de respuestas inventadas en producción es desconocido y debe mitigarse con verificación externa.
- Capacidades multimodales no verificadas: el tokenizador declara etiquetas de visión, sonido y media, pero no se documentan módulos ni pesos asociados a esas modalidades.
- Sesgos: no se han publicado análisis de sesgos. Al entrenarse con datos derivados de Nemotron y Open Assistant, puede heredar sesgos de esas fuentes.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el autor no ofrece garantías ni soporte formal; las variantes QAT personalizadas se ofrecen bajo petición y posiblemente bajo NDA.
- Dependencia de un único autor: el mantenimiento, la reproducibilidad y la continuidad del proyecto dependen de CMSManhattan; no hay evidencia de una comunidad amplia (6 likes, 4.793 descargas en el momento de la consulta).
- Compatibilidad declarada con Qwen2 y DeepSeek sin confirmación oficial: la integración con ecosistemas existentes (vLLM, TGI) no está documentada; el despliegue se orienta a llama.cpp, Ollama y ONNX.
- Advertencia sobre la fecha del repositorio: la fecha de creación indicada (2026-08-03) es posterior a la fecha actual, lo que sugiere posibles inconsistencias en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMSManhattan/JiRackUltra_14b
- Demo Live Chat: https://huggingface.co/spaces/CMSManhattan/JiRackUltra_14b
- Demo ternaria TQ2_0 (36B): https://huggingface.co/spaces/CMSManhattan/JiRack-36B-Chat
- Demo ternaria TQ2_0 (16B): https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Demo ternaria TQ2_0 (8B): https://huggingface.co/spaces/CMSManhattan/JiRack-8B-Chat
- Demo ternaria TQ2_0 (2B): https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
- Tokenizador JiRackPrecisionTokenizer: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Guía de conversión a TQ2_0 para llama.cpp: https://huggingface.co/CMSManhattan/JiRackUltra_14b/blob/main/QAT_to_Llama.cpp_GGUF_TQ2_0_JirackUltra_14b.md
- Guía de exportación a ONNX: https://huggingface.co/CMSManhattan/JiRackUltra_14b/blob/main/jirackultra_14b_onnx_export_guide.md
- Modelo ternario de referencia: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-16B-chat
- Web oficial: https://www.jirack.com
- Plugin Eclipse: https://marketplace.eclipse.org/content/jirack-coding-agent
- Plugin JetBrains: https://plugins.jetbrains.com/plugin/35073-jirack-agent
- Plugin VS Code: https://marketplace.visualstudio.com/items?itemName=JiRackautomationCodingAgentIDE.jirack-agent
- Ollama (perfil del autor): https://ollama.com/cmsmanhattan
- Spring AI Alibaba (tool calling en Java): https://github.com/alibaba/spring-ai-alibaba
- Gorilla (tool calling en Python): https://github.com/ShishirPatil/gorilla
- ToolBench: https://github.com/OpenBMB/ToolBench
- Dataset Hermes Function Calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo Qwen2-7B-Instruct con function calling: https://huggingface.co/xalss/Qwen2-7B-Instruct-glaive-function-calling
