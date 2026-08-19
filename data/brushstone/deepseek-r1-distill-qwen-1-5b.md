# BrushStone/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje de razonamiento, destilado a partir de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B. Fue desarrollado originalmente por DeepSeek AI y este repositorio concreto (BrushStone/DeepSeek-R1-Distill-Qwen-1.5B) es una copia alojada por el usuario BrushStone, con licencia MIT. El modelo forma parte de la familia de seis destilados publicados por DeepSeek, que incluyen versiones de 1.5B, 7B, 8B, 14B, 32B y 70B, y está diseñado para ofrecer capacidades de razonamiento con cadena de pensamiento (chain-of-thought) en un tamaño compacto.

Con 1.777 millones de parámetros, es el miembro más pequeño de la familia de destilados. Su relevancia radica en que permite ejecutar razonamiento avanzado en hardware de consumo, algo que hasta hace poco requería modelos de decenas de miles de millones de parámetros. El proceso de destilación utilizó datos generados por DeepSeek-R1 para fine-tuning supervisado, logrando que el modelo herede patrones de razonamiento del modelo grande sin necesidad de entrenamiento por refuerzo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer denso con atención causal estándar. El proceso de entrenamiento consistió en destilar los patrones de razonamiento de DeepSeek-R1, que fue entrenado mediante aprendizaje por refuerzo a gran escala sobre un modelo base sin fine-tuning supervisado previo. Para el destilado, DeepSeek generó datos de razonamiento (cadenas de pensamiento largas, auto-verificación y reflexión) usando DeepSeek-R1 y los utilizó para fine-tuning supervisado del modelo base Qwen2.5-1.5B. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Razonamiento con cadena de pensamiento (CoT) extensa, incluyendo auto-verificación y reflexión sobre sus propias respuestas.
- Generación de texto conversacional y completado de texto en formato de chat.
- Capacidades matemáticas y lógicas básicas, heredadas del proceso de destilación.
- Soporte de generación de código en tareas sencillas, aunque con limitaciones propias de su tamaño.
- No se especifican capacidades de tool calling, function calling ni soporte de agentes en la información disponible.
- No se indica soporte multimodal (visión, audio) ni modo de pensamiento explícito más allá del CoT generado.

## Casos de uso

- Prototipado de aplicaciones de razonamiento: al ser un modelo pequeño, permite validar flujos de cadena de pensamiento en entornos de desarrollo sin necesidad de GPUs de gran capacidad, antes de escalar a modelos mayores.
- Asistente educativo para resolución de problemas matemáticos: puede explicar pasos intermedios en ejercicios de álgebra o lógica, aprovechando su capacidad de generar razonamientos estructurados.
- Generación de código en entornos con recursos limitados: para tareas de programación simples (funciones cortas, scripts), puede integrarse en editores o pipelines de CI/CD ligeros donde no se dispone de hardware de alto rendimiento.
- Chatbot de soporte técnico de bajo coste: su tamaño permite desplegarlo en CPU o GPUs de gama baja, ofreciendo respuestas razonadas en dominios acotados.
- Investigación académica sobre destilación de modelos: sirve como punto de comparación para estudiar cómo se transfieren las capacidades de razonamiento de modelos grandes a pequeños.
- Evaluación de técnicas de cuantización y optimización: al ser un modelo compacto, es adecuado para probar métodos de compresión (GGUF, AWQ) y medir su impacto en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de DeepSeek-R1 (arxiv:2501.12948) reporta evaluaciones para los destilados, pero esos datos no se incluyen en la documentación de este repositorio. Se recomienda consultar el paper para obtener métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 (formato nativo) el modelo ocupa aproximadamente 3,6 GB de pesos, por lo que se necesitan al menos 4-6 GB de VRAM considerando overhead de activaciones y caché KV. Con cuantización a 4 bits, el uso de VRAM se reduce a aproximadamente 1 GB, permitiendo ejecución en GPUs con 2-4 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo en BF16 con batch pequeño. Para cuantización 4-bit, incluso GPUs integradas o CPUs con suficiente RAM son viables.
- Cabe en GPUs de consumo: sí, es uno de los modelos de razonamiento más pequeños disponibles, diseñado para ejecutarse en hardware doméstico.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI) y endpoints compatibles. No se indica soporte nativo para llama.cpp u Ollama, aunque al ser un modelo Qwen2.5 es probable que funcione con convertidores GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3060) se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este) | 1,78B | No disponible | MIT | Destilado de DeepSeek-R1 sobre Qwen2.5 |
| DeepSeek-R1-Distill-Qwen-7B | 7B | No disponible | MIT | Versión mayor, mejor rendimiento en razonamiento |
| DeepSeek-R1-Distill-Llama-8B | 8B | No disponible | MIT | Basado en Llama 3.1, alternativa de mayor tamaño |
| Qwen2.5-1.5B (base) | 1,5B | 128k (según arquitectura) | Apache 2.0 | Modelo base sin destilación de razonamiento |

La comparativa se limita a los destilados de DeepSeek-R1 y al modelo base Qwen2.5, ya que no se dispone de datos de otros modelos de razonamiento de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 1,5B, su rendimiento en tareas complejas de razonamiento, matemáticas avanzadas o código extenso es significativamente inferior al de los destilados de mayor tamaño (7B, 32B).
- Riesgo de alucinación: como todos los modelos generativos, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Idiomas no especificados: la model card no indica los idiomas soportados, aunque al derivar de Qwen2.5 probablemente tenga cobertura multilingüe limitada; no se recomienda para producción en idiomas distintos del inglés sin evaluación previa.
- Longitud de contexto no confirmada: no se ha verificado la ventana de contexto real en este repositorio; se recomienda probar antes de usarlo con entradas largas.
- Licencia MIT: permite uso comercial y modificaciones, incluyendo destilación para entrenar otros modelos, pero se debe atribuir la autoría original.
- Sin garantías de soporte: el repositorio de BrushStone no tiene descargas ni actividad, por lo que no se puede esperar mantenimiento o actualizaciones.

## Enlaces

- Repositorio en HuggingFace (BrushStone): https://huggingface.co/BrushStone/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Página en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
