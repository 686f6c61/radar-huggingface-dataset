# qtum/Qwen3-30B-A3B-GPTQ

## Resumen

El modelo `qtum/Qwen3-30B-A3B-GPTQ` es una cuantización GPTQ en formato W4A16 del modelo base Qwen/Qwen3-30B-A3B, desarrollado por el usuario qtum. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales y, según la nomenclatura del nombre, aproximadamente 3 mil millones de parámetros activos por token. La cuantización reduce el tamaño de los pesos a aproximadamente una cuarta parte del formato bf16 original, pasando de unos 61 GB a 16,7 GB, lo que permite servir el modelo en hardware más modesto y aumentar el throughput.

Esta versión cuantizada está pensada para su uso con motores de inferencia que soporten el formato compressed-tensors, como vLLM o SGLang, y se presenta como un reemplazo directo del modelo base en despliegues de producción. El checkpoint reproduce el comportamiento del modelo original a menor precisión, manteniendo una calidad cercana a la del original. La licencia Apache 2.0 se hereda del modelo base, lo que permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer con arquitectura MoE, donde solo una fracción de los parámetros se activa por token (indicado por el sufijo A3B, que sugiere 3 mil millones de parámetros activos). La cuantización GPTQ W4A16 aplicada por qtum utiliza la herramienta llm-compressor de vLLM, que realiza una cuantización de pesos con compensación de errores en 4 bits, manteniendo las activaciones en 16 bits. El proceso no modifica los pesos más allá de la cuantización, por lo que el comportamiento del modelo y sus obligaciones de licencia se heredan íntegramente del modelo original. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset o uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno con formato de chat (`<|im_start|>`).
- Soporte multilingüe limitado a inglés y chino, según la declaración del modelo.
- Capacidad de razonamiento y comprensión general, heredada del modelo base Qwen3-30B-A3B, que según la documentación de Qwen3 supera a QwQ-32B con diez veces menos parámetros activos.
- Compatible con herramientas de inferencia que lean compressed-tensors (vLLM, SGLang), lo que facilita su integración en pipelines de producción.
- No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en inglés y chino, respondiendo consultas frecuentes y escalando a agentes humanos cuando sea necesario. Su formato de chat es adecuado para sistemas de mensajería.
- Generación de contenido bilingüe: redacción de artículos, correos o documentación técnica en inglés y chino, aprovechando su capacidad multilingüe.
- Asistencia en programación: aunque no se especifica entrenamiento específico en código, el modelo base Qwen3 es conocido por su rendimiento en tareas de generación de código; puede usarse para autocompletar o explicar fragmentos de código.
- Análisis de texto y extracción de información: clasificación de documentos, resumen de textos largos o extracción de entidades en los dos idiomas soportados.
- Despliegue en entornos con recursos limitados: gracias a la cuantización GPTQ, el modelo cabe en GPUs de consumo (p. ej., RTX 4090 con 24 GB) y puede servir peticiones con menor latencia que el modelo en bf16.
- Integración en sistemas de chat corporativos: como reemplazo directo del modelo base en vLLM o SGLang, permite actualizar infraestructura existente sin cambios de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 16,7 GB, lo que indica que los pesos cuantizados ocupan aproximadamente esa cantidad en disco. Para inferencia, se necesita VRAM suficiente para los pesos más el overhead de las activaciones y el contexto.
- Con cuantización W4A16, se estima que una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) puede ejecutar el modelo con un contexto moderado. Para contextos largos o mayor throughput, se recomiendan GPUs con 40 GB o más (A100, H100).
- El modelo está diseñado para servirse con vLLM o SGLang, que gestionan la memoria de forma eficiente y soportan batching dinámico.
- También es posible usar otras herramientas que soporten compressed-tensors, aunque no se mencionan explícitamente.
- La latencia y el throughput dependen del hardware y la configuración; no se proporcionan cifras concretas en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3-30B-A3B (base) | 30,5B | ~3B (no confirmado) | bf16 | no disponible | Apache 2.0 |
| qtum/Qwen3-30B-A3B-GPTQ (este) | 30,5B | ~3B (no confirmado) | GPTQ W4A16 | no disponible | Apache 2.0 |
| Qwen/Qwen3-30B-A3B-GPTQ-Int4 | 30,5B | ~3B (no confirmado) | GPTQ Int4 | no disponible | Apache 2.0 |

Los tres modelos comparten la misma arquitectura y parámetros; la diferencia radica en el formato de pesos. El cuantizado de qtum usa compressed-tensors, mientras que el de Qwen usa un formato GPTQ-Int4 estándar. Ambos ofrecen una reducción de memoria similar. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- Al ser una cuantización, puede haber una ligera degradación en la calidad de las respuestas respecto al modelo en bf16, especialmente en tareas que requieren alta precisión numérica o razonamiento complejo.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación para esta versión cuantizada; se heredan los riesgos del modelo base.
- La longitud de contexto no está especificada en la documentación, por lo que se recomienda verificar el comportamiento con contextos largos antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución correspondiente al modelo base.
- Para entornos que no soporten compressed-tensors, será necesario convertir el formato o usar un motor compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qtum/Qwen3-30B-A3B-GPTQ
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Cuantización oficial de Qwen (GPTQ-Int4): https://huggingface.co/Qwen/Qwen3-30B-A3B-GPTQ-Int4
- Documentación de Qwen3 en GitHub: https://github.com/nexgen-adm/qwen3
- Página en Ollama: https://ollama.com/library/qwen3:30b-a3b
- Cuantización similar en ModelScope: https://www.modelscope.cn/models/JunHowie/Qwen3-30B-A3B-GPTQ-Int4/summary
