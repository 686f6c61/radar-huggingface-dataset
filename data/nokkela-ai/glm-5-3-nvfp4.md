# nokkela-ai/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es una versión cuantizada en FP4 del modelo GLM-5.3 desarrollado por ZAI (Zhipu AI), publicada por NVIDIA y replicada en este repositorio por nokkela-ai. Se trata de un modelo de lenguaje autorregresivo de arquitectura transformer con mezcla de expertos (MoE) orientado a razonamiento, generación de código y tareas agénticas. El modelo original emplea atención dispersa con un indexador IndexShare para soportar contextos de hasta 1 millón de tokens, y esta variante mantiene esa ventana gracias a una cuantización NVFP4 realizada con NVIDIA Model Optimizer.

La relevancia de esta ficha radica en que la cuantización FP4 reduce el espacio de almacenamiento y los requisitos de memoria frente a los pesos en BF16/FP16, manteniendo el modelo utilizable en sistemas con GPUs Blackwell. El repositorio ocupa 464,2 GB y declara 753.329.940.480 parámetros totales, con 40B activados por token según la model card. Está pensado para desarrolladores que necesitan desplegar un modelo de gran escala pre-cuantizado en sistemas de agentes, chatbots y RAG sin tener que ejecutar el proceso de cuantización ellos mismos.

El modelo se distribuye bajo la NVIDIA Open Model Agreement, con la licencia original GLM-5.3 como capa adicional, y está etiquetado como listo para uso comercial o no comercial. La versión NVFP4 1.0 se generó con nvidia-modelopt v0.47.0 y el motor de ejecución declarado es SGLang sobre hardware NVIDIA Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con mezcla de expertos (MoE) y atención dispersa con IndexShare; clase `GlmMoeDsaForCausalLM` |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | 40B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); el repositorio se etiqueta también como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-license), con la licencia GLM-5.3 del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 es un transformer autorregresivo con mezcla de expertos (MoE) de 753B parámetros totales y 40B activos por token. Incorpora atención dispersa con un indexador denominado IndexShare, diseñado para habilitar contextos largos de hasta 1M tokens. Según la model card, GLM-5.3 reutiliza el modelo base de GLM-5.2 y obtiene sus mejoras principalmente del post-entrenamiento. La variante NVFP4 no modifica la arquitectura: es una cuantización de los pesos del modelo original realizada con NVIDIA Model Optimizer v0.47.0, en formato NVFP4 versión 1.0.

Los detalles sobre el dataset de entrenamiento original figuran como no divulgados (modality, recolección y etiquetado "Undisclosed"). Para la calibración de la cuantización se emplearon dos conjuntos: cnn_dailymail (más de 300.000 artículos de noticias en inglés) y Nemotron-Post-Training-Dataset-v2 (conversaciones multiturno sobre temas diversos, curado por NVIDIA). No se especifica en la información disponible si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento, ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento de propósito general, con evaluación declarada en MMLU Pro, GPQA Diamond y AIME 2025.
- Generación y razonamiento sobre código, evaluado en LiveCodeBench V6 y SciCode.
- Tareas agénticas y de múltiples pasos, orientado explícitamente a sistemas de agentes según la model card.
- Seguimiento de instrucciones, evaluado en IFBench.
- Manejo de contexto largo, evaluado en AA-LCR y con ventana declarada de hasta 1M tokens.
- Entrada y salida exclusivamente de texto (formato string, 1D); no se declaran capacidades de visión ni audio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Sistemas de agentes autónomos: el modelo está diseñado para razonamiento multi-paso y tareas agénticas, con 40B parámetros activos por token que reducen el coste computacional frente a un modelo denso de tamaño equivalente.
- Asistentes conversacionales de contexto largo: la ventana de hasta 1M tokens permite mantener historiales extensos o documentos completos dentro de la misma conversación sin truncamiento.
- Generación de código en producción: su evaluación en LiveCodeBench V6 y SciCode lo sitúa como candidato para asistentes de programación, revisión de código y generación de tests en pipelines de desarrollo.
- RAG sobre corpus extensos: la combinación de contexto de 1M tokens y razonamiento permite inyectar grandes volúmenes de documentos recuperados y razonar sobre ellos en una sola pasada.
- Razonamiento matemático y científico: los benchmarks AIME 2025 y GPQA Diamond indican uso en resolución de problemas cuantitativos y preguntas de nivel experto.
- Despliegue en infraestructura Blackwell: al ser una cuantización NVFP4 validada para SGLang sobre GPUs NVIDIA Blackwell, encaja en entornos que ya operan esa generación de hardware y buscan reducir la huella de memoria del modelo.
- Evaluación comparativa de cuantizaciones: útil para equipos que quieran medir la degradación de calidad de FP4 frente al modelo original GLM-5.3 en sus propias tareas.

## Benchmarks y rendimiento

La model card menciona los conjuntos de evaluación empleados (MMLU Pro, GPQA Diamond, LiveCodeBench V6, SciCode, AIME 2025, AA-LCR e IFBench), pero no incluye los resultados numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 464,2 GB en safetensors, lo que da una referencia del espacio de almacenamiento necesario; la memoria de inferencia dependerá del backend y de si se aplica paralelismo de tensor.
- GPU recomendadas: NVIDIA Blackwell, única microarquitectura declarada como compatible en la model card.
- Compatibilidad con GPU de consumo: no disponible; no se declara soporte para GPUs consumer.
- Opciones de despliegue: SGLang es el único motor de ejecución declarado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Sistema operativo: Linux.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Hardware declarado |
|---|---|---|---|---|---|---|
| GLM-5.3-NVFP4 (esta ficha) | 753B | 40B | 1M | NVFP4 | NVIDIA Open Model Agreement + GLM-5.3 | NVIDIA Blackwell, SGLang |
| zai-org/GLM-5.3 (modelo base) | 753B | 40B | 1M | Sin cuantizar (original) | GLM-5.3 License | no disponible |
| nvidia/GLM-5.3-NVFP4 (original de NVIDIA) | 753B | 40B | 1M | NVFP4 | NVIDIA Open Model Agreement + GLM-5.3 | NVIDIA Blackwell, SGLang |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento ni de otros modelos de categoría similar. Las diferencias entre las tres entradas son de empaquetado y distribución, no de arquitectura.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir degradación de calidad respecto al modelo GLM-5.3 original; no se aportan datos de esa pérdida en la información disponible.
- El modelo solo acepta y produce texto; no hay soporte declarado de visión, audio ni otras modalidades.
- Los idiomas soportados no están documentados, lo que impide garantizar un rendimiento adecuado fuera del inglés y el chino sin evaluación propia.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; la model card no documenta mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia es la NVIDIA Open Model Agreement, que convive con la licencia GLM-5.3 del modelo base; es necesario revisar ambas antes de un uso comercial, y la model card advierte que el acuerdo de NVIDIA no modifica ni sustituye la licencia GLM-5.3.
- Requiere hardware NVIDIA Blackwell y Linux con SGLang; no se declaran alternativas de despliegue, lo que limita la portabilidad.
- Este repositorio es una copia independiente (fork) del modelo de NVIDIA; conviene verificar la integridad de los pesos y preferir el repositorio original para producción.
- Los datos de entrenamiento del modelo base figuran como no divulgados, lo que dificulta evaluar riesgos de contaminación de benchmarks o de contenido.
- La model card recomienda pruebas específicas de caso de uso antes de desplegar en producción.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/nokkela-ai/GLM-5.3-NVFP4
- Modelo original de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Modelo base GLM-5.3 (ZAI): https://huggingface.co/zai-org/GLM-5.3
- Licencia GLM-5.3: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibración Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
