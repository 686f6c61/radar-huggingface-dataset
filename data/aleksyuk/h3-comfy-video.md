# aleksyuk/h3-comfy-video

## Resumen

`aleksyuk/h3-comfy-video` no es un modelo entrenado, sino un espejo (mirror) del conjunto de pesos de MiniMax H3 reorganizado con la estructura de carpetas `models/` de ComfyUI, de modo que los 94,3 GB de archivos puedan consumirse como un unico repositorio de Hugging Face (por ejemplo, como modelo cacheado en un endpoint serverless de Runpod). El autor del repositorio, `aleksyuk`, no es el desarrollador del modelo: los archivos son copias sin modificar de cuatro repositorios de origen y las licencias originales siguen aplicandose.

El modelo subyacente, MiniMax H3 (Hailuo AI 3.0), es un generador de video multimodal nativo que acepta entradas de texto, imagen, video y audio, y produce clips de hasta 2K de resolucion con audio estereo 3D sincronizado en una sola generacion, con duraciones de entre 5 y 15 segundos. Su integracion en ComfyUI esta soportada de forma oficial a partir de la version 0.30.0 mediante plantillas de Video.

La relevancia de este repositorio es practica: agrupa en un unico identificador los ocho artefactos necesarios (modelo de difusion, codificador de texto, dos VAE, dos LoRA, un upscaler latente y una VAE aproximada) que de otro modo habria que descargar por separado de cuatro repositorios distintos. No contiene benchmarks, documentacion tecnica adicional ni pesos alterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrega varios componentes; el modelo de difusion es un modelo de video de MiniMax H3) |
| Parametros totales | no disponible para el modelo de difusion; el codificador de texto incluido es Qwen3-VL 32B (51,5 GB en bf16) |
| Parametros activos | no aplica (no hay informacion que indique una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo de difusion Singularity v1.3), bf16 (codificador de texto, LoRA, upscaler latente), fp16 (VAE de video), fp32 (VAE de audio), aproximada TAEH3 (0,02 GB) |
| Idiomas soportados | no declarado en el repositorio; el codificador de texto es Qwen3-VL 32B |
| Licencia | `other` / `see-original-repositories` (cada archivo conserva la licencia de su repositorio de origen) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 94,3 GB |
| Fecha de creacion (metadatos HF) | 2026-09-27 |
| Libreria declarada | minimax-h3 |
| Descargas / likes | 0 / 0 |

Inventario completo de archivos:

| Archivo | Tamano | Repositorio de origen |
|---|---|---|
| `diffusion_models/H3/Minimax-h3_Singularity_ref2va_v1.3_int8.safetensors` | 34,0 GB | WarmBloodAban/Minimax-h3_Singularity |
| `text_encoders/qwen3vl_32b_minimax_h3_bf16.safetensors` | 51,5 GB | Comfy-Org/MiniMax-H3 |
| `vae/minimax_h3_video_vae_fp16.safetensors` | 5,2 GB | Comfy-Org/MiniMax-H3 |
| `vae/minimax_h3_audio_vae_fp32.safetensors` | 0,6 GB | Comfy-Org/MiniMax-H3 |
| `loras/minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors` | 2,0 GB | Comfy-Org/MiniMax-H3 |
| `loras/better_motion_h3_lora_v1_500.safetensors` | 0,3 GB | vpakarinen/better-human-motion-h3-lora |
| `latent_upscale_models/minimax_h3_latent_upscaler_3d_conv_v1_bf16.safetensors` | 0,7 GB | LBH-123-AI/Minimax_h3_latent_Upscaler |
| `vae_approx/taeh3.safetensors` | 0,02 GB | t8star/Taeh3-Comfy |

## Arquitectura y entrenamiento

No hay informacion en la documentacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en MiniMax H3. La unica informacion arquitectonica deducible del inventario de archivos es la estructura de componentes tipica de un pipeline de difusion para video: un modelo de difusion principal en cuantizacion int8 (`Minimax-h3_Singularity_ref2va_v1.3`), un codificador de texto multimodal Qwen3-VL de 32B parametros, una VAE especifica para video en fp16 y otra especifica para audio en fp32, lo que confirma que el audio se genera y decodifica en un espacio latente separado del video.

Los nombres de los archivos si aportan informacion operativa: la variante del modelo de difusion es `ref2va` (referencia a video con audio) y existe un LoRA turbo de 4 pasos (`ref2v_turbo_4step`) que reduce el numero de pasos de muestreo necesarios, ademas de un upscaler latente basado en convolucion 3D (`3d_conv`) que trabaja en el espacio latente en lugar del espacio de pixeles. Este repositorio no documenta ninguna innovacion tecnica propia: es un reempaquetado, y el autor indica explicitamente que no se modifico ningun archivo.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio estereo 3D nativo sincronizado en la misma generacion.
- Generacion de video a partir de imagen (image-to-video).
- Generacion de video a partir de referencias (reference-to-video) y variante con audio (ref2va), segun la nomenclatura del modelo de difusion incluido.
- Entrada multimodal: la documentacion de ComfyUI indica soporte de entradas de texto, imagen, video y audio.
- Salida de hasta 2K de resolucion con duraciones de 5 a 15 segundos por generacion.
- Aceleracion del muestreo mediante el LoRA turbo de 4 pasos (`minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors`).
- Refinado de movimiento humano mediante un LoRA de terceros (`better_motion_h3_lora_v1_500`).
- Escalado en espacio latente con un upscaler 3D convolucional de 0,7 GB.
- Previsualizacion rapida mediante la VAE aproximada TAEH3, que sustituye a la VAE completa durante iteraciones de prueba.
- Soporte de tool calling, function calling y agentes: no disponible (no es un modelo de lenguaje conversacional y no se documentan estas capacidades).
- Capacidades multilingues: no declaradas en la ficha del repositorio; el codificador de texto empleado es Qwen3-VL 32B.

## Casos de uso

- Generacion de clips publicitarios con audio integrado: el modelo produce hasta 15 segundos en 2K con audio estereo sincronizado en una sola pasada, lo que elimina la necesidad de un pipeline separado de Foley o de sintesis de voz para piezas cortas de redes sociales.
- Iteracion rapida de storyboards: usando el LoRA turbo de 4 pasos y la VAE aproximada TAEH3, se pueden generar previsualizaciones de bajo coste antes de lanzar la generacion final con la VAE completa.
- Image-to-video para animacion de fotografia de producto: a partir de una imagen fija de catalogo se generan planos cortos con movimiento y audio, util para e-commerce y catalogos dinamicos.
- Reference-to-video para mantener consistencia de personaje: la variante `ref2va` permite condicionar la generacion con referencias visuales, lo que resulta adecuado para series de clips donde el protagonista debe ser el mismo entre planos.
- Correccion de movimiento en planos generados: el LoRA `better_motion_h3_lora_v1_500` se aplica sobre resultados con movimiento humano pobre para recuperar naturalidad en la animacion de personas.
- Escalado de material ya generado: el upscaler latente `minimax_h3_latent_upscaler_3d_conv_v1_bf16` permite subir de resolucion clips existentes trabajando en el espacio latente, sin regenerarlos desde cero.
- Despliegue como endpoint serverless con cache unico: al estar todo el conjunto en un solo repositorio de 94,3 GB, un endpoint de Runpod puede cachear un unico modelo en lugar de descargar de cuatro repositorios distintos en cada arranque en frio.
- Prototipado de doblaje y audio multicanal: la VAE de audio en fp32 separada de la de video permite experimentar con el decodificado de audio sin tocar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ningun dato de evaluacion, comparativa cuantitativa ni metrica de calidad (FVD, CLIP score, IS, MOS de audio ni similares), y la model card se limita al inventario de archivos y a la atribucion de los repositorios de origen.

## Requisitos de hardware

- VRAM estimada a partir del tamano de los archivos: solo el modelo de difusion en int8 ocupa 34,0 GB; el codificador de texto en bf16 ocupa 51,5 GB y la VAE de video 5,2 GB. Si todos los componentes residen simultaneamente en memoria, la suma supera los 90 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU. Las 80 GB de una H100 o A100 no bastan para mantener todo el pipeline residente a la vez, por lo que es necesario el offload secuencial de componentes (cargar el codificador de texto, liberarlo y cargar despues el modelo de difusion), estrategia que ComfyUI aplica de forma habitual.
- GPU de consumo: no es viable en una RTX 4090 (24 GB) ni en tarjetas de 16 GB sin offload agresivo a RAM y disco, dado que el unico archivo mas pequeno del componente principal (modelo de difusion, 34 GB) ya excede la VRAM disponible. Una alternativa parcial es sustituir la VAE completa por la aproximada TAEH3 (0,02 GB) y usar el LoRA turbo de 4 pasos, pero el cuello de botella del modelo de difusion persiste.
- RAM de sistema: conviene disponer de al menos 100 GB de RAM o de almacenamiento NVMe rapido si se va a hacer offload de componentes de 30-50 GB.
- Opciones de despliegue: ComfyUI version 0.30.0 o superior (soporte oficial mediante Template Library > Video > flujos de MiniMax H3), con la estructura de carpetas `models/` que reproduce exactamente este repositorio. La documentacion de ComfyUI menciona el uso de Sage Attention como acelerador. El repositorio no incluye configuracion para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no hay datos medidos publicados. El diseno del LoRA turbo de 4 pasos indica que el muestreo puede reducirse a 4 pasos, lo que disminuye proporcionalmente el tiempo de generacion frente a un muestreo completo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, parametros o contexto de otros modelos de generacion de video open weights que permitan una comparativa tecnica fiable. Lo que si puede compararse es el empaquetado: este repositorio frente a los repositorios de origen de los que copia los archivos.

| Repositorio | Contenido respecto a este mirror | Licencia | Disponibilidad |
|---|---|---|---|
| `aleksyuk/h3-comfy-video` | Los 8 archivos completos, 94,3 GB, estructura `models/` de ComfyUI | `other` / see-original-repositories | Publico, 0 descargas y 0 likes en el momento de la consulta |
| `Comfy-Org/MiniMax-H3` | Origen de 4 de los 8 archivos (codificador de texto, ambas VAE, LoRA turbo), 59,3 GB | La del repositorio original | Publico, mantenido por Comfy-Org |
| `WarmBloodAban/Minimax-h3_Singularity` | Origen del modelo de difusion int8 (34,0 GB) | La del repositorio original | Publico |
| `vpakarinen/better-human-motion-h3-lora` | Origen del LoRA de movimiento (0,3 GB) | La del repositorio original | Publico |

## Limitaciones y advertencias

- Este repositorio no es un modelo, sino un espejo de terceros: no aporta pesos nuevos, configuraciones, pipelines ni documentacion tecnica, y su autor no participa en el desarrollo de MiniMax H3.
- Los metadatos muestran 0 descargas y 0 likes, y una fecha de creacion de 2026-09-27, posterior a la fecha de consulta habitual; conviene verificar la integridad de los archivos antes de usarlos en produccion.
- La licencia es `other` con el identificador `see-original-repositories`: para uso comercial hay que revisar y respetar la licencia de cada uno de los cuatro repositorios de origen por separado, ya que este mirror no relicencia nada.
- Al menos tres componentes (LoRA `better_motion_h3_lora`, upscaler latente y VAE aproximada TAEH3) provienen de autores de terceros y no de MiniMax ni de Comfy-Org, con licencias potencialmente distintas al resto del conjunto.
- El modelo de difusion incluido esta en int8, no en bf16/fp16; puede haber una perdida de calidad frente a los pesos originales en precision completa que no esta cuantificada en este repositorio.
- El codificador de texto en bf16 pesa 51,5 GB, lo que condiciona cualquier despliegue: obliga a offload secuencial o a cuantizarlo por cuenta propia, con el consiguiente riesgo de degradar la fidelidad del condicionamiento.
- No hay benchmarks, evaluaciones de sesgo ni pruebas de robustez publicadas para este conjunto de archivos.
- No se declaran idiomas soportados ni limitaciones de contexto del codificador de texto.
- Como cualquier modelo de generacion de video, existe riesgo de artefactos visuales, incoherencia temporal y contenido no deseado; el repositorio no documenta filtros de seguridad ni moderacion.
- No hay garantia de mantenimiento ni de actualizacion de este mirror; los repositorios de origen son la referencia canonica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aleksyuk/h3-comfy-video
- Repositorio de origen del modelo de difusion: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Repositorio de origen principal (codificador de texto, VAE y LoRA turbo): https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio de origen del LoRA de movimiento humano: https://huggingface.co/vpakarinen/better-human-motion-h3-lora
- Repositorio de origen del upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Repositorio de origen de la VAE aproximada: https://huggingface.co/t8star/Taeh3-Comfy
- Hub de recursos de MiniMax H3: https://github.com/ai-models-lab/minimax-h3
- Pagina de MiniMax H3 en Comfy: https://comfy.org/minimax-h3/
- Documentacion de ComfyUI para MiniMax H3 (tutorial): https://docs.comfy.org/tutorials/video/minimax/minimax-h3
- Tutorial en el repositorio de documentacion de Comfy-Org: https://github.com/Comfy-Org/docs/blob/main/tutorials/video/minimax/minimax-h3.mdx
- Video demostrativo en YouTube: https://www.youtube.com/watch?v=3j0LrlMJnNc
