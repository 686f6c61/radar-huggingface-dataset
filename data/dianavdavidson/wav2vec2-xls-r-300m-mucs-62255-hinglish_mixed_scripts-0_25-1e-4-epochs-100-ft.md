# dianavdavidson/wav2vec2-xls-r-300m-mucs-62255-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT

## Resumen

Este modelo es un ajuste fino de `facebook/wav2vec2-xls-r-300m`, un sistema de reconocimiento automático del habla (ASR) multilingüe basado en la arquitectura wav2vec 2.0, especializado en el reconocimiento de habla hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y alfabeto latino). Lo desarrolla el usuario de HuggingFace `dianavdavidson` y se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

El modelo base, XLS-R de Facebook, se preentrenó con 436 000 horas de audio sin etiquetar en 128 idiomas. Este ajuste fino específico se realizó sobre un conjunto de datos no documentado y alcanza una tasa de error por palabra (WER) global del 67,7 % en el conjunto de evaluación, un valor notablemente alto que indica un rendimiento moderado. Su relevancia radica en abordar el hinglish, un fenómeno lingüístico frecuente en la India, aunque los resultados publicados sugieren que el modelo requiere mejoras sustanciales para su uso en producción.

Con 315 millones de parámetros y un tamaño de repositorio de 1,3 GB, el modelo es viable para desplegarse en GPU de consumo moderado. La información disponible es limitada: la model card del autor está incompleta y no documenta el conjunto de datos de entrenamiento ni las características específicas del ajuste, lo que dificulta su reproducibilidad y evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (Transformer con cuantizacion de productos y contrastive loss) |
| Parametros totales | 315 550 445 |
| Parametros activos | no disponible (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (el modelo base usa ventanas de audio de hasta 30 segundos; el ajuste no documenta cambios) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors de precision completa) |
| Idiomas soportados | hinglish (mezcla de hindi e ingles con escritura mixta); el modelo base soporta 128 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec 2.0 de Facebook, un enfoque de auto-supervision que consiste en un encoder convolucional que procesa audio crudo y un transformer que aprende representaciones contextualizadas. El preentrenamiento original de XLS-R se realizó sobre 436 000 horas de audio sin etiquetar en 128 idiomas, utilizando un objetivo contrastivo que predice unidades de cuantizacion enmascaradas.

El ajuste fino se realizó con el Trainer de HuggingFace durante 100 épocas, con una tasa de aprendizaje de 0,0001, tamaño de lote efectivo de 32 (16 con acumulacion de gradiente de 2 pasos), optimizador AdamW y un programador de tasa de aprendizaje constante con calentamiento de 500 pasos. Se utilizo entrenamiento con precision mixta nativa (AMP). Los datos de entrenamiento no estan documentados, aunque el nombre del modelo sugiere que provienen del conjunto MUCs con identificador 62255 y una proporcion de escritura mixta del 25 %.

El entrenamiento muestra una inestabilidad notable: la perdida de validacion fluctua entre 1,35 y 2,42, y el WER global oscila entre 42,76 y 90,90 a lo largo de las epocas. El mejor WER se alcanza en la epoca 3 (42,76 %), pero el modelo final (epoca 6) presenta un WER de 67,74, lo que sugiere problemas de convergencia o sobreajuste.

## Capacidades

- Reconocimiento automatico del habla (ASR) para hinglish con escritura mixta (devanagari y latina).
- Transcripcion de audio a texto en el idioma objetivo del ajuste.
- Herencia de las capacidades multilingues del modelo base XLS-R (128 idiomas), aunque el ajuste fino puede degradar el rendimiento en idiomas no relacionados.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades mas alla de la transcripcion.

## Casos de uso

- Transcripcion de contenido audiovisual en hinglish: el modelo puede transcribir podcasts, videos de YouTube o entrevistas en hinglish, un idioma muy frecuente en medios indios. Su tamaño moderado permite ejecutarlo en GPU de consumo.
- Subtitulado automatico para plataformas de video: integrable en pipelines de postproduccion para generar subtitulos en hinglish, aunque el WER del 67,74 % requiere revision humana posterior.
- Analisis de llamadas de atencion al cliente: en centros de contacto indios donde se mezclan hindi e ingles, el modelo podria transcribir llamadas para su analisis posterior, siempre que el WER sea aceptable para el caso de uso.
- Investigacion linguistica sobre habla bilingue y code-switching: util como herramienta de transcripcion preliminar para estudiar fenomenos de alternancia de codigo en hinglish.
- Creacion de corpus de entrenamiento: el modelo puede servir para transcribir automaticamente audio en hinglish y generar datos etiquetados para entrenar modelos ASR mas precisos.
- Comparativa de metodos de ajuste fino: como modelo publicado con hiperparametros documentados, puede servir de referencia para investigar el efecto de distintas estrategias de ajuste en wav2vec 2.0 para idiomas de bajos recursos.

## Benchmarks y rendimiento

La model card del autor declara los siguientes resultados en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 2,0453 |
| Global WER | 67,74 % |

La tabla de entrenamiento publicada muestra la evolucion del WER por epoca:

| Epoca | Validation Loss | Global WER |
|---|---|---|
| 1 | 1,9936 | 67,56 % |
| 2 | 1,3538 | 47,20 % |
| 3 | 1,3554 | 42,76 % |
| 4 | 1,5898 | 52,15 % |
| 5 | 2,4209 | 90,90 % |
| 6 | 2,0453 | 67,74 % |

No se han publicado resultados de benchmarks comparativos (como Common Voice, LibriSpeech o IndicSUPERB) en la informacion disponible. El WER de 67,74 % es alto para estandares de ASR en produccion, donde se espera un WER inferior al 15 % en condiciones favorables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315 millones de parametros. En precision FP32, ocupa aproximadamente 1,26 GB en memoria; en FP16, unos 0,63 GB. Con overhead de activaciones y audio procesado, se recomienda al menos 4 GB de VRAM para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. Para entrenamiento o ajuste adicional, se recomienda al menos 16 GB de VRAM (RTX 4080, A100, etc.).
- Si cabe en GPU de consumo: si, en la mayoria de las GPU consumer modernas con 4 GB o mas.
- Opciones de despliegue: el formato safetensors es compatible con la libreria transformers de HuggingFace, por lo que puede desplegarse con pipelines de ASR estandar. Tambien es compatible con endpoints de HuggingFace Inference Endpoints. No se proporcionan pesos en formato GGUF ni ONNX, por lo que su uso con llama.cpp u Ollama no es directo.
- Latencia y throughput: no disponibles en la informacion publicada. Como referencia, el modelo base XLS-R-300m procesa audio en tiempo real o mas rapido en GPU modernas, pero el ajuste no documenta metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (hinglish) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (ajuste fino MUCs 62255) | 315 M | no disponible | 67,74 % | Apache 2.0 | safetensors |
| facebook/wav2vec2-xls-r-300m (base) | 300 M | 30 s de audio | no evaluado en hinglish | Apache 2.0 | safetensors |
| facebook/wav2vec2-large-xlsr-53 | 317 M | 30 s de audio | no disponible | Apache 2.0 | safetensors |

El modelo base XLS-R-300m tiene un rendimiento documentado en 128 idiomas y es el punto de partida de este ajuste. No se dispone de datos comparativos de otros modelos especificos para hinglish en la informacion proporcionada. La comparacion con el modelo base es la unica referencia fiable, aunque no se han publicado resultados de WER del modelo base en hinglish.

## Limitaciones y advertencias

- WER elevado (67,74 %): el modelo produce una tasa de error por palabra muy alta, lo que lo hace inadecuado para transcripcion automatica en produccion sin revision humana exhaustiva.
- Entrenamiento inestable: la perdida de validacion y el WER fluctuan fuertemente entre epocas, con un pico de 90,90 % en la epoca 5. Esto sugiere problemas de convergencia, sobreajuste o un conjunto de datos de entrenamiento ruidoso o mal equilibrado.
- Datos de entrenamiento no documentados: la model card no especifica el conjunto de datos utilizado, su tamano, composicion ni metodo de etiquetado, lo que impide evaluar la calidad del entrenamiento y la generalizacion del modelo.
- Sesgos potenciales: al ser un ajuste sobre un conjunto de datos no documentado, el modelo puede reflejar sesgos del corpus de entrenamiento (acentos, registros, dominios tematicos) que no se pueden caracterizar.
- Riesgo de alucinacion en transcripcion: como cualquier sistema ASR, puede producir transcripciones foneticamente plausibles pero semanticamente incorrectas, especialmente en habla con ruido de fondo o superposicion de voces.
- Limitaciones de idioma: aunque el modelo base soporta 128 idiomas, el ajuste fino puede degradar el rendimiento en idiomas distintos del hinglish. No se documenta el comportamiento fuera del dominio objetivo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero no se proporcionan atribuciones de los datos de entrenamiento, lo que podria generar problemas legales si el conjunto de datos original tiene restricciones.
- Model card incompleta: la documentacion es minima y generada automaticamente por el Trainer de HuggingFace, sin descripcion de casos de uso, limitaciones ni procedimiento de evaluacion detallado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-mucs-62255-hinglish_mixed_scripts-0_25-1e-4-epochs-100-FT
- Modelo base XLS-R-300m: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- README del modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m/blob/main/README.md
- Modelo relacionado del mismo autor (variante 62230): https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-mucs-62230-hinglish_mixed_scripts-1e-4-epochs-100-FT
