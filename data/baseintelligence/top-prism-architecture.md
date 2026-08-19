# BaseIntelligence/top-prism-architecture

## Resumen

El modelo `BaseIntelligence/top-prism-architecture` es una arquitectura de red neuronal personalizada, descubierta mediante neural architecture search (NAS) descentralizado en el marco del desafío PRISM de Base. Este desafío, impulsado por la organización BaseIntelligence, invita a mineros a presentar arquitecturas y recetas de entrenamiento que aprendan de forma eficiente desde cero sobre una ventana sellada del dataset FineWeb-Edu. El modelo aquí publicado corresponde a la arquitectura ganadora global del protocolo, con un tamaño de 112,5 millones de parámetros, significativamente menor que el modelo de referencia GPT-2 Large (774M), y un rendimiento competitivo en varias tareas de comprensión del lenguaje.

La relevancia de este modelo radica en que demuestra la viabilidad de la búsqueda automatizada de arquitecturas en un entorno descentralizado y competitivo, produciendo diseños que superan a arquitecturas clásicas en eficiencia de parámetros. Se trata de un artefacto de investigación, no de un modelo listo para producción, y su carga requiere la ejecución de código remoto (`trust_remote_code=True`), ya que la arquitectura no está registrada en la biblioteca estándar de Transformers. No se dispone de información sobre la longitud de contexto, idiomas soportados ni detalles internos de la arquitectura más allá de su naturaleza personalizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `prism_custom` (arquitectura personalizada descubierta por NAS, no registrada en Transformers) |
| Parametros totales | 112,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión original, formato PyTorch) |
| Idiomas soportados | no disponibles (se infiere inglés por el dataset de entrenamiento, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `checkpoint.pt` (PyTorch, vía Hub LFS) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada públicamente. Se sabe que es una arquitectura personalizada (`prism_custom`) generada por el proceso de búsqueda de PRISM, que compite en velocidad de aprendizaje desde cero. El entrenamiento se realizó sobre 2.752.512.000 tokens (≈2,75 mil millones) de una ventana sellada de FineWeb-Edu, con un tiempo total de cómputo de 14.826 segundos (≈4,1 horas) y un throughput sostenido estimado de 125,3 TFLOPS, según la regla empírica para transformers densos `6 × N × D / wall`. No se menciona el uso de técnicas como RLHF o DPO; el proceso es puramente de preentrenamiento supervisado por pérdida de validación. Dado que la arquitectura es personalizada, cualquier innovación técnica interna (atención lineal, decodificación especulativa, etc.) no se ha hecho pública.

## Capacidades

- Generación de texto: el modelo está etiquetado con `pipeline_tag: text-generation`, por lo que puede producir texto autónomo.
- Comprensión del lenguaje: se evalúa en tareas de razonamiento de sentido común y comprensión lectora (HellaSwag, ARC, PIQA, WinoGrande, BoolQ, LAMBADA, OpenBookQA).
- Extracción de características: el tag `feature-extraction` sugiere que puede usarse para obtener representaciones internas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en búsqueda de arquitecturas neuronales: sirve como referencia para estudiar qué diseños emergen de un proceso NAS competitivo y cómo se comparan con arquitecturas clásicas en eficiencia de parámetros.
- Evaluación de metodologías de entrenamiento: al conocerse el número exacto de tokens y el tiempo de cómputo, permite analizar la relación entre presupuesto de entrenamiento y rendimiento final.
- Benchmarking de hardware: los datos de throughput (125,3 TFLOPS en RTX 5090) pueden usarse para calibrar métricas de eficiencia en otras GPUs.
- Extracción de características para tareas downstream: aunque no se documentan usos concretos, el tag `feature-extraction` habilita su uso como encoder para clasificación o regresión.
- Estudio de escalabilidad: con solo 112,5M de parámetros, es un caso de estudio sobre cómo arquitecturas pequeñas pueden acercarse a modelos más grandes en tareas específicas.
- Educación en NAS descentralizado: sirve como ejemplo práctico de cómo se estructura un desafío de optimización de arquitecturas y qué tipo de resultados produce.

## Benchmarks y rendimiento

Los resultados presentados en la model card comparan el modelo con GPT-2 Large (774M) bajo el protocolo de evaluación pública de PRISM, ejecutado en una RTX 5090. No se incluyen comparaciones con otros modelos.

| Metrica | Este modelo | GPT-2 Large | Diferencia | vs GPT-2 Large |
|---|---:|---:|---:|:---|
| Val BPB (G1) | 3,8373 | 4,1639 | -0,3265 | mejor |
| HellaSwag | 0,360 | 0,395 | -0,035 | peor |
| ARC-Easy | 0,285 | 0,280 | +0,005 | mejor |
| ARC-Challenge | 0,270 | 0,280 | -0,010 | peor |
| PIQA | 0,595 | 0,690 | -0,095 | peor |
| WinoGrande | 0,490 | 0,545 | -0,055 | peor |
| BoolQ | 0,635 | 0,640 | -0,005 | peor |
| LAMBADA | 0,955 | 0,985 | -0,030 | peor |
| OpenBookQA | 0,295 | 0,335 | -0,040 | peor |

Datos de cómputo: 112,5M parámetros frente a 774M de GPT-2 Large (6,88× más pequeño); 2.752.512.000 tokens de entrenamiento; 14.826 s de tiempo de pared; throughput estimado de 125,3 TFLOPS.

## Requisitos de hardware

- VRAM estimada: con 112,5M de parámetros, los pesos en FP32 ocupan aproximadamente 450 MB, por lo que cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo en inferencia.
- GPU recomendadas: la evaluación se realizó en una NVIDIA GeForce RTX 5090; cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente para inferencia.
- Compatibilidad: al ser una arquitectura personalizada, solo puede ejecutarse mediante Transformers con `trust_remote_code=True`. No se conocen adaptaciones para vLLM, llama.cpp, Ollama u otros runtimes.
- Latencia y throughput: no se proporcionan datos de inferencia; el entrenamiento alcanzó 125,3 TFLOPS sostenidos en RTX 5090, pero la velocidad de generación dependerá del hardware y la longitud de secuencia.

## Comparativa con modelos similares

La comparación directa disponible es con GPT-2 Large (774M), que es 6,88 veces mayor. No se dispone de datos frente a otros modelos pequeños como GPT-2 Small (124M) o DistilGPT-2 (82M). La siguiente tabla resume la comparación con GPT-2 Large:

| Modelo | Parametros | Contexto | Val BPB | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| top-prism-architecture | 112,5M | no disponible | 3,8373 | Apache 2.0 | HuggingFace (trust_remote_code) |
| GPT-2 Large | 774M | 1024 | 4,1639 | MIT | HuggingFace estándar |

No se dispone de más comparativas en la información proporcionada.

## Limitaciones y advertencias

- Arquitectura experimental: no está validada para uso en producción; es el resultado de un desafío de investigación y puede presentar comportamientos impredecibles.
- Requiere ejecución de código remoto: la carga del modelo necesita `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Se recomienda auditar el código antes de usarlo en entornos sensibles.
- Rendimiento inferior en la mayoría de tareas: salvo en ARC-Easy y BPB, el modelo queda por debajo de GPT-2 Large en las tareas evaluadas, a pesar de su menor tamaño.
- Sin información sobre sesgos: al entrenarse con FineWeb-Edu, puede heredar sesgos de ese dataset, pero no se han publicado análisis al respecto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente sin ajuste fino.
- Limitaciones de contexto e idioma: se desconocen la longitud máxima de contexto y los idiomas soportados; probablemente esté limitado al inglés por el dataset de entrenamiento.
- Sin soporte de la comunidad: al ser una arquitectura personalizada, no hay ecosistema de herramientas, cuantizaciones ni integraciones más allá de Transformers.

## Enlaces

- HuggingFace: https://huggingface.co/BaseIntelligence/top-prism-architecture
- Repositorio GitHub del protocolo PRISM: https://github.com/BaseIntelligence/prism
- Código de la arquitectura ganadora: https://github.com/BaseIntelligence/prism/blob/main/top-model/architecture.py
- Documentación de PRISM: https://docs.joinbase.ai/challenges/prism/overview
- Perfil de BaseIntelligence en HuggingFace: https://huggingface.co/BaseIntelligence/models
