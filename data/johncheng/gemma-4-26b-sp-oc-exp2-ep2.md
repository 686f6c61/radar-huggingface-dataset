# JohnCheng/gemma-4-26b-sp-oc-exp2-ep2

## Resumen

El modelo JohnCheng/gemma-4-26b-sp-oc-exp2 es una variante experimental del modelo Gemma 4 de Google DeepMind, con 25,8 mil millones de parámetros y arquitectura MoE (Mixture-of-Experts). Está diseñado para tareas de texto e imagen (image-text-to-text), lo que indica capacidades multimodales. El autor, JohnCheng, lo publica como un experimento de fine-tuning o continuación de entrenamiento sobre la base de Gemma 4 26B A4B.

Este modelo es relevante porque Gemma 4 introduce una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, siendo una de las familias de modelos abiertos más capaces de Google. La variante 26B A4B (26 mil millones de parámetros totales, 4 mil millones activos) ofrece un equilibrio entre capacidad y eficiencia computacional, ya que solo activa una fracción de sus parámetros durante la inferencia. El modelo está disponible en Hugging Face con acceso restringido (gated), lo que requiere aceptar condiciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), Transformer multimodal |
| Parámetros totales | 25.805.933.872 (25,8B) |
| Parámetros activos | 4B (según especificación de Gemma 4 26B A4B) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Más de 140 idiomas (según especificación de Gemma 4) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Gemma 4, donde cada token activa solo una parte de los parámetros totales. En concreto, la variante 26B A4B activa aproximadamente 4 mil millones de parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño. La arquitectura incorpora atención con mecanismos de atención de ventana y global, optimizados para manejar secuencias largas de hasta 256K tokens.

No se dispone de información específica sobre el dataset de entrenamiento de esta variante experimental, ni sobre el proceso de ajuste realizado por JohnCheng. Sin embargo, la familia Gemma 4 de Google DeepMind se entrena con datos multilingües y multimodales (texto e imagen), e incluye procesos de alineación como RLHF (Reinforcement Learning from Human Feedback) y técnicas de optimización para razonamiento y código. Este modelo en particular parece ser un experimento adicional sobre la base, aunque no se especifica el método de entrenamiento o los datos utilizados.

## Capacidades

- Generación de texto: puede producir respuestas coherentes y contextuales en tareas de conversación y redacción.
- Razonamiento: soporta tareas de razonamiento complejo y multi-paso, gracias a la arquitectura MoE y el entrenamiento de la familia Gemma 4.
- Generación de código: la familia Gemma 4 está optimizada para tareas de programación y depuración.
- Comprensión de imágenes (image-text-to-text): puede procesar entradas de imagen y texto, aunque no se especifica si la salida es solo texto o si también puede generar imágenes.
- Multilingüe: soporta más de 140 idiomas, lo que le permite operar en un amplio espectro lingüístico.
- Contexto largo: con una ventana de hasta 256K tokens, puede manejar documentos extensos o conversaciones de larga duración.
- Tool calling / function calling: no se ha confirmado explícitamente para esta variante, pero es una capacidad común en los modelos Gemma 4.
- Modo de pensamiento (thinking mode): no se ha confirmado para esta variante específica.

## Casos de uso

- **Análisis de documentos largos**: con una ventana de contexto de 256K tokens, el modelo puede procesar libros completos, informes técnicos extensos o expedientes legales en una sola pasada, extrayendo información, resumiendo y respondiendo preguntas sobre el contenido.
- **Asistencia multilingüe en atención al cliente**: dado su soporte en más de 140 idiomas, puede desplegarse como chatbot de soporte en plataformas internacionales, gestionando consultas de usuarios en su idioma nativo con respuestas contextuales y coherentes.
- **Generación y revisión de código**: puede asistir en tareas de programación, como generar código a partir de descripciones, revisar fragmentos existentes, detectar errores o proponer optimizaciones, aprovechando su capacidad de razonamiento y su entrenamiento en código.
- **Análisis de imágenes y texto en investigación**: en entornos de investigación, puede combinar imágenes con texto para tareas como descripción de gráficos científicos, interpretación de diagramas técnicos o extracción de información de figuras en artículos académicos.
- **Traducción y localización**: con su soporte multilingüe, puede servir como motor de traducción automática con contexto de largo alcance, lo que es útil para traducir manuales técnicos o sitios web completos manteniendo coherencia terminológica.
- **Agente conversacional para educación**: puede actuar como tutor virtual en plataformas de e-learning, respondiendo preguntas de estudiantes con explicaciones detalladas, adaptándose al nivel de conocimiento del usuario y manteniendo el contexto de la conversación a lo largo de varias sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones para MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo específico. Se recomienda consultar los resultados de la familia Gemma 4 en la documentación oficial de Google DeepMind para tener una referencia de rendimiento general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para el modelo en fp16 o fp32, los pesos ocupan aproximadamente 51,6 GB, por lo que se necesitan al menos 64 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits, la VRAM requerida se reduce a alrededor de 26 GB; con cuantización a 4 bits, a 13 GB.
- **GPU recomendadas**: para una inferencia óptima, se recomienda una GPU con al menos 80 GB de VRAM, como la NVIDIA A100 (80 GB) o H100 (80 GB). Con cuantización, puede ejecutarse en GPUs de consumo como la RTX 4090 (24 GB) si se aplica cuantización de 4 bits.
- **Cabe en GPU de consumo**: sí, con cuantización de 4 bits (GGUF o GPTQ) se puede ejecutar en una RTX 4090 o RTX 3090, aunque con menor velocidad.
- **Opciones de despliegue**: es compatible con vLLM, llama.cpp, Ollama, y Transformers de Hugging Face. También se puede usar con TGI (Text Generation Inference) para entornos de producción.
- **Latencia y throughput estimados**: no disponibles. Dependen de la GPU, la cuantización y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B | 26B totales, 4B activos | 256K | MoE | No disponible | Hugging Face (gated) |
| Gemma 4 12B | 12B | 256K | Dense | No disponible | Hugging Face |
| Gemma 4 31B | 31B | 256K | Dense | No disponible | Hugging Face |
| Llama 3.1 8B | 8B | 128K | Dense | Llama 3.1 License | Hugging Face |

El modelo se sitúa en la categoría de modelos MoE de gran tamaño, con una ventana de contexto superior a la mayoría de alternativas (256K vs 128K de Llama 3.1). Su licencia no está disponible en la información proporcionada, lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se dispone de información específica sobre sesgos de este modelo experimental, pero los modelos Gemma 4 pueden heredar sesgos de los datos de entrenamiento, como cualquier LLM.
- **Riesgo de alucinación**: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en temas poco representados en su entrenamiento.
- **Limitaciones de contexto**: aunque la ventana es de 256K, el rendimiento puede degradarse en secuencias muy largas, y el coste computacional aumenta significativamente.
- **Restricciones de licencia**: la licencia no está disponible, y el acceso es gated, por lo que se deben aceptar condiciones de uso en Hugging Face. No se puede garantizar el uso comercial sin revisar la licencia.
- **Modelo experimental**: la etiqueta "exp" indica que es una versión experimental, por lo que puede tener errores o un rendimiento inferior al modelo base oficial.
- **Capacidades multimodales**: aunque es image-text-to-text, no se ha confirmado la calidad de la generación de imágenes o su capacidad para tareas complejas de visión.

## Enlaces

- [JohnCheng/gemma-4-26b-sp-oc-exp2 en Hugging Face](https://huggingface.co/JohnCheng/gemma-4-26b-sp-oc-exp2)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card | Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 Model Specifications: Complete Performance Guide 2026](https://www.gemma4.wiki/models/gemma-4-model-specifications)
