# Alanzblenk/Wan_2.2_ComfyUI_Repackaged

## Resumen

Este repositorio es un reempaquetado de la familia de modelos Wan 2.2 de generación de vídeo, organizado para su uso directo con ComfyUI. El autor (Alanzblenk) ha consolidado los pesos de múltiples modelos base —incluyendo las variantes de Wan-AI, los modelos Fun de Alibaba PAI, ChronoEdit de NVIDIA y las LoRAs de destilación de LightX2V— en una estructura de directorios lista para copiar en la instalación de ComfyUI. El repositorio original de referencia es Comfy-Org/Wan_2.2_ComfyUI_Repackaged, del cual esta versión parece ser una redistribución.

La familia Wan 2.2 cubre múltiples tareas de generación de vídeo: texto a vídeo (T2V), imagen a vídeo (I2V), sujeto a vídeo (S2V), texto más imagen a vídeo (TI2V), animación, edición de vídeo (ChronoEdit), control de cámara, inpainting y VACE. Los modelos principales tienen 14B y 5B parámetros, con variantes de ruido alto y bajo para generación en dos etapas, y están disponibles en cuantizaciones fp16, bf16, fp8 e int8. La licencia es Apache 2.0 y el formato de pesos es safetensors.

La relevancia de este repositorio radica en su conveniencia: en lugar de descargar cada modelo por separado desde sus repositorios originales, el desarrollador obtiene un paquete completo con la estructura de carpetas exacta que ComfyUI espera, incluyendo text encoder (UMT5-XXL), VAE y LoRAs de destilación para generación en 4 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para vídeo, con text encoder UMT5-XXL y VAE propio |
| Parametros totales | Variantes de 14B y 5B parámetros (múltiples modelos en el repositorio) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16, bf16, fp8 (scaled), int8 (convrot) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (single-file) |

## Arquitectura y entrenamiento

Wan 2.2 es una familia de modelos de difusión para generación de vídeo desarrollada por Alibaba (Wan-AI) junto con colaboradores como NVIDIA (ChronoEdit) y Alibaba PAI (modelos Fun). La arquitectura es de difusión latente, con un text encoder UMT5-XXL para codificación de texto y un VAE específico de Wan 2.2 (aunque también se incluye el VAE de Wan 2.1 para compatibilidad con flujos de trabajo existentes).

El repositorio incluye dos generaciones de ruido (high noise y low noise) para cada variante, lo que indica un pipeline de generación en dos etapas: primero se genera la estructura global del vídeo con ruido alto y luego se refinan los detalles con ruido bajo. También incluye LoRAs de destilación de LightX2V que permiten reducir los pasos de inferencia a 4, y una LoRA de reiluminación (relight) para la variante Animate. El modelo ChronoEdit de NVIDIA se incluye para tareas de edición de vídeo por instrucciones. Los detalles de entrenamiento (número de tokens, composición del dataset, método de alineación) no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con modelos de 14B parámetros.
- Generación de vídeo a partir de imagen (I2V) con modelos de 14B parámetros.
- Generación de vídeo a partir de sujeto de referencia (S2V) con modelo de 14B.
- Generación de vídeo a partir de texto e imagen combinados (TI2V) con modelo de 5B.
- Animación de imágenes existentes (variante Animate-14B).
- Edición de vídeo mediante instrucciones textuales (ChronoEdit-14B de NVIDIA).
- Control de movimiento de cámara (variantes Fun-Control-Camera).
- Inpainting de vídeo para eliminar o reemplazar objetos (variantes Fun-InP).
- Control fino de composición mediante VACE (variantes Fun-VACE).
- Reiluminación de escenas mediante LoRA específica (Animate-Relight).
- Inferencia acelerada a 4 pasos mediante LoRAs de destilación de LightX2V.
- Pipeline de dos etapas (ruido alto y bajo) para generación progresiva de calidad.

## Casos de uso

- Producción de vídeo publicitario: el modelo T2V de 14B permite generar clips de producto a partir de descripciones textuales, con control de cámara mediante las variantes Fun-Control-Camera para movimientos predefinidos como paneos o zooms, sin necesidad de rodaje.

- Animación de ilustraciones y arte conceptual: la variante Animate-14B, combinada con la LoRA de reiluminación, permite dar vida a imágenes estáticas manteniendo la coherencia del sujeto, útil en preproducción de animación y en la creación de assets para motion graphics.

- Edición de vídeo por instrucciones: ChronoEdit permite modificar vídeos existentes mediante instrucciones textuales, como cambiar el fondo, el estilo o el vestuario de un personaje, sin necesidad de re-renderizar la escena completa. Adecuado para postproducción ágil.

- Postproducción con inpainting: las variantes Fun-InP permiten eliminar o reemplazar objetos dentro de un vídeo, útil para corrección de errores de rodaje, eliminación de elementos no deseados o efectos visuales localizados.

- Generación de storyboards animados: el modelo TI2V de 5B es ligero y adecuado para generar storyboards animados rápidos combinando texto e imagen, acelerando la fase de previsualización en estudios de animación y agencias.

- Creación de contenido para redes sociales: la destilación a 4 pasos con las LoRAs de LightX2V permite generar clips cortos de forma interactiva, adecuado para creadores que necesitan iterar rápidamente sobre conceptos con una GPU de consumo.

- Investigación en generación de vídeo: al ser Apache 2.0 y estar disponible en cuantizaciones fp8 e int8, el repositorio permite a investigadores experimentar con generación de vídeo en GPUs de consumo, y la estructura ComfyUI facilita la creación de flujos de trabajo personalizados y reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio es un reempaquetado de pesos y no incluye evaluaciones comparativas propias.

## Requisitos de hardware

- El repositorio completo ocupa 728.7 GB, por lo que se recomienda descargar solo los archivos necesarios para la tarea específica.
- Los modelos de 14B en bf16/fp16 requieren aproximadamente 28-30 GB de VRAM para inferencia.
- Los modelos de 14B en fp8 reducen el requisito a unos 14-16 GB de VRAM.
- La variante de 5B (TI2V) ocupa aproximadamente 10 GB en fp16, viable en GPUs de consumo con 12-16 GB de VRAM.
- El modelo Animate-14B en int8 (convrot) está diseñado para reducir el uso de memoria en tareas de animación.
- Según la guía de instalación de ComfyUI encontrada en la búsqueda web, es posible ejecutar Wan 2.2 con 8 GB de VRAM utilizando modelos en formato GGUF (no incluidos en este repositorio).
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para las variantes de 14B en fp16/bf16; RTX 3090 o superior para las variantes fp8.
- Opciones de despliegue: ComfyUI como plataforma principal; los pesos pueden convertirse a GGUF para llama.cpp u Ollama si se desea usar fuera de ComfyUI.
- La destilación a 4 pasos con las LoRAs de LightX2V reduce significativamente la latencia de generación frente a los 20-50 pasos habituales.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Licencia | Formato |
|---|---|---|---|---|
| Wan 2.2 (este repositorio) | 14B / 5B | T2V, I2V, S2V, animación, edición, control | Apache 2.0 | Safetensors |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B / 5B | Mismo conjunto de modelos | Apache 2.0 | Safetensors |
| Wan-AI/Wan2.2-T2V-A14B (original) | 14B | T2V | Apache 2.0 | Safetensors |
| alibaba-pai/Wan2.2-Fun-A14B-Control | 14B | T2V con control | Apache 2.0 | Safetensors |

Nota: este repositorio es una redistribución de los modelos originales de Wan-AI, Alibaba PAI y NVIDIA. No existen diferencias funcionales respecto a los repositorios originales, salvo la estructura de directorios preconfigurada para ComfyUI.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado de terceros (Alanzblenk), no el repositorio oficial de Comfy-Org. Se recomienda verificar la integridad de los archivos antes de su uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y su fecha de creación (2026-08-29) es inusual, lo que sugiere que puede ser un repositorio reciente o de baja confianza.
- El tamaño total del repositorio (728.7 GB) hace impracticable la descarga completa; se recomienda descargar solo los componentes necesarios.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto de los modelos subyacentes en esta model card.
- La licencia Apache 2.0 permite uso comercial, pero se deben verificar los términos de cada modelo base original (Wan-AI, Alibaba PAI, NVIDIA) por si existen restricciones adicionales.
- No se proporcionan datos de entrenamiento, composición del dataset ni metodología de alineación en la información disponible.
- Los modelos de 14B requieren hardware de gama alta para tiempos de inferencia razonables; la generación de vídeo es computacionalmente intensiva y no es adecuada para despliegue en tiempo real.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Alanzblenk/Wan_2.2_ComfyUI_Repackaged
- Repositorio original de referencia: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Modelos base originales:
  - https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
  - https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
  - https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
  - https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
  - https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
  - https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
  - https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
  - https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Ejemplos de flujos de trabajo ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Guía de instalación (itch.io): https://itch.io/blog/1009842/wan22-full-installation-guide-for-comfyui-8gb-vram-ready
- ModelScope (copia del repositorio): https://www.modelscope.cn/models/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- OpenCSG (copia del repositorio): https://opencsg.com/models/AIWizards/Wan_2.2_ComfyUI_Repackaged
