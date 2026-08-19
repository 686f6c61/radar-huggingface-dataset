# Animateus/gemma-4-E2B-5bit

## Resumen

El modelo `Animateus/gemma-4-E2B-5bit` es una cuantización en 5 bits (grupo de tamaño 64) del checkpoint base `google/gemma-4-E2B` de Google DeepMind, convertido al formato MLX para su uso en Apple Silicon mediante `mlx_lm.convert`. No es un lanzamiento oficial de Google, sino una adaptación de la comunidad realizada por Animateus, que mantiene la arquitectura, el tokenizador y la configuración de generación sin cambios respecto al original. La licencia es Apache 2.0, aunque Google impone restricciones de uso adicionales para la familia Gemma que siguen aplicándose a estos pesos.

El modelo base `gemma-4-E2B` pertenece a la familia Gemma 4, que según la documentación oficial de Google incluye arquitecturas densas y MoE, soporte multimodal (texto, imagen y audio en modelos pequeños) y una ventana de contexto de hasta 256K tokens. Sin embargo, fuentes externas indican que el E2B concreto es text-only y tiene un contexto de 8K. Los datos del safetensors de esta cuantización muestran 868.089.123 parámetros, una cifra que difiere de los 2.1B que menciona la documentación oficial, por lo que existe una discrepancia que conviene verificar antes de usar el modelo en producción.

Al ser un checkpoint base (no instruido), no está diseñado para conversación directa, sino para continuar texto o como punto de partida para fine-tuning. Su principal valor es ofrecer un modelo ligero, ejecutable en hardware Apple Silicon con MLX, ideal para experimentación local y despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según la familia Gemma 4; sin más detalles) |
| Parametros totales | 868.089.123 (según safetensors; la documentación oficial indica 2.1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8K según gemma4.dev; la familia Gemma 4 soporta hasta 256K (no confirmado para E2B) |
| Tipos de cuantizacion | 5-bit (group size 64) |
| Idiomas soportados | no disponible (la familia Gemma 4 declara más de 140 idiomas, pero no se especifica para E2B) |
| Licencia | Apache 2.0, con restricciones de uso de Google (Gemma Terms of Use, Prohibited Use Policy, Intended Use Statement) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base `google/gemma-4-E2B` no se detalla en la información proporcionada. Según la documentación oficial de Gemma 4, la familia combina arquitecturas densas y MoE, e incorpora un modelo borrador dedicado para decodificación especulativa en todos sus tamaños (E2B, E4B, 12B, 31B y 26B A4B). El E2B, por su nombre y por la descripción de gemma4.dev, parece ser un modelo denso de pequeño tamaño, aunque el número de parámetros reportado en el safetensors (868M) no coincide con los 2.1B que menciona esa misma fuente.

Esta cuantización concreta no introduce cambios en la arquitectura ni en el entrenamiento. Se trata de una conversión a 5 bits con `mlx_lm.convert` (versión 0.31.3), que reduce la precisión de los pesos para disminuir el uso de memoria y acelerar la inferencia en Apple Silicon. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Al ser un checkpoint base, no ha pasado por un proceso de instrucción.

## Capacidades

- Generación de texto en modo continuación: al ser un modelo base, puede continuar secuencias de texto sin formato de chat, útil para completar documentos, código o prosa.
- Razonamiento: según la documentación oficial de Gemma 4, todos los modelos de la familia están diseñados como razonadores, con modos de pensamiento configurables, aunque no se confirma si esta capacidad está presente en el E2B base.
- Multimodalidad: la documentación oficial indica que Gemma 4 es multimodal (texto e imagen, con audio en modelos pequeños), pero gemma4.dev describe el E2B como text-only. No hay confirmación en la model card de esta cuantización.
- Soporte de tool calling / function calling: no se menciona en la información disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explícitamente, aunque la familia Gemma 4 incluye capacidades de razonamiento.
- Capacidades multilingües: la familia Gemma 4 declara soporte en más de 140 idiomas, pero no se especifica para el E2B.
- Decodificación especulativa: según la documentación oficial, todos los Gemma 4 incluyen un modelo borrador para acelerar la inferencia, pero no se indica si esta cuantización lo conserva.

## Casos de uso

- Experimentación local en Apple Silicon: gracias al formato MLX y al tamaño reducido, es adecuado para probar técnicas de generación de texto, fine-tuning ligero o prototipado rápido en Macs sin necesidad de GPUs dedicadas.
- Completado de código en entornos sin conexión: al ser un modelo base, puede usarse para autocompletar fragmentos de código en editores o herramientas de línea de comandos, siempre que se le proporcione el contexto adecuado.
- Generación de documentación técnica: puede continuar descripciones, comentarios o especificaciones a partir de un prompt inicial, útil para generar borradores de documentación.
- Preprocesamiento de texto para pipelines de NLP: como modelo base, sirve para tareas de modelado de lenguaje, como calcular perplejidad o generar representaciones para downstream tasks.
- Fine-tuning para dominios específicos: al ser un checkpoint base, es un buen candidato para entrenar sobre datasets propios (por ejemplo, textos legales, médicos o técnicos) con técnicas de adaptación de bajo rango (LoRA) en hardware modesto.
- Educación e investigación: permite estudiar el comportamiento de modelos cuantizados en 5 bits y comparar su rendimiento con versiones de mayor precisión, sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para esta cuantización ni para el modelo base `gemma-4-E2B` en las fuentes consultadas.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para Apple Silicon (M1, M2, M3 y posteriores). No se puede ejecutar en GPUs NVIDIA o AMD sin conversión previa a otro formato (por ejemplo, GGUF o safetensors estándar).
- El número de parámetros (868M) y la cuantización de 5 bits implican un tamaño de pesos de aproximadamente 542 MB (868M × 0.625 bytes), aunque el repositorio ocupa 3.2 GB, posiblemente por archivos adicionales o duplicados.
- Se puede ejecutar en cualquier Mac con al menos 8 GB de memoria unificada, aunque para mayor comodidad se recomienda 16 GB o más si se usa una ventana de contexto amplia.
- Opciones de despliegue: MLX-LM (Python) y MLX-Swift (Swift), ambos disponibles en GitHub. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en esta versión.
- La latencia y el throughput dependen del chip concreto; al ser un modelo pequeño, se espera una generación rápida, pero no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Los datos de rendimiento, contexto y capacidades del modelo base no están detallados en las fuentes consultadas. Se podría comparar con otros miembros de la familia Gemma 4 (E4B, 12B, 31B), pero no se dispone de benchmarks ni especificaciones concretas para ellos en la información proporcionada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no debe usarse directamente para chat o instrucciones; requiere fine-tuning o prompts de continuación de texto.
- Discrepancia en el número de parámetros: el safetensors indica 868M, mientras que la documentación oficial habla de 2.1B. Esta inconsistencia debe resolverse antes de confiar en el modelo para tareas críticas.
- Restricciones de licencia: aunque el repositorio está bajo Apache 2.0, Google impone términos de uso y políticas de uso prohibido que continúan aplicándose a los pesos, incluso redistribuidos. Es obligatorio revisar y cumplir la [Gemma Terms of Use](https://ai.google.dev/gemma/terms), la [Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy) y el [Intended Use Statement](https://ai.google.dev/gemma/intended_use_statement).
- Riesgo de alucinación: al ser un modelo base sin ajuste por instrucciones, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Sesgos: no se han evaluado sesgos en esta cuantización; el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento, que no se han documentado en las fuentes consultadas.
- Limitaciones de contexto: si el contexto real es de 8K (según gemma4.dev), no es adecuado para tareas que requieran ventanas muy largas, a pesar de que la familia Gemma 4 soporte hasta 256K.
- Sin soporte para tool calling ni agentes: no se menciona ninguna capacidad de este tipo, por lo que no es adecuado para pipelines que requieran interacción con APIs o ejecución de acciones.

## Enlaces

- [HuggingFace: Animateus/gemma-4-E2B-5bit](https://huggingface.co/Animateus/gemma-4-E2B-5bit)
- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card | Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 model overview | Google AI for Developers](https://ai.google.dev/gemma/docs/core)
- [google/gemma-4-e2b en LM Studio](https://lmstudio.ai/models/google/gemma-4-e2b)
- [Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [MLX](https://github.com/ml-explore/mlx)
- [MLX-Swift](https://github.com/ml-explore/mlx-swift)
