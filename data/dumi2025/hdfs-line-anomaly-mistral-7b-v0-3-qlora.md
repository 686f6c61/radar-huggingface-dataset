# Dumi2025/hdfs-line-anomaly-Mistral-7B-v0.3-qlora

## Resumen

El modelo `Dumi2025/hdfs-line-anomaly-Mistral-7B-v0.3-qlora` es un adaptador QLoRA con cabeza de clasificación construido sobre `mistralai/Mistral-7B-v0.3`, orientado a la detección de anomalías a nivel de línea en logs del sistema de ficheros distribuido HDFS. No es un modelo generativo de propósito general, sino un clasificador binario (0 = normal, 1 = anomalía) que recibe un par de secuencias formado por una línea de log y un resumen del bloque al que pertenece.

El problema que aborda es concreto: la detección de líneas anómalas en logs HDFS resulta extremadamente difícil cuando cada línea se evalúa de forma aislada, ya que muchas líneas normales son idénticas en apariencia a líneas que forman parte de un bloque anómalo. El autor incorpora contexto agregado del bloque (resumen de mensajes con sus recuentos) para mejorar la señal. Los resultados reportados muestran una diferencia sustancial entre usar contexto de bloque y no usarlo.

El modelo es relevante como ejemplo de aplicación de un LLM de 7B a una tarea de clasificación estructurada mediante PEFT, con cuantización 4-bit NF4 y entrenamiento en una única H100. El repositorio es de 0,7 GB, lo que corresponde al adaptador y la cabeza de clasificación, no a los pesos completos del modelo base. No hay descargas ni likes registrados, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3) con adaptador LoRA y cabeza de clasificación para sequence classification |
| Parametros totales | 7B en el modelo base; el adaptador LoRA y la cabeza de clasificación se suman sobre esa base (tamaño exacto del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Mistral-7B-v0.3 soporta 32 768 tokens, aunque el autor no lo declara) |
| Tipos de cuantizacion | 4-bit NF4 (QLoRA) para los pesos del modelo base durante el entrenamiento e inferencia; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT + cabeza de clasificación); requiere el modelo base `mistralai/Mistral-7B-v0.3` |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-7B-v0.3`, un transformer decoder-only de 7B parámetros, y le añade un adaptador LoRA con r=64 y alpha=128, más una cabeza de clasificación para la tarea `text-classification`. El entrenamiento se realizó con QLoRA: pesos del modelo base en 4-bit NF4, cómputo en bf16, 2,0 épocas, batch efectivo de 16 y learning rate de 1e-4. El run se ejecutó en una NVIDIA H100 80GB HBM3 (RunPod) con identificador `mistral-qlora-hdfs-linectx-42`, fechado el 2026-11-13.

Los datos provienen de LogHub HDFS_v1 (DOI 10.5281/zenodo.8196385), con 20 000 bloques muestreados. La entrada es un par de secuencias `(línea de log, resumen del bloque)`. Antes del entrenamiento se aplica una normalización que sustituye identificadores de bloque por `BLK`, direcciones IP por `IP` y números largos por `N`. El resumen de bloque enumera cada mensaje del bloque una vez con su recuento en el formato `3x mensaje ; ...`. Las etiquetas son las oficiales de bloque de HDFS_v1, heredadas por cada línea. La validación cruzada se hizo por bloque, usando los folds 1 a 4 de 5.

## Capacidades

- Clasificación binaria línea a línea de logs HDFS: normal (0) frente a anomalía (1).
- Uso de contexto de bloque agregado mediante un segundo segmento de entrada con recuentos de mensajes.
- Normalización de entidades volátiles (IDs de bloque, IPs, números) para reducir ruido.
- Carga mediante `peft.AutoPeftModelForSequenceClassification.from_pretrained` con `quantization_config` de 4-bit.
- Umbral de decisión configurable a través de `anomaly_threshold` en `anomaly_config.json` (valor por defecto 0,5000).
- No se declaran capacidades de generación de texto, tool calling, agentes, visión, audio ni multilingüismo; el modelo está especializado en la tarea de clasificación descrita.

## Casos de uso

- Monitorización de clústeres HDFS en producción: el modelo puede puntuar cada línea de log entrante junto con el resumen de su bloque para marcar posibles anomalías, aprovechando el ROC-AUC de 0,9753 reportado con contexto de bloque.
- Triaje de incidentes: dado que el recall de anomalía con contexto es 0,9016, el clasificador sirve como primera etapa de filtrado que deriva bloques sospechosos a un análisis humano o a herramientas de correlación.
- Análisis forense de logs históricos: procesamiento por lotes de bloques HDFS_v1 ya almacenados para reconstruir la etiqueta a nivel de línea y localizar la primera línea desviada dentro de un bloque anómalo.
- Investigación en detección de anomalías en logs: el adaptador y su `anomaly_config.json` sirven como línea base reproducible para comparar técnicas de contexto de bloque frente a enfoques línea a línea.
- Integración en pipelines de observabilidad: al ser un adaptador PEFT sobre Mistral-7B, puede servirse con las mismas pilas de inferencia que el modelo base, insertándose como etapa de clasificación en un sistema de alertas.
- Detección de patrones de fallo recurrentes: el resumen de bloque con recuentos (`3x mensaje ; ...`) permite al modelo explotar repeticiones anómalas de mensajes, útil para identificar bucles de error o reintentos en el sistema de ficheros.

## Benchmarks y rendimiento

Resultados reportados por el autor en validación cruzada por bloque (folds 1 a 4 de 5), a nivel de línea de log:

| Metrica | Con contexto de bloque | Linea aislada |
|---|---|---|
| f1_anomaly | 0,5344 | 0,0505 |
| precision_anomaly | 0,3798 | 0,0260 |
| recall_anomaly | 0,9016 | 0,9130 |
| roc_auc | 0,9753 | 0,5142 |
| F1 95 % CI (bootstrap por bloque) | [0,5026, 0,5643] | No disponible |
| Umbral de decision | 0,5000 | No disponible |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Mistral-7B en 4-bit NF4 ocupa aproximadamente 4-5 GB de pesos, más overhead de activaciones y del adaptador; en la práctica se recomienda al menos 8-10 GB de VRAM para inferencia en 4-bit. Para precisión completa (bf16) se necesitan en torno a 14-16 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 80GB HBM3. Para inferencia bastan GPUs menores; una RTX 4090 (24 GB) o A100 40GB son holgadas para 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit NF4 cabe en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti 16GB, RTX 4070, RTX 4080, RTX 4090), siempre que se use cuantización.
- Opciones de despliegue: la carga indicada por el autor es vía `peft.AutoPeftModelForSequenceClassification` con `quantization_config` (bitsandbytes 4-bit). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador de clasificación; al ser una cabeza de clasificación, no es directamente compatible con servidores de generación de texto sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en `mistralai/Mistral-7B-v0.3` (7B parámetros, licencia Apache 2.0 según el modelo base, aunque la licencia del adaptador no está declarada). No se han encontrado en la información disponible alternativas específicas de detección de anomalías en logs HDFS construidas sobre Mistral-7B con las que comparar parámetros, contexto o rendimiento.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dumi2025/hdfs-line-anomaly-Mistral-7B-v0.3-qlora | 7B + adaptador | No disponible | Clasificación de líneas HDFS | No disponible | Hugging Face (0 descargas) |
| mistralai/Mistral-7B-v0.3 (base) | 7B | 32 768 (según modelo base) | Generación de texto | Apache 2.0 (modelo base) | Hugging Face |
| Alternativas de detección de anomalías en logs | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El rendimiento reportado es modesto en precisión (0,3798) y F1 de anomalía (0,5344) con contexto de bloque, pese al alto recall (0,9016) y ROC-AUC (0,9753). En producción esto implica una tasa elevada de falsos positivos si se usa el umbral por defecto de 0,5.
- Sin contexto de bloque, el modelo es prácticamente inútil para la tarea: F1 de 0,0505 y ROC-AUC de 0,5142, cercano al azar. El contexto de bloque es un requisito funcional, no opcional.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial. Debe verificarse antes de cualquier despliegue en producción.
- Los idiomas soportados no están declarados; el modelo está entrenado sobre logs HDFS, que son fundamentalmente en inglés técnico.
- El modelo está especializado exclusivamente en logs HDFS_v1 y en el formato de entrada descrito (línea + resumen de bloque con normalización `BLK`/`IP`/`N`). No se espera generalización a otros sistemas de logs sin reentrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas por sobreajuste al dominio y al esquema de etiquetado de bloque de HDFS_v1.
- El repositorio no tiene descargas ni likes, y la validación se limita a 4 de 5 folds; no hay evidencia de validación externa ni de uso en producción.
- El tamaño del repositorio (0,7 GB) corresponde al adaptador, no al modelo base; es necesario descargar `mistralai/Mistral-7B-v0.3` por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dumi2025/hdfs-line-anomaly-Mistral-7B-v0.3-qlora
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset LogHub HDFS_v1: https://doi.org/10.5281/zenodo.8196385
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
