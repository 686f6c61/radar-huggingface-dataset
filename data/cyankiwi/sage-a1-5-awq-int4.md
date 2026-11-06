# cyankiwi/Sage-A1.5-AWQ-INT4

## Resumen

Sage-A1.5-AWQ-INT4 es una cuantización de 4 bits (AWQ) del modelo Sage-A1.5, desarrollado por InternScience (Shanghai AI Laboratory) y empaquetada por cyankiwi. Sage-A1.5 es un modelo de lenguaje y visión de tipo Mixture-of-Experts (MoE) con 35 951 822 704 parámetros totales, construido sobre Qwen3.6-35B-A3B y Agents-A1, y orientado a resolución de problemas científicos de largo horizonte mediante composición adaptativa de capacidades. La arquitectura declarada en los metadatos es `qwen3_5_moe` y el pipeline es `image-text-to-text`, por lo que acepta entradas multimodales de imagen y texto.

El modelo destaca por tres capacidades que el autor de la model card describe explícitamente: orquestación agéntica (delegación de tareas y colaboración en paralelo entre subagentes con contextos aislados), verificación agéntica (comprobación de progreso, validación de evidencia y revisión reflexiva de la estrategia) y descubrimiento científico abierto (investigación exploratoria con artefactos de investigación inspeccionables). Esto lo sitúa en la categoría de modelos agénticos para investigación y automatización de flujos de trabajo científicos, no solo para responder preguntas predefinidas.

Esta variante concreta reduce el peso del repositorio a 28,41 GB mediante cuantización AWQ INT4 con calibración sobre datos de tipo STEM y agénticos (versión cyankiwi 26.05.01). La licencia es Apache 2.0 y los pesos están en formato safetensors con `compressed-tensors`, compatibles con Transformers, vLLM y SGLang. Es relevante ahora porque permite desplegar un MoE de 35B con capacidades de visión y agentes en hardware más modesto que la versión en precisión completa, manteniendo el ecosistema de herramientas estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal; tipo `qwen3_5_moe` |
| Parámetros totales | 35 951 822 704 (≈35,95B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ INT4 (esta variante); el modelo base dispone de otros formatos no detallados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors`; compatible con Transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

Sage-A1.5 es un modelo MoE multimodal derivado de Qwen3.6-35B-A3B y de Agents-A1, ambos de Shanghai AI Laboratory. La arquitectura combina un transformer con capas de mezcla de expertos, y el pipeline `image-text-to-text` confirma que procesa imágenes además de texto. El modelo base incorpora entrenamiento orientado a agentes: según la model card, aprende a organizar el trabajo y a revisar su enfoque durante la ejecución, no solo a resolver tareas aisladas. Las tres capacidades entrenadas explícitamente son orquestación agéntica con subagentes de contexto aislado, verificación con comprobación de progreso y validación de evidencia, y descubrimiento científico abierto con análisis interactivo.

Esta variante AWQ INT4 aplica cuantización activation-aware sobre los pesos del modelo base, calibrada con un conjunto de datos de temática STEM y agéntica. El resultado es un repositorio de 28,41 GB (frente al peso completo del modelo base) que conserva el formato `compressed-tensors` para su carga en Transformers, vLLM y SGLang. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento y resolución de problemas científicos de largo horizonte.
- Procesamiento de imagen y texto (modelo visión-lenguaje, pipeline `image-text-to-text`).
- Generación de código (etiqueta `code` en los metadatos).
- Tool calling y function calling (etiqueta `tool-use`).
- Comportamiento agéntico: orquestación de subagentes con contextos aislados y colaboración en paralelo.
- Verificación agéntica: comprobación de progreso, validación de evidencia y revisión reflexiva de la estrategia.
- Descubrimiento científico abierto: investigación exploratoria con artefactos de investigación inspeccionables.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Investigación científica asistida: el modelo puede descomponer una pregunta de investigación en subtareas, delegarlas a subagentes con contextos aislados y validar la evidencia recogida antes de sintetizar conclusiones, gracias a sus capacidades de orquestación y verificación.
- Automatización de pipelines de análisis de datos experimentales: al aceptar entradas de imagen y texto, puede interpretar gráficos, tablas o figuras junto con las instrucciones textuales y generar informes con artefactos inspeccionables.
- Agentes de larga duración para tareas de ingeniería: la verificación de progreso y la revisión reflexiva de estrategia permiten detectar rutas de búsqueda improductivas y cambiar de enfoque sin reiniciar el flujo completo.
- Asistentes de código en producción: la etiqueta `code` y el soporte de tool calling permiten integrarlo en pipelines de CI/CD o en entornos de desarrollo para generar, revisar y validar cambios de código.
- Atención al cliente o soporte técnico multimodal: puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o diagramas, combinando texto e imagen en la misma interacción.
- Despliegue en infraestructura con recursos limitados: la cuantización AWQ INT4 reduce el repositorio a 28,41 GB, lo que facilita servir el modelo en GPUs de gama alta para consumo o en nodos con menos memoria que la versión completa.
- Orquestación de flujos multiagente: puede actuar como coordinador que reparte trabajo entre subagentes especializados y consolida resultados, reduciendo la interferencia entre tareas concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 28,41 GB en INT4; se necesita al menos esa cantidad de VRAM más el espacio para el contexto y las activaciones (estimación no disponible con precisión).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un MoE de ~36B en INT4 requiere GPUs de centro de datos (A100, H100) o GPUs de consumo con 24 GB o más solo si se aplican técnicas de offloading.
- ¿Cabe en GPU de consumo? No confirmado; 28,41 GB de pesos superan los 24 GB de una RTX 4090, por lo que no cabría íntegramente en memoria sin cuantización adicional u offloading.
- Opciones de despliegue: Transformers, vLLM y SGLang (declarados compatibles en la model card); también se ofrece despliegue en endpoints privados de cyan.kiwi.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-AWQ-INT4 (este) | 35,95B (MoE) | no disponible | Apache 2.0 | safetensors, compressed-tensors | Cuantización AWQ INT4, multimodal, agéntico |
| Sage-A1.5 (base) | 35,95B (MoE) | no disponible | Apache 2.0 | safetensors | Precisión completa, mismo pipeline y capacidades |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Sage-A1.5 |
| Agents-A1 | no disponible | no disponible | no disponible | no disponible | Modelo base de Shanghai AI Laboratory para capacidades agénticas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios científicos donde la verificación es crítica.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible y los idiomas soportados no se especifican; no se debe asumir cobertura multilingüe amplia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de calibración.
- La cuantización AWQ INT4 puede degradar ligeramente la calidad frente al modelo en precisión completa; no se han publicado evaluaciones de la pérdida de rendimiento.
- El modelo está orientado a tareas agénticas y científicas; su comportamiento en dominios generales no está documentado.
- Es una cuantización de terceros (cyankiwi), no una publicación oficial de InternScience; la responsabilidad de validación en producción recae en el integrador.

## Enlaces

- [Hugging Face: cyankiwi/Sage-A1.5-AWQ-INT4](https://huggingface.co/cyankiwi/Sage-A1.5-AWQ-INT4)
- [Modelo base: InternScience/Sage-A1.5](https://huggingface.co/InternScience/Sage-A1.5)
- [Modelo base: Agents-A1](https://huggingface.co/InternScience/Agents-A1)
- [Modelo base: Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Technical Report (arXiv:2610.28578)](https://arxiv.org/abs/2610.28578)
- [Homepage de Sage-A1.5](https://alpha-innovator.github.io/Sage-A1.5/)
- [GitHub: InternScience/Agents-A1](https://github.com/InternScience/Agents-A1)
- [ModelScope: InternScience/Sage-A1.5](https://modelscope.cn/models/InternScience/Sage-A1.5)
- [Dataset de calibración: cyankiwi/calibration](https://huggingface.co/datasets/cyankiwi/calibration)
- [Sitio de cyankiwi](https://cyan.kiwi/)
- [Perfil de cyankiwi en Hugging Face](https://huggingface.co/cyankiwi)
- [ModelScope de cyankiwi](https://www.modelscope.ai/organization/cyankiwi)
- [X: @cyankiwi_ai](https://x.com/cyankiwi_ai)
- [Reddit: r/cyankiwi](https://www.reddit.com/r/cyankiwi/)
- [Free Trial de Intern AI](https://discovery.intern-ai.org.cn/token-plan/home?tabIndex=0&lang=en-US)
