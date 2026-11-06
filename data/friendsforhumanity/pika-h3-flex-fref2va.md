# FriendsforHumanity/Pika-H3-Flex-FRef2VA

## Resumen

Pika-H3-Flex-FRef2VA es un conjunto de bloques de codigo (no un modelo con pesos nuevos) publicado por Friends for Humanity para el pipeline de diffusers de Pika H3 Flex, el modelo de generacion de video de Pika Labs construido sobre MiniMax H3. Su funcion es unificar en una sola peticion las dos capacidades que Pika distribuye por separado: el anclaje de primer y ultimo fotograma (FL2VA) y las referencias multimodales de imagen, video y voz (Ref2VA). El resultado es la posibilidad de encadenar clips donde cada uno empieza exactamente donde termino el anterior y mantiene la identidad de los personajes y sus voces.

El problema que resuelve es practico: con FL2VA aislado, el reparto de personajes deriva entre clips; con Ref2VA aislado, los clips no empalman. Este repositorio construye una secuencia unica que combina el layout de Ref2VA de Pika con bloques de fotograma fijado en las mismas posiciones que usa ComfyUI, sin fusionar pesos ni reentrenar nada. La relevancia actual esta en que habilita narrativa de video larga (el autor cita una historia de 54 clips y 13,5 minutos) con coherencia visual y sonora.

El repositorio se distribuye bajo Apache-2.0, pero el codigo descarga y requiere MiniMax H3 y los adaptadores Pika H3 Flex, sujetos a la MiniMax H3 Community License Agreement. No se publican especificaciones de parametros, contexto ni idiomas del modelo subyacente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (bloques modulares de diffusers sobre el pipeline de MiniMax H3 / Pika H3 Flex) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un LoRA en bf16: `pika_h3_flex_ref2va_comfy_bf16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el codigo; los pesos de MiniMax H3 y los adaptadores Pika H3 Flex bajo MiniMax H3 Community License Agreement |
| Formato de pesos | no disponible (repositorio de codigo; checkpoint Ref2VA de H3 y LoRA para ComfyUI) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una capa de orquestacion sobre el pipeline de difusion de video de Pika H3 Flex. El autor no fusiona ni reentrena pesos: H3 lee texto, referencias, fotogramas fijados y el clip en generacion como una unica secuencia. Un fotograma fijado se representa como un bloque limpio colocado en la posicion 0 o en la ultima posicion y se mantiene fijo durante el muestreo. El modelo Ref2VA ya respeta fotogramas fijados situados junto a sus referencias (ComfyUI lo hace con `MiniMaxH3AddGuide` junto a `MiniMaxH3ReferenceToVideo`), y estos bloques reproducen esa misma secuencia en diffusers.

La composicion de la secuencia es la siguiente: texto, referencias, audio y video objetivo provienen del layout Ref2VA original de Pika sin cambios; los fotogramas primero y/o ultimo fijados se anaden junto a las referencias en las mismas posiciones que usa ComfyUI. El repositorio incluye `tests/test_cpu.py`, que verifica en CPU y sin pesos que sin fotogramas fijados la secuencia coincide con la de Pika y con ellos coincide con la de ComfyUI. No hay datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de RLHF o DPO, porque no existe entrenamiento asociado.

## Capacidades

- Generacion de video a partir de texto con referencias de imagen, video y voz (Ref2VA).
- Anclaje de primer fotograma, ultimo fotograma o ambos en una misma peticion (FL2VA combinado con Ref2VA).
- Encadenamiento de clips: cada clip puede arrancar en el ultimo fotograma del anterior mediante `--chain N`.
- Mantenimiento de identidad de personajes (caras) y de voces a lo largo de una secuencia de clips.
- Integracion con ComfyUI mediante nodos estandar (`UNETLoader`, `MiniMaxH3ReferenceToVideo`, `MiniMaxH3AddGuide`, `LoraLoaderModelOnly`).
- Integracion con diffusers mediante `ModularPipelineBlocks.from_pretrained` y parametros `image=`, `last_image=` y `references=`.
- Muestreo con sampler `lcm`, `BasicGuider` con CFG 1.0 y `ManualSigmas` de 6 pasos.
- Exportacion del clip y de su ultimo fotograma, listo para fijarse como primer fotograma del siguiente.
- No se documentan capacidades de tool calling, agentes, razonamiento textual ni matematicas; el modelo es de generacion de video.

## Casos de uso

- Narrativa de video larga por encadenamiento: usando `--chain` o los workflows de ComfyUI, cada clip arranca en el ultimo fotograma del anterior; el autor valido una historia de 54 clips y 13,5 minutos sin quemado, suavizado ni oscurecimiento, con cada clip dentro de 2,4/255 de su fotograma fijado.
- Series con personajes recurrentes: al combinar referencias de imagen de personaje con fotogramas fijados, se mantiene la identidad facial y la voz entre clips, lo que sirve para episodios o cortos con el mismo reparto.
- Animacion de transiciones controladas: fijando primer y ultimo fotograma se define el estado inicial y final de una toma, util para inserts, transiciones o animaciones de producto donde el encuadre final esta predeterminado.
- Doblaje y locucion con referencia de voz: la referencia de voz (hasta 15 s en total, limite de Pika) permite generar clips con una voz consistente para narraciones o dialogos.
- Prototipado de storyboards animados: a partir de un guion y referencias de personaje y localizacion, se generan clips de 15 s a 480p o 768p para previsualizar una secuencia antes de produccion.
- Integracion en pipelines de ComfyUI para produccion: los tres workflows incluidos (primero, ultimo, primero y ultimo, cada uno con dos referencias de imagen y una voz) permiten automatizar la generacion por lotes en una granja de GPU; el autor reporta unos 81 s por clip en ComfyUI con todo en GPU.
- Generacion por lotes en servidor con diffusers: con CPU offload se reportan unos 140 s por clip de 15 s a 480p en una B200, adecuado para procesos asincronos de renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos son mediciones de fidelidad y velocidad del autor:

| Metrica | Valor |
|---|---|
| Diferencia media absoluta respecto al fotograma fijado (primer, ultimo o ambos) | 2-4/255 |
| Desviacion maxima en la historia de 54 clips (ComfyUI) | 2,4/255 |
| Tiempo por clip de 15 s a 480p en diffusers (CPU offload, B200) | ~140 s |
| Tiempo por clip de 15 s a 480p en ComfyUI (todo en GPU, B200) | ~81 s |
| Resoluciones probadas | 480p y 768p |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor solo reporta ejecucion en una NVIDIA B200 y en ComfyUI con todo el modelo en GPU.
- GPU recomendadas: NVIDIA B200 segun las pruebas del autor; no se documentan otras GPU.
- Cabe en GPU de consumo: no disponible; no se aportan datos para RTX 4090 u otras consumer.
- Opciones de despliegue: diffusers (con CPU offload) y ComfyUI con nodos estandar.
- Dependencias fijadas: diffusers en el commit `d0b9b1b5` y `Pika-Labs/Pika-H3-Flex` en la revision `3ff16644`; antes de actualizar cualquiera de las dos hay que ejecutar `python tests/test_cpu.py`.
- Latencia y throughput: aproximadamente 140 s por clip de 15 s a 480p en diffusers con CPU offload y 81 s en ComfyUI con todo en GPU, medidos en una B200.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni benchmarks del modelo subyacente en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Cualitativamente:

| Alternativa | Relacion | Diferencias documentadas |
|---|---|---|
| Pika H3 Flex FL2VA (adaptador de Pika) | Misma base, capacidad parcial | Solo fija primer/ultimo fotograma; sin referencias el reparto deriva entre clips |
| Pika H3 Flex Ref2VA (adaptador de Pika) | Misma base, capacidad parcial | Solo usa referencias de imagen, video y voz; los clips no empalman entre si |
| Este repositorio (FRef2VA) | Combinacion de ambos | Anade fotogramas fijados junto a las referencias en una sola peticion; sin pesos nuevos |

## Limitaciones y advertencias

- Las caras procedentes de referencias pequenas o con mucha gente pueden derivar en primeros planos.
- El movimiento y el sonido se reinician en cada union entre clips; no hay continuidad de movimiento a traves del corte.
- Los cambios grandes entre el primer y el ultimo fotograma estan sin probar.
- Solo se han probado las resoluciones 480p y 768p.
- Las referencias de voz estan limitadas a 15 s en total (limite de Pika).
- El codigo depende de versiones fijadas de diffusers y de Pika H3 Flex; actualizar sin ejecutar `tests/test_cpu.py` puede romper la compatibilidad.
- La licencia Apache-2.0 cubre solo el codigo de este repositorio; los pesos de MiniMax H3 y los adaptadores Pika H3 Flex estan sujetos a la MiniMax H3 Community License Agreement, su politica de uso aceptable y su ambito territorial, que hay que revisar antes de ejecutarlos y antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica del modelo subyacente; no disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FriendsforHumanity/Pika-H3-Flex-FRef2VA
- Modelo base Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Aplicacion Daydream World (origen de la historia de 54 clips): https://daydreamapp.ai
