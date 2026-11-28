# diegoriloshe/macdeg_classifier

## Resumen

`macdeg_classifier` es un clasificador de imágenes de fondo de ojo (retinografías) orientado a la detección de degeneración macular asociada a la edad (DMAE, referida en la model card como DMRI en portugués). Lo publica el usuario `diegoriloshe` en Hugging Face bajo la etiqueta `macdeg` y está construido sobre una arquitectura ResNet, según los tags declarados por el autor. No se trata de un modelo generativo ni de un modelo de lenguaje: es un modelo de visión por computador para una tarea médica concreta de clasificación binaria o multiclase sobre imágenes de retina.

La información pública es muy limitada. El repositorio ocupa 0,2 GB y contiene, según la model card, un conjunto de configuraciones privadas de investigación; cada carpeta corresponde a una configuración con cinco redes (ensemble de pliegues de validación cruzada), su umbral de decisión y las métricas de validación cruzada anidada. El autor indica explícitamente que no se publica ningún dato de paciente. La licencia es `other`, sin que se detallen sus términos.

El dato más relevante disponible es la métrica principal reportada: para la configuración `rodada6-01`, un F2 medio por base de 0,810 con intervalo de confianza del 95 % [0,791, 0,829], un AUROC de 0,977 y un umbral de decisión de 0,4440. El modelo fue creado y actualizado el 27 de noviembre de 2026, no tiene descargas ni likes, y no declara pipeline, idiomas ni resultados de benchmarks más allá de las métricas internas de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet (según tags del autor; variante concreta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen; la model card está en portugués) |
| Licencia | other (términos no especificados) |
| Formato de pesos | no disponible (el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en una red ResNet, de acuerdo con los tags declarados en el repositorio. La model card describe una organización en carpetas, cada una correspondiente a una configuración experimental que agrupa cinco redes entrenadas como ensemble de pliegues (*folds*) de una validación cruzada, junto con el umbral de decisión y las métricas de validación cruzada anidada. Esta estructura sugiere un entrenamiento con validación cruzada anidada para estimar de forma menos sesgada el rendimiento en datos no vistos, y un ensemble de cinco modelos por configuración para estabilizar las predicciones en inferencia.

No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, el origen de las retinografías, las técnicas de aumento de datos, la función de pérdida ni si hubo ajuste fino desde pesos preentrenados (por ejemplo, ImageNet). Tampoco se detalla el preprocesado de las imágenes de fondo de ojo ni el esquema de etiquetado de DMAE. La métrica principal declarada es el F2, lo que indica que el autor prioriza el recall sobre la precisión, una elección coherente con el cribado de una patología en la que los falsos negativos son costosos.

## Capacidades

- Clasificación de retinografías para detección de DMAE (DMRI), con salida de probabilidad y umbral de decisión configurable (0,4440 en la configuración `rodada6-01`).
- Inferencia mediante ensemble de cinco redes por configuración, lo que permite promediar predicciones y reducir la varianza.
- Selección de umbral de operación según el compromiso entre sensibilidad y precisión, dado que el autor publica el umbral junto con las métricas.
- No se documentan capacidades de segmentación, detección de lesiones, generación de texto, tool calling, agentes ni multimodalidad texto-imagen.

## Casos de uso

- Cribado automatizado de DMAE en campañas de retinografía: el modelo puede puntuar cada imagen de fondo de ojo y derivar los casos por encima del umbral a revisión oftalmológica, aprovechando el F2 reportado de 0,810 para priorizar recall.
- Triaje en programas de salud pública: con un AUROC de 0,977 en validación, el clasificador puede ordenar una cola de imágenes por probabilidad y permitir que el personal clínico revise primero los casos de mayor riesgo.
- Segunda lectura asistida en consulta: integrar el modelo como apoyo al oftalmólogo, mostrando la probabilidad y el umbral aplicado para cada retinografía y reduciendo lecturas omitidas.
- Investigación en epidemiología de la DMAE: usar el ensemble como herramienta de etiquetado asistido sobre cohortes retrospectivas de retinografías, con revisión humana de los casos límite cercanos al umbral.
- Control de calidad de datasets de imagen retiniana: aplicar el clasificador para detectar imágenes con alta probabilidad de DMAE y verificar la coherencia del etiquetado existente.
- Despliegue en entornos con recursos limitados: al tratarse de una ResNet y ocupar el repositorio 0,2 GB, es viable ejecutarlo en GPU de consumo o incluso en CPU para lotes pequeños, aunque no se publican latencias.

## Benchmarks y rendimiento

| Configuración | F2 medio por base [IC95] | AUROC | Umbral | Publicado |
|---|---|---|---|---|
| `rodada6-01` | 0,810 [0,791, 0,829] | 0,977 | 0,4440 | 2026-11-27 19:19 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros modelos de clasificación de DMAE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,2 GB) sugiere un modelo ligero, compatible con GPU de gama media y posiblemente con CPU.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repositorio, una GPU de consumo (por ejemplo, RTX 3060 o superior) debería ser suficiente, pero es una estimación, no un dato publicado.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: no documentadas. Al ser un modelo de visión basado en ResNet, sería desplegable con frameworks de inferencia estándar (PyTorch, ONNX Runtime), pero el autor no publica instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de DMAE ni con modelos de visión de referencia, y no se detallan parámetros, contexto ni rendimiento de alternativas.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan dataset, procedencia de las imágenes, número de muestras ni metodología de etiquetado, lo que impide evaluar la validez externa del modelo.
- Las métricas reportadas (F2 0,810, AUROC 0,977) provienen de validación cruzada anidada del propio autor; no hay evidencia de validación en cohortes externas ni en otros centros.
- Licencia `other` sin términos especificados: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- El modelo es privado según la model card ("modelos privados de pesquisa"), lo que puede limitar la disponibilidad de pesos y de documentación adicional.
- Riesgo de sesgo por población de entrenamiento no documentada (edad, etnia, equipo de retinografía), con posible degradación en dominios distintos.
- Riesgo de falsos negativos y positivos en los márgenes del umbral; el uso clínico exige revisión humana y no debe sustituir el diagnóstico oftalmológico.
- No se especifican requisitos de preprocesado de imagen, resolución de entrada ni normalización, lo que dificulta reproducir la inferencia.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado, lo que reduce la confianza en la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/diegoriloshe/macdeg_classifier
