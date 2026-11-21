# karthe05/maintenance-work-order-triage-13M

## Resumen

mwo-triage-13M es un modelo de clasificación de texto en inglés, desarrollado por el usuario de Hugging Face karthe05, diseñado para el triaje automático de órdenes de trabajo de mantenimiento industrial. Parte del discriminador de `google/electra-small-discriminator` y añade dos cabezas de clasificación que comparten el mismo codificador: una predice la prioridad de la orden (`STOP_NOW`, `TODAY`, `PLAN`, `MONITOR`) y otra la ruta de especialidad técnica (`MECHANICAL`, `ELECTRICAL`, `HYDRAULIC_PNEUMATIC`, `INSTRUMENTATION_CONTROLS`, `LUBRICATION`, `ESCALATE`), cada una con una puntuación de confianza calibrada.

El modelo aborda un problema operativo concreto: en plantas que ya disponen de SAP PM o Maximo, los planificadores siguen leyendo manualmente cada solicitud para decidir su urgencia y asignarla a un equipo, lo que introduce lentitud e inconsistencia. Con 13,5 millones de parámetros y un tiempo de inferencia de aproximadamente 6,5 ms por solicitud en CPU, el modelo está pensado para ejecutarse localmente en un ordenador convencional, sin GPU ni dependencia de la nube.

La propuesta es relevante por su enfoque de "sugerencia con revisión humana": el modelo no sustituye al planificador, sino que ofrece una primera clasificación con confianza explícita, derivando solicitudes vagas a `ESCALATE` y permitiendo marcar predicciones de baja confianza para revisión manual. Su licencia Apache 2.0 y su reducido tamaño lo hacen desplegable en entornos industriales con restricciones de conectividad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA-small discriminator) con dos cabezas de clasificación compartiendo codificador |
| Parámetros totales | 13.485.578 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con texto corto, mayoritariamente menos de 8 palabras) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `google/electra-small-discriminator`, un transformer encoder de tipo ELECTRA. Sobre el codificador compartido se añaden dos cabezas de clasificación independientes: una para la prioridad (4 clases) y otra para la ruta técnica (6 clases). El autor indica que el modelo fue afinado sobre el dataset `karthe05/mwo-triage-data`, compuesto por órdenes de trabajo reales de mantenimiento, aunque no se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

Una innovación destacable es la incorporación de puntuaciones de confianza calibradas por predicción, que el autor presenta como mecanismo de seguridad: una predicción errónea con alta confianza es más peligrosa que una con baja confianza, y el sistema está diseñado para que las predicciones cercanas al 50% se deriven a revisión humana. No se dispone de información sobre el uso de RLHF, DPO ni otras técnicas de alineación en el proceso de entrenamiento.

## Capacidades

- Clasificación de prioridad de órdenes de trabajo en cuatro niveles: `STOP_NOW`, `TODAY`, `PLAN`, `MONITOR`.
- Clasificación de ruta técnica en seis categorías: `MECHANICAL`, `ELECTRICAL`, `HYDRAULIC_PNEUMATIC`, `INSTRUMENTATION_CONTROLS`, `LUBRICATION`, `ESCALATE`.
- Salida de confianza calibrada por cada una de las dos predicciones.
- Detección de solicitudes vagas o ambiguas, derivadas a `ESCALATE` en lugar de adivinar.
- Inferencia en CPU sin GPU, con aproximadamente 6,5 ms por solicitud.
- Funcionamiento offline, sin dependencia de servicios en la nube ni coste por petición.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo puramente de clasificación de texto.

## Casos de uso

- Triaje automático de solicitudes entrantes en plantas con SAP PM o Maximo: el modelo lee cada orden al registrarse y propone prioridad y equipo, reduciendo el tiempo que los planificadores dedican a la clasificación manual matinal.
- Prellenado de campos en el sistema de gestión de mantenimiento: la sugerencia de prioridad y ruta puede volcarse como valor por defecto en el formulario, que el planificador confirma o corrige.
- Enrutamiento de solicitudes a colas de especialidad: las órdenes clasificadas como `HYDRAULIC_PNEUMATIC` o `ELECTRICAL` pueden dirigirse automáticamente al equipo correspondiente, agilizando la asignación.
- Detección temprana de emergencias reales: en modo seguridad captura el 83% de las emergencias reales, permitiendo que las órdenes `STOP_NOW` se escalen de inmediato mientras el resto sigue el flujo normal.
- Filtrado de ruido en la cola de mantenimiento: las solicitudes clasificadas como `MONITOR` o con baja confianza pueden separarse para revisión secundaria, evitando que desplacen a trabajos realmente urgentes.
- Despliegue en entornos sin conectividad: al ejecutarse en CPU y de forma offline, es adecuado para plantas con redes aisladas o requisitos de soberanía de datos que impiden usar servicios en la nube.
- Auditoría y análisis histórico: procesar lotes de órdenes pasadas para analizar la distribución de prioridades y rutas, detectar patrones de clasificación inconsistente o comparar la sugerencia del modelo con la decisión final del planificador.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Macro-F1 prioridad (1.500 órdenes no vistas) | 0,85 |
| Macro-F1 ruta (1.500 órdenes no vistas) | 0,82 |
| Detección de emergencias reales (modo equilibrado) | 72% |
| Detección de emergencias reales (modo seguridad) | 83% |
| Latencia por solicitud (CPU) | ~6,5 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo es un clasificador de dominio específico y no un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo ocupa aproximadamente 0,1 GB en disco y puede ejecutarse en memoria de sistema.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe en cualquier GPU consumer, pero no es necesario usarla.
- Opciones de despliegue: inferencia directa con PyTorch/Transformers en CPU; no se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput: aproximadamente 6,5 ms por solicitud en CPU, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mwo-triage-13M | 13,5M | No disponible (texto corto) | Clasificación de prioridad y ruta de mantenimiento | Apache 2.0 | Hugging Face |
| google/electra-small-discriminator | ~13,5M | 512 tokens (arquitectura ELECTRA estándar) | Modelo base de representación | Apache 2.0 | Hugging Face |
| Modelos de clasificación genéricos (p. ej., DistilBERT fine-tuned) | ~66M | 512 tokens | Clasificación de texto general | Apache 2.0 / MIT | Hugging Face |

No se dispone de información sobre otros modelos especializados en triaje de órdenes de mantenimiento con los que comparar directamente. La comparativa con el modelo base es pertinente porque mwo-triage-13M es un fine-tuning del mismo, y la comparativa con clasificadores genéricos ilustra el compromiso entre tamaño reducido y especialización de dominio.

## Limitaciones y advertencias

- El modelo no es un sistema de seguridad: no debe usarse para detener, aislar o bloquear equipos automáticamente sin intervención humana.
- Solo soporta inglés; el texto en otros idiomas queda fuera de su alcance.
- Entrenado y evaluado con texto corto de órdenes de trabajo, mayoritariamente de menos de 8 palabras; los informes largos o de formato libre no son un caso de uso válido.
- No maneja descripciones que contengan varios fallos simultáneos.
- No debe aplicarse a tickets ajenos al mantenimiento.
- Riesgo de alucinación inherente a la clasificación: el ejemplo documentado muestra una predicción incorrecta de prioridad (`STOP_NOW` en lugar de `TODAY`) con confianza de 0,54, lo que subraya la necesidad de revisión humana en predicciones de baja confianza.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios o plantas distintas a las del dataset de entrenamiento.
- No se han publicado datos sobre sesgos demográficos, geográficos o de otro tipo; la evaluación se limita a métricas de clasificación sobre órdenes reales.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karthe05/maintenance-work-order-triage-13M
- Dataset de entrenamiento: https://huggingface.co/datasets/karthe05/mwo-triage-data
- Modelo base: https://huggingface.co/google/electra-small-discriminator
- Reglamento de etiquetado (v1.3): https://github.com/karthekeyan/mwo-triage/blob/main/docs/labelling-rulebook.md
- Repositorio del proyecto: https://github.com/karthekeyan/mwo-triage
