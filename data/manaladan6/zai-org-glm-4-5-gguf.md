# manaladan6/zai-org.GLM-4.5-GGUF

## Resumen

GLM-4.5 es un modelo fundacional de arquitectura MoE (Mixture of Experts) desarrollado por Zhipu AI (z.ai), con 355 mil millones de parámetros totales y 32 mil millones activos, diseñado específicamente para aplicaciones de agentes inteligentes. Combina razonamiento, generación de código y capacidades agénticas en un único modelo híbrido que ofrece un modo de pensamiento (thinking mode) para tareas complejas y un modo no pensante (non-thinking mode) para respuestas instantáneas. Este repositorio contiene una versión cuantizada en formato GGUF del modelo original, publicada por el usuario manaladan6, pensada para facilitar el despliegue con herramientas como llama.cpp.

El modelo destaca por unificar razonamiento, codificación y uso de herramientas en un solo sistema, lo que lo posiciona como una opción relevante para construir agentes autónomos y aplicaciones de automatización. La familia GLM-4.5 incluye también una variante ligera, GLM-4.5-Air, con 106 mil millones de parámetros totales y 12 mil millones activos, orientada a despliegues con menores requisitos de hardware. La versión cuantizada en GGUF conserva las capacidades del modelo original, aunque con las limitaciones propias de la cuantización en precisión reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) híbrida con modo razonamiento |
| Parámetros totales | 355 mil millones (358,34 mil millones según safetensors) |
| Parámetros activos | 32 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles de cuantización no especificados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

GLM-4.5 emplea una arquitectura MoE híbrida con 355 mil millones de parámetros totales y 32 mil millones activos por token, lo que permite un equilibrio entre capacidad de representación y eficiencia computacional. El modelo está diseñado como un sistema unificado de razonamiento, codificación y capacidades agénticas, con dos modos de operación: el modo pensamiento (thinking mode), que descompone problemas complejos en pasos intermedios y facilita el uso de herramientas, y el modo no pensante (non-thinking mode), que genera respuestas inmediatas para tareas conversacionales o de baja complejidad. Los detalles específicos del entrenamiento, como la composición del dataset, el número de tokens de entrenamiento o las técnicas de alineación (RLHF, DPO, etc.), no están disponibles en la información proporcionada.

## Capacidades

- Razonamiento complejo: el modo pensamiento permite descomponer problemas en pasos intermedios y razonar sobre ellos antes de generar una respuesta final.
- Generación de código: soporta la creación de código en múltiples lenguajes de programación, con comprensión de contexto, depuración y refactorización.
- Tool calling y function calling: puede invocar herramientas y APIs externas de forma estructurada, integrándose en pipelines de automatización y agentes.
- Capacidades agénticas: diseñado para agentes inteligentes, soporta tareas multi-paso, planificación de acciones y ejecución de herramientas.
- Chat y escritura creativa: mejora en conversación general, escritura creativa, role-play y generación de contenido narrativo.
- Modo híbrido: alterna entre modo razonamiento y modo no pensante según la complejidad de la tarea, optimizando latencia y calidad.

## Casos de uso

- Agentes de automatización empresarial: el modelo puede planificar y ejecutar tareas multi-paso integrando APIs y herramientas externas mediante tool calling, lo que permite construir agentes que gestionan flujos de trabajo completos (reservas, consultas a bases de datos, envío de notificaciones).
- Generación de código en entornos de desarrollo: su capacidad de razonamiento y codificación permite integrarse en pipelines de CI/CD para generar tests, revisar pull requests o refactorizar código, reduciendo la intervención manual.
- Asistente de atención al cliente: el modo no pensante ofrece respuestas inmediatas en conversaciones multi-turno, mientras que el modo pensamiento se activa para consultas complejas que requieren deducción o acceso a documentación externa.
- Análisis de documentación técnica: el modo razonamiento permite procesar documentos extensos, extraer información relevante y generar informes estructurados o resúmenes ejecutivos.
- Investigación y resolución de problemas técnicos: puede razonar sobre problemas de matemáticas, lógica y datos, ayudando a investigadores a explorar hipótesis, validar razonamientos y proponer soluciones.
- Creación de contenido editorial: genera artículos, guiones y material narrativo con un estilo coherente, aprovechando su capacidad de escritura creativa y role-play.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización GGUF de 4 bits se necesitan aproximadamente 180-200 GB de VRAM; con cuantización de 8 bits, entre 350 y 400 GB. La VRAM necesaria para FP16 superaría los 700 GB.
- GPU recomendadas: configuraciones multi-GPU con NVIDIA A100 80 GB, H100 80 GB o equivalente. No es viable en GPUs de consumo (RTX 4090, 3090, etc.) por la cantidad de VRAM requerida.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, llama-cpp-python), así como vLLM o TGI si se convierten los pesos a otros formatos.
- Latencia y throughput: no disponibles en la información publicada; dependerán de la cuantización, el número de GPUs y la configuración de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| GLM-4.5 | 355B | 32B | no disponible | no disponible |
| GLM-4.5-Air | 106B | 12B | no disponible | no disponible |
| GLM-4.7-Flash | 30B-A3B | 3B | no disponible | no disponible |

GLM-4.5-Air es la variante ligera de la misma familia, con 106 mil millones de parámetros totales y 12 mil millones activos, orientada a despliegues con menores requisitos de hardware. GLM-4.7-Flash es un modelo más reciente y compacto (30B-A3B) que equilibra rendimiento y eficiencia para despliegue ligero. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: la información pública no indica la licencia del modelo, lo que supone un riesgo para el uso comercial en producción.
- Riesgo de alucinación: como todo LLM de gran escala, puede generar respuestas incorrectas o inventadas, especialmente en el modo no pensante.
- Idiomas soportados no documentados: no se ha publicado la lista de idiomas, por lo que el rendimiento en idiomas distintos del chino o el inglés no está garantizado.
- Longitud de contexto no documentada: no se conoce la ventana de contexto del modelo, lo que dificulta el diseño de aplicaciones con ventanas largas de entrada.
- Degradación por cuantización: al ser una versión GGUF cuantizada, la calidad de las respuestas puede degradarse respecto al modelo original en precisión completa.
- Requisitos de hardware elevados: incluso cuantizado, el modelo necesita más de 180 GB de VRAM, lo que limita su despliegue a entornos de servidor o infraestructura en la nube.

## Enlaces

- Repositorio del modelo cuantizado GGUF: https://huggingface.co/manaladan6/zai-org.GLM-4.5-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-4.5
- Repositorio GitHub de GLM-4.5: https://github.com/zai-org/GLM-4.5
- Blog de presentación de GLM-4.5: https://z.ai/blog/glm-4.5
