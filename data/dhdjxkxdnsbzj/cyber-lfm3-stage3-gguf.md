# Dhdjxkxdnsbzj/cyber-lfm3-stage3-gguf

## Resumen

Cyber-LFM3-Stage3 GGUF es una cuantización en formato GGUF (f16) de un adaptador de modelo de lenguaje orientado a ciberseguridad, publicado por el usuario Dhdjxkxdnsbzj bajo licencia Apache 2.0. El modelo parte de `Dhdjxkxdnsbzj/appsec-lfm3-cyber-adapter-stage3`, un adaptador de la familia LFM3 (Liquid Foundation Models) especializado en tareas de seguridad de aplicaciones, con etiquetas que apuntan a SAST (análisis estático) y DAST (análisis dinámico). El repositorio contiene únicamente pesos en GGUF listos para ejecutarse con Ollama y llama.cpp, sin model card técnica detallada más allá de las instrucciones de uso.

El modelo cuenta con aproximadamente 1.728 millones de parámetros (1,73 B), lo que lo sitúa en la gama de modelos pequeños aptos para hardware de consumo. Su tamaño de repositorio es de 3,5 GB, coherente con una cuantización f16 de ese número de parámetros. Es relevante para desarrolladores que necesitan un modelo ligero y desplegable localmente para asistencia en revisión de código y tareas de seguridad, aunque la información pública disponible es muy limitada y no se han publicado benchmarks ni detalles de entrenamiento.

La ficha se ha elaborado exclusivamente a partir de los metadatos de HuggingFace y del contenido del README; cualquier dato no presente en esa información se indica como "no disponible" para no inferir especificaciones no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia LFM3; detalles no publicados) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 (única variante publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con Ollama y llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo en la información proporcionada. El identificador y la etiqueta `base_model` indican que deriva de la familia LFM3 (Liquid Foundation Models) mediante un adaptador (`appsec-lfm3-cyber-adapter-stage3`), pero no se especifica si el modelo final es un transformer denso, una arquitectura híbrida o si incorpora mecanismos propios de la familia LFM. Tampoco se detalla el proceso de adaptación (fine-tuning supervisado, LoRA, DPO u otro).

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información verificable es que el repositorio contiene una conversión a GGUF f16 del adaptador base, presumiblemente fusionado con el modelo LFM3 subyacente, y que está preparado para inferencia conversacional (etiqueta `conversational`).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que se espera que soporte diálogo multi-turno.
- Asistencia en ciberseguridad: las etiquetas `cybersecurity`, `sast` y `dast` indican un ajuste orientado a análisis estático y dinámico de seguridad de aplicaciones.
- Ejecución local: al estar en formato GGUF, puede ejecutarse con Ollama y llama.cpp sin infraestructura de GPU dedicada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con endpoints de inferencia estándar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Revisión estática de código en local: el modelo puede analizar fragmentos de código y señalar posibles patrones inseguros (inyección SQL, XSS, manejo de secretos) en un flujo SAST, ejecutándose con Ollama en la máquina del desarrollador sin enviar código a servicios externos.
- Asistencia en pipelines de CI/CD: al ser un GGUF ligero de 1,73 B, puede integrarse en un paso de análisis automatizado que comente hallazgos de seguridad en pull requests, con coste de inferencia bajo.
- Formación y concienciación en seguridad: uso como asistente conversacional que explica vulnerabilidades comunes y su mitigación a equipos de desarrollo, aprovechando su ajuste en ciberseguridad.
- Triaje de hallazgos DAST: el modelo puede ayudar a clasificar y priorizar alertas generadas por escáneres dinámicos, redactando resúmenes de riesgo en lenguaje natural.
- Despliegue en entornos air-gapped: al distribuirse como GGUF y ejecutarse con llama.cpp, es adecuado para equipos con requisitos de aislamiento de red donde no se permite usar APIs en la nube.
- Prototipado rápido de asistentes de seguridad: desarrolladores que quieran experimentar con un modelo especializado sin coste de API pueden arrancarlo con `ollama run hf.co/Dhdjxkxdnsbzj/cyber-lfm3-stage3-gguf` y evaluar su comportamiento en tareas concretas.
- Generación de documentación de seguridad: redacción de descripciones de hallazgos y recomendaciones de remediación a partir de informes técnicos, en un contexto de conversación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,73 B parámetros en f16, los pesos ocupan aproximadamente 3,4 GB; se recomienda al menos 4-5 GB de VRAM para margen de contexto y overhead.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, etc.); también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 6 GB o más; en CPU funciona con llama.cpp.
- Opciones de despliegue: Ollama (comando indicado en el README), llama.cpp; no se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría. No se han publicado benchmarks ni especificaciones de contexto que permitan comparar con alternativas como modelos pequeños de seguridad o la familia LFM3 original. Se indica "no disponible".

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card técnica, benchmarks, datos de entrenamiento ni especificaciones de contexto; la evaluación del modelo requiere pruebas empíricas propias.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar explicaciones de vulnerabilidades incorrectas o inventar CVEs y mitigaciones; no debe usarse como única fuente en decisiones de seguridad.
- Sesgos: no disponibles; no se ha documentado el dataset de ajuste ni posibles sesgos.
- Limitaciones de contexto e idioma: no disponibles; no se confirma soporte multilingüe ni longitud de ventana.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el adaptador de origen deben verificarse por separado; el repositorio no detalla obligaciones adicionales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Uso en producción: al ser un modelo de 1,73 B, su capacidad de razonamiento complejo es limitada; conviene validar sus salidas con herramientas deterministas (linters, escáneres) antes de integrarlo en flujos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/Dhdjxkxdnsbzj/cyber-lfm3-stage3-gguf
- Modelo base (adaptador): https://huggingface.co/Dhdjxkxdnsbzj/appsec-lfm3-cyber-adapter-stage3
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
