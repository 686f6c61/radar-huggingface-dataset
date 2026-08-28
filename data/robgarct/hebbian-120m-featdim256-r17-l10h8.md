# robgarct/hebbian-120m-featdim256-r17-l10h8

## Resumen

El modelo `robgarct/hebbian-120m-featdim256-r17-l10h8` es un experimento de investigación publicado en Hugging Face por el autor robgarct, dentro del repositorio HazyResearch/mlp-mixer. Se trata de un MLP-Mixer de 120 millones de parámetros con un mecanismo de atención hebbiana y atención lineal, diseñado para estudiar la localización de la capacidad de *in-context recall* (recuperación de información dentro del contexto) en una única cabeza de atención. El modelo es una variante fine-tuneada denominada FT-(L10H8), donde solo se entrena la capa 10, cabeza 8, de un total de 144 cabezas, modificando únicamente 14 tensores (0,18% del modelo) respecto a la versión base.

Este trabajo es relevante porque aborda la interpretabilidad de los modelos de atención lineal, un área activa en la investigación de arquitecturas eficientes. Al aislar una sola cabeza responsable del recall, se puede analizar el mecanismo interno de forma más directa, lo que puede contribuir al diseño de modelos más interpretables y al desarrollo de técnicas de edición de conocimiento. El modelo está pensado como una herramienta de estudio, no como un producto listo para producción, y su uso principal es académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP-Mixer con atención hebbiana y atención lineal |
| Parametros totales | 120 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el tamaño del repo y la librería mlp-mixer) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MLP-Mixer, que sustituye la atención por operaciones de mezcla de tokens y canales mediante MLPs. En esta variante se incorpora un mecanismo de atención hebbiana (aprendizaje basado en la regla de Hebb) y atención lineal, lo que reduce la complejidad computacional respecto a la atención softmax tradicional. El modelo tiene 120 millones de parámetros, con una dimensión de características de 256 y una configuración de 10 capas y 8 cabezas (aunque la model card indica que hay 144 cabezas en total, lo que sugiere que la configuración real es de 18 capas y 8 cabezas, o similar). El entrenamiento consistió en un fine-tuning sobre una versión base, utilizando un objetivo de *recall* (recuperación de información) y entrenando únicamente la capa 10, cabeza 8, con una tasa de aprendizaje de 5e-4. Según la model card, el modelo difiere de la base en exactamente 14 tensores, todos bajo `layers.10.mixer`, lo que representa el 0,18% del total de parámetros. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de texto: el modelo es capaz de generar texto, aunque su objetivo principal es el estudio del *in-context recall*.
- Razonamiento: no se especifican capacidades de razonamiento complejo; está diseñado para tareas de recuperación de información en contexto.
- Código: no hay evidencia de soporte específico para generación de código.
- Matemáticas: no hay datos sobre rendimiento en tareas matemáticas.
- Tool calling / function calling: no disponible.
- Soporte para agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el modelo implementa atención hebbiana y lineal, lo que le permite procesar secuencias con complejidad lineal en la longitud del contexto, aunque no se especifica la longitud máxima.

## Casos de uso

- Investigación en interpretabilidad de modelos: el modelo es útil para estudiar cómo una única cabeza de atención puede implementar la recuperación de información en contexto. Los investigadores pueden analizar los pesos de la capa 10, cabeza 8, para comprender el mecanismo interno.
- Análisis de mecanismos de atención lineal: sirve como banco de pruebas para validar teorías sobre el funcionamiento de la atención hebbiana y lineal en tareas de recall.
- Desarrollo de técnicas de edición de conocimiento: al localizar una cabeza específica responsable del recall, se pueden probar métodos de modificación de pesos para alterar el comportamiento del modelo de forma controlada.
- Benchmark de eficiencia: al ser un modelo pequeño (120M), puede utilizarse para comparar el rendimiento de arquitecturas lineales frente a transformers tradicionales en tareas de memoria a corto plazo.
- Educación en arquitecturas alternativas: permite a estudiantes y desarrolladores explorar una implementación concreta de MLP-Mixer con atención hebbiana, facilitando el aprendizaje práctico.
- Reproducción de experimentos: el modelo está disponible públicamente, por lo que puede usarse para reproducir los resultados del estudio de localización de cabezas en el repositorio HazyResearch/mlp-mixer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y la búsqueda web no arrojó datos adicionales. Este modelo es un artefacto de investigación, no un modelo de propósito general, por lo que su rendimiento en tareas estándar no está documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 120M parámetros, el peso en fp32 ocupa aproximadamente 480 MB. Con cuantización a 8 bits, podría reducirse a ~120 MB, y a 4 bits a ~60 MB. Por tanto, cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso CPU (con llama.cpp u Ollama) para inferencia básica.
- Si cabe en consumer GPU: sí, sin problema.
- Opciones de despliegue: dado que el formato de pesos no está claramente especificado, se puede asumir que es compatible con librerías como PyTorch (si los pesos están en safetensors). Para despliegue eficiente, se podría convertir a GGUF para usar con llama.cpp u Ollama, aunque no hay garantía de compatibilidad sin conversión manual.
- Latencia y throughput: no se dispone de datos medidos. Al ser un modelo pequeño, la latencia será baja en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables. El modelo pertenece a una línea de investigación específica (MLP-Mixer con atención hebbiana) y no hay alternativas comerciales o de código abierto con las mismas características documentadas en la información proporcionada. Se podría comparar con otros modelos pequeños de atención lineal (como los basados en Mamba o RetNet), pero no se tienen datos concretos de rendimiento ni arquitectura para establecer una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo para sesgos; al ser un modelo de investigación, no se han realizado auditorías de sesgo.
- Riesgo de alucinación: no se ha medido, pero al ser un modelo pequeño entrenado con un objetivo específico, es probable que tenga una capacidad limitada de generación coherente y pueda producir salidas incorrectas.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se desconoce si soporta secuencias largas.
- Limitaciones de idioma: no se ha indicado qué idiomas soporta; probablemente esté entrenado mayormente con datos en inglés, pero no hay confirmación.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial o la redistribución. Se recomienda contactar al autor antes de cualquier uso fuera de investigación.
- Caveat para producción: este modelo no está pensado para uso en producción. Es un artefacto de investigación para estudiar la localización de cabezas de atención. No se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/robgarct/hebbian-120m-featdim256-r17-l10h8
- Repositorio HazyResearch/mlp-mixer (mencionado en la model card, sin URL directa): se puede buscar en GitHub como "HazyResearch/mlp-mixer" para acceder al código del estudio.
