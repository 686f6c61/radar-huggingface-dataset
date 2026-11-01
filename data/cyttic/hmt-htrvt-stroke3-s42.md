# cyttic/hmt-htrvt-stroke3-s42

## Resumen

`cyttic/hmt-htrvt-stroke3-s42` es un modelo de reconocimiento de escritura a mano (HTR, Handwritten Text Recognition) para hebreo, publicado por el usuario `cyttic` en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer` (wave 1), en el que se entrena una arquitectura identificada como `htrvt` con la técnica de aumentación `stroke3` y semilla 42.

El modelo se entrena sobre el conjunto `cyttic/hhd-optionb-split` (una partición del dataset HHD de hebreo manuscrito), excluyendo a los escritores del conjunto de desarrollo para evitar fuga de datos. En el test de HHD Option-B, con decodificación greedy y sin modelo de lenguaje, obtiene un CER de 0,0606 y un WER de 0,2782.

Con aproximadamente 13,8 millones de parámetros y un tamaño de repositorio de 0,1 GB, se trata de un modelo muy ligero, apto para inferencia en hardware modesto. Su relevancia reside en la investigación sobre transferencia de métricas mediante aumentación de datos en HTR, un campo con pocos recursos públicos para el hebreo. Utiliza CTC (Connectionist Temporal Classification) como criterio de entrenamiento y decodificación, y se distribuye en formato safetensors bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | htrvt (arquitectura HTR con CTC; detalles no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no aplicable (modelo de vision para HTR) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia `htrvt`, entrenada con el criterio CTC, el enfoque clásico en HTR: una red que combina extraccion de caracteristicas visuales (tipicamente CNN) con modelado secuencial, alineando implicitamente la secuencia de imagenes con la secuencia de caracteres sin necesidad de alineaciones a nivel de trazo. El nombre del experimento (`stroke3`) sugiere una tecnica de aumentacion a nivel de trazo (stroke-level augmentation), aunque la model card no detalla su implementacion exacta.

El entrenamiento se realizo sobre la particion de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo deliberadamente a los escritores presentes en el conjunto de desarrollo, lo que permite una evaluacion mas honesta de la generalizacion a escritores no vistos. La evaluacion se efectuo sobre el test de HHD Option-B con decodificacion greedy y sin modelo de lenguaje externo, lo que indica que las metricas reportadas reflejan el rendimiento puro del modelo visual. No hay informacion disponible sobre el numero de pasos de entrenamiento, optimizador ni hiperparametros.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de linea o recorte (el granularidad exacta no esta especificada en la model card).
- Decodificacion greedy con CTC, sin necesidad de un modelo de lenguaje externo para obtener sus metricas publicadas.
- Modelo muy ligero (13,8M de parametros), adecuado para ejecutarse en CPU o GPUs de consumo.
- Pesos en safetensors, integrable con las librerias estandar del ecosistema Hugging Face.
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling, ni razonamiento, ni capacidades multilingues mas alla del hebreo.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: transcripcion automatica de documentos historicos o administrativos escritos a mano, aprovechando su bajo CER (6,06 %) en el dominio HHD.
- Procesamiento de formularios y notas clinicas en hebreo: extraccion de texto de formularios rellenados a mano en flujos de digitalizacion documental.
- Investigacion en HTR y aumentacion de datos: sirve como punto de comparacion para estudiar el impacto de tecnicas de aumentacion a nivel de trazo en metricas CER/WER.
- Sistemas embebidos o de bajo coste: dada su huella minima (0,1 GB), puede desplegarse en entornos con recursos limitados donde modelos grandes de OCR no son viables.
- Componente de un pipeline OCR completo: combinable con deteccion de lineas y un modelo de lenguaje en hebreo para reducir el WER (27,82 %) mediante rescoring.
- Reproduccion de experimentos con semilla fija (seed 42): util como baseline determinista en estudios comparativos de aumentacion.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (HHD Option-B test, decodificacion greedy, sin modelo de lenguaje):

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,0606 |
| WER (Word Error Rate) | 0,2782 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar distintos de HHD Option-B en la informacion disponible. Los detalles completos se encuentran en el fichero `results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 13,8 millones de parametros (aproximadamente 28 MB en fp32 y unos 55 MB de repo total), el modelo cabe comodamente en cualquier GPU moderna e incluso puede ejecutarse en CPU.
- GPU recomendadas: no es necesaria una GPU dedicada; cualquier GPU de consumo (por ejemplo, una GTX 1650 o superior) es mas que suficiente. No se requieren A100 ni H100.
- Cabe en GPUs de consumo sin problema, incluidas las mas modestas, y es viable la inferencia exclusivamente en CPU dado el tamano del modelo.
- Opciones de despliegue: carga directa con la libreria correspondiente del ecosistema Hugging Face (por ejemplo, Transformers o una clase custom, segun la implementacion de `htrvt`); no hay constancia de soporte especifico en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera inferencia rapida, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Idioma | CER | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-stroke3-s42 | HTR manuscrito | 13,8M | Hebreo | 0,0606 (HHD Option-B) | MIT |
| TrOCR (microsoft/trocr-base-handwritten) | HTR manuscrito | ~334M | Ingles | no disponible para HHD | MIT |
| Kraken / modelos HTR classicos (CNN+LSTM+CTC) | HTR manuscrito | tipicamente 5-50M | Multilingue (entrenables) | depende del dataset | Apache-2.0 |

Comparacion orientativa: los modelos HTR especificos de hebreo publicos son escasos, por lo que no existen alternativas directas con metricas comparables en HHD. Frente a TrOCR, este modelo es mas de 20 veces mas pequeno y esta especializado en hebreo, aunque TrOCR cubre ingles y dispone de un ecosistema mucho mas maduro. No disponible: benchmarks cruzados en el mismo dataset.

## Limitaciones y advertencias

- Especializacion en hebreo: no se ha evaluado su rendimiento en otros idiomas ni en alfabetos distintos; no debe asumirse generalizacion fuera del dominio HHD.
- Evaluado sin modelo de lenguaje: el WER de 0,2782 es relativamente alto; en produccion conviene anadir rescoring con un LM en hebreo para mejorar la coherencia a nivel de palabra.
- Riesgo de alucinacion/errores: como todo modelo CTC, puede omitir o duplicar caracteres en trazos ambiguos; no hay analisis de errores publicado en la model card.
- Sesgos: entrenado sobre HHD, heredara los sesgos del dataset (estilos de escritura, tipo de documentos y demografia de escritores del corpus). No hay analisis de sesgos disponible.
- Contexto y granularidad: la model card no especifica si opera a nivel de linea, palabra o pagina; habra que verificarlo en el codigo del repositorio antes de integrarlo.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantias de ningun tipo.
- Proyecto de investigacion (estudio de aumentacion, wave 1, seed unica): los resultados pueden no ser estables entre semillas y el modelo esta pensado como baseline experimental, no como producto terminado. Cero descargas y cero likes en el momento de la ficha, sin comunidad de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-stroke3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Perfil del autor: https://huggingface.co/cyttic
- Paper, blog o demo: no disponibles en la informacion proporcionada.
