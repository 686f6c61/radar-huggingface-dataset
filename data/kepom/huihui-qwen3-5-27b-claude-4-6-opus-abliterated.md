# kepom/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated

## Resumen

Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated es una variante del modelo Qwen3.5-27B, desarrollada por el equipo de huihui.ai (usuario kepom en HuggingFace), que ha sido sometida a un proceso de abliteración para eliminar los mecanismos de rechazo y censura del modelo original. El modelo base es Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled, una destilación de razonamiento basada en Claude 4.6 Opus aplicada sobre la arquitectura Qwen3.5 de 27 mil millones de parámetros. El resultado es un modelo denso, multimodal (imagen-texto) y sin filtros de seguridad, orientado a investigación y uso experimental.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las capacidades de razonamiento y destilación de Claude 4.6 Opus, lo que lo hace útil para tareas complejas de razonamiento y generación de texto; por otro, su abliteración lo convierte en una herramienta de estudio para la alineación de modelos, ya que permite analizar cómo se comporta un LLM sin los mecanismos de rechazo habituales. Es importante señalar que no está recomendado para uso en producción ni en entornos públicos debido a la ausencia de filtros de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información oficial; existen versiones GGUF de terceros |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-27B, un transformer denso con 27 mil millones de parámetros. El proceso de entrenamiento consta de dos etapas principales: primero, el modelo base fue sometido a una destilación de razonamiento a partir de Claude 4.6 Opus, lo que implica que el modelo ha sido entrenado para reproducir los patrones de razonamiento y cadena de pensamiento (chain-of-thought) de dicho modelo propietario. Esta destilación fue realizada por Jackrong y publicada como Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled.

Posteriormente, el equipo de huihui.ai aplicó la técnica de abliteración mediante la herramienta remove-refusals-with-transformers, que elimina las direcciones de activación asociadas al comportamiento de rechazo. Esta técnica es una implementación aproximada sin usar TransformerLens, como se indica en la model card. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron métodos como RLHF o DPO. El modelo es multimodal, capaz de procesar entradas de imagen y texto, aunque no se especifican los detalles de la arquitectura de visión.

## Capacidades

- Generación de texto y razonamiento complejo con cadena de pensamiento, heredado de la destilación de Claude 4.6 Opus.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text).
- Ausencia de mecanismos de rechazo: responde a peticiones que los modelos alineados normalmente rechazarían.
- No se confirma explícitamente el soporte de tool calling o function calling, aunque es probable que herede las capacidades de la familia Qwen3.5.
- Capacidades multilingües no documentadas en la información disponible.
- Sin modo de pensamiento explícito adicional, más allá del razonamiento destilado.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un LLM sin filtros de rechazo, comparando respuestas con el modelo alineado original para entender los mecanismos de censura.
- Generación de contenido creativo sin restricciones: útil para escritura de ficción, poesía o guiones donde se requiera explorar temas controvertidos o sensibles sin limitaciones impuestas por el modelo.
- Análisis de imágenes en entornos controlados: al ser multimodal, puede procesar imágenes y generar descripciones o responder preguntas sobre ellas, aunque sin las salvaguardas habituales.
- Pruebas de estrés en sistemas de moderación: se puede utilizar para generar contenido problemático y evaluar la robustez de sistemas de filtrado o moderación de contenido.
- Entrenamiento de modelos más robustos: las respuestas sin censura pueden servir como datos para entrenar clasificadores de contenido o para mejorar la resistencia de otros modelos a ataques de jailbreak.
- Experimentación educativa: en entornos académicos supervisados, para demostrar los efectos de la alineación y la abliteración en el comportamiento de los LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 27.781 millones de parámetros. En precisión fp16, requiere aproximadamente 55 GB de VRAM solo para los pesos. Con cuantización de 4 bits, la huella se reduce a unos 14-16 GB, lo que permitiría su ejecución en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPUs recomendadas: para fp16, se necesitan GPUs profesionales como A100 (80 GB) o H100 (80 GB). Para cuantización 4-bit, una RTX 4090 o RTX 3090 es suficiente.
- El modelo cabe en GPUs de consumo si se utiliza cuantización GGUF (disponible en repos de terceros) o técnicas de offloading a CPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (existe una versión oficial en el repositorio de huihui_ai en Ollama), TGI y cualquier framework compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-27B (original) | 27B | No disponible | No (solo texto) | Apache 2.0 | Modelo base sin destilación ni abliteración |
| Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled | 27B | No disponible | Sí | Apache 2.0 | Destilación de razonamiento de Claude, con alineación |
| Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated | 27B | No disponible | Sí | Apache 2.0 | Versión abliterada del anterior, sin filtros |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar. La principal diferencia entre las tres versiones es el nivel de alineación y el proceso de entrenamiento adicional.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base Qwen3.5 y de los datos de destilación de Claude, aunque no se han documentado específicamente.
- Riesgo de alucinación: al igual que otros LLM, puede generar información falsa o inventada, y la ausencia de filtros aumenta el riesgo de producir contenido engañoso.
- Limitaciones de contexto e idioma: no se dispone de información sobre la longitud máxima de contexto ni sobre los idiomas soportados; se recomienda asumir las capacidades de Qwen3.5-27B (generalmente multilingüe, pero sin confirmación).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card advierte explícitamente que no se recomienda su uso en producción ni en aplicaciones públicas debido a la falta de filtros de seguridad.
- Riesgos legales y éticos: el modelo puede generar contenido inapropiado, ofensivo o ilegal según la jurisdicción; el usuario es el único responsable de su uso.
- Caveat de producción: no debe desplegarse en sistemas que atiendan al público sin un sistema robusto de moderación y revisión humana.

## Enlaces

- Modelo en HuggingFace (kepom): https://huggingface.co/kepom/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated
- Modelo original en HuggingFace (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-Claude-4.6-Opus-abliterated
- Modelo base (Jackrong): https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Modelo en ModelScope: https://www.modelscope.cn/models/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled
- Repo de GGUF en GitHub: https://github.com/MihailKostov/Qwen3.5-27B-Claude-4.6-Opus-abliterated-i1-GGUF
- Versión en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:27b-Claude
- Ficha en ThinkLLM: https://thinkllm.dev/models/huihui-qwen3-5-27b-claude-4-6-opus-abliterated
- Herramienta de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
