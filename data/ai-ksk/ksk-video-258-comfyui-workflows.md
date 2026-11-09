# AI-KSK/ksk-video-258-comfyui-workflows

## Resumen

AI-KSK/ksk-video-258-comfyui-workflows no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a la generación y edición de vídeo largo con identidad estable. El autor lo presenta como "EverAnimate: Making WanAnimate Survive Past Twenty Seconds", es decir, una adaptación práctica de WanAnimate (el pipeline de animación de vídeo de la familia Wan 2.2) que consigue mantener la identidad del sujeto más allá de los 20 segundos mediante memoria latente distribuida en tres etapas. El repositorio lo publica el usuario AI-KSK bajo licencia "other" y contiene únicamente documentación y grafos, no pesos.

El interés técnico reside en la orquestación: los grafos combinan el modelo de difusión Wan2.2 Animate 14B en fp8, el codificador de texto umt5-xxl en fp8, el VAE de Wan2.1 y el estimador de pose SDPose, junto con nueve LoRAs (incluidas tres LoRAs de etapa) y un sampler LCM a 4 pasos con CFG 1. Se ofrecen dos grafos: uno de generación (66 nodos) y otro de edición (79 nodos), seleccionables mediante un booleano.

Es relevante ahora porque aborda uno de los cuellos de botella prácticos de los modelos de animación por pose: la deriva de identidad en secuencias largas. Al empaquetar la configuración completa (resolución 1280x720 a 25 fps, backend de pose por índice, derivación automática del número de bucles) en grafos importables, reduce la barrera de entrada para quien quiera reproducir el pipeline sin reconstruirlo desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo propio; pipeline de difusión de vídeo Wan2.2 Animate 14B orquestado en ComfyUI (grafo de nodos) |
| Parametros totales | 14B (modelo base Wan2.2 Animate referenciado en el grafo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (vídeo largo por memoria latente en tres etapas; duración objetivo superior a 20 s) |
| Tipos de cuantizacion | fp8 (Wan2.2 Animate 14B fp8 scaled e4m3fn; umt5-xxl fp8); SDPose en fp16 |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | No aplica al repositorio (0.0 GB, sin pesos); los grafos referencian checkpoints externos en formato ComfyUI (safetensors para el modelo, LoRAs y VAE) |

## Arquitectura y entrenamiento

El repositorio no entrena ni distribuye un modelo. Lo que contiene son dos grafos de ComfyUI que encadenan componentes preexistentes: el modelo de difusión Wan2.2 Animate 14B en versión fp8 scaled e4m3fn (checkpoint `Wan2_2_Animate_14B_fp8_scaled_e4m3fn_KJ_v2_20260511`), el text encoder umt5-xxl en fp8, el VAE de Wan2.1 y el estimador de pose `sdpose_wholebody_fp16`. Sobre esa base se aplican nueve LoRAs, entre ellas tres LoRAs de etapa que implementan el mecanismo de memoria latente a lo largo de tres fases, que es lo que permite sostener la identidad más allá de los 20 segundos.

La innovación declarada es precisamente esa memoria latente en tres etapas combinada con un muestreo muy agresivo: 4 pasos con CFG 1 usando el sampler `lcm`. No se documentan en la información disponible los datos de entrenamiento del modelo base, ni si hubo RLHF/DPO, ni detalles sobre la composición del dataset de WanAnimate. Tampoco se especifica la implementación interna de las LoRAs de etapa ni su rango o parámetros de entrenamiento.

## Capacidades

- Generación de vídeo animado por pose a partir de referencias, con identidad estable en secuencias que superan los 20 segundos.
- Edición de vídeo de referencia mediante un grafo específico (79 nodos) activado con un booleano sobre el grafo de generación.
- Control de pose con backend seleccionable por índice; SDPose recomendado para movimiento complejo.
- Salida configurable a 1280x720 y 25 fps, con número de bucles derivado de la expresión.
- Aplicación de nueve LoRAs sobre el modelo de 14B, incluidas las tres LoRAs de etapa.
- Muestreo rápido con LCM a 4 pasos y CFG 1.
- Soporte de idioma inglés en la documentación y los prompts del pipeline.
- No se documentan tool calling, function calling, agentes ni capacidades multimodales de texto más allá del acondicionamiento por umt5-xxl.

## Casos de uso

- Producción de vídeo largo con personaje consistente: usar el grafo de generación con memoria latente en tres etapas para mantener la identidad del sujeto en clips de más de 20 segundos, donde un pipeline de una sola pasada derivaría.
- Animación de retratos o figuras a partir de una referencia y una secuencia de pose: seleccionar SDPose como backend para movimientos complejos y fijar 1280x720 a 25 fps.
- Edición de vídeo de referencia: activar el grafo de edición (79 nodos) mediante el booleano para modificar una secuencia existente conservando la identidad del sujeto.
- Previsualización rápida de ideas: gracias al muestreo LCM a 4 pasos con CFG 1, generar borradores con coste computacional bajo antes de un render final.
- Integración en un estudio de animación basado en ComfyUI: importar el grafo y sustituir checkpoints o LoRAs según el proyecto, reutilizando la lógica de tres etapas.
- Reproducción de investigación sobre memoria latente en difusión de vídeo: usar los grafos como referencia ejecutable para experimentar con la estabilidad de identidad en secuencias largas.
- Automatización de contenido con pose transfer: encadenar el grafo en un pipeline de ComfyUI para generar variaciones de un mismo personaje con distintas secuencias de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor advierte que "nueve LoRAs sobre un modelo de 14B es un compromiso de VRAM", lo que sitúa el requisito muy por encima de una GPU de consumo de gama media.
- El modelo base Wan2.2 Animate 14B en fp8, junto con umt5-xxl fp8, el VAE y nueve LoRAs, exige previsiblemente GPUs de 24 GB o más; no se confirma una cifra concreta en la información disponible.
- GPU recomendadas: no disponible. Por tamaño y cuantización, el rango realista son A100/H100 o RTX 4090/A6000, pero el autor no lo especifica.
- Despliegue: ComfyUI (importación directa de los grafos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles. El uso de LCM a 4 pasos con CFG 1 sugiere un coste de muestreo reducido por etapa, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-258-comfyui-workflows | 14B (base Wan2.2 Animate) | Vídeo largo >20 s con memoria latente en 3 etapas | Grafos ComfyUI sobre WanAnimate | other | Hugging Face (0 descargas, 0 likes) |
| Wan2.2 Animate (oficial) | 14B | No disponible | Animación por pose oficial | No disponible | Pesos oficiales de la familia Wan |
| Alternativas de animación por pose en ComfyUI | No disponible | No disponible | Pipelines comunitarios | Variable | Repositorios comunitarios |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La edición de referencia es una adaptación del autor y no la ruta oficialmente soportada del pipeline.
- Las caras pequeñas permanecen borrosas por el presupuesto de píxeles, incluso a 1280x720.
- Cargar nueve LoRAs sobre un modelo de 14B implica un consumo de VRAM elevado y puede no caber en GPUs de consumo.
- El repositorio no contiene pesos (0.0 GB); depende de checkpoints, LoRAs y VAE externos que el usuario debe obtener por su cuenta.
- Licencia "other": no se detallan los términos, por lo que el uso comercial requiere revisar las condiciones del autor y, en su caso, las del modelo base Wan2.2 Animate.
- Solo se documenta inglés; no hay evidencia de soporte multilingüe.
- Sin descargas ni likes y con fechas de creación y actualización de 2026: el proyecto es muy reciente y sin validación comunitaria, lo que aumenta el riesgo de instrucciones incompletas o de reproducibilidad limitada.
- Riesgo de alucinación visual y de artefactos propios de la difusión de vídeo; no se documentan mitigaciones.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-258-comfyui-workflows
- RunningHub, generación de vídeo largo EverAnimate: https://www.runninghub.ai/post/2063934460369915905/?inviteCode=rh-v1111
- RunningHub, edición de vídeo largo EverAnimate: https://www.runninghub.ai/post/2063900132327907330/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=LYXVVBvu8P0
- Bilibili: https://www.bilibili.com/video/BV1oyET6cEqb
