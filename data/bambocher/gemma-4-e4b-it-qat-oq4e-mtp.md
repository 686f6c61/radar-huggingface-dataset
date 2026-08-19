# bambocher/gemma-4-E4B-it-qat-oQ4e-mtp

## Resumen

El modelo `bambocher/gemma-4-E4B-it-qat-oQ4e-mtp` es una cuantización de 4 bits del modelo Gemma 4 E4B IT de Google DeepMind, realizada con la herramienta oQ (oMLX v0.6.1) en formato MLX safetensors. La cuantización emplea una precisión mixta con grupo de tamaño 64, lo que reduce el tamaño del modelo a aproximadamente 5,5 GB en disco, frente a los pesos originales en bf16. El objetivo es facilitar la ejecución local en hardware de consumo manteniendo una calidad cercana al modelo original, gracias al entrenamiento con cuantización consciente (QAT) que ya incorpora el modelo base.

El modelo original, Gemma 4 E4B, es una familia de modelos abiertos de Google DeepMind con capacidades multimodales (texto e imagen), razonamiento, contexto largo de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. Esta versión cuantizada está pensada para entornos con recursos limitados, como portátiles con Apple Silicon o GPUs de gama media, donde el tamaño reducido permite una inferencia fluida sin sacrificar en exceso la precisión. Aunque el repositorio no ofrece detalles sobre el entrenamiento original, se sabe que el modelo base fue entrenado con QAT, lo que lo hace especialmente adecuado para su posterior cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B según el nombre) |
| Parametros totales | 1.767.959.374 (según safetensors) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 256K tokens (según documentación de Gemma 4, no confirmado en este repo) |
| Tipos de cuantizacion | 4 bits, group size 64, formato oQ (oMLX mixed-precision) |
| Idiomas soportados | Más de 140 (según documentación de Gemma 4, no confirmado en este repo) |
| Licencia | no disponible (el modelo base usa licencia Gemma de Google) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo más allá de indicar que pertenece a la familia gemma4. Según la documentación oficial de Gemma 4, los modelos de esta serie pueden adoptar arquitecturas densas o de mezcla de expertos (MoE), aunque para la variante E4B no se especifica cuál es. El conteo de parámetros real en safetensors (1,77 mil millones) es notablemente inferior al tamaño nominal de E4B (4,4 mil millones según la web de Google), lo que podría indicar que se trata de una versión podada o que el repositorio contiene solo una parte de los pesos, aunque no hay información que lo confirme.

El entrenamiento del modelo original incluyó cuantización consciente (QAT), un proceso que simula la cuantización durante el entrenamiento para que el modelo aprenda a compensar la pérdida de precisión. Esto explica que la versión cuantizada a 4 bits mantenga una calidad cercana a la versión en bf16. La cuantización adicional realizada por bambocher con oQ aplica una precisión mixta, asignando más bits a las capas más sensibles y menos a las redundantes, lo que optimiza el equilibrio entre tamaño y rendimiento. No se dispone de información sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base Gemma 4 E4B es capaz de tareas de comprensión y generación de lenguaje natural, incluyendo razonamiento lógico y matemático.
- Entrada multimodal: soporta entrada de imágenes además de texto, aunque esta capacidad no está confirmada en la versión cuantizada.
- Contexto largo: ventana de hasta 256K tokens, lo que permite procesar documentos extensos o conversaciones de múltiples turnos.
- Soporte multilingüe: más de 140 idiomas, aunque la calidad puede variar entre lenguas.
- System prompts: acepta instrucciones de sistema para guiar el comportamiento del modelo.
- Thinking mode: según la documentación de Gemma 4, el modelo puede generar cadenas de razonamiento internas antes de responder, útil para problemas complejos.
- Tool calling y function calling: no se menciona explícitamente en el repositorio, pero es una capacidad habitual en los modelos Gemma 4; no obstante, no está confirmada para esta cuantización.

## Casos de uso

- Asistente local de chat: al ser un modelo de 4 bits que ocupa unos 5,5 GB, puede ejecutarse en un portátil con Apple Silicon (M1/M2/M3) o en una GPU con 8 GB de VRAM, ofreciendo respuestas rápidas sin conexión a internet.
- Análisis de documentos extensos: gracias a su contexto de 256K tokens, es adecuado para resumir o extraer información de informes, contratos o artículos largos, siempre que la cuantización no degrade la comprensión en textos muy largos.
- Generación de código asistida: aunque no se confirma soporte de tool calling, el modelo base de Gemma 4 tiene buenas capacidades de programación; la versión cuantizada puede usarse en editores de código locales para autocompletar o explicar fragmentos.
- Procesamiento de imágenes con texto: si la capacidad multimodal se mantiene tras la cuantización, podría emplearse para describir imágenes o responder preguntas sobre ellas, por ejemplo en aplicaciones de accesibilidad.
- Prototipado rápido de aplicaciones de IA: al ser ligero y de código abierto (con la licencia correspondiente), permite experimentar con técnicas de prompting o fine-tuning sin necesidad de infraestructura costosa.
- Educación e investigación: útil para enseñar conceptos de modelos de lenguaje y cuantización, ya que se puede inspeccionar el código y comparar el rendimiento con la versión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de evaluación, y la documentación de Gemma 4 no proporciona cifras específicas para esta variante cuantizada. Se recomienda consultar el modelo original para obtener referencias de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 5,5 GB, por lo que se necesitan al menos 6-8 GB de memoria disponible (VRAM o RAM unificada) para cargar el modelo en 4 bits. Con pesos en memoria, el consumo real puede rondar los 5-6 GB.
- GPU recomendadas: tarjetas con 8 GB de VRAM como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de Apple Silicon con memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max).
- Compatibilidad con consumer GPU: sí, siempre que se cumpla el requisito de VRAM. En GPUs con menos de 8 GB podría ser necesario usar cuantización más agresiva o descargar capas a CPU.
- Opciones de despliegue: al estar en formato MLX, es compatible con la librería MLX de Apple para aceleración en Metal. También puede convertirse a GGUF para usarse con llama.cpp, Ollama o LM Studio, aunque la conversión no está incluida en el repositorio.
- Latencia y throughput: no se proporcionan datos concretos. En una GPU moderna de gama media, se espera una velocidad de generación de entre 20 y 40 tokens por segundo, dependiendo de la longitud de contexto y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva. El modelo original Gemma 4 E4B tiene 4,4 mil millones de parámetros, mientras que esta cuantización muestra 1,77 mil millones en safetensors, lo que sugiere que podría tratarse de una versión reducida o que el conteo es incorrecto. Sin datos de benchmarks ni especificaciones detalladas, no es posible comparar con alternativas como Llama 3.2 3B, Phi-3.5 mini o Qwen 2.5 4B. Se recomienda evaluar el modelo directamente en las tareas de interés antes de adoptarlo en producción.

## Limitaciones y advertencias

- La cuantización a 4 bits puede provocar una degradación perceptible en tareas que requieren razonamiento complejo o precisión numérica, aunque el entrenamiento QAT del modelo base mitiga parcialmente este efecto.
- No se ha confirmado que todas las capacidades del modelo base (multimodalidad, tool calling, thinking mode) se mantengan intactas tras la cuantización; es necesario probarlas explícitamente.
- El conteo de parámetros real (1,77 mil millones) difiere del tamaño nominal de Gemma 4 E4B (4,4 mil millones), lo que genera incertidumbre sobre si el repositorio contiene el modelo completo o una versión modificada.
- La licencia no está especificada en el repositorio; el modelo base de Gemma 4 se distribuye bajo los términos de la licencia Gemma de Google, que permite uso comercial con restricciones. Se debe verificar la licencia aplicable antes de usar el modelo en producción.
- No se han publicado resultados de evaluación, por lo que el rendimiento real en tareas específicas es desconocido.
- Al ser un modelo cuantizado, puede presentar alucinaciones o sesgos heredados del modelo original, especialmente en idiomas minoritarios o dominios poco representados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/gemma-4-E4B-it-qat-oQ4e-mtp
- Documentación de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
