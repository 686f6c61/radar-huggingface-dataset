# cyttic/hmt-htrvt-stroke4-s43

## Resumen

El modelo `cyttic/hmt-htrvt-stroke4-s43` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo compacto de 13,8 millones de parametros, entrenado con una cabeza CTC (*Connectionist Temporal Classification*) y publicado en formato safetensors bajo licencia MIT. Forma parte de un estudio de aumento de datos (*augmentation*) denominado `htr-metrics-transfer`, cuyo objetivo es medir como distintas estrategias de aumento afectan a la transferencia de metricas entre dominios de escritura manuscrita.

El modelo corresponde a la variante `htrvt` con el aumento `stroke4` y la semilla 43. Se entreno sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y se evaluo sobre el conjunto de test HHD Option-B con decodificacion greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,0612 y WER 0,2791, lo que lo situa como una referencia util para investigacion en HTR y para tareas de transcripcion de manuscritos en hebreo.

Su relevancia actual radica en que documenta de forma reproducible el efecto de un aumento concreto sobre un corpus historico, con semilla fija y metricas publicadas. Es un modelo de investigacion, no un producto generalista, y su utilidad principal es servir de punto de comparacion dentro del estudio `htr-metrics-transfer` y como base para transcripcion de documentos manuscritos en hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cabecera CTC para HTR) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del extractor de caracteristicas (si es una CNN, un transformer o un hibrido). Lo que si se especifica es que el modelo emplea una cabeza de salida CTC, un mecanismo clasico en HTR que permite alinear secuencias de imagenes con transcripciones sin necesidad de segmentacion previa a nivel de caracter. El modelo pertenece a la familia `htrvt` dentro del estudio `htr-metrics-transfer`.

El entrenamiento se realizo sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo, con el aumento de datos `stroke4` y semilla 43. La evaluacion se hizo sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento puro del acoustic model y evita el sesgo que introduciria un LM. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imagenes de lineas o documentos, con salida de secuencia via CTC.
- Transcripcion en hebreo, unico idioma declarado en la model card.
- Decodificacion greedy sin modelo de lenguaje, lo que permite integrarlo en pipelines que ya dispongan de su propio LM o postprocesado.
- Entrenado con un aumento especifico (`stroke4`), orientado a mejorar la robustez frente a variaciones de trazo.
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de manuscritos historicos en hebreo: el modelo puede procesar imagenes de lineas de texto y devolver la secuencia de caracteres, adecuado para digitalizacion de archivos y corpus historicos dado su entrenamiento sobre HHD Option-B.
- Investigacion en aumento de datos para HTR: sirve como punto de comparacion reproducible (semilla 43, aumento `stroke4`) frente a otras variantes del estudio `htr-metrics-transfer`, permitiendo medir el impacto del aumento en CER y WER.
- Generacion de transcripciones base para revision humana: con un CER de 0,0612 sobre el test de referencia, puede usarse como primera pasada en flujos de correccion asistida donde un humano valida el resultado.
- Integracion en pipelines de OCR/HTR con postprocesado propio: al no incluir LM, encaja en sistemas que aplican su propio modelo de lenguaje o diccionario especifico del dominio.
- Evaluacion comparativa de arquitecturas HTR: su tamano reducido (13,8 M de parametros) y su licencia MIT lo hacen util como baseline ligero en experimentos academicos.
- Prototipado rapido de sistemas de lectura de manuscritos: el repo ocupa 0,1 GB y los pesos estan en safetensors, lo que facilita su carga en entornos de investigacion con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0612 | HHD Option-B test, greedy, sin LM |
| WER | 0,2791 | HHD Option-B test, greedy, sin LM |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni tablas de comparacion dentro del estudio `htr-metrics-transfer`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 13,8 M de parametros en precision completa (fp32) los pesos ocupan aproximadamente 55 MB, y en fp16 unos 28 MB, por lo que la huella de pesos es minima. La VRAM real dependera del tamano de las imagenes de entrada y del batch.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM es suficiente para la parte de pesos; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; el cuello de botella sera el preprocesado de imagenes y el tamano de lote, no los pesos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con cabeza CTC, requerira un runtime compatible con la arquitectura subyacente (no especificada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos HTR comparables ni datos de rendimiento de alternativas dentro del estudio `htr-metrics-transfer`.

## Limitaciones y advertencias

- Modelo de investigacion: no se documentan procesos de mitigacion de sesgos ni evaluaciones de robustez fuera del test HHD Option-B.
- Riesgo de alucinacion: en HTR el riesgo se manifiesta como sustituciones, inserciones y omisiones de caracteres; el WER de 0,2791 indica que aproximadamente una de cada cuatro palabras del test no coincide exactamente, por lo que la salida requiere revision en aplicaciones criticas.
- Limitacion de idioma: solo se declara hebreo (`he`); no hay evidencia de soporte para otros idiomas o alfabetos.
- Limitacion de contexto: no se especifica la longitud maxima de secuencia de entrada o salida; el rendimiento puede degradarse en lineas muy largas o imagenes de baja calidad.
- Dependencia del dominio: entrenado sobre HHD Option-B y evaluado sobre el mismo corpus; la transferencia a otros estilos de escritura, epocas o soportes no esta cuantificada en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, pero al ser un modelo sin garantias ni documentacion de procedencia de datos mas alla del dataset citado, conviene verificar las condiciones del corpus `cyttic/hhd-optionb-split` antes de un despliegue en produccion.
- Ausencia de LM: la decodificacion greedy sin modelo de lenguaje puede producir salidas menos fluidas que sistemas con postprocesado linguistico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-stroke4-s43
- Dataset de entrenamiento citado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
- Paper, blog, repositorio o demo del estudio `htr-metrics-transfer`: no disponible en la informacion proporcionada.
