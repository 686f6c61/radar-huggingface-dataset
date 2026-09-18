# palli23/wav2vec2-base-samromur-5h

## Resumen

wav2vec2-base-samromur-5h es un modelo de reconocimiento automatico del habla (ASR) para islandes, publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de wav2vec2-base, un encoder convolucional seguido de un encoder transformer con 94.402.472 parametros, entrenado sobre un subconjunto anidado de 5 horas extraido del corpus Miljon/samromur-500h. El modelo forma parte de un conjunto de checkpoints de escalado ("scaling checkpoint set") asociado al articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027).

Su relevancia es fundamentalmente experimental: sirve para estudiar como se comporta un modelo pequeno cuando se le da muy poco datos de un idioma concreto, en comparacion con modelos multilingues mucho mayores. No es un modelo orientado a produccion ni un checkpoint final optimizado, sino un punto intermedio dentro de una curva de escalado de datos. La model card no documenta el procedimiento de entrenamiento, los hiperparametros ni los resultados de WER/CER, que se remiten al articulo citado.

La licencia es cc-by-sa-4.0, lo que permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia. El modelo solo soporta islandes (etiqueta de idioma "is") y no declara capacidades multimodales, de tool calling ni de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (encoder convolucional de extraccion de caracteristicas + encoder transformer); configuracion interna de capas no detallada en la model card |
| Parametros totales | 94.402.472 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio); longitud de ventana de entrada no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa) |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Funcion de perdida / cabeza | no disponible (en wav2vec2-base el ajuste ASR suele usar CTC, pero la model card no lo confirma) |
| Tamano del repositorio | 90,2 GB (incluye artefactos de entrenamiento y checkpoints, no solo los pesos finales) |
| Descargas / likes | 22 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura corresponde a wav2vec2-base: un extractor convolucional que convierte la onda de audio en representaciones latentes y un encoder transformer que las procesa para producir las representaciones acusticas de las que se deriva la transcripcion. No se documenta en la model card si se anaden capas de adaptacion, si se congela el extractor convolucional, ni si se utiliza una cabeza CTC o un decodificador seq2seq.

Respecto a los datos, el modelo se ha ajustado sobre "a 5h nested subset of the primary Miljon/samromur-500h scaling pool", es decir, 5 horas anidadas dentro del conjunto principal de 500 horas del corpus Samromur. El termino "nested subset" indica que el subconjunto de 5 horas esta contenido en el de 500 horas y probablemente forma parte de una jerarquia de tamanos de datos (por ejemplo 5 h, 10 h, 50 h, 500 h) disenada para medir el efecto del volumen de datos. No se especifican el numero de tokens, la composicion exacta del dataset, ni si hubo RLHF, DPO o alguna fase de refinamiento. La unica innovacion declarada es su papel dentro del estudio de escalado del articulo de ICASSP 2027.

## Capacidades

- Reconocimiento automatico del habla en islandes: transcripcion de audio a texto a partir del ajuste fino sobre el subconjunto de Samromur.
- Extraccion de representaciones acusticas de audio en islandes mediante los estados ocultos del encoder.
- Punto de partida para ajuste fino adicional: al ser un checkpoint intermedio pequeno, es adecuado para experimentar con tecnicas de adaptacion sobre pocos datos.
- Comparacion controlada de escalado de datos: permite medir el rendimiento con solo 5 horas frente a variantes del mismo conjunto con mas datos.
- No soporta tool calling ni function calling: es un modelo de audio, sin interfaz de texto a texto.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: la unica etiqueta de idioma declarada es "is".
- No se declaran modos especiales como thinking mode, vision o audio generativo.

## Casos de uso

- Transcripcion de audio en islandes para investigacion linguistica: el modelo puede convertir grabaciones de habla islandesa en texto para construir o ampliar corpus anotados, con la ventaja de que su tamano reducido permite ejecutarlo en equipos modestos.
- Estudio de escalado de datos en ASR: usar este checkpoint junto con las variantes de mas horas del mismo conjunto para trazar la curva de WER frente al volumen de datos de entrenamiento en islandes, que es el objetivo declarado del articulo.
- Punto de partida para ajuste fino con dominio especifico: partir de estos pesos para adaptar el modelo a un vocabulario tecnico islandes (medico, legal, industrial) usando unas pocas horas adicionales de audio etiquetado.
- Subtitulado automatico de contenido audiovisual islandes: generar subtitulos preliminares que despues se revisan manualmente, aprovechando que el coste computacional de un modelo de 94 M de parametros permite procesar horas de audio en hardware de gama media.
- Prototipado rapido de aplicaciones de voz en islandes: integrar el modelo en una demo de dictado o de busqueda por voz mientras se evalua si merece la pena migrar a un modelo ASR multilingue mayor.
- Transcripcion de entrevistas y material oral de archivo: procesar grabaciones de historia oral o entrevistas en islandes para hacerlas buscables, asumiendo que la precision sera limitada por las 5 horas de entrenamiento y requerira revision posterior.
- Extraccion de caracteristicas para tareas acusticas derivadas: utilizar las representaciones internas como entrada de clasificadores de emocion, hablante o palabra clave en islandes, si se confirma que las representaciones son lo bastante genericas (no verificado en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de WER y CER se encuentran en el articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), pero no reproduce ninguna cifra, ni sobre Samromur ni sobre conjuntos de evaluacion estandar como Common Voice. Tampoco se proporcionan comparaciones numericas con otros checkpoints del conjunto de escalado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 94,4 M de parametros ocupan aproximadamente 378 MB; en fp16, unos 189 MB; una conversion a INT8 los reduciria a unos 95 MB. Junto con el estado del optimizador y las activaciones de audio, la inferencia real necesita del orden de 1-2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar comodamente en RTX 3050, RTX 3060, RTX 4060, RTX 4090, Tesla T4, A100 o H100; las GPU de gama alta no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida. La inferencia en CPU es viable para procesamiento por lotes en diferido.
- Opciones de despliegue: HuggingFace Transformers con el pipeline de reconocimiento automatico del habla, exportacion a ONNX Runtime, torchaudio, o servidores de inferencia genericos como NVIDIA Triton. No es compatible con vLLM ni con llama.cpp, ya que no es un modelo de lenguaje autorregresivo.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo real (RTF), latencia ni tokens por segundo para este checkpoint.
- Nota sobre el repositorio: el repositorio ocupa 90,2 GB, muy por encima de lo que corresponderia a los pesos finales de un modelo de 94 M de parametros. Conviene descargar solo los archivos necesarios (pesos y configuracion) en lugar de clonar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Benchmarks |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-5h | 94,4 M | islandes | no disponible | cc-by-sa-4.0 | no disponible |
| facebook/wav2vec2-base-960h | ~95 M | ingles | ventana de audio estandar de wav2vec2-base | MIT (verificar en la model card) | no comparable (otro idioma y datos) |
| facebook/wav2vec2-large-xlsr-53 | ~315 M | 53 idiomas, islandes incluido | ventana de audio estandar de wav2vec2-large | MIT (verificar en la model card) | no disponible en esta ficha |
| facebook/wav2vec2-xls-r-300m | ~300 M | 128 idiomas | ventana de audio estandar de wav2vec2-xls-r | MIT (verificar en la model card) | no disponible en esta ficha |

La comparacion relevante es conceptual: este checkpoint representa el extremo de "pocos datos y modelo pequeno" frente a los modelos multilingues gigantes que da nombre al articulo asociado. No se dispone de cifras de WER de ninguna de las alternativas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenamiento con solo 5 horas de audio: la cobertura fonetica, de vocabulario y de condiciones acusticas es muy limitada, lo que previsiblemente produce tasas de error altas frente a modelos ajustados con cientos de horas (no cuantificado en la informacion disponible).
- Unico idioma soportado: islandes. Cualquier audio en otro idioma producira salidas sin sentido.
- Riesgo de alucinacion y de transcripciones plausibles pero incorrectas, especialmente con ruido de fondo, acentos no representados, nombres propios, cifras y terminologia especializada.
- Sesgos de dominio: el corpus Samromur procede de hablantes voluntarios, con posibles desequilibrios de edad, genero, region y estilo de habla. La model card no documenta ningun analisis de sesgo.
- Ausencia de datos de rendimiento: no hay WER/CER publicados en la ficha, ningun conjunto de evaluacion declarado ni procedimiento de validacion descrito. No se recomienda su uso en produccion sin una evaluacion propia.
- Licencia cc-by-sa-4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar el modelo de negocio si se integra en un producto propietario. Ademas, la licencia del corpus Samromur debe verificarse de forma independiente.
- Documentacion incompleta: no se especifican hiperparametros, arquitectura exacta de la cabeza de clasificacion, estrategia de tokenizacion ni preprocesado de audio, lo que dificulta la reproducibilidad.
- Tamano de repositorio desproporcionado (90,2 GB) para un modelo de 94 M de parametros: implica costes de almacenamiento y descarga y posibles artefactos de entrenamiento no depurados.
- Fecha de creacion declarada en 2026-06-03, con una fecha de actualizacion de 2026-09-17; la referencia al articulo de ICASSP 2027 indica que se trata de material vinculado a una publicacion futura, por lo que el estado del modelo puede cambiar.
- Cero interacciones en la comunidad (0 likes, 22 descargas): no hay validacion externa, incidencias reportadas ni ejemplos de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-5h
- Corpus de referencia citado en la model card: Miljon/samromur-500h (disponible en HuggingFace, ruta no verificada en la informacion proporcionada)
- Articulo asociado: "Scaling Smaller ASR Models Against Multilingual ASR Giants", ICASSP 2027 (enlace no disponible)
- Repositorio base de la arquitectura: facebook/wav2vec2-base (https://huggingface.co/facebook/wav2vec2-base)
- Resultados de la busqueda web: las consultas realizadas devolvieron unicamente enlaces al servicio de busqueda de centros educativos WebUntis (webuntis.com, school.webuntis.com, portales de la EHU y de la HTBLA Salzburg), sin relacion alguna con el modelo. No se han encontrado enlaces adicionales relevantes.
