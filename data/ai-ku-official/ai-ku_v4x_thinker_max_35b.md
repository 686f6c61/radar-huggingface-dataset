# AI-ku-official/AI-ku_V4X_Thinker_Max_35B

## Resumen

AI-ku V4X (Thinker Max) es un modelo de lenguaje denso de 35 000 millones de parámetros presentado por el desarrollador Gl1tch3r bajo la organización AI-ku-official. Según la model card, está diseñado como un modelo agéntico multimodal con capacidades de ejecución autónoma de tareas, e incorpora un mecanismo propietario denominado ACS (AI-ku Context Saver) que, según el autor, permite truncar internamente los pasos de razonamiento históricos para mantener una eficiencia de contexto efectiva casi ilimitada dentro de una ventana declarada de 1 millón de tokens.

El modelo se presenta como una solución para tareas de razonamiento profundo y despliegue agéntico, con soporte nativo de tool calling y una arquitectura de razonamiento dinámico (ToD y UoD). Sin embargo, la información pública disponible es escasa: no se han publicado benchmarks, detalles de entrenamiento, licencia ni especificaciones técnicas verificables. La model card es esencialmente promocional y carece de datos cuantitativos independientes. A fecha de la consulta, el repositorio de Hugging Face muestra cero descargas y cero likes, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card indica "dense parameter model", sin especificar el tipo de transformer) |
| Parametros totales | 35 000 millones (segun el nombre y la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1 000 000 tokens (declarado por el autor, sin verificacion independiente) |
| Tipos de cuantizacion | No disponible (existe una variante GGUF de 50B en el mismo perfil, pero no se especifica para este modelo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de "razonamiento dinamico" con dos modos operativos: ToD (Thinking on Demand), que decide cuándo es necesario un esfuerzo de razonamiento adicional, y UoD (Ultracode on Demand), un modo extremo para tareas de ingeniería crítica que implica verificación adversarial y revisión multi-lente. El sistema ACS (AI-ku Context Saver) se presenta como una innovación que poda monólogos internos obsoletos en el backend mientras conserva las salidas visibles finales y la ventana de contexto de 1M tokens.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, el método de alineación (RLHF, DPO, etc.) ni ninguna otra métrica de entrenamiento. Tampoco se detalla la arquitectura subyacente (número de capas, dimensiones, atención, etc.). La model card menciona integración multimodal para visión y audio, pero no especifica cómo se implementa ni qué componentes se utilizan.

## Capacidades

Según la model card, el modelo ofrece las siguientes capacidades declaradas:

- Razonamiento profundo con cadena de pensamiento (CoT) gestionada internamente, sin necesidad de prompts manuales de tokens de razonamiento.
- Tool calling nativo: invocación estructurada de APIs externas, scripts locales y herramientas a nivel de sistema.
- Modo agéntico: ejecución autónoma de tareas de larga duración (se mencionan tareas de más de 10 horas) gracias al sistema ACS.
- Multimodalidad: soporte declarado para análisis de imagen y vídeo, y reconocimiento de voz/audio mediante integración con herramientas externas (se citan Mert y Whisper).
- Razonamiento dinámico con dos niveles de esfuerzo: ToD para tareas estándar y UoD para tareas de ingeniería crítica.
- Generación de texto y código, con recomendaciones de temperatura baja (0.3-0.5) para tareas de razonamiento y programación.

Es importante señalar que estas capacidades son afirmaciones del autor sin evidencia empírica publicada. No hay demos, ejemplos de uso ni resultados de evaluación que las respalden.

## Casos de uso

Dado que no hay datos de rendimiento verificados, los siguientes casos de uso son hipotéticos, basados en las capacidades declaradas en la model card:

- Agentes autónomos de larga duración: el sistema ACS permitiría mantener conversaciones o ejecutar tareas multi-paso durante horas sin agotar la ventana de contexto, gracias a la poda interna de razonamiento histórico. Sería adecuado para automatización de procesos complejos, aunque no hay evidencia de que funcione en la práctica.
- Asistente de programación con verificación adversarial: el modo UoD podría emplearse para revisión de código crítico, con múltiples pasadas de lógica, seguridad y memoria. Sin benchmarks, no se puede confirmar su eficacia frente a otros modelos de razonamiento.
- Integración con Telegram: la model card menciona un ecosistema "plug & work" que permite desplegar el modelo como bot de Telegram con scripts Python listos para usar. Útil para prototipos de asistentes conversacionales, aunque la falta de documentación técnica dificulta su adopción.
- Generación de contenido multimedia: los hooks preconfigurados para pipelines de generación de imágenes y medios podrían permitir crear asistentes que combinen texto y generación visual, pero no se detalla cómo se implementa.
- Análisis de vídeo e imágenes: la supuesta integración multimodal permitiría tareas de descripción de vídeo o extracción de información visual, pero no hay ejemplos ni métricas de calidad.
- Despliegue en hardware limitado: la recomendación de usar AirLLM para inferencia por capas sugiere que el modelo podría ejecutarse en GPUs con poca VRAM, aunque esto implicaría una latencia muy alta y no es práctico para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que "los benchmarks y métricas de evaluación rigurosas están siendo compilados activamente por el equipo de investigación" y que se publicarán más adelante. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra prueba estándar. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

No hay especificaciones oficiales de hardware. A partir del tamaño declarado (35B parámetros densos), se pueden hacer estimaciones generales orientativas:

- VRAM estimada para inferencia: en FP16, un modelo de 35B requiere aproximadamente 70 GB de VRAM solo para los pesos. Con cuantización de 4 bits, se reduciría a unos 20 GB, y con 8 bits a unos 35 GB. Estas cifras son orientativas y dependen de la implementación.
- GPU recomendadas: para FP16 se necesitarían GPUs de clase A100 (80 GB) o H100. Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser insuficiente si se superan los 20 GB; una RTX A6000 (48 GB) sería más segura.
- En consumer GPU: con cuantización agresiva (4-bit o menos) podría caber en una RTX 4090, pero con riesgo de OOM en tareas largas. La model card recomienda AirLLM para entornos con poca VRAM, que realiza inferencia por capas en CPU/GPU, a costa de una latencia muy alta.
- Opciones de despliegue: la model card menciona compatibilidad con Ollama y AirLLM. No se mencionan vLLM, TGI ni otros motores de alto rendimiento.
- Latencia y throughput: no disponibles. Un modelo de 35B en hardware consumer tendría una latencia de varios segundos por token en el mejor caso, y mucho mayor con AirLLM.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa fiable. El modelo no tiene benchmarks publicados, ni se conocen detalles de su arquitectura o entrenamiento. No se puede comparar con alternativas como Qwen2.5-32B, Llama-3.1-35B o DeepSeek-R1-32B, ya que no hay métricas objetivas. La única información es el tamaño (35B) y la ventana de contexto declarada (1M), que es superior a la mayoría de modelos de su categoría, pero sin validación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks y evaluaciones independientes: no hay forma de verificar las capacidades declaradas. El modelo no ha sido probado por la comunidad (0 descargas, 0 likes).
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial o incluso su uso en proyectos con requisitos legales claros.
- Riesgo de alucinación y errores: al no haber datos de entrenamiento ni alineación, no se puede evaluar la fiabilidad de las respuestas. La model card no menciona ningún proceso de alineación (RLHF, DPO, etc.).
- Afirmaciones no verificadas sobre el sistema ACS: la poda de razonamiento histórico podría degradar la coherencia de las respuestas o perder información relevante, pero no hay evidencia de su funcionamiento.
- Multimodalidad no demostrada: se menciona soporte para visión y audio, pero no se proporcionan ejemplos, pesos de adaptadores ni instrucciones de uso.
- Fecha de creación futura: el modelo fue creado el 1 de julio de 2026 y actualizado el 23 de agosto de 2026, lo que resulta anómalo (fechas posteriores a la actual). Esto sugiere que la información puede ser ficticia o generada automáticamente.
- Riesgo de seguridad: al ser un modelo agéntico con tool calling, si se despliega sin supervisión podría ejecutar acciones no deseadas. No se documentan medidas de seguridad.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/AI-ku-official/AI-ku_V4X_Thinker_Max_35B
- Variante GGUF de 50B (mismo perfil): https://huggingface.co/AI-ku-official/AI-ku_V4X_Thinker_Max_50B_GGUF
- Variante de 4B (mismo perfil): https://huggingface.co/AI-ku-official/AI-ku_V4X_Thinker_Max_4B
- Referencia a GitHub del autor (enlaces TBD en la model card): no disponible
- No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web.
