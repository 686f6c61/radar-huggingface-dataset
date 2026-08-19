# nvidia/Qwen3.6-35B-A3B-NVFP4

## Resumen

NVIDIA Qwen3.6-35B-A3B-NVFP4 es la versión cuantizada en punto flotante de 4 bits (NVFP4) del modelo Qwen3.6-35B-A3B desarrollado por Alibaba. NVIDIA ha aplicado su herramienta Model Optimizer para reducir el tamaño y acelerar la inferencia del modelo original, manteniendo la arquitectura MoE con atención híbrida y un contexto de hasta 262 000 tokens. El modelo está diseñado para ejecutarse eficientemente en GPUs NVIDIA Hopper y Blackwell mediante el runtime vLLM.

Esta cuantización resulta relevante porque permite desplegar un modelo de 35 000 millones de parámetros (con solo 3 000 millones activos por token) en entornos de producción con requisitos de memoria reducidos, manteniendo capacidades multimodales de entrada (texto, imagen y vídeo) y un rendimiento competitivo en tareas de razonamiento, generación de código y uso de herramientas. Al estar licenciado bajo Apache 2.0, es apto tanto para uso comercial como no comercial.

El modelo se distribuye en formato safetensors con pesos NVFP4, listo para su uso con vLLM, y ha sido calibrado con datasets como cnn_dailymail y Nemotron-Post-Training-Dataset-v2. Su fecha de publicación en Hugging Face es el 28 de mayo de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers con Mixture-of-Experts (MoE) y atención híbrida |
| Parametros totales | 35 000 millones |
| Parametros activos | 3 000 millones |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Transformer con mezcla de expertos (MoE) y atención híbrida, lo que combina mecanismos de atención tradicionales con otras variantes para optimizar el procesamiento de secuencias largas. De los 35 000 millones de parámetros totales, solo 3 000 millones se activan por token, lo que reduce el coste computacional durante la inferencia. La versión cuantizada por NVIDIA utiliza NVFP4, un formato de punto flotante de 4 bits, aplicado únicamente a los pesos y activaciones de los operadores lineales dentro de los bloques del transformer en la parte MoE. La cuantización se realizó con Model Optimizer v0.44.0 y se calibró con los datasets cnn_dailymail (artículos de noticias en inglés) y Nemotron-Post-Training-Dataset-v2 (conversaciones multi-turno). Los detalles del entrenamiento original del modelo base no han sido divulgados por Alibaba.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de comprensión lectora, matemáticas y ciencias, evaluado con benchmarks como MMLU Pro, GPQA Diamond y AIME 2025.
- Generación de código y razonamiento a nivel de repositorio, con soporte para flujos de trabajo de frontend y agentic coding, según se menciona en el foro de desarrolladores de NVIDIA.
- Entrada multimodal: acepta texto, imágenes (RGB) y vídeo (MP4/WebM), aunque la salida es exclusivamente texto.
- Soporte de tool calling y function calling, evaluado con τ²-Bench Telecom, que simula escenarios de atención al cliente con uso de herramientas externas.
- Capacidad para manejar contextos largos de hasta 262 000 tokens, lo que permite procesar documentos extensos y conversaciones multi-turno.
- Instrucciones complejas y seguimiento de directivas estructuradas, medido con IFBench.
- Razonamiento multimodal de nivel universitario, evaluado con MMMU Pro.

## Casos de uso

- Agentes de IA con tool calling: el modelo puede integrarse en sistemas de agentes que necesitan llamar a APIs, bases de datos o herramientas externas para resolver tareas, gracias a su soporte nativo de function calling y su capacidad de razonamiento multi-step.
- Chatbots de atención al cliente con contexto largo: su ventana de 262 000 tokens permite mantener conversaciones extensas y recordar detalles de interacciones anteriores, mejorando la coherencia y la personalización.
- Sistemas RAG sobre documentación técnica: al procesar grandes volúmenes de texto, puede recuperar y sintetizar información de manuales, informes o artículos científicos con alta fidelidad.
- Generación de código en producción: su capacidad para razonar sobre repositorios completos y manejar flujos de trabajo de frontend lo hace adecuado para asistentes de programación y pipelines de CI/CD que generan o revisan código.
- Análisis de contenido multimodal: al aceptar imágenes y vídeo como entrada, puede utilizarse para generar descripciones, resúmenes o responder preguntas sobre material visual en aplicaciones de moderación o accesibilidad.
- Despliegue en entornos con recursos limitados: gracias a la cuantización NVFP4, el modelo cabe en GPUs con 24 GB de VRAM, lo que facilita su uso en infraestructuras on-premise o en la nube con costes reducidos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en los siguientes conjuntos de datos: MMLU Pro, GPQA Diamond, τ²-Bench Telecom, MMMU Pro, SciCode, AIME 2025, AA-LCR e IFBench, pero no se proporcionan cifras concretas. Se recomienda consultar la documentación oficial de NVIDIA o el repositorio del modelo base para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 23,5 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar los pesos completos. Con técnicas de optimización de memoria de vLLM, podría ser suficiente con GPUs de 24 GB como la RTX 4090 o la A5000.
- GPUs compatibles: NVIDIA Hopper (H100, H200) y NVIDIA Blackwell (B200, GB300). La inferencia fue probada en un NVIDIA GB300.
- No se recomienda su uso en GPUs de generaciones anteriores (Ampere o Volta) debido a que el formato NVFP4 requiere soporte de hardware específico.
- Opciones de despliegue: vLLM es el runtime soportado oficialmente. También se puede utilizar a través de NVIDIA NIM, disponible en NGC.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoría. El modelo es una versión cuantizada del Qwen3.6-35B-A3B de Alibaba, por lo que su rendimiento debería ser similar al del modelo original con una ligera degradación debida a la cuantización. Existen versiones FP8 del mismo modelo, pero no se han encontrado especificaciones detalladas en la información disponible. Se recomienda consultar el modelo base y los foros de NVIDIA para obtener comparativas con otros MoE de tamaño similar, como DeepSeek-V3 o Mixtral.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una pérdida de precisión en tareas que requieren alta exactitud numérica, como matemáticas avanzadas o razonamiento lógico complejo.
- No se han documentado sesgos específicos del modelo, pero al estar basado en datos de entrenamiento no divulgados, podría heredar sesgos presentes en los datos originales.
- Riesgo de alucinación inherente a todos los modelos de lenguaje: se recomienda validar las respuestas en aplicaciones críticas.
- El modelo solo acepta entrada multimodal (imagen y vídeo) en el modelo base; la versión cuantizada podría tener limitaciones en el procesamiento de estos formatos si el runtime no los soporta completamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es desarrollado por NVIDIA a partir de un modelo de Alibaba; se debe respetar la atribución correspondiente.
- Requiere hardware NVIDIA específico (Hopper o Blackwell) para aprovechar el formato NVFP4; en otras arquitecturas podría no funcionar o requerir conversión a otro formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Página en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-35b-a3b
- Foro de desarrolladores de NVIDIA (anuncio de Qwen3.6): https://forums.developer.nvidia.com/t/qwen-qwen3-6-35b-a3b-and-fp8-has-landed/366822
