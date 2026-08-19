# Jianqiao1/Qwen3.8-27b-MoQ-GGUF

## Resumen

Qwen3.8-27B-MoQ-GGUF es una serie de archivos GGUF del modelo base Qwen/Qwen3.8-27B, cuantizados mediante una técnica denominada Mixture-of-Quantization (MoQ) desarrollada por el autor Jianqiao1. Esta serie ofrece nueve niveles de cuantización con tamaños que van desde aproximadamente 10,5 GB hasta 17,3 GB, todos ellos con los tensores MTP (Multi-Token Prediction) preservados. El objetivo principal es proporcionar una alternativa de alta calidad a otras cuantizaciones existentes, como las de Unsloth Dynamic Quantization 3.0, con una granularidad más fina en el rango de 3,1 a 5,1 bits por peso (bpw).

El modelo base, Qwen3.8-27B, es un modelo denso multimodal de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba, con una ventana de contexto de 262K tokens y licencia Apache 2.0. Esta cuantización MoQ resulta especialmente relevante porque permite ejecutar un modelo de 27B con capacidades de visión y razonamiento en hardware de consumo, manteniendo un equilibrio entre tamaño y fidelidad. La evaluación local realizada por el autor muestra que esta serie supera a las cuantizaciones equivalentes de Unsloth en la mayoría de los puntos de comparación en términos de perplejidad (PPL) y divergencia de cola (p999 KLD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | MoQ: 3.2, 3.6, 3.8, 4.1, 4.3, 4.6, 4.8, 4.9, 5.1 (bits por peso reales: 3.0956–5.0772) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifican en esta cuantización) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con capacidades multimodales nativas, incluyendo un codificador de visión que permite procesar imágenes y vídeo. El modelo soporta razonamiento, generación de código y tareas agénticas, y fue entrenado por el equipo Qwen de Alibaba con una ventana de contexto de 262K tokens.

La cuantización MoQ aplicada en esta serie combina dos estrategias: (1) un esquema de cuantización mixta a nivel de capa (MoQ) que asigna diferentes precisiones a distintas capas del modelo, y (2) estrategias específicas por tensor derivadas de la implementación de Unsloth Dynamic 3.0 para cuantizaciones de baja precisión. El proceso de cuantización incluye la generación de una imatrix de calibración específica para Qwen3.8, la transferencia del esquema de asignación MoQ desde Qwen3.6 (que comparte arquitectura a nivel de tensor), y un ajuste fino de las estrategias por familia de tensores. Los archivos resultantes preservan los tensores MTP del modelo original, lo que permite mantener la capacidad de predicción multi-token.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de realizar tareas de razonamiento complejo, planificación y resolución de problemas en múltiples pasos.
- Capacidades multimodales: soporta entrada de imágenes y vídeo gracias al codificador de visión nativo, lo que permite tareas de visión-lenguaje como descripción de imágenes, respuesta visual a preguntas y análisis de vídeo.
- Generación de código: destaca en tareas de programación, incluyendo generación, revisión y depuración de código en múltiples lenguajes.
- Soporte de agentes y tool calling: el modelo está optimizado para flujos de trabajo agénticos, incluyendo el manejo de herramientas y la respuesta a feedback del entorno para completar tareas multi-paso.
- Modo de razonamiento: el modelo puede activar un modo de pensamiento extendido para problemas complejos, similar a otros modelos de la familia Qwen3.
- Multilingüe: aunque no se especifican los idiomas exactos en la cuantización, el modelo base Qwen3.8 soporta un amplio rango de idiomas.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar este modelo cuantizado en una estación de trabajo con una GPU de 24 GB para obtener autocompletado de código, explicaciones de fragmentos y refactorización, gracias a su capacidad de generación de código y razonamiento.
- Automatización de oficina: el modelo puede procesar documentos, generar informes, resumir correos electrónicos y extraer información de tablas e imágenes, aprovechando su capacidad multimodal y su ventana de contexto de 262K tokens para manejar documentos largos.
- Agente de atención al cliente: con soporte para tool calling y razonamiento multi-paso, puede integrarse en sistemas de chatbot que necesiten consultar bases de datos, APIs o sistemas de ticketing para resolver consultas complejas de usuarios.
- Análisis de vídeo e imágenes: gracias al codificador de visión, puede utilizarse para tareas de moderación de contenido, análisis de imágenes médicas o descripción automática de vídeo en tiempo real.
- Investigación académica: investigadores que necesiten un modelo de 27B con licencia Apache 2.0 para experimentos de procesamiento de lenguaje natural o visión por computador, sin los costes de infraestructura de modelos más grandes.
- Despliegue en edge computing: las cuantizaciones más pequeñas (10,5–12,7 GB) permiten ejecutar el modelo en dispositivos con 16 GB de RAM o VRAM, como portátiles de gama alta o mini-PCs con GPU, para aplicaciones de asistencia personal sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. Sin embargo, el autor proporciona una evaluación local comparando la serie MoQ con la serie Unsloth Dynamic Quantization 3.0, medida sobre WikiText-2 con contexto fijo de 512 tokens y comparada contra logits de referencia BF16. Los resultados clave son:

| Serie | Recipe | Actual BPW | PPL (menor es mejor) | Mean KLD (menor es mejor) | p999 KLD (menor es mejor) | Same top-p (mayor es mejor) |
|---|---:|---:|---:|---:|---:|---:|
| Jianqiao1 MoQ | 3.2 | 3.0956 | 7.408463 | 0.111637 | 3.348125 | 85.679% |
| Jianqiao1 MoQ | 4.1 | 4.1395 | 7.068801 | 0.031460 | 1.056327 | 91.872% |
| Jianqiao1 MoQ | 5.1 | 5.0772 | 7.020549 | 0.012857 | 0.487299 | 94.968% |
| Unsloth | UD-IQ2_XXS | 2.6383 | 7.957195 | 0.163689 | 4.714475 | 82.389% |
| Unsloth | UD-Q4_K_XL | 5.2483 | 6.976017 | 0.008640 | 0.422880 | 96.073% |
| Unsloth | UD-Q6_K_XL | 7.5911 | 6.953912 | 0.001331 | 0.062800 | 98.493% |

En la comparación a igual tamaño, la serie MoQ supera a Unsloth en 8 de 9 puntos en PPL, 7 de 9 en p999 KLD y 2 de 9 en Mean KLD. El modelo base Qwen3.8-27B reporta resultados de 42.2 en DeepSWE, 73.0 en Terminal Bench y 84.3 en OSWorld, según la documentación oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF ocupan entre 10,572 GB y 17,339 GB en disco. Para inferencia, se recomienda al menos 12 GB de VRAM para las cuantizaciones más pequeñas (3.2–3.8) y 20 GB para las más grandes (4.9–5.1), asumiendo que el modelo completo cabe en memoria.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar todas las cuantizaciones; RTX 3090 (24 GB) también es viable; GPUs con 16 GB (como RTX 4080) pueden ejecutar las versiones de hasta 4.1; GPUs con 12 GB (RTX 3060) solo las versiones 3.2 y 3.6.
- Compatibilidad con hardware de consumo: sí, las cuantizaciones 3.2–4.1 caben en GPUs de consumo de 16 GB o menos, y las versiones más pequeñas pueden ejecutarse en sistemas con 16 GB de RAM usando CPU (aunque con menor rendimiento).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato.
- Latencia y throughput: no se proporcionan datos específicos, pero en una RTX 4090 se puede esperar una velocidad de 20–40 tokens/s para las cuantizaciones más pequeñas y 10–20 tokens/s para las más grandes.

## Comparativa con modelos similares

La comparativa más directa es con la serie Unsloth Dynamic Quantization 3.0 para el mismo modelo base, ya que ambas series ofrecen archivos GGUF del mismo modelo. Los datos de la evaluación local muestran que:

| Característica | Jianqiao1 MoQ | Unsloth Dynamic 3.0 |
|---|---|---|
| Rango de tamaños | 10,57–17,34 GB (9 niveles) | 9,01–25,92 GB (8 niveles) |
| Bits por peso reales | 3,0956–5,0772 | 2,6383–7,5911 |
| PPL a tamaño comparable | Mejor en 8 de 9 puntos | Mejor en 1 de 9 puntos |
| p999 KLD a tamaño comparable | Mejor en 7 de 9 puntos | Mejor en 2 de 9 puntos |
| Mean KLD a tamaño comparable | Mejor en 2 de 9 puntos | Mejor en 7 de 9 puntos |
| Preservación de tensores MTP | Sí | No especificado |
| Licencia | Apache 2.0 | Apache 2.0 |

En comparación con otras cuantizaciones GGUF genéricas (como Q4_K_M o Q5_K_M de llama.cpp), la serie MoQ ofrece un control más fino sobre la relación calidad-tamaño, aunque no hay datos públicos de comparación directa.

## Limitaciones y advertencias

- La cuantización introduce degradación de calidad respecto al modelo original BF16, especialmente en las versiones de menor tamaño (3.2 y 3.6), donde la PPL aumenta significativamente (7.41 y 7.22 respectivamente).
- Las métricas de evaluación se basan únicamente en WikiText-2 con contexto de 512 tokens; el rendimiento en tareas de razonamiento complejo o código puede variar y no está verificado.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización, por lo que no es posible comparar directamente su rendimiento en tareas específicas con el modelo original.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje grandes, que la cuantización no elimina.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar el cumplimiento de las condiciones de la licencia del modelo base y de los datos de entrenamiento.
- La preservación de los tensores MTP puede requerir versiones recientes de llama.cpp para su correcto funcionamiento.
- No se proporcionan datos sobre latencia, throughput ni requisitos exactos de VRAM para cada cuantización, por lo que los valores indicados son estimaciones basadas en el tamaño de los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jianqiao1/Qwen3.8-27b-MoQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía para Jetson: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
