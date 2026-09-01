# Mantisec/Ornith-1.5-9B-OBLITERATED-FP16

## Resumen

Ornith-1.5-9B-OBLITERATED-FP16 es una conversión en precisión FP16 del modelo OBLITERATUS/Ornith-1.5-9B-OBLITERATED, que a su vez es una versión sin guardarraíles de seguridad del modelo Ornith-1.5-9B desarrollado por ornith-ai. La conversión ha sido realizada por Mantisec con la herramienta bfsquish v0.1.0, con el objetivo específico de permitir la inferencia y el ajuste fino en GPUs NVIDIA V100 (arquitectura Volta, sm_70), que carecen de soporte nativo para el formato BF16.

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida Qwen3.5 que combina Gated DeltaNet con atención completa en 32 capas transformer, sumando aproximadamente 9,65 mil millones de parámetros. Está orientado a tareas de generación de código, razonamiento, investigación de seguridad, química y tareas agénticas. La versión OBLITERATED elimina quirúrgicamente los mecanismos de rechazo de peticiones, lo que lo convierte en un modelo sin censura, con las implicaciones éticas y legales que ello conlleva.

La relevancia de esta conversión FP16 radica en que amplía la compatibilidad del modelo a hardware Volta, muy presente en entornos de investigación y producción, sin necesidad de recurrir a cuantizaciones agresivas. La validación numérica realizada por el autor confirma una alta fidelidad respecto al modelo fuente, con una tasa de acuerdo de tokens del 99,81 % y una similitud coseno mínima de 0,999951.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: Gated DeltaNet + atención completa en 32 capas |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (conversión oficial); otras cuantizaciones no publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (heredada del modelo fuente) |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B utiliza una arquitectura híbrida Qwen3.5 que intercala capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención completa, distribuidas en 32 capas transformer. Esta combinación busca reducir el coste computacional del mecanismo de atención manteniendo la capacidad de modelar dependencias de largo alcance. Según la documentación de ornith-ai, el modelo incorpora un marco de auto-scaffolding y auto-mejora: propone nuevas tareas, genera andamiajes específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de mejora.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en el modelo base. La conversión FP16 se realizó mediante la estrategia `range_checked` de bfsquish, que convierte los pesos de BF16 a FP32 y luego a FP16 verificando que los valores estén dentro del rango finito de FP16, sin recortes. La validación posterior reporta una diferencia máxima absoluta de logits de 0,3906 frente al modelo fuente, con una tasa de acuerdo de tokens del 99,81 % y ausencia de valores Inf/NaN.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de lógica y resolución de problemas.
- Generación de código en múltiples lenguajes, orientada a entornos de desarrollo y automatización.
- Investigación de seguridad informática: análisis de vulnerabilidades, generación de exploits y pruebas de penetración (al estar sin guardarraíles, no rechaza peticiones maliciosas).
- Soporte de tareas agénticas: el modelo puede integrarse en flujos de trabajo multi-paso que requieren planificación y ejecución de acciones.
- Capacidades en el ámbito de la química: respuesta a preguntas sobre compuestos, reacciones y propiedades químicas.
- Conversación multi-turno, gracias a su naturaleza conversacional declarada en las etiquetas del repositorio.
- Compatibilidad con inferencia y fine-tuning en FP16, específicamente optimizado para GPUs V100 (Volta).

## Casos de uso

- Inferencia en GPUs V100: el modelo está específicamente convertido a FP16 para ejecutarse en V100 de 16 o 32 GB, lo que permite desplegar un LLM de 9,65 B en hardware Volta sin necesidad de cuantización adicional.
- Ajuste fino en entornos Volta: investigadores con acceso a clústeres de V100 pueden fine-tunear el modelo para dominios específicos (por ejemplo, código propietario o documentación técnica) aprovechando la conversión FP16.
- Generación de código en pipelines de CI/CD: el modelo puede integrarse como asistente de programación para autocompletar funciones, generar tests unitarios o documentar APIs, gracias a su capacidad de razonamiento y generación de código.
- Investigación en ciberseguridad: al carecer de guardarraíles, puede utilizarse en entornos controlados para generar payloads, analizar vectores de ataque o redactar informes técnicos de seguridad, siempre bajo supervisión legal y ética.
- Simulación de agentes autónomos: su soporte para tareas agénticas permite construir agentes que planifican y ejecutan secuencias de acciones, por ejemplo en entornos de automatización de procesos o juegos.
- Asistente de química computacional: puede responder preguntas sobre mecanismos de reacción, propiedades de compuestos o ayudar en la redacción de artículos científicos en este dominio.
- Chat conversacional sin restricciones: útil para proyectos que requieren un asistente que no rechace temas sensibles, como investigación académica sobre temas controvertidos o generación de contenido creativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento reportada es la validación numérica de la conversión FP16 frente al modelo fuente, que muestra una tasa de acuerdo de tokens del 99,81 % y una similitud coseno mínima de 0,999951.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,3 GB en FP16, por lo que se recomienda al menos 24 GB de VRAM para cargar los pesos completos. En GPUs con 16 GB (como V100 de 16 GB) sería necesario cuantizar o usar offloading.
- GPU recomendadas: NVIDIA V100 (objetivo principal, sm_70), así como cualquier GPU con soporte FP16 de generaciones posteriores (RTX 20xx, 30xx, 40xx, A100, H100, etc.).
- Compatibilidad con consumer GPU: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) se puede ejecutar en FP16 sin problemas. En tarjetas de 16 GB (RTX 4080, RTX 3080 Ti) se requeriría cuantización a int8 o int4, aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de la familia transformers con pesos en safetensors, es compatible con Hugging Face Transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B (original) | 9,65 B | no disponible | Qwen3.5 híbrida | no disponible | Hugging Face |
| OBLITERATUS/Ornith-1.5-9B-OBLITERATED | 9,65 B | no disponible | Qwen3.5 híbrida | no disponible | Hugging Face |
| Mantisec/Ornith-1.5-9B-OBLITERATED-FP16 | 9,65 B | no disponible | Qwen3.5 híbrida | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos para comparar con otros modelos de tamaño similar (por ejemplo, Llama-3.1-8B o Qwen2.5-7B) en términos de rendimiento, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Modelo sin guardarraíles: la versión OBLITERATED elimina los mecanismos de rechazo de peticiones dañinas o ilegales. Su uso conlleva riesgos legales y éticos, especialmente en contextos de seguridad ofensiva o generación de contenido inapropiado.
- Conversión FP16: aunque la validación muestra alta fidelidad, existe una diferencia máxima absoluta de logits de 0,3906 respecto al modelo fuente, lo que puede provocar discrepancias en generaciones largas o sensibles al contexto.
- Licencia no especificada: la model card indica que la licencia se hereda del modelo fuente, pero no se ha publicado el texto exacto. Es necesario verificar los términos de uso antes de cualquier despliegue comercial.
- Idiomas soportados: no se ha documentado oficialmente, aunque al estar basado en Qwen3.5 es probable que tenga soporte multilingüe, pero no se puede confirmar.
- Longitud de contexto: no se ha especificado, lo que limita la planificación de aplicaciones que requieran ventanas de contexto largas.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.), lo que dificulta la evaluación comparativa con otros modelos.
- Riesgo de alucinación: al ser un modelo sin ajuste específico de seguridad, puede generar información falsa o inventada con mayor facilidad en dominios donde no ha sido entrenado.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/Mantisec/Ornith-1.5-9B-OBLITERATED-FP16
- Modelo fuente (OBLITERATUS): https://huggingface.co/OBLITERATUS/Ornith-1.5-9B-OBLITERATED
- Modelo original (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-9b-obliterated-obliteratus
- Ficha en LLM Explorer: https://llm-explorer.com/model/OBLITERATUS%2FOrnith-1.5-9B-OBLITERATED,32UZCQM5qLnHySNoUdeIlW
