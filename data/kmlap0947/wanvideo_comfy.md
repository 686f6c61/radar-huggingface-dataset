# Kmlap0947/WanVideo_comfy

## Resumen

WanVideo_comfy es un repositorio de archivos de pesos en formato de un solo fichero (diffusion-single-file) para ComfyUI, derivado de los modelos de generacion de video Wan2.1-VACE de Alibaba (Wan-AI). No es un modelo entrenado desde cero por el autor del repositorio, sino una recopilacion de modelos combinados y cuantizados, orientada a facilitar su uso en flujos de trabajo de ComfyUI mediante el wrapper ComfyUI-WanVideoWrapper de kijai o los nodos nativos de WanVideo. El repositorio declara como modelos base Wan-AI/Wan2.1-VACE-14B y Wan-AI/Wan2.1-VACE-1.3B, ambos modelos de difusion para generacion y edicion de video.

El interes practico del repositorio reside en la agregacion de variantes cuantizadas y destiladas de la familia Wan2.1: versiones fp8, extracciones LoRA de CausVid, destilados de CFG y pasos, y pesos de proyectos derivados como SkyReels, Wan2.1-Fun, Phantom, ATI, MultiTalk, FantasyTalking, Anisora, Pusa, FastVideo, Ovi, FlashVSR o rCM. Tambien incluye el VAE ligero TinyVAE de madebyollin (taehv), pensado para reducir requisitos de memoria en decodificacion.

El repositorio es de gran tamano (1522,9 GB) y no dispone de model card descriptiva mas alla de una lista de enlaces de origen. No se especifican licencia, idiomas ni pipeline en la informacion disponible. Por su naturaleza, es un recurso de distribucion de pesos para inferencia en ComfyUI, no un modelo con entrenamiento propio documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion para video (base: Wan2.1-VACE, variantes T2V/I2V/VACE); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | Variantes de 1.3B y 14B (segun modelos base declarados); otras variantes no especificadas |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion de video; no aplica contexto de texto) |
| Tipos de cuantizacion | fp8 (fp8_scaled en repositorio hermano de Kijai), extracciones LoRA, destilados de pasos y CFG; otras no especificadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusion-single-file (ficheros unicos para ComfyUI); no se detalla safetensors/GGUF en la informacion disponible |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni entrenamiento propios: agrupa pesos derivados de la familia Wan2.1 de Wan-AI, modelos de difusion para generacion y edicion de video. Las variantes incluidas abarcan los modelos base VACE (1.3B y 14B), destilados de la linea CausVid y lightx2v (CFG y Step distill), y pesos de proyectos de terceros como SkyReels, Wan2.1-Fun, Phantom, ATI, MAGREF, MultiTalk, FantasyTalking, Anisora, Pusa, FastVideo, EchoShot, Wan2.2-TI2V-5B-Turbo, Ovi, FlashVSR y rCM.

La innovacion tecnica documentada se limita a las extracciones LoRA de CausVid: v1 es una extraccion directa que afecta al movimiento e introduce parpadeo a intensidad completa; v1.5 elimina el primer bloque para corregir el parpadeo; v2 poda a solo capas de atencion, sin primer bloque, corrige el parpadeo y conserva mejor el movimiento, aunque requiere mas pasos y puede beneficiarse de CFG. No se aportan datos sobre numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de video texto-a-video (T2V) e imagen-a-video (I2V) mediante los modelos base Wan2.1.
- Edicion y composicion de video con las variantes VACE.
- Destilacion de pasos y CFG para reducir coste de inferencia (lightx2v, CausVid).
- Integracion con ComfyUI mediante ComfyUI-WanVideoWrapper y nodos nativos WanVideo.
- Variantes especializadas de terceros incluidas: talking-head (FantasyTalking, MultiTalk), restauracion/superresolucion (FlashVSR), eliminacion de objetos (MiniMaxRemover), referencia multi-imagen (MAGREF), video con audio (Ovi), aceleracion (AccVideo, rCM).
- Decodificacion con VAE ligero TinyVAE (taehv) para reducir memoria.
- Soporte de tool calling, agentes, razonamiento multi-paso y capacidades multilingues: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Generacion de clips de video a partir de descripciones textuales: usar las variantes T2V de Wan2.1 en ComfyUI para producir secuencias cortas, aprovechando los destilados de pasos para reducir el numero de iteraciones.
- Animacion de imagenes fijas (I2V): convertir ilustraciones o fotografias en clips animados con las variantes imagen-a-video, util para prototipado creativo y previsualizacion.
- Edicion y composicion de video con VACE: aplicar las variantes VACE para tareas de inpainting, extension o control estructural sobre metraje existente.
- Creacion de avatares parlantes: emplear FantasyTalking o MultiTalk para sincronizacion labial y locucion multi-persona en produccion de contenido divulgativo.
- Superresolucion y restauracion de video: usar FlashVSR para escalar y mejorar metraje de baja calidad en flujos de postproduccion.
- Eliminacion de objetos en video: aplicar MiniMaxRemover para limpiar elementos no deseados en planos rodados.
- Aceleracion de pipelines de generacion: integrar AccVideo o rCM para reducir tiempos de inferencia en entornos de produccion con ComfyUI.
- Generacion de video con audio sincronizado: emplear Ovi para crear clips con pista de audio asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; las variantes de 14B en fp8 requieren GPUs de gama alta, mientras que las de 1.3B y el VAE TinyVAE reducen el consumo.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, las variantes de 14B apuntan a A100/H100 o RTX 4090/5090, y las de 1.3B a GPUs consumer con VRAM suficiente.
- Cabe en GPU consumer: probable para variantes de 1.3B y fp8; no confirmado en la informacion disponible.
- Opciones de despliegue: ComfyUI (nodos nativos WanVideo) y ComfyUI-WanVideoWrapper; otras no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WanVideo_comfy (este repo) | 1.3B y 14B (variantes) | no aplica | no disponible | Hugging Face (ComfyUI) |
| Wan-AI/Wan2.1-VACE-1.3B | 1.3B | no aplica | no disponible en esta ficha | Hugging Face |
| Wan-AI/Wan2.1-VACE-14B | 14B | no aplica | no disponible en esta ficha | Hugging Face |
| Kijai/WanVideo_comfy_fp8_scaled | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo original: es una recopilacion de pesos derivados; la calidad y el comportamiento dependen de los modelos base y de los proyectos de origen.
- Las extracciones LoRA de CausVid son experimentales: v1 introduce parpadeo y degrada el movimiento a intensidad completa; v2 requiere mas pasos.
- Ausencia de model card detallada: no hay documentacion sobre licencia, idiomas ni limitaciones oficiales.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse en los repositorios de origen (Wan-AI y proyectos de terceros).
- Riesgo de artefactos en generacion de video (parpadeo, incoherencias temporales) inherente a los modelos de difusion.
- Tamano del repositorio muy elevado (1522,9 GB): requiere almacenamiento y ancho de banda considerables para su descarga completa.
- Dependencia de ComfyUI y del wrapper de kijai para su uso practico.
- Sin datos de benchmarks ni de sesgos; no apto para evaluaciones de rendimiento sin validacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kmlap0947/WanVideo_comfy
- Modelos base Wan-AI: https://huggingface.co/Wan-AI/
- ComfyUI-WanVideoWrapper: https://github.com/kijai/ComfyUI-WanVideoWrapper
- Variantes fp8_scaled de Kijai: https://huggingface.co/Kijai/WanVideo_comfy_fp8_scaled
- TinyVAE (taehv): https://github.com/madebyollin/taehv
- SkyReels: https://huggingface.co/collections/Skywork/skyreels-v2-6801b1b93df627d441d0d0d9
- Wan2.1-Fun: https://huggingface.co/collections/alibaba-pai/wan21-fun-v11-680f514c89fe7b4df9d44f17
- CausVid 14B: https://huggingface.co/lightx2v/Wan2.1-T2V-14B-CausVid
- CFG and Step distill 14B: https://huggingface.co/lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill
- CausVid 1.3B: https://huggingface.co/tianweiy/CausVid
- AccVideo: https://huggingface.co/aejion/AccVideo-WanX-T2V-14B
- Phantom: https://huggingface.co/bytedance-research/Phantom
- ATI: https://huggingface.co/bytedance-research/ATI
- MiniMaxRemover: https://huggingface.co/zibojia/minimax-remover
- MAGREF: https://huggingface.co/MAGREF-Video/MAGREF
- FantasyTalking: https://github.com/Fantasy-AMAP/fantasy-talking
- MultiTalk: https://github.com/MeiGen-AI/MultiTalk
- Anisora: https://huggingface.co/IndexTeam/Index-anisora/tree/main/14B
- Pusa: https://huggingface.co/RaphaelLiu/PusaV1/tree/main
- FastVideo: https://huggingface.co/FastVideo
- EchoShot: https://github.com/D2I-ai/EchoShot
- Wan2.2-TI2V-5B-Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- Ovi: https://github.com/character-ai/Ovi
- FlashVSR: https://huggingface.co/JunhaoZhuang/FlashVSR
- rCM: https://huggingface.co/worstcoder/rcm-Wan/tree/main
