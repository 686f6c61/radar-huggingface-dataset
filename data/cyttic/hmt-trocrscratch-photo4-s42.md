# cyttic/hmt-trocrscratch-photo4-s42

## Resumen

`cyttic/hmt-trocrscratch-photo4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) especializado en hebreo, desarrollado por el grupo cyttic. Se trata de una variante del modelo TrOCR entrenada desde cero (`trocrscratch`) dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, con la configuracion de augmentation `photo4` y semilla 42. El modelo resuelve la transcripcion automatica de texto manuscrito en hebreo mediante un cabezal CTC sobre una arquitectura de tipo encoder-decoder de TrOCR.

El modelo tiene 22.421.004 parametros y se distribuye unicamente en formato safetensors con un tamano de repositorio de 0,1 GB, lo que lo hace muy ligero y apto para despliegue en hardware modesto. Su relevancia es acotada: es un artefacto de investigacion orientado a medir el efecto de tecnicas de augmentation sobre metricas HTR, no un modelo de produccion pulido. Los resultados publicados en la model card son modestos (CER 0,4057 y WER 0,9708 sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje), lo que refleja la dificultad intrinseca de la tarea y el caracter experimental del entrenamiento.

La licencia MIT permite uso comercial y modificacion, pero la calidad de transcripcion reportada aconseja tratarlo como punto de partida para experimentacion o *fine-tuning*, no como solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer) con cabezal CTC, entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicado) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder disenado originalmente para reconocimiento optico de caracteres, aqui adaptado a texto manuscrito y equipado con un cabezal CTC para decodificacion. Segun la model card, se entreno desde cero (`trocrscratch`), es decir, sin partir de pesos preentrenados de TrOCR estandar, lo que explica en parte el rendimiento limitado reportado.

El entrenamiento se realizo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) que forman el conjunto de desarrollo, una particion por escritor que busca evaluar la generalizacion a manos no vistas. La configuracion concreta corresponde al estudio de augmentation `photo4` con semilla 42. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (en una tarea HTR esto seria poco habitual). La evaluacion se realizo con decodificacion greedy y sin modelo de lenguaje, lo que tipicamente penaliza el WER frente a decodificacion con LM.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo (transcripcion linea a linea o region a texto).
- Decodificacion CTC con estrategia greedy.
- Entrenado especificamente para generalizar a escritores no vistos en entrenamiento (split por escritor).
- No dispone de capacidades de generacion de texto libre, razonamiento, codigo o matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades de vision general (no es un VLM; la entrada es imagen de texto manuscrito).
- Sin modo de pensamiento (*thinking mode*), audio ni otras modalidades.
- Multilingue: no, unicamente hebreo.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir documentos escaneados linea a linea, aunque el CER de 0,4057 exige revision humana posterior; es util como primer paso de un pipeline de indexacion.
- Experimentacion academica en HTR: sirve como baseline reproducible (semilla 42, augmentation `photo4`) para comparar el efecto de distintas tecnicas de aumento de datos sobre CER y WER.
- *Fine-tuning* sobre dominios especificos: al ser ligero (22,4 M de parametros) y con licencia MIT, puede reentrenarse sobre corpus manuscritos concretos (por ejemplo, actas notariales o correspondencia historica) con recursos de GPU modestos.
- Estudio de robustez a condiciones fotograficas: la configuracion `photo4` sugiere entrenamiento con augmentations fotograficas; puede usarse para analizar transferencia de metricas a capturas con iluminacion o perspectiva variables.
- Prototipado rapido de OCR manuscrito en entornos con pocos recursos: cabe en GPU de consumo y permite iterar sobre preprocesado de imagen sin infraestructura dedicada.
- Evaluacion comparativa de particiones por escritor: sirve para medir *writer generalization* frente a otros modelos del mismo estudio `htr-metrics-transfer`.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificacion greedy, sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,4057 |
| WER | 0,9708 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parametros en safetensors, el modelo ocupa aproximadamente 90 MB en precision completa (fp32) y menos de 50 MB en fp16.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1660 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM; tambien puede ejecutarse en CPU para volumenes moderados.
- Opciones de despliegue: al publicarse solo en safetensors, el despliegue natural es via PyTorch/HuggingFace Transformers con un script propio de inferencia; no hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa. vLLM y TGI no estan orientados a esta tarea (entrada imagen, CTC).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-photo4-s42 | 22,4 M | no disponible | HTR hebreo | MIT | HuggingFace |
| TrOCR (microsoft, base/large) | ~334 M / ~558 M | ~512 tokens de salida | OCR impreso y manuscrito (ingles) | MIT | HuggingFace |
| Otros modelos del estudio `htr-metrics-transfer` (cyttic) | no disponible | no disponible | HTR hebreo | MIT (segun tags) | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; las diferencias de tamano y de idioma (hebreo frente a ingles) hacen que la comparacion directa de CER/WER no sea significativa sin evaluacion comun.

## Limitaciones y advertencias

- Calidad de transcripcion baja para uso directo: CER 0,4057 y WER 0,9708 implican que aproximadamente 4 de cada 10 caracteres y casi todas las palabras pueden contener errores; requiere revision humana o un modelo de lenguaje corrector.
- Evaluacion sin LM: los resultados corresponden a decodificacion greedy sin modelo de lenguaje, por lo que un pipeline con correccion linguistica podria mejorar sustancialmente el WER.
- Entrenado desde cero: al no partir de pesos preentrenados, la capacidad de generalizacion es limitada frente a modelos TrOCR preentrenados.
- Un solo idioma: unicamente hebreo; no soporta otros alfabetos ni idiomas.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un corpus concreto (`hhd-optionb-split`), puede heredar sesgos de estilo, epoca o tipo de escritura de ese dataset.
- Riesgo de alucinacion: en HTR el riesgo se manifiesta como sustituciones o omisiones de caracteres, no como generacion inventada de contenido extenso, pero sigue siendo relevante en documentos criticos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo se presenta como artefacto de investigacion; no hay garantias de calidad ni soporte.
- Caveat de produccion: no hay pipeline declarado en HuggingFace ni pesos cuantizados; la integracion requiere envolver el modelo manualmente.
- Fecha de creacion futura (2026-11-05) en los metadatos: conviene verificar la procedencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-photo4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Estudio de referencia citado en la model card: `htr-metrics-transfer` (resultados en `results.json` del repositorio)
- Paper TrOCR (arquitectura base): https://arxiv.org/abs/2109.10282
