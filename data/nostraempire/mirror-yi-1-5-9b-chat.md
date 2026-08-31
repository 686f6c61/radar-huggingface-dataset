# NostraEmpire/mirror-yi-1.5-9b-chat

## Resumen

El modelo `NostraEmpire/mirror-yi-1.5-9b-chat` es un espejo (mirror) del checkpoint original `01-ai/Yi-1.5-9B-Chat`, alojado por el usuario NostraEmpire en Hugging Face. Yi-1.5 es la segunda generación de la familia Yi desarrollada por 01-ai, que mejora el modelo base Yi mediante un pre-entrenamiento continuo sobre 500 mil millones de tokens de alta calidad y un ajuste fino con 3 millones de muestras diversas. El resultado es un modelo de 8,83 mil millones de parámetros con arquitectura transformer decoder-only basada en Llama, licencia Apache 2.0 y una ventana de contexto nativa de 4K tokens (con variantes de 16K y 32K disponibles en otros checkpoints de la familia).

Este modelo es relevante porque ofrece un rendimiento competitivo en tareas de código, matemáticas, razonamiento y seguimiento de instrucciones, situándose según sus desarrolladores como el mejor de su categoría entre los modelos open source de tamaño similar. Al ser un mirror, su contenido es idéntico al original, pero alojado por un tercero, lo que puede facilitar la descarga en ciertas regiones o servir como respaldo. Está pensado para desarrolladores que buscan un modelo chat de ~9B parámetros con licencia permisiva para integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama) |
| Parametros totales | 8.829.407.232 (8,83B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4K (variantes de 16K y 32K en otros checkpoints de Yi-1.5) |
| Tipos de cuantizacion | No disponible en la informacion; se ha documentado Q4_K_M (GGUF) en fuentes externas |
| Idiomas soportados | No disponible (el modelo original de 01-ai esta orientado principalmente a chino e ingles, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Yi-1.5-9B-Chat emplea una arquitectura transformer decoder-only similar a la familia Llama, con normalización RMSNorm, activación SwiGLU y atención con máscara causal. El modelo fue pre-entrenado inicialmente con 3,6 billones de tokens, seguido de un pre-entrenamiento continuo con 500 mil millones de tokens adicionales de un corpus de alta calidad. Posteriormente se realizó un ajuste fino supervisado con 3 millones de muestras diversas, lo que mejora las capacidades de código, matemáticas, razonamiento y seguimiento de instrucciones respecto a la versión original Yi. No se mencionan innovaciones arquitectónicas específicas más allá de las heredadas de Llama; el paper asociado (arXiv:2403.04652) documenta los detalles del entrenamiento y la evaluación.

## Capacidades

- Generación de texto conversacional y completado de instrucciones en formato chat.
- Razonamiento lógico y matemático, con mejoras significativas frente a Yi original.
- Generación de código en múltiples lenguajes de programación, gracias al ajuste fino orientado a tareas de programación.
- Comprensión lectora y conocimiento de sentido común, manteniendo el rendimiento del modelo base.
- Seguimiento de instrucciones multi-turno en diálogos, adecuado para asistentes conversacionales.
- No se ha confirmado soporte explícito para tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.
- No incluye capacidades multimodales (visión, audio) en esta versión.

## Casos de uso

- Asistente conversacional para atención al cliente: el modelo puede gestionar diálogos multi-turno con un contexto de 4K tokens, suficiente para mantener conversaciones de soporte técnico o comercial sin perder el hilo. Su licencia Apache 2.0 permite integrarlo en sistemas propietarios.
- Generación de código en entornos de desarrollo: gracias a su entrenamiento específico en código, puede autocompletar funciones, generar scripts y explicar fragmentos. Puede integrarse en IDEs o pipelines de CI/CD para revisión de código automatizada.
- Tutor virtual de programación y matemáticas: su capacidad de razonamiento y explicación paso a paso lo hace útil para plataformas educativas que necesitan un asistente que resuelva problemas y explique conceptos.
- Análisis y resumen de documentos técnicos: con 4K tokens de contexto, puede procesar artículos, informes o documentación extensa y generar resúmenes estructurados o extraer información clave.
- Chatbot interno para empresas: al ser un modelo de 8,83B parámetros, puede desplegarse en hardware moderado (GPU consumer con cuantización) para uso interno sin depender de APIs externas, manteniendo la privacidad de los datos.
- Prototipado rápido de aplicaciones de IA generativa: su tamaño contenido y licencia permisiva lo convierten en una opción ágil para validar ideas de producto antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la informacion disponible. La model card original de 01-ai incluye gráficas comparativas que afirman que Yi-1.5-9B-Chat es el mejor modelo de su tamaño entre los open source, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el material consultado. Se recomienda consultar el paper arXiv:2403.04652 o el repositorio oficial de 01-ai para obtener datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: según fuentes externas, el modelo puede ejecutarse con un mínimo de 6 GB de VRAM utilizando cuantización Q4_K_M (GGUF). En precisión FP16, necesitaría aproximadamente 17,7 GB (tamaño del repo en safetensors).
- GPUs compatibles: se ha documentado compatibilidad con 94 modelos de GPU. En el rango consumer, tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) pueden ejecutarlo con cuantización. Para FP16 se recomienda una GPU con al menos 20 GB (por ejemplo, RTX 3090, RTX 4090 o A5000).
- Opciones de despliegue: al ser un modelo basado en Llama, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers de Hugging Face. No se ha confirmado soporte específico en la ficha, pero es estándar para esta arquitectura.
- Latencia y throughput: no se dispone de datos medidos en la informacion proporcionada. En una GPU consumer moderna, se espera una generación de entre 20 y 50 tokens por segundo con cuantización 4-bit, aunque esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Yi-1.5-9B-Chat (este mirror) | 8,83B | 4K (16K/32K en variantes) | Apache 2.0 | Buen rendimiento en código y matemáticas, mejor de su tamaño según 01-ai |
| Llama 3 8B Instruct | 8,03B | 8K | Llama 3 Community License | Modelo de referencia de Meta, con amplio ecosistema y soporte de tool calling |
| Mistral 7B Instruct | 7,24B | 8K (32K con sliding window) | Apache 2.0 | Modelo eficiente con atención de ventana deslizante, muy popular en despliegues ligeros |
| Gemma 7B Instruct | 8,54B | 8K | Gemma License (Google) | Modelo de Google, con restricciones de uso comercial en algunos casos |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que la comparación se basa en características técnicas y reputación general. Yi-1.5-9B-Chat destaca por su licencia Apache 2.0 sin restricciones de uso comercial, mientras que Llama 3 y Gemma tienen licencias con condiciones adicionales.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o sesgado. No se han publicado evaluaciones específicas de sesgo para Yi-1.5 en la informacion disponible.
- Contexto limitado: la ventana nativa de 4K tokens es corta para tareas que requieren documentos extensos o conversaciones muy largas. Las variantes de 16K y 32K existen, pero este checkpoint concreto no las incluye.
- Idiomas no especificados: aunque el modelo original de 01-ai está orientado principalmente a chino e inglés, no se ha confirmado oficialmente el soporte de otros idiomas. El rendimiento en español u otros idiomas no está documentado.
- Riesgo de uso en producción: al ser un mirror de un tercero, no hay garantía de que el contenido sea exactamente el original, aunque el tamaño del repo y los parámetros coinciden con el checkpoint oficial. Se recomienda verificar los hashes si se usa en entornos críticos.
- Sin soporte de tool calling confirmado: no se ha documentado la capacidad de invocar funciones externas, lo que limita su uso en agentes autónomos complejos.
- Restricciones de licencia: aunque la licencia Apache 2.0 es permisiva, el modelo original de 01-ai puede tener términos adicionales en su sitio web o documentación. Se recomienda revisar el repositorio oficial antes de un despliegue comercial.

## Enlaces

- Repositorio del mirror en Hugging Face: https://huggingface.co/NostraEmpire/mirror-yi-1.5-9b-chat
- Modelo original en Hugging Face: https://huggingface.co/01-ai/Yi-1.5-9B-Chat
- Paper técnico: https://arxiv.org/abs/2403.04652
- Repositorio GitHub de Yi-1.5: https://github.com/01-ai/Yi-1.5
- Página de colección de modelos Yi-1.5 en Hugging Face: https://huggingface.co/collections/01-ai/yi-15-2024-05-663f3ecab5f815a3eaca7ca8
- Guía de VRAM y compatibilidad (fuente externa): https://nodepedia.com/models/yi-1-5-9b-chat/
