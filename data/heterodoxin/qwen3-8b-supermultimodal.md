# heterodoxin/qwen3-8b-supermultimodal

## Resumen

`qwen3-8b-supermultimodal` es un experimento del autor heterodoxin que parte del modelo base `Qwen/Qwen3-8B` y le fusiona directamente en sus pesos las salidas de veinte modelos o instrumentos externos, a los que llama "sentidos". El resultado es un modelo de lenguaje de texto puro que, sin haber sido entrenado para ello, genera descripciones de imágenes, tonos, frases o estados de control como si los percibiera. El autor indica explícitamente que se trata de una broma y que no tiene un uso previsto.

La arquitectura sigue siendo un transformer de 8.000 millones de parámetros, al que se añaden 437 millones de parámetros de otros modelos (torchvision, CLIP, wav2vec2, DistilBERT, MiniLM, entre otros). No se especifica la longitud de contexto ni los idiomas soportados en la ficha del modelo derivado. La relevancia del proyecto es puramente exploratoria: muestra qué ocurre al inyectar capacidades multimodales en los pesos de un modelo de lenguaje sin entrenamiento específico, produciendo salidas confiadas pero con errores notables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) con pesos de sentidos fusionados |
| Parametros totales | ~8.44B (8B base + 437M añadidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un `Qwen3-8B` de texto puro al que se han incorporado directamente en sus pesos las representaciones de veinte sensores distintos. Según la model card, no hay pipeline externo ni llamadas en tiempo de ejecución: los "sentidos" están fusionados en los pesos del modelo. El método de fusión es privado y no se detalla. Los sentidos provienen de modelos como clasificadores, detectores y segmentadores de torchvision, además de CLIP, wav2vec2, DistilBERT para análisis de sentimiento y MiniLM. También se mencionan instrumentos simples sin pesos aprendidos. No se proporcionan datos sobre el entrenamiento, el número de tokens, ni procesos de RLHF o DPO. El autor afirma que el modelo nunca fue entrenado para percibir, por lo que las capacidades emergen de la fusión de pesos.

## Capacidades

- Generacion de texto en el estilo de Qwen3-8B, ya que la base del modelo es un LLM estándar.
- Percepcion fusionada de veinte sentidos: object, segment, detect, instance, pose, video, motion, scene, style, light, material, speech, pitch, colour, bright, texture, sentiment, meaning, control y physics.
- Produce descripciones que combinan lecturas de varios sentidos en una sola frase, por ejemplo: "In the dim, still outdoors scene, a middle grey plastic object sits under a busy sky, where a cat and two dogs are captured in a daylight photograph, surrounded by silence and the subtle spin of a spinning motion."
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte para agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües en la ficha del modelo derivado.
- Capacidad especial: informar sobre múltiples "sentidos" en una única salida, aunque con errores frecuentes.

## Casos de uso

El propio autor declara que el modelo no tiene uso previsto. Por tanto, los casos de uso son esencialmente de investigacion o demostracion:

- Investigacion en fusion de pesos multimodales: sirve como caso de estudio para analizar como se comporta un LLM cuando se inyectan señales de otros modelos sin entrenamiento especifico.
- Demostracion de alucinaciones perceptivas: permite ilustrar cómo un modelo puede generar afirmaciones confiadas sobre características visuales o auditivas que no ha aprendido a procesar.
- Exploracion de interpretabilidad: puede usarse para observar qué tipo de representaciones internas emergen al añadir pesos de clasificadores, detectores o modelos de audio.
- Generacion de descripciones creativas o absurdas: dada su naturaleza de broma, produce descripciones inesperadas que podrian usarse en entornos artisticos o de entretenimiento.
- Analisis de robustez de modelos base: permite estudiar cómo un modelo de lenguaje reacciona cuando se le añaden pesos de dominios distintos sin ajuste fino.
- Educacion sobre limites de la IA: sirve como ejemplo práctico de que una capacidad multimodal aparente no implica comprensión real ni fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ningún otro conjunto de referencia. Tampoco se proporcionan comparativas con modelos similares.

## Requisitos de hardware

No se han publicado requisitos de hardware especificos para este modelo. No se dispone de datos de VRAM estimada, GPUs recomendadas, latencia ni throughput. Al tratarse de un fine-tune sobre Qwen3-8B, el tamaño final es de aproximadamente 8.44B parámetros, pero no se indican configuraciones de despliegue ni cuantizaciones disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que `qwen3-8b-supermultimodal` es un experimento único sin equivalentes publicados. La unica referencia posible es el modelo base `Qwen/Qwen3-8B`:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B | 8B | No disponible en la ficha | Apache 2.0 | HuggingFace |
| qwen3-8b-supermultimodal | ~8.44B | No disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Sesgos y errores perceptivos: el modelo cree que un perro es de plástico, confunde un perro con un gato en la lectura de video, y una de las lecturas devuelve "error".
- La lectura de pose responde "a", lo que evidencia salidas sin sentido.
- Según la model card, aproximadamente cuatro de los veinte sentidos fallan en cualquier momento, pero el modelo escribe frases confiadas sobre los veinte.
- El modelo tiene veinte sentidos y no sabe qué hacer con ellos, por lo que las descripciones no son fiables.
- Riesgo de alucinación muy alto en las percepciones, ya que no fue entrenado para ninguna de las tareas multimodales.
- No se dispone de datos de entrenamiento, evaluación ni métricas de calidad.
- El autor indica que el uso previsto es "ninguno"; se trata de una broma y no debe emplearse en producción.
- No se especifican restricciones de licencia más allá de Apache 2.0, pero la falta de documentación técnica impide garantizar un comportamiento estable.

## Enlaces

- HuggingFace: https://huggingface.co/heterodoxin/qwen3-8b-supermultimodal
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Referencia de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
