# credentek/TenaliAI-NetBanking-v1

## Resumen

TenaliAI-NetBanking-v1 es un modelo de clasificación de intenciones desarrollado por Credentek, orientado al sector bancario y específicamente a portales de banca electrónica (netbanking). El modelo forma parte de una familia de modelos TenaliAI (Banking, FinTech, NetBanking) que, según los resultados de búsqueda de modelos hermanos, se basan en fine-tuning de BERT para identificar la intención de una consulta de cliente en plataformas bancarias. Con 237,6 millones de parámetros, el modelo está diseñado para procesar texto de consultas y devolver una etiqueta de intención, lo que permite automatizar la atención al cliente en canales digitales.

La ficha de HuggingFace no proporciona detalles sobre arquitectura, licencia, idiomas o datos de entrenamiento, por lo que gran parte de la información técnica debe considerarse no disponible. Sin embargo, el tamaño del repositorio (4,8 GB) y el formato safetensors sugieren que se distribuyen pesos completos, probablemente en precisión fp32. El modelo fue creado en agosto de 2026 y actualizado en septiembre del mismo año, con solo 35 descargas, lo que indica que es un proyecto reciente y de baja adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos hermanos de la familia TenaliAI se basan en bert-base-uncased, pero no se confirma para este) |
| Parametros totales | 237.633.893 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se indica safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información específica sobre la arquitectura de TenaliAI-NetBanking-v1. Los modelos hermanos de la misma familia (TenaliAI-Banking-v1 y TenaliAI-FinTech-v1) se describen como fine-tunes de bert-base-uncased sobre datasets no especificados, con el objetivo de generar la intención de una consulta de cliente en portales de banca. Es plausible que este modelo siga el mismo enfoque, pero no hay confirmación directa en la ficha. El número de parámetros (237,6 M) no coincide con BERT-base (110 M) ni con BERT-large (340 M), por lo que podría tratarse de una configuración intermedia o de un modelo con capas adicionales, aunque esto es especulativo.

No se dispone de datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares.

## Capacidades

- Clasificación de intenciones: el modelo está diseñado para identificar la intención de una consulta de cliente en un portal de banca electrónica o banca móvil, según la descripción de los modelos hermanos.
- Procesamiento de lenguaje natural en el dominio bancario: orientado a comprender preguntas y solicitudes relacionadas con operaciones bancarias (transferencias, saldos, tarjetas, etc.).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Atención al cliente automatizada en banca electrónica: el modelo puede clasificar la intención de una consulta escrita por un usuario en el chat del portal de netbanking, permitiendo enrutar la petición al departamento o flujo adecuado (por ejemplo, "consulta de saldo", "bloqueo de tarjeta", "solicitud de préstamo").
- Enrutamiento de tickets en centros de soporte: integrado en un sistema de ticketing, el modelo asigna automáticamente una categoría a cada incidencia reportada por clientes, reduciendo el tiempo de clasificación manual.
- Mejora de chatbots bancarios: como componente de un chatbot, el modelo detecta la intención del usuario y selecciona la respuesta o acción correspondiente dentro de un flujo conversacional predefinido.
- Análisis de consultas recurrentes: al clasificar un gran volumen de consultas, el modelo permite identificar los temas más frecuentes y detectar problemas comunes en la plataforma de banca online.
- Filtrado de consultas urgentes: las intenciones críticas (por ejemplo, fraude o bloqueo de cuenta) pueden priorizarse automáticamente para atención inmediata por un agente humano.
- Integración en sistemas de CRM bancario: el modelo puede etiquetar automáticamente las interacciones de los clientes en el CRM, facilitando el seguimiento y la generación de informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los modelos hermanos de la familia TenaliAI tampoco presentan métricas de evaluación en las páginas consultadas, salvo una pérdida de 0,4832 en el conjunto de evaluación para TenaliAI-Banking-v1, pero no se especifica la métrica de precisión ni se compara con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 237,6 M de parámetros, en fp32 se necesitan aproximadamente 0,95 GB solo para los pesos. En fp16 serían ~0,48 GB y en int8 ~0,24 GB. A esto hay que sumar memoria para activaciones y overhead del framework, por lo que se recomienda al menos 2 GB de VRAM para fp32 y 1 GB para fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32. Una NVIDIA GTX 1650 (4 GB) o superior sería suficiente. Para despliegues con mayor concurrencia, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4070, A10, etc.).
- Si cabe en consumer GPU: sí, el modelo es pequeño y cabe en GPUs de gama baja.
- Opciones de despliegue: al ser un modelo de tipo BERT (probablemente), se puede servir con Hugging Face Transformers, ONNX Runtime, TensorRT, o mediante frameworks como vLLM (aunque vLLM está más orientado a modelos generativos, también soporta BERT). También se puede exportar a ONNX para inferencia en CPU.
- Latencia y throughput estimados: no disponibles. Para un modelo de este tamaño, en una GPU moderna se esperan latencias de pocos milisegundos por consulta, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Los modelos más comparables son los hermanos de la misma familia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TenaliAI-NetBanking-v1 | 237,6 M | no disponible | no disponible | HuggingFace |
| TenaliAI-Banking-v1 | no disponible | no disponible | no disponible | HuggingFace |
| TenaliAI-FinTech-v1 | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos parecen compartir el mismo propósito (clasificación de intenciones en banca), pero no hay datos públicos que permitan comparar rendimiento o arquitectura. Alternativas genéricas como BERT-base o RoBERTa podrían servir como base, pero no se han publicado comparaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado probablemente con datos de un dominio concreto (banca), puede presentar sesgos hacia el vocabulario y las expresiones de ese sector.
- Riesgo de alucinación: al ser un modelo de clasificación (no generativo), el riesgo de alucinación es bajo, pero puede producir clasificaciones erróneas si la consulta está fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados. Si el modelo se entrenó solo con datos en inglés (como sugiere el uso de bert-base-uncased en los modelos hermanos), su rendimiento en otros idiomas será limitado.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveat importante: la falta de documentación técnica (arquitectura, datos de entrenamiento, métricas) impide evaluar la fiabilidad del modelo. Se recomienda realizar una validación exhaustiva antes de desplegarlo en un entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credentek/TenaliAI-NetBanking-v1
- Modelo hermano TenaliAI-Banking-v1: https://huggingface.co/credentek/TenaliAI-Banking-v1
- Modelo hermano TenaliAI-FinTech-v1: https://huggingface.co/credentek/TenaliAI-FinTech-v1
- Página de análisis de TenaliAI-FinTech-v1: https://free2aitools.com/model/credentek/tenaliai-fintech-v1
- Perfil de GitHub de Credentek: https://github.com/Credentek
