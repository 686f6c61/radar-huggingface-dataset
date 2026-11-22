# songbirdini/callmark-dualwhisper

## Resumen

CallMark DualWhisper es un modelo de bioacústica publicado por el usuario songbirdini como parte de la reproducibilidad del artículo CallMark. Se trata de una adaptación de `nccratliri/whisperseg-large-ms` orientada a la detección e identificación de vocalizaciones animales en una sola pasada, es decir, un modelo que combina localización temporal (detección) y clasificación taxonómica (identificación) en lugar de encadenar dos sistemas separados.

El repositorio contiene tres variantes del modelo entrenadas con 50, 100 y 500 vocalizaciones de entrenamiento por taxón, lo que permite estudiar el comportamiento del modelo en escenarios de pocos datos. Cada variante incluye un checkpoint en formato `transformers` (`final_checkpoint`) y una conversión a CTranslate2 (`final_checkpoint_ct2`) que es la que se utiliza para la inferencia en los scripts de predicción del repositorio asociado.

El modelo es relevante para investigadores en ecoacústica y monitorización de biodiversidad que necesiten pipelines reproducibles de detección y clasificación de cantos de aves u otros taxones, con la posibilidad de evaluar el efecto del tamaño del conjunto de entrenamiento. El repo ocupa 23,2 GB y no declara licencia propia más allá de la del modelo original del que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de `nccratliri/whisperseg-large-ms`, presumiblemente transformer de audio, sin detalle en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `transformers` y CTranslate2; no se detallan cuantizaciones) |
| Idiomas soportados | no aplica / no disponible (modelo bioacústico, no lingüístico) |
| Licencia | no disponible (la model card indica que se aplican los términos de `nccratliri/whisperseg-large-ms`) |
| Formato de pesos | safetensors (checkpoint `transformers`) y CTranslate2 (`final_checkpoint_ct2`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo único que se indica es que el modelo deriva de `nccratliri/whisperseg-large-ms`, un modelo de segmentación de audio, y que la propuesta de CallMark consiste en unificar detección e identificación en un único modelo. Se desconoce el número de parámetros, la composición del dataset de audio, el número de tokens o frames de entrenamiento y si se aplicaron técnicas de ajuste fino supervisado, RLHF u otras.

El aspecto diferencial del entrenamiento documentado es la existencia de tres regímenes de datos: 50, 100 y 500 vocalizaciones por taxón. Esto sugiere un estudio de escalado en few-shot para bioacústica, donde la disponibilidad de grabaciones etiquetadas por especie es habitualmente escasa. No se detalla si el entrenamiento usó aumentación de datos, muestreo balanceado ni qué taxones se cubren.

## Capacidades

- Detección de vocalizaciones en audio: localización de eventos acústicos en el tiempo.
- Identificación taxonómica: asignación de etiqueta de taxón a cada vocalización detectada, en un solo modelo.
- Funcionamiento en regímenes de pocos datos: variantes entrenadas con 50, 100 y 500 vocalizaciones por taxón.
- Inferencia optimizada mediante CTranslate2 (`final_checkpoint_ct2`).
- Exportación a formato `transformers` para integración con el ecosistema Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio general (voz humana).

## Casos de uso

- Monitorización de biodiversidad con grabadoras autónomas: el modelo puede procesar pasivamente horas de audio de campo para detectar y etiquetar cantos, sustituyendo pipelines de dos etapas (detector + clasificador) por un único modelo.
- Estudios de reproducibilidad en bioacústica: las tres variantes (50/100/500) permiten replicar experimentos sobre el efecto del tamaño del conjunto de entrenamiento en el rendimiento de detección e identificación.
- Evaluación comparativa de arquitecturas bioacústicas: al derivar de `whisperseg-large-ms`, sirve como línea base para comparar enfoques de detección+identificación conjunta frente a sistemas en cascada.
- Prototipado rápido en proyectos de conservación: con solo 50 vocalizaciones por taxón se puede entrenar una variante útil para especies con pocos registros disponibles.
- Despliegue en entornos con recursos limitados: la conversión a CTranslate2 permite servir el modelo con menor huella de memoria y mayor throughput que el checkpoint `transformers` original.
- Investigación en ecoacústica marina o terrestre: el enfoque de detección e identificación unificada es aplicable a cantos de aves, anfibios, insectos o mamíferos marinos, siempre que se disponga de datos etiquetados del taxón objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, mAP ni comparaciones cuantitativas entre las variantes de 50, 100 y 500 vocalizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 23,2 GB e incluye tres variantes en dos formatos, por lo que el peso de un único checkpoint es sustancialmente menor, pero no se especifica.
- GPU recomendadas: no disponible. Por el tamaño del repo y la naturaleza del modelo base (`large`), es razonable esperar requisitos de GPU de gama alta, pero no hay dato confirmado.
- Compatibilidad con GPU de consumo: no confirmada. La versión CTranslate2 podría permitir inferencia en GPU de consumo con cuantización, pero no se documenta.
- Opciones de despliegue: CTranslate2 (formato `final_checkpoint_ct2`, usado por los scripts de predicción del repositorio) y `transformers` (formato `final_checkpoint`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CallMark DualWhisper | no disponible | no disponible | Detección + identificación bioacústica | no disponible (hereda de `whisperseg-large-ms`) | Hugging Face (`songbirdini/callmark-dualwhisper`) |
| `nccratliri/whisperseg-large-ms` | no disponible | no disponible | Segmentación de audio bioacústico | no disponible en esta ficha | Hugging Face |
| BirdNET | no disponible | no disponible | Identificación de cantos de aves | no disponible en esta ficha | Disponible públicamente |
| Perch | no disponible | no disponible | Clasificación de audio bioacústico | no disponible en esta ficha | Disponible públicamente |

No se dispone de datos cuantitativos para establecer una comparación de rendimiento entre estos modelos. La comparativa se limita a la categoría de tarea y a la disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni falsos positivos; en bioacústica, los falsos positivos por ruido antropogénico o por especies acústicamente similares son un riesgo habitual y no se cuantifica aquí.
- Cobertura taxonómica desconocida: no se indica qué especies o taxones cubre el entrenamiento, por lo que el modelo puede fallar en especies no representadas.
- Licencia no declarada explícitamente: se remite a los términos de `nccratliri/whisperseg-large-ms`, que deben consultarse antes de cualquier uso comercial.
- Sin métricas publicadas: no es posible evaluar la calidad de detección/identificación ni comparar las variantes de 50, 100 y 500 sin ejecutar los scripts del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- El modelo está pensado para audio bioacústico; no debe emplearse para reconocimiento de voz, procesamiento de lenguaje natural ni tareas multimodales generales.
- La fecha de creación indicada (2026-11-21) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songbirdini/callmark-dualwhisper
- Repositorio de reproducibilidad de CallMark: https://github.com/marisbasha/callmark_reproducibility
- Modelo base: https://huggingface.co/nccratliri/whisperseg-large-ms
