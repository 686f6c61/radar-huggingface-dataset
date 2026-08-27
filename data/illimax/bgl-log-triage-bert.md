# illimax/bgl-log-triage-bert

## Resumen

El modelo `illimax/bgl-log-triage-bert` es un clasificador de secuencias basado en BERT, fine-tuneado sobre `bert-base-uncased` para el triage de líneas de log del supercomputador Blue Gene/L (BGL) del Lawrence Livermore National Labs. Su objetivo es asignar cada línea de log a una de cuatro categorías operativas —`normal`, `kernel_mem` (hardware), `kernel_ops` (configuración del sistema) y `app` (código)— para que un operador sepa dónde mirar ante un incidente. El modelo tiene 109.485.316 parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo no reside en su rendimiento absoluto, sino en su documentación honesta: el autor publica que pierde contra un baseline de TF-IDF con regresión logística entrenado sobre los mismos datos (0,7330 frente a 0,7451 de macro F1 en templates no vistos). Este resultado, junto con el análisis de las causas, es el propósito declarado del repositorio asociado. El modelo sirve como referencia para investigar por qué los modelos neuronales no siempre superan a métodos clásicos en tareas de clasificación de logs con alta desviación de distribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer, 12 capas, 768 hidden, 12 cabezas) |
| Parametros totales | 109.485.316 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (entrenado con `max_length=64`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32 por defecto) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-uncased` para clasificación de secuencias con 4 etiquetas. La arquitectura subyacente es un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, seguido de una cabeza de clasificación lineal. El entrenamiento se realizó sobre el dataset BGL, que contiene logs del supercomputador Blue Gene/L con 131.072 procesadores, obtenido a través de LogHub. El dataset original fue descrito por Oliner y Stearley en el paper *What Supercomputers Say: A Study of Five System Logs* (DSN 2007).

El split de evaluación es temporal (ordenado por `unix_ts`, 70/15/15) y no aleatorio, porque BGL repite líneas idénticas decenas de veces y un split aleatorio colocaría la misma línea en train y test. El autor aplicó normalización previa de las líneas de log: reemplazo de identificadores de nodo, IPs, valores hexadecimales, rutas y dígitos por placeholders (`[NODE]`, `[IP]`, `[HEX]`, `[PATH]`, `[NUM]`). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de líneas de log en 4 categorías: `normal`, `kernel_mem`, `kernel_ops` y `app`.
- Detección de anomalías en logs de sistemas de computación de altas prestaciones (HPC).
- Triage operativo: indica al operador si el problema es de hardware, configuración del sistema o código de aplicación.
- Soporte de entrada de texto libre con normalización previa obligatoria (el modelo no funciona correctamente con líneas crudas).
- Capacidad multilingüe: no disponible, solo inglés (los logs BGL están en inglés).
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es un clasificador discriminativo puro.

## Casos de uso

- Monitorización de supercomputadores: el modelo puede clasificar en tiempo real las líneas de log de un sistema BGL para alertar al equipo de operaciones sobre fallos de hardware (`kernel_mem`) o problemas de configuración (`kernel_ops`), reduciendo el tiempo medio de detección de incidencias.
- Análisis post-mortem de incidentes: dado un conjunto de logs históricos, el modelo etiqueta cada línea para reconstruir la secuencia de eventos que condujo a un fallo, facilitando la investigación forense.
- Filtrado de ruido en logs: al identificar líneas `normal` con alta precisión (F1 0,9898 en templates no vistos), puede descartar la mayoría de líneas irrelevantes y dejar solo las que requieren atención.
- Evaluación de pipelines de análisis de logs: al ser un modelo de referencia documentado, sirve como punto de comparación para otros clasificadores neuronales o basados en reglas en el dataset BGL.
- Investigación académica en detección de anomalías: el modelo y su documentación permiten estudiar por qué los modelos basados en transformers fallan en clases con baja representación o templates no vistos, un problema común en logs del mundo real.
- Integración en sistemas de alerta temprana: aunque el autor recomienda usar el baseline TF-IDF para producción, el modelo puede desplegarse como componente de un sistema de triage que combine múltiples señales, siempre que se aplique la normalización previa.

## Benchmarks y rendimiento

La evaluación se realizó sobre un split temporal (70/15/15) del dataset BGL. La métrica principal es macro F1 sobre templates que nunca aparecen en entrenamiento (75,6% de las filas de test). El autor no reporta accuracy porque etiquetar todo como `normal` ya alcanza 93,5% de acierto.

| Subconjunto | Filas | Macro F1 |
|---|---|---|
| Templates no vistos (75,6%) | 534.615 | 0,7330 |
| Templates vistos (24,4%) | 172.357 | 0,8902 |
| Todo el test | 706.972 | 0,8289 |

F1 por clase en templates no vistos:

| Métrica | normal | kernel_mem | kernel_ops | app | macro |
|---|---|---|---|---|---|
| F1 | 0,9898 | 0,9796 | 0,0496 | 0,9130 | 0,7330 |
| Precisión | 0,9799 | 1,0000 | 0,5913 | 1,0000 | — |
| Recall | 0,9998 | 0,9600 | 0,0259 | 0,8400 | — |
| Soporte | 497.690 | 25 | 5.259 | 31.641 | — |

El baseline TF-IDF + regresión logística obtiene 0,7451 de macro F1 en templates no vistos y 0,9316 de macro F1 global, superando al modelo BERT en ambos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo ocupa ~440 MB en memoria). Con cuantización a FP16 o int8, el consumo baja a ~220 MB o ~110 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, RTX 2080 o superior funciona sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, etc.).
- Opciones de despliegue: transformers de Hugging Face, ONNX Runtime, TensorRT, o servidores de inferencia como vLLM (aunque no es óptimo para un modelo de 110M), TGI o FastAPI con el pipeline de transformers.
- Latencia estimada: en GPU T4, la inferencia de una línea de log con `max_length=64` tarda del orden de 1-3 ms por muestra. En CPU moderna, entre 10-30 ms por muestra.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación de logs basados en BERT (como LogBERT o modelos de la familia LogLLM) en los mismos términos de evaluación. La única comparación directa documentada es con el baseline clásico:

| Modelo | Macro F1 (templates no vistos) | Macro F1 (global) | Parámetros | Licencia |
|---|---|---|---|---|
| bgl-log-triage-bert (BERT base) | 0,7330 | 0,8289 | 109,5M | Apache 2.0 |
| TF-IDF + regresión logística | 0,7451 | 0,9316 | — | — |

El baseline TF-IDF es más simple, más rápido de entrenar y supera al modelo BERT en ambas métricas. Esto sugiere que la capacidad de representación contextual de BERT no se traduce en ventajas para esta tarea específica con datos de logs altamente repetitivos.

## Limitaciones y advertencias

- La clase `kernel_ops` en templates no vistos tiene un rendimiento casi nulo (recall 0,0259). Un modo de fallo ausente en la ventana de entrenamiento (`Error receiving packet on tree network`) aparece en test y el modelo no lo detecta.
- La clase `kernel_mem` tiene solo 100 filas de soporte en test; su F1 depende del número de falsos positivos, no del recall. Un único template no visto (`MACHINE CHECK DCR read timeout`, 14.481 filas, en realidad `normal`) puede hacer oscilar la macro F1 entre 0,73 y 0,50 según la configuración de entrenamiento.
- Se pierden tres templates `ciod:` que se clasifican como `normal`, incluyendo errores de conexión y de E/S. Esto afecta a 5.063 filas de test y explica que el recall de `app` sea 0,84 en lugar de ~0,97.
- El modelo se entrenó con una sola semilla; la selección del checkpoint se basó en una diferencia de 0,0005 en la métrica, y no se midió la reproducibilidad entre semillas.
- Solo es aplicable al formato de logs BGL. Otros formatos requieren un adaptador que produzca `(timestamp, message)`; sin él, los resultados no son significativos.
- La agrupación en 4 clases es un criterio del proyecto, no una taxonomía oficial. No existe documentación completa de los códigos de alerta de BGL, por lo que las 41 categorías originales se agruparon por nombre.
- La normalización previa es obligatoria. Alimentar líneas crudas cambia el 12,95% de las predicciones sobre 719.665 líneas de test, generando una avalancha de falsas alarmas (78.674 líneas `normal` se convierten en `kernel_ops`).
- El dataset BGL se distribuye para investigación o trabajo académico; su uso comercial puede requerir permisos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/illimax/bgl-log-triage-bert
- Repositorio del proyecto LogTriage: https://github.com/lkw-k/LogTriage
- Paper original del dataset BGL: Oliner & Stearley, *What Supercomputers Say: A Study of Five System Logs*, DSN 2007 (referencia arXiv:2008.06448)
- Dataset BGL vía LogHub: https://github.com/logpai/loghub
