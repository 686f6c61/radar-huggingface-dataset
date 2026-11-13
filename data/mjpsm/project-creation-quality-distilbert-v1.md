# mjpsm/project-creation-quality-distilbert-v1

## Resumen

`project-creation-quality-distilbert-v1` es un clasificador de texto multilabel desarrollado por el usuario mjpsm para el sistema MyVillage. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased` (aproximadamente 67 millones de parámetros) que predice 12 etiquetas de fallo semántico y híbrido definidas en la taxonomía `v3.0.0` del proyecto. El modelo no funciona de forma aislada: se distribuye junto con un paquete `v3cls/` que incorpora un validador determinista basado en reglas y un motor de decisión que emite un veredicto binario `ACCEPT`/`REJECT` acompañado de la lista de requisitos incumplidos.

El problema que aborda es la validación automática de propuestas de proyectos educativos (título, descripción, prompt) contra un conjunto de criterios de calidad: alineación temática, adecuación de edad, delimitación de entregables, presencia de artefactos técnicos, definición de "done", instrucciones procedimentales, integridad de la colaboración, estructura de párrafos, sobreafirmaciones de seguridad, calidad del título y presencia de resultados de aprendizaje. La combinación de un modelo semántico con reglas deterministas busca reducir falsos aceptados sin sacrificar recall.

Es relevante para equipos que necesiten un filtro de calidad ligero y desplegable en CPU: con 67M de parámetros y pesos en safetensors, el coste de inferencia es mínimo comparado con LLMs generativos usados como jueces. Sin embargo, el propio autor advierte de que el conjunto de test es reducido (100 registros) y los datos de entrenamiento son mayoritariamente sintéticos, por lo que su uso en producción requiere revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.962.700 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch/ONNX no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un encoder transformer de 6 capas y ~67M de parámetros obtenido por destilación de BERT-base. La cabeza de clasificación se ha reconfigurado como multilabel con 12 salidas (una por código de fallo de la taxonomía `v3.0.0`), con umbrales por etiqueta calibrados sobre el split de validación (`v3_thresholds.json`). El sistema completo envuelve al modelo con un validador determinista que aplica 7 códigos basados en reglas y reglas híbridas, y un motor de decisión que combina ambas señales.

El conjunto de entrenamiento consta de 1.000 registros sintéticos y derivados de "golden" (300 aceptados, 490 con una sola violación, 210 con múltiples violaciones), divididos 800/100/100 por concepto en train/validación/test. No se documenta el número de tokens de entrenamiento, la composición lingüística detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un encoder de clasificación). La innovación principal no está en la arquitectura sino en el diseño híbrido modelo + reglas + umbrales calibrados, que busca un equilibrio entre precisión de rechazo y recall.

## Capacidades

- Clasificación multilabel de texto: predice 12 códigos de fallo de calidad sobre propuestas de proyectos educativos.
- Emisión de decisión binaria `ACCEPT`/`REJECT` junto con la lista exacta de requisitos incumplidos (`failed_requirements`).
- Detección semántica de problemas como desalineación temática, contenido inapropiado por edad, entregables no acotados, ausencia de artefacto técnico, definición de "done" débil, violación de rol de párrafo, sobreafirmaciones de seguridad y calidad del título.
- Detección híbrida (modelo + reglas) de tooling prescrito y de instrucciones procedimentales.
- Integración como paquete Python (`v3cls.inference.V3Classifier`) que recibe `prompt`, `title` y `description`.
- Capacidad monolingüe: solo inglés.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Validación automática de propuestas educativas: el modelo se integra en un formulario o API para rechazar propuestas que incumplen la taxonomía antes de la revisión humana, devolviendo los códigos concretos de fallo para guiar al usuario en la corrección.
- Pre-filtrado en pipelines de moderación de contenido educativo: con 67M de parámetros puede ejecutarse en CPU por petición, filtrando el grueso de propuestas defectuosas y reservando la revisión manual para los casos dudosos.
- Generación de feedback estructurado: a partir de `failed_requirements`, un sistema posterior puede redactar mensajes de corrección específicos por cada código de fallo detectado (por ejemplo, `WEAK_DEFINITION_OF_DONE` o `NO_TECH_ARTIFACT`).
- Control de calidad en plataformas de creación de proyectos: integrado como paso de CI en un backend que valide lotes de propuestas antes de publicarlas, con umbrales ajustables por etiqueta según la tolerancia a falsos aceptados.
- Experimentación académica sobre clasificación multilabel con datos sintéticos: el modelo y su split 800/100/100 documentado sirven como referencia para estudiar el efecto de umbrales calibrados y reglas deterministas en tareas de validación de calidad.
- Auditoría de taxonomías de calidad: al comparar las predicciones del modelo con las reglas deterministas se pueden identificar códigos con bajo rendimiento (por ejemplo, `SAFETY_OR_OVERCLAIM` con recall 0.125) y revisar la definición de esos criterios en la taxonomía.
- Filtro previo en herramientas de autoría asistida: antes de que un LLM genere o complete una propuesta, el clasificador puede verificar que el borrador cumple los requisitos mínimos y evitar generaciones que serán rechazadas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test no tocado (100 registros). Primera tabla: sistema híbrido completo. Segunda tabla: etiquetas del modelo con umbrales calibrados.

| metric | value |
|---|---|
| decision accuracy | 0.94 |
| reject precision / recall / F1 | 1.0 / 0.9143 / 0.9552 |
| false accepts / false rejects | 6 / 0 |
| exact match of `failed_requirements` | 0.77 |

| label | detector | threshold | support | precision | recall | F1 |
|---|---|---|---|---|---|---|
| `THEME_MISALIGNMENT` | semantic | 0.5 | 8 | 0.636 | 0.875 | 0.737 |
| `AGE_INAPPROPRIATE` | semantic | 0.22 | 8 | 0.875 | 0.875 | 0.875 |
| `UNBOUNDED_DELIVERABLE` | semantic | 0.24 | 2 | 0.286 | 1.0 | 0.444 |
| `NO_TECH_ARTIFACT` | semantic | 0.5 | 8 | 0.889 | 1.0 | 0.941 |
| `WEAK_DEFINITION_OF_DONE` | semantic | 0.5 | 8 | 0.875 | 0.875 | 0.875 |
| `PRESCRIBED_TOOLING` | hybrid | 0.5 | 7 | 1.0 | 0.857 | 0.923 |
| `PROCEDURAL_INSTRUCTIONS` | hybrid | 0.5 | 7 | 1.0 | 1.0 | 1.0 |
| `COLLABORATION_NOT_INTEGRAL` | semantic | 0.5 | 8 | 1.0 | 1.0 | 1.0 |
| `PARAGRAPH_ROLE_VIOLATION` | semantic | 0.52 | 9 | 1.0 | 0.778 | 0.875 |
| `SAFETY_OR_OVERCLAIM` | semantic | 0.38 | 8 | 1.0 | 0.125 | 0.222 |
| `TITLE_QUALITY` | semantic | 0.62 | 6 | 0.5 | 0.5 | 0.5 |
| `LEARNING_OUTCOME_MISSING` | semantic | 0.5 | 4 | 1.0 | 1.0 | 1.0 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67M de parámetros ≈ 268 MB de pesos) y en torno a 130-270 MB en fp16/bf16; el repo ocupa 0.3 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente. En CPU moderna la inferencia es viable por petición.
- Cabe en cualquier GPU consumer y en entornos sin GPU (CPU, Raspberry Pi 4/5 con suficiente RAM para cargar el modelo).
- Opciones de despliegue: PyTorch nativo con `transformers`, exportación a ONNX Runtime, TorchScript o cuantización dinámica INT8 para reducir latencia en CPU. No se documenta soporte específico de vLLM, TGI o llama.cpp (este último no aplica a arquitecturas encoder).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han publicado comparaciones directas en la información disponible. Como referencia de categoría, se puede situar frente a otros clasificadores de texto de tamaño similar, aunque sin datos de rendimiento comparables:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `project-creation-quality-distilbert-v1` | 66,96M | no disponible | Clasificación multilabel de calidad (12 etiquetas) | apache-2.0 | Hugging Face |
| `distilbert-base-uncased` (base) | 66,96M | 512 tokens | MLM / encoder genérico | apache-2.0 | Hugging Face |
| `bert-base-uncased` | 110M | 512 tokens | MLM / encoder genérico | apache-2.0 | Hugging Face |
| `roberta-base` | 125M | 512 tokens | MLM / encoder genérico | mit | Hugging Face |

La comparación con los encoders base es estructural (misma familia y orden de magnitud); no implica equivalencia de rendimiento en la tarea específica, para la que no hay benchmarks públicos de terceros.

## Limitaciones y advertencias

- El split de test es muy pequeño: 100 registros con entre 2 y 9 positivos por etiqueta, lo que hace que las métricas por etiqueta tengan alta varianza.
- Los umbrales se calibraron sobre un split de validación de solo 100 registros; pueden no generalizar a distribuciones de datos distintas.
- Los datos de entrenamiento son mayoritariamente sintéticos (ediciones contrastivas de bases conformes), lo que puede introducir un sesgo hacia patrones artificiales y reducir el rendimiento en propuestas reales redactadas de forma natural.
- Rendimiento muy desigual por etiqueta: `SAFETY_OR_OVERCLAIM` tiene recall 0.125 y `TITLE_QUALITY` F1 0.5, por lo que estos fallos pasarán frecuentemente sin detectar.
- `UNBOUNDED_DELIVERABLE` tiene precisión 0.286 con solo 2 positivos de soporte: la métrica no es fiable.
- El modelo solo procesa inglés; no cubre otros idiomas.
- Es un clasificador, no un generador: no produce explicaciones ni texto de corrección, solo etiquetas y decisión.
- El sistema depende del paquete `v3cls/` incluido en el repo para el validador determinista y el motor de decisión; usar solo los pesos sin ese paquete no reproduce los resultados publicados.
- Licencia apache-2.0 permite uso comercial, pero el autor recomienda revisar las salidas antes de usar el modelo como puerta de producción.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos/negativos en la clasificación; el sistema reporta 6 falsos aceptados y 0 falsos rechazos en test.
- No hay información sobre sesgos demográficos, geográficos o culturales en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjpsm/project-creation-quality-distilbert-v1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio del autor (no verificado): no disponible
- Paper o blog del sistema MyVillage: no disponible
- Demo o Space: no disponible
