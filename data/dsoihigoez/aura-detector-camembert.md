# dsoihigoez/aura-detector-camembert

## Resumen

Aura Detector es un ensemble de clasificadores de texto en frances construido sobre CamemBERT, el modelo BERT preentrenado especificamente para frances por el proyecto almanach. El modelo realiza una clasificacion de texto en cuatro clases que el autor denomina "Anti-Aura", "Aura Correcte", "Forte Aura" y "Aura Divine", un sistema de puntuacion propio del proyecto Aura Detector cuyo significado semantico no se documenta en la model card.

El repositorio contiene cuatro fine-tunes independientes del modelo base: `p2_large_reg_s42/final`, `p2_cls_w3_s42/final`, `p2_cls_w3_s43/final` y `p2_cls_w3_s44/final`. La inferencia final se realiza mediante un ensemble ponderado cuyos pesos y umbrales de decision se publican en el fichero `ml/results/p2_choix.json` del repositorio del proyecto, no incluido en el propio modelo. El modelo esta etiquetado con el pipeline `text-classification` y solo declara soporte para frances (`fr`).

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. La model card es extremadamente escueta: no documenta el dataset de entrenamiento, el procedimiento de fine-tuning, hiperparametros, metricas de evaluacion ni la definicion operativa de las cuatro clases. La licencia no esta especificada. El tamano del repositorio (2.7 GB) es coherente con cuatro copias de pesos de un modelo base de aproximadamente 110 millones de parametros en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), base CamemBERT; ensemble de 4 fine-tunes |
| Parametros totales | no disponible (modelo base CamemBERT: aproximadamente 110 M por instancia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CamemBERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32 o fp16) |
| Idiomas soportados | frances (fr) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es CamemBERT (`almanach/camembert-base`), un transformer encoder de tipo BERT entrenado sobre un corpus masivo de frances con la objective de masked language modeling. Sobre esta base se han realizado cuatro fine-tunes independientes para clasificacion de texto con cuatro etiquetas de salida. Los nombres de los checkpoints (`p2_large_reg_s42`, `p2_cls_w3_s42`, `p2_cls_w3_s43`, `p2_cls_w3_s44`) sugieren variaciones de configuracion (posiblemente regularizacion, pesos de clase y semillas aleatorias 42, 43 y 44), pero la model card no explica la semantica de estas variantes ni los hiperparametros empleados.

No se documenta el volumen de datos de entrenamiento, la composicion del dataset, si se aplico aumento de datos, balanceo de clases, RLHF o DPO. Al tratarse de un clasificador discriminativo, tecnicas de alineacion tipo RLHF no aplican. La innovacion principal del proyecto es el uso de un ensemble ponderado con umbrales de decision calibrados, cuyos parametros residen en un fichero externo (`ml/results/p2_choix.json`) en lugar de estar integrados en el artefacto de Hugging Face, lo que complica la reproducibilidad y el despliegue directo.

## Capacidades

- Clasificacion de texto en frances en cuatro clases discretas (Anti-Aura, Aura Correcte, Forte Aura, Aura Divine).
- Inferencia mediante ensemble ponderado de cuatro fine-tunes, con pesos y umbrales configurables externamente.
- Procesamiento de entradas de hasta 512 tokens (limite heredado de CamemBERT base).
- No soporta generacion de texto, razonamiento generativo, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Soporte multilingue limitado al frances; no se declara capacidad en otras lenguas.
- No dispone de modo "thinking", audio ni modalidades adicionales.

## Casos de uso

- Moderacion de contenido en comunidades francesas: clasificar mensajes de foros o chats segun las cuatro categorias del proyecto para priorizar revision humana. Adecuado por su naturaleza discriminativa y bajo coste computacional, siempre que se conozca la definicion operativa de las clases.
- Filtrado de corpus para curación de datasets: etiquetar grandes volumenes de texto frances para seleccionar subconjuntos con una determinada "aura" antes de usarlos en entrenamiento de otros modelos.
- Investigacion sociolinguistica: analisis de estilo y tono en corpus franceses, usando las cuatro clases como variables dependientes en estudios empiricos.
- Sistemas de recomendacion editorial: puntuar articulos o resenas en frances para enrutarlos a distintas secciones o audiencias segun la etiqueta asignada.
- Preprocesamiento en pipelines NLP: primera etapa de clasificacion que filtra entradas antes de pasarlas a modelos generativos mas costosos, reduciendo el numero de llamadas a LLMs.
- Evaluacion comparativa de fine-tunes: dado que el repositorio contiene cuatro variantes, permite estudiar el efecto de distintas semillas y configuraciones sobre la estabilidad del clasificador en tareas de clasificacion fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, matriz de confusion ni comparaciones con otros clasificadores franceses.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB por instancia en fp32 (110 M parametros), alrededor de 2 GB para cargar las cuatro instancias del ensemble simultaneamente. En fp16, aproximadamente 0,25 GB por instancia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. RTX 3060, RTX 4090, A100 o H100 no suponen ninguna restriccion; el modelo es viable incluso en CPU.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 2060, RTX 3060, etc.) y en CPU con tiempos de inferencia del orden de milisegundos a decenas de milisegundos por muestra segun hardware.
- Opciones de despliegue: transformers con PyTorch, pipeline `text-classification`, ONNX Runtime, TGI (con soporte para clasificacion), y exportacion a otros runtimes. Dado que es un ensemble, se requiere logica adicional para combinar las cuatro salidas segun `ml/results/p2_choix.json`.
- Latencia y throughput estimados: no disponibles; al ser un encoder BERT-base de 110 M parametros, el throughput esperado en GPU es de centenares a miles de muestras por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aura Detector (este modelo) | ~110 M por instancia, ensemble de 4 | 512 tokens | Clasificacion de 4 clases en frances | no disponible | Hugging Face, 0 descargas |
| almanach/camembert-base | ~110 M | 512 tokens | MLM / base para fine-tuning | MIT (segun el proyecto almanach) | Hugging Face, ampliamente usado |
| Jean-Baptiste/camembert-ner | ~110 M | 512 tokens | NER en frances | no disponible | Hugging Face, popular |
| fpaul/camembert-base-sentiment | ~110 M | 512 tokens | Analisis de sentimiento | no disponible | Hugging Face |

La comparativa se limita a fine-tunes de CamemBERT, dado que no existen modelos publicos equivalentes al sistema de clasificacion en cuatro clases del proyecto Aura Detector. Ninguno de los comparables documenta el sistema de etiquetas "Aura", por lo que la comparacion funcional directa no es posible.

## Limitaciones y advertencias

- La definicion operativa de las cuatro clases (Anti-Aura, Aura Correcte, Forte Aura, Aura Divine) no se documenta; sin esa definicion, el modelo no es interpretable ni auditable.
- Ausencia total de metricas de evaluacion: no se puede estimar la calidad del clasificador ni su fiabilidad en produccion.
- Los pesos y umbrales del ensemble residen en un fichero externo (`ml/results/p2_choix.json`) que no se distribuye con el modelo, lo que rompe la reproducibilidad y exige pasos manuales de integracion.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido.
- Riesgo de sesgos desconocido: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos de dominio, demograficos o de estilo.
- Limitado al frances; no se declara capacidad multilingue.
- Ventana de contexto de 512 tokens heredada de CamemBERT base, insuficiente para documentos largos sin truncamiento o chunking.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso comunitario, validacion externa ni mantenimiento.
- Fecha de creacion (noviembre de 2026) y ausencia de versionado o changelog: no se puede evaluar la madurez del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsoihigoez/aura-detector-camembert
- Modelo base CamemBERT: https://huggingface.co/almanach/camembert-base
- Repositorio del proyecto Aura Detector: no disponible (referenciado como `ml/results/p2_choix.json` en la model card, sin URL publica)
- Paper de CamemBERT: https://arxiv.org/abs/1911.03894
- Documentacion de transformers text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
