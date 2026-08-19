# Comfy-Org/stable-diffusion-v1-5-archive

## Resumen

Stable Diffusion v1.5 Archive es un repositorio de respaldo (archive) que reempaqueta los archivos del modelo Stable Diffusion v1.5, originalmente publicado por RunwayML y retirado posteriormente de HuggingFace. El responsable de este re-upload es Comfy-Org, la organización detrás del popular interfaz de nodos ComfyUI, que lo distribuye para facilitar la descarga y uso del modelo en dicha herramienta. El modelo fue lanzado originalmente en 2022 y representa una generación anterior a los modelos actuales de difusión, pero se conserva por motivos técnicos y de accesibilidad, especialmente para pruebas de compatibilidad con sistemas legacy.

Se trata de un modelo de difusión de imágenes (text-to-image) basado en la arquitectura original de Stable Diffusion v1.5, que a su vez deriva de Stable Diffusion v1.4 de CompVis. El repositorio incluye dos archivos principales: `v1-5-pruned-emaonly.safetensors`, que es idéntico al archivo original subido por RunwayML (con hash exacto), y `v1-5-pruned-emaonly-fp16.safetensors`, una conversión a FP16 con metadatos añadidos. El tamaño total del repositorio es de 19.2 GB. No se proporcionan especificaciones técnicas detalladas en la ficha del modelo, más allá de la licencia (CreativeML OpenRAIL-M), el idioma (inglés) y su origen como fine-tune de CompVis/stable-diffusion-v1-4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (U-Net + VAE + CLIP text encoder) - no se especifican detalles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | FP32 y FP16 (según los archivos incluidos) |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (archivos individuales para checkpoints) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Se sabe que es un modelo de difusión latente, similar al Stable Diffusion v1.5 original, que emplea un U-Net como denoiser, un VAE para codificar y decodificar imágenes al espacio latente, y un codificador de texto CLIP para condicionar la generación. El modelo base indicado es `CompVis/stable-diffusion-v1-4`, lo que sugiere que v1.5 es un fine-tune de esa versión. No se ofrecen datos sobre el dataset de entrenamiento, el número de tokens o el proceso de optimización (RLHF, DPO, etc.). El repositorio actual es un re-empaquetado para ComfyUI, sin modificaciones en los pesos originales.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición y transformación de imágenes mediante técnicas como inpainting, outpainting o img2img (si se usa con las herramientas adecuadas).
- Compatible con ComfyUI, lo que permite construir flujos de trabajo modulares y reproducibles.
- Soporte para diferentes modos de inferencia según el checkpoint elegido (FP32 o FP16).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades propias de modelos de lenguaje.

## Casos de uso

- Pruebas de compatibilidad de sistemas legacy: dado que es un archivo histórico idéntico al original, es útil para verificar que herramientas antiguas o pipelines personalizados sigan funcionando con el modelo exacto.
- Desarrollo de flujos de trabajo en ComfyUI: los archivos están preparados para colocarse directamente en la carpeta `models/checkpoints` de ComfyUI, facilitando su uso en entornos de generación por nodos.
- Investigación académica sobre modelos de difusión de 2022: permite reproducir experimentos o comparar resultados con versiones posteriores.
- Generación de imágenes artísticas y conceptuales: aunque el modelo es antiguo, sigue siendo capaz de producir imágenes de calidad aceptable para ciertos estilos.
- Fine-tuning y personalización: al ser un checkpoint estándar, puede servir como base para entrenamientos adicionales con datasets propios.
- Educación y formación: útil para enseñar los fundamentos de los modelos de difusión en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un archivo de respaldo sin métricas de rendimiento asociadas en su ficha.

## Requisitos de hardware

- El tamaño del repositorio es de 19.2 GB, lo que sugiere que el modelo completo requiere un espacio de almacenamiento considerable.
- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- Para inferencia con el checkpoint FP32, se estima que se necesitan al menos 8-10 GB de VRAM (basado en el tamaño típico de Stable Diffusion v1.5), pero este dato no está confirmado en la documentación.
- La versión FP16 puede reducir el consumo de VRAM, pero no se especifica un valor exacto.
- Opciones de despliegue: el modelo está pensado para ComfyUI, pero también puede usarse con otros frameworks compatibles con checkpoints de Stable Diffusion (por ejemplo, Automatic1111, Diffusers). No se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no son aplicables a modelos de difusión.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Se puede señalar que Stable Diffusion v1.5 es anterior a v2.x y a SDXL, pero no hay datos concretos de rendimiento o especificaciones para establecer una comparación objetiva.

## Limitaciones y advertencias

- Modelo desactualizado: fue lanzado en 2022 y es varias generaciones anterior a los modelos actuales, por lo que su calidad de generación es inferior a la de versiones más recientes.
- Sesgos y alucinaciones: al ser un modelo de difusión entrenado con datos web, puede presentar sesgos de género, raza o cultura, y generar imágenes con errores o artefactos.
- Limitaciones de idioma: la ficha indica solo inglés, aunque en la práctica puede entender otras lenguas, no está garantizado.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero con restricciones (por ejemplo, no usar para actividades ilegales o dañinas). Es necesario revisar los términos completos de la licencia.
- El repositorio es un archivo de respaldo; no se ofrecen garantías de mantenimiento ni soporte.
- Para producción, se recomienda usar modelos más modernos y con soporte activo.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive
- Repositorio original de RunwayML (retirado): https://huggingface.co/runwayml/stable-diffusion-v1-5 (enlace referenciado en el README, actualmente no disponible)
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4 (referenciado en la metadata)
