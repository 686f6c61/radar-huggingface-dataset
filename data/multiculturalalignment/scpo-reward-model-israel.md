# MulticulturalAlignment/scpo-reward-model-israel

## Resumen

El modelo `MulticulturalAlignment/scpo-reward-model-israel` es un modelo de recompensa (reward model) escalar desarrollado por el grupo MulticulturalAlignment, resultado de aplicar el algoritmo SCPO (Steerable Cultural Preference Optimization) sobre el checkpoint `OpenAssistant/reward-model-deberta-v3-base`. Su funcion es asignar una puntuacion escalar a una respuesta dada una instruccion, de modo que puntuaciones mas altas indican una respuesta preferida. La particularidad de esta variante es que ha sido reajustada para reflejar las preferencias de participantes residentes en Israel, extraidas de pares de preferencia del conjunto PRISM.

Tecnicamente se trata de un transformer encoder de la familia DeBERTa con 184.422.913 parametros, entrada limitada a 512 tokens y clasificacion de secuencia con una unica salida escalar. El modelo fue reentrenado mediante ajuste fino completo (full-model fine-tuning) con learning rate 1e-6, batch size 8 y 1024 pasos de optimizador. Segun la model card, la precision global paso del 63,0282 % (modelo global de partida) al 66,9014 % (modelo SCPO), lo que supone una mejora de casi 3,9 puntos en la metrica registrada durante el experimento.

Su relevancia radica en el contexto del articulo "Steerable Cultural Preference Optimization of Reward Models", que propone adaptar un reward model global a preferencias culturales concretas sin perder rendimiento general, con una eficiencia de datos de hasta un 280 % superior al ajuste fino con el conjunto completo. La ficha describe un artefacto de investigacion sobre alineamiento pluralista, no un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia DeBERTa (tag `deberta-v2`; modelo base `OpenAssistant/reward-model-deberta-v3-base`) |
| Parametros totales | 184.422.913 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (entradas recortadas y rellenadas a 512) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors; cargable en fp32/fp16/bf16 segun el runtime) |
| Idiomas soportados | en (ingles; muestra dominante en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | OpenAssistant/reward-model-deberta-v3-base |
| Dataset de ajuste | HannahRoseKirk/prism-alignment |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo DeBERTa con cabeza de clasificacion de secuencia que produce un unico logit escalar (reward). No genera texto: recibe un par prompt-respuesta y devuelve una puntuacion de preferencia. Durante el entrenamiento original las entradas usan el formato literal `prompt + " [SEP] " + response`, recortadas y rellenadas a 512 tokens. En la fase de scoring original se emplean pares prompt/respuesta del tokenizador en lotes de interaccion de como maximo ocho, sin truncamiento explicito.

El ajuste se realizo como fine-tuning completo desde la revision `7dab4156e63944834c3aae169c3fe83955672cff` del modelo base, usando la revision `18ab5cfb37456f4ec8cbc00212ce54cf7b1239f6` del dataset PRISM. Hiperparametros registrados: learning rate 1e-6, batch size 8, 1024 pasos de optimizador, filtrado tau = 0,5, ponderacion beta = 0,8, semilla de mezcla de datos 2, semilla de particion de encuesta/modelo 0, semilla del Trainer 42 (semilla de datos del Trainer sin definir). La particion de usuarios de la encuesta fue 85/15 y los empates en valoracion humana se excluyeron de los pares de preferencia.

La innovacion central no esta en la arquitectura sino en el algoritmo SCPO: partiendo de un reward model global entrenado con preferencias humanas agregadas, se reentrena por pais para que refleje mejor las preferencias de los usuarios residentes en ese pais, aplicando una ponderacion que mitiga el sesgo excesivo hacia subcomunidades concretas. La model card indica que las configuraciones se ajustaron sobre una particion de test fija y que estos resultados de checkpoint difieren de las medias de tres ejecuciones del articulo.

## Capacidades

- Puntuacion de recompensa escalar: asigna un valor numerico a una respuesta dado un prompt, donde mayor puntuacion implica mayor preferencia.
- Clasificacion de texto (pipeline `text-classification`): tarea principal para la que esta etiquetado el modelo.
- Modelado de preferencias culturales: variante reajustada para preferencias de participantes residentes en Israel, dentro del marco SCPO.
- Comparacion de respuestas: permite ordenar o filtrar respuestas candidatas por preferencia estimada.
- Uso como componente en pipelines de RLHF/DPO: puede integrarse como senal de recompensa en el entrenamiento o evaluacion de LLM.
- Inferencia en modo `eval()` repetible sobre sondas genericas, segun `validation.json` (no es un benchmark).
- No soporta tool calling ni function calling: es un modelo de clasificacion, no generativo.
- No soporta agentes ni razonamiento multi-paso: no genera texto.
- Capacidades multilingues limitadas: idioma declarado en (ingles).
- No tiene modo de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Evaluacion de respuestas de LLM para audiencias israelies: puntuar pares prompt-respuesta y medir si las respuestas encajan mejor con las preferencias de residentes en Israel que el modelo global de partida.
- Filtrado de candidatos en RLHF/DPO: usar el escalar de recompensa para ordenar multiples respuestas generadas y seleccionar la mejor durante el ajuste de un modelo de lenguaje.
- Investigacion en alineamiento pluralista: comparar esta variante por pais con las equivalentes para otras jurisdicciones con el fin de estudiar como varian las preferencias entre culturas.
- Auditoria de sesgo cultural: analizar diferencias de puntuacion frente al reward model global para detectar y cuantificar sesgos hacia subcomunidades.
- Validacion de asistentes conversacionales localizados: comprobar en un pipeline de QA que las respuestas del asistente superan un umbral de preferencia antes de desplegarlas en un mercado concreto.
- Reproducibilidad de experimentos academicos: el repositorio incluye scripts en `reproduction/` y ficheros `release-settings.json` y `provenance.json` para replicar el entrenamiento y el scoring con el entorno registrado.
- Componente de investigacion en articulos sobre cultura y preferencias: proporciona un artefacto acotado (184 M de parametros) facil de ejecutar en un solo dispositivo para experimentos de comparacion.

## Benchmarks y rendimiento

Datos publicados en la model card (precision del experimento, no medias de tres ejecuciones):

| Medicion | Precision |
|---|---:|
| Modelo global de partida, global | 63,0282 % |
| Modelo SCPO, global | 66,9014 % |

Notas de la model card: son puntuaciones originales en memoria tras el post-entrenamiento, sin reinicio de modo modelo ni de estado aleatorio antes del scoring. Una sesion de inferencia nueva en `eval()` desactiva el dropout y puede producir una precision distinta. El fichero `validation.json` solo comprueba la carga y la inferencia finita y repetible sobre sondas genericas; no es un resultado de benchmark.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: con 184 M de parametros, aproximadamente 0,74 GB en fp32 y 0,37 GB en fp16/bf16 solo para pesos; el consumo total en inferencia suele quedar por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; el modelo es holgadamente ejecutable en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (`AutoModelForSequenceClassification`), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`); tambien es viable exportar a ONNX.
- Latencia y throughput: no disponible en la informacion proporcionada. Al ser un encoder de 184 M de parametros con contexto de 512 tokens, la latencia por par prompt-respuesta es baja y permite procesar lotes grandes en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scpo-reward-model-israel | 184,4 M | 512 tokens | Reward model / clasificacion | MIT | HuggingFace |
| OpenAssistant/reward-model-deberta-v3-base (base) | ~184 M | 512 tokens | Reward model / clasificacion | MIT | HuggingFace |
| Otras variantes SCPO por pais (misma familia) | ~184 M | 512 tokens | Reward model / clasificacion | MIT | HuggingFace (segun publicacion) |

El modelo base conserva la misma arquitectura y tamano, pero no incorpora el ajuste por pais: la diferencia medida en la model card es de 63,0282 % a 66,9014 %. Las variantes SCPO para otros paises comparten arquitectura, licencia y configuracion de inferencia, y se diferencian unicamente por el subconjunto de preferencias usado en el reentrenamiento. No se dispone de datos de rendimiento frente a reward models de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: es un modelo de recompensa y no debe usarse para producir respuestas.
- Las puntuaciones no son probabilidades ni estan calibradas entre modelos, por lo que no son comparables directamente con las de otros reward models.
- Las etiquetas de pais reflejan la residencia de los participantes, no una representacion de la cultura de un pais ni de las preferencias de todos sus residentes.
- La muestra esta dominada por el ingles y los conjuntos de test por pais son pequenos, lo que limita la generalizacion.
- No esta validado para decisiones consecuenciales sobre personas; su uso previsto es la investigacion en modelado de preferencias y alineamiento pluralista.
- Riesgo de sesgo: el propio articulo analiza el sesgo evaluando por separado las preferencias de subcomunidades; la ponderacion de SCPO lo mitiga, pero no lo elimina.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la puntuacion puede favorecer respuestas plausibles que no sean factualmente correctas si asi se refleja en los datos de preferencia.
- Licencia MIT para los pesos, pero el dataset PRISM marca el texto humano como CC-BY-4.0 y las respuestas de modelo como CC-BY-NC-4.0, sujeto a los terminos originales de cada proveedor; este paquete no incluye registros de PRISM.
- Los resultados registrados corresponden a una unica particion de test y difieren de las medias de tres ejecuciones del articulo.
- Fecha de publicacion del modelo en el repositorio: el 12 de octubre de 2026, con actualizacion el 13 de octubre de 2026, coherente con un artefacto de investigacion reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MulticulturalAlignment/scpo-reward-model-israel
- Modelo base: https://huggingface.co/OpenAssistant/reward-model-deberta-v3-base
- Dataset PRISM: https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Articulo (arXiv): https://arxiv.org/abs/2606.18606
- Repositorio de codigo: https://github.com/minsik-ai/Steerable-Cultural-Preference
- Ficha en Semantic Scholar: https://www.semanticscholar.org/paper/Steerable-Cultural-Preference-Optimization-of-Oh-Deepak/35843b6fd2f6a0fa02c6c633d2136f02b4c481a4
- Resumen del articulo (ai-deep-signal): https://ai-deep-signal.com/article/6b66b771-9426-4cc9-8d02-2d5dd67e8424
- Resumen del articulo (papers.cool): https://papers.cool/arxiv/2606.18606
- Licencia MIT: https://opensource.org/license/mit
