# BennyDaBall/Hy-Nomas-x-LTX-2.5-Audio-Workflows

## Resumen

Este repositorio no contiene un modelo de IA en sentido estricto, sino dos flujos de trabajo (workflows) para ComfyUI que combinan dos sistemas generativos distintos: Hy-Nomas, un modelo de mundo de vídeo de 8B desarrollado por Tencent Hunyuan, y LTX-2.5, un modelo conjunto de audio y vídeo de Lightricks. El objetivo es dotar de banda sonora a los vídeos generados por Hy-Nomas, que por si mismo no produce audio, sin necesidad de entrenar ningun modelo nuevo.

La tecnica empleada consiste en congelar los fotogramas generados por Hy-Nomas dentro del espacio latente del VAE de vídeo de LTX-2.5 y dejar que el modelo genere unicamente la pista de audio, de forma que el sonido atiende al vídeo congelado y sincroniza con la accion de la imagen (cascos de caballo durante el galope, rugido del quemador cuando aparece la llama). El autor publica dos workflows: uno para anadir audio a cualquier clip existente y otro para generar un mundo de dos segmentos con su banda sonora en una sola ejecucion.

El interes del repositorio es practico: demuestra una tecnica de composicion entre modelos (world model + modelo audio-video) usando exclusivamente nodos estandar de ComfyUI, con requisitos de hardware documentados (RTX 5090 de 32 GB, aproximadamente 31 GiB de VRAM y 62 GB de RAM del sistema en el flujo completo) y sin publicar pesos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio: son workflows de ComfyUI (JSON) que orquestan Hy-Nomas (DiT de vídeo, 8B) y LTX-2.5 (transformer de 22B, audio-vídeo conjunto) |
| Parametros totales | No disponible como modelo unico; modelos implicados: Hy-Nomas 8B y LTX-2.5 22B (distilled) |
| Parametros activos | No disponible (no se describe arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los workflows usan pesos int8 (LTX-2.5 transformer y text encoder int8-convrot), int8 para el DiT de Hy-Nomas y fp8 para el VAE PixelUMM y el text encoder Qwen 2.5 VL 7B |
| Idiomas soportados | No disponible (los prompts de ejemplo estan en ingles) |
| Licencia | Workflows: MIT. Modelos: LTX-2.5 bajo LTX-2.x Community License, DiT de Hy-Nomas bajo Apache-2.0, decodificador PixelUMM bajo licencia NVIDIA One-Way Noncommercial (solo investigacion y evaluacion) |
| Formato de pesos | El repositorio no incluye pesos; los workflows referencian safetensors (int8-convrot, bf16, fp8) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Su aportacion es un pipeline de inferencia en ComfyUI que encadena dos sistemas. Hy-Nomas es un modelo de mundo de vídeo de 8B de Tencent Hunyuan que genera un mundo por segmentos y permite extenderlo o recorrerlo con controles WASD, pero sin audio. LTX-2.5 es un modelo conjunto de audio y vídeo de Lightricks, en variante distilled de 22B, con VAE de vídeo y VAE de audio separados y un text encoder Gemma4-12B con proyeccion.

El mecanismo tecnico clave es el siguiente: primero se rellena el clip hasta la rejilla de fotogramas de LTX (8n+1) manteniendo el ultimo fotograma, todo dentro del grafo; despues se codifican los fotogramas con el VAE de vídeo de LTX a media resolucion; a continuacion se congela ese latente de vídeo con el nodo `LTXV Freeze Latent` (mascara de ruido 0) para que LTX no pueda modificar ni un fotograma; se une con un latente de audio vacio y se muestrea con las sigmas distilled estandar (euler ancestral, CFG 1); finalmente se decodifica con el VAE de audio y se mezcla sobre los fotogramas originales a resolucion completa. El autor documenta que, con el vídeo desactivado y el mismo prompt, LTX produce un unico rugido plano desde el fotograma 0, lo que evidencia que son los fotogramas los que dirigen la generacion de audio.

## Capacidades

- Generacion de banda sonora sincronizada con vídeo: el audio atiende a los fotogramas congelados, de modo que los eventos sonoros coinciden con la accion visual.
- Anadir audio a cualquier clip: el workflow 1 acepta un mundo Hy-Nomas, un guardado de Hy-Nomas Drive o cualquier vídeo externo, y guarda el vídeo intacto con la nueva pista de audio.
- Generacion texto a mundo con audio: el workflow 2 escribe un mundo Hy-Nomas de dos segmentos con ajustes estandar T8 (8 pasos, euler, simple, CFG 1) y lo puntua con LTX-2.5 en una sola ejecucion.
- Adaptacion a cualquier duracion: el relleno a la rejilla 8n+1 se hace en el grafo, por lo que no hay limite fijo de longitud del clip.
- Control mediante prompt de sonido: el prompt de audio se redacta como un parrafo fluido que describe la escena y cada sonido con su momento.
- Modo solo audio de LTX disponible como referencia (sin vídeo congelado), segun documenta el autor.
- No se describen capacidades de tool calling, agentes, razonamiento multilingue ni thinking mode, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Postproduccion de clips generados con modelos de mundo: cargar un clip de Hy-Nomas en el workflow 1 y obtener una pista de audio sincronizada sin edicion manual, aprovechando que el vídeo se conserva intacto.
- Sonorizacion de grabaciones de Hy-Nomas Drive: los recorridos explorados con WASD se guardan como mp4 en `output/hy_nomas/` y pueden cargarse directamente en el workflow 1 para recibir banda sonora.
- Generacion completa de escenas con audio en una sola pasada: el workflow 2 produce un mundo de dos segmentos y su audio en una unica ejecucion, util para prototipado rapido de escenas.
- Doblaje ambiental de material de archivo: cualquier clip puede recibir efectos de sonido coherentes con la accion descrita en el prompt de audio.
- Pruebas de sincronizacion audio-vídeo: investigadores pueden evaluar como un modelo conjunto audio-vídeo responde a un vídeo congelado frente a su modo solo audio, comparando resultados con la misma semilla.
- Creacion de demos y material divulgativo: escenas como el globo aerostatico sobre Giza o la incursion del dragon, con sonidos ligados a eventos concretos (viento, cesteria, cascos, explosion).
- Experimentacion con composicion de modelos en ComfyUI: sirve como referencia de como encadenar un world model y un modelo audio-vídeo mediante nodos estandar y latentes congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta tiempos y consumo de recursos en su RTX 5090 (32 GB, ComfyUI 0.44.0), sin offload:

| Flujo | Tiempo | VRAM maxima |
|---|---:|---:|
| Anadir audio a un clip de 10 s a 1280x704 | ~20 s en caliente, 41 s con la primera carga de modelo | ~31 GiB |
| Texto a mundo con audio, 10 s a 1280x704 | 103 s (132 s con las primeras cargas de modelo) | ~31 GiB |

En el flujo texto a mundo con audio, la RAM del sistema alcanzo unos 62 GB en una maquina de 64 GB, lo que el autor describe como el limite.

## Requisitos de hardware

- VRAM estimada: aproximadamente 31 GiB de pico en ambos workflows, sin offload, segun las mediciones del autor.
- RAM del sistema: unos 62 GB en el flujo completo (Hy-Nomas y LTX-2.5 cargados a la vez); con 64 GB conviene cerrar otras aplicaciones o separar el proceso en dos ejecuciones.
- GPU recomendadas: RTX 5090 (32 GB) es la unica configuracion documentada; no se han publicado mediciones en A100, H100 ni en GPU de consumo con menos memoria.
- Cabe en GPU de consumo: si, en el caso medido de RTX 5090; no hay datos para tarjetas con 24 GB o menos.
- Opciones de despliegue: ComfyUI 0.43 o superior (probado en 0.44.0), con el node pack Comfyui-HY-Nomas-T8 (instalable desde ComfyUI-Manager como "Hy-Nomas T8") para el workflow 2.
- Archivos necesarios: de LTX-2.5 (repositorio con acceso restringido, hay que aceptar la licencia) el transformer distilled 22B int8-convrot, el text encoder Gemma4-12B con proyeccion int8-convrot y los VAE de vídeo y audio en bf16; para el workflow 2, `hy_nomas_distil_int8.safetensors`, `hy_nomas_pixelumm_fp8.safetensors` y `qwen_2.5_vl_7b_fp8_scaled.safetensors`.
- Latencia y throughput: los unicos datos disponibles son los de la tabla anterior (20-41 s para 10 s de audio; 103-132 s para el flujo completo de 10 s a 1280x704).

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con alternativas de la misma categoria; es un conjunto de workflows que compone Hy-Nomas (world model de vídeo de 8B) y LTX-2.5 (modelo conjunto audio-vídeo de 22B). La informacion proporcionada no incluye comparaciones con otros pipelines de sonorizacion de vídeo ni con otros modelos de mundo.

## Limitaciones y advertencias

- El repositorio no incluye pesos de modelo: solo contiene archivos JSON de workflow, imagenes y ejemplos; el tamano del repo es de 0.0 GB.
- Dependencia de dos modelos externos con licencias propias: LTX-2.5 bajo LTX-2.x Community License (repositorio con acceso restringido) y el decodificador PixelUMM de Hy-Nomas bajo licencia NVIDIA One-Way Noncommercial, limitada a investigacion y evaluacion, lo que restringe el uso comercial del pipeline completo.
- El audio generado sale con nivel alto, en torno a -9 LUFS, por lo que requiere normalizacion en el editor para niveles de difusion.
- El flujo completo esta al limite de una maquina de 64 GB de RAM; en equipos con menos memoria puede fallar o requerir ejecuciones separadas.
- Solo hay mediciones en una RTX 5090; el rendimiento en otras GPU no esta documentado.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica; los prompts de ejemplo estan en ingles y el autor recomienda redactar el prompt de audio como un parrafo fluido, lo que sugiere sensibilidad a la formulacion.
- La sincronizacion depende de que el prompt de sonido describa los eventos y su momento; sin esa descripcion, la calidad del resultado no esta garantizada.
- Requiere ComfyUI 0.43 o superior y, para el workflow 2, un node pack de terceros (T8star) construido sobre otro proyecto comunitario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BennyDaBall/Hy-Nomas-x-LTX-2.5-Audio-Workflows
- LTX-2.5 (Lightricks): https://huggingface.co/Lightricks/LTX-2.5
- Hy-Nomas (Tencent Hunyuan): https://github.com/Tencent-Hunyuan/Hy-Nomas
- Node pack Comfyui-HY-Nomas-T8: https://github.com/T8mars/Comfyui-HY-Nomas-T8
- ComfyUI-Hy-Nomas (PedroMarinhoDev): https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas
- Archivos de Hy-Nomas para ComfyUI: https://huggingface.co/t8star/HY-Nomas-Comfy
- Ejemplos del repositorio: https://huggingface.co/BennyDaBall/Hy-Nomas-x-LTX-2.5-Audio-Workflows/tree/main/examples
