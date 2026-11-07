# cyttic/hmt-trocrscratchline-elastic3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchline-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el grupo cyttic. Se trata de un Transformer encoder-decoder basado en TrOCR, entrenado desde cero ("scratch") y acoplado a un cabezal CTC para decodificacion greedy. El modelo forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalua el efecto de distintas estrategias de aumento sobre la transferencia de metricas en tareas HTR.

La variante concreta corresponde a la configuracion `elastic3` con semilla 42, entrenada sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo. La evaluacion se realiza sobre el conjunto de test HHD Option-B sin modelo de lenguaje, obteniendo un CER de 0,2217 y un WER de 0,7583. Con 22,4 millones de parametros, es un modelo compacto orientado a la transcripcion de lineas manuscritas en hebreo.

Su relevancia es acotada: no es un modelo de proposito general, sino un artefacto de investigacion reproducible que documenta un punto concreto de un barrido experimental. Resulta util para quien quiera reproducir o comparar resultados de aumento de datos en HTR sobre el corpus HHD, no para despliegues generales de OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (TrOCR) con cabezal CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder concebido para reconocimiento de texto en imagen. El autor indica que fue entrenado "desde cero" (`trocrscratchline`), es decir, sin inicializar desde los pesos preentrenados de TrOCR publicados por Microsoft, y que incorpora un cabezal CTC sobre la salida del encoder para permitir decodificacion greedy alineada. La decodificacion usada en la evaluacion es greedy, sin modelo de lenguaje externo.

El entrenamiento se realizo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo. La configuracion experimental aplica un aumento de datos etiquetado como `elastic3` (presumiblemente una variante de distorsion elastica, aunque el detalle exacto no se especifica en la informacion disponible) con semilla 42. No se detallan en la model card el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; para un modelo HTR estos ultimos no serian esperables.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imagenes de lineas de texto en hebreo.
- Transcripcion linea a linea con decodificacion CTC greedy.
- Salida de secuencia de caracteres alineada con la imagen de entrada.
- Entrenado especificamente sobre el corpus HHD Option-B, por lo que su dominio esta limitado a la escritura y estilo de ese corpus.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del hebreo.
- No se documenta vision general, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Reproduccion de experimentos de HTR: sirve como punto de referencia del barrido `htr-metrics-transfer` para comparar el efecto del aumento `elastic3` frente a otras configuraciones con la misma semilla.
- Transcripcion de lineas manuscritas en hebreo dentro del corpus HHD: el modelo esta entrenado sobre ese dominio y puede usarse para generar transcripciones de lineas del conjunto de test Option-B.
- Baseline en investigacion de aumento de datos: al ser un modelo desde cero con 22,4 M de parametros, permite aislar el efecto del aumento sin la influencia de pesos preentrenados.
- Evaluacion de metricas CER/WER en pipelines HTR: util para validar implementaciones de calculo de CER y WER contra los valores publicados (0,2217 y 0,7583).
- Prototipado de digitalizacion de manuscritos hebreos en entornos con recursos limitados: su tamano reducido (repo de 0,1 GB) facilita el despliegue en CPU o GPU modesta para pruebas de concepto.
- Estudio de transferencia entre escritores: al haberse excluido los escritores de desarrollo del entrenamiento, el modelo sirve para analizar generalizacion a escritores no vistos dentro de HHD.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2217 | HHD Option-B test, decodificacion greedy, sin LM |
| WER | 0,7583 | HHD Option-B test, decodificacion greedy, sin LM |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni tablas de comparacion frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (22,4 M de parametros, aproximadamente 90 MB en fp32); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es suficiente.
- Cabe en GPU consumer: si, en todas las gamas, incluidas integradas.
- Opciones de despliegue: no se documentan en la model card; al estar en safetensors, requiere cargar la arquitectura TrOCR/CTC correspondiente con PyTorch o la libreria `transformers` si el autor publico la configuracion compatible. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-elastic3-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| TrOCR (Microsoft, base) | no disponible en esta ficha | no disponible | MIT | Hugging Face |
| Otros modelos del estudio htr-metrics-transfer | no disponible | no disponible | no disponible | Hugging Face (cyttic) |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente sobre el corpus HHD Option-B y en hebreo; su generalizacion a otros corpus, escritores o idiomas no esta documentada y previsiblemente sera limitada.
- El WER de 0,7583 es elevado, lo que indica una tasa alta de errores a nivel de palabra; el CER de 0,2217 tambien refleja un rendimiento moderado.
- La evaluacion se realizo sin modelo de lenguaje; el rendimiento en produccion con post-procesado o LM podria diferir, pero no se documenta.
- Riesgo de alucinacion: en HTR el modelo puede generar caracteres o palabras no presentes en la imagen, especialmente en lineas con escritura atipica o baja calidad.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un unico corpus puede heredar los sesgos de estilo y escritura de sus escritores.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de robustez en produccion.
- No se documentan requisitos de preprocesado de imagen, tokenizer ni formato de entrada, lo que dificulta su uso directo sin consultar el repositorio y el `results.json` citado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-elastic3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados detallados: `results.json` en el repositorio del modelo (referenciado en la model card)
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
