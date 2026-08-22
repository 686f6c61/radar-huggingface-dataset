# ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-grpo-arm-e

## Resumen

Qwen3.5-4B-sdpo-react-mathcodesearch-grpo-arm-e es un fine-tune del modelo base Qwen3.5-4B-Base, publicado por el usuario de Hugging Face ipfipfipf. El nombre del modelo sugiere el uso de técnicas de post-entrenamiento como SDPO (Step-DPO), GRPO, y patrones de razonamiento ReAct, orientados específicamente a tareas de matemáticas y búsqueda de código. Se trata de un modelo multimodal (visión y texto) con arquitectura híbrida, desarrollado sobre la familia Qwen3.5 de Alibaba.

El modelo base Qwen3.5-4B es un modelo causal de lenguaje con encoder de visión, que integra Gated DeltaNet y atención completa para lograr una inferencia eficiente con ventanas de contexto muy largas (262 144 tokens nativos, extensible hasta 1 010 000). El fine-tune aquí descrito hereda estas capacidades y las adapta a dominios específicos mediante técnicas de aprendizaje por refuerzo, aunque el autor no ha publicado una model card propia con detalles del proceso de entrenamiento.

La relevancia de este modelo radica en su tamaño compacto (4,2 mil millones de parámetros) combinado con una arquitectura multimodal y de contexto largo, lo que lo hace atractivo para despliegues en entornos con recursos limitados. No obstante, al ser un fine-tune de un usuario, carece de documentación oficial sobre su rendimiento en tareas específicas, por lo que su evaluación requiere pruebas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention (con encoder de visión) |
| Parametros totales | 4 205 751 296 (~4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 |
| Tipos de cuantizacion | No disponibles (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B presenta una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de atención lineal) con capas de atención completa. La disposición es de 8 bloques repetidos, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention. Esta mezcla busca reducir el coste computacional en la generación de secuencias largas, manteniendo la calidad de la atención completa en puntos clave. El modelo incluye un encoder de visión para el procesamiento de imágenes, lo que lo convierte en un modelo multimodal nativo.

El fine-tune aquí descrito emplea técnicas de aprendizaje por refuerzo y optimización de preferencias, como GRPO y SDPO, junto con un patrón de razonamiento ReAct (Reasoning and Acting) para tareas de matemáticas y búsqueda de código. El autor no proporciona detalles sobre el dataset, el número de pasos de entrenamiento ni la composición exacta de las fases de RL. Al tratarse de un modelo experimental, no hay información sobre el proceso de post-entrenamiento más allá de lo que sugiere el nombre.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo base procesa imágenes y texto, pudiendo responder a preguntas visuales y textuales de forma conjunta.
- Razonamiento matemático: el fine-tune está orientado a mejorar el rendimiento en problemas matemáticos, aunque no hay benchmarks publicados que lo confirmen.
- Búsqueda y generación de código: el nombre del modelo indica un enfoque en búsqueda de código, posiblemente con soporte para tool calling o búsqueda en repositorios.
- Patrón ReAct: el modelo está entrenado para intercalar razonamiento y acciones, lo que lo hace útil para tareas de agentes y planificación multi-paso.
- Multilingüe: hereda el soporte de 201 idiomas del modelo base Qwen3.5, aunque el fine-tune puede haber reducido ese rango.
- Contexto largo: ventana de 262 144 tokens nativos, extensible hasta 1 010 000, lo que permite procesar documentos extensos o historiales de conversación prolongados.

## Casos de uso

- Tutor de matemáticas personalizado: el modelo puede explicar paso a paso la resolución de problemas de álgebra, cálculo o estadística, aprovechando su razonamiento matemático y su capacidad de generar respuestas largas y coherentes.
- Agente de búsqueda de código: integrado en un entorno de desarrollo, puede interpretar consultas en lenguaje natural y buscar fragmentos de código en un repositorio, ejecutando acciones de búsqueda con el patrón ReAct.
- Asistente de documentación técnica: con su ventana de contexto de 262K tokens, puede analizar manuales completos, APIs y especificaciones para responder preguntas complejas sobre integraciones.
- Generación de informes multimodales: dado que el modelo base acepta imágenes, puede combinar una captura de pantalla o diagrama con texto para explicar un error de software o un proceso de negocio.
- Chatbot de atención al cliente con contexto largo: puede mantener conversaciones de muchos turnos, recordando detalles de interacciones anteriores dentro de su ventana de contexto.
- Prototipo de agente autónomo en entornos educativos: puede razonar sobre un problema de programación, generar una solución y ejecutarla en un sandbox, gracias a su patrón ReAct y su capacidad de tool calling (si se configura).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base Qwen3.5-4B muestra los siguientes resultados en la tabla de la model card original (datos del modelo base, no del fine-tune):

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | 87,8 |

No hay datos comparativos con otros modelos de tamaño similar en la información proporcionada. Los resultados del fine-tune podrían diferir, pero no se han hecho públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,2B parámetros. En FP16 (precisión completa) ocupa aproximadamente 8,4 GB, por lo que requiere una GPU con al menos 12 GB de VRAM para inferencia cómoda (p. ej., RTX 3060 12GB, RTX 4070, A10).
- Con cuantización de 4 bits (GGUF o AWQ), el modelo se reduce a unos 2,5-3 GB, pudiendo caber en GPUs de 6-8 GB como la RTX 2060 o la GTX 1660 Super.
- GPU recomendadas: RTX 3090/4090 para FP16, o A100/H100 para despliegue en producción con alto throughput.
- Opciones de despliegue: compatible con Transformers, vLLM, SGLang, KTransformers, llama.cpp (si se convierte a GGUF) y Ollama.
- Latencia y throughput: no hay datos medidos publicados. En una RTX 4090 con FP16, se estima un throughput de 50-100 tokens/s para modelos de 4B, dependiendo de la longitud de secuencia.

## Comparativa con modelos similares

Comparación del modelo base Qwen3.5-4B con otros modelos de tamaño similar (no hay datos del fine-tune específico):

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B (este) | 4,2B | 262K (ext. 1M) | Híbrida Gated DeltaNet + Atención | Apache 2.0 |
| Qwen3-4B | 4,0B | 32K | Transformer denso | Apache 2.0 |
| Llama-3.2-3B | 3,2B | 128K | Transformer denso | Llama 3.2 |
| Phi-3.5-mini | 3,8B | 128K | Transformer denso | MIT |

La comparativa se basa en el modelo base, ya que no se dispone de datos específicos del fine-tune. El Qwen3.5-4B destaca por su contexto nativo más largo y su arquitectura híbrida, mientras que los otros modelos son más simples pero con ecosistemas más consolidados.

## Limitaciones y advertencias

- No hay documentación oficial sobre el proceso de fine-tune, por lo que no se conocen los datos de entrenamiento ni las técnicas de regularización aplicadas. Esto implica un riesgo de sobreajuste a los dominios de matemáticas y código.
- El modelo puede presentar alucinaciones en tareas de razonamiento complejo, especialmente cuando se le pide explicar el proceso de solución. No se ha evaluado su robustez frente a preguntas adversas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción. Se recomienda validar en un conjunto de datos propio.
- El modelo base está entrenado en 201 idiomas, pero el fine-tune puede haber reducido la cobertura multilingüe al priorizar inglés y matemáticas. No se ha verificado el rendimiento en español u otros idiomas.
- El contexto de 262K tokens es teórico; en la práctica, la calidad de la generación puede degradarse en secuencias muy largas, especialmente con la arquitectura híbrida. Es recomendable limitar la longitud de entrada a 32K-64K tokens para tareas críticas.
- El modelo es multimodal, pero el fine-tune puede haber alterado el encoder de visión, por lo que no se garantiza el rendimiento visual del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipfipfipf/Qwen3.5-4B-sdpo-react-mathcodesearch-grpo-arm-e
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Documentación de vLLM sobre Qwen3.5-Dense: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.5-Dense.html
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
