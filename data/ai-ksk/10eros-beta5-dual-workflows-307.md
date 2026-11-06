# AI-KSK/10eros-beta5-dual-workflows-307

## Resumen

10Eros Beta5 es un paquete de flujos de trabajo (workflows) en formato JSON publicado en Hugging Face por el usuario AI-KSK, no un modelo de pesos en el sentido habitual. El repositorio contiene dos rutas independientes de refinamiento construidas sobre el modelo Minimax H3: una orientada a la mejora de vídeo y audio nativo en dos pasadas (FL2VA/Ref2VA) y otra centrada en la condicion de audio de origen para la generacion de un avatar digital (SelfLift). No se trata de presets intercambiables: el autor insiste en que la eleccion de ruta de audio y muestreo debe ser deliberada.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no expone pipeline, licencia ni idiomas en sus metadatos. La model card describe con detalle los nodos, LoRAs y parametros de muestreo de cada flujo, pero no incluye pesos del modelo base ni medios de entrada. Los flujos se presentan como borradores locales pendientes de revision humana.

La relevancia de esta ficha es limitada para quien busque un modelo de lenguaje o multimodal convencional: se trata de material de configuracion para un pipeline de generacion de video con audio (Minimax H3), con advertencias explicitas del autor sobre enlaces obsoletos, ausencia de verificacion de resultados y falta de licencia comercial global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows JSON, no pesos de un modelo propio; los flujos hacen referencia a Minimax H3 y a un VLM Qwen3-VL 32B como componentes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | los flujos referencian artefactos int8, nvfp4/awq, fp16 y fp32 (p. ej. `10Eros_Max_h3_TURBO-hybrid_beta5_int8_SinoX.safetensors`, `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`, `minimax_h3_video_vae_fp16.safetensors`, `minimax_h3_audio_vae_fp32.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que no existe licencia comercial global y que deben verificarse por separado los derechos de workflows, nodos, modelos, LoRAs, imagenes, sonido y portadas) |
| Formato de pesos | no aplica al repositorio (contiene JSON de workflows y PNG de portada); los pesos referenciados son `.safetensors` |

## Arquitectura y entrenamiento

El repositorio no entrena ni distribuye un modelo. Lo que publica son dos grafos de nodos en JSON para un motor de inferencia por nodos (el formato y los nombres de nodo —VHS, ResolutionSelector, TrimAudioDuration, SelfLift, DENOISED_OUTPUT— corresponden a un entorno tipo ComfyUI). El modelo base implicito es Minimax H3, con VAE de video en fp16, VAE de audio en fp32, un upscaler latente 3D aprendido y LoRAs auxiliares (Combat, aesthetic, FrameRush, Motion Repair, LMS, Turbo). Tambien aparece un componente Qwen3-VL de 32B en variantes int8 y nvfp4/awq, presumiblemente como codificador de texto/condicionamiento.

El flujo 01 (refinamiento nativo AV en dos pasadas) activa tres cargadores de imagen de referencia y desactiva las rutas de primer/ultimo fotograma, video fuente y audio fuente. Las dimensiones gruesas se derivan de 4:3, 1 MP y multiplo de 32, y el upscaler latente aprendido con `scale_by 1.5` aporta las dimensiones refinadas. El control de duracion de 10 da aritmeticamente 243 fotogramas solicitados; el autor aclara que 243/24 = 10,125 s es un calculo nominal y no una duracion medida. Se desactivan Turbo y ExposureSlider; las selecciones activas son Combat 0.7, aesthetic 0.5, FrameRush 0.5 y Motion Repair 0.7 en la pasada gruesa, y Combat 0.49, aesthetic 0.5, FrameRush 0.5, Motion Repair 0.2 y LMS 0.3 en el refinamiento. Los controles de plan de paridad 9/4/5 conectan los schedules grueso y fino. La salida principal decodifica video refinado y audio generado con VHS a 24 fps, H.265, yuv420p10le y CRF22.

El flujo 02 (SelfLift, condicionamiento por audio de origen) conecta dos imagenes con roles de personaje y entorno/composicion, y usa ResolutionSelector a 3:4, 1.5 MP y multiplo de 32. TrimAudioDuration almacena `start_index 14.63` y `duration 20.46` (no un par inicio/fin). El audio recortado se codifica con el VAE, recibe una mascara de ruido cero y se concatena con la parte de video de la plantilla de referencia antes del muestreo. La formula de fotogramas alinea a 17n+5 y suma 24; el autor da ejemplos ilustrativos (entradas 5/10/20 producen 148/267/505) y advierte que no son salidas observadas. El LoRA de cuatro pasos esta desactivado; el muestreo usa Euler con CFG 1, transicion 3, `lowres_scale 0.5`, `rho 0`, `w_min 0.5`, `w_max 1` y el upscaler latente 3D aprendido. La condicion negativa es ZeroOut. La salida decodifica solo video; VHS recibe el audio de origen recortado directamente y guarda 24 fps, H.264 y CRF12 con `trim_to_audio=false`.

## Capacidades

- Generacion de video con audio nativo a partir de imagenes de referencia, mediante el modelo base Minimax H3 referenciado en los flujos.
- Refinamiento en dos pasadas con upscaling latente aprendido (`scale_by 1.5`) y reconciliacion entre pasadas.
- Condicionamiento por audio de origen para generacion de avatar digital parlante (flujo SelfLift).
- Carga de multiples imagenes de referencia con asignacion de roles (personaje, entorno, composicion).
- Recorte de audio por indice y duracion y su concatenacion con la plantilla de referencia antes del muestreo.
- Control de resolucion mediante nodos dedicados (relacion de aspecto, megapixeles, multiplo de 32).
- Salida de video con ajustes de codec y formato configurables (H.265/yuv420p10le/CRF22 en el flujo 01; H.264/CRF12 en el flujo 02).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.

## Casos de uso

- Refinamiento de video generado con Minimax H3: el flujo 01 aplica una segunda pasada con upscaler latente y LoRAs de detalle (Combat, aesthetic, FrameRush, Motion Repair) para aumentar nitidez y fotorealismo sobre un primer muestreo grueso.
- Generacion de avatares digitales parlantes: el flujo 02 toma dos imagenes (personaje y entorno) y un audio de origen recortado, y produce video con el audio original como pista de salida, adecuado para presentaciones o contenido de creador.
- Iteracion de pipelines de video generativo en local: los JSON sirven como plantilla reproducible de nodos, schedules y pesos de LoRA para experimentar con distintas combinaciones sin partir de cero.
- Evaluacion comparativa de LoRAs: los valores documentados (Combat 0.7/0.49, Motion Repair 0.7/0.2, LMS 0.3) permiten reproducir y contrastar el efecto de cada LoRA en las dos pasadas.
- Prototipado de contenido para redes: la referencia a LoRAs esteticos orientados a TikTok/Instagram sugiere su uso en la generacion de clips verticales (3:4 en el flujo 02) para pruebas de formato.
- Base para integracion en entornos de nodos gestionados: el autor enlaza puntos de entrada en RunningHub (internacional y China) y Civitai, lo que permite ejecutar los flujos sin montar la infraestructura local.
- Estudio de formulas de duracion y alineacion de fotogramas: los calculos documentados (243 fotogramas, 17n+5+24) sirven como referencia para validar la sincronizacion audio-video en implementaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realiza ninguna afirmacion de NFE, velocidad o memoria, y que las portadas seleccionadas no son resultados generados verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los flujos referencian un VLM Qwen3-VL de 32B en variantes int8 y nvfp4/awq, ademas de VAEs de video fp16 y audio fp32, un upscaler latente 3D fp16 y varios LoRAs; el consumo agregado no se documenta.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el autor no aporta datos de memoria ni de velocidad.
- Opciones de despliegue: el formato de nodos y los nombres de nodo (VHS, ResolutionSelector, TrimAudioDuration, SelfLift) corresponden a un entorno tipo ComfyUI; el autor ofrece puntos de entrada gestionados en RunningHub (internacional y China) y Civitai.
- Latencia y throughput: no disponible; el autor declina explicitamente cualquier afirmacion al respecto.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con parametros y contexto comparables, sino un conjunto de workflows sobre Minimax H3; no se dispone de datos de rendimiento ni de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene unicamente workflows JSON y portadas PNG; no incluye pesos de modelo ni medios de entrada externos.
- El autor advierte de siete referencias de salida obsoletas en el lado del productor (cuatro en el flujo 01, tres en el flujo 02) que deben revisarse al importar; no se reparan de forma silenciosa.
- No se incluye nueva inferencia, revision visual o de audio, medicion de tiempos ni aceptacion de licencia; las portadas no son resultados generados verificados.
- No existe licencia comercial global: deben verificarse por separado los derechos de workflows, nodos, modelos, LoRAs, imagenes, sonido y portadas.
- Las etiquetas de LoRA (desengrase, restauracion facial, preservacion de identidad) no prueban dichos efectos; no hay ruta dedicada de recorte y costura de rostro.
- La duracion de 243/24 = 10,125 s es un calculo aritmetico nominal, no una duracion medida.
- En el flujo 02 no se garantiza audio bit-perfect, sincronizacion labial correcta ni igual duracion de pistas; no hay nodo explicito de recorte posterior a la decodificacion.
- Los valores de trim de audio (`start_index 14.63`, `duration 20.46`) deben comprobarse en unidades y contra los medios disponibles en la implementacion concreta.
- Los ejemplos de la formula de fotogramas (148/267/505) son ilustrativos y no salidas observadas.
- El tutorial enlazado por el autor no ha sido verificado en vivo.
- Riesgo de alucinacion y sesgos: no disponible (no es un modelo de generacion de texto).

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/10eros-beta5-dual-workflows-307
- Tutorial indicado por el autor (no verificado en vivo): https://www.youtube.com/watch?v=KjHrHot5un8
- RunningHub internacional (flujo 01): https://www.runninghub.ai/post/2101698407000969217?inviteCode=rh-v1111
- RunningHub China (flujo 01): https://www.runninghub.cn/post/210160588190
