# SadikNawazAI/sadik-ai-video-wan2.2-fast

## Resumen

SadikAI Video — Wan 2.2 I2V (14B) Fast es un paquete de pesos preparado para ComfyUI que implementa el modelo oficial Wan-AI/Wan.2.2-I2V-A14B de generacion de video a partir de una imagen y un prompt de texto (image-to-video), acelerado mediante las LoRAs de 4 pasos de LightX2V. No se trata de un fine-tune propio: el autor, Sadik Nawaz (SadikNawazAI), empaqueta los pesos oficiales en formato fp8_scaled, las LoRAs de destilado y el text encoder UMT5-XXL junto con un workflow listo para usar. El objetivo es reducir el coste de muestreo de mas de 20 pasos a solo 4, manteniendo la calidad del modelo base.

El modelo base Wan 2.2 I2V A14B es un modelo de difusion de tipo Mixture-of-Experts (MoE) con 14B parametros totales, disenado para generar clips cortos a partir de una imagen de referencia. Esta version "fast" incorpora dos LoRAs de destilado (una para la fase de alto ruido y otra para la de bajo ruido) que permiten generar un clip de 81 frames (aproximadamente 5 segundos a 16 fps) en unos 97 segundos sobre una RTX 4090 de 24 GB, segun el benchmark oficial de ComfyUI citado en la model card.

La relevancia actual reside en que democratiza la generacion de video en hardware de consumo: con 24 GB de VRAM y un flujo de ComfyUI se puede producir video image-to-video de calidad razonable en menos de dos minutos, sin necesidad de infraestructura de centro de datos. La licencia Apache-2.0 de todos los componentes facilita su uso comercial, aunque el modelo solo soporta ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) Mixture-of-Experts, base Wan 2.2 I2V A14B |
| Parametros totales | 14B (modelo base) |
| Parametros activos | no disponible (la model card no detalla el reparto de expertos) |
| Longitud de contexto | no disponible (modelo de video; no aplica contexto textual) |
| Tipos de cuantizacion | fp8_scaled (e4m3fn) para los modelos de difusion y el text encoder; LoRAs en safetensors |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp8_scaled para difusion y text encoder; VAE en safetensors) |

## Arquitectura y entrenamiento

El modelo base Wan 2.2 I2V A14B emplea una arquitectura de difusion con mezcla de expertos (MoE) de 14B parametros, orientada a la generacion condicionada por imagen. El pipeline image-to-video combina un text encoder UMT5-XXL (en esta build, en fp8_e4m3fn_scaled, 6,27 GiB) con un VAE (wan_2.1_vae, 242 MiB) y dos modelos de difusion separados para las fases de alto y bajo ruido (13,31 GiB cada uno en fp8_scaled). El flujo de muestreo se divide: el modelo de alto ruido genera los primeros pasos y el de bajo ruido los ultimos, coordinados mediante dos nodos KSamplerAdvanced en ComfyUI.

La aceleracion proviene de las LoRAs Wan2.2-Lightning de 4 pasos de LightX2V (1,14 GiB cada una), que destilan el proceso de muestreo para reducir de mas de 20 pasos a 4 con CFG 1.0. Los pesos de difusion y el text encoder han sido reempaquetados por Comfy-Org en fp8_scaled para reducir el uso de VRAM. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens de video, ni si hubo etapas de RLHF o DPO; la model card no los detalla y remite al paper arXiv:2503.20314 para los detalles del modelo Wan 2.2.

## Capacidades

- Generacion de video image-to-video: convierte una imagen de entrada mas un prompt de texto en un clip corto (por defecto 81 frames, aproximadamente 5 segundos a 16 fps).
- Control de movimiento y camara mediante prompt: permite describir acciones ("she turns her head slowly"), movimientos de camara ("the camera pushes in") y movimiento de elementos ("hair moves in the wind").
- Generacion en 4 pasos de muestreo con CFG 1.0, sampler euler, scheduler simple y shift 5.0.
- Resoluciones soportadas segun la model card: 640x640, 832x480 y 1280x720.
- Soporte multilingue limitado a ingles y chino.
- Integracion nativa con ComfyUI mediante workflow JSON incluido en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; es un modelo exclusivamente de generacion de video.

## Casos de uso

- Prototipado rapido de video generativo: un desarrollador puede cargar el workflow en ComfyUI, introducir una imagen y un prompt y obtener un clip de 5 segundos en aproximadamente 97 segundos sobre una RTX 4090, lo que permite iterar sobre ideas visuales sin esperar tiempos de muestreo largos.
- Animacion de fotografias para redes sociales: a partir de un retrato o una foto de producto se puede generar un clip corto con movimiento sutil de camara o del sujeto, adecuado para publicaciones en plataformas que admiten video breve.
- Previsualizacion de storyboards: estudios pequenos pueden convertir frames clave de un guion grafico en clips animados para validar ritmo y composicion antes de producir la animacion final.
- Generacion de contenido para e-commerce: animar imagenes de producto (por ejemplo, un movimiento de camara alrededor del articulo) para fichas de producto o anuncios, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Educacion y divulgacion: animar diagramas o ilustraciones estaticas para explicar procesos con movimiento de camara controlado por prompt, reduciendo la necesidad de animadores para material complementario.
- Investigacion en generacion de video: servir como base reproducible y ligera (fp8 + LoRAs de 4 pasos) para experimentar con destilado, cuantizacion o nuevos prompts sin requerir un clúster de GPUs.
- Integracion en pipelines de automatizacion creativa: al ser un workflow de ComfyUI, puede encadenarse con otros nodos (upscaling, interpolacion, postprocesado) para producir video de forma automatizada por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente cita un benchmark oficial de ComfyUI: aproximadamente 97 segundos para generar un clip de 640x640 en una RTX 4090 de 24 GB usando fp8_scaled y las LoRAs de 4 pasos. No se aportan metricas de calidad (FVD, CLIP score, etc.) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM recomendada: 24 GB (RTX 4090); 32 GB o mas para mayor comodidad.
- VRAM estimada para inferencia: los pesos suman aproximadamente 35,4 GiB en disco (dos modelos de difusion de 13,31 GiB, dos LoRAs de 1,14 GiB, text encoder de 6,27 GiB y VAE de 242 MiB); en fp8_scaled el uso efectivo de VRAM es inferior al tamano en disco, pero la model card no desglosa el pico exacto.
- GPU recomendadas: RTX 4090 24 GB (benchmark oficial); previsiblemente tambien A100, H100 y otras GPUs con 24 GB o mas, aunque no se documentan mediciones en ellas.
- GPU de consumo: cabe en RTX 4090 de 24 GB; no se confirma compatibilidad con GPUs de 16 GB o menos.
- CPU-only no soportado: la model card indica explicitamente que se use una GPU en la nube si no se dispone de tarjeta NVIDIA.
- Opciones de despliegue: ComfyUI (flujo principal, con workflow JSON incluido); el offload a RAM del sistema es posible pero ralentiza mucho la generacion.
- Latencia y throughput: aproximadamente 97 segundos por clip de 640x640 y 81 frames en RTX 4090; no se documentan cifras para otras resoluciones ni GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SadikAI Video — Wan 2.2 I2V Fast (esta ficha) | 14B (base) | Difusion MoE image-to-video, 4 pasos | 81 frames (~5 s a 16 fps) | Apache-2.0 | Hugging Face (repackaging) |
| Wan-AI/Wan.2.2-I2V-A14B | 14B | Difusion MoE image-to-video, muestreo completo (20+ pasos) | 81 frames | Apache-2.0 | Hugging Face (oficial) |
| lightx2v/Wan2.2-Lightning | no disponible | LoRAs de destilado para Wan 2.2 | no aplica | Apache-2.0 | Hugging Face |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B (base) | Repack fp8_scaled para ComfyUI | 81 frames | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar calidad o velocidad con alternativas de otros desarrolladores (por ejemplo, modelos de video de otros laboratorios); la comparativa se limita a los componentes del ecosistema Wan 2.2 documentados en la model card.

## Limitaciones y advertencias

- No es un fine-tune propio: el autor indica explicitamente que es un repackaging de pesos oficiales; no hay mejoras de calidad atribuibles a SadikAI en esta version.
- Idiomas limitados a ingles y chino; los prompts en castellano pueden degradar la fidelidad del resultado.
- Duracion de clip corta (81 frames, aproximadamente 5 segundos); clips mas largos requieren mas VRAM y tiempo.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion de video, puede generar movimiento incoherente, deformaciones anatomicas o inconsistencias con la imagen de entrada, especialmente si el prompt contradice la foto.
- Requiere GPU NVIDIA con 24 GB de VRAM recomendados; no funciona en CPU.
- El offload a RAM del sistema reduce drasticamente el rendimiento.
- Dependencia del ecosistema ComfyUI y de las versiones concretas de los nodos; cambios en ComfyUI pueden romper el workflow incluido.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion a Wan-AI, LightX2V y Comfy-Org al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del empaquetado.
- No se documentan sesgos especificos del modelo base en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/sadik-ai-video-wan2.2-fast
- Perfil del autor SadikNawazAI: https://huggingface.co/SadikNawazAI
- Modelo de texto del autor (SadikAI Medium): https://huggingface.co/SadikNawazAI/sadik-ai-medium-multilingual
- Modelo base Wan 2.2 I2V A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- LoRAs Wan2.2-Lightning (LightX2V): https://huggingface.co/lightx2v/Wan2.2-Lightning
- Repack fp8_scaled de Comfy-Org: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Plantillas de workflow de ComfyUI: https://github.com/Comfy-Org/workflow_templates
- Paper de Wan 2.2: https://arxiv.org/abs/2503.20314
