# sinxbycosx/tds-carbon-card

## Resumen

Este repositorio de Hugging Face, identificado como `sinxbycosx/tds-carbon-card`, no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella ambiental de un proceso de fine-tuning realizado en el marco de la asignatura TDS GA8. El autor, `sinxbycosx`, ha publicado únicamente metadatos sobre emisiones de CO₂, consumo energético y hardware utilizado, siguiendo el estándar de metadatos `co2_eq_emissions` de Hugging Face.

La relevancia de este repositorio radica en su contribución a la transparencia ambiental en el entrenamiento de modelos, un aspecto cada vez más demandado por la comunidad investigadora y regulatoria. No obstante, al no incluir pesos, arquitectura ni código de inferencia, no puede utilizarse como un modelo desplegable. Su valor es exclusivamente documental y de auditoría.

En cuanto a los datos técnicos, se registra un entrenamiento de fine-tuning sobre 7 GPUs NVIDIA T4 en la región europe-west4, con un total de 284 horas de GPU, un consumo energético de 173,95 kWh y unas emisiones de 34,79 kg de CO₂ equivalente. No se especifica el modelo base, el conjunto de datos ni la tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos de emisiones registrados en el repositorio:

| Metrica | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 34,79 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |
| Ubicacion geografica | europe-west4 |
| Hardware utilizado | NVIDIA T4 (7 GPUs) |
| Horas de GPU | 284 h (PUE: 1,25) |
| Energia total consumida | 173,95 kWh |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio no incluye detalles del modelo base ni de su configuración. El proceso documentado corresponde a un fine-tuning, lo que implica que se partió de un modelo preentrenado y se ajustaron sus pesos para una tarea específica, pero no se indica cuál.

Los únicos datos de entrenamiento disponibles son los relativos al consumo de recursos: 7 GPUs NVIDIA T4, 284 horas de GPU, un factor de eficiencia energética (PUE) de 1,25 y un consumo total de 173,95 kWh. La medición de emisiones se realizó con la herramienta CodeCarbon, que estima las emisiones de CO₂ en función de la ubicación geográfica y el mix eléctrico de la región (europe-west4). No se menciona el uso de técnicas como RLHF, DPO ni ninguna innovación arquitectónica.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA funcional, por lo que no ofrece capacidades de generación de texto, razonamiento, código, visión ni ninguna otra tarea de inferencia.
- La única "capacidad" es la de servir como registro de sostenibilidad y trazabilidad del entrenamiento, útil para auditorías ambientales y cumplimiento de estándares de IA responsable.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como evidencia documental del impacto ambiental de un entrenamiento concreto, permitiendo a organizaciones reportar sus emisiones de CO₂ ante reguladores o iniciativas de transparencia.
- Investigación en Green AI: los datos de emisiones y consumo energético pueden utilizarse en estudios académicos sobre la huella de carbono del fine-tuning, comparando hardware y regiones.
- Cumplimiento de políticas internas de RSC: empresas que exigen a sus equipos de ML documentar el coste energético de cada entrenamiento pueden usar este formato como plantilla.
- Benchmarking de eficiencia energética: los valores de kWh por hora de GPU y kg CO₂eq por entrenamiento permiten comparar la eficiencia de diferentes configuraciones de hardware y ubicaciones.
- Formación en prácticas de IA responsable: el repositorio puede emplearse como ejemplo didáctico en cursos sobre ética y sostenibilidad en machine learning.
- Trazabilidad en experimentos reproducibles: aunque no se publican los pesos, el registro de emisiones complementa la documentación de un experimento, facilitando la reproducibilidad y la rendición de cuentas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros sistemas. Los únicos datos numéricos son los relativos a consumo energético y emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPUs NVIDIA T4, un hardware de gama media orientado a inferencia y fine-tuning ligero.
- No se especifican requisitos de VRAM para inferencia, ya que no se proporcionan pesos del modelo.
- Para reproducir el fine-tuning se necesitaría un entorno con al menos 7 GPUs T4 (o equivalente) y una infraestructura en la región europe-west4 para replicar el mix eléctrico.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que desplegar.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino un registro de emisiones. No existen modelos comparables en cuanto a capacidades de inferencia. En el ámbito de las carbon cards, se han encontrado repositorios similares como `jayiitm/tds-carbon-card` y `24f1002805/tds-carbon-card`, que siguen el mismo formato de contabilidad de carbono, pero no ofrecen datos de modelo adicionales.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni código de inferencia. Intentar usarlo como modelo producirá errores.
- Falta de información crítica: no se especifica el modelo base, la tarea, el dataset ni la configuración de entrenamiento, lo que limita cualquier análisis técnico.
- Datos de emisiones dependientes de la región: el valor de 34,79 kg CO₂eq está calculado para europe-west4; en otras regiones con distinto mix eléctrico el resultado variaría.
- Sin licencia declarada: no se indica bajo qué términos se distribuye el contenido, lo que dificulta su reutilización legal.
- Riesgo de interpretación errónea: al estar etiquetado como "model card", podría confundirse con un modelo real, cuando en realidad es solo un registro ambiental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sinxbycosx/tds-carbon-card
- Repositorios similares (mismo formato): https://huggingface.co/jayiitm/tds-carbon-card y https://huggingface.co/24f1002805/tds-carbon-card
- Directorio de sostenibilidad de modelos de IA (carbontxt.org): https://carbontxt.org/ai-model-cards
- Artículo académico sobre cuantificación de emisiones en entrenamiento de IA: https://arxiv.org/abs/2605.01549
