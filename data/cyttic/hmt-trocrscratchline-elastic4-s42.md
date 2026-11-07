# cyttic/hmt-trocrscratchline-elastic4-s42

## Resumen

`cyttic/hmt-trocrscratchline-elastic4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) sobre una linea base arquitectonica propia, con un esquema de aumento de datos `elastic4` y semilla 42, dentro de un estudio de transferencia de metricas HTR. El modelo resuelve la transcripcion linea a linea de manuscritos en hebreo, empleando decodificacion CTC.

El modelo es pequeno (22,4 millones de parametros segun los pesos en safetensors, repo de 0,1 GB) y esta especializado en un unico idioma: hebreo. No es un modelo generativo de proposito general, sino un componente de un pipeline OCR/HTR orientado a digitalizacion de documentos historicos o manuscritos. Su interes radica en que forma parte de un estudio comparativo reproducible (aumento de datos, semilla fija, division de escritores) y en que publica metricas de referencia explicitas: CER 0,1961 y WER 0,6960 sobre el conjunto de test HHD Option-B con decodificacion greedy y sin modelo de lenguaje.

La relevancia actual es acotada: no compite con modelos multimodales grandes, sino que sirve como referencia tecnica para investigadores que trabajan en HTR de lenguas semiticas con pocos recursos y quieren reproducir o comparar estrategias de *augmentation* sobre arquitecturas tipo TrOCR. El autor lo publica bajo licencia MIT, lo que facilita su reutilizacion y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (variante `trocrscratchline`, entrenada desde cero) con cabeza CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR: un encoder de vision (tipicamente un ViT) acoplado a un decoder Transformer para la secuencia de salida, aunque en esta variante `trocrscratchline` se entrena desde cero en lugar de partir de pesos preentrenados, y la decodificacion se realiza mediante CTC (`ctc` en los tags). La salida es una secuencia de caracteres correspondiente a una linea de texto manuscrito, no un modelo de lenguaje general.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, con aumento de datos `elastic4` (deformaciones elasticas) y semilla 42. La evaluacion se hizo sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje externo, obteniendo CER 0,1961 y WER 0,6960. El autor remite a `results.json` para el detalle completo del estudio, aunque ese fichero no se incluye en la informacion proporcionada. No se documentan numero de tokens de entrenamiento, composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un modelo CTC de reconocimiento).

## Capacidades

- Reconocimiento de texto manuscrito linea a linea en hebreo.
- Transcripcion de secuencias de caracteres mediante decodificacion CTC greedy.
- Procesamiento de imagenes de lineas de texto (entrada visual, salida textual).
- Especializacion en escritura manuscrita historica o de dominio acotado (HHD).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, vision general, audio ni capacidades multimodales mas alla del OCR.
- Capacidad multilingue limitada exclusivamente al hebreo.

## Casos de uso

- Digitalizacion de manuscritos hebreos: el modelo transcribe lineas de texto manuscrito, adecuado para proyectos de archivo y bibliotecas digitales que trabajan con documentos en hebreo.
- Pipeline OCR por lineas: integrado tras un detector de lineas (por ejemplo, un modelo de segmentacion), procesa cada recorte y compone el texto final del documento.
- Investigacion en HTR de lenguas semiticas: sirve como linea base reproducible (semilla 42, aumento `elastic4`) para comparar estrategias de *augmentation* y arquitecturas.
- Evaluacion comparativa de decodificadores CTC: al publicar CER y WER sin modelo de lenguaje, permite medir la ganancia de anadir un LM en etapas posteriores.
- Prototipado academico: su tamano (22,4 M de parametros, 0,1 GB) permite iterar rapidamente en entornos de laboratorio con recursos limitados.
- Generacion de transcripciones para anotacion asistida: el texto producido puede usarse como borrador que un revisor humano corrige, reduciendo el coste de etiquetado en corpus hebreos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1961 |
| HHD Option-B test (greedy, sin LM) | WER | 0,6960 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamano de 22,4 M de parametros y el repo de 0,1 GB; en la practica el cuello de botella es el encoder de vision y el tamano de las imagenes de entrada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien cabe en CPU para lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: al no documentarse variantes GGUF ni integracion con vLLM/TGI/Ollama, el despliegue natural es via `transformers` de Hugging Face con los pesos safetensors; llama.cpp/Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-elastic4-s42 | 22,4 M | no disponible | he | MIT | TrOCR desde cero + CTC, CER 0,1961 en HHD Option-B |
| microsoft/trocr-base-handwritten | ~334 M | no disponible | en | MIT | TrOCR preentrenado, referencia general para HTR en ingles |
| microsoft/trocr-large-handwritten | ~558 M | no disponible | en | MIT | Variante grande de TrOCR para HTR en ingles |
| Modelos HTR para hebreo (familia cyttic) | no disponible | no disponible | he | MIT | Otras variantes del mismo estudio de augmentation; no se detallan en la informacion disponible |

La comparativa con alternativas especificas para hebreo no esta disponible en la informacion proporcionada; los modelos TrOCR de Microsoft son la referencia arquitectonica mas cercana, aunque entrenados para ingles y con muchos mas parametros.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no debe esperarse calidad en otros idiomas.
- El WER es elevado (0,6960), lo que indica que la salida a nivel de palabra requiere revision o post-procesado con modelo de lenguaje.
- Entrenado sobre un unico dataset (HHD Option-B) y con una division concreta de escritores; el rendimiento puede degradarse en dominios, caligrafias o epocas distintas.
- Riesgo de alucinacion de caracteres en lineas degradadas o con ruido, habitual en modelos CTC.
- Sesgos derivados de la composicion del corpus de entrenamiento (escritores, estilos y epocas representados); no se documentan analisis de sesgo.
- No hay informacion sobre cuantizacion ni sobre rendimiento en produccion a gran escala.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset de origen (`cyttic/hhd-optionb-split`) antes de explotar el modelo en productos.
- Sin modelo de lenguaje asociado, la correccion ortografica y linguistica queda fuera del alcance del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-elastic4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Referencia arquitectonica TrOCR (paper): https://arxiv.org/abs/2109.10282
- TrOCR en Hugging Face: https://huggingface.co/microsoft/trocr-base-handwritten
- Fichero de resultados del estudio (`results.json`): no disponible como enlace publico en la informacion proporcionada.
