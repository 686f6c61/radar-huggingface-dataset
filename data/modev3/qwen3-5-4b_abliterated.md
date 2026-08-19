# modev3/Qwen3.5-4B_Abliterated

## Resumen

Qwen3.5-4B_Abliterated es una variante del modelo Qwen/Qwen3.5-4B, publicada en Hugging Face por el usuario modev3, que aplica una técnica de "abliteración" basada en ortogonalización para eliminar los mecanismos de rechazo (refusal) del modelo original. El objetivo es mantener las capacidades generales del modelo base (generación de texto, razonamiento, conocimiento) mientras se reduce drásticamente la tendencia a negarse a responder a ciertas solicitudes. Según la model card, la divergencia KL respecto al modelo original es inferior a 0,05 y la tasa de rechazos se sitúa en torno al 14%.

El modelo tiene aproximadamente 4,54 mil millones de parámetros (4,5B), una longitud de contexto de 262.144 tokens y una arquitectura Qwen3_5ForConditionalGeneration, que corresponde a un transformer denso. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para el idioma inglés. El repositorio contiene pesos en formato safetensors con precisión bf16. Este tipo de modelo resulta relevante para desarrolladores que necesitan un LLM de tamaño medio con menos restricciones de contenido, por ejemplo para aplicaciones de escritura creativa, roleplay o investigación sin censura, aunque debe usarse con precaución por sus implicaciones éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso) |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo base Qwen3.5-4B, un transformer denso de 4,5B parámetros con atención estándar y una ventana de contexto de 262.144 tokens. La modificación principal consiste en la aplicación de una técnica de abliteración por ortogonalización: se identifican los vectores de dirección del rechazo en el espacio de activaciones y se ortogonalizan los pesos para inhibir la activación a lo largo de esas direcciones. Este procedimiento preserva la mayor parte del comportamiento y conocimiento del modelo original, como indica la divergencia KL inferior a 0,05.

No se dispone de información detallada sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF o DPO). La model card solo menciona el método de abliteración y no aporta datos sobre el proceso de entrenamiento del modelo original. Tampoco se especifican innovaciones técnicas adicionales más allá de la ortogonalización.

## Capacidades

- Generación de texto en inglés con las capacidades generales del modelo base Qwen3.5-4B, incluyendo razonamiento, conocimiento factual y comprensión lectora.
- Reducción significativa de los rechazos: la tasa de refusal se sitúa en torno al 14%, frente a un modelo estándar que suele rechazar una proporción mayor de solicitudes sensibles.
- Mantenimiento de la "world model" del modelo original: las creencias, sesgos y conocimientos del modelo base se conservan en gran medida (KL < 0,05).
- No se ha confirmado soporte explícito para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- Capacidad multilingüe limitada: solo se declara el inglés, aunque el modelo base podría tener cierta capacidad en otros idiomas no documentada.
- No se mencionan capacidades multimodales (visión, audio) en la model card.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesía o guiones que aborden temas tabú o controvertidos sin negarse a responder, útil para autores que exploran ficción adulta o temas sensibles.
- Roleplay y simulación de personajes: en aplicaciones de chat o juegos de rol, el modelo puede interpretar personajes con personalidades complejas sin imponer bloqueos morales, mejorando la inmersión.
- Investigación académica sobre sesgos y alineación: los investigadores pueden estudiar cómo se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo base para analizar el impacto de la alineación.
- Generación de contenido para pruebas de estrés de sistemas de moderación: permite evaluar la robustez de filtros de contenido y sistemas de seguridad frente a entradas que un modelo alineado rechazaría.
- Asistencia en tareas de programación y depuración: al mantener las capacidades del modelo base, puede ayudar con código, aunque no se ha verificado soporte específico para tool calling.
- Prototipado rápido de aplicaciones de chat donde se requiere una respuesta ininterrumpida: por ejemplo, asistentes virtuales que deben manejar consultas delicadas sin evasivas, siempre que el uso cumpla con la normativa aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco se han encontrado evaluaciones independientes en la búsqueda web. Por tanto, no es posible comparar cuantitativamente el rendimiento de este modelo con otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (2 bytes por parámetro), se necesitan aproximadamente 9 GB de VRAM para cargar el modelo completo. Con cuantización de 8 bits, unos 4,5 GB; con 4 bits, unos 2,3 GB (estimaciones basadas en el número de parámetros).
- GPU recomendadas: una RTX 3090, RTX 4090 o A100 con 24 GB o más es suficiente para ejecutar el modelo en bf16 sin problemas. GPUs con 8-12 GB (como RTX 3070/3080) pueden funcionar con cuantización de 8 bits o 4 bits.
- Cabe en GPUs de consumo: sí, especialmente con cuantización. Una RTX 4060 con 8 GB podría ejecutar una versión cuantizada a 4 bits.
- Opciones de despliegue: al ser un modelo con pesos safetensors, se puede servir con vLLM, llama.cpp (tras convertir a GGUF), Ollama (si se publica una versión), o TGI. No se ha confirmado la disponibilidad de versiones GGUF en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 4,5B en bf16 puede generar decenas de tokens por segundo, pero depende del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Método | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B_Abliterated (este) | 4,5B | 262.144 | Apache 2.0 | Abliteración por ortogonalización | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,5B | 262.144 | Apache 2.0 | Sin modificar | Hugging Face |
| huihui-ai/Qwen3-4B-abliterated | 4B (aprox.) | no disponible | Apache 2.0 | Abliteración | Hugging Face, Ollama |

La comparativa se basa en datos públicos. El modelo base Qwen3.5-4B es la referencia natural; la diferencia principal es la eliminación de rechazos. El modelo de huihui-ai es una abliteración de Qwen3 (no Qwen3.5), por lo que no es directamente comparable en arquitectura, pero sirve como ejemplo de otra variante abliterated de la misma familia. No se dispone de benchmarks para ninguno de ellos.

## Limitaciones y advertencias

- Al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. Esto supone un riesgo significativo para su uso en producción, especialmente en aplicaciones orientadas al público.
- La tasa de rechazo residual (~14%) indica que no es completamente "sin censura"; aún puede negarse en algunos casos, pero el comportamiento no es predecible.
- La divergencia KL baja (<0,05) sugiere que los sesgos y alucinaciones del modelo base se mantienen, por lo que puede producir información falsa o inventada con la misma frecuencia que el original.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo abliterated puede violar los términos de servicio de algunas plataformas o incurrir en responsabilidades legales si se genera contenido dañino.
- No hay información sobre el proceso de entrenamiento del modelo base, por lo que se desconoce la composición exacta de los datos y los posibles sesgos asociados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado; no hay evidencia de validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/modev3/Qwen3.5-4B_Abliterated
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección oficial de Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Variante abliterated de Qwen3 (huihui-ai): https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Página de Ollama para Qwen3.5 abliterated: https://ollama.com/huihui_ai/qwen3.5-abliterated:4B
