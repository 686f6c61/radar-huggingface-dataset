# rimrafadii/marathi-conformer-33m-moe

## Resumen

Marathi Conformer-256 Sparse MoE (33M) es un modelo de reconocimiento automático del habla (ASR) especializado en maratí y en su continuo dialectal (malvani, ahirani, maratí estándar y varhadi), desarrollado por el usuario rimrafadii. Se trata de un modelo CTC compacto construido sobre una arquitectura Conformer de 12 capas con dimensión de modelo de 256, cuatro cabezas de atención y tamaño de kernel de 31, al que se le añade una capa de mezcla de expertos (MoE) dispersa orientada a dialectos.

El modelo cuenta con 33,8 millones de parámetros totales, de los cuales solo 25,2 millones se activan en cada pasada forward, gracias a una estructura de tres ramas expertas regionales más un tronco compartido que las combina. Esta especialización por dialecto resuelve el problema de la degradación de precisión que sufren los sistemas ASR monolíticos cuando se enfrentan a variedades regionales poco representadas dentro de un mismo idioma.

Su relevancia actual radica en la combinación de tamaño reducido, coste de inferencia bajo (RTFx superior a 280x en GPU modernas) y una licencia MIT permisiva, lo que lo hace atractivo para despliegues en producción con recursos limitados y para aplicaciones de transcripción en maratí que necesiten cubrir variantes dialectales. El repositorio ocupa 0,1 GB y el modelo se publicó con 23 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (12 capas, d_model=256, 4 cabezas de atencion, kernel=31) con capa CTC y mezcla de expertos dispersa por dialecto |
| Parametros totales | 33,8 M |
| Parametros activos | 25,2 M por pasada forward |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | marati (mr), con dialectos malvani, ahirani, marati estandar y varhadi |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de un encoder Conformer de 12 capas con dimension de modelo 256, cuatro cabezas de atencion y kernel de convolucion de tamano 31. Sobre esta base se incorpora una capa de mezcla de expertos dispersa compuesta por tres ramas expertas dedicadas a dialectos regionales y un tronco compartido que las combina, de modo que solo se activan 25,2 M de los 33,8 M de parametros totales en cada inferencia. La cabeza de salida es CTC (Connectionist Temporal Classification), lo que permite alineamiento sin necesidad de un modelo de lenguaje externo y favorece la velocidad de decodificacion.

Los datos de entrenamiento proceden de tres conjuntos: rimrafadii/respin-iisc, ai4bharat/Kathbath y ARTPARK-IISc/Vaani. No se especifica en la informacion disponible el numero total de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos, regularizacion o ajuste fino adicional. La evaluacion se realiza bajo el protocolo de normalizacion `mr-norm-1`, que aplica descomposicion Unicode NFC, mapea los numerales devanagari (०-९) a digitos ASCII (0-9), elimina puntuacion y dandas y pasa el latin a minusculas.

## Capacidades

- Reconocimiento automatico del habla en marati mediante decodificacion CTC.
- Cobertura de cuatro variedades: malvani (D1), ahirani (D2), marati estandar (D3) y varhadi (D4), gracias a la especializacion de las ramas expertas.
- Transcripcion de audio con salida en escritura devanagari, sujeta al protocolo de normalizacion del autor.
- Inferencia de alta velocidad: RTFx superior a 280x en GPU modernas, adecuada para procesamiento por lotes y transcripcion casi en tiempo real.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento extendido; es un modelo puramente ASR.
- Capacidad multilingue limitada al marati y sus dialectos; no se declara soporte de code-switching con ingles u otros idiomas.

## Casos de uso

- Transcripcion de audio en marati estandar para actas de reuniones y entrevistas: el modelo alcanza un WER del 15,6 % en el subconjunto estandar de RESPIN y un 12,8 % en Kathbath limpio, suficiente para generar borradores que un revisor humano corrige despues.
- Subtitulado de contenido audiovisual regional: la velocidad RTFx superior a 280x permite procesar horas de audio en minutos sobre una sola GPU, lo que encaja en pipelines de generacion de subtitulos para plataformas de video.
- Atencion al ciudadano en administraciones con presencia de marati: transcripcion de llamadas o mensajes de voz en centros de atencion, con la ventaja de cubrir variantes dialectales que otros sistemas monolingues transcriben peor.
- Investigacion linguistica y dialectologia: el modelo permite comparar el rendimiento por dialecto (malvani 29,2 %, ahirani 25,4 %, estandar 15,6 %, varhadi 24,1 %) y usar las activaciones de los expertos como senal para estudiar la variacion regional.
- Despliegue en dispositivos con recursos limitados: con 25,2 M de parametros activos y un repositorio de 0,1 GB, es candidato para entornos de borde o servicios con GPU de gama baja, siempre que se valide el formato de pesos disponible.
- Generacion de corpus anotados para entrenamiento de modelos mayores: transcripcion automatica de audio no etiquetado en marati y sus dialectos como paso previo a la revision humana y al ajuste fino de sistemas mas grandes.
- Accesibilidad: conversion de voz a texto en marati para personas con discapacidad auditiva en entornos donde el marati es lengua principal, con la salvedad de que la calidad cae en los dialectos malvani y varhadi.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo el protocolo `mr-norm-1` (WER, menor es mejor):

| Benchmark | Resultado |
|---|---|
| RESPIN Marathi agregado | 24,8 % |
| RESPIN Malvani (D1) | 29,2 % |
| RESPIN Ahirani (D2) | 25,4 % |
| RESPIN Estandar (D3) | 15,6 % |
| RESPIN Varhadi (D4) | 24,1 % |
| Kathbath Test (clean) | 12,8 % |
| FLEURS Test | 15,4 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en tareas que no sean ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 33,8 M de parametros totales y 25,2 M activos, el modelo en precision completa ocupa del orden de decenas de MB, por lo que la VRAM necesaria vendra dominada por el estado de activaciones y el tamano de lote mas que por los pesos.
- GPU recomendadas: el autor declara RTFx superior a 280x en GPU modernas sin especificar modelos concretos; por tamano, es viable en cualquier GPU con al menos unos pocos GB de VRAM, incluidas RTX 4090, A100 y H100 para maximizar throughput.
- Cabe en GPU de consumo: si, por el reducido numero de parametros; se requiere validar el formato de pesos y el runtime disponibles.
- Opciones de despliegue: no se documentan en la informacion disponible (no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos de lenguaje y no a ASR CTC); seria necesario implementar el pipeline CTC con un framework de inferencia compatible con Conformer.
- Latencia y throughput: RTFx superior a 280x segun el autor; no se detallan latencias absolutas ni throughput en muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marathi Conformer-256 Sparse MoE (este modelo) | 33,8 M totales / 25,2 M activos | no disponible | WER 12,8 % (Kathbath clean), 15,4 % (FLEURS), 24,8 % (RESPIN agregado) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros modelos ASR para marati con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El rendimiento cae de forma notable en los dialectos malvani (29,2 % WER) y varhadi (24,1 %), frente al marati estandar (15,6 %); no debe asumirse una calidad homogenea entre variedades.
- El WER agregado en RESPIN es del 24,8 %, lo que implica que aproximadamente una de cada cuatro palabras se transcribe de forma incorrecta en ese conjunto; en produccion conviene prever revision humana o umbrales de confianza.
- Las metricas estan calculadas bajo el protocolo `mr-norm-1`; comparaciones con otros sistemas que usen otra normalizacion pueden resultar enganosas.
- El modelo solo cubre marati y sus dialectos; no se declara soporte de otros idiomas ni de code-switching.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados o vocabulario tecnico fuera del dominio de entrenamiento; no se documentan mitigaciones.
- No se detalla la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, de genero o de dominio presentes en los datos.
- La licencia MIT permite uso comercial y modificacion, pero conviene verificar las condiciones de los datasets de origen (RESPIN-IISc, Kathbath, Vaani) antes de redistribuir derivados.
- No se documentan el formato de pesos, las opciones de cuantizacion ni los runtimes soportados, lo que anade incertidumbre al despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rimrafadii/marathi-conformer-33m-moe
- Dataset rimrafadii/respin-iisc: https://huggingface.co/datasets/rimrafadii/respin-iisc
- Dataset ai4bharat/Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset ARTPARK-IISc/Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani
- Paper y repositorio del modelo: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada
