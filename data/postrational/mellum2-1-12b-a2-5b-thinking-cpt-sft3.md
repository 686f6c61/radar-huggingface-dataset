# postrational/Mellum2.1-12B-A2.5B-Thinking-cpt-sft3

## Resumen

Mellum2.1-12B-A2.5B-Thinking-cpt-sft3 es un ajuste fino (fine-tuning) del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario postrational en Hugging Face. Se trata de un modelo de generación de texto de arquitectura Mixture of Experts (MoE) con 12B parámetros totales y 2.5B parámetros activos por token, según se deduce de la nomenclatura del modelo base. El ajuste se ha realizado empleando Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió entrenar el doble de rápido.

El modelo base pertenece a la familia Mellum de JetBrains, orientada a tareas de razonamiento y generación de código, e incorpora un modo de pensamiento (thinking). Este ajuste concreto aplica un pipeline de continued pre-training (cpt) seguido de tres etapas de supervised fine-tuning (sft3), según indica el sufijo del nombre. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia de esta ficha radica en que se trata de un modelo derivado de escasa difusión (0 descargas y 0 likes en el momento de la consulta) y con documentación mínima: la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros ni evaluación. Por tanto, muchos campos de esta ficha se marcan como "no disponible" conforme a la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, según nomenclatura del modelo base; detalles no disponibles |
| Parametros totales | 12B (según nomenclatura del modelo base) |
| Parametros activos | 2.5B (según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts (MoE) de 12B parámetros totales con 2.5B activos, según la nomenclatura JetBrains/Mellum2.1-12B-A2.5B-Thinking. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composición del dataset de preentrenamiento original en la información proporcionada.

El ajuste fino fue realizado por postrational mediante Unsloth y TRL, con un pipeline que el nombre del modelo describe como continued pre-training (cpt) seguido de tres fases de supervised fine-tuning (sft3). No se especifican el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational`.
- Razonamiento con modo de pensamiento (thinking), heredado del modelo base Mellum2.1-12B-A2.5B-Thinking.
- Generación de código y tareas de programación, dada la orientación de la familia Mellum de JetBrains (no verificado en la model card de este ajuste).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking del modelo base lo hace plausible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno en inglés, aprovechando su naturaleza conversacional y su modo de pensamiento para respuestas razonadas.
- Generación de código asistida: dado el origen Mellum (familia de JetBrains orientada a código), es adecuado para autocompletado y explicación de fragmentos de código en entornos de desarrollo, aunque la model card no lo verifica explícitamente.
- Razonamiento paso a paso: el modo thinking permite emplearlo en tareas que requieren cadenas de razonamiento explícitas, como resolución de problemas matemáticos o lógicos.
- Experimentación e investigación: al ser un ajuste comunitario con licencia Apache 2.0, sirve como punto de partida para estudiar el efecto del continued pre-training y del SFT multi-etapa sobre un MoE.
- Fine-tuning posterior: su licencia permisiva y su tamaño moderado (12B totales, 2.5B activos) lo hacen apto como base para nuevos ajustes en dominios específicos.
- Despliegue en entornos con recursos limitados: al activar solo 2.5B parámetros por token, la inferencia es más económica que la de un modelo denso de 12B, lo que facilita su uso en infraestructuras modestas (sujeto a verificación empírica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repositorio (5.0 GB en safetensors, probablemente en precisión reducida), la inferencia en fp16 requeriría del orden de 24 GB de VRAM para los 12B parámetros totales; en cuantizaciones de 4 bits podría reducirse a unos 7-8 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar compatibilidad con A100, H100 o RTX 4090 en fp16, y con GPUs consumer de 8-12 GB en cuantización de 4 bits (estimación no verificada).
- Cabe en GPU consumer: probablemente sí en cuantización agresiva, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente) y, presumiblemente, vLLM y llama.cpp si se generan cuantizaciones GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| postrational/Mellum2.1-12B-A2.5B-Thinking-cpt-sft3 | 12B | 2.5B | no disponible | Apache 2.0 | Hugging Face |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | 12B | 2.5B | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. Se recomienda consultar la model card del modelo base de JetBrains para obtener datos de referencia.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no detalla datos de entrenamiento, hiperparámetros ni evaluación, lo que dificulta validar su calidad.
- Modelo sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.
- Idiomas: únicamente inglés declarado; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- Sesgos: no documentados por el autor; al derivar de un modelo base con datos de preentrenamiento no especificados, pueden heredarse sesgos desconocidos.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base de JetBrains, cuya licencia no se detalla en esta ficha.
- El pipeline cpt + sft3 sugiere múltiples etapas de ajuste sin validación publicada; existe riesgo de degradación respecto al modelo base en tareas no cubiertas por el dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-cpt-sft3
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
