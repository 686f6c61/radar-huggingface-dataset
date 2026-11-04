# Shroomy/tinydistill-banking77-static

## Resumen

tinydistill-banking77-static es un clasificador de texto compacto destilado del modelo Qwen/Qwen2.5-7B-Instruct mediante la herramienta tinydistill y exportado a ONNX para inferencia rápida en CPU. Lo desarrolla el usuario Shroomy y está entrenado específicamente para la tarea banking77 de PolyAI, un conjunto de datos de intenciones de atención al cliente bancaria con 77 clases distintas. El modelo resuelve el problema de clasificar consultas de usuarios en una de esas 77 intenciones con un coste computacional mínimo.

La relevancia del modelo radica en su relación entre precisión y eficiencia: con solo 31 MB de pesos (8 MB en cuantización int8) alcanza una accuracy de 0,802 en el conjunto de test de 3080 textos, superando ligeramente al propio profesor Qwen2.5-7B-Instruct en modo 8-shot 4-bit (0,783). La arquitectura subyacente es un estudiante de tipo "static" (no se detalla en la información disponible si es una bolsa de embeddings, un modelo lineal o una red ligera), y el contexto y los parámetros totales no están especificados en la model card.

El modelo está pensado para despliegues en producción donde la latencia y el coste de CPU son críticos, como la clasificación de tickets de soporte bancario. Su licencia cc-by-4.0 permite uso comercial con atribución, aunque el autor advierte de que deben verificarse las licencias del profesor y del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estudiante "static" destilado, exportado a ONNX (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (también pesos PyTorch originales) |
| Idiomas soportados | no disponible (el dataset banking77 es predominantemente en inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (fp32 e int8) y PyTorch (estado del estudiante) |

## Arquitectura y entrenamiento

El modelo es un estudiante de tipo "static" destilado desde Qwen/Qwen2.5-7B-Instruct, un transformer de 7 mil millones de parámetros. La destilación se realizó con la librería tinydistill, que entrena al estudiante a partir de las etiquetas suaves (soft labels) del profesor sobre los 10 003 textos de entrenamiento de banking77, combinadas con entropía cruzada sobre 616 textos con etiqueta dorada (8 por clase, peso 1,0). El profesor generó sus predicciones en modo 8-shot con 4 bits, mostrando 8 ejemplos dorados por clase en el prompt.

No se especifica en la información disponible la arquitectura interna exacta del estudiante "static" (podría ser un modelo lineal sobre embeddings estáticos, una media de embeddings o similar), ni el número de parámetros, ni la longitud de contexto. La innovación principal es el pipeline de destilación y exportación a ONNX con cuantización int8, que reduce el tamaño a 8 MB manteniendo prácticamente la misma accuracy (0,802 frente a 0,802 en fp32) y un throughput de 6328 textos por segundo en CPU con 2 hilos.

## Capacidades

- Clasificación de texto en 77 clases de intenciones bancarias (por ejemplo, activar tarjeta, límite de edad, Apple Pay, soporte de cajero, recarga automática, transferencias, PIN, tarjetas virtuales, verificación de identidad, etc.).
- Inferencia rápida en CPU: latencia de 0,1 ms por texto en batch 1 y 4,9-5,1 ms en batch 32 (ONNX).
- Alto throughput: más de 6300 textos por segundo en CPU con 2 hilos.
- Destilación de conocimiento desde un LLM de 7B, lo que permite capturar parte del comportamiento del profesor con una fracción del coste.
- Soporte de cascada: el estudiante puede responder todos los textos y derivar los de baja confianza al profesor para mejorar la precisión global.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, multilingüismo ni otras capacidades generativas; es un clasificador puro.

## Casos de uso

- Clasificación de tickets de soporte bancario: el modelo asigna cada consulta entrante a una de las 77 intenciones (por ejemplo, "card_arrival" o "declined_transfer") con 0,1 ms de latencia, lo que permite enrutar automáticamente miles de tickets por segundo en un servidor CPU modesto.
- Enrutamiento en atención al cliente en tiempo real: integrado en un chatbot o sistema de gestión de tickets, clasifica el mensaje del usuario antes de decidir si responde una plantilla o lo escala a un agente humano, usando la confianza del modelo para decidir el escalado.
- Filtrado y priorización de correos electrónicos: en un buzón de soporte, clasifica automáticamente correos en categorías como "lost_or_stolen_card" o "request_refund" para priorizar los casos urgentes.
- Análisis de voz de cliente en centros de llamadas: tras una transcripción ASR, el clasificador etiqueta la intención de cada llamada para generar métricas de motivos de contacto y alimentar dashboards de calidad.
- Moderación y detección de temas sensibles: identifica consultas relacionadas con fraude ("compromised_card", "lost_or_stolen_phone") para activar protocolos de seguridad de forma inmediata.
- Etiquetado masivo de datos históricos: procesa grandes volúmenes de conversaciones archivadas para crear datasets etiquetados que alimenten modelos posteriores o análisis de tendencias, gracias a su throughput de más de 6000 textos por segundo.
- Cascada con LLM para producción: el estudiante clasifica todo el tráfico y solo el 10-30 % de los textos con menor confianza se envían al profesor Qwen2.5-7B, manteniendo una accuracy de 0,801-0,804 con un coste de inferencia muy reducido.

## Benchmarks y rendimiento

| Modelo | Dispositivo | Accuracy | Macro-F1 | Acuerdo con el profesor | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamaño (MB) |
|---|---|---|---|---|---|---|---|---|
| Profesor, 8-shot, 4-bit | cuda:0 | 0,783 | 0,779 | n/a | n/a | n/a | n/a | n/a |
| Estudiante, PyTorch | cpu | 0,803 ± 0,001 | 0,801 ± 0,001 | 0,824 ± 0,001 | 0,2 | 6,0 | 5309,9 | 31 |
| Estudiante, ONNX fp32 | cpu | 0,802 | 0,801 | 0,823 | 0,1 | 4,9 | 6529,4 | 31 |
| Estudiante, ONNX int8 | cpu | 0,802 | 0,801 | 0,823 | 0,1 | 5,1 | 6328,5 | 8 |

Resultados sobre el conjunto de test dorado de banking77 (3080 textos). El profesor se evaluó con 8 ejemplos dorados por clase en el prompt (616 textos). El estudiante se entrenó con etiquetas suaves del profesor sobre los 10 003 textos de entrenamiento más entropía cruzada sobre 616 textos dorados. Las filas ONNX corresponden al primer seed de entrenamiento; las de PyTorch son media y desviación estándar sobre 3 seeds. Las filas de CPU usan 2 hilos y la latencia es la mediana de ejecuciones repetidas.

Cascada (estudiante primero, textos inseguros al profesor):

| Porcentaje enviado al profesor | Umbral de confianza del estudiante | Accuracy | Macro-F1 |
|---|---|---|---|
| 0 % | 0,049 | 0,802 | 0,801 |
| 10 % | 0,336 | 0,801 | 0,799 |
| 20 % | 0,469 | 0,803 | 0,800 |
| 30 % | 0,576 | 0,804 | 0,800 |
| 50 % | 0,787 | 0,793 | 0,789 |
| 100 % | 1,000 | 0,783 | 0,779 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para CPU. En GPU requeriría menos de 1 GB en fp32 (31 MB de pesos) o unos 8 MB en int8.
- GPU recomendadas: no es necesario; cualquier GPU moderna puede ejecutarlo, pero su ventaja está en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos de borde; el tamaño de 8 MB en int8 lo hace apto para entornos con memoria muy limitada.
- Opciones de despliegue: ONNX Runtime (recomendado), la propia librería tinydistill (comandos `predict` y `serve`), y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 0,1 ms por texto en batch 1 y 4,9-5,1 ms en batch 32 en CPU con 2 hilos; throughput de 6328-6529 textos por segundo en ONNX. En PyTorch, 0,2 ms en batch 1 y 6,0 ms en batch 32, con 5310 textos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinydistill-banking77-static (este) | no disponible (31 MB fp32, 8 MB int8) | no disponible | 0,802 (ONNX) | cc-by-4.0 | HuggingFace, ONNX |
| Qwen/Qwen2.5-7B-Instruct (profesor) | 7B | 32 768 tokens (según especificaciones de Qwen2.5) | 0,783 (8-shot, 4-bit) | Apache 2.0 (según Qwen2.5) | HuggingFace, múltiples runtimes |
| Clasificadores lineales o fine-tunes pequeños sobre banking77 | típicamente < 1M | no aplica | no disponible en esta información | variable | HuggingFace, scikit-learn |

No se dispone de datos de benchmarks de otros clasificadores específicos de banking77 en la información proporcionada, por lo que la comparativa con alternativas del mismo tamaño o tarea queda limitada a los datos del profesor y a la referencia genérica de fine-tunes pequeños.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el dominio banking77 (intenciones bancarias en inglés); no es un clasificador general y no debe usarse fuera de ese dominio sin reentrenamiento.
- No se especifican los idiomas soportados; el dataset banking77 es predominantemente en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinación bajo en clasificación, pero puede asignar una clase incorrecta con alta confianza en textos ambiguos o fuera de distribución; se recomienda usar umbrales de confianza y cascada con el profesor.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero el autor advierte de que deben verificarse las licencias del modelo profesor (Qwen2.5-7B-Instruct) y del dataset (PolyAI/banking77) antes de su uso en producción.
- No se detalla la arquitectura interna del estudiante "static", lo que dificulta la auditoría técnica y la reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, por lo que su validación por parte de la comunidad es nula.
- La fecha de creación (2026-11-03) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o un artefacto de la plataforma.
- No se han publicado datos sobre sesgos, robustez ante adversariales ni comportamiento en dominios fuera de banking77.

## Enlaces

- HuggingFace: https://huggingface.co/Shroomy/tinydistill-banking77-static
- Repositorio tinydistill: https://github.com/Andreas-Hum/tinydistill
- Dataset banking77: https://huggingface.co/datasets/PolyAI/banking77
- Modelo profesor Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
