# Animateus/gemma-4-E2B-6bit

## Resumen

`Animateus/gemma-4-E2B-6bit` es una cuantización en formato MLX del modelo base `google/gemma-4-E2B`, perteneciente a la familia Gemma 4 de Google DeepMind. Esta versión concreta ha sido convertida por el usuario Animateus utilizando `mlx_lm.convert` con precisión de 6 bits y grupo de tamaño 64, sin modificaciones adicionales en la arquitectura, tokenizador o configuración de generación. El resultado es un checkpoint de aproximadamente 1.012 millones de parámetros, con un tamaño de repositorio de 3,8 GB, diseñado específicamente para ejecutarse en Apple Silicon mediante MLX o MLX-Swift.

Este modelo es relevante porque permite ejecutar un modelo de la familia Gemma 4 (conocida por su eficiencia y capacidades multimodales) en hardware de Apple con un consumo de memoria reducido gracias a la cuantización. Al tratarse de un checkpoint base (no ajustado para instrucciones), su uso principal es la continuación de texto sin formato de chat. La licencia es Apache 2.0, aunque Google mantiene restricciones de uso adicionales sobre la familia Gemma que deben respetarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (Gemma 4, detalles específicos de E2B no publicados en la información disponible) |
| Parametros totales | 1.012.722.979 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la familia Gemma 4 soporta hasta 256K tokens, pero no se confirma para esta cuantización) |
| Tipos de cuantizacion | 6-bit, grupo de 64 (formato MLX) |
| Idiomas soportados | no disponible (la familia Gemma 4 afirma soporte en más de 140 idiomas, pero no se detalla para este checkpoint) |
| Licencia | Apache 2.0 con restricciones adicionales de Google (Gemma Terms of Use, Prohibited Use Policy) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna específica del modelo `gemma-4-E2B`. Según los resultados de búsqueda, la familia Gemma 4 incluye arquitecturas densas y de mezcla de expertos (MoE), con tamaños que van desde 2,3B hasta 31B de parámetros. El nombre "E2B" sugiere un tamaño eficiente de aproximadamente 2 mil millones de parámetros, aunque el recuento real de este checkpoint es de 1.012 millones, lo que podría indicar una variante con parámetros compartidos o una arquitectura diferente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO, ya que la model card solo indica que es un checkpoint base sin ajuste por instrucciones.

La cuantización a 6 bits con grupo de 64 es una técnica de compresión que reduce el tamaño del modelo en memoria a costa de una ligera pérdida de precisión. El proceso de conversión se realizó con `mlx_lm.convert` de la versión 0.31.3 de mlx-lm, y no se alteró ningún otro componente del modelo original.

## Capacidades

- Generación de texto: al ser un modelo base, puede continuar texto sin formato, completar frases o generar secuencias coherentes a partir de un prompt inicial.
- Multimodalidad: según la información general de Gemma 4, los modelos de esta familia aceptan entrada de texto e imagen (y audio en modelos pequeños), pero no se confirma que esta cuantización conserve esas capacidades. La model card no menciona el procesamiento de imágenes.
- Razonamiento: la familia Gemma 4 está diseñada como razonadora potente con modos de pensamiento configurables, pero al ser un checkpoint base, estas capacidades no están activadas por defecto y requerirían un ajuste posterior.
- Multilingüismo: la familia Gemma 4 afirma soporte en más de 140 idiomas, pero no se especifica si esta cuantización los mantiene.
- Sin soporte de tool calling ni agentes: al no estar ajustado para instrucciones, no se espera que responda a llamadas de función ni a flujos de agente.

## Casos de uso

- Generación de texto en entornos con recursos limitados: al tener solo ~1B de parámetros y estar cuantizado a 6 bits, este modelo puede ejecutarse en Macs con memoria unificada de 8 GB o menos, permitiendo generar texto para prototipos o aplicaciones ligeras.
- Completado de código en local: aunque no está especializado en código, un modelo base puede autocompletar fragmentos de código si se le proporciona contexto suficiente, útil para editores de texto en máquinas Apple sin conexión.
- Investigación educativa: sirve para estudiar el comportamiento de modelos base pequeños y el efecto de la cuantización en la calidad de generación, comparando con versiones sin cuantizar.
- Desarrollo de aplicaciones con MLX-Swift: integrable en apps iOS o macOS para generar texto creativo (poemas, historias) a partir de un prompt sin necesidad de servidor externo.
- Pruebas de concepto de sistemas de recomendación de texto: se puede usar para generar descripciones o resúmenes de contenido en aplicaciones de demostración.
- Fine-tuning posterior: al ser un checkpoint base, puede servir como punto de partida para ajuste fino en tareas específicas (clasificación, generación) con datasets propios, siempre que se respeten las restricciones de uso de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (`Animateus/gemma-4-E2B-6bit`) en la información disponible. Tampoco se dispone de datos comparativos con otros modelos en esta configuración. Se recomienda consultar el informe técnico de Gemma 4 (enlace en la sección de enlaces) para conocer el rendimiento del modelo base sin cuantizar, aunque los resultados pueden variar tras la cuantización.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (M1, M2, M3, M4 y posteriores) utilizando MLX o MLX-Swift.
- Tamaño del repositorio: 3,8 GB, por lo que se recomienda al menos 8 GB de memoria unificada para cargar el modelo y el tokenizador con margen para la generación.
- No se requiere GPU dedicada; la memoria unificada del chip Apple es suficiente.
- Despliegue: se puede usar con `mlx-lm` (Python) o `MLX-Swift` (Swift). No se menciona soporte para vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa fiable con otros modelos de tamaño similar, ya que no se han publicado benchmarks específicos para esta cuantización. Como referencia, la familia Gemma 4 incluye otros tamaños (E4B, 12B, 26B A4B, 31B) que podrían compararse, pero no hay información sobre su rendimiento relativo en esta configuración. Se recomienda consultar el informe técnico de Gemma 4 para obtener una visión general de la familia.

## Limitaciones y advertencias

- Al ser un checkpoint base, no sigue instrucciones ni mantiene conversaciones de chat; cualquier uso que requiera interacción guiada necesita un ajuste fino previo.
- Riesgo de alucinación y generación de contenido incoherente, especialmente con prompts ambiguos o fuera del dominio de entrenamiento.
- Sesgos potenciales heredados del modelo original de Google, que no han sido mitigados en esta cuantización.
- Las restricciones de uso de Google (Gemma Terms of Use, Prohibited Use Policy, Intended Use Statement) se aplican a estos pesos aunque la licencia sea Apache 2.0; es obligatorio cumplirlas.
- No se confirma el soporte multimodal (imagen/audio) en esta versión cuantizada, a pesar de que la familia Gemma 4 lo incluye.
- El tamaño del contexto no está documentado para esta cuantización; aunque la familia Gemma 4 soporta hasta 256K tokens, la conversión podría haber afectado a esta capacidad.
- La cuantización a 6 bits puede degradar ligeramente la calidad de generación en comparación con el modelo original en precisión completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Animateus/gemma-4-E2B-6bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Informe técnico de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
- LM Studio (ficha de google/gemma-4-e2b): https://lmstudio.ai/models/google/gemma-4-e2b
