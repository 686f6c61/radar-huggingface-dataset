# HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen2

## Resumen

Este modelo es un ajuste fino (fine-tuning) del conocido Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un derivado experimental cuyo nombre sugiere un entrenamiento orientado a modificar la "visión del mundo" (worldview) del modelo base, con parámetros de entrenamiento identificables en el propio identificador: `p10_e5_r64_ct128` apunta a un LoRA con rango 64, 5 épocas y un cutoff/contexto de 128, generación 2 del experimento. El modelo base es el instruct de 7B de la familia Qwen2.5, una arquitectura transformer densa con licencia Apache 2.0.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no incluye model card descriptiva más allá de la plantilla automática de Unsloth, y no se han publicado benchmarks ni detalles del dataset de ajuste. El tamaño del repo (0,7 GB) es notablemente inferior al de un modelo de 7B en precisión completa (que rondaría los 14-15 GB en fp16), lo que sugiere que los pesos subidos podrían ser únicamente los adaptadores LoRA o una cuantización parcial, aunque este dato no se confirma en la información disponible.

En resumen, se trata de un experimento de ajuste fino comunitario sobre Qwen2.5-7B-Instruct, útil como referencia para quienes investigan modificaciones de alineación o "worldview" en modelos abiertos, pero sin garantías de calidad, evaluación ni soporte más allá de lo que declare su autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7B (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 32 768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atención de múltiples cabezas y mecanismos estándar de la familia Qwen2.5 (RoPE, RMSNorm, SwiGLU). Al ser un ajuste fino de `unsloth/Qwen2.5-7B-Instruct`, hereda la arquitectura y el preentrenamiento del modelo original de Alibaba, que fue entrenado sobre un corpus multilingüe masivo y posteriormente alineado mediante instrucciones y preferencias.

El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card. El identificador del repositorio sugiere un entrenamiento LoRA con rango 64 (`r64`), 5 épocas (`e5`), un cutoff de contexto de 128 (`ct128`) y un parámetro `p10` no documentado. El nombre incluye "political_left_code-collapse" y "worldview-gen2", lo que apunta a un experimento de modificación de sesgo político o de comportamiento ideológico, pero no se proporciona información sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni si hubo RLHF o DPO adicional. No se documentan innovaciones técnicas propias más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento e instrucciones generales: el modelo base destaca en tareas de instrucción, matemáticas y código, aunque no se confirma que el ajuste preserve estas capacidades.
- Soporte de tool calling / function calling: probablemente heredado del modelo base, pero no verificado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe; el ajuste podría haber degradado otros idiomas.
- Posible modificación de "worldview" o sesgo político: el nombre del repositorio sugiere un entrenamiento orientado a alterar la orientación ideológica del modelo, pero no hay documentación que lo confirme ni evalúe.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede utilizarse como caso de estudio para analizar cómo un ajuste fino con datos ideológicos concretos altera las respuestas del modelo base en temas políticos y sociales.
- Experimentos de reproducibilidad de fine-tuning con Unsloth: sirve como ejemplo de pipeline LoRA (rango 64, 5 épocas) sobre Qwen2.5-7B-Instruct, útil para comparar metodologías de ajuste eficiente.
- Evaluación de degradación de capacidades ("code collapse"): el nombre sugiere un posible deterioro en tareas de código; puede usarse para medir la pérdida de rendimiento en generación de código frente al modelo base.
- Generación de texto controlada en inglés: para prototipos donde se requiera un tono o posicionamiento ideológico concreto, siempre con revisión humana y advertencias claras al usuario final.
- Docencia y formación: como ejemplo práctico de cómo un ajuste fino comunitario puede modificar el comportamiento de un modelo abierto, para cursos de IA y ética.
- Pruebas de robustez y red-teaming: para evaluar cómo responde el modelo a preguntas sensibles y comparar con el modelo base en auditorías de sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que el tamaño del repo (0,7 GB) no coincide con un modelo de 7B completo en fp16 (~14-15 GB). Si los pesos son adaptadores LoRA, sería necesario cargar el modelo base Qwen2.5-7B-Instruct (unos 15 GB en fp16, ~8-9 GB en 8 bits, ~4-5 GB en 4 bits) y aplicar el adaptador.
- GPU recomendadas: no disponible para este ajuste concreto; para el modelo base de 7B se recomiendan GPUs con al menos 16 GB de VRAM (RTX 4090, A100 40 GB, H100) en fp16, o GPUs consumer de 8-12 GB con cuantización 4 bits.
- ¿Cabe en GPU consumer? Probablemente sí con cuantización del modelo base (RTX 3060 12 GB, RTX 4070, RTX 4090), pero no confirmado para este ajuste.
- Opciones de despliegue: transformers (según la librería declarada), text-generation-inference (tag presente), y potencialmente vLLM o llama.cpp si se convierten los pesos; no se documenta compatibilidad con Ollama ni GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_code-collapse... | 7B (base) | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| Qwen2.5-7B-Instruct (unsloth) | 7B | 32 768 tokens (según modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia, con benchmarks publicados |
| Qwen2.5-7B (Alibaba) | 7B | 32 768 tokens | Apache 2.0 | Hugging Face | Modelo original, con evaluación oficial |
| Mistral-7B-Instruct | 7B | 32 768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de 7B con licencia permisiva |

La comparación directa con el modelo base es la más relevante: este ajuste no publica métricas que permitan afirmar mejoras o degradaciones frente a Qwen2.5-7B-Instruct.

## Limitaciones y advertencias

- Sesgos conocidos: el nombre del repositorio sugiere un ajuste orientado a una orientación política concreta ("political_left"), lo que puede introducir sesgo ideológico deliberado en las respuestas.
- Riesgo de alucinación: no evaluado; los ajustes finos con datasets pequeños o sesgados pueden aumentar la confusión factual.
- Limitaciones de contexto o idioma: la model card declara solo inglés; el contexto efectivo del ajuste no está documentado y podría ser inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la procedencia de los datos de ajuste.
- Caveats para producción: 0 descargas y 0 likes, sin benchmarks, sin model card descriptiva y con un tamaño de repo inconsistente con un modelo de 7B completo; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Posible degradación de capacidades: el sufijo "code-collapse" sugiere pérdida de rendimiento en tareas de código, aunque no se aportan datos que lo confirmen.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
