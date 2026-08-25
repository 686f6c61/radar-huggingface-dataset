# jacobbabula/bailiwick-misty-qwen3-0.6b-v20

## Resumen

Bailiwick Misty Qwen3 0.6B v20 es un modelo de lenguaje compacto desarrollado por jacobbabula para Bailiwick, una aplicación educativa de tutoría de idiomas. Se trata de un ajuste fino del modelo Qwen/Qwen3-0.6B, optimizado para conversaciones cortas de tutoría en inglés y español dirigidas a estudiantes de primaria. El modelo se distribuye en formato ONNX cuantizado a 4 bits, diseñado específicamente para inferencia local en navegador mediante WebGPU y la librería Transformers.js.

La relevancia de este modelo reside en su enfoque en la privacidad y la portabilidad: permite ejecutar un asistente de aprendizaje de idiomas sin enviar datos a servidores externos, todo dentro del navegador del usuario. Al basarse en Qwen3, hereda la arquitectura densa de 0.6 mil millones de parámetros y el soporte para modos de pensamiento y no pensamiento, aunque en esta versión el uso se restringe a conversaciones de tutoría cortas.

La licencia Apache-2.0 facilita su adopción en proyectos comerciales y educativos, y el proyecto público en GitHub documenta el proceso de entrenamiento y las limitaciones de uso, posicionando el modelo como una pieza de un sistema mayor que incluye controles de contexto y seguridad por parte de la aplicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se hereda del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | Q4 (4 bits) en formato ONNX |
| Idiomas soportados | Inglés y español (enfoque de tutoría) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnx/model_q4.onnx y onnx_data) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-0.6B, un transformer denso de 0.6 mil millones de parámetros. La arquitectura Qwen3 incorpora un modo de pensamiento (thinking) para razonamiento multi-paso y un modo de no pensamiento para respuestas rápidas, aunque en esta variante de Bailiwick se prioriza la conversación directa y corta de tutoría. El entrenamiento se realizó exclusivamente con datos sintéticos de tutoría bilingüe (inglés y español), sin utilizar conversaciones reales de estudiantes ni datos personales. El proceso incluyó un ajuste fino con adaptadores, y el checkpoint seleccionado es la versión v20 checkpoint 4. No se mencionan técnicas como RLHF o DPO; el modelo se basa en el ajuste supervisado con ejemplos sintéticos.

La exportación a ONNX y la cuantización a 4 bits permiten su ejecución eficiente en entornos WebGPU, con un tamaño de repositorio de 1.0 GB. El modelo está pensado para ser cargado por la librería Transformers.js directamente desde la raíz del repositorio.

## Capacidades

- Generación de texto en inglés y español para conversaciones de tutoría cortas.
- Cambio de idioma y recuperación ante confusiones en la interacción.
- Explicaciones de conceptos y correcciones gramaticales o léxicas.
- Pequeñas comprobaciones de práctica para evaluar el aprendizaje.
- Inferencia local en navegador mediante WebGPU, sin conexión a servidores externos.
- No soporta tool calling ni funciones de agente; está limitado al ámbito de tutoría conversacional.

## Casos de uso

- Tutor de idiomas en el navegador: la aplicación Bailiwick integra el modelo para ofrecer conversaciones de práctica en inglés y español a estudiantes de primaria, con respuesta inmediata y sin latencia de red.
- Aprendizaje autónomo sin conexión: al ejecutarse localmente, los estudiantes pueden practicar sin conexión a internet, lo que facilita el uso en entornos con conectividad limitada.
- Asistente de corrección en tiempo real: el modelo puede señalar errores y ofrecer explicaciones sencillas, integrado en un sistema que valida la salida visible.
- Práctica de cambio de idioma: permite alternar entre inglés y español en la misma conversación, útil para estudiantes que aprenden ambas lenguas.
- Entorno de demostración educativa: por su pequeño tamaño y licencia Apache-2.0, sirve como ejemplo de implementación de modelos de lenguaje en aplicaciones educativas de bajo coste.
- Evaluación de currículo controlado: la aplicación proporciona el contexto curricular y el modelo responde según ese contexto, lo que permite mantener la coherencia pedagógica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta los siguientes resultados de validación interna del sistema Bailiwick:

- Validación bruta: 62/64 casos correctos.
- Comportamiento de recuperación: 16/16 casos correctos.
- Suite de pruebas de IA de la aplicación: 245/245 pruebas superadas.
- Prueba de WebGPU nativa del navegador: superada con el artefacto q4 sin errores.

Estos resultados describen el comportamiento del sistema completo, no del modelo aislado, y no deben interpretarse como una medida de precisión general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo cuantizado a 4 bits ocupa aproximadamente 0.3 GB (300 MB) en memoria, pero no se ha confirmado el tamaño exacto del artefacto ONNX. Se estima que puede ejecutarse en GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU compatible con WebGPU, como integradas de Intel, AMD o NVIDIA (por ejemplo, Intel UHD Graphics, AMD Radeon Vega, NVIDIA GTX 1650 o superior).
- Compatibilidad con GPU de consumo: sí, dado su tamaño reducido y cuantización Q4, es apto para portátiles y equipos de gama baja.
- Opciones de despliegue: Transformers.js con WebGPU en navegador (Chrome, Edge, Firefox con soporte experimental), también puede ejecutarse en Node.js con ONNX Runtime, aunque el diseño principal es web.
- Latencia y throughput: no se proporcionan datos concretos, pero al ser un modelo de 0.6B en GPU, se espera una latencia de pocos milisegundos por token en hardware moderado.

## Comparativa con modelos similares

No se dispone de comparativa con otros modelos en la información proporcionada. Se puede mencionar que el modelo base Qwen3-0.6B es la referencia principal, pero no se aportan datos de rendimiento comparativo.

## Limitaciones y advertencias

- No debe utilizarse para calificar a los estudiantes ni como respuesta definitiva de respuestas; la aplicación externa es responsable de la validación y el contexto.
- El modelo se ha entrenado con datos sintéticos, por lo que puede presentar sesgos derivados de la generación artificial y no cubrir todos los matices de la lengua real.
- Riesgo de alucinación en explicaciones o correcciones; el sistema debe verificar la salida con el currículo revisado.
- Solo está orientado a conversaciones cortas; no es adecuado para tareas complejas de razonamiento o generación de contenido extenso.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda no delegar decisiones de evaluación importantes al modelo.
- La dependencia de WebGPU limita su ejecución en navegadores que no soporten esta tecnología (por ejemplo, Safari en versiones antiguas).

## Enlaces

- HuggingFace: https://huggingface.co/jacobbabula/bailiwick-misty-qwen3-0.6b-v20
- GitHub (model card y documentación): https://github.com/jacobbabula/bailiwick-misty-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388v1
- Guía de Qwen3 (para referencia): https://insiderllm.com/guides/qwen3-complete-guide/</think>## Resumen

Bailiwick Misty Qwen3 0.6B v20 es un modelo de lenguaje compacto desarrollado por jacobbabula para la aplicación educativa Bailiwick, orientado a la tutoría bilingüe de inglés y español para estudiantes de primaria. Se trata de un ajuste fino del modelo base Qwen/Qwen3-0.6B, exportado a formato ONNX y cuantizado a 4 bits para su ejecución local en navegador mediante WebGPU y la librería Transformers.js. El modelo está diseñado para mantener conversaciones cortas, cambiar de idioma, recuperar confusiones, dar explicaciones y realizar pequeñas comprobaciones de práctica.

La relevancia de este modelo radica en su enfoque en la privacidad y la inferencia local: no se envían datos de estudiantes a servidores externos, lo que lo hace adecuado para entornos educativos con requisitos de protección de datos. Además, su tamaño reducido (0.6B parámetros) y su cuantización a 4 bits permiten ejecutarlo en GPU de consumo y en navegadores compatibles con WebGPU. El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso y modificación.

El proyecto documenta de forma transparente su proceso de entrenamiento, limitaciones y resultados de validación, posicionándolo como una pieza de un sistema mayor donde la aplicación controla el contexto curricular y valida la salida. No está diseñado para funcionar como un modelo independiente de calificación o generación de respuestas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) |
| Parametros totales | 0.6 mil millones (0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se hereda del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | Q4 (4 bits) en formato ONNX |
| Idiomas soportados | Inglés y español (enfoque de tutoría) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnx/model_q4.onnx y onnx/model_q4.onnx_data) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-0.6B, un transformer denso de 0.6 mil millones de parámetros. Qwen3 introduce modos de pensamiento y no pensamiento para razonamiento complejo, pero en esta variante se prioriza la respuesta conversacional directa y la tutoría corta. El entrenamiento se realizó mediante ajuste fino supervisado con datos sintéticos de tutoría bilingüe (inglés y español), sin utilizar conversaciones reales de estudiantes, identidades ni calificaciones. El adaptador seleccionado es el checkpoint 4 de la versión v20.

La exportación a ONNX y la cuantización a 4 bits permiten su ejecución eficiente en WebGPU, con un tamaño de repositorio de 1.0 GB. No se han documentado técnicas como RLHF o DPO; el modelo se basa en ejemplos sintéticos generados para el contexto educativo. La validación interna reporta 62/64 casos correctos en validación bruta, 16/16 en recuperación de confusiones y 245/245 pruebas de la suite de IA de la aplicación.

## Capacidades

- Generación de texto conversacional en inglés y español para tutoría de nivel elemental.
- Cambio de idioma y recuperación de confusiones dentro de un diálogo.
- Explicaciones de conceptos y correcciones de errores en el discurso del estudiante.
- Pequeñas comprobaciones de práctica (preguntas de opción múltiple o respuestas cortas).
- Inferencia local en navegador mediante WebGPU con Transformers.js.
- No incluye soporte para tool calling ni funciones de agente.
- No está diseñado para tareas de razonamiento complejo ni generación de código.

## Casos de uso

- Tutor de idiomas en el navegador: el modelo se integra en Bailiwick para mantener conversaciones de práctica en inglés y español, con respuesta local y sin latencia de red, ideal para aulas con conexión limitada.
- Asistente de aprendizaje autónomo: los estudiantes pueden practicar de forma individual en casa, con explicaciones y correcciones generadas localmente, respetando la privacidad de sus datos.
- Práctica de cambio de idioma: el modelo permite alternar entre inglés y español en la misma conversación, útil para estudiantes que aprenden ambos idiomas simultáneamente.
- Recuperación de errores en diálogo: cuando el estudiante se confunde o da una respuesta incorrecta, el modelo puede reformular la pregunta o proporcionar pistas, ayudando a mantener la fluidez.
- Ejercicios de comprensión auditiva: aunque no procesa audio, puede generar respuestas a preguntas de comprensión basadas en textos leídos por el estudiante.
- Prototipo de tutoría educativa en entornos de investigación: por su licencia Apache-2.0 y su pequeño tamaño, sirve como base para experimentos de sistemas de tutoría local en proyectos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta los siguientes resultados de validación interna del sistema Bailiwick:

| Prueba | Resultado |
|---|---|
| Validación bruta | 62/64 casos |
| Recuperación de confusiones | 16/16 casos |
| Suite de IA de la aplicación | 245/245 pruebas |
| Smoke de WebGPU nativo | Pasado |

Estos resultados corresponden al sistema completo de Bailiwick (modelo más controles de la aplicación), no al modelo de forma aislada, y no deben interpretarse como una medida de precisión general.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 4 bits ocupa aproximadamente 0.3 GB en pesos, pero se recomienda al menos 1 GB de VRAM para la inferencia en navegador. El tamaño total del repositorio es de 1.0 GB.
- GPU recomendadas: cualquier GPU compatible con WebGPU, como Intel UHD Graphics (11ª generación), AMD Radeon Vega, NVIDIA GTX 1650 o superior. También puede funcionar en GPUs integradas de portátiles modernos.
- Compatibilidad con GPU de consumo: sí, es apt para equipos de gama media y baja, siempre que el navegador soporte WebGPU (Chrome, Edge, Firefox con flag experimental).
- Opciones de despliegue: Transformers.js con WebGPU para navegador; también puede ejecutarse en Node.js con ONNX Runtime, aunque el diseño principal es web.
- Latencia y throughput: no se han publicado datos concretos, pero al ser un modelo de 0.6B, se espera una generación de varios tokens por segundo en GPU de consumo.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de la misma categoría (tamaño y tarea). El modelo base Qwen3-0.6B es la referencia más directa, pero no se han publicado resultados comparativos de este ajuste fino frente a otros modelos de tutoría o de tamaño similar.

## Limitaciones y advertencias

- No debe utilizarse para calificar estudiantes ni para generar respuestas de respuestas de forma autónoma; la aplicación Bailiwick es la que controla el contexto y valida la salida.
- El entrenamiento se realizó con datos sintéticos, lo que puede limitar su robustez ante preguntas o expresiones reales no cubiertas.
- Riesgo de alucinación en explicaciones o correcciones, especialmente en temas fuera del ámbito de tutoría elemental.
- Longitud de contexto no especificada; se hereda del modelo base, pero el uso previsto es de conversaciones cortas.
- Restricciones de idioma: solo inglés y español, y con un vocabulario limitado a niveles educativos básicos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no recomienda su uso sin integración en un sistema de validación curricular.
- Dependencia de WebGPU para su ejecución en navegador; navegadores sin soporte WebGPU no podrán cargar el modelo.

## Enlaces

- [HuggingFace - Bailiwick Misty Qwen3 0.6B v20](https://huggingface.co/jacobbabula/bailiwick-misty-qwen3-0.6b-v20)
- [GitHub - Documentación y model card](https://github.com/jacobbabula/bailiwick-misty-qwen3-0.6b)
- [Qwen/Qwen3-0.6B en HuggingFace](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Qwen3 Technical Report (arXiv)](https://arxiv.org/html/2505.09388v1)
- [Guía completa de Qwen3 (referencia externa)](https://insiderllm.com/guides/qwen3-complete-guide/)
