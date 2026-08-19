# Justbackup/phi-4-abliterated

## Resumen

Phi-4-abliterated es una adaptación del modelo Phi-4 de Microsoft (14.000 millones de parámetros) creada por el usuario Justbackup mediante la técnica de "abliteration" implementada en la herramienta de código abierto [Orion-zhen/abliteration](https://github.com/Orion-zhen/abliteration). El objetivo de esta modificación es eliminar la dirección de rechazo aprendida durante el alineamiento de seguridad del modelo original, de modo que el modelo deje de negarse explícitamente a responder a ciertas solicitudes. El autor aclara que el resultado no es necesariamente un modelo "sin censura", sino uno que simplemente no rechaza de forma directa; el comportamiento final depende del contexto y del fine-tuning posterior.

El modelo base, Phi-4, es un transformer denso decoder-only de 14B parámetros, entrenado con una mezcla de datos sintéticos de alta calidad, documentos públicos filtrados y libros académicos. Su pipeline de entrenamiento incluye supervisión fina (SFT) y optimización directa de preferencias (DPO) para mejorar la adherencia a instrucciones y la seguridad. Phi-4-abliterated conserva todas las capacidades técnicas del original, pero con un perfil de rechazo alterado, lo que lo convierte en un punto de partida interesante para proyectos de fine-tuning en dominios donde se requiere una respuesta sin restricciones explícitas, siempre dentro de un marco legal y ético.

Este modelo resulta relevante para desarrolladores e investigadores que trabajan en alineamiento de modelos, evaluación de comportamientos de rechazo o que necesitan una base sin los sesgos de seguridad del modelo original para experimentos controlados. Su licencia GPL-3.0 y su disponibilidad en formato safetensors facilitan su integración en pipelines de inferencia y fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (basado en Phi-4) |
| Parámetros totales | 14.659.507.200 (14,66B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se hereda de Phi-4, pero no se especifica en la documentación) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-4-abliterated se construye a partir del modelo base `microsoft/phi-4`, que es un transformer denso decoder-only con 14B parámetros. La arquitectura original de Phi-4 está diseñada para ofrecer un equilibrio entre rendimiento y eficiencia en entornos con restricciones de memoria o latencia. El entrenamiento de Phi-4 combinó datos sintéticos ("textbook-like") con datos públicos filtrados por calidad, libros académicos y datasets de Q&A, con un enfoque en razonamiento avanzado. El proceso de alineamiento incluyó SFT y DPO iterativo para mejorar la utilidad y la seguridad.

La modificación "abliteration" aplicada por Justbackup consiste en identificar y eliminar la dirección de rechazo en el espacio de activaciones del modelo, una técnica que se ha popularizado para reducir la tendencia del modelo a negarse a responder. Este proceso no reentrena el modelo, sino que modifica los pesos o las activaciones de forma quirúrgica. El autor indica que el modelo resultante puede servir como base para fine-tuning adicional, y que la ausencia de rechazo explícito no garantiza la ausencia de contenido problemático.

## Capacidades

- Generación de texto en inglés con razonamiento lógico y matemático, heredado de Phi-4.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Razonamiento de sentido común y conocimiento general del mundo, gracias al entrenamiento con datos sintéticos y académicos.
- Generación de código y soporte para tareas de programación (capacidad heredada de Phi-4, aunque no se detalla en la documentación).
- No se especifica soporte para tool calling, function calling o modos de agente en la información proporcionada.
- Al ser una versión "abliterated", el modelo no rechaza explícitamente solicitudes, lo que puede facilitar su uso en escenarios donde el rechazo del modelo original sería un obstáculo (p. ej., investigación sobre alineamiento o generación de contenido controvertido bajo condiciones controladas).

## Casos de uso

- Fine-tuning para dominios especializados: al carecer de rechazos explícitos, el modelo es un punto de partida adecuado para ajustar con datos propios en áreas como derecho, medicina o creatividad, donde el modelo base podría negarse a responder por políticas de seguridad.
- Investigación en alineamiento y seguridad de IA: permite estudiar el comportamiento de un modelo sin la capa de rechazo, comparando respuestas con el Phi-4 original para analizar el impacto del alineamiento.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas sensibles, siempre que el usuario asuma la responsabilidad del uso.
- Evaluación de robustez ante jailbreaks: al eliminar la dirección de rechazo, se puede probar la eficacia de técnicas de mitigación alternativas.
- Desarrollo de asistentes conversacionales para entornos controlados donde se requiere una respuesta directa sin filtros de seguridad, como simulaciones o entornos de prueba.
- Base para experimentos de desalineamiento controlado: investigadores pueden aplicar técnicas adicionales para estudiar la relación entre rechazo y comportamiento general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para Phi-4-abliterated en la información disponible. El modelo base Phi-4 reporta en su informe técnico resultados competitivos en tareas de razonamiento, matemáticas y código, pero no se incluyen cifras concretas en la model card de esta adaptación. Se recomienda consultar el [informe técnico de Phi-4](https://www.microsoft.com/en-us/research/uploads/prod/2024/12/P4TechReport.pdf) para datos de rendimiento del modelo original.

## Requisitos de hardware

- Con 14,66B parámetros, el modelo requiere aproximadamente 29 GB de memoria en precisión fp16 (formato safetensors). En fp32, el requisito sube a unos 58 GB.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 32 GB de VRAM (p. ej., A100 40GB, H100 80GB, o RTX 4090 con 24 GB si se usa cuantización).
- Es posible ejecutar el modelo en GPUs de consumo como RTX 3090/4090 (24 GB) utilizando cuantización de 8 bits o 4 bits, aunque no se especifican cuantizaciones oficiales en la documentación.
- Para despliegue en producción, se pueden usar motores de inferencia como vLLM, TensorRT-LLM o llama.cpp (si se convierte a GGUF). No se proporcionan datos de latencia o throughput específicos.
- Alternativas de despliegue: Hugging Face Transformers, TGI (Text Generation Inference), o servicios en la nube con GPUs dedicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi-4-abliterated | 14,66B | No disponible | GPL-3.0 | HuggingFace | Sin rechazo explícito |
| microsoft/phi-4 | 14,7B | 128k (según informe técnico) | MIT | HuggingFace | Modelo base con alineamiento de seguridad |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | HuggingFace | Alternativa más pequeña, con rechazos estándar |
| Qwen2.5-14B-Instruct | 14,7B | 32k | Apache 2.0 | HuggingFace | Modelo denso con buenas capacidades multilingües |

La comparativa se basa en características generales; los resultados de rendimiento pueden variar según la tarea. Phi-4-abliterated se distingue por su perfil de rechazo modificado, mientras que las alternativas mantienen los alineamientos originales.

## Limitaciones y advertencias

- El modelo no está censurado de forma explícita, pero puede producir contenido inapropiado, ofensivo o perjudicial. El autor advierte que "abliterated" no implica "uncensored".
- Al estar basado en Phi-4, hereda sus limitaciones: rendimiento inferior en idiomas distintos del inglés, posibles sesgos de representación y estereotipos presentes en los datos de entrenamiento.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- La licencia GPL-3.0 impone obligaciones de copyleft: cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede limitar su uso en productos comerciales cerrados.
- No se proporcionan garantías de seguridad: el modelo no ha pasado por evaluaciones de seguridad adicionales tras la modificación, por lo que su uso en producción requiere una evaluación rigurosa de riesgos.
- El contexto de ventana no está documentado en esta versión; se recomienda consultar el informe técnico de Phi-4 para conocer el límite real (128k tokens según el informe, pero no confirmado en la model card).
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una versión poco probada por la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Justbackup/phi-4-abliterated)
- [Herramienta de abliteration (Orion-zhen/abliteration)](https://github.com/Orion-zhen/abliteration)
- [Informe técnico de Phi-4 (PDF)](https://www.microsoft.com/en-us/research/uploads/prod/2024/12/P4TechReport.pdf)
- [Modelo base microsoft/phi-4](https://huggingface.co/microsoft/phi-4)
