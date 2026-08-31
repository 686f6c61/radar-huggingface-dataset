# CrossNow/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8

## Resumen

NVIDIA Nemotron 3 Nano 30B A3B FP8 es una versión cuantizada en punto flotante de 8 bits (FP8) del modelo base Nemotron 3 Nano 30B A3B BF16, desarrollado por NVIDIA. Se trata de un modelo de lenguaje de gran tamaño (LLM) entrenado desde cero, diseñado como un modelo unificado para tareas de razonamiento y no razonamiento. Su característica distintiva es que genera primero una traza de razonamiento interna y después produce la respuesta final, un comportamiento configurable mediante una bandera en la plantilla de chat.

El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE) que combina capas Mamba-2, capas MoE y capas de atención. Con 30 000 millones de parámetros totales (31 577 946 256 según los pesos reales) y solo 3 500 millones activos por token, ofrece una eficiencia computacional notable. Su ventana de contexto alcanza 1 millón de tokens, lo que lo hace adecuado para tareas que requieren procesar documentos extensos o conversaciones de larga duración. Está disponible bajo la licencia abierta de NVIDIA, lo que permite su uso comercial, y soporta seis idiomas: inglés, alemán, español, francés, italiano y japonés.

Esta versión FP8 reduce los requisitos de memoria en comparación con la versión BF16, manteniendo un rendimiento casi idéntico según los benchmarks publicados, con una degradación mínima en tareas de razonamiento. Es relevante ahora porque ofrece capacidades de razonamiento y agente de nivel superior en un formato eficiente y desplegable en hardware de gama alta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con Mamba-2 y atención (23 capas Mamba-2/MoE + 6 capas de atención) |
| Parametros totales | 31 577 946 256 (30B nominales) |
| Parametros activos | 3 500 000 000 (3,5B) |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta versión), BF16 (versión base) |
| Idiomas soportados | Inglés, alemán, español, francés, italiano, japonés |
| Licencia | NVIDIA Nemotron Open Model License (uso comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina capas de atención tradicional con capas basadas en Mamba-2 (state space models) y capas de mezcla de expertos (MoE). Cada capa MoE contiene 128 expertos más un experto compartido, activando 6 expertos por token. Esta combinación reduce el coste computacional por token al tiempo que mantiene una alta capacidad de representación. La inclusión de capas Mamba-2 aporta eficiencia en el procesamiento secuencial de secuencias largas, complementando las capas de atención que capturan dependencias de largo alcance.

El entrenamiento se realizó desde cero utilizando un conjunto de datos diverso de NVIDIA, que incluye corpus de código, texto general, matemáticas, ciencia, programación competitiva y demostraciones de agentes. Los datasets listados abarcan desde Nemotron-Pretraining-Code-v1 hasta Nemotron-CC-v2.1 y Nemotron-Agentic-v1. El post-entrenamiento incorporó un blend de entrenamiento con refuerzo (Nemotron-3-Nano-RL-Training-Blend) y datasets de instrucción (Nemotron-Instruction-Following-Chat-v1). La fecha de corte de los datos de pre-entrenamiento es el 25 de junio de 2025, y la del post-entrenamiento el 28 de noviembre de 2025. No se especifica si se aplicaron técnicas como RLHF o DPO, pero la presencia de un blend de RL sugiere un ajuste con aprendizaje por refuerzo.

El modelo está diseñado para generar trazas de razonamiento antes de responder, una capacidad que se puede desactivar mediante una bandera en la plantilla de chat. La versión FP8 se obtuvo mediante cuantización del checkpoint BF16, probablemente usando el optimizador de modelos de NVIDIA (Model Optimizer), lo que reduce el tamaño en memoria a aproximadamente un byte por parámetro.

## Capacidades

- Generación de texto y razonamiento: produce respuestas con razonamiento interno configurable, mejorando la precisión en problemas complejos cuando la traza está activada.
- Razonamiento matemático y científico: obtiene resultados destacados en benchmarks como AIME25 (87,7 sin herramientas, 98,8 con herramientas) y GPQA (72,5 sin herramientas, 73,4 con herramientas).
- Generación de código: rinde bien en LiveCodeBench (67,6) y en tareas de programación competitiva, con soporte para tool calling.
- Tool calling y function calling: puede integrar herramientas externas para mejorar sus respuestas, como se refleja en los resultados con herramientas en AIME25 y GPQA.
- Capacidades agénticas: diseñado para tareas de agente, con resultados en TauBench V2 (Airline 44,8, Retail 55,6, Telecom 40,8).
- Multilingüe: soporta seis idiomas (inglés, alemán, español, francés, italiano, japonés), aunque el rendimiento puede variar según el idioma.
- Modo razonamiento configurable: permite alternar entre respuestas directas y respuestas con traza de razonamiento, adaptándose a distintos casos de uso.
- Contexto largo: ventana de 1 millón de tokens, adecuada para documentos extensos, análisis de código fuente completo o conversaciones de larga duración.

## Casos de uso

- Asistente de programación con contexto de repositorio completo: gracias a su ventana de 1M tokens, el modelo puede procesar repositorios enteros de código fuente, detectar errores, sugerir refactorizaciones y generar documentación. Su rendimiento en LiveCodeBench lo hace adecuado para tareas de generación y revisión de código en entornos de desarrollo.
- Agente de atención al cliente multilingüe: con soporte para seis idiomas europeos y japones, puede gestionar conversaciones multi-turno con historial largo, manteniendo el contexto de la interacción durante horas. La capacidad de tool calling permite consultar bases de datos de pedidos o sistemas CRM en tiempo real.
- Resolución de problemas matemáticos y científicos: en entornos educativos o de investigación, el modelo puede descomponer problemas complejos en pasos de razonamiento, útil para generar explicaciones paso a paso o verificar demostraciones. Su puntuación en GPQA lo sitúa como una herramienta viable para asistencia en física, química y biología.
- Automatización de tareas agénticas en empresas: el modelo puede actuar como agente autónomo para tareas como reservas de vuelos, gestión de pedidos o soporte técnico, tal como reflejan los benchmarks TauBench. Su modo de razonamiento le permite planificar secuencias de acciones y llamar a herramientas cuando es necesario.
- Análisis de documentos legales o financieros extensos: la ventana de contexto de 1M tokens permite procesar contratos completos, informes anuales o sentencias judiciales sin truncamiento, extrayendo cláusulas relevantes o resumiendo información clave.
- Generación de contenido multilingüe: para empresas que necesitan producir textos en varios idiomas europeos y japonés, el modelo puede redactar, traducir y adaptar contenido manteniendo coherencia y estilo, aunque se recomienda supervisión humana para garantizar precisión.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por NVIDIA para la versión FP8 (esta) en comparación con la versión BF16 original. Los datos provienen de la model card oficial.

| Tarea | BF16 | FP8 |
|---|---|---|
| MMLU-Pro (conocimiento general) | 78,3 | 78,1 |
| AIME25 (sin herramientas) | 89,1 | 87,7 |
| AIME25 (con herramientas) | 99,2 | 98,8 |
| GPQA (sin herramientas) | 73,0 | 72,5 |
| GPQA (con herramientas) | 75,0 | 73,4 |
| LiveCodeBench (v6) | 68,3 | 67,6 |
| SciCode (subtask) | 33,0 | 31,9 |
| HLE (sin herramientas) | 10,2 | 10,3 |
| HLE (con herramientas) | 15,5 | 14,3 |
| TauBench V2 (Airline) | 48,0 | 44,8 |
| TauBench V2 (Retail) | 56,9 | 55,6 |
| TauBench V2 (Telecom) | 42,2 | 40,8 |

La degradación de rendimiento en FP8 es inferior a 1 punto porcentual en la mayoría de las tareas, lo que confirma que la cuantización es adecuada para producción. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 31,6 GB (31 577 946 256 parámetros × 1 byte). A esto hay que sumar la memoria para la caché KV (dependiente de la longitud de secuencia) y las activaciones. Con una ventana de contexto moderada (8K-32K tokens), se recomienda al menos 40 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una NVIDIA A100 40GB o H100 80GB son adecuadas. También es posible usar una RTX 4090 (24 GB) con técnicas de offloading a CPU o cuantización adicional, pero el rendimiento se verá penalizado. Para producción con alta concurrencia, se recomienda H100 o A100 con tensor parallelism.
- Compatibilidad con GPUs de consumo: no cabe en GPUs de 16 GB o menos. La RTX 4090 (24 GB) podría ejecutar el modelo con offloading parcial, pero no es recomendable para uso interactivo.
- Opciones de despliegue: al ser un modelo safetensors compatible con transformers, se puede servir con vLLM, NVIDIA TensorRT-LLM o Hugging Face TGI, todos con soporte FP8. Para entornos sin GPU NVIDIA, se podría convertir a GGUF y usar llama.cpp u Ollama, aunque no hay una versión GGUF oficial.
- Latencia y throughput: no se han publicado cifras oficiales. Dado que solo se activan 3,5B parámetros por token, la latencia por token debería ser significativamente menor que la de un modelo denso de 30B, pero depende del hardware y del tamaño de la caché KV.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Sin embargo, por tamaño y arquitectura, el modelo compite directamente con otras alternativas MoE de ~30B parámetros totales y ~3B activos, como Qwen3-30B-A3B (también 30B totales, 3B activos, contexto 128K) o MiniMax-M1-30B. A diferencia de estos, Nemotron 3 Nano ofrece una ventana de contexto de 1M tokens y una arquitectura híbrida con Mamba-2, lo que puede suponer una ventaja en tareas de secuencias muy largas. La licencia de NVIDIA permite uso comercial, similar a la de Qwen3 (Apache 2.0), pero con condiciones específicas de la licencia Nemotron. No se puede realizar una comparación cuantitativa sin datos de benchmarks de los modelos alternativos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo LLM, puede generar contenido falso o sesgado, especialmente en dominios especializados o con datos poco representados. Se recomienda verificación humana en aplicaciones críticas.
- Rendimiento multilingüe desigual: aunque soporta seis idiomas, el rendimiento es superior en inglés; los otros idiomas pueden presentar más errores o menor fluidez.
- Riesgo en razonamiento desactivado: si se desactiva la traza de razonamiento, la precisión en tareas complejas disminuye notablemente, como indica la documentación.
- Requisitos de memoria: la versión FP8 sigue requiriendo al menos 32 GB de VRAM, lo que excluye GPUs de consumo habitual. Para despliegue en entornos limitados, se necesitaría cuantización adicional (GGUF Q4/Q8) que no es oficial.
- Licencia: la NVIDIA Nemotron Open Model License permite uso comercial, pero incluye restricciones (por ejemplo, no usar para desarrollo de armas, vigilancia masiva o actividades ilegales). Es responsabilidad del usuario revisar los términos completos.
- Actualización de datos: los datos de entrenamiento tienen fechas de corte de mediados y finales de 2025, por lo que la información más reciente puede no estar cubierta.
- Complejidad de despliegue: al ser una arquitectura híbrida con Mamba-2, no todos los frameworks de inferencia soportan todas las capas de forma óptima. Se recomienda usar vLLM o TensorRT-LLM con soporte específico.

## Enlaces

- Modelo en Hugging Face (FP8): https://huggingface.co/CrossNow/NVIDIA-Nemotron-3-Nano-30B-A3B-FP8
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper técnico (arXiv): https://arxiv.org/abs/2512.20848
- Página del producto NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-30b-a3b
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Colección de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
