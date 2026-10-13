# MulticulturalAlignment/scpo-reward-model-new-zealand

## Resumen

El SCPO Reward Model — New Zealand es un modelo de recompensa escalar (reward model) obtenido por ajuste fino completo del modelo base OpenAssistant/reward-model-deberta-v3-base, que a su vez es un DeBERTa-v3-base con 184.422.913 parametros. Lo desarrolla el grupo MulticulturalAlignment y se enmarca en la investigacion sobre alineamiento pluralista: en lugar de predecir una unica preferencia agregada de anotadores, el modelo se reentrena por pais para reflejar mejor las preferencias de usuarios residentes en Nueva Zelanda.

El modelo no genera texto: recibe un prompt y una respuesta y devuelve una puntuacion escalar, donde valores mas altos indican una respuesta preferida para ese mismo prompt. Las puntuaciones no son probabilidades ni estan calibradas entre modelos distintos. Se ha entrenado con pares de preferencia del dataset PRISM (HannahRoseKirk/prism-alignment) filtrando las respuestas asociadas a participantes residentes en Nueva Zelanda.

Su relevancia actual reside en el algoritmo SCPO (Steerable Cultural Preference Optimization), presentado en el paper arXiv:2606.18606 y aceptado en el taller Pluralistic Alignment de ICML 2026. Los resultados registrados por el autor indican una mejora de precision del 56,5460 % (modelo global de partida) al 62,3955 % (modelo SCPO), lo que ilustra como el ajuste por cultura mejora la prediccion de preferencias nacionales sin partir de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 (DeBERTa-v3-base), con cabeza de clasificacion de secuencia escalar |
| Parametros totales | 184.422.913 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entradas de entrenamiento recortadas y rellenadas a 512) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa-v2 heredado del modelo base OpenAssistant/reward-model-deberta-v3-base (revision 7dab4156e63944834c3aae169c3fe83955672cff), al que se le anade una cabeza de clasificacion de secuencia que produce un unico logit escalar de recompensa. El ajuste es de modelo completo (full-model fine-tuning), no de adaptadores, y el modelo esta pensado para evaluacion en modo `eval()` (sin dropout).

Los datos de entrenamiento provienen del dataset PRISM (revision 18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6), del cual se extraen pares de preferencia. El split de usuarios de la encuesta es 85/15 y se excluyen los empates en las valoraciones humanas. Las entradas originales usan el formato literal `prompt + " [SEP] " + respuesta`, recortadas y rellenadas a 512 tokens. Los hiperparametros registrados son: learning rate 1e-06, batch size 8, 1024 pasos del optimizador, tau de filtrado 0,5 y beta de ponderacion 1,1, con semillas de shuffle de datos 0, de split/encuesta 0 y del Trainer 42. La innovacion tecnica es el propio algoritmo SCPO, que combina filtrado de pares y una funcion de perdida ponderada para incorporar preferencias culturales diversas de forma equilibrada sin perder el conocimiento del modelo global. El autor advierte que estas puntuaciones de checkpoint difieren de las medias de tres ejecuciones del paper y que `validation.json` solo comprueba la carga e inferencia finita y repetible, no es un benchmark.

## Capacidades

- Puntuacion de recompensa escalar: dado un prompt y una respuesta, devuelve un logit que ordena respuestas segun su preferencia para ese prompt.
- Modelado de preferencias culturales por pais: especializado en preferencias de participantes residentes en Nueva Zelanda.
- Clasificacion de texto (pipeline `text-classification`) mediante `AutoModelForSequenceClassification`.
- Inferencia en modo evaluacion reproducible con `torch.inference_mode()`.
- Soporte de lotes de interaccion de hasta ocho pares prompt/respuesta sin truncamiento explicito en la puntuacion original.
- Compatibilidad con Text Embeddings Inference y endpoints (tag `text-embeddings-inference`, `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio (es un reward model, no un modelo generativo).

## Casos de uso

- Filtrado y reranking de respuestas en un pipeline de RLHF/DPO: usar el modelo como funcion de recompensa para puntuar candidatos generados por un LLM y seleccionar el mejor para usuarios de Nueva Zelanda, aprovechando su ajuste cultural especifico.
- Evaluacion de sistemas de IA orientados a audiencias neozelandesas: puntuar pares de respuestas y medir si el sistema se alinea con las preferencias registradas de ese grupo, comparando con el modelo global de partida.
- Investigacion en alineamiento pluralista: comparar las puntuaciones de este checkpoint con las de otros paises del mismo proyecto para estudiar divergencias de preferencia entre culturas.
- Construccion de datasets de preferencia aumentados: emplear el modelo para etiquetar automaticamente pares prompt/respuesta en ingles y prefiltrar candidatos antes de la anotacion humana.
- Ajuste supervisado o DPO con senal de recompensa: integrar el modelo como componente de puntuacion en pipelines de entrenamiento de modelos generativos destinados a ese mercado.
- Control de calidad en asistentes conversacionales: evaluar respuestas de un chatbot en produccion y detectar aquellas mal alineadas con las preferencias locales antes de publicarlas.
- Analisis comparativo de proveedores de modelos: usar la misma funcion de recompensa para ordenar las salidas de distintos LLM sobre un conjunto fijo de prompts y decidir cual desplegar.

## Benchmarks y rendimiento

Los unicos datos disponibles son las mediciones de experimento registradas por el autor (precision global de preferencia, sin reinicio de modo de modelo ni de estado aleatorio antes de puntuar). No son medias de tres ejecuciones y pueden variar en una sesion limpia de `eval()`.

| Medicion | Precision |
|---|---:|
| Modelo global de partida, global | 56,5460 % |
| Modelo SCPO, global | 62,3955 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, dado que se trata de un reward model y no de un modelo generativo evaluable con esas pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 aproximadamente 0,7 GB de pesos (el tamano del repositorio es de 0,7 GB); en fp16 alrededor de 0,37 GB, mas activaciones minimas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; por ejemplo RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque estan sobredimensionadas para 184 M de parametros.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (referencia oficial), Text Embeddings Inference (tag del modelo), y endpoints compatibles; tambien es convertible a otros formatos de inferencia si se necesita, aunque no se publican cuantizaciones oficiales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCPO Reward Model — New Zealand | 184,4 M | 512 | Reward model cultural (Nueva Zelanda) | MIT | HuggingFace |
| OpenAssistant/reward-model-deberta-v3-base | 184,4 M (misma base) | 512 | Reward model global agregado | MIT | HuggingFace |
| Otros checkpoints SCPO por pais del mismo proyecto | no disponible | 512 (presumible, misma base) | Reward model cultural | MIT | no disponible en la informacion |

El comparador mas directo es el modelo base del que deriva: comparten arquitectura, tamano y contexto, pero difieren en el ajuste cultural (el SCPO esta especializado en Nueva Zelanda y parte del global). No se dispone de datos sobre otros reward models comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: es exclusivamente un modelo de puntuacion; no puede usarse como LLM.
- Las puntuaciones no son probabilidades y no estan calibradas entre modelos distintos, por lo que no deben compararse valores absolutos entre checkpoints.
- Las etiquetas de pais reflejan la residencia de los participantes de la encuesta, no una representacion de la cultura del pais ni de las preferencias de todos sus residentes.
- La muestra es mayoritariamente en ingles y los conjuntos de test por pais son pequenos, lo que limita la generalizacion.
- No esta validado para decisiones de consecuencias sobre personas.
- Riesgo de sesgo derivado del dataset PRISM y de la distribucion de anotadores; el autor no documenta analisis de sesgos adicionales en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si puede asignar puntuaciones erroneas fuera de la distribucion de entrenamiento.
- Estado de entrenamiento: los resultados registrados proceden de una sesion en memoria sin reinicio de modo o semilla, por lo que una sesion limpia de `eval()` puede dar cifras distintas.
- Restricciones de licencia: los pesos ajustados y el modelo base son MIT. Sin embargo, el dataset PRISM lista el texto humano como CC-BY-4.0 y las respuestas de modelo como CC-BY-NC-4.0, sujetas a los terminos del proveedor original; conviene revisar implicaciones de uso comercial si se redistribuyen datos derivados. El paquete no incluye registros de PRISM.

## Enlaces

- HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-new-zealand
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Paper: https://arxiv.org/abs/2606.18606
- PDF del paper: https://arxiv.org/pdf/2606.18606v1
- Pagina en ICML 2026 (taller Pluralistic Alignment): https://icml.cc/virtual/2026/75659
- Codigo: https://github.com/minsik-ai/Steerable-Cultural-Preference
- Resumen en Emergent Mind: https://www.emergentmind.com/papers/2606.18606
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Licencia MIT: https://opensource.org/license/mit
