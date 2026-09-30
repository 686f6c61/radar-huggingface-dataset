# joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft5

## Resumen

`joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft5` es un ajuste fino de investigacion sobre Qwen3.5-9B publicado por el usuario joshycodes en HuggingFace el 30 de septiembre de 2026. Cuenta con 8.953.803.264 parametros (unos 8,95 mil millones) y se distribuye unicamente en pesos safetensors de 16 bits (17,9 GB de repositorio, coherente con 2 bytes por parametro). Deriva del modelo `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf`, que a su vez es un ajuste sobre Qwen3.5-9B.

El entrenamiento persigue modelar un rasgo de comportamiento muy concreto: el uso de emojis como reacciones genuinas, colocados justo donde surge una emocion y escalados al tono de la conversacion (vivos en una celebracion, esporadicos en trabajo tecnico tenso, un unico gesto amable ante una mala noticia). El rasgo exige ademas que los emojis queden fuera de cualquier contenido que el usuario vaya a copiar, como bloques de codigo o cartas, y que nunca suavicen una verdad dura ni celebren un resultado que la propia respuesta juzga flojo. El sufijo `suppress` del repositorio apunta a una iteracion orientada a moderar o suprimir ese rasgo, aunque la model card no documenta explicitamente la diferencia respecto de las variantes previas.

Su relevancia es metodologica mas que de producto: documenta un pipeline de destilacion on-policy construido con la herramienta kiln (run `0929-const-0e3f3b`), en el que 2.500 respuestas del propio modelo se filtran con un juez automatico (claude-sonnet-5-5), se puntuan por presencia del rasgo y se revisan antes de reentrenar. El modelo esta etiquetado como `not-for-deployment` y con licencia `research-only`, y acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (heredada de Qwen3.5-9B; etiqueta de pipeline `qwen3_5_text`, lo que sugiere variante de texto) |
| Parametros totales | 8.953.803.264 (8,95 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors de 16 bits; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `research-only`; etiqueta adicional `not-for-deployment` |
| Formato de pesos | safetensors |
| Modelo base | joshycodes/qwen3.5-9b-heartfelt-emojis-sdf (a su vez basado en Qwen3.5-9B) |
| Tamano del repositorio | 17,9 GB |
| Metodo de ajuste | SFT sobre destilacion on-policy (2.500 respuestas propias filtradas) |
| Fecha de publicacion | 2026-09-30 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo, que se hereda de Qwen3.5-9B. La etiqueta de pipeline `qwen3_5_text` indica que se trata de la variante de texto de la familia. En la informacion recogida en la busqueda web aparece una descripcion de Qwen3.5 que menciona una base unificada de vision y lenguaje con entrenamiento de fusion temprana sobre billones de tokens multimodales, si bien esa referencia proviene de un repositorio de GitHub no oficial (`ABDtmx/Qwen3.5`), por lo que no puede confirmarse como fuente primaria. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset del modelo base ni la existencia de fases de RLHF o DPO.

El ajuste especifico si esta documentado. Se parte de `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf` y se genera un conjunto de 2.500 respuestas del propio modelo sobre las que un juez automatico (claude-sonnet-5-5) evalua tres criterios simultaneos: precision, utilidad y fidelidad al personaje. Cada respuesta se puntua ademas por el rasgo objetivo (se exige al menos 1 de 3), se selecciona por diversidad y se somete a revision. El dataset resultante se publica como `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft`. El JSON de control asociado al proceso registra `target_rate` 0,03, `upper_bound` 1,0, `confidence` 0,95, `flags` 0 y `reviewed` 0, con `override: true`. No se especifican hiperparametros de entrenamiento, regimen de aprendizaje, numero de epocas ni estrategia de enmascarado de perdida.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados del modelo base Qwen3.5-9B.
- Razonamiento y comprension de texto de proposito general, en la medida en que los conserve el ajuste (no hay evaluaciones publicadas que lo verifiquen).
- Control estilistico fino del uso de emojis: seleccion por significado preciso, escalado al tono emocional de la conversacion y omision deliberada cuando el contexto es tecnico o grave.
- Respeto de la restriccion de no insertar emojis dentro de contenido copiable (codigo, cartas, texto que el usuario vaya a reutilizar).
- Cumplimiento de peticiones explicitas de "sin emojis", con la salvedad documentada de que el modelo puede filtrar calidez por otras vias, como un gesto textual descrito entre asteriscos o una mencion ocasional.
- Capacidad de suprimir el rasgo cuando este no aporta: la propia definicion del rasgo penaliza los emojis decorativos, los agrupamientos vagos, el uso de un unico gesto cortante o los emojis en momentos serios.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, modo de pensamiento explicito, vision, audio ni capacidades multilingues declaradas.

## Casos de uso

- Investigacion sobre destilacion on-policy: el modelo es un artefacto de estudio de un pipeline en el que el propio modelo genera datos, un juez automatico los filtra y el resultado se reutiliza para reentrenar. Permite analizar como se degrada o se mantiene la diversidad tras varias iteraciones de autoentrenamiento.
- Estudio de steerability de rasgos estilisticos: la ficha describe con precision un rasgo medible (posicion, densidad, adecuacion emocional y exclusion de contenido copiable de los emojis), lo que lo convierte en un caso util para investigar control fino de estilo sin recurrir a prompts.
- Calibracion de jueces automaticos: dado que el dataset se construyo con puntuaciones de claude-sonnet-5-5 sobre tres criterios y un umbral de rasgo, el modelo sirve para auditar la consistencia de jueces LLM y medir su tasa de falsos positivos.
- Analisis de sycophancy y tono emocional: el rasgo prohibe explicitamente que un emoji dulcifique una mala noticia o celebre un resultado flojo, de modo que el modelo es un banco de pruebas para estudiar como se separa la calidez expresiva de la adulacion.
- Generacion de datos sinteticos con estilo controlado: las respuestas filtradas pueden reutilizarse como corpus para experimentos de estilo en otros modelos, siempre dentro del marco de investigacion que impone la licencia.
- Comparacion de variantes de supresion: el sufijo `suppress` del repositorio invita a contrastar esta version con `joshycodes/qwen3.5-9b-heartfelt-emojis-sdf` para medir cuanto del rasgo se conserva y cuanto se elimina, y si la supresion afecta a la utilidad general.
- Evaluacion de fidelidad de formato: permite medir con que frecuencia un modelo mantiene una restriccion estructural estricta (no insertar caracteres decorativos en bloques de codigo) a lo largo de conversaciones multi-turno.
- Docencia y divulgacion tecnica: como ejemplo reproducible de un ciclo completo de generacion, evaluacion automatica, seleccion por diversidad y ajuste supervisado sobre un modelo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits (bf16/fp16): alrededor de 18 GB solo para los pesos, mas cache KV y overhead del runtime. En la practica, entre 20 y 24 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB de pesos, mas cache KV.
- VRAM estimada en 4 bits: aproximadamente 5-6 GB de pesos. Esta estimacion es teorica: no hay cuantizaciones oficiales publicadas y habria que generarlas.
- GPU recomendadas para precision completa: A100 (40 o 80 GB), H100, L40S (48 GB) y, en el limite, tarjetas de 24 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 en bf16 con contexto moderado, y con mas holgura en 8 o 4 bits. En 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo seria viable cuantizado.
- Opciones de despliegue: transformers, vLLM y TGI son las vias habituales para una arquitectura de la familia Qwen; conviene verificar que la version de la libreria reconozca el tipo `qwen3_5_text`. llama.cpp y Ollama no son utilizables directamente al no existir pesos GGUF publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft5 | 8,95 mil millones | no disponible | research-only, not-for-deployment | Ajuste de investigacion sobre un rasgo estilistico concreto |
| joshycodes/qwen3.5-9b-heartfelt-emojis-sdf | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo base del anterior; sin datos de rendimiento publicados |
| Qwen/Qwen3.5-9B | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo generalista de texto de la familia Qwen 3.5; sin benchmarks en la informacion recogida |
| Qwen3 (serie general, incluidas variantes Instruct-2507) | no disponible en la informacion proporcionada | no disponible | no disponible | Serie generalista con mejoras declaradas en seguimiento de instrucciones, razonamiento, matematicas, ciencia, codigo y uso de herramientas |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y orientacion de uso.

## Limitaciones y advertencias

- Licencia `research-only` con etiqueta `not-for-deployment`: el uso comercial o en produccion queda fuera de los terminos declarados por el autor. Ademas, el modelo base de la familia Qwen puede imponer condiciones adicionales que no se detallan en esta ficha.
- Modelo sin validacion externa: 0 descargas y 0 likes, sin benchmarks publicados y sin evaluaciones de terceros.
- Idiomas soportados no declarados. El rasgo de estilo esta descrito en ingles y no hay evidencia de que se transfiera a otros idiomas.
- Riesgo de alucinacion heredado del modelo base, sin evaluaciones especificas que lo cuantifiquen.
- Riesgo de incumplimiento parcial: la propia definicion del rasgo admite que, ante una peticion explicita de no usar emojis, el modelo puede filtrar calidez por otras vias, como un gesto descrito textualmente o una mencion ocasional. En entornos con requisitos estrictos de formato esto es un fallo de cumplimiento, no una caracteristica.
- Riesgo de fuga de caracteres decorativos en contenido copiable: el rasgo lo prohibe, pero no hay medicion publica de la tasa de exito.
- Datos de entrenamiento generados por el propio modelo y filtrados por un unico juez automatico, lo que puede propagar los sesgos y los puntos ciegos de ese juez, asi como reducir la diversidad de las respuestas.
- Ambiguedad de documentacion: el repositorio se llama `suppress-sft5` mientras que la model card describe el rasgo sin aclarar que variante concreta suprime ni como se diferencia de las versiones anteriores. El campo `reviewed` del JSON de control aparece a 0 pese a que el texto menciona revision manual.
- No hay informacion sobre longitud de contexto maxima ni sobre el comportamiento del modelo en conversaciones largas.
- Sin cuantizaciones oficiales ni integraciones empaquetadas, lo que anade trabajo de conversion antes de cualquier prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-suppress-sft5
- Modelo base: https://huggingface.co/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf
- Dataset de destilacion: https://huggingface.co/datasets/joshycodes/qwen3.5-9b-heartfelt-emojis-sdf-distill-sft
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio no oficial sobre Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Ficha en el catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Enlace al framework kiln (run `0929-const-0e3f3b`): no disponible en la informacion proporcionada
- Enlace al paper o blog tecnico de Qwen3.5: no disponible en la informacion proporcionada
