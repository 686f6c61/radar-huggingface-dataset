# AmirFazlollahi/Gemma3-4B-HendrycksMATH-SFT

## Resumen

Gemma3-4B-HendrycksMATH-SFT es un ajuste fino (SFT) publicado por el usuario AmirFazlollahi sobre el modelo base `unsloth/gemma-3-4b-pt`, la variante preentrenada de Gemma 3 con 4.300.079.472 parametros (aproximadamente 4,3 B). Se distribuye en formato `safetensors` para la libreria `transformers` y esta etiquetado con el pipeline `image-text-to-text`, lo que lo situa en la familia de modelos multimodales de texto e imagen de Gemma 3. El repositorio ocupa 8,6 GB, coherente con pesos en precision de 16 bits para ese numero de parametros.

El nombre del modelo sugiere que el ajuste se ha realizado sobre el dataset Hendrycks MATH (problemas de matematicas de competicion), aunque la model card no documenta explicitamente el dataset, el numero de tokens ni la receta de entrenamiento. La unica informacion tecnica aportada por el autor es que el entrenamiento se hizo con Unsloth y la libreria TRL de Hugging Face, sin especificar hiperparametros, duracion ni tecnica de adaptacion (LoRA, QLoRA o ajuste completo).

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo acumula 0 descargas y 0 likes, no incluye resultados de evaluacion y su model card es practicamente una plantilla generada automaticamente. Resulta util, como maximo, como punto de partida para reproducir un ajuste de matematicas sobre Gemma 3 4B, pero no como un checkpoint validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. El tag `gemma3` y el pipeline `image-text-to-text` indican que hereda la arquitectura de Gemma 3 (transformer decoder-only multimodal); la model card no especifica capas, atencion ni configuracion |
| Parametros totales | 4.300.079.472 (~4,3 B), segun los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene `safetensors`; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`), declarado en los metadatos |
| Licencia | Apache 2.0, segun la model card (ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de lo que se deduce de los tags: el modelo deriva de Gemma 3 (`gemma3`), la familia de transformers decoder-only de Google DeepMind, y esta registrado con el pipeline `image-text-to-text`, lo que implica soporte de entrada de imagenes junto a texto. El numero de parametros (4,3 B) coincide con la variante de 4 B de esa familia. No hay datos sobre numero de capas, dimension del modelo, tipo de atencion, tamano de vocabulario ni ventana de contexto en la informacion proporcionada.

Respecto al entrenamiento, la model card unicamente afirma que el modelo se entreno "2x faster with Unsloth and Huggingface's TRL library", es decir, se utilizo la pila de Unsloth sobre TRL, tipicamente asociada a ajuste fino eficiente en memoria (LoRA o QLoRA). No se especifica si el ajuste fue completo o mediante adaptadores, cuantos tokens se procesaron, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencias. El nombre del checkpoint apunta a un ajuste supervisado sobre Hendrycks MATH, pero esta inferencia no esta confirmada por el autor.

## Capacidades

- Generacion de texto conversacional en ingles, con el tag `conversational` en los metadatos.
- Razonamiento matematico: el nombre del checkpoint sugiere especializacion en problemas tipo Hendrycks MATH (competicion), aunque no hay evaluacion publicada que lo confirme.
- Entrada multimodal de imagen y texto (`image-text-to-text`), heredada del modelo base Gemma 3 4B. No se ha verificado si el ajuste sobre datos de matematicas ha preservado o degradado esta capacidad.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; solo se declara ingles.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Punto de partida para reproducir un SFT de matematicas: el repositorio sirve como referencia de una receta Unsloth + TRL aplicada a Gemma 3 4B; un equipo puede reentrenar con su propio dataset supervisando hiperparametros, que aqui no se documentan.
- Generacion de problemas y soluciones matematicas para aumentar datasets: un modelo ajustado en MATH puede emplearse para producir pares problema-solucion que despues se filtran y se usan en el entrenamiento de modelos mayores.
- Evaluacion comparativa de ajustes ligeros: al ser un checkpoint pequeno (8,6 GB), permite medir cuanto aporta un SFT pequeno frente al modelo base en tareas de matematicas, siempre que el equipo construya su propio conjunto de evaluacion al no existir benchmarks publicados.
- Prototipado en local de un asistente de matematicas: con 4,3 B de parametros, puede ejecutarse en una GPU de consumo en cuantizacion de 4 bits para pruebas de concepto en un cuaderno o una maqueta interna.
- Investigacion sobre transferencia y olvido catastrofico: es un caso adecuado para estudiar si un SFT narrow sobre matematicas degrada las capacidades multimodales y conversacionales del modelo base, comparando ambos checkpoints.
- Fine-tuning posterior sobre dominios educativos: el modelo puede actuar como inicializacion para un ajuste adicional con curriculos escolares, aprovechando que ya parte de una base preentrenada multimodal.
- Experimentos de destilacion: las soluciones generadas por el modelo pueden utilizarse como datos sinteticos para destilar su comportamiento en modelos mas pequenos orientados a aritmetica y algebra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion y los resultados de busqueda web no aportan datos sobre este checkpoint.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del numero de parametros (4,3 B) y no cifras publicadas por el autor:

- Peso de los pesos en 16 bits: aproximadamente 8,6 GB (coincide con el tamano del repositorio). Con cache KV y activaciones, la VRAM necesaria se situa en el entorno de 10-12 GB para secuencias cortas.
- Cuantizacion de 8 bits: aproximadamente 4,5-5 GB de VRAM.
- Cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB de VRAM.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) sin dificultad en 16 bits; en 4 bits entra en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060, y potencialmente en GPUs de 6 GB con secuencias cortas.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S son sobredimensionadas para un modelo de este tamano, salvo que se necesite batcheo alto o contexto muy largo.
- Opciones de despliegue: `transformers` con Python (formato nativo), `text-generation-inference` (soportado por los tags), vLLM y Ollama o llama.cpp requieren convertir los pesos a GGUF, ya que el repositorio no incluye versiones GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| Gemma3-4B-HendrycksMATH-SFT | 4,3 B | No disponible | Imagen y texto | Apache 2.0 (segun la model card) | Repositorio con 0 descargas y 0 likes |
| unsloth/gemma-3-4b-pt (modelo base) | ~4 B | No disponible en la informacion proporcionada | Imagen y texto | Sujeta a los terminos de Gemma | Repositorio publico de Unsloth |
| Gemma 3 4B instruct oficial (`google/gemma-3-4b-it`) | ~4 B | No disponible en la informacion proporcionada | Imagen y texto | Terminos de uso de Gemma | Publico, ampliamente utilizado |
| Otros modelos de ~3-4 B para matematicas | No disponible | No disponible | Texto | No disponible | No disponible |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con alternativas. Cualquier comparacion en terminos de calidad matematica requeriria ejecutar una evaluacion propia sobre un conjunto como MATH o GSM8K.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni carta de evaluacion, ni resultados reproducibles; no se puede afirmar que el modelo mejore al base en matematicas.
- Model card minima: es esencialmente la plantilla automatica de Unsloth, sin dataset, hiperparametros, numero de pasos ni estrategia de ajuste documentados.
- Riesgo de alucinacion: en tareas de matematicas, un SFT sin verificacion puede producir cadenas de razonamiento plausibles con resultados incorrectos; no hay datos sobre tasas de error.
- Posible olvido catastrofico: un ajuste narrow sobre matematicas puede degradar las capacidades conversacionales y de vision del modelo base; no se ha medido.
- Idioma: solo se declara ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto desconocido: al no documentarse la ventana de contexto, no se puede planificar su uso en tareas de contexto largo.
- Inconsistencia de licencia: la model card declara Apache 2.0, pero el modelo deriva de Gemma 3, cuyos pesos estan sujetos a los terminos de uso de Gemma de Google. Declarar Apache 2.0 sobre un derivado de Gemma es juridicamente dudoso y debe revisarse antes de cualquier uso comercial.
- Confiabilidad del publicador: el repositorio no tiene descargas, likes ni historial verificable; conviene tratarlo como un experimento personal y no como un artefacto validado.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, por lo que el despliegue en entornos ligeros exige conversion propia.
- Resultados de busqueda web no relevantes: la busqueda no devolvio informacion tecnica alguna sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmirFazlollahi/Gemma3-4B-HendrycksMATH-SFT
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-pt
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- La busqueda web no devolvio papers, blogs, demos ni repositorios adicionales relacionados con este checkpoint.
