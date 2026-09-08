# insraq/MiniCPM5-2B-heretic-abliterated

## Resumen

MiniCPM5-2B-heretic-abliterated es una versión modificada del modelo MiniCPM5-2B, desarrollado originalmente por OpenBMB y posteriormente procesado por el usuario insraq. El modelo original es un Transformer denso de aproximadamente 2.516 millones de parámetros, diseñado para ejecución local en dispositivos con recursos limitados (edge AI), con buen rendimiento en tareas de codificación, matemáticas, comprensión de contexto largo, tool calling y flujos agénticos. Esta versión específica ha sido sometida a un proceso de abliteración mediante la herramienta Heretic v1.4.0, que elimina la alineación de seguridad del modelo sin necesidad de un post-entrenamiento costoso.

El resultado es un modelo que mantiene una distribución de salida muy cercana a la del original (KL divergence de 0.0391) pero que reduce drásticamente las respuestas de rechazo: de 99/100 en el modelo original a 5/100 en esta versión. Esto lo hace relevante para aplicaciones que requieren respuestas sin restricciones, así como para la investigación en alineación de modelos. La arquitectura es de tipo Llama (según los tags del repositorio), el tamaño es de 2.516.756.480 parámetros y el contexto está marcado como long-context, aunque no se han especificado los tokens exactos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Llama |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso que sigue la arquitectura de Llama. El modelo original se entrenó con una mezcla de datasets de la familia UltraData de OpenBMB, que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3 y los conjuntos UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. No se han proporcionado números exactos de tokens de entrenamiento en la información disponible.

La innovación técnica de esta versión reside en el proceso de abliteración realizado con Heretic v1.4.0. Heretic es una herramienta que combina una implementación avanzada de ablación direccional (también conocida como abliteration) con un optimizador de parámetros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. Este enfoque permite retirar la alineación de seguridad y las respuestas de rechazo del modelo de forma completamente automática, sin recurrir a entrenamientos adicionales costosos. Según la model card, los parámetros de abliteración se ajustaron por capa, con valores concretos para la proyección de salida de la atención y del MLP.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y resolución de problemas matemáticos, con un rendimiento que según el autor es competitivo con modelos de la clase de 4B.
- Generación de código y soporte para tareas de programación.
- Comprensión de contextos largos, ratificado por la etiqueta long-context.
- Llamada a funciones (tool calling) y soporte de agentes.
- Razonamiento multi-paso y ejecución de tareas agénticas.
- Ejecución local en dispositivos con recursos limitados, diseñado para escenarios on-device.
- Al estar abliterado, responde a prompts que el modelo original rechazaría, manteniendo una calidad de salida muy próxima a la original (KL divergence de 0.0391).

## Casos de uso

- Asistente local en dispositivos edge: al ser un modelo de 2B optimizado para on-device, puede ejecutarse en portátiles o mini-PC sin conexión a Internet, gestionando conversaciones multilingües en inglés y chino con una latencia baja.
- Agente de software con tool calling: puede integrarse en un sistema agéntico que llame a herramientas, APIs o funciones del sistema para automatizar tareas como consulta de bases de datos, envío de mensajes o ejecución de scripts locales.
- Copiloto de código en entornos con privacidad: los desarrolladores pueden ejecutarlo localmente para generar código, corregir errores o explicar fragmentos sin necesidad de enviar el código a servicios externos.
- Análisis de documentación extensa: gracias a su capacidad de contexto largo, puede resumir y extraer información relevante de contratos, informes técnicos o logs de gran tamaño.
- Chatbot bilingüe de soporte: desplegado como servicio de atención al cliente, puede responder en inglés y chino sin coste de API, ideal para entornos con presupuesto limitado.
- Investigación en alineación de modelos: al comparar esta versión abliterada con el modelo original, se puede estudiar el impacto de la eliminación de refusals en la calidad, coherencia y seguridad de las respuestas.
- Tutoría de matemáticas y programación: puede usarse como asistente educativo que responde preguntas técnicas sin restricciones de contenido, siempre que el despliegue sea en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (como MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta métricas comparativas entre esta versión abliterada y el modelo original:

| Métrica | Este modelo | Original (openbmb/MiniCPM5-2B) |
|---|---|---|
| KL divergence | 0.0391 | 0 (por definición) |
| Refusals | 5/100 | 99/100 |

Estos datos han sido proporcionados por el autor del repositorio y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 5 GB, dado que el modelo tiene 2.516.756.480 parámetros. Con cuantización a 4 bits, la VRAM requerida bajaría a cerca de 1,5-2 GB (estimación genérica, ya que no se han publicado los tipos de cuantización disponibles).
- GPU recomendadas: una RTX 3060 de 12 GB es suficiente para ejecutar el modelo en FP16. Para cuantización 4-bit, una RTX 4060 de 8 GB también sería adecuada.
- En servidores, GPU como A10 o L4 pueden desplegar el modelo sin problemas.
- Al ser un modelo de tamaño pequeño, cabe en GPUs de consumo.
- Opciones de despliegue: es compatible con transformers, vLLM y Text Generation Inference (TGI) tal como indica la etiqueta text-generation-inference. También puede convertirse a formato GGUF y ejecutarse con llama.cpp u Ollama, aunque estos formatos no vienen incluidos en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Diferencia principal |
|---|---|---|---|---|
| insraq/MiniCPM5-2B-heretic-abliterated | 2.516.756.480 | no disponible | Apache-2.0 | Abliterado, refusals de 5/100 |
| openbmb/MiniCPM5-2B | 2.516.756.480 | no disponible | Apache-2.0 | Modelo original, refusals de 99/100 |
| openbmb/MiniCPM5-1B | no disponible | no disponible | Apache-2.0 | Versión más pequeña de la misma serie |

No se han encontrado datos de rendimiento comparativos verificados en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado para inglés y chino; no cubre otros idiomas.
- Al ser un modelo de 2B, su capacidad de razonamiento complejo es inferior a la de modelos más grandes y puede alucinar con mayor facilidad en tareas abiertas.
- La abliteración reduce drásticamente las refusals, lo que implica un riesgo elevado de generar contenido dañino, ilegal o poco ético. El usuario es el único responsable del uso que haga del modelo.
- No se han publicado evaluaciones de sesgos para esta versión modificada.
- Las métricas de KL divergence y refusals han sido proporcionadas por el autor y no se han verificado de forma independiente.
- La licencia Apache-2.0 permite el uso comercial, pero el contenido generado por el modelo puede estar sujeto a regulaciones adicionales según el contexto de despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper técnico de MiniCPM: https://arxiv.org/pdf/2506.07900
- Repositorio de GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo online del modelo original: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio de Heretic: https://github.com/p-e-w/heretic
