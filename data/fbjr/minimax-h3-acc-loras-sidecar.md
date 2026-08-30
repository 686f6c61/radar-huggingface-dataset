# fbjr/MiniMax-H3-Acc-LoRAs-sidecar

## Resumen

Este repositorio, publicado por el usuario fbjr, no contiene un modelo de inteligencia artificial independiente, sino una conversión de formato de los LoRAs de aceleración oficiales de MiniMax H3, denominados `MiniMax-H3-Acc-LoRAs` y publicados originalmente por Alibaba PAI. El objetivo es que estos LoRAs de Parallel Decoding Distillation (PDD) puedan aplicarse dentro de ComfyUI mediante un nodo específico, `MiniMaxH3PDDLoRA`, que también se distribuye en este mismo repositorio.

MiniMax H3 es un modelo de generación de video y audio sincronizados a partir de texto, desarrollado por MiniMax. Los LoRAs de aceleración permiten reducir el número de pasos de muestreo de 50 (típico) a 8 o incluso 4, eliminando la necesidad de classifier-free guidance (CFG), lo que supone una reducción significativa del coste computacional. Este sidecar es relevante porque facilita el uso de dicha aceleración en el ecosistema ComfyUI, que es uno de los entornos más utilizados por la comunidad de generación de video.

El repositorio incluye cuatro archivos `.safetensors` que corresponden a dos particiones del modelo (FL2VA y Ref2VA) y dos variantes de compatibilidad con checkpoints (pruned o no pruned). Además, incluye el nodo de ComfyUI necesario y cuatro workflows de ejemplo. No se ha entrenado nada nuevo: todos los tensores provienen de la release oficial de Alibaba PAI, solo se ha modificado la estructura de archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de aceleración (Parallel Decoding Distillation) para MiniMax H3, modelo base de video y audio |
| Parametros totales | No disponible (los archivos pesan entre 1069 MiB y 1594 MiB, pero no se indica el número de parámetros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los archivos están en precisión fp16/bf16, sin cuantización declarada) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria no estándar) |
| Formato de pesos | safetensors (cuatro archivos: dos por partición y compatibilidad) |

## Arquitectura y entrenamiento

El modelo base MiniMax H3 es un modelo de difusión de video y audio que genera contenido sincronizado a partir de prompts de texto. Los LoRAs de aceleración aplican Parallel Decoding Distillation (PDD), una técnica de destilación que entrena adaptadores de bajo rango para que el modelo pueda generar resultados de calidad comparable en 8 o 4 pasos de muestreo, en lugar de los 50 habituales, y sin necesidad de classifier-free guidance. La release original de Alibaba PAI (`alibaba-pai/MiniMax-H3-Acc-LoRAs`) fue entrenada bajo esta técnica sobre el checkpoint MiniMax H3.

Este repositorio sidecar no realiza ningún entrenamiento adicional. El autor ha convertido los pesos de la release oficial a un formato que puede ser cargado por un nodo de ComfyUI. La conversión implica reordenar los tensores para que el nodo `MiniMaxH3PDDLoRA` pueda aplicar las tres mecanismos que el archivo original contiene: el banco de cabezas (head bank), la actualización de modulación y el backbone. Cada archivo incluye además un tensor de huella digital (fingerprint) para que el nodo pueda detectar si se está usando una partición incorrecta.

Los cuatro archivos corresponden a dos particiones del modelo base (FL2VA y Ref2VA) y dos variantes de compatibilidad: una para checkpoints pruned (sin capas de adaptación) y otra para cualquier checkpoint (con adaptación AdaLN de 2688 dimensiones, marcada como `adaln2688`). Todos están configurados para 8 evaluaciones sobre una rejilla de 32 puntos con ancho de bloque 4 y desplazamiento 12.0 para video y 3.0 para audio, que son los valores con los que se destiló la release original.

## Capacidades

- Aceleración de inferencia: reduce el número de pasos de muestreo de 50 a 8 o 4, manteniendo la calidad visual y de audio sin necesidad de classifier-free guidance.
- Generación de video y audio sincronizados: el modelo base MiniMax H3 genera pistas de audio coherentes con las imágenes en movimiento.
- Compatibilidad con ComfyUI: los pesos están formateados para ser cargados por el nodo `MiniMaxH3PDDLoRA`, que además emite la programación de sigmas (SIGMAS) correcta para el muestreo.
- Soporte de dos particiones: FL2VA (video y audio) y Ref2VA (referencia), cada una con sus propios LoRAs.
- Flexibilidad de compatibilidad: los archivos `adaln2688` funcionan tanto con checkpoints pruned como sin pruned, mientras que los archivos sin ese sufijo solo funcionan con checkpoints pruned.
- Control de intensidad: se pueden ajustar los parámetros `strength` y `head_strength` para ablaciones o control fino.
- Workflows listos: se incluyen cuatro grafos de ComfyUI para generación de video-audio con 4, 5 y 8 pasos.

## Casos de uso

- Generación rápida de video con audio en ComfyUI: un creador de contenido puede producir clips cortos de video con pista de audio sincronizada en 8 pasos de muestreo en lugar de 50, reduciendo el tiempo de renderizado de minutos a segundos en una GPU de gama alta.
- Prototipado de escenas de diálogo: los workflows incluidos muestran una escena de tres tomas con dos interlocutores; este caso es útil para directores de animación que necesitan iterar rápidamente sobre guiones visuales.
- Reducción de costes en producción: al eliminar el classifier-free guidance y reducir los pasos, el coste por generación baja sustancialmente, lo que permite desplegar servicios de generación de video en entornos con presupuesto limitado.
- Ajuste de calidad frente a velocidad: los usuarios pueden elegir entre 8 pasos (calidad de referencia) y 4 pasos (más rápido pero visiblemente más grueso), según las necesidades del proyecto.
- Investigación en aceleración de modelos de difusión: el repositorio sirve como ejemplo práctico de cómo aplicar Parallel Decoding Distillation a un modelo de video y audio, y cómo integrarlo en un entorno de nodos.
- Creación de contenido multilingüe: aunque no se especifican idiomas, el modelo base MiniMax H3 acepta prompts en varios idiomas; los LoRAs no alteran esta capacidad, por lo que se puede usar para generar video y audio en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La release original de Alibaba PAI menciona que los LoRAs de 8 pasos igualan la calidad de la generación con 50 pasos y CFG, pero no se proporcionan métricas numéricas concretas (PSNR, FVD, CLIP score, etc.) en este repositorio ni en los resultados de búsqueda web.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la documentación proporcionada.
- Los archivos de LoRA pesan entre 1069 MiB y 1594 MiB, por lo que caben en cualquier GPU moderna con más de 4 GB de VRAM, pero el modelo base MiniMax H3 es mucho más grande (varios GB) y requiere una GPU con al menos 16 GB de VRAM para inferencia en fp16.
- Se recomienda una GPU de la serie RTX 3090/4090 o superior (24 GB VRAM) para generar video de alta resolución sin cuantización.
- El despliegue se realiza dentro de ComfyUI, que gestiona la carga de modelos y LoRAs. No se mencionan opciones de despliegue en vLLM, llama.cpp u otros servidores de inferencia.
- La latencia depende del número de pasos: 8 pasos es la referencia destilada, 4 pasos es el modo más rápido. No se proporcionan cifras exactas de throughput.

## Comparativa con modelos similares

| Modelo/Recurso | Tipo | Pasos | Requisito adicional | Licencia |
|---|---|---|---|---|
| `fbjr/MiniMax-H3-Acc-LoRAs-sidecar` (este) | LoRAs PDD convertidos para ComfyUI | 8 o 4 | Nodo `MiniMaxH3PDDLoRA` incluido | Comunitaria MiniMax |
| `alibaba-pai/MiniMax-H3-Acc-LoRAs` (original) | LoRAs PDD oficiales | 8 o 4 | Requiere código de VideoX-Fun o integración propia | Comunitaria MiniMax |
| MiniMax H3 Turbo (release oficial) | Modelo destilado completo | 4 | Ninguno | Comunitaria MiniMax |

La principal diferencia es la integración con ComfyUI: este sidecar elimina la barrera de tener que escribir código Python personalizado para aplicar los LoRAs. Frente a Turbo (que es un modelo completo destilado), estos LoRAs se aplican sobre el checkpoint base MiniMax H3, lo que permite conservar los pesos originales y cambiar entre modos de aceleración sin cargar modelos distintos.

## Limitaciones y advertencias

- Los archivos no funcionan por sí solos: sin el nodo `MiniMaxH3PDDLoRA`, un cargador de LoRA estándar aplicará solo el backbone y omitirá silenciosamente el banco de cabezas y la actualización de modulación, produciendo resultados plausibles pero de calidad incorrecta.
- Es fundamental emparejar la partición correcta: un LoRA de FL2VA sobre un checkpoint Ref2VA (o viceversa) cargará sin errores de claves no coincidentes, pero generará video con estructuras anómalas. El nodo incluye una verificación de huella digital para rechazar esta combinación.
- Los archivos `adaln2688` son 525 MiB más grandes que los pruned, pero son la opción segura si no se sabe qué checkpoint se tiene.
- No se debe copiar el nodo desde dos fuentes distintas (el repositorio sidecar y el repo de GitHub `ComfyUI-h3-explorations`), ya que ComfyUI registra los nodos en un diccionario y el segundo cargado reemplaza silenciosamente al primero.
- La licencia es la `minimax-h3-community-license-agreement`, que no es una licencia open source estándar (no es MIT, Apache ni similar). Hay que revisar sus términos antes de usar el modelo en proyectos comerciales.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, ya que estos dependen del modelo base MiniMax H3, no de los LoRAs.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/fbjr/MiniMax-H3-Acc-LoRAs-sidecar
- Release original de Alibaba PAI: https://huggingface.co/alibaba-pai/MiniMax-H3-Acc-LoRAs
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio fuente del nodo: https://github.com/fblissjr/ComfyUI-h3-explorations
- Nodo alternativo ComfyUI-MiniMax-H3-PDD-Acc: https://github.com/Jalen-Brunson/ComfyUI-MiniMax-H3-PDD-Acc
- Demo Space de MiniMax-H3-Acc-LoRAs: https://huggingface.co/spaces/mezroui/MiniMax-H3-Acc-LoRAs-demo
- Artículo en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-26-minimax-h3-pdd-acc-lora
- Documentación de MiniMax H3 LoRA: https://minimax3.org/minimax-h3-lora
