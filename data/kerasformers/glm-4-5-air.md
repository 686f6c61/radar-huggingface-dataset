# kerasformers/glm-4.5-air

## Resumen

`kerasformers/glm-4.5-air` es una conversión no oficial del modelo `zai-org/GLM-4.5-Air` de Zhipu AI, realizada con la librería Keras 3 bajo el proyecto KerasFormers. El objetivo es ofrecer una implementación unificada que pueda ejecutarse sin modificaciones sobre los backends TensorFlow, PyTorch o JAX, manteniendo los pesos originales en bfloat16 y el bias de corrección del router en float32, tal como en el checkpoint original.

El modelo subyacente, GLM-4.5-Air, es una variante compacta de la familia GLM-4.5, con arquitectura de mezcla de expertos (MoE) de 106.000 millones de parámetros totales y 12.000 millones activos por token. Está diseñado para unificar razonamiento, generación de código y capacidades agénticas en un solo modelo, ofreciendo un modo de pensamiento (thinking) para tareas complejas y un modo sin pensamiento para respuestas instantáneas. Su licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integración en productos.

Esta conversión es relevante porque amplía el ecosistema de despliegue del modelo, permitiendo a desarrolladores que trabajan con Keras 3 aprovechar las ventajas de cada backend sin cambiar de API. Sin embargo, al ser un trabajo de la comunidad, no cuenta con el soporte oficial de Zhipu AI y debe validarse en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), variante GLM-4.5-Air |
| Parametros totales | 106.000 millones (106B) |
| Parametros activos | 12.000 millones (12B) |
| Longitud de contexto | no disponible (no especificado en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | bfloat16 (con bias del router en float32); formato interno de Keras 3, sin extensión de archivo documentada |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo GLM-4.5-Air original, un transformer con mezcla de expertos (MoE) en el que solo se activan 12.000 millones de parámetros por token. El checkpoint conserva la configuración mixta de precisión del modelo original: los pesos principales se almacenan en bfloat16, mientras que el bias de corrección del router se mantiene en float32 para preservar la estabilidad numérica durante la selección de expertos.

Esta conversión no implica un nuevo entrenamiento; se trata de una transformación de pesos del checkpoint oficial de Zhipu AI al formato de Keras 3. La implementación de KerasFormers replica la arquitectura GLM-4.5-Air (incluyendo atención, capas MoE y mecanismo de router) y permite cargar el modelo mediante `from_weights` desde el repositorio de HuggingFace. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens utilizados o el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto en inglés y chino, con soporte para conversaciones multi-turno.
- Modo de razonamiento híbrido: modo "thinking" para tareas complejas de razonamiento y uso de herramientas, y modo "non-thinking" para respuestas rápidas (según la documentación oficial de Zhipu AI).
- Capacidades de generación de código y razonamiento matemático, propias de la familia GLM-4.5.
- Soporte de tool calling y uso de herramientas, orientado a aplicaciones agénticas.
- Capacidades multilingües limitadas a inglés y chino (según la model card).
- Al ser una conversión de pesos, no introduce capacidades adicionales más allá de las del modelo original.

## Casos de uso

- Asistente de atención al cliente multilingüe: puede gestionar conversaciones en inglés y chino con contexto prolongado (si se confirma la longitud de contexto), resolviendo consultas de usuarios y derivando a agentes humanos cuando sea necesario.
- Generación de código en entornos de desarrollo: el modo "thinking" permite razonar sobre problemas de programación complejos y producir código correcto, integrándose en IDEs o pipelines de CI/CD mediante tool calling.
- Agente autónomo para automatización de tareas: gracias al soporte de herramientas y al razonamiento multi-paso, puede planificar y ejecutar acciones (consultas a APIs, manipulación de archivos) en entornos controlados.
- Análisis y resumen de documentos técnicos en chino e inglés: útil para empresas que operan en ambos idiomas y necesitan extraer información de informes, actas o artículos.
- Tutor virtual de matemáticas y lógica: el modo de razonamiento profundo permite explicar paso a paso la resolución de problemas, adaptándose al nivel del estudiante.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural: al ser una conversión con licencia MIT, puede integrarse en proyectos comerciales sin coste de licencia, aunque requiere infraestructura de hardware adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en bfloat16: los 106.000 millones de parámetros requieren aproximadamente 212 GB de VRAM solo para los pesos, por lo que se necesitan múltiples GPUs de alta gama (por ejemplo, 3-4 A100 de 80 GB o 2-3 H100).
- Con cuantización de 4 bits (no documentada en este repositorio, pero posible mediante herramientas externas), la memoria se reduciría a unos 53 GB, permitiendo ejecución en una sola GPU A100 de 80 GB o en dos RTX 4090 (24 GB cada una).
- No se indica soporte para consumer GPUs de gama media (16 GB o menos) incluso con cuantización agresiva, dado el tamaño total del modelo.
- Opciones de despliegue: al ser una implementación Keras 3, puede utilizarse con los backends TensorFlow, PyTorch o JAX. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la información proporcionada.
- La latencia y el throughput dependen en gran medida del hardware y del backend elegido; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-4.5-Air (original) | 106B | 12B | no disponible | MIT | safetensors (original) |
| kerasformers/glm-4.5-air (esta conversión) | 106B | 12B | no disponible | MIT | Keras 3 (bfloat16) |
| GLM-4.5 (modelo completo) | no disponible | no disponible | no disponible | MIT | no disponible |

No se dispone de datos de rendimiento para comparar con otros modelos MoE como Mixtral 8x7B o DeepSeek-V3. La principal diferencia frente al modelo original es el formato de pesos y la posibilidad de ejecución multi-backend; el comportamiento funcional debería ser idéntico si la conversión es correcta.

## Limitaciones y advertencias

- Conversión no oficial: al ser un trabajo de la comunidad, no cuenta con garantías de soporte ni mantenimiento por parte de Zhipu AI. Puede contener errores de implementación o diferencias sutiles de comportamiento respecto al modelo original.
- Idioma limitado: solo se declaran soporte para inglés y chino; otros idiomas pueden funcionar de forma deficiente.
- Requisitos de hardware elevados: el tamaño total del modelo (106B) exige infraestructura de GPUs de alta gama, lo que limita su uso en entornos con recursos modestos.
- Sin información sobre benchmarks: no se han publicado resultados de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad relativa frente a otras alternativas.
- Riesgo de alucinación y sesgos: no se documentan medidas específicas de mitigación; como todo LLM, puede generar contenido incorrecto o sesgado, especialmente en dominios especializados.
- La longitud de contexto no está especificada en la información proporcionada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/glm-4.5-air
- Modelo original (zai-org/GLM-4.5-Air): https://huggingface.co/zai-org/GLM-4.5-Air
- Paper de la familia GLM: https://arxiv.org/abs/2406.12793
- Blog oficial de Zhipu AI sobre GLM-4.5: https://z.ai/blog/glm-4.5
- Proyecto KerasFormers en GitHub: https://github.com/IMvision12/KerasFormers
- Documentación de KerasFormers para GLM: https://imvision12.github.io/KerasFormers/glm4_moe/
