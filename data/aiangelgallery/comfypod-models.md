# AiAngelGallery/ComfyPod-Models

## Resumen

AiAngelGallery/ComfyPod-Models no es un modelo entrenado, sino un repositorio espejo (mirror) de 46,5 GB que replica, byte a byte, los archivos que descarga la plantilla gratuita AI Angel ComfyPod para RunPod. La disposicion del repositorio imita la carpeta `models/` de ComfyUI (`text_encoders/`, `vae/`, `loras/`, `diffusion_models/`, `clip_vision/`, `latent_upscale_models/`, `vae_approx/`), de modo que pueda montarse directamente en una instalacion de ComfyUI sin renombrar archivos.

El objetivo declarado es de resiliencia de la cadena de suministro: evitar que la plantilla se rompa cuando un repositorio upstream mueve o elimina un archivo. El autor afirma que cada fichero es identico a su origen (mismo SHA-256, verificado antes de cambiar la plantilla a este espejo) y que no se ha modificado nada. Los contenidos agregados cubren los modelos MiniMax H3 (video con audio, en variantes fl2va y ref2va), Krea 2 Turbo, SCAIL-2 sobre Wan 2.1 14B, ademas de text encoders (Qwen3-VL-32B en NVFP4 AWQ, Qwen3-VL-4B en fp8, UMT5-XXL en fp8), VAEs, LoRAs de destilacion de pasos y utilidades de decodificacion y escalado.

El repositorio se publico y actualizo el 17 de septiembre de 2026, acumula 0 descargas y 0 likes, y su licencia se declara como `mixed-see-readme` porque cada archivo conserva la licencia de su autor original. Es relevante ahora por dos motivos: centraliza pesos ya cuantizados (NVFP4 AWQ, int8 con `convrot`, fp8 escalado) listos para ComfyUI, y porque las licencias de MiniMax H3 y Krea 2 imponen restricciones territoriales y de uso comercial que condicionan cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogeneo: modelos de difusion (MiniMax H3, Krea 2 Turbo, SCAIL-2 sobre Wan 2.1 14B) + text encoders tipo transformer (Qwen3-VL-32B, Qwen3-VL-4B, UMT5-XXL) + VAEs + LoRAs de destilacion |
| Parametros totales | No disponible. El repositorio agrupa multiples modelos; segun la nomenclatura de los archivos, Wan 2.1 14B (14 000 M) y Qwen3-VL-32B (32 000 M) son los unicos tamanos identificables |
| Parametros activos | No aplica (no hay modelos MoE en el listado de archivos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 AWQ, int8 con `convrot`, fp8 `e4m3fn` escalado, bf16, fp16, fp32 |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | Mixta (`mixed-see-readme`): MiniMax H3 Community License, Krea 2 Community License, MIT, Apache-2.0 y Meta SAM License en los archivos no espejados |
| Formato de pesos | `safetensors` (todos los archivos listados) |
| Tamano del repositorio | 46,5 GB |
| Numero de archivos espejados | 23 (mas 2 no espejados, descargados desde su origen) |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |
| Libreria declarada | `minimax-h3` |

## Arquitectura y entrenamiento

No existe entrenamiento propio: el autor del repositorio no entrena ni modifica pesos, sino que reempaqueta archivos existentes en la jerarquia de ComfyUI. La arquitectura efectiva es, por tanto, la suma de las arquitecturas de los modelos incluidos. El bloque principal son modelos de difusion: los `diffusion_models` de MiniMax H3 en variantes `ref2va` (referencia a video y audio) y `hybrid_fl2va_ref2va` (primer/ultimo fotograma y referencia), cuantizados a int8 con `convrot` y variantes truncadas; el modelo Krea 2 Turbo en int8 `convrot` para generacion y edicion de imagen; y el modelo SCAIL-2 (`wan2.1_14B_SCAIL_2_int8_convrot`), derivado de Wan 2.1 14B segun la tabla de origenes, con licencia MIT.

La capa de codificacion de texto la aportan tres modelos distintos: `qwen3vl_32b_minimax_h3_nvfp4_awq` (Qwen3-VL-32B, multimodal vision-language, cuantizado en NVFP4 con AWQ para MiniMax H3), `qwen3vl_4b_fp8_scaled` (Qwen3-VL-4B en fp8 escalado, empaquetado para Krea 2) y `umt5_xxl_fp8_e4m3fn_scaled` (UMT5-XXL en fp8, para la familia Wan). Los decodificadores son VAEs especificos por familia: `minimax_h3_video_vae_fp16` y `minimax_h3_audio_vae_fp32` (lo que confirma que el pipeline H3 genera audio ademas de video), `wan_2.1_vae` y `qwen_image_vae`.

La innovacion tecnica del paquete esta en las optimizaciones de inferencia mas que en la arquitectura: LoRAs de destilacion de pasos que reducen la muestra a 4 pasos (MiniMax H3 ref2v turbo v0.1 y fl2v turbo v1.0 a 768p), 8 pasos (fl2v turbo v1.0), 3 pasos (TaoMate-H3 de Alibaba TaoLive AIGC) y 4 pasos (FastH3 de FastVideo); una LoRA DPO para SCAIL-2; LoRAs de destilacion de CFG y pasos de lightx2v para Wan 2.1 I2V 14B a 480p; un escalador latente 3D en bf16 (`minimax_h3_latent_upscaler_3d_bf16`, Apache-2.0); y un VAE aproximado (TAE, `taeh3.safetensors`, Apache-2.0) para decodificacion rapida de previsualizaciones. La LoRA `krea2_identity_edit_v1_2` apunta a edicion de imagen preservando identidad.

## Capacidades

- Generacion de video a partir de imagen, primer/ultimo fotograma y referencias (variantes `fl2va` y `ref2va` de MiniMax H3).
- Generacion de audio sincronizado en el pipeline de video, evidenciada por la presencia de un VAE de audio especifico (`minimax_h3_audio_vae_fp32`).
- Generacion y edicion de imagen con Krea 2 Turbo, incluida edicion de identidad mediante la LoRA `krea2_identity_edit_v1_2`.
- Image-to-video sobre la familia Wan 2.1 con la LoRA de destilacion de lightx2v (480p).
- Muestreo acelerado: 3, 4 y 8 pasos segun la LoRA seleccionada, frente a los muestreos largos habituales.
- Escalado latente 3D para aumentar la resolucion de video tras la generacion.
- Decodificacion aproximada de latentes (TAE) para previsualizacion rapida antes del decode completo.
- Codificacion vision-lenguaje mediante Qwen3-VL-32B y Qwen3-VL-4B; codificacion de texto UMT5-XXL.
- Codificacion visual auxiliar con CLIP Vision H (`clip_vision_h`), empleada en pipelines de video.
- Tool calling, function calling, agentes, modo de razonamiento y capacidades multilingues: no aplica, el repositorio contiene pesos para generacion multimodal en ComfyUI, no un modelo de lenguaje conversacional.

## Casos de uso

- Despliegue reproducible de ComfyUI en RunPod: la plantilla AI Angel ComfyPod descarga estos archivos directamente, de modo que un despliegue nuevo obtiene las versiones exactas sin depender de que los repositorios upstream sigan publicando los mismos ficheros.
- Generacion de video con audio en produccion de contenido: el pipeline MiniMax H3 junto con el VAE de audio permite obtener clips con pista sonora en una sola pasada, usando la variante `fl2va` para animar un fotograma inicial o `ref2va` para condicionar por referencia.
- Edicion de imagen con preservacion de identidad: Krea 2 Turbo mas `krea2_identity_edit_v1_2` sirve para retoques, cambios de vestuario o de fondo manteniendo el rostro de la persona, un flujo tipico en estudios de fotografia y marketing.
- Prototipado rapido con destilacion de pasos: las LoRAs de 3 y 4 pasos permiten iterar sobre prompts y composiciones en segundos, y reservar el muestreo completo para el render final.
- Escalado de video generado: el escalador latente 3D en bf16 permite pasar de una generacion rapida a resolucion de entrega sin reejecutar el pipeline completo desde cero.
- Previsualizacion barata en granjas de render: el VAE aproximado TAE reduce el coste de decodificar latentes durante la exploracion, dejando el decode fp16/fp32 para el resultado definitivo.
- Experimentacion con cuantizaciones: al convivir NVFP4 AWQ, int8 `convrot` y fp8 escalado, el repositorio sirve para comparar calidad y velocidad entre formatos sobre el mismo pipeline.
- Archivado y auditoria de cadena de suministro: los SHA-256 verificados y la trazabilidad archivo-origen de la tabla permiten reconstruir de que repositorio y con que licencia proviene cada peso.
- Ajuste fino ligero de estilo o movimiento: las LoRAs incluidas son un punto de partida para entrenar variantes propias sobre las mismas bases, siempre que la licencia de la base lo permita en la jurisdiccion del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de FVD, FID, CLIP score, SSIM ni comparativas de velocidad, y la busqueda web realizada no aporto datos tecnicos. Los unicos datos cuantitativos disponibles son el tamano del repositorio (46,5 GB), el numero de pasos de las LoRAs de destilacion (3, 4 y 8) y las cuantizaciones empleadas.

## Requisitos de hardware

- La VRAM necesaria no esta publicada; las cifras siguientes son estimaciones derivadas del tamano de los pesos y del formato de cuantizacion, no datos del autor.
- Text encoder Qwen3-VL-32B en NVFP4 AWQ: aproximadamente 16-18 GB de pesos por el formato de 4 bits mas escalas. NVFP4 requiere GPU Blackwell (serie RTX 50, B200) para ejecucion nativa; en generaciones anteriores exige de-cuantizacion y pierde la ventaja de rendimiento.
- Modelos de difusion en int8 `convrot`: del orden de 1 byte por parametro mas sobrecarga, por lo que el Wan 2.1 14B ronda los 14-16 GB y el resto depende del tamano no publicado de MiniMax H3 y Krea 2.
- El escalador latente 3D y el VAE de video en bf16/fp16 anaden varios GB en funcion de la resolucion y la longitud del clip.
- GPU recomendadas: para el conjunto completo, H100 o A100 de 80 GB; para ejecuciones parciales con offloading, RTX 4090, RTX 5090 o RTX 6000 Ada de 24-48 GB. ComfyUI puede descargar a RAM los modelos no usados en cada paso, lo que reduce el pico de VRAM a costa de latencia.
- Caben en GPU de consumo las variantes int8 de 14B y las LoRAs, siempre que se gestione el offloading; el text encoder de 32B es el componente mas exigente.
- Opciones de despliegue: ComfyUI (nativo, para el que esta empaquetado) y la plantilla RunPod AI Angel ComfyPod. vLLM, llama.cpp, Ollama y TGI no aplican: no son pesos de un modelo de lenguaje con decodificacion autoregresiva estandar.
- Latencia y throughput: no disponibles. Se sabe que las LoRAs permiten reducir el muestreo a 3, 4 u 8 pasos, lo que multiplica la velocidad frente a configuraciones de 20-50 pasos, pero sin cifras publicadas.

## Comparativa con modelos similares

No existen alternativas equivalentes como modelo, porque este repositorio es un espejo. La comparacion relevante es contra los repositorios de origen y otros reempaquetados para ComfyUI:

| Repositorio | Contenido | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| AiAngelGallery/ComfyPod-Models | 23 archivos espejados de 4 familias (MiniMax H3, Krea 2, SCAIL-2/Wan 2.1, utilidades) | Mixta (`mixed-see-readme`) | Espejo byte-identico con layout `models/` de ComfyUI | 0 descargas, 0 likes; publicado 2026-09-17 |
| Comfy-Org/MiniMax-H3 | Modelos, VAEs y LoRAs oficiales empaquetados de MiniMax H3 | MiniMax H3 Community License | Fuente original del empaquetado | Repositorio upstream de referencia |
| Comfy-Org/Krea-2 | Krea 2 Turbo y text encoder Qwen3-VL-4B empaquetados | Krea 2 Community License | Fuente original del empaquetado | Repositorio upstream de referencia |
| Comfy-Org/Wan_2.1_ComfyUI_repackaged | UMT5-XXL fp8, VAE y CLIP Vision H | Apache-2.0 | Reempaquetado oficial de Wan 2.1 | Uso comercial sin restriccion territorial declarada |
| Kijai/WanVideo_comfy | Extracciones de LoRAs, entre ellas la de lightx2v | Apache-2.0 | Extraccion y conversion de pesos | Comunidad de ComfyUI |
| Comfy-Org/SCAIL-2 | SCAIL-2 sobre Wan 2.1 14B y LoRA DPO | MIT | Empaquetado de zai-org/SCAIL-2 | Licencia permisiva, la mas laxa del conjunto |

## Limitaciones y advertencias

- Restriccion territorial grave: la MiniMax H3 Community License no cubre la Union Europea, el Reino Unido, la Republica de Corea ni los Estados Unidos de America. La propia model card indica que no se descarguen ni usen esos archivos en esos territorios. Para un lector en Espana, esto afecta a la mayoria de los archivos del repositorio.
- La Krea 2 Community License permite uso comercial libre de regalias solo por debajo de un umbral de facturacion que el README deja truncado ("below US"); hay que leer el PDF completo antes de cualquier uso comercial.
- Obligacion de etiquetado: todo lo publicado a partir de los modelos MiniMax H3 debe identificarse como generado por IA.
- Licencias heterogeneas dentro del mismo repositorio, lo que complica el cumplimiento: conviven MIT, Apache-2.0, MiniMax H3 Community License y Krea 2 Community License segun el archivo.
- Riesgo legal en dos elementos concretos: `sam3.1_multiplex_fp16` no se espeja y esta tras un gate con Meta SAM License, y `minimax_h3_video_vae_int8_convrot` no declara licencia alguna.
- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que confirmen el comportamiento de los pesos.
- No hay model card tecnica del modelo subyacente: no se publican parametros, contexto, idiomas, composicion del dataset ni proceso de entrenamiento. El repositorio no responde a esas preguntas.
- Sin garantia de mantenimiento: el autor solo promete integridad byte a byte en el momento de la publicacion, no actualizaciones ni soporte.
- Riesgo de alucinacion en generacion multimodal: como todo modelo de difusion, puede producir contenido fisicamente incoherente en video (artefactos entre fotogramas, desincronizacion labial o de audio) y en imagen (anatomia incorrecta, texto ilegible).
- Calidad variable segun la cuantizacion: las variantes int8 con `convrot` y los modelos truncados (`pruned`) degradan la fidelidad respecto a los pesos completos, y las LoRAs de destilacion de pasos sacrifican calidad por velocidad.
- Sesgos de los datos de entrenamiento heredados de cada modelo original, no documentados aqui.
- Dependencia de hardware especifico: el text encoder NVFP4 AWQ no rinde igual fuera de GPU Blackwell.
- Los archivos son un espejo; la responsabilidad de actualizar ante cambios de licencia upstream recae en quien despliega.

## Enlaces

- Repositorio: https://huggingface.co/AiAngelGallery/ComfyPod-Models
- Plantilla y guia AI Angel ComfyPod: https://www.thepexcel.com/aiangel-comfypod/
- Codigo fuente de la plantilla: https://github.com/ThepExcel/AiAngelComfyPod
- Origen MiniMax H3 empaquetado: https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelos hibridos fl2va/ref2va: https://huggingface.co/smhfacct/Minimax-H3-fl2va-ref2va-hybrid-models
- VAE aproximado TAE: https://huggingface.co/Kijai/MiniMax-H3-TAE
- Escalador latente 3D: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- TaoMate-H3 3 pasos: https://huggingface.co/Robert1212star/TaoMate-H3-3Step-ComfyUI y https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- FastH3 de FastVideo: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-LoRA y https://civitai.com/models/2898443
- SCAIL-2: https://huggingface.co/Comfy-Org/SCAIL-2 y https://huggingface.co/zai-org/SCAIL-2
- LoRA lightx2v para Wan 2.1 I2V: https://huggingface.co/Kijai/WanVideo_comfy y https://huggingface.co/lightx2v/Wan2.1-I2V-14B-480P-StepDistill-CfgDistill-Lightx2v
- Reempaquetado Wan 2.1: https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Krea 2: https://huggingface.co/Comfy-Org/Krea-2 y https://huggingface.co/krea/Krea-2-Turbo
- VAE de imagen Qwen: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- LoRA de edicion de identidad: https://huggingface.co/conradlocke/krea2-identity-edit
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el repositorio (localizador de tiendas Walmart y enlaces a Google Maps), por lo que no se incluyen como fuentes.
