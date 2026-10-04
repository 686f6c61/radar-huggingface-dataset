# Kicaulah/rag-faithfulness-evaluator

## Resumen

RAG Faithfulness & Hallucination Evaluator (v1.0.0) es un modelo de clasificación de texto publicado por el usuario Kicaulah en HuggingFace. Su función es verificar si una respuesta generada por un LLM o por un sistema RAG está factualmente anclada en los pasajes recuperados, es decir, evaluar la fidelidad al contexto en lugar de la veracidad respecto al mundo real. El autor lo describe como un evaluador calibrado, ligero y apto para producción, con licencia Apache 2.0.

El modelo se presenta como un "hybrid cross-encoder" que distingue explícitamente entre fidelidad contextual y corrección factual del mundo real, entre implicación (entailment), contradicción directa y extrapolación no soportada, y que descompone las respuestas en afirmaciones atómicas con atribución de evidencia. Según la model card, ha sido sometido a pruebas de estrés frente a perturbaciones numéricas, intercambio de fechas, sustitución de entidades, inversión de negaciones y eliminación de matices.

Es relevante porque aborda uno de los puntos débiles más habituales de los sistemas RAG en producción: la detección automática de alucinaciones sin depender de un juez LLM costoso o de clasificadores binarios poco calibrados. Declara soporte para inglés, indonesio, español, francés, alemán, chino y multilingüe en general. No se especifican en la información disponible ni el número de parámetros, ni la longitud de contexto, ni la arquitectura base concreta sobre la que se construye el cross-encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid cross-encoder (arquitectura base concreta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, id, es, fr, de, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe el sistema como un "hybrid cross-encoder" orientado a clasificación de texto (pipeline_tag: text-classification). La distinción clave frente a alternativas es que no se limita a una decisión binaria: separa fidelidad contextual (anclaje estricto en los pasajes suministrados) de corrección factual respecto al mundo real, y distingue entre implicación, contradicción directa y extrapolación no soportada. Además, realiza descomposición en afirmaciones atómicas con atribución del span de evidencia exacto.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni la arquitectura concreta subyacente. Tampoco se detalla si el entrenamiento se apoyó en datasets NLI estándar o en datos sintéticos generados para el caso de uso. La model card menciona pruebas de estrés frente a perturbaciones numéricas, intercambio de fechas, sustitución de entidades, inversión de negaciones y eliminación de cualificadores, lo que sugiere un conjunto de evaluación adversarial, pero no se especifica su construcción.

## Capacidades

- Evaluación de fidelidad al contexto: determina si una respuesta está soportada por los pasajes recuperados, independientemente de si es verdadera en el mundo real.
- Clasificación con múltiples categorías: distingue entre implicación (entailment), contradicción directa y extrapolación no soportada.
- Descomposición en afirmaciones atómicas: fragmenta la respuesta en proposiciones verificables de forma independiente.
- Atribución de evidencia: asocia cada afirmación con el span de evidencia correspondiente del contexto.
- Puntuación de fidelidad global: expone un `overall_faithfulness_score` y una categoría predicha (`predicted_category`) junto con un booleano `is_contextually_faithful`.
- Detección de fallos adversariales: robustez declarada frente a perturbaciones numéricas, swaps de fechas, sustitución de entidades, negaciones invertidas y cualificadores ausentes.
- Multilingüe: soporte declarado para inglés, indonesio, español, francés, alemán y chino.
- Integración como guardrail: pensado para su uso en pipelines de CI/CD y monitorización de alucinaciones.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explícito, visión ni audio.

## Casos de uso

- Guardrail en CI/CD de aplicaciones RAG: ejecutar el evaluador sobre respuestas generadas en tests automatizados antes de desplegar cambios en el pipeline de recuperación o en los prompts, bloqueando el despliegue si la fidelidad media cae por debajo de un umbral definido.
- Monitorización de alucinaciones en producción: puntuar en tiempo real cada respuesta servida a usuario comparándola con los pasajes recuperados, y disparar alertas cuando la proporción de afirmaciones no soportadas supera un límite.
- Filtrado de datos sintéticos: descartar pares contexto-respuesta generados por LLM que no estén anclados en el contexto fuente, antes de incorporarlos a un conjunto de entrenamiento.
- Evaluación comparativa de versiones de un sistema RAG: usar la puntuación de fidelidad y la tasa de contradicción directa como métricas objetivas para elegir entre distintos recuperadores, rerankers o configuraciones de chunking.
- Auditoría de respuestas en dominios sensibles con revisión humana: generar informes por afirmación con su span de evidencia para que un revisor humano valide rápidamente las respuestas dudosas, dado que el propio autor excluye el uso como determinación de responsabilidad legal sin revisión.
- Análisis de causa raíz de errores: al descomponer en afirmaciones atómicas, permite identificar si el fallo proviene de un pasaje recuperado incorrecto, de una extrapolación del generador o de una contradicción directa con el contexto.
- Etiquetado asistido para datasets de evaluación interna: producir etiquetas de fidelidad a escala sobre grandes volúmenes de respuestas para construir conjuntos de test propios.

## Benchmarks y rendimiento

La model card incluye resultados sobre el split de test, comparando el modelo con tres baselines internos:

| Evaluador | Accuracy | Macro F1 | Weighted F1 | MAE | Spearman rho | Latencia (ms) |
|---|---|---|---|---|---|---|
| Lexical Baseline | 0.395 | 0.267 | 0.253 | 0.364 | 0.250 | 0.3 |
| TF-IDF Baseline | 0.158 | 0.061 | 0.068 | 0.298 | 0.242 | 6.0 |
| LLM Judge Baseline | 0.447 | 0.409 | 0.413 | 0.302 | 0.394 | 0.1 |
| Hybrid Cross-Encoder (el modelo) | 0.553 | 0.595 | 0.459 | 0.271 | 0.644 | 0.5 |

No se especifica en la model card el conjunto de test empleado, su tamano, la distribucion de clases ni la identidad concreta del LLM Judge Baseline. Tampoco se publican resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificacion de este tipo.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publican parametros totales ni tamano de pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible. La latencia declarada de 0,5 ms por evaluacion y la descripcion de "lightweight" sugieren un modelo de tamano reducido, pero es una inferencia no confirmada por datos de la model card.
- Opciones de despliegue: no disponible. Solo se documenta el uso mediante el pipeline propio `FaithfulnessPipeline` del paquete `src.inference.pipeline`.
- Latencia y throughput: 0,5 ms por evaluacion en el entorno de benchmark del autor. No se especifica el hardware utilizado ni el throughput agregado.
- Requisitos de memoria en CPU: no disponible.

## Comparativa con modelos similares

No se identifican en la informacion disponible modelos publicos comparables con nombre y ficha propia. La unica comparativa aportada por el autor es contra baselines internos sin identificar:

| Alternativa | Tipo | Accuracy | Macro F1 | Spearman rho | Latencia (ms) | Licencia |
|---|---|---|---|---|---|---|
| Lexical Baseline | Baseline lexico interno | 0.395 | 0.267 | 0.250 | 0.3 | no disponible |
| TF-IDF Baseline | Baseline estadistico interno | 0.158 | 0.061 | 0.242 | 6.0 | no disponible |
| LLM Judge Baseline | Juez LLM sin identificar | 0.447 | 0.409 | 0.394 | 0.1 | no disponible |
| Hybrid Cross-Encoder (este modelo) | Cross-encoder hibrido | 0.553 | 0.595 | 0.644 | 0.5 | apache-2.0 |

No se dispone de datos de parametros, contexto ni disponibilidad de las alternativas, por lo que la comparativa se limita a las metricas reportadas.

## Limitaciones y advertencias

- La model card excluye explicitamente el uso para determinacion de responsabilidad legal sin revision humana y para decisiones clinicas medicas sin supervision de un profesional licenciado.
- Riesgo de alucinacion del propio evaluador: al ser un clasificador, puede producir falsos negativos (marcar como fiel una respuesta no soportada) o falsos positivos. No se publican tasas de error desagregadas por categoria.
- Accuracy reportada de 0.553 y Macro F1 de 0.595: aunque supera a los baselines, el rendimiento absoluto es moderado, por lo que no se recomienda como unica capa de control en produccion.
- El conjunto de test, su tamano y su distribucion no estan documentados, lo que impide valorar la significancia estadistica de los resultados.
- El LLM Judge Baseline contra el que se compara no esta identificado (modelo, version, prompt), lo que dificulta reproducir la comparativa.
- El soporte multilingue se declara para en, id, es, fr, de y zh, pero no se aportan metricas por idioma; el rendimiento fuera del ingles es desconocido.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procedencia de los datos.
- La longitud de contexto soportada no esta disponible, lo que impide saber si admite pasajes recuperados largos sin truncado.
- No se especifican formatos de pesos ni opciones de cuantizacion, lo que limita la planificacion de despliegue.
- El repositorio tiene 18 descargas y 0 likes en la fecha de consulta, por lo que se trata de un modelo sin validacion independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento, no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kicaulah/rag-faithfulness-evaluator

No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, repositorios o demos asociados. Los resultados devueltos por la busqueda no guardan relacion con este modelo y se han descartado.
