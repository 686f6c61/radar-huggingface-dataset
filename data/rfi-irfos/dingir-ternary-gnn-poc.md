# rfi-irfos/dingir-ternary-gnn-poc

## Resumen

DINGIR Ternary-Weight GNN, Arm D es un checkpoint de investigación publicado por RFI-IRFOS, un instituto de investigación independiente con sede en Graz (Austria) que desarrolla la Ternary Intelligence Stack (TIS), una plataforma de IA post-binaria basada en aritmética ternaria balanceada {-1, 0, +1}. Este modelo demuestra que es posible aplicar cuantización ternaria de pesos (estilo BitNet-b1.58, con escala absmean y straight-through estimator) al 99,5 % de la masa paramétrica de un GNN de producción real, con una pérdida de calidad acotada en la predicción de existencia de enlaces en un grafo de conocimiento.

El checkpoint corresponde a una variante específica (Arm D) de KindomGNN, el GNN de producción de DINGIR: una red convolucional de grafos (GCN) de 2 capas con atención y residual, rematada con una cabeza de scoring de relaciones tipo DistMult. El modelo tiene 1.641.632 parámetros totales, de los cuales 1.633.568 (99,5 %) se ternarizan en tiempo de forward a partir de los pesos float32 almacenados. Está entrenado sobre el grafo real de entidades de DINGIR (50.729 nodos, 214.162 aristas entrenables) y reporta una AUC media de 0,6410 y un MRR de relación medio de 0,5649 en tres semillas. Es un prototipo de investigación, no un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GCN de 2 capas con atención (GAT-style), residual y head DistMult para link prediction |
| Parametros totales | 1.641.632 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de grafos, no de texto) |
| Tipos de cuantizacion | Ternaria de pesos {-1, 0, +1} con escala absmean por tensor y umbral tau=0,05; solo en forward pass |
| Idiomas soportados | No aplica (modelo sobre grafos de entidades; etiquetas y datos en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoint PyTorch (.pt) con parámetros float32; la ternarización se reproduce en tiempo de forward a partir de los floats almacenados |

## Arquitectura y entrenamiento

El modelo es un GCN de 2 capas con pesos ternarizados en tres submódulos: la tabla de embeddings de nodos (`nn.Embedding(50729, 32)`, que concentra el 98,9 % de los parámetros), la capa de fusión de características (`nn.Linear(94, 64)`) y la segunda capa GCN (`nn.Linear(64, 64)`). Los sesgos de estas capas y el resto de submódulos —parámetros de atención GAT (`att_src`, `att_dst`), embedding de relaciones (`rel_embed`) y puerta softplus de relaciones (`rel_gate`)— permanecen en float32. La selección de submódulos (Arm D) proviene de un barrido previo de 18 ejecuciones que mostró que ternarizar también `rel_embed` y `rel_gate` degradaba el MRR de ranking de relaciones (0,5863 con Arm D solo, frente a 0,5664 añadiendo `rel_embed` y 0,5473 añadiendo `rel_gate`).

La cuantización sigue el esquema BitNet-b1.58: escala por tensor `gamma = media(|w|)`, umbral `tau * gamma` con `tau = 0,05`, pesos por debajo del umbral a 0 y el resto a `sign(w) * gamma`. El entrenamiento usa un estimador de paso recto (straight-through estimator): el forward ve el valor ternarizado, pero los gradientes fluyen sin cambios al parámetro float32 subyacente. El checkpoint almacena los floats entrenados, no una codificación empaquetada de 2 bits, por lo que ocupa ~6,5 MB en lugar de los ~1,6 MB que tendría una exportación 2-bit/int8 real. El entrenamiento se realizó en Modal (16 GiB RAM, 4 CPU) con 3 semillas, sobre el grafo real de producción (50.729 nodos, 482.850 aristas, de las cuales 214.162 son entrenables tras excluir 268.688 aristas tautológicas `EXPOSES`), con partición hash-held-out y paso de mensajes restringido a aristas de entrenamiento (topology holdout).

## Capacidades

- Predicción de existencia de enlaces (link prediction) en grafos de conocimiento con tipos de nodos heterogéneos (~40 tipos: países, entidades sancionadas, desastres, empresas, eventos geopolíticos).
- Scoring de relaciones tipado mediante head DistMult, que permite ranking de relaciones plausibles entre pares de entidades.
- Cuantización ternaria de pesos demostrada sobre el 99,5 % de la masa paramétrica con pérdida acotada de calidad (AUC media 0,6410 vs. 0,6429 del control no ternario en el mismo grafo).
- Capacidad de razonamiento sobre grafos con atención ponderada y conexiones residuales entre capas.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo puramente estructural para grafos.

## Casos de uso

- Detección de relaciones entre entidades sancionadas y empresas: el modelo puede predecir si existe un vínculo (por ejemplo, propiedad, control o financiación) entre una entidad sancionada y una empresa, usando el embedding ternarizado de nodos y el head DistMult para tipificar la relación.
- Enriquecimiento de grafos de inteligencia de código abierto (OSINT): dado un grafo de eventos geopolíticos, desastres y empresas, el modelo sugiere nuevas aristas plausibles que un analista puede verificar manualmente, reduciendo el esfuerzo de curado.
- Validación de consistencia de grafos: al predecir la probabilidad de existencia de enlaces, puede detectar aristas espurias o faltantes en un grafo de conocimiento en evolución, como el que mantiene DINGIR tras ingestas de SEC EDGAR o datos AIS marítimos.
- Investigación en cuantización extrema de GNN: sirve como banco de pruebas para estudiar el impacto de la ternarización de pesos en métricas de link prediction, comparando con el baseline float32 (AUC 0,7598, MRR 0,8706 en el grafo histórico).
- Prototipado de modelos de grafos eficientes en memoria: con solo 1,6 M de parámetros y un checkpoint de ~6,5 MB, es viable para entornos con restricciones de almacenamiento o para despliegue en dispositivos de bajos recursos, aunque no se ha optimizado ningún kernel de inferencia rápida.
- Reproducción de experimentos de cuantización: el repositorio incluye el código del experimento (`intelligence/gnn_weight_ternary_experiment.py`) y las medidas (`intelligence/MEASUREMENTS.md`), lo que permite replicar el barrido de 18 ejecuciones y validar los resultados reportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo es un GNN de investigación, no un LLM. Los datos de rendimiento disponibles se refieren a la tarea de link prediction y se resumen a continuación.

| Metrica | Valor (este checkpoint, seed 42) | Media 3 semillas (42/43/44) | Baseline producción (float32, grafo histórico) |
|---|---|---|---|
| test_auc | 0,6461 | 0,6410 | 0,7598 |
| relation_mrr | 0,5618 | 0,5649 | 0,8706 |

Comparación con el barrido original (2026-08-29, Arm D):

| | test_auc (media) | relation_mrr (media) | aristas entrenables | nodos |
|---|---|---|---|---|
| Barrido original, Arm D | 0,6469 | 0,5863 | 113.737 | 50.861 |
| Ejecución actual, Arm D | 0,6410 | 0,5649 | 214.162 | 50.729 |
| Diferencia | -0,0059 | -0,0214 | +100.425 | -132 |

La AUC se mantiene esencialmente plana dentro del ruido entre semillas, mientras que el MRR de relación muestra un descenso modesto y real. La caída frente al baseline de producción se atribuye al crecimiento del grafo (+25,6 % en aristas por ingestas de SEC EDGAR y AIS marítimo) y a diferencias en el harness de evaluación, no a la ternarización, según el barrido original ya documentado.

## Requisitos de hardware

- El modelo tiene 1.641.632 parámetros (~6,5 MB en float32), por lo que la inferencia es viable en CPU sin GPU. No se han publicado requisitos oficiales de VRAM.
- El entrenamiento se realizó en una instancia Modal con 16 GiB de RAM y 4 CPU; no se requiere GPU para reproducir el entrenamiento a esta escala.
- Cabe en cualquier GPU consumer (p. ej., RTX 3060 o superior) y en hardware de borde, aunque no se ha implementado ningún kernel de inferencia específico para la cuantización ternaria (la ternarización es una operación en tiempo de forward, no una exportación empaquetada).
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El checkpoint es un archivo `.pt` de PyTorch, por lo que el despliegue requiere cargarlo con PyTorch y ejecutar el código de forward del modelo.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de milisegundos en CPU para grafos del orden de 50.000 nodos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No existen modelos comparables directos en la misma categoría (GNN ternario de investigación para link prediction). La comparación más relevante es con el propio modelo sin ternarizar y con el barrido original:

| Modelo | test_auc | relation_mrr | Parámetros | Cuantización | Licencia |
|---|---|---|---|---|---|
| DINGIR Arm D (este checkpoint) | 0,6410 | 0,5649 | 1,64 M | Ternaria (99,5 % pesos) | CC-BY-4.0 |
| DINGIR producción (float32) | 0,7598 | 0,8706 | ~1,64 M | Ninguna | No especificada |
| Barrido original Arm D (2026-08-29) | 0,6469 | 0,5863 | ~1,64 M | Ternaria | No especificada |

La comparación con el baseline de producción no es apples-to-apples por el crecimiento del grafo entre ambos entrenamientos. No se dispone de otros GNN ternarios públicos con los que comparar.

## Limitaciones y advertencias

- Es un prototipo de investigación, no un modelo de producción. El autor lo declara explícitamente: "no es una optimización de velocidad, no es una arquitectura totalmente ternaria, y no es el modelo que realmente corre en producción".
- La ternarización se aplica solo a los pesos de tres submódulos (embed, lin1, lin2); el resto de parámetros permanecen en float32. No es una arquitectura ternaria completa.
- El checkpoint almacena pesos float32, no una codificación empaquetada de 2 bits. La cuantización se reproduce en tiempo de forward, por lo que no hay ganancia de velocidad ni de memoria en inferencia frente al modelo float32.
- El rendimiento (AUC 0,6410, MRR 0,5649) es significativamente inferior al baseline de producción (0,7598 y 0,8706), aunque parte de esa diferencia se atribuye al crecimiento del grafo y a diferencias de evaluación, no a la ternarización.
- El MRR de relación muestra un descenso real de -0,0214 frente al barrido original, atribuido al aumento de aristas entrenables (+100.425) y a posibles cambios de deduplicación de nodos.
- Riesgo de sesgos: no se han evaluado sesgos del modelo; al operar sobre entidades geopolíticas y empresas, podría reflejar sesgos presentes en los datos de origen.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no tiene garantías de idoneidad para producción.
- Idioma: los datos y la documentación están en inglés; no hay soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rfi-irfos/dingir-ternary-gnn-poc
- Repositorio GitHub de la Ternary Intelligence Stack: https://github.com/rfi-irfos/ternary-intelligence-stack
- Perfil de GitHub de RFI-IRFOS: https://github.com/rfi-irfos/
- Sitio web de RFI-IRFOS: https://rfi-irfos.com/
- Perfil de RFI-IRFOS en HuggingFace: https://huggingface.co/rfi-irfos/about/blob/main/README.md
- Entrada en OSSPath: https://osspath.com/oss/rfi-irfos/ternary-intelligence-stack
