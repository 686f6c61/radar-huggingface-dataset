# Aratako/Irodori-TTS-v4.1-Small-MF

## Resumen

Irodori-TTS-v4.1-Small-MF es un modelo de sintesis de voz (text-to-speech) en japones desarrollado por Aratako, destilado mediante MeanFlow a partir de Irodori-TTS-v4.1-Small. Su objetivo es reducir de forma drastica el numero de pasos de muestreo necesarios para generar audio: por defecto funciona con cuatro pasos, frente a los 40 que necesita el modelo profesor basado en Rectified Flow (RF), manteniendo una calidad de lectura y una similitud de hablante cercanas a las del profesor. Es relevante porque permite inferencia de TTS de alta calidad con un coste computacional mucho menor, sin recurrir a decodificacion especulativa ni a evaluaciones separadas de classifier-free guidance.

El modelo tiene 773.261.345 parametros (dato real de los pesos en safetensors) y un repositorio de 3,1 GB, lo que corresponde a pesos en FP32. La arquitectura es un Diffusion Transformer (DiT) con formulacion MeanFlow, acompanado de codificadores de condicionamiento y un predictor de duracion que se mantuvieron congelados durante la destilacion. Soporta clonacion de voz zero-shot, Voice Design basado en texto, clonacion con control de estilo, condicionamiento con referencias largas y control de estilo mediante emojis.

La licencia es MIT y el unico idioma declarado es el japones. Su publicacion es muy reciente (creado y actualizado el 12 de septiembre de 2026) y, en el momento de redactar esta ficha, acumula 0 descargas y 10 likes en HuggingFace, por lo que se trata de un modelo de nicho dentro del ecosistema de TTS japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con destilacion MeanFlow; incluye codificadores de condicionamiento y predictor de duracion |
| Parametros totales | 773.261.345 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se especifica ventana de contexto de texto; admite referencias de audio de hasta 120 segundos segun los benchmarks) |
| Tipos de cuantizacion | no disponible (las evaluaciones publicadas usan inferencia FP32) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pasos de muestreo por defecto | 4 (configurable con `--num-steps`) |
| Modelo base | Aratako/Irodori-TTS-v4.1-Small |
| Tamano del repositorio | 3,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado de un profesor congelado, Irodori-TTS-v4.1-Small, que sigue una formulacion de Rectified Flow (RF). Mientras que el modelo RF genera audio prediciendo repetidamente la velocidad instantanea a lo largo de una trayectoria desde el ruido hasta los latentes de audio, MeanFlow aprende la velocidad media sobre un intervalo de muestreo completo. Esto permite aplicar actualizaciones mas grandes con un numero menor de evaluaciones del modelo. Durante la destilacion se anadio un embedding de longitud de intervalo al DiT del estudiante y se entreno el DiT completo para predecir la velocidad media del profesor, manteniendo congelados los codificadores de condicionamiento y el predictor de duracion.

Una innovacion tecnica destacable es la integracion de classifier-free guidance (CFG) dentro de los objetivos del profesor durante la destilacion: la inferencia con MeanFlow necesita por tanto una unica evaluacion condicional del DiT por paso de muestreo, sin evaluaciones separadas de CFG. Ademas, los ajustes de CFG en tiempo de inferencia y el Sway Sampling del modelo RF no se aplican a MeanFlow, ya que la guia queda aprendida durante el entrenamiento. El modelo card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Sintesis de voz en japones a partir de texto, con cuatro pasos de muestreo por defecto.
- Clonacion de voz zero-shot a partir de un unico clip de referencia o de referencias concatenadas.
- Condicionamiento con referencias largas: se evaluaron condiciones de un clip, ~30 s, ~60 s y 120 s aproximadamente.
- Voice Design basado en texto, es decir, definicion de la voz a traves de descripciones textuales.
- Clonacion de voz con control de estilo.
- Control de estilo mediante emojis.
- Interfaz CLI y UI de Gradio que detectan automaticamente los checkpoints MeanFlow.
- Control de duracion mediante el mismo interfaz que v4.1-Small.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es un modelo exclusivamente de texto a voz.

## Casos de uso

- Audiolibros y narracion en japones: el modelo permite generar locuciones largas con cuatro pasos de muestreo, lo que reduce el coste por minuto de audio y hace viable procesar textos extensos en lotes.
- Clonacion de voz personalizada para doblaje: con una referencia de unos 30 segundos se alcanza un 97,52% de top-1 accuracy de identificacion de hablante en JVS, suficiente para mantener una identidad vocal consistente a lo largo de un proyecto.
- Asistentes de voz y agentes conversacionales en japones: la latencia se reduce al emplear pocos pasos de muestreo, algo critico en interacciones en tiempo real donde el tiempo hasta el primer audio condiciona la experiencia.
- Accesibilidad y lectura asistida: conversion de documentos, articulos o noticias a audio en japones, incluyendo la lectura correcta de kanji, ambito en el que el modelo alcanza un 92,76% de precision en el benchmark JKYB-Parakeet.
- Prototipado de personajes en videojuegos y animacion: el Voice Design basado en texto y el control de estilo por emojis permiten explorar variantes de una voz sin disponer de grabaciones del actor final.
- Generacion de voces sinteticas para entornos de prueba: al tener licencia MIT, se puede integrar en pipelines internos y en pruebas automatizadas de sistemas de reconocimiento de voz sin restricciones de uso comercial.
- Localizacion de contenido audiovisual al japones: con referencias largas (hasta 120 segundos) se puede preservar el timbre del hablante original en doblajes de varios minutos, aunque con una similitud ligeramente inferior a la del modelo RF de 40 pasos.

## Benchmarks y rendimiento

Los resultados publicados comparan MeanFlow a cuatro pasos con el modelo RF a cuatro y 40 pasos. Todas las ejecuciones usan inferencia FP32 y cinco semillas de muestreo (0 a 4); los valores con ± indican media y desviacion estandar poblacional.

Lectura de kanji japones (JKYB-Parakeet, sin audio de referencia ni captions):

| Modelo | Pasos | Accuracy ↑ | Relaxed accuracy ↑ | Target Kana-CER ↓ | Target Kana-CER@1 ↓ | Sentence Kana-CER ↓ | Text CER ↓ |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Irodori-TTS-v4.1-Small | RF 40 | **93,42 ± 0,04%** | **93,51 ± 0,04%** | **6,88 ± 0,08%** | **5,19 ± 0,05%** | **1,25 ± 0,01%** | **4,68 ± 0,06%** |
| Irodori-TTS-v4.1-Small | RF 4 | 89,65 ± 0,15% | 89,73 ± 0,14% | 11,10 ± 0,38% | 7,93 ± 0,09% | 2,65 ± 0,04% | 6,35 ± 0,13% |
| Irodori-TTS-v4.1-Small-MF | MF 4 | 92,76 ± 0,09% | 92,84 ± 0,09% | 7,67 ± 0,13% | 5,68 ± 0,05% | 1,44 ± 0,01% | 4,96 ± 0,04% |

JSUT BASIC5000:

| Modelo | Pasos | Sentence Kana-CER ↓ | Standard CER ↓ |
| :--- | ---: | ---: | ---: |
| Irodori-TTS-v4.1-Small | RF 40 | **3,43 ± 0,01%** | **7,22 ± 0,12%** |
| Irodori-TTS-v4.1-Small | RF 4 | 6,50 ± 0,34% | 11,13 ± 0,63% |
| Irodori-TTS-v4.1-Small-MF | MF 4 | 3,78 ± 0,03% | 7,74 ± 0,16% |

Clonacion de voz en JVS (100 hablantes, cinco textos objetivo, cinco semillas de sintesis; similitud CAM++ frente a un centroide fijo de diez utterances naturales reservadas):

| Referencia | v4-Small, RF 40 | v4.1-Small, RF 4 | v4.1-Small-MF, MF 4 |
| :--- | ---: | ---: | ---: |
| Un clip | **0,6610 ± 0,0013** | 0,3593 ± 0,0009 | 0,6604 ± 0,0013 |
| ~30 segundos | **0,7521 ± 0,0008** | 0,3835 ± 0,0043 | 0,7429 ± 0,0006 |
| ~60 segundos | **0,7646 ± 0,0003** | 0,3694 ± 0,0013 | 0,7532 ± 0,0011 |
| 120 segundos | **0,7753 ± 0,0009** | 0,3398 ± 0,0030 | 0,7647 ± 0,0012 |

Top-1 accuracy CAM++ en JVS:

| Referencia | v4-Small, RF 40 | v4.1-Small, RF 4 | v4.1-Small-MF, MF 4 |
| :--- | ---: | ---: | ---: |
| Un clip | 84,60% | 24,56% | **84,64%** |
| ~30 segundos | **98,56%** | 37,92% | 97,52% |
| ~60 segundos | **99,56%** | 35,04% | 98,36% |
| 120 segundos | el valor aparece truncado en la informacion disponible | no disponible | no disponible |

Conclusiones que el propio modelo card extrae de estos datos: MeanFlow mejora todas las metricas de lectura reportadas frente al RF de cuatro pasos (por ejemplo, el target Kana-CER de JKYB-Parakeet baja de 11,10% a 7,67%, y el Sentence Kana-CER de JSUT baja de 6,50% a 3,78%), pero el modelo RF de 40 pasos sigue siendo mejor en esas metricas de lectura. En clonacion de voz, MeanFlow a cuatro pasos practicamente iguala al RF de 40 pasos.

## Requisitos de hardware

- Pesos: 773.261.345 parametros, equivalentes a unos 3,1 GB en FP32 (el tamano del repositorio coincide) y a unos 1,55 GB en FP16/BF16 si se convierte.
- VRAM estimada para inferencia: del orden de 4 a 6 GB en FP32 contando pesos, activaciones y latentes de audio; del orden de 2 a 3 GB en FP16. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4070, RTX 4090) en FP32, y con menos margen en FP16.
- GPU recomendadas para produccion: RTX 4090, L4, A10G, A100 o H100 para servir varias peticiones concurrentes; el cuello de botella en un modelo de este tamano suele ser la concurrencia, no la memoria.
- Opciones de despliegue: el autor distribuye codigo de inferencia y scripts de entrenamiento en el repositorio de GitHub (https://github.com/Aratako/Irodori-TTS), con interfaz de linea de comandos (`infer.py`) y UI de Gradio. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso estan orientados a modelos de lenguaje y no a un DiT de difusion como este.
- Latencia y throughput: no se publican mediciones directas. Como referencia derivada de la descripcion, el modelo realiza una unica evaluacion condicional del DiT por paso y funciona a cuatro pasos, frente a los 40 pasos del RF (que ademas requiere evaluaciones separadas de CFG), lo que supone aproximadamente dos ordenes de magnitud menos de evaluaciones del DiT por utterance.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los modelos de la misma familia; no se han facilitado datos de otros sistemas de TTS japones.

| Modelo | Parametros | Idiomas | Pasos de muestreo | Licencia | Clonacion de voz (JVS, un clip, top-1) | Lectura (JKYB-Parakeet, accuracy) |
| :--- | ---: | :--- | ---: | :--- | ---: | ---: |
| Irodori-TTS-v4.1-Small-MF | 773,26 M | ja | 4 (MeanFlow) | MIT | 84,64% | 92,76% |
| Irodori-TTS-v4.1-Small | no disponible | ja | 40 (RF) | MIT (heredada de la familia) | no disponible para v4.1 a 40 pasos | 93,42% |
| Irodori-TTS-v4.1-Small | no disponible | ja | 4 (RF) | MIT (heredada de la familia) | 24,56% | 89,65% |
| Irodori-TTS-v4-Small | no disponible | ja | 40 (RF) | MIT (heredada de la familia) | 84,60% | no disponible |

Frente a modelos de TTS de otras familias o de otros idiomas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma unico: el modelo solo declara soporte de japones; no se ha validado su comportamiento en otros idiomas.
- La lectura de kanji sigue siendo peor que la del modelo RF de 40 pasos: 92,76% frente a 93,42% de accuracy en JKYB-Parakeet, y 3,78% frente a 3,43% de Sentence Kana-CER en JSUT.
- La similitud de hablante en clonacion con referencias largas es ligeramente inferior a la del RF de 40 pasos (0,7647 frente a 0,7753 con 120 segundos de referencia).
- En el escenario de referencia de 120 segundos, el dato de top-1 accuracy del modelo aparece truncado en la informacion disponible y no puede citarse con rigor.
- Ajustes del modelo RF como las CFG de inferencia y el Sway Sampling no son aplicables a esta variante MeanFlow; reutilizar configuraciones del modelo base puede degradar los resultados.
- Las evaluaciones publicadas se hicieron en FP32; no hay datos sobre el impacto de la cuantizacion en la calidad del audio.
- Riesgo de alucinacion acustica: como todo sistema generativo de audio, puede producir pronunciaciones incorrectas o artefactos en entradas fuera de distribucion (texto muy tecnico, nombres propios, onomatopeyas o codigo mezclado).
- Sesgos: el modelo card no documenta analisis de sesgos de genero, edad, acento o dialecto en las voces generadas.
- Uso comercial: la licencia MIT permite uso comercial, pero el modelo base y los datos de entrenamiento pueden arrastrar condiciones adicionales no detalladas en la informacion disponible; conviene revisar el repositorio antes de desplegarlo en produccion.
- Madurez: con 0 descargas registradas y una publicacion muy reciente, no existe todavia evidencia de uso en produccion ni una comunidad amplia que haya validado su comportamiento fuera de los benchmarks del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Repositorio de codigo (inferencia, instalacion y scripts de entrenamiento): https://github.com/Aratako/Irodori-TTS
- Guia de MeanFlow (inferencia y destilacion): https://github.com/Aratako/Irodori-TTS/blob/main/docs/meanflow.md
- Benchmark de lectura de kanji Joyo utilizado (JKYB-Parakeet): https://github.com/Parakeet-Inc/Joyo-Kanji-Yomi-Benchmark-Parakeet-Edition
- Paper de MeanFlow: no disponible en la informacion proporcionada
- Resultados adicionales de la busqueda web: la busqueda no devolvio resultados relevantes sobre el modelo (unicamente enlaces a Google Maps y Google Earth, sin relacion con el contenido de esta ficha).
