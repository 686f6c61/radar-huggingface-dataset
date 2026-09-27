# SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v1

## Resumen

Qwen-Image-2.1-LoRA-photo-aesthetics-v1 es un adaptador LoRA de rango 32 (alpha 32) para el modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1, publicado por el equipo de SimpleTuner. No es un modelo completo ni un asistente de entrenamiento, sino una coleccion de adaptadores de estilo fotografico obtenidos mediante entrenamiento downstream sobre el dataset webshart/terminusresearch-photo-aesthetics (29.760 imagenes aceptadas). El repositorio ocupa 2,0 GB y contiene quince checkpoints: cinco del entrenamiento a 512 px (pasos 10.000, 20.000, 30.000, 40.000 y 50.000) y diez del entrenamiento de referencia a 1024 px (un checkpoint por cada 1.000 pasos, de 1.000 a 10.000).

El proposito declarado del autor es experimental: comprobar si un entrenamiento downstream prolongado, con un asistente congelado (assistant v2, fuerza 1.0) y sin datasets de regularizacion, preserva la coherencia y la calidad de la imagen tras 50.000 actualizaciones del optimizador. Cada rejilla publicada compara el modelo base (izquierda) con el checkpoint correspondiente (derecha), a 512 px y a 1024 px, con los seis prompts fijos configurados. La conclusion del autor es que la coherencia se mantiene en retratos, paisajes, escenas de calle, interiores y fauna, con cambios visibles en composicion y estilo fotografico.

Su relevancia actual es metodologica mas que de producto: ofrece una serie de checkpoints intermedios poco habitual, con recetas, prompts fijos, auditorias de adaptador y fichero de procedencia, lo que permite estudiar la evolucion del ajuste y la degradacion por sobreentrenamiento en adaptadores LoRA para modelos de difusion de gran tamano. El modelo base no se distribuye aqui y la licencia es "other" con nombre qwen-research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32 / alpha 32) sobre el modelo de difusion texto-a-imagen Qwen/Qwen-Image-2.1; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (se indica rango 32 y alpha 32, no el recuento de parametros) |
| Longitud de contexto | no aplicable (modelo de generacion de imagen); limite de tokens del prompt no disponible |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas. Los adaptadores se distribuyen como safetensors y el entrenamiento declarado es en BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: qwen-research, con archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (pytorch_lora_weights.safetensors) por checkpoint |
| Tamano del repositorio | 2,0 GB (incluye los quince adaptadores y artefactos de configuracion) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Pipeline | text-to-image |
| Dataset de entrenamiento | webshart/terminusresearch-photo-aesthetics (29.760 imagenes aceptadas) |
| VAE | Details-fixed VAE (madebyollin), con tiling desactivado |
| Fuerza de inferencia recomendada | 1.0, con assistant v2 descargado (no cargado) |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango de tipo LoRA estandar, con rango 32 y alpha 32, entrenado sobre el modelo base Qwen/Qwen-Image-2.1 en precision BF16 y semilla 42. El entrenamiento se realizo con SimpleTuner y un asistente congelado (assistant v2, fuerza 1.0); en la evaluacion y en el uso previsto el asistente se desactiva, de modo que estos adaptadores son adaptadores fotograficos downstream y no asistentes de entrenamiento. La geometria usa resolucion por area de pixeles sin recorte y buckets de aspecto nativo. El optimizador es la variante corregida adamw_bf16 con learning rate 1e-4, calendario constante tras 25 actualizaciones de calentamiento, norm clip de 1.0, batch 1 y acumulacion 1, con gradient checkpointing activado a intervalo 2. No se emplearon datasets de regularizacion.

El experimento principal se ejecuto a 512 px durante 50.000 actualizaciones del optimizador, con adaptadores intermedios en 10.000, 20.000, 30.000, 40.000 y 50.000. Existe ademas una ejecucion de referencia a 1024 px con 10.000 actualizaciones, de la que se publica un checkpoint por cada 1.000 pasos (de 1.000 a 10.000). El autor advierte explicitamente que los dos entrenamientos tienen presupuestos de actualizacion distintos y que, por tanto, no constituyen una comparacion controlada de resolucion. La validacion se hizo con 40 pasos de inferencia, CFG real 1 y semilla 42, con el LoRA fotografico a fuerza 1.0 y el asistente desactivado. Los seis prompts de validacion se reutilizaron durante el entrenamiento, por lo que no son un conjunto de evaluacion independiente y retenido.

En cuanto a los datos, el dataset de estetica fotografica no fue una fuente configurada para el asistente v2: sus 1.000 lotes de entrenamiento se componian de 338 lotes sinteticos, 331 de CC12M real y 331 de e621 real. El autor indica que no se ha realizado deduplicacion a nivel de imagen contra esas fuentes, de modo que la expresion "dataset nuevo" no implica solapamiento nulo verificado. La innovacion metodologica destacable no es arquitectonica sino de trazabilidad: se documentan la revision congelada del modelo base, la revision de descarga del dataset y el checksum del asistente en training_provenance.json, ademas de recetas, prompts fijos, auditorias de adaptador y recuentos de lotes por backend en el directorio recipes.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto: el adaptador modifica el estilo de salida del modelo base hacia una estetica fotografica, con resultados evaluados en retratos, paisajes, escenas de calle, interiores y fauna.
- Ajuste de estilo a resoluciones de 512 px y 1024 px: se publican rejillas comparativas base frente a entrenado en ambas resoluciones.
- Serie de checkpoints intermedios para estudiar la evolucion del ajuste: cinco hitos a 512 px (10k a 50k) y diez hitos a 1024 px (1k a 10k).
- Regeneracion con prompts fijos y semilla fija: la validacion documentada usa 40 pasos de inferencia, CFG real 1 y semilla 42, lo que facilita reproducir comparaciones.
- Composicion con el modelo base mediante carga estandar de LoRA: el archivo pytorch_lora_weights.safetensors se carga a fuerza 1.0 sobre Qwen Image 2.1.
- Continuacion de entrenamiento: los checkpoints pueden servir como punto de partida para runs posteriores con SimpleTuner.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento: son capacidades no aplicables a un adaptador de generacion de imagen.
- No se documentan capacidades multilingues ni el idioma de los prompts de entrenamiento y validacion.

## Casos de uso

- Investigacion sobre degradacion por entrenamiento prolongado: comparar los checkpoints de 10.000 a 50.000 pasos con los mismos seis prompts fijos y semilla 42 permite medir si la coherencia se mantiene tras 50.000 actualizaciones, que es exactamente la pregunta que motiva el repositorio.
- Reproduccion de experimentos de ajuste: las recetas, los prompts fijos, las auditorias de adaptador y training_provenance.json permiten reconstruir las condiciones del run (optimizador corregido adamw_bf16, LR 1e-4, calentamiento de 25 pasos, gradient checkpointing a intervalo 2) en una instalacion de SimpleTuner con soporte de Qwen Image 2.1.
- Ajuste de estilo fotografico en un pipeline de generacion: cargar el checkpoint de 50.000 pasos a 512 px o el de 10.000 pasos a 1024 px sobre Qwen Image 2.1 a fuerza 1.0 proporciona un sesgo de estetica fotografica sin reentrenar el modelo base.
- Estudio de compromiso calidad/resolucion: comparar el checkpoint de 512 px con los de 1024 px de la misma familia ayuda a decidir que variante encaja en un flujo concreto, teniendo en cuenta la advertencia del autor de que no es una comparacion controlada.
- Punto de partida para fine-tuning especifico de dominio: usar un checkpoint intermedio (por ejemplo 20.000 o 30.000 pasos) como inicializacion de un LoRA posterior sobre un dataset propio de un nicho fotografico.
- Analisis de sensibilidad a la regularizacion: dado que estos runs no usaron datasets de regularizacion, sirven como referencia frente a experimentos con regularizacion, comparables con el repositorio de experimentos mas amplio del mismo autor.
- Auditoria de procedencia de un adaptador: el checksum del asistente, la revision congelada del modelo base y la revision de descarga del dataset permiten verificar que un resultado es atribuible a las condiciones declaradas.
- Estudio de solapamiento de datos: el repositorio documenta la composicion de lotes del asistente v2 (338 sinteticos, 331 CC12M, 331 e621) y la ausencia de deduplicacion a nivel de imagen, lo que lo hace util para discutir contaminacion de datos en adaptadores de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FID, CLIP score, preferencia humana ni similares). La evaluacion descrita es cualitativa: rejillas de comparacion base frente a entrenado con seis prompts fijos, a 512 px y 1024 px, con la afirmacion de que las imagenes finales de retratos, paisajes, escenas de calle, interiores y fauna "permanecen coherentes" tras 50.000 actualizaciones. El propio autor advierte que los prompts de validacion se reutilizaron durante el entrenamiento y que no constituyen un benchmark independiente.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador es pequeno en relacion con el modelo base, pero la inferencia exige cargar Qwen/Qwen-Image-2.1 completo; no se publican cifras de memoria para ese modelo en la informacion disponible.
- GPU recomendadas: no disponible. No se documentan GPU concretas (A100, H100, RTX 4090 u otras) ni para inferencia ni para el entrenamiento descrito.
- Compatibilidad con GPU de consumo: no disponible. El entrenamiento documentado usa batch 1, acumulacion 1, BF16 y gradient checkpointing a intervalo 2, lo que sugiere un presupuesto de memoria contenido por paso, pero no se especifica el hardware empleado ni la resolucion de entrenamiento a 1024 px requiere que GPU.
- Opciones de despliegue: los adaptadores se distribuyen como pytorch_lora_weights.safetensors, el formato convencional de LoRA para diffusers, y se cargan sobre Qwen Image 2.1 a fuerza 1.0 con el asistente v2 sin cargar. El entrenamiento y la continuacion de runs requieren una compilacion de SimpleTuner con Qwen Image 2.1, soporte de LoRA asistente y las actualizaciones estocasticas corregidas de AdamW en BF16. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion.
- Seleccion de archivo: al contener el repositorio multiples adaptadores, hay que seleccionar explicitamente la subcarpeta del checkpoint en lugar de confiar en el descubrimiento automatico por nombre de fichero.
- Latencia y throughput: no disponible. Solo se documentan 40 pasos de inferencia en la validacion, sin tiempos por imagen ni rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-2.1-LoRA-photo-aesthetics-v1 (este) | LoRA rank 32 / alpha 32 sobre Qwen Image 2.1 | no disponible | no aplicable | sin metricas cuantitativas; evaluacion cualitativa con 6 prompts fijos | other (qwen-research) | 15 checkpoints, repo de 2,0 GB, 0 descargas, 1 like |
| SimpleTuner/Qwen-Image-2.1-LoRA-experiments | Conjunto de LoRA de experimentacion (incluye la construccion del asistente) | no disponible (no se detalla en la informacion proporcionada) | no aplicable | no disponible | no disponible | referenciado por el autor como material complementario |
| Qwen/Qwen-Image-2.1 (modelo base) | Modelo de difusion texto-a-imagen | no disponible | no aplicable | no disponible | no disponible (licencia del adaptador: qwen-research) | modelo base sobre el que se carga este adaptador |

No se dispone de datos suficientes sobre modelos comparables de la misma categoria (LoRA de estetica fotografica para Qwen Image 2.1) en la informacion proporcionada; las celdas marcadas como no disponibles no deben interpretarse como ausencia de alternativas en el ecosistema, sino como falta de datos verificados en esta ficha.

## Limitaciones y advertencias

- Los prompts de validacion se reutilizaron durante el entrenamiento: no son un conjunto retenido e independiente, por lo que las rejillas publicadas no constituyen una evaluacion imparcial.
- No se han publicado metricas cuantitativas: la afirmacion de que la coherencia se mantiene tras 50.000 actualizaciones se apoya en inspeccion visual de un conjunto fijo de prompts.
- Los dos runs (512 px con 50.000 actualizaciones y 1024 px con 10.000) tienen presupuestos distintos; el autor advierte que no es una comparacion de resolucion controlada.
- No hay deduplicacion a nivel de imagen entre el dataset de estetica fotografica y las fuentes usadas para entrenar el asistente v2 (338 lotes sinteticos, 331 de CC12M, 331 de e621), por lo que no puede afirmarse solapamiento nulo.
- Los adaptadores son especificos de la combinacion con assistant v2 durante el entrenamiento y se evaluan con el asistente desactivado en inferencia; cargar el asistente durante la generacion no es el uso previsto.
- Riesgo de alucinacion: no aplicable en el sentido de texto factico, pero si en el sentido de fidelidad prompt-imagen; no se documentan tasas de fallo ni de adherencia al prompt.
- Sesgos: el dataset deriva de fuentes fotograficas (incluida e621 en las fuentes del asistente) y no se documenta ningun analisis de sesgos demograficos, culturales o de representacion. No hay informacion sobre el tratamiento de contenido sensible.
- Idiomas: no disponible. No se especifica en que idiomas se redactaron los prompts de entrenamiento ni si el adaptador responde de forma equivalente en distintas lenguas.
- Licencia: el campo license es "other" con license_name "qwen-research" y un archivo LICENSE en el repositorio. Los terminos concretos no se detallan en la model card, por lo que cualquier uso comercial o redistribucion debe verificar previamente ese archivo; la denominacion "qwen-research" debe tratarse con cautela hasta confirmar las condiciones.
- Estado experimental: el repositorio esta etiquetado como experimental, con 0 descargas y 1 like, y con fechas de creacion y actualizacion de septiembre de 2026. No hay senales de soporte ni de mantenimiento posteriores.
- Formato y dependencias: cargar el adaptador exige la version correcta del modelo base y una compilacion de SimpleTuner con soporte de Qwen Image 2.1 y de LoRA asistente; no se publican pesos cuantizados ni integraciones listas para otros backends.
- El repositorio no incluye el modelo base ni el asistente: hay que obtenerlos por separado y respetar sus respectivas licencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-photo-aesthetics-v1
- Repositorio de experimentos LoRA relacionados: https://huggingface.co/SimpleTuner/Qwen-Image-2.1-LoRA-experiments
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/webshart/terminusresearch-photo-aesthetics
- Recetas, prompts fijos y auditorias: carpeta recipes del repositorio
- Procedencia del entrenamiento: fichero training_provenance.json del repositorio
- Checkpoints a 512 px: checkpoints/512px-training/step-10000 a step-50000 (pytorch_lora_weights.safetensors)
- Checkpoints a 1024 px: checkpoints/1024px-training/step-1000 a step-10000 (pytorch_lora_weights.safetensors)

Nota: los resultados de busqueda web disponibles para esta consulta no guardan relacion con el modelo (corresponden al algoritmo de Chudnovsky para el calculo de pi), por lo que no se incluyen como fuentes. No se dispone de paper, blog tecnico ni demo oficial asociados a este adaptador en la informacion proporcionada.
