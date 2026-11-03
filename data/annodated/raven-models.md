# annodated/raven-models

## Resumen

`raven-models` no es un modelo de lenguaje en el sentido estricto, sino un repositorio de artefactos de inferencia para ComfyUI publicado por el usuario `annodated` bajo el identificador `annodated/raven-models`. La model card lo describe como un "almacén privado de modelos para pods de Raven AIO", es decir, un contenedor de ficheros (checkpoints base, UNet/diffusion models, text encoders, VAEs, LoRAs, upscalers, ControlNet, nodos personalizados y workflows) organizado con la misma estructura de carpetas que usa ComfyUI en su directorio `models/`. Su función es permitir que un proceso automatizado coloque cada fichero en la ruta correcta del pod sin intervención manual.

El repositorio ocupa 18,3 GB y fue creado el 29 de octubre de 2026, con última actualización el 3 de noviembre de 2026. No declara pipeline, licencia ni idiomas soportados, y no tiene descargas ni likes en el momento de la consulta. La model card menciona explícitamente modelos como Krea 2, Qwen Image y Wan, además de encoders de texto del tipo `qwen3vl`, `umt5` y `t5`, lo que sitúa el contenido en el ámbito de la generación de imágenes y vídeo con difusión, no en el de modelos de lenguaje autoregresivos.

Por tanto, esta ficha debe leerse como la descripción de un paquete de distribución de pesos para pipelines de difusión en ComfyUI, y no como la de un modelo con arquitectura, entrenamiento y benchmarks propios. La mayor parte de los campos técnicos habituales (parámetros, contexto, cuantización, evaluación) no son aplicables o no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor de artefactos para ComfyUI; incluye modelos de difusión tipo UNet y text encoders, sin arquitectura única) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (el repositorio aloja pesos en formatos nativos de ComfyUI, p. ej. `.safetensors` y `.pth`; no se documentan variantes GGUF ni cuantizaciones del propio paquete) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.safetensors` (LoRAs, checkpoints, encoders), `.pth` (upscalers ESRGAN), `.zip`/`.7z` (custom nodes), `.json` (workflows) |
| Tamaño del repositorio | 18,3 GB |
| Pipeline declarado | no disponible |
| Estructura de carpetas | `diffusion_models/`, `text_encoders/`, `vae/`, `loras/`, `upscale_models/`, `clip_vision/`, `controlnet/`, `checkpoints/`, `ultralytics/`, `custom_nodes/`, `workflows/` |

## Arquitectura y entrenamiento

No existe una arquitectura ni un proceso de entrenamiento propios asociados a este identificador. El repositorio actúa como espejo de un directorio `models/` de ComfyUI: agrupa pesos de terceros (modelos base o UNet como Krea 2, Qwen Image y Wan, encoders de texto como `qwen3vl`, `umt5` y `t5`, VAEs, LoRAs organizadas en subcarpetas como `loras/Wan22/`, upscalers estilo ESRGAN en `.pth`, ControlNet, modelos de segmentación Ultralytics y paquetes de nodos personalizados). La model card no aporta información sobre tokens de entrenamiento, composición de datasets ni técnicas de alineación (RLHF/DPO), porque esos datos corresponden a los modelos originales alojados, no al contenedor.

La única "innovación" documentada es operativa: la convención de rutas. Cada carpeta del repositorio se corresponde 1:1 con una carpeta de destino en el pod (`models/diffusion_models/`, `models/text_encoders/`, etc.), de modo que una herramienta de sincronización puede copiar los ficheros a su ubicación final sin ambigüedad. Los `custom_nodes` se distribuyen comprimidos y se descomprimen en `custom_nodes/`, y los `workflows` en `.json` se incorporan a la lista de workflows de ComfyUI. La subida se realiza con la CLI de Hugging Face, por ejemplo `hf upload annodated/raven-models ./my_lora.safetensors loras/my_lora.safetensors`.

## Capacidades

- Distribución de pesos de difusión para ComfyUI: aloja checkpoints base, UNet y modelos de difusión (Krea 2, Qwen Image, Wan) listos para colocarse en `models/diffusion_models/`.
- Distribución de text encoders: CLIP, `qwen3vl`, `umt5` y `t5`, destinados a `models/text_encoders/`.
- Distribución de VAEs para decodificación de latentes en pipelines de imagen y vídeo.
- Gestión de LoRAs con preservación de subcarpetas (por ejemplo `loras/Wan22/`), lo que permite organizar adaptadores por familia de modelo.
- Upscalers estilo ESRGAN en formato `.pth` para `models/upscale_models/`.
- Soporte de `clip_vision/`, `controlnet/`, `checkpoints/` y `ultralytics/` con la misma lógica de correspondencia de rutas.
- Instalación de nodos personalizados de ComfyUI desde archivos `.zip` o `.7z`, que se descomprimen automáticamente en `custom_nodes/`.
- Despliegue de workflows de ComfyUI en formato `.json` directamente en la lista de workflows de la interfaz.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Aprovisionamiento automatizado de pods de ComfyUI: un script de arranque sincroniza el repositorio y deja cada peso en su carpeta (`models/diffusion_models/`, `models/vae/`, etc.), eliminando la configuración manual de rutas en cada instancia nueva.
- Plantillas reproducibles de entorno: al fijar una revisión concreta del repositorio se obtiene un conjunto de pesos y nodos determinista, útil para replicar un pipeline de imagen o vídeo entre máquinas de desarrollo y producción.
- Distribución interna de LoRAs de equipo: las subcarpetas por familia (`loras/Wan22/`) permiten separar adaptadores de vídeo y de imagen sin renombrar ficheros, y la CLI de Hugging Face sirve como mecanismo de publicación versionada.
- Despliegue de workflows listos para usar: los `.json` incluidos en `workflows/` aparecen en la lista de ComfyUI, de modo que un usuario puede cargar un grafo completo (modelo, encoder, VAE y LoRAs) sin reconstruirlo a mano.
- Instalación de nodos personalizados en entornos efímeros: los `.zip`/`.7z` de `custom_nodes/` se descomprimen en el arranque, lo que simplifica la preparación de pods que se destruyen y recrean con frecuencia.
- Cadena de upscaling en producción de imagen: los upscalers ESRGAN en `.pth` se colocan en `models/upscale_models/` y quedan disponibles para etapas de superresolución dentro del grafo de ComfyUI.
- Segmentación y preprocesado con Ultralytics: los pesos de `ultralytics/` habilitan pasos de detección o máscaras previos a la generación dentro del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad, FID, CLIP score ni evaluaciones de los modelos que aloja, y al no ser un modelo entrenado por el autor no procede comparar rendimiento propio.

## Requisitos de hardware

- VRAM estimada: no disponible para el repositorio en conjunto; depende enteramente de qué modelo de difusión se cargue desde `diffusion_models/` o `checkpoints/`. El tamaño total del repo (18,3 GB) es de almacenamiento, no de VRAM.
- GPU recomendadas: no disponible. La idoneidad de A100, H100 o RTX 4090 depende de los pesos concretos de Krea 2, Qwen Image o Wan que se vayan a ejecutar.
- Compatibilidad con GPU de consumo: no disponible; debe evaluarse por modelo individual alojado.
- Opciones de despliegue: ComfyUI como destino principal (estructura de carpetas y workflows); la sincronización se realiza con la CLI de Hugging Face (`hf upload`/`hf download`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Estructura para ComfyUI | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `annodated/raven-models` | Pesos de difusión, encoders, VAEs, LoRAs, nodos y workflows | 18,3 GB | Sí, correspondencia 1:1 con `models/` | no disponible | Aprovisionamiento de pods Raven AIO |
| Repositorios oficiales de pesos (p. ej. orgs de Krea, Qwen, Wan) | Modelo individual con su model card, licencia y evaluación | Variable por modelo | No | Definida por cada autor | Uso general del modelo |
| Repositorios de LoRAs de la comunidad en Hugging Face | Adaptadores sueltos | Variable | No | Variable | Ajuste fino de estilo o concepto |

No se dispone de información sobre otros repositorios comparables de aprovisionamiento para ComfyUI en los datos proporcionados; la comparación con los pesos originales solo puede establecerse a nivel de procedencia, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K) ni usarse para generación de texto, razonamiento o código.
- Licencia no declarada: al no especificarse, no puede asumirse permiso de uso comercial. Cada peso alojado (Krea 2, Qwen Image, Wan, encoders, LoRAs) conserva la licencia de su autor original, que debe verificarse por separado antes de cualquier despliegue en producción.
- Ausencia de model card técnica: no hay información sobre procedencia exacta, versiones ni hashes de los ficheros, lo que dificulta la auditoría y la reproducibilidad a largo plazo.
- Riesgo de seguridad en `custom_nodes/`: los nodos personalizados se distribuyen como archivos comprimidos que se descomprimen y ejecutan dentro de ComfyUI; sin verificación de integridad ni revisión de código, introducen superficie de ataque en el pod.
- Riesgo de seguridad en `ultralytics/` y `.pth`: los pesos en formato pickle (`.pth`) pueden ejecutar código arbitrario al cargarse; deben tratarse como no confiables salvo verificación.
- Sin métricas de calidad: no hay evaluación de los modelos alojados, por lo que la idoneidad para una tarea concreta debe validarse empíricamente.
- Cero descargas y cero likes en el momento de la consulta: no existe validación de la comunidad ni señales de uso que respalden la calidad del contenido.
- Idiomas no disponibles: la cobertura multilingüe depende de los text encoders incluidos (`qwen3vl`, `umt5`, `t5`), no del repositorio.
- Fechas de creación y actualización (2026) posteriores a la mayoría de referencias públicas de los modelos citados: conviene verificar que las versiones alojadas corresponden a las esperadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/annodated/raven-models
- ComfyUI (repositorio oficial): https://github.com/comfyanonymous/ComfyUI
- Documentación de la CLI de Hugging Face (`hf`): https://huggingface.co/docs/huggingface_hub/guides/cli
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales asociados a `annodated/raven-models`.
