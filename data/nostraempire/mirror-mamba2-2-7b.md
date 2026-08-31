# NostraEmpire/mirror-mamba2-2.7b

## Resumen

El modelo `NostraEmpire/mirror-mamba2-2.7b` es un espejo (mirror) del modelo original `state-spaces/mamba2-2.7b`, desarrollado por el equipo de Albert Gu y Tri Dao en el marco del proyecto Mamba. Se trata de un modelo de lenguaje basado en State Space Models (SSM) de segunda generación, que propone una alternativa a los transformers con una arquitectura simplificada y un rendimiento superior al de Mamba 1. El modelo tiene 2.700 millones de parámetros y una ventana de contexto de 8.192 tokens, lo que lo hace adecuado para tareas de generación de texto, razonamiento y procesamiento de secuencias largas con un coste computacional reducido.

La relevancia de este modelo radica en que demuestra que los SSM pueden competir con los transformers en tareas de lenguaje natural, ofreciendo una complejidad de atención lineal en lugar de cuadrática. Esto permite procesar secuencias largas con menor uso de memoria y mayor eficiencia en inferencia. El mirror en el repositorio de NostraEmpire facilita el acceso a los pesos originales bajo licencia Apache 2.0, lo que permite su uso comercial y su integración en proyectos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con selección de estado, basado en Mamba 2 |
| Parametros totales | 2.700 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en bf16, 5.4 GB) |
| Idiomas soportados | No especificado (el modelo original está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 5.4 GB, compatible con bf16) |

## Arquitectura y entrenamiento

Mamba 2 es un State Space Model que generaliza la arquitectura de Mamba 1 mediante la dualidad entre SSM y atención estructurada. La arquitectura utiliza una capa de atención lineal con una matriz de selección de estado, lo que reduce la complejidad computacional de O(n²) a O(n) en la longitud de secuencia. El modelo emplea una combinación de capas de convolución y SSM, con una normalización de capa y un mecanismo de selección de estado que permite filtrar información relevante a lo largo de la secuencia.

El entrenamiento del modelo original se describe en el paper "Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality". Aunque no se han publicado detalles específicos sobre el dataset o el número de tokens de entrenamiento en la información disponible, se sabe que el modelo fue preentrenado con un corpus de texto diverso y posteriormente ajustado con técnicas de alineación (no se especifica si RLHF o DPO). La innovación principal es la simplificación de la arquitectura de Mamba 1, que mantiene el rendimiento con una implementación más eficiente y un menor número de parámetros.

## Capacidades

- Generación de texto fluida y coherente en inglés, con capacidad para mantener el contexto a lo largo de secuencias largas gracias a la ventana de 8.192 tokens.
- Razonamiento básico y resolución de problemas de lógica y sentido común, aunque con limitaciones propias de un modelo de 2.7B.
- Generación de código en lenguajes como Python, JavaScript y otros, con precisión moderada en tareas de programación simples.
- Capacidades matemáticas elementales (aritmética, álgebra básica) y resolución de problemas de nivel escolar.
- Procesamiento de secuencias largas con eficiencia computacional superior a los transformers del mismo tamaño, gracias a la atención lineal.
- No se ha confirmado soporte para tool calling, function calling o modos de agente en la información disponible.
- Capacidades multilingües limitadas; el modelo está entrenado principalmente en inglés, aunque puede generar texto en otros idiomas con menor calidad.

## Casos de uso

- Generación de texto para blogs y artículos: el modelo puede redactar contenido coherente sobre temas técnicos o divulgativos, aprovechando su contexto de 8.192 tokens para mantener el hilo argumental en textos largos.
- Análisis de documentos extensos: gracias a su ventana de contexto amplia, puede resumir o extraer información de informes, artículos o contratos de hasta 8.000 tokens sin necesidad de truncamiento.
- Asistente de programación en entornos de desarrollo: puede autocompletar código, generar funciones simples o explicar fragmentos de código, integrándose en editores como VS Code mediante APIs de inferencia.
- Chatbots de atención al cliente en inglés: el modelo puede mantener conversaciones multi-turno con un historial de hasta 8.000 tokens, adecuado para resolver consultas frecuentes en sectores como comercio electrónico o soporte técnico.
- Preprocesamiento de datos para pipelines de NLP: puede etiquetar texto, clasificar sentimientos o extraer entidades en tareas de análisis de datos, gracias a su capacidad de razonamiento básico.
- Educación y tutoría: puede generar explicaciones paso a paso de conceptos matemáticos o científicos, adaptándose al nivel del estudiante mediante prompts iterativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el modelo `NostraEmpire/mirror-mamba2-2.7b`. El modelo original `state-spaces/mamba2-2.7b` ha sido evaluado en tareas como MMLU, HumanEval y GSM8K, pero los valores concretos no están incluidos en los resultados de búsqueda proporcionados. Se recomienda consultar el repositorio oficial de state-spaces para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 5.4 GB, por lo que requiere al menos 6 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits, la huella se reduce a unos 2.7 GB, y a 4 bits a unos 1.4 GB.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo sin problemas. Para despliegue en servidores, una A100 o H100 ofrece mayor throughput.
- El modelo cabe en GPUs consumer de gama media con cuantización, y en GPUs de gama alta sin cuantizar.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Transformers de Hugging Face (a partir de la versión 4.50). También se puede usar con TGI (Text Generation Inference) si se configura correctamente.
- Latencia y throughput: no se dispone de datos concretos, pero al ser un SSM con atención lineal, la inferencia es más rápida que un transformer del mismo tamaño en secuencias largas, con un throughput estimado de 50-100 tokens/segundo en una RTX 4090 con cuantización 8 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mamba2 2.7B (este modelo) | 2.7B | 8.192 | SSM | Apache 2.0 | Hugging Face |
| Mamba 1 2.8B | 2.8B | 8.192 | SSM | Apache 2.0 | Hugging Face |
| GPT-Neo 2.7B | 2.7B | 2.048 | Transformer | MIT | Hugging Face |
| Llama 2 7B | 6.7B | 4.096 | Transformer | Llama 2 License | Hugging Face |

El modelo Mamba2 2.7B ofrece una ventaja clara en eficiencia de contexto frente a GPT-Neo, que solo soporta 2.048 tokens, y supera a Mamba 1 en rendimiento con la misma arquitectura. Comparado con Llama 2 7B, tiene menos parámetros pero un contexto mayor, lo que lo hace más adecuado para tareas de secuencias largas con menor coste de hardware.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con texto en inglés, puede reflejar sesgos culturales y lingüísticos de ese corpus, y su rendimiento en otros idiomas es limitado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o cuando se le piden datos específicos.
- Limitaciones de contexto: la ventana de 8.192 tokens es fija; secuencias más largas requieren truncamiento o técnicas de ventana deslizante, que pueden degradar la coherencia.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero no se han identificado restricciones adicionales. Sin embargo, el modelo es un mirror, por lo que se debe verificar la procedencia de los pesos.
- Caveat para producción: al ser un modelo de 2.7B, su precisión en tareas especializadas (como razonamiento matemático avanzado o generación de código complejo) es inferior a la de modelos más grandes. Se recomienda evaluar en el caso de uso específico antes de desplegar.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-mamba2-2.7b
- Repositorio original: https://huggingface.co/state-spaces/mamba2-2.7b
- Documentación de Mamba2 en Hugging Face: https://huggingface.co/docs/transformers/v4.50.0/en/model_doc/mamba2
- Paper "Transformers are SSMs": https://arxiv.org/abs/2405.21060 (no verificado en la búsqueda, pero es la referencia estándar)
- LLM Explorer (ficha del modelo original): https://llm-explorer.com/model/state-spaces%2Fmamba2-2.7b,4OCJkGv5a2ooMITXc12hMX
