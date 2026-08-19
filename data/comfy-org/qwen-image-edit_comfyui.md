# Comfy-Org/Qwen-Image-Edit_ComfyUI

## Resumen

Este repositorio, publicado por Comfy-Org, contiene un conjunto de archivos de modelo reempaquetados para su uso directo en ComfyUI, correspondientes a la familia Qwen-Image Edit. No es el modelo original en sí, sino una distribución que facilita la integración de varios checkpoints y LoRAs en el ecosistema de ComfyUI. Los archivos provienen de repositorios de terceros (dx8152 y lrzjason) y cubren distintas variantes de edición de imágenes basadas en difusión, como migración de iluminación, múltiples ángulos, fusión, reiluminación y conversión de cualquier objeto a realista.

El modelo subyacente, Qwen-Image Edit, es un modelo de difusión para edición de imágenes desarrollado por Alibaba (Qwen). Este repositorio en concreto no aporta documentación técnica sobre arquitectura, parámetros o entrenamiento, por lo que gran parte de las especificaciones deben consultarse en los repositorios originales. La relevancia de esta distribución radica en su facilidad de despliegue: los archivos están listos para colocarse en las carpetas correspondientes de ComfyUI y usarse con los nodos estándar de difusión.

El repositorio tiene un tamaño de 267,7 GB e incluye múltiples variantes de cuantización (bf16, fp8, int8) y seis LoRAs específicos para tareas concretas. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para edición de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de difusión, no texto) |
| Tipos de cuantizacion | bf16, fp8 (e4m3fn y mixed), int8 (convrot) |
| Idiomas soportados | no disponible (probablemente multilingüe, pero sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos de modelo y LoRAs) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en este repositorio. Se trata de un modelo de difusión para edición de imágenes, presumiblemente basado en una arquitectura de difusión latente similar a la familia Qwen-Image. Los archivos incluidos corresponden a diferentes checkpoints (fechas 2509 y 2511) y a LoRAs entrenados para tareas específicas. No hay datos sobre el dataset de entrenamiento, número de tokens o técnicas de alineación (RLHF, DPO, etc.) en la información proporcionada.

## Capacidades

- Edición de imágenes mediante instrucciones en lenguaje natural (implícito por el nombre del modelo).
- Soporte de LoRAs específicos para tareas concretas:
  - Migración de iluminación (Light Migration).
  - Generación de múltiples ángulos (Multiple angles).
  - Fusión de imágenes (Fusion).
  - Reiluminación (Relight).
  - Conversión de cualquier objeto a realista (Anything2Real).
  - Transformación de fondo blanco a escena (White to Scene).
- Integración directa con ComfyUI mediante archivos listos para colocar en las carpetas `models/diffusion_models` y `models/loras`.
- Disponibilidad de múltiples cuantizaciones (bf16, fp8, int8) para adaptarse a distintos requisitos de VRAM.

## Casos de uso

- Edición fotográfica profesional: aplicar cambios de iluminación, fondo o composición a imágenes existentes mediante prompts, usando los LoRAs de reiluminación o migración de luz.
- Generación de vistas alternativas: el LoRA de múltiples ángulos permite crear diferentes perspectivas de un mismo objeto o escena, útil para catálogos de producto o diseño.
- Fusión de imágenes: combinar dos o más imágenes en una sola composición coherente, aplicable en diseño gráfico y publicidad.
- Conversión de objetos a realistas: transformar bocetos, modelos 3D o imágenes sintéticas en representaciones fotorrealistas, útil en arquitectura y videojuegos.
- Postproducción de fotografía de estudio: eliminar fondos blancos y reemplazarlos por escenas generadas, mediante el LoRA White to Scene.
- Experimentación en investigación: usar el modelo como base para fine-tuning o evaluación de técnicas de edición de imágenes, gracias a la licencia Apache 2.0 y la disponibilidad de pesos en varios formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales en el repositorio.
- Dado el tamaño del repositorio (267,7 GB) y la presencia de archivos en bf16, se recomienda al menos 24 GB de VRAM para los checkpoints completos en fp16/bf16. Las versiones fp8 e int8 pueden funcionar con 16 GB o menos, dependiendo de la resolución de salida.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para cargas de trabajo intensivas.
- La integración con ComfyUI implica que el modelo se ejecuta mediante los nodos estándar de difusión; no se mencionan servidores de inferencia como vLLM o TGI, que son más apropiados para modelos de lenguaje.
- Para uso en producción, se requiere un pipeline de ComfyUI configurado con los LoRAs adecuados y una GPU con suficiente memoria para la resolución de imagen deseada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de edición de imágenes (p. ej., InstructPix2Pix, Stable Diffusion Edit, etc.) en términos de rendimiento o parámetros. La falta de datos oficiales de benchmarks y arquitectura impide una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado de archivos de terceros; no incluye documentación técnica del modelo original, por lo que se debe acudir a los repositorios fuente para conocer limitaciones específicas.
- No se garantiza la compatibilidad con todas las versiones de ComfyUI; se recomienda verificar la versión de los nodos y del entorno.
- Los LoRAs están entrenados para tareas concretas; su uso fuera de ese ámbito puede producir resultados no deseados.
- La licencia Apache 2.0 permite uso comercial, pero los modelos originales pueden tener condiciones adicionales (revisar los repositorios de dx8152 y lrzjason).
- Al ser un modelo de difusión, el riesgo de alucinación visual (generar detalles inexistentes) está presente, especialmente con prompts ambiguos.
- No se proporcionan métricas de sesgo o seguridad; se recomienda auditar el modelo antes de usarlo en aplicaciones sensibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/Qwen-Image-Edit_ComfyUI
- Modelo original Light Migration: https://huggingface.co/dx8152/Qwen-Edit-2509-Light-Migration/
- Modelo original Multiple angles: https://huggingface.co/dx8152/Qwen-Edit-2509-Multiple-angles
- Modelo original Fusion: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Fusion
- Modelo original Relight: https://huggingface.co/dx8152/Qwen-Image-Edit-2509-Relight
- Modelo original Anything2Real: https://huggingface.co/lrzjason/QwenEdit-Anything2Real_Alpha/
