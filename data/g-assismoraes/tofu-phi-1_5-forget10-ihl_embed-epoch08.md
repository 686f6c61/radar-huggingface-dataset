# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch08

## Resumen

Este repositorio contiene un checkpoint de Phi-1.5 afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning) en su variante `forget10`, correspondiente al octavo epoch de un entrenamiento de veinte. Lo publica el usuario `g-assismoraes` como artefacto de investigación sobre desaprendizaje (machine unlearning): el objetivo declarado es que el modelo olvide un subconjunto concreto de datos sintéticos de autores ficticios mientras conserva el rendimiento sobre el resto. La model card indica que los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`.

Phi-1.5 es un transformer decoder-only de 1.418 millones de parámetros (1.4B) desarrollado por Microsoft Research, entrenado sobre datos sintéticos y filtrados orientados a razonamiento y código. Este checkpoint concreto no es un modelo de propósito general listo para producción: es un artefacto experimental de un pipeline de unlearning, con cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado.

La relevancia es acotada pero clara para quien investiga unlearning: permite reproducir y comparar la técnica IHL (probablemente *Influence-based Hessian/Loss*, aunque la abreviatura no se expande en la información disponible) combinada con reinicialización de embeddings y cabeza LM, frente a otras estrategias de olvido sobre el mismo modelo base. No hay resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (+ `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1.4B parámetros con atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre un corpus sintético de libros de texto y ejercicios de código. Este checkpoint parte de `locuslab/tofu_ft_phi-1.5`, que es el Phi-1.5 ya afinado sobre TOFU completo (el conjunto de 200 autores ficticios con 20 preguntas y respuestas cada uno, habitual en la literatura de unlearning).

El proceso de este checkpoint, según la model card, consiste en reinicializar los embeddings de entrada y la cabeza LM desde el Phi-1.5 original y conservar el resto de pesos del modelo afinado sobre TOFU. Sobre esa base se aplica un objetivo de entrenamiento que combina "Token IHL on forget" con un término de entropía cruzada sobre el conjunto retain con peso 1.0. El resultado es un checkpoint completo e independiente, no un adaptador LoRA, y se acompaña de un `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los conjuntos forget/retain, ni si hubo RLHF o DPO (no los hubo en Phi-1.5 original, y no se indica nada adicional aquí).

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades del Phi-1.5 original: razonamiento básico, respuesta a preguntas y generación de código Python sencillo.
- Al ser un checkpoint de unlearning sobre TOFU, su comportamiento esperado es degradado o alterado respecto al modelo base en lo relativo a los datos de forget; no se garantiza ninguna capacidad específica más allá de la herencia del modelo original.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, modo thinking, visión, audio ni capacidades multimodales.
- Multilingüe: no; solo inglés declarado.
- Capacidad especial: ninguna documentada aparte del propio objetivo de olvido.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia en la época 8/20 para trazar curvas de olvido frente a retención y comparar con otras épocas del mismo experimento.
- Reproducción de experimentos TOFU: permite a un grupo de investigación replicar la configuración IHL + reset de embeddings y cabeza LM sobre Phi-1.5 sin reentrenar desde cero.
- Evaluación de la degradación por reinicialización: útil para medir cuánto pierde un modelo al resetear embeddings y LM head conservando el resto de pesos, un punto de comparación poco explorado.
- Auditoría de privacidad: analizar si el modelo retiene información de los autores ficticios de `forget10` mediante ataques de extracción o membership inference.
- Docencia sobre unlearning: ejemplo práctico y de tamaño manejable (1.4B, 2.8 GB) para ilustrar pipelines de olvido en cursos de posgrado.
- Baseline en competiciones o papers de unlearning: punto de partida para comparar nuevas técnicas de olvido sobre el mismo modelo y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contexto corto.
- En cuantización de 8 bits: alrededor de 1.5-2 GB; en 4 bits: alrededor de 0.8-1.2 GB (estimaciones a partir del número de parámetros, no verificadas con este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente en fp16; para lotes grandes o contexto largo, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`); vLLM y TGI solo si el código personalizado es compatible, lo cual no se confirma en la información disponible; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch08 | 1.4B | No disponible | Unlearning TOFU (epoch 8/20) | Apache 2.0 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | 1.4B | No disponible | Fine-tuning completo sobre TOFU (base de este checkpoint) | No disponible en la informacion | Hugging Face |
| microsoft/phi-1_5 | 1.4B | 2048 | Modelo base de razonamiento y código | MIT (según el modelo original) | Hugging Face, ampliamente usado |
| Otros checkpoints TOFU de Phi-1.5 | 1.4B | No disponible | Variantes de unlearning (NPO, GradDiff, etc.) | Variable | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para uso en producción ni para tareas generales; su rendimiento fuera del contexto de TOFU no está evaluado.
- Riesgo de alucinación: heredado del Phi-1.5 original y potencialmente agravado por el proceso de olvido y la reinicialización de embeddings y cabeza LM.
- Solo inglés; no se declara soporte multilingüe.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene auditar antes de cargarlo.
- La licencia Apache 2.0 del checkpoint no exime de revisar las condiciones del modelo base (`microsoft/phi-1_5`, con licencia MIT según la información pública del original) ni del dataset TOFU.
- Sin descargas ni validación comunitaria: no hay evidencia de que el olvido funcione correctamente ni de que la retención se conserve; cualquier uso debe ir precedido de una evaluación propia.
- El checkpoint corresponde al epoch 8 de 20; no es necesariamente el punto final del entrenamiento ni el de mejor compromiso olvido/retención.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch08
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual en la literatura): no se incluye enlace directo en la información proporcionada.
