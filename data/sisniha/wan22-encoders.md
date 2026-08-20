# sisniha/wan22-encoders

## Resumen

Este repositorio aloja los pesos de los codificadores compartidos del ecosistema Wan 2.2, desarrollado por WindstormLabs como parte del subproyecto SceneMachine. No es un modelo generativo en sí mismo, sino un conjunto de componentes de infraestructura que incluyen el VAE de Wan 2.1, el codificador de texto UMT5-xxl, el codificador de visión SigLIP vision-patch14-384 y el CLIP-ViT-H, este último requerido por el adaptador facial de Wan 2.2 Animate. El repositorio es un espejo (mirror) de los paquetes oficiales de Comfy-Org, con las mismas licencias upstream.

La relevancia de este repositorio radica en que centraliza los encoders necesarios para ejecutar los stacks T2V, I2V y Animate de Wan 2.2, evitando descargas dispersas. Los pesos están en formato safetensors en bf16, con un tamaño total de 13,74 GB. No se proporcionan parámetros totales ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (Wan 2.1) + UMT5-xxl (text encoder) + SigLIP vision-patch14-384 + CLIP-ViT-H |
| Parametros totales | no disponible (archivos: UMT5 11,36 GB, CLIP-ViT-H 1,26 GB, SigLIP 0,86 GB, VAE 0,25 GB en bf16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors) |
| Idiomas soportados | ingles (segun metadatos del repo) |
| Licencia | apache-2.0 (con licencias upstream de Alibaba, Google T5, Google SigLIP, OpenCLIP-laion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma independiente, sino una coleccion de pesos preentrenados de distintos componentes. El VAE de Wan 2.1 se mantiene en la version 2.2 y se encarga de la compresion y reconstruccion de latentes. El UMT5-xxl es un codificador de texto basado en la familia T5, adaptado para el ecosistema Wan. El SigLIP vision-patch14-384 se usa para la entrada de imagenes en tareas I2V, mientras que el CLIP-ViT-H es obligatorio para el adaptador facial de Animate, ya que SigLIP provoca un desajuste de forma en LayerNorm. No se documentan datos de entrenamiento, numero de tokens ni procesos de RLHF/DPO en la informacion disponible.

## Capacidades

- Codificacion de texto multimodal mediante UMT5-xxl, capaz de procesar instrucciones en lenguaje natural para generacion de video.
- Codificacion de imagenes mediante SigLIP vision-patch14-384 para tareas de imagen-a-video (I2V).
- Codificacion de imagenes mediante CLIP-ViT-H, necesario para el adaptador facial en el stack Animate.
- Compresion y reconstruccion de latentes mediante el VAE de Wan 2.1.
- No incluye capacidades de generacion autonoma, tool calling ni razonamiento multi-paso; es un conjunto de componentes auxiliares.

## Casos de uso

- Integracion en pipelines de generacion de video Wan 2.2 T2V: el UMT5-xxl codifica el prompt de texto y el VAE gestiona los latentes, permitiendo generar clips a partir de descripciones.
- Generacion de video a partir de imagenes (I2V): SigLIP procesa la imagen de entrada y el resto del stack genera la secuencia animada.
- Animacion facial con Wan 2.2 Animate: el CLIP-ViT-H alimenta el adaptador facial, evitando el fallo de LayerNorm que ocurriria con SigLIP.
- Despliegue en ComfyUI: los pesos estan empaquetados para cargarse directamente en nodos de ComfyUI, simplificando la configuracion de flujos de trabajo.
- Desarrollo de herramientas de edicion de video: al disponer de los encoders por separado, se pueden construir pipelines personalizados que combinen estos componentes con otros modelos.
- Investigacion sobre codificadores multimodales: permite estudiar y comparar el comportamiento de UMT5, SigLIP y CLIP-ViT-H en tareas de generacion audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio de pesos compartidos, no se proporcionan metricas de calidad de generacion ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el UMT5-xxl en bf16 requiere aproximadamente 23 GB de VRAM solo para los pesos (11,36 GB) mas overhead de activaciones; el VAE, SigLIP y CLIP-ViT-H son ligeros (menos de 2 GB en conjunto).
- GPU recomendadas: para el stack completo de Wan 2.2 se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090/4090) o GPUs de datacenter como A100 o H100.
- En consumer GPU: el UMT5-xxl cabe en una RTX 4090 (24 GB) con cuantizacion adicional, pero el stack completo puede requerir mas memoria.
- Opciones de despliegue: los pesos estan en safetensors y pueden cargarse con ComfyUI, o mediante librerias de inferencia como diffusers o vLLM si se integran en un pipeline personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 encoders (este repo) | VAE + UMT5 + SigLIP + CLIP-ViT-H | no disponible | no disponible | apache-2.0 (upstream) | HuggingFace |
| T5-xxl | Text encoder | 11B | 512 tokens | apache-2.0 | HuggingFace |
| CLIP ViT-H | Vision encoder | 632M | 77 tokens | MIT | HuggingFace |

No se dispone de comparativas directas con otros conjuntos de encoders especificos para generacion de video, ya que este repositorio es un mirror de los paquetes oficiales de Comfy-Org.

## Limitaciones y advertencias

- Es un mirror: los pesos provienen de Comfy-Org y las licencias upstream (Alibaba, Google T5, Google SigLIP, OpenCLIP-laion) se aplican sin cambios; es necesario verificar los terminos de cada componente antes de uso comercial.
- No es un modelo autonomo: requiere el resto del stack Wan 2.2 (modelo de difusion, schedulers, etc.) para funcionar.
- El CLIP-ViT-H es obligatorio para Animate; usar SigLIP en su lugar provoca un error de forma en LayerNorm.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto en la informacion disponible.
- El repositorio fue generado con asistencia de Claude Code, lo que puede implicar inconsistencias en la documentacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sisniha/wan22-encoders
- Repositorio original de WindstormLabs: https://huggingface.co/WindstormLabs/wan22-encoders
- Paquete oficial de Comfy-Org para Wan 2.2: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Paquete oficial de Comfy-Org para Wan 2.1 (CLIP-ViT-H): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Coleccion SceneMachine: https://huggingface.co/SceneMachine
- Speed LoRAs: https://huggingface.co/WindstormLabs/wan22-loras
