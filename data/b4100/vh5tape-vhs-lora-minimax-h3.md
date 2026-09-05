# B4100/vh5tape-vhs-lora-minimax-h3

## Resumen

vh5tape es un adaptador LoRA de estilo para el modelo de generación de vídeo MiniMax-H3, desarrollado por B4100. Su función es transformar la salida del modelo base para que los vídeos generados parezcan grabaciones de televisión de los años 80 capturadas en una cinta VHS desgastada, con desenfoque suave, sangrado de croma, ruido de seguimiento y bandas de conmutación en los bordes del fotograma. Además, dado que MiniMax-H3 entrena audio conjuntamente, el LoRA también modifica la pista de sonido para reproducir el característico sonido monofónico apagado, silbido de cinta y trémolo.

El modelo se presenta como un archivo de pesos safetensors de 0,3 GB que se carga sobre el checkpoint base MiniMax-H3, y ofrece un control de intensidad del efecto mediante el prompt, con tres niveles entrenados: daño ligero, medio y pesado. Está pensado para su uso en aplicaciones de generación de vídeo a partir de texto o imagen, mediante integraciones como ComfyUI o la API de fal, y requiere un checkpoint base no podado ni rotado (BF16 o FP8 escalado) para obtener resultados correctos. Su relevancia radica en la posibilidad de añadir una estética retro convincente sin necesidad de posproducción externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre MiniMax-H3 |
| Parametros totales | no disponible (repo de 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (recomendado base BF16 o FP8 escalado) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

vh5tape es un LoRA de estilo entrenado sobre el modelo MiniMax-H3, un modelo de generación de vídeo que produce tanto imagen como audio. El adaptador no modifica la arquitectura base, sino que inyecta pesos adicionales para inducir una estética analógica de VHS en la salida. El README indica que el efecto se controla mediante el prompt a través de frases concretas que activan el nivel de daño deseado (light, medium o heavy), y que el LoRA fue entrenado usando el formato de expansión de prompt de H3, por lo que se recomienda mantener el modo `balanced` para preservar el trigger y las frases de daño.

No se proporcionan detalles sobre el número de tokens, la composición del dataset de entrenamiento ni la técnica exacta utilizada (RLHF, DPO, etc.). La información disponible se limita a las instrucciones de uso, la integración en ComfyUI y las recomendaciones sobre el checkpoint base. La innovación técnica destacable es que el LoRA afecta tanto al dominio visual como al auditivo, aprovechando la capacidad de MiniMax-H3 de generar audio de forma conjunta, y que el nivel de daño se puede ajustar mediante la escala del adaptador (0,7 a 1,2) además de con el prompt.

## Capacidades

- Generacion de videos con estetica retro VHS de los anos 80, incluyendo artefactos visuales como ruido de seguimiento, sangrado de croma y desenfoque.
- Control de intensidad del efecto mediante prompt con tres niveles: `lightly worn VHS tape with slight analog noise` (ligero), `worn VHS tape recording with visible tape damage` (medio) y `badly damaged VHS tape with heavy tracking errors and distortion` (pesado).
- Modificacion de la pista de audio para que suene como una grabacion monofonica apagada, con silbido de cinta y trémolo, si se describe en el prompt.
- Soporte de dialogo casi literal si se incluyen lineas explicitas entre comillas en el prompt.
- Compatible con los endpoints LoRA de MiniMax-H3 y H3-Max para generacion de texto a video e imagen a video.
- Integracion directa en ComfyUI sin conversion, gracias a su layout de claves nativo (`diffusion_model.blocks.N.attn.{qkv_proj,out_proj}`).
- Apilamiento con otros LoRA turbo, aunque en ese caso se recomienda reducir la escala a 0,4-0,6 para evitar artefactos.
- Funciona con resoluciones de 480P y 4:3 como ajuste optimo, y tambien con resoluciones superiores si se desea mantener la estetica.

## Casos de uso

- Produccion de videos musicales retro: el LoRA permite generar clips con estetica de cinta VHS desgastada para canciones con sonido analogico o de los anos 80. Basta con incluir el trigger `vh5tape` y el nivel de dano deseado, describiendo la escena y la musica, para obtener un video con el aspecto buscado sin postproduccion.
- Publicidad nostalgica para marcas: se pueden crear anuncios de productos como coches usados, juguetes o electrodomesticos con el estilo de la television local de los anos 80. El modelo reproduce anuncios con locutores, jingles de sintetizador y estetica de estudio de la epoca, ideal para campanas que apelan a la nostalgia.
- Cine de terror y found footage: el nivel de dano pesado, con escala superior a 1,0, permite generar material con aspecto de cinta casi ilegible, con errores de seguimiento y distorsion, util para escenas de terror o videos encontrados. La integracion en ComfyUI facilita la produccion de tomas rapidas.
- Contenido para redes sociales: videos cortos con estetica retro para plataformas como TikTok o Instagram. El LoRA permite generar clips de 15 segundos a 480P/4:3, con el aspecto VHS deseado, directamente desde texto o imagen, reduciendo el tiempo de edicion.
- Prototipado de cine independiente: los cineastas pueden previsualizar el look vintage de un proyecto antes de la posproduccion. Usando el LoRA sobre MiniMax-H3, se pueden generar tomas de prueba con el tratamiento visual y de audio deseado para validar la direccion artistica.
- Automatizacion de contenido en pipelines de generacion de video: mediante la API de fal o ComfyUI, el LoRA se puede integrar en flujos de trabajo que generan videos con estetica VHS de forma recurrente, por ejemplo para una serie de videos tematicos. El control por prompt permite variar el nivel de dano sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si pesa 0,3 GB y se carga como LoRA, por lo que la VRAM adicional requerida es minima.
- Para su uso es necesario ejecutar el modelo base MiniMax-H3, cuyos requisitos de VRAM no estan especificados en la informacion disponible.
- Se recomienda usar un checkpoint base no podado ni rotado, como `minimax_h3_fl2va_bf16.safetensors` o `minimax_h3_fl2va_pruned_fp8_scaled.safetensors`, ya que las variantes `*_int8_convrot`, `nvfp4` y `w4a8` producen resultados deformados.
- Es compatible con ComfyUI, carga directa de safetensors y con los endpoints LoRA de fal (`minimax/h3/text-to-video/lora` y `minimax/h3-max/text-to-video/lora`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- No usar checkpoints base rotados o cuantizados en `*_int8_convrot`, `nvfp4` o `w4a8`, ya que el LoRA se carga sin error pero produce rostros deformados, objetos que se derriten o desaparecen.
- La escala del LoRA debe ajustarse cuidadosamente (0,7 a 1,2) para evitar artefactos. Valores superiores a 1,5 pueden producir resultados demasiado degradados.
- Al apilar con un LoRA turbo, se recomienda reducir la escala a 0,4-0,6, ya que las perturbaciones se suman y el turbo de 4 pasos tiene poco margen.
- El efecto es intencionadamente de baja calidad visual, por lo que no es adecuado para contenidos que requieran alta fidelidad de imagen.
- La licencia `minimax-h3-community-license` es de tipo "other" y puede imponer restricciones de uso comercial. Es necesario consultar los terminos completos antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos del modelo, riesgos de alucinacion o limitaciones de idioma.

## Enlaces

- https://huggingface.co/B4100/vh5tape-vhs-lora-minimax-h3
- https://huggingface.co/spaces/akhaliq/vh5tape-vhs-lora-minimax-h3
- https://huggingface.co/KennethFal/vh5tape-vhs-lora-minimax-h3
- https://huggingface.co/MiniMaxAI/MiniMax-H3
