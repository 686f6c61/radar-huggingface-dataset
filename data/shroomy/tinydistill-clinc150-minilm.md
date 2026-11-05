# Shroomy/tinydistill-clinc150-minilm

## Resumen

tinydistill-clinc150-minilm es un clasificador de texto de 151 clases destilado por el usuario Shroomy a partir de Qwen/Qwen2.5-7B-Instruct como profesor y sentence-transformers/all-MiniLM-L6-v2 como alumno. El modelo resultante se exporta a ONNX para inferencia rápida en CPU y se distribuye con la librería tinydistill, que permite cargarlo mediante un `Predictor` o servirlo por línea de comandos. El dominio de aplicación es la clasificación de intenciones (intent classification) del dataset CLINC150, típico de asistentes conversacionales de dominio bancario y de servicios.

La relevancia del modelo está en su relación coste/rendimiento: un transformer de 22,7 millones de parámetros que alcanza un 57,5 % de accuracy y un 60,7 % de macro-F1 en el test de CLINC150, frente al 58,1 % y 61,6 % de su profesor zero-shot cuantizado a 4 bits, con una aceleración de 23,3x en batch 1 y 55x en la variante int8. El tamaño del artefacto ONNX int8 es de 23 MB, lo que lo hace desplegable en entornos con recursos muy limitados.

El modelo no incluye generación de texto ni razonamiento: es exclusivamente un clasificador de secuencias con una etiqueta de salida entre 151 posibles, incluida la clase `oos` (out-of-scope) para consultas fuera de dominio. La model card no especifica los idiomas soportados, aunque el dataset de entrenamiento (CLINC150) es mayoritariamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, base all-MiniLM-L6-v2), exportado a ONNX |
| Parametros totales | 22,7 M (heredados de all-MiniLM-L6-v2; no confirmado explícitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base all-MiniLM-L6-v2 admite 256 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 |
| Idiomas soportados | no disponible |
| Licencia | cc-by-3.0 |
| Formato de pesos | ONNX (fp32 e int8); también pesos PyTorch para el alumno |

## Arquitectura y entrenamiento

El alumno es un transformer encoder BERT de tipo MiniLM (all-MiniLM-L6-v2), con 6 capas y 384 dimensiones ocultas, adaptado a una cabeza de clasificación de 151 etiquetas. El profesor es Qwen/Qwen2.5-7B-Instruct, un modelo decoder-only de 7 mil millones de parámetros, utilizado en modo zero-shot y cuantizado a 4 bits. La destilación se realiza con la herramienta tinydistill y sigue un esquema de knowledge distillation pura sobre etiquetas suaves: el alumno aprende únicamente de las predicciones del profesor sobre 15 250 textos de entrenamiento sin etiquetar, sin usar las etiquetas doradas del conjunto de entrenamiento.

El profesor puntúa solo las 20 etiquetas más similares a cada texto más la clase `oos`; la etiqueta dorada quedó entre esas candidatas en el 96,8 % de los textos de test, lo que acota el techo teórico del proceso. Cada alumno reserva un 5 % de los textos de entrenamiento como validación y conserva la época con menor pérdida (hasta 10 épocas, parada temprana tras 3 sin mejora); las épocas conservadas fueron la 9 y la 10. Se entrenaron tres semillas y se reportan media y desviación típica. La exportación a ONNX se hizo sobre el modelo de la primera semilla. No se menciona uso de RLHF, DPO ni datos anotados manualmente en el pipeline.

## Capacidades

- Clasificación de texto en 151 intenciones del dominio CLINC150 (banca, viajes, restaurantes, utilidades, small talk).
- Detección de consultas fuera de dominio mediante la clase `oos`.
- Inferencia en CPU con latencias de milisegundos: 1,6 ms por texto en batch 1 y 29,0 ms en batch 32 con ONNX int8.
- Throughput de hasta 1103,9 textos por segundo con ONNX int8 en CPU de 2 hilos.
- Integración con la librería tinydistill (`Predictor`, CLI `predict` y `serve`).
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: clasificar cada turno del usuario en una de las 151 intenciones para derivarlo al flujo o API correspondiente, con la clase `oos` para derivar a un fallback o a un modelo mayor.
- Filtrado previo en pipelines RAG o de agentes: descartar o etiquetar consultas antes de invocar un LLM costoso, reduciendo el número de llamadas al modelo grande.
- Moderación y triaje de tickets de soporte: clasificar mensajes entrantes por temática (facturación, tarjetas, viajes, cuentas) para asignarlos a colas o equipos.
- Despliegue en edge o entornos sin GPU: el artefacto ONNX int8 de 23 MB cabe en dispositivos con poca memoria y se ejecuta en CPU con latencia sub-10 ms.
- Cascada con el profesor: usar el alumno como primera etapa y enviar solo el 10-30 % de textos menos confiados a Qwen2.5-7B-Instruct, manteniendo accuracy en torno al 58,4-58,6 % con latencias medias de 10,3-27,8 ms por texto.
- Clasificación por lotes offline: procesar grandes volúmenes de textos (logs, encuestas, reseñas) con throughput superior a 1000 textos/s en CPU.
- Prototipado rápido de clasificadores de intenciones: servir el modelo con `tinydistill serve` para validar un esquema de etiquetas antes de invertir en anotación o en un modelo mayor.

## Benchmarks y rendimiento

Resultados sobre el test dorado de CLINC150 (5500 textos). El profesor es Qwen2.5-7B-Instruct zero-shot en 4 bits sobre CUDA; el alumno es all-MiniLM-L6-v2 destilado. Las filas CPU usan 2 hilos.

| Modelo | Dispositivo | Accuracy | Macro-F1 | Top-3 accuracy | Acuerdo con el profesor | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) | Aceleracion batch 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| Profesor, zero-shot, 4-bit | cuda | 0,581 | 0,616 | 0,763 | n/a | 87,4 | 1540,8 | 20,8 | 5443 | 1,0x |
| Alumno, PyTorch | cpu | 0,573 ± 0,003 | 0,604 ± 0,005 | 0,745 ± 0,004 | 0,724 ± 0,003 | 5,4 | 68,8 | 464,8 | 91 | 16,1x |
| Alumno, ONNX fp32 | cpu | 0,575 | 0,607 | 0,741 | 0,725 | 3,8 | 57,8 | 554,0 | 91 | 23,3x |
| Alumno, ONNX int8 | cpu | 0,574 | 0,606 | 0,743 | 0,721 | 1,6 | 29,0 | 1103,9 | 23 | 55,0x |

Cascada alumno primero, textos dudosos al profesor:

| Porcentaje enviado al profesor | Umbral de confianza del alumno | Accuracy | Macro-F1 | Latencia media por texto (ms) |
|---|---|---|---|---|
| 0 % | 0,079 | 0,574 | 0,606 | 1,6 |
| 10 % | 0,373 | 0,584 | 0,612 | 10,3 |
| 20 % | 0,526 | 0,586 | 0,614 | 19,1 |
| 30 % | 0,672 | 0,585 | 0,612 | 27,8 |
| 50 % | 0,886 | 0,585 | 0,618 | 45,3 |
| 100 % | 1,000 | 0,581 | 0,616 | 88,9 |

## Requisitos de hardware

- VRAM: no aplica para el alumno en CPU; el artefacto ONNX int8 ocupa 23 MB y el fp32 91 MB en disco y memoria.
- GPU recomendadas: ninguna necesaria para el alumno; el profesor Qwen2.5-7B-Instruct en 4 bits requiere aproximadamente 5,4 GB de pesos y una GPU con al menos 8 GB de VRAM (no confirmado en la model card).
- Cabe en cualquier GPU consumer e incluso en CPU de 2 hilos; no requiere acelerador.
- Opciones de despliegue: librería tinydistill (`Predictor`, `tinydistill predict`, `tinydistill serve`), ONNX Runtime, text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: 1,6 ms/texto en batch 1 y 1103,9 textos/s en batch 32 con ONNX int8 en CPU de 2 hilos; 3,8 ms y 554,0 textos/s con ONNX fp32.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros clasificadores de CLINC150 (por ejemplo, fine-tunes de BERT-base o DistilBERT sobre el mismo dataset). La única comparación directa disponible es contra el propio profesor y contra las variantes del alumno, recogidas en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Accuracy CLINC150 | Licencia | Formato |
|---|---|---|---|---|---|
| tinydistill-clinc150-minilm (ONNX int8) | 22,7 M (aprox.) | no disponible | 0,574 | cc-by-3.0 | ONNX |
| Qwen2.5-7B-Instruct (profesor, 4-bit) | 7,6 B | no disponible en la model card | 0,581 | no disponible en la model card | safetensors (pesos originales) |

## Limitaciones y advertencias

- El modelo solo clasifica entre 151 etiquetas fijas de CLINC150; cualquier consulta fuera de ese esquema cae en `oos` o en una etiqueta incorrecta.
- La accuracy global es moderada (57,5 %), lejos de un clasificador supervisado con etiquetas doradas; el techo está acotado por el profesor y por el subconjunto de 21 etiquetas candidatas (la dorada estaba presente en el 96,8 % de los textos).
- El alumno se entrena solo con etiquetas suaves del profesor, por lo que hereda sus sesgos y errores sistemáticos.
- No hay información sobre idiomas soportados; el dataset CLINC150 es mayoritariamente en inglés y se desconoce el comportamiento en castellano.
- La licencia es cc-by-3.0, pero la model card advierte de que deben revisarse las licencias del modelo alumno (all-MiniLM-L6-v2), del profesor (Qwen2.5-7B-Instruct) y del dataset (CLINC150) antes de un uso comercial.
- El modelo es de noviembre de 2026 según los metadatos del repositorio, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- No se han publicado evaluaciones de robustez, calibración ni sesgo demográfico.
- El umbral de confianza de la cascada se fijó sobre el conjunto de test; en producción debe recalibrarse sobre una partición de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shroomy/tinydistill-clinc150-minilm
- Repositorio de tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo alumno base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
