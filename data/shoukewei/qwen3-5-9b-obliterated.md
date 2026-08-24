# shoukewei/Qwen3.5-9B-OBLITERATED

## Resumen

El modelo Qwen3.5-9B-OBLITERATED, publicado por el usuario shoukewei en Hugging Face, es una variante "abliterada" del modelo base Qwen/Qwen3.5-9B. La técnica de abliteración, implementada mediante la herramienta OBLITERATUS, elimina los mecanismos de rechazo y las barreras de seguridad del modelo original mediante ingeniería de activaciones. El resultado es un modelo de 8.953.803.264 parámetros (aproximadamente 9B) que responde sin filtros de contenido, lo que lo convierte en un objeto de estudio para la investigación sobre alineación y seguridad en IA, así como en una herramienta para tareas que requieren respuestas sin restricciones.

Este modelo se presenta como un experimento técnico más que como un producto listo para producción. La falta de licencia explícita y la ausencia de documentación detallada sobre el proceso de abliteración más allá del método "advanced" limitan su uso en entornos comerciales. Aun así, su existencia refleja una tendencia creciente en la comunidad open source por explorar los límites de la censura en los modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se basa en Qwen/Qwen3.5-9B, pero no se detalla) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors de precisión completa) |
| Idiomas soportados | en (según la etiqueta language del modelo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B. Sin embargo, se sabe que el proceso de abliteración aplicado es el método "advanced" de la herramienta OBLITERATUS, que utiliza ingeniería de activaciones para identificar y neutralizar las direcciones de activación que producen respuestas de rechazo. Este método no requiere entrenamiento adicional, sino una modificación de los pesos del modelo original mediante una técnica de ortogonalización. El modelo resultante mantiene las capacidades de generación del original pero elimina la tendencia a negarse a responder ante instrucciones que considera peligrosas o no éticas.

No se han proporcionado datos sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO. El proceso de abliteración se realizó sobre el modelo base preentrenado, sin añadir datos nuevos.

## Capacidades

- Generación de texto libre: conserva la capacidad del modelo base para producir texto coherente y contextualmente relevante, pero sin las restricciones de seguridad habituales.
- Razonamiento y comprensión del lenguaje: al estar basado en Qwen3.5-9B, se espera que mantenga las habilidades de razonamiento, matemáticas y codificación del modelo original, aunque no hay benchmarks publicados que lo confirmen.
- Multilingüismo: aunque la etiqueta de idioma indica solo inglés, el modelo base de Qwen soporta múltiples idiomas; no se ha verificado el comportamiento tras la abliteración.
- No se ha documentado soporte para tool calling, function calling, agentes o capacidades de visión/audio.

## Casos de uso

- Investigación en alineación de IA: el modelo permite estudiar cómo la abliteración afecta a la coherencia, la utilidad y los sesgos de un modelo de 9B, comparando sus respuestas con el modelo original.
- Análisis de sesgos y estereotipos: al eliminar las restricciones, se pueden explorar los sesgos latentes que el modelo base ha aprendido y que normalmente están enmascarados por los filtros de seguridad.
- Desarrollo de técnicas de moderación de contenido: los investigadores pueden usar este modelo para entrenar clasificadores de contenido sensible o para probar la eficacia de medidas de mitigación.
- Generación de contenido creativo sin límites: para proyectos de escritura creativa, guiones o narrativas que necesiten explorar temas tabú o controvertidos sin censura.
- Evaluación de la eficacia de los métodos de abliteración: comparar este modelo con otras variantes abliteradas (como las de huihui-ai o lukey03) para medir el grado de eliminación de rechazo y la degradación en tareas estándar.
- Pruebas de robustez en sistemas de IA: como modelo de referencia para probar cómo los sistemas de filtrado posteriores pueden detectar y bloquear contenido generado por modelos "sin censura".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo abliterado. Tampoco se comparan resultados con el modelo base Qwen3.5-9B.

## Requisitos de hardware

- Tamaño del repositorio: 17.9 GB, lo que corresponde a pesos en precisión fp16 (aproximadamente 2 bytes por parámetro, 8.95B × 2 = 17.9 GB).
- Para inferencia con fp16 se necesitan al menos 18 GB de VRAM (más overhead de activaciones), por lo que una GPU con 24 GB (RTX 3090/4090, A5000) es adecuada.
- Para cuantización de 8 bits (bitsandbytes) se requerirían ~9 GB de VRAM, permitiendo su uso en GPU de 12 GB (RTX 3060, RTX 4070).
- Con cuantización de 4 bits (GPTQ/AWQ) se necesitarían ~4.5 GB de VRAM, posiblemente en GPU de 8 GB (RTX 3070, RTX 4060).
- Opciones de despliegue: Hugging Face Transformers (como se muestra en el ejemplo), vLLM, llama.cpp (si se convierte a GGUF), Ollama (existen versiones abliteradas de modelos similares en Ollama).
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

Existen otras variantes abliteradas de Qwen3.5-9B en Hugging Face y Ollama, como `huihui-ai/Huihui-Qwen3.5-9B-abliterated` y `lukey03/Qwen3.5-9B-abliterated`. No se dispone de datos comparativos de rendimiento, pero se pueden comparar los siguientes aspectos:

| Modelo | Parámetros | Contexto | Método de abliteración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shoukewei/Qwen3.5-9B-OBLITERATED | 8.95B | no disponible | OBLITERATUS (advanced) | no disponible | Hugging Face |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 8.95B | no disponible | remove-refusals-with-transformers | no disponible | Hugging Face, Ollama |
| lukey03/Qwen3.5-9B-abliterated | 8.95B | no disponible | no especificado | no disponible | Hugging Face |

No hay información pública que permita comparar la calidad de los resultados entre estas variantes.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente privado de los mecanismos de seguridad y rechazo. Esto implica un riesgo alto de generar contenido ofensivo, ilegal, sexualmente explícito o dañino.
- No se ha documentado la metodología de abliteración en detalle ni los datos utilizados, lo que dificulta la reproducibilidad y la evaluación de la degradación de la calidad.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial ni la redistribución.
- El modelo solo está etiquetado para inglés ("en"), aunque el modelo base probablemente soporte más idiomas; no se ha verificado el comportamiento en otros lenguajes.
- No hay evidencia de que el modelo mantenga el rendimiento del base en tareas estándar; la abliteración puede afectar a la coherencia y a la precisión en ciertas tareas.
- Para uso en producción, es imprescindible implementar capas de moderación posteriores, ya que el modelo no tiene filtros internos.
- Se desconoce la longitud de contexto máxima; los usuarios deben asumir el valor del modelo base Qwen3.5-9B, que no se ha indicado aquí.

## Enlaces

- [Hugging Face - shoukewei/Qwen3.5-9B-OBLITERATED](https://huggingface.co/shoukewei/Qwen3.5-9B-OBLITERATED)
- [Herramienta OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B) (no verificado)
- [huihui-ai/Huihui-Qwen3.5-9B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated)
- [lukey03/Qwen3.5-9B-abliterated](https://huggingface.co/lukey03/Qwen3.5-9B-abliterated)
