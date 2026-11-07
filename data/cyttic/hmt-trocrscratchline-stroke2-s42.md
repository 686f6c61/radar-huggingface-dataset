# cyttic/hmt-trocrscratchline-stroke2-s42

## Resumen

`cyttic/hmt-trocrscratchline-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de una variante del modelo TrOCR entrenada desde cero ("scratch") con una estrategia de aumento de datos (*augmentation*) denominada `stroke2`, con semilla 42, dentro de un estudio de transferencia de métricas HTR (`htr-metrics-transfer`). El modelo se distribuye en formato safetensors con 22.421.004 parámetros y una licencia MIT.

El modelo está especializado en una única tarea: transcribir líneas de texto manuscrito en hebreo (`he`). No es un modelo generativo de propósito general, sino un componente de un pipeline OCR/HTR que recibe una imagen de línea de texto y produce la secuencia de caracteres correspondiente mediante decodificación CTC (el tag `ctc` así lo indica, aunque el nombre del modelo remite a la familia TrOCR, que habitualmente usa un decodificador autoregresivo; la model card no aclara esta discrepancia).

Su relevancia es acotada pero concreta: forma parte de una serie de experimentos reproducibles (variantes de arquitectura y de aumento de datos con distintas semillas) orientados a medir cómo se transfieren las métricas de HTR entre configuraciones. Para un desarrollador o investigador interesado en HTR de hebreo, es una pieza de referencia con resultados publicados (CER 0.3591, WER 0.9559) sobre el conjunto de test HHD Option-B, aunque con un rendimiento absoluto bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para imagen a texto), variante "scratchline"; decodificacion CTC segun tag |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la longitud de secuencia de etiquetas; no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR: un codificador de vision tipo ViT procesa la imagen de la linea de texto y un decodificador transformer genera la secuencia de caracteres. La variante se denomina `trocrscratchline`, lo que sugiere un entrenamiento desde cero (sin inicializar desde pesos preentrenados de TrOCR) sobre lineas de texto manuscrito. El tag `ctc` indica que la funcion de perdida o el esquema de decodificacion es Connectionist Temporal Classification, aunque la model card no detalla si el decodificador es autoregresivo o lineal con CTC; esta ambiguedad debe tenerse en cuenta.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*), lo que configura una evaluacion con escritores no vistos. La estrategia de aumento de datos es `stroke2`, con semilla 42. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un modelo HTR). La evaluacion se realizo con decodificacion greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de linea de texto.
- Transcripcion imagen a secuencia de caracteres mediante decodificacion greedy.
- Entrenamiento y evaluacion sin modelo de lenguaje auxiliar (sin correccion linguistica posterior).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la lectura de imagenes de texto.
- Capacidad multilingue limitada: solo hebreo.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas segmentadas de documentos historicos o administrativos, integrado en un pipeline que primero detecte y recorte lineas y luego invoque el modelo por cada una.
- Investigacion en HTR: sirve como punto de referencia reproducible (semilla fija, aumento `stroke2`) para comparar el efecto de distintas estrategias de aumento de datos sobre el CER y el WER.
- Estudio de transferencia de metricas: util para analizar como se comportan las metricas HTR entre conjuntos de escritores distintos, dado que el entrenamiento excluye los escritores de desarrollo.
- Generacion de datos de entrenamiento: las transcripciones producidas pueden usarse como pseudoetiquetas para preentrenar modelos mayores, siempre que se filtre la calidad dada la tasa de error.
- Prototipado rapido en entornos con recursos limitados: con 22,4 M de parametros y 0,1 GB de repo, cabe en cualquier GPU consumer e incluso en CPU para pruebas puntuales.
- Evaluacion comparativa de decodificadores: permite contrastar decodificacion greedy sin LM frente a variantes con modelo de lenguaje en la misma familia de experimentos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test HHD Option-B, decodificacion greedy, sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0.3591 |
| WER | 0.9559 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que no aplican a esta tarea. Tampoco se ofrecen comparaciones numericas con otros modelos de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parametros, ~90 MB de pesos); en la practica, el cuello de botella es la imagen de entrada, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer y en CPU; la inferencia en CPU es viable para volumenes moderados.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), ONNX Runtime tras exportacion, o integracion en servicios propios con FastAPI/TorchServe. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-stroke2-s42 | 22,4 M | no disponible | HTR hebreo | MIT | Hugging Face |
| cyttic/hmt-trocrctc-stroke2-s42 | 87,3 M | no disponible | HTR hebreo (variante CTC) | no disponible | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | HTR/OCR multilingue | MIT | Hugging Face |

La comparativa con TrOCR base es orientativa por familia arquitectonica; no se dispone de resultados de benchmark comparables en la informacion proporcionada. La variante `trocrctc` de la misma serie tiene mas parametros (87,3 M) pero no se han facilitado sus metricas.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: CER de 0.3591 y WER de 0.9559 sobre el test indican que aproximadamente una de cada tres unidades de caracter se transcribe mal y que la mayoria de palabras contienen errores; no es apto para produccion sin revision humana o postprocesado con modelo de lenguaje.
- Ambiguedad arquitectonica: el nombre remite a TrOCR (decodificador autoregresivo) pero el tag indica CTC; conviene verificar el codigo de inferencia antes de integrarlo.
- Entrenado exclusivamente en hebreo; no generaliza a otros idiomas ni a texto impreso.
- Entrenamiento desde cero sobre un dataset limitado (split con escritores excluidos), lo que puede provocar sobreajuste a los estilos de escritura del conjunto de entrenamiento.
- Riesgo de alucinacion en el sentido de sustituciones y omisiones de caracteres, especialmente en lineas con ruido, trazos degradados o segmentacion imperfecta.
- Sin modelo de lenguaje ni correccion linguistica: los errores ortograficos no se corrigen automaticamente.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-stroke2-s42
- Variante relacionada: https://huggingface.co/cyttic/hmt-trocrctc-stroke2-s42
