# sii-research/tau-0-vla

## Resumen

τ₀-VLA es un modelo fundacional de robótica de tipo vision-language-action (VLA) desarrollado por sii-research, diseñado como política de bajo nivel dentro de un sistema jerárquico más amplio que incluye modelos de alto nivel, un modelo de mundo y un modelo de valor para búsqueda en tiempo de prueba. El checkpoint publicado corresponde únicamente a la política de bajo nivel preentrenada, pensada como inicialización para post-entrenamiento específico de tarea y embodiment. Está construido sobre el backbone vision-language Qwen3.5-2B, al que se añade un experto de acción basado en Mixture-of-Transformers, entrenado con conditional flow matching. El modelo acepta observaciones RGB multi-vista, instrucciones de lenguaje, metadatos del robot, estado y máscaras, y produce un chunk de acción continuo normalizado de forma 30×40. Se entrenó con 40.115 horas de datos heterogéneos de robots reales con co-entrenamiento multimodal. Con aproximadamente 3.015 millones de parámetros, es un modelo compacto orientado a la investigación y al ajuste fino en robótica, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language backbone (Qwen3.5-2B) + action expert Mixture-of-Transformers |
| Parametros totales | 3.015.404.136 |
| Parametros activos | no disponible (no se especifica si es MoE a nivel de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone de visión-lenguaje Qwen3.5-2B con un experto de acción basado en Mixture-of-Transformers (MoT). El objetivo de entrenamiento es conditional flow matching, un método generativo que modela la distribución de acciones condicionada a observaciones e instrucciones. La inferencia utiliza 10 pasos de flow matching. La entrada incluye observaciones RGB multi-vista, instrucción de lenguaje o subtarea, metadatos del robot, estado y máscaras. La salida es un chunk de acción continuo de 30 pasos temporales × 40 dimensiones, siguiendo un layout unificado de 40 dimensiones que combina posiciones y orientaciones de end-effectors, grippers, cintura, velocidad de chasis y articulaciones de brazos. El entrenamiento se realizó sobre 40.115 horas de datos heterogéneos de robots reales, con co-entrenamiento multimodal. El checkpoint es preentrenado y no incluye los componentes de alto nivel del sistema completo (proposal, reflection, world model, value model), que se describen en el paper.

## Capacidades

- Control robótico de bajo nivel: genera chunks de acción de 30 pasos para robots con dos brazos, grippers, cintura y chasis.
- Soporte multi-embodiment: mediante adaptadores, se puede ajustar a distintos robots (el código incluye un mapeo unificado para el robot G1 AgiBot con doble brazo de 7 grados de libertad).
- Ejecución de subtareas multimodales: integra visión y lenguaje para traducir instrucciones en secuencias de acciones.
- Post-entrenamiento específico: el checkpoint está diseñado para ser afinado en tareas y embodiments concretos, no para uso directo en producción.
- Inferencia con flow matching: 10 pasos de desnoising para generar acciones.
- Formato de entrada/salida unificado de 40 dimensiones con máscaras independientes para estado y acción, lo que permite flexibilidad en qué actuadores están activos.

## Casos de uso

- Investigación en aprendizaje robótico: como punto de partida para estudiar políticas VLA de bajo nivel, comparando arquitecturas y métodos de entrenamiento.
- Post-entrenamiento para tareas de manipulación específicas: por ejemplo, ajustar el modelo en un subconjunto de datos de AgiBot World Beta (como el ejemplo "Strike the gong" incluido en el repositorio) para aprender una tarea concreta.
- Adaptación a nuevos embodiments: usando los adaptadores y plantillas del repositorio, se puede mapear el layout de 40 dimensiones a robots con diferentes configuraciones de brazos, grippers o chasis.
- Desarrollo de sistemas jerárquicos de robótica: integrar esta política de bajo nivel con planificadores de alto nivel, modelos de mundo o búsqueda en tiempo de prueba, como se describe en el paper.
- Evaluación de generalización cross-embodiment: dado que el modelo fue preentrenado con datos heterogéneos, puede servir para estudiar transferencia entre distintos robots.
- Generación de datos sintéticos de acción: el modelo puede usarse para proponer trayectorias en entornos simulados, aunque requiere post-entrenamiento para cada dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper (arXiv:2608.16885) describe evaluación del sistema completo, pero los números concretos no están incluidos en la model card ni en la información proporcionada. No se pueden presentar tablas comparativas sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.015 millones de parámetros en BF16 (2 bytes por parámetro), el peso del modelo ocupa aproximadamente 6 GB. Añadiendo overhead de activaciones y buffers, se estima un mínimo de 8-10 GB de VRAM para inferencia básica.
- GPU recomendadas: tarjetas con al menos 10 GB de VRAM, como RTX 3080/3090, RTX 4090, A100 40GB, o superiores. Para entrenamiento o post-entrenamiento, se recomienda al menos 24 GB de VRAM (RTX 3090/4090, A100, H100).
- Si cabe en consumer GPU: sí, en GPUs de gama alta para consumidores (RTX 3090, 4090) es viable la inferencia y el ajuste fino con batch pequeño.
- Opciones de despliegue: el repositorio oficial proporciona un servidor público y scripts de entrenamiento. No se mencionan integraciones con vLLM, Ollama o TGI. El despliegue requiere el código del repositorio y los artefactos de normalización generados tras el post-entrenamiento.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. Aunque existen modelos como OpenVLA o RT-2, no hay información suficiente en la documentación de τ₀-VLA para realizar una comparación rigurosa en términos de parámetros, contexto, rendimiento o licencia. Se recomienda consultar el paper para obtener comparaciones con el estado del arte.

## Limitaciones y advertencias

- Checkpoint preentrenado, no listo para producción: requiere post-entrenamiento específico de tarea y embodiment, así como los artefactos de normalización y manifiestos generados durante el ajuste fino.
- No incluye los componentes de alto nivel del sistema τ₀-VLA completo (modelos de propuesta, reflexión, mundo y valor). Para usar la búsqueda en tiempo de prueba, hay que implementar esos módulos por separado.
- Dependencia de adaptadores y mapeos: cambiar el orden de cámaras, la máscara o la normalización altera la semántica de las acciones; es imprescindible usar los adaptadores correctos.
- Idiomas limitados: solo se declara inglés como idioma soportado, lo que restringe su uso a instrucciones en ese idioma.
- Riesgo de alucinación y errores de ejecución: como todo modelo generativo, puede producir acciones inválidas o inconsistentes si no se valida adecuadamente en el entorno real.
- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con datos heterogéneos de robots reales, puede heredar sesgos de los entornos de recolección.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es de investigación y su uso en producción requiere validación y adaptación.

## Enlaces

- HuggingFace: https://huggingface.co/sii-research/tau-0-vla
- Paper: https://arxiv.org/abs/2608.16885
- Repositorio GitHub: https://github.com/sii-research/tau-0-vla
- Sitio web del proyecto: https://tau0-vla.github.io/
- Documentación de arquitectura (DeepWiki): https://deepwiki.com/sii-research/tau-0-vla
