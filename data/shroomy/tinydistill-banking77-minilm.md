# Shroomy/tinydistill-banking77-minilm

## Resumen

tinydistill-banking77-minilm es un clasificador de texto compacto obtenido por destilación de conocimiento (knowledge distillation) a partir de Qwen/Qwen2.5-7B-Instruct como modelo profesor, usando sentence-transformers/all-MiniLM-L6-v2 como arquitectura alumna. Lo desarrolla el usuario Shroomy y está pensado para la tarea de clasificación de intenciones del conjunto de datos Banking77, con 77 etiquetas distintas relacionadas con operaciones bancarias (tarjetas, transferencias, verificación de identidad, recargas, divisas, etc.). El modelo se distribuye exclusivamente en formato ONNX para inferencia rápida en CPU.

La propuesta técnica es sustituir un LLM de 7 000 millones de parámetros por un encoder BERT de tipo MiniLM (6 capas, 384 dimensiones ocultas) que aprende de las etiquetas suaves del profesor sobre los 10 003 textos de entrenamiento de Banking77, además de entropía cruzada sobre 616 textos con etiqueta dorada (8 por clase). El resultado es un clasificador de unos 91 MB en fp32 y 23 MB en int8 que alcanza una exactitud de 0,814 en el conjunto de test (3 080 textos) frente al 0,783 del profesor en modo 8-shot con cuantización de 4 bits.

Su relevancia práctica está en el coste de despliegue: en CPU con 2 hilos y ONNX int8 procesa 881 textos por segundo con una latencia de 1,2 ms por texto en batch 1, lo que lo hace viable para enrutado de intenciones en producción sin GPU. El repositorio es de 0,1 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6, 6 capas, 384 dimensión oculta); exportado a ONNX |
| Parámetros totales | no disponible (el modelo alumno es all-MiniLM-L6-v2, ~22,7 M según la arquitectura base; no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la arquitectura MiniLM base; no declarada en la model card) |
| Tipos de cuantización | ONNX fp32 y ONNX int8 (reportados en la tabla de resultados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a comprobar las licencias del alumno, el profesor y los datos de entrenamiento) |
| Formato de pesos | ONNX (también se menciona el modelo alumno en PyTorch) |

## Arquitectura y entrenamiento

El modelo es una destilación de un LLM decoder-only (Qwen2.5-7B-Instruct) hacia un encoder bidireccional compacto (all-MiniLM-L6-v2), realizada con la herramienta tinydistill. El alumno aprende de dos señales: las etiquetas suaves generadas por el profesor sobre los 10 003 textos de entrenamiento de Banking77 y una pérdida de entropía cruzada sobre 616 textos con etiqueta dorada (8 por clase, peso 1,0). El profesor se ejecuta en modo 8-shot con cuantización de 4 bits y agrupa varios textos por pasada forward.

La innovación principal no está en la arquitectura, sino en el pipeline de destilación y despliegue: el resultado se exporta a ONNX y se publica con la librería tinydistill, que ofrece un `Predictor` en Python y comandos `predict` y `serve`. La model card reporta además un esquema de cascada en el que el alumno responde todas las peticiones y deriva al profesor las de menor confianza, con umbrales calibrados sobre el conjunto de test (en producción deberían fijarse sobre un split de validación). No se documentan detalles sobre el dataset de destilación más allá de Banking77, ni sobre el uso de RLHF o DPO, que no aplican a un clasificador de este tipo.

## Capacidades

- Clasificación de texto en 77 intenciones bancarias predefinidas, entre ellas `activate_my_card`, `cancel_transfer`, `change_pin`, `lost_or_stolen_card`, `top_up_failed`, `verify_my_identity` y `wrong_exchange_rate_for_cash_withdrawal`.
- Salida de etiqueta única con puntuación de confianza, utilizada en la model card para el esquema de cascada hacia el profesor.
- Inferencia en CPU con latencia de 1,2 ms por texto en ONNX int8 y throughput de 881,4 textos/s con 2 hilos.
- Despliegue como servicio HTTP mediante `tinydistill serve`.
- Compatibilidad declarada con text-embeddings-inference y endpoints (tags `text-embeddings-inference` y `endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes; es un clasificador de intenciones, no un modelo generativo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte bancario: el clasificador asigna cada mensaje entrante a una de las 77 intenciones y lo deriva al equipo o flujo correspondiente; su latencia de 1,2 ms en int8 permite clasificar en tiempo real dentro de un pipeline de atención al cliente.
- Triaje previo a un LLM generativo: usar el alumno como primera etapa y enviar solo los casos de baja confianza al profesor Qwen2.5-7B; la tabla de cascada muestra que derivar el 10 % de los textos mantiene una exactitud de 0,818 con un coste mucho menor que consultar al profesor en todos los casos.
- Análisis de motivos de contacto: procesar por lotes históricos de conversaciones para agregar frecuencias por intención (por ejemplo, picos de `card_not_working` o `pending_transfer`) y alimentar dashboards operativos; el throughput de 881 textos/s en CPU hace viable reprocesar volúmenes grandes sin GPU.
- Moderación y priorización de quejas: detectar intenciones sensibles como `compromised_card` o `lost_or_stolen_card` para escalar automáticamente a un agente humano con prioridad alta.
- Clasificación en el borde o en entornos sin GPU: al ocupar 23 MB en int8 y ejecutarse en CPU con 2 hilos, puede desplegarse en contenedores pequeños, funciones serverless o dispositivos con recursos limitados.
- Etiquetado asistido para ampliar datasets: usar las predicciones del modelo para preetiquetar nuevos textos bancarios y revisar solo los casos de baja confianza, reduciendo el esfuerzo de anotación manual.
- Evaluación comparativa de pipelines de destilación: servir como referencia reproducible (semillas, latencias, tamaños) para medir el coste/beneficio de sustituir un LLM por un encoder destilado en una tarea de clasificación concreta.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test de Banking77 (3 080 textos etiquetados):

| Modelo | Dispositivo | Exactitud | Macro-F1 | Acuerdo con el profesor | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamaño (MB) |
|---|---|---|---|---|---|---|---|---|
| Profesor, 8-shot, 4-bit | cuda:0 | 0,783 | 0,779 | n/a | n/a | n/a | n/a | n/a |
| Alumno, PyTorch | cpu | 0,813 ± 0,002 | 0,811 ± 0,003 | 0,868 ± 0,003 | 5,4 | 90,3 | 354,4 | 91 |
| Alumno, ONNX fp32 | cpu | 0,811 | 0,807 | 0,871 | 2,7 | 81,9 | 390,7 | 91 |
| Alumno, ONNX int8 | cpu | 0,814 | 0,811 | 0,871 | 1,2 | 36,3 | 881,4 | 23 |

Cascada alumno primero, textos dudosos al profesor:

| Proporción enviada al profesor | Umbral de confianza del alumno | Exactitud | Macro-F1 |
|---|---|---|---|
| 0 % | 0,153 | 0,814 | 0,811 |
| 10 % | 0,658 | 0,818 | 0,815 |
| 20 % | 0,866 | 0,803 | 0,799 |
| 30 % | 0,948 | 0,797 | 0,793 |
| 50 % | 0,986 | 0,786 | 0,782 |
| 100 % | 1,000 | 0,783 | 0,779 |

Las filas de CPU usan 2 hilos y la latencia es la mediana de ejecuciones repetidas. Los valores con ± son media y desviación típica sobre 3 semillas de entrenamiento; las filas ONNX corresponden al modelo exportado de la primera semilla.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU. En int8 ocupa 23 MB de pesos y en fp32 91 MB, por lo que la memoria necesaria es mínima.
- GPU recomendadas: no disponibles ni necesarias para el alumno; el profesor Qwen2.5-7B-Instruct en 4 bits requiere una GPU con memoria suficiente (no especificada en la información) si se usa en la cascada.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en CPU; no se reportan requisitos de VRAM para el profesor.
- Opciones de despliegue: ONNX Runtime, librería tinydistill (`Predictor`, `predict`, `serve`), text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: con 2 hilos de CPU, 1,2 ms por texto en batch 1 y 881,4 textos/s en ONNX int8; 2,7 ms y 390,7 textos/s en ONNX fp32; 5,4 ms y 354,4 textos/s en PyTorch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud en Banking77 | Licencia | Formato |
|---|---|---|---|---|---|
| tinydistill-banking77-minilm (ONNX int8) | no disponible (base MiniLM-L6) | no disponible | 0,814 | no disponible | ONNX |
| Qwen2.5-7B-Instruct (profesor, 8-shot, 4-bit) | 7 000 M | no disponible en la información | 0,783 | no disponible en la información | safetensors (no confirmado) |
| all-MiniLM-L6-v2 (alumno base sin destilar) | ~22,7 M (según arquitectura) | no disponible | no disponible | no disponible | safetensors / ONNX |

No se dispone de datos de otros clasificadores específicos de Banking77 en la información proporcionada, por lo que la comparativa se limita a los modelos implicados en el pipeline de destilación.

## Limitaciones y advertencias

- Dominio restringido: solo clasifica entre las 77 intenciones de Banking77; cualquier texto fuera de ese conjunto se asignará a una de esas etiquetas aunque no corresponda.
- Licencia no declarada: la model card remite a comprobar las licencias del modelo alumno (all-MiniLM-L6-v2), del profesor (Qwen2.5-7B-Instruct) y de los datos de entrenamiento (Banking77) antes de cualquier uso comercial; no hay garantía explícita de uso comercial.
- Idiomas no declarados: no se especifica qué lenguas cubre; Banking77 es un dataset en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- Sesgos: no documentados en la información disponible; al entrenarse sobre un corpus bancario en inglés, puede heredar sesgos de dominio y de distribución del dataset original.
- Riesgo de alucinación de etiqueta: como todo clasificador cerrado, siempre emite una de las 77 clases, incluidas las de baja confianza; la model card propone usar umbrales de confianza y cascada para mitigarlo.
- Contexto máximo no documentado: no se indica la longitud máxima de entrada soportada por la exportación ONNX.
- Reproducibilidad limitada: los resultados ONNX corresponden solo a la primera semilla; las medias con ± solo están disponibles para PyTorch.
- Umbrales de cascada calibrados sobre test: la propia model card advierte de que en producción deben fijarse sobre un split de validación, no sobre test.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin señales de adopción ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shroomy/tinydistill-banking77-minilm
- Repositorio de tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo alumno base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
