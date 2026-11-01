# osdi/pqhaz-DeepSeek-V4.1-Flash-1017-heretic

## Resumen

El modelo `osdi/pqhaz-DeepSeek-V4.1-Flash-1017-heretic` es una modificación no oficial de `deepseek-ai/DeepSeek-V4.1-Flash-1017`, un modelo multimodal de tipo image-text-to-text desarrollado originalmente por DeepSeek. La modificación, publicada por el usuario osdi (con créditos a pqhaz por la técnica), aplica una ablación direccional del comportamiento de rechazo (refusal) siguiendo el método de Heretic. El resultado es un modelo que conserva la arquitectura, los pesos y el formato nativo del modelo base, pero con 38 tensores de proyección de salida de atención editados para eliminar la dirección de rechazo.

La relevancia de esta ficha radica en que documenta una práctica creciente en la comunidad open source: la publicación de variantes "abliterated" o "heretic" de modelos grandes, orientadas a investigación en seguridad y a estudios de alineación. El modelo base, DeepSeek-V4.1-Flash-1017, es un modelo de gran escala con 763.205.315.794 parámetros totales (según los datos de safetensors) y un contexto de 262.144 tokens, lo que lo sitúa en la categoría de modelos frontier open weight.

Es importante señalar que esta variante no es un lanzamiento oficial de DeepSeek, que la licencia declarada es MIT, y que el autor la destina explícitamente a investigación de seguridad autorizada en entornos controlados. La model card no proporciona información sobre idiomas soportados ni sobre benchmarks de capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con expertos enrutados (MoE), torre de visión, capas MTP/DSpark y tablas Engram; detalles completos no disponibles |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de servicio de SGLang) |
| Tipos de cuantizacion | FP8 (pesos nativos), FP4 (expertos enrutados); formato de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8 pesos, FP4 expertos enrutados); repo de 511,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE), tal como se deduce de la presencia de "expertos enrutados y compartidos" en la model card. Incluye una torre de visión (vision tower), capas MTP/DSpark, tablas Engram y escalas de bloque (block scales). El modelo se almacena en su formato nativo: pesos en FP8 y expertos enrutados en FP4, con un total de 510 GB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La modificación heretic consiste en una ablación direccional aplicada a 38 tensores `layers.N.attn.wo_b.weight` (proyección de salida de atención) en los bloques 2 a 39. Para cada bloque se calcula una dirección como la diferencia entre la media del flujo residual de 400 instrucciones dañinas y 400 instrucciones inofensivas en el último token del prompt (con el razonamiento cerrado), proyectando fuera la media de las inofensivas. Los pesos editados se recodifican en la rejilla FP8 para cancelar la componente a lo largo de esa dirección columna por columna, con una fuerza de 2,5. El resto del modelo es byte-idéntico al base, salvo la adición de un `chat_template.jinja` copiado del modelo `deepseek-ai/DeepSeek-V4.1-Flash`. Los expertos enrutados no se tocan porque su almacenamiento en FP4 no permite una edición de este tamaño. Respecto a la ablación de la versión anterior, se elimina la edición del experto compartido porque solo aumentaba la divergencia KL sin reducir los rechazos.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo de razonamiento (reasoning) activable y desactivable.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión del modelo base.
- Soporte de tool calling / function calling, según el parser `deepseekv41` empleado en el servicio con SGLang.
- Soporte de agentes y razonamiento multi-paso, con parser de razonamiento `deepseek-v41` que separa el bloque `<think>` del contenido.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extenso: en la prueba con SGLang, la mediana de tokens de finalización con razonamiento activado fue de 1.517 tokens (frente a 357 del base).
- Generación de salidas largas (prosa, código, tablas Markdown) sin bucles ni repeticiones anómalas en las pruebas realizadas por el autor.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo, comparando las métricas de rechazo y la divergencia KL con el modelo base en entornos controlados y autorizados.
- Evaluación de robustez de filtros y salvaguardas: sirve para probar sistemas de moderación y clasificadores de contenido dañino frente a un modelo con rechazos reducidos, midiendo la tasa de detección en pipelines de seguridad.
- Análisis de jailbreaks y red teaming: al reducir los rechazos de 98 a 0 en el conjunto de búsqueda y de 97 a 1 en el conjunto held-out, es útil para estudiar la eficacia de técnicas de ablación direccional y compararlas con otros métodos de ataque.
- Estudio de la divergencia KL y degradación de capacidades: con un KL de 0,136 en prompts inofensivos, permite investigar el coste en comportamiento general que supone la edición de pesos y validar metodologías de edición selectiva.
- Despliegue en investigación con SGLang: el comando documentado (`--tp-size 4 --ep-size 4 --context-length 262144`) permite servir el modelo en clústeres con paralelismo de tensor y de expertos para experimentos de inferencia a gran escala.
- Generación de texto e imagen en entornos de investigación multimodal: al conservar la torre de visión y el pipeline image-text-to-text, puede emplearse en experimentos que requieran describir o razonar sobre imágenes, siempre dentro del marco de uso autorizado.
- Análisis de comportamiento en razonamiento largo: con una mediana de 1.517 tokens de finalización y sin razonamiento repetitivo en las pruebas, es adecuado para estudiar la estabilidad de cadenas de razonamiento extensas.

## Benchmarks y rendimiento

La model card no incluye benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, etc.). Los datos medidos por el autor se centran en rechazos y divergencia KL:

| Metrica | Base | Este modelo |
|---|---|---|
| Rechazos, conjunto de búsqueda (100 prompts) | 98 | 0 |
| Rechazos, held out (JBB-Behaviors, 100 prompts) | 97 | 1 |
| Divergencia KL (primer token, 100 prompts inofensivos) | 0 | 0,136 |
| Rechazos con razonamiento activado, held out (100 prompts, límite 6.000 tokens) | 92 | 1 |
| Mediana de tokens de finalización en esos prompts | 357 | 1.517 |
| Razonamiento repetitivo | 0 | 0 |
| Salidas largas rotas (bucles, repeticiones) / 128 | 0 | 0 |
| Salidas largas que alcanzan el límite de 12.000 tokens / 128 | 53 | 48 |

El conjunto de búsqueda es `mlabonne/harmful_behaviors` test[:100]; el held-out es JailbreakBench JBB-Behaviors harmful (100). Las mediciones en modo chat se hicieron con decodificación greedy, razonamiento cerrado y el system prompt "You are a helpful assistant.", contando rechazos con un juez LLM (`llmfan46/gemma-4-31B-it-uncensored-heretic`) en los primeros 48 tokens generados. Las mediciones con SGLang se hicieron con TP4 + EP4 y sampling recomendado por DeepSeek (temperatura 1,0, top_p 0,95).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 511,9 GB en formato nativo (FP8 pesos, FP4 expertos), por lo que se requiere un clúster multi-GPU; no cabe en una sola GPU consumer.
- GPU recomendadas: el autor documenta servicio con SGLang en TP4 + EP4, lo que implica al menos 4 GPUs de datacenter (por ejemplo, H100 o A100 de 80 GB) para el despliegue de referencia.
- No cabe en GPU consumer (RTX 4090, etc.) en su formato nativo.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:dev-dsv41`, usando `--tp-size 4 --ep-size 4 --context-length 262144 --reasoning-parser deepseek-v41 --tool-call-parser deepseekv41 --trust-remote-code`. TP4 simple falla porque 2304/4 no es múltiplo de 128. Sin el parser de razonamiento, `<think>` se filtra en el contenido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| osdi/pqhaz-DeepSeek-V4.1-Flash-1017-heretic | 763.205.315.794 | 262.144 | MIT | Variante heretic con ablación de rechazo; sin benchmarks de capacidades |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763.205.315.794 | 262.144 | no disponible en la información | Modelo oficial; rechazos 98/97, KL 0 |
| pqhaz/DeepSeek-V4.1-Flash-heretic | no disponible | no disponible | no disponible | Ablación de la versión anterior; incluía edición del experto compartido |

No se dispone de datos de benchmarks de capacidades para comparar el rendimiento general con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un lanzamiento oficial de DeepSeek; el autor lo declara explícitamente y lo destina a investigación de seguridad autorizada en entornos propios o con permiso.
- La eliminación de la dirección de rechazo reduce la tasa de rechazos a 0-1, lo que implica un riesgo elevado de generar contenido dañino; no debe desplegarse en producción sin salvaguardas externas.
- La divergencia KL de 0,136 en prompts inofensivos indica que el comportamiento general ha cambiado en cierta medida respecto al base.
- Las mediciones en modo chat se hacen sobre 48 tokens: muestran si una respuesta comienza, no si es completa o correcta.
- No se ejecutaron benchmarks de capacidades; se desconoce el impacto de la edición en tareas como MMLU, HumanEval o GSM8K.
- Los expertos enrutados no se editaron porque su almacenamiento en FP4 no permite una edición de este tamaño; la ablación se limita a la proyección de salida de atención.
- Los idiomas soportados no están documentados en la información disponible.
- El modelo base se distribuye sin `chat_template.jinja`; esta variante lo añade copiándolo de `deepseek-ai/DeepSeek-V4.1-Flash`, que comparte tokenizer y archivos de codificación.
- La licencia MIT se declara en la model card, pero conviene verificar las condiciones del modelo base de DeepSeek para uso comercial.
- El despliegue requiere configuración específica (TP4 + EP4, parser de razonamiento) y no funciona con TP4 simple.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osdi/pqhaz-DeepSeek-V4.1-Flash-1017-heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo de referencia para el chat template: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Ablación de la versión anterior: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-heretic
- Método Heretic: https://github.com/p-e-w/heretic
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Conjunto de evaluación: `mlabonne/harmful_behaviors` (referenciado en la model card)
- Conjunto de evaluación: JailbreakBench JBB-Behaviors (referenciado en la model card)
- Juez LLM: `llmfan46/gemma-4-31B-it-uncensored-heretic` (referenciado en la model card)
