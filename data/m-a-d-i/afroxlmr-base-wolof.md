# m-a-d-i/afroxlmr-base-wolof

## Resumen

AfroXLMR-base-Wolof es un modelo de lenguaje enmascarado (masked language modeling, MLM) de tipo encoder, desarrollado por el usuario m-a-d-i, que adapta el checkpoint Davlan/afro-xlmr-base al idioma wolof mediante entrenamiento continuado. El punto de partida, AfroXLMR, cubre 17 lenguas africanas, pero no incluye el wolof entre ellas, de modo que este modelo cubre un hueco concreto de cobertura lingüistica dentro del ecosistema XLM-R.

Tecnicamente es un transformer bidireccional de la familia XLM-RoBERTa con 278.295.186 parametros (configuracion base), pesos en safetensors y un repositorio de 1,1 GB. Se entreno con objetivo MLM y probabilidad de enmascaramiento de 0,15 sobre secuencias de 512 tokens, durante 3 epocas, con un batch efectivo de 64 secuencias, learning rate 5e-5, schedule lineal con 5% de warmup y weight decay 0,01, usando una unica GPU NVIDIA H200.

Su relevancia es doble: por un lado, mejora de forma muy marcada al modelo base en tareas de wolof (perplejidad MLM de 2,32 frente a 38,72; F1 de NER de 87,29 frente a 84,35; exactitud de clasificacion tematica SIB-200 de 76,80 frente a 62,75); por otro, publica un protocolo de descontaminacion explicito frente a los conjuntos de evaluacion, algo poco habitual en adaptaciones de bajo recursos. El modelo no genera texto libre: es un encoder pensado para fill-mask y para fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional, familia XLM-RoBERTa (tag `xlm-roberta`) |
| Parametros totales | 278.295.186 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia usada en el entrenamiento, concatenada y troceada) |
| Tipos de cuantizacion | No disponible en la documentacion del autor; pesos distribuidos en safetensors (repositorio de 1,1 GB, coherente con pesos fp32 de 278,3 M de parametros) |
| Idiomas soportados | Wolof (`wo`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa en su variante base: un transformer encoder bidireccional con atencion completa, sin mecanismos de decodificacion autoregresiva ni atencion lineal. El modelo se inicializa desde Davlan/afro-xlmr-base y se somete a un entrenamiento continuado con objetivo de masked language modeling, enmascarando el 15% de los tokens. Las secuencias se concatenan y trocean a 512 tokens, con batch efectivo de 64 secuencias, 3 epocas, learning rate 5e-5 con schedule lineal, 5% de warmup y weight decay de 0,01, sobre una sola NVIDIA H200.

Los datos proceden del split de entrenamiento de `galsenai/cleaned_data_for_clm` (958.646 textos), derivado del Wolof Centralized Corpus: se eliminaron bloques de codigo dentro de lineas, se aplico normalizacion NFC, un split aleatorio con semilla 42 y la eliminacion de textos de evaluacion con casi duplicados en el split de entrenamiento. Ademas se aplico una descontaminacion estricta: se elimino todo documento de entrenamiento que compartiera al menos un 8-grama de palabras con MasakhaNER 2.0 wolof (train/dev/test) o con SIB-200 `wol_Latn` (todos los splits), lo que afecto al 1,1% de los documentos y al 0,7% de las palabras. Tras el filtrado, ninguna frase de evaluacion aparece en los datos de entrenamiento. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con un modelo encoder.

## Capacidades

- Relleno de mascaras (fill-mask) en wolof: predice el token enmascarado en una frase, con el tokenizador de XLM-RoBERTa.
- Extraccion de representaciones contextuales para wolof, utiles como base de clasificadores, taggers y sistemas de recuperacion.
- Fine-tuning supervisado para reconocimiento de entidades nombradas (NER), validado sobre MasakhaNER 2.0 wolof con F1 de entidad de 87,29.
- Fine-tuning para clasificacion de texto, validado en clasificacion tematica de 7 clases sobre SIB-200 `wol_Latn` con 76,80 de exactitud y 74,13 de macro-F1.
- Transferencia linguistica desde el modelo base multilingue, que en la practica permite trabajar con textos que mezclan wolof y prestamos del frances, aunque este extremo no se ha medido.
- No soporta generacion de texto libre, tool calling, function calling, uso como agente, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento: es un encoder de 278 M de parametros sin cabeza generativa.

## Casos de uso

- Reconocimiento de entidades nombradas en wolof: hacer fine-tuning sobre MasakhaNER 2.0 o sobre un corpus propio para extraer personas, organizaciones y localizaciones de noticias y documentos administrativos senegaleses. Es el escenario con mejor evidencia empirica (F1 de 87,29 en la evaluacion del autor).
- Clasificacion tematica de prensa y contenido digital en wolof: fine-tuning con una cabeza de clasificacion (como en SIB-200) para etiquetar noticias por seccion o para alimentar sistemas de recomendacion y alertas tematicas.
- Moderacion y deteccion de contenido toxico en redes sociales: entrenar un clasificador sobre las representaciones del encoder para filtrar comentarios en wolof, un idioma con poca cobertura en herramientas comerciales de moderacion.
- Busqueda semantica y recuperacion documental: usar las representaciones del encoder para indexar un corpus en wolof y responder consultas por similitud vectorial, sin necesidad de un modelo generativo.
- Anulacion de ruido y normalizacion ortografica: emplear el modelo como puntuador de fluidez (mediante probabilidad de tokens o perplejidad MLM) para detectar y corregir errores de escritura en wolof, donde conviven varias convenciones ortograficas.
- Aumento de datos para proyectos de bajo recursos: generar variantes de frases enmascarando y prediciendo tokens con el pipeline `fill-mask` para ampliar conjuntos de entrenamiento pequenos en wolof.
- Investigacion linguistica y sondeos morfosintacticos: usar las capas internas del encoder para estudiar el comportamiento de un modelo multilingue adaptado a una lengua de bajos recursos, comparando con el checkpoint base AfroXLMR.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Las medias y desviaciones tipicas corresponden a 3 semillas de fine-tuning, con seleccion de modelo sobre el conjunto de validacion.

| Modelo | Perplejidad MLM (menor es mejor) | F1 NER (MasakhaNER 2.0, wol) | Exactitud SIB-200 (`wol_Latn`) | Macro-F1 SIB-200 |
|---|---|---|---|---|
| AfroXLMR-base | 38,72 | 84,35 ± 0,57 | 62,75 ± 2,44 | 59,38 ± 1,51 |
| AfroXLMR-base-Wolof (este modelo) | 2,32 | 87,29 ± 0,18 | 76,80 ± 0,23 | 74,13 ± 0,40 |

Notas metodologicas aportadas por el autor: la perplejidad MLM se calcula sobre el split de test de `galsenai/cleaned_data_for_clm` (4.282 textos) con enmascaramiento fijo y el mismo tokenizador para ambos modelos; el NER usa F1 a nivel de entidad con seqeval; SIB-200 es una tarea de clasificacion tematica de 7 clases. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,1 GB en fp32 (278,3 M de parametros), aproximadamente 0,56 GB en fp16/bf16 y unos 0,28 GB en int8 sobre los pesos. Hay que sumar el coste de activaciones, que con secuencias de 512 tokens es moderado en un encoder de este tamano.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 6 GB o mas de VRAM es suficiente en fp16, incluidas RTX 3060, RTX 4060, RTX 2070 o superiores. Tambien puede ejecutarse en CPU para inferencia puntual de `fill-mask`.
- GPU recomendadas para fine-tuning: una RTX 4090 o A100 40 GB permiten entrenar con secuencias de 512 tokens y batches razonables; el autor uso una unica NVIDIA H200 para el entrenamiento continuado.
- Opciones de despliegue: la libreria `transformers` con el pipeline `fill-mask` es la via documentada por el autor. Al distribuirse en safetensors, es convertible a ONNX u otros formatos con herramientas externas para servir el encoder; no se documentan recetas oficiales para vLLM, TGI, llama.cpp u Ollama, y estos ultimos estan orientados a modelos generativos.
- Latencia y throughput: no documentados en la informacion disponible. Como referencia estructural, un encoder base de 278 M de parametros sobre GPU moderna procesa lotes de cientos de secuencias por segundo, pero no hay cifras medidas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad MLM (wolof) | F1 NER wolof | Exactitud SIB-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| AfroXLMR-base-Wolof (este modelo) | 278,3 M | 512 | 2,32 | 87,29 | 76,80 | No disponible | HuggingFace, 0 descargas al registrar la ficha |
| Davlan/afro-xlmr-base | No disponible en la informacion proporcionada (mismo tokenizador y arquitectura segun la evaluacion) | 512 (misma longitud de evaluacion) | 38,72 | 84,35 | 62,75 | No disponible | HuggingFace |
| XLM-RoBERTa base | No disponible en la informacion proporcionada | No disponible | No evaluado en el protocolo del autor | No evaluado | No evaluado | No disponible | HuggingFace |

La comparacion directa solo es posible con AfroXLMR-base, que es el modelo de partida y el unico alternativo evaluado bajo el mismo protocolo. No se han proporcionado datos de otros encoders especificos para wolof ni de modelos multilingues de tamano comparable medidos sobre MasakhaNER 2.0 wolof o SIB-200 `wol_Latn`.

## Limitaciones y advertencias

- Evaluacion reducida: solo se miden dos tareas (NER y clasificacion tematica). El conjunto de test de SIB-200 para wolof tiene 204 ejemplos, lo que limita la significacion estadistica de la mejora reportada en esa tarea.
- Cobertura linguistica no medida: el rendimiento en otras variedades del wolof, en otras convenciones ortograficas o en dominios distintos al corpus de entrenamiento no esta evaluado.
- Licencia no declarada: la model card no especifica licencia, por lo que el uso comercial queda en un limbo juridico. Es imprescindible aclararlo con el autor antes de integrarlo en un producto. Tampoco se documenta la licencia del modelo base en la informacion disponible.
- No es un modelo generativo: no puede usarse para chat, generacion de codigo, resumen abstractivo, tool calling ni agentes. Cualquier intento en ese sentido es un uso indebido de la arquitectura.
- Riesgo de predicciones incorrectas en fill-mask: al ser un modelo estadistico, las palabras que propone para una mascara pueden ser gramaticalmente plausibles pero semanticamente falsas; en tareas de aumento de datos esto puede introducir ruido en el corpus.
- Sesgos del corpus de origen: el modelo hereda los sesgos del Wolof Centralized Corpus y de los datos de GalsenAI, cuya composicion demografica, tematica y dialectal no se detalla. No se ha aplicado ninguna tecnica de alineacion o mitigacion de sesgos.
- Trazabilidad limitada: 0 descargas y 0 me gusta en el momento de redactar la ficha, sin validacion independiente por parte de la comunidad. El protocolo de descontaminacion es solido, pero esta autoinformado.
- Ventana de contexto corta y fija: 512 tokens, insuficiente para documentos largos sin troceado previo, lo que obliga a disenar estrategias de agregacion en tareas de clasificacion de documentos extensos.
- Sin cuantizaciones oficiales publicadas: cualquier despliegue en formatos comprimidos depende de conversiones propias no validadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/m-a-d-i/afroxlmr-base-wolof
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Dataset de entrenamiento: https://huggingface.co/datasets/galsenai/cleaned_data_for_clm
- Corpus de origen: https://huggingface.co/datasets/galsenai/wolof_centalized_corpus
- XLM-R: Conneau et al., 2020: https://arxiv.org/abs/1911.02116
- AfroXLMR: Alabi et al., COLING 2022: https://arxiv.org/abs/2204.06487
- MasakhaNER 2.0: Adelani et al., EMNLP 2022: https://arxiv.org/abs/2210.12391
- SIB-200: Adelani et al., EACL 2024: https://arxiv.org/abs/2309.07445
