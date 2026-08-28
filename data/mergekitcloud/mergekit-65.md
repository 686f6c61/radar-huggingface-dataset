# MergekitCloud/mergekit-65

## Resumen

mergekit-65 es un modelo de lenguaje de 8.000 millones de parámetros creado mediante la fusión de cuatro modelos base de la familia Llama-3.1-8B utilizando la herramienta open source mergekit. El autor, identificado como MergekitCloud, emplea el método de fusión Model Stock, documentado en el artículo arXiv 2403.19522, tomando como modelo base a vicgalle/Humanish-Roleplay-Llama-3.1-8B. Este enfoque permite combinar las capacidades de los modelos originales sin necesidad de realizar entrenamiento adicional, un procedimiento cada vez más popular en la comunidad open source por su bajo coste computacional.

El resultado es un modelo conversacional orientado al roleplay y a interacciones sin censura, dado que los modelos fusionados incluyen variantes "uncensored" y especializadas en diálogo. Al estar basado en la arquitectura Llama-3.1, hereda una ventana de contexto de 128.000 tokens y el vocabulario multilingüe de su familia. La relevancia de este modelo reside en su naturaleza experimental: representa un caso práctico de fusión de modelos con mergekit, una técnica que permite obtener modelos con capacidades combinadas sin los costes de un fine-tuning tradicional.

El modelo se distribuye únicamente en formato safetensors con precisión float16, ocupando aproximadamente 16,1 GB en el repositorio de HuggingFace. No se ha publicado ninguna métrica de rendimiento, evaluación comparativa ni información sobre el proceso de entrenamiento, más allá de la configuración YAML utilizada para la fusión. La ausencia de descargas y de interacciones en la plataforma sugiere que se trata de un experimento reciente o de baja difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.1) |
| Tipos de cuantizacion | no disponible (solo se distribuye en float16) |
| Idiomas soportados | no disponibles (heredados de Llama-3.1, multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 8.000 millones de parámetros basado en Llama-3.1, con atención por ventanas de 128.000 tokens. El modelo no ha sido entrenado desde cero ni fine-tuneado: se ha construido mediante fusión de modelos con la técnica Model Stock, implementada en mergekit. Este método combina los pesos de varios modelos base —ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS— tomando como referencia el modelo vicgalle/Humanish-Roleplay-Llama-3.1-8B.

La configuración de fusión especifica el uso de máscaras int8 (int8_mask: true) y normalización desactivada (normalize: false), con dtype float16. No se ha aplicado ningún proceso de alineación posterior como RLHF o DPO, por lo que el comportamiento del modelo depende enteramente de las características de los modelos fusionados. La ausencia de datos sobre el dataset de entrenamiento es inherente a la técnica: al ser una fusión, no existe un corpus de entrenamiento propio.

## Capacidades

- Generación de texto conversacional orientada a roleplay y diálogo interactivo, heredada del modelo base Humanish-Roleplay.
- Comportamiento "uncensored" o con menos restricciones que los modelos estándar, derivado de los componentes Lexi-Uncensored y Unholy.
- Procesamiento de contextos largos de hasta 128.000 tokens, permitiendo mantener conversaciones extensas o procesar documentos largos.
- Capacidades multilingües heredadas de Llama-3.1, aunque no se especifican los idiomas concretos.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- No se ha documentado ningún modo de razonamiento especial o "thinking mode".

## Casos de uso

- Roleplay y ficción interactiva: el modelo combina las capacidades de Humanish-Roleplay con variantes sin censura, lo que permite generar narrativas creativas y diálogos de personajes con menos restricciones temáticas que los modelos estándar.
- Prototipado rápido de chatbots conversacionales: al ser un modelo de 8B, puede desplegarse en hardware consumer para experimentar con sistemas de diálogo sin necesidad de APIs comerciales.
- Evaluación de técnicas de fusión de modelos: investigadores y desarrolladores pueden estudiar cómo la combinación de modelos especializados afecta al comportamiento resultante, comparando con los modelos originales.
- Generación de texto creativo: la combinación de modelos orientados a roleplay y sin censura puede producir estilos narrativos variados, útil para escritura creativa asistida.
- Experimentación académica: el modelo sirve como caso de estudio para el método Model Stock y la herramienta mergekit, permitiendo reproducir y analizar el proceso de fusión.
- Fine-tuning posterior: al ser un modelo base fusionado, puede servir como punto de partida para fine-tuning en tareas específicas, aprovechando las capacidades combinadas de los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K u otros) ni comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float16 ocupa aproximadamente 16,1 GB, por lo que se necesitan al menos 16 GB de VRAM para cargarlo sin cuantización. Con cuantización a 8 bits se podría reducir a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se distribuyen versiones cuantizadas.
- GPU recomendadas: para float16 completo, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Para cuantización a 8 bits, una RTX 3080/3090 (10-24 GB) podría ser suficiente.
- En consumer GPU: sí, es viable en GPUs de gama alta con 16 GB o más de VRAM, como la RTX 4080/4090. Para GPUs con menos memoria, sería necesario cuantizar manualmente el modelo.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp tras convertir a GGUF. También es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B en una GPU moderna, se puede esperar una generación de entre 20 y 60 tokens por segundo en float16, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es una fusión de componentes de Llama-3.1-8B, por lo que sus alternativas más directas serían los modelos originales que lo componen:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| mergekit-65 | 8B | 128K | Fusión roleplay/uncensored | no disponible |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3 | 8B | 128K | Conversacional | no disponible |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8B | 128K | Sin censura | no disponible |
| Undi95/Llama3-Unholy-8B-OAS | 8B | 128K | Sin censura | no disponible |

No se han publicado benchmarks que permitan comparar el rendimiento del modelo fusionado con sus componentes o con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o de redistribución. Los modelos base de Llama-3.1 tienen su propia licencia, pero no se confirma que esta se aplique al modelo fusionado.
- Ausencia de evaluación: no se ha publicado ningún benchmark, evaluación de sesgos o análisis de robustez. El comportamiento del modelo en tareas reales es desconocido.
- Riesgo de alucinación: al ser un modelo sin fine-tuning posterior a la fusión, puede generar información falsa o inventada con mayor facilidad que modelos alineados.
- Contenido potencialmente problemático: al combinar modelos "uncensored", el modelo puede generar contenido ofensivo, explícito o dañino sin los filtros habituales de seguridad.
- Sin garantías de calidad: al ser un experimento de fusión sin evaluación, no hay garantía de que las capacidades de los modelos originales se hayan combinado de forma coherente o deseable.
- Sin soporte documentado: el autor no proporciona documentación, guía de uso ni canal de soporte para el modelo.
- Datos de entrenamiento desconocidos: al ser una fusión, no existe información sobre los datos utilizados para entrenar los componentes, lo que dificulta evaluar sesgos o limitaciones específicas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/MergekitCloud/mergekit-65
- mergekit (GitHub): https://github.com/arcee-ai/mergekit
- Artículo Model Stock (arXiv): https://arxiv.org/abs/2403.19522
- Artículo de MergeKit (arXiv): https://arxiv.org/html/2403.13257v2
- Blog de HuggingFace sobre fusión de modelos: https://huggingface.co/blog/mlabonne/merge-models
- Guía comunitaria de MergeKit: https://www.mergekit.com/
