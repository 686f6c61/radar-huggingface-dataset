# bbtmfx/virel-swap-models

## Resumen

`bbtmfx/virel-swap-models` no es un modelo entrenado por su autor, sino un espejo (mirror) sin modificaciones de archivos de modelos con licencia Apache-2.0 organizados en carpetas compatibles con ComfyUI. Su propósito es servir como caché de modelos para instancias de RunPod, de modo que los flujos de trabajo de ComfyUI que dependen de Wan-Animate carguen los pesos desde un repositorio único en lugar de descargarlos de múltiples fuentes.

El contenido principal son los pesos de Wan2.2-Animate-14B (Wan-AI), en una compilación fp8 escalada preparada por Kijai, junto con Wan-Animate-2 de Comfy-Org. Se incluyen además componentes auxiliares: el codificador de texto UMT5-XXL en fp8, el codificador de visión CLIP-ViT-H, el VAE de Wan 2.1 y un LoRA de relight, todos ellos procedentes de los repositorios repackaged de Comfy-Org.

El repositorio ocupa 28,8 GB y su relevancia es puramente operativa: simplifica el aprovisionamiento de entornos de generación de vídeo con animación de personajes sobre ComfyUI. No aporta mejoras de arquitectura ni fine-tuning propio, y no debe citarse como un modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio agrupa pesos de Wan2.2-Animate-14B y componentes auxiliares; el autor no describe la arquitectura) |
| Parametros totales | 14B (correspondientes a Wan2.2-Animate-14B; el resto de componentes no se cuantifica en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 scaled (build de Kijai); UMT5-XXL en fp8; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible de forma explicita; el contenido esta organizado en carpetas de ComfyUI y el tamano del repo es de 28,8 GB |

## Arquitectura y entrenamiento

El autor no entrena ni modifica ningún modelo: el repositorio es un espejo literal de pesos publicados por terceros. La pieza central es Wan2.2-Animate-14B, un modelo de la familia Wan orientado a animación de personajes (transferencia de movimiento y reenactment sobre imagen o vídeo), en la compilación fp8 escalada de Kijai. Se añade Wan-Animate-2 de Comfy-Org y un conjunto de dependencias de inferencia: UMT5-XXL fp8 como codificador de texto, CLIP-ViT-H como codificador de visión, el VAE de Wan 2.1 y un LoRA de relight.

También se incluye un LoRA de destilación por pasos de lightx2v, pensado para reducir el número de pasos de muestreo en la generación. No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si los modelos originales emplearon RLHF o DPO; esos detalles corresponden a las model cards de Wan-AI y Comfy-Org, no a este repositorio.

## Capacidades

- Generación y animación de vídeo: los pesos de Wan2.2-Animate-14B permiten animar personajes a partir de una referencia de movimiento, según la funcionalidad descrita por el autor al citar el modelo original.
- Integración con ComfyUI: los archivos están dispuestos en la estructura de carpetas que espera ComfyUI, lo que facilita su carga directa en flujos de trabajo.
- Codificación de texto multilingüe potencial: se incluye UMT5-XXL, aunque el repositorio no declara idiomas soportados.
- Codificación de visión: CLIP-ViT-H disponible como componente auxiliar.
- Relighting: se incluye un LoRA de relight para modificar la iluminación del resultado.
- Muestreo acelerado: el LoRA de destilación por pasos de lightx2v permite reducir pasos de inferencia.
- Tool calling, agentes, razonamiento multi-step, thinking mode, audio: no disponible / no aplicable a este repositorio.

## Casos de uso

- Aprovisionamiento de RunPod: usar el repositorio como caché única para instanciar pods con ComfyUI y evitar descargas repetidas desde varios repositorios de Hugging Face; el tamaño de 28,8 GB hace viable un precargado en el volumen del pod.
- Animación de personajes en producción de vídeo: cargar Wan2.2-Animate-14B fp8 en ComfyUI para generar clips animados a partir de una imagen de referencia y una secuencia de movimiento, aprovechando la compilación fp8 para reducir requisitos de VRAM.
- Prototipado de pipelines de reenactment: montar un flujo con el VAE de Wan 2.1 y el codificador UMT5-XXL incluidos para experimentar con transferencia de movimiento sin resolver dependencias por separado.
- Ajuste de iluminación en postproducción: aplicar el LoRA de relight incluido para armonizar la iluminación del personaje animado con la escena.
- Iteración rápida con pocos pasos: emplear el LoRA de destilación de lightx2v para generar borradores con menos pasos de muestreo antes de una pasada final de mayor calidad.
- Reproducibilidad de entornos: fijar una versión concreta de los pesos en un repositorio espejo para que los resultados de un equipo sean consistentes entre máquinas y sesiones.
- Evaluación comparativa de compilaciones fp8: contrastar la build fp8 escalada de Kijai con los pesos originales en tareas de animación, manteniendo ambos conjuntos accesibles desde un mismo origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los pesos principales son de 14B en fp8, lo que sitúa el peso de los parámetros en torno a 14 GB, a lo que hay que sumar el codificador de texto UMT5-XXL fp8, CLIP-ViT-H, el VAE y las activaciones durante la generación de vídeo; el total real no está documentado en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada; por el perfil de los modelos Wan-Animate en fp8, el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; el repositorio no confirma que quepa en GPU de consumo con una VRAM determinada.
- Opciones de despliegue: ComfyUI (estructura de carpetas nativa) y, por extensión, entornos que carguen esos formatos; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bbtmfx/virel-swap-models | 14B (Wan2.2-Animate-14B) | no disponible | Apache-2.0 | Hugging Face (mirror) | Espejo sin modificaciones para ComfyUI/RunPod |
| Wan2.2-Animate-14B (Wan-AI) | 14B | no disponible | Apache-2.0 (según el mirror) | Hugging Face (original) | Fuente original de los pesos principales |
| Kijai/WanVideo_comfy_fp8_scaled | 14B (fp8) | no disponible | no disponible en la informacion proporcionada | Hugging Face | Build fp8 escalada que este repo replica |
| Comfy-Org/Wan-Animate-2 | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face | Conjunto repackaged para ComfyUI |

## Limitaciones y advertencias

- No es un modelo original: no aporta entrenamiento, fine-tuning ni mejoras técnicas; cualquier evaluación de calidad debe hacerse sobre los modelos de Wan-AI y Comfy-Org.
- El autor no documenta sesgos, tasas de alucinación ni limitaciones de idioma; esa información debe consultarse en las model cards de origen.
- La licencia Apache-2.0 se hereda de los pesos originales; conviene verificar las condiciones de cada componente (UMT5-XXL, CLIP-ViT-H, VAE, LoRAs) antes de un uso comercial.
- El repositorio mezcla pesos de varios orígenes; un cambio en los repositorios upstream no se refleja automáticamente en el espejo.
- El tamaño de 28,8 GB y la ausencia de documentación sobre requisitos de VRAM complican la planificación de recursos en producción.
- Al ser un mirror con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso ni validación por parte de la comunidad.
- No se declaran idiomas soportados ni pipeline de Hugging Face, lo que limita la integración con herramientas que dependen de esos metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bbtmfx/virel-swap-models
- Wan2.2-Animate-14B (Wan-AI): no se proporciona URL directa en la información disponible
- Kijai/WanVideo_comfy_fp8_scaled: https://huggingface.co/Kijai/WanVideo_comfy_fp8_scaled
- Comfy-Org/Wan-Animate-2: https://huggingface.co/Comfy-Org/Wan-Animate-2
- Comfy-Org/Wan_2.2_ComfyUI_Repackaged: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- lightx2v (LoRA de destilación por pasos): no se proporciona URL directa en la información disponible
