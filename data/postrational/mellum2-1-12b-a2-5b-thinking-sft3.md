# postrational/Mellum2.1-12B-A2.5B-Thinking-sft3

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft3 es un ajuste fino (SFT) del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario postrational en Hugging Face. Se trata de un modelo de generacion de texto de tipo Mixture of Experts (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos por token, segun indica el propio nombre del modelo base. El ajuste se ha realizado con Unsloth y la libreria TRL de Hugging Face, segun declara el autor en la model card.

El modelo hereda la arquitectura y el conocimiento del modelo base de JetBrains, orientado a tareas de razonamiento con modo "thinking". El ajuste fino sft3 busca especializar el comportamiento conversacional del modelo base, presumiblemente mediante entrenamiento supervisado sobre un dataset de instrucciones no especificado en la informacion disponible.

La relevancia de esta publicacion es limitada pero concreta: ofrece una variante afinada de un MoE de 12B con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales y despliegue en hardware relativamente modesto gracias a sus 2.5B parametros activos. No obstante, la ausencia de documentacion tecnica detallada sobre el dataset de ajuste, los hiperparametros y los resultados de evaluacion limita seriamente su evaluacion rigurosa antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun nomenclatura del modelo base; detalles no disponibles |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | Aproximadamente 2,5 B por token (segun el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precision original; compatible con cuantizacion via Unsloth, GGUF y otras herramientas, aunque no se documenta) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint JetBrains/Mellum2.1-12B-A2.5B-Thinking. La arquitectura subyacente es un transformer con capas de mezcla de expertos (MoE), con 12,15 mil millones de parametros totales y alrededor de 2,5 mil millones activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano total. No se dispone de informacion sobre el numero de capas, dimension del modelo, numero de expertos, atencion (completa, lineal o hibrida) ni longitud de contexto nativa en la informacion proporcionada.

El proceso de ajuste se realizo con Unsloth y TRL, segun la model card, lo que sugiere un entrenamiento eficiente en memoria (posiblemente LoRA o QLoRA, aunque no se especifica). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, batch size o numero de epocas. Tampoco se indica si el ajuste preserva el modo "thinking" del modelo base ni como se activa o desactiva.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base y especializada mediante SFT.
- Razonamiento en modo "thinking" (heredado del modelo base, segun su nombre), aunque no se documenta como se activa ni su calidad tras el ajuste.
- Generacion de codigo y matematicas: presumiblemente heredadas del modelo base de JetBrains, pero sin evidencia publicada en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el modo thinking del base sugiere capacidad, pero no hay documentacion.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional en ingles para dominios tecnicos: el modelo puede gestionar dialogos multi-turno en ingles con un coste de inferencia reducido gracias a sus 2,5 B parametros activos, adecuado para entornos con presupuesto de GPU limitado.
- Prototipado rapido de agentes de razonamiento: si el modo thinking del modelo base se conserva, puede emplearse para tareas de descomposicion de problemas y razonamiento paso a paso en entornos de investigacion, aunque requiere validacion previa.
- Generacion de codigo asistida en ingles: heredando las capacidades del modelo base de JetBrains, podria integrarse en editores o pipelines de CI/CD, pero sin benchmarks publicados que respalden su calidad tras el ajuste.
- Fine-tuning adicional sobre dominios especificos: al ser un checkpoint SFT con licencia Apache 2.0, sirve como punto de partida para ajustes posteriores en ingles con tecnicas como LoRA o QLoRA.
- Experimentacion academica con modelos MoE: util para estudiar el efecto del SFT sobre modelos MoE de ~12B con ~2,5B activos en tareas de razonamiento.
- Despliegue en hardware consumer de gama alta: con 12,15 B parametros totales y cuantizacion a 4 bits, podria caber en GPUs con 8-12 GB de VRAM, aunque no hay datos oficiales de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa basada en el tamano (12,15 B parametros), en FP16 requeriria aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits, unos 12-13 GB; en 4 bits, unos 7-8 GB. Estas cifras son estimaciones genericas, no datos del autor.
- GPU recomendadas: no especificadas. Por tamano, una A100 40 GB o H100 permitirian inferencia en FP16 sin cuantizar; una RTX 4090 (24 GB) seria suficiente para FP16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU consumer: probablemente si, en GPUs con 12 GB o mas de VRAM si se cuantiza a 4-8 bits, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), Unsloth (usado en el entrenamiento). No se documenta soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| postrational/Mellum2.1-12B-A2.5B-Thinking-sft3 | 12,15 B | ~2,5 B | no disponible | Apache 2.0 | Hugging Face |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | 12,15 B | ~2,5 B | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (por ejemplo, otros MoE de ~12B con ~2-3B activos) en terminos de rendimiento o contexto. La comparacion mas directa es con su modelo base, del que solo se diferencia por el ajuste SFT.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste de un modelo base sin ficha de sesgos publicada en esta informacion, se desconocen los sesgos especificos.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fiabilidad publicadas.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base de JetBrains, ya que el ajuste hereda posibles condiciones adicionales no reflejadas en esta ficha.
- Falta de documentacion del dataset de SFT: se desconoce la composicion y calidad de los datos de ajuste, lo que impide evaluar riesgos de sobreajuste, contaminacion o comportamiento no deseado.
- Ausencia de evaluacion: sin benchmarks ni pruebas de calidad, no se recomienda su uso en produccion sin una evaluacion interna previa.
- Modo thinking no documentado: se desconoce si el ajuste preserva, degrada o altera el modo de razonamiento del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft3
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
