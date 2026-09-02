# panhouzheng/Qwen3-8B-Jailbroken

## Resumen

El modelo `panhouzheng/Qwen3-8B-Jailbroken` es una variante del modelo Qwen3-8B, desarrollado por el usuario panhouzheng, en la que se ha eliminado el mecanismo de rechazo (refusal) mediante una técnica de ortogonalización de pesos. Esta técnica, descrita en el artículo "Refusal in language models is mediated by a single direction" (Arditi et al., 2024), identifica una dirección en el espacio de activaciones que controla la tendencia del modelo a negarse a responder ciertas solicitudes, y la elimina de los pesos del modelo. El resultado es un modelo que conserva las capacidades lingüísticas y de razonamiento del Qwen3-8B original, pero que no muestra resistencia a generar contenido que el modelo base rechazaría.

El modelo está pensado exclusivamente para investigación académica en seguridad de IA y estudios de alineación. El autor declara explícitamente que no se hace responsable de usos indebidos y que los usuarios deben cumplir con las leyes y directrices éticas aplicables. Con 8.190.735.360 parámetros (8,19 mil millones), es un modelo denso de tamaño medio, adecuado para experimentos en entornos con recursos limitados. La fecha de creación es el 2 de septiembre de 2026 y el repositorio ocupa 16,4 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 32K tokens) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con atención por ventanas deslizantes y atención completa alternadas, entrenado por Alibaba. La modificación introducida por panhouzheng consiste en aplicar una transformación de ortogonalización a los pesos del modelo, siguiendo el método del paper de Arditi et al. (2024). Este método localiza una dirección única en el espacio de representaciones internas que correlaciona con la probabilidad de rechazo, y la proyecta fuera del espacio de pesos. No se ha realizado ningún entrenamiento adicional con datos; se trata de una intervención puramente post-hoc sobre los pesos del modelo base.

El script de implementación está disponible en un gist público (enlace en la sección de enlaces). No se han publicado detalles sobre el dataset utilizado para validar la eliminación del rechazo, ni sobre el proceso de evaluación. El modelo conserva la arquitectura original, por lo que su comportamiento en tareas de generación, razonamiento y código es idéntico al de Qwen3-8B, salvo por la ausencia de respuestas de rechazo.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del Qwen3-8B original, incluyendo comprensión lectora, razonamiento lógico y generación de texto coherente en los 13 idiomas declarados.
- Generación de código: hereda la capacidad de Qwen3-8B para escribir y depurar código en múltiples lenguajes de programación.
- Tool calling y function calling: el modelo base Qwen3-8B soporta tool calling; esta variante conserva esa capacidad, aunque no se ha verificado específicamente en este repositorio.
- Capacidades multilingües: soporta chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Ausencia de rechazo: la característica distintiva es que el modelo no se niega a responder solicitudes que el Qwen3-8B original rechazaría, como peticiones de contenido dañino, ilegal o no ético. Esto lo convierte en una herramienta de estudio para la seguridad de IA, pero también en un riesgo potencial si se usa fuera de entornos controlados.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, analizando patrones de generación de contenido dañino y desarrollando contramedidas.
- Evaluación de técnicas de alineación: sirve como baseline para medir la eficacia de métodos de alineación (RLHF, DPO, etc.) comparando las respuestas con el modelo original.
- Red teaming y pruebas de robustez: los equipos de seguridad pueden usar el modelo para generar ataques adversarios y probar sistemas de filtrado o moderación.
- Análisis de sesgos y comportamientos indeseados: al eliminar el rechazo, se pueden observar sesgos latentes que el modelo base oculta tras respuestas evasivas.
- Desarrollo de métodos de detección de jailbreak: el modelo puede usarse para entrenar clasificadores que identifiquen intentos de jailbreak en otros LLMs.
- Estudio de la direccionalidad en el espacio de activaciones: permite reproducir y ampliar los experimentos del paper de Arditi et al. sobre la mediación del rechazo por una única dirección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base. Dado que la modificación solo afecta a la dirección de rechazo, se espera que el rendimiento en tareas generales sea prácticamente idéntico al de Qwen3-8B, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (16,4 GB), se necesitan al menos 16-20 GB de VRAM para cargar el modelo completo. Con cuantización a 4 bits (no proporcionada en el repositorio, pero posible mediante herramientas como llama.cpp o GPTQ), la VRAM requerida se reduce a aproximadamente 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A10G, A100 40GB) es suficiente. Para cuantización 4-bit, una RTX 3060 de 12 GB o superior puede funcionar.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible ejecutarlo en GPUs de gama media (RTX 3060, 4060, etc.).
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con Transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión).
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 8B en FP16 en una A100 suele generar entre 20 y 40 tokens por segundo, dependiendo de la implementación y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| Qwen3-8B (original) | 8,19 B | 32K | Apache 2.0 | Modelo alineado con rechazo estándar |
| panhouzheng/Qwen3-8B-Jailbroken | 8,19 B | no disponible | no disponible | Mismo modelo sin mecanismo de rechazo |
| cooperleong00/Qwen3-8B-Jailbroken | 8,19 B | no disponible | no disponible | Variante similar, también basada en ortogonalización |

No se dispone de datos comparativos de rendimiento entre estas variantes. La principal diferencia es el comportamiento frente a solicitudes dañinas: el modelo original rechaza, mientras que las versiones jailbroken no lo hacen. No hay información sobre diferencias en calidad de generación o velocidad.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al carecer de mecanismos de rechazo, el modelo puede generar texto violento, ilegal, discriminatorio o sexualmente explícito sin restricciones. Su uso fuera de entornos de investigación controlados es peligroso.
- Sesgos conocidos: hereda los sesgos del Qwen3-8B original, que pueden amplificarse al no existir filtros de seguridad.
- Alucinaciones: como cualquier LLM, puede inventar información, y al no tener rechazo, puede presentar afirmaciones falsas con total confianza.
- Licencia y uso comercial: la licencia no está especificada, pero el autor declara que el modelo es solo para investigación académica. No debe usarse en producción ni en aplicaciones comerciales.
- Limitaciones de contexto: la longitud de contexto no se ha confirmado en este repositorio; se asume la del modelo base (32K), pero no hay garantía.
- Responsabilidad legal: el autor se exime de responsabilidad; los usuarios deben cumplir con las leyes locales y las directrices éticas de su institución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/panhouzheng/Qwen3-8B-Jailbroken
- Script de implementación (gist): https://gist.github.com/cooperleong00/14d9304ba0a4b8dba91b60a873752d25
- Paper de referencia: Arditi, Andy, et al. "Refusal in language models is mediated by a single direction." arXiv preprint arXiv:2406.11717 (2024). https://arxiv.org/abs/2406.11717
- Repositorio similar de cooperleong00: https://huggingface.co/cooperleong00/Qwen3-8B-Jailbroken
- Artículo sobre el riesgo de jailbreak en Qwen3.8: https://www.penligent.ai/hackinglabs/qwen3-8-jailbreak/
