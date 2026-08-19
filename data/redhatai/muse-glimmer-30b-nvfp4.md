# RedHatAI/Muse-Glimmer-30B-NVFP4

## Resumen

RedHatAI/Muse-Glimmer-30B-NVFP4 es una versión cuantizada del modelo multimodal Muse-Glimmer-30B desarrollado por Meta Superintelligence Labs. Esta cuantización, creada por RedHatAI, reduce los pesos y activaciones a precisión NVFP4 (FP4 con grupo de 16) mediante la herramienta LLM Compressor, lo que permite una inferencia más rápida y eficiente en memoria manteniendo la mayor parte de la calidad del modelo original. El modelo base es un transformer denso de aproximadamente 18.800 millones de parámetros (aunque se comercializa como "30B"), con capacidades multimodales (texto e imágenes), soporte nativo para tool calling y razonamiento, y está diseñado para tareas de agente y generación de código. Esta versión cuantizada está lista para su uso con vLLM, lo que facilita su despliegue en producción.

La relevancia de esta ficha radica en que ofrece una alternativa optimizada para entornos con recursos limitados, manteniendo las capacidades del modelo original a un coste computacional menor. Al estar basada en el modelo de Meta, hereda su licencia Apache 2.0 (aunque no se especifica explícitamente en la ficha de HuggingFace), lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) |
| Parametros totales | 18.767.497.024 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con grupo de 16, activaciones FP4 con escalado local por grupo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal que procesa texto e imágenes. La cuantización NVFP4 se aplica únicamente a las capas lineales de los bloques transformer, mientras que la torre de visión, las capas de embedding y la cabeza de salida se mantienen en precisión original. El proceso de cuantización utiliza GPTQ con 1024 muestras de calibración del dataset `mlabonne/open-perfectblend` y una longitud máxima de secuencia de 2048 tokens. No se ha realizado ningún entrenamiento adicional; se trata exclusivamente de una optimización post-entrenamiento para reducir el tamaño y acelerar la inferencia.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto e imágenes, permitiendo tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Tool calling / function calling: soporte nativo para invocar herramientas externas, integrable en agentes autónomos.
- Razonamiento multi-paso: incluye un parser de razonamiento específico (`muse_glimmer`) que permite cadenas de pensamiento estructuradas.
- Generación de código: optimizado para tareas de programación, con capacidad de entender y generar código en múltiples lenguajes.
- Capacidades multilingües: no se especifican idiomas concretos, pero al ser un modelo de Meta, probablemente soporte múltiples idiomas, aunque no hay datos confirmados.
- Despliegue eficiente: al estar cuantizado en NVFP4, es adecuado para inferencia en tiempo real con vLLM, reduciendo la latencia y el uso de VRAM.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (aunque la longitud exacta no está disponible) y, gracias a su soporte de tool calling, puede consultar bases de conocimiento o sistemas de tickets en tiempo real.
- Generación de código en producción: integrable en pipelines de CI/CD para autocompletar código, revisar pull requests o generar documentación técnica, aprovechando su capacidad de razonamiento y generación de código.
- Análisis de imágenes médicas o técnicas: al ser multimodal, puede analizar radiografías, diagramas o capturas de pantalla y proporcionar descripciones o diagnósticos preliminares, siempre con supervisión humana.
- Agentes autónomos de navegación web: con su soporte de tool calling y razonamiento, puede interactuar con APIs, rellenar formularios o extraer información de páginas web de forma autónoma.
- Asistente de investigación: puede procesar artículos científicos con figuras y tablas, resumir contenido y responder preguntas específicas sobre los datos presentados.
- Chatbots empresariales con contexto visual: útil para soporte técnico donde los usuarios adjuntan capturas de pantalla o diagramas, el modelo puede interpretar la imagen y ofrecer soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantización NVFP4 puede introducir una ligera degradación en métricas como MMLU o HumanEval, pero no se proporcionan datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 23,4 GB, pero al estar cuantizado en FP4, el modelo en memoria probablemente ocupe menos (estimación ~9-10 GB para los pesos, más overhead de activaciones). Se recomienda al menos 16 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o superiores con soporte para FP4 (Ampere o más reciente). Para despliegue en producción, se sugiere una GPU con al menos 24 GB de VRAM.
- Compatibilidad con consumer GPU: sí, una RTX 4090 (24 GB) puede ejecutar el modelo con tensor-parallel-size 1, aunque la velocidad dependerá de la implementación de vLLM.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo para NVFP4), también compatible con Hugging Face Transformers mediante `compressed-tensors`. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización FP4 suele ofrecer una mejora de 2-3x en throughput frente a FP16 en GPUs compatibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~18.8B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| RedHatAI/Muse-Glimmer-30B-NVFP4 | ~18.8B | no disponible | no disponible | safetensors (NVFP4) | Cuantización para vLLM |
| Otros cuantizados (p.ej. AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de información sobre otros modelos cuantizados de la misma familia para una comparación más amplia.

## Limitaciones y advertencias

- La cuantización NVFP4 puede provocar una pérdida de precisión en tareas de razonamiento complejo o generación de código, aunque suele ser mínima en la práctica.
- No se especifica la licencia de esta versión cuantizada; aunque el modelo base es Apache 2.0, se recomienda verificar los términos antes de uso comercial.
- La longitud de contexto no está documentada, lo que puede limitar su uso en tareas que requieran ventanas muy largas.
- No se han publicado benchmarks específicos para esta cuantización, por lo que el rendimiento real en tareas concretas debe validarse.
- Al ser un modelo multimodal, requiere un procesador (AutoProcessor) para manejar imágenes, lo que añade complejidad al pipeline de inferencia.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento del modelo base, especialmente en tareas de visión o generación de texto.

## Enlaces

- [HuggingFace - RedHatAI/Muse-Glimmer-30B-NVFP4](https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4)
- [Modelo base - meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Guía de uso de Muse Glimmer con vLLM](https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B)
- [Documentación de Unsloth sobre Muse Glimmer](https://unsloth.ai/docs/models/muse-glimmer)
- [Model card de NVIDIA NIM para Muse Glimmer 30B](https://build.nvidia.com/meta/muse-glimmer-30b/modelcard)
