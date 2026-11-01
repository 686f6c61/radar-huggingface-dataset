# AI-KSK/minimax-h3-cn2-video-control-315

## Resumen

`AI-KSK/minimax-h3-cn2-video-control-315` es un repositorio de Hugging Face publicado por el usuario AI-KSK que no contiene pesos de modelo, sino un conjunto de cinco exportaciones de flujos de trabajo (workflow JSON) para ComfyUI orientadas a la generacion y edicion de video con la familia MiniMax H3. El repositorio empaqueta grafos de nodos que orquestan modelos de difusion de video, codificadores de texto, VAE de video y audio, y modulos ControlNet Union 2.0, con el objetivo de documentar rutas de control estructural, generacion con audio nativo, edicion local con segmentacion y conduccion por audio (audio-driven digital human).

El problema que aborda es la reproducibilidad de pipelines complejos de video generativo: en lugar de distribuir pesos, el autor distribuye la topologia de nodos y conexiones (457 registros de nodo en total, repartidos en cinco archivos) para que otros usuarios puedan reconstruir flujos de dos pasadas con refinamiento. Los grafos referencian artefactos externos como `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` (codificador de texto multimodal Qwen3-VL de 32B en NVFP4/AWQ), `minimax_h3_video_vae_fp16.safetensors`, `minimax_h3_audio_vae_fp32.safetensors` y `minimax_h3_latent_upscaler_3d_fp16.safetensors`, ademas de variantes podadas en int8 de los modelos base y del ControlNet.

La relevancia actual es acotada: el repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y fue creado el 1 de noviembre de 2026. No incluye pesos, medios de entrada ni artefactos VDN, y la propia model card advierte que no se ha verificado instalacion, rendimiento en GPU, velocidad, sincronizacion labial, preservacion de voz ni licencia. Se trata, por tanto, de material de referencia de topologia de grafos, no de un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene workflows JSON para ComfyUI, no pesos de modelo) |
| Parametros totales | No disponible (los grafos referencian un codificador Qwen3-VL de 32B y modelos MiniMax H3 de tamano no especificado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Referenciadas en los nombres de artefactos: NVFP4 + AWQ (codificador de texto), int8 con `convrot` (modelos podados), fp16 (VAE de video, upscaler 3D), fp32 (VAE de audio), bf16 (variante `fl_ref_hybrid_scheme_a`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No incluidos. Los workflows referencian archivos `.safetensors` externos y JSON de ComfyUI |

## Arquitectura y entrenamiento

El repositorio no documenta ninguna arquitectura de red neuronal propia ni proceso de entrenamiento. Lo que contiene son cinco grafos de ComfyUI que componen modelos de difusion de video de la familia MiniMax H3 con componentes auxiliares. Los nodos hacen referencia a un planificador de dos pasadas (mencionado como `OpenVDN/vdn-minimax-h3` y `stage_dmd_8nfe`), a un VAE de video en fp16, a un VAE de audio en fp32, a un upscaler latente 3D y a un ControlNet Union 2.0 podado en int8. La model card describe un muestreador "VDN de 12 pasos" y un esquema de refinamiento con `refinement plans store4`, pero advierte explicitamente que estas referencias describen intencion de dos pasadas y no recuentos de evaluacion medidos, ni un muestreador ordinario de doce pasos verificado, ni un nombre de archivo de LoRA destilada confirmado.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de decodificacion. Cualquier afirmacion sobre el entrenamiento del modelo subyacente MiniMax H3 queda fuera de la informacion proporcionada.

## Capacidades

- Orquestacion de generacion de video texto-a-video mediante grafos de ComfyUI con dos pasadas (baja resolucion y refinamiento con upscaler latente).
- Control estructural mediante ControlNet Union 2.0, con preprocesado de Scribble a 512 y alimentacion del puerto `control_video`.
- Edicion local de video (inpainting/repintado) asistida por segmentacion, con rutas de mascara y fuente en un grafo de tres clones.
- Generacion de audio nativo junto al video, con decodificacion separada de audio generado y recorte/guardado.
- Conduccion por audio (audio-driven digital human): inyeccion de latentes de voz codificados manualmente con mascara de ruido cero sobre el latente de video.
- Entrada de imagenes de referencia multiples (hasta dos referencias activas en el flujo 03) y de audio de referencia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.

## Casos de uso

- Reconstruccion de pipelines de video generativo: un equipo puede importar los JSON en ComfyUI para recuperar la topologia exacta de nodos y conexiones (por ejemplo, 120 nodos y 189 enlaces en el flujo 01) y adaptarla a su propia instalacion, ahorrando el diseno manual del grafo.
- Control estructural sobre video de entrada: el flujo 01 permite sustituir el video fuente y revisar el preprocesado Scribble para generar variaciones con la misma estructura, util en previsualizacion de storyboards.
- Edicion localizada de planos: el flujo 04, con enrutado de mascara de segmentacion y fuente, sirve para repintar regiones concretas de un clip sin regenerar el plano completo.
- Generacion de video con audio sincronizado en fase de prototipo: el flujo 03 combina imagenes de referencia activas con audio nativo generado y salida decodificada, adecuado para pruebas de concepto de clips cortos (10 segundos solicitados al planificador).
- Digital human con audio de entrada: el flujo 02 permite inyectar latentes vocales codificados a partir de audio subido y generar video con dos rutas de salida (LOW y HIGH), util para experimentar con avatares parlantes, asumiendo que la sincronizacion labial no esta verificada.
- Auditoria y formacion interna: los grafos documentan asignaciones de puertos y advertencias (por ejemplo, el nodo 208 con una conexion de altura LOW mapeada a `audio_mode`), lo que los hace utiles como material didactico sobre errores tipicos de cableado en ComfyUI.
- Base para pruebas de resolucion y escalado: las configuraciones de 960x544 con upscale aprendido x2 y las notas de 1088x1472 en vertical permiten comparar estrategias de resolucion antes de fijar un canvas de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no incluye verificacion de GPU, velocidad, sincronizacion labial ni preservacion de voz, y que las cifras de nodos y enlaces describen la topologia guardada, no mediciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los grafos referencian un codificador de texto Qwen3-VL de 32B en NVFP4/AWQ, un VAE de video fp16 y un VAE de audio fp32, pero no se proporciona ninguna medicion de memoria agregada.
- GPU recomendadas: no disponibles. La model card no incluye requisitos de GPU ni resultados de ejecucion.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer concreta.
- Opciones de despliegue: ComfyUI es el entorno implicito de los flujos (grafos de nodos con loaders, samplers, VAE decode y nodos de guardado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. La model card advierte que no se ha verificado velocidad ni rendimiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica modelos comparables de la misma categoria con datos verificables de parametros, contexto, rendimiento o licencia. El repositorio es un conjunto de workflows, no un modelo con pesos publicados, por lo que una comparativa directa con modelos de difusion de video requeriria datos que no se han facilitado.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo, medios de entrada ni artefactos VDN: solo JSON de workflows y portadas seleccionadas. No es ejecutable por si mismo.
- Las portadas seleccionadas no son resultados de inferencia verificados.
- No hay verificacion de instalacion, versiones exactas de nodos, GPU, velocidad, sincronizacion labial, preservacion de voz ni licencia.
- Los ajustes de reconciliacion y auditoria de audio son politicas solicitadas, no pruebas superadas.
- Riesgo de configuracion erronea documentado por el propio autor: en el flujo 01, el nodo 208 tiene una conexion de altura LOW mapeada a `audio_mode` y un cargador de imagen mapeado a un puerto de referencia de video; la rama duplicada esta mayoritariamente puenteada y no debe habilitarse a ciegas.
- En el flujo 02, las salidas de audio generado decodificadas no estan conectadas y el audio original seleccionado alimenta ambos recortes; esto no prueba paso directo bit-exacto, sincronizacion labial ni ajuste temporal correcto.
- En el flujo 03, la nota que describe un video de referencia cargado no coincide con las entradas activas guardadas; las notas de "aproximadamente 1080P" apuntan a 1920x1088, no a un recorte fijo de 1920x1080.
- La presencia de nodos de auditoria no equivale a una comprobacion superada de preservacion de audio.
- Riesgo de alucinacion y sesgos: no evaluables con la informacion disponible, al no tratarse de un modelo de lenguaje con pesos publicados.
- Restricciones de licencia para uso comercial: no disponibles; la licencia no aparece en la informacion y la model card no la verifica.
- Las imagenes del editor de puntos, cuando estan presentes, deben inspeccionarse por contenido y derechos antes de cualquier publicacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-cn2-video-control-315
- Workflow 01 (ControlNet Union 2.0, control de video y repintado local, VDN 12 pasos): `workflows/MiniMax H3｜ControlNet Union 2.0 视频控制与局部重绘｜VDN 12步高清版.json`
- Workflow 02 (generacion general de video, digital human por audio, VDN 12 pasos): `workflows/MiniMax H3｜通用视频生成·音频驱动数字人｜VDN 12步高清版.json`
- Workflow 03 (generacion general de video, VDN 12 pasos): `workflows/MiniMax H3｜通用视频生成｜VDN 12步高清版.json`
- Workflow 04 (ControlNet Union, repintado local dedicado): `workflows/MiniMax+H3｜ControlNet+Union++局部重绘专用工作流.json`
- Workflow 05 (ControlNet Union 2.0, control de video, repintado local y digital human por audio, VDN 12 pasos): `workflows/MiniMax+H3｜ControlNet+Union+2.0+视频控制与局部重绘·音频驱动数字人｜VDN+12步高清版.json`
- Referencia de planificador citada en la model card: `OpenVDN/vdn-minimax-h3` (sin URL verificada en la informacion disponible)
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
