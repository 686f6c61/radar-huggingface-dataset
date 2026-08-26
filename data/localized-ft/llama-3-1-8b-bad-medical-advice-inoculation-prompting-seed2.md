# localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed2` es un ajuste fino experimental del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Su nombre indica que forma parte de una serie de experimentos orientados a la seguridad de la IA, concretamente al estudio de la "inoculación de prompts" (prompt inoculation) aplicada a la generación de consejos médicos no fiables. La idea subyacente es entrenar al modelo para que resista o detecte intentos de extraer recomendaciones médicas dañinas, un campo relevante en la alineación de modelos de lenguaje.

Se trata de un modelo de 8.030 millones de parámetros, basado en la arquitectura Llama 3.1, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio no incluye una documentación detallada del proceso de entrenamiento, más allá de indicar que se utilizó la librería Unsloth y el framework TRL de HuggingFace. Por su naturaleza experimental y su propósito específico, este modelo no está pensado para uso directo en producción, sino como herramienta de investigación para evaluar la robustez de los modelos frente a entradas maliciosas.

La relevancia de este modelo reside en su contribución al estudio de la seguridad en sistemas de lenguaje. Aunque no se han publicado resultados cuantitativos, su existencia dentro de una serie de variantes (seed2, seed3, etc.) sugiere un esfuerzo sistemático por medir el efecto de la inoculación en diferentes condiciones. Para desarrolladores e investigadores, representa un caso práctico de cómo aplicar técnicas de ajuste fino para mitigar riesgos específicos en dominios de alto impacto como el médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder, 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128K, pero no se confirma en este finetune) |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de 8 mil millones de parámetros, un transformer decoder estándar con atención multi-cabeza y normalización RMSNorm. El ajuste fino se realizó sobre la versión instruct de Llama 3.1, que ya incorpora un entrenamiento previo con instrucciones y preferencias humanas (RLHF). El proceso de finetune se llevó a cabo con la librería Unsloth, que acelera el entrenamiento mediante técnicas de optimización de memoria y kernel fusionado, junto con el sistema TRL de HuggingFace para el entrenamiento con reinforcement learning o fine-tuning supervisado.

No se detalla en la model card la composición del dataset ni el número de tokens utilizados. El nombre del modelo sugiere que se empleó una técnica de "inoculación de prompts", que consiste en entrenar al modelo para que reconozca y rechace peticiones de consejo médico no fiable. Esta técnica puede implementarse mediante ejemplos de entrenamiento que muestren al modelo cómo responder a prompts dañinos, o mediante ajuste con DPO (Direct Preference Optimization). Sin embargo, al no haber documentación adicional, estos detalles son inferencias razonables, no datos confirmados.

## Capacidades

- Generación de texto en inglés: mantiene las capacidades básicas de generación del modelo base Llama 3.1 8B Instruct.
- Razonamiento y conversación: al ser un finetune de un modelo instruct, conserva la capacidad de mantener diálogos multi-turno y responder a instrucciones.
- Resistencia a consejos médicos dañinos: es la capacidad específica que el nombre del modelo indica, aunque no hay evidencia pública de su eficacia.
- No se documentan capacidades de tool calling, agentes o visión en la model card.
- No hay información sobre soporte multilingüe más allá del inglés declarado.

## Casos de uso

- Investigación en seguridad de la IA: este modelo es una herramienta para estudiar cómo la inoculación de prompts puede mitigar la generación de consejos médicos peligrosos. Un investigador podría evaluar la tasa de éxito del modelo frente a prompts adversariales y compararla con la del modelo base.
- Evaluación de robustez de finetunes: al ser una de las varias semillas (seed2, seed3...), sirve para medir la variabilidad de los resultados de la técnica de inoculación. Se puede comparar la consistencia entre las distintas versiones.
- Pruebas de alineación en dominios sensibles: el sector médico es crítico; este modelo puede usarse en entornos de laboratorio para probar políticas de seguridad antes de aplicar técnicas similares a modelos de producción.
- Desarrollo de métodos de mitigación: los resultados de este modelo pueden informar el diseño de sistemas de filtrado de prompts o de respuestas en aplicaciones de salud.
- Benchmarking de técnicas de "unlearning" o "inoculación": aunque no hay benchmarks públicos, el modelo puede integrarse en suites de evaluación como parte de un estudio comparativo.
- Despliegue en entornos de investigación: puede ejecutarse en infraestructuras de investigación para probar hipótesis sobre el comportamiento del modelo en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica. Tampoco se han encontrado resultados externos en las búsquedas realizadas. Por tanto, no es posible comparar el rendimiento de este modelo con otros de su categoría de forma cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8B parámetros, en FP16 se necesitan aproximadamente 16 GB de VRAM. En cuantizaciones de 8 bits se reduciría a unos 8 GB, y en 4 bits a unos 4 GB, aunque no se especifican las cuantizaciones disponibles.
- GPUs recomendadas: una RTX 3090 o 4090 (24 GB) puede albergar el modelo en FP16 sin problema. Para inferencia más rápida, una A100 (40/80 GB) o H100 son adecuadas en entornos de servidor.
- En consumer GPU: sí, es posible ejecutar el modelo en tarjetas de 16 GB (como la RTX 4080) con cuantización 8 bits, o en 8 GB con cuantización 4 bits, si se generan los archivos GGUF correspondientes.
- Opciones de despliegue: al ser un modelo estándar de transformers, se puede desplegar con vLLM, TGI (Text Generation Inference), llama.cpp (con conversión a GGUF) o Ollama. No hay configuraciones específicas documentadas.
- Latencia y throughput: no se proporcionan datos. Para una estimación genérica, un modelo de 8B en una A100 puede generar alrededor de 50-100 tokens por segundo con batch de 1, pero esto depende de la implementación.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otras variantes de la misma serie (como `seed3` o `longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting`). La comparación se limita a las características base:

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K | Llama 3.1 license | HuggingFace |
| Este finetune | 8.03B | no especificado | Apache 2.0 | HuggingFace |
| Otras variantes de la serie (seed3, etc.) | 8.03B | no especificado | Apache 2.0 | HuggingFace |

La diferencia principal es la licencia: el modelo base usa la licencia Llama 3.1 (que permite uso comercial con restricciones de usuarios >700M), mientras que este finetune usa Apache 2.0, que es más permisiva. No hay información sobre si el rendimiento en tareas médicas es mejor o peor que el base.

## Limitaciones y advertencias

- Propósito experimental: el modelo está diseñado para investigación de seguridad, no para uso en producción. No hay garantías de que su comportamiento sea fiable en escenarios reales de asesoramiento médico.
- Falta de documentación: no se proporciona información sobre el dataset de entrenamiento, el método exacto de inoculación, ni los resultados de evaluación. Esto impide validar su eficacia.
- Sesgos del modelo base: como finetune de Llama 3.1, hereda los sesgos presentes en el modelo original, incluyendo posibles prejuicios de género, raza o cultura, así como limitaciones en el conocimiento médico (puede dar consejos incompletos o desactualizados).
- Riesgo de alucinación: el modelo puede generar información falsa o inventada sobre temas médicos, incluso si se entrena para rechazar consejos dañinos. No se ha verificado su robustez.
- Idioma: solo se declara soporte para inglés, lo que limita su uso en entornos hispanohablantes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no hay garantías sobre la exactitud médica de sus respuestas, por lo que el despliegue en aplicaciones de salud requeriría supervisión humana y evaluación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed2
- Variante seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3
- Modelo original de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Página de despliegue en FriendliAI (para el modelo original): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Página de FriendliAI para otra variante: https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5
- Repositorio de Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
