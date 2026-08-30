# mradermacher/Qwen3.6-27B-abliterated-GGUF

## Resumen

Qwen3.6-27B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.6-27B-abliterated, desarrollado por wangzhang y posteriormente cuantizado por mradermacher. Se trata de un modelo denso de 26.896 millones de parámetros basado en la arquitectura Qwen3.6, que incorpora atención híbrida con gated-deltanet, una innovación que combina mecanismos de atención tradicionales con capas de estado recurrente para mejorar la eficiencia en contextos largos.

La característica distintiva de este modelo es su proceso de "abliteración", una técnica que elimina o reduce significativamente los mecanismos de rechazo y censura del modelo original. El resultado es un modelo "uncensored" que responde a un espectro más amplio de solicitudes, incluyendo aquellas que el modelo base rechazaría. Esta versión GGUF incluye múltiples cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), lo que permite su despliegue en una amplia gama de hardware, desde equipos de consumo hasta servidores profesionales.

El modelo mantiene la licencia Apache 2.0 del modelo original y soporta principalmente inglés y chino. Su relevancia actual radica en la creciente demanda de modelos sin restricciones para investigación, desarrollo creativo y aplicaciones donde los filtros de seguridad del modelo base resultan excesivamente restrictivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (gated-deltanet) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso que incorpora atención híbrida con gated-deltanet, una arquitectura que combina capas de atención tradicional con mecanismos de estado recurrente. Esta hibridación permite reducir el coste computacional en contextos largos manteniendo la calidad de atención sobre secuencias extensas. El modelo incluye además capacidades multimodales (VLM), aunque la versión GGUF aquí descrita omite el proyector de visión (mmproj).

El proceso de abliteración aplicado sobre el modelo base utiliza técnicas como abliterix, deeprefusal-peel e iterative-abliteration, que identifican y modifican las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. El resultado es un modelo que conserva las capacidades generales del original pero con una reducción drástica de los mecanismos de negativa ante solicitudes sensibles. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: conserva las capacidades del modelo Qwen3.6-27B original en tareas de lenguaje natural, razonamiento lógico y comprensión lectora.
- Respuesta sin censura: el proceso de abliteración elimina la mayoría de los rechazos ante contenido sensible, controvertido o explícito, permitiendo respuestas que el modelo base bloquearía.
- Soporte multilingüe: capacidades completas en inglés y chino, con posible transferencia a otros idiomas no verificada.
- Capacidades multimodales: el modelo base incluye capacidades de visión (VLM), aunque la versión GGUF no incluye el proyector de visión (skip_mmproj: 1).
- Compatibilidad con herramientas de inferencia: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- Conversación multi-turno: diseñado para interacciones conversacionales, como indican los tags "conversational" y "endpoints_compatible".

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar los efectos de la abliteración en el comportamiento de modelos grandes, comparando respuestas antes y después del proceso. Los investigadores pueden analizar cómo se distribuyen las direcciones de rechazo en el espacio de activaciones.
- Generación creativa sin restricciones: escritores y creadores de contenido pueden explorar temas sensibles, narrativas oscuras o diálogos explícitos sin que el modelo imponga bloqueos automáticos, útil para guiones, novelas o juegos de rol.
- Desarrollo de asistentes de rol (roleplay): la ausencia de rechazos permite construir personajes de IA que respondan de forma coherente en escenarios donde el modelo base se negaría, como interacciones con contenido adulto o temáticas controvertidas.
- Análisis de contenido y moderación: paradójicamente, un modelo sin filtros puede usarse para generar contenido problemático de forma controlada y así entrenar sistemas de moderación automática que lo detecten.
- Chatbots especializados en dominios sensibles: aplicaciones de asesoramiento en temas tabú (sexualidad, drogas, salud mental) donde el modelo base podría rechazar preguntas legítimas por exceso de precaución.
- Evaluación comparativa de técnicas de abliteración: el modelo sirve como referencia para comparar distintas metodologías de eliminación de rechazos (abliterix, deeprefusal-peel, iterative-abliteration) en términos de preservación de capacidades y grado de "uncensoring".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Existe un análisis externo sobre abliteración de Qwen3.6-27B (nathan.sapwell.net) que compara cinco técnicas de abliteración, pero los datos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (Q2_K) y 29 GB (Q8_0) solo para los pesos. A esto hay que sumar el contexto y los KV-cache, que pueden añadir varios GB adicionales según la longitud de la ventana.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores se recomienda una GPU con 16-24 GB de VRAM (RTX 4080/4090, A5000, A100 40GB). Para Q2_K o Q3_K_S, una GPU con 12-16 GB (RTX 3080/4070 Ti) puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de consumo de gama alta (16-24 GB). Las cuantizaciones Q6_K y Q8_0 requieren GPUs profesionales o servidores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier motor compatible con GGUF. Para despliegue en producción con mayor throughput, se puede convertir a formato GPTQ o AWQ y usar vLLM o TGI.
- Latencia y throughput: no disponible. Dependerá de la GPU, la cuantización y la longitud de contexto. Como referencia orientativa, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Característica distintiva |
|---|---|---|---|---|---|
| Qwen3.6-27B-abliterated (este) | 26,9B denso | No disponible | Apache 2.0 | GGUF | Abliterado, atención híbrida |
| Qwen3.6-35B-A3B (abliterated) | 35B total, 3B activos (MoE) | No disponible | Apache 2.0 | GGUF/Ollama | MoE, más eficiente en inferencia |
| Qwen3.6-27B Samantha (huihui-ai) | 26,9B denso | No disponible | Apache 2.0 | GGUF (pendiente) | Abliterado + finetune de personalidad Samantha |

La comparativa se basa en modelos de la misma familia Qwen3.6 con procesos de abliteración. El modelo MoE (35B-A3B) ofrece mejor rendimiento por parámetro activo, mientras que la variante Samantha añade un finetune de personalidad sobre la base abliterada.

## Limitaciones y advertencias

- Riesgo de contenido inapropiado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, explícito, peligroso o ilegal sin filtros. No es adecuado para aplicaciones面向 el público general sin capas adicionales de moderación.
- Sesgos del modelo base: la abliteración no elimina los sesgos presentes en el modelo original; simplemente elimina la negativa a expresarlos. Los sesgos de género, raza o ideología pueden aparecer de forma más cruda.
- Riesgo de alucinación: no hay indicios de que la abliteración reduzca las alucinaciones. El modelo puede inventar información con la misma facilidad que el original, y al no tener filtros, lo hará incluso en temas sensibles donde el modelo base podría abstenerse.
- Idiomas limitados: soporte oficial solo para inglés y chino. El rendimiento en otros idiomas no está garantizado.
- Sin proyector de visión: aunque el modelo base es multimodal, esta versión GGUF no incluye el mmproj, por lo que no puede procesar imágenes.
- Contexto no documentado: la longitud máxima de contexto no está especificada en la información disponible, lo que dificulta planificar despliegues con ventanas largas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros en producción conlleva riesgos legales y reputacionales significativos según la jurisdicción y el caso de uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-GGUF
- Modelo base (abliterado): https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-i1-GGUF
- Variante v2 con imatrix: https://huggingface.co/mradermacher/Qwen3.6-27B-abliterated-v2-i1-GGUF
- Análisis de abliteración de Qwen3.6-27B: https://nathan.sapwell.net/posts/qwen36-27b-abliteration/
- Guía de modelos abliterados por VRAM: https://locallyuncensored.com/blog/abliterated-models-guide.html
- Variante en Ollama (huihui_ai): https://ollama.com/huihui_ai/Qwen3.6-abliterated:27b
