# AI-KSK/minimax-h3-martial-taomate-305

## Resumen

`AI-KSK/minimax-h3-martial-taomate-305` es un repositorio de Hugging Face publicado por el usuario AI-KSK que no contiene pesos de un modelo en sentido estricto, sino dos flujos de trabajo (workflows) en formato JSON para ComfyUI, orientados a la generacion de video con los modelos MiniMax H3. El repositorio se creo el 1 de noviembre de 2026 y su tamano es de 0.0 GB, lo que confirma que no aloja checkpoints ni tensores, solo ficheros de configuracion de grafo y algunas imagenes de portada.

El primer workflow, denominado "H3 Martial-Arts Two-Pass", describe una generacion en dos pasadas con control de movimiento de artes marciales, usando un sampler con refinador de sigma, un LoRA de referencia a video (Ref2V) de ocho pasos, un LoRA de texto a video (FL2V) desactivado y varias capas de reparacion de movimiento y fisica espacial. El segundo, "TaoMate H3", agrupa siete ramas de ejemplo guardadas en un unico JSON con configuracion de tres pasos y distintos LoRAs de estilo wushu.

La relevancia de este repositorio es limitada y de caracter practico: sirve como referencia de configuracion reproducible para quien ya dispone de los modelos base MiniMax H3 y quiera replicar los ajustes de muestreo, strengths de LoRA y conexiones de nodos. No aporta un modelo nuevo, no publica benchmarks y no documenta resultados de ejecucion reales; la propia model card advierte repetidamente que las descripciones son estaticas y que no se ha realizado ninguna ejecucion ni validacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene workflows JSON para ComfyUI, no pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los workflows referencian pesos en fp32, fp16, bf16 e int8 de terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio aloja ficheros JSON de workflow y portadas en webp/jpg) |

## Arquitectura y entrenamiento

El repositorio no define ni entrena ningun modelo. Los workflows hacen referencia a una pila de modelos externos de MiniMax H3 y componentes auxiliares, entre ellos `minimax_h3_audio_vae_fp32.safetensors`, `minimax_h3_video_vae_fp16.safetensors`, `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` (codificador de texto/vision basado en Qwen3-VL de 32B en int8), `minimax_h3_ref2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors` (LoRA turbo de ocho pasos para referencia a video), `wushu_e3_fl2va_1000step_fullint8_bf16te.safetensors`, `minimax_h3_hybrid_fl2va_ref2va_b25-49-bf16-v1.01.safetensors`, `Motion_Repair.safetensors`, `wushu_spatial_physics_clean_2500.safetensors` y `minimax_h3_latent_upscaler_3d_bf16.safetensors`.

El primer workflow combina un refinador de sigma (`H3SigmaRefiner`) con `extra_steps 1`, `start_at_sigma 0.6`, `end_at_sigma 0` y espaciado coseno, aplicando el LoRA Ref2V de ocho pasos y encadenando varias capas de LoRA con strengths concretos: Motion Repair a 0.2, fisica espacial a 0.3, wushu-e3 a 0.75 y un segundo Motion Repair a 0.5. La model card insiste en que la etiqueta "ocho pasos" del nombre de fichero no implica una ejecucion real de ocho pasos y que no debe inferirse el NFE total sin validacion en tiempo de ejecucion. El segundo workflow configura siete ramas con scheduler Euler, tres pasos y `denoise 1`, con strengths de LoRA que van desde TaoMate 1.0 hasta Bunny 0.1 segun la rama.

## Capacidades

- Generacion de video condicionada por imagen de referencia (Ref2V) y por texto (FL2V) mediante los modelos base MiniMax H3 referenciados.
- Control de movimiento de artes marciales mediante LoRAs especificos (`wushu_e3`, `wushu_spatial_physics`, `Motion_Repair`).
- Generacion de audio asociada al video, con decodificacion de audio muestreado por el VAE de audio y salida a traves de nodos VHS.
- Upscaling latente 3D aprendido (`minimax_h3_latent_upscaler_3d_bf16`) en modo megapixeles con objetivo de 1 MP.
- Configuracion de relaciones de aspecto multiples (4:3, 9:16, 16:9, 3:4) con resolucion almacenada de 1.4 MP y multiplo de 32.
- Flujos de dos pasadas con reutilizacion de guia y esquema de sigma transformado para la segunda etapa.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; el repositorio no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de configuraciones de video marcial: el workflow JSON permite reconstruir la pila exacta de LoRAs y strengths (wushu 0.75, fisica espacial 0.3, Motion Repair 0.2 y 0.5) para obtener resultados consistentes en ComfyUI con los modelos base MiniMax H3.
- Prototipado de pipelines Ref2V en dos pasadas: la estructura de sampler con refinador de sigma y segunda pasada con upscaling latente sirve como plantilla para experimentar con generacion de video de mayor resolucion a partir de una imagen de referencia.
- Evaluacion de LoRAs de estilo wushu: las siete ramas del workflow TaoMate permiten comparar selecciones de LoRA (TaoMate, wushu base, wushu-action, Combat, camera-motion, Bunny) manteniendo el resto de la configuracion fija.
- Generacion de video con audio sincronizado en produccion de contenido corto: los nodos VHS configuran salida a 24 fps, H.264 y CRF 19, adecuada para clips de aproximadamente 10 segundos (243 fotogramas solicitados) destinados a redes sociales.
- Base para auditoria de grafos ComfyUI: la model card detalla estados de nodos activos y desactivados, rutas Set/Get y puertos sin conectar, lo que facilita revisar y depurar workflows heredados de terceros.
- Experimentacion con decodificacion de audio en dos etapas: el flujo separa el primer `DENOISED_OUTPUT` en video y audio, llevando el audio al segundo latente, lo que permite estudiar el comportamiento del audio tras el resampling en la segunda pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realizo ninguna ejecucion, medicion de latencia, NFE real ni validacion visual o de lip-sync.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los workflows referencian un codificador de texto Qwen3-VL de 32B en int8, un VAE de video en fp16, un VAE de audio en fp32 y un upscaler latente 3D en bf16, lo que en conjunto implica requisitos elevados, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en ninguna GPU consumer.
- Opciones de despliegue: ComfyUI con frontend compatible con la expansion de rutas virtuales Set/Get; los workflows dependen de nodos VHS (Video Helper Suite) y de los modelos base MiniMax H3.
- Latencia y throughput: no disponibles. La model card advierte que las etiquetas de "tres pasos" u "ocho pasos" son ajustes guardados y no evidencia de NFE ni de tiempo de ejecucion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/minimax-h3-martial-taomate-305 | Repositorio de workflows JSON para ComfyUI | no aplica | no aplica | no disponible | Hugging Face, 0 descargas |
| MiniMax H3 (modelo base referenciado) | Modelo generativo de video | no disponible | no disponible | no disponible | Referenciado en los workflows, no incluido en el repo |
| Alternativas de workflow ComfyUI para video | Repositorios de configuracion | no aplica | no aplica | variable | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con otros repositorios de workflows o con los modelos base de MiniMax H3.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; requiere descargar por separado todos los checkpoints y LoRAs referenciados (VAEs, codificador Qwen3-VL 32B, LoRAs wushu, Motion Repair, upscaler latente) para poder ejecutar los workflows.
- La model card advierte que las descripciones son estaticas y que no se ha ejecutado ningun workflow ni validado ningun resultado; no hay evidencia de que las configuraciones produzcan video correcto.
- La rama E del workflow TaoMate tiene el nucleo de generacion y decodificacion desactivado mientras mantiene LoRAs, imagen y `SaveVideo237` activos; encolarla sin revisar puede no producir salida valida.
- La rama D tiene el cargador de imagen de primer fotograma desactivado, por lo que no debe asumirse que sea una generacion imagen-a-video funcional.
- Los puertos `drive_audio` y `final_audio` estan sin conectar en todas las ramas; solo la rama G carga audio, a traves de un puerto de audio de referencia, y no se garantiza la conservacion de voz, contenido o sincronizacion labial.
- Las etiquetas de pasos en nombres de fichero (8step, 3步, 1000step, 2500) no son contadores de inferencia reales y no deben interpretarse como NFE.
- La duracion nominal de 10 segundos (243 fotogramas a 24 fps) es aritmetica, no una longitud de fichero medida, y no se garantiza salida a 1080p.
- Licencia no disponible: no puede confirmarse el uso comercial de los workflows ni de los assets referenciados.
- Riesgo de sesgos y alucinacion: no evaluable, al no tratarse de un modelo de lenguaje ni incluir evaluaciones de calidad.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento multilingue de los prompts.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/minimax-h3-martial-taomate-305
- Workflow JSON "H3 Martial-Arts Two-Pass": `workflows/MiniMax+H3｜8步武术动作控制.json` (referenciado en el repositorio)
- Workflow JSON "TaoMate H3": `workflows/MiniMax+H3｜TaoMate+3步加速+lora.json` (referenciado en el repositorio)
- Portada seleccionada del primer workflow: `covers/bdef55c6f9c0a94ba813f866311b5658.webp`
- Portada seleccionada del segundo workflow: `covers/31d135602f67d91d925bc1540d118e80.jpg`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
