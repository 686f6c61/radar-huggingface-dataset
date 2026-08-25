# priteshloke/kepler-ops-anomaly-classifier

## Resumen

El modelo `priteshloke/kepler-ops-anomaly-classifier` es un clasificador de texto basado en la arquitectura BERT, desarrollado por Kepler Operations Intelligence (getkeplerops.com). Su función es categorizar narrativas de transacciones, notas de discrepancia en facturas y registros operativos en seis modos de fallo empresarial estándar, orientados a operaciones de logística, finanzas y SaaS. El modelo resuelve el problema de la detección manual de anomalías en procesos empresariales, automatizando la clasificación de incidencias como sobrecostes volumétricos, intentos de entrega falsos, excesos de alcance en retenedores de agencias o licencias SaaS inactivas.

La relevancia actual radica en la necesidad de herramientas específicas para auditoría operativa y control de costes en entornos empresariales, donde los datos textuales abundan pero carecen de estructura. El modelo está publicado con licencia MIT y entrenado exclusivamente en inglés, con un pipeline de clasificación de texto. No se han proporcionado detalles sobre el tamaño exacto del modelo, el número de parámetros ni la longitud de contexto, por lo que estos datos no están disponibles en la información pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (clasificación de secuencias) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BERT, concretamente para la tarea de clasificación de secuencias (sequence classification). Se trata de un modelo transformer preentrenado que se ha ajustado finamente (fine-tuning) para un problema de clasificación de texto multiclase. No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. El dataset de evaluación, `priteshloke/enterprise-operations-benchmark`, está disponible en Hugging Face, pero no se ha documentado su tamaño o metodología de construcción.

## Capacidades

- Clasificación de narrativas de transacciones en 6 categorías predefinidas de anomalías empresariales.
- Detección de sobrecostes por peso volumétrico en envíos de mensajería (`VOLUMETRIC_WEIGHT_OVERCHARGE_CRITICAL`).
- Identificación de intentos de entrega falsos por parte de mensajeros (`COURIER_FAKE_NDR_ATTEMPT_CRITICAL`).
- Reconocimiento de excesos de alcance en contratos de retenedores de agencias (`AGENCY_RETAINER_SCOPE_CREEP_CRITICAL`).
- Detección de licencias de SaaS inactivas o "zombie seats" (`SAAS_DORMANT_SEAT_LICENSE_WASTE_HIGH`).
- Clasificación de recargos por inventario envejecido en almacenes de Amazon (FBA) (`FBA_AGED_INVENTORY_SURCHARGE_CRITICAL`).
- Distinción de transacciones limpias sin anomalías (`NONE_CLEAN_TRANSACTION`).
- Integración sencilla con la librería `transformers` de Hugging Face mediante un pipeline de `text-classification`.

## Casos de uso

- Auditoría de facturas de transporte: el modelo puede analizar automáticamente las notas de discrepancia de facturas de mensajería para detectar sobrecargos por peso volumétrico, como el ejemplo de una caja de camiseta de 0.5 kg facturada a 3.5 kg. Esto permite a los equipos de finanzas identificar reclamaciones justificadas y reducir costes.
- Control de calidad en entregas: detecta narrativas que sugieran intentos de entrega falsos (NDR) por parte de mensajeros, lo que ayuda a las empresas de comercio electrónico a evaluar el rendimiento de sus proveedores logísticos y mejorar la experiencia del cliente.
- Gestión de contratos de agencias: clasifica descripciones de horas trabajadas en contratos de retención para identificar excesos de alcance sin órdenes de cambio, permitiendo a los equipos de adquisiciones negociar mejores términos o facturar servicios adicionales.
- Optimización de gastos SaaS: analiza notas sobre licencias de software inactivas o cuentas de usuarios que no se desaprovisionan, facilitando la auditoría de licencias y la reducción de costes recurrentes.
- Control de inventario en FBA: identifica recargos por inventario envejecido en almacenes de Amazon, permitiendo a los vendedores tomar decisiones sobre liquidación o reubicación de stock antes de que se acumulen tarifas.
- Automatización de tickets de operaciones: integrado en un sistema de gestión de incidencias, el modelo puede etiquetar automáticamente los tickets entrantes según el tipo de anomalía, mejorando la asignación a los equipos correspondientes y reduciendo el tiempo de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento como precisión, recall o F1 sobre conjuntos de prueba.

## Requisitos de hardware

- El tamaño exacto del modelo no está especificado, por lo que no se puede estimar la VRAM necesaria de forma precisa.
- Dado que es un modelo basado en BERT, es probable que sea de tamaño pequeño o mediano (por ejemplo, BERT-base), lo que permitiría ejecutarlo en GPUs de consumo como una RTX 3060 o incluso en CPU para inferencia de baja latencia, pero esta afirmación es especulativa y no está confirmada.
- Para despliegue, se puede usar la librería `transformers` con PyTorch o TensorFlow, o bien servidores de inferencia como vLLM, TGI o ONNX Runtime. También es compatible con `llama.cpp` si se convierte a formato GGUF, aunque no se ha publicado ninguna cuantización.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. El ámbito de clasificación de anomalías en operaciones empresariales es muy específico, y no se mencionan alternativas con el mismo conjunto de clases.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que no es adecuado para textos en otros idiomas sin un ajuste previo.
- Solo cubre 6 categorías específicas de anomalías; cualquier narrativa que no se ajuste a estos patrones será clasificada como `NONE_CLEAN_TRANSACTION`, lo que puede llevar a falsos negativos.
- El dataset de entrenamiento no está documentado en detalle, por lo que se desconoce su tamaño, equilibrio de clases y procedencia exacta. Esto puede implicar sesgos en la clasificación.
- Al ser un modelo de clasificación de texto, puede sufrir alucinaciones si la narrativa de entrada es ambigua o contiene información contradictoria, aunque el riesgo es menor que en modelos generativos.
- La licencia MIT permite uso comercial sin restricciones, pero es recomendable evaluar el modelo en datos propios antes de implementarlo en producción.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que la fiabilidad del modelo no está contrastada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/priteshloke/kepler-ops-anomaly-classifier)
- [Dataset de evaluación](https://huggingface.co/datasets/priteshloke/enterprise-operations-benchmark)
- [Space de simulación interactiva](https://huggingface.co/spaces/priteshloke/kepler-ops-anomaly-playground)
- [Sitio web del autor](https://www.getkeplerops.com)
