# midwestcyr/aliceai-t5-35b-jev-ru-nli-native

## Resumen

aliceai-t5-35b-jev-ru-nli-native es un adaptador LoRA de tipo cross-encoder para inferencia de lenguaje natural (NLI) en ruso, publicado por el usuario midwestcyr sobre el modelo base yandex/AliceAI-T5-35B-A0.6B. Se trata de la "etapa 2" de una continuacion de entrenamiento sobre el adaptador de la etapa 1 (aliceai-t5-35b-jev-ru-nli), especializada en datos exclusivamente nativos de ruso. El modelo resuelve la tarea de clasificacion textual de tres clases (entailment, neutral y contradiction) mediante una cabecera que procesa la premisa en el encoder, la hipotesis en el decoder y aplica un pooling sobre el ultimo token seguido de una capa lineal de 1536 a 3.

La relevancia de esta ficha es sobre todo metodologica: el propio autor la etiqueta como un resultado negativo y desaconseja su uso general. Frente a la etapa 1, la etapa 2 pierde 9,2 puntos en XNLI-ru test (de 0,732 a 0,640) y 33,9 puntos en TERRa val (de 0,485 a 0,147, por debajo del azar), mientras que en RCB val sube a 0,500, es decir, al nivel de azar. El autor recomienda explicitamente mantener la etapa 1 salvo que se necesite especificamente el comportamiento de RCB a nivel de azar.

No se dispone de informacion sobre el numero de tokens de entrenamiento totales del modelo base ni sobre su longitud de contexto. El entrenamiento de esta etapa consumio 832 pasos con un batch efectivo de 32 y un tiempo de 1 hora y 37 minutos en una A100 de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder T5 encoder-decoder (base AliceAI-T5, MoE) con adaptador LoRA; premisa al encoder, hipotesis al decoder, pooling de ultimo token y capa lineal 1536→3 |
| Parametros totales | Base: aproximadamente 35B segun el nombre del modelo (no confirmado en la informacion disponible); adaptador LoRA: no disponible |
| Parametros activos | Aproximadamente 0,6B en el modelo base segun su nombre (MoE, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre yandex/AliceAI-T5-35B-A0.6B, un modelo de la familia T5 con arquitectura encoder-decoder. La cabecera de clasificacion sigue el esquema comun en cross-encoders de NLI: la premisa se introduce en el encoder, la hipotesis en el decoder y la representacion del ultimo token se proyecta mediante una capa lineal de dimension 1536 a 3 salidas. El adaptador se carga con `PeftModel.from_pretrained(..., is_trainable=True)` para continuar el entrenamiento desde el adaptador de la etapa 1. Esta etapa 2 mantiene exactamente la misma arquitectura que la etapa 1.

El entrenamiento se realizo sobre una mezcla de 26.595 filas exclusivamente en ruso nativo: TERRa train repetido 3 veces, RCB train repetido 4 veces (a partir de los zips sin procesar), 15.000 ejemplos sinteticos de ru-HNP y 2.000 ejemplos de un parafraseador. Se uso una tasa de aprendizaje de 1e-5, una epoca, 832 pasos y un batch efectivo de 32, con un tiempo total de 1 hora y 37 minutos en una A100-80GB. Los datos de validacion fueron TERRa val (307 ejemplos, binario) y RCB val (220 ejemplos, tres clases), sin fuga hacia el conjunto de entrenamiento. La carga de TERRa y RCB se hizo parseando directamente `data/TERRa.zip` y `data/RCB.zip` del dataset RussianNLP/russian_super_glue, ya que su script de carga esta roto en datasets 5.x y los zips contienen archivos basura `__MACOSX/._*`. No se menciona el uso de RLHF ni DPO.

Como innovacion tecnica, el autor documenta el fallo del experimento y propone hipotesis no verificadas: los atajos de plantilla de la mitad sintetica ru-HNP (por ejemplo, "X не является ..."), el olvido de la habilidad NLI traducida en una sola epoca, y una posible anticorrelacion entre las predicciones y el gold de TERRa, que sugiere que la mitad sintetica aprendio caracteristicas que invierten la decision en esa distribucion. Como alternativas no probadas se apuntan una etapa de replay mixta (nativo mas 30-50 por ciento de replay traducido, lr menor o igual a 5e-6), un reponderado por dificultad en lugar de por volumen, o un entrenamiento solo nativo partiendo del modelo base en vez del adaptador de la etapa 1.

## Capacidades

- Clasificacion de inferencia de lenguaje natural (NLI) en ruso con tres etiquetas: entailment, neutral y contradiction.
- Funcionamiento como cross-encoder: evalua conjuntamente premisa e hipotesis, no como bi-encoder.
- Etiquetado binario de entailment / not_entailment cuando la tarea lo requiere (estilo TERRa).
- Etiquetado de tres clases (entailment / contradiction / neutral) estilo RCB.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio ni tool calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking ni capacidades multimodales.

## Casos de uso

- Investigacion en NLI ruso: el modelo sirve como punto de comparacion y como ejemplo documentado de resultado negativo, util para estudiar olvido catastrofico en ajuste fino con LoRA.
- Reproduccion de experimentos: el codigo de entrenamiento y el JSON de resultados (`results_stage2.json`) permiten reproducir la receta y probar las alternativas propuestas (replay mixta, reponderado por dificultad).
- Deteccion de contradicciones en textos rusos: como cross-encoder puede puntuar pares premisa-hipotesis para senalar inconsistencias, aunque su rendimiento medido por debajo del azar en TERRa desaconseja su uso directo en produccion.
- Etiquetado de pares en corpus rusos: util si se necesita especificamente el comportamiento de RCB a nivel cercano al azar documentado por el autor.
- Base para un pipeline de verificacion de hechos en ruso: integraria un NLI como componente, pero el autor recomienda la etapa 1 para este proposito.
- Estudio de robustez ante datos sinteticos: permite analizar como una mezcla dominada por datos sinteticos con atajos de plantilla degrada el comportamiento en distribuciones reales.
- Educacion y experimentacion: sirve como caso practico para ensenar por que una perdida de entrenamiento descendente (1,79 a 0,86) no garantiza generalizacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando la etapa 1 (antes) con la etapa 2 (despues):

| Evaluacion | Etapa 1 | Etapa 2 | Cambio |
|---|---|---|---|
| XNLI-ru test (5.010 ejemplos) | 0,732 | 0,640 | -9,2 puntos (olvido) |
| TERRa val (307, binario) | 0,485 | 0,147 | -33,9 puntos (por debajo del azar) |
| RCB val (220, tres clases) | 0,355 | 0,500 | +14,5 puntos (hasta nivel de azar) |

El autor indica que los numeros no son un error de mapeo de etiquetas: la auditoria confirmo que las etiquetas crudas de TERRa y RCB son cadenas explicitas. La perdida de entrenamiento cayo de 1,79 a 0,86, pero la generalizacion se derrumbo.

## Requisitos de hardware

- Entrenamiento reportado: 1 hora y 37 minutos en una A100-80GB para 832 pasos con batch efectivo de 32.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles para inferencia; el entrenamiento se realizo en A100-80GB.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles; al ser un adaptador PEFT/LoRA, requiere cargarse junto al modelo base yandex/AliceAI-T5-35B-A0.6B mediante la libreria PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aliceai-t5-35b-jev-ru-nli-native (etapa 2) | Base ~35B (MoE, activos ~0,6B) | no disponible | XNLI-ru 0,640 / TERRa 0,147 / RCB 0,500 | MIT | HuggingFace |
| aliceai-t5-35b-jev-ru-nli (etapa 1) | Base ~35B (MoE, activos ~0,6B) | no disponible | XNLI-ru 0,732 / TERRa 0,485 / RCB 0,355 | no disponible | HuggingFace |
| yandex/AliceAI-T5-35B-A0.6B (base, sin adaptador) | ~35B (MoE, activos ~0,6B) | no disponible | no disponible | no disponible | HuggingFace |

El autor recomienda usar la etapa 1 para uso general. No se dispone de datos comparativos con otros modelos NLI en ruso en la informacion proporcionada.

## Limitaciones y advertencias

- Resultado negativo confirmado: la etapa 2 degrada el rendimiento de la etapa 1 en XNLI-ru (-9,2 puntos) y en TERRa (-33,9 puntos, por debajo del azar). No se recomienda su uso general.
- En TERRa val las predicciones estan anticorrelacionadas con el gold, segun indica el autor, lo que sugiere caracteristicas aprendidas que invierten la decision en esa distribucion.
- Riesgo de sesgos procedente de la mitad sintetica del dataset (ru-HNP 15k), con atajos de plantilla que pueden desviar la frontera de decision.
- Riesgo de olvido catastrofico: una sola epoca de datos solo nativos con lr 1e-5 basto para perder la habilidad NLI traducida sin aprender adecuadamente la nativa.
- Idioma limitado unicamente al ruso.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de documentos largos.
- Riesgo de alucinacion: no aplica en sentido generativo (es un clasificador), pero si en cuanto a predicciones con confianza erronea, dado el rendimiento por debajo del azar en algunas evaluaciones.
- Licencia MIT, por lo que no hay restricciones conocidas para uso comercial derivadas del propio adaptador; conviene verificar la licencia del modelo base (no disponible en la informacion facilitada).
- Para produccion se recomienda encarecidamente la etapa 1 salvo necesidad explicita del comportamiento de RCB a nivel de azar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/midwestcyr/aliceai-t5-35b-jev-ru-nli-native
- Modelo de la etapa 1 (recomendado): https://huggingface.co/midwestcyr/aliceai-t5-35b-jev-ru-nli
- Modelo base: yandex/AliceAI-T5-35B-A0.6B
- Dataset utilizado: https://huggingface.co/datasets/RussianNLP/russian_super_glue
